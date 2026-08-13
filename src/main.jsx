import { StrictMode } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { initAnalytics } from "./lib/analytics";

/**
 * The router lives here rather than inside App so the server entry can supply
 * StaticRouter for prerendering while the browser gets BrowserRouter.
 *
 * Every route is prerendered to static HTML, so the normal path is hydration.
 * createRoot is the fallback for a container the prerenderer did not produce.
 */
const container = document.getElementById("root");

const tree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// firstElementChild, not hasChildNodes: in dev the template still contains the
// bare `<!--app-html-->` comment, which is a child node but not prerendered
// markup. Hydrating against it fails.
if (container.firstElementChild) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}

// Loaded after interactive so it never competes with LCP.
initAnalytics();
