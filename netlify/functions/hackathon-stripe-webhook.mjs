/**
 * POST /hackathon/api/stripe-webhook
 *
 * Stripe calls this when a Checkout Session completes. It settles the
 * registration exactly as the ticket page does, for the person who paid and
 * then closed the tab before Stripe could send them back.
 *
 * Set up in Stripe → Developers → Webhooks: endpoint
 * https://claudeneu.com/hackathon/api/stripe-webhook, events
 * checkout.session.completed and checkout.session.async_payment_succeeded.
 * Its signing secret goes in STRIPE_WEBHOOK_SECRET.
 *
 * The signature is checked over the RAW body, before any parsing: re-encoding
 * parsed JSON never reproduces Stripe's bytes exactly, and the check would
 * fail on every event.
 */
import {
  configured,
  json,
  notConfigured,
  settle,
  stripeConfigured,
  verifyStripeSignature,
} from "../lib/hackathon.mjs";

const HANDLED = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

export default async (req) => {
  const secret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  // Checked even in free mode: a checkout opened before payments were
  // switched off can still complete, and it must still become a seat.
  if (!configured() || !stripeConfigured() || !secret) return notConfigured();

  const raw = await req.text();
  if (!verifyStripeSignature(raw, req.headers.get("stripe-signature"), secret)) {
    return json(400, { ok: false, reason: "bad_signature" });
  }

  const event = JSON.parse(raw);
  if (!HANDLED.has(event.type)) return json(200, { ok: true, ignored: event.type });

  const session = event.data?.object;
  // Only sessions this site created. Anything else on the same Stripe
  // account that completes a checkout is acknowledged and left alone.
  if (!session?.metadata?.registration_id) {
    return json(200, { ok: true, ignored: "not_hackathon" });
  }

  try {
    const result = await settle(session);
    return json(200, { ok: true, status: result.status ?? result.reason });
  } catch (err) {
    // A 5xx makes Stripe retry, with backoff, for up to three days.
    console.error("[hackathon] webhook", err.message);
    return json(500, { ok: false });
  }
};

export const config = { path: "/hackathon/api/stripe-webhook", method: "POST" };
