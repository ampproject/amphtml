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

import {Services} from '../../../src/services';
import {
  closestAncestorElementBySelector,
  removeElement,
} from '../../../src/dom';
import {dev, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {listen} from '../../../src/event-helper';
import {removeFragment} from '../../../src/url';
import {startsWith} from '../../../src/string';
import {toggle} from '../../../src/style';
import {urls} from '../../../src/config';

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

    /** @visibleForTesting {?UrlRewriter_}  */
    this.urlRewriter_ = null;

    /** @private @const {boolean}*/
    this.isSafari_ = Services.platformFor(this.win).isSafari();
  }

  /** @override */
  buildCallback() {
    const {win} = this;
    if (!('serviceWorker' in win.navigator)) {
      this.maybeInstallUrlRewrite_();
      return;
    }
    const urlService = this.getUrlService_();
    const src = this.element.getAttribute('src');
    urlService.assertHttpsUrl(src, this.element);

    if (
      (urlService.isProxyOrigin(src) ||
        urlService.isProxyOrigin(win.location.href)) &&
      !this.isSafari_
    ) {
      const iframeSrc = this.element.getAttribute('data-iframe-src');
      if (iframeSrc) {
        urlService.assertHttpsUrl(iframeSrc, this.element);
        const {origin} = urlService.parse(iframeSrc);
        const docInfo = Services.documentInfoForDoc(this.element);
        const sourceUrl = urlService.parse(docInfo.sourceUrl);
        const canonicalUrl = urlService.parse(docInfo.canonicalUrl);
        userAssert(
          origin == sourceUrl.origin || origin == canonicalUrl.origin,
          'data-iframe-src (%s) should be a URL on the same origin as the ' +
            'source (%s) or canonical URL (%s) of the AMP-document.',
          origin,
          sourceUrl.origin,
          canonicalUrl.origin
        );
        this.iframeSrc_ = iframeSrc;
        this.whenLoadedAndVisiblePromise_().then(() => {
          return this.insertIframe_();
        });
      }
    } else if (
      urlService.parse(win.location.href).origin == urlService.parse(src).origin
    ) {
      this.whenLoadedAndVisiblePromise_().then(() => {
        return install(this.win, src, this.element);
      });
    } else {
      this.user().error(
        TAG,
        'Did not install ServiceWorker because it does not ' +
          'match the current origin: ' +
          src
      );
    }

    if (
      (urlService.isProxyOrigin(src) ||
        urlService.isProxyOrigin(win.location.href)) &&
      this.isSafari_
    ) {
      // https://webkit.org/blog/8090/workers-at-your-service/
      this.user().error(
        TAG,
        'Did not install ServiceWorker because of safari double keyring ' +
          'caching as it will not have any effect'
      );
    }
  }

  /**
   * A promise that resolves when both loadPromise and whenFirstVisible resolve.
   * @return {!Promise}
   * @private
   */
  whenLoadedAndVisiblePromise_() {
    return Promise.all([
      this.loadPromise(this.win),
      Services.viewerForDoc(this.getAmpDoc()).whenFirstVisible(),
    ]);
  }

  /**
   * Insert an iframe from the origin domain to install the service worker.
   * @return {!Promise}
   * @private
   */
  insertIframe_() {
    return this.mutateElement(() => {
      toggle(this.element, false);
      const iframe = this.win.document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
      iframe.src = this.iframeSrc_;
      this.element.appendChild(iframe);
    });
  }

  /** @private */
  maybeInstallUrlRewrite_() {
    // Only run rewrite in single-doc environment.
    if (!this.getAmpDoc().isSingleDoc()) {
      return;
    }

    const ampdoc = this.getAmpDoc();
    const {win} = this;
    const urlService = this.getUrlService_();
    const winUrl = urlService.parse(win.location.href);

    // Read the url-rewrite config.
    const urlMatch = this.element.getAttribute(
      'data-no-service-worker-fallback-url-match'
    );
    let shellUrl = this.element.getAttribute(
      'data-no-service-worker-fallback-shell-url'
    );
    if (!urlMatch && !shellUrl) {
      return;
    }

    // Check the url-rewrite config is valid.
    userAssert(
      urlMatch && shellUrl,
      'Both, "%s" and "%s" must be specified for url-rewrite',
      'data-no-service-worker-fallback-url-match',
      'data-no-service-worker-fallback-shell-url'
    );
    shellUrl = removeFragment(shellUrl);
    let urlMatchExpr;
    try {
      urlMatchExpr = new RegExp(urlMatch);
    } catch (e) {
      throw user().createError(
        'Invalid "data-no-service-worker-fallback-url-match" expression',
        e
      );
    }
    userAssert(
      urlService.getSourceOrigin(winUrl) == urlService.parse(shellUrl).origin,
      'Shell source origin "%s" must be the same as source origin "%s"',
      shellUrl,
      winUrl.href
    );

    // Install URL rewriter.
    this.urlRewriter_ = new UrlRewriter_(
      ampdoc,
      urlMatchExpr,
      shellUrl,
      this.element
    );

    // Cache shell.
    if (urlService.isSecure(shellUrl)) {
      this.waitToPreloadShell_(shellUrl);
    }
  }

  /**
   * @param {string} shellUrl
   * @return {!Promise}
   * @private
   */
  waitToPreloadShell_(shellUrl) {
    return this.whenLoadedAndVisiblePromise_().then(() => {
      this.mutateElement(() => this.preloadShell_(shellUrl));
    });
  }

  /**
   * @param {string} shellUrl
   * @private
   */
  preloadShell_(shellUrl) {
    const {win} = this;

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

  /**
   * @return {!../../../src/service/url-impl.Url}
   * @private
   */
  getUrlService_() {
    return Services.urlForDoc(this.element);
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
   * @param {!Element} element
   */
  constructor(ampdoc, urlMatchExpr, shellUrl, element) {
    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @const @private {!RegExp} */
    this.urlMatchExpr_ = urlMatchExpr;

    /** @const @private {string} */
    this.shellUrl_ = shellUrl;

    /** @private @const {!../../../src/service/url-impl.Url} */
    this.urlService_ = Services.urlForDoc(element);

    /** @const @private {!Location} */
    this.shellLoc_ = this.urlService_.parse(shellUrl);

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
    const target = closestAncestorElementBySelector(
      dev().assertElement(event.target),
      'A'
    );
    if (!target || !target.href) {
      return;
    }

    // Check the URL matches the mask and doesn't match shell itself.
    const tgtLoc = this.urlService_.parse(target.href);
    if (
      tgtLoc.origin != this.shellLoc_.origin ||
      tgtLoc.pathname == this.shellLoc_.pathname ||
      !this.urlMatchExpr_.test(tgtLoc.href)
    ) {
      return;
    }

    // Check if this URL was already rewritten.
    if (target.getAttribute('i-amphtml-orig-href')) {
      return;
    }

    // Only rewrite URLs to a different location to avoid breaking fragment
    // navigation.
    const {win} = this;
    if (removeFragment(tgtLoc.href) == removeFragment(win.location.href)) {
      return;
    }

    // Rewrite URL.
    target.setAttribute('i-amphtml-orig-href', target.href);
    target.href =
      this.shellUrl_ +
      '#href=' +
      encodeURIComponent(`${tgtLoc.pathname}${tgtLoc.search}${tgtLoc.hash}`);
  }
}

/**
 * Installs the service worker at src via direct service worker installation.
 * @param {!Window} win
 * @param {string} src
 * @param {Element} element
 * @return {!Promise<!ServiceWorkerRegistration|undefined>}
 */
function install(win, src, element) {
  const options = {};
  if (element.hasAttribute('data-scope')) {
    options.scope = element.getAttribute('data-scope');
  }
  return win.navigator.serviceWorker.register(src, options).then(
    function(registration) {
      if (getMode().development) {
        user().info(
          TAG,
          'ServiceWorker registration successful with scope: ',
          registration.scope
        );
      }
      // Check if there is a new service worker installing.
      const installingSw = registration.installing;
      if (installingSw) {
        // if not already active, wait till it becomes active
        installingSw.addEventListener('statechange', evt => {
          if (evt.target.state === 'activated') {
            performServiceWorkerOptimizations(registration, win, element);
          }
        });
      } else if (registration.active) {
        performServiceWorkerOptimizations(registration, win, element);
      }

      return registration;
    },
    function(e) {
      user().error(TAG, 'ServiceWorker registration failed:', e);
    }
  );
}

/**
 * Initiates AMP service worker based optimizations
 * @param {ServiceWorkerRegistration} registration
 * @param {!Window} win
 * @param {Element} element
 */
function performServiceWorkerOptimizations(registration, win, element) {
  sendAmpScriptToSwOnFirstVisit(win, registration);
  // prefetching outgoing links should be opt in.
  if (element.hasAttribute('data-prefetch')) {
    prefetchOutgoingLinks(registration, win);
  }
}

/**
 * Whenever a new service worker is activated, controlled page will send
 * the used AMP scripts and the self's URL to service worker to be cached.
 * @param {!Window} win
 * @param {ServiceWorkerRegistration} registration
 */
function sendAmpScriptToSwOnFirstVisit(win, registration) {
  if ('performance' in win) {
    // Fetch all AMP-scripts used on the page
    const ampScriptsUsed = win.performance
      .getEntriesByType('resource')
      .filter(
        item =>
          item.initiatorType === 'script' && startsWith(item.name, urls.cdn)
      )
      .map(script => script.name);
    const activeSW = registration.active;
    // using convention from https://github.com/redux-utilities/flux-standard-action.
    if (activeSW.postMessage) {
      activeSW.postMessage(
        JSON.stringify(
          dict({
            'type': 'AMP__FIRST-VISIT-CACHING',
            'payload': ampScriptsUsed,
          })
        )
      );
    }
  }
}

/**
 * Whenever a new service worker is activated, controlled page will send
 * the used AMP scripts and the self's URL to service worker to be cached.
 * @param {ServiceWorkerRegistration} registration
 * @param {!Window} win
 */
function prefetchOutgoingLinks(registration, win) {
  const {document} = win;
  const links = [].map.call(
    document.querySelectorAll('a[data-rel=prefetch]'),
    link => link.href
  );
  if (supportsPrefetch(document)) {
    links.forEach(link => {
      const linkTag = document.createElement('link');
      linkTag.setAttribute('rel', 'prefetch');
      linkTag.setAttribute('href', link);
      document.head.appendChild(linkTag);
    });
  } else {
    const activeSW = registration.active;
    if (activeSW.postMessage) {
      activeSW.postMessage(
        JSON.stringify(
          dict({
            'type': 'AMP__LINK-PREFETCH',
            'payload': links,
          })
        )
      );
    }
  }
}

/**
 * Returns whether or not link rel=prefetch is supported.
 * @param {!Document} doc
 * @return {boolean}
 */
function supportsPrefetch(doc) {
  const fakeLink = doc.createElement('link');
  if (fakeLink.relList && fakeLink.relList.supports) {
    return fakeLink.relList.supports('prefetch');
  }
  return false;
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpInstallServiceWorker);
});
