/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Provides a services to preconnect to a url to warm up the
 * connection before the real request can be made.
 */

import {getService} from './service';
import {parseUrl} from './url';
import {timer} from './timer';

class Preconnect {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Element} */
    this.head_ = win.document.head;
    /** @private @const {!Object<string, boolean>}  */
    this.origins_ = {};
    // Mark current origin as preconnected.
    this.origins_[parseUrl(win.location.href).origin] = true;
  }

  /**
   * Preconnects to a URL.
   * @param {string} url
   */
  url(url) {
    var origin = parseUrl(url).origin;
    if (this.origins_[origin]) {
      return;
    }
    this.origins_[origin] = true;
    var dns = document.createElement('link');
    dns.setAttribute('rel', 'dns-prefetch');
    dns.setAttribute('href', origin);
    var preconnect = document.createElement('link');
    preconnect.setAttribute('rel', 'preconnect');
    preconnect.setAttribute('href', origin);
    this.head_.appendChild(dns);
    this.head_.appendChild(preconnect);

    // Remove the tags eventually to free up memory.
    timer.delay(() => {
      this.head_.removeChild(dns);
      this.head_.removeChild(preconnect);
    }, 10000);
  }

  threePFrame() {
    this.url('https://3p.ampproject.net');
  }
}

/**
 * @param {!Window} window
 * @return {!Preconnect}
 */
export function preconnectFor(window) {
  return getService(window, 'preconnect', () => {
    return new Preconnect(window);
  });
};
