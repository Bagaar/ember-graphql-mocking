import { assert } from '@ember/debug';
import { buildASTSchema, graphql } from 'graphql';
import merge from 'lodash.merge';
import { graphql as mswGraphql, setupWorker } from 'msw';

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

export function setupEmberGraphqlMocking(
  QUnit,
  schemaDocument,
  providedOptions
) {
  const options = merge({}, DEFAULT_OPTIONS, providedOptions);

  QUnit.begin(() => {
    createWorker();
    createGraphqlOperationHandler(schemaDocument);

    return startWorker(options.mswStartOptions);
  });
}

export function setupGraphqlTest(hooks) {
  hooks.before(() => (isSetupGraphqlTestCalled = true));
  hooks.after(() => (isSetupGraphqlTestCalled = false));
  hooks.afterEach(clearRoot);
}

export function mockResolvers(resolvers) {
  assert(
    'Cannot call `mockResolvers` before calling `setupGraphqlTest`. Please make sure to call `setupGraphqlTest(hooks);`.',
    isSetupGraphqlTestCalled
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
  const graphqlOperation = mswGraphql.operation(async (req, res, ctx) => {
    const queryResult = await graphql({
      rootValue: root,
      schema,
      source: req.body.query,
      variableValues: req.variables,
    });

    return res(ctx.data(queryResult.data), ctx.errors(queryResult.errors));
  });

  worker.use(graphqlOperation);
}

function startWorker(mswStartOptions) {
  worker.start(mswStartOptions);
}

function clearRoot() {
  root = null;
}
