/**
 * @fileoverview Mangles the values of an object expression into their numeric
 * indices + 1.
 * This is useful when defining large enums, as it allows us to use descriptive
 * values during development, but use short mangled values during production.
 */

const fnName = 'mangleObjectValues';

module.exports = function (babel) {
  const {types: t} = babel;

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
          // Skip 0 because it's falsy
          const mangled = (seen[value] = seen[value] || i + 1);
          prop.value = t.valueToNode(mangled);
        }
        path.replaceWith(objectExpression);
      },
    },
  };
};
