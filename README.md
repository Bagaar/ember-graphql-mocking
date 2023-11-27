# Ember GraphQL Mocking

[![CI](https://github.com/Bagaar/ember-graphql-mocking/workflows/CI/badge.svg)](https://github.com/Bagaar/ember-graphql-mocking/actions?query=workflow%3ACI)
[![NPM Version](https://badge.fury.io/js/%40bagaar%2Fember-graphql-mocking.svg)](https://badge.fury.io/js/%40bagaar%2Fember-graphql-mocking)

Ember addon for mocking GraphQL requests using [Mock Service Worker (MSW)](https://github.com/mswjs/msw).

## Compatibility

- Ember.js v4.8 or above
- Ember CLI v4.8 or above
- Node.js v18 or above
- MSW v2 or above

## Installation

```shell
npm install -D @bagaar/ember-graphql-mocking msw
```

```shell
pnpm add -D @bagaar/ember-graphql-mocking msw
```

```shell
yarn add -D @bagaar/ember-graphql-mocking msw
```

## Usage

### 1. Set up Ember GraphQL Mocking

In `tests/test-helper.js`:
1. Import `setupEmberGraphqlMocking`
2. Import your GraphQL schema
3. Call `setupEmberGraphqlMocking` with your GraphQL schema

```javascript
// tests/test-helper.js

import Application from 'my-app/app';
import config from 'my-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import { setupEmberGraphqlMocking } from '@bagaar/ember-graphql-mocking/test-support'; // 1.
import schema from 'my-app/graphql/schema'; // 2.

QUnit.begin(() => setupEmberGraphqlMocking(schema)); // 3.

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
```

> [!NOTE]
> Make sure to use `QUnit.begin`, as `setupEmberGraphqlMocking` returns a Promise.

If you want to pass along additional [start options](https://mswjs.io/docs/api/setup-worker/start#options)
to MSW's service worker, you can do so by defining an `mswStartOptions` object:

```js
QUnit.begin(() =>
  setupEmberGraphqlMocking(schema, {
    mswStartOptions: {
      // Additional MSW start options...
    },
  })
);
```

### 2. Write an Acceptance Test

1. Import `mockResolvers` and `setupGraphqlTest`
2. Call `setupGraphqlTest` with `hooks`
3. Call `mockResolvers` to mock the necessary resolver(s) per test

`setupGraphqlTest` will make sure that all resolvers are cleared in between tests.

`mockResolvers` accepts an object that consists of one or more resolvers. The key must be the name of the mocked operation, the value can either be a response object _or_ a function that returns a response object.

> [!NOTE]
> Make sure that your operations are [named](https://graphql.org/learn/queries/#operation-name) in order for `@bagaar/ember-graphql-mocking` to function properly.

```javascript
// tests/acceptance/my-acceptance-test.js

import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'my-app/tests/helpers';
import { mockResolvers, setupGraphqlTest } from '@bagaar/ember-graphql-mocking/test-support'; // 1.

module('Acceptance | ember graphql mocking', function (hooks) {
  setupApplicationTest(hooks);
  setupGraphqlTest(hooks); // 2.

  test('visiting /', async function (assert) {
    mockResolvers({ // 3.
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
```

> [!NOTE]
> Calling `mockResolvers` multiple times within a single test, will simply merge all resolvers into a single root.

> [!NOTE]
> Working versions of these code examples can be found in [this addon's `tests` folder](./tests/).

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
