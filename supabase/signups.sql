-- Interest signups: the club's front door, stored in a table the board owns.
--
-- Run this in the Supabase SQL editor. It shares the project with attendance,
-- polls and unsubscribes, and deliberately shares nothing else.
--
-- WHY THIS EXISTS
--
-- The interest form was a Typeform (RH9sxEqE) for the club's first term. Moving
-- it onto the site is what this table is for. Everything the Typeform collected
-- is collected here, plus two questions it never asked, and the answers land in
-- a project the board can log into rather than in a third-party dashboard whose
-- free tier caps responses and whose export is a manual download.
--
-- THE FOUR RULES THIS FILE ENFORCES
--
--   1. RLS ON, NO POLICY. Same posture as schema.sql, polls.sql and
--      unsubscribes.sql. With row-level security enabled and zero policies,
--      anon can do nothing to this table directly. submit_signup() below is the
--      entire public API.
--
--   2. NO READER, and it matters more here than anywhere else in this project.
--      This table is a roster: names and email addresses of everyone who ever
--      showed interest. The anon key ships in the client bundle and is readable
--      by anyone who views source (src/lib/supabase.js explains why that is
--      fine). It is fine ONLY while nothing granted to anon returns a row, a
--      count, or an existence check. Adding one is not a small change; it
--      publishes the roster.
--
--   3. NO ORACLE. submit_signup() answers { ok: true } whether the address was
--      already on file or not. If it reported "you already signed up", anyone
--      holding the public key could test addresses against the membership list
--      one at a time. Same rule as request_unsubscribe(); easy to undo by
--      accident while making a confirmation screen friendlier, so do not.
--
--   4. SHAPE, NOT MEMBERSHIP. The check constraints below bound how long and
--      how many the answers may be. They deliberately do NOT enumerate the
--      valid option keys. See the note above the constraints for why.
--
-- THIS TABLE HOLDS PERSONAL DATA: a name, an email address, a year of study and
-- a college, for anyone who fills in the form. SECURITY.md section 3.3
-- previously named `checkins` as the only such store. It is not any more.

create extension if not exists "pgcrypto";  -- gen_random_uuid()
create extension if not exists "citext";    -- case-insensitive email column

-- ---------------------------------------------------------------------------
-- Which term a signup belongs to.
--
-- A club recruits every term, and the same person signing up again in January
-- is a NEW fact, not a duplicate: they are still interested, and their answers
-- about which days work may have changed with their class schedule. The unique
-- index is therefore on (email, term) and not on email alone.
--
-- The cut is 1 July and 1 January, not the first day of classes. A signup made
-- at Fall Fest in early September and one made in late July are the same
-- recruiting season, and nobody wants to remember to run a migration in August.
--
-- NOT granted to anon. The browser never sends a term; submit_signup() computes
-- it. If the browser could name its own term it could write into last term's
-- roster, which is the kind of thing that is obvious only after someone does it.
-- ---------------------------------------------------------------------------

create or replace function public.signup_term(p_at timestamptz default now())
returns text
language sql
stable
as $fn$
  select case
           when extract(month from p_at at time zone 'America/New_York') >= 7
             then 'fall-'   || extract(year from p_at at time zone 'America/New_York')::int
           else      'spring-' || extract(year from p_at at time zone 'America/New_York')::int
         end;
$fn$;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

-- One row per person per term.
--
-- `class_year` is a single value; `colleges`, `meet_days` and `interests` are
-- arrays, matching the form.
--
-- WHY `colleges` IS PLURAL, when the question reads "What Northeastern college
-- are you in?". Combined majors here routinely span two colleges: Computer
-- Science and Business Administration is Khoury plus D'Amore-McKim, Computer
-- Science and Design is Khoury plus CAMD, and that population is precisely this
-- club's audience. Forcing one pick makes a CS and Business student choose
-- Khoury, and the club loses the one signal the question exists to measure,
-- which is how far outside Khoury it is actually reaching.
--
-- The cost is that a college tally no longer sums to the headcount, because one
-- person can be in two. The officer query below says so where it is computed,
-- rather than leaving somebody to work out why the percentages add up to 118.
--
-- ARRAYS RATHER THAN A JOIN TABLE. A join table is the textbook answer and it
-- is the wrong one here. The board's actual questions are "how many people want
-- hackathons" and "which two days reach the most people", and with arrays those
-- are one-line queries an officer can write in the Supabase SQL editor without
-- knowing what a join is. Postgres answers `'hackathons' = any(interests)` and
-- `meet_days && array['tuesday','thursday']` directly. The cost is that the
-- option keys are not foreign-keyed to anything, which rule 4 above accepts on
-- purpose.
--
-- `added_to_list_at` is what makes this a work queue rather than a pile, the
-- same way `handled_at` does in unsubscribes.sql: an officer adds the address
-- to the mailing list and stamps the row, so the open work is always
-- `where added_to_list_at is null`.
--
-- `submissions` counts how many times this person has submitted THIS term. A
-- resubmission overwrites their answers, so without a counter there would be no
-- trace that they came back and changed their mind.
create table if not exists public.signups (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  email            citext      not null,
  class_year       text        not null,
  colleges         text[]      not null default '{}',
  meet_days        text[]      not null default '{}',
  interests        text[]      not null default '{}',
  term             text        not null,
  -- 'web' is this form. 'typeform' is reserved for importing the CSV exported
  -- from RH9sxEqE, so the old responses and the new ones can live in one table
  -- without pretending they arrived the same way. 'officer' is a row typed in
  -- by hand at a table at Fall Fest.
  source           text        not null default 'web'
                     check (source in ('web', 'typeform', 'officer')),
  submissions      integer     not null default 1,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  added_to_list_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Shape constraints.
--
-- WHY THESE DO NOT ENUMERATE THE OPTIONS.
--
-- The obvious constraint is `check (class_year in ('first','second',...))`, and
-- it is a trap. The option list lives in src/lib/join.js and will change: the
-- club adds an interest, renames a college after the university does, drops a
-- day. With a membership constraint, the day someone edits that file and
-- deploys is the day every submission starts failing with a 500 that looks like
-- a network error, and the fix is a database migration nobody planned.
--
-- So the database bounds the SHAPE and the client owns the MEANING. A value
-- that is a short lowercase token cannot be used to store an essay, cannot
-- carry markup, and cannot be a formula that a spreadsheet will evaluate on
-- export. That is what the table needs to be safe. Whether 'khoury' is a real
-- college is a question the form answers by only offering real ones, and that
-- the officer queries at the foot of this file re-check by listing any value
-- they do not recognise.
-- ---------------------------------------------------------------------------

alter table public.signups drop constraint if exists signups_name_shape;
alter table public.signups add constraint signups_name_shape
  check (length(btrim(name)) between 1 and 120);

-- RFC 5321 caps an address at 254. The pattern is a syntax check, not a
-- deliverability check, and is anchored at BOTH ends: the suffix-only form of
-- this pattern was already found once in this codebase to accept
-- "someone@gmail.com.jordan@northeastern.edu".
alter table public.signups drop constraint if exists signups_email_shape;
alter table public.signups add constraint signups_email_shape
  check (
    length(email) <= 254
    and email ~ '^[^@[:space:]]+@[^@[:space:].]+(\.[^@[:space:].]+)+$'
  );

alter table public.signups drop constraint if exists signups_year_shape;
alter table public.signups add constraint signups_year_shape
  check (class_year ~ '^[a-z0-9_]{1,32}$');

-- The three arrays share one rule, so they share one function rather than three
-- copies of a subquery nobody will keep in step.
--
-- Capped at 16: the form offers twelve colleges, six days and five interests,
-- so 16 is above any honest answer and far below anything worth storing. A NULL
-- or empty array passes here; "at least one" is submit_signup()'s job, because
-- that is a message to a person rather than an invariant of the table.
create or replace function public.signup_tokens_ok(p_vals text[])
returns boolean
language sql
immutable
as $fn$
  select p_vals is null
      or (coalesce(array_length(p_vals, 1), 0) <= 16
          and not exists (
            select 1 from unnest(p_vals) v where v !~ '^[a-z0-9_]{1,32}$'
          ));
$fn$;

alter table public.signups drop constraint if exists signups_colleges_shape;
alter table public.signups add constraint signups_colleges_shape
  check (public.signup_tokens_ok(colleges));

alter table public.signups drop constraint if exists signups_days_shape;
alter table public.signups add constraint signups_days_shape
  check (public.signup_tokens_ok(meet_days));

alter table public.signups drop constraint if exists signups_interests_shape;
alter table public.signups add constraint signups_interests_shape
  check (public.signup_tokens_ok(interests));

alter table public.signups drop constraint if exists signups_term_shape;
alter table public.signups add constraint signups_term_shape
  check (term ~ '^(fall|spring)-[0-9]{4}$');

alter table public.signups drop constraint if exists signups_submissions_positive;
alter table public.signups add constraint signups_submissions_positive
  check (submissions >= 1);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- One person is one row per term. citext means Someone@ and someone@ are one
-- address, so a double tap or a second visit updates rather than duplicating.
create unique index if not exists signups_email_term_key
  on public.signups (email, term);

create index if not exists signups_term_created_idx
  on public.signups (term, created_at desc);

-- The open work queue: addresses not yet added to the mailing list.
create index if not exists signups_pending_idx
  on public.signups (created_at)
  where added_to_list_at is null;

-- ---------------------------------------------------------------------------
-- Row-level security: deny by default, and never grant.
-- ---------------------------------------------------------------------------

alter table public.signups enable row level security;

-- No CREATE POLICY statements, and that absence IS the security model. See
-- rule 2 at the top of this file before adding one.
revoke all on public.signups from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public API: the only thing the browser may call.
--
-- Returns { ok: true } on success and { ok: false, reason } for an answer the
-- table will not take. The reasons are the ones the form can render next to the
-- field that caused them; anything genuinely unexpected still raises.
--
-- There is deliberately no reason for "you already signed up", and there must
-- never be one. See rule 3.
-- ---------------------------------------------------------------------------

create or replace function public.submit_signup(
  p_name       text,
  p_email      text,
  p_class_year text,
  p_colleges   text[],
  p_meet_days  text[],
  p_interests  text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_name  text;
  v_email citext;
  v_year  text;
  v_cols  text[];
  v_days  text[];
  v_ints  text[];
  v_term  text;
begin
  -- Normalise on write, the same way check_in() does: trim the name, lowercase
  -- and trim the address, so one person is one row rather than two halves.
  v_name  := btrim(coalesce(p_name, ''));
  v_email := lower(btrim(coalesce(p_email, '')))::citext;
  v_year  := lower(btrim(coalesce(p_class_year, '')));

  if v_name = '' or length(v_name) > 120 then
    return jsonb_build_object('ok', false, 'reason', 'name_required');
  end if;

  -- A name that begins with =, +, - or @ is read as a formula by Excel and
  -- Google Sheets when the roster is exported to CSV. Refused here rather than
  -- escaped on export, because the export is a button in the Supabase table
  -- editor that nobody controls.
  if left(v_name, 1) in ('=', '+', '-', '@') then
    return jsonb_build_object('ok', false, 'reason', 'name_invalid');
  end if;

  -- Shape first, then policy. The table's own constraint already bounds the
  -- shape; this repeats it so the caller gets a reason rather than an exception.
  if length(v_email) > 254
     or v_email !~ '^[^@[:space:]]+@[^@[:space:].]+(\.[^@[:space:].]+)+$' then
    return jsonb_build_object('ok', false, 'reason', 'email_invalid');
  end if;

  -- A Northeastern address, same rule as attendance, and the domain list lives
  -- in exactly one place: is_member_email() in schema.sql, which accepts
  -- northeastern.edu, husky.neu.edu and neu.edu. RUN schema.sql FIRST or this
  -- function does not exist and every submission raises.
  --
  -- WHY THE POLICY IS HERE AND NOT IN A CHECK CONSTRAINT. The table constraint
  -- above bounds SHAPE, which is an invariant: no row should ever hold
  -- something that is not an address. Which domains the club accepts is
  -- POLICY, and policy changes. If the board decides next year to take
  -- admitted students on personal addresses, that is an edit to this function
  -- and a redeploy of nothing, rather than a migration against a table with a
  -- year of rows in it that would now violate their own constraint.
  --
  -- This is deliberately the opposite call from unsubscribes.sql, which takes
  -- any address at all. Refusing an unsubscribe because the address looks
  -- unfamiliar leaves somebody receiving mail they asked to stop; refusing a
  -- signup from a stranger's gmail costs the club nothing it wanted.
  if not public.is_member_email(v_email) then
    return jsonb_build_object('ok', false, 'reason', 'email_domain');
  end if;

  if v_year !~ '^[a-z0-9_]{1,32}$' then
    return jsonb_build_object('ok', false, 'reason', 'year_required');
  end if;

  -- Drop anything that is not a plain token, de-duplicate, and cap the length.
  -- The browser is not a place to enforce anything, so whatever it sent is
  -- filtered rather than trusted. A garbage value is dropped silently instead
  -- of failing the whole submission: losing one checkbox is better than losing
  -- the signup.
  select coalesce(array_agg(distinct lower(btrim(v))), '{}')
    into v_cols
  from unnest(coalesce(p_colleges, '{}')) v
  where lower(btrim(v)) ~ '^[a-z0-9_]{1,32}$';

  select coalesce(array_agg(distinct lower(btrim(v))), '{}')
    into v_days
  from unnest(coalesce(p_meet_days, '{}')) v
  where lower(btrim(v)) ~ '^[a-z0-9_]{1,32}$';

  select coalesce(array_agg(distinct lower(btrim(v))), '{}')
    into v_ints
  from unnest(coalesce(p_interests, '{}')) v
  where lower(btrim(v)) ~ '^[a-z0-9_]{1,32}$';

  if array_length(v_cols, 1) is null then
    return jsonb_build_object('ok', false, 'reason', 'college_required');
  end if;

  if array_length(v_days, 1) is null then
    return jsonb_build_object('ok', false, 'reason', 'days_required');
  end if;

  if array_length(v_ints, 1) is null then
    return jsonb_build_object('ok', false, 'reason', 'interests_required');
  end if;

  if not (public.signup_tokens_ok(v_cols)
          and public.signup_tokens_ok(v_days)
          and public.signup_tokens_ok(v_ints)) then
    return jsonb_build_object('ok', false, 'reason', 'too_many');
  end if;

  v_term := public.signup_term();

  -- Upsert. A second submission this term replaces the answers and counts up,
  -- rather than adding a row: the person changed their mind, they did not
  -- become two people. created_at keeps the FIRST time they signed up, which is
  -- the date the board actually cares about.
  --
  -- added_to_list_at is deliberately NOT reset. Someone editing their answers
  -- does not need adding to the mailing list a second time.
  insert into public.signups
    (name, email, class_year, colleges, meet_days, interests, term)
  values
    (v_name, v_email, v_year, v_cols, v_days, v_ints, v_term)
  on conflict (email, term) do update
    set name        = excluded.name,
        class_year  = excluded.class_year,
        colleges    = excluded.colleges,
        meet_days   = excluded.meet_days,
        interests   = excluded.interests,
        submissions = public.signups.submissions + 1,
        updated_at  = now();

  -- Note what is NOT here: no id, no count, no report of whether this was an
  -- insert or an update. One answer, always the same. See rule 3.
  return jsonb_build_object('ok', true);
end;
$fn$;

-- ---------------------------------------------------------------------------
-- Grants. signup_term() is a helper and stays private; only the submit is
-- reachable from the browser.
--
-- `from public` as well as `from anon`: Postgres grants EXECUTE on a new
-- function to the PUBLIC role by default, so revoking from anon alone leaves it
-- callable through the role anon inherits.
-- ---------------------------------------------------------------------------

revoke execute on function public.signup_term(timestamptz) from public, anon, authenticated;
revoke execute on function public.signup_tokens_ok(text[]) from public, anon, authenticated;
revoke execute on function
  public.submit_signup(text, text, text, text[], text[], text[]) from public;

grant execute on function
  public.submit_signup(text, text, text, text[], text[], text[]) to anon;

-- ---------------------------------------------------------------------------
-- Officer queries. Run these in the SQL editor while logged in. None is granted
-- to anon and none is reachable from the site. The Supabase table editor will
-- export any result as CSV.
--
-- public.signup_term() with no argument means "this term", so most of these can
-- be run unchanged in February.
--
--
-- THE MAILING LIST, which is what this table is for
--
--   -- Everyone not yet added, MINUS anyone who has asked to be removed.
--   --
--   -- The `not exists` is the whole point of this query and must not be
--   -- dropped for being slow. public.unsubscribes exists so that a person who
--   -- asks to leave stays gone; a signup row is not consent to be re-added,
--   -- and someone who signed up in September and unsubscribed in October would
--   -- otherwise be handed straight back to the next person doing an export.
--   select s.email, s.name
--   from public.signups s
--   where s.added_to_list_at is null
--     and not exists (
--       select 1 from public.unsubscribes u where u.email = s.email
--     )
--   order by s.created_at;
--
--   -- The same list as one paste-able block.
--   select string_agg(s.email::text, E'\n' order by s.created_at)
--   from public.signups s
--   where s.added_to_list_at is null
--     and not exists (
--       select 1 from public.unsubscribes u where u.email = s.email
--     );
--
--   -- Stamp them once they really are in the list. Run this in the same
--   -- sitting as the query above, or somebody who signed up in between gets
--   -- marked as added without being added.
--   update public.signups
--   set added_to_list_at = now()
--   where added_to_list_at is null
--     and not exists (
--       select 1 from public.unsubscribes u where u.email = public.signups.email
--     );
--
--
-- THE ROSTER
--
--   -- Everyone who signed up this term, newest first.
--   select name, email, class_year, colleges, meet_days, interests, created_at
--   from public.signups
--   where term = public.signup_term()
--   order by created_at desc;
--
--   -- Headcount by term, and how many are on a Northeastern address.
--   -- is_member_email() lives in schema.sql; run that file first if this errors.
--   select term,
--          count(*) as signups,
--          count(*) filter (where public.is_member_email(email)) as northeastern
--   from public.signups
--   group by term
--   order by term desc;
--
--   -- Anything on a non-Northeastern address. submit_signup() refuses those,
--   -- so a row here means it arrived by another route: a hand-typed
--   -- source = 'officer' row, or the imported Typeform CSV, which had no
--   -- domain rule at all. Worth a look before a mailout.
--   select name, email, source, created_at
--   from public.signups
--   where not public.is_member_email(email)
--   order by created_at desc;
--
--
-- WHAT TO PUT ON THE CALENDAR
--
--   -- "How many people want hackathons?"  One number.
--   select count(*)
--   from public.signups
--   where term = public.signup_term() and 'hackathons' = any(interests);
--
--   -- The whole interest tally, most wanted first. Any key the form is no
--   -- longer offering shows up here as an unfamiliar row rather than being
--   -- silently dropped, which is the trade rule 4 makes.
--   select v as interest, count(*) as people
--   from public.signups, unnest(interests) as v
--   where term = public.signup_term()
--   group by v
--   order by people desc;
--
--   -- Which day to meet on.
--   select v as day, count(*) as people
--   from public.signups, unnest(meet_days) as v
--   where term = public.signup_term()
--   group by v
--   order by people desc;
--
--   -- The pair of days that reaches the most people. Worth running before
--   -- picking a slot: the top two days individually are usually NOT the pair
--   -- that reaches the most people, because the same students pick both.
--   select count(*)
--   from public.signups
--   where term = public.signup_term()
--     and meet_days && array['tuesday', 'thursday'];
--
--
-- WHO IS IN THE ROOM
--
--   -- The college split. THE PERCENTAGES DO NOT SUM TO 100 AND THAT IS NOT A
--   -- BUG: colleges is an array, a combined major is in two, and the divisor
--   -- below is the headcount rather than the number of picks. Read it as
--   -- "what share of members this college reaches", not as a partition.
--   select v as college,
--          count(*) as people,
--          round(100.0 * count(*) / (select count(*) from public.signups
--                                    where term = public.signup_term()), 1) as pct_of_members
--   from public.signups, unnest(colleges) as v
--   where term = public.signup_term()
--   group by v
--   order by people desc;
--
--   -- The year split.
--   select class_year, count(*) as people
--   from public.signups
--   where term = public.signup_term()
--   group by class_year
--   order by people desc;
--
--
-- ACROSS TERMS, which is why the term column exists
--
--   -- Last term's people who have not signed up again: the re-engagement list.
--   select s.name, s.email
--   from public.signups s
--   where s.term = 'fall-2026'
--     and not exists (
--       select 1 from public.signups t
--       where t.email = s.email and t.term = 'spring-2027'
--     )
--   order by s.name;
--
--   -- Who changed their answers this term. The row shows the later ones.
--   select name, email, submissions, created_at, updated_at
--   from public.signups
--   where submissions > 1
--   order by updated_at desc;
--
--
-- IF THE FORM IS EVER FLOODED
--
-- Nothing rate limits submit_signup(). The unique index means one address is
-- one row per term, so a flood needs a fresh address per row, but that is not a
-- limit. Same residual risk SECURITY.md records for cast_ballot(), and
-- acceptable for the same reason: a signup allocates nothing scarce. LOOK at
-- the rows before deleting any of them.
--
--   select created_at, name, email, source
--   from public.signups
--   where created_at > now() - interval '1 hour'
--   order by created_at;
-- ---------------------------------------------------------------------------
