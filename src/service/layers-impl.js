/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {
  layoutRectLtwh,
  moveLayoutRect,
} from '../layout-rect';
import {computedStyle} from '../style';
import {registerServiceBuilderForDoc} from '../service';
import {viewportForDoc} from '../services';
import {dev} from '../log';

const LAYER_PROP_ = '__AMP__LAYER';


/**
 * Layers is the new home for everything having to do with an element's
 * size and position relative to its parent container.
 */
export class Layers {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @private @const {!./viewport-impl.Viewport} */
    this.viewport_ = viewportForDoc(ampdoc);
  }

  /**
   * @param {!AmpElement} element
   */
  add(element) {
    new LayerElement(element, this);
  }

  /**
   * @param {!AmpElement} unusedElement
   */
  remove(unusedElement) {
  }

  getViewport() {
    return this.viewport_;
  }


  /****************************
   * Ferrying to LayerElement *
   ****************************/

  /**
   * @param {!AmpElement} element
   * @return {!../layout-rect.LayoutRectDef}
   */
  remeasure(element) {
    return LayerElement.for(element).remeasure();
  }

  /**
   * @param {!AmpElement} element
   * @return {!../layout-rect.LayoutRectDef}
   */
  getPageLayoutBox(element) {
    return LayerElement.for(element).getPageLayoutBox();
  }

  /**
   * @param {!AmpElement} element
   * @return {!../layout-rect.LayoutRectDef}
   */
  getAbsoluteLayoutBox(element) {
    return LayerElement.for(element).getAbsoluteLayoutBox();
  }

  /**
   * @param {!AmpElement} element
   * @return {boolean}
   */
  isFixed(element) {
    return LayerElement.for(element).isFixed();
  }
}


/**
 * LayerElement (née Layout) caches and measures an element's layout rectangle.
 */
export class LayerElement {
  /**
   * @param {!AmpElement} element
   * @return {!LayerElement}
   */
  static for(element) {
    return /** @type {!LayerElement} */ (
        dev().assert(LayerElement.forOptional(element),
        'Missing layer prop on %s', element));
  }

  /**
   * @param {!AmpElement} element
   * @return {LayerElement}
   */
  static forOptional(element) {
    return /** @type {LayerElement} */ (element[LAYER_PROP_]);
  }


  /**
   * @param {!AmpElement} element
   */
  constructor(element, layers) {
    element[LAYER_PROP_] = this;

    /** @const {!AmpElement} */
    this.element_ = element;

    /** @const {!Layers} */
    this.layers_ = layers;

    /** @private {!../layout-rect.LayoutRectDef} */
    this.layoutBox_ = layoutRectLtwh(-10000, -10000, 0, 0);

    /** @private {boolean} */
    this.isFixed_ = false;
  }

  /**
   * Returns a previously measured layout box adjusted to absolute positioning.
   * Note that fixed-position elements change absolute positioning based on the
   * scroll position (they move with the scroll).
   * @return {!../layout-rect.LayoutRectDef}
   */
  getAbsoluteLayoutBox() {
    if (!this.isFixed()) {
      return this.layoutBox_;
    }

    const viewport = this.layers_.getViewport();
    return moveLayoutRect(this.layoutBox_, viewport.getScrollLeft(),
        viewport.getScrollTop());
  }

  /**
   * Returns a previously measured layout box relative to the page. The
   * fixed-position elements are relative to the top of the document.
   * @return {!../layout-rect.LayoutRectDef}
   */
  getPageLayoutBox() {
    return this.layoutBox_;
  }

  /**
   * @return {!../layout-rect.LayoutRectDef} The element's remeasured page
   *     layout box.
   */
  remeasure() {
    const viewport = this.layers_.getViewport();
    let box = viewport.getLayoutRect(this.element_);

    // Calculate whether the element is currently is or in `position:fixed`.
    let isFixed = false;
    if (box.width > 0 && box.height > 0) {
      const win = this.layers_.win;
      const body = win.document.body;
      for (let n = this.element_; n && n != body; n = n./*OK*/offsetParent) {
        if (n.isAlwaysFixed && n.isAlwaysFixed()) {
          isFixed = true;
          break;
        }

        if (viewport.isDeclaredFixed(n)
            && computedStyle(win, n).position == 'fixed') {
          isFixed = true;
          break;
        }
      }
    }

    if (isFixed) {
      // For fixed position elements, we need the relative position to the
      // viewport. When accessing the layoutBox through #getAbsoluteLayoutBox,
      // we'll return the new absolute position.
      box = moveLayoutRect(box, -viewport.getScrollLeft(),
          -viewport.getScrollTop());
    }

    this.layoutBox_ = box;
    this.isFixed_ = isFixed;

    return box;
  }

  /**
   * @return {boolean}
   */
  isFixed() {
    return this.isFixed_;
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installLayersServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'layers', Layers);
};
