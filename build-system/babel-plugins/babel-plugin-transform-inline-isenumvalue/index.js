// @ts-nocheck

const {dirname, join: joinPath, relative} = require('path');
const {readFileSync} = require('fs');

/**
 * @fileoverview
 * Takes isEnumValue() calls and replaces them with a smaller form that only
 * requires the enum object's values, and not its property keys.
 *
 * In:
 *     isEnumValue({FOO: 'foo', BAR: 'bar'}, x);
 * Out:
 *     x === 'foo' || x === 'bar'
 */

module.exports = function (babel) {
  const {parseSync, traverse, types: t} = babel;

  /**
   * @param {import('@babel/core').NodePath} path
   * @param {string} filename
   * @return {{confident: boolean, value: *}}
   */
  function resolveImportEvaluate(path, filename) {
    let evaluated = path.evaluate();
    if (evaluated.confident || !path.isIdentifier()) {
      return evaluated;
    }
    const importDeclaration = path.scope.getBinding(path.node.name).path
      .parentPath;
    if (!importDeclaration.isImportDeclaration()) {
      return evaluated;
    }

    let code;
    try {
      const importPath = relative(
        __dirname,
        joinPath(dirname(filename), importDeclaration.node.source.value)
      );
      const importPathResolved = require.resolve(
        importPath.replace(/^[^.]/, './$&')
      );
      code = readFileSync(importPathResolved, 'utf8');
    } catch (_) {}

    if (code) {
      const {imported} = importDeclaration.node.specifiers.find(
        ({local}) => local.name === path.node.name
      );
      traverse(parseSync(code, {caller: {name: 'is-enum-value'}}), {
        Program(path) {
          path.stop(); // prevent a full walk

          evaluated = path.scope
            .getBinding(imported.name)
            .path.get('init')
            ?.evaluate();
        },
      });
    }
    return evaluated;
  }

  return {
    name: 'transform-inline-isenumvalue',
    visitor: {
      CallExpression(path, state) {
        const callee = path.get('callee');
        if (!callee.isIdentifier({name: 'isEnumValue'})) {
          return;
        }
        const enumArg = path.get('arguments.0');
        const {confident, value} = resolveImportEvaluate(
          enumArg,
          state.file.opts.filename
        );
        if (!confident) {
          return;
        }
        const subject = path.node.arguments[1];

        // x === 1 || x === 2 || x === 3 || ...
        const expression = Object.values(value)
          .map((value) =>
            t.binaryExpression(
              '===',
              t.cloneNode(subject),
              t.valueToNode(value)
            )
          )
          .reduce((a, b) => t.logicalExpression('||', a, b));
        path.replaceWith(expression);
      },
    },
  };
};
