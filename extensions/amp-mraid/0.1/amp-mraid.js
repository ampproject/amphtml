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
 * <script async host-api="amp-mraid"
 *  fallback-on="load incomplete"></script>
 * </code>
 *
 */

import {HostServices} from '../../../src/inabox/host-services';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {MraidService} from './mraid-service';

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
 * Loads mraid.js if available, and once it's loaded looks good, configures an
 * MraidService to handle visibility, fullscreen, and exit.
 */
export class MraidInitializer {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Array<string>} */
    this.fallbackOn_ = [];

    /** @private {boolean} */
    this.registeredWithHostServices_ = false;

    /** @private */
    this.mraid_ = null;

    const ampMraidScripts = document.querySelectorAll('script[host-api="amp-mraid"]');
    if (ampMraidScripts.length > 1) {
      dev().error(TAG, 'Multiple amp-mraid scripts.');
      return;
    } else if (ampMraidScripts.length < 1) {
      dev().error(TAG, 'Missing amp-mraid scripts.');
      return;
    }
    const element = ampMraidScripts[0];

    if (getMode().runtime !== 'inabox' && false /* TODO */) {
      dev().error(TAG, 'Only supported with Inabox');
      return;
    }

    this.fallbackOn_ = (element.getAttribute(FALLBACK_ON) || '').split(' ');
    for (const errorCode of this.fallbackOn_) {
      if (errorCode && !(errorCode in ErrorCodes)) {
        dev().error(TAG, `Unknown ${FALLBACK_ON} "${errorCode}"`);
        return;
      }
    }

    // It looks like we're initiating a network load for mraid from a relative
    // url, but this will actually be intercepted by the mobile app SDK and
    // handled locally.
    const mraidJs = document.createElement('script');
    mraidJs.setAttribute('type', 'text/javascript');
    mraidJs.setAttribute('src', 'mraid.js');
    mraidJs.addEventListener('load', () => {
      this.mraidLoadSuccess_()
    });
    mraidJs.addEventListener('error', () => {
      this.handleError_(ErrorCodes.load);
    });
    const head = document.getElementsByTagName('head').item(0);
    head.appendChild(mraidJs);
  }

  /**
   * @param {string} errorCode
   */
  handleError_(errorCode) {
    if (!this.registeredWithHostServices_ &&
        this.fallbackOn_.includes(errorCode)) {
      this.declineService_();
    }
    // TODO: send error ping
  }

  mraidReady_() {
    const mraidService = new MraidService(this.mraid_);

    HostServices.installVisibilityServiceForDoc(
        this.ampdoc_, () => mraidService);
    HostServices.installFullscreenServiceForDoc(
        this.ampdoc_, () => mraidService);
    HostServices.installExitServiceForDoc(
        this.ampdoc_, () => mraidService);

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
      mraid.addEventListener('ready', () => {
        this.mraidReady_()
      });
    } else {
      this.mraidReady_();
    }
  }

  declineService_() {
    // Needs API change
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerServiceForDoc(TAG, MraidInitializer);
});
