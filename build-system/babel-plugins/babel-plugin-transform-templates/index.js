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

module.exports = function ({types: t}) {
  function whichCloneQuasi(clonedQuasis, index) {
    for (let i = index; i >= 0; i--) {
      const quasi = clonedQuasis[i];
      if (quasi !== null) {
        return index;
      }
    }
  }

  return {
    name: 'flatten-template-literals',
    visitor: {
      TemplateLiteral(path) {
        const {expressions, quasis} = path.node;
        let newQuasis = [...quasis.map((quasi) => t.cloneNode(quasi))];
        let newExpressions = [
          ...expressions.map((expression) => t.cloneNode(expression)),
        ];
        let conversions = 0;

        for (let index = expressions.length; index >= 0; index--) {
          const expression = expressions[index];
          if (
            t.isStringLiteral(expression) ||
            t.isNumericLiteral(expression) ||
            t.isBooleanLiteral(expression)
          ) {
            const {value} = expression;
            const readIndex = whichCloneQuasi(newQuasis, index + 1);
            const modifyIndex = whichCloneQuasi(newQuasis, index);
            const {value: changedValue} = newQuasis[readIndex];
            const {value: previousValue} = newQuasis[modifyIndex];

            newQuasis[modifyIndex] = t.templateElement({
              raw: previousValue.raw + value + changedValue.raw,
              cooked: previousValue.cooked + value + changedValue.cooked,
            });
            newQuasis[index + 1] = null;
            newExpressions[index] = null;
            conversions++;
          }
        }

        if (conversions === 0) {
          return;
        }

        newQuasis = newQuasis.filter(Boolean);
        newExpressions = newExpressions.filter(Boolean);

        path.replaceWith(t.templateLiteral(newQuasis, newExpressions));
      },
    },
  };
};
