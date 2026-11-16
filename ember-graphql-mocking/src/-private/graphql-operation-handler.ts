import {
  buildASTSchema,
  graphql,
  type DocumentNode,
  type GraphQLError,
} from 'graphql';
import { graphql as mswGraphql, HttpResponse } from 'msw';

export type OnErrors = (
  errors: readonly GraphQLError[],
  operationName: string,
) => void;

export function createGraphqlOperationHandler(
  schemaDocument: DocumentNode,
  getRootValue: () => object | null,
  onErrors?: OnErrors,
) {
  const schema = buildASTSchema(schemaDocument);

  return mswGraphql.operation(async ({ query, variables, operationName }) => {
    const { data, errors } = await graphql({
      rootValue: getRootValue(),
      schema,
      source: query,
      variableValues: variables,
    });

    if (errors && onErrors) {
      onErrors(errors, operationName);
    }

    return HttpResponse.json({ data, errors });
  });
}
