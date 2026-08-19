# Security

Audit record and standing posture for the Claude Builders Club website.

- Last full audit of the static site: **2026-08-13**
- Attendance and polls added, posture rewritten: **2026-08-19**

This document exists because a security claim without evidence is worth nothing.
Everything below was measured against this repository, not assumed. Where
something has **not** been verified, it says so.

---

## 0. What changed, and why this document was rewritten rather than amended

Until 2026-08-19 the first line of this file said the site had *no server, no
database, and no write path from the public internet*. That was the whole of its
security story, and it is no longer true.

Two features changed it:

- **Attendance** (`/attendance`) writes a row containing a student's **name and
  Northeastern email** every time somebody checks in to a session.
- **Polls** (`/polls`) writes an anonymous ballot.

Both post to a Supabase Postgres database. Adding a write path and a store of
student personal data is a change of kind, not of degree: whole classes of risk
that this file previously marked **N/A** are now live, and the sections below
were rewritten on that basis. Amending the old text would have left a document
whose opening premise contradicted its own tables.

> **Status:** the schema, the policies and the client are written and reviewed;
> they have **not yet been run against a live Supabase project**. Nothing in §3
> is confirmed by execution. Re-verify every claim there on the day the project
> is created, and update this line.

---

## 1. Scope and trust boundaries

Still a **prerendered static site** for everything a visitor reads. What is new
is that two routes talk to a database at run time.

| Class | Status | Where it is handled |
|---|---|---|
| SQL injection | **In scope** | §3.2 — parameterised RPC only, no string-built SQL |
| Broken access control | **In scope** | §3.1 — RLS deny-all, two functions as the whole API |
| Personal data exposure | **In scope** | §3.3 — names and emails now stored |
| Ballot integrity / stuffing | **In scope, PARTIALLY MITIGATED** | §3.4 — known residual risk |
| Broken authentication / session | **N/A** | Still no accounts, no passwords, no sessions, no cookies set by this site |
| Server-side request forgery | **N/A** | No server of ours accepts a URL to fetch |
| Cross-site scripting | **In scope** | §4 |
| Supply chain | **In scope** | §6 |
| Secret exposure | **In scope** | §5 |
| Transport / headers | **In scope** | §7 |

**Untrusted input now enters in three places**, not one:

1. The Google Calendar ICS feed, at build time (unchanged, §4).
2. The check-in form: a room code, a name and an email, from anyone on the
   internet who loads `/attendance`.
3. The ballot: an answers object, from anyone who loads a poll URL.

Two and three are anonymous and unauthenticated by design. They are treated as
hostile input in every case.

## 2. Architecture and data flow

```
BUILD TIME (Netlify build container, or a developer's machine)
  Google Calendar public ICS  ──► scripts/fetch-events.mjs ──► events.generated.json
                                    │ strips HTML
                                    │ splits RSVP link from prose
                                    │ rejects any non-http(s) URL   ◄── §4
                                    ▼
  src/lib/polls/*.json  ─────────► vite build ──► SSR build ──► prerender ──► dist/
  (poll definitions live in git, not in the database)

RUN TIME (visitor's browser)
  dist/  ──► HTML + one CSS bundle + one JS bundle + self-hosted fonts
              │
              ├─► POST api.web3forms.com/submit                 (workshop pitch)
              ├─► POST <project>.supabase.co/rest/v1/rpc/check_in        ◄── NEW
              ├─► POST <project>.supabase.co/rest/v1/rpc/current_session ◄── NEW
              ├─► POST <project>.supabase.co/rest/v1/rpc/cast_ballot     ◄── NEW
              ├─► POST <project>.supabase.co/rest/v1/rpc/poll_results    ◄── NEW
              ├─► GET  googletagmanager.com / *.google-analytics.com  (only if VITE_GA_ID)
              └─► outbound links only: Typeform, Luma, Instagram, LinkedIn, Slack, Google Calendar
```

The four RPC endpoints are the **entire** public API. No table is reachable
directly. See §3.1 for why that is enforced rather than merely intended.

## 3. The database

### 3.1 Access control: deny by default, and never grant

`supabase/schema.sql` and `supabase/polls.sql` both:

1. `alter table ... enable row level security` on every table, and
2. define **no policies at all** for the `anon` role, and
3. `revoke all` on those tables from `anon` and `authenticated`.

With RLS enabled and zero policies, the anon role can do nothing to any table
directly. **That absence is the access-control model**, not an oversight. Every
capability the browser has is a `SECURITY DEFINER` function, which runs as its
owner and so bypasses RLS in one reviewable place:

| Function | Reads | Writes | Notes |
|---|---|---|---|
| `current_session()` | session meta | — | **Never returns the room code** |
| `check_in(code, name, email)` | the caller's own card | one check-in row | Returns nobody else's row |
| `cast_ballot(slug, answers)` | — | one ballot row | Returns only `{ ok }` |
| `poll_results(slug)` | aggregate counts | — | Counts, never rows; drops write-in text |

**No function returns a roster.** There is deliberately no way to ask this
schema who attended, because the anon key is public by construction (§5) and a
roster is precisely what a stranger holding that key must not be able to read.

This is also why the officer roster view (mockup 2B) is **not built**: it reads
other people's rows by definition, so it requires an authenticated role. Adding
it behind the anon key would silently invalidate this entire section.

### 3.2 Injection

All database access goes through PostgREST RPC with **named JSON parameters**.
No SQL is assembled from user input anywhere in `src/` or in the schema; the
function bodies use parameters (`p_code`, `p_email`, …) and never string
concatenation. `search_path` is pinned on every `SECURITY DEFINER` function,
which closes the standard privilege-escalation route where a caller shadows a
referenced object with one in a schema they control.

### 3.3 Personal data

**This is new and it is the most consequential change in this document.** The
`checkins` table stores a student's name and Northeastern email address.

| Decision | Where | Rationale |
|---|---|---|
| Email normalised to lowercase and trimmed on write | `check_in()` and `src/lib/attendance.js` | One person is one card, not two half-cards |
| `citext` column plus unique index on `(session_id, email)` | `schema.sql` | One stamp per session, enforced in the database rather than the browser |
| Domain allowlist: `northeastern.edu`, `husky.neu.edu`, `neu.edu` | both layers | Matches what the pitch form already accepts |
| No password, no account, no session | by design | Nothing to breach, nothing to reset, nothing to leave behind at handover |

**Open and unresolved, for the club rather than for code:**

- **Retention.** Nothing deletes old check-ins. A term's roster persists
  indefinitely unless somebody removes it. A retention rule should be decided
  and then implemented, not left to accumulate across graduating cohorts.
- **Who can read it.** Today: nobody through the website, and anyone with the
  Supabase dashboard login. That is a much smaller group than "the internet",
  but it is not zero, and it will change hands with the exec board.
- **Confirmation emails.** The spec describes emailing a card copy. Nothing
  sends mail today; when it does, the sending credential is genuinely secret and
  must never take a `VITE_` prefix (§5).

### 3.4 Ballot integrity — known residual risk

Polls are anonymous by design: no email, no name, no IP, and `created_at` is
rounded to the hour so submission order cannot be reconstructed from
second-level timestamps in a room where an observer knows who pressed submit
when.

The direct cost, stated plainly:

- **There is no dedupe and there cannot be.** Deduping requires identifying the
  voter, which is the thing this feature has chosen not to do. A second device
  or a cleared browser can vote again.
- **Ballot stuffing is possible.** `cast_ballot` is an unauthenticated write
  with no rate limit, so a script could post thousands of ballots. The only
  current mitigations are an 8KB size ceiling on the answers object and the fact
  that a poll allocates nothing worth attacking.
- **The open/closed window is enforced only in the browser.** Poll definitions
  live in git, so `cast_ballot()` cannot know when a poll opens and will accept
  a late or early POST.

**All three are acceptable only while a ballot decides nothing scarce.** Before
a poll allocates limited seats, a trip, or anything else worth gaming: move the
window into the database, add a rate limit, and issue one-time ballot codes at
the door against the attendance list. That last one preserves anonymity — the
ballot still stores no address — and is the recommended path.

## 4. Injection and rendering (static site, unchanged)

- **No `dangerouslySetInnerHTML`, no `innerHTML`, no `eval`, no `new Function`,
  no `document.write`** anywhere in `src/` or `scripts/`. React escapes every
  interpolated value, which is what makes calendar titles and descriptions safe
  to render as text. This still holds for the new surfaces: check-in and ballot
  values are rendered as text, never as markup.
- **URL protocol allowlist.** `safeUrl()` in `scripts/fetch-events.mjs` parses
  every candidate calendar URL and admits only `http:` and `https:`. Rejected in
  testing: `javascript:`, mixed-case `JaVaScRiPt:`, `data:text/html`,
  `vbscript:`, `file:`, leading-whitespace variants, and non-URLs.
- **Head injection.** `headFor()` in `src/lib/seo.js` escapes `&`, `<` and `"`
  in every attribute it writes, and JSON-LD is serialised with `<` escaped.
- **Outbound links** carry `rel="noopener noreferrer"` on every
  `target="_blank"`.

## 5. Variable and secret mapping

No plaintext secret exists in this repository, in its git history, or in its
build output.

| Variable | Where it lives | Secret? | Notes |
|---|---|---|---|
| `GCAL_ID` | Build environment / `.env` | No | Public calendar address. No `VITE_` prefix, so only the Node prebuild script sees it |
| `VITE_WEB3FORMS_KEY` | Build environment / `.env` | **No, by design** | Inlined into the client bundle. Identifies a destination inbox and authorises nothing |
| `VITE_GA_ID` | Build environment / `.env` | No | GA4 measurement IDs are public by design |
| `VITE_SUPABASE_URL` | Build environment / `.env` | No | The project's public REST origin |
| `VITE_SUPABASE_ANON_KEY` | Build environment / `.env` | **No, by design** | Inlined into the client bundle. Safe **only because of §3.1**: RLS grants it nothing and it can reach four functions, none of which returns another person's data |
| `CALENDAR_ID` | `src/lib/links.js`, committed | No | The same public calendar address |
| `SUPABASE_SERVICE_ROLE_KEY` | **nowhere** | **YES** | Bypasses RLS entirely. Must never appear in this repository, in any `VITE_` variable, or in a Netlify build variable for this site |

**Rule:** anything genuinely secret must never take a `VITE_` prefix.

The anon key's safety is **conditional on the access-control model holding**. If
a permissive policy is ever added to a table, or a function is added that
returns rows belonging to somebody else, that key stops being safe to publish
and this table becomes wrong. Treat any new `create policy` statement as a
change to this document.

**Git history.** Scanned across all commits and reachable blobs for private
keys, cloud tokens, `sk-`/`ghp_`/`xoxb-`/`AIza` shaped credentials, and webhook
URLs. **Nothing found.** One file, `src/.env`, was committed in `ba45c15` and
removed in `2de9847`; it is 14 bytes and reads `N8N_WEBHOOK =` with an **empty
value**, so no credential was ever exposed through this repository.

`.gitignore` covers `.env`, `.env.*` (with `.env.example` re-included),
`src/.env`, and every AI-harness config directory.

## 6. Dependencies

| | |
|---|---|
| **Production dependencies** | `npm audit --omit=dev` → **0 vulnerabilities** |
| **Full tree, including dev** | `npm audit` → **0 vulnerabilities** |

The database client is **hand-written** (`src/lib/supabase.js`, about forty
lines of `fetch`) rather than `@supabase/supabase-js`. The entire need is "POST
a JSON body to one RPC endpoint", and adding an SDK would have introduced a
production dependency and its transitive tree to wrap a call that fits on a
screen. Fewer dependencies is the cheapest supply-chain control available.

Previously remediated: `react-router-dom` 7.12.0 → **7.18.2**, clearing two
**high** severity advisories in production dependencies including open redirects
reachable through `<Link>` and `useNavigate`; and `vite` 7.3.1 → **7.3.6** plus
transitive packages, clearing nine build-time advisories.

Production dependencies are expected to stay at zero; treat any regression there
as a release blocker.

## 7. Response headers

Set in `netlify.toml` for `/*`.

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'` with a narrow allowlist |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Permissions-Policy` | Camera, microphone, geolocation, payment, USB, XR and others denied outright |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `SAMEORIGIN`, retained for older browsers alongside `frame-ancestors` |

**`connect-src` now names the Supabase project host.** It is a named host and
not `https://*.supabase.co` on purpose: the wildcard would let this origin talk
to *any* Supabase project, including one an attacker controls, which is most of
what `connect-src` exists to prevent here.

> **Outstanding:** the host in `netlify.toml` is still the placeholder
> `https://YOUR-PROJECT-REF.supabase.co`. Until it is replaced, `/attendance`
> and the ballot fail in the browser with a CSP violation that looks like a form
> bug and is not.

Two deliberate concessions, recorded rather than hidden:

- **`style-src 'unsafe-inline'`** is required because React writes layout values
  as inline style attributes. Style injection cannot execute script.
- **`preload` is not set on HSTS.** It commits the domain to a browser-shipped
  list that is slow to reverse, and should be a deliberate decision.

Scripts get **no** `'unsafe-inline'`. The only inline `<script>` tags are
`application/ld+json`, which is data and is never executed.

### Verification performed

The 2026-08-13 audit served `dist/` with the exact shipping headers and loaded
every route: **zero policy violations** on `/`, `/about`, `/events` and
`/events/pitch`, with enforcement proved positively by a blocked request to a
host outside the allowlist.

**That verification predates attendance and polls and has not been repeated.**
It must be re-run once the Supabase host is real, covering `/attendance`,
`/polls` and a ballot, including a successful RPC round trip.

## 8. Deliberately out of scope

- **Commercial SAST (ZeroPath, Snyk, Sonatype, Semgrep, Aikido).** Account-bound
  or paid; introducing a vendor is a budget and data-sharing decision for the
  club. `npm audit` gives this dependency tree full CVE coverage at no cost.
  Note the reasoning has weakened slightly: the AI-native SAST these tools offer
  targets business-logic flaws in exactly the classes this site now *does* have.
  Worth revisiting if the officer surface lands.
- **PCI DSS, SOC 2.** No payments, no cardholder data.
- **GDPR / FERPA citation mapping.** The site now stores personal data of
  identifiable students, so the previous "stores nothing" justification no
  longer applies. This has **not** been assessed. Before the roster view exists
  and before any card is emailed, someone should decide what the club is
  claiming about retention, access and deletion, and write it somewhere a
  student can read.

## 9. Standing checks

```bash
npm audit --omit=dev          # production deps: must stay at 0
npm audit                     # full tree
npm run lint                  # ESLint
npm run build                 # must succeed before any deploy
```

For header changes, re-run the CSP verification rather than trusting the policy
by inspection: serve `dist/` with the headers from `netlify.toml` and confirm no
`securitypolicyviolation` fires on any route.

For database changes, the check is narrower and more important: **confirm that
no `create policy` statement exists and that no function returns a row belonging
to anyone but its caller.** Those two properties are what make the published
anon key safe.
