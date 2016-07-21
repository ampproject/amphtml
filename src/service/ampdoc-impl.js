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

/** @const {string} */
const AMPDOC_PROP = '__AMPDOC';


/**
 * Creates and installs the ampdoc for the shadow root.
 * @param {!AmpDocService} ampdocService
 * param {!ShadowRoot} shadowRoot
 * @return {!AmpDoc}
 * @restricted
 */
export function installShadowDoc(ampdocService, shadowRoot) {
  return ampdocService.installShadowDoc_(shadowRoot);
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

    throw dev.createError('No ampdoc found for', node);
  }

  /**
   * Creates and installs the ampdoc for the shadow root.
   * @param {!ShadowRoot} shadowRoot
   * @return {!AmpDoc}
   * @private
   */
  installShadowDoc_(shadowRoot) {
    dev.assert(!shadowRoot[AMPDOC_PROP],
        'The shadow root already contains ampdoc');
    const ampdoc = new AmpDocShadow(this.win, shadowRoot);
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
   * Whether the runtime in the single-doc mode. Alternative is the shadow-doc
   * mode that supports multiple documents per a single window.
   * @return {boolean}
   */
  isSingleDoc() {
    return dev.assert(null, 'not implemented');
  }

  /**
   * Returns the root node for this ampdoc. It will either be a `Document` for
   * the single-doc runtime mode, or a `ShadowRoot` for shadow-doc mode. This
   * node can be used, among other things, to add ampdoc-wide event listeners.
   *
   * @return {!Document|!ShadowRoot}
   */
  getRootNode() {
    return dev.assert(null, 'not implemented');
  }

  /**
   * DO NOT CALL. Retained for backward compat during rollout.
   * @return {!Window}
   */
  getWin() {
    return dev.assert(null, 'not implemented');
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
    super();
    /** @public @const {!Window} */
    this.win = win;
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
}


/**
 * The version of `AmpDoc` in the shadow-doc mode that is allocated for each
 * ampdoc hosted within a shadow root.
 * @package @visibleForTesting
 */
export class AmpDocShadow extends AmpDoc {
  /**
   * @param {!Window} win
   * @param {!ShadowRoot} shadowRoot
   */
  constructor(win, shadowRoot) {
    super();
    /** @const {!Window} */
    this.win = win;
    /** @private @const {!ShadowRoot} */
    this.shadowRoot_ = shadowRoot;
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
