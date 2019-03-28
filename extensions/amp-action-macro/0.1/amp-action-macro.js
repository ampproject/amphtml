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
import {dev, userAssert} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';

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

    /** @private {?../../../extensions/amp-bind/0.1/bind-impl.Bind} */
    this.bind_ = null;

    /** @private {!Array<string>} */
    this.arguments_ = [];
  }

  /** @override */
  buildCallback() {
    userAssert(isExperimentOn(this.win, 'amp-action-macro'),
        'Experiment is off');
    const {element} = this;
    this.actions_ = Services.actionServiceForDoc(element);
    if (element.hasAttribute('conditional-exp')) {
      Services.bindForDocOrNull(element).then(bind => {
        if (!bind) {
          return;
        }
        this.bind_ = bind;
      });
    }
    const argVarNames = element.getAttribute('arguments');
    if (argVarNames) {
      this.arguments_ = argVarNames.split(',').map(s => s.trim());
    }

    this.registerAction('execute', this.execute_.bind(this));
  }

  /** @override */
  getLayoutPriority() {
    // Loads after other content.
    return LayoutPriority.METADATA;
  }

  /**
   * Invoke the action defined on the macro.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  execute_(invocation) {
    const {actionEventType, args, event, trust} = invocation;
    this.validateExecute_(invocation, args);
    const conditionalInvocationExp_ =
        this.element.getAttribute('conditional-exp');
    // If the action is gated by a conditional, then evaluate that condition to
    // check if it can be executed.
    if (this.bind_ && conditionalInvocationExp_) {
      this.bind_.evaluateExpression(
          conditionalInvocationExp_, /** @type {!JsonObject} */ ({}))
          .then(canExecute => {
            if (!!canExecute) {
              this.actions_.trigger(
                  this.element, `${actionEventType}`, event, trust, args);
            } else {
              dev().info(
                  TAG, 'action did not execute because conditional did not '
                      + ' evaluate to true: %s', this.element);
            }
          });
    } else {
      // Otherwise just trigger the macro's action.
      this.actions_.trigger(
          this.element, `${actionEventType}`, event, trust, args);
    }
  }

  /**
   * Verifies that the action macro can be executed.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @param {?JsonObject=} args
   * @private
   */
  validateExecute_(invocation, args) {
    if (args && this.arguments_.length > 0) {
      // Verify that the argument variable names defined on the macro are used
      // in the caller invocation.
      for (const arg in args) {
        userAssert(this.arguments_.includes(arg),
            'Variable argument name "%s" is not defined in %s',
            arg, this.element);
      }
    }
    const conditionalInvocationExp_ =
        this.element.getAttribute('conditional-exp');
    if (conditionalInvocationExp_) {
      userAssert(conditionalInvocationExp_.trim() != '',
          'Action macro condition must be set: %s', this.element);
    }
    if (invocation.caller.tagName.toLowerCase() === TAG) {
      userAssert(this.isValidMacroReference_(
          invocation.caller),
      'Action macro with ID "%s" cannot reference itself or macros defined '
          + 'after it', this.element.getAttribute('id'));
    }
  }

  /** @override */
  renderOutsideViewport() {
    // We want the macro to be available wherever it is in the document.
    return true;
  }

  /**
   * Checks if the invoking element is defined after the action being invoked.
   * This constraint is to prevent possible recursive calls.
   * @param {!Element} invokingElement
   * @return {boolean}
   * @private
   */
  isValidMacroReference_(invokingElement) {
    return !!(this.element.compareDocumentPosition(invokingElement)
        & Node.DOCUMENT_POSITION_FOLLOWING);
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpActionMacro);
});
