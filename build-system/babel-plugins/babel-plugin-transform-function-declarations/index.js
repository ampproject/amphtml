// @ts-nocheck

/**
 * Attempt to convert simple single ReturnStatement FunctionDeclarations to ArrowFunctionExpressions.
 * See BAIL_OUT_CONDITIONS for reasons why FunctionDeclarations would not be modified.
 * @interface {babel.PluginPass}
 * @param {babel} babel
 * @return {babel.PluginObj}
 */
module.exports = function ({types: t}) {
  /**
   * This transform is targetted toward these types only.
   * @param {BabelPath} path
   * @return {boolean}
   */
  function isNotFunction(path) {
    return (
      !t.isFunctionDeclaration(path.node) && !t.isFunctionExpression(path.node)
    );
  }

  /**
   * This transform cannot safely convert generator functions.
   * @param {BabelPath} path
   * @return {boolean}
   */
  function isGenerator(path) {
    return path.node.generator;
  }

  /**
   * Only transform a body with a single return statement.
   * @param {BabelPath} path
   * @return {boolean}
   */
  function isNotSingleReturnStatement(path) {
    if (!path.get('body').isBlockStatement()) {
      return false;
    }
    const body = path.get('body.body.0');
    return !body || !body.isReturnStatement();
  }

  /**
   * Only convert functions that do not contains usage of `arguments`.
   * @param {BabelPath} path
   * @return {boolean}
   */
  function containsArgumentsUsage(path) {
    let containsArgumentsUsage = false;
    path.traverse({
      Identifier(path) {
        if (t.isIdentifier(path.node, {name: 'arguments'})) {
          containsArgumentsUsage = true;
          path.stop();
        }
      },
    });
    return containsArgumentsUsage;
  }

  /**
   * If the FunctionDeclaration contains a ThisExpression, converting from a FunctionDeclaration to a
   * VariableDeclaration => VariableDeclarator => ArrowFunctionExpression isn't necessarily valid.
   * @param {BabelPath} path
   * @return {boolean}
   */
  function containsThisExpression(path) {
    let containsThis = false;
    path.traverse({
      ThisExpression(path) {
        containsThis = true;
        path.stop();
      },
    });
    return containsThis;
  }

  /**
   * If the FunctionDeclaration identifier is used a manner besides a CallExpression, bail.
   * @param {BabelPath} path
   * @param {string} name
   * @return {boolean}
   */
  function referencesAreOnlyCallExpressions(path, name) {
    const binding = path.scope.getBinding(name);
    return !binding.referencePaths.every((p) =>
      p.parentPath.isCallExpression({callee: p.node})
    );
  }

  /**
   * @param {CompilerNode} node
   * @return {ReturnType<t['arrowFunctionExpression']>}
   */
  function createArrowFunctionExpression(node) {
    const {async, body, params} = t.cloneNode(node);
    return t.arrowFunctionExpression(params, body.body[0].argument, async);
  }

  /**
   * @param {BabelPath} path
   * @param {string} name
   * @return {ReturnType<t['variableDeclarator']>}
   */
  function createVariableDeclarator(path, name) {
    const arrowFunction = createArrowFunctionExpression(path.node);
    return t.variableDeclarator(t.identifier(name), arrowFunction);
  }

  /**
   * @param {BabelPath} path
   * @return {ReturnType<t['variableDeclaration']>}
   */
  function createVariableDeclaration(path) {
    const declarator = createVariableDeclarator(path, path.node.id.name);
    const declaration = t.variableDeclaration('let', [declarator]);

    t.inherits(declaration, path.node);
    return declaration;
  }

  const DECLARATION_BAIL_OUT_CONDITIONS = [
    isNotFunction,
    isGenerator,
    isNotSingleReturnStatement,
    containsArgumentsUsage,
    containsThisExpression,
    (path) => referencesAreOnlyCallExpressions(path, path.get('id').node.name),
  ];

  // If CallExpression names should be exempt from arrow conversion, denote them here.
  const EXEMPTED_EXPRESSION_NAME_REGEXS = [/registerService/];

  const EXPRESSION_BAIL_OUT_CONDITIONS = [
    isNotFunction,
    isGenerator,
    isNotSingleReturnStatement,
    containsArgumentsUsage,
    containsThisExpression,
    (path) => {
      const callExpression = path.findParent((p) => p.isCallExpression());
      if (callExpression) {
        const {name, property} = (callExpression.node &&
          callExpression.node.callee) || {
          name: null,
          property: null,
        };
        return EXEMPTED_EXPRESSION_NAME_REGEXS.every(
          (regexp) => regexp.test(name) || regexp.test(property.name)
        );
      }

      const declarator = path.findParent((p) => p.isVariableDeclarator());
      if (declarator) {
        return referencesAreOnlyCallExpressions(path, declarator.node.id.name);
      }

      return true;
    },
  ];

  return {
    name: 'safe-arrows',
    visitor: {
      FunctionExpression(path) {
        const insideCallExpression = path.findParent((p) =>
          p.isCallExpression()
        );
        if (insideCallExpression) {
          for (const method of EXPRESSION_BAIL_OUT_CONDITIONS) {
            if (method(path)) {
              return;
            }
          }
          path.replaceWith(createArrowFunctionExpression(path.node));
        } else {
          const declarator = path.findParent((p) => p.isVariableDeclarator());
          if (!declarator) {
            return;
          }

          for (const method of EXPRESSION_BAIL_OUT_CONDITIONS) {
            if (method(path)) {
              return;
            }
          }
          const name =
            (declarator.node &&
              declarator.node.id &&
              declarator.node.id.name) ||
            null;
          declarator.replaceWith(createVariableDeclarator(path, name));
        }
      },
      FunctionDeclaration(path) {
        const usableBlock = path.findParent(
          (path) => path.isBlockStatement() || path.isProgram()
        );

        if (!usableBlock) {
          return;
        }

        for (const method of DECLARATION_BAIL_OUT_CONDITIONS) {
          if (method(path)) {
            return;
          }
        }

        // Making an existing FunctionDeclaration a let VariableDeclaration is safe.
        // The name was already reserved for the FunctionDeclaration.
        usableBlock.unshiftContainer('body', createVariableDeclaration(path));
        path.remove();
      },
    },
  };
};
