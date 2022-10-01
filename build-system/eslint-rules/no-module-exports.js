'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      unexpected: 'Unexpected use of `module.exports` statement.',
    },
  },

  create(context) {
    return {
      'MemberExpression[object.name=module][property.name=exports]': function (
        node
      ) {
        context.report({node, messageId: 'unexpected'});
      },
    };
  },
};
