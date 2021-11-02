const {dirname, join, relative, resolve} = require('path');
const {readFileSync} = require('fs');

/**
 * Transforms JSON imports into a `JSON.parse` call:
 *
 * Input:
 * ```
 * import key from './options.json' assert { type: 'json' };
 * ```
 *
 * Output:
 * ```
 * const key = JSON.parse('{"imported": "json"}');
 * ```
 *
 * @param {babel} babel
 * @return {babel.PluginObj}
 */
module.exports = function (babel) {
  const {template, types: t} = babel;

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

  return {
    manipulateOptions(_opts, parserOpts) {
      parserOpts.plugins.push('importAssertions');
    },

    visitor: {
      ImportDeclaration(path) {
        const {filename} = this.file.opts;
        const {assertions, source, specifiers} = path.node;
        if (!assertions || assertions.length === 0) {
          return;
        }
        if (!filename) {
          throw new Error(
            'babel plugin transform-json-import must be called with a filename'
          );
        }

        if (assertions.length !== 1) {
          throw path.buildCodeFrameError(
            'too many import assertions, we only support `assert { "type": "json" }`'
          );
        }
        const assertion = assertions[0];
        if (
          !t.isIdentifier(assertion.key, {name: 'type'}) &&
          !t.isStringLiteral(assertion.key, {value: 'type'})
        ) {
          throw path.buildCodeFrameError(
            'unknown assertion, we only support `assert { "type": "json" }`'
          );
        }
        if (!t.isStringLiteral(assertion.value, {value: 'json'})) {
          throw path.buildCodeFrameError(
            'unknown type assertion, we only support `assert { "type": "json" }`'
          );
        }

        const specifier = specifiers[0].local;
        const jsonPath = relative(
          join(__dirname, '..', '..', '..'),
          resolve(dirname(filename), source.value)
        );
        let json;
        try {
          json = readJson(jsonPath);
        } catch (e) {
          throw path.buildCodeFrameError(
            `could not load JSON file at '${jsonPath}'`
          );
        }

        path.replaceWith(
          template.statement
            .ast`const ${specifier} = JSON.parse('${JSON.stringify(json)}');`
        );
      },
    },
  };
};
