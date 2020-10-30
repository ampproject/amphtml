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
import {Lightbox} from './lightbox';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {dict} from '../../../src/utils/object';

/** @const {string} */
const TAG = 'amp-lightbox';

class AmpLightbox extends PreactBaseElement {
  /** @override */
  init() {
    this.registerApiAction('open', (api) => api.open(), ActionTrust.DEFAULT);
    this.registerApiAction('close', (api) => api.close(), ActionTrust.DEFAULT);
    return dict({'initialOpen': false});
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
};

/** @override */
AmpLightbox['passthrough'] = true;

/** @override */
AmpLightbox['layoutSizeDefined'] = true;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpLightbox);
});
