'use strict';

// Enforces 'class' over 'className' access in props.
//
// Good
// function foo({'class': className}) {}
// const {'class': className} = props;
//
// Bad
// function foo({'className': className}) {}
// function foo({className}) {}
// const {'className': className'} = props;
// const {className} = props;

module.exports = {
  meta: {
    fixable: 'code',
  },
  create(context) {
    /** @param {*} node */
    function checkProps(node) {
      if (!node.properties) {
        return;
      }
      node.properties.forEach((prop) => {
        if (
          !prop.key ||
          prop.key.value === 'class' ||
          // If an assignment occurs with the declaration,
          // the value is keyed as props.value.left.name.
          (prop.value.name || prop.value.left.name) !== 'className'
        ) {
          return;
        }

        context.report({
          node,
          message: "Prefer 'class' prop to 'className'.",

          fix(fixer) {
            if (!prop.key.value) {
              return fixer.insertTextBefore(prop, "'class': ");
            }
            if (prop.key.value !== 'class') {
              return fixer.replaceText(prop.key, "'class'");
            }
          },
        });
      });
    }
    return {
      FunctionDeclaration(node) {
        node.params.forEach(checkProps);
      },

      VariableDeclarator(node) {
        if (!node.init || node.init?.name !== 'props' || !node.id) {
          return;
        }
        checkProps(node.id);
      },
    };
  },
};
