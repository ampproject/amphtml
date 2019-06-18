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

module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    return {
      ReturnStatement(node) {
        if (!/test/.test(context.getFilename())) {
          return;
        }
        let {parent} = node;
        if (parent.type !== 'BlockStatement') {
          return;
        }

        parent = parent.parent;
        if (!parent.type.includes('Function')) {
          return;
        }

        parent = parent.parent;
        if (parent.type !== 'CallExpression') {
          return;
        }

        const {callee} = parent;
        if (
          callee.type !== 'Identifier' ||
          callee.name !== 'allowConsoleError'
        ) {
          return;
        }

        const callParent = parent.parent;
        if (callParent.type === 'ReturnStatement') {
          return;
        }

        context.report({
          node: parent,
          message:
            'Must return allowConsoleError if callback contains a return',
          fix(fixer) {
            return fixer.insertTextBefore(parent, 'return ');
          },
        });
      },
    };
  },
};
