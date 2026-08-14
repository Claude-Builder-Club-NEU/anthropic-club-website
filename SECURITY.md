# Security

Audit record and standing posture for the Claude Builders Club website.
Last full audit: **2026-08-13**.

This document exists because a security claim without evidence is worth nothing.
Everything below was measured against this repository, not assumed.

---

## 1. Scope and trust boundaries

This is a **prerendered static site**. There is no server, no database, no
session, no login, and no write path from the public internet into anything the
club owns. That removes most of a conventional web application's attack surface
outright, and it is worth being explicit about what is therefore *not*
applicable rather than leaving a reader to wonder:

| Class | Status | Why |
|---|---|---|
| SQL injection | **N/A** | No database, no query layer |
| Broken authentication / session | **N/A** | No accounts, no sessions, no cookies set by this site |
| IDOR / broken access control | **N/A** | No per-user resources exist to reference |
| Server-side request forgery | **N/A** | No server accepts input at runtime |
| Cross-site scripting | **In scope** | Third-party data is rendered; see §3 |
| Supply chain | **In scope** | npm dependency tree; see §5 |
| Secret exposure | **In scope** | Build-time variables; see §4 |
| Transport / headers | **In scope** | See §6 |

**The one place untrusted data enters** is the Google Calendar ICS feed. That
content is authored by whoever holds the calendar account and arrives over the
network, so it is treated as untrusted regardless of who is expected to write
it. Everything else rendered on the site is authored in this repository.

## 2. Architecture and data flow

```
BUILD TIME (Netlify build container, or a developer's machine)
  Google Calendar public ICS  ──► scripts/fetch-events.mjs ──► events.generated.json
                                    │ strips HTML
                                    │ splits RSVP link from prose
                                    │ rejects any non-http(s) URL   ◄── §3
                                    ▼
                              vite build ──► SSR build ──► prerender ──► dist/

RUN TIME (visitor's browser, static files only)
  dist/  ──► HTML + one CSS bundle + one JS bundle + self-hosted fonts
              │
              ├─► POST https://api.web3forms.com/submit     (workshop pitch form)
              ├─► GET  googletagmanager.com / *.google-analytics.com  (only if VITE_GA_ID set)
              └─► outbound links only: Typeform, Luma, Instagram, LinkedIn, Slack, Google Calendar
```

Nothing is fetched from the club's own infrastructure at run time, because there
is none. The calendar is read once, at build, and baked into the bundle.

## 3. Injection and rendering

- **No `dangerouslySetInnerHTML`, no `innerHTML`, no `eval`, no `new Function`,
  no `document.write`** anywhere in `src/` or `scripts/`. Verified by scan.
  React escapes every interpolated value, which is what makes calendar titles
  and descriptions safe to render as text.
- **URL protocol allowlist.** A calendar entry reaches an `href` in three
  places (the homepage list, the feature tiles, the calendar popover). The
  description parser constrains its own match to `http(s)` by regex, but the ICS
  `URL` property had no such constraint, so a calendar entry reading
  `URL:javascript:...` would have been written straight into an anchor and
  become script execution on click. `safeUrl()` in `scripts/fetch-events.mjs`
  now parses every candidate and admits only `http:` and `https:`. Rejected in
  testing: `javascript:`, mixed-case `JaVaScRiPt:`, `data:text/html`,
  `vbscript:`, `file:`, leading-whitespace variants, and non-URLs.
- **Head injection.** `headFor()` in `src/lib/seo.js` escapes `&`, `<` and `"`
  in every attribute it writes, and JSON-LD is serialised with `<` escaped to
  `<` so a payload cannot break out of the script element.
- **Outbound links.** All 19 `target="_blank"` links carry
  `rel="noopener noreferrer"`. Verified by count, not by sampling.

## 4. Variable and secret mapping

No plaintext secret exists in this repository, in its git history, or in its
build output.

| Variable | Where it lives | Secret? | Notes |
|---|---|---|---|
| `GCAL_ID` | Build environment / `.env` | No | A public calendar address. Never reaches the client bundle: it has no `VITE_` prefix, so only the Node prebuild script sees it |
| `VITE_WEB3FORMS_KEY` | Build environment / `.env` | **No, by design** | `VITE_`-prefixed values are inlined into the client bundle and are public. This key identifies a destination inbox and authorises nothing; abuse is controlled in the Web3Forms dashboard by domain allowlist and rate limit, not by hiding it |
| `VITE_GA_ID` | Build environment / `.env` | No | GA4 measurement IDs are public by design |
| `CALENDAR_ID` | `src/lib/links.js`, committed | No | The same public calendar address, used to build human-facing links. It is an email-shaped string and is therefore visible to scrapers, but it is already public as the calendar's own identifier |

**Rule:** anything genuinely secret must never take a `VITE_` prefix. There is
currently nothing in that category, because the site has no authenticated
integrations.

**Git history.** Scanned across all commits and all reachable blobs for private
keys, cloud tokens, `sk-`/`ghp_`/`xoxb-`/`AIza` shaped credentials, and webhook
URLs. **Nothing found.** One file, `src/.env`, was committed in `ba45c15` and
removed in `2de9847`; it is 14 bytes and reads `N8N_WEBHOOK =` with an **empty
value**, so no credential was ever exposed through this repository. This
corrects a long-standing entry in `HANDOFF.md` which assumed it had been.

`.gitignore` covers `.env`, `.env.*` (with `.env.example` re-included),
`src/.env`, and every AI-harness config directory. `.env` is not tracked.

## 5. Dependencies

| | |
|---|---|
| **Production dependencies** | `npm audit --omit=dev` → **0 vulnerabilities** |
| **Full tree, including dev** | `npm audit` → **0 vulnerabilities** |

Remediated in this audit:

- `react-router-dom` 7.12.0 → **7.18.2**, clearing two **high** severity
  advisories that were present in *production* dependencies, including two open
  redirects (one leading to XSS) reachable through `<Link>` and `useNavigate`,
  which this site uses throughout.
- `vite` 7.3.1 → **7.3.6** plus transitive `rollup`, `yaml` and `launch-editor`,
  clearing nine further advisories. These were build-time only and could not
  affect a deployed visitor, but they are real exposure for anyone running the
  dev server, including the NTLM hash disclosure in `launch-editor` on Windows.

Re-run with `npm audit`. Production dependencies are expected to stay at zero;
treat any regression there as a release blocker.

## 6. Response headers

Set in `netlify.toml` for `/*`. The Content Security Policy was derived from
what the built output actually requests, then verified by serving `dist/` with
the real headers and loading every route.

| Header | Value |
|---|---|
| `Content-Security-Policy` | See `netlify.toml`; `default-src 'self'` with a narrow allowlist |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Permissions-Policy` | Camera, microphone, geolocation, payment, USB, XR and others denied outright |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `SAMEORIGIN`, retained for older browsers alongside `frame-ancestors` |

Two deliberate concessions, both recorded rather than hidden:

- **`style-src 'unsafe-inline'`** is required because React writes layout values
  as inline style attributes. Style injection cannot execute script, and the
  alternative is rewriting every style prop in the codebase for very little
  gain.
- **`preload` is not set on HSTS.** That commits the domain to a
  browser-shipped list which is slow and awkward to reverse, and should be a
  deliberate decision rather than a side effect of a header edit.

Scripts get **no** `'unsafe-inline'`. The only inline `<script>` tags are
`application/ld+json`, which is data and is never executed, so no nonce or hash
is needed.

### Verification performed

`dist/` was served with the exact shipping headers and every route loaded in a
browser. Result: **zero policy violations** on `/`, `/about`, `/events` and
`/events/pitch`, with hydration, fonts, styles, the calendar popover, the
feature tiles, the filters and the pitch flow all exercised. Enforcement was
proved positively by attempting a request to a host outside the allowlist,
which was correctly blocked by `connect-src`.

## 7. Deliberately out of scope

The strategy document that prompted this audit is written largely for hardening
an **agent workflow**, not a static marketing site. The following were read and
consciously not adopted:

- **ZeroPath, Snyk, Sonatype, Semgrep, Aikido MCP.** All are commercial or
  account-bound services. Introducing a paid vendor is a budget and data-sharing
  decision for the club to make, not something to enable unilaterally. `npm
  audit` already gives this project's dependency tree full CVE coverage at zero
  cost; the AI-native SAST these tools offer targets business-logic flaws
  (IDOR, broken auth, race conditions) in classes of application this one does
  not have.
- **`.claude/settings.json` deny rules and hooks.** These harden a developer's
  local agent environment. `.claude/` is gitignored here as personal
  configuration, so it is a per-developer setup rather than a repository change.
- **PCI DSS 4.0, SOC 2, GDPR citation mapping.** The site processes no payments,
  stores nothing, and sets no cookies of its own. Analytics runs only when
  `VITE_GA_ID` is set and is configured with `anonymize_ip`. If a cookie banner
  or any personal-data storage is ever added, that changes and this section must
  be revisited.

## 8. Standing checks

```bash
npm audit --omit=dev          # production deps: must stay at 0
npm audit                     # full tree
npm run lint                  # ESLint
npm run build                 # must succeed before any deploy
```

For header changes, re-run the CSP verification rather than trusting the policy
by inspection: serve `dist/` with the headers from `netlify.toml` and confirm no
`securitypolicyviolation` fires on any route.
