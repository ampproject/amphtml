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

function startsWith(string, prefix) {
  return string.lastIndexOf(prefix, 0) == 0;
}

class Shell {
  constructor(win, useStreaming) {
    /** @private @const {!Window} */
    this.win = win;

    /** @private @const {boolean} */
    this.useStreaming_ = useStreaming;

    /** @private @const {!AmpViewer} */
    this.ampViewer_ = new AmpViewer(win,
        win.document.getElementById('doc-container'));

    /** @private {string} */
    this.currentPage_ = win.location.pathname;

    win.addEventListener('popstate', this.handlePopState_.bind(this));
    win.document.documentElement.addEventListener('click',
        this.handleNavigate_.bind(this));

    log('Shell created');

    if (this.currentPage_ && !isShellUrl(this.currentPage_)) {
      this.navigateTo(this.currentPage_);
    } else if (this.win.location.hash) {
      const hashParams = parseQueryString(this.win.location.hash);
      const href = hashParams['href'];
      if (href) {
        this.currentPage_ = href;
        this.navigateTo(href);
      }
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
      const location = this.win.location;
      if (url.origin == location.origin &&
          startsWith(url.pathname, '/pwa/') &&
          url.pathname.indexOf('amp.html') != -1) {
        e.preventDefault();
        const newPage = url.pathname + location.search;
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
    // TODO(dvoytenko, #9490): Make `streamDocument` the only used API once
    // streaming is graduated out of experimental.
    if (this.useStreaming_) {
      log('Streaming started: ', url);
      return this.ampViewer_.showAsStream(url).then(
          shadowDoc => streamDocument(url, shadowDoc.writer));
    }
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
    /** @private @const {...} */
    this.amp_ = null;

    // Immediately install amp-shadow.js.
    this.installScript_('/dist/amp-shadow.js');
  }

  /**
   */
  clear() {
    if (this.amp_) {
      this.amp_.close();
      this.amp_ = null;
    }
    this.container.textContent = '';
  }

  /**
   * @param {!Document} doc
   * @param {string} url
   */
  show(doc, url) {
    log('Show document:', doc, url);

    // Cleanup the existing document if any.
    this.clear();

    this.baseUrl_ = url;

    this.host_ = this.win.document.createElement('div');
    this.host_.classList.add('amp-doc-host');

    const hostTemplate = this.win.document.getElementById('amp-slot-template');
    if (hostTemplate) {
      this.host_.appendChild(hostTemplate.content.cloneNode(true));
    }

    this.container.appendChild(this.host_);

    this.ampReadyPromise_.then(AMP => {
      this.amp_ = AMP.attachShadowDoc(this.host_, doc, url, {});
      this.win.document.title = this.amp_.title || '';
      this.amp_.onMessage(this.onMessage_.bind(this));
      this.amp_.setVisibilityState('visible');
    });
  }

  /**
   * @param {string} url
   * @return {!Promise<!ShadowDoc>}
   */
  showAsStream(url) {
    log('Show stream document:', url);

    // Cleanup the existing document if any.
    this.clear();

    this.baseUrl_ = url;

    this.host_ = this.win.document.createElement('div');
    this.host_.classList.add('amp-doc-host');

    const hostTemplate = this.win.document.getElementById('amp-slot-template');
    if (hostTemplate) {
      this.host_.appendChild(hostTemplate.content.cloneNode(true));
    }

    this.container.appendChild(this.host_);

    return this.ampReadyPromise_.then(AMP => {
      this.amp_ = AMP.attachShadowDocAsStream(this.host_, url, {});
      this.win.document.title = this.amp_.title || '';
      this.amp_.onMessage(this.onMessage_.bind(this));
      this.amp_.setVisibilityState('visible');
      return this.amp_;
    });
  }

  /**
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


/**
 * @param {string} url
 * @param {!WritableStreamDefaultWriter} writer
 * @return {!Promise}
 */
function streamDocument(url, writer) {
  // Try native first.
  if (window.fetch && window.TextDecoder && window.ReadableStream) {
    return fetch(url).then(response => {
      // This should be a lot simpler with transforming streams and pipes,
      // but, TMK, these are not supported anywhere yet.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      function readChunk(chunk) {
        const text = decoder.decode(
            chunk.value || new Uint8Array(),
            {stream: !chunk.done});
        if (text) {
          writer.write(text);
        }
        if (chunk.done) {
          writer.close();
        } else {
          return reader.read().then(readChunk);
        }
      }
      return reader.read().then(readChunk);
    });
  }

  // Polyfill via XHR.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'text/html');
    let pos = 0;
    xhr.onreadystatechange = () => {
      if (xhr.readyState < /* STATUS_RECEIVED */ 2) {
        return;
      }
      if (xhr.status < 100 || xhr.status > 599) {
        xhr.onreadystatechange = null;
        reject(new Error(`Unknown HTTP status ${xhr.status}`));
        return;
      }
      if (xhr.readyState == /* LOADING */ 3 ||
          xhr.readyState == /* COMPLETE */ 4) {
        const s = xhr.responseText;
        const chunk = s.substring(pos);
        pos = s.length;
        writer.write(chunk);
        if (xhr.readyState == /* COMPLETE */ 4) {
          writer.close().then(resolve);
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


/**
 * Parses the query string of an URL. This method returns a simple key/value
 * map. If there are duplicate keys the latest value is returned.
 * @param {string} queryString
 * @return {!Object<string>}
 */
function parseQueryString(queryString) {
  const params = Object.create(null);
  if (!queryString) {
    return params;
  }
  if (startsWith(queryString, '?') || startsWith(queryString, '#')) {
    queryString = queryString.substr(1);
  }
  const pairs = queryString.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const eqIndex = pair.indexOf('=');
    let name;
    let value;
    if (eqIndex != -1) {
      name = decodeURIComponent(pair.substring(0, eqIndex)).trim();
      value = decodeURIComponent(pair.substring(eqIndex + 1)).trim();
    } else {
      name = decodeURIComponent(pair).trim();
      value = '';
    }
    if (name) {
      params[name] = value;
    }
  }
  return params;
}


var shell = new Shell(window, /* useStreaming */ true);
