var _templateObject;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

/**
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
import { CSS } from "../../../build/amp-story-viewport-warning-layer-1.0.css";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { StateProperty, UIType, getStoreService } from "./amp-story-store-service";
import { createShadowRootWithStyle } from "./utils";
import { getLocalizationService } from "./amp-story-localization-service";
import { htmlFor } from "../../../src/core/dom/static-template";
import { listen } from "../../../src/event-helper";
import { throttle } from "../../../src/core/types/function";

/**
 * CSS class indicating the format is landscape.
 * @const {string}
 */
var LANDSCAPE_OVERLAY_CLASS = 'i-amphtml-story-landscape';

/** @const {number} */
var RESIZE_THROTTLE_MS = 300;

/**
 * Viewport warning layer template.
 * @param {!Element} element
 * @return {!Element}
 */
var getTemplate = function getTemplate(element) {
  return htmlFor(element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"\n        i-amphtml-story-no-rotation-overlay i-amphtml-story-system-reset\">\n      <div class=\"i-amphtml-overlay-container\">\n        <div class=\"i-amphtml-story-overlay-icon\"></div>\n        <div class=\"i-amphtml-story-overlay-text\"></div>\n      </div>\n    </div>\n  "])));
};

/**
 * Viewport warning layer UI.
 */
export var ViewportWarningLayer = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} storyElement Element where to append the component
   * @param {number} desktopWidthThreshold Threshold in px.
   * @param {number} desktopHeightThreshold Threshold in px.
   */
  function ViewportWarningLayer(win, storyElement, desktopWidthThreshold, desktopHeightThreshold) {
    _classCallCheck(this, ViewportWarningLayer);

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {number} */
    this.desktopHeightThreshold_ = desktopHeightThreshold;

    /** @private {number} */
    this.desktopWidthThreshold_ = desktopWidthThreshold;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;

    /** @private {?Element} */
    this.overlayEl_ = null;

    /** @private @const {!../../../src/service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.win_);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private @const {!Element} */
    this.storyElement_ = storyElement;

    /** @private {?Function} */
    this.unlistenResizeEvents_ = null;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);
    this.initializeListeners_();
  }

  /**
   * Builds and appends the component in the story.
   */
  _createClass(ViewportWarningLayer, [{
    key: "build",
    value: function build() {
      var _this = this;

      if (this.isBuilt()) {
        return;
      }

      this.overlayEl_ = this.getViewportWarningOverlayTemplate_();
      this.localizationService_ = getLocalizationService(this.storyElement_);
      this.isBuilt_ = true;
      var root = this.win_.document.createElement('div');
      createShadowRootWithStyle(root, this.overlayEl_, CSS);
      // Initializes the UI state now that the component is built.
      this.onUIStateUpdate_(
      /** @type {!UIType} */
      this.storeService_.get(StateProperty.UI_STATE));
      this.vsync_.mutate(function () {
        _this.storyElement_.insertBefore(root, _this.storyElement_.firstChild);
      });
    }
    /**
     * Whether the element has been built.
     * @return {boolean}
     */

  }, {
    key: "isBuilt",
    value: function isBuilt() {
      return this.isBuilt_;
    }
    /**
     * @private
     */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this2 = this;

      this.storeService_.subscribe(StateProperty.UI_STATE, function (uiState) {
        _this2.onUIStateUpdate_(uiState);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.VIEWPORT_WARNING_STATE, function (viewportWarningState) {
        _this2.onViewportWarningStateUpdate_(viewportWarningState);
      }, true
      /** callToInitialize */
      );
    }
    /**
     * Reacts to the viewport warning state update, only on mobile.
     * @param {boolean} viewportWarningState
     * @private
     */

  }, {
    key: "onViewportWarningStateUpdate_",
    value: function onViewportWarningStateUpdate_(viewportWarningState) {
      var _this3 = this;

      var isMobile = this.storeService_.get(StateProperty.UI_STATE) === UIType.MOBILE;
      // Adds the landscape class if we are mobile landscape.
      var shouldShowLandscapeOverlay = isMobile && viewportWarningState;

      // Don't build the layer until we need to display it.
      if (!shouldShowLandscapeOverlay && !this.isBuilt()) {
        return;
      }

      this.build();

      // Listen to resize events to update the UI message.
      if (viewportWarningState) {
        var resizeThrottle = throttle(this.win_, function () {
          return _this3.onResize_();
        }, RESIZE_THROTTLE_MS);
        this.unlistenResizeEvents_ = listen(this.win_, 'resize', resizeThrottle);
      } else if (this.unlistenResizeEvents_) {
        this.unlistenResizeEvents_();
        this.unlistenResizeEvents_ = null;
      }

      this.updateTextContent_();
      this.vsync_.mutate(function () {
        _this3.overlayEl_.classList.toggle(LANDSCAPE_OVERLAY_CLASS, shouldShowLandscapeOverlay);
      });
    }
    /**
     * Reacts to UI state updates.
     * @param {!UIType} uiState
     * @private
     */

  }, {
    key: "onUIStateUpdate_",
    value: function onUIStateUpdate_(uiState) {
      var _this4 = this;

      if (!this.isBuilt()) {
        return;
      }

      this.vsync_.mutate(function () {
        uiState === UIType.DESKTOP_PANELS ? _this4.overlayEl_.setAttribute('desktop', '') : _this4.overlayEl_.removeAttribute('desktop');
      });
    }
    /**
     * @private
     */

  }, {
    key: "onResize_",
    value: function onResize_() {
      this.updateTextContent_();
    }
    /**
     * Returns the overlay corresponding to the device currently used.
     * @return {!Element} template
     * @private
     */

  }, {
    key: "getViewportWarningOverlayTemplate_",
    value: function getViewportWarningOverlayTemplate_() {
      var template = getTemplate(this.storyElement_);
      var iconEl = template.querySelector('.i-amphtml-story-overlay-icon');

      if (this.platform_.isIos() || this.platform_.isAndroid()) {
        iconEl.classList.add('i-amphtml-rotate-icon');
        return template;
      }

      iconEl.classList.add('i-amphtml-desktop-size-icon');
      return template;
    }
    /**
     * Updates the UI message displayed to the user.
     * @private
     */

  }, {
    key: "updateTextContent_",
    value: function updateTextContent_() {
      var _this5 = this;

      var textEl = this.overlayEl_.querySelector('.i-amphtml-story-overlay-text');
      var textContent;
      this.vsync_.run({
        measure: function measure() {
          textContent = _this5.getTextContent_();
        },
        mutate: function mutate() {
          if (!textContent) {
            return;
          }

          textEl.textContent = textContent;
        }
      });
    }
    /**
     * Gets the localized message to display, depending on the viewport size. Has
     * to run during a measure phase.
     * @return {?string}
     * @private
     */

  }, {
    key: "getTextContent_",
    value: function getTextContent_() {
      if (this.platform_.isIos() || this.platform_.isAndroid()) {
        return this.localizationService_.getLocalizedString(LocalizedStringId.AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT);
      }

      var viewportHeight = this.win_.
      /*OK*/
      innerHeight;
      var viewportWidth = this.win_.
      /*OK*/
      innerWidth;

      if (viewportHeight < this.desktopHeightThreshold_ && viewportWidth < this.desktopWidthThreshold_) {
        return this.localizationService_.getLocalizedString(LocalizedStringId.AMP_STORY_WARNING_DESKTOP_SIZE_TEXT);
      }

      if (viewportWidth < this.desktopWidthThreshold_) {
        return this.localizationService_.getLocalizedString(LocalizedStringId.AMP_STORY_WARNING_DESKTOP_WIDTH_SIZE_TEXT);
      }

      if (viewportHeight < this.desktopHeightThreshold_) {
        return this.localizationService_.getLocalizedString(LocalizedStringId.AMP_STORY_WARNING_DESKTOP_HEIGHT_SIZE_TEXT);
      }

      return null;
    }
  }]);

  return ViewportWarningLayer;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS12aWV3cG9ydC13YXJuaW5nLWxheWVyLmpzIl0sIm5hbWVzIjpbIkNTUyIsIkxvY2FsaXplZFN0cmluZ0lkIiwiU2VydmljZXMiLCJTdGF0ZVByb3BlcnR5IiwiVUlUeXBlIiwiZ2V0U3RvcmVTZXJ2aWNlIiwiY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSIsImdldExvY2FsaXphdGlvblNlcnZpY2UiLCJodG1sRm9yIiwibGlzdGVuIiwidGhyb3R0bGUiLCJMQU5EU0NBUEVfT1ZFUkxBWV9DTEFTUyIsIlJFU0laRV9USFJPVFRMRV9NUyIsImdldFRlbXBsYXRlIiwiZWxlbWVudCIsIlZpZXdwb3J0V2FybmluZ0xheWVyIiwid2luIiwic3RvcnlFbGVtZW50IiwiZGVza3RvcFdpZHRoVGhyZXNob2xkIiwiZGVza3RvcEhlaWdodFRocmVzaG9sZCIsIndpbl8iLCJkZXNrdG9wSGVpZ2h0VGhyZXNob2xkXyIsImRlc2t0b3BXaWR0aFRocmVzaG9sZF8iLCJpc0J1aWx0XyIsImxvY2FsaXphdGlvblNlcnZpY2VfIiwib3ZlcmxheUVsXyIsInBsYXRmb3JtXyIsInBsYXRmb3JtRm9yIiwic3RvcmVTZXJ2aWNlXyIsInN0b3J5RWxlbWVudF8iLCJ1bmxpc3RlblJlc2l6ZUV2ZW50c18iLCJ2c3luY18iLCJ2c3luY0ZvciIsImluaXRpYWxpemVMaXN0ZW5lcnNfIiwiaXNCdWlsdCIsImdldFZpZXdwb3J0V2FybmluZ092ZXJsYXlUZW1wbGF0ZV8iLCJyb290IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwib25VSVN0YXRlVXBkYXRlXyIsImdldCIsIlVJX1NUQVRFIiwibXV0YXRlIiwiaW5zZXJ0QmVmb3JlIiwiZmlyc3RDaGlsZCIsInN1YnNjcmliZSIsInVpU3RhdGUiLCJWSUVXUE9SVF9XQVJOSU5HX1NUQVRFIiwidmlld3BvcnRXYXJuaW5nU3RhdGUiLCJvblZpZXdwb3J0V2FybmluZ1N0YXRlVXBkYXRlXyIsImlzTW9iaWxlIiwiTU9CSUxFIiwic2hvdWxkU2hvd0xhbmRzY2FwZU92ZXJsYXkiLCJidWlsZCIsInJlc2l6ZVRocm90dGxlIiwib25SZXNpemVfIiwidXBkYXRlVGV4dENvbnRlbnRfIiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwiREVTS1RPUF9QQU5FTFMiLCJzZXRBdHRyaWJ1dGUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJ0ZW1wbGF0ZSIsImljb25FbCIsInF1ZXJ5U2VsZWN0b3IiLCJpc0lvcyIsImlzQW5kcm9pZCIsImFkZCIsInRleHRFbCIsInRleHRDb250ZW50IiwicnVuIiwibWVhc3VyZSIsImdldFRleHRDb250ZW50XyIsImdldExvY2FsaXplZFN0cmluZyIsIkFNUF9TVE9SWV9XQVJOSU5HX0xBTkRTQ0FQRV9PUklFTlRBVElPTl9URVhUIiwidmlld3BvcnRIZWlnaHQiLCJpbm5lckhlaWdodCIsInZpZXdwb3J0V2lkdGgiLCJpbm5lcldpZHRoIiwiQU1QX1NUT1JZX1dBUk5JTkdfREVTS1RPUF9TSVpFX1RFWFQiLCJBTVBfU1RPUllfV0FSTklOR19ERVNLVE9QX1dJRFRIX1NJWkVfVEVYVCIsIkFNUF9TVE9SWV9XQVJOSU5HX0RFU0tUT1BfSEVJR0hUX1NJWkVfVEVYVCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLEdBQVI7QUFDQSxTQUFRQyxpQkFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUNFQyxhQURGLEVBRUVDLE1BRkYsRUFHRUMsZUFIRjtBQUtBLFNBQVFDLHlCQUFSO0FBQ0EsU0FBUUMsc0JBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsTUFBUjtBQUNBLFNBQVFDLFFBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyx1QkFBdUIsR0FBRywyQkFBaEM7O0FBRUE7QUFDQSxJQUFNQyxrQkFBa0IsR0FBRyxHQUEzQjs7QUFFQTtBQUNB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SFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS12aWV3cG9ydC13YXJuaW5nLWxheWVyLTEuMC5jc3MnO1xuaW1wb3J0IHtMb2NhbGl6ZWRTdHJpbmdJZH0gZnJvbSAnI3NlcnZpY2UvbG9jYWxpemF0aW9uL3N0cmluZ3MnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtcbiAgU3RhdGVQcm9wZXJ0eSxcbiAgVUlUeXBlLFxuICBnZXRTdG9yZVNlcnZpY2UsXG59IGZyb20gJy4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UnO1xuaW1wb3J0IHtjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7Z2V0TG9jYWxpemF0aW9uU2VydmljZX0gZnJvbSAnLi9hbXAtc3RvcnktbG9jYWxpemF0aW9uLXNlcnZpY2UnO1xuaW1wb3J0IHtodG1sRm9yfSBmcm9tICcjY29yZS9kb20vc3RhdGljLXRlbXBsYXRlJztcbmltcG9ydCB7bGlzdGVufSBmcm9tICcuLi8uLi8uLi9zcmMvZXZlbnQtaGVscGVyJztcbmltcG9ydCB7dGhyb3R0bGV9IGZyb20gJyNjb3JlL3R5cGVzL2Z1bmN0aW9uJztcblxuLyoqXG4gKiBDU1MgY2xhc3MgaW5kaWNhdGluZyB0aGUgZm9ybWF0IGlzIGxhbmRzY2FwZS5cbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBMQU5EU0NBUEVfT1ZFUkxBWV9DTEFTUyA9ICdpLWFtcGh0bWwtc3RvcnktbGFuZHNjYXBlJztcblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgUkVTSVpFX1RIUk9UVExFX01TID0gMzAwO1xuXG4vKipcbiAqIFZpZXdwb3J0IHdhcm5pbmcgbGF5ZXIgdGVtcGxhdGUuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuY29uc3QgZ2V0VGVtcGxhdGUgPSAoZWxlbWVudCkgPT4ge1xuICByZXR1cm4gaHRtbEZvcihlbGVtZW50KWBcbiAgICA8ZGl2IGNsYXNzPVwiXG4gICAgICAgIGktYW1waHRtbC1zdG9yeS1uby1yb3RhdGlvbi1vdmVybGF5IGktYW1waHRtbC1zdG9yeS1zeXN0ZW0tcmVzZXRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtb3ZlcmxheS1jb250YWluZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1vdmVybGF5LWljb25cIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1vdmVybGF5LXRleHRcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufTtcblxuLyoqXG4gKiBWaWV3cG9ydCB3YXJuaW5nIGxheWVyIFVJLlxuICovXG5leHBvcnQgY2xhc3MgVmlld3BvcnRXYXJuaW5nTGF5ZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gc3RvcnlFbGVtZW50IEVsZW1lbnQgd2hlcmUgdG8gYXBwZW5kIHRoZSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlc2t0b3BXaWR0aFRocmVzaG9sZCBUaHJlc2hvbGQgaW4gcHguXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZXNrdG9wSGVpZ2h0VGhyZXNob2xkIFRocmVzaG9sZCBpbiBweC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHdpbixcbiAgICBzdG9yeUVsZW1lbnQsXG4gICAgZGVza3RvcFdpZHRoVGhyZXNob2xkLFxuICAgIGRlc2t0b3BIZWlnaHRUaHJlc2hvbGRcbiAgKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmRlc2t0b3BIZWlnaHRUaHJlc2hvbGRfID0gZGVza3RvcEhlaWdodFRocmVzaG9sZDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuZGVza3RvcFdpZHRoVGhyZXNob2xkXyA9IGRlc2t0b3BXaWR0aFRocmVzaG9sZDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzQnVpbHRfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgez8uLi8uLi8uLi9zcmMvc2VydmljZS9sb2NhbGl6YXRpb24uTG9jYWxpemF0aW9uU2VydmljZX0gKi9cbiAgICB0aGlzLmxvY2FsaXphdGlvblNlcnZpY2VfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5vdmVybGF5RWxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9wbGF0Zm9ybS1pbXBsLlBsYXRmb3JtfSAqL1xuICAgIHRoaXMucGxhdGZvcm1fID0gU2VydmljZXMucGxhdGZvcm1Gb3IodGhpcy53aW5fKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IGdldFN0b3JlU2VydmljZSh0aGlzLndpbl8pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5zdG9yeUVsZW1lbnRfID0gc3RvcnlFbGVtZW50O1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RnVuY3Rpb259ICovXG4gICAgdGhpcy51bmxpc3RlblJlc2l6ZUV2ZW50c18gPSBudWxsO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZzeW5jLWltcGwuVnN5bmN9ICovXG4gICAgdGhpcy52c3luY18gPSBTZXJ2aWNlcy52c3luY0Zvcih0aGlzLndpbl8pO1xuXG4gICAgdGhpcy5pbml0aWFsaXplTGlzdGVuZXJzXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbmQgYXBwZW5kcyB0aGUgY29tcG9uZW50IGluIHRoZSBzdG9yeS5cbiAgICovXG4gIGJ1aWxkKCkge1xuICAgIGlmICh0aGlzLmlzQnVpbHQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMub3ZlcmxheUVsXyA9IHRoaXMuZ2V0Vmlld3BvcnRXYXJuaW5nT3ZlcmxheVRlbXBsYXRlXygpO1xuICAgIHRoaXMubG9jYWxpemF0aW9uU2VydmljZV8gPSBnZXRMb2NhbGl6YXRpb25TZXJ2aWNlKHRoaXMuc3RvcnlFbGVtZW50Xyk7XG5cbiAgICB0aGlzLmlzQnVpbHRfID0gdHJ1ZTtcbiAgICBjb25zdCByb290ID0gdGhpcy53aW5fLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZShyb290LCB0aGlzLm92ZXJsYXlFbF8sIENTUyk7XG5cbiAgICAvLyBJbml0aWFsaXplcyB0aGUgVUkgc3RhdGUgbm93IHRoYXQgdGhlIGNvbXBvbmVudCBpcyBidWlsdC5cbiAgICB0aGlzLm9uVUlTdGF0ZVVwZGF0ZV8oXG4gICAgICAvKiogQHR5cGUgeyFVSVR5cGV9ICovXG4gICAgICAodGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LlVJX1NUQVRFKSlcbiAgICApO1xuXG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgIHRoaXMuc3RvcnlFbGVtZW50Xy5pbnNlcnRCZWZvcmUocm9vdCwgdGhpcy5zdG9yeUVsZW1lbnRfLmZpcnN0Q2hpbGQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGVsZW1lbnQgaGFzIGJlZW4gYnVpbHQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc0J1aWx0KCkge1xuICAgIHJldHVybiB0aGlzLmlzQnVpbHRfO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplTGlzdGVuZXJzXygpIHtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5VSV9TVEFURSxcbiAgICAgICh1aVN0YXRlKSA9PiB7XG4gICAgICAgIHRoaXMub25VSVN0YXRlVXBkYXRlXyh1aVN0YXRlKTtcbiAgICAgIH0sXG4gICAgICB0cnVlIC8qKiBjYWxsVG9Jbml0aWFsaXplICovXG4gICAgKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlZJRVdQT1JUX1dBUk5JTkdfU1RBVEUsXG4gICAgICAodmlld3BvcnRXYXJuaW5nU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5vblZpZXdwb3J0V2FybmluZ1N0YXRlVXBkYXRlXyh2aWV3cG9ydFdhcm5pbmdTdGF0ZSk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIHRoZSB2aWV3cG9ydCB3YXJuaW5nIHN0YXRlIHVwZGF0ZSwgb25seSBvbiBtb2JpbGUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmlld3BvcnRXYXJuaW5nU3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uVmlld3BvcnRXYXJuaW5nU3RhdGVVcGRhdGVfKHZpZXdwb3J0V2FybmluZ1N0YXRlKSB7XG4gICAgY29uc3QgaXNNb2JpbGUgPVxuICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LlVJX1NUQVRFKSA9PT0gVUlUeXBlLk1PQklMRTtcblxuICAgIC8vIEFkZHMgdGhlIGxhbmRzY2FwZSBjbGFzcyBpZiB3ZSBhcmUgbW9iaWxlIGxhbmRzY2FwZS5cbiAgICBjb25zdCBzaG91bGRTaG93TGFuZHNjYXBlT3ZlcmxheSA9IGlzTW9iaWxlICYmIHZpZXdwb3J0V2FybmluZ1N0YXRlO1xuXG4gICAgLy8gRG9uJ3QgYnVpbGQgdGhlIGxheWVyIHVudGlsIHdlIG5lZWQgdG8gZGlzcGxheSBpdC5cbiAgICBpZiAoIXNob3VsZFNob3dMYW5kc2NhcGVPdmVybGF5ICYmICF0aGlzLmlzQnVpbHQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVpbGQoKTtcblxuICAgIC8vIExpc3RlbiB0byByZXNpemUgZXZlbnRzIHRvIHVwZGF0ZSB0aGUgVUkgbWVzc2FnZS5cbiAgICBpZiAodmlld3BvcnRXYXJuaW5nU3RhdGUpIHtcbiAgICAgIGNvbnN0IHJlc2l6ZVRocm90dGxlID0gdGhyb3R0bGUoXG4gICAgICAgIHRoaXMud2luXyxcbiAgICAgICAgKCkgPT4gdGhpcy5vblJlc2l6ZV8oKSxcbiAgICAgICAgUkVTSVpFX1RIUk9UVExFX01TXG4gICAgICApO1xuICAgICAgdGhpcy51bmxpc3RlblJlc2l6ZUV2ZW50c18gPSBsaXN0ZW4odGhpcy53aW5fLCAncmVzaXplJywgcmVzaXplVGhyb3R0bGUpO1xuICAgIH0gZWxzZSBpZiAodGhpcy51bmxpc3RlblJlc2l6ZUV2ZW50c18pIHtcbiAgICAgIHRoaXMudW5saXN0ZW5SZXNpemVFdmVudHNfKCk7XG4gICAgICB0aGlzLnVubGlzdGVuUmVzaXplRXZlbnRzXyA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVUZXh0Q29udGVudF8oKTtcblxuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLm92ZXJsYXlFbF8uY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICAgTEFORFNDQVBFX09WRVJMQVlfQ0xBU1MsXG4gICAgICAgIHNob3VsZFNob3dMYW5kc2NhcGVPdmVybGF5XG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBVSSBzdGF0ZSB1cGRhdGVzLlxuICAgKiBAcGFyYW0geyFVSVR5cGV9IHVpU3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uVUlTdGF0ZVVwZGF0ZV8odWlTdGF0ZSkge1xuICAgIGlmICghdGhpcy5pc0J1aWx0KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnZzeW5jXy5tdXRhdGUoKCkgPT4ge1xuICAgICAgdWlTdGF0ZSA9PT0gVUlUeXBlLkRFU0tUT1BfUEFORUxTXG4gICAgICAgID8gdGhpcy5vdmVybGF5RWxfLnNldEF0dHJpYnV0ZSgnZGVza3RvcCcsICcnKVxuICAgICAgICA6IHRoaXMub3ZlcmxheUVsXy5yZW1vdmVBdHRyaWJ1dGUoJ2Rlc2t0b3AnKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25SZXNpemVfKCkge1xuICAgIHRoaXMudXBkYXRlVGV4dENvbnRlbnRfKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3ZlcmxheSBjb3JyZXNwb25kaW5nIHRvIHRoZSBkZXZpY2UgY3VycmVudGx5IHVzZWQuXG4gICAqIEByZXR1cm4geyFFbGVtZW50fSB0ZW1wbGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0Vmlld3BvcnRXYXJuaW5nT3ZlcmxheVRlbXBsYXRlXygpIHtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IGdldFRlbXBsYXRlKHRoaXMuc3RvcnlFbGVtZW50Xyk7XG4gICAgY29uc3QgaWNvbkVsID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmktYW1waHRtbC1zdG9yeS1vdmVybGF5LWljb24nKTtcblxuICAgIGlmICh0aGlzLnBsYXRmb3JtXy5pc0lvcygpIHx8IHRoaXMucGxhdGZvcm1fLmlzQW5kcm9pZCgpKSB7XG4gICAgICBpY29uRWwuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXJvdGF0ZS1pY29uJyk7XG4gICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxuXG4gICAgaWNvbkVsLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1kZXNrdG9wLXNpemUtaWNvbicpO1xuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBVSSBtZXNzYWdlIGRpc3BsYXllZCB0byB0aGUgdXNlci5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZVRleHRDb250ZW50XygpIHtcbiAgICBjb25zdCB0ZXh0RWwgPSB0aGlzLm92ZXJsYXlFbF8ucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LW92ZXJsYXktdGV4dCdcbiAgICApO1xuICAgIGxldCB0ZXh0Q29udGVudDtcblxuICAgIHRoaXMudnN5bmNfLnJ1bih7XG4gICAgICBtZWFzdXJlOiAoKSA9PiB7XG4gICAgICAgIHRleHRDb250ZW50ID0gdGhpcy5nZXRUZXh0Q29udGVudF8oKTtcbiAgICAgIH0sXG4gICAgICBtdXRhdGU6ICgpID0+IHtcbiAgICAgICAgaWYgKCF0ZXh0Q29udGVudCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRleHRFbC50ZXh0Q29udGVudCA9IHRleHRDb250ZW50O1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsb2NhbGl6ZWQgbWVzc2FnZSB0byBkaXNwbGF5LCBkZXBlbmRpbmcgb24gdGhlIHZpZXdwb3J0IHNpemUuIEhhc1xuICAgKiB0byBydW4gZHVyaW5nIGEgbWVhc3VyZSBwaGFzZS5cbiAgICogQHJldHVybiB7P3N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldFRleHRDb250ZW50XygpIHtcbiAgICBpZiAodGhpcy5wbGF0Zm9ybV8uaXNJb3MoKSB8fCB0aGlzLnBsYXRmb3JtXy5pc0FuZHJvaWQoKSkge1xuICAgICAgcmV0dXJuIHRoaXMubG9jYWxpemF0aW9uU2VydmljZV8uZ2V0TG9jYWxpemVkU3RyaW5nKFxuICAgICAgICBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfV0FSTklOR19MQU5EU0NBUEVfT1JJRU5UQVRJT05fVEVYVFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCB2aWV3cG9ydEhlaWdodCA9IHRoaXMud2luXy4vKk9LKi8gaW5uZXJIZWlnaHQ7XG4gICAgY29uc3Qgdmlld3BvcnRXaWR0aCA9IHRoaXMud2luXy4vKk9LKi8gaW5uZXJXaWR0aDtcblxuICAgIGlmIChcbiAgICAgIHZpZXdwb3J0SGVpZ2h0IDwgdGhpcy5kZXNrdG9wSGVpZ2h0VGhyZXNob2xkXyAmJlxuICAgICAgdmlld3BvcnRXaWR0aCA8IHRoaXMuZGVza3RvcFdpZHRoVGhyZXNob2xkX1xuICAgICkge1xuICAgICAgcmV0dXJuIHRoaXMubG9jYWxpemF0aW9uU2VydmljZV8uZ2V0TG9jYWxpemVkU3RyaW5nKFxuICAgICAgICBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfV0FSTklOR19ERVNLVE9QX1NJWkVfVEVYVFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodmlld3BvcnRXaWR0aCA8IHRoaXMuZGVza3RvcFdpZHRoVGhyZXNob2xkXykge1xuICAgICAgcmV0dXJuIHRoaXMubG9jYWxpemF0aW9uU2VydmljZV8uZ2V0TG9jYWxpemVkU3RyaW5nKFxuICAgICAgICBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfV0FSTklOR19ERVNLVE9QX1dJRFRIX1NJWkVfVEVYVFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodmlld3BvcnRIZWlnaHQgPCB0aGlzLmRlc2t0b3BIZWlnaHRUaHJlc2hvbGRfKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2NhbGl6YXRpb25TZXJ2aWNlXy5nZXRMb2NhbGl6ZWRTdHJpbmcoXG4gICAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9XQVJOSU5HX0RFU0tUT1BfSEVJR0hUX1NJWkVfVEVYVFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-viewport-warning-layer.js