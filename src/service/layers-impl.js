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

import {layoutRectLtwh} from '../layout-rect';
import {dev} from '../log';
import {filterSplice} from '../utils/array';
import {Services} from '../services';
import {registerServiceBuilderForDoc} from '../service';

const LAYOUT_PROP = '__AMP_LAYOUT';
const EMPTY = [];

/**
 * The Size of an element.
 *
 * @typedef {{
 *   height: number,
 *   width: number,
 * }}
 */
export let SizeDef;

/**
 * The offset Position of an element.
 *
 * @typedef {{
 *   left: number,
 *   top: number,
 * }}
 */
export let PositionDef;

/**
 * Creates a Size.
 *
 * @param {number} width
 * @param {number} height
 * @return {!SizeDef}
 */
function SizeWh(width, height) {
  return {
    height,
    width,
  };
}

/**
 * Creates a Position.
 *
 * @param {number} left
 * @param {number} top
 * @return {!PositionDef}
 */
function PositionLt(left, top) {
  return {
    left,
    top,
  };
}

/**
 * @type {?Element}
 */
let scrollingElement;

/**
 * @param {!Node|!Document} nodeOrDoc
 */
function getScrollingElement(nodeOrDoc) {
  if (scrollingElement) {
    return scrollingElement;
  }

  const doc = nodeOrDoc.ownerDocument || nodeOrDoc;
  let s = doc./*OK*/scrollingElement;

  if (!s) {
    if (doc.body && Services.platformFor(doc.defaultView).isWebKit()) {
      s = doc.body;
    } else {
      s = doc.documentElement;
    }
  }

  return scrollingElement = s;
}

export class LayoutLayers {
  constructor(ampdoc) {
    const {win} = ampdoc;

    this.ampdoc_ = ampdoc;
    this.win_ = win;

    this.onScroll_ = null;

    /** @const {!Document} */
    this.document_ = win.document;

    // TODO: figure out fixed layer

    this.document_.addEventListener('scroll', event => {
      const {target} = event;
      const scrolled = target.nodeType == Node.ELEMENT_NODE
          ? target
          : getScrollingElement(this.document_);
      this.scrolled_(scrolled);
    }, /* TODO */{capture: true, passive: true});
    win.addEventListener('resize', () => this.onResize_());

    this.declareLayer(this.document_.documentElement);
    this.declareLayer(getScrollingElement(this.document_));
  }

  add(element) {
    if (LayoutElement.forOptional(element)) {
      return;
    }

    new LayoutElement(element);
  }

  remove(element) {
    const layout = LayoutElement.for(element);
    const parent = layout.getParentLayer();
    dev().assert(parent);

    parent.remove(element);
  }

  /**
   * Calculates the element's intersection with the viewport's rect.
   *
   * @param {!Element} element A regular or AMP Element
   * @param {!LayoutRectDef} viewportRect
   */
  calcIntersectionWithViewport(element) {
    return this.calcIntersectionWithParent(element,
        getScrollingElement(this.document_));
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
    const {left, top} = LayoutElement.getScrolledPosition(element, parent);
    const size = LayoutElement.getSize(element);

    let {width: parentWidth, height: parentHeight} =
        LayoutElement.getSize(parent);
    if (opt_expand) {
      parentWidth *= 1 + (opt_expand.dw || 0) * 2;
      parentHeight *= 1 + (opt_expand.dh || 0) * 2;
    }

    return layoutRectLtwh(
        left,
        top,
        Math.max(Math.min(left + size.width, parentSize.width) - left, 0),
        Math.max(Math.min(top + size.height, parentSize.height) - top, 0)
    );
  }

  getScrolledPosition(element, opt_parent) {
    return LayoutElement.getScrolledPosition(element, opt_parent);
  }

  getOffsetPosition(element, opt_parent) {
    return LayoutElement.getOffsetPosition(element, opt_parent);
  }

  getSize(element) {
    return LayoutElement.getSize(element);
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
    const layer = LayoutElement.getParentLayer(element);
    if (layer) {
      layer.remeasure();
    }
  }

  /**
   * Changes the element's rect size.
   *
   * @param {!AmpElement} element An AMP Element
   * @param {!SizeDef} size
   * @param {boolean=} force Whether to skip approval/denial logic
   * TODO
   */
  // changeSize(element, size, force = false) {
  // }

  /**
   * Eagerly creates a Layer for the element.
   * @param {!Element} element
   */
  declareLayer(element) {
    this.declareLayer_(element);
  }

  /**
   * Eagerly creates a Layer for the element.
   * @param {!Element} element
   * @return {!LayoutElement}
   */
  declareLayer_(element) {
    const layer = LayoutElement.forOptional(element) ||
        new LayoutElement(element);
    layer.declareLayer();
    return layer;
  }

  onResize_() {
    const scroller = getScrollingElement(this.document_);
    // TODO
    LayoutElement.for(scroller).dispose(/* opt_deep */ true);
  }

  scrolled_(element) {
    const layer = LayoutElement.forOptional(element);
    if (layer) {
      layer.requestScrollRemeasure();
    } else {
      layer = this.declareLayer_(element);
    }

    if (this.onScroll_) {
      this.onScroll_(/* layer.getElements() */);
    }
  }

  onScroll(handler) {
    this.onScroll_ = handler;
  }
}

export class LayoutElement {
  constructor(element) {
    /**
     * @private @const {!Element}
     */
    this.element_ = element;

    const parent = LayoutElement.getParentLayer(element);
    // It's important that the parent layer is retrieved before setting the
    // layout prop.
    element[LAYOUT_PROP] = this;

    this.needsRemeasure_ = true;
    this.size_ = SizeWh(0, 0);
    this.position_ = PositionLt(0, 0);

    this.isLayer_ = false;
    this.isRootLayer_ = false;
    this.needsScrollRemeasure_ = false;
    this.scrollLeft_ = 0;
    this.scrollTop_ = 0;

    this.children_ = [];

    this.parentLayer_ = parent;
    if (parent) {
      parent.add(element);
    }
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
   * Finds the element's parent layer
   * If the element is itself a layer, it returns the layer's parent layer.
   * @param {!Element}
   * @return {?LayoutElement}
   */
  static getParentLayer(element) {
    const layout = LayoutElement.forOptional(element);
    if (layout) {
      return layout.getParentLayer();
    }

    let last = element;
    for (let el = last.parentNode; el; last = el, el = el.parentNode) {
      const layout = LayoutElement.forOptional(el);
      if (layout && layout.isLayer()) {
        return layout;
      }
    }

    if (last.nodeType !== Node.DOCUMENT_NODE) {
      throw dev().createError('element is not in the DOM tree');
    }
    return null;
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
    if (!opt_parent) {
      return PositionLt(box.left, box.top);
    }

    const relative = LayoutElement.getScrolledPosition(opt_parent);
    return PositionLt(
      box.left - relative.left,
      box.top - relative.top
    );
  }

  /**
   * Calculates the LayoutRectDef of element relative to opt_parent
   * (or viewport), ignoring any scroll positions.
   *
   * @param {!Element} element
   * @param {Element=} opt_parent
   * @return {!LayoutRectDef}
   */
  static getOffsetPosition(element, opt_parent) {
    // 4 cases:
    //   1. AmpElement, AmpElement
    //   2. AmpElement, Element
    //   3. Element, AmpElement
    //   4. Element, Element
    const layout = LayoutElement.forOptional(element);
    if (layout) {
      return layout.getOffsetPosition(opt_parent);
    }

    // There's no equivalent DOM method, so it has to be a for-loop.
    let x = 0;
    let y = 0;
    for (let el = element; opt_parent ? opt_parent.contains(el) : el;
        el = el.offsetParent) {
      x += el.offsetLeft;
      y += el.offsetTop;
    }
    return PositionLt(x, y);
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

    return SizeWh(box.clientWidth, box.clientHeight);
  }

  static getOffsetFromParent(element) {
    const layout = LayoutElement.forOptional(element);
    if (layout) {
      return layout.getOffsetFromParent();
    }

    const parent = LayoutElement.getParentLayer(element);
    return LayoutElement.getOffsetPosition(element,
        parent ? parent.element_ : undefined);
  }

  contains(element) {
    const root = this.element_;
    return root !== element && root.contains(element);
  }

  add(child) {
    dev().assert(this.isLayer());
    dev().assert(this.contains(child));

    const layout = LayoutElement.for(child);
    this.children_.push(layout);
  }

  remove(child) {
    dev().assert(this.isLayer());

    const layout = LayoutElement.for(child);
    dev().assert(layout.getParentLayer() === this);
    layout.dispose();

    const i = this.children_.indexOf(layout);
    if (i > -1) {
      this.children_.splice(i, 1);
    }
  }

  isLayer() {
    return this.isLayer_;
  }

  declareLayer() {
    this.isLayer_ = true;
    this.needsRemeasure_ = true;
    this.needsScrollRemeasure_ = true;

    const element = this.element_;
    const scroller = getScrollingElement(element);
    this.isRootLayer_ = element === scroller || !scroller.contains(element);

    const parent = this.getParentLayer();
    if (parent) {
      parent.transfer_(this);
    }
  }

  /**
   * This is necessary when the screen size changes (or other similar events
   * happen), because CSS styles may change. We'll need to recompute layers
   * lazily after this happens.
   */
  undeclareLayer() {
    if (!this.isLayer_) {
      return;
    }

    if (this.isRootLayer_) {
      const children = this.children_;
      // Note that children's length will increase as each child moves its
      // children to this layer.
      for (let i = 0; i < children.length; i++) {
        children[i].undeclareLayer(opt_deep);
      }
    } else {
      this.isLayer_ = false;
      this.transfer_(this.getParentLayer());
    }
  }

  transfer_(layer) {
    // An optimization if we know that the new layer definitely contains
    // everything in this layer.
    const contained = layer.contains(this.root_);

    filterSplice(this.children_, layout => {
      if (contained || layer.contains(layout.element_)) {
        layout.parentLayer_ = layer;
        layer.children_.push(layout);
        return false;
      }

      return true;
    });
  }

  /**
   * Gets the element's parent layer. If this element is itself a layer, it
   * returns the layer's parent.
   * @return {?LayoutElement}
   */
  getParentLayer() {
    return this.parentLayer_;
  }

  /**
   * Gets the size of the element.
   * @return {!SizeDef}
   */
  getSize() {
    this.remeasure();
    return this.size_;
  }

  /**
   * Gets offsets of the element relative to the parent layer, without taking
   * scroll position into account.
   * @return {!PositionDef}
   */
  getOffsetFromParent() {
    this.remeasure();
    return this.position_;
  }

  getScrollTop() {
    this.updateScrollPosition_();
    return this.scrollTop_;
  }

  getScrollLeft() {
    this.updateScrollPosition_();
    return this.scrollLeft_;
  }

  /**
   * Gets the position of the element relative to the parent layer, taking
   * scroll position of the parents into account.
   * @param {Element=} opt_parent
   * @return {!LayoutRectDef}
   */
  getScrolledPosition(opt_parent) {
    const position = this.getOffsetFromParent();
    let x = position.left;
    let y = position.top;

    let last;
    const stopAt = opt_parent ? LayoutElement.getParentLayer(opt_parent) : null;
    for (let p = this.getParentLayer(); p !== stopAt; p = p.getParentLayer()) {

      x -= p.getScrollLeft();
      y -= p.getScrollTop();

      if (last) {
        const position = last.getOffsetFromParent();
        x += position.left;
        y += position.top;
      }
      last = p;
    }

    return PositionLt(x, y);
  }

  /**
   * Gets the position of the element relative to the parent layer, taking
   * scroll position of the parents into account.
   * @param {Element=} opt_parent
   * @return {!LayoutRectDef}
   */
  getOffsetPosition(opt_parent) {
    const position = this.getOffsetFromParent();
    let x = position.left;
    let y = position.top;

    let last;
    const stopAt = opt_parent ? LayoutElement.getParentLayer(opt_parent) : null;
    for (let p = this.getParentLayer(); p !== stopAt; p = p.getParentLayer()) {
      if (last) {
        const position = last.getOffsetFromParent();
        x += position.left;
        y += position.top;
      }
      last = p;
    }

    return PositionLt(x, y);
  }

  requestRemeasure() {
    this.needsRemeasure_ = true;
  }

  requestScrollRemeasure() {
    this.needsScrollRemeasure_ = true;
  }

  remeasure() {
    if (!this.needsRemeasure_) {
      return;
    }

    let last;
    let layer = this;
    while (layer && layer.needsRemeasure_) {
      last = layer;
      layer = layer.getParentLayer();
    }
    last.remeasure_();
  }

  remeasure_(opt_relativeTo) {
    this.updateScrollPosition_();
    this.needsRemeasure_ = false;

    let relative = opt_relativeTo;
    if (!relative) {
      const parent = this.getParentLayer();
      relative = parent ?
          relativeScrolledPositionForChildren(parent) :
          PositionLt(0, 0);
    }

    const box = this.element_.getBoundingClientRect();
    this.size_ = SizeWh(box.width, box.height);
    this.position_ = PositionLt(
        box.left - relative.left,
        box.top - relative.top
    );

    const children = this.children_;
    if (children.length) {
      const relative = relativeScrolledPositionForChildren(this);
      for (let i = 0; i < children.length; i++) {
        // TODO(@jridgewell): We can probably optimize this if this layer
        // didn't change at all.
        children[i].remeasure_(relative);
      }
    }
  }

  updateScrollPosition_() {
    if (this.isLayer_ && this.needsScrollRemeasure_) {
      this.needsScrollRemeasure_ = false;
      this.scrollLeft_ = this.root_.scrollLeft;
      this.scrollTop_ = this.root_.scrollTop;
    }
  }
}

/**
 * @param {!LayoutElement} layer
 * @return {!PositionLt}
 */
function relativeScrolledPositionForChildren(layer) {
  const position = layer.getScrolledPosition();
  return PositionLt(
    position.left - layer.getScrollLeft(),
    position.top - layer.getScrollTop()
  );
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installLayersServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'layers', LayoutLayers);
};
