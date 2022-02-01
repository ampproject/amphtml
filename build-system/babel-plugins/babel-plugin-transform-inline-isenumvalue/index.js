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
  const {parseSync, template, traverse, types: t} = babel;

  /** @typedef {{confident: boolean, value: *, name: string}} */
  let EvaluationDef;

  /**
   * @type {!Map<*, !EvaluationDef>}
   */
  const fileEnumCache = new Map();

  /**
   * @type {!Map<babel.types.Node, !EvaluationDef>}
   */
  const nodeEnumCache = new Map();

  /**
   * @type {!Map<*, !babel.types.Identifier>}
   */
  const isEnumValueCache = new Map();

  /**
   * @type {!Map<*, !babel.types.Identifier>}
   */
  const enumValuesCache = new Map();

  /**
   * @param {babel.NodePath<babel.types.ImportSpecifier>} specifier
   * @param {string} filename
   * @return {EvaluationDef}
   */
  function resolveImportedEnum(specifier, filename) {
    const evaluated = {
      confident: false,
      value: null,
      name: specifier.node.local.name,
    };

    const importDeclaration = specifier.parentPath;
    if (!importDeclaration.isImportDeclaration()) {
      return evaluated;
    }

    const importPath = relative(
      __dirname,
      joinPath(dirname(filename), importDeclaration.node.source.value)
    );

    const imported = specifier.get('imported');
    if (!imported.isIdentifier()) {
      return evaluated;
    }
    const cacheKey = `${importPath}:${imported.node.name}`;
    const cached = fileEnumCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let code;
    try {
      const importPathResolved = require.resolve(
        importPath.replace(/^[^.]/, './$&')
      );
      code = readFileSync(importPathResolved, 'utf8');
    } catch (_) {}

    if (code) {
      traverse(parseSync(code, {caller: {name: 'is-enum-value'}}), {
        Program(path) {
          path.stop(); // prevent a full walk

          Object.assign(
            evaluated,
            path.scope
              .getBinding(imported.node.name)
              .path.get('init')
              .evaluate()
          );
        },
      });
    }
    fileEnumCache.set(cacheKey, evaluated);
    return evaluated;
  }

  /**
   * @param {babel.NodePath} path
   * @return {!EvaluationDef}
   */
  function resolveLocal(path) {
    const {node} = path;
    const cached = nodeEnumCache.get(node);
    if (cached) {
      return cached;
    }
    const evaluated = {name: '', ...path.evaluate()};
    nodeEnumCache.set(node, evaluated);
    return evaluated;
  }

  /**
   * @param {babel.NodePath} path
   * @param {string} filename
   * @return {!EvaluationDef}
   */
  function resolveEnum(path, filename) {
    if (!path.isIdentifier()) {
      return resolveLocal(path);
    }

    let evaluated = {confident: false, value: null, name: ''};
    const binding = path.scope.getBinding(path.node.name);
    if (!binding) {
      return evaluated;
    }

    const bindingPath = binding.path;
    const cached = nodeEnumCache.get(bindingPath.node);
    if (cached) {
      return cached;
    }

    if (bindingPath.isImportSpecifier()) {
      evaluated = resolveImportedEnum(bindingPath, filename);
    } else if (bindingPath.isVariableDeclarator()) {
      evaluated = {
        name: path.node.name,
        ...bindingPath.get('init').evaluate(),
      };
    }

    nodeEnumCache.set(bindingPath.node, evaluated);
    return evaluated;
  }

  /**
   * @param {!babel.NodePath<babel.types.CallExpression>} path
   * @param {string} filename
   */
  function inlineIsEnumValue(path, filename) {
    const args = path.get('arguments');
    const enumArg = args[0];
    const evaluated = resolveEnum(enumArg, filename);
    if (!evaluated.confident) {
      return;
    }

    let id = isEnumValueCache.get(evaluated.value);
    if (!id) {
      id = path.scope.generateUidIdentifier(`isEnumValue_${evaluated.name}`);
      isEnumValueCache.set(evaluated.value, id);

      // (x) => x === 1 || x === 2 || x === 3 || ...
      const values = Object.values(evaluated.value);
      const expression =
        values.length === 0
          ? t.booleanLiteral(false)
          : values
              .map((value) =>
                t.binaryExpression(
                  '===',
                  t.identifier('x'),
                  t.valueToNode(value)
                )
              )
              .reduce((a, b) => t.logicalExpression('||', a, b));
      pushIntoProgramScope(
        path,
        id,
        template.expression.ast`(x) => ${expression}`
      );
    }

    const subject = path.node.arguments[1];
    path.replaceWith(t.callExpression(t.cloneNode(id), [subject]));
  }

  /**
   * @param {!babel.NodePath<babel.types.CallExpression>} path
   * @param {string} filename
   */
  function inlineEnumValues(path, filename) {
    const args = path.get('arguments');
    const enumArg = args[0];
    const evaluated = resolveEnum(enumArg, filename);
    if (!evaluated.confident) {
      return;
    }

    let id = enumValuesCache.get(evaluated.value);
    if (!id) {
      id = path.scope.generateUidIdentifier(`enumValues_${evaluated.name}`);
      enumValuesCache.set(evaluated.value, id);

      // [1, 2, 3]
      pushIntoProgramScope(
        path,
        id,
        t.valueToNode(Object.values(evaluated.value))
      );
    }

    path.replaceWith(t.cloneNode(id));
  }

  /**
   * @param {babel.NodePath} path
   * @param {babel.types.Identifier} id
   * @param {babel.types.Expression} node
   */
  function pushIntoProgramScope(path, id, node) {
    const program = path.find((path) => path.isProgram());
    if (!program) {
      throw new Error('TYPESCRIPPPPPTTTTTT!');
    }
    program.scope.push({
      id: t.cloneNode(id),
      init: node,
      kind: 'const',
    });
  }

  return {
    name: 'transform-inline-isenumvalue',
    visitor: {
      Program() {
        isEnumValueCache.clear();
        enumValuesCache.clear();
      },

      CallExpression(path, state) {
        const callee = path.get('callee');
        const {filename} = state.file.opts;
        if (callee.isIdentifier({name: 'isEnumValue'})) {
          inlineIsEnumValue(path, filename);
        }
        if (callee.isIdentifier({name: 'enumValues'})) {
          inlineEnumValues(path, filename);
        }
      },
    },
  };
};
