/**
 * GET /hackathon/api/ticket?t=<token>
 * GET /hackathon/api/ticket?session_id=<Stripe Checkout Session id>
 *
 * The ticket page. Stripe sends people back with ?session_id; the page swaps
 * that for ?t=<token> as soon as it has one, so the address it leaves in the
 * history, and the one someone bookmarks, is the ticket's own.
 *
 * On the session_id path this does not wait for the webhook: if Stripe says
 * the session is paid, it settles it here. The webhook is the backstop for
 * someone who closes the tab before the redirect lands.
 */
import {
  UUID,
  configured,
  json,
  notConfigured,
  rpc,
  settle,
  stripe,
  stripeConfigured,
} from "../lib/hackathon.mjs";

const SESSION = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

export default async (req) => {
  if (!configured()) return notConfigured();

  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  const sessionId = url.searchParams.get("session_id");

  try {
    if (token) {
      if (!UUID.test(token)) return json(404, { ok: false, reason: "not_found" });
      const ticket = await rpc("hackathon_ticket", { p_token: token });
      return json(ticket.ok ? 200 : 404, ticket);
    }

    if (sessionId) {
      if (!SESSION.test(sessionId)) return json(404, { ok: false, reason: "not_found" });

      const known = await rpc("hackathon_by_session", { p_session: sessionId });
      if (!known.ok) return json(404, known);
      if (known.ticket) return json(200, known.ticket);
      if (!stripeConfigured()) return notConfigured();

      const session = await stripe("GET", `checkout/sessions/${sessionId}`);
      if (session.payment_status !== "paid") {
        return json(402, { ok: false, reason: "unpaid" });
      }
      const ticket = await settle(session);
      return json(ticket.ok ? 200 : 409, ticket);
    }

    return json(400, { ok: false, reason: "bad_request" });
  } catch (err) {
    console.error("[hackathon] ticket", err.message);
    return json(502, { ok: false, reason: "backend" });
  }
};

export const config = { path: "/hackathon/api/ticket", method: "GET" };
