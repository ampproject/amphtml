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
'use strict';

// Forbids use of `this` inside static class methods
//
// Good:
// ```
// class Foo {
//   static s() {
//     Foo.prop;
//   }
//
//   i() {
//     this.prop;
//     Foo.prop;
//   }
// }
//
// Foo.prop = 1;
// ```
//
// Bad:
// ```
// class Foo {
//   static s() {
//     this.prop;
//   }
// }
//
// Foo.prop = 1;
// ```
module.exports = { 
  create(context) {
    return {
      'MethodDefinition[static=true] ThisExpression': function (node) {
        const ancestry = context.getAncestors().slice().reverse();
        let i = 0;
        for (; i < ancestry.length; i++) {
          const ancestor = ancestry[i];
          const {type} = ancestor;

          // Arrow functions inherit `this` from their lexical scope, so we need
          // to continue searching if it's an arrow.
          if (
            !type.includes('Function') ||
            type === 'ArrowFunctionExpression'
          ) {
            continue;
          }

          // If the direct parent of this function is a static method definition,
          // then we've found our root method. If it's non-static, then it's a
          // nested class expression's instance method, which is safe.
          if (i < ancestry.length - 2) {
            const parent = ancestry[i + 1];
            if (parent.type === 'MethodDefinition' && parent.static) {
              break;
            }
          }

          // Found a function with it's own `this`, so it's safe.
          return;
        }

        context.report({
          node,
          message:
            '`this` in static methods is broken by Advanced Closure Compiler optimizations. Please use the class name directly.',
        });
      },
    };
  },
};
