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

/**
 * @fileoverview Connects AMP Host Services to MRAID to allow invoking native
 * APIs from mobile app ad webviews.
 *
 * Example:
 * <code>
 * <amp-mraid
 *   fallback-on="load incomplete"
 *   layout=nodisplay>
 * </amp-mraid>
 * </code>
 *
 */

import {Exit, Fullscreen, HostServices, Visible, VisibilityDataDef} from '../../../src/inabox/host-services';
import {Layout} from '../../../src/layout';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';

const TAG = 'amp-mraid';
const FALLBACK_ON = 'fallback-on';

/**
 * Error codes that can be macroed into the error ping url.
 * @const @enum {string}
 */
const ErrorCodes = {
  load: 'load',
  incomplete: 'incomplete',
}

/**
 * @implements {Visibility}
 * @implements {Fullscreen}
 * @implements {Exit}
 */
export class MraidService {
  constructor(mraid) {
    this.mraid_ = mraid;
    this.expanded_ = false;
  }

  /**
   * Register a callback for visibility change events.
   *
   * @param {function(!VisibilityDataDef)} callback
   */
  onVisibilityChange(callback) {
    // todo: impedance matching
    this.mraid_.addEventListener(
        'exposureChange',
        (exposedPercentage,
         visibileRectangle,
         occlusionRectangles) => {
           callback({visibleRect: visibileRectangle,
                     visibleRatio: exposedPercentage});
         });
  }

  /**
   * Request to expand the given element to fullscreen overlay.
   *
   * @param {!Element} targetElement
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  enterFullscreenOverlay(targetElement) {
    if (this.expanded_) return Promise.resolve(false);

    this.mraid_.expand();
    this.expanded_ = true;
    return Promise.resolve(true);
  }

  /**
   * Request to exit from fullscreen overlay.
   *
   * @param {!Element} targetElement
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  exitFullscreenOverlay(targetElement) {
    if (!this.expanded_) return Promise.resolve(false);

    this.mraid_.close();
    this.expanded_ = false;
    return Promise.resolve(true);
  }

  /**
   * Request to navigate to URL.
   *
   * @param {string} url
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  openUrl(url) {
    this.mraid_.open(url);
    return Promise.resolve(true);
  }
}

export class AmpMraid extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    console.log("amp-mraid constructor");

    /** @private {!Array<string>} */
    this.fallbackOn_ = [];

    /** @private {boolean} */
    this.registeredWithHostServices_ = false;

    /** @private */
    this.mraid_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /**
   * @param {string} errorCode
   */
  handleError_(errorCode) {
    if (!this.registeredWithHostServices_ &&
        this.fallbackOn_.includes(errorCode)) {
      this.declineService_();
    }
    // todo: send error ping
  }

  mraidReady_() {
    const mraidService = new MraidService(this.mraid_);

    HostServices.installVisibilityServiceForDoc(
        this.getAmpDoc(), () => mraidService);
    HostServices.installFullscreenServiceForDoc(
        this.getAmpDoc(), () => mraidService);
    HostServices.installExitServiceForDoc(
        this.getAmpDoc(), () => mraidService);

    this.registeredWithHostServices_ = true;
  }

  mraidLoadSuccess_() {
    const mraid = window['mraid'];
    if (!mraid || !mraid.getState || !mraid.addEventListener
        || !mraid.close || !mraid.open || !mraid.expand) {
      this.handleError_(ErrorCodes.incomplete);
      return;
    }
    this.mraid_ = mraid;
    if (mraid.getState() === 'loading') {
      mraid.addEventListener('ready', this.mraidReady_);
    } else {
      this.mraidReady_();
    }
  }

  declineService_() {
    // Needs API change
  }

  /** @override */
  buildCallback() {
    if (getMode(this.win).runtime !== 'inabox' && false /* TODO */) {
      dev().error(TAG, 'Only supported with Inabox');
      return;
    }

    this.fallbackOn_ = (this.element.getAttribute(FALLBACK_ON) || '').split(' ');
    for (const errorCode of this.fallbackOn_) {
      if (errorCode && !(errorCode in ErrorCodes)) {
        dev().error(TAG, `Unknown ${FALLBACK_ON} "${errorCode}"`);
        return;
      }
    }

    // It looks like we're initiating a network load for mraid from a relative
    // url, but this will actually be intercepted by the mobile app SDK and
    // handled locally.
    const mraid_js = document.createElement('script');
    mraid_js.setAttribute('type', 'text/javascript');
    mraid_js.setAttribute('src', 'mraid.js');
    mraid_js.addEventListener('load', () => {
      this.mraidLoadSuccess_()
    });
    mraid_js.addEventListener('error', () => {
      this.handleError_(ErrorCodes.load);
    });
    const head = document.getElementsByTagName('head').item(0);
    head.appendChild(mraid_js);
  }
}

AMP.registerElement(TAG, AmpMraid);
