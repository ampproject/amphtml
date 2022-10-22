'use strict';

const {getUnminifiedConfig} = require('./unminified-config');

/**
 * Gets the config for babel transforms run during `amp build` with `IS_SSR`
 * set to true.
 *
 * @return {!Object}
 */
function getUnminifiedSsrCssConfig() {
  return getUnminifiedConfig('preact', {IS_SSR_CSS: true});
}

module.exports = {
  getUnminifiedSsrCssConfig,
};
