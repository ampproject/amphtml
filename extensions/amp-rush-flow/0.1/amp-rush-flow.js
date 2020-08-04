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

/** @const */
const TAG = 'amp-rush-flow';
const GLOBAL_CALLBACKS_PROPERTY = 'rushFlowAsyncCallbacks';

/**
 * @enum {string}
 * @private
 */
const MessageType = {
  loadingSucceed : 'loading-succeed',
  loadingFailed : 'loading-failed',
  hideComponent : 'hide-component',
  changeComponentStyle : 'change-component-style',
  getLocation : 'get-location',
  saveLocation : 'save-location',
}

import {isLayoutSizeDefined} from '../../../src/layout';
import {CSS} from '../../../build/amp-rush-flow-0.1.css';
import {userAssert} from '../../../src/log';

export class AmpRushFlow extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?number} */
    this.cid_ = 0;

    /** @private {?number} */
    this.componentWidth_ = 0;

    /** @private {?number} */
    this.componentHeight_ = 0;

    /** @private {?boolean} */
    this.preloader_ = false;
  }
  
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    console.log('Hello!')
    console.log(this.win)
    console.log(this.element)
    this.cid_ = userAssert(
      this.element.getAttribute('data-cid'),
      'The data-cid attribute is required for <amp-rush-flow> Post %s',
      this.element
    );
  }

  /** @override */
  layoutCallback() {
  }

}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpRushFlow, CSS);
});
