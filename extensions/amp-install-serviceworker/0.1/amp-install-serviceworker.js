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

import {assertHttpsUrl, isProxyOrigin, parseUrl} from '../../../src/url';
import {documentInfoForDoc} from '../../../src/document-info';
import {getMode} from '../../../src/mode';
import {timerFor} from '../../../src/timer';
import {user} from '../../../src/log';
import {viewerForDoc} from '../../../src/viewer';

/** @private @const {string} */
const TAG = 'amp-install-serviceworker';

/**
 * Implements custom element: <amp-install-serviceworker>
 * for installation of ServiceWorkers owned by the publisher
 * of the current page.
 */
export class AmpInstallServiceWorker extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string}  */
    this.iframeSrc_ = null;
  }
  /** @override */
  buildCallback() {
    const win = this.win;
    if (!('serviceWorker' in win.navigator)) {
      return;
    }
    const src = this.element.getAttribute('src');
    assertHttpsUrl(src, this.element);

    if (isProxyOrigin(src) || isProxyOrigin(win.location.href)) {
      const iframeSrc = this.element.getAttribute('data-iframe-src');
      if (iframeSrc) {
        assertHttpsUrl(iframeSrc, this.element);
        const origin = parseUrl(iframeSrc).origin;
        const docInfo = documentInfoForDoc(this.element);
        const sourceUrl = parseUrl(docInfo.sourceUrl);
        const canonicalUrl = parseUrl(docInfo.canonicalUrl);
        user().assert(
            origin == sourceUrl.origin ||
            origin == canonicalUrl.origin,
            'data-iframe-src (%s) should be a URL on the same origin as the ' +
            'source (%s) or canonical URL (%s) of the AMP-document.',
            origin, sourceUrl.origin, canonicalUrl.origin);
        this.iframeSrc_ = iframeSrc;
        this.scheduleIframeLoad_();
      }
      return;
    }

    if (parseUrl(win.location.href).origin == parseUrl(src).origin) {
      this.loadPromise(this.win).then(() => {
        install(this.win, src);
      });
    } else {
      user().error(TAG,
          'Did not install ServiceWorker because it does not ' +
          'match the current origin: ' + src);
    }
  }

  /** @private */
  scheduleIframeLoad_() {
    viewerForDoc(this.getAmpDoc()).whenFirstVisible().then(() => {
      // If the user is longer than 20 seconds on this page, load
      // the external iframe to install the ServiceWorker. The wait is
      // introduced to avoid installing SWs for content that the user
      // only engaged with superficially.
      timerFor(this.win).delay(() => {
        this.deferMutate(this.insertIframe_.bind(this));
      }, 20000);
    });
  }

  /** @private */
  insertIframe_() {
    // If we are no longer visible, we will not do a SW registration on this
    // page view.
    if (!viewerForDoc(this.getAmpDoc()).isVisible()) {
      return;
    }
    // The iframe will stil be loaded.
    this.element.style.display = 'none';
    const iframe = /*OK*/document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    iframe.src = this.iframeSrc_;
    this.element.appendChild(iframe);
  }
}

/**
 * Installs the service worker at src via direct service worker installation.
 * @param {!Window} win
 * @param {string} src
 */
function install(win, src) {
  win.navigator.serviceWorker.register(src).then(function(registration) {
    if (getMode().development) {
      user().info(TAG, 'ServiceWorker registration successful with scope: ',
          registration.scope);
    }
  }).catch(function(e) {
    user().error(TAG, 'ServiceWorker registration failed:', e);
  });
}

AMP.registerElement('amp-install-serviceworker',
    AmpInstallServiceWorker);
