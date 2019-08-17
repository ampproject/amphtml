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

/**
 * @fileoverview Inline private constant class properties into any reference.
 */

module.exports = function(babel) {
  const {types: t} = babel;

  const rewritter = {
    MemberExpression(path, scope) {
      if (path.node.computed) {
        return;
      }
      const prop = path.get('property');

      if (!prop.isIdentifier({name: scope.name})) {
        return;
      }

      path.replaceWith(t.valueToNode(scope.value));
    },
  };

  return {
    visitor: {
      AssignmentExpression: {
        exit(path) {
          const left = path.get('left');
          if (!left.isMemberExpression()) {
            return;
          }
          if (left.node.computed) {
            return;
          }
          const obj = left.get('object');
          if (!obj.isThisExpression()) {
            return;
          }
          const prop = left.get('property');
          if (!prop.isIdentifier()) {
            return;
          }

          const constructor = path.findParent(p =>
            p.isClassMethod({kind: 'constructor'})
          );
          if (!constructor) {
            return;
          }

          const {parentPath} = path;
          if (!parentPath.isExpressionStatement()) {
            return;
          }

          const {leadingComments} = parentPath.node;
          const privateConst =
            leadingComments &&
            leadingComments.some(
              c => c.value.includes('@private') && c.value.includes('@const')
            );
          if (!privateConst) {
            return;
          }

          const evaluated = path.get('right').evaluate();
          if (!evaluated.confident) {
            return;
          }
          if (typeof evaluated.value === 'object') {
            return;
          }

          parentPath.node.leadingComments = [];
          parentPath.remove();

          const clazz = constructor.parentPath;
          clazz.traverse(rewritter, {
            name: prop.node.name,
            value: evaluated.value,
          });
        },
      },
    },
  };
};
