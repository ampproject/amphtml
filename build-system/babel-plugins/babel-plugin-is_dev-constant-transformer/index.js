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
 * Changes the values of IS_DEV to false and IS_MINIFIED to true.
 * The above said variables are in src/mode.js file.
 * @param {{types: string}} options
 * @return {!Object}
 */
module.exports = function ({types: t}) {
  return {
    visitor: {
      VariableDeclarator(path) {
        const {node} = path;
        const {id, init} = node;
        if (
          t.isIdentifier(id, {name: 'IS_DEV'}) &&
          t.isBooleanLiteral(init, {value: true})
        ) {
          node.init = t.booleanLiteral(false);
        }
      },
    },
  };
};
