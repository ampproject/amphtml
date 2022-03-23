const json5 = require('json5');
const {addNamespace} = require('@babel/helper-module-imports');
const {ajvCompile} = require('../../compile/json-schema');
const {dirname, join, relative, resolve} = require('path');
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

  // Unnecessary fields in ajv's error object
  const ajvRemovableFromExpression = ['schemaPath', 'keyword', 'params'];

  // Destructured fields that aren't required when removing ajv error properties.
  const ajvRemovableFromPattern = [
    'parentData',
    'parentDataProperty',
    'rootData',
  ];

  /**
   * @param {babel.types.ObjectPattern|babel.types.ObjectExpression} patternOrExpression
   * @param {string[]} removable
   */
  function removePropertiesWhenAllPresent(patternOrExpression, removable) {
    const {properties} = patternOrExpression;
    // @ts-ignore
    const kept = properties.filter(
      ({key}) => !removable.includes(key.name || key.value)
    );
    if (kept.length === properties.length - removable.length) {
      patternOrExpression.properties = kept;
    }
  }

  /**
   * @param {import('@babel/traverse').Scope} outerScope
   * @param {babel.types.Program} program
   * @return {babel.types.Program}
   */
  function transformAjvResult(outerScope, program) {
    const visitor = {
      Program: {
        exit(path) {
          // Prevent collisions with outer scope
          for (const binding in path.scope.bindings) {
            if (binding in outerScope.bindings) {
              path.scope.rename(binding, outerScope.generateUid(binding));
            }
          }
        },
      },
      ObjectExpression(path) {
        removePropertiesWhenAllPresent(path.node, ajvRemovableFromExpression);
      },
      ObjectPattern(path) {
        removePropertiesWhenAllPresent(path.node, ajvRemovableFromPattern);
      },
    };
    // Transforming from AST to AST instead of traverse(), since traversing does
    // not create program scope.
    const transformed = babel.transformFromAstSync(
      program,
      /* code */ undefined,
      {
        ast: true,
        code: false,
        plugins: [{visitor}],
      }
    );
    // @ts-ignore
    return transformed.ast.program;
  }

  /**
   * @type {{
   *  [type: string]: (
   *    path: babel.NodePath,
   *    id: babel.types.Identifier,
   *    jsonPath: string
   *  ) => void,
   * }}
   */
  const typeAssertions = {
    'json': (path, id, jsonPath) => {
      let json;
      try {
        json = readJson(jsonPath);
      } catch (e) {
        throw path.buildCodeFrameError(
          `could not load JSON file at '${jsonPath}'`
        );
      }
      path.replaceWith(
        template.statement.ast`const ${id} = JSON.parse('${JSON.stringify(
          json
        )}');`
      );
    },

    'json-schema': (path, id, jsonPath) => {
      // json5 to allow comments
      const schema = json5.parse(readFileSync(jsonPath, 'utf8'));
      const validatorsModuleId = addNamespace(path, '#core/json-schema');
      const {code, validateName} = ajvCompile(schema, validatorsModuleId.name);

      // replaceWithMultiple fails when trying to insert the validate function
      // with the specifier's name directly. Instead, rename validateName in
      // preparation, and rename the function to the specifier's name later.
      path.scope.rename(validateName, path.scope.generateUid(validateName));
      const build = template.program(code, {placeholderPattern: false});
      const program = build();
      const {body} = transformAjvResult(path.scope, program);
      path.replaceWithMultiple(body);
      path.scope.rename(validateName, id.name);
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
        const id = specifiers[0].local;
        const jsonPath = relative(
          join(__dirname, '..', '..', '..'),
          resolve(dirname(filename), source.value)
        );
        typeAssertions[type](path, id, jsonPath);
      },
    },
  };
};
