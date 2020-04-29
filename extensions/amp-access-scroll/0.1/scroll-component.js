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

import {Services} from '../../../src/services';
import {assertDoesNotContainDisplay, px, setStyles} from '../../../src/style';
import {createElementWithAttributes} from '../../../src/dom';
import {devAssert} from '../../../src/log';
import {hasOwn} from '../../../src/utils/object';

/** @abstract */
export class ScrollComponent {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} doc
   */
  constructor(doc) {
    /** @protected {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.doc_ = doc;

    /** @protected @property {?function(Window):undefined} */
    this.setWindow_ = null;

    /** @protected {?Element} */
    this.root_ = null;

    /** @protected {?HTMLIFrameElement} */
    this.frame_ = null;

    /** @protected {ScrollComponent.HorizontalLayout} */
    this.layout_ = {
      'width': null,
      'left': null,
      'right': null,
    };

    /** @type {Promise<Window>} */
    this.window = new Promise((resolve) => {
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
      children.forEach((c) => e.appendChild(c));
    }
    return e;
  }

  /**
   * Add element to doc and promote to fixed layer.
   * @protected
   * */
  mount() {
    const root = devAssert(this.root_);
    this.doc_.getBody().appendChild(root);
    Services.viewportForDoc(this.doc_).addToFixedLayer(root);
  }

  /**
   * Enqueues a DOM mutation managed by the window's Vsync
   * @param {function():undefined} mutator
   * @protected
   */
  mutate(mutator) {
    Services.vsyncFor(this.doc_.win).mutate(mutator);
  }

  /**
   *
   * @param {string} className
   * @param {boolean} condition
   * @protected
   */
  toggleClass(className, condition) {
    const classes = devAssert(this.root_).classList;
    if (condition) {
      classes.add(className);
    } else {
      classes.remove(className);
    }
  }

  /**
   * @param {Object} updates
   * @return {boolean} true if changed
   * @protected
   */
  updateHorizontalLayout(updates) {
    let changed = false;
    // only update styles already set in the layout, updates in place
    Object.keys(this.layout_).forEach((key) => {
      if (!hasOwn(updates, key)) {
        return;
      }
      const size = this.cssSize(updates[key]);
      if (this.layout_[key] !== size) {
        this.layout_[key] = size;
        changed = true;
      }
    });
    return changed;
  }

  /**
   * This method should only be called inside of a mutate() callback.
   *
   * @protected
   */
  renderHorizontalLayout() {
    setStyles(devAssert(this.root_), assertDoesNotContainDisplay(this.layout_));
  }

  /**
   * @param {string|number} size
   * @return {string}
   */
  cssSize(size) {
    return typeof size === 'number' ? px(size) : size;
  }
}

/**
 * Anything affecting vertical layout (height, top, bottom) is ommitted.
 * @typedef {{
 *    width: ?string,
 *    left: ?string,
 *    right: ?string
 * }}
 */
ScrollComponent.HorizontalLayout;
