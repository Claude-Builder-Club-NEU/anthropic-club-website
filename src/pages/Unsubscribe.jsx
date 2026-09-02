import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { hasBackend, requestUnsubscribe, validate } from "../lib/unsubscribe";
import { INSTAGRAM } from "../lib/links";

/**
 * Unsubscribe. Reached only from the footer of the newsletter.
 *
 * Mode: complete one task and leave. Somebody arriving here has already decided
 * something; the page's whole job is to take one address and get out of the
 * way. There is no "are you sure", no survey asking why, and no offer of a
 * reduced sending frequency, because every one of those is a way of not doing
 * what was asked.
 *
 * The request is written to the club's own Supabase project and the board reads
 * it from the dashboard. It used to be email only, which failed silently for
 * weeks: the mail was accepted and delivered somewhere nobody was reading. The
 * email is still sent as a nudge, but the row is the record. See
 * lib/unsubscribe.js.
 *
 * THE ADDRESS IS TYPED, NOT CARRIED IN THE URL.
 *
 * The obvious build is a per-recipient link ending `?email=someone@neu.edu`, so
 * unsubscribing is one click. It is not built that way on purpose: a query
 * string travels into browser history, into the Referer header of anything the
 * page links to, into server logs, and into Google Analytics, which this site
 * runs. That would publish a member's address to several places in exchange for
 * saving them one field. Typing an address you already know is a small cost;
 * leaking it is not a small harm.
 *
 * The trade-off it leaves, stated plainly because it is real: anyone holding
 * the link can submit anyone's address. That is why this sends a request a
 * person reads rather than performing a removal on its own.
 *
 * The route is noindex (lib/seo.js), so it stays out of search results and out
 * of sitemap.xml, and nothing on the site links to it.
 */
const Unsubscribe = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const doneRef = useRef(null);
  const botRef = useRef(null);

  // Move focus to the confirmation so the outcome is announced rather than
  // silently replacing the form for anyone not looking at that part of the
  // page. Same call CheckInForm makes.
  useEffect(() => {
    if (status === "done") doneRef.current?.focus();
  }, [status]);

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;

    const found = validate(email);
    if (found) {
      setError(found);
      document.getElementById("unsub-email")?.focus();
      return;
    }

    setStatus("sending");
    setError("");
    try {
      await requestUnsubscribe(email, { botcheck: botRef.current?.checked });
      setStatus("done");
    } catch {
      setError("We could not send that. Try again in a moment.");
      setStatus("idle");
      document.getElementById("unsub-email")?.focus();
    }
  }

  /* --- Not configured --------------------------------------------------- */
  /* Same degradation as the check-in form: say so and give a real way through,
     rather than a field that would report success and store nothing. This is
     the failure mode that actually bit us, so the page must never render a
     working-looking form it cannot back. */
  if (!hasBackend) {
    return (
      <Shell>
        <h1 style={{ maxWidth: "18ch" }}>Unsubscribe</h1>
        <p className="lead mt-6">
          This page is not switched on yet. Message us and we will take you off
          the list by hand.
        </p>
        <p className="mt-8">
          <a
            className="btn btn--primary"
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us on Instagram
          </a>
        </p>
      </Shell>
    );
  }

  /* --- Done ------------------------------------------------------------- */
  if (status === "done") {
    return (
      <Shell>
        <h1 tabIndex={-1} ref={doneRef} style={{ maxWidth: "18ch" }}>
          You&apos;re off the list.
        </h1>
        <p className="lead mt-6">
          We have your request. A board member removes addresses by hand, so you
          may get one more newsletter if this landed close to a send.
        </p>
        <p className="mt-4 text-gray-text">
          Nothing else changes. You can still come to any session, and you can
          sign up again whenever you like.
        </p>
        <p className="mt-10">
          <Link className="font-display text-small no-underline sweep" to="/">
            Back to claudeneu.com
          </Link>
        </p>
      </Shell>
    );
  }

  /* --- The form --------------------------------------------------------- */
  const sending = status === "sending";

  return (
    <Shell>
      <h1 style={{ maxWidth: "18ch" }}>Unsubscribe</h1>
      <p className="lead mt-6">
        Enter the address the newsletter arrives at and we will stop sending it.
      </p>

      <form className="mt-10" onSubmit={onSubmit} noValidate>
        {/* Web3Forms' own honeypot. Hidden from sight and from assistive tech;
            a submission with it filled is discarded server-side. */}
        <input
          type="checkbox"
          name="botcheck"
          ref={botRef}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ display: "none" }}
        />

        <div style={{ maxWidth: "26rem" }}>
          <label className="field-label" htmlFor="unsub-email">
            Email address
          </label>
          <input
            id="unsub-email"
            className="field-input"
            type="email"
            name="email"
            value={email}
            autoComplete="email"
            autoCapitalize="off"
            spellCheck="false"
            maxLength={254}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? "unsub-error" : "unsub-hint"}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
          />
          {error ? (
            <p className="field-error" id="unsub-error" role="alert">
              {error}
            </p>
          ) : (
            <p className="field-hint" id="unsub-hint">
              Any address. It does not have to be a Northeastern one.
            </p>
          )}
        </div>

        <p className="mt-8">
          <button type="submit" className="btn btn--coral" disabled={sending}>
            {sending ? "Sending" : "Unsubscribe"}
          </button>
        </p>
      </form>

      <p className="mt-10 text-meta text-gray-text" style={{ maxWidth: "46ch" }}>
        This only affects the newsletter. It does not remove you from Slack, and
        it is not a record of anything else.
      </p>
    </Shell>
  );
};

/** One inset and one measure on every state, so the heading never moves. */
const Shell = ({ children }) => (
  <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
    <div style={{ marginInline: "auto", maxWidth: "var(--measure)" }}>
      {children}
    </div>
  </section>
);

export default Unsubscribe;
