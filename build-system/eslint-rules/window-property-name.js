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
  function getProperty(node) {
    const property = node.property.name;
    if (node.computed) {
      // Look up computed properties with const variables literals.
      // E.g. window[FOO] where FOO = 'abc'.
      if (node.property.type === 'Identifier') {
        const sourceCode = context.getSourceCode();
        const {text} = sourceCode;

        let index = -1;
        while (true) {
          index = text.indexOf(property, index + 1);
          if (index < 0) {
            break;
          }
          const n = sourceCode.getNodeByRangeIndex(index);
          const p = n.parent;
          if (p.type === 'VariableDeclarator' && p.init.type === 'Literal') {
            return p.init.value;
          }
        }
      }
      return null;
    }
    return property;
  }

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
      const prop = getProperty(left);
      if (!prop) {
        context.report({
          node,
          message: 'Computed property names are not allowed on window.',
        });
        return;
      }
      // In general, window property names must be prefixed with "__AMP_".
      if (prop.startsWith('__AMP_') || isAllowedWindowProp(prop)) {
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
