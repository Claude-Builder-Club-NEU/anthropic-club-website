import { SeatFigure } from "./SeatFigure";
import { WordmarkBlocks } from "./WordmarkBlocks";
import { EVENT } from "../lib/event";
import { COLLEGES, YEARS, formatPhone, labelFor, padSeat } from "../lib/signup";

/**
 * The ticket: a stub you would tear off at a door.
 *
 * Two parts either side of a perforation. The main part opens on the hero's
 * own band — the block HACK1984 mark on its scanlines, with the red haze
 * rising under it — then says who it is for and when and where. The stub
 * carries the seat number, drawn in the same blocks as the seats-left figure
 * on the home page, because that number is what someone reads out at the
 * check-in desk (see the ticket page's check-in steps).
 *
 * The barcode is decoration drawn from the ticket's token. Nothing scans it.
 */

function Barcode({ seed }) {
  // A deterministic pattern of bars from the token's hex digits: the same
  // ticket always draws the same code.
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
    <svg
      className="hk-ticket__barcode"
      viewBox={`0 0 ${x} 40`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
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
}) {
  const waitlist = status === "waitlist";
  const number = waitlist ? padSeat(waitlistPosition, 2) : padSeat(spot);

  return (
    <article
      className={waitlist ? "hk-ticket hk-ticket--waitlist" : "hk-ticket"}
      aria-label={
        waitlist
          ? `Waitlist place ${waitlistPosition} for ${name}`
          : `Seat ${spot} of ${capacity} for ${name}`
      }
    >
      <div className="hk-ticket__main">
        <header className="hk-ticket__band">
          <WordmarkBlocks className="hk-ticket__mark" />
          <span className="hk-ticket__admit">{waitlist ? "WAITLIST" : "ADMIT ONE"}</span>
        </header>

        <div className="hk-ticket__body">
          <p className="hk-ticket__label">ISSUED TO</p>
          <p className="hk-ticket__name">{name}</p>

          <dl className="hk-ticket__fields">
            <div className="hk-ticket__wide">
              <dt>EMAIL</dt>
              <dd>{email}</dd>
            </div>
            <div>
              <dt>PHONE</dt>
              <dd>{formatPhone(phone)}</dd>
            </div>
            <div>
              <dt>YEAR</dt>
              <dd>{labelFor(YEARS, year)}</dd>
            </div>
            <div className="hk-ticket__wide">
              <dt>COLLEGE</dt>
              <dd>{labelFor(COLLEGES, college)}</dd>
            </div>
          </dl>
        </div>

        <dl className="hk-ticket__when">
          <div>
            <dt>WHEN</dt>
            <dd>{EVENT.dateLong}</dd>
          </div>
          <div>
            <dt>WHERE</dt>
            <dd>{EVENT.venue}</dd>
          </div>
        </dl>
      </div>

      <div className="hk-ticket__stub">
        <span className="hk-ticket__stub-label">{waitlist ? "IN LINE" : "SEAT"}</span>
        <SeatFigure value={number} />
        <span className="hk-ticket__stub-of">{waitlist ? "ON THE WAITLIST" : `OF ${capacity}`}</span>
        <Barcode seed={token} />
        {token ? <span className="hk-ticket__code">{token.slice(0, 8).toUpperCase()}</span> : null}
      </div>
    </article>
  );
}
