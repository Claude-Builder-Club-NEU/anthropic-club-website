import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";

/**
 * Server entry for the prerender step. scripts/prerender.mjs calls render()
 * once per page and writes each into its own index.html.
 */
export function render(page = "home") {
  return renderToString(
    <StrictMode>
      <App page={page} />
    </StrictMode>
  );
}

export { headFor } from "./lib/head";
export { PAGES, PAGE_NAMES } from "./lib/pages";
