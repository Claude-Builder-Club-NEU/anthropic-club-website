-- Attendance: schema, row-level security, and the two functions the site calls.
--
-- WHY THIS FILE LOOKS LIKE THIS
--
-- Until now the site had no write path from the public internet, and that was
-- the whole of its security posture (see SECURITY.md). Attendance needs one, so
-- the design goal is to reopen as little as possible:
--
--   1. Row-level security is ON for both tables and NO policy grants the anon
--      role anything. A leaked anon key therefore reads nothing and writes
--      nothing directly. This is the most important decision in the file.
--
--   2. Everything the browser can do goes through two SECURITY DEFINER
--      functions below. They are the entire public API. A function is a far
--      smaller thing to reason about than a table with policies, and it puts
--      the room-code check somewhere the browser cannot skip it.
--
--   3. check_in() returns only the caller's own card. There is deliberately no
--      way to ask this schema "who else came". The anon key is public by
--      construction, since it ships in the client bundle, and a roster is
--      exactly the thing a stranger holding that key must not be able to read.
--
-- The officer roster view (mockup 2B) is NOT in this file. It reads other
-- people's rows, so it needs a real authenticated role; shipping it behind the
-- same anon key would undo point 3. It is the next piece of work.

create extension if not exists "pgcrypto";  -- gen_random_uuid()
create extension if not exists "citext";    -- case-insensitive email column

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per club session that can be checked in to.
--
-- `code` and `code_expires_at` are what stop a code being texted to someone who
-- did not come: the spec calls for a code that rotates every session and dies
-- shortly after the start. `slot` is the position on the stamp card, so an
-- empty slot can still show its scheduled date, which is what the mockup draws
-- under the unfilled circles.
create table if not exists public.sessions (
  id              uuid primary key default gen_random_uuid(),
  term            text        not null,
  slot            smallint    not null check (slot between 1 and 12),
  title           text        not null,
  starts_at       timestamptz not null,
  room            text,
  code            text        not null,
  code_expires_at timestamptz not null,
  created_at      timestamptz not null default now(),
  unique (term, slot)
);

-- Codes are compared case-insensitively, so uniqueness has to be too. Otherwise
-- two live sessions could hold "4K9P2M" and "4k9p2m" and the lookup would be
-- ambiguous exactly when it matters.
create unique index if not exists sessions_code_key
  on public.sessions (upper(code));

create index if not exists sessions_term_starts_idx
  on public.sessions (term, starts_at);

-- One row per person per session. The email IS the identity: no account, no
-- password, per the spec. citext means Rodriguez.M@ and rodriguez.m@ are one
-- value to the unique index, rather than two people holding half a card each.
create table if not exists public.checkins (
  id           uuid        primary key default gen_random_uuid(),
  session_id   uuid        not null references public.sessions (id) on delete cascade,
  email        citext      not null,
  name         text        not null,
  source       text        not null default 'code'
                 check (source in ('code', 'officer', 'link')),
  is_guest     boolean     not null default false,
  created_at   timestamptz not null default now(),
  confirmed_at timestamptz
);

-- "One stamp per session": a second submission adds nothing. Enforced here
-- rather than in application code, because the browser is not a place to
-- enforce anything.
create unique index if not exists checkins_session_email_key
  on public.checkins (session_id, email);

create index if not exists checkins_email_idx on public.checkins (email);

-- ---------------------------------------------------------------------------
-- Row-level security: deny by default, and never grant.
-- ---------------------------------------------------------------------------

alter table public.sessions enable row level security;
alter table public.checkins enable row level security;

-- There are no CREATE POLICY statements, and that absence IS the security
-- model. With RLS enabled and zero policies, anon can do nothing to these
-- tables directly. Access is only ever through the functions below, which run
-- as their owner and so bypass RLS in one controlled, reviewable place.
--
-- If you ever add a policy here, re-read point 3 at the top of this file first.

revoke all on public.sessions from anon, authenticated;
revoke all on public.checkins from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Domain rules
-- ---------------------------------------------------------------------------

-- Which addresses earn a stamp card.
--
-- northeastern.edu and husky.neu.edu are both real student addresses, and the
-- pitch form already accepts both plus neu.edu (see NEU_EMAIL in
-- WorkshopForm.jsx). Accepting only the first would let a husky student pitch a
-- workshop but not collect a stamp for attending one.
--
-- OPEN QUESTION from the spec, deliberately NOT decided here: whether
-- maya@northeastern.edu and maya@husky.neu.edu are the same person. Today they
-- are two cards. Merging them is an officer action on the roster view, which is
-- the right place for a judgement call about identity.
create or replace function public.is_member_email(p_email citext)
returns boolean
language sql
immutable
as $fn$
  select p_email ~* '^[^@[:space:]]+@(northeastern\.edu|husky\.neu\.edu|neu\.edu)$';
$fn$;

-- ---------------------------------------------------------------------------
-- Public API, function 1: what session is the room in right now?
--
-- Returns the meta the check-in screen prints in its eyebrow, and NEVER the
-- code. The screen asks the student to read the code off the wall; returning it
-- here would defeat the point of having one.
-- ---------------------------------------------------------------------------

create or replace function public.current_session()
returns jsonb
language sql
security definer
set search_path = public
stable
as $fn$
  select case when s.id is null then null else jsonb_build_object(
    'id',        s.id,
    'term',      s.term,
    'slot',      s.slot,
    'title',     s.title,
    'starts_at', s.starts_at,
    'room',      s.room
  ) end
  from (
    select *
    from public.sessions
    where code_expires_at > now()
    order by starts_at
    limit 1
  ) s;
$fn$;

-- ---------------------------------------------------------------------------
-- Public API, function 2: check in, and hand the card back.
--
-- One round trip does both the write and the read the confirmation screen
-- needs, so the stamped screen cannot render before the row is durable.
--
-- Expected failures come back as { ok: false, reason }, not as exceptions.
-- "That code has expired" is something to render calmly on screen next to the
-- field that caused it. Genuinely unexpected failures still raise.
-- ---------------------------------------------------------------------------

create or replace function public.check_in(
  p_code  text,
  p_name  text,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_email   citext;
  v_name    text;
  v_session public.sessions%rowtype;
  v_card    jsonb;
begin
  -- Normalise on write, per the spec: lowercase and trim, so a trailing space
  -- or a capitalised address is the same person rather than a second card.
  v_email := lower(btrim(coalesce(p_email, '')))::citext;
  v_name  := btrim(coalesce(p_name, ''));

  if v_name = '' then
    return jsonb_build_object('ok', false, 'reason', 'name_required');
  end if;

  if not public.is_member_email(v_email) then
    return jsonb_build_object('ok', false, 'reason', 'email_domain');
  end if;

  -- Case-insensitive and whitespace-tolerant: the code is read off a wall and
  -- typed by someone standing up, and "4k9p2m " should not be a failure.
  select * into v_session
  from public.sessions
  where upper(code) = upper(btrim(coalesce(p_code, '')))
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'code_invalid');
  end if;

  if v_session.code_expires_at <= now() then
    return jsonb_build_object('ok', false, 'reason', 'code_expired');
  end if;

  -- One stamp per session. A repeat submission changes nothing but still
  -- returns the card, so double-tapping the button reads as success rather
  -- than as an error the student cannot act on.
  insert into public.checkins (session_id, email, name, source)
  values (v_session.id, v_email, v_name, 'code')
  on conflict (session_id, email) do nothing;

  -- The card: every session in the term, with the ones this address attended
  -- marked. Built from sessions rather than from checkins so that empty slots
  -- still carry their number and scheduled date, which is what the mockup
  -- draws under the unfilled circles.
  select jsonb_agg(
           jsonb_build_object(
             'slot',       s.slot,
             'title',      s.title,
             'starts_at',  s.starts_at,
             'stamped',    c.id is not null,
             'stamped_at', c.created_at
           )
           order by s.slot
         )
    into v_card
  from public.sessions s
  left join public.checkins c
         on c.session_id = s.id
        and c.email = v_email
  where s.term = v_session.term;

  return jsonb_build_object(
    'ok',    true,
    'email', v_email,
    'name',  v_name,
    'session', jsonb_build_object(
      'id',        v_session.id,
      'title',     v_session.title,
      'starts_at', v_session.starts_at,
      'slot',      v_session.slot,
      'term',      v_session.term,
      'room',      v_session.room
    ),
    'card', coalesce(v_card, '[]'::jsonb)
  );
end;
$fn$;

-- The browser may call these two and nothing else.
grant execute on function public.current_session() to anon;
grant execute on function public.check_in(text, text, text) to anon;
