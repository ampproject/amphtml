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

  function cloneDeepWithoutLoc(node) {
    const str = JSON.stringify(node);
    return JSON.parse(str, (key, value) => {
      return key === 'loc' ? undefined : value;
    });
  }

  function declarator(path, parentPath) {
    const init = parentPath.get('init');
    let from = init.node;
    if (!init.isPure()) {
      from = path.scope.generateUidIdentifierBasedOnNode(init.node);
      parentPath.insertBefore(
        t.variableDeclarator(from, cloneDeepWithoutLoc(init.node))
      );
    }

    const properties = path.get('properties');
    for (const prop of properties) {
      const {key, value, computed} = prop.node;
      const member = t.memberExpression(
        t.cloneWithoutLoc(from),
        key,
        computed || !t.isIdentifier(key)
      );
      let expression = member;
      let newValue = value;
      if (t.isAssignmentPattern(value)) {
        newValue = t.identifier(value.left.name);
        expression = t.conditionalExpression(
          t.binaryExpression('===', member, path.scope.buildUndefinedNode()),
          value.right,
          member
        );
      }
      const declarator = t.variableDeclarator(newValue, expression);
      parentPath.insertBefore(declarator);
    }
    // NOTE: this is a hack to remove the original path as `parentPath.remove()` causes
    // an unexplained error.
    path.replaceWith(path.scope.generateUidIdentifier('foo'));
    // We try to eliminate any side effects since the original
    // initializer might have had some (method call, etc.);
    parentPath.get('init').replaceWith(path.scope.buildUndefinedNode());
  }

  return {
    name: 'simple-object-destructure',

    pre() {
      this.file.opts.generatorOpts.retainLines = true;
    },

    visitor: {
      ObjectPattern(path) {
        // NOTE: We don't transform destructure operation in params as this causes
        // type parameter mismatch errors.

        const {parentPath} = path;
        if (parentPath.isObjectProperty()) {
          throw path.buildCodeFrameError('encountered deep object destructure');
        }

        if (parentPath.isVariableDeclarator()) {
          return declarator(path, parentPath);
        }
      },
    },
  };
};
