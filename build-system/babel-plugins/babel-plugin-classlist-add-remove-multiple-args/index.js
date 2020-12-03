/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Unrolls single classList.add|remove call with multiple arguments into
 * multiple calls with a single argument.
 *
 * Necessary for builds that support IE.
 * @example
 * In:
 * ```
 * a.classList.add(a, b, c);
 * b.classList.remove(a, b);
 * classList.add(x, y, z)
 * ```
 *
 * Out:
 * ```
 * a.classList.add(a);
 * a.classList.add(b);
 * a.classList.add(c);
 * b.classList.remove(a);
 * b.classList.remove(b);
 * classList.add(x)
 * classList.add(y)
 * classList.add(z)
 * ```
 */

module.exports = function (babel) {
  const {types: t} = babel;

  return {
    name: 'classlist-add-remove-multiple-args',
    visitor: {
      CallExpression(path) {
        if (path.node.arguments.length < 2) {
          return;
        }
        if (!t.isMemberExpression(path.node.callee)) {
          return;
        }
        if (
          !t.isIdentifier(path.node.callee.property, {name: 'add'}) &&
          !t.isIdentifier(path.node.callee.property, {name: 'remove'})
        ) {
          return;
        }
        let rightMostIdentifier = path.node.callee.object;
        while (t.isMemberExpression(rightMostIdentifier)) {
          rightMostIdentifier = rightMostIdentifier.property;
        }
        if (!t.isIdentifier(rightMostIdentifier, {name: 'classList'})) {
          return;
        }
        path.replaceWithMultiple(
          path.node.arguments.map((argument) =>
            t.callExpression(path.node.callee, [argument])
          )
        );
      },
    },
  };
};
