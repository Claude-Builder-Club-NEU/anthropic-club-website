import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /**
   * Absolute asset paths, which is Vite's default and the correct setting for
   * a site served from a domain root.
   *
   * This was "./". Relative paths resolve against the *document's* directory,
   * so they only survive while every route sits one level deep: /workshops
   * has base dir "/" and finds /assets, but /workshops/pitch has base dir
   * "/workshops/" and asks for /workshops/assets, which does not exist. The
   * page rendered its prerendered HTML and then loaded no CSS, no fonts and no
   * JavaScript at all.
   *
   * It was also a latent hazard on the existing routes: a trailing-slash
   * redirect on /about would have broken that page the same way.
   */
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
