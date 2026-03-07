import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "@application": path.resolve(__dirname, "src/application/index.ts"),
      "@application/*": path.resolve(__dirname, "src/application"),
      "@composition": path.resolve(__dirname, "src/composition/index.ts"),
      "@composition/*": path.resolve(__dirname, "src/composition"),
      "@domain": path.resolve(__dirname, "src/domain/index.ts"),
      "@domain/*": path.resolve(__dirname, "src/domain"),
      "@infrastructure": path.resolve(__dirname, "src/infrastructure/index.ts"),
      "@infrastructure/*": path.resolve(__dirname, "src/infrastructure"),
    },
  },
});
