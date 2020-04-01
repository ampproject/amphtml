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
  function whichQuasiIndexToExtend(quasis, start) {
    for (let i = 0; i < quasis.length; i++) {
      const quasi = quasis[i];
      if (quasi.start > start) {
        return i;
      }
    }
    return null;
  }

  return {
    name: 'flatten-template-literals',
    visitor: {
      TemplateLiteral(path) {
        const {expressions, quasis} = path.node;
        let newQuasis = [...quasis.map((quasi) => t.cloneNode(quasi))];
        let newExpressions = [];

        expressions.forEach((expression, index) => {
          if (
            t.isStringLiteral(expression) ||
            t.isNumericLiteral(expression) ||
            t.isBooleanLiteral(expression)
          ) {
            const {start, value} = expression;
            const indexToExtend = whichQuasiIndexToExtend(quasis, start);
            const {value: cValue} = quasis[indexToExtend];

            if (indexToExtend > 0) {
              const {value: pValue} = quasis[indexToExtend - 1];
              // Merge the quasis so the number of quasis
              // doesn't exceed the expressions by more than 1.
              newQuasis[indexToExtend - 1] = t.templateElement({
                raw: pValue.raw + value + cValue.raw,
                cooked: pValue.cooked + value + cValue.cooked,
              });
              newQuasis[indexToExtend] = null;
            } else {
              newQuasis[indexToExtend] = t.templateElement({
                raw: value + cValue.raw,
                cooked: value + cValue.cooked,
              });
            }
            newExpressions[index] = null;
          } else {
            newExpressions[index] = t.cloneNode(expression);
          }
        });

        newQuasis = newQuasis.filter(Boolean);
        newExpressions = newExpressions.filter(Boolean);

        path.skip();
        path.replaceWith(t.templateLiteral(newQuasis, newExpressions));
      },
    },
  };
};
