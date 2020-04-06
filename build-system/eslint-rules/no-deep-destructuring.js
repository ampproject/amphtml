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

/**
 * Disallows deep object destructuring, because it's complicated and confusing.
 *
 * Bad:
 *   const { x: { y } } = obj.prop;
 * Good:
 *   const { y } = obj.prop.x;
 * @return {!Object}
 */
module.exports = function (context) {
  return {
    ObjectPattern: function (node) {
      if (node.parent.type !== 'Property') {
        return;
      }
      context.report({node, message: 'No deep object destructuring allowed.'});
    },
  };
};
