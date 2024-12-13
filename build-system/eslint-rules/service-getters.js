module.exports = function (context) {
  return {
    'VariableDeclarator[id.name="Services"][init.type="ObjectExpression"]':
      function (node) {
        for (const property of node.init.properties) {
          if (property.value.type !== 'ArrowFunctionExpression') {
            context.report({
              node: property,
              message:
                'Service getter properties must be arrow function expressions.' +
                '\nThis allows unused getters to be stripped out from the bundle.',
            });
          }
        }
      },
  };
};
