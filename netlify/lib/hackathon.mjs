/**
 * Shared server code for the HACK1984 registration functions.
 *
 * Everything that holds a secret lives on this side of the wire. The browser
 * never sees the Supabase service role key or the Stripe secret key; it calls
 * /hackathon/api/*, and these functions call Supabase and Stripe.
 *
 * NO DEPENDENCIES, on purpose, matching src/lib/supabase.js: the whole surface
 * is "call a Postgres function", "mint a signed upload URL" and three Stripe
 * endpoints, which is a few fetches. Pulling in supabase-js and stripe-node
 * would add two production dependencies to a repo that has three.
 *
 * ENVIRONMENT (set in Netlify → Site configuration → Environment variables):
 *
 *   SUPABASE_SERVICE_ROLE_KEY  Supabase → Project settings → API keys. The
 *                              secret one. Never in a VITE_ variable.
 *   STRIPE_SECRET_KEY          Stripe → Developers → API keys (sk_live_…, or
 *                              sk_test_… on a deploy preview).
 *   STRIPE_WEBHOOK_SECRET      Stripe → Developers → Webhooks → the endpoint
 *                              for /hackathon/api/stripe-webhook (whsec_…).
 *   SUPABASE_URL               Optional; falls back to VITE_SUPABASE_URL,
 *                              which the site already has.
 *
 * Without the first two the endpoints answer 503 "not configured", and the
 * signup page says registration is not open yet, rather than taking a form it
 * cannot store.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const FEE_CENTS = 500;
export const BUCKET = "hackathon";
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const HEADSHOT_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const env = (name) => (process.env[name] || "").trim();

const SUPABASE_URL = (env("SUPABASE_URL") || env("VITE_SUPABASE_URL")).replace(/\/+$/, "");
const SERVICE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");
const STRIPE_KEY = env("STRIPE_SECRET_KEY");

export const configured = () => Boolean(SUPABASE_URL && SERVICE_KEY && STRIPE_KEY);

/**
 * The site's own origin, for Stripe's return URLs. Netlify sets URL to the
 * production address and DEPLOY_PRIME_URL to a preview's; a preview should
 * send people back to itself, not to production.
 */
export function siteOrigin(req) {
  if (env("CONTEXT") && env("CONTEXT") !== "production" && env("DEPLOY_PRIME_URL")) {
    return env("DEPLOY_PRIME_URL");
  }
  return env("URL") || new URL(req.url).origin;
}

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export const notConfigured = () =>
  json(503, { ok: false, reason: "not_configured" });

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

const supabaseHeaders = () => ({
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
});

/** Call one of the functions in supabase/hackathon.sql. */
export async function rpc(fn, args = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: supabaseHeaders(),
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`rpc ${fn} failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  // A function that `returns void` comes back as 204 with no body, and
  // res.json() on an empty body throws.
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/**
 * A one-time URL the browser can PUT one file to, and nothing else. It is
 * scoped to one path in the private bucket and cannot overwrite (no upsert),
 * read or list anything.
 */
export async function signedUploadUrl(path) {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${path}`,
    { method: "POST", headers: supabaseHeaders(), body: "{}" },
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`sign upload failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  const { url } = await res.json();
  return `${SUPABASE_URL}/storage/v1${url}`;
}

/** Names of the files in one registration's folder. */
export async function listFolder(prefix) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: supabaseHeaders(),
    body: JSON.stringify({ prefix, limit: 20, offset: 0 }),
  });
  if (!res.ok) throw new Error(`list failed (${res.status})`);
  const items = await res.json();
  return items.map((item) => item.name);
}

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

/** Stripe's form encoding: nested objects become a[b][c]=v. */
function formEncode(obj, prefix = "", out = new URLSearchParams()) {
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === "object") formEncode(value, name, out);
    else out.append(name, String(value));
  }
  return out;
}

export async function stripe(method, path, params, idempotencyKey) {
  const headers = { Authorization: `Bearer ${STRIPE_KEY}` };
  let body;
  if (params) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = formEncode(params).toString();
  }
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const res = await fetch(`https://api.stripe.com/v1/${path}`, { method, headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`stripe ${path} failed (${res.status}): ${data?.error?.message || ""}`);
    err.code = data?.error?.code;
    throw err;
  }
  return data;
}

/**
 * Verify a webhook's Stripe-Signature header: HMAC-SHA256 over
 * "<timestamp>.<raw body>", compared in constant time, and refused if the
 * timestamp is more than five minutes off, so a captured event cannot be
 * replayed later.
 */
export function verifyStripeSignature(rawBody, header, secret, toleranceSec = 300) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i), kv.slice(i + 1)];
    }),
  );
  const t = Number(parts.t);
  if (!Number.isFinite(t) || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;

  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const signatures = header
    .split(",")
    .filter((kv) => kv.startsWith("v1="))
    .map((kv) => kv.slice(3));

  return signatures.some((sig) => {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

/**
 * A paid Checkout Session becomes a seat (or a refunded waitlist place).
 *
 * Called from the webhook AND from the ticket page, whichever arrives first.
 * hackathon_confirm() is idempotent and the refund carries an idempotency
 * key, so running this twice for one session is harmless.
 */
export async function settle(session) {
  const id = session.client_reference_id;
  if (!id || !UUID.test(id)) return { ok: false, reason: "no_reference" };
  if (session.payment_status !== "paid") return { ok: false, reason: "unpaid" };

  const ticket = await rpc("hackathon_confirm", {
    p_id: id,
    p_session: session.id,
    p_payment_intent: session.payment_intent || null,
    p_amount_cents: session.amount_total ?? null,
  });

  // Took money without turning it into a seat: the room filled while they
  // were paying, or this email already had one. Give it back.
  const refundable =
    ticket.ok && ticket.refunded && (ticket.status === "duplicate" || ticket.status === "waitlist");

  if (refundable && session.payment_intent) {
    try {
      await stripe(
        "POST",
        "refunds",
        {
          payment_intent: session.payment_intent,
          // Stripe only takes three reasons, and a full room is none of them.
          reason: ticket.status === "duplicate" ? "duplicate" : undefined,
        },
        `hk-refund-${id}`,
      );
      await rpc("hackathon_mark_refunded", { p_id: id });
    } catch (err) {
      if (err.code === "charge_already_refunded") {
        await rpc("hackathon_mark_refunded", { p_id: id });
      } else {
        // Left at refund_state = 'due'; the officer query in hackathon.sql
        // lists these for a manual refund.
        console.error("[hackathon] refund failed", id, err.message);
      }
    }
  }

  return ticket;
}
