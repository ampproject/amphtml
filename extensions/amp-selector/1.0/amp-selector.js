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
import {isExperimentOn} from '../../../src/experiments';
import {toWin} from '../../../src/types';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-selector';

class AmpSelector extends BaseElement {
  /** @override */
  triggerEvent(element, eventName, detail) {
    // TODO(wg-bento): This hack is in place to prevent doubly rendering.
    // See https://github.com/ampproject/amp-react-prototype/issues/40.
    const event = createCustomEvent(
      toWin(element.ownerDocument.defaultView),
      `amp-selector.${eventName}`,
      detail
    );
    Services.actionServiceForDoc(element).trigger(
      element,
      eventName,
      event,
      ActionTrust.HIGH
    );

    super.triggerEvent(element, eventName, detail);
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

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSelector, CSS);
});
