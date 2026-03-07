import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "@domain": path.resolve(__dirname, "src/domain/index.ts"),
      "@domain/*": path.resolve(__dirname, "src/domain"),
      "@infrastructure": path.resolve(__dirname, "src/infrastructure/index.ts"),
      "@infrastructure/*": path.resolve(__dirname, "src/infrastructure"),
    },
  },
});
