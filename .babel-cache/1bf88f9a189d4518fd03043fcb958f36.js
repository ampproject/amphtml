function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}import { resolvedPromise as _resolvedPromise } from "./../../core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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
export var ATTRIBUTES_TO_PROPAGATE = [
'alt',
'aria-describedby',
'aria-label',
'aria-labelledby',
'crossorigin',
'referrerpolicy',
'title',
'sizes',
'srcset',
'src'];


export var AmpImg = /*#__PURE__*/function (_BaseElement) {_inherits(AmpImg, _BaseElement);var _super = _createSuper(AmpImg);






































  /** @param {!AmpElement} element */
  function AmpImg(element) {var _this;_classCallCheck(this, AmpImg);
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
    _this.sizesWidth_ = 0;return _this;
  }

  /** @override */_createClass(AmpImg, [{ key: "mutatedAttributesCallback", value:
    function mutatedAttributesCallback(mutations) {
      if (this.img_) {
        var attrs = ATTRIBUTES_TO_PROPAGATE.filter(
        function (value) {return mutations[value] !== undefined;});

        // Mutating src should override existing srcset, so remove the latter.
        if (
        mutations['src'] &&
        !mutations['srcset'] &&
        this.element.hasAttribute('srcset'))
        {
          // propagateAttributes() will remove [srcset] from this.img_.
          this.element.removeAttribute('srcset');
          attrs.push('srcset');

          this.user().warn(
          TAG,
          'Removed [srcset] since [src] was mutated. Recommend adding a ' +
          '[srcset] binding to support responsive images.',
          this.element);

        }
        propagateAttributes(
        attrs,
        this.element,
        this.img_,
        /* opt_removeMissingAttrs */true);

        this.propagateDataset(this.img_);

        if (!false) {
          guaranteeSrcForSrcsetUnsupportedBrowsers(this.img_);
        }

        if (AmpImg.R1() && !this.img_.complete) {
          this.setReadyState(ReadyState.LOADING);
        }
      }
    }

    /** @override */ }, { key: "preconnectCallback", value:
    function preconnectCallback(onLayout) {
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
          Services.preconnectFor(this.win).url(
          this.getAmpDoc(),
          srcseturl[0],
          onLayout);

        }
      }
    }

    /** @override */ }, { key: "isLayoutSupported", value:
    function isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /**
     * Create the actual image element and set up instance variables.
     * Called lazily in the first `#layoutCallback`.
     * @return {!Image}
     */ }, { key: "initialize_", value:
    function initialize_() {
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
        this.user().error(
        TAG,
        'Setting role=img on amp-img elements breaks ' +
        'screen readers please just set alt or ARIA attributes, they will ' +
        'be correctly propagated for the underlying <img> element.');

      }

      // It is important to call this before setting `srcset` attribute.
      this.maybeGenerateSizes_( /* sync setAttribute */true);
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
     */ }, { key: "maybeGenerateSizes_", value:
    function maybeGenerateSizes_(sync) {var _this2 = this;
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
      var sizes =
      this.element.hasAttribute('sizes') || this.img_.hasAttribute('sizes');
      if (sizes) {
        return;
      }
      // Sizes is useless without the srcset attribute or if the srcset
      // attribute uses the x descriptor.
      var srcset = this.element.getAttribute('srcset');
      if (!srcset || /[0-9]+x(?:,|$)/.test(srcset)) {
        return;
      }

      var _this$element$getLayo = this.element.getLayoutSize(),width = _this$element$getLayo.width;
      if (!this.shouldSetSizes_(width)) {
        return;
      }

      var viewportWidth = this.getViewport().getWidth();

      var entry = "(max-width: ".concat(viewportWidth, "px) ").concat(width, "px, ");
      var defaultSize = width + 'px';

      if (this.getLayout() !== Layout.FIXED) {
        var ratio = Math.round((width * 100) / viewportWidth);
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
     */ }, { key: "shouldSetSizes_", value:
    function shouldSetSizes_(newWidth) {
      if (!this.img_.hasAttribute('sizes')) {
        return true;
      }
      return newWidth > this.sizesWidth_;
    }

    /** @override */ }, { key: "reconstructWhenReparented", value:
    function reconstructWhenReparented() {
      return false;
    }

    /** @override */ }, { key: "mountCallback", value:
    function mountCallback() {var _this3 = this;
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

    /** @override */ }, { key: "unmountCallback", value:
    function unmountCallback() {
      // Interrupt retrieval of incomplete images to free network resources when
      // navigating pages in a PWA. Opt for tiny dataURI image instead of empty
      // src to prevent the viewer from detecting a load error.
      var img = this.img_;
      if (img && !img.complete) {
        img.src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
        removeElement(img);
        this.img_ = null;
      }
    }

    /** @override */ }, { key: "ensureLoaded", value:
    function ensureLoaded() {
      var img = /** @type {!Element} */(this.img_);
      img.loading = 'eager';
    }

    /** @override */ }, { key: "layoutCallback", value:
    function layoutCallback() {var _this4 = this;
      this.initialize_();
      var img = /** @type {!Element} */(this.img_);
      this.unlistenLoad_ = listen(img, 'load', function () {return _this4.hideFallbackImg_();});
      this.unlistenError_ = listen(img, 'error', function () {return _this4.onImgLoadingError_();});
      var _this$element$getLayo2 = this.element.getLayoutSize(),width = _this$element$getLayo2.width;
      if (width <= 0) {
        return _resolvedPromise();
      }
      return this.loadPromise(img);
    }

    /** @override */ }, { key: "unlayoutCallback", value:
    function unlayoutCallback() {
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
        img.src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
        removeElement(img);
        this.img_ = null;
      }

      return true;
    }

    /** @override */ }, { key: "firstLayoutCompleted", value:
    function firstLayoutCompleted() {
      var placeholder = this.getPlaceholder();
      if (
      placeholder &&
      placeholder.classList.contains('i-amphtml-blurry-placeholder'))
      {
        setImportantStyles(placeholder, { 'opacity': 0 });
      } else {
        this.togglePlaceholder(false);
      }
    }

    /**
     * @private
     */ }, { key: "hideFallbackImg_", value:
    function hideFallbackImg_() {
      if (
      !this.allowImgLoadFallback_ &&
      this.img_.classList.contains('i-amphtml-ghost'))
      {
        this.img_.classList.remove('i-amphtml-ghost');
        this.toggleFallback(false);
      }
    }

    /**
     * If the image fails to load, show a fallback or placeholder instead.
     * @private
     */ }, { key: "onImgLoadingError_", value:
    function onImgLoadingError_() {
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
     */ }, { key: "propagateDataset", value:
    function propagateDataset(targetElement) {
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
    } }], [{ key: "R1", value: /** @override @nocollapse */function R1() {return false;} /** @override @nocollapse */ }, { key: "prerenderAllowed", value: function prerenderAllowed() {return true;} /** @override @nocollapse */ }, { key: "usesLoading", value: function usesLoading() {return true;} /** @override @nocollapse */ }, { key: "getPreconnects", value: function getPreconnects(element) {var src = element.getAttribute('src');if (src) {return [src];} // NOTE(@wassgha): since parseSrcset is computationally expensive and can
      // not be inside the `buildCallback`, we went with preconnecting to the
      // `src` url if it exists or the first srcset url.
      var srcset = element.getAttribute('srcset');if (srcset) {// We try to find the first url in the srcset
        var srcseturl = /\S+/.exec(srcset); // Connect to the first url if it exists
        if (srcseturl) {return [srcseturl[0]];}}return null;} }]);return AmpImg;}(BaseElement); /**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 */export function installImg(win) {registerElement(win, TAG, AmpImg);
}
// /Users/mszylkowski/src/amphtml/src/builtins/amp-img/amp-img.js