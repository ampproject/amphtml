/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

module.exports = function({types: t}) {
  return {
    name: 'transform-html-templates',
    visitor: {
      TaggedTemplateExpression(path) {
        const {tag} = path.node;

        if (
          t.isIdentifier(tag, {name: 'html'}) ||
          (t.isCallExpression(tag) &&
            t.isIdentifier(tag.callee, {name: 'htmlFor'}))
        ) {
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
                hoistedIdentifier = path.scope.generateUidIdentifier(
                  'template'
                );
                const program = path.findParent(path => path.isProgram());

                program.scope.push({
                  id: hoistedIdentifier,
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
