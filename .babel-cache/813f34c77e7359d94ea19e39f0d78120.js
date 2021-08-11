function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {
containsNotSelf,
hasNextNodeInDocumentOrder,
isIframed } from "../core/dom";

import { LayoutPriority } from "../core/dom/layout";
import { removeItem } from "../core/types/array";

import { READY_SCAN_SIGNAL } from "./resources-interface";

import {
getServiceForDoc,
registerServiceBuilderForDoc } from "../service-helpers";


var ID = 'scheduler';

var ROOT_MARGIN = '250% 31.25%';

/** @implements {../service.Disposable} */
export var Scheduler = /*#__PURE__*/function () {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc  */
  function Scheduler(ampdoc) {var _this = this;_classCallCheck(this, Scheduler);
    /** @private @const */
    this.ampdoc_ = ampdoc;

    var win = ampdoc.win;

    /** @private @const {!IntersectionObserver} */
    this.observer_ = new win.IntersectionObserver(function (e) {return _this.observed_(e);}, {
      // Root bounds are not important, so we can use the `root:null` for a
      // top-level window.
      root: isIframed(win) ? /** @type {?} */(win.document) : null,
      rootMargin: ROOT_MARGIN });


    /** @private @const {!Map<!Element, !IntersectionObserver>} */
    this.containerMap_ = new Map();

    /** @private @const {!Map<!AmpElement, {asap: boolean, isIntersecting: boolean}>} */
    this.targets_ = new Map();

    /** @private {?Array<!AmpElement>} */
    this.parsingTargets_ = [];

    /** @private {boolean} */
    this.scheduledReady_ = false;

    ampdoc.whenReady().then(function () {return _this.checkParsing_();});

    /** @private {?UnlistenDef} */
    this.visibilityUnlisten_ = ampdoc.onVisibilityChanged(function () {return (
        _this.docVisibilityChanged_());});

  }

  /** @override */_createClass(Scheduler, [{ key: "dispose", value:
    function dispose() {
      this.observer_.disconnect();
      this.targets_.clear();
      if (this.visibilityUnlisten_) {
        this.visibilityUnlisten_();
        this.visibilityUnlisten_ = null;
      }
    }

    /**
     * @param {!AmpElement} target
     */ }, { key: "scheduleAsap", value:
    function scheduleAsap(target) {
      this.targets_.set(target, { asap: true, isIntersecting: false });
      this.waitParsing_(target);
    }

    /**
     * @param {!AmpElement} target
     */ }, { key: "schedule", value:
    function schedule(target) {
      if (this.targets_.has(target)) {
        return;
      }

      if (target.deferredMount()) {
        this.targets_.set(target, { asap: false, isIntersecting: false });
        this.observer_.observe(target);
        if (this.containerMap_.size > 0) {
          this.containerMap_.forEach(function (observer, container) {
            if (containsNotSelf(container, target)) {
              observer.observe(target);
            }
          });
        }
      } else {
        this.targets_.set(target, { asap: false, isIntersecting: true });
      }

      this.waitParsing_(target);
    }

    /**
     * @param {!AmpElement} target
     */ }, { key: "unschedule", value:
    function unschedule(target) {
      if (!this.targets_.has(target)) {
        return;
      }

      this.targets_.delete(target);

      this.observer_.unobserve(target);
      if (this.containerMap_.size > 0) {
        this.containerMap_.forEach(function (observer) {
          observer.unobserve(target);
        });
      }

      if (this.parsingTargets_) {
        removeItem(this.parsingTargets_, target);
        this.checkParsing_();
      }
    }

    /**
     * Adds the observer for the specified container. The first observer to
     * find an intersection will trigger the element's mount.
     *
     * @param {!Element} container
     * @param {!Element=} opt_scroller
     */ }, { key: "setContainer", value:
    function setContainer(container, opt_scroller) {var _this2 = this;
      if (this.containerMap_.has(container)) {
        return;
      }

      // Create observer.
      var win = this.ampdoc_.win;
      var observer = new win.IntersectionObserver(function (e) {return _this2.observed_(e);}, {
        root: opt_scroller || container,
        rootMargin: ROOT_MARGIN });

      this.containerMap_.set(container, observer);

      // Subscribe all pending children. Ignore `asap` targets since they
      // will be scheduled immediately and do not need an intersection
      // observer input.
      this.targets_.forEach(function (_ref, target) {var asap = _ref.asap;
        if (!asap && containsNotSelf(container, target)) {
          observer.observe(target);
        }
      });
    }

    /**
     * Removes the container and its observer that were set by the `setContainer`.
     *
     * @param {!Element} container
     */ }, { key: "removeContainer", value:
    function removeContainer(container) {
      var observer = this.containerMap_.get(container);
      if (!observer) {
        return;
      }

      // Disconnect. All children will be unobserved automatically.
      observer.disconnect();
      this.containerMap_.delete(container);
    }

    /** @private*/ }, { key: "signalScanReady_", value:
    function signalScanReady_() {var _this3 = this;
      if (this.ampdoc_.isReady() && !this.scheduledReady_) {
        this.scheduledReady_ = true;
        var win = this.ampdoc_.win;
        win.setTimeout(function () {
          // This signal mainly signifies that some of the elements have been
          // discovered and scheduled.
          _this3.ampdoc_.signals().signal(READY_SCAN_SIGNAL);
        }, 50);
      }
    }

    /** @private */ }, { key: "docVisibilityChanged_", value:
    function docVisibilityChanged_() {var _this4 = this;
      var vs = this.ampdoc_.getVisibilityState();
      if (
      vs == VisibilityState.VISIBLE ||
      vs == VisibilityState.HIDDEN ||
      vs == VisibilityState.PRERENDER)
      {
        this.targets_.forEach(function (_, target) {return _this4.maybeBuild_(target);});
      }
    }

    /**
     * @param {!AmpElement} target
     * @private
     */ }, { key: "waitParsing_", value:
    function waitParsing_(target) {
      var parsingTargets = this.parsingTargets_;
      if (parsingTargets) {
        if (!parsingTargets.includes(target)) {
          parsingTargets.push(target);
        }
        this.checkParsing_();
      } else {
        this.maybeBuild_(target);
      }
    }

    /** @private */ }, { key: "checkParsing_", value:
    function checkParsing_() {
      var documentReady = this.ampdoc_.isReady();
      var parsingTargets = this.parsingTargets_;
      if (parsingTargets) {
        for (var i = 0; i < parsingTargets.length; i++) {
          var target = parsingTargets[i];
          if (
          documentReady ||
          hasNextNodeInDocumentOrder(target, this.ampdoc_.getRootNode()))
          {
            parsingTargets.splice(i--, 1);

            this.maybeBuild_(target);
          }
        }
      }
      if (documentReady) {
        this.parsingTargets_ = null;
        this.signalScanReady_();
      }
    }

    /**
     * @param {!Array<!IntersectionObserverEntry>} entries
     * @private
     */ }, { key: "observed_", value:
    function observed_(entries) {
      for (var i = 0; i < entries.length; i++) {
        var _entries$i = entries[i],isThisIntersecting = _entries$i.isIntersecting,target = _entries$i.target;
        var ampTarget = /** @type {!AmpElement} */(target);

        var current = this.targets_.get(ampTarget);
        if (!current) {
          continue;
        }

        var isIntersecting = isThisIntersecting || current.isIntersecting;
        if (isIntersecting !== current.isIntersecting) {
          this.targets_.set(ampTarget, { asap: current.asap, isIntersecting: isIntersecting });
        }
        if (isIntersecting) {
          this.maybeBuild_(ampTarget);
        }
      }
    }

    /**
     * @param {!AmpElement} target
     * @private
     */ }, { key: "maybeBuild_", value:
    function maybeBuild_(target) {
      var parsingTargets = this.parsingTargets_;
      var parsed = !(parsingTargets && parsingTargets.includes(target));
      var _ref2 = this.targets_.get(target) || {
        asap: false,
        isIntersecting: false },asap = _ref2.asap,isIntersecting = _ref2.isIntersecting;

      var vs = this.ampdoc_.getVisibilityState();
      var toBuild =
      parsed && (
      asap || isIntersecting) && (
      vs == VisibilityState.VISIBLE ||
      // Hidden (hidden tab) allows full build.
      vs == VisibilityState.HIDDEN ||
      // Prerender can only proceed when allowed.
      (vs == VisibilityState.PRERENDER && target.prerenderAllowed()));
      if (!toBuild) {
        return;
      }

      this.unschedule(target);

      // The high-priority elements are scheduled via `setTimeout`. All other
      // elements are scheduled via the `requestIdleCallback`.
      var win = this.ampdoc_.win;
      var scheduler =
      asap || target.getBuildPriority() <= LayoutPriority.CONTENT ?
      win.setTimeout :
      win.requestIdleCallback || win.setTimeout;
      scheduler(function () {return target.mountInternal();});
    } }]);return Scheduler;}();


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Scheduler}
 */
export function getSchedulerForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, ID, Scheduler);
  return (/** @type {!Scheduler} */(getServiceForDoc(ampdoc, ID)));
}
// /Users/mszylkowski/src/amphtml/src/service/scheduler.js