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

const doctrine = require('doctrine');
const traverse = require('traverse');

/** @typedef {!Object} */
let EslintContextDef;

/** @typedef {!Object} */
let EslintNodeDef;

/**
 * @typedef {{
 *   node: !EslintNodeDef,
 *   parsed: !Object
 * }}
 */
let ClosureCommentDef;

module.exports = function(context) {
  const sourceCode = context.getSourceCode();

  return {
    meta: {
      fixable: 'code',
    },
    Program: function() {
      const comments = /** @type {!Array<!EslintNodeDef>} */ (sourceCode.getAllComments());
      comments
        .map(node => parseClosureComments(context, node))
        .forEach(comment => checkClosureComments(context, comment));
    },
  };
};

/**
 * Parses Closure Compiler tags into an array from the given comment.
 * @param {!EslintContextDef} context
 * @param {!EslintNodeDef} node
 * @return {?ClosureCommentDef}
 */
function parseClosureComments(context, node) {
  try {
    return {
      parsed: doctrine.parse(node.value, {recoverable: true, unwrap: true}),
      node,
    };
  } catch (e) {
    reportUnparseableNode(context, node);
    return null;
  }
}

/**
 * Report the existence of a syntax error in a closure comment.
 * @param {!EslintContextDef} context
 * @param {!EslintNodeDef} node
 */
function reportUnparseableNode(context, node) {
  context.report({
    node,
    message: 'A Closure JSDoc syntax error was encountered.',
  });
}

/**
 * Parse a Closure Compiler comment and check if it contains a primitive
 * redundantly specified as non-nullable with a !
 * e.g. {!string}
 * @param {!EslintContextDef} context
 * @param {?ClosureCommentDef} closureComment
 */
function checkClosureComments(context, closureComment) {
  if (!closureComment) {
    return;
  }

  const {parsed, node} = closureComment;
  traverse(parsed).forEach(astNode => {
    if (!astNode) {
      return;
    }

    const {name} = astNode;
    if (astNode.type === 'NameExpression' && isPrimitiveWrapperName(name)) {
      reportPrimitiveWrapper(context, node, name);
    }
    if (astNode.type === 'NonNullableType') {
      checkNonNullableNodes(context, node, astNode);
    }
  });
}

/** @enum {string} */
const PRIMITIVE_WRAPPER_NAMES = ['Boolean', 'Number', 'String', 'Symbol'];

/**
 * Disallowed primitives wrappers, from
 * go/es6-style#disallowed-features-wrapper-objects
 * @param {string} name
 * @return {boolean}
 */
function isPrimitiveWrapperName(name) {
  return PRIMITIVE_WRAPPER_NAMES.includes(name);
}

/**
 * Report the existence of a primitive wrapper. If --fix is specified,
 * the name will be converted to the non-wrapper primitive.
 * @param {!EslintContextDef} context
 * @param {!EslintNodeDef} node
 * @param {string} name
 */
function reportPrimitiveWrapper(context, node, name) {
  context.report({
    node,
    message: 'Forbidden primitive wrapper {{ name }}.',
    data: {name},
    fix(fixer) {
      const badTextIndex = node.value.indexOf(name);
      if (badTextIndex === -1) {
        return;
      }

      const start = node.range[0] + badTextIndex + 2;
      const end = start + name.length;
      return fixer.replaceTextRange([start, end], name.toLowerCase());
    },
  });
}

/**
 * Check if a Closure Compiler comment contains a primitive redundantly
 * specified as non-nullable with a !
 * @param {!EslintContextDef} context
 * @param {!EslintNodeDef} node
 * @param {!Object} astNode
 */
function checkNonNullableNodes(context, node, astNode) {
  if (!astNode.expression) {
    return;
  }

  const {type, name} = astNode.expression;
  if (type === 'FunctionType') {
    reportNonNullablePrimitive(context, node, 'function');
  } else if (type === 'UndefinedLiteral') {
    reportNonNullablePrimitive(context, node, 'undefined');
  } else if (type === 'NameExpression' && isNonNullablePrimitiveName(name)) {
    reportNonNullablePrimitive(context, node, name);
  }
}

/**
 * Default non-nullable primitives, from go/es6-style#jsdoc-nullability
 * Technically `undefined` and `function()` are primitives in Closure,
 * but doctrine gives their expression nodes a different type than the others,
 * so we don't add them to this list.
 * @enum {string}
 */
const NON_NULLABLE_PRIMITIVE_NAMES = ['boolean', 'number', 'string', 'symbol'];

/**
 * True if the given name matches a primitive type
 * @param {string} name
 * @return {boolean}
 */
function isNonNullablePrimitiveName(name) {
  return NON_NULLABLE_PRIMITIVE_NAMES.includes(name);
}

/**
 * Report the existence of a non-nullable primitive. If --fix is specified,
 * remove the offending exclamation point.
 * @param {!EslintContextDef} context
 * @param {!EslintNodeDef} node
 * @param {string} name
 */
function reportNonNullablePrimitive(context, node, name) {
  context.report({
    node,
    message: 'Redundant non-nullable primitive {{ name }}.',
    data: {name},
    fix(fixer) {
      const badText = `!${name}`;
      const badTextIndex = node.value.indexOf(badText);
      if (badTextIndex === -1) {
        return;
      }

      const start = node.range[0] + badTextIndex + 2;
      const end = start + 1;
      return fixer.removeRange([start, end]);
    },
  });
}
