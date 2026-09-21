import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /**
   * Mounted at claudeneu.com/hackathon/, inside the club site's repo and its
   * Netlify deploy — see the README. Absolute rather than "./": a relative
   * base resolves against the document's directory, so /hackathon (no slash)
   * and /hackathon/ would ask for their assets in two different places.
   *
   * Vite applies this to everything it owns. Paths sitting in data files are
   * not its to rewrite, which is what src/lib/base.js is for.
   */
  base: "/hackathon/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
