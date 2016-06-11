'use strict';

var shell;

window.onload = () => {
  shell = new Shell(window);
};


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
    this.currentPage_ = stripHashMarker(win.location.hash);

    win.addEventListener('popstate', this.handlePopState_.bind(this));

    log('STARTED');

    if (this.currentPage_) {
      this.navigateTo(this.currentPage_);
    }
  }

  /**
   */
  handlePopState_() {
    const newPage = stripHashMarker(this.win.location.hash);
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
    this.currentPage_ = path;

    // Update URL.
    const newHash = '#' + path;
    const push = !this.currentPage_ && !!path;
    if (newHash != this.win.location.hash) {
      if (push) {
        this.win.history.pushState(null, '', newHash);
      } else {
        this.win.history.replaceState(null, '', newHash);
      }
    }

    if (!path) {
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
    /** @private @const {?ShadowRoot} */
    this.shadowRoot_ = null;
    /** @private @const {!Array<string>} */
    this.stylesheets_ = [];
    /** @private @const {!Array<!Element>} */
    this.scripts_ = [];
    /** @private @const {...} */
    this.viewer_ = null;
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
    this.container.appendChild(this.host_);

    this.shadowRoot_ = this.host_.createShadowRoot();
    log('Shadow root:', this.shadowRoot_);

    this.ampReadyPromise_.then(AMP => {
      const amp = AMP.attachShadowRoot(this.shadowRoot_);
      this.viewer_ = amp.viewer;
      this.viewer_.setMessageDeliverer(this.onMessage_.bind(this),
          'http://localhost:8000');
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
      // XXX: stub elements, reg templates
      const customElement = script.getAttribute('custom-element');
      const customTemplate = script.getAttribute('custom-template');
      const src = this.resolveUrl_(script.getAttribute('src'));
      log('script: ', customElement, customTemplate, script.getAttribute('src'), src);
      const existsExpr =
          customElement ? '[custom-element="' + customElement + '"]' :
          customTemplate ? '[custom-template="' + customTemplate + '"]' :
          // TODO: version control!
          '[src="' + src + '"]';
      const exists = doc.querySelector('script' + existsExpr);
      if (exists) {
        log('- script already exists: ', customElement, customTemplate, src);
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
      }
    });
  }

  /**
   * @param {string} url
   * @return {string}
   */
  resolveUrl_(relativeUrlString) {
    return new URL(relativeUrlString, this.baseUrl_).toString();
  }

  /**
   */
  onMessage_(type, data, rsvp) {
    log('receieved message:', type, data, rsvp);
  }
}


/**
 */
function stripHashMarker(s) {
  if (s && s.substr(0, 1) == '#') {
    s = s.substr(1);
  }
  return s;
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
