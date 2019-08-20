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

const path = require('path');

module.exports = function(context) {
  function isAllowedWindowProp(prop) {
    return prop === 'AMP' || prop.startsWith('on');
  }

  return {
    AssignmentExpression(node) {
      const filePath = context.getFilename();
      const filename = path.basename(filePath);
      // Ignore tests.
      if (/^(test-(\w|-)+|(\w|-)+-testing)\.js$/.test(filename)) {
        return;
      }
      // Ignore polyfills.
      if (filePath.includes('src/polyfills')) {
        return;
      }
      // LHS of assignment must be a member expression e.g. foo.bar.
      const {left} = node;
      if (left.type !== 'MemberExpression') {
        return;
      }
      // The member object must be window-like.
      const object = left.object.name;
      if (!object || !['win', 'window'].includes(object.toLowerCase())) {
        return;
      }
      const prop = left.property.name;
      if (!prop || prop.startsWith('__AMP_') || isAllowedWindowProp(prop)) {
        return;
      }
      context.report({
        node,
        message: 'Window property "{{prop}}" should be prefixed with "__AMP_".',
        data: {prop},
      });
    },
  };
};
