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

import {CSS} from '../../../build/amp-fx-flying-carpet-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {dev, userAssert} from '../../../src/log';
import {setStyle} from '../../../src/style';

const TAG = 'amp-fx-flying-carpet';

export class AmpFlyingCarpet extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * Preserved so that we may keep track of the "good" children. When an
     * element collapses, we remove it from the list.
     *
     * @type {!Array<!Element>}
     * @private
     */
    this.children_ = [];

    /**
     * The number of non-empty child nodes left that are still "good". If no
     * more are left, we attempt to collapse the flying carpet.
     * Note that this may not be the number for child elements, since Text also
     * appears inside the flying carpet.
     *
     * @type {number}
     * @private
     */
    this.totalChildren_ = 0;

    /**
     * A cached reference to the container, used to set its width to match
     * the flying carpet's.
     * @type {?Element}
     * @private
     */
    this.container_ = null;

    /** @private {boolean} */
    this.initialPositionChecked_ = false;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  buildCallback() {
    const doc = this.element.ownerDocument;
    const container = doc.createElement('div');

    this.children_ = this.getRealChildren();
    this.container_ = container;

    const childNodes = this.getRealChildNodes();
    this.totalChildren_ = this.visibileChildren_(childNodes).length;

    const owners = Services.ownersForDoc(this.element);
    this.children_.forEach((child) => owners.setOwner(child, this.element));

    const clip = doc.createElement('div');
    clip.setAttribute('class', 'i-amphtml-fx-flying-carpet-clip');
    container.setAttribute('class', 'i-amphtml-fx-flying-carpet-container');

    childNodes.forEach((child) => container.appendChild(child));
    clip.appendChild(container);
    this.element.appendChild(clip);

    // Make the fixed-layer track the container, but never transfer it out of
    // this DOM tree. Tracking allows us to compensate for the Viewer's header,
    // but transferring would break the clipping UI.
    this.getViewport().addToFixedLayer(
      container,
      /* opt_forceTransfer */ false
    );
  }

  /** @override */
  viewportCallback(inViewport) {
    Services.ownersForDoc(this.element).updateInViewport(
      this.element,
      this.children_,
      inViewport
    );
  }

  /**
   * Asserts that the flying carpet does not appear in the first or last
   * viewport.
   * @private
   */
  assertPosition_() {
    const layoutBox = this.element.getLayoutBox();
    const viewport = this.getViewport();
    const viewportHeight = viewport.getHeight();
    // TODO(jridgewell): This should really be the parent scroller, not
    // necessarily the root. But, flying carpet only works as a child of the
    // root scroller, for now.
    const docHeight = viewport.getScrollHeight();
    // Hmm, can the page height change and affect us?
    const minTop = viewportHeight * 0.75;
    const maxTop = docHeight - viewportHeight * 0.95;
    userAssert(
      layoutBox.top >= minTop,
      '<amp-fx-flying-carpet> elements must be positioned after the 75% of' +
        ' first viewport: %s Current position: %s. Min: %s',
      this.element,
      layoutBox.top,
      minTop
    );
    userAssert(
      layoutBox.top <= maxTop,
      '<amp-fx-flying-carpet> elements must be positioned before the last ' +
        'viewport: %s Current position: %s. Max: %s',
      this.element,
      layoutBox.top,
      maxTop
    );
  }

  /** @override */
  layoutCallback() {
    if (!this.initialPositionChecked_) {
      try {
        this.assertPosition_();
      } catch (e) {
        // Collapse the element if the effect is broken by the viewport location.
        this./*OK*/ collapse();
        throw e;
      }
      this.initialPositionChecked_ = true;
    }

    const width = this.element.getLayoutWidth();
    setStyle(this.container_, 'width', width, 'px');
    Services.ownersForDoc(this.element).scheduleLayout(
      this.element,
      this.children_
    );
    this.observeNewChildren_();
    return Promise.resolve();
  }

  /**
   * Makes sure we schedule layout for elements as they are added
   * to the flying carpet.
   * @private
   */
  observeNewChildren_() {
    const observer = new MutationObserver((changes) => {
      for (let i = 0; i < changes.length; i++) {
        const {addedNodes} = changes[i];
        if (!addedNodes) {
          continue;
        }
        for (let n = 0; n < addedNodes.length; n++) {
          const node = addedNodes[n];
          if (!node.signals) {
            continue;
          }
          node
            .signals()
            .whenSignal(CommonSignals.BUILT)
            .then(this.layoutBuiltChild_.bind(this, node));
        }
      }
    });
    observer.observe(this.element, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Listens for children element to be built, and schedules their layout.
   * Necessary since not all children will be built by the time the
   * flying-carpet has its #layoutCallback called.
   * @param {!Node} node
   * @private
   */
  layoutBuiltChild_(node) {
    const child = dev().assertElement(node);
    if (child.getOwner() === this.element) {
      Services.ownersForDoc(this.element).scheduleLayout(this.element, child);
    }
  }

  /** @override */
  collapsedCallback(child) {
    const index = this.children_.indexOf(child);
    if (index > -1) {
      this.children_.splice(index, 1);
      this.totalChildren_--;
      if (this.totalChildren_ == 0) {
        return this.attemptCollapse().catch(() => {});
      }
    }
  }

  /**
   * Returns our discovered children
   * @return {!Array<!Element>}
   */
  getChildren() {
    return this.children_;
  }

  /**
   * Determines the child nodes that are "visible". We purposefully ignore Text
   * nodes that only contain whitespace since they do not contribute anything
   * visually, only their surrounding Elements or non-whitespace Texts do.
   * @param {!Array<!Node>} nodes
   * @return {*} TODO(#23582): Specify return type
   * @private
   */
  visibileChildren_(nodes) {
    return nodes.filter((node) => {
      if (node.nodeType === /* Element */ 1) {
        return true;
      }

      if (node.nodeType === /* Text */ 3) {
        // Is there a non-whitespace character?
        return /\S/.test(node.textContent);
      }

      return false;
    });
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpFlyingCarpet, CSS);
});
