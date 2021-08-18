'use strict';

const fs = require('fs');

/**
 * Populates a single object with the babel configs from all the *-config.js
 * files in this directory.
 *
 * @return {!Object}
 */
function getAllBabelConfigs() {
  const babelConfigFiles = fs
    .readdirSync(__dirname)
    .filter((file) => file.includes('-config.js'));
  const babelConfigs = babelConfigFiles.map((file) => require(`./${file}`));
  return Object.assign({}, ...babelConfigs);
}

module.exports = getAllBabelConfigs();
