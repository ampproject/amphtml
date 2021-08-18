'use strict';

module.exports = function (context) {
  return {
    'MetaProperty[meta.name=import][property.name=meta]': function (node) {
      context.report({
        node,
        message: 'import.meta is foribdden.',
      });
    },
  };
};
