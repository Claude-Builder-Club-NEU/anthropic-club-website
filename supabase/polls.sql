-- Polls: anonymous ballots.
--
-- Run this AFTER schema.sql, which sets up the attendance side. The two
-- features share a project but deliberately share no identity: attendance keys
-- everything on a Northeastern email, and nothing in this file records one.
--
-- WHAT ANONYMITY MEANS HERE, CONCRETELY
--
--   * A ballot row is a poll slug, an answers blob, and a timestamp. There is
--     no email column, no name column, no session column, and no IP column, so
--     there is no column to join a ballot back to a person with.
--   * created_at is rounded to the hour. A precise timestamp is a fingerprint:
--     with a room of thirty people and second-level timestamps, the order
--     people pressed submit is recoverable, and anyone who watched the room
--     knows that order. Rounding costs nothing analytically and removes it.
--   * cast_ballot() returns only ok. It never reads a ballot back, so the
--     endpoint the public can reach cannot be turned into a reader.
--   * poll_results() returns counts, never rows. The smallest thing it will
--     answer is "how many chose this option".
--
-- The poll DEFINITION is not in this database. It lives in the repository as
-- JSON under src/lib/polls/, because a poll is authored, reviewed and versioned
-- like copy rather than administered like data. This table only holds what
-- people answered.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists public.ballots (
  id         uuid        primary key default gen_random_uuid(),
  poll_slug  text        not null,
  answers    jsonb       not null,
  -- Rounded to the hour on write. See the note above: this is a privacy
  -- decision, not a laziness about precision.
  created_at timestamptz not null default date_trunc('hour', now())
);

create index if not exists ballots_poll_idx on public.ballots (poll_slug);

-- Deny by default, exactly as the attendance tables do. No policies, so anon
-- reaches this table only through the two functions below.
alter table public.ballots enable row level security;
revoke all on public.ballots from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public API, function 1: cast a ballot.
--
-- Returns { ok } and nothing else. Deliberately not the ballot, not an id, and
-- not a count: anything it returned would be a reader, and the whole point of
-- this endpoint is that it only writes.
--
-- There is no dedupe and there cannot be. Deduping requires knowing who is
-- voting, which is the thing this feature has chosen not to know. The spec
-- states the same trade in plain words on the hub screen.
-- ---------------------------------------------------------------------------

create or replace function public.cast_ballot(
  p_slug    text,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if coalesce(btrim(p_slug), '') = '' then
    return jsonb_build_object('ok', false, 'reason', 'poll_required');
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    return jsonb_build_object('ok', false, 'reason', 'answers_invalid');
  end if;

  -- A crude ceiling on the write-in fields. Not validation, which belongs to
  -- the poll definition in the repository, but a bound on what one anonymous
  -- POST can put in the table.
  if pg_column_size(p_answers) > 8192 then
    return jsonb_build_object('ok', false, 'reason', 'answers_too_large');
  end if;

  insert into public.ballots (poll_slug, answers) values (btrim(p_slug), p_answers);

  return jsonb_build_object('ok', true);
end;
$fn$;

-- ---------------------------------------------------------------------------
-- Public API, function 2: results.
--
-- Counts only, and only per option. The shape is
--   { "total": 78, "questions": { "timing.night": { "thu": 32, "wed": 19 } } }
-- which is everything the results line on the hub needs and nothing else.
--
-- Write-in text is NOT returned. Free text is the one answer in a poll that can
-- identify its author, because people write like themselves, and a public
-- endpoint handing it out would quietly undo the anonymity every other decision
-- here protects. Officers read write-ins in the dashboard against a real
-- authenticated role, which is not this.
-- ---------------------------------------------------------------------------

create or replace function public.poll_results(p_slug text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $fn$
  with rows as (
    select answers from public.ballots where poll_slug = btrim(p_slug)
  ),
  -- One row per (question, chosen option). An array answer contributes one row
  -- per element, which is what makes multi-select and ranked slots tally with
  -- the same expression as a single choice.
  choices as (
    select
      kv.key as question,
      case
        when jsonb_typeof(kv.value) = 'array' then elem.value
        else kv.value
      end as choice
    from rows
    cross join lateral jsonb_each(rows.answers) as kv
    left join lateral jsonb_array_elements(
      case when jsonb_typeof(kv.value) = 'array' then kv.value else '[]'::jsonb end
    ) as elem on true
    -- Strings only. This drops write-in prose, which is exactly the intent:
    -- an option key is a short token, and anything long enough to be a
    -- sentence is not a tally.
    where jsonb_typeof(coalesce(elem.value, kv.value)) = 'string'
      and length(coalesce(elem.value, kv.value) #>> '{}') <= 64
  )
  select jsonb_build_object(
    'total', (select count(*) from rows),
    'questions', coalesce((
      select jsonb_object_agg(question, tally)
      from (
        select question, jsonb_object_agg(choice #>> '{}', n) as tally
        from (
          select question, choice, count(*) as n
          from choices
          group by question, choice
        ) per_choice
        group by question
      ) per_question
    ), '{}'::jsonb)
  );
$fn$;

grant execute on function public.cast_ballot(text, jsonb) to anon;
grant execute on function public.poll_results(text) to anon;
