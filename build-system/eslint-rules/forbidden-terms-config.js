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

const allowlistProperty = 'allowlist';

module.exports = {
  meta: {fixable: 'code'},
  create(context) {
    // Some files are allowlisted for multiple terms, so caching their content
    // greatly speeds up this rule.
    const fileContent = {};

    function readFileContent(filename) {
      try {
        return (
          fileContent[filename] ||
          (fileContent[filename] = readFileSync(filename, 'utf-8'))
        );
      } catch (_) {
        return null;
      }
    }

    function* removeFromArray(fixer, node) {
      const {text} = context.getSourceCode();
      let {start} = node;
      while (/\s/.test(text[start - 1])) {
        start--;
      }
      yield fixer.removeRange([start, node.end]);

      const after = context.getTokenAfter(node);
      if (after.type === 'Punctuator' && after.value === ',') {
        node = after;
        yield fixer.remove(after);
      }

      const [nextComment] = context.getCommentsAfter(node);
      if (
        nextComment &&
        text.substr(node.end, nextComment.start - node.end).indexOf('\n') < 0
      ) {
        yield fixer.remove(nextComment);
      }
    }

    return {
      ['Property' +
      `[key.name='${allowlistProperty}']` +
      "[value.type='ArrayExpression']" +
      "[parent.parent.type='Property']"]: function (node) {
        const termProperty = node.parent.parent;
        const termKey = termProperty.key;

        const termKeyIsIdentifier = termKey.type === 'Identifier';
        if (termProperty.computed || termKeyIsIdentifier) {
          let fix;
          if (!termProperty.computed && termKeyIsIdentifier) {
            // we can replace non-computed ids with string literals
            fix = function (fixer) {
              return fixer.replaceText(termKey, `'${termKey.name}'`);
            };
          }
          context.report({
            node: termKey,
            message: 'Term keys should be string literals.',
            fix,
          });
          return;
        }

        if (node.value.elements.length < 1) {
          context.report({
            node,
            message: `Remove empty ${allowlistProperty}`,
            fix(fixer) {
              return removeFromArray(fixer, node);
            },
          });
          return;
        }

        const termRegexp = new RegExp(termKey.value, 'gm');

        for (const stringLiteral of node.value.elements) {
          if (!stringLiteral.type.endsWith('Literal')) {
            context.report({
              node: stringLiteral,
              message: `${allowlistProperty} should only contain string literals`,
            });
            continue;
          }

          const filename = stringLiteral.value;
          const content = readFileContent(filename);

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
                desc: `Remove from ${allowlistProperty}`,
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
