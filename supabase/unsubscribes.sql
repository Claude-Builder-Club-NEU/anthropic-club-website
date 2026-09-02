-- Unsubscribe requests.
--
-- Run this in the Supabase SQL editor. It shares the project with attendance
-- and polls and deliberately shares nothing else: no foreign key to checkins,
-- no join back to a stamp card. Somebody leaving the mailing list is not a fact
-- about their attendance and must not become one.
--
-- WHY THIS EXISTS
--
-- The unsubscribe page first shipped posting to Web3Forms, which emails the
-- club inbox. That turned out to deliver into an inbox nobody was reading, so
-- requests were accepted and then invisible. A table in a project the board can
-- log into removes the dependency on anyone's email working at all: the data
-- lands somewhere the club owns and can query.
--
-- THE THREE RULES THIS FILE ENFORCES
--
--   1. NO ORACLE. request_unsubscribe() returns exactly the same answer whether
--      or not the address was on the list. If it said "you were not
--      subscribed", the page would become a free "is this person a member"
--      checker for anyone holding the URL. Easy to undo by accident while
--      making an error message friendlier; do not.
--
--   2. NO READER. Nothing granted to anon returns a row, a count, or an
--      existence check. The queue is readable only from the dashboard with a
--      real login. The anon key ships in the client bundle, so a list of people
--      leaving the club is exactly what it must not be able to page through.
--
--   3. RLS ON, NO POLICY. Same posture as schema.sql. With row-level security
--      enabled and zero policies, anon can do nothing to this table directly,
--      and the one SECURITY DEFINER function below is the entire public API.
--
-- ANY ADDRESS IS ACCEPTED, on purpose. Attendance restricts to Northeastern
-- domains because a stamp card is a membership artefact. An unsubscribe is the
-- opposite: refusing one because the address looks unfamiliar leaves somebody
-- receiving mail they asked to stop.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

-- One row per address that has asked to be removed.
--
-- `handled_at` is what makes this a work queue rather than a pile. An officer
-- removes the address from the mailing list and stamps the row, so the open
-- work is always `where handled_at is null`, and a processed request stays as
-- evidence the club honoured it.
create table if not exists public.unsubscribes (
  id         uuid        primary key default gen_random_uuid(),
  email      citext      not null,
  -- Rounded to the hour, matching polls.sql. Nobody needs the second at which
  -- somebody left, and a precise timestamp beside a send is a fingerprint.
  created_at timestamptz not null default date_trunc('hour', now()),
  handled_at timestamptz
);

-- A second click, a forwarded newsletter or an impatient double tap must not
-- create a second row. citext means Someone@ and someone@ are one address.
create unique index if not exists unsubscribes_email_key
  on public.unsubscribes (email);

create index if not exists unsubscribes_open_idx
  on public.unsubscribes (created_at)
  where handled_at is null;

-- ---------------------------------------------------------------------------
-- Row-level security: deny by default, and never grant.
-- ---------------------------------------------------------------------------

alter table public.unsubscribes enable row level security;

-- No CREATE POLICY statements, and that absence IS the security model.
revoke all on public.unsubscribes from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public API: the only thing the browser may call.
--
-- Returns { ok: true } for anything that looks like an address and
-- { ok: false, reason: 'email_invalid' } for anything that does not. Those are
-- the only two answers. There is deliberately no third for "that address was
-- not on the list", and there must never be one: see rule 1.
-- ---------------------------------------------------------------------------

create or replace function public.request_unsubscribe(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_email citext;
begin
  v_email := lower(btrim(coalesce(p_email, '')))::citext;

  -- A syntax check, not a deliverability check: the point is to reject a paste
  -- accident, not to police addresses. Capped at the RFC 5321 maximum so the
  -- column cannot be used as free storage.
  if length(v_email) > 254
     or v_email !~ '^[^@[:space:]]+@[^@[:space:].]+(\.[^@[:space:].]+)+$' then
    return jsonb_build_object('ok', false, 'reason', 'email_invalid');
  end if;

  insert into public.unsubscribes (email)
  values (v_email)
  on conflict (email) do nothing;

  -- Note what is NOT here: no report of whether the insert happened, no count,
  -- no lookup against any other table. One answer, always the same.
  return jsonb_build_object('ok', true);
end;
$fn$;

grant execute on function public.request_unsubscribe(text) to anon;

-- ---------------------------------------------------------------------------
-- Officer queries. Run these in the SQL editor while logged in. They are NOT
-- granted to anon and are not reachable from the site.
--
--   -- everything still open, newest first
--   select email, created_at from public.unsubscribes
--   where handled_at is null order by created_at desc;
--
--   -- one paste-able list to work through
--   select string_agg(email::text, E'\n' order by created_at)
--   from public.unsubscribes where handled_at is null;
--
--   -- after removing an address from the mailing list
--   update public.unsubscribes set handled_at = now()
--   where email = 'someone@example.com';
-- ---------------------------------------------------------------------------
