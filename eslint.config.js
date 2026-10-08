// Shared ESLint config for every JavaScript/TypeScript project in the monorepo.
// ESLint finds this file by walking up from the file being linted, so projects run `eslint .`
// with no config of their own. Formatting is Prettier's job; eslint-config-prettier turns off
// the rules that would fight it. Python, shell and other languages are not touched here.
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "**/build/",
      "**/coverage/",
      "**/.venv/",
      "**/*.min.js",
      // Tampermonkey userscripts run unbundled in the browser; they are not part of a project.
      "browser_extensions/tampermonkey/",
      // Nested git repos holding synced data, not code.
      "**/sync_files/",
    ],
  },

  js.configs.recommended,

  // Type-aware rules for TypeScript only. projectService picks the nearest tsconfig.json for
  // each file, so every project's own compiler settings apply while the rules stay shared.
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      // A `default` branch counts as handling the remaining union members.
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { considerDefaultExhaustiveForUnions: true },
      ],
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          // node:test's test()/describe()/it() return promises the runner owns.
          allowForKnownSafeCalls: [
            { from: "package", package: "node:test", name: ["test", "describe", "it", "suite"] },
          ],
        },
      ],
      "@typescript-eslint/no-misused-promises": "error",
      // Template literals with numbers/booleans are fine: `${port}` is how everyone logs a port.
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: true },
      ],
      // Named exports only (repo rule); this flags `export default`.
      "no-restricted-syntax": [
        "error",
        { selector: "ExportDefaultDeclaration", message: "Use named exports." },
      ],
      "no-console": "off",
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
    },
  },

  // Plain JS (config files, scripts): syntax rules only, no type information.
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: { globals: { ...globals.node } },
  },

  // Tests: fixtures and doubles are the point, so a few checks loosen.
  {
    files: ["**/tests/**/*.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },

  prettier,
);
