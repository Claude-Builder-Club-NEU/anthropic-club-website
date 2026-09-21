import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // dist-ssr is build output like dist.
  globalIgnores(["dist", "dist-ssr", "src/styles/tokens.css"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^[A-Z_]",
          argsIgnorePattern: "^[A-Z_]",
          args: "after-used",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    // Server entry: never hot-reloaded, and it deliberately re-exports the
    // page head so the prerenderer can reach it through the SSR bundle.
    files: ["src/entry-server.jsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    // Build scripts run in Node, not the browser.
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
]);
