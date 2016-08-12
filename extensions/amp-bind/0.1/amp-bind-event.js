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

// have this alias map for event name;
const eventAliasMap = {
  'tap': 'click',
};

export class AmpBindEvent extends AMP.BaseElement {
    /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    console.log('Hi, I am amp-bind-event buildCallback');

    /** @private @const {!Event} */
    this.event_ = this.element.getAttribute('on');

    /** @private @const {string} */
    this.variable_ = this.element.getAttribute('variable');

    /** @private @const {string} */
    this.value_ = this.element.getAttribute('value');

    /** @private @const {!BindService} */
    this.bindService_ = bindServiceForDoc(this.win.document.documentElement);

    /** @private @const {!Element} */
    this.parent_ = this.element.parentNode;

    /** @private @const {!Function} */
    this.eventListener_ = event => {
      this.bindService_.setVariable(this.variable_, this.value_);
    };

    // Check for event aliasName.
    if (eventAliasMap[this.event_]) {
      this.event_ = eventAliasMap[this.event_];
    }
    // register event listener function to parent.
    this.parent_.addEventListener(this.event_, this.eventListener_);
  }
};
