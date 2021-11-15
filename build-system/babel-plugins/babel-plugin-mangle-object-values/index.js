/**
 * @fileoverview Mangles the values of an object expression.
 * This is useful when defining large enums, as it allows us to use descriptive
 * values during development, but use short mangled values during production.
 */

const {encode, indexCharset} = require('base62/lib/custom');

const fnName = 'mangleObjectValues';

module.exports = function (babel) {
  const {types: t} = babel;

  let charset;

  /**
   * @param {number} i
   * @return {string}
   */
  function mangle(i) {
    if (!charset) {
      // Letters first since they allow unbracketed syntax when used as keys:
      // (foo.a0 vs. foo['0a'])
      charset = indexCharset(
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      );
    }
    return encode(i, charset);
  }

  return {
    name: 'mangle-object-values',
    visitor: {
      CallExpression(path) {
        const callee = path.get('callee');
        if (!callee.isIdentifier({name: fnName})) {
          return;
        }
        const {name} = callee.node.name;
        const args = path.node.arguments;
        if (args.length !== 1 || !t.isObjectExpression(args[0])) {
          throw path.buildCodeFrameError(
            `${name}() should take a single argument that's an object expression.`
          );
        }
        const objectExpression = args[0];
        for (const [i, prop] of objectExpression.properties.entries()) {
          // Allowing string values in order to preserve /** @enum {string} */
          // regardless of the application of this transform.
          if (!t.isStringLiteral(prop.value)) {
            throw path.buildCodeFrameError(
              `${name}() should only be used on object expressions with string values.`
            );
          }
          prop.value = t.stringLiteral(mangle(i));
        }
        path.replaceWith(objectExpression);
      },
    },
  };
};
