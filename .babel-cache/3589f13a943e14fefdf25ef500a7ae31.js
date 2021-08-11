var _templateObject, _templateObject2;

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
import { ANALYTICS_TAG_NAME, StoryAnalyticsEvent, getAnalyticsService } from "./story-analytics";
import { Action, StateProperty, UIType, getStoreService } from "./amp-story-store-service";
import { CSS } from "../../../build/amp-story-share-menu-1.0.css";
import { Keys } from "../../../src/core/constants/key-codes";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { ShareWidget } from "./amp-story-share";
import { closest } from "../../../src/core/dom/query";
import { createShadowRootWithStyle } from "./utils";
import { dev, devAssert } from "../../../src/log";
import { getAmpdoc } from "../../../src/service-helpers";
import { getLocalizationService } from "./amp-story-localization-service";
import { htmlFor } from "../../../src/core/dom/static-template";
import { setStyles } from "../../../src/core/dom/style";

/** @const {string} Class to toggle the share menu. */
export var VISIBLE_CLASS = 'i-amphtml-story-share-menu-visible';

/**
 * Quick share template, used as a fallback if native sharing is not supported.
 * @param {!Element} element
 * @return {!Element}
 */
var getTemplate = function getTemplate(element) {
  return htmlFor(element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-story-share-menu i-amphtml-story-system-reset\" aria-hidden=\"true\" role=\"alert\">\n      <div class=\"i-amphtml-story-share-menu-container\">\n        <button class=\"i-amphtml-story-share-menu-close-button\" aria-label=\"close\" role=\"button\">\n          &times;\n        </button>\n      </div>\n    </div>"])));
};

/**
 * System amp-social-share button template.
 * @param {!Element} element
 * @return {!Element}
 */
var getAmpSocialSystemShareTemplate = function getAmpSocialSystemShareTemplate(element) {
  return htmlFor(element)(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["<amp-social-share type=\"system\"></amp-social-share>"])));
};

/**
 * Share menu UI.
 */
export var ShareMenu = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl Element where to append the component
   */
  function ShareMenu(win, storyEl) {
    _classCallCheck(this, ShareMenu);

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {?Element} */
    this.closeButton_ = null;

    /** @private {?Element} */
    this.innerContainerEl_ = null;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {boolean} */
    this.isSystemShareSupported_ = false;

    /** @private @const {!ShareWidget} */
    this.shareWidget_ = ShareWidget.create(this.win_, storyEl);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win_, storyEl);

    /** @private @const {!Element} */
    this.parentEl_ = storyEl;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);
  }

  /**
   * Builds and appends the component in the story. Could build either the
   * amp-social-share button to display the native system sharing, or a fallback
   * UI.
   */
  _createClass(ShareMenu, [{
    key: "build",
    value: function build() {
      if (this.isBuilt()) {
        return;
      }

      this.isBuilt_ = true;
      this.isSystemShareSupported_ = this.shareWidget_.isSystemShareSupported(getAmpdoc(this.parentEl_));
      this.isSystemShareSupported_ ? this.buildForSystemSharing_() : this.buildForFallbackSharing_();
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
     * Builds a hidden amp-social-share button that triggers the native system
     * sharing UI.
     * @private
     */

  }, {
    key: "buildForSystemSharing_",
    value: function buildForSystemSharing_() {
      var _this = this;

      this.shareWidget_.loadRequiredExtensions(getAmpdoc(this.parentEl_));
      this.element_ = getAmpSocialSystemShareTemplate(this.parentEl_);
      this.initializeListeners_();
      this.vsync_.mutate(function () {
        setStyles(dev().assertElement(_this.element_), {
          'visibility': 'hidden',
          'pointer-events': 'none',
          'z-index': -1
        });

        _this.parentEl_.appendChild(_this.element_);
      });
    }
    /**
     * Builds and appends the fallback UI.
     * @private
     */

  }, {
    key: "buildForFallbackSharing_",
    value: function buildForFallbackSharing_() {
      var _this2 = this;

      var root = this.win_.document.createElement('div');
      root.classList.add('i-amphtml-story-share-menu-host');
      this.element_ = getTemplate(this.parentEl_);
      createShadowRootWithStyle(root, this.element_, CSS);
      this.closeButton_ = dev().assertElement(this.element_.querySelector('.i-amphtml-story-share-menu-close-button'));
      var localizationService = getLocalizationService(devAssert(this.parentEl_));

      if (localizationService) {
        var localizedCloseString = localizationService.getLocalizedString(LocalizedStringId.AMP_STORY_CLOSE_BUTTON_LABEL);
        this.closeButton_.setAttribute('aria-label', localizedCloseString);
      }

      this.initializeListeners_();
      this.vsync_.run({
        measure: function measure() {
          _this2.innerContainerEl_ = _this2.element_.
          /*OK*/
          querySelector('.i-amphtml-story-share-menu-container');
        },
        mutate: function mutate() {
          _this2.parentEl_.appendChild(root);

          // Preloads and renders the share widget content.
          var shareWidget = _this2.shareWidget_.build(getAmpdoc(_this2.parentEl_));

          _this2.innerContainerEl_.appendChild(shareWidget);
        }
      });
    }
    /**
     * @private
     */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this3 = this;

      this.storeService_.subscribe(StateProperty.UI_STATE, function (uiState) {
        _this3.onUIStateUpdate_(uiState);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.SHARE_MENU_STATE, function (isOpen) {
        _this3.onShareMenuStateUpdate_(isOpen);
      });

      // Don't listen to click events if the system share is supported, since the
      // native layer handles all the UI interactions.
      if (!this.isSystemShareSupported_) {
        this.element_.addEventListener('click', function (event) {
          return _this3.onShareMenuClick_(event);
        });
        this.win_.addEventListener('keyup', function (event) {
          if (event.key == Keys.ESCAPE) {
            event.preventDefault();

            _this3.close_();
          }
        });
      }
    }
    /**
     * Reacts to menu state updates and decides whether to show either the native
     * system sharing, or the fallback UI.
     * @param {boolean} isOpen
     * @private
     */

  }, {
    key: "onShareMenuStateUpdate_",
    value: function onShareMenuStateUpdate_(isOpen) {
      var _this4 = this;

      if (this.isSystemShareSupported_ && isOpen) {
        // Dispatches a click event on the amp-social-share button to trigger the
        // native system sharing UI. This has to be done upon user interaction.
        this.element_.dispatchEvent(new Event('click'));
        // There is no way to know when the user dismisses the native system share
        // menu, so we pretend it is closed on the story end, and let the native
        // end handle the UI interactions.
        this.close_();
      }

      if (!this.isSystemShareSupported_) {
        this.vsync_.mutate(function () {
          _this4.element_.classList.toggle(VISIBLE_CLASS, isOpen);

          _this4.element_.setAttribute('aria-hidden', !isOpen);
        });
      }

      this.element_[ANALYTICS_TAG_NAME] = 'amp-story-share-menu';
      this.analyticsService_.triggerEvent(isOpen ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE, this.element_);
    }
    /**
     * Handles click events and maybe closes the menu for the fallback UI.
     * @param  {!Event} event
     */

  }, {
    key: "onShareMenuClick_",
    value: function onShareMenuClick_(event) {
      var _this5 = this;

      var el = dev().assertElement(event.target);

      if (el === this.closeButton_) {
        this.close_();
      }

      // Closes the menu if click happened outside of the menu main container.
      if (!closest(el, function (el) {
        return el === _this5.innerContainerEl_;
      }, this.element_)) {
        this.close_();
      }
    }
    /**
     * Reacts to UI state updates and triggers the right UI.
     * @param {!UIType} uiState
     * @private
     */

  }, {
    key: "onUIStateUpdate_",
    value: function onUIStateUpdate_(uiState) {
      var _this6 = this;

      this.vsync_.mutate(function () {
        uiState !== UIType.MOBILE ? _this6.element_.setAttribute('desktop', '') : _this6.element_.removeAttribute('desktop');
      });
    }
    /**
     * Closes the share menu.
     * @private
     */

  }, {
    key: "close_",
    value: function close_() {
      this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, false);
    }
  }]);

  return ShareMenu;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1zaGFyZS1tZW51LmpzIl0sIm5hbWVzIjpbIkFOQUxZVElDU19UQUdfTkFNRSIsIlN0b3J5QW5hbHl0aWNzRXZlbnQiLCJnZXRBbmFseXRpY3NTZXJ2aWNlIiwiQWN0aW9uIiwiU3RhdGVQcm9wZXJ0eSIsIlVJVHlwZSIsImdldFN0b3JlU2VydmljZSIsIkNTUyIsIktleXMiLCJMb2NhbGl6ZWRTdHJpbmdJZCIsIlNlcnZpY2VzIiwiU2hhcmVXaWRnZXQiLCJjbG9zZXN0IiwiY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSIsImRldiIsImRldkFzc2VydCIsImdldEFtcGRvYyIsImdldExvY2FsaXphdGlvblNlcnZpY2UiLCJodG1sRm9yIiwic2V0U3R5bGVzIiwiVklTSUJMRV9DTEFTUyIsImdldFRlbXBsYXRlIiwiZWxlbWVudCIsImdldEFtcFNvY2lhbFN5c3RlbVNoYXJlVGVtcGxhdGUiLCJTaGFyZU1lbnUiLCJ3aW4iLCJzdG9yeUVsIiwid2luXyIsImVsZW1lbnRfIiwiY2xvc2VCdXR0b25fIiwiaW5uZXJDb250YWluZXJFbF8iLCJpc0J1aWx0XyIsImlzU3lzdGVtU2hhcmVTdXBwb3J0ZWRfIiwic2hhcmVXaWRnZXRfIiwiY3JlYXRlIiwic3RvcmVTZXJ2aWNlXyIsImFuYWx5dGljc1NlcnZpY2VfIiwicGFyZW50RWxfIiwidnN5bmNfIiwidnN5bmNGb3IiLCJpc0J1aWx0IiwiaXNTeXN0ZW1TaGFyZVN1cHBvcnRlZCIsImJ1aWxkRm9yU3lzdGVtU2hhcmluZ18iLCJidWlsZEZvckZhbGxiYWNrU2hhcmluZ18iLCJsb2FkUmVxdWlyZWRFeHRlbnNpb25zIiwiaW5pdGlhbGl6ZUxpc3RlbmVyc18iLCJtdXRhdGUiLCJhc3NlcnRFbGVtZW50IiwiYXBwZW5kQ2hpbGQiLCJyb290IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwicXVlcnlTZWxlY3RvciIsImxvY2FsaXphdGlvblNlcnZpY2UiLCJsb2NhbGl6ZWRDbG9zZVN0cmluZyIsImdldExvY2FsaXplZFN0cmluZyIsIkFNUF9TVE9SWV9DTE9TRV9CVVRUT05fTEFCRUwiLCJzZXRBdHRyaWJ1dGUiLCJydW4iLCJtZWFzdXJlIiwic2hhcmVXaWRnZXQiLCJidWlsZCIsInN1YnNjcmliZSIsIlVJX1NUQVRFIiwidWlTdGF0ZSIsIm9uVUlTdGF0ZVVwZGF0ZV8iLCJTSEFSRV9NRU5VX1NUQVRFIiwiaXNPcGVuIiwib25TaGFyZU1lbnVTdGF0ZVVwZGF0ZV8iLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJvblNoYXJlTWVudUNsaWNrXyIsImtleSIsIkVTQ0FQRSIsInByZXZlbnREZWZhdWx0IiwiY2xvc2VfIiwiZGlzcGF0Y2hFdmVudCIsIkV2ZW50IiwidG9nZ2xlIiwidHJpZ2dlckV2ZW50IiwiT1BFTiIsIkNMT1NFIiwiZWwiLCJ0YXJnZXQiLCJNT0JJTEUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJkaXNwYXRjaCIsIlRPR0dMRV9TSEFSRV9NRU5VIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsa0JBREYsRUFFRUMsbUJBRkYsRUFHRUMsbUJBSEY7QUFLQSxTQUNFQyxNQURGLEVBRUVDLGFBRkYsRUFHRUMsTUFIRixFQUlFQyxlQUpGO0FBTUEsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyxpQkFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxXQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLHlCQUFSO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxTQUFiO0FBQ0EsU0FBUUMsU0FBUjtBQUNBLFNBQVFDLHNCQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLFNBQVI7O0FBRUE7QUFDQSxPQUFPLElBQU1DLGFBQWEsR0FBRyxvQ0FBdEI7O0FBRVA7QUFDQTtB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WCxPQUFqQixFQUEwQjtBQUFBOztBQUN4QixXQUFLNUIsTUFBTCxDQUFZUSxNQUFaLENBQW1CLFlBQU07QUFDdkJvQixRQUFBQSxPQUFPLEtBQUs3RCxNQUFNLENBQUNpRixNQUFuQixHQUNJLE1BQUksQ0FBQzFELFFBQUwsQ0FBYytCLFlBQWQsQ0FBMkIsU0FBM0IsRUFBc0MsRUFBdEMsQ0FESixHQUVJLE1BQUksQ0FBQy9CLFFBQUwsQ0FBYzJELGVBQWQsQ0FBOEIsU0FBOUIsQ0FGSjtBQUdELE9BSkQ7QUFLRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQW5PQTtBQUFBO0FBQUEsV0FvT0Usa0JBQVM7QUFDUCxXQUFLcEQsYUFBTCxDQUFtQnFELFFBQW5CLENBQTRCckYsTUFBTSxDQUFDc0YsaUJBQW5DLEVBQXNELEtBQXREO0FBQ0Q7QUF0T0g7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBBTkFMWVRJQ1NfVEFHX05BTUUsXG4gIFN0b3J5QW5hbHl0aWNzRXZlbnQsXG4gIGdldEFuYWx5dGljc1NlcnZpY2UsXG59IGZyb20gJy4vc3RvcnktYW5hbHl0aWNzJztcbmltcG9ydCB7XG4gIEFjdGlvbixcbiAgU3RhdGVQcm9wZXJ0eSxcbiAgVUlUeXBlLFxuICBnZXRTdG9yZVNlcnZpY2UsXG59IGZyb20gJy4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UnO1xuaW1wb3J0IHtDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1zaGFyZS1tZW51LTEuMC5jc3MnO1xuaW1wb3J0IHtLZXlzfSBmcm9tICcjY29yZS9jb25zdGFudHMva2V5LWNvZGVzJztcbmltcG9ydCB7TG9jYWxpemVkU3RyaW5nSWR9IGZyb20gJyNzZXJ2aWNlL2xvY2FsaXphdGlvbi9zdHJpbmdzJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7U2hhcmVXaWRnZXR9IGZyb20gJy4vYW1wLXN0b3J5LXNoYXJlJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcbmltcG9ydCB7Y3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZX0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7Z2V0QW1wZG9jfSBmcm9tICcuLi8uLi8uLi9zcmMvc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7Z2V0TG9jYWxpemF0aW9uU2VydmljZX0gZnJvbSAnLi9hbXAtc3RvcnktbG9jYWxpemF0aW9uLXNlcnZpY2UnO1xuaW1wb3J0IHtodG1sRm9yfSBmcm9tICcjY29yZS9kb20vc3RhdGljLXRlbXBsYXRlJztcbmltcG9ydCB7c2V0U3R5bGVzfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9IENsYXNzIHRvIHRvZ2dsZSB0aGUgc2hhcmUgbWVudS4gKi9cbmV4cG9ydCBjb25zdCBWSVNJQkxFX0NMQVNTID0gJ2ktYW1waHRtbC1zdG9yeS1zaGFyZS1tZW51LXZpc2libGUnO1xuXG4vKipcbiAqIFF1aWNrIHNoYXJlIHRlbXBsYXRlLCB1c2VkIGFzIGEgZmFsbGJhY2sgaWYgbmF0aXZlIHNoYXJpbmcgaXMgbm90IHN1cHBvcnRlZC5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5jb25zdCBnZXRUZW1wbGF0ZSA9IChlbGVtZW50KSA9PiB7XG4gIHJldHVybiBodG1sRm9yKGVsZW1lbnQpYFxuICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3Rvcnktc2hhcmUtbWVudSBpLWFtcGh0bWwtc3Rvcnktc3lzdGVtLXJlc2V0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LXNoYXJlLW1lbnUtY29udGFpbmVyXCI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJpLWFtcGh0bWwtc3Rvcnktc2hhcmUtbWVudS1jbG9zZS1idXR0b25cIiBhcmlhLWxhYmVsPVwiY2xvc2VcIiByb2xlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgJnRpbWVzO1xuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PmA7XG59O1xuXG4vKipcbiAqIFN5c3RlbSBhbXAtc29jaWFsLXNoYXJlIGJ1dHRvbiB0ZW1wbGF0ZS5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5jb25zdCBnZXRBbXBTb2NpYWxTeXN0ZW1TaGFyZVRlbXBsYXRlID0gKGVsZW1lbnQpID0+IHtcbiAgcmV0dXJuIGh0bWxGb3IoZWxlbWVudClgPGFtcC1zb2NpYWwtc2hhcmUgdHlwZT1cInN5c3RlbVwiPjwvYW1wLXNvY2lhbC1zaGFyZT5gO1xufTtcblxuLyoqXG4gKiBTaGFyZSBtZW51IFVJLlxuICovXG5leHBvcnQgY2xhc3MgU2hhcmVNZW51IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHN0b3J5RWwgRWxlbWVudCB3aGVyZSB0byBhcHBlbmQgdGhlIGNvbXBvbmVudFxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCBzdG9yeUVsKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuZWxlbWVudF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLmNsb3NlQnV0dG9uXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuaW5uZXJDb250YWluZXJFbF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNCdWlsdF8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzU3lzdGVtU2hhcmVTdXBwb3J0ZWRfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshU2hhcmVXaWRnZXR9ICovXG4gICAgdGhpcy5zaGFyZVdpZGdldF8gPSBTaGFyZVdpZGdldC5jcmVhdGUodGhpcy53aW5fLCBzdG9yeUVsKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IGdldFN0b3JlU2VydmljZSh0aGlzLndpbl8pO1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi9zdG9yeS1hbmFseXRpY3MuU3RvcnlBbmFseXRpY3NTZXJ2aWNlfSAqL1xuICAgIHRoaXMuYW5hbHl0aWNzU2VydmljZV8gPSBnZXRBbmFseXRpY3NTZXJ2aWNlKHRoaXMud2luXywgc3RvcnlFbCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRWxlbWVudH0gKi9cbiAgICB0aGlzLnBhcmVudEVsXyA9IHN0b3J5RWw7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvdnN5bmMtaW1wbC5Wc3luY30gKi9cbiAgICB0aGlzLnZzeW5jXyA9IFNlcnZpY2VzLnZzeW5jRm9yKHRoaXMud2luXyk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCBhcHBlbmRzIHRoZSBjb21wb25lbnQgaW4gdGhlIHN0b3J5LiBDb3VsZCBidWlsZCBlaXRoZXIgdGhlXG4gICAqIGFtcC1zb2NpYWwtc2hhcmUgYnV0dG9uIHRvIGRpc3BsYXkgdGhlIG5hdGl2ZSBzeXN0ZW0gc2hhcmluZywgb3IgYSBmYWxsYmFja1xuICAgKiBVSS5cbiAgICovXG4gIGJ1aWxkKCkge1xuICAgIGlmICh0aGlzLmlzQnVpbHQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuaXNCdWlsdF8gPSB0cnVlO1xuXG4gICAgdGhpcy5pc1N5c3RlbVNoYXJlU3VwcG9ydGVkXyA9IHRoaXMuc2hhcmVXaWRnZXRfLmlzU3lzdGVtU2hhcmVTdXBwb3J0ZWQoXG4gICAgICBnZXRBbXBkb2ModGhpcy5wYXJlbnRFbF8pXG4gICAgKTtcblxuICAgIHRoaXMuaXNTeXN0ZW1TaGFyZVN1cHBvcnRlZF9cbiAgICAgID8gdGhpcy5idWlsZEZvclN5c3RlbVNoYXJpbmdfKClcbiAgICAgIDogdGhpcy5idWlsZEZvckZhbGxiYWNrU2hhcmluZ18oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBlbGVtZW50IGhhcyBiZWVuIGJ1aWx0LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNCdWlsdCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0J1aWx0XztcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYSBoaWRkZW4gYW1wLXNvY2lhbC1zaGFyZSBidXR0b24gdGhhdCB0cmlnZ2VycyB0aGUgbmF0aXZlIHN5c3RlbVxuICAgKiBzaGFyaW5nIFVJLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYnVpbGRGb3JTeXN0ZW1TaGFyaW5nXygpIHtcbiAgICB0aGlzLnNoYXJlV2lkZ2V0Xy5sb2FkUmVxdWlyZWRFeHRlbnNpb25zKGdldEFtcGRvYyh0aGlzLnBhcmVudEVsXykpO1xuICAgIHRoaXMuZWxlbWVudF8gPSBnZXRBbXBTb2NpYWxTeXN0ZW1TaGFyZVRlbXBsYXRlKHRoaXMucGFyZW50RWxfKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUxpc3RlbmVyc18oKTtcblxuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICBzZXRTdHlsZXMoZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmVsZW1lbnRfKSwge1xuICAgICAgICAndmlzaWJpbGl0eSc6ICdoaWRkZW4nLFxuICAgICAgICAncG9pbnRlci1ldmVudHMnOiAnbm9uZScsXG4gICAgICAgICd6LWluZGV4JzogLTEsXG4gICAgICB9KTtcbiAgICAgIHRoaXMucGFyZW50RWxfLmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbmQgYXBwZW5kcyB0aGUgZmFsbGJhY2sgVUkuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBidWlsZEZvckZhbGxiYWNrU2hhcmluZ18oKSB7XG4gICAgY29uc3Qgcm9vdCA9IHRoaXMud2luXy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByb290LmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1zaGFyZS1tZW51LWhvc3QnKTtcblxuICAgIHRoaXMuZWxlbWVudF8gPSBnZXRUZW1wbGF0ZSh0aGlzLnBhcmVudEVsXyk7XG4gICAgY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZShyb290LCB0aGlzLmVsZW1lbnRfLCBDU1MpO1xuXG4gICAgdGhpcy5jbG9zZUJ1dHRvbl8gPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgdGhpcy5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yKCcuaS1hbXBodG1sLXN0b3J5LXNoYXJlLW1lbnUtY2xvc2UtYnV0dG9uJylcbiAgICApO1xuICAgIGNvbnN0IGxvY2FsaXphdGlvblNlcnZpY2UgPSBnZXRMb2NhbGl6YXRpb25TZXJ2aWNlKFxuICAgICAgZGV2QXNzZXJ0KHRoaXMucGFyZW50RWxfKVxuICAgICk7XG4gICAgaWYgKGxvY2FsaXphdGlvblNlcnZpY2UpIHtcbiAgICAgIGNvbnN0IGxvY2FsaXplZENsb3NlU3RyaW5nID0gbG9jYWxpemF0aW9uU2VydmljZS5nZXRMb2NhbGl6ZWRTdHJpbmcoXG4gICAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9DTE9TRV9CVVRUT05fTEFCRUxcbiAgICAgICk7XG4gICAgICB0aGlzLmNsb3NlQnV0dG9uXy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBsb2NhbGl6ZWRDbG9zZVN0cmluZyk7XG4gICAgfVxuXG4gICAgdGhpcy5pbml0aWFsaXplTGlzdGVuZXJzXygpO1xuXG4gICAgdGhpcy52c3luY18ucnVuKHtcbiAgICAgIG1lYXN1cmU6ICgpID0+IHtcbiAgICAgICAgdGhpcy5pbm5lckNvbnRhaW5lckVsXyA9IHRoaXMuZWxlbWVudF8uLypPSyovIHF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgJy5pLWFtcGh0bWwtc3Rvcnktc2hhcmUtbWVudS1jb250YWluZXInXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgbXV0YXRlOiAoKSA9PiB7XG4gICAgICAgIHRoaXMucGFyZW50RWxfLmFwcGVuZENoaWxkKHJvb3QpO1xuICAgICAgICAvLyBQcmVsb2FkcyBhbmQgcmVuZGVycyB0aGUgc2hhcmUgd2lkZ2V0IGNvbnRlbnQuXG4gICAgICAgIGNvbnN0IHNoYXJlV2lkZ2V0ID0gdGhpcy5zaGFyZVdpZGdldF8uYnVpbGQoZ2V0QW1wZG9jKHRoaXMucGFyZW50RWxfKSk7XG4gICAgICAgIHRoaXMuaW5uZXJDb250YWluZXJFbF8uYXBwZW5kQ2hpbGQoc2hhcmVXaWRnZXQpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZUxpc3RlbmVyc18oKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuVUlfU1RBVEUsXG4gICAgICAodWlTdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLm9uVUlTdGF0ZVVwZGF0ZV8odWlTdGF0ZSk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFN0YXRlUHJvcGVydHkuU0hBUkVfTUVOVV9TVEFURSwgKGlzT3BlbikgPT4ge1xuICAgICAgdGhpcy5vblNoYXJlTWVudVN0YXRlVXBkYXRlXyhpc09wZW4pO1xuICAgIH0pO1xuXG4gICAgLy8gRG9uJ3QgbGlzdGVuIHRvIGNsaWNrIGV2ZW50cyBpZiB0aGUgc3lzdGVtIHNoYXJlIGlzIHN1cHBvcnRlZCwgc2luY2UgdGhlXG4gICAgLy8gbmF0aXZlIGxheWVyIGhhbmRsZXMgYWxsIHRoZSBVSSBpbnRlcmFjdGlvbnMuXG4gICAgaWYgKCF0aGlzLmlzU3lzdGVtU2hhcmVTdXBwb3J0ZWRfKSB7XG4gICAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PlxuICAgICAgICB0aGlzLm9uU2hhcmVNZW51Q2xpY2tfKGV2ZW50KVxuICAgICAgKTtcblxuICAgICAgdGhpcy53aW5fLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT0gS2V5cy5FU0NBUEUpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMuY2xvc2VfKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gbWVudSBzdGF0ZSB1cGRhdGVzIGFuZCBkZWNpZGVzIHdoZXRoZXIgdG8gc2hvdyBlaXRoZXIgdGhlIG5hdGl2ZVxuICAgKiBzeXN0ZW0gc2hhcmluZywgb3IgdGhlIGZhbGxiYWNrIFVJLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzT3BlblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25TaGFyZU1lbnVTdGF0ZVVwZGF0ZV8oaXNPcGVuKSB7XG4gICAgaWYgKHRoaXMuaXNTeXN0ZW1TaGFyZVN1cHBvcnRlZF8gJiYgaXNPcGVuKSB7XG4gICAgICAvLyBEaXNwYXRjaGVzIGEgY2xpY2sgZXZlbnQgb24gdGhlIGFtcC1zb2NpYWwtc2hhcmUgYnV0dG9uIHRvIHRyaWdnZXIgdGhlXG4gICAgICAvLyBuYXRpdmUgc3lzdGVtIHNoYXJpbmcgVUkuIFRoaXMgaGFzIHRvIGJlIGRvbmUgdXBvbiB1c2VyIGludGVyYWN0aW9uLlxuICAgICAgdGhpcy5lbGVtZW50Xy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2xpY2snKSk7XG5cbiAgICAgIC8vIFRoZXJlIGlzIG5vIHdheSB0byBrbm93IHdoZW4gdGhlIHVzZXIgZGlzbWlzc2VzIHRoZSBuYXRpdmUgc3lzdGVtIHNoYXJlXG4gICAgICAvLyBtZW51LCBzbyB3ZSBwcmV0ZW5kIGl0IGlzIGNsb3NlZCBvbiB0aGUgc3RvcnkgZW5kLCBhbmQgbGV0IHRoZSBuYXRpdmVcbiAgICAgIC8vIGVuZCBoYW5kbGUgdGhlIFVJIGludGVyYWN0aW9ucy5cbiAgICAgIHRoaXMuY2xvc2VfKCk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzU3lzdGVtU2hhcmVTdXBwb3J0ZWRfKSB7XG4gICAgICB0aGlzLnZzeW5jXy5tdXRhdGUoKCkgPT4ge1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC50b2dnbGUoVklTSUJMRV9DTEFTUywgaXNPcGVuKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgIWlzT3Blbik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5lbGVtZW50X1tBTkFMWVRJQ1NfVEFHX05BTUVdID0gJ2FtcC1zdG9yeS1zaGFyZS1tZW51JztcbiAgICB0aGlzLmFuYWx5dGljc1NlcnZpY2VfLnRyaWdnZXJFdmVudChcbiAgICAgIGlzT3BlbiA/IFN0b3J5QW5hbHl0aWNzRXZlbnQuT1BFTiA6IFN0b3J5QW5hbHl0aWNzRXZlbnQuQ0xPU0UsXG4gICAgICB0aGlzLmVsZW1lbnRfXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGNsaWNrIGV2ZW50cyBhbmQgbWF5YmUgY2xvc2VzIHRoZSBtZW51IGZvciB0aGUgZmFsbGJhY2sgVUkuXG4gICAqIEBwYXJhbSAgeyFFdmVudH0gZXZlbnRcbiAgICovXG4gIG9uU2hhcmVNZW51Q2xpY2tfKGV2ZW50KSB7XG4gICAgY29uc3QgZWwgPSBkZXYoKS5hc3NlcnRFbGVtZW50KGV2ZW50LnRhcmdldCk7XG5cbiAgICBpZiAoZWwgPT09IHRoaXMuY2xvc2VCdXR0b25fKSB7XG4gICAgICB0aGlzLmNsb3NlXygpO1xuICAgIH1cblxuICAgIC8vIENsb3NlcyB0aGUgbWVudSBpZiBjbGljayBoYXBwZW5lZCBvdXRzaWRlIG9mIHRoZSBtZW51IG1haW4gY29udGFpbmVyLlxuICAgIGlmICghY2xvc2VzdChlbCwgKGVsKSA9PiBlbCA9PT0gdGhpcy5pbm5lckNvbnRhaW5lckVsXywgdGhpcy5lbGVtZW50XykpIHtcbiAgICAgIHRoaXMuY2xvc2VfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBVSSBzdGF0ZSB1cGRhdGVzIGFuZCB0cmlnZ2VycyB0aGUgcmlnaHQgVUkuXG4gICAqIEBwYXJhbSB7IVVJVHlwZX0gdWlTdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25VSVN0YXRlVXBkYXRlXyh1aVN0YXRlKSB7XG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgIHVpU3RhdGUgIT09IFVJVHlwZS5NT0JJTEVcbiAgICAgICAgPyB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnZGVza3RvcCcsICcnKVxuICAgICAgICA6IHRoaXMuZWxlbWVudF8ucmVtb3ZlQXR0cmlidXRlKCdkZXNrdG9wJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBzaGFyZSBtZW51LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2xvc2VfKCkge1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uVE9HR0xFX1NIQVJFX01FTlUsIGZhbHNlKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-share-menu.js