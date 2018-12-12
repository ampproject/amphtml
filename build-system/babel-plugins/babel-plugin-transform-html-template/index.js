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

const insertedTemplates = new Map();

/**
 * Hoist a converted template into the top of the body scope of the program.
 *
 * Note: Ensures duplicates are not added by leveraging pre-existing templates
 * with the _exact_ same markup.
 *
 * @param {*} path path of the template in original source.
 * @param {*} t babel types, so this method can create variableDeclarations.
 * @param {*} originalIdentifer identifier used in original source.
 * @param {*} outputArguments converted template in [string] form.
 */
function hoistTemplate(path, t, originalIdentifer, outputArguments) {
  const argumentsToString = outputArguments.elements[0].value.toString();
  let identifier;
  if (insertedTemplates.get(argumentsToString)) {
    identifier = insertedTemplates.get(argumentsToString);
  } else {
    identifier = path.scope.generateUidIdentifier('template');
    const program = path.findParent(path => path.isProgram());
    const variableDeclaration = t.variableDeclaration(
        'const',
        [t.variableDeclarator(identifier, outputArguments)]
    );

    program.get('body.0').insertBefore(variableDeclaration);
    insertedTemplates.set(argumentsToString, identifier);
  }

  path.replaceWith(t.callExpression(originalIdentifer, [identifier]));
}

/**
 * Optimizes the tagged template literal by removing whitespace, comments
 * and removes attribute quoting where possible.
 * @param {*} templateLiteral original tagged template literal.
 * @return {string} optimized template
 */
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
            const identifier = t.identifier('html');
            const outputArguments = t.arrayExpression(
                [t.stringLiteral(template)]
            );

            if (t.isProgram(path.scope.block)) {
              path.replaceWith(t.callExpression(identifier, [outputArguments]));
            } else {
              hoistTemplate(path, t, identifier, outputArguments);
            }
          }
        } else if (t.isCallExpression(path.node.tag) &&
                   t.isIdentifier(path.node.tag.callee, {name: 'htmlFor'})) {
          const template = optimizeLiteralOutput(path.node.quasi);

          if (template !== null) {
            const wrapperMethodArguments = path.node.tag.arguments;
            const wrapperMethod = t.callExpression(
                t.identifier('htmlFor'), wrapperMethodArguments
            );
            const outputArguments = t.arrayExpression(
                [t.stringLiteral(template)]
            );

            if (t.isProgram(path.scope.block)) {
              path.replaceWith(
                  t.callExpression(wrapperMethod, [outputArguments])
              );
            } else {
              hoistTemplate(path, t, wrapperMethod, outputArguments);
            }
          }
        }
      },
    },
  };
};
