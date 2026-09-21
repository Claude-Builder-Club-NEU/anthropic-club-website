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
        No SVG filters on this page. The wordmark and the Seats figure were
        both once real type under a pixelate filter; both are drawn blocks
        now (WordmarkBlocks.jsx, SeatFigure.jsx), because the filter rendered
        nothing at all in some browsers and the figure vanished on phones.
      */}
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
