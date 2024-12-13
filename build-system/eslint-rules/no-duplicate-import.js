'use strict';

// Enforces imports statements from a module are not duplicated
//
// Good
// import { x, y, z } from './hello';
//
// Bad
// import { x, z } from './hello';
// import { y } from './hello';
module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    const moduleImports = new Map();
    const typeImports = new Map();
    const getImportMap = (node) =>
      node.importKind === 'type' ? typeImports : moduleImports;

    /**
     * Iterate through imports and report found duplicates.
     * @param {Map<string, string>} imports
     */
    function processImportMap(imports) {
      imports.forEach((imports) => {
        const original = imports[0];

        for (let i = 1; i < imports.length; i++) {
          const node = imports[i];

          context.report({
            node,
            message: `Duplicate import from ${node.source.value}`,
            fix(fixer) {
              const originalSpecifiers = original.specifiers;
              const last = originalSpecifiers[originalSpecifiers.length - 1];

              const {specifiers} = node;
              let text = '';
              for (let i = 0; i < specifiers.length; i++) {
                const {imported, local} = specifiers[i];
                const {name} = imported;

                if (name === local.name) {
                  text += `, ${name}`;
                } else {
                  text += `, ${name} as ${local.name}`;
                }
              }

              return [
                fixer.removeRange([node.range[1], node.range[1] + 1]),
                fixer.remove(node),
                fixer.insertTextAfter(last, text),
              ];
            },
          });
        }
      });
    }

    return {
      'Program:exit': function () {
        processImportMap(moduleImports);
        processImportMap(typeImports);

        moduleImports.clear();
        typeImports.clear();
      },

      ImportDeclaration(node) {
        const {specifiers} = node;
        const source = node.source.value;

        if (specifiers.length === 0) {
          return;
        }
        for (let i = 0; i < specifiers.length; i++) {
          if (specifiers[i].type === 'ImportNamespaceSpecifier') {
            return;
          }
        }

        const imports = getImportMap(node);
        let nodes = imports.get(source);
        if (!nodes) {
          nodes = [];
          imports.set(source, nodes);
        }

        nodes.push(node);
      },
    };
  },
};
