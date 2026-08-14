import { useId, useState } from "react";
import { KINDS, kindOf, formatEventTimeRange } from "../lib/events";
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
 */
const EventTile = ({ event, lead = false }) => {
  const [pinned, setPinned] = useState(false);
  const [peek, setPeek] = useState(false);
  const open = pinned || peek;
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
  const rsvp = event.rsvpUrl || LUMA_URL;

  return (
    <li
      className="event-tile"
      data-kind={kind}
      data-lead={lead ? "true" : undefined}
      /* On the tile, not the button, so the pointer can reach the RSVP link
         without the detail face closing under it. */
      onMouseEnter={() => setPeek(true)}
      onMouseLeave={() => setPeek(false)}
    >
      <div className="event-tile__box">
        {/* The toggle covers the whole card as an overlay rather than wrapping
            it, because the detail face contains a link and a link cannot live
            inside a button. First in the DOM so it comes before that link in
            tab order. */}
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

        {/* Both faces are always rendered, stacked in one grid cell, so the box
            is as tall as the taller of them and swapping between them cannot
            change the card's height. The hidden one keeps its space but leaves
            the accessibility tree and stops taking pointer events. */}
        <div className="event-tile__faces">
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
              <span className="event-tile__hint">Details</span>
            </div>
          </div>

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

            {/* The RSVP link parsed out of this entry's own calendar
                description. LUMA_URL is a club-wide fallback; with neither, no
                button rather than one that goes nowhere. */}
            {rsvp && (
              <a
                className="event-tile__rsvp"
                href={rsvp}
                target="_blank"
                rel="noopener noreferrer"
              >
                RSVP on Luma <ArrowRightIcon width={16} height={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default EventTile;
