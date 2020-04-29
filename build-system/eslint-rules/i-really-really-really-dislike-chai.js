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

module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    return {
      'MemberExpression[property.name=should]': function (node) {
        // Ban using .should assertions.
        context.report({
          node,
          message: 'Use expect() assertions only',

          fix(fixer) {
            const start = node.property.start - 1;
            return [
              fixer.insertTextBefore(node.object, 'expect('),
              fixer.replaceTextRange([start, start + '.should'.length], ').to'),
            ];
          },
        });
      },
    };
  },
};
