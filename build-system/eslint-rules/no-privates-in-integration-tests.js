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

/**
 * @fileoverview
 * Forbids any property access that ends with "_" in integration test files.
 */

'use strict';

module.exports = function(context) {
  return {
    MemberExpression(node) {
      const filePath = context.getFilename();
      if (!filePath.includes('/integration/')) {
        return;
      }
      if (node.computed) {
        return;
      }

      const {property} = node;
      if (!property.name.endsWith('_')) {
        return;
      }
      context.report({
        node,
        message: 'Private properties are mangled in integration tests.',
      });
    },
  };
};
