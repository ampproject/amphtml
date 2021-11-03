const {
  replaceMangledSubstrings,
} = require('../../compile/mangleable-substrings');

module.exports = function () {
  return {
    name: 'mangle-string-pattern',
    visitor: {
      StringLiteral(path) {
        path.node.value = replaceMangledSubstrings(path.node.value);
      },
      TemplateElement(path) {
        path.node.value.raw = replaceMangledSubstrings(path.node.value.raw);
        path.node.value.cooked = replaceMangledSubstrings(
          path.node.value.cooked
        );
      },
    },
  };
};
