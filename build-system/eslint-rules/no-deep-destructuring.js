'use strict';

/**
 * Disallows deep object destructuring, because it's complicated and confusing.
 *
 * Bad:
 *   const { x: { y } } = obj.prop;
 *   const {x: [y]} = obj;
 *   const [[x], y] = arr;
 *   const [{x}] = arr;
 * Good:
 *   const { y } = obj.prop.x;
 *   const [x, y] = arr;
 *
 * @return {!Object}
 */
module.exports = function (context) {
  const isPatternOrProperty = (node) =>
    node.type === 'Property' || node.type === 'ArrayPattern';

  return {
    ObjectPattern: function (node) {
      if (isPatternOrProperty(node.parent)) {
        context.report({node, message: 'No deep destructuring allowed.'});
      }
    },
    ArrayPattern: function (node) {
      if (isPatternOrProperty(node.parent)) {
        context.report({node, message: 'No deep destructuring allowed.'});
      }
    },
  };
};
