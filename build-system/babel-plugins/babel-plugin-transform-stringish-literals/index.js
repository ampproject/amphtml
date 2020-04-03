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

const MERGEABLE_TYPES = ['StringLiteral', 'NumericLiteral', 'TemplateLiteral'];

module.exports = function ({types: t}) {
  const cloneNodes = (nodes) => nodes.map((node) => t.cloneNode(node));
  const escapeStringForTemplateLiteral = (value) =>
    String(value).replace(/\x60/g, '\\`');
  const canMergeBinaryExpression = (binaryExpression) =>
    MERGEABLE_TYPES.includes(binaryExpression.left.type) &&
    MERGEABLE_TYPES.includes(binaryExpression.right.type) &&
    binaryExpression.operator === '+';

  function whichCloneQuasi(clonedQuasis, index) {
    for (let i = index; i >= 0; i--) {
      const quasi = clonedQuasis[i];
      if (quasi !== null) {
        return index;
      }
    }
  }

  return {
    name: 'flatten-stringish-literals',
    visitor: {
      BinaryExpression: {
        exit(path) {
          if (!canMergeBinaryExpression(path.node)) {
            return;
          }

          const {left, right} = path.node;
          if (t.isTemplateLiteral(right)) {
            const rightQuasis = cloneNodes(right.quasis);

            if (t.isTemplateLiteral(left)) {
              const leftQuasis = cloneNodes(left.quasis);
              const finalLeftQuasi = leftQuasis[leftQuasis.length - 1];
              leftQuasis[leftQuasis.length - 1].value = {
                raw: finalLeftQuasi.value.raw + rightQuasis[0].value.raw,
                cooked: finalLeftQuasi.value.cooked + rightQuasis[0].value.raw,
              };
              rightQuasis[0] = null;

              path.replaceWith(
                t.templateLiteral(
                  [...leftQuasis, ...rightQuasis.filter(Boolean)],
                  [
                    ...cloneNodes(left.expressions),
                    ...cloneNodes(right.expressions),
                  ]
                )
              );
              return;
            }

            // Left is a literal, containing a value to merge into the right.
            const leftValue = escapeStringForTemplateLiteral(left.value);
            rightQuasis[0].value = {
              raw: leftValue + rightQuasis[0].value.raw,
              cooked: leftValue + rightQuasis[0].value.cooked,
            };
            path.replaceWith(
              t.templateLiteral(rightQuasis, cloneNodes(right.expressions))
            );
          }

          // Right is a literal containing a value to merge into the left.
          if (t.isTemplateLiteral(left)) {
            const rightValue = escapeStringForTemplateLiteral(right.value);
            const leftQuasis = cloneNodes(left.quasis);
            const finalLeftQuasi = leftQuasis[leftQuasis.length - 1];
            leftQuasis[leftQuasis.length - 1].value = {
              raw: finalLeftQuasi.value.raw + rightValue,
              cooked: finalLeftQuasi.value.cooked + rightValue,
            };

            path.replaceWith(
              t.templateLiteral(leftQuasis, cloneNodes(left.expressions))
            );
            return;
          }

          // Merge two string literals
          if (t.isStringLiteral(left) && t.isStringLiteral(right)) {
            const newLiteral = t.cloneNode(left);
            newLiteral.value = left.value + String(right.value);
            path.replaceWith(newLiteral);
          }
        },
      },
      TemplateLiteral(path) {
        const {expressions, quasis} = path.node;
        const newQuasis = cloneNodes(quasis);
        const newExpressions = cloneNodes(expressions);
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

        path.replaceWith(
          t.templateLiteral(
            newQuasis.filter(Boolean),
            newExpressions.filter(Boolean)
          )
        );
      },
    },
  };
};
