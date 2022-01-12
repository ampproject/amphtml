'use strict';

const {getMinifiedConfig} = require('./minified-config');

/**
 * Gets the config for minified babel transforms run, used by 3p vendors.
 *
 * @return {!Object}
 */
function getMinifiedSsrConfig() {
  const config = getMinifiedConfig();
  return config;
}

module.exports = {
  getMinifiedSsrConfig,
};
