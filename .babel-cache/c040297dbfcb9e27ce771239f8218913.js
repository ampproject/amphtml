function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import { Observable } from "../core/data-structures/observable";
import { Deferred } from "../core/data-structures/promise";
import { hasNextNodeInDocumentOrder } from "../core/dom";

import { Services } from "../service";
import { Resource, ResourceState } from "../service/resource";
import { READY_SCAN_SIGNAL } from "../service/resources-interface";

import { dev } from "../log";
import { getMode } from "../mode";
import { Pass } from "../pass";
import { registerServiceBuilderForDoc } from "../service-helpers";

var TAG = 'inabox-resources';
var FOUR_FRAME_DELAY = 70;

/**
 * @implements {../service/resources-interface.ResourcesInterface}
 * @implements {../service.Disposable}
 * @visibleForTesting
 */
export var InaboxResources = /*#__PURE__*/function () {
  /**
   * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
   */
  function InaboxResources(ampdoc) {var _this = this;_classCallCheck(this, InaboxResources);
    /** @const {!../service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @private @const {!Array<!Resource>} */
    this.resources_ = [];

    /** @private {number} */
    this.resourceIdCounter_ = 0;

    /** @const @private {!Pass} */
    this.pass_ = new Pass(this.win, this.doPass_.bind(this), FOUR_FRAME_DELAY);

    /** @private @const {!Observable} */
    this.passObservable_ = new Observable();

    /** @const @private {!Deferred} */
    this.firstPassDone_ = new Deferred();

    /** @private {?IntersectionObserver} */
    this.inViewportObserver_ = null;

    var input = Services.inputFor(this.win);
    input.setupInputModeClasses(ampdoc);

    // TODO(#31246): launch the visibility logic in inabox as well.
    if (getMode(this.win).runtime != 'inabox') {
      ampdoc.onVisibilityChanged(function () {
        switch (ampdoc.getVisibilityState()) {
          case VisibilityState.PAUSED:
            _this.resources_.forEach(function (r) {return r.pause();});
            break;
          case VisibilityState.VISIBLE:
            _this.resources_.forEach(function (r) {return r.resume();});
            _this. /*OK*/schedulePass();
            break;}

      });
    }

    /** @private {!Array<Resource>} */
    this.pendingBuildResources_ = [];

    /** @private {boolean} */
    this.documentReady_ = false;

    this.ampdoc_.whenReady().then(function () {
      _this.documentReady_ = true;
      _this.buildReadyResources_();
      _this. /*OK*/schedulePass(1);
    });
  }

  /** @override */_createClass(InaboxResources, [{ key: "dispose", value:
    function dispose() {
      this.resources_.forEach(function (r) {return r.unload();});
      this.resources_.length = 0;
      if (this.inViewportObserver_) {
        this.inViewportObserver_.disconnect();
        this.inViewportObserver_ = null;
      }
    }

    /** @override */ }, { key: "get", value:
    function get() {
      return this.resources_.slice(0);
    }

    /** @override */ }, { key: "getAmpdoc", value:
    function getAmpdoc() {
      return this.ampdoc_;
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
      return 1;
    }

    /** @override */ }, { key: "add", value:
    function add(element) {
      var resource = new Resource(++this.resourceIdCounter_, element, this);
      this.resources_.push(resource);
      dev().fine(TAG, 'resource added:', resource.debugid);
    }

    /** @override */ }, { key: "upgraded", value:
    function upgraded(element) {
      var resource = Resource.forElement(element);
      this.pendingBuildResources_.push(resource);
      this.buildReadyResources_();
    }

    /** @override */ }, { key: "remove", value:
    function remove(element) {
      var resource = Resource.forElementOptional(element);
      if (!resource) {
        return;
      }
      if (this.inViewportObserver_) {
        this.inViewportObserver_.unobserve(element);
      }
      var index = this.resources_.indexOf(resource);
      if (index !== -1) {
        this.resources_.splice(index, 1);
      }
      dev().fine(TAG, 'element removed:', resource.debugid);
    }

    /** @override */ }, { key: "scheduleLayoutOrPreload", value:
    function scheduleLayoutOrPreload(unusedResource) {
      this.pass_.schedule();
    }

    /** @override */ }, { key: "schedulePass", value:
    function schedulePass(opt_delay) {
      return this.pass_.schedule(opt_delay);
    }

    /** @override */ }, { key: "updateOrEnqueueMutateTask", value:
    function updateOrEnqueueMutateTask(unusedResource, unusedNewRequest) {}

    /** @override */ }, { key: "schedulePassVsync", value:
    function schedulePassVsync() {}

    /** @override */ }, { key: "onNextPass", value:
    function onNextPass(callback) {
      this.passObservable_.add(callback);
    }

    /** @override */ }, { key: "ampInitComplete", value:
    function ampInitComplete() {}

    /** @override */ }, { key: "updateLayoutPriority", value:
    function updateLayoutPriority(unusedElement, unusedNewLayoutPriority) {
      // concept of element priority does not exist in inabox
    }

    /** @override */ }, { key: "setRelayoutTop", value:
    function setRelayoutTop(unusedRelayoutTop) {}

    /** @override */ }, { key: "maybeHeightChanged", value:
    function maybeHeightChanged() {}

    /**
     * @return {!Promise} when first pass executed.
     */ }, { key: "whenFirstPass", value:
    function whenFirstPass() {
      return this.firstPassDone_.promise;
    }

    /**
     * @private
     */ }, { key: "doPass_", value:
    function doPass_() {
      var now = Date.now();
      dev().fine(TAG, 'doPass');
      // measure in a batch
      this.resources_.forEach(function (resource) {
        if (!resource.isLayoutPending() || resource.element.R1()) {
          return;
        }
        resource.measure();
      });
      // mutation in a batch
      this.resources_.forEach(function (resource) {
        if (
        !resource.element.R1() &&
        resource.getState() === ResourceState.READY_FOR_LAYOUT &&
        resource.isDisplayed())
        {
          resource.layoutScheduled(now);
          resource.startLayout();
        }
      });

      this.ampdoc_.signals().signal(READY_SCAN_SIGNAL);
      this.passObservable_.fire();
      this.firstPassDone_.resolve();
    }

    /**
     * Builds any pending resouces if document is ready, or next element has been
     * added to DOM.
     * @private
     */ }, { key: "buildReadyResources_", value:
    function buildReadyResources_() {var _this2 = this;
      for (var i = this.pendingBuildResources_.length - 1; i >= 0; i--) {
        var resource = this.pendingBuildResources_[i];
        if (
        this.documentReady_ ||
        hasNextNodeInDocumentOrder(resource.element, this.ampdoc_.getRootNode()))
        {
          this.pendingBuildResources_.splice(i, 1);
          resource.build().then(function () {return _this2. /*OK*/schedulePass();});
          dev().fine(TAG, 'resource upgraded:', resource.debugid);
        }
      }
    } }]);return InaboxResources;}();


/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installInaboxResourcesServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'resources', InaboxResources);
}
// /Users/mszylkowski/src/amphtml/src/inabox/inabox-resources.js