import { AsciiPanel } from "./AsciiPanel";
import { SectionHeading } from "./SectionHeading";
import { TRACKS, TRACK_COUNT } from "../lib/tracks";

/**
 * 3.4 Tracks.
 *
 * A 2 x 2 grid with no gap: the panels share their hairlines, so the four
 * read as one ruled block rather than four floating cards. Which panel draws
 * which edge is in the CSS, where the grid shape is.
 */
export function Tracks() {
  return (
    <section
      id="tracks"
      aria-labelledby="tracks-h"
      className="hk-section"
    >
      <SectionHeading
        id="tracks-h"
        chip="TRACKS"
        title="Four ways to build software that treats people like people"
      >
        Pick one track for your team. Each is judged on its own, with its own
        prize.
      </SectionHeading>

      <div className="hk-tracks">
        {TRACKS.map((track) => (
          <Track key={track.art} track={track} />
        ))}
      </div>
    </section>
  );
}

function Track({ track }) {
  return (
    <article className="hk-track">
      <AsciiPanel art={track.art} />

      <div className="hk-track__tags">
        <span className="hk-track__tag">TRACK</span>
        <span className="hk-track__tag">
          {track.index} / {TRACK_COUNT}
        </span>
      </div>

      <div className="hk-track__text">
        <h3 className="hk-track__title">{track.title}</h3>
        <p className="hk-track__desc">{track.description}</p>
      </div>

      {/* A description list, because that is what it is: each row is a term
          and its value, and a screen reader announces the pairing. */}
      <dl className="hk-track__facts">
        {track.facts.map((fact) => (
          <div className="hk-track__fact" key={fact.key}>
            <dt className="hk-track__fact-key">{fact.key}</dt>
            <dd className="hk-track__fact-value">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {/* PLACEHOLDER (SPEC §5): each track's sponsor. The square is the
          drawing, not an icon with meaning, so it is hidden. */}
      <div className="hk-track__sponsor">
        <span className="hk-track__swatch" aria-hidden="true">
          <span />
        </span>
        <span className="hk-track__sponsor-label">SPONSOR [TBD]</span>
      </div>
    </article>
  );
}
