'use strict';

module.exports = function (context) {
  return {
    ExportNamedDeclaration: function (node) {
      if (node.declaration) {
        const {declaration} = node;
        if (declaration.type === 'VariableDeclaration') {
          declaration.declarations
            .map(function (declarator) {
              return declarator.init;
            })
            .filter(function (init) {
              return (
                init &&
                /(?:Call|New)Expression/.test(init.type) &&
                // Allow pure()
                init.callee?.name !== 'pure'
              );
            })
            .forEach(function (init) {
              context.report({
                node: init,
                message: 'Cannot export side-effect',
              });
            });
        }
      }
    },
  };
};
