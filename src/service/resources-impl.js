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

import {CommonSignals} from '../common-signals';
import {FiniteStateMachine} from '../finite-state-machine';
import {FocusHistory} from '../focus-history';
import {Pass} from '../pass';
import {Resource, ResourceState} from './resource';
import {Services} from '../services';
import {TaskQueue} from './task-queue';
import {VisibilityState} from '../visibility-state';
import {areMarginsChanged} from '../layout-rect';
import {closest, hasNextNodeInDocumentOrder} from '../dom';
import {computedStyle} from '../style';
import {dev} from '../log';
import {dict, hasOwn} from '../utils/object';
import {expandLayoutRect} from '../layout-rect';
import {filterSplice} from '../utils/array';
import {getSourceUrl} from '../url';
import {checkAndFix as ieMediaCheckAndFix} from './ie-media-bug';
import {isArray} from '../types';
import {isExperimentOn} from '../experiments';
import {loadPromise} from '../event-helper';
import {registerServiceBuilderForDoc} from '../service';
import {reportError} from '../error';

const TAG_ = 'Resources';
const READY_SCAN_SIGNAL_ = 'ready-scan';
const LAYOUT_TASK_ID_ = 'L';
const LAYOUT_TASK_OFFSET_ = 0;
const PRELOAD_TASK_ID_ = 'P';
const PRELOAD_TASK_OFFSET_ = 2;
const PRIORITY_BASE_ = 10;
const PRIORITY_PENALTY_TIME_ = 1000;
const POST_TASK_PASS_DELAY_ = 1000;
const MUTATE_DEFER_DELAY_ = 500;
const FOCUS_HISTORY_TIMEOUT_ = 1000 * 60; // 1min
const FOUR_FRAME_DELAY_ = 70;
const DOC_BOTTOM_OFFSET_LIMIT_ = 1000;


/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   newMargins: !../layout-rect.LayoutMarginsChangeDef,
 *   currentMargins: !../layout-rect.LayoutMarginsDef
 * }}
 */
let MarginChangeDef;

/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   resource: !Resource,
 *   newHeight: (number|undefined),
 *   newWidth: (number|undefined),
 *   marginChange: (!MarginChangeDef|undefined),
 *   force: boolean,
 *   callback: (function(boolean)|undefined)
 * }}
 */
let ChangeSizeRequestDef;

export class Resources {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @const @private {!./viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private {boolean} */
    this.isRuntimeOn_ = this.viewer_.isRuntimeOn();

    /**
     * Used primarily for testing to allow build phase to proceed.
     * @const @private {boolean}
     */
    this.isBuildOn_ = false;

    /** @private @const {number} */
    this.maxDpr_ = this.win.devicePixelRatio || 1;

    /** @private {number} */
    this.resourceIdCounter_ = 0;

    /** @private @const {!Array<!Resource>} */
    this.resources_ = [];

    /** @private {number} */
    this.addCount_ = 0;

    /** @private {number} */
    this.buildAttemptsCount_ = 0;

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
     * Whether AMP has been fully initialized.
     * @private {boolean}
     */
    this.ampInitialized_ = false;

    /**
     * We also adjust the timeout penalty shortly after the first pass.
     * @private {number}
     */
    this.firstVisibleTime_ = -1;

    /** @private {boolean} */
    this.relayoutAll_ = true;

    /**
     * TODO(jridgewell): relayoutTop should be replaced with parent layer
     * dirtying.
     * @private {number}
     */
    this.relayoutTop_ = -1;

    /** @private {time} */
    this.lastScrollTime_ = 0;

    /** @private {number} */
    this.lastVelocity_ = 0;

    /** @const @private {!Pass} */
    this.pass_ = new Pass(this.win, () => this.doPass());

    /** @const @private {!Pass} */
    this.remeasurePass_ = new Pass(this.win, () => {
      this.relayoutAll_ = true;
      this.schedulePass();
    });

    /** @const {!TaskQueue} */
    this.exec_ = new TaskQueue();

    /** @const {!TaskQueue} */
    this.queue_ = new TaskQueue();

    /** @private @const {boolean} */
    this.useLayers_ = isExperimentOn(this.win, 'layers');

    let boundScorer;
    if (this.useLayers_) {
      boundScorer = this.calcTaskScoreLayers_.bind(this);
    } else {
      boundScorer = this.calcTaskScore_.bind(this);
    }
    /** @const {!function(./task-queue.TaskDef, !Object<string, *>):number} */
    this.boundTaskScorer_ = boundScorer;

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

    /** @private @const {!./viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

    /** @private @const {!./vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win);

    /** @private @const {!FocusHistory} */
    this.activeHistory_ = new FocusHistory(this.win, FOCUS_HISTORY_TIMEOUT_);

    /** @private {boolean} */
    this.vsyncScheduled_ = false;

    /** @private {number} */
    this.contentHeight_ = 0;

    /** @private {boolean} */
    this.maybeChangeHeight_ = false;

    /** @private @const {!FiniteStateMachine<!VisibilityState>} */
    this.visibilityStateMachine_ = new FiniteStateMachine(
        this.viewer_.getVisibilityState()
    );
    this.setupVisibilityStateMachine_(this.visibilityStateMachine_);

    // When viewport is resized, we have to re-measure all elements.
    this.viewport_.onChanged(event => {
      this.lastScrollTime_ = Date.now();
      this.lastVelocity_ = event.velocity;
      if (event.relayoutAll) {
        this.relayoutAll_ = true;
        this.maybeChangeHeight_ = true;
      }
      this.schedulePass();
    });
    this.viewport_.onScroll(() => {
      this.lastScrollTime_ = Date.now();
    });

    if (this.useLayers_) {
      const layers = Services.layersForDoc(this.ampdoc);

      /** @private @const {!./layers-impl.LayoutLayers} */
      this.layers_ = layers;

      layers.onScroll((/* elements */) => {
        this.schedulePass();
      });

      /** @private @const {function(number, !./layers-impl.LayoutElement, number, !Object<string, *>):number} */
      this.boundCalcLayoutScore_ = this.calcLayoutScore_.bind(this);
    }

    // When document becomes visible, e.g. from "prerender" mode, do a
    // simple pass.
    this.viewer_.onVisibilityChanged(() => {
      if (this.firstVisibleTime_ == -1 && this.viewer_.isVisible()) {
        this.firstVisibleTime_ = Date.now();
      }
      this.schedulePass();
    });

    this.viewer_.onRuntimeState(state => {
      dev().fine(TAG_, 'Runtime state:', state);
      this.isRuntimeOn_ = state;
      this.schedulePass(1);
    });

    this.activeHistory_.onFocus(element => {
      this.checkPendingChangeSize_(element);
    });

    this.schedulePass();

    // Ensure that we attempt to rebuild things when DOM is ready.
    this.ampdoc.whenReady().then(() => {
      this.documentReady_ = true;
      this.buildReadyResources_();
      this.pendingBuildResources_ = null;
      const fixPromise = ieMediaCheckAndFix(this.win);
      const remeasure = () => this.remeasurePass_.schedule();
      if (fixPromise) {
        fixPromise.then(remeasure);
      } else {
        // No promise means that there's no problem.
        remeasure();
      }
      this.monitorInput_();

      // Safari 10 and under incorrectly estimates font spacing for
      // `@font-face` fonts. This leads to wild measurement errors. The best
      // course of action is to remeasure everything on window.onload or font
      // timeout (3s), whichever is earlier. This has to be done on the global
      // window because this is where the fonts are always added.
      // Unfortunately, `document.fonts.ready` cannot be used here due to
      // https://bugs.webkit.org/show_bug.cgi?id=174030.
      // See https://bugs.webkit.org/show_bug.cgi?id=174031 for more details.
      Promise.race([
        loadPromise(this.win),
        Services.timerFor(this.win).promise(3100),
      ]).then(remeasure);

      // Remeasure the document when all fonts loaded.
      if (this.win.document.fonts &&
          this.win.document.fonts.status != 'loaded') {
        this.win.document.fonts.ready.then(remeasure);
      }
    });
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
   * Whether the runtime is currently on.
   * @return {boolean}
   */
  isRuntimeOn() {
    return this.isRuntimeOn_;
  }

  /**
   * Signals that the document has been started rendering.
   * @restricted
   */
  renderStarted() {
    this.ampdoc.signals().signal(CommonSignals.RENDER_START);
  }


  /**
   * Returns a subset of resources which are (1) belong to the specified host
   * window, and (2) meet the filterFn given.
   * @param {!Window} hostWin
   * @param {function(!Resource):boolean} filterFn
   * @return {!Promise<!Array<!Resource>>}
   */
  getMeasuredResources(hostWin, filterFn) {
    // First, wait for the `ready-scan` signal. Waiting for each element
    // individually is too expensive and `ready-scan` will cover most of
    // the initially parsed elements.
    // TODO(jridgewell): this path should be switched to use a future
    // "layer has been measured" signal.
    return this.ampdoc.signals().whenSignal(READY_SCAN_SIGNAL_).then(() => {
      // Second, wait for any left-over elements to complete measuring.
      const measurePromiseArray = [];
      this.resources_.forEach(r => {
        if (!r.hasBeenMeasured() && r.hostWin == hostWin && !r.hasOwner()) {
          measurePromiseArray.push(this.ensuredMeasured_(r));
        }
      });
      return Promise.all(measurePromiseArray);
    }).then(() => this.resources_.filter(r => {
      return r.hostWin == hostWin && !r.hasOwner() && r.hasBeenMeasured() &&
        filterFn(r);
    }));
  }

  /**
   * Returns a subset of resources which are (1) belong to the specified host
   * window, and (2) positioned in the specified rect.
   * @param {!Window} hostWin
   * @param {!../layout-rect.LayoutRectDef} rect
   * @param {boolean=} opt_isInPrerender signifies if we are in prerender mode.
   * @return {!Promise<!Array<!Resource>>}
   */
  getResourcesInRect(hostWin, rect, opt_isInPrerender) {
    return this.getMeasuredResources(hostWin, r => {
      // TODO(jridgewell): Remove isFixed check here once the position
      // is calculted correctly in a separate layer for embeds.
      if (!r.isDisplayed() || (!r.overlaps(rect) && !r.isFixed()) ||
          (opt_isInPrerender && !r.prerenderAllowed())) {
        return false;
      }
      return true;
    });
  }

  /** @private */
  monitorInput_() {
    const input = Services.inputFor(this.win);
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
    this.ampdoc.whenBodyAvailable().then(body => {
      this.vsync_.mutate(() => {
        body.classList.toggle(clazz, on);
      });
    });
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
   * @return {!Resource}
   */
  getResourceForElement(element) {
    return Resource.forElement(element);
  }

  /**
   * Returns the {@link Resource} instance corresponding to the specified AMP
   * Element. Returns null if no resource is found.
   * @param {!AmpElement} element
   * @return {?Resource}
   */
  getResourceForElementOptional(element) {
    return Resource.forElementOptional(element);
  }

  /**
   * Returns a promise to the layoutBox for the element. If the element is
   * resource-backed then makes use of the resource layoutBox, otherwise
   * measures the element directly.
   * @param {!Element} element
   * @return {!Promise<!../layout-rect.LayoutRectDef>}
   */
  getElementLayoutBox(element) {
    const resource = this.getResourceForElementOptional(element);
    if (resource) {
      return this.ensuredMeasured_(resource);
    }
    return this.vsync_.measurePromise(() => {
      return this.getViewport().getLayoutRect(element);
    });
  }

  /**
   * @param {!Resource} resource
   * @return {!Promise<!../layout-rect.LayoutRectDef>}
   * @private
   */
  ensuredMeasured_(resource) {
    if (resource.hasBeenMeasured()) {
      return Promise.resolve(resource.getPageLayoutBox());
    }
    return this.vsync_.measurePromise(() => {
      resource.measure();
      return resource.getPageLayoutBox();
    });
  }

  /**
   * Returns the viewport instance
   * @return {!./viewport/viewport-impl.Viewport}
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
   */
  add(element) {
    // Ensure the viewport is ready to accept the first element.
    this.addCount_++;
    if (this.addCount_ == 1) {
      this.viewport_.ensureReadyForElements();
    }

    // First check if the resource is being reparented and if it requires
    // reconstruction. Only already built elements are eligible.
    let resource = Resource.forElementOptional(element);
    if (resource &&
        resource.getState() != ResourceState.NOT_BUILT &&
        !element.reconstructWhenReparented()) {
      resource.requestMeasure();
      dev().fine(TAG_, 'resource reused:', resource.debugid);
    } else {
      // Create and add a new resource.
      resource = new Resource((++this.resourceIdCounter_), element, this);
      dev().fine(TAG_, 'resource added:', resource.debugid);
    }
    this.resources_.push(resource);
    this.remeasurePass_.schedule(1000);
  }

  /**
   * Limits the number of elements being build in pre-render phase to
   * a finite number. Returns false if the number has been reached.
   * @return {boolean}
   */
  grantBuildPermission() {
    // For pre-render we want to limit the amount of CPU used, so we limit
    // the number of elements build. For pre-render to "seem complete"
    // we only need to build elements in the first viewport. We can't know
    // which are actually in the viewport (because the decision is pre-layout,
    // so we use a heuristic instead.
    // Most documents have 10 or less AMP tags. By building 20 we should not
    // change the behavior for the vast majority of docs, and almost always
    // catch everything in the first viewport.
    return this.buildAttemptsCount_++ < 20 || this.viewer_.hasBeenVisible();
  }

  /**
   * Builds the element if ready to be built, otherwise adds it to pending resources.
   * @param {!Resource} resource
   * @param {boolean=} checkForDupes
   * @param {boolean=} scheduleWhenBuilt
   * @private
   */
  buildOrScheduleBuildForResource_(resource, checkForDupes = false,
    scheduleWhenBuilt = true) {
    const buildingEnabled = (this.isRuntimeOn_ || this.isBuildOn_);

    // During prerender mode, don't build elements that aren't allowed to be
    // prerendered. This avoids wasting our prerender build quota.
    // See grantBuildPermission() for more details.
    const shouldBuildResource =
        this.viewer_.getVisibilityState() != VisibilityState.PRERENDER
        || resource.prerenderAllowed();

    if (buildingEnabled && shouldBuildResource) {
      if (this.documentReady_) {
        // Build resource immediately, the document has already been parsed.
        this.buildResourceUnsafe_(resource, scheduleWhenBuilt);
      } else if (!resource.isBuilt() && !resource.isBuilding()) {
        if (!checkForDupes || !this.pendingBuildResources_.includes(resource)) {
          // Otherwise add to pending resources and try to build any ready ones.
          this.pendingBuildResources_.push(resource);
          this.buildReadyResources_(scheduleWhenBuilt);
        }
      }
    }
  }

  /**
   * Builds resources that are ready to be built.
   * @param {boolean=} scheduleWhenBuilt
   * @private
   */
  buildReadyResources_(scheduleWhenBuilt = true) {
    // Avoid cases where elements add more elements inside of them
    // and cause an infinite loop of building - see #3354 for details.
    if (this.isCurrentlyBuildingPendingResources_) {
      return;
    }
    try {
      this.isCurrentlyBuildingPendingResources_ = true;
      this.buildReadyResourcesUnsafe_(scheduleWhenBuilt);
    } finally {
      this.isCurrentlyBuildingPendingResources_ = false;
    }
  }

  /**
   * @param {boolean=} scheduleWhenBuilt
   * @private
   */
  buildReadyResourcesUnsafe_(scheduleWhenBuilt = true) {
    // This will loop over all current pending resources and those that
    // get added by other resources build-cycle, this will make sure all
    // elements get a chance to be built.
    for (let i = 0; i < this.pendingBuildResources_.length; i++) {
      const resource = this.pendingBuildResources_[i];
      if (this.documentReady_ ||
          hasNextNodeInDocumentOrder(
              resource.element, this.ampdoc.getRootNode())) {
        // Remove resource before build to remove it from the pending list
        // in either case the build succeed or throws an error.
        this.pendingBuildResources_.splice(i--, 1);
        this.buildResourceUnsafe_(resource, scheduleWhenBuilt);
      }
    }
  }

  /**
   * @param {!Resource} resource
   * @param {boolean} schedulePass
   * @return {?Promise}
   * @private
   */
  buildResourceUnsafe_(resource, schedulePass) {
    const promise = resource.build();
    if (!promise || !schedulePass) {
      return promise;
    }
    return promise.then(() => this.schedulePass(), error => {
      // Build failed: remove the resource. No other state changes are
      // needed.
      this.removeResource_(resource);
      throw error;
    });
  }

  /**
   * Signals that an element has been removed to the DOM. Resources manager
   * will stop tracking it from this point on.
   * @param {!AmpElement} element
   */
  remove(element) {
    const resource = Resource.forElementOptional(element);
    if (!resource) {
      return;
    }
    this.removeResource_(resource);
  }

  /**
   * @param {!Resource} resource
   * @param {boolean=} opt_disconnect
   * @private
   */
  removeResource_(resource, opt_disconnect) {
    const index = this.resources_.indexOf(resource);
    if (index != -1) {
      this.resources_.splice(index, 1);
    }
    if (resource.isBuilt()) {
      resource.pauseOnRemove();
      if (opt_disconnect) {
        resource.disconnect();
      }
    }
    this.cleanupTasks_(resource, /* opt_removePending */ true);
    dev().fine(TAG_, 'element removed:', resource.debugid);
  }

  /**
   * Removes all resources belonging to the specified child window.
   * @param {!Window} childWin
   */
  removeForChildWindow(childWin) {
    const toRemove = this.resources_.filter(r => r.hostWin == childWin);
    toRemove.forEach(r => this.removeResource_(r, /* disconnect */ true));
  }

  /**
   * Signals that an element has been upgraded to the DOM. Resources manager
   * will perform build and enable layout/viewport signals for this element.
   * @param {!AmpElement} element
   */
  upgraded(element) {
    const resource = Resource.forElement(element);
    this.buildOrScheduleBuildForResource_(resource);
    dev().fine(TAG_, 'element upgraded:', resource.debugid);
  }

  /**
   * Assigns an owner for the specified element. This means that the resources
   * within this element will be managed by the owner and not Resources manager.
   * @param {!Element} element
   * @param {!AmpElement} owner
   * @package
   */
  setOwner(element, owner) {
    Resource.setOwner(element, owner);
  }

  /**
   * Requires the layout of the specified element or top-level sub-elements
   * within.
   * @param {!Element} element
   * @param {number=} opt_parentPriority
   * @return {!Promise}
   * @restricted
   */
  requireLayout(element, opt_parentPriority) {
    const promises = [];
    this.discoverResourcesForElement_(element, resource => {
      if (resource.getState() == ResourceState.LAYOUT_COMPLETE) {
        return;
      }
      if (resource.getState() != ResourceState.LAYOUT_SCHEDULED) {
        promises.push(resource.whenBuilt().then(() => {
          resource.measure();
          if (!resource.isDisplayed()) {
            return;
          }
          this.scheduleLayoutOrPreload_(
              resource,
              /* layout */ true,
              opt_parentPriority,
              /* forceOutsideViewport */ true);
          return resource.loadedOnce();
        }));
      } else if (resource.isDisplayed()) {
        promises.push(resource.loadedOnce());
      }
    });
    return Promise.all(promises);
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
        Resource.forElement(parentElement),
        /* layout */ true,
        elements_(subElements));
  }

  /**
   * Invokes `unload` on the elements' resource which in turn will invoke
   * the `documentBecameInactive` callback on the custom element.
   * Resources that call `schedulePause` must also call `scheduleResume`.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  schedulePause(parentElement, subElements) {
    const parentResource = Resource.forElement(parentElement);
    subElements = elements_(subElements);

    this.discoverResourcesForArray_(parentResource, subElements, resource => {
      resource.pause();
    });
  }

  /**
   * Invokes `resume` on the elements' resource which in turn will invoke
   * `resumeCallback` only on paused custom elements.
   * Resources that call `schedulePause` must also call `scheduleResume`.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  scheduleResume(parentElement, subElements) {
    const parentResource = Resource.forElement(parentElement);
    subElements = elements_(subElements);

    this.discoverResourcesForArray_(parentResource, subElements, resource => {
      resource.resume();
    });
  }

  /**
   * Schedules unlayout for specified sub-elements that are children of the
   * parent element. The parent element can choose to send this signal when
   * it want to unload resources for its children.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  scheduleUnlayout(parentElement, subElements) {
    const parentResource = Resource.forElement(parentElement);
    subElements = elements_(subElements);

    this.discoverResourcesForArray_(parentResource, subElements, resource => {
      resource.unlayout();
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
        Resource.forElement(parentElement),
        /* layout */ false,
        elements_(subElements));
  }

  /**
   * Updates the priority of the resource. If there are tasks currently
   * scheduled, their priority is updated as well.
   * @param {!Element} element
   * @param {number} newPriority
   * @restricted
   */
  updatePriority(element, newPriority) {
    const resource = Resource.forElement(element);

    resource.updatePriority(newPriority);

    // Update affected tasks
    this.queue_.forEach(task => {
      if (task.resource == resource) {
        task.priority = newPriority;
      }
    });

    this.schedulePass();
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
        Resource.forElement(parentElement),
        elements_(subElements),
        inLocalViewport);
  }

  /**
   * Requests the runtime to change the element's size. When the size is
   * successfully updated then the opt_callback is called.
   * @param {!Element} element
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {function()=} opt_callback A callback function.
   * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
   */
  changeSize(element, newHeight, newWidth, opt_callback, opt_newMargins) {
    this.scheduleChangeSize_(Resource.forElement(element), newHeight,
        newWidth, opt_newMargins, /* force */ true, opt_callback);
  }

  /**
   * Return a promise that requests the runtime to update the size of
   * this element to the specified value.
   * The runtime will schedule this request and attempt to process it
   * as soon as possible. However, unlike in {@link changeSize}, the runtime
   * may refuse to make a change in which case it will reject promise, call the
   * `overflowCallback` method on the target resource with the height value.
   * Overflow callback is expected to provide the reader with the user action
   * to update the height manually.
   * Note that the runtime does not call the `overflowCallback` method if the
   * requested height is 0 or negative.
   * If the height is successfully updated then the promise is resolved.
   * @param {!Element} element
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
   * @return {!Promise}
   */
  attemptChangeSize(element, newHeight, newWidth, opt_newMargins) {
    return new Promise((resolve, reject) => {
      this.scheduleChangeSize_(Resource.forElement(element), newHeight,
          newWidth, opt_newMargins, /* force */ false, success => {
            if (success) {
              resolve();
            } else {
              reject(new Error('changeSize attempt denied'));
            }
          });
    });
  }

  /**
   * Requests mutate callback to executed at the earliest possibility.
   * @param {!Element} element
   * @param {!Function} callback
   */
  deferMutate(element, callback) {
    this.scheduleDeferredMutate_(Resource.forElement(element), callback);
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

        // TODO(jridgewell): Mark parent layer as dirty, skip the rest of this.
        // Mark itself and children for re-measurement.
        if (element.classList.contains('i-amphtml-element')) {
          const r = Resource.forElement(element);
          r.requestMeasure();
        }
        const ampElements = element.getElementsByClassName('i-amphtml-element');
        for (let i = 0; i < ampElements.length; i++) {
          const r = Resource.forElement(ampElements[i]);
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
          this.maybeChangeHeight_ = true;
        });
      },
    });
  }

  /**
   * Return a promise that requests runtime to collapse this element.
   * The runtime will schedule this request and first attempt to resize
   * the element to height and width 0. If success runtime will set element
   * display to none, and notify element owner of this collapse.
   * @param {!Element} element
   * @return {!Promise}
   */
  attemptCollapse(element) {
    return new Promise((resolve, reject) => {
      this.scheduleChangeSize_(Resource.forElement(element), 0, 0, undefined,
          /* force */ false, success => {
            if (success) {
              const resource = Resource.forElement(element);
              resource.completeCollapse();
              resolve();
            } else {
              reject(new Error('collapse attempt denied'));
            }
          });
    });
  }

  /**
   * Collapses the element: ensures that it's `display:none`, notifies its
   * owner and updates the layout box.
   * @param {!Element} element
   */
  collapseElement(element) {
    const box = this.viewport_.getLayoutRect(element);
    const resource = Resource.forElement(element);
    if (box.width != 0 && box.height != 0) {
      // TODO setRelayoutTop_ is being deprecated.
      this.setRelayoutTop_(box.top);
    }
    resource.completeCollapse();
    this.schedulePass(FOUR_FRAME_DELAY_);
  }

  /**
   * Expands the element.
   * @param {!Element} element
   */
  expandElement(element) {
    const resource = Resource.forElement(element);
    resource.completeExpand();

    const owner = resource.getOwner();
    if (owner) {
      owner.expandedCallback(element);
    }

    this.schedulePass(FOUR_FRAME_DELAY_);
  }

  /**
   * Schedules the work pass at the latest with the specified delay.
   * @param {number=} opt_delay
   * @param {boolean=} opt_relayoutAll
   * @return {boolean}
   */
  schedulePass(opt_delay, opt_relayoutAll) {
    if (opt_relayoutAll) {
      this.relayoutAll_ = true;
    }
    return this.pass_.schedule(opt_delay);
  }

  /**
   * Schedules the work pass at the latest with the specified delay.
   */
  schedulePassVsync() {
    if (this.vsyncScheduled_) {
      return;
    }
    this.vsyncScheduled_ = true;
    this.vsync_.mutate(() => this.doPass());
  }

  /**
   * Called when main AMP binary is fully initialized.
   * May never be called in Shadow Mode.
   */
  ampInitComplete() {
    this.ampInitialized_ = true;
    this.schedulePass();
  }

  doPass() {
    if (!this.isRuntimeOn_) {
      dev().fine(TAG_, 'runtime is off');
      return;
    }

    this.visible_ = this.viewer_.isVisible();
    this.prerenderSize_ = this.viewer_.getPrerenderSize();

    const firstPassAfterDocumentReady =
        (this.documentReady_ && this.firstPassAfterDocumentReady_);
    if (firstPassAfterDocumentReady) {
      this.firstPassAfterDocumentReady_ = false;
      const doc = this.win.document;
      this.viewer_.sendMessage('documentLoaded', dict({
        'title': doc.title,
        'sourceUrl': getSourceUrl(this.ampdoc.getUrl()),
        'serverLayout': doc.documentElement.hasAttribute('i-amphtml-element'),
        'linkRels': Services.documentInfoForDoc(this.ampdoc).linkRels,
      }), /* cancelUnsent */true);

      this.contentHeight_ = this.viewport_.getContentHeight();
      this.viewer_.sendMessage('documentHeight',
          dict({'height': this.contentHeight_}), /* cancelUnsent */true);
      dev().fine(TAG_, 'document height on load: ' + this.contentHeight_);
    }

    const viewportSize = this.viewport_.getSize();
    dev().fine(TAG_,
        'PASS: visible=', this.visible_,
        ', relayoutAll=', this.relayoutAll_,
        ', relayoutTop=', this.relayoutTop_,
        ', viewportSize=', viewportSize.width, viewportSize.height,
        ', prerenderSize=', this.prerenderSize_);
    this.pass_.cancel();
    this.vsyncScheduled_ = false;

    this.visibilityStateMachine_.setState(this.viewer_.getVisibilityState());
    if (this.documentReady_ && this.ampInitialized_
        && !this.ampdoc.signals().get(READY_SCAN_SIGNAL_)) {
      // This signal mainly signifies that most of elements have been measured
      // by now. This is mostly used to avoid measuring too many elements
      // individually. This will be superceeded by layers API, e.g.
      // "layer measured".
      // May not be called in shadow mode.
      this.ampdoc.signals().signal(READY_SCAN_SIGNAL_);
    }

    if (this.maybeChangeHeight_) {
      this.maybeChangeHeight_ = false;
      this.vsync_.measure(() => {
        const measuredContentHeight = this.viewport_.getContentHeight();
        if (measuredContentHeight != this.contentHeight_) {
          this.viewer_.sendMessage('documentHeight',
              dict({'height': measuredContentHeight}), /* cancelUnsent */true);
          this.contentHeight_ = measuredContentHeight;
          dev().fine(TAG_, 'document height changed: ' + this.contentHeight_);
        }
      });
    }
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
    if (this.useLayers_) {
      this.mutateWorkViaLayers_();
    } else {
      this.mutateWorkViaResources_();
    }
  }

  /** @private */
  mutateWorkViaResources_() {
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
    const now = Date.now();
    const viewportRect = this.viewport_.getRect();
    const scrollHeight = this.viewport_.getScrollHeight();
    const topOffset = viewportRect.height / 10;
    const bottomOffset = viewportRect.height / 10;
    const maxDocBottomOffset = scrollHeight - DOC_BOTTOM_OFFSET_LIMIT_;
    const docBottomOffset = Math.max(scrollHeight * 0.85, maxDocBottomOffset);
    const isScrollingStopped = (Math.abs(this.lastVelocity_) < 1e-2 &&
        now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_ ||
        now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_ * 2);

    if (this.deferredMutates_.length > 0) {
      dev().fine(TAG_, 'deferred mutates:', this.deferredMutates_.length);
      const deferredMutates = this.deferredMutates_;
      this.deferredMutates_ = [];
      for (let i = 0; i < deferredMutates.length; i++) {
        deferredMutates[i]();
      }
      this.maybeChangeHeight_ = true;
    }

    // TODO(jridgewell, #12780): Update resize rules to account for layers.
    if (this.requestsChangeSize_.length > 0) {
      dev().fine(TAG_, 'change size requests:',
          this.requestsChangeSize_.length);
      const requestsChangeSize = this.requestsChangeSize_;
      this.requestsChangeSize_ = [];

      // Find minimum top position and run all mutates.
      let minTop = -1;
      const scrollAdjSet = [];
      let aboveVpHeightChange = 0;
      for (let i = 0; i < requestsChangeSize.length; i++) {
        const request = requestsChangeSize[i];
        /** @const {!Resource} */
        const resource = request.resource;
        const box = resource.getLayoutBox();
        const iniBox = resource.getInitialLayoutBox();

        let topMarginDiff = 0;
        let bottomMarginDiff = 0;
        let topUnchangedBoundary = box.top;
        let bottomDisplacedBoundary = box.bottom;
        let newMargins = undefined;
        if (request.marginChange) {
          newMargins = request.marginChange.newMargins;
          const margins = request.marginChange.currentMargins;
          if (newMargins.top != undefined) {
            topMarginDiff = newMargins.top - margins.top;
          }
          if (newMargins.bottom != undefined) {
            bottomMarginDiff = newMargins.bottom - margins.bottom;
          }
          if (topMarginDiff) {
            topUnchangedBoundary = box.top - margins.top;
          }
          if (bottomMarginDiff) {
            // The lowest boundary of the element that would appear to be
            // resized as a result of this size change. If the bottom margin is
            // being changed then it is the bottom edge of the margin box,
            // otherwise it is the bottom edge of the layout box as set above.
            bottomDisplacedBoundary = box.bottom + margins.bottom;
          }
        }
        const heightDiff = request.newHeight - box.height;

        // Check resize rules. It will either resize element immediately, or
        // wait until scrolling stops or will call the overflow callback.
        let resize = false;
        if (heightDiff == 0 && topMarginDiff == 0 && bottomMarginDiff == 0) {
          // 1. Nothing to resize.
        } else if (request.force || !this.visible_) {
          // 2. An immediate execution requested or the document is hidden.
          resize = true;
        } else if (this.activeHistory_.hasDescendantsOf(resource.element)) {
          // 3. Active elements are immediately resized. The assumption is that
          // the resize is triggered by the user action or soon after.
          resize = true;
        } else if (topUnchangedBoundary >= viewportRect.bottom - bottomOffset ||
            (topMarginDiff == 0 && box.bottom + Math.min(heightDiff, 0) >=
             viewportRect.bottom - bottomOffset)) {
          // 4. Elements under viewport are resized immediately, but only if
          // an element's boundary is not changed above the viewport after
          // resize.
          resize = true;
        } else if (viewportRect.top > 1 &&
            bottomDisplacedBoundary <= viewportRect.top + topOffset) {
          // 5. Elements above the viewport can only be resized if we are able
          // to compensate the height change by setting scrollTop and only if
          // the page has already been scrolled by some amount (1px due to iOS).
          // Otherwise the scrolling might move important things like the menu
          // bar out of the viewport at initial page load.
          if (heightDiff < 0 &&
              viewportRect.top + aboveVpHeightChange < -heightDiff) {
            // Do nothing if height abobe viewport height can't compensate
            // height decrease
            continue;
          }
          // Can only resized when scrollinghas stopped,
          // otherwise defer util next cycle.
          if (isScrollingStopped) {
            // These requests will be executed in the next animation cycle and
            // adjust the scroll position.
            aboveVpHeightChange = aboveVpHeightChange + heightDiff;
            scrollAdjSet.push(request);
          } else {
            // Defer till next cycle.
            this.requestsChangeSize_.push(request);
          }
          continue;
        } else if (iniBox.bottom >= docBottomOffset ||
                      box.bottom >= docBottomOffset) {
          // 6. Elements close to the bottom of the document (not viewport)
          // are resized immediately.
          resize = true;
        } else if (heightDiff < 0 || topMarginDiff < 0 ||
              bottomMarginDiff < 0) {
          // 7. The new height (or one of the margins) is smaller than the
          // current one.
        } else {
          // 8. Element is in viewport don't resize and try overflow callback
          // instead.
          request.resource.overflowCallback(/* overflown */ true,
              request.newHeight, request.newWidth, newMargins);
        }

        if (resize) {
          if (box.top >= 0) {
            minTop = minTop == -1 ? box.top : Math.min(minTop, box.top);
          }
          request.resource./*OK*/changeSize(
              request.newHeight, request.newWidth, newMargins);
          request.resource.overflowCallback(/* overflown */ false,
              request.newHeight, request.newWidth, newMargins);
          this.maybeChangeHeight_ = true;
        }

        if (request.callback) {
          request.callback(/* hasSizeChanged */resize);
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
                  request.newHeight, request.newWidth, request.marginChange ?
                    request.marginChange.newMargins : undefined);
              if (request.callback) {
                request.callback(/* hasSizeChanged */true);
              }
            });
            if (minTop != -1) {
              this.setRelayoutTop_(minTop);
            }
            // Sync is necessary here to avoid UI jump in the next frame.
            const newScrollHeight = this.viewport_./*OK*/getScrollHeight();
            if (newScrollHeight != state./*OK*/scrollHeight) {
              this.viewport_.setScrollTop(state./*OK*/scrollTop +
                  (newScrollHeight - state./*OK*/scrollHeight));
            }
            this.maybeChangeHeight_ = true;
          },
        }, {});
      }
    }
  }

  /**
   * TODO(jridgewell): This will be Layer's bread and butter for speed
   * optimizations.
   * @private
   */
  mutateWorkViaLayers_() {
    this.mutateWorkViaResources_();
  }

  /**
   * @param {number} relayoutTop
   * @private
   */
  setRelayoutTop_(relayoutTop) {
    if (this.useLayers_) {
      this.relayoutAll_ = true;
    } else if (this.relayoutTop_ == -1) {
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
    const resourceElement = closest(element,
        el => !!Resource.forElementOptional(el));
    if (!resourceElement) {
      return;
    }
    const resource = Resource.forElement(resourceElement);
    const pendingChangeSize = resource.getPendingChangeSize();
    if (pendingChangeSize !== undefined) {
      this.scheduleChangeSize_(resource, pendingChangeSize.height,
          pendingChangeSize.width, pendingChangeSize.margins,
          /* force */ true);
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

    const now = Date.now();

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
      if (r.getState() == ResourceState.NOT_BUILT && !r.isBuilding()) {
        this.buildOrScheduleBuildForResource_(r, /* checkForDupes */ true);
      }
      if (relayoutAll ||
              !r.hasBeenMeasured() ||
              r.getState() == ResourceState.NOT_LAID_OUT) {
        r.applySizesAndMediaQuery();
        relayoutCount++;
      }
      if (r.isMeasureRequested()) {
        remeasureCount++;
      }
    }

    // Phase 2: Remeasure if there were any relayouts. Unfortunately, currently
    // there's no way to optimize this. All reads happen here.
    let toUnload;
    if (relayoutCount > 0 || remeasureCount > 0 ||
            relayoutAll || relayoutTop != -1) {
      for (let i = 0; i < this.resources_.length; i++) {
        const r = this.resources_[i];
        if (r.hasOwner() && !r.isMeasureRequested()) {
          // If element has owner, and measure is not requested, do nothing.
          continue;
        }
        if (relayoutAll ||
                r.getState() == ResourceState.NOT_LAID_OUT ||
                !r.hasBeenMeasured() ||
                r.isMeasureRequested() ||
                relayoutTop != -1 && r.getLayoutBox().bottom >= relayoutTop) {
          const wasDisplayed = r.isDisplayed();
          r.measure();
          if (wasDisplayed && !r.isDisplayed()) {
            if (!toUnload) {
              toUnload = [];
            }
            toUnload.push(r);
          }
        }
      }
    }

    // Unload all in one cycle.
    if (toUnload) {
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

    // Phase 3: Trigger "viewport enter/exit" events.
    for (let i = 0; i < this.resources_.length; i++) {
      const r = this.resources_[i];
      if (r.getState() == ResourceState.NOT_BUILT || r.hasOwner()) {
        continue;
      }
      // Note that when the document is not visible, neither are any of its
      // elements to reduce CPU cycles.
      // TODO(dvoytenko, #3434): Reimplement the use of `isFixed` with
      // layers. This is currently a short-term fix to the problem that
      // the fixed elements get incorrect top coord.
      const shouldBeInViewport = (this.visible_ && r.isDisplayed() &&
          r.overlaps(visibleRect));
      r.setInViewport(shouldBeInViewport);
    }

    // Phase 4: Schedule elements for layout within a reasonable distance from
    // current viewport.
    if (loadRect) {
      for (let i = 0; i < this.resources_.length; i++) {
        const r = this.resources_[i];
        if (r.getState() != ResourceState.READY_FOR_LAYOUT || r.hasOwner()) {
          continue;
        }
        // TODO(dvoytenko, #3434): Reimplement the use of `isFixed` with
        // layers. This is currently a short-term fix to the problem that
        // the fixed elements get incorrect top coord.
        if (r.isDisplayed() && r.overlaps(loadRect)) {
          this.scheduleLayoutOrPreload_(r, /* layout */ true);
        }
      }
    }

    if (this.visible_ &&
          this.exec_.getSize() == 0 &&
          this.queue_.getSize() == 0 &&
          now > this.exec_.getLastDequeueTime() + 5000) {
      // Phase 5: Idle Render Outside Viewport layout: layout up to 4 items
      // with idleRenderOutsideViewport true
      let idleScheduledCount = 0;
      for (let i = 0; i < this.resources_.length && idleScheduledCount < 4;
        i++) {
        const r = this.resources_[i];
        if (r.getState() == ResourceState.READY_FOR_LAYOUT &&
            !r.hasOwner() && r.isDisplayed() && r.idleRenderOutsideViewport()) {
          dev().fine(TAG_, 'idleRenderOutsideViewport layout:', r.debugid);
          this.scheduleLayoutOrPreload_(r, /* layout */ false);
          idleScheduledCount++;
        }
      }
      // Phase 6: Idle layout: layout more if we are otherwise not doing much.
      // TODO(dvoytenko): document/estimate IDLE timeouts and other constants
      for (let i = 0; i < this.resources_.length && idleScheduledCount < 4;
        i++) {
        const r = this.resources_[i];
        if (r.getState() == ResourceState.READY_FOR_LAYOUT &&
            !r.hasOwner() && r.isDisplayed()) {
          dev().fine(TAG_, 'idle layout:', r.debugid);
          this.scheduleLayoutOrPreload_(r, /* layout */ false);
          idleScheduledCount++;
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
    const now = Date.now();

    let timeout = -1;
    const state = Object.create(null);
    let task = this.queue_.peek(this.boundTaskScorer_, state);
    while (task) {
      timeout = this.calcTaskTimeout_(task);
      dev().fine(TAG_, 'peek from queue:', task.id,
          'sched at', task.scheduleTime,
          'score', this.boundTaskScorer_(task, state),
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
        task.resource.measure();
        if (this.isLayoutAllowed_(
            task.resource, task.forceOutsideViewport)) {
          task.promise = task.callback();
          task.startTime = now;
          dev().fine(TAG_, 'exec:', task.id, 'at', task.startTime);
          this.exec_.enqueue(task);
          task.promise.then(this.taskComplete_.bind(this, task, true),
              this.taskComplete_.bind(this, task, false))
              .catch(/** @type {function (*)} */ (reportError));
        } else {
          dev().fine(TAG_, 'cancelled', task.id);
          task.resource.layoutCanceled();
        }
      }

      task = this.queue_.peek(this.boundTaskScorer_, state);
      timeout = -1;
    }

    dev().fine(TAG_, 'queue size:', this.queue_.getSize());
    dev().fine(TAG_, 'exec size:', this.exec_.getSize());

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
   * @param {!./task-queue.TaskDef} task
   * @param {!Object<string, *>} unusedCache
   * @return {number}
   * @private
   */
  calcTaskScore_(task, unusedCache) {
    // TODO(jridgewell): these should be taking into account the active
    // scroller, which may not be the root scroller. Maybe a weighted average
    // of "scroller scrolls necessary" to see the element.
    // Demo at https://output.jsbin.com/hicigom/quiet
    const viewport = this.viewport_.getRect();
    const box = task.resource.getLayoutBox();
    let posPriority = Math.floor((box.top - viewport.top) / viewport.height);
    if (Math.sign(posPriority) != this.getScrollDirection()) {
      posPriority *= 2;
    }
    posPriority = Math.abs(posPriority);
    return task.priority * PRIORITY_BASE_ + posPriority;
  }

  /**
   * Calculates the task's score using the Layers service. A task with the
   * lowest score will be dequeued from the queue the first.
   *
   * Refer to {@link calcTaskScore_} for basic explanation.
   *
   * Viewport priority is a function of the distance of the element from the
   * currently visible viewports. The elements in the visible viewport get
   * higher priority and further away from the viewport get lower priority.
   *
   * @param {!./task-queue.TaskDef} task
   * @param {!Object<string, *>} cache
   * @return {number}
   * @private
   */
  calcTaskScoreLayers_(task, cache) {
    const layerScore = this.layers_.iterateAncestry(task.resource.element,
        this.boundCalcLayoutScore_, cache);
    return task.priority * PRIORITY_BASE_ + layerScore;
  }

  /**
   * Calculates the layout's distance from viewport score, using an iterative
   * (and cacheable) calculation based on tree depth and distance.
   *
   * @param {number} currentScore
   * @param {!./layers-impl.LayoutElement} layout
   * @param {number} depth
   * @param {!Object<string, *>} cache
   * @return {number}
   */
  calcLayoutScore_(currentScore, layout, depth, cache) {
    const id = layout.getId();
    if (hasOwn(cache, id)) {
      return dev().assertNumber(cache[id]);
    }

    const score = currentScore || 0;
    const depthPenalty = 1 + (depth / 10);
    const nonActivePenalty = layout.isActiveUnsafe() ? 1 : 2;
    const distance = layout.getHorizontalDistanceFromParent() +
        layout.getVerticalDistanceFromParent();
    return cache[id] = score + nonActivePenalty * depthPenalty * distance;
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
   * @param {!./task-queue.TaskDef} task
   * @private
   */
  calcTaskTimeout_(task) {
    const now = Date.now();

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
   * @param {!./task-queue.TaskDef} task
   * @private
   */
  reschedule_(task) {
    if (!this.queue_.getTaskById(task.id)) {
      this.queue_.enqueue(task);
    }
  }

  /**
   * @param {!./task-queue.TaskDef} task
   * @param {boolean} success
   * @param {*=} opt_reason
   * @return {!Promise|undefined}
   * @private
   */
  taskComplete_(task, success, opt_reason) {
    this.exec_.dequeue(task);
    this.schedulePass(POST_TASK_PASS_DELAY_);
    if (!success) {
      dev().info(TAG_, 'task failed:',
          task.id, task.resource.debugid, opt_reason);
      return Promise.reject(opt_reason);
    }
  }

  /**
   * Schedules change of the element's height.
   * @param {!Resource} resource
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef|undefined} newMargins
   * @param {boolean} force
   * @param {function(boolean)=} opt_callback A callback function
   * @private
   */
  scheduleChangeSize_(resource, newHeight, newWidth, newMargins, force,
    opt_callback) {
    if (resource.hasBeenMeasured() && !newMargins) {
      this.completeScheduleChangeSize_(resource, newHeight, newWidth,
          undefined, force, opt_callback);
    } else {
      // This is a rare case since most of times the element itself schedules
      // resize requests. However, this case is possible when another element
      // requests resize of a controlled element. This also happens when a
      // margin size change is requested, since existing margins have to be
      // measured in this instance.
      this.vsync_.measure(() => {
        if (!resource.hasBeenMeasured()) {
          resource.measure();
        }
        const marginChange = newMargins ? {
          newMargins,
          currentMargins: this.getLayoutMargins_(resource),
        } : undefined;
        this.completeScheduleChangeSize_(resource, newHeight, newWidth,
            marginChange, force, opt_callback);
      });
    }
  }

  /**
   * Returns the layout margins for the resource.
   * @param {!Resource} resource
   * @return {!../layout-rect.LayoutMarginsDef}
   * @private
   */
  getLayoutMargins_(resource) {
    const style = computedStyle(this.win, resource.element);
    return {
      top: parseInt(style.marginTop, 10) || 0,
      right: parseInt(style.marginRight, 10) || 0,
      bottom: parseInt(style.marginBottom, 10) || 0,
      left: parseInt(style.marginLeft, 10) || 0,
    };
  }

  /**
   * @param {!Resource} resource
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!MarginChangeDef|undefined} marginChange
   * @param {boolean} force
   * @param {function(boolean)=} opt_callback A callback function
   * @private
   */
  completeScheduleChangeSize_(resource, newHeight, newWidth, marginChange,
    force, opt_callback) {
    resource.resetPendingChangeSize();
    const layoutBox = resource.getPageLayoutBox();
    if ((newHeight === undefined || newHeight == layoutBox.height) &&
        (newWidth === undefined || newWidth == layoutBox.width) &&
        (marginChange === undefined || !areMarginsChanged(
            marginChange.currentMargins, marginChange.newMargins))) {
      if (newHeight === undefined && newWidth === undefined &&
          marginChange === undefined) {
        dev().error(
            TAG_, 'attempting to change size with undefined dimensions',
            resource.debugid);
      }
      // Nothing to do.
      if (opt_callback) {
        opt_callback(/* success */ true);
      }
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
      request.marginChange = marginChange;
      request.force = force || request.force;
      request.callback = opt_callback;
    } else {
      this.requestsChangeSize_.push(/** {!ChangeSizeRequestDef} */{
        resource,
        newHeight,
        newWidth,
        marginChange,
        force,
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
   * Returns whether the resource should be preloaded at this time.
   * The element must be measured by this time.
   * @param {!Resource} resource
   * @param {boolean} forceOutsideViewport
   * @return {boolean}
   * @private
   */
  isLayoutAllowed_(resource, forceOutsideViewport) {
    // Only built and displayed elements can be loaded.
    if (resource.getState() == ResourceState.NOT_BUILT ||
        !resource.isDisplayed()) {
      return false;
    }

    // Don't schedule elements when we're not visible, or in prerender mode
    // (and they can't prerender).
    if (!this.visible_) {
      if (this.viewer_.getVisibilityState() != VisibilityState.PRERENDER ||
          !resource.prerenderAllowed()) {
        return false;
      }
    }

    // The element has to be in its rendering corridor.
    if (!forceOutsideViewport &&
        !resource.isInViewport() &&
        !resource.renderOutsideViewport() &&
        !resource.idleRenderOutsideViewport()) {
      return false;
    }

    return true;
  }

  /**
   * Schedules layout or preload for the specified resource.
   * @param {!Resource} resource
   * @param {boolean} layout
   * @param {number=} opt_parentPriority
   * @param {boolean=} opt_forceOutsideViewport
   * @private
   */
  scheduleLayoutOrPreload_(resource, layout, opt_parentPriority,
    opt_forceOutsideViewport) {
    dev().assert(resource.getState() != ResourceState.NOT_BUILT &&
        resource.isDisplayed(),
    'Not ready for layout: %s (%s)',
    resource.debugid, resource.getState());
    const forceOutsideViewport = opt_forceOutsideViewport || false;
    if (!this.isLayoutAllowed_(resource, forceOutsideViewport)) {
      return;
    }

    if (layout) {
      this.schedule_(resource,
          LAYOUT_TASK_ID_, LAYOUT_TASK_OFFSET_,
          opt_parentPriority || 0,
          forceOutsideViewport,
          resource.startLayout.bind(resource));
    } else {
      this.schedule_(resource,
          PRELOAD_TASK_ID_, PRELOAD_TASK_OFFSET_,
          opt_parentPriority || 0,
          forceOutsideViewport,
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
    this.discoverResourcesForArray_(parentResource, subElements, resource => {
      if (resource.getState() == ResourceState.NOT_BUILT) {
        resource.whenBuilt().then(() => {
          this.measureAndScheduleIfAllowed_(resource, layout,
              parentResource.getPriority());
        });
      } else {
        this.measureAndScheduleIfAllowed_(resource, layout,
            parentResource.getPriority());
      }
    });
  }

  /**
   * @param {!Resource} resource
   * @param {boolean} layout
   * @param {number} parentPriority
   * @private
   */
  measureAndScheduleIfAllowed_(resource, layout, parentPriority) {
    resource.measure();
    if (resource.getState() == ResourceState.READY_FOR_LAYOUT &&
        resource.isDisplayed()) {
      this.scheduleLayoutOrPreload_(resource, layout, parentPriority);
    }
  }

  /**
   * Schedules a task.
   * @param {!Resource} resource
   * @param {string} localId
   * @param {number} priorityOffset
   * @param {number} parentPriority
   * @param {boolean} forceOutsideViewport
   * @param {function():!Promise} callback
   * @private
   */
  schedule_(
    resource,
    localId,
    priorityOffset,
    parentPriority,
    forceOutsideViewport,
    callback) {
    const taskId = resource.getTaskId(localId);

    const task = {
      id: taskId,
      resource,
      priority: Math.max(resource.getPriority(), parentPriority) +
          priorityOffset,
      forceOutsideViewport,
      callback,
      scheduleTime: Date.now(),
      startTime: 0,
      promise: null,
    };
    dev().fine(TAG_, 'schedule:', task.id, 'at', task.scheduleTime);

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
    task.resource.layoutScheduled(task.scheduleTime);
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
      dev().assert(parentResource.element.contains(element));
      this.discoverResourcesForElement_(element, callback);
    });
  }

  /**
   * @param {!Element} element
   * @param {function(!Resource)} callback
   */
  discoverResourcesForElement_(element, callback) {
    // Breadth-first search.
    if (element.classList.contains('i-amphtml-element')) {
      callback(Resource.forElement(element));
      // Also schedule amp-element that is a placeholder for the element.
      const placeholder = element.getPlaceholder();
      if (placeholder) {
        this.discoverResourcesForElement_(placeholder, callback);
      }
    } else {
      const ampElements = element.getElementsByClassName('i-amphtml-element');
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
          callback(Resource.forElement(ampElement));
        }
      }
    }
  }

  /**
   * Calls iterator on each sub-resource
   * @param {!FiniteStateMachine<!VisibilityState>} vsm
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
          if (this.schedulePass(delay)) {
            dev().fine(TAG_, 'next pass:', delay);
          } else {
            dev().fine(TAG_, 'pass already scheduled');
          }
        } else {
          dev().fine(TAG_, 'document is not visible: no scheduling');
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

    vsm.addTransition(inactive, visible, resume);
    vsm.addTransition(inactive, hidden, resume);
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
   * @param {Resource} resource
   * @param {boolean=} opt_removePending Whether to remove from pending
   *     build resources.
   * @private
   */
  cleanupTasks_(resource, opt_removePending) {
    if (resource.getState() == ResourceState.NOT_LAID_OUT) {
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
      filterSplice(this.requestsChangeSize_, request => {
        return request.resource != resource;
      });
    }

    if (resource.getState() == ResourceState.NOT_BUILT && opt_removePending &&
        this.pendingBuildResources_) {
      const pendingIndex = this.pendingBuildResources_.indexOf(resource);
      if (pendingIndex != -1) {
        this.pendingBuildResources_.splice(pendingIndex, 1);
      }
    }
  }
}


/**
 * @param {!Element|!Array<!Element>} elements
 * @return {!Array<!Element>}
 */
function elements_(elements) {
  return /** @type {!Array<!Element>} */ (
    isArray(elements) ? elements : [elements]);
}



/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   height: (number|undefined),
 *   width: (number|undefined),
 *   margins: (!../layout-rect.LayoutMarginsChangeDef|undefined)
 * }}
 */
export let SizeDef;

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installResourcesServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'resources', Resources);
};
