-- NYC campus interest signups. A separate list from public.signups.
--
-- Run this in the Supabase SQL editor, once, AFTER signups.sql (it reuses
-- public.signup_tokens_ok from that file). It does not touch public.signups or
-- submit_signup(), so the Boston interest form on /join keeps working exactly
-- as it did.
--
-- WHY A SEPARATE TABLE. The club is opening an NYC campus branch and wants its
-- own interest list. The questions are different (major and preferred interest
-- meeting month instead of year, college and interests), and the people are
-- not necessarily on a Northeastern Boston address, so mixing them into
-- public.signups would mean loosening that table's rules for everyone.
--
-- SAME FOUR RULES AS signups.sql, for the same reasons (read that file's
-- header for the long version):
--
--   1. RLS on, no policy. submit_nyc_signup() is the whole public API.
--   2. No reader. Nothing granted to anon returns a row, a count or an
--      existence check. Read the list from the Supabase table editor.
--   3. No oracle. The function answers { ok: true } whether or not the address
--      was already on file.
--   4. Shape, not membership. Constraints bound lengths and token shape; the
--      option keys themselves live in src/lib/nycJoin.js.
--
-- ONE DELIBERATE DIFFERENCE: ANY EMAIL ADDRESS IS ACCEPTED. The NYC form spec
-- asks for an email with plain email validation, not a Northeastern one. If
-- the board later wants to restrict it, add an is_member_email() check inside
-- submit_nyc_signup(), the same way submit_signup() does.

create extension if not exists "pgcrypto";
create extension if not exists "citext";


create table if not exists public.nyc_signups (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null,
  email          citext      not null unique,
  major          text        not null,
  meeting_month  text        not null,
  meet_days      text[]      not null default '{}',
  submissions    integer     not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  added_to_list_at timestamptz
);

alter table public.nyc_signups drop constraint if exists nyc_signups_name_shape;
alter table public.nyc_signups add constraint nyc_signups_name_shape
  check (length(btrim(name)) between 1 and 120);

alter table public.nyc_signups drop constraint if exists nyc_signups_email_shape;
alter table public.nyc_signups add constraint nyc_signups_email_shape
  check (
    length(email) <= 254
    and email ~ '^[^@[:space:]]+@[^@[:space:].]+(\.[^@[:space:].]+)+$'
  );

alter table public.nyc_signups drop constraint if exists nyc_signups_major_shape;
alter table public.nyc_signups add constraint nyc_signups_major_shape
  check (major ~ '^[a-z0-9_]{1,32}$');

alter table public.nyc_signups drop constraint if exists nyc_signups_month_shape;
alter table public.nyc_signups add constraint nyc_signups_month_shape
  check (meeting_month ~ '^[a-z0-9_]{1,32}$');

alter table public.nyc_signups drop constraint if exists nyc_signups_days_shape;
alter table public.nyc_signups add constraint nyc_signups_days_shape
  check (public.signup_tokens_ok(meet_days));

create index if not exists nyc_signups_created_idx
  on public.nyc_signups (created_at desc);

alter table public.nyc_signups enable row level security;
revoke all on public.nyc_signups from anon, authenticated;


create or replace function public.submit_nyc_signup(
  p_name          text,
  p_email         text,
  p_major         text,
  p_meeting_month text,
  p_meet_days     text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_name  text;
  v_email citext;
  v_major text;
  v_month text;
  v_days  text[];
begin
  v_name  := btrim(coalesce(p_name, ''));
  v_email := lower(btrim(coalesce(p_email, '')))::citext;
  v_major := lower(btrim(coalesce(p_major, '')));
  v_month := lower(btrim(coalesce(p_meeting_month, '')));

  if v_name = '' or length(v_name) > 120 then
    return jsonb_build_object('ok', false, 'reason', 'name_required');
  end if;

  -- Spreadsheet formula injection on CSV export; see signups.sql.
  if left(v_name, 1) in ('=', '+', '-', '@') then
    return jsonb_build_object('ok', false, 'reason', 'name_invalid');
  end if;

  if length(v_email) > 254
     or v_email !~ '^[^@[:space:]]+@[^@[:space:].]+(\.[^@[:space:].]+)+$' then
    return jsonb_build_object('ok', false, 'reason', 'email_invalid');
  end if;

  if v_major !~ '^[a-z0-9_]{1,32}$' then
    return jsonb_build_object('ok', false, 'reason', 'major_required');
  end if;

  if v_month !~ '^[a-z0-9_]{1,32}$' then
    return jsonb_build_object('ok', false, 'reason', 'month_required');
  end if;

  select coalesce(array_agg(distinct lower(btrim(v))), '{}')
    into v_days
  from unnest(coalesce(p_meet_days, '{}')) v
  where lower(btrim(v)) ~ '^[a-z0-9_]{1,32}$';

  if array_length(v_days, 1) is null then
    return jsonb_build_object('ok', false, 'reason', 'days_required');
  end if;

  if not public.signup_tokens_ok(v_days) then
    return jsonb_build_object('ok', false, 'reason', 'too_many');
  end if;

  insert into public.nyc_signups (name, email, major, meeting_month, meet_days)
  values (v_name, v_email, v_major, v_month, v_days)
  on conflict (email) do update
    set name          = excluded.name,
        major         = excluded.major,
        meeting_month = excluded.meeting_month,
        meet_days     = excluded.meet_days,
        submissions   = public.nyc_signups.submissions + 1,
        updated_at    = now();

  return jsonb_build_object('ok', true);
end;
$fn$;

revoke execute on function
  public.submit_nyc_signup(text, text, text, text, text[]) from public;
grant execute on function
  public.submit_nyc_signup(text, text, text, text, text[]) to anon;
