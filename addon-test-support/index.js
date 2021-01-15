import { buildASTSchema, graphql } from 'graphql';
import { graphql as graphqlMock, setupWorker } from 'msw';

const IS_TESTEM = Boolean(window.Testem);
const PATH_NAME = window.location.pathname;
const TEST_PATH = '/tests';

const SERVICE_WORKER_QUIET = IS_TESTEM;
const SERVICE_WORKER_SCOPE = IS_TESTEM ? PATH_NAME : TEST_PATH;
const SERVICE_WORKER_URL = '/ember-graphql-mocking-service-worker.js';

let root = null;
let schema = null;
let worker = null;

export function setupEmberGraphqlMocking(schemaDocument) {
  createWorker();
  createSchema(schemaDocument);
  createGraphqlOperationHandler();
}

export function setupGraphqlTest(hooks) {
  hooks.afterEach(clearRoot);
}

export function mockResolvers(resolvers) {
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
      url: SERVICE_WORKER_URL,
    },
  });
}

function createSchema(schemaDocument) {
  schema = buildASTSchema(schemaDocument);
}

function createGraphqlOperationHandler() {
  const graphqlOperation = graphqlMock.operation(async function (
    req,
    res,
    ctx
  ) {
    const queryResult = await graphql(
      schema,
      req.body.query,
      root,
      null,
      req.variables
    );

    return res(ctx.data(queryResult.data));
  });

  worker.use(graphqlOperation);
}

function clearRoot() {
  root = {};
}
