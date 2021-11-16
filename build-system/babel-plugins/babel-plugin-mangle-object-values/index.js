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
   * @return {string|number}
   */
  function mangle(i) {
    // 1..99 are smaller as numbers than strings. Skip 0 because it's falsy
    if (i <= 98) {
      return i + 1;
    }
    if (!charset) {
      // Only letters to prevent collisions when 0-99 are used as keys.
      charset = indexCharset(
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      );
    }
    return encode(i - 99, charset);
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
        const seen = {};
        for (const [i, prop] of objectExpression.properties.entries()) {
          if (!t.isStringLiteral(prop.value)) {
            throw path.buildCodeFrameError(
              `${name}() should only be used on object expressions with string values.`
            );
          }
          const {value} = prop.value;
          const mangled = (seen[value] = seen[value] || mangle(i));
          prop.value = t.valueToNode(mangled);
        }
        path.replaceWith(objectExpression);
      },
    },
  };
};
