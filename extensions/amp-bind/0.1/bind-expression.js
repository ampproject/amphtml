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
import {dict, hasOwn, map} from '../../../src/utils/object';
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

/**
 * Default maximum number of nodes in an expression AST.
 * Double size of a "typical" expression in examples/bind/performance.amp.html.
 * @const @private {number}
 */
const DEFAULT_MAX_AST_SIZE = 50;

/** @const @private {string} */
const BUILT_IN_FUNCTIONS = 'built-in-functions';

/**
 * Map of object type to function name to whitelisted function.
 * @private {!Object<string, !Object<string, Function>>}
 */
let FUNCTION_WHITELIST;

/**
 * @return {!Object<string, !Object<string, Function>>}
 * @private
 */
function generateFunctionWhitelist() {
  /**
   * Static, not-in-place variant of Array#splice.
   * @param {!Array} array
   * @param {number=} start
   * @param {number=} deleteCount
   * @param {...?} items
   * @return {!Array}
   */
  /*eslint "no-unused-vars": 0*/
  function splice(array, start, deleteCount, items) {
    if (!isArray(array)) {
      throw new Error(`splice: ${array} is not an array.`);
    }
    const copy = Array.prototype.slice.call(array);
    const args = Array.prototype.slice.call(arguments, 1);
    Array.prototype.splice.apply(copy, args);
    return copy;
  }

  /**
   * Static, not-in-place variant of Array#sort.
   * @param {!Array} array
   * @return {!Array}
   */
  function sort(array) {
    if (!isArray(array)) {
      throw new Error(`sort: ${array} is not an array.`);
    }
    const copy = Array.prototype.slice.call(array);
    Array.prototype.sort.call(copy);
    return copy;
  }

  /**
   * Polyfills Object.values for IE.
   * @param {!Object} object
   * @return {!Array}
   * @see https://github.com/es-shims/Object.values
   */
  function values(object) {
    const v = [];
    for (const key in object) {
      if (hasOwn(object, key)) {
        v.push(object[key]);
      }
    }
    return v;
  }

  // Prototype functions.
  const whitelist = dict({
    '[object Array]': [
      Array.prototype.concat,
      Array.prototype.filter,
      // TODO(choumx): Need polyfill for Array#find and Array#findIndex.
      Array.prototype.indexOf,
      Array.prototype.join,
      Array.prototype.lastIndexOf,
      Array.prototype.map,
      Array.prototype.reduce,
      Array.prototype.slice,
      Array.prototype.some,
      Array.prototype.includes,
    ],
    '[object Number]': [
      Number.prototype.toExponential,
      Number.prototype.toFixed,
      Number.prototype.toPrecision,
      Number.prototype.toString,
    ],
    '[object String]': [
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
  });

  // Un-namespaced static functions.
  whitelist[BUILT_IN_FUNCTIONS] = [
    encodeURI,
    encodeURIComponent,
    Math.abs,
    Math.ceil,
    Math.floor,
    Math.max,
    Math.min,
    Math.random,
    Math.round,
    Math.sign,
    Object.keys, // Object.values is polyfilled below.
  ];

  // Creates a map of function name to the function itself.
  // This makes function lookups faster (compared to Array.indexOf).
  const out = map();
  Object.keys(whitelist).forEach(type => {
    out[type] = map();

    whitelist[type].forEach((fn, i) => {
      if (fn) {
        out[type][fn.name] = fn;
      } else {
        // This can happen if a browser doesn't support a built-in function.
        throw new Error(`Unsupported function for ${type} at index ${i}.`);
      }
    });
  });

  // Custom functions (non-js-built-ins) must be added manually as their names
  // will be minified at compile time.
  out[BUILT_IN_FUNCTIONS]['copyAndSplice'] = splice; // Legacy name.
  out[BUILT_IN_FUNCTIONS]['sort'] = sort;
  out[BUILT_IN_FUNCTIONS]['splice'] = splice;
  out[BUILT_IN_FUNCTIONS]['values'] =
      (typeof Object.values == 'function') ? Object.values : values;

  return out;
}

/**
 * A single Bind expression.
 */
export class BindExpression {
  /**
   * @param {string} expressionString
   * @param {!Object<string, !./bind-macro.BindMacro>} macros
   * @param {number=} opt_maxAstSize
   * @throws {Error} On malformed expressions.
   */
  constructor(expressionString, macros, opt_maxAstSize) {
    if (!FUNCTION_WHITELIST) {
      FUNCTION_WHITELIST = generateFunctionWhitelist();
    }

    /** @const {string} */
    this.expressionString = expressionString;

    /** @private @const {!Object<string, !./bind-macro.BindMacro>} */
    this.macros_ = macros;

    /** @const @private {!./bind-expr-defines.AstNode} */
    this.ast_ = parser.parse(this.expressionString);

    /** @const {number} */
    this.expressionSize = this.numberOfNodesInAst_(this.ast_);

    // Check if this expression string is too large (for performance).
    const maxSize = opt_maxAstSize || DEFAULT_MAX_AST_SIZE;
    const skipConstraint = getMode().localDev && !getMode().test;
    if (this.expressionSize > maxSize && !skipConstraint) {
      throw new Error(`Expression size (${this.expressionSize}) exceeds max ` +
          `(${maxSize}). Please reduce number of operands.`);
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
    // Include the node count of any nested macros in the expression.
    if (this.isMacroInvocationNode_(ast)) {
      const macro = this.macros_[String(ast.value)];
      let nodes = macro.getExpressionSize();
      this.getInvocationArgNodes_(ast).forEach(arg => {
        if (arg) {
          nodes += this.numberOfNodesInAst_(arg) - 1;
        }
      });
      return nodes;
    } else {
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
  }

  /**
   * @param {!./bind-expr-defines.AstNode} ast
   * @return {boolean}
   * @private
   */
  isMacroInvocationNode_(ast) {
    const isInvocationWithNoCaller =
        (ast.type === AstNodeType.INVOCATION && !ast.args[0]);
    if (isInvocationWithNoCaller) {
      const macroExistsWithValue = this.macros_[String(ast.value)] != null;
      return macroExistsWithValue;
    }
    return false;
  }

  /**
   * Gets the array of nodes for the arguments of the provided INVOCATION
   * node, without the wrapping ARGS node and ARRAY node.
   * @param {!./bind-expr-defines.AstNode} ast
   * @return {!Array<./bind-expr-defines.AstNode>}
   * @private
   */
  getInvocationArgNodes_(ast) {
    if (ast.args.length === 2 && ast.args[1].type === AstNodeType.ARGS) {
      const argsNode = ast.args[1];
      if (argsNode.args.length === 0) {
        return [];
      } else if (argsNode.args.length === 1 &&
          argsNode.args[0].type === AstNodeType.ARRAY) {
        const arrayNode = argsNode.args[0];
        return arrayNode.args || [];
      }
    }
    return ast.args || [];
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
        // Built-in functions and macros don't have a caller object.
        const isBuiltInOrMacro = (args[0] === undefined);

        const caller = this.eval_(args[0], scope);
        const params = this.eval_(args[1], scope);
        const method = String(value);

        let validFunction;
        let unsupportedError;

        if (isBuiltInOrMacro) {
          const macro = this.macros_[method];
          if (macro) {
            validFunction = function() {
              return macro.evaluate(
                  scope, Array.prototype.slice.call(arguments));
            };
          } else {
            validFunction = FUNCTION_WHITELIST[BUILT_IN_FUNCTIONS][method];
          }
          if (!validFunction) {
            unsupportedError = `${method} is not a supported function.`;
          }
        } else {
          if (caller === null) {
            user().warn(TAG, `Cannot invoke method ${method} on null; ` +
                'returning null.');
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
          if (Array.isArray(params)) {
            // Don't allow objects as parameters except for Object functions.
            const invalidArgumentType = this.containsObject_(params)
                && !this.isObjectMethod_(method);
            if (!invalidArgumentType) {
              return validFunction.apply(caller, params);
            }
          } else if (typeof params == 'function') {
            // Special case: `params` may be an arrow function, which are only
            // supported as the sole argument to functions like Array#find.
            return validFunction.call(caller, params);
          }
          throw new Error(`Unexpected argument type in ${method}().`);
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
          : map();

      case AstNodeType.OBJECT:
        const object = map();
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

      case AstNodeType.ARROW_FUNCTION:
        const functionScope = map(scope);
        return (...values) => {
          // Support parameters in arrow functions by forwarding their values
          // into the function's scope. For example, in this function call:
          //
          //     const f = (x, y) => x + y;
          //     f(2, 7);
          //
          // `names` == ['x', 'y'] and `values` == [2, 7], so we include
          // {x: 2, y: 7} in the scope when evaluating `x + y`.

          const names = this.eval_(args[0], scope);
          if (names) {
            names.forEach((name, i) => {
              functionScope[name] = values[i];
            });
          }
          return this.eval_(args[1], functionScope);
        };

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
    // Cast valid, because we don't care for the logging.
    const stringified = JSON.stringify(/** @type {!JsonObject} */ (member));
    user().warn(TAG, `Cannot read property ${stringified} of ` +
        `${stringified}; returning null.`);
  }

  /**
   * Returns true iff method is
   * @param {string} method
   * @return {boolean}
   */
  isObjectMethod_(method) {
    return method == 'keys' || method == 'values';
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
