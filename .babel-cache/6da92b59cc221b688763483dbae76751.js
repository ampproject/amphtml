import { resolvedPromise as _resolvedPromise } from "./../../core/data-structures/promise";

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
import { Observable } from "../../core/data-structures/observable";
import { whenDocumentReady } from "../../core/document-ready";
import { waitForBodyOpen } from "../../core/dom";
import { layoutRectLtwh } from "../../core/dom/layout/rect";
import { computedStyle, px, setImportantStyles } from "../../core/dom/style";
import { isExperimentOn } from "../../experiments";
import { Services } from "./..";
import { ViewportBindingDef, marginBottomOfLastChild } from "./viewport-binding-def";
import { dev } from "../../log";
var TAG_ = 'Viewport';

/**
 * Implementation of ViewportBindingDef based for iframed iOS case where iframes
 * are not scrollable. Scrolling accomplished here by inserting a scrollable
 * wrapper `<html id="i-amphtml-wrapper">` inside the `<html>` element and
 * reparenting the original `<body>` inside.
 *
 * @implements {ViewportBindingDef}
 * @visibleForTesting
 */
export var ViewportBindingIosEmbedWrapper_ = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function ViewportBindingIosEmbedWrapper_(win) {
    var _this = this;

    _classCallCheck(this, ViewportBindingIosEmbedWrapper_);

    /** @const {!Window} */
    this.win = win;

    /** @protected {!../vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(win);
    var doc = this.win.document;
    var documentElement = doc.documentElement;
    var topClasses = documentElement.className;
    documentElement.classList.add('i-amphtml-ios-embed');
    var wrapper = doc.createElement('html');

    /** @private @const {!Element} */
    this.wrapper_ = wrapper;
    wrapper.id = 'i-amphtml-wrapper';
    wrapper.className = topClasses;

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @const {function()} */
    this.boundScrollEventListener_ = this.onScrolled_.bind(this);

    /** @const {function()} */
    this.boundResizeEventListener_ = function () {
      return _this.resizeObservable_.fire();
    };

    /** @private {number} */
    this.paddingTop_ = 0;
    // Setup UI.

    /** @private {boolean} */
    this.setupDone_ = false;
    waitForBodyOpen(doc, this.setup_.bind(this));
    // Set overscroll (`-webkit-overflow-scrolling: touch`) later to avoid
    // iOS rendering bugs. See #8798 for details.
    whenDocumentReady(doc).then(function () {
      documentElement.classList.add('i-amphtml-ios-overscroll');
    });
    dev().fine(TAG_, 'initialized ios-embed-wrapper viewport');
  }

  /** @override */
  _createClass(ViewportBindingIosEmbedWrapper_, [{
    key: "ensureReadyForElements",
    value: function ensureReadyForElements() {
      this.setup_();
    }
    /** @private */

  }, {
    key: "setup_",
    value: function setup_() {
      if (this.setupDone_) {
        return;
      }

      this.setupDone_ = true;
      // Embedded scrolling on iOS is rather complicated. IFrames cannot be sized
      // and be scrollable. Sizing iframe by scrolling height has a big negative
      // that "fixed" position is essentially impossible. The only option we
      // found is to reset scrolling on the AMP doc, which wraps the natural BODY
      // inside the `overflow:auto` element. For reference, here are related
      // iOS issues (Chrome issues are also listed for reference):
      // - https://code.google.com/p/chromium/issues/detail?id=2891
      // - https://code.google.com/p/chromium/issues/detail?id=157855
      // - https://bugs.webkit.org/show_bug.cgi?id=106133
      // - https://bugs.webkit.org/show_bug.cgi?id=149264
      var doc = this.win.document;
      var body = dev().assertElement(doc.body, 'body is not available');
      doc.documentElement.appendChild(this.wrapper_);
      this.wrapper_.appendChild(body);
      // Redefine `document.body`, otherwise it'd be `null`.
      Object.defineProperty(doc, 'body', {
        get: function get() {
          return body;
        }
      });
      // Make sure the scroll position is adjusted correctly.
      this.onScrolled_();
    }
    /** @override */

  }, {
    key: "connect",
    value: function connect() {
      this.win.addEventListener('resize', this.boundResizeEventListener_);
      this.wrapper_.addEventListener('scroll', this.boundScrollEventListener_);
    }
    /** @override */

  }, {
    key: "disconnect",
    value: function disconnect() {
      this.win.removeEventListener('resize', this.boundResizeEventListener_);
      this.wrapper_.removeEventListener('scroll', this.boundScrollEventListener_);
    }
    /** @override */

  }, {
    key: "getBorderTop",
    value: function getBorderTop() {
      // iOS needs an extra pixel to avoid scroll freezing.
      return 1;
    }
    /** @override */

  }, {
    key: "requiresFixedLayerTransfer",
    value: function requiresFixedLayerTransfer() {
      if (!isExperimentOn(this.win, 'ios-fixed-no-transfer')) {
        return true;
      }

      // The jumping fixed elements have been fixed in iOS 12.2.
      var iosVersion = parseFloat(Services.platformFor(this.win).getIosVersionString());
      return iosVersion < 12.2;
    }
    /** @override */

  }, {
    key: "overrideGlobalScrollTo",
    value: function overrideGlobalScrollTo() {
      return true;
    }
    /** @override */

  }, {
    key: "supportsPositionFixed",
    value: function supportsPositionFixed() {
      return true;
    }
    /** @override */

  }, {
    key: "onScroll",
    value: function onScroll(callback) {
      this.scrollObservable_.add(callback);
    }
    /** @override */

  }, {
    key: "onResize",
    value: function onResize(callback) {
      this.resizeObservable_.add(callback);
    }
    /** @override */

  }, {
    key: "updatePaddingTop",
    value: function updatePaddingTop(paddingTop) {
      this.paddingTop_ = paddingTop;
      setImportantStyles(this.wrapper_, {
        'padding-top': px(paddingTop)
      });
    }
    /** @override */

  }, {
    key: "hideViewerHeader",
    value: function hideViewerHeader(transient, unusedLastPaddingTop) {
      if (!transient) {
        this.updatePaddingTop(0);
      }
    }
    /** @override */

  }, {
    key: "showViewerHeader",
    value: function showViewerHeader(transient, paddingTop) {
      if (!transient) {
        this.updatePaddingTop(paddingTop);
      }
    }
    /** @override */

  }, {
    key: "disableScroll",
    value: function disableScroll() {
      // TODO(jridgewell): Recursively disable scroll
      this.wrapper_.classList.add('i-amphtml-scroll-disabled');
    }
    /** @override */

  }, {
    key: "resetScroll",
    value: function resetScroll() {
      // TODO(jridgewell): Recursively disable scroll
      this.wrapper_.classList.remove('i-amphtml-scroll-disabled');
    }
    /** @override */

  }, {
    key: "updateLightboxMode",
    value: function updateLightboxMode(unusedLightboxMode) {
      // The layout is always accurate.
      return _resolvedPromise();
    }
    /** @override */

  }, {
    key: "getSize",
    value: function getSize() {
      return {
        width: this.win.
        /*OK*/
        innerWidth,
        height: this.win.
        /*OK*/
        innerHeight
      };
    }
    /** @override */

  }, {
    key: "getScrollTop",
    value: function getScrollTop() {
      return this.wrapper_.
      /*OK*/
      scrollTop;
    }
    /** @override */

  }, {
    key: "getScrollLeft",
    value: function getScrollLeft() {
      // The wrapper is set to overflow-x: hidden so the document cannot be
      // scrolled horizontally. The scrollLeft will always be 0.
      return 0;
    }
    /** @override */

  }, {
    key: "getScrollWidth",
    value: function getScrollWidth() {
      return this.wrapper_.
      /*OK*/
      scrollWidth;
    }
    /** @override */

  }, {
    key: "getScrollHeight",
    value: function getScrollHeight() {
      return this.wrapper_.
      /*OK*/
      scrollHeight;
    }
    /** @override */

  }, {
    key: "getContentHeight",
    value: function getContentHeight() {
      // The wrapped body, not this.wrapper_ itself, will have the correct height.
      var content = this.win.document.body;

      var _content$getBoundingC = content.
      /*OK*/
      getBoundingClientRect(),
          height = _content$getBoundingC.height;

      // Unlike other viewport bindings, there's no need to include the
      // rect top since the wrapped body accounts for the top margin of children.
      // However, the parent's padding-top (this.paddingTop_) must be added.
      // As of Safari 12.1.1, the getBoundingClientRect().height does not include
      // the bottom margin of children and there's no other API that does.
      var childMarginBottom = marginBottomOfLastChild(this.win, content);
      var style = computedStyle(this.win, content);
      return parseInt(style.marginTop, 10) + this.paddingTop_ + height + childMarginBottom + parseInt(style.marginBottom, 10);
    }
    /** @override */

  }, {
    key: "contentHeightChanged",
    value: function contentHeightChanged() {}
    /** @override */

  }, {
    key: "getLayoutRect",
    value: function getLayoutRect(el, opt_scrollLeft, opt_scrollTop) {
      var b = el.
      /*OK*/
      getBoundingClientRect();
      var scrollTop = opt_scrollTop != undefined ? opt_scrollTop : this.getScrollTop();
      var scrollLeft = opt_scrollLeft != undefined ? opt_scrollLeft : this.getScrollLeft();
      return layoutRectLtwh(Math.round(b.left + scrollLeft), Math.round(b.top + scrollTop), Math.round(b.width), Math.round(b.height));
    }
    /** @override */

  }, {
    key: "getRootClientRectAsync",
    value: function getRootClientRectAsync() {
      return Promise.resolve(null);
    }
    /** @override */

  }, {
    key: "setScrollTop",
    value: function setScrollTop(scrollTop) {
      // If scroll top is 0, it's set to 1 to avoid scroll-freeze issue. See
      // `onScrolled_` for more details.
      this.wrapper_.
      /*OK*/
      scrollTop = scrollTop || 1;
    }
    /**
     * @param {!Event=} opt_event
     * @private
     */

  }, {
    key: "onScrolled_",
    value: function onScrolled_(opt_event) {
      // Scroll document into a safe position to avoid scroll freeze on iOS.
      // This means avoiding scrollTop to be minimum (0) or maximum value.
      // This is very sad but very necessary. See #330 for more details.
      // Unfortunately, the same is very expensive to do on the bottom, due to
      // costly scrollHeight.
      if (this.wrapper_.
      /*OK*/
      scrollTop == 0) {
        this.wrapper_.
        /*OK*/
        scrollTop = 1;

        if (opt_event) {
          opt_event.preventDefault();
        }
      }

      if (opt_event) {
        this.scrollObservable_.fire();
      }
    }
    /** @override */

  }, {
    key: "getScrollingElement",
    value: function getScrollingElement() {
      return this.wrapper_;
    }
    /** @override */

  }, {
    key: "getScrollingElementScrollsLikeViewport",
    value: function getScrollingElementScrollsLikeViewport() {
      return false;
    }
  }]);

  return ViewportBindingIosEmbedWrapper_;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZXdwb3J0LWJpbmRpbmctaW9zLWVtYmVkLXdyYXBwZXIuanMiXSwibmFtZXMiOlsiT2JzZXJ2YWJsZSIsIndoZW5Eb2N1bWVudFJlYWR5Iiwid2FpdEZvckJvZHlPcGVuIiwibGF5b3V0UmVjdEx0d2giLCJjb21wdXRlZFN0eWxlIiwicHgiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJpc0V4cGVyaW1lbnRPbiIsIlNlcnZpY2VzIiwiVmlld3BvcnRCaW5kaW5nRGVmIiwibWFyZ2luQm90dG9tT2ZMYXN0Q2hpbGQiLCJkZXYiLCJUQUdfIiwiVmlld3BvcnRCaW5kaW5nSW9zRW1iZWRXcmFwcGVyXyIsIndpbiIsInZzeW5jXyIsInZzeW5jRm9yIiwiZG9jIiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJ0b3BDbGFzc2VzIiwiY2xhc3NOYW1lIiwiY2xhc3NMaXN0IiwiYWRkIiwid3JhcHBlciIsImNyZWF0ZUVsZW1lbnQiLCJ3cmFwcGVyXyIsImlkIiwic2Nyb2xsT2JzZXJ2YWJsZV8iLCJyZXNpemVPYnNlcnZhYmxlXyIsImJvdW5kU2Nyb2xsRXZlbnRMaXN0ZW5lcl8iLCJvblNjcm9sbGVkXyIsImJpbmQiLCJib3VuZFJlc2l6ZUV2ZW50TGlzdGVuZXJfIiwiZmlyZSIsInBhZGRpbmdUb3BfIiwic2V0dXBEb25lXyIsInNldHVwXyIsInRoZW4iLCJmaW5lIiwiYm9keSIsImFzc2VydEVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZ2V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpb3NWZXJzaW9uIiwicGFyc2VGbG9hdCIsInBsYXRmb3JtRm9yIiwiZ2V0SW9zVmVyc2lvblN0cmluZyIsImNhbGxiYWNrIiwicGFkZGluZ1RvcCIsInRyYW5zaWVudCIsInVudXNlZExhc3RQYWRkaW5nVG9wIiwidXBkYXRlUGFkZGluZ1RvcCIsInJlbW92ZSIsInVudXNlZExpZ2h0Ym94TW9kZSIsIndpZHRoIiwiaW5uZXJXaWR0aCIsImhlaWdodCIsImlubmVySGVpZ2h0Iiwic2Nyb2xsVG9wIiwic2Nyb2xsV2lkdGgiLCJzY3JvbGxIZWlnaHQiLCJjb250ZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiY2hpbGRNYXJnaW5Cb3R0b20iLCJzdHlsZSIsInBhcnNlSW50IiwibWFyZ2luVG9wIiwibWFyZ2luQm90dG9tIiwiZWwiLCJvcHRfc2Nyb2xsTGVmdCIsIm9wdF9zY3JvbGxUb3AiLCJiIiwidW5kZWZpbmVkIiwiZ2V0U2Nyb2xsVG9wIiwic2Nyb2xsTGVmdCIsImdldFNjcm9sbExlZnQiLCJNYXRoIiwicm91bmQiLCJsZWZ0IiwidG9wIiwiUHJvbWlzZSIsInJlc29sdmUiLCJvcHRfZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxVQUFSO0FBQ0EsU0FBUUMsaUJBQVI7QUFDQSxTQUFRQyxlQUFSO0FBQ0EsU0FBUUMsY0FBUjtBQUNBLFNBQVFDLGFBQVIsRUFBdUJDLEVBQXZCLEVBQTJCQyxrQkFBM0I7QUFFQSxTQUFRQyxjQUFSO0FBRUEsU0FBUUMsUUFBUjtBQUVBLFNBQ0VDLGtCQURGLEVBRUVDLHVCQUZGO0FBS0EsU0FBUUMsR0FBUjtBQUVBLElBQU1DLElBQUksR0FBRyxVQUFiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLCtCQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0UsMkNBQVlDLEdBQVosRUFBaUI7QUFBQTs7QUFBQTs7QUFDZjtBQUNBLFNBQUtBLEdBQUwsR0FBV0EsR0FBWDs7QUFFQTtBQUNBLFNBQUtDLE1BQUwsR0FBY1AsUUFBUSxDQUFDUSxRQUFULENBQWtCRixHQUFsQixDQUFkO0FBRUEsUUFBTUcsR0FBRyxHQUFH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QUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL29ic2VydmFibGUnO1xuaW1wb3J0IHt3aGVuRG9jdW1lbnRSZWFkeX0gZnJvbSAnI2NvcmUvZG9jdW1lbnQtcmVhZHknO1xuaW1wb3J0IHt3YWl0Rm9yQm9keU9wZW59IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2xheW91dFJlY3RMdHdofSBmcm9tICcjY29yZS9kb20vbGF5b3V0L3JlY3QnO1xuaW1wb3J0IHtjb21wdXRlZFN0eWxlLCBweCwgc2V0SW1wb3J0YW50U3R5bGVzfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG5pbXBvcnQge2lzRXhwZXJpbWVudE9ufSBmcm9tICcjZXhwZXJpbWVudHMnO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7XG4gIFZpZXdwb3J0QmluZGluZ0RlZixcbiAgbWFyZ2luQm90dG9tT2ZMYXN0Q2hpbGQsXG59IGZyb20gJy4vdmlld3BvcnQtYmluZGluZy1kZWYnO1xuXG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vLi4vbG9nJztcblxuY29uc3QgVEFHXyA9ICdWaWV3cG9ydCc7XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgVmlld3BvcnRCaW5kaW5nRGVmIGJhc2VkIGZvciBpZnJhbWVkIGlPUyBjYXNlIHdoZXJlIGlmcmFtZXNcbiAqIGFyZSBub3Qgc2Nyb2xsYWJsZS4gU2Nyb2xsaW5nIGFjY29tcGxpc2hlZCBoZXJlIGJ5IGluc2VydGluZyBhIHNjcm9sbGFibGVcbiAqIHdyYXBwZXIgYDxodG1sIGlkPVwiaS1hbXBodG1sLXdyYXBwZXJcIj5gIGluc2lkZSB0aGUgYDxodG1sPmAgZWxlbWVudCBhbmRcbiAqIHJlcGFyZW50aW5nIHRoZSBvcmlnaW5hbCBgPGJvZHk+YCBpbnNpZGUuXG4gKlxuICogQGltcGxlbWVudHMge1ZpZXdwb3J0QmluZGluZ0RlZn1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgY2xhc3MgVmlld3BvcnRCaW5kaW5nSW9zRW1iZWRXcmFwcGVyXyB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbiA9IHdpbjtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHshLi4vdnN5bmMtaW1wbC5Wc3luY30gKi9cbiAgICB0aGlzLnZzeW5jXyA9IFNlcnZpY2VzLnZzeW5jRm9yKHdpbik7XG5cbiAgICBjb25zdCBkb2MgPSB0aGlzLndpbi5kb2N1bWVudDtcbiAgICBjb25zdCB7ZG9jdW1lbnRFbGVtZW50fSA9IGRvYztcbiAgICBjb25zdCB0b3BDbGFzc2VzID0gZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZTtcbiAgICBkb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWlvcy1lbWJlZCcpO1xuXG4gICAgY29uc3Qgd3JhcHBlciA9IGRvYy5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy53cmFwcGVyXyA9IHdyYXBwZXI7XG4gICAgd3JhcHBlci5pZCA9ICdpLWFtcGh0bWwtd3JhcHBlcic7XG4gICAgd3JhcHBlci5jbGFzc05hbWUgPSB0b3BDbGFzc2VzO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IU9ic2VydmFibGV9ICovXG4gICAgdGhpcy5zY3JvbGxPYnNlcnZhYmxlXyA9IG5ldyBPYnNlcnZhYmxlKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshT2JzZXJ2YWJsZX0gKi9cbiAgICB0aGlzLnJlc2l6ZU9ic2VydmFibGVfID0gbmV3IE9ic2VydmFibGUoKTtcblxuICAgIC8qKiBAY29uc3Qge2Z1bmN0aW9uKCl9ICovXG4gICAgdGhpcy5ib3VuZFNjcm9sbEV2ZW50TGlzdGVuZXJfID0gdGhpcy5vblNjcm9sbGVkXy5iaW5kKHRoaXMpO1xuXG4gICAgLyoqIEBjb25zdCB7ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLmJvdW5kUmVzaXplRXZlbnRMaXN0ZW5lcl8gPSAoKSA9PiB0aGlzLnJlc2l6ZU9ic2VydmFibGVfLmZpcmUoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMucGFkZGluZ1RvcF8gPSAwO1xuXG4gICAgLy8gU2V0dXAgVUkuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuc2V0dXBEb25lXyA9IGZhbHNlO1xuICAgIHdhaXRGb3JCb2R5T3Blbihkb2MsIHRoaXMuc2V0dXBfLmJpbmQodGhpcykpO1xuXG4gICAgLy8gU2V0IG92ZXJzY3JvbGwgKGAtd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzogdG91Y2hgKSBsYXRlciB0byBhdm9pZFxuICAgIC8vIGlPUyByZW5kZXJpbmcgYnVncy4gU2VlICM4Nzk4IGZvciBkZXRhaWxzLlxuICAgIHdoZW5Eb2N1bWVudFJlYWR5KGRvYykudGhlbigoKSA9PiB7XG4gICAgICBkb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWlvcy1vdmVyc2Nyb2xsJyk7XG4gICAgfSk7XG5cbiAgICBkZXYoKS5maW5lKFRBR18sICdpbml0aWFsaXplZCBpb3MtZW1iZWQtd3JhcHBlciB2aWV3cG9ydCcpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBlbnN1cmVSZWFkeUZvckVsZW1lbnRzKCkge1xuICAgIHRoaXMuc2V0dXBfKCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc2V0dXBfKCkge1xuICAgIGlmICh0aGlzLnNldHVwRG9uZV8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXR1cERvbmVfID0gdHJ1ZTtcblxuICAgIC8vIEVtYmVkZGVkIHNjcm9sbGluZyBvbiBpT1MgaXMgcmF0aGVyIGNvbXBsaWNhdGVkLiBJRnJhbWVzIGNhbm5vdCBiZSBzaXplZFxuICAgIC8vIGFuZCBiZSBzY3JvbGxhYmxlLiBTaXppbmcgaWZyYW1lIGJ5IHNjcm9sbGluZyBoZWlnaHQgaGFzIGEgYmlnIG5lZ2F0aXZlXG4gICAgLy8gdGhhdCBcImZpeGVkXCIgcG9zaXRpb24gaXMgZXNzZW50aWFsbHkgaW1wb3NzaWJsZS4gVGhlIG9ubHkgb3B0aW9uIHdlXG4gICAgLy8gZm91bmQgaXMgdG8gcmVzZXQgc2Nyb2xsaW5nIG9uIHRoZSBBTVAgZG9jLCB3aGljaCB3cmFwcyB0aGUgbmF0dXJhbCBCT0RZXG4gICAgLy8gaW5zaWRlIHRoZSBgb3ZlcmZsb3c6YXV0b2AgZWxlbWVudC4gRm9yIHJlZmVyZW5jZSwgaGVyZSBhcmUgcmVsYXRlZFxuICAgIC8vIGlPUyBpc3N1ZXMgKENocm9tZSBpc3N1ZXMgYXJlIGFsc28gbGlzdGVkIGZvciByZWZlcmVuY2UpOlxuICAgIC8vIC0gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTI4OTFcbiAgICAvLyAtIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0xNTc4NTVcbiAgICAvLyAtIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xMDYxMzNcbiAgICAvLyAtIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xNDkyNjRcbiAgICBjb25zdCBkb2MgPSB0aGlzLndpbi5kb2N1bWVudDtcbiAgICBjb25zdCBib2R5ID0gZGV2KCkuYXNzZXJ0RWxlbWVudChkb2MuYm9keSwgJ2JvZHkgaXMgbm90IGF2YWlsYWJsZScpO1xuICAgIGRvYy5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy53cmFwcGVyXyk7XG4gICAgdGhpcy53cmFwcGVyXy5hcHBlbmRDaGlsZChib2R5KTtcbiAgICAvLyBSZWRlZmluZSBgZG9jdW1lbnQuYm9keWAsIG90aGVyd2lzZSBpdCdkIGJlIGBudWxsYC5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZG9jLCAnYm9keScsIHtcbiAgICAgIGdldDogKCkgPT4gYm9keSxcbiAgICB9KTtcblxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgc2Nyb2xsIHBvc2l0aW9uIGlzIGFkanVzdGVkIGNvcnJlY3RseS5cbiAgICB0aGlzLm9uU2Nyb2xsZWRfKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNvbm5lY3QoKSB7XG4gICAgdGhpcy53aW4uYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5ib3VuZFJlc2l6ZUV2ZW50TGlzdGVuZXJfKTtcbiAgICB0aGlzLndyYXBwZXJfLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuYm91bmRTY3JvbGxFdmVudExpc3RlbmVyXyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgdGhpcy53aW4ucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5ib3VuZFJlc2l6ZUV2ZW50TGlzdGVuZXJfKTtcbiAgICB0aGlzLndyYXBwZXJfLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuYm91bmRTY3JvbGxFdmVudExpc3RlbmVyXyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldEJvcmRlclRvcCgpIHtcbiAgICAvLyBpT1MgbmVlZHMgYW4gZXh0cmEgcGl4ZWwgdG8gYXZvaWQgc2Nyb2xsIGZyZWV6aW5nLlxuICAgIHJldHVybiAxO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICByZXF1aXJlc0ZpeGVkTGF5ZXJUcmFuc2ZlcigpIHtcbiAgICBpZiAoIWlzRXhwZXJpbWVudE9uKHRoaXMud2luLCAnaW9zLWZpeGVkLW5vLXRyYW5zZmVyJykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBUaGUganVtcGluZyBmaXhlZCBlbGVtZW50cyBoYXZlIGJlZW4gZml4ZWQgaW4gaU9TIDEyLjIuXG4gICAgY29uc3QgaW9zVmVyc2lvbiA9IHBhcnNlRmxvYXQoXG4gICAgICBTZXJ2aWNlcy5wbGF0Zm9ybUZvcih0aGlzLndpbikuZ2V0SW9zVmVyc2lvblN0cmluZygpXG4gICAgKTtcbiAgICByZXR1cm4gaW9zVmVyc2lvbiA8IDEyLjI7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG92ZXJyaWRlR2xvYmFsU2Nyb2xsVG8oKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHN1cHBvcnRzUG9zaXRpb25GaXhlZCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25TY3JvbGwoY2FsbGJhY2spIHtcbiAgICB0aGlzLnNjcm9sbE9ic2VydmFibGVfLmFkZChjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uUmVzaXplKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZXNpemVPYnNlcnZhYmxlXy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB1cGRhdGVQYWRkaW5nVG9wKHBhZGRpbmdUb3ApIHtcbiAgICB0aGlzLnBhZGRpbmdUb3BfID0gcGFkZGluZ1RvcDtcbiAgICBzZXRJbXBvcnRhbnRTdHlsZXModGhpcy53cmFwcGVyXywge1xuICAgICAgJ3BhZGRpbmctdG9wJzogcHgocGFkZGluZ1RvcCksXG4gICAgfSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGhpZGVWaWV3ZXJIZWFkZXIodHJhbnNpZW50LCB1bnVzZWRMYXN0UGFkZGluZ1RvcCkge1xuICAgIGlmICghdHJhbnNpZW50KSB7XG4gICAgICB0aGlzLnVwZGF0ZVBhZGRpbmdUb3AoMCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzaG93Vmlld2VySGVhZGVyKHRyYW5zaWVudCwgcGFkZGluZ1RvcCkge1xuICAgIGlmICghdHJhbnNpZW50KSB7XG4gICAgICB0aGlzLnVwZGF0ZVBhZGRpbmdUb3AocGFkZGluZ1RvcCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNhYmxlU2Nyb2xsKCkge1xuICAgIC8vIFRPRE8oanJpZGdld2VsbCk6IFJlY3Vyc2l2ZWx5IGRpc2FibGUgc2Nyb2xsXG4gICAgdGhpcy53cmFwcGVyXy5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc2Nyb2xsLWRpc2FibGVkJyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlc2V0U2Nyb2xsKCkge1xuICAgIC8vIFRPRE8oanJpZGdld2VsbCk6IFJlY3Vyc2l2ZWx5IGRpc2FibGUgc2Nyb2xsXG4gICAgdGhpcy53cmFwcGVyXy5jbGFzc0xpc3QucmVtb3ZlKCdpLWFtcGh0bWwtc2Nyb2xsLWRpc2FibGVkJyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHVwZGF0ZUxpZ2h0Ym94TW9kZSh1bnVzZWRMaWdodGJveE1vZGUpIHtcbiAgICAvLyBUaGUgbGF5b3V0IGlzIGFsd2F5cyBhY2N1cmF0ZS5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFNpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiB0aGlzLndpbi4vKk9LKi8gaW5uZXJXaWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy53aW4uLypPSyovIGlubmVySGVpZ2h0LFxuICAgIH07XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFNjcm9sbFRvcCgpIHtcbiAgICByZXR1cm4gdGhpcy53cmFwcGVyXy4vKk9LKi8gc2Nyb2xsVG9wO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRTY3JvbGxMZWZ0KCkge1xuICAgIC8vIFRoZSB3cmFwcGVyIGlzIHNldCB0byBvdmVyZmxvdy14OiBoaWRkZW4gc28gdGhlIGRvY3VtZW50IGNhbm5vdCBiZVxuICAgIC8vIHNjcm9sbGVkIGhvcml6b250YWxseS4gVGhlIHNjcm9sbExlZnQgd2lsbCBhbHdheXMgYmUgMC5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0U2Nyb2xsV2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcl8uLypPSyovIHNjcm9sbFdpZHRoO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRTY3JvbGxIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcl8uLypPSyovIHNjcm9sbEhlaWdodDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0Q29udGVudEhlaWdodCgpIHtcbiAgICAvLyBUaGUgd3JhcHBlZCBib2R5LCBub3QgdGhpcy53cmFwcGVyXyBpdHNlbGYsIHdpbGwgaGF2ZSB0aGUgY29ycmVjdCBoZWlnaHQuXG4gICAgY29uc3QgY29udGVudCA9IHRoaXMud2luLmRvY3VtZW50LmJvZHk7XG4gICAgY29uc3Qge2hlaWdodH0gPSBjb250ZW50Li8qT0sqLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIC8vIFVubGlrZSBvdGhlciB2aWV3cG9ydCBiaW5kaW5ncywgdGhlcmUncyBubyBuZWVkIHRvIGluY2x1ZGUgdGhlXG4gICAgLy8gcmVjdCB0b3Agc2luY2UgdGhlIHdyYXBwZWQgYm9keSBhY2NvdW50cyBmb3IgdGhlIHRvcCBtYXJnaW4gb2YgY2hpbGRyZW4uXG4gICAgLy8gSG93ZXZlciwgdGhlIHBhcmVudCdzIHBhZGRpbmctdG9wICh0aGlzLnBhZGRpbmdUb3BfKSBtdXN0IGJlIGFkZGVkLlxuXG4gICAgLy8gQXMgb2YgU2FmYXJpIDEyLjEuMSwgdGhlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCBkb2VzIG5vdCBpbmNsdWRlXG4gICAgLy8gdGhlIGJvdHRvbSBtYXJnaW4gb2YgY2hpbGRyZW4gYW5kIHRoZXJlJ3Mgbm8gb3RoZXIgQVBJIHRoYXQgZG9lcy5cbiAgICBjb25zdCBjaGlsZE1hcmdpbkJvdHRvbSA9IG1hcmdpbkJvdHRvbU9mTGFzdENoaWxkKHRoaXMud2luLCBjb250ZW50KTtcblxuICAgIGNvbnN0IHN0eWxlID0gY29tcHV0ZWRTdHlsZSh0aGlzLndpbiwgY29udGVudCk7XG4gICAgcmV0dXJuIChcbiAgICAgIHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCwgMTApICtcbiAgICAgIHRoaXMucGFkZGluZ1RvcF8gK1xuICAgICAgaGVpZ2h0ICtcbiAgICAgIGNoaWxkTWFyZ2luQm90dG9tICtcbiAgICAgIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSwgMTApXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY29udGVudEhlaWdodENoYW5nZWQoKSB7fVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0TGF5b3V0UmVjdChlbCwgb3B0X3Njcm9sbExlZnQsIG9wdF9zY3JvbGxUb3ApIHtcbiAgICBjb25zdCBiID0gZWwuLypPSyovIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHNjcm9sbFRvcCA9XG4gICAgICBvcHRfc2Nyb2xsVG9wICE9IHVuZGVmaW5lZCA/IG9wdF9zY3JvbGxUb3AgOiB0aGlzLmdldFNjcm9sbFRvcCgpO1xuICAgIGNvbnN0IHNjcm9sbExlZnQgPVxuICAgICAgb3B0X3Njcm9sbExlZnQgIT0gdW5kZWZpbmVkID8gb3B0X3Njcm9sbExlZnQgOiB0aGlzLmdldFNjcm9sbExlZnQoKTtcbiAgICByZXR1cm4gbGF5b3V0UmVjdEx0d2goXG4gICAgICBNYXRoLnJvdW5kKGIubGVmdCArIHNjcm9sbExlZnQpLFxuICAgICAgTWF0aC5yb3VuZChiLnRvcCArIHNjcm9sbFRvcCksXG4gICAgICBNYXRoLnJvdW5kKGIud2lkdGgpLFxuICAgICAgTWF0aC5yb3VuZChiLmhlaWdodClcbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRSb290Q2xpZW50UmVjdEFzeW5jKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNldFNjcm9sbFRvcChzY3JvbGxUb3ApIHtcbiAgICAvLyBJZiBzY3JvbGwgdG9wIGlzIDAsIGl0J3Mgc2V0IHRvIDEgdG8gYXZvaWQgc2Nyb2xsLWZyZWV6ZSBpc3N1ZS4gU2VlXG4gICAgLy8gYG9uU2Nyb2xsZWRfYCBmb3IgbW9yZSBkZXRhaWxzLlxuICAgIHRoaXMud3JhcHBlcl8uLypPSyovIHNjcm9sbFRvcCA9IHNjcm9sbFRvcCB8fCAxO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUV2ZW50PX0gb3B0X2V2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblNjcm9sbGVkXyhvcHRfZXZlbnQpIHtcbiAgICAvLyBTY3JvbGwgZG9jdW1lbnQgaW50byBhIHNhZmUgcG9zaXRpb24gdG8gYXZvaWQgc2Nyb2xsIGZyZWV6ZSBvbiBpT1MuXG4gICAgLy8gVGhpcyBtZWFucyBhdm9pZGluZyBzY3JvbGxUb3AgdG8gYmUgbWluaW11bSAoMCkgb3IgbWF4aW11bSB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIHZlcnkgc2FkIGJ1dCB2ZXJ5IG5lY2Vzc2FyeS4gU2VlICMzMzAgZm9yIG1vcmUgZGV0YWlscy5cbiAgICAvLyBVbmZvcnR1bmF0ZWx5LCB0aGUgc2FtZSBpcyB2ZXJ5IGV4cGVuc2l2ZSB0byBkbyBvbiB0aGUgYm90dG9tLCBkdWUgdG9cbiAgICAvLyBjb3N0bHkgc2Nyb2xsSGVpZ2h0LlxuICAgIGlmICh0aGlzLndyYXBwZXJfLi8qT0sqLyBzY3JvbGxUb3AgPT0gMCkge1xuICAgICAgdGhpcy53cmFwcGVyXy4vKk9LKi8gc2Nyb2xsVG9wID0gMTtcbiAgICAgIGlmIChvcHRfZXZlbnQpIHtcbiAgICAgICAgb3B0X2V2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvcHRfZXZlbnQpIHtcbiAgICAgIHRoaXMuc2Nyb2xsT2JzZXJ2YWJsZV8uZmlyZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0U2Nyb2xsaW5nRWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy53cmFwcGVyXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0U2Nyb2xsaW5nRWxlbWVudFNjcm9sbHNMaWtlVmlld3BvcnQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/viewport/viewport-binding-ios-embed-wrapper.js