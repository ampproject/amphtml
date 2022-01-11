'use strict';

const {transformCssString} = require('./jsify-css');

/**
 * Wrapper for the asynchronous transformCssString that is used by transformCssSync()
 * in build-system/tasks/css/jsify-css-sync.js.
 *
 * @return {function(string, !Object=, !Object=): ReturnType<transformCssString>}
 */
function init() {
  return function (cssStr, opt_filename) {
    return Promise.resolve(transformCssString(cssStr, opt_filename));
  };
}
module.exports = init;
