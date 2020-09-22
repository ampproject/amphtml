/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {hasNextNodeInDocumentOrder} from '../dom';
import {registerServiceBuilderForDoc} from '../service';
import {removeItem} from '../utils/array';

/**
 * @typedef {{
 *   readyToBuild: (boolean|undefined),
 *   domReady: (boolean|undefined),
 *   displayed: (boolean|undefined),
 * }}
 */
let ElementDataDef;

/**
 * This is Resources v2 but much more taregtted. It deals only with questions
 * of renderability.
 *
 * @implements {../service.Disposable}
 */
export class CustomElements {
  /**
   * @param {./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @private @const */
    this.displayTracker_ = new IntersectionObserver(
      this.handleDisplay_.bind(this),
      {
        root: ampdoc.getBody(),
      }
    );

    /** @private @const {!Map<!Element, !ElementDataDef>} */
    this.elements_ = new Map();

    /** @private @const {!Array<!AmpElement>} */
    this.pendingDomReady_ = [];

    ampdoc.whenReady().then(() => this.checkPendingDomReady_());
  }

  /** @override */
  dispose() {
    this.elements_.clear();
    this.pendingDomReady_.length = 0;
    this.displayTracker_.disconnect();
  }

  /**
   * @param {!AmpElement} element
   */
  connected(element) {
    if (!this.elements_.has(element)) {
      this.elements_.set(element, {});
    }
    if (this.ampdoc.isReady()) {
      this.update_(element, {domReady: true});
    } else if (!this.pendingDomReady_.includes(element)) {
      this.pendingDomReady_.push(element);
      this.checkPendingDomReady_();
    }
  }

  /**
   * @param {!AmpElement} element
   */
  disconnected(element) {
    this.elements_.delete(element);
    removeItem(this.pendingDomReady_, element);
    this.displayTracker_.unobserve(element);
  }

  /**
   * @param {!AmpElement} element
   */
  readyToBuild(element) {
    this.update_(element, {readyToBuild: true});
  }

  /**
   * @param {!AmpElement} element
   * @param {!ElementDataDef} data
   */
  update_(element, data) {
    const existingData = this.elements_.get(element);
    if (!existingData) {
      return;
    }
    Object.assign(existingData, data);
    console.log(
      'CustomElements.update_',
      element.nodeName + '#' + element.id,
      data,
      '=>',
      existingData
    );

    const {domReady, readyToBuild, displayed} = existingData;

    const trackDisplay = domReady && readyToBuild;
    if (trackDisplay) {
      this.displayTracker_.observe(element);
    } else {
      this.displayTracker_.unobserve(element);
    }

    element.displayedCallback(displayed);
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} records
   * @private
   */
  handleDisplay_(records) {
    records.forEach(({target, isIntersecting}) => {
      this.update_(target, {displayed: isIntersecting});
    });
  }

  /** @private */
  checkPendingDomReady_() {
    const root = this.ampdoc.getRootNode();
    const docReady = this.ampdoc.isReady();
    for (let i = 0; i < this.pendingDomReady_.length; i++) {
      const node = this.pendingDomReady_[i];
      if (docReady || hasNextNodeInDocumentOrder(node, root)) {
        // Remove resource before build to remove it from the pending list
        // in either case the build succeed or throws an error.
        this.pendingDomReady_.splice(i--, 1);
        this.update_(element, {domReady: true});
      }
    }
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installCustomElements(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'customElements', CustomElements);
}
