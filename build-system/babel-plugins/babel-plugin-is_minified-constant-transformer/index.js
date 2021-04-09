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

/**
 * Changes the value of IS_MINIFIED to true.
 * The above variable is in src/mode.js and src/core/minified-mode.js.
 * @param {Object} babelTypes
 * @return {!Object}
 */
module.exports = function (babelTypes) {
  const {types: t} = babelTypes;
  return {
    visitor: {
      VariableDeclarator(path) {
        const {id, init} = path.node;
        if (
          t.isIdentifier(id, {name: 'IS_MINIFIED'}) &&
          t.isBooleanLiteral(init, {value: false})
        ) {
          path.replaceWith(
            t.variableDeclarator(
              t.identifier('IS_MINIFIED'),
              t.booleanLiteral(true)
            )
          );
        }
      },
    },
  };
};
