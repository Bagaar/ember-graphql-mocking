import { assert } from '@ember/debug';
import { buildASTSchema, graphql } from 'graphql';
import { graphql as graphqlMock, setupWorker } from 'msw';
import { begin, done } from 'qunit';

const IS_TESTEM = Boolean(window.Testem);
const DEFAULT_OPTIONS = {
  quiet: IS_TESTEM,
  scope: IS_TESTEM ? window.location.pathname : '/tests',
};

let isSetupGraphqlTestCalled = false;
let root = null;
let worker = null;

export function setupEmberGraphqlMocking(schemaDocument, providedOptions) {
  const options = {
    ...DEFAULT_OPTIONS,
    ...providedOptions,
  };

  begin(() => {
    createWorker(options);
    createGraphqlOperationHandler(schemaDocument);
  });

  done(() => {
    destroyWorker();
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

function createWorker(options) {
  worker = setupWorker();

  worker.start({
    quiet: options.quiet,
    serviceWorker: {
      options: {
        scope: options.scope,
      },
    },
  });
}

function destroyWorker() {
  worker.stop();
  worker = null;
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
  root = null;
}
