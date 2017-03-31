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
 * Error-like object that can be passed through web worker boundary.
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
    this.expressions_ = Object.create(null);
  }

  /**
   * Parses and stores given bindings into expression objects and returns map
   * of expression string to parse errors.
   * @param {!Array<BindingDef>} bindings
   * @return {!Object<string, EvaluatorErrorDef>},
   */
  addBindings(bindings) {
    const errors = Object.create(null);
    // Create BindExpression objects from expression strings.
    bindings.forEach(binding => {
      const parsed = this.parse_(binding.expressionString);
      if (parsed.error) {
        errors[binding.expressionString] = parsed.error;
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

    expressionStrings.forEach(expressionString => {
      delete this.expressions_[expressionString];
      expressionsToRemove[expressionString] = true;
    });

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
    const cache = Object.create(null);
    /** @type {!Object<string, !EvaluatorErrorDef>} */
    const errors = Object.create(null);

    // First, evaluate all of the expression strings in the bindings.
    this.bindings_.forEach(binding => {
      const expressionString = binding.expressionString;
      // Skip if we've already evaluated this expression string.
      if (cache[expressionString] !== undefined || errors[expressionString]) {
        return;
      }
      const expression = this.expressions_[expressionString];
      if (!expression) {
        const error =
            new Error(`Expression "${expressionString}"" is not cached.`);
        errors[expressionString] = {message: error.message, stack: error.stack};
        return;
      }
      const {result, error} = this.evaluate_(expression, scope);
      if (error) {
        errors[expressionString] = error;
        return;
      }
      cache[expressionString] = result;
    });

    // Then, validate each binding and delete invalid expression results.
    this.bindings_.forEach(binding => {
      const {tagName, property, expressionString} = binding;
      const result = cache[expressionString];
      if (result === undefined) {
        return;
      }
      // IMPORTANT: We need to validate expression results on each binding
      // since validity depends on the `tagName` and `property` rather than
      // just the `result`.
      const resultString = this.stringValueOf_(property, result);
      if (!this.validator_.isResultValid(tagName, property, resultString)) {
        // TODO(choumx): If this expression string is used in another
        // tagName/property which is valid, we ought to allow it.
        delete cache[expressionString];
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
   *   error: ?EvaluatorErrorDef,
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
   *   error: ?EvaluatorErrorDef,
   * }}
   * @private
   */
  parse_(expressionString) {
    let expression = this.expressions_[expressionString];
    let error = null;
    if (!expression) {
      try {
        expression = new BindExpression(expressionString);
        this.expressions_[expressionString] = expression;
      } catch (e) {
        error = {message: e.message, stack: e.stack};
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
   *   error: ?EvaluatorErrorDef,
   * }}
   * @private
   */
  evaluate_(expression, scope) {
    let result = null;
    let error = null;
    try {
      result = expression.evaluate(scope);
    } catch (e) {
      error = {message: e.message, stack: e.stack};
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
   * Returns the expression cache for testing.
   * @return {!Object<string, !BindExpression>}
   * @visibleForTesting
   */
  expressionsForTesting() {
    return this.expressions_;
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
