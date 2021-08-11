var _templateObject, _templateObject2;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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

/**
 * @fileoverview Affiliate link component that expands when clicked.
 */
import { Services } from "../../../src/service";
import { StateProperty, getStoreService } from "./amp-story-store-service";
import { StoryAnalyticsEvent, getAnalyticsService } from "./story-analytics";
import { getAmpdoc } from "../../../src/service-helpers";
import { htmlFor } from "../../../src/core/dom/static-template";

/**
 * Links that are affiliate links.
 * @const {string}
 */
export var AFFILIATE_LINK_SELECTOR = 'a[affiliate-link-icon]';

/**
 * Custom property signifying a built link.
 * @const {string}
 */
export var AFFILIATE_LINK_BUILT = '__AMP_AFFILIATE_LINK_BUILT';
export var AmpStoryAffiliateLink = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  function AmpStoryAffiliateLink(win, element) {
    _classCallCheck(this, AmpStoryAffiliateLink);

    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {?Element} */
    this.textEl_ = null;

    /** @private {?Element} */
    this.launchEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {string} */
    this.text_ = this.element_.textContent;

    /** @private @const {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(getAmpdoc(this.win_.document));

    /** @private @const {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win_, element);
  }

  /**
   * Builds affiliate link.
   */
  _createClass(AmpStoryAffiliateLink, [{
    key: "build",
    value: function build() {
      var _this = this;

      if (this.element_[AFFILIATE_LINK_BUILT]) {
        return;
      }

      this.mutator_.mutateElement(this.element_, function () {
        _this.element_.textContent = '';

        _this.element_.setAttribute('pristine', '');

        _this.addPulseElement_();

        _this.addIconElement_();

        _this.addText_();

        _this.addLaunchElement_();
      });
      this.initializeListeners_();
      this.element_[AFFILIATE_LINK_BUILT] = true;
    }
    /**
     * Initializes listeners.
     * @private
     */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this2 = this;

      this.storeService_.subscribe(StateProperty.AFFILIATE_LINK_STATE, function (elementToToggleExpand) {
        var expand = _this2.element_ === elementToToggleExpand;

        if (expand) {
          _this2.element_.setAttribute('expanded', '');

          _this2.textEl_.removeAttribute('hidden');

          _this2.launchEl_.removeAttribute('hidden');
        } else {
          _this2.element_.removeAttribute('expanded');

          _this2.textEl_.setAttribute('hidden', '');

          _this2.launchEl_.setAttribute('hidden', '');
        }

        if (expand) {
          _this2.element_.removeAttribute('pristine');

          _this2.analyticsService_.triggerEvent(StoryAnalyticsEvent.FOCUS, _this2.element_);
        }
      });
      this.element_.addEventListener('click', function (event) {
        if (_this2.element_.hasAttribute('expanded')) {
          event.stopPropagation();

          _this2.analyticsService_.triggerEvent(StoryAnalyticsEvent.CLICK_THROUGH, _this2.element_);
        }
      });
    }
    /**
     * Adds icon as a child element of <amp-story-affiliate-link>.
     * @private
     */

  }, {
    key: "addIconElement_",
    value: function addIconElement_() {
      var iconEl = htmlFor(this.element_)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-story-affiliate-link-circle\">\n        <i class=\"i-amphtml-story-affiliate-link-icon\"></i>\n        <div class=\"i-amphtml-story-reset i-amphtml-hidden\">\n          <span class=\"i-amphtml-story-affiliate-link-text\" hidden></span>\n          <i class=\"i-amphtml-story-affiliate-link-launch\" hidden></i>\n        </div>\n      </div>"])));
      this.element_.appendChild(iconEl);
    }
    /**
     * Adds text from <a> tag to expanded link.
     * @private
     */

  }, {
    key: "addText_",
    value: function addText_() {
      this.textEl_ = this.element_.querySelector('.i-amphtml-story-affiliate-link-text');
      this.textEl_.textContent = this.text_;
      this.textEl_.setAttribute('hidden', '');
    }
    /**
     * Adds launch arrow to expanded link.
     * @private
     */

  }, {
    key: "addLaunchElement_",
    value: function addLaunchElement_() {
      this.launchEl_ = this.element_.querySelector('.i-amphtml-story-affiliate-link-launch');
      this.launchEl_.setAttribute('hidden', '');
    }
    /**
     * Adds pulse as a child element of <amp-story-affiliate-link>.
     * @private
     */

  }, {
    key: "addPulseElement_",
    value: function addPulseElement_() {
      var pulseEl = htmlFor(this.element_)(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-story-affiliate-link-pulse\"></div>"])));
      this.element_.appendChild(pulseEl);
    }
  }]);

  return AmpStoryAffiliateLink;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1hZmZpbGlhdGUtbGluay5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsIlN0YXRlUHJvcGVydHkiLCJnZXRTdG9yZVNlcnZpY2UiLCJTdG9yeUFuYWx5dGljc0V2ZW50IiwiZ2V0QW5hbHl0aWNzU2VydmljZSIsImdldEFtcGRvYyIsImh0bWxGb3IiLCJBRkZJTElBVEVfTElOS19TRUxFQ1RPUiIsIkFGRklMSUFURV9MSU5LX0JVSUxUIiwiQW1wU3RvcnlBZmZpbGlhdGVMaW5rIiwid2luIiwiZWxlbWVudCIsIndpbl8iLCJlbGVtZW50XyIsInRleHRFbF8iLCJsYXVuY2hFbF8iLCJzdG9yZVNlcnZpY2VfIiwidGV4dF8iLCJ0ZXh0Q29udGVudCIsIm11dGF0b3JfIiwibXV0YXRvckZvckRvYyIsImRvY3VtZW50IiwiYW5hbHl0aWNzU2VydmljZV8iLCJtdXRhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwiYWRkUHVsc2VFbGVtZW50XyIsImFkZEljb25FbGVtZW50XyIsImFkZFRleHRfIiwiYWRkTGF1bmNoRWxlbWVudF8iLCJpbml0aWFsaXplTGlzdGVuZXJzXyIsInN1YnNjcmliZSIsIkFGRklMSUFURV9MSU5LX1NUQVRFIiwiZWxlbWVudFRvVG9nZ2xlRXhwYW5kIiwiZXhwYW5kIiwicmVtb3ZlQXR0cmlidXRlIiwidHJpZ2dlckV2ZW50IiwiRk9DVVMiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJoYXNBdHRyaWJ1dGUiLCJzdG9wUHJvcGFnYXRpb24iLCJDTElDS19USFJPVUdIIiwiaWNvbkVsIiwiYXBwZW5kQ2hpbGQiLCJxdWVyeVNlbGVjdG9yIiwicHVsc2VFbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxRQUFSO0FBQ0EsU0FBUUMsYUFB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Q0Y7QUFDQTtBQUNBOztBQXZJQTtBQUFBO0FBQUEsV0F3SUUsNEJBQW1CO0FBQ2pCLFVBQU1xQixPQUFPLEdBQUd2QyxPQUFPLENBQUMsS0FBS08sUUFBTixDQUFWLDhJQUFiO0FBRUEsV0FBS0EsUUFBTCxDQUFjOEIsV0FBZCxDQUEwQkUsT0FBMUI7QUFDRDtBQTVJSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBBZmZpbGlhdGUgbGluayBjb21wb25lbnQgdGhhdCBleHBhbmRzIHdoZW4gY2xpY2tlZC5cbiAqL1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge1N0YXRlUHJvcGVydHksIGdldFN0b3JlU2VydmljZX0gZnJvbSAnLi9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5pbXBvcnQge1N0b3J5QW5hbHl0aWNzRXZlbnQsIGdldEFuYWx5dGljc1NlcnZpY2V9IGZyb20gJy4vc3RvcnktYW5hbHl0aWNzJztcbmltcG9ydCB7Z2V0QW1wZG9jfSBmcm9tICcuLi8uLi8uLi9zcmMvc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7aHRtbEZvcn0gZnJvbSAnI2NvcmUvZG9tL3N0YXRpYy10ZW1wbGF0ZSc7XG5cbi8qKlxuICogTGlua3MgdGhhdCBhcmUgYWZmaWxpYXRlIGxpbmtzLlxuICogQGNvbnN0IHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBBRkZJTElBVEVfTElOS19TRUxFQ1RPUiA9ICdhW2FmZmlsaWF0ZS1saW5rLWljb25dJztcblxuLyoqXG4gKiBDdXN0b20gcHJvcGVydHkgc2lnbmlmeWluZyBhIGJ1aWx0IGxpbmsuXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IEFGRklMSUFURV9MSU5LX0JVSUxUID0gJ19fQU1QX0FGRklMSUFURV9MSU5LX0JVSUxUJztcblxuZXhwb3J0IGNsYXNzIEFtcFN0b3J5QWZmaWxpYXRlTGluayB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIGVsZW1lbnQpIHtcbiAgICAvKiogQHByaXZhdGUgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIHshRWxlbWVudH0gKi9cbiAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy50ZXh0RWxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5sYXVuY2hFbF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2V9ICovXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gZ2V0U3RvcmVTZXJ2aWNlKHRoaXMud2luXyk7XG5cbiAgICAvKiogQHByaXZhdGUge3N0cmluZ30gKi9cbiAgICB0aGlzLnRleHRfID0gdGhpcy5lbGVtZW50Xy50ZXh0Q29udGVudDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9tdXRhdG9yLWludGVyZmFjZS5NdXRhdG9ySW50ZXJmYWNlfSAqL1xuICAgIHRoaXMubXV0YXRvcl8gPSBTZXJ2aWNlcy5tdXRhdG9yRm9yRG9jKGdldEFtcGRvYyh0aGlzLndpbl8uZG9jdW1lbnQpKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL3N0b3J5LWFuYWx5dGljcy5TdG9yeUFuYWx5dGljc1NlcnZpY2V9ICovXG4gICAgdGhpcy5hbmFseXRpY3NTZXJ2aWNlXyA9IGdldEFuYWx5dGljc1NlcnZpY2UodGhpcy53aW5fLCBlbGVtZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYWZmaWxpYXRlIGxpbmsuXG4gICAqL1xuICBidWlsZCgpIHtcbiAgICBpZiAodGhpcy5lbGVtZW50X1tBRkZJTElBVEVfTElOS19CVUlMVF0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQodGhpcy5lbGVtZW50XywgKCkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50Xy50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3ByaXN0aW5lJywgJycpO1xuICAgICAgdGhpcy5hZGRQdWxzZUVsZW1lbnRfKCk7XG4gICAgICB0aGlzLmFkZEljb25FbGVtZW50XygpO1xuICAgICAgdGhpcy5hZGRUZXh0XygpO1xuICAgICAgdGhpcy5hZGRMYXVuY2hFbGVtZW50XygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5pbml0aWFsaXplTGlzdGVuZXJzXygpO1xuICAgIHRoaXMuZWxlbWVudF9bQUZGSUxJQVRFX0xJTktfQlVJTFRdID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBsaXN0ZW5lcnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplTGlzdGVuZXJzXygpIHtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5BRkZJTElBVEVfTElOS19TVEFURSxcbiAgICAgIChlbGVtZW50VG9Ub2dnbGVFeHBhbmQpID0+IHtcbiAgICAgICAgY29uc3QgZXhwYW5kID0gdGhpcy5lbGVtZW50XyA9PT0gZWxlbWVudFRvVG9nZ2xlRXhwYW5kO1xuICAgICAgICBpZiAoZXhwYW5kKSB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2V4cGFuZGVkJywgJycpO1xuICAgICAgICAgIHRoaXMudGV4dEVsXy5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICAgICAgICAgIHRoaXMubGF1bmNoRWxfLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50Xy5yZW1vdmVBdHRyaWJ1dGUoJ2V4cGFuZGVkJyk7XG4gICAgICAgICAgdGhpcy50ZXh0RWxfLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJycpO1xuICAgICAgICAgIHRoaXMubGF1bmNoRWxfLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJycpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChleHBhbmQpIHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnRfLnJlbW92ZUF0dHJpYnV0ZSgncHJpc3RpbmUnKTtcbiAgICAgICAgICB0aGlzLmFuYWx5dGljc1NlcnZpY2VfLnRyaWdnZXJFdmVudChcbiAgICAgICAgICAgIFN0b3J5QW5hbHl0aWNzRXZlbnQuRk9DVVMsXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAodGhpcy5lbGVtZW50Xy5oYXNBdHRyaWJ1dGUoJ2V4cGFuZGVkJykpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuYW5hbHl0aWNzU2VydmljZV8udHJpZ2dlckV2ZW50KFxuICAgICAgICAgIFN0b3J5QW5hbHl0aWNzRXZlbnQuQ0xJQ0tfVEhST1VHSCxcbiAgICAgICAgICB0aGlzLmVsZW1lbnRfXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBpY29uIGFzIGEgY2hpbGQgZWxlbWVudCBvZiA8YW1wLXN0b3J5LWFmZmlsaWF0ZS1saW5rPi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFkZEljb25FbGVtZW50XygpIHtcbiAgICBjb25zdCBpY29uRWwgPSBodG1sRm9yKHRoaXMuZWxlbWVudF8pYFxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1hZmZpbGlhdGUtbGluay1jaXJjbGVcIj5cbiAgICAgICAgPGkgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktYWZmaWxpYXRlLWxpbmstaWNvblwiPjwvaT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1yZXNldCBpLWFtcGh0bWwtaGlkZGVuXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktYWZmaWxpYXRlLWxpbmstdGV4dFwiIGhpZGRlbj48L3NwYW4+XG4gICAgICAgICAgPGkgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktYWZmaWxpYXRlLWxpbmstbGF1bmNoXCIgaGlkZGVuPjwvaT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5gO1xuICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQoaWNvbkVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRleHQgZnJvbSA8YT4gdGFnIHRvIGV4cGFuZGVkIGxpbmsuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhZGRUZXh0XygpIHtcbiAgICB0aGlzLnRleHRFbF8gPSB0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1hZmZpbGlhdGUtbGluay10ZXh0J1xuICAgICk7XG5cbiAgICB0aGlzLnRleHRFbF8udGV4dENvbnRlbnQgPSB0aGlzLnRleHRfO1xuICAgIHRoaXMudGV4dEVsXy5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGxhdW5jaCBhcnJvdyB0byBleHBhbmRlZCBsaW5rLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRkTGF1bmNoRWxlbWVudF8oKSB7XG4gICAgdGhpcy5sYXVuY2hFbF8gPSB0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1hZmZpbGlhdGUtbGluay1sYXVuY2gnXG4gICAgKTtcblxuICAgIHRoaXMubGF1bmNoRWxfLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgcHVsc2UgYXMgYSBjaGlsZCBlbGVtZW50IG9mIDxhbXAtc3RvcnktYWZmaWxpYXRlLWxpbms+LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRkUHVsc2VFbGVtZW50XygpIHtcbiAgICBjb25zdCBwdWxzZUVsID0gaHRtbEZvcih0aGlzLmVsZW1lbnRfKWBcbiAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktYWZmaWxpYXRlLWxpbmstcHVsc2VcIj48L2Rpdj5gO1xuICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQocHVsc2VFbCk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-affiliate-link.js