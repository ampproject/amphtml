/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {LayoutPriority} from '../../../src/layout';
import {Services} from '../../../src/services';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-action-macro';

/**
* The <amp-action-macro> element is used to define a reusable action.
*/
export class AmpActionMacro extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.actions_ = null;
  }

  /** @override */
  buildCallback() {
    userAssert(isExperimentOn(this.win, 'amp-action-macro'),
        'Experiment is off');
    this.actions_ = Services.actionServiceForDoc(this.element);

    this.initialize_();
  }

  /** @override */
  getLayoutPriority() {
    // Loads after other content.
    return LayoutPriority.METADATA;
  }

  /**
   * Initializes the amp-action-macro. An action invocation is constructed
   * here to be merged and used when the action macro is invoked on the
   * element that is referencing it.
   * @private
   */
  initialize_() {
    // const {element} = this;
    // this.addActionMacro_(element);
  }

  /**
   * Executes the action.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @override
   */
  executeAction(invocation, unusedDeferred) {
    const {element} = this;
    const args = element.getAttribute('arguments');
    let {method} = invocation;
    // If the default action has an alias, the handler will be stored under it.
    if (method === DEFAULT_ACTION) {
      method = this.defaultActionAlias_ || method;
    }
    this.initActionMap_();
    const holder = this.actionMap_[method];
    const {tagName} = this.element;
    userAssert(holder, `Method not found: ${method} in ${tagName}`);
    const {handler, minTrust} = holder;
    // Use the arguments provided by the caller and keep any defaults set on the macro.
    invocation.args = Object.assign(invocation.args, args);
    if (invocation.satisfiesTrust(minTrust)) {
      return handler(invocation);
    }
  }

  /** @override */
  renderOutsideViewport() {
    // We want the macro to be available wherever it is in the document.
    return true;
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpActionMacro);
});
