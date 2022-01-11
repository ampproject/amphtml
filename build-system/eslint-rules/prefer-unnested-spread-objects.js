'use strict';

// Disallows using an object spread on an inline object expression. Instead,
// the object expression's properties should be hoisted out inline with the
// rest of the outer object.
//
// Good:
// ```
// const foo = {
//   foo: 1,
//   ...bar,
//   baz: 2
// };
// ```
//
// Bad:
// ```
// const foo = {
//   ...{
//     foo: 1,
//   },
//   ...bar,
//   ...{
//     baz: 2
//   },
// };
// ```
module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const spreadElement =
      ':matches(ObjectExpression > ExperimentalSpreadProperty, ObjectExpression > SpreadElement)';

    /**
     * @param {Array<T>} array
     * @param {T} item
     * @return {?T}
     */
    function findAfter(array, item) {
      const index = array.indexOf(item);
      return index < array.length - 1 ? array[index + 1] : null;
    }

    return {
      [`${spreadElement} > ObjectExpression`](node) {
        context.report({
          node,
          message: 'Nesting an object under an object spread is not useful',

          fix(fixer) {
            const {parent, properties} = node;
            const texts = properties.map((prop) => sourceCode.getText(prop));

            if (texts.length > 0) {
              return fixer.replaceText(node.parent, texts.join(','));
            }

            const grandParent = parent.parent;
            const next = findAfter(grandParent.properties, parent);

            if (next) {
              return fixer.removeRange([parent.range[0], next.range[0] - 1]);
            }

            return fixer.removeRange([
              parent.range[0],
              grandParent.range[1] - 1,
            ]);
          },
        });
      },
    };
  },
};
