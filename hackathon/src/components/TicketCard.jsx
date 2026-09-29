import { SeatFigure } from "./SeatFigure";
import { Wordmark } from "./Wordmark";
import { EVENT } from "../lib/event";
import { COLLEGES, YEARS, formatPhone, labelFor } from "../lib/signup";

/**
 * The ticket: a stub you would tear off at a door.
 *
 * Two parts either side of a perforation. The body carries who it is for —
 * name, email, phone, school — and when and where; the stub carries the seat
 * number, drawn in the same blocks as the seats-left figure on the home page,
 * so the number you were given and the number that went down when you took it
 * are visibly the same kind of object.
 *
 * `preview` is the signup page's live version: the fields fill in as someone
 * types, and the seat is the one they would get if they paid now. It is
 * marked as a preview so nobody screenshots it as the real thing.
 *
 * The barcode is decoration drawn from the ticket's token. Nothing scans it;
 * check-in is by name and student ID.
 */

const pad = (n, width = 3) => String(Math.max(0, n || 0)).padStart(width, "0");

function Barcode({ seed }) {
  // A deterministic pattern of bars from the token's hex digits: the same
  // ticket always draws the same code, and the server render matches.
  const hex = (seed || "hack1984hack1984hack1984hack1984").replace(/[^0-9a-f]/gi, "");
  let x = 0;
  const bars = [];
  for (let i = 0; i < hex.length && x < 180; i += 1) {
    const v = parseInt(hex[i], 16);
    const w = 1 + (v % 3);
    bars.push(<rect key={i} x={x} y="0" width={w} height="40" />);
    x += w + 1 + ((v >> 2) % 3);
  }
  return (
    <svg className="hk-ticket__barcode" viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {bars}
    </svg>
  );
}

export function TicketCard({
  name,
  email,
  phone,
  year,
  college,
  status = "paid",
  spot,
  waitlistPosition,
  capacity = 100,
  token,
  preview = false,
}) {
  const waitlist = status === "waitlist";
  const number = waitlist ? pad(waitlistPosition, 2) : pad(spot);
  const school = [labelFor(YEARS, year), labelFor(COLLEGES, college)].filter(Boolean).join(" · ");

  return (
    <article
      className={["hk-ticket", waitlist && "hk-ticket--waitlist", preview && "hk-ticket--preview"]
        .filter(Boolean)
        .join(" ")}
      aria-label={
        waitlist
          ? `Waitlist place ${waitlistPosition} for ${name || "you"}`
          : `Seat ${spot} of ${capacity} for ${name || "you"}`
      }
    >
      <div className="hk-ticket__body">
        <div className="hk-ticket__top">
          <Wordmark />
          <span className="hk-ticket__admit">
            {preview ? "PREVIEW" : waitlist ? "WAITLIST" : "ADMIT ONE"}
          </span>
        </div>

        <p className="hk-ticket__name">{name || "Your name"}</p>

        <dl className="hk-ticket__fields">
          <div className="hk-ticket__wide">
            <dt>EMAIL</dt>
            <dd>{email || "you@northeastern.edu"}</dd>
          </div>
          <div>
            <dt>PHONE</dt>
            <dd>{formatPhone(phone) || "(617) 555-0100"}</dd>
          </div>
          <div>
            <dt>SCHOOL</dt>
            <dd>{school || "Year · College"}</dd>
          </div>
        </dl>

        <div className="hk-ticket__when">
          <span>{EVENT.dateLong}</span>
          <span>{EVENT.venue}</span>
        </div>
      </div>

      <div className="hk-ticket__stub">
        <span className="hk-ticket__stub-label">{waitlist ? "WAITLIST" : "SEAT"}</span>
        <SeatFigure value={waitlist ? `${number}` : number} />
        <span className="hk-ticket__stub-of">
          {waitlist ? "IN LINE" : `OF ${capacity}`}
        </span>
        <Barcode seed={token} />
        {token ? (
          <span className="hk-ticket__code">{token.slice(0, 8).toUpperCase()}</span>
        ) : null}
      </div>
    </article>
  );
}
