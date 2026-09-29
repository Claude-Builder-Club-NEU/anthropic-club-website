/**
 * GET /hackathon/api/seats → { capacity, taken, payments }
 *
 * The meter on /hackathon/ and the signup page's "full" state both read this.
 * A seat is a 'seated' registration; see supabase/hackathon.sql.
 *
 * Cached at Netlify's edge for ten seconds, so a page that everyone opens at
 * once (a link in a group chat) is one database query, not a thousand.
 */
import { configured, json, notConfigured, paymentsOn, rpc } from "../lib/hackathon.mjs";

export default async () => {
  if (!configured()) return notConfigured();
  try {
    const { capacity, taken } = await rpc("hackathon_seats");
    // `payments` tells the signup page whether the button says "Claim my seat"
    // or goes to Stripe.
    return json(200, { ok: true, capacity, taken, payments: paymentsOn() }, {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
    });
  } catch (err) {
    console.error("[hackathon] seats", err.message);
    return json(502, { ok: false, reason: "backend" });
  }
};

export const config = { path: "/hackathon/api/seats", method: "GET" };
