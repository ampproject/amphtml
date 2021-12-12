'use strict';

// Global cache of typedefName: typedefLocation.
const typedefs = new Map();

module.exports = function (context) {
  return {
    Program() {
      // When relinting a file, remove all typedefs that it declared.
      const filename = context.getFilename();
      const keys = [];
      for (const [key, file] of typedefs) {
        if (file === filename) {
          keys.push(key);
        }
      }

      for (const key of keys) {
        typedefs.delete(key);
      }
    },

    VariableDeclaration(node) {
      const leadingComments = context.getCommentsBefore(node);
      const typedefComment = leadingComments.find((comment) => {
        return comment.type === 'Block' && /@typedef/.test(comment.value);
      });

      if (!typedefComment) {
        return;
      }

      // We can assume theres only 1 variable declaration when a typedef
      // annotation is found. This is because Closure Compiler does not allow
      // declaration of multiple variables with a shared type information.
      const typedefName = node.declarations[0].id.name;

      const typedefLocation = typedefs.get(typedefName);
      if (!typedefLocation) {
        typedefs.set(typedefName, context.getFilename());
        return;
      }

      context.report({
        node,
        message:
          `Duplicate typedef name found: ${typedefName}. Another ` +
          `typedef with the same name is found in ${typedefLocation}. ` +
          'Suggestion: Add an infix version indicator like MyType_0_1_Def.',
      });
    },
  };
};
