import {bindParser as parser} from '#build/parsers/bind-expr-impl';

import {isArray, isObject} from '#core/types';
import {hasOwn, map} from '#core/types/object';

import {devAssert, user} from '#utils/log';

import {AstNodeType} from './bind-expr-defines';

import {getMode} from '../../../src/mode';

const TAG = 'amp-bind';

/**
 * Maximum number of nodes in an expression AST.
 * @const @private {number}
 */
const MAX_AST_SIZE = 250;

/** @const @private {string} */
const CUSTOM_FUNCTIONS = 'custom-functions';

/**
 * Map of object type to function name to allowlisted function.
 * @private {!{[key: string]: !{[key: string]: Function}}}
 */
let FUNCTION_ALLOWLIST;

/**
 * @return {!{[key: string]: !{[key: string]: Function}}}
 * @private
 */
function generateFunctionAllowlist() {
  /**
   * Deprecated. Static, not-in-place variant of Array#splice.
   * @param {!Array} array
   * @param {number=} unusedStart
   * @param {number=} unusedDeleteCount
   * @param {...?} unusedItems
   * @return {!Array}
   */
  function splice(array, unusedStart, unusedDeleteCount, unusedItems) {
    if (!isArray(array)) {
      throw new Error(`splice: ${array} is not an array.`);
    }
    const copy = Array.prototype.slice.call(array);
    const args = Array.prototype.slice.call(arguments, 1);
    Array.prototype.splice.apply(copy, args);
    return copy;
  }

  /**
   * Needs to be wrapped to avoid a duplicate name conflict with the deprecated
   * splice function above.
   * @return {!Function}
   */
  function instanceSplice() {
    /**
     * @param {number=} unusedStart
     * @param {number=} unusedDeleteCount
     * @param {...?} unusedItems
     * @return {!Array}
     * @this {!Array}
     */
    function splice(unusedStart, unusedDeleteCount, unusedItems) {
      const copy = Array.prototype.slice.call(this);
      Array.prototype.splice.apply(copy, arguments);
      return copy;
    }
    return splice;
  }

  /**
   * Deprecated. Static, not-in-place variant of Array#sort.
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
   * Needs to be wrapped to avoid a duplicate name conflict with the deprecated
   * sort function above.
   * @return {!Function}
   */
  function instanceSort() {
    /**
     * @param {!Function} compareFunction
     * @return {!Array}
     * @this {!Array}
     */
    function sort(compareFunction) {
      const copy = Array.prototype.slice.call(this);
      Array.prototype.sort.call(copy, compareFunction);
      return copy;
    }
    return sort;
  }

  // Prototype functions.
  const allowlist = {
    '[object Array]': {
      // TODO(choumx): Polyfill Array#find and Array#findIndex for IE.
      'concat': Array.prototype.concat,
      'filter': Array.prototype.filter,
      'indexOf': Array.prototype.indexOf,
      'join': Array.prototype.join,
      'lastIndexOf': Array.prototype.lastIndexOf,
      'map': Array.prototype.map,
      'reduce': Array.prototype.reduce,
      'slice': Array.prototype.slice,
      'some': Array.prototype.some,
      'sort': instanceSort(),
      'splice': instanceSplice(),
      'includes': Array.prototype.includes,
    },
    '[object Number]': {
      'toExponential': Number.prototype.toExponential,
      'toFixed': Number.prototype.toFixed,
      'toPrecision': Number.prototype.toPrecision,
      'toString': Number.prototype.toString,
    },
    '[object String]': {
      'charAt': String.prototype.charAt,
      'charCodeAt': String.prototype.charCodeAt,
      'concat': String.prototype.concat,
      'indexOf': String.prototype.indexOf,
      'lastIndexOf': String.prototype.lastIndexOf,
      'replace': String.prototype.replace,
      'slice': String.prototype.slice,
      'split': String.prototype.split,
      'substr': String.prototype.substr,
      'substring': String.prototype.substring,
      'toLowerCase': String.prototype.toLowerCase,
      'toUpperCase': String.prototype.toUpperCase,
    },
  };

  // Un-namespaced static functions.
  allowlist[CUSTOM_FUNCTIONS] = {
    'encodeURI': encodeURI,
    'encodeURIComponent': encodeURIComponent,
    'abs': Math.abs,
    'ceil': Math.ceil,
    'floor': Math.floor,
    'sqrt': Math.sqrt,
    'log': Math.log,
    'max': Math.max,
    'min': Math.min,
    'pow': Math.pow,
    'random': Math.random,
    'round': Math.round,
    'sign': Math.sign,
    'keys': Object.keys,
    'values': Object.values,
  };

  // Creates a map of function name to the function itself.
  // This makes function lookups faster (compared to Array.indexOf).
  const out = map();
  Object.keys(allowlist).forEach((type) => {
    out[type] = map();

    const functionsForType = allowlist[type];
    Object.keys(functionsForType).forEach((name) => {
      const func = functionsForType[name];
      if (func) {
        devAssert(
          // Partial match to account for bundlers adding a suffix to the name.
          !func.name || func.name.startsWith(name),
          'Listed function name ' +
            `"${name}" doesn't match name property "${func.name}".`
        );
        out[type][name] = func;
      } else {
        // This can happen if a browser doesn't support a built-in function.
        throw new Error(`Unsupported function: ${type}.${name}`);
      }
    });
  });

  // Custom functions (non-JS-built-ins) must be added manually as their names
  // will be minified at compile time.
  out[CUSTOM_FUNCTIONS]['copyAndSplice'] = splice; // Deprecated.
  out[CUSTOM_FUNCTIONS]['sort'] = sort; // Deprecated.
  out[CUSTOM_FUNCTIONS]['splice'] = splice; // Deprecated.

  return out;
}

/**
 * A single Bind expression.
 */
export class BindExpression {
  /**
   * @param {string} expressionString
   * @param {!{[key: string]: !./bind-macro.BindMacro}} macros
   * @param {number=} opt_maxAstSize
   * @throws {Error} On malformed expressions.
   */
  constructor(expressionString, macros, opt_maxAstSize) {
    if (!FUNCTION_ALLOWLIST) {
      FUNCTION_ALLOWLIST = generateFunctionAllowlist();
    }

    /** @const {string} */
    this.expressionString = expressionString;

    /** @private @const {!{[key: string]: !./bind-macro.BindMacro}} */
    this.macros_ = macros;

    /** @const @private {!./bind-expr-defines.AstNode} */
    this.ast_ = parser.parse(this.expressionString);

    /** @const {number} */
    this.expressionSize = this.numberOfNodesInAst_(this.ast_);

    // Check if this expression string is too large (for performance).
    const maxSize = opt_maxAstSize || MAX_AST_SIZE;
    const skipConstraint = getMode().localDev && !getMode().test;
    if (this.expressionSize > maxSize && !skipConstraint) {
      throw new Error(
        `Expression size (${this.expressionSize}) exceeds max ` +
          `(${maxSize}). Please reduce number of operands.`
      );
    }
  }

  /**
   * Evaluates the expression given a scope.
   * @param {!JsonObject} scope
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
      this.argumentsForInvocation_(ast).forEach((arg) => {
        if (arg) {
          nodes += this.numberOfNodesInAst_(arg) - 1;
        }
      });
      return nodes;
    } else {
      let nodes = 1;
      if (ast.args) {
        ast.args.forEach((arg) => {
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
      ast.type === AstNodeType.INVOCATION && !ast.args[0];
    if (isInvocationWithNoCaller) {
      const macroExistsWithValue = this.macros_[String(ast.value)] != null;
      return macroExistsWithValue;
    }
    return false;
  }

  /**
   * Given an INVOCATION node, returns an array containing its arguments.
   * Also unwraps its ARGS child, if it has one.
   * @param {!./bind-expr-defines.AstNode} ast
   * @return {!Array<./bind-expr-defines.AstNode>}
   * @private
   */
  argumentsForInvocation_(ast) {
    // The INVOCATION node may or may not contain an ARGS child node.
    const argsNode =
      ast.args.length === 2 && ast.args[1].type === AstNodeType.ARGS
        ? ast.args[1]
        : null;
    if (argsNode) {
      // An ARGS node can either have an empty array or an ARRAY child.
      const {args} = argsNode;
      if (args.length === 0) {
        return [];
      } else if (args.length === 1 && args[0].type === AstNodeType.ARRAY) {
        // An ARRAY node contains an actual array.
        const arrayNode = args[0];
        return arrayNode.args || [];
      }
    }
    // Otherwise, just return the array of its non-ARGS arguments.
    return ast.args || [];
  }

  /**
   * Recursively evaluates and returns value of `node` and its children.
   * @param {./bind-expr-defines.AstNode} node
   * @param {!JsonObject} scope
   * @throws {Error}
   * @return {BindExpressionResultDef}
   * @private
   */
  eval_(node, scope) {
    if (!node) {
      return null;
    }

    const {args, type, value} = node;

    // `value` should always exist for literals.
    if (type === AstNodeType.LITERAL && value !== undefined) {
      return value;
    }

    switch (type) {
      case AstNodeType.EXPRESSION:
        return this.eval_(args[0], scope);

      case AstNodeType.INVOCATION:
        // Built-in functions and macros don't have a caller object.
        const isBuiltInOrMacro = args[0] === undefined;

        const caller = this.eval_(args[0], scope);
        const params = this.eval_(args[1], scope);
        const method = String(value);

        let validFunction;
        let unsupportedError;

        if (isBuiltInOrMacro) {
          const macro = this.macros_[method];
          if (macro) {
            validFunction = function () {
              return macro.evaluate(
                scope,
                Array.prototype.slice.call(arguments)
              );
            };
          } else {
            validFunction = FUNCTION_ALLOWLIST[CUSTOM_FUNCTIONS][method];
          }
          if (!validFunction) {
            unsupportedError = `${method} is not a supported function.`;
          }
        } else {
          if (caller === null) {
            user().warn(
              TAG,
              `Cannot invoke method ${method} on null; returning null.`
            );
            return null;
          }
          const callerType = Object.prototype.toString.call(caller);
          const allowlist = FUNCTION_ALLOWLIST[callerType];
          if (allowlist) {
            const f = caller[method];
            if (f && f === allowlist[method]) {
              validFunction = f;
            } else if (this.isCustomInstanceFunction_(method)) {
              validFunction = allowlist[method];
            }
          }
          if (!validFunction) {
            unsupportedError = `${callerType}.${method} is not a supported function.`;
          }
        }

        if (validFunction) {
          if (Array.isArray(params)) {
            if (this.containsInvalidArgument_(method, params)) {
              throw new Error(`Unexpected argument type in ${method}().`);
            }
            return validFunction.apply(caller, params);
          }
        }

        throw new Error(unsupportedError);

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
        if (hasOwn(target, String(member))) {
          return target[member];
        }
        return null;

      case AstNodeType.MEMBER:
        return value || this.eval_(args[0], scope);

      case AstNodeType.VARIABLE:
        const variable = value;
        if (hasOwn(scope, String(variable))) {
          return scope[variable];
        }
        return null;

      case AstNodeType.ARGS:
      case AstNodeType.ARRAY_LITERAL:
        return args.length > 0 ? this.eval_(args[0], scope) : [];

      case AstNodeType.ARRAY:
        return args.map((element) => this.eval_(element, scope));

      case AstNodeType.OBJECT_LITERAL:
        return args.length > 0 ? this.eval_(args[0], scope) : map();

      case AstNodeType.OBJECT:
        const object = map();
        args.forEach((keyValue) => {
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
        return (
          Number(this.eval_(args[0], scope)) -
          Number(this.eval_(args[1], scope))
        );

      case AstNodeType.MULTIPLY:
        return (
          Number(this.eval_(args[0], scope)) *
          Number(this.eval_(args[1], scope))
        );

      case AstNodeType.DIVIDE:
        return (
          Number(this.eval_(args[0], scope)) /
          Number(this.eval_(args[1], scope))
        );

      case AstNodeType.MODULO:
        return (
          Number(this.eval_(args[0], scope)) %
          Number(this.eval_(args[1], scope))
        );

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
            /** @type {!Array} */ (names).forEach((name, i) => {
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
   * Returns true if `method` is a non-standard instance function.
   * We alter certain functions e.g. Array.sort to modify and return a copy
   * instead of operating in-place.
   * @param {string} method
   * @return {boolean}
   * @private
   */
  isCustomInstanceFunction_(method) {
    return method === 'sort' || method === 'splice';
  }

  /**
   * @param {string} method
   * @param {!Array} params
   * @return {boolean}
   * @private
   */
  containsInvalidArgument_(method, params) {
    // Don't allow objects as parameters except for certain functions.
    if (method == 'keys' || method == 'values' || method == 'splice') {
      return false;
    }
    return this.containsObject_(params);
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
