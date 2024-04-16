'use strict';

module.exports = function (context) {
  const setStyleCall = 'CallExpression[callee.name=setStyle]';
  const setStylesCall =
    'CallExpression[callee.name=setStyles], CallExpression[callee.name=setImportantStyles]';
  const resetStylesCall = 'CallExpression[callee.name=resetStyles]';

  const displayMessage = [
    'Do not set the display property using setStyle.',
    'Only the `toggle` helper in `src/core/dom/style.js` is permitted to change the `display: none` style of an element.',
    'Or use `setInitialDisplay` to setup an initial `display: block`, `inline-block`, etc., if it is not possible to do so in CSS.',
  ].join('\n\t');

  return {
    [setStyleCall]: function (node) {
      const filePath = context.getFilename();
      if (filePath.endsWith('src/core/dom/style.js')) {
        return;
      }

      const arg = node.arguments[1];
      if (!arg) {
        return;
      }

      if (arg.type !== 'Literal' || typeof arg.value !== 'string') {
        if (arg.type === 'CallExpression') {
          const {callee} = arg;
          if (
            callee.type === 'Identifier' &&
            callee.name === 'assertNotDisplay'
          ) {
            return;
          }
        }

        return context.report({
          node: arg,
          message:
            'property argument (the second argument) to setStyle must be a string literal',
        });
      }

      if (arg.value === 'display') {
        context.report({
          node: arg,
          message: displayMessage,
        });
      }
    },

    [setStylesCall]: function (node) {
      const callName = node.callee.name;
      const arg = node.arguments[1];

      if (!arg) {
        return;
      }

      if (arg.type !== 'ObjectExpression') {
        if (arg.type === 'CallExpression') {
          const {callee} = arg;
          if (
            callee.type === 'Identifier' &&
            callee.name === 'assertDoesNotContainDisplay'
          ) {
            return;
          }
        }

        return context.report({
          node: arg,
          message: `styles argument (the second argument) to ${callName} must be an object literal. You may also pass in an explicit call to assertDoesNotContainDisplay`,
        });
      }

      const {properties} = arg;
      for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];

        if (prop.computed) {
          context.report({
            node: prop,
            message: 'Style names must not be computed',
          });
          continue;
        }

        const {key} = prop;
        // `"display": "none"`, and `display: none` use two different AST keys.
        if (key.value === 'display' || key.name === 'display') {
          context.report({
            node: prop,
            message: displayMessage,
          });
        }
      }
    },

    [resetStylesCall]: function (node) {
      const arg = node.arguments[1];

      if (!arg) {
        return;
      }

      if (arg.type !== 'ArrayExpression') {
        return context.report({
          node: arg,
          message: `styles argument (the second argument) to resetStyles must be an array literal`,
        });
      }

      const {elements} = arg;
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];

        if (el.type !== 'Literal' || typeof el.value !== 'string') {
          context.report({
            node: el,
            message: 'Style names must be string literals',
          });
          continue;
        }

        if (el.value === 'display') {
          context.report({
            node: el,
            message: displayMessage,
          });
        }
      }
    },
  };
};
