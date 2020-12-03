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

/**
 * Removes location data from a node so that its scope is identifiable
 * @param {!Object} node
 * @return {!Object}
 */
function removeLoc({
  start: unusedStart,
  end: unusedEnd,
  loc: unusedLoc,
  range: unusedRange,
  parent: unusedParent,
  ...rest
}) {
  for (const k in rest) {
    if (rest[k] && typeof rest[k] === 'object') {
      rest[k] = removeLoc(rest[k]);
    }
  }
  return rest;
}

module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    const lastByCallee = {};
    const nodeSource = (node) =>
      context.getSourceCode().text.substr(node.start, node.end - node.start);
    return {
      ExpressionStatement(node) {
        if (node.expression.type !== 'CallExpression') {
          return;
        }
        const {callee} = node.expression;
        if (callee.type !== 'MemberExpression') {
          return;
        }
        if (
          callee.property.type !== 'Identifier' ||
          (callee.property.name !== 'add' && callee.property.name !== 'remove')
        ) {
          return;
        }
        const id = JSON.stringify(removeLoc(callee));
        const last = lastByCallee[id];
        if (!last || last.parent !== node.parent) {
          lastByCallee[id] = node;
          return;
        }
        context.report({
          node,
          message:
            `Fold multiple classList.${callee.property.name}() calls into a ` +
            'single call with one argument per class name.',
          fix(fixer) {
            return [
              fixer.removeRange([
                node.range[0],
                node.range[1] +
                  // Increase range by one to include trailing newline.
                  (context.getSourceCode().text.charAt(node.range[1]) === '\n'),
              ]),
              fixer.insertTextAfter(
                last.expression.arguments[last.expression.arguments.length - 1],
                `, ${node.expression.arguments.map(nodeSource).join(', ')}`
              ),
            ];
          },
        });
      },
    };
  },
};
