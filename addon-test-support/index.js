import { assert } from '@ember/debug';
import { buildASTSchema, graphql } from 'graphql';
import merge from 'lodash.merge';
import { graphql as mswGraphql, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

const IS_TESTEM = Boolean(window.Testem);
const DEFAULT_OPTIONS = {
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
let root = null;
let worker = null;

export async function setupEmberGraphqlMocking(
  schemaDocument,
  providedOptions,
) {
  const options = merge({}, DEFAULT_OPTIONS, providedOptions);

  createWorker();
  createGraphqlOperationHandler(schemaDocument);

  await startWorker(options.mswStartOptions);
}

export function setupGraphqlTest(hooks) {
  hooks.before(() => (isSetupGraphqlTestCalled = true));
  hooks.after(() => (isSetupGraphqlTestCalled = false));
  hooks.afterEach(clearRoot);
}

export function mockResolvers(resolvers) {
  assert(
    'Cannot call `mockResolvers` before calling `setupGraphqlTest`. Please make sure to call `setupGraphqlTest(hooks);`.',
    isSetupGraphqlTestCalled,
  );

  root = { ...root, ...resolvers };
}

export function getWorker() {
  return worker;
}

export function destroyWorker() {
  worker.stop();

  worker = null;
}

function createWorker() {
  worker = setupWorker();
}

function createGraphqlOperationHandler(schemaDocument) {
  const schema = buildASTSchema(schemaDocument);
  const graphqlOperation = mswGraphql.operation(async ({ request }) => {
    const { query, variables } = await request.json();
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

async function startWorker(mswStartOptions) {
  await worker.start(mswStartOptions);
}

function clearRoot() {
  root = null;
}
