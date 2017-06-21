/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

const LAYOUT_PROP = '__AMP_LAYOUT';
const LAYOUT_LAYER_PROP = '__AMP_LAYER';

export class LayoutLayers {
  constructor() {
    /** @const {!Array<!LayoutLayer>} */
    this.layers_ = [];

    // TODO: Setup default layers
    // TODO: setup document scroll listener
  }

  /**
   * Calculates the element's intersection with the viewport's rect.
   *
   * @param {!Element} element A regular or AMP Element
   * @param {!Rect} viewportRect
   */
  calcIntersectionWithViewport(element) {
    // Get viewport's "layer" (probably <html>)
    // call calcIntersectionWithParent(element, <html>)
  }

  /**
   * Calculates the element's intersection with the parent's rect.
   *
   * @param {!Element} element A regular or AMP Element
   * @param {!Element} parent
   */
  calcIntersectionWithParent(element, parent) {
    // Get LayoutLayer `ll` of `element`
    // Get ancestry of every LayoutLayer parent until `parent`, inclusive
    // Perform box intersection calcs top-down, until we get a final
    //   intersection.
  }

  /**
   * Remeasures the element, and any other elements who's cached rects may have
   * been altered by this element's mutation.
   *
   * This is meant to be called after any element mutation happens (eg.
   * #buildCallback, #layoutCallback, viewport changes size).
   *
   * @param {!Element} element A regular or AMP Element
   */
  remeasure(element) {
    // Get LayoutLayer `ll`.
    // Get `ll`'s parent LayoutLayer `parent`.
    // Recursively remeasure every element under `parent`.
    // This can be optimized to only scan elements _after_ `element` inside
    //   `ll`, and LayoutLayers after `ll`.
  }

  /**
   * Changes the element's rect size.
   *
   * @param {!AmpElement} element An AMP Element
   * @param {!Size} size
   * @param {boolean=} force Whether to skip approval/denial logic
   */
  changeSize(element, size, force = false) {
  }

  /**
   * Eagerly creates a LayoutLayer for the element.
   * @param {!Element} element
   */
  declareLayer(element) {
    dev().assert(!LayoutLayer.forOptional(element));
    const layer = new LayoutLayer(element);
    const parent = layer.getParentLayer(element);
    parent.moveAmpElements(layer);
  }
}

class LayoutLayer {
  constructor(element) {
    /** @private @const {!Element} */
    this.root_ = element;
    element[LAYOUT_LAYER_PROP] = this;

    /**
     * Holds all children AMP Elements, so we can quickly remeasure.
     * @const @private {!Array<!AmpElement>}
     */
    this.ampElements_ = [];

    /**
     * A penalty applied to elements in this layer, so that they are classified as "less important" than elements in other layers.
     * This is so element's inside a closed sidebar layer are "less important" than visible content elements.
     * This penalty may change dynamically.
     *
     * @private @type {number}
     */
    // this.priorityPenalty_ = 0;
  }

  /**
   * Gets the element's LayoutLayer instance.
   * @param {!Element}
   * @return {!LayoutLayer}
   */
  static for(element) {
    return dev().assert(LayoutLayer.forOptional(element));
  }

  /**
   * Gets the element's LayoutLayer instance, if the element is a layer.
   * @param {!Element}
   * @return {?LayoutLayer}
   */
  static forOptional(element) {
    return element[LAYOUT_LAYER_PROP];
  }

  /**
   * Finds the element's parent layer
   * If the element is itself a layer, it returns the layer's parent layer.
   * @param {!Element}
   * @return {!LayoutLayer}
   */
  static getParentLayer(element) {
    for (let el = element.parentNode; el; el = el.parentNode) {
      const layer = LayoutLayer.forOptional(el);
      if (layer) {
        return layer;
      }
    }
    // TODO return root layer
  }

  /**
   * Finds this layer's parent layer
   * @return {!LayoutLayer}
   */
  getParentLayer() {
    return LayoutLayer.getParentLayer(this.root_);
  }

  /**
   * Removes this layer from the layer tree. All child elements will inherit
   * this layer's parent as their new containing layer.
   *
   * This is necessary when the screen size changes (or other similar events
   * happen), because CSS styles may change. We'll need to recompute layers
   * lazily after this happens.
   */
  dispose() {
    this.root_[LAYOUT_LAYER_PROP] = null;
    this.moveAmpElements(this.getParentLayer());
  }

  contains(element) {
    return this.root_.contains(element);
  }

  moveAmpElements_(layer, opt_force = false) {
    filterSplice(this.ampElements_, element => {
      if (opt_force || layer.contains(element)) {
        layer.ampElements_.push(element);
        return false;
      }

      return true;
    });
  }
}

class LayoutElement {
  constructor(element) {
    /**
     * @private @const {!Element}
     */
    this.element_ = element;

    /**
     * A cached layout rectangle, relative to the containing layer's top-left
     * corner. This box DOES NOT change based on scroll position.
     * @private {!LayoutRectDef}
     */
    this.layoutBox_ = {};

    element[LAYOUT_PROP] = this;
  }

  /**
   * Gets the element's LayoutElement instance.
   * @param {!Element}
   * @return {!LayoutElement}
   */
  static for(element) {
    return dev().assert(LayoutElement.forOptional(element));
  }

  /**
   * Gets the element's LayoutElement instance, if the element has one.
   * @param {!Element}
   * @return {?LayoutElement}
   */
  static forOptional(element) {
    return element[LAYOUT_PROP];
  }

  /**
   * Gets the element's parent layer. If this element is itself a layer, it
   * returns the layer's parent.
   * @return {!LayoutLayer}
   */
  getParentLayer() {
    return LayoutLayer.getParentLayer(this.element_);
  }

  /**
   * Gets the layout rectangle relative to the parent's coordinate system.
   * @return {!LayoutRectDef}
   */
  getCachedLayoutBox() {
    return this.layoutBox_;
  }

  /**
   * Gets the layout rectangle translated into the parent's coordinate system.
   * @return {!LayoutRectDef}
   */
  getLayoutBox(opt_parent) {
    // Translate the layout rectangle into parent's coordinates
  }
}
