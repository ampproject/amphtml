/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

module.exports = function(babel) {
  const {types: t} = babel;
  return {
    name: 'transform-amp-extension-call',
    visitor: {
      CallExpression(path) {
        const {node} = path;
        const {callee} = node;
        if (t.isIdentifier(callee.object, {name: 'AMP'}) &&
            t.isIdentifier(callee.property, {name: 'extension'})) {
          const func = node.arguments[node.arguments.length - 1];

          const IIFE = t.expressionStatement(
              t.callExpression(func, [
                t.memberExpression(t.identifier('self'), t.identifier('AMP')),
              ]));
          path.replaceWith(IIFE);
        }
      },
    },
  };
};
