function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { UPGRADE_TO_CUSTOMELEMENT_PROMISE, UPGRADE_TO_CUSTOMELEMENT_RESOLVER } from "./amp-element-helpers";
import { startupChunk } from "./chunk";
import { shouldBlockOnConsentByMeta } from "./consent";
import { AmpEvents } from "./core/constants/amp-events";
import { CommonSignals } from "./core/constants/common-signals";
import { ReadyState } from "./core/constants/ready-state";
import { tryResolve } from "./core/data-structures/promise";
import { Signals } from "./core/data-structures/signals";
import * as dom from "./core/dom";
import { Layout, LayoutPriority, isLoadingAllowed } from "./core/dom/layout";
import { MediaQueryProps } from "./core/dom/media-query-props";
import * as query from "./core/dom/query";
import { setStyle } from "./core/dom/style";
import { rethrowAsync } from "./core/error";
import { toWin } from "./core/window";
import { ElementStub } from "./element-stub";
import { blockedByConsentError, cancellation, isBlockedByConsent, isCancellation, reportError } from "./error-reporting";
import { dev, devAssert, user, userAssert } from "./log";
import { getMode } from "./mode";
import { Services } from "./service";
import { ResourceState } from "./service/resource";
import { getSchedulerForDoc } from "./service/scheduler";
import { applyStaticLayout } from "./static-layout";
import { getIntersectionChangeEntry as _getIntersectionChangeEntry } from "./utils/intersection-observer-3p-host";
var TAG = 'CustomElement';

/**
 * @enum {number}
 */
var UpgradeState = {
  NOT_UPGRADED: 1,
  UPGRADED: 2,
  UPGRADE_FAILED: 3,
  UPGRADE_IN_PROGRESS: 4
};
var NO_BUBBLES = {
  bubbles: false
};

var RETURN_TRUE = function RETURN_TRUE() {
  return true;
};

/**
 * Caches whether the template tag is supported to avoid memory allocations.
 * @type {boolean|undefined}
 */
var templateTagSupported;

/** @type {!Array} */
export var stubbedElements = [];

/**
 * Whether this platform supports template tags.
 * @return {boolean}
 */
function isTemplateTagSupported() {
  if (templateTagSupported === undefined) {
    var template = self.document.createElement('template');
    templateTagSupported = 'content' in template;
  }

  return templateTagSupported;
}

/**
 * Creates a named custom element class.
 *
 * @param {!Window} win The window in which to register the custom element.
 * @param {function(!./service/ampdoc-impl.AmpDoc, !AmpElement, ?(typeof BaseElement))} elementConnectedCallback
 * @return {typeof AmpElement} The custom element class.
 */
export function createCustomElementClass(win, elementConnectedCallback) {
  var BaseCustomElement =
  /** @type {typeof HTMLElement} */
  createBaseCustomElementClass(win, elementConnectedCallback);

  // It's necessary to create a subclass, because the same "base" class cannot
  // be registered to multiple custom elements.
  var CustomAmpElement = /*#__PURE__*/function (_BaseCustomElement) {
    _inherits(CustomAmpElement, _BaseCustomElement);

    var _super = _createSuper(CustomAmpElement);

    function CustomAmpElement() {
      _classCallCheck(this, CustomAmpElement);

      return _super.apply(this, arguments);
    }

    _createClass(CustomAmpElement, [{
      key: "adoptedCallback",
      value:
      /**
       * adoptedCallback is only called when using a Native implementation of Custom Elements V1.
       * Our polyfill does not call this method.
       */
      function adoptedCallback() {
        // Work around an issue with Firefox changing the prototype of our
        // already constructed element to the new document's HTMLElement.
        if (Object.getPrototypeOf(this) !== customAmpElementProto) {
          Object.setPrototypeOf(this, customAmpElementProto);
        }
      }
    }]);

    return CustomAmpElement;
  }(BaseCustomElement);

  var customAmpElementProto = CustomAmpElement.prototype;
  return (
    /** @type {typeof AmpElement} */
    CustomAmpElement
  );
}

/**
 * Creates a base custom element class.
 *
 * @param {!Window} win The window in which to register the custom element.
 * @param {function(!./service/ampdoc-impl.AmpDoc, !AmpElement, ?(typeof BaseElement))} elementConnectedCallback
 * @return {typeof HTMLElement}
 */
function createBaseCustomElementClass(win, elementConnectedCallback) {
  if (win.__AMP_BASE_CE_CLASS) {
    return win.__AMP_BASE_CE_CLASS;
  }

  var htmlElement =
  /** @type {typeof HTMLElement} */
  win.HTMLElement;

  /**
   * @abstract @extends {HTMLElement}
   */
  var BaseCustomElement = /*#__PURE__*/function (_htmlElement) {
    _inherits(BaseCustomElement, _htmlElement);

    var _super2 = _createSuper(BaseCustomElement);

    /** */
    function BaseCustomElement() {
      var _this;

      _classCallCheck(this, BaseCustomElement);

      _this = _super2.call(this);

      _this.createdCallback();

      return _this;
    }

    /**
     * Called when elements is created. Sets instance vars since there is no
     * constructor.
     * @final
     */
    _createClass(BaseCustomElement, [{
      key: "createdCallback",
      value: function createdCallback() {
        // Flag "notbuilt" is removed by Resource manager when the resource is
        // considered to be built. See "setBuilt" method.

        /** @private {boolean} */
        this.built_ = false;

        /**
         * Several APIs require the element to be connected to the DOM tree, but
         * the CustomElement lifecycle APIs are async. This lead to subtle bugs
         * that require state tracking. See #12849, https://crbug.com/821195, and
         * https://bugs.webkit.org/show_bug.cgi?id=180940.
         * @private {boolean}
         */
        this.isConnected_ = false;

        /** @private {?Promise} */
        this.buildingPromise_ = null;

        /**
         * Indicates that the `mountCallback()` has been called and it hasn't
         * been reversed with an `unmountCallback()` call.
         * @private {boolean}
         */
        this.mounted_ = false;

        /** @private {?Promise} */
        this.mountPromise_ = null;

        /** @private {?AbortController} */
        this.mountAbortController_ = null;

        /** @private {!ReadyState} */
        this.readyState_ = ReadyState.UPGRADING;

        /** @type {boolean} */
        this.everAttached = false;

        /**
         * Ampdoc can only be looked up when an element is attached.
         * @private {?./service/ampdoc-impl.AmpDoc}
         */
        this.ampdoc_ = null;

        /**
         * Resources can only be looked up when an element is attached.
         * @private {?./service/resources-interface.ResourcesInterface}
         */
        this.resources_ = null;

        /** @private {!Layout} */
        this.layout_ = Layout.NODISPLAY;

        /** @private {number} */
        this.layoutCount_ = 0;

        /** @private {boolean} */
        this.isFirstLayoutCompleted_ = false;

        /** @public {boolean} */
        this.warnOnMissingOverflow = true;

        /**
         * This element can be assigned by the {@link applyStaticLayout} to a
         * child element that will be used to size this element.
         * @package {?Element|undefined}
         */
        this.sizerElement = undefined;

        /** @private {?Element|undefined} */
        this.overflowElement_ = undefined;

        /**
         * The time at which this element was scheduled for layout relative to
         * the epoch. This value will be set to 0 until the this element has been
         * scheduled.
         * Note that this value may change over time if the element is enqueued,
         * then dequeued and re-enqueued by the scheduler.
         * @type {number|undefined}
         */
        this.layoutScheduleTime = undefined;
        // Closure compiler appears to mark HTMLElement as @struct which
        // disables bracket access. Force this with a type coercion.
        var nonStructThis =
        /** @type {!Object} */
        this;
        // `opt_implementationClass` is only used for tests.

        /** @type {?(typeof ../base-element.BaseElement)} */
        var Ctor = win.__AMP_EXTENDED_ELEMENTS && win.__AMP_EXTENDED_ELEMENTS[this.localName];

        if (getMode().test && nonStructThis['implementationClassForTesting']) {
          Ctor = nonStructThis['implementationClassForTesting'];
        }

        /** @private {?(typeof ../base-element.BaseElement)} */
        this.implClass_ = Ctor === ElementStub ? null : Ctor || null;

        if (!this.implClass_) {
          stubbedElements.push(this);
        }

        /** @private {?./base-element.BaseElement} */
        this.impl_ = null;

        /**
         * An element always starts in a unupgraded state until it's added to DOM
         * for the first time in which case it can be upgraded immediately or wait
         * for script download or `upgradeCallback`.
         * @private {!UpgradeState}
         */
        this.upgradeState_ = UpgradeState.NOT_UPGRADED;

        /**
         * Time delay imposed by baseElement upgradeCallback.  If no
         * upgradeCallback specified or not yet executed, delay is 0.
         * @private {number}
         */
        this.upgradeDelayMs_ = 0;

        /**
         * Action queue is initially created and kept around until the element
         * is ready to send actions directly to the implementation.
         * - undefined initially
         * - array if used
         * - null after unspun
         * @private {?Array<!./service/action-impl.ActionInvocation>|undefined}
         */
        this.actionQueue_ = undefined;

        /**
         * Whether the element is in the template.
         * @private {boolean|undefined}
         */
        this.isInTemplate_ = undefined;

        /** @private @const */
        this.signals_ = new Signals();

        if (this.implClass_) {
          this.signals_.signal(CommonSignals.READY_TO_UPGRADE);
        }

        var perf = Services.performanceForOrNull(win);

        /** @private {boolean} */
        this.perfOn_ = perf && perf.isPerformanceTrackingOn();

        /** @private {?MediaQueryProps} */
        this.mediaQueryProps_ = null;

        if (nonStructThis[UPGRADE_TO_CUSTOMELEMENT_RESOLVER]) {
          nonStructThis[UPGRADE_TO_CUSTOMELEMENT_RESOLVER](nonStructThis);
          delete nonStructThis[UPGRADE_TO_CUSTOMELEMENT_RESOLVER];
          delete nonStructThis[UPGRADE_TO_CUSTOMELEMENT_PROMISE];
        }
      }
      /** @return {!ReadyState} */

    }, {
      key: "readyState",
      get: function get() {
        return this.readyState_;
      }
      /** @return {!Signals} */

    }, {
      key: "signals",
      value: function signals() {
        return this.signals_;
      }
      /**
       * Returns the associated ampdoc. Only available after attachment. It throws
       * exception before the element is attached.
       * @return {!./service/ampdoc-impl.AmpDoc}
       * @final
       * @package
       */

    }, {
      key: "getAmpDoc",
      value: function getAmpDoc() {
        devAssert(this.ampdoc_, 'no ampdoc yet, since element is not attached');
        return (
          /** @type {!./service/ampdoc-impl.AmpDoc} */
          this.ampdoc_
        );
      }
      /**
       * Returns Resources manager. Only available after attachment. It throws
       * exception before the element is attached.
       * @return {!./service/resources-interface.ResourcesInterface}
       * @final
       * @package
       */

    }, {
      key: "getResources",
      value: function getResources() {
        devAssert(this.resources_, 'no resources yet, since element is not attached');
        return (
          /** @type {!./service/resources-interface.ResourcesInterface} */
          this.resources_
        );
      }
      /**
       * Whether the element has been upgraded yet. Always returns false when
       * the element has not yet been added to DOM. After the element has been
       * added to DOM, the value depends on the `BaseElement` implementation and
       * its `upgradeElement` callback.
       * @return {boolean}
       * @final
       */

    }, {
      key: "isUpgraded",
      value: function isUpgraded() {
        return this.upgradeState_ == UpgradeState.UPGRADED;
      }
      /** @return {!Promise} */

    }, {
      key: "whenUpgraded",
      value: function whenUpgraded() {
        return this.signals_.whenSignal(CommonSignals.UPGRADED);
      }
      /**
       * Upgrades the element to the provided new implementation. If element
       * has already been attached, it's layout validation and attachment flows
       * are repeated for the new implementation.
       * @param {typeof ./base-element.BaseElement} newImplClass
       * @final @package
       */

    }, {
      key: "upgrade",
      value: function upgrade(newImplClass) {
        if (this.isInTemplate_) {
          return;
        }

        if (this.upgradeState_ != UpgradeState.NOT_UPGRADED) {
          // Already upgraded or in progress or failed.
          return;
        }

        this.implClass_ = newImplClass;
        this.signals_.signal(CommonSignals.READY_TO_UPGRADE);

        if (this.everAttached) {
          // Usually, we do an implementation upgrade when the element is
          // attached to the DOM. But, if it hadn't yet upgraded from
          // ElementStub, we couldn't. Now that it's upgraded from a stub, go
          // ahead and do the full upgrade.
          this.upgradeOrSchedule_();
        }
      }
      /**
       * Time delay imposed by baseElement upgradeCallback.  If no
       * upgradeCallback specified or not yet executed, delay is 0.
       * @return {number}
       */

    }, {
      key: "getUpgradeDelayMs",
      value: function getUpgradeDelayMs() {
        return this.upgradeDelayMs_;
      }
      /**
       * Completes the upgrade of the element with the provided implementation.
       * @param {!./base-element.BaseElement} newImpl
       * @param {number} upgradeStartTime
       * @final @private
       */

    }, {
      key: "completeUpgrade_",
      value: function completeUpgrade_(newImpl, upgradeStartTime) {
        this.impl_ = newImpl;
        this.upgradeDelayMs_ = win.Date.now() - upgradeStartTime;
        this.upgradeState_ = UpgradeState.UPGRADED;
        this.setReadyStateInternal(ReadyState.BUILDING);
        this.classList.remove('amp-unresolved');
        this.classList.remove('i-amphtml-unresolved');
        this.assertLayout_();
        this.dispatchCustomEventForTesting(AmpEvents.ATTACHED);

        if (!this.R1()) {
          this.getResources().upgraded(this);
        }

        this.signals_.signal(CommonSignals.UPGRADED);
      }
      /** @private */

    }, {
      key: "assertLayout_",
      value: function assertLayout_() {
        if (this.layout_ != Layout.NODISPLAY && this.impl_ && !this.impl_.isLayoutSupported(this.layout_)) {
          userAssert(this.getAttribute('layout'), 'The element did not specify a layout attribute. ' + 'Check https://amp.dev/documentation/guides-and-tutorials/' + 'develop/style_and_layout/control_layout and the respective ' + 'element documentation for details.');
          userAssert(false, "Layout not supported: " + this.layout_);
        }
      }
      /**
       * Get the priority to build the element.
       * @return {number}
       */

    }, {
      key: "getBuildPriority",
      value: function getBuildPriority() {
        return this.implClass_ ? this.implClass_.getBuildPriority(this) : LayoutPriority.BACKGROUND;
      }
      /**
       * Get the priority to load the element.
       * @return {number}
       * TODO(#31915): remove once R1 migration is complete.
       */

    }, {
      key: "getLayoutPriority",
      value: function getLayoutPriority() {
        return this.impl_ ? this.impl_.getLayoutPriority() : LayoutPriority.BACKGROUND;
      }
      /**
       * Get the default action alias.
       * @return {?string}
       */

    }, {
      key: "getDefaultActionAlias",
      value: function getDefaultActionAlias() {
        devAssert(this.isUpgraded(), 'Cannot get default action alias of unupgraded element');
        return this.impl_.getDefaultActionAlias();
      }
      /** @return {boolean} */

    }, {
      key: "isBuilding",
      value: function isBuilding() {
        return !!this.buildingPromise_;
      }
      /**
       * Whether the element has been built. A built element had its
       * {@link buildCallback} method successfully invoked.
       * @return {boolean}
       * @final
       */

    }, {
      key: "isBuilt",
      value: function isBuilt() {
        return this.built_;
      }
      /**
       * Returns the promise that's resolved when the element has been built. If
       * the build fails, the resulting promise is rejected.
       * @return {!Promise}
       */

    }, {
      key: "whenBuilt",
      value: function whenBuilt() {
        return this.signals_.whenSignal(CommonSignals.BUILT);
      }
      /**
       * Requests or requires the element to be built. The build is done by
       * invoking {@link BaseElement.buildCallback} method.
       *
       * Can only be called on a upgraded element. May only be called from
       * resource.js to ensure an element and its resource are in sync.
       *
       * @return {?Promise}
       * @final
       * @restricted
       */

    }, {
      key: "buildInternal",
      value: function buildInternal() {
        var _this2 = this;

        assertNotTemplate(this);
        devAssert(this.implClass_, 'Cannot build unupgraded element');

        if (this.buildingPromise_) {
          return this.buildingPromise_;
        }

        this.setReadyStateInternal(ReadyState.BUILDING);
        // Create the instance.
        var implPromise = this.createImpl_();
        // Wait for consent.
        var consentPromise = implPromise.then(function () {
          var policyId = _this2.getConsentPolicy_();

          var purposeConsents = !policyId ? _this2.getPurposesConsent_() : null;

          if (!policyId && !purposeConsents) {
            return;
          }

          // Must have policyId or granularExp w/ purposeConsents
          return Services.consentPolicyServiceForDocOrNull(_this2).then(function (policy) {
            if (!policy) {
              return true;
            }

            return policyId ? policy.whenPolicyUnblock(policyId) : policy.whenPurposesUnblock(purposeConsents);
          }).then(function (shouldUnblock) {
            if (!shouldUnblock) {
              throw blockedByConsentError();
            }
          });
        });
        // Build callback.
        var buildPromise = consentPromise.then(function () {
          return devAssert(_this2.impl_).buildCallback();
        });
        // Build the element.
        return this.buildingPromise_ = buildPromise.then(function () {
          _this2.built_ = true;

          _this2.classList.add('i-amphtml-built');

          _this2.classList.remove('i-amphtml-notbuilt');

          _this2.classList.remove('amp-notbuilt');

          _this2.signals_.signal(CommonSignals.BUILT);

          if (_this2.R1()) {
            _this2.setReadyStateInternal(_this2.readyState_ != ReadyState.BUILDING ? _this2.readyState_ : ReadyState.MOUNTING);
          } else {
            _this2.setReadyStateInternal(ReadyState.LOADING);

            _this2.preconnect(
            /* onLayout */
            false);
          }

          if (_this2.isConnected_) {
            _this2.connected_();
          }

          if (_this2.actionQueue_) {
            // Only schedule when the queue is not empty, which should be
            // the case 99% of the time.
            Services.timerFor(toWin(_this2.ownerDocument.defaultView)).delay(_this2.dequeueActions_.bind(_this2), 1);
          }

          if (!_this2.getPlaceholder()) {
            var placeholder = _this2.createPlaceholder();

            if (placeholder) {
              _this2.appendChild(placeholder);
            }
          }
        }, function (reason) {
          _this2.signals_.rejectSignal(CommonSignals.BUILT,
          /** @type {!Error} */
          reason);

          if (_this2.R1()) {
            _this2.setReadyStateInternal(ReadyState.ERROR, reason);
          }

          if (!isBlockedByConsent(reason)) {
            reportError(reason, _this2);
          }

          throw reason;
        });
      }
      /**
       * @return {!Promise}
       */

    }, {
      key: "build",
      value: function build() {
        var _this3 = this;

        if (this.buildingPromise_) {
          return this.buildingPromise_;
        }

        var readyPromise = this.signals_.whenSignal(CommonSignals.READY_TO_UPGRADE);
        return readyPromise.then(function () {
          if (_this3.R1()) {
            var scheduler = getSchedulerForDoc(_this3.getAmpDoc());
            scheduler.scheduleAsap(_this3);
          }

          return _this3.whenBuilt();
        });
      }
      /**
       * Mounts the element by calling the `BaseElement.mountCallback` method.
       *
       * Can only be called on a upgraded element. May only be called from
       * scheduler.js.
       *
       * @return {!Promise}
       * @final
       * @restricted
       */

    }, {
      key: "mountInternal",
      value: function mountInternal() {
        var _this4 = this;

        if (this.mountPromise_) {
          return this.mountPromise_;
        }

        this.mountAbortController_ = this.mountAbortController_ || new AbortController();
        var signal = this.mountAbortController_.signal;
        return this.mountPromise_ = this.buildInternal().then(function () {
          devAssert(_this4.R1());

          if (signal.aborted) {
            // Mounting has been canceled.
            return;
          }

          _this4.setReadyStateInternal(_this4.readyState_ != ReadyState.MOUNTING ? _this4.readyState_ : _this4.implClass_.usesLoading(_this4) ? ReadyState.LOADING : ReadyState.MOUNTING);

          _this4.mounted_ = true;

          var result = _this4.impl_.mountCallback(signal);

          // The promise supports the V0 format for easy migration. If the
          // `mountCallback` returns a promise, the assumption is that the
          // element has finished loading when the promise completes.
          return result ? result.then(RETURN_TRUE) : false;
        }).then(function (hasLoaded) {
          _this4.mountAbortController_ = null;

          if (signal.aborted) {
            throw cancellation();
          }

          _this4.signals_.signal(CommonSignals.MOUNTED);

          if (!_this4.implClass_.usesLoading(_this4) || hasLoaded) {
            _this4.setReadyStateInternal(ReadyState.COMPLETE);
          }
        }).catch(function (reason) {
          _this4.mountAbortController_ = null;

          if (isCancellation(reason)) {
            _this4.mountPromise_ = null;
          } else {
            _this4.signals_.rejectSignal(CommonSignals.MOUNTED,
            /** @type {!Error} */
            reason);

            _this4.setReadyStateInternal(ReadyState.ERROR, reason);
          }

          throw reason;
        });
      }
      /**
       * Requests the element to be mounted as soon as possible.
       * @return {!Promise}
       * @final
       */

    }, {
      key: "mount",
      value: function mount() {
        var _this5 = this;

        if (this.mountPromise_) {
          return this.mountPromise_;
        }

        // Create the abort controller right away to ensure that we the unmount
        // will properly cancel this operation.
        this.mountAbortController_ = this.mountAbortController_ || new AbortController();
        var signal = this.mountAbortController_.signal;
        var readyPromise = this.signals_.whenSignal(CommonSignals.READY_TO_UPGRADE);
        return readyPromise.then(function () {
          if (!_this5.R1()) {
            return _this5.whenBuilt();
          }

          if (signal.aborted) {
            throw cancellation();
          }

          var scheduler = getSchedulerForDoc(_this5.getAmpDoc());
          scheduler.scheduleAsap(_this5);
          return _this5.whenMounted();
        });
      }
      /**
       * Unmounts the element and makes it ready for the next mounting
       * operation.
       * @final
       */

    }, {
      key: "unmount",
      value: function unmount() {
        // Ensure that the element is paused.
        if (this.isConnected_) {
          this.pause();
        }

        // Legacy R0 elements simply unlayout.
        if (!this.R1()) {
          this.unlayout_();
          return;
        }

        // Cancel the currently mounting operation.
        if (this.mountAbortController_) {
          this.mountAbortController_.abort();
          this.mountAbortController_ = null;
        }

        // Unschedule a currently pending mount request.
        var scheduler = getSchedulerForDoc(this.getAmpDoc());
        scheduler.unschedule(this);

        // Try to unmount if the element has been built already.
        if (this.mounted_) {
          this.impl_.unmountCallback();
        }

        // Complete unmount and reset the state.
        this.mounted_ = false;
        this.mountPromise_ = null;
        this.reset_();

        // Prepare for the next mount if the element is connected.
        if (this.isConnected_) {
          this.upgradeOrSchedule_(
          /* opt_disablePreload */
          true);
        }
      }
      /**
       * Returns the promise that's resolved when the element has been mounted. If
       * the mount fails, the resulting promise is rejected.
       * @return {!Promise}
       */

    }, {
      key: "whenMounted",
      value: function whenMounted() {
        return this.signals_.whenSignal(CommonSignals.MOUNTED);
      }
      /**
       * @return {!Promise}
       * @final
       */

    }, {
      key: "whenLoaded",
      value: function whenLoaded() {
        return this.signals_.whenSignal(CommonSignals.LOAD_END);
      }
      /**
       * Ensure that the element is eagerly loaded.
       *
       * @param {number=} opt_parentPriority
       * @return {!Promise}
       * @final
       */

    }, {
      key: "ensureLoaded",
      value: function ensureLoaded(opt_parentPriority) {
        var _this6 = this;

        return this.mount().then(function () {
          if (_this6.R1()) {
            if (_this6.implClass_.usesLoading(_this6)) {
              _this6.impl_.ensureLoaded();
            }

            return _this6.whenLoaded();
          }

          // Very ugly! The "built" signal must be resolved from the Resource
          // and not the element itself because the Resource has not correctly
          // set its state for the downstream to process it correctly.
          var resource = _this6.getResource_();

          return resource.whenBuilt().then(function () {
            if (resource.getState() == ResourceState.LAYOUT_COMPLETE) {
              return;
            }

            if (resource.getState() != ResourceState.LAYOUT_SCHEDULED || resource.isMeasureRequested()) {
              resource.measure();
            }

            if (!resource.isDisplayed()) {
              return;
            }

            _this6.getResources().scheduleLayoutOrPreload(resource,
            /* layout */
            true, opt_parentPriority,
            /* forceOutsideViewport */
            true);

            return _this6.whenLoaded();
          });
        });
      }
      /**
       * See `BaseElement.setAsContainer`.
       *
       * @param {!Element=} opt_scroller A child of the container that should be
       * monitored. Typically a scrollable element.
       * @restricted
       * @final
       */

    }, {
      key: "setAsContainerInternal",
      value: function setAsContainerInternal(opt_scroller) {
        var builder = getSchedulerForDoc(this.getAmpDoc());
        builder.setContainer(this, opt_scroller);
      }
      /**
       * See `BaseElement.removeAsContainer`.
       * @restricted
       * @final
       */

    }, {
      key: "removeAsContainerInternal",
      value: function removeAsContainerInternal() {
        var builder = getSchedulerForDoc(this.getAmpDoc());
        builder.removeContainer(this);
      }
      /**
       * Update the internal ready state.
       *
       * @param {!ReadyState} state
       * @param {*=} opt_failure
       * @protected
       * @final
       */

    }, {
      key: "setReadyStateInternal",
      value: function setReadyStateInternal(state, opt_failure) {
        if (state === this.readyState_) {
          return;
        }

        this.readyState_ = state;

        if (!this.R1()) {
          return;
        }

        switch (state) {
          case ReadyState.LOADING:
            this.signals_.signal(CommonSignals.LOAD_START);
            this.signals_.reset(CommonSignals.UNLOAD);
            this.signals_.reset(CommonSignals.LOAD_END);
            this.classList.add('i-amphtml-layout');
            // Potentially start the loading indicator.
            this.toggleLoading(true);
            this.dispatchCustomEventForTesting(AmpEvents.LOAD_START);
            return;

          case ReadyState.COMPLETE:
            // LOAD_START is set just in case. It won't be overwritten if
            // it had been set before.
            this.signals_.signal(CommonSignals.LOAD_START);
            this.signals_.signal(CommonSignals.LOAD_END);
            this.signals_.reset(CommonSignals.UNLOAD);
            this.classList.add('i-amphtml-layout');
            this.toggleLoading(false);
            dom.dispatchCustomEvent(this, 'load', null, NO_BUBBLES);
            this.dispatchCustomEventForTesting(AmpEvents.LOAD_END);
            return;

          case ReadyState.ERROR:
            this.signals_.rejectSignal(CommonSignals.LOAD_END,
            /** @type {!Error} */
            opt_failure);
            this.toggleLoading(false);
            dom.dispatchCustomEvent(this, 'error', opt_failure, NO_BUBBLES);
            return;
        }
      }
      /**
       * Called to instruct the element to preconnect to hosts it uses during
       * layout.
       * @param {boolean} onLayout Whether this was called after a layout.
       * TODO(#31915): remove once R1 migration is complete.
       */

    }, {
      key: "preconnect",
      value: function preconnect(onLayout) {
        var _this7 = this;

        devAssert(this.isUpgraded());

        if (onLayout) {
          this.impl_.preconnectCallback(onLayout);
        } else {
          // If we do early preconnects we delay them a bit. This is kind of
          // an unfortunate trade off, but it seems faster, because the DOM
          // operations themselves are not free and might delay
          startupChunk(this.getAmpDoc(), function () {
            if (!_this7.ownerDocument || !_this7.ownerDocument.defaultView) {
              return;
            }

            _this7.impl_.preconnectCallback(onLayout);
          });
        }
      }
      /**
       * See `BaseElement.R1()`.
       *
       * @return {boolean}
       * @final
       */

    }, {
      key: "R1",
      value: function R1() {
        return this.implClass_ ? this.implClass_.R1() : false;
      }
      /**
       * See `BaseElement.deferredMount()`.
       *
       * @return {boolean}
       * @final
       */

    }, {
      key: "deferredMount",
      value: function deferredMount() {
        return this.implClass_ ? this.implClass_.deferredMount(this) : false;
      }
      /**
       * Whether the custom element declares that it has to be fixed.
       * @return {boolean}
       */

    }, {
      key: "isAlwaysFixed",
      value: function isAlwaysFixed() {
        return this.impl_ ? this.impl_.isAlwaysFixed() : false;
      }
      /**
       * Updates the layout box of the element.
       * Should only be called by Resources.
       * @param {!./layout-rect.LayoutRectDef} layoutBox
       * @param {boolean} sizeChanged
       */

    }, {
      key: "updateLayoutBox",
      value: function updateLayoutBox(layoutBox, sizeChanged) {
        if (sizeChanged === void 0) {
          sizeChanged = false;
        }

        if (this.isBuilt()) {
          this.onMeasure(sizeChanged);
        }
      }
      /**
       * Calls onLayoutMeasure() on the BaseElement implementation.
       * Should only be called by Resources.
       */

    }, {
      key: "onMeasure",
      value: function onMeasure() {
        devAssert(this.isBuilt());

        try {
          this.impl_.onLayoutMeasure();
        } catch (e) {
          reportError(e, this);
        }
      }
      /**
       * @return {?Element}
       * @private
       */

    }, {
      key: "getSizer_",
      value: function getSizer_() {
        if (this.sizerElement === undefined && (this.layout_ === Layout.RESPONSIVE || this.layout_ === Layout.INTRINSIC)) {
          // Expect sizer to exist, just not yet discovered.
          this.sizerElement = this.querySelector('i-amphtml-sizer');
        }

        return this.sizerElement || null;
      }
      /**
       * @param {Element} sizer
       * @private
       */

    }, {
      key: "resetSizer_",
      value: function resetSizer_(sizer) {
        if (this.layout_ === Layout.RESPONSIVE) {
          setStyle(sizer, 'paddingTop', '0');
          return;
        }

        if (this.layout_ === Layout.INTRINSIC) {
          var intrinsicSizerImg = sizer.querySelector('.i-amphtml-intrinsic-sizer');

          if (!intrinsicSizerImg) {
            return;
          }

          intrinsicSizerImg.setAttribute('src', '');
          return;
        }
      }
      /** @private */

    }, {
      key: "initMediaAttrs_",
      value: function initMediaAttrs_() {
        var _this8 = this;

        var hasMediaAttrs = this.hasAttribute('media') || this.hasAttribute('sizes') && !this.hasAttribute('disable-inline-width') || this.hasAttribute('heights');
        var hadMediaAttrs = !!this.mediaQueryProps_;
        var win = this.ownerDocument.defaultView;

        if (hasMediaAttrs != hadMediaAttrs && win) {
          if (hasMediaAttrs) {
            this.mediaQueryProps_ = new MediaQueryProps(win, function () {
              return _this8.applyMediaAttrs_();
            });
            this.applyMediaAttrs_();
          } else {
            this.disposeMediaAttrs_();
          }
        }
      }
      /** @private */

    }, {
      key: "disposeMediaAttrs_",
      value: function disposeMediaAttrs_() {
        if (this.mediaQueryProps_) {
          this.mediaQueryProps_.dispose();
          this.mediaQueryProps_ = null;
        }
      }
      /** @private */

    }, {
      key: "applyMediaAttrs_",
      value: function applyMediaAttrs_() {
        var props = this.mediaQueryProps_;

        if (!props) {
          return;
        }

        props.start();
        // Media query.
        var mediaAttr = this.getAttribute('media') || null;
        var matchesMedia = mediaAttr ? props.resolveMatchQuery(mediaAttr) : true;
        this.classList.toggle('i-amphtml-hidden-by-media-query', !matchesMedia);
        // Sizes.
        var sizesAttr = this.hasAttribute('disable-inline-width') ? null : this.getAttribute('sizes');

        if (sizesAttr) {
          setStyle(this, 'width', props.resolveListQuery(sizesAttr));
        }

        // Heights.
        var heightsAttr = this.layout_ === Layout.RESPONSIVE ? this.getAttribute('heights') : null;

        if (heightsAttr) {
          var sizer = this.getSizer_();

          if (sizer) {
            setStyle(sizer, 'paddingTop', props.resolveListQuery(heightsAttr));
          }
        }

        props.complete();
        this.getResource_().requestMeasure();
      }
      /**
       * Applies a size change to the element.
       *
       * This method is called by Resources and shouldn't be called by anyone
       * else. This method must always be called in the mutation context.
       *
       * @param {number|undefined} newHeight
       * @param {number|undefined} newWidth
       * @param {!./layout-rect.LayoutMarginsDef=} opt_newMargins
       * @final
       * @package
       */

    }, {
      key: "applySize",
      value: function applySize(newHeight, newWidth, opt_newMargins) {
        var sizer = this.getSizer_();

        if (sizer) {
          // From the moment height is changed the element becomes fully
          // responsible for managing its height. Aspect ratio is no longer
          // preserved.
          this.sizerElement = null;
          this.resetSizer_(sizer);
          this.mutateOrInvoke_(function () {
            if (sizer) {
              dom.removeElement(sizer);
            }
          });
        }

        if (newHeight !== undefined) {
          setStyle(this, 'height', newHeight, 'px');
        }

        if (newWidth !== undefined) {
          setStyle(this, 'width', newWidth, 'px');
        }

        if (opt_newMargins) {
          if (opt_newMargins.top != null) {
            setStyle(this, 'marginTop', opt_newMargins.top, 'px');
          }

          if (opt_newMargins.right != null) {
            setStyle(this, 'marginRight', opt_newMargins.right, 'px');
          }

          if (opt_newMargins.bottom != null) {
            setStyle(this, 'marginBottom', opt_newMargins.bottom, 'px');
          }

          if (opt_newMargins.left != null) {
            setStyle(this, 'marginLeft', opt_newMargins.left, 'px');
          }
        }

        if (this.isAwaitingSize_()) {
          this.sizeProvided_();
        }

        dom.dispatchCustomEvent(this, AmpEvents.SIZE_CHANGED);
      }
      /**
       * Called when the element is first connected to the DOM.
       *
       * This callback is guarded by checks to see if the element is still
       * connected.  Chrome and Safari can trigger connectedCallback even when
       * the node is disconnected. See #12849, https://crbug.com/821195, and
       * https://bugs.webkit.org/show_bug.cgi?id=180940. Thankfully,
       * connectedCallback will later be called when the disconnected root is
       * connected to the document tree.
       *
       * @final
       */

    }, {
      key: "connectedCallback",
      value: function connectedCallback() {
        if (!isTemplateTagSupported() && this.isInTemplate_ === undefined) {
          this.isInTemplate_ = !!query.closestAncestorElementBySelector(this, 'template');
        }

        if (this.isInTemplate_) {
          return;
        }

        if (this.isConnected_ || !dom.isConnectedNode(this)) {
          return;
        }

        this.isConnected_ = true;

        if (!this.everAttached) {
          this.classList.add('i-amphtml-element');
          this.classList.add('i-amphtml-notbuilt');
          this.classList.add('amp-notbuilt');
        }

        if (!this.ampdoc_) {
          // Ampdoc can now be initialized.
          var _win = toWin(this.ownerDocument.defaultView);

          var ampdocService = Services.ampdocServiceFor(_win);
          var ampdoc = ampdocService.getAmpDoc(this);
          this.ampdoc_ = ampdoc;
          elementConnectedCallback(ampdoc, this, this.implClass_);
        }

        if (!this.resources_) {
          // Resources can now be initialized since the ampdoc is now available.
          this.resources_ = Services.resourcesForDoc(this.ampdoc_);
        }

        this.getResources().add(this);

        if (this.everAttached) {
          var reconstruct = this.reconstructWhenReparented();

          if (reconstruct) {
            this.reset_();
          }

          if (this.isUpgraded()) {
            if (reconstruct && !this.R1()) {
              this.getResources().upgraded(this);
            }

            this.connected_();
            this.dispatchCustomEventForTesting(AmpEvents.ATTACHED);
          }

          if (this.implClass_ && this.R1()) {
            this.upgradeOrSchedule_();
          }
        } else {
          this.everAttached = true;

          try {
            this.layout_ = applyStaticLayout(this, Services.platformFor(toWin(this.ownerDocument.defaultView)).isIe());
            this.initMediaAttrs_();
          } catch (e) {
            reportError(e, this);
          }

          if (this.implClass_) {
            this.upgradeOrSchedule_();
          }

          if (!this.isUpgraded()) {
            this.classList.add('amp-unresolved');
            this.classList.add('i-amphtml-unresolved');
            this.dispatchCustomEventForTesting(AmpEvents.STUBBED);
          }
        }

        this.toggleLoading(true);
      }
      /**
       * @return {boolean}
       * @private
       */

    }, {
      key: "isAwaitingSize_",
      value: function isAwaitingSize_() {
        return this.classList.contains('i-amphtml-layout-awaiting-size');
      }
      /**
       * @private
       */

    }, {
      key: "sizeProvided_",
      value: function sizeProvided_() {
        this.classList.remove('i-amphtml-layout-awaiting-size');
      }
      /**
       * Upgrade or schedule element based on R1.
       * @param {boolean=} opt_disablePreload
       * @private @final
       */

    }, {
      key: "upgradeOrSchedule_",
      value: function upgradeOrSchedule_(opt_disablePreload) {
        if (!this.R1()) {
          this.tryUpgrade_();
          return;
        }

        if (this.mountPromise_) {
          // Already mounting.
          return;
        }

        // Schedule build and mount.
        var scheduler = getSchedulerForDoc(this.getAmpDoc());
        scheduler.schedule(this);

        if (this.buildingPromise_) {
          // Already built or building: just needs to be mounted.
          this.setReadyStateInternal(this.implClass_ && this.implClass_.usesLoading(this) ? ReadyState.LOADING : ReadyState.MOUNTING);
        } else {
          // Not built yet: execute prebuild steps.
          this.setReadyStateInternal(ReadyState.BUILDING);

          // Schedule preconnects.
          if (!opt_disablePreload) {
            var urls = this.implClass_.getPreconnects(this);

            if (urls && urls.length > 0) {
              // If we do early preconnects we delay them a bit. This is kind of
              // an unfortunate trade off, but it seems faster, because the DOM
              // operations themselves are not free and might delay
              var ampdoc = this.getAmpDoc();
              startupChunk(ampdoc, function () {
                var win = ampdoc.win;

                if (!win) {
                  return;
                }

                var preconnect = Services.preconnectFor(win);
                urls.forEach(function (url) {
                  return preconnect.url(ampdoc, url,
                  /* alsoConnecting */
                  false);
                });
              });
            }
          }
        }
      }
      /**
       * Try to upgrade the element with the provided implementation.
       * @return {!Promise|undefined}
       * @private @final
       */

    }, {
      key: "tryUpgrade_",
      value: function tryUpgrade_() {
        var _this9 = this;

        if (this.isInTemplate_) {
          return;
        }

        if (this.upgradeState_ != UpgradeState.NOT_UPGRADED) {
          // Already upgraded or in progress or failed.
          return;
        }

        var Ctor = devAssert(this.implClass_, 'Implementation must not be a stub');
        var impl = new Ctor(this);
        // The `upgradeCallback` only allows redirect once for the top-level
        // non-stub class. We may allow nested upgrades later, but they will
        // certainly be bad for performance.
        this.upgradeState_ = UpgradeState.UPGRADE_IN_PROGRESS;
        var startTime = win.Date.now();
        var res = impl.upgradeCallback();

        if (!res) {
          // Nothing returned: the current object is the upgraded version.
          this.completeUpgrade_(impl, startTime);
        } else if (typeof res.then == 'function') {
          // It's a promise: wait until it's done.
          return res.then(function (upgrade) {
            _this9.completeUpgrade_(upgrade || impl, startTime);
          }).catch(function (reason) {
            _this9.upgradeState_ = UpgradeState.UPGRADE_FAILED;
            rethrowAsync(reason);
          });
        } else {
          // It's an actual instance: upgrade immediately.
          this.completeUpgrade_(
          /** @type {!./base-element.BaseElement} */
          res, startTime);
        }
      }
      /**
       * Called when the element is disconnected from the DOM.
       *
       * @final
       */

    }, {
      key: "disconnectedCallback",
      value: function disconnectedCallback() {
        this.disconnect(
        /* pretendDisconnected */
        false);
      }
      /** @private */

    }, {
      key: "connected_",
      value: function connected_() {
        if (this.built_) {
          this.impl_.attachedCallback();
        }
      }
      /**
       * Called when an element is disconnected from DOM, or when an ampDoc is
       * being disconnected (the element itself may still be connected to ampDoc).
       *
       * This callback is guarded by checks to see if the element is still
       * connected. See #12849, https://crbug.com/821195, and
       * https://bugs.webkit.org/show_bug.cgi?id=180940.
       * If the element is still connected to the document, you'll need to pass
       * opt_pretendDisconnected.
       *
       * @param {boolean} pretendDisconnected Forces disconnection regardless
       *     of DOM isConnected.
       */

    }, {
      key: "disconnect",
      value: function disconnect(pretendDisconnected) {
        if (this.isInTemplate_ || !this.isConnected_) {
          return;
        }

        if (!pretendDisconnected && dom.isConnectedNode(this)) {
          return;
        }

        // This path only comes from Resource#disconnect, which deletes the
        // Resource instance tied to this element. Therefore, it is no longer
        // an AMP Element. But, DOM queries for i-amphtml-element assume that
        // the element is tied to a Resource.
        if (pretendDisconnected) {
          this.classList.remove('i-amphtml-element');
        }

        this.isConnected_ = false;
        this.getResources().remove(this);

        if (this.impl_) {
          this.impl_.detachedCallback();
        }

        if (this.R1()) {
          this.unmount();
        }

        this.toggleLoading(false);
        this.disposeMediaAttrs_();
      }
      /**
       * Dispatches a custom event only in testing environment.
       *
       * @param {string} name
       * @param {!Object=} opt_data Event data.
       * @final
       */

    }, {
      key: "dispatchCustomEventForTesting",
      value: function dispatchCustomEventForTesting(name, opt_data) {
        if (!getMode().test) {
          return;
        }

        dom.dispatchCustomEvent(this, name, opt_data);
      }
      /**
       * Whether the element can pre-render.
       * @return {boolean}
       * @final
       */

    }, {
      key: "prerenderAllowed",
      value: function prerenderAllowed() {
        if (this.hasAttribute('noprerender')) {
          return false;
        }

        return this.implClass_ ? this.implClass_.prerenderAllowed(this) : false;
      }
      /**
       * Whether the element has render-blocking service.
       * @return {boolean}
       * @final
       */

    }, {
      key: "isBuildRenderBlocking",
      value: function isBuildRenderBlocking() {
        return this.impl_ ? this.impl_.isBuildRenderBlocking() : false;
      }
      /**
       * Creates a placeholder for the element.
       * @return {?Element}
       * @final
       */

    }, {
      key: "createPlaceholder",
      value: function createPlaceholder() {
        return this.impl_ ? this.impl_.createPlaceholderCallback() : null;
      }
      /**
       * Creates a loader logo.
       * @return {{
       *  content: (!Element|undefined),
       *  color: (string|undefined),
       * }}
       * @final
       */

    }, {
      key: "createLoaderLogo",
      value: function createLoaderLogo() {
        return this.implClass_ ? this.implClass_.createLoaderLogoCallback(this) : {};
      }
      /**
       * Whether the element should ever render when it is not in viewport.
       * @return {boolean|number}
       * @final
       */

    }, {
      key: "renderOutsideViewport",
      value: function renderOutsideViewport() {
        return this.impl_ ? this.impl_.renderOutsideViewport() : false;
      }
      /**
       * Whether the element should render outside of renderOutsideViewport when
       * the scheduler is idle.
       * @return {boolean|number}
       * @final
       */

    }, {
      key: "idleRenderOutsideViewport",
      value: function idleRenderOutsideViewport() {
        return this.impl_ ? this.impl_.idleRenderOutsideViewport() : false;
      }
      /**
       * Returns a previously measured layout box adjusted to the viewport. This
       * mainly affects fixed-position elements that are adjusted to be always
       * relative to the document position in the viewport.
       * @return {!./layout-rect.LayoutRectDef}
       * @final
       */

    }, {
      key: "getLayoutBox",
      value: function getLayoutBox() {
        return this.getResource_().getLayoutBox();
      }
      /**
       * Returns a previously measured layout size.
       * @return {!./layout-rect.LayoutSizeDef}
       * @final
       */

    }, {
      key: "getLayoutSize",
      value: function getLayoutSize() {
        return this.getResource_().getLayoutSize();
      }
      /**
       * @return {?Element}
       * @final
       */

    }, {
      key: "getOwner",
      value: function getOwner() {
        return this.getResource_().getOwner();
      }
      /**
       * Returns a change entry for that should be compatible with
       * IntersectionObserverEntry.
       * @return {?IntersectionObserverEntry} A change entry.
       * @final
       */

    }, {
      key: "getIntersectionChangeEntry",
      value: function getIntersectionChangeEntry() {
        var box = this.impl_ ? this.impl_.getIntersectionElementLayoutBox() : this.getLayoutBox();
        var owner = this.getOwner();
        var viewport = Services.viewportForDoc(this.getAmpDoc());
        var viewportBox = viewport.getRect();
        // TODO(jridgewell, #4826): We may need to make this recursive.
        var ownerBox = owner && owner.getLayoutBox();
        return _getIntersectionChangeEntry(box, ownerBox, viewportBox);
      }
      /**
       * Returns the resource of the element.
       * @return {!./service/resource.Resource}
       * @private
       */

    }, {
      key: "getResource_",
      value: function getResource_() {
        return this.getResources().getResourceForElement(this);
      }
      /**
       * Returns the resource ID of the element.
       * @return {number}
       */

    }, {
      key: "getResourceId",
      value: function getResourceId() {
        return this.getResource_().getId();
      }
      /**
       * The runtime calls this method to determine if {@link layoutCallback}
       * should be called again when layout changes.
       * @return {boolean}
       * @package @final
       * TODO(#31915): remove once R1 migration is complete.
       */

    }, {
      key: "isRelayoutNeeded",
      value: function isRelayoutNeeded() {
        return this.impl_ ? this.impl_.isRelayoutNeeded() : false;
      }
      /**
       * Returns reference to upgraded implementation.
       * @param {boolean} waitForBuild If true, waits for element to be built before
       *   resolving the returned Promise. Default is true.
       * @return {!Promise<!./base-element.BaseElement>}
       */

    }, {
      key: "getImpl",
      value: function getImpl(waitForBuild) {
        var _this10 = this;

        if (waitForBuild === void 0) {
          waitForBuild = true;
        }

        var waitFor = waitForBuild ? this.build() : this.createImpl_();
        return waitFor.then(function () {
          return _this10.impl_;
        });
      }
      /**
       * @return {!Promise<!./base-element.BaseElement>}
       * @private
       */

    }, {
      key: "createImpl_",
      value: function createImpl_() {
        var _this11 = this;

        return this.signals_.whenSignal(CommonSignals.READY_TO_UPGRADE).then(function () {
          _this11.tryUpgrade_();

          return _this11.whenUpgraded();
        });
      }
      /**
       * Returns the object which holds the API surface (the thing we add the
       * custom methods/properties onto). In Bento, this is the imperative API
       * object. In AMP, this is the BaseElement instance.
       *
       * @return {!Promise<!Object>}
       */

    }, {
      key: "getApi",
      value: function getApi() {
        return this.getImpl().then(function (impl) {
          return impl.getApi();
        });
      }
      /**
       * Returns the layout of the element.
       * @return {!Layout}
       */

    }, {
      key: "getLayout",
      value: function getLayout() {
        return this.layout_;
      }
      /**
       * Instructs the element to layout its content and load its resources if
       * necessary by calling the {@link BaseElement.layoutCallback} method that
       * should be implemented by BaseElement subclasses. Must return a promise
       * that will yield when the layout and associated loadings are complete.
       *
       * This method is always called for the first layout, but for subsequent
       * layouts the runtime consults {@link isRelayoutNeeded} method.
       *
       * Can only be called on a upgraded and built element.
       *
       * @param {!AbortSignal} signal
       * @return {!Promise}
       * @package @final
       * TODO(#31915): remove once R1 migration is complete.
       */

    }, {
      key: "layoutCallback",
      value: function layoutCallback(signal) {
        var _this12 = this;

        assertNotTemplate(this);
        devAssert(this.isBuilt(), 'Must be built to receive viewport events');

        // A lot of tests call layoutCallback manually, and don't pass a signal.
        if ((!getMode().test || signal) && signal.aborted) {
          return Promise.reject(cancellation());
        }

        this.dispatchCustomEventForTesting(AmpEvents.LOAD_START);
        var isLoadEvent = this.layoutCount_ == 0;
        // First layout is "load".
        this.signals_.reset(CommonSignals.UNLOAD);

        if (isLoadEvent) {
          this.signals_.signal(CommonSignals.LOAD_START);
        }

        // Potentially start the loading indicator.
        this.toggleLoading(true);
        var promise = tryResolve(function () {
          return _this12.impl_.layoutCallback();
        });
        this.preconnect(
        /* onLayout */
        true);
        this.classList.add('i-amphtml-layout');
        return promise.then(function () {
          if ((!getMode().test || signal) && signal.aborted) {
            throw cancellation();
          }

          if (isLoadEvent) {
            _this12.signals_.signal(CommonSignals.LOAD_END);
          }

          _this12.setReadyStateInternal(ReadyState.COMPLETE);

          _this12.layoutCount_++;

          _this12.toggleLoading(false);

          // Check if this is the first success layout that needs
          // to call firstLayoutCompleted.
          if (!_this12.isFirstLayoutCompleted_) {
            _this12.impl_.firstLayoutCompleted();

            _this12.isFirstLayoutCompleted_ = true;

            _this12.dispatchCustomEventForTesting(AmpEvents.LOAD_END);
          }
        }, function (reason) {
          if ((!getMode().test || signal) && signal.aborted) {
            throw cancellation();
          }

          // add layoutCount_ by 1 despite load fails or not
          if (isLoadEvent) {
            _this12.signals_.rejectSignal(CommonSignals.LOAD_END,
            /** @type {!Error} */
            reason);
          }

          _this12.setReadyStateInternal(ReadyState.ERROR, reason);

          _this12.layoutCount_++;

          _this12.toggleLoading(false);

          throw reason;
        });
      }
      /**
       * Pauses the element.
       *
       * @package @final
       */

    }, {
      key: "pause",
      value: function pause() {
        if (!this.isBuilt()) {
          // Not built yet.
          return;
        }

        this.impl_.pauseCallback();

        // Legacy unlayoutOnPause support.
        if (!this.R1() && this.impl_.unlayoutOnPause()) {
          this.unlayout_();
        }
      }
      /**
       * Requests the resource to resume its activity when the document returns
       * from an inactive state. The scope is up to the actual component. Among
       * other things the active playback of video or audio content may be
       * resumed.
       *
       * @package @final
       */

    }, {
      key: "resume",
      value: function resume() {
        if (!this.isBuilt()) {
          return;
        }

        this.impl_.resumeCallback();
      }
      /**
       * Requests the element to unload any expensive resources when the element
       * goes into non-visible state. The scope is up to the actual component.
       *
       * Calling this method on unbuilt or unupgraded element has no effect.
       *
       * @return {boolean}
       * @package @final
       * TODO(#31915): remove once R1 migration is complete.
       */

    }, {
      key: "unlayoutCallback",
      value: function unlayoutCallback() {
        assertNotTemplate(this);

        if (!this.isBuilt()) {
          return false;
        }

        this.signals_.signal(CommonSignals.UNLOAD);
        var isReLayoutNeeded = this.impl_.unlayoutCallback();

        if (isReLayoutNeeded) {
          this.reset_();
        }

        this.dispatchCustomEventForTesting(AmpEvents.UNLOAD);
        return isReLayoutNeeded;
      }
      /** @private */

    }, {
      key: "unlayout_",
      value: function unlayout_() {
        this.getResource_().unlayout();

        if (this.isConnected_ && this.resources_) {
          this.resources_.
          /*OK*/
          schedulePass();
        }
      }
      /** @private */

    }, {
      key: "reset_",
      value: function reset_() {
        this.layoutCount_ = 0;
        this.isFirstLayoutCompleted_ = false;
        this.signals_.reset(CommonSignals.MOUNTED);
        this.signals_.reset(CommonSignals.RENDER_START);
        this.signals_.reset(CommonSignals.LOAD_START);
        this.signals_.reset(CommonSignals.LOAD_END);
        this.signals_.reset(CommonSignals.INI_LOAD);
      }
      /**
       * Whether the element needs to be reconstructed after it has been
       * re-parented. Many elements cannot survive fully the reparenting and
       * are better to be reconstructed from scratch.
       *
       * @return {boolean}
       * @package @final
       */

    }, {
      key: "reconstructWhenReparented",
      value: function reconstructWhenReparented() {
        return this.impl_ ? this.impl_.reconstructWhenReparented() : false;
      }
      /**
       * Collapses the element, and notifies its owner (if there is one) that the
       * element is no longer present.
       */

    }, {
      key: "collapse",
      value: function collapse() {
        if (this.impl_) {
          this.impl_.
          /*OK*/
          collapse();
        }
      }
      /**
       * Called every time an owned AmpElement collapses itself.
       * @param {!AmpElement} element
       */

    }, {
      key: "collapsedCallback",
      value: function collapsedCallback(element) {
        if (this.impl_) {
          this.impl_.collapsedCallback(element);
        }
      }
      /**
       * Expands the element, and notifies its owner (if there is one) that the
       * element is now present.
       */

    }, {
      key: "expand",
      value: function expand() {
        if (this.impl_) {
          this.impl_.
          /*OK*/
          expand();
        }
      }
      /**
       * Called when one or more attributes are mutated.
       * Note: Must be called inside a mutate context.
       * Note: Boolean attributes have a value of `true` and `false` when
       *     present and missing, respectively.
       * @param {!JsonObject<string, (null|boolean|string|number|Array|Object)>} mutations
       */

    }, {
      key: "mutatedAttributesCallback",
      value: function mutatedAttributesCallback(mutations) {
        if (this.impl_) {
          this.impl_.mutatedAttributesCallback(mutations);
        }
      }
      /**
       * Enqueues the action with the element. If element has been upgraded and
       * built, the action is dispatched to the implementation right away.
       * Otherwise the invocation is enqueued until the implementation is ready
       * to receive actions.
       * @param {!./service/action-impl.ActionInvocation} invocation
       * @final
       */

    }, {
      key: "enqueAction",
      value: function enqueAction(invocation) {
        assertNotTemplate(this);

        if (!this.isBuilt()) {
          if (this.actionQueue_ === undefined) {
            this.actionQueue_ = [];
          }

          devAssert(this.actionQueue_).push(invocation);
          // Schedule build sooner.
          this.build();
        } else {
          this.executionAction_(invocation, false);
        }
      }
      /**
       * Dequeues events from the queue and dispatches them to the implementation
       * with "deferred" flag.
       * @private
       */

    }, {
      key: "dequeueActions_",
      value: function dequeueActions_() {
        var _this13 = this;

        if (!this.actionQueue_) {
          return;
        }

        var actionQueue = devAssert(this.actionQueue_);
        this.actionQueue_ = null;
        // Notice, the actions are currently not de-duped.
        actionQueue.forEach(function (invocation) {
          _this13.executionAction_(invocation, true);
        });
      }
      /**
       * Executes the action immediately. All errors are consumed and reported.
       * @param {!./service/action-impl.ActionInvocation} invocation
       * @param {boolean} deferred
       * @final
       * @private
       */

    }, {
      key: "executionAction_",
      value: function executionAction_(invocation, deferred) {
        try {
          this.impl_.executeAction(invocation, deferred);
        } catch (e) {
          rethrowAsync('Action execution failed:', e, invocation.node.tagName, invocation.method);
        }
      }
      /**
       * Get the consent policy to follow.
       * @return {?string}
       */

    }, {
      key: "getConsentPolicy_",
      value: function getConsentPolicy_() {
        var policyId = this.getAttribute('data-block-on-consent');

        if (policyId === null) {
          if (shouldBlockOnConsentByMeta(this)) {
            policyId = 'default';
            this.setAttribute('data-block-on-consent', policyId);
          } else {
            // data-block-on-consent attribute not set
            return null;
          }
        }

        if (policyId == '' || policyId == 'default') {
          // data-block-on-consent value not set, up to individual element
          // Note: data-block-on-consent and data-block-on-consent='default' is
          // treated exactly the same
          return devAssert(this.impl_).getConsentPolicy();
        }

        return policyId;
      }
      /**
       * Get the purpose consents that should be granted.
       * @return {Array<string>|undefined}
       */

    }, {
      key: "getPurposesConsent_",
      value: function getPurposesConsent_() {
        var _purposes$replace;

        var purposes = this.getAttribute('data-block-on-consent-purposes') || null;
        return purposes == null ? void 0 : (_purposes$replace = purposes.replace(/\s+/g, '')) == null ? void 0 : _purposes$replace.split(',');
      }
      /**
       * Returns an optional placeholder element for this custom element.
       * @return {?Element}
       * @package @final
       */

    }, {
      key: "getPlaceholder",
      value: function getPlaceholder() {
        return query.lastChildElement(this, function (el) {
          return el.hasAttribute('placeholder') && // Denylist elements that has a native placeholder property
          // like input and textarea. These are not allowed to be AMP
          // placeholders.
          !isInputPlaceholder(el);
        });
      }
      /**
       * Hides or shows the placeholder, if available.
       * @param {boolean} show
       * @package @final
       */

    }, {
      key: "togglePlaceholder",
      value: function togglePlaceholder(show) {
        assertNotTemplate(this);

        if (show) {
          var placeholder = this.getPlaceholder();

          if (placeholder) {
            dev().assertElement(placeholder).classList.remove('amp-hidden');
          }
        } else {
          var placeholders = query.childElementsByAttr(this, 'placeholder');

          for (var i = 0; i < placeholders.length; i++) {
            // Don't toggle elements with a native placeholder property
            // e.g. input, textarea
            if (isInputPlaceholder(placeholders[i])) {
              continue;
            }

            placeholders[i].classList.add('amp-hidden');
          }
        }
      }
      /**
       * Returns an optional fallback element for this custom element.
       * @return {?Element}
       * @package @final
       */

    }, {
      key: "getFallback",
      value: function getFallback() {
        return query.childElementByAttr(this, 'fallback');
      }
      /**
       * Hides or shows the fallback, if available. This function must only
       * be called inside a mutate context.
       * @param {boolean} show
       * @package @final
       */

    }, {
      key: "toggleFallback",
      value: function toggleFallback(show) {
        assertNotTemplate(this);
        var resourceState = this.getResource_().getState();

        // Do not show fallback before layout
        if (!this.R1() && show && (resourceState == ResourceState.NOT_BUILT || resourceState == ResourceState.NOT_LAID_OUT || resourceState == ResourceState.READY_FOR_LAYOUT)) {
          return;
        }

        // This implementation is notably less efficient then placeholder
        // toggling. The reasons for this are: (a) "not supported" is the state of
        // the whole element, (b) some relayout is expected and (c) fallback
        // condition would be rare.
        this.classList.toggle('amp-notsupported', show);

        if (show == true) {
          var fallbackElement = this.getFallback();

          if (fallbackElement) {
            Services.ownersForDoc(this.getAmpDoc()).scheduleLayout(this, fallbackElement);
          }
        }
      }
      /**
       * An implementation can call this method to signal to the element that
       * it has started rendering.
       * @package @final
       */

    }, {
      key: "renderStarted",
      value: function renderStarted() {
        this.signals_.signal(CommonSignals.RENDER_START);
        this.togglePlaceholder(false);
        this.toggleLoading(false);
      }
      /**
       * Whether the loading can be shown for this element.
       * @param {boolean} force
       * @return {boolean}
       * @private
       */

    }, {
      key: "isLoadingEnabled_",
      value: function isLoadingEnabled_(force) {
        // No loading indicator will be shown if either one of these conditions
        // true:
        // 1. The document is A4A.
        // 2. `noloading` attribute is specified;
        // 3. The element has already been laid out, and does not support reshowing the indicator (include having loading
        //    error);
        // 4. The element is too small or has not yet been measured;
        // 5. The element has not been allowlisted;
        // 6. The element is an internal node (e.g. `placeholder` or `fallback`);
        // 7. The element's layout is not nodisplay.
        var laidOut = this.layoutCount_ > 0 || this.signals_.get(CommonSignals.RENDER_START);

        if (this.layout_ == Layout.NODISPLAY || this.hasAttribute('noloading') || laidOut && !force || !isLoadingAllowed(this) || query.isInternalOrServiceNode(this)) {
          return false;
        }

        return true;
      }
      /**
       * Turns the loading indicator on or off.
       * @param {boolean} state
       * @param {boolean=} force
       * @public @final
       */

    }, {
      key: "toggleLoading",
      value: function toggleLoading(state, force) {
        if (force === void 0) {
          force = false;
        }

        // TODO(dvoytenko, #9177): cleanup `this.ownerDocument.defaultView`
        // once investigation is complete. It appears that we get a lot of
        // errors here once the iframe is destroyed due to timer.
        if (!this.ownerDocument || !this.ownerDocument.defaultView) {
          return;
        }

        var loadingIndicator = Services.loadingIndicatorOrNull(this.getAmpDoc());

        if (loadingIndicator) {
          state = state && this.isLoadingEnabled_(force);

          if (state) {
            loadingIndicator.track(this);
          } else {
            loadingIndicator.untrack(this);
          }
        }
      }
      /**
       * Returns an optional overflow element for this custom element.
       * @return {?Element}
       */

    }, {
      key: "getOverflowElement",
      value: function getOverflowElement() {
        if (this.overflowElement_ === undefined) {
          this.overflowElement_ = query.childElementByAttr(this, 'overflow');

          if (this.overflowElement_) {
            if (!this.overflowElement_.hasAttribute('tabindex')) {
              this.overflowElement_.setAttribute('tabindex', '0');
            }

            if (!this.overflowElement_.hasAttribute('role')) {
              this.overflowElement_.setAttribute('role', 'button');
            }
          }
        }

        return this.overflowElement_;
      }
      /**
       * Hides or shows the overflow, if available. This function must only
       * be called inside a mutate context.
       * @param {boolean} overflown
       * @param {number|undefined} requestedHeight
       * @param {number|undefined} requestedWidth
       * @package @final
       */

    }, {
      key: "overflowCallback",
      value: function overflowCallback(overflown, requestedHeight, requestedWidth) {
        var _this14 = this;

        this.getOverflowElement();

        if (!this.overflowElement_) {
          if (overflown && this.warnOnMissingOverflow) {
            user().warn(TAG, 'Cannot resize element and overflow is not available', this);
          }
        } else {
          this.overflowElement_.classList.toggle('amp-visible', overflown);

          if (overflown) {
            this.overflowElement_.onclick = function () {
              var mutator = Services.mutatorForDoc(_this14.getAmpDoc());
              mutator.forceChangeSize(_this14, requestedHeight, requestedWidth);
              mutator.mutateElement(_this14, function () {
                _this14.overflowCallback(
                /* overflown */
                false, requestedHeight, requestedWidth);
              });
            };
          } else {
            this.overflowElement_.onclick = null;
          }
        }
      }
      /**
       * Mutates the element using resources if available.
       *
       * @param {function()} mutator
       * @param {?Element=} opt_element
       * @param {boolean=} opt_skipRemeasure
       */

    }, {
      key: "mutateOrInvoke_",
      value: function mutateOrInvoke_(mutator, opt_element, opt_skipRemeasure) {
        if (opt_skipRemeasure === void 0) {
          opt_skipRemeasure = false;
        }

        if (this.ampdoc_) {
          Services.mutatorForDoc(this.getAmpDoc()).mutateElement(opt_element || this, mutator, opt_skipRemeasure);
        } else {
          mutator();
        }
      }
    }]);

    return BaseCustomElement;
  }(htmlElement);

  win.__AMP_BASE_CE_CLASS = BaseCustomElement;
  return (
    /** @type {typeof HTMLElement} */
    win.__AMP_BASE_CE_CLASS
  );
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
function isInputPlaceholder(element) {
  return 'placeholder' in element;
}

/** @param {!Element} element */
function assertNotTemplate(element) {
  devAssert(!element.isInTemplate_, 'Must never be called in template');
}

/**
 * Creates a new custom element class prototype.
 *
 * @param {!Window} win The window in which to register the custom element.
 * @param {(typeof ./base-element.BaseElement)=} opt_implementationClass For testing only.
 * @param {function(!./service/ampdoc-impl.AmpDoc, !AmpElement, ?(typeof BaseElement))=} opt_elementConnectedCallback
 * @return {!Object} Prototype of element.
 * @visibleForTesting
 */
export function createAmpElementForTesting(win, opt_implementationClass, opt_elementConnectedCallback) {
  var Element = createCustomElementClass(win, opt_elementConnectedCallback || function () {});

  if (getMode().test && opt_implementationClass) {
    Element.prototype.implementationClassForTesting = opt_implementationClass;
  }

  return Element;
}

/**
 * @visibleForTesting
 */
export function resetStubsForTesting() {
  stubbedElements.length = 0;
}

/**
 * @param {!AmpElement} element
 * @return {?(typeof BaseElement)}
 * @visibleForTesting
 */
export function getImplClassSyncForTesting(element) {
  return element.implClass_;
}

/**
 * @param {!AmpElement} element
 * @return {!BaseElement}
 * @visibleForTesting
 */
export function getImplSyncForTesting(element) {
  return element.impl_;
}

/**
 * @param {!AmpElement} element
 * @return {?Array<!./service/action-impl.ActionInvocation>|undefined}
 * @visibleForTesting
 */
export function getActionQueueForTesting(element) {
  return element.actionQueue_;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN1c3RvbS1lbGVtZW50LmpzIl0sIm5hbWVzIjpbIlVQR1JBREVfVE9fQ1VTVE9NRUxFTUVOVF9QUk9NSVNFIiwiVVBHUkFERV9UT19DVVNUT01FTEVNRU5UX1JFU09MVkVSIiwic3RhcnR1cENodW5rIiwic2hvdWxkQmxvY2tPbkNvbnNlbnRCeU1ldGEiLCJBbXBFdmVudHMiLCJDb21tb25TaWduYWxzIiwiUmVhZHlTdGF0ZSIsInRyeVJlc29sdmUiLCJTaWduYWxzIiwiZG9tIiwiTGF5b3V0IiwiTGF5b3V0UHJpb3JpdHkiLCJpc0xvYWRpbmdBbGxvd2VkIiwiTWVkaWFRdWVyeVByb3BzIiwicXVlcnkiLCJzZXRTdHlsZSIsInJldGhyb3dBc3luYyIsInRvV2luIiwiRWxlbWVudFN0dWIiLCJibG9ja2VkQnlDb25zZW50RXJyb3IiLCJjYW5jZWxsYXRpb24iLCJpc0Jsb2NrZWRCeUNvbnNlbnQiLCJpc0NhbmNlbGxhdGlvbiIsInJlcG9ydEVycm9yIiwiZGV2IiwiZGV2QXNzZXJ0IiwidXNlciIsInVzZXJBc3NlcnQiLCJnZXRNb2RlIiwiU2VydmljZXMiLCJSZXNvdXJjZVN0YXRlIiwiZ2V0U2NoZWR1bGVyRm9yRG9jIiwiYXBwbHlTdGF0aWNMYXlvdXQiLCJnZXRJbnRlcnNlY3Rpb25DaGFuZ2VFbnRyeSIsIlRBRyIsIlVwZ3JhZGVTdGF0ZSIsIk5PVF9VUEdSQURFRCIsIlVQR1JBREVEIiwiVVBHUkFERV9GQUlMRUQiLCJVUEdSQURFX0lOX1BST0dSRVNTIiwiTk9fQlVCQkxFUyIsImJ1YmJsZXMiLCJSRVRVUk5fVFJVRSIsInRlbXBsYXRlVGFnU3VwcG9ydGVkIiwic3R1YmJlZEVsZW1lbnRzIiwiaXNUZW1wbGF0ZVRhZ1N1cHBvcnRlZCIsInVuZGVmaW5lZCIsInRlbXBsYXRlIiwic2VsZiIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNyZWF0ZUN1c3RvbUVsZW1lbnRDbGFzcyIsIndpbiIsImVsZW1lbnRDb25uZWN0ZWRDYWxsYmFjayIsIkJhc2VDdXN0b21FbGVtZW50IiwiY3JlYXRlQmFzZUN1c3RvbUVsZW1lbnRDbGFzcyIsIkN1c3RvbUFtcEVsZW1lbnQiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsImN1c3RvbUFtcEVsZW1lbnRQcm90byIsInNldFByb3RvdHlwZU9mIiwicHJvdG90eXBlIiwiX19BTVBfQkFTRV9DRV9DTEFTUyIsImh0bWxFbGVtZW50IiwiSFRNTEVsZW1lbnQiLCJjcmVhdGVkQ2FsbGJhY2siLCJidWlsdF8iLCJpc0Nvbm5lY3RlZF8iLCJidWlsZGluZ1Byb21pc2VfIiwibW91bnRlZF8iLCJtb3VudFByb21pc2VfIiwibW91bnRBYm9ydENvbnRyb2xsZXJfIiwicmVhZHlTdGF0ZV8iLCJVUEdSQURJTkciLCJldmVyQXR0YWNoZWQiLCJhbXBkb2NfIiwicmVzb3VyY2VzXyIsImxheW91dF8iLCJOT0RJU1BMQVkiLCJsYXlvdXRDb3VudF8iLCJpc0ZpcnN0TGF5b3V0Q29tcGxldGVkXyIsIndhcm5Pbk1pc3NpbmdPdmVyZmxvdyIsInNpemVyRWxlbWVudCIsIm92ZXJmbG93RWxlbWVudF8iLCJsYXlvdXRTY2hlZHVsZVRpbWUiLCJub25TdHJ1Y3RUaGlzIiwiQ3RvciIsIl9fQU1QX0VYVEVOREVEX0VMRU1FTlRTIiwibG9jYWxOYW1lIiwidGVzdCIsImltcGxDbGFzc18iLCJwdXNoIiwiaW1wbF8iLCJ1cGdyYWRlU3RhdGVfIiwidXBncmFkZURlbGF5TXNfIiwiYWN0aW9uUXVldWVfIiwiaXNJblRlbXBsYXRlXyIsInNpZ25hbHNfIiwic2lnbmFsIiwiUkVBRFlfVE9fVVBHUkFERSIsInBlcmYiLCJwZXJmb3JtYW5jZUZvck9yTnVsbCIsInBlcmZPbl8iLCJpc1BlcmZvcm1hbmNlVHJhY2tpbmdPbiIsIm1lZGlhUXVlcnlQcm9wc18iLCJ3aGVuU2lnbmFsIiwibmV3SW1wbENsYXNzIiwidXBncmFkZU9yU2NoZWR1bGVfIiwibmV3SW1wbCIsInVwZ3JhZGVTdGFydFRpbWUiLCJEYXRlIiwibm93Iiwic2V0UmVhZHlTdGF0ZUludGVybmFsIiwiQlVJTERJTkciLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJhc3NlcnRMYXlvdXRfIiwiZGlzcGF0Y2hDdXN0b21FdmVudEZvclRlc3RpbmciLCJBVFRBQ0hFRCIsIlIxIiwiZ2V0UmVzb3VyY2VzIiwidXBncmFkZWQiLCJpc0xheW91dFN1cHBvcnRlZCIsImdldEF0dHJpYnV0ZSIsImdldEJ1aWxkUHJpb3JpdHkiLCJCQUNLR1JPVU5EIiwiZ2V0TGF5b3V0UHJpb3JpdHkiLCJpc1VwZ3JhZGVkIiwiZ2V0RGVmYXVsdEFjdGlvbkFsaWFzIiwiQlVJTFQiLCJhc3NlcnROb3RUZW1wbGF0ZSIsImltcGxQcm9taXNlIiwiY3JlYXRlSW1wbF8iLCJjb25zZW50UHJvbWlzZSIsInRoZW4iLCJwb2xpY3lJZCIsImdldENvbnNlbnRQb2xpY3lfIiwicHVycG9zZUNvbnNlbnRzIiwiZ2V0UHVycG9zZXNDb25zZW50XyIsImNvbnNlbnRQb2xpY3lTZXJ2aWNlRm9yRG9jT3JOdWxsIiwicG9saWN5Iiwid2hlblBvbGljeVVuYmxvY2siLCJ3aGVuUHVycG9zZXNVbmJsb2NrIiwic2hvdWxkVW5ibG9jayIsImJ1aWxkUHJvbWlzZSIsImJ1aWxkQ2FsbGJhY2siLCJhZGQiLCJNT1VOVElORyIsIkxPQURJTkciLCJwcmVjb25uZWN0IiwiY29ubmVjdGVkXyIsInRpbWVyRm9yIiwib3duZXJEb2N1bWVudCIsImRlZmF1bHRWaWV3IiwiZGVsYXkiLCJkZXF1ZXVlQWN0aW9uc18iLCJiaW5kIiwiZ2V0UGxhY2Vob2xkZXIiLCJwbGFjZWhvbGRlciIsImNyZWF0ZVBsYWNlaG9sZGVyIiwiYXBwZW5kQ2hpbGQiLCJyZWFzb24iLCJyZWplY3RTaWduYWwiLCJFUlJPUiIsInJlYWR5UHJvbWlzZSIsInNjaGVkdWxlciIsImdldEFtcERvYyIsInNjaGVkdWxlQXNhcCIsIndoZW5CdWlsdCIsIkFib3J0Q29udHJvbGxlciIsImJ1aWxkSW50ZXJuYWwiLCJhYm9ydGVkIiwidXNlc0xvYWRpbmciLCJyZXN1bHQiLCJtb3VudENhbGxiYWNrIiwiaGFzTG9hZGVkIiwiTU9VTlRFRCIsIkNPTVBMRVRFIiwiY2F0Y2giLCJ3aGVuTW91bnRlZCIsInBhdXNlIiwidW5sYXlvdXRfIiwiYWJvcnQiLCJ1bnNjaGVkdWxlIiwidW5tb3VudENhbGxiYWNrIiwicmVzZXRfIiwiTE9BRF9FTkQiLCJvcHRfcGFyZW50UHJpb3JpdHkiLCJtb3VudCIsImVuc3VyZUxvYWRlZCIsIndoZW5Mb2FkZWQiLCJyZXNvdXJjZSIsImdldFJlc291cmNlXyIsImdldFN0YXRlIiwiTEFZT1VUX0NPTVBMRVRFIiwiTEFZT1VUX1NDSEVEVUxFRCIsImlzTWVhc3VyZVJlcXVlc3RlZCIsIm1lYXN1cmUiLCJpc0Rpc3BsYXllZCIsInNjaGVkdWxlTGF5b3V0T3JQcmVsb2FkIiwib3B0X3Njcm9sbGVyIiwiYnVpbGRlciIsInNldENvbnRhaW5lciIsInJlbW92ZUNvbnRhaW5lciIsInN0YXRlIiwib3B0X2ZhaWx1cmUiLCJMT0FEX1NUQVJUIiwicmVzZXQiLCJVTkxPQUQiLCJ0b2dnbGVMb2FkaW5nIiwiZGlzcGF0Y2hDdXN0b21FdmVudCIsIm9uTGF5b3V0IiwicHJlY29ubmVjdENhbGxiYWNrIiwiZGVmZXJyZWRNb3VudCIsImlzQWx3YXlzRml4ZWQiLCJsYXlvdXRCb3giLCJzaXplQ2hhbmdlZCIsImlzQnVpbHQiLCJvbk1lYXN1cmUiLCJvbkxheW91dE1lYXN1cmUiLCJlIiwiUkVTUE9OU0lWRSIsIklOVFJJTlNJQyIsInF1ZXJ5U2VsZWN0b3IiLCJzaXplciIsImludHJpbnNpY1NpemVySW1nIiwic2V0QXR0cmlidXRlIiwiaGFzTWVkaWFBdHRycyIsImhhc0F0dHJpYnV0ZSIsImhhZE1lZGlhQXR0cnMiLCJhcHBseU1lZGlhQXR0cnNfIiwiZGlzcG9zZU1lZGlhQXR0cnNfIiwiZGlzcG9zZSIsInByb3BzIiwic3RhcnQiLCJtZWRpYUF0dHIiLCJtYXRjaGVzTWVkaWEiLCJyZXNvbHZlTWF0Y2hRdWVyeSIsInRvZ2dsZSIsInNpemVzQXR0ciIsInJlc29sdmVMaXN0UXVlcnkiLCJoZWlnaHRzQXR0ciIsImdldFNpemVyXyIsImNvbXBsZXRlIiwicmVxdWVzdE1lYXN1cmUiLCJuZXdIZWlnaHQiLCJuZXdXaWR0aCIsIm9wdF9uZXdNYXJnaW5zIiwicmVzZXRTaXplcl8iLCJtdXRhdGVPckludm9rZV8iLCJyZW1vdmVFbGVtZW50IiwidG9wIiwicmlnaHQiLCJib3R0b20iLCJsZWZ0IiwiaXNBd2FpdGluZ1NpemVfIiwic2l6ZVByb3ZpZGVkXyIsIlNJWkVfQ0hBTkdFRCIsImNsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yIiwiaXNDb25uZWN0ZWROb2RlIiwiYW1wZG9jU2VydmljZSIsImFtcGRvY1NlcnZpY2VGb3IiLCJhbXBkb2MiLCJyZXNvdXJjZXNGb3JEb2MiLCJyZWNvbnN0cnVjdCIsInJlY29uc3RydWN0V2hlblJlcGFyZW50ZWQiLCJwbGF0Zm9ybUZvciIsImlzSWUiLCJpbml0TWVkaWFBdHRyc18iLCJTVFVCQkVEIiwiY29udGFpbnMiLCJvcHRfZGlzYWJsZVByZWxvYWQiLCJ0cnlVcGdyYWRlXyIsInNjaGVkdWxlIiwidXJscyIsImdldFByZWNvbm5lY3RzIiwibGVuZ3RoIiwicHJlY29ubmVjdEZvciIsImZvckVhY2giLCJ1cmwiLCJpbXBsIiwic3RhcnRUaW1lIiwicmVzIiwidXBncmFkZUNhbGxiYWNrIiwiY29tcGxldGVVcGdyYWRlXyIsInVwZ3JhZGUiLCJkaXNjb25uZWN0IiwiYXR0YWNoZWRDYWxsYmFjayIsInByZXRlbmREaXNjb25uZWN0ZWQiLCJkZXRhY2hlZENhbGxiYWNrIiwidW5tb3VudCIsIm5hbWUiLCJvcHRfZGF0YSIsInByZXJlbmRlckFsbG93ZWQiLCJpc0J1aWxkUmVuZGVyQmxvY2tpbmciLCJjcmVhdGVQbGFjZWhvbGRlckNhbGxiYWNrIiwiY3JlYXRlTG9hZGVyTG9nb0NhbGxiYWNrIiwicmVuZGVyT3V0c2lkZVZpZXdwb3J0IiwiaWRsZVJlbmRlck91dHNpZGVWaWV3cG9ydCIsImdldExheW91dEJveCIsImdldExheW91dFNpemUiLCJnZXRPd25lciIsImJveCIsImdldEludGVyc2VjdGlvbkVsZW1lbnRMYXlvdXRCb3giLCJvd25lciIsInZpZXdwb3J0Iiwidmlld3BvcnRGb3JEb2MiLCJ2aWV3cG9ydEJveCIsImdldFJlY3QiLCJvd25lckJveCIsImdldFJlc291cmNlRm9yRWxlbWVudCIsImdldElkIiwiaXNSZWxheW91dE5lZWRlZCIsIndhaXRGb3JCdWlsZCIsIndhaXRGb3IiLCJidWlsZCIsIndoZW5VcGdyYWRlZCIsImdldEltcGwiLCJnZXRBcGkiLCJQcm9taXNlIiwicmVqZWN0IiwiaXNMb2FkRXZlbnQiLCJwcm9taXNlIiwibGF5b3V0Q2FsbGJhY2siLCJmaXJzdExheW91dENvbXBsZXRlZCIsInBhdXNlQ2FsbGJhY2siLCJ1bmxheW91dE9uUGF1c2UiLCJyZXN1bWVDYWxsYmFjayIsImlzUmVMYXlvdXROZWVkZWQiLCJ1bmxheW91dENhbGxiYWNrIiwidW5sYXlvdXQiLCJzY2hlZHVsZVBhc3MiLCJSRU5ERVJfU1RBUlQiLCJJTklfTE9BRCIsImNvbGxhcHNlIiwiZWxlbWVudCIsImNvbGxhcHNlZENhbGxiYWNrIiwiZXhwYW5kIiwibXV0YXRpb25zIiwibXV0YXRlZEF0dHJpYnV0ZXNDYWxsYmFjayIsImludm9jYXRpb24iLCJleGVjdXRpb25BY3Rpb25fIiwiYWN0aW9uUXVldWUiLCJkZWZlcnJlZCIsImV4ZWN1dGVBY3Rpb24iLCJub2RlIiwidGFnTmFtZSIsIm1ldGhvZCIsImdldENvbnNlbnRQb2xpY3kiLCJwdXJwb3NlcyIsInJlcGxhY2UiLCJzcGxpdCIsImxhc3RDaGlsZEVsZW1lbnQiLCJlbCIsImlzSW5wdXRQbGFjZWhvbGRlciIsInNob3ciLCJhc3NlcnRFbGVtZW50IiwicGxhY2Vob2xkZXJzIiwiY2hpbGRFbGVtZW50c0J5QXR0ciIsImkiLCJjaGlsZEVsZW1lbnRCeUF0dHIiLCJyZXNvdXJjZVN0YXRlIiwiTk9UX0JVSUxUIiwiTk9UX0xBSURfT1VUIiwiUkVBRFlfRk9SX0xBWU9VVCIsImZhbGxiYWNrRWxlbWVudCIsImdldEZhbGxiYWNrIiwib3duZXJzRm9yRG9jIiwic2NoZWR1bGVMYXlvdXQiLCJ0b2dnbGVQbGFjZWhvbGRlciIsImZvcmNlIiwibGFpZE91dCIsImdldCIsImlzSW50ZXJuYWxPclNlcnZpY2VOb2RlIiwibG9hZGluZ0luZGljYXRvciIsImxvYWRpbmdJbmRpY2F0b3JPck51bGwiLCJpc0xvYWRpbmdFbmFibGVkXyIsInRyYWNrIiwidW50cmFjayIsIm92ZXJmbG93biIsInJlcXVlc3RlZEhlaWdodCIsInJlcXVlc3RlZFdpZHRoIiwiZ2V0T3ZlcmZsb3dFbGVtZW50Iiwid2FybiIsIm9uY2xpY2siLCJtdXRhdG9yIiwibXV0YXRvckZvckRvYyIsImZvcmNlQ2hhbmdlU2l6ZSIsIm11dGF0ZUVsZW1lbnQiLCJvdmVyZmxvd0NhbGxiYWNrIiwib3B0X2VsZW1lbnQiLCJvcHRfc2tpcFJlbWVhc3VyZSIsImNyZWF0ZUFtcEVsZW1lbnRGb3JUZXN0aW5nIiwib3B0X2ltcGxlbWVudGF0aW9uQ2xhc3MiLCJvcHRfZWxlbWVudENvbm5lY3RlZENhbGxiYWNrIiwiRWxlbWVudCIsImltcGxlbWVudGF0aW9uQ2xhc3NGb3JUZXN0aW5nIiwicmVzZXRTdHVic0ZvclRlc3RpbmciLCJnZXRJbXBsQ2xhc3NTeW5jRm9yVGVzdGluZyIsImdldEltcGxTeW5jRm9yVGVzdGluZyIsImdldEFjdGlvblF1ZXVlRm9yVGVzdGluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUNFQSxnQ0FERixFQUVFQyxpQ0FGRjtBQUlBLFNBQVFDLFlBQVI7QUFDQSxTQUFRQywwQkFBUjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyxhQUFSO0FBQ0EsU0FBUUMsVUFBUjtBQUNBLFNBQVFDLFVBQVI7QUFD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LENBQUN3TyxNQUFoQixHQUF5QixDQUF6QjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVMwSCwwQkFBVCxDQUFvQy9ELE9BQXBDLEVBQTZDO0FBQ2xELFNBQU9BLE9BQU8sQ0FBQ3JQLFVBQWY7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTcVQscUJBQVQsQ0FBK0JoRSxPQUEvQixFQUF3QztBQUM3QyxTQUFPQSxPQUFPLENBQUNuUCxLQUFmO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU29ULHdCQUFULENBQWtDakUsT0FBbEMsRUFBMkM7QUFDaEQsU0FBT0EsT0FBTyxDQUFDaFAsWUFBZjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIFVQR1JBREVfVE9fQ1VTVE9NRUxFTUVOVF9QUk9NSVNFLFxuICBVUEdSQURFX1RPX0NVU1RPTUVMRU1FTlRfUkVTT0xWRVIsXG59IGZyb20gJy4vYW1wLWVsZW1lbnQtaGVscGVycyc7XG5pbXBvcnQge3N0YXJ0dXBDaHVua30gZnJvbSAnLi9jaHVuayc7XG5pbXBvcnQge3Nob3VsZEJsb2NrT25Db25zZW50QnlNZXRhfSBmcm9tICcuL2NvbnNlbnQnO1xuaW1wb3J0IHtBbXBFdmVudHN9IGZyb20gJy4vY29yZS9jb25zdGFudHMvYW1wLWV2ZW50cyc7XG5pbXBvcnQge0NvbW1vblNpZ25hbHN9IGZyb20gJy4vY29yZS9jb25zdGFudHMvY29tbW9uLXNpZ25hbHMnO1xuaW1wb3J0IHtSZWFkeVN0YXRlfSBmcm9tICcuL2NvcmUvY29uc3RhbnRzL3JlYWR5LXN0YXRlJztcbmltcG9ydCB7dHJ5UmVzb2x2ZX0gZnJvbSAnLi9jb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7U2lnbmFsc30gZnJvbSAnLi9jb3JlL2RhdGEtc3RydWN0dXJlcy9zaWduYWxzJztcbmltcG9ydCAqIGFzIGRvbSBmcm9tICcuL2NvcmUvZG9tJztcbmltcG9ydCB7TGF5b3V0LCBMYXlvdXRQcmlvcml0eSwgaXNMb2FkaW5nQWxsb3dlZH0gZnJvbSAnLi9jb3JlL2RvbS9sYXlvdXQnO1xuaW1wb3J0IHtNZWRpYVF1ZXJ5UHJvcHN9IGZyb20gJy4vY29yZS9kb20vbWVkaWEtcXVlcnktcHJvcHMnO1xuaW1wb3J0ICogYXMgcXVlcnkgZnJvbSAnLi9jb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge3NldFN0eWxlfSBmcm9tICcuL2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7cmV0aHJvd0FzeW5jfSBmcm9tICcuL2NvcmUvZXJyb3InO1xuaW1wb3J0IHt0b1dpbn0gZnJvbSAnLi9jb3JlL3dpbmRvdyc7XG5pbXBvcnQge0VsZW1lbnRTdHVifSBmcm9tICcuL2VsZW1lbnQtc3R1Yic7XG5pbXBvcnQge1xuICBibG9ja2VkQnlDb25zZW50RXJyb3IsXG4gIGNhbmNlbGxhdGlvbixcbiAgaXNCbG9ja2VkQnlDb25zZW50LFxuICBpc0NhbmNlbGxhdGlvbixcbiAgcmVwb3J0RXJyb3IsXG59IGZyb20gJy4vZXJyb3ItcmVwb3J0aW5nJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnQsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4vbG9nJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi9tb2RlJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJy4vc2VydmljZSc7XG5pbXBvcnQge1Jlc291cmNlU3RhdGV9IGZyb20gJy4vc2VydmljZS9yZXNvdXJjZSc7XG5pbXBvcnQge2dldFNjaGVkdWxlckZvckRvY30gZnJvbSAnLi9zZXJ2aWNlL3NjaGVkdWxlcic7XG5pbXBvcnQge2FwcGx5U3RhdGljTGF5b3V0fSBmcm9tICcuL3N0YXRpYy1sYXlvdXQnO1xuaW1wb3J0IHtnZXRJbnRlcnNlY3Rpb25DaGFuZ2VFbnRyeX0gZnJvbSAnLi91dGlscy9pbnRlcnNlY3Rpb24tb2JzZXJ2ZXItM3AtaG9zdCc7XG5cbmNvbnN0IFRBRyA9ICdDdXN0b21FbGVtZW50JztcblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5jb25zdCBVcGdyYWRlU3RhdGUgPSB7XG4gIE5PVF9VUEdSQURFRDogMSxcbiAgVVBHUkFERUQ6IDIsXG4gIFVQR1JBREVfRkFJTEVEOiAzLFxuICBVUEdSQURFX0lOX1BST0dSRVNTOiA0LFxufTtcblxuY29uc3QgTk9fQlVCQkxFUyA9IHtidWJibGVzOiBmYWxzZX07XG5jb25zdCBSRVRVUk5fVFJVRSA9ICgpID0+IHRydWU7XG5cbi8qKlxuICogQ2FjaGVzIHdoZXRoZXIgdGhlIHRlbXBsYXRlIHRhZyBpcyBzdXBwb3J0ZWQgdG8gYXZvaWQgbWVtb3J5IGFsbG9jYXRpb25zLlxuICogQHR5cGUge2Jvb2xlYW58dW5kZWZpbmVkfVxuICovXG5sZXQgdGVtcGxhdGVUYWdTdXBwb3J0ZWQ7XG5cbi8qKiBAdHlwZSB7IUFycmF5fSAqL1xuZXhwb3J0IGNvbnN0IHN0dWJiZWRFbGVtZW50cyA9IFtdO1xuXG4vKipcbiAqIFdoZXRoZXIgdGhpcyBwbGF0Zm9ybSBzdXBwb3J0cyB0ZW1wbGF0ZSB0YWdzLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNUZW1wbGF0ZVRhZ1N1cHBvcnRlZCgpIHtcbiAgaWYgKHRlbXBsYXRlVGFnU3VwcG9ydGVkID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHNlbGYuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICB0ZW1wbGF0ZVRhZ1N1cHBvcnRlZCA9ICdjb250ZW50JyBpbiB0ZW1wbGF0ZTtcbiAgfVxuICByZXR1cm4gdGVtcGxhdGVUYWdTdXBwb3J0ZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5hbWVkIGN1c3RvbSBlbGVtZW50IGNsYXNzLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luIFRoZSB3aW5kb3cgaW4gd2hpY2ggdG8gcmVnaXN0ZXIgdGhlIGN1c3RvbSBlbGVtZW50LlxuICogQHBhcmFtIHtmdW5jdGlvbighLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvYywgIUFtcEVsZW1lbnQsID8odHlwZW9mIEJhc2VFbGVtZW50KSl9IGVsZW1lbnRDb25uZWN0ZWRDYWxsYmFja1xuICogQHJldHVybiB7dHlwZW9mIEFtcEVsZW1lbnR9IFRoZSBjdXN0b20gZWxlbWVudCBjbGFzcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUN1c3RvbUVsZW1lbnRDbGFzcyh3aW4sIGVsZW1lbnRDb25uZWN0ZWRDYWxsYmFjaykge1xuICBjb25zdCBCYXNlQ3VzdG9tRWxlbWVudCA9IC8qKiBAdHlwZSB7dHlwZW9mIEhUTUxFbGVtZW50fSAqLyAoXG4gICAgY3JlYXRlQmFzZUN1c3RvbUVsZW1lbnRDbGFzcyh3aW4sIGVsZW1lbnRDb25uZWN0ZWRDYWxsYmFjaylcbiAgKTtcbiAgLy8gSXQncyBuZWNlc3NhcnkgdG8gY3JlYXRlIGEgc3ViY2xhc3MsIGJlY2F1c2UgdGhlIHNhbWUgXCJiYXNlXCIgY2xhc3MgY2Fubm90XG4gIC8vIGJlIHJlZ2lzdGVyZWQgdG8gbXVsdGlwbGUgY3VzdG9tIGVsZW1lbnRzLlxuICBjbGFzcyBDdXN0b21BbXBFbGVtZW50IGV4dGVuZHMgQmFzZUN1c3RvbUVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIGFkb3B0ZWRDYWxsYmFjayBpcyBvbmx5IGNhbGxlZCB3aGVuIHVzaW5nIGEgTmF0aXZlIGltcGxlbWVudGF0aW9uIG9mIEN1c3RvbSBFbGVtZW50cyBWMS5cbiAgICAgKiBPdXIgcG9seWZpbGwgZG9lcyBub3QgY2FsbCB0aGlzIG1ldGhvZC5cbiAgICAgKi9cbiAgICBhZG9wdGVkQ2FsbGJhY2soKSB7XG4gICAgICAvLyBXb3JrIGFyb3VuZCBhbiBpc3N1ZSB3aXRoIEZpcmVmb3ggY2hhbmdpbmcgdGhlIHByb3RvdHlwZSBvZiBvdXJcbiAgICAgIC8vIGFscmVhZHkgY29uc3RydWN0ZWQgZWxlbWVudCB0byB0aGUgbmV3IGRvY3VtZW50J3MgSFRNTEVsZW1lbnQuXG4gICAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpICE9PSBjdXN0b21BbXBFbGVtZW50UHJvdG8pIHtcbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIGN1c3RvbUFtcEVsZW1lbnRQcm90byk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IGN1c3RvbUFtcEVsZW1lbnRQcm90byA9IEN1c3RvbUFtcEVsZW1lbnQucHJvdG90eXBlO1xuICByZXR1cm4gLyoqIEB0eXBlIHt0eXBlb2YgQW1wRWxlbWVudH0gKi8gKEN1c3RvbUFtcEVsZW1lbnQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBiYXNlIGN1c3RvbSBlbGVtZW50IGNsYXNzLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luIFRoZSB3aW5kb3cgaW4gd2hpY2ggdG8gcmVnaXN0ZXIgdGhlIGN1c3RvbSBlbGVtZW50LlxuICogQHBhcmFtIHtmdW5jdGlvbighLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvYywgIUFtcEVsZW1lbnQsID8odHlwZW9mIEJhc2VFbGVtZW50KSl9IGVsZW1lbnRDb25uZWN0ZWRDYWxsYmFja1xuICogQHJldHVybiB7dHlwZW9mIEhUTUxFbGVtZW50fVxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlQ3VzdG9tRWxlbWVudENsYXNzKHdpbiwgZWxlbWVudENvbm5lY3RlZENhbGxiYWNrKSB7XG4gIGlmICh3aW4uX19BTVBfQkFTRV9DRV9DTEFTUykge1xuICAgIHJldHVybiB3aW4uX19BTVBfQkFTRV9DRV9DTEFTUztcbiAgfVxuICBjb25zdCBodG1sRWxlbWVudCA9IC8qKiBAdHlwZSB7dHlwZW9mIEhUTUxFbGVtZW50fSAqLyAod2luLkhUTUxFbGVtZW50KTtcblxuICAvKipcbiAgICogQGFic3RyYWN0IEBleHRlbmRzIHtIVE1MRWxlbWVudH1cbiAgICovXG4gIGNsYXNzIEJhc2VDdXN0b21FbGVtZW50IGV4dGVuZHMgaHRtbEVsZW1lbnQge1xuICAgIC8qKiAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuY3JlYXRlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gZWxlbWVudHMgaXMgY3JlYXRlZC4gU2V0cyBpbnN0YW5jZSB2YXJzIHNpbmNlIHRoZXJlIGlzIG5vXG4gICAgICogY29uc3RydWN0b3IuXG4gICAgICogQGZpbmFsXG4gICAgICovXG4gICAgY3JlYXRlZENhbGxiYWNrKCkge1xuICAgICAgLy8gRmxhZyBcIm5vdGJ1aWx0XCIgaXMgcmVtb3ZlZCBieSBSZXNvdXJjZSBtYW5hZ2VyIHdoZW4gdGhlIHJlc291cmNlIGlzXG4gICAgICAvLyBjb25zaWRlcmVkIHRvIGJlIGJ1aWx0LiBTZWUgXCJzZXRCdWlsdFwiIG1ldGhvZC5cbiAgICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICAgIHRoaXMuYnVpbHRfID0gZmFsc2U7XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V2ZXJhbCBBUElzIHJlcXVpcmUgdGhlIGVsZW1lbnQgdG8gYmUgY29ubmVjdGVkIHRvIHRoZSBET00gdHJlZSwgYnV0XG4gICAgICAgKiB0aGUgQ3VzdG9tRWxlbWVudCBsaWZlY3ljbGUgQVBJcyBhcmUgYXN5bmMuIFRoaXMgbGVhZCB0byBzdWJ0bGUgYnVnc1xuICAgICAgICogdGhhdCByZXF1aXJlIHN0YXRlIHRyYWNraW5nLiBTZWUgIzEyODQ5LCBodHRwczovL2NyYnVnLmNvbS84MjExOTUsIGFuZFxuICAgICAgICogaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE4MDk0MC5cbiAgICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAgICovXG4gICAgICB0aGlzLmlzQ29ubmVjdGVkXyA9IGZhbHNlO1xuXG4gICAgICAvKiogQHByaXZhdGUgez9Qcm9taXNlfSAqL1xuICAgICAgdGhpcy5idWlsZGluZ1Byb21pc2VfID0gbnVsbDtcblxuICAgICAgLyoqXG4gICAgICAgKiBJbmRpY2F0ZXMgdGhhdCB0aGUgYG1vdW50Q2FsbGJhY2soKWAgaGFzIGJlZW4gY2FsbGVkIGFuZCBpdCBoYXNuJ3RcbiAgICAgICAqIGJlZW4gcmV2ZXJzZWQgd2l0aCBhbiBgdW5tb3VudENhbGxiYWNrKClgIGNhbGwuXG4gICAgICAgKiBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICAgICAqL1xuICAgICAgdGhpcy5tb3VudGVkXyA9IGZhbHNlO1xuXG4gICAgICAvKiogQHByaXZhdGUgez9Qcm9taXNlfSAqL1xuICAgICAgdGhpcy5tb3VudFByb21pc2VfID0gbnVsbDtcblxuICAgICAgLyoqIEBwcml2YXRlIHs/QWJvcnRDb250cm9sbGVyfSAqL1xuICAgICAgdGhpcy5tb3VudEFib3J0Q29udHJvbGxlcl8gPSBudWxsO1xuXG4gICAgICAvKiogQHByaXZhdGUgeyFSZWFkeVN0YXRlfSAqL1xuICAgICAgdGhpcy5yZWFkeVN0YXRlXyA9IFJlYWR5U3RhdGUuVVBHUkFESU5HO1xuXG4gICAgICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gICAgICB0aGlzLmV2ZXJBdHRhY2hlZCA9IGZhbHNlO1xuXG4gICAgICAvKipcbiAgICAgICAqIEFtcGRvYyBjYW4gb25seSBiZSBsb29rZWQgdXAgd2hlbiBhbiBlbGVtZW50IGlzIGF0dGFjaGVkLlxuICAgICAgICogQHByaXZhdGUgez8uL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfVxuICAgICAgICovXG4gICAgICB0aGlzLmFtcGRvY18gPSBudWxsO1xuXG4gICAgICAvKipcbiAgICAgICAqIFJlc291cmNlcyBjYW4gb25seSBiZSBsb29rZWQgdXAgd2hlbiBhbiBlbGVtZW50IGlzIGF0dGFjaGVkLlxuICAgICAgICogQHByaXZhdGUgez8uL3NlcnZpY2UvcmVzb3VyY2VzLWludGVyZmFjZS5SZXNvdXJjZXNJbnRlcmZhY2V9XG4gICAgICAgKi9cbiAgICAgIHRoaXMucmVzb3VyY2VzXyA9IG51bGw7XG5cbiAgICAgIC8qKiBAcHJpdmF0ZSB7IUxheW91dH0gKi9cbiAgICAgIHRoaXMubGF5b3V0XyA9IExheW91dC5OT0RJU1BMQVk7XG5cbiAgICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgICAgdGhpcy5sYXlvdXRDb3VudF8gPSAwO1xuXG4gICAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgICB0aGlzLmlzRmlyc3RMYXlvdXRDb21wbGV0ZWRfID0gZmFsc2U7XG5cbiAgICAgIC8qKiBAcHVibGljIHtib29sZWFufSAqL1xuICAgICAgdGhpcy53YXJuT25NaXNzaW5nT3ZlcmZsb3cgPSB0cnVlO1xuXG4gICAgICAvKipcbiAgICAgICAqIFRoaXMgZWxlbWVudCBjYW4gYmUgYXNzaWduZWQgYnkgdGhlIHtAbGluayBhcHBseVN0YXRpY0xheW91dH0gdG8gYVxuICAgICAgICogY2hpbGQgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXNlZCB0byBzaXplIHRoaXMgZWxlbWVudC5cbiAgICAgICAqIEBwYWNrYWdlIHs/RWxlbWVudHx1bmRlZmluZWR9XG4gICAgICAgKi9cbiAgICAgIHRoaXMuc2l6ZXJFbGVtZW50ID0gdW5kZWZpbmVkO1xuXG4gICAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fHVuZGVmaW5lZH0gKi9cbiAgICAgIHRoaXMub3ZlcmZsb3dFbGVtZW50XyA9IHVuZGVmaW5lZDtcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgdGltZSBhdCB3aGljaCB0aGlzIGVsZW1lbnQgd2FzIHNjaGVkdWxlZCBmb3IgbGF5b3V0IHJlbGF0aXZlIHRvXG4gICAgICAgKiB0aGUgZXBvY2guIFRoaXMgdmFsdWUgd2lsbCBiZSBzZXQgdG8gMCB1bnRpbCB0aGUgdGhpcyBlbGVtZW50IGhhcyBiZWVuXG4gICAgICAgKiBzY2hlZHVsZWQuXG4gICAgICAgKiBOb3RlIHRoYXQgdGhpcyB2YWx1ZSBtYXkgY2hhbmdlIG92ZXIgdGltZSBpZiB0aGUgZWxlbWVudCBpcyBlbnF1ZXVlZCxcbiAgICAgICAqIHRoZW4gZGVxdWV1ZWQgYW5kIHJlLWVucXVldWVkIGJ5IHRoZSBzY2hlZHVsZXIuXG4gICAgICAgKiBAdHlwZSB7bnVtYmVyfHVuZGVmaW5lZH1cbiAgICAgICAqL1xuICAgICAgdGhpcy5sYXlvdXRTY2hlZHVsZVRpbWUgPSB1bmRlZmluZWQ7XG5cbiAgICAgIC8vIENsb3N1cmUgY29tcGlsZXIgYXBwZWFycyB0byBtYXJrIEhUTUxFbGVtZW50IGFzIEBzdHJ1Y3Qgd2hpY2hcbiAgICAgIC8vIGRpc2FibGVzIGJyYWNrZXQgYWNjZXNzLiBGb3JjZSB0aGlzIHdpdGggYSB0eXBlIGNvZXJjaW9uLlxuICAgICAgY29uc3Qgbm9uU3RydWN0VGhpcyA9IC8qKiBAdHlwZSB7IU9iamVjdH0gKi8gKHRoaXMpO1xuXG4gICAgICAvLyBgb3B0X2ltcGxlbWVudGF0aW9uQ2xhc3NgIGlzIG9ubHkgdXNlZCBmb3IgdGVzdHMuXG4gICAgICAvKiogQHR5cGUgez8odHlwZW9mIC4uL2Jhc2UtZWxlbWVudC5CYXNlRWxlbWVudCl9ICovXG4gICAgICBsZXQgQ3RvciA9XG4gICAgICAgIHdpbi5fX0FNUF9FWFRFTkRFRF9FTEVNRU5UUyAmJlxuICAgICAgICB3aW4uX19BTVBfRVhURU5ERURfRUxFTUVOVFNbdGhpcy5sb2NhbE5hbWVdO1xuICAgICAgaWYgKGdldE1vZGUoKS50ZXN0ICYmIG5vblN0cnVjdFRoaXNbJ2ltcGxlbWVudGF0aW9uQ2xhc3NGb3JUZXN0aW5nJ10pIHtcbiAgICAgICAgQ3RvciA9IG5vblN0cnVjdFRoaXNbJ2ltcGxlbWVudGF0aW9uQ2xhc3NGb3JUZXN0aW5nJ107XG4gICAgICB9XG5cbiAgICAgIC8qKiBAcHJpdmF0ZSB7Pyh0eXBlb2YgLi4vYmFzZS1lbGVtZW50LkJhc2VFbGVtZW50KX0gKi9cbiAgICAgIHRoaXMuaW1wbENsYXNzXyA9IEN0b3IgPT09IEVsZW1lbnRTdHViID8gbnVsbCA6IEN0b3IgfHwgbnVsbDtcblxuICAgICAgaWYgKCF0aGlzLmltcGxDbGFzc18pIHtcbiAgICAgICAgc3R1YmJlZEVsZW1lbnRzLnB1c2godGhpcyk7XG4gICAgICB9XG5cbiAgICAgIC8qKiBAcHJpdmF0ZSB7Py4vYmFzZS1lbGVtZW50LkJhc2VFbGVtZW50fSAqL1xuICAgICAgdGhpcy5pbXBsXyA9IG51bGw7XG5cbiAgICAgIC8qKlxuICAgICAgICogQW4gZWxlbWVudCBhbHdheXMgc3RhcnRzIGluIGEgdW51cGdyYWRlZCBzdGF0ZSB1bnRpbCBpdCdzIGFkZGVkIHRvIERPTVxuICAgICAgICogZm9yIHRoZSBmaXJzdCB0aW1lIGluIHdoaWNoIGNhc2UgaXQgY2FuIGJlIHVwZ3JhZGVkIGltbWVkaWF0ZWx5IG9yIHdhaXRcbiAgICAgICAqIGZvciBzY3JpcHQgZG93bmxvYWQgb3IgYHVwZ3JhZGVDYWxsYmFja2AuXG4gICAgICAgKiBAcHJpdmF0ZSB7IVVwZ3JhZGVTdGF0ZX1cbiAgICAgICAqL1xuICAgICAgdGhpcy51cGdyYWRlU3RhdGVfID0gVXBncmFkZVN0YXRlLk5PVF9VUEdSQURFRDtcblxuICAgICAgLyoqXG4gICAgICAgKiBUaW1lIGRlbGF5IGltcG9zZWQgYnkgYmFzZUVsZW1lbnQgdXBncmFkZUNhbGxiYWNrLiAgSWYgbm9cbiAgICAgICAqIHVwZ3JhZGVDYWxsYmFjayBzcGVjaWZpZWQgb3Igbm90IHlldCBleGVjdXRlZCwgZGVsYXkgaXMgMC5cbiAgICAgICAqIEBwcml2YXRlIHtudW1iZXJ9XG4gICAgICAgKi9cbiAgICAgIHRoaXMudXBncmFkZURlbGF5TXNfID0gMDtcblxuICAgICAgLyoqXG4gICAgICAgKiBBY3Rpb24gcXVldWUgaXMgaW5pdGlhbGx5IGNyZWF0ZWQgYW5kIGtlcHQgYXJvdW5kIHVudGlsIHRoZSBlbGVtZW50XG4gICAgICAgKiBpcyByZWFkeSB0byBzZW5kIGFjdGlvbnMgZGlyZWN0bHkgdG8gdGhlIGltcGxlbWVudGF0aW9uLlxuICAgICAgICogLSB1bmRlZmluZWQgaW5pdGlhbGx5XG4gICAgICAgKiAtIGFycmF5IGlmIHVzZWRcbiAgICAgICAqIC0gbnVsbCBhZnRlciB1bnNwdW5cbiAgICAgICAqIEBwcml2YXRlIHs/QXJyYXk8IS4vc2VydmljZS9hY3Rpb24taW1wbC5BY3Rpb25JbnZvY2F0aW9uPnx1bmRlZmluZWR9XG4gICAgICAgKi9cbiAgICAgIHRoaXMuYWN0aW9uUXVldWVfID0gdW5kZWZpbmVkO1xuXG4gICAgICAvKipcbiAgICAgICAqIFdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgaW4gdGhlIHRlbXBsYXRlLlxuICAgICAgICogQHByaXZhdGUge2Jvb2xlYW58dW5kZWZpbmVkfVxuICAgICAgICovXG4gICAgICB0aGlzLmlzSW5UZW1wbGF0ZV8gPSB1bmRlZmluZWQ7XG5cbiAgICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICAgIHRoaXMuc2lnbmFsc18gPSBuZXcgU2lnbmFscygpO1xuXG4gICAgICBpZiAodGhpcy5pbXBsQ2xhc3NfKSB7XG4gICAgICAgIHRoaXMuc2lnbmFsc18uc2lnbmFsKENvbW1vblNpZ25hbHMuUkVBRFlfVE9fVVBHUkFERSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBlcmYgPSBTZXJ2aWNlcy5wZXJmb3JtYW5jZUZvck9yTnVsbCh3aW4pO1xuICAgICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgICAgdGhpcy5wZXJmT25fID0gcGVyZiAmJiBwZXJmLmlzUGVyZm9ybWFuY2VUcmFja2luZ09uKCk7XG5cbiAgICAgIC8qKiBAcHJpdmF0ZSB7P01lZGlhUXVlcnlQcm9wc30gKi9cbiAgICAgIHRoaXMubWVkaWFRdWVyeVByb3BzXyA9IG51bGw7XG5cbiAgICAgIGlmIChub25TdHJ1Y3RUaGlzW1VQR1JBREVfVE9fQ1VTVE9NRUxFTUVOVF9SRVNPTFZFUl0pIHtcbiAgICAgICAgbm9uU3RydWN0VGhpc1tVUEdSQURFX1RPX0NVU1RPTUVMRU1FTlRfUkVTT0xWRVJdKG5vblN0cnVjdFRoaXMpO1xuICAgICAgICBkZWxldGUgbm9uU3RydWN0VGhpc1tVUEdSQURFX1RPX0NVU1RPTUVMRU1FTlRfUkVTT0xWRVJdO1xuICAgICAgICBkZWxldGUgbm9uU3RydWN0VGhpc1tVUEdSQURFX1RPX0NVU1RPTUVMRU1FTlRfUFJPTUlTRV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEByZXR1cm4geyFSZWFkeVN0YXRlfSAqL1xuICAgIGdldCByZWFkeVN0YXRlKCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVhZHlTdGF0ZV87XG4gICAgfVxuXG4gICAgLyoqIEByZXR1cm4geyFTaWduYWxzfSAqL1xuICAgIHNpZ25hbHMoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWduYWxzXztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBhc3NvY2lhdGVkIGFtcGRvYy4gT25seSBhdmFpbGFibGUgYWZ0ZXIgYXR0YWNobWVudC4gSXQgdGhyb3dzXG4gICAgICogZXhjZXB0aW9uIGJlZm9yZSB0aGUgZWxlbWVudCBpcyBhdHRhY2hlZC5cbiAgICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY31cbiAgICAgKiBAZmluYWxcbiAgICAgKiBAcGFja2FnZVxuICAgICAqL1xuICAgIGdldEFtcERvYygpIHtcbiAgICAgIGRldkFzc2VydCh0aGlzLmFtcGRvY18sICdubyBhbXBkb2MgeWV0LCBzaW5jZSBlbGVtZW50IGlzIG5vdCBhdHRhY2hlZCcpO1xuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9ICovICh0aGlzLmFtcGRvY18pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgUmVzb3VyY2VzIG1hbmFnZXIuIE9ubHkgYXZhaWxhYmxlIGFmdGVyIGF0dGFjaG1lbnQuIEl0IHRocm93c1xuICAgICAqIGV4Y2VwdGlvbiBiZWZvcmUgdGhlIGVsZW1lbnQgaXMgYXR0YWNoZWQuXG4gICAgICogQHJldHVybiB7IS4vc2VydmljZS9yZXNvdXJjZXMtaW50ZXJmYWNlLlJlc291cmNlc0ludGVyZmFjZX1cbiAgICAgKiBAZmluYWxcbiAgICAgKiBAcGFja2FnZVxuICAgICAqL1xuICAgIGdldFJlc291cmNlcygpIHtcbiAgICAgIGRldkFzc2VydChcbiAgICAgICAgdGhpcy5yZXNvdXJjZXNfLFxuICAgICAgICAnbm8gcmVzb3VyY2VzIHlldCwgc2luY2UgZWxlbWVudCBpcyBub3QgYXR0YWNoZWQnXG4gICAgICApO1xuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS9yZXNvdXJjZXMtaW50ZXJmYWNlLlJlc291cmNlc0ludGVyZmFjZX0gKi8gKFxuICAgICAgICB0aGlzLnJlc291cmNlc19cbiAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgZWxlbWVudCBoYXMgYmVlbiB1cGdyYWRlZCB5ZXQuIEFsd2F5cyByZXR1cm5zIGZhbHNlIHdoZW5cbiAgICAgKiB0aGUgZWxlbWVudCBoYXMgbm90IHlldCBiZWVuIGFkZGVkIHRvIERPTS4gQWZ0ZXIgdGhlIGVsZW1lbnQgaGFzIGJlZW5cbiAgICAgKiBhZGRlZCB0byBET00sIHRoZSB2YWx1ZSBkZXBlbmRzIG9uIHRoZSBgQmFzZUVsZW1lbnRgIGltcGxlbWVudGF0aW9uIGFuZFxuICAgICAqIGl0cyBgdXBncmFkZUVsZW1lbnRgIGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICogQGZpbmFsXG4gICAgICovXG4gICAgaXNVcGdyYWRlZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnVwZ3JhZGVTdGF0ZV8gPT0gVXBncmFkZVN0YXRlLlVQR1JBREVEO1xuICAgIH1cblxuICAgIC8qKiBAcmV0dXJuIHshUHJvbWlzZX0gKi9cbiAgICB3aGVuVXBncmFkZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWduYWxzXy53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuVVBHUkFERUQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZ3JhZGVzIHRoZSBlbGVtZW50IHRvIHRoZSBwcm92aWRlZCBuZXcgaW1wbGVtZW50YXRpb24uIElmIGVsZW1lbnRcbiAgICAgKiBoYXMgYWxyZWFkeSBiZWVuIGF0dGFjaGVkLCBpdCdzIGxheW91dCB2YWxpZGF0aW9uIGFuZCBhdHRhY2htZW50IGZsb3dzXG4gICAgICogYXJlIHJlcGVhdGVkIGZvciB0aGUgbmV3IGltcGxlbWVudGF0aW9uLlxuICAgICAqIEBwYXJhbSB7dHlwZW9mIC4vYmFzZS1lbGVtZW50LkJhc2VFbGVtZW50fSBuZXdJbXBsQ2xhc3NcbiAgICAgKiBAZmluYWwgQHBhY2thZ2VcbiAgICAgKi9cbiAgICB1cGdyYWRlKG5ld0ltcGxDbGFzcykge1xuICAgICAgaWYgKHRoaXMuaXNJblRlbXBsYXRlXykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodGhpcy51cGdyYWRlU3RhdGVfICE9IFVwZ3JhZGVTdGF0ZS5OT1RfVVBHUkFERUQpIHtcbiAgICAgICAgLy8gQWxyZWFkeSB1cGdyYWRlZCBvciBpbiBwcm9ncmVzcyBvciBmYWlsZWQuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbXBsQ2xhc3NfID0gbmV3SW1wbENsYXNzO1xuICAgICAgdGhpcy5zaWduYWxzXy5zaWduYWwoQ29tbW9uU2lnbmFscy5SRUFEWV9UT19VUEdSQURFKTtcbiAgICAgIGlmICh0aGlzLmV2ZXJBdHRhY2hlZCkge1xuICAgICAgICAvLyBVc3VhbGx5LCB3ZSBkbyBhbiBpbXBsZW1lbnRhdGlvbiB1cGdyYWRlIHdoZW4gdGhlIGVsZW1lbnQgaXNcbiAgICAgICAgLy8gYXR0YWNoZWQgdG8gdGhlIERPTS4gQnV0LCBpZiBpdCBoYWRuJ3QgeWV0IHVwZ3JhZGVkIGZyb21cbiAgICAgICAgLy8gRWxlbWVudFN0dWIsIHdlIGNvdWxkbid0LiBOb3cgdGhhdCBpdCdzIHVwZ3JhZGVkIGZyb20gYSBzdHViLCBnb1xuICAgICAgICAvLyBhaGVhZCBhbmQgZG8gdGhlIGZ1bGwgdXBncmFkZS5cbiAgICAgICAgdGhpcy51cGdyYWRlT3JTY2hlZHVsZV8oKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaW1lIGRlbGF5IGltcG9zZWQgYnkgYmFzZUVsZW1lbnQgdXBncmFkZUNhbGxiYWNrLiAgSWYgbm9cbiAgICAgKiB1cGdyYWRlQ2FsbGJhY2sgc3BlY2lmaWVkIG9yIG5vdCB5ZXQgZXhlY3V0ZWQsIGRlbGF5IGlzIDAuXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxuICAgICAqL1xuICAgIGdldFVwZ3JhZGVEZWxheU1zKCkge1xuICAgICAgcmV0dXJuIHRoaXMudXBncmFkZURlbGF5TXNfO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBsZXRlcyB0aGUgdXBncmFkZSBvZiB0aGUgZWxlbWVudCB3aXRoIHRoZSBwcm92aWRlZCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgKiBAcGFyYW0geyEuL2Jhc2UtZWxlbWVudC5CYXNlRWxlbWVudH0gbmV3SW1wbFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB1cGdyYWRlU3RhcnRUaW1lXG4gICAgICogQGZpbmFsIEBwcml2YXRlXG4gICAgICovXG4gICAgY29tcGxldGVVcGdyYWRlXyhuZXdJbXBsLCB1cGdyYWRlU3RhcnRUaW1lKSB7XG4gICAgICB0aGlzLmltcGxfID0gbmV3SW1wbDtcbiAgICAgIHRoaXMudXBncmFkZURlbGF5TXNfID0gd2luLkRhdGUubm93KCkgLSB1cGdyYWRlU3RhcnRUaW1lO1xuICAgICAgdGhpcy51cGdyYWRlU3RhdGVfID0gVXBncmFkZVN0YXRlLlVQR1JBREVEO1xuICAgICAgdGhpcy5zZXRSZWFkeVN0YXRlSW50ZXJuYWwoUmVhZHlTdGF0ZS5CVUlMRElORyk7XG4gICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ2FtcC11bnJlc29sdmVkJyk7XG4gICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ2ktYW1waHRtbC11bnJlc29sdmVkJyk7XG4gICAgICB0aGlzLmFzc2VydExheW91dF8oKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2hDdXN0b21FdmVudEZvclRlc3RpbmcoQW1wRXZlbnRzLkFUVEFDSEVEKTtcbiAgICAgIGlmICghdGhpcy5SMSgpKSB7XG4gICAgICAgIHRoaXMuZ2V0UmVzb3VyY2VzKCkudXBncmFkZWQodGhpcyk7XG4gICAgICB9XG4gICAgICB0aGlzLnNpZ25hbHNfLnNpZ25hbChDb21tb25TaWduYWxzLlVQR1JBREVEKTtcbiAgICB9XG5cbiAgICAvKiogQHByaXZhdGUgKi9cbiAgICBhc3NlcnRMYXlvdXRfKCkge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmxheW91dF8gIT0gTGF5b3V0Lk5PRElTUExBWSAmJlxuICAgICAgICB0aGlzLmltcGxfICYmXG4gICAgICAgICF0aGlzLmltcGxfLmlzTGF5b3V0U3VwcG9ydGVkKHRoaXMubGF5b3V0XylcbiAgICAgICkge1xuICAgICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICAgIHRoaXMuZ2V0QXR0cmlidXRlKCdsYXlvdXQnKSxcbiAgICAgICAgICAnVGhlIGVsZW1lbnQgZGlkIG5vdCBzcGVjaWZ5IGEgbGF5b3V0IGF0dHJpYnV0ZS4gJyArXG4gICAgICAgICAgICAnQ2hlY2sgaHR0cHM6Ly9hbXAuZGV2L2RvY3VtZW50YXRpb24vZ3VpZGVzLWFuZC10dXRvcmlhbHMvJyArXG4gICAgICAgICAgICAnZGV2ZWxvcC9zdHlsZV9hbmRfbGF5b3V0L2NvbnRyb2xfbGF5b3V0IGFuZCB0aGUgcmVzcGVjdGl2ZSAnICtcbiAgICAgICAgICAgICdlbGVtZW50IGRvY3VtZW50YXRpb24gZm9yIGRldGFpbHMuJ1xuICAgICAgICApO1xuICAgICAgICB1c2VyQXNzZXJ0KGZhbHNlLCBgTGF5b3V0IG5vdCBzdXBwb3J0ZWQ6ICR7dGhpcy5sYXlvdXRffWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcHJpb3JpdHkgdG8gYnVpbGQgdGhlIGVsZW1lbnQuXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxuICAgICAqL1xuICAgIGdldEJ1aWxkUHJpb3JpdHkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbXBsQ2xhc3NfXG4gICAgICAgID8gdGhpcy5pbXBsQ2xhc3NfLmdldEJ1aWxkUHJpb3JpdHkodGhpcylcbiAgICAgICAgOiBMYXlvdXRQcmlvcml0eS5CQUNLR1JPVU5EO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcHJpb3JpdHkgdG8gbG9hZCB0aGUgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAgICogVE9ETygjMzE5MTUpOiByZW1vdmUgb25jZSBSMSBtaWdyYXRpb24gaXMgY29tcGxldGUuXG4gICAgICovXG4gICAgZ2V0TGF5b3V0UHJpb3JpdHkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbXBsX1xuICAgICAgICA/IHRoaXMuaW1wbF8uZ2V0TGF5b3V0UHJpb3JpdHkoKVxuICAgICAgICA6IExheW91dFByaW9yaXR5LkJBQ0tHUk9VTkQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkZWZhdWx0IGFjdGlvbiBhbGlhcy5cbiAgICAgKiBAcmV0dXJuIHs/c3RyaW5nfVxuICAgICAqL1xuICAgIGdldERlZmF1bHRBY3Rpb25BbGlhcygpIHtcbiAgICAgIGRldkFzc2VydChcbiAgICAgICAgdGhpcy5pc1VwZ3JhZGVkKCksXG4gICAgICAgICdDYW5ub3QgZ2V0IGRlZmF1bHQgYWN0aW9uIGFsaWFzIG9mIHVudXBncmFkZWQgZWxlbWVudCdcbiAgICAgICk7XG4gICAgICByZXR1cm4gdGhpcy5pbXBsXy5nZXREZWZhdWx0QWN0aW9uQWxpYXMoKTtcbiAgICB9XG5cbiAgICAvKiogQHJldHVybiB7Ym9vbGVhbn0gKi9cbiAgICBpc0J1aWxkaW5nKCkge1xuICAgICAgcmV0dXJuICEhdGhpcy5idWlsZGluZ1Byb21pc2VfO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGVsZW1lbnQgaGFzIGJlZW4gYnVpbHQuIEEgYnVpbHQgZWxlbWVudCBoYWQgaXRzXG4gICAgICoge0BsaW5rIGJ1aWxkQ2FsbGJhY2t9IG1ldGhvZCBzdWNjZXNzZnVsbHkgaW52b2tlZC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIGlzQnVpbHQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5idWlsdF87XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0J3MgcmVzb2x2ZWQgd2hlbiB0aGUgZWxlbWVudCBoYXMgYmVlbiBidWlsdC4gSWZcbiAgICAgKiB0aGUgYnVpbGQgZmFpbHMsIHRoZSByZXN1bHRpbmcgcHJvbWlzZSBpcyByZWplY3RlZC5cbiAgICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICAgKi9cbiAgICB3aGVuQnVpbHQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWduYWxzXy53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuQlVJTFQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3RzIG9yIHJlcXVpcmVzIHRoZSBlbGVtZW50IHRvIGJlIGJ1aWx0LiBUaGUgYnVpbGQgaXMgZG9uZSBieVxuICAgICAqIGludm9raW5nIHtAbGluayBCYXNlRWxlbWVudC5idWlsZENhbGxiYWNrfSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBDYW4gb25seSBiZSBjYWxsZWQgb24gYSB1cGdyYWRlZCBlbGVtZW50LiBNYXkgb25seSBiZSBjYWxsZWQgZnJvbVxuICAgICAqIHJlc291cmNlLmpzIHRvIGVuc3VyZSBhbiBlbGVtZW50IGFuZCBpdHMgcmVzb3VyY2UgYXJlIGluIHN5bmMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHs/UHJvbWlzZX1cbiAgICAgKiBAZmluYWxcbiAgICAgKiBAcmVzdHJpY3RlZFxuICAgICAqL1xuICAgIGJ1aWxkSW50ZXJuYWwoKSB7XG4gICAgICBhc3NlcnROb3RUZW1wbGF0ZSh0aGlzKTtcbiAgICAgIGRldkFzc2VydCh0aGlzLmltcGxDbGFzc18sICdDYW5ub3QgYnVpbGQgdW51cGdyYWRlZCBlbGVtZW50Jyk7XG4gICAgICBpZiAodGhpcy5idWlsZGluZ1Byb21pc2VfKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1aWxkaW5nUHJvbWlzZV87XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0UmVhZHlTdGF0ZUludGVybmFsKFJlYWR5U3RhdGUuQlVJTERJTkcpO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIGluc3RhbmNlLlxuICAgICAgY29uc3QgaW1wbFByb21pc2UgPSB0aGlzLmNyZWF0ZUltcGxfKCk7XG5cbiAgICAgIC8vIFdhaXQgZm9yIGNvbnNlbnQuXG4gICAgICBjb25zdCBjb25zZW50UHJvbWlzZSA9IGltcGxQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zdCBwb2xpY3lJZCA9IHRoaXMuZ2V0Q29uc2VudFBvbGljeV8oKTtcbiAgICAgICAgY29uc3QgcHVycG9zZUNvbnNlbnRzID0gIXBvbGljeUlkID8gdGhpcy5nZXRQdXJwb3Nlc0NvbnNlbnRfKCkgOiBudWxsO1xuICAgICAgICBpZiAoIXBvbGljeUlkICYmICFwdXJwb3NlQ29uc2VudHMpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gTXVzdCBoYXZlIHBvbGljeUlkIG9yIGdyYW51bGFyRXhwIHcvIHB1cnBvc2VDb25zZW50c1xuICAgICAgICByZXR1cm4gU2VydmljZXMuY29uc2VudFBvbGljeVNlcnZpY2VGb3JEb2NPck51bGwodGhpcylcbiAgICAgICAgICAudGhlbigocG9saWN5KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXBvbGljeSkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwb2xpY3lJZFxuICAgICAgICAgICAgICA/IHBvbGljeS53aGVuUG9saWN5VW5ibG9jayhwb2xpY3lJZClcbiAgICAgICAgICAgICAgOiBwb2xpY3kud2hlblB1cnBvc2VzVW5ibG9jayhwdXJwb3NlQ29uc2VudHMpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oKHNob3VsZFVuYmxvY2spID0+IHtcbiAgICAgICAgICAgIGlmICghc2hvdWxkVW5ibG9jaykge1xuICAgICAgICAgICAgICB0aHJvdyBibG9ja2VkQnlDb25zZW50RXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBCdWlsZCBjYWxsYmFjay5cbiAgICAgIGNvbnN0IGJ1aWxkUHJvbWlzZSA9IGNvbnNlbnRQcm9taXNlLnRoZW4oKCkgPT5cbiAgICAgICAgZGV2QXNzZXJ0KHRoaXMuaW1wbF8pLmJ1aWxkQ2FsbGJhY2soKVxuICAgICAgKTtcblxuICAgICAgLy8gQnVpbGQgdGhlIGVsZW1lbnQuXG4gICAgICByZXR1cm4gKHRoaXMuYnVpbGRpbmdQcm9taXNlXyA9IGJ1aWxkUHJvbWlzZS50aGVuKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5idWlsdF8gPSB0cnVlO1xuICAgICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWJ1aWx0Jyk7XG4gICAgICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdpLWFtcGh0bWwtbm90YnVpbHQnKTtcbiAgICAgICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ2FtcC1ub3RidWlsdCcpO1xuICAgICAgICAgIHRoaXMuc2lnbmFsc18uc2lnbmFsKENvbW1vblNpZ25hbHMuQlVJTFQpO1xuXG4gICAgICAgICAgaWYgKHRoaXMuUjEoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRSZWFkeVN0YXRlSW50ZXJuYWwoXG4gICAgICAgICAgICAgIHRoaXMucmVhZHlTdGF0ZV8gIT0gUmVhZHlTdGF0ZS5CVUlMRElOR1xuICAgICAgICAgICAgICAgID8gdGhpcy5yZWFkeVN0YXRlX1xuICAgICAgICAgICAgICAgIDogUmVhZHlTdGF0ZS5NT1VOVElOR1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRSZWFkeVN0YXRlSW50ZXJuYWwoUmVhZHlTdGF0ZS5MT0FESU5HKTtcbiAgICAgICAgICAgIHRoaXMucHJlY29ubmVjdCgvKiBvbkxheW91dCAqLyBmYWxzZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMuaXNDb25uZWN0ZWRfKSB7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3RlZF8oKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5hY3Rpb25RdWV1ZV8pIHtcbiAgICAgICAgICAgIC8vIE9ubHkgc2NoZWR1bGUgd2hlbiB0aGUgcXVldWUgaXMgbm90IGVtcHR5LCB3aGljaCBzaG91bGQgYmVcbiAgICAgICAgICAgIC8vIHRoZSBjYXNlIDk5JSBvZiB0aGUgdGltZS5cbiAgICAgICAgICAgIFNlcnZpY2VzLnRpbWVyRm9yKHRvV2luKHRoaXMub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldykpLmRlbGF5KFxuICAgICAgICAgICAgICB0aGlzLmRlcXVldWVBY3Rpb25zXy5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAxXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXRoaXMuZ2V0UGxhY2Vob2xkZXIoKSkge1xuICAgICAgICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSB0aGlzLmNyZWF0ZVBsYWNlaG9sZGVyKCk7XG4gICAgICAgICAgICBpZiAocGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChwbGFjZWhvbGRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAocmVhc29uKSA9PiB7XG4gICAgICAgICAgdGhpcy5zaWduYWxzXy5yZWplY3RTaWduYWwoXG4gICAgICAgICAgICBDb21tb25TaWduYWxzLkJVSUxULFxuICAgICAgICAgICAgLyoqIEB0eXBlIHshRXJyb3J9ICovIChyZWFzb24pXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmICh0aGlzLlIxKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UmVhZHlTdGF0ZUludGVybmFsKFJlYWR5U3RhdGUuRVJST1IsIHJlYXNvbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFpc0Jsb2NrZWRCeUNvbnNlbnQocmVhc29uKSkge1xuICAgICAgICAgICAgcmVwb3J0RXJyb3IocmVhc29uLCB0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9XG4gICAgICApKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICAgKi9cbiAgICBidWlsZCgpIHtcbiAgICAgIGlmICh0aGlzLmJ1aWxkaW5nUHJvbWlzZV8pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVpbGRpbmdQcm9taXNlXztcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVhZHlQcm9taXNlID0gdGhpcy5zaWduYWxzXy53aGVuU2lnbmFsKFxuICAgICAgICBDb21tb25TaWduYWxzLlJFQURZX1RPX1VQR1JBREVcbiAgICAgICk7XG4gICAgICByZXR1cm4gcmVhZHlQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5SMSgpKSB7XG4gICAgICAgICAgY29uc3Qgc2NoZWR1bGVyID0gZ2V0U2NoZWR1bGVyRm9yRG9jKHRoaXMuZ2V0QW1wRG9jKCkpO1xuICAgICAgICAgIHNjaGVkdWxlci5zY2hlZHVsZUFzYXAodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMud2hlbkJ1aWx0KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNb3VudHMgdGhlIGVsZW1lbnQgYnkgY2FsbGluZyB0aGUgYEJhc2VFbGVtZW50Lm1vdW50Q2FsbGJhY2tgIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIENhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIHVwZ3JhZGVkIGVsZW1lbnQuIE1heSBvbmx5IGJlIGNhbGxlZCBmcm9tXG4gICAgICogc2NoZWR1bGVyLmpzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAgICogQGZpbmFsXG4gICAgICogQHJlc3RyaWN0ZWRcbiAgICAgKi9cbiAgICBtb3VudEludGVybmFsKCkge1xuICAgICAgaWYgKHRoaXMubW91bnRQcm9taXNlXykge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3VudFByb21pc2VfO1xuICAgICAgfVxuICAgICAgdGhpcy5tb3VudEFib3J0Q29udHJvbGxlcl8gPVxuICAgICAgICB0aGlzLm1vdW50QWJvcnRDb250cm9sbGVyXyB8fCBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICBjb25zdCB7c2lnbmFsfSA9IHRoaXMubW91bnRBYm9ydENvbnRyb2xsZXJfO1xuICAgICAgcmV0dXJuICh0aGlzLm1vdW50UHJvbWlzZV8gPSB0aGlzLmJ1aWxkSW50ZXJuYWwoKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgZGV2QXNzZXJ0KHRoaXMuUjEoKSk7XG4gICAgICAgICAgaWYgKHNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAvLyBNb3VudGluZyBoYXMgYmVlbiBjYW5jZWxlZC5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zZXRSZWFkeVN0YXRlSW50ZXJuYWwoXG4gICAgICAgICAgICB0aGlzLnJlYWR5U3RhdGVfICE9IFJlYWR5U3RhdGUuTU9VTlRJTkdcbiAgICAgICAgICAgICAgPyB0aGlzLnJlYWR5U3RhdGVfXG4gICAgICAgICAgICAgIDogdGhpcy5pbXBsQ2xhc3NfLnVzZXNMb2FkaW5nKHRoaXMpXG4gICAgICAgICAgICAgID8gUmVhZHlTdGF0ZS5MT0FESU5HXG4gICAgICAgICAgICAgIDogUmVhZHlTdGF0ZS5NT1VOVElOR1xuICAgICAgICAgICk7XG4gICAgICAgICAgdGhpcy5tb3VudGVkXyA9IHRydWU7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5pbXBsXy5tb3VudENhbGxiYWNrKHNpZ25hbCk7XG4gICAgICAgICAgLy8gVGhlIHByb21pc2Ugc3VwcG9ydHMgdGhlIFYwIGZvcm1hdCBmb3IgZWFzeSBtaWdyYXRpb24uIElmIHRoZVxuICAgICAgICAgIC8vIGBtb3VudENhbGxiYWNrYCByZXR1cm5zIGEgcHJvbWlzZSwgdGhlIGFzc3VtcHRpb24gaXMgdGhhdCB0aGVcbiAgICAgICAgICAvLyBlbGVtZW50IGhhcyBmaW5pc2hlZCBsb2FkaW5nIHdoZW4gdGhlIHByb21pc2UgY29tcGxldGVzLlxuICAgICAgICAgIHJldHVybiByZXN1bHQgPyByZXN1bHQudGhlbihSRVRVUk5fVFJVRSkgOiBmYWxzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKGhhc0xvYWRlZCkgPT4ge1xuICAgICAgICAgIHRoaXMubW91bnRBYm9ydENvbnRyb2xsZXJfID0gbnVsbDtcbiAgICAgICAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgICAgIHRocm93IGNhbmNlbGxhdGlvbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnNpZ25hbHNfLnNpZ25hbChDb21tb25TaWduYWxzLk1PVU5URUQpO1xuICAgICAgICAgIGlmICghdGhpcy5pbXBsQ2xhc3NfLnVzZXNMb2FkaW5nKHRoaXMpIHx8IGhhc0xvYWRlZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRSZWFkeVN0YXRlSW50ZXJuYWwoUmVhZHlTdGF0ZS5DT01QTEVURSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4ge1xuICAgICAgICAgIHRoaXMubW91bnRBYm9ydENvbnRyb2xsZXJfID0gbnVsbDtcbiAgICAgICAgICBpZiAoaXNDYW5jZWxsYXRpb24ocmVhc29uKSkge1xuICAgICAgICAgICAgdGhpcy5tb3VudFByb21pc2VfID0gbnVsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzXy5yZWplY3RTaWduYWwoXG4gICAgICAgICAgICAgIENvbW1vblNpZ25hbHMuTU9VTlRFRCxcbiAgICAgICAgICAgICAgLyoqIEB0eXBlIHshRXJyb3J9ICovIChyZWFzb24pXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5zZXRSZWFkeVN0YXRlSW50ZXJuYWwoUmVhZHlTdGF0ZS5FUlJPUiwgcmVhc29uKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdHMgdGhlIGVsZW1lbnQgdG8gYmUgbW91bnRlZCBhcyBzb29uIGFzIHBvc3NpYmxlLlxuICAgICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIG1vdW50KCkge1xuICAgICAgaWYgKHRoaXMubW91bnRQcm9taXNlXykge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3VudFByb21pc2VfO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgdGhlIGFib3J0IGNvbnRyb2xsZXIgcmlnaHQgYXdheSB0byBlbnN1cmUgdGhhdCB3ZSB0aGUgdW5tb3VudFxuICAgICAgLy8gd2lsbCBwcm9wZXJseSBjYW5jZWwgdGhpcyBvcGVyYXRpb24uXG4gICAgICB0aGlzLm1vdW50QWJvcnRDb250cm9sbGVyXyA9XG4gICAgICAgIHRoaXMubW91bnRBYm9ydENvbnRyb2xsZXJfIHx8IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgIGNvbnN0IHtzaWduYWx9ID0gdGhpcy5tb3VudEFib3J0Q29udHJvbGxlcl87XG5cbiAgICAgIGNvbnN0IHJlYWR5UHJvbWlzZSA9IHRoaXMuc2lnbmFsc18ud2hlblNpZ25hbChcbiAgICAgICAgQ29tbW9uU2lnbmFscy5SRUFEWV9UT19VUEdSQURFXG4gICAgICApO1xuICAgICAgcmV0dXJuIHJlYWR5UHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLlIxKCkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy53aGVuQnVpbHQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgICB0aHJvdyBjYW5jZWxsYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXJGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSk7XG4gICAgICAgIHNjaGVkdWxlci5zY2hlZHVsZUFzYXAodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzLndoZW5Nb3VudGVkKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVbm1vdW50cyB0aGUgZWxlbWVudCBhbmQgbWFrZXMgaXQgcmVhZHkgZm9yIHRoZSBuZXh0IG1vdW50aW5nXG4gICAgICogb3BlcmF0aW9uLlxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIHVubW91bnQoKSB7XG4gICAgICAvLyBFbnN1cmUgdGhhdCB0aGUgZWxlbWVudCBpcyBwYXVzZWQuXG4gICAgICBpZiAodGhpcy5pc0Nvbm5lY3RlZF8pIHtcbiAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBMZWdhY3kgUjAgZWxlbWVudHMgc2ltcGx5IHVubGF5b3V0LlxuICAgICAgaWYgKCF0aGlzLlIxKCkpIHtcbiAgICAgICAgdGhpcy51bmxheW91dF8oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBDYW5jZWwgdGhlIGN1cnJlbnRseSBtb3VudGluZyBvcGVyYXRpb24uXG4gICAgICBpZiAodGhpcy5tb3VudEFib3J0Q29udHJvbGxlcl8pIHtcbiAgICAgICAgdGhpcy5tb3VudEFib3J0Q29udHJvbGxlcl8uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5tb3VudEFib3J0Q29udHJvbGxlcl8gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBVbnNjaGVkdWxlIGEgY3VycmVudGx5IHBlbmRpbmcgbW91bnQgcmVxdWVzdC5cbiAgICAgIGNvbnN0IHNjaGVkdWxlciA9IGdldFNjaGVkdWxlckZvckRvYyh0aGlzLmdldEFtcERvYygpKTtcbiAgICAgIHNjaGVkdWxlci51bnNjaGVkdWxlKHRoaXMpO1xuXG4gICAgICAvLyBUcnkgdG8gdW5tb3VudCBpZiB0aGUgZWxlbWVudCBoYXMgYmVlbiBidWlsdCBhbHJlYWR5LlxuICAgICAgaWYgKHRoaXMubW91bnRlZF8pIHtcbiAgICAgICAgdGhpcy5pbXBsXy51bm1vdW50Q2FsbGJhY2soKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29tcGxldGUgdW5tb3VudCBhbmQgcmVzZXQgdGhlIHN0YXRlLlxuICAgICAgdGhpcy5tb3VudGVkXyA9IGZhbHNlO1xuICAgICAgdGhpcy5tb3VudFByb21pc2VfID0gbnVsbDtcbiAgICAgIHRoaXMucmVzZXRfKCk7XG5cbiAgICAgIC8vIFByZXBhcmUgZm9yIHRoZSBuZXh0IG1vdW50IGlmIHRoZSBlbGVtZW50IGlzIGNvbm5lY3RlZC5cbiAgICAgIGlmICh0aGlzLmlzQ29ubmVjdGVkXykge1xuICAgICAgICB0aGlzLnVwZ3JhZGVPclNjaGVkdWxlXygvKiBvcHRfZGlzYWJsZVByZWxvYWQgKi8gdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0J3MgcmVzb2x2ZWQgd2hlbiB0aGUgZWxlbWVudCBoYXMgYmVlbiBtb3VudGVkLiBJZlxuICAgICAqIHRoZSBtb3VudCBmYWlscywgdGhlIHJlc3VsdGluZyBwcm9taXNlIGlzIHJlamVjdGVkLlxuICAgICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgICAqL1xuICAgIHdoZW5Nb3VudGVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2lnbmFsc18ud2hlblNpZ25hbChDb21tb25TaWduYWxzLk1PVU5URUQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIHdoZW5Mb2FkZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWduYWxzXy53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuTE9BRF9FTkQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuc3VyZSB0aGF0IHRoZSBlbGVtZW50IGlzIGVhZ2VybHkgbG9hZGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXI9fSBvcHRfcGFyZW50UHJpb3JpdHlcbiAgICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICAgKiBAZmluYWxcbiAgICAgKi9cbiAgICBlbnN1cmVMb2FkZWQob3B0X3BhcmVudFByaW9yaXR5KSB7XG4gICAgICByZXR1cm4gdGhpcy5tb3VudCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5SMSgpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaW1wbENsYXNzXy51c2VzTG9hZGluZyh0aGlzKSkge1xuICAgICAgICAgICAgdGhpcy5pbXBsXy5lbnN1cmVMb2FkZWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMud2hlbkxvYWRlZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVmVyeSB1Z2x5ISBUaGUgXCJidWlsdFwiIHNpZ25hbCBtdXN0IGJlIHJlc29sdmVkIGZyb20gdGhlIFJlc291cmNlXG4gICAgICAgIC8vIGFuZCBub3QgdGhlIGVsZW1lbnQgaXRzZWxmIGJlY2F1c2UgdGhlIFJlc291cmNlIGhhcyBub3QgY29ycmVjdGx5XG4gICAgICAgIC8vIHNldCBpdHMgc3RhdGUgZm9yIHRoZSBkb3duc3RyZWFtIHRvIHByb2Nlc3MgaXQgY29ycmVjdGx5LlxuICAgICAgICBjb25zdCByZXNvdXJjZSA9IHRoaXMuZ2V0UmVzb3VyY2VfKCk7XG4gICAgICAgIHJldHVybiByZXNvdXJjZS53aGVuQnVpbHQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocmVzb3VyY2UuZ2V0U3RhdGUoKSA9PSBSZXNvdXJjZVN0YXRlLkxBWU9VVF9DT01QTEVURSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICByZXNvdXJjZS5nZXRTdGF0ZSgpICE9IFJlc291cmNlU3RhdGUuTEFZT1VUX1NDSEVEVUxFRCB8fFxuICAgICAgICAgICAgcmVzb3VyY2UuaXNNZWFzdXJlUmVxdWVzdGVkKClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJlc291cmNlLm1lYXN1cmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFyZXNvdXJjZS5pc0Rpc3BsYXllZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZ2V0UmVzb3VyY2VzKCkuc2NoZWR1bGVMYXlvdXRPclByZWxvYWQoXG4gICAgICAgICAgICByZXNvdXJjZSxcbiAgICAgICAgICAgIC8qIGxheW91dCAqLyB0cnVlLFxuICAgICAgICAgICAgb3B0X3BhcmVudFByaW9yaXR5LFxuICAgICAgICAgICAgLyogZm9yY2VPdXRzaWRlVmlld3BvcnQgKi8gdHJ1ZVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMud2hlbkxvYWRlZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlZSBgQmFzZUVsZW1lbnQuc2V0QXNDb250YWluZXJgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHshRWxlbWVudD19IG9wdF9zY3JvbGxlciBBIGNoaWxkIG9mIHRoZSBjb250YWluZXIgdGhhdCBzaG91bGQgYmVcbiAgICAgKiBtb25pdG9yZWQuIFR5cGljYWxseSBhIHNjcm9sbGFibGUgZWxlbWVudC5cbiAgICAgKiBAcmVzdHJpY3RlZFxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIHNldEFzQ29udGFpbmVySW50ZXJuYWwob3B0X3Njcm9sbGVyKSB7XG4gICAgICBjb25zdCBidWlsZGVyID0gZ2V0U2NoZWR1bGVyRm9yRG9jKHRoaXMuZ2V0QW1wRG9jKCkpO1xuICAgICAgYnVpbGRlci5zZXRDb250YWluZXIodGhpcywgb3B0X3Njcm9sbGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWUgYEJhc2VFbGVtZW50LnJlbW92ZUFzQ29udGFpbmVyYC5cbiAgICAgKiBAcmVzdHJpY3RlZFxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIHJlbW92ZUFzQ29udGFpbmVySW50ZXJuYWwoKSB7XG4gICAgICBjb25zdCBidWlsZGVyID0gZ2V0U2NoZWR1bGVyRm9yRG9jKHRoaXMuZ2V0QW1wRG9jKCkpO1xuICAgICAgYnVpbGRlci5yZW1vdmVDb250YWluZXIodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRoZSBpbnRlcm5hbCByZWFkeSBzdGF0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7IVJlYWR5U3RhdGV9IHN0YXRlXG4gICAgICogQHBhcmFtIHsqPX0gb3B0X2ZhaWx1cmVcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQGZpbmFsXG4gICAgICovXG4gICAgc2V0UmVhZHlTdGF0ZUludGVybmFsKHN0YXRlLCBvcHRfZmFpbHVyZSkge1xuICAgICAgaWYgKHN0YXRlID09PSB0aGlzLnJlYWR5U3RhdGVfKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZWFkeVN0YXRlXyA9IHN0YXRlO1xuXG4gICAgICBpZiAoIXRoaXMuUjEoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAoc3RhdGUpIHtcbiAgICAgICAgY2FzZSBSZWFkeVN0YXRlLkxPQURJTkc6XG4gICAgICAgICAgdGhpcy5zaWduYWxzXy5zaWduYWwoQ29tbW9uU2lnbmFscy5MT0FEX1NUQVJUKTtcbiAgICAgICAgICB0aGlzLnNpZ25hbHNfLnJlc2V0KENvbW1vblNpZ25hbHMuVU5MT0FEKTtcbiAgICAgICAgICB0aGlzLnNpZ25hbHNfLnJlc2V0KENvbW1vblNpZ25hbHMuTE9BRF9FTkQpO1xuICAgICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWxheW91dCcpO1xuICAgICAgICAgIC8vIFBvdGVudGlhbGx5IHN0YXJ0IHRoZSBsb2FkaW5nIGluZGljYXRvci5cbiAgICAgICAgICB0aGlzLnRvZ2dsZUxvYWRpbmcodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEN1c3RvbUV2ZW50Rm9yVGVzdGluZyhBbXBFdmVudHMuTE9BRF9TVEFSVCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjYXNlIFJlYWR5U3RhdGUuQ09NUExFVEU6XG4gICAgICAgICAgLy8gTE9BRF9TVEFSVCBpcyBzZXQganVzdCBpbiBjYXNlLiBJdCB3b24ndCBiZSBvdmVyd3JpdHRlbiBpZlxuICAgICAgICAgIC8vIGl0IGhhZCBiZWVuIHNldCBiZWZvcmUuXG4gICAgICAgICAgdGhpcy5zaWduYWxzXy5zaWduYWwoQ29tbW9uU2lnbmFscy5MT0FEX1NUQVJUKTtcbiAgICAgICAgICB0aGlzLnNpZ25hbHNfLnNpZ25hbChDb21tb25TaWduYWxzLkxPQURfRU5EKTtcbiAgICAgICAgICB0aGlzLnNpZ25hbHNfLnJlc2V0KENvbW1vblNpZ25hbHMuVU5MT0FEKTtcbiAgICAgICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1sYXlvdXQnKTtcbiAgICAgICAgICB0aGlzLnRvZ2dsZUxvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgIGRvbS5kaXNwYXRjaEN1c3RvbUV2ZW50KHRoaXMsICdsb2FkJywgbnVsbCwgTk9fQlVCQkxFUyk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEN1c3RvbUV2ZW50Rm9yVGVzdGluZyhBbXBFdmVudHMuTE9BRF9FTkQpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY2FzZSBSZWFkeVN0YXRlLkVSUk9SOlxuICAgICAgICAgIHRoaXMuc2lnbmFsc18ucmVqZWN0U2lnbmFsKFxuICAgICAgICAgICAgQ29tbW9uU2lnbmFscy5MT0FEX0VORCxcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7IUVycm9yfSAqLyAob3B0X2ZhaWx1cmUpXG4gICAgICAgICAgKTtcbiAgICAgICAgICB0aGlzLnRvZ2dsZUxvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgIGRvbS5kaXNwYXRjaEN1c3RvbUV2ZW50KHRoaXMsICdlcnJvcicsIG9wdF9mYWlsdXJlLCBOT19CVUJCTEVTKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHRvIGluc3RydWN0IHRoZSBlbGVtZW50IHRvIHByZWNvbm5lY3QgdG8gaG9zdHMgaXQgdXNlcyBkdXJpbmdcbiAgICAgKiBsYXlvdXQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBvbkxheW91dCBXaGV0aGVyIHRoaXMgd2FzIGNhbGxlZCBhZnRlciBhIGxheW91dC5cbiAgICAgKiBUT0RPKCMzMTkxNSk6IHJlbW92ZSBvbmNlIFIxIG1pZ3JhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICAgKi9cbiAgICBwcmVjb25uZWN0KG9uTGF5b3V0KSB7XG4gICAgICBkZXZBc3NlcnQodGhpcy5pc1VwZ3JhZGVkKCkpO1xuICAgICAgaWYgKG9uTGF5b3V0KSB7XG4gICAgICAgIHRoaXMuaW1wbF8ucHJlY29ubmVjdENhbGxiYWNrKG9uTGF5b3V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHdlIGRvIGVhcmx5IHByZWNvbm5lY3RzIHdlIGRlbGF5IHRoZW0gYSBiaXQuIFRoaXMgaXMga2luZCBvZlxuICAgICAgICAvLyBhbiB1bmZvcnR1bmF0ZSB0cmFkZSBvZmYsIGJ1dCBpdCBzZWVtcyBmYXN0ZXIsIGJlY2F1c2UgdGhlIERPTVxuICAgICAgICAvLyBvcGVyYXRpb25zIHRoZW1zZWx2ZXMgYXJlIG5vdCBmcmVlIGFuZCBtaWdodCBkZWxheVxuICAgICAgICBzdGFydHVwQ2h1bmsodGhpcy5nZXRBbXBEb2MoKSwgKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5vd25lckRvY3VtZW50IHx8ICF0aGlzLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5pbXBsXy5wcmVjb25uZWN0Q2FsbGJhY2sob25MYXlvdXQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWUgYEJhc2VFbGVtZW50LlIxKClgLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKiBAZmluYWxcbiAgICAgKi9cbiAgICBSMSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmltcGxDbGFzc18gPyB0aGlzLmltcGxDbGFzc18uUjEoKSA6IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlZSBgQmFzZUVsZW1lbnQuZGVmZXJyZWRNb3VudCgpYC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICogQGZpbmFsXG4gICAgICovXG4gICAgZGVmZXJyZWRNb3VudCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmltcGxDbGFzc18gPyB0aGlzLmltcGxDbGFzc18uZGVmZXJyZWRNb3VudCh0aGlzKSA6IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGN1c3RvbSBlbGVtZW50IGRlY2xhcmVzIHRoYXQgaXQgaGFzIHRvIGJlIGZpeGVkLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNBbHdheXNGaXhlZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmltcGxfID8gdGhpcy5pbXBsXy5pc0Fsd2F5c0ZpeGVkKCkgOiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBsYXlvdXQgYm94IG9mIHRoZSBlbGVtZW50LlxuICAgICAqIFNob3VsZCBvbmx5IGJlIGNhbGxlZCBieSBSZXNvdXJjZXMuXG4gICAgICogQHBhcmFtIHshLi9sYXlvdXQtcmVjdC5MYXlvdXRSZWN0RGVmfSBsYXlvdXRCb3hcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNpemVDaGFuZ2VkXG4gICAgICovXG4gICAgdXBkYXRlTGF5b3V0Qm94KGxheW91dEJveCwgc2l6ZUNoYW5nZWQgPSBmYWxzZSkge1xuICAgICAgaWYgKHRoaXMuaXNCdWlsdCgpKSB7XG4gICAgICAgIHRoaXMub25NZWFzdXJlKHNpemVDaGFuZ2VkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxscyBvbkxheW91dE1lYXN1cmUoKSBvbiB0aGUgQmFzZUVsZW1lbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICogU2hvdWxkIG9ubHkgYmUgY2FsbGVkIGJ5IFJlc291cmNlcy5cbiAgICAgKi9cbiAgICBvbk1lYXN1cmUoKSB7XG4gICAgICBkZXZBc3NlcnQodGhpcy5pc0J1aWx0KCkpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5pbXBsXy5vbkxheW91dE1lYXN1cmUoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVwb3J0RXJyb3IoZSwgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7P0VsZW1lbnR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRTaXplcl8oKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuc2l6ZXJFbGVtZW50ID09PSB1bmRlZmluZWQgJiZcbiAgICAgICAgKHRoaXMubGF5b3V0XyA9PT0gTGF5b3V0LlJFU1BPTlNJVkUgfHxcbiAgICAgICAgICB0aGlzLmxheW91dF8gPT09IExheW91dC5JTlRSSU5TSUMpXG4gICAgICApIHtcbiAgICAgICAgLy8gRXhwZWN0IHNpemVyIHRvIGV4aXN0LCBqdXN0IG5vdCB5ZXQgZGlzY292ZXJlZC5cbiAgICAgICAgdGhpcy5zaXplckVsZW1lbnQgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ2ktYW1waHRtbC1zaXplcicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc2l6ZXJFbGVtZW50IHx8IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBzaXplclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcmVzZXRTaXplcl8oc2l6ZXIpIHtcbiAgICAgIGlmICh0aGlzLmxheW91dF8gPT09IExheW91dC5SRVNQT05TSVZFKSB7XG4gICAgICAgIHNldFN0eWxlKHNpemVyLCAncGFkZGluZ1RvcCcsICcwJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxheW91dF8gPT09IExheW91dC5JTlRSSU5TSUMpIHtcbiAgICAgICAgY29uc3QgaW50cmluc2ljU2l6ZXJJbWcgPSBzaXplci5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICcuaS1hbXBodG1sLWludHJpbnNpYy1zaXplcidcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCFpbnRyaW5zaWNTaXplckltZykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpbnRyaW5zaWNTaXplckltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsICcnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIGluaXRNZWRpYUF0dHJzXygpIHtcbiAgICAgIGNvbnN0IGhhc01lZGlhQXR0cnMgPVxuICAgICAgICB0aGlzLmhhc0F0dHJpYnV0ZSgnbWVkaWEnKSB8fFxuICAgICAgICAodGhpcy5oYXNBdHRyaWJ1dGUoJ3NpemVzJykgJiZcbiAgICAgICAgICAhdGhpcy5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGUtaW5saW5lLXdpZHRoJykpIHx8XG4gICAgICAgIHRoaXMuaGFzQXR0cmlidXRlKCdoZWlnaHRzJyk7XG4gICAgICBjb25zdCBoYWRNZWRpYUF0dHJzID0gISF0aGlzLm1lZGlhUXVlcnlQcm9wc187XG4gICAgICBjb25zdCB3aW4gPSB0aGlzLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXc7XG4gICAgICBpZiAoaGFzTWVkaWFBdHRycyAhPSBoYWRNZWRpYUF0dHJzICYmIHdpbikge1xuICAgICAgICBpZiAoaGFzTWVkaWFBdHRycykge1xuICAgICAgICAgIHRoaXMubWVkaWFRdWVyeVByb3BzXyA9IG5ldyBNZWRpYVF1ZXJ5UHJvcHMod2luLCAoKSA9PlxuICAgICAgICAgICAgdGhpcy5hcHBseU1lZGlhQXR0cnNfKClcbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMuYXBwbHlNZWRpYUF0dHJzXygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZGlzcG9zZU1lZGlhQXR0cnNfKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQHByaXZhdGUgKi9cbiAgICBkaXNwb3NlTWVkaWFBdHRyc18oKSB7XG4gICAgICBpZiAodGhpcy5tZWRpYVF1ZXJ5UHJvcHNfKSB7XG4gICAgICAgIHRoaXMubWVkaWFRdWVyeVByb3BzXy5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMubWVkaWFRdWVyeVByb3BzXyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEBwcml2YXRlICovXG4gICAgYXBwbHlNZWRpYUF0dHJzXygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gdGhpcy5tZWRpYVF1ZXJ5UHJvcHNfO1xuICAgICAgaWYgKCFwcm9wcykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHByb3BzLnN0YXJ0KCk7XG5cbiAgICAgIC8vIE1lZGlhIHF1ZXJ5LlxuICAgICAgY29uc3QgbWVkaWFBdHRyID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ21lZGlhJykgfHwgbnVsbDtcbiAgICAgIGNvbnN0IG1hdGNoZXNNZWRpYSA9IG1lZGlhQXR0clxuICAgICAgICA/IHByb3BzLnJlc29sdmVNYXRjaFF1ZXJ5KG1lZGlhQXR0cilcbiAgICAgICAgOiB0cnVlO1xuICAgICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdpLWFtcGh0bWwtaGlkZGVuLWJ5LW1lZGlhLXF1ZXJ5JywgIW1hdGNoZXNNZWRpYSk7XG5cbiAgICAgIC8vIFNpemVzLlxuICAgICAgY29uc3Qgc2l6ZXNBdHRyID0gdGhpcy5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGUtaW5saW5lLXdpZHRoJylcbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogdGhpcy5nZXRBdHRyaWJ1dGUoJ3NpemVzJyk7XG4gICAgICBpZiAoc2l6ZXNBdHRyKSB7XG4gICAgICAgIHNldFN0eWxlKHRoaXMsICd3aWR0aCcsIHByb3BzLnJlc29sdmVMaXN0UXVlcnkoc2l6ZXNBdHRyKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEhlaWdodHMuXG4gICAgICBjb25zdCBoZWlnaHRzQXR0ciA9XG4gICAgICAgIHRoaXMubGF5b3V0XyA9PT0gTGF5b3V0LlJFU1BPTlNJVkVcbiAgICAgICAgICA/IHRoaXMuZ2V0QXR0cmlidXRlKCdoZWlnaHRzJylcbiAgICAgICAgICA6IG51bGw7XG4gICAgICBpZiAoaGVpZ2h0c0F0dHIpIHtcbiAgICAgICAgY29uc3Qgc2l6ZXIgPSB0aGlzLmdldFNpemVyXygpO1xuICAgICAgICBpZiAoc2l6ZXIpIHtcbiAgICAgICAgICBzZXRTdHlsZShzaXplciwgJ3BhZGRpbmdUb3AnLCBwcm9wcy5yZXNvbHZlTGlzdFF1ZXJ5KGhlaWdodHNBdHRyKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHJvcHMuY29tcGxldGUoKTtcbiAgICAgIHRoaXMuZ2V0UmVzb3VyY2VfKCkucmVxdWVzdE1lYXN1cmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGEgc2l6ZSBjaGFuZ2UgdG8gdGhlIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgYnkgUmVzb3VyY2VzIGFuZCBzaG91bGRuJ3QgYmUgY2FsbGVkIGJ5IGFueW9uZVxuICAgICAqIGVsc2UuIFRoaXMgbWV0aG9kIG11c3QgYWx3YXlzIGJlIGNhbGxlZCBpbiB0aGUgbXV0YXRpb24gY29udGV4dC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfHVuZGVmaW5lZH0gbmV3SGVpZ2h0XG4gICAgICogQHBhcmFtIHtudW1iZXJ8dW5kZWZpbmVkfSBuZXdXaWR0aFxuICAgICAqIEBwYXJhbSB7IS4vbGF5b3V0LXJlY3QuTGF5b3V0TWFyZ2luc0RlZj19IG9wdF9uZXdNYXJnaW5zXG4gICAgICogQGZpbmFsXG4gICAgICogQHBhY2thZ2VcbiAgICAgKi9cbiAgICBhcHBseVNpemUobmV3SGVpZ2h0LCBuZXdXaWR0aCwgb3B0X25ld01hcmdpbnMpIHtcbiAgICAgIGNvbnN0IHNpemVyID0gdGhpcy5nZXRTaXplcl8oKTtcbiAgICAgIGlmIChzaXplcikge1xuICAgICAgICAvLyBGcm9tIHRoZSBtb21lbnQgaGVpZ2h0IGlzIGNoYW5nZWQgdGhlIGVsZW1lbnQgYmVjb21lcyBmdWxseVxuICAgICAgICAvLyByZXNwb25zaWJsZSBmb3IgbWFuYWdpbmcgaXRzIGhlaWdodC4gQXNwZWN0IHJhdGlvIGlzIG5vIGxvbmdlclxuICAgICAgICAvLyBwcmVzZXJ2ZWQuXG4gICAgICAgIHRoaXMuc2l6ZXJFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXNldFNpemVyXyhzaXplcik7XG4gICAgICAgIHRoaXMubXV0YXRlT3JJbnZva2VfKCgpID0+IHtcbiAgICAgICAgICBpZiAoc2l6ZXIpIHtcbiAgICAgICAgICAgIGRvbS5yZW1vdmVFbGVtZW50KHNpemVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKG5ld0hlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNldFN0eWxlKHRoaXMsICdoZWlnaHQnLCBuZXdIZWlnaHQsICdweCcpO1xuICAgICAgfVxuICAgICAgaWYgKG5ld1dpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2V0U3R5bGUodGhpcywgJ3dpZHRoJywgbmV3V2lkdGgsICdweCcpO1xuICAgICAgfVxuICAgICAgaWYgKG9wdF9uZXdNYXJnaW5zKSB7XG4gICAgICAgIGlmIChvcHRfbmV3TWFyZ2lucy50b3AgIT0gbnVsbCkge1xuICAgICAgICAgIHNldFN0eWxlKHRoaXMsICdtYXJnaW5Ub3AnLCBvcHRfbmV3TWFyZ2lucy50b3AsICdweCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRfbmV3TWFyZ2lucy5yaWdodCAhPSBudWxsKSB7XG4gICAgICAgICAgc2V0U3R5bGUodGhpcywgJ21hcmdpblJpZ2h0Jywgb3B0X25ld01hcmdpbnMucmlnaHQsICdweCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRfbmV3TWFyZ2lucy5ib3R0b20gIT0gbnVsbCkge1xuICAgICAgICAgIHNldFN0eWxlKHRoaXMsICdtYXJnaW5Cb3R0b20nLCBvcHRfbmV3TWFyZ2lucy5ib3R0b20sICdweCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRfbmV3TWFyZ2lucy5sZWZ0ICE9IG51bGwpIHtcbiAgICAgICAgICBzZXRTdHlsZSh0aGlzLCAnbWFyZ2luTGVmdCcsIG9wdF9uZXdNYXJnaW5zLmxlZnQsICdweCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5pc0F3YWl0aW5nU2l6ZV8oKSkge1xuICAgICAgICB0aGlzLnNpemVQcm92aWRlZF8oKTtcbiAgICAgIH1cbiAgICAgIGRvbS5kaXNwYXRjaEN1c3RvbUV2ZW50KHRoaXMsIEFtcEV2ZW50cy5TSVpFX0NIQU5HRUQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCB3aGVuIHRoZSBlbGVtZW50IGlzIGZpcnN0IGNvbm5lY3RlZCB0byB0aGUgRE9NLlxuICAgICAqXG4gICAgICogVGhpcyBjYWxsYmFjayBpcyBndWFyZGVkIGJ5IGNoZWNrcyB0byBzZWUgaWYgdGhlIGVsZW1lbnQgaXMgc3RpbGxcbiAgICAgKiBjb25uZWN0ZWQuICBDaHJvbWUgYW5kIFNhZmFyaSBjYW4gdHJpZ2dlciBjb25uZWN0ZWRDYWxsYmFjayBldmVuIHdoZW5cbiAgICAgKiB0aGUgbm9kZSBpcyBkaXNjb25uZWN0ZWQuIFNlZSAjMTI4NDksIGh0dHBzOi8vY3JidWcuY29tLzgyMTE5NSwgYW5kXG4gICAgICogaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE4MDk0MC4gVGhhbmtmdWxseSxcbiAgICAgKiBjb25uZWN0ZWRDYWxsYmFjayB3aWxsIGxhdGVyIGJlIGNhbGxlZCB3aGVuIHRoZSBkaXNjb25uZWN0ZWQgcm9vdCBpc1xuICAgICAqIGNvbm5lY3RlZCB0byB0aGUgZG9jdW1lbnQgdHJlZS5cbiAgICAgKlxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgaWYgKCFpc1RlbXBsYXRlVGFnU3VwcG9ydGVkKCkgJiYgdGhpcy5pc0luVGVtcGxhdGVfID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5pc0luVGVtcGxhdGVfID0gISFxdWVyeS5jbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3RvcihcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgICd0ZW1wbGF0ZSdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmlzSW5UZW1wbGF0ZV8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc0Nvbm5lY3RlZF8gfHwgIWRvbS5pc0Nvbm5lY3RlZE5vZGUodGhpcykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5pc0Nvbm5lY3RlZF8gPSB0cnVlO1xuXG4gICAgICBpZiAoIXRoaXMuZXZlckF0dGFjaGVkKSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWVsZW1lbnQnKTtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtbm90YnVpbHQnKTtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdhbXAtbm90YnVpbHQnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmFtcGRvY18pIHtcbiAgICAgICAgLy8gQW1wZG9jIGNhbiBub3cgYmUgaW5pdGlhbGl6ZWQuXG4gICAgICAgIGNvbnN0IHdpbiA9IHRvV2luKHRoaXMub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldyk7XG4gICAgICAgIGNvbnN0IGFtcGRvY1NlcnZpY2UgPSBTZXJ2aWNlcy5hbXBkb2NTZXJ2aWNlRm9yKHdpbik7XG4gICAgICAgIGNvbnN0IGFtcGRvYyA9IGFtcGRvY1NlcnZpY2UuZ2V0QW1wRG9jKHRoaXMpO1xuICAgICAgICB0aGlzLmFtcGRvY18gPSBhbXBkb2M7XG4gICAgICAgIGVsZW1lbnRDb25uZWN0ZWRDYWxsYmFjayhhbXBkb2MsIHRoaXMsIHRoaXMuaW1wbENsYXNzXyk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMucmVzb3VyY2VzXykge1xuICAgICAgICAvLyBSZXNvdXJjZXMgY2FuIG5vdyBiZSBpbml0aWFsaXplZCBzaW5jZSB0aGUgYW1wZG9jIGlzIG5vdyBhdmFpbGFibGUuXG4gICAgICAgIHRoaXMucmVzb3VyY2VzXyA9IFNlcnZpY2VzLnJlc291cmNlc0ZvckRvYyh0aGlzLmFtcGRvY18pO1xuICAgICAgfVxuICAgICAgdGhpcy5nZXRSZXNvdXJjZXMoKS5hZGQodGhpcyk7XG5cbiAgICAgIGlmICh0aGlzLmV2ZXJBdHRhY2hlZCkge1xuICAgICAgICBjb25zdCByZWNvbnN0cnVjdCA9IHRoaXMucmVjb25zdHJ1Y3RXaGVuUmVwYXJlbnRlZCgpO1xuICAgICAgICBpZiAocmVjb25zdHJ1Y3QpIHtcbiAgICAgICAgICB0aGlzLnJlc2V0XygpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzVXBncmFkZWQoKSkge1xuICAgICAgICAgIGlmIChyZWNvbnN0cnVjdCAmJiAhdGhpcy5SMSgpKSB7XG4gICAgICAgICAgICB0aGlzLmdldFJlc291cmNlcygpLnVwZ3JhZGVkKHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmNvbm5lY3RlZF8oKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoQ3VzdG9tRXZlbnRGb3JUZXN0aW5nKEFtcEV2ZW50cy5BVFRBQ0hFRCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW1wbENsYXNzXyAmJiB0aGlzLlIxKCkpIHtcbiAgICAgICAgICB0aGlzLnVwZ3JhZGVPclNjaGVkdWxlXygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmV2ZXJBdHRhY2hlZCA9IHRydWU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmxheW91dF8gPSBhcHBseVN0YXRpY0xheW91dChcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBTZXJ2aWNlcy5wbGF0Zm9ybUZvcih0b1dpbih0aGlzLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpKS5pc0llKClcbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMuaW5pdE1lZGlhQXR0cnNfKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXBvcnRFcnJvcihlLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pbXBsQ2xhc3NfKSB7XG4gICAgICAgICAgdGhpcy51cGdyYWRlT3JTY2hlZHVsZV8oKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuaXNVcGdyYWRlZCgpKSB7XG4gICAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdhbXAtdW5yZXNvbHZlZCcpO1xuICAgICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXVucmVzb2x2ZWQnKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoQ3VzdG9tRXZlbnRGb3JUZXN0aW5nKEFtcEV2ZW50cy5TVFVCQkVEKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnRvZ2dsZUxvYWRpbmcodHJ1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGlzQXdhaXRpbmdTaXplXygpIHtcbiAgICAgIHJldHVybiB0aGlzLmNsYXNzTGlzdC5jb250YWlucygnaS1hbXBodG1sLWxheW91dC1hd2FpdGluZy1zaXplJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzaXplUHJvdmlkZWRfKCkge1xuICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdpLWFtcGh0bWwtbGF5b3V0LWF3YWl0aW5nLXNpemUnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGdyYWRlIG9yIHNjaGVkdWxlIGVsZW1lbnQgYmFzZWQgb24gUjEuXG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2Rpc2FibGVQcmVsb2FkXG4gICAgICogQHByaXZhdGUgQGZpbmFsXG4gICAgICovXG4gICAgdXBncmFkZU9yU2NoZWR1bGVfKG9wdF9kaXNhYmxlUHJlbG9hZCkge1xuICAgICAgaWYgKCF0aGlzLlIxKCkpIHtcbiAgICAgICAgdGhpcy50cnlVcGdyYWRlXygpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm1vdW50UHJvbWlzZV8pIHtcbiAgICAgICAgLy8gQWxyZWFkeSBtb3VudGluZy5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBTY2hlZHVsZSBidWlsZCBhbmQgbW91bnQuXG4gICAgICBjb25zdCBzY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXJGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSk7XG4gICAgICBzY2hlZHVsZXIuc2NoZWR1bGUodGhpcyk7XG5cbiAgICAgIGlmICh0aGlzLmJ1aWxkaW5nUHJvbWlzZV8pIHtcbiAgICAgICAgLy8gQWxyZWFkeSBidWlsdCBvciBidWlsZGluZzoganVzdCBuZWVkcyB0byBiZSBtb3VudGVkLlxuICAgICAgICB0aGlzLnNldFJlYWR5U3RhdGVJbnRlcm5hbChcbiAgICAgICAgICB0aGlzLmltcGxDbGFzc18gJiYgdGhpcy5pbXBsQ2xhc3NfLnVzZXNMb2FkaW5nKHRoaXMpXG4gICAgICAgICAgICA/IFJlYWR5U3RhdGUuTE9BRElOR1xuICAgICAgICAgICAgOiBSZWFkeVN0YXRlLk1PVU5USU5HXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOb3QgYnVpbHQgeWV0OiBleGVjdXRlIHByZWJ1aWxkIHN0ZXBzLlxuICAgICAgICB0aGlzLnNldFJlYWR5U3RhdGVJbnRlcm5hbChSZWFkeVN0YXRlLkJVSUxESU5HKTtcblxuICAgICAgICAvLyBTY2hlZHVsZSBwcmVjb25uZWN0cy5cbiAgICAgICAgaWYgKCFvcHRfZGlzYWJsZVByZWxvYWQpIHtcbiAgICAgICAgICBjb25zdCB1cmxzID0gdGhpcy5pbXBsQ2xhc3NfLmdldFByZWNvbm5lY3RzKHRoaXMpO1xuICAgICAgICAgIGlmICh1cmxzICYmIHVybHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gSWYgd2UgZG8gZWFybHkgcHJlY29ubmVjdHMgd2UgZGVsYXkgdGhlbSBhIGJpdC4gVGhpcyBpcyBraW5kIG9mXG4gICAgICAgICAgICAvLyBhbiB1bmZvcnR1bmF0ZSB0cmFkZSBvZmYsIGJ1dCBpdCBzZWVtcyBmYXN0ZXIsIGJlY2F1c2UgdGhlIERPTVxuICAgICAgICAgICAgLy8gb3BlcmF0aW9ucyB0aGVtc2VsdmVzIGFyZSBub3QgZnJlZSBhbmQgbWlnaHQgZGVsYXlcbiAgICAgICAgICAgIGNvbnN0IGFtcGRvYyA9IHRoaXMuZ2V0QW1wRG9jKCk7XG4gICAgICAgICAgICBzdGFydHVwQ2h1bmsoYW1wZG9jLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHt3aW59ID0gYW1wZG9jO1xuICAgICAgICAgICAgICBpZiAoIXdpbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBwcmVjb25uZWN0ID0gU2VydmljZXMucHJlY29ubmVjdEZvcih3aW4pO1xuICAgICAgICAgICAgICB1cmxzLmZvckVhY2goKHVybCkgPT5cbiAgICAgICAgICAgICAgICBwcmVjb25uZWN0LnVybChhbXBkb2MsIHVybCwgLyogYWxzb0Nvbm5lY3RpbmcgKi8gZmFsc2UpXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcnkgdG8gdXBncmFkZSB0aGUgZWxlbWVudCB3aXRoIHRoZSBwcm92aWRlZCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgKiBAcmV0dXJuIHshUHJvbWlzZXx1bmRlZmluZWR9XG4gICAgICogQHByaXZhdGUgQGZpbmFsXG4gICAgICovXG4gICAgdHJ5VXBncmFkZV8oKSB7XG4gICAgICBpZiAodGhpcy5pc0luVGVtcGxhdGVfKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnVwZ3JhZGVTdGF0ZV8gIT0gVXBncmFkZVN0YXRlLk5PVF9VUEdSQURFRCkge1xuICAgICAgICAvLyBBbHJlYWR5IHVwZ3JhZGVkIG9yIGluIHByb2dyZXNzIG9yIGZhaWxlZC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBDdG9yID0gZGV2QXNzZXJ0KFxuICAgICAgICB0aGlzLmltcGxDbGFzc18sXG4gICAgICAgICdJbXBsZW1lbnRhdGlvbiBtdXN0IG5vdCBiZSBhIHN0dWInXG4gICAgICApO1xuXG4gICAgICBjb25zdCBpbXBsID0gbmV3IEN0b3IodGhpcyk7XG5cbiAgICAgIC8vIFRoZSBgdXBncmFkZUNhbGxiYWNrYCBvbmx5IGFsbG93cyByZWRpcmVjdCBvbmNlIGZvciB0aGUgdG9wLWxldmVsXG4gICAgICAvLyBub24tc3R1YiBjbGFzcy4gV2UgbWF5IGFsbG93IG5lc3RlZCB1cGdyYWRlcyBsYXRlciwgYnV0IHRoZXkgd2lsbFxuICAgICAgLy8gY2VydGFpbmx5IGJlIGJhZCBmb3IgcGVyZm9ybWFuY2UuXG4gICAgICB0aGlzLnVwZ3JhZGVTdGF0ZV8gPSBVcGdyYWRlU3RhdGUuVVBHUkFERV9JTl9QUk9HUkVTUztcbiAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IHdpbi5EYXRlLm5vdygpO1xuICAgICAgY29uc3QgcmVzID0gaW1wbC51cGdyYWRlQ2FsbGJhY2soKTtcbiAgICAgIGlmICghcmVzKSB7XG4gICAgICAgIC8vIE5vdGhpbmcgcmV0dXJuZWQ6IHRoZSBjdXJyZW50IG9iamVjdCBpcyB0aGUgdXBncmFkZWQgdmVyc2lvbi5cbiAgICAgICAgdGhpcy5jb21wbGV0ZVVwZ3JhZGVfKGltcGwsIHN0YXJ0VGltZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXMudGhlbiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIEl0J3MgYSBwcm9taXNlOiB3YWl0IHVudGlsIGl0J3MgZG9uZS5cbiAgICAgICAgcmV0dXJuIHJlc1xuICAgICAgICAgIC50aGVuKCh1cGdyYWRlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlVXBncmFkZV8odXBncmFkZSB8fCBpbXBsLCBzdGFydFRpbWUpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBncmFkZVN0YXRlXyA9IFVwZ3JhZGVTdGF0ZS5VUEdSQURFX0ZBSUxFRDtcbiAgICAgICAgICAgIHJldGhyb3dBc3luYyhyZWFzb24pO1xuICAgICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSXQncyBhbiBhY3R1YWwgaW5zdGFuY2U6IHVwZ3JhZGUgaW1tZWRpYXRlbHkuXG4gICAgICAgIHRoaXMuY29tcGxldGVVcGdyYWRlXyhcbiAgICAgICAgICAvKiogQHR5cGUgeyEuL2Jhc2UtZWxlbWVudC5CYXNlRWxlbWVudH0gKi8gKHJlcyksXG4gICAgICAgICAgc3RhcnRUaW1lXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIGVsZW1lbnQgaXMgZGlzY29ubmVjdGVkIGZyb20gdGhlIERPTS5cbiAgICAgKlxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgdGhpcy5kaXNjb25uZWN0KC8qIHByZXRlbmREaXNjb25uZWN0ZWQgKi8gZmFsc2UpO1xuICAgIH1cblxuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIGNvbm5lY3RlZF8oKSB7XG4gICAgICBpZiAodGhpcy5idWlsdF8pIHtcbiAgICAgICAgdGhpcy5pbXBsXy5hdHRhY2hlZENhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gYW4gZWxlbWVudCBpcyBkaXNjb25uZWN0ZWQgZnJvbSBET00sIG9yIHdoZW4gYW4gYW1wRG9jIGlzXG4gICAgICogYmVpbmcgZGlzY29ubmVjdGVkICh0aGUgZWxlbWVudCBpdHNlbGYgbWF5IHN0aWxsIGJlIGNvbm5lY3RlZCB0byBhbXBEb2MpLlxuICAgICAqXG4gICAgICogVGhpcyBjYWxsYmFjayBpcyBndWFyZGVkIGJ5IGNoZWNrcyB0byBzZWUgaWYgdGhlIGVsZW1lbnQgaXMgc3RpbGxcbiAgICAgKiBjb25uZWN0ZWQuIFNlZSAjMTI4NDksIGh0dHBzOi8vY3JidWcuY29tLzgyMTE5NSwgYW5kXG4gICAgICogaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE4MDk0MC5cbiAgICAgKiBJZiB0aGUgZWxlbWVudCBpcyBzdGlsbCBjb25uZWN0ZWQgdG8gdGhlIGRvY3VtZW50LCB5b3UnbGwgbmVlZCB0byBwYXNzXG4gICAgICogb3B0X3ByZXRlbmREaXNjb25uZWN0ZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXRlbmREaXNjb25uZWN0ZWQgRm9yY2VzIGRpc2Nvbm5lY3Rpb24gcmVnYXJkbGVzc1xuICAgICAqICAgICBvZiBET00gaXNDb25uZWN0ZWQuXG4gICAgICovXG4gICAgZGlzY29ubmVjdChwcmV0ZW5kRGlzY29ubmVjdGVkKSB7XG4gICAgICBpZiAodGhpcy5pc0luVGVtcGxhdGVfIHx8ICF0aGlzLmlzQ29ubmVjdGVkXykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXByZXRlbmREaXNjb25uZWN0ZWQgJiYgZG9tLmlzQ29ubmVjdGVkTm9kZSh0aGlzKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXMgcGF0aCBvbmx5IGNvbWVzIGZyb20gUmVzb3VyY2UjZGlzY29ubmVjdCwgd2hpY2ggZGVsZXRlcyB0aGVcbiAgICAgIC8vIFJlc291cmNlIGluc3RhbmNlIHRpZWQgdG8gdGhpcyBlbGVtZW50LiBUaGVyZWZvcmUsIGl0IGlzIG5vIGxvbmdlclxuICAgICAgLy8gYW4gQU1QIEVsZW1lbnQuIEJ1dCwgRE9NIHF1ZXJpZXMgZm9yIGktYW1waHRtbC1lbGVtZW50IGFzc3VtZSB0aGF0XG4gICAgICAvLyB0aGUgZWxlbWVudCBpcyB0aWVkIHRvIGEgUmVzb3VyY2UuXG4gICAgICBpZiAocHJldGVuZERpc2Nvbm5lY3RlZCkge1xuICAgICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ2ktYW1waHRtbC1lbGVtZW50Jyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXNDb25uZWN0ZWRfID0gZmFsc2U7XG4gICAgICB0aGlzLmdldFJlc291cmNlcygpLnJlbW92ZSh0aGlzKTtcbiAgICAgIGlmICh0aGlzLmltcGxfKSB7XG4gICAgICAgIHRoaXMuaW1wbF8uZGV0YWNoZWRDYWxsYmFjaygpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuUjEoKSkge1xuICAgICAgICB0aGlzLnVubW91bnQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudG9nZ2xlTG9hZGluZyhmYWxzZSk7XG4gICAgICB0aGlzLmRpc3Bvc2VNZWRpYUF0dHJzXygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoZXMgYSBjdXN0b20gZXZlbnQgb25seSBpbiB0ZXN0aW5nIGVudmlyb25tZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0geyFPYmplY3Q9fSBvcHRfZGF0YSBFdmVudCBkYXRhLlxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIGRpc3BhdGNoQ3VzdG9tRXZlbnRGb3JUZXN0aW5nKG5hbWUsIG9wdF9kYXRhKSB7XG4gICAgICBpZiAoIWdldE1vZGUoKS50ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGRvbS5kaXNwYXRjaEN1c3RvbUV2ZW50KHRoaXMsIG5hbWUsIG9wdF9kYXRhKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBlbGVtZW50IGNhbiBwcmUtcmVuZGVyLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICogQGZpbmFsXG4gICAgICovXG4gICAgcHJlcmVuZGVyQWxsb3dlZCgpIHtcbiAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZSgnbm9wcmVyZW5kZXInKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5pbXBsQ2xhc3NfID8gdGhpcy5pbXBsQ2xhc3NfLnByZXJlbmRlckFsbG93ZWQodGhpcykgOiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBlbGVtZW50IGhhcyByZW5kZXItYmxvY2tpbmcgc2VydmljZS5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIGlzQnVpbGRSZW5kZXJCbG9ja2luZygpIHtcbiAgICAgIHJldHVybiB0aGlzLmltcGxfID8gdGhpcy5pbXBsXy5pc0J1aWxkUmVuZGVyQmxvY2tpbmcoKSA6IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBwbGFjZWhvbGRlciBmb3IgdGhlIGVsZW1lbnQuXG4gICAgICogQHJldHVybiB7P0VsZW1lbnR9XG4gICAgICogQGZpbmFsXG4gICAgICovXG4gICAgY3JlYXRlUGxhY2Vob2xkZXIoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbXBsXyA/IHRoaXMuaW1wbF8uY3JlYXRlUGxhY2Vob2xkZXJDYWxsYmFjaygpIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbG9hZGVyIGxvZ28uXG4gICAgICogQHJldHVybiB7e1xuICAgICAqICBjb250ZW50OiAoIUVsZW1lbnR8dW5kZWZpbmVkKSxcbiAgICAgKiAgY29sb3I6IChzdHJpbmd8dW5kZWZpbmVkKSxcbiAgICAgKiB9fVxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIGNyZWF0ZUxvYWRlckxvZ28oKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbXBsQ2xhc3NfXG4gICAgICAgID8gdGhpcy5pbXBsQ2xhc3NfLmNyZWF0ZUxvYWRlckxvZ29DYWxsYmFjayh0aGlzKVxuICAgICAgICA6IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGVsZW1lbnQgc2hvdWxkIGV2ZXIgcmVuZGVyIHdoZW4gaXQgaXMgbm90IGluIHZpZXdwb3J0LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW58bnVtYmVyfVxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIHJlbmRlck91dHNpZGVWaWV3cG9ydCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmltcGxfID8gdGhpcy5pbXBsXy5yZW5kZXJPdXRzaWRlVmlld3BvcnQoKSA6IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGVsZW1lbnQgc2hvdWxkIHJlbmRlciBvdXRzaWRlIG9mIHJlbmRlck91dHNpZGVWaWV3cG9ydCB3aGVuXG4gICAgICogdGhlIHNjaGVkdWxlciBpcyBpZGxlLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW58bnVtYmVyfVxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIGlkbGVSZW5kZXJPdXRzaWRlVmlld3BvcnQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbXBsXyA/IHRoaXMuaW1wbF8uaWRsZVJlbmRlck91dHNpZGVWaWV3cG9ydCgpIDogZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHByZXZpb3VzbHkgbWVhc3VyZWQgbGF5b3V0IGJveCBhZGp1c3RlZCB0byB0aGUgdmlld3BvcnQuIFRoaXNcbiAgICAgKiBtYWlubHkgYWZmZWN0cyBmaXhlZC1wb3NpdGlvbiBlbGVtZW50cyB0aGF0IGFyZSBhZGp1c3RlZCB0byBiZSBhbHdheXNcbiAgICAgKiByZWxhdGl2ZSB0byB0aGUgZG9jdW1lbnQgcG9zaXRpb24gaW4gdGhlIHZpZXdwb3J0LlxuICAgICAqIEByZXR1cm4geyEuL2xheW91dC1yZWN0LkxheW91dFJlY3REZWZ9XG4gICAgICogQGZpbmFsXG4gICAgICovXG4gICAgZ2V0TGF5b3V0Qm94KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVzb3VyY2VfKCkuZ2V0TGF5b3V0Qm94KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHByZXZpb3VzbHkgbWVhc3VyZWQgbGF5b3V0IHNpemUuXG4gICAgICogQHJldHVybiB7IS4vbGF5b3V0LXJlY3QuTGF5b3V0U2l6ZURlZn1cbiAgICAgKiBAZmluYWxcbiAgICAgKi9cbiAgICBnZXRMYXlvdXRTaXplKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVzb3VyY2VfKCkuZ2V0TGF5b3V0U2l6ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4gez9FbGVtZW50fVxuICAgICAqIEBmaW5hbFxuICAgICAqL1xuICAgIGdldE93bmVyKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVzb3VyY2VfKCkuZ2V0T3duZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgY2hhbmdlIGVudHJ5IGZvciB0aGF0IHNob3VsZCBiZSBjb21wYXRpYmxlIHdpdGhcbiAgICAgKiBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5LlxuICAgICAqIEByZXR1cm4gez9JbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5fSBBIGNoYW5nZSBlbnRyeS5cbiAgICAgKiBAZmluYWxcbiAgICAgKi9cbiAgICBnZXRJbnRlcnNlY3Rpb25DaGFuZ2VFbnRyeSgpIHtcbiAgICAgIGNvbnN0IGJveCA9IHRoaXMuaW1wbF9cbiAgICAgICAgPyB0aGlzLmltcGxfLmdldEludGVyc2VjdGlvbkVsZW1lbnRMYXlvdXRCb3goKVxuICAgICAgICA6IHRoaXMuZ2V0TGF5b3V0Qm94KCk7XG4gICAgICBjb25zdCBvd25lciA9IHRoaXMuZ2V0T3duZXIoKTtcbiAgICAgIGNvbnN0IHZpZXdwb3J0ID0gU2VydmljZXMudmlld3BvcnRGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSk7XG4gICAgICBjb25zdCB2aWV3cG9ydEJveCA9IHZpZXdwb3J0LmdldFJlY3QoKTtcbiAgICAgIC8vIFRPRE8oanJpZGdld2VsbCwgIzQ4MjYpOiBXZSBtYXkgbmVlZCB0byBtYWtlIHRoaXMgcmVjdXJzaXZlLlxuICAgICAgY29uc3Qgb3duZXJCb3ggPSBvd25lciAmJiBvd25lci5nZXRMYXlvdXRCb3goKTtcbiAgICAgIHJldHVybiBnZXRJbnRlcnNlY3Rpb25DaGFuZ2VFbnRyeShib3gsIG93bmVyQm94LCB2aWV3cG9ydEJveCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcmVzb3VyY2Ugb2YgdGhlIGVsZW1lbnQuXG4gICAgICogQHJldHVybiB7IS4vc2VydmljZS9yZXNvdXJjZS5SZXNvdXJjZX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFJlc291cmNlXygpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlc291cmNlcygpLmdldFJlc291cmNlRm9yRWxlbWVudCh0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSByZXNvdXJjZSBJRCBvZiB0aGUgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0UmVzb3VyY2VJZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlc291cmNlXygpLmdldElkKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIHJ1bnRpbWUgY2FsbHMgdGhpcyBtZXRob2QgdG8gZGV0ZXJtaW5lIGlmIHtAbGluayBsYXlvdXRDYWxsYmFja31cbiAgICAgKiBzaG91bGQgYmUgY2FsbGVkIGFnYWluIHdoZW4gbGF5b3V0IGNoYW5nZXMuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKiBAcGFja2FnZSBAZmluYWxcbiAgICAgKiBUT0RPKCMzMTkxNSk6IHJlbW92ZSBvbmNlIFIxIG1pZ3JhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICAgKi9cbiAgICBpc1JlbGF5b3V0TmVlZGVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW1wbF8gPyB0aGlzLmltcGxfLmlzUmVsYXlvdXROZWVkZWQoKSA6IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgcmVmZXJlbmNlIHRvIHVwZ3JhZGVkIGltcGxlbWVudGF0aW9uLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gd2FpdEZvckJ1aWxkIElmIHRydWUsIHdhaXRzIGZvciBlbGVtZW50IHRvIGJlIGJ1aWx0IGJlZm9yZVxuICAgICAqICAgcmVzb2x2aW5nIHRoZSByZXR1cm5lZCBQcm9taXNlLiBEZWZhdWx0IGlzIHRydWUuXG4gICAgICogQHJldHVybiB7IVByb21pc2U8IS4vYmFzZS1lbGVtZW50LkJhc2VFbGVtZW50Pn1cbiAgICAgKi9cbiAgICBnZXRJbXBsKHdhaXRGb3JCdWlsZCA9IHRydWUpIHtcbiAgICAgIGNvbnN0IHdhaXRGb3IgPSB3YWl0Rm9yQnVpbGQgPyB0aGlzLmJ1aWxkKCkgOiB0aGlzLmNyZWF0ZUltcGxfKCk7XG4gICAgICByZXR1cm4gd2FpdEZvci50aGVuKCgpID0+IHRoaXMuaW1wbF8pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4geyFQcm9taXNlPCEuL2Jhc2UtZWxlbWVudC5CYXNlRWxlbWVudD59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjcmVhdGVJbXBsXygpIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZ25hbHNfXG4gICAgICAgIC53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuUkVBRFlfVE9fVVBHUkFERSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMudHJ5VXBncmFkZV8oKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy53aGVuVXBncmFkZWQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgb2JqZWN0IHdoaWNoIGhvbGRzIHRoZSBBUEkgc3VyZmFjZSAodGhlIHRoaW5nIHdlIGFkZCB0aGVcbiAgICAgKiBjdXN0b20gbWV0aG9kcy9wcm9wZXJ0aWVzIG9udG8pLiBJbiBCZW50bywgdGhpcyBpcyB0aGUgaW1wZXJhdGl2ZSBBUElcbiAgICAgKiBvYmplY3QuIEluIEFNUCwgdGhpcyBpcyB0aGUgQmFzZUVsZW1lbnQgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhT2JqZWN0Pn1cbiAgICAgKi9cbiAgICBnZXRBcGkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRJbXBsKCkudGhlbigoaW1wbCkgPT4gaW1wbC5nZXRBcGkoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbGF5b3V0IG9mIHRoZSBlbGVtZW50LlxuICAgICAqIEByZXR1cm4geyFMYXlvdXR9XG4gICAgICovXG4gICAgZ2V0TGF5b3V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMubGF5b3V0XztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnN0cnVjdHMgdGhlIGVsZW1lbnQgdG8gbGF5b3V0IGl0cyBjb250ZW50IGFuZCBsb2FkIGl0cyByZXNvdXJjZXMgaWZcbiAgICAgKiBuZWNlc3NhcnkgYnkgY2FsbGluZyB0aGUge0BsaW5rIEJhc2VFbGVtZW50LmxheW91dENhbGxiYWNrfSBtZXRob2QgdGhhdFxuICAgICAqIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBieSBCYXNlRWxlbWVudCBzdWJjbGFzc2VzLiBNdXN0IHJldHVybiBhIHByb21pc2VcbiAgICAgKiB0aGF0IHdpbGwgeWllbGQgd2hlbiB0aGUgbGF5b3V0IGFuZCBhc3NvY2lhdGVkIGxvYWRpbmdzIGFyZSBjb21wbGV0ZS5cbiAgICAgKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGFsd2F5cyBjYWxsZWQgZm9yIHRoZSBmaXJzdCBsYXlvdXQsIGJ1dCBmb3Igc3Vic2VxdWVudFxuICAgICAqIGxheW91dHMgdGhlIHJ1bnRpbWUgY29uc3VsdHMge0BsaW5rIGlzUmVsYXlvdXROZWVkZWR9IG1ldGhvZC5cbiAgICAgKlxuICAgICAqIENhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIHVwZ3JhZGVkIGFuZCBidWlsdCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHshQWJvcnRTaWduYWx9IHNpZ25hbFxuICAgICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgICAqIEBwYWNrYWdlIEBmaW5hbFxuICAgICAqIFRPRE8oIzMxOTE1KTogcmVtb3ZlIG9uY2UgUjEgbWlncmF0aW9uIGlzIGNvbXBsZXRlLlxuICAgICAqL1xuICAgIGxheW91dENhbGxiYWNrKHNpZ25hbCkge1xuICAgICAgYXNzZXJ0Tm90VGVtcGxhdGUodGhpcyk7XG4gICAgICBkZXZBc3NlcnQodGhpcy5pc0J1aWx0KCksICdNdXN0IGJlIGJ1aWx0IHRvIHJlY2VpdmUgdmlld3BvcnQgZXZlbnRzJyk7XG4gICAgICAvLyBBIGxvdCBvZiB0ZXN0cyBjYWxsIGxheW91dENhbGxiYWNrIG1hbnVhbGx5LCBhbmQgZG9uJ3QgcGFzcyBhIHNpZ25hbC5cbiAgICAgIGlmICgoIWdldE1vZGUoKS50ZXN0IHx8IHNpZ25hbCkgJiYgc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGNhbmNlbGxhdGlvbigpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5kaXNwYXRjaEN1c3RvbUV2ZW50Rm9yVGVzdGluZyhBbXBFdmVudHMuTE9BRF9TVEFSVCk7XG4gICAgICBjb25zdCBpc0xvYWRFdmVudCA9IHRoaXMubGF5b3V0Q291bnRfID09IDA7IC8vIEZpcnN0IGxheW91dCBpcyBcImxvYWRcIi5cbiAgICAgIHRoaXMuc2lnbmFsc18ucmVzZXQoQ29tbW9uU2lnbmFscy5VTkxPQUQpO1xuICAgICAgaWYgKGlzTG9hZEV2ZW50KSB7XG4gICAgICAgIHRoaXMuc2lnbmFsc18uc2lnbmFsKENvbW1vblNpZ25hbHMuTE9BRF9TVEFSVCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBvdGVudGlhbGx5IHN0YXJ0IHRoZSBsb2FkaW5nIGluZGljYXRvci5cbiAgICAgIHRoaXMudG9nZ2xlTG9hZGluZyh0cnVlKTtcblxuICAgICAgY29uc3QgcHJvbWlzZSA9IHRyeVJlc29sdmUoKCkgPT4gdGhpcy5pbXBsXy5sYXlvdXRDYWxsYmFjaygpKTtcbiAgICAgIHRoaXMucHJlY29ubmVjdCgvKiBvbkxheW91dCAqLyB0cnVlKTtcbiAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWxheW91dCcpO1xuXG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgaWYgKCghZ2V0TW9kZSgpLnRlc3QgfHwgc2lnbmFsKSAmJiBzaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgICAgdGhyb3cgY2FuY2VsbGF0aW9uKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpc0xvYWRFdmVudCkge1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzXy5zaWduYWwoQ29tbW9uU2lnbmFscy5MT0FEX0VORCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc2V0UmVhZHlTdGF0ZUludGVybmFsKFJlYWR5U3RhdGUuQ09NUExFVEUpO1xuICAgICAgICAgIHRoaXMubGF5b3V0Q291bnRfKys7XG4gICAgICAgICAgdGhpcy50b2dnbGVMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIHRoZSBmaXJzdCBzdWNjZXNzIGxheW91dCB0aGF0IG5lZWRzXG4gICAgICAgICAgLy8gdG8gY2FsbCBmaXJzdExheW91dENvbXBsZXRlZC5cbiAgICAgICAgICBpZiAoIXRoaXMuaXNGaXJzdExheW91dENvbXBsZXRlZF8pIHtcbiAgICAgICAgICAgIHRoaXMuaW1wbF8uZmlyc3RMYXlvdXRDb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIHRoaXMuaXNGaXJzdExheW91dENvbXBsZXRlZF8gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEN1c3RvbUV2ZW50Rm9yVGVzdGluZyhBbXBFdmVudHMuTE9BRF9FTkQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgKHJlYXNvbikgPT4ge1xuICAgICAgICAgIGlmICgoIWdldE1vZGUoKS50ZXN0IHx8IHNpZ25hbCkgJiYgc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgICAgIHRocm93IGNhbmNlbGxhdGlvbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBhZGQgbGF5b3V0Q291bnRfIGJ5IDEgZGVzcGl0ZSBsb2FkIGZhaWxzIG9yIG5vdFxuICAgICAgICAgIGlmIChpc0xvYWRFdmVudCkge1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzXy5yZWplY3RTaWduYWwoXG4gICAgICAgICAgICAgIENvbW1vblNpZ25hbHMuTE9BRF9FTkQsXG4gICAgICAgICAgICAgIC8qKiBAdHlwZSB7IUVycm9yfSAqLyAocmVhc29uKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zZXRSZWFkeVN0YXRlSW50ZXJuYWwoUmVhZHlTdGF0ZS5FUlJPUiwgcmVhc29uKTtcbiAgICAgICAgICB0aGlzLmxheW91dENvdW50XysrO1xuICAgICAgICAgIHRoaXMudG9nZ2xlTG9hZGluZyhmYWxzZSk7XG4gICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhdXNlcyB0aGUgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwYWNrYWdlIEBmaW5hbFxuICAgICAqL1xuICAgIHBhdXNlKCkge1xuICAgICAgaWYgKCF0aGlzLmlzQnVpbHQoKSkge1xuICAgICAgICAvLyBOb3QgYnVpbHQgeWV0LlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW1wbF8ucGF1c2VDYWxsYmFjaygpO1xuXG4gICAgICAvLyBMZWdhY3kgdW5sYXlvdXRPblBhdXNlIHN1cHBvcnQuXG4gICAgICBpZiAoIXRoaXMuUjEoKSAmJiB0aGlzLmltcGxfLnVubGF5b3V0T25QYXVzZSgpKSB7XG4gICAgICAgIHRoaXMudW5sYXlvdXRfKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdHMgdGhlIHJlc291cmNlIHRvIHJlc3VtZSBpdHMgYWN0aXZpdHkgd2hlbiB0aGUgZG9jdW1lbnQgcmV0dXJuc1xuICAgICAqIGZyb20gYW4gaW5hY3RpdmUgc3RhdGUuIFRoZSBzY29wZSBpcyB1cCB0byB0aGUgYWN0dWFsIGNvbXBvbmVudC4gQW1vbmdcbiAgICAgKiBvdGhlciB0aGluZ3MgdGhlIGFjdGl2ZSBwbGF5YmFjayBvZiB2aWRlbyBvciBhdWRpbyBjb250ZW50IG1heSBiZVxuICAgICAqIHJlc3VtZWQuXG4gICAgICpcbiAgICAgKiBAcGFja2FnZSBAZmluYWxcbiAgICAgKi9cbiAgICByZXN1bWUoKSB7XG4gICAgICBpZiAoIXRoaXMuaXNCdWlsdCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW1wbF8ucmVzdW1lQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0cyB0aGUgZWxlbWVudCB0byB1bmxvYWQgYW55IGV4cGVuc2l2ZSByZXNvdXJjZXMgd2hlbiB0aGUgZWxlbWVudFxuICAgICAqIGdvZXMgaW50byBub24tdmlzaWJsZSBzdGF0ZS4gVGhlIHNjb3BlIGlzIHVwIHRvIHRoZSBhY3R1YWwgY29tcG9uZW50LlxuICAgICAqXG4gICAgICogQ2FsbGluZyB0aGlzIG1ldGhvZCBvbiB1bmJ1aWx0IG9yIHVudXBncmFkZWQgZWxlbWVudCBoYXMgbm8gZWZmZWN0LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKiBAcGFja2FnZSBAZmluYWxcbiAgICAgKiBUT0RPKCMzMTkxNSk6IHJlbW92ZSBvbmNlIFIxIG1pZ3JhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICAgKi9cbiAgICB1bmxheW91dENhbGxiYWNrKCkge1xuICAgICAgYXNzZXJ0Tm90VGVtcGxhdGUodGhpcyk7XG4gICAgICBpZiAoIXRoaXMuaXNCdWlsdCgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2lnbmFsc18uc2lnbmFsKENvbW1vblNpZ25hbHMuVU5MT0FEKTtcbiAgICAgIGNvbnN0IGlzUmVMYXlvdXROZWVkZWQgPSB0aGlzLmltcGxfLnVubGF5b3V0Q2FsbGJhY2soKTtcbiAgICAgIGlmIChpc1JlTGF5b3V0TmVlZGVkKSB7XG4gICAgICAgIHRoaXMucmVzZXRfKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmRpc3BhdGNoQ3VzdG9tRXZlbnRGb3JUZXN0aW5nKEFtcEV2ZW50cy5VTkxPQUQpO1xuICAgICAgcmV0dXJuIGlzUmVMYXlvdXROZWVkZWQ7XG4gICAgfVxuXG4gICAgLyoqIEBwcml2YXRlICovXG4gICAgdW5sYXlvdXRfKCkge1xuICAgICAgdGhpcy5nZXRSZXNvdXJjZV8oKS51bmxheW91dCgpO1xuICAgICAgaWYgKHRoaXMuaXNDb25uZWN0ZWRfICYmIHRoaXMucmVzb3VyY2VzXykge1xuICAgICAgICB0aGlzLnJlc291cmNlc18uLypPSyovIHNjaGVkdWxlUGFzcygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIHJlc2V0XygpIHtcbiAgICAgIHRoaXMubGF5b3V0Q291bnRfID0gMDtcbiAgICAgIHRoaXMuaXNGaXJzdExheW91dENvbXBsZXRlZF8gPSBmYWxzZTtcbiAgICAgIHRoaXMuc2lnbmFsc18ucmVzZXQoQ29tbW9uU2lnbmFscy5NT1VOVEVEKTtcbiAgICAgIHRoaXMuc2lnbmFsc18ucmVzZXQoQ29tbW9uU2lnbmFscy5SRU5ERVJfU1RBUlQpO1xuICAgICAgdGhpcy5zaWduYWxzXy5yZXNldChDb21tb25TaWduYWxzLkxPQURfU1RBUlQpO1xuICAgICAgdGhpcy5zaWduYWxzXy5yZXNldChDb21tb25TaWduYWxzLkxPQURfRU5EKTtcbiAgICAgIHRoaXMuc2lnbmFsc18ucmVzZXQoQ29tbW9uU2lnbmFscy5JTklfTE9BRCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgZWxlbWVudCBuZWVkcyB0byBiZSByZWNvbnN0cnVjdGVkIGFmdGVyIGl0IGhhcyBiZWVuXG4gICAgICogcmUtcGFyZW50ZWQuIE1hbnkgZWxlbWVudHMgY2Fubm90IHN1cnZpdmUgZnVsbHkgdGhlIHJlcGFyZW50aW5nIGFuZFxuICAgICAqIGFyZSBiZXR0ZXIgdG8gYmUgcmVjb25zdHJ1Y3RlZCBmcm9tIHNjcmF0Y2guXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqIEBwYWNrYWdlIEBmaW5hbFxuICAgICAqL1xuICAgIHJlY29uc3RydWN0V2hlblJlcGFyZW50ZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbXBsXyA/IHRoaXMuaW1wbF8ucmVjb25zdHJ1Y3RXaGVuUmVwYXJlbnRlZCgpIDogZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29sbGFwc2VzIHRoZSBlbGVtZW50LCBhbmQgbm90aWZpZXMgaXRzIG93bmVyIChpZiB0aGVyZSBpcyBvbmUpIHRoYXQgdGhlXG4gICAgICogZWxlbWVudCBpcyBubyBsb25nZXIgcHJlc2VudC5cbiAgICAgKi9cbiAgICBjb2xsYXBzZSgpIHtcbiAgICAgIGlmICh0aGlzLmltcGxfKSB7XG4gICAgICAgIHRoaXMuaW1wbF8uLypPSyovIGNvbGxhcHNlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGV2ZXJ5IHRpbWUgYW4gb3duZWQgQW1wRWxlbWVudCBjb2xsYXBzZXMgaXRzZWxmLlxuICAgICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBjb2xsYXBzZWRDYWxsYmFjayhlbGVtZW50KSB7XG4gICAgICBpZiAodGhpcy5pbXBsXykge1xuICAgICAgICB0aGlzLmltcGxfLmNvbGxhcHNlZENhbGxiYWNrKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4cGFuZHMgdGhlIGVsZW1lbnQsIGFuZCBub3RpZmllcyBpdHMgb3duZXIgKGlmIHRoZXJlIGlzIG9uZSkgdGhhdCB0aGVcbiAgICAgKiBlbGVtZW50IGlzIG5vdyBwcmVzZW50LlxuICAgICAqL1xuICAgIGV4cGFuZCgpIHtcbiAgICAgIGlmICh0aGlzLmltcGxfKSB7XG4gICAgICAgIHRoaXMuaW1wbF8uLypPSyovIGV4cGFuZCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCB3aGVuIG9uZSBvciBtb3JlIGF0dHJpYnV0ZXMgYXJlIG11dGF0ZWQuXG4gICAgICogTm90ZTogTXVzdCBiZSBjYWxsZWQgaW5zaWRlIGEgbXV0YXRlIGNvbnRleHQuXG4gICAgICogTm90ZTogQm9vbGVhbiBhdHRyaWJ1dGVzIGhhdmUgYSB2YWx1ZSBvZiBgdHJ1ZWAgYW5kIGBmYWxzZWAgd2hlblxuICAgICAqICAgICBwcmVzZW50IGFuZCBtaXNzaW5nLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHshSnNvbk9iamVjdDxzdHJpbmcsIChudWxsfGJvb2xlYW58c3RyaW5nfG51bWJlcnxBcnJheXxPYmplY3QpPn0gbXV0YXRpb25zXG4gICAgICovXG4gICAgbXV0YXRlZEF0dHJpYnV0ZXNDYWxsYmFjayhtdXRhdGlvbnMpIHtcbiAgICAgIGlmICh0aGlzLmltcGxfKSB7XG4gICAgICAgIHRoaXMuaW1wbF8ubXV0YXRlZEF0dHJpYnV0ZXNDYWxsYmFjayhtdXRhdGlvbnMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVucXVldWVzIHRoZSBhY3Rpb24gd2l0aCB0aGUgZWxlbWVudC4gSWYgZWxlbWVudCBoYXMgYmVlbiB1cGdyYWRlZCBhbmRcbiAgICAgKiBidWlsdCwgdGhlIGFjdGlvbiBpcyBkaXNwYXRjaGVkIHRvIHRoZSBpbXBsZW1lbnRhdGlvbiByaWdodCBhd2F5LlxuICAgICAqIE90aGVyd2lzZSB0aGUgaW52b2NhdGlvbiBpcyBlbnF1ZXVlZCB1bnRpbCB0aGUgaW1wbGVtZW50YXRpb24gaXMgcmVhZHlcbiAgICAgKiB0byByZWNlaXZlIGFjdGlvbnMuXG4gICAgICogQHBhcmFtIHshLi9zZXJ2aWNlL2FjdGlvbi1pbXBsLkFjdGlvbkludm9jYXRpb259IGludm9jYXRpb25cbiAgICAgKiBAZmluYWxcbiAgICAgKi9cbiAgICBlbnF1ZUFjdGlvbihpbnZvY2F0aW9uKSB7XG4gICAgICBhc3NlcnROb3RUZW1wbGF0ZSh0aGlzKTtcbiAgICAgIGlmICghdGhpcy5pc0J1aWx0KCkpIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aW9uUXVldWVfID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLmFjdGlvblF1ZXVlXyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGRldkFzc2VydCh0aGlzLmFjdGlvblF1ZXVlXykucHVzaChpbnZvY2F0aW9uKTtcbiAgICAgICAgLy8gU2NoZWR1bGUgYnVpbGQgc29vbmVyLlxuICAgICAgICB0aGlzLmJ1aWxkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmV4ZWN1dGlvbkFjdGlvbl8oaW52b2NhdGlvbiwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlcXVldWVzIGV2ZW50cyBmcm9tIHRoZSBxdWV1ZSBhbmQgZGlzcGF0Y2hlcyB0aGVtIHRvIHRoZSBpbXBsZW1lbnRhdGlvblxuICAgICAqIHdpdGggXCJkZWZlcnJlZFwiIGZsYWcuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBkZXF1ZXVlQWN0aW9uc18oKSB7XG4gICAgICBpZiAoIXRoaXMuYWN0aW9uUXVldWVfKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYWN0aW9uUXVldWUgPSBkZXZBc3NlcnQodGhpcy5hY3Rpb25RdWV1ZV8pO1xuICAgICAgdGhpcy5hY3Rpb25RdWV1ZV8gPSBudWxsO1xuXG4gICAgICAvLyBOb3RpY2UsIHRoZSBhY3Rpb25zIGFyZSBjdXJyZW50bHkgbm90IGRlLWR1cGVkLlxuICAgICAgYWN0aW9uUXVldWUuZm9yRWFjaCgoaW52b2NhdGlvbikgPT4ge1xuICAgICAgICB0aGlzLmV4ZWN1dGlvbkFjdGlvbl8oaW52b2NhdGlvbiwgdHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgYWN0aW9uIGltbWVkaWF0ZWx5LiBBbGwgZXJyb3JzIGFyZSBjb25zdW1lZCBhbmQgcmVwb3J0ZWQuXG4gICAgICogQHBhcmFtIHshLi9zZXJ2aWNlL2FjdGlvbi1pbXBsLkFjdGlvbkludm9jYXRpb259IGludm9jYXRpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGRlZmVycmVkXG4gICAgICogQGZpbmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBleGVjdXRpb25BY3Rpb25fKGludm9jYXRpb24sIGRlZmVycmVkKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmltcGxfLmV4ZWN1dGVBY3Rpb24oaW52b2NhdGlvbiwgZGVmZXJyZWQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXRocm93QXN5bmMoXG4gICAgICAgICAgJ0FjdGlvbiBleGVjdXRpb24gZmFpbGVkOicsXG4gICAgICAgICAgZSxcbiAgICAgICAgICBpbnZvY2F0aW9uLm5vZGUudGFnTmFtZSxcbiAgICAgICAgICBpbnZvY2F0aW9uLm1ldGhvZFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY29uc2VudCBwb2xpY3kgdG8gZm9sbG93LlxuICAgICAqIEByZXR1cm4gez9zdHJpbmd9XG4gICAgICovXG4gICAgZ2V0Q29uc2VudFBvbGljeV8oKSB7XG4gICAgICBsZXQgcG9saWN5SWQgPSB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS1ibG9jay1vbi1jb25zZW50Jyk7XG4gICAgICBpZiAocG9saWN5SWQgPT09IG51bGwpIHtcbiAgICAgICAgaWYgKHNob3VsZEJsb2NrT25Db25zZW50QnlNZXRhKHRoaXMpKSB7XG4gICAgICAgICAgcG9saWN5SWQgPSAnZGVmYXVsdCc7XG4gICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtYmxvY2stb24tY29uc2VudCcsIHBvbGljeUlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBkYXRhLWJsb2NrLW9uLWNvbnNlbnQgYXR0cmlidXRlIG5vdCBzZXRcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHBvbGljeUlkID09ICcnIHx8IHBvbGljeUlkID09ICdkZWZhdWx0Jykge1xuICAgICAgICAvLyBkYXRhLWJsb2NrLW9uLWNvbnNlbnQgdmFsdWUgbm90IHNldCwgdXAgdG8gaW5kaXZpZHVhbCBlbGVtZW50XG4gICAgICAgIC8vIE5vdGU6IGRhdGEtYmxvY2stb24tY29uc2VudCBhbmQgZGF0YS1ibG9jay1vbi1jb25zZW50PSdkZWZhdWx0JyBpc1xuICAgICAgICAvLyB0cmVhdGVkIGV4YWN0bHkgdGhlIHNhbWVcbiAgICAgICAgcmV0dXJuIGRldkFzc2VydCh0aGlzLmltcGxfKS5nZXRDb25zZW50UG9saWN5KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcG9saWN5SWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBwdXJwb3NlIGNvbnNlbnRzIHRoYXQgc2hvdWxkIGJlIGdyYW50ZWQuXG4gICAgICogQHJldHVybiB7QXJyYXk8c3RyaW5nPnx1bmRlZmluZWR9XG4gICAgICovXG4gICAgZ2V0UHVycG9zZXNDb25zZW50XygpIHtcbiAgICAgIGNvbnN0IHB1cnBvc2VzID1cbiAgICAgICAgdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtYmxvY2stb24tY29uc2VudC1wdXJwb3NlcycpIHx8IG51bGw7XG4gICAgICByZXR1cm4gcHVycG9zZXM/LnJlcGxhY2UoL1xccysvZywgJycpPy5zcGxpdCgnLCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gb3B0aW9uYWwgcGxhY2Vob2xkZXIgZWxlbWVudCBmb3IgdGhpcyBjdXN0b20gZWxlbWVudC5cbiAgICAgKiBAcmV0dXJuIHs/RWxlbWVudH1cbiAgICAgKiBAcGFja2FnZSBAZmluYWxcbiAgICAgKi9cbiAgICBnZXRQbGFjZWhvbGRlcigpIHtcbiAgICAgIHJldHVybiBxdWVyeS5sYXN0Q2hpbGRFbGVtZW50KHRoaXMsIChlbCkgPT4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIGVsLmhhc0F0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSAmJlxuICAgICAgICAgIC8vIERlbnlsaXN0IGVsZW1lbnRzIHRoYXQgaGFzIGEgbmF0aXZlIHBsYWNlaG9sZGVyIHByb3BlcnR5XG4gICAgICAgICAgLy8gbGlrZSBpbnB1dCBhbmQgdGV4dGFyZWEuIFRoZXNlIGFyZSBub3QgYWxsb3dlZCB0byBiZSBBTVBcbiAgICAgICAgICAvLyBwbGFjZWhvbGRlcnMuXG4gICAgICAgICAgIWlzSW5wdXRQbGFjZWhvbGRlcihlbClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhpZGVzIG9yIHNob3dzIHRoZSBwbGFjZWhvbGRlciwgaWYgYXZhaWxhYmxlLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2hvd1xuICAgICAqIEBwYWNrYWdlIEBmaW5hbFxuICAgICAqL1xuICAgIHRvZ2dsZVBsYWNlaG9sZGVyKHNob3cpIHtcbiAgICAgIGFzc2VydE5vdFRlbXBsYXRlKHRoaXMpO1xuICAgICAgaWYgKHNob3cpIHtcbiAgICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSB0aGlzLmdldFBsYWNlaG9sZGVyKCk7XG4gICAgICAgIGlmIChwbGFjZWhvbGRlcikge1xuICAgICAgICAgIGRldigpLmFzc2VydEVsZW1lbnQocGxhY2Vob2xkZXIpLmNsYXNzTGlzdC5yZW1vdmUoJ2FtcC1oaWRkZW4nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcGxhY2Vob2xkZXJzID0gcXVlcnkuY2hpbGRFbGVtZW50c0J5QXR0cih0aGlzLCAncGxhY2Vob2xkZXInKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGFjZWhvbGRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAvLyBEb24ndCB0b2dnbGUgZWxlbWVudHMgd2l0aCBhIG5hdGl2ZSBwbGFjZWhvbGRlciBwcm9wZXJ0eVxuICAgICAgICAgIC8vIGUuZy4gaW5wdXQsIHRleHRhcmVhXG4gICAgICAgICAgaWYgKGlzSW5wdXRQbGFjZWhvbGRlcihwbGFjZWhvbGRlcnNbaV0pKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGxhY2Vob2xkZXJzW2ldLmNsYXNzTGlzdC5hZGQoJ2FtcC1oaWRkZW4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gb3B0aW9uYWwgZmFsbGJhY2sgZWxlbWVudCBmb3IgdGhpcyBjdXN0b20gZWxlbWVudC5cbiAgICAgKiBAcmV0dXJuIHs/RWxlbWVudH1cbiAgICAgKiBAcGFja2FnZSBAZmluYWxcbiAgICAgKi9cbiAgICBnZXRGYWxsYmFjaygpIHtcbiAgICAgIHJldHVybiBxdWVyeS5jaGlsZEVsZW1lbnRCeUF0dHIodGhpcywgJ2ZhbGxiYWNrJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGlkZXMgb3Igc2hvd3MgdGhlIGZhbGxiYWNrLCBpZiBhdmFpbGFibGUuIFRoaXMgZnVuY3Rpb24gbXVzdCBvbmx5XG4gICAgICogYmUgY2FsbGVkIGluc2lkZSBhIG11dGF0ZSBjb250ZXh0LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2hvd1xuICAgICAqIEBwYWNrYWdlIEBmaW5hbFxuICAgICAqL1xuICAgIHRvZ2dsZUZhbGxiYWNrKHNob3cpIHtcbiAgICAgIGFzc2VydE5vdFRlbXBsYXRlKHRoaXMpO1xuICAgICAgY29uc3QgcmVzb3VyY2VTdGF0ZSA9IHRoaXMuZ2V0UmVzb3VyY2VfKCkuZ2V0U3RhdGUoKTtcbiAgICAgIC8vIERvIG5vdCBzaG93IGZhbGxiYWNrIGJlZm9yZSBsYXlvdXRcbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuUjEoKSAmJlxuICAgICAgICBzaG93ICYmXG4gICAgICAgIChyZXNvdXJjZVN0YXRlID09IFJlc291cmNlU3RhdGUuTk9UX0JVSUxUIHx8XG4gICAgICAgICAgcmVzb3VyY2VTdGF0ZSA9PSBSZXNvdXJjZVN0YXRlLk5PVF9MQUlEX09VVCB8fFxuICAgICAgICAgIHJlc291cmNlU3RhdGUgPT0gUmVzb3VyY2VTdGF0ZS5SRUFEWV9GT1JfTEFZT1VUKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFRoaXMgaW1wbGVtZW50YXRpb24gaXMgbm90YWJseSBsZXNzIGVmZmljaWVudCB0aGVuIHBsYWNlaG9sZGVyXG4gICAgICAvLyB0b2dnbGluZy4gVGhlIHJlYXNvbnMgZm9yIHRoaXMgYXJlOiAoYSkgXCJub3Qgc3VwcG9ydGVkXCIgaXMgdGhlIHN0YXRlIG9mXG4gICAgICAvLyB0aGUgd2hvbGUgZWxlbWVudCwgKGIpIHNvbWUgcmVsYXlvdXQgaXMgZXhwZWN0ZWQgYW5kIChjKSBmYWxsYmFja1xuICAgICAgLy8gY29uZGl0aW9uIHdvdWxkIGJlIHJhcmUuXG4gICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2FtcC1ub3RzdXBwb3J0ZWQnLCBzaG93KTtcbiAgICAgIGlmIChzaG93ID09IHRydWUpIHtcbiAgICAgICAgY29uc3QgZmFsbGJhY2tFbGVtZW50ID0gdGhpcy5nZXRGYWxsYmFjaygpO1xuICAgICAgICBpZiAoZmFsbGJhY2tFbGVtZW50KSB7XG4gICAgICAgICAgU2VydmljZXMub3duZXJzRm9yRG9jKHRoaXMuZ2V0QW1wRG9jKCkpLnNjaGVkdWxlTGF5b3V0KFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGZhbGxiYWNrRWxlbWVudFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbiBpbXBsZW1lbnRhdGlvbiBjYW4gY2FsbCB0aGlzIG1ldGhvZCB0byBzaWduYWwgdG8gdGhlIGVsZW1lbnQgdGhhdFxuICAgICAqIGl0IGhhcyBzdGFydGVkIHJlbmRlcmluZy5cbiAgICAgKiBAcGFja2FnZSBAZmluYWxcbiAgICAgKi9cbiAgICByZW5kZXJTdGFydGVkKCkge1xuICAgICAgdGhpcy5zaWduYWxzXy5zaWduYWwoQ29tbW9uU2lnbmFscy5SRU5ERVJfU1RBUlQpO1xuICAgICAgdGhpcy50b2dnbGVQbGFjZWhvbGRlcihmYWxzZSk7XG4gICAgICB0aGlzLnRvZ2dsZUxvYWRpbmcoZmFsc2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGxvYWRpbmcgY2FuIGJlIHNob3duIGZvciB0aGlzIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBmb3JjZVxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBpc0xvYWRpbmdFbmFibGVkXyhmb3JjZSkge1xuICAgICAgLy8gTm8gbG9hZGluZyBpbmRpY2F0b3Igd2lsbCBiZSBzaG93biBpZiBlaXRoZXIgb25lIG9mIHRoZXNlIGNvbmRpdGlvbnNcbiAgICAgIC8vIHRydWU6XG4gICAgICAvLyAxLiBUaGUgZG9jdW1lbnQgaXMgQTRBLlxuICAgICAgLy8gMi4gYG5vbG9hZGluZ2AgYXR0cmlidXRlIGlzIHNwZWNpZmllZDtcbiAgICAgIC8vIDMuIFRoZSBlbGVtZW50IGhhcyBhbHJlYWR5IGJlZW4gbGFpZCBvdXQsIGFuZCBkb2VzIG5vdCBzdXBwb3J0IHJlc2hvd2luZyB0aGUgaW5kaWNhdG9yIChpbmNsdWRlIGhhdmluZyBsb2FkaW5nXG4gICAgICAvLyAgICBlcnJvcik7XG4gICAgICAvLyA0LiBUaGUgZWxlbWVudCBpcyB0b28gc21hbGwgb3IgaGFzIG5vdCB5ZXQgYmVlbiBtZWFzdXJlZDtcbiAgICAgIC8vIDUuIFRoZSBlbGVtZW50IGhhcyBub3QgYmVlbiBhbGxvd2xpc3RlZDtcbiAgICAgIC8vIDYuIFRoZSBlbGVtZW50IGlzIGFuIGludGVybmFsIG5vZGUgKGUuZy4gYHBsYWNlaG9sZGVyYCBvciBgZmFsbGJhY2tgKTtcbiAgICAgIC8vIDcuIFRoZSBlbGVtZW50J3MgbGF5b3V0IGlzIG5vdCBub2Rpc3BsYXkuXG5cbiAgICAgIGNvbnN0IGxhaWRPdXQgPVxuICAgICAgICB0aGlzLmxheW91dENvdW50XyA+IDAgfHwgdGhpcy5zaWduYWxzXy5nZXQoQ29tbW9uU2lnbmFscy5SRU5ERVJfU1RBUlQpO1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmxheW91dF8gPT0gTGF5b3V0Lk5PRElTUExBWSB8fFxuICAgICAgICB0aGlzLmhhc0F0dHJpYnV0ZSgnbm9sb2FkaW5nJykgfHxcbiAgICAgICAgKGxhaWRPdXQgJiYgIWZvcmNlKSB8fFxuICAgICAgICAhaXNMb2FkaW5nQWxsb3dlZCh0aGlzKSB8fFxuICAgICAgICBxdWVyeS5pc0ludGVybmFsT3JTZXJ2aWNlTm9kZSh0aGlzKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHVybnMgdGhlIGxvYWRpbmcgaW5kaWNhdG9yIG9uIG9yIG9mZi5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXRlXG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gZm9yY2VcbiAgICAgKiBAcHVibGljIEBmaW5hbFxuICAgICAqL1xuICAgIHRvZ2dsZUxvYWRpbmcoc3RhdGUsIGZvcmNlID0gZmFsc2UpIHtcbiAgICAgIC8vIFRPRE8oZHZveXRlbmtvLCAjOTE3Nyk6IGNsZWFudXAgYHRoaXMub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlld2BcbiAgICAgIC8vIG9uY2UgaW52ZXN0aWdhdGlvbiBpcyBjb21wbGV0ZS4gSXQgYXBwZWFycyB0aGF0IHdlIGdldCBhIGxvdCBvZlxuICAgICAgLy8gZXJyb3JzIGhlcmUgb25jZSB0aGUgaWZyYW1lIGlzIGRlc3Ryb3llZCBkdWUgdG8gdGltZXIuXG4gICAgICBpZiAoIXRoaXMub3duZXJEb2N1bWVudCB8fCAhdGhpcy5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbG9hZGluZ0luZGljYXRvciA9IFNlcnZpY2VzLmxvYWRpbmdJbmRpY2F0b3JPck51bGwoXG4gICAgICAgIHRoaXMuZ2V0QW1wRG9jKClcbiAgICAgICk7XG4gICAgICBpZiAobG9hZGluZ0luZGljYXRvcikge1xuICAgICAgICBzdGF0ZSA9IHN0YXRlICYmIHRoaXMuaXNMb2FkaW5nRW5hYmxlZF8oZm9yY2UpO1xuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICBsb2FkaW5nSW5kaWNhdG9yLnRyYWNrKHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvYWRpbmdJbmRpY2F0b3IudW50cmFjayh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gb3B0aW9uYWwgb3ZlcmZsb3cgZWxlbWVudCBmb3IgdGhpcyBjdXN0b20gZWxlbWVudC5cbiAgICAgKiBAcmV0dXJuIHs/RWxlbWVudH1cbiAgICAgKi9cbiAgICBnZXRPdmVyZmxvd0VsZW1lbnQoKSB7XG4gICAgICBpZiAodGhpcy5vdmVyZmxvd0VsZW1lbnRfID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5vdmVyZmxvd0VsZW1lbnRfID0gcXVlcnkuY2hpbGRFbGVtZW50QnlBdHRyKHRoaXMsICdvdmVyZmxvdycpO1xuICAgICAgICBpZiAodGhpcy5vdmVyZmxvd0VsZW1lbnRfKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLm92ZXJmbG93RWxlbWVudF8uaGFzQXR0cmlidXRlKCd0YWJpbmRleCcpKSB7XG4gICAgICAgICAgICB0aGlzLm92ZXJmbG93RWxlbWVudF8uc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghdGhpcy5vdmVyZmxvd0VsZW1lbnRfLmhhc0F0dHJpYnV0ZSgncm9sZScpKSB7XG4gICAgICAgICAgICB0aGlzLm92ZXJmbG93RWxlbWVudF8uc2V0QXR0cmlidXRlKCdyb2xlJywgJ2J1dHRvbicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub3ZlcmZsb3dFbGVtZW50XztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIaWRlcyBvciBzaG93cyB0aGUgb3ZlcmZsb3csIGlmIGF2YWlsYWJsZS4gVGhpcyBmdW5jdGlvbiBtdXN0IG9ubHlcbiAgICAgKiBiZSBjYWxsZWQgaW5zaWRlIGEgbXV0YXRlIGNvbnRleHQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBvdmVyZmxvd25cbiAgICAgKiBAcGFyYW0ge251bWJlcnx1bmRlZmluZWR9IHJlcXVlc3RlZEhlaWdodFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfHVuZGVmaW5lZH0gcmVxdWVzdGVkV2lkdGhcbiAgICAgKiBAcGFja2FnZSBAZmluYWxcbiAgICAgKi9cbiAgICBvdmVyZmxvd0NhbGxiYWNrKG92ZXJmbG93biwgcmVxdWVzdGVkSGVpZ2h0LCByZXF1ZXN0ZWRXaWR0aCkge1xuICAgICAgdGhpcy5nZXRPdmVyZmxvd0VsZW1lbnQoKTtcbiAgICAgIGlmICghdGhpcy5vdmVyZmxvd0VsZW1lbnRfKSB7XG4gICAgICAgIGlmIChvdmVyZmxvd24gJiYgdGhpcy53YXJuT25NaXNzaW5nT3ZlcmZsb3cpIHtcbiAgICAgICAgICB1c2VyKCkud2FybihcbiAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgICdDYW5ub3QgcmVzaXplIGVsZW1lbnQgYW5kIG92ZXJmbG93IGlzIG5vdCBhdmFpbGFibGUnLFxuICAgICAgICAgICAgdGhpc1xuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub3ZlcmZsb3dFbGVtZW50Xy5jbGFzc0xpc3QudG9nZ2xlKCdhbXAtdmlzaWJsZScsIG92ZXJmbG93bik7XG5cbiAgICAgICAgaWYgKG92ZXJmbG93bikge1xuICAgICAgICAgIHRoaXMub3ZlcmZsb3dFbGVtZW50Xy5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbXV0YXRvciA9IFNlcnZpY2VzLm11dGF0b3JGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSk7XG4gICAgICAgICAgICBtdXRhdG9yLmZvcmNlQ2hhbmdlU2l6ZSh0aGlzLCByZXF1ZXN0ZWRIZWlnaHQsIHJlcXVlc3RlZFdpZHRoKTtcbiAgICAgICAgICAgIG11dGF0b3IubXV0YXRlRWxlbWVudCh0aGlzLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMub3ZlcmZsb3dDYWxsYmFjayhcbiAgICAgICAgICAgICAgICAvKiBvdmVyZmxvd24gKi8gZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVxdWVzdGVkSGVpZ2h0LFxuICAgICAgICAgICAgICAgIHJlcXVlc3RlZFdpZHRoXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMub3ZlcmZsb3dFbGVtZW50Xy5vbmNsaWNrID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE11dGF0ZXMgdGhlIGVsZW1lbnQgdXNpbmcgcmVzb3VyY2VzIGlmIGF2YWlsYWJsZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gbXV0YXRvclxuICAgICAqIEBwYXJhbSB7P0VsZW1lbnQ9fSBvcHRfZWxlbWVudFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9za2lwUmVtZWFzdXJlXG4gICAgICovXG4gICAgbXV0YXRlT3JJbnZva2VfKG11dGF0b3IsIG9wdF9lbGVtZW50LCBvcHRfc2tpcFJlbWVhc3VyZSA9IGZhbHNlKSB7XG4gICAgICBpZiAodGhpcy5hbXBkb2NfKSB7XG4gICAgICAgIFNlcnZpY2VzLm11dGF0b3JGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSkubXV0YXRlRWxlbWVudChcbiAgICAgICAgICBvcHRfZWxlbWVudCB8fCB0aGlzLFxuICAgICAgICAgIG11dGF0b3IsXG4gICAgICAgICAgb3B0X3NraXBSZW1lYXN1cmVcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG11dGF0b3IoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgd2luLl9fQU1QX0JBU0VfQ0VfQ0xBU1MgPSBCYXNlQ3VzdG9tRWxlbWVudDtcbiAgcmV0dXJuIC8qKiBAdHlwZSB7dHlwZW9mIEhUTUxFbGVtZW50fSAqLyAod2luLl9fQU1QX0JBU0VfQ0VfQ0xBU1MpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzSW5wdXRQbGFjZWhvbGRlcihlbGVtZW50KSB7XG4gIHJldHVybiAncGxhY2Vob2xkZXInIGluIGVsZW1lbnQ7XG59XG5cbi8qKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50ICovXG5mdW5jdGlvbiBhc3NlcnROb3RUZW1wbGF0ZShlbGVtZW50KSB7XG4gIGRldkFzc2VydCghZWxlbWVudC5pc0luVGVtcGxhdGVfLCAnTXVzdCBuZXZlciBiZSBjYWxsZWQgaW4gdGVtcGxhdGUnKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGN1c3RvbSBlbGVtZW50IGNsYXNzIHByb3RvdHlwZS5cbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpbiBUaGUgd2luZG93IGluIHdoaWNoIHRvIHJlZ2lzdGVyIHRoZSBjdXN0b20gZWxlbWVudC5cbiAqIEBwYXJhbSB7KHR5cGVvZiAuL2Jhc2UtZWxlbWVudC5CYXNlRWxlbWVudCk9fSBvcHRfaW1wbGVtZW50YXRpb25DbGFzcyBGb3IgdGVzdGluZyBvbmx5LlxuICogQHBhcmFtIHtmdW5jdGlvbighLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvYywgIUFtcEVsZW1lbnQsID8odHlwZW9mIEJhc2VFbGVtZW50KSk9fSBvcHRfZWxlbWVudENvbm5lY3RlZENhbGxiYWNrXG4gKiBAcmV0dXJuIHshT2JqZWN0fSBQcm90b3R5cGUgb2YgZWxlbWVudC5cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQW1wRWxlbWVudEZvclRlc3RpbmcoXG4gIHdpbixcbiAgb3B0X2ltcGxlbWVudGF0aW9uQ2xhc3MsXG4gIG9wdF9lbGVtZW50Q29ubmVjdGVkQ2FsbGJhY2tcbikge1xuICBjb25zdCBFbGVtZW50ID0gY3JlYXRlQ3VzdG9tRWxlbWVudENsYXNzKFxuICAgIHdpbixcbiAgICBvcHRfZWxlbWVudENvbm5lY3RlZENhbGxiYWNrIHx8ICgoKSA9PiB7fSlcbiAgKTtcbiAgaWYgKGdldE1vZGUoKS50ZXN0ICYmIG9wdF9pbXBsZW1lbnRhdGlvbkNsYXNzKSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGUuaW1wbGVtZW50YXRpb25DbGFzc0ZvclRlc3RpbmcgPSBvcHRfaW1wbGVtZW50YXRpb25DbGFzcztcbiAgfVxuICByZXR1cm4gRWxlbWVudDtcbn1cblxuLyoqXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0U3R1YnNGb3JUZXN0aW5nKCkge1xuICBzdHViYmVkRWxlbWVudHMubGVuZ3RoID0gMDtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHs/KHR5cGVvZiBCYXNlRWxlbWVudCl9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEltcGxDbGFzc1N5bmNGb3JUZXN0aW5nKGVsZW1lbnQpIHtcbiAgcmV0dXJuIGVsZW1lbnQuaW1wbENsYXNzXztcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHshQmFzZUVsZW1lbnR9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEltcGxTeW5jRm9yVGVzdGluZyhlbGVtZW50KSB7XG4gIHJldHVybiBlbGVtZW50LmltcGxfO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4gez9BcnJheTwhLi9zZXJ2aWNlL2FjdGlvbi1pbXBsLkFjdGlvbkludm9jYXRpb24+fHVuZGVmaW5lZH1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0aW9uUXVldWVGb3JUZXN0aW5nKGVsZW1lbnQpIHtcbiAgcmV0dXJuIGVsZW1lbnQuYWN0aW9uUXVldWVfO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/custom-element.js