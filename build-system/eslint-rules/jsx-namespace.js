'use strict';

const defaultNamespace = {
  // We expect the compiler to output to this namespace by default.
  // As such, we insert a /** @jsx */ annotation only when using different names.
  name: 'Preact',
  from: '#core/dom/preact',
};

// Enforces importing a namespace specifier if using JSX
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
    function requireJsxNamespace(node) {
      if (imported) {
        return;
      }
      if (warned) {
        return;
      }
      warned = true;

      const [{name, from} = defaultNamespace] = context.options;

      const comment =
        name !== defaultNamespace.name
          ? `/** @jsx ${name}.createElement */\n`
          : '';
      const decl = `import * as ${name} from '${from}';\n`;

      const inserted = comment + decl;

      context.report({
        node,
        message: [
          `Using JSX requires importing the '${name} namespace, eg:`,
          '```',
          inserted.trim(),
          '```',
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

          return fixer.insertTextBefore(firstImport, inserted);
        },
      });
    }

    let imported = false;
    let warned = false;

    return {
      Program(node) {
        const hasAnnotation = node.comments.find(
          ({type, value}) => type === 'Block' && value.includes('* @jsx ')
        );
        imported = hasAnnotation;
        warned = false;
      },

      ImportNamespaceSpecifier(node) {
        const [{name} = defaultNamespace] = context.options;
        if (node.local.name === name) {
          imported = true;
        }
      },

      JSXElement(node) {
        requireJsxNamespace(node);
      },

      JSXFragment(node) {
        requireJsxNamespace(node);
      },
    };
  },
};
