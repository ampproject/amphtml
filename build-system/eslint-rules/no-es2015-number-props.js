'use strict';

const INVALID_PROPS = [
  'EPSILON',
  'MAX_SAFE_INTEGER',
  'MIN_SAFE_INTEGER',
  'isFinite',
  'isInteger',
  'isNaN',
  'isSafeInteger',
  'parseFloat',
  'parseInt',
];

/**
 * @param {string} property
 * @return {boolean}
 */
function isInvalidProperty(property) {
  return INVALID_PROPS.indexOf(property) != -1;
}

module.exports = function (context) {
  return {
    MemberExpression: function (node) {
      if (
        node.object.name == 'Number' &&
        isInvalidProperty(node.property.name)
      ) {
        context.report({
          node,
          message:
            'no ES2015 "Number" methods and properties allowed to be ' +
            'used.',
        });
      }
    },
  };
};
