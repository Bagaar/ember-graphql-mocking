import {
  buildASTSchema,
  graphql,
  type DocumentNode,
  type GraphQLError,
} from 'graphql';
import { graphql as mswGraphql } from 'msw/graphql';
import { HttpResponse } from 'msw/http';

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

  return mswGraphql
    .link('*')
    .operation(async ({ query, variables, operationName }) => {
      const { data, errors } = await graphql({
        rootValue: getRootValue(),
        schema,
        source: query,
        variableValues: variables,
      });

      if (errors && onErrors) {
        onErrors(errors, operationName);
      }

      // MSW types its response body against its own `graphql` dependency, which
      // can be a different major than ours, so hand it the serialized errors.
      return HttpResponse.json({
        data,
        errors: errors?.map((error) => error.toJSON()),
      });
    });
}
