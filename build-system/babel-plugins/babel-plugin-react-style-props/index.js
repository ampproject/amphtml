/**
 * @fileoverview
 * Transforms Preact-style props ("class") into React-style ("className")
 */
const {ATTRIBUTES_PREACT_TO_REACT} = require('../../common/preact-prop-names');

const propNameFn = 'propName';

module.exports = function (babel) {
  const {types: t} = babel;

  /**
   * @param {string} name
   * @return {?string}
   */
  function getReactStyle(name) {
    return ATTRIBUTES_PREACT_TO_REACT[name] ?? name;
  }

  return {
    name: 'react-style-props',
    visitor: {
      JSXAttribute(path) {
        const reactStyle = getReactStyle(path.node.name.name);
        path.node.name.name = reactStyle;
      },
      CallExpression(path) {
        if (!t.isIdentifier(path.node.callee, {name: propNameFn})) {
          return;
        }
        const arg = path.get('arguments.0');
        if (!arg.isStringLiteral()) {
          throw arg.buildCodeFrameError('Should be string literal');
        }
        const reactStyle = getReactStyle(arg.node.value);
        path.replaceWith(t.stringLiteral(reactStyle));
      },
    },
  };
};
