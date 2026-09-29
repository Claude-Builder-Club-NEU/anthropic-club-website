/**
 * hackathon.sql, executed and exercised against a real Postgres (PGlite).
 *
 *   npm run test:hackathon-db
 *
 * What it checks, because none of it can be seen by reading the file:
 *
 *   1. The file executes, and executes twice (it is re-run by hand).
 *   2. anon can execute NONE of the hackathon functions and cannot read the
 *      table; the officer tools are not even callable by the service role.
 *   3. FREE MODE (payments off): the first 100 claims are seated with the fee
 *      owed, the 101st is waitlisted, and claim is idempotent.
 *   4. Releasing an unpaid seat hands the same seat number to the front of
 *      the waitlist; release_unpaid does that for every unpaid seat and does
 *      not release the people it just promoted.
 *   5. STRIPE MODE: confirm is idempotent, refuses a forged session id, seats
 *      with the fee paid, refunds a duplicate, and waitlists and refunds the
 *      payment that loses the race for the last seat.
 */
import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
};

async function fresh() {
  const db = await PGlite.create({ extensions: { citext, pgcrypto } });
  await db.exec(`
    do $$ begin
      if not exists (select 1 from pg_roles where rolname='anon') then create role anon; end if;
      if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
      if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role; end if;
    end $$;
  `);
  await db.exec(readFileSync(join(HERE, "schema.sql"), "utf8"));
  const sql = readFileSync(join(HERE, "hackathon.sql"), "utf8");
  await db.exec(sql);
  await db.exec(sql);
  return db;
}

function helpers(db) {
  const one = async (q, params = []) => (await db.query(q, params)).rows[0];
  const register = async (o = {}) => (await one(
    `select public.hackathon_register($1,$2,$3,$4,$5,$6,$7,$8,$9) as r`,
    [
      o.name ?? "Winston Smith",
      o.email ?? "smith.w@northeastern.edu",
      o.phone ?? "(617) 555-0142",
      o.year ?? "third",
      o.college ?? "khoury",
      o.linkedin ?? "linkedin.com/in/winston-smith?utm_source=x",
      o.dietary ?? "",
      o.consent ?? true,
      o.ext ?? "jpg",
    ],
  )).r;
  return {
    one,
    register,
    claim: async (id) => (await one(`select public.hackathon_claim($1) as r`, [id])).r,
    attach: (id, s) => db.query(`select public.hackathon_attach_session($1,$2)`, [id, s]),
    confirm: async (id, s) =>
      (await one(`select public.hackathon_confirm($1,$2,$3,$4) as r`, [id, s, `pi_${s}`, 500])).r,
    seats: async () => (await one(`select public.hackathon_seats() as r`)).r,
    ticket: async (t) => (await one(`select public.hackathon_ticket($1) as r`, [t])).r,
    release: async (e) => (await one(`select public.hackathon_release($1) as r`, [e])).r,
    markPaid: async (e) => (await one(`select public.hackathon_mark_fee_paid($1) as r`, [e])).r,
    releaseUnpaid: async () => (await one(`select public.hackathon_release_unpaid() as r`)).r,
  };
}

// ---------------------------------------------------------------------------

console.log("\n== Runs, and re-runs ==");
let db;
try {
  db = await fresh();
  ok("hackathon.sql executes, and re-runs cleanly", true);
} catch (e) {
  console.log("  hackathon.sql FAILED:", e.message);
  process.exit(1);
}
let h = helpers(db);

console.log("\n== Validation ==");
ok("gmail is refused", (await h.register({ email: "x@gmail.com" })).reason === "email_domain");
ok("suffix trick is refused",
  (await h.register({ email: "a@gmail.com.b@northeastern.edu" })).reason === "email_invalid");
ok("short phone is refused", (await h.register({ phone: "555-0142" })).reason === "phone_invalid");
ok("non-LinkedIn URL is refused",
  (await h.register({ linkedin: "https://example.com/in/x" })).reason === "linkedin_invalid");
ok("formula name is refused", (await h.register({ name: "=HYPERLINK()" })).reason === "name_invalid");
ok("no consent is refused", (await h.register({ consent: false })).reason === "consent_required");
ok("gif headshot is refused", (await h.register({ ext: "gif" })).reason === "headshot_type");

const first = await h.register();
ok("valid registration is accepted", first.ok === true && first.full === false, JSON.stringify(first));
const stored = await h.one(`select phone, linkedin_url, status from public.hackathon_registrations where id=$1`, [first.id]);
ok("phone normalised to E.164", stored.phone === "+16175550142", stored.phone);
ok("LinkedIn normalised", stored.linkedin_url === "https://www.linkedin.com/in/winston-smith/", stored.linkedin_url);
ok("row starts pending and takes no seat", stored.status === "pending" && (await h.seats()).taken === 0);

console.log("\n== Free mode: claim ==");
const t1 = await h.claim(first.id);
ok("claim seats with the fee owed", t1.status === "seated" && t1.spot === 1 && t1.fee_paid === false && t1.fee_cents === 500, JSON.stringify(t1));
ok("claim is idempotent", (await h.claim(first.id)).spot === 1 && (await h.seats()).taken === 1);
ok("ticket by token", (await h.ticket(t1.token)).name === "Winston Smith");
ok("same email cannot register again",
  (await h.register({ email: "SMITH.W@northeastern.edu" })).reason === "already_registered");

for (let i = 2; i <= 100; i += 1) {
  const r = await h.register({ email: `p${i}@northeastern.edu`, name: `Person ${i}` });
  await h.claim(r.id);
}
ok("100 seats taken", (await h.seats()).taken === 100);
const w1 = await h.register({ email: "w1@northeastern.edu", name: "Wait One" });
ok("register reports full", w1.full === true);
const wt1 = await h.claim(w1.id);
ok("101st claim is waitlist #1, free", wt1.status === "waitlist" && wt1.waitlist_position === 1 && wt1.spot === null, JSON.stringify(wt1));
const w2 = await h.register({ email: "w2@northeastern.edu", name: "Wait Two" });
const wt2 = await h.claim(w2.id);
const w3 = await h.register({ email: "w3@northeastern.edu", name: "Wait Three" });
await h.claim(w3.id);
ok("next is waitlist #2", wt2.waitlist_position === 2);

console.log("\n== Officer tools ==");
ok("mark fee paid", (await h.markPaid("p5@northeastern.edu")).ok === true);
ok("ticket shows fee paid",
  (await h.one(`select public.hackathon_ticket_json(r) as j from public.hackathon_registrations r where email='p5@northeastern.edu'`)).j.fee_paid === true);

const rel = await h.release("p7@northeastern.edu");
ok("release frees seat 7 and promotes waitlist #1 into it",
  rel.ok && rel.promoted?.email === "w1@northeastern.edu" && rel.promoted?.spot === 7, JSON.stringify(rel));
ok("promoted ticket now shows seat 7", (await h.ticket(wt1.token)).spot === 7 && (await h.ticket(wt1.token)).status === "seated");
ok("still 100 seated", (await h.seats()).taken === 100);
ok("released person's ticket says released",
  (await h.one(`select status, spot from public.hackathon_registrations where email='p7@northeastern.edu'`)).status === "released");
ok("released email can register again", (await h.register({ email: "p7@northeastern.edu" })).ok === true);

// Deadline: everyone unpaid goes except p5 (paid) and the w1 promotion, which
// predates this run and is itself unpaid -> it IS released. Mark w1 paid first
// to keep it.
await h.markPaid("w1@northeastern.edu");
for (let i = 2; i <= 100; i += 1) if (i !== 5 && i !== 7 && i % 10 === 0) await h.markPaid(`p${i}@northeastern.edu`);
const before = (await h.one(`select count(*)::int n from public.hackathon_registrations where status='seated' and fee_paid_at is null`)).n;
const out = await h.releaseUnpaid();
ok("release_unpaid releases every unpaid seat", out.length === before, `${out.length} vs ${before}`);
const promoted = out.filter((o) => o.promoted).map((o) => o.promoted.email);
ok("waitlist #2 and #3 promoted in order", promoted[0] === "w2@northeastern.edu" && promoted[1] === "w3@northeastern.edu", JSON.stringify(promoted));
const after = await h.one(`select count(*) filter (where status='seated')::int seated,
                                  count(*) filter (where status='seated' and fee_paid_at is null)::int unpaid
                           from public.hackathon_registrations`);
// 11 marked paid (p5, p10..p100) + w1 + the 2 promoted in this run.
ok("promoted-in-this-run are kept (2 unpaid seats left)", after.unpaid === 2 && after.seated === 14, JSON.stringify(after));
const spots = await h.one(`select count(distinct spot)::int n, max(spot) m from public.hackathon_registrations where status='seated'`);
ok("no duplicate seat numbers, none above 100", spots.n === after.seated && spots.m <= 100, JSON.stringify(spots));
const lowest = (await h.one(`select min(n)::int n from generate_series(1,100) n
  where n not in (select spot from public.hackathon_registrations where status='seated')`)).n;
const nr = await h.register({ email: "new@northeastern.edu" });
const nt = await h.claim(nr.id);
ok("new claim takes the lowest free seat number", nt.status === "seated" && nt.spot === lowest, `${nt.spot} vs ${lowest}`);

console.log("\n== Stripe mode ==");
db = await fresh();
h = helpers(db);
const a = await h.register();
await h.attach(a.id, "cs_1");
ok("wrong session is refused", (await h.confirm(a.id, "cs_forged")).reason === "session_mismatch");
const c1 = await h.confirm(a.id, "cs_1");
ok("paid row is seated with the fee paid", c1.status === "seated" && c1.spot === 1 && c1.fee_paid === true, JSON.stringify(c1));
ok("confirm is idempotent", (await h.confirm(a.id, "cs_1")).spot === 1 && (await h.seats()).taken === 1);

await db.query(`update public.hackathon_registrations set status='pending', spot=null, paid_at=null, fee_paid_at=null where id=$1`, [a.id]);
const b = await h.register();
await h.attach(b.id, "cs_b");
await h.confirm(a.id, "cs_1");
const dup = await h.confirm(b.id, "cs_b");
ok("second payment is a refunded duplicate", dup.status === "duplicate" && dup.refunded === true, JSON.stringify(dup));

for (let i = 2; i <= 100; i += 1) {
  const r = await h.register({ email: `p${i}@northeastern.edu` });
  await h.attach(r.id, `cs_${i}`);
  await h.confirm(r.id, `cs_${i}`);
}
const late = await h.register({ email: "late@northeastern.edu" });
await h.attach(late.id, "cs_late");
const lost = await h.confirm(late.id, "cs_late");
ok("101st payment goes to the waitlist with a refund due",
  lost.status === "waitlist" && lost.waitlist_position === 1 && lost.refunded === true, JSON.stringify(lost));
ok("still 100 seats", (await h.seats()).taken === 100);

console.log("\n== Grants ==");
await db.exec(`set role anon`);
for (const q of [
  `select * from public.hackathon_registrations`,
  `select public.hackathon_seats()`,
  `select public.hackathon_claim(gen_random_uuid())`,
  `select public.hackathon_confirm(gen_random_uuid(),'x','y',500)`,
]) {
  let denied = false;
  try { await db.query(q); } catch { denied = true; }
  ok(`anon denied: ${q.slice(7, 60)}`, denied);
}
await db.exec(`reset role`);

await db.exec(`set role service_role`);
let svc = false;
try { await db.query(`select public.hackathon_seats()`); svc = true; } catch { /* denied */ }
ok("service_role can call the site's functions", svc);
let officer = false;
try { await db.query(`select public.hackathon_release_unpaid()`); officer = true; } catch { /* denied */ }
ok("service_role cannot call the officer tools", !officer);
await db.exec(`reset role`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
