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

import {Services} from '../services';
import {computedStyle} from '../style';
import {dev} from '../log';
import {filterSplice} from '../utils/array';
import {getMode} from '../mode';
import {listen} from '../event-helper';
import {registerServiceBuilderForDoc} from '../service';

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
 * @typedef {Object<string, *>}
 */
let AncestryStateDef;

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
 * Stores an LayoutElement's parent layer ancestry (temporarily), reusing the
 * same array instance to avoid heavy GCs.
 * See {@link LayoutElement#iterateAncestry}.
 * @const {!Array<!LayoutElement>}
 */
const ANCESTRY_CACHE = [];

/**
 * A unique "id" counter, to give each LayoutElement a unique id.
 * @type {number}
 */
let layoutId = 0;

/**
 * The core class behind the Layers system, this controls layer creation and
 * management.
 * @implements {../service.Disposable}
 */
export class LayoutLayers {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!Element} scrollingElement
   */
  constructor(ampdoc, scrollingElement) {
    const {win} = ampdoc;

    /** @const @private {!Element} */
    this.scrollingElement_ = scrollingElement;

    /**
     * An Event handler, which will be called when a layer (any layer) scrolls.
     * TODO(jridgewell, #12556): send an array of elements who have changed
     * position due to the scroll.
     * @type {function()|null}
     */
    this.onScroll_ = null;

    /** @const @private {!Array<!LayoutElement>} */
    this.layouts_ = [];

    /** @const @private {!Array<function()>} */
    this.unlisteners_ = [];

    // Listen for scroll events at the document level, so we know when either
    // the document (the scrolling element) or an element scrolls.
    // This forwards to our scroll-dirty system, and eventually to the scroll
    // listener.
    this.unlisteners_.push(listen(win.document, 'scroll', event => {
      const {target} = event;
      const scrolled = target.nodeType == Node.ELEMENT_NODE
        ? dev().assertElement(target)
        : scrollingElement;
      this.scrolled_(scrolled);
    }, {capture: true, passive: true}));

    // Destroys the layer tree on document resize, since entirely new CSS may
    // apply to the document now.
    this.unlisteners_.push(listen(win, 'resize', () => this.onResize_(), {
      capture: true,
      passive: true,
    }));

    // Declare scrollingElement as the one true scrolling layer.
    const root = this.declareLayer_(scrollingElement, true);

    /**
     * Stores the most recently scrolled layer.
     * @private {!LayoutElement}
     */
    this.activeLayer_ = root;
  }

  /** @override */
  dispose() {
    this.unlisteners_.forEach(unlisten => unlisten());
    this.unlisteners_.length = 0;
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
   * @return {!LayoutElement}
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
   * TODO(jridgewell): This won't catch detach events from native DOM
   * elements...
   *
   * @param {!Element} element
   */
  remove(element) {
    const layout = LayoutElement.forOptional(element);
    if (!layout) {
      return;
    }

    const index = this.layouts_.indexOf(layout);
    if (index > -1) {
      this.layouts_.splice(index, 1);
    }

    const parent = layout.getParentLayer();
    if (parent) {
      parent.remove(layout);
    }

    layout.undeclareLayer();
  }

  /**
   * Returns the current scrolled position of the element relative to the layer
   * represented by opt_ancestor (or opt_ancestor's parent layer, if it is not
   * a layer itself). This takes into account the scrolled position of every
   * layer in between.
   *
   * @param {!Element} element
   * @param {Element=} opt_ancestor
   * @return {!PositionDef}
   */
  getScrolledPosition(element, opt_ancestor) {
    const layout = this.add(element);
    return layout.getScrolledPosition(opt_ancestor);
  }

  /**
   * Returns the absolute offset position of the element relative to the layer
   * represented by opt_ancestor (or opt_ancestor's parent layer, if it is not
   * a layer itself). This remains constant, regardless of the scrolled
   * position of any layer in between.
   *
   * @param {!Element} element
   * @param {Element=} opt_ancestor
   * @return {!PositionDef}
   */
  getOffsetPosition(element, opt_ancestor) {
    const layout = this.add(element);
    return layout.getOffsetPosition(opt_ancestor);
  }

  /**
   * Returns the size of the element.
   *
   * @param {!Element} element
   * @return {!SizeDef}
   */
  getSize(element) {
    const layout = this.add(element);
    return layout.getSize();
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
   * @param {boolean=} opt_force
   */
  remeasure(element, opt_force) {
    const layout = this.add(element);
    const from = layout.getParentLayer() || layout;
    if (opt_force) {
      from.dirtyMeasurements();
    }
    from.remeasure();
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
   * @param {boolean} isRootLayer
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
    let layer = LayoutElement.forOptional(element);
    if (layer && layer.isLayer()) {
      layer.dirtyScrollMeasurements();
    } else {
      layer = this.declareLayer_(element, false);
    }

    this.activeLayer_ = layer;

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

  /**
   * Returns the most recently scrolled layer.
   *
   * @return {!LayoutElement}
   */
  getActiveLayer() {
    return this.activeLayer_;
  }

  /**
   * Iterates the layout's parent layer ancestry, starting from the root down
   * to the layout.
   *
   * This sets a whether the layer isActive during that layer's iteration. Any
   * attempts to access #isActiveUnsafe outside of the iterator call will fail.
   *
   * @param {!Element} element
   * @param {function(T, !LayoutElement, number, !AncestryStateDef):T} iterator
   * @param {!AncestryStateDef} state
   * @return {T}
   * @template T
   */
  iterateAncestry(element, iterator, state) {
    const layout = this.add(element);
    return layout.iterateAncestry(iterator, state);
  }
}

/**
 * The per-Element class, which caches the positions and size of the elements.
 */
export class LayoutElement {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    element[LAYOUT_PROP] = this;

    /** @const @private {!Element} */
    this.element_ = element;

    /** @const private {string} */
    this.id_ = `${element.tagName}-${layoutId++}`;

    /**
     * The parent layer of the current element. Note that even if _this_
     * element is a layer, its parent layer will be an ancestor (if there is a
     * parent layer).
     *
     * If the parent is null, that means the element does not have a parent
     * layer.
     * If the parent is undefined, that means the parent has not been cached
     * yet (or has been reset).
     *
     * @private {?LayoutElement|undefined}
     */
    this.parentLayer_ = undefined;

    /**
     * Whether to remeasure the element in the next size/position calculation.
     * This is done lazily to allow entire trees to be remeasured at the same
     * time, instead of individual elements.
     *
     * @private {boolean}
     */
    this.needsRemeasure_ = true;

    /**
     * The current cached size of the element.
     *
     * @private {!SizeDef}
     */
    this.size_ = sizeWh(0, 0);

    /**
     * The current cached **offset** position of the element, relative to the
     * parent layer. Note that offsets are constant, and unchanged by the
     * current scroll position of the parent.
     *
     * @private {!PositionDef}
     */
    this.position_ = positionLt(0, 0);

    /**
     * Whether the layout is a descendant of the most recently scrolled layer.
     *
     * Note: This attribute is `undefined`, unless the ancestry tree is currently
     * being iterated with #iterateAncestry. This is the only time it can be
     * determined without a ton of DOM checks.
     *
     * @private {boolean|undefined}
     */
    this.isActive_ = undefined;

    /**
     * Whether the element defines a layer with a new coordinate system.
     * Elements may freely transition to/from being a layer, causing child
     * elements to redefine their offset positions.
     *
     * @private {boolean}
     */
    this.isLayer_ = false;

    /**
     * Whether the layer is a "root" scrolling layer. Root scrollers have
     * special properties, mainly that they can never be un-declared (they will
     * always exist) and that their offset positions are not defined by
     * scrollTop (DOM APIs are inconsistent between a root scroller and an
     * overflow scroller).
     *
     * @private {boolean}
     */
    this.isRootLayer_ = false;

    /**
     * Whether this layer needs to remeasure its scrollTop/Left position during
     * the next position calculation. This is done lazily so that scroll
     * performance is not hampered.
     *
     * @private {boolean}
     */
    this.needsScrollRemeasure_ = false;

    /**
     * The scrollLeft of the layer (only layers use this).
     * @private {number}
     */
    this.scrollLeft_ = 0;

    /**
     * The scrollTop of the layer (only layers use this).
     * @private {number}
     */
    this.scrollTop_ = 0;

    /**
     * The child LayoutElements of this layer. Only a layer (which means it
     * defines a coordinate system) may have children, even if the element
     * _contains_ other elements.
     *
     * @const @private {!Array<!LayoutElement>}
     */
    this.children_ = [];
  }

  /**
   * Gets the element's LayoutElement instance.
   *
   * @param {!Element} element
   * @return {!LayoutElement}
   */
  static for(element) {
    return /** @type {!LayoutElement} */ (dev().assert(
        LayoutElement.forOptional(element)));
  }

  /**
   * Gets the element's LayoutElement instance, if the element has one.
   *
   * @param {!Element} element
   * @return {?LayoutElement}
   */
  static forOptional(element) {
    return element[LAYOUT_PROP] || null;
  }

  /**
   * Finds the element's parent layer
   *
   * If the element is itself a layer, it still looks in the element's ancestry
   * for a parent layer.
   *
   * TODO(jridgewell, #12554): Needs to traverse FIE/Shadow boundary.
   *
   * @param {!Element} node
   * @param {boolean=} opt_force Whether to force a re-lookup
   * @return {?LayoutElement}
   */
  static getParentLayer(node, opt_force) {
    if (!opt_force) {
      const layout = LayoutElement.forOptional(node);
      if (layout) {
        return layout.getParentLayer();
      }
    }

    const win = /** @type {!Window } */ (dev().assert(
        node.ownerDocument.defaultView));
    let op = node;
    for (let el = node; el; el = el.parentNode) {
      // Ensure the node (if it a layer itself) is not return as the parent
      // layer.
      const layout = el === node ? null : LayoutElement.forOptional(el);
      if (layout && layout.isLayer()) {
        return layout;
      }

      // Now, is this element fixed-position? We only check this on
      // offsetParent (and the original node itself) as a performance
      // optimization.
      if (el === op) {
        if (computedStyle(win, op).position == 'fixed') {
          // Ensure this fixed-position element is a layer.
          Services.layersForDoc(op).declareLayer(op);

          // If the op is fixed-position, it defines a new layer. But, if the
          // node is the op, we can't return the node as its own parent layer.
          // In that case, it doesn't have a parent layer.
          // TODO(jridgewell, #12554): Fixed position's parent is the FIE
          // element, what about Shadows?
          return op === node ? null : LayoutElement.for(op);
        }
        op = op./*OK*/offsetParent;
      }
    }

    // Use isConnected if available, but always pass if it's not.
    dev().assert(node.isConnected !== false, 'node not in the DOM tree');
    return null;
  }

  /**
   * Returns the unique identifier for each layout.
   *
   * @return {string}
   */
  getId() {
    return this.id_;
  }

  /**
   * A check that the LayoutElement is contained by this layer, and the element
   * is not the layer's element.
   *
   * TODO(jridgewell, #12554): This needs to account for FIE/Shadow's root,
   * since it will be a child layout of the host element.
   *
   * @param {!LayoutElement} layout
   * @return {boolean}
   */
  contains(layout) {
    return layout !== this && this.element_.contains(layout.element_);
  }

  /**
   * Adds the child to the list of children of this layer.
   *
   * @param {!LayoutElement} child;
   */
  add(child) {
    dev().assert(this.isLayer());
    dev().assert(this.contains(child));

    this.children_.push(child);
  }

  /**
   * Removes the child from the list of children of this layer.
   *
   * @param {!LayoutElement} child;
   */
  remove(child) {
    dev().assert(this.isLayer());
    dev().assert(child.getParentLayer() === this);

    const i = this.children_.indexOf(child);
    if (i > -1) {
      this.children_.splice(i, 1);
      child.forgetParentLayer();
    }
  }

  /**
   * Whether this element represents a layer with its own coordinate system.
   *
   * @return {boolean}
   */
  isLayer() {
    return this.isLayer_;
  }

  /**
   * Marks this element as a layer, which'll define its own coordinate system
   * for child elements.
   *
   * @param {boolean} isRootLayer
   */
  declareLayer(isRootLayer) {
    if (this.isLayer_) {
      return;
    }
    this.isLayer_ = true;
    this.isRootLayer_ = isRootLayer;

    // Ensure the coordinate system is remeasured
    this.needsRemeasure_ = true;
    this.needsScrollRemeasure_ = true;

    // Transfer all children elements into this new coordinate system
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

    const element = this.element_;
    const win = /** @type {!Window } */ (dev().assert(
        element.ownerDocument.defaultView));
    // If it remains fixed, it will still be a layer.
    if (computedStyle(win, element).position === 'fixed') {
      return;
    }

    this.isLayer_ = false;
    // Handle if this was a fixed position layer (and therefore had null parent
    // layer).
    const parent = this.getParentLayer() ||
        LayoutElement.getParentLayer(this.element_, true);
    this.transfer_(/** @type {!LayoutElement} */ (dev().assert(parent)));
  }

  /**
   * Transfers all children (contained inside the new layer) to a new layer.
   * Note, this new layer may actually be a parent layer if we're un-declaring
   * the this layer.
   *
   * @param {!LayoutElement} layer
   */
  transfer_(layer) {
    // An optimization if we know that the new layer definitely contains
    // everything in this layer.
    const contained = layer.contains(this);

    filterSplice(this.children_, layout => {
      if (contained || layer.contains(layout)) {
        // Mark the layout as needing a remeasure, since its offset position
        // has likely changed.
        layout.needsRemeasure_ = true;

        // And transfer ownership to the new layer.
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
   *
   * @return {?LayoutElement}
   */
  getParentLayer() {
    // An undefined cache means we haven't cached the parent yet. Let's find it
    // now.
    // Valid cached values are either null or a LayoutElement.
    if (this.parentLayer_ === undefined) {
      const parent = LayoutElement.getParentLayer(this.element_, true);
      this.parentLayer_ = parent;
      if (parent) {
        parent.add(this);
      }
    }
    return this.parentLayer_;
  }

  /**
   * Uncaches the parent layer, so a relookup will happen again. This is
   * necessary when the DOM resizes, or when reparenting nodes, since the old
   * parent layer may no longer be.
   */
  forgetParentLayer() {
    this.parentLayer_ = undefined;
  }

  /**
   * Gets the current size of the element.
   *
   * @return {!SizeDef}
   */
  getSize() {
    this.remeasure();
    return this.size_;
  }

  /**
   * Gets current offset of the element relative to the parent layer, without
   * taking scroll position into account.
   *
   * @return {!PositionDef}
   */
  getOffsetFromParent() {
    this.remeasure();
    return this.position_;
  }

  /**
   * Whether the layout is a descendant of the most recently scrolled layer.
   *
   * This MUST NOT be called unless inside an #iterateAncestry iterator
   * function.  "Activeness" is only determined for the lifespan of the
   * #iterateAncestry call.
   *
   * @return {boolean}
   */
  isActiveUnsafe() {
    return dev().assertBoolean(this.isActive_);
  }

  /**
   * Gets the minimal horizontal distance of this element from its parent's
   * "viewport".
   *
   * @return {number}
   */
  getHorizontalDistanceFromParent() {
    const parent = this.getParentLayer();
    if (!parent) {
      return 0;
    }

    const {left} = this.getOffsetFromParent();
    const {width} = this.getSize();
    const scrollLeft = parent.getScrollLeft();
    const parentWidth = parent.getSize().width;

    if (left + width < scrollLeft) {
      // Element is to the left of the parent viewport
      return scrollLeft - (left + width);
    }
    if (scrollLeft + parentWidth < left) {
      // Element is to the right of the parent viewport
      return left - (scrollLeft + parentWidth);
    }
    // Element intersects
    return 0;
  }

  /**
   * Gets the minimal vertical distance of this element from its parent's
   * "viewport".
   *
   * @return {number}
   */
  getVerticalDistanceFromParent() {
    const parent = this.getParentLayer();
    if (!parent) {
      return 0;
    }

    const {top} = this.getOffsetFromParent();
    const {height} = this.getSize();
    const scrollTop = parent.getScrollTop();
    const parentHeight = parent.getSize().height;

    if (top + height < scrollTop) {
      // Element is above the parent viewport
      return scrollTop - (top + height);
    }
    if (scrollTop + parentHeight < top) {
      // Element is below the parent viewport
      return top - (scrollTop + parentHeight);
    }
    // Element intersects
    return 0;
  }

  /*
   * Gets the current scrollTop of this layer.
   *
   * @return {number}
   */
  getScrollTop() {
    this.updateScrollPosition_();
    return this.scrollTop_;
  }

  /*
   * Gets the current scrollLeft of this layer.
   *
   * @return {number}
   */
  getScrollLeft() {
    this.updateScrollPosition_();
    return this.scrollLeft_;
  }

  /**
   * Returns the current scrolled position of the element relative to the layer
   * represented by opt_ancestor (or opt_ancestor's parent layer, if it is not
   * a layer itself). This takes into account the scrolled position of every
   * layer in between.
   *
   * @param {Element=} opt_ancestor
   * @return {!PositionDef}
   */
  getScrolledPosition(opt_ancestor) {
    // Compensate for the fact that the loop below will subtract the current
    // scroll position of this element. But, this element's scroll position
    // doesn't affect its overall position, only its children.
    // This is fine because the loop is guaranteed to roll at least once,
    // zeroing the scroll.
    let x = this.getScrollLeft();
    let y = this.getScrollTop();

    // Find the layer to stop measuring at. This is so that you can find the
    // relative position of an element from some parent element, say the
    // position of a slide inside a carousel, without any further measurements.
    const stopAt = opt_ancestor
      ? LayoutElement.getParentLayer(opt_ancestor)
      : null;
    for (let l = this; l !== stopAt; l = l.getParentLayer()) {
      const position = l.getOffsetFromParent();
      // Calculate the scrolled position. If the element has offset 200, and
      // the parent is scrolled 150, then the scrolled position is just 50.
      // Note that the scrolled position shouldn't take into account the scroll
      // position of this LayoutElement, so we've already compensated in
      // declaring x and y.
      x += position.left - l.getScrollLeft();
      y += position.top - l.getScrollTop();
    }

    return positionLt(x, y);
  }

  /**
   * Returns the absolute offset position of the element relative to the layer
   * represented by opt_ancestor (or opt_ancestor's parent layer, if it is not
   * a layer itself). This remains constant, regardless of the scrolled
   * position
   * of any layer in between.
   *
   * @param {Element=} opt_ancestor
   * @return {!PositionDef}
   */
  getOffsetPosition(opt_ancestor) {
    let x = 0;
    let y = 0;

    // Find the layer to stop measuring at. This is so that you can find the
    // relative position of an element from some parent element, say the
    // position of a slide inside a carousel, without any further measurements.
    const stopAt = opt_ancestor
      ? LayoutElement.getParentLayer(opt_ancestor)
      : null;

    for (let l = this; l !== stopAt; l = l.getParentLayer()) {
      const position = l.getOffsetFromParent();
      // Add up every offset position in the ancestry.
      x += position.left;
      y += position.top;
    }

    return positionLt(x, y);
  }

  /**
   * Dirties the element, so the next size/position calculation will remeasure
   * the element.
   */
  dirtyMeasurements() {
    this.needsRemeasure_ = true;
  }

  /**
   * Dirties the layer, so the next position calculation will remeasure the
   * scroll positions.
   */
  dirtyScrollMeasurements() {
    this.needsScrollRemeasure_ = true;
  }

  /**
   * Remasures the element's size and offset position. This traverse as high as
   * possible in the layer tree to remeasure as many elements as possible in
   * one go. This is necessary both from a performance standpoint, and to
   * ensure that any calculation uses the correct value, since layer in the
   * ancestry may have been dirtied.
   *
   * No matter what, though, the current element will be remeasured.
   */
  remeasure() {
    let layer = this;

    // Find the topmost dirty layer, and remeasure from there.
    for (let p = this.getParentLayer(); p; p = p.getParentLayer()) {
      if (p.needsRemeasure_) {
        layer = p;
      }
    }

    if (layer.needsRemeasure_) {
      layer.remeasure_();
    }
  }

  /**
   * Iterates the layout's parent layer ancestry, starting from the root down
   * to the layout.
   *
   * This sets a whether the layer isActive during that layer's iteration. Any
   * attempts to access #isActiveUnsafe outside of the iterator call will fail.
   *
   * @param {function(T, !LayoutElement, number, !AncestryStateDef):T} iterator
   * @param {!AncestryStateDef} state
   * @return {T}
   * @template T
   */
  iterateAncestry(iterator, state) {
    const activeLayer = Services.layersForDoc(this.element_).getActiveLayer();

    // Gather, and update whether the layers are descendants of the active
    // layer.
    let isActive = activeLayer === this || activeLayer.contains(this);
    dev().assert(ANCESTRY_CACHE.length === 0, 'ancestry cache must be empty');

    let layer = this;
    while (layer) {
      ANCESTRY_CACHE.push(layer);

      layer.isActive_ = isActive;
      if (layer === activeLayer) {
        isActive = false;
      }

      layer = layer.getParentLayer();
    }

    let accumulator = undefined;
    const length = ANCESTRY_CACHE.length;
    for (let i = 0; i < length; i++) {
      const layer = ANCESTRY_CACHE.pop();
      accumulator = iterator(accumulator, layer, i, state);
      layer.isActive_ = undefined;
    }
    return accumulator;
  }

  /**
   * Remeasures the element, and all children, since this element was marked dirty.
   *
   * @param {!PositionDef=} opt_relativeTo A performance optimization used when
   *     recursively measuring the child nodes of the layer.
   */
  remeasure_(opt_relativeTo) {
    this.updateScrollPosition_();
    this.needsRemeasure_ = false;
    const element = this.element_;

    // We need a relative box to measure our offset. Importantly, this box must
    // be negatively offset by its scroll position, to account for the fact
    // that getBoundingClientRect() will only return scrolled positions.
    let relative = opt_relativeTo;
    if (!relative) {
      const parent = this.getParentLayer();
      relative = parent ?
        relativeScrolledPositionForChildren(parent) :
        positionLt(0, 0);
    }

    this.size_ = sizeWh(element./*OK*/clientWidth, element./*OK*/clientHeight);

    let {left, top} = element./*OK*/getBoundingClientRect();
    // Root layers are really screwed up. Their positions will **double** count
    // their scroll position (left === -scrollLeft, top === -scrollTop), which
    // breaks with every other scroll box on the page.
    if (this.isRootLayer_) {
      left += this.getScrollLeft();
      top += this.getScrollTop();
    }
    this.position_ = positionLt(
        left - relative.left,
        top - relative.top
    );

    // In dev mode, we freeze the structs to prevent consumer from mutating it.
    // Stateless FTW.
    if ((getMode().localDev || getMode().test) && Object.freeze) {
      Object.freeze(this.size_);
      Object.freeze(this.position_);
    }

    // Now, recursively measure all child nodes, to since they've probably been
    // invalidated by the parent changing.
    const children = this.children_;
    if (children.length) {
      const relative = relativeScrolledPositionForChildren(this);
      for (let i = 0; i < children.length; i++) {
        // TODO(jridgewell): We can probably optimize this if this layer
        // didn't change at all.
        children[i].remeasure_(relative);
      }
    }
  }

  /**
   * Updates the cached scroll positions of the layer, if the layer is dirty.
   */
  updateScrollPosition_() {
    if (this.isLayer_ && this.needsScrollRemeasure_) {
      this.needsScrollRemeasure_ = false;
      this.scrollLeft_ = this.element_./*OK*/scrollLeft;
      this.scrollTop_ = this.element_./*OK*/scrollTop;
    }
  }
}

/**
 * Creates a relative measurement box to measure the offset of children
 * against. This negatively applies the current scroll position of the layer to
 * the coordinates, since the bounding box measurement of the child will have
 * positively applied that scroll position.
 *
 * @param {!LayoutElement} layer
 * @return {!PositionDef}
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
}
