function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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

import {
UPGRADE_TO_CUSTOMELEMENT_PROMISE,
UPGRADE_TO_CUSTOMELEMENT_RESOLVER } from "./amp-element-helpers";

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
import {
blockedByConsentError,
cancellation,
isBlockedByConsent,
isCancellation,
reportError } from "./error-reporting";

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
  UPGRADE_IN_PROGRESS: 4 };


var NO_BUBBLES = { bubbles: false };
var RETURN_TRUE = function RETURN_TRUE() {return true;};

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
  var BaseCustomElement = /** @type {typeof HTMLElement} */(
  createBaseCustomElementClass(win, elementConnectedCallback));

  // It's necessary to create a subclass, because the same "base" class cannot
  // be registered to multiple custom elements.
  var CustomAmpElement = /*#__PURE__*/function (_BaseCustomElement) {_inherits(CustomAmpElement, _BaseCustomElement);var _super = _createSuper(CustomAmpElement);function CustomAmpElement() {_classCallCheck(this, CustomAmpElement);return _super.apply(this, arguments);}_createClass(CustomAmpElement, [{ key: "adoptedCallback", value:
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
      } }]);return CustomAmpElement;}(BaseCustomElement);

  var customAmpElementProto = CustomAmpElement.prototype;
  return (/** @type {typeof AmpElement} */(CustomAmpElement));
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
  var htmlElement = /** @type {typeof HTMLElement} */(win.HTMLElement);

  /**
   * @abstract @extends {HTMLElement}
   */var
  BaseCustomElement = /*#__PURE__*/function (_htmlElement) {_inherits(BaseCustomElement, _htmlElement);var _super2 = _createSuper(BaseCustomElement);
    /** */
    function BaseCustomElement() {var _this;_classCallCheck(this, BaseCustomElement);
      _this = _super2.call(this);
      _this.createdCallback();return _this;
    }

    /**
     * Called when elements is created. Sets instance vars since there is no
     * constructor.
     * @final
     */_createClass(BaseCustomElement, [{ key: "createdCallback", value:
      function createdCallback() {
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
        var nonStructThis = /** @type {!Object} */(this);

        // `opt_implementationClass` is only used for tests.
        /** @type {?(typeof ../base-element.BaseElement)} */
        var Ctor =
        win.__AMP_EXTENDED_ELEMENTS &&
        win.__AMP_EXTENDED_ELEMENTS[this.localName];
        if (false && nonStructThis['implementationClassForTesting']) {
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

      /** @return {!ReadyState} */ }, { key: "readyState", get:
      function get() {
        return this.readyState_;
      }

      /** @return {!Signals} */ }, { key: "signals", value:
      function signals() {
        return this.signals_;
      }

      /**
       * Returns the associated ampdoc. Only available after attachment. It throws
       * exception before the element is attached.
       * @return {!./service/ampdoc-impl.AmpDoc}
       * @final
       * @package
       */ }, { key: "getAmpDoc", value:
      function getAmpDoc() {
        devAssert(this.ampdoc_);
        return (/** @type {!./service/ampdoc-impl.AmpDoc} */(this.ampdoc_));
      }

      /**
       * Returns Resources manager. Only available after attachment. It throws
       * exception before the element is attached.
       * @return {!./service/resources-interface.ResourcesInterface}
       * @final
       * @package
       */ }, { key: "getResources", value:
      function getResources() {
        devAssert(
        this.resources_);


        return (/** @type {!./service/resources-interface.ResourcesInterface} */(
          this.resources_));

      }

      /**
       * Whether the element has been upgraded yet. Always returns false when
       * the element has not yet been added to DOM. After the element has been
       * added to DOM, the value depends on the `BaseElement` implementation and
       * its `upgradeElement` callback.
       * @return {boolean}
       * @final
       */ }, { key: "isUpgraded", value:
      function isUpgraded() {
        return this.upgradeState_ == UpgradeState.UPGRADED;
      }

      /** @return {!Promise} */ }, { key: "whenUpgraded", value:
      function whenUpgraded() {
        return this.signals_.whenSignal(CommonSignals.UPGRADED);
      }

      /**
       * Upgrades the element to the provided new implementation. If element
       * has already been attached, it's layout validation and attachment flows
       * are repeated for the new implementation.
       * @param {typeof ./base-element.BaseElement} newImplClass
       * @final @package
       */ }, { key: "upgrade", value:
      function upgrade(newImplClass) {
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
       */ }, { key: "getUpgradeDelayMs", value:
      function getUpgradeDelayMs() {
        return this.upgradeDelayMs_;
      }

      /**
       * Completes the upgrade of the element with the provided implementation.
       * @param {!./base-element.BaseElement} newImpl
       * @param {number} upgradeStartTime
       * @final @private
       */ }, { key: "completeUpgrade_", value:
      function completeUpgrade_(newImpl, upgradeStartTime) {
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

      /** @private */ }, { key: "assertLayout_", value:
      function assertLayout_() {
        if (
        this.layout_ != Layout.NODISPLAY &&
        this.impl_ &&
        !this.impl_.isLayoutSupported(this.layout_))
        {
          userAssert(
          this.getAttribute('layout'),
          'The element did not specify a layout attribute. ' +
          'Check https://amp.dev/documentation/guides-and-tutorials/' +
          'develop/style_and_layout/control_layout and the respective ' +
          'element documentation for details.');

          userAssert(false, "Layout not supported: ".concat(this.layout_));
        }
      }

      /**
       * Get the priority to build the element.
       * @return {number}
       */ }, { key: "getBuildPriority", value:
      function getBuildPriority() {
        return this.implClass_ ?
        this.implClass_.getBuildPriority(this) :
        LayoutPriority.BACKGROUND;
      }

      /**
       * Get the priority to load the element.
       * @return {number}
       * TODO(#31915): remove once R1 migration is complete.
       */ }, { key: "getLayoutPriority", value:
      function getLayoutPriority() {
        return this.impl_ ?
        this.impl_.getLayoutPriority() :
        LayoutPriority.BACKGROUND;
      }

      /**
       * Get the default action alias.
       * @return {?string}
       */ }, { key: "getDefaultActionAlias", value:
      function getDefaultActionAlias() {
        devAssert(
        this.isUpgraded());


        return this.impl_.getDefaultActionAlias();
      }

      /** @return {boolean} */ }, { key: "isBuilding", value:
      function isBuilding() {
        return !!this.buildingPromise_;
      }

      /**
       * Whether the element has been built. A built element had its
       * {@link buildCallback} method successfully invoked.
       * @return {boolean}
       * @final
       */ }, { key: "isBuilt", value:
      function isBuilt() {
        return this.built_;
      }

      /**
       * Returns the promise that's resolved when the element has been built. If
       * the build fails, the resulting promise is rejected.
       * @return {!Promise}
       */ }, { key: "whenBuilt", value:
      function whenBuilt() {
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
       */ }, { key: "buildInternal", value:
      function buildInternal() {var _this2 = this;
        assertNotTemplate(this);
        devAssert(this.implClass_);
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
          return Services.consentPolicyServiceForDocOrNull(_this2).
          then(function (policy) {
            if (!policy) {
              return true;
            }
            return policyId ?
            policy.whenPolicyUnblock(policyId) :
            policy.whenPurposesUnblock(purposeConsents);
          }).
          then(function (shouldUnblock) {
            if (!shouldUnblock) {
              throw blockedByConsentError();
            }
          });
        });

        // Build callback.
        var buildPromise = consentPromise.then(function () {return (
            devAssert(_this2.impl_).buildCallback());});


        // Build the element.
        return (this.buildingPromise_ = buildPromise.then(
        function () {
          _this2.built_ = true;
          _this2.classList.add('i-amphtml-built');
          _this2.classList.remove('i-amphtml-notbuilt');
          _this2.classList.remove('amp-notbuilt');
          _this2.signals_.signal(CommonSignals.BUILT);

          if (_this2.R1()) {
            _this2.setReadyStateInternal(
            _this2.readyState_ != ReadyState.BUILDING ?
            _this2.readyState_ :
            ReadyState.MOUNTING);

          } else {
            _this2.setReadyStateInternal(ReadyState.LOADING);
            _this2.preconnect( /* onLayout */false);
          }

          if (_this2.isConnected_) {
            _this2.connected_();
          }

          if (_this2.actionQueue_) {
            // Only schedule when the queue is not empty, which should be
            // the case 99% of the time.
            Services.timerFor(toWin(_this2.ownerDocument.defaultView)).delay(
            _this2.dequeueActions_.bind(_this2),
            1);

          }
          if (!_this2.getPlaceholder()) {
            var placeholder = _this2.createPlaceholder();
            if (placeholder) {
              _this2.appendChild(placeholder);
            }
          }
        },
        function (reason) {
          _this2.signals_.rejectSignal(
          CommonSignals.BUILT,
          /** @type {!Error} */(reason));


          if (_this2.R1()) {
            _this2.setReadyStateInternal(ReadyState.ERROR, reason);
          }

          if (!isBlockedByConsent(reason)) {
            reportError(reason, _this2);
          }
          throw reason;
        }));

      }

      /**
       * @return {!Promise}
       */ }, { key: "build", value:
      function build() {var _this3 = this;
        if (this.buildingPromise_) {
          return this.buildingPromise_;
        }

        var readyPromise = this.signals_.whenSignal(
        CommonSignals.READY_TO_UPGRADE);

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
       */ }, { key: "mountInternal", value:
      function mountInternal() {var _this4 = this;
        if (this.mountPromise_) {
          return this.mountPromise_;
        }
        this.mountAbortController_ =
        this.mountAbortController_ || new AbortController();
        var signal = this.mountAbortController_.signal;
        return (this.mountPromise_ = this.buildInternal().
        then(function () {
          devAssert(_this4.R1());
          if (signal.aborted) {
            // Mounting has been canceled.
            return;
          }
          _this4.setReadyStateInternal(
          _this4.readyState_ != ReadyState.MOUNTING ?
          _this4.readyState_ :
          _this4.implClass_.usesLoading(_this4) ?
          ReadyState.LOADING :
          ReadyState.MOUNTING);

          _this4.mounted_ = true;
          var result = _this4.impl_.mountCallback(signal);
          // The promise supports the V0 format for easy migration. If the
          // `mountCallback` returns a promise, the assumption is that the
          // element has finished loading when the promise completes.
          return result ? result.then(RETURN_TRUE) : false;
        }).
        then(function (hasLoaded) {
          _this4.mountAbortController_ = null;
          if (signal.aborted) {
            throw cancellation();
          }
          _this4.signals_.signal(CommonSignals.MOUNTED);
          if (!_this4.implClass_.usesLoading(_this4) || hasLoaded) {
            _this4.setReadyStateInternal(ReadyState.COMPLETE);
          }
        }).
        catch(function (reason) {
          _this4.mountAbortController_ = null;
          if (isCancellation(reason)) {
            _this4.mountPromise_ = null;
          } else {
            _this4.signals_.rejectSignal(
            CommonSignals.MOUNTED,
            /** @type {!Error} */(reason));

            _this4.setReadyStateInternal(ReadyState.ERROR, reason);
          }
          throw reason;
        }));
      }

      /**
       * Requests the element to be mounted as soon as possible.
       * @return {!Promise}
       * @final
       */ }, { key: "mount", value:
      function mount() {var _this5 = this;
        if (this.mountPromise_) {
          return this.mountPromise_;
        }

        // Create the abort controller right away to ensure that we the unmount
        // will properly cancel this operation.
        this.mountAbortController_ =
        this.mountAbortController_ || new AbortController();
        var signal = this.mountAbortController_.signal;

        var readyPromise = this.signals_.whenSignal(
        CommonSignals.READY_TO_UPGRADE);

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
       */ }, { key: "unmount", value:
      function unmount() {
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
          this.upgradeOrSchedule_( /* opt_disablePreload */true);
        }
      }

      /**
       * Returns the promise that's resolved when the element has been mounted. If
       * the mount fails, the resulting promise is rejected.
       * @return {!Promise}
       */ }, { key: "whenMounted", value:
      function whenMounted() {
        return this.signals_.whenSignal(CommonSignals.MOUNTED);
      }

      /**
       * @return {!Promise}
       * @final
       */ }, { key: "whenLoaded", value:
      function whenLoaded() {
        return this.signals_.whenSignal(CommonSignals.LOAD_END);
      }

      /**
       * Ensure that the element is eagerly loaded.
       *
       * @param {number=} opt_parentPriority
       * @return {!Promise}
       * @final
       */ }, { key: "ensureLoaded", value:
      function ensureLoaded(opt_parentPriority) {var _this6 = this;
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
            if (
            resource.getState() != ResourceState.LAYOUT_SCHEDULED ||
            resource.isMeasureRequested())
            {
              resource.measure();
            }
            if (!resource.isDisplayed()) {
              return;
            }
            _this6.getResources().scheduleLayoutOrPreload(
            resource,
            /* layout */true,
            opt_parentPriority,
            /* forceOutsideViewport */true);

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
       */ }, { key: "setAsContainerInternal", value:
      function setAsContainerInternal(opt_scroller) {
        var builder = getSchedulerForDoc(this.getAmpDoc());
        builder.setContainer(this, opt_scroller);
      }

      /**
       * See `BaseElement.removeAsContainer`.
       * @restricted
       * @final
       */ }, { key: "removeAsContainerInternal", value:
      function removeAsContainerInternal() {
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
       */ }, { key: "setReadyStateInternal", value:
      function setReadyStateInternal(state, opt_failure) {
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
            this.signals_.rejectSignal(
            CommonSignals.LOAD_END,
            /** @type {!Error} */(opt_failure));

            this.toggleLoading(false);
            dom.dispatchCustomEvent(this, 'error', opt_failure, NO_BUBBLES);
            return;}

      }

      /**
       * Called to instruct the element to preconnect to hosts it uses during
       * layout.
       * @param {boolean} onLayout Whether this was called after a layout.
       * TODO(#31915): remove once R1 migration is complete.
       */ }, { key: "preconnect", value:
      function preconnect(onLayout) {var _this7 = this;
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
       */ }, { key: "R1", value:
      function R1() {
        return this.implClass_ ? this.implClass_.R1() : false;
      }

      /**
       * See `BaseElement.deferredMount()`.
       *
       * @return {boolean}
       * @final
       */ }, { key: "deferredMount", value:
      function deferredMount() {
        return this.implClass_ ? this.implClass_.deferredMount(this) : false;
      }

      /**
       * Whether the custom element declares that it has to be fixed.
       * @return {boolean}
       */ }, { key: "isAlwaysFixed", value:
      function isAlwaysFixed() {
        return this.impl_ ? this.impl_.isAlwaysFixed() : false;
      }

      /**
       * Updates the layout box of the element.
       * Should only be called by Resources.
       * @param {!./layout-rect.LayoutRectDef} layoutBox
       * @param {boolean} sizeChanged
       */ }, { key: "updateLayoutBox", value:
      function updateLayoutBox(layoutBox) {var sizeChanged = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        if (this.isBuilt()) {
          this.onMeasure(sizeChanged);
        }
      }

      /**
       * Calls onLayoutMeasure() on the BaseElement implementation.
       * Should only be called by Resources.
       */ }, { key: "onMeasure", value:
      function onMeasure() {
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
       */ }, { key: "getSizer_", value:
      function getSizer_() {
        if (
        this.sizerElement === undefined && (
        this.layout_ === Layout.RESPONSIVE ||
        this.layout_ === Layout.INTRINSIC))
        {
          // Expect sizer to exist, just not yet discovered.
          this.sizerElement = this.querySelector('i-amphtml-sizer');
        }
        return this.sizerElement || null;
      }

      /**
       * @param {Element} sizer
       * @private
       */ }, { key: "resetSizer_", value:
      function resetSizer_(sizer) {
        if (this.layout_ === Layout.RESPONSIVE) {
          setStyle(sizer, 'paddingTop', '0');
          return;
        }
        if (this.layout_ === Layout.INTRINSIC) {
          var intrinsicSizerImg = sizer.querySelector(
          '.i-amphtml-intrinsic-sizer');

          if (!intrinsicSizerImg) {
            return;
          }
          intrinsicSizerImg.setAttribute('src', '');
          return;
        }
      }

      /** @private */ }, { key: "initMediaAttrs_", value:
      function initMediaAttrs_() {var _this8 = this;
        var hasMediaAttrs =
        this.hasAttribute('media') || (
        this.hasAttribute('sizes') &&
        !this.hasAttribute('disable-inline-width')) ||
        this.hasAttribute('heights');
        var hadMediaAttrs = !!this.mediaQueryProps_;
        var win = this.ownerDocument.defaultView;
        if (hasMediaAttrs != hadMediaAttrs && win) {
          if (hasMediaAttrs) {
            this.mediaQueryProps_ = new MediaQueryProps(win, function () {return (
                _this8.applyMediaAttrs_());});

            this.applyMediaAttrs_();
          } else {
            this.disposeMediaAttrs_();
          }
        }
      }

      /** @private */ }, { key: "disposeMediaAttrs_", value:
      function disposeMediaAttrs_() {
        if (this.mediaQueryProps_) {
          this.mediaQueryProps_.dispose();
          this.mediaQueryProps_ = null;
        }
      }

      /** @private */ }, { key: "applyMediaAttrs_", value:
      function applyMediaAttrs_() {
        var props = this.mediaQueryProps_;
        if (!props) {
          return;
        }

        props.start();

        // Media query.
        var mediaAttr = this.getAttribute('media') || null;
        var matchesMedia = mediaAttr ?
        props.resolveMatchQuery(mediaAttr) :
        true;
        this.classList.toggle('i-amphtml-hidden-by-media-query', !matchesMedia);

        // Sizes.
        var sizesAttr = this.hasAttribute('disable-inline-width') ?
        null :
        this.getAttribute('sizes');
        if (sizesAttr) {
          setStyle(this, 'width', props.resolveListQuery(sizesAttr));
        }

        // Heights.
        var heightsAttr =
        this.layout_ === Layout.RESPONSIVE ?
        this.getAttribute('heights') :
        null;
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
       */ }, { key: "applySize", value:
      function applySize(newHeight, newWidth, opt_newMargins) {
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
       */ }, { key: "connectedCallback", value:
      function connectedCallback() {
        if (!isTemplateTagSupported() && this.isInTemplate_ === undefined) {
          this.isInTemplate_ = !!query.closestAncestorElementBySelector(
          this,
          'template');

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
            this.layout_ = applyStaticLayout(
            this,
            Services.platformFor(toWin(this.ownerDocument.defaultView)).isIe());

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
       */ }, { key: "isAwaitingSize_", value:
      function isAwaitingSize_() {
        return this.classList.contains('i-amphtml-layout-awaiting-size');
      }

      /**
       * @private
       */ }, { key: "sizeProvided_", value:
      function sizeProvided_() {
        this.classList.remove('i-amphtml-layout-awaiting-size');
      }

      /**
       * Upgrade or schedule element based on R1.
       * @param {boolean=} opt_disablePreload
       * @private @final
       */ }, { key: "upgradeOrSchedule_", value:
      function upgradeOrSchedule_(opt_disablePreload) {
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
          this.setReadyStateInternal(
          this.implClass_ && this.implClass_.usesLoading(this) ?
          ReadyState.LOADING :
          ReadyState.MOUNTING);

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
                urls.forEach(function (url) {return (
                    preconnect.url(ampdoc, url, /* alsoConnecting */false));});

              });
            }
          }
        }
      }

      /**
       * Try to upgrade the element with the provided implementation.
       * @return {!Promise|undefined}
       * @private @final
       */ }, { key: "tryUpgrade_", value:
      function tryUpgrade_() {var _this9 = this;
        if (this.isInTemplate_) {
          return;
        }
        if (this.upgradeState_ != UpgradeState.NOT_UPGRADED) {
          // Already upgraded or in progress or failed.
          return;
        }

        var Ctor = devAssert(
        this.implClass_);



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
          return res.
          then(function (upgrade) {
            _this9.completeUpgrade_(upgrade || impl, startTime);
          }).
          catch(function (reason) {
            _this9.upgradeState_ = UpgradeState.UPGRADE_FAILED;
            rethrowAsync(reason);
          });
        } else {
          // It's an actual instance: upgrade immediately.
          this.completeUpgrade_(
          /** @type {!./base-element.BaseElement} */(res),
          startTime);

        }
      }

      /**
       * Called when the element is disconnected from the DOM.
       *
       * @final
       */ }, { key: "disconnectedCallback", value:
      function disconnectedCallback() {
        this.disconnect( /* pretendDisconnected */false);
      }

      /** @private */ }, { key: "connected_", value:
      function connected_() {
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
       */ }, { key: "disconnect", value:
      function disconnect(pretendDisconnected) {
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
       */ }, { key: "dispatchCustomEventForTesting", value:
      function dispatchCustomEventForTesting(name, opt_data) {
        if (!false) {
          return;
        }
        dom.dispatchCustomEvent(this, name, opt_data);
      }

      /**
       * Whether the element can pre-render.
       * @return {boolean}
       * @final
       */ }, { key: "prerenderAllowed", value:
      function prerenderAllowed() {
        if (this.hasAttribute('noprerender')) {
          return false;
        }
        return this.implClass_ ? this.implClass_.prerenderAllowed(this) : false;
      }

      /**
       * Whether the element has render-blocking service.
       * @return {boolean}
       * @final
       */ }, { key: "isBuildRenderBlocking", value:
      function isBuildRenderBlocking() {
        return this.impl_ ? this.impl_.isBuildRenderBlocking() : false;
      }

      /**
       * Creates a placeholder for the element.
       * @return {?Element}
       * @final
       */ }, { key: "createPlaceholder", value:
      function createPlaceholder() {
        return this.impl_ ? this.impl_.createPlaceholderCallback() : null;
      }

      /**
       * Creates a loader logo.
       * @return {{
       *  content: (!Element|undefined),
       *  color: (string|undefined),
       * }}
       * @final
       */ }, { key: "createLoaderLogo", value:
      function createLoaderLogo() {
        return this.implClass_ ?
        this.implClass_.createLoaderLogoCallback(this) :
        {};
      }

      /**
       * Whether the element should ever render when it is not in viewport.
       * @return {boolean|number}
       * @final
       */ }, { key: "renderOutsideViewport", value:
      function renderOutsideViewport() {
        return this.impl_ ? this.impl_.renderOutsideViewport() : false;
      }

      /**
       * Whether the element should render outside of renderOutsideViewport when
       * the scheduler is idle.
       * @return {boolean|number}
       * @final
       */ }, { key: "idleRenderOutsideViewport", value:
      function idleRenderOutsideViewport() {
        return this.impl_ ? this.impl_.idleRenderOutsideViewport() : false;
      }

      /**
       * Returns a previously measured layout box adjusted to the viewport. This
       * mainly affects fixed-position elements that are adjusted to be always
       * relative to the document position in the viewport.
       * @return {!./layout-rect.LayoutRectDef}
       * @final
       */ }, { key: "getLayoutBox", value:
      function getLayoutBox() {
        return this.getResource_().getLayoutBox();
      }

      /**
       * Returns a previously measured layout size.
       * @return {!./layout-rect.LayoutSizeDef}
       * @final
       */ }, { key: "getLayoutSize", value:
      function getLayoutSize() {
        return this.getResource_().getLayoutSize();
      }

      /**
       * @return {?Element}
       * @final
       */ }, { key: "getOwner", value:
      function getOwner() {
        return this.getResource_().getOwner();
      }

      /**
       * Returns a change entry for that should be compatible with
       * IntersectionObserverEntry.
       * @return {?IntersectionObserverEntry} A change entry.
       * @final
       */ }, { key: "getIntersectionChangeEntry", value:
      function getIntersectionChangeEntry() {
        var box = this.impl_ ?
        this.impl_.getIntersectionElementLayoutBox() :
        this.getLayoutBox();
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
       */ }, { key: "getResource_", value:
      function getResource_() {
        return this.getResources().getResourceForElement(this);
      }

      /**
       * Returns the resource ID of the element.
       * @return {number}
       */ }, { key: "getResourceId", value:
      function getResourceId() {
        return this.getResource_().getId();
      }

      /**
       * The runtime calls this method to determine if {@link layoutCallback}
       * should be called again when layout changes.
       * @return {boolean}
       * @package @final
       * TODO(#31915): remove once R1 migration is complete.
       */ }, { key: "isRelayoutNeeded", value:
      function isRelayoutNeeded() {
        return this.impl_ ? this.impl_.isRelayoutNeeded() : false;
      }

      /**
       * Returns reference to upgraded implementation.
       * @param {boolean} waitForBuild If true, waits for element to be built before
       *   resolving the returned Promise. Default is true.
       * @return {!Promise<!./base-element.BaseElement>}
       */ }, { key: "getImpl", value:
      function getImpl() {var _this10 = this;var waitForBuild = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var waitFor = waitForBuild ? this.build() : this.createImpl_();
        return waitFor.then(function () {return _this10.impl_;});
      }

      /**
       * @return {!Promise<!./base-element.BaseElement>}
       * @private
       */ }, { key: "createImpl_", value:
      function createImpl_() {var _this11 = this;
        return this.signals_.
        whenSignal(CommonSignals.READY_TO_UPGRADE).
        then(function () {
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
       */ }, { key: "getApi", value:
      function getApi() {
        return this.getImpl().then(function (impl) {return impl.getApi();});
      }

      /**
       * Returns the layout of the element.
       * @return {!Layout}
       */ }, { key: "getLayout", value:
      function getLayout() {
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
       */ }, { key: "layoutCallback", value:
      function layoutCallback(signal) {var _this12 = this;
        assertNotTemplate(this);
        devAssert(this.isBuilt());
        // A lot of tests call layoutCallback manually, and don't pass a signal.
        if ((!false || signal) && signal.aborted) {
          return Promise.reject(cancellation());
        }

        this.dispatchCustomEventForTesting(AmpEvents.LOAD_START);
        var isLoadEvent = this.layoutCount_ == 0; // First layout is "load".
        this.signals_.reset(CommonSignals.UNLOAD);
        if (isLoadEvent) {
          this.signals_.signal(CommonSignals.LOAD_START);
        }

        // Potentially start the loading indicator.
        this.toggleLoading(true);

        var promise = tryResolve(function () {return _this12.impl_.layoutCallback();});
        this.preconnect( /* onLayout */true);
        this.classList.add('i-amphtml-layout');

        return promise.then(
        function () {
          if ((!false || signal) && signal.aborted) {
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
        },
        function (reason) {
          if ((!false || signal) && signal.aborted) {
            throw cancellation();
          }
          // add layoutCount_ by 1 despite load fails or not
          if (isLoadEvent) {
            _this12.signals_.rejectSignal(
            CommonSignals.LOAD_END,
            /** @type {!Error} */(reason));

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
       */ }, { key: "pause", value:
      function pause() {
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
       */ }, { key: "resume", value:
      function resume() {
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
       */ }, { key: "unlayoutCallback", value:
      function unlayoutCallback() {
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

      /** @private */ }, { key: "unlayout_", value:
      function unlayout_() {
        this.getResource_().unlayout();
        if (this.isConnected_ && this.resources_) {
          this.resources_. /*OK*/schedulePass();
        }
      }

      /** @private */ }, { key: "reset_", value:
      function reset_() {
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
       */ }, { key: "reconstructWhenReparented", value:
      function reconstructWhenReparented() {
        return this.impl_ ? this.impl_.reconstructWhenReparented() : false;
      }

      /**
       * Collapses the element, and notifies its owner (if there is one) that the
       * element is no longer present.
       */ }, { key: "collapse", value:
      function collapse() {
        if (this.impl_) {
          this.impl_. /*OK*/collapse();
        }
      }

      /**
       * Called every time an owned AmpElement collapses itself.
       * @param {!AmpElement} element
       */ }, { key: "collapsedCallback", value:
      function collapsedCallback(element) {
        if (this.impl_) {
          this.impl_.collapsedCallback(element);
        }
      }

      /**
       * Expands the element, and notifies its owner (if there is one) that the
       * element is now present.
       */ }, { key: "expand", value:
      function expand() {
        if (this.impl_) {
          this.impl_. /*OK*/expand();
        }
      }

      /**
       * Called when one or more attributes are mutated.
       * Note: Must be called inside a mutate context.
       * Note: Boolean attributes have a value of `true` and `false` when
       *     present and missing, respectively.
       * @param {!JsonObject<string, (null|boolean|string|number|Array|Object)>} mutations
       */ }, { key: "mutatedAttributesCallback", value:
      function mutatedAttributesCallback(mutations) {
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
       */ }, { key: "enqueAction", value:
      function enqueAction(invocation) {
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
       */ }, { key: "dequeueActions_", value:
      function dequeueActions_() {var _this13 = this;
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
       */ }, { key: "executionAction_", value:
      function executionAction_(invocation, deferred) {
        try {
          this.impl_.executeAction(invocation, deferred);
        } catch (e) {
          rethrowAsync(
          'Action execution failed:',
          e,
          invocation.node.tagName,
          invocation.method);

        }
      }

      /**
       * Get the consent policy to follow.
       * @return {?string}
       */ }, { key: "getConsentPolicy_", value:
      function getConsentPolicy_() {
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
       */ }, { key: "getPurposesConsent_", value:
      function getPurposesConsent_() {var _purposes$replace;
        var purposes =
        this.getAttribute('data-block-on-consent-purposes') || null;
        return (purposes === null || purposes === void 0) ? (void 0) : ((_purposes$replace = purposes.replace(/\s+/g, '')) === null || _purposes$replace === void 0) ? (void 0) : _purposes$replace.split(',');
      }

      /**
       * Returns an optional placeholder element for this custom element.
       * @return {?Element}
       * @package @final
       */ }, { key: "getPlaceholder", value:
      function getPlaceholder() {
        return query.lastChildElement(this, function (el) {
          return (
          el.hasAttribute('placeholder') &&
          // Denylist elements that has a native placeholder property
          // like input and textarea. These are not allowed to be AMP
          // placeholders.
          !isInputPlaceholder(el));

        });
      }

      /**
       * Hides or shows the placeholder, if available.
       * @param {boolean} show
       * @package @final
       */ }, { key: "togglePlaceholder", value:
      function togglePlaceholder(show) {
        assertNotTemplate(this);
        if (show) {
          var placeholder = this.getPlaceholder();
          if (placeholder) {
            /** @type {!Element} */(placeholder).classList.remove('amp-hidden');
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
       */ }, { key: "getFallback", value:
      function getFallback() {
        return query.childElementByAttr(this, 'fallback');
      }

      /**
       * Hides or shows the fallback, if available. This function must only
       * be called inside a mutate context.
       * @param {boolean} show
       * @package @final
       */ }, { key: "toggleFallback", value:
      function toggleFallback(show) {
        assertNotTemplate(this);
        var resourceState = this.getResource_().getState();
        // Do not show fallback before layout
        if (
        !this.R1() &&
        show && (
        resourceState == ResourceState.NOT_BUILT ||
        resourceState == ResourceState.NOT_LAID_OUT ||
        resourceState == ResourceState.READY_FOR_LAYOUT))
        {
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
            Services.ownersForDoc(this.getAmpDoc()).scheduleLayout(
            this,
            fallbackElement);

          }
        }
      }

      /**
       * An implementation can call this method to signal to the element that
       * it has started rendering.
       * @package @final
       */ }, { key: "renderStarted", value:
      function renderStarted() {
        this.signals_.signal(CommonSignals.RENDER_START);
        this.togglePlaceholder(false);
        this.toggleLoading(false);
      }

      /**
       * Whether the loading can be shown for this element.
       * @param {boolean} force
       * @return {boolean}
       * @private
       */ }, { key: "isLoadingEnabled_", value:
      function isLoadingEnabled_(force) {
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

        var laidOut =
        this.layoutCount_ > 0 || this.signals_.get(CommonSignals.RENDER_START);
        if (
        this.layout_ == Layout.NODISPLAY ||
        this.hasAttribute('noloading') || (
        laidOut && !force) ||
        !isLoadingAllowed(this) ||
        query.isInternalOrServiceNode(this))
        {
          return false;
        }

        return true;
      }

      /**
       * Turns the loading indicator on or off.
       * @param {boolean} state
       * @param {boolean=} force
       * @public @final
       */ }, { key: "toggleLoading", value:
      function toggleLoading(state) {var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        // TODO(dvoytenko, #9177): cleanup `this.ownerDocument.defaultView`
        // once investigation is complete. It appears that we get a lot of
        // errors here once the iframe is destroyed due to timer.
        if (!this.ownerDocument || !this.ownerDocument.defaultView) {
          return;
        }

        var loadingIndicator = Services.loadingIndicatorOrNull(
        this.getAmpDoc());

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
       */ }, { key: "getOverflowElement", value:
      function getOverflowElement() {
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
       */ }, { key: "overflowCallback", value:
      function overflowCallback(overflown, requestedHeight, requestedWidth) {var _this14 = this;
        this.getOverflowElement();
        if (!this.overflowElement_) {
          if (overflown && this.warnOnMissingOverflow) {
            user().warn(
            TAG,
            'Cannot resize element and overflow is not available',
            this);

          }
        } else {
          this.overflowElement_.classList.toggle('amp-visible', overflown);

          if (overflown) {
            this.overflowElement_.onclick = function () {
              var mutator = Services.mutatorForDoc(_this14.getAmpDoc());
              mutator.forceChangeSize(_this14, requestedHeight, requestedWidth);
              mutator.mutateElement(_this14, function () {
                _this14.overflowCallback(
                /* overflown */false,
                requestedHeight,
                requestedWidth);

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
       */ }, { key: "mutateOrInvoke_", value:
      function mutateOrInvoke_(mutator, opt_element) {var opt_skipRemeasure = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        if (this.ampdoc_) {
          Services.mutatorForDoc(this.getAmpDoc()).mutateElement(
          opt_element || this,
          mutator,
          opt_skipRemeasure);

        } else {
          mutator();
        }
      } }]);return BaseCustomElement;}(htmlElement);

  win.__AMP_BASE_CE_CLASS = BaseCustomElement;
  return (/** @type {typeof HTMLElement} */(win.__AMP_BASE_CE_CLASS));
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
  devAssert(!element.isInTemplate_);
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
export function createAmpElementForTesting(
win,
opt_implementationClass,
opt_elementConnectedCallback)
{
  var Element = createCustomElementClass(
  win,
  opt_elementConnectedCallback || (function () {}));

  if (false && opt_implementationClass) {
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
// /Users/mszylkowski/src/amphtml/src/custom-element.js