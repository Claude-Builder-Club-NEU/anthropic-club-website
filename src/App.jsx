import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import StickyCta from "./components/StickyCta";
import Home from "./pages/Home";
import About from "./pages/About";
import Workshops from "./pages/Workshops";
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
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/workshops" element={<Workshops />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <StickyCta />
    </Layout>
  );
}

export default App;
