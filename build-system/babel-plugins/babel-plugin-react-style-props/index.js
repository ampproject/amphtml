/**
 * @fileoverview
 * Transforms Preact-style props ("class") into React-style ("className")
 */

module.exports = function (babel) {
  const {types: t} = babel;

  /**
   * @param {string} name
   * @return {string}
   */
  function normalizeProperty(name) {
    if (name === 'class') {
      return 'className';
    }
    return name;
  }

  return {
    name: 'react-style-props',
    visitor: {
      JSXAttribute(path) {
        const {name} = path.node.name;
        path.node.name.name = normalizeProperty(name);
      },
      CallExpression(path) {
        if (
          !path.get('callee').isIdentifier({name: 'normalizedJsxAttributeName'})
        ) {
          return;
        }
        const arg = path.get('arguments.0');
        if (!arg.isStringLiteral()) {
          throw path.buildCodeFrameError('not string literal');
        }
        path.replaceWith(t.stringLiteral(normalizeProperty(arg.node.value)));
      },
    },
  };
};
