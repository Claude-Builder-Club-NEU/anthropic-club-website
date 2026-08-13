import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // dist-ssr is build output like dist, and was being linted.
  globalIgnores(["dist", "dist-ssr"]),
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
          // Components destructured out of props (`{ Icon }` then `<Icon />`)
          // read as unused arguments without eslint-plugin-react. Same
          // convention as varsIgnorePattern: PascalCase means a component.
          argsIgnorePattern: "^[A-Z_]",
          args: "after-used",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    // Server entry: never hot-reloaded, and it deliberately re-exports the
    // route table so the prerenderer can reach it through the SSR bundle.
    files: ["src/entry-server.jsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    // Build scripts run in Node, not the browser.
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
]);
