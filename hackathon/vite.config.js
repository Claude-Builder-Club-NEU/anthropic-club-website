import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { hackathonApi } from "./dev/api.mjs";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Dev only: answers /hackathon/api/* the way the Netlify functions do in
  // production, with a mock when no keys are set. See dev/api.mjs.
  plugins: [react(), hackathonApi(loadEnv(mode, process.cwd(), ""))],
  /**
   * Mounted at claudeneu.com/hackathon/, inside the club site's repo and its
   * Netlify deploy — see the README. Absolute rather than "./": a relative
   * base resolves against the document's directory, so /hackathon (no slash)
   * and /hackathon/ would ask for their assets in two different places — and
   * now /hackathon/signup/ and /hackathon/ticket/ as well.
   *
   * Vite applies this to everything it owns. Paths sitting in data files are
   * not its to rewrite, which is what src/lib/base.js is for.
   */
  base: "/hackathon/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
}));
