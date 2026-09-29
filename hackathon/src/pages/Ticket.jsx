import { useEffect, useState } from "react";
import { BracketButton } from "../components/BracketButton";
import { TicketCard } from "../components/TicketCard";
import { withBase } from "../lib/base";
import { EVENT, LINKS } from "../lib/event";
import { SCHEDULE } from "../lib/schedule";
import { refreshSeats } from "../lib/seats";
import { padSeat, pending, savedTicket } from "../lib/signup";

/**
 * /hackathon/ticket/: the ticket.
 *
 * Arrives three ways:
 *
 *   ?session_id=cs_…  straight back from Stripe. The function checks the
 *                     session with Stripe and settles it, so the ticket does
 *                     not wait on the webhook.
 *   ?t=<token>        the ticket's own address, and what the page swaps the
 *                     session id for as soon as it has the token, so the URL
 *                     someone bookmarks is the ticket.
 *   nothing           the last ticket this browser was shown, if any.
 *
 * Nothing about the ticket is in the prerendered HTML: it is per person, so
 * the server renders the loading state and the browser fills it in.
 */

/**
 * When check-in opens, from the first row of the schedule, so the ticket and
 * the timeline cannot disagree: "18:00" on FRI becomes "Friday, Nov 6 at
 * 6:00 PM". The date is the first day of EVENT.dateLong's range.
 */
function checkInTime() {
  const first = SCHEDULE[0];
  const [h, m] = first.time.split(":").map(Number);
  const clock = `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  const date = EVENT.dateLong.split("–")[0].trim().replace(/^Fri /, "Friday, ");
  return `${date} at ${clock}`;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function load(query) {
  try {
    const res = await fetch(withBase(`api/ticket?${query}`), { headers: { Accept: "application/json" } });
    const data = await res.json().catch(() => ({ ok: false, reason: "backend" }));
    return data;
  } catch {
    return { ok: false, reason: "network" };
  }
}

export function Ticket() {
  const [state, setState] = useState({ phase: "loading" });

  useEffect(() => {
    let live = true;
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      const token = params.get("t") || (sessionId ? null : savedTicket.get());

      if (!sessionId && !token) {
        setState({ phase: "empty" });
        return;
      }

      let data;
      if (sessionId) {
        // Stripe marks a card payment paid before it redirects, but give a
        // slow one a few seconds before calling it unfinished.
        for (let attempt = 0; attempt < 5; attempt += 1) {
          data = await load(`session_id=${encodeURIComponent(sessionId)}`);
          if (data.reason !== "unpaid" && data.reason !== "backend") break;
          await wait(1500);
        }
      } else {
        data = await load(`t=${encodeURIComponent(token)}`);
      }
      if (!live) return;

      if (data.ok) {
        pending.clear();
        savedTicket.set(data.token);
        refreshSeats();
        if (!params.get("t")) {
          window.history.replaceState(null, "", `${window.location.pathname}?t=${data.token}`);
        }
        setState({ phase: "ticket", ticket: data });
      } else {
        setState({ phase: "error", reason: data.reason });
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return (
    <main className="hk-tk">
      {state.phase === "loading" ? <Loading /> : null}
      {state.phase === "empty" ? <Empty /> : null}
      {state.phase === "error" ? <Failed reason={state.reason} /> : null}
      {state.phase === "ticket" ? <Issued ticket={state.ticket} /> : null}
    </main>
  );
}

function Loading() {
  return (
    <section className="hk-tk__msg" aria-live="polite">
      <p className="hk-tk__terminal">
        &gt; VERIFYING PAYMENT<span className="hk-tk__cursor" aria-hidden="true" />
      </p>
    </section>
  );
}

function Empty() {
  return (
    <section className="hk-tk__msg">
      <span className="hk-chip">TICKET</span>
      <h1 className="hk-tk__title">No ticket here yet.</h1>
      <p className="hk-tk__text">
        Tickets live at the link you were sent to after paying. If you have not
        signed up, there are seats waiting.
      </p>
      <BracketButton href={withBase(LINKS.signUp)}>Sign up</BracketButton>
    </section>
  );
}

const FAILURES = {
  unpaid: {
    title: "Payment not finished.",
    text: "Stripe hasn't confirmed a payment for this checkout. Your details are saved; go back and finish paying.",
  },
  not_found: {
    title: "We couldn't find that ticket.",
    text: "Check the link, or sign up again if you never finished.",
  },
  not_configured: {
    title: "Registration isn't open yet.",
    text: "Check back soon.",
  },
};

function Failed({ reason }) {
  const copy = FAILURES[reason] || {
    title: "Something went wrong.",
    text: "Reload the page in a moment. If you paid and this keeps happening, email the organizers; your payment is not lost.",
  };
  return (
    <section className="hk-tk__msg">
      <span className="hk-chip">TICKET</span>
      <h1 className="hk-tk__title">{copy.title}</h1>
      <p className="hk-tk__text">{copy.text}</p>
      <BracketButton href={withBase(LINKS.signUp)}>Back to sign up</BracketButton>
    </section>
  );
}

function Issued({ ticket }) {
  const [copied, setCopied] = useState(false);

  if (ticket.status === "duplicate") {
    return (
      <section className="hk-tk__msg">
        <span className="hk-chip">ALREADY REGISTERED</span>
        <h1 className="hk-tk__title">You already have a seat.</h1>
        <p className="hk-tk__text">
          {ticket.email} was already registered, so this second payment has been
          refunded. Your original ticket is at the link from your first sign-up,
          or on this device at the ticket page if you used it then.
        </p>
      </section>
    );
  }

  const waitlist = ticket.status === "waitlist";
  const headline = waitlist
    ? `You're #${ticket.waitlist_position} on the waitlist.`
    : `You're in. Seat ${ticket.spot} of ${ticket.capacity}.`;
  const seat = padSeat(ticket.spot);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; the address bar still has it.
    }
  }

  return (
    <section className="hk-tk__issued" aria-labelledby="tk-h">
      <div className="hk-tk__head">
        <span className="hk-chip">{waitlist ? "WAITLIST" : "TICKET"}</span>
        <h1 id="tk-h" className="hk-tk__title">{headline}</h1>
        <p className="hk-tk__text">
          {waitlist && ticket.refunded
            ? "The last seat went while you were paying, so your $5 has been refunded. We'll write to you in order if a seat opens."
            : waitlist
              ? "We'll write to you in order if a seat opens. There's nothing to pay unless one does."
              : "This page is your ticket. Bookmark it, print it or screenshot it."}
        </p>
      </div>

      <TicketCard
        name={ticket.name}
        email={ticket.email}
        phone={ticket.phone}
        year={ticket.class_year}
        college={ticket.college}
        status={ticket.status}
        spot={ticket.spot}
        waitlistPosition={ticket.waitlist_position}
        capacity={ticket.capacity}
        token={ticket.token}
      />

      <div className="hk-tk__actions">
        <BracketButton onClick={() => window.print()}>Print ticket</BracketButton>
        {!waitlist ? (
          <BracketButton href={withBase(LINKS.calendar)} download>
            Add to calendar
          </BracketButton>
        ) : null}
        <BracketButton onClick={copyLink}>{copied ? "Link copied" : "Copy link"}</BracketButton>
      </div>

      {!waitlist ? (
        <section className="hk-checkin" aria-labelledby="checkin-h">
          <h2 id="checkin-h" className="hk-checkin__title">
            <span className="hk-chip">ON THE DAY</span>
            Checking in
          </h2>
          <ol className="hk-checkin__steps">
            <li>
              <span className="hk-checkin__n">01</span>
              <div>
                <p className="hk-checkin__head">Come to {EVENT.venue}.</p>
                <p className="hk-checkin__text">
                  Check-in opens {checkInTime()}, with dinner. Come any time
                  before the opening ceremony.
                </p>
              </div>
            </li>
            <li>
              <span className="hk-checkin__n">02</span>
              <div>
                <p className="hk-checkin__head">Give the desk your seat number.</p>
                <p className="hk-checkin__text">
                  Yours is <strong className="hk-checkin__seat">{seat}</strong>.
                  That is all we need to find you: no email, no QR code.
                </p>
              </div>
            </li>
            <li>
              <span className="hk-checkin__n">03</span>
              <div>
                <p className="hk-checkin__head">Show your Northeastern ID.</p>
                <p className="hk-checkin__text">
                  The name on it should match the one on this ticket:{" "}
                  {ticket.name}. Then find your team and start building.
                </p>
              </div>
            </li>
          </ol>
        </section>
      ) : null}
    </section>
  );
}
