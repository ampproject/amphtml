import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

var _templateObject, _templateObject2;

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

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

/**
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
import { Action, StateProperty, UIType, getStoreService } from "./amp-story-store-service";
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
  OPEN: 3
};

/**
 * Drawer's template.
 * @param {!Element} element
 * @return {!Element}
 */
var getTemplateEl = function getTemplateEl(element) {
  return htmlFor(element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-story-draggable-drawer\">\n      <div class=\"i-amphtml-story-draggable-drawer-container\">\n        <div class=\"i-amphtml-story-draggable-drawer-content\"></div>\n      </div>\n    </div>"])));
};

/**
 * Drawer's header template.
 * @param {!Element} element
 * @return {!Element}
 */
var getHeaderEl = function getHeaderEl(element) {
  return htmlFor(element)(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-story-draggable-drawer-header\"></div>"])));
};

/**
 * Abstract draggable drawer.
 * @abstract
 */
export var DraggableDrawer = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(DraggableDrawer, _AMP$BaseElement);

  var _super = _createSuper(DraggableDrawer);

  /** @param {!AmpElement} element */
  function DraggableDrawer(element) {
    var _this;

    _classCallCheck(this, DraggableDrawer);

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
      isSwipeY: null
    };

    /** @private {!Array<function()>} */
    _this.touchEventUnlisteners_ = [];

    /** @private {number} Threshold in pixels above which the drawer opens itself. */
    _this.openThreshold_ = Infinity;

    /**
     * For amp-story-page-attachment-ui-v2 experiment
     * Used for offsetting drag.
     * @private {?number}
     */
    _this.spacerElHeight_ = null;
    return _this;
  }

  /** @override */
  _createClass(DraggableDrawer, [{
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return layout === Layout.NODISPLAY;
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      this.element.classList.add('amp-story-draggable-drawer-root');
      var templateEl = getTemplateEl(this.element);
      var headerShadowRootEl = this.win.document.createElement('div');
      this.headerEl = getHeaderEl(this.element);
      createShadowRootWithStyle(headerShadowRootEl, this.headerEl, CSS);
      this.containerEl = dev().assertElement(templateEl.querySelector('.i-amphtml-story-draggable-drawer-container'));
      this.contentEl = dev().assertElement(this.containerEl.querySelector('.i-amphtml-story-draggable-drawer-content'));

      if (isPageAttachmentUiV2ExperimentOn(this.win)) {
        var spacerEl = this.win.document.createElement('button');
        spacerEl.classList.add('i-amphtml-story-draggable-drawer-spacer');
        spacerEl.classList.add('i-amphtml-story-system-reset');
        spacerEl.setAttribute('role', 'button');
        var localizationService = getLocalizationService(devAssert(this.element));

        if (localizationService) {
          var localizedCloseString = localizationService.getLocalizedString(LocalizedStringId.AMP_STORY_CLOSE_BUTTON_LABEL);
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
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      this.initializeListeners_();
      var walker = this.win.document.createTreeWalker(this.element, NodeFilter.SHOW_ELEMENT, null
      /** filter */
      , false
      /** entityReferenceExpansion */
      );

      while (walker.nextNode()) {
        var el = dev().assertElement(walker.currentNode);

        if (isAmpElement(el)) {
          this.ampComponents_.push(el);
          Services.ownersForDoc(this.element).setOwner(el, this.element);
        }
      }

      return _resolvedPromise();
    }
    /**
     * @protected
     */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this2 = this;

      this.storeService.subscribe(StateProperty.UI_STATE, function (uiState) {
        _this2.onUIStateUpdate_(uiState);
      }, true
      /** callToInitialize */
      );

      if (isPageAttachmentUiV2ExperimentOn(this.win)) {
        var spacerEl = dev().assertElement(this.element.querySelector('.i-amphtml-story-draggable-drawer-spacer'));
        // Handle click on spacer element to close.
        spacerEl.addEventListener('click', function () {
          _this2.close_();
        });
        // For displaying sticky header on mobile.
        new this.win.IntersectionObserver(function (e) {
          _this2.headerEl.classList.toggle('i-amphtml-story-draggable-drawer-header-stuck', !e[0].isIntersecting);
        }).observe(spacerEl);
        // Update spacerElHeight_ on resize for drag offset.
        new this.win.ResizeObserver(function (e) {
          _this2.spacerElHeight_ = e[0].contentRect.height;
        }).observe(spacerEl);
        // Reset scroll position on end of close transiton.
        this.element.addEventListener('transitionend', function (e) {
          if (e.propertyName === 'transform' && _this2.state === DrawerState.CLOSED) {
            _this2.containerEl.
            /*OK*/
            scrollTop = 0;
          }
        });
      }
    }
    /**
     * Reacts to UI state updates.
     * @param {!UIType} uiState
     * @protected
     */

  }, {
    key: "onUIStateUpdate_",
    value: function onUIStateUpdate_(uiState) {
      var isMobile = uiState === UIType.MOBILE;
      isMobile ? this.startListeningForTouchEvents_() : this.stopListeningForTouchEvents_();
      this.headerEl.toggleAttribute('desktop', !isMobile);
    }
    /**
     * @private
     */

  }, {
    key: "startListeningForTouchEvents_",
    value: function startListeningForTouchEvents_() {
      // If the element is a direct descendant of amp-story-page, authorize
      // swiping up by listening to events at the page level. Otherwise, only
      // authorize swiping down to close by listening to events at the current
      // element level.
      var parentEl = this.element.parentElement;
      var el = dev().assertElement(parentEl.tagName === 'AMP-STORY-PAGE' ? parentEl : this.element);
      this.touchEventUnlisteners_.push(listen(el, 'touchstart', this.onTouchStart_.bind(this), {
        capture: true
      }));
      this.touchEventUnlisteners_.push(listen(el, 'touchmove', this.onTouchMove_.bind(this), {
        capture: true
      }));
      this.touchEventUnlisteners_.push(listen(el, 'touchend', this.onTouchEnd_.bind(this), {
        capture: true
      }));
    }
    /**
     * @private
     */

  }, {
    key: "stopListeningForTouchEvents_",
    value: function stopListeningForTouchEvents_() {
      this.touchEventUnlisteners_.forEach(function (fn) {
        return fn();
      });
      this.touchEventUnlisteners_ = [];
    }
    /**
     * Helper to retrieve the touch coordinates from a TouchEvent.
     * @param {!Event} event
     * @return {?{x: number, y: number}}
     * @private
     */

  }, {
    key: "getClientTouchCoordinates_",
    value: function getClientTouchCoordinates_(event) {
      var touches = event.touches;

      if (!touches || touches.length < 1) {
        return null;
      }

      var _touches$ = touches[0],
          x = _touches$.clientX,
          y = _touches$.clientY;
      return {
        x: x,
        y: y
      };
    }
    /**
     * Handles touchstart events to detect swipeY interactions.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchStart_",
    value: function onTouchStart_(event) {
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
     */

  }, {
    key: "onTouchMove_",
    value: function onTouchMove_(event) {
      if (this.touchEventState_.isSwipeY === false) {
        return;
      }

      var coordinates = this.getClientTouchCoordinates_(event);

      if (!coordinates) {
        return;
      }

      var x = coordinates.x,
          y = coordinates.y;
      this.touchEventState_.swipingUp = y < this.touchEventState_.lastY;
      this.touchEventState_.lastY = y;

      if (this.state === DrawerState.CLOSED && !this.touchEventState_.swipingUp) {
        return;
      }

      if (this.shouldStopPropagation_()) {
        event.stopPropagation();
      }

      if (this.touchEventState_.isSwipeY === null) {
        this.touchEventState_.isSwipeY = Math.abs(this.touchEventState_.startY - y) > Math.abs(this.touchEventState_.startX - x);

        if (!this.touchEventState_.isSwipeY) {
          return;
        }
      }

      this.onSwipeY_({
        event: event,
        data: {
          swipingUp: this.touchEventState_.swipingUp,
          deltaY: y - this.touchEventState_.startY,
          last: false
        }
      });
    }
    /**
     * Checks for when scroll event should be stopped from propagating.
     * @return {boolean}
     * @private
     */

  }, {
    key: "shouldStopPropagation_",
    value: function shouldStopPropagation_() {
      return this.state !== DrawerState.CLOSED || this.state === DrawerState.CLOSED && this.touchEventState_.swipingUp;
    }
    /**
     * Handles touchend events to detect swipeY interactions.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchEnd_",
    value: function onTouchEnd_(event) {
      if (this.touchEventState_.isSwipeY === true) {
        this.onSwipeY_({
          event: event,
          data: {
            swipingUp: this.touchEventState_.swipingUp,
            deltaY: this.touchEventState_.lastY - this.touchEventState_.startY,
            last: true
          }
        });
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
     */

  }, {
    key: "onSwipeY_",
    value: function onSwipeY_(gesture) {
      var data = gesture.data;

      if (this.ignoreCurrentSwipeYGesture_) {
        this.ignoreCurrentSwipeYGesture_ = !data.last;
        return;
      }

      var deltaY = data.deltaY,
          swipingUp = data.swipingUp;

      // If the drawer is open, figure out if the user is trying to scroll the
      // content, or actually close the drawer.
      if (this.state === DrawerState.OPEN) {
        var isContentSwipe = this.isDrawerContentDescendant_(dev().assertElement(gesture.event.target));

        // If user is swiping up, exit so the event bubbles up and maybe scrolls
        // the drawer content.
        // If user is swiping down and scrollTop is above zero, exit and let the
        // user scroll the content.
        // If user is swiping down and scrollTop is zero, don't exit and start
        // dragging/closing the drawer.
        if (isContentSwipe && deltaY < 0 || isContentSwipe && deltaY > 0 && this.containerEl.
        /*OK*/
        scrollTop > 0) {
          this.ignoreCurrentSwipeYGesture_ = true;
          return;
        }
      }

      gesture.event.preventDefault();

      if (data.last === true) {
        if (this.state === DrawerState.DRAGGING_TO_CLOSE) {
          !swipingUp && deltaY > TOGGLE_THRESHOLD_PX ? this.close_() : this.open();
        }

        if (this.state === DrawerState.DRAGGING_TO_OPEN) {
          swipingUp && -deltaY > TOGGLE_THRESHOLD_PX ? this.open() : this.close_();
        }

        return;
      }

      if (this.state === DrawerState.DRAGGING_TO_OPEN && swipingUp && -deltaY > this.openThreshold_) {
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
     */

  }, {
    key: "isDrawerContentDescendant_",
    value: function isDrawerContentDescendant_(element) {
      return !!closest(element, function (el) {
        return el.classList.contains('i-amphtml-story-draggable-drawer-content');
      },
      /* opt_stopAt */
      this.element);
    }
    /**
     * Sets a swipe threshold in pixels above which the drawer opens itself.
     * @param {number} openThreshold
     * @protected
     */

  }, {
    key: "setOpenThreshold_",
    value: function setOpenThreshold_(openThreshold) {
      this.openThreshold_ = openThreshold;
    }
    /**
     * Sets the max value in pixels that can be dragged when opening the drawer.
     * @param {number} dragCap
     * @protected
     */

  }, {
    key: "setDragCap_",
    value: function setDragCap_(dragCap) {
      this.dragCap_ = dragCap;
    }
    /**
     * Drags the drawer on the screen upon user interaction.
     * @param {number} deltaY
     * @private
     */

  }, {
    key: "drag_",
    value: function drag_(deltaY) {
      var _this3 = this;

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

          translate = "translate3d(0, calc(100% + " + drag + "px), 0)";
          break;

        case DrawerState.OPEN:
        case DrawerState.DRAGGING_TO_CLOSE:
          if (deltaY < 0) {
            return;
          }

          this.state = DrawerState.DRAGGING_TO_CLOSE;
          translate = "translate3d(0, " + deltaY + "px, 0)";
          break;
      }

      this.mutateElement(function () {
        setImportantStyles(_this3.element, {
          transform: translate,
          transition: 'none',
          visibility: 'visible'
        });
      });
    }
    /**
     * Fully opens the drawer from its current position.
     * @param {boolean=} shouldAnimate
     */

  }, {
    key: "open",
    value: function open(shouldAnimate) {
      var _this4 = this;

      if (shouldAnimate === void 0) {
        shouldAnimate = true;
      }

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
          setImportantStyles(_this4.element, {
            transition: 'initial'
          });

          _this4.mutateElement(function () {
            return resetStyles(_this4.element, ['transition']);
          });
        }

        _this4.element.classList.add('i-amphtml-story-draggable-drawer-open');

        toggle(dev().assertElement(_this4.containerEl), true);
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
     */

  }, {
    key: "close_",
    value: function close_() {
      this.closeInternal_();
    }
    /**
     * Fully closes the drawer from its current position.
     * @param {boolean=} shouldAnimate
     * @protected
     */

  }, {
    key: "closeInternal_",
    value: function closeInternal_(shouldAnimate) {
      var _this5 = this;

      if (shouldAnimate === void 0) {
        shouldAnimate = true;
      }

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
          setImportantStyles(_this5.element, {
            transition: 'initial'
          });

          _this5.mutateElement(function () {
            return resetStyles(_this5.element, ['transition']);
          });
        }

        _this5.element.classList.remove('i-amphtml-story-draggable-drawer-open');
      }).then(function () {
        var owners = Services.ownersForDoc(_this5.element);
        owners.schedulePause(_this5.element, _this5.ampComponents_);
      });
    }
  }], [{
    key: "prerenderAllowed",
    value:
    /** @override @nocollapse */
    function prerenderAllowed() {
      return false;
    }
  }]);

  return DraggableDrawer;
}(AMP.BaseElement);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1kcmFnZ2FibGUtZHJhd2VyLmpzIl0sIm5hbWVzIjpbIkFjdGlvbiIsIlN0YXRlUHJvcGVydHkiLCJVSVR5cGUiLCJnZXRTdG9yZVNlcnZpY2UiLCJDU1MiLCJMYXlvdXQiLCJMb2NhbGl6ZWRTdHJpbmdJZCIsIlNlcnZpY2VzIiwiY2xvc2VzdCIsImNyZWF0ZVNoYWRvd1Jvb3RXaXRoU3R5bGUiLCJkZXYiLCJkZXZBc3NlcnQiLCJnZXRMb2NhbGl6YXRpb25TZXJ2aWNlIiwiaHRtbEZvciIsImlzQW1wRWxlbWVudCIsImlzUGFnZUF0dGFjaG1lbnRVaVYyRXhwZXJpbWVudE9uIiwibGlzdGVuIiwicmVzZXRTdHlsZXMiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJ0b2dnbGUiLCJUT0dHTEVfVEhSRVNIT0xEX1BYIiwiRHJhd2VyU3RhdGUiLCJDTE9TRUQiLCJEUkFHR0lOR19UT19DTE9TRSIsIkRSQUdHSU5HX1RPX09QRU4iLCJPUEVOIiwiZ2V0VGVtcGxhdGVFbCIsImVsZW1lbnQiLCJnZXRIZWFkZXJFbCIsIkRyYWdnYWJsZURyYXdlciIsImFtcENvbXBvbmVudHNfIiwiY29udGFpbmVyRWwiLCJjb250ZW50RWwiLCJkcmFnQ2FwXyIsIkluZmluaXR5IiwiaGVhZGVyRWwiLCJpZ25vcmVDdXJyZW50U3dpcGVZR2VzdHVyZV8iLCJzdGF0ZSIsInN0b3JlU2VydmljZSIsIndpbiIsInRvdWNoRXZlbnRTdGF0ZV8iLCJzdGFydFgiLCJzdGFydFkiLCJsYXN0WSIsInN3aXBpbmdVcCIsImlzU3dpcGVZIiwidG91Y2hFdmVudFVubGlzdGVuZXJzXyIsIm9wZW5UaHJlc2hvbGRfIiwic3BhY2VyRWxIZWlnaHRfIiwibGF5b3V0IiwiTk9ESVNQTEFZIiwiY2xhc3NMaXN0IiwiYWRkIiwidGVtcGxhdGVFbCIsImhlYWRlclNoYWRvd1Jvb3RFbCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImFzc2VydEVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwic3BhY2VyRWwiLCJzZXRBdHRyaWJ1dGUiLCJsb2NhbGl6YXRpb25TZXJ2aWNlIiwibG9jYWxpemVkQ2xvc2VTdHJpbmciLCJnZXRMb2NhbGl6ZWRTdHJpbmciLCJBTVBfU1RPUllfQ0xPU0VfQlVUVE9OX0xBQkVMIiwiaW5zZXJ0QmVmb3JlIiwiYXBwZW5kQ2hpbGQiLCJmaXJzdENoaWxkIiwiaW5pdGlhbGl6ZUxpc3RlbmVyc18iLCJ3YWxrZXIiLCJjcmVhdGVUcmVlV2Fsa2VyIiwiTm9kZUZpbHRlciIsIlNIT1dfRUxFTUVOVCIsIm5leHROb2RlIiwiZWwiLCJjdXJyZW50Tm9kZSIsInB1c2giLCJvd25lcnNGb3JEb2MiLCJzZXRPd25lciIsInN1YnNjcmliZSIsIlVJX1NUQVRFIiwidWlTdGF0ZSIsIm9uVUlTdGF0ZVVwZGF0ZV8iLCJhZGRFdmVudExpc3RlbmVyIiwiY2xvc2VfIiwiSW50ZXJzZWN0aW9uT2JzZXJ2ZXIiLCJlIiwiaXNJbnRlcnNlY3RpbmciLCJvYnNlcnZlIiwiUmVzaXplT2JzZXJ2ZXIiLCJjb250ZW50UmVjdCIsImhlaWdodCIsInByb3BlcnR5TmFtZSIsInNjcm9sbFRvcCIsImlzTW9iaWxlIiwiTU9CSUxFIiwic3RhcnRMaXN0ZW5pbmdGb3JUb3VjaEV2ZW50c18iLCJzdG9wTGlzdGVuaW5nRm9yVG91Y2hFdmVudHNfIiwidG9nZ2xlQXR0cmlidXRlIiwicGFyZW50RWwiLCJwYXJlbnRFbGVtZW50IiwidGFnTmFtZSIsIm9uVG91Y2hTdGFydF8iLCJiaW5kIiwiY2FwdHVyZSIsIm9uVG91Y2hNb3ZlXyIsIm9uVG91Y2hFbmRfIiwiZm9yRWFjaCIsImZuIiwiZXZlbnQiLCJ0b3VjaGVzIiwibGVuZ3RoIiwieCIsImNsaWVudFgiLCJ5IiwiY2xpZW50WSIsImNvb3JkaW5hdGVzIiwiZ2V0Q2xpZW50VG91Y2hDb29yZGluYXRlc18iLCJzaG91bGRTdG9wUHJvcGFnYXRpb25fIiwic3RvcFByb3BhZ2F0aW9uIiwiTWF0aCIsImFicyIsIm9uU3dpcGVZXyIsImRhdGEiLCJkZWx0YVkiLCJsYXN0IiwiZ2VzdHVyZSIsImlzQ29udGVudFN3aXBlIiwiaXNEcmF3ZXJDb250ZW50RGVzY2VuZGFudF8iLCJ0YXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsIm9wZW4iLCJkcmFnXyIsImNvbnRhaW5zIiwib3BlblRocmVzaG9sZCIsImRyYWdDYXAiLCJ0cmFuc2xhdGUiLCJkcmFnIiwibWF4IiwibXV0YXRlRWxlbWVudCIsInRyYW5zZm9ybSIsInRyYW5zaXRpb24iLCJ2aXNpYmlsaXR5Iiwic2hvdWxkQW5pbWF0ZSIsImRpc3BhdGNoIiwiVE9HR0xFX1BBVVNFRCIsInRoZW4iLCJvd25lcnMiLCJzY2hlZHVsZUxheW91dCIsInNjaGVkdWxlUmVzdW1lIiwiY2xvc2VJbnRlcm5hbF8iLCJyZW1vdmUiLCJzY2hlZHVsZVBhdXNlIiwiQU1QIiwiQmFzZUVsZW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsTUFERixFQUVFQyxhQUZGLEVBR0VDLE1BSEYsRUFJRUMsZUFKRjtBQU1BLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxNQUFSO0FBQ0EsU0FBUUMsaUJBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLHlCQUFSO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxTQUFiO0FBQ0EsU0FBUUMsc0JBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsWUFBUjtBQUNBLFNBQVFDLGdDQUFSO0FBQ0EsU0FBUUMsTUFBUjtBQUNBLFNBQVFDLFdBQVIsRUFBcUJDLGtCQUFyQixFQUF5Q0MsTUFBekM7O0FBRUE7QUFDQSxJQUFNQyxtQkFBbUIsR0FBRyxFQUE1Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQU1DLFdBQVcsR0FBRztBQUN6QkMsRUFBQUEsTUFBTSxFQUFFLENBRGlC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Y2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtcbiAgQWN0aW9uLFxuICBTdGF0ZVByb3BlcnR5LFxuICBVSVR5cGUsXG4gIGdldFN0b3JlU2VydmljZSxcbn0gZnJvbSAnLi9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5pbXBvcnQge0NTU30gZnJvbSAnLi4vLi4vLi4vYnVpbGQvYW1wLXN0b3J5LWRyYWdnYWJsZS1kcmF3ZXItaGVhZGVyLTEuMC5jc3MnO1xuaW1wb3J0IHtMYXlvdXR9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQnO1xuaW1wb3J0IHtMb2NhbGl6ZWRTdHJpbmdJZH0gZnJvbSAnI3NlcnZpY2UvbG9jYWxpemF0aW9uL3N0cmluZ3MnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtjbG9zZXN0fSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHtjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtnZXRMb2NhbGl6YXRpb25TZXJ2aWNlfSBmcm9tICcuL2FtcC1zdG9yeS1sb2NhbGl6YXRpb24tc2VydmljZSc7XG5pbXBvcnQge2h0bWxGb3J9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuaW1wb3J0IHtpc0FtcEVsZW1lbnR9IGZyb20gJy4uLy4uLy4uL3NyYy9hbXAtZWxlbWVudC1oZWxwZXJzJztcbmltcG9ydCB7aXNQYWdlQXR0YWNobWVudFVpVjJFeHBlcmltZW50T259IGZyb20gJy4vYW1wLXN0b3J5LXBhZ2UtYXR0YWNobWVudC11aS12Mic7XG5pbXBvcnQge2xpc3Rlbn0gZnJvbSAnLi4vLi4vLi4vc3JjL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge3Jlc2V0U3R5bGVzLCBzZXRJbXBvcnRhbnRTdHlsZXMsIHRvZ2dsZX0gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgVE9HR0xFX1RIUkVTSE9MRF9QWCA9IDUwO1xuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBEcmF3ZXJTdGF0ZSA9IHtcbiAgQ0xPU0VEOiAwLFxuICBEUkFHR0lOR19UT19DTE9TRTogMSxcbiAgRFJBR0dJTkdfVE9fT1BFTjogMixcbiAgT1BFTjogMyxcbn07XG5cbi8qKlxuICogRHJhd2VyJ3MgdGVtcGxhdGUuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuY29uc3QgZ2V0VGVtcGxhdGVFbCA9IChlbGVtZW50KSA9PiB7XG4gIHJldHVybiBodG1sRm9yKGVsZW1lbnQpYFxuICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktZHJhZ2dhYmxlLWRyYXdlclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1kcmFnZ2FibGUtZHJhd2VyLWNvbnRhaW5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWRyYWdnYWJsZS1kcmF3ZXItY29udGVudFwiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+YDtcbn07XG5cbi8qKlxuICogRHJhd2VyJ3MgaGVhZGVyIHRlbXBsYXRlLlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmNvbnN0IGdldEhlYWRlckVsID0gKGVsZW1lbnQpID0+IHtcbiAgcmV0dXJuIGh0bWxGb3IoZWxlbWVudClgXG4gICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1kcmFnZ2FibGUtZHJhd2VyLWhlYWRlclwiPjwvZGl2PmA7XG59O1xuXG4vKipcbiAqIEFic3RyYWN0IGRyYWdnYWJsZSBkcmF3ZXIuXG4gKiBAYWJzdHJhY3RcbiAqL1xuZXhwb3J0IGNsYXNzIERyYWdnYWJsZURyYXdlciBleHRlbmRzIEFNUC5CYXNlRWxlbWVudCB7XG4gIC8qKiBAb3ZlcnJpZGUgQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIHByZXJlbmRlckFsbG93ZWQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnQgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8IUVsZW1lbnQ+fSBBTVAgY29tcG9uZW50cyB3aXRoaW4gdGhlIGRyYXdlci4gKi9cbiAgICB0aGlzLmFtcENvbXBvbmVudHNfID0gW107XG5cbiAgICAvKiogQHByb3RlY3RlZCB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5jb250YWluZXJFbCA9IG51bGw7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5jb250ZW50RWwgPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9IE1heCB2YWx1ZSBpbiBwaXhlbHMgdGhhdCBjYW4gYmUgZHJhZ2dlZCB3aGVuIG9wZW5pbmcgdGhlIGRyYXdlci4gKi9cbiAgICB0aGlzLmRyYWdDYXBfID0gSW5maW5pdHk7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5oZWFkZXJFbCA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pZ25vcmVDdXJyZW50U3dpcGVZR2VzdHVyZV8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHshRHJhd2VyU3RhdGV9ICovXG4gICAgdGhpcy5zdGF0ZSA9IERyYXdlclN0YXRlLkNMT1NFRDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIEBjb25zdCB7IS4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2V9ICovXG4gICAgdGhpcy5zdG9yZVNlcnZpY2UgPSBnZXRTdG9yZVNlcnZpY2UodGhpcy53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIHshT2JqZWN0fSAqL1xuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXyA9IHtcbiAgICAgIHN0YXJ0WDogMCxcbiAgICAgIHN0YXJ0WTogMCxcbiAgICAgIGxhc3RZOiAwLFxuICAgICAgc3dpcGluZ1VwOiBudWxsLFxuICAgICAgaXNTd2lwZVk6IG51bGwsXG4gICAgfTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUFycmF5PGZ1bmN0aW9uKCk+fSAqL1xuICAgIHRoaXMudG91Y2hFdmVudFVubGlzdGVuZXJzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9IFRocmVzaG9sZCBpbiBwaXhlbHMgYWJvdmUgd2hpY2ggdGhlIGRyYXdlciBvcGVucyBpdHNlbGYuICovXG4gICAgdGhpcy5vcGVuVGhyZXNob2xkXyA9IEluZmluaXR5O1xuXG4gICAgLyoqXG4gICAgICogRm9yIGFtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtdWktdjIgZXhwZXJpbWVudFxuICAgICAqIFVzZWQgZm9yIG9mZnNldHRpbmcgZHJhZy5cbiAgICAgKiBAcHJpdmF0ZSB7P251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnNwYWNlckVsSGVpZ2h0XyA9IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzTGF5b3V0U3VwcG9ydGVkKGxheW91dCkge1xuICAgIHJldHVybiBsYXlvdXQgPT09IExheW91dC5OT0RJU1BMQVk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGJ1aWxkQ2FsbGJhY2soKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FtcC1zdG9yeS1kcmFnZ2FibGUtZHJhd2VyLXJvb3QnKTtcblxuICAgIGNvbnN0IHRlbXBsYXRlRWwgPSBnZXRUZW1wbGF0ZUVsKHRoaXMuZWxlbWVudCk7XG4gICAgY29uc3QgaGVhZGVyU2hhZG93Um9vdEVsID0gdGhpcy53aW4uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5oZWFkZXJFbCA9IGdldEhlYWRlckVsKHRoaXMuZWxlbWVudCk7XG5cbiAgICBjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlKGhlYWRlclNoYWRvd1Jvb3RFbCwgdGhpcy5oZWFkZXJFbCwgQ1NTKTtcblxuICAgIHRoaXMuY29udGFpbmVyRWwgPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgdGVtcGxhdGVFbC5xdWVyeVNlbGVjdG9yKCcuaS1hbXBodG1sLXN0b3J5LWRyYWdnYWJsZS1kcmF3ZXItY29udGFpbmVyJylcbiAgICApO1xuICAgIHRoaXMuY29udGVudEVsID0gZGV2KCkuYXNzZXJ0RWxlbWVudChcbiAgICAgIHRoaXMuY29udGFpbmVyRWwucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJy5pLWFtcGh0bWwtc3RvcnktZHJhZ2dhYmxlLWRyYXdlci1jb250ZW50J1xuICAgICAgKVxuICAgICk7XG5cbiAgICBpZiAoaXNQYWdlQXR0YWNobWVudFVpVjJFeHBlcmltZW50T24odGhpcy53aW4pKSB7XG4gICAgICBjb25zdCBzcGFjZXJFbCA9IHRoaXMud2luLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgc3BhY2VyRWwuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LWRyYWdnYWJsZS1kcmF3ZXItc3BhY2VyJyk7XG4gICAgICBzcGFjZXJFbC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3Rvcnktc3lzdGVtLXJlc2V0Jyk7XG4gICAgICBzcGFjZXJFbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnYnV0dG9uJyk7XG4gICAgICBjb25zdCBsb2NhbGl6YXRpb25TZXJ2aWNlID0gZ2V0TG9jYWxpemF0aW9uU2VydmljZShcbiAgICAgICAgZGV2QXNzZXJ0KHRoaXMuZWxlbWVudClcbiAgICAgICk7XG4gICAgICBpZiAobG9jYWxpemF0aW9uU2VydmljZSkge1xuICAgICAgICBjb25zdCBsb2NhbGl6ZWRDbG9zZVN0cmluZyA9IGxvY2FsaXphdGlvblNlcnZpY2UuZ2V0TG9jYWxpemVkU3RyaW5nKFxuICAgICAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9DTE9TRV9CVVRUT05fTEFCRUxcbiAgICAgICAgKTtcbiAgICAgICAgc3BhY2VyRWwuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgbG9jYWxpemVkQ2xvc2VTdHJpbmcpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb250YWluZXJFbC5pbnNlcnRCZWZvcmUoc3BhY2VyRWwsIHRoaXMuY29udGVudEVsKTtcbiAgICAgIHRoaXMuY29udGVudEVsLmFwcGVuZENoaWxkKGhlYWRlclNoYWRvd1Jvb3RFbCk7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWFtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtdWktdjInKTtcbiAgICAgIHRoaXMuaGVhZGVyRWwuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWFtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtdWktdjInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGVtcGxhdGVFbC5pbnNlcnRCZWZvcmUoaGVhZGVyU2hhZG93Um9vdEVsLCB0ZW1wbGF0ZUVsLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0ZW1wbGF0ZUVsKTtcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsYXlvdXRDYWxsYmFjaygpIHtcbiAgICB0aGlzLmluaXRpYWxpemVMaXN0ZW5lcnNfKCk7XG5cbiAgICBjb25zdCB3YWxrZXIgPSB0aGlzLndpbi5kb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKFxuICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgTm9kZUZpbHRlci5TSE9XX0VMRU1FTlQsXG4gICAgICBudWxsIC8qKiBmaWx0ZXIgKi8sXG4gICAgICBmYWxzZSAvKiogZW50aXR5UmVmZXJlbmNlRXhwYW5zaW9uICovXG4gICAgKTtcbiAgICB3aGlsZSAod2Fsa2VyLm5leHROb2RlKCkpIHtcbiAgICAgIGNvbnN0IGVsID0gZGV2KCkuYXNzZXJ0RWxlbWVudCh3YWxrZXIuY3VycmVudE5vZGUpO1xuICAgICAgaWYgKGlzQW1wRWxlbWVudChlbCkpIHtcbiAgICAgICAgdGhpcy5hbXBDb21wb25lbnRzXy5wdXNoKGVsKTtcbiAgICAgICAgU2VydmljZXMub3duZXJzRm9yRG9jKHRoaXMuZWxlbWVudCkuc2V0T3duZXIoZWwsIHRoaXMuZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBpbml0aWFsaXplTGlzdGVuZXJzXygpIHtcbiAgICB0aGlzLnN0b3JlU2VydmljZS5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlVJX1NUQVRFLFxuICAgICAgKHVpU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5vblVJU3RhdGVVcGRhdGVfKHVpU3RhdGUpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgaWYgKGlzUGFnZUF0dGFjaG1lbnRVaVYyRXhwZXJpbWVudE9uKHRoaXMud2luKSkge1xuICAgICAgY29uc3Qgc3BhY2VyRWwgPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLmktYW1waHRtbC1zdG9yeS1kcmFnZ2FibGUtZHJhd2VyLXNwYWNlcicpXG4gICAgICApO1xuXG4gICAgICAvLyBIYW5kbGUgY2xpY2sgb24gc3BhY2VyIGVsZW1lbnQgdG8gY2xvc2UuXG4gICAgICBzcGFjZXJFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdGhpcy5jbG9zZV8oKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBGb3IgZGlzcGxheWluZyBzdGlja3kgaGVhZGVyIG9uIG1vYmlsZS5cbiAgICAgIG5ldyB0aGlzLndpbi5JbnRlcnNlY3Rpb25PYnNlcnZlcigoZSkgPT4ge1xuICAgICAgICB0aGlzLmhlYWRlckVsLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAgICAgJ2ktYW1waHRtbC1zdG9yeS1kcmFnZ2FibGUtZHJhd2VyLWhlYWRlci1zdHVjaycsXG4gICAgICAgICAgIWVbMF0uaXNJbnRlcnNlY3RpbmdcbiAgICAgICAgKTtcbiAgICAgIH0pLm9ic2VydmUoc3BhY2VyRWwpO1xuXG4gICAgICAvLyBVcGRhdGUgc3BhY2VyRWxIZWlnaHRfIG9uIHJlc2l6ZSBmb3IgZHJhZyBvZmZzZXQuXG4gICAgICBuZXcgdGhpcy53aW4uUmVzaXplT2JzZXJ2ZXIoKGUpID0+IHtcbiAgICAgICAgdGhpcy5zcGFjZXJFbEhlaWdodF8gPSBlWzBdLmNvbnRlbnRSZWN0LmhlaWdodDtcbiAgICAgIH0pLm9ic2VydmUoc3BhY2VyRWwpO1xuXG4gICAgICAvLyBSZXNldCBzY3JvbGwgcG9zaXRpb24gb24gZW5kIG9mIGNsb3NlIHRyYW5zaXRvbi5cbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgKGUpID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGUucHJvcGVydHlOYW1lID09PSAndHJhbnNmb3JtJyAmJlxuICAgICAgICAgIHRoaXMuc3RhdGUgPT09IERyYXdlclN0YXRlLkNMT1NFRFxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLmNvbnRhaW5lckVsLi8qT0sqLyBzY3JvbGxUb3AgPSAwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIFVJIHN0YXRlIHVwZGF0ZXMuXG4gICAqIEBwYXJhbSB7IVVJVHlwZX0gdWlTdGF0ZVxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBvblVJU3RhdGVVcGRhdGVfKHVpU3RhdGUpIHtcbiAgICBjb25zdCBpc01vYmlsZSA9IHVpU3RhdGUgPT09IFVJVHlwZS5NT0JJTEU7XG5cbiAgICBpc01vYmlsZVxuICAgICAgPyB0aGlzLnN0YXJ0TGlzdGVuaW5nRm9yVG91Y2hFdmVudHNfKClcbiAgICAgIDogdGhpcy5zdG9wTGlzdGVuaW5nRm9yVG91Y2hFdmVudHNfKCk7XG5cbiAgICB0aGlzLmhlYWRlckVsLnRvZ2dsZUF0dHJpYnV0ZSgnZGVza3RvcCcsICFpc01vYmlsZSk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0YXJ0TGlzdGVuaW5nRm9yVG91Y2hFdmVudHNfKCkge1xuICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIGEgZGlyZWN0IGRlc2NlbmRhbnQgb2YgYW1wLXN0b3J5LXBhZ2UsIGF1dGhvcml6ZVxuICAgIC8vIHN3aXBpbmcgdXAgYnkgbGlzdGVuaW5nIHRvIGV2ZW50cyBhdCB0aGUgcGFnZSBsZXZlbC4gT3RoZXJ3aXNlLCBvbmx5XG4gICAgLy8gYXV0aG9yaXplIHN3aXBpbmcgZG93biB0byBjbG9zZSBieSBsaXN0ZW5pbmcgdG8gZXZlbnRzIGF0IHRoZSBjdXJyZW50XG4gICAgLy8gZWxlbWVudCBsZXZlbC5cbiAgICBjb25zdCBwYXJlbnRFbCA9IHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgIGNvbnN0IGVsID0gZGV2KCkuYXNzZXJ0RWxlbWVudChcbiAgICAgIHBhcmVudEVsLnRhZ05hbWUgPT09ICdBTVAtU1RPUlktUEFHRScgPyBwYXJlbnRFbCA6IHRoaXMuZWxlbWVudFxuICAgICk7XG5cbiAgICB0aGlzLnRvdWNoRXZlbnRVbmxpc3RlbmVyc18ucHVzaChcbiAgICAgIGxpc3RlbihlbCwgJ3RvdWNoc3RhcnQnLCB0aGlzLm9uVG91Y2hTdGFydF8uYmluZCh0aGlzKSwge1xuICAgICAgICBjYXB0dXJlOiB0cnVlLFxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMudG91Y2hFdmVudFVubGlzdGVuZXJzXy5wdXNoKFxuICAgICAgbGlzdGVuKGVsLCAndG91Y2htb3ZlJywgdGhpcy5vblRvdWNoTW92ZV8uYmluZCh0aGlzKSwge1xuICAgICAgICBjYXB0dXJlOiB0cnVlLFxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMudG91Y2hFdmVudFVubGlzdGVuZXJzXy5wdXNoKFxuICAgICAgbGlzdGVuKGVsLCAndG91Y2hlbmQnLCB0aGlzLm9uVG91Y2hFbmRfLmJpbmQodGhpcyksIHtcbiAgICAgICAgY2FwdHVyZTogdHJ1ZSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RvcExpc3RlbmluZ0ZvclRvdWNoRXZlbnRzXygpIHtcbiAgICB0aGlzLnRvdWNoRXZlbnRVbmxpc3RlbmVyc18uZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xuICAgIHRoaXMudG91Y2hFdmVudFVubGlzdGVuZXJzXyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciB0byByZXRyaWV2ZSB0aGUgdG91Y2ggY29vcmRpbmF0ZXMgZnJvbSBhIFRvdWNoRXZlbnQuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcmV0dXJuIHs/e3g6IG51bWJlciwgeTogbnVtYmVyfX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldENsaWVudFRvdWNoQ29vcmRpbmF0ZXNfKGV2ZW50KSB7XG4gICAgY29uc3Qge3RvdWNoZXN9ID0gZXZlbnQ7XG4gICAgaWYgKCF0b3VjaGVzIHx8IHRvdWNoZXMubGVuZ3RoIDwgMSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qge2NsaWVudFg6IHgsIGNsaWVudFk6IHl9ID0gdG91Y2hlc1swXTtcbiAgICByZXR1cm4ge3gsIHl9O1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdG91Y2hzdGFydCBldmVudHMgdG8gZGV0ZWN0IHN3aXBlWSBpbnRlcmFjdGlvbnMuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Ub3VjaFN0YXJ0XyhldmVudCkge1xuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gdGhpcy5nZXRDbGllbnRUb3VjaENvb3JkaW5hdGVzXyhldmVudCk7XG4gICAgaWYgKCFjb29yZGluYXRlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5zdGFydFggPSBjb29yZGluYXRlcy54O1xuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5zdGFydFkgPSBjb29yZGluYXRlcy55O1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdG91Y2htb3ZlIGV2ZW50cyB0byBkZXRlY3Qgc3dpcGVZIGludGVyYWN0aW9ucy5cbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblRvdWNoTW92ZV8oZXZlbnQpIHtcbiAgICBpZiAodGhpcy50b3VjaEV2ZW50U3RhdGVfLmlzU3dpcGVZID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gdGhpcy5nZXRDbGllbnRUb3VjaENvb3JkaW5hdGVzXyhldmVudCk7XG4gICAgaWYgKCFjb29yZGluYXRlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHt4LCB5fSA9IGNvb3JkaW5hdGVzO1xuXG4gICAgdGhpcy50b3VjaEV2ZW50U3RhdGVfLnN3aXBpbmdVcCA9IHkgPCB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8ubGFzdFk7XG4gICAgdGhpcy50b3VjaEV2ZW50U3RhdGVfLmxhc3RZID0geTtcblxuICAgIGlmICh0aGlzLnN0YXRlID09PSBEcmF3ZXJTdGF0ZS5DTE9TRUQgJiYgIXRoaXMudG91Y2hFdmVudFN0YXRlXy5zd2lwaW5nVXApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zaG91bGRTdG9wUHJvcGFnYXRpb25fKCkpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uaXNTd2lwZVkgPT09IG51bGwpIHtcbiAgICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5pc1N3aXBlWSA9XG4gICAgICAgIE1hdGguYWJzKHRoaXMudG91Y2hFdmVudFN0YXRlXy5zdGFydFkgLSB5KSA+XG4gICAgICAgIE1hdGguYWJzKHRoaXMudG91Y2hFdmVudFN0YXRlXy5zdGFydFggLSB4KTtcbiAgICAgIGlmICghdGhpcy50b3VjaEV2ZW50U3RhdGVfLmlzU3dpcGVZKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9uU3dpcGVZXyh7XG4gICAgICBldmVudCxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgc3dpcGluZ1VwOiB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uc3dpcGluZ1VwLFxuICAgICAgICBkZWx0YVk6IHkgLSB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uc3RhcnRZLFxuICAgICAgICBsYXN0OiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGZvciB3aGVuIHNjcm9sbCBldmVudCBzaG91bGQgYmUgc3RvcHBlZCBmcm9tIHByb3BhZ2F0aW5nLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2hvdWxkU3RvcFByb3BhZ2F0aW9uXygpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5zdGF0ZSAhPT0gRHJhd2VyU3RhdGUuQ0xPU0VEIHx8XG4gICAgICAodGhpcy5zdGF0ZSA9PT0gRHJhd2VyU3RhdGUuQ0xPU0VEICYmIHRoaXMudG91Y2hFdmVudFN0YXRlXy5zd2lwaW5nVXApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRvdWNoZW5kIGV2ZW50cyB0byBkZXRlY3Qgc3dpcGVZIGludGVyYWN0aW9ucy5cbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblRvdWNoRW5kXyhldmVudCkge1xuICAgIGlmICh0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uaXNTd2lwZVkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMub25Td2lwZVlfKHtcbiAgICAgICAgZXZlbnQsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzd2lwaW5nVXA6IHRoaXMudG91Y2hFdmVudFN0YXRlXy5zd2lwaW5nVXAsXG4gICAgICAgICAgZGVsdGFZOiB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8ubGFzdFkgLSB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uc3RhcnRZLFxuICAgICAgICAgIGxhc3Q6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uc3RhcnRYID0gMDtcbiAgICB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uc3RhcnRZID0gMDtcbiAgICB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8ubGFzdFkgPSAwO1xuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5zd2lwaW5nVXAgPSBudWxsO1xuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5pc1N3aXBlWSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBzd2lwZVkgZXZlbnRzLCBkZXRlY3RlZCBieSB0aGUgdG91Y2ggZXZlbnRzIGxpc3RlbmVycy5cbiAgICogQHBhcmFtIHt7ZXZlbnQ6ICFFdmVudCwgZGF0YTogIU9iamVjdH19IGdlc3R1cmVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uU3dpcGVZXyhnZXN0dXJlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gZ2VzdHVyZTtcblxuICAgIGlmICh0aGlzLmlnbm9yZUN1cnJlbnRTd2lwZVlHZXN0dXJlXykge1xuICAgICAgdGhpcy5pZ25vcmVDdXJyZW50U3dpcGVZR2VzdHVyZV8gPSAhZGF0YS5sYXN0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtkZWx0YVksIHN3aXBpbmdVcH0gPSBkYXRhO1xuXG4gICAgLy8gSWYgdGhlIGRyYXdlciBpcyBvcGVuLCBmaWd1cmUgb3V0IGlmIHRoZSB1c2VyIGlzIHRyeWluZyB0byBzY3JvbGwgdGhlXG4gICAgLy8gY29udGVudCwgb3IgYWN0dWFsbHkgY2xvc2UgdGhlIGRyYXdlci5cbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gRHJhd2VyU3RhdGUuT1BFTikge1xuICAgICAgY29uc3QgaXNDb250ZW50U3dpcGUgPSB0aGlzLmlzRHJhd2VyQ29udGVudERlc2NlbmRhbnRfKFxuICAgICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KGdlc3R1cmUuZXZlbnQudGFyZ2V0KVxuICAgICAgKTtcblxuICAgICAgLy8gSWYgdXNlciBpcyBzd2lwaW5nIHVwLCBleGl0IHNvIHRoZSBldmVudCBidWJibGVzIHVwIGFuZCBtYXliZSBzY3JvbGxzXG4gICAgICAvLyB0aGUgZHJhd2VyIGNvbnRlbnQuXG4gICAgICAvLyBJZiB1c2VyIGlzIHN3aXBpbmcgZG93biBhbmQgc2Nyb2xsVG9wIGlzIGFib3ZlIHplcm8sIGV4aXQgYW5kIGxldCB0aGVcbiAgICAgIC8vIHVzZXIgc2Nyb2xsIHRoZSBjb250ZW50LlxuICAgICAgLy8gSWYgdXNlciBpcyBzd2lwaW5nIGRvd24gYW5kIHNjcm9sbFRvcCBpcyB6ZXJvLCBkb24ndCBleGl0IGFuZCBzdGFydFxuICAgICAgLy8gZHJhZ2dpbmcvY2xvc2luZyB0aGUgZHJhd2VyLlxuICAgICAgaWYgKFxuICAgICAgICAoaXNDb250ZW50U3dpcGUgJiYgZGVsdGFZIDwgMCkgfHxcbiAgICAgICAgKGlzQ29udGVudFN3aXBlICYmIGRlbHRhWSA+IDAgJiYgdGhpcy5jb250YWluZXJFbC4vKk9LKi8gc2Nyb2xsVG9wID4gMClcbiAgICAgICkge1xuICAgICAgICB0aGlzLmlnbm9yZUN1cnJlbnRTd2lwZVlHZXN0dXJlXyA9IHRydWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXN0dXJlLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBpZiAoZGF0YS5sYXN0ID09PSB0cnVlKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gRHJhd2VyU3RhdGUuRFJBR0dJTkdfVE9fQ0xPU0UpIHtcbiAgICAgICAgIXN3aXBpbmdVcCAmJiBkZWx0YVkgPiBUT0dHTEVfVEhSRVNIT0xEX1BYXG4gICAgICAgICAgPyB0aGlzLmNsb3NlXygpXG4gICAgICAgICAgOiB0aGlzLm9wZW4oKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc3RhdGUgPT09IERyYXdlclN0YXRlLkRSQUdHSU5HX1RPX09QRU4pIHtcbiAgICAgICAgc3dpcGluZ1VwICYmIC1kZWx0YVkgPiBUT0dHTEVfVEhSRVNIT0xEX1BYXG4gICAgICAgICAgPyB0aGlzLm9wZW4oKVxuICAgICAgICAgIDogdGhpcy5jbG9zZV8oKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMuc3RhdGUgPT09IERyYXdlclN0YXRlLkRSQUdHSU5HX1RPX09QRU4gJiZcbiAgICAgIHN3aXBpbmdVcCAmJlxuICAgICAgLWRlbHRhWSA+IHRoaXMub3BlblRocmVzaG9sZF9cbiAgICApIHtcbiAgICAgIHRoaXMub3BlbigpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZHJhZ18oZGVsdGFZKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGEgZGVzY2VuZGFudCBvZiBkcmF3ZXItY29udGVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaXNEcmF3ZXJDb250ZW50RGVzY2VuZGFudF8oZWxlbWVudCkge1xuICAgIHJldHVybiAhIWNsb3Nlc3QoXG4gICAgICBlbGVtZW50LFxuICAgICAgKGVsKSA9PiB7XG4gICAgICAgIHJldHVybiBlbC5jbGFzc0xpc3QuY29udGFpbnMoXG4gICAgICAgICAgJ2ktYW1waHRtbC1zdG9yeS1kcmFnZ2FibGUtZHJhd2VyLWNvbnRlbnQnXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgLyogb3B0X3N0b3BBdCAqLyB0aGlzLmVsZW1lbnRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBzd2lwZSB0aHJlc2hvbGQgaW4gcGl4ZWxzIGFib3ZlIHdoaWNoIHRoZSBkcmF3ZXIgb3BlbnMgaXRzZWxmLlxuICAgKiBAcGFyYW0ge251bWJlcn0gb3BlblRocmVzaG9sZFxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBzZXRPcGVuVGhyZXNob2xkXyhvcGVuVGhyZXNob2xkKSB7XG4gICAgdGhpcy5vcGVuVGhyZXNob2xkXyA9IG9wZW5UaHJlc2hvbGQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbWF4IHZhbHVlIGluIHBpeGVscyB0aGF0IGNhbiBiZSBkcmFnZ2VkIHdoZW4gb3BlbmluZyB0aGUgZHJhd2VyLlxuICAgKiBAcGFyYW0ge251bWJlcn0gZHJhZ0NhcFxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBzZXREcmFnQ2FwXyhkcmFnQ2FwKSB7XG4gICAgdGhpcy5kcmFnQ2FwXyA9IGRyYWdDYXA7XG4gIH1cblxuICAvKipcbiAgICogRHJhZ3MgdGhlIGRyYXdlciBvbiB0aGUgc2NyZWVuIHVwb24gdXNlciBpbnRlcmFjdGlvbi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlbHRhWVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZHJhZ18oZGVsdGFZKSB7XG4gICAgbGV0IHRyYW5zbGF0ZTtcblxuICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xuICAgICAgY2FzZSBEcmF3ZXJTdGF0ZS5DTE9TRUQ6XG4gICAgICBjYXNlIERyYXdlclN0YXRlLkRSQUdHSU5HX1RPX09QRU46XG4gICAgICAgIGlmIChkZWx0YVkgPiAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhdGUgPSBEcmF3ZXJTdGF0ZS5EUkFHR0lOR19UT19PUEVOO1xuICAgICAgICBsZXQgZHJhZyA9IE1hdGgubWF4KGRlbHRhWSwgLXRoaXMuZHJhZ0NhcF8pO1xuICAgICAgICBpZiAoaXNQYWdlQXR0YWNobWVudFVpVjJFeHBlcmltZW50T24odGhpcy53aW4pKSB7XG4gICAgICAgICAgZHJhZyAtPSB0aGlzLnNwYWNlckVsSGVpZ2h0XztcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGUgPSBgdHJhbnNsYXRlM2QoMCwgY2FsYygxMDAlICsgJHtkcmFnfXB4KSwgMClgO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRHJhd2VyU3RhdGUuT1BFTjpcbiAgICAgIGNhc2UgRHJhd2VyU3RhdGUuRFJBR0dJTkdfVE9fQ0xPU0U6XG4gICAgICAgIGlmIChkZWx0YVkgPCAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhdGUgPSBEcmF3ZXJTdGF0ZS5EUkFHR0lOR19UT19DTE9TRTtcbiAgICAgICAgdHJhbnNsYXRlID0gYHRyYW5zbGF0ZTNkKDAsICR7ZGVsdGFZfXB4LCAwKWA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICBzZXRJbXBvcnRhbnRTdHlsZXModGhpcy5lbGVtZW50LCB7XG4gICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlLFxuICAgICAgICB0cmFuc2l0aW9uOiAnbm9uZScsXG4gICAgICAgIHZpc2liaWxpdHk6ICd2aXNpYmxlJyxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bGx5IG9wZW5zIHRoZSBkcmF3ZXIgZnJvbSBpdHMgY3VycmVudCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gc2hvdWxkQW5pbWF0ZVxuICAgKi9cbiAgb3BlbihzaG91bGRBbmltYXRlID0gdHJ1ZSkge1xuICAgIGlmICh0aGlzLnN0YXRlID09PSBEcmF3ZXJTdGF0ZS5PUEVOKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZSA9IERyYXdlclN0YXRlLk9QRU47XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZS5kaXNwYXRjaChBY3Rpb24uVE9HR0xFX1BBVVNFRCwgdHJ1ZSk7XG5cbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCBmYWxzZSk7XG4gICAgICByZXNldFN0eWxlcyh0aGlzLmVsZW1lbnQsIFsndHJhbnNmb3JtJywgJ3RyYW5zaXRpb24nLCAndmlzaWJpbGl0eSddKTtcblxuICAgICAgaWYgKCFzaG91bGRBbmltYXRlKSB7XG4gICAgICAgIC8vIFJlc2V0cyB0aGUgJ3RyYW5zaXRpb24nIHByb3BlcnR5LCBhbmQgcmVtb3ZlcyB0aGlzIG92ZXJyaWRlIGluIHRoZVxuICAgICAgICAvLyBuZXh0IGZyYW1lLCBhZnRlciB0aGUgZWxlbWVudCBpcyBwb3NpdGlvbmVkLlxuICAgICAgICBzZXRJbXBvcnRhbnRTdHlsZXModGhpcy5lbGVtZW50LCB7dHJhbnNpdGlvbjogJ2luaXRpYWwnfSk7XG4gICAgICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiByZXNldFN0eWxlcyh0aGlzLmVsZW1lbnQsIFsndHJhbnNpdGlvbiddKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktZHJhZ2dhYmxlLWRyYXdlci1vcGVuJyk7XG4gICAgICB0b2dnbGUoZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmNvbnRhaW5lckVsKSwgdHJ1ZSk7XG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICBjb25zdCBvd25lcnMgPSBTZXJ2aWNlcy5vd25lcnNGb3JEb2ModGhpcy5lbGVtZW50KTtcbiAgICAgIG93bmVycy5zY2hlZHVsZUxheW91dCh0aGlzLmVsZW1lbnQsIHRoaXMuYW1wQ29tcG9uZW50c18pO1xuICAgICAgb3duZXJzLnNjaGVkdWxlUmVzdW1lKHRoaXMuZWxlbWVudCwgdGhpcy5hbXBDb21wb25lbnRzXyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FuIGJlIG92ZXJyaWRlbiBmb3IgaW1wbGVtZW50YXRpb25zIHVzaW5nIHRoZSBicm93c2VyIGhpc3RvcnkgdG8gY2xvc2UgdGhlXG4gICAqIGRyYXdlci5cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgY2xvc2VfKCkge1xuICAgIHRoaXMuY2xvc2VJbnRlcm5hbF8oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdWxseSBjbG9zZXMgdGhlIGRyYXdlciBmcm9tIGl0cyBjdXJyZW50IHBvc2l0aW9uLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBzaG91bGRBbmltYXRlXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGNsb3NlSW50ZXJuYWxfKHNob3VsZEFuaW1hdGUgPSB0cnVlKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUgPT09IERyYXdlclN0YXRlLkNMT1NFRCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3RhdGUgPSBEcmF3ZXJTdGF0ZS5DTE9TRUQ7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZS5kaXNwYXRjaChBY3Rpb24uVE9HR0xFX1BBVVNFRCwgZmFsc2UpO1xuXG4gICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+IHtcbiAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICByZXNldFN0eWxlcyh0aGlzLmVsZW1lbnQsIFsndHJhbnNmb3JtJywgJ3RyYW5zaXRpb24nXSk7XG5cbiAgICAgIGlmICghc2hvdWxkQW5pbWF0ZSkge1xuICAgICAgICAvLyBSZXNldHMgdGhlICd0cmFuc2l0aW9uJyBwcm9wZXJ0eSwgYW5kIHJlbW92ZXMgdGhpcyBvdmVycmlkZSBpbiB0aGVcbiAgICAgICAgLy8gbmV4dCBmcmFtZSwgYWZ0ZXIgdGhlIGVsZW1lbnQgaXMgcG9zaXRpb25lZC5cbiAgICAgICAgc2V0SW1wb3J0YW50U3R5bGVzKHRoaXMuZWxlbWVudCwge3RyYW5zaXRpb246ICdpbml0aWFsJ30pO1xuICAgICAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4gcmVzZXRTdHlsZXModGhpcy5lbGVtZW50LCBbJ3RyYW5zaXRpb24nXSkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLXN0b3J5LWRyYWdnYWJsZS1kcmF3ZXItb3BlbicpO1xuICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc3Qgb3duZXJzID0gU2VydmljZXMub3duZXJzRm9yRG9jKHRoaXMuZWxlbWVudCk7XG4gICAgICBvd25lcnMuc2NoZWR1bGVQYXVzZSh0aGlzLmVsZW1lbnQsIHRoaXMuYW1wQ29tcG9uZW50c18pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-draggable-drawer.js