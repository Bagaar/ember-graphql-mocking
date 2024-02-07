import { mockResolvers } from '@bagaar/ember-graphql-mocking/test-support';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'dummy/tests/helpers';
import { module, test } from 'qunit';

module('Acceptance | ember graphql mocking', function (hooks) {
  setupApplicationTest(hooks);

  test('it works', async function (assert) {
    mockResolvers({
      me: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    await visit('/');

    assert.dom('[data-test-me-id]').hasText('1');
    assert.dom('[data-test-me-first-name]').hasText('John');
    assert.dom('[data-test-me-last-name]').hasText('Doe');
  });

  test('it merges resolvers', async function (assert) {
    mockResolvers({
      me: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    mockResolvers({
      me: {
        id: '2',
        firstName: 'Jane',
        lastName: 'Doe',
      },
    });

    await visit('/');

    assert.dom('[data-test-me-id]').hasText('2');
    assert.dom('[data-test-me-first-name]').hasText('Jane');
    assert.dom('[data-test-me-last-name]').hasText('Doe');
  });

  test('it throws schema errors', async function (assert) {
    let error;

    mockResolvers({
      me: {
        id: '1',
        firstName: 'John',
        // `lastName` is marked as non-nullable.
      },
    });

    try {
      console.error('The following error is expected:');
      await visit('/');
    } catch (e) {
      error = e;
    }

    assert.true(error instanceof Error);
  });
});
