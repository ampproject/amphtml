/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../src/services';
import {createElementWithAttributes, removeElement} from '../../../src/dom';
import {toWin} from '../../../src/types';

/** @private @const {string} */
const TOAST_CLASSNAME = 'i-amphtml-story-toast';

/**
 * Should be higher than total animation time.
 * @private @const {number}
 */
const TOAST_VISIBLE_TIME_MS = 2600;

/**
 * UI notifications service, displaying a message to the user for a limited
 * amount of time.
 */
export class Toast {
  /**
   * @param {!Element} storyEl
   * @param {!Node|string} childNodeOrText
   */
  static show(storyEl, childNodeOrText) {
    const win = toWin(storyEl.ownerDocument.defaultView);

    const toast = createElementWithAttributes(
      win.document,
      'div',
      /** @type {!JsonObject} */ ({'class': TOAST_CLASSNAME})
    );

    if (typeof childNodeOrText == 'string') {
      toast.textContent = childNodeOrText;
    } else {
      toast.appendChild(childNodeOrText);
    }

    storyEl.appendChild(toast);

    Services.timerFor(win).delay(
      () => removeElement(toast),
      TOAST_VISIBLE_TIME_MS
    );
  }
}
