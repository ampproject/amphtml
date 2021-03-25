/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const {readFileSync} = require('fs');

/**
 * @fileoverview
 * Ensures that forbidden-terms.js is up-to-date by reporting listed files that
 * do not include the allowed term.
 */

module.exports = {
  meta: {fixable: 'code'},
  create(context) {
    function removeFromArray(fixer, {start, end}) {
      const {text} = context.getSourceCode();
      while (/\s/.test(text[start - 1])) {
        start--;
      }
      while (/[,\n]/.test(text[end])) {
        end++;
      }
      return fixer.removeRange([start, end]);
    }

    return {
      ['Property' +
      "[key.name='allowlist']" +
      "[value.type='ArrayExpression']" +
      "[parent.parent.type='Property']"]: function (node) {
        if (node.value.elements.length < 1) {
          context.report({
            node,
            message: `Remove empty ${node.key.name}`,
            fix(fixer) {
              return removeFromArray(fixer, node);
            },
          });
          return;
        }

        const termRegexp = new RegExp(node.parent.parent.key, 'gm');

        for (const stringLiteral of node.value.elements) {
          if (!stringLiteral.type.endsWith('Literal')) {
            context.report({
              node: stringLiteral,
              message: `${node.key.name} should only contain string literals`,
            });
            continue;
          }

          const filename = stringLiteral.value;

          let content;
          try {
            content = readFileSync(filename, 'utf-8');
          } catch (_) {}

          if (content && content.match(termRegexp)) {
            continue;
          }

          context.report({
            node: stringLiteral,
            message: content
              ? 'File does not use this term.'
              : 'File does not exist.',
            suggest: [
              {
                desc: `Remove from ${node.key.name}`,
                fix(fixer) {
                  return removeFromArray(fixer, stringLiteral);
                },
              },
            ],
          });
        }
      },
    };
  },
};
