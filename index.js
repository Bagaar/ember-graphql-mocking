'use strict';

const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: require('./package').name,

  treeForPublic(tree) {
    return mergeTrees([tree, funnel('public')], {
      overwrite: true,
    });
  },
};
