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
 * <script async host-service="amp-mraid"
 *         fallback-on="mismatch"></script>
 * </code>
 *
 */

import {HostServices} from '../../../src/inabox/host-services';
import {MraidService} from './mraid-service';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';

const TAG = 'amp-mraid';
const FALLBACK_ON = 'fallback-on';

/**
 * String representations of the HostServicesErrors that can be used in the
 * 'fallback-on' attribute.
 *
 * @const @enum {string}
 */
const FallbackErrorNames = {
  MISMATCH: 'mismatch',
};

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

    /** @private {boolean} */
    this.registeredWithHostServices_ = false;

    /** @private */
    this.mraid_ = null;

    /** @private {boolean} */
    this.fallback_ = false;

    if (getMode().runtime !== 'inabox') {
      dev().error(TAG, 'Only supported with Inabox');
      return;
    }

    const ampMraidScripts = this.ampdoc_.getHeadNode().querySelectorAll(
        'script[host-service="amp-mraid"]');
    if (ampMraidScripts.length > 1) {
      dev().error(TAG, 'Multiple amp-mraid scripts.');
      return;
    } else if (ampMraidScripts.length < 1) {
      dev().error(TAG, 'Missing amp-mraid scripts.');
      return;
    }
    const element = ampMraidScripts[0];
    const fallbackOn =
        (element.getAttribute(FALLBACK_ON) || '').split(' ');
    this.fallback_ = fallbackOn.includes(FallbackErrorNames.MISMATCH);

    // It looks like we're initiating a network load for mraid from a relative
    // url, but this will actually be intercepted by the mobile app SDK and
    // handled locally.  To be safe, first we inject an invalid base tag which
    // prevents any real relative loads.  This works because post-transformation
    // creatives won't have <base>, and so we're injecting the first <base> tag
    // on the page.
    const head = this.win.document.getElementsByTagName('head').item(0);

    const base = this.win.document.createElement('base');
    base.setAttribute('href', '//invalid.invalid');
    head.appendChild(base);

    const mraidJs = this.win.document.createElement('script');
    mraidJs.setAttribute('type', 'text/javascript');
    mraidJs.setAttribute('src', 'mraid.js');
    mraidJs.addEventListener('load', () => {
      this.mraidLoadSuccess_();
    });
    mraidJs.addEventListener('error', () => {
      if (!this.registeredWithHostServices_) {
        this.handleMismatch_();
      }
    });
    head.appendChild(mraidJs);
  }

  /**
   * Runs when MRAID reports that it is ready.
   */
  mraidReady_() {
    const mraidService = new MraidService(this.mraid_);

    if (this.mraid_.addEventListener) {
      HostServices.installVisibilityServiceForDoc(
          this.ampdoc_, () => mraidService);
    } else {
      HostServices.rejectVisibilityServiceForDoc(
          this.ampdoc_, {fallback: false});
    }

    if (this.mraid_.expand && this.mraid_.close) {
      HostServices.installFullscreenServiceForDoc(
          this.ampdoc_, () => mraidService);
    } else {
      HostServices.rejectFullscreenServiceForDoc(
          this.ampdoc_, {fallback: false});
    }

    if (this.mraid_.open) {
      HostServices.installExitServiceForDoc(
          this.ampdoc_, () => mraidService);
    } else {
      HostServices.rejectExitServiceForDoc(
          this.ampdoc_, {fallback: true}); // always fallback for exit service
    }
    this.registeredWithHostServices_ = true;
  }

  /**
   * Runs if mraid.js was loaded successfully.
   */
  mraidLoadSuccess_() {
    const mraid = window['mraid'];
    if (!mraid || !mraid.getState) {
      this.handleMismatch_();
      return;
    }
    this.mraid_ = mraid;
    if (mraid.getState() === 'loading') {
      mraid.addEventListener('ready', () => {
        this.mraidReady_();
      });
    } else {
      this.mraidReady_();
    }
  }

  /**
   * Called when we determine that MRAID isn't available.
   */
  handleMismatch_() {
    HostServices.rejectVisibilityServiceForDoc(
        this.ampdoc_, {fallback: this.fallback_});
    HostServices.rejectExitServiceForDoc(
        this.ampdoc_, {fallback: true}); // always fallback for exit service
    HostServices.rejectFullscreenServiceForDoc(
        this.ampdoc_, {fallback: this.fallback_});
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerServiceForDoc(TAG, MraidInitializer);
});
