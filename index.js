'use strict';

const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: require('./package').name,

  treeForPublic(tree) {
    const host = this._findHost();
    const publicTree = host.trees.public;

    return mergeTrees([tree, funnel(publicTree)], {
      overwrite: true,
    });
  },
};
