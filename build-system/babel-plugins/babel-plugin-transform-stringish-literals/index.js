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

const ESCAPE_REGEX = /\${|\\|`/g;

module.exports = function ({types: t}) {
  const cloneNodes = (nodes) => nodes.map((node) => t.cloneNode(node));
  const escapeValue = (value) => String(value).replace(ESCAPE_REGEX, '\\$&');

  function whichCloneQuasi(clonedQuasis, index) {
    for (let i = index; i >= 0; i--) {
      const quasi = clonedQuasis[i];
      if (quasi !== null) {
        return index;
      }
    }
  }

  function joinTemplateLiterals(leftPath, rightPath) {
    const {node: leftNode} = leftPath;
    const {node: rightNode} = rightPath;

    // First merge the first member of the right quasi into the last quasi on the left.
    const fromQuasi = rightNode.quasis[0];
    const toQuasi = leftNode.quasis[leftNode.quasis.length - 1];
    toQuasi.value.raw += fromQuasi.value.raw;
    toQuasi.value.cooked += fromQuasi.value.cooked;

    // Merge the right remaining quasis and expressions to ensure merged left is valid.
    leftNode.quasis.push(...rightNode.quasis.slice(1));
    leftNode.expressions.push(...rightNode.expressions);

    // Now the left contains the values of the right, so remove the right.
    rightPath.remove();
  }

  function joinMaybeTemplateLiteral(path) {
    const left = path.get('left');
    const right = path.get('right');
    if (left.isTemplateLiteral()) {
      if (right.isTemplateLiteral()) {
        // When both sides are template literals, bypass `babel.evaluate` since it cannot handle this condition.
        joinTemplateLiterals(left, right);
        return;
      }

      const e = right.evaluate();
      if (e.confident) {
        const quasi = left.node.quasis[left.node.quasis.length - 1];
        quasi.value.raw += escapeValue(e.value);
        quasi.value.cooked += e.value;
        right.remove();
      }
    } else if (right.isTemplateLiteral()) {
      const e = left.evaluate();
      if (e.confident) {
        const quasi = right.node.quasis[0];
        quasi.value.raw = escapeValue(e.value) + quasi.value.raw;
        quasi.value.cooked = e.value + quasi.value.cooked;
        left.remove();
      }
    }
  }

  return {
    name: 'flatten-stringish-literals',
    visitor: {
      BinaryExpression: {
        exit(path) {
          if (path.node.operator !== '+') {
            return;
          }

          const e = path.evaluate();
          if (e.confident) {
            path.replaceWith(t.valueToNode(e.value));
            path.skip();
            return;
          }

          joinMaybeTemplateLiteral(path);
        },
      },

      TemplateLiteral(path) {
        // Convert any items inside a template literal that are static literals.
        // `foo{'123'}bar` => `foo123bar`
        const {expressions, quasis} = path.node;
        let newQuasis = cloneNodes(quasis);
        let newExpressions = cloneNodes(expressions);
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
              raw: previousValue.raw + escapeValue(value) + changedValue.raw,
              cooked: previousValue.cooked + value + changedValue.cooked,
            });
            newQuasis[index + 1] = null;
            newExpressions[index] = null;
            conversions++;
          }
        }

        newQuasis = newQuasis.filter(Boolean);
        if (newQuasis.length === 1) {
          // When the remaining number of quasis is one.
          // Replace the TemplateLiteral with a StringLiteral.
          // `foo` => 'foo'
          path.replaceWith(t.stringLiteral(newQuasis[0].value.cooked));
          return;
        }

        if (conversions > 0) {
          // Otherwise, any conversions of members requires replacing the existing TemplateLiteral
          newExpressions = newExpressions.filter(Boolean);
          path.replaceWith(t.templateLiteral(newQuasis, newExpressions));
        }
      },
    },
  };
};
