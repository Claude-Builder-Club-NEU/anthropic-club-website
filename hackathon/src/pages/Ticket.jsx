import { useEffect, useState } from "react";
import { BracketButton } from "../components/BracketButton";
import { TicketCard } from "../components/TicketCard";
import { withBase } from "../lib/base";
import { APPLY, EVENT, LINKS } from "../lib/event";
import { checkInTime } from "../lib/schedule";
import { useApplicationsOpen } from "../lib/apply";
import { padSeat, pending, savedTicket } from "../lib/signup";

/**
 * /hackathon/ticket/: someone's application, and later their ticket.
 *
 * Arrives three ways:
 *
 *   ?session_id=cs_…  straight back from Stripe, if payments are ever on. The
 *                     function checks the session with Stripe and settles it,
 *                     so the page does not wait on the webhook.
 *   ?t=<token>        the page's own address, and what the page swaps the
 *                     session id for as soon as it has the token, so the URL
 *                     someone bookmarks is theirs.
 *   nothing           the last one this browser was shown, if any.
 *
 * UNTIL DECISIONS ARE OUT (APPLY.decisionsOut in event.js) every filed row,
 * seated or waitlisted, shows as an application received: the seat numbers
 * the database hands out are only arrival order, and showing one would tell
 * someone they were in before anyone had decided. After decisions, the same
 * link shows the seat or the waitlist place.
 *
 * Nothing about it is in the prerendered HTML: it is per person, so the
 * server renders the loading state and the browser fills it in.
 */

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
        &gt; LOADING YOUR APPLICATION<span className="hk-tk__cursor" aria-hidden="true" />
      </p>
    </section>
  );
}

function Empty() {
  return (
    <section className="hk-tk__msg">
      <span className="hk-chip">APPLICATION</span>
      <h1 className="hk-tk__title">No application here yet.</h1>
      <p className="hk-tk__text">
        Your application lives at the link you were sent to after applying, and
        on the device you applied from. Haven&rsquo;t applied? Applications
        close {APPLY.deadlineLabel}.
      </p>
      <BracketButton href={withBase(LINKS.signUp)}>Apply</BracketButton>
    </section>
  );
}

const FAILURES = {
  unpaid: {
    title: "Payment not finished.",
    text: "Stripe hasn't confirmed a payment for this checkout. Your details are saved; go back and finish paying.",
  },
  not_found: {
    title: "We couldn't find that application.",
    text: "Check the link, or apply again if you never finished.",
  },
  not_configured: {
    title: "Applications aren't open yet.",
    text: "Check back soon.",
  },
};

function Failed({ reason }) {
  const copy = FAILURES[reason] || {
    title: "Something went wrong.",
    text: "Reload the page in a moment. If this keeps happening, email the organizers; your application is not lost.",
  };
  return (
    <section className="hk-tk__msg">
      <span className="hk-chip">APPLICATION</span>
      <h1 className="hk-tk__title">{copy.title}</h1>
      <p className="hk-tk__text">{copy.text}</p>
      <BracketButton href={withBase(LINKS.signUp)}>Back to the application</BracketButton>
    </section>
  );
}

function Steps({ title, chip, steps }) {
  return (
    <section className="hk-checkin" aria-labelledby="checkin-h">
      <h2 id="checkin-h" className="hk-checkin__title">
        <span className="hk-chip">{chip}</span>
        {title}
      </h2>
      <ol className="hk-checkin__steps">
        {steps.map((step, i) => (
          <li key={step.head}>
            <span className="hk-checkin__n">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="hk-checkin__head">{step.head}</p>
              <p className="hk-checkin__text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Issued({ ticket }) {
  const [copied, setCopied] = useState(false);
  const open = useApplicationsOpen();

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; the address bar still has it.
    }
  }

  if (ticket.status === "duplicate") {
    return (
      <section className="hk-tk__msg">
        <span className="hk-chip">ALREADY APPLIED</span>
        <h1 className="hk-tk__title">You already applied.</h1>
        <p className="hk-tk__text">
          {ticket.email} had already applied, so this second payment has been
          refunded. Your original application is at the link from the first
          time, or on this device at the application page if you used it then.
        </p>
      </section>
    );
  }

  // Taken back by an officer, usually for not paying by the deadline; see
  // hackathon_release() in supabase/hackathon.sql.
  if (ticket.status === "released") {
    return (
      <section className="hk-tk__msg">
        <span className="hk-chip">RELEASED</span>
        <h1 className="hk-tk__title">This spot was released.</h1>
        <p className="hk-tk__text">
          The spot for {ticket.name} has been given up, usually because the{" "}
          {APPLY.fee} wasn&rsquo;t paid by {APPLY.payByLabel}, and it has gone
          to the next person on the waitlist. If that&rsquo;s a mistake, email
          the organizers.
        </p>
        {open ? <BracketButton href={withBase(LINKS.signUp)}>Apply again</BracketButton> : null}
      </section>
    );
  }

  const actions = (withCalendar) => (
    <div className="hk-tk__actions">
      <BracketButton onClick={() => window.print()}>Print</BracketButton>
      {withCalendar ? (
        <BracketButton href={withBase(LINKS.calendar)} download>
          Add to calendar
        </BracketButton>
      ) : null}
      <BracketButton onClick={copyLink}>{copied ? "Link copied" : "Copy link"}</BracketButton>
    </div>
  );

  const card = (status) => (
    <TicketCard
      name={ticket.name}
      email={ticket.email}
      phone={ticket.phone}
      year={ticket.class_year}
      college={ticket.college}
      status={status}
      spot={ticket.spot}
      waitlistPosition={ticket.waitlist_position}
      capacity={ticket.capacity}
      token={ticket.token}
      feePaid={ticket.fee_paid}
    />
  );

  // Before decision day: an application, whatever the row says.
  if (!APPLY.decisionsOut) {
    return (
      <section className="hk-tk__issued" aria-labelledby="tk-h">
        <div className="hk-tk__head">
          <span className="hk-chip">APPLICATION</span>
          <h1 id="tk-h" className="hk-tk__title">Application received.</h1>
          <p className="hk-tk__text">
            We&rsquo;ll email {ticket.email} on {APPLY.decisionsLabel}, whatever
            the answer. Nothing to pay unless you&rsquo;re accepted. Bookmark
            this page: it&rsquo;s your application.
          </p>
        </div>

        {card("applied")}
        {actions(false)}

        <Steps
          chip="WHAT HAPPENS NEXT"
          title="From here"
          steps={[
            {
              head: `Decisions go out ${APPLY.decisionsLabel}.`,
              text: `We pick ${APPLY.spots} builders from every application and email everyone, accepted or not.`,
            },
            {
              head: `Accepted? Pay the ${APPLY.fee} by ${APPLY.payByLabel}.`,
              text: "We'll email you how. Paying confirms your spot; a spot that's still unpaid goes to the next person on the waitlist.",
            },
            {
              head: "Not this time? You're on the waitlist.",
              text: "Spots that aren't paid for go to the waitlist in order. If one comes to you, we'll email you and this page will show your seat.",
            },
          ]}
        />
      </section>
    );
  }

  const waitlist = ticket.status === "waitlist";
  const owes = !waitlist && !ticket.fee_paid;
  const headline = waitlist
    ? `You're #${ticket.waitlist_position} on the waitlist.`
    : `You're in. Seat ${ticket.spot} of ${ticket.capacity}.`;
  const seat = padSeat(ticket.spot);

  let lede;
  if (waitlist && ticket.refunded) {
    lede = "The last seat went while you were paying, so your $5 has been refunded. You're on the waitlist instead.";
  } else if (waitlist) {
    lede = `This is a waitlist place, not a seat. Seats that aren't paid for by ${APPLY.payByLabel} go to the waitlist in order. If one comes to you, this same link will show your seat number, and we'll let you know.`;
  } else if (owes) {
    lede = `You're accepted. ${EVENT.name} is ${APPLY.fee} per student: pay by ${APPLY.payByLabel} to keep your seat, and we'll email you how. If it's still unpaid then, the seat goes to the next person on the waitlist.`;
  } else {
    lede = `Your seat is held and your ${APPLY.fee} is paid. This page is your ticket: bookmark it, print it or screenshot it.`;
  }

  // Numbered from the data, so the pay step can come and go without
  // renumbering anything by hand.
  const steps = [
    owes && {
      head: `Pay the ${APPLY.fee} by ${APPLY.payByLabel}.`,
      text: "We'll email you how. Unpaid seats go to the next person on the waitlist.",
    },
    {
      head: `Come to ${EVENT.venue}.`,
      text: `Check-in opens ${checkInTime()}, with breakfast. Come before the opening ceremony; hacking starts at noon.`,
    },
    {
      head: "Give the desk your seat number.",
      text: (
        <>
          Yours is <strong className="hk-checkin__seat">{seat}</strong>. That is
          all we need to find you: no email, no QR code.
        </>
      ),
    },
    {
      head: "Show your Northeastern ID.",
      text: `The name on it should match the one on this ticket: ${ticket.name}. Then find your team and start building.`,
    },
  ].filter(Boolean);

  return (
    <section className="hk-tk__issued" aria-labelledby="tk-h">
      <div className="hk-tk__head">
        <span className={waitlist ? "hk-chip hk-chip--red" : "hk-chip"}>
          {waitlist ? "WAITLIST" : "TICKET"}
        </span>
        <h1 id="tk-h" className="hk-tk__title">{headline}</h1>
        <p className="hk-tk__text">{lede}</p>
      </div>

      {card(ticket.status)}
      {actions(!waitlist)}

      {!waitlist ? <Steps chip="BEFORE AND ON THE DAY" title="Checking in" steps={steps} /> : null}
    </section>
  );
}
