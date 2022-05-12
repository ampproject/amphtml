'use strict';

const {getMinifiedConfig} = require('./minified-config');

/**
 * Gets the config for minified babel transforms run, used by 3p vendors with
 * IS_SSR set to true.
 *
 * @return {!Object}
 */
function getMinifiedSsrReadyConfig() {
  // We use the default `buildFor` which is preact.
  return getMinifiedConfig('preact', {IS_SSR: true});
}

module.exports = {
  getMinifiedSsrReadyConfig,
};
