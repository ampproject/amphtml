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

import {BindExpression} from './bind-expression';
import {BindValidator} from './bind-validator';
import {filterSplice} from '../../../src/utils/array';

/**
 * @typedef {{
 *   tagName: string,
 *   property: string,
 *   expressionString: string,
 * }}
 */
export let BindingDef;

/**
 * Error that can be passed through web worker
 * @typedef {{
 *   message: string,
 *   stack: string,
 * }}
 */
let EvaluatorErrorDef;

/**
 * Asynchronously evaluates a set of Bind expressions.
 */
export class BindEvaluator {
  constructor() {
    /** @const @private {!Array<BindingDef>} */
    this.bindings_ = [];

    /** @const @private {!./bind-validator.BindValidator} */
    this.validator_ = new BindValidator();

    /** @const @private {!Object<string, !BindExpression>} */
    this.expressionCache_ = Object.create(null);
  }

  /**
   * Parses and stores given bindings into expression objects and returns map
   * of expression string to parse errors.
   * @param {!Array<BindingDef>} bindings
   * @return {!Object<string,EvaluatorErrorDef>},
   */
  addBindings(bindings) {
    const errors = Object.create(null);
    // Create BindExpression objects from expression strings.
    bindings.forEach(binding => {
      const parsed = this.parse_(binding.expressionString);
      if (parsed.error) {
        errors[binding.expressionString] = {
          message: parsed.error.message,
          stack: parsed.error.stack,
        };
      } else {
        this.bindings_.push(binding);
      }
    });
    return errors;
  }

  /**
   * Removes all parsed bindings for the provided expressions.
   * @param {!Array<string>} expressionStrings
   */
  removeBindingsWithExpressionStrings(expressionStrings) {
    const expressionsToRemove = Object.create(null);
    for (let i = 0; i < expressionStrings.length; i++) {
      expressionsToRemove[expressionStrings[i]] = true;
    }

    filterSplice(this.bindings_, binding =>
      !expressionsToRemove[binding.expressionString]);
  }

  /**
   * Evaluates all expressions with the given `scope` data returns two maps:
   * expression strings to results and expression strings to errors.
   * @param {!Object} scope
   * @return {{
   *   results: !Object<string, ./bind-expression.BindExpressionResultDef>,
   *   errors: !Object<string, !EvaluatorErrorDef>,
   * }}
   */
  evaluateBindings(scope) {
    /** @type {!Object<string, ./bind-expression.BindExpressionResultDef>} */
    const cache = {};
    /** @type {!Object<string, !EvaluatorErrorDef>} */
    const errors = {};

    this.bindings_.forEach(binding => {
      const {tagName, property, expressionString} = binding;
      // Skip if we've already evaluated this expression string.
      if (cache[expressionString] !== undefined || errors[expressionString]) {
        return;
      }
      const expression = this.expressionCache_[expressionString];
      if (!expression) {
        const error =
            new Error(`Expression "${expressionString}"" is not cached.`);
        errors[expressionString] = {message: error.message, stack: error.stack};
        return;
      }
      const {result, error} = this.evaluate_(expression, scope);
      if (error) {
        errors[expressionString] = {message: error.message, stack: error.stack};
        return;
      }
      const resultString = this.stringValueOf_(property, result);
      if (this.validator_.isResultValid(tagName, property, resultString)) {
        cache[expressionString] = result;
      } else {
        const error =
            new Error(`"${result}" is not a valid result for [${property}].`);
        errors[expressionString] = {message: error.message, stack: error.stack};
      }
    });
    return {results: cache, errors};
  }

  /**
   * Evaluates and returns a single expression string.
   * @param {string} expressionString
   * @param {!Object} scope
   * @return {{
   *   result: ./bind-expression.BindExpressionResultDef,
   *   error: Error,
   * }}
   */
  evaluateExpression(expressionString, scope) {
    const parsed = this.parse_(expressionString);
    if (!parsed.expression) {
      return {result: null, error: parsed.error};
    }
    const evaluated = this.evaluate_(parsed.expression, scope);
    if (!evaluated.result) {
      return {result: null, error: evaluated.error};
    }
    return {result: evaluated.result, error: null};
  }

  /**
   * Parses a single expression string, caches and returns it.
   * @param {string} expressionString
   * @return {{
   *   expression: BindExpression,
   *   error: Error,
   * }}
   * @private
   */
  parse_(expressionString) {
    let expression = this.expressionCache_[expressionString];
    let error = null;
    if (!expression) {
      try {
        expression = new BindExpression(expressionString);
        this.expressionCache_[expressionString] = expression;
      } catch (e) {
        error = e;
      }
    }
    return {expression, error};
  }

  /**
   * Evaluate a single expression with the given scope.
   * @param {!BindExpression} expression
   * @param {!Object} scope
   * @return {{
   *   result: ./bind-expression.BindExpressionResultDef,
   *   error: Error,
   * }}
   * @private
   */
  evaluate_(expression, scope) {
    let result = null;
    let error = null;
    try {
      result = expression.evaluate(scope);
    } catch (e) {
      error = e;
    }
    return {result, error};
  }

  /**
   * Return parsed bindings for testing.
   * @visibleForTesting {!Array<BindingDef>}
   */
  bindingsForTesting() {
    return this.bindings_;
  }

  /**
   * Returns the expression result string for a binding to `property`.
   * @param {./bind-expression.BindExpressionResultDef} result
   * @return {?string}
   * @private
   */
  stringValueOf_(property, result) {
    if (result === null) {
      return null;
    }
    switch (property) {
      case 'text':
        break;
      case 'class':
        if (Array.isArray(result)) {
          return result.join(' ');
        }
        break;
      default:
        if (typeof result === 'boolean') {
          return result ? '' : null;
        }
        break;
    }
    return String(result);
  }
}
