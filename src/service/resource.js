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

import {
  layoutRectLtwh,
  layoutRectsOverlap,
  moveLayoutRect,
} from '../layout-rect';
import {dev} from '../log';
import {toggle} from '../style';

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
        dev().assert(Resource.forElementOptional(element),
            'Missing resource prop on %s', element));
  }

  /**
   * @param {!Element} element
   * @return {?Resource}
   */
  static forElementOptional(element) {
    return /** @type {!Resource} */ (element[RESOURCE_PROP_]);
  }

  /**
   * Assigns an owner for the specified element. This means that the resources
   * within this element will be managed by the owner and not Resources manager.
   * @param {!Element} element
   * @param {!AmpElement} owner
   */
  static setOwner(element, owner) {
    dev().assert(owner.contains(element), 'Owner must contain the element');
    if (Resource.forElementOptional(element)) {
      Resource.forElementOptional(element).updateOwner(owner);
    }
    element[OWNER_PROP_] = owner;

    // Need to clear owner cache for all child elements
    const cachedElements = element.getElementsByClassName('-amp-element');
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
    this.hostWin = element.ownerDocument.defaultView;

    /** @private {!./resources-impl.Resources} */
    this.resources_ = resources;

    /** @private {boolean} */
    this.blacklisted_ = false;

    /** @private {!AmpElement|undefined|null} */
    this.owner_ = undefined;

    /** @private {!ResourceState} */
    this.state_ = element.isBuilt() ? ResourceState.NOT_LAID_OUT :
        ResourceState.NOT_BUILT;

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

    /** @private {boolean} */
    this.isInViewport_ = false;

    /** @private {?Promise<undefined>} */
    this.layoutPromise_ = null;

   /**
    * Pending change size that was requested but could not be satisfied.
    * @private {!./resources-impl.SizeDef|undefined}
    */
    this.pendingChangeSize_ = undefined;

    /** @private {boolean} */
    this.loadedOnce_ = false;

    /** @private {?Function} */
    this.loadPromiseResolve_ = null;

    /** @private @const {!Promise} */
    this.loadPromise_ = new Promise(resolve => {
      this.loadPromiseResolve_ = resolve;
    });

    /** @private {boolean} */
    this.paused_ = false;
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
  getPriority() {
    return this.element.getPriority();
  }

  /**
   * Returns the resource's state. See {@link ResourceState} for details.
   * @return {!ResourceState}
   */
  getState() {
    return this.state_;
  }

  /**
   * Returns whether the resource has been blacklisted.
   * @return {boolean}
   */
  isBlacklisted() {
    return this.blacklisted_;
  }

  /**
   * Requests the resource's element to be built. See {@link AmpElement.build}
   * for details.
   */
  build() {
    if (this.blacklisted_ || !this.element.isUpgraded()) {
      return;
    }
    try {
      this.element.build();
    } catch (e) {
      dev().error(TAG, 'failed to build:', this.debugid, e);
      this.blacklisted_ = true;
      return;
    }

    if (this.hasBeenMeasured()) {
      this.state_ = ResourceState.READY_FOR_LAYOUT;
    } else {
      this.state_ = ResourceState.NOT_LAID_OUT;
    }
    this.element.dispatchCustomEvent('amp:built');
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
   */
  changeSize(newHeight, newWidth) {
    this.element./*OK*/changeSize(newHeight, newWidth);
    // Schedule for re-layout.
    if (this.state_ != ResourceState.NOT_BUILT) {
      this.state_ = ResourceState.NOT_LAID_OUT;
    }
  }

  /**
   * Informs the element that it's either overflown or not.
   * @param {boolean} overflown
   * @param {number|undefined} requestedHeight
   * @param {number|undefined} requestedWidth
   */
  overflowCallback(overflown, requestedHeight, requestedWidth) {
    if (overflown) {
      this.pendingChangeSize_ = {
        height: requestedHeight,
        width: requestedWidth,
      };
    }
    this.element.overflowCallback(overflown, requestedHeight, requestedWidth);
  }

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
   * Measures the resource's boundaries. An upgraded element will be
   * transitioned to the "ready for layout" state.
   */
  measure() {
    this.isMeasureRequested_ = false;

    let box = this.resources_.getViewport().getLayoutRect(this.element);
    const oldBox = this.layoutBox_;
    const viewport = this.resources_.getViewport();
    this.layoutBox_ = box;

    // Calculate whether the element is currently is or in `position:fixed`.
    let isFixed = false;
    if (this.isDisplayed()) {
      const win = this.resources_.win;
      const body = win.document.body;
      for (let n = this.element; n && n != body; n = n./*OK*/offsetParent) {
        if (n.isAlwaysFixed && n.isAlwaysFixed()) {
          isFixed = true;
          break;
        }
        if (viewport.isDeclaredFixed(n) &&
                win./*OK*/getComputedStyle(n).position == 'fixed') {
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
      box = this.layoutBox_ = moveLayoutRect(box, -viewport.getScrollLeft(),
          -viewport.getScrollTop());
    }

    // Note that "left" doesn't affect readiness for the layout.
    if (this.state_ == ResourceState.NOT_LAID_OUT ||
          oldBox.top != box.top ||
          oldBox.width != box.width ||
          oldBox.height != box.height) {

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

    this.element.updateLayoutBox(box);
  }

  /**
   * Completes collapse: ensures that the element is `display:none` and
   * updates layout box.
   */
  completeCollapse() {
    toggle(this.element, false);
    this.layoutBox_ = layoutRectLtwh(
        this.layoutBox_.left,
        this.layoutBox_.top,
        0, 0);
    this.isFixed_ = false;
    this.element.updateLayoutBox(this.layoutBox_);
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
    if (this.state_ == ResourceState.NOT_BUILT) {
      // Can't measure unbuilt element.
      return;
    }
    this.isMeasureRequested_ = true;
  }

  /**
   * Returns a previously measured layout box.
   * @return {!../layout-rect.LayoutRectDef}
   */
  getLayoutBox() {
    if (!this.isFixed_) {
      return this.layoutBox_;
    }
    const viewport = this.resources_.getViewport();
    return moveLayoutRect(this.layoutBox_, viewport.getScrollLeft(),
        viewport.getScrollTop());
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
    return this.layoutBox_.height > 0 && this.layoutBox_.width > 0;
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
    if (this.hasOwner()) {
      return true;
    }

    const renders = this.element.renderOutsideViewport();
    // Boolean interface, element is either always allowed or never allowed to
    // render outside viewport.
    if (renders === true || renders === false) {
      return renders;
    }
    // Numeric interface, element is allowed to render outside viewport when it
    // is within X times the viewport height of the current viewport.
    const viewportBox = this.resources_.getViewport().getRect();
    const layoutBox = this.getLayoutBox();
    const scrollDirection = this.resources_.getScrollDirection();
    const multipler = Math.max(renders, 0);
    let scrollPenalty = 1;
    let distance;
    if (viewportBox.right < layoutBox.left ||
        viewportBox.left > layoutBox.right) {
      // If outside of viewport's x-axis, element is not in viewport.
      return false;
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
      // Element is in viewport
      return true;
    }
    return distance < viewportBox.height * multipler / scrollPenalty;
  }

  /**
   * Sets the resource's state to LAYOUT_SCHEDULED.
   */
  layoutScheduled() {
    this.state_ = ResourceState.LAYOUT_SCHEDULED;
  }

  /**
   * Starts the layout of the resource. Returns the promise that will yield
   * once layout is complete. Only allowed to be called on a upgraded, built
   * and displayed element.
   * @param {boolean} isDocumentVisible
   * @return {!Promise}
   */
  startLayout(isDocumentVisible) {
    if (this.layoutPromise_) {
      return this.layoutPromise_;
    }
    if (this.state_ == ResourceState.LAYOUT_COMPLETE) {
      return Promise.resolve();
    }
    if (this.state_ == ResourceState.LAYOUT_FAILED) {
      return Promise.reject(this.lastLayoutError_);
    }

    dev().assert(this.state_ != ResourceState.NOT_BUILT,
        'Not ready to start layout: %s (%s)', this.debugid, this.state_);

    if (!isDocumentVisible && !this.prerenderAllowed()) {
      dev().fine(TAG, 'layout canceled due to non pre-renderable element:',
          this.debugid, this.state_);
      this.state_ = ResourceState.READY_FOR_LAYOUT;
      return Promise.resolve();
    }

    if (!this.isInViewport() && !this.renderOutsideViewport()) {
      dev().fine(TAG, 'layout canceled due to element not being in viewport:',
          this.debugid, this.state_);
      this.state_ = ResourceState.READY_FOR_LAYOUT;
      return Promise.resolve();
    }

    // Double check that the element has not disappeared since scheduling
    this.measure();
    if (!this.isDisplayed()) {
      dev().fine(TAG, 'layout canceled due to element loosing display:',
          this.debugid, this.state_);
      return Promise.resolve();
    }

    // Not-wanted re-layouts are ignored.
    if (this.layoutCount_ > 0 && !this.element.isRelayoutNeeded()) {
      dev().fine(TAG, 'layout canceled since it wasn\'t requested:',
          this.debugid, this.state_);
      this.state_ = ResourceState.LAYOUT_COMPLETE;
      return Promise.resolve();
    }

    dev().fine(TAG, 'start layout:', this.debugid, 'count:', this.layoutCount_);
    this.layoutCount_++;
    this.state_ = ResourceState.LAYOUT_SCHEDULED;

    let promise;
    try {
      promise = this.element.layoutCallback();
    } catch (e) {
      return Promise.reject(e);
    }

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
    return this.isInViewport_;
  }

  /**
   * Updates the inViewport state of the element.
   * @param {boolean} inViewport
   */
  setInViewport(inViewport) {
    if (inViewport == this.isInViewport_) {
      return;
    }
    dev().fine(TAG, 'inViewport:', this.debugid, inViewport);
    this.isInViewport_ = inViewport;
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
   * @param localId
   * @returns {string}
   */
  getTaskId(localId) {
    return this.debugid + '#' + localId;
  }

  /**
   * Calls element's pauseCallback callback.
   */
  pause() {
    if (this.state_ == ResourceState.NOT_BUILT || this.paused_) {
      return;
    }
    this.paused_ = true;
    this.setInViewport(false);
    this.element.pauseCallback();
    if (this.element.unlayoutOnPause()) {
      this.unlayout();
    }
  }

  /**
   * Calls element's pauseCallback callback.
   */
  pauseOnRemove() {
    if (this.state_ == ResourceState.NOT_BUILT) {
      return;
    }
    this.setInViewport(false);
    if (this.paused_) {
      return;
    }
    this.paused_ = true;
    this.element.pauseCallback();
  }

  /**
   * Calls element's resumeCallback callback.
   */
  resume() {
    if (this.state_ == ResourceState.NOT_BUILT || !this.paused_) {
      return;
    }
    this.paused_ = false;
    this.element.resumeCallback();
  }

  /**
   * Called when a previously visible element is no longer displayed.
   */
  unload() {
    this.pause();
    this.unlayout();
  }
}
