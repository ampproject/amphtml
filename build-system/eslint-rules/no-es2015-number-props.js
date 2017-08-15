/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

var INVALID_PROPS = [
  'EPSILON',
  'MAX_SAFE_INTEGER',
  'MIN_SAFE_INTEGER',
  'isFinite',
  'isInteger',
  'isNaN',
  'isSafeInteger',
  'parseFloat',
  'parseInt',
];

function isInvalidProperty(property) {
  return INVALID_PROPS.indexOf(property) != -1;
}

module.exports = function(context) {
  return {
    MemberExpression: function(node) {
      if (node.object.name == 'Number' &&
              isInvalidProperty(node.property.name)) {
        context.report(node,
            'no ES2015 "Number" methods and properties allowed to be used.');
      }
    }
  };
};
