import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import meQuery from 'dummy/graphql/user/me';

export default class ApplicationRoute extends Route {
  @service apollo;

  model() {
    return this.apollo.query({ query: meQuery }, 'me');
  }
}
