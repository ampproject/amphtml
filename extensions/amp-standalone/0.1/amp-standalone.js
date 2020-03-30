/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {getWinOrigin} from '../../../src/url';
import {listen} from '../../../src/event-helper';

/**
 * Safari and Chrome PWAs have undesirable behaviors in standalone mode,
 * i.e. with Add to homescreen. When pages link to other documents on the
 * local domain or to an external domain they may open in a way that prevents
 * the user from navigating normally.
 */
export class StandaloneService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const */
    this.ampdoc_ = ampdoc;
  }

  /**
   * @return {!../../../src/service/platform-impl.Platform}
   * @private visibleForTesting
   */
  getPlatform_() {
    return Services.platformFor(this.ampdoc_.win);
  }

  /**
   * Add an event listener to change the link navigation behavior.
   */
  initialize() {
    listen(this.ampdoc_.getRootNode(), 'click', (event) =>
      this.handleClick_(event)
    );
  }

  /**
   * Handle the click event
   * @param {!Event} event
   * @return {boolean|undefined}
   */
  handleClick_(event) {
    const {target} = event;
    if (target.tagName !== 'A') {
      return;
    }

    const platform = this.getPlatform_();
    if (platform.isSafari()) {
      return (event.returnValue = this.handleSafariStandalone_(
        dev().assertElement(target)
      ));
    }
    if (platform.isChrome()) {
      this.handleChromeStandalone_(dev().assertElement(target));
    }
  }

  /**
   * Force Chrome PWAs to load external domain documents in a new tab.
   * This prevents users from getting stuck on a page without a way to
   * navigate back to the original app.
   * @param {!Element} a
   */
  handleChromeStandalone_(a) {
    const {target, origin} = a;
    if (target === '_blank') {
      return;
    }

    if (getWinOrigin(this.ampdoc_.win) === origin) {
      return;
    }

    a.target = '_blank';
  }

  /**
   * Force iOS PWAs to load internal domain documents in the original tab.
   * By default, iOS PWAs will load all links in the Safari app with the
   * "new tab" UX.
   * @param {!Element} a
   * @return {boolean}
   */
  handleSafariStandalone_(a) {
    const {target, href, origin} = a;
    if (target === '_blank') {
      return true; // Allow the link navigate to proceed normally
    }

    if (getWinOrigin(this.ampdoc_.win) !== origin) {
      return true; // Allow the link navigate to proceed normally
    }

    this.ampdoc_.win.location.href = href;

    // The href assignment will cause the navigation, so prevent the link
    // click from causing navigation.
    return false;
  }
}

AMP.extension('amp-standalone', '0.1', (AMP) => {
  AMP.registerServiceForDoc('standalone', StandaloneService);
});
