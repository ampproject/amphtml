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

/**
 * Asynchronously evaluates a set of Bind expressions.
 */
export class BindEvaluator {
  /**
   * @param {!Array<string>} expressionStrings
   */
  constructor(expressionStrings) {
    /** @const {!Array<!BindExpression>} */
    this.expressions_ = [];
    for (let i = 0; i < expressionStrings.length; i++) {
      this.expressions_[i] = new BindExpression(expressionStrings[i]);
    }
  }

  /**
   * Evaluates all expressions with the given `scope` data and resolves
   * the returned Promise with the results.
   * @param {!Object} scope
   * @return {!Promise<!Object<string,*>>} Maps expression strings to results.
   */
  evaluate(scope) {
    return new Promise(resolve => {
      /** @type {!Object<string,*>} */
      const cache = {};
      this.expressions_.forEach(expression => {
        const string = expression.expressionString;
        if (cache[string] === undefined) {
          cache[string] = expression.evaluate(scope);
        }
      });
      resolve(cache);
    });
  }
}
