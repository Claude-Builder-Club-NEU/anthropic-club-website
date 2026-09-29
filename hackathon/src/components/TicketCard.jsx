import { SeatFigure } from "./SeatFigure";
import { WordmarkBlocks } from "./WordmarkBlocks";
import { EVENT } from "../lib/event";
import { checkInTime } from "../lib/schedule";
import { COLLEGES, YEARS, formatPhone, labelFor, padSeat } from "../lib/signup";

/**
 * The ticket: a landscape stub, like one you would tear at a door.
 *
 * Wide and short on purpose. The main part runs left to right: the block
 * HACK1984 mark and ADMIT ONE across the top on a red haze, the holder's name,
 * then their four details on ONE row, then when, where and check-in on a
 * strip along the bottom. The stub, past a dashed perforation, carries the
 * seat number in the same blocks as the seats-left figure on the home page,
 * because that number is what someone reads out at the check-in desk.
 *
 * A WAITLIST ticket says so three times — the chip, a line under the name,
 * and the stub — because the one mistake it must never allow is someone
 * turning up believing they have a seat. The FEE cell says whether the $5 is
 * still owed.
 *
 * Below 760px it stacks, and the details drop to two columns.
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
  feePaid = false,
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
        <header className="hk-ticket__top">
          <WordmarkBlocks className="hk-ticket__mark" />
          <span className="hk-ticket__admit">{waitlist ? "WAITLIST" : "ADMIT ONE"}</span>
        </header>

        <div className="hk-ticket__holder">
          <p className="hk-ticket__label">ISSUED TO</p>
          <p className="hk-ticket__name">{name}</p>
          {waitlist ? (
            <p className="hk-ticket__notice">
              WAITLIST #{number} · NOT A SEAT YET · THIS TICKET UPDATES IF ONE OPENS
            </p>
          ) : null}
        </div>

        <dl className="hk-ticket__fields">
          <div>
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
          <div>
            <dt>COLLEGE</dt>
            <dd>{labelFor(COLLEGES, college)}</dd>
          </div>
        </dl>

        <dl className="hk-ticket__when">
          <div>
            <dt>WHEN</dt>
            <dd>{EVENT.dateLong}</dd>
          </div>
          <div>
            <dt>WHERE</dt>
            <dd>{EVENT.venue}</dd>
          </div>
          <div>
            <dt>CHECK-IN</dt>
            <dd>Fri from {checkInTime({ long: false })}</dd>
          </div>
          <div>
            <dt>FEE</dt>
            <dd className={feePaid ? "hk-ticket__fee is-paid" : "hk-ticket__fee"}>
              {feePaid ? "$5 · PAID" : waitlist ? "$5 · IF SEATED" : "$5 · DUE"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="hk-ticket__stub">
        <span className="hk-ticket__stub-label">{waitlist ? "WAITLIST" : "SEAT"}</span>
        <SeatFigure value={number} />
        <span className="hk-ticket__stub-of">{waitlist ? "IN LINE" : `OF ${capacity}`}</span>
        <Barcode seed={token} />
        {token ? <span className="hk-ticket__code">{token.slice(0, 8).toUpperCase()}</span> : null}
      </div>
    </article>
  );
}
