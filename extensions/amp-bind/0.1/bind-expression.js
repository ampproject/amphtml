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

import {AstNodeType} from './bind-expr-defines';
import {getMode} from '../../../src/mode';
import {isArray, isObject} from '../../../src/types';
import {parser} from './bind-expr-impl';
import {user} from '../../../src/log';

const TAG = 'amp-bind';

/**
 * Possible types of a Bind expression evaluation.
 * @typedef {(null|boolean|string|number|Array|Object)}
 */
export let BindExpressionResultDef;

/** @const @private {string} */
const BUILT_IN_FUNCTIONS = 'built-in-functions';

/**
 * Map of object type to function name to whitelisted function.
 * @const @private {!Object<string, !Object<string, Function>>}
 */
const FUNCTION_WHITELIST = (function() {

  /**
   * Similar to Array.prototype.splice, except it returns a copy of the
   * passed-in array with the desired modifications.
   * @param {!Array} array
   * @param {number=} start
   * @param {number=} deleteCount
   * @param {...?} items
   */
  /*eslint "no-unused-vars": 0*/
  function copyAndSplice(array, start, deleteCount, items) {
    if (!isArray(array)) {
      throw new Error(
        `copyAndSplice: ${array} is not an array.`);
    }
    const copy = Array.prototype.slice.call(array);
    Array.prototype.splice.apply(
        copy,
        Array.prototype.slice.call(arguments, 1));
    return copy;
  }

  const whitelist = {
    '[object Array]':
      [
        Array.prototype.concat,
        Array.prototype.indexOf,
        Array.prototype.join,
        Array.prototype.lastIndexOf,
        Array.prototype.slice,
        Array.prototype.includes,
      ],
    '[object String]':
      [
        String.prototype.charAt,
        String.prototype.charCodeAt,
        String.prototype.concat,
        String.prototype.indexOf,
        String.prototype.lastIndexOf,
        String.prototype.slice,
        String.prototype.split,
        String.prototype.substr,
        String.prototype.substring,
        String.prototype.toLowerCase,
        String.prototype.toUpperCase,
      ],
  };
  whitelist[BUILT_IN_FUNCTIONS] = [
    Math.abs,
    Math.ceil,
    Math.floor,
    Math.max,
    Math.min,
    Math.random,
    Math.round,
    Math.sign,
    copyAndSplice,
  ];
  // Creates a prototype-less map of function name to the function itself.
  // This makes function lookups faster (compared to Array.indexOf).
  const out = Object.create(null);
  Object.keys(whitelist).forEach(type => {
    out[type] = Object.create(null);

    const functions = whitelist[type];
    for (let i = 0; i < functions.length; i++) {
      const f = functions[i];
      out[type][f.name] = f;
    }
  });
  return out;
})();

/**
 * Default maximum number of nodes in an expression AST.
 * Double size of a "typical" expression in examples/bind/performance.amp.html.
 * @const @private {number}
 */
const DEFAULT_MAX_AST_SIZE = 50;

/**
 * A single Bind expression.
 */
export class BindExpression {
  /**
   * @param {string} expressionString
   * @param {number=} opt_maxAstSize
   * @throws {Error} On malformed expressions.
   */
  constructor(expressionString, opt_maxAstSize) {
    /** @const {string} */
    this.expressionString = expressionString;

    /** @const @private {!./bind-expr-defines.AstNode} */
    this.ast_ = parser.parse(this.expressionString);

    // Check if this expression string is too large (for performance).
    const size = this.numberOfNodesInAst_(this.ast_);
    const maxSize = opt_maxAstSize || DEFAULT_MAX_AST_SIZE;
    const skipConstraint = getMode().localDev && !getMode().test;
    if (size > maxSize && !skipConstraint) {
      throw new Error(`Expression size (${size}) exceeds max (${maxSize}). ` +
          `Please reduce number of operands.`);
    }
  }

  /**
   * Evaluates the expression given a scope.
   * @param {!Object} scope
   * @throws {Error} On illegal function invocation.
   * @return {BindExpressionResultDef}
   */
  evaluate(scope) {
    return this.eval_(this.ast_, scope);
  }

  /**
   * @param {!./bind-expr-defines.AstNode} ast
   * @return {number}
   * @private
   */
  numberOfNodesInAst_(ast) {
    let nodes = 1;
    if (ast.args) {
      ast.args.forEach(arg => {
        if (arg) {
          nodes += this.numberOfNodesInAst_(arg);
        }
      });
    }
    return nodes;
  }

  /**
   * Recursively evaluates and returns value of `node` and its children.
   * @param {./bind-expr-defines.AstNode} node
   * @param {!Object} scope
   * @throws {Error}
   * @return {BindExpressionResultDef}
   * @private
   */
  eval_(node, scope) {
    if (!node) {
      return null;
    }

    const {type, args, value} = node;

    // `value` should always exist for literals.
    if (type === AstNodeType.LITERAL && value !== undefined) {
      return value;
    }

    switch (type) {
      case AstNodeType.EXPRESSION:
        return this.eval_(args[0], scope);

      case AstNodeType.INVOCATION:
        // Built-in functions don't have a caller object.
        const isBuiltIn = (args[0] === undefined);

        const caller = this.eval_(args[0], scope);
        const params = this.eval_(args[1], scope);
        const method = String(value);

        let validFunction;
        let unsupportedError;

        if (isBuiltIn) {
          validFunction = FUNCTION_WHITELIST[BUILT_IN_FUNCTIONS][method];
          if (!validFunction) {
            unsupportedError = `${method} is not a supported function.`;
          }
        } else {
          if (caller === null) {
            user().warn(TAG, `Cannot invoke method ${method} on null; ` +
                `returning null.`);
            return null;
          }
          const callerType = Object.prototype.toString.call(caller);
          const whitelist = FUNCTION_WHITELIST[callerType];
          if (whitelist) {
            const f = caller[method];
            if (f && f === whitelist[method]) {
              validFunction = f;
            }
          }
          if (!validFunction) {
            unsupportedError =
                `${callerType}.${method} is not a supported function.`;
          }
        }

        if (validFunction) {
          if (Array.isArray(params) && !this.containsObject_(params)) {
            return validFunction.apply(caller, params);
          } else {
            throw new Error(`Unexpected argument type in ${method}().`);
          }
        }

        throw new Error(unsupportedError);

      case AstNodeType.MEMBER_ACCESS:
        const target = this.eval_(args[0], scope);
        const member = this.eval_(args[1], scope);

        if (target === null || member === null) {
          this.memberAccessWarning_(target, member);
          return null;
        }
        const targetType = typeof target;
        if (targetType !== 'string' && targetType !== 'object') {
          this.memberAccessWarning_(target, member);
          return null;
        }
        const memberType = typeof member;
        if (memberType !== 'string' && memberType !== 'number') {
          this.memberAccessWarning_(target, member);
          return null;
        }
        // Ignore Closure's type constraint for `hasOwnProperty`.
        if (Object.prototype.hasOwnProperty.call(
              /** @type {Object} */ (target), member)) {
          return target[member];
        } else {
          this.memberAccessWarning_(target, member);
        }
        return null;

      case AstNodeType.MEMBER:
        return value || this.eval_(args[0], scope);

      case AstNodeType.VARIABLE:
        const variable = value;
        if (Object.prototype.hasOwnProperty.call(scope, variable)) {
          return scope[variable];
        } else {
          user().warn(TAG, `${variable} is not defined; returning null.`);
        }
        return null;

      case AstNodeType.ARGS:
      case AstNodeType.ARRAY_LITERAL:
        return (args.length > 0) ? this.eval_(args[0], scope) : [];

      case AstNodeType.ARRAY:
        return args.map(element => this.eval_(element, scope));

      case AstNodeType.OBJECT_LITERAL:
        return (args.length > 0)
            ? this.eval_(args[0], scope)
            : Object.create(null);

      case AstNodeType.OBJECT:
        const object = Object.create(null);
        args.forEach(keyValue => {
          const {k, v} = this.eval_(keyValue, scope);
          object[k] = v;
        });
        return object;

      case AstNodeType.KEY_VALUE:
        return {
          k: this.eval_(args[0], scope),
          v: this.eval_(args[1], scope),
        };

      case AstNodeType.NOT:
        return !this.eval_(args[0], scope);

      case AstNodeType.UNARY_MINUS:
        return -Number(this.eval_(args[0], scope));

      case AstNodeType.UNARY_PLUS:
        return +Number(this.eval_(args[0], scope));

      case AstNodeType.PLUS:
        return this.eval_(args[0], scope) + this.eval_(args[1], scope);

      case AstNodeType.MINUS:
        return Number(this.eval_(args[0], scope)) -
            Number(this.eval_(args[1], scope));

      case AstNodeType.MULTIPLY:
        return Number(this.eval_(args[0], scope)) *
            Number(this.eval_(args[1], scope));

      case AstNodeType.DIVIDE:
        return Number(this.eval_(args[0], scope)) /
            Number(this.eval_(args[1], scope));

      case AstNodeType.MODULO:
        return Number(this.eval_(args[0], scope)) %
            Number(this.eval_(args[1], scope));

      case AstNodeType.LOGICAL_AND:
        return this.eval_(args[0], scope) && this.eval_(args[1], scope);

      case AstNodeType.LOGICAL_OR:
        return this.eval_(args[0], scope) || this.eval_(args[1], scope);

      case AstNodeType.LESS_OR_EQUAL:
        return this.eval_(args[0], scope) <= this.eval_(args[1], scope);

      case AstNodeType.LESS:
        return this.eval_(args[0], scope) < this.eval_(args[1], scope);

      case AstNodeType.GREATER_OR_EQUAL:
        return this.eval_(args[0], scope) >= this.eval_(args[1], scope);

      case AstNodeType.GREATER:
        return this.eval_(args[0], scope) > this.eval_(args[1], scope);

      case AstNodeType.NOT_EQUAL:
        return this.eval_(args[0], scope) != this.eval_(args[1], scope);

      case AstNodeType.EQUAL:
        return this.eval_(args[0], scope) == this.eval_(args[1], scope);

      case AstNodeType.TERNARY:
        return this.eval_(args[0], scope)
            ? this.eval_(args[1], scope)
            : this.eval_(args[2], scope);

      default:
        throw new Error(`Unexpected AstNodeType: ${type}.`);
    }
  }

  /**
   * @param {*} target
   * @param {*} member
   * @private
   */
  memberAccessWarning_(target, member) {
    user().warn(TAG, `Cannot read property ${JSON.stringify(member)} of ` +
        `${JSON.stringify(target)}; returning null.`);
  }


  /**
   * Returns true if input array contains a plain object.
   * @param {!Array} array
   * @return {boolean}
   * @private
   */
  containsObject_(array) {
    for (let i = 0; i < array.length; i++) {
      if (isObject(array[i])) {
        return true;
      }
    }
    return false;
  }
}
