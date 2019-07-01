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

const path = require('path');

module.exports = function(context) {
  return {
    MemberExpression: function(node) {
      const filePath = context.getFilename();
      const filename = path.basename(filePath);
      // Ignore specific js files.
      if (/^(keyframes-extractor|fixed-layer|style)\.js/.test(filename)) {
        return;
      }
      // Ignore tests.
      if (/^(test-(\w|-)+|(\w|-)+-testing)\.js$/.test(filename)) {
        return;
      }
      // Ignore files in testing/ folder.
      if (/\/testing\//.test(filePath)) {
        return;
      }
      if (node.computed) {
        return;
      }
      if (node.property.name == 'style') {
        context.report({
          node,
          message:
            'The use of Element#style (CSSStyleDeclaration live ' +
            'object) to style elements is forbidden. Use getStyle and ' +
            'setStyle from style.js',
        });
      }
    },
  };
};
