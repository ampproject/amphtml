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
import {parseActionMap} from '../../../src/service/action-impl';
import {toggle} from '../../../src/style';
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
    toggle(this.element, /* opt_display */ false);
    this.actions_ = Services.actionServiceForDoc(this.element);
    this.element.setAttribute('aria-hidden', 'true');

    // Don't parse or fetch in prerender mode.
    Services.viewerForDoc(this.getAmpDoc())
        .whenFirstVisible().then(() => this.initialize_());
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
    const {element} = this;
    this.parseActionMap_(element);
  }

  /**
   * Parse the action set on the macro and register it with the action service.
   * This action is then referenced in the caller referencing the action macro.
   * @param {!Element} element
   */
  parseActionMap_(element) {
    const id = element.getAttribute('id');
    const action = element.getAttribute('action');
    // The action map constructed here is not the final action map used for
    // invocation but is merged with the action map parsed in action service
    // when the caller referencing the action macro is called. Reason being
    // that allow the callers to define event that triggers the action as
    // as well as allow the callers to omit arguments, defaulting to the
    // arguments defined in the macro. Also note the temporary placeholder for
    // the event name for the macro, 'action-macro-event', eventually replaced
    // with the proper event in the runtime call.
    const actionMap =
        parseActionMap(`action-macro-event:${action}`, element);
    this.actions_.addActionMacroDef(id, actionMap['action-macro-event'][0]);
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
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
