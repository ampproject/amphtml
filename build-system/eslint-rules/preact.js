'use strict';

// Enforces importing a Preact namespace specifier if using JSX
//
// Good
// import * as Preact from '#preact';
// <div />
//
// Bad
// <div />
//
// Bad
// import { createElement } from '#preact';
// <div />
module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    /**
     * @param {*} node
     */
    function requirePreact(node) {
      if (imported) {
        return;
      }
      if (warned) {
        return;
      }
      warned = true;

      const [packageName = '#preact'] = context.options;

      context.report({
        node,
        message: [
          'Using JSX requires importing the Preact namespace',
          `Eg, \`import * as Preact from '${packageName}'\``,
        ].join('\n\t'),

        fix(fixer) {
          const ancestors = context.getAncestors();
          const program = ancestors[0];
          let firstImport = program.body.find(
            (node) => node.type === 'ImportDeclaration'
          );
          if (!firstImport) {
            firstImport = ancestors[1];
          }

          return fixer.insertTextBefore(
            firstImport,
            `import * as Preact from '${packageName}';\n`
          );
        },
      });
    }

    let imported = false;
    let warned = false;

    return {
      Program() {
        imported = false;
        warned = false;
      },

      ImportNamespaceSpecifier(node) {
        if (node.local.name === 'Preact') {
          imported = true;
        }
      },

      JSXElement(node) {
        requirePreact(node);
      },

      JSXFragment(node) {
        requirePreact(node);
      },
    };
  },
};
