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
import {computedStyle} from '../style';
import {listen} from '../event-helper';
import {getMode} from '../mode';

const LAYOUT_PROP = '__AMP_LAYOUT';

/**
 * The Size of an element.
 *
 * @struct
 * @typedef {{
 *   height: number,
 *   width: number,
 * }}
 */
export let SizeDef;

/**
 * The offset Position of an element.
 *
 * @struct
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
function sizeWh(width, height) {
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
function positionLt(left, top) {
  return {
    left,
    top,
  };
}

/**
 * The core class behind the Layers system, this controls layer creation and
 * management.
 */
export class LayoutLayers {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!Element} scrollingElement
   */
  constructor(ampdoc, scrollingElement) {
    const {win} = ampdoc;

    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = win;

    /**
     * TODO(@jridgewell) How should this be handled in FIE and Shadow docs?
     * We could depend on the host docs' Layers and mark the container as a
     * layer, which seems easy. Need to verify.
     * @const @private {!Document}
     */
    this.document_ = win.document;

    /** @const @private {!Element} */
    this.scrollingElement_ = scrollingElement;

    /**
     * An Event handler, which will be called when a layer (any layer) scrolls.
     * A later PR will refine this to send an array of elements who have
     * changed position due to the scroll.
     * @type {function()|null}
     */
    this.onScroll_ = null;

    /** @const @private {!Array<LayoutElement>} */
    this.layouts_ = [];



    // Listen for scroll events at the document level, so we know when either
    // the document (the scrolling element) or an element scrolls.
    // This forwards to our scroll-dirty system, and eventually to the scroll
    // listener.
    listen(this.document_, 'scroll', event => {
      const {target} = event;
      const scrolled = target.nodeType == Node.ELEMENT_NODE
          ? target
          : scrollingElement;
      this.scrolled_(scrolled);
    }, {capture: true, passive: true});

    // Destroys the layer tree on document resize, since entirely new CSS may
    // apply to the document now.
    win.addEventListener('resize', () => this.onResize_());

    // Finally, declare scrollingElement as the one true scrolling layer.
    this.declareLayer_(scrollingElement, true);
  }

  /**
   * Creates a layout for the element (if one doesn't exist for it already) and
   * tracks the layout.
   *
   * This method may be called multiple times to ensure the element has a
   * layout (and can therefore use the layout's instance methods) and that the
   * layout will be remasured when necessary.
   *
   * @param {!Element} element
   * @return {!Layout}
   */
  add(element) {
    let layout = LayoutElement.forOptional(element);
    // Elements may already have a layout (common for calls to get size or
    // position from Resources).
    if (!layout) {
      layout = new LayoutElement(element);
    }

    // Layout may have been removed from the tracked layouts (due to
    // reparenting).
    if (this.layouts_.indexOf(layout) === -1) {
      this.layouts_.push(layout);
    }

    return layout;
  }

  /**
   * Removes the element's layout from tracking.
   * This also "dirties" the layout, so if's being reparented it will lazily
   * update appropriately.
   *
   * TODO(@jridgewell): This won't catch detach events from native DOM
   * elements...
   *
   * @param {!Element} element
   */
  remove(element) {
    const layout = LayoutElement.forOptional(element);
    if (!layout) {
      return;
    }

    layout.undeclareLayer();
    layout.forgetParentLayer();

    const index = this.layouts_.indexOf(layout);
    if (index > -1) {
      this.layouts_.splice(index, 1);
    }

    const parent = layout.getParentLayer();
    if (parent) {
      parent.remove(element);
    }
  }

  /**
   * Returns the current scrolled position of the element relative to the layer
   * represented by opt_parent (or opt_parent's parent layer, if it is not a
   * layer itself). This takes into account the scrolled position of every
   * layer in between.
   *
   * @param {!Element} element
   * @param {Element=} opt_parent
   * @return {!PositionDef}
   */
  getScrolledPosition(element, opt_parent) {
    const layout = this.add(element);
    return layout.getScrolledPosition(opt_parent);
  }

  /**
   * Returns the absolute offset position of the element relative to the layer
   * represented by opt_parent (or opt_parent's parent layer, if it is not a
   * layer itself). This remains constant, regardless of the scrolled position
   * of any layer in between.
   *
   * @param {!Element} element
   * @param {Element=} opt_parent
   * @return {!PositionDef}
   */
  getOffsetPosition(element, opt_parent) {
    const layout = this.add(element);
    return layout.getOffsetPosition(opt_parent);
  }

  /**
   * Returns the size of the element.
   *
   * @param {!Element} element
   * @return {!SizeDef}
   */
  getSize(element) {
    const layout = this.add(element);
    return layout.getSize(element);
  }

  /**
   * Remeasures (now, not lazily) the element, and any other elements who's
   * cached rects may have been altered by this element's mutation. This
   * optimizes to also remeasure any higher up layers that are also marked as
   * dirty, so that only 1 measure phase is needed.
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
   * Eagerly creates a Layer for the element. Doing so helps the scheduling
   * algorithm better score nested components, and saves a few cycles.
   *
   * @param {!Element} element
   */
  declareLayer(element) {
    this.declareLayer_(element, false);
  }

  /**
   * Eagerly creates a Layer for the element.
   *
   * @param {!Element} element
   * @param {!Boolean} isRootLayer
   * @return {!LayoutElement}
   */
  declareLayer_(element, isRootLayer) {
    const layout = this.add(element);
    layout.declareLayer(isRootLayer);
    return layout;
  }

  /**
   * Destroys the layer tree, since new CSS may apply to the document after a
   * resize.
   */
  onResize_() {
    const layouts = this.layouts_;
    for (let i = 0; i < layouts.length; i++) {
      const layout = layouts[i];
      layout.undeclareLayer();
      layout.forgetParentLayer();
    }
  }

  /**
   * Dirties the scrolled layer, so any later calls to getScrolledPosition will
   * recalc the scrolled position.  If the scrolled element is not yet a layer,
   * it turns it into a layer lazily.
   *
   * This also sends the scrolled notifications to the onScrolled_ listener.
   * Eventually, it will send an array of elements that actually changed
   * position (instead of having to check all elements in the listener).
   *
   * @param {!Element} element
   */
  scrolled_(element) {
    let layout = LayoutElement.forOptional(element);
    if (layout && layout.isLayer()) {
      layout.requestScrollRemeasure();
    } else {
      layout = this.declareLayer_(element);
    }

    if (this.onScroll_) {
      this.onScroll_(/* layer.getElements() */);
    }
  }

  /**
   * Registers the scroll listener.
   *
   * @param {function()} handler
   */
  onScroll(handler) {
    this.onScroll_ = handler;
  }
}

export class LayoutElement {
  constructor(element) {
    element[LAYOUT_PROP] = this;
    /**
     * @private @const {!Element}
     */
    this.element_ = element;

    /** @type {?LayoutElement|undefined} */
    this.parentLayer_ = undefined;

    this.needsRemeasure_ = true;
    this.size_ = sizeWh(0, 0);
    this.position_ = positionLt(0, 0);

    this.isLayer_ = false;
    this.isRootLayer_ = false;
    this.needsScrollRemeasure_ = false;
    this.scrollLeft_ = 0;
    this.scrollTop_ = 0;

    this.children_ = [];
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
    return element[LAYOUT_PROP] || null;
  }

  /**
   * Finds the element's parent layer
   * If the element is itself a layer, it returns the layer's parent layer.
   * @param {!Element}
   * @param {opt_force=} Whether to force a re-lookup
   * @return {?LayoutElement}
   */
  static getParentLayer(element, opt_force) {
    if (!opt_force) {
      const layout = LayoutElement.forOptional(element);
      if (layout) {
        return layout.getParentLayer();
      }
    }

    const win = element.ownerDocument.defaultView;
    let op = element;
    for (let el = element; el; el = el.parentNode) {
      const layout = el === element ? null : LayoutElement.forOptional(el);
      if (layout && layout.isLayer()) {
        return layout;
      }

      // now check to see if offsetParent is a fixed layer
      if (el === op) {
        if (computedStyle(win, op).position == 'fixed') {
          LayoutLayers.declareLayer(op);
          return op;
        }
        op = op.offsetParent;
      }
    }


    // Use isConnected if available, but always pass if it's not.
    dev().assert(element.isConnected !== false, 'element not in the DOM tree')
    return null;
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

    const i = this.children_.indexOf(layout);
    if (i > -1) {
      this.children_.splice(i, 1);
    }
  }

  isLayer() {
    return this.isLayer_;
  }

  declareLayer(isRootLayer) {
    this.isLayer_ = true;
    this.needsRemeasure_ = true;
    this.needsScrollRemeasure_ = true;

    this.isRootLayer_ = isRootLayer;

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
    if (!this.isLayer_ || this.isRootLayer_) {
      return;
    }

    this.isLayer_ = false;
    this.transfer_(this.getParentLayer());
  }

  transfer_(layer) {
    // An optimization if we know that the new layer definitely contains
    // everything in this layer.
    const contained = layer.contains(this.element_);

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
    if (this.parentLayer_ === undefined) {
      const parent = LayoutElement.getParentLayer(this.element_, true);
      this.parentLayer_ = parent;
      if (parent) {
        parent.add(this.element_);
      }
    }
    return this.parentLayer_;
  }

  forgetParentLayer() {
    this.parentLayer_ = undefined;
  }

  /**
   * Gets the size of the element.
   * @return {!SizeDef}
   */
  getSize() {
    if (this.needsRemeasure_) {
      this.remeasure();
    }
    return this.size_;
  }

  /**
   * Gets offsets of the element relative to the parent layer, without taking
   * scroll position into account.
   * @return {!PositionDef}
   */
  getOffsetFromParent() {
    if (this.needsRemeasure_) {
      this.remeasure();
    }
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
   * Returns the current scrolled position of the element relative to the layer
   * represented by opt_parent (or opt_parent's parent layer, if it is not a
   * layer itself). This takes into account the scrolled position of every
   * layer in between.
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

    return positionLt(x, y);
  }

  /**
   * Returns the absolute offset position of the element relative to the layer
   * represented by opt_parent (or opt_parent's parent layer, if it is not a
   * layer itself). This remains constant, regardless of the scrolled position
   * of any layer in between.
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

    return positionLt(x, y);
  }

  requestRemeasure() {
    this.needsRemeasure_ = true;
  }

  requestScrollRemeasure() {
    this.needsScrollRemeasure_ = true;
  }

  remeasure() {
    let last = this;
    let layer = this;
    for (let layer = this; layer; layer = layer.getParentLayer()) {
      if (layer.needsRemeasure_) {
        last = layer;
      }
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
          positionLt(0, 0);
    }

    const box = this.element_.getBoundingClientRect();
    this.size_ = sizeWh(box.width, box.height);
    if ((getMode().localDev || getMode().test) && Object.freeze) {
      Object.freeze(this.size_);
    }

    let {left, top} = box;
    if (this.isRootLayer_) {
      left += this.getScrollLeft();
      top += this.getScrollTop();
    }
    this.position_ = positionLt(
        left - relative.left,
        top - relative.top
    );
    if ((getMode().localDev || getMode().test) && Object.freeze) {
      Object.freeze(this.position_);
    }

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
      this.scrollLeft_ = this.element_.scrollLeft;
      this.scrollTop_ = this.element_.scrollTop;
    }
  }
}

/**
 * @param {!LayoutElement} layer
 * @return {!positionLt}
 */
function relativeScrolledPositionForChildren(layer) {
  const position = layer.getScrolledPosition();
  return positionLt(
      position.left - layer.getScrollLeft(),
      position.top - layer.getScrollTop()
  );
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} scrollingElement
 */
export function installLayersServiceForDoc(ampdoc, scrollingElement) {
  registerServiceBuilderForDoc(ampdoc, 'layers', function(ampdoc) {
    return new LayoutLayers(ampdoc, scrollingElement);
  }, /* opt_instantiate */ true);
};
