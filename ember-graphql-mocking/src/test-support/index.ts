import { assert } from '@ember/debug';
import type { DocumentNode } from 'graphql';
import { setupWorker, type SetupWorker, type StartOptions } from 'msw/browser';
import { createGraphqlOperationHandler } from '../-private/graphql-operation-handler.ts';

interface Options {
  mswStartOptions: StartOptions;
}

type WindowWithTestem = typeof window & { Testem: unknown };

type Hooks = {
  after(fn: () => void | Promise<void>): void;
  afterEach(fn: () => void | Promise<void>): void;
  before(fn: () => void | Promise<void>): void;
  beforeEach(fn: () => void | Promise<void>): void;
};

const IS_TESTEM = Boolean((window as WindowWithTestem).Testem);
const DEFAULT_OPTIONS: Options = {
  mswStartOptions: {
    quiet: IS_TESTEM,
    serviceWorker: {
      options: {
        scope: IS_TESTEM ? window.location.pathname : '/tests',
      },
    },
  },
};

let isSetupGraphqlTestCalled = false;
let root: object | null = null;
let worker: SetupWorker | null = null;
let options: Options | null = null;

export async function setupEmberGraphqlMocking(
  schemaDocument: DocumentNode,
  providedOptions?: Options,
) {
  options = { ...DEFAULT_OPTIONS, ...providedOptions };
  createWorker();
  useGraphqlOperationHandler(schemaDocument);
}

export function setupGraphqlTest(hooks: Hooks) {
  assert(
    'Cannot call `setupGraphqlTest` without providing the `hooks` argument. Please make sure to call `setupGraphqlTest(hooks);`.',
    hooks,
  );

  hooks.before(() => {
    isSetupGraphqlTestCalled = true;
  });

  hooks.after(() => {
    isSetupGraphqlTestCalled = false;
  });

  hooks.beforeEach(async () => {
    await startWorker(options?.mswStartOptions || {});
  });

  hooks.afterEach(async () => {
    await stopWorker();
    clearRoot();
  });
}

export function mockResolvers(resolvers: object) {
  assert(
    'Cannot call `mockResolvers` before calling `setupGraphqlTest`. Please make sure to call `setupGraphqlTest(hooks);`.',
    isSetupGraphqlTestCalled,
  );

  root = { ...root, ...resolvers };
}

export function getWorker() {
  assert(
    'Cannot call `getWorker` before calling `setupEmberGraphqlMocking`. Please make sure to call `setupEmberGraphqlMocking(yourSchemaDocument[, yourProvidedOptions]);`.',
    worker,
  );

  return worker;
}

export async function stopWorker() {
  assert(
    'Cannot call `stopWorker` before calling `setupEmberGraphqlMocking`. Please make sure to call `setupEmberGraphqlMocking(yourSchemaDocument[, yourProvidedOptions]);`.',
    worker,
  );

  await worker.stop();
}

function createWorker() {
  worker = setupWorker();
}

function useGraphqlOperationHandler(schemaDocument: DocumentNode) {
  assert('[BUG] `worker` is not set.', worker);

  worker.use(createGraphqlOperationHandler(schemaDocument, () => root));
}

async function startWorker(mswStartOptions: Options['mswStartOptions']) {
  assert('[BUG] `worker` is not set.', worker);

  await worker.start(mswStartOptions);
}

function clearRoot() {
  root = null;
}
