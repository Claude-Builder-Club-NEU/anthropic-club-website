import { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import StickyCta from "./components/StickyCta";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Unsubscribe from "./pages/Unsubscribe";
import Attendance from "./pages/Attendance";
import Polls from "./pages/Polls";
import Poll from "./pages/Poll";
import Pitch from "./pages/Pitch";
import Join from "./pages/Join";
import FallFest from "./pages/FallFest";
import FeatureMe from "./pages/FeatureMe";
import Hackathon from "./pages/Hackathon";
import NotFound from "./pages/NotFound";
import { UNSUBSCRIBE_PATH } from "./lib/unsubscribe";
import { FEATURE_PATH } from "./lib/feature";
import { JOIN_PATH } from "./lib/links";
import "./App.css";

/**
 * Restores the top of the page on navigation. React Router keeps scroll
 * position by default, which lands you mid-page on a fresh route.
 *
 * `behavior: "instant"` deliberately — smooth scrolling would be a second
 * motion primitive, and the system allows exactly one.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // A hash target wins: /about#board should land on the board, not the top.
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}

/**
 * Every route that wears the site chrome. Layout supplies the header, the
 * footer and the <main> landmark; StickyCta sits inside it exactly where it
 * did before this became a layout route, so its behaviour is unchanged.
 */
const SiteChrome = () => (
  <Layout>
    <Outlet />
    <StickyCta />
  </Layout>
);

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Chromeless on purpose. The pitch flow fills the viewport and asks
            one question at a time; a header, a footer and a sticky "Join the
            club" CTA would all pull against the question on screen. It brings
            its own bar and its own <main>. Ranked above the catch-all by
            specificity, so the static segments win. */}
        <Route path="/events/pitch" element={<Pitch />} />

        {/* Chromeless for the same reason, and more so: this flow's own last
            button IS "Join the club", so a sticky CTA offering to join would be
            a second button for the thing already in progress. */}
        <Route path={JOIN_PATH} element={<Join />} />

        {/* Chromeless, and the argument is arithmetic rather than taste. The
            page is reached by scanning a QR code on a table sign at the club
            fair, so it is read on a phone in about five seconds. The site
            header is position:sticky, so it would cost 65px of every viewport
            for as long as the page is open, and that is very nearly the whole
            margin between the second tile's RSVP button being on screen and
            below the fold. See the header comment in pages/FallFest.jsx. */}
        <Route path="/fallfest" element={<FallFest />} />

        {/* Chromeless, and the third route to make that call. The full argument
            is in the header of pages/FeatureMe.jsx; the short version is two
            things. The flow's nav chevrons and its progress rail are fixed to
            the viewport, so inside Layout they land on top of the footer and in
            the same corner as the sticky CTA. And a sticky "Join the club"
            floating over a form written for people who have already joined is
            the /join problem reached from the other side. Its own bar closes to
            /blog rather than to /, since that is where most readers arrive from
            and what the page is about. */}
        <Route path={FEATURE_PATH} element={<FeatureMe />} />

        <Route element={<SiteChrome />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          {/* Chromed, unlike /fallfest above, even though this URL is also
              printed on something. Nothing on it competes for the fold: it is
              an ordinary content page that happens to be one line long today
              and will be a full one later, so stripping the chrome now would
              only mean re-deciding the question when the real copy lands. See
              pages/Hackathon.jsx. */}
          <Route path="/hackathon" element={<Hackathon />} />
          <Route path="/blog" element={<Blog />} />
          {/* Every published post is prerendered to its own HTML file, so an
              unknown slug is a genuine 404 from Netlify and never reaches this
              route in production. There is deliberately NO /blog/* rewrite in
              netlify.toml: the /polls/* one exists because a ballot has no
              prerendered file, and copying it here would cost per-post titles
              and hand crawlers a 200 for every typo. */}
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/attendance" element={<Attendance />} />
          {/* Reached only from the newsletter footer. The path is a random
              20-character slug, so it cannot be found by guessing, and the
              route is noindex in lib/seo.js, which also keeps it out of
              sitemap.xml. Nothing on the site links to it. The slug is
              imported rather than written out here so the router, the route
              table and the page cannot drift apart. */}
          <Route path={UNSUBSCRIBE_PATH} element={<Unsubscribe />} />

          <Route path="/polls" element={<Polls />} />
          {/* Dynamic: one ballot per poll file, so there is no prerendered
              HTML per slug. netlify.toml rewrites /polls/* to the hub so the
              client router can resolve it. */}
          <Route path="/polls/:slug" element={<Poll />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
