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

module.exports = function () {
  const namespace = '_';

  const namespacedVisitor = {
    MemberExpression(path, state) {
      if (!path.matchesPattern(namespace, /* partial */ true)) {
        return;
      }

      const namespaceMember = deepestMember(path);
      if (namespaceMember.node.computed) {
        console./*OK*/ error(namespaceMember.toString());
        throw path.buildCodeFrameError("can't handle computed namespace");
      }

      const {node, parentPath} = path;
      if (parentPath.isAssignmentExpression({left: node})) {
        return memberInAssignmentExpression(path, namespaceMember, state);
      }

      return memberExpression(path, namespaceMember, state);
    },
  };

  function deepestMember(path) {
    while (true) {
      const object = path.get('object');
      if (!object.isMemberExpression()) {
        return path;
      }
      path = object;
    }
  }

  function memberInAssignmentExpression(path, namespaceMember, state) {
    const {name} = namespaceMember.node.property;
    state.declaredNames.set(name, path.parentPath);
  }

  function memberExpression(path, namespaceMember, state) {
    const {name} = namespaceMember.node.property;
    state.usedNames.add(name);
  }

  return {
    name: 'transform-prune-namespace',

    visitor: {
      Program(path) {
        while (true) {
          const declaredNames = new Map();
          const usedNames = new Set();

          path.traverse(namespacedVisitor, {
            declaredNames,
            usedNames,
          });
          let removedAny = false;

          for (const [name, path] of declaredNames.entries()) {
            if (usedNames.has(name)) {
              continue;
            }
            removedAny = true;

            // In case something funky happened.
            if (!path.node) {
              break;
            }
            path.remove();
          }

          if (!removedAny) {
            break;
          }
        }
      },
    },
  };
};
