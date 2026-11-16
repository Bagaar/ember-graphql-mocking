import type { DocumentNode } from 'graphql';
import type { SetupWorker, StartOptions } from 'msw/browser';
import type { OnErrors } from './-private/graphql-operation-handler.ts';

interface StartGraphqlMockingOptions {
  enabled?: boolean;
  resolvers: object | (() => Promise<object>);
  mswStartOptions?: StartOptions;
  onErrors?: OnErrors;
}

const logErrors: OnErrors = (errors, operationName) => {
  console.error(`GraphQL errors in "${operationName}":`, errors);
};

export async function startGraphqlMocking(
  schemaDocument: DocumentNode,
  {
    enabled = true,
    resolvers,
    mswStartOptions,
    onErrors = logErrors,
  }: StartGraphqlMockingOptions,
): Promise<SetupWorker | undefined> {
  if (!enabled) {
    return;
  }

  // Loaded lazily so MSW, graphql-js and the resolvers stay out of the
  // initial bundle when mocking is disabled.
  const [{ setupWorker }, { createGraphqlOperationHandler }, rootValue] =
    await Promise.all([
      import('msw/browser'),
      import('./-private/graphql-operation-handler.ts'),
      typeof resolvers === 'function' ? resolvers() : resolvers,
    ]);

  const worker = setupWorker(
    createGraphqlOperationHandler(schemaDocument, () => rootValue, onErrors),
  );

  await worker.start(mswStartOptions);

  return worker;
}
