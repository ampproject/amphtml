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

import {ActionTrust, DEFAULT_ACTION} from '../../../src/action-constants';
import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-lightbox-1.0.css';
import {Services} from '../../../src/services';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {toWin} from '../../../src/types';
import {toggle} from '../../../src/style';
import {toggleAttribute} from '../../../src/dom';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-lightbox';

/** @extends {PreactBaseElement<LightboxDef.Api>} */
class AmpLightbox extends BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    console.error(1);
    super(element);

    /** @private {boolean} */
    this.open_ = false;
  }

  /** @override */
  init() {
    this.registerApiAction(
      DEFAULT_ACTION,
      (api) => api.open(),
      ActionTrust.LOW
    );
    this.registerApiAction('open', (api) => api.open(), ActionTrust.LOW);
    this.registerApiAction('close', (api) => api.close(), ActionTrust.LOW);
    return dict({
      'onBeforeOpen': this.toggle_.bind(this, true),
      'onAfterClose': this.toggle_.bind(this, false),
    });
  }

  /** @override */
  triggerEvent(element, eventName, detail) {
    const event = createCustomEvent(
      toWin(element.ownerDocument.defaultView),
      `amp-lightbox.${eventName}`,
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

  /**
   * Toggle open/closed attributes.
   * @param {boolean} opt_state
   */
  toggle_(opt_state) {
    this.open_ = toggleAttribute(this.element, 'open', opt_state);
    toggle(this.element, this.open_);
    this.triggerEvent(this.element, this.open_ ? 'open' : 'close');
  }

  /** @override */
  mutationObserverCallback() {
    const open = this.element.hasAttribute('open');
    if (open === this.open_) {
      return;
    }
    this.open_ = open;
    open ? this.api().open() : this.api().close();
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-lightbox'),
      'expected global "bento" or specific "bento-lightbox" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpLightbox, CSS);
});
