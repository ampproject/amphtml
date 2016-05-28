/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {FocusHistory} from '../focus-history';
import {Pass} from '../pass';
import {closest, hasNextNodeInDocumentOrder} from '../dom';
import {onDocumentReady} from '../document-ready';
import {
  expandLayoutRect,
  layoutRectLtwh,
  layoutRectsOverlap,
} from '../layout-rect';
import {getService} from '../service';
import {inputFor} from '../input';
import {dev} from '../log';
import {reportError} from '../error';
import {timer} from '../timer';
import {installFramerateService} from './framerate-impl';
import {installViewerService, VisibilityState} from './viewer-impl';
import {installViewportService} from './viewport-impl';
import {installVsyncService} from './vsync-impl';
import {platformFor} from '../platform';
import {FiniteStateMachine} from '../finite-state-machine';
import {isArray} from '../types';


const TAG_ = 'Resources';
const RESOURCE_PROP_ = '__AMP__RESOURCE';
const OWNER_PROP_ = '__AMP__OWNER';
const LAYOUT_TASK_ID_ = 'L';
const LAYOUT_TASK_OFFSET_ = 0;
const PRELOAD_TASK_ID_ = 'P';
const PRELOAD_TASK_OFFSET_ = 2;
const PRIORITY_BASE_ = 10;
const PRIORITY_PENALTY_TIME_ = 1000;
const POST_TASK_PASS_DELAY_ = 1000;
const MUTATE_DEFER_DELAY_ = 500;
const FOCUS_HISTORY_TIMEOUT_ = 1000 * 60;  // 1min
const FOUR_FRAME_DELAY_ = 70;

export class Resources {
  constructor(window) {
    /** @const {!Window} */
    this.win = window;

    /** @const @private {!Viewer} */
    this.viewer_ = installViewerService(window);

    /** @const @private {!Platform} */
    this.platform_ = platformFor(window);

    /** @private {boolean} */
    this.isRuntimeOn_ = this.viewer_.isRuntimeOn();

    /** @private @const {number} */
    this.maxDpr_ = this.win.devicePixelRatio || 1;

    /** @private {number} */
    this.resourceIdCounter_ = 0;

    /** @private @const {!Array<!Resource>} */
    this.resources_ = [];

    /** @private {boolean} */
    this.visible_ = this.viewer_.isVisible();

    /** @private {number} */
    this.prerenderSize_ = this.viewer_.getPrerenderSize();

    /** @private {boolean} */
    this.documentReady_ = false;

    /**
     * We want to do some work in the first pass after
     * the document is ready.
     * @private {boolean}
     */
    this.firstPassAfterDocumentReady_ = true;

    /**
     * We also adjust the timeout penalty shortly after the first pass.
     * @private {number}
     */
    this.firstVisibleTime_ = -1;

    /** @private {boolean} */
    this.relayoutAll_ = true;

    /** @private {number} */
    this.relayoutTop_ = -1;

    /** @private {time} */
    this.lastScrollTime_ = 0;

    /** @private {number} */
    this.lastVelocity_ = 0;

    /** @const {!Pass} */
    this.pass_ = new Pass(() => this.doPass_());

    /** @const {!TaskQueue_} */
    this.exec_ = new TaskQueue_();

    /** @const {!TaskQueue_} */
    this.queue_ = new TaskQueue_();

   /**
    * The internal structure of a ChangeHeightRequest.
    * @typedef {{
    *   resource: !Resource,
    *   newHeight: (number|undefined),
    *   newWidth: (number|undefined),
    *   force: boolean,
    *   callback: (function()|undefined)
    * }}
    * @private
    */
    let ChangeSizeRequestDef;

   /**
    * @private {!Array<!ChangeSizeRequestDef>}
    */
    this.requestsChangeSize_ = [];

    /** @private {!Array<!Function>} */
    this.deferredMutates_ = [];

    /** @private {?Array<!Resource>} */
    this.pendingBuildResources_ = [];

    /** @private {boolean} */
    this.isCurrentlyBuildingPendingResources_ = false;

    /** @private {number} */
    this.scrollHeight_ = 0;

    /** @private @const {!Viewport} */
    this.viewport_ = installViewportService(this.win);

    /** @private @const {!Vsync} */
    this.vsync_ = installVsyncService(this.win);

    /** @private @const {!FocusHistory} */
    this.activeHistory_ = new FocusHistory(this.win, FOCUS_HISTORY_TIMEOUT_);

    /** @private {boolean} */
    this.vsyncScheduled_ = false;

    /** @private @const {!Framerate}  */
    this.framerate_ = installFramerateService(this.win);

    /** @private @const {!FiniteStateMachine<!VisibilityState>} */
    this.visibilityStateMachine_ = new FiniteStateMachine(
      this.viewer_.getVisibilityState()
    );
    this.setupVisibilityStateMachine_(this.visibilityStateMachine_);

    // When viewport is resized, we have to re-measure all elements.
    this.viewport_.onChanged(event => {
      this.lastScrollTime_ = timer.now();
      this.lastVelocity_ = event.velocity;
      this.relayoutAll_ = this.relayoutAll_ || event.relayoutAll;
      this.schedulePass();
    });
    this.viewport_.onScroll(() => {
      this.lastScrollTime_ = timer.now();
      this.framerate_.collect();
    });

    // When document becomes visible, e.g. from "prerender" mode, do a
    // simple pass.
    this.viewer_.onVisibilityChanged(() => {
      if (this.firstVisibleTime_ == -1 && this.viewer_.isVisible()) {
        this.firstVisibleTime_ = timer.now();
      }
      this.schedulePass();
    });

    this.viewer_.onRuntimeState(state => {
      dev.fine(TAG_, 'Runtime state:', state);
      this.isRuntimeOn_ = state;
      this.schedulePass(1);
    });

    this.activeHistory_.onFocus(element => {
      this.checkPendingChangeSize_(element);
    });

    // Ensure that we attempt to rebuild things when DOM is ready.
    onDocumentReady(this.win.document, () => {
      this.documentReady_ = true;
      this.buildReadyResources_();
      this.pendingBuildResources_ = null;
      if (this.platform_.isIe()) {
        this.fixMediaIe_(this.win);
      } else {
        this.relayoutAll_ = true;
      }
      this.schedulePass();
      this.monitorInput_();
    });

    this.schedulePass();
  }

  /**
   * An ugly fix for IE's problem with `matchMedia` API, where media queries
   * are evaluated incorrectly. See #2577 for more details.
   * @param {!Window} win
   * @private
   */
  fixMediaIe_(win) {
    if (!this.platform_.isIe() || this.matchMediaIeQuite_(win)) {
      this.relayoutAll_ = true;
      return;
    }

    // Poll until the expression resolves correctly, but only up to a point.
    const endTime = timer.now() + 2000;
    const interval = win.setInterval(() => {
      const now = timer.now();
      const matches = this.matchMediaIeQuite_(win);
      if (matches || now > endTime) {
        win.clearInterval(interval);
        this.relayoutAll_ = true;
        this.schedulePass();
        if (!matches) {
          dev.error(TAG_, 'IE media never resolved');
        }
      }
    }, 10);
  }

  /**
   * @param {!Window} win
   * @return {boolean}
   * @private
   */
  matchMediaIeQuite_(win) {
    const q = `(min-width: ${win./*OK*/innerWidth}px)` +
        ` AND (max-width: ${win./*OK*/innerWidth}px)`;
    try {
      return win.matchMedia(q).matches;
    } catch (e) {
      dev.error(TAG_, 'IE matchMedia failed: ', e);
      // Return `true` to avoid polling on a broken API.
      return true;
    }
  }

  /**
   * Returns a list of resources.
   * @return {!Array<!Resource>}
   * @export
   */
  get() {
    return this.resources_.slice(0);
  }

  /**
   * Returns a subset of resources which is identified as being in the current
   * viewport.
   * @param {boolean=} opt_isInPrerender signifies if we are in prerender mode.
   * @return {!Array<!Resource>}
   */
  getResourcesInViewport(opt_isInPrerender) {
    opt_isInPrerender = opt_isInPrerender || false;
    const viewportRect = this.viewport_.getRect();
    return this.resources_.filter(r => {
      if (r.hasOwner() || !r.isDisplayed() || !r.overlaps(viewportRect)) {
        return false;
      }
      if (opt_isInPrerender && !r.prerenderAllowed()) {
        return false;
      }
      return true;
    });
  }

  /** @private */
  monitorInput_() {
    const input = inputFor(this.win);
    input.onTouchDetected(detected => {
      this.toggleInputClass_('amp-mode-touch', detected);
    }, true);
    input.onMouseDetected(detected => {
      this.toggleInputClass_('amp-mode-mouse', detected);
    }, true);
    input.onKeyboardStateChanged(active => {
      this.toggleInputClass_('amp-mode-keyboard-active', active);
    }, true);
  }

  /**
   * @param {string} clazz
   * @param {boolean} on
   * @private
   */
  toggleInputClass_(clazz, on) {
    this.vsync_.mutate(() => {
      this.win.document.body.classList.toggle(clazz, on);
    });
  }

  /** @private */
  updateScrollHeight_() {
    if (!this.win.document.body) {
      return;
    }
    const scrollHeight = this.win.document.body./*OK*/scrollHeight;
    if (scrollHeight != this./*OK*/scrollHeight_) {
      this./*OK*/scrollHeight_ = scrollHeight;
      this.viewer_.postDocumentResized(this.viewport_.getSize().width,
          scrollHeight);
    }
  }

  /**
   * Returns the maximum DPR available on this device.
   * @return {number}
   */
  getMaxDpr() {
    return this.maxDpr_;
  }

  /**
   * Returns the most optimal DPR currently recommended.
   * @return {number}
   */
  getDpr() {
    // TODO(dvoytenko): return optimal DPR.
    return this.maxDpr_;
  }

  /**
   * Returns the {@link Resource} instance corresponding to the specified AMP
   * Element. If no Resource is found, the exception is thrown.
   * @param {!AmpElement} element
   * @return {?Resource}
   * @package
   */
  getResourceForElement(element) {
    return dev.assert(/** @type {!Resource} */ (element[RESOURCE_PROP_]),
        'Missing resource prop on %s', element);
  }

  /**
   * Returns the viewport instance
   * @return {!Viewport}
   */
  getViewport() {
    return this.viewport_;
  }

  /**
   * Returns the direction the user last scrolled.
   *  - -1 for scrolling up
   *  - 1 for scrolling down
   *  - Defaults to 1
   * @return {number}
   */
  getScrollDirection() {
    return Math.sign(this.lastVelocity_) || 1;
  }

  /**
   * Signals that an element has been added to the DOM. Resources manager
   * will start tracking it from this point on.
   * @param {!AmpElement} element
   * @package
   */
  add(element) {
    const resource = new Resource((++this.resourceIdCounter_), element, this);
    if (!element.id) {
      element.id = 'AMP_' + resource.getId();
    }
    element[RESOURCE_PROP_] = resource;
    this.resources_.push(resource);

    if (this.isRuntimeOn_) {
      if (this.documentReady_) {
        // Build resource immediately, the document has already been parsed.
        resource.build();
        this.schedulePass();
      } else if (!element.isBuilt()) {
        // Otherwise add to pending resources and try to build any ready ones.
        this.pendingBuildResources_.push(resource);
        this.buildReadyResources_();
      }
    }

    dev.fine(TAG_, 'element added:', resource.debugid);
  }

  /**
   * Builds resources that are ready to be built.
   * @private
   */
  buildReadyResources_() {
    // Avoid cases where elements add more elements inside of them
    // and cause an infinite loop of building - see #3354 for details.
    if (this.isCurrentlyBuildingPendingResources_) {
      return;
    }
    try {
      this.isCurrentlyBuildingPendingResources_ = true;
      this.buildReadyResourcesUnsafe_();
    } finally {
      this.isCurrentlyBuildingPendingResources_ = false;
    }
  }

  /** @private */
  buildReadyResourcesUnsafe_() {
    // This will loop over all current pending resources and those that
    // get added by other resources build-cycle, this will make sure all
    // elements get a chance to be built.
    for (let i = 0; i < this.pendingBuildResources_.length; i++) {
      const resource = this.pendingBuildResources_[i];
      if (this.documentReady_ ||
          hasNextNodeInDocumentOrder(resource.element)) {
        // Remove resource before build to remove it from the pending list
        // in either case the build succeed or throws an error.
        this.pendingBuildResources_.splice(i--, 1);
        resource.build();
      }
    }
  }

  /**
   * Signals that an element has been removed to the DOM. Resources manager
   * will stop tracking it from this point on.
   * @param {!AmpElement} element
   * @package
   */
  remove(element) {
    const resource = this.getResourceForElement(element);
    const index = resource ? this.resources_.indexOf(resource) : -1;
    if (index != -1) {
      this.resources_.splice(index, 1);
    }
    this.cleanupTasks_(resource, /* opt_removePending */ true);
    dev.fine(TAG_, 'element removed:', resource.debugid);
  }

  /**
   * Signals that an element has been upgraded to the DOM. Resources manager
   * will perform build and enable layout/viewport signals for this element.
   * @param {!AmpElement} element
   * @package
   */
  upgraded(element) {
    const resource = this.getResourceForElement(element);
    if (this.isRuntimeOn_) {
      resource.build();
      this.schedulePass();
    } else if (resource.onUpgraded_) {
      resource.onUpgraded_();
    }
    dev.fine(TAG_, 'element upgraded:', resource.debugid);
  }

  /**
   * Assigns an owner for the specified element. This means that the resources
   * within this element will be managed by the owner and not Resources manager.
   * @param {!Element} element
   * @param {!AmpElement} owner
   * @package
   */
  setOwner(element, owner) {
    dev.assert(owner.contains(element), 'Owner must contain the element');
    element[OWNER_PROP_] = owner;
  }

  /**
   * Schedules layout for the specified sub-elements that are children of the
   * parent element. The parent element may choose to send this signal either
   * because it's an owner (see {@link setOwner}) or because it wants the
   * layouts to be done sooner. In either case, both parent's and children's
   * priority is observed when scheduling this work.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  scheduleLayout(parentElement, subElements) {
    this.scheduleLayoutOrPreloadForSubresources_(
        this.getResourceForElement(parentElement),
        /* layout */ true,
        elements_(subElements));
  }

  /**
   * Invokes `unload` on the elements' resource which in turn will invoke
   * the `documentBecameInactive` callback on the custom element.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  schedulePause(parentElement, subElements) {
    const parentResource = this.getResourceForElement(parentElement);
    subElements = elements_(subElements);

    this.discoverResourcesForArray_(parentResource, subElements, resource => {
      resource.pause();
    });
  }

  /**
   * Schedules preload for the specified sub-elements that are children of the
   * parent element. The parent element may choose to send this signal either
   * because it's an owner (see {@link setOwner}) or because it wants the
   * preloads to be done sooner. In either case, both parent's and children's
   * priority is observed when scheduling this work.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  schedulePreload(parentElement, subElements) {
    this.scheduleLayoutOrPreloadForSubresources_(
        this.getResourceForElement(parentElement),
        /* layout */ false,
        elements_(subElements));
  }

  /**
   * A parent resource, especially in when it's an owner (see {@link setOwner}),
   * may request the Resources manager to update children's inViewport state.
   * A child's inViewport state is a logical AND between inLocalViewport
   * specified here and parent's own inViewport state.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   * @param {boolean} inLocalViewport
   */
  updateInViewport(parentElement, subElements, inLocalViewport) {
    this.updateInViewportForSubresources_(
        this.getResourceForElement(parentElement),
        elements_(subElements),
        inLocalViewport);
  }

  /**
   * Requests the runtime to change the element's size. When the size is
   * successfully updated then the opt_callback is called.
   * @param {!Element} element
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {function=} opt_callback A callback function.
   */
  changeSize(element, newHeight, newWidth, opt_callback) {
    this.scheduleChangeSize_(this.getResourceForElement(element), newHeight,
        newWidth, /* force */ true, opt_callback);
  }

  /**
   * Requests the runtime to update the size of this element to the specified
   * value. The runtime will schedule this request and attempt to process it
   * as soon as possible. However, unlike in {@link changeSize}, the runtime
   * may refuse to make a change in which case it will call the
   * `overflowCallback` method on the target resource with the height value.
   * Overflow callback is expected to provide the reader with the user action
   * to update the height manually.
   * Note that the runtime does not call the `overflowCallback` method if the
   * requested height is 0 or negative.
   * If the height is successfully updated then the opt_callback is called.
   * @param {!Element} element
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {function=} opt_callback A callback function to be called if the
   *    height is updated.
   * @protected
   */
  attemptChangeSize(element, newHeight, newWidth, opt_callback) {
    this.scheduleChangeSize_(this.getResourceForElement(element), newHeight,
        newWidth, /* force */ false, opt_callback);
  }

  /**
   * Requests mutate callback to executed at the earliest possibility.
   * @param {!Element} element
   * @param {!Function} callback
   */
  deferMutate(element, callback) {
    this.scheduleDeferredMutate_(this.getResourceForElement(element), callback);
    this.schedulePassVsync();
  }

  /**
   * Runs the specified mutation on the element and ensures that measures
   * and layouts performed for the affected elements.
   *
   * This method should be called whenever a significant mutations are done
   * on the DOM that could affect layout of elements inside this subtree or
   * its siblings. The top-most affected element should be specified as the
   * first argument to this method and all the mutation work should be done
   * in the mutator callback which is called in the "mutation" vsync phase.
   *
   * @param {!Element} element
   * @param {function()} mutator
   * @return {!Promise}
   */
  mutateElement(element, mutator) {
    const calcRelayoutTop = () => {
      const box = this.viewport_.getLayoutRect(element);
      if (box.width != 0 && box.height != 0) {
        return box.top;
      }
      return -1;
    };
    let relayoutTop = -1;
    return this.vsync_.runPromise({
      measure: () => {
        relayoutTop = calcRelayoutTop();
      },
      mutate: () => {
        mutator();

        // Mark itself and children for re-measurement.
        if (element.classList.contains('-amp-element')) {
          const r = this.getResourceForElement(element);
          r.requestMeasure();
        }
        const ampElements = element.getElementsByClassName('-amp-element');
        for (let i = 0; i < ampElements.length; i++) {
          const r = this.getResourceForElement(ampElements[i]);
          r.requestMeasure();
        }
        if (relayoutTop != -1) {
          this.setRelayoutTop_(relayoutTop);
        }
        this.schedulePass(FOUR_FRAME_DELAY_);

        // Need to measure again in case the element has become visible or
        // shifted.
        this.vsync_.measure(() => {
          const updatedRelayoutTop = calcRelayoutTop();
          if (updatedRelayoutTop != -1 && updatedRelayoutTop != relayoutTop) {
            this.setRelayoutTop_(updatedRelayoutTop);
            this.schedulePass(FOUR_FRAME_DELAY_);
          }
        });
      },
    });
  }

  /**
   * Schedules the work pass at the latest with the specified delay.
   * @param {number=} opt_delay
   */
  schedulePass(opt_delay) {
    this.pass_.schedule(opt_delay);
  }

  /**
   * Schedules the work pass at the latest with the specified delay.
   */
  schedulePassVsync() {
    if (this.vsyncScheduled_) {
      return;
    }
    this.vsyncScheduled_ = true;
    this.vsync_.mutate(() => this.doPass_());
  }

  /**
   * @private
   */
  doPass_() {
    if (!this.isRuntimeOn_) {
      dev.fine(TAG_, 'runtime is off');
      return;
    }

    this.visible_ = this.viewer_.isVisible();
    this.prerenderSize_ = this.viewer_.getPrerenderSize();

    if (this.documentReady_ && this.firstPassAfterDocumentReady_) {
      this.firstPassAfterDocumentReady_ = false;
      this.viewer_.postDocumentReady(this.viewport_.getSize().width,
        this.win.document.body./*OK*/scrollHeight);
      this.updateScrollHeight_();
    }

    const viewportSize = this.viewport_.getSize();
    const now = timer.now();
    dev.fine(TAG_, 'PASS: at ' + now +
        ', visible=', this.visible_,
        ', relayoutAll=', this.relayoutAll_,
        ', relayoutTop=', this.relayoutTop_,
        ', viewportSize=', viewportSize.width, viewportSize.height,
        ', prerenderSize=', this.prerenderSize_);
    this.pass_.cancel();
    this.vsyncScheduled_ = false;

    this.visibilityStateMachine_.setState(
      this.viewer_.getVisibilityState()
    );
  }

  /**
   * Returns `true` when there's mutate work currently batched.
   * @return {boolean}
   * @private
   */
  hasMutateWork_() {
    return (this.deferredMutates_.length > 0 ||
        this.requestsChangeSize_.length > 0);
  }

  /**
   * Performs pre-discovery mutates.
   * @private
   */
  mutateWork_() {
    // Read all necessary data before mutates.
    // The height changing depends largely on the target element's position
    // in the active viewport. When not in prerendering, we also consider the
    // active viewport the part of the visible viewport below 10% from the top
    // and above 25% from the bottom.
    // This is basically the portion of the viewport where the reader is most
    // likely focused right now. The main goal is to avoid drastic UI changes
    // in that part of the content. The elements below the active viewport are
    // freely resized. The elements above the viewport are resized and request
    // scroll adjustment to avoid active viewport changing without user's
    // action. The elements in the active viewport are not resized and instead
    // the overflow callbacks are called.
    const now = timer.now();
    const viewportRect = this.viewport_.getRect();
    const scrollHeight = this.viewport_.getScrollHeight();
    const topOffset = viewportRect.height / 10;
    const bottomOffset = viewportRect.height / 10;
    const docBottomOffset = scrollHeight * 0.85;
    const isScrollingStopped = (Math.abs(this.lastVelocity_) < 1e-2 &&
        now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_ ||
        now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_ * 2);

    if (this.deferredMutates_.length > 0) {
      dev.fine(TAG_, 'deferred mutates:', this.deferredMutates_.length);
      const deferredMutates = this.deferredMutates_;
      this.deferredMutates_ = [];
      for (let i = 0; i < deferredMutates.length; i++) {
        deferredMutates[i]();
      }
    }

    if (this.requestsChangeSize_.length > 0) {
      dev.fine(TAG_, 'change size requests:',
          this.requestsChangeSize_.length);
      const requestsChangeSize = this.requestsChangeSize_;
      this.requestsChangeSize_ = [];

      // Find minimum top position and run all mutates.
      let minTop = -1;
      const scrollAdjSet = [];
      for (let i = 0; i < requestsChangeSize.length; i++) {
        const request = requestsChangeSize[i];
        const resource = request.resource;
        const box = resource.getLayoutBox();
        const iniBox = resource.getInitialLayoutBox();
        const diff = request.newHeight - box.height;
        if (diff == 0) {
          // Nothing to do.
          continue;
        }

        // Check resize rules. It will either resize element immediately, or
        // wait until scrolling stops or will call the overflow callback.
        let resize = false;
        if (request.force || !this.visible_) {
          // 1. An immediate execution requested or the document is hidden.
          resize = true;
        } else if (this.activeHistory_.hasDescendantsOf(resource.element)) {
          // 2. Active elements are immediately resized. The assumption is that
          // the resize is triggered by the user action or soon after.
          resize = true;
        } else if (box.bottom + Math.min(diff, 0) >=
                      viewportRect.bottom - bottomOffset) {
          // 3. Elements under viewport are resized immediately, but only if
          // an element's boundary is not changed above the viewport after
          // resize.
          resize = true;
        } else if (box.bottom <= viewportRect.top + topOffset) {
          // 4. Elements above the viewport can only be resized when scrolling
          // has stopped, otherwise defer util next cycle.
          if (isScrollingStopped) {
            // These requests will be executed in the next animation cycle and
            // adjust the scroll position.
            resize = false;
            scrollAdjSet.push(request);
          } else {
            // Defer till next cycle.
            this.requestsChangeSize_.push(request);
          }
        } else if (iniBox.bottom >= docBottomOffset ||
                      box.bottom >= docBottomOffset) {
          // 5. Elements close to the bottom of the document (not viewport)
          // are resized immediately.
          resize = true;
        } else if (diff < 0) {
          // 6. The new height is smaller than the current one.
          resize = false;
        } else {
          // 7. Element is in viewport don't resize and try overflow callback
          // instead.
          request.resource.overflowCallback(/* overflown */ true,
              request.newHeight, request.newWidth);
        }

        if (resize) {
          if (box.top >= 0) {
            minTop = minTop == -1 ? box.top : Math.min(minTop, box.top);
          }
          request.resource./*OK*/changeSize(
              request.newHeight, request.newWidth, request.callback);
          request.resource.overflowCallback(/* overflown */ false,
              request.newHeight, request.newWidth);
        }
      }

      if (minTop != -1) {
        this.setRelayoutTop_(minTop);
      }

      // Execute scroll-adjusting resize requests, if any.
      if (scrollAdjSet.length > 0) {
        this.vsync_.run({
          measure: state => {
            state./*OK*/scrollHeight = this.viewport_./*OK*/getScrollHeight();
            state./*OK*/scrollTop = this.viewport_./*OK*/getScrollTop();
          },
          mutate: state => {
            let minTop = -1;
            scrollAdjSet.forEach(request => {
              const box = request.resource.getLayoutBox();
              minTop = minTop == -1 ? box.top : Math.min(minTop, box.top);
              request.resource./*OK*/changeSize(
                  request.newHeight, request.newWidth);
            });
            if (minTop != -1) {
              this.setRelayoutTop_(minTop);
            }
            // Sync is necessary here to avoid UI jump in the next frame.
            const newScrollHeight = this.viewport_./*OK*/getScrollHeight();
            if (newScrollHeight > state./*OK*/scrollHeight) {
              this.viewport_.setScrollTop(state./*OK*/scrollTop +
                  (newScrollHeight - state./*OK*/scrollHeight));
            }
          },
        }, {});
      }
    }
  }

  /**
   * @param {number} relayoutTop
   * @private
   */
  setRelayoutTop_(relayoutTop) {
    if (this.relayoutTop_ == -1) {
      this.relayoutTop_ = relayoutTop;
    } else {
      this.relayoutTop_ = Math.min(relayoutTop, this.relayoutTop_);
    }
  }

  /**
   * Reschedules change size request when an overflown element is activated.
   * @param {!Element} element
   * @private
   */
  checkPendingChangeSize_(element) {
    const resourceElement = closest(element, el => el[RESOURCE_PROP_]);
    if (!resourceElement) {
      return;
    }
    const resource = this.getResourceForElement(resourceElement);
    const pendingChangeSize = resource.getPendingChangeSize();
    if (pendingChangeSize !== undefined) {
      this.scheduleChangeSize_(resource, pendingChangeSize.height,
          pendingChangeSize.width, /* force */ true);
    }
  }

  /**
   * Discovers work that needs to be done since the last pass. If viewport
   * has changed, it will try to build new elements, measure changed elements,
   * and schedule layouts and preloads within a reasonable distance of the
   * current viewport. Finally, this process also updates inViewport state
   * of changed elements.
   *
   * Layouts and preloads are not executed immediately, but instead scheduled
   * in the queue with different priorities.
   *
   * @private
   */
  discoverWork_() {

    // TODO(dvoytenko): vsync separation may be needed for different phases

    const now = timer.now();

    // Ensure all resources layout phase complete; when relayoutAll is requested
    // force re-layout.
    const relayoutAll = this.relayoutAll_;
    this.relayoutAll_ = false;
    const relayoutTop = this.relayoutTop_;
    this.relayoutTop_ = -1;

    // Phase 1: Build and relayout as needed. All mutations happen here.
    let relayoutCount = 0;
    let remeasureCount = 0;
    for (let i = 0; i < this.resources_.length; i++) {
      const r = this.resources_[i];
      if (r.getState() == ResourceState_.NOT_BUILT) {
        r.build();
      }
      if (relayoutAll || r.getState() == ResourceState_.NOT_LAID_OUT) {
        r.applySizesAndMediaQuery();
        relayoutCount++;
      }
      if (r.isMeasureRequested()) {
        remeasureCount++;
      }
    }

    // Phase 2: Remeasure if there were any relayouts. Unfortunately, currently
    // there's no way to optimize this. All reads happen here.
    const toUnload = [];
    if (relayoutCount > 0 || remeasureCount > 0 ||
            relayoutAll || relayoutTop != -1) {
      for (let i = 0; i < this.resources_.length; i++) {
        const r = this.resources_[i];
        if (r.getState() == ResourceState_.NOT_BUILT || r.hasOwner()) {
          continue;
        }
        if (relayoutAll ||
                r.getState() == ResourceState_.NOT_LAID_OUT ||
                r.isMeasureRequested() ||
                relayoutTop != -1 && r.getLayoutBox().bottom >= relayoutTop) {
          const wasDisplayed = r.isDisplayed();
          r.measure();
          if (wasDisplayed && !r.isDisplayed()) {
            toUnload.push(r);
          }
        }
      }
    }

    // Unload all in one cycle.
    if (toUnload.length > 0) {
      this.vsync_.mutate(() => {
        toUnload.forEach(r => {
          r.unload();
          this.cleanupTasks_(r);
        });
      });
    }

    const viewportRect = this.viewport_.getRect();
    // Load viewport = viewport + 3x up/down when document is visible or
    // depending on prerenderSize in pre-render mode.
    let loadRect;
    if (this.visible_) {
      loadRect = expandLayoutRect(viewportRect, 0.25, 2);
    } else if (this.prerenderSize_ > 0) {
      loadRect = expandLayoutRect(viewportRect, 0, this.prerenderSize_ - 1);
    } else {
      loadRect = null;
    }

    const visibleRect = this.visible_
      // When the doc is visible, consider the viewport to be 25% larger,
      // to minimize effect from small scrolling and notify things that
      // they are in viewport just before they are actually visible.
      ? expandLayoutRect(viewportRect, 0.25, 0.25)
      : viewportRect;

    // Phase 3: Schedule elements for layout within a reasonable distance from
    // current viewport.
    if (loadRect) {
      for (let i = 0; i < this.resources_.length; i++) {
        const r = this.resources_[i];
        if (r.getState() != ResourceState_.READY_FOR_LAYOUT || r.hasOwner()) {
          continue;
        }
        if (r.isDisplayed() && r.overlaps(loadRect)) {
          this.scheduleLayoutOrPreload_(r, /* layout */ true);
        }
      }
    }

    // Phase 4: Trigger "viewport enter/exit" events.
    for (let i = 0; i < this.resources_.length; i++) {
      const r = this.resources_[i];
      if (r.hasOwner()) {
        continue;
      }
      // Note that when the document is not visible, neither are any of its
      // elements to reduce CPU cycles.
      const shouldBeInViewport = (this.visible_ && r.isDisplayed() &&
          r.overlaps(visibleRect));
      r.setInViewport(shouldBeInViewport);
    }

    // Phase 5: Idle layout: layout more if we are otherwise not doing much.
    // TODO(dvoytenko): document/estimate IDLE timeouts and other constants
    if (this.visible_ &&
          this.exec_.getSize() == 0 &&
          this.queue_.getSize() == 0 &&
          now > this.exec_.getLastDequeueTime() + 5000) {
      let idleScheduledCount = 0;
      for (let i = 0; i < this.resources_.length; i++) {
        const r = this.resources_[i];
        if (r.getState() == ResourceState_.READY_FOR_LAYOUT &&
                !r.hasOwner() && r.isDisplayed()) {
          dev.fine(TAG_, 'idle layout:', r.debugid);
          this.scheduleLayoutOrPreload_(r, /* layout */ false);
          idleScheduledCount++;
          if (idleScheduledCount >= 4) {
            break;
          }
        }
      }
    }
  }

  /**
   * Dequeues layout and preload tasks from the queue and initiates their
   * execution.
   *
   * There are two main drivers to dequeueing: a task's score and timeout. The
   * score is built based on the resource's priority and viewport location
   * (see {@link calcTaskScore_}). Timeout depends on the priority and age
   * of tasks currently in the execution pool (see {@link calcTaskTimeout_}).
   *
   * @return {!time}
   * @private
   */
  work_() {
    const now = timer.now();
    const visibility = this.viewer_.getVisibilityState();

    const scorer = this.calcTaskScore_.bind(this, this.viewport_.getRect(),
        this.getScrollDirection());

    let timeout = -1;
    let task = this.queue_.peek(scorer);
    while (task) {
      timeout = this.calcTaskTimeout_(task);
      dev.fine(TAG_, 'peek from queue:', task.id,
          'sched at', task.scheduleTime,
          'score', scorer(task),
          'timeout', timeout);
      if (timeout > 16) {
        break;
      }

      this.queue_.dequeue(task);

      // Do not override a task in execution. This task will have to wait
      // until the current one finished the execution.
      const executing = this.exec_.getTaskById(task.id);
      if (executing) {
        // Reschedule post execution.
        const reschedule = this.reschedule_.bind(this, task);
        executing.promise.then(reschedule, reschedule);
      } else {
        task.promise = task.callback(visibility);
        task.startTime = now;
        dev.fine(TAG_, 'exec:', task.id, 'at', task.startTime);
        this.exec_.enqueue(task);
        task.promise.then(this.taskComplete_.bind(this, task, true),
            this.taskComplete_.bind(this, task, false))
            .catch(reportError);
      }

      task = this.queue_.peek(scorer);
      timeout = -1;
    }

    dev.fine(TAG_, 'queue size:', this.queue_.getSize());
    dev.fine(TAG_, 'exec size:', this.exec_.getSize());

    if (timeout >= 0) {
      // Still tasks in the queue, but we took too much time.
      // Schedule the next work pass.
      return timeout;
    }

    // No tasks left in the queue.
    // Schedule the next idle pass.
    let nextPassDelay = (now - this.exec_.getLastDequeueTime()) * 2;
    nextPassDelay = Math.max(Math.min(30000, nextPassDelay), 5000);
    return nextPassDelay;
  }

  /**
   * Calculates the task's score. A task with the lowest score will be dequeued
   * from the queue the first.
   *
   * There are three components of the score: element's priority, operation or
   * offset priority and viewport priority.
   *
   * Element's priority is constant of the element's name. E.g. amp-img has a
   * priority of 0, while amp-ad has a priority of 2.
   *
   * The operation (offset) priority is the priority of the task. A layout is
   * a high-priority task while preload is a lower-priority task.
   *
   * Viewport priority is a function of the distance of the element from the
   * currently visible viewports. The elements in the visible viewport get
   * higher priority and further away from the viewport get lower priority.
   * This priority also depends on whether or not the user is scrolling towards
   * this element or away from it.
   *
   * @param {!LayoutRect} viewportRect
   * @param {number} dir
   * @param {!TaskDef} task
   * @private
   */
  calcTaskScore_(viewportRect, dir, task) {
    const box = task.resource.getLayoutBox();
    let posPriority = Math.floor((box.top - viewportRect.top) /
        viewportRect.height);
    if (posPriority != 0 && Math.sign(posPriority) != (dir || 1)) {
      posPriority *= 2;
    }
    posPriority = Math.abs(posPriority);
    return task.priority * PRIORITY_BASE_ + posPriority;
  }

  /**
   * Calculates the timeout of a task. The timeout depends on two main factors:
   * the priorities of the tasks currently in the execution pool and their age.
   * The timeout is calculated against each task in the execution pool and the
   * maximum value is returned.
   *
   * A task is penalized with higher timeout values when it's lower in priority
   * than the task in the execution pool. However, this penalty is judged
   * against the age of the executing task. If it has been in executing for
   * some time, the penalty is reduced.
   *
   * @param {!TaskDef} task
   * @private
   */
  calcTaskTimeout_(task) {
    const now = timer.now();

    if (this.exec_.getSize() == 0) {
      // If we've never been visible, return 0. This follows the previous
      // behavior of not delaying tasks when there's nothing to do.
      if (this.firstVisibleTime_ === -1) {
        return 0;
      }

      // Scale off the first visible time, so penalized tasks must wait a
      // second or two to run. After we have been visible for a time, we no
      // longer have to wait.
      const penalty = task.priority * PRIORITY_PENALTY_TIME_;
      return Math.max(penalty - (now - this.firstVisibleTime_), 0);
    }

    let timeout = 0;
    this.exec_.forEach(other => {
      // Higher priority tasks get the head start. Currently 500ms per a drop
      // in priority (note that priority is 10-based).
      const penalty = Math.max((task.priority - other.priority) *
          PRIORITY_PENALTY_TIME_, 0);
      // TODO(dvoytenko): Consider running total and not maximum.
      timeout = Math.max(timeout, penalty - (now - other.startTime));
    });

    return timeout;
  }

  /**
   * @param {!TaskDef} task
   * @private
   */
  reschedule_(task) {
    if (!this.queue_.getTaskById(task.id)) {
      this.queue_.enqueue(task);
    }
  }

  /**
   * @param {!TaskDef} task
   * @param {boolean} success
   * @param {*=} opt_reason
   * @return {!Promise|undefined}
   * @private
   */
  taskComplete_(task, success, opt_reason) {
    this.exec_.dequeue(task);
    this.schedulePass(POST_TASK_PASS_DELAY_);
    if (!success) {
      dev.error(TAG_, 'task failed:',
          task.id, task.resource.debugid, opt_reason);
      return Promise.reject(opt_reason);
    }
  }

  /**
   * Schedules change of the element's height.
   * @param {!Resource} resource
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {boolean} force
   * @param {function=} opt_callback A callback function.
   * @private
   */
  scheduleChangeSize_(resource, newHeight, newWidth, force, opt_callback) {
    resource.resetPendingChangeSize();
    const layoutBox = resource.getLayoutBox();
    if ((newHeight === undefined || newHeight == layoutBox.height) &&
        (newWidth === undefined || newWidth == layoutBox.width)) {
      if (newHeight === undefined && newWidth === undefined) {
        dev.error(
            TAG_, 'attempting to change size with undefined dimensions',
            resource.debugid);
      }
      // Nothing to do.
      return;
    }

    let request = null;
    for (let i = 0; i < this.requestsChangeSize_.length; i++) {
      if (this.requestsChangeSize_[i].resource == resource) {
        request = this.requestsChangeSize_[i];
        break;
      }
    }

    if (request) {
      request.newHeight = newHeight;
      request.newWidth = newWidth;
      request.force = force || request.force;
      request.callback = opt_callback;
    } else {
      this.requestsChangeSize_.push(/** {!ChangeSizeRequestDef} */{
        resource: resource,
        newHeight: newHeight,
        newWidth: newWidth,
        force: force,
        callback: opt_callback,
      });
    }
    this.schedulePassVsync();
  }

  /**
   * Schedules deferred mutate.
   * @param {!Resource} resource
   * @param {!Function} callback
   * @private
   */
  scheduleDeferredMutate_(resource, callback) {
    this.deferredMutates_.push(callback);
  }

  /**
   * Schedules layout or preload for the specified resource.
   * @param {!Resource} resource
   * @param {boolean} layout
   * @param {number=} opt_parentPriority
   * @private
   */
  scheduleLayoutOrPreload_(resource, layout, opt_parentPriority) {
    dev.assert(resource.getState() != ResourceState_.NOT_BUILT &&
        resource.isDisplayed(),
        'Not ready for layout: %s (%s)',
        resource.debugid, resource.getState());

    // Don't schedule elements when we're not visible, or in prerender mode
    // (and they can't prerender).
    if (!this.visible_) {
      if (this.viewer_.getVisibilityState() != VisibilityState.PRERENDER) {
        return;
      } else if (!resource.prerenderAllowed()) {
        return;
      }
    }

    if (!resource.isInViewport() && !resource.renderOutsideViewport()) {
      return;
    }
    if (layout) {
      this.schedule_(resource,
          LAYOUT_TASK_ID_, LAYOUT_TASK_OFFSET_,
          opt_parentPriority || 0,
          resource.startLayout.bind(resource));
    } else {
      this.schedule_(resource,
          PRELOAD_TASK_ID_, PRELOAD_TASK_OFFSET_,
          opt_parentPriority || 0,
          resource.startLayout.bind(resource));
    }
  }

  /**
   * Schedules layout or preload for the sub-resources of the specified
   * resource.
   * @param {!Resource} parentResource
   * @param {boolean} layout
   * @param {!Array<!Element>} subElements
   * @private
   */
  scheduleLayoutOrPreloadForSubresources_(parentResource, layout, subElements) {
    const resources = [];
    this.discoverResourcesForArray_(parentResource, subElements, resource => {
      if (resource.getState() != ResourceState_.NOT_BUILT) {
        resources.push(resource);
      }
    });
    if (resources.length > 0) {
      resources.forEach(resource => {
        resource.measure();
        if (resource.getState() == ResourceState_.READY_FOR_LAYOUT &&
                resource.isDisplayed()) {
          this.scheduleLayoutOrPreload_(resource, layout,
              parentResource.getPriority());
        }
      });
    }
  }

  /**
   * Schedules a task.
   * @param {!Resource} resource
   * @param {string} localId
   * @param {number} priorityOffset
   * @param {number} parentPriority
   * @param {function():!Promise} callback
   * @private
   */
  schedule_(resource, localId, priorityOffset, parentPriority, callback) {
    const taskId = resource.getTaskId(localId);

    const task = {
      id: taskId,
      resource: resource,
      priority: Math.max(resource.getPriority(), parentPriority) +
          priorityOffset,
      callback: callback,
      scheduleTime: timer.now(),
      startTime: 0,
      promise: null,
    };
    dev.fine(TAG_, 'schedule:', task.id, 'at', task.scheduleTime);

    // Only schedule a new task if there's no one enqueued yet or if this task
    // has a higher priority.
    const queued = this.queue_.getTaskById(taskId);
    if (!queued || task.priority < queued.priority) {
      if (queued) {
        this.queue_.dequeue(queued);
      }
      this.queue_.enqueue(task);
      this.schedulePass(this.calcTaskTimeout_(task));
    }
    task.resource.layoutScheduled();
  }

  /**
   * Updates inViewport state for the specified sub-resources of a resource.
   * @param {!Resource} parentResource
   * @param {!Array<!Element>} subElements
   * @param {boolean} inLocalViewport
   * @private
   */
  updateInViewportForSubresources_(parentResource, subElements,
      inLocalViewport) {
    const inViewport = parentResource.isInViewport() && inLocalViewport;
    this.discoverResourcesForArray_(parentResource, subElements, resource => {
      resource.setInViewport(inViewport);
    });
  }

  /**
   * Finds resources within the parent resource's shallow subtree.
   * @param {!Resource} parentResource
   * @param {!Array<!Element>} elements
   * @param {function(!Resource)} callback
   */
  discoverResourcesForArray_(parentResource, elements, callback) {
    elements.forEach(element => {
      dev.assert(parentResource.element.contains(element));
      this.discoverResourcesForElement_(element, callback);
    });
  }

  /**
   * @param {!Element} element
   * @param {function(!Resource)} callback
   */
  discoverResourcesForElement_(element, callback) {
    // Breadth-first search.
    if (element.classList.contains('-amp-element')) {
      callback(this.getResourceForElement(element));
      // Also schedule amp-element that is a placeholder for the element.
      const placeholder = element.getPlaceholder();
      if (placeholder) {
        this.discoverResourcesForElement_(placeholder, callback);
      }
    } else {
      const ampElements = element.getElementsByClassName('-amp-element');
      const seen = [];
      for (let i = 0; i < ampElements.length; i++) {
        const ampElement = ampElements[i];
        let covered = false;
        for (let j = 0; j < seen.length; j++) {
          if (seen[j].contains(ampElement)) {
            covered = true;
            break;
          }
        }
        if (!covered) {
          seen.push(ampElement);
          callback(this.getResourceForElement(ampElement));
        }
      }
    }
  }

  /**
   * Calls iterator on each sub-resource
   * @param {function(!Resource, number)} iterator
   */
  setupVisibilityStateMachine_(vsm) {
    const prerender = VisibilityState.PRERENDER;
    const visible = VisibilityState.VISIBLE;
    const hidden = VisibilityState.HIDDEN;
    const paused = VisibilityState.PAUSED;
    const inactive = VisibilityState.INACTIVE;

    const doPass = () => {
      // If viewport size is 0, the manager will wait for the resize event.
      const viewportSize = this.viewport_.getSize();
      if (viewportSize.height > 0 && viewportSize.width > 0) {
        if (this.hasMutateWork_()) {
          this.mutateWork_();
        }
        this.discoverWork_();
        let delay = this.work_();
        if (this.hasMutateWork_()) {
          // Overflow mutate work.
          delay = Math.min(delay, MUTATE_DEFER_DELAY_);
        }
        if (this.visible_) {
          dev.fine(TAG_, 'next pass:', delay);
          this.schedulePass(delay);
          this.updateScrollHeight_();
        } else {
          dev.fine(TAG_, 'document is not visible: no scheduling');
        }
      }
    };
    const noop = () => {};
    const pause = () => {
      this.resources_.forEach(r => r.pause());
    };
    const unload = () => {
      this.resources_.forEach(r => {
        r.unload();
        this.cleanupTasks_(r);
      });
      this.unselectText();
    };
    const resume = () => {
      this.resources_.forEach(r => r.resume());
      doPass();
    };

    vsm.addTransition(prerender, prerender, doPass);
    vsm.addTransition(prerender, visible, doPass);
    vsm.addTransition(prerender, hidden, doPass);
    vsm.addTransition(prerender, inactive, doPass);
    vsm.addTransition(prerender, paused, doPass);

    vsm.addTransition(visible, visible, doPass);
    vsm.addTransition(visible, hidden, doPass);
    vsm.addTransition(visible, inactive, unload);
    vsm.addTransition(visible, paused, pause);

    vsm.addTransition(hidden, visible, doPass);
    vsm.addTransition(hidden, hidden, doPass);
    vsm.addTransition(hidden, inactive, unload);
    vsm.addTransition(hidden, paused, pause);

    vsm.addTransition(inactive, visible, doPass);
    vsm.addTransition(inactive, hidden, doPass);
    vsm.addTransition(inactive, inactive, noop);
    vsm.addTransition(inactive, paused, doPass);

    vsm.addTransition(paused, visible, resume);
    vsm.addTransition(paused, hidden, doPass);
    vsm.addTransition(paused, inactive, unload);
    vsm.addTransition(paused, paused, noop);
  }

  /**
   * Unselects any selected text
   */
  unselectText() {
    try {
      this.win.getSelection().removeAllRanges();
    } catch (e) {
      // Selection API not supported.
    }
  }

  /**
   * Cleanup task queues from tasks for elements that has been unloaded.
   * @param resource
   * @param opt_removePending Whether to remove from pending build resources.
   * @private
   */
  cleanupTasks_(resource, opt_removePending) {
    if (resource.getState() == ResourceState_.NOT_LAID_OUT) {
      // If the layout promise for this resource has not resolved yet, remove
      // it from the task queues to make sure this resource can be rescheduled
      // for layout again later on.
      // TODO(mkhatib): Think about how this might affect preload tasks once the
      // prerender change is in.
      this.queue_.purge(task => {
        return task.resource == resource;
      });
      this.exec_.purge(task => {
        return task.resource == resource;
      });
      this.requestsChangeSize_ = this.requestsChangeSize_.filter(
          request => request.resource != resource);
    }

    if (resource.getState() == ResourceState_.NOT_BUILT && opt_removePending &&
        this.pendingBuildResources_) {
      const pendingIndex = this.pendingBuildResources_.indexOf(resource);
      if (pendingIndex != -1) {
        this.pendingBuildResources_.splice(pendingIndex, 1);
      }
    }
  }
}


/**
 * A Resource binding for an AmpElement.
 *
 * Visible for testing only!
 */
export class Resource {

  /**
   * @param {number} id
   * @param {!AmpElement} element
   * @param {!Resources} resources
   */
  constructor(id, element, resources) {
    /** @private {number} */
    this.id_ = id;

    /** @export @const {!AmpElement} */
    this.element = element;

    /** @export @const {string} */
    this.debugid = element.tagName.toLowerCase() + '#' + id;

    /** @private {!Resources} */
    this.resources_ = resources;

    /** @private {boolean} */
    this.blacklisted_ = false;

    /** @const {!AmpElement|undefined|null} */
    this.owner_ = undefined;

    /** @private {!ResourceState_} */
    this.state_ = element.isBuilt() ? ResourceState_.NOT_LAID_OUT :
        ResourceState_.NOT_BUILT;

    /** @private {number} */
    this.layoutCount_ = 0;

    /** @private {!LayoutRect} */
    this.layoutBox_ = layoutRectLtwh(-10000, -10000, 0, 0);

    /** @private {!LayoutRect} */
    this.initialLayoutBox_ = this.layoutBox_;

    /** @private {boolean} */
    this.isMeasureRequested_ = false;

    /** @private {boolean} */
    this.isInViewport_ = false;

    /** @private {?Promise<undefined>} */
    this.layoutPromise_ = null;

    /**
     * Only used in the "runtime off" case when the monitoring code needs to
     * known when the element is upgraded.
     * @private {!Function|undefined}
     */
    this.onUpgraded_ = undefined;

   /**
    * Pending change size that was requested but could not be satisfied.
    * @private {!SizeDef|undefined}
    */
    this.pendingChangeSize_ = undefined;

    /** @private @const {!Promise} */
    this.loadPromise_ = new Promise(resolve => {
      /** @const  */
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
   * Returns the resource's state. See {@link ResourceState_} for details.
   * @return {!ResourceState_}
   */
  getState() {
    return this.state_;
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
      dev.error(TAG_, 'failed to build:', this.debugid, e);
      this.blacklisted_ = true;
      return;
    }

    if (this.hasBeenMeasured()) {
      this.state_ = ResourceState_.READY_FOR_LAYOUT;
    } else {
      this.state_ = ResourceState_.NOT_LAID_OUT;
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
   * @param {function=} opt_callback A callback function.
   */
  changeSize(newHeight, newWidth, opt_callback) {
    this.element./*OK*/changeSize(newHeight, newWidth);
    // Schedule for re-layout.
    if (this.state_ != ResourceState_.NOT_BUILT) {
      this.state_ = ResourceState_.NOT_LAID_OUT;
    }
    if (opt_callback) {
      opt_callback();
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

  /** @private */
  resetPendingChangeSize() {
    this.pendingChangeSize_ = undefined;
  }

  /**
   * @return {!SizeDef|undefined}
   */
  getPendingChangeSize() {
    return this.pendingChangeSize_;
  }

  /**
   * Measures the resource's boundaries. Only allowed for upgraded elements.
   */
  measure() {
    this.isMeasureRequested_ = false;
    const box = this.resources_.viewport_.getLayoutRect(this.element);
    // Note that "left" doesn't affect readiness for the layout.
    if (this.state_ == ResourceState_.NOT_LAID_OUT ||
          this.layoutBox_.top != box.top ||
          this.layoutBox_.width != box.width ||
          this.layoutBox_.height != box.height) {

      if (this.element.isUpgraded() &&
              this.state_ != ResourceState_.NOT_BUILT &&
              (this.state_ == ResourceState_.NOT_LAID_OUT ||
                  this.element.isRelayoutNeeded())) {
        this.state_ = ResourceState_.READY_FOR_LAYOUT;
      }
    }
    if (!this.hasBeenMeasured()) {
      this.initialLayoutBox_ = box;
    }
    this.layoutBox_ = box;
    this.element.updateLayoutBox(box);
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
    return this.layoutBox_.top != -10000;
  }

  /**
   * Requests the element to be remeasured on the next pass.
   */
  requestMeasure() {
    if (this.state_ == ResourceState_.NOT_BUILT) {
      // Can't measure unbuilt element.
      return;
    }
    this.isMeasureRequested_ = true;
  }

  /**
   * Returns a previously measured layout box.
   * @return {!LayoutRect}
   */
  getLayoutBox() {
    return this.layoutBox_;
  }

  /**
   * Returns the first measured layout box.
   * @return {!LayoutRect}
   */
  getInitialLayoutBox() {
    return this.initialLayoutBox_;
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
   * Whether the element's layout box overlaps with the specified rect.
   * @param {!LayoutRect} rect
   * @return {boolean}
   */
  overlaps(rect) {
    return layoutRectsOverlap(this.layoutBox_, rect);
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
    const renders = this.element.renderOutsideViewport();
    // Boolean interface, element is either always allowed or never allowed to
    // render outside viewport.
    if (renders === true || renders === false) {
      return renders;
    }
    // Numeric interface, element is allowed to render outside viewport when it
    // is within X times the viewport height of the current viewport.
    const viewportBox = this.resources_.getViewport().getRect();
    const layoutBox = this.layoutBox_;
    const scrollDirection = this.resources_.getScrollDirection();
    const multipler = Math.max(renders, 0);
    let scrollPenalty = 1;
    let distance;
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
    this.state_ = ResourceState_.LAYOUT_SCHEDULED;
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
    if (this.state_ == ResourceState_.LAYOUT_COMPLETE) {
      return Promise.resolve();
    }
    if (this.state_ == ResourceState_.LAYOUT_FAILED) {
      return Promise.reject('already failed');
    }

    dev.assert(this.state_ != ResourceState_.NOT_BUILT,
        'Not ready to start layout: %s (%s)', this.debugid, this.state_);

    if (!isDocumentVisible && !this.prerenderAllowed()) {
      dev.fine(TAG_, 'layout canceled due to non pre-renderable element:',
          this.debugid, this.state_);
      this.state_ = ResourceState_.READY_FOR_LAYOUT;
      return Promise.resolve();
    }

    if (!this.isInViewport() && !this.renderOutsideViewport()) {
      dev.fine(TAG_, 'layout canceled due to element not being in viewport:',
          this.debugid, this.state_);
      this.state_ = ResourceState_.READY_FOR_LAYOUT;
      return Promise.resolve();
    }

    // Double check that the element has not disappeared since scheduling
    this.measure();
    if (!this.isDisplayed()) {
      dev.fine(TAG_, 'layout canceled due to element loosing display:',
          this.debugid, this.state_);
      return Promise.resolve();
    }

    // Not-wanted re-layouts are ignored.
    if (this.layoutCount_ > 0 && !this.element.isRelayoutNeeded()) {
      dev.fine(TAG_, 'layout canceled since it wasn\'t requested:',
          this.debugid, this.state_);
      this.state_ = ResourceState_.LAYOUT_COMPLETE;
      return Promise.resolve();
    }

    dev.fine(TAG_, 'start layout:', this.debugid, 'count:', this.layoutCount_);
    this.layoutCount_++;
    this.state_ = ResourceState_.LAYOUT_SCHEDULED;

    this.resources_.framerate_.collect(this.element);
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
    this.loadPromiseResolve_();
    this.layoutPromise_ = null;
    this.state_ = success ? ResourceState_.LAYOUT_COMPLETE :
        ResourceState_.LAYOUT_FAILED;
    if (success) {
      dev.fine(TAG_, 'layout complete:', this.debugid);
    } else {
      dev.fine(TAG_, 'loading failed:', this.debugid, opt_reason);
      return Promise.reject(opt_reason);
    }
  }

  /**
   * Returns true if the resource layout has not completed or failed.
   * @return {boolean}
   * */
  isLayoutPending() {
    return this.state_ != ResourceState_.LAYOUT_COMPLETE &&
        this.state_ != ResourceState_.LAYOUT_FAILED;
  }

  /**
   * Returns a promise that is resolved when this resource is laid out
   * for the first time and the resource was loaded.
   * @return {!Promise}
   */
  loaded() {
    return this.loadPromise_;
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
    dev.fine(TAG_, 'inViewport:', this.debugid, inViewport);
    this.isInViewport_ = inViewport;
    this.element.viewportCallback(inViewport);
  }

  /**
   * Calls element's unlayoutCallback callback and resets state for
   * relayout in case document becomes active again.
   */
  unlayout() {
    if (this.state_ == ResourceState_.NOT_BUILT ||
        this.state_ == ResourceState_.NOT_LAID_OUT) {
      return;
    }
    this.setInViewport(false);
    if (this.element.unlayoutCallback()) {
      this.element.togglePlaceholder(true);
      this.state_ = ResourceState_.NOT_LAID_OUT;
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
    if (this.state_ == ResourceState_.NOT_BUILT || this.paused_) {
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
   * Calls element's resumeCallback callback.
   */
  resume() {
    if (this.state_ == ResourceState_.NOT_BUILT || !this.paused_) {
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

  /**
   * Only allowed in dev mode when runtime is turned off. Performs all steps
   * necessary to render an element.
   * @return {!Promise}
   * @export
   */
  forceAll() {
    dev.assert(!this.resources_.isRuntimeOn_);
    let p = Promise.resolve();
    if (this.state_ == ResourceState_.NOT_BUILT) {
      if (!this.element.isUpgraded()) {
        p = p.then(() => {
          return new Promise(resolve => {
            this.onUpgraded_ = resolve;
          });
        });
      }
      p = p.then(() => {
        this.onUpgraded_ = undefined;
        this.build(true);
      });
    }
    return p.then(() => {
      this.applySizesAndMediaQuery();
      this.measure();
      if (this.layoutPromise_) {
        return this.layoutPromise_;
      }
      if (this.state_ == ResourceState_.LAYOUT_COMPLETE ||
              this.state_ == ResourceState_.LAYOUT_FAILED ||
              this.layoutCount_ > 0) {
        return;
      }
      if (!this.isDisplayed()) {
        return;
      }
      this.layoutCount_++;
      return this.element.layoutCallback();
    });
  }
}


/**
 * A scheduling queue for Resources.
 *
 * Visible only for testing!
 *
 * @private
 */
export class TaskQueue_ {

  constructor() {
    /** @private @const {!Array<!TaskDef>} */
    this.tasks_ = [];

    /** @private @const {!Object<string, !TaskDef>} */
    this.taskIdMap_ = {};

    /** @private {!time} */
    this.lastEnqueueTime_ = 0;

    /** @private {!time} */
    this.lastDequeueTime_ = 0;
  }

  /**
   * Size of the queue.
   * @return {number}
   */
  getSize() {
    return this.tasks_.length;
  }

  /**
   * Last time a task was enqueued.
   * @return {!time}
   */
  getLastEnqueueTime() {
    return this.lastEnqueueTime_;
  }

  /**
   * Last time a task was dequeued.
   * @return {!time}
   */
  getLastDequeueTime() {
    return this.lastDequeueTime_;
  }

  /**
   * Returns the task with the specified ID or null.
   * @param {string} taskId
   * @return {?TaskDef}
   */
  getTaskById(taskId) {
    return this.taskIdMap_[taskId] || null;
  }

  /**
   * Enqueues the task. If the task is already in the queue, the error is
   * thrown.
   * @param {!TaskDef} task
   */
  enqueue(task) {
    dev.assert(!this.taskIdMap_[task.id], 'Task already enqueued: %s', task.id);
    this.tasks_.push(task);
    this.taskIdMap_[task.id] = task;
    this.lastEnqueueTime_ = timer.now();
  }

  /**
   * Dequeues the task and returns "true" if dequeueing is successful. Otherwise
   * returns "false", e.g. when this task is not currently enqueued.
   * @param {!TaskDef} task
   * @return {boolean}
   */
  dequeue(task) {
    const existing = this.taskIdMap_[task.id];
    const dequeued = this.removeAtIndex(task, this.tasks_.indexOf(existing));
    if (!dequeued) {
      return false;
    }
    this.lastDequeueTime_ = timer.now();
    return true;
  }

  /**
   * Returns the task with the minimal score based on the provided scoring
   * callback.
   * @param {function(!TaskDef):number} scorer
   * @return {?TaskDef}
   */
  peek(scorer) {
    let minScore = 1e6;
    let minTask = null;
    for (let i = 0; i < this.tasks_.length; i++) {
      const task = this.tasks_[i];
      const score = scorer(task);
      if (score < minScore) {
        minScore = score;
        minTask = task;
      }
    }
    return minTask;
  }

  /**
   * Iterates over all tasks in queue in the insertion order.
   * @param {function(!TaskDef)} callback
   */
  forEach(callback) {
    this.tasks_.forEach(callback);
  }

  /**
   * Removes the task and returns "true" if dequeueing is successful. Otherwise
   * returns "false", e.g. when this task is not currently enqueued.
   * @param {!TaskDef} task
   * @param {number} index of the task to remove.
   * @return {boolean}
   */
  removeAtIndex(task, index) {
    const existing = this.taskIdMap_[task.id];
    if (!existing || this.tasks_[index] != existing) {
      return false;
    }
    this.tasks_.splice(index, 1);
    delete this.taskIdMap_[task.id];
    return true;
  }

  /**
   * Removes tasks in queue that pass the callback test.
   * @param {function(!TaskDef):boolean} callback Return true to remove the task.
   */
  purge(callback) {
    let index = this.tasks_.length;
    while (index--) {
      if (callback(this.tasks_[index])) {
        this.removeAtIndex(this.tasks_[index], index);
      }
    }
  }
}


/**
 * @param {!Element|!Array<!Element>} elements
 * @return {!Array<!Element>}
 */
function elements_(elements) {
  return isArray(elements) ? elements : [elements];
}


/**
 * Resource state.
 *
 * Visible for testing only!
 *
 * @enum {number}
 * @private
 */
export const ResourceState_ = {
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
 * The internal structure for the task.
 * @typedef {{
 *   id: string,
 *   resource: !Resource,
 *   priority: number,
 *   callback: function(boolean),
 *   scheduleTime: time,
 *   startTime: time,
 *   promise: (!Promise|undefined)
 * }}
 * @private
 */
let TaskDef;

/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   height: (number|undefined),
 *   width: (number|undefined)
 * }}
 * @private
 */
let SizeDef;

/**
 * @param {!Window} win
 * @return {!Resources}
 */
export function installResourcesService(win) {
  return getService(win, 'resources', () => {
    return new Resources(win);
  });
};
