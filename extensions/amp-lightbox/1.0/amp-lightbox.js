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
import {CSS as COMPONENT_CSS} from './lightbox.jss';
import {CSS} from '../../../build/amp-lightbox-1.0.css';
import {Lightbox} from './lightbox';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {toggle} from '../../../src/style';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-lightbox';

/** @extends {PreactBaseElement<LightboxDef.Api>} */
class AmpLightbox extends PreactBaseElement {
  /** @override */
  init() {
    this.registerApiAction('open', (api) => api.open(), ActionTrust.LOW);
    this.registerApiAction('close', (api) => api.close(), ActionTrust.LOW);
    this.element.setAttribute('class', 'amp-lightbox');
    return dict({
      'initialOpen': false,
      'onBeforeOpen': this.beforeOpen_.bind(this),
      'onAfterClose': this.afterClose_.bind(this),
    });
  }

  /**
   * Setting hidden to false
   * @private
   */
  beforeOpen_() {
    toggle(this.element, true);
  }

  /**
   * Setting hidden to true
   * @private
   */
  afterClose_() {
    toggle(this.element, false);
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-lightbox-bento'),
      'expected amp-lightbox-bento experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

/** @override */
AmpLightbox['Component'] = Lightbox;

/** @override */
AmpLightbox['props'] = {
  'animateIn': {attr: 'animate-in'},
  'scrollable': {attr: 'scrollable', type: 'boolean'},
  'id': {attr: 'id'},
  'initialOpen': {attr: 'initial-open', type: 'boolean'},
  'closeButtonAriaLabel': {attr: 'data-close-button-aria-label'},
  'enableAnimation': {attr: 'enable-animation', type: 'boolean'},
};

/** @override */
AmpLightbox['passthrough'] = true;

/** @override */
AmpLightbox['layoutSizeDefined'] = true;

/** @override */
AmpLightbox['shadowCss'] = COMPONENT_CSS;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpLightbox, CSS);
});
