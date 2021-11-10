/**
 * @fileoverview
 * Transforms Preact-style props ("class") into React-style ("className")
 */

module.exports = function (babel) {
  const {types: t} = babel;

  return {
    name: 'react-style-props',
    visitor: {
      JSXAttribute(path) {
        // TODO(wg-bento): This mapping is incomplete.
        if (t.isJSXIdentifier(path.node.name, {name: 'class'})) {
          path.node.name.name = 'className';
        }
      },
    },
  };
};
