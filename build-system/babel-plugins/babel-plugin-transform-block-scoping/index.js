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

// Transforms let scoped variables into var variables, including class
// declarations.
//
// Let variables inside loops that are referenced inside a
// closure are left alone.
//
// Re: https://github.com/evanw/esbuild/issues/478
// Re: https://gist.github.com/jridgewell/7a6468f61eecb467b8de265f04963286
//
// Input:
// ```
// let x = 0;
// () => {
//   let y = 1;
// }
//
// for (let i = 0; i < 1; i++) {
//   i;
// }
//
// for (let i = 0; i < 1; i++) {
//   () => i;
// }
//
// class Foo {}
// ```
//
// Output:
// ```
// var x = 0;
// () => {
//   var y = 1;
// }
//
// for (var i = 0; i < 1; i++) {
//   i;
// }
//
// for (let i = 0; i < 1; i++) {
//   () => i;
// }
//
// var Foo = class {}
// ```
module.exports = function ({template, types: t}) {
  return {
    name: 'block-scoping', // not required
    visitor: {
      ClassDeclaration(path) {
        const {node} = path;
        const {id} = node;
        if (!id) {
          return;
        }

        const {name} = id;
        node.type = 'ClassExpression';
        node.id = null;
        path.replaceWith(template.statement.ast`let ${name} = ${node}`);
      },

      VariableDeclaration(path) {
        const {node, scope} = path;
        if (node.kind !== 'let') {
          return;
        }

        // We're looking for the function scope that would inherit this var
        // declaration, and whether there is a loop scope in between.
        const parent = path.findParent((p) => {
          return p.isFunction() || p.isProgram() || p.isLoop();
        });
        const bindings = Object.keys(
          t.getBindingIdentifiers(node, false, true)
        );

        // If the let is contained in a loop scope, then there's the
        // possibility that a reference will be closed over in a nested
        // function. Each loop iteration will requires its own value, which
        // means we have to use another function to emulate the behavior.
        if (parent.isLoop()) {
          for (const name of bindings) {
            const references = scope.getBinding(name).referencePaths;
            for (const ref of references) {
              const p = ref.findParent((p) => {
                return p === parent || p.isFunction();
              });

              if (p.isFunction()) {
                // The let variable is closed over. In this case, just leave
                // the let alone instead of trying to transform it.
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
