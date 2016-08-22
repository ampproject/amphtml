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

import {closestNode} from '../dom';
import {dev} from '../log';
import {getService} from '../service';
import {isShadowRoot} from '../types';
import {isDocumentReady, onDocumentReady} from '../document-ready';
import {waitForBody} from '../dom';

/** @const {string} */
const AMPDOC_PROP = '__AMPDOC';


/**
 * Creates and installs the ampdoc for the shadow root.
 * @param {!AmpDocService} ampdocService
 * @param {string} url
 * @param {!ShadowRoot} shadowRoot
 * @return {!AmpDocShadow}
 * @restricted
 */
export function installShadowDoc(ampdocService, url, shadowRoot) {
  return ampdocService.installShadowDoc_(url, shadowRoot);
}


/**
 * Signals that the shadow doc is ready.
 * @param {!AmpDocShadow} ampdoc
 * @restricted
 */
export function shadowDocReady(ampdoc) {
  ampdoc.setReady_();
}


/**
 * Signals that the shadow doc has a body.
 * @param {!AmpDocShadow} ampdoc
 * @param {!Element} body
 * @restricted
 */
export function shadowDocHasBody(ampdoc, body) {
  ampdoc.setBody_(body);
}


/**
 * This service helps locate an ampdoc (`AmpDoc` instance) for any node,
 * either in the single-doc or shadow-doc environments.
 *
 * In the single-doc environment an ampdoc is equivalent to the
 * `window.document`. In the shadow-doc mode, any number of AMP documents
 * could be hosted in shadow roots in the same global `window.document`.
 *
 * @package
 */
export class AmpDocService {
  /**
   * @param {!Window} win
   * @param {boolean} isSingleDoc
   */
  constructor(win, isSingleDoc) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {?AmpDoc} */
    this.singleDoc_ = null;
    if (isSingleDoc) {
      this.singleDoc_ = new AmpDocSingle(win);
    }
  }

  /**
   * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
   * mode that supports multiple documents per a single window.
   * @return {boolean}
   */
  isSingleDoc() {
    return !!this.singleDoc_;
  }

  /**
   * Returns the instance of the ampdoc (`AmpDoc`) that contains the specified
   * node. If the runtime is in the single-doc mode, the one global `AmpDoc`
   * instance is always returned. Otherwise, this method locates the `AmpDoc`
   * that contains the specified node and, if necessary, initializes it.
   *
   * @param {!Node} node
   * @return {!AmpDoc}
   */
  getAmpDoc(node) {
    // Single document: return it immediately.
    if (this.singleDoc_) {
      return this.singleDoc_;
    }

    // Otherwise discover and possibly create the ampdoc.
    let n = node;
    while (n) {
      // A custom element may already have the reference to the ampdoc.
      if (typeof n.getAmpDoc == 'function') {
        const ampdoc = n.getAmpDoc();
        if (ampdoc) {
          return ampdoc;
        }
      }

      // TODO(dvoytenko): Replace with `getRootNode()` API when it's available.
      const shadowRoot = closestNode(n, n => isShadowRoot(n));
      if (!shadowRoot) {
        break;
      }

      const ampdoc = shadowRoot[AMPDOC_PROP];
      if (ampdoc) {
        return ampdoc;
      }
      n = shadowRoot.host;
    }

    throw dev().createError('No ampdoc found for', node);
  }

  /**
   * Creates and installs the ampdoc for the shadow root.
   * @param {string} url
   * @param {!ShadowRoot} shadowRoot
   * @return {!AmpDoc}
   * @private
   */
  installShadowDoc_(url, shadowRoot) {
    dev().assert(!shadowRoot[AMPDOC_PROP],
        'The shadow root already contains ampdoc');
    const ampdoc = new AmpDocShadow(this.win, url, shadowRoot);
    shadowRoot[AMPDOC_PROP] = ampdoc;
    return ampdoc;
  }
}


/**
 * This class represents a single ampdoc. `AmpDocService` can contain only one
 * global ampdoc or multiple, depending on the runtime mode: single-doc or
 * shadow-doc.
 * @abstract
 * @package
 */
export class AmpDoc {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @public @const {!Window} */
    this.win = win;
  }

  /**
   * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
   * mode that supports multiple documents per a single window.
   * @return {boolean}
   */
  isSingleDoc() {
    return dev().assert(null, 'not implemented');
  }

  /**
   * DO NOT CALL. Retained for backward compat during rollout.
   * @return {!Window}
   */
  getWin() {
    return this.win;
  }

  /**
   * Returns the root node for this ampdoc. It will either be a `Document` for
   * the single-doc runtime mode, or a `ShadowRoot` for shadow-doc mode. This
   * node can be used, among other things, to add ampdoc-wide event listeners.
   *
   * @return {!Document|!ShadowRoot}
   */
  getRootNode() {
    return dev().assert(null, 'not implemented');
  }

  /**
   * Returns the ampdoc's body. It can be null.
   *
   * See `onBody`.
   *
   * @return {?Element}
   */
  getBody() {
    return dev().assert(null, 'not implemented');
  }

  /**
   * Calls the callback when ampdoc's body is available.
   * @param {function(!Element)} unusedCallback
   */
  onBody(unusedCallback) {
    dev().assert(null, 'not implemented');
  }

  /**
   * Returns `true` if document is ready.
   *
   * See `onReady`.
   *
   * @return {?Element}
   */
  isReady() {
    return dev().assert(null, 'not implemented');;
  }

  /**
   * Calls the callback when ampdoc is ready.
   * @param {function()} unusedCallback
   */
  onReady(unusedCallback) {
    dev().assert(null, 'not implemented');
  }

  /**
   * Returns the URL from which the document was loaded.
   * @return {string}
   */
  getUrl() {
    return dev().assert(null, 'not implemented');
  }

  /**
   * Locates an element with the specified ID within the ampdoc. In the
   * shadow-doc mode, when multiple documents could be present, this method
   * localizes search only to the DOM subtree specific to this ampdoc.
   *
   * @param {string} id
   * @return {?Element}
   */
  getElementById(id) {
    return this.getRootNode().getElementById(id);
  }
}


/**
 * The version of `AmpDoc` in the single-doc mode that corresponds to the
 * global `window.document`.
 * @package @visibleForTesting
 */
export class AmpDocSingle extends AmpDoc {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    super(win);
  }

  /** @override */
  getWin() {
    return this.win;
  }

  /** @override */
  isSingleDoc() {
    return true;
  }

  /** @override */
  getRootNode() {
    return this.win.document;
  }

  /** @override */
  getUrl() {
    return this.win.location.href;
  }

  /** @override */
  getBody() {
    return this.win.document.body;
  }

  /** @override */
  onBody(callback) {
    if (this.win.document.body) {
      callback(this.win.document.body);
    } else {
      waitForBody(this.win.document, () => callback(this.win.document.body));
    }
  }

  /** @override */
  isReady() {
    return isDocumentReady(this.win.document);
  }

  /** @override */
  onReady(callback) {
    onDocumentReady(this.win.document, callback);
  }
}


/**
 * The version of `AmpDoc` in the shadow-doc mode that is allocated for each
 * ampdoc hosted within a shadow root.
 * @package @visibleForTesting
 */
export class AmpDocShadow extends AmpDoc {
  /**
   * @param {!Window} win
   * @param {string} url
   * @param {!ShadowRoot} shadowRoot
   */
  constructor(win, url, shadowRoot) {
    super(win);
    /** @private @const {string} */
    this.url_ = url;
    /** @private @const {!ShadowRoot} */
    this.shadowRoot_ = shadowRoot;

    /** @private {?Element} */
    this.body_ = null;

    /** @private {function(!Element)|undefined} */
    this.bodyResolver_ = undefined;

    /** @private {!Promise<!Element>|undefined} */
    this.bodyPromise_ = new Promise(resolve => {
      this.bodyResolver_ = resolve;
    });

    /** @private {boolean} */
    this.ready_ = false;

    /** @private {function(!Element)|undefined} */
    this.readyResolver_ = undefined;

    /** @private {!Promise<!Element>|undefined} */
    this.readyPromise_ = new Promise(resolve => {
      this.readyResolver_ = resolve;
    });
  }

  /** @override */
  getWin() {
    return this.win;
  }

  /** @override */
  isSingleDoc() {
    return false;
  }

  /** @override */
  getRootNode() {
    return this.shadowRoot_;
  }

  /** @override */
  getUrl() {
    return this.url_;
  }

  /** @override */
  getBody() {
    return this.body_;
  }

  /**
   * @param {!Element} body
   * @private
   */
  setBody_(body) {
    dev().assert(!this.body_, 'Duplicate body');
    this.body_ = body;
    this.bodyResolver_(body);
    this.bodyResolver_ = undefined;
    this.bodyPromise_ = undefined;
  }

  /** @override */
  onBody(callback) {
    if (this.body_) {
      callback(this.body_);
    } else {
      dev().assert(this.bodyPromise_).then(body => callback(body));
    }
  }

  /** @override */
  isReady() {
    return this.ready_;
  }

  /** @private */
  setReady_() {
    dev().assert(!this.ready_, 'Duplicate ready state');
    this.ready_ = true;
    this.readyResolver_();
    this.readyResolver_ = undefined;
    this.readyPromise_ = undefined;
  }

  /** @override */
  onReady(callback) {
    if (this.ready_) {
      callback();
    } else {
      dev().assert(this.readyPromise_).then(() => callback());
    }
  }
}


/**
 * Install the ampdoc service and immediately configure it for either a
 * single-doc or a shadow-doc mode. The mode cannot be changed after the
 * initial configuration.
 * @param {!Window} win
 * @param {boolean} isSingleDoc
 * @return {!AmpDocService}
 */
export function installDocService(win, isSingleDoc) {
  return getService(win, 'ampdoc', () => {
    return new AmpDocService(win, isSingleDoc);
  });
};
