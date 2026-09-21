import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { FindUs } from "./components/FindUs";
import { Sponsors } from "./components/Sponsors";
import { Tracks } from "./components/Tracks";
import { Seats } from "./components/Seats";
import { Schedule } from "./components/Schedule";
import { Details } from "./components/Details";
import { Organizers } from "./components/Organizers";
import { Footer } from "./components/Footer";

/**
 * The page.
 *
 * The order is an argument: what it is (Hero), where to follow it (FindUs),
 * who backs it (Sponsors), what
 * you would build (Tracks), whether there is still room (Seats), how the
 * weekend runs (Schedule), who is running it (Organizers) and what you need
 * to bring (Details).
 *
 * Organizers sits between the timeline and the details deliberately: it
 * breaks up two long blocks of the same kind of object, and the credit reads
 * better after someone has seen what the weekend actually is.
 *
 * Seats sits immediately after Tracks because the tracks are where someone
 * decides they want in. There is no countdown: it was the band above the
 * footer and it is gone, along with its ASCII clock and the chrono field
 * behind it.
 *
 * The header and footer sit outside <main>, which is what those elements are
 * for and what "skip to main content" expects.
 */
export default function App() {
  return (
    <div className="hk-page">
      {/*
        The filter that pixelates the hero wordmark. It has to be in the
        document for `filter: url(#hk-pixel)` to resolve, and it is declared
        once here rather than inside the hero so nothing re-creates it.

        How it works: feFlood paints a small dot, feComposite crops the
        result to one tile, feTile repeats that into a grid of dots,
        compositing the text through it keeps only the pixels under a dot, and
        feMorphology dilates each survivor back out to fill its cell. The
        result is ordinary type with genuinely stepped edges — not a pixel
        typeface.

        EVERY DOT HERE IS 2x2, NEVER 1x1. Primitive subregions are in user
        space and get scaled by the device pixel ratio before rasterising: a
        1x1 dot rounds away to nothing below 1x, the grid comes back empty,
        and the filtered text disappears entirely. That is not hypothetical —
        it happens at any browser zoom under 100%, and it is how this was
        caught. The dilation radius is dropped by the same amount the dot
        gains, so the block size is unchanged.

        One grid left: 6px blocks, for the Seats figure. The hero wordmark
        had a pair of its own until it became a drawn bitmap — see
        WordmarkBlocks.jsx — and a filter can give a glyph stepped edges but
        never gaps between its cells, which is the whole character of that
        mark. The dilation is what the letter-spacing beside it pays back.
      */}
      <svg className="hk-defs" aria-hidden="true" focusable="false">
        <filter id="hk-pixel" x="-8%" y="-8%" width="116%" height="116%">
          <feFlood x="2" y="2" width="2" height="2" floodColor="#fff" />
          <feComposite width="6" height="6" />
          <feTile result="grid" />
          <feComposite in="SourceGraphic" in2="grid" operator="in" />
          <feMorphology operator="dilate" radius="2" />
        </filter>
      </svg>

      <Header />
      <main>
        <Hero />
        <FindUs />
        <Sponsors />
        <Tracks />
        <Seats />
        <Schedule />
        <Organizers />
        <Details />
      </main>
      <Footer />
    </div>
  );
}
