/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

module.exports = function(context) {
  return {
    CallExpression(node) {
      if (/test-/.test(context.getFilename())) {
        return;
      }

      const {callee} = node;
      if (callee.type !== 'MemberExpression') {
        return;
      }

      const {property} = callee;
      if (property.type !== 'Identifier' || property.name !== 'vsyncFor') {
        return;
      }

      if (property.leadingComments) {
        const ok = property.leadingComments.some(comment => {
          return comment.value === 'OK';
        });
        if (ok) {
          return;
        }
      }

      context.report({
        node,
        message: [
          'VSync is now a privileged service.',
          'You likely want to use the `BaseElement` methods' +
            ' `measureElement`, `mutateElement`, or `runElement`.',
          'In the worst case use the same methods on `Resources`.',
        ].join('\n\t'),
      });
    },
  };
};
