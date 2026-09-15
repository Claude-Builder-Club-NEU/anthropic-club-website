import { useId, useState } from "react";
import {
  KINDS,
  kindOf,
  formatEventTimeRange,
  rsvpLabel,
  statusOf,
} from "../lib/events";
import { LUMA_URL } from "../lib/links";
import { ArrowRightIcon } from "./Icons";

/**
 * Feature tile for one upcoming event. Up to three sit above the calendar.
 *
 * TWO FACES, SWAPPED IN PLACE. At rest the tile shows the date and the
 * headline facts; hovering or clicking replaces that content with the detail
 * face. The box does not change size, so nothing on the page moves: both faces
 * live in a box with a fixed minimum height, and the row is stretched so every
 * tile matches the tallest. This is the supplied design's behaviour and it is
 * also the reason the earlier expanding version was wrong.
 *
 * Open for two independent reasons, because they behave differently:
 *   peek   — the pointer is over the tile. Transient; leaving closes it.
 *   pinned — clicked, or activated with Enter or Space. Sticky, so it survives
 *            the pointer leaving, and so touch and keyboard work at all.
 *
 * The toggle is a real <button> carrying aria-expanded. The RSVP link cannot
 * live inside it, so it sits beneath as a sibling and appears with the detail
 * face; tabbing goes button, then link.
 *
 * NOT BUILT: the supplied design has a third detail row, "Who: Open to all".
 * A Google Calendar entry has no such field, and inventing one would be making
 * up facts about a session. When/Where come from real fields; Who does not.
 *
 * `detailOnly` RENDERS THE DETAIL FACE AND NOTHING ELSE, and exists for
 * /fallfest, where the card is the whole point of the page rather than one of
 * three in a row. Two faces are correct on a calendar you are scanning; they
 * are wrong on a page reached by scanning a QR code at a club fair, because
 * there is no hover on a phone, so the card would land on the rest face and the
 * RSVP link would be unreachable without a tap first. On that page the reader
 * has five seconds and one thumb.
 *
 * It defaults to false, so /events renders exactly as it did.
 *
 * Three things go away when it is true, and all three are removals rather than
 * overrides. The rest face is not rendered at all, because the detail face is
 * self-sufficient: its eyebrow already carries the kind, the weekday and the
 * date, and the When row carries the time. The .event-tile__hit toggle is not
 * rendered, because a button carrying aria-expanded="true" that can collapse
 * nothing lies to a screen reader, and it is an inset:0 overlay sitting exactly
 * where a thumb is aiming for the RSVP link. And the hover handlers are not
 * attached, since they would only set state that is immediately ORed away.
 */
const EventTile = ({ event, lead = false, detailOnly = false }) => {
  const [pinned, setPinned] = useState(false);
  const [peek, setPeek] = useState(false);
  const open = detailOnly || pinned || peek;
  const detailId = useId();

  const kind = kindOf(event);
  const start = new Date(event.start);

  const day = String(start.getDate()).padStart(2, "0");
  const dow = start
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();
  const mon = start
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const fullDate = start.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const time = formatEventTimeRange(event);
  const status = statusOf(event);
  /**
   * A full session keeps NO signup link, rather than keeping a disabled-looking
   * one. The Luma page for a closed session still loads and still shows a
   * button, so sending somebody there is worse than sending them nowhere: they
   * would arrive, try to register, and find out on someone else's page. The
   * note replaces it in the same slot and says the thing outright.
   */
  const rsvp = status.full ? null : event.rsvpUrl || LUMA_URL;
  const label = rsvpLabel(rsvp);

  return (
    <li
      className="event-tile"
      data-kind={kind}
      data-lead={lead ? "true" : undefined}
      data-full={status.full ? "true" : undefined}
      /* On the tile, not the button, so the pointer can reach the RSVP link
         without the detail face closing under it. */
      onMouseEnter={detailOnly ? undefined : () => setPeek(true)}
      onMouseLeave={detailOnly ? undefined : () => setPeek(false)}
    >
      <div className="event-tile__box">
        {/* The toggle covers the whole card as an overlay rather than wrapping
            it, because the detail face contains a link and a link cannot live
            inside a button. First in the DOM so it comes before that link in
            tab order. */}
        {!detailOnly && (
          <button
            type="button"
            className="event-tile__hit"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={() => setPinned((p) => !p)}
          >
            <span className="sr-only">
              {event.title}, {fullDate}. Show details
            </span>
          </button>
        )}

        {/* Both faces are always rendered, stacked in one grid cell, so the box
            is as tall as the taller of them and swapping between them cannot
            change the card's height. The hidden one keeps its space but leaves
            the accessibility tree and stops taking pointer events. */}
        <div className="event-tile__faces">
          {!detailOnly && (
            <div className="event-tile__face" data-face="rest" aria-hidden={open}>
              <div className="event-tile__top">
                <span className="event-tile__eyebrow">
                  <span className="kind-swatch" aria-hidden="true" />
                  {KINDS[kind].label}
                </span>
                <span className="event-tile__day">{day}</span>
                <span className="event-tile__dow">
                  {dow} · {mon}
                </span>
              </div>

              <div className="event-tile__bottom">
                <span className="event-tile__title">{event.title}</span>
                <span className="event-tile__meta">
                  {time}
                  {event.location ? ` · ${event.location}` : ""}
                </span>
                {/* ON THE REST FACE, which is the whole point. The detail face
                    is behind a hover or a tap, and somebody scanning the row
                    deciding which session to go to must not have to open a
                    tile to find out that one of them has no seats. It replaces
                    the "Details" hint rather than sitting beside it: the tile
                    still opens, but the more useful word is this one. */}
                {status.full ? (
                  <span className="event-tile__full">{status.note}</span>
                ) : (
                  <span className="event-tile__hint">Details</span>
                )}
              </div>
            </div>
          )}

          <div
            className="event-tile__face"
            data-face="detail"
            id={detailId}
            aria-hidden={!open}
          >
            <span className="event-tile__eyebrow">
              <span className="kind-swatch" aria-hidden="true" />
              {KINDS[kind].label} · {dow} · {mon} {start.getDate()}
            </span>

            <span className="event-tile__title">{event.title}</span>

            {event.description && (
              <p className="event-tile__blurb">{event.description}</p>
            )}

            <dl className="event-rows">
              <div className="event-row">
                <dt className="event-row__label">When</dt>
                <dd className="event-row__value">{time}</dd>
              </div>
              {event.location && (
                <div className="event-row">
                  <dt className="event-row__label">Where</dt>
                  <dd className="event-row__value">{event.location}</dd>
                </div>
              )}
            </dl>

            {/* The signup link parsed out of this entry's own calendar
                description. LUMA_URL is a club-wide fallback; with neither, no
                button rather than one that goes nowhere. The wording follows
                the destination: Luma entries read "RSVP on Luma", a Google
                Form reads "Sign up". */}
            {rsvp && (
              <a
                className="event-tile__rsvp"
                href={rsvp}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label.full} <ArrowRightIcon width={16} height={16} />
              </a>
            )}

            {/* Not a disabled <button>. There is no action to offer, so the
                honest control is no control: a disabled button is a thing a
                reader keeps trying to press. Plain text in the slot the button
                would have taken, which also keeps the two tiles the same
                height as each other. */}
            {status.full && (
              <p className="event-tile__fullnote">{status.note}</p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default EventTile;
