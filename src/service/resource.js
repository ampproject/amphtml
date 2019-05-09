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

import {AmpEvents} from '../amp-events';
import {Deferred} from '../utils/promise';
import {Layout} from '../layout';
import {Services} from '../services';
import {computedStyle, toggle} from '../style';
import {dev, devAssert} from '../log';
import {isBlockedByConsent} from '../error';
import {isExperimentOn} from '../experiments';
import {
  layoutRectLtwh,
  layoutRectSizeEquals,
  layoutRectsOverlap,
  moveLayoutRect,
} from '../layout-rect';
import {startsWith} from '../string';
import {toWin} from '../types';

const TAG = 'Resource';
const RESOURCE_PROP_ = '__AMP__RESOURCE';
const OWNER_PROP_ = '__AMP__OWNER';


/**
 * Resource state.
 *
 * @enum {number}
 */
export const ResourceState = {
  /**
   * The resource has not been built yet. Measures, layouts, preloads or
   * viewport signals are not allowed.
   */
  NOT_BUILT: 0,

  /**
   * The resource has been built, but not measured yet and not yet ready
   * for layout.
   */
  NOT_LAID_OUT: 1,

  /**
   * The resource has been built and measured and ready for layout.
   */
  READY_FOR_LAYOUT: 2,

  /**
   * The resource is currently scheduled for layout.
   */
  LAYOUT_SCHEDULED: 3,

  /**
   * The resource has been laid out.
   */
  LAYOUT_COMPLETE: 4,

  /**
   * The latest resource's layout failed.
   */
  LAYOUT_FAILED: 5,
};


/** @typedef {{
  distance: (boolean|number),
    viewportHeight: (number|undefined),
    scrollPenalty: (number|undefined),
  }} */
let ViewportRatioDef;

/**
 * A Resource binding for an AmpElement.
 * @package
 */
export class Resource {

  /**
   * @param {!Element} element
   * @return {!Resource}
   */
  static forElement(element) {
    return /** @type {!Resource} */ (
      devAssert(Resource.forElementOptional(element),
          'Missing resource prop on %s', element));
  }

  /**
   * @param {!Element} element
   * @return {Resource}
   */
  static forElementOptional(element) {
    return /** @type {Resource} */ (element[RESOURCE_PROP_]);
  }

  /**
   * Assigns an owner for the specified element. This means that the resources
   * within this element will be managed by the owner and not Resources manager.
   * @param {!Element} element
   * @param {!AmpElement} owner
   */
  static setOwner(element, owner) {
    devAssert(owner.contains(element), 'Owner must contain the element');
    if (Resource.forElementOptional(element)) {
      Resource.forElementOptional(element).updateOwner(owner);
    }
    element[OWNER_PROP_] = owner;

    // Need to clear owner cache for all child elements
    const cachedElements = element.getElementsByClassName('i-amphtml-element');
    for (let i = 0; i < cachedElements.length; i++) {
      const ele = cachedElements[i];
      if (Resource.forElementOptional(ele)) {
        Resource.forElementOptional(ele).updateOwner(undefined);
      }
    }
  }

  /**
   * @param {number} id
   * @param {!AmpElement} element
   * @param {!./resources-impl.Resources} resources
   */
  constructor(id, element, resources) {
    element[RESOURCE_PROP_] = this;

    /** @private {number} */
    this.id_ = id;

    /** @export @const {!AmpElement} */
    this.element = element;

    /** @export @const {string} */
    this.debugid = element.tagName.toLowerCase() + '#' + id;

    /** @const {!Window} */
    this.hostWin = toWin(element.ownerDocument.defaultView);

    /** @const @private {!./resources-impl.Resources} */
    this.resources_ = resources;

    /** @const @private {boolean} */
    this.isPlaceholder_ = element.hasAttribute('placeholder');

    /** @private {boolean} */
    this.isBuilding_ = false;

    /** @private {!AmpElement|undefined|null} */
    this.owner_ = undefined;

    /** @private {!ResourceState} */
    this.state_ = element.isBuilt() ? ResourceState.NOT_LAID_OUT :
      ResourceState.NOT_BUILT;

    /** @private {number} */
    this.priorityOverride_ = -1;

    /** @private {number} */
    this.layoutCount_ = 0;

    /** @private {*} */
    this.lastLayoutError_ = null;

    /** @private {boolean} */
    this.isFixed_ = false;

    /** @private {!../layout-rect.LayoutRectDef} */
    this.layoutBox_ = layoutRectLtwh(-10000, -10000, 0, 0);

    /** @private {?../layout-rect.LayoutRectDef} */
    this.initialLayoutBox_ = null;

    /** @private {boolean} */
    this.isMeasureRequested_ = false;

    /**
     * Really, this is a <number, !Deferred> map,
     * but CC's type system can't handle it.
     * @private {?Object<string, !Deferred>}
     */
    this.withViewportDeferreds_ = null;

    /** @private {?Promise<undefined>} */
    this.layoutPromise_ = null;

    /**
    * Pending change size that was requested but could not be satisfied.
    * @private {!./resources-impl.SizeDef|undefined}
    */
    this.pendingChangeSize_ = undefined;

    /** @private {boolean} */
    this.loadedOnce_ = false;

    const deferred = new Deferred();

    /** @private @const {!Promise} */
    this.loadPromise_ = deferred.promise;

    /** @private {?Function} */
    this.loadPromiseResolve_ = deferred.resolve;

    /** @private @const {boolean} */
    this.useLayers_ = isExperimentOn(this.hostWin, 'layers');

    /** @private @const {boolean} */
    this.useLayersPrioritization_ = isExperimentOn(this.hostWin,
        'layers-prioritization');

    /** @public {boolean} */
    this.forceBuild = false;
  }

  /**
   * Returns resource's ID.
   * @return {number}
   */
  getId() {
    return this.id_;
  }

  /**
   * Update owner element
   * @param {AmpElement|undefined} owner
   */
  updateOwner(owner) {
    this.owner_ = owner;
  }

  /**
   * Returns an owner element or null.
   * @return {?AmpElement}
   */
  getOwner() {
    if (this.owner_ === undefined) {
      for (let n = this.element; n; n = n.parentElement) {
        if (n[OWNER_PROP_]) {
          this.owner_ = n[OWNER_PROP_];
          break;
        }
      }
      if (this.owner_ === undefined) {
        this.owner_ = null;
      }
    }
    return this.owner_;
  }

  /**
   * Whether the resource has an owner.
   * @return {boolean}
   */
  hasOwner() {
    return !!this.getOwner();
  }

  /**
   * Returns the resource's element priority.
   * @return {number}
   */
  getLayoutPriority() {
    if (this.priorityOverride_ != -1) {
      return this.priorityOverride_;
    }
    return this.element.getLayoutPriority();
  }

  /**
   * Overrides the element's priority.
   * @param {number} newPriority
   */
  updateLayoutPriority(newPriority) {
    this.priorityOverride_ = newPriority;
  }

  /**
   * Returns the resource's state. See {@link ResourceState} for details.
   * @return {!ResourceState}
   */
  getState() {
    return this.state_;
  }

  /**
   * Returns whether the resource has been fully built.
   * @return {boolean}
   */
  isBuilt() {
    return this.element.isBuilt();
  }

  /**
   * Returns whether the resource is currently being built.
   * @return {boolean}
   */
  isBuilding() {
    return this.isBuilding_;
  }

  /**
   * Returns promise that resolves when the element has been built.
   * @return {!Promise}
   */
  whenBuilt() {
    // TODO(dvoytenko): merge with the standard BUILT signal.
    return this.element.signals().whenSignal('res-built');
  }

  /**
   * Requests the resource's element to be built. See {@link AmpElement.build}
   * for details.
   * @return {?Promise}
   */
  build() {
    if (this.isBuilding_ ||
        !this.element.isUpgraded() ||
        (!this.forceBuild && !this.resources_.grantBuildPermission())) {
      return null;
    }
    this.isBuilding_ = true;
    return this.element.build().then(() => {
      this.isBuilding_ = false;
      if (this.hasBeenMeasured()) {
        this.state_ = ResourceState.READY_FOR_LAYOUT;
        this.element.updateLayoutBox(this.getLayoutBox(), true);
      } else {
        this.state_ = ResourceState.NOT_LAID_OUT;
      }
      // TODO(dvoytenko): merge with the standard BUILT signal.
      this.element.signals().signal('res-built');
      // TODO(dvoytenko, #7389): cleanup once amp-sticky-ad signals are
      // in PROD.
      this.element.dispatchCustomEvent(AmpEvents.BUILT);
    }, reason => {
      this.maybeReportErrorOnBuildFailure(reason);
      this.isBuilding_ = false;
      this.element.signals().rejectSignal('res-built', reason);
      throw reason;
    });
  }

  /**
   * @param {*} reason
   * @visibleForTesting
   */
  maybeReportErrorOnBuildFailure(reason) {
    if (!isBlockedByConsent(reason)) {
      dev().error(TAG, 'failed to build:', this.debugid, reason);
    }
  }

  /**
   * Optionally hides or shows the element depending on the media query.
   */
  applySizesAndMediaQuery() {
    this.element.applySizesAndMediaQuery();
  }

  /**
   * Instructs the element to change its size and transitions to the state
   * awaiting the measure and possibly layout.
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
   */
  changeSize(newHeight, newWidth, opt_newMargins) {
    this.element./*OK*/changeSize(newHeight, newWidth, opt_newMargins);

    // Schedule for re-measure and possible re-layout.
    this.requestMeasure();
  }

  /**
   * Informs the element that it's either overflown or not.
   * @param {boolean} overflown
   * @param {number|undefined} requestedHeight
   * @param {number|undefined} requestedWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef|undefined} requestedMargins
   */
  overflowCallback(overflown, requestedHeight, requestedWidth,
    requestedMargins) {
    if (overflown) {
      this.pendingChangeSize_ = {
        height: requestedHeight,
        width: requestedWidth,
        margins: requestedMargins,
      };
    }
    this.element.overflowCallback(overflown, requestedHeight, requestedWidth,
        requestedMargins);
  }

  /** reset pending change sizes */
  resetPendingChangeSize() {
    this.pendingChangeSize_ = undefined;
  }

  /**
   * @return {!./resources-impl.SizeDef|undefined}
   */
  getPendingChangeSize() {
    return this.pendingChangeSize_;
  }

  /**
   * Time delay imposed by baseElement upgradeCallback.  If no
   * upgradeCallback specified or not yet executed, delay is 0.
   * @return {number}
   */
  getUpgradeDelayMs() {
    return this.element.getUpgradeDelayMs();
  }

  /**
   * Measures the resource's boundaries. An upgraded element will be
   * transitioned to the "ready for layout" state.
   */
  measure() {
    // Check if the element is ready to be measured.
    // Placeholders are special. They are technically "owned" by parent AMP
    // elements, sized by parents, but laid out independently. This means
    // that placeholders need to at least wait until the parent element
    // has been stubbed. We can tell whether the parent has been stubbed
    // by whether a resource has been attached to it.
    if (this.isPlaceholder_ &&
        this.element.parentElement &&
        // Use prefix to recognize AMP element. This is necessary because stub
        // may not be attached yet.
        startsWith(this.element.parentElement.tagName, 'AMP-') &&
        !(RESOURCE_PROP_ in this.element.parentElement)) {
      return;
    }

    this.isMeasureRequested_ = false;

    const oldBox = this.layoutBox_;
    if (this.useLayers_) {
      this.measureViaLayers_();
    } else {
      this.measureViaResources_();
    }
    const box = this.layoutBox_;

    // Note that "left" doesn't affect readiness for the layout.
    const sizeChanges = !layoutRectSizeEquals(oldBox, box);
    if (this.state_ == ResourceState.NOT_LAID_OUT ||
          oldBox.top != box.top || sizeChanges) {
      if (this.element.isUpgraded() &&
              this.state_ != ResourceState.NOT_BUILT &&
              (this.state_ == ResourceState.NOT_LAID_OUT ||
                  this.element.isRelayoutNeeded())) {
        this.state_ = ResourceState.READY_FOR_LAYOUT;
      }
    }

    if (!this.hasBeenMeasured()) {
      this.initialLayoutBox_ = box;
    }

    this.element.updateLayoutBox(box, sizeChanges);
  }

  /** Use resources for measurement */
  measureViaResources_() {
    const viewport = this.resources_.getViewport();
    const box = this.resources_.getViewport().getLayoutRect(this.element);
    this.layoutBox_ = box;

    // Calculate whether the element is currently is or in `position:fixed`.
    let isFixed = false;
    if (viewport.supportsPositionFixed() && this.isDisplayed()) {
      const {win} = this.resources_;
      const {body} = win.document;
      for (let n = this.element; n && n != body; n = n./*OK*/offsetParent) {
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
    this.isFixed_ = isFixed;

    if (isFixed) {
      // For fixed position elements, we need the relative position to the
      // viewport. When accessing the layoutBox through #getLayoutBox, we'll
      // return the new absolute position.
      this.layoutBox_ = moveLayoutRect(box, -viewport.getScrollLeft(),
          -viewport.getScrollTop());
    }
  }

  /** Use layers for measurement */
  measureViaLayers_() {
    const {element} = this;
    const layers = element.getLayers();
    /**
     * TODO(jridgewell): This force remeasure shouldn't be necessary. We
     * essentially have 3 phases of measurements:
     * 1. Initial measurements during page load, where we're not mutating
     * 2. Remeasurements after page load, where we might have mutated (but
     *    really shouldn't, it's a bug we haven't fixed yet)
     * 3. Mutation remeasurements
     *
     * We can optimize the initial measurements by not forcing remeasure. But
     * for both 2 and 3, we need for force it.
     */
    layers.remeasure(element, /* opt_force */ true);
    this.layoutBox_ = this.getPageLayoutBox();
  }

  /**
   * Completes collapse: ensures that the element is `display:none` and
   * updates layout box.
   */
  completeCollapse() {
    toggle(this.element, false);
    if (this.useLayers_) {
      this.layoutBox_ = layoutRectLtwh(0, 0, 0, 0);
    } else {
      this.layoutBox_ = layoutRectLtwh(
          this.layoutBox_.left,
          this.layoutBox_.top,
          0, 0);
    }
    this.isFixed_ = false;
    this.element.updateLayoutBox(this.getLayoutBox());
    const owner = this.getOwner();
    if (owner) {
      owner.collapsedCallback(this.element);
    }
  }

  /**
   * Completes expand: ensures that the element is not `display:none` and
   * updates measurements.
   */
  completeExpand() {
    toggle(this.element, true);
    this.requestMeasure();
  }

  /**
   * @return {boolean}
   */
  isMeasureRequested() {
    return this.isMeasureRequested_;
  }

  /**
   * Checks if the current resource has been measured.
   * @return {boolean}
   */
  hasBeenMeasured() {
    return !!this.initialLayoutBox_;
  }

  /**
   * Requests the element to be remeasured on the next pass.
   */
  requestMeasure() {
    this.isMeasureRequested_ = true;
  }

  /**
   * Returns a previously measured layout box adjusted to the viewport. This
   * mainly affects fixed-position elements that are adjusted to be always
   * relative to the document position in the viewport.
   * @return {!../layout-rect.LayoutRectDef}
   */
  getLayoutBox() {
    if (this.useLayers_) {
      // TODO(jridgewell): transition all callers to position and/or size calls
      // directly.
      const {element} = this;
      const layers = element.getLayers();
      const pos = layers.getScrolledPosition(element);
      const size = layers.getSize(element);
      return layoutRectLtwh(pos.left, pos.top, size.width, size.height);
    }

    if (!this.isFixed_) {
      return this.layoutBox_;
    }
    const viewport = this.resources_.getViewport();
    return moveLayoutRect(this.layoutBox_, viewport.getScrollLeft(),
        viewport.getScrollTop());
  }

  /**
   * Returns a previously measured layout box relative to the page. The
   * fixed-position elements are relative to the top of the document.
   * @return {!../layout-rect.LayoutRectDef}
   */
  getPageLayoutBox() {
    if (this.useLayers_) {
      const {element} = this;
      const layers = element.getLayers();
      const pos = layers.getOffsetPosition(element);
      const size = layers.getSize(element);
      return layoutRectLtwh(pos.left, pos.top, size.width, size.height);
    }

    return this.layoutBox_;
  }

  /**
   * Returns the first measured layout box.
   * @return {!../layout-rect.LayoutRectDef}
   */
  getInitialLayoutBox() {
    // Before the first measure, there will be no initial layoutBox.
    // Luckily, layoutBox will be present but essentially useless.
    return this.initialLayoutBox_ || this.layoutBox_;
  }

  /**
   * Whether the resource is displayed, i.e. if it has non-zero width and
   * height.
   * @return {boolean}
   */
  isDisplayed() {
    const isFluid = this.element.getLayout() == Layout.FLUID;
    // TODO(jridgewell): #getSize
    const box = this.getLayoutBox();
    const hasNonZeroSize = box.height > 0 && box.width > 0;
    return (isFluid || hasNonZeroSize) &&
        !!this.element.ownerDocument &&
        !!this.element.ownerDocument.defaultView;
  }

  /**
   * Whether the element is fixed according to the latest measurement.
   * @return {boolean}
   */
  isFixed() {
    return this.isFixed_;
  }

  /**
   * Whether the element's layout box overlaps with the specified rect.
   * @param {!../layout-rect.LayoutRectDef} rect
   * @return {boolean}
   */
  overlaps(rect) {
    return layoutRectsOverlap(this.getLayoutBox(), rect);
  }

  /**
   * Whether this element can be pre-rendered.
   * @return {boolean}
   */
  prerenderAllowed() {
    return this.element.prerenderAllowed();
  }

  /**
   * @param {number|boolean} viewport derived from renderOutsideViewport.
   * @return {!Promise} resolves when underlying element is built and within the
   *    viewport range given.
   */
  whenWithinViewport(viewport) {
    devAssert(viewport !== false);
    // Resolve is already laid out or viewport is true.
    if (!this.isLayoutPending() || viewport === true) {
      return Promise.resolve();
    }
    // See if pre-existing promise.
    const viewportNum = dev().assertNumber(viewport);
    const key = String(viewportNum);
    if (this.withViewportDeferreds_ &&
        this.withViewportDeferreds_[key]) {
      return this.withViewportDeferreds_[key].promise;
    }
    // See if already within viewport multiplier.
    if (this.isWithinViewportRatio(viewportNum)) {
      return Promise.resolve();
    }
    // return promise that will trigger when within viewport multiple.
    this.withViewportDeferreds_ = this.withViewportDeferreds_ || {};
    this.withViewportDeferreds_[key] = new Deferred();
    return this.withViewportDeferreds_[key].promise;
  }

  /** @private resolves promises populated via whenWithinViewport. */
  resolveDeferredsWhenWithinViewports_() {
    if (!this.withViewportDeferreds_) {
      return;
    }
    const viewportRatio = this.getDistanceViewportRatio();
    for (const key in this.withViewportDeferreds_) {
      if (this.isWithinViewportRatio(parseFloat(key), viewportRatio)) {
        this.withViewportDeferreds_[key].resolve();
        delete this.withViewportDeferreds_[key];
      }
    }
  }

  /** @return {!ViewportRatioDef} */
  getDistanceViewportRatio() {
    if (this.useLayers_ && this.useLayersPrioritization_) {
      const {element} = this;
      return {
        distance: element.getLayers().iterateAncestry(element,
            this.layersDistanceRatio_),
      };
    }

    // Numeric interface, element is allowed to render outside viewport when it
    // is within X times the viewport height of the current viewport.
    const viewportBox = this.resources_.getViewport().getRect();
    const layoutBox = this.getLayoutBox();
    const scrollDirection = this.resources_.getScrollDirection();
    let scrollPenalty = 1;
    let distance = 0;

    if (viewportBox.right < layoutBox.left ||
        viewportBox.left > layoutBox.right) {
      // If outside of viewport's x-axis, element is not in viewport so return
      // false.
      return {distance: false};
    }

    if (viewportBox.bottom < layoutBox.top) {
      // Element is below viewport
      distance = layoutBox.top - viewportBox.bottom;

      // If we're scrolling away from the element
      if (scrollDirection == -1) {
        scrollPenalty = 2;
      }
    } else if (viewportBox.top > layoutBox.bottom) {
      // Element is above viewport
      distance = viewportBox.top - layoutBox.bottom;

      // If we're scrolling away from the element
      if (scrollDirection == 1) {
        scrollPenalty = 2;
      }
    } else {
      // Element is in viewport so return true for all but boolean false.
      return {distance: true};
    }
    return {distance, scrollPenalty, viewportHeight: viewportBox.height};
  }

  /**
   * @param {number|boolean} multiplier
   * @param {ViewportRatioDef=} opt_viewportRatio
   * @return {boolean} whether multiplier given is within viewport ratio
   * @visibleForTesting
   */
  isWithinViewportRatio(multiplier, opt_viewportRatio) {
    if (typeof multiplier === 'boolean') {
      return multiplier;
    }
    const {distance, scrollPenalty, viewportHeight} =
      opt_viewportRatio || this.getDistanceViewportRatio();
    if (this.useLayers_ && this.useLayersPrioritization_) {
      return dev().assertNumber(distance) < multiplier;
    }
    if (typeof distance == 'boolean') {
      return distance;
    }
    return distance < viewportHeight * multiplier / scrollPenalty;
  }

  /**
   * Calculates the layout's viewport distance ratio, using an iterative
   * calculation based on tree depth and number of layer scrolls it would take
   * to view the element.
   *
   * @param {number|undefined} currentScore
   * @param {!./layers-impl.LayoutElement} layout
   * @param {number} depth
   * @return {number}
   */
  layersDistanceRatio_(currentScore, layout, depth) {
    currentScore = currentScore || 0;
    const depthPenalty = 1 + (depth / 10);
    const nonActivePenalty = layout.isActiveUnsafe() ? 1 : 2;
    const distance = layout.getHorizontalViewportsFromParent() +
        layout.getVerticalViewportsFromParent();
    return currentScore + (nonActivePenalty * depthPenalty * distance);
  }

  /**
   * Whether this is allowed to render when not in viewport.
   * @return {boolean}
   */
  renderOutsideViewport() {
    // The exception is for owned resources, since they only attempt to
    // render outside viewport when the owner has explicitly allowed it.
    // TODO(jridgewell, #5803): Resources should be asking owner if it can
    // prerender this resource, so that it can avoid expensive elements wayyy
    // outside of viewport. For now, blindly trust that owner knows what it's
    // doing.
    this.resolveDeferredsWhenWithinViewports_();
    return this.hasOwner() || this.isWithinViewportRatio(
        this.element.renderOutsideViewport());
  }

  /**
   * Whether this is allowed to render when scheduler is idle but not in
   * viewport.
   * @return {boolean}
   */
  idleRenderOutsideViewport() {
    return this.isWithinViewportRatio(
        this.element.idleRenderOutsideViewport());
  }

  /**
   * Sets the resource's state to LAYOUT_SCHEDULED.
   * @param {number} scheduleTime The time at which layout was scheduled.
   */
  layoutScheduled(scheduleTime) {
    this.state_ = ResourceState.LAYOUT_SCHEDULED;
    this.element.layoutScheduleTime = scheduleTime;
  }

  /**
   * Undoes `layoutScheduled`.
   */
  layoutCanceled() {
    this.state_ =
        this.hasBeenMeasured() ?
          ResourceState.READY_FOR_LAYOUT :
          ResourceState.NOT_LAID_OUT;
  }

  /**
   * Starts the layout of the resource. Returns the promise that will yield
   * once layout is complete. Only allowed to be called on a upgraded, built
   * and displayed element.
   * @return {!Promise}
   * @package
   */
  startLayout() {
    if (this.layoutPromise_) {
      return this.layoutPromise_;
    }
    if (this.state_ == ResourceState.LAYOUT_COMPLETE) {
      return Promise.resolve();
    }
    if (this.state_ == ResourceState.LAYOUT_FAILED) {
      return Promise.reject(this.lastLayoutError_);
    }

    devAssert(this.state_ != ResourceState.NOT_BUILT,
        'Not ready to start layout: %s (%s)', this.debugid, this.state_);
    devAssert(this.isDisplayed(),
        'Not displayed for layout: %s', this.debugid);

    // Unwanted re-layouts are ignored.
    if (this.layoutCount_ > 0 && !this.element.isRelayoutNeeded()) {
      dev().fine(TAG, 'layout canceled since it wasn\'t requested:',
          this.debugid, this.state_);
      this.state_ = ResourceState.LAYOUT_COMPLETE;
      return Promise.resolve();
    }

    dev().fine(TAG, 'start layout:', this.debugid, 'count:', this.layoutCount_);
    this.layoutCount_++;
    this.state_ = ResourceState.LAYOUT_SCHEDULED;

    const promise = new Promise((resolve, reject) => {
      Services.vsyncFor(this.hostWin).mutate(() => {
        try {
          resolve(this.element.layoutCallback());
        } catch (e) {
          reject(e);
        }
      });
    });

    this.layoutPromise_ = promise.then(() => this.layoutComplete_(true),
        reason => this.layoutComplete_(false, reason));
    return this.layoutPromise_;
  }

  /**
   * @param {boolean} success
   * @param {*=} opt_reason
   * @return {!Promise|undefined}
   */
  layoutComplete_(success, opt_reason) {
    if (this.loadPromiseResolve_) {
      this.loadPromiseResolve_();
      this.loadPromiseResolve_ = null;
    }
    this.layoutPromise_ = null;
    this.loadedOnce_ = true;
    this.state_ = success ? ResourceState.LAYOUT_COMPLETE :
      ResourceState.LAYOUT_FAILED;
    this.lastLayoutError_ = opt_reason;
    if (success) {
      dev().fine(TAG, 'layout complete:', this.debugid);
    } else {
      dev().fine(TAG, 'loading failed:', this.debugid, opt_reason);
      return Promise.reject(opt_reason);
    }
  }

  /**
   * Returns true if the resource layout has not completed or failed.
   * @return {boolean}
   * */
  isLayoutPending() {
    return this.state_ != ResourceState.LAYOUT_COMPLETE &&
        this.state_ != ResourceState.LAYOUT_FAILED;
  }

  /**
   * Returns a promise that is resolved when this resource is laid out
   * for the first time and the resource was loaded. Note that the resource
   * could be unloaded subsequently. This method returns resolved promise for
   * sunch unloaded elements.
   * @return {!Promise}
   */
  loadedOnce() {
    return this.loadPromise_;
  }

  /**
   * @return {boolean} true if the resource has been loaded at least once.
   */
  hasLoadedOnce() {
    return this.loadedOnce_;
  }

  /**
   * Whether the resource is currently visible in the viewport.
   * @return {boolean}
   */
  isInViewport() {
    const isInViewport = this.element.isInViewport();
    if (isInViewport) {
      this.resolveDeferredsWhenWithinViewports_();
    }
    return isInViewport;
  }

  /**
   * Updates the inViewport state of the element.
   * @param {boolean} inViewport
   */
  setInViewport(inViewport) {
    this.element.viewportCallback(inViewport);
  }

  /**
   * Calls element's unlayoutCallback callback and resets state for
   * relayout in case document becomes active again.
   */
  unlayout() {
    if (this.state_ == ResourceState.NOT_BUILT ||
        this.state_ == ResourceState.NOT_LAID_OUT) {
      return;
    }
    this.setInViewport(false);
    if (this.element.unlayoutCallback()) {
      this.element.togglePlaceholder(true);
      this.state_ = ResourceState.NOT_LAID_OUT;
      this.layoutCount_ = 0;
      this.layoutPromise_ = null;
    }
  }

  /**
   * Returns the task ID for this resource.
   * @param {string} localId
   * @return {string}
   */
  getTaskId(localId) {
    return this.debugid + '#' + localId;
  }

  /**
   * Calls element's pauseCallback callback.
   */
  pause() {
    this.element.pauseCallback();
    if (this.element.unlayoutOnPause()) {
      this.unlayout();
    }
  }

  /**
   * Calls element's pauseCallback callback.
   */
  pauseOnRemove() {
    this.element.pauseCallback();
  }

  /**
   * Calls element's resumeCallback callback.
   */
  resume() {
    this.element.resumeCallback();
  }

  /**
   * Called when a previously visible element is no longer displayed.
   */
  unload() {
    this.pause();
    this.unlayout();
  }

  /**
   * Disconnect the resource. Mainly intended for embed resources that do not
   * receive `disconnectedCallback` naturally via CE API.
   */
  disconnect() {
    delete this.element[RESOURCE_PROP_];
    this.element.disconnect(/* opt_pretendDisconnected */ true);
  }
}
