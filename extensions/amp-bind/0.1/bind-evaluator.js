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
import {rewriteAttributeValue} from '../../../src/sanitizer';
import {user} from '../../../src/log';

const TAG = 'amp-bind';

/**
 * @typedef {{
 *   tagName: string,
 *   property: string,
 *   expressionString: string,
 * }}
 */
export let BindingDef;

/**
 * @typedef {{
 *   tagName: string,
 *   property: string,
 *   expression: !BindExpression,
 * }}
 */
let ParsedBindingDef;

/**
 * Asynchronously evaluates a set of Bind expressions.
 */
export class BindEvaluator {
  /**
   * @param {!Array<BindingDef>} bindings
   */
  constructor(bindings) {
    /** @const {!Array<ParsedBindingDef>} */
    this.parsedBindings_ = [];

    /** @const {!./bind-validator.BindValidator} */
    this.validator_ = new BindValidator();

    // Create BindExpression objects from expression strings.
    // TODO(choumx): Chunk creation of BindExpression or change to web worker.
    for (let i = 0; i < bindings.length; i++) {
      const e = bindings[i];

      let expression;
      try {
        expression = new BindExpression(e.expressionString);
      } catch (error) {
        user().error(TAG, 'Malformed expression:', error);
        continue;
      }

      this.parsedBindings_.push({
        tagName: e.tagName,
        property: e.property,
        expression,
      });
    }
  }

  /**
   * Evaluates all expressions with the given `scope` data and resolves
   * the returned Promise with a map of expression strings to results.
   * @param {!Object} scope
   * @return {
   *   !Promise<!Object<string, ./bind-expression.BindExpressionResultDef>>
   * }
   */
  evaluate(scope) {
    return new Promise(resolve => {
      /** @type {!Object<string, ./bind-expression.BindExpressionResultDef>} */
      const cache = {};
      /** @type {!Object<string, boolean>} */
      const invalid = {};

      this.parsedBindings_.forEach(binding => {
        const {tagName, property, expression} = binding;
        const expr = expression.expressionString;

        // Skip if we've already evaluated this expression string.
        if (cache[expr] !== undefined || invalid[expr]) {
          return;
        }

        let result;
        try {
          result = binding.expression.evaluate(scope);
        } catch (error) {
          user().error(TAG, error);
          return;
        }

        const resultString = this.stringValueOf_(property, result);
        if (this.validator_.isResultValid(tagName, property, resultString)) {
          // Rewrite URL attributes for CDN if necessary.
          cache[expr] = typeof result === 'string'
              ? rewriteAttributeValue(tagName, property, result)
              : result;
        } else {
          invalid[expr] = true;
        }
      });
      resolve(cache);
    });
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
