function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
var FOCUS_HISTORY_TIMEOUT_ = 1000 * 60;
// 1min
var FOUR_FRAME_DELAY_ = 70;

/**
 * @implements {ResourcesInterface}
 */
export var ResourcesImpl = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function ResourcesImpl(ampdoc) {
    var _this = this;

    _classCallCheck(this, ResourcesImpl);

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
    this.pass_ = new Pass(this.win, function () {
      return _this.doPass();
    });

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
    this.vsync_ = Services.
    /*OK*/
    vsyncFor(this.win);

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
    this.visibilityStateMachine_ = new FiniteStateMachine(this.ampdoc.getVisibilityState());
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
    this.throttledScroll_ = throttle(this.win, function (e) {
      return _this.scrolled_(e);
    }, 250);
    listen(this.win.document, 'scroll', this.throttledScroll_, {
      capture: true,
      passive: true
    });
  }

  /** @private */
  _createClass(ResourcesImpl, [{
    key: "rebuildDomWhenReady_",
    value: function rebuildDomWhenReady_() {
      var _this2 = this;

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

        var remeasure = function remeasure() {
          return _this2.remeasurePass_.schedule();
        };

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
        Promise.race([loadPromise(_this2.win), Services.timerFor(_this2.win).promise(3100)]).then(remeasure);

        // Remeasure the document when all fonts loaded.
        if (_this2.win.document.fonts && _this2.win.document.fonts.status != 'loaded') {
          _this2.win.document.fonts.ready.then(remeasure);
        }
      });
    }
    /** @override */

  }, {
    key: "get",
    value: function get() {
      return this.resources_.slice(0);
    }
    /** @override */

  }, {
    key: "getAmpdoc",
    value: function getAmpdoc() {
      return this.ampdoc;
    }
    /** @override */

  }, {
    key: "getResourceForElement",
    value: function getResourceForElement(element) {
      return Resource.forElement(element);
    }
    /** @override */

  }, {
    key: "getResourceForElementOptional",
    value: function getResourceForElementOptional(element) {
      return Resource.forElementOptional(element);
    }
    /** @override */

  }, {
    key: "getScrollDirection",
    value: function getScrollDirection() {
      return Math.sign(this.lastVelocity_) || 1;
    }
    /** @override */

  }, {
    key: "add",
    value: function add(element) {
      // Ensure the viewport is ready to accept the first element.
      this.addCount_++;

      if (this.addCount_ == 1) {
        this.viewport_.ensureReadyForElements();
      }

      // First check if the resource is being reparented and if it requires
      // reconstruction. Only already built elements are eligible.
      var resource = Resource.forElementOptional(element);

      if (resource && resource.getState() != ResourceState.NOT_BUILT && !element.reconstructWhenReparented()) {
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
     */

  }, {
    key: "isUnderBuildQuota_",
    value: function isUnderBuildQuota_() {
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

  }, {
    key: "buildOrScheduleBuildForResource_",
    value: function buildOrScheduleBuildForResource_(resource, checkForDupes, ignoreQuota) {
      if (checkForDupes === void 0) {
        checkForDupes = false;
      }

      if (ignoreQuota === void 0) {
        ignoreQuota = false;
      }

      var buildingEnabled = this.isRuntimeOn_ || this.isBuildOn_;

      if (!buildingEnabled) {
        return;
      }

      // During prerender mode, don't build elements that aren't allowed to be
      // prerendered. This avoids wasting our prerender build quota.
      // See isUnderBuildQuota_() for more details.
      var shouldBuildResource = this.ampdoc.getVisibilityState() != VisibilityState.PRERENDER || resource.prerenderAllowed();

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
     */

  }, {
    key: "buildReadyResources_",
    value: function buildReadyResources_() {
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

  }, {
    key: "buildReadyResourcesUnsafe_",
    value: function buildReadyResourcesUnsafe_() {
      // This will loop over all current pending resources and those that
      // get added by other resources build-cycle, this will make sure all
      // elements get a chance to be built.
      for (var i = 0; i < this.pendingBuildResources_.length; i++) {
        var resource = this.pendingBuildResources_[i];

        if (this.documentReady_ || hasNextNodeInDocumentOrder(resource.element, this.ampdoc.getRootNode())) {
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

  }, {
    key: "buildResourceUnsafe_",
    value: function buildResourceUnsafe_(resource, ignoreQuota) {
      var _this3 = this;

      if (ignoreQuota === void 0) {
        ignoreQuota = false;
      }

      if (!ignoreQuota && !this.isUnderBuildQuota_() && // Special case: amp-experiment is allowed to bypass prerender build quota.
      !resource.isBuildRenderBlocking()) {
        return null;
      }

      var promise = resource.build();

      if (!promise) {
        return null;
      }

      dev().fine(TAG_, 'build resource:', resource.debugid);
      this.buildAttemptsCount_++;
      this.buildsThisPass_++;
      return promise.then(function () {
        return _this3.schedulePass();
      }, function (error) {
        // Build failed: remove the resource. No other state changes are
        // needed.
        _this3.removeResource_(resource);

        if (!isBlockedByConsent(error)) {
          throw error;
        }
      });
    }
    /** @override */

  }, {
    key: "remove",
    value: function remove(element) {
      var resource = Resource.forElementOptional(element);

      if (!resource) {
        return;
      }

      this.removeResource_(resource);
    }
    /**
     * @param {!Resource} resource
     * @private
     */

  }, {
    key: "removeResource_",
    value: function removeResource_(resource) {
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

      this.cleanupTasks_(resource,
      /* opt_removePending */
      true);
      dev().fine(TAG_, 'resource removed:', resource.debugid);
    }
    /** @override */

  }, {
    key: "upgraded",
    value: function upgraded(element) {
      var resource = Resource.forElement(element);
      this.buildOrScheduleBuildForResource_(resource);
      dev().fine(TAG_, 'resource upgraded:', resource.debugid);
    }
    /** @override */

  }, {
    key: "updateLayoutPriority",
    value: function updateLayoutPriority(element, newLayoutPriority) {
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
    /** @override */

  }, {
    key: "schedulePass",
    value: function schedulePass(opt_delay) {
      return this.pass_.schedule(opt_delay);
    }
    /** @override */

  }, {
    key: "updateOrEnqueueMutateTask",
    value: function updateOrEnqueueMutateTask(resource, newRequest) {
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
    /** @override */

  }, {
    key: "schedulePassVsync",
    value: function schedulePassVsync() {
      var _this4 = this;

      if (this.vsyncScheduled_) {
        return;
      }

      this.vsyncScheduled_ = true;
      this.vsync_.mutate(function () {
        return _this4.doPass();
      });
    }
    /** @override */

  }, {
    key: "ampInitComplete",
    value: function ampInitComplete() {
      this.ampInitialized_ = true;
      dev().fine(TAG_, 'ampInitComplete');
      this.schedulePass();
    }
    /** @override */

  }, {
    key: "setRelayoutTop",
    value: function setRelayoutTop(relayoutTop) {
      if (this.relayoutTop_ == -1) {
        this.relayoutTop_ = relayoutTop;
      } else {
        this.relayoutTop_ = Math.min(relayoutTop, this.relayoutTop_);
      }
    }
    /** @override */

  }, {
    key: "maybeHeightChanged",
    value: function maybeHeightChanged() {
      this.maybeChangeHeight_ = true;
    }
    /** @override */

  }, {
    key: "onNextPass",
    value: function onNextPass(callback) {
      this.passCallbacks_.push(callback);
    }
    /**
     * Runs a pass immediately.
     *
     * @visibleForTesting
     */

  }, {
    key: "doPass",
    value: function doPass() {
      var _this5 = this;

      if (!this.isRuntimeOn_) {
        dev().fine(TAG_, 'runtime is off');
        return;
      }

      this.visible_ = this.ampdoc.isVisible();
      this.buildsThisPass_ = 0;
      var firstPassAfterDocumentReady = this.documentReady_ && this.firstPassAfterDocumentReady_ && this.ampInitialized_;

      if (firstPassAfterDocumentReady) {
        var _doc$body$firstElemen;

        this.firstPassAfterDocumentReady_ = false;
        var doc = this.win.document;
        var documentInfo = Services.documentInfoForDoc(this.ampdoc);
        // TODO(choumx, #26687): Update viewers to read data.viewport instead of
        // data.metaTags.viewport from 'documentLoaded' message.
        this.viewer_.sendMessage('documentLoaded', dict({
          'title': doc.title,
          'sourceUrl': getSourceUrl(this.ampdoc.getUrl()),
          'isStory': ((_doc$body$firstElemen = doc.body.firstElementChild) == null ? void 0 : _doc$body$firstElemen.tagName) === 'AMP-STORY',
          'serverLayout': doc.documentElement.hasAttribute('i-amphtml-element'),
          'linkRels': documentInfo.linkRels,
          'metaTags': {
            'viewport': documentInfo.viewport
          }
          /* deprecated */
          ,
          'viewport': documentInfo.viewport
        }),
        /* cancelUnsent */
        true);
        this.contentHeight_ = this.viewport_.getContentHeight();
        this.viewer_.sendMessage('documentHeight', dict({
          'height': this.contentHeight_
        }),
        /* cancelUnsent */
        true);
        dev().fine(TAG_, 'document height on load: %s', this.contentHeight_);
      }

      // Once we know the document is fully parsed, we check to see if every AMP Element has been built
      var firstPassAfterAllBuilt = !this.firstPassAfterDocumentReady_ && this.firstPassAfterAllBuilt_ && this.resources_.every(function (r) {
        return r.getState() != Resource.NOT_BUILT || r.element.R1();
      });

      if (firstPassAfterAllBuilt) {
        this.firstPassAfterAllBuilt_ = false;
        this.maybeChangeHeight_ = true;
      }

      var viewportSize = this.viewport_.getSize();
      dev().fine(TAG_, 'PASS: visible=', this.visible_, ', relayoutAll=', this.relayoutAll_, ', relayoutTop=', this.relayoutTop_, ', viewportSize=', viewportSize.width, viewportSize.height);
      this.pass_.cancel();
      this.vsyncScheduled_ = false;
      this.visibilityStateMachine_.setState(this.ampdoc.getVisibilityState());
      this.signalIfReady_();

      if (this.maybeChangeHeight_) {
        this.maybeChangeHeight_ = false;
        this.vsync_.measure(function () {
          var measuredContentHeight = _this5.viewport_.getContentHeight();

          if (measuredContentHeight != _this5.contentHeight_) {
            _this5.viewer_.sendMessage('documentHeight', dict({
              'height': measuredContentHeight
            }),
            /* cancelUnsent */
            true);

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
     */

  }, {
    key: "signalIfReady_",
    value: function signalIfReady_() {
      if (this.documentReady_ && this.ampInitialized_ && !this.ampdoc.signals().get(READY_SCAN_SIGNAL)) {
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
     */

  }, {
    key: "hasMutateWork_",
    value: function hasMutateWork_() {
      return this.requestsChangeSize_.length > 0;
    }
    /**
     * Performs pre-discovery mutates.
     * @private
     */

  }, {
    key: "mutateWork_",
    value: function mutateWork_() {
      var _this6 = this;

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
      var isScrollingStopped = Math.abs(this.lastVelocity_) < 1e-2 && now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_ || now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_ * 2;

      if (this.requestsChangeSize_.length > 0) {
        dev().fine(TAG_, 'change size requests:', this.requestsChangeSize_.length);
        var requestsChangeSize = this.requestsChangeSize_;
        this.requestsChangeSize_ = [];
        // Find minimum top position and run all mutates.
        var minTop = -1;
        var scrollAdjSet = [];
        var aboveVpHeightChange = 0;

        var _loop = function _loop(i) {
          var request = requestsChangeSize[i];
          var event =
          /** @type {!./resources-interface.ChangeSizeRequestDef} */
          request.event,
              resource =
          /** @type {!./resources-interface.ChangeSizeRequestDef} */
          request.resource;
          var box = resource.getLayoutBox();
          var topMarginDiff = 0;
          var bottomMarginDiff = 0;
          var leftMarginDiff = 0;
          var rightMarginDiff = 0;
          var bottomDisplacedBoundary = box.bottom,
              topUnchangedBoundary = box.top;
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

          if (heightDiff == 0 && topMarginDiff == 0 && bottomMarginDiff == 0 && widthDiff == 0 && leftMarginDiff == 0 && rightMarginDiff == 0) {// 1. Nothing to resize.
          } else if (request.force || !_this6.visible_) {
            // 2. An immediate execution requested or the document is hidden.
            resize = true;
          } else if (_this6.activeHistory_.hasDescendantsOf(resource.element) || event && event.userActivation && event.userActivation.hasBeenActive) {
            // 3. Active elements are immediately resized. The assumption is that
            // the resize is triggered by the user action or soon after.
            resize = true;
          } else if (topUnchangedBoundary >= viewportRect.bottom - bottomOffset || topMarginDiff == 0 && box.bottom + Math.min(heightDiff, 0) >= viewportRect.bottom - bottomOffset) {
            // 4. Elements under viewport are resized immediately, but only if
            // an element's boundary is not changed above the viewport after
            // resize.
            resize = true;
          } else if (viewportRect.top > 1 && bottomDisplacedBoundary <= viewportRect.top + topOffset) {
            // 5. Elements above the viewport can only be resized if we are able
            // to compensate the height change by setting scrollTop and only if
            // the page has already been scrolled by some amount (1px due to iOS).
            // Otherwise the scrolling might move important things like the menu
            // bar out of the viewport at initial page load.
            if (heightDiff < 0 && viewportRect.top + aboveVpHeightChange < -heightDiff) {
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
          } else if (heightDiff < 0 || topMarginDiff < 0 || bottomMarginDiff < 0) {// 7. The new height (or one of the margins) is smaller than the
            // current one.
          } else if (request.newHeight == box.height) {
            // 8. Element is in viewport, but this is a width-only expansion.
            // Check whether this should be reflow-free, in which case,
            // schedule a size change.
            _this6.vsync_.run({
              measure: function measure(state) {
                state.resize = false;
                var parent = resource.element.parentElement;

                if (!parent) {
                  return;
                }

                // If the element has siblings, it's possible that a width-expansion will
                // cause some of them to be pushed down.
                var parentWidth = parent.getLayoutSize && parent.getLayoutSize().width || parent.
                /*OK*/
                offsetWidth;
                var cumulativeWidth = widthDiff;

                for (var _i = 0; _i < parent.childElementCount; _i++) {
                  cumulativeWidth += parent.children[_i].
                  /*OK*/
                  offsetWidth;

                  if (cumulativeWidth > parentWidth) {
                    return;
                  }
                }

                state.resize = true;
              },
              mutate: function mutate(state) {
                if (state.resize) {
                  request.resource.changeSize(request.newHeight, request.newWidth, newMargins);
                }

                request.resource.overflowCallback(
                /* overflown */
                !state.resize, request.newHeight, request.newWidth, newMargins);
              }
            }, {});
          } else {
            // 9. Element is in viewport don't resize and try overflow callback
            // instead.
            request.resource.overflowCallback(
            /* overflown */
            true, request.newHeight, request.newWidth, newMargins);
          }

          if (resize) {
            if (box.top >= 0) {
              minTop = minTop == -1 ? box.top : Math.min(minTop, box.top);
            }

            request.resource.changeSize(request.newHeight, request.newWidth, newMargins);
            request.resource.overflowCallback(
            /* overflown */
            false, request.newHeight, request.newWidth, newMargins);
            _this6.maybeChangeHeight_ = true;
          }

          if (request.callback) {
            request.callback(
            /* hasSizeChanged */
            resize);
          }
        };

        for (var i = 0; i < requestsChangeSize.length; i++) {
          var _ret = _loop(i);

          if (_ret === "continue") continue;
        }

        if (minTop != -1) {
          this.setRelayoutTop(minTop);
        }

        // Execute scroll-adjusting resize requests, if any.
        if (scrollAdjSet.length > 0) {
          this.vsync_.run({
            measure: function measure(state) {
              state.
              /*OK*/
              scrollHeight = _this6.viewport_.
              /*OK*/
              getScrollHeight();
              state.
              /*OK*/
              scrollTop = _this6.viewport_.
              /*OK*/
              getScrollTop();
            },
            mutate: function mutate(state) {
              var minTop = -1;
              scrollAdjSet.forEach(function (request) {
                var box = request.resource.getLayoutBox();
                minTop = minTop == -1 ? box.top : Math.min(minTop, box.top);
                request.resource.changeSize(request.newHeight, request.newWidth, request.marginChange ? request.marginChange.newMargins : undefined);

                if (request.callback) {
                  request.callback(
                  /* hasSizeChanged */
                  true);
                }
              });

              if (minTop != -1) {
                _this6.setRelayoutTop(minTop);
              }

              // Sync is necessary here to avoid UI jump in the next frame.
              var newScrollHeight = _this6.viewport_.
              /*OK*/
              getScrollHeight();

              if (newScrollHeight != state.
              /*OK*/
              scrollHeight) {
                _this6.viewport_.setScrollTop(state.
                /*OK*/
                scrollTop + (newScrollHeight - state.
                /*OK*/
                scrollHeight));
              }

              _this6.maybeChangeHeight_ = true;
            }
          }, {});
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

  }, {
    key: "elementNearBottom_",
    value: function elementNearBottom_(resource, opt_layoutBox, opt_initialLayoutBox) {
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
     */

  }, {
    key: "measureResource_",
    value: function measureResource_(r) {
      var wasDisplayed = r.isDisplayed();
      r.measure();
      return !(wasDisplayed && !r.isDisplayed());
    }
    /**
     * Unloads given resources in an async mutate phase.
     * @param {!Array<!Resource>} resources
     * @private
     */

  }, {
    key: "unloadResources_",
    value: function unloadResources_(resources) {
      var _this7 = this;

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
     */

  }, {
    key: "discoverWork_",
    value: function discoverWork_() {
      // TODO(dvoytenko): vsync separation may be needed for different phases
      var now = this.win.Date.now();
      // Ensure all resources layout phase complete; when relayoutAll is requested
      // force re-layout.
      var elementsThatScrolled = this.elementsThatScrolled_,
          relayoutAll = this.relayoutAll_,
          relayoutTop = this.relayoutTop_;
      this.relayoutAll_ = false;
      this.relayoutTop_ = -1;
      // Phase 1: Build and relayout as needed. All mutations happen here.
      var relayoutCount = 0;
      var remeasureCount = 0;

      for (var i = 0; i < this.resources_.length; i++) {
        var r = this.resources_[i];

        if (r.getState() == ResourceState.NOT_BUILT && !r.isBuilding() && !r.element.R1()) {
          this.buildOrScheduleBuildForResource_(r,
          /* checkForDupes */
          true);
        }

        if (relayoutAll || !r.hasBeenMeasured() || // NOT_LAID_OUT is the state after build() but before measure().
        r.getState() == ResourceState.NOT_LAID_OUT) {
          relayoutCount++;
        }

        if (r.isMeasureRequested()) {
          remeasureCount++;
        }
      }

      // Phase 2: Remeasure if there were any relayouts. Unfortunately, currently
      // there's no way to optimize this. All reads happen here.
      var toUnload;

      if (relayoutCount > 0 || remeasureCount > 0 || relayoutAll || relayoutTop != -1 || elementsThatScrolled.length > 0) {
        for (var _i2 = 0; _i2 < this.resources_.length; _i2++) {
          var _r = this.resources_[_i2];

          if (_r.hasOwner() && !_r.isMeasureRequested() || _r.element.R1()) {
            // If element has owner, and measure is not requested, do nothing.
            continue;
          }

          var needsMeasure = relayoutAll || _r.getState() == ResourceState.NOT_LAID_OUT || !_r.hasBeenMeasured() || _r.isMeasureRequested() || relayoutTop != -1 && _r.getLayoutBox().bottom >= relayoutTop;

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

      var visibleRect = this.visible_ ? // When the doc is visible, consider the viewport to be 25% larger,
      // to minimize effect from small scrolling and notify things that
      // they are in viewport just before they are actually visible.
      expandLayoutRect(viewportRect, 0.25, 0.25) : viewportRect;

      // Phase 3: Set inViewport status for resources.
      for (var _i4 = 0; _i4 < this.resources_.length; _i4++) {
        var _r2 = this.resources_[_i4];

        if (_r2.getState() == ResourceState.NOT_BUILT || _r2.hasOwner() || _r2.element.R1()) {
          continue;
        }

        // Note that when the document is not visible, neither are any of its
        // elements to reduce CPU cycles.
        // TODO(dvoytenko, #3434): Reimplement the use of `isFixed` with
        // layers. This is currently a short-term fix to the problem that
        // the fixed elements get incorrect top coord.
        var shouldBeInViewport = this.visible_ && _r2.isDisplayed() && _r2.overlaps(visibleRect);

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
          if (!_r3.isBuilt() && !_r3.isBuilding() && !_r3.hasOwner() && !_r3.element.R1() && _r3.hasBeenMeasured() && _r3.isDisplayed() && _r3.overlaps(loadRect)) {
            this.buildOrScheduleBuildForResource_(_r3,
            /* checkForDupes */
            true,
            /* ignoreQuota */
            true);
          }

          if (_r3.getState() != ResourceState.READY_FOR_LAYOUT || _r3.hasOwner()) {
            continue;
          }

          // TODO(dvoytenko, #3434): Reimplement the use of `isFixed` with
          // layers. This is currently a short-term fix to the problem that
          // the fixed elements get incorrect top coord.
          if (_r3.isDisplayed() && _r3.overlaps(loadRect)) {
            this.scheduleLayoutOrPreload(_r3,
            /* layout */
            true);
          }
        }
      }

      if (this.visible_ && this.isIdle_(now)) {
        // Phase 5: Idle Render Outside Viewport layout: layout up to 4 items
        // with idleRenderOutsideViewport true
        var idleScheduledCount = 0;

        for (var _i6 = 0; _i6 < this.resources_.length && idleScheduledCount < 4; _i6++) {
          var _r4 = this.resources_[_i6];

          if (_r4.getState() == ResourceState.READY_FOR_LAYOUT && !_r4.hasOwner() && !_r4.element.R1() && _r4.isDisplayed() && _r4.idleRenderOutsideViewport()) {
            dev().fine(TAG_, 'idleRenderOutsideViewport layout:', _r4.debugid);
            this.scheduleLayoutOrPreload(_r4,
            /* layout */
            false);
            idleScheduledCount++;
          }
        }

        // Phase 6: Idle layout: layout more if we are otherwise not doing much.
        // TODO(dvoytenko): document/estimate IDLE timeouts and other constants
        for (var _i7 = 0; _i7 < this.resources_.length && idleScheduledCount < 4; _i7++) {
          var _r5 = this.resources_[_i7];

          if (_r5.getState() == ResourceState.READY_FOR_LAYOUT && !_r5.hasOwner() && !_r5.element.R1() && _r5.isDisplayed()) {
            dev().fine(TAG_, 'idle layout:', _r5.debugid);
            this.scheduleLayoutOrPreload(_r5,
            /* layout */
            false);
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

  }, {
    key: "isIdle_",
    value: function isIdle_(now) {
      if (now === void 0) {
        now = Date.now();
      }

      var lastDequeueTime = this.exec_.getLastDequeueTime();
      return this.exec_.getSize() == 0 && this.queue_.getSize() == 0 && now > lastDequeueTime + 5000 && lastDequeueTime > 0;
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

  }, {
    key: "work_",
    value: function work_() {
      var now = this.win.Date.now();
      var timeout = -1;
      var task = this.queue_.peek(this.boundTaskScorer_);

      while (task) {
        timeout = this.calcTaskTimeout_(task);
        dev().fine(TAG_, 'peek from queue:', task.id, 'sched at', task.scheduleTime, 'score', this.boundTaskScorer_(task), 'timeout', timeout);

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
          var _task = task,
              resource = _task.resource;
          var stillDisplayed = true;
          // Remeasure can only update isDisplayed(), not in-viewport state.
          resource.measure();

          // Check if the element has exited the viewport or the page has changed
          // visibility since the layout was scheduled.
          if (stillDisplayed && this.isLayoutAllowed_(resource, task.forceOutsideViewport)) {
            task.promise = task.callback();
            task.startTime = now;
            dev().fine(TAG_, 'exec:', task.id, 'at', task.startTime);
            this.exec_.enqueue(task);
            task.promise.then(this.taskComplete_.bind(this, task, true), this.taskComplete_.bind(this, task, false)).catch(
            /** @type {function (*)} */
            reportError);
          } else {
            dev().fine(TAG_, 'cancelled', task.id);
            resource.layoutCanceled();
          }
        }

        task = this.queue_.peek(this.boundTaskScorer_);
        timeout = -1;
      }

      dev().fine(TAG_, 'queue size:', this.queue_.getSize(), 'exec size:', this.exec_.getSize());

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
     */

  }, {
    key: "calcTaskScore_",
    value: function calcTaskScore_(task) {
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
     */

  }, {
    key: "calcTaskTimeout_",
    value: function calcTaskTimeout_(task) {
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
        var penalty = Math.max((task.priority - other.priority) * PRIORITY_PENALTY_TIME_, 0);
        // TODO(dvoytenko): Consider running total and not maximum.
        timeout = Math.max(timeout, penalty - (now - other.startTime));
      });
      return timeout;
    }
    /**
     * @param {!./task-queue.TaskDef} task
     * @private
     */

  }, {
    key: "reschedule_",
    value: function reschedule_(task) {
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

  }, {
    key: "taskComplete_",
    value: function taskComplete_(task, success, opt_reason) {
      this.exec_.dequeue(task);
      this.schedulePass(POST_TASK_PASS_DELAY_);

      if (!success) {
        dev().info(TAG_, 'task failed:', task.id, task.resource.debugid, opt_reason);
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

  }, {
    key: "isLayoutAllowed_",
    value: function isLayoutAllowed_(resource, forceOutsideViewport) {
      // Only built and displayed elements can be loaded.
      if (resource.getState() == ResourceState.NOT_BUILT || !resource.isDisplayed()) {
        return false;
      }

      // Don't schedule elements when we're not visible, or in prerender mode
      // (and they can't prerender).
      if (!this.visible_) {
        if (this.ampdoc.getVisibilityState() != VisibilityState.PRERENDER || !resource.prerenderAllowed()) {
          return false;
        }
      }

      // The element has to be in its rendering corridor.
      if (!forceOutsideViewport && !resource.isInViewport() && !resource.renderOutsideViewport() && !resource.idleRenderOutsideViewport()) {
        return false;
      }

      return true;
    }
    /** @override */

  }, {
    key: "scheduleLayoutOrPreload",
    value: function scheduleLayoutOrPreload(resource, layout, opt_parentPriority, opt_forceOutsideViewport) {
      if (resource.element.R1()) {
        return;
      }

      var isBuilt = resource.getState() != ResourceState.NOT_BUILT;
      var isDisplayed = resource.isDisplayed();

      if (!isBuilt || !isDisplayed) {
        devAssert(false, 'Not ready for layout: %s (%s)', resource.debugid, resource.getState());
      }

      var forceOutsideViewport = opt_forceOutsideViewport || false;

      if (!this.isLayoutAllowed_(resource, forceOutsideViewport)) {
        return;
      }

      if (layout) {
        this.schedule_(resource, LAYOUT_TASK_ID_, LAYOUT_TASK_OFFSET_, opt_parentPriority || 0, forceOutsideViewport, resource.startLayout.bind(resource));
      } else {
        this.schedule_(resource, PRELOAD_TASK_ID_, PRELOAD_TASK_OFFSET_, opt_parentPriority || 0, forceOutsideViewport, resource.startLayout.bind(resource));
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

  }, {
    key: "schedule_",
    value: function schedule_(resource, localId, priorityOffset, parentPriority, forceOutsideViewport, callback) {
      var taskId = resource.getTaskId(localId);
      var task = {
        id: taskId,
        resource: resource,
        priority: Math.max(resource.getLayoutPriority(), parentPriority) + priorityOffset,
        forceOutsideViewport: forceOutsideViewport,
        callback: callback,
        scheduleTime: this.win.Date.now(),
        startTime: 0,
        promise: null
      };
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
     */

  }, {
    key: "whenFirstPass",
    value: function whenFirstPass() {
      return this.firstPassDone_.promise;
    }
    /**
     * Calls iterator on each sub-resource
     * @param {!FiniteStateMachine<!VisibilityState>} vsm
     */

  }, {
    key: "setupVisibilityStateMachine_",
    value: function setupVisibilityStateMachine_(vsm) {
      var _this8 = this;

      var hidden = VisibilityState.HIDDEN,
          inactive = VisibilityState.INACTIVE,
          paused = VisibilityState.PAUSED,
          prerender = VisibilityState.PRERENDER,
          visible = VisibilityState.VISIBLE;

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
        _this8.resources_.forEach(function (r) {
          return r.pause();
        });
      };

      var unload = function unload() {
        _this8.resources_.forEach(function (r) {
          r.unload();

          _this8.cleanupTasks_(r);
        });

        _this8.unselectText_();
      };

      var resume = function resume() {
        _this8.resources_.forEach(function (r) {
          return r.resume();
        });

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

  }, {
    key: "unselectText_",
    value: function unselectText_() {
      try {
        this.win.getSelection().removeAllRanges();
      } catch (e) {// Selection API not supported.
      }
    }
    /**
     * Cleanup task queues from tasks for elements that has been unloaded.
     * @param {Resource} resource
     * @param {boolean=} opt_removePending Whether to remove from pending
     *     build resources.
     * @private
     */

  }, {
    key: "cleanupTasks_",
    value: function cleanupTasks_(resource, opt_removePending) {
      if (resource.getState() == ResourceState.NOT_LAID_OUT || resource.getState() == ResourceState.READY_FOR_LAYOUT) {
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

      if (resource.getState() == ResourceState.NOT_BUILT && opt_removePending && this.pendingBuildResources_) {
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
     */

  }, {
    key: "scrolled_",
    value: function scrolled_(event) {
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

      var scrolled = dev().assertElement(target);

      if (!this.elementsThatScrolled_.includes(scrolled)) {
        this.elementsThatScrolled_.push(scrolled);
        this.schedulePass(FOUR_FRAME_DELAY_);
      }
    }
  }]);

  return ResourcesImpl;
}();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc291cmNlcy1pbXBsLmpzIl0sIm5hbWVzIjpbIlZpc2liaWxpdHlTdGF0ZSIsIkZpbml0ZVN0YXRlTWFjaGluZSIsIkRlZmVycmVkIiwiaGFzTmV4dE5vZGVJbkRvY3VtZW50T3JkZXIiLCJleHBhbmRMYXlvdXRSZWN0IiwicmVtb3ZlIiwidGhyb3R0bGUiLCJkaWN0IiwiU2VydmljZXMiLCJpZUludHJpbnNpY0NoZWNrQW5kRml4IiwiaWVNZWRpYUNoZWNrQW5kRml4IiwiUmVzb3VyY2UiLCJSZXNvdXJjZVN0YXRlIiwiUkVBRFlfU0NBTl9TSUdOQUwiLCJSZXNvdXJjZXNJbnRlcmZhY2UiLCJUYXNrUXVldWUiLCJzdGFydHVwQ2h1bmsiLCJpc0Jsb2NrZWRCeUNvbnNlbnQiLCJyZXBvcnRFcnJvciIsImxpc3RlbiIsImxvYWRQcm9taXNlIiwiRm9jdXNIaXN0b3J5IiwiZGV2IiwiZGV2QXNzZXJ0IiwiUGFzcyIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJnZXRTb3VyY2VVcmwiLCJUQUdfIiwiTEFZT1VUX1RBU0tfSURfIiwiTEFZT1VUX1RBU0tfT0ZGU0VUXyIsIlBSRUxPQURfVEFTS19JRF8iLCJQUkVMT0FEX1RBU0tfT0ZGU0VUXyIsIlBSSU9SSVRZX0JBU0VfIiwiUFJJT1JJVFlfUEVOQUxUWV9USU1FXyIsIlBPU1RfVEFTS19QQVNTX0RFTEFZXyIsIk1VVEFURV9ERUZFUl9ERUxBWV8iLCJGT0NVU19ISVNUT1JZX1RJTUVPVVRfIiwiRk9VUl9GUkFNRV9ERUxBWV8iLCJSZXNvdXJjZXNJbXBsIiwiYW1wZG9jIiwid2luIiwidmlld2VyXyIsInZpZXdlckZvckRvYyIsImlzUnVudGltZU9uXyIsImlzUnVudGltZU9uIiwiaXNCdWlsZE9uXyIsInJlc291cmNlSWRDb3VudGVyXyIsInJlc291cmNlc18iLCJhZGRDb3VudF8iLCJidWlsZEF0dGVtcHRzQ291bnRfIiwiYnVpbGRzVGhpc1Bhc3NfIiwidmlzaWJsZV8iLCJpc1Zpc2libGUiLCJkb2N1bWVudFJlYWR5XyIsImZpcnN0UGFzc0FmdGVyRG9jdW1lbnRSZWFkeV8iLCJhbXBJbml0aWFsaXplZF8iLCJmaXJzdFZpc2libGVUaW1lXyIsInJlbGF5b3V0QWxsXyIsInJlbGF5b3V0VG9wXyIsImxhc3RTY3JvbGxUaW1lXyIsImxhc3RWZWxvY2l0eV8iLCJwYXNzXyIsImRvUGFzcyIsInJlbWVhc3VyZVBhc3NfIiwic2NoZWR1bGVQYXNzIiwiZXhlY18iLCJxdWV1ZV8iLCJib3VuZFRhc2tTY29yZXJfIiwiY2FsY1Rhc2tTY29yZV8iLCJiaW5kIiwicmVxdWVzdHNDaGFuZ2VTaXplXyIsInBlbmRpbmdCdWlsZFJlc291cmNlc18iLCJpc0N1cnJlbnRseUJ1aWxkaW5nUGVuZGluZ1Jlc291cmNlc18iLCJ2aWV3cG9ydF8iLCJ2aWV3cG9ydEZvckRvYyIsInZzeW5jXyIsInZzeW5jRm9yIiwiYWN0aXZlSGlzdG9yeV8iLCJ2c3luY1NjaGVkdWxlZF8iLCJjb250ZW50SGVpZ2h0XyIsIm1heWJlQ2hhbmdlSGVpZ2h0XyIsInBhc3NDYWxsYmFja3NfIiwiZWxlbWVudHNUaGF0U2Nyb2xsZWRfIiwiZmlyc3RQYXNzRG9uZV8iLCJ2aXNpYmlsaXR5U3RhdGVNYWNoaW5lXyIsImdldFZpc2liaWxpdHlTdGF0ZSIsIm9uQ2hhbmdlZCIsImV2ZW50IiwiRGF0ZSIsIm5vdyIsInZlbG9jaXR5IiwicmVsYXlvdXRBbGwiLCJvblNjcm9sbCIsIm9uVmlzaWJpbGl0eUNoYW5nZWQiLCJvblJ1bnRpbWVTdGF0ZSIsInN0YXRlIiwiZmluZSIsInNldHVwVmlzaWJpbGl0eVN0YXRlTWFjaGluZV8iLCJyZWJ1aWxkRG9tV2hlblJlYWR5XyIsInRocm90dGxlZFNjcm9sbF8iLCJlIiwic2Nyb2xsZWRfIiwiZG9jdW1lbnQiLCJjYXB0dXJlIiwicGFzc2l2ZSIsIndoZW5SZWFkeSIsInRoZW4iLCJidWlsZFJlYWR5UmVzb3VyY2VzXyIsImlucHV0IiwiaW5wdXRGb3IiLCJzZXR1cElucHV0TW9kZUNsYXNzZXMiLCJmaXhQcm9taXNlIiwicmVtZWFzdXJlIiwic2NoZWR1bGUiLCJQcm9taXNlIiwicmFjZSIsInRpbWVyRm9yIiwicHJvbWlzZSIsImZvbnRzIiwic3RhdHVzIiwicmVhZHkiLCJzbGljZSIsImVsZW1lbnQiLCJmb3JFbGVtZW50IiwiZm9yRWxlbWVudE9wdGlvbmFsIiwiTWF0aCIsInNpZ24iLCJlbnN1cmVSZWFkeUZvckVsZW1lbnRzIiwicmVzb3VyY2UiLCJnZXRTdGF0ZSIsIk5PVF9CVUlMVCIsInJlY29uc3RydWN0V2hlblJlcGFyZW50ZWQiLCJyZXF1ZXN0TWVhc3VyZSIsImRlYnVnaWQiLCJwdXNoIiwiaGFzQmVlblZpc2libGUiLCJjaGVja0ZvckR1cGVzIiwiaWdub3JlUXVvdGEiLCJidWlsZGluZ0VuYWJsZWQiLCJzaG91bGRCdWlsZFJlc291cmNlIiwiUFJFUkVOREVSIiwicHJlcmVuZGVyQWxsb3dlZCIsImJ1aWxkUmVzb3VyY2VVbnNhZmVfIiwiaXNCdWlsdCIsImlzQnVpbGRpbmciLCJpbmNsdWRlcyIsImJ1aWxkUmVhZHlSZXNvdXJjZXNVbnNhZmVfIiwiaSIsImxlbmd0aCIsImdldFJvb3ROb2RlIiwic3BsaWNlIiwiaXNVbmRlckJ1aWxkUXVvdGFfIiwiaXNCdWlsZFJlbmRlckJsb2NraW5nIiwiYnVpbGQiLCJlcnJvciIsInJlbW92ZVJlc291cmNlXyIsImluZGV4IiwiaW5kZXhPZiIsInBhdXNlT25SZW1vdmUiLCJMQVlPVVRfU0NIRURVTEVEIiwibGF5b3V0Q2FuY2VsZWQiLCJjbGVhbnVwVGFza3NfIiwiYnVpbGRPclNjaGVkdWxlQnVpbGRGb3JSZXNvdXJjZV8iLCJuZXdMYXlvdXRQcmlvcml0eSIsInVwZGF0ZUxheW91dFByaW9yaXR5IiwiZm9yRWFjaCIsInRhc2siLCJwcmlvcml0eSIsIm9wdF9kZWxheSIsIm5ld1JlcXVlc3QiLCJyZXF1ZXN0IiwibmV3SGVpZ2h0IiwibmV3V2lkdGgiLCJtYXJnaW5DaGFuZ2UiLCJmb3JjZSIsImNhbGxiYWNrIiwibXV0YXRlIiwicmVsYXlvdXRUb3AiLCJtaW4iLCJmaXJzdFBhc3NBZnRlckRvY3VtZW50UmVhZHkiLCJkb2MiLCJkb2N1bWVudEluZm8iLCJkb2N1bWVudEluZm9Gb3JEb2MiLCJzZW5kTWVzc2FnZSIsInRpdGxlIiwiZ2V0VXJsIiwiYm9keSIsImZpcnN0RWxlbWVudENoaWxkIiwidGFnTmFtZSIsImRvY3VtZW50RWxlbWVudCIsImhhc0F0dHJpYnV0ZSIsImxpbmtSZWxzIiwidmlld3BvcnQiLCJnZXRDb250ZW50SGVpZ2h0IiwiZmlyc3RQYXNzQWZ0ZXJBbGxCdWlsdCIsImZpcnN0UGFzc0FmdGVyQWxsQnVpbHRfIiwiZXZlcnkiLCJyIiwiUjEiLCJ2aWV3cG9ydFNpemUiLCJnZXRTaXplIiwid2lkdGgiLCJoZWlnaHQiLCJjYW5jZWwiLCJzZXRTdGF0ZSIsInNpZ25hbElmUmVhZHlfIiwibWVhc3VyZSIsIm1lYXN1cmVkQ29udGVudEhlaWdodCIsImNvbnRlbnRIZWlnaHRDaGFuZ2VkIiwiZm4iLCJzaWduYWxzIiwiZ2V0Iiwic2lnbmFsIiwidmlld3BvcnRSZWN0IiwiZ2V0UmVjdCIsInRvcE9mZnNldCIsImJvdHRvbU9mZnNldCIsImlzU2Nyb2xsaW5nU3RvcHBlZCIsImFicyIsInJlcXVlc3RzQ2hhbmdlU2l6ZSIsIm1pblRvcCIsInNjcm9sbEFkalNldCIsImFib3ZlVnBIZWlnaHRDaGFuZ2UiLCJib3giLCJnZXRMYXlvdXRCb3giLCJ0b3BNYXJnaW5EaWZmIiwiYm90dG9tTWFyZ2luRGlmZiIsImxlZnRNYXJnaW5EaWZmIiwicmlnaHRNYXJnaW5EaWZmIiwiYm90dG9tRGlzcGxhY2VkQm91bmRhcnkiLCJib3R0b20iLCJ0b3BVbmNoYW5nZWRCb3VuZGFyeSIsInRvcCIsIm5ld01hcmdpbnMiLCJ1bmRlZmluZWQiLCJtYXJnaW5zIiwiY3VycmVudE1hcmdpbnMiLCJsZWZ0IiwicmlnaHQiLCJoZWlnaHREaWZmIiwid2lkdGhEaWZmIiwicmVzaXplIiwiaGFzRGVzY2VuZGFudHNPZiIsInVzZXJBY3RpdmF0aW9uIiwiaGFzQmVlbkFjdGl2ZSIsImVsZW1lbnROZWFyQm90dG9tXyIsInJ1biIsInBhcmVudCIsInBhcmVudEVsZW1lbnQiLCJwYXJlbnRXaWR0aCIsImdldExheW91dFNpemUiLCJvZmZzZXRXaWR0aCIsImN1bXVsYXRpdmVXaWR0aCIsImNoaWxkRWxlbWVudENvdW50IiwiY2hpbGRyZW4iLCJjaGFuZ2VTaXplIiwib3ZlcmZsb3dDYWxsYmFjayIsInNldFJlbGF5b3V0VG9wIiwic2Nyb2xsSGVpZ2h0IiwiZ2V0U2Nyb2xsSGVpZ2h0Iiwic2Nyb2xsVG9wIiwiZ2V0U2Nyb2xsVG9wIiwibmV3U2Nyb2xsSGVpZ2h0Iiwic2V0U2Nyb2xsVG9wIiwib3B0X2xheW91dEJveCIsIm9wdF9pbml0aWFsTGF5b3V0Qm94IiwiY29udGVudEhlaWdodCIsInRocmVzaG9sZCIsIm1heCIsImluaXRpYWxCb3giLCJnZXRJbml0aWFsTGF5b3V0Qm94Iiwid2FzRGlzcGxheWVkIiwiaXNEaXNwbGF5ZWQiLCJyZXNvdXJjZXMiLCJ1bmxvYWQiLCJlbGVtZW50c1RoYXRTY3JvbGxlZCIsInJlbGF5b3V0Q291bnQiLCJyZW1lYXN1cmVDb3VudCIsImhhc0JlZW5NZWFzdXJlZCIsIk5PVF9MQUlEX09VVCIsImlzTWVhc3VyZVJlcXVlc3RlZCIsInRvVW5sb2FkIiwiaGFzT3duZXIiLCJuZWVkc01lYXN1cmUiLCJjb250YWlucyIsIm1lYXN1cmVSZXNvdXJjZV8iLCJ1bmxvYWRSZXNvdXJjZXNfIiwibG9hZFJlY3QiLCJ2aXNpYmxlUmVjdCIsInNob3VsZEJlSW5WaWV3cG9ydCIsIm92ZXJsYXBzIiwic2V0SW5WaWV3cG9ydCIsIlJFQURZX0ZPUl9MQVlPVVQiLCJzY2hlZHVsZUxheW91dE9yUHJlbG9hZCIsImlzSWRsZV8iLCJpZGxlU2NoZWR1bGVkQ291bnQiLCJpZGxlUmVuZGVyT3V0c2lkZVZpZXdwb3J0IiwibGFzdERlcXVldWVUaW1lIiwiZ2V0TGFzdERlcXVldWVUaW1lIiwidGltZW91dCIsInBlZWsiLCJjYWxjVGFza1RpbWVvdXRfIiwiaWQiLCJzY2hlZHVsZVRpbWUiLCJkZXF1ZXVlIiwiZXhlY3V0aW5nIiwiZ2V0VGFza0J5SWQiLCJyZXNjaGVkdWxlIiwicmVzY2hlZHVsZV8iLCJzdGlsbERpc3BsYXllZCIsImlzTGF5b3V0QWxsb3dlZF8iLCJmb3JjZU91dHNpZGVWaWV3cG9ydCIsInN0YXJ0VGltZSIsImVucXVldWUiLCJ0YXNrQ29tcGxldGVfIiwiY2F0Y2giLCJuZXh0UGFzc0RlbGF5IiwicG9zUHJpb3JpdHkiLCJmbG9vciIsImdldFNjcm9sbERpcmVjdGlvbiIsInBlbmFsdHkiLCJvdGhlciIsInN1Y2Nlc3MiLCJvcHRfcmVhc29uIiwiaW5mbyIsInJlamVjdCIsImlzSW5WaWV3cG9ydCIsInJlbmRlck91dHNpZGVWaWV3cG9ydCIsImxheW91dCIsIm9wdF9wYXJlbnRQcmlvcml0eSIsIm9wdF9mb3JjZU91dHNpZGVWaWV3cG9ydCIsInNjaGVkdWxlXyIsInN0YXJ0TGF5b3V0IiwibG9jYWxJZCIsInByaW9yaXR5T2Zmc2V0IiwicGFyZW50UHJpb3JpdHkiLCJ0YXNrSWQiLCJnZXRUYXNrSWQiLCJnZXRMYXlvdXRQcmlvcml0eSIsInF1ZXVlZCIsImxheW91dFNjaGVkdWxlZCIsInZzbSIsImhpZGRlbiIsIkhJRERFTiIsImluYWN0aXZlIiwiSU5BQ1RJVkUiLCJwYXVzZWQiLCJQQVVTRUQiLCJwcmVyZW5kZXIiLCJ2aXNpYmxlIiwiVklTSUJMRSIsImRvV29yayIsImhhc011dGF0ZVdvcmtfIiwibXV0YXRlV29ya18iLCJkaXNjb3ZlcldvcmtfIiwiZGVsYXkiLCJ3b3JrXyIsInJlc29sdmUiLCJub29wIiwicGF1c2UiLCJ1bnNlbGVjdFRleHRfIiwicmVzdW1lIiwiYWRkVHJhbnNpdGlvbiIsImdldFNlbGVjdGlvbiIsInJlbW92ZUFsbFJhbmdlcyIsIm9wdF9yZW1vdmVQZW5kaW5nIiwicHVyZ2UiLCJwZW5kaW5nSW5kZXgiLCJ0YXJnZXQiLCJub2RlVHlwZSIsIk5vZGUiLCJFTEVNRU5UX05PREUiLCJnZXRTY3JvbGxpbmdFbGVtZW50Iiwic2Nyb2xsZWQiLCJhc3NlcnRFbGVtZW50IiwiU2l6ZURlZiIsImluc3RhbGxSZXNvdXJjZXNTZXJ2aWNlRm9yRG9jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxlQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsMEJBQVI7QUFDQSxTQUFRQyxnQkFBUjtBQUNBLFNBQVFDLE1BQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsSUFBUjtBQUVBLFNBQVFDLFFBQVI7QUFFQSxTQUFRQyxzQkFBUjtBQUNBLFNBQVFDLGtCQUFSO0FBQ0EsU0FBUUMsUUFBUixFQUFrQkMsYUFBbEI7QUFDQSxTQUFRQyxpQkFBUixFQUEyQkMsa0JBQTNCO0FBQ0EsU0FBUUMsU0FBUjtBQUVBLFNBQVFDLFlBQVI7QUFDQSxTQUFRQyxrQkFBUixFQUE0QkMsV0FBNUI7QUFDQSxTQUFRQyxNQUFSLEVBQWdCQyxXQUFoQjtBQUNBLFNBQVFDLFlBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsNEJBQVI7QUFDQSxTQUFRQyxZQUFSO0FBRUEsSUFBTUMsSUFBSSxHQUFHLFdBQWI7QUFDQSxJQUFNQyxlQUFlLEdBQUcsR0FBeEI7QUFDQSxJQUFNQyxtQkFBbUIsR0FBRyxDQUE1QjtBQUNBLElBQU1DLGdCQUFnQixHQUFHLEdBQXpCO0FBQ0EsSUFBTUMsb0JBQW9CLEdBQUcsQ0FBN0I7QUFDQSxJQUFNQyxjQUFjLEdBQUcsRUFBdkI7QUFDQSxJQUFNQyxzQkFBc0IsR0FBRyxJQUEvQjtBQUNBLElBQU1DLHFCQUFxQixHQUFHLElBQTlCO0FBQ0EsSUFBTUMsbUJBQW1CLEdBQUcsR0FBNUI7QUFDQSxJQUFNQyxzQkFBc0IsR0FBRyxPQUFPLEVB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Q0FBQ0MsUUFBUCxLQUFvQkMsSUFBSSxDQUFDQyxZQUE3QixFQUEyQztBQUN6QztBQUNEOztBQUNEO0FBQ0E7QUFDQSxVQUFJSCxNQUFNLEtBQUssS0FBS3ZTLFNBQUwsQ0FBZTJTLG1CQUFmLEVBQWYsRUFBcUQ7QUFDbkQ7QUFDRDs7QUFFRCxVQUFNQyxRQUFRLEdBQUcvVixHQUFHLEdBQUdnVyxhQUFOLENBQW9CTixNQUFwQixDQUFqQjs7QUFDQSxVQUFJLENBQUMsS0FBSzlSLHFCQUFMLENBQTJCK0QsUUFBM0IsQ0FBb0NvTyxRQUFwQyxDQUFMLEVBQW9EO0FBQ2xELGFBQUtuUyxxQkFBTCxDQUEyQm9ELElBQTNCLENBQWdDK08sUUFBaEM7QUFDQSxhQUFLclQsWUFBTCxDQUFrQjNCLGlCQUFsQjtBQUNEO0FBQ0Y7QUF0dERIOztBQUFBO0FBQUE7O0FBeXREQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJa1YsT0FBSjs7QUFFUDtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLDZCQUFULENBQXVDalYsTUFBdkMsRUFBK0M7QUFDcERkLEVBQUFBLDRCQUE0QixDQUFDYyxNQUFELEVBQVMsV0FBVCxFQUFzQkQsYUFBdEIsQ0FBNUI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1Zpc2liaWxpdHlTdGF0ZX0gZnJvbSAnI2NvcmUvY29uc3RhbnRzL3Zpc2liaWxpdHktc3RhdGUnO1xuaW1wb3J0IHtGaW5pdGVTdGF0ZU1hY2hpbmV9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9maW5pdGUtc3RhdGUtbWFjaGluZSc7XG5pbXBvcnQge0RlZmVycmVkfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvcHJvbWlzZSc7XG5pbXBvcnQge2hhc05leHROb2RlSW5Eb2N1bWVudE9yZGVyfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtleHBhbmRMYXlvdXRSZWN0fSBmcm9tICcjY29yZS9kb20vbGF5b3V0L3JlY3QnO1xuaW1wb3J0IHtyZW1vdmV9IGZyb20gJyNjb3JlL3R5cGVzL2FycmF5JztcbmltcG9ydCB7dGhyb3R0bGV9IGZyb20gJyNjb3JlL3R5cGVzL2Z1bmN0aW9uJztcbmltcG9ydCB7ZGljdH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge2llSW50cmluc2ljQ2hlY2tBbmRGaXh9IGZyb20gJy4vaWUtaW50cmluc2ljLWJ1Zyc7XG5pbXBvcnQge2llTWVkaWFDaGVja0FuZEZpeH0gZnJvbSAnLi9pZS1tZWRpYS1idWcnO1xuaW1wb3J0IHtSZXNvdXJjZSwgUmVzb3VyY2VTdGF0ZX0gZnJvbSAnLi9yZXNvdXJjZSc7XG5pbXBvcnQge1JFQURZX1NDQU5fU0lHTkFMLCBSZXNvdXJjZXNJbnRlcmZhY2V9IGZyb20gJy4vcmVzb3VyY2VzLWludGVyZmFjZSc7XG5pbXBvcnQge1Rhc2tRdWV1ZX0gZnJvbSAnLi90YXNrLXF1ZXVlJztcblxuaW1wb3J0IHtzdGFydHVwQ2h1bmt9IGZyb20gJy4uL2NodW5rJztcbmltcG9ydCB7aXNCbG9ja2VkQnlDb25zZW50LCByZXBvcnRFcnJvcn0gZnJvbSAnLi4vZXJyb3ItcmVwb3J0aW5nJztcbmltcG9ydCB7bGlzdGVuLCBsb2FkUHJvbWlzZX0gZnJvbSAnLi4vZXZlbnQtaGVscGVyJztcbmltcG9ydCB7Rm9jdXNIaXN0b3J5fSBmcm9tICcuLi9mb2N1cy1oaXN0b3J5JztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnR9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge1Bhc3N9IGZyb20gJy4uL3Bhc3MnO1xuaW1wb3J0IHtyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jfSBmcm9tICcuLi9zZXJ2aWNlLWhlbHBlcnMnO1xuaW1wb3J0IHtnZXRTb3VyY2VVcmx9IGZyb20gJy4uL3VybCc7XG5cbmNvbnN0IFRBR18gPSAnUmVzb3VyY2VzJztcbmNvbnN0IExBWU9VVF9UQVNLX0lEXyA9ICdMJztcbmNvbnN0IExBWU9VVF9UQVNLX09GRlNFVF8gPSAwO1xuY29uc3QgUFJFTE9BRF9UQVNLX0lEXyA9ICdQJztcbmNvbnN0IFBSRUxPQURfVEFTS19PRkZTRVRfID0gMjtcbmNvbnN0IFBSSU9SSVRZX0JBU0VfID0gMTA7XG5jb25zdCBQUklPUklUWV9QRU5BTFRZX1RJTUVfID0gMTAwMDtcbmNvbnN0IFBPU1RfVEFTS19QQVNTX0RFTEFZXyA9IDEwMDA7XG5jb25zdCBNVVRBVEVfREVGRVJfREVMQVlfID0gNTAwO1xuY29uc3QgRk9DVVNfSElTVE9SWV9USU1FT1VUXyA9IDEwMDAgKiA2MDsgLy8gMW1pblxuY29uc3QgRk9VUl9GUkFNRV9ERUxBWV8gPSA3MDtcblxuLyoqXG4gKiBAaW1wbGVtZW50cyB7UmVzb3VyY2VzSW50ZXJmYWNlfVxuICovXG5leHBvcnQgY2xhc3MgUmVzb3VyY2VzSW1wbCB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICAvKiogQGNvbnN0IHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9ICovXG4gICAgdGhpcy5hbXBkb2MgPSBhbXBkb2M7XG5cbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gYW1wZG9jLndpbjtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyEuL3ZpZXdlci1pbnRlcmZhY2UuVmlld2VySW50ZXJmYWNlfSAqL1xuICAgIHRoaXMudmlld2VyXyA9IFNlcnZpY2VzLnZpZXdlckZvckRvYyhhbXBkb2MpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNSdW50aW1lT25fID0gdGhpcy52aWV3ZXJfLmlzUnVudGltZU9uKCk7XG5cbiAgICAvKipcbiAgICAgKiBVc2VkIHByaW1hcmlseSBmb3IgdGVzdGluZyB0byBhbGxvdyBidWlsZCBwaGFzZSB0byBwcm9jZWVkLlxuICAgICAqIEBjb25zdCBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmlzQnVpbGRPbl8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMucmVzb3VyY2VJZENvdW50ZXJfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTwhUmVzb3VyY2U+fSAqL1xuICAgIHRoaXMucmVzb3VyY2VzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5hZGRDb3VudF8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5idWlsZEF0dGVtcHRzQ291bnRfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuYnVpbGRzVGhpc1Bhc3NfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnZpc2libGVfID0gdGhpcy5hbXBkb2MuaXNWaXNpYmxlKCk7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5kb2N1bWVudFJlYWR5XyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogV2Ugd2FudCB0byBkbyBzb21lIHdvcmsgaW4gdGhlIGZpcnN0IHBhc3MgYWZ0ZXJcbiAgICAgKiB0aGUgZG9jdW1lbnQgaXMgcmVhZHkuXG4gICAgICogQHByaXZhdGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5maXJzdFBhc3NBZnRlckRvY3VtZW50UmVhZHlfID0gdHJ1ZTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgQU1QIGhhcyBiZWVuIGZ1bGx5IGluaXRpYWxpemVkLlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuYW1wSW5pdGlhbGl6ZWRfID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBXZSBhbHNvIGFkanVzdCB0aGUgdGltZW91dCBwZW5hbHR5IHNob3J0bHkgYWZ0ZXIgdGhlIGZpcnN0IHBhc3MuXG4gICAgICogQHByaXZhdGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmZpcnN0VmlzaWJsZVRpbWVfID0gLTE7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5yZWxheW91dEFsbF8gPSB0cnVlO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlbGF5b3V0VG9wXyA9IC0xO1xuXG4gICAgLyoqIEBwcml2YXRlIHt0aW1lfSAqL1xuICAgIHRoaXMubGFzdFNjcm9sbFRpbWVfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubGFzdFZlbG9jaXR5XyA9IDA7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshUGFzc30gKi9cbiAgICB0aGlzLnBhc3NfID0gbmV3IFBhc3ModGhpcy53aW4sICgpID0+IHRoaXMuZG9QYXNzKCkpO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IVBhc3N9ICovXG4gICAgdGhpcy5yZW1lYXN1cmVQYXNzXyA9IG5ldyBQYXNzKHRoaXMud2luLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlbGF5b3V0QWxsXyA9IHRydWU7XG4gICAgICB0aGlzLnNjaGVkdWxlUGFzcygpO1xuICAgIH0pO1xuXG4gICAgLyoqIEBjb25zdCB7IVRhc2tRdWV1ZX0gKi9cbiAgICB0aGlzLmV4ZWNfID0gbmV3IFRhc2tRdWV1ZSgpO1xuXG4gICAgLyoqIEBjb25zdCB7IVRhc2tRdWV1ZX0gKi9cbiAgICB0aGlzLnF1ZXVlXyA9IG5ldyBUYXNrUXVldWUoKTtcblxuICAgIC8qKiBAY29uc3Qge2Z1bmN0aW9uKC4vdGFzay1xdWV1ZS5UYXNrRGVmKTpudW1iZXJ9ICovXG4gICAgdGhpcy5ib3VuZFRhc2tTY29yZXJfID0gdGhpcy5jYWxjVGFza1Njb3JlXy5iaW5kKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGUgeyFBcnJheTwhLi9yZXNvdXJjZXMtaW50ZXJmYWNlLkNoYW5nZVNpemVSZXF1ZXN0RGVmPn1cbiAgICAgKi9cbiAgICB0aGlzLnJlcXVlc3RzQ2hhbmdlU2l6ZV8gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0FycmF5PCFSZXNvdXJjZT59ICovXG4gICAgdGhpcy5wZW5kaW5nQnVpbGRSZXNvdXJjZXNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc0N1cnJlbnRseUJ1aWxkaW5nUGVuZGluZ1Jlc291cmNlc18gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL3ZpZXdwb3J0L3ZpZXdwb3J0LWludGVyZmFjZS5WaWV3cG9ydEludGVyZmFjZX0gKi9cbiAgICB0aGlzLnZpZXdwb3J0XyA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHRoaXMuYW1wZG9jKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL3ZzeW5jLWltcGwuVnN5bmN9ICovXG4gICAgdGhpcy52c3luY18gPSBTZXJ2aWNlcy4vKk9LKi8gdnN5bmNGb3IodGhpcy53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUZvY3VzSGlzdG9yeX0gKi9cbiAgICB0aGlzLmFjdGl2ZUhpc3RvcnlfID0gbmV3IEZvY3VzSGlzdG9yeSh0aGlzLndpbiwgRk9DVVNfSElTVE9SWV9USU1FT1VUXyk7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy52c3luY1NjaGVkdWxlZF8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuY29udGVudEhlaWdodF8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMubWF5YmVDaGFuZ2VIZWlnaHRfID0gZmFsc2U7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshQXJyYXk8ZnVuY3Rpb24oKT59ICovXG4gICAgdGhpcy5wYXNzQ2FsbGJhY2tzXyA9IFtdO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IUFycmF5PCFFbGVtZW50Pn0gKi9cbiAgICB0aGlzLmVsZW1lbnRzVGhhdFNjcm9sbGVkXyA9IFtdO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IURlZmVycmVkfSAqL1xuICAgIHRoaXMuZmlyc3RQYXNzRG9uZV8gPSBuZXcgRGVmZXJyZWQoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFGaW5pdGVTdGF0ZU1hY2hpbmU8IVZpc2liaWxpdHlTdGF0ZT59ICovXG4gICAgdGhpcy52aXNpYmlsaXR5U3RhdGVNYWNoaW5lXyA9IG5ldyBGaW5pdGVTdGF0ZU1hY2hpbmUoXG4gICAgICB0aGlzLmFtcGRvYy5nZXRWaXNpYmlsaXR5U3RhdGUoKVxuICAgICk7XG5cbiAgICAvLyBXaGVuIHVzZXIgc2Nyb2xsaW5nIHN0b3BzLCBydW4gcGFzcyB0byBjaGVjayBuZXdseSBpbi12aWV3cG9ydCBlbGVtZW50cy5cbiAgICAvLyBXaGVuIHZpZXdwb3J0IGlzIHJlc2l6ZWQsIHdlIGhhdmUgdG8gcmUtbWVhc3VyZSBldmVyeXRoaW5nLlxuICAgIHRoaXMudmlld3BvcnRfLm9uQ2hhbmdlZCgoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMubGFzdFNjcm9sbFRpbWVfID0gdGhpcy53aW4uRGF0ZS5ub3coKTtcbiAgICAgIHRoaXMubGFzdFZlbG9jaXR5XyA9IGV2ZW50LnZlbG9jaXR5O1xuICAgICAgaWYgKGV2ZW50LnJlbGF5b3V0QWxsKSB7XG4gICAgICAgIHRoaXMucmVsYXlvdXRBbGxfID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tYXliZUNoYW5nZUhlaWdodF8gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNjaGVkdWxlUGFzcygpO1xuICAgIH0pO1xuICAgIHRoaXMudmlld3BvcnRfLm9uU2Nyb2xsKCgpID0+IHtcbiAgICAgIHRoaXMubGFzdFNjcm9sbFRpbWVfID0gdGhpcy53aW4uRGF0ZS5ub3coKTtcbiAgICB9KTtcblxuICAgIC8vIFdoZW4gZG9jdW1lbnQgYmVjb21lcyB2aXNpYmxlLCBlLmcuIGZyb20gXCJwcmVyZW5kZXJcIiBtb2RlLCBkbyBhXG4gICAgLy8gc2ltcGxlIHBhc3MuXG4gICAgdGhpcy5hbXBkb2Mub25WaXNpYmlsaXR5Q2hhbmdlZCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5maXJzdFZpc2libGVUaW1lXyA9PSAtMSAmJiB0aGlzLmFtcGRvYy5pc1Zpc2libGUoKSkge1xuICAgICAgICB0aGlzLmZpcnN0VmlzaWJsZVRpbWVfID0gdGhpcy53aW4uRGF0ZS5ub3coKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2NoZWR1bGVQYXNzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnZpZXdlcl8ub25SdW50aW1lU3RhdGUoKHN0YXRlKSA9PiB7XG4gICAgICBkZXYoKS5maW5lKFRBR18sICdSdW50aW1lIHN0YXRlOicsIHN0YXRlKTtcbiAgICAgIHRoaXMuaXNSdW50aW1lT25fID0gc3RhdGU7XG4gICAgICB0aGlzLnNjaGVkdWxlUGFzcygxKTtcbiAgICB9KTtcblxuICAgIC8vIFNjaGVkdWxlIGluaXRpYWwgcGFzc2VzLiBUaGlzIG11c3QgaGFwcGVuIGluIGEgc3RhcnR1cCB0YXNrXG4gICAgLy8gdG8gYXZvaWQgYmxvY2tpbmcgYm9keSB2aXNpYmxlLlxuICAgIHN0YXJ0dXBDaHVuayh0aGlzLmFtcGRvYywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXR1cFZpc2liaWxpdHlTdGF0ZU1hY2hpbmVfKHRoaXMudmlzaWJpbGl0eVN0YXRlTWFjaGluZV8pO1xuICAgICAgdGhpcy5zY2hlZHVsZVBhc3MoMCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlYnVpbGREb21XaGVuUmVhZHlfKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy50aHJvdHRsZWRTY3JvbGxfID0gdGhyb3R0bGUodGhpcy53aW4sIChlKSA9PiB0aGlzLnNjcm9sbGVkXyhlKSwgMjUwKTtcblxuICAgIGxpc3Rlbih0aGlzLndpbi5kb2N1bWVudCwgJ3Njcm9sbCcsIHRoaXMudGhyb3R0bGVkU2Nyb2xsXywge1xuICAgICAgY2FwdHVyZTogdHJ1ZSxcbiAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgcmVidWlsZERvbVdoZW5SZWFkeV8oKSB7XG4gICAgLy8gRW5zdXJlIHRoYXQgd2UgYXR0ZW1wdCB0byByZWJ1aWxkIHRoaW5ncyB3aGVuIERPTSBpcyByZWFkeS5cbiAgICB0aGlzLmFtcGRvYy53aGVuUmVhZHkoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuZG9jdW1lbnRSZWFkeV8gPSB0cnVlO1xuICAgICAgdGhpcy5idWlsZFJlYWR5UmVzb3VyY2VzXygpO1xuICAgICAgdGhpcy5wZW5kaW5nQnVpbGRSZXNvdXJjZXNfID0gbnVsbDtcblxuICAgICAgY29uc3QgaW5wdXQgPSBTZXJ2aWNlcy5pbnB1dEZvcih0aGlzLndpbik7XG4gICAgICBpbnB1dC5zZXR1cElucHV0TW9kZUNsYXNzZXModGhpcy5hbXBkb2MpO1xuXG4gICAgICBpZiAoSVNfRVNNKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWVJbnRyaW5zaWNDaGVja0FuZEZpeCh0aGlzLndpbik7XG5cbiAgICAgIGNvbnN0IGZpeFByb21pc2UgPSBpZU1lZGlhQ2hlY2tBbmRGaXgodGhpcy53aW4pO1xuICAgICAgY29uc3QgcmVtZWFzdXJlID0gKCkgPT4gdGhpcy5yZW1lYXN1cmVQYXNzXy5zY2hlZHVsZSgpO1xuICAgICAgaWYgKGZpeFByb21pc2UpIHtcbiAgICAgICAgZml4UHJvbWlzZS50aGVuKHJlbWVhc3VyZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBObyBwcm9taXNlIG1lYW5zIHRoYXQgdGhlcmUncyBubyBwcm9ibGVtLlxuICAgICAgICByZW1lYXN1cmUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2FmYXJpIDEwIGFuZCB1bmRlciBpbmNvcnJlY3RseSBlc3RpbWF0ZXMgZm9udCBzcGFjaW5nIGZvclxuICAgICAgLy8gYEBmb250LWZhY2VgIGZvbnRzLiBUaGlzIGxlYWRzIHRvIHdpbGQgbWVhc3VyZW1lbnQgZXJyb3JzLiBUaGUgYmVzdFxuICAgICAgLy8gY291cnNlIG9mIGFjdGlvbiBpcyB0byByZW1lYXN1cmUgZXZlcnl0aGluZyBvbiB3aW5kb3cub25sb2FkIG9yIGZvbnRcbiAgICAgIC8vIHRpbWVvdXQgKDNzKSwgd2hpY2hldmVyIGlzIGVhcmxpZXIuIFRoaXMgaGFzIHRvIGJlIGRvbmUgb24gdGhlIGdsb2JhbFxuICAgICAgLy8gd2luZG93IGJlY2F1c2UgdGhpcyBpcyB3aGVyZSB0aGUgZm9udHMgYXJlIGFsd2F5cyBhZGRlZC5cbiAgICAgIC8vIFVuZm9ydHVuYXRlbHksIGBkb2N1bWVudC5mb250cy5yZWFkeWAgY2Fubm90IGJlIHVzZWQgaGVyZSBkdWUgdG9cbiAgICAgIC8vIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xNzQwMzAuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE3NDAzMSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAgUHJvbWlzZS5yYWNlKFtcbiAgICAgICAgbG9hZFByb21pc2UodGhpcy53aW4pLFxuICAgICAgICBTZXJ2aWNlcy50aW1lckZvcih0aGlzLndpbikucHJvbWlzZSgzMTAwKSxcbiAgICAgIF0pLnRoZW4ocmVtZWFzdXJlKTtcblxuICAgICAgLy8gUmVtZWFzdXJlIHRoZSBkb2N1bWVudCB3aGVuIGFsbCBmb250cyBsb2FkZWQuXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMud2luLmRvY3VtZW50LmZvbnRzICYmXG4gICAgICAgIHRoaXMud2luLmRvY3VtZW50LmZvbnRzLnN0YXR1cyAhPSAnbG9hZGVkJ1xuICAgICAgKSB7XG4gICAgICAgIHRoaXMud2luLmRvY3VtZW50LmZvbnRzLnJlYWR5LnRoZW4ocmVtZWFzdXJlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0KCkge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlc18uc2xpY2UoMCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldEFtcGRvYygpIHtcbiAgICByZXR1cm4gdGhpcy5hbXBkb2M7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFJlc291cmNlRm9yRWxlbWVudChlbGVtZW50KSB7XG4gICAgcmV0dXJuIFJlc291cmNlLmZvckVsZW1lbnQoZWxlbWVudCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFJlc291cmNlRm9yRWxlbWVudE9wdGlvbmFsKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gUmVzb3VyY2UuZm9yRWxlbWVudE9wdGlvbmFsKGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRTY3JvbGxEaXJlY3Rpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguc2lnbih0aGlzLmxhc3RWZWxvY2l0eV8pIHx8IDE7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGFkZChlbGVtZW50KSB7XG4gICAgLy8gRW5zdXJlIHRoZSB2aWV3cG9ydCBpcyByZWFkeSB0byBhY2NlcHQgdGhlIGZpcnN0IGVsZW1lbnQuXG4gICAgdGhpcy5hZGRDb3VudF8rKztcbiAgICBpZiAodGhpcy5hZGRDb3VudF8gPT0gMSkge1xuICAgICAgdGhpcy52aWV3cG9ydF8uZW5zdXJlUmVhZHlGb3JFbGVtZW50cygpO1xuICAgIH1cblxuICAgIC8vIEZpcnN0IGNoZWNrIGlmIHRoZSByZXNvdXJjZSBpcyBiZWluZyByZXBhcmVudGVkIGFuZCBpZiBpdCByZXF1aXJlc1xuICAgIC8vIHJlY29uc3RydWN0aW9uLiBPbmx5IGFscmVhZHkgYnVpbHQgZWxlbWVudHMgYXJlIGVsaWdpYmxlLlxuICAgIGxldCByZXNvdXJjZSA9IFJlc291cmNlLmZvckVsZW1lbnRPcHRpb25hbChlbGVtZW50KTtcbiAgICBpZiAoXG4gICAgICByZXNvdXJjZSAmJlxuICAgICAgcmVzb3VyY2UuZ2V0U3RhdGUoKSAhPSBSZXNvdXJjZVN0YXRlLk5PVF9CVUlMVCAmJlxuICAgICAgIWVsZW1lbnQucmVjb25zdHJ1Y3RXaGVuUmVwYXJlbnRlZCgpXG4gICAgKSB7XG4gICAgICByZXNvdXJjZS5yZXF1ZXN0TWVhc3VyZSgpO1xuICAgICAgZGV2KCkuZmluZShUQUdfLCAncmVzb3VyY2UgcmV1c2VkOicsIHJlc291cmNlLmRlYnVnaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDcmVhdGUgYW5kIGFkZCBhIG5ldyByZXNvdXJjZS5cbiAgICAgIHJlc291cmNlID0gbmV3IFJlc291cmNlKCsrdGhpcy5yZXNvdXJjZUlkQ291bnRlcl8sIGVsZW1lbnQsIHRoaXMpO1xuICAgICAgZGV2KCkuZmluZShUQUdfLCAncmVzb3VyY2UgYWRkZWQ6JywgcmVzb3VyY2UuZGVidWdpZCk7XG4gICAgfVxuICAgIHRoaXMucmVzb3VyY2VzXy5wdXNoKHJlc291cmNlKTtcbiAgICB0aGlzLnJlbWVhc3VyZVBhc3NfLnNjaGVkdWxlKDEwMDApO1xuICB9XG5cbiAgLyoqXG4gICAqIExpbWl0cyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGJlaW5nIGJ1aWxkIGluIHByZS1yZW5kZXIgcGhhc2UgdG9cbiAgICogYSBmaW5pdGUgbnVtYmVyLiBSZXR1cm5zIGZhbHNlIGlmIHRoZSBudW1iZXIgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzVW5kZXJCdWlsZFF1b3RhXygpIHtcbiAgICAvLyBGb3IgcHJlLXJlbmRlciB3ZSB3YW50IHRvIGxpbWl0IHRoZSBhbW91bnQgb2YgQ1BVIHVzZWQsIHNvIHdlIGxpbWl0XG4gICAgLy8gdGhlIG51bWJlciBvZiBlbGVtZW50cyBidWlsZC4gRm9yIHByZS1yZW5kZXIgdG8gXCJzZWVtIGNvbXBsZXRlXCJcbiAgICAvLyB3ZSBvbmx5IG5lZWQgdG8gYnVpbGQgZWxlbWVudHMgaW4gdGhlIGZpcnN0IHZpZXdwb3J0LiBXZSBjYW4ndCBrbm93XG4gICAgLy8gd2hpY2ggYXJlIGFjdHVhbGx5IGluIHRoZSB2aWV3cG9ydCAoYmVjYXVzZSB0aGUgZGVjaXNpb24gaXMgcHJlLWxheW91dCxcbiAgICAvLyBzbyB3ZSB1c2UgYSBoZXVyaXN0aWMgaW5zdGVhZC5cbiAgICAvLyBNb3N0IGRvY3VtZW50cyBoYXZlIDEwIG9yIGxlc3MgQU1QIHRhZ3MuIEJ5IGJ1aWxkaW5nIDIwIHdlIHNob3VsZCBub3RcbiAgICAvLyBjaGFuZ2UgdGhlIGJlaGF2aW9yIGZvciB0aGUgdmFzdCBtYWpvcml0eSBvZiBkb2NzLCBhbmQgYWxtb3N0IGFsd2F5c1xuICAgIC8vIGNhdGNoIGV2ZXJ5dGhpbmcgaW4gdGhlIGZpcnN0IHZpZXdwb3J0LlxuICAgIHJldHVybiB0aGlzLmJ1aWxkQXR0ZW1wdHNDb3VudF8gPCAyMCB8fCB0aGlzLmFtcGRvYy5oYXNCZWVuVmlzaWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyB0aGUgZWxlbWVudCBpZiByZWFkeSB0byBiZSBidWlsdCwgb3RoZXJ3aXNlIGFkZHMgaXQgdG8gcGVuZGluZ1xuICAgKiByZXNvdXJjZXMuXG4gICAqIEBwYXJhbSB7IVJlc291cmNlfSByZXNvdXJjZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBjaGVja0ZvckR1cGVzXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGlnbm9yZVF1b3RhXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBidWlsZE9yU2NoZWR1bGVCdWlsZEZvclJlc291cmNlXyhcbiAgICByZXNvdXJjZSxcbiAgICBjaGVja0ZvckR1cGVzID0gZmFsc2UsXG4gICAgaWdub3JlUXVvdGEgPSBmYWxzZVxuICApIHtcbiAgICBjb25zdCBidWlsZGluZ0VuYWJsZWQgPSB0aGlzLmlzUnVudGltZU9uXyB8fCB0aGlzLmlzQnVpbGRPbl87XG4gICAgaWYgKCFidWlsZGluZ0VuYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBEdXJpbmcgcHJlcmVuZGVyIG1vZGUsIGRvbid0IGJ1aWxkIGVsZW1lbnRzIHRoYXQgYXJlbid0IGFsbG93ZWQgdG8gYmVcbiAgICAvLyBwcmVyZW5kZXJlZC4gVGhpcyBhdm9pZHMgd2FzdGluZyBvdXIgcHJlcmVuZGVyIGJ1aWxkIHF1b3RhLlxuICAgIC8vIFNlZSBpc1VuZGVyQnVpbGRRdW90YV8oKSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgIGNvbnN0IHNob3VsZEJ1aWxkUmVzb3VyY2UgPVxuICAgICAgdGhpcy5hbXBkb2MuZ2V0VmlzaWJpbGl0eVN0YXRlKCkgIT0gVmlzaWJpbGl0eVN0YXRlLlBSRVJFTkRFUiB8fFxuICAgICAgcmVzb3VyY2UucHJlcmVuZGVyQWxsb3dlZCgpO1xuICAgIGlmICghc2hvdWxkQnVpbGRSZXNvdXJjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmRvY3VtZW50UmVhZHlfKSB7XG4gICAgICAvLyBCdWlsZCByZXNvdXJjZSBpbW1lZGlhdGVseSwgdGhlIGRvY3VtZW50IGhhcyBhbHJlYWR5IGJlZW4gcGFyc2VkLlxuICAgICAgdGhpcy5idWlsZFJlc291cmNlVW5zYWZlXyhyZXNvdXJjZSwgaWdub3JlUXVvdGEpO1xuICAgIH0gZWxzZSBpZiAoIXJlc291cmNlLmlzQnVpbHQoKSAmJiAhcmVzb3VyY2UuaXNCdWlsZGluZygpKSB7XG4gICAgICBpZiAoIWNoZWNrRm9yRHVwZXMgfHwgIXRoaXMucGVuZGluZ0J1aWxkUmVzb3VyY2VzXy5pbmNsdWRlcyhyZXNvdXJjZSkpIHtcbiAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCB0byBwZW5kaW5nIHJlc291cmNlcyBhbmQgdHJ5IHRvIGJ1aWxkIGFueSByZWFkeSBvbmVzLlxuICAgICAgICB0aGlzLnBlbmRpbmdCdWlsZFJlc291cmNlc18ucHVzaChyZXNvdXJjZSk7XG4gICAgICAgIHRoaXMuYnVpbGRSZWFkeVJlc291cmNlc18oKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIHJlc291cmNlcyB0aGF0IGFyZSByZWFkeSB0byBiZSBidWlsdC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGJ1aWxkUmVhZHlSZXNvdXJjZXNfKCkge1xuICAgIC8vIEF2b2lkIGNhc2VzIHdoZXJlIGVsZW1lbnRzIGFkZCBtb3JlIGVsZW1lbnRzIGluc2lkZSBvZiB0aGVtXG4gICAgLy8gYW5kIGNhdXNlIGFuIGluZmluaXRlIGxvb3Agb2YgYnVpbGRpbmcgLSBzZWUgIzMzNTQgZm9yIGRldGFpbHMuXG4gICAgaWYgKHRoaXMuaXNDdXJyZW50bHlCdWlsZGluZ1BlbmRpbmdSZXNvdXJjZXNfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmlzQ3VycmVudGx5QnVpbGRpbmdQZW5kaW5nUmVzb3VyY2VzXyA9IHRydWU7XG4gICAgICB0aGlzLmJ1aWxkUmVhZHlSZXNvdXJjZXNVbnNhZmVfKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuaXNDdXJyZW50bHlCdWlsZGluZ1BlbmRpbmdSZXNvdXJjZXNfID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBidWlsZFJlYWR5UmVzb3VyY2VzVW5zYWZlXygpIHtcbiAgICAvLyBUaGlzIHdpbGwgbG9vcCBvdmVyIGFsbCBjdXJyZW50IHBlbmRpbmcgcmVzb3VyY2VzIGFuZCB0aG9zZSB0aGF0XG4gICAgLy8gZ2V0IGFkZGVkIGJ5IG90aGVyIHJlc291cmNlcyBidWlsZC1jeWNsZSwgdGhpcyB3aWxsIG1ha2Ugc3VyZSBhbGxcbiAgICAvLyBlbGVtZW50cyBnZXQgYSBjaGFuY2UgdG8gYmUgYnVpbHQuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBlbmRpbmdCdWlsZFJlc291cmNlc18ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlc291cmNlID0gdGhpcy5wZW5kaW5nQnVpbGRSZXNvdXJjZXNfW2ldO1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmRvY3VtZW50UmVhZHlfIHx8XG4gICAgICAgIGhhc05leHROb2RlSW5Eb2N1bWVudE9yZGVyKHJlc291cmNlLmVsZW1lbnQsIHRoaXMuYW1wZG9jLmdldFJvb3ROb2RlKCkpXG4gICAgICApIHtcbiAgICAgICAgLy8gUmVtb3ZlIHJlc291cmNlIGJlZm9yZSBidWlsZCB0byByZW1vdmUgaXQgZnJvbSB0aGUgcGVuZGluZyBsaXN0XG4gICAgICAgIC8vIGluIGVpdGhlciBjYXNlIHRoZSBidWlsZCBzdWNjZWVkIG9yIHRocm93cyBhbiBlcnJvci5cbiAgICAgICAgdGhpcy5wZW5kaW5nQnVpbGRSZXNvdXJjZXNfLnNwbGljZShpLS0sIDEpO1xuICAgICAgICB0aGlzLmJ1aWxkUmVzb3VyY2VVbnNhZmVfKHJlc291cmNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshUmVzb3VyY2V9IHJlc291cmNlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGlnbm9yZVF1b3RhXG4gICAqIEByZXR1cm4gez9Qcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYnVpbGRSZXNvdXJjZVVuc2FmZV8ocmVzb3VyY2UsIGlnbm9yZVF1b3RhID0gZmFsc2UpIHtcbiAgICBpZiAoXG4gICAgICAhaWdub3JlUXVvdGEgJiZcbiAgICAgICF0aGlzLmlzVW5kZXJCdWlsZFF1b3RhXygpICYmXG4gICAgICAvLyBTcGVjaWFsIGNhc2U6IGFtcC1leHBlcmltZW50IGlzIGFsbG93ZWQgdG8gYnlwYXNzIHByZXJlbmRlciBidWlsZCBxdW90YS5cbiAgICAgICFyZXNvdXJjZS5pc0J1aWxkUmVuZGVyQmxvY2tpbmcoKVxuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZSA9IHJlc291cmNlLmJ1aWxkKCk7XG4gICAgaWYgKCFwcm9taXNlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV2KCkuZmluZShUQUdfLCAnYnVpbGQgcmVzb3VyY2U6JywgcmVzb3VyY2UuZGVidWdpZCk7XG4gICAgdGhpcy5idWlsZEF0dGVtcHRzQ291bnRfKys7XG4gICAgdGhpcy5idWlsZHNUaGlzUGFzc18rKztcbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKFxuICAgICAgKCkgPT4gdGhpcy5zY2hlZHVsZVBhc3MoKSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAvLyBCdWlsZCBmYWlsZWQ6IHJlbW92ZSB0aGUgcmVzb3VyY2UuIE5vIG90aGVyIHN0YXRlIGNoYW5nZXMgYXJlXG4gICAgICAgIC8vIG5lZWRlZC5cbiAgICAgICAgdGhpcy5yZW1vdmVSZXNvdXJjZV8ocmVzb3VyY2UpO1xuICAgICAgICBpZiAoIWlzQmxvY2tlZEJ5Q29uc2VudChlcnJvcikpIHtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlbW92ZShlbGVtZW50KSB7XG4gICAgY29uc3QgcmVzb3VyY2UgPSBSZXNvdXJjZS5mb3JFbGVtZW50T3B0aW9uYWwoZWxlbWVudCk7XG4gICAgaWYgKCFyZXNvdXJjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZVJlc291cmNlXyhyZXNvdXJjZSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshUmVzb3VyY2V9IHJlc291cmNlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZW1vdmVSZXNvdXJjZV8ocmVzb3VyY2UpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmVzb3VyY2VzXy5pbmRleE9mKHJlc291cmNlKTtcbiAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgIHRoaXMucmVzb3VyY2VzXy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBpZiAocmVzb3VyY2UuaXNCdWlsdCgpKSB7XG4gICAgICByZXNvdXJjZS5wYXVzZU9uUmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlc291cmNlLmdldFN0YXRlKCkgPT09IFJlc291cmNlU3RhdGUuTEFZT1VUX1NDSEVEVUxFRCkge1xuICAgICAgcmVzb3VyY2UubGF5b3V0Q2FuY2VsZWQoKTtcbiAgICB9XG4gICAgdGhpcy5jbGVhbnVwVGFza3NfKHJlc291cmNlLCAvKiBvcHRfcmVtb3ZlUGVuZGluZyAqLyB0cnVlKTtcbiAgICBkZXYoKS5maW5lKFRBR18sICdyZXNvdXJjZSByZW1vdmVkOicsIHJlc291cmNlLmRlYnVnaWQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB1cGdyYWRlZChlbGVtZW50KSB7XG4gICAgY29uc3QgcmVzb3VyY2UgPSBSZXNvdXJjZS5mb3JFbGVtZW50KGVsZW1lbnQpO1xuICAgIHRoaXMuYnVpbGRPclNjaGVkdWxlQnVpbGRGb3JSZXNvdXJjZV8ocmVzb3VyY2UpO1xuICAgIGRldigpLmZpbmUoVEFHXywgJ3Jlc291cmNlIHVwZ3JhZGVkOicsIHJlc291cmNlLmRlYnVnaWQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB1cGRhdGVMYXlvdXRQcmlvcml0eShlbGVtZW50LCBuZXdMYXlvdXRQcmlvcml0eSkge1xuICAgIGNvbnN0IHJlc291cmNlID0gUmVzb3VyY2UuZm9yRWxlbWVudChlbGVtZW50KTtcblxuICAgIHJlc291cmNlLnVwZGF0ZUxheW91dFByaW9yaXR5KG5ld0xheW91dFByaW9yaXR5KTtcblxuICAgIC8vIFVwZGF0ZSBhZmZlY3RlZCB0YXNrc1xuICAgIHRoaXMucXVldWVfLmZvckVhY2goKHRhc2spID0+IHtcbiAgICAgIGlmICh0YXNrLnJlc291cmNlID09IHJlc291cmNlKSB7XG4gICAgICAgIHRhc2sucHJpb3JpdHkgPSBuZXdMYXlvdXRQcmlvcml0eTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuc2NoZWR1bGVQYXNzKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNjaGVkdWxlUGFzcyhvcHRfZGVsYXkpIHtcbiAgICByZXR1cm4gdGhpcy5wYXNzXy5zY2hlZHVsZShvcHRfZGVsYXkpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB1cGRhdGVPckVucXVldWVNdXRhdGVUYXNrKHJlc291cmNlLCBuZXdSZXF1ZXN0KSB7XG4gICAgbGV0IHJlcXVlc3QgPSBudWxsO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yZXF1ZXN0c0NoYW5nZVNpemVfLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5yZXF1ZXN0c0NoYW5nZVNpemVfW2ldLnJlc291cmNlID09IHJlc291cmNlKSB7XG4gICAgICAgIHJlcXVlc3QgPSB0aGlzLnJlcXVlc3RzQ2hhbmdlU2l6ZV9baV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVxdWVzdCkge1xuICAgICAgcmVxdWVzdC5uZXdIZWlnaHQgPSBuZXdSZXF1ZXN0Lm5ld0hlaWdodDtcbiAgICAgIHJlcXVlc3QubmV3V2lkdGggPSBuZXdSZXF1ZXN0Lm5ld1dpZHRoO1xuICAgICAgcmVxdWVzdC5tYXJnaW5DaGFuZ2UgPSBuZXdSZXF1ZXN0Lm1hcmdpbkNoYW5nZTtcbiAgICAgIHJlcXVlc3QuZXZlbnQgPSBuZXdSZXF1ZXN0LmV2ZW50O1xuICAgICAgcmVxdWVzdC5mb3JjZSA9IG5ld1JlcXVlc3QuZm9yY2UgfHwgcmVxdWVzdC5mb3JjZTtcbiAgICAgIHJlcXVlc3QuY2FsbGJhY2sgPSBuZXdSZXF1ZXN0LmNhbGxiYWNrO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlcXVlc3RzQ2hhbmdlU2l6ZV8ucHVzaChuZXdSZXF1ZXN0KTtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNjaGVkdWxlUGFzc1ZzeW5jKCkge1xuICAgIGlmICh0aGlzLnZzeW5jU2NoZWR1bGVkXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnZzeW5jU2NoZWR1bGVkXyA9IHRydWU7XG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHRoaXMuZG9QYXNzKCkpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhbXBJbml0Q29tcGxldGUoKSB7XG4gICAgdGhpcy5hbXBJbml0aWFsaXplZF8gPSB0cnVlO1xuICAgIGRldigpLmZpbmUoVEFHXywgJ2FtcEluaXRDb21wbGV0ZScpO1xuICAgIHRoaXMuc2NoZWR1bGVQYXNzKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNldFJlbGF5b3V0VG9wKHJlbGF5b3V0VG9wKSB7XG4gICAgaWYgKHRoaXMucmVsYXlvdXRUb3BfID09IC0xKSB7XG4gICAgICB0aGlzLnJlbGF5b3V0VG9wXyA9IHJlbGF5b3V0VG9wO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbGF5b3V0VG9wXyA9IE1hdGgubWluKHJlbGF5b3V0VG9wLCB0aGlzLnJlbGF5b3V0VG9wXyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBtYXliZUhlaWdodENoYW5nZWQoKSB7XG4gICAgdGhpcy5tYXliZUNoYW5nZUhlaWdodF8gPSB0cnVlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvbk5leHRQYXNzKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5wYXNzQ2FsbGJhY2tzXy5wdXNoKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIGEgcGFzcyBpbW1lZGlhdGVseS5cbiAgICpcbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBkb1Bhc3MoKSB7XG4gICAgaWYgKCF0aGlzLmlzUnVudGltZU9uXykge1xuICAgICAgZGV2KCkuZmluZShUQUdfLCAncnVudGltZSBpcyBvZmYnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnZpc2libGVfID0gdGhpcy5hbXBkb2MuaXNWaXNpYmxlKCk7XG4gICAgdGhpcy5idWlsZHNUaGlzUGFzc18gPSAwO1xuXG4gICAgY29uc3QgZmlyc3RQYXNzQWZ0ZXJEb2N1bWVudFJlYWR5ID1cbiAgICAgIHRoaXMuZG9jdW1lbnRSZWFkeV8gJiZcbiAgICAgIHRoaXMuZmlyc3RQYXNzQWZ0ZXJEb2N1bWVudFJlYWR5XyAmJlxuICAgICAgdGhpcy5hbXBJbml0aWFsaXplZF87XG4gICAgaWYgKGZpcnN0UGFzc0FmdGVyRG9jdW1lbnRSZWFkeSkge1xuICAgICAgdGhpcy5maXJzdFBhc3NBZnRlckRvY3VtZW50UmVhZHlfID0gZmFsc2U7XG4gICAgICBjb25zdCBkb2MgPSB0aGlzLndpbi5kb2N1bWVudDtcbiAgICAgIGNvbnN0IGRvY3VtZW50SW5mbyA9IFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyh0aGlzLmFtcGRvYyk7XG5cbiAgICAgIC8vIFRPRE8oY2hvdW14LCAjMjY2ODcpOiBVcGRhdGUgdmlld2VycyB0byByZWFkIGRhdGEudmlld3BvcnQgaW5zdGVhZCBvZlxuICAgICAgLy8gZGF0YS5tZXRhVGFncy52aWV3cG9ydCBmcm9tICdkb2N1bWVudExvYWRlZCcgbWVzc2FnZS5cbiAgICAgIHRoaXMudmlld2VyXy5zZW5kTWVzc2FnZShcbiAgICAgICAgJ2RvY3VtZW50TG9hZGVkJyxcbiAgICAgICAgZGljdCh7XG4gICAgICAgICAgJ3RpdGxlJzogZG9jLnRpdGxlLFxuICAgICAgICAgICdzb3VyY2VVcmwnOiBnZXRTb3VyY2VVcmwodGhpcy5hbXBkb2MuZ2V0VXJsKCkpLFxuICAgICAgICAgICdpc1N0b3J5JzogZG9jLmJvZHkuZmlyc3RFbGVtZW50Q2hpbGQ/LnRhZ05hbWUgPT09ICdBTVAtU1RPUlknLFxuICAgICAgICAgICdzZXJ2ZXJMYXlvdXQnOiBkb2MuZG9jdW1lbnRFbGVtZW50Lmhhc0F0dHJpYnV0ZSgnaS1hbXBodG1sLWVsZW1lbnQnKSxcbiAgICAgICAgICAnbGlua1JlbHMnOiBkb2N1bWVudEluZm8ubGlua1JlbHMsXG4gICAgICAgICAgJ21ldGFUYWdzJzogeyd2aWV3cG9ydCc6IGRvY3VtZW50SW5mby52aWV3cG9ydH0gLyogZGVwcmVjYXRlZCAqLyxcbiAgICAgICAgICAndmlld3BvcnQnOiBkb2N1bWVudEluZm8udmlld3BvcnQsXG4gICAgICAgIH0pLFxuICAgICAgICAvKiBjYW5jZWxVbnNlbnQgKi8gdHJ1ZVxuICAgICAgKTtcblxuICAgICAgdGhpcy5jb250ZW50SGVpZ2h0XyA9IHRoaXMudmlld3BvcnRfLmdldENvbnRlbnRIZWlnaHQoKTtcbiAgICAgIHRoaXMudmlld2VyXy5zZW5kTWVzc2FnZShcbiAgICAgICAgJ2RvY3VtZW50SGVpZ2h0JyxcbiAgICAgICAgZGljdCh7J2hlaWdodCc6IHRoaXMuY29udGVudEhlaWdodF99KSxcbiAgICAgICAgLyogY2FuY2VsVW5zZW50ICovIHRydWVcbiAgICAgICk7XG4gICAgICBkZXYoKS5maW5lKFRBR18sICdkb2N1bWVudCBoZWlnaHQgb24gbG9hZDogJXMnLCB0aGlzLmNvbnRlbnRIZWlnaHRfKTtcbiAgICB9XG5cbiAgICAvLyBPbmNlIHdlIGtub3cgdGhlIGRvY3VtZW50IGlzIGZ1bGx5IHBhcnNlZCwgd2UgY2hlY2sgdG8gc2VlIGlmIGV2ZXJ5IEFNUCBFbGVtZW50IGhhcyBiZWVuIGJ1aWx0XG4gICAgY29uc3QgZmlyc3RQYXNzQWZ0ZXJBbGxCdWlsdCA9XG4gICAgICAhdGhpcy5maXJzdFBhc3NBZnRlckRvY3VtZW50UmVhZHlfICYmXG4gICAgICB0aGlzLmZpcnN0UGFzc0FmdGVyQWxsQnVpbHRfICYmXG4gICAgICB0aGlzLnJlc291cmNlc18uZXZlcnkoXG4gICAgICAgIChyKSA9PiByLmdldFN0YXRlKCkgIT0gUmVzb3VyY2UuTk9UX0JVSUxUIHx8IHIuZWxlbWVudC5SMSgpXG4gICAgICApO1xuICAgIGlmIChmaXJzdFBhc3NBZnRlckFsbEJ1aWx0KSB7XG4gICAgICB0aGlzLmZpcnN0UGFzc0FmdGVyQWxsQnVpbHRfID0gZmFsc2U7XG4gICAgICB0aGlzLm1heWJlQ2hhbmdlSGVpZ2h0XyA9IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3Qgdmlld3BvcnRTaXplID0gdGhpcy52aWV3cG9ydF8uZ2V0U2l6ZSgpO1xuICAgIGRldigpLmZpbmUoXG4gICAgICBUQUdfLFxuICAgICAgJ1BBU1M6IHZpc2libGU9JyxcbiAgICAgIHRoaXMudmlzaWJsZV8sXG4gICAgICAnLCByZWxheW91dEFsbD0nLFxuICAgICAgdGhpcy5yZWxheW91dEFsbF8sXG4gICAgICAnLCByZWxheW91dFRvcD0nLFxuICAgICAgdGhpcy5yZWxheW91dFRvcF8sXG4gICAgICAnLCB2aWV3cG9ydFNpemU9JyxcbiAgICAgIHZpZXdwb3J0U2l6ZS53aWR0aCxcbiAgICAgIHZpZXdwb3J0U2l6ZS5oZWlnaHRcbiAgICApO1xuICAgIHRoaXMucGFzc18uY2FuY2VsKCk7XG4gICAgdGhpcy52c3luY1NjaGVkdWxlZF8gPSBmYWxzZTtcblxuICAgIHRoaXMudmlzaWJpbGl0eVN0YXRlTWFjaGluZV8uc2V0U3RhdGUodGhpcy5hbXBkb2MuZ2V0VmlzaWJpbGl0eVN0YXRlKCkpO1xuXG4gICAgdGhpcy5zaWduYWxJZlJlYWR5XygpO1xuXG4gICAgaWYgKHRoaXMubWF5YmVDaGFuZ2VIZWlnaHRfKSB7XG4gICAgICB0aGlzLm1heWJlQ2hhbmdlSGVpZ2h0XyA9IGZhbHNlO1xuICAgICAgdGhpcy52c3luY18ubWVhc3VyZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1lYXN1cmVkQ29udGVudEhlaWdodCA9IHRoaXMudmlld3BvcnRfLmdldENvbnRlbnRIZWlnaHQoKTtcbiAgICAgICAgaWYgKG1lYXN1cmVkQ29udGVudEhlaWdodCAhPSB0aGlzLmNvbnRlbnRIZWlnaHRfKSB7XG4gICAgICAgICAgdGhpcy52aWV3ZXJfLnNlbmRNZXNzYWdlKFxuICAgICAgICAgICAgJ2RvY3VtZW50SGVpZ2h0JyxcbiAgICAgICAgICAgIGRpY3QoeydoZWlnaHQnOiBtZWFzdXJlZENvbnRlbnRIZWlnaHR9KSxcbiAgICAgICAgICAgIC8qIGNhbmNlbFVuc2VudCAqLyB0cnVlXG4gICAgICAgICAgKTtcbiAgICAgICAgICB0aGlzLmNvbnRlbnRIZWlnaHRfID0gbWVhc3VyZWRDb250ZW50SGVpZ2h0O1xuICAgICAgICAgIGRldigpLmZpbmUoVEFHXywgJ2RvY3VtZW50IGhlaWdodCBjaGFuZ2VkOiAlcycsIHRoaXMuY29udGVudEhlaWdodF8pO1xuICAgICAgICAgIHRoaXMudmlld3BvcnRfLmNvbnRlbnRIZWlnaHRDaGFuZ2VkKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXNzQ2FsbGJhY2tzXy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZm4gPSB0aGlzLnBhc3NDYWxsYmFja3NfW2ldO1xuICAgICAgZm4oKTtcbiAgICB9XG4gICAgdGhpcy5wYXNzQ2FsbGJhY2tzXy5sZW5ndGggPSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIElmICgxKSB0aGUgZG9jdW1lbnQgaXMgZnVsbHkgcGFyc2VkLCAoMikgdGhlIEFNUCBydW50aW1lIChzZXJ2aWNlcyBldGMuKVxuICAgKiBpcyBpbml0aWFsaXplZCwgYW5kICgzKSB3ZSBkaWQgYSBmaXJzdCBwYXNzIG9uIGVsZW1lbnQgbWVhc3VyZW1lbnRzLFxuICAgKiB0aGVuIGZpcmUgdGhlIFwicmVhZHlcIiBzaWduYWwuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzaWduYWxJZlJlYWR5XygpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLmRvY3VtZW50UmVhZHlfICYmXG4gICAgICB0aGlzLmFtcEluaXRpYWxpemVkXyAmJlxuICAgICAgIXRoaXMuYW1wZG9jLnNpZ25hbHMoKS5nZXQoUkVBRFlfU0NBTl9TSUdOQUwpXG4gICAgKSB7XG4gICAgICAvLyBUaGlzIHNpZ25hbCBtYWlubHkgc2lnbmlmaWVzIHRoYXQgbW9zdCBvZiBlbGVtZW50cyBoYXZlIGJlZW4gbWVhc3VyZWRcbiAgICAgIC8vIGJ5IG5vdy4gVGhpcyBpcyBtb3N0bHkgdXNlZCB0byBhdm9pZCBtZWFzdXJpbmcgdG9vIG1hbnkgZWxlbWVudHNcbiAgICAgIC8vIGluZGl2aWR1YWxseS4gTWF5IG5vdCBiZSBjYWxsZWQgaW4gc2hhZG93IG1vZGUuXG4gICAgICB0aGlzLmFtcGRvYy5zaWduYWxzKCkuc2lnbmFsKFJFQURZX1NDQU5fU0lHTkFMKTtcbiAgICAgIGRldigpLmZpbmUoVEFHXywgJ3NpZ25hbDogcmVhZHktc2NhbicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGB0cnVlYCB3aGVuIHRoZXJlJ3MgbXV0YXRlIHdvcmsgY3VycmVudGx5IGJhdGNoZWQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYXNNdXRhdGVXb3JrXygpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0c0NoYW5nZVNpemVfLmxlbmd0aCA+IDA7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgcHJlLWRpc2NvdmVyeSBtdXRhdGVzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbXV0YXRlV29ya18oKSB7XG4gICAgLy8gUmVhZCBhbGwgbmVjZXNzYXJ5IGRhdGEgYmVmb3JlIG11dGF0ZXMuXG4gICAgLy8gVGhlIGhlaWdodCBjaGFuZ2luZyBkZXBlbmRzIGxhcmdlbHkgb24gdGhlIHRhcmdldCBlbGVtZW50J3MgcG9zaXRpb25cbiAgICAvLyBpbiB0aGUgYWN0aXZlIHZpZXdwb3J0LiBXaGVuIG5vdCBpbiBwcmVyZW5kZXJpbmcsIHdlIGFsc28gY29uc2lkZXIgdGhlXG4gICAgLy8gYWN0aXZlIHZpZXdwb3J0IHRoZSBwYXJ0IG9mIHRoZSB2aXNpYmxlIHZpZXdwb3J0IGJlbG93IDEwJSBmcm9tIHRoZSB0b3BcbiAgICAvLyBhbmQgYWJvdmUgMjUlIGZyb20gdGhlIGJvdHRvbS5cbiAgICAvLyBUaGlzIGlzIGJhc2ljYWxseSB0aGUgcG9ydGlvbiBvZiB0aGUgdmlld3BvcnQgd2hlcmUgdGhlIHJlYWRlciBpcyBtb3N0XG4gICAgLy8gbGlrZWx5IGZvY3VzZWQgcmlnaHQgbm93LiBUaGUgbWFpbiBnb2FsIGlzIHRvIGF2b2lkIGRyYXN0aWMgVUkgY2hhbmdlc1xuICAgIC8vIGluIHRoYXQgcGFydCBvZiB0aGUgY29udGVudC4gVGhlIGVsZW1lbnRzIGJlbG93IHRoZSBhY3RpdmUgdmlld3BvcnQgYXJlXG4gICAgLy8gZnJlZWx5IHJlc2l6ZWQuIFRoZSBlbGVtZW50cyBhYm92ZSB0aGUgdmlld3BvcnQgYXJlIHJlc2l6ZWQgYW5kIHJlcXVlc3RcbiAgICAvLyBzY3JvbGwgYWRqdXN0bWVudCB0byBhdm9pZCBhY3RpdmUgdmlld3BvcnQgY2hhbmdpbmcgd2l0aG91dCB1c2VyJ3NcbiAgICAvLyBhY3Rpb24uIFRoZSBlbGVtZW50cyBpbiB0aGUgYWN0aXZlIHZpZXdwb3J0IGFyZSBub3QgcmVzaXplZCBhbmQgaW5zdGVhZFxuICAgIC8vIHRoZSBvdmVyZmxvdyBjYWxsYmFja3MgYXJlIGNhbGxlZC5cbiAgICBjb25zdCBub3cgPSB0aGlzLndpbi5EYXRlLm5vdygpO1xuICAgIGNvbnN0IHZpZXdwb3J0UmVjdCA9IHRoaXMudmlld3BvcnRfLmdldFJlY3QoKTtcbiAgICBjb25zdCB0b3BPZmZzZXQgPSB2aWV3cG9ydFJlY3QuaGVpZ2h0IC8gMTA7XG4gICAgY29uc3QgYm90dG9tT2Zmc2V0ID0gdmlld3BvcnRSZWN0LmhlaWdodCAvIDEwO1xuICAgIGNvbnN0IGlzU2Nyb2xsaW5nU3RvcHBlZCA9XG4gICAgICAoTWF0aC5hYnModGhpcy5sYXN0VmVsb2NpdHlfKSA8IDFlLTIgJiZcbiAgICAgICAgbm93IC0gdGhpcy5sYXN0U2Nyb2xsVGltZV8gPiBNVVRBVEVfREVGRVJfREVMQVlfKSB8fFxuICAgICAgbm93IC0gdGhpcy5sYXN0U2Nyb2xsVGltZV8gPiBNVVRBVEVfREVGRVJfREVMQVlfICogMjtcblxuICAgIGlmICh0aGlzLnJlcXVlc3RzQ2hhbmdlU2l6ZV8ubGVuZ3RoID4gMCkge1xuICAgICAgZGV2KCkuZmluZShcbiAgICAgICAgVEFHXyxcbiAgICAgICAgJ2NoYW5nZSBzaXplIHJlcXVlc3RzOicsXG4gICAgICAgIHRoaXMucmVxdWVzdHNDaGFuZ2VTaXplXy5sZW5ndGhcbiAgICAgICk7XG4gICAgICBjb25zdCByZXF1ZXN0c0NoYW5nZVNpemUgPSB0aGlzLnJlcXVlc3RzQ2hhbmdlU2l6ZV87XG4gICAgICB0aGlzLnJlcXVlc3RzQ2hhbmdlU2l6ZV8gPSBbXTtcblxuICAgICAgLy8gRmluZCBtaW5pbXVtIHRvcCBwb3NpdGlvbiBhbmQgcnVuIGFsbCBtdXRhdGVzLlxuICAgICAgbGV0IG1pblRvcCA9IC0xO1xuICAgICAgY29uc3Qgc2Nyb2xsQWRqU2V0ID0gW107XG4gICAgICBsZXQgYWJvdmVWcEhlaWdodENoYW5nZSA9IDA7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlcXVlc3RzQ2hhbmdlU2l6ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0gcmVxdWVzdHNDaGFuZ2VTaXplW2ldO1xuICAgICAgICBjb25zdCB7ZXZlbnQsIHJlc291cmNlfSA9XG4gICAgICAgICAgLyoqIEB0eXBlIHshLi9yZXNvdXJjZXMtaW50ZXJmYWNlLkNoYW5nZVNpemVSZXF1ZXN0RGVmfSAqLyAocmVxdWVzdCk7XG4gICAgICAgIGNvbnN0IGJveCA9IHJlc291cmNlLmdldExheW91dEJveCgpO1xuXG4gICAgICAgIGxldCB0b3BNYXJnaW5EaWZmID0gMDtcbiAgICAgICAgbGV0IGJvdHRvbU1hcmdpbkRpZmYgPSAwO1xuICAgICAgICBsZXQgbGVmdE1hcmdpbkRpZmYgPSAwO1xuICAgICAgICBsZXQgcmlnaHRNYXJnaW5EaWZmID0gMDtcbiAgICAgICAgbGV0IHtib3R0b206IGJvdHRvbURpc3BsYWNlZEJvdW5kYXJ5LCB0b3A6IHRvcFVuY2hhbmdlZEJvdW5kYXJ5fSA9IGJveDtcbiAgICAgICAgbGV0IG5ld01hcmdpbnMgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChyZXF1ZXN0Lm1hcmdpbkNoYW5nZSkge1xuICAgICAgICAgIG5ld01hcmdpbnMgPSByZXF1ZXN0Lm1hcmdpbkNoYW5nZS5uZXdNYXJnaW5zO1xuICAgICAgICAgIGNvbnN0IG1hcmdpbnMgPSByZXF1ZXN0Lm1hcmdpbkNoYW5nZS5jdXJyZW50TWFyZ2lucztcbiAgICAgICAgICBpZiAobmV3TWFyZ2lucy50b3AgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0b3BNYXJnaW5EaWZmID0gbmV3TWFyZ2lucy50b3AgLSBtYXJnaW5zLnRvcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG5ld01hcmdpbnMuYm90dG9tICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYm90dG9tTWFyZ2luRGlmZiA9IG5ld01hcmdpbnMuYm90dG9tIC0gbWFyZ2lucy5ib3R0b207XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChuZXdNYXJnaW5zLmxlZnQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBsZWZ0TWFyZ2luRGlmZiA9IG5ld01hcmdpbnMubGVmdCAtIG1hcmdpbnMubGVmdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG5ld01hcmdpbnMucmlnaHQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByaWdodE1hcmdpbkRpZmYgPSBuZXdNYXJnaW5zLnJpZ2h0IC0gbWFyZ2lucy5yaWdodDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRvcE1hcmdpbkRpZmYpIHtcbiAgICAgICAgICAgIHRvcFVuY2hhbmdlZEJvdW5kYXJ5ID0gYm94LnRvcCAtIG1hcmdpbnMudG9wO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYm90dG9tTWFyZ2luRGlmZikge1xuICAgICAgICAgICAgLy8gVGhlIGxvd2VzdCBib3VuZGFyeSBvZiB0aGUgZWxlbWVudCB0aGF0IHdvdWxkIGFwcGVhciB0byBiZVxuICAgICAgICAgICAgLy8gcmVzaXplZCBhcyBhIHJlc3VsdCBvZiB0aGlzIHNpemUgY2hhbmdlLiBJZiB0aGUgYm90dG9tIG1hcmdpbiBpc1xuICAgICAgICAgICAgLy8gYmVpbmcgY2hhbmdlZCB0aGVuIGl0IGlzIHRoZSBib3R0b20gZWRnZSBvZiB0aGUgbWFyZ2luIGJveCxcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBpdCBpcyB0aGUgYm90dG9tIGVkZ2Ugb2YgdGhlIGxheW91dCBib3ggYXMgc2V0IGFib3ZlLlxuICAgICAgICAgICAgYm90dG9tRGlzcGxhY2VkQm91bmRhcnkgPSBib3guYm90dG9tICsgbWFyZ2lucy5ib3R0b207XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhlaWdodERpZmYgPSByZXF1ZXN0Lm5ld0hlaWdodCAtIGJveC5oZWlnaHQ7XG4gICAgICAgIGNvbnN0IHdpZHRoRGlmZiA9IHJlcXVlc3QubmV3V2lkdGggLSBib3gud2lkdGg7XG5cbiAgICAgICAgLy8gQ2hlY2sgcmVzaXplIHJ1bGVzLiBJdCB3aWxsIGVpdGhlciByZXNpemUgZWxlbWVudCBpbW1lZGlhdGVseSwgb3JcbiAgICAgICAgLy8gd2FpdCB1bnRpbCBzY3JvbGxpbmcgc3RvcHMgb3Igd2lsbCBjYWxsIHRoZSBvdmVyZmxvdyBjYWxsYmFjay5cbiAgICAgICAgbGV0IHJlc2l6ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgaGVpZ2h0RGlmZiA9PSAwICYmXG4gICAgICAgICAgdG9wTWFyZ2luRGlmZiA9PSAwICYmXG4gICAgICAgICAgYm90dG9tTWFyZ2luRGlmZiA9PSAwICYmXG4gICAgICAgICAgd2lkdGhEaWZmID09IDAgJiZcbiAgICAgICAgICBsZWZ0TWFyZ2luRGlmZiA9PSAwICYmXG4gICAgICAgICAgcmlnaHRNYXJnaW5EaWZmID09IDBcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gMS4gTm90aGluZyB0byByZXNpemUuXG4gICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5mb3JjZSB8fCAhdGhpcy52aXNpYmxlXykge1xuICAgICAgICAgIC8vIDIuIEFuIGltbWVkaWF0ZSBleGVjdXRpb24gcmVxdWVzdGVkIG9yIHRoZSBkb2N1bWVudCBpcyBoaWRkZW4uXG4gICAgICAgICAgcmVzaXplID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB0aGlzLmFjdGl2ZUhpc3RvcnlfLmhhc0Rlc2NlbmRhbnRzT2YocmVzb3VyY2UuZWxlbWVudCkgfHxcbiAgICAgICAgICAoZXZlbnQgJiYgZXZlbnQudXNlckFjdGl2YXRpb24gJiYgZXZlbnQudXNlckFjdGl2YXRpb24uaGFzQmVlbkFjdGl2ZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gMy4gQWN0aXZlIGVsZW1lbnRzIGFyZSBpbW1lZGlhdGVseSByZXNpemVkLiBUaGUgYXNzdW1wdGlvbiBpcyB0aGF0XG4gICAgICAgICAgLy8gdGhlIHJlc2l6ZSBpcyB0cmlnZ2VyZWQgYnkgdGhlIHVzZXIgYWN0aW9uIG9yIHNvb24gYWZ0ZXIuXG4gICAgICAgICAgcmVzaXplID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB0b3BVbmNoYW5nZWRCb3VuZGFyeSA+PSB2aWV3cG9ydFJlY3QuYm90dG9tIC0gYm90dG9tT2Zmc2V0IHx8XG4gICAgICAgICAgKHRvcE1hcmdpbkRpZmYgPT0gMCAmJlxuICAgICAgICAgICAgYm94LmJvdHRvbSArIE1hdGgubWluKGhlaWdodERpZmYsIDApID49XG4gICAgICAgICAgICAgIHZpZXdwb3J0UmVjdC5ib3R0b20gLSBib3R0b21PZmZzZXQpXG4gICAgICAgICkge1xuICAgICAgICAgIC8vIDQuIEVsZW1lbnRzIHVuZGVyIHZpZXdwb3J0IGFyZSByZXNpemVkIGltbWVkaWF0ZWx5LCBidXQgb25seSBpZlxuICAgICAgICAgIC8vIGFuIGVsZW1lbnQncyBib3VuZGFyeSBpcyBub3QgY2hhbmdlZCBhYm92ZSB0aGUgdmlld3BvcnQgYWZ0ZXJcbiAgICAgICAgICAvLyByZXNpemUuXG4gICAgICAgICAgcmVzaXplID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB2aWV3cG9ydFJlY3QudG9wID4gMSAmJlxuICAgICAgICAgIGJvdHRvbURpc3BsYWNlZEJvdW5kYXJ5IDw9IHZpZXdwb3J0UmVjdC50b3AgKyB0b3BPZmZzZXRcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gNS4gRWxlbWVudHMgYWJvdmUgdGhlIHZpZXdwb3J0IGNhbiBvbmx5IGJlIHJlc2l6ZWQgaWYgd2UgYXJlIGFibGVcbiAgICAgICAgICAvLyB0byBjb21wZW5zYXRlIHRoZSBoZWlnaHQgY2hhbmdlIGJ5IHNldHRpbmcgc2Nyb2xsVG9wIGFuZCBvbmx5IGlmXG4gICAgICAgICAgLy8gdGhlIHBhZ2UgaGFzIGFscmVhZHkgYmVlbiBzY3JvbGxlZCBieSBzb21lIGFtb3VudCAoMXB4IGR1ZSB0byBpT1MpLlxuICAgICAgICAgIC8vIE90aGVyd2lzZSB0aGUgc2Nyb2xsaW5nIG1pZ2h0IG1vdmUgaW1wb3J0YW50IHRoaW5ncyBsaWtlIHRoZSBtZW51XG4gICAgICAgICAgLy8gYmFyIG91dCBvZiB0aGUgdmlld3BvcnQgYXQgaW5pdGlhbCBwYWdlIGxvYWQuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaGVpZ2h0RGlmZiA8IDAgJiZcbiAgICAgICAgICAgIHZpZXdwb3J0UmVjdC50b3AgKyBhYm92ZVZwSGVpZ2h0Q2hhbmdlIDwgLWhlaWdodERpZmZcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIERvIG5vdGhpbmcgaWYgaGVpZ2h0IGFib2JlIHZpZXdwb3J0IGhlaWdodCBjYW4ndCBjb21wZW5zYXRlXG4gICAgICAgICAgICAvLyBoZWlnaHQgZGVjcmVhc2VcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBDYW4gb25seSByZXNpemVkIHdoZW4gc2Nyb2xsaW5nIGhhcyBzdG9wcGVkLFxuICAgICAgICAgIC8vIG90aGVyd2lzZSBkZWZlciB1dGlsIG5leHQgY3ljbGUuXG4gICAgICAgICAgaWYgKGlzU2Nyb2xsaW5nU3RvcHBlZCkge1xuICAgICAgICAgICAgLy8gVGhlc2UgcmVxdWVzdHMgd2lsbCBiZSBleGVjdXRlZCBpbiB0aGUgbmV4dCBhbmltYXRpb24gY3ljbGUgYW5kXG4gICAgICAgICAgICAvLyBhZGp1c3QgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAgICAgICAgICAgIGFib3ZlVnBIZWlnaHRDaGFuZ2UgPSBhYm92ZVZwSGVpZ2h0Q2hhbmdlICsgaGVpZ2h0RGlmZjtcbiAgICAgICAgICAgIHNjcm9sbEFkalNldC5wdXNoKHJlcXVlc3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBEZWZlciB0aWxsIG5leHQgY3ljbGUuXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RzQ2hhbmdlU2l6ZV8ucHVzaChyZXF1ZXN0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5lbGVtZW50TmVhckJvdHRvbV8ocmVzb3VyY2UsIGJveCkpIHtcbiAgICAgICAgICAvLyA2LiBFbGVtZW50cyBjbG9zZSB0byB0aGUgYm90dG9tIG9mIHRoZSBkb2N1bWVudCAobm90IHZpZXdwb3J0KVxuICAgICAgICAgIC8vIGFyZSByZXNpemVkIGltbWVkaWF0ZWx5LlxuICAgICAgICAgIHJlc2l6ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgaGVpZ2h0RGlmZiA8IDAgfHxcbiAgICAgICAgICB0b3BNYXJnaW5EaWZmIDwgMCB8fFxuICAgICAgICAgIGJvdHRvbU1hcmdpbkRpZmYgPCAwXG4gICAgICAgICkge1xuICAgICAgICAgIC8vIDcuIFRoZSBuZXcgaGVpZ2h0IChvciBvbmUgb2YgdGhlIG1hcmdpbnMpIGlzIHNtYWxsZXIgdGhhbiB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IG9uZS5cbiAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm5ld0hlaWdodCA9PSBib3guaGVpZ2h0KSB7XG4gICAgICAgICAgLy8gOC4gRWxlbWVudCBpcyBpbiB2aWV3cG9ydCwgYnV0IHRoaXMgaXMgYSB3aWR0aC1vbmx5IGV4cGFuc2lvbi5cbiAgICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoaXMgc2hvdWxkIGJlIHJlZmxvdy1mcmVlLCBpbiB3aGljaCBjYXNlLFxuICAgICAgICAgIC8vIHNjaGVkdWxlIGEgc2l6ZSBjaGFuZ2UuXG4gICAgICAgICAgdGhpcy52c3luY18ucnVuKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBtZWFzdXJlOiAoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgICBzdGF0ZS5yZXNpemUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSByZXNvdXJjZS5lbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgc2libGluZ3MsIGl0J3MgcG9zc2libGUgdGhhdCBhIHdpZHRoLWV4cGFuc2lvbiB3aWxsXG4gICAgICAgICAgICAgICAgLy8gY2F1c2Ugc29tZSBvZiB0aGVtIHRvIGJlIHB1c2hlZCBkb3duLlxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudFdpZHRoID1cbiAgICAgICAgICAgICAgICAgIChwYXJlbnQuZ2V0TGF5b3V0U2l6ZSAmJiBwYXJlbnQuZ2V0TGF5b3V0U2l6ZSgpLndpZHRoKSB8fFxuICAgICAgICAgICAgICAgICAgcGFyZW50Li8qT0sqLyBvZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICBsZXQgY3VtdWxhdGl2ZVdpZHRoID0gd2lkdGhEaWZmO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFyZW50LmNoaWxkRWxlbWVudENvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgIGN1bXVsYXRpdmVXaWR0aCArPSBwYXJlbnQuY2hpbGRyZW5baV0uLypPSyovIG9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgaWYgKGN1bXVsYXRpdmVXaWR0aCA+IHBhcmVudFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RhdGUucmVzaXplID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbXV0YXRlOiAoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUucmVzaXplKSB7XG4gICAgICAgICAgICAgICAgICByZXF1ZXN0LnJlc291cmNlLmNoYW5nZVNpemUoXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QubmV3SGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Lm5ld1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICBuZXdNYXJnaW5zXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXF1ZXN0LnJlc291cmNlLm92ZXJmbG93Q2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAvKiBvdmVyZmxvd24gKi8gIXN0YXRlLnJlc2l6ZSxcbiAgICAgICAgICAgICAgICAgIHJlcXVlc3QubmV3SGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgcmVxdWVzdC5uZXdXaWR0aCxcbiAgICAgICAgICAgICAgICAgIG5ld01hcmdpbnNcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHt9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyA5LiBFbGVtZW50IGlzIGluIHZpZXdwb3J0IGRvbid0IHJlc2l6ZSBhbmQgdHJ5IG92ZXJmbG93IGNhbGxiYWNrXG4gICAgICAgICAgLy8gaW5zdGVhZC5cbiAgICAgICAgICByZXF1ZXN0LnJlc291cmNlLm92ZXJmbG93Q2FsbGJhY2soXG4gICAgICAgICAgICAvKiBvdmVyZmxvd24gKi8gdHJ1ZSxcbiAgICAgICAgICAgIHJlcXVlc3QubmV3SGVpZ2h0LFxuICAgICAgICAgICAgcmVxdWVzdC5uZXdXaWR0aCxcbiAgICAgICAgICAgIG5ld01hcmdpbnNcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc2l6ZSkge1xuICAgICAgICAgIGlmIChib3gudG9wID49IDApIHtcbiAgICAgICAgICAgIG1pblRvcCA9IG1pblRvcCA9PSAtMSA/IGJveC50b3AgOiBNYXRoLm1pbihtaW5Ub3AsIGJveC50b3ApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXF1ZXN0LnJlc291cmNlLmNoYW5nZVNpemUoXG4gICAgICAgICAgICByZXF1ZXN0Lm5ld0hlaWdodCxcbiAgICAgICAgICAgIHJlcXVlc3QubmV3V2lkdGgsXG4gICAgICAgICAgICBuZXdNYXJnaW5zXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXF1ZXN0LnJlc291cmNlLm92ZXJmbG93Q2FsbGJhY2soXG4gICAgICAgICAgICAvKiBvdmVyZmxvd24gKi8gZmFsc2UsXG4gICAgICAgICAgICByZXF1ZXN0Lm5ld0hlaWdodCxcbiAgICAgICAgICAgIHJlcXVlc3QubmV3V2lkdGgsXG4gICAgICAgICAgICBuZXdNYXJnaW5zXG4gICAgICAgICAgKTtcbiAgICAgICAgICB0aGlzLm1heWJlQ2hhbmdlSGVpZ2h0XyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVxdWVzdC5jYWxsYmFjaykge1xuICAgICAgICAgIHJlcXVlc3QuY2FsbGJhY2soLyogaGFzU2l6ZUNoYW5nZWQgKi8gcmVzaXplKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobWluVG9wICE9IC0xKSB7XG4gICAgICAgIHRoaXMuc2V0UmVsYXlvdXRUb3AobWluVG9wKTtcbiAgICAgIH1cblxuICAgICAgLy8gRXhlY3V0ZSBzY3JvbGwtYWRqdXN0aW5nIHJlc2l6ZSByZXF1ZXN0cywgaWYgYW55LlxuICAgICAgaWYgKHNjcm9sbEFkalNldC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMudnN5bmNfLnJ1bihcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZWFzdXJlOiAoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgc3RhdGUuLypPSyovIHNjcm9sbEhlaWdodCA9XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3cG9ydF8uLypPSyovIGdldFNjcm9sbEhlaWdodCgpO1xuICAgICAgICAgICAgICBzdGF0ZS4vKk9LKi8gc2Nyb2xsVG9wID0gdGhpcy52aWV3cG9ydF8uLypPSyovIGdldFNjcm9sbFRvcCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG11dGF0ZTogKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgIGxldCBtaW5Ub3AgPSAtMTtcbiAgICAgICAgICAgICAgc2Nyb2xsQWRqU2V0LmZvckVhY2goKHJlcXVlc3QpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBib3ggPSByZXF1ZXN0LnJlc291cmNlLmdldExheW91dEJveCgpO1xuICAgICAgICAgICAgICAgIG1pblRvcCA9IG1pblRvcCA9PSAtMSA/IGJveC50b3AgOiBNYXRoLm1pbihtaW5Ub3AsIGJveC50b3ApO1xuICAgICAgICAgICAgICAgIHJlcXVlc3QucmVzb3VyY2UuY2hhbmdlU2l6ZShcbiAgICAgICAgICAgICAgICAgIHJlcXVlc3QubmV3SGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgcmVxdWVzdC5uZXdXaWR0aCxcbiAgICAgICAgICAgICAgICAgIHJlcXVlc3QubWFyZ2luQ2hhbmdlXG4gICAgICAgICAgICAgICAgICAgID8gcmVxdWVzdC5tYXJnaW5DaGFuZ2UubmV3TWFyZ2luc1xuICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3QuY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgIHJlcXVlc3QuY2FsbGJhY2soLyogaGFzU2l6ZUNoYW5nZWQgKi8gdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKG1pblRvcCAhPSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0UmVsYXlvdXRUb3AobWluVG9wKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBTeW5jIGlzIG5lY2Vzc2FyeSBoZXJlIHRvIGF2b2lkIFVJIGp1bXAgaW4gdGhlIG5leHQgZnJhbWUuXG4gICAgICAgICAgICAgIGNvbnN0IG5ld1Njcm9sbEhlaWdodCA9IHRoaXMudmlld3BvcnRfLi8qT0sqLyBnZXRTY3JvbGxIZWlnaHQoKTtcbiAgICAgICAgICAgICAgaWYgKG5ld1Njcm9sbEhlaWdodCAhPSBzdGF0ZS4vKk9LKi8gc2Nyb2xsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3cG9ydF8uc2V0U2Nyb2xsVG9wKFxuICAgICAgICAgICAgICAgICAgc3RhdGUuLypPSyovIHNjcm9sbFRvcCArXG4gICAgICAgICAgICAgICAgICAgIChuZXdTY3JvbGxIZWlnaHQgLSBzdGF0ZS4vKk9LKi8gc2Nyb2xsSGVpZ2h0KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGhpcy5tYXliZUNoYW5nZUhlaWdodF8gPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHt9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBlbGVtZW50IGlzIHdpdGhpbiAxNSUgYW5kIDEwMDBweCBvZiBkb2N1bWVudCBib3R0b20uXG4gICAqIENhbGxlciBjYW4gcHJvdmlkZSBjdXJyZW50L2luaXRpYWwgbGF5b3V0IGJveGVzIGFzIGFuIG9wdGltaXphdGlvbi5cbiAgICogQHBhcmFtIHshLi9yZXNvdXJjZS5SZXNvdXJjZX0gcmVzb3VyY2VcbiAgICogQHBhcmFtIHshLi4vbGF5b3V0LXJlY3QuTGF5b3V0UmVjdERlZj19IG9wdF9sYXlvdXRCb3hcbiAgICogQHBhcmFtIHshLi4vbGF5b3V0LXJlY3QuTGF5b3V0UmVjdERlZj19IG9wdF9pbml0aWFsTGF5b3V0Qm94XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbGVtZW50TmVhckJvdHRvbV8ocmVzb3VyY2UsIG9wdF9sYXlvdXRCb3gsIG9wdF9pbml0aWFsTGF5b3V0Qm94KSB7XG4gICAgY29uc3QgY29udGVudEhlaWdodCA9IHRoaXMudmlld3BvcnRfLmdldENvbnRlbnRIZWlnaHQoKTtcbiAgICBjb25zdCB0aHJlc2hvbGQgPSBNYXRoLm1heChjb250ZW50SGVpZ2h0ICogMC44NSwgY29udGVudEhlaWdodCAtIDEwMDApO1xuXG4gICAgY29uc3QgYm94ID0gb3B0X2xheW91dEJveCB8fCByZXNvdXJjZS5nZXRMYXlvdXRCb3goKTtcbiAgICBjb25zdCBpbml0aWFsQm94ID0gb3B0X2luaXRpYWxMYXlvdXRCb3ggfHwgcmVzb3VyY2UuZ2V0SW5pdGlhbExheW91dEJveCgpO1xuICAgIHJldHVybiBib3guYm90dG9tID49IHRocmVzaG9sZCB8fCBpbml0aWFsQm94LmJvdHRvbSA+PSB0aHJlc2hvbGQ7XG4gIH1cblxuICAvKipcbiAgICogQWx3YXlzIHJldHVybnMgdHJ1ZSB1bmxlc3MgdGhlIHJlc291cmNlIHdhcyBwcmV2aW91c2x5IGRpc3BsYXllZCBidXQgaXNcbiAgICogbm90IGRpc3BsYXllZCBub3cgKGkuZS4gdGhlIHJlc291cmNlIHNob3VsZCBiZSB1bmxvYWRlZCkuXG4gICAqIEBwYXJhbSB7IVJlc291cmNlfSByXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtZWFzdXJlUmVzb3VyY2VfKHIpIHtcbiAgICBjb25zdCB3YXNEaXNwbGF5ZWQgPSByLmlzRGlzcGxheWVkKCk7XG4gICAgci5tZWFzdXJlKCk7XG4gICAgcmV0dXJuICEod2FzRGlzcGxheWVkICYmICFyLmlzRGlzcGxheWVkKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVubG9hZHMgZ2l2ZW4gcmVzb3VyY2VzIGluIGFuIGFzeW5jIG11dGF0ZSBwaGFzZS5cbiAgICogQHBhcmFtIHshQXJyYXk8IVJlc291cmNlPn0gcmVzb3VyY2VzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1bmxvYWRSZXNvdXJjZXNfKHJlc291cmNlcykge1xuICAgIGlmIChyZXNvdXJjZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnZzeW5jXy5tdXRhdGUoKCkgPT4ge1xuICAgICAgICByZXNvdXJjZXMuZm9yRWFjaCgocikgPT4ge1xuICAgICAgICAgIHIudW5sb2FkKCk7XG4gICAgICAgICAgdGhpcy5jbGVhbnVwVGFza3NfKHIpO1xuICAgICAgICB9KTtcbiAgICAgICAgZGV2KCkuZmluZShUQUdfLCAndW5sb2FkOicsIHJlc291cmNlcyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlzY292ZXJzIHdvcmsgdGhhdCBuZWVkcyB0byBiZSBkb25lIHNpbmNlIHRoZSBsYXN0IHBhc3MuIElmIHZpZXdwb3J0XG4gICAqIGhhcyBjaGFuZ2VkLCBpdCB3aWxsIHRyeSB0byBidWlsZCBuZXcgZWxlbWVudHMsIG1lYXN1cmUgY2hhbmdlZCBlbGVtZW50cyxcbiAgICogYW5kIHNjaGVkdWxlIGxheW91dHMgYW5kIHByZWxvYWRzIHdpdGhpbiBhIHJlYXNvbmFibGUgZGlzdGFuY2Ugb2YgdGhlXG4gICAqIGN1cnJlbnQgdmlld3BvcnQuIEZpbmFsbHksIHRoaXMgcHJvY2VzcyBhbHNvIHVwZGF0ZXMgaW5WaWV3cG9ydCBzdGF0ZVxuICAgKiBvZiBjaGFuZ2VkIGVsZW1lbnRzLlxuICAgKlxuICAgKiBMYXlvdXRzIGFuZCBwcmVsb2FkcyBhcmUgbm90IGV4ZWN1dGVkIGltbWVkaWF0ZWx5LCBidXQgaW5zdGVhZCBzY2hlZHVsZWRcbiAgICogaW4gdGhlIHF1ZXVlIHdpdGggZGlmZmVyZW50IHByaW9yaXRpZXMuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkaXNjb3ZlcldvcmtfKCkge1xuICAgIC8vIFRPRE8oZHZveXRlbmtvKTogdnN5bmMgc2VwYXJhdGlvbiBtYXkgYmUgbmVlZGVkIGZvciBkaWZmZXJlbnQgcGhhc2VzXG5cbiAgICBjb25zdCBub3cgPSB0aGlzLndpbi5EYXRlLm5vdygpO1xuXG4gICAgLy8gRW5zdXJlIGFsbCByZXNvdXJjZXMgbGF5b3V0IHBoYXNlIGNvbXBsZXRlOyB3aGVuIHJlbGF5b3V0QWxsIGlzIHJlcXVlc3RlZFxuICAgIC8vIGZvcmNlIHJlLWxheW91dC5cbiAgICBjb25zdCB7XG4gICAgICBlbGVtZW50c1RoYXRTY3JvbGxlZF86IGVsZW1lbnRzVGhhdFNjcm9sbGVkLFxuICAgICAgcmVsYXlvdXRBbGxfOiByZWxheW91dEFsbCxcbiAgICAgIHJlbGF5b3V0VG9wXzogcmVsYXlvdXRUb3AsXG4gICAgfSA9IHRoaXM7XG4gICAgdGhpcy5yZWxheW91dEFsbF8gPSBmYWxzZTtcbiAgICB0aGlzLnJlbGF5b3V0VG9wXyA9IC0xO1xuXG4gICAgLy8gUGhhc2UgMTogQnVpbGQgYW5kIHJlbGF5b3V0IGFzIG5lZWRlZC4gQWxsIG11dGF0aW9ucyBoYXBwZW4gaGVyZS5cbiAgICBsZXQgcmVsYXlvdXRDb3VudCA9IDA7XG4gICAgbGV0IHJlbWVhc3VyZUNvdW50ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVzb3VyY2VzXy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVzb3VyY2VzX1tpXTtcbiAgICAgIGlmIChcbiAgICAgICAgci5nZXRTdGF0ZSgpID09IFJlc291cmNlU3RhdGUuTk9UX0JVSUxUICYmXG4gICAgICAgICFyLmlzQnVpbGRpbmcoKSAmJlxuICAgICAgICAhci5lbGVtZW50LlIxKClcbiAgICAgICkge1xuICAgICAgICB0aGlzLmJ1aWxkT3JTY2hlZHVsZUJ1aWxkRm9yUmVzb3VyY2VfKHIsIC8qIGNoZWNrRm9yRHVwZXMgKi8gdHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgcmVsYXlvdXRBbGwgfHxcbiAgICAgICAgIXIuaGFzQmVlbk1lYXN1cmVkKCkgfHxcbiAgICAgICAgLy8gTk9UX0xBSURfT1VUIGlzIHRoZSBzdGF0ZSBhZnRlciBidWlsZCgpIGJ1dCBiZWZvcmUgbWVhc3VyZSgpLlxuICAgICAgICByLmdldFN0YXRlKCkgPT0gUmVzb3VyY2VTdGF0ZS5OT1RfTEFJRF9PVVRcbiAgICAgICkge1xuICAgICAgICByZWxheW91dENvdW50Kys7XG4gICAgICB9XG4gICAgICBpZiAoci5pc01lYXN1cmVSZXF1ZXN0ZWQoKSkge1xuICAgICAgICByZW1lYXN1cmVDb3VudCsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFBoYXNlIDI6IFJlbWVhc3VyZSBpZiB0aGVyZSB3ZXJlIGFueSByZWxheW91dHMuIFVuZm9ydHVuYXRlbHksIGN1cnJlbnRseVxuICAgIC8vIHRoZXJlJ3Mgbm8gd2F5IHRvIG9wdGltaXplIHRoaXMuIEFsbCByZWFkcyBoYXBwZW4gaGVyZS5cbiAgICBsZXQgdG9VbmxvYWQ7XG4gICAgaWYgKFxuICAgICAgcmVsYXlvdXRDb3VudCA+IDAgfHxcbiAgICAgIHJlbWVhc3VyZUNvdW50ID4gMCB8fFxuICAgICAgcmVsYXlvdXRBbGwgfHxcbiAgICAgIHJlbGF5b3V0VG9wICE9IC0xIHx8XG4gICAgICBlbGVtZW50c1RoYXRTY3JvbGxlZC5sZW5ndGggPiAwXG4gICAgKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVzb3VyY2VzXy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCByID0gdGhpcy5yZXNvdXJjZXNfW2ldO1xuICAgICAgICBpZiAoKHIuaGFzT3duZXIoKSAmJiAhci5pc01lYXN1cmVSZXF1ZXN0ZWQoKSkgfHwgci5lbGVtZW50LlIxKCkpIHtcbiAgICAgICAgICAvLyBJZiBlbGVtZW50IGhhcyBvd25lciwgYW5kIG1lYXN1cmUgaXMgbm90IHJlcXVlc3RlZCwgZG8gbm90aGluZy5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbmVlZHNNZWFzdXJlID1cbiAgICAgICAgICByZWxheW91dEFsbCB8fFxuICAgICAgICAgIHIuZ2V0U3RhdGUoKSA9PSBSZXNvdXJjZVN0YXRlLk5PVF9MQUlEX09VVCB8fFxuICAgICAgICAgICFyLmhhc0JlZW5NZWFzdXJlZCgpIHx8XG4gICAgICAgICAgci5pc01lYXN1cmVSZXF1ZXN0ZWQoKSB8fFxuICAgICAgICAgIChyZWxheW91dFRvcCAhPSAtMSAmJiByLmdldExheW91dEJveCgpLmJvdHRvbSA+PSByZWxheW91dFRvcCk7XG5cbiAgICAgICAgaWYgKCFuZWVkc01lYXN1cmUpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzVGhhdFNjcm9sbGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBUT0RPKGpyaWRnZXdlbGwpOiBOZWVkIHRvIGZpZ3VyZSBvdXQgaG93IFNoYWRvd1Jvb3RzIGFuZCBGSUVzXG4gICAgICAgICAgICAvLyBzaG91bGQgYmVoYXZlIGluIHRoaXMgbW9kZWwuIElmIHRoZSBTaGFkb3dSb290J3MgaG9zdCBzY3JvbGxzLFxuICAgICAgICAgICAgLy8gZG8gd2UgbmVlZCB0byBpbnZhbGlkYXRlIGluc2lkZSB0aGUgc2hhZG93IG9yIGxpZ2h0IHRyZWU/IE9yIGlmXG4gICAgICAgICAgICAvLyB0aGUgRklFJ3MgaWZyYW1lIHBhcmVudCBzY3JvbGxzLCBkbyB3ZT9cbiAgICAgICAgICAgIGlmIChlbGVtZW50c1RoYXRTY3JvbGxlZFtpXS5jb250YWlucyhyLmVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgIG5lZWRzTWVhc3VyZSA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZWVkc01lYXN1cmUpIHtcbiAgICAgICAgICBjb25zdCBpc0Rpc3BsYXllZCA9IHRoaXMubWVhc3VyZVJlc291cmNlXyhyKTtcbiAgICAgICAgICBpZiAoIWlzRGlzcGxheWVkKSB7XG4gICAgICAgICAgICBpZiAoIXRvVW5sb2FkKSB7XG4gICAgICAgICAgICAgIHRvVW5sb2FkID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b1VubG9hZC5wdXNoKHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlbGVtZW50c1RoYXRTY3JvbGxlZC5sZW5ndGggPSAwO1xuXG4gICAgLy8gVW5sb2FkIGFsbCBpbiBvbmUgY3ljbGUuXG4gICAgaWYgKHRvVW5sb2FkKSB7XG4gICAgICB0aGlzLnVubG9hZFJlc291cmNlc18odG9VbmxvYWQpO1xuICAgIH1cblxuICAgIGNvbnN0IHZpZXdwb3J0UmVjdCA9IHRoaXMudmlld3BvcnRfLmdldFJlY3QoKTtcbiAgICAvLyBMb2FkIHZpZXdwb3J0ID0gdmlld3BvcnQgKyAzeCB1cC9kb3duIHdoZW4gZG9jdW1lbnQgaXMgdmlzaWJsZS5cbiAgICBsZXQgbG9hZFJlY3Q7XG4gICAgaWYgKHRoaXMudmlzaWJsZV8pIHtcbiAgICAgIGxvYWRSZWN0ID0gZXhwYW5kTGF5b3V0UmVjdCh2aWV3cG9ydFJlY3QsIDAuMjUsIDIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2FkUmVjdCA9IHZpZXdwb3J0UmVjdDtcbiAgICB9XG5cbiAgICBjb25zdCB2aXNpYmxlUmVjdCA9IHRoaXMudmlzaWJsZV9cbiAgICAgID8gLy8gV2hlbiB0aGUgZG9jIGlzIHZpc2libGUsIGNvbnNpZGVyIHRoZSB2aWV3cG9ydCB0byBiZSAyNSUgbGFyZ2VyLFxuICAgICAgICAvLyB0byBtaW5pbWl6ZSBlZmZlY3QgZnJvbSBzbWFsbCBzY3JvbGxpbmcgYW5kIG5vdGlmeSB0aGluZ3MgdGhhdFxuICAgICAgICAvLyB0aGV5IGFyZSBpbiB2aWV3cG9ydCBqdXN0IGJlZm9yZSB0aGV5IGFyZSBhY3R1YWxseSB2aXNpYmxlLlxuICAgICAgICBleHBhbmRMYXlvdXRSZWN0KHZpZXdwb3J0UmVjdCwgMC4yNSwgMC4yNSlcbiAgICAgIDogdmlld3BvcnRSZWN0O1xuXG4gICAgLy8gUGhhc2UgMzogU2V0IGluVmlld3BvcnQgc3RhdHVzIGZvciByZXNvdXJjZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlc291cmNlc18ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlc291cmNlc19baV07XG4gICAgICBpZiAoXG4gICAgICAgIHIuZ2V0U3RhdGUoKSA9PSBSZXNvdXJjZVN0YXRlLk5PVF9CVUlMVCB8fFxuICAgICAgICByLmhhc093bmVyKCkgfHxcbiAgICAgICAgci5lbGVtZW50LlIxKClcbiAgICAgICkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIC8vIE5vdGUgdGhhdCB3aGVuIHRoZSBkb2N1bWVudCBpcyBub3QgdmlzaWJsZSwgbmVpdGhlciBhcmUgYW55IG9mIGl0c1xuICAgICAgLy8gZWxlbWVudHMgdG8gcmVkdWNlIENQVSBjeWNsZXMuXG4gICAgICAvLyBUT0RPKGR2b3l0ZW5rbywgIzM0MzQpOiBSZWltcGxlbWVudCB0aGUgdXNlIG9mIGBpc0ZpeGVkYCB3aXRoXG4gICAgICAvLyBsYXllcnMuIFRoaXMgaXMgY3VycmVudGx5IGEgc2hvcnQtdGVybSBmaXggdG8gdGhlIHByb2JsZW0gdGhhdFxuICAgICAgLy8gdGhlIGZpeGVkIGVsZW1lbnRzIGdldCBpbmNvcnJlY3QgdG9wIGNvb3JkLlxuICAgICAgY29uc3Qgc2hvdWxkQmVJblZpZXdwb3J0ID1cbiAgICAgICAgdGhpcy52aXNpYmxlXyAmJiByLmlzRGlzcGxheWVkKCkgJiYgci5vdmVybGFwcyh2aXNpYmxlUmVjdCk7XG4gICAgICByLnNldEluVmlld3BvcnQoc2hvdWxkQmVJblZpZXdwb3J0KTtcbiAgICB9XG5cbiAgICAvLyBQaGFzZSA0OiBTY2hlZHVsZSBlbGVtZW50cyBmb3IgbGF5b3V0IHdpdGhpbiBhIHJlYXNvbmFibGUgZGlzdGFuY2UgZnJvbVxuICAgIC8vIGN1cnJlbnQgdmlld3BvcnQuXG4gICAgaWYgKGxvYWRSZWN0KSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVzb3VyY2VzXy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCByID0gdGhpcy5yZXNvdXJjZXNfW2ldO1xuICAgICAgICAvLyBUT0RPKGR2b3l0ZW5rbyk6IFRoaXMgZXh0cmEgYnVpbGQgaGFzIHRvIGJlIG1lcmdlZCB3aXRoIHRoZVxuICAgICAgICAvLyBzY2hlZHVsZUxheW91dE9yUHJlbG9hZCBtZXRob2QgYmVsb3cuXG4gICAgICAgIC8vIEJ1aWxkIGFsbCByZXNvdXJjZXMgdmlzaWJsZSwgbWVhc3VyZWQsIGFuZCBpbiB0aGUgdmlld3BvcnQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAhci5pc0J1aWx0KCkgJiZcbiAgICAgICAgICAhci5pc0J1aWxkaW5nKCkgJiZcbiAgICAgICAgICAhci5oYXNPd25lcigpICYmXG4gICAgICAgICAgIXIuZWxlbWVudC5SMSgpICYmXG4gICAgICAgICAgci5oYXNCZWVuTWVhc3VyZWQoKSAmJlxuICAgICAgICAgIHIuaXNEaXNwbGF5ZWQoKSAmJlxuICAgICAgICAgIHIub3ZlcmxhcHMobG9hZFJlY3QpXG4gICAgICAgICkge1xuICAgICAgICAgIHRoaXMuYnVpbGRPclNjaGVkdWxlQnVpbGRGb3JSZXNvdXJjZV8oXG4gICAgICAgICAgICByLFxuICAgICAgICAgICAgLyogY2hlY2tGb3JEdXBlcyAqLyB0cnVlLFxuICAgICAgICAgICAgLyogaWdub3JlUXVvdGEgKi8gdHJ1ZVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHIuZ2V0U3RhdGUoKSAhPSBSZXNvdXJjZVN0YXRlLlJFQURZX0ZPUl9MQVlPVVQgfHwgci5oYXNPd25lcigpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyhkdm95dGVua28sICMzNDM0KTogUmVpbXBsZW1lbnQgdGhlIHVzZSBvZiBgaXNGaXhlZGAgd2l0aFxuICAgICAgICAvLyBsYXllcnMuIFRoaXMgaXMgY3VycmVudGx5IGEgc2hvcnQtdGVybSBmaXggdG8gdGhlIHByb2JsZW0gdGhhdFxuICAgICAgICAvLyB0aGUgZml4ZWQgZWxlbWVudHMgZ2V0IGluY29ycmVjdCB0b3AgY29vcmQuXG4gICAgICAgIGlmIChyLmlzRGlzcGxheWVkKCkgJiYgci5vdmVybGFwcyhsb2FkUmVjdCkpIHtcbiAgICAgICAgICB0aGlzLnNjaGVkdWxlTGF5b3V0T3JQcmVsb2FkKHIsIC8qIGxheW91dCAqLyB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnZpc2libGVfICYmIHRoaXMuaXNJZGxlXyhub3cpKSB7XG4gICAgICAvLyBQaGFzZSA1OiBJZGxlIFJlbmRlciBPdXRzaWRlIFZpZXdwb3J0IGxheW91dDogbGF5b3V0IHVwIHRvIDQgaXRlbXNcbiAgICAgIC8vIHdpdGggaWRsZVJlbmRlck91dHNpZGVWaWV3cG9ydCB0cnVlXG4gICAgICBsZXQgaWRsZVNjaGVkdWxlZENvdW50ID0gMDtcbiAgICAgIGZvciAoXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgaSA8IHRoaXMucmVzb3VyY2VzXy5sZW5ndGggJiYgaWRsZVNjaGVkdWxlZENvdW50IDwgNDtcbiAgICAgICAgaSsrXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgciA9IHRoaXMucmVzb3VyY2VzX1tpXTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHIuZ2V0U3RhdGUoKSA9PSBSZXNvdXJjZVN0YXRlLlJFQURZX0ZPUl9MQVlPVVQgJiZcbiAgICAgICAgICAhci5oYXNPd25lcigpICYmXG4gICAgICAgICAgIXIuZWxlbWVudC5SMSgpICYmXG4gICAgICAgICAgci5pc0Rpc3BsYXllZCgpICYmXG4gICAgICAgICAgci5pZGxlUmVuZGVyT3V0c2lkZVZpZXdwb3J0KClcbiAgICAgICAgKSB7XG4gICAgICAgICAgZGV2KCkuZmluZShUQUdfLCAnaWRsZVJlbmRlck91dHNpZGVWaWV3cG9ydCBsYXlvdXQ6Jywgci5kZWJ1Z2lkKTtcbiAgICAgICAgICB0aGlzLnNjaGVkdWxlTGF5b3V0T3JQcmVsb2FkKHIsIC8qIGxheW91dCAqLyBmYWxzZSk7XG4gICAgICAgICAgaWRsZVNjaGVkdWxlZENvdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFBoYXNlIDY6IElkbGUgbGF5b3V0OiBsYXlvdXQgbW9yZSBpZiB3ZSBhcmUgb3RoZXJ3aXNlIG5vdCBkb2luZyBtdWNoLlxuICAgICAgLy8gVE9ETyhkdm95dGVua28pOiBkb2N1bWVudC9lc3RpbWF0ZSBJRExFIHRpbWVvdXRzIGFuZCBvdGhlciBjb25zdGFudHNcbiAgICAgIGZvciAoXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgaSA8IHRoaXMucmVzb3VyY2VzXy5sZW5ndGggJiYgaWRsZVNjaGVkdWxlZENvdW50IDwgNDtcbiAgICAgICAgaSsrXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgciA9IHRoaXMucmVzb3VyY2VzX1tpXTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHIuZ2V0U3RhdGUoKSA9PSBSZXNvdXJjZVN0YXRlLlJFQURZX0ZPUl9MQVlPVVQgJiZcbiAgICAgICAgICAhci5oYXNPd25lcigpICYmXG4gICAgICAgICAgIXIuZWxlbWVudC5SMSgpICYmXG4gICAgICAgICAgci5pc0Rpc3BsYXllZCgpXG4gICAgICAgICkge1xuICAgICAgICAgIGRldigpLmZpbmUoVEFHXywgJ2lkbGUgbGF5b3V0OicsIHIuZGVidWdpZCk7XG4gICAgICAgICAgdGhpcy5zY2hlZHVsZUxheW91dE9yUHJlbG9hZChyLCAvKiBsYXlvdXQgKi8gZmFsc2UpO1xuICAgICAgICAgIGlkbGVTY2hlZHVsZWRDb3VudCsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHBhZ2UgaXMgcmVsYXRpdmVseSBcImlkbGVcIi4gRm9yIG5vdywgaXQncyBjaGVja2luZyBpZiBpdCdzIGJlZW5cbiAgICogYSB3aGlsZSBzaW5jZSB0aGUgbGFzdCBlbGVtZW50IHJlY2VpdmVkIGEgbGF5b3V0Q2FsbGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBub3dcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzSWRsZV8obm93ID0gRGF0ZS5ub3coKSkge1xuICAgIGNvbnN0IGxhc3REZXF1ZXVlVGltZSA9IHRoaXMuZXhlY18uZ2V0TGFzdERlcXVldWVUaW1lKCk7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuZXhlY18uZ2V0U2l6ZSgpID09IDAgJiZcbiAgICAgIHRoaXMucXVldWVfLmdldFNpemUoKSA9PSAwICYmXG4gICAgICBub3cgPiBsYXN0RGVxdWV1ZVRpbWUgKyA1MDAwICYmXG4gICAgICBsYXN0RGVxdWV1ZVRpbWUgPiAwXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXF1ZXVlcyBsYXlvdXQgYW5kIHByZWxvYWQgdGFza3MgZnJvbSB0aGUgcXVldWUgYW5kIGluaXRpYXRlcyB0aGVpclxuICAgKiBleGVjdXRpb24uXG4gICAqXG4gICAqIFRoZXJlIGFyZSB0d28gbWFpbiBkcml2ZXJzIHRvIGRlcXVldWVpbmc6IGEgdGFzaydzIHNjb3JlIGFuZCB0aW1lb3V0LiBUaGVcbiAgICogc2NvcmUgaXMgYnVpbHQgYmFzZWQgb24gdGhlIHJlc291cmNlJ3MgcHJpb3JpdHkgYW5kIHZpZXdwb3J0IGxvY2F0aW9uXG4gICAqIChzZWUge0BsaW5rIGNhbGNUYXNrU2NvcmVffSkuIFRpbWVvdXQgZGVwZW5kcyBvbiB0aGUgcHJpb3JpdHkgYW5kIGFnZVxuICAgKiBvZiB0YXNrcyBjdXJyZW50bHkgaW4gdGhlIGV4ZWN1dGlvbiBwb29sIChzZWUge0BsaW5rIGNhbGNUYXNrVGltZW91dF99KS5cbiAgICpcbiAgICogQHJldHVybiB7IXRpbWV9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB3b3JrXygpIHtcbiAgICBjb25zdCBub3cgPSB0aGlzLndpbi5EYXRlLm5vdygpO1xuXG4gICAgbGV0IHRpbWVvdXQgPSAtMTtcbiAgICBsZXQgdGFzayA9IHRoaXMucXVldWVfLnBlZWsodGhpcy5ib3VuZFRhc2tTY29yZXJfKTtcbiAgICB3aGlsZSAodGFzaykge1xuICAgICAgdGltZW91dCA9IHRoaXMuY2FsY1Rhc2tUaW1lb3V0Xyh0YXNrKTtcbiAgICAgIGRldigpLmZpbmUoXG4gICAgICAgIFRBR18sXG4gICAgICAgICdwZWVrIGZyb20gcXVldWU6JyxcbiAgICAgICAgdGFzay5pZCxcbiAgICAgICAgJ3NjaGVkIGF0JyxcbiAgICAgICAgdGFzay5zY2hlZHVsZVRpbWUsXG4gICAgICAgICdzY29yZScsXG4gICAgICAgIHRoaXMuYm91bmRUYXNrU2NvcmVyXyh0YXNrKSxcbiAgICAgICAgJ3RpbWVvdXQnLFxuICAgICAgICB0aW1lb3V0XG4gICAgICApO1xuICAgICAgaWYgKHRpbWVvdXQgPiAxNikge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdGhpcy5xdWV1ZV8uZGVxdWV1ZSh0YXNrKTtcblxuICAgICAgLy8gRG8gbm90IG92ZXJyaWRlIGEgdGFzayBpbiBleGVjdXRpb24uIFRoaXMgdGFzayB3aWxsIGhhdmUgdG8gd2FpdFxuICAgICAgLy8gdW50aWwgdGhlIGN1cnJlbnQgb25lIGZpbmlzaGVkIHRoZSBleGVjdXRpb24uXG4gICAgICBjb25zdCBleGVjdXRpbmcgPSB0aGlzLmV4ZWNfLmdldFRhc2tCeUlkKHRhc2suaWQpO1xuICAgICAgaWYgKGV4ZWN1dGluZykge1xuICAgICAgICAvLyBSZXNjaGVkdWxlIHBvc3QgZXhlY3V0aW9uLlxuICAgICAgICBjb25zdCByZXNjaGVkdWxlID0gdGhpcy5yZXNjaGVkdWxlXy5iaW5kKHRoaXMsIHRhc2spO1xuICAgICAgICBleGVjdXRpbmcucHJvbWlzZS50aGVuKHJlc2NoZWR1bGUsIHJlc2NoZWR1bGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qge3Jlc291cmNlfSA9IHRhc2s7XG5cbiAgICAgICAgY29uc3Qgc3RpbGxEaXNwbGF5ZWQgPSB0cnVlO1xuICAgICAgICAvLyBSZW1lYXN1cmUgY2FuIG9ubHkgdXBkYXRlIGlzRGlzcGxheWVkKCksIG5vdCBpbi12aWV3cG9ydCBzdGF0ZS5cbiAgICAgICAgcmVzb3VyY2UubWVhc3VyZSgpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBlbGVtZW50IGhhcyBleGl0ZWQgdGhlIHZpZXdwb3J0IG9yIHRoZSBwYWdlIGhhcyBjaGFuZ2VkXG4gICAgICAgIC8vIHZpc2liaWxpdHkgc2luY2UgdGhlIGxheW91dCB3YXMgc2NoZWR1bGVkLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgc3RpbGxEaXNwbGF5ZWQgJiZcbiAgICAgICAgICB0aGlzLmlzTGF5b3V0QWxsb3dlZF8ocmVzb3VyY2UsIHRhc2suZm9yY2VPdXRzaWRlVmlld3BvcnQpXG4gICAgICAgICkge1xuICAgICAgICAgIHRhc2sucHJvbWlzZSA9IHRhc2suY2FsbGJhY2soKTtcbiAgICAgICAgICB0YXNrLnN0YXJ0VGltZSA9IG5vdztcbiAgICAgICAgICBkZXYoKS5maW5lKFRBR18sICdleGVjOicsIHRhc2suaWQsICdhdCcsIHRhc2suc3RhcnRUaW1lKTtcbiAgICAgICAgICB0aGlzLmV4ZWNfLmVucXVldWUodGFzayk7XG4gICAgICAgICAgdGFzay5wcm9taXNlXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgdGhpcy50YXNrQ29tcGxldGVfLmJpbmQodGhpcywgdGFzaywgdHJ1ZSksXG4gICAgICAgICAgICAgIHRoaXMudGFza0NvbXBsZXRlXy5iaW5kKHRoaXMsIHRhc2ssIGZhbHNlKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmNhdGNoKC8qKiBAdHlwZSB7ZnVuY3Rpb24gKCopfSAqLyAocmVwb3J0RXJyb3IpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZXYoKS5maW5lKFRBR18sICdjYW5jZWxsZWQnLCB0YXNrLmlkKTtcbiAgICAgICAgICByZXNvdXJjZS5sYXlvdXRDYW5jZWxlZCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRhc2sgPSB0aGlzLnF1ZXVlXy5wZWVrKHRoaXMuYm91bmRUYXNrU2NvcmVyXyk7XG4gICAgICB0aW1lb3V0ID0gLTE7XG4gICAgfVxuXG4gICAgZGV2KCkuZmluZShcbiAgICAgIFRBR18sXG4gICAgICAncXVldWUgc2l6ZTonLFxuICAgICAgdGhpcy5xdWV1ZV8uZ2V0U2l6ZSgpLFxuICAgICAgJ2V4ZWMgc2l6ZTonLFxuICAgICAgdGhpcy5leGVjXy5nZXRTaXplKClcbiAgICApO1xuXG4gICAgaWYgKHRpbWVvdXQgPj0gMCkge1xuICAgICAgLy8gU3RpbGwgdGFza3MgaW4gdGhlIHF1ZXVlLCBidXQgd2UgdG9vayB0b28gbXVjaCB0aW1lLlxuICAgICAgLy8gU2NoZWR1bGUgdGhlIG5leHQgd29yayBwYXNzLlxuICAgICAgcmV0dXJuIHRpbWVvdXQ7XG4gICAgfVxuXG4gICAgLy8gTm8gdGFza3MgbGVmdCBpbiB0aGUgcXVldWUuXG4gICAgLy8gU2NoZWR1bGUgdGhlIG5leHQgaWRsZSBwYXNzLlxuICAgIGxldCBuZXh0UGFzc0RlbGF5ID0gKG5vdyAtIHRoaXMuZXhlY18uZ2V0TGFzdERlcXVldWVUaW1lKCkpICogMjtcbiAgICBuZXh0UGFzc0RlbGF5ID0gTWF0aC5tYXgoTWF0aC5taW4oMzAwMDAsIG5leHRQYXNzRGVsYXkpLCA1MDAwKTtcbiAgICByZXR1cm4gbmV4dFBhc3NEZWxheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHRoZSB0YXNrJ3Mgc2NvcmUuIEEgdGFzayB3aXRoIHRoZSBsb3dlc3Qgc2NvcmUgd2lsbCBiZSBkZXF1ZXVlZFxuICAgKiBmcm9tIHRoZSBxdWV1ZSB0aGUgZmlyc3QuXG4gICAqXG4gICAqIFRoZXJlIGFyZSB0aHJlZSBjb21wb25lbnRzIG9mIHRoZSBzY29yZTogZWxlbWVudCdzIHByaW9yaXR5LCBvcGVyYXRpb24gb3JcbiAgICogb2Zmc2V0IHByaW9yaXR5IGFuZCB2aWV3cG9ydCBwcmlvcml0eS5cbiAgICpcbiAgICogRWxlbWVudCdzIHByaW9yaXR5IGlzIGNvbnN0YW50IG9mIHRoZSBlbGVtZW50J3MgbmFtZS4gRS5nLiBhbXAtaW1nIGhhcyBhXG4gICAqIHByaW9yaXR5IG9mIDAsIHdoaWxlIGFtcC1hZCBoYXMgYSBwcmlvcml0eSBvZiAyLlxuICAgKlxuICAgKiBUaGUgb3BlcmF0aW9uIChvZmZzZXQpIHByaW9yaXR5IGlzIHRoZSBwcmlvcml0eSBvZiB0aGUgdGFzay4gQSBsYXlvdXQgaXNcbiAgICogYSBoaWdoLXByaW9yaXR5IHRhc2sgd2hpbGUgcHJlbG9hZCBpcyBhIGxvd2VyLXByaW9yaXR5IHRhc2suXG4gICAqXG4gICAqIFZpZXdwb3J0IHByaW9yaXR5IGlzIGEgZnVuY3Rpb24gb2YgdGhlIGRpc3RhbmNlIG9mIHRoZSBlbGVtZW50IGZyb20gdGhlXG4gICAqIGN1cnJlbnRseSB2aXNpYmxlIHZpZXdwb3J0cy4gVGhlIGVsZW1lbnRzIGluIHRoZSB2aXNpYmxlIHZpZXdwb3J0IGdldFxuICAgKiBoaWdoZXIgcHJpb3JpdHkgYW5kIGZ1cnRoZXIgYXdheSBmcm9tIHRoZSB2aWV3cG9ydCBnZXQgbG93ZXIgcHJpb3JpdHkuXG4gICAqIFRoaXMgcHJpb3JpdHkgYWxzbyBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IHRoZSB1c2VyIGlzIHNjcm9sbGluZyB0b3dhcmRzXG4gICAqIHRoaXMgZWxlbWVudCBvciBhd2F5IGZyb20gaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7IS4vdGFzay1xdWV1ZS5UYXNrRGVmfSB0YXNrXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNhbGNUYXNrU2NvcmVfKHRhc2spIHtcbiAgICAvLyBUT0RPKGpyaWRnZXdlbGwpOiB0aGVzZSBzaG91bGQgYmUgdGFraW5nIGludG8gYWNjb3VudCB0aGUgYWN0aXZlXG4gICAgLy8gc2Nyb2xsZXIsIHdoaWNoIG1heSBub3QgYmUgdGhlIHJvb3Qgc2Nyb2xsZXIuIE1heWJlIGEgd2VpZ2h0ZWQgYXZlcmFnZVxuICAgIC8vIG9mIFwic2Nyb2xsZXIgc2Nyb2xscyBuZWNlc3NhcnlcIiB0byBzZWUgdGhlIGVsZW1lbnQuXG4gICAgLy8gRGVtbyBhdCBodHRwczovL291dHB1dC5qc2Jpbi5jb20vaGljaWdvbS9xdWlldFxuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy52aWV3cG9ydF8uZ2V0UmVjdCgpO1xuICAgIGNvbnN0IGJveCA9IHRhc2sucmVzb3VyY2UuZ2V0TGF5b3V0Qm94KCk7XG4gICAgbGV0IHBvc1ByaW9yaXR5ID0gTWF0aC5mbG9vcigoYm94LnRvcCAtIHZpZXdwb3J0LnRvcCkgLyB2aWV3cG9ydC5oZWlnaHQpO1xuICAgIGlmIChNYXRoLnNpZ24ocG9zUHJpb3JpdHkpICE9IHRoaXMuZ2V0U2Nyb2xsRGlyZWN0aW9uKCkpIHtcbiAgICAgIHBvc1ByaW9yaXR5ICo9IDI7XG4gICAgfVxuICAgIHBvc1ByaW9yaXR5ID0gTWF0aC5hYnMocG9zUHJpb3JpdHkpO1xuICAgIHJldHVybiB0YXNrLnByaW9yaXR5ICogUFJJT1JJVFlfQkFTRV8gKyBwb3NQcmlvcml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHRoZSB0aW1lb3V0IG9mIGEgdGFzay4gVGhlIHRpbWVvdXQgZGVwZW5kcyBvbiB0d28gbWFpbiBmYWN0b3JzOlxuICAgKiB0aGUgcHJpb3JpdGllcyBvZiB0aGUgdGFza3MgY3VycmVudGx5IGluIHRoZSBleGVjdXRpb24gcG9vbCBhbmQgdGhlaXIgYWdlLlxuICAgKiBUaGUgdGltZW91dCBpcyBjYWxjdWxhdGVkIGFnYWluc3QgZWFjaCB0YXNrIGluIHRoZSBleGVjdXRpb24gcG9vbCBhbmQgdGhlXG4gICAqIG1heGltdW0gdmFsdWUgaXMgcmV0dXJuZWQuXG4gICAqXG4gICAqIEEgdGFzayBpcyBwZW5hbGl6ZWQgd2l0aCBoaWdoZXIgdGltZW91dCB2YWx1ZXMgd2hlbiBpdCdzIGxvd2VyIGluIHByaW9yaXR5XG4gICAqIHRoYW4gdGhlIHRhc2sgaW4gdGhlIGV4ZWN1dGlvbiBwb29sLiBIb3dldmVyLCB0aGlzIHBlbmFsdHkgaXMganVkZ2VkXG4gICAqIGFnYWluc3QgdGhlIGFnZSBvZiB0aGUgZXhlY3V0aW5nIHRhc2suIElmIGl0IGhhcyBiZWVuIGluIGV4ZWN1dGluZyBmb3JcbiAgICogc29tZSB0aW1lLCB0aGUgcGVuYWx0eSBpcyByZWR1Y2VkLlxuICAgKlxuICAgKiBAcGFyYW0geyEuL3Rhc2stcXVldWUuVGFza0RlZn0gdGFza1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2FsY1Rhc2tUaW1lb3V0Xyh0YXNrKSB7XG4gICAgY29uc3Qgbm93ID0gdGhpcy53aW4uRGF0ZS5ub3coKTtcblxuICAgIGlmICh0aGlzLmV4ZWNfLmdldFNpemUoKSA9PSAwKSB7XG4gICAgICAvLyBJZiB3ZSd2ZSBuZXZlciBiZWVuIHZpc2libGUsIHJldHVybiAwLiBUaGlzIGZvbGxvd3MgdGhlIHByZXZpb3VzXG4gICAgICAvLyBiZWhhdmlvciBvZiBub3QgZGVsYXlpbmcgdGFza3Mgd2hlbiB0aGVyZSdzIG5vdGhpbmcgdG8gZG8uXG4gICAgICBpZiAodGhpcy5maXJzdFZpc2libGVUaW1lXyA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIC8vIFNjYWxlIG9mZiB0aGUgZmlyc3QgdmlzaWJsZSB0aW1lLCBzbyBwZW5hbGl6ZWQgdGFza3MgbXVzdCB3YWl0IGFcbiAgICAgIC8vIHNlY29uZCBvciB0d28gdG8gcnVuLiBBZnRlciB3ZSBoYXZlIGJlZW4gdmlzaWJsZSBmb3IgYSB0aW1lLCB3ZSBub1xuICAgICAgLy8gbG9uZ2VyIGhhdmUgdG8gd2FpdC5cbiAgICAgIGNvbnN0IHBlbmFsdHkgPSB0YXNrLnByaW9yaXR5ICogUFJJT1JJVFlfUEVOQUxUWV9USU1FXztcbiAgICAgIHJldHVybiBNYXRoLm1heChwZW5hbHR5IC0gKG5vdyAtIHRoaXMuZmlyc3RWaXNpYmxlVGltZV8pLCAwKTtcbiAgICB9XG5cbiAgICBsZXQgdGltZW91dCA9IDA7XG4gICAgdGhpcy5leGVjXy5mb3JFYWNoKChvdGhlcikgPT4ge1xuICAgICAgLy8gSGlnaGVyIHByaW9yaXR5IHRhc2tzIGdldCB0aGUgaGVhZCBzdGFydC4gQ3VycmVudGx5IDUwMG1zIHBlciBhIGRyb3BcbiAgICAgIC8vIGluIHByaW9yaXR5IChub3RlIHRoYXQgcHJpb3JpdHkgaXMgMTAtYmFzZWQpLlxuICAgICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWF4KFxuICAgICAgICAodGFzay5wcmlvcml0eSAtIG90aGVyLnByaW9yaXR5KSAqIFBSSU9SSVRZX1BFTkFMVFlfVElNRV8sXG4gICAgICAgIDBcbiAgICAgICk7XG4gICAgICAvLyBUT0RPKGR2b3l0ZW5rbyk6IENvbnNpZGVyIHJ1bm5pbmcgdG90YWwgYW5kIG5vdCBtYXhpbXVtLlxuICAgICAgdGltZW91dCA9IE1hdGgubWF4KHRpbWVvdXQsIHBlbmFsdHkgLSAobm93IC0gb3RoZXIuc3RhcnRUaW1lKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGltZW91dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL3Rhc2stcXVldWUuVGFza0RlZn0gdGFza1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVzY2hlZHVsZV8odGFzaykge1xuICAgIGlmICghdGhpcy5xdWV1ZV8uZ2V0VGFza0J5SWQodGFzay5pZCkpIHtcbiAgICAgIHRoaXMucXVldWVfLmVucXVldWUodGFzayk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vdGFzay1xdWV1ZS5UYXNrRGVmfSB0YXNrXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc3VjY2Vzc1xuICAgKiBAcGFyYW0geyo9fSBvcHRfcmVhc29uXG4gICAqIEByZXR1cm4geyFQcm9taXNlfHVuZGVmaW5lZH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHRhc2tDb21wbGV0ZV8odGFzaywgc3VjY2Vzcywgb3B0X3JlYXNvbikge1xuICAgIHRoaXMuZXhlY18uZGVxdWV1ZSh0YXNrKTtcbiAgICB0aGlzLnNjaGVkdWxlUGFzcyhQT1NUX1RBU0tfUEFTU19ERUxBWV8pO1xuICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgZGV2KCkuaW5mbyhcbiAgICAgICAgVEFHXyxcbiAgICAgICAgJ3Rhc2sgZmFpbGVkOicsXG4gICAgICAgIHRhc2suaWQsXG4gICAgICAgIHRhc2sucmVzb3VyY2UuZGVidWdpZCxcbiAgICAgICAgb3B0X3JlYXNvblxuICAgICAgKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChvcHRfcmVhc29uKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSByZXNvdXJjZSBzaG91bGQgYmUgcHJlbG9hZGVkIGF0IHRoaXMgdGltZS5cbiAgICogVGhlIGVsZW1lbnQgbXVzdCBiZSBtZWFzdXJlZCBieSB0aGlzIHRpbWUuXG4gICAqIEBwYXJhbSB7IVJlc291cmNlfSByZXNvdXJjZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlT3V0c2lkZVZpZXdwb3J0XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpc0xheW91dEFsbG93ZWRfKHJlc291cmNlLCBmb3JjZU91dHNpZGVWaWV3cG9ydCkge1xuICAgIC8vIE9ubHkgYnVpbHQgYW5kIGRpc3BsYXllZCBlbGVtZW50cyBjYW4gYmUgbG9hZGVkLlxuICAgIGlmIChcbiAgICAgIHJlc291cmNlLmdldFN0YXRlKCkgPT0gUmVzb3VyY2VTdGF0ZS5OT1RfQlVJTFQgfHxcbiAgICAgICFyZXNvdXJjZS5pc0Rpc3BsYXllZCgpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gRG9uJ3Qgc2NoZWR1bGUgZWxlbWVudHMgd2hlbiB3ZSdyZSBub3QgdmlzaWJsZSwgb3IgaW4gcHJlcmVuZGVyIG1vZGVcbiAgICAvLyAoYW5kIHRoZXkgY2FuJ3QgcHJlcmVuZGVyKS5cbiAgICBpZiAoIXRoaXMudmlzaWJsZV8pIHtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5hbXBkb2MuZ2V0VmlzaWJpbGl0eVN0YXRlKCkgIT0gVmlzaWJpbGl0eVN0YXRlLlBSRVJFTkRFUiB8fFxuICAgICAgICAhcmVzb3VyY2UucHJlcmVuZGVyQWxsb3dlZCgpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoZSBlbGVtZW50IGhhcyB0byBiZSBpbiBpdHMgcmVuZGVyaW5nIGNvcnJpZG9yLlxuICAgIGlmIChcbiAgICAgICFmb3JjZU91dHNpZGVWaWV3cG9ydCAmJlxuICAgICAgIXJlc291cmNlLmlzSW5WaWV3cG9ydCgpICYmXG4gICAgICAhcmVzb3VyY2UucmVuZGVyT3V0c2lkZVZpZXdwb3J0KCkgJiZcbiAgICAgICFyZXNvdXJjZS5pZGxlUmVuZGVyT3V0c2lkZVZpZXdwb3J0KClcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgc2NoZWR1bGVMYXlvdXRPclByZWxvYWQoXG4gICAgcmVzb3VyY2UsXG4gICAgbGF5b3V0LFxuICAgIG9wdF9wYXJlbnRQcmlvcml0eSxcbiAgICBvcHRfZm9yY2VPdXRzaWRlVmlld3BvcnRcbiAgKSB7XG4gICAgaWYgKHJlc291cmNlLmVsZW1lbnQuUjEoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBpc0J1aWx0ID0gcmVzb3VyY2UuZ2V0U3RhdGUoKSAhPSBSZXNvdXJjZVN0YXRlLk5PVF9CVUlMVDtcbiAgICBjb25zdCBpc0Rpc3BsYXllZCA9IHJlc291cmNlLmlzRGlzcGxheWVkKCk7XG4gICAgaWYgKCFpc0J1aWx0IHx8ICFpc0Rpc3BsYXllZCkge1xuICAgICAgZGV2QXNzZXJ0KFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgJ05vdCByZWFkeSBmb3IgbGF5b3V0OiAlcyAoJXMpJyxcbiAgICAgICAgcmVzb3VyY2UuZGVidWdpZCxcbiAgICAgICAgcmVzb3VyY2UuZ2V0U3RhdGUoKVxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgZm9yY2VPdXRzaWRlVmlld3BvcnQgPSBvcHRfZm9yY2VPdXRzaWRlVmlld3BvcnQgfHwgZmFsc2U7XG4gICAgaWYgKCF0aGlzLmlzTGF5b3V0QWxsb3dlZF8ocmVzb3VyY2UsIGZvcmNlT3V0c2lkZVZpZXdwb3J0KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChsYXlvdXQpIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVfKFxuICAgICAgICByZXNvdXJjZSxcbiAgICAgICAgTEFZT1VUX1RBU0tfSURfLFxuICAgICAgICBMQVlPVVRfVEFTS19PRkZTRVRfLFxuICAgICAgICBvcHRfcGFyZW50UHJpb3JpdHkgfHwgMCxcbiAgICAgICAgZm9yY2VPdXRzaWRlVmlld3BvcnQsXG4gICAgICAgIHJlc291cmNlLnN0YXJ0TGF5b3V0LmJpbmQocmVzb3VyY2UpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNjaGVkdWxlXyhcbiAgICAgICAgcmVzb3VyY2UsXG4gICAgICAgIFBSRUxPQURfVEFTS19JRF8sXG4gICAgICAgIFBSRUxPQURfVEFTS19PRkZTRVRfLFxuICAgICAgICBvcHRfcGFyZW50UHJpb3JpdHkgfHwgMCxcbiAgICAgICAgZm9yY2VPdXRzaWRlVmlld3BvcnQsXG4gICAgICAgIHJlc291cmNlLnN0YXJ0TGF5b3V0LmJpbmQocmVzb3VyY2UpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZXMgYSB0YXNrLlxuICAgKiBAcGFyYW0geyFSZXNvdXJjZX0gcmVzb3VyY2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxvY2FsSWRcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByaW9yaXR5T2Zmc2V0XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwYXJlbnRQcmlvcml0eVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlT3V0c2lkZVZpZXdwb3J0XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTohUHJvbWlzZX0gY2FsbGJhY2tcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNjaGVkdWxlXyhcbiAgICByZXNvdXJjZSxcbiAgICBsb2NhbElkLFxuICAgIHByaW9yaXR5T2Zmc2V0LFxuICAgIHBhcmVudFByaW9yaXR5LFxuICAgIGZvcmNlT3V0c2lkZVZpZXdwb3J0LFxuICAgIGNhbGxiYWNrXG4gICkge1xuICAgIGNvbnN0IHRhc2tJZCA9IHJlc291cmNlLmdldFRhc2tJZChsb2NhbElkKTtcblxuICAgIGNvbnN0IHRhc2sgPSB7XG4gICAgICBpZDogdGFza0lkLFxuICAgICAgcmVzb3VyY2UsXG4gICAgICBwcmlvcml0eTpcbiAgICAgICAgTWF0aC5tYXgocmVzb3VyY2UuZ2V0TGF5b3V0UHJpb3JpdHkoKSwgcGFyZW50UHJpb3JpdHkpICsgcHJpb3JpdHlPZmZzZXQsXG4gICAgICBmb3JjZU91dHNpZGVWaWV3cG9ydCxcbiAgICAgIGNhbGxiYWNrLFxuICAgICAgc2NoZWR1bGVUaW1lOiB0aGlzLndpbi5EYXRlLm5vdygpLFxuICAgICAgc3RhcnRUaW1lOiAwLFxuICAgICAgcHJvbWlzZTogbnVsbCxcbiAgICB9O1xuICAgIGRldigpLmZpbmUoVEFHXywgJ3NjaGVkdWxlOicsIHRhc2suaWQsICdhdCcsIHRhc2suc2NoZWR1bGVUaW1lKTtcblxuICAgIC8vIE9ubHkgc2NoZWR1bGUgYSBuZXcgdGFzayBpZiB0aGVyZSdzIG5vIG9uZSBlbnF1ZXVlZCB5ZXQgb3IgaWYgdGhpcyB0YXNrXG4gICAgLy8gaGFzIGEgaGlnaGVyIHByaW9yaXR5LlxuICAgIGNvbnN0IHF1ZXVlZCA9IHRoaXMucXVldWVfLmdldFRhc2tCeUlkKHRhc2tJZCk7XG4gICAgaWYgKCFxdWV1ZWQgfHwgdGFzay5wcmlvcml0eSA8IHF1ZXVlZC5wcmlvcml0eSkge1xuICAgICAgaWYgKHF1ZXVlZCkge1xuICAgICAgICB0aGlzLnF1ZXVlXy5kZXF1ZXVlKHF1ZXVlZCk7XG4gICAgICB9XG4gICAgICB0aGlzLnF1ZXVlXy5lbnF1ZXVlKHRhc2spO1xuICAgICAgdGhpcy5zY2hlZHVsZVBhc3ModGhpcy5jYWxjVGFza1RpbWVvdXRfKHRhc2spKTtcbiAgICB9XG4gICAgdGFzay5yZXNvdXJjZS5sYXlvdXRTY2hlZHVsZWQodGFzay5zY2hlZHVsZVRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSB3aGVuIGZpcnN0IHBhc3MgZXhlY3V0ZWQuXG4gICAqL1xuICB3aGVuRmlyc3RQYXNzKCkge1xuICAgIHJldHVybiB0aGlzLmZpcnN0UGFzc0RvbmVfLnByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgaXRlcmF0b3Igb24gZWFjaCBzdWItcmVzb3VyY2VcbiAgICogQHBhcmFtIHshRmluaXRlU3RhdGVNYWNoaW5lPCFWaXNpYmlsaXR5U3RhdGU+fSB2c21cbiAgICovXG4gIHNldHVwVmlzaWJpbGl0eVN0YXRlTWFjaGluZV8odnNtKSB7XG4gICAgY29uc3Qge1xuICAgICAgSElEREVOOiBoaWRkZW4sXG4gICAgICBJTkFDVElWRTogaW5hY3RpdmUsXG4gICAgICBQQVVTRUQ6IHBhdXNlZCxcbiAgICAgIFBSRVJFTkRFUjogcHJlcmVuZGVyLFxuICAgICAgVklTSUJMRTogdmlzaWJsZSxcbiAgICB9ID0gVmlzaWJpbGl0eVN0YXRlO1xuICAgIGNvbnN0IGRvV29yayA9ICgpID0+IHtcbiAgICAgIC8vIElmIHZpZXdwb3J0IHNpemUgaXMgMCwgdGhlIG1hbmFnZXIgd2lsbCB3YWl0IGZvciB0aGUgcmVzaXplIGV2ZW50LlxuICAgICAgY29uc3Qgdmlld3BvcnRTaXplID0gdGhpcy52aWV3cG9ydF8uZ2V0U2l6ZSgpO1xuICAgICAgaWYgKHZpZXdwb3J0U2l6ZS5oZWlnaHQgPiAwICYmIHZpZXdwb3J0U2l6ZS53aWR0aCA+IDApIHtcbiAgICAgICAgLy8gMS4gSGFuZGxlIGFsbCBzaXplLWNoYW5nZSByZXF1ZXN0cy4gMXggbXV0YXRlICgrMSB2c3luYyBtZWFzdXJlL211dGF0ZSBmb3IgYWJvdmUtZm9sZCByZXNpemVzKS5cbiAgICAgICAgaWYgKHRoaXMuaGFzTXV0YXRlV29ya18oKSkge1xuICAgICAgICAgIHRoaXMubXV0YXRlV29ya18oKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAyLiBCdWlsZC9tZWFzdXJlL2luLXZpZXdwb3J0L3NjaGVkdWxlIGxheW91dHMuIDF4IG11dGF0ZSAmIG1lYXN1cmUuXG4gICAgICAgIHRoaXMuZGlzY292ZXJXb3JrXygpO1xuICAgICAgICAvLyAzLiBFeGVjdXRlIHNjaGVkdWxlZCBsYXlvdXRzIGFuZCBwcmVsb2Fkcy4gMXggbXV0YXRlLlxuICAgICAgICBsZXQgZGVsYXkgPSB0aGlzLndvcmtfKCk7XG4gICAgICAgIC8vIDQuIERlZmVycmVkIHNpemUtY2hhbmdlIHJlcXVlc3RzICh3YWl0aW5nIGZvciBzY3JvbGxpbmcgdG8gc3RvcCkgd2lsbCBzaG9ydGVuIGRlbGF5IHVudGlsIG5leHQgcGFzcy5cbiAgICAgICAgaWYgKHRoaXMuaGFzTXV0YXRlV29ya18oKSkge1xuICAgICAgICAgIC8vIE92ZXJmbG93IG11dGF0ZSB3b3JrLlxuICAgICAgICAgIGRlbGF5ID0gTWF0aC5taW4oZGVsYXksIE1VVEFURV9ERUZFUl9ERUxBWV8pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnZpc2libGVfKSB7XG4gICAgICAgICAgaWYgKHRoaXMuc2NoZWR1bGVQYXNzKGRlbGF5KSkge1xuICAgICAgICAgICAgZGV2KCkuZmluZShUQUdfLCAnbmV4dCBwYXNzOicsIGRlbGF5KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGV2KCkuZmluZShUQUdfLCAncGFzcyBhbHJlYWR5IHNjaGVkdWxlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZXYoKS5maW5lKFRBR18sICdkb2N1bWVudCBpcyBub3QgdmlzaWJsZTogbm8gc2NoZWR1bGluZycpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlyc3RQYXNzRG9uZV8ucmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuICAgIGNvbnN0IHBhdXNlID0gKCkgPT4ge1xuICAgICAgdGhpcy5yZXNvdXJjZXNfLmZvckVhY2goKHIpID0+IHIucGF1c2UoKSk7XG4gICAgfTtcbiAgICBjb25zdCB1bmxvYWQgPSAoKSA9PiB7XG4gICAgICB0aGlzLnJlc291cmNlc18uZm9yRWFjaCgocikgPT4ge1xuICAgICAgICByLnVubG9hZCgpO1xuICAgICAgICB0aGlzLmNsZWFudXBUYXNrc18ocik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMudW5zZWxlY3RUZXh0XygpO1xuICAgIH07XG4gICAgY29uc3QgcmVzdW1lID0gKCkgPT4ge1xuICAgICAgdGhpcy5yZXNvdXJjZXNfLmZvckVhY2goKHIpID0+IHIucmVzdW1lKCkpO1xuICAgICAgZG9Xb3JrKCk7XG4gICAgfTtcblxuICAgIHZzbS5hZGRUcmFuc2l0aW9uKHByZXJlbmRlciwgcHJlcmVuZGVyLCBkb1dvcmspO1xuICAgIHZzbS5hZGRUcmFuc2l0aW9uKHByZXJlbmRlciwgdmlzaWJsZSwgZG9Xb3JrKTtcbiAgICB2c20uYWRkVHJhbnNpdGlvbihwcmVyZW5kZXIsIGhpZGRlbiwgZG9Xb3JrKTtcbiAgICB2c20uYWRkVHJhbnNpdGlvbihwcmVyZW5kZXIsIGluYWN0aXZlLCBkb1dvcmspO1xuICAgIHZzbS5hZGRUcmFuc2l0aW9uKHByZXJlbmRlciwgcGF1c2VkLCBkb1dvcmspO1xuXG4gICAgdnNtLmFkZFRyYW5zaXRpb24odmlzaWJsZSwgdmlzaWJsZSwgZG9Xb3JrKTtcbiAgICB2c20uYWRkVHJhbnNpdGlvbih2aXNpYmxlLCBoaWRkZW4sIGRvV29yayk7XG4gICAgdnNtLmFkZFRyYW5zaXRpb24odmlzaWJsZSwgaW5hY3RpdmUsIHVubG9hZCk7XG4gICAgdnNtLmFkZFRyYW5zaXRpb24odmlzaWJsZSwgcGF1c2VkLCBwYXVzZSk7XG5cbiAgICB2c20uYWRkVHJhbnNpdGlvbihoaWRkZW4sIHZpc2libGUsIGRvV29yayk7XG4gICAgdnNtLmFkZFRyYW5zaXRpb24oaGlkZGVuLCBoaWRkZW4sIGRvV29yayk7XG4gICAgdnNtLmFkZFRyYW5zaXRpb24oaGlkZGVuLCBpbmFjdGl2ZSwgdW5sb2FkKTtcbiAgICB2c20uYWRkVHJhbnNpdGlvbihoaWRkZW4sIHBhdXNlZCwgcGF1c2UpO1xuXG4gICAgdnNtLmFkZFRyYW5zaXRpb24oaW5hY3RpdmUsIHZpc2libGUsIHJlc3VtZSk7XG4gICAgdnNtLmFkZFRyYW5zaXRpb24oaW5hY3RpdmUsIGhpZGRlbiwgcmVzdW1lKTtcbiAgICB2c20uYWRkVHJhbnNpdGlvbihpbmFjdGl2ZSwgaW5hY3RpdmUsIG5vb3ApO1xuICAgIHZzbS5hZGRUcmFuc2l0aW9uKGluYWN0aXZlLCBwYXVzZWQsIGRvV29yayk7XG5cbiAgICB2c20uYWRkVHJhbnNpdGlvbihwYXVzZWQsIHZpc2libGUsIHJlc3VtZSk7XG4gICAgdnNtLmFkZFRyYW5zaXRpb24ocGF1c2VkLCBoaWRkZW4sIGRvV29yayk7XG4gICAgdnNtLmFkZFRyYW5zaXRpb24ocGF1c2VkLCBpbmFjdGl2ZSwgdW5sb2FkKTtcbiAgICB2c20uYWRkVHJhbnNpdGlvbihwYXVzZWQsIHBhdXNlZCwgbm9vcCk7XG4gIH1cblxuICAvKipcbiAgICogVW5zZWxlY3RzIGFueSBzZWxlY3RlZCB0ZXh0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1bnNlbGVjdFRleHRfKCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLndpbi5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBTZWxlY3Rpb24gQVBJIG5vdCBzdXBwb3J0ZWQuXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFudXAgdGFzayBxdWV1ZXMgZnJvbSB0YXNrcyBmb3IgZWxlbWVudHMgdGhhdCBoYXMgYmVlbiB1bmxvYWRlZC5cbiAgICogQHBhcmFtIHtSZXNvdXJjZX0gcmVzb3VyY2VcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X3JlbW92ZVBlbmRpbmcgV2hldGhlciB0byByZW1vdmUgZnJvbSBwZW5kaW5nXG4gICAqICAgICBidWlsZCByZXNvdXJjZXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjbGVhbnVwVGFza3NfKHJlc291cmNlLCBvcHRfcmVtb3ZlUGVuZGluZykge1xuICAgIGlmIChcbiAgICAgIHJlc291cmNlLmdldFN0YXRlKCkgPT0gUmVzb3VyY2VTdGF0ZS5OT1RfTEFJRF9PVVQgfHxcbiAgICAgIHJlc291cmNlLmdldFN0YXRlKCkgPT0gUmVzb3VyY2VTdGF0ZS5SRUFEWV9GT1JfTEFZT1VUXG4gICAgKSB7XG4gICAgICAvLyBJZiB0aGUgbGF5b3V0IHByb21pc2UgZm9yIHRoaXMgcmVzb3VyY2UgaGFzIG5vdCByZXNvbHZlZCB5ZXQsIHJlbW92ZVxuICAgICAgLy8gaXQgZnJvbSB0aGUgdGFzayBxdWV1ZXMgdG8gbWFrZSBzdXJlIHRoaXMgcmVzb3VyY2UgY2FuIGJlIHJlc2NoZWR1bGVkXG4gICAgICAvLyBmb3IgbGF5b3V0IGFnYWluIGxhdGVyIG9uLlxuICAgICAgLy8gVE9ETyhta2hhdGliKTogVGhpbmsgYWJvdXQgaG93IHRoaXMgbWlnaHQgYWZmZWN0IHByZWxvYWQgdGFza3Mgb25jZSB0aGVcbiAgICAgIC8vIHByZXJlbmRlciBjaGFuZ2UgaXMgaW4uXG4gICAgICB0aGlzLnF1ZXVlXy5wdXJnZSgodGFzaykgPT4ge1xuICAgICAgICByZXR1cm4gdGFzay5yZXNvdXJjZSA9PSByZXNvdXJjZTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5leGVjXy5wdXJnZSgodGFzaykgPT4ge1xuICAgICAgICByZXR1cm4gdGFzay5yZXNvdXJjZSA9PSByZXNvdXJjZTtcbiAgICAgIH0pO1xuICAgICAgcmVtb3ZlKHRoaXMucmVxdWVzdHNDaGFuZ2VTaXplXywgKHJlcXVlc3QpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QucmVzb3VyY2UgPT09IHJlc291cmNlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgcmVzb3VyY2UuZ2V0U3RhdGUoKSA9PSBSZXNvdXJjZVN0YXRlLk5PVF9CVUlMVCAmJlxuICAgICAgb3B0X3JlbW92ZVBlbmRpbmcgJiZcbiAgICAgIHRoaXMucGVuZGluZ0J1aWxkUmVzb3VyY2VzX1xuICAgICkge1xuICAgICAgY29uc3QgcGVuZGluZ0luZGV4ID0gdGhpcy5wZW5kaW5nQnVpbGRSZXNvdXJjZXNfLmluZGV4T2YocmVzb3VyY2UpO1xuICAgICAgaWYgKHBlbmRpbmdJbmRleCAhPSAtMSkge1xuICAgICAgICB0aGlzLnBlbmRpbmdCdWlsZFJlc291cmNlc18uc3BsaWNlKHBlbmRpbmdJbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExpc3RlbnMgZm9yIHNjcm9sbCBldmVudHMgb24gZWxlbWVudHMgKG5vdCB0aGUgcm9vdCBzY3JvbGxlciksIGFuZCBtYXJrc1xuICAgKiB0aGVtIGZvciBpbnZhbGlkYXRpbmcgYWxsIGNoaWxkIGxheW91dCBib3hlcy4gVGhpcyBpcyB0byBzdXBwb3J0IG5hdGl2ZVxuICAgKiBzY3JvbGxpbmcgZWxlbWVudHMgb3V0c2lkZSBhbXAtY29tcG9uZW50cy5cbiAgICpcbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqL1xuICBzY3JvbGxlZF8oZXZlbnQpIHtcbiAgICBjb25zdCB7dGFyZ2V0fSA9IGV2ZW50O1xuICAgIC8vIElmIHRoZSB0YXJnZXQgb2YgdGhlIHNjcm9sbCBldmVudCBpcyBhbiBlbGVtZW50LCB0aGF0IG1lYW5zIHRoYXQgZWxlbWVudFxuICAgIC8vIGlzIGFuIG92ZXJmbG93IHNjcm9sbGVyLlxuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgdGhlIGRvY3VtZW50IGl0c2VsZiwgdGhhdCBtZWFucyB0aGUgbmF0aXZlIHJvb3RcbiAgICAvLyBzY3JvbGxlciAoYGRvY3VtZW50LnNjcm9sbGluZ0VsZW1lbnRgKSBkaWQgdGhlIHNjcm9sbGluZy5cbiAgICBpZiAodGFyZ2V0Lm5vZGVUeXBlICE9PSBOb2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBJbiBpT1MgPD0gMTIsIHRoZSBzY3JvbGwgaGFja3MgY2F1c2UgdGhlIHNjcm9sbGluZyBlbGVtZW50IHRvIGJlXG4gICAgLy8gcmVwb3J0ZWQgYXMgdGhlIHRhcmdldCwgaW5zdGVhZCBvZiB0aGUgZG9jdW1lbnQuXG4gICAgaWYgKHRhcmdldCA9PT0gdGhpcy52aWV3cG9ydF8uZ2V0U2Nyb2xsaW5nRWxlbWVudCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2Nyb2xsZWQgPSBkZXYoKS5hc3NlcnRFbGVtZW50KHRhcmdldCk7XG4gICAgaWYgKCF0aGlzLmVsZW1lbnRzVGhhdFNjcm9sbGVkXy5pbmNsdWRlcyhzY3JvbGxlZCkpIHtcbiAgICAgIHRoaXMuZWxlbWVudHNUaGF0U2Nyb2xsZWRfLnB1c2goc2Nyb2xsZWQpO1xuICAgICAgdGhpcy5zY2hlZHVsZVBhc3MoRk9VUl9GUkFNRV9ERUxBWV8pO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRoZSBpbnRlcm5hbCBzdHJ1Y3R1cmUgb2YgYSBDaGFuZ2VIZWlnaHRSZXF1ZXN0LlxuICogQHR5cGVkZWYge3tcbiAqICAgaGVpZ2h0OiAobnVtYmVyfHVuZGVmaW5lZCksXG4gKiAgIHdpZHRoOiAobnVtYmVyfHVuZGVmaW5lZCksXG4gKiAgIG1hcmdpbnM6ICghLi4vbGF5b3V0LXJlY3QuTGF5b3V0TWFyZ2luc0NoYW5nZURlZnx1bmRlZmluZWQpXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFNpemVEZWY7XG5cbi8qKlxuICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbFJlc291cmNlc1NlcnZpY2VGb3JEb2MoYW1wZG9jKSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MoYW1wZG9jLCAncmVzb3VyY2VzJywgUmVzb3VyY2VzSW1wbCk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/resources-impl.js