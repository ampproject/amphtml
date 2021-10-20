/**
 * @fileoverview
 * Replaces `import` statements of listed modules with `const` statements.
 * These reference the global `BENTO` which is meant to provide the contents of
 * these listed modules.
 */

const bentoRuntimePackages = require('../../compile/generate/metadata/bento-runtime-packages');

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
      // Options for tests
      const packages = state.opts.packages || bentoRuntimePackages;

      const source = path.node.source.value;
      const names = packages[source];
      if (!names) {
        return;
      }

      const preservedSpecifiers = [];
      const statements = path.node.specifiers.map((node) => {
        // Full object reference for namespace imports
        // - import * as p from 'package';
        // + const p = {'x': BENTO['package']['x'], ...}
        if (t.isImportNamespaceSpecifier(node)) {
          const properties = names
            .map((name) => `'${name}': PKG['${name}']`)
            .join(',');
          return `const ${node.local.name} = {${properties}}`;
        }
        // One statement per named import
        // - import {z, y} from 'package';
        // + const z = BENTO['package']['z'];
        // + const y = BENTO['package']['y'];
        if (t.isImportSpecifier(node) && names.includes(node.imported.name)) {
          return `const ${node.local.name} = PKG['${node.imported.name}']`;
        }
        preservedSpecifiers.push(node);
      });

      if (preservedSpecifiers.length === path.node.specifiers.length) {
        // all preserved, nothing to do
        return;
      }

      const template = statements.filter(Boolean).join(';\n');

      const declaration = babel.template(template)({
        // We need to specify a placeholder key because babel's `template` will
        // fail with unspecified UPPERCASE identifiers.
        'PKG': `BENTO[${JSON.stringify(source)}]`,
      });

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
