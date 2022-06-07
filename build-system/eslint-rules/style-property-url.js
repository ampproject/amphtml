const wrapperFn = 'stylePropertyUrl';
const moduleName = '#core/dom/jsx/style-property-url';

const urlMaybe = /url\(["']?/;
const urlStart = /^\s*url\(\s*["']?\s*$/;
const urlEnd = /^\s*["']?\s*\)\s*(!important)?\s*$/;

module.exports = {
  meta: {fixable: 'code'},
  create(context) {
    let imported = false;
    let enabled = false;

    const getNodeSource = (node) => context.getSourceCode().getText(node);

    /**
     * @param {import('eslint').Rule.Node} node
     * @return {import('eslint').Rule.Node}
     */
    function getUrlExpr(node) {
      let parent = null;
      if (node.type === 'BinaryExpression') {
        const {right} = node;
        let {left} = node;
        while (left.type === 'BinaryExpression') {
          parent = left;
          left = left.left;
        }
        if (
          left.type === 'Literal' &&
          urlStart.test(left.value) &&
          right.type === 'Literal' &&
          urlEnd.test(right.value)
        ) {
          return parent.right;
        }
      } else if (node.type === 'TemplateLiteral') {
        const {expressions, quasis} = node;
        if (
          expressions.length === 1 &&
          quasis.length === 2 &&
          urlStart.test(quasis[0].value.raw) &&
          urlEnd.test(quasis[1].value.raw)
        ) {
          return expressions[0];
        }
      }
    }

    /**
     * @param {*} fixer
     * @return {import('eslint').Rule.Fix}
     */
    function fixRequireImport(fixer) {
      if (imported) {
        return null;
      }
      imported = true;
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
        `import {${wrapperFn}} from '${moduleName}';\n`
      );
    }

    /**
     * @param {import('eslint').Rule.Node} node
     * @return {boolean}
     */
    function isWrapperFn(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === wrapperFn
      );
    }

    /**
     * @param {import('eslint').Rule.Node} key
     * @param {import('eslint').Rule.Node} value
     * @param {string} name
     * @param {string} replaceBackgroundName
     * @return {boolean}
     */
    function report(key, value, name, replaceBackgroundName) {
      if (!urlMaybe.test(getNodeSource(value))) {
        if (
          !isWrapperFn(value) &&
          value.type !== 'Literal' &&
          value.type !== 'TemplateLiteral'
        ) {
          context.report({
            node: value,
            message: `\`${name}\` should be a Literal, TemplateLiteral, or a call to \`${wrapperFn}()\``,
          });
        }
        return;
      }
      const urlExpr = getUrlExpr(value);
      if (urlExpr) {
        context.report({
          node: value,
          message: `Use ${wrapperFn}()`,
          fix(fixer) {
            return [
              fixRequireImport(fixer, value),
              name === 'background'
                ? fixer.replaceText(key, replaceBackgroundName)
                : null,
              fixer.replaceText(
                value,
                `${wrapperFn}(${getNodeSource(urlExpr)})`
              ),
            ].filter(Boolean);
          },
        });
      } else {
        context.report({
          node: value,
          message:
            name === 'background'
              ? 'Mixed `background` style: `url()` should be set as part of the `backgroundImage` property.'
              : `Use ${wrapperFn}()`,
        });
      }
    }

    return {
      Program() {
        enabled =
          !context.getFilename().includes('.jss.') &&
          !context.getFilename().includes('/storybook/');
        imported = false;
      },

      ImportNamespaceSpecifier(node) {
        if (node.local.name === wrapperFn) {
          imported = true;
        }
      },

      ['Property[key.name="background"],' +
      'Property[key.value="background"],' +
      'Property[key.name="backgroundImage"],' +
      'Property[key.value="backgroundImage"],' +
      'Property[key.value="background-image"]']: (node) => {
        if (!enabled) {
          return;
        }
        if (node.parent.type === 'ObjectPattern') {
          return;
        }
        const {key, value} = node;
        const name = key.name || key.value;
        report(key, value, name, 'backgroundImage');
      },

      'CallExpression[callee.name="setStyle"]': function (node) {
        if (!enabled) {
          return;
        }
        const [, key, value] = node.arguments;
        if (!key || !value) {
          return;
        }
        const name = key.value;
        if (
          name !== 'background' &&
          name !== 'backgroundImage' &&
          name !== 'background-image'
        ) {
          return;
        }
        report(key, value, name, "'background-image'");
      },
    };
  },
};
