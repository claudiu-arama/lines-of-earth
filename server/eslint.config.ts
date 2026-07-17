import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  js.configs.recommended,
  ...(tsPlugin.configs["flat/recommended"] as unknown as object[]),
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "import-x": importX,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports
    },
    rules: {
      /*
       * Imports
       */
      "import-x/order": [
        "warn",
        {
          alphabetize: { caseInsensitive: true, order: "asc" },
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "type"
          ],
          "newlines-between": "always"
        }
      ],
      "simple-import-sort/exports": "warn",

      /*
       * Base
       */
      "no-unused-vars": "off",
      "no-console": ["warn", { allow: ["log"] }],
      "no-debugger": "warn",
      "prefer-promise-reject-errors": "warn",

      /*
       * TypeScript
       */
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" }
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "import-x/consistent-type-specifier-style": ["warn", "prefer-top-level"],

      /*
       * Unused imports
       */
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ]
    }
  },
  prettierConfig
]);
