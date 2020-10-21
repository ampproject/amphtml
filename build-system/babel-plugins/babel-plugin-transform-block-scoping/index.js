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

module.exports = function ({template, types: t}) {
  return {
    name: 'block-scoping', // not required
    visitor: {
      ClassDeclaration(path) {
        const {node, scope} = path;
        const {id} = node;
        if (!id) {
          return;
        }

        const {name} = id;
        const uid = scope.generateUid(name);
        path.scope.rename(name, uid);

        node.type = 'ClassExpression';
        node.id = null;
        path.replaceWith(template.statement.ast`var ${uid} = ${node}`);
      },

      VariableDeclaration(path) {
        const {node, scope} = path;
        if (node.kind !== 'let') {
          return;
        }

        const parent = path.findParent((p) => {
          return p.isBlockParent() && !p.isBlockStatement();
        });
        const bindings = Object.keys(
          t.getBindingIdentifiers(node, false, true)
        );

        if (parent.isLoop()) {
          for (const name of bindings) {
            const references = scope.getBinding(name).referencePaths;
            for (const ref of references) {
              const p = ref.findParent((p) => {
                return p === parent || p.isFunction() || p.isProgram();
              });
              if (p !== parent && p.isFunction()) {
                return;
              }
            }
          }
        }

        for (const name of bindings) {
          scope.rename(name);
        }
        node.kind = 'var';
      },
    },
  };
};
