import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
import { Action, EmbeddedComponentState, InteractiveComponentDef, StateProperty, UIType, getStoreService } from "./amp-story-store-service";
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
var INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS = Object.values(interactiveElementsSelectors()).join(',');

/** @const {number} */
export var POLL_INTERVAL_MS = 300;

/** @const @enum */
export var TapNavigationDirection = {
  'NEXT': 1,
  'PREVIOUS': 2
};

/**
 * Base class for the AdvancementConfig.  By default, does nothing other than
 * tracking its internal state when started/stopped, and listeners will never be
 * invoked.
 */
export var AdvancementConfig = /*#__PURE__*/function () {
  /**
   * @public
   */
  function AdvancementConfig() {
    _classCallCheck(this, AdvancementConfig);

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
   */
  _createClass(AdvancementConfig, [{
    key: "addProgressListener",
    value: function addProgressListener(progressListener) {
      this.progressListeners_.push(progressListener);
    }
    /**
     * @param {function()} advanceListener A function that handles when a
     *     page should be advanced.
     */

  }, {
    key: "addAdvanceListener",
    value: function addAdvanceListener(advanceListener) {
      this.advanceListeners_.push(advanceListener);
    }
    /**
     * @param {function()} previousListener A function that handles when a
     *     page should go back to the previous page.
     */

  }, {
    key: "addPreviousListener",
    value: function addPreviousListener(previousListener) {
      this.previousListeners_.push(previousListener);
    }
    /**
     * @param {function(number)} onTapNavigationListener A function that handles when a
     * navigation listener to be fired.
     */

  }, {
    key: "addOnTapNavigationListener",
    value: function addOnTapNavigationListener(onTapNavigationListener) {
      this.tapNavigationListeners_.push(onTapNavigationListener);
    }
    /**
     * Invoked when the advancement configuration should begin taking effect.
     */

  }, {
    key: "start",
    value: function start() {
      this.isRunning_ = true;
    }
    /**
     * Invoked when the advancement configuration should cease taking effect.
     * @param {boolean=} unusedCanResume
     */

  }, {
    key: "stop",
    value: function stop(unusedCanResume) {
      this.isRunning_ = false;
    }
    /**
     * Returns whether the advancement configuration will automatically advance
     * @return {boolean}
     */

  }, {
    key: "isAutoAdvance",
    value: function isAutoAdvance() {
      return false;
    }
    /**
     * @return {boolean}
     * @protected
     */

  }, {
    key: "isRunning",
    value: function isRunning() {
      return this.isRunning_;
    }
    /**
     * @return {number}
     */

  }, {
    key: "getProgress",
    value: function getProgress() {
      return 1;
    }
    /** @protected */

  }, {
    key: "onProgressUpdate",
    value: function onProgressUpdate() {
      var progress = this.getProgress();
      this.progressListeners_.forEach(function (progressListener) {
        progressListener(progress);
      });
    }
    /** @protected */

  }, {
    key: "onAdvance",
    value: function onAdvance() {
      this.advanceListeners_.forEach(function (advanceListener) {
        advanceListener();
      });
    }
    /** @protected */

  }, {
    key: "onPrevious",
    value: function onPrevious() {
      this.previousListeners_.forEach(function (previousListener) {
        previousListener();
      });
    }
    /**
     * @param {number} navigationDirection Direction of navigation
     * @protected
     */

  }, {
    key: "onTapNavigation",
    value: function onTapNavigation(navigationDirection) {
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
     */

  }], [{
    key: "forElement",
    value: function forElement(win, element) {
      var manualAdvancement = ManualAdvancement.fromElement(win, element);

      if (manualAdvancement) {
        return manualAdvancement;
      }

      var autoAdvanceStr = element.getAttribute('auto-advance-after');

      if (autoAdvanceStr) {
        var timeBasedAdvancement = TimeBasedAdvancement.fromAutoAdvanceString(autoAdvanceStr, win, element);

        if (timeBasedAdvancement) {
          return timeBasedAdvancement;
        }

        var mediaBasedAdvancement = MediaBasedAdvancement.fromAutoAdvanceString(autoAdvanceStr, win, element);

        if (mediaBasedAdvancement) {
          return mediaBasedAdvancement;
        }
      }

      return new AdvancementConfig();
    }
  }]);

  return AdvancementConfig;
}();

/**
 * Always provides a progress of 1.0.  Advances when the user taps the
 * corresponding section, depending on language settings.
 */
export var ManualAdvancement = /*#__PURE__*/function (_AdvancementConfig) {
  _inherits(ManualAdvancement, _AdvancementConfig);

  var _super = _createSuper(ManualAdvancement);

  /**
   * @param {!Window} win The Window object.
   * @param {!Element} element The element that, when clicked, can cause
   *     advancing to the next page or going back to the previous.
   */
  function ManualAdvancement(win, element) {
    var _this;

    _classCallCheck(this, ManualAdvancement);

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
        widthRatio: rtlState ? NEXT_SCREEN_AREA_RATIO : PREVIOUS_SCREEN_AREA_RATIO,
        direction: rtlState ? TapNavigationDirection.NEXT : TapNavigationDirection.PREVIOUS
      },
      right: {
        widthRatio: rtlState ? PREVIOUS_SCREEN_AREA_RATIO : NEXT_SCREEN_AREA_RATIO,
        direction: rtlState ? TapNavigationDirection.PREVIOUS : TapNavigationDirection.NEXT
      }
    };
    return _this;
  }

  /** @override */
  _createClass(ManualAdvancement, [{
    key: "getProgress",
    value: function getProgress() {
      return 1.0;
    }
    /**
     * Binds the event listeners.
     * @private
     */

  }, {
    key: "startListening_",
    value: function startListening_() {
      var _this2 = this;

      this.element_.addEventListener('touchstart', this.onTouchstart_.bind(this), true);
      this.element_.addEventListener('touchend', this.onTouchend_.bind(this), true);
      this.element_.addEventListener('click', this.maybePerformNavigation_.bind(this), true);
      this.ampdoc_.onVisibilityChanged(function () {
        _this2.ampdoc_.isVisible() ? _this2.processTouchend_() : null;
      });
    }
    /**
     * @override
     */

  }, {
    key: "isAutoAdvance",
    value: function isAutoAdvance() {
      return false;
    }
    /**
     * TouchEvent touchstart events handler.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchstart_",
    value: function onTouchstart_(event) {
      var _this3 = this;

      // Don't start the paused state if the event should not be handled by this
      // class. Also ignores any subsequent touchstart that would happen before
      // touchend was fired, since it'd reset the touchstartTimestamp (ie: user
      // touches the screen with a second finger).
      if (this.touchstartTimestamp_ || !this.shouldHandleEvent_(event)) {
        return;
      }

      this.touchstartTimestamp_ = Date.now();
      this.pausedState_ =
      /** @type {boolean} */
      this.storeService_.get(StateProperty.PAUSED_STATE);
      this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);
      this.timeoutId_ = this.timer_.delay(function () {
        _this3.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);
      }, HOLD_TOUCH_THRESHOLD_MS);
    }
    /**
     * TouchEvent touchend events handler.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchend_",
    value: function onTouchend_(event) {
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
     */

  }, {
    key: "processTouchend_",
    value: function processTouchend_() {
      if (!this.touchstartTimestamp_) {
        return;
      }

      this.storeService_.dispatch(Action.TOGGLE_PAUSED, this.pausedState_);
      this.touchstartTimestamp_ = null;
      this.timer_.cancel(this.timeoutId_);
      this.timeoutId_ = null;

      if (!this.storeService_.get(StateProperty.SYSTEM_UI_IS_VISIBLE_STATE) &&
      /** @type {InteractiveComponentDef} */
      this.storeService_.get(StateProperty.INTERACTIVE_COMPONENT_STATE).state !== EmbeddedComponentState.EXPANDED) {
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
     */

  }, {
    key: "isNavigationalClick_",
    value: function isNavigationalClick_(event) {
      return !closest(dev().assertElement(event.target), function (el) {
        return hasTapAction(el);
      },
      /* opt_stopAt */
      this.element_);
    }
    /**
     * We want clicks on certain elements to be exempted from normal page
     * navigation
     * @param {!Event} event
     * @return {boolean}
     * @private
     */

  }, {
    key: "isProtectedTarget_",
    value: function isProtectedTarget_(event) {
      return !!closest(dev().assertElement(event.target), function (el) {
        var elementRole = el.getAttribute('role');

        if (elementRole) {
          return !!TAPPABLE_ARIA_ROLES[elementRole.toLowerCase()];
        }

        return false;
      },
      /* opt_stopAt */
      this.element_);
    }
    /**
     * Checks if the event should be handled by ManualAdvancement, or should
     * follow its capture phase.
     * @param {!Event} event
     * @return {boolean}
     * @private
     */

  }, {
    key: "shouldHandleEvent_",
    value: function shouldHandleEvent_(event) {
      var _this4 = this;

      var shouldHandleEvent = false;
      var tagName;
      closest(dev().assertElement(event.target), function (el) {
        tagName = el.tagName.toLowerCase();

        if (tagName === 'amp-story-page-attachment' || tagName === 'amp-story-page-outlink') {
          shouldHandleEvent = false;
          return true;
        }

        if (tagName.startsWith('amp-story-interactive-') && (!_this4.isInStoryPageSideEdge_(event, _this4.getStoryPageRect_()) || event.path[0].classList.contains('i-amphtml-story-interactive-disclaimer-icon'))) {
          shouldHandleEvent = false;
          return true;
        }

        if (el.classList.contains('i-amphtml-story-interactive-disclaimer-dialog-container')) {
          shouldHandleEvent = false;
          return true;
        }

        if (tagName === 'amp-story-page') {
          shouldHandleEvent = true;
          return true;
        }

        return false;
      },
      /* opt_stopAt */
      this.element_);
      return shouldHandleEvent;
    }
    /**
     * For an element to trigger a tooltip it has to be descendant of
     * amp-story-page but not of amp-story-cta-layer, amp-story-page-attachment or amp-story-page-outlink.
     * @param {!Event} event
     * @param {!ClientRect} pageRect
     * @return {boolean}
     * @private
     */

  }, {
    key: "canShowTooltip_",
    value: function canShowTooltip_(event, pageRect) {
      var valid = true;
      var tagName;
      // We have a `pointer-events: none` set to all children of <a> tags inside
      // of amp-story-grid-layer, which acts as a click shield, making sure we
      // handle the click before navigation (see amp-story.css). It also ensures
      // we always get the <a> to be the target, even if it has children (e.g.
      // <span>).
      var target = dev().assertElement(event.target);
      var canShow = !!closest(target, function (el) {
        tagName = el.tagName.toLowerCase();

        if (tagName === 'amp-story-cta-layer' || tagName === 'amp-story-page-attachment' || tagName === 'amp-story-page-outlink') {
          valid = false;
          return false;
        }

        return tagName === 'amp-story-page' && valid;
      },
      /* opt_stopAt */
      this.element_);

      if (canShow && (this.isInStoryPageSideEdge_(event, pageRect) || this.isTooLargeOnPage_(event, pageRect))) {
        event.preventDefault();
        return false;
      }

      if (target.getAttribute('show-tooltip') === 'auto' && this.isInScreenBottom_(target, pageRect)) {
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
     */

  }, {
    key: "isInScreenBottom_",
    value: function isInScreenBottom_(target, pageRect) {
      var targetRect = target.
      /*OK*/
      getBoundingClientRect();
      return targetRect.top - pageRect.top >= pageRect.height * TOP_REGION;
    }
    /**
     * Checks if click was inside of one of the side edges of the page.
     * @param {!Event} event
     * @param {!ClientRect} pageRect
     * @return {boolean}
     * @private
     */

  }, {
    key: "isInStoryPageSideEdge_",
    value: function isInStoryPageSideEdge_(event, pageRect) {
      // Clicks with coordinates (0,0) are assumed to be from keyboard or Talkback.
      // These clicks should never be overriden for navigation.
      if (event.clientX === 0 && event.clientY === 0) {
        return false;
      }

      var sideEdgeWidthFromPercent = pageRect.width * (PROTECTED_SCREEN_EDGE_PERCENT / 100);
      var sideEdgeLimit = Math.max(sideEdgeWidthFromPercent, MINIMUM_PROTECTED_SCREEN_EDGE_PX);
      return event.clientX <= pageRect.x + sideEdgeLimit || event.clientX >= pageRect.x + pageRect.width - sideEdgeLimit;
    }
    /**
     * Checks if click target is too large on the page and preventing navigation.
     * If yes, the link is ignored & logged.
     * @param {!Event} event
     * @param {!ClientRect} pageRect
     * @return {boolean}
     * @private
     */

  }, {
    key: "isTooLargeOnPage_",
    value: function isTooLargeOnPage_(event, pageRect) {
      // Clicks with coordinates (0,0) are assumed to be from keyboard or Talkback.
      // These clicks should never be overriden for navigation.
      if (event.clientX === 0 && event.clientY === 0) {
        return false;
      }

      var target = dev().assertElement(event.target);
      var targetRect = target.
      /*OK*/
      getBoundingClientRect();

      if (targetRect.height * targetRect.width / (pageRect.width * pageRect.height) >= MAX_LINK_SCREEN_PERCENT) {
        user().error('AMP-STORY-PAGE', 'Link was too large; skipped for navigation. For more information, see https://github.com/ampproject/amphtml/issues/31108');
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
     */

  }, {
    key: "isHandledByEmbeddedComponent_",
    value: function isHandledByEmbeddedComponent_(event, pageRect) {
      var target = dev().assertElement(event.target);
      var stored =
      /** @type {InteractiveComponentDef} */
      this.storeService_.get(StateProperty.INTERACTIVE_COMPONENT_STATE);
      var inExpandedMode = stored.state === EmbeddedComponentState.EXPANDED;
      return inExpandedMode || matches(target, INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS) && this.canShowTooltip_(event, pageRect);
    }
    /**
     * Check if click should be handled by the affiliate link logic.
     * @param {!Element} target
     * @private
     * @return {boolean}
     */

  }, {
    key: "isHandledByAffiliateLink_",
    value: function isHandledByAffiliateLink_(target) {
      var clickedOnLink = matches(target, AFFILIATE_LINK_SELECTOR);

      // do not handle if clicking on expanded affiliate link
      if (clickedOnLink && target.hasAttribute('expanded')) {
        return false;
      }

      var expandedElement = this.storeService_.get(StateProperty.AFFILIATE_LINK_STATE);
      return expandedElement != null || clickedOnLink;
    }
    /**
     * Performs a system navigation if it is determined that the specified event
     * was a click intended for navigation.
     * @param {!Event} event 'click' event
     * @private
     */

  }, {
    key: "maybePerformNavigation_",
    value: function maybePerformNavigation_(event) {
      var target = dev().assertElement(event.target);
      var pageRect = this.getStoryPageRect_();

      if (this.isHandledByEmbeddedComponent_(event, pageRect)) {
        event.stopPropagation();
        event.preventDefault();
        var embedComponent =
        /** @type {InteractiveComponentDef} */
        this.storeService_.get(StateProperty.INTERACTIVE_COMPONENT_STATE);
        this.storeService_.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
          element: target,
          state: embedComponent.state || EmbeddedComponentState.FOCUSED,
          clientX: event.clientX,
          clientY: event.clientY
        });
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

      if (!this.isRunning() || !this.isNavigationalClick_(event) || this.isProtectedTarget_(event) || !this.shouldHandleEvent_(event)) {
        // If the system doesn't need to handle this click, then we can simply
        // return and let the event propagate as it would have otherwise.
        return;
      }

      event.stopPropagation();
      this.storeService_.dispatch(Action.SET_ADVANCEMENT_MODE, AdvancementMode.MANUAL_ADVANCE);
      // Using `left` as a fallback since Safari returns a ClientRect in some
      // cases.
      var offsetLeft = 'x' in pageRect ? pageRect.x : pageRect.left;
      var page = {
        // Offset starting left of the page.
        offset: offsetLeft,
        width: pageRect.width,
        clickEventX: event.pageX
      };
      this.onTapNavigation(this.getTapDirection_(page));
    }
    /**
     * Calculates the pageRect based on the UIType.
     * We can an use LayoutBox for mobile since the story page occupies entire screen.
     * Desktop UI needs the most recent value from the getBoundingClientRect function.
     * @return {DOMRect | LayoutBox}
     * @private
     */

  }, {
    key: "getStoryPageRect_",
    value: function getStoryPageRect_() {
      var uiState = this.storeService_.get(StateProperty.UI_STATE);

      if (uiState !== UIType.DESKTOP_PANELS && uiState !== UIType.DESKTOP_ONE_PANEL) {
        return this.element_.getLayoutBox();
      } else {
        return this.element_.querySelector('amp-story-page[active]').
        /*OK*/
        getBoundingClientRect();
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
     */

  }, {
    key: "getTapDirection_",
    value: function getTapDirection_(page) {
      var _this$sections_ = this.sections_,
          left = _this$sections_.left,
          right = _this$sections_.right;

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
     */

  }], [{
    key: "fromElement",
    value: function fromElement(win, element) {
      if (element.tagName.toLowerCase() !== 'amp-story') {
        return null;
      }

      return new ManualAdvancement(win, element);
    }
  }]);

  return ManualAdvancement;
}(AdvancementConfig);

/**
 * Provides progress and advancement based on a fixed duration of time,
 * specified in either seconds or milliseconds.
 */
export var TimeBasedAdvancement = /*#__PURE__*/function (_AdvancementConfig2) {
  _inherits(TimeBasedAdvancement, _AdvancementConfig2);

  var _super2 = _createSuper(TimeBasedAdvancement);

  /**
   * @param {!Window} win The Window object.
   * @param {number} delayMs The duration to wait before advancing.
   * @param {!Element} element
   */
  function TimeBasedAdvancement(win, delayMs, element) {
    var _this5;

    _classCallCheck(this, TimeBasedAdvancement);

    _this5 = _super2.call(this);

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    _this5.timer_ = Services.timerFor(win);

    if (delayMs < MINIMUM_TIME_BASED_AUTO_ADVANCE_MS) {
      user().warn('AMP-STORY-PAGE', element.id + " has an auto advance duration that is too short. " + (MINIMUM_TIME_BASED_AUTO_ADVANCE_MS + "ms is used instead."));
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
    }

    return _this5;
  }

  /**
   * @return {number} The current timestamp, in milliseconds.
   * @private
   */
  _createClass(TimeBasedAdvancement, [{
    key: "getCurrentTimestampMs_",
    value: function getCurrentTimestampMs_() {
      return Date.now();
    }
    /** @override */

  }, {
    key: "start",
    value: function start() {
      var _this6 = this;

      _get(_getPrototypeOf(TimeBasedAdvancement.prototype), "start", this).call(this);

      if (this.remainingDelayMs_) {
        this.startTimeMs_ = this.getCurrentTimestampMs_() - (this.delayMs_ - this.remainingDelayMs_);
      } else {
        this.startTimeMs_ = this.getCurrentTimestampMs_();
      }

      this.timeoutId_ = this.timer_.delay(function () {
        return _this6.onAdvance();
      }, this.remainingDelayMs_ || this.delayMs_);
      this.onProgressUpdate();
      this.timer_.poll(POLL_INTERVAL_MS, function () {
        _this6.onProgressUpdate();

        return !_this6.isRunning();
      });
    }
    /** @override */

  }, {
    key: "stop",
    value: function stop(canResume) {
      if (canResume === void 0) {
        canResume = false;
      }

      _get(_getPrototypeOf(TimeBasedAdvancement.prototype), "stop", this).call(this);

      if (this.timeoutId_ !== null) {
        this.timer_.cancel(this.timeoutId_);
      }

      // Store the remaining time if the advancement can be resume, ie: if it is
      // paused.
      this.remainingDelayMs_ = canResume ? this.startTimeMs_ + this.delayMs_ - this.getCurrentTimestampMs_() : null;
    }
    /**
     * @override
     */

  }, {
    key: "isAutoAdvance",
    value: function isAutoAdvance() {
      return true;
    }
    /** @override */

  }, {
    key: "getProgress",
    value: function getProgress() {
      if (this.startTimeMs_ === null) {
        return 0;
      }

      var progress = (this.getCurrentTimestampMs_() - this.startTimeMs_) / this.delayMs_;
      return Math.min(Math.max(progress, 0), 1);
    }
    /** @override */

  }, {
    key: "onAdvance",
    value: function onAdvance() {
      this.storeService_.dispatch(Action.SET_ADVANCEMENT_MODE, AdvancementMode.AUTO_ADVANCE_TIME);

      _get(_getPrototypeOf(TimeBasedAdvancement.prototype), "onAdvance", this).call(this);
    }
    /**
     * Updates the delay (and derived values) from the given auto-advance string.
     * @param {string} autoAdvanceStr The value of the updated auto-advance-after attribute.
     */

  }, {
    key: "updateTimeDelay",
    value: function updateTimeDelay(autoAdvanceStr) {
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
     */

  }], [{
    key: "fromAutoAdvanceString",
    value: function fromAutoAdvanceString(autoAdvanceStr, win, element) {
      if (!autoAdvanceStr) {
        return null;
      }

      var delayMs = timeStrToMillis(autoAdvanceStr);

      if (delayMs === undefined || isNaN(delayMs)) {
        return null;
      }

      return new TimeBasedAdvancement(win, Number(delayMs), element);
    }
  }]);

  return TimeBasedAdvancement;
}(AdvancementConfig);

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
export var MediaBasedAdvancement = /*#__PURE__*/function (_AdvancementConfig3) {
  _inherits(MediaBasedAdvancement, _AdvancementConfig3);

  var _super3 = _createSuper(MediaBasedAdvancement);

  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  function MediaBasedAdvancement(win, element) {
    var _this7;

    _classCallCheck(this, MediaBasedAdvancement);

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
    _this7.storeService_ = getStoreService(win);
    return _this7;
  }

  /**
   * Determines whether the element for auto advancement implements the video
   * interface.
   * @return {boolean} true, if the specified element implements the video
   *     interface.
   * @private
   */
  _createClass(MediaBasedAdvancement, [{
    key: "isVideoInterfaceVideo_",
    value: function isVideoInterfaceVideo_() {
      return this.element_.classList.contains('i-amphtml-video-interface');
    }
    /**
     * Gets an HTMLMediaElement from an element that wraps it.
     * @return {?Element} The underlying HTMLMediaElement, if one exists.
     * @private
     */

  }, {
    key: "getMediaElement_",
    value: function getMediaElement_() {
      var tagName = this.element_.tagName.toLowerCase();

      if (this.element_ instanceof HTMLMediaElement) {
        return this.element_;
      } else if (this.element_.hasAttribute('background-audio') && tagName === 'amp-story-page') {
        return this.element_.querySelector('.i-amphtml-story-background-audio');
      } else if (tagName === 'amp-audio') {
        return this.element_.querySelector('audio');
      }

      return null;
    }
    /** @override */

  }, {
    key: "start",
    value: function start() {
      var _this8 = this;

      _get(_getPrototypeOf(MediaBasedAdvancement.prototype), "start", this).call(this);

      // Prevents race condition when checking for video interface classname.
      (this.element_.build ? this.element_.build() : _resolvedPromise()).then(function () {
        return _this8.startWhenBuilt_();
      });
    }
    /** @private */

  }, {
    key: "startWhenBuilt_",
    value: function startWhenBuilt_() {
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

      user().error('AMP-STORY-PAGE', "Element with ID " + this.element_.id + " is not a media element " + 'supported for automatic advancement.');
    }
    /** @private */

  }, {
    key: "startHtmlMediaElement_",
    value: function startHtmlMediaElement_() {
      var _this9 = this;

      var mediaElement = dev().assertElement(this.mediaElement_, 'Media element was unspecified.');
      // Removes [loop] attribute if specified, so the 'ended' event can trigger.
      this.mediaElement_.removeAttribute('loop');
      this.unlistenFns_.push(listenOnce(mediaElement, 'ended', function () {
        return _this9.onAdvance();
      }));
      this.onProgressUpdate();
      this.timer_.poll(POLL_INTERVAL_MS, function () {
        _this9.onProgressUpdate();

        return !_this9.isRunning();
      });
    }
    /** @private */

  }, {
    key: "startVideoInterfaceElement_",
    value: function startVideoInterfaceElement_() {
      var _this10 = this;

      this.element_.getImpl().then(function (video) {
        _this10.video_ = video;
      });
      // Removes [loop] attribute if specified, so the 'ended' event can trigger.
      this.element_.querySelector('video').removeAttribute('loop');
      this.unlistenFns_.push(listenOnce(this.element_, VideoEvents.ENDED, function () {
        return _this10.onAdvance();
      }, {
        capture: true
      }));
      this.onProgressUpdate();
      this.timer_.poll(POLL_INTERVAL_MS, function () {
        _this10.onProgressUpdate();

        return !_this10.isRunning();
      });
    }
    /** @override */

  }, {
    key: "stop",
    value: function stop() {
      _get(_getPrototypeOf(MediaBasedAdvancement.prototype), "stop", this).call(this);

      this.unlistenFns_.forEach(function (fn) {
        return fn();
      });
    }
    /**
     * @override
     */

  }, {
    key: "isAutoAdvance",
    value: function isAutoAdvance() {
      return true;
    }
    /** @override */

  }, {
    key: "getProgress",
    value: function getProgress() {
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
    /** @override */

  }, {
    key: "onAdvance",
    value: function onAdvance() {
      this.storeService_.dispatch(Action.SET_ADVANCEMENT_MODE, AdvancementMode.AUTO_ADVANCE_MEDIA);

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
     */

  }], [{
    key: "fromAutoAdvanceString",
    value: function fromAutoAdvanceString(autoAdvanceStr, win, pageEl) {
      try {
        // amp-video, amp-audio, as well as amp-story-page with a background audio
        // are eligible for media based auto advance.
        var element = pageEl.querySelector("amp-video[data-id=" + escapeCssSelectorIdent(autoAdvanceStr) + "],\n          amp-video#" + escapeCssSelectorIdent(autoAdvanceStr) + ",\n          amp-audio[data-id=" + escapeCssSelectorIdent(autoAdvanceStr) + "],\n          amp-audio#" + escapeCssSelectorIdent(autoAdvanceStr));

        if (matches(pageEl, "amp-story-page[background-audio]#" + escapeCssSelectorIdent(autoAdvanceStr))) {
          element = pageEl;
        }

        if (!element) {
          if (autoAdvanceStr) {
            user().warn('AMP-STORY-PAGE', "Element with ID " + pageEl.id + " has no media element " + 'supported for automatic advancement.');
          }

          return null;
        }

        return new MediaBasedAdvancement(win, element);
      } catch (e) {
        return null;
      }
    }
  }]);

  return MediaBasedAdvancement;
}(AdvancementConfig);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtYWR2YW5jZW1lbnQuanMiXSwibmFtZXMiOlsiQUZGSUxJQVRFX0xJTktfU0VMRUNUT1IiLCJBY3Rpb24iLCJFbWJlZGRlZENvbXBvbmVudFN0YXRlIiwiSW50ZXJhY3RpdmVDb21wb25lbnREZWYiLCJTdGF0ZVByb3BlcnR5IiwiVUlUeXBlIiwiZ2V0U3RvcmVTZXJ2aWNlIiwiQWR2YW5jZW1lbnRNb2RlIiwiU2VydmljZXMiLCJUQVBQQUJMRV9BUklBX1JPTEVTIiwiVmlkZW9FdmVudHMiLCJjbG9zZXN0IiwibWF0Y2hlcyIsImRldiIsInVzZXIiLCJlc2NhcGVDc3NTZWxlY3RvcklkZW50IiwiZ2V0QW1wZG9jIiwiaGFzVGFwQWN0aW9uIiwidGltZVN0clRvTWlsbGlzIiwiaW50ZXJhY3RpdmVFbGVtZW50c1NlbGVjdG9ycyIsImxpc3Rlbk9uY2UiLCJIT0xEX1RPVUNIX1RIUkVTSE9MRF9NUyIsIk5FWFRfU0NSRUVOX0FSRUFfUkFUSU8iLCJQUkVWSU9VU19TQ1JFRU5fQVJFQV9SQVRJTyIsIlRPUF9SRUdJT04iLCJQUk9URUNURURfU0NSRUVOX0VER0VfUEVSQ0VOVCIsIk1JTklNVU1fUFJPVEVDVEVEX1NDUkVFTl9FREdFX1BYIiwiTUlOSU1VTV9USU1FX0JBU0VEX0FVVE9fQURWQU5DRV9NUyIsIk1BWF9MSU5LX1NDUkVFTl9QRVJDRU5UIiwiSU5URVJBQ1RJVkVfRU1CRURERURfQ09NUE9ORU5UU19TRUxFQ1RPUlMiLCJPYmplY3QiLCJ2YWx1ZXMiLCJqb2luIiwiUE9MTF9JTlRFUlZBTF9NUyIsIlRhcE5hdmlnYXRpb25EaXJlY3Rpb24iLCJBZHZhbmNlbWVudENvbmZpZyIsInByb2dyZXNzTGlzdGVuZXJzXyIsImFkdmFuY2VMaXN0ZW5lcnNfIiwicHJldmlvdXNMaXN0ZW5lcnNfIiwidGFwTmF2aWdhdGlvbkxpc3RlbmVyc18iLCJpc1J1bm5pbmdfIiwicHJvZ3Jlc3NMaXN0ZW5lciIsInB1c2giLCJhZHZhbmNlTGlzdGVuZXIiLCJwcmV2aW91c0xpc3RlbmVyIiwib25UYXBOYXZpZ2F0aW9uTGlzdGVuZXIiLCJ1bnVzZWRDYW5SZXN1bWUiLCJwcm9ncmVzcyIsImdldFByb2dyZXNzIiwiZm9yRWFjaCIsIm5hdmlnYXRpb25EaXJlY3Rpb24iLCJuYXZpZ2F0aW9uTGlzdGVuZXIiLCJ3aW4iLCJlbGVtZW50IiwibWFudWFsQWR2YW5jZW1lbnQiLCJNYW51YWxBZHZhbmNlbWVudCIsImZyb21FbGVtZW50IiwiYXV0b0FkdmFuY2VTdHIiLCJnZXRBdHRyaWJ1dGUiLCJ0aW1lQmFzZWRBZHZhbmNlbWVudCIsIlRpbWVCYXNlZEFkdmFuY2VtZW50IiwiZnJvbUF1dG9BZHZhbmNlU3RyaW5nIiwibWVkaWFCYXNlZEFkdmFuY2VtZW50IiwiTWVkaWFCYXNlZEFkdmFuY2VtZW50IiwiZWxlbWVudF8iLCJ0aW1lb3V0SWRfIiwidGltZXJfIiwidGltZXJGb3IiLCJ0b3VjaHN0YXJ0VGltZXN0YW1wXyIsInBhdXNlZFN0YXRlXyIsImFtcGRvY18iLCJkb2N1bWVudCIsInN0YXJ0TGlzdGVuaW5nXyIsIm93bmVyRG9jdW1lbnQiLCJkZWZhdWx0VmlldyIsInN0b3JlU2VydmljZV8iLCJydGxTdGF0ZSIsImdldCIsIlJUTF9TVEFURSIsInNlY3Rpb25zXyIsImxlZnQiLCJ3aWR0aFJhdGlvIiwiZGlyZWN0aW9uIiwiTkVYVCIsIlBSRVZJT1VTIiwicmlnaHQiLCJhZGRFdmVudExpc3RlbmVyIiwib25Ub3VjaHN0YXJ0XyIsImJpbmQiLCJvblRvdWNoZW5kXyIsIm1heWJlUGVyZm9ybU5hdmlnYXRpb25fIiwib25WaXNpYmlsaXR5Q2hhbmdlZCIsImlzVmlzaWJsZSIsInByb2Nlc3NUb3VjaGVuZF8iLCJldmVudCIsInNob3VsZEhhbmRsZUV2ZW50XyIsIkRhdGUiLCJub3ciLCJQQVVTRURfU1RBVEUiLCJkaXNwYXRjaCIsIlRPR0dMRV9QQVVTRUQiLCJkZWxheSIsIlRPR0dMRV9TWVNURU1fVUlfSVNfVklTSUJMRSIsInRvdWNoZXNDb3VudCIsInRvdWNoZXMiLCJsZW5ndGgiLCJwcmV2ZW50RGVmYXVsdCIsImNhbmNlbCIsIlNZU1RFTV9VSV9JU19WSVNJQkxFX1NUQVRFIiwiSU5URVJBQ1RJVkVfQ09NUE9ORU5UX1NUQVRFIiwic3RhdGUiLCJFWFBBTkRFRCIsImFzc2VydEVsZW1lbnQiLCJ0YXJnZXQiLCJlbCIsImVsZW1lbnRSb2xlIiwidG9Mb3dlckNhc2UiLCJzaG91bGRIYW5kbGVFdmVudCIsInRhZ05hbWUiLCJzdGFydHNXaXRoIiwiaXNJblN0b3J5UGFnZVNpZGVFZGdlXyIsImdldFN0b3J5UGFnZVJlY3RfIiwicGF0aCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwicGFnZVJlY3QiLCJ2YWxpZCIsImNhblNob3ciLCJpc1Rvb0xhcmdlT25QYWdlXyIsImlzSW5TY3JlZW5Cb3R0b21fIiwic2V0QXR0cmlidXRlIiwidGFyZ2V0UmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInRvcCIsImhlaWdodCIsImNsaWVudFgiLCJjbGllbnRZIiwic2lkZUVkZ2VXaWR0aEZyb21QZXJjZW50Iiwid2lkdGgiLCJzaWRlRWRnZUxpbWl0IiwiTWF0aCIsIm1heCIsIngiLCJlcnJvciIsInN0b3JlZCIsImluRXhwYW5kZWRNb2RlIiwiY2FuU2hvd1Rvb2x0aXBfIiwiY2xpY2tlZE9uTGluayIsImhhc0F0dHJpYnV0ZSIsImV4cGFuZGVkRWxlbWVudCIsIkFGRklMSUFURV9MSU5LX1NUQVRFIiwiaXNIYW5kbGVkQnlFbWJlZGRlZENvbXBvbmVudF8iLCJzdG9wUHJvcGFnYXRpb24iLCJlbWJlZENvbXBvbmVudCIsIlRPR0dMRV9JTlRFUkFDVElWRV9DT01QT05FTlQiLCJGT0NVU0VEIiwiaXNIYW5kbGVkQnlBZmZpbGlhdGVMaW5rXyIsIlRPR0dMRV9BRkZJTElBVEVfTElOSyIsImlzUnVubmluZyIsImlzTmF2aWdhdGlvbmFsQ2xpY2tfIiwiaXNQcm90ZWN0ZWRUYXJnZXRfIiwiU0VUX0FEVkFOQ0VNRU5UX01PREUiLCJNQU5VQUxfQURWQU5DRSIsIm9mZnNldExlZnQiLCJwYWdlIiwib2Zmc2V0IiwiY2xpY2tFdmVudFgiLCJwYWdlWCIsIm9uVGFwTmF2aWdhdGlvbiIsImdldFRhcERpcmVjdGlvbl8iLCJ1aVN0YXRlIiwiVUlfU1RBVEUiLCJERVNLVE9QX1BBTkVMUyIsIkRFU0tUT1BfT05FX1BBTkVMIiwiZ2V0TGF5b3V0Qm94IiwicXVlcnlTZWxlY3RvciIsImRlbGF5TXMiLCJ3YXJuIiwiaWQiLCJkZWxheU1zXyIsInJlbWFpbmluZ0RlbGF5TXNfIiwic3RhcnRUaW1lTXNfIiwiZ2V0Q3VycmVudFRpbWVzdGFtcE1zXyIsIm9uQWR2YW5jZSIsIm9uUHJvZ3Jlc3NVcGRhdGUiLCJwb2xsIiwiY2FuUmVzdW1lIiwibWluIiwiQVVUT19BRFZBTkNFX1RJTUUiLCJuZXdEZWxheU1zIiwidW5kZWZpbmVkIiwiaXNOYU4iLCJOdW1iZXIiLCJtZWRpYUVsZW1lbnRfIiwidW5saXN0ZW5GbnNfIiwidW5saXN0ZW5FbmRlZEZuXyIsInVubGlzdGVuVGltZXVwZGF0ZUZuXyIsInZpZGVvXyIsIkhUTUxNZWRpYUVsZW1lbnQiLCJidWlsZCIsInRoZW4iLCJzdGFydFdoZW5CdWlsdF8iLCJpc1ZpZGVvSW50ZXJmYWNlVmlkZW9fIiwic3RhcnRWaWRlb0ludGVyZmFjZUVsZW1lbnRfIiwiZ2V0TWVkaWFFbGVtZW50XyIsInN0YXJ0SHRtbE1lZGlhRWxlbWVudF8iLCJtZWRpYUVsZW1lbnQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJnZXRJbXBsIiwidmlkZW8iLCJFTkRFRCIsImNhcHR1cmUiLCJmbiIsImdldER1cmF0aW9uIiwiZ2V0Q3VycmVudFRpbWUiLCJkdXJhdGlvbiIsImN1cnJlbnRUaW1lIiwiQVVUT19BRFZBTkNFX01FRElBIiwicGFnZUVsIiwiZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LGNBQUQsQ0FGeEIsdUNBR1UxQyxzQkFBc0IsQ0FBQzBDLGNBQUQsQ0FIaEMsZ0NBSUUxQyxzQkFBc0IsQ0FBQzBDLGNBQUQsQ0FKeEIsQ0FBZDs7QUFNQSxZQUNFN0MsT0FBTyxDQUNMOE0sTUFESyx3Q0FFK0IzTSxzQkFBc0IsQ0FDeEQwQyxjQUR3RCxDQUZyRCxDQURULEVBT0U7QUFDQUosVUFBQUEsT0FBTyxHQUFHcUssTUFBVjtBQUNEOztBQUNELFlBQUksQ0FBQ3JLLE9BQUwsRUFBYztBQUNaLGNBQUlJLGNBQUosRUFBb0I7QUFDbEIzQyxZQUFBQSxJQUFJLEdBQUdtSyxJQUFQLENBQ0UsZ0JBREYsRUFFRSxxQkFBbUJ5QyxNQUFNLENBQUN4QyxFQUExQiw4QkFDRSxzQ0FISjtBQUtEOztBQUNELGlCQUFPLElBQVA7QUFDRDs7QUFFRCxlQUFPLElBQUluSCxxQkFBSixDQUEwQlgsR0FBMUIsRUFBK0JDLE9BQS9CLENBQVA7QUFDRCxPQS9CRCxDQStCRSxPQUFPc0ssQ0FBUCxFQUFVO0FBQ1YsZUFBTyxJQUFQO0FBQ0Q7QUFDRjtBQXJPSDs7QUFBQTtBQUFBLEVBQTJDeEwsaUJBQTNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5pbXBvcnQge0FGRklMSUFURV9MSU5LX1NFTEVDVE9SfSBmcm9tICcuL2FtcC1zdG9yeS1hZmZpbGlhdGUtbGluayc7XG5pbXBvcnQge1xuICBBY3Rpb24sXG4gIEVtYmVkZGVkQ29tcG9uZW50U3RhdGUsXG4gIEludGVyYWN0aXZlQ29tcG9uZW50RGVmLFxuICBTdGF0ZVByb3BlcnR5LFxuICBVSVR5cGUsXG4gIGdldFN0b3JlU2VydmljZSxcbn0gZnJvbSAnLi9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5pbXBvcnQge0FkdmFuY2VtZW50TW9kZX0gZnJvbSAnLi9zdG9yeS1hbmFseXRpY3MnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtUQVBQQUJMRV9BUklBX1JPTEVTfSBmcm9tICcjc2VydmljZS9hY3Rpb24taW1wbCc7XG5pbXBvcnQge1ZpZGVvRXZlbnRzfSBmcm9tICcuLi8uLi8uLi9zcmMvdmlkZW8taW50ZXJmYWNlJztcbmltcG9ydCB7Y2xvc2VzdCwgbWF0Y2hlc30gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcbmltcG9ydCB7ZGV2LCB1c2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7ZXNjYXBlQ3NzU2VsZWN0b3JJZGVudH0gZnJvbSAnI2NvcmUvZG9tL2Nzcy1zZWxlY3RvcnMnO1xuaW1wb3J0IHtnZXRBbXBkb2N9IGZyb20gJy4uLy4uLy4uL3NyYy9zZXJ2aWNlLWhlbHBlcnMnO1xuaW1wb3J0IHtoYXNUYXBBY3Rpb24sIHRpbWVTdHJUb01pbGxpc30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2ludGVyYWN0aXZlRWxlbWVudHNTZWxlY3RvcnN9IGZyb20gJy4vYW1wLXN0b3J5LWVtYmVkZGVkLWNvbXBvbmVudCc7XG5pbXBvcnQge2xpc3Rlbk9uY2V9IGZyb20gJy4uLy4uLy4uL3NyYy9ldmVudC1oZWxwZXInO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtudW1iZXJ9ICovXG5jb25zdCBIT0xEX1RPVUNIX1RIUkVTSE9MRF9NUyA9IDUwMDtcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgTkVYVF9TQ1JFRU5fQVJFQV9SQVRJTyA9IDAuNzU7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge251bWJlcn0gKi9cbmNvbnN0IFBSRVZJT1VTX1NDUkVFTl9BUkVBX1JBVElPID0gMC4yNTtcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgVE9QX1JFR0lPTiA9IDAuODtcblxuLyoqXG4gKiBQcm90ZWN0ZWQgZWRnZXMgb2YgdGhlIHNjcmVlbiBhcyBhIHBlcmNlbnQgb2YgcGFnZSB3aWR0aC4gV2hlbiB0YXBwZWQgb24gdGhlc2UgYXJlYXMsIHdlIHdpbGxcbiAqIGFsd2F5cyBwZXJmb3JtIG5hdmlnYXRpb24uIEV2ZW4gaWYgYSBjbGlja2FibGUgZWxlbWVudCBpcyB0aGVyZS5cbiAqIEBjb25zdCB7bnVtYmVyfVxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgUFJPVEVDVEVEX1NDUkVFTl9FREdFX1BFUkNFTlQgPSAxMjtcblxuLyoqXG4gKiBNaW5pbXVtIHByb3RlY3RlZCBlZGdlcyBvZiB0aGUgc2NyZWVuIGluIHBpeGVscy5cbiAqIElmIFBST1RFQ1RFRF9TQ1JFRU5fRURHRV9QRVJDRU5UIHJlc3VsdHMgaW4gYSBwcm90ZWN0ZWQgZWRnZSB2YWx1ZSBsZXNzIHRoYW4gTUlOSU1VTV9QUk9URUNURURfU0NSRUVOX0VER0VfUFgsXG4gKiB3ZSB3aWxsIHVzZSBNSU5JTVVNX1BST1RFQ1RFRF9TQ1JFRU5fRURHRV9QWC5cbiAqIEBjb25zdCB7bnVtYmVyfVxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgTUlOSU1VTV9QUk9URUNURURfU0NSRUVOX0VER0VfUFggPSA0ODtcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgTUlOSU1VTV9USU1FX0JBU0VEX0FVVE9fQURWQU5DRV9NUyA9IDUwMDtcblxuLyoqXG4gKiBNYXhpbXVtIHBlcmNlbnQgb2Ygc2NyZWVuIHRoYXQgY2FuIGJlIG9jY3VwaWVkIGJ5IGEgc2luZ2xlIGxpbmtcbiAqIGJlZm9yZSB0aGUgbGluayBpcyBjb25zaWRlcmVkIG5hdmlnYXRpb24gYmxvY2tpbmcgYW5kIGlnbm9yZWQuXG4gKiBAY29uc3Qge251bWJlcn1cbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IE1BWF9MSU5LX1NDUkVFTl9QRVJDRU5UID0gMC44O1xuXG5jb25zdCBJTlRFUkFDVElWRV9FTUJFRERFRF9DT01QT05FTlRTX1NFTEVDVE9SUyA9IE9iamVjdC52YWx1ZXMoXG4gIGludGVyYWN0aXZlRWxlbWVudHNTZWxlY3RvcnMoKVxuKS5qb2luKCcsJyk7XG5cbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmV4cG9ydCBjb25zdCBQT0xMX0lOVEVSVkFMX01TID0gMzAwO1xuXG4vKiogQGNvbnN0IEBlbnVtICovXG5leHBvcnQgY29uc3QgVGFwTmF2aWdhdGlvbkRpcmVjdGlvbiA9IHtcbiAgJ05FWFQnOiAxLFxuICAnUFJFVklPVVMnOiAyLFxufTtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciB0aGUgQWR2YW5jZW1lbnRDb25maWcuICBCeSBkZWZhdWx0LCBkb2VzIG5vdGhpbmcgb3RoZXIgdGhhblxuICogdHJhY2tpbmcgaXRzIGludGVybmFsIHN0YXRlIHdoZW4gc3RhcnRlZC9zdG9wcGVkLCBhbmQgbGlzdGVuZXJzIHdpbGwgbmV2ZXIgYmVcbiAqIGludm9rZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBBZHZhbmNlbWVudENvbmZpZyB7XG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshQXJyYXk8ZnVuY3Rpb24obnVtYmVyKT59ICovXG4gICAgdGhpcy5wcm9ncmVzc0xpc3RlbmVyc18gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTxmdW5jdGlvbigpPn0gKi9cbiAgICB0aGlzLmFkdmFuY2VMaXN0ZW5lcnNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshQXJyYXk8ZnVuY3Rpb24oKT59ICovXG4gICAgdGhpcy5wcmV2aW91c0xpc3RlbmVyc18gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTxmdW5jdGlvbihudW1iZXIpPn0gKi9cbiAgICB0aGlzLnRhcE5hdmlnYXRpb25MaXN0ZW5lcnNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc1J1bm5pbmdfID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbihudW1iZXIpfSBwcm9ncmVzc0xpc3RlbmVyIEEgZnVuY3Rpb24gdGhhdCBoYW5kbGVzIHdoZW4gdGhlXG4gICAqICAgICBwcm9ncmVzcyBvZiB0aGUgY3VycmVudCBwYWdlIGhhcyBiZWVuIHVwZGF0ZWQuICBJdCBhY2NlcHRzIGEgbnVtYmVyXG4gICAqICAgICBiZXR3ZWVuIDAuMCBhbmQgMS4wIGFzIGl0cyBvbmx5IGFyZ3VtZW50LCB0aGF0IHJlcHJlc2VudHMgdGhlIGN1cnJlbnRcbiAgICogICAgIHByb2dyZXNzLlxuICAgKi9cbiAgYWRkUHJvZ3Jlc3NMaXN0ZW5lcihwcm9ncmVzc0xpc3RlbmVyKSB7XG4gICAgdGhpcy5wcm9ncmVzc0xpc3RlbmVyc18ucHVzaChwcm9ncmVzc0xpc3RlbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGFkdmFuY2VMaXN0ZW5lciBBIGZ1bmN0aW9uIHRoYXQgaGFuZGxlcyB3aGVuIGFcbiAgICogICAgIHBhZ2Ugc2hvdWxkIGJlIGFkdmFuY2VkLlxuICAgKi9cbiAgYWRkQWR2YW5jZUxpc3RlbmVyKGFkdmFuY2VMaXN0ZW5lcikge1xuICAgIHRoaXMuYWR2YW5jZUxpc3RlbmVyc18ucHVzaChhZHZhbmNlTGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gcHJldmlvdXNMaXN0ZW5lciBBIGZ1bmN0aW9uIHRoYXQgaGFuZGxlcyB3aGVuIGFcbiAgICogICAgIHBhZ2Ugc2hvdWxkIGdvIGJhY2sgdG8gdGhlIHByZXZpb3VzIHBhZ2UuXG4gICAqL1xuICBhZGRQcmV2aW91c0xpc3RlbmVyKHByZXZpb3VzTGlzdGVuZXIpIHtcbiAgICB0aGlzLnByZXZpb3VzTGlzdGVuZXJzXy5wdXNoKHByZXZpb3VzTGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24obnVtYmVyKX0gb25UYXBOYXZpZ2F0aW9uTGlzdGVuZXIgQSBmdW5jdGlvbiB0aGF0IGhhbmRsZXMgd2hlbiBhXG4gICAqIG5hdmlnYXRpb24gbGlzdGVuZXIgdG8gYmUgZmlyZWQuXG4gICAqL1xuICBhZGRPblRhcE5hdmlnYXRpb25MaXN0ZW5lcihvblRhcE5hdmlnYXRpb25MaXN0ZW5lcikge1xuICAgIHRoaXMudGFwTmF2aWdhdGlvbkxpc3RlbmVyc18ucHVzaChvblRhcE5hdmlnYXRpb25MaXN0ZW5lcik7XG4gIH1cblxuICAvKipcbiAgICogSW52b2tlZCB3aGVuIHRoZSBhZHZhbmNlbWVudCBjb25maWd1cmF0aW9uIHNob3VsZCBiZWdpbiB0YWtpbmcgZWZmZWN0LlxuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5pc1J1bm5pbmdfID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnZva2VkIHdoZW4gdGhlIGFkdmFuY2VtZW50IGNvbmZpZ3VyYXRpb24gc2hvdWxkIGNlYXNlIHRha2luZyBlZmZlY3QuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVudXNlZENhblJlc3VtZVxuICAgKi9cbiAgc3RvcCh1bnVzZWRDYW5SZXN1bWUpIHtcbiAgICB0aGlzLmlzUnVubmluZ18gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGFkdmFuY2VtZW50IGNvbmZpZ3VyYXRpb24gd2lsbCBhdXRvbWF0aWNhbGx5IGFkdmFuY2VcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQXV0b0FkdmFuY2UoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGlzUnVubmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5pc1J1bm5pbmdfO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldFByb2dyZXNzKCkge1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgLyoqIEBwcm90ZWN0ZWQgKi9cbiAgb25Qcm9ncmVzc1VwZGF0ZSgpIHtcbiAgICBjb25zdCBwcm9ncmVzcyA9IHRoaXMuZ2V0UHJvZ3Jlc3MoKTtcbiAgICB0aGlzLnByb2dyZXNzTGlzdGVuZXJzXy5mb3JFYWNoKChwcm9ncmVzc0xpc3RlbmVyKSA9PiB7XG4gICAgICBwcm9ncmVzc0xpc3RlbmVyKHByb2dyZXNzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAcHJvdGVjdGVkICovXG4gIG9uQWR2YW5jZSgpIHtcbiAgICB0aGlzLmFkdmFuY2VMaXN0ZW5lcnNfLmZvckVhY2goKGFkdmFuY2VMaXN0ZW5lcikgPT4ge1xuICAgICAgYWR2YW5jZUxpc3RlbmVyKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQHByb3RlY3RlZCAqL1xuICBvblByZXZpb3VzKCkge1xuICAgIHRoaXMucHJldmlvdXNMaXN0ZW5lcnNfLmZvckVhY2goKHByZXZpb3VzTGlzdGVuZXIpID0+IHtcbiAgICAgIHByZXZpb3VzTGlzdGVuZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbmF2aWdhdGlvbkRpcmVjdGlvbiBEaXJlY3Rpb24gb2YgbmF2aWdhdGlvblxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBvblRhcE5hdmlnYXRpb24obmF2aWdhdGlvbkRpcmVjdGlvbikge1xuICAgIHRoaXMudGFwTmF2aWdhdGlvbkxpc3RlbmVyc18uZm9yRWFjaCgobmF2aWdhdGlvbkxpc3RlbmVyKSA9PiB7XG4gICAgICBuYXZpZ2F0aW9uTGlzdGVuZXIobmF2aWdhdGlvbkRpcmVjdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUHJvdmlkZXMgYW4gQWR2YW5jZW1lbnRDb25maWcgb2JqZWN0IGZvciB0aGUgc3BlY2lmaWVkIGFtcC1zdG9yeSBvclxuICAgKiBhbXAtc3RvcnktcGFnZS5cbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshQWR2YW5jZW1lbnRDb25maWd8IU1hbnVhbEFkdmFuY2VtZW50fCFUaW1lQmFzZWRBZHZhbmNlbWVudHwhTWVkaWFCYXNlZEFkdmFuY2VtZW50fVxuICAgKi9cbiAgc3RhdGljIGZvckVsZW1lbnQod2luLCBlbGVtZW50KSB7XG4gICAgY29uc3QgbWFudWFsQWR2YW5jZW1lbnQgPSBNYW51YWxBZHZhbmNlbWVudC5mcm9tRWxlbWVudCh3aW4sIGVsZW1lbnQpO1xuICAgIGlmIChtYW51YWxBZHZhbmNlbWVudCkge1xuICAgICAgcmV0dXJuIG1hbnVhbEFkdmFuY2VtZW50O1xuICAgIH1cblxuICAgIGNvbnN0IGF1dG9BZHZhbmNlU3RyID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2F1dG8tYWR2YW5jZS1hZnRlcicpO1xuXG4gICAgaWYgKGF1dG9BZHZhbmNlU3RyKSB7XG4gICAgICBjb25zdCB0aW1lQmFzZWRBZHZhbmNlbWVudCA9IFRpbWVCYXNlZEFkdmFuY2VtZW50LmZyb21BdXRvQWR2YW5jZVN0cmluZyhcbiAgICAgICAgYXV0b0FkdmFuY2VTdHIsXG4gICAgICAgIHdpbixcbiAgICAgICAgZWxlbWVudFxuICAgICAgKTtcbiAgICAgIGlmICh0aW1lQmFzZWRBZHZhbmNlbWVudCkge1xuICAgICAgICByZXR1cm4gdGltZUJhc2VkQWR2YW5jZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1lZGlhQmFzZWRBZHZhbmNlbWVudCA9IE1lZGlhQmFzZWRBZHZhbmNlbWVudC5mcm9tQXV0b0FkdmFuY2VTdHJpbmcoXG4gICAgICAgIGF1dG9BZHZhbmNlU3RyLFxuICAgICAgICB3aW4sXG4gICAgICAgIGVsZW1lbnRcbiAgICAgICk7XG4gICAgICBpZiAobWVkaWFCYXNlZEFkdmFuY2VtZW50KSB7XG4gICAgICAgIHJldHVybiBtZWRpYUJhc2VkQWR2YW5jZW1lbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBBZHZhbmNlbWVudENvbmZpZygpO1xuICB9XG59XG5cbi8qKlxuICogQWx3YXlzIHByb3ZpZGVzIGEgcHJvZ3Jlc3Mgb2YgMS4wLiAgQWR2YW5jZXMgd2hlbiB0aGUgdXNlciB0YXBzIHRoZVxuICogY29ycmVzcG9uZGluZyBzZWN0aW9uLCBkZXBlbmRpbmcgb24gbGFuZ3VhZ2Ugc2V0dGluZ3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYW51YWxBZHZhbmNlbWVudCBleHRlbmRzIEFkdmFuY2VtZW50Q29uZmlnIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luIFRoZSBXaW5kb3cgb2JqZWN0LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRoYXQsIHdoZW4gY2xpY2tlZCwgY2FuIGNhdXNlXG4gICAqICAgICBhZHZhbmNpbmcgdG8gdGhlIG5leHQgcGFnZSBvciBnb2luZyBiYWNrIHRvIHRoZSBwcmV2aW91cy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgZWxlbWVudCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRWxlbWVudH0gKi9cbiAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfHN0cmluZ3xudWxsfSAqL1xuICAgIHRoaXMudGltZW91dElkXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvdGltZXItaW1wbC5UaW1lcn0gKi9cbiAgICB0aGlzLnRpbWVyXyA9IFNlcnZpY2VzLnRpbWVyRm9yKHdpbik7XG5cbiAgICAvKiogQHByaXZhdGUgez9udW1iZXJ9IExhc3QgdG91Y2hzdGFydCBldmVudCdzIHRpbWVzdGFtcCAqL1xuICAgIHRoaXMudG91Y2hzdGFydFRpbWVzdGFtcF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSBTYXZpbmcgdGhlIHBhdXNlZCBzdGF0ZSBiZWZvcmUgcHJlc3NpbmcgKi9cbiAgICB0aGlzLnBhdXNlZFN0YXRlXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wZG9jXyA9IGdldEFtcGRvYyh3aW4uZG9jdW1lbnQpO1xuXG4gICAgdGhpcy5zdGFydExpc3RlbmluZ18oKTtcblxuICAgIGlmIChlbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpIHtcbiAgICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gZ2V0U3RvcmVTZXJ2aWNlKGVsZW1lbnQub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldyk7XG4gICAgfVxuXG4gICAgY29uc3QgcnRsU3RhdGUgPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuUlRMX1NUQVRFKTtcbiAgICB0aGlzLnNlY3Rpb25zXyA9IHtcbiAgICAgIC8vIFdpZHRoIGFuZCBuYXZpZ2F0aW9uIGRpcmVjdGlvbiBvZiBlYWNoIHNlY3Rpb24gZGVwZW5kIG9uIHdoZXRoZXIgdGhlXG4gICAgICAvLyBkb2N1bWVudCBpcyBSVEwgb3IgTFRSLlxuICAgICAgbGVmdDoge1xuICAgICAgICB3aWR0aFJhdGlvOiBydGxTdGF0ZVxuICAgICAgICAgID8gTkVYVF9TQ1JFRU5fQVJFQV9SQVRJT1xuICAgICAgICAgIDogUFJFVklPVVNfU0NSRUVOX0FSRUFfUkFUSU8sXG4gICAgICAgIGRpcmVjdGlvbjogcnRsU3RhdGVcbiAgICAgICAgICA/IFRhcE5hdmlnYXRpb25EaXJlY3Rpb24uTkVYVFxuICAgICAgICAgIDogVGFwTmF2aWdhdGlvbkRpcmVjdGlvbi5QUkVWSU9VUyxcbiAgICAgIH0sXG4gICAgICByaWdodDoge1xuICAgICAgICB3aWR0aFJhdGlvOiBydGxTdGF0ZVxuICAgICAgICAgID8gUFJFVklPVVNfU0NSRUVOX0FSRUFfUkFUSU9cbiAgICAgICAgICA6IE5FWFRfU0NSRUVOX0FSRUFfUkFUSU8sXG4gICAgICAgIGRpcmVjdGlvbjogcnRsU3RhdGVcbiAgICAgICAgICA/IFRhcE5hdmlnYXRpb25EaXJlY3Rpb24uUFJFVklPVVNcbiAgICAgICAgICA6IFRhcE5hdmlnYXRpb25EaXJlY3Rpb24uTkVYVCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0UHJvZ3Jlc3MoKSB7XG4gICAgcmV0dXJuIDEuMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyB0aGUgZXZlbnQgbGlzdGVuZXJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RhcnRMaXN0ZW5pbmdfKCkge1xuICAgIHRoaXMuZWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICd0b3VjaHN0YXJ0JyxcbiAgICAgIHRoaXMub25Ub3VjaHN0YXJ0Xy5iaW5kKHRoaXMpLFxuICAgICAgdHJ1ZVxuICAgICk7XG4gICAgdGhpcy5lbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ3RvdWNoZW5kJyxcbiAgICAgIHRoaXMub25Ub3VjaGVuZF8uYmluZCh0aGlzKSxcbiAgICAgIHRydWVcbiAgICApO1xuICAgIHRoaXMuZWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICdjbGljaycsXG4gICAgICB0aGlzLm1heWJlUGVyZm9ybU5hdmlnYXRpb25fLmJpbmQodGhpcyksXG4gICAgICB0cnVlXG4gICAgKTtcbiAgICB0aGlzLmFtcGRvY18ub25WaXNpYmlsaXR5Q2hhbmdlZCgoKSA9PiB7XG4gICAgICB0aGlzLmFtcGRvY18uaXNWaXNpYmxlKCkgPyB0aGlzLnByb2Nlc3NUb3VjaGVuZF8oKSA6IG51bGw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBpc0F1dG9BZHZhbmNlKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb3VjaEV2ZW50IHRvdWNoc3RhcnQgZXZlbnRzIGhhbmRsZXIuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Ub3VjaHN0YXJ0XyhldmVudCkge1xuICAgIC8vIERvbid0IHN0YXJ0IHRoZSBwYXVzZWQgc3RhdGUgaWYgdGhlIGV2ZW50IHNob3VsZCBub3QgYmUgaGFuZGxlZCBieSB0aGlzXG4gICAgLy8gY2xhc3MuIEFsc28gaWdub3JlcyBhbnkgc3Vic2VxdWVudCB0b3VjaHN0YXJ0IHRoYXQgd291bGQgaGFwcGVuIGJlZm9yZVxuICAgIC8vIHRvdWNoZW5kIHdhcyBmaXJlZCwgc2luY2UgaXQnZCByZXNldCB0aGUgdG91Y2hzdGFydFRpbWVzdGFtcCAoaWU6IHVzZXJcbiAgICAvLyB0b3VjaGVzIHRoZSBzY3JlZW4gd2l0aCBhIHNlY29uZCBmaW5nZXIpLlxuICAgIGlmICh0aGlzLnRvdWNoc3RhcnRUaW1lc3RhbXBfIHx8ICF0aGlzLnNob3VsZEhhbmRsZUV2ZW50XyhldmVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy50b3VjaHN0YXJ0VGltZXN0YW1wXyA9IERhdGUubm93KCk7XG4gICAgdGhpcy5wYXVzZWRTdGF0ZV8gPSAvKiogQHR5cGUge2Jvb2xlYW59ICovIChcbiAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5QQVVTRURfU1RBVEUpXG4gICAgKTtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9QQVVTRUQsIHRydWUpO1xuICAgIHRoaXMudGltZW91dElkXyA9IHRoaXMudGltZXJfLmRlbGF5KCgpID0+IHtcbiAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uVE9HR0xFX1NZU1RFTV9VSV9JU19WSVNJQkxFLCBmYWxzZSk7XG4gICAgfSwgSE9MRF9UT1VDSF9USFJFU0hPTERfTVMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvdWNoRXZlbnQgdG91Y2hlbmQgZXZlbnRzIGhhbmRsZXIuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Ub3VjaGVuZF8oZXZlbnQpIHtcbiAgICAvLyBJZ25vcmVzIHRoZSBldmVudCBpZiB0aGVyZSdzIHN0aWxsIGEgdXNlcidzIGZpbmdlciBob2xkaW5nIHRoZSBzY3JlZW4uXG4gICAgY29uc3QgdG91Y2hlc0NvdW50ID0gKGV2ZW50LnRvdWNoZXMgfHwgW10pLmxlbmd0aDtcbiAgICBpZiAoIXRoaXMudG91Y2hzdGFydFRpbWVzdGFtcF8gfHwgdG91Y2hlc0NvdW50ID4gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENhbmNlbHMgdGhlIG5hdmlnYXRpb24gaWYgdXNlciBwYXVzZWQgdGhlIHN0b3J5IGZvciBvdmVyIDUwMG1zLiBDYWxsaW5nXG4gICAgLy8gcHJldmVudERlZmF1bHQgb24gdGhlIHRvdWNoZW5kIGV2ZW50IGVuc3VyZXMgdGhlIGNsaWNrL3RhcCBldmVudCB3b24ndFxuICAgIC8vIGZpcmUuXG4gICAgaWYgKERhdGUubm93KCkgLSB0aGlzLnRvdWNoc3RhcnRUaW1lc3RhbXBfID4gSE9MRF9UT1VDSF9USFJFU0hPTERfTVMpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9jZXNzVG91Y2hlbmRfKCk7XG4gIH1cblxuICAvKipcbiAgICogTG9naWMgdHJpZ2dlcmVkIGJ5IHRvdWNoZW5kIGV2ZW50cy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb2Nlc3NUb3VjaGVuZF8oKSB7XG4gICAgaWYgKCF0aGlzLnRvdWNoc3RhcnRUaW1lc3RhbXBfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uVE9HR0xFX1BBVVNFRCwgdGhpcy5wYXVzZWRTdGF0ZV8pO1xuICAgIHRoaXMudG91Y2hzdGFydFRpbWVzdGFtcF8gPSBudWxsO1xuICAgIHRoaXMudGltZXJfLmNhbmNlbCh0aGlzLnRpbWVvdXRJZF8pO1xuICAgIHRoaXMudGltZW91dElkXyA9IG51bGw7XG4gICAgaWYgKFxuICAgICAgIXRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5TWVNURU1fVUlfSVNfVklTSUJMRV9TVEFURSkgJiZcbiAgICAgIC8qKiBAdHlwZSB7SW50ZXJhY3RpdmVDb21wb25lbnREZWZ9ICovIChcbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LklOVEVSQUNUSVZFX0NPTVBPTkVOVF9TVEFURSlcbiAgICAgICkuc3RhdGUgIT09IEVtYmVkZGVkQ29tcG9uZW50U3RhdGUuRVhQQU5ERURcbiAgICApIHtcbiAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uVE9HR0xFX1NZU1RFTV9VSV9JU19WSVNJQkxFLCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgY2xpY2sgc2hvdWxkIGJlIHVzZWQgZm9yIG5hdmlnYXRpb24uICBOYXZpZ2F0ZSBzaG91bGRcbiAgICogb2NjdXIgdW5sZXNzIHRoZSBjbGljayBpcyBvbiB0aGUgc3lzdGVtIGxheWVyLCBvciBvbiBhbiBlbGVtZW50IHRoYXRcbiAgICogZGVmaW5lcyBvbj1cInRhcDouLi5cIlxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnQgJ2NsaWNrJyBldmVudC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSwgaWYgdGhlIGNsaWNrIHNob3VsZCBiZSB1c2VkIGZvciBuYXZpZ2F0aW9uLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaXNOYXZpZ2F0aW9uYWxDbGlja18oZXZlbnQpIHtcbiAgICByZXR1cm4gIWNsb3Nlc3QoXG4gICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KGV2ZW50LnRhcmdldCksXG4gICAgICAoZWwpID0+IHtcbiAgICAgICAgcmV0dXJuIGhhc1RhcEFjdGlvbihlbCk7XG4gICAgICB9LFxuICAgICAgLyogb3B0X3N0b3BBdCAqLyB0aGlzLmVsZW1lbnRfXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXZSB3YW50IGNsaWNrcyBvbiBjZXJ0YWluIGVsZW1lbnRzIHRvIGJlIGV4ZW1wdGVkIGZyb20gbm9ybWFsIHBhZ2VcbiAgICogbmF2aWdhdGlvblxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzUHJvdGVjdGVkVGFyZ2V0XyhldmVudCkge1xuICAgIHJldHVybiAhIWNsb3Nlc3QoXG4gICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KGV2ZW50LnRhcmdldCksXG4gICAgICAoZWwpID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudFJvbGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKTtcblxuICAgICAgICBpZiAoZWxlbWVudFJvbGUpIHtcbiAgICAgICAgICByZXR1cm4gISFUQVBQQUJMRV9BUklBX1JPTEVTW2VsZW1lbnRSb2xlLnRvTG93ZXJDYXNlKCldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICAvKiBvcHRfc3RvcEF0ICovIHRoaXMuZWxlbWVudF9cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZXZlbnQgc2hvdWxkIGJlIGhhbmRsZWQgYnkgTWFudWFsQWR2YW5jZW1lbnQsIG9yIHNob3VsZFxuICAgKiBmb2xsb3cgaXRzIGNhcHR1cmUgcGhhc2UuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2hvdWxkSGFuZGxlRXZlbnRfKGV2ZW50KSB7XG4gICAgbGV0IHNob3VsZEhhbmRsZUV2ZW50ID0gZmFsc2U7XG4gICAgbGV0IHRhZ05hbWU7XG5cbiAgICBjbG9zZXN0KFxuICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudChldmVudC50YXJnZXQpLFxuICAgICAgKGVsKSA9PiB7XG4gICAgICAgIHRhZ05hbWUgPSBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHRhZ05hbWUgPT09ICdhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50JyB8fFxuICAgICAgICAgIHRhZ05hbWUgPT09ICdhbXAtc3RvcnktcGFnZS1vdXRsaW5rJ1xuICAgICAgICApIHtcbiAgICAgICAgICBzaG91bGRIYW5kbGVFdmVudCA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHRhZ05hbWUuc3RhcnRzV2l0aCgnYW1wLXN0b3J5LWludGVyYWN0aXZlLScpICYmXG4gICAgICAgICAgKCF0aGlzLmlzSW5TdG9yeVBhZ2VTaWRlRWRnZV8oZXZlbnQsIHRoaXMuZ2V0U3RvcnlQYWdlUmVjdF8oKSkgfHxcbiAgICAgICAgICAgIGV2ZW50LnBhdGhbMF0uY2xhc3NMaXN0LmNvbnRhaW5zKFxuICAgICAgICAgICAgICAnaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLWRpc2NsYWltZXItaWNvbidcbiAgICAgICAgICAgICkpXG4gICAgICAgICkge1xuICAgICAgICAgIHNob3VsZEhhbmRsZUV2ZW50ID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGVsLmNsYXNzTGlzdC5jb250YWlucyhcbiAgICAgICAgICAgICdpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtZGlzY2xhaW1lci1kaWFsb2ctY29udGFpbmVyJ1xuICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgc2hvdWxkSGFuZGxlRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YWdOYW1lID09PSAnYW1wLXN0b3J5LXBhZ2UnKSB7XG4gICAgICAgICAgc2hvdWxkSGFuZGxlRXZlbnQgPSB0cnVlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICAgIC8qIG9wdF9zdG9wQXQgKi8gdGhpcy5lbGVtZW50X1xuICAgICk7XG5cbiAgICByZXR1cm4gc2hvdWxkSGFuZGxlRXZlbnQ7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGFuIGVsZW1lbnQgdG8gdHJpZ2dlciBhIHRvb2x0aXAgaXQgaGFzIHRvIGJlIGRlc2NlbmRhbnQgb2ZcbiAgICogYW1wLXN0b3J5LXBhZ2UgYnV0IG5vdCBvZiBhbXAtc3RvcnktY3RhLWxheWVyLCBhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50IG9yIGFtcC1zdG9yeS1wYWdlLW91dGxpbmsuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcGFyYW0geyFDbGllbnRSZWN0fSBwYWdlUmVjdFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2FuU2hvd1Rvb2x0aXBfKGV2ZW50LCBwYWdlUmVjdCkge1xuICAgIGxldCB2YWxpZCA9IHRydWU7XG4gICAgbGV0IHRhZ05hbWU7XG4gICAgLy8gV2UgaGF2ZSBhIGBwb2ludGVyLWV2ZW50czogbm9uZWAgc2V0IHRvIGFsbCBjaGlsZHJlbiBvZiA8YT4gdGFncyBpbnNpZGVcbiAgICAvLyBvZiBhbXAtc3RvcnktZ3JpZC1sYXllciwgd2hpY2ggYWN0cyBhcyBhIGNsaWNrIHNoaWVsZCwgbWFraW5nIHN1cmUgd2VcbiAgICAvLyBoYW5kbGUgdGhlIGNsaWNrIGJlZm9yZSBuYXZpZ2F0aW9uIChzZWUgYW1wLXN0b3J5LmNzcykuIEl0IGFsc28gZW5zdXJlc1xuICAgIC8vIHdlIGFsd2F5cyBnZXQgdGhlIDxhPiB0byBiZSB0aGUgdGFyZ2V0LCBldmVuIGlmIGl0IGhhcyBjaGlsZHJlbiAoZS5nLlxuICAgIC8vIDxzcGFuPikuXG4gICAgY29uc3QgdGFyZ2V0ID0gZGV2KCkuYXNzZXJ0RWxlbWVudChldmVudC50YXJnZXQpO1xuXG4gICAgY29uc3QgY2FuU2hvdyA9ICEhY2xvc2VzdChcbiAgICAgIHRhcmdldCxcbiAgICAgIChlbCkgPT4ge1xuICAgICAgICB0YWdOYW1lID0gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICB0YWdOYW1lID09PSAnYW1wLXN0b3J5LWN0YS1sYXllcicgfHxcbiAgICAgICAgICB0YWdOYW1lID09PSAnYW1wLXN0b3J5LXBhZ2UtYXR0YWNobWVudCcgfHxcbiAgICAgICAgICB0YWdOYW1lID09PSAnYW1wLXN0b3J5LXBhZ2Utb3V0bGluaydcbiAgICAgICAgKSB7XG4gICAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFnTmFtZSA9PT0gJ2FtcC1zdG9yeS1wYWdlJyAmJiB2YWxpZDtcbiAgICAgIH0sXG4gICAgICAvKiBvcHRfc3RvcEF0ICovIHRoaXMuZWxlbWVudF9cbiAgICApO1xuXG4gICAgaWYgKFxuICAgICAgY2FuU2hvdyAmJlxuICAgICAgKHRoaXMuaXNJblN0b3J5UGFnZVNpZGVFZGdlXyhldmVudCwgcGFnZVJlY3QpIHx8XG4gICAgICAgIHRoaXMuaXNUb29MYXJnZU9uUGFnZV8oZXZlbnQsIHBhZ2VSZWN0KSlcbiAgICApIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnc2hvdy10b29sdGlwJykgPT09ICdhdXRvJyAmJlxuICAgICAgdGhpcy5pc0luU2NyZWVuQm90dG9tXyh0YXJnZXQsIHBhZ2VSZWN0KVxuICAgICkge1xuICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgndGFyZ2V0JywgJ19ibGFuaycpO1xuICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgncm9sZScsICdsaW5rJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhblNob3c7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGVsZW1lbnQgaXMgaW5zaWRlIG9mIHRoZSBib3R0b20gcmVnaW9uIG9mIHRoZSBzY3JlZW4uXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldFxuICAgKiBAcGFyYW0geyFDbGllbnRSZWN0fSBwYWdlUmVjdFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaXNJblNjcmVlbkJvdHRvbV8odGFyZ2V0LCBwYWdlUmVjdCkge1xuICAgIGNvbnN0IHRhcmdldFJlY3QgPSB0YXJnZXQuLypPSyovIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiB0YXJnZXRSZWN0LnRvcCAtIHBhZ2VSZWN0LnRvcCA+PSBwYWdlUmVjdC5oZWlnaHQgKiBUT1BfUkVHSU9OO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBjbGljayB3YXMgaW5zaWRlIG9mIG9uZSBvZiB0aGUgc2lkZSBlZGdlcyBvZiB0aGUgcGFnZS5cbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqIEBwYXJhbSB7IUNsaWVudFJlY3R9IHBhZ2VSZWN0XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpc0luU3RvcnlQYWdlU2lkZUVkZ2VfKGV2ZW50LCBwYWdlUmVjdCkge1xuICAgIC8vIENsaWNrcyB3aXRoIGNvb3JkaW5hdGVzICgwLDApIGFyZSBhc3N1bWVkIHRvIGJlIGZyb20ga2V5Ym9hcmQgb3IgVGFsa2JhY2suXG4gICAgLy8gVGhlc2UgY2xpY2tzIHNob3VsZCBuZXZlciBiZSBvdmVycmlkZW4gZm9yIG5hdmlnYXRpb24uXG4gICAgaWYgKGV2ZW50LmNsaWVudFggPT09IDAgJiYgZXZlbnQuY2xpZW50WSA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHNpZGVFZGdlV2lkdGhGcm9tUGVyY2VudCA9XG4gICAgICBwYWdlUmVjdC53aWR0aCAqIChQUk9URUNURURfU0NSRUVOX0VER0VfUEVSQ0VOVCAvIDEwMCk7XG4gICAgY29uc3Qgc2lkZUVkZ2VMaW1pdCA9IE1hdGgubWF4KFxuICAgICAgc2lkZUVkZ2VXaWR0aEZyb21QZXJjZW50LFxuICAgICAgTUlOSU1VTV9QUk9URUNURURfU0NSRUVOX0VER0VfUFhcbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIGV2ZW50LmNsaWVudFggPD0gcGFnZVJlY3QueCArIHNpZGVFZGdlTGltaXQgfHxcbiAgICAgIGV2ZW50LmNsaWVudFggPj0gcGFnZVJlY3QueCArIHBhZ2VSZWN0LndpZHRoIC0gc2lkZUVkZ2VMaW1pdFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGNsaWNrIHRhcmdldCBpcyB0b28gbGFyZ2Ugb24gdGhlIHBhZ2UgYW5kIHByZXZlbnRpbmcgbmF2aWdhdGlvbi5cbiAgICogSWYgeWVzLCB0aGUgbGluayBpcyBpZ25vcmVkICYgbG9nZ2VkLlxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHshQ2xpZW50UmVjdH0gcGFnZVJlY3RcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzVG9vTGFyZ2VPblBhZ2VfKGV2ZW50LCBwYWdlUmVjdCkge1xuICAgIC8vIENsaWNrcyB3aXRoIGNvb3JkaW5hdGVzICgwLDApIGFyZSBhc3N1bWVkIHRvIGJlIGZyb20ga2V5Ym9hcmQgb3IgVGFsa2JhY2suXG4gICAgLy8gVGhlc2UgY2xpY2tzIHNob3VsZCBuZXZlciBiZSBvdmVycmlkZW4gZm9yIG5hdmlnYXRpb24uXG4gICAgaWYgKGV2ZW50LmNsaWVudFggPT09IDAgJiYgZXZlbnQuY2xpZW50WSA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldCA9IGRldigpLmFzc2VydEVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcbiAgICBjb25zdCB0YXJnZXRSZWN0ID0gdGFyZ2V0Li8qT0sqLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAoXG4gICAgICAodGFyZ2V0UmVjdC5oZWlnaHQgKiB0YXJnZXRSZWN0LndpZHRoKSAvXG4gICAgICAgIChwYWdlUmVjdC53aWR0aCAqIHBhZ2VSZWN0LmhlaWdodCkgPj1cbiAgICAgIE1BWF9MSU5LX1NDUkVFTl9QRVJDRU5UXG4gICAgKSB7XG4gICAgICB1c2VyKCkuZXJyb3IoXG4gICAgICAgICdBTVAtU1RPUlktUEFHRScsXG4gICAgICAgICdMaW5rIHdhcyB0b28gbGFyZ2U7IHNraXBwZWQgZm9yIG5hdmlnYXRpb24uIEZvciBtb3JlIGluZm9ybWF0aW9uLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FtcHByb2plY3QvYW1waHRtbC9pc3N1ZXMvMzExMDgnXG4gICAgICApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgY2xpY2sgc2hvdWxkIGJlIGhhbmRsZWQgYnkgdGhlIGVtYmVkZGVkIGNvbXBvbmVudCBsb2dpYyByYXRoZXJcbiAgICogdGhhbiBieSBuYXZpZ2F0aW9uLlxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHshQ2xpZW50UmVjdH0gcGFnZVJlY3RcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzSGFuZGxlZEJ5RW1iZWRkZWRDb21wb25lbnRfKGV2ZW50LCBwYWdlUmVjdCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGRldigpLmFzc2VydEVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcbiAgICBjb25zdCBzdG9yZWQgPSAvKiogQHR5cGUge0ludGVyYWN0aXZlQ29tcG9uZW50RGVmfSAqLyAoXG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuSU5URVJBQ1RJVkVfQ09NUE9ORU5UX1NUQVRFKVxuICAgICk7XG4gICAgY29uc3QgaW5FeHBhbmRlZE1vZGUgPSBzdG9yZWQuc3RhdGUgPT09IEVtYmVkZGVkQ29tcG9uZW50U3RhdGUuRVhQQU5ERUQ7XG5cbiAgICByZXR1cm4gKFxuICAgICAgaW5FeHBhbmRlZE1vZGUgfHxcbiAgICAgIChtYXRjaGVzKHRhcmdldCwgSU5URVJBQ1RJVkVfRU1CRURERURfQ09NUE9ORU5UU19TRUxFQ1RPUlMpICYmXG4gICAgICAgIHRoaXMuY2FuU2hvd1Rvb2x0aXBfKGV2ZW50LCBwYWdlUmVjdCkpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBjbGljayBzaG91bGQgYmUgaGFuZGxlZCBieSB0aGUgYWZmaWxpYXRlIGxpbmsgbG9naWMuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNIYW5kbGVkQnlBZmZpbGlhdGVMaW5rXyh0YXJnZXQpIHtcbiAgICBjb25zdCBjbGlja2VkT25MaW5rID0gbWF0Y2hlcyh0YXJnZXQsIEFGRklMSUFURV9MSU5LX1NFTEVDVE9SKTtcblxuICAgIC8vIGRvIG5vdCBoYW5kbGUgaWYgY2xpY2tpbmcgb24gZXhwYW5kZWQgYWZmaWxpYXRlIGxpbmtcbiAgICBpZiAoY2xpY2tlZE9uTGluayAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKCdleHBhbmRlZCcpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgZXhwYW5kZWRFbGVtZW50ID0gdGhpcy5zdG9yZVNlcnZpY2VfLmdldChcbiAgICAgIFN0YXRlUHJvcGVydHkuQUZGSUxJQVRFX0xJTktfU1RBVEVcbiAgICApO1xuXG4gICAgcmV0dXJuIGV4cGFuZGVkRWxlbWVudCAhPSBudWxsIHx8IGNsaWNrZWRPbkxpbms7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSBzeXN0ZW0gbmF2aWdhdGlvbiBpZiBpdCBpcyBkZXRlcm1pbmVkIHRoYXQgdGhlIHNwZWNpZmllZCBldmVudFxuICAgKiB3YXMgYSBjbGljayBpbnRlbmRlZCBmb3IgbmF2aWdhdGlvbi5cbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50ICdjbGljaycgZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1heWJlUGVyZm9ybU5hdmlnYXRpb25fKGV2ZW50KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZGV2KCkuYXNzZXJ0RWxlbWVudChldmVudC50YXJnZXQpO1xuXG4gICAgY29uc3QgcGFnZVJlY3QgPSB0aGlzLmdldFN0b3J5UGFnZVJlY3RfKCk7XG5cbiAgICBpZiAodGhpcy5pc0hhbmRsZWRCeUVtYmVkZGVkQ29tcG9uZW50XyhldmVudCwgcGFnZVJlY3QpKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zdCBlbWJlZENvbXBvbmVudCA9IC8qKiBAdHlwZSB7SW50ZXJhY3RpdmVDb21wb25lbnREZWZ9ICovIChcbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LklOVEVSQUNUSVZFX0NPTVBPTkVOVF9TVEFURSlcbiAgICAgICk7XG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9JTlRFUkFDVElWRV9DT01QT05FTlQsIHtcbiAgICAgICAgZWxlbWVudDogdGFyZ2V0LFxuICAgICAgICBzdGF0ZTogZW1iZWRDb21wb25lbnQuc3RhdGUgfHwgRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5GT0NVU0VELFxuICAgICAgICBjbGllbnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICBjbGllbnRZOiBldmVudC5jbGllbnRZLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNIYW5kbGVkQnlBZmZpbGlhdGVMaW5rXyh0YXJnZXQpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBjb25zdCBjbGlja2VkT25MaW5rID0gbWF0Y2hlcyh0YXJnZXQsIEFGRklMSUFURV9MSU5LX1NFTEVDVE9SKTtcbiAgICAgIGlmIChjbGlja2VkT25MaW5rKSB7XG4gICAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uVE9HR0xFX0FGRklMSUFURV9MSU5LLCB0YXJnZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfQUZGSUxJQVRFX0xJTkssIG51bGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICF0aGlzLmlzUnVubmluZygpIHx8XG4gICAgICAhdGhpcy5pc05hdmlnYXRpb25hbENsaWNrXyhldmVudCkgfHxcbiAgICAgIHRoaXMuaXNQcm90ZWN0ZWRUYXJnZXRfKGV2ZW50KSB8fFxuICAgICAgIXRoaXMuc2hvdWxkSGFuZGxlRXZlbnRfKGV2ZW50KVxuICAgICkge1xuICAgICAgLy8gSWYgdGhlIHN5c3RlbSBkb2Vzbid0IG5lZWQgdG8gaGFuZGxlIHRoaXMgY2xpY2ssIHRoZW4gd2UgY2FuIHNpbXBseVxuICAgICAgLy8gcmV0dXJuIGFuZCBsZXQgdGhlIGV2ZW50IHByb3BhZ2F0ZSBhcyBpdCB3b3VsZCBoYXZlIG90aGVyd2lzZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChcbiAgICAgIEFjdGlvbi5TRVRfQURWQU5DRU1FTlRfTU9ERSxcbiAgICAgIEFkdmFuY2VtZW50TW9kZS5NQU5VQUxfQURWQU5DRVxuICAgICk7XG5cbiAgICAvLyBVc2luZyBgbGVmdGAgYXMgYSBmYWxsYmFjayBzaW5jZSBTYWZhcmkgcmV0dXJucyBhIENsaWVudFJlY3QgaW4gc29tZVxuICAgIC8vIGNhc2VzLlxuICAgIGNvbnN0IG9mZnNldExlZnQgPSAneCcgaW4gcGFnZVJlY3QgPyBwYWdlUmVjdC54IDogcGFnZVJlY3QubGVmdDtcblxuICAgIGNvbnN0IHBhZ2UgPSB7XG4gICAgICAvLyBPZmZzZXQgc3RhcnRpbmcgbGVmdCBvZiB0aGUgcGFnZS5cbiAgICAgIG9mZnNldDogb2Zmc2V0TGVmdCxcbiAgICAgIHdpZHRoOiBwYWdlUmVjdC53aWR0aCxcbiAgICAgIGNsaWNrRXZlbnRYOiBldmVudC5wYWdlWCxcbiAgICB9O1xuXG4gICAgdGhpcy5vblRhcE5hdmlnYXRpb24odGhpcy5nZXRUYXBEaXJlY3Rpb25fKHBhZ2UpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHRoZSBwYWdlUmVjdCBiYXNlZCBvbiB0aGUgVUlUeXBlLlxuICAgKiBXZSBjYW4gYW4gdXNlIExheW91dEJveCBmb3IgbW9iaWxlIHNpbmNlIHRoZSBzdG9yeSBwYWdlIG9jY3VwaWVzIGVudGlyZSBzY3JlZW4uXG4gICAqIERlc2t0b3AgVUkgbmVlZHMgdGhlIG1vc3QgcmVjZW50IHZhbHVlIGZyb20gdGhlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBmdW5jdGlvbi5cbiAgICogQHJldHVybiB7RE9NUmVjdCB8IExheW91dEJveH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldFN0b3J5UGFnZVJlY3RfKCkge1xuICAgIGNvbnN0IHVpU3RhdGUgPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuVUlfU1RBVEUpO1xuICAgIGlmIChcbiAgICAgIHVpU3RhdGUgIT09IFVJVHlwZS5ERVNLVE9QX1BBTkVMUyAmJlxuICAgICAgdWlTdGF0ZSAhPT0gVUlUeXBlLkRFU0tUT1BfT05FX1BBTkVMXG4gICAgKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50Xy5nZXRMYXlvdXRCb3goKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudF9cbiAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ2FtcC1zdG9yeS1wYWdlW2FjdGl2ZV0nKVxuICAgICAgICAuLypPSyovIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNpZGVzIHdoYXQgZGlyZWN0aW9uIHRvIG5hdmlnYXRlIGRlcGVuZGluZyBvbiB3aGljaFxuICAgKiBzZWN0aW9uIG9mIHRoZSBwYWdlIHdhcyB0aGVyZSBhIGNsaWNrLiBUaGUgbmF2aWdhdGlvbiBkaXJlY3Rpb24gb2YgZWFjaFxuICAgKiBpbmRpdmlkdWFsIHNlY3Rpb24gaGFzIGJlZW4gcHJldmlvdXNseSBkZWZpbmVkIGRlcGVuZGluZyBvbiB0aGUgbGFuZ3VhZ2VcbiAgICogc2V0dGluZ3MuXG4gICAqIEBwYXJhbSB7IU9iamVjdH0gcGFnZVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRUYXBEaXJlY3Rpb25fKHBhZ2UpIHtcbiAgICBjb25zdCB7bGVmdCwgcmlnaHR9ID0gdGhpcy5zZWN0aW9uc187XG5cbiAgICBpZiAocGFnZS5jbGlja0V2ZW50WCA8PSBwYWdlLm9mZnNldCArIGxlZnQud2lkdGhSYXRpbyAqIHBhZ2Uud2lkdGgpIHtcbiAgICAgIHJldHVybiBsZWZ0LmRpcmVjdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gcmlnaHQuZGlyZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gaW5zdGFuY2Ugb2YgTWFudWFsQWR2YW5jZW1lbnQgYmFzZWQgb24gdGhlIEhUTUwgdGFnIG9mIHRoZSBlbGVtZW50LlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEByZXR1cm4gez9BZHZhbmNlbWVudENvbmZpZ30gQW4gQWR2YW5jZW1lbnRDb25maWcsIG9ubHkgaWYgdGhlIGVsZW1lbnQgaXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbiBhbXAtc3RvcnkgdGFnLlxuICAgKi9cbiAgc3RhdGljIGZyb21FbGVtZW50KHdpbiwgZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2FtcC1zdG9yeScpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IE1hbnVhbEFkdmFuY2VtZW50KHdpbiwgZWxlbWVudCk7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm92aWRlcyBwcm9ncmVzcyBhbmQgYWR2YW5jZW1lbnQgYmFzZWQgb24gYSBmaXhlZCBkdXJhdGlvbiBvZiB0aW1lLFxuICogc3BlY2lmaWVkIGluIGVpdGhlciBzZWNvbmRzIG9yIG1pbGxpc2Vjb25kcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRpbWVCYXNlZEFkdmFuY2VtZW50IGV4dGVuZHMgQWR2YW5jZW1lbnRDb25maWcge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW4gVGhlIFdpbmRvdyBvYmplY3QuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZWxheU1zIFRoZSBkdXJhdGlvbiB0byB3YWl0IGJlZm9yZSBhZHZhbmNpbmcuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgZGVsYXlNcywgZWxlbWVudCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvdGltZXItaW1wbC5UaW1lcn0gKi9cbiAgICB0aGlzLnRpbWVyXyA9IFNlcnZpY2VzLnRpbWVyRm9yKHdpbik7XG5cbiAgICBpZiAoZGVsYXlNcyA8IE1JTklNVU1fVElNRV9CQVNFRF9BVVRPX0FEVkFOQ0VfTVMpIHtcbiAgICAgIHVzZXIoKS53YXJuKFxuICAgICAgICAnQU1QLVNUT1JZLVBBR0UnLFxuICAgICAgICBgJHtlbGVtZW50LmlkfSBoYXMgYW4gYXV0byBhZHZhbmNlIGR1cmF0aW9uIHRoYXQgaXMgdG9vIHNob3J0LiBgICtcbiAgICAgICAgICBgJHtNSU5JTVVNX1RJTUVfQkFTRURfQVVUT19BRFZBTkNFX01TfW1zIGlzIHVzZWQgaW5zdGVhZC5gXG4gICAgICApO1xuICAgICAgZGVsYXlNcyA9IE1JTklNVU1fVElNRV9CQVNFRF9BVVRPX0FEVkFOQ0VfTVM7XG4gICAgfVxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge251bWJlcn0gKi9cbiAgICB0aGlzLmRlbGF5TXNfID0gZGVsYXlNcztcblxuICAgIC8qKiBAcHJpdmF0ZSB7P251bWJlcn0gKi9cbiAgICB0aGlzLnJlbWFpbmluZ0RlbGF5TXNfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P251bWJlcn0gKi9cbiAgICB0aGlzLnN0YXJ0VGltZU1zXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcnxzdHJpbmd8bnVsbH0gKi9cbiAgICB0aGlzLnRpbWVvdXRJZF8gPSBudWxsO1xuXG4gICAgaWYgKGVsZW1lbnQub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldykge1xuICAgICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2V9ICovXG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8gPSBnZXRTdG9yZVNlcnZpY2UoZWxlbWVudC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgY3VycmVudCB0aW1lc3RhbXAsIGluIG1pbGxpc2Vjb25kcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldEN1cnJlbnRUaW1lc3RhbXBNc18oKSB7XG4gICAgcmV0dXJuIERhdGUubm93KCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICBpZiAodGhpcy5yZW1haW5pbmdEZWxheU1zXykge1xuICAgICAgdGhpcy5zdGFydFRpbWVNc18gPVxuICAgICAgICB0aGlzLmdldEN1cnJlbnRUaW1lc3RhbXBNc18oKSAtXG4gICAgICAgICh0aGlzLmRlbGF5TXNfIC0gdGhpcy5yZW1haW5pbmdEZWxheU1zXyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhcnRUaW1lTXNfID0gdGhpcy5nZXRDdXJyZW50VGltZXN0YW1wTXNfKCk7XG4gICAgfVxuXG4gICAgdGhpcy50aW1lb3V0SWRfID0gdGhpcy50aW1lcl8uZGVsYXkoXG4gICAgICAoKSA9PiB0aGlzLm9uQWR2YW5jZSgpLFxuICAgICAgdGhpcy5yZW1haW5pbmdEZWxheU1zXyB8fCB0aGlzLmRlbGF5TXNfXG4gICAgKTtcblxuICAgIHRoaXMub25Qcm9ncmVzc1VwZGF0ZSgpO1xuXG4gICAgdGhpcy50aW1lcl8ucG9sbChQT0xMX0lOVEVSVkFMX01TLCAoKSA9PiB7XG4gICAgICB0aGlzLm9uUHJvZ3Jlc3NVcGRhdGUoKTtcbiAgICAgIHJldHVybiAhdGhpcy5pc1J1bm5pbmcoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgc3RvcChjYW5SZXN1bWUgPSBmYWxzZSkge1xuICAgIHN1cGVyLnN0b3AoKTtcblxuICAgIGlmICh0aGlzLnRpbWVvdXRJZF8gIT09IG51bGwpIHtcbiAgICAgIHRoaXMudGltZXJfLmNhbmNlbCh0aGlzLnRpbWVvdXRJZF8pO1xuICAgIH1cblxuICAgIC8vIFN0b3JlIHRoZSByZW1haW5pbmcgdGltZSBpZiB0aGUgYWR2YW5jZW1lbnQgY2FuIGJlIHJlc3VtZSwgaWU6IGlmIGl0IGlzXG4gICAgLy8gcGF1c2VkLlxuICAgIHRoaXMucmVtYWluaW5nRGVsYXlNc18gPSBjYW5SZXN1bWVcbiAgICAgID8gdGhpcy5zdGFydFRpbWVNc18gKyB0aGlzLmRlbGF5TXNfIC0gdGhpcy5nZXRDdXJyZW50VGltZXN0YW1wTXNfKClcbiAgICAgIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGlzQXV0b0FkdmFuY2UoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFByb2dyZXNzKCkge1xuICAgIGlmICh0aGlzLnN0YXJ0VGltZU1zXyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvZ3Jlc3MgPVxuICAgICAgKHRoaXMuZ2V0Q3VycmVudFRpbWVzdGFtcE1zXygpIC0gdGhpcy5zdGFydFRpbWVNc18pIC8gdGhpcy5kZWxheU1zXztcblxuICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChwcm9ncmVzcywgMCksIDEpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvbkFkdmFuY2UoKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKFxuICAgICAgQWN0aW9uLlNFVF9BRFZBTkNFTUVOVF9NT0RFLFxuICAgICAgQWR2YW5jZW1lbnRNb2RlLkFVVE9fQURWQU5DRV9USU1FXG4gICAgKTtcbiAgICBzdXBlci5vbkFkdmFuY2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBkZWxheSAoYW5kIGRlcml2ZWQgdmFsdWVzKSBmcm9tIHRoZSBnaXZlbiBhdXRvLWFkdmFuY2Ugc3RyaW5nLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXV0b0FkdmFuY2VTdHIgVGhlIHZhbHVlIG9mIHRoZSB1cGRhdGVkIGF1dG8tYWR2YW5jZS1hZnRlciBhdHRyaWJ1dGUuXG4gICAqL1xuICB1cGRhdGVUaW1lRGVsYXkoYXV0b0FkdmFuY2VTdHIpIHtcbiAgICBjb25zdCBuZXdEZWxheU1zID0gdGltZVN0clRvTWlsbGlzKGF1dG9BZHZhbmNlU3RyKTtcbiAgICBpZiAobmV3RGVsYXlNcyA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKG5ld0RlbGF5TXMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnJlbWFpbmluZ0RlbGF5TXNfKSB7XG4gICAgICB0aGlzLnJlbWFpbmluZ0RlbGF5TXNfICs9IG5ld0RlbGF5TXMgLSB0aGlzLmRlbGF5TXNfO1xuICAgIH1cbiAgICB0aGlzLmRlbGF5TXNfID0gbmV3RGVsYXlNcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIGluc3RhbmNlIG9mIFRpbWVCYXNlZEFkdmFuY2VtZW50IGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiB0aGVcbiAgICogYXV0by1hZHZhbmNlIHN0cmluZyAoZnJvbSB0aGUgJ2F1dG8tYWR2YW5jZS1hZnRlcicgYXR0cmlidXRlIG9uIHRoZSBwYWdlKS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGF1dG9BZHZhbmNlU3RyIFRoZSB2YWx1ZSBvZiB0aGUgYXV0by1hZHZhbmNlLWFmdGVyXG4gICAqICAgICBhdHRyaWJ1dGUuXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHJldHVybiB7P0FkdmFuY2VtZW50Q29uZmlnfSBBbiBBZHZhbmNlbWVudENvbmZpZywgaWYgdGltZS1iYXNlZFxuICAgKiAgICAgYXV0by1hZHZhbmNlIGlzIHN1cHBvcnRlZCBmb3IgdGhlIHNwZWNpZmllZCBhdXRvLWFkdmFuY2Ugc3RyaW5nOyBudWxsXG4gICAqICAgICBvdGhlcndpc2UuXG4gICAqL1xuICBzdGF0aWMgZnJvbUF1dG9BZHZhbmNlU3RyaW5nKGF1dG9BZHZhbmNlU3RyLCB3aW4sIGVsZW1lbnQpIHtcbiAgICBpZiAoIWF1dG9BZHZhbmNlU3RyKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkZWxheU1zID0gdGltZVN0clRvTWlsbGlzKGF1dG9BZHZhbmNlU3RyKTtcbiAgICBpZiAoZGVsYXlNcyA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKGRlbGF5TXMpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFRpbWVCYXNlZEFkdmFuY2VtZW50KHdpbiwgTnVtYmVyKGRlbGF5TXMpLCBlbGVtZW50KTtcbiAgfVxufVxuXG4vKipcbiAqIFByb3ZpZGVzIHByb2dyZXNzIGFuZCBhZHZhbmNlcyBwYWdlcyBiYXNlZCBvbiB0aGUgY29tcGxldGlvbiBwZXJjZW50YWdlIG9mXG4gKiBwbGF5YmFjayBvZiBhbiBIVE1MTWVkaWFFbGVtZW50IG9yIGEgdmlkZW8gdGhhdCBpbXBsZW1lbnRzIHRoZSBBTVBcbiAqIHZpZGVvLWludGVyZmFjZS5cbiAqXG4gKiBUaGVzZSBhcmUgY29tYmluZWQgaW50byBhIHNpbmdsZSBBZHZhbmNlbWVudENvbmZpZyBpbXBsZW1lbnRhdGlvbiBiZWNhdXNlIHdlXG4gKiBtYXkgbm90IGtub3cgYXQgYnVpbGQgdGltZSB3aGV0aGVyIGEgdmlkZW8gaW1wbGVtZW50cyB0aGUgQU1QXG4gKiB2aWRlby1pbnRlcmZhY2UsIHNpbmNlIHRoYXQgaXMgZGVwZW5kZW50IG9uIHRoZSBhbXAtdmlkZW8gYnVpbGRDYWxsYmFja1xuICogaGF2aW5nIGJlZW4gZXhlY3V0ZWQgYmVmb3JlIHRoZSBhbXAtc3RvcnktcGFnZSBidWlsZENhbGxiYWNrLCB3aGljaCBpcyBub3RcbiAqIGd1YXJhbnRlZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZWRpYUJhc2VkQWR2YW5jZW1lbnQgZXh0ZW5kcyBBZHZhbmNlbWVudENvbmZpZyB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIGVsZW1lbnQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3RpbWVyLWltcGwuVGltZXJ9ICovXG4gICAgdGhpcy50aW1lcl8gPSBTZXJ2aWNlcy50aW1lckZvcih3aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIHshRWxlbWVudH0gKi9cbiAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5tZWRpYUVsZW1lbnRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUFycmF5PCFVbmxpc3RlbkRlZj59ICovXG4gICAgdGhpcy51bmxpc3RlbkZuc18gPSBbXTtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/VW5saXN0ZW5EZWZ9ICovXG4gICAgdGhpcy51bmxpc3RlbkVuZGVkRm5fID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/VW5saXN0ZW5EZWZ9ICovXG4gICAgdGhpcy51bmxpc3RlblRpbWV1cGRhdGVGbl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li4vLi4vLi4vc3JjL3ZpZGVvLWludGVyZmFjZS5WaWRlb0ludGVyZmFjZX0gKi9cbiAgICB0aGlzLnZpZGVvXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi9hbXAtc3Rvcnktc3RvcmUtc2VydmljZS5BbXBTdG9yeVN0b3JlU2VydmljZX0gKi9cbiAgICB0aGlzLnN0b3JlU2VydmljZV8gPSBnZXRTdG9yZVNlcnZpY2Uod2luKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGVsZW1lbnQgZm9yIGF1dG8gYWR2YW5jZW1lbnQgaW1wbGVtZW50cyB0aGUgdmlkZW9cbiAgICogaW50ZXJmYWNlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlLCBpZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW1wbGVtZW50cyB0aGUgdmlkZW9cbiAgICogICAgIGludGVyZmFjZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzVmlkZW9JbnRlcmZhY2VWaWRlb18oKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKCdpLWFtcGh0bWwtdmlkZW8taW50ZXJmYWNlJyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBIVE1MTWVkaWFFbGVtZW50IGZyb20gYW4gZWxlbWVudCB0aGF0IHdyYXBzIGl0LlxuICAgKiBAcmV0dXJuIHs/RWxlbWVudH0gVGhlIHVuZGVybHlpbmcgSFRNTE1lZGlhRWxlbWVudCwgaWYgb25lIGV4aXN0cy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldE1lZGlhRWxlbWVudF8oKSB7XG4gICAgY29uc3QgdGFnTmFtZSA9IHRoaXMuZWxlbWVudF8udGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgaWYgKHRoaXMuZWxlbWVudF8gaW5zdGFuY2VvZiBIVE1MTWVkaWFFbGVtZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50XztcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdGhpcy5lbGVtZW50Xy5oYXNBdHRyaWJ1dGUoJ2JhY2tncm91bmQtYXVkaW8nKSAmJlxuICAgICAgdGFnTmFtZSA9PT0gJ2FtcC1zdG9yeS1wYWdlJ1xuICAgICkge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvcignLmktYW1waHRtbC1zdG9yeS1iYWNrZ3JvdW5kLWF1ZGlvJyk7XG4gICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnYW1wLWF1ZGlvJykge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvcignYXVkaW8nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIC8vIFByZXZlbnRzIHJhY2UgY29uZGl0aW9uIHdoZW4gY2hlY2tpbmcgZm9yIHZpZGVvIGludGVyZmFjZSBjbGFzc25hbWUuXG4gICAgKHRoaXMuZWxlbWVudF8uYnVpbGQgPyB0aGlzLmVsZW1lbnRfLmJ1aWxkKCkgOiBQcm9taXNlLnJlc29sdmUoKSkudGhlbigoKSA9PlxuICAgICAgdGhpcy5zdGFydFdoZW5CdWlsdF8oKVxuICAgICk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RhcnRXaGVuQnVpbHRfKCkge1xuICAgIGlmICh0aGlzLmlzVmlkZW9JbnRlcmZhY2VWaWRlb18oKSkge1xuICAgICAgdGhpcy5zdGFydFZpZGVvSW50ZXJmYWNlRWxlbWVudF8oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubWVkaWFFbGVtZW50Xykge1xuICAgICAgdGhpcy5tZWRpYUVsZW1lbnRfID0gdGhpcy5nZXRNZWRpYUVsZW1lbnRfKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWVkaWFFbGVtZW50Xykge1xuICAgICAgdGhpcy5zdGFydEh0bWxNZWRpYUVsZW1lbnRfKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdXNlcigpLmVycm9yKFxuICAgICAgJ0FNUC1TVE9SWS1QQUdFJyxcbiAgICAgIGBFbGVtZW50IHdpdGggSUQgJHt0aGlzLmVsZW1lbnRfLmlkfSBpcyBub3QgYSBtZWRpYSBlbGVtZW50IGAgK1xuICAgICAgICAnc3VwcG9ydGVkIGZvciBhdXRvbWF0aWMgYWR2YW5jZW1lbnQuJ1xuICAgICk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RhcnRIdG1sTWVkaWFFbGVtZW50XygpIHtcbiAgICBjb25zdCBtZWRpYUVsZW1lbnQgPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgdGhpcy5tZWRpYUVsZW1lbnRfLFxuICAgICAgJ01lZGlhIGVsZW1lbnQgd2FzIHVuc3BlY2lmaWVkLidcbiAgICApO1xuXG4gICAgLy8gUmVtb3ZlcyBbbG9vcF0gYXR0cmlidXRlIGlmIHNwZWNpZmllZCwgc28gdGhlICdlbmRlZCcgZXZlbnQgY2FuIHRyaWdnZXIuXG4gICAgdGhpcy5tZWRpYUVsZW1lbnRfLnJlbW92ZUF0dHJpYnV0ZSgnbG9vcCcpO1xuXG4gICAgdGhpcy51bmxpc3RlbkZuc18ucHVzaChcbiAgICAgIGxpc3Rlbk9uY2UobWVkaWFFbGVtZW50LCAnZW5kZWQnLCAoKSA9PiB0aGlzLm9uQWR2YW5jZSgpKVxuICAgICk7XG5cbiAgICB0aGlzLm9uUHJvZ3Jlc3NVcGRhdGUoKTtcblxuICAgIHRoaXMudGltZXJfLnBvbGwoUE9MTF9JTlRFUlZBTF9NUywgKCkgPT4ge1xuICAgICAgdGhpcy5vblByb2dyZXNzVXBkYXRlKCk7XG4gICAgICByZXR1cm4gIXRoaXMuaXNSdW5uaW5nKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RhcnRWaWRlb0ludGVyZmFjZUVsZW1lbnRfKCkge1xuICAgIHRoaXMuZWxlbWVudF8uZ2V0SW1wbCgpLnRoZW4oKHZpZGVvKSA9PiB7XG4gICAgICB0aGlzLnZpZGVvXyA9IHZpZGVvO1xuICAgIH0pO1xuXG4gICAgLy8gUmVtb3ZlcyBbbG9vcF0gYXR0cmlidXRlIGlmIHNwZWNpZmllZCwgc28gdGhlICdlbmRlZCcgZXZlbnQgY2FuIHRyaWdnZXIuXG4gICAgdGhpcy5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yKCd2aWRlbycpLnJlbW92ZUF0dHJpYnV0ZSgnbG9vcCcpO1xuXG4gICAgdGhpcy51bmxpc3RlbkZuc18ucHVzaChcbiAgICAgIGxpc3Rlbk9uY2UodGhpcy5lbGVtZW50XywgVmlkZW9FdmVudHMuRU5ERUQsICgpID0+IHRoaXMub25BZHZhbmNlKCksIHtcbiAgICAgICAgY2FwdHVyZTogdHJ1ZSxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHRoaXMub25Qcm9ncmVzc1VwZGF0ZSgpO1xuXG4gICAgdGhpcy50aW1lcl8ucG9sbChQT0xMX0lOVEVSVkFMX01TLCAoKSA9PiB7XG4gICAgICB0aGlzLm9uUHJvZ3Jlc3NVcGRhdGUoKTtcbiAgICAgIHJldHVybiAhdGhpcy5pc1J1bm5pbmcoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgc3RvcCgpIHtcbiAgICBzdXBlci5zdG9wKCk7XG4gICAgdGhpcy51bmxpc3RlbkZuc18uZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgaXNBdXRvQWR2YW5jZSgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0UHJvZ3Jlc3MoKSB7XG4gICAgaWYgKHRoaXMuaXNWaWRlb0ludGVyZmFjZVZpZGVvXygpKSB7XG4gICAgICBpZiAodGhpcy52aWRlb18gJiYgdGhpcy52aWRlb18uZ2V0RHVyYXRpb24oKSkge1xuICAgICAgICByZXR1cm4gdGhpcy52aWRlb18uZ2V0Q3VycmVudFRpbWUoKSAvIHRoaXMudmlkZW9fLmdldER1cmF0aW9uKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm1lZGlhRWxlbWVudF8gJiYgdGhpcy5tZWRpYUVsZW1lbnRfLmR1cmF0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5tZWRpYUVsZW1lbnRfLmN1cnJlbnRUaW1lIC8gdGhpcy5tZWRpYUVsZW1lbnRfLmR1cmF0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiBzdXBlci5nZXRQcm9ncmVzcygpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvbkFkdmFuY2UoKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKFxuICAgICAgQWN0aW9uLlNFVF9BRFZBTkNFTUVOVF9NT0RFLFxuICAgICAgQWR2YW5jZW1lbnRNb2RlLkFVVE9fQURWQU5DRV9NRURJQVxuICAgICk7XG4gICAgc3VwZXIub25BZHZhbmNlKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBpbnN0YW5jZSBvZiBNZWRpYUJhc2VkQWR2YW5jZW1lbnQgYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZVxuICAgKiBhdXRvLWFkdmFuY2Ugc3RyaW5nIChmcm9tIHRoZSAnYXV0by1hZHZhbmNlLWFmdGVyJyBhdHRyaWJ1dGUgb24gdGhlIHBhZ2UpLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXV0b0FkdmFuY2VTdHIgVGhlIHZhbHVlIG9mIHRoZSBhdXRvLWFkdmFuY2UtYWZ0ZXJcbiAgICogICAgIGF0dHJpYnV0ZS5cbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcGFnZUVsXG4gICAqIEByZXR1cm4gez9BZHZhbmNlbWVudENvbmZpZ30gQW4gQWR2YW5jZW1lbnRDb25maWcsIGlmIG1lZGlhLWVsZW1lbnQtYmFzZWRcbiAgICogICAgIGF1dG8tYWR2YW5jZSBpcyBzdXBwb3J0ZWQgZm9yIHRoZSBzcGVjaWZpZWQgYXV0by1hZHZhbmNlIHN0cmluZzsgbnVsbFxuICAgKiAgICAgb3RoZXJ3aXNlLlxuICAgKi9cbiAgc3RhdGljIGZyb21BdXRvQWR2YW5jZVN0cmluZyhhdXRvQWR2YW5jZVN0ciwgd2luLCBwYWdlRWwpIHtcbiAgICB0cnkge1xuICAgICAgLy8gYW1wLXZpZGVvLCBhbXAtYXVkaW8sIGFzIHdlbGwgYXMgYW1wLXN0b3J5LXBhZ2Ugd2l0aCBhIGJhY2tncm91bmQgYXVkaW9cbiAgICAgIC8vIGFyZSBlbGlnaWJsZSBmb3IgbWVkaWEgYmFzZWQgYXV0byBhZHZhbmNlLlxuICAgICAgbGV0IGVsZW1lbnQgPSBwYWdlRWwucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGFtcC12aWRlb1tkYXRhLWlkPSR7ZXNjYXBlQ3NzU2VsZWN0b3JJZGVudChhdXRvQWR2YW5jZVN0cil9XSxcbiAgICAgICAgICBhbXAtdmlkZW8jJHtlc2NhcGVDc3NTZWxlY3RvcklkZW50KGF1dG9BZHZhbmNlU3RyKX0sXG4gICAgICAgICAgYW1wLWF1ZGlvW2RhdGEtaWQ9JHtlc2NhcGVDc3NTZWxlY3RvcklkZW50KGF1dG9BZHZhbmNlU3RyKX1dLFxuICAgICAgICAgIGFtcC1hdWRpbyMke2VzY2FwZUNzc1NlbGVjdG9ySWRlbnQoYXV0b0FkdmFuY2VTdHIpfWBcbiAgICAgICk7XG4gICAgICBpZiAoXG4gICAgICAgIG1hdGNoZXMoXG4gICAgICAgICAgcGFnZUVsLFxuICAgICAgICAgIGBhbXAtc3RvcnktcGFnZVtiYWNrZ3JvdW5kLWF1ZGlvXSMke2VzY2FwZUNzc1NlbGVjdG9ySWRlbnQoXG4gICAgICAgICAgICBhdXRvQWR2YW5jZVN0clxuICAgICAgICAgICl9YFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgZWxlbWVudCA9IHBhZ2VFbDtcbiAgICAgIH1cbiAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICBpZiAoYXV0b0FkdmFuY2VTdHIpIHtcbiAgICAgICAgICB1c2VyKCkud2FybihcbiAgICAgICAgICAgICdBTVAtU1RPUlktUEFHRScsXG4gICAgICAgICAgICBgRWxlbWVudCB3aXRoIElEICR7cGFnZUVsLmlkfSBoYXMgbm8gbWVkaWEgZWxlbWVudCBgICtcbiAgICAgICAgICAgICAgJ3N1cHBvcnRlZCBmb3IgYXV0b21hdGljIGFkdmFuY2VtZW50LidcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IE1lZGlhQmFzZWRBZHZhbmNlbWVudCh3aW4sIGVsZW1lbnQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/page-advancement.js