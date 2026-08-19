import { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import StickyCta from "./components/StickyCta";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Attendance from "./pages/Attendance";
import Polls from "./pages/Polls";
import Poll from "./pages/Poll";
import Pitch from "./pages/Pitch";
import NotFound from "./pages/NotFound";
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
          <Route path="/attendance" element={<Attendance />} />
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
