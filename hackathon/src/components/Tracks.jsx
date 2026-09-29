import { AsciiPanel } from "./AsciiPanel";
import { SectionHeading } from "./SectionHeading";
import { TRACKS, TRACK_COUNT } from "../lib/tracks";

/**
 * Three ways to win.
 *
 * The main track leads, full width, with its art on one side and its brief on
 * the other; the one prize and the sponsor track sit side by side under it.
 * Three equal panels in a row would say the three are the same size of
 * contest, and they are not: one is the track, one is a single prize, one is
 * a sponsor's.
 *
 * The panels share their hairlines. The grid's 1px gap shows the line colour
 * behind it, so every rule between panels is drawn once, whatever the shape —
 * which the old nth-child borders could only do for a fixed 2 x 2.
 */
export function Tracks() {
  return (
    <section id="tracks" aria-labelledby="tracks-h" className="hk-section">
      <SectionHeading id="tracks-h" chip="TRACKS" title="Three ways to win">
        A main track for software that protects the people using it, one prize
        for the idea most likely to become a company, and a sponsor track from
        Tavily with three places.
      </SectionHeading>

      <div className="hk-tracks">
        {TRACKS.map((track, i) => (
          <Track key={track.art} track={track} lead={i === 0} />
        ))}
      </div>
    </section>
  );
}

function Track({ track, lead }) {
  return (
    <article className={lead ? "hk-track hk-track--lead" : "hk-track"}>
      <div className="hk-track__media">
        <div className="hk-track__tags">
          <span className="hk-track__tag hk-track__tag--kind">{track.kind}</span>
          <span className="hk-track__tag">
            {track.index} / {TRACK_COUNT}
          </span>
        </div>
        <AsciiPanel art={track.art} />
      </div>

      <div className="hk-track__content">
        <div className="hk-track__text">
          <h3 className="hk-track__title">{track.title}</h3>
          <p className="hk-track__desc">{track.description}</p>
          <p className="hk-track__body">{track.body}</p>
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

        {track.sponsor ? (
          <div className="hk-track__sponsor">
            {/* The square is the drawing, not an icon with meaning. */}
            <span className="hk-track__swatch" aria-hidden="true">
              <span />
            </span>
            <span className="hk-track__sponsor-label">
              SPONSORED BY {track.sponsor}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
