
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
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow using `this` within static functions, since Closure Compiler's Advanced Compilation breaks it",
      context: 'https://github.com/google/closure-compiler/issues/2397',
    },
  },
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
