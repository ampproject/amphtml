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
 *         src="https://cdn.ampproject.org/v0/amp-mraid-0.1.js"></script>
 * <code>
 *
 * By default, if amp-mraid determines its not running in a mobile app it falls
 * back to standard web APIs for determining visibility and collapse/expand.  If
 * you are sure you're serving to a mobile app and want to disable this
 * behavior, you can specify no-fallback:
 *
 * <code>
 * <script async host-service="amp-mraid" no-fallback
 *         src="https://cdn.ampproject.org/v0/amp-mraid-0.1.js"></script>
 * </code>
 *
 */

import {HostServices} from '../../../src/inabox/host-services';
import {MraidService} from './mraid-service';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {urls} from '../../../src/config'

const TAG = 'amp-mraid';
const NO_FALLBACK = 'no-fallback';

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
    this.fallback_ = true;

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
    if (element.getAttribute(NO_FALLBACK) != null) {
      this.fallback_ = false;
    }

    if (getMode().runtime !== 'inabox') {
      dev().fine(TAG, 'Only supported with Inabox');
      this.handleMismatch_();
      return;
    }

    // It looks like we're initiating a network load for mraid.js, but if we're
    // in a mobile app this will actually be intercepted by the mobile app SDK
    // and handled locally.
    //
    // In cases where this won't be intercepted by an SDK we don't want it to
    // suceed, so we intentionally use a URL that will 404.  This isn't
    // technically correct, since the MRAID spec says you must use a relative
    // URL reference, but the interception API that platforms provide only lets
    // them see post-resolution URLs.  Platforms just check if the URL ends with
    // "/mraid.js".
    //
    // We use cdn.ampproject.org so we can learn how often this happens from
    // server logs for 404s.
    const mraidJs = document.createElement('script');
    mraidJs.setAttribute('type', 'text/javascript');
    mraidJs.setAttribute('src', `${urls.cdn}/mraid.js`);
    mraidJs.addEventListener('load', () => {
      this.mraidLoadSuccess_();
    });
    mraidJs.addEventListener('error', () => {
      if (!this.registeredWithHostServices_) {
        this.handleMismatch_();
      }
    });
    const head = document.getElementsByTagName('head').item(0);
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
