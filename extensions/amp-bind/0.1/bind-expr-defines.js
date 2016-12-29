/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @enum {string}
 */
export const ASTType = {
  // Grammar rules.
  EXPRESSION: 'expression',
  INVOCATION: 'invocation',
  ARGS: 'args',
  MEMBER_ACCESS: 'member_access',
  MEMBER: 'member',
  VARIABLE: 'variable',
  LITERAL: 'literal',
  ARRAY_LITERAL: 'array_literal',
  ARRAY: 'array',
  OBJECT_LITERAL: 'object_literal',
  OBJECT: 'object',
  KEY_VALUE: 'key_value',
  // Instead of using having an OPERATION type with subtypes, flatten and use
  // the operation types directly.
  NOT: 'not',
  UNARY_MINUS: 'unary_minus',
  UNARY_PLUS: 'unary_plus',
  PLUS: 'plus',
  MINUS: 'minus',
  MULTIPLY: 'multiply',
  DIVIDE: 'divide',
  MODULO: 'modulo',
  LOGICAL_AND: 'logical_and',
  LOGICAL_OR: 'logical_or',
  LESS_OR_EQUAL: 'less_or_equal',
  LESS: 'less',
  GREATER_OR_EQUAL: 'greater_or_equal',
  GREATER: 'greater',
  NOT_EQUAL: 'not_equal',
  EQUAL: 'equal',
  TERNARY: 'ternary',
};

/**
 * @typedef {(boolean|string|number|null)}
 */
export let ASTNodeValue;

/**
 * @typedef {{
 *   type: ASTType,
 *   args: Array<ASTNode>,
 *   value: (ASTNodeValue|undefined),
 * }}
 */
export let ASTNode;
