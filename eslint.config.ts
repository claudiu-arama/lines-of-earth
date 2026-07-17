import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default defineConfig([
  {
    ignores: ["server/**", "dist/**", "node_modules/**"]
  },
  js.configs.recommended,
  ...(tsPlugin.configs["flat/recommended"] as unknown as object[]),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "import-x": importX,
      react,
      "react-hooks": reactHooks,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports
    },
    settings: {
      react: { version: "detect" },
      "import-x/internal-regex":
        "^(assets|components|constants|helpers|hooks)(/|$)"
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
            "object",
            "type"
          ],
          "newlines-between": "always",
          pathGroups: [
            {
              group: "object",
              pattern: "*.scss",
              position: "after",
              patternOptions: { matchBase: true }
            }
          ]
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
      ],

      /*
       * React
       */
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-curly-brace-presence": "warn",
      "react/jsx-no-useless-fragment": "warn",

      /*
       * React Hooks
       */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  prettierConfig
]);
