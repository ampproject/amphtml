module.exports = function objstrLiteral(context) {
  return {
    CallExpression(node) {
      if (node.callee.type !== 'Identifier' || node.callee.name !== 'objstr') {
        return;
      }
      if (
        node.arguments.length !== 1 ||
        node.arguments[0].type !== 'ObjectExpression'
      ) {
        context.report({
          node,
          message: `${node.callee.name}() must have a single argument that is an Object Expression Literal`,
        });
        return;
      }
      for (const {argument, key, type} of node.arguments[0].properties) {
        if (!key) {
          context.report({
            node,
            message: `${
              node.callee.name
            }() must only contain keyed props, found [${type}] ${
              (argument && argument.name) || '(unknown)'
            }`,
          });
        }
      }
    },
  };
};
