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
   * @param {!Object} scope
   * @return {!Promise<{!Object<string,*}>}
   */
  evaluate(scope) {
    return new Promise((resolve, reject) => {
      /** @type {!Object<string,*>} */
      const output = {};
      this.expressions_.forEach(expression => {
        const string = expression.expressionString;
        if (output[string] === undefined) {
          output[string] = expression.evaluate(scope);
        }
      });
      resolve(output);
    });
  }
}