/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {ActionTrust, DEFAULT_ACTION} from '#core/constants/action-constants';
import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-lightbox-gallery-1.0.css';
import {Services} from '#service';
import {createElementWithAttributes} from '#core/dom';
import {elementByTag} from '#core/dom/query';
import {isExperimentOn} from '#experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-lightbox-gallery';

/** @const {string} */
const DEFAULT_GALLERY_ID = 'amp-lightbox-gallery';

class AmpLightboxGallery extends BaseElement {
  /** @override */
  init() {
    this.registerApiAction(
      DEFAULT_ACTION,
      (api) => api./*OK*/ open(),
      ActionTrust.LOW
    );
    this.registerApiAction('open', (api) => api./*OK*/ open(), ActionTrust.LOW);
    return super.init();
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-lightbox-gallery'),
      'expected global "bento" or specific "bento-lightbox-gallery" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

/**
 * Tries to find an existing amp-lightbox-gallery, if there is none, it adds a
 * default one.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<undefined>}
 */
export function installLightboxGallery(ampdoc) {
  // Make sure to wait for the ampdoc to finish loading, see:
  // https://github.com/ampproject/amphtml/issues/19728#issuecomment-446033966
  return ampdoc
    .whenReady()
    .then(() => ampdoc.getBody())
    .then((body) => {
      const existingGallery = elementByTag(ampdoc.getRootNode(), TAG);
      if (!existingGallery) {
        const gallery = createElementWithAttributes(ampdoc.win.document, TAG, {
          'layout': 'nodisplay',
          'id': DEFAULT_GALLERY_ID,
        });
        body.appendChild(gallery);
        gallery.build();
      }
    });
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpLightboxGallery, CSS);
  Services.extensionsFor(AMP.win).addDocFactory(installLightboxGallery);
});
