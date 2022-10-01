'use strict';

const cssWhat = require('css-what');

module.exports = function (context) {
  /**
   * @param {CompilerNode} node
   */
  function callQuerySelector(node) {
    const {callee} = node;

    // If it's not a querySelector(All) call, I don't care about it.
    const {property} = callee;
    if (
      property.type !== 'Identifier' ||
      !property.name.startsWith('querySelector')
    ) {
      return;
    }

    const leadingComments = context.getCommentsBefore(property);
    const ok = leadingComments.some((comment) => {
      return comment.value === 'OK';
    });
    if (ok) {
      return;
    }

    const selector = getSelector(node, 0);

    if (!isValidSelector(selector)) {
      context.report({
        node,
        message: 'Failed to parse CSS Selector `' + selector + '`',
      });
      return;
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
    // This check must be done after getting the selector, to ensure the
    // selector adheres to escaping requirements.
    if (obj.type === 'Identifier' && /[dD]oc|[rR]oot/.test(obj.name)) {
      return;
    }

    if (!selectorNeedsScope(selector)) {
      return;
    }

    context.report({
      node,
      message:
        'querySelector is not scoped to the element, but ' +
        'globally and filtered to just the elements inside the element. ' +
        'This leads to obscure bugs if you attempt to match a descendant ' +
        'of a descendant (ie querySelector("div div")). Instead, use the ' +
        'scopedQuerySelector in src/core/dom/query.js',
    });
  }

  /**
   * @param {CompilerNode} node
   */
  function callScopedQuerySelector(node) {
    const {callee} = node;
    if (!callee.name.startsWith('scopedQuerySelector')) {
      return;
    }

    const leadingComments = context.getCommentsBefore(node);
    const ok = leadingComments.some((comment) => {
      return comment.value === 'OK';
    });
    if (ok) {
      return;
    }

    const selector = getSelector(node, 1);

    if (!isValidSelector(selector)) {
      context.report({
        node,
        message: 'Failed to parse CSS Selector `' + selector + '`',
      });
      return;
    }

    if (selectorNeedsScope(selector)) {
      return;
    }

    context.report({
      node,
      message:
        'using scopedQuerySelector here is actually ' +
        "unnecessary, since you don't use child selector semantics.",
    });
  }

  /**
   * @param {CompilerNode} node
   * @param {number} argIndex
   * @return {string}
   */
  function getSelector(node, argIndex) {
    const arg = node.arguments[argIndex];
    let selector;

    if (!arg) {
      context.report({node, message: 'no argument to query selector'});
      selector = 'dynamic value';
    } else if (arg.type === 'Literal') {
      selector = arg.value;
    } else if (arg.type === 'TemplateLiteral') {
      // Ensure all template variables are properly escaped.
      let accumulator = '';
      const quasis = arg.quasis.map((v) => v.value.raw);
      for (let i = 0; i < arg.expressions.length; i++) {
        const expression = arg.expressions[i];
        accumulator += quasis[i];

        if (expression.type === 'CallExpression') {
          const {callee} = expression;
          if (callee.type === 'Identifier') {
            const inNthChild = /:nth-(last-)?(child|of-type|col)\([^)]*$/.test(
              accumulator
            );

            if (callee.name === 'escapeCssSelectorIdent') {
              // Add in a basic identifier to represent the call.
              accumulator += 'foo';
              if (inNthChild) {
                context.report({
                  node: expression,
                  message:
                    'escapeCssSelectorIdent may not ' +
                    'be used inside an :nth-X psuedo-class. Please use ' +
                    'escapeCssSelectorNth instead.',
                });
              }
              continue;
            } else if (callee.name === 'escapeCssSelectorNth') {
              // Add in a basic nth-selector to represent the call.
              accumulator += '1';
              if (!inNthChild) {
                context.report({
                  node: expression,
                  message:
                    'escapeCssSelectorNth may only be ' +
                    'used inside an :nth-X psuedo-class. Please use ' +
                    'escapeCssSelectorIdent instead.',
                });
              }
              continue;
            }
          }
        }

        context.report({
          node: expression,
          message:
            'Each selector value must be escaped by ' +
            'escapeCssSelectorIdent in core/dom/css-selectors.js',
        });
      }

      selector = accumulator + quasis[quasis.length - 1];
    } else {
      if (arg.type === 'BinaryExpression') {
        context.report({node: arg, message: 'Use a template literal string'});
      }
      selector = 'dynamic value';
    }

    return selector;
  }

  /**
   * @param {string} selector
   * @return {boolean}
   */
  function isValidSelector(selector) {
    try {
      cssWhat.parse(selector);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if the selector is using grandchild selector semantics
   * `node.querySelector('child grandchild')` or `'child>grandchild'` But,
   * specifically allow multi-selectors `'div, span'`.
   * @param {string} selector
   * @return {boolean}
   */
  function selectorNeedsScope(selector) {
    // strip out things that can't affect children selection
    selector = selector.replace(/\(.*\)|\[.*\]/, function (match) {
      return match[0] + match[match.length - 1];
    });

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
