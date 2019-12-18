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
 * A single parsed Bind macro.
 */
export class BindMacro {
  /**
   * @param {!BindMacroDef} data
   * @param {!Object<string, !BindMacro>} referableMacros
   */
  constructor(data, referableMacros) {
    /** @const @private {!Array<string>} */
    this.argumentNames_ = data.argumentNames || [];

    /** @const @private {!BindExpression} */
    this.expression_ = new BindExpression(
      data.expressionString,
      referableMacros
    );
  }

  /**
   * @param {!JsonObject} scope
   * @param {!Array} args
   * @throws {Error} On illegal function invocation.
   * @return {BindExpressionResultDef}
   */
  evaluate(scope, args) {
    const copy = /** @type {!JsonObject} */ ({...scope});
    for (let i = 0; i < this.argumentNames_.length; i++) {
      copy[this.argumentNames_[i]] = args[i];
    }
    return this.expression_.evaluate(copy);
  }

  /**
   * @return {number}
   */
  getExpressionSize() {
    return this.expression_.expressionSize;
  }
}
