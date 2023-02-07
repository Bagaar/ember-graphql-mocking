'use strict';

module.exports = {
  name: require('./package').name,

  treeForPublic(tree) {
    const host = this._findHost();
    const shouldExcludePublicFiles = host.env === 'production';

    if (shouldExcludePublicFiles) {
      return;
    }

    const funnel = require('broccoli-funnel');
    const mergeTrees = require('broccoli-merge-trees');

    return mergeTrees([tree, funnel(host.trees.public)], {
      overwrite: true,
    });
  },
};
