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
import {Layout} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';
import {dev, user} from '../../../src/log';
import {toggle, setStyle} from '../../../src/style';

/** @const */
const EXPERIMENT = 'amp-fx-flying-carpet';

class AmpFlyingCarpet extends AMP.BaseElement {

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
  }


  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  buildCallback() {
    if (!isExperimentOn(this.win, EXPERIMENT)) {
      dev().warn(EXPERIMENT, `Experiment ${EXPERIMENT} disabled`);
      toggle(this.element, false);
      return;
    }

    const doc = this.element.ownerDocument;
    const container = doc.createElement('div');

    this.children_ = this.getRealChildren();
    this.container_ = container;

    const childNodes = this.getRealChildNodes();
    this.totalChildren_ = this.visibileChildren_(childNodes).length;

    this.children_.forEach(child => this.setAsOwner(child));

    const clip = doc.createElement('div');
    clip.setAttribute('class', '-amp-fx-flying-carpet-clip');
    container.setAttribute('class', '-amp-fx-flying-carpet-container');

    childNodes.forEach(child => container.appendChild(child));
    clip.appendChild(container);
    this.element.appendChild(clip);

    this.getViewport().addToFixedLayer(container);
  }

  onLayoutMeasure() {
    const width = this.getLayoutWidth();
    this.getVsync().mutate(() => {
      setStyle(this.container_, 'width', width, 'px');
    });
  }

  viewportCallback(inViewport) {
    this.updateInViewport(this.children_, inViewport);
  }

  assertPosition() {
    const layoutBox = this.element.getLayoutBox();
    const viewport = this.getViewport();
    const viewportHeight = viewport.getHeight();
    const docHeight = viewport.getScrollHeight();
    // Hmm, can the page height change and affect us?
    user().assert(
      layoutBox.top >= viewportHeight,
      '<amp-fx-flying-carpet> elements must be positioned after the first ' +
      'viewport: %s Current position: %s. Min: %s',
      this.element,
      layoutBox.top,
      viewportHeight
    );
    user().assert(
      layoutBox.bottom <= docHeight - viewportHeight,
      '<amp-fx-flying-carpet> elements must be positioned before the last ' +
      'viewport: %s Current position: %s. Max: %s',
      this.element,
      layoutBox.bottom,
      docHeight - viewportHeight
    );
  }

  layoutCallback() {
    try {
      this.assertPosition();
    } catch (e) {
      // Collapse the element if the effect is broken by the viewport location.
      this./*OK*/collapse();
      throw e;
    }
    this.scheduleLayout(this.children_);
    return Promise.resolve();
  }

  collapsedCallback(child) {
    const index = this.children_.indexOf(child);
    if (index > -1) {
      this.children_.splice(index, 1);
      this.totalChildren_--;
      if (this.totalChildren_ == 0) {
        return this.attemptChangeHeight(0).then(() => {
          this./*OK*/collapse();
        }, () => {});
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

AMP.registerElement('amp-fx-flying-carpet', AmpFlyingCarpet, CSS);
