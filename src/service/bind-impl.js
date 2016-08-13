/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {fromClassForDoc} from '../service';
import * as ngExpressions from "angular-expressions";

export class BindService {
  constructor(ampdoc) {
    this.ampdoc = ampdoc;
    // Map<string, any>
    this.scope_ = {};
    this.expressions_ = {};
  }

  /**
   * Function that add customized jsonObj to the bindService data set.
   * @param {!Object} newData
   */
  addData(newData) {
    for (var key in newData) {
      this.scope_[key] = newData[key];
    }
  }

  /**
   * Function that set variable from val expression and event detail
   * @param {string} name
   * @param {string} valExp
   * @param {!Event} event
   */
  setVariable(name, valExp, event) {
    const eval = ngExpressions.compile(name);
    if (event) {
      this.scope_['ampEventData'] = event.detail;
    }
    const val = ngExpressions.compile(this.cleanExpression(valExp))(this.scope_);
    eval.assign(this.scope_, val);
    this.reEvaluate_();
    delete this.scope_['ampEventData'];
  }

  /**
   * Helper function that help extract unused character from expression string
   * @param {string} expStr
   */
  cleanExpression(expStr) {
    if (expStr.indexOf('{{') != 0) {
      expStr = "'" + expStr + "'";
    } else {
      expStr = expStr.replace('{{', '').replace('}}','');
    }
    return expStr;
  }

  /**
   * Function that register observer function to expression change.
   * @param {string} expStr
   * @param {!Function} observer
   */
  observeExpression(expStr, observer) {
    expStr = this.cleanExpression(expStr);
    if (this.expressions_[expStr]) {
      if (!this.expressions_[expStr].observers.contains(observer)) {
        this.expressions_[expStr].observers.push(observer);
      }
      return;
    }
    this.expressions_[expStr] = {
      compiledExpr: ngExpressions.compile(expStr),
      observers: [observer],
      prevVal: null
    };
  }

  /**
   * Function that evaluate all expression when val changed, and call their
   * corresponding observer function for them.
   * @private
   */
  reEvaluate_() {
    const all = Object.keys(this.expressions_);
    all.forEach((key) => {
      const exp = this.expressions_[key];
      const val = this.expressions_[key].compiledExpr(this.scope_);
      if (val === exp.prevVal) {
        return;
      }
      exp.observers.forEach(observer => {
        try {
          observer(val);
        } catch(e){}
      });
      exp.prevVal = val;
    });
  }
}

/**
 * Get bindService for the document
 * @param {!Document} ampdoc
 * @return {!BindService}
 */
export function installBindServiceForDoc(ampdoc) {
  return fromClassForDoc(ampdoc, 'bindService', BindService);
};
