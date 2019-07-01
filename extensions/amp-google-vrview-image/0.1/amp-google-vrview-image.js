/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {addParamToUrl, assertHttpsUrl} from '../../../src/url';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {userAssert} from '../../../src/log';

/** @const */
const TAG = 'amp-google-vrview-image';

class AmpGoogleVrviewImage extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.imageSrc_ = '';

    /** @private {string} */
    this.src_ = '';
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    userAssert(
      isExperimentOn(this.win, 'amp-google-vrview-image'),
      'TAG amp-google-vrview-image disabled'
    );

    this.imageSrc_ = assertHttpsUrl(
      this.element.getAttribute('src'),
      this.element
    );
    // TODO(dvoytenko): Consider recompiling and hosting viewer on the
    // cdn.ampproject.org as an iframe viewer or even possibly compiling
    // it as an AMP element.
    let src = 'https://storage.googleapis.com/vrview/2.0/index.html';
    src = addParamToUrl(src, 'image', this.imageSrc_);
    if (this.element.hasAttribute('stereo')) {
      src = addParamToUrl(src, 'is_stereo', 'true');
    }
    const yaw = this.element.getAttribute('yaw');
    if (yaw) {
      src = addParamToUrl(src, 'start_yaw', yaw);
    }
    if (this.element.hasAttribute('yaw-only')) {
      src = addParamToUrl(src, 'is_yaw_only', 'true');
    }
    this.src_ = src;
  }

  /** @override */
  preconnectCallback() {
    if (this.src_) {
      this.preconnect.preload(this.src_);
      this.preconnect.preload(this.imageSrc_);
    }
  }

  /** @override */
  createPlaceholderCallback() {
    // TODO(dvoytenko): Add a placeholder by downloading the target image
    // and aligning it based on the specified yaw and mono/stereo.
    return null;
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.onload = () => {
      // Chrome does not reflect the iframe readystate.
      iframe.readyState = 'complete';
    };
    this.applyFillContent(iframe);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('src', this.src_);
    this.element.appendChild(iframe);
    return this.loadPromise(iframe);
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpGoogleVrviewImage);
});
