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
import {user} from '../../../src/log';

const TAG = 'AMP-BIND';

/**
 * @typedef {{
 *   tagName: string,
 *   property: string,
 *   expressionString: string,
 * }}
 */
export let EvaluateeDef;

/**
 * @typedef {{
 *   tagName: string,
 *   property: string,
 *   expression: !BindExpression,
 * }}
 */
let ParsedEvaluateeDef;

/**
 * Asynchronously evaluates a set of Bind expressions.
 */
export class BindEvaluator {
  /**
   * @param {!Array<EvaluateeDef>} evaluatees
   */
  constructor(evaluatees) {
    /** @const {!Array<ParsedEvaluateeDef>} */
    this.evaluatees_ = [];

    // TODO(choumx): Add expression result validation to this class.
    evaluatees.forEach(e => {
      let expression;
      try {
        expression = new BindExpression(e.expressionString);
      } catch (error) {
        user().error(TAG, 'Malformed expression:', error);
      }

      if (expression) {
        this.evaluatees_.push({
          tagName: e.tagName,
          property: e.property,
          expression,
        });
      }
    });
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
      const cache = {};
      this.evaluatees_.forEach(evaluatee => {
        const string = evaluatee.expression.expressionString;
        if (cache[string] === undefined) {
          try {
            cache[string] = evaluatee.expression.evaluate(scope);
          } catch (error) {
            user().error(TAG, error);
          }
        }
      });
      resolve(cache);
    });
  }
}
