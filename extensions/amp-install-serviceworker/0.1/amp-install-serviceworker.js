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

import {Layout} from '../../../src/layout';
import {parseUrl, assertHttpsUrl} from '../../../src/url';
import {getMode} from '../../../src/mode';

/**
 * Implements custom element: <amp-install-serviceworker>
 * for installation of ServiceWorkers owned by the publisher
 * of the current page.
 */
class AmpServiceWorkerInstallation extends AMP.BaseElement {
  /** @override */
  buildCallback() {
    const win = this.getWin();
    if (!('serviceWorker' in win.navigator)) {
      return;
    }
    const src = this.element.getAttribute('src');
    assertHttpsUrl(src, this.element);

    if (originMatches(win.location.href, src)) {
      install(this.getWin(), src);
    } else {
      if (getMode().development) {
        console./* OK */warn(
            'Did not install ServiceWorker because it does not ' +
            'match the current origin: ' + src);
      }
    }
  }
}

/**
 * Returns true if the 2 hrefs are on the same origin.
 * @param {string} href1
 * @param {string} href2
 * return {boolean}
 */
function originMatches(href1, href2) {
  return parseUrl(href1).origin == parseUrl(href2).origin;
}

/**
 * Installs the service worker at src via direct service worker installation.
 * @param {!Window} win
 * @param {string} src
 */
function install(win, src) {
  win.navigator.serviceWorker.register(src).then(function(registration) {
    if (getMode().development) {
      console./*OK*/info('ServiceWorker registration successful with scope: ',
          registration.scope);
    }
  }).catch(function(e) {
    console./*OK*/error('ServiceWorker registration failed:', e);
  });
}

AMP.registerElement('amp-install-serviceworker',
    AmpServiceWorkerInstallation);
