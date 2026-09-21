import { StrictMode } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const container = document.getElementById("root");

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);

/**
 * The page is prerendered, so the normal path is hydration.
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
