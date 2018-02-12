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

import {Signals} from '../utils/signals';
import {dev} from '../log';
import {
  getParentWindowFrameElement,
  registerServiceBuilder,
} from '../service';
import {getShadowRootNode} from '../shadow-embed';
import {isDocumentReady, whenDocumentReady} from '../document-ready';
import {waitForBodyPromise} from '../dom';

/** @const {string} */
const AMPDOC_PROP = '__AMPDOC';


/**
 * Adds a declared extension to an ampdoc.
 * @param {!AmpDoc} ampdoc
 * @param {string} extensionId
 * @restricted
 */
export function declareExtension(ampdoc, extensionId) {
  ampdoc.declareExtension_(extensionId);
}


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
 * Creates and installs an ampdoc for the shell in shadow-doc mode.
 * `AmpDocShell` is a subclass of `AmpDocShadow` that is installed for
 * `window.document` and allows to use AMP components as part of the shell,
 * outside shadow roots
 *
 * Currently guarded by 'ampdoc-shell' experiment
 *
 * @param {!AmpDocService} ampdocService
 * @returns {!AmpDocShell}
 */
export function installShadowDocForShell(ampdocService) {
  return ampdocService.installShellShadowDoc_();
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

    /** @private {?AmpDoc} */
    this.singleDoc_ = null;
    if (isSingleDoc) {
      this.singleDoc_ = new AmpDocSingle(win);
    }

    /** Guarded by 'ampdoc-shell' experiment
     * @private {?AmpDocShell}
     */
    this.shellShadowDoc_ = null;
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
   * Whether if an `AmpDocShell` has been installed for the runtime.
   * @returns {boolean}
   */
  hasAmpDocShell() {
    return !!this.shellShadowDoc_;
  }

  /**
   * Returns the instance of the ampdoc (`AmpDoc`) that contains the specified
   * node. If the runtime is in the single-doc mode, the one global `AmpDoc`
   * instance is always returned. Otherwise, this method locates the `AmpDoc`
   * that contains the specified node and, if necessary, initializes it.
   *
   * @param {!Node=} opt_node
   * @return {!AmpDoc}
   */
  getAmpDoc(opt_node) {
    // Ensure that node is attached if specified. This check uses a new and
    // fast `isConnected` API and thus only checked on platforms that have it.
    // See https://www.chromestatus.com/feature/5676110549352448.
    if (opt_node) {
      dev().assert(
          opt_node['isConnected'] === undefined ||
          opt_node['isConnected'] === true,
          'The node must be attached to request ampdoc.');
    }

    // Single document: return it immediately.
    if (this.singleDoc_ &&
        (!opt_node ||
            (opt_node.ownerDocument || opt_node).defaultView == this.win)) {
      return this.singleDoc_;
    }

    // Multiple documents and AmpDocShell requested
    if (opt_node === this.win.document) {
      if (this.shellShadowDoc_) {
        return this.shellShadowDoc_;
      } else {
        throw dev().createError('Ampdoc for shell has not been installed');
      }
    }

    dev().assert(opt_node);

    // Multi-doc: discover the ampdoc via DOM hierarchy.
    let n = opt_node;
    while (n) {
      // A custom element may already have the reference to the ampdoc.
      if (n.ampdoc_) {
        return n.ampdoc_;
      }

      // Shadow root.
      const shadowRoot = getShadowRootNode(n);
      if (shadowRoot) {
        const ampdoc = shadowRoot[AMPDOC_PROP];
        if (ampdoc) {
          return ampdoc;
        }
        // Traverse the boundary of a shadow root.
        n = shadowRoot.host;
        continue;
      }

      // FIE root.
      const docRoot = (n.ownerDocument || n);
      if (docRoot) {
        const ampdoc = docRoot[AMPDOC_PROP];
        if (ampdoc) {
          return ampdoc;
        }
        // Traverse the boundary of a friendly iframe.
        n = getParentWindowFrameElement(docRoot, this.win);
        continue;
      }
    }

    // If not inside a shadow root or a FIE, it may belong to AmpDocShell
    if (this.shellShadowDoc_) {
      return this.shellShadowDoc_;
    }

    throw dev().createError('No ampdoc found for', opt_node);
  }

  /**
   * Creates and installs the ampdoc for the shadow root.
   * @param {string} url
   * @param {!ShadowRoot} shadowRoot
   * @return {!AmpDocShadow}
   * @private
   */
  installShadowDoc_(url, shadowRoot) {
    dev().assert(!shadowRoot[AMPDOC_PROP],
        'The shadow root already contains ampdoc');
    return new AmpDocShadow(this.win, url, shadowRoot);
  }

  /**
   * Creates and installs an ampdoc for the shell in shadow-doc mode
   * @return {!AmpDocShell}
   * @private
   */
  installShellShadowDoc_() {
    dev().assert(this.singleDoc_ === null,
        'AmpDocShell cannot be installed in single-doc mode');
    this.shellShadowDoc_ = new AmpDocShell(this.win);
    this.win.document[AMPDOC_PROP] = this.shellShadowDoc_;

    whenDocumentReady(this.win.document).then(document => {
      this.shellShadowDoc_.setBody_(dev().assertElement(document.body));
      this.shellShadowDoc_.setReady_();
    });

    return this.shellShadowDoc_;
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
   * @param {?AmpDoc} parent
   */
  constructor(win, parent) {
    /** @public @const {!Window} */
    this.win = win;

    /** @public @const {?AmpDoc} */
    this.parent = parent;

    /** @private @const */
    this.signals_ = new Signals();

    /** @private @const {!Array<string>} */
    this.declaredExtensions_ = [];
  }

  /**
   * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
   * mode that supports multiple documents per a single window.
   * @return {boolean}
   */
  isSingleDoc() {
    return /** @type {?} */ (dev().assert(null, 'not implemented'));
  }

  /**
   * DO NOT CALL. Retained for backward compat during rollout.
   * @return {!Window}
   * @deprecated. Use `ampdoc.win` instead.
   */
  getWin() {
    return this.win;
  }

  /** @return {!Signals} */
  signals() {
    return this.signals_;
  }

  /**
   * Returns whether the specified extension has been declared on this ampdoc.
   * @param {string} extensionId
   * @return {boolean}
   */
  declaresExtension(extensionId) {
    return this.declaredExtensions_.indexOf(extensionId) != -1;
  }

  /**
   * @param {string} extensionId
   * @private
   * @restricted
   */
  declareExtension_(extensionId) {
    if (!this.declaresExtension(extensionId)) {
      this.declaredExtensions_.push(extensionId);
    }
  }

  /**
   * Returns the root node for this ampdoc. It will either be a `Document` for
   * the single-doc runtime mode, or a `ShadowRoot` for shadow-doc mode. This
   * node can be used, among other things, to add ampdoc-wide event listeners.
   *
   * @return {!Document|!ShadowRoot}
   */
  getRootNode() {
    return /** @type {?} */ (dev().assert(null, 'not implemented'));
  }

  /**
   * Returns the head node. It's either an element or a shadow root.
   * @return {!Element|!ShadowRoot}
   * @abstract
   */
  getHeadNode() {}

  /**
   * Returns `true` if the ampdoc's body is available.
   *
   * @return {boolean}
   */
  isBodyAvailable() {
    return /** @type {?} */ (dev().assert(false, 'not implemented'));
  }

  /**
   * Returns the ampdoc's body. Requires the body to already be available.
   *
   * See `isBodyAvailable` and `whenBodyAvailable`.
   *
   * @return {!Element}
   */
  getBody() {
    return dev().assertElement(null, 'not implemented');
  }

  /**
   * Returns a promise that will be resolved when the ampdoc's body is
   * available.
   * @return {!Promise<!Element>}
   */
  whenBodyAvailable() {
    return /** @type {?} */ (dev().assert(null, 'not implemented'));
  }

  /**
   * Returns `true` if document is ready.
   *
   * See `whenReady`.
   *
   * @return {boolean}
   */
  isReady() {
    return /** @type {?} */ (dev().assert(null, 'not implemented'));
  }

  /**
   * Returns a promise that will be resolved when the ampdoc's DOM is fully
   * ready.
   * @return {!Promise}
   */
  whenReady() {
    return /** @type {?} */ (dev().assert(null, 'not implemented'));
  }

  /**
   * Returns the URL from which the document was loaded.
   * @return {string}
   */
  getUrl() {
    return dev().assertString(null, 'not implemented');
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

  /**
   * Whether the node is currently contained in the DOM of the root.
   * @param {?Node} node
   * @return {boolean}
   */
  contains(node) {
    return this.getRootNode().contains(node);
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
    super(win, /* parent */ null);
    win.document[AMPDOC_PROP] = this;

    /** @private @const {!Promise<!Element>} */
    this.bodyPromise_ = this.win.document.body ?
      Promise.resolve(this.win.document.body) :
      waitForBodyPromise(this.win.document).then(() => this.getBody());

    /** @private @const {!Promise} */
    this.readyPromise_ = whenDocumentReady(this.win.document);
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
  getHeadNode() {
    return dev().assertElement(this.win.document.head);
  }

  /** @override */
  isBodyAvailable() {
    return !!this.win.document.body;
  }

  /** @override */
  getBody() {
    return dev().assertElement(this.win.document.body, 'body not available');
  }

  /** @override */
  whenBodyAvailable() {
    return this.bodyPromise_;
  }

  /** @override */
  isReady() {
    return isDocumentReady(this.win.document);
  }

  /** @override */
  whenReady() {
    return this.readyPromise_;
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
    super(win, /* parent */ null);
    shadowRoot[AMPDOC_PROP] = this;

    /** @private @const {string} */
    this.url_ = url;
    /** @private @const {!ShadowRoot} */
    this.shadowRoot_ = shadowRoot;

    /** @private {?Element} */
    this.body_ = null;

    /** @private {function(!Element)|undefined} */
    this.bodyResolver_ = undefined;

    /** @private {!Promise<!Element>} */
    this.bodyPromise_ = new Promise(resolve => {
      this.bodyResolver_ = resolve;
    });

    /** @private {boolean} */
    this.ready_ = false;

    /** @private {function()|undefined} */
    this.readyResolver_ = undefined;

    /** @private {!Promise} */
    this.readyPromise_ = new Promise(resolve => {
      this.readyResolver_ = resolve;
    });
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
  getHeadNode() {
    return this.shadowRoot_;
  }

  /** @override */
  isBodyAvailable() {
    return !!this.body_;
  }

  /** @override */
  getBody() {
    return dev().assertElement(this.body_, 'body not available');
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
  }

  /** @override */
  whenBodyAvailable() {
    return this.bodyPromise_;
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
  }

  /** @override */
  whenReady() {
    return this.readyPromise_;
  }
}


/**
 * AmpDocShadow for the shell
 * @package @visibleForTesting
 */
export class AmpDocShell extends AmpDocShadow {
  constructor(win) {
    super(win, win.location.href, win.document);
  }

  /** @override */
  getHeadNode() {
    return dev().assertElement(this.win.document.head);
  }
}

/**
 * Install the ampdoc service and immediately configure it for either a
 * single-doc or a shadow-doc mode. The mode cannot be changed after the
 * initial configuration.
 * @param {!Window} win
 * @param {boolean} isSingleDoc
 */
export function installDocService(win, isSingleDoc) {
  registerServiceBuilder(
      win,
      'ampdoc',
      function() {
        return new AmpDocService(win, isSingleDoc);
      });
}
