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

module.exports = function(context) {
  function callQuerySelector(node) {
    const {callee} = node;

    // If it's not a querySelector(All) call, I don't care about it.
    const {property} = callee;
    if (property.type !== 'Identifier' ||
        !property.name.startsWith('querySelector')) {
      return;
    }

    if (property.leadingComments) {
      const ok = property.leadingComments.some(comment => {
        return comment.value === 'OK';
      });
      if (ok) {
        return;
      }
    }

    const selector = getSelector(node, 0);

    // What are we calling querySelector on?
    let obj = callee.object;
    if (obj.type === 'CallExpression') {
      obj = obj.callee;
    }
    if (obj.type === 'MemberExpression') {
      obj = obj.property;
    }

    // Any query selector is allowed on document
    // This check must be done after getting the selector, to ensure the
    // selector adheres to escaping requirements.
    if (obj.type === 'Identifier' && /[dD]oc|[rR]oot/.test(obj.name)) {
      return;
    }

    if (!selectorNeedsScope(selector)) {
      return;
    }

    context.report(node, 'querySelector is not scoped to the element, but ' +
        'globally and filtered to just the elements inside the element. ' +
        'This leads to obscure bugs if you attempt to match a descendant ' +
        'of a descendant (ie querySelector("div div")). Instead, use the ' +
        'scopedQuerySelector in src/dom.js');
  }

  function callScopedQuerySelector(node) {
    const {callee} = node;
    if (!callee.name.startsWith('scopedQuerySelector')) {
      return;
    }

    if (callee.trailingComments) {
      const ok = callee.trailingComments.some(comment => {
        return comment.value === 'OK';
      });
      if (ok) {
        return;
      }
    }

    const selector = getSelector(node, 1);

    if (selectorNeedsScope(selector)) {
      return;
    }

    context.report(node, 'using scopedQuerySelector here is actually ' +
        "unnecessary, since you don't use child selector semantics.");
  }

  function getSelector(node, argIndex) {
    const arg = node.arguments[argIndex];
    let selector;

    if (!arg) {
      context.report(node, 'no argument to query selector');
      selector = 'dynamic value';
    } else if (arg.type === 'Literal') {
      selector = arg.value;
    } else if (arg.type === 'TemplateLiteral') {

      // Ensure all template variables are properly escaped.
      let accumulator = '';
      const quasis = arg.quasis.map(v => v.value.raw);
      for (let i = 0; i < arg.expressions.length; i++) {
        const expression = arg.expressions[i];
        accumulator += quasis[i];

        if (expression.type === 'CallExpression') {
          const {callee} = expression;
          if (callee.type === 'Identifier') {
            const inNthChild = /:nth-(last-)?(child|of-type|col)\([^)]*$/.test(
                accumulator);

            if (callee.name === 'escapeCssSelectorIdent') {
              if (inNthChild) {
                context.report(expression, 'escapeCssSelectorIdent may not ' +
                    'be used inside an :nth-X psuedo-class. Please use ' +
                    'escapeCssSelectorNth instead.');
              }
              continue;
            } else if (callee.name === 'escapeCssSelectorNth') {
              if (!inNthChild) {
                context.report(expression, 'escapeCssSelectorNth may only be ' +
                    'used inside an :nth-X psuedo-class. Please use ' +
                    'escapeCssSelectorIdent instead.');
              }
              continue;
            }
          }
        }

        context.report(expression, 'Each selector value must be escaped by ' +
            'escapeCssSelectorIdent in src/dom.js');
      }

      selector = quasis.join('');
    } else {
      if (arg.type === 'BinaryExpression') {
        context.report(arg, 'Use a template literal string');
      }
      selector = 'dynamic value';
    }

    // strip out things that can't affect children selection
    selector = selector.replace(/\(.*\)|\[.*\]/, function(match) {
      return match[0] + match[match.length - 1];
    });

    return selector;
  }

  // Checks if the selector is using grandchild selector semantics
  // `node.querySelector('child grandchild')` or `'child>grandchild'` But,
  // specifically allow multi-selectors `'div, span'`.
  function selectorNeedsScope(selector) {
    // This regex actually verifies there is no whitespace (implicit child
    // semantics) or `>` chars (direct child semantics). The one exception is
    // for `,` multi-selectors, which can have whitespace.
    const noChildSemantics = /^(\s*,\s*|(?!\s|>).)*$/.test(selector);
    return !noChildSemantics;
  }

  return {
    CallExpression(node) {
      if (/test-/.test(context.getFilename())) {
        return;
      }

      const {callee} = node;
      if (callee.type === 'MemberExpression') {
        callQuerySelector(node);
      } else if (callee.type === 'Identifier') {
        callScopedQuerySelector(node);
      }
    },
  };
};
