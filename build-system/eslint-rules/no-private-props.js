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
'use strict';

/**
 * Ensures private properties are not used in the file. If they are, they must
 * be quoted.
 *
 * @return {!Object}
 */
module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    return {
      MemberExpression(node) {
        if (node.computed || !node.property.name.endsWith('_')) {
          return;
        }

        context.report({
          node,
          message:
            'Unquoted private properties are not allowed in BaseElement. Please use quotes',
          fix(fixer) {
            const {object} = node;
            return fixer.replaceTextRange(
              [object.end, node.end],
              `['${node.property.name}']`
            );
          },
        });
      },

      MethodDefinition(node) {
        if (node.computed || !node.key.name.endsWith('_')) {
          return;
        }

        context.report({
          node,
          message:
            'Unquoted private methods are not allowed in BaseElement. Please use quotes',
          fix(fixer) {
            return fixer.replaceText(node.key, `['${node.key.name}']`);
          },
        });
      },
    };
  },
};
