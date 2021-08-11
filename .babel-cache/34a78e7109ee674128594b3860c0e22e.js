function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";function _get(target, property, receiver) {if (typeof Reflect !== "undefined" && Reflect.get) {_get = Reflect.get;} else {_get = function _get(target, property, receiver) {var base = _superPropBase(target, property);if (!base) return;var desc = Object.getOwnPropertyDescriptor(base, property);if (desc.get) {return desc.get.call(receiver);}return desc.value;};}return _get(target, property, receiver || target);}function _superPropBase(object, property) {while (!Object.prototype.hasOwnProperty.call(object, property)) {object = _getPrototypeOf(object);if (object === null) break;}return object;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import { AFFILIATE_LINK_SELECTOR } from "./amp-story-affiliate-link";
import {
Action,
EmbeddedComponentState,
InteractiveComponentDef,
StateProperty,
UIType,
getStoreService } from "./amp-story-store-service";

import { AdvancementMode } from "./story-analytics";
import { Services } from "../../../src/service";
import { TAPPABLE_ARIA_ROLES } from "../../../src/service/action-impl";
import { VideoEvents } from "../../../src/video-interface";
import { closest, matches } from "../../../src/core/dom/query";
import { dev, user } from "../../../src/log";
import { escapeCssSelectorIdent } from "../../../src/core/dom/css-selectors";
import { getAmpdoc } from "../../../src/service-helpers";
import { hasTapAction, timeStrToMillis } from "./utils";
import { interactiveElementsSelectors } from "./amp-story-embedded-component";
import { listenOnce } from "../../../src/event-helper";

/** @private @const {number} */
var HOLD_TOUCH_THRESHOLD_MS = 500;

/** @private @const {number} */
var NEXT_SCREEN_AREA_RATIO = 0.75;

/** @private @const {number} */
var PREVIOUS_SCREEN_AREA_RATIO = 0.25;

/** @private @const {number} */
var TOP_REGION = 0.8;

/**
 * Protected edges of the screen as a percent of page width. When tapped on these areas, we will
 * always perform navigation. Even if a clickable element is there.
 * @const {number}
 * @private
 */
var PROTECTED_SCREEN_EDGE_PERCENT = 12;

/**
 * Minimum protected edges of the screen in pixels.
 * If PROTECTED_SCREEN_EDGE_PERCENT results in a protected edge value less than MINIMUM_PROTECTED_SCREEN_EDGE_PX,
 * we will use MINIMUM_PROTECTED_SCREEN_EDGE_PX.
 * @const {number}
 * @private
 */
var MINIMUM_PROTECTED_SCREEN_EDGE_PX = 48;

/** @private @const {number} */
var MINIMUM_TIME_BASED_AUTO_ADVANCE_MS = 500;

/**
 * Maximum percent of screen that can be occupied by a single link
 * before the link is considered navigation blocking and ignored.
 * @const {number}
 * @private
 */
var MAX_LINK_SCREEN_PERCENT = 0.8;

var INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS = Object.values(
interactiveElementsSelectors()).
join(',');

/** @const {number} */
export var POLL_INTERVAL_MS = 300;

/** @const @enum */
export var TapNavigationDirection = {
  'NEXT': 1,
  'PREVIOUS': 2 };


/**
 * Base class for the AdvancementConfig.  By default, does nothing other than
 * tracking its internal state when started/stopped, and listeners will never be
 * invoked.
 */
export var AdvancementConfig = /*#__PURE__*/function () {
  /**
   * @public
   */
  function AdvancementConfig() {_classCallCheck(this, AdvancementConfig);
    /** @private @const {!Array<function(number)>} */
    this.progressListeners_ = [];

    /** @private @const {!Array<function()>} */
    this.advanceListeners_ = [];

    /** @private @const {!Array<function()>} */
    this.previousListeners_ = [];

    /** @private @const {!Array<function(number)>} */
    this.tapNavigationListeners_ = [];

    /** @private {boolean} */
    this.isRunning_ = false;
  }

  /**
   * @param {function(number)} progressListener A function that handles when the
   *     progress of the current page has been updated.  It accepts a number
   *     between 0.0 and 1.0 as its only argument, that represents the current
   *     progress.
   */_createClass(AdvancementConfig, [{ key: "addProgressListener", value:
    function addProgressListener(progressListener) {
      this.progressListeners_.push(progressListener);
    }

    /**
     * @param {function()} advanceListener A function that handles when a
     *     page should be advanced.
     */ }, { key: "addAdvanceListener", value:
    function addAdvanceListener(advanceListener) {
      this.advanceListeners_.push(advanceListener);
    }

    /**
     * @param {function()} previousListener A function that handles when a
     *     page should go back to the previous page.
     */ }, { key: "addPreviousListener", value:
    function addPreviousListener(previousListener) {
      this.previousListeners_.push(previousListener);
    }

    /**
     * @param {function(number)} onTapNavigationListener A function that handles when a
     * navigation listener to be fired.
     */ }, { key: "addOnTapNavigationListener", value:
    function addOnTapNavigationListener(onTapNavigationListener) {
      this.tapNavigationListeners_.push(onTapNavigationListener);
    }

    /**
     * Invoked when the advancement configuration should begin taking effect.
     */ }, { key: "start", value:
    function start() {
      this.isRunning_ = true;
    }

    /**
     * Invoked when the advancement configuration should cease taking effect.
     * @param {boolean=} unusedCanResume
     */ }, { key: "stop", value:
    function stop(unusedCanResume) {
      this.isRunning_ = false;
    }

    /**
     * Returns whether the advancement configuration will automatically advance
     * @return {boolean}
     */ }, { key: "isAutoAdvance", value:
    function isAutoAdvance() {
      return false;
    }

    /**
     * @return {boolean}
     * @protected
     */ }, { key: "isRunning", value:
    function isRunning() {
      return this.isRunning_;
    }

    /**
     * @return {number}
     */ }, { key: "getProgress", value:
    function getProgress() {
      return 1;
    }

    /** @protected */ }, { key: "onProgressUpdate", value:
    function onProgressUpdate() {
      var progress = this.getProgress();
      this.progressListeners_.forEach(function (progressListener) {
        progressListener(progress);
      });
    }

    /** @protected */ }, { key: "onAdvance", value:
    function onAdvance() {
      this.advanceListeners_.forEach(function (advanceListener) {
        advanceListener();
      });
    }

    /** @protected */ }, { key: "onPrevious", value:
    function onPrevious() {
      this.previousListeners_.forEach(function (previousListener) {
        previousListener();
      });
    }

    /**
     * @param {number} navigationDirection Direction of navigation
     * @protected
     */ }, { key: "onTapNavigation", value:
    function onTapNavigation(navigationDirection) {
      this.tapNavigationListeners_.forEach(function (navigationListener) {
        navigationListener(navigationDirection);
      });
    }

    /**
     * Provides an AdvancementConfig object for the specified amp-story or
     * amp-story-page.
     * @param {!Window} win
     * @param {!Element} element
     * @return {!AdvancementConfig|!ManualAdvancement|!TimeBasedAdvancement|!MediaBasedAdvancement}
     */ }], [{ key: "forElement", value:
    function forElement(win, element) {
      var manualAdvancement = ManualAdvancement.fromElement(win, element);
      if (manualAdvancement) {
        return manualAdvancement;
      }

      var autoAdvanceStr = element.getAttribute('auto-advance-after');

      if (autoAdvanceStr) {
        var timeBasedAdvancement = TimeBasedAdvancement.fromAutoAdvanceString(
        autoAdvanceStr,
        win,
        element);

        if (timeBasedAdvancement) {
          return timeBasedAdvancement;
        }

        var mediaBasedAdvancement = MediaBasedAdvancement.fromAutoAdvanceString(
        autoAdvanceStr,
        win,
        element);

        if (mediaBasedAdvancement) {
          return mediaBasedAdvancement;
        }
      }

      return new AdvancementConfig();
    } }]);return AdvancementConfig;}();


/**
 * Always provides a progress of 1.0.  Advances when the user taps the
 * corresponding section, depending on language settings.
 */
export var ManualAdvancement = /*#__PURE__*/function (_AdvancementConfig) {_inherits(ManualAdvancement, _AdvancementConfig);var _super = _createSuper(ManualAdvancement);
  /**
   * @param {!Window} win The Window object.
   * @param {!Element} element The element that, when clicked, can cause
   *     advancing to the next page or going back to the previous.
   */
  function ManualAdvancement(win, element) {var _this;_classCallCheck(this, ManualAdvancement);
    _this = _super.call(this);

    /** @private @const {!Element} */
    _this.element_ = element;

    /** @private {number|string|null} */
    _this.timeoutId_ = null;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    _this.timer_ = Services.timerFor(win);

    /** @private {?number} Last touchstart event's timestamp */
    _this.touchstartTimestamp_ = null;

    /** @private {boolean} Saving the paused state before pressing */
    _this.pausedState_ = false;

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    _this.ampdoc_ = getAmpdoc(win.document);

    _this.startListening_();

    if (element.ownerDocument.defaultView) {
      /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
      _this.storeService_ = getStoreService(element.ownerDocument.defaultView);
    }

    var rtlState = _this.storeService_.get(StateProperty.RTL_STATE);
    _this.sections_ = {
      // Width and navigation direction of each section depend on whether the
      // document is RTL or LTR.
      left: {
        widthRatio: rtlState ?
        NEXT_SCREEN_AREA_RATIO :
        PREVIOUS_SCREEN_AREA_RATIO,
        direction: rtlState ?
        TapNavigationDirection.NEXT :
        TapNavigationDirection.PREVIOUS },

      right: {
        widthRatio: rtlState ?
        PREVIOUS_SCREEN_AREA_RATIO :
        NEXT_SCREEN_AREA_RATIO,
        direction: rtlState ?
        TapNavigationDirection.PREVIOUS :
        TapNavigationDirection.NEXT } };return _this;


  }

  /** @override */_createClass(ManualAdvancement, [{ key: "getProgress", value:
    function getProgress() {
      return 1.0;
    }

    /**
     * Binds the event listeners.
     * @private
     */ }, { key: "startListening_", value:
    function startListening_() {var _this2 = this;
      this.element_.addEventListener(
      'touchstart',
      this.onTouchstart_.bind(this),
      true);

      this.element_.addEventListener(
      'touchend',
      this.onTouchend_.bind(this),
      true);

      this.element_.addEventListener(
      'click',
      this.maybePerformNavigation_.bind(this),
      true);

      this.ampdoc_.onVisibilityChanged(function () {
        _this2.ampdoc_.isVisible() ? _this2.processTouchend_() : null;
      });
    }

    /**
     * @override
     */ }, { key: "isAutoAdvance", value:
    function isAutoAdvance() {
      return false;
    }

    /**
     * TouchEvent touchstart events handler.
     * @param {!Event} event
     * @private
     */ }, { key: "onTouchstart_", value:
    function onTouchstart_(event) {var _this3 = this;
      // Don't start the paused state if the event should not be handled by this
      // class. Also ignores any subsequent touchstart that would happen before
      // touchend was fired, since it'd reset the touchstartTimestamp (ie: user
      // touches the screen with a second finger).
      if (this.touchstartTimestamp_ || !this.shouldHandleEvent_(event)) {
        return;
      }
      this.touchstartTimestamp_ = Date.now();
      this.pausedState_ = /** @type {boolean} */(
      this.storeService_.get(StateProperty.PAUSED_STATE));

      this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);
      this.timeoutId_ = this.timer_.delay(function () {
        _this3.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);
      }, HOLD_TOUCH_THRESHOLD_MS);
    }

    /**
     * TouchEvent touchend events handler.
     * @param {!Event} event
     * @private
     */ }, { key: "onTouchend_", value:
    function onTouchend_(event) {
      // Ignores the event if there's still a user's finger holding the screen.
      var touchesCount = (event.touches || []).length;
      if (!this.touchstartTimestamp_ || touchesCount > 0) {
        return;
      }

      // Cancels the navigation if user paused the story for over 500ms. Calling
      // preventDefault on the touchend event ensures the click/tap event won't
      // fire.
      if (Date.now() - this.touchstartTimestamp_ > HOLD_TOUCH_THRESHOLD_MS) {
        event.preventDefault();
      }

      this.processTouchend_();
    }

    /**
     * Logic triggered by touchend events.
     * @private
     */ }, { key: "processTouchend_", value:
    function processTouchend_() {
      if (!this.touchstartTimestamp_) {
        return;
      }
      this.storeService_.dispatch(Action.TOGGLE_PAUSED, this.pausedState_);
      this.touchstartTimestamp_ = null;
      this.timer_.cancel(this.timeoutId_);
      this.timeoutId_ = null;
      if (
      !this.storeService_.get(StateProperty.SYSTEM_UI_IS_VISIBLE_STATE) &&
      /** @type {InteractiveComponentDef} */(
      this.storeService_.get(StateProperty.INTERACTIVE_COMPONENT_STATE)).
      state !== EmbeddedComponentState.EXPANDED)
      {
        this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, true);
      }
    }

    /**
     * Determines whether a click should be used for navigation.  Navigate should
     * occur unless the click is on the system layer, or on an element that
     * defines on="tap:..."
     * @param {!Event} event 'click' event.
     * @return {boolean} true, if the click should be used for navigation.
     * @private
     */ }, { key: "isNavigationalClick_", value:
    function isNavigationalClick_(event) {
      return !closest( /** @type {!Element} */(
      event.target),
      function (el) {
        return hasTapAction(el);
      },
      /* opt_stopAt */this.element_);

    }

    /**
     * We want clicks on certain elements to be exempted from normal page
     * navigation
     * @param {!Event} event
     * @return {boolean}
     * @private
     */ }, { key: "isProtectedTarget_", value:
    function isProtectedTarget_(event) {
      return !!closest( /** @type {!Element} */(
      event.target),
      function (el) {
        var elementRole = el.getAttribute('role');

        if (elementRole) {
          return !!TAPPABLE_ARIA_ROLES[elementRole.toLowerCase()];
        }
        return false;
      },
      /* opt_stopAt */this.element_);

    }

    /**
     * Checks if the event should be handled by ManualAdvancement, or should
     * follow its capture phase.
     * @param {!Event} event
     * @return {boolean}
     * @private
     */ }, { key: "shouldHandleEvent_", value:
    function shouldHandleEvent_(event) {var _this4 = this;
      var shouldHandleEvent = false;
      var tagName;

      closest( /** @type {!Element} */(
      event.target),
      function (el) {
        tagName = el.tagName.toLowerCase();

        if (
        tagName === 'amp-story-page-attachment' ||
        tagName === 'amp-story-page-outlink')
        {
          shouldHandleEvent = false;
          return true;
        }

        if (
        tagName.startsWith('amp-story-interactive-') && (
        !_this4.isInStoryPageSideEdge_(event, _this4.getStoryPageRect_()) ||
        event.path[0].classList.contains(
        'i-amphtml-story-interactive-disclaimer-icon')))

        {
          shouldHandleEvent = false;
          return true;
        }
        if (
        el.classList.contains(
        'i-amphtml-story-interactive-disclaimer-dialog-container'))

        {
          shouldHandleEvent = false;
          return true;
        }

        if (tagName === 'amp-story-page') {
          shouldHandleEvent = true;
          return true;
        }

        return false;
      },
      /* opt_stopAt */this.element_);


      return shouldHandleEvent;
    }

    /**
     * For an element to trigger a tooltip it has to be descendant of
     * amp-story-page but not of amp-story-cta-layer, amp-story-page-attachment or amp-story-page-outlink.
     * @param {!Event} event
     * @param {!ClientRect} pageRect
     * @return {boolean}
     * @private
     */ }, { key: "canShowTooltip_", value:
    function canShowTooltip_(event, pageRect) {
      var valid = true;
      var tagName;
      // We have a `pointer-events: none` set to all children of <a> tags inside
      // of amp-story-grid-layer, which acts as a click shield, making sure we
      // handle the click before navigation (see amp-story.css). It also ensures
      // we always get the <a> to be the target, even if it has children (e.g.
      // <span>).
      var target = /** @type {!Element} */(event.target);

      var canShow = !!closest(
      target,
      function (el) {
        tagName = el.tagName.toLowerCase();

        if (
        tagName === 'amp-story-cta-layer' ||
        tagName === 'amp-story-page-attachment' ||
        tagName === 'amp-story-page-outlink')
        {
          valid = false;
          return false;
        }

        return tagName === 'amp-story-page' && valid;
      },
      /* opt_stopAt */this.element_);


      if (
      canShow && (
      this.isInStoryPageSideEdge_(event, pageRect) ||
      this.isTooLargeOnPage_(event, pageRect)))
      {
        event.preventDefault();
        return false;
      }

      if (
      target.getAttribute('show-tooltip') === 'auto' &&
      this.isInScreenBottom_(target, pageRect))
      {
        target.setAttribute('target', '_blank');
        target.setAttribute('role', 'link');
        return false;
      }

      return canShow;
    }

    /**
     * Checks if element is inside of the bottom region of the screen.
     * @param {!Element} target
     * @param {!ClientRect} pageRect
     * @return {boolean}
     * @private
     */ }, { key: "isInScreenBottom_", value:
    function isInScreenBottom_(target, pageRect) {
      var targetRect = target. /*OK*/getBoundingClientRect();
      return targetRect.top - pageRect.top >= pageRect.height * TOP_REGION;
    }

    /**
     * Checks if click was inside of one of the side edges of the page.
     * @param {!Event} event
     * @param {!ClientRect} pageRect
     * @return {boolean}
     * @private
     */ }, { key: "isInStoryPageSideEdge_", value:
    function isInStoryPageSideEdge_(event, pageRect) {
      // Clicks with coordinates (0,0) are assumed to be from keyboard or Talkback.
      // These clicks should never be overriden for navigation.
      if (event.clientX === 0 && event.clientY === 0) {
        return false;
      }

      var sideEdgeWidthFromPercent =
      pageRect.width * (PROTECTED_SCREEN_EDGE_PERCENT / 100);
      var sideEdgeLimit = Math.max(
      sideEdgeWidthFromPercent,
      MINIMUM_PROTECTED_SCREEN_EDGE_PX);


      return (
      event.clientX <= pageRect.x + sideEdgeLimit ||
      event.clientX >= pageRect.x + pageRect.width - sideEdgeLimit);

    }

    /**
     * Checks if click target is too large on the page and preventing navigation.
     * If yes, the link is ignored & logged.
     * @param {!Event} event
     * @param {!ClientRect} pageRect
     * @return {boolean}
     * @private
     */ }, { key: "isTooLargeOnPage_", value:
    function isTooLargeOnPage_(event, pageRect) {
      // Clicks with coordinates (0,0) are assumed to be from keyboard or Talkback.
      // These clicks should never be overriden for navigation.
      if (event.clientX === 0 && event.clientY === 0) {
        return false;
      }

      var target = /** @type {!Element} */(event.target);
      var targetRect = target. /*OK*/getBoundingClientRect();
      if (
      (targetRect.height * targetRect.width) / (
      pageRect.width * pageRect.height) >=
      MAX_LINK_SCREEN_PERCENT)
      {
        user().error(
        'AMP-STORY-PAGE',
        'Link was too large; skipped for navigation. For more information, see https://github.com/ampproject/amphtml/issues/31108');

        return true;
      }
      return false;
    }

    /**
     * Checks if click should be handled by the embedded component logic rather
     * than by navigation.
     * @param {!Event} event
     * @param {!ClientRect} pageRect
     * @return {boolean}
     * @private
     */ }, { key: "isHandledByEmbeddedComponent_", value:
    function isHandledByEmbeddedComponent_(event, pageRect) {
      var target = /** @type {!Element} */(event.target);
      var stored = /** @type {InteractiveComponentDef} */(
      this.storeService_.get(StateProperty.INTERACTIVE_COMPONENT_STATE));

      var inExpandedMode = stored.state === EmbeddedComponentState.EXPANDED;

      return (
      inExpandedMode || (
      matches(target, INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS) &&
      this.canShowTooltip_(event, pageRect)));

    }

    /**
     * Check if click should be handled by the affiliate link logic.
     * @param {!Element} target
     * @private
     * @return {boolean}
     */ }, { key: "isHandledByAffiliateLink_", value:
    function isHandledByAffiliateLink_(target) {
      var clickedOnLink = matches(target, AFFILIATE_LINK_SELECTOR);

      // do not handle if clicking on expanded affiliate link
      if (clickedOnLink && target.hasAttribute('expanded')) {
        return false;
      }

      var expandedElement = this.storeService_.get(
      StateProperty.AFFILIATE_LINK_STATE);


      return expandedElement != null || clickedOnLink;
    }

    /**
     * Performs a system navigation if it is determined that the specified event
     * was a click intended for navigation.
     * @param {!Event} event 'click' event
     * @private
     */ }, { key: "maybePerformNavigation_", value:
    function maybePerformNavigation_(event) {
      var target = /** @type {!Element} */(event.target);

      var pageRect = this.getStoryPageRect_();

      if (this.isHandledByEmbeddedComponent_(event, pageRect)) {
        event.stopPropagation();
        event.preventDefault();
        var embedComponent = /** @type {InteractiveComponentDef} */(
        this.storeService_.get(StateProperty.INTERACTIVE_COMPONENT_STATE));

        this.storeService_.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
          element: target,
          state: embedComponent.state || EmbeddedComponentState.FOCUSED,
          clientX: event.clientX,
          clientY: event.clientY });

        return;
      }

      if (this.isHandledByAffiliateLink_(target)) {
        event.preventDefault();
        event.stopPropagation();
        var clickedOnLink = matches(target, AFFILIATE_LINK_SELECTOR);
        if (clickedOnLink) {
          this.storeService_.dispatch(Action.TOGGLE_AFFILIATE_LINK, target);
        } else {
          this.storeService_.dispatch(Action.TOGGLE_AFFILIATE_LINK, null);
        }
        return;
      }

      if (
      !this.isRunning() ||
      !this.isNavigationalClick_(event) ||
      this.isProtectedTarget_(event) ||
      !this.shouldHandleEvent_(event))
      {
        // If the system doesn't need to handle this click, then we can simply
        // return and let the event propagate as it would have otherwise.
        return;
      }

      event.stopPropagation();

      this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE);


      // Using `left` as a fallback since Safari returns a ClientRect in some
      // cases.
      var offsetLeft = 'x' in pageRect ? pageRect.x : pageRect.left;

      var page = {
        // Offset starting left of the page.
        offset: offsetLeft,
        width: pageRect.width,
        clickEventX: event.pageX };


      this.onTapNavigation(this.getTapDirection_(page));
    }

    /**
     * Calculates the pageRect based on the UIType.
     * We can an use LayoutBox for mobile since the story page occupies entire screen.
     * Desktop UI needs the most recent value from the getBoundingClientRect function.
     * @return {DOMRect | LayoutBox}
     * @private
     */ }, { key: "getStoryPageRect_", value:
    function getStoryPageRect_() {
      var uiState = this.storeService_.get(StateProperty.UI_STATE);
      if (
      uiState !== UIType.DESKTOP_PANELS &&
      uiState !== UIType.DESKTOP_ONE_PANEL)
      {
        return this.element_.getLayoutBox();
      } else {
        return this.element_.
        querySelector('amp-story-page[active]').
        /*OK*/getBoundingClientRect();
      }
    }

    /**
     * Decides what direction to navigate depending on which
     * section of the page was there a click. The navigation direction of each
     * individual section has been previously defined depending on the language
     * settings.
     * @param {!Object} page
     * @return {number}
     * @private
     */ }, { key: "getTapDirection_", value:
    function getTapDirection_(page) {
      var _this$sections_ = this.sections_,left = _this$sections_.left,right = _this$sections_.right;

      if (page.clickEventX <= page.offset + left.widthRatio * page.width) {
        return left.direction;
      }

      return right.direction;
    }

    /**
     * Gets an instance of ManualAdvancement based on the HTML tag of the element.
     * @param {!Window} win
     * @param {!Element} element
     * @return {?AdvancementConfig} An AdvancementConfig, only if the element is
     *                              an amp-story tag.
     */ }], [{ key: "fromElement", value:
    function fromElement(win, element) {
      if (element.tagName.toLowerCase() !== 'amp-story') {
        return null;
      }
      return new ManualAdvancement(win, element);
    } }]);return ManualAdvancement;}(AdvancementConfig);


/**
 * Provides progress and advancement based on a fixed duration of time,
 * specified in either seconds or milliseconds.
 */
export var TimeBasedAdvancement = /*#__PURE__*/function (_AdvancementConfig2) {_inherits(TimeBasedAdvancement, _AdvancementConfig2);var _super2 = _createSuper(TimeBasedAdvancement);
  /**
   * @param {!Window} win The Window object.
   * @param {number} delayMs The duration to wait before advancing.
   * @param {!Element} element
   */
  function TimeBasedAdvancement(win, delayMs, element) {var _this5;_classCallCheck(this, TimeBasedAdvancement);
    _this5 = _super2.call(this);

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    _this5.timer_ = Services.timerFor(win);

    if (delayMs < MINIMUM_TIME_BASED_AUTO_ADVANCE_MS) {
      user().warn(
      'AMP-STORY-PAGE',
      "".concat(element.id, " has an auto advance duration that is too short. ") + "".concat(
      MINIMUM_TIME_BASED_AUTO_ADVANCE_MS, "ms is used instead."));

      delayMs = MINIMUM_TIME_BASED_AUTO_ADVANCE_MS;
    }
    /** @private @const {number} */
    _this5.delayMs_ = delayMs;

    /** @private {?number} */
    _this5.remainingDelayMs_ = null;

    /** @private {?number} */
    _this5.startTimeMs_ = null;

    /** @private {number|string|null} */
    _this5.timeoutId_ = null;

    if (element.ownerDocument.defaultView) {
      /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
      _this5.storeService_ = getStoreService(element.ownerDocument.defaultView);
    }return _this5;
  }

  /**
   * @return {number} The current timestamp, in milliseconds.
   * @private
   */_createClass(TimeBasedAdvancement, [{ key: "getCurrentTimestampMs_", value:
    function getCurrentTimestampMs_() {
      return Date.now();
    }

    /** @override */ }, { key: "start", value:
    function start() {var _this6 = this;
      _get(_getPrototypeOf(TimeBasedAdvancement.prototype), "start", this).call(this);

      if (this.remainingDelayMs_) {
        this.startTimeMs_ =
        this.getCurrentTimestampMs_() - (
        this.delayMs_ - this.remainingDelayMs_);
      } else {
        this.startTimeMs_ = this.getCurrentTimestampMs_();
      }

      this.timeoutId_ = this.timer_.delay(
      function () {return _this6.onAdvance();},
      this.remainingDelayMs_ || this.delayMs_);


      this.onProgressUpdate();

      this.timer_.poll(POLL_INTERVAL_MS, function () {
        _this6.onProgressUpdate();
        return !_this6.isRunning();
      });
    }

    /** @override */ }, { key: "stop", value:
    function stop() {var canResume = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      _get(_getPrototypeOf(TimeBasedAdvancement.prototype), "stop", this).call(this);

      if (this.timeoutId_ !== null) {
        this.timer_.cancel(this.timeoutId_);
      }

      // Store the remaining time if the advancement can be resume, ie: if it is
      // paused.
      this.remainingDelayMs_ = canResume ?
      this.startTimeMs_ + this.delayMs_ - this.getCurrentTimestampMs_() :
      null;
    }

    /**
     * @override
     */ }, { key: "isAutoAdvance", value:
    function isAutoAdvance() {
      return true;
    }

    /** @override */ }, { key: "getProgress", value:
    function getProgress() {
      if (this.startTimeMs_ === null) {
        return 0;
      }

      var progress =
      (this.getCurrentTimestampMs_() - this.startTimeMs_) / this.delayMs_;

      return Math.min(Math.max(progress, 0), 1);
    }

    /** @override */ }, { key: "onAdvance", value:
    function onAdvance() {
      this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.AUTO_ADVANCE_TIME);

      _get(_getPrototypeOf(TimeBasedAdvancement.prototype), "onAdvance", this).call(this);
    }

    /**
     * Updates the delay (and derived values) from the given auto-advance string.
     * @param {string} autoAdvanceStr The value of the updated auto-advance-after attribute.
     */ }, { key: "updateTimeDelay", value:
    function updateTimeDelay(autoAdvanceStr) {
      var newDelayMs = timeStrToMillis(autoAdvanceStr);
      if (newDelayMs === undefined || isNaN(newDelayMs)) {
        return;
      }
      if (this.remainingDelayMs_) {
        this.remainingDelayMs_ += newDelayMs - this.delayMs_;
      }
      this.delayMs_ = newDelayMs;
    }

    /**
     * Gets an instance of TimeBasedAdvancement based on the value of the
     * auto-advance string (from the 'auto-advance-after' attribute on the page).
     * @param {string} autoAdvanceStr The value of the auto-advance-after
     *     attribute.
     * @param {!Window} win
     * @param {!Element} element
     * @return {?AdvancementConfig} An AdvancementConfig, if time-based
     *     auto-advance is supported for the specified auto-advance string; null
     *     otherwise.
     */ }], [{ key: "fromAutoAdvanceString", value:
    function fromAutoAdvanceString(autoAdvanceStr, win, element) {
      if (!autoAdvanceStr) {
        return null;
      }

      var delayMs = timeStrToMillis(autoAdvanceStr);
      if (delayMs === undefined || isNaN(delayMs)) {
        return null;
      }

      return new TimeBasedAdvancement(win, Number(delayMs), element);
    } }]);return TimeBasedAdvancement;}(AdvancementConfig);


/**
 * Provides progress and advances pages based on the completion percentage of
 * playback of an HTMLMediaElement or a video that implements the AMP
 * video-interface.
 *
 * These are combined into a single AdvancementConfig implementation because we
 * may not know at build time whether a video implements the AMP
 * video-interface, since that is dependent on the amp-video buildCallback
 * having been executed before the amp-story-page buildCallback, which is not
 * guaranteed.
 */
export var MediaBasedAdvancement = /*#__PURE__*/function (_AdvancementConfig3) {_inherits(MediaBasedAdvancement, _AdvancementConfig3);var _super3 = _createSuper(MediaBasedAdvancement);
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  function MediaBasedAdvancement(win, element) {var _this7;_classCallCheck(this, MediaBasedAdvancement);
    _this7 = _super3.call(this);

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    _this7.timer_ = Services.timerFor(win);

    /** @private {!Element} */
    _this7.element_ = element;

    /** @private {?Element} */
    _this7.mediaElement_ = null;

    /** @private {!Array<!UnlistenDef>} */
    _this7.unlistenFns_ = [];

    /** @protected {?UnlistenDef} */
    _this7.unlistenEndedFn_ = null;

    /** @protected {?UnlistenDef} */
    _this7.unlistenTimeupdateFn_ = null;

    /** @private {?../../../src/video-interface.VideoInterface} */
    _this7.video_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    _this7.storeService_ = getStoreService(win);return _this7;
  }

  /**
   * Determines whether the element for auto advancement implements the video
   * interface.
   * @return {boolean} true, if the specified element implements the video
   *     interface.
   * @private
   */_createClass(MediaBasedAdvancement, [{ key: "isVideoInterfaceVideo_", value:
    function isVideoInterfaceVideo_() {
      return this.element_.classList.contains('i-amphtml-video-interface');
    }

    /**
     * Gets an HTMLMediaElement from an element that wraps it.
     * @return {?Element} The underlying HTMLMediaElement, if one exists.
     * @private
     */ }, { key: "getMediaElement_", value:
    function getMediaElement_() {
      var tagName = this.element_.tagName.toLowerCase();

      if (this.element_ instanceof HTMLMediaElement) {
        return this.element_;
      } else if (
      this.element_.hasAttribute('background-audio') &&
      tagName === 'amp-story-page')
      {
        return this.element_.querySelector('.i-amphtml-story-background-audio');
      } else if (tagName === 'amp-audio') {
        return this.element_.querySelector('audio');
      }

      return null;
    }

    /** @override */ }, { key: "start", value:
    function start() {var _this8 = this;
      _get(_getPrototypeOf(MediaBasedAdvancement.prototype), "start", this).call(this);

      // Prevents race condition when checking for video interface classname.
      (this.element_.build ? this.element_.build() : _resolvedPromise()).then(function () {return (
          _this8.startWhenBuilt_());});

    }

    /** @private */ }, { key: "startWhenBuilt_", value:
    function startWhenBuilt_() {
      if (this.isVideoInterfaceVideo_()) {
        this.startVideoInterfaceElement_();
        return;
      }

      if (!this.mediaElement_) {
        this.mediaElement_ = this.getMediaElement_();
      }

      if (this.mediaElement_) {
        this.startHtmlMediaElement_();
        return;
      }

      user().error(
      'AMP-STORY-PAGE',
      "Element with ID ".concat(this.element_.id, " is not a media element ") +
      'supported for automatic advancement.');

    }

    /** @private */ }, { key: "startHtmlMediaElement_", value:
    function startHtmlMediaElement_() {var _this9 = this;
      var mediaElement = /** @type {!Element} */(
      this.mediaElement_);



      // Removes [loop] attribute if specified, so the 'ended' event can trigger.
      this.mediaElement_.removeAttribute('loop');

      this.unlistenFns_.push(
      listenOnce(mediaElement, 'ended', function () {return _this9.onAdvance();}));


      this.onProgressUpdate();

      this.timer_.poll(POLL_INTERVAL_MS, function () {
        _this9.onProgressUpdate();
        return !_this9.isRunning();
      });
    }

    /** @private */ }, { key: "startVideoInterfaceElement_", value:
    function startVideoInterfaceElement_() {var _this10 = this;
      this.element_.getImpl().then(function (video) {
        _this10.video_ = video;
      });

      // Removes [loop] attribute if specified, so the 'ended' event can trigger.
      this.element_.querySelector('video').removeAttribute('loop');

      this.unlistenFns_.push(
      listenOnce(this.element_, VideoEvents.ENDED, function () {return _this10.onAdvance();}, {
        capture: true }));



      this.onProgressUpdate();

      this.timer_.poll(POLL_INTERVAL_MS, function () {
        _this10.onProgressUpdate();
        return !_this10.isRunning();
      });
    }

    /** @override */ }, { key: "stop", value:
    function stop() {
      _get(_getPrototypeOf(MediaBasedAdvancement.prototype), "stop", this).call(this);
      this.unlistenFns_.forEach(function (fn) {return fn();});
    }

    /**
     * @override
     */ }, { key: "isAutoAdvance", value:
    function isAutoAdvance() {
      return true;
    }

    /** @override */ }, { key: "getProgress", value:
    function getProgress() {
      if (this.isVideoInterfaceVideo_()) {
        if (this.video_ && this.video_.getDuration()) {
          return this.video_.getCurrentTime() / this.video_.getDuration();
        }

        return 0;
      }

      if (this.mediaElement_ && this.mediaElement_.duration) {
        return this.mediaElement_.currentTime / this.mediaElement_.duration;
      }

      return _get(_getPrototypeOf(MediaBasedAdvancement.prototype), "getProgress", this).call(this);
    }

    /** @override */ }, { key: "onAdvance", value:
    function onAdvance() {
      this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.AUTO_ADVANCE_MEDIA);

      _get(_getPrototypeOf(MediaBasedAdvancement.prototype), "onAdvance", this).call(this);
    }

    /**
     * Gets an instance of MediaBasedAdvancement based on the value of the
     * auto-advance string (from the 'auto-advance-after' attribute on the page).
     * @param {string} autoAdvanceStr The value of the auto-advance-after
     *     attribute.
     * @param {!Window} win
     * @param {!Element} pageEl
     * @return {?AdvancementConfig} An AdvancementConfig, if media-element-based
     *     auto-advance is supported for the specified auto-advance string; null
     *     otherwise.
     */ }], [{ key: "fromAutoAdvanceString", value:
    function fromAutoAdvanceString(autoAdvanceStr, win, pageEl) {
      try {
        // amp-video, amp-audio, as well as amp-story-page with a background audio
        // are eligible for media based auto advance.
        var element = pageEl.querySelector("amp-video[data-id=".concat(
        escapeCssSelectorIdent(autoAdvanceStr), "],\n          amp-video#").concat(
        escapeCssSelectorIdent(autoAdvanceStr), ",\n          amp-audio[data-id=").concat(
        escapeCssSelectorIdent(autoAdvanceStr), "],\n          amp-audio#").concat(
        escapeCssSelectorIdent(autoAdvanceStr)));

        if (
        matches(
        pageEl, "amp-story-page[background-audio]#".concat(
        escapeCssSelectorIdent(
        autoAdvanceStr))))


        {
          element = pageEl;
        }
        if (!element) {
          if (autoAdvanceStr) {
            user().warn(
            'AMP-STORY-PAGE',
            "Element with ID ".concat(pageEl.id, " has no media element ") +
            'supported for automatic advancement.');

          }
          return null;
        }

        return new MediaBasedAdvancement(win, element);
      } catch (e) {
        return null;
      }
    } }]);return MediaBasedAdvancement;}(AdvancementConfig);
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/page-advancement.js