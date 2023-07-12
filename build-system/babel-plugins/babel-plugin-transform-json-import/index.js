const json5 = require('json5');
const {ajvCompile, transformAjvCode} = require('../../compile/json-schema');
const {basename, dirname, join, relative, resolve} = require('path');
const {readFileSync} = require('fs');
const {readJson} = require('../../json-locales');

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
   * @type {{
   *  [type: string]: (
   *    path: babel.NodePath,
   *    jsonPath: string
   *  ) => babel.types.Expression,
   * }}
   */
  const typeAssertions = {
    'json': (path, jsonPath) => {
      let json;
      try {
        json = readJson(jsonPath);
      } catch (e) {
        throw path.buildCodeFrameError(
          `could not load JSON file at '${jsonPath}'`
        );
      }
      return template.expression.ast`
        JSON.parse('${JSON.stringify(json)}')
      `;
    },

    'json-schema': (path, jsonPath) => {
      // json5 to allow comments
      const schema = json5.parse(readFileSync(jsonPath, 'utf8'));
      const code = ajvCompile(schema);

      const taken = new Set(Object.keys(path.scope.bindings));
      const {name, result} = transformAjvCode(code, taken, {
        code: false,
        ast: true,
      });

      path.insertBefore(result?.ast?.program.body || []);

      const defaultSchemaName = basename(
        basename(jsonPath, '.json'),
        '.schema'
      );
      // The generated function returns a boolean, and modifies a property of
      // itself for errors. We wrap it to instead return an array of errors,
      // which is empty when the input is valid.
      return template.expression.ast`
        (data, schemaName = ${JSON.stringify(defaultSchemaName)}) =>
          ${name}(data, schemaName) ? [] : ${name}.errors
      `;
    },
  };

  const supportedAssertionsMessage = () =>
    Object.keys(typeAssertions)
      .map((type) => `assert {"type": "${type}"}`)
      .join(', ');

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
        const [specifier] = specifiers;
        if (!t.isImportDefaultSpecifier(specifier)) {
          throw path.buildCodeFrameError(
            `must import default from JSON: \`import name from '...'\``
          );
        }
        if (assertions.length !== 1) {
          throw path.buildCodeFrameError(
            `too many import assertions, we only support \`${supportedAssertionsMessage()}\``
          );
        }
        const assertion = assertions[0];
        if (
          !t.isIdentifier(assertion.key, {name: 'type'}) &&
          !t.isStringLiteral(assertion.key, {value: 'type'})
        ) {
          throw path.buildCodeFrameError(
            `unknown assertion, we only support \`${supportedAssertionsMessage()}\``
          );
        }
        const type = Object.keys(typeAssertions).find((type) =>
          t.isStringLiteral(assertion.value, {value: type})
        );
        if (!type) {
          throw path.buildCodeFrameError(
            `unknown type assertion, we only support \`${supportedAssertionsMessage()}\``
          );
        }
        const jsonPath = relative(
          join(__dirname, '..', '..', '..'),
          resolve(dirname(filename), source.value)
        );
        const init = typeAssertions[type](path, jsonPath);
        const statement = template.statement.ast`
          const ${specifier.local} = ${init};
        `;
        path.replaceWith(statement);
      },
    },
  };
};
