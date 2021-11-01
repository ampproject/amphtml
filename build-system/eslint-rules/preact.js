'use strict';

const astUtils = require('eslint/lib/rules/utils/ast-utils');

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
    let staticTemplate = false;

    return {
      Program() {
        imported = false;
        warned = false;
        staticTemplate = false;
      },

      ImportNamespaceSpecifier(node) {
        if (node.local.name === 'Preact') {
          imported = true;
          staticTemplate = node.parent.source.value !== '#preact';
        }
      },

      JSXElement(node) {
        requirePreact(node);
      },

      JSXFragment(node) {
        requirePreact(node);
      },

      JSXOpeningElement(node) {
        if (!imported || !staticTemplate) {
          return;
        }

        const {name} = node;
        if (name.type === 'JSXMemberExpression') {
          return context.report({
            node,
            message: [
              'Static JSX Templates are required to use regular DOM nodes or Imported Components',
              'This prevents an issue with `<json.type></json.type>` accidentally creating a <script> node.',
            ].join('\n\t'),
          });
        }

        if (name.name && /^[a-z]/.test(name.name)) {
          return;
        }

        const variable = astUtils.getVariableByName(
          context.getScope(),
          name.name
        );

        if (!variable || variable.defs.length === 0) {
          return context.report({
            node,
            message: `Could not find ${name.name} in the lexcial scope`,
          });
        }

        for (const def of variable.defs) {
          if (def.type === 'ImportBinding' || def.type === 'FunctionName') {
            continue;
          }

          context.report({
            node,
            message: [
              'Static JSX Templates are required to use regular DOM nodes or Imported Components',
              'This prevents an issue with `<UserProvidedType></json.type>UserProvidedType` accidentally creating a <script> node.',
            ].join('\n\t'),
          });
        }
      },
    };
  },
};
