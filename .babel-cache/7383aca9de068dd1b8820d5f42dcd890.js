function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";var _template = ["<div class=i-amphtml-story-draggable-drawer><div class=i-amphtml-story-draggable-drawer-container><div class=i-amphtml-story-draggable-drawer-content></div></div></div>"],_template2 = ["<div class=i-amphtml-story-draggable-drawer-header></div>"];function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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

import {
Action,
StateProperty,
UIType,
getStoreService } from "./amp-story-store-service";

import { CSS } from "../../../build/amp-story-draggable-drawer-header-1.0.css";
import { Layout } from "../../../src/core/dom/layout";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { closest } from "../../../src/core/dom/query";
import { createShadowRootWithStyle } from "./utils";
import { dev, devAssert } from "../../../src/log";
import { getLocalizationService } from "./amp-story-localization-service";
import { htmlFor } from "../../../src/core/dom/static-template";
import { isAmpElement } from "../../../src/amp-element-helpers";
import { isPageAttachmentUiV2ExperimentOn } from "./amp-story-page-attachment-ui-v2";
import { listen } from "../../../src/event-helper";
import { resetStyles, setImportantStyles, toggle } from "../../../src/core/dom/style";

/** @const {number} */
var TOGGLE_THRESHOLD_PX = 50;

/**
 * @enum {number}
 */
export var DrawerState = {
  CLOSED: 0,
  DRAGGING_TO_CLOSE: 1,
  DRAGGING_TO_OPEN: 2,
  OPEN: 3 };


/**
 * Drawer's template.
 * @param {!Element} element
 * @return {!Element}
 */
var getTemplateEl = function getTemplateEl(element) {
  return htmlFor(element)(_template);





};

/**
 * Drawer's header template.
 * @param {!Element} element
 * @return {!Element}
 */
var getHeaderEl = function getHeaderEl(element) {
  return htmlFor(element)(_template2);

};

/**
 * Abstract draggable drawer.
 * @abstract
 */
export var DraggableDrawer = /*#__PURE__*/function (_AMP$BaseElement) {_inherits(DraggableDrawer, _AMP$BaseElement);var _super = _createSuper(DraggableDrawer);





  /** @param {!AmpElement} element */
  function DraggableDrawer(element) {var _this;_classCallCheck(this, DraggableDrawer);
    _this = _super.call(this, element);

    /** @private {!Array<!Element>} AMP components within the drawer. */
    _this.ampComponents_ = [];

    /** @protected {?Element} */
    _this.containerEl = null;

    /** @protected {?Element} */
    _this.contentEl = null;

    /** @private {number} Max value in pixels that can be dragged when opening the drawer. */
    _this.dragCap_ = Infinity;

    /** @protected {?Element} */
    _this.headerEl = null;

    /** @private {boolean} */
    _this.ignoreCurrentSwipeYGesture_ = false;

    /** @protected {!DrawerState} */
    _this.state = DrawerState.CLOSED;

    /** @protected @const {!./amp-story-store-service.AmpStoryStoreService} */
    _this.storeService = getStoreService(_this.win);

    /** @private {!Object} */
    _this.touchEventState_ = {
      startX: 0,
      startY: 0,
      lastY: 0,
      swipingUp: null,
      isSwipeY: null };


    /** @private {!Array<function()>} */
    _this.touchEventUnlisteners_ = [];

    /** @private {number} Threshold in pixels above which the drawer opens itself. */
    _this.openThreshold_ = Infinity;

    /**
     * For amp-story-page-attachment-ui-v2 experiment
     * Used for offsetting drag.
     * @private {?number}
     */
    _this.spacerElHeight_ = null;return _this;
  }

  /** @override */_createClass(DraggableDrawer, [{ key: "isLayoutSupported", value:
    function isLayoutSupported(layout) {
      return layout === Layout.NODISPLAY;
    }

    /** @override */ }, { key: "buildCallback", value:
    function buildCallback() {
      this.element.classList.add('amp-story-draggable-drawer-root');

      var templateEl = getTemplateEl(this.element);
      var headerShadowRootEl = this.win.document.createElement('div');
      this.headerEl = getHeaderEl(this.element);

      createShadowRootWithStyle(headerShadowRootEl, this.headerEl, CSS);

      this.containerEl = /** @type {!Element} */(
      templateEl.querySelector('.i-amphtml-story-draggable-drawer-container'));

      this.contentEl = /** @type {!Element} */(
      this.containerEl.querySelector(
      '.i-amphtml-story-draggable-drawer-content'));



      if (isPageAttachmentUiV2ExperimentOn(this.win)) {
        var spacerEl = this.win.document.createElement('button');
        spacerEl.classList.add('i-amphtml-story-draggable-drawer-spacer');
        spacerEl.classList.add('i-amphtml-story-system-reset');
        spacerEl.setAttribute('role', 'button');
        var localizationService = getLocalizationService(
        devAssert(this.element));

        if (localizationService) {
          var localizedCloseString = localizationService.getLocalizedString(
          LocalizedStringId.AMP_STORY_CLOSE_BUTTON_LABEL);

          spacerEl.setAttribute('aria-label', localizedCloseString);
        }
        this.containerEl.insertBefore(spacerEl, this.contentEl);
        this.contentEl.appendChild(headerShadowRootEl);
        this.element.classList.add('i-amphtml-amp-story-page-attachment-ui-v2');
        this.headerEl.classList.add('i-amphtml-amp-story-page-attachment-ui-v2');
      } else {
        templateEl.insertBefore(headerShadowRootEl, templateEl.firstChild);
      }

      this.element.appendChild(templateEl);
      this.element.setAttribute('aria-hidden', true);
    }

    /** @override */ }, { key: "layoutCallback", value:
    function layoutCallback() {
      this.initializeListeners_();

      var walker = this.win.document.createTreeWalker(
      this.element,
      NodeFilter.SHOW_ELEMENT,
      null /** filter */,
      false /** entityReferenceExpansion */);

      while (walker.nextNode()) {
        var el = /** @type {!Element} */(walker.currentNode);
        if (isAmpElement(el)) {
          this.ampComponents_.push(el);
          Services.ownersForDoc(this.element).setOwner(el, this.element);
        }
      }
      return _resolvedPromise();
    }

    /**
     * @protected
     */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {var _this2 = this;
      this.storeService.subscribe(
      StateProperty.UI_STATE,
      function (uiState) {
        _this2.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */);


      if (isPageAttachmentUiV2ExperimentOn(this.win)) {
        var spacerEl = /** @type {!Element} */(
        this.element.querySelector('.i-amphtml-story-draggable-drawer-spacer'));


        // Handle click on spacer element to close.
        spacerEl.addEventListener('click', function () {
          _this2.close_();
        });

        // For displaying sticky header on mobile.
        new this.win.IntersectionObserver(function (e) {
          _this2.headerEl.classList.toggle(
          'i-amphtml-story-draggable-drawer-header-stuck',
          !e[0].isIntersecting);

        }).observe(spacerEl);

        // Update spacerElHeight_ on resize for drag offset.
        new this.win.ResizeObserver(function (e) {
          _this2.spacerElHeight_ = e[0].contentRect.height;
        }).observe(spacerEl);

        // Reset scroll position on end of close transiton.
        this.element.addEventListener('transitionend', function (e) {
          if (
          e.propertyName === 'transform' &&
          _this2.state === DrawerState.CLOSED)
          {
            _this2.containerEl. /*OK*/scrollTop = 0;
          }
        });
      }
    }

    /**
     * Reacts to UI state updates.
     * @param {!UIType} uiState
     * @protected
     */ }, { key: "onUIStateUpdate_", value:
    function onUIStateUpdate_(uiState) {
      var isMobile = uiState === UIType.MOBILE;

      isMobile ?
      this.startListeningForTouchEvents_() :
      this.stopListeningForTouchEvents_();

      this.headerEl.toggleAttribute('desktop', !isMobile);
    }

    /**
     * @private
     */ }, { key: "startListeningForTouchEvents_", value:
    function startListeningForTouchEvents_() {
      // If the element is a direct descendant of amp-story-page, authorize
      // swiping up by listening to events at the page level. Otherwise, only
      // authorize swiping down to close by listening to events at the current
      // element level.
      var parentEl = this.element.parentElement;
      var el = /** @type {!Element} */(
      parentEl.tagName === 'AMP-STORY-PAGE' ? parentEl : this.element);


      this.touchEventUnlisteners_.push(
      listen(el, 'touchstart', this.onTouchStart_.bind(this), {
        capture: true }));


      this.touchEventUnlisteners_.push(
      listen(el, 'touchmove', this.onTouchMove_.bind(this), {
        capture: true }));


      this.touchEventUnlisteners_.push(
      listen(el, 'touchend', this.onTouchEnd_.bind(this), {
        capture: true }));


    }

    /**
     * @private
     */ }, { key: "stopListeningForTouchEvents_", value:
    function stopListeningForTouchEvents_() {
      this.touchEventUnlisteners_.forEach(function (fn) {return fn();});
      this.touchEventUnlisteners_ = [];
    }

    /**
     * Helper to retrieve the touch coordinates from a TouchEvent.
     * @param {!Event} event
     * @return {?{x: number, y: number}}
     * @private
     */ }, { key: "getClientTouchCoordinates_", value:
    function getClientTouchCoordinates_(event) {
      var touches = event.touches;
      if (!touches || touches.length < 1) {
        return null;
      }

      var _touches$ = touches[0],x = _touches$.clientX,y = _touches$.clientY;
      return { x: x, y: y };
    }

    /**
     * Handles touchstart events to detect swipeY interactions.
     * @param {!Event} event
     * @private
     */ }, { key: "onTouchStart_", value:
    function onTouchStart_(event) {
      var coordinates = this.getClientTouchCoordinates_(event);
      if (!coordinates) {
        return;
      }

      this.touchEventState_.startX = coordinates.x;
      this.touchEventState_.startY = coordinates.y;
    }

    /**
     * Handles touchmove events to detect swipeY interactions.
     * @param {!Event} event
     * @private
     */ }, { key: "onTouchMove_", value:
    function onTouchMove_(event) {
      if (this.touchEventState_.isSwipeY === false) {
        return;
      }

      var coordinates = this.getClientTouchCoordinates_(event);
      if (!coordinates) {
        return;
      }

      var x = coordinates.x,y = coordinates.y;

      this.touchEventState_.swipingUp = y < this.touchEventState_.lastY;
      this.touchEventState_.lastY = y;

      if (this.state === DrawerState.CLOSED && !this.touchEventState_.swipingUp) {
        return;
      }

      if (this.shouldStopPropagation_()) {
        event.stopPropagation();
      }

      if (this.touchEventState_.isSwipeY === null) {
        this.touchEventState_.isSwipeY =
        Math.abs(this.touchEventState_.startY - y) >
        Math.abs(this.touchEventState_.startX - x);
        if (!this.touchEventState_.isSwipeY) {
          return;
        }
      }

      this.onSwipeY_({
        event: event,
        data: {
          swipingUp: this.touchEventState_.swipingUp,
          deltaY: y - this.touchEventState_.startY,
          last: false } });


    }

    /**
     * Checks for when scroll event should be stopped from propagating.
     * @return {boolean}
     * @private
     */ }, { key: "shouldStopPropagation_", value:
    function shouldStopPropagation_() {
      return (
      this.state !== DrawerState.CLOSED || (
      this.state === DrawerState.CLOSED && this.touchEventState_.swipingUp));

    }

    /**
     * Handles touchend events to detect swipeY interactions.
     * @param {!Event} event
     * @private
     */ }, { key: "onTouchEnd_", value:
    function onTouchEnd_(event) {
      if (this.touchEventState_.isSwipeY === true) {
        this.onSwipeY_({
          event: event,
          data: {
            swipingUp: this.touchEventState_.swipingUp,
            deltaY: this.touchEventState_.lastY - this.touchEventState_.startY,
            last: true } });


      }

      this.touchEventState_.startX = 0;
      this.touchEventState_.startY = 0;
      this.touchEventState_.lastY = 0;
      this.touchEventState_.swipingUp = null;
      this.touchEventState_.isSwipeY = null;
    }

    /**
     * Handles swipeY events, detected by the touch events listeners.
     * @param {{event: !Event, data: !Object}} gesture
     * @private
     */ }, { key: "onSwipeY_", value:
    function onSwipeY_(gesture) {
      var data = gesture.data;

      if (this.ignoreCurrentSwipeYGesture_) {
        this.ignoreCurrentSwipeYGesture_ = !data.last;
        return;
      }

      var deltaY = data.deltaY,swipingUp = data.swipingUp;

      // If the drawer is open, figure out if the user is trying to scroll the
      // content, or actually close the drawer.
      if (this.state === DrawerState.OPEN) {
        var isContentSwipe = this.isDrawerContentDescendant_( /** @type {!Element} */(
        gesture.event.target));


        // If user is swiping up, exit so the event bubbles up and maybe scrolls
        // the drawer content.
        // If user is swiping down and scrollTop is above zero, exit and let the
        // user scroll the content.
        // If user is swiping down and scrollTop is zero, don't exit and start
        // dragging/closing the drawer.
        if (
        (isContentSwipe && deltaY < 0) || (
        isContentSwipe && deltaY > 0 && this.containerEl. /*OK*/scrollTop > 0))
        {
          this.ignoreCurrentSwipeYGesture_ = true;
          return;
        }
      }

      gesture.event.preventDefault();

      if (data.last === true) {
        if (this.state === DrawerState.DRAGGING_TO_CLOSE) {
          !swipingUp && deltaY > TOGGLE_THRESHOLD_PX ?
          this.close_() :
          this.open();
        }

        if (this.state === DrawerState.DRAGGING_TO_OPEN) {
          swipingUp && -deltaY > TOGGLE_THRESHOLD_PX ?
          this.open() :
          this.close_();
        }

        return;
      }

      if (
      this.state === DrawerState.DRAGGING_TO_OPEN &&
      swipingUp &&
      -deltaY > this.openThreshold_)
      {
        this.open();
        return;
      }

      this.drag_(deltaY);
    }

    /**
     * Whether the element is a descendant of drawer-content.
     * @param {!Element} element
     * @return {boolean}
     * @private
     */ }, { key: "isDrawerContentDescendant_", value:
    function isDrawerContentDescendant_(element) {
      return !!closest(
      element,
      function (el) {
        return el.classList.contains(
        'i-amphtml-story-draggable-drawer-content');

      },
      /* opt_stopAt */this.element);

    }

    /**
     * Sets a swipe threshold in pixels above which the drawer opens itself.
     * @param {number} openThreshold
     * @protected
     */ }, { key: "setOpenThreshold_", value:
    function setOpenThreshold_(openThreshold) {
      this.openThreshold_ = openThreshold;
    }

    /**
     * Sets the max value in pixels that can be dragged when opening the drawer.
     * @param {number} dragCap
     * @protected
     */ }, { key: "setDragCap_", value:
    function setDragCap_(dragCap) {
      this.dragCap_ = dragCap;
    }

    /**
     * Drags the drawer on the screen upon user interaction.
     * @param {number} deltaY
     * @private
     */ }, { key: "drag_", value:
    function drag_(deltaY) {var _this3 = this;
      var translate;

      switch (this.state) {
        case DrawerState.CLOSED:
        case DrawerState.DRAGGING_TO_OPEN:
          if (deltaY > 0) {
            return;
          }
          this.state = DrawerState.DRAGGING_TO_OPEN;
          var drag = Math.max(deltaY, -this.dragCap_);
          if (isPageAttachmentUiV2ExperimentOn(this.win)) {
            drag -= this.spacerElHeight_;
          }
          translate = "translate3d(0, calc(100% + ".concat(drag, "px), 0)");
          break;
        case DrawerState.OPEN:
        case DrawerState.DRAGGING_TO_CLOSE:
          if (deltaY < 0) {
            return;
          }
          this.state = DrawerState.DRAGGING_TO_CLOSE;
          translate = "translate3d(0, ".concat(deltaY, "px, 0)");
          break;}


      this.mutateElement(function () {
        setImportantStyles(_this3.element, {
          transform: translate,
          transition: 'none',
          visibility: 'visible' });

      });
    }

    /**
     * Fully opens the drawer from its current position.
     * @param {boolean=} shouldAnimate
     */ }, { key: "open", value:
    function open() {var _this4 = this;var shouldAnimate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      if (this.state === DrawerState.OPEN) {
        return;
      }

      this.state = DrawerState.OPEN;

      this.storeService.dispatch(Action.TOGGLE_PAUSED, true);

      this.mutateElement(function () {
        _this4.element.setAttribute('aria-hidden', false);
        resetStyles(_this4.element, ['transform', 'transition', 'visibility']);

        if (!shouldAnimate) {
          // Resets the 'transition' property, and removes this override in the
          // next frame, after the element is positioned.
          setImportantStyles(_this4.element, { transition: 'initial' });
          _this4.mutateElement(function () {return resetStyles(_this4.element, ['transition']);});
        }

        _this4.element.classList.add('i-amphtml-story-draggable-drawer-open');
        toggle( /** @type {!Element} */(_this4.containerEl), true);
      }).then(function () {
        var owners = Services.ownersForDoc(_this4.element);
        owners.scheduleLayout(_this4.element, _this4.ampComponents_);
        owners.scheduleResume(_this4.element, _this4.ampComponents_);
      });
    }

    /**
     * Can be overriden for implementations using the browser history to close the
     * drawer.
     * @protected
     */ }, { key: "close_", value:
    function close_() {
      this.closeInternal_();
    }

    /**
     * Fully closes the drawer from its current position.
     * @param {boolean=} shouldAnimate
     * @protected
     */ }, { key: "closeInternal_", value:
    function closeInternal_() {var _this5 = this;var shouldAnimate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      if (this.state === DrawerState.CLOSED) {
        return;
      }

      this.state = DrawerState.CLOSED;

      this.storeService.dispatch(Action.TOGGLE_PAUSED, false);

      this.mutateElement(function () {
        _this5.element.setAttribute('aria-hidden', true);
        resetStyles(_this5.element, ['transform', 'transition']);

        if (!shouldAnimate) {
          // Resets the 'transition' property, and removes this override in the
          // next frame, after the element is positioned.
          setImportantStyles(_this5.element, { transition: 'initial' });
          _this5.mutateElement(function () {return resetStyles(_this5.element, ['transition']);});
        }

        _this5.element.classList.remove('i-amphtml-story-draggable-drawer-open');
      }).then(function () {
        var owners = Services.ownersForDoc(_this5.element);
        owners.schedulePause(_this5.element, _this5.ampComponents_);
      });
    } }], [{ key: "prerenderAllowed", value: /** @override @nocollapse */function prerenderAllowed() {return false;} }]);return DraggableDrawer;}(AMP.BaseElement);
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-draggable-drawer.js