/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
 * Injects alias identifiers for values with default assignments.
 * Closure can't correctly type-narrow the defaulted value to exclude `undefined`,
 * but it can figure out the aliased value correctly.
 *
 * @example
 * In:
 * ```
 * function foo(foo = 1, { bar = 2 }) {
 *   foo;
 *   bar;
 * }
 * ```
 *
 * Out:
 * ```
 * function foo(foo = 1, { bar = 2 }) {
 *   let _foo = foo;
 *   let _bar = bar;
 *   _foo;
 *   _bar;
 * }
 * ```
 */

module.exports = function ({types: t}) {
  return {
    visitor: {
      AssignmentPattern(path) {
        const left = path.get('left');
        if (!left.isIdentifier()) {
          throw left.buildCodeFrameError(
            [
              'Can only fix default assignment type of identifiers.',
              'Please replace with a parameter, and destructure in the function body.',
            ].join('\n\t')
          );
        }

        const root = path.find(
          ({parentPath}) => parentPath.isStatement() || parentPath.isFunction()
        );
        if (!root.parentPath.isFunction()) {
          // only transform param destructures
          return;
        }

        const {scope} = path;
        const {name} = left.node;
        const newName = scope.generateUid(name);

        const {referencePaths} = scope.getBinding(name);
        const ancestry = path.getAncestry().slice().reverse();
        for (const ref of referencePaths) {
          const refAncestry = ref.getAncestry().slice().reverse();

          const min = Math.min(ancestry.length, refAncestry.length);
          for (let i = 0; i < min; i++) {
            const a = ancestry[i];
            const r = refAncestry[i];
            if (a.container !== r.container) {
              break;
            }
            if (a === root) {
              throw ref.buildCodeFrameError(
                'default assignment of default assignment'
              );
            }
          }
        }

        scope.rename(name, newName);
        scope.removeBinding(newName);
        left.node.name = name;

        scope.push({
          id: t.identifier(newName),
          init: t.identifier(name),
          kind: 'let',
        });
      },
    },
  };
};
