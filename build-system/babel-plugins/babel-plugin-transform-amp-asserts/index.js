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

function isRemovableMethod(t, node, names) {
  if (!node || !t.isIdentifier(node)) {
    return false;
  }
  return names.some(x => {
    return t.isIdentifier(node, {name: x});
  });
}

const typeMap = {
  'assertElement': '!Element',
  'assertString': 'string',
  'assertNumber': 'number',
  'assertBoolean': 'boolean',
  'assertArray': '!Array',
};

const removableDevAsserts = [
  'assert',
  'fine',
  'assertElement',
  'assertString',
  'assertNumber',
  'assertBoolean',
  'assertArray',
];

const removableUserAsserts = ['fine'];

module.exports = function(babel) {
  const {types: t} = babel;
  return {
    visitor: {
      CallExpression(path) {
        const {node} = path;
        const {callee} = node;
        const {parenthesized} = node.extra || {};
        const isMemberAndCallExpression =
          t.isMemberExpression(callee) && t.isCallExpression(callee.object);

        if (!isMemberAndCallExpression) {
          return;
        }

        const logCallee = callee.object.callee;
        const {property} = callee;
        const isRemovableDevCall =
          t.isIdentifier(logCallee, {name: 'dev'}) &&
          isRemovableMethod(t, property, removableDevAsserts);

        const isRemovableUserCall =
          t.isIdentifier(logCallee, {name: 'user'}) &&
          isRemovableMethod(t, property, removableUserAsserts);

        if (!(isRemovableDevCall || isRemovableUserCall)) {
          return;
        }

        // We assume the return is always the resolved expression value.
        // This might not be the case like in assertEnum which we currently
        // don't remove.
        const args = path.node.arguments[0];
        const type = typeMap[property.name];

        if (args) {
          if (parenthesized) {
            path.replaceWith(t.parenthesizedExpression(args));
            path.skip();
            // If is not an assert type, we won't need to do type annotation.
            // If it has no type that we can cast to, then we also won't need to
            // do type annotation.
          } else if (!property.name.startsWith('assert') || !type) {
            path.replaceWith(args);
          } else {
            // Special case null value argument since it's mostly used for
            // interface methods with no implementation which will most likely
            // get DCE'd by Closure Compiler since they are unused code methods.
            if (args.type === 'NullLiteral') {
              return;
            } else {
              path.replaceWith(t.parenthesizedExpression(args));
              // Add a cast annotation to fix type.
              path.addComment('leading', `* @type {${type}} `);
            }
          }
        } else {
          // This is to resolve right hand side usage of expression where
          // no argument is passed in. This bare undefined value is eventually
          // stripped by Closure Compiler.
          path.replaceWith(t.identifier('undefined'));
        }
      },
    },
  };
};
