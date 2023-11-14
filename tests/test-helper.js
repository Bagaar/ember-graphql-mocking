import { gql } from '@apollo/client/core';
import {
  destroyWorker,
  setupEmberGraphqlMocking,
} from '@bagaar/ember-graphql-mocking/test-support';
import { setApplication } from '@ember/test-helpers';
import Application from 'dummy/app';
import config from 'dummy/config/environment';
import { start } from 'ember-qunit';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

const schema = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
  }

  type Query {
    me: User
  }
`;

QUnit.begin(() => setupEmberGraphqlMocking(schema));

QUnit.done(() => destroyWorker());

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
