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
'use strict';

const expression = [
  'CallExpression[callee.property.name=/registerService.*/]',
  'CallExpression[callee.name=/registerService.*/]',
].join(',');

module.exports = function (context) {
  return {
    [expression]: function (node) {
      node.arguments.forEach((arg) => {
        if (arg.type === 'ArrowFunctionExpression') {
          // TODO(erwinm): add fixer method.
          context.report({
            node,
            message:
              'registerService* methods should not use arrow functions as a constructor.',
          });
        }
      });
    },
  };
};
