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
 * @param {any} options
 * @return {babel.PluginObj}
 */
module.exports = function (babel, options) {
  const {template, types: t} = babel;
  const {freeze = true} = options;

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
          json = JSON.parse(readFileSync(jsonPath, 'utf8'));
        } catch (e) {
          throw path.buildCodeFrameError(
            `could not load JSON file at '${jsonPath}'`
          );
        }

        if (freeze) {
          path.replaceWith(
            template.statement
              .ast`const ${specifier} = JSON.parse('${JSON.stringify(
              json
            )}', function(key, val) {
                if (typeof val === 'object') Object.freeze(val);
                return val;
              });`
          );
          return;
        }

        path.replaceWith(
          template.statement
            .ast`const ${specifier} = JSON.parse('${JSON.stringify(json)}');`
        );
      },
    },
  };
};
