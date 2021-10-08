'use strict';

// Only allow array destructuring on preact functions that are known to return
// real arrays. This is to avoid the very large iterator polyfill and the very
// slow native and polyfilled runtime.
//
// Good:
// const [first] = useXYZ(0);
// const [x] = preact.useXYZ(0);
//
// Bad:
// const [b] = value;
// function bad([b]) {}
module.exports = function (context) {
  /**
   * @param {*} node
   * @return {boolean}
   */
  function isAllowed(node) {
    const {parent} = node;
    if (parent.type !== 'VariableDeclarator') {
      return false;
    }
    const {init} = parent;

    if (!init || init.type !== 'CallExpression') {
      return false;
    }

    const {callee} = init;

    if (callee.type === 'Identifier') {
      return callee.name.startsWith('use');
    }

    if (callee.type === 'MemberExpression') {
      const {computed, object, property} = callee;
      if (computed) {
        return false;
      }
      if (
        object.type !== 'Identifier' ||
        object.name.toLowerCase() !== 'preact'
      ) {
        return false;
      }
      if (property.type !== 'Identifier' || !property.name.startsWith('use')) {
        return false;
      }
      return true;
    }

    return false;
  }

  return {
    ArrayPattern: function (node) {
      if (isAllowed(node)) {
        return;
      }

      context.report({
        node,
        message:
          'Array Destructuring is only allowed on known array-returning preact hooks',
      });
    },
  };
};
