'use strict';

const {getMinifiedConfig} = require('./minified-config');

/**
 * Gets the config for minified babel transforms run, used by 3p vendors with
 * IS_SSR set to true.
 *
 * @return {!Object}
 */
function getMinifiedSsrCssConfig() {
  // We use the default `buildFor` which is preact.
  return getMinifiedConfig('preact', {IS_SSR_CSS: true});
}

module.exports = {
  getMinifiedSsrCssConfig,
};
