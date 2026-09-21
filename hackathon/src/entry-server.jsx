import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";

/**
 * Server entry for the prerender step. scripts/prerender.mjs calls render()
 * once and injects the result into dist/index.html.
 *
 * There is no router: the site is a single page with anchors, so the only
 * thing the server needs to produce is that page.
 */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

export { HEAD } from "./lib/head";
