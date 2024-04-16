'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {VERSION: internalRuntimeVersion} = require('./internal-version');

/**
 * Computes the base url for sourcemaps. Custom sourcemap URLs have placeholder
 * {version} that should be replaced with the actual version. Also, ensures
 * that a trailing slash exists.
 * @param {object} options
 * @return {string}
 */
function getSourceRoot(options) {
  if (argv.sourcemap_url) {
    return String(argv.sourcemap_url)
      .replace(/\{version\}/g, internalRuntimeVersion)
      .replace(/([^/])$/, '$1/');
  }
  if (options.fortesting || !argv._.includes('dist')) {
    return 'http://localhost:8000/';
  }
  return `https://raw.githubusercontent.com/ampproject/amphtml/${internalRuntimeVersion}/`;
}

module.exports = {getSourceRoot};
