/**
 * @fileoverview
 * Replaces `import` statements of listed module specifiers with a different
 * module.
 * This is similar to `module-resolver`, except that it preserves specifiers to
 * the original package if a specific name is not listed.
 */

module.exports = function (babel) {
  const {types: t} = babel;

  /**
   * @param {babel.NodePath} path
   * @return {babel.NodePath}
   */
  function getLastInSequenceOfType(path) {
    let last = path;
    while (
      typeof last.key === 'number' &&
      path.getSibling(last.key + 1).node?.type === last.node.type
    ) {
      last = path.getSibling(last.key + 1);
    }
    return last;
  }

  const visitor = {
    ImportDeclaration(path, state) {
      const {pkg, replacements} = state.opts;
      const source = path.node.source.value;
      const names = replacements[source];
      if (!names) {
        return;
      }

      const preservedSpecifiers = [];
      const statements = path.node.specifiers.map((node) => {
        if (t.isImportNamespaceSpecifier(node)) {
          return `import * as ${node.local.name} from '${pkg}';`;
        }
        if (t.isImportSpecifier(node) && names.includes(node.imported.name)) {
          return `import {${node.imported.name} as ${node.local.name}} from '${pkg}';`;
        }
        preservedSpecifiers.push(node);
      });

      if (preservedSpecifiers.length === path.node.specifiers.length) {
        // all preserved, nothing to do
        return;
      }

      const template = statements.filter(Boolean).join('\n');
      const declaration = babel.template(template)();

      // Insert below this sequence of ImportDeclarations
      getLastInSequenceOfType(path).insertAfter(declaration);

      if (preservedSpecifiers.length === 0) {
        path.remove();
      } else {
        path.node.specifiers = preservedSpecifiers;
      }
    },
  };

  return {
    name: 'bento-imports',
    visitor: {
      // We visit on Program.enter to take priority over module-resolver
      Program: {
        enter(programPath, state) {
          programPath.traverse(visitor, state);
        },
      },
    },
  };
};
