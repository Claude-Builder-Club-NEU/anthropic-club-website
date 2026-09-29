import { StrictMode } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import "./index.css";
import "./pages.css";
import App from "./App.jsx";
import { pageFromPath } from "./lib/pages";

const container = document.getElementById("root");
const page = pageFromPath(window.location.pathname, import.meta.env.BASE_URL);

const tree = (
  <StrictMode>
    <App page={page} />
  </StrictMode>
);

/**
 * The pages are prerendered, so the normal path is hydration.
 *
 * firstElementChild rather than hasChildNodes: in dev the template still holds
 * the bare `<!--app-html-->` comment, which is a child node but not markup.
 * Hydrating against it fails, so dev falls through to createRoot.
 */
if (container.firstElementChild) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
