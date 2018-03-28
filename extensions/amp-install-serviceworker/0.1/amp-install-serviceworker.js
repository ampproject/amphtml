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

import {LayoutPriority} from '../../../src/layout';
import {Services} from '../../../src/services';
import {
  assertHttpsUrl,
  getSourceOrigin,
  isProxyOrigin,
  isSecureUrl,
  parseUrl,
  removeFragment,
} from '../../../src/url';
import {closestByTag, removeElement} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {listen} from '../../../src/event-helper';
import {setStyle} from '../../../src/style';
import {toggle} from '../../../src/style';

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

    /** @private {?UrlRewriter_}  */
    this.urlRewriter_ = null;
  }

  /** @override */
  buildCallback() {
    const win = this.win;
    if (!('serviceWorker' in win.navigator)) {
      this.maybeInstallUrlRewrite_();
      return;
    }
    const src = this.element.getAttribute('src');
    assertHttpsUrl(src, this.element);

    if (isProxyOrigin(src) || isProxyOrigin(win.location.href)) {
      const iframeSrc = this.element.getAttribute('data-iframe-src');
      if (iframeSrc) {
        assertHttpsUrl(iframeSrc, this.element);
        const origin = parseUrl(iframeSrc).origin;
        const docInfo = Services.documentInfoForDoc(this.element);
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
        return install(this.win, src);
      });
    } else {
      this.user().error(TAG,
          'Did not install ServiceWorker because it does not ' +
          'match the current origin: ' + src);
    }
  }

  /** @private */
  scheduleIframeLoad_() {
    Services.viewerForDoc(this.getAmpDoc()).whenFirstVisible().then(() => {
      // If the user is longer than 10 seconds on this page, load
      // the external iframe to install the ServiceWorker. The wait is
      // introduced to avoid installing SWs for content that the user
      // only engaged with superficially.
      Services.timerFor(this.win).delay(() => {
        this.mutateElement(this.insertIframe_.bind(this));
      }, 10000);
    });
  }

  /** @private */
  insertIframe_() {
    // If we are no longer visible, we will not do a SW registration on this
    // page view.
    if (!Services.viewerForDoc(this.getAmpDoc()).isVisible()) {
      return;
    }
    // The iframe will stil be loaded.
    setStyle(this.element, 'display', 'none');
    const iframe = this.win.document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    iframe.src = this.iframeSrc_;
    this.element.appendChild(iframe);
  }

  /** @private */
  maybeInstallUrlRewrite_() {
    // Only run rewrite in single-doc environment.
    if (!this.getAmpDoc().isSingleDoc()) {
      return;
    }

    const ampdoc = this.getAmpDoc();
    const win = this.win;
    const winUrl = parseUrl(win.location.href);

    // Read the url-rewrite config.
    const urlMatch = this.element.getAttribute(
        'data-no-service-worker-fallback-url-match');
    let shellUrl = this.element.getAttribute(
        'data-no-service-worker-fallback-shell-url');
    if (!urlMatch && !shellUrl) {
      return;
    }

    // Check the url-rewrite config is valid.
    user().assert(urlMatch && shellUrl,
        'Both, "%s" and "%s" must be specified for url-rewrite',
        'data-no-service-worker-fallback-url-match',
        'data-no-service-worker-fallback-shell-url');
    shellUrl = removeFragment(shellUrl);
    let urlMatchExpr;
    try {
      urlMatchExpr = new RegExp(urlMatch);
    } catch (e) {
      throw user().createError(
          'Invalid "data-no-service-worker-fallback-url-match" expression', e);
    }
    user().assert(getSourceOrigin(winUrl) == parseUrl(shellUrl).origin,
        'Shell source origin "%s" must be the same as source origin "%s"',
        shellUrl, winUrl.href);

    // Install URL rewriter.
    this.urlRewriter_ = new UrlRewriter_(ampdoc, urlMatchExpr, shellUrl);

    // Cache shell.
    if (isSecureUrl(shellUrl)) {
      this.waitToPreloadShell_(shellUrl);
    }
  }

  /**
   * @param {string} shellUrl
   * @return {!Promise}
   * @private
   */
  waitToPreloadShell_(shellUrl) {
    // Ensure that document is loaded and visible first.
    const whenReady = this.loadPromise(this.win);
    const whenVisible =
        Services.viewerForDoc(this.getAmpDoc()).whenFirstVisible();
    return Promise.all([whenReady, whenVisible]).then(() => {
      this.mutateElement(() => this.preloadShell_(shellUrl));
    });
  }

  /**
   * @param {string} shellUrl
   * @private
   */
  preloadShell_(shellUrl) {
    const win = this.win;

    // Preload the shell by via an iframe with `#preload` fragment.
    const iframe = win.document.createElement('iframe');
    iframe.id = 'i-amphtml-shell-preload';
    iframe.setAttribute('src', shellUrl + '#preload');

    // Make the iframe hidden.
    toggle(iframe, false);

    // Restrict what this iframe can do: not much beyond precaching the
    // resources. Unlike Chrome, Safari does not precan scripts w/o
    // `allow-scripts` sandbox.
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

    // Remove iframe once loaded.
    const loaded = this.loadPromise(iframe);
    loaded.then(() => {
      removeElement(iframe);
    });

    // Start the preload.
    this.element.appendChild(iframe);
  }
}


/**
 * URL Rewriter intercepts all navigations and, if within the parameters,
 * rewrites the URL to go via shell.
 */
class UrlRewriter_ {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!RegExp} urlMatchExpr
   * @param {string} shellUrl
   */
  constructor(ampdoc, urlMatchExpr, shellUrl) {
    /** @const {!Window} */
    this.win = ampdoc.win;
    /** @const @private {!RegExp} */
    this.urlMatchExpr_ = urlMatchExpr;
    /** @const @private {string} */
    this.shellUrl_ = shellUrl;

    /** @const @private {!Location} */
    this.shellLoc_ = parseUrl(shellUrl);

    listen(ampdoc.getRootNode(), 'click', this.handle_.bind(this));
  }

  /**
   * @param {?Event} event
   * @private
   */
  handle_(event) {
    // Check event and target.
    if (event.defaultPrevented) {
      return;
    }
    const target = closestByTag(dev().assertElement(event.target), 'A');
    if (!target || !target.href) {
      return;
    }

    // Check the URL matches the mask and doesn't match shell itself.
    const tgtLoc = parseUrl(target.href);
    if (tgtLoc.origin != this.shellLoc_.origin ||
            tgtLoc.pathname == this.shellLoc_.pathname ||
            !this.urlMatchExpr_.test(tgtLoc.href)) {
      return;
    }

    // Check if this URL was already rewritten.
    if (target.getAttribute('i-amphtml-orig-href')) {
      return;
    }

    // Only rewrite URLs to a different location to avoid breaking fragment
    // navigation.
    const win = this.win;
    if (removeFragment(tgtLoc.href) == removeFragment(win.location.href)) {
      return;
    }

    // Rewrite URL.
    target.setAttribute('i-amphtml-orig-href', target.href);
    target.href = this.shellUrl_ + '#href=' + encodeURIComponent(
        `${tgtLoc.pathname}${tgtLoc.search}${tgtLoc.hash}`);
  }
}


/**
 * Installs the service worker at src via direct service worker installation.
 * @param {!Window} win
 * @param {string} src
 * @return {!Promise<!ServiceWorkerRegistration|undefined>}
 */
function install(win, src) {
  return win.navigator.serviceWorker.register(src).then(function(registration) {
    if (getMode().development) {
      user().info(TAG, 'ServiceWorker registration successful with scope: ',
          registration.scope);
    }
    return registration;
  }, function(e) {
    user().error(TAG, 'ServiceWorker registration failed:', e);
  });
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpInstallServiceWorker);
});
