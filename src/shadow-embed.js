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

import {Services} from './services';
import {ShadowCSS} from '../third_party/webcomponentsjs/ShadowCSS';
import {
  ShadowDomVersion,
  getShadowDomSupportedVersion,
  isShadowCssSupported,
  isShadowDomSupported,
} from './web-components';
import {
  childElementsByTag,
  closestNode,
  escapeCssSelectorIdent,
  iterateCursor,
  removeElement,
} from './dom';
import {dev} from './log';
import {installCssTransformer} from './style-installer';
import {setStyle} from './style';
import {toArray, toWin} from './types';

/**
 * Used for non-composed root-node search. See `getRootNode`.
 * @const {!GetRootNodeOptions}
 */
const UNCOMPOSED_SEARCH = {composed: false};

/** @const {!RegExp} */
const CSS_SELECTOR_BEG_REGEX = /[^\.\-\_0-9a-zA-Z]/;

/** @const {!RegExp} */
const CSS_SELECTOR_END_REGEX = /[^\-\_0-9a-zA-Z]/;

/**
 * @type {boolean|undefined}
 */
let shadowDomStreamingSupported;


/**
 * Creates a shadow root for the specified host and returns it. Polyfills
 * shadow root creation if necessary.
 * @param {!Element} hostElement
 * @return {!ShadowRoot}
 */
export function createShadowRoot(hostElement) {
  const win = toWin(hostElement.ownerDocument.defaultView);

  const existingRoot = hostElement.shadowRoot || hostElement.__AMP_SHADOW_ROOT;
  if (existingRoot) {
    existingRoot./*OK*/innerHTML = '';
    return existingRoot;
  }

  let shadowRoot;
  const shadowDomSupported = getShadowDomSupportedVersion();
  if (shadowDomSupported == ShadowDomVersion.V1) {
    shadowRoot = hostElement.attachShadow({mode: 'open'});
    if (!shadowRoot.styleSheets) {
      Object.defineProperty(shadowRoot, 'styleSheets', {
        get: function() {
          const items = [];
          iterateCursor(shadowRoot.childNodes, child => {
            if (child.tagName === 'STYLE') {
              items.push(child.sheet);
            }
          });
          return items;
        },
      });
    }
  } else if (shadowDomSupported == ShadowDomVersion.V0) {
    shadowRoot = hostElement.createShadowRoot();
  } else {
    shadowRoot = createShadowRootPolyfill(hostElement);
  }

  if (!isShadowCssSupported()) {
    const rootId = `i-amphtml-sd-${win.Math.floor(win.Math.random() * 10000)}`;
    shadowRoot.id = rootId;
    shadowRoot.host.classList.add(rootId);

    // CSS isolation.
    installCssTransformer(shadowRoot, css => {
      return transformShadowCss(shadowRoot, css);
    });
  }

  return shadowRoot;
}


/**
 * Shadow root polyfill.
 * @param {!Element} hostElement
 * @return {!ShadowRoot}
 */
function createShadowRootPolyfill(hostElement) {
  const doc = hostElement.ownerDocument;

  // Host CSS polyfill.
  hostElement.classList.add('i-amphtml-shadow-host-polyfill');
  const hostStyle = doc.createElement('style');
  hostStyle.textContent =
      '.i-amphtml-shadow-host-polyfill>:not(i-amphtml-shadow-root)'
      + '{display:none!important}';
  hostElement.appendChild(hostStyle);

  // Shadow root.
  const shadowRoot = /** @type {!ShadowRoot} */ (
    // Cast to ShadowRoot even though it is an Element
    // TODO(@dvoytenko) Consider to switch to a type union instead.
    /** @type {?}  */ (doc.createElement('i-amphtml-shadow-root')));
  hostElement.appendChild(shadowRoot);
  hostElement.shadowRoot = hostElement.__AMP_SHADOW_ROOT = shadowRoot;

  // API: https://www.w3.org/TR/shadow-dom/#the-shadowroot-interface

  shadowRoot.host = hostElement;

  // `getElementById` is resolved via `querySelector('#id')`.
  shadowRoot.getElementById = function(id) {
    const escapedId = escapeCssSelectorIdent(id);
    return /** @type {HTMLElement|null} */ (
      shadowRoot./*OK*/querySelector(`#${escapedId}`));
  };

  // The styleSheets property should have a list of local styles.
  Object.defineProperty(shadowRoot, 'styleSheets', {
    get: () => {
      if (!doc.styleSheets) {
        return [];
      }
      return toArray(doc.styleSheets).filter(
          styleSheet => shadowRoot.contains(styleSheet.ownerNode));
    },
  });

  return shadowRoot;
}


/**
 * Determines if value is actually a `ShadowRoot` node.
 * @param {*} value
 * @return {boolean}
 */
export function isShadowRoot(value) {
  if (!value) {
    return false;
  }
  // Node.nodeType == DOCUMENT_FRAGMENT to speed up the tests. Unfortunately,
  // nodeType of DOCUMENT_FRAGMENT is used currently for ShadowRoot nodes.
  if (value.tagName == 'I-AMPHTML-SHADOW-ROOT') {
    return true;
  }
  return (value.nodeType == /* DOCUMENT_FRAGMENT */ 11 &&
      Object.prototype.toString.call(value) === '[object ShadowRoot]');
}


/**
 * Return shadow root for the specified node.
 * @param {!Node} node
 * @return {?ShadowRoot}
 */
export function getShadowRootNode(node) {
  if (isShadowDomSupported() && Node.prototype.getRootNode) {
    return /** @type {?ShadowRoot} */ (node.getRootNode(UNCOMPOSED_SEARCH));
  }
  // Polyfill shadow root lookup.
  return /** @type {?ShadowRoot} */ (closestNode(node, n => isShadowRoot(n)));
}


/**
 * Imports a body into a shadow root with the workaround for a polyfill case.
 * @param {!ShadowRoot} shadowRoot
 * @param {!Element} body
 * @param {boolean} deep
 * @return {!Element}
 */
export function importShadowBody(shadowRoot, body, deep) {
  const doc = shadowRoot.ownerDocument;
  let resultBody;
  if (isShadowCssSupported()) {
    resultBody = dev().assertElement(doc.importNode(body, deep));
  } else {
    resultBody = doc.createElement('amp-body');
    setStyle(resultBody, 'display', 'block');
    for (let i = 0; i < body.attributes.length; i++) {
      resultBody.setAttribute(
          body.attributes[0].name, body.attributes[0].value);
    }
    if (deep) {
      for (let n = body.firstChild; !!n; n = n.nextSibling) {
        resultBody.appendChild(doc.importNode(n, true));
      }
    }
  }
  setStyle(resultBody, 'position', 'relative');
  shadowRoot.appendChild(resultBody);
  Object.defineProperty(shadowRoot, 'body', {value: resultBody});
  return resultBody;
}


/**
 * If necessary, transforms CSS to isolate AMP CSS within the shaodw root and
 * reduce the possibility of high-level conflicts.
 * @param {!ShadowRoot} shadowRoot
 * @param {string} css
 * @return {string}
 */
export function transformShadowCss(shadowRoot, css) {
  return scopeShadowCss(shadowRoot, css);
}


/**
 * Transforms CSS to isolate AMP CSS within the shadow root and reduce the
 * possibility of high-level conflicts. There are two types of transformations:
 * 1. Root transformation: `body` -> `amp-body`, etc.
 * 2. Scoping: `a {}` -> `.i-amphtml-sd-123 a {}`.
 *
 * @param {!ShadowRoot} shadowRoot
 * @param {string} css
 * @return {string}
 * @visibleForTesting
 */
export function scopeShadowCss(shadowRoot, css) {
  const id = dev().assert(shadowRoot.id);
  const doc = shadowRoot.ownerDocument;
  let rules = null;
  // Try to use a separate document.
  try {
    rules = getStylesheetRules(doc.implementation.createHTMLDocument(''), css);
  } catch (e) {
    // Ignore.
  }
  // Try to use the current document.
  if (!rules) {
    try {
      rules = getStylesheetRules(doc, css);
    } catch (e) {
      // Ignore.
    }
  }

  // No rules could be parsed - return css as is.
  if (!rules) {
    return css;
  }

  // Patch selectors.
  // Invoke `ShadowCSS.scopeRules` via `call` because the way it uses `this`
  // internally conflicts with Closure compiler's advanced optimizations.
  const scopeRules = ShadowCSS.scopeRules;
  return scopeRules.call(ShadowCSS, rules, `.${id}`, transformRootSelectors);
}


/**
 * Replaces top-level selectors such as `html` and `body` with their polyfill
 * counterparts: `amp-html` and `amp-body`.
 * @param {string} selector
 * @return {string}
 */
function transformRootSelectors(selector) {
  return selector.replace(/(html|body)/g, rootSelectorPrefixer);
}


/**
 * See `transformRootSelectors`.
 * @param {string} match
 * @param {string} name
 * @param {number} pos
 * @param {string} selector
 * @return {string}
 * @private
 */
function rootSelectorPrefixer(match, name, pos, selector) {
  const prev = selector.charAt(pos - 1);
  const next = selector.charAt(pos + match.length);
  if ((!prev || CSS_SELECTOR_BEG_REGEX.test(prev)) &&
      (!next || CSS_SELECTOR_END_REGEX.test(next))) {
    return 'amp-' + match;
  }
  return match;
}


/**
 * @param {!Document} doc
 * @param {string} css
 * @return {?CSSRuleList}
 */
function getStylesheetRules(doc, css) {
  const style = doc.createElement('style');
  style./*OK*/textContent = css;
  try {
    (doc.head || doc.documentElement).appendChild(style);
    if (style.sheet) {
      return style.sheet.cssRules;
    }
    return null;
  } finally {
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }
}


/**
 * @param {boolean|undefined} val
 * @visibleForTesting
 */
export function setShadowDomStreamingSupportedForTesting(val) {
  shadowDomStreamingSupported = val;
}


/**
 * Returns `true` if the Shadow DOM streaming is supported.
 * @param {!Window} win
 * @return {boolean}
 */
export function isShadowDomStreamingSupported(win) {
  if (shadowDomStreamingSupported === undefined) {
    shadowDomStreamingSupported = calcShadowDomStreamingSupported(win);
  }
  return shadowDomStreamingSupported;
}


/**
 * @param {!Window} win
 * @return {boolean}
 */
function calcShadowDomStreamingSupported(win) {
  // API must be supported.
  if (!win.document.implementation ||
      typeof win.document.implementation.createHTMLDocument != 'function') {
    return false;
  }
  // Firefox does not support DOM streaming.
  // See: https://bugzilla.mozilla.org/show_bug.cgi?id=867102
  if (Services.platformFor(win).isFirefox()) {
    return false;
  }
  // Assume full streaming support.
  return true;
}


/**
 * Creates the Shadow DOM writer available on this platform.
 * @param {!Window} win
 * @return {!ShadowDomWriter}
 */
export function createShadowDomWriter(win) {
  if (isShadowDomStreamingSupported(win)) {
    return new ShadowDomWriterStreamer(win);
  }
  return new ShadowDomWriterBulk(win);
}


/**
 * Takes as an input a text stream, parses it and incrementally reconstructs
 * it in the shadow root.
 *
 * See https://jakearchibald.com/2016/fun-hacks-faster-content/ for more
 * details.
 *
 * @interface
 * @extends {WritableStreamDefaultWriter}
 * @visibleForTesting
 */
export class ShadowDomWriter {

  /**
   * Sets the callback that will be called when body has been parsed.
   *
   * Unlike most of other nodes, `<body>` cannot be simply merged to support
   * SD polyfill where the use of `<body>` element is not possible. The
   * callback will be given the parsed document and it must return back
   * the reconstructed `<body>` node in the target DOM where all children
   * will be streamed into.
   *
   * @param {function(!Document):!Element} unusedCallback
   */
  onBody(unusedCallback) {}

  /**
   * Sets the callback that will be called when new nodes have been merged
   * into the target DOM.
   * @param {function()} unusedCallback
   */
  onBodyChunk(unusedCallback) {}

  /**
   * Sets the callback that will be called when the DOM has been fully
   * constructed.
   * @param {function()} unusedCallback
   */
  onEnd(unusedCallback) {}
}


/**
 * Takes as an input a text stream, parses it and incrementally reconstructs
 * it in the shadow root.
 *
 * See https://jakearchibald.com/2016/fun-hacks-faster-content/ for more
 * details.
 *
 * @implements {ShadowDomWriter}
 * @visibleForTesting
 */
export class ShadowDomWriterStreamer {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const @private {!Document} */
    this.parser_ = win.document.implementation.createHTMLDocument('');
    this.parser_.open();

    /** @const @private */
    this.vsync_ = Services.vsyncFor(win);

    /** @private @const */
    this.boundMerge_ = this.merge_.bind(this);

    /** @private {?function(!Document):!Element} */
    this.onBody_ = null;

    /** @private {?function()} */
    this.onBodyChunk_ = null;

    /** @private {?function()} */
    this.onEnd_ = null;

    /** @private {boolean} */
    this.mergeScheduled_ = false;

    /** @const @private {!Promise} */
    this.success_ = Promise.resolve();

    /** @private {boolean} */
    this.eof_ = false;

    /** @private {?Element} */
    this.targetBody_ = null;
  }

  /** @override */
  onBody(callback) {
    this.onBody_ = callback;
  }

  /** @override */
  onBodyChunk(callback) {
    this.onBodyChunk_ = callback;
  }

  /** @override */
  onEnd(callback) {
    this.onEnd_ = callback;
  }

  /** @override */
  write(chunk) {
    if (this.eof_) {
      throw new Error('closed already');
    }
    if (chunk) {
      this.parser_.write(/** @type {string} */ (chunk));
    }
    this.schedule_();
    return this.success_;
  }

  /** @override */
  close() {
    this.parser_.close();
    this.eof_ = true;
    this.schedule_();
    return this.success_;
  }

  /** @override */
  abort(unusedReason) {
    throw new Error('Not implemented');
  }

  /** @override */
  releaseLock() {
    throw new Error('Not implemented');
  }

  /** @override */
  get closed() {
    throw new Error('Not implemented');
  }

  /** @override */
  get desiredSize() {
    throw new Error('Not implemented');
  }

  /** @override */
  get ready() {
    throw new Error('Not implemented');
  }

  /** @private */
  schedule_() {
    dev().assert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);
    if (!this.mergeScheduled_) {
      this.mergeScheduled_ = true;
      this.vsync_.mutate(this.boundMerge_);
    }
  }

  /** @private */
  merge_() {
    this.mergeScheduled_ = false;

    // Body has been newly parsed.
    if (!this.targetBody_ && this.parser_.body) {
      this.targetBody_ = this.onBody_(this.parser_);
    }

    // Merge body children.
    if (this.targetBody_) {
      const inputBody = dev().assert(this.parser_.body);
      const targetBody = dev().assert(this.targetBody_);
      let transferCount = 0;
      removeNoScriptElements(inputBody);
      while (inputBody.firstChild) {
        transferCount++;
        targetBody.appendChild(inputBody.firstChild);
      }
      if (transferCount > 0) {
        this.onBodyChunk_();
      }
    }

    // EOF.
    if (this.eof_) {
      this.onEnd_();
    }
  }
}


/**
 * Takes as an input a text stream, aggregates it and parses it in one bulk.
 * This is a workaround against the browsers that do not support streaming DOM
 * parsing. Mainly currently Firefox.
 *
 * See https://github.com/whatwg/html/issues/2827 and
 * https://bugzilla.mozilla.org/show_bug.cgi?id=867102
 *
 * @implements {ShadowDomWriter}
 * @visibleForTesting
 */
export class ShadowDomWriterBulk {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Array<string>} */
    this.fullHtml_ = [];

    /** @const @private */
    this.vsync_ = Services.vsyncFor(win);

    /** @private {?function(!Document):!Element} */
    this.onBody_ = null;

    /** @private {?function()} */
    this.onBodyChunk_ = null;

    /** @private {?function()} */
    this.onEnd_ = null;

    /** @const @private {!Promise} */
    this.success_ = Promise.resolve();

    /** @private {boolean} */
    this.eof_ = false;
  }

  /** @override */
  onBody(callback) {
    this.onBody_ = callback;
  }

  /** @override */
  onBodyChunk(callback) {
    this.onBodyChunk_ = callback;
  }

  /** @override */
  onEnd(callback) {
    this.onEnd_ = callback;
  }

  /** @override */
  write(chunk) {
    dev().assert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);
    if (this.eof_) {
      throw new Error('closed already');
    }
    if (chunk) {
      this.fullHtml_.push(dev().assertString(chunk));
    }
    return this.success_;
  }

  /** @override */
  close() {
    dev().assert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);
    this.eof_ = true;
    this.vsync_.mutate(() => this.complete_());
    return this.success_;
  }

  /** @override */
  abort(unusedReason) {
    throw new Error('Not implemented');
  }

  /** @override */
  releaseLock() {
    throw new Error('Not implemented');
  }

  /** @override */
  get closed() {
    throw new Error('Not implemented');
  }

  /** @override */
  get desiredSize() {
    throw new Error('Not implemented');
  }

  /** @override */
  get ready() {
    throw new Error('Not implemented');
  }

  /** @private */
  complete_() {
    const fullHtml = this.fullHtml_.join('');
    const doc = new DOMParser().parseFromString(fullHtml, 'text/html');

    // Merge body.
    if (doc.body) {
      const inputBody = doc.body;
      const targetBody = this.onBody_(doc);
      let transferCount = 0;
      removeNoScriptElements(inputBody);
      while (inputBody.firstChild) {
        transferCount++;
        targetBody.appendChild(inputBody.firstChild);
      }
      if (transferCount > 0) {
        this.onBodyChunk_();
      }
    }

    // EOF.
    this.onEnd_();
  }
}

/*
 * Remove any noscript elements.
 * @param {!Element} parent
 *
 * According to the spec (https://w3c.github.io/DOM-Parsing/#the-domparser-interface),
 * with `DOMParser().parseFromString`, contents of `noscript` get parsed as markup,
 * so we need to remove them manually.
 * Why? ¯\_(ツ)_/¯
 * `createHTMLDocument()` seems to behave the same way.
 */
function removeNoScriptElements(parent) {
  const noscriptElements = childElementsByTag(parent, 'noscript');
  iterateCursor(noscriptElements, element => {
    removeElement(element);
  });
}
