/**
 * @interface {babel.PluginPass}
 * @return {babel.PluginObj}
 */
module.exports = function () {
  return {
    name: 'remove-strict-directives',
    visitor: {
      Directive(path) {
        const {node} = path;
        if (node.value.value === 'use strict') {
          path.remove();
        }
      },
    },
  };
};
