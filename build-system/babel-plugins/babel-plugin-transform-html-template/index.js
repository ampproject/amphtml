// @ts-nocheck

const {
  staticTemplateFactoryFns,
  staticTemplateTags,
} = require('../static-template-metadata');
const {minify} = require('html-minifier');

const INSERTED_TEMPLATES = new Map();

/**
 * Optimizes the tagged template literal by removing whitespace, comments
 * and removes attribute quoting where possible.
 * @param {*} templateLiteral original tagged template literal.
 * @return {string} optimized template
 */
function optimizeLiteralOutput(templateLiteral) {
  if (templateLiteral.quasis.length !== 1) {
    console /* OK */
      .log(
        'Improperly formatted `html` tagged template literal' +
          ', more than one template element present.'
      );
    return null;
  }
  return minify(templateLiteral.quasis[0].value.cooked, {
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
  });
}

module.exports = function ({types: t}) {
  /**
   * Determines whether a TaggedTemplateExpression should be handled based on
   * naming convention:
   *
   *    html`<content>...` for `html` and `svg` named tags.
   *
   *    htmlFor(element)`<content>...` for `htmlFor` and `svgFor` tag factories.
   *
   * @param {Node} tag
   * @return {boolean}
   */
  const isTagOrFactoryByName = (tag) =>
    (t.isIdentifier(tag) && staticTemplateTags.has(tag.name)) ||
    (t.isCallExpression(tag) &&
      t.isIdentifier(tag.callee) &&
      staticTemplateFactoryFns.has(tag.callee.name));

  return {
    name: 'transform-html-templates',
    visitor: {
      Program() {
        INSERTED_TEMPLATES.clear();
      },
      TaggedTemplateExpression(path) {
        const {tag} = path.node;

        if (isTagOrFactoryByName(tag)) {
          // Replace a matching TemplateExpression by either inlining a
          // transpiled template or hoisting the template and referring
          // to its value.
          // Note: Ensures duplicate templates are not hoisted.
          const template = optimizeLiteralOutput(path.node.quasi);

          if (template !== null) {
            const templateArrayExpression = t.arrayExpression([
              t.stringLiteral(template),
            ]);

            if (t.isProgram(path.scope.block)) {
              path.replaceWith(
                t.callExpression(tag, [templateArrayExpression])
              );
            } else {
              // Since the template is inline, and the block scope
              // isn't the program. We can hoist the transpiled
              // template and avoid creation each usage.
              let hoistedIdentifier;
              if (INSERTED_TEMPLATES.get(template)) {
                // Template already hoisted.
                hoistedIdentifier = t.clone(INSERTED_TEMPLATES.get(template));
              } else {
                // Template not hoisted. Hoist it.
                hoistedIdentifier =
                  path.scope.generateUidIdentifier('template');
                const program = path.findParent((path) => path.isProgram());

                program.scope.push({
                  id: t.cloneNode(hoistedIdentifier),
                  init: templateArrayExpression,
                  kind: 'const',
                });
                INSERTED_TEMPLATES.set(template, hoistedIdentifier);
              }

              // Leverage the hoisted template.
              path.replaceWith(t.callExpression(tag, [hoistedIdentifier]));
            }
          }
        }
      },
    },
  };
};
