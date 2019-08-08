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
import {getWinOrigin} from '../../../src/url';
import {listen} from '../../../src/event-helper';

/**
 * Solves both Chrome and Safari problems with standalone mode.
 */
export class StandaloneService {
  /**
   *
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    this.ampdoc_ = ampdoc;
  }

  /**
   * @param {!AmpElement} ampdoc
   */
  initialize(ampdoc) {
    const platformService = Services.platformFor(ampdoc.win);

    if (platformService.isSafari()) {
      this.initializeSafariPlatform_();
    }

    if (platformService.isChrome()) {
      this.initializeChromePlatform();
    }
  }

  /**
   * If Chrome
   * Find all links and add target=_blank to links to external pages
   * Monitor the page for new elements and do the above
   */
  initializeChromePlatform() {
    listen(this.ampdoc_.getRootNode(), 'click', event => {
      const a = event.target;
      const {tagName, origin, target} = a;

      if (tagName !== 'A') {
        return;
      }

      if (target === '_blank') {
        return;
      }

      if (getWinOrigin(this.ampdoc_.win) === origin) {
        return;
      }

      a.target = '_blank';
    });
  }

  /**
   * If Safari
   * Use window.location.href to change non-blank URLs.
   */
  initializeSafariPlatform_() {
    listen(this.ampdoc_.getRootNode(), 'click', event => {
      const {tagName, href, target} = event.target;
      if (tagName !== 'A') {
        return;
      }

      if (target === '_blank') {
        return;
      }

      if (getWinOrigin(this.ampdoc_.win) !== origin) {
        return;
      }

      top.location.href = href;
      event.returnValue = false;
    });
  }
}

AMP.extension('amp-standalone', '0.1', AMP => {
  AMP.registerServiceForDoc('standalone', StandaloneService);
});
