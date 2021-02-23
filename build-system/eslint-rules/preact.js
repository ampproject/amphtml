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

const path = require('path');

// Enforces importing a Preact namespace specifier if using JSX
//
// Good
// import * as Preact from 'path/to/preact';
// <div />
//
// Bad
// <div />
//
// Bad
// import { createElement } from 'path/to/preact';
// <div />
module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    function requirePreact(node) {
      if (imported) {
        return;
      }
      if (warned) {
        return;
      }
      warned = true;

      context.report({
        node,
        message: [
          'Using JSX requires importing the Preact namespace',
          "Eg, `import * as Preact from 'src/preact'`",
        ].join('\n\t'),

        fix(fixer) {
          const fileName = context.getFilename();
          const absolutePath = path
            .relative(path.dirname(fileName), './src/preact')
            .replace(/\.js$/, '');

          const ancestors = context.getAncestors();
          const program = ancestors[0];
          let firstImport = program.body.find(
            (node) => node.type === 'ImportDeclaration'
          );
          if (!firstImport) {
            firstImport = ancestors[1];
          }

          return fixer.insertTextBefore(
            firstImport,
            `import * as Preact from '${absolutePath}';\n`
          );
        },
      });
    }

    let imported = false;
    let warned = false;

    return {
      Program() {
        imported = false;
        warned = false;
      },

      ImportNamespaceSpecifier(node) {
        if (node.local.name === 'Preact') {
          imported = true;
        }
      },

      JSXElement(node) {
        requirePreact(node);
      },

      JSXFragment(node) {
        requirePreact(node);
      },
    };
  },
};
