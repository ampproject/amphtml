import { resolvedPromise as _resolvedPromise } from "./../../core/data-structures/promise";

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
import { ReadyState } from "../../core/constants/ready-state";
import { removeElement } from "../../core/dom";
import { guaranteeSrcForSrcsetUnsupportedBrowsers } from "../../core/dom/img";
import { Layout, applyFillContent, isLayoutSizeDefined } from "../../core/dom/layout";
import { propagateAttributes } from "../../core/dom/propagate-attributes";
import { scopedQuerySelector } from "../../core/dom/query";
import { propagateObjectFitStyles, setImportantStyles } from "../../core/dom/style";
import { Services } from "../../service";
import { registerElement } from "../../service/custom-element-registry";
import { BaseElement } from "../../base-element";
import { listen } from "../../event-helper";
import { dev } from "../../log";

/** @const {string} */
var TAG = 'amp-img';

/**
 * Attributes to propagate to internal image when changed externally.
 * @type {!Array<string>}
 */
export var ATTRIBUTES_TO_PROPAGATE = ['alt', 'aria-describedby', 'aria-label', 'aria-labelledby', 'crossorigin', 'referrerpolicy', 'title', 'sizes', 'srcset', 'src'];
export var AmpImg = /*#__PURE__*/function (_BaseElement) {
  _inherits(AmpImg, _BaseElement);

  var _super = _createSuper(AmpImg);

  /** @param {!AmpElement} element */
  function AmpImg(element) {
    var _this;

    _classCallCheck(this, AmpImg);

    _this = _super.call(this, element);

    /** @private {boolean} */
    _this.allowImgLoadFallback_ = true;

    /** @private {?Element} */
    _this.img_ = null;

    /** @private {?UnlistenDef} */
    _this.unlistenLoad_ = null;

    /** @private {?UnlistenDef} */
    _this.unlistenError_ = null;

    /**
     * The current width used by the automatically generated sizes attribute
     * @private {number}
     * */
    _this.sizesWidth_ = 0;
    return _this;
  }

  /** @override */
  _createClass(AmpImg, [{
    key: "mutatedAttributesCallback",
    value: function mutatedAttributesCallback(mutations) {
      if (this.img_) {
        var attrs = ATTRIBUTES_TO_PROPAGATE.filter(function (value) {
          return mutations[value] !== undefined;
        });

        // Mutating src should override existing srcset, so remove the latter.
        if (mutations['src'] && !mutations['srcset'] && this.element.hasAttribute('srcset')) {
          // propagateAttributes() will remove [srcset] from this.img_.
          this.element.removeAttribute('srcset');
          attrs.push('srcset');
          this.user().warn(TAG, 'Removed [srcset] since [src] was mutated. Recommend adding a ' + '[srcset] binding to support responsive images.', this.element);
        }

        propagateAttributes(attrs, this.element, this.img_,
        /* opt_removeMissingAttrs */
        true);
        this.propagateDataset(this.img_);

        if (!false) {
          guaranteeSrcForSrcsetUnsupportedBrowsers(this.img_);
        }

        if (AmpImg.R1() && !this.img_.complete) {
          this.setReadyState(ReadyState.LOADING);
        }
      }
    }
    /** @override */

  }, {
    key: "preconnectCallback",
    value: function preconnectCallback(onLayout) {
      // NOTE(@wassgha): since parseSrcset is computationally expensive and can
      // not be inside the `buildCallback`, we went with preconnecting to the
      // `src` url if it exists or the first srcset url.
      var src = this.element.getAttribute('src');

      if (src) {
        Services.preconnectFor(this.win).url(this.getAmpDoc(), src, onLayout);
      } else {
        var srcset = this.element.getAttribute('srcset');

        if (!srcset) {
          return;
        }

        // We try to find the first url in the srcset
        var srcseturl = /\S+/.exec(srcset);

        // Connect to the first url if it exists
        if (srcseturl) {
          Services.preconnectFor(this.win).url(this.getAmpDoc(), srcseturl[0], onLayout);
        }
      }
    }
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }
    /**
     * Create the actual image element and set up instance variables.
     * Called lazily in the first `#layoutCallback`.
     * @return {!Image}
     */

  }, {
    key: "initialize_",
    value: function initialize_() {
      if (this.img_) {
        return this.img_;
      }

      // If this amp-img IS the fallback then don't allow it to have its own
      // fallback to stop from nested fallback abuse.
      this.allowImgLoadFallback_ = !this.element.hasAttribute('fallback');
      // For SSR, image will have been written directly to DOM so no need to recreate.
      var serverRendered = this.element.hasAttribute('i-amphtml-ssr');

      if (serverRendered) {
        this.img_ = scopedQuerySelector(this.element, '> img:not([placeholder])');
      }

      this.img_ = this.img_ || new Image();
      this.img_.setAttribute('decoding', 'async');

      if (this.element.id) {
        this.img_.setAttribute('amp-img-id', this.element.id);
      }

      // Remove role=img otherwise this breaks screen-readers focus and
      // only read "Graphic" when using only 'alt'.
      if (this.element.getAttribute('role') == 'img') {
        this.element.removeAttribute('role');
        this.user().error(TAG, 'Setting role=img on amp-img elements breaks ' + 'screen readers please just set alt or ARIA attributes, they will ' + 'be correctly propagated for the underlying <img> element.');
      }

      // It is important to call this before setting `srcset` attribute.
      this.maybeGenerateSizes_(
      /* sync setAttribute */
      true);
      propagateAttributes(ATTRIBUTES_TO_PROPAGATE, this.element, this.img_);
      this.propagateDataset(this.img_);

      if (!false) {
        guaranteeSrcForSrcsetUnsupportedBrowsers(this.img_);
      }

      applyFillContent(this.img_, true);
      propagateObjectFitStyles(this.element, this.img_);

      if (!serverRendered) {
        this.element.appendChild(this.img_);
      }

      return this.img_;
    }
    /**
     * This function automatically generates sizes for amp-imgs without
     * the sizes attribute.
     * @param {boolean} sync Whether to immediately make the change or schedule
     *     via mutateElement.
     * @private
     */

  }, {
    key: "maybeGenerateSizes_",
    value: function maybeGenerateSizes_(sync) {
      var _this2 = this;

      if (false) {
        // The `getLayoutSize()` is not available for a R1 element. Skip this
        // codepath. Also: is this feature at all useful? E.g. it doesn't even
        // execute in the `i-amphtml-ssr` mode.
        return;
      }

      if (!this.img_) {
        return;
      }

      // If the image is server rendered, do not generate sizes.
      if (this.element.hasAttribute('i-amphtml-ssr')) {
        return;
      }

      // No need to generate sizes if already present.
      var sizes = this.element.hasAttribute('sizes') || this.img_.hasAttribute('sizes');

      if (sizes) {
        return;
      }

      // Sizes is useless without the srcset attribute or if the srcset
      // attribute uses the x descriptor.
      var srcset = this.element.getAttribute('srcset');

      if (!srcset || /[0-9]+x(?:,|$)/.test(srcset)) {
        return;
      }

      var _this$element$getLayo = this.element.getLayoutSize(),
          width = _this$element$getLayo.width;

      if (!this.shouldSetSizes_(width)) {
        return;
      }

      var viewportWidth = this.getViewport().getWidth();
      var entry = "(max-width: " + viewportWidth + "px) " + width + "px, ";
      var defaultSize = width + 'px';

      if (this.getLayout() !== Layout.FIXED) {
        var ratio = Math.round(width * 100 / viewportWidth);
        defaultSize = Math.max(ratio, 100) + 'vw';
      }

      var generatedSizes = entry + defaultSize;

      if (sync) {
        this.img_.setAttribute('sizes', generatedSizes);
      } else {
        this.mutateElement(function () {
          _this2.img_.setAttribute('sizes', generatedSizes);
        });
      }

      this.sizesWidth_ = width;
    }
    /**
     * @param {number} newWidth
     * @return {boolean}
     * @private
     */

  }, {
    key: "shouldSetSizes_",
    value: function shouldSetSizes_(newWidth) {
      if (!this.img_.hasAttribute('sizes')) {
        return true;
      }

      return newWidth > this.sizesWidth_;
    }
    /** @override */

  }, {
    key: "reconstructWhenReparented",
    value: function reconstructWhenReparented() {
      return false;
    }
    /** @override */

  }, {
    key: "mountCallback",
    value: function mountCallback() {
      var _this3 = this;

      var initialized = !!this.img_;
      var img = this.initialize_();

      if (!initialized) {
        listen(img, 'load', function () {
          _this3.setReadyState(ReadyState.COMPLETE);

          _this3.firstLayoutCompleted();

          _this3.hideFallbackImg_();
        });
        listen(img, 'error', function (reason) {
          _this3.setReadyState(ReadyState.ERROR, reason);

          _this3.onImgLoadingError_();
        });
      }

      if (img.complete) {
        this.setReadyState(ReadyState.COMPLETE);
        this.firstLayoutCompleted();
        this.hideFallbackImg_();
      } else {
        this.setReadyState(ReadyState.LOADING);
      }
    }
    /** @override */

  }, {
    key: "unmountCallback",
    value: function unmountCallback() {
      // Interrupt retrieval of incomplete images to free network resources when
      // navigating pages in a PWA. Opt for tiny dataURI image instead of empty
      // src to prevent the viewer from detecting a load error.
      var img = this.img_;

      if (img && !img.complete) {
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
        removeElement(img);
        this.img_ = null;
      }
    }
    /** @override */

  }, {
    key: "ensureLoaded",
    value: function ensureLoaded() {
      var img = dev().assertElement(this.img_);
      img.loading = 'eager';
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      var _this4 = this;

      this.initialize_();
      var img = dev().assertElement(this.img_);
      this.unlistenLoad_ = listen(img, 'load', function () {
        return _this4.hideFallbackImg_();
      });
      this.unlistenError_ = listen(img, 'error', function () {
        return _this4.onImgLoadingError_();
      });

      var _this$element$getLayo2 = this.element.getLayoutSize(),
          width = _this$element$getLayo2.width;

      if (width <= 0) {
        return _resolvedPromise();
      }

      return this.loadPromise(img);
    }
    /** @override */

  }, {
    key: "unlayoutCallback",
    value: function unlayoutCallback() {
      if (AmpImg.R1()) {
        // TODO(#31915): Reconsider if this is still desired for R1. This helps
        // with network interruption when a document is inactivated.
        return;
      }

      if (this.unlistenError_) {
        this.unlistenError_();
        this.unlistenError_ = null;
      }

      if (this.unlistenLoad_) {
        this.unlistenLoad_();
        this.unlistenLoad_ = null;
      }

      // Interrupt retrieval of incomplete images to free network resources when
      // navigating pages in a PWA. Opt for tiny dataURI image instead of empty
      // src to prevent the viewer from detecting a load error.
      var img = this.img_;

      if (img && !img.complete) {
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
        removeElement(img);
        this.img_ = null;
      }

      return true;
    }
    /** @override */

  }, {
    key: "firstLayoutCompleted",
    value: function firstLayoutCompleted() {
      var placeholder = this.getPlaceholder();

      if (placeholder && placeholder.classList.contains('i-amphtml-blurry-placeholder')) {
        setImportantStyles(placeholder, {
          'opacity': 0
        });
      } else {
        this.togglePlaceholder(false);
      }
    }
    /**
     * @private
     */

  }, {
    key: "hideFallbackImg_",
    value: function hideFallbackImg_() {
      if (!this.allowImgLoadFallback_ && this.img_.classList.contains('i-amphtml-ghost')) {
        this.img_.classList.remove('i-amphtml-ghost');
        this.toggleFallback(false);
      }
    }
    /**
     * If the image fails to load, show a fallback or placeholder instead.
     * @private
     */

  }, {
    key: "onImgLoadingError_",
    value: function onImgLoadingError_() {
      if (this.allowImgLoadFallback_) {
        this.img_.classList.add('i-amphtml-ghost');
        this.toggleFallback(true);
        // Hide placeholders, as browsers that don't support webp
        // Would show the placeholder underneath a transparent fallback
        this.togglePlaceholder(false);
        this.allowImgLoadFallback_ = false;
      }
    }
    /**
     * Utility method to propagate data attributes from this element
     * to the target element. (For use with arbitrary data attributes.)
     * Removes any data attributes that are missing on this element from
     * the target element.
     * AMP Bind attributes are excluded.
     *
     * @param {!Element} targetElement
     */

  }, {
    key: "propagateDataset",
    value: function propagateDataset(targetElement) {
      for (var key in targetElement.dataset) {
        if (!(key in this.element.dataset)) {
          delete targetElement.dataset[key];
        }
      }

      for (var _key in this.element.dataset) {
        if (_key.startsWith('ampBind') && _key !== 'ampBind') {
          continue;
        }

        if (targetElement.dataset[_key] !== this.element.dataset[_key]) {
          targetElement.dataset[_key] = this.element.dataset[_key];
        }
      }
    }
  }], [{
    key: "R1",
    value:
    /** @override @nocollapse */
    function R1() {
      return false;
    }
    /** @override @nocollapse */

  }, {
    key: "prerenderAllowed",
    value: function prerenderAllowed() {
      return true;
    }
    /** @override @nocollapse */

  }, {
    key: "usesLoading",
    value: function usesLoading() {
      return true;
    }
    /** @override @nocollapse */

  }, {
    key: "getPreconnects",
    value: function getPreconnects(element) {
      var src = element.getAttribute('src');

      if (src) {
        return [src];
      }

      // NOTE(@wassgha): since parseSrcset is computationally expensive and can
      // not be inside the `buildCallback`, we went with preconnecting to the
      // `src` url if it exists or the first srcset url.
      var srcset = element.getAttribute('srcset');

      if (srcset) {
        // We try to find the first url in the srcset
        var srcseturl = /\S+/.exec(srcset);

        // Connect to the first url if it exists
        if (srcseturl) {
          return [srcseturl[0]];
        }
      }

      return null;
    }
  }]);

  return AmpImg;
}(BaseElement);

/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 */
export function installImg(win) {
  registerElement(win, TAG, AmpImg);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1pbWcuanMiXSwibmFtZXMiOlsiUmVhZHlTdGF0ZSIsInJlbW92ZUVsZW1lbnQiLCJndWFyYW50ZWVTcmNGb3JTcmNzZXRVbnN1cHBvcnRlZEJyb3dzZXJzIiwiTGF5b3V0IiwiYXBwbHlGaWxsQ29udGVudCIsImlzTGF5b3V0U2l6ZURlZmluZWQiLCJwcm9wYWdhdGVBdHRyaWJ1dGVzIiwic2NvcGVkUXVlcnlTZWxlY3RvciIsInByb3BhZ2F0ZU9iamVjdEZpdFN0eWxlcyIsInNldEltcG9ydGFudFN0eWxlcyIsIlNlcnZpY2VzIiwicmVnaXN0ZXJFbGVtZW50IiwiQmFzZUVsZW1lbnQiLCJsaXN0ZW4iLCJkZXYiLCJUQUciLCJBVFRSSUJVVEVTX1RPX1BST1BBR0FURSIsIkFtcEltZyIsImVsZW1lbnQiLCJhbGxvd0ltZ0xvYWRGYWxsYmFja18iLCJpbWdfIiwidW5saXN0ZW5Mb2FkXyIsInVubGlzdGVuRXJyb3JfIiwic2l6ZXNXaWR0aF8iLCJtdXRhdGlvbnMiLCJhdHRycyIsImZpbHRlciIsInZhbHVlIiwidW5kZWZpbmVkIiwiaGFzQXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwicHVzaCIsInVzZXIiLCJ3YXJuIiwicHJvcGFnYXRlRGF0YXNldCIsIlIxIiwiY29tcGxldGUiLCJzZXRSZWFkeVN0YXRlIiwiTE9BRElORyIsIm9uTGF5b3V0Iiwic3JjIiwiZ2V0QXR0cmlidXRlIiwicHJlY29ubmVjdEZvciIsIndpbiIsInVybCIsImdldEFtcERvYyIsInNyY3NldCIsInNyY3NldHVybCIsImV4ZWMiLCJsYXlvdXQiLCJzZXJ2ZXJSZW5kZXJlZCIsIkltYWdlIiwic2V0QXR0cmlidXRlIiwiaWQiLCJlcnJvciIsIm1heWJlR2VuZXJhdGVTaXplc18iLCJhcHBlbmRDaGlsZCIsInN5bmMiLCJzaXplcyIsInRlc3QiLCJnZXRMYXlvdXRTaXplIiwid2lkdGgiLCJzaG91bGRTZXRTaXplc18iLCJ2aWV3cG9ydFdpZHRoIiwiZ2V0Vmlld3BvcnQiLCJnZXRXaWR0aCIsImVudHJ5IiwiZGVmYXVsdFNpemUiLCJnZXRMYXlvdXQiLCJGSVhFRCIsInJhdGlvIiwiTWF0aCIsInJvdW5kIiwibWF4IiwiZ2VuZXJhdGVkU2l6ZXMiLCJtdXRhdGVFbGVtZW50IiwibmV3V2lkdGgiLCJpbml0aWFsaXplZCIsImltZyIsImluaXRpYWxpemVfIiwiQ09NUExFVEUiLCJmaXJzdExheW91dENvbXBsZXRlZCIsImhpZGVGYWxsYmFja0ltZ18iLCJyZWFzb24iLCJFUlJPUiIsIm9uSW1nTG9hZGluZ0Vycm9yXyIsImFzc2VydEVsZW1lbnQiLCJsb2FkaW5nIiwibG9hZFByb21pc2UiLCJwbGFjZWhvbGRlciIsImdldFBsYWNlaG9sZGVyIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJ0b2dnbGVQbGFjZWhvbGRlciIsInJlbW92ZSIsInRvZ2dsZUZhbGxiYWNrIiwiYWRkIiwidGFyZ2V0RWxlbWVudCIsImtleSIsImRhdGFzZXQiLCJzdGFydHNXaXRoIiwiaW5zdGFsbEltZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFVBQVI7QUFDQSxTQUFRQyxhQUFSO0FBQ0EsU0FBUUMsd0NBQVI7QUFDQSxTQUFRQyxNQUFSLEVBQWdCQyxnQkFBaEIsRUFBa0NDLG1CQUFsQztBQUNBLFNBQVFDLG1CQUFSO0FBQ0EsU0FBUUMsbUJBQVI7QUFDQSxTQUFRQyx3QkFBUixFQUFrQ0Msa0JBQWxDO0FBRUEsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLGVBQVI7QUFFQSxTQUFRQyxXQUFSO0FBQ0EsU0FBUUMsTUFBUjtBQUNBLFNBQVFDLEdBQVI7O0FBRUE7QUFDQSxJQUFNQyxHQUFHLEdBQUcsU0FBWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBTUMsdUJBQXVCLEdBQUcsQ0FDckMsS0FEcUMs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Q3hCLGFBQU8sSUFBUDtBQUNEO0FBRUQ7O0FBWEY7QUFBQTtBQUFBLFdBWUUsdUJBQXFCO0FBQ25CLGFBQU8sSUFBUDtBQUNEO0FBRUQ7O0FBaEJGO0FBQUE7QUFBQSxXQWlCRSx3QkFBc0JoRixPQUF0QixFQUErQjtBQUM3QixVQUFNc0IsR0FBRyxHQUFHdEIsT0FBTyxDQUFDdUIsWUFBUixDQUFxQixLQUFyQixDQUFaOztBQUNBLFVBQUlELEdBQUosRUFBUztBQUNQLGVBQU8sQ0FBQ0EsR0FBRCxDQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsVUFBTU0sTUFBTSxHQUFHNUIsT0FBTyxDQUFDdUIsWUFBUixDQUFxQixRQUFyQixDQUFmOztBQUNBLFVBQUlLLE1BQUosRUFBWTtBQUNWO0FBQ0EsWUFBTUMsU0FBUyxHQUFHLE1BQU1DLElBQU4sQ0FBV0YsTUFBWCxDQUFsQjs7QUFDQTtBQUNBLFlBQUlDLFNBQUosRUFBZTtBQUNiLGlCQUFPLENBQUNBLFNBQVMsQ0FBQyxDQUFELENBQVYsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQsYUFBTyxJQUFQO0FBQ0Q7QUFyQ0g7O0FBQUE7QUFBQSxFQUE0Qm5DLFdBQTVCOztBQW9hQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU3lGLFVBQVQsQ0FBb0IxRCxHQUFwQixFQUF5QjtBQUM5QmhDLEVBQUFBLGVBQWUsQ0FBQ2dDLEdBQUQsRUFBTTVCLEdBQU4sRUFBV0UsTUFBWCxDQUFmO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtSZWFkeVN0YXRlfSBmcm9tICcjY29yZS9jb25zdGFudHMvcmVhZHktc3RhdGUnO1xuaW1wb3J0IHtyZW1vdmVFbGVtZW50fSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtndWFyYW50ZWVTcmNGb3JTcmNzZXRVbnN1cHBvcnRlZEJyb3dzZXJzfSBmcm9tICcjY29yZS9kb20vaW1nJztcbmltcG9ydCB7TGF5b3V0LCBhcHBseUZpbGxDb250ZW50LCBpc0xheW91dFNpemVEZWZpbmVkfSBmcm9tICcjY29yZS9kb20vbGF5b3V0JztcbmltcG9ydCB7cHJvcGFnYXRlQXR0cmlidXRlc30gZnJvbSAnI2NvcmUvZG9tL3Byb3BhZ2F0ZS1hdHRyaWJ1dGVzJztcbmltcG9ydCB7c2NvcGVkUXVlcnlTZWxlY3Rvcn0gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcbmltcG9ydCB7cHJvcGFnYXRlT2JqZWN0Rml0U3R5bGVzLCBzZXRJbXBvcnRhbnRTdHlsZXN9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7cmVnaXN0ZXJFbGVtZW50fSBmcm9tICcjc2VydmljZS9jdXN0b20tZWxlbWVudC1yZWdpc3RyeSc7XG5cbmltcG9ydCB7QmFzZUVsZW1lbnR9IGZyb20gJy4uLy4uL2Jhc2UtZWxlbWVudCc7XG5pbXBvcnQge2xpc3Rlbn0gZnJvbSAnLi4vLi4vZXZlbnQtaGVscGVyJztcbmltcG9ydCB7ZGV2fSBmcm9tICcuLi8uLi9sb2cnO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBUQUcgPSAnYW1wLWltZyc7XG5cbi8qKlxuICogQXR0cmlidXRlcyB0byBwcm9wYWdhdGUgdG8gaW50ZXJuYWwgaW1hZ2Ugd2hlbiBjaGFuZ2VkIGV4dGVybmFsbHkuXG4gKiBAdHlwZSB7IUFycmF5PHN0cmluZz59XG4gKi9cbmV4cG9ydCBjb25zdCBBVFRSSUJVVEVTX1RPX1BST1BBR0FURSA9IFtcbiAgJ2FsdCcsXG4gICdhcmlhLWRlc2NyaWJlZGJ5JyxcbiAgJ2FyaWEtbGFiZWwnLFxuICAnYXJpYS1sYWJlbGxlZGJ5JyxcbiAgJ2Nyb3Nzb3JpZ2luJyxcbiAgJ3JlZmVycmVycG9saWN5JyxcbiAgJ3RpdGxlJyxcbiAgJ3NpemVzJyxcbiAgJ3NyY3NldCcsXG4gICdzcmMnLFxuXTtcblxuZXhwb3J0IGNsYXNzIEFtcEltZyBleHRlbmRzIEJhc2VFbGVtZW50IHtcbiAgLyoqIEBvdmVycmlkZSBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgUjEoKSB7XG4gICAgcmV0dXJuIFIxX0lNR19ERUZFUlJFRF9CVUlMRDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIHByZXJlbmRlckFsbG93ZWQoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlIEBub2NvbGxhcHNlICovXG4gIHN0YXRpYyB1c2VzTG9hZGluZygpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIGdldFByZWNvbm5lY3RzKGVsZW1lbnQpIHtcbiAgICBjb25zdCBzcmMgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgaWYgKHNyYykge1xuICAgICAgcmV0dXJuIFtzcmNdO1xuICAgIH1cblxuICAgIC8vIE5PVEUoQHdhc3NnaGEpOiBzaW5jZSBwYXJzZVNyY3NldCBpcyBjb21wdXRhdGlvbmFsbHkgZXhwZW5zaXZlIGFuZCBjYW5cbiAgICAvLyBub3QgYmUgaW5zaWRlIHRoZSBgYnVpbGRDYWxsYmFja2AsIHdlIHdlbnQgd2l0aCBwcmVjb25uZWN0aW5nIHRvIHRoZVxuICAgIC8vIGBzcmNgIHVybCBpZiBpdCBleGlzdHMgb3IgdGhlIGZpcnN0IHNyY3NldCB1cmwuXG4gICAgY29uc3Qgc3Jjc2V0ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyY3NldCcpO1xuICAgIGlmIChzcmNzZXQpIHtcbiAgICAgIC8vIFdlIHRyeSB0byBmaW5kIHRoZSBmaXJzdCB1cmwgaW4gdGhlIHNyY3NldFxuICAgICAgY29uc3Qgc3Jjc2V0dXJsID0gL1xcUysvLmV4ZWMoc3Jjc2V0KTtcbiAgICAgIC8vIENvbm5lY3QgdG8gdGhlIGZpcnN0IHVybCBpZiBpdCBleGlzdHNcbiAgICAgIGlmIChzcmNzZXR1cmwpIHtcbiAgICAgICAgcmV0dXJuIFtzcmNzZXR1cmxbMF1dO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnQgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuYWxsb3dJbWdMb2FkRmFsbGJhY2tfID0gdHJ1ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5pbWdfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1VubGlzdGVuRGVmfSAqL1xuICAgIHRoaXMudW5saXN0ZW5Mb2FkXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9Vbmxpc3RlbkRlZn0gKi9cbiAgICB0aGlzLnVubGlzdGVuRXJyb3JfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHdpZHRoIHVzZWQgYnkgdGhlIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIHNpemVzIGF0dHJpYnV0ZVxuICAgICAqIEBwcml2YXRlIHtudW1iZXJ9XG4gICAgICogKi9cbiAgICB0aGlzLnNpemVzV2lkdGhfID0gMDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgbXV0YXRlZEF0dHJpYnV0ZXNDYWxsYmFjayhtdXRhdGlvbnMpIHtcbiAgICBpZiAodGhpcy5pbWdfKSB7XG4gICAgICBjb25zdCBhdHRycyA9IEFUVFJJQlVURVNfVE9fUFJPUEFHQVRFLmZpbHRlcihcbiAgICAgICAgKHZhbHVlKSA9PiBtdXRhdGlvbnNbdmFsdWVdICE9PSB1bmRlZmluZWRcbiAgICAgICk7XG4gICAgICAvLyBNdXRhdGluZyBzcmMgc2hvdWxkIG92ZXJyaWRlIGV4aXN0aW5nIHNyY3NldCwgc28gcmVtb3ZlIHRoZSBsYXR0ZXIuXG4gICAgICBpZiAoXG4gICAgICAgIG11dGF0aW9uc1snc3JjJ10gJiZcbiAgICAgICAgIW11dGF0aW9uc1snc3Jjc2V0J10gJiZcbiAgICAgICAgdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnc3Jjc2V0JylcbiAgICAgICkge1xuICAgICAgICAvLyBwcm9wYWdhdGVBdHRyaWJ1dGVzKCkgd2lsbCByZW1vdmUgW3NyY3NldF0gZnJvbSB0aGlzLmltZ18uXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3NyY3NldCcpO1xuICAgICAgICBhdHRycy5wdXNoKCdzcmNzZXQnKTtcblxuICAgICAgICB0aGlzLnVzZXIoKS53YXJuKFxuICAgICAgICAgIFRBRyxcbiAgICAgICAgICAnUmVtb3ZlZCBbc3Jjc2V0XSBzaW5jZSBbc3JjXSB3YXMgbXV0YXRlZC4gUmVjb21tZW5kIGFkZGluZyBhICcgK1xuICAgICAgICAgICAgJ1tzcmNzZXRdIGJpbmRpbmcgdG8gc3VwcG9ydCByZXNwb25zaXZlIGltYWdlcy4nLFxuICAgICAgICAgIHRoaXMuZWxlbWVudFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcHJvcGFnYXRlQXR0cmlidXRlcyhcbiAgICAgICAgYXR0cnMsXG4gICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgdGhpcy5pbWdfLFxuICAgICAgICAvKiBvcHRfcmVtb3ZlTWlzc2luZ0F0dHJzICovIHRydWVcbiAgICAgICk7XG4gICAgICB0aGlzLnByb3BhZ2F0ZURhdGFzZXQodGhpcy5pbWdfKTtcblxuICAgICAgaWYgKCFJU19FU00pIHtcbiAgICAgICAgZ3VhcmFudGVlU3JjRm9yU3Jjc2V0VW5zdXBwb3J0ZWRCcm93c2Vycyh0aGlzLmltZ18pO1xuICAgICAgfVxuXG4gICAgICBpZiAoQW1wSW1nLlIxKCkgJiYgIXRoaXMuaW1nXy5jb21wbGV0ZSkge1xuICAgICAgICB0aGlzLnNldFJlYWR5U3RhdGUoUmVhZHlTdGF0ZS5MT0FESU5HKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHByZWNvbm5lY3RDYWxsYmFjayhvbkxheW91dCkge1xuICAgIC8vIE5PVEUoQHdhc3NnaGEpOiBzaW5jZSBwYXJzZVNyY3NldCBpcyBjb21wdXRhdGlvbmFsbHkgZXhwZW5zaXZlIGFuZCBjYW5cbiAgICAvLyBub3QgYmUgaW5zaWRlIHRoZSBgYnVpbGRDYWxsYmFja2AsIHdlIHdlbnQgd2l0aCBwcmVjb25uZWN0aW5nIHRvIHRoZVxuICAgIC8vIGBzcmNgIHVybCBpZiBpdCBleGlzdHMgb3IgdGhlIGZpcnN0IHNyY3NldCB1cmwuXG4gICAgY29uc3Qgc3JjID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgaWYgKHNyYykge1xuICAgICAgU2VydmljZXMucHJlY29ubmVjdEZvcih0aGlzLndpbikudXJsKHRoaXMuZ2V0QW1wRG9jKCksIHNyYywgb25MYXlvdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzcmNzZXQgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmNzZXQnKTtcbiAgICAgIGlmICghc3Jjc2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFdlIHRyeSB0byBmaW5kIHRoZSBmaXJzdCB1cmwgaW4gdGhlIHNyY3NldFxuICAgICAgY29uc3Qgc3Jjc2V0dXJsID0gL1xcUysvLmV4ZWMoc3Jjc2V0KTtcbiAgICAgIC8vIENvbm5lY3QgdG8gdGhlIGZpcnN0IHVybCBpZiBpdCBleGlzdHNcbiAgICAgIGlmIChzcmNzZXR1cmwpIHtcbiAgICAgICAgU2VydmljZXMucHJlY29ubmVjdEZvcih0aGlzLndpbikudXJsKFxuICAgICAgICAgIHRoaXMuZ2V0QW1wRG9jKCksXG4gICAgICAgICAgc3Jjc2V0dXJsWzBdLFxuICAgICAgICAgIG9uTGF5b3V0XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0xheW91dFN1cHBvcnRlZChsYXlvdXQpIHtcbiAgICByZXR1cm4gaXNMYXlvdXRTaXplRGVmaW5lZChsYXlvdXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgYWN0dWFsIGltYWdlIGVsZW1lbnQgYW5kIHNldCB1cCBpbnN0YW5jZSB2YXJpYWJsZXMuXG4gICAqIENhbGxlZCBsYXppbHkgaW4gdGhlIGZpcnN0IGAjbGF5b3V0Q2FsbGJhY2tgLlxuICAgKiBAcmV0dXJuIHshSW1hZ2V9XG4gICAqL1xuICBpbml0aWFsaXplXygpIHtcbiAgICBpZiAodGhpcy5pbWdfKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbWdfO1xuICAgIH1cbiAgICAvLyBJZiB0aGlzIGFtcC1pbWcgSVMgdGhlIGZhbGxiYWNrIHRoZW4gZG9uJ3QgYWxsb3cgaXQgdG8gaGF2ZSBpdHMgb3duXG4gICAgLy8gZmFsbGJhY2sgdG8gc3RvcCBmcm9tIG5lc3RlZCBmYWxsYmFjayBhYnVzZS5cbiAgICB0aGlzLmFsbG93SW1nTG9hZEZhbGxiYWNrXyA9ICF0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdmYWxsYmFjaycpO1xuXG4gICAgLy8gRm9yIFNTUiwgaW1hZ2Ugd2lsbCBoYXZlIGJlZW4gd3JpdHRlbiBkaXJlY3RseSB0byBET00gc28gbm8gbmVlZCB0byByZWNyZWF0ZS5cbiAgICBjb25zdCBzZXJ2ZXJSZW5kZXJlZCA9IHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2ktYW1waHRtbC1zc3InKTtcbiAgICBpZiAoc2VydmVyUmVuZGVyZWQpIHtcbiAgICAgIHRoaXMuaW1nXyA9IHNjb3BlZFF1ZXJ5U2VsZWN0b3IodGhpcy5lbGVtZW50LCAnPiBpbWc6bm90KFtwbGFjZWhvbGRlcl0pJyk7XG4gICAgfVxuICAgIHRoaXMuaW1nXyA9IHRoaXMuaW1nXyB8fCBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmltZ18uc2V0QXR0cmlidXRlKCdkZWNvZGluZycsICdhc3luYycpO1xuICAgIGlmICh0aGlzLmVsZW1lbnQuaWQpIHtcbiAgICAgIHRoaXMuaW1nXy5zZXRBdHRyaWJ1dGUoJ2FtcC1pbWctaWQnLCB0aGlzLmVsZW1lbnQuaWQpO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSByb2xlPWltZyBvdGhlcndpc2UgdGhpcyBicmVha3Mgc2NyZWVuLXJlYWRlcnMgZm9jdXMgYW5kXG4gICAgLy8gb25seSByZWFkIFwiR3JhcGhpY1wiIHdoZW4gdXNpbmcgb25seSAnYWx0Jy5cbiAgICBpZiAodGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgncm9sZScpID09ICdpbWcnKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdyb2xlJyk7XG4gICAgICB0aGlzLnVzZXIoKS5lcnJvcihcbiAgICAgICAgVEFHLFxuICAgICAgICAnU2V0dGluZyByb2xlPWltZyBvbiBhbXAtaW1nIGVsZW1lbnRzIGJyZWFrcyAnICtcbiAgICAgICAgICAnc2NyZWVuIHJlYWRlcnMgcGxlYXNlIGp1c3Qgc2V0IGFsdCBvciBBUklBIGF0dHJpYnV0ZXMsIHRoZXkgd2lsbCAnICtcbiAgICAgICAgICAnYmUgY29ycmVjdGx5IHByb3BhZ2F0ZWQgZm9yIHRoZSB1bmRlcmx5aW5nIDxpbWc+IGVsZW1lbnQuJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBJdCBpcyBpbXBvcnRhbnQgdG8gY2FsbCB0aGlzIGJlZm9yZSBzZXR0aW5nIGBzcmNzZXRgIGF0dHJpYnV0ZS5cbiAgICB0aGlzLm1heWJlR2VuZXJhdGVTaXplc18oLyogc3luYyBzZXRBdHRyaWJ1dGUgKi8gdHJ1ZSk7XG4gICAgcHJvcGFnYXRlQXR0cmlidXRlcyhBVFRSSUJVVEVTX1RPX1BST1BBR0FURSwgdGhpcy5lbGVtZW50LCB0aGlzLmltZ18pO1xuICAgIHRoaXMucHJvcGFnYXRlRGF0YXNldCh0aGlzLmltZ18pO1xuICAgIGlmICghSVNfRVNNKSB7XG4gICAgICBndWFyYW50ZWVTcmNGb3JTcmNzZXRVbnN1cHBvcnRlZEJyb3dzZXJzKHRoaXMuaW1nXyk7XG4gICAgfVxuICAgIGFwcGx5RmlsbENvbnRlbnQodGhpcy5pbWdfLCB0cnVlKTtcbiAgICBwcm9wYWdhdGVPYmplY3RGaXRTdHlsZXModGhpcy5lbGVtZW50LCB0aGlzLmltZ18pO1xuXG4gICAgaWYgKCFzZXJ2ZXJSZW5kZXJlZCkge1xuICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuaW1nXyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmltZ187XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlcyBzaXplcyBmb3IgYW1wLWltZ3Mgd2l0aG91dFxuICAgKiB0aGUgc2l6ZXMgYXR0cmlidXRlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN5bmMgV2hldGhlciB0byBpbW1lZGlhdGVseSBtYWtlIHRoZSBjaGFuZ2Ugb3Igc2NoZWR1bGVcbiAgICogICAgIHZpYSBtdXRhdGVFbGVtZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWF5YmVHZW5lcmF0ZVNpemVzXyhzeW5jKSB7XG4gICAgaWYgKFIxX0lNR19ERUZFUlJFRF9CVUlMRCkge1xuICAgICAgLy8gVGhlIGBnZXRMYXlvdXRTaXplKClgIGlzIG5vdCBhdmFpbGFibGUgZm9yIGEgUjEgZWxlbWVudC4gU2tpcCB0aGlzXG4gICAgICAvLyBjb2RlcGF0aC4gQWxzbzogaXMgdGhpcyBmZWF0dXJlIGF0IGFsbCB1c2VmdWw/IEUuZy4gaXQgZG9lc24ndCBldmVuXG4gICAgICAvLyBleGVjdXRlIGluIHRoZSBgaS1hbXBodG1sLXNzcmAgbW9kZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmltZ18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gSWYgdGhlIGltYWdlIGlzIHNlcnZlciByZW5kZXJlZCwgZG8gbm90IGdlbmVyYXRlIHNpemVzLlxuICAgIGlmICh0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdpLWFtcGh0bWwtc3NyJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gTm8gbmVlZCB0byBnZW5lcmF0ZSBzaXplcyBpZiBhbHJlYWR5IHByZXNlbnQuXG4gICAgY29uc3Qgc2l6ZXMgPVxuICAgICAgdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnc2l6ZXMnKSB8fCB0aGlzLmltZ18uaGFzQXR0cmlidXRlKCdzaXplcycpO1xuICAgIGlmIChzaXplcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBTaXplcyBpcyB1c2VsZXNzIHdpdGhvdXQgdGhlIHNyY3NldCBhdHRyaWJ1dGUgb3IgaWYgdGhlIHNyY3NldFxuICAgIC8vIGF0dHJpYnV0ZSB1c2VzIHRoZSB4IGRlc2NyaXB0b3IuXG4gICAgY29uc3Qgc3Jjc2V0ID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnc3Jjc2V0Jyk7XG4gICAgaWYgKCFzcmNzZXQgfHwgL1swLTldK3goPzosfCQpLy50ZXN0KHNyY3NldCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7d2lkdGh9ID0gdGhpcy5lbGVtZW50LmdldExheW91dFNpemUoKTtcbiAgICBpZiAoIXRoaXMuc2hvdWxkU2V0U2l6ZXNfKHdpZHRoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHZpZXdwb3J0V2lkdGggPSB0aGlzLmdldFZpZXdwb3J0KCkuZ2V0V2lkdGgoKTtcblxuICAgIGNvbnN0IGVudHJ5ID0gYChtYXgtd2lkdGg6ICR7dmlld3BvcnRXaWR0aH1weCkgJHt3aWR0aH1weCwgYDtcbiAgICBsZXQgZGVmYXVsdFNpemUgPSB3aWR0aCArICdweCc7XG5cbiAgICBpZiAodGhpcy5nZXRMYXlvdXQoKSAhPT0gTGF5b3V0LkZJWEVEKSB7XG4gICAgICBjb25zdCByYXRpbyA9IE1hdGgucm91bmQoKHdpZHRoICogMTAwKSAvIHZpZXdwb3J0V2lkdGgpO1xuICAgICAgZGVmYXVsdFNpemUgPSBNYXRoLm1heChyYXRpbywgMTAwKSArICd2dyc7XG4gICAgfVxuXG4gICAgY29uc3QgZ2VuZXJhdGVkU2l6ZXMgPSBlbnRyeSArIGRlZmF1bHRTaXplO1xuXG4gICAgaWYgKHN5bmMpIHtcbiAgICAgIHRoaXMuaW1nXy5zZXRBdHRyaWJ1dGUoJ3NpemVzJywgZ2VuZXJhdGVkU2l6ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLmltZ18uc2V0QXR0cmlidXRlKCdzaXplcycsIGdlbmVyYXRlZFNpemVzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLnNpemVzV2lkdGhfID0gd2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld1dpZHRoXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzaG91bGRTZXRTaXplc18obmV3V2lkdGgpIHtcbiAgICBpZiAoIXRoaXMuaW1nXy5oYXNBdHRyaWJ1dGUoJ3NpemVzJykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gbmV3V2lkdGggPiB0aGlzLnNpemVzV2lkdGhfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICByZWNvbnN0cnVjdFdoZW5SZXBhcmVudGVkKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgbW91bnRDYWxsYmFjaygpIHtcbiAgICBjb25zdCBpbml0aWFsaXplZCA9ICEhdGhpcy5pbWdfO1xuICAgIGNvbnN0IGltZyA9IHRoaXMuaW5pdGlhbGl6ZV8oKTtcbiAgICBpZiAoIWluaXRpYWxpemVkKSB7XG4gICAgICBsaXN0ZW4oaW1nLCAnbG9hZCcsICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRSZWFkeVN0YXRlKFJlYWR5U3RhdGUuQ09NUExFVEUpO1xuICAgICAgICB0aGlzLmZpcnN0TGF5b3V0Q29tcGxldGVkKCk7XG4gICAgICAgIHRoaXMuaGlkZUZhbGxiYWNrSW1nXygpO1xuICAgICAgfSk7XG4gICAgICBsaXN0ZW4oaW1nLCAnZXJyb3InLCAocmVhc29uKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0UmVhZHlTdGF0ZShSZWFkeVN0YXRlLkVSUk9SLCByZWFzb24pO1xuICAgICAgICB0aGlzLm9uSW1nTG9hZGluZ0Vycm9yXygpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChpbWcuY29tcGxldGUpIHtcbiAgICAgIHRoaXMuc2V0UmVhZHlTdGF0ZShSZWFkeVN0YXRlLkNPTVBMRVRFKTtcbiAgICAgIHRoaXMuZmlyc3RMYXlvdXRDb21wbGV0ZWQoKTtcbiAgICAgIHRoaXMuaGlkZUZhbGxiYWNrSW1nXygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldFJlYWR5U3RhdGUoUmVhZHlTdGF0ZS5MT0FESU5HKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHVubW91bnRDYWxsYmFjaygpIHtcbiAgICAvLyBJbnRlcnJ1cHQgcmV0cmlldmFsIG9mIGluY29tcGxldGUgaW1hZ2VzIHRvIGZyZWUgbmV0d29yayByZXNvdXJjZXMgd2hlblxuICAgIC8vIG5hdmlnYXRpbmcgcGFnZXMgaW4gYSBQV0EuIE9wdCBmb3IgdGlueSBkYXRhVVJJIGltYWdlIGluc3RlYWQgb2YgZW1wdHlcbiAgICAvLyBzcmMgdG8gcHJldmVudCB0aGUgdmlld2VyIGZyb20gZGV0ZWN0aW5nIGEgbG9hZCBlcnJvci5cbiAgICBjb25zdCBpbWcgPSB0aGlzLmltZ187XG4gICAgaWYgKGltZyAmJiAhaW1nLmNvbXBsZXRlKSB7XG4gICAgICBpbWcuc3JjID1cbiAgICAgICAgJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBSUFBQVAvLy93QUFBQ3dBQUFBQUFRQUJBQUFDQWtRQkFEcz0nO1xuICAgICAgcmVtb3ZlRWxlbWVudChpbWcpO1xuICAgICAgdGhpcy5pbWdfID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGVuc3VyZUxvYWRlZCgpIHtcbiAgICBjb25zdCBpbWcgPSBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMuaW1nXyk7XG4gICAgaW1nLmxvYWRpbmcgPSAnZWFnZXInO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsYXlvdXRDYWxsYmFjaygpIHtcbiAgICB0aGlzLmluaXRpYWxpemVfKCk7XG4gICAgY29uc3QgaW1nID0gZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmltZ18pO1xuICAgIHRoaXMudW5saXN0ZW5Mb2FkXyA9IGxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4gdGhpcy5oaWRlRmFsbGJhY2tJbWdfKCkpO1xuICAgIHRoaXMudW5saXN0ZW5FcnJvcl8gPSBsaXN0ZW4oaW1nLCAnZXJyb3InLCAoKSA9PiB0aGlzLm9uSW1nTG9hZGluZ0Vycm9yXygpKTtcbiAgICBjb25zdCB7d2lkdGh9ID0gdGhpcy5lbGVtZW50LmdldExheW91dFNpemUoKTtcbiAgICBpZiAod2lkdGggPD0gMCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sb2FkUHJvbWlzZShpbWcpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB1bmxheW91dENhbGxiYWNrKCkge1xuICAgIGlmIChBbXBJbWcuUjEoKSkge1xuICAgICAgLy8gVE9ETygjMzE5MTUpOiBSZWNvbnNpZGVyIGlmIHRoaXMgaXMgc3RpbGwgZGVzaXJlZCBmb3IgUjEuIFRoaXMgaGVscHNcbiAgICAgIC8vIHdpdGggbmV0d29yayBpbnRlcnJ1cHRpb24gd2hlbiBhIGRvY3VtZW50IGlzIGluYWN0aXZhdGVkLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnVubGlzdGVuRXJyb3JfKSB7XG4gICAgICB0aGlzLnVubGlzdGVuRXJyb3JfKCk7XG4gICAgICB0aGlzLnVubGlzdGVuRXJyb3JfID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMudW5saXN0ZW5Mb2FkXykge1xuICAgICAgdGhpcy51bmxpc3RlbkxvYWRfKCk7XG4gICAgICB0aGlzLnVubGlzdGVuTG9hZF8gPSBudWxsO1xuICAgIH1cblxuICAgIC8vIEludGVycnVwdCByZXRyaWV2YWwgb2YgaW5jb21wbGV0ZSBpbWFnZXMgdG8gZnJlZSBuZXR3b3JrIHJlc291cmNlcyB3aGVuXG4gICAgLy8gbmF2aWdhdGluZyBwYWdlcyBpbiBhIFBXQS4gT3B0IGZvciB0aW55IGRhdGFVUkkgaW1hZ2UgaW5zdGVhZCBvZiBlbXB0eVxuICAgIC8vIHNyYyB0byBwcmV2ZW50IHRoZSB2aWV3ZXIgZnJvbSBkZXRlY3RpbmcgYSBsb2FkIGVycm9yLlxuICAgIGNvbnN0IGltZyA9IHRoaXMuaW1nXztcbiAgICBpZiAoaW1nICYmICFpbWcuY29tcGxldGUpIHtcbiAgICAgIGltZy5zcmMgPVxuICAgICAgICAnZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFJQUFBUC8vL3dBQUFDd0FBQUFBQVFBQkFBQUNBa1FCQURzPSc7XG4gICAgICByZW1vdmVFbGVtZW50KGltZyk7XG4gICAgICB0aGlzLmltZ18gPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBmaXJzdExheW91dENvbXBsZXRlZCgpIHtcbiAgICBjb25zdCBwbGFjZWhvbGRlciA9IHRoaXMuZ2V0UGxhY2Vob2xkZXIoKTtcbiAgICBpZiAoXG4gICAgICBwbGFjZWhvbGRlciAmJlxuICAgICAgcGxhY2Vob2xkZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdpLWFtcGh0bWwtYmx1cnJ5LXBsYWNlaG9sZGVyJylcbiAgICApIHtcbiAgICAgIHNldEltcG9ydGFudFN0eWxlcyhwbGFjZWhvbGRlciwgeydvcGFjaXR5JzogMH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRvZ2dsZVBsYWNlaG9sZGVyKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhpZGVGYWxsYmFja0ltZ18oKSB7XG4gICAgaWYgKFxuICAgICAgIXRoaXMuYWxsb3dJbWdMb2FkRmFsbGJhY2tfICYmXG4gICAgICB0aGlzLmltZ18uY2xhc3NMaXN0LmNvbnRhaW5zKCdpLWFtcGh0bWwtZ2hvc3QnKVxuICAgICkge1xuICAgICAgdGhpcy5pbWdfLmNsYXNzTGlzdC5yZW1vdmUoJ2ktYW1waHRtbC1naG9zdCcpO1xuICAgICAgdGhpcy50b2dnbGVGYWxsYmFjayhmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSBpbWFnZSBmYWlscyB0byBsb2FkLCBzaG93IGEgZmFsbGJhY2sgb3IgcGxhY2Vob2xkZXIgaW5zdGVhZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uSW1nTG9hZGluZ0Vycm9yXygpIHtcbiAgICBpZiAodGhpcy5hbGxvd0ltZ0xvYWRGYWxsYmFja18pIHtcbiAgICAgIHRoaXMuaW1nXy5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtZ2hvc3QnKTtcbiAgICAgIHRoaXMudG9nZ2xlRmFsbGJhY2sodHJ1ZSk7XG4gICAgICAvLyBIaWRlIHBsYWNlaG9sZGVycywgYXMgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHdlYnBcbiAgICAgIC8vIFdvdWxkIHNob3cgdGhlIHBsYWNlaG9sZGVyIHVuZGVybmVhdGggYSB0cmFuc3BhcmVudCBmYWxsYmFja1xuICAgICAgdGhpcy50b2dnbGVQbGFjZWhvbGRlcihmYWxzZSk7XG4gICAgICB0aGlzLmFsbG93SW1nTG9hZEZhbGxiYWNrXyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IG1ldGhvZCB0byBwcm9wYWdhdGUgZGF0YSBhdHRyaWJ1dGVzIGZyb20gdGhpcyBlbGVtZW50XG4gICAqIHRvIHRoZSB0YXJnZXQgZWxlbWVudC4gKEZvciB1c2Ugd2l0aCBhcmJpdHJhcnkgZGF0YSBhdHRyaWJ1dGVzLilcbiAgICogUmVtb3ZlcyBhbnkgZGF0YSBhdHRyaWJ1dGVzIHRoYXQgYXJlIG1pc3Npbmcgb24gdGhpcyBlbGVtZW50IGZyb21cbiAgICogdGhlIHRhcmdldCBlbGVtZW50LlxuICAgKiBBTVAgQmluZCBhdHRyaWJ1dGVzIGFyZSBleGNsdWRlZC5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgKi9cbiAgcHJvcGFnYXRlRGF0YXNldCh0YXJnZXRFbGVtZW50KSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gdGFyZ2V0RWxlbWVudC5kYXRhc2V0KSB7XG4gICAgICBpZiAoIShrZXkgaW4gdGhpcy5lbGVtZW50LmRhdGFzZXQpKSB7XG4gICAgICAgIGRlbGV0ZSB0YXJnZXRFbGVtZW50LmRhdGFzZXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmVsZW1lbnQuZGF0YXNldCkge1xuICAgICAgaWYgKGtleS5zdGFydHNXaXRoKCdhbXBCaW5kJykgJiYga2V5ICE9PSAnYW1wQmluZCcpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAodGFyZ2V0RWxlbWVudC5kYXRhc2V0W2tleV0gIT09IHRoaXMuZWxlbWVudC5kYXRhc2V0W2tleV0pIHtcbiAgICAgICAgdGFyZ2V0RWxlbWVudC5kYXRhc2V0W2tleV0gPSB0aGlzLmVsZW1lbnQuZGF0YXNldFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luIERlc3RpbmF0aW9uIHdpbmRvdyBmb3IgdGhlIG5ldyBlbGVtZW50LlxuICogQHRoaXMge3VuZGVmaW5lZH0gIC8vIE1ha2UgbGludGVyIGhhcHB5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsSW1nKHdpbikge1xuICByZWdpc3RlckVsZW1lbnQod2luLCBUQUcsIEFtcEltZyk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/builtins/amp-img/amp-img.js