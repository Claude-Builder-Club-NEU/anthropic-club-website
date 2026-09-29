/**
 * hackathon.sql, executed and exercised against a real Postgres (PGlite).
 *
 *   npm run test:hackathon-db
 *
 * What it checks, because none of it can be seen by reading the file:
 *
 *   1. The file executes, and executes twice (it is re-run by hand).
 *   2. anon can execute NONE of the hackathon functions and cannot read the
 *      table. The browser never holds a key that reaches this data.
 *   3. Seats are only taken by paid rows, numbered in order, and the 101st
 *      payment is moved to the waitlist with a refund due rather than seated.
 *   4. confirm is idempotent (webhook and ticket page both call it) and
 *      refuses a session id that is not the row's own.
 *   5. A second payment for an email that already has a seat is refunded and
 *      the original seat is untouched.
 */
import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const db = await PGlite.create({ extensions: { citext, pgcrypto } });

let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
};

await db.exec(`
  do $$ begin
    if not exists (select 1 from pg_roles where rolname='anon') then create role anon; end if;
    if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
    if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role; end if;
  end $$;
`);

await db.exec(readFileSync(join(HERE, "schema.sql"), "utf8"));

console.log("\n== Running hackathon.sql twice ==");
const sql = readFileSync(join(HERE, "hackathon.sql"), "utf8");
try {
  await db.exec(sql);
  await db.exec(sql);
  ok("hackathon.sql executes, and re-runs cleanly", true);
} catch (e) {
  console.log("  hackathon.sql FAILED:", e.message);
  process.exit(1);
}

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
const attach = (id, s) => db.query(`select public.hackathon_attach_session($1,$2)`, [id, s]);
const confirm = async (id, s) =>
  (await one(`select public.hackathon_confirm($1,$2,$3,$4) as r`, [id, s, `pi_${s}`, 500])).r;
const seats = async () => (await one(`select public.hackathon_seats() as r`)).r;

console.log("\n== Validation ==");
ok("gmail is refused", (await register({ email: "x@gmail.com" })).reason === "email_domain");
ok("suffix trick is refused",
  (await register({ email: "a@gmail.com.b@northeastern.edu" })).reason === "email_invalid");
ok("short phone is refused", (await register({ phone: "555-0142" })).reason === "phone_invalid");
ok("non-LinkedIn URL is refused",
  (await register({ linkedin: "https://example.com/in/x" })).reason === "linkedin_invalid");
ok("formula name is refused", (await register({ name: "=HYPERLINK()" })).reason === "name_invalid");
ok("no consent is refused", (await register({ consent: false })).reason === "consent_required");
ok("gif headshot is refused", (await register({ ext: "gif" })).reason === "headshot_type");

const first = await register();
ok("valid registration is accepted", first.ok === true && first.full === false, JSON.stringify(first));
ok("paths are fixed under the row id",
  first.resume_path === `${first.id}/resume.pdf` && first.headshot_path === `${first.id}/headshot.jpg`);
const stored = await one(`select phone, linkedin_url, status from public.hackathon_registrations where id=$1`, [first.id]);
ok("phone normalised to E.164", stored.phone === "+16175550142", stored.phone);
ok("LinkedIn normalised", stored.linkedin_url === "https://www.linkedin.com/in/winston-smith/", stored.linkedin_url);
ok("row starts pending and takes no seat", stored.status === "pending" && (await seats()).taken === 0);

console.log("\n== Confirm ==");
await attach(first.id, "cs_1");
ok("wrong session is refused", (await confirm(first.id, "cs_forged")).reason === "session_mismatch");
const t1 = await confirm(first.id, "cs_1");
ok("paid row gets spot 1", t1.status === "paid" && t1.spot === 1, JSON.stringify(t1));
const t1again = await confirm(first.id, "cs_1");
ok("confirm is idempotent", t1again.spot === 1 && (await seats()).taken === 1);
ok("ticket by token", (await one(`select public.hackathon_ticket($1) as r`, [t1.token])).r.name === "Winston Smith");
ok("same email cannot register again",
  (await register({ email: "SMITH.W@northeastern.edu" })).reason === "already_registered");

console.log("\n== Duplicate payment ==");
// Two tabs: both filled in before either paid.
await db.query(`update public.hackathon_registrations set status='pending', spot=null, paid_at=null where id=$1`, [first.id]);
const tabA = first;
const tabB = await register();
await attach(tabB.id, "cs_b");
await confirm(tabA.id, "cs_1");
const dup = await confirm(tabB.id, "cs_b");
ok("second payment is a refunded duplicate", dup.status === "duplicate" && dup.refunded === true, JSON.stringify(dup));
ok("the first seat is untouched", (await seats()).taken === 1);

console.log("\n== Filling the room ==");
for (let i = 2; i <= 100; i += 1) {
  const r = await register({ email: `p${i}@northeastern.edu` });
  await attach(r.id, `cs_${i}`);
  await confirm(r.id, `cs_${i}`);
}
const s100 = await seats();
ok("100 seats taken", s100.taken === 100 && s100.capacity === 100, JSON.stringify(s100));
const lateA = await register({ email: "late@northeastern.edu" });
ok("register reports full", lateA.ok && lateA.full === true);
await attach(lateA.id, "cs_late");
const lost = await confirm(lateA.id, "cs_late");
ok("101st payment goes to the waitlist with a refund due",
  lost.status === "waitlist" && lost.waitlist_position === 1 && lost.refunded === true, JSON.stringify(lost));
ok("still 100 seats", (await seats()).taken === 100);

const w = await register({ email: "wait@northeastern.edu" });
const wt = (await one(`select public.hackathon_join_waitlist($1) as r`, [w.id])).r;
ok("free waitlist place is next in line", wt.status === "waitlist" && wt.waitlist_position === 2, JSON.stringify(wt));
const spots = await one(`select count(distinct spot)::int n, max(spot) m from public.hackathon_registrations where status='paid'`);
ok("spots are 1..100 with no repeats", spots.n === 100 && spots.m === 100, JSON.stringify(spots));

console.log("\n== anon has nothing ==");
await db.exec(`set role anon`);
for (const q of [
  `select * from public.hackathon_registrations`,
  `select public.hackathon_seats()`,
  `select public.hackathon_register('a','a@northeastern.edu','6175550100','first','khoury','linkedin.com/in/aa','',true,'jpg')`,
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
ok("service_role can call the functions", svc);
await db.exec(`reset role`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
