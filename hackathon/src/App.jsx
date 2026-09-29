import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Sponsor } from "./pages/Sponsor";
import { Signup } from "./pages/Signup";
import { Ticket } from "./pages/Ticket";

/**
 * The shell every page shares: the header, one page's <main>, the footer.
 *
 * `page` is decided once — by the prerenderer for each HTML file, and by
 * main.jsx from the URL in the browser (src/lib/pages.js) — so the server and
 * the client always render the same tree and hydration has nothing to fix.
 *
 * No SVG filters on any page. The wordmark and the Seats figure were both
 * once real type under a pixelate filter; both are drawn blocks now
 * (WordmarkBlocks.jsx, SeatFigure.jsx), because the filter rendered nothing
 * at all in some browsers and the figure vanished on phones.
 *
 * The header and footer sit outside <main>, which is what those elements are
 * for and what "skip to main content" expects.
 */
const PAGES = { home: Home, sponsor: Sponsor, signup: Signup, ticket: Ticket };

export default function App({ page = "home" }) {
  const Page = PAGES[page] || Home;
  return (
    <div className="hk-page">
      <Header />
      <Page />
      <Footer />
    </div>
  );
}
