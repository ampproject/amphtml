import { resolvedPromise as _resolvedPromise5 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise4 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { Deferred } from "../core/data-structures/promise";
import { Layout } from "../core/dom/layout";
import { layoutRectLtwh, layoutRectSizeEquals, layoutSizeFromRect, moveLayoutRect, rectsOverlap } from "../core/dom/layout/rect";
import { computedStyle, toggle } from "../core/dom/style";
import { toWin } from "../core/window";
import { Services } from "./";
import { cancellation, isBlockedByConsent, reportError } from "../error-reporting";
import { dev, devAssert } from "../log";
var TAG = 'Resource';
var RESOURCE_PROP_ = '__AMP__RESOURCE';
var OWNER_PROP_ = '__AMP__OWNER';

/**
 * Resource state.
 *
 * @enum {number}
 */
export var ResourceState = {
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
  LAYOUT_FAILED: 5
};

/** @typedef {{
  distance: (boolean|number),
    viewportHeight: (number|undefined),
    scrollPenalty: (number|undefined),
  }} */
var ViewportRatioDef;

/**
 * A Resource binding for an AmpElement.
 */
export var Resource = /*#__PURE__*/function () {
  /**
   * @param {number} id
   * @param {!AmpElement} element
   * @param {!./resources-interface.ResourcesInterface} resources
   */
  function Resource(id, element, resources) {
    _classCallCheck(this, Resource);

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

    /** @private {!ResourceState} */
    this.state_ = element.isBuilt() ? ResourceState.NOT_LAID_OUT : ResourceState.NOT_BUILT;

    // Race condition: if an element is reparented while building, it'll
    // receive a newly constructed Resource. Make sure this Resource's
    // internal state is also "building".
    if (this.state_ == ResourceState.NOT_BUILT && element.isBuilding()) {
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
    var deferred = new Deferred();

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
  _createClass(Resource, [{
    key: "getId",
    value: function getId() {
      return this.id_;
    }
    /**
     * Update owner element
     * @param {AmpElement|undefined} owner
     */

  }, {
    key: "updateOwner",
    value: function updateOwner(owner) {
      this.owner_ = owner;
    }
    /**
     * Returns an owner element or null.
     * @return {?AmpElement}
     */

  }, {
    key: "getOwner",
    value: function getOwner() {
      if (this.owner_ === undefined) {
        for (var n = this.element; n; n = n.parentElement) {
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

  }, {
    key: "hasOwner",
    value: function hasOwner() {
      return !!this.getOwner();
    }
    /**
     * Returns the resource's element priority.
     * @return {number}
     */

  }, {
    key: "getLayoutPriority",
    value: function getLayoutPriority() {
      if (this.priorityOverride_ != -1) {
        return this.priorityOverride_;
      }

      return this.element.getLayoutPriority();
    }
    /**
     * Overrides the element's priority.
     * @param {number} newPriority
     */

  }, {
    key: "updateLayoutPriority",
    value: function updateLayoutPriority(newPriority) {
      this.priorityOverride_ = newPriority;
    }
    /**
     * Returns the resource's state. See {@link ResourceState} for details.
     * @return {!ResourceState}
     */

  }, {
    key: "getState",
    value: function getState() {
      return this.state_;
    }
    /**
     * Returns whether the resource has been fully built.
     * @return {boolean}
     */

  }, {
    key: "isBuilt",
    value: function isBuilt() {
      return this.element.isBuilt();
    }
    /**
     * Returns whether the resource is currently being built.
     * @return {boolean}
     */

  }, {
    key: "isBuilding",
    value: function isBuilding() {
      return this.isBuilding_;
    }
    /**
     * Returns promise that resolves when the element has been built.
     * @return {!Promise}
     */

  }, {
    key: "whenBuilt",
    value: function whenBuilt() {
      // TODO(dvoytenko): merge with the standard BUILT signal.
      return this.element.signals().whenSignal('res-built');
    }
    /**
     * Requests the resource's element to be built. See {@link AmpElement.build}
     * for details.
     * @return {?Promise}
     */

  }, {
    key: "build",
    value: function build() {
      var _this = this;

      if (this.isBuilding_ || !this.element.isUpgraded()) {
        return null;
      }

      this.isBuilding_ = true;
      return this.element.buildInternal().then(function () {
        _this.isBuilding_ = false;
        _this.state_ = ResourceState.NOT_LAID_OUT;

        // TODO(dvoytenko): merge with the standard BUILT signal.
        _this.element.signals().signal('res-built');
      }, function (reason) {
        _this.maybeReportErrorOnBuildFailure(reason);

        _this.isBuilding_ = false;

        _this.element.signals().rejectSignal('res-built', reason);

        throw reason;
      });
    }
    /**
     * @param {*} reason
     * @visibleForTesting
     */

  }, {
    key: "maybeReportErrorOnBuildFailure",
    value: function maybeReportErrorOnBuildFailure(reason) {
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

  }, {
    key: "changeSize",
    value: function changeSize(newHeight, newWidth, opt_newMargins) {
      this.element.
      /*OK*/
      applySize(newHeight, newWidth, opt_newMargins);
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

  }, {
    key: "overflowCallback",
    value: function overflowCallback(overflown, requestedHeight, requestedWidth, requestedMargins) {
      if (overflown) {
        this.pendingChangeSize_ = {
          height: requestedHeight,
          width: requestedWidth,
          margins: requestedMargins
        };
      }

      this.element.overflowCallback(overflown, requestedHeight, requestedWidth, requestedMargins);
    }
    /** reset pending change sizes */

  }, {
    key: "resetPendingChangeSize",
    value: function resetPendingChangeSize() {
      this.pendingChangeSize_ = undefined;
    }
    /**
     * @return {!./resources-impl.SizeDef|undefined}
     */

  }, {
    key: "getPendingChangeSize",
    value: function getPendingChangeSize() {
      return this.pendingChangeSize_;
    }
    /**
     * Time delay imposed by baseElement upgradeCallback.  If no
     * upgradeCallback specified or not yet executed, delay is 0.
     * @return {number}
     */

  }, {
    key: "getUpgradeDelayMs",
    value: function getUpgradeDelayMs() {
      return this.element.getUpgradeDelayMs();
    }
    /**
     * Measures the resource's boundaries. An upgraded element will be
     * transitioned to the "ready for layout" state.
     */

  }, {
    key: "measure",
    value: function measure() {
      // Check if the element is ready to be measured.
      // Placeholders are special. They are technically "owned" by parent AMP
      // elements, sized by parents, but laid out independently. This means
      // that placeholders need to at least wait until the parent element
      // has been stubbed. We can tell whether the parent has been stubbed
      // by whether a resource has been attached to it.
      if (this.isPlaceholder_ && this.element.parentElement && // Use prefix to recognize AMP element. This is necessary because stub
      // may not be attached yet.
      this.element.parentElement.tagName.startsWith('AMP-') && !(RESOURCE_PROP_ in this.element.parentElement)) {
        return;
      }

      if (!this.element.ownerDocument || !this.element.ownerDocument.defaultView) {
        // Most likely this is an element who's window has just been destroyed.
        // This is an issue with FIE embeds destruction. Such elements will be
        // considered "not displayable" until they are GC'ed.
        this.state_ = ResourceState.NOT_LAID_OUT;
        return;
      }

      this.isMeasureRequested_ = false;
      var oldBox = this.layoutBox_;
      this.computeMeasurements_();
      var newBox = this.layoutBox_;
      // Note that "left" doesn't affect readiness for the layout.
      var sizeChanges = !layoutRectSizeEquals(oldBox, newBox);

      if (this.state_ == ResourceState.NOT_LAID_OUT || oldBox.top != newBox.top || sizeChanges) {
        if (this.element.isUpgraded()) {
          if (this.state_ == ResourceState.NOT_LAID_OUT) {
            // If the element isn't laid out yet, then we're now ready for layout.
            this.state_ = ResourceState.READY_FOR_LAYOUT;
          } else if ((this.state_ == ResourceState.LAYOUT_COMPLETE || this.state_ == ResourceState.LAYOUT_FAILED) && this.element.isRelayoutNeeded()) {
            // If the element was already laid out and we need to relayout, then
            // go back to ready for layout.
            this.state_ = ResourceState.READY_FOR_LAYOUT;
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

  }, {
    key: "ensureMeasured",
    value: function ensureMeasured() {
      var _this2 = this;

      if (this.hasBeenMeasured()) {
        return _resolvedPromise();
      }

      return Services.vsyncFor(this.hostWin).measure(function () {
        return _this2.measure();
      });
    }
    /**
     * Computes the current layout box and position-fixed state of the element.
     * @private
     */

  }, {
    key: "computeMeasurements_",
    value: function computeMeasurements_() {
      var viewport = Services.viewportForDoc(this.element);
      this.layoutBox_ = viewport.getLayoutRect(this.element);
      // Calculate whether the element is currently is or in `position:fixed`.
      var isFixed = false;

      if (viewport.supportsPositionFixed() && this.isDisplayed()) {
        var _this$resources_$getA = this.resources_.getAmpdoc(),
            win = _this$resources_$getA.win;

        var body = win.document.body;

        for (var n = this.element; n && n != body; n = n.
        /*OK*/
        offsetParent) {
          if (n.isAlwaysFixed && n.isAlwaysFixed()) {
            isFixed = true;
            break;
          }

          if (viewport.isDeclaredFixed(n) && computedStyle(win, n).position == 'fixed') {
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
        this.layoutBox_ = moveLayoutRect(this.layoutBox_, -viewport.getScrollLeft(), -viewport.getScrollTop());
      }
    }
    /**
     * Completes collapse: ensures that the element is `display:none` and
     * updates layout box.
     */

  }, {
    key: "completeCollapse",
    value: function completeCollapse() {
      toggle(this.element, false);
      this.layoutBox_ = layoutRectLtwh(this.layoutBox_.left, this.layoutBox_.top, 0, 0);
      this.isFixed_ = false;
      this.element.updateLayoutBox(this.getLayoutBox());
      var owner = this.getOwner();

      if (owner) {
        owner.collapsedCallback(this.element);
      }
    }
    /**
     * Completes expand: ensures that the element is not `display:none` and
     * updates measurements.
     */

  }, {
    key: "completeExpand",
    value: function completeExpand() {
      toggle(this.element, true);
      this.requestMeasure();
    }
    /**
     * @return {boolean}
     */

  }, {
    key: "isMeasureRequested",
    value: function isMeasureRequested() {
      return this.isMeasureRequested_;
    }
    /**
     * Checks if the current resource has been measured.
     * @return {boolean}
     */

  }, {
    key: "hasBeenMeasured",
    value: function hasBeenMeasured() {
      return !!this.initialLayoutBox_;
    }
    /**
     * Requests the element to be remeasured on the next pass.
     */

  }, {
    key: "requestMeasure",
    value: function requestMeasure() {
      this.isMeasureRequested_ = true;
    }
    /**
     * Returns a previously measured layout size.
     * @return {!../layout-rect.LayoutSizeDef}
     */

  }, {
    key: "getLayoutSize",
    value: function getLayoutSize() {
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

  }, {
    key: "getLayoutBox",
    value: function getLayoutBox() {
      if (!this.isFixed_) {
        return this.layoutBox_;
      }

      var viewport = Services.viewportForDoc(this.element);
      return moveLayoutRect(this.layoutBox_, viewport.getScrollLeft(), viewport.getScrollTop());
    }
    /**
     * Returns the first measured layout box.
     * @return {!../layout-rect.LayoutRectDef}
     */

  }, {
    key: "getInitialLayoutBox",
    value: function getInitialLayoutBox() {
      // Before the first measure, there will be no initial layoutBox.
      // Luckily, layoutBox will be present but essentially useless.
      return this.initialLayoutBox_ || this.layoutBox_;
    }
    /**
     * Whether the resource is displayed, i.e. if it has non-zero width and
     * height.
     * @return {boolean}
     */

  }, {
    key: "isDisplayed",
    value: function isDisplayed() {
      var isConnected = this.element.ownerDocument && this.element.ownerDocument.defaultView;

      if (!isConnected) {
        return false;
      }

      var isFluid = this.element.getLayout() == Layout.FLUID;
      var box = this.getLayoutBox();
      var hasNonZeroSize = box.height > 0 && box.width > 0;
      return isFluid || hasNonZeroSize;
    }
    /**
     * Whether the element is fixed according to the latest measurement.
     * @return {boolean}
     */

  }, {
    key: "isFixed",
    value: function isFixed() {
      return this.isFixed_;
    }
    /**
     * Whether the element's layout box overlaps with the specified rect.
     * @param {!../layout-rect.LayoutRectDef} rect
     * @return {boolean}
     */

  }, {
    key: "overlaps",
    value: function overlaps(rect) {
      return rectsOverlap(this.getLayoutBox(), rect);
    }
    /**
     * Whether this element can be pre-rendered.
     * @return {boolean}
     */

  }, {
    key: "prerenderAllowed",
    value: function prerenderAllowed() {
      return this.element.prerenderAllowed();
    }
    /**
     * Whether this element has render-blocking service.
     * @return {boolean}
     */

  }, {
    key: "isBuildRenderBlocking",
    value: function isBuildRenderBlocking() {
      return this.element.isBuildRenderBlocking();
    }
    /**
     * @param {number|boolean} viewport derived from renderOutsideViewport.
     * @return {!Promise} resolves when underlying element is built and within the
     *    viewport range given.
     */

  }, {
    key: "whenWithinViewport",
    value: function whenWithinViewport(viewport) {
      // TODO(#30620): remove this method once IntersectionObserver{root:doc} is
      // polyfilled.
      devAssert(viewport !== false);

      // Resolve is already laid out or viewport is true.
      if (!this.isLayoutPending() || viewport === true) {
        return _resolvedPromise2();
      }

      // See if pre-existing promise.
      var viewportNum = dev().assertNumber(viewport);
      var key = String(viewportNum);

      if (this.withViewportDeferreds_ && this.withViewportDeferreds_[key]) {
        return this.withViewportDeferreds_[key].promise;
      }

      // See if already within viewport multiplier.
      if (this.isWithinViewportRatio(viewportNum)) {
        return _resolvedPromise3();
      }

      // return promise that will trigger when within viewport multiple.
      this.withViewportDeferreds_ = this.withViewportDeferreds_ || {};
      this.withViewportDeferreds_[key] = new Deferred();
      return this.withViewportDeferreds_[key].promise;
    }
    /** @private resolves promises populated via whenWithinViewport. */

  }, {
    key: "resolveDeferredsWhenWithinViewports_",
    value: function resolveDeferredsWhenWithinViewports_() {
      if (!this.withViewportDeferreds_) {
        return;
      }

      var viewportRatio = this.getDistanceViewportRatio();

      for (var key in this.withViewportDeferreds_) {
        if (this.isWithinViewportRatio(parseFloat(key), viewportRatio)) {
          this.withViewportDeferreds_[key].resolve();
          delete this.withViewportDeferreds_[key];
        }
      }
    }
    /** @return {!ViewportRatioDef} */

  }, {
    key: "getDistanceViewportRatio",
    value: function getDistanceViewportRatio() {
      // Numeric interface, element is allowed to render outside viewport when it
      // is within X times the viewport height of the current viewport.
      var viewport = Services.viewportForDoc(this.element);
      var viewportBox = viewport.getRect();
      var layoutBox = this.getLayoutBox();
      var scrollDirection = this.resources_.getScrollDirection();
      var scrollPenalty = 1;
      var distance = 0;

      if (viewportBox.right < layoutBox.left || viewportBox.left > layoutBox.right) {
        // If outside of viewport's x-axis, element is not in viewport so return
        // false.
        return {
          distance: false
        };
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
        return {
          distance: true
        };
      }

      return {
        distance: distance,
        scrollPenalty: scrollPenalty,
        viewportHeight: viewportBox.height
      };
    }
    /**
     * @param {number|boolean} multiplier
     * @param {ViewportRatioDef=} opt_viewportRatio
     * @return {boolean} whether multiplier given is within viewport ratio
     * @visibleForTesting
     */

  }, {
    key: "isWithinViewportRatio",
    value: function isWithinViewportRatio(multiplier, opt_viewportRatio) {
      if (typeof multiplier === 'boolean') {
        return multiplier;
      }

      var _ref = opt_viewportRatio || this.getDistanceViewportRatio(),
          distance = _ref.distance,
          scrollPenalty = _ref.scrollPenalty,
          viewportHeight = _ref.viewportHeight;

      if (typeof distance == 'boolean') {
        return distance;
      }

      return distance < viewportHeight * multiplier / scrollPenalty;
    }
    /**
     * Whether this is allowed to render when not in viewport.
     * @return {boolean}
     */

  }, {
    key: "renderOutsideViewport",
    value: function renderOutsideViewport() {
      // The exception is for owned resources, since they only attempt to
      // render outside viewport when the owner has explicitly allowed it.
      // TODO(jridgewell, #5803): Resources should be asking owner if it can
      // prerender this resource, so that it can avoid expensive elements wayyy
      // outside of viewport. For now, blindly trust that owner knows what it's
      // doing.
      this.resolveDeferredsWhenWithinViewports_();
      return this.hasOwner() || this.isWithinViewportRatio(this.element.renderOutsideViewport());
    }
    /**
     * Whether this is allowed to render when scheduler is idle but not in
     * viewport.
     * @return {boolean}
     */

  }, {
    key: "idleRenderOutsideViewport",
    value: function idleRenderOutsideViewport() {
      return this.isWithinViewportRatio(this.element.idleRenderOutsideViewport());
    }
    /**
     * Sets the resource's state to LAYOUT_SCHEDULED.
     * @param {number} scheduleTime The time at which layout was scheduled.
     */

  }, {
    key: "layoutScheduled",
    value: function layoutScheduled(scheduleTime) {
      this.state_ = ResourceState.LAYOUT_SCHEDULED;
      this.element.layoutScheduleTime = scheduleTime;
    }
    /**
     * Undoes `layoutScheduled`.
     */

  }, {
    key: "layoutCanceled",
    value: function layoutCanceled() {
      this.state_ = this.hasBeenMeasured() ? ResourceState.READY_FOR_LAYOUT : ResourceState.NOT_LAID_OUT;
    }
    /**
     * Starts the layout of the resource. Returns the promise that will yield
     * once layout is complete. Only allowed to be called on a upgraded, built
     * and displayed element.
     * @return {!Promise}
     */

  }, {
    key: "startLayout",
    value: function startLayout() {
      var _this3 = this;

      if (this.layoutPromise_) {
        return this.layoutPromise_;
      }

      if (this.state_ == ResourceState.LAYOUT_COMPLETE) {
        return _resolvedPromise4();
      }

      if (this.state_ == ResourceState.LAYOUT_FAILED) {
        return Promise.reject(this.lastLayoutError_);
      }

      devAssert(this.state_ != ResourceState.NOT_BUILT, 'Not ready to start layout: %s (%s)', this.debugid, this.state_);
      devAssert(this.isDisplayed(), 'Not displayed for layout: %s', this.debugid);

      if (this.state_ != ResourceState.LAYOUT_SCHEDULED) {
        var err = dev().createError('startLayout called but not LAYOUT_SCHEDULED', 'currently: ', this.state_);
        reportError(err, this.element);
        return Promise.reject(err);
      }

      // Unwanted re-layouts are ignored.
      if (this.layoutCount_ > 0 && !this.element.isRelayoutNeeded()) {
        dev().fine(TAG, "layout canceled since it wasn't requested:", this.debugid, this.state_);
        this.state_ = ResourceState.LAYOUT_COMPLETE;
        return _resolvedPromise5();
      }

      dev().fine(TAG, 'start layout:', this.debugid, 'count:', this.layoutCount_);
      this.layoutCount_++;
      this.state_ = ResourceState.LAYOUT_SCHEDULED;
      this.abortController_ = new AbortController();
      var signal = this.abortController_.signal;
      var promise = new Promise(function (resolve, reject) {
        Services.vsyncFor(_this3.hostWin).mutate(function () {
          var callbackResult;

          try {
            callbackResult = _this3.element.layoutCallback(signal);
          } catch (e) {
            reject(e);
          }

          Promise.resolve(callbackResult).then(resolve, reject);
        });

        signal.onabort = function () {
          return reject(cancellation());
        };
      }).then(function () {
        return _this3.layoutComplete_(true, signal);
      }, function (reason) {
        return _this3.layoutComplete_(false, signal, reason);
      });
      return this.layoutPromise_ = promise;
    }
    /**
     * @param {boolean} success
     * @param {!AbortSignal} signal
     * @param {*=} opt_reason
     * @return {!Promise|undefined}
     */

  }, {
    key: "layoutComplete_",
    value: function layoutComplete_(success, signal, opt_reason) {
      this.abortController_ = null;

      if (signal.aborted) {
        // We hit a race condition, where `layoutCallback` -> `unlayoutCallback`
        // was called in quick succession. Since the unlayout was called before
        // the layout completed, we want to remain in the unlayout state.
        var err = dev().createError('layoutComplete race');
        err.associatedElement = this.element;
        dev().expectedError(TAG, err);
        throw cancellation();
      }

      if (this.loadPromiseResolve_) {
        this.loadPromiseResolve_();
        this.loadPromiseResolve_ = null;
      }

      this.layoutPromise_ = null;
      this.state_ = success ? ResourceState.LAYOUT_COMPLETE : ResourceState.LAYOUT_FAILED;
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

  }, {
    key: "isLayoutPending",
    value: function isLayoutPending() {
      return this.state_ != ResourceState.LAYOUT_COMPLETE && this.state_ != ResourceState.LAYOUT_FAILED;
    }
    /**
     * Returns a promise that is resolved when this resource is laid out
     * for the first time and the resource was loaded. Note that the resource
     * could be unloaded subsequently. This method returns resolved promise for
     * sunch unloaded elements.
     * @return {!Promise}
     */

  }, {
    key: "loadedOnce",
    value: function loadedOnce() {
      if (this.element.R1()) {
        return this.element.whenLoaded();
      }

      return this.loadPromise_;
    }
    /**
     * Whether the resource is currently visible in the viewport.
     * @return {boolean}
     */

  }, {
    key: "isInViewport",
    value: function isInViewport() {
      if (this.isInViewport_) {
        this.resolveDeferredsWhenWithinViewports_();
      }

      return this.isInViewport_;
    }
    /**
     * Updates the inViewport state of the element.
     * @param {boolean} inViewport
     */

  }, {
    key: "setInViewport",
    value: function setInViewport(inViewport) {
      this.isInViewport_ = inViewport;
    }
    /**
     * Calls element's unlayoutCallback callback and resets state for
     * relayout in case document becomes active again.
     */

  }, {
    key: "unlayout",
    value: function unlayout() {
      if (this.state_ == ResourceState.NOT_BUILT || this.state_ == ResourceState.NOT_LAID_OUT || this.state_ == ResourceState.READY_FOR_LAYOUT) {
        return;
      }

      if (this.abortController_) {
        this.abortController_.abort();
        this.abortController_ = null;
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

  }, {
    key: "getTaskId",
    value: function getTaskId(localId) {
      return this.debugid + '#' + localId;
    }
    /**
     * Calls element's pauseCallback callback.
     */

  }, {
    key: "pause",
    value: function pause() {
      this.element.pause();
    }
    /**
     * Calls element's pauseCallback callback.
     */

  }, {
    key: "pauseOnRemove",
    value: function pauseOnRemove() {
      this.element.pause();
    }
    /**
     * Calls element's resumeCallback callback.
     */

  }, {
    key: "resume",
    value: function resume() {
      this.element.resume();
    }
    /**
     * Called when a previously visible element is no longer displayed.
     */

  }, {
    key: "unload",
    value: function unload() {
      this.element.unmount();
    }
    /**
     * Disconnect the resource. Mainly intended for embed resources that do not
     * receive `disconnectedCallback` naturally via CE API.
     */

  }, {
    key: "disconnect",
    value: function disconnect() {
      delete this.element[RESOURCE_PROP_];
      this.element.disconnect(
      /* opt_pretendDisconnected */
      true);
    }
  }], [{
    key: "forElement",
    value:
    /**
     * @param {!Element} element
     * @return {!Resource}
     */
    function forElement(element) {
      return (
        /** @type {!Resource} */
        devAssert(Resource.forElementOptional(element), 'Missing resource prop on %s', element)
      );
    }
    /**
     * @param {!Element} element
     * @return {Resource}
     */

  }, {
    key: "forElementOptional",
    value: function forElementOptional(element) {
      return (
        /** @type {Resource} */
        element[RESOURCE_PROP_]
      );
    }
    /**
     * Assigns an owner for the specified element. This means that the resources
     * within this element will be managed by the owner and not Resources manager.
     * @param {!Element} element
     * @param {!AmpElement} owner
     */

  }, {
    key: "setOwner",
    value: function setOwner(element, owner) {
      devAssert(owner.contains(element), 'Owner must contain the element');

      if (Resource.forElementOptional(element)) {
        Resource.forElementOptional(element).updateOwner(owner);
      }

      element[OWNER_PROP_] = owner;
      // Need to clear owner cache for all child elements
      var cachedElements = element.getElementsByClassName('i-amphtml-element');

      for (var i = 0; i < cachedElements.length; i++) {
        var ele = cachedElements[i];

        if (Resource.forElementOptional(ele)) {
          Resource.forElementOptional(ele).updateOwner(undefined);
        }
      }
    }
  }]);

  return Resource;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc291cmNlLmpzIl0sIm5hbWVzIjpbIkRlZmVycmVkIiwiTGF5b3V0IiwibGF5b3V0UmVjdEx0d2giLCJsYXlvdXRSZWN0U2l6ZUVxdWFscyIsImxheW91dFNpemVGcm9tUmVjdCIsIm1vdmVMYXlvdXRSZWN0IiwicmVjdHNPdmVybGFwIiwiY29tcHV0ZWRTdHlsZSIsInRvZ2dsZSIsInRvV2luIiwiU2VydmljZXMiLCJjYW5jZWxsYXRpb24iLCJpc0Jsb2NrZWRCeUNvbnNlbnQiLCJyZXBvcnRFcnJvciIsImRldiIsImRldkFzc2VydCIsIlRBRyIsIlJFU09VUkNFX1BST1BfIiwiT1dORVJfUFJPUF8iLCJSZXNvdXJjZVN0YXRlIiwiTk9UX0JVSUxUIiwiTk9UX0xBSURfT1VUIiwiUkVBRFlfRk9SX0xBWU9VVCIsIkxBWU9VVF9TQ0hFRFVMRUQiLCJMQVlPVVRfQ09NUExFVEUiLCJMQVlPVVRfRkFJTEVEIiwiVmlld3BvcnRSYXRpb0RlZiIsIlJlc291cmNlIiwiaWQiLCJlbGVtZW50IiwicmVzb3VyY2VzIiwiaWRfIiwiZGVidWdpZCIsInRhZ05hbWUiLCJ0b0xvd2VyQ2FzZSIsImhvc3RXaW4iLCJvd25lckRvY3VtZW50IiwiZGVmYXVsdFZpZXciLCJyZXNvdXJjZXNfIiwiaXNQbGFjZWhvbGRlcl8iLCJoYXNBdHRyaWJ1dGUiLCJpc0J1aWxkaW5nXyIsIm93bmVyXyIsInVuZGVmaW5lZCIsInN0YXRlXyIsImlzQnVpbHQiLCJpc0J1aWxkaW5nIiwiYnVpbGQiLCJwcmlvcml0eU92ZXJyaWRlXyIsImxheW91dENvdW50XyIsImFib3J0Q29udHJvbGxlcl8iLCJsYXN0TGF5b3V0RXJyb3JfIiwiaXNGaXhlZF8iLCJsYXlvdXRCb3hfIiwiaW5pdGlhbExheW91dEJveF8iLCJpc01lYXN1cmVSZXF1ZXN0ZWRfIiwid2l0aFZpZXdwb3J0RGVmZXJyZWRzXyIsImxheW91dFByb21pc2VfIiwicGVuZGluZ0NoYW5nZVNpemVfIiwiZGVmZXJyZWQiLCJsb2FkUHJvbWlzZV8iLCJwcm9taXNlIiwibG9hZFByb21pc2VSZXNvbHZlXyIsInJlc29sdmUiLCJpc0luVmlld3BvcnRfIiwib3duZXIiLCJuIiwicGFyZW50RWxlbWVudCIsImdldE93bmVyIiwiZ2V0TGF5b3V0UHJpb3JpdHkiLCJuZXdQcmlvcml0eSIsInNpZ25hbHMiLCJ3aGVuU2lnbmFsIiwiaXNVcGdyYWRlZCIsImJ1aWxkSW50ZXJuYWwiLCJ0aGVuIiwic2lnbmFsIiwicmVhc29uIiwibWF5YmVSZXBvcnRFcnJvck9uQnVpbGRGYWlsdXJlIiwicmVqZWN0U2lnbmFsIiwiZXJyb3IiLCJuZXdIZWlnaHQiLCJuZXdXaWR0aCIsIm9wdF9uZXdNYXJnaW5zIiwiYXBwbHlTaXplIiwicmVxdWVzdE1lYXN1cmUiLCJvdmVyZmxvd24iLCJyZXF1ZXN0ZWRIZWlnaHQiLCJyZXF1ZXN0ZWRXaWR0aCIsInJlcXVlc3RlZE1hcmdpbnMiLCJoZWlnaHQiLCJ3aWR0aCIsIm1hcmdpbnMiLCJvdmVyZmxvd0NhbGxiYWNrIiwiZ2V0VXBncmFkZURlbGF5TXMiLCJzdGFydHNXaXRoIiwib2xkQm94IiwiY29tcHV0ZU1lYXN1cmVtZW50c18iLCJuZXdCb3giLCJzaXplQ2hhbmdlcyIsInRvcCIsImlzUmVsYXlvdXROZWVkZWQiLCJoYXNCZWVuTWVhc3VyZWQiLCJ1cGRhdGVMYXlvdXRCb3giLCJ2c3luY0ZvciIsIm1lYXN1cmUiLCJ2aWV3cG9ydCIsInZpZXdwb3J0Rm9yRG9jIiwiZ2V0TGF5b3V0UmVjdCIsImlzRml4ZWQiLCJzdXBwb3J0c1Bvc2l0aW9uRml4ZWQiLCJpc0Rpc3BsYXllZCIsImdldEFtcGRvYyIsIndpbiIsImJvZHkiLCJkb2N1bWVudCIsIm9mZnNldFBhcmVudCIsImlzQWx3YXlzRml4ZWQiLCJpc0RlY2xhcmVkRml4ZWQiLCJwb3NpdGlvbiIsImdldFNjcm9sbExlZnQiLCJnZXRTY3JvbGxUb3AiLCJsZWZ0IiwiZ2V0TGF5b3V0Qm94IiwiY29sbGFwc2VkQ2FsbGJhY2siLCJpc0Nvbm5lY3RlZCIsImlzRmx1aWQiLCJnZXRMYXlvdXQiLCJGTFVJRCIsImJveCIsImhhc05vblplcm9TaXplIiwicmVjdCIsInByZXJlbmRlckFsbG93ZWQiLCJpc0J1aWxkUmVuZGVyQmxvY2tpbmciLCJpc0xheW91dFBlbmRpbmciLCJ2aWV3cG9ydE51bSIsImFzc2VydE51bWJlciIsImtleSIsIlN0cmluZyIsImlzV2l0aGluVmlld3BvcnRSYXRpbyIsInZpZXdwb3J0UmF0aW8iLCJnZXREaXN0YW5jZVZpZXdwb3J0UmF0aW8iLCJwYXJzZUZsb2F0Iiwidmlld3BvcnRCb3giLCJnZXRSZWN0IiwibGF5b3V0Qm94Iiwic2Nyb2xsRGlyZWN0aW9uIiwiZ2V0U2Nyb2xsRGlyZWN0aW9uIiwic2Nyb2xsUGVuYWx0eSIsImRpc3RhbmNlIiwicmlnaHQiLCJib3R0b20iLCJ2aWV3cG9ydEhlaWdodCIsIm11bHRpcGxpZXIiLCJvcHRfdmlld3BvcnRSYXRpbyIsInJlc29sdmVEZWZlcnJlZHNXaGVuV2l0aGluVmlld3BvcnRzXyIsImhhc093bmVyIiwicmVuZGVyT3V0c2lkZVZpZXdwb3J0IiwiaWRsZVJlbmRlck91dHNpZGVWaWV3cG9ydCIsInNjaGVkdWxlVGltZSIsImxheW91dFNjaGVkdWxlVGltZSIsIlByb21pc2UiLCJyZWplY3QiLCJlcnIiLCJjcmVhdGVFcnJvciIsImZpbmUiLCJBYm9ydENvbnRyb2xsZXIiLCJtdXRhdGUiLCJjYWxsYmFja1Jlc3VsdCIsImxheW91dENhbGxiYWNrIiwiZSIsIm9uYWJvcnQiLCJsYXlvdXRDb21wbGV0ZV8iLCJzdWNjZXNzIiwib3B0X3JlYXNvbiIsImFib3J0ZWQiLCJhc3NvY2lhdGVkRWxlbWVudCIsImV4cGVjdGVkRXJyb3IiLCJSMSIsIndoZW5Mb2FkZWQiLCJpblZpZXdwb3J0IiwiYWJvcnQiLCJzZXRJblZpZXdwb3J0IiwidW5sYXlvdXRDYWxsYmFjayIsInRvZ2dsZVBsYWNlaG9sZGVyIiwibG9jYWxJZCIsInBhdXNlIiwicmVzdW1lIiwidW5tb3VudCIsImRpc2Nvbm5lY3QiLCJmb3JFbGVtZW50T3B0aW9uYWwiLCJjb250YWlucyIsInVwZGF0ZU93bmVyIiwiY2FjaGVkRWxlbWVudHMiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiaSIsImxlbmd0aCIsImVsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUjtBQUNBLFNBQVFDLE1BQVI7QUFDQSxTQUNFQyxjQURGLEVBRUVDLG9CQUZGLEVBR0VDLGtCQUhGLEVBSUVDLGNBSkYsRUFLRUMsWUFMRjtBQU9BLFNBQVFDLGFBQVIsRUFBdUJDLE1BQXZCO0FBQ0EsU0FBUUMsS0FBUjtBQUVBLFNBQVFDLFFBQVI7QUFFQSxTQUNFQyxZQURGLEVBRUVDLGtCQUZGLEVBR0VDLFdBSEY7QUFLQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWI7QUFFQSxJQUFNQyxHQUFHLEdBQUcsVUFBWjtBQUNBLElBQU1DLGNBQWMsR0FBRyxpQkFBdkI7QUFDQSxJQUFNQyxXQUFXLEdBQUcsY0FBcEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBTUMsYUFBYSxHQUFHO0FBQzNCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0VDLEVBQUFBLFNBQVMsRUFBRSxDQUxnQjs7QUFPM0I7QUFDRjtBQUNBO0FBQ0E7QUFDRUMsRUFBQUEsWUFBWSxFQUFFLENBWGE7O0FBYTNCO0FBQ0Y7QUFDQTtBQUNFQyxFQUFBQSxnQkFBZ0IsRUFBRSxDQWhCUzs7QUFrQjNCO0FBQ0Y7QUFDQTtBQUNFQyxFQUFBQSxnQkFBZ0IsRUFBRSxDQXJCUzs7QUF1QjNCO0FBQ0Y7QUFDQTtBQUNFQyxFQUFBQSxlQUFlLEVBQUUsQ0ExQlU7O0FBNEIzQjtBQUNGO0FBQ0E7QUFDRUMsRUFBQUEsYUFBYSxFQUFFO0FBL0JZLENBQXRCOztBQWtDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUMsZ0JBQUo7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aUQvSCxLQUFqRDtBQUNEOztBQUNEcEMsTUFBQUEsT0FBTyxDQUFDWCxXQUFELENBQVAsR0FBdUIrQyxLQUF2QjtBQUVBO0FBQ0EsVUFBTWdJLGNBQWMsR0FBR3BLLE9BQU8sQ0FBQ3FLLHNCQUFSLENBQStCLG1CQUEvQixDQUF2Qjs7QUFDQSxXQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdGLGNBQWMsQ0FBQ0csTUFBbkMsRUFBMkNELENBQUMsRUFBNUMsRUFBZ0Q7QUFDOUMsWUFBTUUsR0FBRyxHQUFHSixjQUFjLENBQUNFLENBQUQsQ0FBMUI7O0FBQ0EsWUFBSXhLLFFBQVEsQ0FBQ21LLGtCQUFULENBQTRCTyxHQUE1QixDQUFKLEVBQXNDO0FBQ3BDMUssVUFBQUEsUUFBUSxDQUFDbUssa0JBQVQsQ0FBNEJPLEdBQTVCLEVBQWlDTCxXQUFqQyxDQUE2Q3JKLFNBQTdDO0FBQ0Q7QUFDRjtBQUNGO0FBNUNIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtEZWZlcnJlZH0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3Byb21pc2UnO1xuaW1wb3J0IHtMYXlvdXR9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQnO1xuaW1wb3J0IHtcbiAgbGF5b3V0UmVjdEx0d2gsXG4gIGxheW91dFJlY3RTaXplRXF1YWxzLFxuICBsYXlvdXRTaXplRnJvbVJlY3QsXG4gIG1vdmVMYXlvdXRSZWN0LFxuICByZWN0c092ZXJsYXAsXG59IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvcmVjdCc7XG5pbXBvcnQge2NvbXB1dGVkU3R5bGUsIHRvZ2dsZX0gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7dG9XaW59IGZyb20gJyNjb3JlL3dpbmRvdyc7XG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcblxuaW1wb3J0IHtcbiAgY2FuY2VsbGF0aW9uLFxuICBpc0Jsb2NrZWRCeUNvbnNlbnQsXG4gIHJlcG9ydEVycm9yLFxufSBmcm9tICcuLi9lcnJvci1yZXBvcnRpbmcnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydH0gZnJvbSAnLi4vbG9nJztcblxuY29uc3QgVEFHID0gJ1Jlc291cmNlJztcbmNvbnN0IFJFU09VUkNFX1BST1BfID0gJ19fQU1QX19SRVNPVVJDRSc7XG5jb25zdCBPV05FUl9QUk9QXyA9ICdfX0FNUF9fT1dORVInO1xuXG4vKipcbiAqIFJlc291cmNlIHN0YXRlLlxuICpcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBSZXNvdXJjZVN0YXRlID0ge1xuICAvKipcbiAgICogVGhlIHJlc291cmNlIGhhcyBub3QgYmVlbiBidWlsdCB5ZXQuIE1lYXN1cmVzLCBsYXlvdXRzLCBwcmVsb2FkcyBvclxuICAgKiB2aWV3cG9ydCBzaWduYWxzIGFyZSBub3QgYWxsb3dlZC5cbiAgICovXG4gIE5PVF9CVUlMVDogMCxcblxuICAvKipcbiAgICogVGhlIHJlc291cmNlIGhhcyBiZWVuIGJ1aWx0LCBidXQgbm90IG1lYXN1cmVkIHlldCBhbmQgbm90IHlldCByZWFkeVxuICAgKiBmb3IgbGF5b3V0LlxuICAgKi9cbiAgTk9UX0xBSURfT1VUOiAxLFxuXG4gIC8qKlxuICAgKiBUaGUgcmVzb3VyY2UgaGFzIGJlZW4gYnVpbHQgYW5kIG1lYXN1cmVkIGFuZCByZWFkeSBmb3IgbGF5b3V0LlxuICAgKi9cbiAgUkVBRFlfRk9SX0xBWU9VVDogMixcblxuICAvKipcbiAgICogVGhlIHJlc291cmNlIGlzIGN1cnJlbnRseSBzY2hlZHVsZWQgZm9yIGxheW91dC5cbiAgICovXG4gIExBWU9VVF9TQ0hFRFVMRUQ6IDMsXG5cbiAgLyoqXG4gICAqIFRoZSByZXNvdXJjZSBoYXMgYmVlbiBsYWlkIG91dC5cbiAgICovXG4gIExBWU9VVF9DT01QTEVURTogNCxcblxuICAvKipcbiAgICogVGhlIGxhdGVzdCByZXNvdXJjZSdzIGxheW91dCBmYWlsZWQuXG4gICAqL1xuICBMQVlPVVRfRkFJTEVEOiA1LFxufTtcblxuLyoqIEB0eXBlZGVmIHt7XG4gIGRpc3RhbmNlOiAoYm9vbGVhbnxudW1iZXIpLFxuICAgIHZpZXdwb3J0SGVpZ2h0OiAobnVtYmVyfHVuZGVmaW5lZCksXG4gICAgc2Nyb2xsUGVuYWx0eTogKG51bWJlcnx1bmRlZmluZWQpLFxuICB9fSAqL1xubGV0IFZpZXdwb3J0UmF0aW9EZWY7XG5cbi8qKlxuICogQSBSZXNvdXJjZSBiaW5kaW5nIGZvciBhbiBBbXBFbGVtZW50LlxuICovXG5leHBvcnQgY2xhc3MgUmVzb3VyY2Uge1xuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUmVzb3VyY2V9XG4gICAqL1xuICBzdGF0aWMgZm9yRWxlbWVudChlbGVtZW50KSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IVJlc291cmNlfSAqLyAoXG4gICAgICBkZXZBc3NlcnQoXG4gICAgICAgIFJlc291cmNlLmZvckVsZW1lbnRPcHRpb25hbChlbGVtZW50KSxcbiAgICAgICAgJ01pc3NpbmcgcmVzb3VyY2UgcHJvcCBvbiAlcycsXG4gICAgICAgIGVsZW1lbnRcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHJldHVybiB7UmVzb3VyY2V9XG4gICAqL1xuICBzdGF0aWMgZm9yRWxlbWVudE9wdGlvbmFsKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHtSZXNvdXJjZX0gKi8gKGVsZW1lbnRbUkVTT1VSQ0VfUFJPUF9dKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NpZ25zIGFuIG93bmVyIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuIFRoaXMgbWVhbnMgdGhhdCB0aGUgcmVzb3VyY2VzXG4gICAqIHdpdGhpbiB0aGlzIGVsZW1lbnQgd2lsbCBiZSBtYW5hZ2VkIGJ5IHRoZSBvd25lciBhbmQgbm90IFJlc291cmNlcyBtYW5hZ2VyLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IG93bmVyXG4gICAqL1xuICBzdGF0aWMgc2V0T3duZXIoZWxlbWVudCwgb3duZXIpIHtcbiAgICBkZXZBc3NlcnQob3duZXIuY29udGFpbnMoZWxlbWVudCksICdPd25lciBtdXN0IGNvbnRhaW4gdGhlIGVsZW1lbnQnKTtcbiAgICBpZiAoUmVzb3VyY2UuZm9yRWxlbWVudE9wdGlvbmFsKGVsZW1lbnQpKSB7XG4gICAgICBSZXNvdXJjZS5mb3JFbGVtZW50T3B0aW9uYWwoZWxlbWVudCkudXBkYXRlT3duZXIob3duZXIpO1xuICAgIH1cbiAgICBlbGVtZW50W09XTkVSX1BST1BfXSA9IG93bmVyO1xuXG4gICAgLy8gTmVlZCB0byBjbGVhciBvd25lciBjYWNoZSBmb3IgYWxsIGNoaWxkIGVsZW1lbnRzXG4gICAgY29uc3QgY2FjaGVkRWxlbWVudHMgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2ktYW1waHRtbC1lbGVtZW50Jyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYWNoZWRFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWxlID0gY2FjaGVkRWxlbWVudHNbaV07XG4gICAgICBpZiAoUmVzb3VyY2UuZm9yRWxlbWVudE9wdGlvbmFsKGVsZSkpIHtcbiAgICAgICAgUmVzb3VyY2UuZm9yRWxlbWVudE9wdGlvbmFsKGVsZSkudXBkYXRlT3duZXIodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHshLi9yZXNvdXJjZXMtaW50ZXJmYWNlLlJlc291cmNlc0ludGVyZmFjZX0gcmVzb3VyY2VzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihpZCwgZWxlbWVudCwgcmVzb3VyY2VzKSB7XG4gICAgZWxlbWVudFtSRVNPVVJDRV9QUk9QX10gPSB0aGlzO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5pZF8gPSBpZDtcblxuICAgIC8qKiBAY29uc3QgeyFBbXBFbGVtZW50fSAqL1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgICAvKiogQGNvbnN0IHtzdHJpbmd9ICovXG4gICAgdGhpcy5kZWJ1Z2lkID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgKyAnIycgKyBpZDtcblxuICAgIC8qKiBAY29uc3QgeyFXaW5kb3d9ICovXG4gICAgdGhpcy5ob3N0V2luID0gdG9XaW4oZWxlbWVudC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3KTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyEuL3Jlc291cmNlcy1pbnRlcmZhY2UuUmVzb3VyY2VzSW50ZXJmYWNlfSAqL1xuICAgIHRoaXMucmVzb3VyY2VzXyA9IHJlc291cmNlcztcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc1BsYWNlaG9sZGVyXyA9IGVsZW1lbnQuaGFzQXR0cmlidXRlKCdwbGFjZWhvbGRlcicpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNCdWlsZGluZ18gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUFtcEVsZW1lbnR8dW5kZWZpbmVkfG51bGx9ICovXG4gICAgdGhpcy5vd25lcl8gPSB1bmRlZmluZWQ7XG5cbiAgICAvKiogQHByaXZhdGUgeyFSZXNvdXJjZVN0YXRlfSAqL1xuICAgIHRoaXMuc3RhdGVfID0gZWxlbWVudC5pc0J1aWx0KClcbiAgICAgID8gUmVzb3VyY2VTdGF0ZS5OT1RfTEFJRF9PVVRcbiAgICAgIDogUmVzb3VyY2VTdGF0ZS5OT1RfQlVJTFQ7XG5cbiAgICAvLyBSYWNlIGNvbmRpdGlvbjogaWYgYW4gZWxlbWVudCBpcyByZXBhcmVudGVkIHdoaWxlIGJ1aWxkaW5nLCBpdCdsbFxuICAgIC8vIHJlY2VpdmUgYSBuZXdseSBjb25zdHJ1Y3RlZCBSZXNvdXJjZS4gTWFrZSBzdXJlIHRoaXMgUmVzb3VyY2Unc1xuICAgIC8vIGludGVybmFsIHN0YXRlIGlzIGFsc28gXCJidWlsZGluZ1wiLlxuICAgIGlmICh0aGlzLnN0YXRlXyA9PSBSZXNvdXJjZVN0YXRlLk5PVF9CVUlMVCAmJiBlbGVtZW50LmlzQnVpbGRpbmcoKSkge1xuICAgICAgdGhpcy5idWlsZCgpO1xuICAgIH1cblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMucHJpb3JpdHlPdmVycmlkZV8gPSAtMTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubGF5b3V0Q291bnRfID0gMDtcblxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gc2lnbmFsIHRoYXQgdGhlIGN1cnJlbnQgbGF5b3V0Q2FsbGJhY2sgaGFzIGJlZW4gYWJvcnRlZCBieSBhblxuICAgICAqIHVubGF5b3V0Q2FsbGJhY2suXG4gICAgICogQHByaXZhdGUgez9BYm9ydENvbnRyb2xsZXJ9XG4gICAgICovXG4gICAgdGhpcy5hYm9ydENvbnRyb2xsZXJfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Kn0gKi9cbiAgICB0aGlzLmxhc3RMYXlvdXRFcnJvcl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNGaXhlZF8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IS4uL2xheW91dC1yZWN0LkxheW91dFJlY3REZWZ9ICovXG4gICAgdGhpcy5sYXlvdXRCb3hfID0gbGF5b3V0UmVjdEx0d2goLTEwMDAwLCAtMTAwMDAsIDAsIDApO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li4vbGF5b3V0LXJlY3QuTGF5b3V0UmVjdERlZn0gKi9cbiAgICB0aGlzLmluaXRpYWxMYXlvdXRCb3hfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzTWVhc3VyZVJlcXVlc3RlZF8gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFJlYWxseSwgdGhpcyBpcyBhIDxudW1iZXIsICFEZWZlcnJlZD4gbWFwLFxuICAgICAqIGJ1dCBDQydzIHR5cGUgc3lzdGVtIGNhbid0IGhhbmRsZSBpdC5cbiAgICAgKiBAcHJpdmF0ZSB7P09iamVjdDxzdHJpbmcsICFEZWZlcnJlZD59XG4gICAgICovXG4gICAgdGhpcy53aXRoVmlld3BvcnREZWZlcnJlZHNfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1Byb21pc2U8dW5kZWZpbmVkPn0gKi9cbiAgICB0aGlzLmxheW91dFByb21pc2VfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFBlbmRpbmcgY2hhbmdlIHNpemUgdGhhdCB3YXMgcmVxdWVzdGVkIGJ1dCBjb3VsZCBub3QgYmUgc2F0aXNmaWVkLlxuICAgICAqIEBwcml2YXRlIHshLi9yZXNvdXJjZXMtaW1wbC5TaXplRGVmfHVuZGVmaW5lZH1cbiAgICAgKi9cbiAgICB0aGlzLnBlbmRpbmdDaGFuZ2VTaXplXyA9IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0IGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshUHJvbWlzZX0gKi9cbiAgICB0aGlzLmxvYWRQcm9taXNlXyA9IGRlZmVycmVkLnByb21pc2U7XG5cbiAgICAvKiogQHByaXZhdGUgez9GdW5jdGlvbn0gKi9cbiAgICB0aGlzLmxvYWRQcm9taXNlUmVzb2x2ZV8gPSBkZWZlcnJlZC5yZXNvbHZlO1xuXG4gICAgLy8gVE9ETygjMzA2MjApOiByZW1vdmUgaXNJblZpZXdwb3J0XyBhbmQgd2hlbldpdGhpblZpZXdwb3J0LlxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc0luVmlld3BvcnRfID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyByZXNvdXJjZSdzIElELlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5pZF87XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIG93bmVyIGVsZW1lbnRcbiAgICogQHBhcmFtIHtBbXBFbGVtZW50fHVuZGVmaW5lZH0gb3duZXJcbiAgICovXG4gIHVwZGF0ZU93bmVyKG93bmVyKSB7XG4gICAgdGhpcy5vd25lcl8gPSBvd25lcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG93bmVyIGVsZW1lbnQgb3IgbnVsbC5cbiAgICogQHJldHVybiB7P0FtcEVsZW1lbnR9XG4gICAqL1xuICBnZXRPd25lcigpIHtcbiAgICBpZiAodGhpcy5vd25lcl8gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yIChsZXQgbiA9IHRoaXMuZWxlbWVudDsgbjsgbiA9IG4ucGFyZW50RWxlbWVudCkge1xuICAgICAgICBpZiAobltPV05FUl9QUk9QX10pIHtcbiAgICAgICAgICB0aGlzLm93bmVyXyA9IG5bT1dORVJfUFJPUF9dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vd25lcl8gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLm93bmVyXyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm93bmVyXztcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSByZXNvdXJjZSBoYXMgYW4gb3duZXIuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBoYXNPd25lcigpIHtcbiAgICByZXR1cm4gISF0aGlzLmdldE93bmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVzb3VyY2UncyBlbGVtZW50IHByaW9yaXR5LlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRMYXlvdXRQcmlvcml0eSgpIHtcbiAgICBpZiAodGhpcy5wcmlvcml0eU92ZXJyaWRlXyAhPSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJpb3JpdHlPdmVycmlkZV87XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZ2V0TGF5b3V0UHJpb3JpdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgdGhlIGVsZW1lbnQncyBwcmlvcml0eS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld1ByaW9yaXR5XG4gICAqL1xuICB1cGRhdGVMYXlvdXRQcmlvcml0eShuZXdQcmlvcml0eSkge1xuICAgIHRoaXMucHJpb3JpdHlPdmVycmlkZV8gPSBuZXdQcmlvcml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZXNvdXJjZSdzIHN0YXRlLiBTZWUge0BsaW5rIFJlc291cmNlU3RhdGV9IGZvciBkZXRhaWxzLlxuICAgKiBAcmV0dXJuIHshUmVzb3VyY2VTdGF0ZX1cbiAgICovXG4gIGdldFN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlXztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHJlc291cmNlIGhhcyBiZWVuIGZ1bGx5IGJ1aWx0LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNCdWlsdCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmlzQnVpbHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHJlc291cmNlIGlzIGN1cnJlbnRseSBiZWluZyBidWlsdC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQnVpbGRpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNCdWlsZGluZ187XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgZWxlbWVudCBoYXMgYmVlbiBidWlsdC5cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICB3aGVuQnVpbHQoKSB7XG4gICAgLy8gVE9ETyhkdm95dGVua28pOiBtZXJnZSB3aXRoIHRoZSBzdGFuZGFyZCBCVUlMVCBzaWduYWwuXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5zaWduYWxzKCkud2hlblNpZ25hbCgncmVzLWJ1aWx0Jyk7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdHMgdGhlIHJlc291cmNlJ3MgZWxlbWVudCB0byBiZSBidWlsdC4gU2VlIHtAbGluayBBbXBFbGVtZW50LmJ1aWxkfVxuICAgKiBmb3IgZGV0YWlscy5cbiAgICogQHJldHVybiB7P1Byb21pc2V9XG4gICAqL1xuICBidWlsZCgpIHtcbiAgICBpZiAodGhpcy5pc0J1aWxkaW5nXyB8fCAhdGhpcy5lbGVtZW50LmlzVXBncmFkZWQoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMuaXNCdWlsZGluZ18gPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuYnVpbGRJbnRlcm5hbCgpLnRoZW4oXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNCdWlsZGluZ18gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zdGF0ZV8gPSBSZXNvdXJjZVN0YXRlLk5PVF9MQUlEX09VVDtcbiAgICAgICAgLy8gVE9ETyhkdm95dGVua28pOiBtZXJnZSB3aXRoIHRoZSBzdGFuZGFyZCBCVUlMVCBzaWduYWwuXG4gICAgICAgIHRoaXMuZWxlbWVudC5zaWduYWxzKCkuc2lnbmFsKCdyZXMtYnVpbHQnKTtcbiAgICAgIH0sXG4gICAgICAocmVhc29uKSA9PiB7XG4gICAgICAgIHRoaXMubWF5YmVSZXBvcnRFcnJvck9uQnVpbGRGYWlsdXJlKHJlYXNvbik7XG4gICAgICAgIHRoaXMuaXNCdWlsZGluZ18gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnNpZ25hbHMoKS5yZWplY3RTaWduYWwoJ3Jlcy1idWlsdCcsIHJlYXNvbik7XG4gICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Kn0gcmVhc29uXG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgbWF5YmVSZXBvcnRFcnJvck9uQnVpbGRGYWlsdXJlKHJlYXNvbikge1xuICAgIGlmICghaXNCbG9ja2VkQnlDb25zZW50KHJlYXNvbikpIHtcbiAgICAgIGRldigpLmVycm9yKFRBRywgJ2ZhaWxlZCB0byBidWlsZDonLCB0aGlzLmRlYnVnaWQsIHJlYXNvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluc3RydWN0cyB0aGUgZWxlbWVudCB0byBjaGFuZ2UgaXRzIHNpemUgYW5kIHRyYW5zaXRpb25zIHRvIHRoZSBzdGF0ZVxuICAgKiBhd2FpdGluZyB0aGUgbWVhc3VyZSBhbmQgcG9zc2libHkgbGF5b3V0LlxuICAgKiBAcGFyYW0ge251bWJlcnx1bmRlZmluZWR9IG5ld0hlaWdodFxuICAgKiBAcGFyYW0ge251bWJlcnx1bmRlZmluZWR9IG5ld1dpZHRoXG4gICAqIEBwYXJhbSB7IS4uL2xheW91dC1yZWN0LkxheW91dE1hcmdpbnNDaGFuZ2VEZWY9fSBvcHRfbmV3TWFyZ2luc1xuICAgKi9cbiAgY2hhbmdlU2l6ZShuZXdIZWlnaHQsIG5ld1dpZHRoLCBvcHRfbmV3TWFyZ2lucykge1xuICAgIHRoaXMuZWxlbWVudC4vKk9LKi8gYXBwbHlTaXplKG5ld0hlaWdodCwgbmV3V2lkdGgsIG9wdF9uZXdNYXJnaW5zKTtcblxuICAgIC8vIFNjaGVkdWxlIGZvciByZS1tZWFzdXJlIGFuZCBwb3NzaWJsZSByZS1sYXlvdXQuXG4gICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluZm9ybXMgdGhlIGVsZW1lbnQgdGhhdCBpdCdzIGVpdGhlciBvdmVyZmxvd24gb3Igbm90LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG92ZXJmbG93blxuICAgKiBAcGFyYW0ge251bWJlcnx1bmRlZmluZWR9IHJlcXVlc3RlZEhlaWdodFxuICAgKiBAcGFyYW0ge251bWJlcnx1bmRlZmluZWR9IHJlcXVlc3RlZFdpZHRoXG4gICAqIEBwYXJhbSB7IS4uL2xheW91dC1yZWN0LkxheW91dE1hcmdpbnNDaGFuZ2VEZWZ8dW5kZWZpbmVkfSByZXF1ZXN0ZWRNYXJnaW5zXG4gICAqL1xuICBvdmVyZmxvd0NhbGxiYWNrKFxuICAgIG92ZXJmbG93bixcbiAgICByZXF1ZXN0ZWRIZWlnaHQsXG4gICAgcmVxdWVzdGVkV2lkdGgsXG4gICAgcmVxdWVzdGVkTWFyZ2luc1xuICApIHtcbiAgICBpZiAob3ZlcmZsb3duKSB7XG4gICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VTaXplXyA9IHtcbiAgICAgICAgaGVpZ2h0OiByZXF1ZXN0ZWRIZWlnaHQsXG4gICAgICAgIHdpZHRoOiByZXF1ZXN0ZWRXaWR0aCxcbiAgICAgICAgbWFyZ2luczogcmVxdWVzdGVkTWFyZ2lucyxcbiAgICAgIH07XG4gICAgfVxuICAgIHRoaXMuZWxlbWVudC5vdmVyZmxvd0NhbGxiYWNrKFxuICAgICAgb3ZlcmZsb3duLFxuICAgICAgcmVxdWVzdGVkSGVpZ2h0LFxuICAgICAgcmVxdWVzdGVkV2lkdGgsXG4gICAgICByZXF1ZXN0ZWRNYXJnaW5zXG4gICAgKTtcbiAgfVxuXG4gIC8qKiByZXNldCBwZW5kaW5nIGNoYW5nZSBzaXplcyAqL1xuICByZXNldFBlbmRpbmdDaGFuZ2VTaXplKCkge1xuICAgIHRoaXMucGVuZGluZ0NoYW5nZVNpemVfID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyEuL3Jlc291cmNlcy1pbXBsLlNpemVEZWZ8dW5kZWZpbmVkfVxuICAgKi9cbiAgZ2V0UGVuZGluZ0NoYW5nZVNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMucGVuZGluZ0NoYW5nZVNpemVfO1xuICB9XG5cbiAgLyoqXG4gICAqIFRpbWUgZGVsYXkgaW1wb3NlZCBieSBiYXNlRWxlbWVudCB1cGdyYWRlQ2FsbGJhY2suICBJZiBub1xuICAgKiB1cGdyYWRlQ2FsbGJhY2sgc3BlY2lmaWVkIG9yIG5vdCB5ZXQgZXhlY3V0ZWQsIGRlbGF5IGlzIDAuXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldFVwZ3JhZGVEZWxheU1zKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZ2V0VXBncmFkZURlbGF5TXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZWFzdXJlcyB0aGUgcmVzb3VyY2UncyBib3VuZGFyaWVzLiBBbiB1cGdyYWRlZCBlbGVtZW50IHdpbGwgYmVcbiAgICogdHJhbnNpdGlvbmVkIHRvIHRoZSBcInJlYWR5IGZvciBsYXlvdXRcIiBzdGF0ZS5cbiAgICovXG4gIG1lYXN1cmUoKSB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIGVsZW1lbnQgaXMgcmVhZHkgdG8gYmUgbWVhc3VyZWQuXG4gICAgLy8gUGxhY2Vob2xkZXJzIGFyZSBzcGVjaWFsLiBUaGV5IGFyZSB0ZWNobmljYWxseSBcIm93bmVkXCIgYnkgcGFyZW50IEFNUFxuICAgIC8vIGVsZW1lbnRzLCBzaXplZCBieSBwYXJlbnRzLCBidXQgbGFpZCBvdXQgaW5kZXBlbmRlbnRseS4gVGhpcyBtZWFuc1xuICAgIC8vIHRoYXQgcGxhY2Vob2xkZXJzIG5lZWQgdG8gYXQgbGVhc3Qgd2FpdCB1bnRpbCB0aGUgcGFyZW50IGVsZW1lbnRcbiAgICAvLyBoYXMgYmVlbiBzdHViYmVkLiBXZSBjYW4gdGVsbCB3aGV0aGVyIHRoZSBwYXJlbnQgaGFzIGJlZW4gc3R1YmJlZFxuICAgIC8vIGJ5IHdoZXRoZXIgYSByZXNvdXJjZSBoYXMgYmVlbiBhdHRhY2hlZCB0byBpdC5cbiAgICBpZiAoXG4gICAgICB0aGlzLmlzUGxhY2Vob2xkZXJfICYmXG4gICAgICB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudCAmJlxuICAgICAgLy8gVXNlIHByZWZpeCB0byByZWNvZ25pemUgQU1QIGVsZW1lbnQuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugc3R1YlxuICAgICAgLy8gbWF5IG5vdCBiZSBhdHRhY2hlZCB5ZXQuXG4gICAgICB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudC50YWdOYW1lLnN0YXJ0c1dpdGgoJ0FNUC0nKSAmJlxuICAgICAgIShSRVNPVVJDRV9QUk9QXyBpbiB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudClcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgIXRoaXMuZWxlbWVudC5vd25lckRvY3VtZW50IHx8XG4gICAgICAhdGhpcy5lbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXdcbiAgICApIHtcbiAgICAgIC8vIE1vc3QgbGlrZWx5IHRoaXMgaXMgYW4gZWxlbWVudCB3aG8ncyB3aW5kb3cgaGFzIGp1c3QgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAvLyBUaGlzIGlzIGFuIGlzc3VlIHdpdGggRklFIGVtYmVkcyBkZXN0cnVjdGlvbi4gU3VjaCBlbGVtZW50cyB3aWxsIGJlXG4gICAgICAvLyBjb25zaWRlcmVkIFwibm90IGRpc3BsYXlhYmxlXCIgdW50aWwgdGhleSBhcmUgR0MnZWQuXG4gICAgICB0aGlzLnN0YXRlXyA9IFJlc291cmNlU3RhdGUuTk9UX0xBSURfT1VUO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuaXNNZWFzdXJlUmVxdWVzdGVkXyA9IGZhbHNlO1xuXG4gICAgY29uc3Qgb2xkQm94ID0gdGhpcy5sYXlvdXRCb3hfO1xuICAgIHRoaXMuY29tcHV0ZU1lYXN1cmVtZW50c18oKTtcbiAgICBjb25zdCBuZXdCb3ggPSB0aGlzLmxheW91dEJveF87XG5cbiAgICAvLyBOb3RlIHRoYXQgXCJsZWZ0XCIgZG9lc24ndCBhZmZlY3QgcmVhZGluZXNzIGZvciB0aGUgbGF5b3V0LlxuICAgIGNvbnN0IHNpemVDaGFuZ2VzID0gIWxheW91dFJlY3RTaXplRXF1YWxzKG9sZEJveCwgbmV3Qm94KTtcbiAgICBpZiAoXG4gICAgICB0aGlzLnN0YXRlXyA9PSBSZXNvdXJjZVN0YXRlLk5PVF9MQUlEX09VVCB8fFxuICAgICAgb2xkQm94LnRvcCAhPSBuZXdCb3gudG9wIHx8XG4gICAgICBzaXplQ2hhbmdlc1xuICAgICkge1xuICAgICAgaWYgKHRoaXMuZWxlbWVudC5pc1VwZ3JhZGVkKCkpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGVfID09IFJlc291cmNlU3RhdGUuTk9UX0xBSURfT1VUKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgaXNuJ3QgbGFpZCBvdXQgeWV0LCB0aGVuIHdlJ3JlIG5vdyByZWFkeSBmb3IgbGF5b3V0LlxuICAgICAgICAgIHRoaXMuc3RhdGVfID0gUmVzb3VyY2VTdGF0ZS5SRUFEWV9GT1JfTEFZT1VUO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICh0aGlzLnN0YXRlXyA9PSBSZXNvdXJjZVN0YXRlLkxBWU9VVF9DT01QTEVURSB8fFxuICAgICAgICAgICAgdGhpcy5zdGF0ZV8gPT0gUmVzb3VyY2VTdGF0ZS5MQVlPVVRfRkFJTEVEKSAmJlxuICAgICAgICAgIHRoaXMuZWxlbWVudC5pc1JlbGF5b3V0TmVlZGVkKClcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgd2FzIGFscmVhZHkgbGFpZCBvdXQgYW5kIHdlIG5lZWQgdG8gcmVsYXlvdXQsIHRoZW5cbiAgICAgICAgICAvLyBnbyBiYWNrIHRvIHJlYWR5IGZvciBsYXlvdXQuXG4gICAgICAgICAgdGhpcy5zdGF0ZV8gPSBSZXNvdXJjZVN0YXRlLlJFQURZX0ZPUl9MQVlPVVQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaGFzQmVlbk1lYXN1cmVkKCkpIHtcbiAgICAgIHRoaXMuaW5pdGlhbExheW91dEJveF8gPSBuZXdCb3g7XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LnVwZGF0ZUxheW91dEJveChuZXdCb3gsIHNpemVDaGFuZ2VzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBZaWVsZHMgd2hlbiB0aGUgcmVzb3VyY2UgaGFzIGJlZW4gbWVhc3VyZWQuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgZW5zdXJlTWVhc3VyZWQoKSB7XG4gICAgaWYgKHRoaXMuaGFzQmVlbk1lYXN1cmVkKCkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIFNlcnZpY2VzLnZzeW5jRm9yKHRoaXMuaG9zdFdpbikubWVhc3VyZSgoKSA9PiB0aGlzLm1lYXN1cmUoKSk7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgdGhlIGN1cnJlbnQgbGF5b3V0IGJveCBhbmQgcG9zaXRpb24tZml4ZWQgc3RhdGUgb2YgdGhlIGVsZW1lbnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjb21wdXRlTWVhc3VyZW1lbnRzXygpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHRoaXMuZWxlbWVudCk7XG4gICAgdGhpcy5sYXlvdXRCb3hfID0gdmlld3BvcnQuZ2V0TGF5b3V0UmVjdCh0aGlzLmVsZW1lbnQpO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgY3VycmVudGx5IGlzIG9yIGluIGBwb3NpdGlvbjpmaXhlZGAuXG4gICAgbGV0IGlzRml4ZWQgPSBmYWxzZTtcbiAgICBpZiAodmlld3BvcnQuc3VwcG9ydHNQb3NpdGlvbkZpeGVkKCkgJiYgdGhpcy5pc0Rpc3BsYXllZCgpKSB7XG4gICAgICBjb25zdCB7d2lufSA9IHRoaXMucmVzb3VyY2VzXy5nZXRBbXBkb2MoKTtcbiAgICAgIGNvbnN0IHtib2R5fSA9IHdpbi5kb2N1bWVudDtcbiAgICAgIGZvciAobGV0IG4gPSB0aGlzLmVsZW1lbnQ7IG4gJiYgbiAhPSBib2R5OyBuID0gbi4vKk9LKi8gb2Zmc2V0UGFyZW50KSB7XG4gICAgICAgIGlmIChuLmlzQWx3YXlzRml4ZWQgJiYgbi5pc0Fsd2F5c0ZpeGVkKCkpIHtcbiAgICAgICAgICBpc0ZpeGVkID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoXG4gICAgICAgICAgdmlld3BvcnQuaXNEZWNsYXJlZEZpeGVkKG4pICYmXG4gICAgICAgICAgY29tcHV0ZWRTdHlsZSh3aW4sIG4pLnBvc2l0aW9uID09ICdmaXhlZCdcbiAgICAgICAgKSB7XG4gICAgICAgICAgaXNGaXhlZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5pc0ZpeGVkXyA9IGlzRml4ZWQ7XG5cbiAgICBpZiAoaXNGaXhlZCkge1xuICAgICAgLy8gRm9yIGZpeGVkIHBvc2l0aW9uIGVsZW1lbnRzLCB3ZSBuZWVkIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiB0byB0aGVcbiAgICAgIC8vIHZpZXdwb3J0LiBXaGVuIGFjY2Vzc2luZyB0aGUgbGF5b3V0Qm94IHRocm91Z2ggI2dldExheW91dEJveCwgd2UnbGxcbiAgICAgIC8vIHJldHVybiB0aGUgbmV3IGFic29sdXRlIHBvc2l0aW9uLlxuICAgICAgdGhpcy5sYXlvdXRCb3hfID0gbW92ZUxheW91dFJlY3QoXG4gICAgICAgIHRoaXMubGF5b3V0Qm94XyxcbiAgICAgICAgLXZpZXdwb3J0LmdldFNjcm9sbExlZnQoKSxcbiAgICAgICAgLXZpZXdwb3J0LmdldFNjcm9sbFRvcCgpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wbGV0ZXMgY29sbGFwc2U6IGVuc3VyZXMgdGhhdCB0aGUgZWxlbWVudCBpcyBgZGlzcGxheTpub25lYCBhbmRcbiAgICogdXBkYXRlcyBsYXlvdXQgYm94LlxuICAgKi9cbiAgY29tcGxldGVDb2xsYXBzZSgpIHtcbiAgICB0b2dnbGUodGhpcy5lbGVtZW50LCBmYWxzZSk7XG4gICAgdGhpcy5sYXlvdXRCb3hfID0gbGF5b3V0UmVjdEx0d2goXG4gICAgICB0aGlzLmxheW91dEJveF8ubGVmdCxcbiAgICAgIHRoaXMubGF5b3V0Qm94Xy50b3AsXG4gICAgICAwLFxuICAgICAgMFxuICAgICk7XG4gICAgdGhpcy5pc0ZpeGVkXyA9IGZhbHNlO1xuICAgIHRoaXMuZWxlbWVudC51cGRhdGVMYXlvdXRCb3godGhpcy5nZXRMYXlvdXRCb3goKSk7XG4gICAgY29uc3Qgb3duZXIgPSB0aGlzLmdldE93bmVyKCk7XG4gICAgaWYgKG93bmVyKSB7XG4gICAgICBvd25lci5jb2xsYXBzZWRDYWxsYmFjayh0aGlzLmVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wbGV0ZXMgZXhwYW5kOiBlbnN1cmVzIHRoYXQgdGhlIGVsZW1lbnQgaXMgbm90IGBkaXNwbGF5Om5vbmVgIGFuZFxuICAgKiB1cGRhdGVzIG1lYXN1cmVtZW50cy5cbiAgICovXG4gIGNvbXBsZXRlRXhwYW5kKCkge1xuICAgIHRvZ2dsZSh0aGlzLmVsZW1lbnQsIHRydWUpO1xuICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNNZWFzdXJlUmVxdWVzdGVkKCkge1xuICAgIHJldHVybiB0aGlzLmlzTWVhc3VyZVJlcXVlc3RlZF87XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IHJlc291cmNlIGhhcyBiZWVuIG1lYXN1cmVkLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaGFzQmVlbk1lYXN1cmVkKCkge1xuICAgIHJldHVybiAhIXRoaXMuaW5pdGlhbExheW91dEJveF87XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdHMgdGhlIGVsZW1lbnQgdG8gYmUgcmVtZWFzdXJlZCBvbiB0aGUgbmV4dCBwYXNzLlxuICAgKi9cbiAgcmVxdWVzdE1lYXN1cmUoKSB7XG4gICAgdGhpcy5pc01lYXN1cmVSZXF1ZXN0ZWRfID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJldmlvdXNseSBtZWFzdXJlZCBsYXlvdXQgc2l6ZS5cbiAgICogQHJldHVybiB7IS4uL2xheW91dC1yZWN0LkxheW91dFNpemVEZWZ9XG4gICAqL1xuICBnZXRMYXlvdXRTaXplKCkge1xuICAgIHJldHVybiBsYXlvdXRTaXplRnJvbVJlY3QodGhpcy5sYXlvdXRCb3hfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJldmlvdXNseSBtZWFzdXJlZCBsYXlvdXQgYm94IGFkanVzdGVkIHRvIHRoZSB2aWV3cG9ydC4gVGhpc1xuICAgKiBtYWlubHkgYWZmZWN0cyBmaXhlZC1wb3NpdGlvbiBlbGVtZW50cyB0aGF0IGFyZSBhZGp1c3RlZCB0byBiZSBhbHdheXNcbiAgICogcmVsYXRpdmUgdG8gdGhlIGRvY3VtZW50IHBvc2l0aW9uIGluIHRoZSB2aWV3cG9ydC5cbiAgICogVGhlIHJldHVybmVkIGxheW91dEJveCBpczpcbiAgICogLSByZWxhdGl2ZSB0byB0aGUgdG9wIG9mIHRoZSBkb2N1bWVudCBmb3Igbm9uIGZpeGVkIGVsZW1lbnQsXG4gICAqIC0gcmVsYXRpdmUgdG8gdGhlIHRvcCBvZiB0aGUgZG9jdW1lbnQgYXQgY3VycmVudCBzY3JvbGwgcG9zaXRpb25cbiAgICogICBmb3IgZml4ZWQgZWxlbWVudC5cbiAgICogQHJldHVybiB7IS4uL2xheW91dC1yZWN0LkxheW91dFJlY3REZWZ9XG4gICAqL1xuICBnZXRMYXlvdXRCb3goKSB7XG4gICAgaWYgKCF0aGlzLmlzRml4ZWRfKSB7XG4gICAgICByZXR1cm4gdGhpcy5sYXlvdXRCb3hfO1xuICAgIH1cbiAgICBjb25zdCB2aWV3cG9ydCA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHRoaXMuZWxlbWVudCk7XG4gICAgcmV0dXJuIG1vdmVMYXlvdXRSZWN0KFxuICAgICAgdGhpcy5sYXlvdXRCb3hfLFxuICAgICAgdmlld3BvcnQuZ2V0U2Nyb2xsTGVmdCgpLFxuICAgICAgdmlld3BvcnQuZ2V0U2Nyb2xsVG9wKClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IG1lYXN1cmVkIGxheW91dCBib3guXG4gICAqIEByZXR1cm4geyEuLi9sYXlvdXQtcmVjdC5MYXlvdXRSZWN0RGVmfVxuICAgKi9cbiAgZ2V0SW5pdGlhbExheW91dEJveCgpIHtcbiAgICAvLyBCZWZvcmUgdGhlIGZpcnN0IG1lYXN1cmUsIHRoZXJlIHdpbGwgYmUgbm8gaW5pdGlhbCBsYXlvdXRCb3guXG4gICAgLy8gTHVja2lseSwgbGF5b3V0Qm94IHdpbGwgYmUgcHJlc2VudCBidXQgZXNzZW50aWFsbHkgdXNlbGVzcy5cbiAgICByZXR1cm4gdGhpcy5pbml0aWFsTGF5b3V0Qm94XyB8fCB0aGlzLmxheW91dEJveF87XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgcmVzb3VyY2UgaXMgZGlzcGxheWVkLCBpLmUuIGlmIGl0IGhhcyBub24temVybyB3aWR0aCBhbmRcbiAgICogaGVpZ2h0LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNEaXNwbGF5ZWQoKSB7XG4gICAgY29uc3QgaXNDb25uZWN0ZWQgPVxuICAgICAgdGhpcy5lbGVtZW50Lm93bmVyRG9jdW1lbnQgJiYgdGhpcy5lbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXc7XG4gICAgaWYgKCFpc0Nvbm5lY3RlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBpc0ZsdWlkID0gdGhpcy5lbGVtZW50LmdldExheW91dCgpID09IExheW91dC5GTFVJRDtcbiAgICBjb25zdCBib3ggPSB0aGlzLmdldExheW91dEJveCgpO1xuICAgIGNvbnN0IGhhc05vblplcm9TaXplID0gYm94LmhlaWdodCA+IDAgJiYgYm94LndpZHRoID4gMDtcbiAgICByZXR1cm4gaXNGbHVpZCB8fCBoYXNOb25aZXJvU2l6ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGZpeGVkIGFjY29yZGluZyB0byB0aGUgbGF0ZXN0IG1lYXN1cmVtZW50LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNGaXhlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0ZpeGVkXztcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBlbGVtZW50J3MgbGF5b3V0IGJveCBvdmVybGFwcyB3aXRoIHRoZSBzcGVjaWZpZWQgcmVjdC5cbiAgICogQHBhcmFtIHshLi4vbGF5b3V0LXJlY3QuTGF5b3V0UmVjdERlZn0gcmVjdFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgb3ZlcmxhcHMocmVjdCkge1xuICAgIHJldHVybiByZWN0c092ZXJsYXAodGhpcy5nZXRMYXlvdXRCb3goKSwgcmVjdCk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIGVsZW1lbnQgY2FuIGJlIHByZS1yZW5kZXJlZC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHByZXJlbmRlckFsbG93ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5wcmVyZW5kZXJBbGxvd2VkKCk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIGVsZW1lbnQgaGFzIHJlbmRlci1ibG9ja2luZyBzZXJ2aWNlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNCdWlsZFJlbmRlckJsb2NraW5nKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuaXNCdWlsZFJlbmRlckJsb2NraW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ8Ym9vbGVhbn0gdmlld3BvcnQgZGVyaXZlZCBmcm9tIHJlbmRlck91dHNpZGVWaWV3cG9ydC5cbiAgICogQHJldHVybiB7IVByb21pc2V9IHJlc29sdmVzIHdoZW4gdW5kZXJseWluZyBlbGVtZW50IGlzIGJ1aWx0IGFuZCB3aXRoaW4gdGhlXG4gICAqICAgIHZpZXdwb3J0IHJhbmdlIGdpdmVuLlxuICAgKi9cbiAgd2hlbldpdGhpblZpZXdwb3J0KHZpZXdwb3J0KSB7XG4gICAgLy8gVE9ETygjMzA2MjApOiByZW1vdmUgdGhpcyBtZXRob2Qgb25jZSBJbnRlcnNlY3Rpb25PYnNlcnZlcntyb290OmRvY30gaXNcbiAgICAvLyBwb2x5ZmlsbGVkLlxuICAgIGRldkFzc2VydCh2aWV3cG9ydCAhPT0gZmFsc2UpO1xuICAgIC8vIFJlc29sdmUgaXMgYWxyZWFkeSBsYWlkIG91dCBvciB2aWV3cG9ydCBpcyB0cnVlLlxuICAgIGlmICghdGhpcy5pc0xheW91dFBlbmRpbmcoKSB8fCB2aWV3cG9ydCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICAvLyBTZWUgaWYgcHJlLWV4aXN0aW5nIHByb21pc2UuXG4gICAgY29uc3Qgdmlld3BvcnROdW0gPSBkZXYoKS5hc3NlcnROdW1iZXIodmlld3BvcnQpO1xuICAgIGNvbnN0IGtleSA9IFN0cmluZyh2aWV3cG9ydE51bSk7XG4gICAgaWYgKHRoaXMud2l0aFZpZXdwb3J0RGVmZXJyZWRzXyAmJiB0aGlzLndpdGhWaWV3cG9ydERlZmVycmVkc19ba2V5XSkge1xuICAgICAgcmV0dXJuIHRoaXMud2l0aFZpZXdwb3J0RGVmZXJyZWRzX1trZXldLnByb21pc2U7XG4gICAgfVxuICAgIC8vIFNlZSBpZiBhbHJlYWR5IHdpdGhpbiB2aWV3cG9ydCBtdWx0aXBsaWVyLlxuICAgIGlmICh0aGlzLmlzV2l0aGluVmlld3BvcnRSYXRpbyh2aWV3cG9ydE51bSkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgLy8gcmV0dXJuIHByb21pc2UgdGhhdCB3aWxsIHRyaWdnZXIgd2hlbiB3aXRoaW4gdmlld3BvcnQgbXVsdGlwbGUuXG4gICAgdGhpcy53aXRoVmlld3BvcnREZWZlcnJlZHNfID0gdGhpcy53aXRoVmlld3BvcnREZWZlcnJlZHNfIHx8IHt9O1xuICAgIHRoaXMud2l0aFZpZXdwb3J0RGVmZXJyZWRzX1trZXldID0gbmV3IERlZmVycmVkKCk7XG4gICAgcmV0dXJuIHRoaXMud2l0aFZpZXdwb3J0RGVmZXJyZWRzX1trZXldLnByb21pc2U7XG4gIH1cblxuICAvKiogQHByaXZhdGUgcmVzb2x2ZXMgcHJvbWlzZXMgcG9wdWxhdGVkIHZpYSB3aGVuV2l0aGluVmlld3BvcnQuICovXG4gIHJlc29sdmVEZWZlcnJlZHNXaGVuV2l0aGluVmlld3BvcnRzXygpIHtcbiAgICBpZiAoIXRoaXMud2l0aFZpZXdwb3J0RGVmZXJyZWRzXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB2aWV3cG9ydFJhdGlvID0gdGhpcy5nZXREaXN0YW5jZVZpZXdwb3J0UmF0aW8oKTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLndpdGhWaWV3cG9ydERlZmVycmVkc18pIHtcbiAgICAgIGlmICh0aGlzLmlzV2l0aGluVmlld3BvcnRSYXRpbyhwYXJzZUZsb2F0KGtleSksIHZpZXdwb3J0UmF0aW8pKSB7XG4gICAgICAgIHRoaXMud2l0aFZpZXdwb3J0RGVmZXJyZWRzX1trZXldLnJlc29sdmUoKTtcbiAgICAgICAgZGVsZXRlIHRoaXMud2l0aFZpZXdwb3J0RGVmZXJyZWRzX1trZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHshVmlld3BvcnRSYXRpb0RlZn0gKi9cbiAgZ2V0RGlzdGFuY2VWaWV3cG9ydFJhdGlvKCkge1xuICAgIC8vIE51bWVyaWMgaW50ZXJmYWNlLCBlbGVtZW50IGlzIGFsbG93ZWQgdG8gcmVuZGVyIG91dHNpZGUgdmlld3BvcnQgd2hlbiBpdFxuICAgIC8vIGlzIHdpdGhpbiBYIHRpbWVzIHRoZSB2aWV3cG9ydCBoZWlnaHQgb2YgdGhlIGN1cnJlbnQgdmlld3BvcnQuXG4gICAgY29uc3Qgdmlld3BvcnQgPSBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyh0aGlzLmVsZW1lbnQpO1xuICAgIGNvbnN0IHZpZXdwb3J0Qm94ID0gdmlld3BvcnQuZ2V0UmVjdCgpO1xuICAgIGNvbnN0IGxheW91dEJveCA9IHRoaXMuZ2V0TGF5b3V0Qm94KCk7XG4gICAgY29uc3Qgc2Nyb2xsRGlyZWN0aW9uID0gdGhpcy5yZXNvdXJjZXNfLmdldFNjcm9sbERpcmVjdGlvbigpO1xuICAgIGxldCBzY3JvbGxQZW5hbHR5ID0gMTtcbiAgICBsZXQgZGlzdGFuY2UgPSAwO1xuXG4gICAgaWYgKFxuICAgICAgdmlld3BvcnRCb3gucmlnaHQgPCBsYXlvdXRCb3gubGVmdCB8fFxuICAgICAgdmlld3BvcnRCb3gubGVmdCA+IGxheW91dEJveC5yaWdodFxuICAgICkge1xuICAgICAgLy8gSWYgb3V0c2lkZSBvZiB2aWV3cG9ydCdzIHgtYXhpcywgZWxlbWVudCBpcyBub3QgaW4gdmlld3BvcnQgc28gcmV0dXJuXG4gICAgICAvLyBmYWxzZS5cbiAgICAgIHJldHVybiB7ZGlzdGFuY2U6IGZhbHNlfTtcbiAgICB9XG5cbiAgICBpZiAodmlld3BvcnRCb3guYm90dG9tIDwgbGF5b3V0Qm94LnRvcCkge1xuICAgICAgLy8gRWxlbWVudCBpcyBiZWxvdyB2aWV3cG9ydFxuICAgICAgZGlzdGFuY2UgPSBsYXlvdXRCb3gudG9wIC0gdmlld3BvcnRCb3guYm90dG9tO1xuXG4gICAgICAvLyBJZiB3ZSdyZSBzY3JvbGxpbmcgYXdheSBmcm9tIHRoZSBlbGVtZW50XG4gICAgICBpZiAoc2Nyb2xsRGlyZWN0aW9uID09IC0xKSB7XG4gICAgICAgIHNjcm9sbFBlbmFsdHkgPSAyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodmlld3BvcnRCb3gudG9wID4gbGF5b3V0Qm94LmJvdHRvbSkge1xuICAgICAgLy8gRWxlbWVudCBpcyBhYm92ZSB2aWV3cG9ydFxuICAgICAgZGlzdGFuY2UgPSB2aWV3cG9ydEJveC50b3AgLSBsYXlvdXRCb3guYm90dG9tO1xuXG4gICAgICAvLyBJZiB3ZSdyZSBzY3JvbGxpbmcgYXdheSBmcm9tIHRoZSBlbGVtZW50XG4gICAgICBpZiAoc2Nyb2xsRGlyZWN0aW9uID09IDEpIHtcbiAgICAgICAgc2Nyb2xsUGVuYWx0eSA9IDI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEVsZW1lbnQgaXMgaW4gdmlld3BvcnQgc28gcmV0dXJuIHRydWUgZm9yIGFsbCBidXQgYm9vbGVhbiBmYWxzZS5cbiAgICAgIHJldHVybiB7ZGlzdGFuY2U6IHRydWV9O1xuICAgIH1cbiAgICByZXR1cm4ge2Rpc3RhbmNlLCBzY3JvbGxQZW5hbHR5LCB2aWV3cG9ydEhlaWdodDogdmlld3BvcnRCb3guaGVpZ2h0fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcnxib29sZWFufSBtdWx0aXBsaWVyXG4gICAqIEBwYXJhbSB7Vmlld3BvcnRSYXRpb0RlZj19IG9wdF92aWV3cG9ydFJhdGlvXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgbXVsdGlwbGllciBnaXZlbiBpcyB3aXRoaW4gdmlld3BvcnQgcmF0aW9cbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBpc1dpdGhpblZpZXdwb3J0UmF0aW8obXVsdGlwbGllciwgb3B0X3ZpZXdwb3J0UmF0aW8pIHtcbiAgICBpZiAodHlwZW9mIG11bHRpcGxpZXIgPT09ICdib29sZWFuJykge1xuICAgICAgcmV0dXJuIG11bHRpcGxpZXI7XG4gICAgfVxuICAgIGNvbnN0IHtkaXN0YW5jZSwgc2Nyb2xsUGVuYWx0eSwgdmlld3BvcnRIZWlnaHR9ID1cbiAgICAgIG9wdF92aWV3cG9ydFJhdGlvIHx8IHRoaXMuZ2V0RGlzdGFuY2VWaWV3cG9ydFJhdGlvKCk7XG4gICAgaWYgKHR5cGVvZiBkaXN0YW5jZSA9PSAnYm9vbGVhbicpIHtcbiAgICAgIHJldHVybiBkaXN0YW5jZTtcbiAgICB9XG4gICAgcmV0dXJuIGRpc3RhbmNlIDwgKHZpZXdwb3J0SGVpZ2h0ICogbXVsdGlwbGllcikgLyBzY3JvbGxQZW5hbHR5O1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBpcyBhbGxvd2VkIHRvIHJlbmRlciB3aGVuIG5vdCBpbiB2aWV3cG9ydC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHJlbmRlck91dHNpZGVWaWV3cG9ydCgpIHtcbiAgICAvLyBUaGUgZXhjZXB0aW9uIGlzIGZvciBvd25lZCByZXNvdXJjZXMsIHNpbmNlIHRoZXkgb25seSBhdHRlbXB0IHRvXG4gICAgLy8gcmVuZGVyIG91dHNpZGUgdmlld3BvcnQgd2hlbiB0aGUgb3duZXIgaGFzIGV4cGxpY2l0bHkgYWxsb3dlZCBpdC5cbiAgICAvLyBUT0RPKGpyaWRnZXdlbGwsICM1ODAzKTogUmVzb3VyY2VzIHNob3VsZCBiZSBhc2tpbmcgb3duZXIgaWYgaXQgY2FuXG4gICAgLy8gcHJlcmVuZGVyIHRoaXMgcmVzb3VyY2UsIHNvIHRoYXQgaXQgY2FuIGF2b2lkIGV4cGVuc2l2ZSBlbGVtZW50cyB3YXl5eVxuICAgIC8vIG91dHNpZGUgb2Ygdmlld3BvcnQuIEZvciBub3csIGJsaW5kbHkgdHJ1c3QgdGhhdCBvd25lciBrbm93cyB3aGF0IGl0J3NcbiAgICAvLyBkb2luZy5cbiAgICB0aGlzLnJlc29sdmVEZWZlcnJlZHNXaGVuV2l0aGluVmlld3BvcnRzXygpO1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmhhc093bmVyKCkgfHxcbiAgICAgIHRoaXMuaXNXaXRoaW5WaWV3cG9ydFJhdGlvKHRoaXMuZWxlbWVudC5yZW5kZXJPdXRzaWRlVmlld3BvcnQoKSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBpcyBhbGxvd2VkIHRvIHJlbmRlciB3aGVuIHNjaGVkdWxlciBpcyBpZGxlIGJ1dCBub3QgaW5cbiAgICogdmlld3BvcnQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpZGxlUmVuZGVyT3V0c2lkZVZpZXdwb3J0KCkge1xuICAgIHJldHVybiB0aGlzLmlzV2l0aGluVmlld3BvcnRSYXRpbyh0aGlzLmVsZW1lbnQuaWRsZVJlbmRlck91dHNpZGVWaWV3cG9ydCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSByZXNvdXJjZSdzIHN0YXRlIHRvIExBWU9VVF9TQ0hFRFVMRUQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzY2hlZHVsZVRpbWUgVGhlIHRpbWUgYXQgd2hpY2ggbGF5b3V0IHdhcyBzY2hlZHVsZWQuXG4gICAqL1xuICBsYXlvdXRTY2hlZHVsZWQoc2NoZWR1bGVUaW1lKSB7XG4gICAgdGhpcy5zdGF0ZV8gPSBSZXNvdXJjZVN0YXRlLkxBWU9VVF9TQ0hFRFVMRUQ7XG4gICAgdGhpcy5lbGVtZW50LmxheW91dFNjaGVkdWxlVGltZSA9IHNjaGVkdWxlVGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbmRvZXMgYGxheW91dFNjaGVkdWxlZGAuXG4gICAqL1xuICBsYXlvdXRDYW5jZWxlZCgpIHtcbiAgICB0aGlzLnN0YXRlXyA9IHRoaXMuaGFzQmVlbk1lYXN1cmVkKClcbiAgICAgID8gUmVzb3VyY2VTdGF0ZS5SRUFEWV9GT1JfTEFZT1VUXG4gICAgICA6IFJlc291cmNlU3RhdGUuTk9UX0xBSURfT1VUO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgbGF5b3V0IG9mIHRoZSByZXNvdXJjZS4gUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0IHdpbGwgeWllbGRcbiAgICogb25jZSBsYXlvdXQgaXMgY29tcGxldGUuIE9ubHkgYWxsb3dlZCB0byBiZSBjYWxsZWQgb24gYSB1cGdyYWRlZCwgYnVpbHRcbiAgICogYW5kIGRpc3BsYXllZCBlbGVtZW50LlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHN0YXJ0TGF5b3V0KCkge1xuICAgIGlmICh0aGlzLmxheW91dFByb21pc2VfKSB7XG4gICAgICByZXR1cm4gdGhpcy5sYXlvdXRQcm9taXNlXztcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhdGVfID09IFJlc291cmNlU3RhdGUuTEFZT1VUX0NPTVBMRVRFKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnN0YXRlXyA9PSBSZXNvdXJjZVN0YXRlLkxBWU9VVF9GQUlMRUQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh0aGlzLmxhc3RMYXlvdXRFcnJvcl8pO1xuICAgIH1cblxuICAgIGRldkFzc2VydChcbiAgICAgIHRoaXMuc3RhdGVfICE9IFJlc291cmNlU3RhdGUuTk9UX0JVSUxULFxuICAgICAgJ05vdCByZWFkeSB0byBzdGFydCBsYXlvdXQ6ICVzICglcyknLFxuICAgICAgdGhpcy5kZWJ1Z2lkLFxuICAgICAgdGhpcy5zdGF0ZV9cbiAgICApO1xuICAgIGRldkFzc2VydCh0aGlzLmlzRGlzcGxheWVkKCksICdOb3QgZGlzcGxheWVkIGZvciBsYXlvdXQ6ICVzJywgdGhpcy5kZWJ1Z2lkKTtcblxuICAgIGlmICh0aGlzLnN0YXRlXyAhPSBSZXNvdXJjZVN0YXRlLkxBWU9VVF9TQ0hFRFVMRUQpIHtcbiAgICAgIGNvbnN0IGVyciA9IGRldigpLmNyZWF0ZUVycm9yKFxuICAgICAgICAnc3RhcnRMYXlvdXQgY2FsbGVkIGJ1dCBub3QgTEFZT1VUX1NDSEVEVUxFRCcsXG4gICAgICAgICdjdXJyZW50bHk6ICcsXG4gICAgICAgIHRoaXMuc3RhdGVfXG4gICAgICApO1xuICAgICAgcmVwb3J0RXJyb3IoZXJyLCB0aGlzLmVsZW1lbnQpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgfVxuXG4gICAgLy8gVW53YW50ZWQgcmUtbGF5b3V0cyBhcmUgaWdub3JlZC5cbiAgICBpZiAodGhpcy5sYXlvdXRDb3VudF8gPiAwICYmICF0aGlzLmVsZW1lbnQuaXNSZWxheW91dE5lZWRlZCgpKSB7XG4gICAgICBkZXYoKS5maW5lKFxuICAgICAgICBUQUcsXG4gICAgICAgIFwibGF5b3V0IGNhbmNlbGVkIHNpbmNlIGl0IHdhc24ndCByZXF1ZXN0ZWQ6XCIsXG4gICAgICAgIHRoaXMuZGVidWdpZCxcbiAgICAgICAgdGhpcy5zdGF0ZV9cbiAgICAgICk7XG4gICAgICB0aGlzLnN0YXRlXyA9IFJlc291cmNlU3RhdGUuTEFZT1VUX0NPTVBMRVRFO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIGRldigpLmZpbmUoVEFHLCAnc3RhcnQgbGF5b3V0OicsIHRoaXMuZGVidWdpZCwgJ2NvdW50OicsIHRoaXMubGF5b3V0Q291bnRfKTtcbiAgICB0aGlzLmxheW91dENvdW50XysrO1xuICAgIHRoaXMuc3RhdGVfID0gUmVzb3VyY2VTdGF0ZS5MQVlPVVRfU0NIRURVTEVEO1xuICAgIHRoaXMuYWJvcnRDb250cm9sbGVyXyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCB7c2lnbmFsfSA9IHRoaXMuYWJvcnRDb250cm9sbGVyXztcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBTZXJ2aWNlcy52c3luY0Zvcih0aGlzLmhvc3RXaW4pLm11dGF0ZSgoKSA9PiB7XG4gICAgICAgIGxldCBjYWxsYmFja1Jlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjYWxsYmFja1Jlc3VsdCA9IHRoaXMuZWxlbWVudC5sYXlvdXRDYWxsYmFjayhzaWduYWwpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgICAgIFByb21pc2UucmVzb2x2ZShjYWxsYmFja1Jlc3VsdCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSk7XG4gICAgICBzaWduYWwub25hYm9ydCA9ICgpID0+IHJlamVjdChjYW5jZWxsYXRpb24oKSk7XG4gICAgfSkudGhlbihcbiAgICAgICgpID0+IHRoaXMubGF5b3V0Q29tcGxldGVfKHRydWUsIHNpZ25hbCksXG4gICAgICAocmVhc29uKSA9PiB0aGlzLmxheW91dENvbXBsZXRlXyhmYWxzZSwgc2lnbmFsLCByZWFzb24pXG4gICAgKTtcblxuICAgIHJldHVybiAodGhpcy5sYXlvdXRQcm9taXNlXyA9IHByb21pc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc3VjY2Vzc1xuICAgKiBAcGFyYW0geyFBYm9ydFNpZ25hbH0gc2lnbmFsXG4gICAqIEBwYXJhbSB7Kj19IG9wdF9yZWFzb25cbiAgICogQHJldHVybiB7IVByb21pc2V8dW5kZWZpbmVkfVxuICAgKi9cbiAgbGF5b3V0Q29tcGxldGVfKHN1Y2Nlc3MsIHNpZ25hbCwgb3B0X3JlYXNvbikge1xuICAgIHRoaXMuYWJvcnRDb250cm9sbGVyXyA9IG51bGw7XG4gICAgaWYgKHNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAvLyBXZSBoaXQgYSByYWNlIGNvbmRpdGlvbiwgd2hlcmUgYGxheW91dENhbGxiYWNrYCAtPiBgdW5sYXlvdXRDYWxsYmFja2BcbiAgICAgIC8vIHdhcyBjYWxsZWQgaW4gcXVpY2sgc3VjY2Vzc2lvbi4gU2luY2UgdGhlIHVubGF5b3V0IHdhcyBjYWxsZWQgYmVmb3JlXG4gICAgICAvLyB0aGUgbGF5b3V0IGNvbXBsZXRlZCwgd2Ugd2FudCB0byByZW1haW4gaW4gdGhlIHVubGF5b3V0IHN0YXRlLlxuICAgICAgY29uc3QgZXJyID0gZGV2KCkuY3JlYXRlRXJyb3IoJ2xheW91dENvbXBsZXRlIHJhY2UnKTtcbiAgICAgIGVyci5hc3NvY2lhdGVkRWxlbWVudCA9IHRoaXMuZWxlbWVudDtcbiAgICAgIGRldigpLmV4cGVjdGVkRXJyb3IoVEFHLCBlcnIpO1xuICAgICAgdGhyb3cgY2FuY2VsbGF0aW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmxvYWRQcm9taXNlUmVzb2x2ZV8pIHtcbiAgICAgIHRoaXMubG9hZFByb21pc2VSZXNvbHZlXygpO1xuICAgICAgdGhpcy5sb2FkUHJvbWlzZVJlc29sdmVfID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5sYXlvdXRQcm9taXNlXyA9IG51bGw7XG4gICAgdGhpcy5zdGF0ZV8gPSBzdWNjZXNzXG4gICAgICA/IFJlc291cmNlU3RhdGUuTEFZT1VUX0NPTVBMRVRFXG4gICAgICA6IFJlc291cmNlU3RhdGUuTEFZT1VUX0ZBSUxFRDtcbiAgICB0aGlzLmxhc3RMYXlvdXRFcnJvcl8gPSBvcHRfcmVhc29uO1xuICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICBkZXYoKS5maW5lKFRBRywgJ2xheW91dCBjb21wbGV0ZTonLCB0aGlzLmRlYnVnaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZXYoKS5maW5lKFRBRywgJ2xvYWRpbmcgZmFpbGVkOicsIHRoaXMuZGVidWdpZCwgb3B0X3JlYXNvbik7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Qob3B0X3JlYXNvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcmVzb3VyY2UgbGF5b3V0IGhhcyBub3QgY29tcGxldGVkIG9yIGZhaWxlZC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzTGF5b3V0UGVuZGluZygpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5zdGF0ZV8gIT0gUmVzb3VyY2VTdGF0ZS5MQVlPVVRfQ09NUExFVEUgJiZcbiAgICAgIHRoaXMuc3RhdGVfICE9IFJlc291cmNlU3RhdGUuTEFZT1VUX0ZBSUxFRFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoaXMgcmVzb3VyY2UgaXMgbGFpZCBvdXRcbiAgICogZm9yIHRoZSBmaXJzdCB0aW1lIGFuZCB0aGUgcmVzb3VyY2Ugd2FzIGxvYWRlZC4gTm90ZSB0aGF0IHRoZSByZXNvdXJjZVxuICAgKiBjb3VsZCBiZSB1bmxvYWRlZCBzdWJzZXF1ZW50bHkuIFRoaXMgbWV0aG9kIHJldHVybnMgcmVzb2x2ZWQgcHJvbWlzZSBmb3JcbiAgICogc3VuY2ggdW5sb2FkZWQgZWxlbWVudHMuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgbG9hZGVkT25jZSgpIHtcbiAgICBpZiAodGhpcy5lbGVtZW50LlIxKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQud2hlbkxvYWRlZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sb2FkUHJvbWlzZV87XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgcmVzb3VyY2UgaXMgY3VycmVudGx5IHZpc2libGUgaW4gdGhlIHZpZXdwb3J0LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNJblZpZXdwb3J0KCkge1xuICAgIGlmICh0aGlzLmlzSW5WaWV3cG9ydF8pIHtcbiAgICAgIHRoaXMucmVzb2x2ZURlZmVycmVkc1doZW5XaXRoaW5WaWV3cG9ydHNfKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmlzSW5WaWV3cG9ydF87XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgaW5WaWV3cG9ydCBzdGF0ZSBvZiB0aGUgZWxlbWVudC5cbiAgICogQHBhcmFtIHtib29sZWFufSBpblZpZXdwb3J0XG4gICAqL1xuICBzZXRJblZpZXdwb3J0KGluVmlld3BvcnQpIHtcbiAgICB0aGlzLmlzSW5WaWV3cG9ydF8gPSBpblZpZXdwb3J0O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGVsZW1lbnQncyB1bmxheW91dENhbGxiYWNrIGNhbGxiYWNrIGFuZCByZXNldHMgc3RhdGUgZm9yXG4gICAqIHJlbGF5b3V0IGluIGNhc2UgZG9jdW1lbnQgYmVjb21lcyBhY3RpdmUgYWdhaW4uXG4gICAqL1xuICB1bmxheW91dCgpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLnN0YXRlXyA9PSBSZXNvdXJjZVN0YXRlLk5PVF9CVUlMVCB8fFxuICAgICAgdGhpcy5zdGF0ZV8gPT0gUmVzb3VyY2VTdGF0ZS5OT1RfTEFJRF9PVVQgfHxcbiAgICAgIHRoaXMuc3RhdGVfID09IFJlc291cmNlU3RhdGUuUkVBRFlfRk9SX0xBWU9VVFxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5hYm9ydENvbnRyb2xsZXJfKSB7XG4gICAgICB0aGlzLmFib3J0Q29udHJvbGxlcl8uYWJvcnQoKTtcbiAgICAgIHRoaXMuYWJvcnRDb250cm9sbGVyXyA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuc2V0SW5WaWV3cG9ydChmYWxzZSk7XG4gICAgaWYgKHRoaXMuZWxlbWVudC51bmxheW91dENhbGxiYWNrKCkpIHtcbiAgICAgIHRoaXMuZWxlbWVudC50b2dnbGVQbGFjZWhvbGRlcih0cnVlKTtcbiAgICAgIHRoaXMuc3RhdGVfID0gUmVzb3VyY2VTdGF0ZS5OT1RfTEFJRF9PVVQ7XG4gICAgICB0aGlzLmxheW91dENvdW50XyA9IDA7XG4gICAgICB0aGlzLmxheW91dFByb21pc2VfID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdGFzayBJRCBmb3IgdGhpcyByZXNvdXJjZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGxvY2FsSWRcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0VGFza0lkKGxvY2FsSWQpIHtcbiAgICByZXR1cm4gdGhpcy5kZWJ1Z2lkICsgJyMnICsgbG9jYWxJZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBlbGVtZW50J3MgcGF1c2VDYWxsYmFjayBjYWxsYmFjay5cbiAgICovXG4gIHBhdXNlKCkge1xuICAgIHRoaXMuZWxlbWVudC5wYXVzZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGVsZW1lbnQncyBwYXVzZUNhbGxiYWNrIGNhbGxiYWNrLlxuICAgKi9cbiAgcGF1c2VPblJlbW92ZSgpIHtcbiAgICB0aGlzLmVsZW1lbnQucGF1c2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBlbGVtZW50J3MgcmVzdW1lQ2FsbGJhY2sgY2FsbGJhY2suXG4gICAqL1xuICByZXN1bWUoKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlc3VtZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgcHJldmlvdXNseSB2aXNpYmxlIGVsZW1lbnQgaXMgbm8gbG9uZ2VyIGRpc3BsYXllZC5cbiAgICovXG4gIHVubG9hZCgpIHtcbiAgICB0aGlzLmVsZW1lbnQudW5tb3VudCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3QgdGhlIHJlc291cmNlLiBNYWlubHkgaW50ZW5kZWQgZm9yIGVtYmVkIHJlc291cmNlcyB0aGF0IGRvIG5vdFxuICAgKiByZWNlaXZlIGBkaXNjb25uZWN0ZWRDYWxsYmFja2AgbmF0dXJhbGx5IHZpYSBDRSBBUEkuXG4gICAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIGRlbGV0ZSB0aGlzLmVsZW1lbnRbUkVTT1VSQ0VfUFJPUF9dO1xuICAgIHRoaXMuZWxlbWVudC5kaXNjb25uZWN0KC8qIG9wdF9wcmV0ZW5kRGlzY29ubmVjdGVkICovIHRydWUpO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/resource.js