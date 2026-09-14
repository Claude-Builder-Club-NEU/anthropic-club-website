-- Feature requests: members asking to be interviewed for the blog, or to have
-- something they built written up in it, stored in a table the board owns.
--
-- Run this in the Supabase SQL editor. RUN schema.sql FIRST: the function below
-- calls public.is_member_email(), which lives there, and without it every
-- submission raises instead of returning a reason. Nothing in the repository
-- runs migrations; this file is applied by a person, once, by hand.
--
-- It shares the project with attendance, polls, unsubscribes and signups, and
-- deliberately shares nothing else. There is no foreign key to public.signups.
-- Somebody volunteering to be interviewed is not a fact about their signup and
-- must not become one, and joining the two would mean this table could only
-- accept people who had already filled in a different form.
--
-- WHY THIS EXISTS
--
-- The blog publishes interviews with members and write-ups of what members
-- build. Until now both started with a board member remembering to ask somebody
-- in Slack, which reliably produces a blog about the six people the board
-- already knows. This table is the other door.
--
-- THE FOUR RULES THIS FILE ENFORCES
--
--   1. RLS ON, NO POLICY. Same posture as schema.sql, polls.sql,
--      unsubscribes.sql and signups.sql. With row-level security enabled and
--      zero policies, anon can do nothing to this table directly.
--      submit_feature() below is the entire public API.
--
--   2. NO READER. Nothing granted to anon returns a row, a count, or an
--      existence check. The anon key ships in the client bundle and is readable
--      by anyone who views source (src/lib/supabase.js explains why that is
--      fine). It is fine ONLY while that stays true. This table holds a name, a
--      Northeastern email address and a paragraph somebody wrote about their own
--      work; a reader over it is a published list of who in the club is putting
--      their hand up, and what they are proud of.
--
--   3. NO ORACLE. submit_feature() answers { ok: true } whether the application
--      was new or a repeat, and never says which. If it reported "you already
--      applied", anyone holding the public key could test addresses against the
--      club one at a time. Same rule as request_unsubscribe() and
--      submit_signup(). It is easy to undo by accident while making a
--      confirmation screen friendlier, so do not.
--
--   4. SHAPE, NOT MEMBERSHIP, for anything the browser chose. The check
--      constraints below bound how long and how many the answers may be. They
--      deliberately do NOT enumerate the valid option keys, for the reason
--      signups.sql sets out at length as its own rule 4: the option list lives
--      in src/lib/feature.js and will change, and a membership constraint turns
--      the day somebody edits that file into the day every submission fails with
--      a 500 that looks like a network error.
--
--      The two columns that DO enumerate their values, `source` and `outcome`,
--      are written by an officer in the SQL editor and never by the browser, so
--      the trade that rule makes does not apply to them.
--
-- THIS TABLE HOLDS PERSONAL DATA: a name, an email address, and free text an
-- identifiable student wrote about themselves. SECURITY.md section 3.3 names
-- `checkins` and `signups` as the personal data stores. It is now three.

create extension if not exists "pgcrypto";  -- gen_random_uuid()
create extension if not exists "citext";    -- case-insensitive email column

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

-- One row per application.
--
-- NO TERM COLUMN, unlike signups. A signup is a recruiting fact that resets
-- every September, which is why that table keys on (email, term). An
-- application is a work item: it is answered once and then it is done, and
-- created_at is the only time anybody asks about. Adding a term here would also
-- make this file depend on public.signup_term() in signups.sql, for a grouping
-- the board can get from date_trunc when it wants it.
--
-- `kind` is a single value; `reach` is an array, matching the form. `link` is
-- nullable because the form makes it optional: a private repository, a class
-- assignment or a thing that only runs on the author's laptop are all real
-- answers, and requiring a URL would filter out the first-time builders the
-- blog is trying to find.
--
-- `pitch` is the only free-text column on this site that a stranger can fill,
-- and it is capped at 600 characters below for that reason as much as for
-- editorial ones.
--
-- `pitch_key` is a digest of the normalised pitch and exists purely so the
-- unique index can be (email, pitch_key). See the note above that index; it is
-- the whole of the duplicate story here. GENERATED ALWAYS means it cannot drift
-- from the pitch it summarises, which a column filled in by the function could.
--
-- `decided_at` is what makes this a work queue rather than a pile, the same way
-- `handled_at` does in unsubscribes.sql and `added_to_list_at` does in
-- signups.sql: the open work is always `where decided_at is null`.
--
-- `outcome` is the other half of a decision, and one stamp cannot hold it: "we
-- looked at this" and "we said yes" are different facts, and a queue that
-- records only the first loses the answer as soon as it is given.
--
-- `submissions` counts how many times this person has sent THIS pitch. A repeat
-- overwrites their answers, so without a counter there would be no trace that
-- they came back and rewrote it.
create table if not exists public.feature_requests (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       citext      not null,
  kind        text        not null,
  pitch       text        not null,
  pitch_key   text        generated always as (md5(lower(btrim(pitch)))) stored,
  link        text,
  reach       text[]      not null default '{}',
  -- 'web' is this form. 'officer' is a row typed in by hand after somebody
  -- volunteered out loud at a meeting, which is how most of the first ones will
  -- arrive.
  source      text        not null default 'web'
                check (source in ('web', 'officer')),
  submissions integer     not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  decided_at  timestamptz,
  outcome     text        check (outcome in ('scheduled', 'published', 'declined'))
);

-- ---------------------------------------------------------------------------
-- Shape constraints.
--
-- Every one of these is also checked in src/lib/feature.js, and the duplication
-- is the point: that copy exists to say something useful before a round trip,
-- and this one exists because the browser is not a place to enforce anything.
-- Where they disagree, this file is right.
-- ---------------------------------------------------------------------------

-- Length, and the CSV guard in the same constraint because they are one rule
-- about one column.
--
-- A name that begins with =, +, - or @ is evaluated as a formula by Excel and
-- Google Sheets the moment the board exports this table to CSV from the
-- Supabase table editor. Refused on the way in rather than escaped on the way
-- out, because the export is a button nobody controls. signups.sql applies the
-- same guard inside submit_signup(); it is a table constraint here as well, so
-- that a row typed in by an officer cannot carry one either.
--
-- THE TEST IS A REGEX, NOT left(btrim(name), 1), AND THAT IS THE WHOLE POINT.
-- Postgres btrim() with one argument strips SPACES ONLY, not whitespace, so
-- signups.sql's left(btrim(name), 1) form is walked straight past by a name
-- beginning with a tab or a carriage return: the first character is then the
-- tab, the test sees no formula, and "\t=cmd|'/c calc'!A1" is stored intact for
-- the next officer who exports the table. '^[[:space:]]*[=+@-]' matches the
-- formula character after ANY run of leading whitespace, which is what the
-- guard was always meant to say.
--
-- The hyphen is last inside the bracket expression deliberately: anywhere else
-- it reads as a range and the class silently stops meaning what it says.
--
-- signups.sql carries the older form and has the same hole. It is left alone
-- here because that function is deployed and this file must not silently
-- rewrite it; fixing it is a one-line change to line 287 whenever the club next
-- runs that file.
alter table public.feature_requests drop constraint if exists feature_requests_name_shape;
alter table public.feature_requests add constraint feature_requests_name_shape
  check (
    length(btrim(name)) between 1 and 120
    and name !~ '^[[:space:]]*[=+@-]'
  );

-- RFC 5321 caps an address at 254. The pattern is a syntax check, not a
-- deliverability check, and is anchored at BOTH ends: the suffix-only form of
-- this pattern was already found once in this codebase to accept
-- "someone@gmail.com.jordan@northeastern.edu".
alter table public.feature_requests drop constraint if exists feature_requests_email_shape;
alter table public.feature_requests add constraint feature_requests_email_shape
  check (
    length(email) <= 254
    and email ~ '^[^@[:space:]]+@[^@[:space:].]+(\.[^@[:space:].]+)+$'
  );

alter table public.feature_requests drop constraint if exists feature_requests_kind_shape;
alter table public.feature_requests add constraint feature_requests_kind_shape
  check (kind ~ '^[a-z0-9_]{1,32}$');

alter table public.feature_requests drop constraint if exists feature_requests_pitch_shape;
alter table public.feature_requests add constraint feature_requests_pitch_shape
  check (length(btrim(pitch)) between 1 and 600);

-- THE LINK CONSTRAINT IS A SECURITY CONTROL, not tidiness, and it is the one
-- rule in this file that would be worth writing even if the form validated
-- perfectly.
--
-- A stored link is read later by a board member from the Supabase dashboard,
-- where it is a clickable value in a table cell. A `javascript:` URL in that
-- cell is script running in the dashboard session of whoever clicks it, with
-- whatever that session can reach; a `data:text/html` URL is a page the
-- submitter wrote, opened from a context the reader trusts. Only http and https
-- are storable, which is the same allowlist safeUrl() applies to calendar URLs
-- in scripts/fetch-events.mjs, and the same one validateLink() applies in
-- src/lib/feature.js.
--
-- The authority requirement (`[^[:space:]/?#]+` after the slashes) is there so
-- that "https://" and "http:///" are not storable either. A scheme with no host
-- is not a link, and it is exactly the shape a partial paste leaves behind.
alter table public.feature_requests drop constraint if exists feature_requests_link_shape;
alter table public.feature_requests add constraint feature_requests_link_shape
  check (
    link is null
    or (length(link) <= 500
        and link ~* '^https?://[^[:space:]/?#]+[^[:space:]]*$')
  );

-- The array rule, in a function rather than inline so that a second array
-- column later cannot be added with a slightly different copy of it.
--
-- Capped at 8: the form offers four ways to be reached, so 8 is above any
-- honest answer and far below anything worth storing. A NULL or empty array
-- passes here; "at least one" is submit_feature()'s job, because that is a
-- message to a person rather than an invariant of the table.
create or replace function public.feature_tokens_ok(p_vals text[])
returns boolean
language sql
immutable
as $fn$
  select p_vals is null
      or (coalesce(array_length(p_vals, 1), 0) <= 8
          and not exists (
            select 1 from unnest(p_vals) v where v !~ '^[a-z0-9_]{1,32}$'
          ));
$fn$;

alter table public.feature_requests drop constraint if exists feature_requests_reach_shape;
alter table public.feature_requests add constraint feature_requests_reach_shape
  check (public.feature_tokens_ok(reach));

alter table public.feature_requests drop constraint if exists feature_requests_submissions_positive;
alter table public.feature_requests add constraint feature_requests_submissions_positive
  check (submissions >= 1);

-- An outcome without a decision date is a half-written note, and the queue query
-- at the foot of this file would keep showing the row as open while somebody
-- believes it is answered.
alter table public.feature_requests drop constraint if exists feature_requests_outcome_needs_decision;
alter table public.feature_requests add constraint feature_requests_outcome_needs_decision
  check (outcome is null or decided_at is not null);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- ONE ROW PER ADDRESS PER PITCH, and the choice of key here is the whole
-- duplicate story.
--
-- The obvious key is the email alone, the way unsubscribes.sql does it, and it
-- is wrong for this table: a member who was interviewed in October and builds
-- something new in February is making a second, different application, and
-- keying on the address would have their new pitch silently overwrite the old
-- one. The board would never know the first had existed.
--
-- Keying on (email, pitch_key) instead means the only thing that collapses is
-- the same person sending the same words twice, which is a double tap on a slow
-- connection rather than a second application. citext means Someone@ and
-- someone@ are one address, and the digest is of the lowercased, trimmed pitch,
-- so a retyped submission with different capitalisation still counts as the
-- same one.
--
-- The cost, recorded honestly: a person who resubmits after editing one word of
-- their pitch gets a second row. The officer query at the foot of this file
-- surfaces repeat addresses so that is visible rather than surprising.
create unique index if not exists feature_requests_email_pitch_key
  on public.feature_requests (email, pitch_key);

create index if not exists feature_requests_created_idx
  on public.feature_requests (created_at desc);

-- The open work queue: applications nobody has answered yet.
create index if not exists feature_requests_open_idx
  on public.feature_requests (created_at)
  where decided_at is null;

-- ---------------------------------------------------------------------------
-- Row-level security: deny by default, and never grant.
-- ---------------------------------------------------------------------------

alter table public.feature_requests enable row level security;

-- No CREATE POLICY statements, and that absence IS the security model. See
-- rules 1 and 2 at the top of this file before adding one.
revoke all on public.feature_requests from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public API: the only thing the browser may call.
--
-- Returns { ok: true } on success and { ok: false, reason } for an answer the
-- table will not take. The reasons are the ones the form can render next to the
-- field that caused them; anything genuinely unexpected still raises. The map
-- from reason to sentence is REASONS in src/lib/feature.js.
--
-- There is deliberately no reason for "you already applied", and there must
-- never be one. See rule 3.
-- ---------------------------------------------------------------------------

create or replace function public.submit_feature(
  p_name  text,
  p_email text,
  p_kind  text,
  p_pitch text,
  p_link  text,
  p_reach text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_name  text;
  v_email citext;
  v_kind  text;
  v_pitch text;
  v_link  text;
  v_reach text[];
begin
  -- Normalise on write, the same way check_in() and submit_signup() do: trim
  -- the name, lowercase and trim the address, so one person is one row rather
  -- than two halves. An empty link is stored as NULL rather than as '', so
  -- `where link is not null` means what it looks like it means.
  v_name  := btrim(coalesce(p_name, ''));
  v_email := lower(btrim(coalesce(p_email, '')))::citext;
  v_kind  := lower(btrim(coalesce(p_kind, '')));
  v_pitch := btrim(coalesce(p_pitch, ''));
  v_link  := nullif(btrim(coalesce(p_link, '')), '');

  if v_name = '' or length(v_name) > 120 then
    return jsonb_build_object('ok', false, 'reason', 'name_required');
  end if;

  -- The CSV formula guard, repeated from the table constraint so the caller
  -- gets a sentence to render instead of an exception. See that constraint for
  -- why a leading =, +, - or @ is refused at all, and for why this is a regex
  -- rather than the left(btrim(...), 1) form signups.sql uses. Tested against
  -- p_name rather than v_name so the two layers apply the identical pattern to
  -- the identical string: v_name has already been through btrim(), which would
  -- hide a leading tab from a test written to look for one.
  if coalesce(p_name, '') ~ '^[[:space:]]*[=+@-]' then
    return jsonb_build_object('ok', false, 'reason', 'name_invalid');
  end if;

  -- Shape first, then policy. The table's own constraint already bounds the
  -- shape; this repeats it so the caller gets a reason rather than an exception.
  if length(v_email) > 254
     or v_email !~ '^[^@[:space:]]+@[^@[:space:].]+(\.[^@[:space:].]+)+$' then
    return jsonb_build_object('ok', false, 'reason', 'email_invalid');
  end if;

  -- A Northeastern address, same rule as attendance and the interest form, and
  -- the domain list lives in exactly one place: is_member_email() in
  -- schema.sql, which accepts northeastern.edu, husky.neu.edu and neu.edu. RUN
  -- schema.sql FIRST or this function does not exist and every submission
  -- raises.
  --
  -- WHY THE POLICY IS HERE AND NOT IN A CHECK CONSTRAINT. The table constraint
  -- above bounds SHAPE, which is an invariant. Which domains the club accepts is
  -- POLICY, and policy changes. If the board decides to feature an alum on a
  -- personal address, that is an edit to this function rather than a migration
  -- against a table full of rows that would now violate their own constraint.
  if not public.is_member_email(v_email) then
    return jsonb_build_object('ok', false, 'reason', 'email_domain');
  end if;

  if v_kind !~ '^[a-z0-9_]{1,32}$' then
    return jsonb_build_object('ok', false, 'reason', 'kind_required');
  end if;

  if v_pitch = '' then
    return jsonb_build_object('ok', false, 'reason', 'pitch_required');
  end if;

  -- Bounded in characters and not in bytes, so the limit the person was shown
  -- under the text area is the limit they hit. length() counts characters, which
  -- matters for anyone who writes in a script where a character is several bytes.
  if length(v_pitch) > 600 then
    return jsonb_build_object('ok', false, 'reason', 'pitch_too_long');
  end if;

  if v_link is not null then
    if length(v_link) > 500 then
      return jsonb_build_object('ok', false, 'reason', 'link_too_long');
    end if;
    -- http and https only. This is the control described above the link
    -- constraint, repeated here so a rejected paste gets a sentence, and so
    -- that the reason names the field the person can fix. A `javascript:` or
    -- `data:` value dies here rather than being stored and later clicked out of
    -- the dashboard.
    if v_link !~* '^https?://[^[:space:]/?#]+[^[:space:]]*$' then
      return jsonb_build_object('ok', false, 'reason', 'link_invalid');
    end if;
  end if;

  -- Drop anything that is not a plain token, de-duplicate, and cap the length.
  -- The browser is not a place to enforce anything, so whatever it sent is
  -- filtered rather than trusted. A garbage value is dropped silently instead of
  -- failing the whole submission: losing one checkbox is better than losing the
  -- application.
  select coalesce(array_agg(distinct lower(btrim(v))), '{}')
    into v_reach
  from unnest(coalesce(p_reach, '{}')) v
  where lower(btrim(v)) ~ '^[a-z0-9_]{1,32}$';

  if array_length(v_reach, 1) is null then
    return jsonb_build_object('ok', false, 'reason', 'reach_required');
  end if;

  if not public.feature_tokens_ok(v_reach) then
    return jsonb_build_object('ok', false, 'reason', 'too_many');
  end if;

  -- Upsert on (email, pitch_key). The same person sending the same pitch again
  -- refreshes their answers and counts up rather than adding a row: they
  -- double-tapped or their connection retried, they did not apply twice.
  -- created_at keeps the FIRST time it arrived, which is the date the board
  -- queues on.
  --
  -- `pitch` itself is NOT in the update list, and cannot usefully be: the
  -- conflict fired precisely because the lowercased, trimmed pitch is identical,
  -- so the only thing a rewrite could change is capitalisation. The first
  -- version stays, and a genuinely reworded pitch is a different key and
  -- therefore a new row.
  --
  -- decided_at and outcome are deliberately NOT reset. Somebody resending a
  -- pitch the board has already answered does not reopen the decision, and a
  -- resubmission must never be a way to push a declined application back to the
  -- top of the queue.
  insert into public.feature_requests (name, email, kind, pitch, link, reach)
  values (v_name, v_email, v_kind, v_pitch, v_link, v_reach)
  on conflict (email, pitch_key) do update
    set name        = excluded.name,
        kind        = excluded.kind,
        link        = excluded.link,
        reach       = excluded.reach,
        submissions = public.feature_requests.submissions + 1,
        updated_at  = now();

  -- Note what is NOT here: no id, no count, no report of whether this was an
  -- insert or an update. One answer, always the same. See rule 3.
  return jsonb_build_object('ok', true);
end;
$fn$;

-- ---------------------------------------------------------------------------
-- Grants. feature_tokens_ok() is a helper and stays private; only the submit is
-- reachable from the browser.
--
-- `from public` as well as `from anon`: Postgres grants EXECUTE on a new
-- function to the PUBLIC role by default, so revoking from anon alone leaves it
-- callable through the role anon inherits.
-- ---------------------------------------------------------------------------

revoke execute on function public.feature_tokens_ok(text[]) from public, anon, authenticated;
revoke execute on function
  public.submit_feature(text, text, text, text, text, text[]) from public;

grant execute on function
  public.submit_feature(text, text, text, text, text, text[]) to anon;

-- ---------------------------------------------------------------------------
-- Officer queries. Run these in the SQL editor while logged in. None is granted
-- to anon and none is reachable from the site. The Supabase table editor will
-- export any result as CSV.
--
-- ONE WARNING BEFORE YOU EXPORT ANYTHING. The `name` column is guarded against
-- the leading =, +, - and @ that a spreadsheet reads as a formula. The `pitch`
-- column is NOT, because it is a paragraph and refusing one that opens with a
-- minus sign would be refusing a real sentence. Read pitches in the dashboard.
-- If you must put them in a spreadsheet, import the CSV as text rather than
-- letting the spreadsheet guess.
--
--
-- THE QUEUE, which is what this table is for
--
--   -- Everything still waiting on a decision, oldest first, because the person
--   -- who has been waiting longest is the one to answer next.
--   select created_at, name, email, kind, pitch, link, reach
--   from public.feature_requests
--   where decided_at is null
--   order by created_at;
--
--   -- Say yes and book it.
--   update public.feature_requests
--   set decided_at = now(), outcome = 'scheduled'
--   where id = '00000000-0000-0000-0000-000000000000';
--
--   -- Say no. Do this rather than deleting the row: a declined application is
--   -- the record that somebody put their hand up and got an answer, and the
--   -- next board will want to know who has already been asked.
--   update public.feature_requests
--   set decided_at = now(), outcome = 'declined'
--   where id = '00000000-0000-0000-0000-000000000000';
--
--   -- Scheduled but not yet published: the pieces that are somebody's homework.
--   select name, email, kind, decided_at
--   from public.feature_requests
--   where outcome = 'scheduled'
--   order by decided_at;
--
--
-- WHO TO WRITE TO, AND HOW
--
--   -- The reach answers for one person, as labels the board can act on. The
--   -- keys are the ones in REACH in src/lib/feature.js.
--   select name, email, reach
--   from public.feature_requests
--   where decided_at is null
--   order by created_at;
--
--   -- Everyone who said Slack works. `= any()` reads better than a join and is
--   -- the reason reach is an array rather than a join table.
--   select name, email
--   from public.feature_requests
--   where decided_at is null and 'slack' = any(reach);
--
--   -- MINUS anyone who has asked to be left alone. A feature request is consent
--   -- to be contacted about that request and nothing else, but somebody who
--   -- unsubscribed between applying and being answered should be handled by a
--   -- person rather than swept into a mailout.
--   select f.name, f.email
--   from public.feature_requests f
--   where f.decided_at is null
--     and not exists (
--       select 1 from public.unsubscribes u where u.email = f.email
--     )
--   order by f.created_at;
--
--
-- WHAT THE BLOG IS BEING OFFERED
--
--   -- The split between interviews, projects and either one. Any key the form
--   -- is no longer offering shows up here as an unfamiliar row rather than
--   -- being silently dropped, which is the trade rule 4 makes.
--   select kind, count(*) as applications
--   from public.feature_requests
--   group by kind
--   order by applications desc;
--
--   -- Applications with something to look at before deciding.
--   select name, kind, link, left(pitch, 120) as opening
--   from public.feature_requests
--   where link is not null and decided_at is null
--   order by created_at;
--
--   -- By month, for the question "are we running out of material".
--   select date_trunc('month', created_at) as month, count(*) as applications
--   from public.feature_requests
--   group by 1
--   order by 1 desc;
--
--
-- REPEATS
--
--   -- Anyone who has applied more than once with different words. The unique
--   -- index collapses an identical resubmission, so two rows for one address
--   -- means two different pitches, and it is worth checking whether the second
--   -- is a correction of the first before answering both.
--   select email, count(*) as applications, max(created_at) as latest
--   from public.feature_requests
--   group by email
--   having count(*) > 1
--   order by latest desc;
--
--   -- Who rewrote the same pitch. The row shows the later version.
--   select name, email, submissions, created_at, updated_at
--   from public.feature_requests
--   where submissions > 1
--   order by updated_at desc;
--
--
-- IF THE FORM IS EVER FLOODED
--
-- Nothing rate limits submit_feature(), and this table is a slightly larger
-- target than signups because one of its columns takes 600 characters of free
-- text. The bounds that exist are that ceiling, the Northeastern domain rule,
-- and the unique index, which means a flood needs a fresh address or a fresh
-- pitch per row. That is not a limit, and it is the same residual risk
-- SECURITY.md records for cast_ballot() and submit_signup(), acceptable for the
-- same reason: an application allocates nothing scarce and a person reads every
-- row before acting on it.
--
-- LOOK at the rows before deleting any of them. A burst of real applications
-- after the club posts the link is the expected shape of a good day.
--
--   select created_at, name, email, source, left(pitch, 80) as opening
--   from public.feature_requests
--   where created_at > now() - interval '1 hour'
--   order by created_at;
-- ---------------------------------------------------------------------------
