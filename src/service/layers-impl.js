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
  constructor(ampdoc) {
    this.win = ampdoc.win;

    /** @const {!Document} */
    this.document_ = this.win.document;

    /** @const {!Array<!LayoutLayer>} */
    this.layers_ = [];

    // TODO: figure out fixed layer

    this.document_.addEventListener('scroll', event => {
      this.scrolled_(event.target || this.getScrollingElement_());
    }, { capture: true, passive: true });
    win.addEventListener('resize', () => this.onResize_());
  }

  /**
   * Calculates the element's intersection with the viewport's rect.
   *
   * @param {!Element} element A regular or AMP Element
   * @param {!Rect} viewportRect
   */
  calcIntersectionWithViewport(element) {
    return this.calcIntersectionWithParent(element,
        this.getScrollingElement_());
  }

  /**
   * Calculates the element's intersection with the parent's rect.
   * You may optionally expand the parent's rectangle.
   *
   * @param {!Element} element A regular or AMP Element
   * @param {!Element} parent
   * @param {{dw: number=, dh: number=}=} opt_expand
   * @param {number=} opt_dh
   * @return {!LayoutRectDef}
   */
  calcIntersectionWithParent(element, parent, opt_expand) {
    const elementBox = LayoutElement.for(element).getLayoutBox(parent);
    const { left, top } = elementBox;
    let parentBox = LayoutElement.for(parent).getUnscrolledLayoutBox();
    if (opt_expand) {
      parentBox = expandLayoutRect(parentBox, opt_expand.dw || 0,
          opt_expand.dh || 0);
    }

    return layoutRectLtwh(
      left,
      top,
      Math.max(
        Math.min(left + elementBox.width, parent.width) - left,
        0
      ),
      Math.max(
        Math.min(top + elementBox.height, parent.height) - top,
        0
      )
    );
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
    const layer = LayoutLayer.getParentLayer(element);
    if (layer) {
      layer.remeasure();
    }
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
    this.layers_.push(layer);
    return layer;
  }

  onResize_() {
    const scroll = LayoutLayer.for(this.getScrollingElement_());

    const layers = this.layers_;
    for (let i = 0; i < layers; i++) {
      const layer = layers[i];
      if (layer !== scroll) {
        layers[i].dispose();
      }
    }

    scroll.remeasure();
  }

  scrolled_(element) {
    let layer = LayoutLayer.forOptional(element);
    if (layer) {
      layer.updateScrollPosition();
    } else {
      layer = this.declareLayer(element);
    }
  }

  getScrollingElement_() {
    const doc = this.document_;
    if (doc./*OK*/scrollingElement) {
      return doc./*OK*/scrollingElement;
    }
    if (doc.body && platformFor(this.win).isWebKit()) {
      return doc.body;
    }
    return doc.documentElement;
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
     * Holds all children Layers, so we can quickly remeasure.
     * @const @private {!Array<!LayoutLayer>}
     */
    this.layers_ = [];

    this.scrollLeft_ = 0;
    this.scrollTop_ = 0;

    /** @private {?LayoutLayer} */
    this.parentLayer_ = LayoutLayer.getParentLayer(element);

    if (this.parentLayer_) {
      this.parentLayer_.transfer_(this);
    }

    this.remeasure();

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
   * @return {?LayoutLayer}
   */
  static getParentLayer(element) {
    let last = element;
    for (let el = last.parentNode; el; last = el, el = el.parentNode) {
      const layer = LayoutLayer.forOptional(el);
      if (layer) {
        return layer;
      }
    }
    if (last.tagName !== 'HTML') {
      throw dev().createError('element is not in the DOM tree');
    }
    return null;
  }

  /**
   * The layer's cached parent layer.
   * @return {?LayoutLayer}
   */
  getParentLayer() {
    return this.parentLayer_;
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
    const parent = this.getParentLayer();
    if (parent) {
      this.transfer_(parent);
    }
  }

  contains(element) {
    return this.root_.contains(element);
  }

  getUnscrolledyoutBox() {
    return LayoutElement.for(this.root_).getUnscrolledyoutBox();
  }

  getLayoutBox() {
    return LayoutElement.for(this.root_).getLayoutBox();
  }

  getScrollTop() {
    return this.scrollTop_;
  }

  getScrollLeft() {
    return this.scrollLeft_;
  }

  transfer_(layer) {
    // Basically, are we removing this layer.
    const contained = layer === this.getParentLayer();

    filterSplice(this.ampElements_, element => {
      if (contained || layer.contains(element)) {
        layer.ampElements_.push(element);
        return false;
      }

      return true;
    });

    filterSplice(this.layers_, l => {
      if (contained || layer.contains(l.root_)) {
        layer.layers_.push(l);
        l.parentLayer_ = layer;
        return false;
      }

      return true;
    });
  }

  updateScrollPosition() {
    this.scrollLeft_ = this.root_.scrollLeft;
    this.scrollTop_ = this.root_.scrollTop;
  }

  remeasure() {
    this.updateScrollPosition();

    const box = this.getLayoutBox();
    const elements = this.ampElements_;
    for (let i = 0; i < elements.length; i++) {
      LayoutElement.for(elements[i]).remeasure(box);
    }

    const layers = this.layers_;
    for (let i = 0; i < layers.length; i++) {
      layers[i].remeasure();
    }
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
    this.layoutBox_ = layoutRectLtwh(0, 0, 0, 0);

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
   * Calculates the LayoutRectDef of element relative to opt_parent
   * (or viewport), taking into account scroll positions.
   *
   * @param {!Element} element
   * @param {Element=} opt_parent
   * @return {!LayoutRectDef}
   */
  static getLayoutBox(opt_parent) {
    // 4 cases:
    //   1. AmpElement, AmpElement
    //   2. AmpElement, Element
    //   3. Element, AmpElement
    //   4. Element, Element
  }

  /**
   * Gets the element's parent layer. If this element is itself a layer, it
   * returns the layer's parent.
   * @return {?LayoutLayer}
   */
  getParentLayer() {
    return LayoutLayer.getParentLayer(this.element_);
  }

  /**
   * Gets the layout rectangle relative to the parent's coordinate system.
   * @return {!LayoutRectDef}
   */
  getUnscrolledyoutBox() {
    return this.layoutBox_;
  }

  /**
   * Gets the layout rectangle translated into the parent's coordinate system.
   * @param {Element=} opt_parent
   * @return {!LayoutRectDef}
   */
  getLayoutBox(opt_parent) {
    const parents = [];
    const stopAt = opt_parent ? LayoutLayer.getParentLayer(opt_parent) : null;
    for (let p = this.getParentLayer(); p !== stopAt; p = p.getParentLayer()) {
      parents.push(p);
    }

    const box = this.getUnscrolledyoutBox();
    let x = box.left;
    let y = box.top;
    let first = true;
    for (let i = parents.length - 1; i >= 0; i--) {
      const parent = parents[i];

      const box = parent.getUnscrolledyoutBox();
      x -= parent.getScrollLeft();
      y -= parent.getScrollTop();
      if (!first) {
        x += box.left;
        y += box.top;
      }

      first = false;
    }

    return layoutRectLtwh(x, y, box.width, box.height);
  }

  remeasure(opt_relativeTo) {
    let relative = opt_relativeTo;
    if (!relative) {
      const parent = this.getParentLayer();
      relative = parent ? parent.getLayoutBox() : layoutRectLtwh(0, 0, 0, 0);
    }
    const box = this.element_.getBoundingClientRect();
    this.layoutBox_ = layoutRectLtwh(
      box.left - relative.left,
      box.top - relative.top,
      box.width,
      box.height
    );
  }
}
