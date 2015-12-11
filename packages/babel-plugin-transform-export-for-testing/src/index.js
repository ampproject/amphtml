export default function({ types: t }) {
  return {
    visitor: {
      FunctionDeclaration(path) {
        // Has to be a top level Function Declaration and has
        // to have leading comments.
        if (!(path.parent.type === 'Program' &&
            Array.isArray(path.node.leadingComments))) {
          return;
        }

        let lastComment = path.node.leadingComments[
            path.node.leadingComments.length - 1];

        // Has to have the comment "@exportForTesting"
        if (!/@exportForTesting/m.test(lastComment.value)) {
          return;
        }

        path.replaceWith(t.exportNamedDeclaration(
            path.node,
            []));
      }
    }
  }
}
