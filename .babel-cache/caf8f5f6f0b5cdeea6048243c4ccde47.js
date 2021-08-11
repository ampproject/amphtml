import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

var _templateObject;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { Action, StateProperty, getStoreService } from "./amp-story-store-service";
import { CSS } from "../../../build/amp-story-info-dialog-1.0.css";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { assertAbsoluteHttpOrHttpsUrl } from "../../../src/url";
import { closest, matches } from "../../../src/core/dom/query";
import { createShadowRootWithStyle, triggerClickFromLightDom } from "./utils";
import { dev } from "../../../src/log";
import { getAmpdoc } from "../../../src/service-helpers";
import { getLocalizationService } from "./amp-story-localization-service";
import { htmlFor } from "../../../src/core/dom/static-template";

/** @const {string} Class to toggle the info dialog. */
export var DIALOG_VISIBLE_CLASS = 'i-amphtml-story-info-dialog-visible';

/** @const {string} Class to toggle the info dialog link. */
export var MOREINFO_VISIBLE_CLASS = 'i-amphtml-story-info-moreinfo-visible';

/**
 * A dialog that provides a link to the canonical URL of the story, as well as
 * a link to any more information that the viewer would like to provide about
 * linking on that platform.
 */
export var InfoDialog = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} parentEl Element where to append the component
   */
  function InfoDialog(win, parentEl) {
    _classCallCheck(this, InfoDialog);

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {?Element} */
    this.innerContainerEl_ = null;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private @const {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = getLocalizationService(parentEl);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win_, parentEl);

    /** @private @const {!Element} */
    this.parentEl_ = parentEl;

    /** @private @const {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(getAmpdoc(this.win_.document));

    /** @private {?Element} */
    this.moreInfoLinkEl_ = null;

    /** @const @private {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.parentEl_);
  }

  /**
   * Builds and appends the component in the story.
   * @return {!Promise} used for testing to ensure that the component is built
   *     before assertions.
   */
  _createClass(InfoDialog, [{
    key: "build",
    value: function build() {
      var _this = this;

      if (this.isBuilt()) {
        return _resolvedPromise();
      }

      this.isBuilt_ = true;
      var root = this.win_.document.createElement('div');
      var html = htmlFor(this.parentEl_);
      this.element_ = html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-story-info-dialog i-amphtml-story-system-reset\">\n        <div class=\"i-amphtml-story-info-dialog-container\">\n          <h1 class=\"i-amphtml-story-info-heading\"></h1>\n          <a class=\"i-amphtml-story-info-link\"></a>\n          <a class=\"i-amphtml-story-info-moreinfo\"></a>\n        </div>\n      </div>\n    "])));
      createShadowRootWithStyle(root, this.element_, CSS);
      this.initializeListeners_();
      this.innerContainerEl_ = this.element_.querySelector('.i-amphtml-story-info-dialog-container');
      var appendPromise = this.mutator_.mutateElement(this.parentEl_, function () {
        _this.parentEl_.appendChild(root);
      });
      var pageUrl = Services.documentInfoForDoc(getAmpdoc(this.parentEl_)).canonicalUrl;
      return Promise.all([appendPromise, this.setHeading_(), this.setPageLink_(pageUrl), this.requestMoreInfoLink_().then(function (moreInfoUrl) {
        return _this.setMoreInfoLinkUrl_(moreInfoUrl);
      })]);
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

      this.storeService_.subscribe(StateProperty.INFO_DIALOG_STATE, function (isOpen) {
        _this2.onInfoDialogStateUpdated_(isOpen);
      });
      this.element_.addEventListener('click', function (event) {
        return _this2.onInfoDialogClick_(event);
      });
    }
    /**
     * Reacts to dialog state updates and decides whether to show either the
     * native system sharing, or the fallback UI.
     * @param {boolean} isOpen
     * @private
     */

  }, {
    key: "onInfoDialogStateUpdated_",
    value: function onInfoDialogStateUpdated_(isOpen) {
      var _this3 = this;

      this.mutator_.mutateElement(dev().assertElement(this.element_), function () {
        _this3.element_.classList.toggle(DIALOG_VISIBLE_CLASS, isOpen);
      });
      this.element_[ANALYTICS_TAG_NAME] = 'amp-story-info-dialog';
      this.analyticsService_.triggerEvent(isOpen ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE, this.element_);
    }
    /**
     * Handles click events and maybe closes the dialog.
     * @param  {!Event} event
     */

  }, {
    key: "onInfoDialogClick_",
    value: function onInfoDialogClick_(event) {
      var _this4 = this;

      var el = dev().assertElement(event.target);

      // Closes the dialog if click happened outside of the dialog main container.
      if (!closest(el, function (el) {
        return el === _this4.innerContainerEl_;
      }, this.element_)) {
        this.close_();
      }

      var anchorClicked = closest(event.target, function (e) {
        return matches(e, 'a[href]');
      });

      if (anchorClicked) {
        triggerClickFromLightDom(anchorClicked, this.element);
        event.preventDefault();
      }
    }
    /**
     * Closes the info dialog.
     * @private
     */

  }, {
    key: "close_",
    value: function close_() {
      this.storeService_.dispatch(Action.TOGGLE_INFO_DIALOG, false);
    }
    /**
     * @return {!Promise<?string>} The URL to visit to receive more info on this
     *     page.
     * @private
     */

  }, {
    key: "requestMoreInfoLink_",
    value: function requestMoreInfoLink_() {
      if (!this.viewer_.isEmbedded()) {
        return Promise.resolve(null);
      }

      return this.viewer_.
      /*OK*/
      sendMessageAwaitResponse('moreInfoLinkUrl',
      /* data */
      undefined).then(function (moreInfoUrl) {
        if (!moreInfoUrl) {
          return null;
        }

        return assertAbsoluteHttpOrHttpsUrl(dev().assertString(moreInfoUrl));
      });
    }
    /**
     * Sets the heading on the dialog.
     * @return {*} TODO(#23582): Specify return type
     */

  }, {
    key: "setHeading_",
    value: function setHeading_() {
      var label = this.localizationService_.getLocalizedString(LocalizedStringId.AMP_STORY_DOMAIN_DIALOG_HEADING_LABEL);
      var headingEl = dev().assertElement(this.element_.querySelector('.i-amphtml-story-info-heading'));
      return this.mutator_.mutateElement(headingEl, function () {
        headingEl.textContent = label;
      });
    }
    /**
     * @param {string} pageUrl The URL to the canonical version of the current
     *     document.
     * @return {*} TODO(#23582): Specify return type
     */

  }, {
    key: "setPageLink_",
    value: function setPageLink_(pageUrl) {
      var linkEl = dev().assertElement(this.element_.querySelector('.i-amphtml-story-info-link'));
      return this.mutator_.mutateElement(linkEl, function () {
        linkEl.setAttribute('href', pageUrl);
        // Add zero-width space character (\u200B) after "." and "/" characters
        // to help line-breaks occur more naturally.
        linkEl.textContent = pageUrl.replace(/([/.]+)/gi, "$1\u200B");
      });
    }
    /**
     * @param {?string} moreInfoUrl The URL to the "more info" page, if there is
     * one.
     * @return {*} TODO(#23582): Specify return type
     */

  }, {
    key: "setMoreInfoLinkUrl_",
    value: function setMoreInfoLinkUrl_(moreInfoUrl) {
      var _this5 = this;

      if (!moreInfoUrl) {
        return _resolvedPromise2();
      }

      this.moreInfoLinkEl_ = dev().assertElement(this.element_.querySelector('.i-amphtml-story-info-moreinfo'));
      return this.mutator_.mutateElement(this.moreInfoLinkEl_, function () {
        var label = _this5.localizationService_.getLocalizedString(LocalizedStringId.AMP_STORY_DOMAIN_DIALOG_HEADING_LINK);

        _this5.moreInfoLinkEl_.classList.add(MOREINFO_VISIBLE_CLASS);

        _this5.moreInfoLinkEl_.setAttribute('href', dev().assertString(moreInfoUrl));

        _this5.moreInfoLinkEl_.setAttribute('target', '_blank');

        _this5.moreInfoLinkEl_.textContent = label;
      });
    }
  }]);

  return InfoDialog;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbmZvLWRpYWxvZy5qcyJdLCJuYW1lcyI6WyJBTkFMWVRJQ1NfVEFHX05BTUUiLCJTdG9yeUFuYWx5dGljc0V2ZW50IiwiZ2V0QW5hbHl0aWNzU2VydmljZSIsIkFjdGlvbiIsIlN0YXRlUHJvcGVydHkiLCJnZXRTdG9yZVNlcnZpY2UiLCJDU1MiLCJMb2NhbGl6ZWRTdHJpbmdJZCIsIlNlcnZpY2VzIiwiYXNzZXJ0QWJzb2x1dGVIdHRwT3JIdHRwc1VybCIsImNsb3Nlc3QiLCJtYXRjaGVzIiwiY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSIsInRyaWdnZXJDbGlja0Zyb21MaWdodERvbSIsImRldiIsImdldEFtcGRvYyIsImdldExvY2FsaXphdGlvblNlcnZpY2UiLCJodG1sRm9yIiwiRElBTE9HX1ZJU0lCTEVfQ0xBU1MiLCJNT1JFSU5GT19WSVNJQkxFX0NMQVNTIiwiSW5mb0RpYWxvZyIsIndpbiIsInBhcmVudEVsIiwid2luXyIsImVsZW1lbnRfIiwiaW5uZXJDb250YWluZXJFbF8iLCJpc0J1aWx0XyIsImxvY2FsaXphdGlvblNlcnZpY2VfIiwic3RvcmVTZXJ2aWNlXyIsImFuYWx5dGljc1NlcnZpY2VfIiwicGFyZW50RWxfIiwibXV0YXRvcl8iLCJtdXRhdG9yRm9yRG9jIiwiZG9jdW1lbnQiLCJtb3JlSW5mb0xpbmtFbF8iLCJ2aWV3ZXJfIiwidmlld2VyRm9yRG9jIiwiaXNCdWlsdCIsInJvb3QiLCJjcmVhdGVFbGVtZW50IiwiaHRtbCIsImluaXRpYWxpemVMaXN0ZW5lcnNfIiwicXVlcnlTZWxlY3RvciIsImFwcGVuZFByb21pc2UiLCJtdXRhdGVFbGVtZW50IiwiYXBwZW5kQ2hpbGQiLCJwYWdlVXJsIiwiZG9jdW1lbnRJbmZvRm9yRG9jIiwiY2Fub25pY2FsVXJsIiwiUHJvbWlzZSIsImFsbCIsInNldEhlYWRpbmdfIiwic2V0UGFnZUxpbmtfIiwicmVxdWVzdE1vcmVJbmZvTGlua18iLCJ0aGVuIiwibW9yZUluZm9VcmwiLCJzZXRNb3JlSW5mb0xpbmtVcmxfIiwic3Vic2NyaWJlIiwiSU5GT19ESUFMT0dfU1RBVEUiLCJpc09wZW4iLCJvbkluZm9EaWFsb2dTdGF0ZVVwZGF0ZWRfIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwib25JbmZvRGlhbG9nQ2xpY2tfIiwiYXNzZXJ0RWxlbWVudCIsImNsYXNzTGlzdCIsInRvZ2dsZSIsInRyaWdnZXJFdmVudCIsIk9QRU4iLCJDTE9TRSIsImVsIiwidGFyZ2V0IiwiY2xvc2VfIiwiYW5jaG9yQ2xpY2tlZCIsImUiLCJlbGVtZW50IiwicHJldmVudERlZmF1bHQiLCJkaXNwYXRjaCIsIlRPR0dMRV9JTkZPX0RJQUxPRyIsImlzRW1iZWRkZWQiLCJyZXNvbHZlIiwic2VuZE1lc3NhZ2VBd2FpdFJlc3BvbnNlIiwidW5kZWZpbmVkIiwiYXNzZXJ0U3RyaW5nIiwibGFiZWwiLCJnZXRMb2NhbGl6ZWRTdHJpbmciLCJBTVBfU1RPUllfRE9NQUlOX0RJQUxPR19IRUFESU5HX0xBQkVMIiwiaGVhZGluZ0VsIiwidGV4dENvbnRlbnQiLCJsaW5rRWwiLCJzZXRBdHRyaWJ1dGUiLCJyZXBsYWNlIiwiQU1QX1NUT1JZX0RPTUFJTl9ESUFMT0dfSEVBRElOR19MSU5LIiwiYWRkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsa0JBREYsRUFFRUMsbUJBRkYsRUFHRUMsbUJBSEY7QUFLQSxTQUNFQyxNQURGLEVBRUVDLGFBRkYsRUFHRUMsZUFIRjtBQUtBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxpQkFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyw0QkFBUjtBQUNBLFNBQVFDLE9BQVIsRUFBaUJDLE9BQWpCO0FBQ0EsU0FBUUMseUJBQVIsRUFBbUNDLHdCQUFuQztBQUNBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxTQUFS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ZCxDQUE0QixnQ0FBNUIsQ0FEcUIsQ0FBdkI7QUFJQSxhQUFPLEtBQUtYLFFBQUwsQ0FBY2EsYUFBZCxDQUE0QixLQUFLVixlQUFqQyxFQUFrRCxZQUFNO0FBQzdELFlBQU1rRCxLQUFLLEdBQUcsTUFBSSxDQUFDekQsb0JBQUwsQ0FBMEIwRCxrQkFBMUIsQ0FDWjlFLGlCQUFpQixDQUFDcUYsb0NBRE4sQ0FBZDs7QUFHQSxRQUFBLE1BQUksQ0FBQzFELGVBQUwsQ0FBcUIrQixTQUFyQixDQUErQjRCLEdBQS9CLENBQW1DMUUsc0JBQW5DOztBQUNBLFFBQUEsTUFBSSxDQUFDZSxlQUFMLENBQXFCd0QsWUFBckIsQ0FDRSxNQURGLEVBRUU1RSxHQUFHLEdBQUdxRSxZQUFOLENBQW1CNUIsV0FBbkIsQ0FGRjs7QUFJQSxRQUFBLE1BQUksQ0FBQ3JCLGVBQUwsQ0FBcUJ3RCxZQUFyQixDQUFrQyxRQUFsQyxFQUE0QyxRQUE1Qzs7QUFDQSxRQUFBLE1BQUksQ0FBQ3hELGVBQUwsQ0FBcUJzRCxXQUFyQixHQUFtQ0osS0FBbkM7QUFDRCxPQVhNLENBQVA7QUFZRDtBQXpPSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFOQUxZVElDU19UQUdfTkFNRSxcbiAgU3RvcnlBbmFseXRpY3NFdmVudCxcbiAgZ2V0QW5hbHl0aWNzU2VydmljZSxcbn0gZnJvbSAnLi9zdG9yeS1hbmFseXRpY3MnO1xuaW1wb3J0IHtcbiAgQWN0aW9uLFxuICBTdGF0ZVByb3BlcnR5LFxuICBnZXRTdG9yZVNlcnZpY2UsXG59IGZyb20gJy4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UnO1xuaW1wb3J0IHtDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1pbmZvLWRpYWxvZy0xLjAuY3NzJztcbmltcG9ydCB7TG9jYWxpemVkU3RyaW5nSWR9IGZyb20gJyNzZXJ2aWNlL2xvY2FsaXphdGlvbi9zdHJpbmdzJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7YXNzZXJ0QWJzb2x1dGVIdHRwT3JIdHRwc1VybH0gZnJvbSAnLi4vLi4vLi4vc3JjL3VybCc7XG5pbXBvcnQge2Nsb3Nlc3QsIG1hdGNoZXN9IGZyb20gJyNjb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge2NyZWF0ZVNoYWRvd1Jvb3RXaXRoU3R5bGUsIHRyaWdnZXJDbGlja0Zyb21MaWdodERvbX0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2dldEFtcGRvY30gZnJvbSAnLi4vLi4vLi4vc3JjL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge2dldExvY2FsaXphdGlvblNlcnZpY2V9IGZyb20gJy4vYW1wLXN0b3J5LWxvY2FsaXphdGlvbi1zZXJ2aWNlJztcbmltcG9ydCB7aHRtbEZvcn0gZnJvbSAnI2NvcmUvZG9tL3N0YXRpYy10ZW1wbGF0ZSc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gQ2xhc3MgdG8gdG9nZ2xlIHRoZSBpbmZvIGRpYWxvZy4gKi9cbmV4cG9ydCBjb25zdCBESUFMT0dfVklTSUJMRV9DTEFTUyA9ICdpLWFtcGh0bWwtc3RvcnktaW5mby1kaWFsb2ctdmlzaWJsZSc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gQ2xhc3MgdG8gdG9nZ2xlIHRoZSBpbmZvIGRpYWxvZyBsaW5rLiAqL1xuZXhwb3J0IGNvbnN0IE1PUkVJTkZPX1ZJU0lCTEVfQ0xBU1MgPSAnaS1hbXBodG1sLXN0b3J5LWluZm8tbW9yZWluZm8tdmlzaWJsZSc7XG5cbi8qKlxuICogQSBkaWFsb2cgdGhhdCBwcm92aWRlcyBhIGxpbmsgdG8gdGhlIGNhbm9uaWNhbCBVUkwgb2YgdGhlIHN0b3J5LCBhcyB3ZWxsIGFzXG4gKiBhIGxpbmsgdG8gYW55IG1vcmUgaW5mb3JtYXRpb24gdGhhdCB0aGUgdmlld2VyIHdvdWxkIGxpa2UgdG8gcHJvdmlkZSBhYm91dFxuICogbGlua2luZyBvbiB0aGF0IHBsYXRmb3JtLlxuICovXG5leHBvcnQgY2xhc3MgSW5mb0RpYWxvZyB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYXJlbnRFbCBFbGVtZW50IHdoZXJlIHRvIGFwcGVuZCB0aGUgY29tcG9uZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIHBhcmVudEVsKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuZWxlbWVudF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLmlubmVyQ29udGFpbmVyRWxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzQnVpbHRfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvbG9jYWxpemF0aW9uLkxvY2FsaXphdGlvblNlcnZpY2V9ICovXG4gICAgdGhpcy5sb2NhbGl6YXRpb25TZXJ2aWNlXyA9IGdldExvY2FsaXphdGlvblNlcnZpY2UocGFyZW50RWwpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2V9ICovXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gZ2V0U3RvcmVTZXJ2aWNlKHRoaXMud2luXyk7XG5cbiAgICAvKiogQHByaXZhdGUgeyEuL3N0b3J5LWFuYWx5dGljcy5TdG9yeUFuYWx5dGljc1NlcnZpY2V9ICovXG4gICAgdGhpcy5hbmFseXRpY3NTZXJ2aWNlXyA9IGdldEFuYWx5dGljc1NlcnZpY2UodGhpcy53aW5fLCBwYXJlbnRFbCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRWxlbWVudH0gKi9cbiAgICB0aGlzLnBhcmVudEVsXyA9IHBhcmVudEVsO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL211dGF0b3ItaW50ZXJmYWNlLk11dGF0b3JJbnRlcmZhY2V9ICovXG4gICAgdGhpcy5tdXRhdG9yXyA9IFNlcnZpY2VzLm11dGF0b3JGb3JEb2MoZ2V0QW1wZG9jKHRoaXMud2luXy5kb2N1bWVudCkpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLm1vcmVJbmZvTGlua0VsXyA9IG51bGw7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2Uvdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2V9ICovXG4gICAgdGhpcy52aWV3ZXJfID0gU2VydmljZXMudmlld2VyRm9yRG9jKHRoaXMucGFyZW50RWxfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIGFwcGVuZHMgdGhlIGNvbXBvbmVudCBpbiB0aGUgc3RvcnkuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSB1c2VkIGZvciB0ZXN0aW5nIHRvIGVuc3VyZSB0aGF0IHRoZSBjb21wb25lbnQgaXMgYnVpbHRcbiAgICogICAgIGJlZm9yZSBhc3NlcnRpb25zLlxuICAgKi9cbiAgYnVpbGQoKSB7XG4gICAgaWYgKHRoaXMuaXNCdWlsdCgpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5pc0J1aWx0XyA9IHRydWU7XG4gICAgY29uc3Qgcm9vdCA9IHRoaXMud2luXy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBodG1sID0gaHRtbEZvcih0aGlzLnBhcmVudEVsXyk7XG4gICAgdGhpcy5lbGVtZW50XyA9IGh0bWxgXG4gICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWluZm8tZGlhbG9nIGktYW1waHRtbC1zdG9yeS1zeXN0ZW0tcmVzZXRcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbmZvLWRpYWxvZy1jb250YWluZXJcIj5cbiAgICAgICAgICA8aDEgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW5mby1oZWFkaW5nXCI+PC9oMT5cbiAgICAgICAgICA8YSBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbmZvLWxpbmtcIj48L2E+XG4gICAgICAgICAgPGEgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW5mby1tb3JlaW5mb1wiPjwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuXG4gICAgY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZShyb290LCB0aGlzLmVsZW1lbnRfLCBDU1MpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZUxpc3RlbmVyc18oKTtcblxuICAgIHRoaXMuaW5uZXJDb250YWluZXJFbF8gPSB0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1pbmZvLWRpYWxvZy1jb250YWluZXInXG4gICAgKTtcblxuICAgIGNvbnN0IGFwcGVuZFByb21pc2UgPSB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQodGhpcy5wYXJlbnRFbF8sICgpID0+IHtcbiAgICAgIHRoaXMucGFyZW50RWxfLmFwcGVuZENoaWxkKHJvb3QpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcGFnZVVybCA9IFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyhcbiAgICAgIGdldEFtcGRvYyh0aGlzLnBhcmVudEVsXylcbiAgICApLmNhbm9uaWNhbFVybDtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICBhcHBlbmRQcm9taXNlLFxuICAgICAgdGhpcy5zZXRIZWFkaW5nXygpLFxuICAgICAgdGhpcy5zZXRQYWdlTGlua18ocGFnZVVybCksXG4gICAgICB0aGlzLnJlcXVlc3RNb3JlSW5mb0xpbmtfKCkudGhlbigobW9yZUluZm9VcmwpID0+XG4gICAgICAgIHRoaXMuc2V0TW9yZUluZm9MaW5rVXJsXyhtb3JlSW5mb1VybClcbiAgICAgICksXG4gICAgXSk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZWxlbWVudCBoYXMgYmVlbiBidWlsdC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQnVpbHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNCdWlsdF87XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVMaXN0ZW5lcnNfKCkge1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoU3RhdGVQcm9wZXJ0eS5JTkZPX0RJQUxPR19TVEFURSwgKGlzT3BlbikgPT4ge1xuICAgICAgdGhpcy5vbkluZm9EaWFsb2dTdGF0ZVVwZGF0ZWRfKGlzT3Blbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PlxuICAgICAgdGhpcy5vbkluZm9EaWFsb2dDbGlja18oZXZlbnQpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gZGlhbG9nIHN0YXRlIHVwZGF0ZXMgYW5kIGRlY2lkZXMgd2hldGhlciB0byBzaG93IGVpdGhlciB0aGVcbiAgICogbmF0aXZlIHN5c3RlbSBzaGFyaW5nLCBvciB0aGUgZmFsbGJhY2sgVUkuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNPcGVuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkluZm9EaWFsb2dTdGF0ZVVwZGF0ZWRfKGlzT3Blbikge1xuICAgIHRoaXMubXV0YXRvcl8ubXV0YXRlRWxlbWVudChkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMuZWxlbWVudF8pLCAoKSA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC50b2dnbGUoRElBTE9HX1ZJU0lCTEVfQ0xBU1MsIGlzT3Blbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnRfW0FOQUxZVElDU19UQUdfTkFNRV0gPSAnYW1wLXN0b3J5LWluZm8tZGlhbG9nJztcbiAgICB0aGlzLmFuYWx5dGljc1NlcnZpY2VfLnRyaWdnZXJFdmVudChcbiAgICAgIGlzT3BlbiA/IFN0b3J5QW5hbHl0aWNzRXZlbnQuT1BFTiA6IFN0b3J5QW5hbHl0aWNzRXZlbnQuQ0xPU0UsXG4gICAgICB0aGlzLmVsZW1lbnRfXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGNsaWNrIGV2ZW50cyBhbmQgbWF5YmUgY2xvc2VzIHRoZSBkaWFsb2cuXG4gICAqIEBwYXJhbSAgeyFFdmVudH0gZXZlbnRcbiAgICovXG4gIG9uSW5mb0RpYWxvZ0NsaWNrXyhldmVudCkge1xuICAgIGNvbnN0IGVsID0gZGV2KCkuYXNzZXJ0RWxlbWVudChldmVudC50YXJnZXQpO1xuICAgIC8vIENsb3NlcyB0aGUgZGlhbG9nIGlmIGNsaWNrIGhhcHBlbmVkIG91dHNpZGUgb2YgdGhlIGRpYWxvZyBtYWluIGNvbnRhaW5lci5cbiAgICBpZiAoIWNsb3Nlc3QoZWwsIChlbCkgPT4gZWwgPT09IHRoaXMuaW5uZXJDb250YWluZXJFbF8sIHRoaXMuZWxlbWVudF8pKSB7XG4gICAgICB0aGlzLmNsb3NlXygpO1xuICAgIH1cbiAgICBjb25zdCBhbmNob3JDbGlja2VkID0gY2xvc2VzdChldmVudC50YXJnZXQsIChlKSA9PiBtYXRjaGVzKGUsICdhW2hyZWZdJykpO1xuICAgIGlmIChhbmNob3JDbGlja2VkKSB7XG4gICAgICB0cmlnZ2VyQ2xpY2tGcm9tTGlnaHREb20oYW5jaG9yQ2xpY2tlZCwgdGhpcy5lbGVtZW50KTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgaW5mbyBkaWFsb2cuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjbG9zZV8oKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfSU5GT19ESUFMT0csIGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTw/c3RyaW5nPn0gVGhlIFVSTCB0byB2aXNpdCB0byByZWNlaXZlIG1vcmUgaW5mbyBvbiB0aGlzXG4gICAqICAgICBwYWdlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVxdWVzdE1vcmVJbmZvTGlua18oKSB7XG4gICAgaWYgKCF0aGlzLnZpZXdlcl8uaXNFbWJlZGRlZCgpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy52aWV3ZXJfXG4gICAgICAuLypPSyovIHNlbmRNZXNzYWdlQXdhaXRSZXNwb25zZSgnbW9yZUluZm9MaW5rVXJsJywgLyogZGF0YSAqLyB1bmRlZmluZWQpXG4gICAgICAudGhlbigobW9yZUluZm9VcmwpID0+IHtcbiAgICAgICAgaWYgKCFtb3JlSW5mb1VybCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhc3NlcnRBYnNvbHV0ZUh0dHBPckh0dHBzVXJsKGRldigpLmFzc2VydFN0cmluZyhtb3JlSW5mb1VybCkpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgaGVhZGluZyBvbiB0aGUgZGlhbG9nLlxuICAgKiBAcmV0dXJuIHsqfSBUT0RPKCMyMzU4Mik6IFNwZWNpZnkgcmV0dXJuIHR5cGVcbiAgICovXG4gIHNldEhlYWRpbmdfKCkge1xuICAgIGNvbnN0IGxhYmVsID0gdGhpcy5sb2NhbGl6YXRpb25TZXJ2aWNlXy5nZXRMb2NhbGl6ZWRTdHJpbmcoXG4gICAgICBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfRE9NQUlOX0RJQUxPR19IRUFESU5HX0xBQkVMXG4gICAgKTtcbiAgICBjb25zdCBoZWFkaW5nRWwgPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgdGhpcy5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yKCcuaS1hbXBodG1sLXN0b3J5LWluZm8taGVhZGluZycpXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQoaGVhZGluZ0VsLCAoKSA9PiB7XG4gICAgICBoZWFkaW5nRWwudGV4dENvbnRlbnQgPSBsYWJlbDtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGFnZVVybCBUaGUgVVJMIHRvIHRoZSBjYW5vbmljYWwgdmVyc2lvbiBvZiB0aGUgY3VycmVudFxuICAgKiAgICAgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4geyp9IFRPRE8oIzIzNTgyKTogU3BlY2lmeSByZXR1cm4gdHlwZVxuICAgKi9cbiAgc2V0UGFnZUxpbmtfKHBhZ2VVcmwpIHtcbiAgICBjb25zdCBsaW5rRWwgPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgdGhpcy5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yKCcuaS1hbXBodG1sLXN0b3J5LWluZm8tbGluaycpXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQobGlua0VsLCAoKSA9PiB7XG4gICAgICBsaW5rRWwuc2V0QXR0cmlidXRlKCdocmVmJywgcGFnZVVybCk7XG5cbiAgICAgIC8vIEFkZCB6ZXJvLXdpZHRoIHNwYWNlIGNoYXJhY3RlciAoXFx1MjAwQikgYWZ0ZXIgXCIuXCIgYW5kIFwiL1wiIGNoYXJhY3RlcnNcbiAgICAgIC8vIHRvIGhlbHAgbGluZS1icmVha3Mgb2NjdXIgbW9yZSBuYXR1cmFsbHkuXG4gICAgICBsaW5rRWwudGV4dENvbnRlbnQgPSBwYWdlVXJsLnJlcGxhY2UoLyhbLy5dKykvZ2ksICckMVxcdTIwMEInKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IG1vcmVJbmZvVXJsIFRoZSBVUkwgdG8gdGhlIFwibW9yZSBpbmZvXCIgcGFnZSwgaWYgdGhlcmUgaXNcbiAgICogb25lLlxuICAgKiBAcmV0dXJuIHsqfSBUT0RPKCMyMzU4Mik6IFNwZWNpZnkgcmV0dXJuIHR5cGVcbiAgICovXG4gIHNldE1vcmVJbmZvTGlua1VybF8obW9yZUluZm9VcmwpIHtcbiAgICBpZiAoIW1vcmVJbmZvVXJsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5tb3JlSW5mb0xpbmtFbF8gPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgdGhpcy5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yKCcuaS1hbXBodG1sLXN0b3J5LWluZm8tbW9yZWluZm8nKVxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5tdXRhdG9yXy5tdXRhdGVFbGVtZW50KHRoaXMubW9yZUluZm9MaW5rRWxfLCAoKSA9PiB7XG4gICAgICBjb25zdCBsYWJlbCA9IHRoaXMubG9jYWxpemF0aW9uU2VydmljZV8uZ2V0TG9jYWxpemVkU3RyaW5nKFxuICAgICAgICBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfRE9NQUlOX0RJQUxPR19IRUFESU5HX0xJTktcbiAgICAgICk7XG4gICAgICB0aGlzLm1vcmVJbmZvTGlua0VsXy5jbGFzc0xpc3QuYWRkKE1PUkVJTkZPX1ZJU0lCTEVfQ0xBU1MpO1xuICAgICAgdGhpcy5tb3JlSW5mb0xpbmtFbF8uc2V0QXR0cmlidXRlKFxuICAgICAgICAnaHJlZicsXG4gICAgICAgIGRldigpLmFzc2VydFN0cmluZyhtb3JlSW5mb1VybClcbiAgICAgICk7XG4gICAgICB0aGlzLm1vcmVJbmZvTGlua0VsXy5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsICdfYmxhbmsnKTtcbiAgICAgIHRoaXMubW9yZUluZm9MaW5rRWxfLnRleHRDb250ZW50ID0gbGFiZWw7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-info-dialog.js