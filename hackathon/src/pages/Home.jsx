import { Hero } from "../components/Hero";
import { FindUs } from "../components/FindUs";
import { Sponsors } from "../components/Sponsors";
import { Tracks } from "../components/Tracks";
import { Apply } from "../components/Apply";
import { Schedule } from "../components/Schedule";
import { Workshops } from "../components/Workshops";
import { Details } from "../components/Details";
import { Organizers } from "../components/Organizers";

/**
 * The home page, /hackathon/.
 *
 * The order follows the questions someone arriving has, in the order they
 * have them: what it is (Hero), where to follow it (FindUs), who is behind
 * it, the sponsors tier by tier (Sponsors), the page's most important
 * section and the first thing a sponsor looks for; what you would build and
 * win (Tracks), how the weekend runs (Schedule), what anyone can come to
 * without applying (Workshops), how to get in (Apply); who is running it, the
 * organizing clubs, the partner clubs and a link to the team page
 * (Organizers); and what to bring (Details).
 *
 * The header's nav lists the sections in the same order (NAV in
 * src/lib/event.js).
 *
 * The header and footer are drawn by App, around whichever page this is.
 */
export function Home() {
  return (
    <main>
      <Hero />
      <FindUs />
      <Sponsors />
      <Tracks />
      <Schedule />
      <Workshops />
      <Apply />
      <Organizers />
      <Details />
    </main>
  );
}
