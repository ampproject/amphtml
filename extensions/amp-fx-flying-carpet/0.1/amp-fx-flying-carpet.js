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

import {AmpEvents} from '../../../src/amp-events';
import {CSS} from '../../../build/amp-fx-flying-carpet-0.1.css';
import {Layout} from '../../../src/layout';
import {dev, user} from '../../../src/log';
import {listen} from '../../../src/event-helper';
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
     * @type{!Array<!Element>}
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

    this.firstLayoutCompleted_ = false;
  }


  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  buildCallback() {
    const doc = this.element.ownerDocument;
    const container = doc.createElement('div');

    this.children_ = this.getRealChildren();
    this.container_ = container;

    const childNodes = this.getRealChildNodes();
    this.totalChildren_ = this.visibileChildren_(childNodes).length;

    this.children_.forEach(child => this.setAsOwner(child));

    const clip = doc.createElement('div');
    clip.setAttribute('class', 'i-amphtml-fx-flying-carpet-clip');
    container.setAttribute('class', 'i-amphtml-fx-flying-carpet-container');

    childNodes.forEach(child => container.appendChild(child));
    clip.appendChild(container);
    this.element.appendChild(clip);

    // Make the fixed-layer track the container, but never transfer it out of
    // this DOM tree. Tracking allows us to compensate for the Viewer's header,
    // but transferring would break the clipping UI.
    this.getViewport().addToFixedLayer(container, /* opt_forceTransfer */false);
  }

  /** @override */
  onMeasureChanged() {
    const width = this.getLayoutWidth();
    this.mutateElement(() => {
      setStyle(this.container_, 'width', width, 'px');
    });
    if (this.firstLayoutCompleted_) {
      this.scheduleLayout(this.children_);
      listen(this.element, AmpEvents.BUILT, this.layoutBuiltChild_.bind(this));
    }
  }

  /** @override */
  viewportCallback(inViewport) {
    this.updateInViewport(this.children_, inViewport);
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
    user().assert(
        layoutBox.top >= minTop,
        '<amp-fx-flying-carpet> elements must be positioned after the 75% of' +
      ' first viewport: %s Current position: %s. Min: %s',
        this.element,
        layoutBox.top,
        minTop);
    user().assert(
        layoutBox.top <= maxTop,
        '<amp-fx-flying-carpet> elements must be positioned before the last ' +
      'viewport: %s Current position: %s. Max: %s',
        this.element,
        layoutBox.top,
        maxTop);
  }

  /** @override */
  layoutCallback() {
    try {
      this.assertPosition_();
    } catch (e) {
      // Collapse the element if the effect is broken by the viewport location.
      this./*OK*/collapse();
      throw e;
    }
    this.scheduleLayout(this.children_);
    listen(this.element, AmpEvents.BUILT, this.layoutBuiltChild_.bind(this));
    this.firstLayoutCompleted_ = true;
    return Promise.resolve();
  }

  /**
   * Listens for children element to be built, and schedules their layout.
   * Necessary since not all children will be built by the time the
   * flying-carpet has its #layoutCallback called.
   * @param {!Event} event
   * @private
   */
  layoutBuiltChild_(event) {
    const child = dev().assertElement(event.target);
    if (child.getOwner() === this.element) {
      this.scheduleLayout(child);
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
   * Determines the child nodes that are "visible". We purposefully ignore Text
   * nodes that only contain whitespace since they do not contribute anything
   * visually, only their surrounding Elements or non-whitespace Texts do.
   * @param {!Array<!Node>} nodes
   * @private
   */
  visibileChildren_(nodes) {
    return nodes.filter(node => {
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


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpFlyingCarpet, CSS);
});
