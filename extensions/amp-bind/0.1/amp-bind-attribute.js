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

import {Layout} from '../../../src/layout';
import {bindServiceForDoc} from '../../../src/bind-service';

export class AmpBindAttribute extends AMP.BaseElement {
    /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    console.log('Hi, I am amp-bind-attribute buildCallback');
    this.bindService_ = bindServiceForDoc(this.win.document.documentElement);

    const attrName = this.element.getAttribute('attr');

    const valueExpr = this.element.getAttribute('value');
    if (valueExpr) {
      this.bindService_.observeExpression(valueExpr, newValue => {
        const parent = this.element.parentNode;
        if (!parent) {
          return;
        }
        //TODO: need to convert attrName to function.
        //e.g. slide-number to slideNumber.
        parent.setAttribute(attrName, newValue);
        const observer = parent.implementation_[attrName + 'Changed'];
        if (typeof observer == 'function') {
          try {
            observer.call(parent.implementation_, newValue);
          } catch(e) {}
        }
      });
    }

    const toggleExp = this.element.getAttribute('toggle');
    if (toggleExp) {
      this.bindService_.observeExpression(toggleExp, boolResult => {
        const parent = this.element.parentNode;
        if (!parent) {
          return;
        }
        if (boolResult) {
          parent.setAttribute(attrName, '');
        } else {
          parent.removeAttribute(attrName);
        }
      });
    }

  }
};
