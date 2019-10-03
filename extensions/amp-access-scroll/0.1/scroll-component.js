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

import {Services} from '../../../src/services';
import {createElementWithAttributes} from '../../../src/dom';

/** @abstract */
export class ScrollComponent {
  /** @param {!../../../src/service/ampdoc-impl.AmpDoc} doc */
  constructor(doc) {
    /** @protected {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.doc_ = doc;

    /** @protected @property {?function(Window):undefined} */
    this.setWindow_ = null;
    /** @protected {?HTMLIFrameElement} */
    this.frame_ = null;

    /** @type {Promise<Window>} */
    this.window = new Promise(resolve => {
      /** @protected */
      this.setWindow_ = resolve;
    });
  }

  /**
   * Create an element with attributes and optional children.
   * @param {string} elementName
   * @param {!JsonObject} attrs
   * @param {Array<Element>=} children
   * @return {!Element}
   * @protected
   */
  el(elementName, attrs, children) {
    const e = createElementWithAttributes(
      this.doc_.win.document,
      elementName,
      attrs
    );
    if (Array.isArray(children)) {
      children.forEach(c => e.appendChild(c));
    }
    return e;
  }

  /**
   * Add element to doc and promote to fixed layer.
   * @param {!Element} el
   * @protected
   * */
  mount_(el) {
    this.doc_.getBody().appendChild(el);
    Services.viewportForDoc(this.doc_).addToFixedLayer(el);
  }

  /**
   * Enqueues a DOM mutation managed by the window's Vsync
   * @param {function():undefined} mutator
   * @protected
   */
  mutate_(mutator) {
    Services.vsyncFor(this.doc_.win).mutate(mutator);
  }
}
