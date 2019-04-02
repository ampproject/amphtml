/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Observable} from '../observable';
import {
  installServiceInEmbedScope,
  registerServiceBuilderForDoc,
} from '../service';

/**
 * MutationObserverInit options to listen for mutations to the `hidden`
 * attribute.
 */
const OBSERVER_OPTIONS = {
  attributes: true,
  attributeFilter: ['hidden'],
  subtree: true,
};

/**
 * A document level service that will listen for mutations on the `hidden`
 * attribute and notify listeners. The `hidden` attribute is used to toggle
 * `display: none` on elements.
 * @implements {../../../src/service.EmbeddableService}
 * @implements {../../../src/service.Disposable}
 */
export class HiddenObserver {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {(!Document|!ShadowRoot)=} opt_root
   */
  constructor(ampdoc, opt_root) {
    /** @const {!Document|!ShadowRoot} */
    this.root_ = opt_root || ampdoc.getRootNode();

    /** @const {!Window} */
    this.win_ = (opt_root ? opt_root.ownerDocument : this.root_).defaultView;

    /** @private {?MutationObserver} */
    this.mutationObserver_ = null;

    /** @private {?Observable<!Array<!MutationRecord>>} */
    this.observable_ = null;
  }

  /** @override @nocollapse */
  static installInEmbedWindow(embedWin, ampdoc) {
    installServiceInEmbedScope(embedWin, 'hidden-observer',
        new HiddenObserver(ampdoc, embedWin.document));
  }

  /**
   * Adds the observer to this instance.
   * @param {function(!Array<!MutationRecord>)} handler Observer's handler.
   * @return {!UnlistenDef}
   */
  add(handler) {
    this.init_();

    const remove = this.observable_.add(handler);
    return () => {
      remove();
      if (this.observable_.getHandlerCount() === 0) {
        this.dispose();
      }
    };
  }

  /**
   * Initializes the mutation observer and observable.
   */
  init_() {
    if (this.mutationObserver_) {
      return;
    }
    this.observable_ = new Observable();

    const mo = new this.win_.MutationObserver(mutations => {
      this.observable_.fire(mutations);
    });
    this.mutationObserver_ = mo;
    mo.observe(this.root_, OBSERVER_OPTIONS);
  }

  /**
   * Cleans up the all the mutation observer once the last listener stops
   * listening, or when the service's doc is disposing.
   */
  dispose() {
    if (!this.mutationObserver_) {
      return;
    }
    this.mutationObserver_.disconnect();
    this.observable_.removeAll();
    this.mutationObserver_ = null;
    this.observable_ = null;
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installHiddenObserverForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'hidden-observer', HiddenObserver);
}
