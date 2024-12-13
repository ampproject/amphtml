const {readFileSync} = require('fs');
/**
 * JSON reviver that converts {"string": "foo", ...} to just "foo".
 * This minifies the format of locale files.
 * @param {string} _
 * @param {*} value
 * @return {*}
 */
function minifyLocalesJsonReviver(_, value) {
  // Always default to original `value` since this reviver is called for any
  // property pair, including the higher-level containing object.
  return value?.string || value;
}

/**
 * @param {string} filename
 * @return {*}
 */
function readJson(filename) {
  // Treat files under /_locales/ specially in order to minify their format.
  const reviver = filename.includes('/_locales/')
    ? minifyLocalesJsonReviver
    : undefined;
  return JSON.parse(readFileSync(filename, 'utf8'), reviver);
}

module.exports = {readJson, minifyLocalesJsonReviver};
