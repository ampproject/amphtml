/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {ActionTrust} from '../../../src/action-constants';
import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-selector-1.0.css';
import {Services} from '../../../src/services';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {dispatchCustomEvent} from '../../../src/dom';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-selector';

class AmpSelector extends BaseElement {
  /** @override */
  init() {
    const props = super.init();

    // TODO(wg-bento): This hack is in place to prevent doubly rendering.
    // See https://github.com/ampproject/amp-react-prototype/issues/40.
    const action = Services.actionServiceForDoc(this.element);
    props['onChange'] = (e) => {
      fireSelectEvent(
        this.win,
        action,
        this.element,
        e['option'],
        e['value'],
        ActionTrust.HIGH
      );
      this.isExpectedMutation = true;
      this.mutateProps(dict({'value': e['value']}));
    };

    return props;
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-selector'),
      'expected global "bento" or specific "bento-selector" experiment to be enabled'
    );
    return true;
  }
}

/**
 * Triggers a 'select' event with two data params:
 * 'targetOption' - option value of the selected or deselected element.
 * 'selectedOptions' - array of option values of selected elements.
 *
 * @param {!Window} win
 * @param {!../../../src/service/action-impl.ActionService} action
 * @param {!Element} el The element that was selected or deslected.
 * @param {string} option
 * @param {Array<string>} value
 * @param {!ActionTrust} trust
 * @private
 */
function fireSelectEvent(win, action, el, option, value, trust) {
  const eventName = 'select';
  const data = dict({'targetOption': option, 'selectedOptions': value});
  const selectEvent = createCustomEvent(win, `amp-selector.${eventName}`, data);
  action.trigger(el, eventName, selectEvent, trust);
  dispatchCustomEvent(el, eventName, data);
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSelector, CSS);
});
