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
 * Checks that custom properties set on the window are prefixed with '__AMP_'.
 * The prefix is invalid in `id` attributes which prevents DOM clobbering.
 */

'use strict';

const path = require('path');

// TODO(choumx): Fix extensions code and add 'extensions/' here.
const PATHS_TO_INCLUDE = ['src/'];

const PATHS_TO_IGNORE = ['src/polyfills', 'test/'];

const WINDOW_PROPERTY = ['win', 'window', 'global', 'self'];

module.exports = function(context) {
  function isAllowedWindowProp(prop) {
    return prop === 'AMP' || prop.startsWith('on');
  }

  return {
    AssignmentExpression(node) {
      const filePath = context.getFilename();
      // Only check source paths.
      if (!PATHS_TO_INCLUDE.some(path => filePath.includes(path))) {
        return;
      }
      // Ignore polyfills etc.
      if (PATHS_TO_IGNORE.some(path => filePath.includes(path))) {
        return;
      }
      // Ignore test files.
      const filename = path.basename(filePath);
      if (/^(test-(\w|-)+|(\w|-)+-testing)\.js$/.test(filename)) {
        return;
      }
      // We only care if LHS of assignment is a member expression e.g. foo.bar.
      const {left} = node;
      if (left.type !== 'MemberExpression') {
        return;
      }
      // We only care if member object looks like a window.
      const object = left.object.name;
      if (!object || !WINDOW_PROPERTY.includes(object.toLowerCase())) {
        return;
      }
      // Disallow computed property names on window so we can enforce naming.
      if (left.computed) {
        context.report({
          node,
          message: 'Computed property names are not allowed on window.',
        });
        return;
      }
      // In general, window property names must be prefixed with "__AMP_".
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
