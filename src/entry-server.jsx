import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
// react-router v7 merged the packages: StaticRouter comes from `react-router`,
// not the old `react-router-dom/server` path.
import { StaticRouter } from "react-router";
import App from "./App.jsx";

/**
 * Server entry for the prerender step. scripts/prerender.mjs calls this once
 * per route and injects the result into dist/index.html.
 */
export function render(url) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>
  );
}

/**
 * Re-exported so the prerenderer gets them through this bundle rather than
 * importing src/lib/seo.js with bare Node, which cannot resolve Vite's
 * extensionless import paths.
 */
export { ROUTES, headFor, SITE_ORIGIN } from "./lib/seo";
