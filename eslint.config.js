import antfu from "@antfu/eslint-config";
import prettierConfig from "eslint-config-prettier";
import importBoundaries from "eslint-plugin-import-boundaries";
import { boundaries } from "./boundaries.js";

export default antfu(
  {
    react: false,
    typescript: true,
    stylistic: false,
    markdown: false,
    ignores: [
      "reports/**",
      "dist/**",
      ".stryker-tmp/**",
      "coverage/**",
      "node_modules/**",
      "eslint-rules/**/*.js", // Ignore compiled ESLint rule files
    ],
    languageOptions: {
      globals: {
        describe: true,
        it: true,
        expect: true,
        vi: true,
        beforeAll: true,
        beforeEach: true,
        afterEach: true,
        afterAll: true,
      },
    },
    rules: {
      "no-console": ["error", { allow: ["error"] }],
      "import/no-duplicates": ["error", { "prefer-inline": false }],
    },
  },
  {
    // Define plugin once for all config blocks
    plugins: {
      "import-boundaries": importBoundaries,
    },
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "import-boundaries/enforce": [
        "error",
        {
          rootDir: "src",
          boundaries,
          fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
        },
      ],
    },
  },
  {
    files: [
      "**/*.test.{ts,js}",
      "**/*.spec.{ts,js}",
      "**/*.mock.{ts,js}",
      "**/__tests__/**",
      "**/__mocks__/**",
    ],
    languageOptions: {
      globals: {
        describe: true,
        it: true,
        expect: true,
        vi: true,
      },
    },
    rules: {
      "import-boundaries/enforce": [
        "error",
        {
          rootDir: "src",
          enforceBoundaries: false,
          boundaries,
          fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
        },
      ],
    },
  },
  {
    ignores: [
      "pnpm-lock.yaml",
      "node_modules/**",
      "reports/**",
      "dist/**",
      ".stryker-tmp/**",
      "coverage/**",
      "*.yml",
      "**/*.md",
      "**/*.mdx",
      "eslint-rules/**/*.js", // Ignore compiled ESLint rule files
      "eslint-rules/**/*.test.{ts,js}", // Ignore test files in eslint-rules
      "eslint-rules/**/*.spec.{ts,js}", // Ignore spec files in eslint-rules
    ],
  },
  prettierConfig,
);
