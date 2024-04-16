'use strict';

/**
 * Lazily instantiate the transformer.
 */
let syncTransformer;

/**
 * Synchronously transforms a css string using postcss.

 * @param {string} cssStr the css text to transform
 * @param {!Object=} opt_cssnano cssnano options
 * @param {!Object=} opt_filename the filename of the file being transformed. Used for sourcemaps generation.
 * @return {object} The transformation result
 */
function transformCssSync(cssStr, opt_cssnano, opt_filename) {
  if (!syncTransformer) {
    syncTransformer = require('sync-rpc')(__dirname + '/init-sync');
  }
  return syncTransformer(cssStr, opt_cssnano, opt_filename);
}

module.exports = {
  transformCssSync,
};
