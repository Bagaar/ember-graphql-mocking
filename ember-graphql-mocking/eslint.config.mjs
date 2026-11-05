import js from '@eslint/js';
import ember from 'eslint-plugin-ember/recommended';
import n from 'eslint-plugin-n';
import prettier from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['blueprints/*/files/', 'dist/', 'declarations/', 'coverage/']),
  js.configs.recommended,
  ember.configs.base,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
  },
  // ts files
  {
    files: ['**/*.ts', '**/*.gts'],
    extends: [ts.configs.recommended],
  },
  // node files
  {
    files: ['.prettierrc.cjs', '.template-lintrc.cjs', 'addon-main.cjs'],
    extends: [n.configs['flat/recommended-script']],
  },
  {
    files: ['eslint.config.mjs', 'rollup.config.mjs'],
    extends: [n.configs['flat/recommended-module']],
  },
]);
