'use strict';

module.exports = function (context) {
  return {
    Program: function (node) {
      if (node.comments) {
        node.comments.forEach(function (comment) {
          if (
            /TODO/.test(comment.value) &&
            !/TODO\(@?\w+,\s*#\d{1,}\)/.test(comment.value)
          ) {
            context.report({
              node: comment,
              message:
                'TODOs must be in TODO(@username, #1234) format. ' +
                'Found: "' +
                comment.value.trim() +
                '"',
            });
          }
        });
      }
    },
  };
};
