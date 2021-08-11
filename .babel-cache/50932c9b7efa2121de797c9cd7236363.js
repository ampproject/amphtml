var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { Action, StateProperty, UIType } from "./amp-story-store-service";
import { DraggableDrawer, DrawerState } from "./amp-story-draggable-drawer";
import { HistoryState, setHistoryState } from "./history";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { StoryAnalyticsEvent, getAnalyticsService } from "./story-analytics";
import { buildOpenAttachmentElementLinkIcon } from "./amp-story-open-page-attachment";
import { closest } from "../../../src/core/dom/query";
import { dev, devAssert } from "../../../src/log";
import { getHistoryState } from "../../../src/core/window/history";
import { getLocalizationService } from "./amp-story-localization-service";
import { htmlFor, htmlRefs } from "../../../src/core/dom/static-template";
import { isPageAttachmentUiV2ExperimentOn } from "./amp-story-page-attachment-ui-v2";
import { removeElement } from "../../../src/core/dom";
import { setImportantStyles, toggle } from "../../../src/core/dom/style";
import { triggerClickFromLightDom } from "./utils";

/** @const {string} */
var DARK_THEME_CLASS = 'i-amphtml-story-draggable-drawer-theme-dark';

/**
 * Distance to swipe before opening attachment.
 * @const {number}
 */
var OPEN_THRESHOLD_PX = 150;

/**
 * Max pixels to transform the remote attachment URL preview. Equivilent to the height of preview element.
 * @const {number}
 */
var DRAG_CAP_PX = 48;

/**
 * Max pixels to transform the remote attachment URL preview. Equivilent to the height of preview element.
 * Used for the amp-story-outlink-page-attachment-v2 experiment.
 * @const {number}
 */
var DRAG_CAP_PX_V2 = 56;

/**
 * Duration of post-tap URL preview progress bar animation minus 100ms.
 * The minus 100ms roughly accounts for the small system delay in opening a link.
 * Used for the amp-story-outlink-page-attachment-v2 experiment.
 * @const {number}
 */
var POST_TAP_ANIMATION_DURATION = 500;

/**
 * @enum {string}
 */
export var AttachmentTheme = {
  LIGHT: 'light',
  // default
  DARK: 'dark',
  CUSTOM: 'custom'
};

/**
 * @enum
 */
var AttachmentType = {
  INLINE: 0,
  OUTLINK: 1
};

/**
 * AMP Story page attachment.
 */
export var AmpStoryPageAttachment = /*#__PURE__*/function (_DraggableDrawer) {
  _inherits(AmpStoryPageAttachment, _DraggableDrawer);

  var _super = _createSuper(AmpStoryPageAttachment);

  /** @param {!AmpElement} element */
  function AmpStoryPageAttachment(element) {
    var _this;

    _classCallCheck(this, AmpStoryPageAttachment);

    _this = _super.call(this, element);

    /** @private @const {!./story-analytics.StoryAnalyticsService} */
    _this.analyticsService_ = getAnalyticsService(_this.win, _this.element);

    /** @private @const {!../../../src/service/history-impl.History} */
    _this.historyService_ = Services.historyForDoc(_this.element);

    /** @private {?AttachmentType} */
    _this.type_ = null;
    return _this;
  }

  /**
   * @override
   */
  _createClass(AmpStoryPageAttachment, [{
    key: "buildCallback",
    value: function buildCallback() {
      var _this$element$getAttr,
          _this2 = this;

      _get(_getPrototypeOf(AmpStoryPageAttachment.prototype), "buildCallback", this).call(this);

      var theme = (_this$element$getAttr = this.element.getAttribute('theme')) == null ? void 0 : _this$element$getAttr.toLowerCase();

      if (theme && AttachmentTheme.DARK === theme) {
        if (isPageAttachmentUiV2ExperimentOn(this.win)) {
          this.headerEl.setAttribute('theme', theme);
          this.element.setAttribute('theme', theme);
        } else {
          this.headerEl.classList.add(DARK_THEME_CLASS);
          this.element.classList.add(DARK_THEME_CLASS);
        }
      }

      // Outlinks can be an amp-story-page-outlink or the legacy version,
      // an amp-story-page-attachment with an href.
      var isOutlink = this.element.tagName === 'AMP-STORY-PAGE-OUTLINK' || this.element.hasAttribute('href');
      this.type_ = isOutlink ? AttachmentType.OUTLINK : AttachmentType.INLINE;

      if (this.type_ === AttachmentType.INLINE) {
        this.buildInline_();
      }

      if (this.type_ === AttachmentType.OUTLINK && !isPageAttachmentUiV2ExperimentOn(this.win)) {
        this.buildRemote_();
      }

      this.win.addEventListener('pageshow', function (event) {
        // On browser back, Safari does not reload the page but resumes its cached
        // version. This event's parameter lets us know when this happens so we
        // can cleanup the remote opening animation.
        if (event.persisted) {
          _this2.closeInternal_(false
          /** shouldAnimate */
          );
        }
      });
      toggle(this.element, true);
      this.element.setAttribute('aria-live', 'assertive');
    }
    /**
     * @override
     */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      _get(_getPrototypeOf(AmpStoryPageAttachment.prototype), "layoutCallback", this).call(this);

      // Outlink attachment v2 renders an image and must be built in layoutCallback.
      if (this.type_ === AttachmentType.OUTLINK && isPageAttachmentUiV2ExperimentOn(this.win)) {
        this.buildRemoteV2_();
      }
    }
    /**
     * Builds inline page attachment's drawer UI.
     * @private
     */

  }, {
    key: "buildInline_",
    value: function buildInline_() {
      var closeButtonEl = htmlFor(this.element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n          <button class=\"i-amphtml-story-page-attachment-close-button\" aria-label=\"close\"\n              role=\"button\">\n          </button>"])));
      var localizationService = getLocalizationService(devAssert(this.element));
      var titleEl = htmlFor(this.element)(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n    <span class=\"i-amphtml-story-page-attachment-title\"></span>"])));

      if (localizationService) {
        var localizedCloseString = localizationService.getLocalizedString(LocalizedStringId.AMP_STORY_CLOSE_BUTTON_LABEL);
        closeButtonEl.setAttribute('aria-label', localizedCloseString);
      }

      if (this.element.hasAttribute('data-title')) {
        titleEl.textContent = this.element.getAttribute('data-title');
      }

      if (isPageAttachmentUiV2ExperimentOn(this.win)) {
        var titleAndCloseWrapperEl = this.headerEl.appendChild(htmlFor(this.element)(_templateObject3 || (_templateObject3 = _taggedTemplateLiteralLoose(["\n            <div class=\"i-amphtml-story-draggable-drawer-header-title-and-close\"></div>"]))));
        titleAndCloseWrapperEl.appendChild(closeButtonEl);
        titleAndCloseWrapperEl.appendChild(titleEl);
      } else {
        this.headerEl.appendChild(closeButtonEl);
        this.headerEl.appendChild(titleEl);
      }

      var templateEl = this.element.querySelector('.i-amphtml-story-draggable-drawer');

      while (this.element.firstChild && this.element.firstChild !== templateEl) {
        this.contentEl.appendChild(this.element.firstChild);
      }

      // Ensures the content of the attachment won't be rendered/loaded until we
      // actually need it.
      toggle(dev().assertElement(this.containerEl), true);
    }
    /**
     * Builds remote page attachment's drawer UI.
     * Can be removed when amp-story-page-attachment-ui-v2 is laumched.
     * @private
     */

  }, {
    key: "buildRemote_",
    value: function buildRemote_() {
      this.setDragCap_(DRAG_CAP_PX);
      this.setOpenThreshold_(OPEN_THRESHOLD_PX);
      this.headerEl.classList.add('i-amphtml-story-draggable-drawer-header-attachment-remote');
      this.element.classList.add('i-amphtml-story-page-attachment-remote');
      // Use an anchor element to make this a real link in vertical rendering.
      var link = htmlFor(this.element)(_templateObject4 || (_templateObject4 = _taggedTemplateLiteralLoose(["\n    <a class=\"i-amphtml-story-page-attachment-remote-content\" target=\"_blank\">\n      <span class=\"i-amphtml-story-page-attachment-remote-title\"></span>\n      <span class=\"i-amphtml-story-page-attachment-remote-icon\"></span>\n    </a>"])));
      // URL will be validated and resolved based on the canonical URL if relative
      // when navigating.
      link.setAttribute('href', this.element.getAttribute('href'));
      this.contentEl.appendChild(link);
      this.contentEl.querySelector('.i-amphtml-story-page-attachment-remote-title').textContent = this.element.getAttribute('data-title') || Services.urlForDoc(this.element).getSourceOrigin(this.element.getAttribute('href') || // Used if amp-story-page-attachment-ui-v2 is off and
      // this.elmement is an amp-story-page-outlink.
      this.element.querySelector('a').getAttribute('href'));
    }
    /**
     * Builds remote V2 page attachment's drawer UI.
     * Used for the amp-story-page-attachment-ui-v2 experiment.
     * @private
     */

  }, {
    key: "buildRemoteV2_",
    value: function buildRemoteV2_() {
      this.setDragCap_(DRAG_CAP_PX_V2);
      this.setOpenThreshold_(OPEN_THRESHOLD_PX);
      this.headerEl.classList.add('i-amphtml-story-draggable-drawer-header-attachment-remote');
      this.element.classList.add('i-amphtml-story-page-attachment-remote');
      // Use an anchor element to make this a real link in vertical rendering.
      var link = htmlFor(this.element)(_templateObject5 || (_templateObject5 = _taggedTemplateLiteralLoose(["\n      <a class=\"i-amphtml-story-page-attachment-remote-content\" target=\"_blank\">\n        <span class=\"i-amphtml-story-page-attachment-remote-title\"><span ref=\"openStringEl\"></span><span ref=\"urlStringEl\"></span></span>\n        <svg class=\"i-amphtml-story-page-attachment-remote-icon\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\"><path d=\"M38 38H10V10h14V6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V24h-4v14zM28 6v4h7.17L15.51 29.66l2.83 2.83L38 12.83V20h4V6H28z\"></path></svg>\n      </a>"])));
      // For backwards compatibility if element is amp-story-page-outlink.
      var hrefAttr = this.element.tagName === 'AMP-STORY-PAGE-OUTLINK' ? this.element.querySelector('a').getAttribute('href') : this.element.getAttribute('href');
      // URL will be validated and resolved based on the canonical URL if relative
      // when navigating.
      link.setAttribute('href', hrefAttr);

      var _htmlRefs = htmlRefs(link),
          openStringEl = _htmlRefs.openStringEl,
          urlStringEl = _htmlRefs.urlStringEl;

      // Navigation is handled programmatically. Disable clicks on the placeholder
      // anchor to prevent from users triggering double navigations, which has
      // side effects in native contexts opening webviews/CCTs.
      link.addEventListener('click', function (event) {
        return event.preventDefault();
      });
      // Set image.
      var openImgAttr = this.element.getAttribute('cta-image');

      if (openImgAttr && openImgAttr !== 'none') {
        var ctaImgEl = this.win.document.createElement('div');
        ctaImgEl.classList.add('i-amphtml-story-page-attachment-remote-img');
        setImportantStyles(ctaImgEl, {
          'background-image': 'url(' + openImgAttr + ')'
        });
        link.prepend(ctaImgEl);
      } else if (!openImgAttr) {
        // Attach link icon SVG by default.
        var linkImage = buildOpenAttachmentElementLinkIcon(link);
        link.prepend(linkImage);
      }

      // Set url prevew text.
      var localizationService = getLocalizationService(devAssert(this.element));

      if (localizationService) {
        var localizedOpenString = localizationService.getLocalizedString(LocalizedStringId.AMP_STORY_OPEN_OUTLINK_TEXT);
        openStringEl.textContent = localizedOpenString;
      }

      urlStringEl.textContent = hrefAttr;
      this.contentEl.appendChild(link);
    }
    /**
     * @override
     */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this3 = this;

      _get(_getPrototypeOf(AmpStoryPageAttachment.prototype), "initializeListeners_", this).call(this);

      var closeButtonEl = this.headerEl.querySelector('.i-amphtml-story-page-attachment-close-button');

      if (closeButtonEl) {
        closeButtonEl.addEventListener('click', function () {
          return _this3.close_();
        }, true
        /** useCapture */
        );
      }

      // Always open links in a new tab.
      this.contentEl.addEventListener('click', function (event) {
        var target = event.target;

        if (target.tagName.toLowerCase() === 'a') {
          target.setAttribute('target', '_blank');
        }
      }, true
      /** useCapture */
      );
      // Closes the attachment on opacity background clicks.
      this.element.addEventListener('click', function (event) {
        if (event.target.tagName.toLowerCase() === 'amp-story-page-attachment') {
          _this3.close_();
        }
      }, true
      /** useCapture */
      );

      // Closes the remote attachment drawer when navigation deeplinked to an app.
      if (this.type_ === AttachmentType.OUTLINK) {
        var ampdoc = this.getAmpDoc();
        ampdoc.onVisibilityChanged(function () {
          if (ampdoc.isVisible() && _this3.state === DrawerState.OPEN) {
            _this3.closeInternal_(false
            /** shouldAnimate */
            );
          }
        });
      }
    }
    /**
     * @override
     */

  }, {
    key: "open",
    value: function open(shouldAnimate) {
      var _this4 = this;

      if (shouldAnimate === void 0) {
        shouldAnimate = true;
      }

      if (this.state === DrawerState.OPEN) {
        return;
      }

      _get(_getPrototypeOf(AmpStoryPageAttachment.prototype), "open", this).call(this, shouldAnimate);

      this.storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, true);
      this.storeService.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);
      this.toggleBackgroundOverlay_(true);

      // Don't create a new history entry for remote attachment as user is
      // navigating away.
      if (this.type_ !== AttachmentType.OUTLINK) {
        var _extends2;

        var currentHistoryState =
        /** @type {!Object} */
        getHistoryState(this.win.history);

        var historyState = _extends({}, currentHistoryState, (_extends2 = {}, _extends2[HistoryState.ATTACHMENT_PAGE_ID] = this.storeService.get(StateProperty.CURRENT_PAGE_ID), _extends2));

        this.historyService_.push(function () {
          return _this4.closeInternal_();
        }, historyState);
      }

      this.analyticsService_.triggerEvent(StoryAnalyticsEvent.OPEN, this.element);
      this.analyticsService_.triggerEvent(StoryAnalyticsEvent.PAGE_ATTACHMENT_ENTER);

      if (this.type_ === AttachmentType.OUTLINK) {
        if (isPageAttachmentUiV2ExperimentOn(this.win) || this.element.parentElement.querySelector('amp-story-page-outlink')) {
          this.openRemoteV2_();
        } else {
          this.openRemote_();
        }
      }
    }
    /**
     * Triggers a remote attachment preview URL animation on mobile,
     * and redirects to the specified URL.
     * @private
     */

  }, {
    key: "openRemoteV2_",
    value: function openRemoteV2_() {
      var _this5 = this;

      // If the element is an amp-story-page-outlink the click target is its anchor element child.
      // This is for SEO and analytics optimisation.
      // Otherwise the element is the legacy version, amp-story-page-attachment with an href,
      // and a click target is the button built by the component.
      var programaticallyClickOnTarget = function programaticallyClickOnTarget() {
        var _this5$element$parent, _this5$element$parent2;

        var pageOutlinkChild = (_this5$element$parent = _this5.element.parentElement.querySelector('amp-story-page-outlink')) == null ? void 0 : _this5$element$parent.querySelector('a');
        var pageAttachmentChild = (_this5$element$parent2 = _this5.element.parentElement) == null ? void 0 : _this5$element$parent2.querySelector('.i-amphtml-story-page-open-attachment-host').shadowRoot.querySelector('a.i-amphtml-story-page-open-attachment');

        if (pageOutlinkChild) {
          pageOutlinkChild.click();
        } else if (pageAttachmentChild) {
          triggerClickFromLightDom(pageAttachmentChild, _this5.element);
        }
      };

      var isMobileUI = this.storeService.get(StateProperty.UI_STATE) === UIType.MOBILE;

      if (!isMobileUI) {
        programaticallyClickOnTarget();
      } else {
        // Timeout to shows post-tap animation on mobile only.
        Services.timerFor(this.win).delay(function () {
          programaticallyClickOnTarget();
        }, POST_TAP_ANIMATION_DURATION);
      }
    }
    /**
     * Triggers a remote attachment opening animation, and redirects to the
     * specified URL.
     * @private
     */

  }, {
    key: "openRemote_",
    value: function openRemote_() {
      var _this6 = this;

      var animationEl = this.win.document.createElement('div');
      animationEl.classList.add('i-amphtml-story-page-attachment-expand');
      var storyEl = closest(this.element, function (el) {
        return el.tagName === 'AMP-STORY';
      });
      this.mutateElement(function () {
        storyEl.appendChild(animationEl);
      }).then(function () {
        // Give some time for the 120ms CSS animation to run (cf
        // amp-story-page-attachment.css). The navigation itself will take some
        // time, depending on the target and network conditions.
        _this6.win.setTimeout(function () {
          var clickTarget = _this6.element.parentElement.querySelector('.i-amphtml-story-page-open-attachment-host').shadowRoot.querySelector('a.i-amphtml-story-page-open-attachment');

          triggerClickFromLightDom(clickTarget, _this6.element);
        });
      }, 50);
    }
    /**
     * Ensures the history state we added when opening the drawer is popped,
     * and closes the drawer either directly, or through the onPop callback.
     * @override
     */

  }, {
    key: "close_",
    value: function close_() {
      switch (this.state) {
        // If the drawer was open, pop the history entry that was added, which
        // will close the drawer through the onPop callback.
        case DrawerState.OPEN:
        case DrawerState.DRAGGING_TO_CLOSE:
          this.historyService_.goBack();
          break;
        // If the drawer was not open, no history entry was added, so we can
        // close the drawer directly.

        case DrawerState.DRAGGING_TO_OPEN:
          this.closeInternal_();
          break;
      }
    }
    /**
     * @override
     */

  }, {
    key: "closeInternal_",
    value: function closeInternal_(shouldAnimate) {
      if (shouldAnimate === void 0) {
        shouldAnimate = true;
      }

      if (this.state === DrawerState.CLOSED) {
        return;
      }

      _get(_getPrototypeOf(AmpStoryPageAttachment.prototype), "closeInternal_", this).call(this, shouldAnimate);

      this.toggleBackgroundOverlay_(false);
      this.storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, false);
      this.storeService.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, true);
      var storyEl = closest(this.element, function (el) {
        return el.tagName === 'AMP-STORY';
      });
      var animationEl = storyEl.querySelector('.i-amphtml-story-page-attachment-expand');

      if (animationEl) {
        this.mutateElement(function () {
          removeElement(dev().assertElement(animationEl));
        });
      }

      setHistoryState(this.win, HistoryState.ATTACHMENT_PAGE_ID, null);
      this.analyticsService_.triggerEvent(StoryAnalyticsEvent.CLOSE, this.element);
      this.analyticsService_.triggerEvent(StoryAnalyticsEvent.PAGE_ATTACHMENT_EXIT);
    }
    /**
     * @param {boolean} isActive
     * @private
     */

  }, {
    key: "toggleBackgroundOverlay_",
    value: function toggleBackgroundOverlay_(isActive) {
      var activePageEl = closest(this.element, function (el) {
        return el.tagName === 'AMP-STORY-PAGE';
      });
      this.mutateElement(function () {
        activePageEl.classList.toggle('i-amphtml-story-page-attachment-active', isActive);
      });
    }
  }]);

  return AmpStoryPageAttachment;
}(DraggableDrawer);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQuanMiXSwibmFtZXMiOlsiQWN0aW9uIiwiU3RhdGVQcm9wZXJ0eSIsIlVJVHlwZSIsIkRyYWdnYWJsZURyYXdlciIsIkRyYXdlclN0YXRlIiwiSGlzdG9yeVN0YXRlIiwic2V0SGlzdG9yeVN0YXRlIiwiTG9jYWxpemVkU3RyaW5nSWQiLCJTZXJ2aWNlcyIsIlN0b3J5QW5hbHl0aWNzRXZlbnQiLCJnZXRBbmFseXRpY3NTZXJ2aWNlIiwiYnVpbGRPcGVuQXR0YWNobWVudEVsZW1lbnRMaW5rSWNvbiIsImNsb3Nlc3QiLCJkZXYiLCJkZXZBc3NlcnQiLCJnZXRIaXN0b3J5U3RhdGUiLCJnZXRMb2NhbGl6YXRpb25TZXJ2aWNlIiwiaHRtbEZvciIsImh0bWxSZWZzIiwiaXNQYWdlQXR0YWNobWVudFVpVjJFeHBlcmltZW50T24iLCJyZW1vdmVFbGVtZW50Iiwic2V0SW1wb3J0YW50U3R5bGVzIiwidG9nZ2xlIiwidHJpZ2dlckNsaWNrRnJvbUxpZ2h0RG9tIiwiREFSS19USEVNRV9DTEFTUyIsIk9QRU5fVEhSRVNIT0xEX1BYIiwiRFJBR19DQVBfUFgiLCJEUkFHX0NBUF9QWF9WMiIsIlBPU1RfVEFQX0FOSU1BVElPTl9EVVJBVElPTiIsIkF0dGFjaG1lbnRUaGVtZSIsIkxJR0hUIiwiREFSSyIsIkNVU1RPTSIsIkF0dGFjaG1lbnRUeXBlIiwiSU5MSU5FIiwiT1VUTElOSyIsIkFtcFN0b3J5UGFnZUF0dGFjaG1lbnQiLCJlbGVtZW50IiwiYW5hbHl0aWNzU2VydmljZV8iLCJ3aW4iLCJoaXN0b3J5U2VydmljZV8iLCJoaXN0b3J5Rm9yRG9jIiwidHlwZV8iLCJ0aGVtZSIsImdldEF0dHJpYnV0ZSIsInRvTG93ZXJDYXNlIiwiaGVhZGVyRWwiLCJzZXRBdHRyaWJ1dGUiLCJjbGFzc0xpc3QiLCJhZGQiLCJpc091dGxpbmsiLCJ0YWdOYW1lIiwiaGFzQXR0cmlidXRlIiwiYnVpbGRJbmxpbmVfIiwiYnVpbGRSZW1vdGVfIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwicGVyc2lzdGVkIiwiY2xvc2VJbnRlcm5hbF8iLCJidWlsZFJlbW90ZVYyXyIsImNsb3NlQnV0dG9uRWwiLCJsb2NhbGl6YXRpb25TZXJ2aWNlIiwidGl0bGVFbCIsImxvY2FsaXplZENsb3NlU3RyaW5nIiwiZ2V0TG9jYWxpemVkU3RyaW5nIiwiQU1QX1NUT1JZX0NMT1NFX0JVVFRPTl9MQUJFTCIsInRleHRDb250ZW50IiwidGl0bGVBbmRDbG9zZVdyYXBwZXJFbCIsImFwcGVuZENoaWxkIiwidGVtcGxhdGVFbCIsInF1ZXJ5U2VsZWN0b3IiLCJmaXJzdENoaWxkIiwiY29udGVudEVsIiwiYXNzZXJ0RWxlbWVudCIsImNvbnRhaW5lckVsIiwic2V0RHJhZ0NhcF8iLCJzZXRPcGVuVGhyZXNob2xkXyIsImxpbmsiLCJ1cmxGb3JEb2MiLCJnZXRTb3VyY2VPcmlnaW4iLCJocmVmQXR0ciIsIm9wZW5TdHJpbmdFbCIsInVybFN0cmluZ0VsIiwicHJldmVudERlZmF1bHQiLCJvcGVuSW1nQXR0ciIsImN0YUltZ0VsIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwicHJlcGVuZCIsImxpbmtJbWFnZSIsImxvY2FsaXplZE9wZW5TdHJpbmciLCJBTVBfU1RPUllfT1BFTl9PVVRMSU5LX1RFWFQiLCJjbG9zZV8iLCJ0YXJnZXQiLCJhbXBkb2MiLCJnZXRBbXBEb2MiLCJvblZpc2liaWxpdHlDaGFuZ2VkIiwiaXNWaXNpYmxlIiwic3RhdGUiLCJPUEVOIiwic2hvdWxkQW5pbWF0ZSIsInN0b3JlU2VydmljZSIsImRpc3BhdGNoIiwiVE9HR0xFX1BBR0VfQVRUQUNITUVOVF9TVEFURSIsIlRPR0dMRV9TWVNURU1fVUlfSVNfVklTSUJMRSIsInRvZ2dsZUJhY2tncm91bmRPdmVybGF5XyIsImN1cnJlbnRIaXN0b3J5U3RhdGUiLCJoaXN0b3J5IiwiaGlzdG9yeVN0YXRlIiwiQVRUQUNITUVOVF9QQUdFX0lEIiwiZ2V0IiwiQ1VSUkVOVF9QQUdFX0lEIiwicHVzaCIsInRyaWdnZXJFdmVudCIsIlBBR0VfQVRUQUNITUVOVF9FTlRFUiIsInBhcmVudEVsZW1lbnQiLCJvcGVuUmVtb3RlVjJfIiwib3BlblJlbW90ZV8iLCJwcm9ncmFtYXRpY2FsbHlDbGlja09uVGFyZ2V0IiwicGFnZU91dGxpbmtDaGlsZCIsInBhZ2VBdHRhY2htZW50Q2hpbGQiLCJzaGFkb3dSb290IiwiY2xpY2siLCJpc01vYmlsZVVJIiwiVUlfU1RBVEUiLCJNT0JJTEUiLCJ0aW1lckZvciIsImRlbGF5IiwiYW5pbWF0aW9uRWwiLCJzdG9yeUVsIiwiZWwiLCJtdXRhdGVFbGVtZW50IiwidGhlbiIsInNldFRpbWVvdXQiLCJjbGlja1RhcmdldCIsIkRSQUdHSU5HX1RPX0NMT1NFIiwiZ29CYWNrIiwiRFJBR0dJTkdfVE9fT1BFTiIsIkNMT1NFRCIsIkNMT1NFIiwiUEFHRV9BVFRBQ0hNRU5UX0VYSVQiLCJpc0FjdGl2ZSIsImFjdGl2ZVBhZ2VFbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsTUFBUixFQUFnQkMsYUFBaEIsRUFBK0JDLE1BQS9CO0FBQ0EsU0FBUUMsZUFBUixFQUF5QkMsV0FBekI7QUFDQSxTQUFRQyxZQUFSLEVBQXNCQyxlQUF0QjtBQUNBLFNBQVFDLGlCQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLG1CQUFSLEVBQTZCQyxtQkFBN0I7QUFDQSxTQUFRQyxrQ0FBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWI7QUFDQSxTQUFRQyxlQUFSO0FBQ0EsU0FBUUMsc0JBQVI7QUFDQSxTQUFRQyxPQUFSLEVBQWlCQyxRQUFqQjtBQUNBLFNBQVFDLGdDQUFSO0FBQ0EsU0FBUUMsYUFBUjtBQUNBLFNBQVFDLGtCQUFSLEVBQTRCQyxNQUE1QjtB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V0FBdkI7QUFBQSxPQUFmLENBQXZCO0FBQ0EsVUFBTTZFLFdBQVcsR0FBR0MsT0FBTyxDQUFDM0QsYUFBUixDQUNsQix5Q0FEa0IsQ0FBcEI7O0FBR0EsVUFBSTBELFdBQUosRUFBaUI7QUFDZixhQUFLRyxhQUFMLENBQW1CLFlBQU07QUFDdkIvRyxVQUFBQSxhQUFhLENBQUNQLEdBQUcsR0FBRzRELGFBQU4sQ0FBb0J1RCxXQUFwQixDQUFELENBQWI7QUFDRCxTQUZEO0FBR0Q7O0FBRUQxSCxNQUFBQSxlQUFlLENBQUMsS0FBS2lDLEdBQU4sRUFBV2xDLFlBQVksQ0FBQ3dHLGtCQUF4QixFQUE0QyxJQUE1QyxDQUFmO0FBRUEsV0FBS3ZFLGlCQUFMLENBQXVCMkUsWUFBdkIsQ0FDRXhHLG1CQUFtQixDQUFDa0ksS0FEdEIsRUFFRSxLQUFLdEcsT0FGUDtBQUlBLFdBQUtDLGlCQUFMLENBQXVCMkUsWUFBdkIsQ0FDRXhHLG1CQUFtQixDQUFDbUksb0JBRHRCO0FBR0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUFuY0E7QUFBQTtBQUFBLFdBb2NFLGtDQUF5QkMsUUFBekIsRUFBbUM7QUFDakMsVUFBTUMsWUFBWSxHQUFHbEksT0FBTyxDQUMxQixLQUFLeUIsT0FEcUIsRUFFMUIsVUFBQzZGLEVBQUQ7QUFBQSxlQUFRQSxFQUFFLENBQUMvRSxPQUFILEtBQWUsZ0JBQXZCO0FBQUEsT0FGMEIsQ0FBNUI7QUFJQSxXQUFLZ0YsYUFBTCxDQUFtQixZQUFNO0FBQ3ZCVyxRQUFBQSxZQUFZLENBQUM5RixTQUFiLENBQXVCMUIsTUFBdkIsQ0FDRSx3Q0FERixFQUVFdUgsUUFGRjtBQUlELE9BTEQ7QUFNRDtBQS9jSDs7QUFBQTtBQUFBLEVBQTRDMUksZUFBNUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtBY3Rpb24sIFN0YXRlUHJvcGVydHksIFVJVHlwZX0gZnJvbSAnLi9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5pbXBvcnQge0RyYWdnYWJsZURyYXdlciwgRHJhd2VyU3RhdGV9IGZyb20gJy4vYW1wLXN0b3J5LWRyYWdnYWJsZS1kcmF3ZXInO1xuaW1wb3J0IHtIaXN0b3J5U3RhdGUsIHNldEhpc3RvcnlTdGF0ZX0gZnJvbSAnLi9oaXN0b3J5JztcbmltcG9ydCB7TG9jYWxpemVkU3RyaW5nSWR9IGZyb20gJyNzZXJ2aWNlL2xvY2FsaXphdGlvbi9zdHJpbmdzJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7U3RvcnlBbmFseXRpY3NFdmVudCwgZ2V0QW5hbHl0aWNzU2VydmljZX0gZnJvbSAnLi9zdG9yeS1hbmFseXRpY3MnO1xuaW1wb3J0IHtidWlsZE9wZW5BdHRhY2htZW50RWxlbWVudExpbmtJY29ufSBmcm9tICcuL2FtcC1zdG9yeS1vcGVuLXBhZ2UtYXR0YWNobWVudCc7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJyNjb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7Z2V0SGlzdG9yeVN0YXRlfSBmcm9tICcjY29yZS93aW5kb3cvaGlzdG9yeSc7XG5pbXBvcnQge2dldExvY2FsaXphdGlvblNlcnZpY2V9IGZyb20gJy4vYW1wLXN0b3J5LWxvY2FsaXphdGlvbi1zZXJ2aWNlJztcbmltcG9ydCB7aHRtbEZvciwgaHRtbFJlZnN9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuaW1wb3J0IHtpc1BhZ2VBdHRhY2htZW50VWlWMkV4cGVyaW1lbnRPbn0gZnJvbSAnLi9hbXAtc3RvcnktcGFnZS1hdHRhY2htZW50LXVpLXYyJztcbmltcG9ydCB7cmVtb3ZlRWxlbWVudH0gZnJvbSAnI2NvcmUvZG9tJztcbmltcG9ydCB7c2V0SW1wb3J0YW50U3R5bGVzLCB0b2dnbGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5cbmltcG9ydCB7dHJpZ2dlckNsaWNrRnJvbUxpZ2h0RG9tfSBmcm9tICcuL3V0aWxzJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgREFSS19USEVNRV9DTEFTUyA9ICdpLWFtcGh0bWwtc3RvcnktZHJhZ2dhYmxlLWRyYXdlci10aGVtZS1kYXJrJztcblxuLyoqXG4gKiBEaXN0YW5jZSB0byBzd2lwZSBiZWZvcmUgb3BlbmluZyBhdHRhY2htZW50LlxuICogQGNvbnN0IHtudW1iZXJ9XG4gKi9cbmNvbnN0IE9QRU5fVEhSRVNIT0xEX1BYID0gMTUwO1xuXG4vKipcbiAqIE1heCBwaXhlbHMgdG8gdHJhbnNmb3JtIHRoZSByZW1vdGUgYXR0YWNobWVudCBVUkwgcHJldmlldy4gRXF1aXZpbGVudCB0byB0aGUgaGVpZ2h0IG9mIHByZXZpZXcgZWxlbWVudC5cbiAqIEBjb25zdCB7bnVtYmVyfVxuICovXG5jb25zdCBEUkFHX0NBUF9QWCA9IDQ4O1xuXG4vKipcbiAqIE1heCBwaXhlbHMgdG8gdHJhbnNmb3JtIHRoZSByZW1vdGUgYXR0YWNobWVudCBVUkwgcHJldmlldy4gRXF1aXZpbGVudCB0byB0aGUgaGVpZ2h0IG9mIHByZXZpZXcgZWxlbWVudC5cbiAqIFVzZWQgZm9yIHRoZSBhbXAtc3Rvcnktb3V0bGluay1wYWdlLWF0dGFjaG1lbnQtdjIgZXhwZXJpbWVudC5cbiAqIEBjb25zdCB7bnVtYmVyfVxuICovXG5jb25zdCBEUkFHX0NBUF9QWF9WMiA9IDU2O1xuXG4vKipcbiAqIER1cmF0aW9uIG9mIHBvc3QtdGFwIFVSTCBwcmV2aWV3IHByb2dyZXNzIGJhciBhbmltYXRpb24gbWludXMgMTAwbXMuXG4gKiBUaGUgbWludXMgMTAwbXMgcm91Z2hseSBhY2NvdW50cyBmb3IgdGhlIHNtYWxsIHN5c3RlbSBkZWxheSBpbiBvcGVuaW5nIGEgbGluay5cbiAqIFVzZWQgZm9yIHRoZSBhbXAtc3Rvcnktb3V0bGluay1wYWdlLWF0dGFjaG1lbnQtdjIgZXhwZXJpbWVudC5cbiAqIEBjb25zdCB7bnVtYmVyfVxuICovXG5jb25zdCBQT1NUX1RBUF9BTklNQVRJT05fRFVSQVRJT04gPSA1MDA7XG5cbi8qKlxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IEF0dGFjaG1lbnRUaGVtZSA9IHtcbiAgTElHSFQ6ICdsaWdodCcsIC8vIGRlZmF1bHRcbiAgREFSSzogJ2RhcmsnLFxuICBDVVNUT006ICdjdXN0b20nLFxufTtcblxuLyoqXG4gKiBAZW51bVxuICovXG5jb25zdCBBdHRhY2htZW50VHlwZSA9IHtcbiAgSU5MSU5FOiAwLFxuICBPVVRMSU5LOiAxLFxufTtcblxuLyoqXG4gKiBBTVAgU3RvcnkgcGFnZSBhdHRhY2htZW50LlxuICovXG5leHBvcnQgY2xhc3MgQW1wU3RvcnlQYWdlQXR0YWNobWVudCBleHRlbmRzIERyYWdnYWJsZURyYXdlciB7XG4gIC8qKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50ICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihlbGVtZW50KTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL3N0b3J5LWFuYWx5dGljcy5TdG9yeUFuYWx5dGljc1NlcnZpY2V9ICovXG4gICAgdGhpcy5hbmFseXRpY3NTZXJ2aWNlXyA9IGdldEFuYWx5dGljc1NlcnZpY2UodGhpcy53aW4sIHRoaXMuZWxlbWVudCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvaGlzdG9yeS1pbXBsLkhpc3Rvcnl9ICovXG4gICAgdGhpcy5oaXN0b3J5U2VydmljZV8gPSBTZXJ2aWNlcy5oaXN0b3J5Rm9yRG9jKHRoaXMuZWxlbWVudCk7XG5cbiAgICAvKiogQHByaXZhdGUgez9BdHRhY2htZW50VHlwZX0gKi9cbiAgICB0aGlzLnR5cGVfID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGJ1aWxkQ2FsbGJhY2soKSB7XG4gICAgc3VwZXIuYnVpbGRDYWxsYmFjaygpO1xuXG4gICAgY29uc3QgdGhlbWUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0aGVtZScpPy50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh0aGVtZSAmJiBBdHRhY2htZW50VGhlbWUuREFSSyA9PT0gdGhlbWUpIHtcbiAgICAgIGlmIChpc1BhZ2VBdHRhY2htZW50VWlWMkV4cGVyaW1lbnRPbih0aGlzLndpbikpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJFbC5zZXRBdHRyaWJ1dGUoJ3RoZW1lJywgdGhlbWUpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCd0aGVtZScsIHRoZW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaGVhZGVyRWwuY2xhc3NMaXN0LmFkZChEQVJLX1RIRU1FX0NMQVNTKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoREFSS19USEVNRV9DTEFTUyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT3V0bGlua3MgY2FuIGJlIGFuIGFtcC1zdG9yeS1wYWdlLW91dGxpbmsgb3IgdGhlIGxlZ2FjeSB2ZXJzaW9uLFxuICAgIC8vIGFuIGFtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQgd2l0aCBhbiBocmVmLlxuICAgIGNvbnN0IGlzT3V0bGluayA9XG4gICAgICB0aGlzLmVsZW1lbnQudGFnTmFtZSA9PT0gJ0FNUC1TVE9SWS1QQUdFLU9VVExJTksnIHx8XG4gICAgICB0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdocmVmJyk7XG4gICAgdGhpcy50eXBlXyA9IGlzT3V0bGluayA/IEF0dGFjaG1lbnRUeXBlLk9VVExJTksgOiBBdHRhY2htZW50VHlwZS5JTkxJTkU7XG5cbiAgICBpZiAodGhpcy50eXBlXyA9PT0gQXR0YWNobWVudFR5cGUuSU5MSU5FKSB7XG4gICAgICB0aGlzLmJ1aWxkSW5saW5lXygpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMudHlwZV8gPT09IEF0dGFjaG1lbnRUeXBlLk9VVExJTksgJiZcbiAgICAgICFpc1BhZ2VBdHRhY2htZW50VWlWMkV4cGVyaW1lbnRPbih0aGlzLndpbilcbiAgICApIHtcbiAgICAgIHRoaXMuYnVpbGRSZW1vdGVfKCk7XG4gICAgfVxuXG4gICAgdGhpcy53aW4uYWRkRXZlbnRMaXN0ZW5lcigncGFnZXNob3cnLCAoZXZlbnQpID0+IHtcbiAgICAgIC8vIE9uIGJyb3dzZXIgYmFjaywgU2FmYXJpIGRvZXMgbm90IHJlbG9hZCB0aGUgcGFnZSBidXQgcmVzdW1lcyBpdHMgY2FjaGVkXG4gICAgICAvLyB2ZXJzaW9uLiBUaGlzIGV2ZW50J3MgcGFyYW1ldGVyIGxldHMgdXMga25vdyB3aGVuIHRoaXMgaGFwcGVucyBzbyB3ZVxuICAgICAgLy8gY2FuIGNsZWFudXAgdGhlIHJlbW90ZSBvcGVuaW5nIGFuaW1hdGlvbi5cbiAgICAgIGlmIChldmVudC5wZXJzaXN0ZWQpIHtcbiAgICAgICAgdGhpcy5jbG9zZUludGVybmFsXyhmYWxzZSAvKiogc2hvdWxkQW5pbWF0ZSAqLyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0b2dnbGUodGhpcy5lbGVtZW50LCB0cnVlKTtcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAnYXNzZXJ0aXZlJyk7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBsYXlvdXRDYWxsYmFjaygpIHtcbiAgICBzdXBlci5sYXlvdXRDYWxsYmFjaygpO1xuICAgIC8vIE91dGxpbmsgYXR0YWNobWVudCB2MiByZW5kZXJzIGFuIGltYWdlIGFuZCBtdXN0IGJlIGJ1aWx0IGluIGxheW91dENhbGxiYWNrLlxuICAgIGlmIChcbiAgICAgIHRoaXMudHlwZV8gPT09IEF0dGFjaG1lbnRUeXBlLk9VVExJTksgJiZcbiAgICAgIGlzUGFnZUF0dGFjaG1lbnRVaVYyRXhwZXJpbWVudE9uKHRoaXMud2luKVxuICAgICkge1xuICAgICAgdGhpcy5idWlsZFJlbW90ZVYyXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgaW5saW5lIHBhZ2UgYXR0YWNobWVudCdzIGRyYXdlciBVSS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGJ1aWxkSW5saW5lXygpIHtcbiAgICBjb25zdCBjbG9zZUJ1dHRvbkVsID0gaHRtbEZvcih0aGlzLmVsZW1lbnQpYFxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktcGFnZS1hdHRhY2htZW50LWNsb3NlLWJ1dHRvblwiIGFyaWEtbGFiZWw9XCJjbG9zZVwiXG4gICAgICAgICAgICAgIHJvbGU9XCJidXR0b25cIj5cbiAgICAgICAgICA8L2J1dHRvbj5gO1xuICAgIGNvbnN0IGxvY2FsaXphdGlvblNlcnZpY2UgPSBnZXRMb2NhbGl6YXRpb25TZXJ2aWNlKGRldkFzc2VydCh0aGlzLmVsZW1lbnQpKTtcblxuICAgIGNvbnN0IHRpdGxlRWwgPSBodG1sRm9yKHRoaXMuZWxlbWVudClgXG4gICAgPHNwYW4gY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktcGFnZS1hdHRhY2htZW50LXRpdGxlXCI+PC9zcGFuPmA7XG5cbiAgICBpZiAobG9jYWxpemF0aW9uU2VydmljZSkge1xuICAgICAgY29uc3QgbG9jYWxpemVkQ2xvc2VTdHJpbmcgPSBsb2NhbGl6YXRpb25TZXJ2aWNlLmdldExvY2FsaXplZFN0cmluZyhcbiAgICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0NMT1NFX0JVVFRPTl9MQUJFTFxuICAgICAgKTtcbiAgICAgIGNsb3NlQnV0dG9uRWwuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgbG9jYWxpemVkQ2xvc2VTdHJpbmcpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdkYXRhLXRpdGxlJykpIHtcbiAgICAgIHRpdGxlRWwudGV4dENvbnRlbnQgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRpdGxlJyk7XG4gICAgfVxuXG4gICAgaWYgKGlzUGFnZUF0dGFjaG1lbnRVaVYyRXhwZXJpbWVudE9uKHRoaXMud2luKSkge1xuICAgICAgY29uc3QgdGl0bGVBbmRDbG9zZVdyYXBwZXJFbCA9IHRoaXMuaGVhZGVyRWwuYXBwZW5kQ2hpbGQoXG4gICAgICAgIGh0bWxGb3IodGhpcy5lbGVtZW50KWBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktZHJhZ2dhYmxlLWRyYXdlci1oZWFkZXItdGl0bGUtYW5kLWNsb3NlXCI+PC9kaXY+YFxuICAgICAgKTtcbiAgICAgIHRpdGxlQW5kQ2xvc2VXcmFwcGVyRWwuYXBwZW5kQ2hpbGQoY2xvc2VCdXR0b25FbCk7XG4gICAgICB0aXRsZUFuZENsb3NlV3JhcHBlckVsLmFwcGVuZENoaWxkKHRpdGxlRWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhlYWRlckVsLmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uRWwpO1xuICAgICAgdGhpcy5oZWFkZXJFbC5hcHBlbmRDaGlsZCh0aXRsZUVsKTtcbiAgICB9XG5cbiAgICBjb25zdCB0ZW1wbGF0ZUVsID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1kcmFnZ2FibGUtZHJhd2VyJ1xuICAgICk7XG5cbiAgICB3aGlsZSAodGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQgJiYgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQgIT09IHRlbXBsYXRlRWwpIHtcbiAgICAgIHRoaXMuY29udGVudEVsLmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmVzIHRoZSBjb250ZW50IG9mIHRoZSBhdHRhY2htZW50IHdvbid0IGJlIHJlbmRlcmVkL2xvYWRlZCB1bnRpbCB3ZVxuICAgIC8vIGFjdHVhbGx5IG5lZWQgaXQuXG4gICAgdG9nZ2xlKGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5jb250YWluZXJFbCksIHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyByZW1vdGUgcGFnZSBhdHRhY2htZW50J3MgZHJhd2VyIFVJLlxuICAgKiBDYW4gYmUgcmVtb3ZlZCB3aGVuIGFtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtdWktdjIgaXMgbGF1bWNoZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBidWlsZFJlbW90ZV8oKSB7XG4gICAgdGhpcy5zZXREcmFnQ2FwXyhEUkFHX0NBUF9QWCk7XG4gICAgdGhpcy5zZXRPcGVuVGhyZXNob2xkXyhPUEVOX1RIUkVTSE9MRF9QWCk7XG5cbiAgICB0aGlzLmhlYWRlckVsLmNsYXNzTGlzdC5hZGQoXG4gICAgICAnaS1hbXBodG1sLXN0b3J5LWRyYWdnYWJsZS1kcmF3ZXItaGVhZGVyLWF0dGFjaG1lbnQtcmVtb3RlJ1xuICAgICk7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtcmVtb3RlJyk7XG4gICAgLy8gVXNlIGFuIGFuY2hvciBlbGVtZW50IHRvIG1ha2UgdGhpcyBhIHJlYWwgbGluayBpbiB2ZXJ0aWNhbCByZW5kZXJpbmcuXG4gICAgY29uc3QgbGluayA9IGh0bWxGb3IodGhpcy5lbGVtZW50KWBcbiAgICA8YSBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtcmVtb3RlLWNvbnRlbnRcIiB0YXJnZXQ9XCJfYmxhbmtcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LXBhZ2UtYXR0YWNobWVudC1yZW1vdGUtdGl0bGVcIj48L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtcmVtb3RlLWljb25cIj48L3NwYW4+XG4gICAgPC9hPmA7XG4gICAgLy8gVVJMIHdpbGwgYmUgdmFsaWRhdGVkIGFuZCByZXNvbHZlZCBiYXNlZCBvbiB0aGUgY2Fub25pY2FsIFVSTCBpZiByZWxhdGl2ZVxuICAgIC8vIHdoZW4gbmF2aWdhdGluZy5cbiAgICBsaW5rLnNldEF0dHJpYnV0ZSgnaHJlZicsIHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSk7XG4gICAgdGhpcy5jb250ZW50RWwuYXBwZW5kQ2hpbGQobGluayk7XG5cbiAgICB0aGlzLmNvbnRlbnRFbC5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktcGFnZS1hdHRhY2htZW50LXJlbW90ZS10aXRsZSdcbiAgICApLnRleHRDb250ZW50ID1cbiAgICAgIHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKSB8fFxuICAgICAgU2VydmljZXMudXJsRm9yRG9jKHRoaXMuZWxlbWVudCkuZ2V0U291cmNlT3JpZ2luKFxuICAgICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJykgfHxcbiAgICAgICAgICAvLyBVc2VkIGlmIGFtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtdWktdjIgaXMgb2ZmIGFuZFxuICAgICAgICAgIC8vIHRoaXMuZWxtZW1lbnQgaXMgYW4gYW1wLXN0b3J5LXBhZ2Utb3V0bGluay5cbiAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignYScpLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyByZW1vdGUgVjIgcGFnZSBhdHRhY2htZW50J3MgZHJhd2VyIFVJLlxuICAgKiBVc2VkIGZvciB0aGUgYW1wLXN0b3J5LXBhZ2UtYXR0YWNobWVudC11aS12MiBleHBlcmltZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYnVpbGRSZW1vdGVWMl8oKSB7XG4gICAgdGhpcy5zZXREcmFnQ2FwXyhEUkFHX0NBUF9QWF9WMik7XG4gICAgdGhpcy5zZXRPcGVuVGhyZXNob2xkXyhPUEVOX1RIUkVTSE9MRF9QWCk7XG5cbiAgICB0aGlzLmhlYWRlckVsLmNsYXNzTGlzdC5hZGQoXG4gICAgICAnaS1hbXBodG1sLXN0b3J5LWRyYWdnYWJsZS1kcmF3ZXItaGVhZGVyLWF0dGFjaG1lbnQtcmVtb3RlJ1xuICAgICk7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtcmVtb3RlJyk7XG4gICAgLy8gVXNlIGFuIGFuY2hvciBlbGVtZW50IHRvIG1ha2UgdGhpcyBhIHJlYWwgbGluayBpbiB2ZXJ0aWNhbCByZW5kZXJpbmcuXG4gICAgY29uc3QgbGluayA9IGh0bWxGb3IodGhpcy5lbGVtZW50KWBcbiAgICAgIDxhIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LXBhZ2UtYXR0YWNobWVudC1yZW1vdGUtY29udGVudFwiIHRhcmdldD1cIl9ibGFua1wiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtcmVtb3RlLXRpdGxlXCI+PHNwYW4gcmVmPVwib3BlblN0cmluZ0VsXCI+PC9zcGFuPjxzcGFuIHJlZj1cInVybFN0cmluZ0VsXCI+PC9zcGFuPjwvc3Bhbj5cbiAgICAgICAgPHN2ZyBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtcmVtb3RlLWljb25cIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCA0OCA0OFwiPjxwYXRoIGQ9XCJNMzggMzhIMTBWMTBoMTRWNkgxMGMtMi4yMSAwLTQgMS43OS00IDR2MjhjMCAyLjIxIDEuNzkgNCA0IDRoMjhjMi4yMSAwIDQtMS43OSA0LTRWMjRoLTR2MTR6TTI4IDZ2NGg3LjE3TDE1LjUxIDI5LjY2bDIuODMgMi44M0wzOCAxMi44M1YyMGg0VjZIMjh6XCI+PC9wYXRoPjwvc3ZnPlxuICAgICAgPC9hPmA7XG5cbiAgICAvLyBGb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgaWYgZWxlbWVudCBpcyBhbXAtc3RvcnktcGFnZS1vdXRsaW5rLlxuICAgIGNvbnN0IGhyZWZBdHRyID1cbiAgICAgIHRoaXMuZWxlbWVudC50YWdOYW1lID09PSAnQU1QLVNUT1JZLVBBR0UtT1VUTElOSydcbiAgICAgICAgPyB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignYScpLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICAgIDogdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXG4gICAgLy8gVVJMIHdpbGwgYmUgdmFsaWRhdGVkIGFuZCByZXNvbHZlZCBiYXNlZCBvbiB0aGUgY2Fub25pY2FsIFVSTCBpZiByZWxhdGl2ZVxuICAgIC8vIHdoZW4gbmF2aWdhdGluZy5cbiAgICBsaW5rLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWZBdHRyKTtcbiAgICBjb25zdCB7b3BlblN0cmluZ0VsLCB1cmxTdHJpbmdFbH0gPSBodG1sUmVmcyhsaW5rKTtcblxuICAgIC8vIE5hdmlnYXRpb24gaXMgaGFuZGxlZCBwcm9ncmFtbWF0aWNhbGx5LiBEaXNhYmxlIGNsaWNrcyBvbiB0aGUgcGxhY2Vob2xkZXJcbiAgICAvLyBhbmNob3IgdG8gcHJldmVudCBmcm9tIHVzZXJzIHRyaWdnZXJpbmcgZG91YmxlIG5hdmlnYXRpb25zLCB3aGljaCBoYXNcbiAgICAvLyBzaWRlIGVmZmVjdHMgaW4gbmF0aXZlIGNvbnRleHRzIG9wZW5pbmcgd2Vidmlld3MvQ0NUcy5cbiAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiBldmVudC5wcmV2ZW50RGVmYXVsdCgpKTtcblxuICAgIC8vIFNldCBpbWFnZS5cbiAgICBjb25zdCBvcGVuSW1nQXR0ciA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2N0YS1pbWFnZScpO1xuICAgIGlmIChvcGVuSW1nQXR0ciAmJiBvcGVuSW1nQXR0ciAhPT0gJ25vbmUnKSB7XG4gICAgICBjb25zdCBjdGFJbWdFbCA9IHRoaXMud2luLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgY3RhSW1nRWwuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LXBhZ2UtYXR0YWNobWVudC1yZW1vdGUtaW1nJyk7XG4gICAgICBzZXRJbXBvcnRhbnRTdHlsZXMoY3RhSW1nRWwsIHtcbiAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyBvcGVuSW1nQXR0ciArICcpJyxcbiAgICAgIH0pO1xuICAgICAgbGluay5wcmVwZW5kKGN0YUltZ0VsKTtcbiAgICB9IGVsc2UgaWYgKCFvcGVuSW1nQXR0cikge1xuICAgICAgLy8gQXR0YWNoIGxpbmsgaWNvbiBTVkcgYnkgZGVmYXVsdC5cbiAgICAgIGNvbnN0IGxpbmtJbWFnZSA9IGJ1aWxkT3BlbkF0dGFjaG1lbnRFbGVtZW50TGlua0ljb24obGluayk7XG4gICAgICBsaW5rLnByZXBlbmQobGlua0ltYWdlKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdXJsIHByZXZldyB0ZXh0LlxuICAgIGNvbnN0IGxvY2FsaXphdGlvblNlcnZpY2UgPSBnZXRMb2NhbGl6YXRpb25TZXJ2aWNlKGRldkFzc2VydCh0aGlzLmVsZW1lbnQpKTtcbiAgICBpZiAobG9jYWxpemF0aW9uU2VydmljZSkge1xuICAgICAgY29uc3QgbG9jYWxpemVkT3BlblN0cmluZyA9IGxvY2FsaXphdGlvblNlcnZpY2UuZ2V0TG9jYWxpemVkU3RyaW5nKFxuICAgICAgICBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfT1BFTl9PVVRMSU5LX1RFWFRcbiAgICAgICk7XG4gICAgICBvcGVuU3RyaW5nRWwudGV4dENvbnRlbnQgPSBsb2NhbGl6ZWRPcGVuU3RyaW5nO1xuICAgIH1cbiAgICB1cmxTdHJpbmdFbC50ZXh0Q29udGVudCA9IGhyZWZBdHRyO1xuXG4gICAgdGhpcy5jb250ZW50RWwuYXBwZW5kQ2hpbGQobGluayk7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBpbml0aWFsaXplTGlzdGVuZXJzXygpIHtcbiAgICBzdXBlci5pbml0aWFsaXplTGlzdGVuZXJzXygpO1xuXG4gICAgY29uc3QgY2xvc2VCdXR0b25FbCA9IHRoaXMuaGVhZGVyRWwucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LXBhZ2UtYXR0YWNobWVudC1jbG9zZS1idXR0b24nXG4gICAgKTtcbiAgICBpZiAoY2xvc2VCdXR0b25FbCkge1xuICAgICAgY2xvc2VCdXR0b25FbC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAnY2xpY2snLFxuICAgICAgICAoKSA9PiB0aGlzLmNsb3NlXygpLFxuICAgICAgICB0cnVlIC8qKiB1c2VDYXB0dXJlICovXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEFsd2F5cyBvcGVuIGxpbmtzIGluIGEgbmV3IHRhYi5cbiAgICB0aGlzLmNvbnRlbnRFbC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ2NsaWNrJyxcbiAgICAgIChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB7dGFyZ2V0fSA9IGV2ZW50O1xuICAgICAgICBpZiAodGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2EnKSB7XG4gICAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgndGFyZ2V0JywgJ19ibGFuaycpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogdXNlQ2FwdHVyZSAqL1xuICAgICk7XG5cbiAgICAvLyBDbG9zZXMgdGhlIGF0dGFjaG1lbnQgb24gb3BhY2l0eSBiYWNrZ3JvdW5kIGNsaWNrcy5cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICdjbGljaycsXG4gICAgICAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGV2ZW50LnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50J1xuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLmNsb3NlXygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogdXNlQ2FwdHVyZSAqL1xuICAgICk7XG5cbiAgICAvLyBDbG9zZXMgdGhlIHJlbW90ZSBhdHRhY2htZW50IGRyYXdlciB3aGVuIG5hdmlnYXRpb24gZGVlcGxpbmtlZCB0byBhbiBhcHAuXG4gICAgaWYgKHRoaXMudHlwZV8gPT09IEF0dGFjaG1lbnRUeXBlLk9VVExJTkspIHtcbiAgICAgIGNvbnN0IGFtcGRvYyA9IHRoaXMuZ2V0QW1wRG9jKCk7XG4gICAgICBhbXBkb2Mub25WaXNpYmlsaXR5Q2hhbmdlZCgoKSA9PiB7XG4gICAgICAgIGlmIChhbXBkb2MuaXNWaXNpYmxlKCkgJiYgdGhpcy5zdGF0ZSA9PT0gRHJhd2VyU3RhdGUuT1BFTikge1xuICAgICAgICAgIHRoaXMuY2xvc2VJbnRlcm5hbF8oZmFsc2UgLyoqIHNob3VsZEFuaW1hdGUgKi8pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBvcGVuKHNob3VsZEFuaW1hdGUgPSB0cnVlKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUgPT09IERyYXdlclN0YXRlLk9QRU4pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdXBlci5vcGVuKHNob3VsZEFuaW1hdGUpO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2UuZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9QQUdFX0FUVEFDSE1FTlRfU1RBVEUsIHRydWUpO1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfU1lTVEVNX1VJX0lTX1ZJU0lCTEUsIGZhbHNlKTtcblxuICAgIHRoaXMudG9nZ2xlQmFja2dyb3VuZE92ZXJsYXlfKHRydWUpO1xuXG4gICAgLy8gRG9uJ3QgY3JlYXRlIGEgbmV3IGhpc3RvcnkgZW50cnkgZm9yIHJlbW90ZSBhdHRhY2htZW50IGFzIHVzZXIgaXNcbiAgICAvLyBuYXZpZ2F0aW5nIGF3YXkuXG4gICAgaWYgKHRoaXMudHlwZV8gIT09IEF0dGFjaG1lbnRUeXBlLk9VVExJTkspIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRIaXN0b3J5U3RhdGUgPSAvKiogQHR5cGUgeyFPYmplY3R9ICovIChcbiAgICAgICAgZ2V0SGlzdG9yeVN0YXRlKHRoaXMud2luLmhpc3RvcnkpXG4gICAgICApO1xuICAgICAgY29uc3QgaGlzdG9yeVN0YXRlID0ge1xuICAgICAgICAuLi5jdXJyZW50SGlzdG9yeVN0YXRlLFxuICAgICAgICBbSGlzdG9yeVN0YXRlLkFUVEFDSE1FTlRfUEFHRV9JRF06IHRoaXMuc3RvcmVTZXJ2aWNlLmdldChcbiAgICAgICAgICBTdGF0ZVByb3BlcnR5LkNVUlJFTlRfUEFHRV9JRFxuICAgICAgICApLFxuICAgICAgfTtcblxuICAgICAgdGhpcy5oaXN0b3J5U2VydmljZV8ucHVzaCgoKSA9PiB0aGlzLmNsb3NlSW50ZXJuYWxfKCksIGhpc3RvcnlTdGF0ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5hbmFseXRpY3NTZXJ2aWNlXy50cmlnZ2VyRXZlbnQoU3RvcnlBbmFseXRpY3NFdmVudC5PUEVOLCB0aGlzLmVsZW1lbnQpO1xuICAgIHRoaXMuYW5hbHl0aWNzU2VydmljZV8udHJpZ2dlckV2ZW50KFxuICAgICAgU3RvcnlBbmFseXRpY3NFdmVudC5QQUdFX0FUVEFDSE1FTlRfRU5URVJcbiAgICApO1xuXG4gICAgaWYgKHRoaXMudHlwZV8gPT09IEF0dGFjaG1lbnRUeXBlLk9VVExJTkspIHtcbiAgICAgIGlmIChcbiAgICAgICAgaXNQYWdlQXR0YWNobWVudFVpVjJFeHBlcmltZW50T24odGhpcy53aW4pIHx8XG4gICAgICAgIHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FtcC1zdG9yeS1wYWdlLW91dGxpbmsnKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMub3BlblJlbW90ZVYyXygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5vcGVuUmVtb3RlXygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIHJlbW90ZSBhdHRhY2htZW50IHByZXZpZXcgVVJMIGFuaW1hdGlvbiBvbiBtb2JpbGUsXG4gICAqIGFuZCByZWRpcmVjdHMgdG8gdGhlIHNwZWNpZmllZCBVUkwuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvcGVuUmVtb3RlVjJfKCkge1xuICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIGFuIGFtcC1zdG9yeS1wYWdlLW91dGxpbmsgdGhlIGNsaWNrIHRhcmdldCBpcyBpdHMgYW5jaG9yIGVsZW1lbnQgY2hpbGQuXG4gICAgLy8gVGhpcyBpcyBmb3IgU0VPIGFuZCBhbmFseXRpY3Mgb3B0aW1pc2F0aW9uLlxuICAgIC8vIE90aGVyd2lzZSB0aGUgZWxlbWVudCBpcyB0aGUgbGVnYWN5IHZlcnNpb24sIGFtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQgd2l0aCBhbiBocmVmLFxuICAgIC8vIGFuZCBhIGNsaWNrIHRhcmdldCBpcyB0aGUgYnV0dG9uIGJ1aWx0IGJ5IHRoZSBjb21wb25lbnQuXG4gICAgY29uc3QgcHJvZ3JhbWF0aWNhbGx5Q2xpY2tPblRhcmdldCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHBhZ2VPdXRsaW5rQ2hpbGQgPSB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudFxuICAgICAgICAucXVlcnlTZWxlY3RvcignYW1wLXN0b3J5LXBhZ2Utb3V0bGluaycpXG4gICAgICAgID8ucXVlcnlTZWxlY3RvcignYScpO1xuXG4gICAgICBjb25zdCBwYWdlQXR0YWNobWVudENoaWxkID0gdGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnRcbiAgICAgICAgPy5xdWVyeVNlbGVjdG9yKCcuaS1hbXBodG1sLXN0b3J5LXBhZ2Utb3Blbi1hdHRhY2htZW50LWhvc3QnKVxuICAgICAgICAuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdhLmktYW1waHRtbC1zdG9yeS1wYWdlLW9wZW4tYXR0YWNobWVudCcpO1xuXG4gICAgICBpZiAocGFnZU91dGxpbmtDaGlsZCkge1xuICAgICAgICBwYWdlT3V0bGlua0NoaWxkLmNsaWNrKCk7XG4gICAgICB9IGVsc2UgaWYgKHBhZ2VBdHRhY2htZW50Q2hpbGQpIHtcbiAgICAgICAgdHJpZ2dlckNsaWNrRnJvbUxpZ2h0RG9tKHBhZ2VBdHRhY2htZW50Q2hpbGQsIHRoaXMuZWxlbWVudCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IGlzTW9iaWxlVUkgPVxuICAgICAgdGhpcy5zdG9yZVNlcnZpY2UuZ2V0KFN0YXRlUHJvcGVydHkuVUlfU1RBVEUpID09PSBVSVR5cGUuTU9CSUxFO1xuICAgIGlmICghaXNNb2JpbGVVSSkge1xuICAgICAgcHJvZ3JhbWF0aWNhbGx5Q2xpY2tPblRhcmdldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaW1lb3V0IHRvIHNob3dzIHBvc3QtdGFwIGFuaW1hdGlvbiBvbiBtb2JpbGUgb25seS5cbiAgICAgIFNlcnZpY2VzLnRpbWVyRm9yKHRoaXMud2luKS5kZWxheSgoKSA9PiB7XG4gICAgICAgIHByb2dyYW1hdGljYWxseUNsaWNrT25UYXJnZXQoKTtcbiAgICAgIH0sIFBPU1RfVEFQX0FOSU1BVElPTl9EVVJBVElPTik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgcmVtb3RlIGF0dGFjaG1lbnQgb3BlbmluZyBhbmltYXRpb24sIGFuZCByZWRpcmVjdHMgdG8gdGhlXG4gICAqIHNwZWNpZmllZCBVUkwuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvcGVuUmVtb3RlXygpIHtcbiAgICBjb25zdCBhbmltYXRpb25FbCA9IHRoaXMud2luLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGFuaW1hdGlvbkVsLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtZXhwYW5kJyk7XG4gICAgY29uc3Qgc3RvcnlFbCA9IGNsb3Nlc3QodGhpcy5lbGVtZW50LCAoZWwpID0+IGVsLnRhZ05hbWUgPT09ICdBTVAtU1RPUlknKTtcblxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICBzdG9yeUVsLmFwcGVuZENoaWxkKGFuaW1hdGlvbkVsKTtcbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIC8vIEdpdmUgc29tZSB0aW1lIGZvciB0aGUgMTIwbXMgQ1NTIGFuaW1hdGlvbiB0byBydW4gKGNmXG4gICAgICAvLyBhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50LmNzcykuIFRoZSBuYXZpZ2F0aW9uIGl0c2VsZiB3aWxsIHRha2Ugc29tZVxuICAgICAgLy8gdGltZSwgZGVwZW5kaW5nIG9uIHRoZSB0YXJnZXQgYW5kIG5ldHdvcmsgY29uZGl0aW9ucy5cbiAgICAgIHRoaXMud2luLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBjbGlja1RhcmdldCA9IHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50XG4gICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5pLWFtcGh0bWwtc3RvcnktcGFnZS1vcGVuLWF0dGFjaG1lbnQtaG9zdCcpXG4gICAgICAgICAgLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignYS5pLWFtcGh0bWwtc3RvcnktcGFnZS1vcGVuLWF0dGFjaG1lbnQnKTtcbiAgICAgICAgdHJpZ2dlckNsaWNrRnJvbUxpZ2h0RG9tKGNsaWNrVGFyZ2V0LCB0aGlzLmVsZW1lbnQpO1xuICAgICAgfSk7XG4gICAgfSwgNTApO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMgdGhlIGhpc3Rvcnkgc3RhdGUgd2UgYWRkZWQgd2hlbiBvcGVuaW5nIHRoZSBkcmF3ZXIgaXMgcG9wcGVkLFxuICAgKiBhbmQgY2xvc2VzIHRoZSBkcmF3ZXIgZWl0aGVyIGRpcmVjdGx5LCBvciB0aHJvdWdoIHRoZSBvblBvcCBjYWxsYmFjay5cbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBjbG9zZV8oKSB7XG4gICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XG4gICAgICAvLyBJZiB0aGUgZHJhd2VyIHdhcyBvcGVuLCBwb3AgdGhlIGhpc3RvcnkgZW50cnkgdGhhdCB3YXMgYWRkZWQsIHdoaWNoXG4gICAgICAvLyB3aWxsIGNsb3NlIHRoZSBkcmF3ZXIgdGhyb3VnaCB0aGUgb25Qb3AgY2FsbGJhY2suXG4gICAgICBjYXNlIERyYXdlclN0YXRlLk9QRU46XG4gICAgICBjYXNlIERyYXdlclN0YXRlLkRSQUdHSU5HX1RPX0NMT1NFOlxuICAgICAgICB0aGlzLmhpc3RvcnlTZXJ2aWNlXy5nb0JhY2soKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBJZiB0aGUgZHJhd2VyIHdhcyBub3Qgb3Blbiwgbm8gaGlzdG9yeSBlbnRyeSB3YXMgYWRkZWQsIHNvIHdlIGNhblxuICAgICAgLy8gY2xvc2UgdGhlIGRyYXdlciBkaXJlY3RseS5cbiAgICAgIGNhc2UgRHJhd2VyU3RhdGUuRFJBR0dJTkdfVE9fT1BFTjpcbiAgICAgICAgdGhpcy5jbG9zZUludGVybmFsXygpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBjbG9zZUludGVybmFsXyhzaG91bGRBbmltYXRlID0gdHJ1ZSkge1xuICAgIGlmICh0aGlzLnN0YXRlID09PSBEcmF3ZXJTdGF0ZS5DTE9TRUQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdXBlci5jbG9zZUludGVybmFsXyhzaG91bGRBbmltYXRlKTtcblxuICAgIHRoaXMudG9nZ2xlQmFja2dyb3VuZE92ZXJsYXlfKGZhbHNlKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfUEFHRV9BVFRBQ0hNRU5UX1NUQVRFLCBmYWxzZSk7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2UuZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9TWVNURU1fVUlfSVNfVklTSUJMRSwgdHJ1ZSk7XG5cbiAgICBjb25zdCBzdG9yeUVsID0gY2xvc2VzdCh0aGlzLmVsZW1lbnQsIChlbCkgPT4gZWwudGFnTmFtZSA9PT0gJ0FNUC1TVE9SWScpO1xuICAgIGNvbnN0IGFuaW1hdGlvbkVsID0gc3RvcnlFbC5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktcGFnZS1hdHRhY2htZW50LWV4cGFuZCdcbiAgICApO1xuICAgIGlmIChhbmltYXRpb25FbCkge1xuICAgICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgcmVtb3ZlRWxlbWVudChkZXYoKS5hc3NlcnRFbGVtZW50KGFuaW1hdGlvbkVsKSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRIaXN0b3J5U3RhdGUodGhpcy53aW4sIEhpc3RvcnlTdGF0ZS5BVFRBQ0hNRU5UX1BBR0VfSUQsIG51bGwpO1xuXG4gICAgdGhpcy5hbmFseXRpY3NTZXJ2aWNlXy50cmlnZ2VyRXZlbnQoXG4gICAgICBTdG9yeUFuYWx5dGljc0V2ZW50LkNMT1NFLFxuICAgICAgdGhpcy5lbGVtZW50XG4gICAgKTtcbiAgICB0aGlzLmFuYWx5dGljc1NlcnZpY2VfLnRyaWdnZXJFdmVudChcbiAgICAgIFN0b3J5QW5hbHl0aWNzRXZlbnQuUEFHRV9BVFRBQ0hNRU5UX0VYSVRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNBY3RpdmVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHRvZ2dsZUJhY2tncm91bmRPdmVybGF5Xyhpc0FjdGl2ZSkge1xuICAgIGNvbnN0IGFjdGl2ZVBhZ2VFbCA9IGNsb3Nlc3QoXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAoZWwpID0+IGVsLnRhZ05hbWUgPT09ICdBTVAtU1RPUlktUEFHRSdcbiAgICApO1xuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICBhY3RpdmVQYWdlRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICAgJ2ktYW1waHRtbC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtYWN0aXZlJyxcbiAgICAgICAgaXNBY3RpdmVcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-page-attachment.js