/**
 * signups.sql, executed and exercised against a real Postgres.
 *
 *   npm run test:db
 *
 * WHY THIS EXISTS. This repository's rule is that a claim without evidence is
 * worth nothing (README, "Never fabricate proof"). supabase/signups.sql makes
 * four claims that are load-bearing for the club's privacy posture and that
 * nobody can check by reading it:
 *
 *   1. It executes at all. It is pasted by hand into the Supabase SQL editor,
 *      by an officer, once, and a syntax error found there is found in front of
 *      a broken form.
 *   2. anon can execute submit_signup and NOTHING else, and cannot read the
 *      table. The anon key is public, so this is the whole reason the roster is
 *      safe to store.
 *   3. submit_signup answers identically whether or not the address is already
 *      on file. That is the no-oracle rule, and it is one friendly error
 *      message away from being broken by accident.
 *   4. The mailing-list export excludes anyone in public.unsubscribes. Getting
 *      this wrong means mailing people who asked the club to stop.
 *
 * PGlite is Postgres compiled to WebAssembly, so this is not a mock or a
 * parser: it runs the real files, with the real citext and pgcrypto extensions,
 * and calls the real function. It is a devDependency and ships nothing to the
 * browser.
 *
 * WHAT IT DOES NOT PROVE: that the club's actual Supabase project has had these
 * files run against it. Nothing here can reach that project, and the anon key
 * in .env.local could not create a table if it did. Run signups.sql in the SQL
 * editor; this file is what tells you it will work when you do.
 */
import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Resolved from this file's own location, so it runs from any working directory.
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..");
const db = await PGlite.create({ extensions: { citext, pgcrypto } });

let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
};

// PGlite's anon/authenticated roles do not exist; create them so the grants in
// the real files execute exactly as written rather than being edited for the test.
await db.exec(`
  do $$ begin
    if not exists (select 1 from pg_roles where rolname='anon') then create role anon; end if;
    if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
  end $$;
`);

console.log("\n== Running schema.sql (for is_member_email) ==");
try {
  await db.exec(readFileSync(`${REPO}/supabase/schema.sql`, "utf8"));
  console.log("  schema.sql executed");
} catch (e) { console.log("  schema.sql FAILED:", e.message); process.exit(1); }

console.log("\n== Running signups.sql ==");
try {
  await db.exec(readFileSync(`${REPO}/supabase/signups.sql`, "utf8"));
  console.log("  signups.sql executed with no errors");
  pass++;
} catch (e) {
  console.log("  signups.sql FAILED:", e.message);
  process.exit(1);
}

const call = async (args) => {
  const r = await db.query(
    `select public.submit_signup($1,$2,$3,$4,$5,$6) as r`,
    [args.name, args.email, args.year, args.colleges, args.days, args.interests]
  );
  return r.rows[0].r;
};

const GOOD = {
  name: "Jordan Alvarez",
  email: "Alvarez.J@northeastern.edu",
  year: "third",
  colleges: ["khoury", "dmsb"],
  days: ["tuesday", "thursday"],
  interests: ["hackathons", "workshops"],
};

console.log("\n== Happy path ==");
ok("valid signup returns {ok:true}", JSON.stringify(await call(GOOD)) === '{"ok":true}');

let row = (await db.query(`select * from public.signups`)).rows[0];
ok("one row written", (await db.query(`select count(*)::int c from public.signups`)).rows[0].c === 1);
ok("email lowercased on write", row.email === "alvarez.j@northeastern.edu", `got ${row.email}`);
ok("colleges stored as array", Array.isArray(row.colleges) && row.colleges.length === 2);
ok("term computed server side", /^(fall|spring)-\d{4}$/.test(row.term), `got ${row.term}`);
ok("submissions starts at 1", row.submissions === 1);
ok("source defaults to web", row.source === "web");
ok("added_to_list_at starts null", row.added_to_list_at === null);

console.log("\n== Upsert: same person, same term ==");
await call({ ...GOOD, days: ["monday"], interests: ["social"] });
const after = (await db.query(`select * from public.signups`)).rows;
ok("still one row (no duplicate)", after.length === 1, `got ${after.length}`);
ok("answers replaced", JSON.stringify(after[0].meet_days) === '["monday"]', JSON.stringify(after[0].meet_days));
ok("submissions counted up", after[0].submissions === 2, `got ${after[0].submissions}`);
ok("created_at preserved", +new Date(after[0].created_at) === +new Date(row.created_at));

console.log("\n== Case-insensitive identity (citext) ==");
await call({ ...GOOD, email: "ALVAREZ.J@NORTHEASTERN.EDU", name: "Jordan A" });
ok("uppercase address is the same person",
  (await db.query(`select count(*)::int c from public.signups`)).rows[0].c === 1);

console.log("\n== No oracle ==");
const repeat = await call(GOOD);
ok("resubmission returns identical {ok:true}", JSON.stringify(repeat) === '{"ok":true}');
ok("response has no id/count/keys beyond ok", Object.keys(repeat).join() === "ok", Object.keys(repeat).join());

console.log("\n== Validation ==");
const cases = [
  ["empty name", { ...GOOD, name: "  " }, "name_required"],
  ["formula-injection name", { ...GOOD, name: "=cmd|' /c calc'!A1" }, "name_invalid"],
  ["garbage email", { ...GOOD, email: "not-an-email" }, "email_invalid"],
  ["double-@ bypass attempt", { ...GOOD, email: "a@gmail.com.b@northeastern.edu" }, "email_invalid"],
  ["non-Northeastern domain", { ...GOOD, email: "someone@gmail.com" }, "email_domain"],
  ["missing year", { ...GOOD, year: "" }, "year_required"],
  ["no colleges", { ...GOOD, colleges: [] }, "college_required"],
  ["no days", { ...GOOD, days: [] }, "days_required"],
  ["no interests", { ...GOOD, interests: [] }, "interests_required"],
  ["colleges all garbage tokens", { ...GOOD, colleges: ["<script>", "'; drop table"] }, "college_required"],
];
for (const [label, args, expect] of cases) {
  const r = await call(args);
  ok(`${label} -> ${expect}`, r.ok === false && r.reason === expect, JSON.stringify(r));
}

console.log("\n== Hostile input is filtered, not fatal ==");
const mixed = await call({ ...GOOD, email: "mixed@husky.neu.edu", days: ["tuesday", "<script>", "FRIDAY", "tuesday"] });
ok("mixed good/bad day list still succeeds", mixed.ok === true, JSON.stringify(mixed));
const mrow = (await db.query(`select meet_days from public.signups where email='mixed@husky.neu.edu'`)).rows[0];
ok("garbage dropped, valid kept, lowercased, de-duplicated",
  JSON.stringify([...mrow.meet_days].sort()) === '["friday","tuesday"]', JSON.stringify(mrow.meet_days));

const flood = await call({ ...GOOD, email: "flood@neu.edu", interests: Array.from({length: 40}, (_, i) => `x${i}`) });
ok("40 interests refused as too_many", flood.ok === false && flood.reason === "too_many", JSON.stringify(flood));

console.log("\n== Free-storage abuse ==");
const longv = await call({ ...GOOD, email: "long@neu.edu", year: "a".repeat(400) });
ok("400-char year refused", longv.ok === false && longv.reason === "year_required");
const longname = await call({ ...GOOD, email: "ln@neu.edu", name: "n".repeat(500) });
ok("500-char name refused", longname.ok === false && longname.reason === "name_required");

console.log("\n== Security posture ==");
const rls = (await db.query(`select relrowsecurity from pg_class where relname='signups'`)).rows[0];
ok("RLS enabled on signups", rls.relrowsecurity === true);
const pol = (await db.query(`select count(*)::int c from pg_policies where tablename='signups'`)).rows[0];
ok("zero policies (deny by default)", pol.c === 0, `got ${pol.c}`);

const grants = (await db.query(`
  select p.proname, has_function_privilege('anon', p.oid, 'execute') as anon_exec
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname like 'signup%' or p.proname='submit_signup'
  order by p.proname`)).rows;
const byName = Object.fromEntries(grants.map(g => [g.proname, g.anon_exec]));
ok("anon CAN execute submit_signup", byName.submit_signup === true);
ok("anon CANNOT execute signup_term", byName.signup_term === false, JSON.stringify(byName));
ok("anon CANNOT execute signup_tokens_ok", byName.signup_tokens_ok === false);

for (const t of ["signups"]) {
  const priv = (await db.query(
    `select has_table_privilege('anon',$1,'select') s, has_table_privilege('anon',$1,'insert') i`, [`public.${t}`]
  )).rows[0];
  ok(`anon cannot SELECT ${t}`, priv.s === false);
  ok(`anon cannot INSERT ${t} directly`, priv.i === false);
}

console.log("\n== Term boundary (signup_term) ==");
for (const [iso, expect] of [
  ["2026-09-08T12:00:00-04", "fall-2026"],
  ["2026-07-01T12:00:00-04", "fall-2026"],
  ["2026-06-30T12:00:00-04", "spring-2026"],
  ["2027-01-15T12:00:00-05", "spring-2027"],
  ["2026-12-31T12:00:00-05", "fall-2026"],
]) {
  const r = (await db.query(`select public.signup_term($1::timestamptz) t`, [iso])).rows[0].t;
  ok(`${iso} -> ${expect}`, r === expect, `got ${r}`);
}

console.log("\n== Officer queries actually run ==");
const officer = [
  ["mailing list excludes unsubscribes", `
     select s.email, s.name from public.signups s
     where s.added_to_list_at is null
       and not exists (select 1 from public.unsubscribes u where u.email = s.email)
     order by s.created_at`],
  ["interest tally", `
     select v as interest, count(*) as people
     from public.signups, unnest(interests) as v
     where term = public.signup_term() group by v order by people desc`],
  ["college split", `
     select v as college, count(*) as people,
       round(100.0*count(*)/(select count(*) from public.signups where term=public.signup_term()),1) as pct
     from public.signups, unnest(colleges) as v
     where term = public.signup_term() group by v order by people desc`],
  ["day pair reach", `
     select count(*) from public.signups
     where term = public.signup_term() and meet_days && array['tuesday','thursday']`],
  ["headcount by term with NEU split", `
     select term, count(*) as signups,
       count(*) filter (where public.is_member_email(email)) as northeastern
     from public.signups group by term order by term desc`],
];
// unsubscribes.sql is a sibling file the export query joins against.
await db.exec(readFileSync(`${REPO}/supabase/unsubscribes.sql`, "utf8"));
for (const [label, q] of officer) {
  try { await db.query(q); ok(`officer query runs: ${label}`, true); }
  catch (e) { ok(`officer query runs: ${label}`, false, e.message); }
}

console.log("\n== The unsubscribe exclusion actually excludes ==");
await db.query(`select public.request_unsubscribe('mixed@husky.neu.edu')`);
const list = (await db.query(`
  select s.email from public.signups s
  where s.added_to_list_at is null
    and not exists (select 1 from public.unsubscribes u where u.email = s.email)`)).rows.map(r => r.email);
ok("unsubscribed address is absent from the export",
  !list.includes("mixed@husky.neu.edu"), JSON.stringify(list));
ok("other addresses still present", list.includes("alvarez.j@northeastern.edu"), JSON.stringify(list));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
