
'use strict';

module.exports = function (context) {
  return {
    CallExpression: function (node) {
      if (node.callee.name === 'dict') {
        if (node.arguments[0]) {
          const arg1 = node.arguments[0];
          if (arg1.type !== 'ObjectExpression') {
            context.report({
              node,
              message:
                'calls to `dict` must have an Object Literal ' +
                'Expression as the first argument',
            });
            return;
          }
          checkNode(arg1, context);
        }
      }
    },
  };
};

/**
 * @param {*} node
 * @param {*} context
 */
function checkNode(node, context) {
  if (node.type === 'ObjectExpression') {
    node.properties.forEach(function (prop) {
      if (!prop.key || (!prop.key.raw && !prop.computed)) {
        const {name = `[${prop.type}]`} = prop.key || prop.argument || {};
        context.report({
          node: prop,
          message:
            `Found: ${name}.` +
            'The Object Literal Expression passed into `dict` must only contain string keyed properties.',
        });
      }
      if (prop.value) {
        checkNode(prop.value, context);
      }
    });
  } else if (node.type === 'ArrayExpression') {
    node.elements.forEach(function (elem) {
      checkNode(elem, context);
    });
  }
}
