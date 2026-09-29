/**
 * POST /hackathon/api/finish  { id }
 *
 * Step three. The files are up; now:
 *
 *   - FREE MODE (the default; see HACKATHON_PAYMENTS in ../lib/hackathon.mjs)
 *     → hackathon_claim(): a seat with the $5 owed, or the next waitlist
 *     place if the room is full: { ok, token }
 *   - Stripe mode, seats open → a Stripe Checkout Session for $5, and the
 *     browser is sent to it: { ok, checkout: url }
 *   - Stripe mode, room full → a free waitlist place: { ok, token }
 *
 * The id is the pending row's uuid from /register. Knowing it lets someone
 * pay for that registration and nothing else.
 *
 * If the row already has an open Checkout Session (they came back from
 * Stripe with the back button), that session is reused rather than a second
 * one created. Two live sessions for one row would mean a payment on the older
 * one could not be matched to the row.
 */
import {
  FEE_CENTS,
  UUID,
  configured,
  json,
  listFolder,
  notConfigured,
  paymentsOn,
  rpc,
  settle,
  siteOrigin,
  stripe,
} from "../lib/hackathon.mjs";

export default async (req) => {
  if (!configured()) return notConfigured();

  let id;
  try {
    ({ id } = await req.json());
  } catch {
    return json(400, { ok: false, reason: "bad_request" });
  }
  if (typeof id !== "string" || !UUID.test(id)) {
    return json(400, { ok: false, reason: "bad_request" });
  }

  try {
    const row = await rpc("hackathon_pending", { p_id: id });
    if (!row.ok) return json(404, row);

    // Already settled: send them to their ticket.
    if (row.status !== "pending") return json(200, { ok: true, token: row.token });
    if (row.already_registered) {
      return json(422, { ok: false, reason: "already_registered" });
    }

    // Both files must be in the bucket before anyone is charged.
    const files = await listFolder(id);
    const resume = row.resume_path.split("/").pop();
    const headshot = row.headshot_path.split("/").pop();
    if (!files.includes(resume) || !files.includes(headshot)) {
      return json(422, { ok: false, reason: "files_missing" });
    }

    // Free mode, or a full room in Stripe mode: nobody is charged. Claim
    // decides seat or waitlist under the same lock that numbers the seats.
    if (!paymentsOn() || row.full) {
      const ticket = await rpc("hackathon_claim", { p_id: id });
      if (ticket.ok) return json(200, { ok: true, token: ticket.token, status: ticket.status });
      return json(422, ticket);
    }

    if (row.stripe_session_id) {
      const existing = await stripe("GET", `checkout/sessions/${row.stripe_session_id}`);
      if (existing.payment_status === "paid") {
        const ticket = await settle(existing);
        return json(200, { ok: true, token: ticket.token });
      }
      if (existing.status === "open" && existing.url) {
        return json(200, { ok: true, checkout: existing.url });
      }
    }

    const origin = siteOrigin(req);
    // A double-click inside the same minute gets the same session back. Stripe
    // rejects a reused idempotency key whose parameters differ, so expires_at
    // is derived from the same minute rather than from the exact second.
    const minute = Math.floor(Date.now() / 60000);
    const session = await stripe(
      "POST",
      "checkout/sessions",
      {
        mode: "payment",
        // New Stripe accounts turn on Managed Payments (Stripe as merchant of
        // record) by default, and it refuses any line item without a product
        // tax code. The club is the merchant for a $5 registration fee, so it
        // is switched off here rather than inventing a tax code for a seat.
        managed_payments: { enabled: false },
        customer_email: row.email,
        client_reference_id: id,
        line_items: {
          0: {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: FEE_CENTS,
              product_data: {
                name: "HACK1984 registration",
                description: "One seat at HACK1984, Northeastern University, Boston.",
              },
            },
          },
        },
        metadata: { registration_id: id },
        payment_intent_data: {
          description: `HACK1984 registration: ${row.name}`,
          metadata: { registration_id: id },
        },
        success_url: `${origin}/hackathon/ticket/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/hackathon/signup/?resume=${id}`,
        // Stripe's minimum is 30 minutes from now; 32 from the start of this
        // minute is always past it. A session left open longer is a stale tab.
        expires_at: (minute + 32) * 60,
      },
      `hk-checkout-${id}-${minute}`,
    );

    await rpc("hackathon_attach_session", { p_id: id, p_session: session.id });
    return json(200, { ok: true, checkout: session.url });
  } catch (err) {
    console.error("[hackathon] finish", err.message);
    return json(502, { ok: false, reason: "backend" });
  }
};

export const config = {
  path: "/hackathon/api/finish",
  method: "POST",
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
