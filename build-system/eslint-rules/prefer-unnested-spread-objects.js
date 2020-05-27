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
'use strict';

// Disallows using an object spread on an inline object expression. Instead,
// the object expression's properties should be hoisted out inline with the
// rest of the outer object.
//
// Good:
// ```
// const foo = {
//   foo: 1,
//   ...bar,
//   baz: 2
// };
// ```
//
// Bad:
// ```
// const foo = {
//   ...{
//     foo: 1,
//   },
//   ...bar,
//   ...{
//     baz: 2
//   },
// };
// ```
module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const spreadElement =
      ':matches(ObjectExpression > ExperimentalSpreadProperty, ObjectExpression > SpreadElement)';

    function findAfter(array, item) {
      const index = array.indexOf(item);
      return index < array.length - 1 ? array[index + 1] : null;
    }

    return {
      [`${spreadElement} > ObjectExpression`](node) {
        context.report({
          node,
          message: 'Nesting an object under an object spread is not useful',

          fix(fixer) {
            const {properties, parent} = node;
            const texts = properties.map((prop) => sourceCode.getText(prop));

            if (texts.length > 0) {
              return fixer.replaceText(node.parent, texts.join(','));
            }

            const grandParent = parent.parent;
            const next = findAfter(grandParent.properties, parent);

            if (next) {
              return fixer.removeRange([parent.range[0], next.range[0] - 1]);
            }

            return fixer.removeRange([
              parent.range[0],
              grandParent.range[1] - 1,
            ]);
          },
        });
      },
    };
  },
};
