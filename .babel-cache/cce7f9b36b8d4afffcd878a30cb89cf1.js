var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { CSS } from "../../../build/amp-loader-0.1.css";
import { Services } from "../../../src/service";
import { htmlFor } from "../../../src/core/dom/static-template";
import { installStylesForDoc } from "../../../src/style-installer";
import { isIframeVideoPlayerComponent } from "../../../src/core/dom/layout";
import { setImportantStyles, setStyle } from "../../../src/core/dom/style";

/**
 * @fileoverview This file implements the new AMP loader as an extension. This
 *    allows loading the runtime without incurring the cost of the loader code.
 *    The loader has a 600ms delay before appearing. This delay is offset by
 *    the amount of time it took to load the extension.
 */
// How long before the loader appears, in milliseconds. This matches the
// minimum animation delay specified in the CSS.
var LOADER_APPEAR_TIME = 600;

/**
 * Elements will get a default gray background if they don't already have a
 * placeholder. This list does not include video players which are detected
 * using `isIframeVideoPlayerComponent`
 * @enum {boolean}
 * @private  Visible for testing only!
 */
var LOADER_BACKGROUND_TAGS = {
  'AMP-IMG': true,
  'AMP-ANIM': true,
  'AMP-PINTEREST': true,
  'AMP-INSTAGRAM': true,
  'AMP-GOOGLE-DOCUMENT-EMBED': true
};

/**
 * Used to cache the loader DOM once created, so we do not need to recreate it
 * each time.
 * @type {?Element}
 */
var loaderDom = null;

/**
 * @param {function(!Array<string>):!Element} html
 * @return {!Element}
 */
function createSpinnerDom(html) {
  // Extra wrapping div here is to workaround:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1002748
  // eslint-disable max-len
  var content = html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-new-loader-spinner-wrapper\">\n      <svg class=\"i-amphtml-new-loader-spinner\" viewBox=\"0 0 48 48\">\n        <path\n          class=\"i-amphtml-new-loader-spinner-path\"\n          fill=\"none\"\n          d=\"M24 2a22 22 0 10.01 0m33.27 5.65a22 22 0 102.74-2.1m46.13 1.35a22 22 0 105.96-3.44m42.96 2.74a22 22 0 109.49-3.93m39.46 3.28a22 22 0 1013.13-3.52M253 4.95a22 22 0 1016.69-2.2m32.32 1.65a22 22 0 1019.98 0m29.06-.5a22 22 0 1022.79 3m26.28-3.44a22 22 0 1024.98 6.69m24.1-7.07a22 22 0 1026.4 10.94m22.71-11.27a22 22 0 1026.94 15.56m22.18-15.83a22 22 0 1026.54 20.37m22.59-20.58a22 22 0 1025.17 25.17M645.7 2.12a22 22 0 1022.84 29.76m26.31-29.85a22 22 0 1019.6 33.95M744 2a22 22 0 1015.56 37.56m33.59-37.53a22 22 0 1010.83 40.42M842.3 2.12a22 22 0 105.58 42.42m43.56-42.27a22 22 0 100 43.46m49.13-43.25a22 22 0 10-5.73 43.49m54.85-43.22a22 22 0 10-11.39 42.5m60.5-42.17a22 22 0 00-16.79 40.53m65.87-40.15a22 22 0 00-21.73 37.64m70.8-37.2a22 22 0 00-26.05 33.94m75.09-33.44a22 22 0 00-29.59 29.59M1235 4.95a22 22 0 00-32.25 24.75m81.23-24.15a22 22 0 00-33.95 19.6m82.9-18.95a22 22 0 00-34.66 14.36m83.58-13.66a22 22 0 00-34.38 9.21m83.25-8.46a22 22 0 00-33.17 4.37m82.01-3.58a22 22 0 00-31.11 0m81.35 2.63a22 22 0 00-32.52-3.42m82.32 6.36a22 22 0 00-33.45-7.11m82.77 10.3a22 22 0 00-33.85-11m82.66 14.36a22 22 0 00-33.71-15.01M1726 24a22 22 0 00-33-19.05m80.73 22.49a22 22 0 00-31.72-23.04m78.91 26.4a22 22 0 00-29.87-26.9m76.55 30.09a22 22 0 00-27.49-30.53m73.69 33.47a22 22 0 00-24.6-33.85m70.36 36.48a22 22 0 00-21.25-36.81m66.62 39.05a22 22 0 00-17.51-39.32m62.57 41.12a22 22 0 00-13.43-41.33m58.24 42.65a22 22 0 00-9.1-42.8m53.74 43.61a22 22 0 00-4.59-43.7M2184 46a22 22 0 100-44m44.56 43.73a22 22 0 104.59-43.7m40.05 42.89a22 22 0 109.1-42.8m35.71 41.48a22 22 0 1013.43-41.33m31.63 39.53a22 22 0 1017.51-39.32m27.86 37.08a22 22 0 1021.25-36.81m24.51 34.18a22 22 0 1024.6-33.85m21.6 30.91a22 22 0 1027.49-30.53m19.19 27.34a22 22 0 1029.87-26.9m17.32 23.54a22 22 0 1031.72-23.04M2642 24a22 22 0 1033-19.05m15.27 15.61a22 22 0 1033.71-15.01m15.1 11.65a22 22 0 1033.85-11m15.47 7.81a22 22 0 1033.45-7.11m16.35 4.17a22 22 0 1032.52-3.42m17.72.79a22 22 0 1031.11 0m17.73-.79a22 22 0 1032.52 3.42m16.35-4.17a22 22 0 1033.45 7.11m15.47-7.81a22 22 0 1033.85 11m15.1-11.65a22 22 0 1033.71 15.01M3133 4.95A22 22 0 103166 24m16.01-19.6a22 22 0 1031.72 23.04m17.32-23.54a22 22 0 1029.87 26.9m19.2-27.34a22 22 0 1027.49 30.53m21.59-30.91a22 22 0 1024.6 33.85m24.51-34.18a22 22 0 1021.25 36.81m27.87-37.08a22 22 0 1017.51 39.32m31.62-39.53a22 22 0 1013.43 41.33m35.71-41.48a22 22 0 109.1 42.8m40.05-42.89a22 22 0 104.59 43.7M3624 2a22 22 0 100 44m49.15-43.97a22 22 0 00-4.59 43.7m53.74-43.61a22 22 0 00-9.1 42.8m58.24-42.65a22 22 0 00-13.43 41.33m62.56-41.12a22 22 0 00-17.51 39.32m66.63-39.05a22 22 0 00-21.25 36.81m70.36-36.48a22 22 0 00-24.6 33.85m73.68-33.47a22 22 0 00-27.49 30.53m76.56-30.09a22 22 0 00-29.87 26.9m78.91-26.4a22 22 0 00-31.72 23.04M4115 4.95A22 22 0 004082 24m81.98-18.45a22 22 0 00-33.71 15.01m82.66-14.36a22 22 0 00-33.85 11m82.77-10.3a22 22 0 00-33.45 7.11m82.32-6.36a22 22 0 00-32.52 3.42\"\n        ></path>\n      </svg>\n    </div>\n  "])));
  // eslint-enable max-len
  return content;
}

/**
 * @param {!AmpElement} element Used to get a document to build HTML with.
 * @return {!Element} The loader DOM.
 */
function getLoaderDom(element) {
  if (!loaderDom) {
    var html = htmlFor(element);

    /*
     * The outer div here is needed for two reasons:
     * 1. Applying a background color when there is no placeholder.
     * 2. Backwards compatibility with the existing method and documentation
     *    for customizing loaders, which includes a style to hide the old three
     *    dots via:
     *    ```
     *    .my-custom-loader .amp-active > div {
     *     display: none;
     *    }
     *    ```
     */
    loaderDom = html(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-new-loader\">\n        <div class=\"i-amphtml-new-loader-shim\"></div>\n        <div class=\"i-amphtml-new-loader-logo\"></div>\n      </div>\n    "])));
    loaderDom.appendChild(createSpinnerDom(html));
  }

  return loaderDom.cloneNode(true);
}

/**
 * Helper class to build the new loader's DOM.
 */
var LoaderBuilder = /*#__PURE__*/function () {
  /**
   * @param {!AmpElement} element
   * @param {!Element} domRoot
   * @param {number} elementWidth
   * @param {number} elementHeight
   */
  function LoaderBuilder(element, domRoot, elementWidth, elementHeight) {
    _classCallCheck(this, LoaderBuilder);

    /** @private @const {!AmpElement} */
    this.element_ = element;

    /** @private @const {?Element} */
    this.domRoot_ = domRoot;

    /** @private @const  {number} */
    this.layoutWidth_ = elementWidth;

    /** @private @const  {number} */
    this.layoutHeight_ = elementHeight;

    /** @private {?Element} */
    this.loaderRoot_ = null;
  }

  /**
   * Builds the loader's DOM.
   */
  _createClass(LoaderBuilder, [{
    key: "build",
    value: function build() {
      this.loaderRoot_ = getLoaderDom(this.element_);
      this.domRoot_.appendChild(this.loaderRoot_);
      this.maybeAddLoadingBackground_();
      this.maybeAddLoaderAnimation_();
    }
    /**
     * Adds a combination of spinner/logo if element is eligible based on
     * certain heuristics.
     */

  }, {
    key: "maybeAddLoaderAnimation_",
    value: function maybeAddLoaderAnimation_() {
      // If very small or already has image placeholder, no loader animation.
      if (this.isTiny_() || this.hasBlurryImagePlaceholder_()) {
        return;
      }

      this.setSize_();

      if (this.requiresBackgroundShim_()) {
        this.loaderRoot_.classList.add('i-amphtml-new-loader-has-shim');
      }

      this.addLogo_();
    }
    /**
     * Sets the size of the loader based element's size and a few special cases.
     * @private
     * @return {undefined}
     */

  }, {
    key: "setSize_",
    value: function setSize_() {
      var sizeClassDefault = 'i-amphtml-new-loader-size-default';
      var sizeClassSmall = 'i-amphtml-new-loader-size-small';
      var sizeClassLarge = 'i-amphtml-new-loader-size-large';

      // Ads always get the default spinner regardless of the element size
      if (this.isAd_()) {
        return this.loaderRoot_.classList.add(sizeClassDefault);
      }

      // Other than Ads, small spinner is always used if element is small.
      if (this.isSmall_()) {
        return this.loaderRoot_.classList.add(sizeClassSmall);
      }

      // If host is not small, default size spinner is normally used
      // unless due to branding guidelines (e.g. Instagram) a larger spinner is
      // required.
      if (this.requiresLargeSpinner_()) {
        return this.loaderRoot_.classList.add(sizeClassLarge);
      }

      return this.loaderRoot_.classList.add(sizeClassDefault);
    }
    /**
     * Adds the spinner.
     * @private
     */

  }, {
    key: "addLogo_",
    value: function addLogo_() {
      var _this$getCustomLogo_ = this.getCustomLogo_(),
          color = _this$getCustomLogo_.color,
          _this$getCustomLogo_$ = _this$getCustomLogo_.content,
          content = _this$getCustomLogo_$ === void 0 ? this.getDefaultLogo_() : _this$getCustomLogo_$;

      this.loaderRoot_.querySelector('.i-amphtml-new-loader-logo').appendChild(content);

      if (color) {
        setStyle(this.loaderRoot_, 'color', color);
      }
    }
    /**
     * @return {boolean} True if the currently loading element has background
     * content via a placeholder or poster.
     * @private
     */

  }, {
    key: "hasBackgroundContent_",
    value: function hasBackgroundContent_() {
      var hasPlaceholder = !!this.element_.getPlaceholder();
      var hasPoster = this.element_.hasAttribute('poster');
      return hasPlaceholder || hasPoster;
    }
    /**
     * @return {boolean} True if the loaderBackground should be used for the
     * element.
     * @private
     */

  }, {
    key: "tagNeedsBackground_",
    value: function tagNeedsBackground_() {
      var tagName = this.element_.tagName;
      return LOADER_BACKGROUND_TAGS[tagName] || isIframeVideoPlayerComponent(tagName);
    }
    /**
     * Add a gray loading background if needed based on the element's content
     * and tagName.
     * @private
     */

  }, {
    key: "maybeAddLoadingBackground_",
    value: function maybeAddLoadingBackground_() {
      if (!this.hasBackgroundContent_() && this.tagNeedsBackground_()) {
        this.domRoot_.classList.add('i-amphtml-loader-background');
      }
    }
    /**
     * Returns the custom logo for the element if there is one.
     * @private
     * @return {{
     *  content: (!Element|undefined),
     *  color: (string|undefined),
     * }}
     */

  }, {
    key: "getCustomLogo_",
    value: function getCustomLogo_() {
      if (this.isAd_()) {
        return {
          content: this.getAdsLogo_()
        };
      }

      if (isIframeVideoPlayerComponent(this.element_.tagName)) {
        return {
          content: this.getVideoPlayerLogo_()
        };
      }

      return this.element_.createLoaderLogo();
    }
    /**
     * @return {!Element} The logo for video players
     * @private
     */

  }, {
    key: "getVideoPlayerLogo_",
    value: function getVideoPlayerLogo_() {
      // Keeping the video logo here short term.
      // This is because there is no single CSS for all players, there is
      // video-interface but not all players implement it. Also the SVG is not
      // that big.
      // TODO(sparhami) Figure out how to move this out of amp-loader.
      var html = htmlFor(this.element_);
      return html(_templateObject3 || (_templateObject3 = _taggedTemplateLiteralLoose(["\n      <svg viewBox=\"0 0 72 72\">\n        <path\n          class=\"i-amphtml-new-loader-white-on-shim\"\n          fill=\"currentColor\"\n          d=\"M41,34.5V31c0-0.5-0.4-1-1-1H27c-0.5,0-1,0.5-1,1v10c0,0.6,0.5,1,1,1h13c0.6,0,1-0.4,1-1v-3.5l5,4v-11L41,34.5z\"\n        ></path>\n      </svg>\n    "])));
    }
    /**
     * Returns the default logo.
     * @return {!Element}
     * @private
     */

  }, {
    key: "getDefaultLogo_",
    value: function getDefaultLogo_() {
      var html = htmlFor(this.element_);
      return html(_templateObject4 || (_templateObject4 = _taggedTemplateLiteralLoose(["\n      <svg class=\"i-amphtml-new-loader-logo-default\" viewBox=\"0 0 72 72\">\n        <circle cx=\"36\" cy=\"36\" r=\"12\"></circle>\n      </svg>\n    "])));
    }
    /**
     * `<amp-ad>s` have several different classes, so putting the code here for
     * now since it is the safest way to make sure that they all get the correct
     * loader.
     *
     * Since the implementation may have a delay before loading, we would need to
     * make sure the ads loader is present, even if the implementation has not
     * yet downloaded.
     *
     * TODO(sparhami) Move this out of amp-loader into something common for ads.
     * @return {!Element}
     * @private
     */

  }, {
    key: "getAdsLogo_",
    value: function getAdsLogo_() {
      var html = htmlFor(this.element_);
      return html(_templateObject5 || (_templateObject5 = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-new-loader-ad-logo\">\n        <span class=\"i-amphtml-new-loader-ad-label\"> Ad </span>\n      </div>\n    "])));
    }
    /**
     * Whether the element is an Ad. Note that this does not cover amp-embed
     * currently.
     * @private
     * @return {boolean}
     */

  }, {
    key: "isAd_",
    value: function isAd_() {
      return this.element_.tagName == 'AMP-AD';
    }
    /**
     * Whether the element is small.
     * Small elements get a different loader with does not have a logo and is
     * just a spinner.
     * @private
     * @return {boolean}
     */

  }, {
    key: "isSmall_",
    value: function isSmall_() {
      return !this.isTiny_() && (this.layoutWidth_ <= 100 || this.layoutHeight_ <= 100);
    }
    /**
     * Very small layout are not eligible for new loaders.
     * @return {boolean}
     */

  }, {
    key: "isTiny_",
    value: function isTiny_() {
      return this.layoutWidth_ < 50 || this.layoutHeight_ < 50;
    }
    /**
     * Whether element has an image blurry placeholder
     * @return {boolean}
     */

  }, {
    key: "hasBlurryImagePlaceholder_",
    value: function hasBlurryImagePlaceholder_() {
      var placeholder = this.element_.getPlaceholder();
      return placeholder && placeholder.classList.contains('i-amphtml-blurry-placeholder');
    }
    /**
     * Whether loaders needs the translucent background shim, this is normally
     * needed when the loader is on top of an image placeholder:
     *    - placeholder is `amp-img` or `img` (`img` handles component
     *      placeholders like `amp-youtube`)
     *    - Element has implicit placeholder like a `poster` on video
     * @private
     * @return {boolean}
     */

  }, {
    key: "requiresBackgroundShim_",
    value: function requiresBackgroundShim_() {
      if (this.element_.hasAttribute('poster')) {
        return true;
      }

      var placeholder = this.element_.getPlaceholder();

      if (!placeholder) {
        return false;
      }

      if (placeholder.tagName == 'AMP-IMG' || placeholder.tagName == 'IMG') {
        return true;
      }

      return false;
    }
    /**
     * Some components such as Instagram require larger spinner due to
     * branding guidelines.
     * @private
     * @return {boolean}
     */

  }, {
    key: "requiresLargeSpinner_",
    value: function requiresLargeSpinner_() {
      // Not Implemented
      return false;
    }
  }]);

  return LoaderBuilder;
}();

export var LoaderService = /*#__PURE__*/function () {
  function LoaderService() {
    _classCallCheck(this, LoaderService);
  }

  _createClass(LoaderService, [{
    key: "initializeLoader",
    value:
    /**
     * @param {!AmpElement} element
     * @param {!Element} loaderRoot
     * @param {number} initDelay
     * @param {number} elementWidth
     * @param {number} elementHeight
     */
    function initializeLoader(element, loaderRoot, initDelay, elementWidth, elementHeight) {
      // Cap the loader delay so that the loader appears immediately, rather than
      // starting part way through the animation.
      var loaderDelay = Math.min(initDelay, LOADER_APPEAR_TIME);
      var lb = new LoaderBuilder(element, loaderRoot, elementWidth, elementHeight);
      lb.build();
      setImportantStyles(element, {
        '--loader-delay-offset': loaderDelay + "ms"
      });
    }
  }]);

  return LoaderService;
}();
AMP.extension('amp-loader', '0.1', function (AMP) {
  AMP.registerServiceForDoc('loader', LoaderService);
  Services.extensionsFor(AMP.win).addDocFactory(function (ampDoc) {
    installStylesForDoc(ampDoc, CSS, function () {}, false, 'amp-loader');
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1sb2FkZXIuanMiXSwibmFtZXMiOlsiQ1NTIiwiU2VydmljZXMiLCJodG1sRm9yIiwiaW5zdGFsbFN0eWxlc0ZvckRvYyIsImlzSWZyYW1lVmlkZW9QbGF5ZXJDb21wb25lbnQiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJzZXRTdHlsZSIsIkxPQURFUl9BUFBFQVJfVElNRSIsIkxPQURFUl9CQUNLR1JPVU5EX1RBR1MiLCJsb2FkZXJEb20iLCJjcmVhdGVTcGlubmVyRG9tIiwiaHRtbCIsImNvbnRlbnQiLCJnZXRMb2FkZXJEb20iLCJlbGVtZW50IiwiYXBwZW5kQ2hpbGQiLCJjbG9uZU5vZGUiLCJMb2FkZXJCdWlsZGVyIiwiZG9tUm9vdCIsImVsZW1lbnRXaWR0aCIsImVsZW1lbnRIZWlnaHQiLCJlbGVtZW50XyIsImRvbVJvb3RfIiwibGF5b3V0V2lkdGhfIiwibGF5b3V0SGVpZ2h0XyIsImxvYWRlclJvb3RfIiwibWF5YmVBZGRMb2FkaW5nQmFja2dyb3VuZF8iLCJtYXliZUFkZExvYWRlckFuaW1hdGlvbl8iLCJpc1RpbnlfIiwiaGFzQmx1cnJ5SW1hZ2VQbGFjZWhvbGRlcl8iLCJzZXRTaXplXyIsInJlcXVpcmVzQmFja2dyb3VuZFNoaW1fIiwiY2xhc3NMaXN0IiwiYWRkIiwiYWRkTG9nb18iLCJzaXplQ2xhc3NEZWZhdWx0Iiwic2l6ZUNsYXNzU21hbGwiLCJzaXplQ2xhc3NMYXJnZSIsImlzQWRfIiwiaXNTbWFsbF8iLCJyZXF1aXJlc0xhcmdlU3Bpbm5lcl8iLCJnZXRDdXN0b21Mb2dvXyIsImNvbG9yIiwiZ2V0RGVmYXVsdExvZ29fIiwicXVlcnlTZWxlY3RvciIsImhhc1BsYWNlaG9sZGVyIiwiZ2V0UGxhY2Vob2xkZXIiLCJoYXNQb3N0ZXIiLCJoYXNBdHRyaWJ1dGUiLCJ0YWdOYW1lIiwiaGFzQmFja2dyb3VuZENvbnRlbnRfIiwidGFnTmVlZHNCYWNrZ3JvdW5kXyIsImdldEFkc0xvZ29fIiwiZ2V0VmlkZW9QbGF5ZXJMb2dvXyIsImNyZWF0ZUxvYWRlckxvZ28iLCJwbGFjZWhvbGRlciIsImNvbnRhaW5zIiwiTG9hZGVyU2VydmljZSIsImxvYWRlclJvb3QiLCJpbml0RGVsYXkiLCJsb2FkZXJEZWxheSIsIk1hdGgiLCJtaW4iLCJsYiIsImJ1aWxkIiwiQU1QIiwiZXh0ZW5zaW9uIiwicmVnaXN0ZXJTZXJ2aWNlRm9yRG9jIiwiZXh0ZW5zaW9uc0ZvciIsIndpbiIsImFkZERvY0ZhY3RvcnkiLCJhbXBEb2MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxHQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxtQkFBUjtBQUNBLFNBQVFDLDRCQUFSO0FBQ0EsU0FBUUMsa0JBQVIsRUFBNEJDLFFBQTVCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQSxJQUFNQyxrQkFBa0IsR0FBRyxHQUEzQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLHNCQUFzQixHQUFHO0FBQzdCLGFBQVcsSUFEa0I7QUFFN0IsY0FBWSxJQUZpQjtBQUc3QixtQkFBaUIsSUFIWTtBQUk3QixtQkFBaUIsSUFKWTtBQUs3QiwrQkFBNkI7QUFMQSxDQUEvQjs7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUMsU0FBUyxHQUFHLElBQWhCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MsZ0JBQVQsQ0FBMEJDLElBQTFCLEVBQWdDO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLE9BQU8sR0FBR0QsSUFBSCxrc0dBQWI7QUFXQTtBQUVBLFNBQU9DLE9BQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLFlBQVQsQ0FBc0JDLE9BQXRCLEVBQStCO0FBQzdCLE1BQUks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bUMsVUFBQ0QsR0FBRCxFQUFTO0FBQzFDQSxFQUFBQSxHQUFHLENBQUNFLHFCQUFKLENBQTBCLFFBQTFCLEVBQW9DVixhQUFwQztBQUNBeEQsRUFBQUEsUUFBUSxDQUFDbUUsYUFBVCxDQUF1QkgsR0FBRyxDQUFDSSxHQUEzQixFQUFnQ0MsYUFBaEMsQ0FBOEMsVUFBQ0MsTUFBRCxFQUFZO0FBQ3hEcEUsSUFBQUEsbUJBQW1CLENBQUNvRSxNQUFELEVBQVN2RSxHQUFULEVBQWMsWUFBTSxDQUFFLENBQXRCLEVBQXdCLEtBQXhCLEVBQStCLFlBQS9CLENBQW5CO0FBQ0QsR0FGRDtBQUdELENBTEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1sb2FkZXItMC4xLmNzcyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge2h0bWxGb3J9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuaW1wb3J0IHtpbnN0YWxsU3R5bGVzRm9yRG9jfSBmcm9tICcuLi8uLi8uLi9zcmMvc3R5bGUtaW5zdGFsbGVyJztcbmltcG9ydCB7aXNJZnJhbWVWaWRlb1BsYXllckNvbXBvbmVudH0gZnJvbSAnI2NvcmUvZG9tL2xheW91dCc7XG5pbXBvcnQge3NldEltcG9ydGFudFN0eWxlcywgc2V0U3R5bGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGZpbGUgaW1wbGVtZW50cyB0aGUgbmV3IEFNUCBsb2FkZXIgYXMgYW4gZXh0ZW5zaW9uLiBUaGlzXG4gKiAgICBhbGxvd3MgbG9hZGluZyB0aGUgcnVudGltZSB3aXRob3V0IGluY3VycmluZyB0aGUgY29zdCBvZiB0aGUgbG9hZGVyIGNvZGUuXG4gKiAgICBUaGUgbG9hZGVyIGhhcyBhIDYwMG1zIGRlbGF5IGJlZm9yZSBhcHBlYXJpbmcuIFRoaXMgZGVsYXkgaXMgb2Zmc2V0IGJ5XG4gKiAgICB0aGUgYW1vdW50IG9mIHRpbWUgaXQgdG9vayB0byBsb2FkIHRoZSBleHRlbnNpb24uXG4gKi9cblxuLy8gSG93IGxvbmcgYmVmb3JlIHRoZSBsb2FkZXIgYXBwZWFycywgaW4gbWlsbGlzZWNvbmRzLiBUaGlzIG1hdGNoZXMgdGhlXG4vLyBtaW5pbXVtIGFuaW1hdGlvbiBkZWxheSBzcGVjaWZpZWQgaW4gdGhlIENTUy5cbmNvbnN0IExPQURFUl9BUFBFQVJfVElNRSA9IDYwMDtcblxuLyoqXG4gKiBFbGVtZW50cyB3aWxsIGdldCBhIGRlZmF1bHQgZ3JheSBiYWNrZ3JvdW5kIGlmIHRoZXkgZG9uJ3QgYWxyZWFkeSBoYXZlIGFcbiAqIHBsYWNlaG9sZGVyLiBUaGlzIGxpc3QgZG9lcyBub3QgaW5jbHVkZSB2aWRlbyBwbGF5ZXJzIHdoaWNoIGFyZSBkZXRlY3RlZFxuICogdXNpbmcgYGlzSWZyYW1lVmlkZW9QbGF5ZXJDb21wb25lbnRgXG4gKiBAZW51bSB7Ym9vbGVhbn1cbiAqIEBwcml2YXRlICBWaXNpYmxlIGZvciB0ZXN0aW5nIG9ubHkhXG4gKi9cbmNvbnN0IExPQURFUl9CQUNLR1JPVU5EX1RBR1MgPSB7XG4gICdBTVAtSU1HJzogdHJ1ZSxcbiAgJ0FNUC1BTklNJzogdHJ1ZSxcbiAgJ0FNUC1QSU5URVJFU1QnOiB0cnVlLFxuICAnQU1QLUlOU1RBR1JBTSc6IHRydWUsXG4gICdBTVAtR09PR0xFLURPQ1VNRU5ULUVNQkVEJzogdHJ1ZSxcbn07XG5cbi8qKlxuICogVXNlZCB0byBjYWNoZSB0aGUgbG9hZGVyIERPTSBvbmNlIGNyZWF0ZWQsIHNvIHdlIGRvIG5vdCBuZWVkIHRvIHJlY3JlYXRlIGl0XG4gKiBlYWNoIHRpbWUuXG4gKiBAdHlwZSB7P0VsZW1lbnR9XG4gKi9cbmxldCBsb2FkZXJEb20gPSBudWxsO1xuXG4vKipcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oIUFycmF5PHN0cmluZz4pOiFFbGVtZW50fSBodG1sXG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlU3Bpbm5lckRvbShodG1sKSB7XG4gIC8vIEV4dHJhIHdyYXBwaW5nIGRpdiBoZXJlIGlzIHRvIHdvcmthcm91bmQ6XG4gIC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTEwMDI3NDhcbiAgLy8gZXNsaW50LWRpc2FibGUgbWF4LWxlblxuICBjb25zdCBjb250ZW50ID0gaHRtbGBcbiAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLW5ldy1sb2FkZXItc3Bpbm5lci13cmFwcGVyXCI+XG4gICAgICA8c3ZnIGNsYXNzPVwiaS1hbXBodG1sLW5ldy1sb2FkZXItc3Bpbm5lclwiIHZpZXdCb3g9XCIwIDAgNDggNDhcIj5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBjbGFzcz1cImktYW1waHRtbC1uZXctbG9hZGVyLXNwaW5uZXItcGF0aFwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIGQ9XCJNMjQgMmEyMiAyMiAwIDEwLjAxIDBtMzMuMjcgNS42NWEyMiAyMiAwIDEwMi43NC0yLjFtNDYuMTMgMS4zNWEyMiAyMiAwIDEwNS45Ni0zLjQ0bTQyLjk2IDIuNzRhMjIgMjIgMCAxMDkuNDktMy45M20zOS40NiAzLjI4YTIyIDIyIDAgMTAxMy4xMy0zLjUyTTI1MyA0Ljk1YTIyIDIyIDAgMTAxNi42OS0yLjJtMzIuMzIgMS42NWEyMiAyMiAwIDEwMTkuOTggMG0yOS4wNi0uNWEyMiAyMiAwIDEwMjIuNzkgM20yNi4yOC0zLjQ0YTIyIDIyIDAgMTAyNC45OCA2LjY5bTI0LjEtNy4wN2EyMiAyMiAwIDEwMjYuNCAxMC45NG0yMi43MS0xMS4yN2EyMiAyMiAwIDEwMjYuOTQgMTUuNTZtMjIuMTgtMTUuODNhMjIgMjIgMCAxMDI2LjU0IDIwLjM3bTIyLjU5LTIwLjU4YTIyIDIyIDAgMTAyNS4xNyAyNS4xN002NDUuNyAyLjEyYTIyIDIyIDAgMTAyMi44NCAyOS43Nm0yNi4zMS0yOS44NWEyMiAyMiAwIDEwMTkuNiAzMy45NU03NDQgMmEyMiAyMiAwIDEwMTUuNTYgMzcuNTZtMzMuNTktMzcuNTNhMjIgMjIgMCAxMDEwLjgzIDQwLjQyTTg0Mi4zIDIuMTJhMjIgMjIgMCAxMDUuNTggNDIuNDJtNDMuNTYtNDIuMjdhMjIgMjIgMCAxMDAgNDMuNDZtNDkuMTMtNDMuMjVhMjIgMjIgMCAxMC01LjczIDQzLjQ5bTU0Ljg1LTQzLjIyYTIyIDIyIDAgMTAtMTEuMzkgNDIuNW02MC41LTQyLjE3YTIyIDIyIDAgMDAtMTYuNzkgNDAuNTNtNjUuODctNDAuMTVhMjIgMjIgMCAwMC0yMS43MyAzNy42NG03MC44LTM3LjJhMjIgMjIgMCAwMC0yNi4wNSAzMy45NG03NS4wOS0zMy40NGEyMiAyMiAwIDAwLTI5LjU5IDI5LjU5TTEyMzUgNC45NWEyMiAyMiAwIDAwLTMyLjI1IDI0Ljc1bTgxLjIzLTI0LjE1YTIyIDIyIDAgMDAtMzMuOTUgMTkuNm04Mi45LTE4Ljk1YTIyIDIyIDAgMDAtMzQuNjYgMTQuMzZtODMuNTgtMTMuNjZhMjIgMjIgMCAwMC0zNC4zOCA5LjIxbTgzLjI1LTguNDZhMjIgMjIgMCAwMC0zMy4xNyA0LjM3bTgyLjAxLTMuNThhMjIgMjIgMCAwMC0zMS4xMSAwbTgxLjM1IDIuNjNhMjIgMjIgMCAwMC0zMi41Mi0zLjQybTgyLjMyIDYuMzZhMjIgMjIgMCAwMC0zMy40NS03LjExbTgyLjc3IDEwLjNhMjIgMjIgMCAwMC0zMy44NS0xMW04Mi42NiAxNC4zNmEyMiAyMiAwIDAwLTMzLjcxLTE1LjAxTTE3MjYgMjRhMjIgMjIgMCAwMC0zMy0xOS4wNW04MC43MyAyMi40OWEyMiAyMiAwIDAwLTMxLjcyLTIzLjA0bTc4LjkxIDI2LjRhMjIgMjIgMCAwMC0yOS44Ny0yNi45bTc2LjU1IDMwLjA5YTIyIDIyIDAgMDAtMjcuNDktMzAuNTNtNzMuNjkgMzMuNDdhMjIgMjIgMCAwMC0yNC42LTMzLjg1bTcwLjM2IDM2LjQ4YTIyIDIyIDAgMDAtMjEuMjUtMzYuODFtNjYuNjIgMzkuMDVhMjIgMjIgMCAwMC0xNy41MS0zOS4zMm02Mi41NyA0MS4xMmEyMiAyMiAwIDAwLTEzLjQzLTQxLjMzbTU4LjI0IDQyLjY1YTIyIDIyIDAgMDAtOS4xLTQyLjhtNTMuNzQgNDMuNjFhMjIgMjIgMCAwMC00LjU5LTQzLjdNMjE4NCA0NmEyMiAyMiAwIDEwMC00NG00NC41NiA0My43M2EyMiAyMiAwIDEwNC41OS00My43bTQwLjA1IDQyLjg5YTIyIDIyIDAgMTA5LjEtNDIuOG0zNS43MSA0MS40OGEyMiAyMiAwIDEwMTMuNDMtNDEuMzNtMzEuNjMgMzkuNTNhMjIgMjIgMCAxMDE3LjUxLTM5LjMybTI3Ljg2IDM3LjA4YTIyIDIyIDAgMTAyMS4yNS0zNi44MW0yNC41MSAzNC4xOGEyMiAyMiAwIDEwMjQuNi0zMy44NW0yMS42IDMwLjkxYTIyIDIyIDAgMTAyNy40OS0zMC41M20xOS4xOSAyNy4zNGEyMiAyMiAwIDEwMjkuODctMjYuOW0xNy4zMiAyMy41NGEyMiAyMiAwIDEwMzEuNzItMjMuMDRNMjY0MiAyNGEyMiAyMiAwIDEwMzMtMTkuMDVtMTUuMjcgMTUuNjFhMjIgMjIgMCAxMDMzLjcxLTE1LjAxbTE1LjEgMTEuNjVhMjIgMjIgMCAxMDMzLjg1LTExbTE1LjQ3IDcuODFhMjIgMjIgMCAxMDMzLjQ1LTcuMTFtMTYuMzUgNC4xN2EyMiAyMiAwIDEwMzIuNTItMy40Mm0xNy43Mi43OWEyMiAyMiAwIDEwMzEuMTEgMG0xNy43My0uNzlhMjIgMjIgMCAxMDMyLjUyIDMuNDJtMTYuMzUtNC4xN2EyMiAyMiAwIDEwMzMuNDUgNy4xMW0xNS40Ny03LjgxYTIyIDIyIDAgMTAzMy44NSAxMW0xNS4xLTExLjY1YTIyIDIyIDAgMTAzMy43MSAxNS4wMU0zMTMzIDQuOTVBMjIgMjIgMCAxMDMxNjYgMjRtMTYuMDEtMTkuNmEyMiAyMiAwIDEwMzEuNzIgMjMuMDRtMTcuMzItMjMuNTRhMjIgMjIgMCAxMDI5Ljg3IDI2LjltMTkuMi0yNy4zNGEyMiAyMiAwIDEwMjcuNDkgMzAuNTNtMjEuNTktMzAuOTFhMjIgMjIgMCAxMDI0LjYgMzMuODVtMjQuNTEtMzQuMThhMjIgMjIgMCAxMDIxLjI1IDM2LjgxbTI3Ljg3LTM3LjA4YTIyIDIyIDAgMTAxNy41MSAzOS4zMm0zMS42Mi0zOS41M2EyMiAyMiAwIDEwMTMuNDMgNDEuMzNtMzUuNzEtNDEuNDhhMjIgMjIgMCAxMDkuMSA0Mi44bTQwLjA1LTQyLjg5YTIyIDIyIDAgMTA0LjU5IDQzLjdNMzYyNCAyYTIyIDIyIDAgMTAwIDQ0bTQ5LjE1LTQzLjk3YTIyIDIyIDAgMDAtNC41OSA0My43bTUzLjc0LTQzLjYxYTIyIDIyIDAgMDAtOS4xIDQyLjhtNTguMjQtNDIuNjVhMjIgMjIgMCAwMC0xMy40MyA0MS4zM202Mi41Ni00MS4xMmEyMiAyMiAwIDAwLTE3LjUxIDM5LjMybTY2LjYzLTM5LjA1YTIyIDIyIDAgMDAtMjEuMjUgMzYuODFtNzAuMzYtMzYuNDhhMjIgMjIgMCAwMC0yNC42IDMzLjg1bTczLjY4LTMzLjQ3YTIyIDIyIDAgMDAtMjcuNDkgMzAuNTNtNzYuNTYtMzAuMDlhMjIgMjIgMCAwMC0yOS44NyAyNi45bTc4LjkxLTI2LjRhMjIgMjIgMCAwMC0zMS43MiAyMy4wNE00MTE1IDQuOTVBMjIgMjIgMCAwMDQwODIgMjRtODEuOTgtMTguNDVhMjIgMjIgMCAwMC0zMy43MSAxNS4wMW04Mi42Ni0xNC4zNmEyMiAyMiAwIDAwLTMzLjg1IDExbTgyLjc3LTEwLjNhMjIgMjIgMCAwMC0zMy40NSA3LjExbTgyLjMyLTYuMzZhMjIgMjIgMCAwMC0zMi41MiAzLjQyXCJcbiAgICAgICAgPjwvcGF0aD5cbiAgICAgIDwvc3ZnPlxuICAgIDwvZGl2PlxuICBgO1xuICAvLyBlc2xpbnQtZW5hYmxlIG1heC1sZW5cblxuICByZXR1cm4gY29udGVudDtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50IFVzZWQgdG8gZ2V0IGEgZG9jdW1lbnQgdG8gYnVpbGQgSFRNTCB3aXRoLlxuICogQHJldHVybiB7IUVsZW1lbnR9IFRoZSBsb2FkZXIgRE9NLlxuICovXG5mdW5jdGlvbiBnZXRMb2FkZXJEb20oZWxlbWVudCkge1xuICBpZiAoIWxvYWRlckRvbSkge1xuICAgIGNvbnN0IGh0bWwgPSBodG1sRm9yKGVsZW1lbnQpO1xuICAgIC8qXG4gICAgICogVGhlIG91dGVyIGRpdiBoZXJlIGlzIG5lZWRlZCBmb3IgdHdvIHJlYXNvbnM6XG4gICAgICogMS4gQXBwbHlpbmcgYSBiYWNrZ3JvdW5kIGNvbG9yIHdoZW4gdGhlcmUgaXMgbm8gcGxhY2Vob2xkZXIuXG4gICAgICogMi4gQmFja3dhcmRzIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgZXhpc3RpbmcgbWV0aG9kIGFuZCBkb2N1bWVudGF0aW9uXG4gICAgICogICAgZm9yIGN1c3RvbWl6aW5nIGxvYWRlcnMsIHdoaWNoIGluY2x1ZGVzIGEgc3R5bGUgdG8gaGlkZSB0aGUgb2xkIHRocmVlXG4gICAgICogICAgZG90cyB2aWE6XG4gICAgICogICAgYGBgXG4gICAgICogICAgLm15LWN1c3RvbS1sb2FkZXIgLmFtcC1hY3RpdmUgPiBkaXYge1xuICAgICAqICAgICBkaXNwbGF5OiBub25lO1xuICAgICAqICAgIH1cbiAgICAgKiAgICBgYGBcbiAgICAgKi9cbiAgICBsb2FkZXJEb20gPSBodG1sYFxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1uZXctbG9hZGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtbmV3LWxvYWRlci1zaGltXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtbmV3LWxvYWRlci1sb2dvXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICAgIGxvYWRlckRvbS5hcHBlbmRDaGlsZChjcmVhdGVTcGlubmVyRG9tKGh0bWwpKTtcbiAgfVxuXG4gIHJldHVybiBsb2FkZXJEb20uY2xvbmVOb2RlKHRydWUpO1xufVxuXG4vKipcbiAqIEhlbHBlciBjbGFzcyB0byBidWlsZCB0aGUgbmV3IGxvYWRlcidzIERPTS5cbiAqL1xuY2xhc3MgTG9hZGVyQnVpbGRlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGRvbVJvb3RcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVsZW1lbnRXaWR0aFxuICAgKiBAcGFyYW0ge251bWJlcn0gZWxlbWVudEhlaWdodFxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgZG9tUm9vdCwgZWxlbWVudFdpZHRoLCBlbGVtZW50SGVpZ2h0KSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUFtcEVsZW1lbnR9ICovXG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLmRvbVJvb3RfID0gZG9tUm9vdDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgIHtudW1iZXJ9ICovXG4gICAgdGhpcy5sYXlvdXRXaWR0aF8gPSBlbGVtZW50V2lkdGg7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICB7bnVtYmVyfSAqL1xuICAgIHRoaXMubGF5b3V0SGVpZ2h0XyA9IGVsZW1lbnRIZWlnaHQ7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMubG9hZGVyUm9vdF8gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyB0aGUgbG9hZGVyJ3MgRE9NLlxuICAgKi9cbiAgYnVpbGQoKSB7XG4gICAgdGhpcy5sb2FkZXJSb290XyA9IGdldExvYWRlckRvbSh0aGlzLmVsZW1lbnRfKTtcbiAgICB0aGlzLmRvbVJvb3RfLmFwcGVuZENoaWxkKHRoaXMubG9hZGVyUm9vdF8pO1xuICAgIHRoaXMubWF5YmVBZGRMb2FkaW5nQmFja2dyb3VuZF8oKTtcbiAgICB0aGlzLm1heWJlQWRkTG9hZGVyQW5pbWF0aW9uXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBjb21iaW5hdGlvbiBvZiBzcGlubmVyL2xvZ28gaWYgZWxlbWVudCBpcyBlbGlnaWJsZSBiYXNlZCBvblxuICAgKiBjZXJ0YWluIGhldXJpc3RpY3MuXG4gICAqL1xuICBtYXliZUFkZExvYWRlckFuaW1hdGlvbl8oKSB7XG4gICAgLy8gSWYgdmVyeSBzbWFsbCBvciBhbHJlYWR5IGhhcyBpbWFnZSBwbGFjZWhvbGRlciwgbm8gbG9hZGVyIGFuaW1hdGlvbi5cbiAgICBpZiAodGhpcy5pc1RpbnlfKCkgfHwgdGhpcy5oYXNCbHVycnlJbWFnZVBsYWNlaG9sZGVyXygpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTaXplXygpO1xuICAgIGlmICh0aGlzLnJlcXVpcmVzQmFja2dyb3VuZFNoaW1fKCkpIHtcbiAgICAgIHRoaXMubG9hZGVyUm9vdF8uY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLW5ldy1sb2FkZXItaGFzLXNoaW0nKTtcbiAgICB9XG4gICAgdGhpcy5hZGRMb2dvXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNpemUgb2YgdGhlIGxvYWRlciBiYXNlZCBlbGVtZW50J3Mgc2l6ZSBhbmQgYSBmZXcgc3BlY2lhbCBjYXNlcy5cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgKi9cbiAgc2V0U2l6ZV8oKSB7XG4gICAgY29uc3Qgc2l6ZUNsYXNzRGVmYXVsdCA9ICdpLWFtcGh0bWwtbmV3LWxvYWRlci1zaXplLWRlZmF1bHQnO1xuICAgIGNvbnN0IHNpemVDbGFzc1NtYWxsID0gJ2ktYW1waHRtbC1uZXctbG9hZGVyLXNpemUtc21hbGwnO1xuICAgIGNvbnN0IHNpemVDbGFzc0xhcmdlID0gJ2ktYW1waHRtbC1uZXctbG9hZGVyLXNpemUtbGFyZ2UnO1xuXG4gICAgLy8gQWRzIGFsd2F5cyBnZXQgdGhlIGRlZmF1bHQgc3Bpbm5lciByZWdhcmRsZXNzIG9mIHRoZSBlbGVtZW50IHNpemVcbiAgICBpZiAodGhpcy5pc0FkXygpKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2FkZXJSb290Xy5jbGFzc0xpc3QuYWRkKHNpemVDbGFzc0RlZmF1bHQpO1xuICAgIH1cblxuICAgIC8vIE90aGVyIHRoYW4gQWRzLCBzbWFsbCBzcGlubmVyIGlzIGFsd2F5cyB1c2VkIGlmIGVsZW1lbnQgaXMgc21hbGwuXG4gICAgaWYgKHRoaXMuaXNTbWFsbF8oKSkge1xuICAgICAgcmV0dXJuIHRoaXMubG9hZGVyUm9vdF8uY2xhc3NMaXN0LmFkZChzaXplQ2xhc3NTbWFsbCk7XG4gICAgfVxuXG4gICAgLy8gSWYgaG9zdCBpcyBub3Qgc21hbGwsIGRlZmF1bHQgc2l6ZSBzcGlubmVyIGlzIG5vcm1hbGx5IHVzZWRcbiAgICAvLyB1bmxlc3MgZHVlIHRvIGJyYW5kaW5nIGd1aWRlbGluZXMgKGUuZy4gSW5zdGFncmFtKSBhIGxhcmdlciBzcGlubmVyIGlzXG4gICAgLy8gcmVxdWlyZWQuXG4gICAgaWYgKHRoaXMucmVxdWlyZXNMYXJnZVNwaW5uZXJfKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvYWRlclJvb3RfLmNsYXNzTGlzdC5hZGQoc2l6ZUNsYXNzTGFyZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sb2FkZXJSb290Xy5jbGFzc0xpc3QuYWRkKHNpemVDbGFzc0RlZmF1bHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIHNwaW5uZXIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhZGRMb2dvXygpIHtcbiAgICBjb25zdCB7Y29sb3IsIGNvbnRlbnQgPSB0aGlzLmdldERlZmF1bHRMb2dvXygpfSA9IHRoaXMuZ2V0Q3VzdG9tTG9nb18oKTtcblxuICAgIHRoaXMubG9hZGVyUm9vdF9cbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuaS1hbXBodG1sLW5ldy1sb2FkZXItbG9nbycpXG4gICAgICAuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICBpZiAoY29sb3IpIHtcbiAgICAgIHNldFN0eWxlKHRoaXMubG9hZGVyUm9vdF8sICdjb2xvcicsIGNvbG9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgY3VycmVudGx5IGxvYWRpbmcgZWxlbWVudCBoYXMgYmFja2dyb3VuZFxuICAgKiBjb250ZW50IHZpYSBhIHBsYWNlaG9sZGVyIG9yIHBvc3Rlci5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhc0JhY2tncm91bmRDb250ZW50XygpIHtcbiAgICBjb25zdCBoYXNQbGFjZWhvbGRlciA9ICEhdGhpcy5lbGVtZW50Xy5nZXRQbGFjZWhvbGRlcigpO1xuICAgIGNvbnN0IGhhc1Bvc3RlciA9IHRoaXMuZWxlbWVudF8uaGFzQXR0cmlidXRlKCdwb3N0ZXInKTtcblxuICAgIHJldHVybiBoYXNQbGFjZWhvbGRlciB8fCBoYXNQb3N0ZXI7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgbG9hZGVyQmFja2dyb3VuZCBzaG91bGQgYmUgdXNlZCBmb3IgdGhlXG4gICAqIGVsZW1lbnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0YWdOZWVkc0JhY2tncm91bmRfKCkge1xuICAgIGNvbnN0IHt0YWdOYW1lfSA9IHRoaXMuZWxlbWVudF87XG5cbiAgICByZXR1cm4gKFxuICAgICAgTE9BREVSX0JBQ0tHUk9VTkRfVEFHU1t0YWdOYW1lXSB8fCBpc0lmcmFtZVZpZGVvUGxheWVyQ29tcG9uZW50KHRhZ05hbWUpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBncmF5IGxvYWRpbmcgYmFja2dyb3VuZCBpZiBuZWVkZWQgYmFzZWQgb24gdGhlIGVsZW1lbnQncyBjb250ZW50XG4gICAqIGFuZCB0YWdOYW1lLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWF5YmVBZGRMb2FkaW5nQmFja2dyb3VuZF8oKSB7XG4gICAgaWYgKCF0aGlzLmhhc0JhY2tncm91bmRDb250ZW50XygpICYmIHRoaXMudGFnTmVlZHNCYWNrZ3JvdW5kXygpKSB7XG4gICAgICB0aGlzLmRvbVJvb3RfLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1sb2FkZXItYmFja2dyb3VuZCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXN0b20gbG9nbyBmb3IgdGhlIGVsZW1lbnQgaWYgdGhlcmUgaXMgb25lLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHt7XG4gICAqICBjb250ZW50OiAoIUVsZW1lbnR8dW5kZWZpbmVkKSxcbiAgICogIGNvbG9yOiAoc3RyaW5nfHVuZGVmaW5lZCksXG4gICAqIH19XG4gICAqL1xuICBnZXRDdXN0b21Mb2dvXygpIHtcbiAgICBpZiAodGhpcy5pc0FkXygpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb250ZW50OiB0aGlzLmdldEFkc0xvZ29fKCksXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChpc0lmcmFtZVZpZGVvUGxheWVyQ29tcG9uZW50KHRoaXMuZWxlbWVudF8udGFnTmFtZSkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRlbnQ6IHRoaXMuZ2V0VmlkZW9QbGF5ZXJMb2dvXygpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5lbGVtZW50Xy5jcmVhdGVMb2FkZXJMb2dvKCk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IUVsZW1lbnR9IFRoZSBsb2dvIGZvciB2aWRlbyBwbGF5ZXJzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRWaWRlb1BsYXllckxvZ29fKCkge1xuICAgIC8vIEtlZXBpbmcgdGhlIHZpZGVvIGxvZ28gaGVyZSBzaG9ydCB0ZXJtLlxuICAgIC8vIFRoaXMgaXMgYmVjYXVzZSB0aGVyZSBpcyBubyBzaW5nbGUgQ1NTIGZvciBhbGwgcGxheWVycywgdGhlcmUgaXNcbiAgICAvLyB2aWRlby1pbnRlcmZhY2UgYnV0IG5vdCBhbGwgcGxheWVycyBpbXBsZW1lbnQgaXQuIEFsc28gdGhlIFNWRyBpcyBub3RcbiAgICAvLyB0aGF0IGJpZy5cbiAgICAvLyBUT0RPKHNwYXJoYW1pKSBGaWd1cmUgb3V0IGhvdyB0byBtb3ZlIHRoaXMgb3V0IG9mIGFtcC1sb2FkZXIuXG4gICAgY29uc3QgaHRtbCA9IGh0bWxGb3IodGhpcy5lbGVtZW50Xyk7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgNzIgNzJcIj5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBjbGFzcz1cImktYW1waHRtbC1uZXctbG9hZGVyLXdoaXRlLW9uLXNoaW1cIlxuICAgICAgICAgIGZpbGw9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgICAgIGQ9XCJNNDEsMzQuNVYzMWMwLTAuNS0wLjQtMS0xLTFIMjdjLTAuNSwwLTEsMC41LTEsMXYxMGMwLDAuNiwwLjUsMSwxLDFoMTNjMC42LDAsMS0wLjQsMS0xdi0zLjVsNSw0di0xMUw0MSwzNC41elwiXG4gICAgICAgID48L3BhdGg+XG4gICAgICA8L3N2Zz5cbiAgICBgO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlZmF1bHQgbG9nby5cbiAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXREZWZhdWx0TG9nb18oKSB7XG4gICAgY29uc3QgaHRtbCA9IGh0bWxGb3IodGhpcy5lbGVtZW50Xyk7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8c3ZnIGNsYXNzPVwiaS1hbXBodG1sLW5ldy1sb2FkZXItbG9nby1kZWZhdWx0XCIgdmlld0JveD1cIjAgMCA3MiA3MlwiPlxuICAgICAgICA8Y2lyY2xlIGN4PVwiMzZcIiBjeT1cIjM2XCIgcj1cIjEyXCI+PC9jaXJjbGU+XG4gICAgICA8L3N2Zz5cbiAgICBgO1xuICB9XG5cbiAgLyoqXG4gICAqIGA8YW1wLWFkPnNgIGhhdmUgc2V2ZXJhbCBkaWZmZXJlbnQgY2xhc3Nlcywgc28gcHV0dGluZyB0aGUgY29kZSBoZXJlIGZvclxuICAgKiBub3cgc2luY2UgaXQgaXMgdGhlIHNhZmVzdCB3YXkgdG8gbWFrZSBzdXJlIHRoYXQgdGhleSBhbGwgZ2V0IHRoZSBjb3JyZWN0XG4gICAqIGxvYWRlci5cbiAgICpcbiAgICogU2luY2UgdGhlIGltcGxlbWVudGF0aW9uIG1heSBoYXZlIGEgZGVsYXkgYmVmb3JlIGxvYWRpbmcsIHdlIHdvdWxkIG5lZWQgdG9cbiAgICogbWFrZSBzdXJlIHRoZSBhZHMgbG9hZGVyIGlzIHByZXNlbnQsIGV2ZW4gaWYgdGhlIGltcGxlbWVudGF0aW9uIGhhcyBub3RcbiAgICogeWV0IGRvd25sb2FkZWQuXG4gICAqXG4gICAqIFRPRE8oc3BhcmhhbWkpIE1vdmUgdGhpcyBvdXQgb2YgYW1wLWxvYWRlciBpbnRvIHNvbWV0aGluZyBjb21tb24gZm9yIGFkcy5cbiAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRBZHNMb2dvXygpIHtcbiAgICBjb25zdCBodG1sID0gaHRtbEZvcih0aGlzLmVsZW1lbnRfKTtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtbmV3LWxvYWRlci1hZC1sb2dvXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiaS1hbXBodG1sLW5ldy1sb2FkZXItYWQtbGFiZWxcIj4gQWQgPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGFuIEFkLiBOb3RlIHRoYXQgdGhpcyBkb2VzIG5vdCBjb3ZlciBhbXAtZW1iZWRcbiAgICogY3VycmVudGx5LlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNBZF8oKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudF8udGFnTmFtZSA9PSAnQU1QLUFEJztcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIHNtYWxsLlxuICAgKiBTbWFsbCBlbGVtZW50cyBnZXQgYSBkaWZmZXJlbnQgbG9hZGVyIHdpdGggZG9lcyBub3QgaGF2ZSBhIGxvZ28gYW5kIGlzXG4gICAqIGp1c3QgYSBzcGlubmVyLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNTbWFsbF8oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICF0aGlzLmlzVGlueV8oKSAmJiAodGhpcy5sYXlvdXRXaWR0aF8gPD0gMTAwIHx8IHRoaXMubGF5b3V0SGVpZ2h0XyA8PSAxMDApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJ5IHNtYWxsIGxheW91dCBhcmUgbm90IGVsaWdpYmxlIGZvciBuZXcgbG9hZGVycy5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzVGlueV8oKSB7XG4gICAgcmV0dXJuIHRoaXMubGF5b3V0V2lkdGhfIDwgNTAgfHwgdGhpcy5sYXlvdXRIZWlnaHRfIDwgNTA7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciBlbGVtZW50IGhhcyBhbiBpbWFnZSBibHVycnkgcGxhY2Vob2xkZXJcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc0JsdXJyeUltYWdlUGxhY2Vob2xkZXJfKCkge1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5lbGVtZW50Xy5nZXRQbGFjZWhvbGRlcigpO1xuICAgIHJldHVybiAoXG4gICAgICBwbGFjZWhvbGRlciAmJlxuICAgICAgcGxhY2Vob2xkZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdpLWFtcGh0bWwtYmx1cnJ5LXBsYWNlaG9sZGVyJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgbG9hZGVycyBuZWVkcyB0aGUgdHJhbnNsdWNlbnQgYmFja2dyb3VuZCBzaGltLCB0aGlzIGlzIG5vcm1hbGx5XG4gICAqIG5lZWRlZCB3aGVuIHRoZSBsb2FkZXIgaXMgb24gdG9wIG9mIGFuIGltYWdlIHBsYWNlaG9sZGVyOlxuICAgKiAgICAtIHBsYWNlaG9sZGVyIGlzIGBhbXAtaW1nYCBvciBgaW1nYCAoYGltZ2AgaGFuZGxlcyBjb21wb25lbnRcbiAgICogICAgICBwbGFjZWhvbGRlcnMgbGlrZSBgYW1wLXlvdXR1YmVgKVxuICAgKiAgICAtIEVsZW1lbnQgaGFzIGltcGxpY2l0IHBsYWNlaG9sZGVyIGxpa2UgYSBgcG9zdGVyYCBvbiB2aWRlb1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgcmVxdWlyZXNCYWNrZ3JvdW5kU2hpbV8oKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudF8uaGFzQXR0cmlidXRlKCdwb3N0ZXInKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5lbGVtZW50Xy5nZXRQbGFjZWhvbGRlcigpO1xuICAgIGlmICghcGxhY2Vob2xkZXIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAocGxhY2Vob2xkZXIudGFnTmFtZSA9PSAnQU1QLUlNRycgfHwgcGxhY2Vob2xkZXIudGFnTmFtZSA9PSAnSU1HJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTb21lIGNvbXBvbmVudHMgc3VjaCBhcyBJbnN0YWdyYW0gcmVxdWlyZSBsYXJnZXIgc3Bpbm5lciBkdWUgdG9cbiAgICogYnJhbmRpbmcgZ3VpZGVsaW5lcy5cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHJlcXVpcmVzTGFyZ2VTcGlubmVyXygpIHtcbiAgICAvLyBOb3QgSW1wbGVtZW50ZWRcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExvYWRlclNlcnZpY2Uge1xuICAvKipcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBsb2FkZXJSb290XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbml0RGVsYXlcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVsZW1lbnRXaWR0aFxuICAgKiBAcGFyYW0ge251bWJlcn0gZWxlbWVudEhlaWdodFxuICAgKi9cbiAgaW5pdGlhbGl6ZUxvYWRlcihcbiAgICBlbGVtZW50LFxuICAgIGxvYWRlclJvb3QsXG4gICAgaW5pdERlbGF5LFxuICAgIGVsZW1lbnRXaWR0aCxcbiAgICBlbGVtZW50SGVpZ2h0XG4gICkge1xuICAgIC8vIENhcCB0aGUgbG9hZGVyIGRlbGF5IHNvIHRoYXQgdGhlIGxvYWRlciBhcHBlYXJzIGltbWVkaWF0ZWx5LCByYXRoZXIgdGhhblxuICAgIC8vIHN0YXJ0aW5nIHBhcnQgd2F5IHRocm91Z2ggdGhlIGFuaW1hdGlvbi5cbiAgICBjb25zdCBsb2FkZXJEZWxheSA9IE1hdGgubWluKGluaXREZWxheSwgTE9BREVSX0FQUEVBUl9USU1FKTtcbiAgICBjb25zdCBsYiA9IG5ldyBMb2FkZXJCdWlsZGVyKFxuICAgICAgZWxlbWVudCxcbiAgICAgIGxvYWRlclJvb3QsXG4gICAgICBlbGVtZW50V2lkdGgsXG4gICAgICBlbGVtZW50SGVpZ2h0XG4gICAgKTtcbiAgICBsYi5idWlsZCgpO1xuXG4gICAgc2V0SW1wb3J0YW50U3R5bGVzKGVsZW1lbnQsIHtcbiAgICAgICctLWxvYWRlci1kZWxheS1vZmZzZXQnOiBgJHtsb2FkZXJEZWxheX1tc2AsXG4gICAgfSk7XG4gIH1cbn1cblxuQU1QLmV4dGVuc2lvbignYW1wLWxvYWRlcicsICcwLjEnLCAoQU1QKSA9PiB7XG4gIEFNUC5yZWdpc3RlclNlcnZpY2VGb3JEb2MoJ2xvYWRlcicsIExvYWRlclNlcnZpY2UpO1xuICBTZXJ2aWNlcy5leHRlbnNpb25zRm9yKEFNUC53aW4pLmFkZERvY0ZhY3RvcnkoKGFtcERvYykgPT4ge1xuICAgIGluc3RhbGxTdHlsZXNGb3JEb2MoYW1wRG9jLCBDU1MsICgpID0+IHt9LCBmYWxzZSwgJ2FtcC1sb2FkZXInKTtcbiAgfSk7XG59KTtcbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-loader/0.1/amp-loader.js