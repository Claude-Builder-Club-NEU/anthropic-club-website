-- HACK1984 registrations: the /hackathon/signup form, the $5 Stripe payment,
-- the 100-seat count and the waitlist.
--
-- Run this in the Supabase SQL editor AFTER schema.sql (it uses
-- is_member_email() from there). It is safe to run again: every statement is
-- idempotent.
--
-- HOW THIS DIFFERS FROM EVERY OTHER FILE IN THIS FOLDER
--
-- The other files expose a handful of functions to the ANON role, because the
-- browser calls them directly with the public key. Nothing here is granted to
-- anon. The browser never talks to these tables or this bucket with a key:
-- it talks to the Netlify functions in netlify/functions/hackathon-*.mjs, and
-- those call the functions below with the service role key, which lives only
-- in Netlify's environment variables.
--
-- That is not a style choice. A registration is only real once Stripe says it
-- was paid for, and the thing that marks it paid has to be something the
-- public cannot call. With the anon key in every visitor's bundle, "the
-- browser may call confirm" would mean "anyone may give themselves a seat".
--
-- THIS TABLE HOLDS PERSONAL DATA: name, Northeastern email, phone number,
-- year, college, LinkedIn URL, dietary notes, and pointers to a resume and a
-- headshot in the private `hackathon` storage bucket. Registrants agree on the
-- form that the resume, LinkedIn and headshot are shared with sponsors
-- (`sponsor_consent`); nothing else is.
--
-- WHAT "ONE SEAT" MEANS
--
-- A seat is a row with status 'seated'. The meter on the page, the capacity
-- check and the spot number on the ticket all count exactly that. A
-- 'pending' row is someone who filled in the form but has not finished, and
-- it holds nothing.
--
-- PAYMENT IS OFF FOR NOW (Northeastern's limits on student-org payments).
-- The first 100 people to finish the form are seated for free with the $5
-- fee OWED (fee_paid_at is null); everyone after that joins the waitlist,
-- free. An officer marks a fee paid with hackathon_mark_fee_paid(email), and
-- at the payment deadline hackathon_release_unpaid() takes back every seat
-- still unpaid and hands each one, same seat number, to the next person on
-- the waitlist. See the officer section at the foot of this file.
--
-- The Stripe path is still here and still tested (hackathon_confirm, the
-- webhook, refunds). It is switched on per deploy with the Netlify variable
-- HACKATHON_PAYMENTS=stripe, and then a seat is only given once Stripe says
-- the $5 is paid: fee_paid_at is set at the same moment as the seat. The race
-- for the last seat is settled under a lock in hackathon_confirm(), and the
-- loser is waitlisted and refunded.

create extension if not exists "pgcrypto";  -- gen_random_uuid()
create extension if not exists "citext";    -- case-insensitive email column

-- ---------------------------------------------------------------------------
-- Capacity. The room holds 100. The page reads this through hackathon_seats(),
-- so changing it here changes the meter too.
-- ---------------------------------------------------------------------------

create or replace function public.hackathon_capacity()
returns integer
language sql
immutable
as $fn$ select 100 $fn$;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists public.hackathon_registrations (
  id                    uuid        primary key default gen_random_uuid(),

  -- pending   filled in the form, has not finished
  -- seated    has a seat; `spot` is their number
  -- waitlist  the room was full; `waitlist_position` is their place
  -- duplicate paid a second time for an email that already had a place
  --           (Stripe mode only); refunded, the original untouched
  -- released  gave up or lost their seat or waitlist place, usually for not
  --           paying by the deadline
  status                text        not null default 'pending',

  name                  text        not null,
  email                 citext      not null,
  phone                 text        not null,
  class_year            text        not null,
  college               text        not null,
  linkedin_url          text        not null,
  dietary               text,
  sponsor_consent       boolean     not null,

  -- Object paths inside the private `hackathon` bucket. Fixed at registration
  -- (<id>/resume.pdf, <id>/headshot.<ext>) so the upload URL and the row
  -- cannot disagree about where the file is.
  resume_path           text        not null,
  headshot_path         text        not null,

  spot                  integer,
  waitlist_position     integer,

  -- The ticket's address: /hackathon/ticket/?t=<ticket_token>. Random, so a
  -- ticket cannot be found by counting.
  ticket_token          uuid        not null default gen_random_uuid(),

  stripe_session_id     text,
  stripe_payment_intent text,
  amount_cents          integer,

  -- 'due' means Stripe took money that this table did not turn into a seat.
  -- The Netlify function refunds it and sets 'done'. A row stuck at 'due' is
  -- a refund to issue by hand in the Stripe dashboard.
  refund_state          text        check (refund_state in ('due', 'done')),

  -- When the $5 was received, by Stripe or recorded by an officer. Null
  -- means the fee is still owed.
  fee_paid_at           timestamptz,
  released_at           timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  paid_at               timestamptz
);

-- ---------------------------------------------------------------------------
-- Migration from the first version of this file, where a seat was status
-- 'paid'. Safe to run again: every step is a no-op the second time. The
-- constraint and index that name the old status are dropped BEFORE the
-- update, because the update would violate them, and recreated below.
-- ---------------------------------------------------------------------------

alter table public.hackathon_registrations add column if not exists fee_paid_at timestamptz;
alter table public.hackathon_registrations add column if not exists released_at timestamptz;
alter table public.hackathon_registrations drop constraint if exists hackathon_registrations_status_check;
alter table public.hackathon_registrations drop constraint if exists hk_paid_has_spot;
drop index if exists public.hk_one_per_email;

update public.hackathon_registrations
   set status = 'seated', fee_paid_at = coalesce(fee_paid_at, paid_at)
 where status = 'paid';

alter table public.hackathon_registrations drop constraint if exists hk_status_values;
alter table public.hackathon_registrations add constraint hk_status_values
  check (status in ('pending', 'seated', 'waitlist', 'duplicate', 'released'));

alter table public.hackathon_registrations drop constraint if exists hk_name_shape;
alter table public.hackathon_registrations add constraint hk_name_shape
  check (length(btrim(name)) between 1 and 120 and left(name, 1) not in ('=', '+', '-', '@'));

alter table public.hackathon_registrations drop constraint if exists hk_email_shape;
alter table public.hackathon_registrations add constraint hk_email_shape
  check (length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:].]+(\.[^@[:space:].]+)+$');

-- E.164: a plus and 8 to 15 digits. The function normalises whatever was
-- typed into this before it gets here.
alter table public.hackathon_registrations drop constraint if exists hk_phone_shape;
alter table public.hackathon_registrations add constraint hk_phone_shape
  check (phone ~ '^\+[0-9]{8,15}$');

alter table public.hackathon_registrations drop constraint if exists hk_tokens_shape;
alter table public.hackathon_registrations add constraint hk_tokens_shape
  check (class_year ~ '^[a-z0-9_]{1,32}$' and college ~ '^[a-z0-9_]{1,32}$');

alter table public.hackathon_registrations drop constraint if exists hk_linkedin_shape;
alter table public.hackathon_registrations add constraint hk_linkedin_shape
  check (linkedin_url ~ '^https://www\.linkedin\.com/in/[A-Za-z0-9_%-]{2,100}/$');

alter table public.hackathon_registrations drop constraint if exists hk_dietary_shape;
alter table public.hackathon_registrations add constraint hk_dietary_shape
  check (dietary is null or length(dietary) <= 300);

alter table public.hackathon_registrations drop constraint if exists hk_seated_has_spot;
alter table public.hackathon_registrations add constraint hk_seated_has_spot
  check ((status = 'seated') = (spot is not null));

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- One seat, or one waitlist place, per person. Pending rows are free to
-- repeat: someone who abandons checkout and comes back gets a fresh row.
create unique index if not exists hk_one_per_email
  on public.hackathon_registrations (email)
  where status in ('seated', 'waitlist');

create unique index if not exists hk_spot_key
  on public.hackathon_registrations (spot)
  where spot is not null;

create unique index if not exists hk_ticket_token_key
  on public.hackathon_registrations (ticket_token);

create unique index if not exists hk_stripe_session_key
  on public.hackathon_registrations (stripe_session_id)
  where stripe_session_id is not null;

create index if not exists hk_status_idx
  on public.hackathon_registrations (status, created_at);

-- ---------------------------------------------------------------------------
-- Row-level security: on, with no policy. Only the service role (which
-- bypasses RLS) and the table owner can touch rows.
-- ---------------------------------------------------------------------------

alter table public.hackathon_registrations enable row level security;
revoke all on public.hackathon_registrations from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: a PRIVATE bucket for resumes and headshots.
--
-- The browser uploads into it with a one-time signed upload URL that the
-- register function mints per file, so no storage policy is needed and none
-- is created: anon cannot list, read or write this bucket. Organizers
-- download files from the Supabase dashboard (Storage → hackathon).
--
-- The bucket itself enforces the size cap and the file types, so a signed URL
-- cannot be used to park a 2GB video or an .exe.
--
-- Guarded, because the test database has no storage schema.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('hackathon', 'hackathon', false, 5242880,
            array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
    on conflict (id) do update
      set public             = false,
          file_size_limit    = excluded.file_size_limit,
          allowed_mime_types = excluded.allowed_mime_types;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.hackathon_taken()
returns integer
language sql
stable
security definer
set search_path = public
as $fn$
  select count(*)::int from public.hackathon_registrations where status = 'seated';
$fn$;

-- The lowest seat number not in use. Numbers are handed out in order, and a
-- seat taken back from someone who did not pay keeps its number for whoever
-- gets it next, so no ticket ever reads "seat 104 of 100". Called only under
-- the hackathon_seats advisory lock.
create or replace function public.hackathon_next_spot()
returns integer
language sql
stable
security definer
set search_path = public
as $fn$
  select min(n)::int
    from generate_series(1, public.hackathon_capacity()) n
   where not exists (
     select 1 from public.hackathon_registrations r
      where r.spot = n and r.status = 'seated');
$fn$;

create or replace function public.hackathon_next_waitlist()
returns integer
language sql
stable
security definer
set search_path = public
as $fn$
  select coalesce(max(waitlist_position), 0) + 1 from public.hackathon_registrations;
$fn$;

-- What a ticket shows. One place, so the three functions that return a
-- ticket cannot disagree about what is on it.
create or replace function public.hackathon_ticket_json(r public.hackathon_registrations)
returns jsonb
language sql
stable
as $fn$
  select jsonb_build_object(
    'ok',                true,
    'status',            r.status,
    'name',              r.name,
    'email',             r.email::text,
    'phone',             r.phone,
    'class_year',        r.class_year,
    'college',           r.college,
    'spot',              r.spot,
    'waitlist_position', r.waitlist_position,
    'capacity',          public.hackathon_capacity(),
    'token',             r.ticket_token,
    'refunded',          r.refund_state is not null,
    'fee_cents',         500,
    'fee_paid',          r.fee_paid_at is not null,
    'paid_at',           r.paid_at,
    'created_at',        r.created_at
  );
$fn$;

-- ---------------------------------------------------------------------------
-- hackathon_seats(): the meter. A count and a capacity, nothing else.
-- ---------------------------------------------------------------------------

create or replace function public.hackathon_seats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $fn$
  select jsonb_build_object(
    'capacity', public.hackathon_capacity(),
    'taken',    public.hackathon_taken()
  );
$fn$;

-- ---------------------------------------------------------------------------
-- hackathon_register(): the form. Validates, then inserts a PENDING row.
--
-- Returns { ok, id, resume_path, headshot_path, full } or { ok: false, reason }.
-- `full` tells the page whether the next step is a seat or the waitlist.
--
-- It DOES say when an email already has a seat ('already_registered'), which
-- signups.sql's no-oracle rule forbids for the club roster. The trade is
-- deliberate: without it, the second visit from someone who already paid ends
-- in a $5 charge and a refund, and whether a given student is going to a
-- public hackathon is not the secret a mailing list is.
-- ---------------------------------------------------------------------------

create or replace function public.hackathon_register(
  p_name          text,
  p_email         text,
  p_phone         text,
  p_class_year    text,
  p_college       text,
  p_linkedin      text,
  p_dietary       text,
  p_consent       boolean,
  p_headshot_ext  text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_name     text   := btrim(coalesce(p_name, ''));
  v_email    citext := lower(btrim(coalesce(p_email, '')))::citext;
  v_phone    text   := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  v_year     text   := lower(btrim(coalesce(p_class_year, '')));
  v_college  text   := lower(btrim(coalesce(p_college, '')));
  v_linkedin text   := btrim(coalesce(p_linkedin, ''));
  v_dietary  text   := nullif(btrim(coalesce(p_dietary, '')), '');
  v_ext      text   := lower(btrim(coalesce(p_headshot_ext, '')));
  v_handle   text;
  v_id       uuid   := gen_random_uuid();
  v_row      public.hackathon_registrations;
begin
  if v_name = '' or length(v_name) > 120 then
    return jsonb_build_object('ok', false, 'reason', 'name_required');
  end if;
  if left(v_name, 1) in ('=', '+', '-', '@') then
    return jsonb_build_object('ok', false, 'reason', 'name_invalid');
  end if;

  if length(v_email) > 254
     or v_email !~ '^[^@[:space:]]+@[^@[:space:].]+(\.[^@[:space:].]+)+$' then
    return jsonb_build_object('ok', false, 'reason', 'email_invalid');
  end if;
  if not public.is_member_email(v_email) then
    return jsonb_build_object('ok', false, 'reason', 'email_domain');
  end if;

  -- A bare 10-digit number is North American; anything else must say its
  -- country code. A leading 1 on 11 digits is the same number typed with it.
  if v_phone ~ '^[0-9]{10}$' then
    v_phone := '+1' || v_phone;
  elsif v_phone ~ '^1[0-9]{10}$' then
    v_phone := '+' || v_phone;
  end if;
  if v_phone !~ '^\+[0-9]{8,15}$' then
    return jsonb_build_object('ok', false, 'reason', 'phone_invalid');
  end if;

  if v_year !~ '^[a-z0-9_]{1,32}$' then
    return jsonb_build_object('ok', false, 'reason', 'year_required');
  end if;
  if v_college !~ '^[a-z0-9_]{1,32}$' then
    return jsonb_build_object('ok', false, 'reason', 'college_required');
  end if;

  -- Whatever form the profile was pasted in — with or without https://, www.,
  -- a country subdomain, a trailing slash or a ?utm tail — it is stored as
  -- one canonical URL, so the sponsor export is a column of working links.
  v_handle := substring(v_linkedin from
    '^(?:https?://)?(?:[a-z]{2,3}\.)?linkedin\.com/in/([A-Za-z0-9_%-]{2,100})/?(?:[?#].*)?$');
  if v_handle is null then
    return jsonb_build_object('ok', false, 'reason', 'linkedin_invalid');
  end if;
  v_linkedin := 'https://www.linkedin.com/in/' || v_handle || '/';

  if v_dietary is not null and length(v_dietary) > 300 then
    return jsonb_build_object('ok', false, 'reason', 'dietary_too_long');
  end if;

  if coalesce(p_consent, false) is not true then
    return jsonb_build_object('ok', false, 'reason', 'consent_required');
  end if;

  if v_ext not in ('jpg', 'png', 'webp') then
    return jsonb_build_object('ok', false, 'reason', 'headshot_type');
  end if;

  if exists (
    select 1 from public.hackathon_registrations
    where email = v_email and status in ('seated', 'waitlist')
  ) then
    return jsonb_build_object('ok', false, 'reason', 'already_registered');
  end if;

  insert into public.hackathon_registrations
    (id, name, email, phone, class_year, college, linkedin_url, dietary,
     sponsor_consent, resume_path, headshot_path)
  values
    (v_id, v_name, v_email, v_phone, v_year, v_college, v_linkedin, v_dietary,
     true, v_id || '/resume.pdf', v_id || '/headshot.' || v_ext)
  returning * into v_row;

  return jsonb_build_object(
    'ok',            true,
    'id',            v_row.id,
    'resume_path',   v_row.resume_path,
    'headshot_path', v_row.headshot_path,
    'full',          public.hackathon_taken() >= public.hackathon_capacity()
  );
end;
$fn$;

-- ---------------------------------------------------------------------------
-- hackathon_pending(): the checkout step's view of a pending row, so the
-- function can build a Stripe session with the right email.
-- ---------------------------------------------------------------------------

create or replace function public.hackathon_pending(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $fn$
  select coalesce(
    (select jsonb_build_object(
              'ok',                true,
              'id',                r.id,
              'status',            r.status,
              'name',              r.name,
              'email',             r.email::text,
              'resume_path',       r.resume_path,
              'headshot_path',     r.headshot_path,
              'stripe_session_id', r.stripe_session_id,
              'token',             r.ticket_token,
              'full',              public.hackathon_taken() >= public.hackathon_capacity(),
              'already_registered', exists (
                 select 1 from public.hackathon_registrations o
                 where o.email = r.email and o.id <> r.id
                   and o.status in ('seated', 'waitlist')))
       from public.hackathon_registrations r
      where r.id = p_id),
    jsonb_build_object('ok', false, 'reason', 'not_found'));
$fn$;

create or replace function public.hackathon_attach_session(p_id uuid, p_session text)
returns void
language sql
security definer
set search_path = public
as $fn$
  update public.hackathon_registrations
     set stripe_session_id = p_session, updated_at = now()
   where id = p_id and status = 'pending';
$fn$;

-- ---------------------------------------------------------------------------
-- hackathon_confirm(): Stripe says this checkout was paid. Give out a seat.
--
-- Called by BOTH the webhook and the ticket page (whichever gets there
-- first), so it must be idempotent: a second call for a row that is already
-- settled returns the same ticket and changes nothing.
--
-- The advisory lock serialises seat numbering. Without it two payments
-- landing in the same millisecond would both read "42 taken" and both try to
-- be seat 43; the unique index would reject one, but as an error rather than
-- as the waitlist move below.
-- ---------------------------------------------------------------------------

create or replace function public.hackathon_confirm(
  p_id             uuid,
  p_session        text,
  p_payment_intent text,
  p_amount_cents   integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_row   public.hackathon_registrations;
  v_taken integer;
begin
  perform pg_advisory_xact_lock(hashtext('hackathon_seats'));

  select * into v_row from public.hackathon_registrations where id = p_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  -- A session id is only ever attached to the row it was created for. A
  -- mismatch means a forged or crossed call; refuse it rather than guess.
  if v_row.stripe_session_id is distinct from p_session then
    return jsonb_build_object('ok', false, 'reason', 'session_mismatch');
  end if;

  if v_row.status <> 'pending' then
    return public.hackathon_ticket_json(v_row);
  end if;

  -- Paid twice for one email: keep the first seat, refund this one.
  if exists (
    select 1 from public.hackathon_registrations
    where email = v_row.email and id <> v_row.id and status in ('seated', 'waitlist')
  ) then
    update public.hackathon_registrations
       set status = 'duplicate', refund_state = 'due',
           stripe_payment_intent = p_payment_intent, amount_cents = p_amount_cents,
           paid_at = now(), updated_at = now()
     where id = p_id
    returning * into v_row;
    return public.hackathon_ticket_json(v_row);
  end if;

  v_taken := public.hackathon_taken();

  if v_taken >= public.hackathon_capacity() then
    -- Lost the race for the last seat. Waitlist, and refund.
    update public.hackathon_registrations
       set status = 'waitlist', refund_state = 'due',
           waitlist_position = public.hackathon_next_waitlist(),
           stripe_payment_intent = p_payment_intent, amount_cents = p_amount_cents,
           paid_at = now(), updated_at = now()
     where id = p_id
    returning * into v_row;
    return public.hackathon_ticket_json(v_row);
  end if;

  -- The lowest free seat number; see hackathon_next_spot().
  update public.hackathon_registrations
     set status = 'seated',
         spot = public.hackathon_next_spot(),
         stripe_payment_intent = p_payment_intent, amount_cents = p_amount_cents,
         paid_at = now(), fee_paid_at = now(), updated_at = now()
   where id = p_id
  returning * into v_row;

  return public.hackathon_ticket_json(v_row);
end;
$fn$;

create or replace function public.hackathon_mark_refunded(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $fn$
  update public.hackathon_registrations
     set refund_state = 'done', updated_at = now()
   where id = p_id and refund_state = 'due';
$fn$;

-- ---------------------------------------------------------------------------
-- hackathon_claim(): finish a registration WITHOUT payment, which is how
-- signup works while HACKATHON_PAYMENTS is off. A free seat if there is one,
-- with the $5 owed; otherwise the next place on the waitlist.
--
-- Idempotent like confirm: a second call for a row that is already settled
-- returns the same ticket.
-- ---------------------------------------------------------------------------

create or replace function public.hackathon_claim(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_row public.hackathon_registrations;
begin
  perform pg_advisory_xact_lock(hashtext('hackathon_seats'));

  select * into v_row from public.hackathon_registrations where id = p_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if v_row.status <> 'pending' then
    return public.hackathon_ticket_json(v_row);
  end if;

  if exists (
    select 1 from public.hackathon_registrations
    where email = v_row.email and id <> v_row.id and status in ('seated', 'waitlist')
  ) then
    return jsonb_build_object('ok', false, 'reason', 'already_registered');
  end if;

  if public.hackathon_taken() < public.hackathon_capacity() then
    update public.hackathon_registrations
       set status = 'seated', spot = public.hackathon_next_spot(), updated_at = now()
     where id = p_id
    returning * into v_row;
  else
    update public.hackathon_registrations
       set status = 'waitlist', waitlist_position = public.hackathon_next_waitlist(),
           updated_at = now()
     where id = p_id
    returning * into v_row;
  end if;

  return public.hackathon_ticket_json(v_row);
end;
$fn$;

drop function if exists public.hackathon_join_waitlist(uuid);

-- ---------------------------------------------------------------------------
-- OFFICER TOOLS. Run these in the SQL editor; none is callable from the site.
--
--   select public.hackathon_mark_fee_paid('someone@northeastern.edu');
--     Record that their $5 arrived (Venmo, cash, whatever the club uses).
--
--   select public.hackathon_release('someone@northeastern.edu');
--     Take back one person's seat or waitlist place. A freed seat goes, same
--     number, to the first person on the waitlist. Returns who was released
--     and who was promoted, so the organizers know whom to tell.
--
--   select public.hackathon_release_unpaid();
--     THE DEADLINE. Releases every seated person whose fee is still unpaid,
--     in seat order, promoting from the waitlist for each. People promoted in
--     this run start with the fee owed and are NOT released by it; run it
--     again at their deadline.
--
-- A promoted person's ticket link keeps working and now shows their seat.
-- Nothing emails anyone: tell them yourself, their email and phone are in the
-- results.
-- ---------------------------------------------------------------------------

create or replace function public.hackathon_mark_fee_paid(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_row public.hackathon_registrations;
begin
  update public.hackathon_registrations
     set fee_paid_at = coalesce(fee_paid_at, now()), updated_at = now()
   where email = lower(btrim(p_email))::citext and status in ('seated', 'waitlist')
  returning * into v_row;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  return jsonb_build_object('ok', true, 'name', v_row.name, 'status', v_row.status,
                            'spot', v_row.spot, 'fee_paid_at', v_row.fee_paid_at);
end;
$fn$;

create or replace function public.hackathon_release(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_row      public.hackathon_registrations;
  v_next     public.hackathon_registrations;
  v_spot     integer;
  v_promoted boolean := false;
begin
  perform pg_advisory_xact_lock(hashtext('hackathon_seats'));

  select * into v_row from public.hackathon_registrations
   where email = lower(btrim(p_email))::citext and status in ('seated', 'waitlist')
   for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  v_spot := v_row.spot;
  update public.hackathon_registrations
     set status = 'released', spot = null, waitlist_position = null,
         released_at = now(), updated_at = now()
   where id = v_row.id;

  if v_spot is null then
    return jsonb_build_object('ok', true,
      'released', jsonb_build_object('name', v_row.name, 'email', v_row.email::text, 'was', 'waitlist'),
      'promoted', null);
  end if;

  -- The seat, same number, to the front of the waitlist.
  select * into v_next from public.hackathon_registrations
   where status = 'waitlist'
   order by waitlist_position
   limit 1
   for update;

  if found then
    v_promoted := true;
    update public.hackathon_registrations
       set status = 'seated', spot = v_spot, waitlist_position = null, updated_at = now()
     where id = v_next.id;
  end if;

  return jsonb_build_object('ok', true,
    'released', jsonb_build_object('name', v_row.name, 'email', v_row.email::text, 'was', 'seat ' || v_spot),
    'promoted', case when v_promoted then
      jsonb_build_object('name', v_next.name, 'email', v_next.email::text,
                         'phone', v_next.phone, 'spot', v_spot) end);
end;
$fn$;

create or replace function public.hackathon_release_unpaid()
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_email text;
  v_out   jsonb := '[]'::jsonb;
begin
  -- The list is taken first, so people promoted during this run are not
  -- released by it.
  for v_email in
    select email::text from public.hackathon_registrations
     where status = 'seated' and fee_paid_at is null
     order by spot
  loop
    v_out := v_out || jsonb_build_array(public.hackathon_release(v_email));
  end loop;
  return v_out;
end;
$fn$;

-- ---------------------------------------------------------------------------
-- Ticket lookups. By token (the ticket's own URL) or by Stripe session (the
-- redirect back from checkout, before the page knows the token). Pending rows
-- are never returned: there is no ticket until there is a seat or a place.
-- ---------------------------------------------------------------------------

create or replace function public.hackathon_ticket(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $fn$
  select coalesce(
    (select public.hackathon_ticket_json(r)
       from public.hackathon_registrations r
      where r.ticket_token = p_token and r.status <> 'pending'),
    jsonb_build_object('ok', false, 'reason', 'not_found'));
$fn$;

create or replace function public.hackathon_by_session(p_session text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $fn$
  select coalesce(
    (select jsonb_build_object(
              'ok',     true,
              'id',     r.id,
              'status', r.status,
              'ticket', case when r.status = 'pending' then null
                             else public.hackathon_ticket_json(r) end)
       from public.hackathon_registrations r
      where r.stripe_session_id = p_session),
    jsonb_build_object('ok', false, 'reason', 'not_found'));
$fn$;

-- ---------------------------------------------------------------------------
-- Grants. Service role only. `from public` as well as `from anon`: Postgres
-- grants EXECUTE on a new function to PUBLIC by default, and anon inherits it.
-- ---------------------------------------------------------------------------

do $$
declare
  f text;
begin
  foreach f in array array[
    'public.hackathon_capacity()',
    'public.hackathon_taken()',
    'public.hackathon_ticket_json(public.hackathon_registrations)',
    'public.hackathon_seats()',
    'public.hackathon_register(text,text,text,text,text,text,text,boolean,text)',
    'public.hackathon_pending(uuid)',
    'public.hackathon_attach_session(uuid,text)',
    'public.hackathon_confirm(uuid,text,text,integer)',
    'public.hackathon_mark_refunded(uuid)',
    'public.hackathon_claim(uuid)',
    'public.hackathon_next_spot()',
    'public.hackathon_next_waitlist()',
    'public.hackathon_ticket(uuid)',
    'public.hackathon_by_session(text)'
  ] loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute format('grant execute on function %s to service_role', f);
    end if;
  end loop;

  -- Officer tools: the SQL editor only. Not even the Netlify functions.
  foreach f in array array[
    'public.hackathon_mark_fee_paid(text)',
    'public.hackathon_release(text)',
    'public.hackathon_release_unpaid()'
  ] loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute format('revoke execute on function %s from service_role', f);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Officer queries. Paste into the SQL editor.
--
--   -- The roster, in seat order, with who still owes the $5.
--   select spot, name, email, phone, (fee_paid_at is not null) as fee_paid,
--          class_year, college, linkedin_url, dietary
--   from public.hackathon_registrations
--   where status = 'seated'
--   order by spot;
--
--   -- The waitlist, in order.
--   select waitlist_position, name, email, phone, (fee_paid_at is not null) as fee_paid
--   from public.hackathon_registrations
--   where status = 'waitlist'
--   order by waitlist_position;
--
--   -- Refunds the functions could not issue. Refund these by hand in Stripe
--   -- (search the payment intent), then run hackathon_mark_refunded(id).
--   select id, name, email, stripe_payment_intent, amount_cents, paid_at
--   from public.hackathon_registrations
--   where refund_state = 'due';
--
--   -- Resumes and headshots for sponsors: Storage → hackathon in the
--   -- dashboard. Each registration's files are in a folder named by its id.
--
--   -- Abandoned forms (never paid). Safe to delete after the event; their
--   -- files in the bucket are too.
--   select id, name, email, created_at
--   from public.hackathon_registrations
--   where status = 'pending' and created_at < now() - interval '1 day';
-- ---------------------------------------------------------------------------
