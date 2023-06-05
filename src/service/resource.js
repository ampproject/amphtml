import {Deferred} from '#core/data-structures/promise';
import {Layout_Enum} from '#core/dom/layout';
import {
  layoutRectLtwh,
  layoutRectSizeEquals,
  layoutSizeFromRect,
  moveLayoutRect,
  rectsOverlap,
} from '#core/dom/layout/rect';
import {computedStyle, toggle} from '#core/dom/style';
import {toWin} from '#core/window';

import {Services} from '#service';

import {dev, devAssert} from '#utils/log';

import {
  cancellation,
  isBlockedByConsent,
  reportError,
} from '../error-reporting';

const TAG = 'Resource';
const RESOURCE_PROP_ = '__AMP__RESOURCE';
const OWNER_PROP_ = '__AMP__OWNER';

/**
 * Resource state.
 *
 * @enum {number}
 */
export const ResourceState_Enum = {
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
 */
export class Resource {
  /**
   * @param {!Element} element
   * @return {!Resource}
   */
  static forElement(element) {
    return /** @type {!Resource} */ (
      devAssert(
        Resource.forElementOptional(element),
        'Missing resource prop on %s',
        element
      )
    );
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
   * @param {!./resources-interface.ResourcesInterface} resources
   */
  constructor(id, element, resources) {
    element[RESOURCE_PROP_] = this;

    /** @private {number} */
    this.id_ = id;

    /** @const {!AmpElement} */
    this.element = element;

    /** @const {string} */
    this.debugid = element.tagName.toLowerCase() + '#' + id;

    /** @const {!Window} */
    this.hostWin = toWin(element.ownerDocument.defaultView);

    /** @const @private {!./resources-interface.ResourcesInterface} */
    this.resources_ = resources;

    /** @const @private {boolean} */
    this.isPlaceholder_ = element.hasAttribute('placeholder');

    /** @private {boolean} */
    this.isBuilding_ = false;

    /** @private {!AmpElement|undefined|null} */
    this.owner_ = undefined;

    /** @private {!ResourceState_Enum} */
    this.state_ = element.isBuilt()
      ? ResourceState_Enum.NOT_LAID_OUT
      : ResourceState_Enum.NOT_BUILT;

    // Race condition: if an element is reparented while building, it'll
    // receive a newly constructed Resource. Make sure this Resource's
    // internal state is also "building".
    if (this.state_ == ResourceState_Enum.NOT_BUILT && element.isBuilding()) {
      this.build();
    }

    /** @private {number} */
    this.priorityOverride_ = -1;

    /** @private {number} */
    this.layoutCount_ = 0;

    /**
     * Used to signal that the current layoutCallback has been aborted by an
     * unlayoutCallback.
     * @private {?AbortController}
     */
    this.abortController_ = null;

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
     * @private {?{[key: string]: !Deferred}}
     */
    this.withViewportDeferreds_ = null;

    /** @private {?Promise<undefined>} */
    this.layoutPromise_ = null;

    /**
     * Pending change size that was requested but could not be satisfied.
     * @private {!./resources-impl.SizeDef|undefined}
     */
    this.pendingChangeSize_ = undefined;

    const deferred = new Deferred();

    /** @private @const {!Promise} */
    this.loadPromise_ = deferred.promise;

    /** @private {?Function} */
    this.loadPromiseResolve_ = deferred.resolve;

    // TODO(#30620): remove isInViewport_ and whenWithinViewport.
    /** @const @private {boolean} */
    this.isInViewport_ = false;
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
   * Returns the resource's state. See {@link ResourceState_Enum} for details.
   * @return {!ResourceState_Enum}
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
    if (this.isBuilding_ || !this.element.isUpgraded()) {
      return null;
    }
    this.isBuilding_ = true;
    return this.element.buildInternal().then(
      () => {
        this.isBuilding_ = false;
        this.state_ = ResourceState_Enum.NOT_LAID_OUT;
        // TODO(dvoytenko): merge with the standard BUILT signal.
        this.element.signals().signal('res-built');
      },
      (reason) => {
        this.maybeReportErrorOnBuildFailure(reason);
        this.isBuilding_ = false;
        this.element.signals().rejectSignal('res-built', reason);
        throw reason;
      }
    );
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
   * Instructs the element to change its size and transitions to the state
   * awaiting the measure and possibly layout.
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
   */
  changeSize(newHeight, newWidth, opt_newMargins) {
    this.element./*OK*/ applySize(newHeight, newWidth, opt_newMargins);

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
  overflowCallback(
    overflown,
    requestedHeight,
    requestedWidth,
    requestedMargins
  ) {
    if (overflown) {
      this.pendingChangeSize_ = {
        height: requestedHeight,
        width: requestedWidth,
        margins: requestedMargins,
      };
    }
    this.element.overflowCallback(
      overflown,
      requestedHeight,
      requestedWidth,
      requestedMargins
    );
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
    if (
      this.isPlaceholder_ &&
      this.element.parentElement &&
      // Use prefix to recognize AMP element. This is necessary because stub
      // may not be attached yet.
      this.element.parentElement.tagName.startsWith('AMP-') &&
      !(RESOURCE_PROP_ in this.element.parentElement)
    ) {
      return;
    }
    if (
      !this.element.ownerDocument ||
      !this.element.ownerDocument.defaultView
    ) {
      // Most likely this is an element who's window has just been destroyed.
      // This is an issue with FIE embeds destruction. Such elements will be
      // considered "not displayable" until they are GC'ed.
      this.state_ = ResourceState_Enum.NOT_LAID_OUT;
      return;
    }

    this.isMeasureRequested_ = false;

    const oldBox = this.layoutBox_;
    this.computeMeasurements_();
    const newBox = this.layoutBox_;

    // Note that "left" doesn't affect readiness for the layout.
    const sizeChanges = !layoutRectSizeEquals(oldBox, newBox);
    if (
      this.state_ == ResourceState_Enum.NOT_LAID_OUT ||
      oldBox.top != newBox.top ||
      sizeChanges
    ) {
      if (this.element.isUpgraded()) {
        if (this.state_ == ResourceState_Enum.NOT_LAID_OUT) {
          // If the element isn't laid out yet, then we're now ready for layout.
          this.state_ = ResourceState_Enum.READY_FOR_LAYOUT;
        } else if (
          (this.state_ == ResourceState_Enum.LAYOUT_COMPLETE ||
            this.state_ == ResourceState_Enum.LAYOUT_FAILED) &&
          this.element.isRelayoutNeeded()
        ) {
          // If the element was already laid out and we need to relayout, then
          // go back to ready for layout.
          this.state_ = ResourceState_Enum.READY_FOR_LAYOUT;
        }
      }
    }

    if (!this.hasBeenMeasured()) {
      this.initialLayoutBox_ = newBox;
    }

    this.element.updateLayoutBox(newBox, sizeChanges);
  }

  /**
   * Yields when the resource has been measured.
   * @return {!Promise}
   */
  ensureMeasured() {
    if (this.hasBeenMeasured()) {
      return Promise.resolve();
    }
    return Services.vsyncFor(this.hostWin).measure(() => this.measure());
  }

  /**
   * Computes the current layout box and position-fixed state of the element.
   * @private
   */
  computeMeasurements_() {
    const viewport = Services.viewportForDoc(this.element);
    this.layoutBox_ = viewport.getLayoutRect(this.element);

    // Calculate whether the element is currently is or in `position:fixed`.
    let isFixed = false;
    if (viewport.supportsPositionFixed() && this.isDisplayed()) {
      const {win} = this.resources_.getAmpdoc();
      const {body} = win.document;
      for (let n = this.element; n && n != body; n = n./*OK*/ offsetParent) {
        if (n.isAlwaysFixed && n.isAlwaysFixed()) {
          isFixed = true;
          break;
        }
        if (
          viewport.isDeclaredFixed(n) &&
          computedStyle(win, n).position == 'fixed'
        ) {
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
      this.layoutBox_ = moveLayoutRect(
        this.layoutBox_,
        -viewport.getScrollLeft(),
        -viewport.getScrollTop()
      );
    }
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
      0,
      0
    );
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
   * Returns a previously measured layout size.
   * @return {!../layout-rect.LayoutSizeDef}
   */
  getLayoutSize() {
    return layoutSizeFromRect(this.layoutBox_);
  }

  /**
   * Returns a previously measured layout box adjusted to the viewport. This
   * mainly affects fixed-position elements that are adjusted to be always
   * relative to the document position in the viewport.
   * The returned layoutBox is:
   * - relative to the top of the document for non fixed element,
   * - relative to the top of the document at current scroll position
   *   for fixed element.
   * @return {!../layout-rect.LayoutRectDef}
   */
  getLayoutBox() {
    if (!this.isFixed_) {
      return this.layoutBox_;
    }
    const viewport = Services.viewportForDoc(this.element);
    return moveLayoutRect(
      this.layoutBox_,
      viewport.getScrollLeft(),
      viewport.getScrollTop()
    );
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
    const isConnected =
      this.element.ownerDocument && this.element.ownerDocument.defaultView;
    if (!isConnected) {
      return false;
    }
    const isFluid = this.element.getLayout() == Layout_Enum.FLUID;
    const box = this.getLayoutBox();
    const hasNonZeroSize = box.height > 0 && box.width > 0;
    return isFluid || hasNonZeroSize;
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
    return rectsOverlap(this.getLayoutBox(), rect);
  }

  /**
   * Whether this element can be pre-rendered.
   * @return {boolean}
   */
  prerenderAllowed() {
    return this.element.prerenderAllowed();
  }

  /**
   * Whether this element can be previewed.
   * @return {boolean}
   */
  previewAllowed() {
    return this.element.previewAllowed();
  }

  /**
   * Whether this element has render-blocking service.
   * @return {boolean}
   */
  isBuildRenderBlocking() {
    return this.element.isBuildRenderBlocking();
  }

  /**
   * @param {number|boolean} viewport derived from renderOutsideViewport.
   * @return {!Promise} resolves when underlying element is built and within the
   *    viewport range given.
   */
  whenWithinViewport(viewport) {
    // TODO(#30620): remove this method once IntersectionObserver{root:doc} is
    // polyfilled.
    devAssert(viewport !== false);
    // Resolve is already laid out or viewport is true.
    if (!this.isLayoutPending() || viewport === true) {
      return Promise.resolve();
    }
    // See if pre-existing promise.
    const viewportNum = dev().assertNumber(viewport);
    const key = String(viewportNum);
    if (this.withViewportDeferreds_ && this.withViewportDeferreds_[key]) {
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
    // Numeric interface, element is allowed to render outside viewport when it
    // is within X times the viewport height of the current viewport.
    const viewport = Services.viewportForDoc(this.element);
    const viewportBox = viewport.getRect();
    const layoutBox = this.getLayoutBox();
    const scrollDirection = this.resources_.getScrollDirection();
    let scrollPenalty = 1;
    let distance = 0;

    if (
      viewportBox.right < layoutBox.left ||
      viewportBox.left > layoutBox.right
    ) {
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
    if (typeof distance == 'boolean') {
      return distance;
    }
    return distance < (viewportHeight * multiplier) / scrollPenalty;
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
    return (
      this.hasOwner() ||
      this.isWithinViewportRatio(this.element.renderOutsideViewport())
    );
  }

  /**
   * Whether this is allowed to render when scheduler is idle but not in
   * viewport.
   * @return {boolean}
   */
  idleRenderOutsideViewport() {
    return this.isWithinViewportRatio(this.element.idleRenderOutsideViewport());
  }

  /**
   * Sets the resource's state to LAYOUT_SCHEDULED.
   * @param {number} scheduleTime The time at which layout was scheduled.
   */
  layoutScheduled(scheduleTime) {
    this.state_ = ResourceState_Enum.LAYOUT_SCHEDULED;
    this.element.layoutScheduleTime = scheduleTime;
  }

  /**
   * Undoes `layoutScheduled`.
   */
  layoutCanceled() {
    this.state_ = this.hasBeenMeasured()
      ? ResourceState_Enum.READY_FOR_LAYOUT
      : ResourceState_Enum.NOT_LAID_OUT;
  }

  /**
   * Starts the layout of the resource. Returns the promise that will yield
   * once layout is complete. Only allowed to be called on a upgraded, built
   * and displayed element.
   * @return {!Promise}
   */
  startLayout() {
    if (this.layoutPromise_) {
      return this.layoutPromise_;
    }
    if (this.state_ == ResourceState_Enum.LAYOUT_COMPLETE) {
      return Promise.resolve();
    }
    if (this.state_ == ResourceState_Enum.LAYOUT_FAILED) {
      return Promise.reject(this.lastLayoutError_);
    }

    devAssert(
      this.state_ != ResourceState_Enum.NOT_BUILT,
      'Not ready to start layout: %s (%s)',
      this.debugid,
      this.state_
    );
    devAssert(this.isDisplayed(), 'Not displayed for layout: %s', this.debugid);

    if (this.state_ != ResourceState_Enum.LAYOUT_SCHEDULED) {
      const err = dev().createExpectedError(
        'startLayout called but not LAYOUT_SCHEDULED',
        'currently: ',
        this.state_
      );
      reportError(err, this.element);
      return Promise.reject(err);
    }

    // Unwanted re-layouts are ignored.
    if (this.layoutCount_ > 0 && !this.element.isRelayoutNeeded()) {
      dev().fine(
        TAG,
        "layout canceled since it wasn't requested:",
        this.debugid,
        this.state_
      );
      this.state_ = ResourceState_Enum.LAYOUT_COMPLETE;
      return Promise.resolve();
    }

    dev().fine(TAG, 'start layout:', this.debugid, 'count:', this.layoutCount_);
    this.layoutCount_++;
    this.state_ = ResourceState_Enum.LAYOUT_SCHEDULED;
    this.abortController_ = new AbortController();
    const {signal} = this.abortController_;

    const promise = new Promise((resolve, reject) => {
      Services.vsyncFor(this.hostWin).mutate(() => {
        let callbackResult;
        try {
          callbackResult = this.element.layoutCallback(signal);
        } catch (e) {
          reject(e);
        }
        Promise.resolve(callbackResult).then(resolve, reject);
      });
      signal.onabort = () => reject(cancellation());
    }).then(
      () => this.layoutComplete_(true, signal),
      (reason) => this.layoutComplete_(false, signal, reason)
    );

    return (this.layoutPromise_ = promise);
  }

  /**
   * @param {boolean} success
   * @param {!AbortSignal} signal
   * @param {*=} opt_reason
   * @return {!Promise|undefined}
   */
  layoutComplete_(success, signal, opt_reason) {
    this.abortController_ = null;
    if (signal.aborted) {
      // We hit a race condition, where `layoutCallback` -> `unlayoutCallback`
      // was called in quick succession. Since the unlayout was called before
      // the layout completed, we want to remain in the unlayout state.
      const err = dev().createError('layoutComplete race');
      err.associatedElement = this.element;
      dev().expectedError(TAG, err);
      throw cancellation();
    }
    if (this.loadPromiseResolve_) {
      this.loadPromiseResolve_();
      this.loadPromiseResolve_ = null;
    }
    this.layoutPromise_ = null;
    this.state_ = success
      ? ResourceState_Enum.LAYOUT_COMPLETE
      : ResourceState_Enum.LAYOUT_FAILED;
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
   */
  isLayoutPending() {
    return (
      this.state_ != ResourceState_Enum.LAYOUT_COMPLETE &&
      this.state_ != ResourceState_Enum.LAYOUT_FAILED
    );
  }

  /**
   * Returns a promise that is resolved when this resource is laid out
   * for the first time and the resource was loaded. Note that the resource
   * could be unloaded subsequently. This method returns resolved promise for
   * sunch unloaded elements.
   * @return {!Promise}
   */
  loadedOnce() {
    if (this.element.R1()) {
      return this.element.whenLoaded();
    }
    return this.loadPromise_;
  }

  /**
   * Whether the resource is currently visible in the viewport.
   * @return {boolean}
   */
  isInViewport() {
    if (this.isInViewport_) {
      this.resolveDeferredsWhenWithinViewports_();
    }
    return this.isInViewport_;
  }

  /**
   * Updates the inViewport state of the element.
   * @param {boolean} inViewport
   */
  setInViewport(inViewport) {
    this.isInViewport_ = inViewport;
  }

  /**
   * Calls element's unlayoutCallback callback and resets state for
   * relayout in case document becomes active again.
   */
  unlayout() {
    if (
      this.state_ == ResourceState_Enum.NOT_BUILT ||
      this.state_ == ResourceState_Enum.NOT_LAID_OUT ||
      this.state_ == ResourceState_Enum.READY_FOR_LAYOUT
    ) {
      return;
    }
    if (this.abortController_) {
      this.abortController_.abort();
      this.abortController_ = null;
    }
    this.setInViewport(false);
    if (this.element.unlayoutCallback()) {
      this.element.togglePlaceholder(true);
      this.state_ = ResourceState_Enum.NOT_LAID_OUT;
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
    this.element.pause();
  }

  /**
   * Calls element's pauseCallback callback.
   */
  pauseOnRemove() {
    this.element.pause();
  }

  /**
   * Calls element's resumeCallback callback.
   */
  resume() {
    this.element.resume();
  }

  /**
   * Called when a previously visible element is no longer displayed.
   */
  unload() {
    this.element.unmount();
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
