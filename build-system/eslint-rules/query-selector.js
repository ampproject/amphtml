/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

module.exports = function(context) {
  return {
    CallExpression(node) {
      if (/test-/.test(context.getFilename())) {
        return;
      }

      const {callee} = node;
      // Lexical function calls are permitted, it's likely doing something else.
      if (callee.type !== 'MemberExpression') {
        return;
      }

      // If it's not a querySelector(All) call, I don't care about it.
      const {property} = callee;
      if (property.type !== 'Identifier' ||
          !property.name.startsWith('querySelector')) {
        return;
      }

      if (property.leadingComments) {
        const ok = property.leadingComments.some(comment => {
          return comment.value === 'OK'
        });
        if (ok) {
          return;
        }
      }

      // What are we calling querySelector on?
      let obj = callee.object;
      if (obj.type === 'CallExpression') {
        obj = obj.callee;
      }
      if (obj.type === 'MemberExpression') {
        obj = obj.property;
      }

      // Any query selector is allowed on document
      if (obj.type === 'Identifier' && /[dD]oc|[rR]oot/.test(obj.name)) {
        return;
      }

      // Any query selector is allowed on document
      if (obj.type === 'Identifier' && /[dD]oc/.test(obj.name)) {
        return;
      }

      const arg = node.arguments[0];
      let selector
      if (arg.type === 'Literal') {
        selector = arg.value;
      } else if (arg.type === 'TemplateLiteral') {
        for (let i = 0; i < arg.expressions.length; i++) {
          const expression = arg.expressions[i];
          if (expression.type === 'CallExpression') {
            const {callee} = expression;
            if (callee.type === 'Identifier' ||
                callee.name === 'escapeCssSelectorIdent') {
              continue;
            }
          }
          context.report(expression, 'Each selector value must be escaped by '+
              'escapeCssSelectorIdent in src/dom.js');
          return;
        }
        selector = arg.quasis.map(v => v.value.raw).join('');
      } else if (arg.type === 'BinaryExpression') {
        context.report(arg, 'Use a template literal string');
        return;
      } else {
        selector = 'dynamic value';
      }

      // strip out things that can't affect children selection
      selector = selector.replace(/\(.*\)|\[.*\]/, function(match) {
        return match[0] + match[match.length - 1];
      });

      // We passed a string literal to the query selector. Now make sure it is
      // not using grandchild selector semantics `node.querySelector('child
      // grandchild')` or `'child>grandchild'`
      if (/^(?:(?:(?:,)|(?!\s|>)).)*$/.test(selector)) {
        return;
      }

      context.report(node, 'querySelector is not scoped to the element, but ' +
          'globally and filtered to just the elements inside the element. ' +
          'This leads to obscure bugs if you attempt to match a descendant ' +
          'of a descendant (ie querySelector("div div")). Instead, use the ' +
          'scopedQuerySelector in src/dom.js');
    }
  };
};
