import {remove} from '#core/types/array';

import {BindExpression} from './bind-expression';
import {BindMacro} from './bind-macro';
import {BindValidator} from './bind-validator';

/**
 * Asynchronously evaluates a set of Bind expressions.
 */
export class BindEvaluator {
  /**
   * Creates an instance of BindEvaluator.
   * @param {boolean} allowUrlProperties
   */
  constructor(allowUrlProperties) {
    /** @const @private {!Array<!BindBindingDef>} */
    this.bindings_ = [];

    /**
     * Maps `id` to parsed BindMacro objects for all <amp-bind-macro> on page.
     * @private @const {!{[key: string]: !./bind-macro.BindMacro}}
     */
    this.macros_ = Object.create(null);

    /** @const @private {!./bind-validator.BindValidator} */
    this.validator_ = new BindValidator(allowUrlProperties);

    /** @const @private {!{[key: string]: !BindExpression}} */
    this.expressions_ = Object.create(null);
  }

  /**
   * Parses and stores given bindings into expression objects and returns map
   * of expression string to parse errors.
   * @param {!Array<!BindBindingDef>} bindings
   * @return {!{[key: string]: !BindEvaluatorErrorDef}},
   */
  addBindings(bindings) {
    const errors = Object.create(null);
    // Create BindExpression objects from expression strings.
    bindings.forEach((binding) => {
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

    expressionStrings.forEach((expressionString) => {
      delete this.expressions_[expressionString];
      expressionsToRemove[expressionString] = true;
    });

    remove(
      this.bindings_,
      (binding) => !!expressionsToRemove[binding.expressionString]
    );
  }

  /**
   * Parses and stores the given macros and returns map of macro `id` to
   * parse errors.
   * @param {!Array<!BindMacroDef>} macros
   * @return {!{[key: string]: !BindEvaluatorErrorDef}}
   */
  addMacros(macros) {
    const errors = [];
    // Create BindMacro objects from BindMacroDef.
    macros.forEach((macro, index) => {
      // Only allow a macro to reference macros defined before it to prevent
      // cycles and recursion.
      // TODO(willchou): Would be better if cycle/recursion errors are thrown
      // at creation instead of evaluation.
      const referableMacros = Object.assign(Object.create(null), this.macros_);
      try {
        this.macros_[macro.id] = new BindMacro(macro, referableMacros);
      } catch (e) {
        errors[index] = {message: e.message, stack: e.stack};
      }
    });
    return errors;
  }

  /**
   * Evaluates all expressions with the given `scope` data returns two maps:
   * expression strings to results and expression strings to errors.
   * @param {!JsonObject} scope
   * @return {!BindEvaluateBindingsResultDef}
   */
  evaluateBindings(scope) {
    /** @type {!{[key: string]: BindExpressionResultDef}} */
    const cache = Object.create(null);
    /** @type {!{[key: string]: !BindEvaluatorErrorDef}} */
    const errors = Object.create(null);

    this.setGlobals_(scope);

    // First, evaluate all of the expression strings in the bindings.
    this.bindings_.forEach((binding) => {
      const {expressionString} = binding;
      // Skip if we've already evaluated this expression string.
      if (cache[expressionString] !== undefined || errors[expressionString]) {
        return;
      }
      const expression = this.expressions_[expressionString];
      if (!expression) {
        const error = new Error(
          `Expression "${expressionString}"" is not cached.`
        );
        errors[expressionString] = {message: error.message, stack: error.stack};
        return;
      }
      const {error, result} = this.evaluate_(expression, scope);
      if (error) {
        errors[expressionString] = error;
        return;
      }
      cache[expressionString] = result;
    });

    // Then, validate each binding and delete invalid expression results.
    this.bindings_.forEach((binding) => {
      const {expressionString, property, tagName} = binding;
      const result = cache[expressionString];
      if (result === undefined) {
        return;
      }
      // Don't validate non-primitive expression results e.g. arrays, objects.
      if (result !== null && typeof result === 'object') {
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
        const error = new Error(
          `"${result}" is not a valid result for [${property}].`
        );
        errors[expressionString] = {message: error.message, stack: error.stack};
      }
    });

    return {results: cache, errors};
  }

  /**
   * Evaluates and returns a single expression string.
   * @param {string} expressionString
   * @param {!JsonObject} scope
   * @return {!BindEvaluateExpressionResultDef}
   */
  evaluateExpression(expressionString, scope) {
    const parsed = this.parse_(expressionString);
    if (!parsed.expression) {
      return {result: null, error: parsed.error};
    }
    this.setGlobals_(scope);
    const evaluated = this.evaluate_(parsed.expression, scope);
    if (!evaluated.result) {
      return {result: null, error: evaluated.error};
    }
    return {result: evaluated.result, error: null};
  }

  /**
   * Sets global references in scope if they're not already set or overriden.
   * @param {!JsonObject} scope
   */
  setGlobals_(scope) {
    if (!('global' in scope)) {
      scope['global'] = scope;
    }
  }

  /**
   * Parses a single expression string, caches and returns it.
   * @param {string} expressionString
   * @return {{expression: ?BindExpression, error: ?BindEvaluatorErrorDef}}
   * @private
   */
  parse_(expressionString) {
    let expression = this.expressions_[expressionString];
    let error = null;
    if (!expression) {
      try {
        expression = new BindExpression(expressionString, this.macros_);
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
   * @param {!JsonObject} scope
   * @return {{result: ?BindExpressionResultDef, error: ?BindEvaluatorErrorDef}}
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
   * @return {!Array<!BindBindingDef>}
   * @visibleForTesting
   */
  bindingsForTesting() {
    return this.bindings_;
  }

  /**
   * Returns the expression cache for testing.
   * @return {!{[key: string]: !BindExpression}}
   * @visibleForTesting
   */
  expressionsForTesting() {
    return this.expressions_;
  }

  /**
   * Returns the expression result string for a binding to `property`.
   * @param {string} property
   * @param {BindExpressionResultDef} result
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
