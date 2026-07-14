import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**"]
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
      react,
      "react-hooks": reactHooks,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports
    },
    settings: {
      react: { version: "detect" }
    },
    rules: {
      /*
       * Imports
       */
      "simple-import-sort/imports": [
        "warn",
        {
          groups: [
            ["^(?!assets|components|constants|helpers|hooks)\\w", "^@\\w"], // node_modules packages, incl. scoped (@tanstack/react-query)
            ["^(assets|components|constants|helpers|hooks)(?!.*\\.scss$)(/|$)"], // aliased local imports, excluding scss
            ["^\\.\\.(?!.*\\.scss$)"], // parent-relative imports (../...), excluding scss
            ["^\\.(?!\\.)(?!.*\\.scss$)"], // same-folder imports (./...), excluding scss
            ["\\.scss$"] // scss imports, incl. CSS modules
          ]
        }
      ],
      "simple-import-sort/exports": "warn",

      /*
       * Base
       */
      "no-unused-vars": "off",
      "no-console": "warn",

      /*
       * TypeScript
       */
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",

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

      /*
       * React Hooks
       */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  prettierConfig
]);
