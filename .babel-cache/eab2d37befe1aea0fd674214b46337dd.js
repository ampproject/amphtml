function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { VisibilityState } from "../core/constants/visibility-state";
import { FiniteStateMachine } from "../core/data-structures/finite-state-machine";
import { Deferred } from "../core/data-structures/promise";
import { hasNextNodeInDocumentOrder } from "../core/dom";
import { expandLayoutRect } from "../core/dom/layout/rect";
import { remove } from "../core/types/array";
import { throttle } from "../core/types/function";
import { dict } from "../core/types/object";

import { Services } from "./";

import { ieIntrinsicCheckAndFix } from "./ie-intrinsic-bug";
import { ieMediaCheckAndFix } from "./ie-media-bug";
import { Resource, ResourceState } from "./resource";
import { READY_SCAN_SIGNAL, ResourcesInterface } from "./resources-interface";
import { TaskQueue } from "./task-queue";

import { startupChunk } from "../chunk";
import { isBlockedByConsent, reportError } from "../error-reporting";
import { listen, loadPromise } from "../event-helper";
import { FocusHistory } from "../focus-history";
import { dev, devAssert } from "../log";
import { Pass } from "../pass";
import { registerServiceBuilderForDoc } from "../service-helpers";
import { getSourceUrl } from "../url";

var TAG_ = 'Resources';
var LAYOUT_TASK_ID_ = 'L';
var LAYOUT_TASK_OFFSET_ = 0;
var PRELOAD_TASK_ID_ = 'P';
var PRELOAD_TASK_OFFSET_ = 2;
var PRIORITY_BASE_ = 10;
var PRIORITY_PENALTY_TIME_ = 1000;
var POST_TASK_PASS_DELAY_ = 1000;
var MUTATE_DEFER_DELAY_ = 500;
var FOCUS_HISTORY_TIMEOUT_ = 1000 * 60; // 1min
var FOUR_FRAME_DELAY_ = 70;

/**
 * @implements {ResourcesInterface}
 */
export var ResourcesImpl = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function ResourcesImpl(ampdoc) {var _this = this;_classCallCheck(this, ResourcesImpl);
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
    this.pass_ = new Pass(this.win, function () {return _this.doPass();});

    /** @const @private {!Pass} */
    this.remeasurePass_ = new Pass(this.win, function () {
      _this.relayoutAll_ = true;
      _this.schedulePass();
    });

    /** @const {!TaskQueue} */
    this.exec_ = new TaskQueue();

    /** @const {!TaskQueue} */
    this.queue_ = new TaskQueue();

    /** @const {function(./task-queue.TaskDef):number} */
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
    this.vsync_ = Services. /*OK*/vsyncFor(this.win);

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

    /** @const @private {!Deferred} */
    this.firstPassDone_ = new Deferred();

    /** @private @const {!FiniteStateMachine<!VisibilityState>} */
    this.visibilityStateMachine_ = new FiniteStateMachine(
    this.ampdoc.getVisibilityState());


    // When user scrolling stops, run pass to check newly in-viewport elements.
    // When viewport is resized, we have to re-measure everything.
    this.viewport_.onChanged(function (event) {
      _this.lastScrollTime_ = _this.win.Date.now();
      _this.lastVelocity_ = event.velocity;
      if (event.relayoutAll) {
        _this.relayoutAll_ = true;
        _this.maybeChangeHeight_ = true;
      }

      _this.schedulePass();
    });
    this.viewport_.onScroll(function () {
      _this.lastScrollTime_ = _this.win.Date.now();
    });

    // When document becomes visible, e.g. from "prerender" mode, do a
    // simple pass.
    this.ampdoc.onVisibilityChanged(function () {
      if (_this.firstVisibleTime_ == -1 && _this.ampdoc.isVisible()) {
        _this.firstVisibleTime_ = _this.win.Date.now();
      }
      _this.schedulePass();
    });

    this.viewer_.onRuntimeState(function (state) {
      dev().fine(TAG_, 'Runtime state:', state);
      _this.isRuntimeOn_ = state;
      _this.schedulePass(1);
    });

    // Schedule initial passes. This must happen in a startup task
    // to avoid blocking body visible.
    startupChunk(this.ampdoc, function () {
      _this.setupVisibilityStateMachine_(_this.visibilityStateMachine_);
      _this.schedulePass(0);
    });

    this.rebuildDomWhenReady_();

    /** @private @const */
    this.throttledScroll_ = throttle(this.win, function (e) {return _this.scrolled_(e);}, 250);

    listen(this.win.document, 'scroll', this.throttledScroll_, {
      capture: true,
      passive: true });

  }

  /** @private */_createClass(ResourcesImpl, [{ key: "rebuildDomWhenReady_", value:
    function rebuildDomWhenReady_() {var _this2 = this;
      // Ensure that we attempt to rebuild things when DOM is ready.
      this.ampdoc.whenReady().then(function () {
        _this2.documentReady_ = true;
        _this2.buildReadyResources_();
        _this2.pendingBuildResources_ = null;

        var input = Services.inputFor(_this2.win);
        input.setupInputModeClasses(_this2.ampdoc);

        if (false) {
          return;
        }

        ieIntrinsicCheckAndFix(_this2.win);

        var fixPromise = ieMediaCheckAndFix(_this2.win);
        var remeasure = function remeasure() {return _this2.remeasurePass_.schedule();};
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
        loadPromise(_this2.win),
        Services.timerFor(_this2.win).promise(3100)]).
        then(remeasure);

        // Remeasure the document when all fonts loaded.
        if (
        _this2.win.document.fonts &&
        _this2.win.document.fonts.status != 'loaded')
        {
          _this2.win.document.fonts.ready.then(remeasure);
        }
      });
    }

    /** @override */ }, { key: "get", value:
    function get() {
      return this.resources_.slice(0);
    }

    /** @override */ }, { key: "getAmpdoc", value:
    function getAmpdoc() {
      return this.ampdoc;
    }

    /** @override */ }, { key: "getResourceForElement", value:
    function getResourceForElement(element) {
      return Resource.forElement(element);
    }

    /** @override */ }, { key: "getResourceForElementOptional", value:
    function getResourceForElementOptional(element) {
      return Resource.forElementOptional(element);
    }

    /** @override */ }, { key: "getScrollDirection", value:
    function getScrollDirection() {
      return Math.sign(this.lastVelocity_) || 1;
    }

    /** @override */ }, { key: "add", value:
    function add(element) {
      // Ensure the viewport is ready to accept the first element.
      this.addCount_++;
      if (this.addCount_ == 1) {
        this.viewport_.ensureReadyForElements();
      }

      // First check if the resource is being reparented and if it requires
      // reconstruction. Only already built elements are eligible.
      var resource = Resource.forElementOptional(element);
      if (
      resource &&
      resource.getState() != ResourceState.NOT_BUILT &&
      !element.reconstructWhenReparented())
      {
        resource.requestMeasure();
        dev().fine(TAG_, 'resource reused:', resource.debugid);
      } else {
        // Create and add a new resource.
        resource = new Resource(++this.resourceIdCounter_, element, this);
        dev().fine(TAG_, 'resource added:', resource.debugid);
      }
      this.resources_.push(resource);
      this.remeasurePass_.schedule(1000);
    }

    /**
     * Limits the number of elements being build in pre-render phase to
     * a finite number. Returns false if the number has been reached.
     * @return {boolean}
     */ }, { key: "isUnderBuildQuota_", value:
    function isUnderBuildQuota_() {
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
     */ }, { key: "buildOrScheduleBuildForResource_", value:
    function buildOrScheduleBuildForResource_(
    resource)


    {var checkForDupes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;var ignoreQuota = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var buildingEnabled = this.isRuntimeOn_ || this.isBuildOn_;
      if (!buildingEnabled) {
        return;
      }

      // During prerender mode, don't build elements that aren't allowed to be
      // prerendered. This avoids wasting our prerender build quota.
      // See isUnderBuildQuota_() for more details.
      var shouldBuildResource =
      this.ampdoc.getVisibilityState() != VisibilityState.PRERENDER ||
      resource.prerenderAllowed();
      if (!shouldBuildResource) {
        return;
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
     */ }, { key: "buildReadyResources_", value:
    function buildReadyResources_() {
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
     */ }, { key: "buildReadyResourcesUnsafe_", value:
    function buildReadyResourcesUnsafe_() {
      // This will loop over all current pending resources and those that
      // get added by other resources build-cycle, this will make sure all
      // elements get a chance to be built.
      for (var i = 0; i < this.pendingBuildResources_.length; i++) {
        var resource = this.pendingBuildResources_[i];
        if (
        this.documentReady_ ||
        hasNextNodeInDocumentOrder(resource.element, this.ampdoc.getRootNode()))
        {
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
     */ }, { key: "buildResourceUnsafe_", value:
    function buildResourceUnsafe_(resource) {var _this3 = this;var ignoreQuota = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (
      !ignoreQuota &&
      !this.isUnderBuildQuota_() &&
      // Special case: amp-experiment is allowed to bypass prerender build quota.
      !resource.isBuildRenderBlocking())
      {
        return null;
      }

      var promise = resource.build();
      if (!promise) {
        return null;
      }
      dev().fine(TAG_, 'build resource:', resource.debugid);
      this.buildAttemptsCount_++;
      this.buildsThisPass_++;
      return promise.then(
      function () {return _this3.schedulePass();},
      function (error) {
        // Build failed: remove the resource. No other state changes are
        // needed.
        _this3.removeResource_(resource);
        if (!isBlockedByConsent(error)) {
          throw error;
        }
      });

    }

    /** @override */ }, { key: "remove", value:
    function remove(element) {
      var resource = Resource.forElementOptional(element);
      if (!resource) {
        return;
      }
      this.removeResource_(resource);
    }

    /**
     * @param {!Resource} resource
     * @private
     */ }, { key: "removeResource_", value:
    function removeResource_(resource) {
      var index = this.resources_.indexOf(resource);
      if (index != -1) {
        this.resources_.splice(index, 1);
      }
      if (resource.isBuilt()) {
        resource.pauseOnRemove();
      }

      if (resource.getState() === ResourceState.LAYOUT_SCHEDULED) {
        resource.layoutCanceled();
      }
      this.cleanupTasks_(resource, /* opt_removePending */true);
      dev().fine(TAG_, 'resource removed:', resource.debugid);
    }

    /** @override */ }, { key: "upgraded", value:
    function upgraded(element) {
      var resource = Resource.forElement(element);
      this.buildOrScheduleBuildForResource_(resource);
      dev().fine(TAG_, 'resource upgraded:', resource.debugid);
    }

    /** @override */ }, { key: "updateLayoutPriority", value:
    function updateLayoutPriority(element, newLayoutPriority) {
      var resource = Resource.forElement(element);

      resource.updateLayoutPriority(newLayoutPriority);

      // Update affected tasks
      this.queue_.forEach(function (task) {
        if (task.resource == resource) {
          task.priority = newLayoutPriority;
        }
      });

      this.schedulePass();
    }

    /** @override */ }, { key: "schedulePass", value:
    function schedulePass(opt_delay) {
      return this.pass_.schedule(opt_delay);
    }

    /** @override */ }, { key: "updateOrEnqueueMutateTask", value:
    function updateOrEnqueueMutateTask(resource, newRequest) {
      var request = null;
      for (var i = 0; i < this.requestsChangeSize_.length; i++) {
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

    /** @override */ }, { key: "schedulePassVsync", value:
    function schedulePassVsync() {var _this4 = this;
      if (this.vsyncScheduled_) {
        return;
      }
      this.vsyncScheduled_ = true;
      this.vsync_.mutate(function () {return _this4.doPass();});
    }

    /** @override */ }, { key: "ampInitComplete", value:
    function ampInitComplete() {
      this.ampInitialized_ = true;
      dev().fine(TAG_, 'ampInitComplete');
      this.schedulePass();
    }

    /** @override */ }, { key: "setRelayoutTop", value:
    function setRelayoutTop(relayoutTop) {
      if (this.relayoutTop_ == -1) {
        this.relayoutTop_ = relayoutTop;
      } else {
        this.relayoutTop_ = Math.min(relayoutTop, this.relayoutTop_);
      }
    }

    /** @override */ }, { key: "maybeHeightChanged", value:
    function maybeHeightChanged() {
      this.maybeChangeHeight_ = true;
    }

    /** @override */ }, { key: "onNextPass", value:
    function onNextPass(callback) {
      this.passCallbacks_.push(callback);
    }

    /**
     * Runs a pass immediately.
     *
     * @visibleForTesting
     */ }, { key: "doPass", value:
    function doPass() {var _this5 = this;
      if (!this.isRuntimeOn_) {
        dev().fine(TAG_, 'runtime is off');
        return;
      }

      this.visible_ = this.ampdoc.isVisible();
      this.buildsThisPass_ = 0;

      var firstPassAfterDocumentReady =
      this.documentReady_ &&
      this.firstPassAfterDocumentReady_ &&
      this.ampInitialized_;
      if (firstPassAfterDocumentReady) {var _doc$body$firstElemen;
        this.firstPassAfterDocumentReady_ = false;
        var doc = this.win.document;
        var documentInfo = Services.documentInfoForDoc(this.ampdoc);

        // TODO(choumx, #26687): Update viewers to read data.viewport instead of
        // data.metaTags.viewport from 'documentLoaded' message.
        this.viewer_.sendMessage(
        'documentLoaded',
        dict({
          'title': doc.title,
          'sourceUrl': getSourceUrl(this.ampdoc.getUrl()),
          'isStory': (((_doc$body$firstElemen = doc.body.firstElementChild) === null || _doc$body$firstElemen === void 0) ? (void 0) : _doc$body$firstElemen.tagName) === 'AMP-STORY',
          'serverLayout': doc.documentElement.hasAttribute('i-amphtml-element'),
          'linkRels': documentInfo.linkRels,
          'metaTags': { 'viewport': documentInfo.viewport } /* deprecated */,
          'viewport': documentInfo.viewport }),

        /* cancelUnsent */true);


        this.contentHeight_ = this.viewport_.getContentHeight();
        this.viewer_.sendMessage(
        'documentHeight',
        dict({ 'height': this.contentHeight_ }),
        /* cancelUnsent */true);

        dev().fine(TAG_, 'document height on load: %s', this.contentHeight_);
      }

      // Once we know the document is fully parsed, we check to see if every AMP Element has been built
      var firstPassAfterAllBuilt =
      !this.firstPassAfterDocumentReady_ &&
      this.firstPassAfterAllBuilt_ &&
      this.resources_.every(
      function (r) {return r.getState() != Resource.NOT_BUILT || r.element.R1();});

      if (firstPassAfterAllBuilt) {
        this.firstPassAfterAllBuilt_ = false;
        this.maybeChangeHeight_ = true;
      }

      var viewportSize = this.viewport_.getSize();
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
      viewportSize.height);

      this.pass_.cancel();
      this.vsyncScheduled_ = false;

      this.visibilityStateMachine_.setState(this.ampdoc.getVisibilityState());

      this.signalIfReady_();

      if (this.maybeChangeHeight_) {
        this.maybeChangeHeight_ = false;
        this.vsync_.measure(function () {
          var measuredContentHeight = _this5.viewport_.getContentHeight();
          if (measuredContentHeight != _this5.contentHeight_) {
            _this5.viewer_.sendMessage(
            'documentHeight',
            dict({ 'height': measuredContentHeight }),
            /* cancelUnsent */true);

            _this5.contentHeight_ = measuredContentHeight;
            dev().fine(TAG_, 'document height changed: %s', _this5.contentHeight_);
            _this5.viewport_.contentHeightChanged();
          }
        });
      }

      for (var i = 0; i < this.passCallbacks_.length; i++) {
        var fn = this.passCallbacks_[i];
        fn();
      }
      this.passCallbacks_.length = 0;
    }

    /**
     * If (1) the document is fully parsed, (2) the AMP runtime (services etc.)
     * is initialized, and (3) we did a first pass on element measurements,
     * then fire the "ready" signal.
     * @private
     */ }, { key: "signalIfReady_", value:
    function signalIfReady_() {
      if (
      this.documentReady_ &&
      this.ampInitialized_ &&
      !this.ampdoc.signals().get(READY_SCAN_SIGNAL))
      {
        // This signal mainly signifies that most of elements have been measured
        // by now. This is mostly used to avoid measuring too many elements
        // individually. May not be called in shadow mode.
        this.ampdoc.signals().signal(READY_SCAN_SIGNAL);
        dev().fine(TAG_, 'signal: ready-scan');
      }
    }

    /**
     * Returns `true` when there's mutate work currently batched.
     * @return {boolean}
     * @private
     */ }, { key: "hasMutateWork_", value:
    function hasMutateWork_() {
      return this.requestsChangeSize_.length > 0;
    }

    /**
     * Performs pre-discovery mutates.
     * @private
     */ }, { key: "mutateWork_", value:
    function mutateWork_() {var _this6 = this;
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
      var now = this.win.Date.now();
      var viewportRect = this.viewport_.getRect();
      var topOffset = viewportRect.height / 10;
      var bottomOffset = viewportRect.height / 10;
      var isScrollingStopped =
      (Math.abs(this.lastVelocity_) < 1e-2 &&
      now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_) ||
      now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_ * 2;

      if (this.requestsChangeSize_.length > 0) {
        dev().fine(
        TAG_,
        'change size requests:',
        this.requestsChangeSize_.length);

        var requestsChangeSize = this.requestsChangeSize_;
        this.requestsChangeSize_ = [];

        // Find minimum top position and run all mutates.
        var minTop = -1;
        var scrollAdjSet = [];
        var aboveVpHeightChange = 0;var _loop = function _loop(
        i) {
          var request = requestsChangeSize[i];
          var event =
          /** @type {!./resources-interface.ChangeSizeRequestDef} */(request).event,resource = /** @type {!./resources-interface.ChangeSizeRequestDef} */(request).resource;
          var box = resource.getLayoutBox();

          var topMarginDiff = 0;
          var bottomMarginDiff = 0;
          var leftMarginDiff = 0;
          var rightMarginDiff = 0;
          var bottomDisplacedBoundary = box.bottom,topUnchangedBoundary = box.top;
          var newMargins = undefined;
          if (request.marginChange) {
            newMargins = request.marginChange.newMargins;
            var margins = request.marginChange.currentMargins;
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
          var heightDiff = request.newHeight - box.height;
          var widthDiff = request.newWidth - box.width;

          // Check resize rules. It will either resize element immediately, or
          // wait until scrolling stops or will call the overflow callback.
          var resize = false;
          if (
          heightDiff == 0 &&
          topMarginDiff == 0 &&
          bottomMarginDiff == 0 &&
          widthDiff == 0 &&
          leftMarginDiff == 0 &&
          rightMarginDiff == 0)
          {
            // 1. Nothing to resize.
          } else if (request.force || !_this6.visible_) {
            // 2. An immediate execution requested or the document is hidden.
            resize = true;
          } else if (
          _this6.activeHistory_.hasDescendantsOf(resource.element) || (
          event && event.userActivation && event.userActivation.hasBeenActive))
          {
            // 3. Active elements are immediately resized. The assumption is that
            // the resize is triggered by the user action or soon after.
            resize = true;
          } else if (
          topUnchangedBoundary >= viewportRect.bottom - bottomOffset || (
          topMarginDiff == 0 &&
          box.bottom + Math.min(heightDiff, 0) >=
          viewportRect.bottom - bottomOffset))
          {
            // 4. Elements under viewport are resized immediately, but only if
            // an element's boundary is not changed above the viewport after
            // resize.
            resize = true;
          } else if (
          viewportRect.top > 1 &&
          bottomDisplacedBoundary <= viewportRect.top + topOffset)
          {
            // 5. Elements above the viewport can only be resized if we are able
            // to compensate the height change by setting scrollTop and only if
            // the page has already been scrolled by some amount (1px due to iOS).
            // Otherwise the scrolling might move important things like the menu
            // bar out of the viewport at initial page load.
            if (
            heightDiff < 0 &&
            viewportRect.top + aboveVpHeightChange < -heightDiff)
            {
              // Do nothing if height abobe viewport height can't compensate
              // height decrease
              return "continue";
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
              _this6.requestsChangeSize_.push(request);
            }
            return "continue";
          } else if (_this6.elementNearBottom_(resource, box)) {
            // 6. Elements close to the bottom of the document (not viewport)
            // are resized immediately.
            resize = true;
          } else if (
          heightDiff < 0 ||
          topMarginDiff < 0 ||
          bottomMarginDiff < 0)
          {
            // 7. The new height (or one of the margins) is smaller than the
            // current one.
          } else if (request.newHeight == box.height) {
            // 8. Element is in viewport, but this is a width-only expansion.
            // Check whether this should be reflow-free, in which case,
            // schedule a size change.
            _this6.vsync_.run(
            {
              measure: function measure(state) {
                state.resize = false;
                var parent = resource.element.parentElement;
                if (!parent) {
                  return;
                }

                // If the element has siblings, it's possible that a width-expansion will
                // cause some of them to be pushed down.
                var parentWidth =
                (parent.getLayoutSize && parent.getLayoutSize().width) ||
                parent. /*OK*/offsetWidth;
                var cumulativeWidth = widthDiff;
                for (var _i = 0; _i < parent.childElementCount; _i++) {
                  cumulativeWidth += parent.children[_i]. /*OK*/offsetWidth;
                  if (cumulativeWidth > parentWidth) {
                    return;
                  }
                }
                state.resize = true;
              },
              mutate: function mutate(state) {
                if (state.resize) {
                  request.resource.changeSize(
                  request.newHeight,
                  request.newWidth,
                  newMargins);

                }
                request.resource.overflowCallback(
                /* overflown */!state.resize,
                request.newHeight,
                request.newWidth,
                newMargins);

              } },

            {});

          } else {
            // 9. Element is in viewport don't resize and try overflow callback
            // instead.
            request.resource.overflowCallback(
            /* overflown */true,
            request.newHeight,
            request.newWidth,
            newMargins);

          }

          if (resize) {
            if (box.top >= 0) {
              minTop = minTop == -1 ? box.top : Math.min(minTop, box.top);
            }
            request.resource.changeSize(
            request.newHeight,
            request.newWidth,
            newMargins);

            request.resource.overflowCallback(
            /* overflown */false,
            request.newHeight,
            request.newWidth,
            newMargins);

            _this6.maybeChangeHeight_ = true;
          }

          if (request.callback) {
            request.callback( /* hasSizeChanged */resize);
          }};for (var i = 0; i < requestsChangeSize.length; i++) {var _ret = _loop(i);if (_ret === "continue") continue;
        }

        if (minTop != -1) {
          this.setRelayoutTop(minTop);
        }

        // Execute scroll-adjusting resize requests, if any.
        if (scrollAdjSet.length > 0) {
          this.vsync_.run(
          {
            measure: function measure(state) {
              state. /*OK*/scrollHeight =
              _this6.viewport_. /*OK*/getScrollHeight();
              state. /*OK*/scrollTop = _this6.viewport_. /*OK*/getScrollTop();
            },
            mutate: function mutate(state) {
              var minTop = -1;
              scrollAdjSet.forEach(function (request) {
                var box = request.resource.getLayoutBox();
                minTop = minTop == -1 ? box.top : Math.min(minTop, box.top);
                request.resource.changeSize(
                request.newHeight,
                request.newWidth,
                request.marginChange ?
                request.marginChange.newMargins :
                undefined);

                if (request.callback) {
                  request.callback( /* hasSizeChanged */true);
                }
              });
              if (minTop != -1) {
                _this6.setRelayoutTop(minTop);
              }
              // Sync is necessary here to avoid UI jump in the next frame.
              var newScrollHeight = _this6.viewport_. /*OK*/getScrollHeight();
              if (newScrollHeight != state. /*OK*/scrollHeight) {
                _this6.viewport_.setScrollTop(
                state. /*OK*/scrollTop + (
                newScrollHeight - state. /*OK*/scrollHeight));

              }
              _this6.maybeChangeHeight_ = true;
            } },

          {});

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
     */ }, { key: "elementNearBottom_", value:
    function elementNearBottom_(resource, opt_layoutBox, opt_initialLayoutBox) {
      var contentHeight = this.viewport_.getContentHeight();
      var threshold = Math.max(contentHeight * 0.85, contentHeight - 1000);

      var box = opt_layoutBox || resource.getLayoutBox();
      var initialBox = opt_initialLayoutBox || resource.getInitialLayoutBox();
      return box.bottom >= threshold || initialBox.bottom >= threshold;
    }

    /**
     * Always returns true unless the resource was previously displayed but is
     * not displayed now (i.e. the resource should be unloaded).
     * @param {!Resource} r
     * @return {boolean}
     * @private
     */ }, { key: "measureResource_", value:
    function measureResource_(r) {
      var wasDisplayed = r.isDisplayed();
      r.measure();
      return !(wasDisplayed && !r.isDisplayed());
    }

    /**
     * Unloads given resources in an async mutate phase.
     * @param {!Array<!Resource>} resources
     * @private
     */ }, { key: "unloadResources_", value:
    function unloadResources_(resources) {var _this7 = this;
      if (resources.length) {
        this.vsync_.mutate(function () {
          resources.forEach(function (r) {
            r.unload();
            _this7.cleanupTasks_(r);
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
     */ }, { key: "discoverWork_", value:
    function discoverWork_() {
      // TODO(dvoytenko): vsync separation may be needed for different phases

      var now = this.win.Date.now();

      // Ensure all resources layout phase complete; when relayoutAll is requested
      // force re-layout.
      var
      elementsThatScrolled =


      this.elementsThatScrolled_,relayoutAll = this.relayoutAll_,relayoutTop = this.relayoutTop_;
      this.relayoutAll_ = false;
      this.relayoutTop_ = -1;

      // Phase 1: Build and relayout as needed. All mutations happen here.
      var relayoutCount = 0;
      var remeasureCount = 0;
      for (var i = 0; i < this.resources_.length; i++) {
        var r = this.resources_[i];
        if (
        r.getState() == ResourceState.NOT_BUILT &&
        !r.isBuilding() &&
        !r.element.R1())
        {
          this.buildOrScheduleBuildForResource_(r, /* checkForDupes */true);
        }

        if (
        relayoutAll ||
        !r.hasBeenMeasured() ||
        // NOT_LAID_OUT is the state after build() but before measure().
        r.getState() == ResourceState.NOT_LAID_OUT)
        {
          relayoutCount++;
        }
        if (r.isMeasureRequested()) {
          remeasureCount++;
        }
      }

      // Phase 2: Remeasure if there were any relayouts. Unfortunately, currently
      // there's no way to optimize this. All reads happen here.
      var toUnload;
      if (
      relayoutCount > 0 ||
      remeasureCount > 0 ||
      relayoutAll ||
      relayoutTop != -1 ||
      elementsThatScrolled.length > 0)
      {
        for (var _i2 = 0; _i2 < this.resources_.length; _i2++) {
          var _r = this.resources_[_i2];
          if ((_r.hasOwner() && !_r.isMeasureRequested()) || _r.element.R1()) {
            // If element has owner, and measure is not requested, do nothing.
            continue;
          }
          var needsMeasure =
          relayoutAll ||
          _r.getState() == ResourceState.NOT_LAID_OUT ||
          !_r.hasBeenMeasured() ||
          _r.isMeasureRequested() || (
          relayoutTop != -1 && _r.getLayoutBox().bottom >= relayoutTop);

          if (!needsMeasure) {
            for (var _i3 = 0; _i3 < elementsThatScrolled.length; _i3++) {
              // TODO(jridgewell): Need to figure out how ShadowRoots and FIEs
              // should behave in this model. If the ShadowRoot's host scrolls,
              // do we need to invalidate inside the shadow or light tree? Or if
              // the FIE's iframe parent scrolls, do we?
              if (elementsThatScrolled[_i3].contains(_r.element)) {
                needsMeasure = true;
                break;
              }
            }
          }

          if (needsMeasure) {
            var isDisplayed = this.measureResource_(_r);
            if (!isDisplayed) {
              if (!toUnload) {
                toUnload = [];
              }
              toUnload.push(_r);
            }
          }
        }
      }
      elementsThatScrolled.length = 0;

      // Unload all in one cycle.
      if (toUnload) {
        this.unloadResources_(toUnload);
      }

      var viewportRect = this.viewport_.getRect();
      // Load viewport = viewport + 3x up/down when document is visible.
      var loadRect;
      if (this.visible_) {
        loadRect = expandLayoutRect(viewportRect, 0.25, 2);
      } else {
        loadRect = viewportRect;
      }

      var visibleRect = this.visible_ ?
      // When the doc is visible, consider the viewport to be 25% larger,
      // to minimize effect from small scrolling and notify things that
      // they are in viewport just before they are actually visible.
      expandLayoutRect(viewportRect, 0.25, 0.25) :
      viewportRect;

      // Phase 3: Set inViewport status for resources.
      for (var _i4 = 0; _i4 < this.resources_.length; _i4++) {
        var _r2 = this.resources_[_i4];
        if (
        _r2.getState() == ResourceState.NOT_BUILT ||
        _r2.hasOwner() ||
        _r2.element.R1())
        {
          continue;
        }
        // Note that when the document is not visible, neither are any of its
        // elements to reduce CPU cycles.
        // TODO(dvoytenko, #3434): Reimplement the use of `isFixed` with
        // layers. This is currently a short-term fix to the problem that
        // the fixed elements get incorrect top coord.
        var shouldBeInViewport =
        this.visible_ && _r2.isDisplayed() && _r2.overlaps(visibleRect);
        _r2.setInViewport(shouldBeInViewport);
      }

      // Phase 4: Schedule elements for layout within a reasonable distance from
      // current viewport.
      if (loadRect) {
        for (var _i5 = 0; _i5 < this.resources_.length; _i5++) {
          var _r3 = this.resources_[_i5];
          // TODO(dvoytenko): This extra build has to be merged with the
          // scheduleLayoutOrPreload method below.
          // Build all resources visible, measured, and in the viewport.
          if (
          !_r3.isBuilt() &&
          !_r3.isBuilding() &&
          !_r3.hasOwner() &&
          !_r3.element.R1() &&
          _r3.hasBeenMeasured() &&
          _r3.isDisplayed() &&
          _r3.overlaps(loadRect))
          {
            this.buildOrScheduleBuildForResource_(
            _r3,
            /* checkForDupes */true,
            /* ignoreQuota */true);

          }
          if (_r3.getState() != ResourceState.READY_FOR_LAYOUT || _r3.hasOwner()) {
            continue;
          }
          // TODO(dvoytenko, #3434): Reimplement the use of `isFixed` with
          // layers. This is currently a short-term fix to the problem that
          // the fixed elements get incorrect top coord.
          if (_r3.isDisplayed() && _r3.overlaps(loadRect)) {
            this.scheduleLayoutOrPreload(_r3, /* layout */true);
          }
        }
      }

      if (this.visible_ && this.isIdle_(now)) {
        // Phase 5: Idle Render Outside Viewport layout: layout up to 4 items
        // with idleRenderOutsideViewport true
        var idleScheduledCount = 0;
        for (
        var _i6 = 0;
        _i6 < this.resources_.length && idleScheduledCount < 4;
        _i6++)
        {
          var _r4 = this.resources_[_i6];
          if (
          _r4.getState() == ResourceState.READY_FOR_LAYOUT &&
          !_r4.hasOwner() &&
          !_r4.element.R1() &&
          _r4.isDisplayed() &&
          _r4.idleRenderOutsideViewport())
          {
            dev().fine(TAG_, 'idleRenderOutsideViewport layout:', _r4.debugid);
            this.scheduleLayoutOrPreload(_r4, /* layout */false);
            idleScheduledCount++;
          }
        }
        // Phase 6: Idle layout: layout more if we are otherwise not doing much.
        // TODO(dvoytenko): document/estimate IDLE timeouts and other constants
        for (
        var _i7 = 0;
        _i7 < this.resources_.length && idleScheduledCount < 4;
        _i7++)
        {
          var _r5 = this.resources_[_i7];
          if (
          _r5.getState() == ResourceState.READY_FOR_LAYOUT &&
          !_r5.hasOwner() &&
          !_r5.element.R1() &&
          _r5.isDisplayed())
          {
            dev().fine(TAG_, 'idle layout:', _r5.debugid);
            this.scheduleLayoutOrPreload(_r5, /* layout */false);
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
     */ }, { key: "isIdle_", value:
    function isIdle_() {var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();
      var lastDequeueTime = this.exec_.getLastDequeueTime();
      return (
      this.exec_.getSize() == 0 &&
      this.queue_.getSize() == 0 &&
      now > lastDequeueTime + 5000 &&
      lastDequeueTime > 0);

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
     */ }, { key: "work_", value:
    function work_() {
      var now = this.win.Date.now();

      var timeout = -1;
      var task = this.queue_.peek(this.boundTaskScorer_);
      while (task) {
        timeout = this.calcTaskTimeout_(task);
        dev().fine(
        TAG_,
        'peek from queue:',
        task.id,
        'sched at',
        task.scheduleTime,
        'score',
        this.boundTaskScorer_(task),
        'timeout',
        timeout);

        if (timeout > 16) {
          break;
        }

        this.queue_.dequeue(task);

        // Do not override a task in execution. This task will have to wait
        // until the current one finished the execution.
        var executing = this.exec_.getTaskById(task.id);
        if (executing) {
          // Reschedule post execution.
          var reschedule = this.reschedule_.bind(this, task);
          executing.promise.then(reschedule, reschedule);
        } else {
          var _task = task,resource = _task.resource;

          var stillDisplayed = true;
          // Remeasure can only update isDisplayed(), not in-viewport state.
          resource.measure();

          // Check if the element has exited the viewport or the page has changed
          // visibility since the layout was scheduled.
          if (
          stillDisplayed &&
          this.isLayoutAllowed_(resource, task.forceOutsideViewport))
          {
            task.promise = task.callback();
            task.startTime = now;
            dev().fine(TAG_, 'exec:', task.id, 'at', task.startTime);
            this.exec_.enqueue(task);
            task.promise.
            then(
            this.taskComplete_.bind(this, task, true),
            this.taskComplete_.bind(this, task, false)).

            catch( /** @type {function (*)} */(reportError));
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
      this.exec_.getSize());


      if (timeout >= 0) {
        // Still tasks in the queue, but we took too much time.
        // Schedule the next work pass.
        return timeout;
      }

      // No tasks left in the queue.
      // Schedule the next idle pass.
      var nextPassDelay = (now - this.exec_.getLastDequeueTime()) * 2;
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
     */ }, { key: "calcTaskScore_", value:
    function calcTaskScore_(task) {
      // TODO(jridgewell): these should be taking into account the active
      // scroller, which may not be the root scroller. Maybe a weighted average
      // of "scroller scrolls necessary" to see the element.
      // Demo at https://output.jsbin.com/hicigom/quiet
      var viewport = this.viewport_.getRect();
      var box = task.resource.getLayoutBox();
      var posPriority = Math.floor((box.top - viewport.top) / viewport.height);
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
     */ }, { key: "calcTaskTimeout_", value:
    function calcTaskTimeout_(task) {
      var now = this.win.Date.now();

      if (this.exec_.getSize() == 0) {
        // If we've never been visible, return 0. This follows the previous
        // behavior of not delaying tasks when there's nothing to do.
        if (this.firstVisibleTime_ === -1) {
          return 0;
        }

        // Scale off the first visible time, so penalized tasks must wait a
        // second or two to run. After we have been visible for a time, we no
        // longer have to wait.
        var penalty = task.priority * PRIORITY_PENALTY_TIME_;
        return Math.max(penalty - (now - this.firstVisibleTime_), 0);
      }

      var timeout = 0;
      this.exec_.forEach(function (other) {
        // Higher priority tasks get the head start. Currently 500ms per a drop
        // in priority (note that priority is 10-based).
        var penalty = Math.max(
        (task.priority - other.priority) * PRIORITY_PENALTY_TIME_,
        0);

        // TODO(dvoytenko): Consider running total and not maximum.
        timeout = Math.max(timeout, penalty - (now - other.startTime));
      });

      return timeout;
    }

    /**
     * @param {!./task-queue.TaskDef} task
     * @private
     */ }, { key: "reschedule_", value:
    function reschedule_(task) {
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
     */ }, { key: "taskComplete_", value:
    function taskComplete_(task, success, opt_reason) {
      this.exec_.dequeue(task);
      this.schedulePass(POST_TASK_PASS_DELAY_);
      if (!success) {
        dev().info(
        TAG_,
        'task failed:',
        task.id,
        task.resource.debugid,
        opt_reason);

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
     */ }, { key: "isLayoutAllowed_", value:
    function isLayoutAllowed_(resource, forceOutsideViewport) {
      // Only built and displayed elements can be loaded.
      if (
      resource.getState() == ResourceState.NOT_BUILT ||
      !resource.isDisplayed())
      {
        return false;
      }

      // Don't schedule elements when we're not visible, or in prerender mode
      // (and they can't prerender).
      if (!this.visible_) {
        if (
        this.ampdoc.getVisibilityState() != VisibilityState.PRERENDER ||
        !resource.prerenderAllowed())
        {
          return false;
        }
      }

      // The element has to be in its rendering corridor.
      if (
      !forceOutsideViewport &&
      !resource.isInViewport() &&
      !resource.renderOutsideViewport() &&
      !resource.idleRenderOutsideViewport())
      {
        return false;
      }

      return true;
    }

    /** @override */ }, { key: "scheduleLayoutOrPreload", value:
    function scheduleLayoutOrPreload(
    resource,
    layout,
    opt_parentPriority,
    opt_forceOutsideViewport)
    {
      if (resource.element.R1()) {
        return;
      }
      var isBuilt = resource.getState() != ResourceState.NOT_BUILT;
      var isDisplayed = resource.isDisplayed();
      if (!isBuilt || !isDisplayed) {
        devAssert(
        false);




      }
      var forceOutsideViewport = opt_forceOutsideViewport || false;
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
        resource.startLayout.bind(resource));

      } else {
        this.schedule_(
        resource,
        PRELOAD_TASK_ID_,
        PRELOAD_TASK_OFFSET_,
        opt_parentPriority || 0,
        forceOutsideViewport,
        resource.startLayout.bind(resource));

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
     */ }, { key: "schedule_", value:
    function schedule_(
    resource,
    localId,
    priorityOffset,
    parentPriority,
    forceOutsideViewport,
    callback)
    {
      var taskId = resource.getTaskId(localId);

      var task = {
        id: taskId,
        resource: resource,
        priority:
        Math.max(resource.getLayoutPriority(), parentPriority) + priorityOffset,
        forceOutsideViewport: forceOutsideViewport,
        callback: callback,
        scheduleTime: this.win.Date.now(),
        startTime: 0,
        promise: null };

      dev().fine(TAG_, 'schedule:', task.id, 'at', task.scheduleTime);

      // Only schedule a new task if there's no one enqueued yet or if this task
      // has a higher priority.
      var queued = this.queue_.getTaskById(taskId);
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
     * @return {!Promise} when first pass executed.
     */ }, { key: "whenFirstPass", value:
    function whenFirstPass() {
      return this.firstPassDone_.promise;
    }

    /**
     * Calls iterator on each sub-resource
     * @param {!FiniteStateMachine<!VisibilityState>} vsm
     */ }, { key: "setupVisibilityStateMachine_", value:
    function setupVisibilityStateMachine_(vsm) {var _this8 = this;
      var
      hidden =




      VisibilityState.HIDDEN,inactive = VisibilityState.INACTIVE,paused = VisibilityState.PAUSED,prerender = VisibilityState.PRERENDER,visible = VisibilityState.VISIBLE;
      var doWork = function doWork() {
        // If viewport size is 0, the manager will wait for the resize event.
        var viewportSize = _this8.viewport_.getSize();
        if (viewportSize.height > 0 && viewportSize.width > 0) {
          // 1. Handle all size-change requests. 1x mutate (+1 vsync measure/mutate for above-fold resizes).
          if (_this8.hasMutateWork_()) {
            _this8.mutateWork_();
          }
          // 2. Build/measure/in-viewport/schedule layouts. 1x mutate & measure.
          _this8.discoverWork_();
          // 3. Execute scheduled layouts and preloads. 1x mutate.
          var delay = _this8.work_();
          // 4. Deferred size-change requests (waiting for scrolling to stop) will shorten delay until next pass.
          if (_this8.hasMutateWork_()) {
            // Overflow mutate work.
            delay = Math.min(delay, MUTATE_DEFER_DELAY_);
          }
          if (_this8.visible_) {
            if (_this8.schedulePass(delay)) {
              dev().fine(TAG_, 'next pass:', delay);
            } else {
              dev().fine(TAG_, 'pass already scheduled');
            }
          } else {
            dev().fine(TAG_, 'document is not visible: no scheduling');
          }
          _this8.firstPassDone_.resolve();
        }
      };
      var noop = function noop() {};
      var pause = function pause() {
        _this8.resources_.forEach(function (r) {return r.pause();});
      };
      var unload = function unload() {
        _this8.resources_.forEach(function (r) {
          r.unload();
          _this8.cleanupTasks_(r);
        });
        _this8.unselectText_();
      };
      var resume = function resume() {
        _this8.resources_.forEach(function (r) {return r.resume();});
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
     */ }, { key: "unselectText_", value:
    function unselectText_() {
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
     */ }, { key: "cleanupTasks_", value:
    function cleanupTasks_(resource, opt_removePending) {
      if (
      resource.getState() == ResourceState.NOT_LAID_OUT ||
      resource.getState() == ResourceState.READY_FOR_LAYOUT)
      {
        // If the layout promise for this resource has not resolved yet, remove
        // it from the task queues to make sure this resource can be rescheduled
        // for layout again later on.
        // TODO(mkhatib): Think about how this might affect preload tasks once the
        // prerender change is in.
        this.queue_.purge(function (task) {
          return task.resource == resource;
        });
        this.exec_.purge(function (task) {
          return task.resource == resource;
        });
        remove(this.requestsChangeSize_, function (request) {
          return request.resource === resource;
        });
      }

      if (
      resource.getState() == ResourceState.NOT_BUILT &&
      opt_removePending &&
      this.pendingBuildResources_)
      {
        var pendingIndex = this.pendingBuildResources_.indexOf(resource);
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
     */ }, { key: "scrolled_", value:
    function scrolled_(event) {
      var target = event.target;
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

      var scrolled = /** @type {!Element} */(target);
      if (!this.elementsThatScrolled_.includes(scrolled)) {
        this.elementsThatScrolled_.push(scrolled);
        this.schedulePass(FOUR_FRAME_DELAY_);
      }
    } }]);return ResourcesImpl;}();


/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   height: (number|undefined),
 *   width: (number|undefined),
 *   margins: (!../layout-rect.LayoutMarginsChangeDef|undefined)
 * }}
 */
export var SizeDef;

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installResourcesServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'resources', ResourcesImpl);
}
// /Users/mszylkowski/src/amphtml/src/service/resources-impl.js