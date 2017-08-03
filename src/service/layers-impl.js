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
    const { left, top } = LayoutElement.getScrolledPosition(element, parent);
    const size = LayoutElement.getSize(element);
    let parentSize = LayoutElement.getSize(parent);
    if (opt_expand) {
      parentSize.width *= 1 + (opt_expand.dw || 0) * 2,
      parentSize.height *= 1 + (opt_expand.dh || 0) * 2,
    }

    return layoutRectLtwh(
      left,
      top,
      Math.max(
        Math.min(left + size.width, parentSize.width) - left,
        0
      ),
      Math.max(
        Math.min(top + size.height, parentSize.height) - top,
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
    const layer = LayoutLayer.forOptional(element);
    if (layer) {
      layer.updateScrollPosition();
    } else {
      this.declareLayer(element);
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

    element[LAYOUT_LAYER_PROP] = this;
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
    const layout = LayoutElement.forOptional(element);
    if (layout) {
      return layout.getParentLayer();
    }

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

  getOffsets() {
    return LayoutElement.for(this.root_).getOffsets();
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
        element.parentLayer_ = layer;
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

    const position = this.getScrolledPosition();
    const elements = this.ampElements_;
    for (let i = 0; i < elements.length; i++) {
      LayoutElement.for(elements[i]).remeasure(position);
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

    this.parentLayer_ = LayoutLayer.getParentLayer(element);

    this.size_ = {width: 0, height: 0};
    this.position_ = {top: 0, left: 0};

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
  static getScrolledPosition(element, opt_parent) {
    // 4 cases:
    //   1. AmpElement, AmpElement
    //   2. AmpElement, Element
    //   3. Element, AmpElement
    //   4. Element, Element
    const layout = LayoutElement.forOptional(element);
    if (layout) {
      return layout.getScrolledPosition(opt_parent);
    }

    const box = element.getBoundingClientRect();
    const position = { left: box.left, top: box.top };
    if (opt_parent) {
      const parentBox = LayoutElement.getScrolledPosition(opt_parent);
      position.left -= parentBox.left;
      position.top -= parentBox.top;
    }
    return position;
  }

  /**
   * Calculates the size of element.
   *
   * @param {!Element} element
   * @return {!{width: number, height: number}}
   */
  static getSize(element) {
    const layout = LayoutElement.forOptional(element);
    if (layout) {
      return layout.getSize();
    }

    const box = element.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
    };
  }

  /**
   * Gets the element's parent layer. If this element is itself a layer, it
   * returns the layer's parent.
   * @return {?LayoutLayer}
   */
  getParentLayer() {
    return this.parentLayer_;
  }

  /**
   * Gets the size of the element.
   * @return {!{width: number, height: number}}
   */
  getSize() {
    return this.size_;
  }

  /**
   * Gets offsets of the element relative to the parent layer, without taking
   * scroll position into account.
   * @return {!LayoutRectDef}
   */
  getOffsets() {
    return this.position_;
  }

  /**
   * Gets the position of the element relative to the parent layer, taking
   * scroll position of the parents into account.
   * @param {Element=} opt_parent
   * @return {!LayoutRectDef}
   */
  getScrolledPosition(opt_parent) {
    const position = this.getOffsets();
    let x = position.left;
    let y = position.top;

    let first = true;
    const stopAt = opt_parent ? LayoutLayer.getParentLayer(opt_parent) : null;
    for (let p = this.getParentLayer(); p !== stopAt; p = p.getParentLayer()) {

      x -= p.getScrollLeft();
      y -= p.getScrollTop();

      if (first) {
        first = false;
      } else {
        const position = p.getOffsets();
        x += position.left;
        y += position.top;
      }
    }

    return {top: y, left: x};
  }

  remeasure(opt_relativeTo) {
    let relative = opt_relativeTo;
    if (!relative) {
      const parent = this.getParentLayer();
      relative = parent ? parent.getScrolledPosition() : { top: 0, left: 0};
    }
    const box = this.element_.getBoundingClientRect();
    this.size_ = {width: box.width, height: box.height};
    this.position_ = {
      top: box.top - relative.top,
      left: box.left - relative.left,
    };
  }
}
