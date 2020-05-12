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

module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const {source} = node;
        if (!source) {
          return;
        }

        const {value} = source;

        if (!value.includes('/')) {
          return;
        }

        const ext = path.extname(value);
        if (!ext) {
          return context.report({
            node: source,
            message: 'Imports must specify a file extension',
            fix(fixer) {
              return fixer.replaceText(source, `'${value}.js'`);
            },
          });
        }

        if (ext !== '.js') {
          context.report({
            node: source,
            message: 'Importing non-js files is unsupported',
          });
        }
      },
    };
  },
};
