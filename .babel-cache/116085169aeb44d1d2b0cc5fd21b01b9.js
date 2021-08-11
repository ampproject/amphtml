function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import { Observable } from "../../../src/core/data-structures/observable";
import { Services } from "../../../src/service";
import { devAssert } from "../../../src/log";

/**
 * @typedef {{
 *   top: number,
 *   left: number,
 *   width: number,
 *   height: number,
 *   scrollHeight: number,
 *   scrollWidth: number,
 *   initialSize: {
 *      scrollHeight: number,
 *      scrollWidth: number
 *  }
 * }}
 */
export var ScrollEventDef;

/**
 * A manager for handling multiple Scroll Event Trackers.
 * The instance of this class corresponds 1:1 to `AnalyticsRoot`. It represents
 * a collection of all scroll triggers declared within the `AnalyticsRoot`.
 * @implements {../../../src/service.Disposable}
 */
export var ScrollManager = /*#__PURE__*/function () {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function ScrollManager(root) {_classCallCheck(this, ScrollManager);
    /** @const @private {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(root.ampdoc);

    /** @const @private {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(root.ampdoc);

    /** @private {?UnlistenDef} */
    this.viewportOnChangedUnlistener_ = null;

    /** @private {!Observable<!./scroll-manager.ScrollEventDef>} */
    this.scrollObservable_ = new Observable();

    /** @const @private {!Element} */
    this.root_ = root.getRootElement();

    /**  @private {?Promise} */
    this.initialRootRectPromise_ = null;
  }

  /**
   * Function to dispose of all handlers on the scroll observable
   */_createClass(ScrollManager, [{ key: "dispose", value:
    function dispose() {
      this.scrollObservable_.removeAll();
      this.removeViewportOnChangedListener_();
    }

    /**
     * @param {function(!Object)} handler
     */ }, { key: "removeScrollHandler", value:
    function removeScrollHandler(handler) {
      this.scrollObservable_.remove(handler);

      if (this.scrollObservable_.getHandlerCount() <= 0) {
        this.removeViewportOnChangedListener_();
      }
    }

    /**
     * @param {function(!Object)} handler
     * @return {!UnlistenDef}
     */ }, { key: "addScrollHandler", value:
    function addScrollHandler(handler) {var _this = this;
      // Trigger an event to fire events that might have already happened.
      var size = this.viewport_.getSize();

      this.getInitRootElementRect_().then(function (initRootElementRect) {
        // In the case of shadow/embedded documents, the root element's
        // layoutRect is relative to the parent doc's origin
        var
        scrollHeight =



        initRootElementRect.height,scrollLeft = initRootElementRect.left,scrollTop = initRootElementRect.top,scrollWidth = initRootElementRect.width;

        /** {./scroll-manager.ScrollEventDef} */
        var scrollEvent = {
          // In the case of shadow documents (e.g. amp-next-page), we offset
          // the event's top and left coordinates by the top/left position of
          // the document's container element (so that scroll triggers become relative to
          // container instead of the top-level host page). In the case of a top-level
          // page, the container/root is the document body so scrollTop and scrollLeft
          // are both 0 and the measurements are not affected
          top: _this.viewport_.getScrollTop() - scrollTop,
          left: _this.viewport_.getScrollLeft() - scrollLeft,
          width: size.width,
          height: size.height,
          scrollHeight: scrollHeight,
          scrollWidth: scrollWidth,
          initialSize: { scrollHeight: scrollHeight, scrollWidth: scrollWidth } };

        handler(scrollEvent);
      });

      if (this.scrollObservable_.getHandlerCount() === 0) {
        this.addViewportOnChangedListener_();
      }

      return this.scrollObservable_.add(handler);
    }

    /**
     * @param {!../../../src/service/viewport/viewport-interface.ViewportChangedEventDef} e
     * @return {!Promise}
     * @private
     */ }, { key: "onScroll_", value:
    function onScroll_(e) {var _this2 = this;
      return Promise.all([
      // Initial root layout rectangle
      this.getInitRootElementRect_(),
      // Current root layout rectangle
      this.measureRootElement_()]).
      then(function (rects) {
        // Initial root layout rectangle
        var _rects$ = rects[0],initialScrollHeight = _rects$.height,initialScrollWidth = _rects$.width;
        // Current root layout rectangle
        var _rects$2 =




        rects[1],scrollHeight = _rects$2.height,scrollLeft = _rects$2.left,scrollTop = _rects$2.top,scrollWidth = _rects$2.width;
        /** {./scroll-manager.ScrollEventDef} */
        var scrollEvent = {
          // In the case of shadow documents (e.g. amp-next-page), we offset
          // the event's top and left coordinates by the top/left position of
          // the document's container element (so that scroll triggers become relative to
          // container instead of the top-level host page). In the case of a top-level
          // page, the container/root is the document body so scrollTop and scrollLeft
          // are both 0 and the measurements are not affected
          top: e.top - scrollTop,
          left: e.left - scrollLeft,
          width: e.width,
          height: e.height,
          scrollWidth: scrollWidth,
          scrollHeight: scrollHeight,
          initialSize: {
            scrollHeight: initialScrollHeight,
            scrollWidth: initialScrollWidth } };


        // Fire all of our children scroll observables
        _this2.scrollObservable_.fire(scrollEvent);
      });
    }

    /**
     * Function to remove the viewport onChanged listener
     * @private
     */ }, { key: "removeViewportOnChangedListener_", value:
    function removeViewportOnChangedListener_() {
      if (this.viewportOnChangedUnlistener_) {
        this.viewportOnChangedUnlistener_();
        this.viewportOnChangedUnlistener_ = null;
      }
    }

    /**
     * Function to add the viewport onChanged listener
     * @private
     */ }, { key: "addViewportOnChangedListener_", value:
    function addViewportOnChangedListener_() {
      this.viewportOnChangedUnlistener_ = this.viewport_.onChanged(
      this.onScroll_.bind(this));

    }

    /**
     * Gets the cached layout rectangle of the root element
     * @return {!Promise<!../../../src/layout-rect.LayoutRectDef>}
     */ }, { key: "getInitRootElementRect_", value:
    function getInitRootElementRect_() {
      return devAssert(
      this.initialRootRectPromise_ || this.measureRootElement_());

    }

    /**
     * Gets the layout rectangle of the root element
     * @return {!Promise<!../../../src/layout-rect.LayoutRectDef>}
     */ }, { key: "measureRootElement_", value:
    function measureRootElement_() {var _this3 = this;
      var rectPromise = this.mutator_.measureElement(function () {return (
          _this3.viewport_.getLayoutRect(_this3.root_));});

      this.initialRootRectPromise_ = this.initialRootRectPromise_ || rectPromise;
      return rectPromise;
    } }]);return ScrollManager;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/scroll-manager.js