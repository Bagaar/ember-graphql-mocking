import { assert } from '@ember/debug';
import { buildASTSchema, graphql } from 'graphql';
import { graphql as graphqlMock, setupWorker } from 'msw';

const IS_TESTEM = Boolean(window.Testem);
const PATH_NAME = window.location.pathname;
const TEST_PATH = '/tests';

const SERVICE_WORKER_QUIET = IS_TESTEM;
const SERVICE_WORKER_SCOPE = IS_TESTEM ? PATH_NAME : TEST_PATH;

let isSetupGraphqlTestCalled = false;
let root = null;
let worker = null;

export function setupEmberGraphqlMocking(schemaDocument) {
  createWorker();
  createGraphqlOperationHandler(schemaDocument);
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

function createWorker() {
  worker = setupWorker();

  worker.start({
    quiet: SERVICE_WORKER_QUIET,
    serviceWorker: {
      options: {
        scope: SERVICE_WORKER_SCOPE,
      },
    },
  });
}

function createGraphqlOperationHandler(schemaDocument) {
  const schema = buildASTSchema(schemaDocument);
  const graphqlOperation = graphqlMock.operation(async (req, res, ctx) => {
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

function clearRoot() {
  root = {};
}
