'use strict';

const path = require('path');

module.exports = function (context) {
  return {
    MemberExpression: function (node) {
      const filePath = context.getFilename();
      const filename = path.basename(filePath);
      // Ignore specific js files.
      if (/^(keyframes-extractor|fixed-layer|style)\.js/.test(filename)) {
        return;
      }
      // Ignore tests.
      if (/^(test-(\w|-)+|(\w|-)+-testing)\.js$/.test(filename)) {
        return;
      }
      // Ignore files in testing/ folder.
      if (/\/testing\//.test(filePath)) {
        return;
      }
      if (node.computed) {
        return;
      }
      if (node.property.name == 'style') {
        context.report({
          node,
          message:
            'The use of Element#style (CSSStyleDeclaration live ' +
            'object) to style elements is forbidden. Use getStyle and ' +
            'setStyle from style.js',
        });
      }
    },
  };
};
