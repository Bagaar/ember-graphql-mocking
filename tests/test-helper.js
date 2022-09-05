import {
  destroyWorker,
  setupEmberGraphqlMocking,
} from '@bagaar/ember-graphql-mocking/test-support';
import { setApplication } from '@ember/test-helpers';
import Application from 'dummy/app';
import config from 'dummy/config/environment';
import schema from 'dummy/graphql/schema';
import { start } from 'ember-qunit';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

QUnit.begin(() => setupEmberGraphqlMocking(schema));

QUnit.done(() => destroyWorker());

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
