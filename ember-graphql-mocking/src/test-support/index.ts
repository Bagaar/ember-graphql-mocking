import { assert } from '@ember/debug';
import { type setupApplicationTest } from 'ember-qunit';
import { buildASTSchema, graphql, type DocumentNode } from 'graphql';
import merge from 'lodash.merge';
import { graphql as mswGraphql, HttpResponse } from 'msw';
import { setupWorker, type SetupWorker, type StartOptions } from 'msw/browser';

interface Options {
  mswStartOptions: StartOptions;
}

type WindowWithTestem = typeof window & { Testem: unknown };

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

export async function setupEmberGraphqlMocking(
  schemaDocument: DocumentNode,
  providedOptions?: Options,
) {
  const options = merge({}, DEFAULT_OPTIONS, providedOptions);

  createWorker();
  createGraphqlOperationHandler(schemaDocument);

  await startWorker(options.mswStartOptions);
}

export function setupGraphqlTest(
  hooks: Parameters<typeof setupApplicationTest>[0],
) {
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

  hooks.afterEach(clearRoot);
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

export function destroyWorker() {
  assert(
    'Cannot call `destroyWorker` before calling `setupEmberGraphqlMocking`. Please make sure to call `setupEmberGraphqlMocking(yourSchemaDocument[, yourProvidedOptions]);`.',
    worker,
  );

  worker.stop();

  worker = null;
}

function createWorker() {
  worker = setupWorker();
}

function createGraphqlOperationHandler(schemaDocument: DocumentNode) {
  assert('[BUG] `worker` is not set.', worker);

  const schema = buildASTSchema(schemaDocument);
  const graphqlOperation = mswGraphql.operation(async ({ request }) => {
    const { query, variables } = (await request.json()) || {
      query: '',
      variables: {},
    };

    const { data, errors } = await graphql({
      rootValue: root,
      schema,
      source: query,
      variableValues: variables,
    });

    return HttpResponse.json({ data, errors });
  });

  worker.use(graphqlOperation);
}

async function startWorker(mswStartOptions: Options['mswStartOptions']) {
  assert('[BUG] `worker` is not set.', worker);

  await worker.start(mswStartOptions);
}

function clearRoot() {
  root = null;
}
