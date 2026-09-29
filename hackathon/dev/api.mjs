/**
 * /hackathon/api/* for `npm run dev`. Dev only; nothing here ships.
 *
 * On Netlify these routes are the functions in ../../netlify/functions. Vite's
 * dev server knows nothing about those, so this plugin answers the same
 * routes in one of two ways:
 *
 *   REAL  when hackathon/.env.local has SUPABASE_SERVICE_ROLE_KEY and
 *         STRIPE_SECRET_KEY (use a sk_test_ key). The real function modules
 *         are loaded and called with a real Request, so this exercises the
 *         code that deploys, against your Supabase project and Stripe test
 *         mode.
 *
 *   MOCK  otherwise. An in-memory stand-in with the same responses, in free
 *         mode (no payment), so the form, the uploads and the ticket can all
 *         be clicked through with no keys at all. HACKATHON_MOCK_TAKEN=100
 *         starts it full, or POST /hackathon/api/_full fills it, to see the
 *         waitlist.
 */
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const FUNCTIONS = join(HERE, "..", "..", "netlify", "functions");

async function toRequest(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  return new Request(`http://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : body,
  });
}

async function send(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((v, k) => res.setHeader(k, v));
  res.end(Buffer.from(await response.arrayBuffer()));
}

const reply = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// ---------------------------------------------------------------------------
// Mock
// ---------------------------------------------------------------------------

function mockBackend() {
  const capacity = 100;
  let taken = Number(process.env.HACKATHON_MOCK_TAKEN || 37);
  let waitlist = 0;
  const rows = new Map();
  const files = new Set();

  return async (req) => {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/hackathon\/api\//, "");

    if (path === "seats") return reply(200, { ok: true, capacity, taken, payments: false });

    // Dev only: POST /hackathon/api/_full fills the room, to see the waitlist.
    if (path === "_full") {
      taken = capacity;
      return reply(200, { ok: true, taken });
    }

    if (path.startsWith("_upload/")) {
      files.add(path.slice("_upload/".length));
      await new Promise((r) => setTimeout(r, 400));
      return reply(200, { Key: path });
    }

    if (path === "register") {
      const b = await req.json();
      if (!/@(northeastern\.edu|husky\.neu\.edu|neu\.edu)$/i.test(b.email || "")) {
        return reply(422, { ok: false, reason: "email_domain" });
      }
      if ([...rows.values()].some((r) => r.email === b.email && r.status !== "pending")) {
        return reply(422, { ok: false, reason: "already_registered" });
      }
      const id = randomUUID();
      rows.set(id, { ...b, id, status: "pending", token: randomUUID() });
      return reply(200, {
        ok: true,
        id,
        full: taken >= capacity,
        uploads: {
          resume: `/hackathon/api/_upload/${id}/resume.pdf`,
          headshot: `/hackathon/api/_upload/${id}/headshot`,
        },
      });
    }

    if (path === "finish") {
      const { id } = await req.json();
      const row = rows.get(id);
      if (!row) return reply(404, { ok: false, reason: "not_found" });
      if (!files.has(`${id}/resume.pdf`) || !files.has(`${id}/headshot`)) {
        return reply(422, { ok: false, reason: "files_missing" });
      }
      // Free mode, like hackathon_claim(): a seat with the fee owed, or the
      // waitlist once the room is full.
      if (row.status === "pending") {
        if (taken >= capacity) {
          row.status = "waitlist";
          row.waitlist_position = ++waitlist;
        } else {
          row.status = "seated";
          row.spot = ++taken;
        }
      }
      return reply(200, { ok: true, token: row.token });
    }

    if (path === "ticket") {
      const t = url.searchParams.get("t");
      const s = url.searchParams.get("session_id");
      const row = [...rows.values()].find((r) => (t && r.token === t) || (s && r.session === s));
      if (!row) return reply(404, { ok: false, reason: "not_found" });
      if (row.status === "pending" && s) {
        row.status = "paid";
        row.spot = ++taken;
      }
      return reply(200, {
        ok: true,
        status: row.status,
        name: row.name,
        email: row.email,
        phone: row.phone,
        class_year: row.year,
        college: row.college,
        spot: row.spot ?? null,
        waitlist_position: row.waitlist_position ?? null,
        capacity,
        token: row.token,
        refunded: false,
        fee_cents: 500,
        fee_paid: false,
      });
    }

    return reply(404, { ok: false, reason: "not_found" });
  };
}

// ---------------------------------------------------------------------------
// Real functions
// ---------------------------------------------------------------------------

async function realBackend() {
  const routes = [];
  for (const file of readdirSync(FUNCTIONS).filter((f) => f.startsWith("hackathon-"))) {
    const mod = await import(pathToFileURL(join(FUNCTIONS, file)).href);
    routes.push({ path: mod.config.path, method: mod.config.method, handler: mod.default });
  }
  return async (req) => {
    const { pathname } = new URL(req.url);
    const route = routes.find((r) => r.path === pathname && (!r.method || r.method === req.method));
    return route ? route.handler(req) : reply(404, { ok: false, reason: "not_found" });
  };
}

export function hackathonApi(env) {
  return {
    name: "hackathon-dev-api",
    apply: "serve",
    async configureServer(server) {
      // The function modules read process.env when they load.
      for (const [k, v] of Object.entries(env)) if (!(k in process.env)) process.env[k] = v;
      const real = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.STRIPE_SECRET_KEY);
      const handle = real ? await realBackend() : mockBackend();
      server.config.logger.info(`  hackathon api: ${real ? "REAL functions" : "MOCK backend"}`);

      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith("/hackathon/api/")) return next();
        try {
          await send(res, await handle(await toRequest(req)));
        } catch (err) {
          server.config.logger.error(err.stack || String(err));
          await send(res, reply(500, { ok: false, reason: "backend" }));
        }
      });
    },
  };
}
