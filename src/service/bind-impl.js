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

  addData(newData) {
    for (var key in newData) {
      this.scope_[key] = newData[key];
    }
  }

  setVariable(name, valExp) {
    const eval = ngExpressions.compile(name);
    const val = ngExpressions.compile(this.cleanExpression(valExp))(this.scope_);
    eval.assign(this.scope_, val);
    this.reEvaluate_();
  }

  cleanExpression(expStr) {
    if (expStr.indexOf('{{') != 0) {
      expStr = "'" + expStr + "'";
    } else {
      expStr = expStr.replace('{{', '').replace('}}','');
    }
    return expStr;
  }
  observeExpression(expStr, observer) {
    expStr = this.cleanExpression(expStr);
    if (this.expressions_[expStr]) {
      return;
    }
    this.expressions_[expStr] = {
      compiledExpr: ngExpressions.compile(expStr),
      observer: observer,
      prevVal: null
    };
  }

  reEvaluate_() {
    const all = Object.keys(this.expressions_);
    all.forEach((key) => {
      const exp = this.expressions_[key];
      const val = this.expressions_[key].compiledExpr(this.scope_);
      if (val == exp.prevVal) {
        return;
      }
      exp.observer(val);
      exp.prevVal = val;
    });
  }
}

export function installBindServiceForDoc(ampdoc) {
  return fromClassForDoc(ampdoc, 'bindService', BindService);
};
