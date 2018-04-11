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

const path = require('path')

module.exports = function(context) {
  const sourceCode = context.getSourceCode();
  return {
    Program: function(node) {
      // Ignore style.js, fixed-layer.js and tests for usage of style property
      // changes.
      if (!/^(style|fixed-layer|test-(\w|-)+)\.js$/.test(
            path.basename(context.getFilename()))) {
        const sourceCodeAsText =
            /** @type {string>} */ (sourceCode.getText(node));
        /**
         * Match style mutations via dot notation.
         * e.g. element.style.width = '2px';
         * @type {boolean}
         */
        const isStyleMutationViaDotNotation =
            /\s*[a-zA-Z_$][0-9a-zA-Z_$]+\.style\.\\w+\s=/.test(sourceCodeAsText);
        /**
         * Match style mutations via name string property accessor.
         * e.g.
         * element.style["width"] = '2px';
         * element.style[propertyName] = someValue;
         * @type {boolean}
         */
        const isStyleMutateViaPropertyAccessor =
            /\s*[a-zA-Z_$][0-9a-zA-Z_$]+\.style\[(')?\w+\1]\s=/
                .test(sourceCodeAsText);
        if (isStyleMutationViaDotNotation || isStyleMutateViaPropertyAccessor) {
          context.report({
            node,
            message: context.getFilename() + 'The setting of a style property is forbidden. Please use '
                + 'style.js#setStyles or style.js#setImportantStyles.'
          });
        }
      }
    },
  };
};
