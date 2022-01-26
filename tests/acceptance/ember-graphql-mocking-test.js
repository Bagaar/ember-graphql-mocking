import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  mockResolvers,
  setupGraphqlTest,
} from '@bagaar/ember-graphql-mocking/test-support';

module('Acceptance | ember graphql mocking', function (hooks) {
  setupApplicationTest(hooks);
  setupGraphqlTest(hooks);

  test('ember-graphql-mocking', async function (assert) {
    mockResolvers({
      me: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    await visit('/');

    assert.strictEqual(currentURL(), '/');

    assert.dom('[data-test-me-id]').hasText('1');
    assert.dom('[data-test-me-first-name]').hasText('John');
    assert.dom('[data-test-me-last-name]').hasText('Doe');
  });
});
