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

import {ASTNodeType} from './bind-expr-defines';
import {parser} from './bind-expr-impl';
import {user} from '../../../src/log';

const TAG = 'AMP-BIND';

/**
 * A single Bind expression.
 */
export class BindExpression {
  /**
   * @param {string} expressionString
   */
  constructor(expressionString) {
    /** @const {string} */
    this.expressionString = expressionString;

    /** @const {?./bind-expr-defines.ASTNode} */
    this.ast_ = parser.parse(this.expressionString);

    /** @const {!Object<string, !Object<string, Function>>} */
    this.functionWhitelist_ = this.createFunctionWhitelist_();
  }

  /**
   * Evaluates the expression given a scope.
   * @param {!Object} scope
   * @return {*}
   */
  evaluate(scope) {
    let result = null;
    try {
      result = this.eval_(this.ast_, scope);
    } catch (error) {
      user().error(TAG, error.message);
    }
    return result;
  }

  /**
   * Recursively evaluates value of `node` and its children.
   * @param {?./bind-expr-defines.ASTNode} node
   * @param {!Object} scope
   * @return {*}
   * @private
   */
  eval_(node, scope) {
    if (!node) {
      return null;
    }

    const {type, args, value} = node;

    if (type === ASTNodeType.LITERAL) {
      return value;
    }

    // Concise helper function for evaluating child nodes.
    const e = node => this.eval_(node, scope);

    switch (type) {
      case ASTNodeType.EXPRESSION:
        return e(args[0]);

      case ASTNodeType.INVOCATION:
        const caller = e(args[0]);
        const method = args[1];
        const params = e(args[2]);
        const callerType = Object.prototype.toString.call(caller);
        const whitelist = this.functionWhitelist_[callerType];
        if (whitelist) {
          const func = caller[method];
          if (func && func === whitelist[method]) {
            if (!this.containsObject_(params)) {
              return func.apply(caller, params);
            } else {
              throw new Error(`Unexpected argument type in ${method}().`);
            }
          }
        }
        throw new Error(`${method}() is not a supported function.`);

      case ASTNodeType.MEMBER_ACCESS:
        const target = e(args[0]);
        const member = e(args[1]);
        if (target === null || member === null) {
          return null;
        }
        const memberType = typeof member;
        const validType = (memberType === 'string' || memberType === 'number');
        if (validType && Object.prototype.hasOwnProperty.call(target, member)) {
          return target[member];
        }
        return null;

      case ASTNodeType.MEMBER:
        return value || e(args[0]);

      case ASTNodeType.VARIABLE:
        const variable = value;
        if (Object.prototype.hasOwnProperty.call(scope, variable)) {
          return scope[variable];
        }
        return null;

      case ASTNodeType.ARGS:
      case ASTNodeType.ARRAY_LITERAL:
        return (args.length > 0) ? e(args[0]) : [];

      case ASTNodeType.ARRAY:
        return args.map(element => e(element));

      case ASTNodeType.OBJECT_LITERAL:
        return (args.length > 0) ? e(args[0]) : Object.create(null);

      case ASTNodeType.OBJECT:
        const object = Object.create(null);
        args.forEach(keyValue => {
          const {k, v} = e(keyValue);
          object[k] = v;
        });
        return object;

      case ASTNodeType.KEY_VALUE:
        return {k: e(args[0]), v: e(args[1])};

      case ASTNodeType.NOT:
        return !e(args[0]);

      case ASTNodeType.UNARY_MINUS:
        return -e(args[0]);

      case ASTNodeType.UNARY_PLUS:
        /*eslint no-implicit-coercion: 0*/
        return +e(args[0]);

      case ASTNodeType.PLUS:
        return e(args[0]) + e(args[1]);

      case ASTNodeType.MINUS:
        return e(args[0]) - e(args[1]);

      case ASTNodeType.MULTIPLY:
        return e(args[0]) * e(args[1]);

      case ASTNodeType.DIVIDE:
        return e(args[0]) / e(args[1]);

      case ASTNodeType.MODULO:
        return e(args[0]) % e(args[1]);

      case ASTNodeType.LOGICAL_AND:
        return e(args[0]) && e(args[1]);

      case ASTNodeType.LOGICAL_OR:
        return e(args[0]) || e(args[1]);

      case ASTNodeType.LESS_OR_EQUAL:
        return e(args[0]) <= e(args[1]);

      case ASTNodeType.LESS:
        return e(args[0]) < e(args[1]);

      case ASTNodeType.GREATER_OR_EQUAL:
        return e(args[0]) >= e(args[1]);

      case ASTNodeType.GREATER:
        return e(args[0]) > e(args[1]);

      case ASTNodeType.NOT_EQUAL:
        return e(args[0]) != e(args[1]);

      case ASTNodeType.EQUAL:
        return e(args[0]) == e(args[1]);

      case ASTNodeType.TERNARY:
        return e(args[0]) ? e(args[1]) : e(args[2]);

      default:
        throw new Error(`${type} is not a valid node type.`);
    }
  }

  /**
   * Returns map of object type to function name to whitelisted function.
   * @return {!Object<string, !Object<string, Function>>}
   * @private
   */
  createFunctionWhitelist_() {
    const whitelist = {
      '[object Array]':
        [
          Array.prototype.concat,
          Array.prototype.indexOf,
          Array.prototype.join,
          Array.prototype.lastIndexOf,
          Array.prototype.slice,
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
