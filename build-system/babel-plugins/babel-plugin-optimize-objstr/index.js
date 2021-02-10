/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @param {*} babel
 * @return {*}
 */
module.exports = function babelPluginOptimizeObjstr(babel) {
  const {types: t} = babel;

  return {
    name: 'optimize-objstr',
    visitor: {
      CallExpression(path) {
        const {name} = path.node.callee;
        if (name !== 'objstr') {
          return;
        }
        const objectExpression = path.node.arguments[0];
        if (
          !objectExpression ||
          !t.isObjectExpression(objectExpression) ||
          path.node.arguments.length > 1
        ) {
          throw path.buildCodeFrameError(
            `${path.node.callee.name}() argument should be a single Object Expression Literal.`
          );
        }
        path.replaceWith(
          objectExpression.properties.reduce((previous, prop) => {
            if (!prop.key) {
              const {type, argument} = prop;
              throw path.buildCodeFrameError(
                `${name}() must only contain keyed props, found [${type}] ${
                  (argument && argument.name) || '(unknown)'
                }`
              );
            }
            const conditional = t.conditionalExpression(
              prop.value,
              t.binaryExpression(
                '+',
                t.stringLiteral(' '),
                t.isIdentifier(prop.key)
                  ? t.stringLiteral(prop.key.name)
                  : prop.key
              ),
              t.stringLiteral('')
            );
            return t.binaryExpression('+', previous, conditional);
          }, t.stringLiteral(''))
        );
      },
    },
  };
};
