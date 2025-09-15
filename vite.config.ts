import { defineConfig } from "vite";
export default defineConfig({
  root: "link",
  base: "/",
  build: { outDir: "../dist", emptyOutDir: true }
});
