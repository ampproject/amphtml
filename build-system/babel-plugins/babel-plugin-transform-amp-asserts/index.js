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
  if (!node || node.type !== 'Identifier') {
    return false;
  }
  return names.some(x => {
    return t.isIdentifier(node, {name: x});
  });
}

const removableDevAsserts = [
  'assert',
  'fine',
  'assertElement',
  'assertString',
  'assertNumber',
  'assertBoolean',
];

const removableUserAsserts = ['fine'];


export default function(babel) {
  const {types: t} = babel;
  return {
    visitor: {
      CallExpression(path) {
        //console.log(path.node.callee)
        const isRemovableDevCall = t.isMemberExpression(path.node.callee) &&
              t.isCallExpression(path.node.callee.object) &&
              t.isIdentifier(path.node.callee.object.callee, {name: 'dev'}) &&
              isRemovableMethod(t, path.node.callee.property,
                  removableDevAsserts);

        const isRemovableUserCall = t.isMemberExpression(path.node.callee) &&
              t.isCallExpression(path.node.callee.object) &&
              t.isIdentifier(path.node.callee.object.callee, {name: 'user'}) &&
              isRemovableMethod(t, path.node.callee.property,
                  removableUserAsserts);

        if (!(isRemovableDevCall || isRemovableUserCall)) {
          return;
        }

        // We assume the return is always the resolved expression value.
        // This might not be the case like in assertEnum which we currently
        // don't remove.
        const args = path.node.arguments[0];
        if (args) {
          path.replaceWith(args);
        } else {
          // This is to resolve right hand side usage of expression where
          // no argument is passed in.
          path.replaceWith(t.identifier('undefined'));
        }
      },
    },
  };
}
