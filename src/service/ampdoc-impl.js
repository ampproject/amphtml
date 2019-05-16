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
import {
  DocRootImpl,
  setDocRootBodyAvailable,
  setDocRootReady,
} from '../runtime/docroot-impl';
import {Signals} from '../utils/signals';
import {VisibilityState} from '../visibility-state';
import {dev, devAssert} from '../log';
import {getParentWindowFrameElement, registerServiceBuilder} from '../service';
import {getShadowRootNode} from '../shadow-embed';
import {isDocumentReady, onDocumentReady} from '../document-ready';
import {isExperimentOn} from '../experiments';
import {waitForBodyOpen} from '../dom';

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
      this.singleDoc_ = new AmpDoc(createDocRootForDocument(win.document));
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
    const ampdoc = new AmpDoc(createDocRootForShadowRoot(url, shadowRoot));
    shadowRoot[AMPDOC_PROP] = ampdoc;
    return ampdoc;
  }

  /**
   * @param {!Document} doc
   * @param {string} url
   * @return {!DocRoot}
   */
  createDocRootForIframe(doc, url) {
    return createDocRootForIframeDocument(doc, url);
  }
}

/**
 * TODO(dvoytenko): deprecate and remove in preference of docroot.
 *
 * This class represents a single ampdoc. `AmpDocService` can contain only one
 * global ampdoc or multiple, depending on the runtime mode: single-doc or
 * shadow-doc.
 * @abstract
 * @package
 */
export class AmpDoc {
  /**
   * @param {!../api/docroot.DocRoot} docroot
   * @param {boolean} isSingleDoc
   */
  constructor(docroot, isSingleDoc) {
    /** @private @const {!../api/docroot.DocRoot} */
    this.docroot_ = docroot;

    /** @private @const {boolean} */
    this.isSingleDoc_ = isSingleDoc;

    /** @public @const {!Window} */
    this.win = docroot.win;

    /** @private @const {!Array<string>} */
    this.declaredExtensions_ = [];
  }

  /**
   * @return {!DocRoot}
   */
  getDocRoot() {
    return this.docroot_;
  }

  /**
   * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
   * mode that supports multiple documents per a single window.
   * @return {boolean}
   */
  isSingleDoc() {
    return this.isSingleDoc_;
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
    return this.docroot_.signals;
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
    return this.docroot_.rootNode;
  }

  /**
   * Returns the head node. It's either an element or a shadow root.
   * @return {!Element|!ShadowRoot}
   */
  getHeadNode() {
    return this.docroot_.head;
  }

  /**
   * Returns `true` if the ampdoc's body is available.
   *
   * @return {boolean}
   */
  isBodyAvailable() {
    return !!this.docroot_.bodyIfAvailable;
  }

  /**
   * Returns the ampdoc's body. Requires the body to already be available.
   *
   * See `isBodyAvailable` and `waitForBodyOpen`.
   *
   * @return {!Element}
   */
  getBody() {
    return this.docroot_.body;
  }

  /**
   * Returns a promise that will be resolved when the ampdoc's body is
   * available.
   * @return {!Promise<!Element>}
   */
  waitForBodyOpen() {
    return this.docroot_.waitForBodyOpen();
  }

  /**
   * Returns `true` if document is ready.
   *
   * See `whenReady`.
   *
   * @return {boolean}
   */
  isReady() {
    return this.docroot_.ready;
  }

  /**
   * Returns a promise that will be resolved when the ampdoc's DOM is fully
   * ready.
   * @return {!Promise}
   */
  whenReady() {
    return this.docroot_.whenReady();
  }

  /**
   * Returns the URL from which the document was loaded.
   * @return {string}
   */
  getUrl() {
    return this.docroot_.url;
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
    return this.docroot_.getElementById(id);
  }

  /**
   * Whether the node is currently contained in the DOM of the root.
   * @param {?Node} node
   * @return {boolean}
   */
  contains(node) {
    return this.docroot_.contains(node);
  }
}


/**
 * @param {!Document} doc
 * @return {!DocRoot}
 */
function createDocRootForDocument(doc) {
  const docroot = new DocRootImpl(doc, {
    // Visibility state will be updated by the viewer for now.
    visibilityState: VisibilityState.HIDDEN,
    ready: isDocumentReady(doc),
  });
  onDocumentReady(doc, () => setDocRootReady(docroot));
  waitForBodyOpen(doc, () => setDocRootBodyAvailable(docroot));
  return docroot;
}


/**
 * @param {!Document} doc
 * @param {string} url
 * @return {!DocRoot}
 */
function createDocRootForIframeDocument(doc, url) {
  const docroot = new DocRootImpl(doc, {
    url,
    // Visibility state will be updated by the viewer for now.
    visibilityState: VisibilityState.HIDDEN,
    ready: false,
  });
  waitForBodyOpen(doc, () => setDocRootBodyAvailable(docroot));
  return docroot;
}


/**
 * @param {string} url
 * @param {!ShadowRoot} shadowRoot
 * @return {!DocRoot}
 */
function createDocRootForShadowRoot(url, shadowRoot) {
  const docroot = new DocRootImpl(shadowRoot, {
    url,
    // Visibility state will be updated by the viewer for now.
    visibilityState: VisibilityState.HIDDEN,
    ready: false,
  });
  return docroot;
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
