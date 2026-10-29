# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@bagaar/ember-graphql-mocking` is an Ember v2 addon that mocks GraphQL requests in Ember acceptance tests using Mock Service Worker (MSW v2). It's a pnpm workspace with two packages:

- `ember-graphql-mocking/` — the published addon (v2 addon, built with Rollup + `@embroider/addon-dev`, TypeScript, types emitted by Glint). It has no tests of its own.
- `test-app/` — a classic ember-cli app (Apollo Client + QUnit) that consumes the addon via `workspace:*` and holds all tests.

## Commands

Run from the repo root unless noted (Node version pinned via Volta in root `package.json`):

- `pnpm install` — also runs `prepare`, which builds the addon
- `pnpm build` — build the addon (`rollup` for JS + `glint --declaration` for types)
- `pnpm start` — watch-build the addon and serve the test app concurrently (http://localhost:4200)
- `pnpm lint` / `pnpm lint:fix` — lint all packages (eslint, ember-template-lint, glint/tsc, stylelint in test-app)
- `pnpm test` — run the Ember test suite (lint is separate: `pnpm lint`)

Inside `test-app/`:

- `pnpm test` / `ember test` — run tests once
- `ember test --server` — watch mode
- `ember test --filter "it merges resolvers"` — run a single test (matches module/test name)
- `./node_modules/.bin/ember try:one <scenario> --skip-cleanup` — run an ember-try scenario (see `test-app/config/ember-try.js`; CI runs LTS 4.8/4.12/5.4, release, beta, canary, embroider-safe)

The test app consumes the addon's built `dist/`, so rebuild the addon (or keep `pnpm start` running) after changing addon source before running tests.

## Architecture

All addon logic lives in `ember-graphql-mocking/src/test-support/index.ts` (exported as `@bagaar/ember-graphql-mocking/test-support`); `src/index.ts` is empty. It holds module-level state (`worker`, `root`, `options`, `isSetupGraphqlTestCalled`) shared across the three public calls:

1. `setupEmberGraphqlMocking(schemaDocument, options?)` — called once from `tests/test-helper` inside `QUnit.begin`. Creates an MSW browser worker and registers a single catch-all `graphql.operation` handler that executes each incoming query with graphql-js against `buildASTSchema(schema)`, using the current `root` as `rootValue`.
2. `setupGraphqlTest(hooks)` — starts the worker `beforeEach` and stops it + clears `root` `afterEach`. In test-app this is wired into the `setupApplicationTest` wrapper in `tests/helpers/index.ts`.
3. `mockResolvers({...})` — shallow-merges resolvers into `root`; keys are root field names, values are data or functions.

Because responses are produced by executing against the real schema, schema violations (e.g. a missing non-null field) surface as GraphQL errors in the test. Operations must be named for MSW to intercept them.

MSW details that matter when changing setup:
- The service worker script lives at `test-app/public/mockServiceWorker.js` (`msw.workerDirectory` in test-app `package.json`).
- Default start options set `quiet` and the service worker `scope` based on whether Testem is detected (`window.location.pathname` under Testem, `/tests` otherwise). User-provided `mswStartOptions` replace the defaults wholesale (shallow spread).

The addon's public entrypoints are controlled by both `rollup.config.mjs` (`publicEntrypoints`) and `package.json#exports`/`typesVersions` — keep them aligned when adding modules. The Rollup build also copies the root `README.md`, `LICENSE.md` and `CHANGELOG.md` into the addon package.

## Releases

Releases are automated with `release-plan`: every merged PR must carry one of the labels `breaking`, `enhancement`, `bug`, `documentation`, or `internal`; merging the generated "Prepare Release" PR publishes. See `RELEASE.md`.
