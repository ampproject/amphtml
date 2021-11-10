/**
 * @fileoverview Lints JSX features not supported by core/dom/jsx
 */

module.exports = function (context) {
  let isCoreDomJsx = false;
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
      if (node.name.name === 'foreignObject') {
        context.report({
          node: node.name,
          message: `<${node.name.name}> is not supported.`,
        });
      }
    },
    JSXAttribute(node) {
      if (!isCoreDomJsx) {
        return;
      }
      if (node.name.name === 'dangerouslySetInnerHTML') {
        context.report({
          node: node.name,
          message: `\`<${node.name.name}>\` is not supported.`,
        });
        return;
      }
      if (
        !node.value ||
        node.value.type === 'Literal' ||
        node.value.expression?.type === 'Literal' ||
        node.value.expression?.type === 'TemplateLiteral'
      ) {
        return;
      }
      if (node.name.name === 'class') {
        if (
          node.value.expression?.callee?.name !== 'String' &&
          node.value.expression?.callee?.name?.toLowerCase() !== 'objstr'
        ) {
          context.report({
            node: node.value,
            message: [
              `Value of prop \`${node.name.name}\` must be a "string", a \`template \${literal}\`, or wrapped in either of objstr() or String().`,
              `objstr() is preferred: https://git.io/JXPfq`,
              `Take caution when wrapping boolean or nullish values in String(). Do \`String(foo || '')\``,
            ].join('\n - '),
          });
        }
      } else if (node.name.name === 'style') {
        if (node.value.expression?.callee?.name !== 'String') {
          context.report({
            node: node.value,
            message: [
              `Value of prop \`${node.name.name}\` must be a "string", a \`template \${literal}\`, or wrapped in String()`,
              `Take caution when wrapping boolean or nullish values in String(). Do \`String(foo || '')\``,
            ].join('\n - '),
          });
        }
      }
    },
  };
};
