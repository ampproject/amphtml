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

import {Deferred} from '../utils/promise';
import {Signals} from '../utils/signals';
import {dev, devAssert} from '../log';
import {getParentWindowFrameElement, registerServiceBuilder} from '../service';
import {getShadowRootNode} from '../shadow-embed';
import {isDocumentReady, whenDocumentReady} from '../document-ready';
import {isExperimentOn} from '../experiments';
import {waitForBodyOpenPromise} from '../dom';

/** @const {string} */
const AMPDOC_PROP = '__AMPDOC';

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

    /** @private @const */
    this.alwaysClosestAmpDoc_ = isExperimentOn(win, 'ampdoc-closest');
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
   * instance is returned, unless specfically looking for a closer `AmpDoc`.
   * Otherwise, this method locates the `AmpDoc` that contains the specified
   * node and, if necessary, initializes it.
   *
   * TODO(#17614): We should always look for the closest AmpDoc (make
   * closestAmpDoc always true).
   *
   * @param {!Node=} opt_node
   * @param {{
   *  closestAmpDoc: boolean
   * }=} opt_options
   * @return {?AmpDoc}
   */
  getAmpDocIfAvailable(opt_node = undefined, {closestAmpDoc = false} = {}) {
    // Single document: return it immediately.
    if (this.singleDoc_ && !closestAmpDoc && !this.alwaysClosestAmpDoc_) {
      return this.singleDoc_;
    }

    // TODO(sparhami) Should we always require a node to be passed? This will
    // make sure any functionality that works for a standalone AmpDoc works if
    // the AmpDoc is loaded in a shadow doc.
    if (!this.singleDoc_) {
      devAssert(opt_node);
    }
    // Otherwise discover and possibly create the ampdoc.
    let n = opt_node;
    while (n) {
      // A custom element may already have the reference. If we are looking
      // for the closest AmpDoc, the element might have a reference to the
      // global AmpDoc, which we do not want. This occurs when using
      // <amp-next-page>.
      if (n.ampdoc_ && (this.alwaysClosestAmpDoc_ || !closestAmpDoc)) {
        return n.ampdoc_;
      }

      // Traverse the boundary of a friendly iframe.
      const frameElement = getParentWindowFrameElement(n, this.win);
      if (frameElement) {
        n = frameElement;
        continue;
      }

      // Shadow doc.
      const shadowRoot = getShadowRootNode(n);
      if (!shadowRoot) {
        break;
      }

      const ampdoc = shadowRoot[AMPDOC_PROP];
      if (ampdoc) {
        return ampdoc;
      }
      n = shadowRoot.host;
    }

    // If we were looking for the closest AmpDoc, then fall back to the single
    // doc if there is no other AmpDoc that is closer.
    if (this.singleDoc_) {
      return this.singleDoc_;
    }

    return null;
  }

  /**
   * Returns the instance of the ampdoc (`AmpDoc`) that contains the specified
   * node. If the runtime is in the single-doc mode, the one global `AmpDoc`
   * instance is returned, unless specfically looking for a closer `AmpDoc`.
   * Otherwise, this method locates the `AmpDoc` that contains the specified
   * node and, if necessary, initializes it.
   *
   * An Error is thrown in development if no `AmpDoc` is found.
   * @param {!Node=} opt_node
   * @param {{
   *  closestAmpDoc: boolean
   * }=} opt_options
   * @return {!AmpDoc}
   */
  getAmpDoc(opt_node, opt_options) {
    // Ensure that node is attached if specified. This check uses a new and
    // fast `isConnected` API and thus only checked on platforms that have it.
    // See https://www.chromestatus.com/feature/5676110549352448.
    if (opt_node) {
      devAssert(
        opt_node['isConnected'] === undefined ||
          opt_node['isConnected'] === true,
        'The node must be attached to request ampdoc.'
      );
    }

    const ampdoc = this.getAmpDocIfAvailable(opt_node, opt_options);
    if (!ampdoc) {
      throw dev().createError('No ampdoc found for', opt_node);
    }

    return ampdoc;
  }

  /**
   * Creates and installs the ampdoc for the shadow root.
   * @param {string} url
   * @param {!ShadowRoot} shadowRoot
   * @return {!AmpDocShadow}
   * @restricted
   */
  installShadowDoc(url, shadowRoot) {
    devAssert(
      !shadowRoot[AMPDOC_PROP],
      'The shadow root already contains ampdoc'
    );
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
    return /** @type {?} */ (devAssert(null, 'not implemented'));
  }

  /**
   * DO NOT CALL. Retained for backward compat during rollout.
   * @return {!Window}
   * @deprecated Use `ampdoc.win` instead.
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
   * Adds a declared extension to an ampdoc.
   * @param {string} extensionId
   * @restricted
   */
  declareExtension(extensionId) {
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
    return /** @type {?} */ (devAssert(null, 'not implemented'));
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
    return /** @type {?} */ (devAssert(false, 'not implemented'));
  }

  /**
   * Returns the ampdoc's body. Requires the body to already be available.
   *
   * See `isBodyAvailable` and `waitForBodyOpen`.
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
  waitForBodyOpen() {
    return /** @type {?} */ (devAssert(null, 'not implemented'));
  }

  /**
   * Returns `true` if document is ready.
   *
   * See `whenReady`.
   *
   * @return {boolean}
   */
  isReady() {
    return /** @type {?} */ (devAssert(null, 'not implemented'));
  }

  /**
   * Returns a promise that will be resolved when the ampdoc's DOM is fully
   * ready.
   * @return {!Promise}
   */
  whenReady() {
    return /** @type {?} */ (devAssert(null, 'not implemented'));
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
    super(win);

    /** @private @const {!Promise<!Element>} */
    this.bodyPromise_ = this.win.document.body
      ? Promise.resolve(this.win.document.body)
      : waitForBodyOpenPromise(this.win.document).then(() => this.getBody());

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
  waitForBodyOpen() {
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
    super(win);
    /** @private @const {string} */
    this.url_ = url;
    /** @private @const {!ShadowRoot} */
    this.shadowRoot_ = shadowRoot;

    /** @private {?Element} */
    this.body_ = null;

    const bodyDeferred = new Deferred();

    /** @private {!Promise<!Element>} */
    this.bodyPromise_ = bodyDeferred.promise;

    /** @private {function(!Element)|undefined} */
    this.bodyResolver_ = bodyDeferred.resolve;

    /** @private {boolean} */
    this.ready_ = false;

    const readyDeferred = new Deferred();

    /** @private {!Promise} */
    this.readyPromise_ = readyDeferred.promise;

    /** @private {function()|undefined} */
    this.readyResolver_ = readyDeferred.resolve;
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
   * Signals that the shadow doc has a body.
   * @param {!Element} body
   * @restricted
   */
  setBody(body) {
    devAssert(!this.body_, 'Duplicate body');
    this.body_ = body;
    this.bodyResolver_(body);
    this.bodyResolver_ = undefined;
  }

  /** @override */
  waitForBodyOpen() {
    return this.bodyPromise_;
  }

  /** @override */
  isReady() {
    return this.ready_;
  }

  /**
   * Signals that the shadow doc is ready.
   * @restricted
   */
  setReady() {
    devAssert(!this.ready_, 'Duplicate ready state');
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
 * Install the ampdoc service and immediately configure it for either a
 * single-doc or a shadow-doc mode. The mode cannot be changed after the
 * initial configuration.
 * @param {!Window} win
 * @param {boolean} isSingleDoc
 */
export function installDocService(win, isSingleDoc) {
  registerServiceBuilder(win, 'ampdoc', function() {
    return new AmpDocService(win, isSingleDoc);
  });
}
