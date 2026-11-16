import { gql, type TypedDocumentNode } from '@apollo/client/core';
import Route from '@ember/routing/route';
import { client } from 'test-app/apollo';

type MeQuery = {
  me: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

const meQuery: TypedDocumentNode<MeQuery> = gql`
  query Me {
    me {
      id
      firstName
      lastName
    }
  }
`;

export default class ApplicationRoute extends Route {
  async model() {
    const { data } = await client.query({
      errorPolicy: 'none',
      fetchPolicy: 'no-cache',
      query: meQuery,
    });

    return data.me;
  }
}
