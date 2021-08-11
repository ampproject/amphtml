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
import { layoutRectLtwh } from "../../core/dom/layout/rect";
import { computedStyle, px, setImportantStyles } from "../../core/dom/style";
import { Services } from "./..";
import { ViewportBindingDef, marginBottomOfLastChild } from "./viewport-binding-def";
import { dev } from "../../log";
var TAG_ = 'Viewport';

/**
 * Implementation of ViewportBindingDef based on the native window. It assumes
 * that the native window is sized properly and events represent the actual
 * scroll/resize events. This mode is applicable to a standalone document
 * display or when an iframe has a fixed size.
 *
 * Visible for testing.
 *
 * @implements {ViewportBindingDef}
 */
export var ViewportBindingNatural_ = /*#__PURE__*/function () {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   */
  function ViewportBindingNatural_(ampdoc) {
    var _this = this;

    _classCallCheck(this, ViewportBindingNatural_);

    /** @const {!../ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @const {!../../service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.win);

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @const {function()} */
    this.boundScrollEventListener_ = this.handleScrollEvent_.bind(this);

    /** @const {function()} */
    this.boundResizeEventListener_ = function () {
      return _this.resizeObservable_.fire();
    };

    dev().fine(TAG_, 'initialized natural viewport');
  }

  /** @private */
  _createClass(ViewportBindingNatural_, [{
    key: "handleScrollEvent_",
    value: function handleScrollEvent_() {
      this.scrollObservable_.fire();
    }
    /** @override */

  }, {
    key: "connect",
    value: function connect() {
      this.win.addEventListener('scroll', this.boundScrollEventListener_);
      this.win.addEventListener('resize', this.boundResizeEventListener_);
    }
    /** @override */

  }, {
    key: "disconnect",
    value: function disconnect() {
      this.win.removeEventListener('scroll', this.boundScrollEventListener_);
      this.win.removeEventListener('resize', this.boundResizeEventListener_);
    }
    /** @override */

  }, {
    key: "ensureReadyForElements",
    value: function ensureReadyForElements() {// Nothing.
    }
    /** @override */

  }, {
    key: "getBorderTop",
    value: function getBorderTop() {
      return 0;
    }
    /** @override */

  }, {
    key: "requiresFixedLayerTransfer",
    value: function requiresFixedLayerTransfer() {
      return false;
    }
    /** @override */

  }, {
    key: "overrideGlobalScrollTo",
    value: function overrideGlobalScrollTo() {
      return false;
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
      setImportantStyles(this.win.document.documentElement, {
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
      this.win.document.documentElement.classList.add('i-amphtml-scroll-disabled');
    }
    /** @override */

  }, {
    key: "resetScroll",
    value: function resetScroll() {
      // TODO(jridgewell): Recursively disable scroll
      this.win.document.documentElement.classList.remove('i-amphtml-scroll-disabled');
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
      // Prefer window innerWidth/innerHeight but fall back to
      // documentElement clientWidth/clientHeight.
      // documentElement./*OK*/clientHeight is buggy on iOS Safari
      // and thus cannot be used.
      var winWidth = this.win.
      /*OK*/
      innerWidth;
      var winHeight = this.win.
      /*OK*/
      innerHeight;

      if (winWidth && winHeight) {
        return {
          width: winWidth,
          height: winHeight
        };
      }

      var el = this.win.document.documentElement;
      return {
        width: el.
        /*OK*/
        clientWidth,
        height: el.
        /*OK*/
        clientHeight
      };
    }
    /** @override */

  }, {
    key: "getScrollTop",
    value: function getScrollTop() {
      var pageScrollTop = this.getScrollingElement().
      /*OK*/
      scrollTop || this.win.
      /*OK*/
      pageYOffset;

      var _this$ampdoc$getRootN = this.ampdoc.getRootNode(),
          host = _this$ampdoc$getRootN.host;

      return host ? pageScrollTop -
      /** @type {!HTMLElement} */
      host.
      /*OK*/
      offsetTop : pageScrollTop;
    }
    /** @override */

  }, {
    key: "getScrollLeft",
    value: function getScrollLeft() {
      // The html is set to overflow-x: hidden so the document cannot be
      // scrolled horizontally. The scrollLeft will always be 0.
      return 0;
    }
    /** @override */

  }, {
    key: "getScrollWidth",
    value: function getScrollWidth() {
      return this.getScrollingElement().
      /*OK*/
      scrollWidth;
    }
    /** @override */

  }, {
    key: "getScrollHeight",
    value: function getScrollHeight() {
      return this.getScrollingElement().
      /*OK*/
      scrollHeight;
    }
    /** @override */

  }, {
    key: "getContentHeight",
    value: function getContentHeight() {
      // Don't use scrollHeight, since it returns `MAX(viewport_height,
      // document_height)` (we only want the latter), and it doesn't account
      // for margins. Also, don't use documentElement's rect height because
      // there's no workable analog for either ios-embed-* modes.
      var content = this.getScrollingElement();
      var rect = content.
      /*OK*/
      getBoundingClientRect();
      // The Y-position of `content` can be offset by the vertical margin
      // of its first child, and this is _not_ accounted for in `rect.height`.
      // This causes smaller than expected content height, so add it manually.
      // Note this "top" value already includes padding-top of ancestor elements
      // and getBorderTop().
      var top = rect.top + this.getScrollTop();
      // As of Safari 12.1.1, the getBoundingClientRect().height does not include
      // the bottom margin of children and there's no other API that does.
      var childMarginBottom = Services.platformFor(this.win).isSafari() ? marginBottomOfLastChild(this.win, content) : 0;
      var style = computedStyle(this.win, content);
      return top + parseInt(style.marginTop, 10) + rect.height + childMarginBottom + parseInt(style.marginBottom, 10);
    }
    /** @override */

  }, {
    key: "contentHeightChanged",
    value: function contentHeightChanged() {// Nothing to do here.
    }
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
      this.getScrollingElement().
      /*OK*/
      scrollTop = scrollTop;
    }
    /** @override */

  }, {
    key: "getScrollingElement",
    value: function getScrollingElement() {
      var doc = this.win.document;

      if (doc.
      /*OK*/
      scrollingElement) {
        return doc.
        /*OK*/
        scrollingElement;
      }

      if (doc.body && // Due to https://bugs.webkit.org/show_bug.cgi?id=106133, WebKit
      // browsers have to use `body` and NOT `documentElement` for
      // scrolling purposes. This has mostly being resolved via
      // `scrollingElement` property, but this branch is still necessary
      // for backward compatibility purposes.
      this.platform_.isWebKit()) {
        return doc.body;
      }

      return doc.documentElement;
    }
    /** @override */

  }, {
    key: "getScrollingElementScrollsLikeViewport",
    value: function getScrollingElementScrollsLikeViewport() {
      return true;
    }
  }]);

  return ViewportBindingNatural_;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZXdwb3J0LWJpbmRpbmctbmF0dXJhbC5qcyJdLCJuYW1lcyI6WyJPYnNlcnZhYmxlIiwibGF5b3V0UmVjdEx0d2giLCJjb21wdXRlZFN0eWxlIiwicHgiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJTZXJ2aWNlcyIsIlZpZXdwb3J0QmluZGluZ0RlZiIsIm1hcmdpbkJvdHRvbU9mTGFzdENoaWxkIiwiZGV2IiwiVEFHXyIsIlZpZXdwb3J0QmluZGluZ05hdHVyYWxfIiwiYW1wZG9jIiwid2luIiwicGxhdGZvcm1fIiwicGxhdGZvcm1Gb3IiLCJzY3JvbGxPYnNlcnZhYmxlXyIsInJlc2l6ZU9ic2VydmFibGVfIiwiYm91bmRTY3JvbGxFdmVudExpc3RlbmVyXyIsImhhbmRsZVNjcm9sbEV2ZW50XyIsImJpbmQiLCJib3VuZFJlc2l6ZUV2ZW50TGlzdGVuZXJfIiwiZmlyZSIsImZpbmUiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNhbGxiYWNrIiwiYWRkIiwicGFkZGluZ1RvcCIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwidHJhbnNpZW50IiwidW51c2VkTGFzdFBhZGRpbmdUb3AiLCJ1cGRhdGVQYWRkaW5nVG9wIiwiY2xhc3NMaXN0IiwicmVtb3ZlIiwidW51c2VkTGlnaHRib3hNb2RlIiwid2luV2lkdGgiLCJpbm5lcldpZHRoIiwid2luSGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJ3aWR0aCIsImhlaWdodCIsImVsIiwiY2xpZW50V2lkdGgiLCJjbGllbnRIZWlnaHQiLCJwYWdlU2Nyb2xsVG9wIiwiZ2V0U2Nyb2xsaW5nRWxlbWVudCIsInNjcm9sbFRvcCIsInBhZ2VZT2Zmc2V0IiwiZ2V0Um9vdE5vZGUiLCJob3N0Iiwib2Zmc2V0VG9wIiwic2Nyb2xsV2lkdGgiLCJzY3JvbGxIZWlnaHQiLCJjb250ZW50IiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInRvcCIsImdldFNjcm9sbFRvcCIsImNoaWxkTWFyZ2luQm90dG9tIiwiaXNTYWZhcmkiLCJzdHlsZSIsInBhcnNlSW50IiwibWFyZ2luVG9wIiwibWFyZ2luQm90dG9tIiwib3B0X3Njcm9sbExlZnQiLCJvcHRfc2Nyb2xsVG9wIiwiYiIsInVuZGVmaW5lZCIsInNjcm9sbExlZnQiLCJnZXRTY3JvbGxMZWZ0IiwiTWF0aCIsInJvdW5kIiwibGVmdCIsIlByb21pc2UiLCJyZXNvbHZlIiwiZG9jIiwic2Nyb2xsaW5nRWxlbWVudCIsImJvZHkiLCJpc1dlYktpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxVQUFSO0FBQ0EsU0FBUUMsY0FBUjtBQUNBLFNBQVFDLGFBQVIsRUFBdUJDLEVBQXZCLEVBQTJCQyxrQkFBM0I7QUFFQSxTQUFRQyxRQUFSO0FBRUEsU0FDRUMsa0JBREYsRUFFRUMsdUJBRkY7QUFLQSxTQUFRQyxHQUFSO0FBRUEsSUFBTUMsSUFBSSxHQUFHLFVBQWI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyx1QkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLG1DQUFZQyxNQUFaLEVBQW9CO0FBQUE7O0FBQUE7O0FBQ2xCO0FBQ0EsU0FBS0EsTUFBTCxHQUFjQSxNQUFkOztBQUVBO0FBQ0EsU0FBS0MsR0FBTCxHQUFXRCxNQUFNLENBQUNDLEdBQWxCOztBQUVBO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQlIsUUFBUSxDQUFDUyxXQUFULENBQXFCLEtBQUtGLEdBQTFCLENBQWpCOztBQUVBO0FBQ0EsU0FBS0csaUJBQUwsR0FBeUIsSUFBSWYsVUFBSixFQUF6Qjs7QUFFQTtBQUNBLFNBQUtnQixpQkFBTCxHQUF5QixJQUFJaEIsVUFBSixFQUF6Qjs7QUFFQTtBQUNBLFNBQUtpQix5QkFBTCxHQUFpQyxLQUFLQyxrQkFBTCxDQUF3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QztBQUN2QyxhQUFPLElBQVA7QUFDRDtBQTVQSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL29ic2VydmFibGUnO1xuaW1wb3J0IHtsYXlvdXRSZWN0THR3aH0gZnJvbSAnI2NvcmUvZG9tL2xheW91dC9yZWN0JztcbmltcG9ydCB7Y29tcHV0ZWRTdHlsZSwgcHgsIHNldEltcG9ydGFudFN0eWxlc30gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge1xuICBWaWV3cG9ydEJpbmRpbmdEZWYsXG4gIG1hcmdpbkJvdHRvbU9mTGFzdENoaWxkLFxufSBmcm9tICcuL3ZpZXdwb3J0LWJpbmRpbmctZGVmJztcblxuaW1wb3J0IHtkZXZ9IGZyb20gJy4uLy4uL2xvZyc7XG5cbmNvbnN0IFRBR18gPSAnVmlld3BvcnQnO1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIFZpZXdwb3J0QmluZGluZ0RlZiBiYXNlZCBvbiB0aGUgbmF0aXZlIHdpbmRvdy4gSXQgYXNzdW1lc1xuICogdGhhdCB0aGUgbmF0aXZlIHdpbmRvdyBpcyBzaXplZCBwcm9wZXJseSBhbmQgZXZlbnRzIHJlcHJlc2VudCB0aGUgYWN0dWFsXG4gKiBzY3JvbGwvcmVzaXplIGV2ZW50cy4gVGhpcyBtb2RlIGlzIGFwcGxpY2FibGUgdG8gYSBzdGFuZGFsb25lIGRvY3VtZW50XG4gKiBkaXNwbGF5IG9yIHdoZW4gYW4gaWZyYW1lIGhhcyBhIGZpeGVkIHNpemUuXG4gKlxuICogVmlzaWJsZSBmb3IgdGVzdGluZy5cbiAqXG4gKiBAaW1wbGVtZW50cyB7Vmlld3BvcnRCaW5kaW5nRGVmfVxuICovXG5leHBvcnQgY2xhc3MgVmlld3BvcnRCaW5kaW5nTmF0dXJhbF8ge1xuICAvKipcbiAgICogQHBhcmFtIHshLi4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKiBAY29uc3QgeyEuLi9hbXBkb2MtaW1wbC5BbXBEb2N9ICovXG4gICAgdGhpcy5hbXBkb2MgPSBhbXBkb2M7XG5cbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gYW1wZG9jLndpbjtcblxuICAgIC8qKiBAY29uc3QgeyEuLi8uLi9zZXJ2aWNlL3BsYXRmb3JtLWltcGwuUGxhdGZvcm19ICovXG4gICAgdGhpcy5wbGF0Zm9ybV8gPSBTZXJ2aWNlcy5wbGF0Zm9ybUZvcih0aGlzLndpbik7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshT2JzZXJ2YWJsZX0gKi9cbiAgICB0aGlzLnNjcm9sbE9ic2VydmFibGVfID0gbmV3IE9ic2VydmFibGUoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFPYnNlcnZhYmxlfSAqL1xuICAgIHRoaXMucmVzaXplT2JzZXJ2YWJsZV8gPSBuZXcgT2JzZXJ2YWJsZSgpO1xuXG4gICAgLyoqIEBjb25zdCB7ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLmJvdW5kU2Nyb2xsRXZlbnRMaXN0ZW5lcl8gPSB0aGlzLmhhbmRsZVNjcm9sbEV2ZW50Xy5iaW5kKHRoaXMpO1xuXG4gICAgLyoqIEBjb25zdCB7ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLmJvdW5kUmVzaXplRXZlbnRMaXN0ZW5lcl8gPSAoKSA9PiB0aGlzLnJlc2l6ZU9ic2VydmFibGVfLmZpcmUoKTtcblxuICAgIGRldigpLmZpbmUoVEFHXywgJ2luaXRpYWxpemVkIG5hdHVyYWwgdmlld3BvcnQnKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBoYW5kbGVTY3JvbGxFdmVudF8oKSB7XG4gICAgdGhpcy5zY3JvbGxPYnNlcnZhYmxlXy5maXJlKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNvbm5lY3QoKSB7XG4gICAgdGhpcy53aW4uYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5ib3VuZFNjcm9sbEV2ZW50TGlzdGVuZXJfKTtcbiAgICB0aGlzLndpbi5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmJvdW5kUmVzaXplRXZlbnRMaXN0ZW5lcl8pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMud2luLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuYm91bmRTY3JvbGxFdmVudExpc3RlbmVyXyk7XG4gICAgdGhpcy53aW4ucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5ib3VuZFJlc2l6ZUV2ZW50TGlzdGVuZXJfKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZW5zdXJlUmVhZHlGb3JFbGVtZW50cygpIHtcbiAgICAvLyBOb3RoaW5nLlxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRCb3JkZXJUb3AoKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlcXVpcmVzRml4ZWRMYXllclRyYW5zZmVyKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb3ZlcnJpZGVHbG9iYWxTY3JvbGxUbygpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHN1cHBvcnRzUG9zaXRpb25GaXhlZCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25TY3JvbGwoY2FsbGJhY2spIHtcbiAgICB0aGlzLnNjcm9sbE9ic2VydmFibGVfLmFkZChjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uUmVzaXplKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZXNpemVPYnNlcnZhYmxlXy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB1cGRhdGVQYWRkaW5nVG9wKHBhZGRpbmdUb3ApIHtcbiAgICBzZXRJbXBvcnRhbnRTdHlsZXModGhpcy53aW4uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7XG4gICAgICAncGFkZGluZy10b3AnOiBweChwYWRkaW5nVG9wKSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaGlkZVZpZXdlckhlYWRlcih0cmFuc2llbnQsIHVudXNlZExhc3RQYWRkaW5nVG9wKSB7XG4gICAgaWYgKCF0cmFuc2llbnQpIHtcbiAgICAgIHRoaXMudXBkYXRlUGFkZGluZ1RvcCgwKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNob3dWaWV3ZXJIZWFkZXIodHJhbnNpZW50LCBwYWRkaW5nVG9wKSB7XG4gICAgaWYgKCF0cmFuc2llbnQpIHtcbiAgICAgIHRoaXMudXBkYXRlUGFkZGluZ1RvcChwYWRkaW5nVG9wKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRpc2FibGVTY3JvbGwoKSB7XG4gICAgLy8gVE9ETyhqcmlkZ2V3ZWxsKTogUmVjdXJzaXZlbHkgZGlzYWJsZSBzY3JvbGxcbiAgICB0aGlzLndpbi5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcbiAgICAgICdpLWFtcGh0bWwtc2Nyb2xsLWRpc2FibGVkJ1xuICAgICk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlc2V0U2Nyb2xsKCkge1xuICAgIC8vIFRPRE8oanJpZGdld2VsbCk6IFJlY3Vyc2l2ZWx5IGRpc2FibGUgc2Nyb2xsXG4gICAgdGhpcy53aW4uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXG4gICAgICAnaS1hbXBodG1sLXNjcm9sbC1kaXNhYmxlZCdcbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB1cGRhdGVMaWdodGJveE1vZGUodW51c2VkTGlnaHRib3hNb2RlKSB7XG4gICAgLy8gVGhlIGxheW91dCBpcyBhbHdheXMgYWNjdXJhdGUuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRTaXplKCkge1xuICAgIC8vIFByZWZlciB3aW5kb3cgaW5uZXJXaWR0aC9pbm5lckhlaWdodCBidXQgZmFsbCBiYWNrIHRvXG4gICAgLy8gZG9jdW1lbnRFbGVtZW50IGNsaWVudFdpZHRoL2NsaWVudEhlaWdodC5cbiAgICAvLyBkb2N1bWVudEVsZW1lbnQuLypPSyovY2xpZW50SGVpZ2h0IGlzIGJ1Z2d5IG9uIGlPUyBTYWZhcmlcbiAgICAvLyBhbmQgdGh1cyBjYW5ub3QgYmUgdXNlZC5cbiAgICBjb25zdCB3aW5XaWR0aCA9IHRoaXMud2luLi8qT0sqLyBpbm5lcldpZHRoO1xuICAgIGNvbnN0IHdpbkhlaWdodCA9IHRoaXMud2luLi8qT0sqLyBpbm5lckhlaWdodDtcbiAgICBpZiAod2luV2lkdGggJiYgd2luSGVpZ2h0KSB7XG4gICAgICByZXR1cm4ge3dpZHRoOiB3aW5XaWR0aCwgaGVpZ2h0OiB3aW5IZWlnaHR9O1xuICAgIH1cbiAgICBjb25zdCBlbCA9IHRoaXMud2luLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICByZXR1cm4ge3dpZHRoOiBlbC4vKk9LKi8gY2xpZW50V2lkdGgsIGhlaWdodDogZWwuLypPSyovIGNsaWVudEhlaWdodH07XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFNjcm9sbFRvcCgpIHtcbiAgICBjb25zdCBwYWdlU2Nyb2xsVG9wID1cbiAgICAgIHRoaXMuZ2V0U2Nyb2xsaW5nRWxlbWVudCgpLi8qT0sqLyBzY3JvbGxUb3AgfHxcbiAgICAgIHRoaXMud2luLi8qT0sqLyBwYWdlWU9mZnNldDtcbiAgICBjb25zdCB7aG9zdH0gPSB0aGlzLmFtcGRvYy5nZXRSb290Tm9kZSgpO1xuICAgIHJldHVybiBob3N0XG4gICAgICA/IHBhZ2VTY3JvbGxUb3AgLSAvKiogQHR5cGUgeyFIVE1MRWxlbWVudH0gKi8gKGhvc3QpLi8qT0sqLyBvZmZzZXRUb3BcbiAgICAgIDogcGFnZVNjcm9sbFRvcDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0U2Nyb2xsTGVmdCgpIHtcbiAgICAvLyBUaGUgaHRtbCBpcyBzZXQgdG8gb3ZlcmZsb3cteDogaGlkZGVuIHNvIHRoZSBkb2N1bWVudCBjYW5ub3QgYmVcbiAgICAvLyBzY3JvbGxlZCBob3Jpem9udGFsbHkuIFRoZSBzY3JvbGxMZWZ0IHdpbGwgYWx3YXlzIGJlIDAuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFNjcm9sbFdpZHRoKCkge1xuICAgIHJldHVybiB0aGlzLmdldFNjcm9sbGluZ0VsZW1lbnQoKS4vKk9LKi8gc2Nyb2xsV2lkdGg7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFNjcm9sbEhlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTY3JvbGxpbmdFbGVtZW50KCkuLypPSyovIHNjcm9sbEhlaWdodDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0Q29udGVudEhlaWdodCgpIHtcbiAgICAvLyBEb24ndCB1c2Ugc2Nyb2xsSGVpZ2h0LCBzaW5jZSBpdCByZXR1cm5zIGBNQVgodmlld3BvcnRfaGVpZ2h0LFxuICAgIC8vIGRvY3VtZW50X2hlaWdodClgICh3ZSBvbmx5IHdhbnQgdGhlIGxhdHRlciksIGFuZCBpdCBkb2Vzbid0IGFjY291bnRcbiAgICAvLyBmb3IgbWFyZ2lucy4gQWxzbywgZG9uJ3QgdXNlIGRvY3VtZW50RWxlbWVudCdzIHJlY3QgaGVpZ2h0IGJlY2F1c2VcbiAgICAvLyB0aGVyZSdzIG5vIHdvcmthYmxlIGFuYWxvZyBmb3IgZWl0aGVyIGlvcy1lbWJlZC0qIG1vZGVzLlxuICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmdldFNjcm9sbGluZ0VsZW1lbnQoKTtcbiAgICBjb25zdCByZWN0ID0gY29udGVudC4vKk9LKi8gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAvLyBUaGUgWS1wb3NpdGlvbiBvZiBgY29udGVudGAgY2FuIGJlIG9mZnNldCBieSB0aGUgdmVydGljYWwgbWFyZ2luXG4gICAgLy8gb2YgaXRzIGZpcnN0IGNoaWxkLCBhbmQgdGhpcyBpcyBfbm90XyBhY2NvdW50ZWQgZm9yIGluIGByZWN0LmhlaWdodGAuXG4gICAgLy8gVGhpcyBjYXVzZXMgc21hbGxlciB0aGFuIGV4cGVjdGVkIGNvbnRlbnQgaGVpZ2h0LCBzbyBhZGQgaXQgbWFudWFsbHkuXG4gICAgLy8gTm90ZSB0aGlzIFwidG9wXCIgdmFsdWUgYWxyZWFkeSBpbmNsdWRlcyBwYWRkaW5nLXRvcCBvZiBhbmNlc3RvciBlbGVtZW50c1xuICAgIC8vIGFuZCBnZXRCb3JkZXJUb3AoKS5cbiAgICBjb25zdCB0b3AgPSByZWN0LnRvcCArIHRoaXMuZ2V0U2Nyb2xsVG9wKCk7XG5cbiAgICAvLyBBcyBvZiBTYWZhcmkgMTIuMS4xLCB0aGUgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0IGRvZXMgbm90IGluY2x1ZGVcbiAgICAvLyB0aGUgYm90dG9tIG1hcmdpbiBvZiBjaGlsZHJlbiBhbmQgdGhlcmUncyBubyBvdGhlciBBUEkgdGhhdCBkb2VzLlxuICAgIGNvbnN0IGNoaWxkTWFyZ2luQm90dG9tID0gU2VydmljZXMucGxhdGZvcm1Gb3IodGhpcy53aW4pLmlzU2FmYXJpKClcbiAgICAgID8gbWFyZ2luQm90dG9tT2ZMYXN0Q2hpbGQodGhpcy53aW4sIGNvbnRlbnQpXG4gICAgICA6IDA7XG5cbiAgICBjb25zdCBzdHlsZSA9IGNvbXB1dGVkU3R5bGUodGhpcy53aW4sIGNvbnRlbnQpO1xuICAgIHJldHVybiAoXG4gICAgICB0b3AgK1xuICAgICAgcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wLCAxMCkgK1xuICAgICAgcmVjdC5oZWlnaHQgK1xuICAgICAgY2hpbGRNYXJnaW5Cb3R0b20gK1xuICAgICAgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tLCAxMClcbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjb250ZW50SGVpZ2h0Q2hhbmdlZCgpIHtcbiAgICAvLyBOb3RoaW5nIHRvIGRvIGhlcmUuXG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldExheW91dFJlY3QoZWwsIG9wdF9zY3JvbGxMZWZ0LCBvcHRfc2Nyb2xsVG9wKSB7XG4gICAgY29uc3QgYiA9IGVsLi8qT0sqLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBzY3JvbGxUb3AgPVxuICAgICAgb3B0X3Njcm9sbFRvcCAhPSB1bmRlZmluZWQgPyBvcHRfc2Nyb2xsVG9wIDogdGhpcy5nZXRTY3JvbGxUb3AoKTtcbiAgICBjb25zdCBzY3JvbGxMZWZ0ID1cbiAgICAgIG9wdF9zY3JvbGxMZWZ0ICE9IHVuZGVmaW5lZCA/IG9wdF9zY3JvbGxMZWZ0IDogdGhpcy5nZXRTY3JvbGxMZWZ0KCk7XG4gICAgcmV0dXJuIGxheW91dFJlY3RMdHdoKFxuICAgICAgTWF0aC5yb3VuZChiLmxlZnQgKyBzY3JvbGxMZWZ0KSxcbiAgICAgIE1hdGgucm91bmQoYi50b3AgKyBzY3JvbGxUb3ApLFxuICAgICAgTWF0aC5yb3VuZChiLndpZHRoKSxcbiAgICAgIE1hdGgucm91bmQoYi5oZWlnaHQpXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0Um9vdENsaWVudFJlY3RBc3luYygpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKSB7XG4gICAgdGhpcy5nZXRTY3JvbGxpbmdFbGVtZW50KCkuLypPSyovIHNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0U2Nyb2xsaW5nRWxlbWVudCgpIHtcbiAgICBjb25zdCBkb2MgPSB0aGlzLndpbi5kb2N1bWVudDtcbiAgICBpZiAoZG9jLi8qT0sqLyBzY3JvbGxpbmdFbGVtZW50KSB7XG4gICAgICByZXR1cm4gZG9jLi8qT0sqLyBzY3JvbGxpbmdFbGVtZW50O1xuICAgIH1cbiAgICBpZiAoXG4gICAgICBkb2MuYm9keSAmJlxuICAgICAgLy8gRHVlIHRvIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xMDYxMzMsIFdlYktpdFxuICAgICAgLy8gYnJvd3NlcnMgaGF2ZSB0byB1c2UgYGJvZHlgIGFuZCBOT1QgYGRvY3VtZW50RWxlbWVudGAgZm9yXG4gICAgICAvLyBzY3JvbGxpbmcgcHVycG9zZXMuIFRoaXMgaGFzIG1vc3RseSBiZWluZyByZXNvbHZlZCB2aWFcbiAgICAgIC8vIGBzY3JvbGxpbmdFbGVtZW50YCBwcm9wZXJ0eSwgYnV0IHRoaXMgYnJhbmNoIGlzIHN0aWxsIG5lY2Vzc2FyeVxuICAgICAgLy8gZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgcHVycG9zZXMuXG4gICAgICB0aGlzLnBsYXRmb3JtXy5pc1dlYktpdCgpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZG9jLmJvZHk7XG4gICAgfVxuICAgIHJldHVybiBkb2MuZG9jdW1lbnRFbGVtZW50O1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRTY3JvbGxpbmdFbGVtZW50U2Nyb2xsc0xpa2VWaWV3cG9ydCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/viewport/viewport-binding-natural.js