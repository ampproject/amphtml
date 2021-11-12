'use strict';

// Enforces preferred property accesses in Preact
// and preferred DOM attributes inside JSX.
//
// Good
// function foo({'class': className}) {}
// const {'class': className} = props;
//
// <div tabIndex="0" />
// <path stroke-linecap />
//
// Bad
// function foo({'className': className}) {}
// function foo({className}) {}
// const {'className': className'} = props;
// const {className} = props;
//
// <div tabindex="0" />
// <path strokeLinecap />

const {ATTRIBUTES_REACT_TO_PREACT} = require('../common/preact-prop-names');

const propNameFn = 'propName';
const propNameFnModule = '#preact/utils';

module.exports = {
  meta: {
    fixable: 'code',
  },
  create(context) {
    const preactNames = new Set(Object.values(ATTRIBUTES_REACT_TO_PREACT));

    let lastImportDecl = null;
    let addedImportDecl = false;
    let program = null;

    const importDecl = `import {${propNameFn}} from '${propNameFnModule}';\n`;

    /** @param {*} node */
    function checkProps(node) {
      if (!node.properties) {
        return;
      }
      node.properties.forEach((prop) => {
        if (!prop.key) {
          return;
        }
        if (prop.computed) {
          return;
        }
        const property = prop.key.name || prop.key.value;

        let preferred = ATTRIBUTES_REACT_TO_PREACT[property];
        let message = `Prefer \`${preferred}\` property access to \`${property}\`.`;

        if (preactNames.has(property)) {
          preferred = property;
          message = `Preact-style prop names \`${preferred}\` should be wrapped with \`${propNameFn}()\``;
        }

        if (preferred) {
          context.report({
            node: prop,
            message,
            fix(fixer) {
              const fixes = [];
              if (!addedImportDecl) {
                addedImportDecl = true;
                fixes.push(
                  lastImportDecl
                    ? fixer.insertTextAfter(lastImportDecl, importDecl)
                    : fixer.insertTextBefore(program.body[0], importDecl)
                );
              }
              const computed = `[${propNameFn}('${preferred}')]`;
              fixes.push(
                !prop.key.value
                  ? fixer.insertTextBefore(prop, `${computed}: `)
                  : fixer.replaceText(prop.key, computed)
              );
              return fixes;
            },
          });
        }
      });
    }

    return {
      Program(node) {
        program = node;
        lastImportDecl = null;
        addedImportDecl = false;
      },

      ImportDeclaration(node) {
        lastImportDecl = node;
      },

      ImportSpecifier(node) {
        if (node.local.name === propNameFn) {
          addedImportDecl = true;
        }
      },

      [`CallExpression[callee.name="${propNameFn}"]`]: function (node) {
        if (
          node.arguments.length !== 1 ||
          node.arguments[0].type !== 'Literal' ||
          typeof node.arguments[0].value !== 'string'
        ) {
          context.report({
            node,
            message: `${node.callee.name} can only have a single string attribute.`,
          });
          return;
        }
        const name = node.arguments[0].value;
        if (ATTRIBUTES_REACT_TO_PREACT[name]) {
          context.report({
            node,
            message: `${node.callee.name} requires Preact-style name \`${ATTRIBUTES_REACT_TO_PREACT[name]}\`.`,
            fix(fixer) {
              return fixer.replaceText(
                node.arguments[0],
                `'${ATTRIBUTES_REACT_TO_PREACT[name]}'`
              );
            },
          });
        }
        if (!preactNames.has(name)) {
          context.report({
            node,
            message: `${node.callee.name} is not required.`,
            fix(fixer) {
              const replacement = `'${name}'`;
              if (node.parent.type === 'Property') {
                // Remove brackets around ['computed'] prop keys
                return fixer.replaceTextRange(
                  [node.parent.key.start - 1, node.parent.key.end + 1],
                  replacement
                );
              }
              return fixer.replaceText(node, replacement);
            },
          });
        }
      },

      FunctionDeclaration(node) {
        node.params.forEach(checkProps);
      },

      VariableDeclarator(node) {
        if (!node.init || node.init.name !== 'props' || !node.id) {
          return;
        }
        checkProps(node.id);
      },

      JSXAttribute(node) {
        const alternative = ATTRIBUTES_REACT_TO_PREACT[node.name.name];
        if (!alternative) {
          return;
        }
        context.report({
          node,
          message: `Prefer \`${alternative}\` to \`${node.name.name}\` when using JSX.`,

          fix(fixer) {
            return fixer.replaceText(node.name, alternative);
          },
        });
      },
    };
  },
};
