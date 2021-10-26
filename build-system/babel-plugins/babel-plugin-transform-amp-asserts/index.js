// @ts-nocheck

const typeMap = {
  'assertElement': 'Element',
  'assertString': 'string',
  'assertNumber': 'number',
  'assertBoolean': 'boolean',
  'assertArray': 'Array',
};

const REMOVABLE = {
  dev: [
    'assert',
    'assertElement',
    'assertString',
    'assertNumber',
    'assertBoolean',
    'assertArray',
  ],
};

module.exports = function (babel) {
  const {types: t} = babel;

  /**
   * @param {!NodePath} path
   * @param {!Array<string>} names
   * @return {boolean}
   */
  function isRemovableMethod(path, names) {
    return (
      names &&
      names.some((name) => {
        return path.isIdentifier({name});
      })
    );
  }

  /**
   * @param {!NodePath} path
   * @param {string|undefined} type
   * @param {boolean} assertion
   */
  function eliminate(path, type, assertion) {
    const argument = path.get('arguments.0');
    if (!argument) {
      if (assertion) {
        throw path.buildCodeFrameError('assertion without a parameter!');
      }

      // This is to resolve right hand side usage of expression where
      // no argument is passed in. This bare undefined value is eventually
      // stripped by Closure Compiler.
      path.replaceWith(t.identifier('undefined'));
      return;
    }

    const arg = argument.node;
    if (assertion) {
      // If we can statically evaluate the value to a falsey expression
      // TODO(jridgewell): enable this later.
      /*
      const evaluation = argument.evaluate();
      if (evaluation.confident) {
        if (type) {
          if (typeof evaluation.value !== type) {
            path.replaceWith(babel.template.ast`
              (function() {
                throw new Error('static type assertion failure');
              }());
            `);
            return;
          }
        } else if (!evaluation.value) {
          path.replaceWith(babel.template.ast`
            (function() {
              throw new Error('static assertion failure');
            }());
          `);
          return;
        }
      }
      */
    }

    if (type) {
      const preExistingComment =
        path.parentPath?.leadingComment ?? path.parentPath?.innerComment;
      if (preExistingComment) {
        path.parentPath?.replaceWith(
          t.parenthesizedExpression(path.parentPath)
        );
      }

      path.replaceWith(t.parenthesizedExpression(arg));
      // If it starts with a capital, make the type non-nullable.
      if (/^[A-Z]/.test(type)) {
        type = '!' + type;
      }

      path.addComment('leading', `* @type {${type}} `);

      // In case there were preexisting comments around the path,
      // then wrap in an extra layer of parens for the double cast.
      const preExistingComments =
        path.parentPath.node.leadingComments ||
        path.parentPath.node.innerComments;
      if (
        preExistingComments &&
        preExistingComments.some((c) => c.value.includes('type'))
      ) {
        if (
          t.isExpressionStatement(path.parentPath) &&
          !t.isReturnStatement(path.parentPath)
        ) {
          path.parentPath.node.expression = t.parenthesizedExpression(
            path.parentPath.node.expression
          );
        } else if (t.isReturnStatement(path.parentPath)) {
          path.parentPath.node.argument = t.parenthesizedExpression(
            path.parentPath.node.argument
          );
          path.parentPath.node.argument.leadingComments = preExistingComments;
        } else {
          path.parentPath.replaceWith(
            t.parenthesizedExpression(path.parentPath.node)
          );
        }
      }
    } else if (!assertion) {
      path.remove();
    }
  }

  return {
    visitor: {
      CallExpression(path) {
        const callee = path.get('callee');

        if (callee.isIdentifier({name: 'devAssert'})) {
          const args = path.get('arguments');
          // Remove all but the first argument.
          for (let i = args.length - 1; i >= 1; i--) {
            args[i].remove();
          }
          return;
        }

        const isMemberAndCallExpression =
          callee.isMemberExpression() &&
          callee.get('object').isCallExpression();

        if (!isMemberAndCallExpression) {
          return;
        }

        const logCallee = callee.get('object.callee');
        let removable = [];

        if (logCallee.isIdentifier({name: 'dev'})) {
          removable = REMOVABLE[logCallee.node.name];
        }

        const prop = callee.get('property');
        if (!isRemovableMethod(prop, removable)) {
          return;
        }

        const method = prop.node.name;
        eliminate(
          path,
          typeMap[method],
          /* assertion */ method.startsWith('assert')
        );
      },
    },
  };
};
