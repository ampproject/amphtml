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
import {parser} from './bind-expr-impl';

/**
 * Possible types of a Bind expression evaluation.
 * @typedef {(null|boolean|string|number|Array|Object)}
 */
export let BindExpressionResultDef;

/**
 * Map of object type to function name to whitelisted function.
 * @type {!Object<string, !Object<string, Function>>}
 */
const FUNCTION_WHITELIST = (function() {
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
 * A single Bind expression.
 */
export class BindExpression {
  /**
   * @param {string} expressionString
   * @throws {Error} On malformed expressions.
   */
  constructor(expressionString) {
    /** @const {string} */
    this.expressionString = expressionString;

    /** @const {!./bind-expr-defines.AstNode} */
    this.ast_ = parser.parse(this.expressionString);
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
   * Recursively evaluates and returns value of `node` and its children.
   * @param {?./bind-expr-defines.AstNode} node
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
        const caller = this.eval_(args[0], scope);
        const params = this.eval_(args[1], scope);
        const method = String(value);

        const callerType = Object.prototype.toString.call(caller);
        const whitelist = FUNCTION_WHITELIST[callerType];
        if (whitelist) {
          const func = caller[method];
          if (func && func === whitelist[method]) {
            if (Array.isArray(params) && !this.containsObject_(params)) {
              return func.apply(caller, params);
            } else {
              throw new Error(`Unexpected argument type in ${method}().`);
            }
          }
        }
        throw new Error(`${method}() is not a supported function.`);

      case AstNodeType.MEMBER_ACCESS:
        const target = this.eval_(args[0], scope);
        const member = this.eval_(args[1], scope);

        if (target === null || member === null) {
          return null;
        }
        const targetType = typeof target;
        if (targetType !== 'string' && targetType !== 'object') {
          return null;
        }
        const memberType = typeof member;
        if (memberType !== 'string' && memberType !== 'number') {
          return null;
        }
        // Ignore Closure's type constraint for `hasOwnProperty`.
        if (Object.prototype.hasOwnProperty.call(
              /** @type {Object} */ (target), member)) {
          return target[member];
        }
        return null;

      case AstNodeType.MEMBER:
        return value || this.eval_(args[0], scope);

      case AstNodeType.VARIABLE:
        const variable = value;
        if (Object.prototype.hasOwnProperty.call(scope, variable)) {
          return scope[variable];
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
   * Returns true if input array contains a plain object.
   * @param {!Array} array
   * @return {boolean}
   * @private
   */
  containsObject_(array) {
    for (let i = 0; i < array.length; i++) {
      if (Object.prototype.toString.call(array[i]) === '[object Object]') {
        return true;
      }
    }
    return false;
  }
}
