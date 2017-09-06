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
 * A single node in the AST of a `BindExpression`.
 * @struct
 */
export class AstNode {
  /**
   * @param {AstNodeType} type
   * @param {?Array<AstNode>} args
   * @param {(AstNodeValue|undefined)=} opt_value
   */
  constructor(type, args, opt_value) {
    /** @const {AstNodeType} */
    this.type = type;

    /** @const {?Array<AstNode>} */
    this.args = args;

    /** @const {(AstNodeValue|undefined)} */
    this.value = opt_value;
  }
}

/**
 * Type of a node in the AST of a `BindExpression`.
 * @enum {number}
 */
export const AstNodeType = {
  // Grammar rules.
  EXPRESSION: 0,
  INVOCATION: 1,
  ARGS: 2,
  MEMBER_ACCESS: 3,
  MEMBER: 4,
  VARIABLE: 5,
  LITERAL: 6,
  ARRAY_LITERAL: 7,
  ARRAY: 8,
  OBJECT_LITERAL: 9,
  OBJECT: 10,
  KEY_VALUE: 11,
  // Instead of using having an OPERATION type with subtypes, flatten and use
  // the operation types directly.
  NOT: 12,
  UNARY_MINUS: 13,
  UNARY_PLUS: 14,
  PLUS: 15,
  MINUS: 16,
  MULTIPLY: 17,
  DIVIDE: 18,
  MODULO: 19,
  LOGICAL_AND: 20,
  LOGICAL_OR: 21,
  LESS_OR_EQUAL: 22,
  LESS: 23,
  GREATER_OR_EQUAL: 24,
  GREATER: 25,
  NOT_EQUAL: 26,
  EQUAL: 27,
  TERNARY: 28,
  ARROW_FUNCTION: 29,
};

/**
 * Value of a primitive or variable node.
 * @typedef {(boolean|string|number|null)}
 */
export let AstNodeValue;

