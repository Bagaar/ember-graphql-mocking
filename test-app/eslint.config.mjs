import js from "@eslint/js";
import ember from "eslint-plugin-ember/recommended";
import n from "eslint-plugin-n";
import prettier from "eslint-plugin-prettier/recommended";
import qunit from "eslint-plugin-qunit/configs/recommended";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "blueprints/*/files/",
    "dist/",
    "coverage/",
    ".node_modules.ember-try/",
  ]),
  js.configs.recommended,
  ember.configs.base,
  prettier,
  {
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
    },
  },
  // ts files
  {
    files: ["**/*.ts"],
    extends: [ts.configs.recommended],
  },
  // node files
  {
    files: [
      ".prettierrc.js",
      ".stylelintrc.js",
      ".template-lintrc.js",
      "ember-cli-build.js",
      "testem.js",
      "blueprints/*/index.js",
      "config/**/*.js",
      "lib/*/index.js",
      "server/**/*.js",
    ],
    extends: [n.configs["flat/recommended-script"]],
  },
  {
    files: ["eslint.config.mjs"],
    extends: [n.configs["flat/recommended-module"]],
  },
  // test files
  {
    files: ["tests/**/*-test.{js,ts}"],
    extends: [qunit],
  },
]);
