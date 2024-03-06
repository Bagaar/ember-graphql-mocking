import { gql } from '@apollo/client/core';
import Route from '@ember/routing/route';
import { client } from 'test-app/apollo';

const meQuery = gql`
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
      fetchPolicy: 'no-cache',
      query: meQuery,
    });

    return data.me;
  }
}
