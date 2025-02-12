import { assert } from '@ember/debug';
import { buildASTSchema, graphql as graphql$1 } from 'graphql';
import { graphql, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

const IS_TESTEM = Boolean(window.Testem);
const DEFAULT_OPTIONS = {
  mswStartOptions: {
    quiet: IS_TESTEM,
    serviceWorker: {
      options: {
        scope: IS_TESTEM ? window.location.pathname : '/tests'
      }
    }
  }
};
let isSetupGraphqlTestCalled = false;
let root = null;
let worker = null;
let options = null;
async function setupEmberGraphqlMocking(schemaDocument, providedOptions) {
  options = {
    ...DEFAULT_OPTIONS,
    ...providedOptions
  };
  createWorker();
  createGraphqlOperationHandler(schemaDocument);
}
function setupGraphqlTest(hooks) {
  assert('Cannot call `setupGraphqlTest` without providing the `hooks` argument. Please make sure to call `setupGraphqlTest(hooks);`.', hooks);
  hooks.before(() => {
    isSetupGraphqlTestCalled = true;
  });
  hooks.after(() => {
    isSetupGraphqlTestCalled = false;
  });
  hooks.beforeEach(async () => {
    await startWorker(options?.mswStartOptions || {});
  });
  hooks.afterEach(() => {
    stopWorker();
    clearRoot();
  });
}
function mockResolvers(resolvers) {
  assert('Cannot call `mockResolvers` before calling `setupGraphqlTest`. Please make sure to call `setupGraphqlTest(hooks);`.', isSetupGraphqlTestCalled);
  root = {
    ...root,
    ...resolvers
  };
}
function getWorker() {
  assert('Cannot call `getWorker` before calling `setupEmberGraphqlMocking`. Please make sure to call `setupEmberGraphqlMocking(yourSchemaDocument[, yourProvidedOptions]);`.', worker);
  return worker;
}
function stopWorker() {
  assert('Cannot call `destroyWorker` before calling `setupEmberGraphqlMocking`. Please make sure to call `setupEmberGraphqlMocking(yourSchemaDocument[, yourProvidedOptions]);`.', worker);
  worker.stop();
}
function createWorker() {
  worker = setupWorker();
}
function createGraphqlOperationHandler(schemaDocument) {
  assert('[BUG] `worker` is not set.', worker);
  const schema = buildASTSchema(schemaDocument);
  const graphqlOperation = graphql.operation(async ({
    request
  }) => {
    const {
      query,
      variables
    } = (await request.json()) || {
      query: '',
      variables: {}
    };
    const {
      data,
      errors
    } = await graphql$1({
      rootValue: root,
      schema,
      source: query,
      variableValues: variables
    });

    // @ts-expect-error latest versions of msw return a type which is ObjMap<unknown> | null | undefined, which seems incompatible with the .json() method
    return HttpResponse.json({
      data,
      errors
    });
  });
  worker.use(graphqlOperation);
}
async function startWorker(mswStartOptions) {
  assert('[BUG] `worker` is not set.', worker);
  await worker.start(mswStartOptions);
}
function clearRoot() {
  root = null;
}

export { getWorker, mockResolvers, setupEmberGraphqlMocking, setupGraphqlTest, stopWorker };
//# sourceMappingURL=index.js.map
