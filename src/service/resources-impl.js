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

import {Deferred} from '../utils/promise';
import {FiniteStateMachine} from '../finite-state-machine';
import {FocusHistory} from '../focus-history';
import {Pass} from '../pass';
import {READY_SCAN_SIGNAL, ResourcesInterface} from './resources-interface';
import {Resource, ResourceState} from './resource';
import {Services} from '../services';
import {TaskQueue} from './task-queue';
import {VisibilityState} from '../visibility-state';
import {dev, devAssert} from '../log';
import {dict} from '../utils/object';
import {expandLayoutRect} from '../layout-rect';
import {getMode} from '../mode';
import {getSourceUrl} from '../url';
import {hasNextNodeInDocumentOrder, isIframed} from '../dom';
import {ieIntrinsicCheckAndFix} from './ie-intrinsic-bug';
import {ieMediaCheckAndFix} from './ie-media-bug';
import {isBlockedByConsent, reportError} from '../error';
import {isExperimentOn} from '../experiments';
import {listen, loadPromise} from '../event-helper';
import {registerServiceBuilderForDoc} from '../service';
import {remove} from '../utils/array';
import {startupChunk} from '../chunk';
import {throttle} from '../utils/rate-limit';

const TAG_ = 'Resources';
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
const MAX_BUILD_CHUNK_SIZE = 10;

/**
 * @implements {ResourcesInterface}
 */
export class ResourcesImpl {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @const @private {!./viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private {boolean} */
    this.isRuntimeOn_ = this.viewer_.isRuntimeOn();

    /**
     * Used primarily for testing to allow build phase to proceed.
     * @const @private {boolean}
     */
    this.isBuildOn_ = false;

    /** @private {number} */
    this.resourceIdCounter_ = 0;

    /** @private @const {!Array<!Resource>} */
    this.resources_ = [];

    /** @private {number} */
    this.addCount_ = 0;

    /** @private {number} */
    this.buildAttemptsCount_ = 0;

    /** @private {number} */
    this.buildsThisPass_ = 0;

    /** @private {boolean} */
    this.visible_ = this.ampdoc.isVisible();

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
      // With IntersectionObserver, "remeasuring" hack no longer needed.
      devAssert(!this.intersectionObserver_);

      this.relayoutAll_ = true;
      this.schedulePass();
    });

    /** @const {!TaskQueue} */
    this.exec_ = new TaskQueue();

    /** @const {!TaskQueue} */
    this.queue_ = new TaskQueue();

    /** @const {!function(./task-queue.TaskDef):number} */
    this.boundTaskScorer_ = this.calcTaskScore_.bind(this);

    /**
     * @private {!Array<!./resources-interface.ChangeSizeRequestDef>}
     */
    this.requestsChangeSize_ = [];

    /** @private {?Array<!Resource>} */
    this.pendingBuildResources_ = [];

    /** @private {boolean} */
    this.isCurrentlyBuildingPendingResources_ = false;

    /** @private @const {!./viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

    /** @private @const {!./vsync-impl.Vsync} */
    this.vsync_ = Services./*OK*/ vsyncFor(this.win);

    /** @private @const {!FocusHistory} */
    this.activeHistory_ = new FocusHistory(this.win, FOCUS_HISTORY_TIMEOUT_);

    /** @private {boolean} */
    this.vsyncScheduled_ = false;

    /** @private {number} */
    this.contentHeight_ = 0;

    /** @private {boolean} */
    this.maybeChangeHeight_ = false;

    /** @const @private {!Array<function()>} */
    this.passCallbacks_ = [];

    /** @const @private {!Array<!Element>} */
    this.elementsThatScrolled_ = [];

    /** @const @private {boolean} */
    this.onlyBuildWhenCloseToViewport_ = isExperimentOn(
      this.win,
      'build-close-to-viewport'
    );

    /** @const @private {boolean} */
    this.buildInChunks_ = isExperimentOn(this.win, 'build-in-chunks');

    /** @const @private {boolean} */
    this.removeTaskTimeout_ = isExperimentOn(this.win, 'remove-task-timeout');

    /** @const @private {!Deferred} */
    this.firstPassDone_ = new Deferred();

    /** @private @const {!FiniteStateMachine<!VisibilityState>} */
    this.visibilityStateMachine_ = new FiniteStateMachine(
      this.ampdoc.getVisibilityState()
    );

    /**
     * Number of resources that were laid out after entering viewport.
     * @private {number}
     */
    this.slowLayoutCount_ = 0;

    /**
     * Total number of laid out resources.
     * @private {number}
     */
    this.totalLayoutCount_ = 0;

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    /**
     * True if the callback for intersectionObserver_ has fired at least once.
     * @private {boolean}
     */
    this.intersectionObserverCallbackFired_ = false;

    if (isExperimentOn(this.win, 'intersect-resources')) {
      const iframed = isIframed(this.win);

      // Classic IntersectionObserver doesn't support viewport tracking and
      // rootMargin in x-origin iframes (#25428). As of 1/2020, only Chrome 81+
      // supports it via {root: document}, which throws on other browsers.
      const root = /** @type {?Element} */ (this.ampdoc.isSingleDoc() && iframed
        ? /** @type {*} */ (this.win.document)
        : null);
      try {
        this.intersectionObserver_ = new IntersectionObserver(
          (e) => this.intersect(e),
          // rootMargin matches size of loadRect: (150vw 300vh) * 1.25.
          {root, rootMargin: '250% 31.25%'}
        );

        // Wait for intersection callback instead of measuring all elements
        // during the first pass.
        this.relayoutAll_ = false;
      } catch (e) {
        dev().warn(TAG_, 'Falling back to classic Resources:', e);
      }
    }

    // When user scrolling stops, run pass to check newly in-viewport elements.
    // When viewport is resized, we have to re-measure everything.
    this.viewport_.onChanged((event) => {
      this.lastScrollTime_ = Date.now();
      this.lastVelocity_ = event.velocity;
      if (event.relayoutAll) {
        this.relayoutAll_ = true;
        this.maybeChangeHeight_ = true;
      }

      // With IntersectionObserver, we only need to handle viewport resize.
      if (this.relayoutAll_ || !this.intersectionObserver_) {
        this.schedulePass();
      }
      // Unfortunately, a viewport size change invalidates all premeasurements.
      if (this.relayoutAll_ && this.intersectionObserver_) {
        this.resources_.forEach((resource) =>
          resource.invalidatePremeasurement()
        );
      }
    });
    this.viewport_.onScroll(() => {
      this.lastScrollTime_ = Date.now();
    });

    // When document becomes visible, e.g. from "prerender" mode, do a
    // simple pass.
    this.ampdoc.onVisibilityChanged(() => {
      if (this.firstVisibleTime_ == -1 && this.ampdoc.isVisible()) {
        this.firstVisibleTime_ = Date.now();
      }
      this.schedulePass();
    });

    this.viewer_.onRuntimeState((state) => {
      dev().fine(TAG_, 'Runtime state:', state);
      this.isRuntimeOn_ = state;
      this.schedulePass(1);
    });

    // Schedule initial passes. This must happen in a startup task
    // to avoid blocking body visible.
    startupChunk(this.ampdoc, () => {
      this.setupVisibilityStateMachine_(this.visibilityStateMachine_);
      this.schedulePass(0);
    });

    this.rebuildDomWhenReady_();

    if (!this.intersectionObserver_) {
      /** @private @const */
      this.throttledScroll_ = throttle(this.win, (e) => this.scrolled_(e), 250);

      listen(this.win.document, 'scroll', this.throttledScroll_, {
        capture: true,
        passive: true,
      });
    }
  }

  /** @override */
  isIntersectionExperimentOn() {
    return !!this.intersectionObserver_;
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @visibleForTesting
   */
  intersect(entries) {
    devAssert(this.intersectionObserver_);

    if (getMode().localDev) {
      const inside = [];
      const outside = [];
      entries.forEach((e) => {
        const r = Resource.forElement(e.target);
        (e.isIntersecting ? inside : outside).push({e, id: r.debugid});
      });
      dev().fine(TAG_, 'intersection', inside, outside);
    }

    this.intersectionObserverCallbackFired_ = true;

    entries.forEach((entry) => {
      const {boundingClientRect, target} = entry;

      const r = Resource.forElement(target);
      // Strangely, JSC is missing x/y from typedefs of boundingClientRect
      // despite it being a DOMRectReadOnly (ClientRect) by spec.
      r.premeasure(/** @type {!ClientRect} */ (boundingClientRect));
    });

    this.schedulePass();
  }

  /** @private */
  rebuildDomWhenReady_() {
    // Ensure that we attempt to rebuild things when DOM is ready.
    this.ampdoc.whenReady().then(() => {
      this.documentReady_ = true;
      this.buildReadyResources_();
      this.pendingBuildResources_ = null;

      const input = Services.inputFor(this.win);
      input.setupInputModeClasses(this.ampdoc);

      if (IS_ESM) {
        return;
      }

      ieIntrinsicCheckAndFix(this.win);

      // With IntersectionObserver, no need for remeasuring hacks.
      if (!this.intersectionObserver_) {
        const fixPromise = ieMediaCheckAndFix(this.win);
        const remeasure = () => this.remeasurePass_.schedule();
        if (fixPromise) {
          fixPromise.then(remeasure);
        } else {
          // No promise means that there's no problem.
          remeasure();
        }

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
        if (
          this.win.document.fonts &&
          this.win.document.fonts.status != 'loaded'
        ) {
          this.win.document.fonts.ready.then(remeasure);
        }
      }
    });
  }

  /** @override */
  get() {
    return this.resources_.slice(0);
  }

  /** @override */
  getAmpdoc() {
    return this.ampdoc;
  }

  /** @override */
  getResourceForElement(element) {
    return Resource.forElement(element);
  }

  /** @override */
  getResourceForElementOptional(element) {
    return Resource.forElementOptional(element);
  }

  /** @override */
  getScrollDirection() {
    return Math.sign(this.lastVelocity_) || 1;
  }

  /** @override */
  add(element) {
    // Ensure the viewport is ready to accept the first element.
    this.addCount_++;
    if (this.addCount_ == 1) {
      this.viewport_.ensureReadyForElements();
    }

    // First check if the resource is being reparented and if it requires
    // reconstruction. Only already built elements are eligible.
    let resource = Resource.forElementOptional(element);
    if (
      resource &&
      resource.getState() != ResourceState.NOT_BUILT &&
      !element.reconstructWhenReparented()
    ) {
      resource.requestMeasure();
      dev().fine(TAG_, 'resource reused:', resource.debugid);
    } else {
      // Create and add a new resource.
      resource = new Resource(++this.resourceIdCounter_, element, this);
      dev().fine(TAG_, 'resource added:', resource.debugid);
    }
    this.resources_.push(resource);

    if (this.intersectionObserver_) {
      // The observer callback will schedule a pass to process this element.
      this.intersectionObserver_.observe(element);
    } else {
      this.remeasurePass_.schedule(1000);
    }
  }

  /**
   * Limits the number of elements being build in pre-render phase to
   * a finite number. Returns false if the number has been reached.
   * @return {boolean}
   */
  isUnderBuildQuota_() {
    if (this.buildInChunks_ && this.buildsThisPass_ >= MAX_BUILD_CHUNK_SIZE) {
      return false;
    }
    // For pre-render we want to limit the amount of CPU used, so we limit
    // the number of elements build. For pre-render to "seem complete"
    // we only need to build elements in the first viewport. We can't know
    // which are actually in the viewport (because the decision is pre-layout,
    // so we use a heuristic instead.
    // Most documents have 10 or less AMP tags. By building 20 we should not
    // change the behavior for the vast majority of docs, and almost always
    // catch everything in the first viewport.
    return this.buildAttemptsCount_ < 20 || this.ampdoc.hasBeenVisible();
  }

  /**
   * Builds the element if ready to be built, otherwise adds it to pending
   * resources.
   * @param {!Resource} resource
   * @param {boolean=} checkForDupes
   * @param {boolean=} ignoreQuota
   * @private
   */
  buildOrScheduleBuildForResource_(
    resource,
    checkForDupes = false,
    ignoreQuota = false
  ) {
    const buildingEnabled = this.isRuntimeOn_ || this.isBuildOn_;
    if (!buildingEnabled) {
      return;
    }

    // During prerender mode, don't build elements that aren't allowed to be
    // prerendered. This avoids wasting our prerender build quota.
    // See isUnderBuildQuota_() for more details.
    const shouldBuildResource =
      this.ampdoc.getVisibilityState() != VisibilityState.PRERENDER ||
      resource.prerenderAllowed();
    if (!shouldBuildResource) {
      return;
    }

    if (this.onlyBuildWhenCloseToViewport_) {
      const isCloseEnoughToViewport =
        ignoreQuota ||
        resource.isBuildRenderBlocking() ||
        resource.renderOutsideViewport() ||
        (this.isIdle_() && resource.idleRenderOutsideViewport());
      if (!isCloseEnoughToViewport) {
        return;
      }
    }

    if (this.documentReady_) {
      // Build resource immediately, the document has already been parsed.
      this.buildResourceUnsafe_(resource, ignoreQuota);
    } else if (!resource.isBuilt() && !resource.isBuilding()) {
      if (!checkForDupes || !this.pendingBuildResources_.includes(resource)) {
        // Otherwise add to pending resources and try to build any ready ones.
        this.pendingBuildResources_.push(resource);
        this.buildReadyResources_();
      }
    }
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

  /**
   * @private
   */
  buildReadyResourcesUnsafe_() {
    // This will loop over all current pending resources and those that
    // get added by other resources build-cycle, this will make sure all
    // elements get a chance to be built.
    for (let i = 0; i < this.pendingBuildResources_.length; i++) {
      const resource = this.pendingBuildResources_[i];
      if (
        this.documentReady_ ||
        hasNextNodeInDocumentOrder(resource.element, this.ampdoc.getRootNode())
      ) {
        // Remove resource before build to remove it from the pending list
        // in either case the build succeed or throws an error.
        this.pendingBuildResources_.splice(i--, 1);
        this.buildResourceUnsafe_(resource);
      }
    }
  }

  /**
   * @param {!Resource} resource
   * @param {boolean=} ignoreQuota
   * @return {?Promise}
   * @private
   */
  buildResourceUnsafe_(resource, ignoreQuota = false) {
    if (
      !ignoreQuota &&
      !this.isUnderBuildQuota_() &&
      // Special case: amp-experiment is allowed to bypass prerender build quota.
      !resource.isBuildRenderBlocking()
    ) {
      return null;
    }

    const promise = resource.build();
    if (!promise) {
      return null;
    }
    dev().fine(TAG_, 'build resource:', resource.debugid);
    this.buildAttemptsCount_++;
    this.buildsThisPass_++;
    return promise.then(
      () => this.schedulePass(),
      (error) => {
        // Build failed: remove the resource. No other state changes are
        // needed.
        this.removeResource_(resource);
        if (!isBlockedByConsent(error)) {
          throw error;
        }
      }
    );
  }

  /** @override */
  remove(element) {
    const resource = Resource.forElementOptional(element);
    if (!resource) {
      return;
    }
    this.removeResource_(resource);
  }

  /**
   * @param {!Resource} resource
   * @private
   */
  removeResource_(resource) {
    const index = this.resources_.indexOf(resource);
    if (index != -1) {
      this.resources_.splice(index, 1);
    }
    if (resource.isBuilt()) {
      resource.pauseOnRemove();
    }
    if (this.intersectionObserver_) {
      // TODO(willchou): Fix observe/unobserve/remeasure churn in reparenting.
      this.intersectionObserver_.unobserve(resource.element);
    }
    this.cleanupTasks_(resource, /* opt_removePending */ true);
    dev().fine(TAG_, 'resource removed:', resource.debugid);
  }

  /** @override */
  upgraded(element) {
    const resource = Resource.forElement(element);
    this.buildOrScheduleBuildForResource_(resource);
    dev().fine(TAG_, 'resource upgraded:', resource.debugid);
  }

  /** @override */
  updateLayoutPriority(element, newLayoutPriority) {
    const resource = Resource.forElement(element);

    resource.updateLayoutPriority(newLayoutPriority);

    // Update affected tasks
    this.queue_.forEach((task) => {
      if (task.resource == resource) {
        task.priority = newLayoutPriority;
      }
    });

    this.schedulePass();
  }

  /** @override */
  schedulePass(opt_delay) {
    return this.pass_.schedule(opt_delay);
  }

  /** @override */
  updateOrEnqueueMutateTask(resource, newRequest) {
    let request = null;
    for (let i = 0; i < this.requestsChangeSize_.length; i++) {
      if (this.requestsChangeSize_[i].resource == resource) {
        request = this.requestsChangeSize_[i];
        break;
      }
    }
    if (request) {
      request.newHeight = newRequest.newHeight;
      request.newWidth = newRequest.newWidth;
      request.marginChange = newRequest.marginChange;
      request.event = newRequest.event;
      request.force = newRequest.force || request.force;
      request.callback = newRequest.callback;
    } else {
      this.requestsChangeSize_.push(newRequest);
    }
  }

  /** @override */
  schedulePassVsync() {
    if (this.vsyncScheduled_) {
      return;
    }
    this.vsyncScheduled_ = true;
    this.vsync_.mutate(() => this.doPass());
  }

  /** @override */
  ampInitComplete() {
    this.ampInitialized_ = true;
    dev().fine(TAG_, 'ampInitComplete');
    this.schedulePass();
  }

  /** @override */
  setRelayoutTop(relayoutTop) {
    if (this.relayoutTop_ == -1) {
      this.relayoutTop_ = relayoutTop;
    } else {
      this.relayoutTop_ = Math.min(relayoutTop, this.relayoutTop_);
    }
  }

  /** @override */
  maybeHeightChanged() {
    this.maybeChangeHeight_ = true;
  }

  /** @override */
  onNextPass(callback) {
    this.passCallbacks_.push(callback);
  }

  /**
   * Runs a pass immediately.
   *
   * @visibleForTesting
   */
  doPass() {
    if (!this.isRuntimeOn_) {
      dev().fine(TAG_, 'runtime is off');
      return;
    }

    this.visible_ = this.ampdoc.isVisible();
    this.buildsThisPass_ = 0;

    const firstPassAfterDocumentReady =
      this.documentReady_ &&
      this.firstPassAfterDocumentReady_ &&
      this.ampInitialized_;
    if (firstPassAfterDocumentReady) {
      this.firstPassAfterDocumentReady_ = false;
      const doc = this.win.document;
      const documentInfo = Services.documentInfoForDoc(this.ampdoc);

      // TODO(choumx, #26687): Update viewers to read data.viewport instead of
      // data.metaTags.viewport from 'documentLoaded' message.
      this.viewer_.sendMessage(
        'documentLoaded',
        dict({
          'title': doc.title,
          'sourceUrl': getSourceUrl(this.ampdoc.getUrl()),
          'serverLayout': doc.documentElement.hasAttribute('i-amphtml-element'),
          'linkRels': documentInfo.linkRels,
          'metaTags': {'viewport': documentInfo.viewport} /* deprecated */,
          'viewport': documentInfo.viewport,
        }),
        /* cancelUnsent */ true
      );

      this.contentHeight_ = this.viewport_.getContentHeight();
      this.viewer_.sendMessage(
        'documentHeight',
        dict({'height': this.contentHeight_}),
        /* cancelUnsent */ true
      );
      dev().fine(TAG_, 'document height on load: %s', this.contentHeight_);
    }

    const viewportSize = this.viewport_.getSize();
    dev().fine(
      TAG_,
      'PASS: visible=',
      this.visible_,
      ', relayoutAll=',
      this.relayoutAll_,
      ', relayoutTop=',
      this.relayoutTop_,
      ', viewportSize=',
      viewportSize.width,
      viewportSize.height
    );
    this.pass_.cancel();
    this.vsyncScheduled_ = false;

    this.visibilityStateMachine_.setState(this.ampdoc.getVisibilityState());

    this.signalIfReady_();

    if (this.maybeChangeHeight_) {
      this.maybeChangeHeight_ = false;
      this.vsync_.measure(() => {
        const measuredContentHeight = this.viewport_.getContentHeight();
        if (measuredContentHeight != this.contentHeight_) {
          this.viewer_.sendMessage(
            'documentHeight',
            dict({'height': measuredContentHeight}),
            /* cancelUnsent */ true
          );
          this.contentHeight_ = measuredContentHeight;
          dev().fine(TAG_, 'document height changed: %s', this.contentHeight_);
          this.viewport_.contentHeightChanged();
        }
      });
    }

    for (let i = 0; i < this.passCallbacks_.length; i++) {
      const fn = this.passCallbacks_[i];
      fn();
    }
    this.passCallbacks_.length = 0;
  }

  /**
   * If (1) the document is fully parsed, (2) the AMP runtime (services etc.)
   * is initialized, and (3) we did a first pass on element measurements,
   * then fire the "ready" signal.
   * @private
   */
  signalIfReady_() {
    if (
      this.documentReady_ &&
      this.ampInitialized_ &&
      // With IntersectionObserver, elements are not measured until the first
      // intersection callback.
      (!this.intersectionObserver_ ||
        this.intersectionObserverCallbackFired_) &&
      !this.ampdoc.signals().get(READY_SCAN_SIGNAL)
    ) {
      // This signal mainly signifies that most of elements have been measured
      // by now. This is mostly used to avoid measuring too many elements
      // individually. May not be called in shadow mode.
      this.ampdoc.signals().signal(READY_SCAN_SIGNAL);
      dev().fine(TAG_, 'signal: ready-scan');
    }
  }

  /** @override */
  getSlowElementRatio() {
    if (this.totalLayoutCount_ === 0) {
      return 0;
    }
    return this.slowLayoutCount_ / this.totalLayoutCount_;
  }

  /**
   * Returns `true` when there's mutate work currently batched.
   * @return {boolean}
   * @private
   */
  hasMutateWork_() {
    return this.requestsChangeSize_.length > 0;
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
    const now = Date.now();
    const viewportRect = this.viewport_.getRect();
    const topOffset = viewportRect.height / 10;
    const bottomOffset = viewportRect.height / 10;
    const isScrollingStopped =
      (Math.abs(this.lastVelocity_) < 1e-2 &&
        now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_) ||
      now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_ * 2;

    if (this.requestsChangeSize_.length > 0) {
      dev().fine(
        TAG_,
        'change size requests:',
        this.requestsChangeSize_.length
      );
      const requestsChangeSize = this.requestsChangeSize_;
      this.requestsChangeSize_ = [];

      // Find minimum top position and run all mutates.
      let minTop = -1;
      const scrollAdjSet = [];
      let aboveVpHeightChange = 0;
      for (let i = 0; i < requestsChangeSize.length; i++) {
        const request = requestsChangeSize[i];
        const {
          resource,
          event,
        } = /** @type {!./resources-interface.ChangeSizeRequestDef} */ (request);
        const box = resource.getLayoutBox();

        let topMarginDiff = 0;
        let bottomMarginDiff = 0;
        let leftMarginDiff = 0;
        let rightMarginDiff = 0;
        let {top: topUnchangedBoundary, bottom: bottomDisplacedBoundary} = box;
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
          if (newMargins.left != undefined) {
            leftMarginDiff = newMargins.left - margins.left;
          }
          if (newMargins.right != undefined) {
            rightMarginDiff = newMargins.right - margins.right;
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
        const widthDiff = request.newWidth - box.width;

        // Check resize rules. It will either resize element immediately, or
        // wait until scrolling stops or will call the overflow callback.
        let resize = false;
        if (
          heightDiff == 0 &&
          topMarginDiff == 0 &&
          bottomMarginDiff == 0 &&
          widthDiff == 0 &&
          leftMarginDiff == 0 &&
          rightMarginDiff == 0
        ) {
          // 1. Nothing to resize.
        } else if (request.force || !this.visible_) {
          // 2. An immediate execution requested or the document is hidden.
          resize = true;
        } else if (
          this.activeHistory_.hasDescendantsOf(resource.element) ||
          (event && event.userActivation && event.userActivation.hasBeenActive)
        ) {
          // 3. Active elements are immediately resized. The assumption is that
          // the resize is triggered by the user action or soon after.
          resize = true;
        } else if (
          topUnchangedBoundary >= viewportRect.bottom - bottomOffset ||
          (topMarginDiff == 0 &&
            box.bottom + Math.min(heightDiff, 0) >=
              viewportRect.bottom - bottomOffset)
        ) {
          // 4. Elements under viewport are resized immediately, but only if
          // an element's boundary is not changed above the viewport after
          // resize.
          resize = true;
        } else if (
          viewportRect.top > 1 &&
          bottomDisplacedBoundary <= viewportRect.top + topOffset
        ) {
          // 5. Elements above the viewport can only be resized if we are able
          // to compensate the height change by setting scrollTop and only if
          // the page has already been scrolled by some amount (1px due to iOS).
          // Otherwise the scrolling might move important things like the menu
          // bar out of the viewport at initial page load.
          if (
            heightDiff < 0 &&
            viewportRect.top + aboveVpHeightChange < -heightDiff
          ) {
            // Do nothing if height abobe viewport height can't compensate
            // height decrease
            continue;
          }
          // Can only resized when scrolling has stopped,
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
        } else if (this.elementNearBottom_(resource, box)) {
          // 6. Elements close to the bottom of the document (not viewport)
          // are resized immediately.
          resize = true;
        } else if (
          heightDiff < 0 ||
          topMarginDiff < 0 ||
          bottomMarginDiff < 0
        ) {
          // 7. The new height (or one of the margins) is smaller than the
          // current one.
        } else if (request.newHeight == box.height) {
          // 8. Element is in viewport, but this is a width-only expansion.
          // Check whether this should be reflow-free, in which case,
          // schedule a size change.
          this.vsync_.run(
            {
              measure: (state) => {
                state.resize = false;
                const parent = resource.element.parentElement;
                if (!parent) {
                  return;
                }

                // If the element has siblings, it's possible that a width-expansion will
                // cause some of them to be pushed down.
                const parentWidth =
                  (parent.getLayoutWidth && parent.getLayoutWidth()) ||
                  parent./*OK*/ offsetWidth;
                let cumulativeWidth = widthDiff;
                for (let i = 0; i < parent.childElementCount; i++) {
                  cumulativeWidth += parent.children[i]./*OK*/ offsetWidth;
                  if (cumulativeWidth > parentWidth) {
                    return;
                  }
                }
                state.resize = true;
              },
              mutate: (state) => {
                if (state.resize) {
                  request.resource.changeSize(
                    request.newHeight,
                    request.newWidth,
                    newMargins
                  );
                }
                request.resource.overflowCallback(
                  /* overflown */ !state.resize,
                  request.newHeight,
                  request.newWidth,
                  newMargins
                );
              },
            },
            {}
          );
        } else {
          // 9. Element is in viewport don't resize and try overflow callback
          // instead.
          request.resource.overflowCallback(
            /* overflown */ true,
            request.newHeight,
            request.newWidth,
            newMargins
          );
        }

        if (resize) {
          if (box.top >= 0) {
            minTop = minTop == -1 ? box.top : Math.min(minTop, box.top);
          }
          request.resource.changeSize(
            request.newHeight,
            request.newWidth,
            newMargins
          );
          request.resource.overflowCallback(
            /* overflown */ false,
            request.newHeight,
            request.newWidth,
            newMargins
          );
          this.maybeChangeHeight_ = true;
        }

        if (request.callback) {
          request.callback(/* hasSizeChanged */ resize);
        }
      }

      if (minTop != -1) {
        this.setRelayoutTop(minTop);
      }

      // Execute scroll-adjusting resize requests, if any.
      if (scrollAdjSet.length > 0) {
        this.vsync_.run(
          {
            measure: (state) => {
              state./*OK*/ scrollHeight = this.viewport_./*OK*/ getScrollHeight();
              state./*OK*/ scrollTop = this.viewport_./*OK*/ getScrollTop();
            },
            mutate: (state) => {
              let minTop = -1;
              scrollAdjSet.forEach((request) => {
                const box = request.resource.getLayoutBox();
                minTop = minTop == -1 ? box.top : Math.min(minTop, box.top);
                request.resource.changeSize(
                  request.newHeight,
                  request.newWidth,
                  request.marginChange
                    ? request.marginChange.newMargins
                    : undefined
                );
                if (request.callback) {
                  request.callback(/* hasSizeChanged */ true);
                }
              });
              if (minTop != -1) {
                this.setRelayoutTop(minTop);
              }
              // Sync is necessary here to avoid UI jump in the next frame.
              const newScrollHeight = this.viewport_./*OK*/ getScrollHeight();
              if (newScrollHeight != state./*OK*/ scrollHeight) {
                this.viewport_.setScrollTop(
                  state./*OK*/ scrollTop +
                    (newScrollHeight - state./*OK*/ scrollHeight)
                );
              }
              this.maybeChangeHeight_ = true;
            },
          },
          {}
        );
      }
    }
  }

  /**
   * Returns true if element is within 15% and 1000px of document bottom.
   * Caller can provide current/initial layout boxes as an optimization.
   * @param {!./resource.Resource} resource
   * @param {!../layout-rect.LayoutRectDef=} opt_layoutBox
   * @param {!../layout-rect.LayoutRectDef=} opt_initialLayoutBox
   * @return {boolean}
   * @private
   */
  elementNearBottom_(resource, opt_layoutBox, opt_initialLayoutBox) {
    const contentHeight = this.viewport_.getContentHeight();
    const threshold = Math.max(contentHeight * 0.85, contentHeight - 1000);

    const box = opt_layoutBox || resource.getLayoutBox();
    const initialBox = opt_initialLayoutBox || resource.getInitialLayoutBox();
    return box.bottom >= threshold || initialBox.bottom >= threshold;
  }

  /**
   * Always returns true unless the resource was previously displayed but is
   * not displayed now (i.e. the resource should be unloaded).
   * @param {!Resource} r
   * @param {boolean} usePremeasuredRect
   * @return {boolean}
   * @private
   */
  measureResource_(r, usePremeasuredRect = false) {
    const wasDisplayed = r.isDisplayed();
    r.measure(usePremeasuredRect);
    return !(wasDisplayed && !r.isDisplayed());
  }

  /**
   * Unloads given resources in an async mutate phase.
   * @param {!Array<!Resource>} resources
   * @private
   */
  unloadResources_(resources) {
    if (resources.length) {
      this.vsync_.mutate(() => {
        resources.forEach((r) => {
          r.unload();
          this.cleanupTasks_(r);
        });
        dev().fine(TAG_, 'unload:', resources);
      });
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
    const {
      relayoutAll_: relayoutAll,
      relayoutTop_: relayoutTop,
      elementsThatScrolled_: elementsThatScrolled,
    } = this;
    this.relayoutAll_ = false;
    this.relayoutTop_ = -1;

    // Phase 1: Build and relayout as needed. All mutations happen here.
    let relayoutCount = 0;
    let remeasureCount = 0;
    for (let i = 0; i < this.resources_.length; i++) {
      const r = this.resources_[i];
      if (r.getState() == ResourceState.NOT_BUILT && !r.isBuilding()) {
        this.buildOrScheduleBuildForResource_(r, /* checkForDupes */ true);
      }
      if (this.intersectionObserver_) {
        // With IntersectionObserver, we call applySizesAndMediaQuery() early
        // in connectedCallback(), so we only need to re-apply on relayout.
        // relayoutCount is also irrelevant and doesn't need an increment.
        if (relayoutAll) {
          r.applySizesAndMediaQuery();
          dev().fine(TAG_, 'apply sizes/media query:', r.debugid);
        }
      } else if (
        relayoutAll ||
        !r.hasBeenMeasured() ||
        // NOT_LAID_OUT is the state after build() but before measure().
        r.getState() == ResourceState.NOT_LAID_OUT
      ) {
        // TODO(willchou): We sometimes call this needlessly/repeatedly.
        // All elements outside of the loading rect are NOT_LAID_OUT!
        r.applySizesAndMediaQuery();
        dev().fine(TAG_, 'apply sizes/media query:', r.debugid);
        relayoutCount++;
      }
      if (r.isMeasureRequested()) {
        remeasureCount++;
      }
    }

    // Phase 2: Remeasure if there were any relayouts. Unfortunately, currently
    // there's no way to optimize this. All reads happen here.
    let toUnload;
    if (this.intersectionObserver_) {
      // The IntersectionObserver variant for phase 2 is just a simplification
      // that ignores `relayoutTop` and `elementsThatScrolled`.
      for (let i = 0; i < this.resources_.length; i++) {
        const r = this.resources_[i];
        const requested = r.isMeasureRequested();
        if (r.hasOwner() && !requested) {
          continue;
        }
        const premeasured = r.hasBeenPremeasured();
        if (requested) {
          dev().fine(TAG_, 'force remeasure:', r.debugid);
        }
        // Immediately measure (vs. waiting for async premeasure) for certain
        // elements with sensitive time-to-measure.
        const expediteFirstMeasure =
          !r.hasBeenMeasured() && r.element.tagName == 'AMP-AD';
        const needsMeasure =
          premeasured || requested || this.relayoutAll_ || expediteFirstMeasure;
        if (needsMeasure) {
          const isDisplayed = this.measureResource_(
            r,
            /* usePremeasuredRect */ premeasured
          );
          if (!isDisplayed) {
            devAssert(
              r.getState() != ResourceState.NOT_BUILT,
              'Should not unload unbuilt elements.'
            );
            if (!toUnload) {
              toUnload = [];
            }
            toUnload.push(r);
          }
        }
      }
    } else if (
      relayoutCount > 0 ||
      remeasureCount > 0 ||
      relayoutAll ||
      relayoutTop != -1 ||
      elementsThatScrolled.length > 0
    ) {
      for (let i = 0; i < this.resources_.length; i++) {
        const r = this.resources_[i];
        if (r.hasOwner() && !r.isMeasureRequested()) {
          // If element has owner, and measure is not requested, do nothing.
          continue;
        }
        let needsMeasure =
          relayoutAll ||
          r.getState() == ResourceState.NOT_LAID_OUT ||
          !r.hasBeenMeasured() ||
          r.isMeasureRequested() ||
          (relayoutTop != -1 && r.getLayoutBox().bottom >= relayoutTop);

        if (!needsMeasure) {
          for (let i = 0; i < elementsThatScrolled.length; i++) {
            // TODO(jridgewell): Need to figure out how ShadowRoots and FIEs
            // should behave in this model. If the ShadowRoot's host scrolls,
            // do we need to invalidate inside the shadow or light tree? Or if
            // the FIE's iframe parent scrolls, do we?
            if (elementsThatScrolled[i].contains(r.element)) {
              needsMeasure = true;
              break;
            }
          }
        }

        if (needsMeasure) {
          const isDisplayed = this.measureResource_(r);
          if (!isDisplayed) {
            if (!toUnload) {
              toUnload = [];
            }
            toUnload.push(r);
          }
        }
      }
    }
    elementsThatScrolled.length = 0;

    // Unload all in one cycle.
    if (toUnload) {
      this.unloadResources_(toUnload);
    }

    const viewportRect = this.viewport_.getRect();
    // Load viewport = viewport + 3x up/down when document is visible.
    let loadRect;
    if (this.visible_) {
      loadRect = expandLayoutRect(viewportRect, 0.25, 2);
    } else {
      loadRect = viewportRect;
    }

    const visibleRect = this.visible_
      ? // When the doc is visible, consider the viewport to be 25% larger,
        // to minimize effect from small scrolling and notify things that
        // they are in viewport just before they are actually visible.
        expandLayoutRect(viewportRect, 0.25, 0.25)
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
      const shouldBeInViewport =
        this.visible_ && r.isDisplayed() && r.overlaps(visibleRect);
      r.setInViewport(shouldBeInViewport);
    }

    // Phase 4: Schedule elements for layout within a reasonable distance from
    // current viewport.
    if (loadRect) {
      for (let i = 0; i < this.resources_.length; i++) {
        const r = this.resources_[i];
        debugger;
        // TODO(dvoytenko): This extra build has to be merged with the
        // scheduleLayoutOrPreload method below.
        // Build all resources visible, measured, and in the viewport.
        if (
          !r.isBuilt() &&
          !r.isBuilding() &&
          !r.hasOwner() &&
          r.hasBeenMeasured() &&
          r.isDisplayed() &&
          r.overlaps(loadRect)
        ) {
          this.buildOrScheduleBuildForResource_(
            r,
            /* checkForDupes */ true,
            /* ignoreQuota */ true
          );
        }
        if (r.getState() != ResourceState.READY_FOR_LAYOUT || r.hasOwner()) {
          continue;
        }
        // TODO(dvoytenko, #3434): Reimplement the use of `isFixed` with
        // layers. This is currently a short-term fix to the problem that
        // the fixed elements get incorrect top coord.
        if (r.isDisplayed() && r.overlaps(loadRect)) {
          debugger;
          this.scheduleLayoutOrPreload(r, /* layout */ true);
        }
      }
    }

    if (this.visible_ && this.isIdle_(now)) {
      // Phase 5: Idle Render Outside Viewport layout: layout up to 4 items
      // with idleRenderOutsideViewport true
      let idleScheduledCount = 0;
      for (
        let i = 0;
        i < this.resources_.length && idleScheduledCount < 4;
        i++
      ) {
        const r = this.resources_[i];
        if (
          r.getState() == ResourceState.READY_FOR_LAYOUT &&
          !r.hasOwner() &&
          r.isDisplayed() &&
          r.idleRenderOutsideViewport()
        ) {
          dev().fine(TAG_, 'idleRenderOutsideViewport layout:', r.debugid);
          this.scheduleLayoutOrPreload(r, /* layout */ false);
          idleScheduledCount++;
        }
      }
      // Phase 6: Idle layout: layout more if we are otherwise not doing much.
      // TODO(dvoytenko): document/estimate IDLE timeouts and other constants
      for (
        let i = 0;
        i < this.resources_.length && idleScheduledCount < 4;
        i++
      ) {
        const r = this.resources_[i];
        if (
          r.getState() == ResourceState.READY_FOR_LAYOUT &&
          !r.hasOwner() &&
          r.isDisplayed()
        ) {
          dev().fine(TAG_, 'idle layout:', r.debugid);
          this.scheduleLayoutOrPreload(r, /* layout */ false);
          idleScheduledCount++;
        }
      }
    }
  }

  /**
   * Whether the page is relatively "idle". For now, it's checking if it's been
   * a while since the last element received a layoutCallback.
   *
   * @param {number} now
   * @return {boolean}
   * @private
   */
  isIdle_(now = Date.now()) {
    const lastDequeueTime = this.exec_.getLastDequeueTime();
    return (
      this.exec_.getSize() == 0 &&
      this.queue_.getSize() == 0 &&
      now > lastDequeueTime + 5000 &&
      lastDequeueTime > 0
    );
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
    let task = this.queue_.peek(this.boundTaskScorer_);
    while (task) {
      if (!this.removeTaskTimeout_) {
        timeout = this.calcTaskTimeout_(task);
      }
      dev().fine(
        TAG_,
        'peek from queue:',
        task.id,
        'sched at',
        task.scheduleTime,
        'score',
        this.boundTaskScorer_(task),
        'timeout',
        timeout
      );
      if (!this.removeTaskTimeout_) {
        if (timeout > 16) {
          break;
        }
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
        const {resource} = task;

        let stillDisplayed = true;
        if (this.intersectionObserver_) {
          // With IntersectionObserver, peek at the premeasured rect to see
          // if the resource is still displayed (has a non-zero size).
          // The premeasured rect is most analogous to an immediate measure.
          if (resource.hasBeenPremeasured()) {
            stillDisplayed = resource.isDisplayed(
              /* usePremeasuredRect */ true
            );
          }
        } else {
          // Remeasure can only update isDisplayed(), not in-viewport state.
          resource.measure();
        }
        // Check if the element has exited the viewport or the page has changed
        // visibility since the layout was scheduled.
        if (
          stillDisplayed &&
          this.isLayoutAllowed_(resource, task.forceOutsideViewport)
        ) {
          task.promise = task.callback();
          task.startTime = now;
          dev().fine(TAG_, 'exec:', task.id, 'at', task.startTime);
          this.exec_.enqueue(task);
          task.promise
            .then(
              this.taskComplete_.bind(this, task, true),
              this.taskComplete_.bind(this, task, false)
            )
            .catch(/** @type {function (*)} */ (reportError));
        } else {
          dev().fine(TAG_, 'cancelled', task.id);
          resource.layoutCanceled();
        }
      }

      task = this.queue_.peek(this.boundTaskScorer_);
      timeout = -1;
    }

    dev().fine(
      TAG_,
      'queue size:',
      this.queue_.getSize(),
      'exec size:',
      this.exec_.getSize()
    );

    if (!this.removeTaskTimeout_) {
      if (timeout >= 0) {
        // Still tasks in the queue, but we took too much time.
        // Schedule the next work pass.
        return timeout;
      }
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
   * @return {number}
   * @private
   */
  calcTaskScore_(task) {
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
    this.exec_.forEach((other) => {
      // Higher priority tasks get the head start. Currently 500ms per a drop
      // in priority (note that priority is 10-based).
      const penalty = Math.max(
        (task.priority - other.priority) * PRIORITY_PENALTY_TIME_,
        0
      );
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
    this.totalLayoutCount_++;
    if (task.resource.isInViewport() && this.firstVisibleTime_ >= 0) {
      this.slowLayoutCount_++;
    }

    this.exec_.dequeue(task);
    this.schedulePass(POST_TASK_PASS_DELAY_);
    if (!success) {
      dev().info(
        TAG_,
        'task failed:',
        task.id,
        task.resource.debugid,
        opt_reason
      );
      return Promise.reject(opt_reason);
    }
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
    if (
      resource.getState() == ResourceState.NOT_BUILT ||
      !resource.isDisplayed()
    ) {
      return false;
    }

    // Don't schedule elements when we're not visible, or in prerender mode
    // (and they can't prerender).
    if (!this.visible_) {
      if (
        this.ampdoc.getVisibilityState() != VisibilityState.PRERENDER ||
        !resource.prerenderAllowed()
      ) {
        return false;
      }
    }

    // The element has to be in its rendering corridor.
    if (
      !forceOutsideViewport &&
      !resource.isInViewport() &&
      !resource.renderOutsideViewport() &&
      !resource.idleRenderOutsideViewport()
    ) {
      return false;
    }

    return true;
  }

  /** @override */
  scheduleLayoutOrPreload(
    resource,
    layout,
    opt_parentPriority,
    opt_forceOutsideViewport
  ) {
    const isBuilt = resource.getState() != ResourceState.NOT_BUILT;
    const isDisplayed = resource.isDisplayed();
    if (!isBuilt || !isDisplayed) {
      devAssert(
        false,
        'Not ready for layout: %s (%s)',
        resource.debugid,
        resource.getState()
      );
    }
    const forceOutsideViewport = opt_forceOutsideViewport || false;
    if (!this.isLayoutAllowed_(resource, forceOutsideViewport)) {
      return;
    }

    if (layout) {
      this.schedule_(
        resource,
        LAYOUT_TASK_ID_,
        LAYOUT_TASK_OFFSET_,
        opt_parentPriority || 0,
        forceOutsideViewport,
        resource.startLayout.bind(resource)
      );
    } else {
      this.schedule_(
        resource,
        PRELOAD_TASK_ID_,
        PRELOAD_TASK_OFFSET_,
        opt_parentPriority || 0,
        forceOutsideViewport,
        resource.startLayout.bind(resource)
      );
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
    callback
  ) {
    const taskId = resource.getTaskId(localId);

    const task = {
      id: taskId,
      resource,
      priority:
        Math.max(resource.getLayoutPriority(), parentPriority) + priorityOffset,
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
      if (this.removeTaskTimeout_) {
        this.schedulePass();
      } else {
        this.schedulePass(this.calcTaskTimeout_(task));
      }
    }
    task.resource.layoutScheduled(task.scheduleTime);
  }

  /**
   * @return {!Promise} when first pass executed.
   */
  whenFirstPass() {
    return this.firstPassDone_.promise;
  }

  /**
   * Calls iterator on each sub-resource
   * @param {!FiniteStateMachine<!VisibilityState>} vsm
   */
  setupVisibilityStateMachine_(vsm) {
    const {
      PRERENDER: prerender,
      VISIBLE: visible,
      HIDDEN: hidden,
      PAUSED: paused,
      INACTIVE: inactive,
    } = VisibilityState;
    const doWork = () => {
      // If viewport size is 0, the manager will wait for the resize event.
      const viewportSize = this.viewport_.getSize();
      if (viewportSize.height > 0 && viewportSize.width > 0) {
        // 1. Handle all size-change requests. 1x mutate (+1 vsync measure/mutate for above-fold resizes).
        if (this.hasMutateWork_()) {
          this.mutateWork_();
        }
        // 2. Build/measure/in-viewport/schedule layouts. 1x mutate & measure.
        this.discoverWork_();
        // 3. Execute scheduled layouts and preloads. 1x mutate.
        let delay = this.work_();
        // 4. Deferred size-change requests (waiting for scrolling to stop) will shorten delay until next pass.
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
        this.firstPassDone_.resolve();
      }
    };
    const noop = () => {};
    const pause = () => {
      this.resources_.forEach((r) => r.pause());
    };
    const unload = () => {
      this.resources_.forEach((r) => {
        r.unload();
        this.cleanupTasks_(r);
      });
      this.unselectText_();
    };
    const resume = () => {
      this.resources_.forEach((r) => r.resume());
      doWork();
    };

    vsm.addTransition(prerender, prerender, doWork);
    vsm.addTransition(prerender, visible, doWork);
    vsm.addTransition(prerender, hidden, doWork);
    vsm.addTransition(prerender, inactive, doWork);
    vsm.addTransition(prerender, paused, doWork);

    vsm.addTransition(visible, visible, doWork);
    vsm.addTransition(visible, hidden, doWork);
    vsm.addTransition(visible, inactive, unload);
    vsm.addTransition(visible, paused, pause);

    vsm.addTransition(hidden, visible, doWork);
    vsm.addTransition(hidden, hidden, doWork);
    vsm.addTransition(hidden, inactive, unload);
    vsm.addTransition(hidden, paused, pause);

    vsm.addTransition(inactive, visible, resume);
    vsm.addTransition(inactive, hidden, resume);
    vsm.addTransition(inactive, inactive, noop);
    vsm.addTransition(inactive, paused, doWork);

    vsm.addTransition(paused, visible, resume);
    vsm.addTransition(paused, hidden, doWork);
    vsm.addTransition(paused, inactive, unload);
    vsm.addTransition(paused, paused, noop);
  }

  /**
   * Unselects any selected text
   * @private
   */
  unselectText_() {
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
    if (
      resource.getState() == ResourceState.NOT_LAID_OUT ||
      resource.getState() == ResourceState.READY_FOR_LAYOUT
    ) {
      // If the layout promise for this resource has not resolved yet, remove
      // it from the task queues to make sure this resource can be rescheduled
      // for layout again later on.
      // TODO(mkhatib): Think about how this might affect preload tasks once the
      // prerender change is in.
      this.queue_.purge((task) => {
        return task.resource == resource;
      });
      this.exec_.purge((task) => {
        return task.resource == resource;
      });
      remove(this.requestsChangeSize_, (request) => {
        return request.resource === resource;
      });
    }

    if (
      resource.getState() == ResourceState.NOT_BUILT &&
      opt_removePending &&
      this.pendingBuildResources_
    ) {
      const pendingIndex = this.pendingBuildResources_.indexOf(resource);
      if (pendingIndex != -1) {
        this.pendingBuildResources_.splice(pendingIndex, 1);
      }
    }
  }

  /**
   * Listens for scroll events on elements (not the root scroller), and marks
   * them for invalidating all child layout boxes. This is to support native
   * scrolling elements outside amp-components.
   *
   * @param {!Event} event
   */
  scrolled_(event) {
    const {target} = event;
    // If the target of the scroll event is an element, that means that element
    // is an overflow scroller.
    // If the target is the document itself, that means the native root
    // scroller (`document.scrollingElement`) did the scrolling.
    if (target.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    // In iOS <= 12, the scroll hacks cause the scrolling element to be
    // reported as the target, instead of the document.
    if (target === this.viewport_.getScrollingElement()) {
      return;
    }

    const scrolled = dev().assertElement(target);
    if (!this.elementsThatScrolled_.includes(scrolled)) {
      this.elementsThatScrolled_.push(scrolled);
      this.schedulePass(FOUR_FRAME_DELAY_);
    }
  }
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
  registerServiceBuilderForDoc(ampdoc, 'resources', ResourcesImpl);
}
