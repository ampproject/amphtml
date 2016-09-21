/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

'use strict';

function log(args) {
  var var_args = Array.prototype.slice.call(arguments, 0);
  var_args.unshift('[SHELL]');
  console/*OK*/.log.apply(console, var_args);
}


class Shell {

  constructor(win) {
    /** @private @const {!Window} */
    this.win = win;

    /** @private @const {!AmpViewer} */
    this.ampViewer_ = new AmpViewer(win,
        win.document.getElementById('doc-container'));

    /** @private {string} */
    this.currentPage_ = win.location.pathname;

    win.addEventListener('popstate', this.handlePopState_.bind(this));
    win.document.documentElement.addEventListener('click',
        this.handleNavigate_.bind(this));

    log('Shell created');

    if (this.currentPage_) {
      this.navigateTo(this.currentPage_);
    }

    // Install service worker
    this.registerServiceWorker_();
  }

  registerServiceWorker_() {
    if ('serviceWorker' in navigator) {
      log('Register service worker');
      navigator.serviceWorker.register('/pwa/pwa-sw.js').then(reg => {
        log('Service worker registered: ', reg);
      }).catch(err => {
        log('Service worker registration failed: ', err);
      });
    }
  }

  unregisterServiceWorker_() {
    if ('serviceWorker' in navigator) {
      log('Register service worker');
      navigator.serviceWorker.getRegistration('/pwa/pwa-sw.js').then(reg => {
        log('Service worker found: ', reg);
        reg.unregister();
        log('Service worker unregistered');
      });
    }
  }

  /**
   */
  handleNavigate_(e) {
    if (e.defaultPrevented) {
      return false;
    }
    if (event.button) {
      return false;
    }
    let a = event.target;
    while (a) {
      if (a.tagName == 'A' && a.href) {
        break;
      }
      a = a.parentElement;
    }
    if (a) {
      const url = new URL(a.href);
      if (url.origin == this.win.location.origin &&
              url.pathname.indexOf('/pwa/') == 0 &&
              url.pathname.indexOf('amp.max.html') != -1) {
        e.preventDefault();
        const newPage = url.pathname;
        log('Internal link to: ', newPage);
        if (newPage != this.currentPage_) {
          this.navigateTo(newPage);
        }
      }
    }
  }

  /**
   */
  handlePopState_() {
    const newPage = this.win.location.pathname;
    log('Pop state: ', newPage, this.currentPage_);
    if (newPage != this.currentPage_) {
      this.navigateTo(newPage);
    }
  }

  /**
   * @param {string} path
   * @return {!Promise}
   */
  navigateTo(path) {
    log('Navigate to: ', path);
    const oldPage = this.currentPage_;
    this.currentPage_ = path;

    // Update URL.
    const push = !isShellUrl(path) && isShellUrl(oldPage);
    if (path != this.win.location.pathname) {
      if (push) {
        this.win.history.pushState(null, '', path);
      } else {
        this.win.history.replaceState(null, '', path);
      }
    }

    if (isShellUrl(path)) {
      log('Back to shell');
      this.ampViewer_.clear();
      return Promise.resolve();
    }

    // Fetch.
    const url = this.resolveUrl_(path);
    log('Fetch and render doc:', path, url);
    return fetchDocument(url).then(doc => {
      log('Fetch complete: ', doc);
      this.ampViewer_.show(doc, url);
    });
  }

  /**
   * @param {string} url
   * @return {string}
   */
  resolveUrl_(url) {
    if (!this.a_) {
      this.a_ = this.win.document.createElement('a');
    }
    this.a_.href = url;
    return this.a_.href;
  }
}


class AmpViewer {

  constructor(win, container) {
    /** @private @const {!Window} */
    this.win = win;
    /** @private @const {!Element} */
    this.container = container;

    win.AMP_SHADOW = true;
    this.ampReadyPromise_ = new Promise(resolve => {
      (window.AMP = window.AMP || []).push(resolve);
    });
    this.ampReadyPromise_.then(AMP => {
      log('AMP LOADED:', AMP);
    });

    /** @private @const {string} */
    this.baseUrl_ = null;
    /** @private @const {?Element} */
    this.host_ = null;
<<<<<<< HEAD
    /** @private @const {?ShadowRoot} */
    this.shadowRoot_ = null;
    /** @private @const {!Array<string>} */
    this.stylesheets_ = [];
    /** @private @const {!Array<!Element>} */
    this.scripts_ = [];
    /** @private @const {...} */
    this.viewer_ = null;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======

    // Immediately install amp-shadow.js.
    this.installScript_('/dist/amp-shadow.js');
>>>>>>> ampproject/master
=======

    // Immediately install amp-shadow.js.
    this.installScript_('/dist/amp-shadow.js');
>>>>>>> ampproject/master
=======

    // Immediately install amp-shadow.js.
    this.installScript_('/dist/amp-shadow.js');
>>>>>>> ampproject/master
=======
    /** @private @const {...} */
    this.viewer_ = null;

    // Immediately install amp-shadow.js.
    this.installScript_('/dist/amp-shadow.js');
>>>>>>> ampproject/master
  }

  /**
   */
  clear() {
    this.container.textContent = '';
  }

  /**
   * @param {!Document} doc
   * @param {string} url
   */
  show(doc, url) {
    log('Show document:', doc, url);
    this.container.textContent = '';

    this.baseUrl_ = url;

    this.host_ = this.win.document.createElement('div');
    this.host_.classList.add('amp-doc-host');

    const hostTemplate = this.win.document.getElementById('amp-slot-template');
    if (hostTemplate) {
      this.host_.appendChild(hostTemplate.content.cloneNode(true));
    }

    this.container.appendChild(this.host_);

<<<<<<< HEAD
    this.shadowRoot_ = this.host_.createShadowRoot();
    log('Shadow root:', this.shadowRoot_);

    this.ampReadyPromise_.then(AMP => {
      const amp = AMP.attachShadowRoot(this.shadowRoot_);
      this.viewer_ = amp.viewer;
      this.viewer_.setMessageDeliverer(this.onMessage_.bind(this),
          this.getOrigin_(this.win.location.href));
    });

    // Head
    log('head:', doc.head);
    for (let n = doc.head.firstElementChild; n; n = n.nextElementSibling) {
      const tagName = n.tagName;
      const isMeta = tagName == 'META';
      const isLink = tagName == 'LINK';
      const name = n.getAttribute('name');
      const rel = n.getAttribute('rel');
      if (n.tagName == 'TITLE') {
        this.title_ = n.textContent;
        log('- title: ', this.title_);
      } else if (isMeta && n.hasAttribute('charset')) {
        // Ignore.
      } else if (isMeta && name == 'viewport') {
        // Ignore.
      } else if (isLink && rel == 'canonical') {
        this.canonicalUrl_ = n.getAttribute('href');
        log('- canonical: ', this.canonicalUrl_);
      } else if (isLink && rel == 'stylesheet') {
        this.stylesheets_.push(n.getAttribute('href'));
        log('- stylesheet: ', this.stylesheets_[this.stylesheets_.length - 1]);
      } else if (n.tagName == 'STYLE') {
        if (n.hasAttribute('amp-boilerplate')) {
          // Ignore.
          log('- ignored embedded style: ', n);
        } else {
          log('- embedded style: ', n);
          this.shadowRoot_.appendChild(this.win.document.importNode(n, true));
        }
      } else if (n.tagName == 'SCRIPT') {
        if (n.hasAttribute('src')) {
          log('- src script: ', n);
          this.scripts_.push(n);
        } else {
          log('- non-src script: ', n);
          this.shadowRoot_.appendChild(this.win.document.importNode(n, true));
        }
      } else if (n.tagName == 'NOSCRIPT') {
        // Ignore.
      } else {
        log('- UNKNOWN head element:', n);
      }
    }

    this.mergeHead_();

    // Body
    this.shadowRoot_.appendChild(this.win.document.importNode(doc.body, true));
  }

  mergeHead_() {
    const doc = this.win.document;

    // Title.
    doc.title = this.title_ || '';
    log('SET title: ', doc.title);

    // Stylesheets.
    this.stylesheets_.forEach(stylesheet => {
      const href = this.resolveUrl_(stylesheet);
      const exists = doc.querySelector('link[href="' + href + '"]');
      if (exists) {
        log('- stylesheet already exists: ', href);
      } else {
        const el = doc.createElement('link');
        el.setAttribute('rel', 'stylesheet');
        el.setAttribute('type', 'text/css');
        el.setAttribute('href', href);
        doc.head.appendChild(el);
        log('- stylesheet added: ', href, el);
      }
    });

    // Scripts.
    this.scripts_.forEach(script => {
      // TODO(dvoytenko): extensions should be ideally registered via runtime
      // to ensure correct stubbing, version management and other dependencies.
      const customElement = script.getAttribute('custom-element');
      const customTemplate = script.getAttribute('custom-template');
      const src = this.resolveUrl_(script.getAttribute('src'));
      log('script: ', customElement, customTemplate, script.getAttribute('src'), src);
      const existsExpr =
          customElement ? '[custom-element="' + customElement + '"]' :
          customTemplate ? '[custom-template="' + customTemplate + '"]' :
          '[src="' + src + '"]';
      const exists = doc.querySelector('script' + existsExpr);
      if (exists) {
        log('- script already exists: ', customElement, customTemplate, src);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      } else {
        const el = doc.createElement('script');
        el.setAttribute('async', '');
        el.setAttribute('src', src);
        if (customElement) {
          el.setAttribute('custom-element', customElement);
        }
        if (customTemplate) {
          el.setAttribute('custom-template', customTemplate);
        }
        doc.head.appendChild(el);
        log('- script added: ', src, el);
=======
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
      } else if (src.indexOf('/amp.js') != -1) {
        // Do not install runtime again. Already installed via amp-shadow.js.
        log('- runtime already installed: ', src);
      } else {
        this.installScript_(src, customElement, customTemplate);
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
      }
=======
    this.ampReadyPromise_.then(AMP => {
      const amp = AMP.attachShadowDoc(this.host_, doc, url);
      this.win.document.title = amp.title || '';
      this.viewer_ = amp.viewer;
      /* TODO(dvoytenko): enable message deliverer as soon as viewer is provided
      this.viewer_.setMessageDeliverer(this.onMessage_.bind(this),
          this.getOrigin_(this.win.location.href));
      */
>>>>>>> ampproject/master
    });
  }

  /**
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
   * @param {string} src
   * @param {string=} customElement
   * @param {string=} customTemplate
   */
  installScript_(src, customElement, customTemplate) {
    const doc = this.win.document;
    const el = doc.createElement('script');
    el.setAttribute('src', src);
    if (customElement) {
      el.setAttribute('custom-element', customElement);
    }
    if (customTemplate) {
      el.setAttribute('custom-template', customTemplate);
    }
    doc.head.appendChild(el);
    log('- script added: ', src, el);
  }

  /**
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
   * @param {string} url
   * @return {string}
   */
  resolveUrl_(relativeUrlString) {
    return new URL(relativeUrlString, this.baseUrl_).toString();
  }

  /**
   * @param {string} url
   * @return {string}
   */
  getOrigin_(relativeUrlString) {
    return new URL(relativeUrlString, this.baseUrl_).origin;
  }

  /**
   */
  onMessage_(type, data, rsvp) {
    log('received message:', type, data, rsvp);
  }
}


/**
 * @param {string} url
 * @return {boolean}
 */
function isShellUrl(url) {
  return (url == '/pwa' || url == '/pwa/');
}


/**
 * @param {string} url
 * @return {!Promise<!Document>}
 */
function fetchDocument(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'document';
    xhr.setRequestHeader('Accept', 'text/html');
<<<<<<< HEAD
    xhr.setRequestHeader('AMP-Direct-Fetch', '1');
=======
>>>>>>> ampproject/master
    xhr.onreadystatechange = () => {
      if (xhr.readyState < /* STATUS_RECEIVED */ 2) {
        return;
      }
      if (xhr.status < 100 || xhr.status > 599) {
        xhr.onreadystatechange = null;
        reject(new Error(`Unknown HTTP status ${xhr.status}`));
        return;
      }
      if (xhr.readyState == /* COMPLETE */ 4) {
        if (xhr.responseXML) {
          resolve(xhr.responseXML);
        } else {
          reject(new Error(`No xhr.responseXML`));
        }
      }
    };
    xhr.onerror = () => {
      reject(new Error('Network failure'));
    };
    xhr.onabort = () => {
      reject(new Error('Request aborted'));
    };
    xhr.send();
  });
}



var shell = new Shell(window);
