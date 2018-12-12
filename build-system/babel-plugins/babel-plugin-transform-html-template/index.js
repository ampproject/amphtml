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

function optimizeLiteralOutput(templateLiteral) {
  if (templateLiteral.quasis.length !== 1) {
    console/* OK */.log('Improperly formatted `html` tagged template literal' +
      ', more than one template element present.');
    return null;
  }
  return minify(templateLiteral.quasis[0].value.cooked, {
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
  });
}

module.exports = function(babel) {
  const {types: t} = babel;

  return {
    name: 'transform-html-templates',
    visitor: {
      TaggedTemplateExpression(path) {
        if (t.isIdentifier(path.node.tag, {name: 'html'})) {
          const template = optimizeLiteralOutput(path.node.quasi);

          if (template !== null) {
            const outputArguments = [
              t.arrayExpression([t.stringLiteral(template)]),
            ];
            path.replaceWith(
                t.callExpression(t.identifier('html'), outputArguments)
            );
          }
        } else if (t.isCallExpression(path.node.tag) &&
                   t.isIdentifier(path.node.tag.callee, {name: 'htmlFor'})) {
          const template = optimizeLiteralOutput(path.node.quasi);

          if (template !== null) {
            const wrapperMethodArguments = path.node.tag.arguments;
            const wrapperMethod = t.callExpression(
                t.identifier('htmlFor'), wrapperMethodArguments
            );
            const outputArguments = [
              t.arrayExpression([t.stringLiteral(template)]),
            ];
            path.replaceWith(t.callExpression(wrapperMethod, outputArguments));
          }
        }
      },
    },
  };
};
