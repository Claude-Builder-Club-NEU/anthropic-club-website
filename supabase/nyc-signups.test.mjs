/**
 * nyc-signups.sql, executed and exercised against a real Postgres (PGlite).
 *
 *   npm run test:nyc-db
 *
 * Same approach as signups.test.mjs: it runs the real files in order
 * (schema.sql, signups.sql, nyc-signups.sql) and checks that the file executes,
 * that anon can call submit_nyc_signup and cannot read the table, that a
 * resubmission is indistinguishable from a first one, and that bad answers come
 * back as reasons. It also checks that public.signups is left alone.
 */
import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..");
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
  end $$;
`);

for (const file of ["schema.sql", "signups.sql", "nyc-signups.sql"]) {
  try {
    await db.exec(readFileSync(`${REPO}/supabase/${file}`, "utf8"));
    console.log(`  ${file} executed`);
  } catch (e) {
    console.log(`  ${file} FAILED:`, e.message);
    process.exit(1);
  }
}
pass++;

console.log("\n== Idempotent: run nyc-signups.sql a second time ==");
try {
  await db.exec(readFileSync(`${REPO}/supabase/nyc-signups.sql`, "utf8"));
  ok("re-running the file is safe", true);
} catch (e) { ok("re-running the file is safe", false, e.message); }

const call = async (a) => {
  const r = await db.query(
    `select public.submit_nyc_signup($1,$2,$3,$4,$5) as r`,
    [a.name, a.email, a.major, a.month, a.days]
  );
  return r.rows[0].r;
};

const GOOD = {
  name: "Sam Rivera",
  email: "Sam.Rivera@gmail.com",
  major: "computer_science",
  month: "january",
  days: ["tuesday", "thursday"],
};

console.log("\n== Happy path ==");
ok("valid signup returns {ok:true}", JSON.stringify(await call(GOOD)) === '{"ok":true}');
const row = (await db.query(`select * from public.nyc_signups`)).rows[0];
ok("email lowercased", row.email === "sam.rivera@gmail.com", row.email);
ok("non-Northeastern address accepted", Boolean(row));
ok("days stored as array", JSON.stringify(row.meet_days) === '["thursday","tuesday"]' || row.meet_days.length === 2);
ok("Boston signups table untouched",
  (await db.query(`select count(*)::int c from public.signups`)).rows[0].c === 0);

console.log("\n== Upsert and no oracle ==");
const again = await call({ ...GOOD, email: "SAM.RIVERA@GMAIL.COM", month: "december" });
ok("resubmission returns identical {ok:true}", JSON.stringify(again) === '{"ok":true}');
const rows = (await db.query(`select * from public.nyc_signups`)).rows;
ok("still one row", rows.length === 1, `got ${rows.length}`);
ok("answers replaced", rows[0].meeting_month === "december");
ok("submissions counted", rows[0].submissions === 2);

console.log("\n== Validation ==");
const cases = [
  ["empty name", { ...GOOD, name: " " }, "name_required"],
  ["formula name", { ...GOOD, name: "=HYPERLINK()" }, "name_invalid"],
  ["bad email", { ...GOOD, email: "nope" }, "email_invalid"],
  ["no major", { ...GOOD, major: "" }, "major_required"],
  ["no month", { ...GOOD, month: "" }, "month_required"],
  ["no days", { ...GOOD, days: [] }, "days_required"],
  ["garbage days", { ...GOOD, days: ["<b>"] }, "days_required"],
];
for (const [label, args, expect] of cases) {
  const r = await call(args);
  ok(`${label} -> ${expect}`, r.ok === false && r.reason === expect, JSON.stringify(r));
}

console.log("\n== Privileges ==");
const priv = (await db.query(`
  select has_table_privilege('anon','public.nyc_signups','select') s,
         has_table_privilege('anon','public.nyc_signups','insert') i,
         has_function_privilege('anon','public.submit_nyc_signup(text,text,text,text,text[])','execute') x
`)).rows[0];
ok("anon cannot select", priv.s === false);
ok("anon cannot insert directly", priv.i === false);
ok("anon can execute submit_nyc_signup", priv.x === true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
