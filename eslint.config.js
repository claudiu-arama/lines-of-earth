import { defineConfig } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      react,
      'react-hooks': reactHooks
    },

    settings: {
      react: { version: 'detect' }
    },

    rules: {
      /*
       * Base
       */
      'no-unused-vars': 'off', // disable JS version
      'no-console': 'warn',

      /*
       * TypeScript basic
       */
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      /*
       * React
       */
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      /*
       * React Hooks
       */
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
]);