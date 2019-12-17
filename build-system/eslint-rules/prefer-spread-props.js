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

module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      'CallExpression[callee.object.name="Object"][callee.property.name="assign"]': function(
        node
      ) {
        const args = node.arguments;
        if (args.length <= 1) {
          return;
        }

        const first = args[0];
        if (first.type !== 'ObjectExpression') {
          return;
        }

        context.report({
          node,
          message: 'Prefer using object literals with spread property syntax',

          fix(fixer) {
            const texts = args.map(arg => `...${sourceCode.getText(arg)}`);
            if (first.properties.length === 0) {
              texts.shift();
            }

            return fixer.replaceText(node, `({${texts.join(',')}})`);
          },
        });
      },
    };
  },
};
