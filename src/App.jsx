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
import NotFound from "./pages/NotFound";
import { UNSUBSCRIBE_PATH } from "./lib/unsubscribe";
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

        <Route element={<SiteChrome />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
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
