/**
 * @fileoverview Lints JSX features not supported by core/dom/jsx
 */
const astUtils = require('../../node_modules/eslint/lib/rules/utils/ast-utils');

module.exports = function (context) {
  let isCoreDomJsx = false;

  /**
   * @param {import('eslint').Node} node
   * @param {boolean} isClass
   * @return {boolean}
   */
  function isValidStyleOrClassValue(node, isClass = false) {
    if (node?.type === 'ConditionalExpression') {
      // Both possible outcomes of a ternary must be valid
      return (
        isValidStyleOrClassValue(node.consequent, isClass) &&
        isValidStyleOrClassValue(node.alternate, isClass)
      );
    } else if (node?.type === 'BinaryExpression') {
      // Concatenating anything to a string is valid
      if (node.operator === '+') {
        return (
          isValidStyleOrClassValue(node.left, isClass) ||
          isValidStyleOrClassValue(node.right, isClass)
        );
      }
    } else if (node?.type === 'LogicalExpression') {
      if (node.operator === '||' || node.operator === '??') {
        return (
          isValidStyleOrClassValue(node.left, isClass) &&
          isValidStyleOrClassValue(node.right, isClass)
        );
      }
      // Any left falsy is okay
      if (node.operator === '&&') {
        return isValidStyleOrClassValue(node.right, isClass);
      }
    } else if (node?.type === 'CallExpression') {
      // Calls to functions that return a string
      const {name} = node.callee;
      return name === 'String' || (isClass && name?.toLowerCase() === 'objstr');
    } else if (node?.type === 'ObjectExpression') {
      // Style attributes can be objects
      return !isClass;
    }
    return node?.type === 'Literal' || node?.type === 'TemplateLiteral';
  }

  return {
    Program() {
      isCoreDomJsx = false;
    },
    ImportNamespaceSpecifier(node) {
      if (node.parent.source.value.endsWith('core/dom/jsx')) {
        isCoreDomJsx = true;
      }
    },
    JSXFragment(node) {
      if (!isCoreDomJsx) {
        return;
      }
      context.report({
        node,
        message:
          'Fragments are not supported. Change into an array of elements, or wrap in a root element.',
      });
    },
    JSXOpeningElement(node) {
      if (!isCoreDomJsx) {
        return;
      }
      const {name} = node;
      if (name.name === 'foreignObject') {
        context.report({
          node: node.name,
          message: `<${node.name.name}> is not supported.`,
        });
      }

      if (name.type === 'JSXMemberExpression') {
        return context.report({
          node,
          message: [
            'Static JSX Templates are required to use regular DOM nodes or Imported Components',
            'This prevents an issue with `<json.type />` accidentally creating a <script> node.',
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
            'This prevents an issue with `<UserProvidedType />` accidentally creating a <script> node.',
          ].join('\n\t'),
        });
      }
    },
    JSXSpreadAttribute(node) {
      if (!isCoreDomJsx) {
        return;
      }

      context.report({
        node,
        message: [
          'Static JSX Templates are required to use static attribute definitions',
          'This prevents an issue with spread attributes accidentally overriding a "safe" attribute with user-provided data.',
        ].join('\n\t'),
      });
    },
    JSXAttribute(node) {
      if (!isCoreDomJsx) {
        return;
      }
      const {name} = node.name;
      if (name === 'dangerouslySetInnerHTML') {
        context.report({
          node: node.name,
          message: `\`<${name}>\` is not supported.`,
        });
        return;
      }
      const {value} = node;
      if (!value || value.type === 'Literal') {
        return;
      }
      if (name === 'class') {
        if (!isValidStyleOrClassValue(value.expression, /* isClass */ true)) {
          context.report({
            node: node.value,
            message: [
              `The inline result of \`${name}\` must resolve to a "string", a \`template \${literal}\`, or a call to either objstr() or String().`,
              `Take caution when wrapping boolean or nullish values in String(). Do \`String(foo || '')\``,
            ].join('\n - '),
          });
        }
      } else if (name === 'style') {
        if (!isValidStyleOrClassValue(value.expression)) {
          context.report({
            node: node.value,
            message: [
              `The inline result of \`${name}\` must resolve to an {objectExpression: ''}, a "string", a \`template \${literal}\`, or a call to String().`,
              `Take caution when wrapping boolean or nullish values in String(). Do \`String(foo || '')\``,
            ].join('\n - '),
          });
        }
      }
    },
  };
};
