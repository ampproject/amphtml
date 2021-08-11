function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}var _template = ["<button class=i-amphtml-story-page-attachment-close-button aria-label=close role=button></button>"],_template2 = ["<span class=i-amphtml-story-page-attachment-title></span>"],_template3 = ["<div class=i-amphtml-story-draggable-drawer-header-title-and-close></div>"],_template4 = ["<a class=i-amphtml-story-page-attachment-remote-content target=_blank><span class=i-amphtml-story-page-attachment-remote-title></span> <span class=i-amphtml-story-page-attachment-remote-icon></span></a>"],_template5 = ["<a class=i-amphtml-story-page-attachment-remote-content target=_blank><span class=i-amphtml-story-page-attachment-remote-title><span ref=openStringEl></span><span ref=urlStringEl></span></span> <svg class=i-amphtml-story-page-attachment-remote-icon xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 48 48\"><path d=\"M38 38H10V10h14V6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V24h-4v14zM28 6v4h7.17L15.51 29.66l2.83 2.83L38 12.83V20h4V6H28z\"></path></svg></a>"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _get(target, property, receiver) {if (typeof Reflect !== "undefined" && Reflect.get) {_get = Reflect.get;} else {_get = function _get(target, property, receiver) {var base = _superPropBase(target, property);if (!base) return;var desc = Object.getOwnPropertyDescriptor(base, property);if (desc.get) {return desc.get.call(receiver);}return desc.value;};}return _get(target, property, receiver || target);}function _superPropBase(object, property) {while (!Object.prototype.hasOwnProperty.call(object, property)) {object = _getPrototypeOf(object);if (object === null) break;}return object;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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
  LIGHT: 'light', // default
  DARK: 'dark',
  CUSTOM: 'custom' };


/**
 * @enum
 */
var AttachmentType = {
  INLINE: 0,
  OUTLINK: 1 };


/**
 * AMP Story page attachment.
 */
export var AmpStoryPageAttachment = /*#__PURE__*/function (_DraggableDrawer) {_inherits(AmpStoryPageAttachment, _DraggableDrawer);var _super = _createSuper(AmpStoryPageAttachment);
  /** @param {!AmpElement} element */
  function AmpStoryPageAttachment(element) {var _this;_classCallCheck(this, AmpStoryPageAttachment);
    _this = _super.call(this, element);

    /** @private @const {!./story-analytics.StoryAnalyticsService} */
    _this.analyticsService_ = getAnalyticsService(_this.win, _this.element);

    /** @private @const {!../../../src/service/history-impl.History} */
    _this.historyService_ = Services.historyForDoc(_this.element);

    /** @private {?AttachmentType} */
    _this.type_ = null;return _this;
  }

  /**
   * @override
   */_createClass(AmpStoryPageAttachment, [{ key: "buildCallback", value:
    function buildCallback() {var _this$element$getAttr,_this2 = this;
      _get(_getPrototypeOf(AmpStoryPageAttachment.prototype), "buildCallback", this).call(this);

      var theme = ((_this$element$getAttr = this.element.getAttribute('theme')) === null || _this$element$getAttr === void 0) ? (void 0) : _this$element$getAttr.toLowerCase();
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
      var isOutlink =
      this.element.tagName === 'AMP-STORY-PAGE-OUTLINK' ||
      this.element.hasAttribute('href');
      this.type_ = isOutlink ? AttachmentType.OUTLINK : AttachmentType.INLINE;

      if (this.type_ === AttachmentType.INLINE) {
        this.buildInline_();
      }

      if (
      this.type_ === AttachmentType.OUTLINK &&
      !isPageAttachmentUiV2ExperimentOn(this.win))
      {
        this.buildRemote_();
      }

      this.win.addEventListener('pageshow', function (event) {
        // On browser back, Safari does not reload the page but resumes its cached
        // version. This event's parameter lets us know when this happens so we
        // can cleanup the remote opening animation.
        if (event.persisted) {
          _this2.closeInternal_(false /** shouldAnimate */);
        }
      });

      toggle(this.element, true);
      this.element.setAttribute('aria-live', 'assertive');
    }

    /**
     * @override
     */ }, { key: "layoutCallback", value:
    function layoutCallback() {
      _get(_getPrototypeOf(AmpStoryPageAttachment.prototype), "layoutCallback", this).call(this);
      // Outlink attachment v2 renders an image and must be built in layoutCallback.
      if (
      this.type_ === AttachmentType.OUTLINK &&
      isPageAttachmentUiV2ExperimentOn(this.win))
      {
        this.buildRemoteV2_();
      }
    }

    /**
     * Builds inline page attachment's drawer UI.
     * @private
     */ }, { key: "buildInline_", value:
    function buildInline_() {
      var closeButtonEl = htmlFor(this.element)(_template);



      var localizationService = getLocalizationService(devAssert(this.element));

      var titleEl = htmlFor(this.element)(_template2);


      if (localizationService) {
        var localizedCloseString = localizationService.getLocalizedString(
        LocalizedStringId.AMP_STORY_CLOSE_BUTTON_LABEL);

        closeButtonEl.setAttribute('aria-label', localizedCloseString);
      }

      if (this.element.hasAttribute('data-title')) {
        titleEl.textContent = this.element.getAttribute('data-title');
      }

      if (isPageAttachmentUiV2ExperimentOn(this.win)) {
        var titleAndCloseWrapperEl = this.headerEl.appendChild(
        htmlFor(this.element)(_template3));


        titleAndCloseWrapperEl.appendChild(closeButtonEl);
        titleAndCloseWrapperEl.appendChild(titleEl);
      } else {
        this.headerEl.appendChild(closeButtonEl);
        this.headerEl.appendChild(titleEl);
      }

      var templateEl = this.element.querySelector(
      '.i-amphtml-story-draggable-drawer');


      while (this.element.firstChild && this.element.firstChild !== templateEl) {
        this.contentEl.appendChild(this.element.firstChild);
      }

      // Ensures the content of the attachment won't be rendered/loaded until we
      // actually need it.
      toggle( /** @type {!Element} */(this.containerEl), true);
    }

    /**
     * Builds remote page attachment's drawer UI.
     * Can be removed when amp-story-page-attachment-ui-v2 is laumched.
     * @private
     */ }, { key: "buildRemote_", value:
    function buildRemote_() {
      this.setDragCap_(DRAG_CAP_PX);
      this.setOpenThreshold_(OPEN_THRESHOLD_PX);

      this.headerEl.classList.add(
      'i-amphtml-story-draggable-drawer-header-attachment-remote');

      this.element.classList.add('i-amphtml-story-page-attachment-remote');
      // Use an anchor element to make this a real link in vertical rendering.
      var link = htmlFor(this.element)(_template4);




      // URL will be validated and resolved based on the canonical URL if relative
      // when navigating.
      link.setAttribute('href', this.element.getAttribute('href'));
      this.contentEl.appendChild(link);

      this.contentEl.querySelector(
      '.i-amphtml-story-page-attachment-remote-title').
      textContent =
      this.element.getAttribute('data-title') ||
      Services.urlForDoc(this.element).getSourceOrigin(
      this.element.getAttribute('href') ||
      // Used if amp-story-page-attachment-ui-v2 is off and
      // this.elmement is an amp-story-page-outlink.
      this.element.querySelector('a').getAttribute('href'));

    }

    /**
     * Builds remote V2 page attachment's drawer UI.
     * Used for the amp-story-page-attachment-ui-v2 experiment.
     * @private
     */ }, { key: "buildRemoteV2_", value:
    function buildRemoteV2_() {
      this.setDragCap_(DRAG_CAP_PX_V2);
      this.setOpenThreshold_(OPEN_THRESHOLD_PX);

      this.headerEl.classList.add(
      'i-amphtml-story-draggable-drawer-header-attachment-remote');

      this.element.classList.add('i-amphtml-story-page-attachment-remote');
      // Use an anchor element to make this a real link in vertical rendering.
      var link = htmlFor(this.element)(_template5);





      // For backwards compatibility if element is amp-story-page-outlink.
      var hrefAttr =
      this.element.tagName === 'AMP-STORY-PAGE-OUTLINK' ?
      this.element.querySelector('a').getAttribute('href') :
      this.element.getAttribute('href');

      // URL will be validated and resolved based on the canonical URL if relative
      // when navigating.
      link.setAttribute('href', hrefAttr);
      var _htmlRefs = htmlRefs(link),openStringEl = _htmlRefs.openStringEl,urlStringEl = _htmlRefs.urlStringEl;

      // Navigation is handled programmatically. Disable clicks on the placeholder
      // anchor to prevent from users triggering double navigations, which has
      // side effects in native contexts opening webviews/CCTs.
      link.addEventListener('click', function (event) {return event.preventDefault();});

      // Set image.
      var openImgAttr = this.element.getAttribute('cta-image');
      if (openImgAttr && openImgAttr !== 'none') {
        var ctaImgEl = this.win.document.createElement('div');
        ctaImgEl.classList.add('i-amphtml-story-page-attachment-remote-img');
        setImportantStyles(ctaImgEl, {
          'background-image': 'url(' + openImgAttr + ')' });

        link.prepend(ctaImgEl);
      } else if (!openImgAttr) {
        // Attach link icon SVG by default.
        var linkImage = buildOpenAttachmentElementLinkIcon(link);
        link.prepend(linkImage);
      }

      // Set url prevew text.
      var localizationService = getLocalizationService(devAssert(this.element));
      if (localizationService) {
        var localizedOpenString = localizationService.getLocalizedString(
        LocalizedStringId.AMP_STORY_OPEN_OUTLINK_TEXT);

        openStringEl.textContent = localizedOpenString;
      }
      urlStringEl.textContent = hrefAttr;

      this.contentEl.appendChild(link);
    }

    /**
     * @override
     */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {var _this3 = this;
      _get(_getPrototypeOf(AmpStoryPageAttachment.prototype), "initializeListeners_", this).call(this);

      var closeButtonEl = this.headerEl.querySelector(
      '.i-amphtml-story-page-attachment-close-button');

      if (closeButtonEl) {
        closeButtonEl.addEventListener(
        'click',
        function () {return _this3.close_();},
        true /** useCapture */);

      }

      // Always open links in a new tab.
      this.contentEl.addEventListener(
      'click',
      function (event) {
        var target = event.target;
        if (target.tagName.toLowerCase() === 'a') {
          target.setAttribute('target', '_blank');
        }
      },
      true /** useCapture */);


      // Closes the attachment on opacity background clicks.
      this.element.addEventListener(
      'click',
      function (event) {
        if (
        event.target.tagName.toLowerCase() === 'amp-story-page-attachment')
        {
          _this3.close_();
        }
      },
      true /** useCapture */);


      // Closes the remote attachment drawer when navigation deeplinked to an app.
      if (this.type_ === AttachmentType.OUTLINK) {
        var ampdoc = this.getAmpDoc();
        ampdoc.onVisibilityChanged(function () {
          if (ampdoc.isVisible() && _this3.state === DrawerState.OPEN) {
            _this3.closeInternal_(false /** shouldAnimate */);
          }
        });
      }
    }

    /**
     * @override
     */ }, { key: "open", value:
    function open() {var _this4 = this;var shouldAnimate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
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
        var currentHistoryState = /** @type {!Object} */(
        getHistoryState(this.win.history));

        var historyState = _objectSpread(_objectSpread({},
        currentHistoryState), {}, _defineProperty({},
        HistoryState.ATTACHMENT_PAGE_ID, this.storeService.get(
        StateProperty.CURRENT_PAGE_ID)));



        this.historyService_.push(function () {return _this4.closeInternal_();}, historyState);
      }

      this.analyticsService_.triggerEvent(StoryAnalyticsEvent.OPEN, this.element);
      this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.PAGE_ATTACHMENT_ENTER);


      if (this.type_ === AttachmentType.OUTLINK) {
        if (
        isPageAttachmentUiV2ExperimentOn(this.win) ||
        this.element.parentElement.querySelector('amp-story-page-outlink'))
        {
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
     */ }, { key: "openRemoteV2_", value:
    function openRemoteV2_() {var _this5 = this;
      // If the element is an amp-story-page-outlink the click target is its anchor element child.
      // This is for SEO and analytics optimisation.
      // Otherwise the element is the legacy version, amp-story-page-attachment with an href,
      // and a click target is the button built by the component.
      var programaticallyClickOnTarget = function programaticallyClickOnTarget() {var _this5$element$parent, _this5$element$parent2;
        var pageOutlinkChild = ((_this5$element$parent = _this5.element.parentElement.
        querySelector('amp-story-page-outlink')) === null || _this5$element$parent === void 0) ? (void 0) : _this5$element$parent.
        querySelector('a');

        var pageAttachmentChild = ((_this5$element$parent2 = _this5.element.parentElement) === null || _this5$element$parent2 === void 0) ? (void 0) : _this5$element$parent2.
        querySelector('.i-amphtml-story-page-open-attachment-host').
        shadowRoot.querySelector('a.i-amphtml-story-page-open-attachment');

        if (pageOutlinkChild) {
          pageOutlinkChild.click();
        } else if (pageAttachmentChild) {
          triggerClickFromLightDom(pageAttachmentChild, _this5.element);
        }
      };

      var isMobileUI =
      this.storeService.get(StateProperty.UI_STATE) === UIType.MOBILE;
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
     */ }, { key: "openRemote_", value:
    function openRemote_() {var _this6 = this;
      var animationEl = this.win.document.createElement('div');
      animationEl.classList.add('i-amphtml-story-page-attachment-expand');
      var storyEl = closest(this.element, function (el) {return el.tagName === 'AMP-STORY';});

      this.mutateElement(function () {
        storyEl.appendChild(animationEl);
      }).then(function () {
        // Give some time for the 120ms CSS animation to run (cf
        // amp-story-page-attachment.css). The navigation itself will take some
        // time, depending on the target and network conditions.
        _this6.win.setTimeout(function () {
          var clickTarget = _this6.element.parentElement.
          querySelector('.i-amphtml-story-page-open-attachment-host').
          shadowRoot.querySelector('a.i-amphtml-story-page-open-attachment');
          triggerClickFromLightDom(clickTarget, _this6.element);
        });
      }, 50);
    }

    /**
     * Ensures the history state we added when opening the drawer is popped,
     * and closes the drawer either directly, or through the onPop callback.
     * @override
     */ }, { key: "close_", value:
    function close_() {
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
          break;}

    }

    /**
     * @override
     */ }, { key: "closeInternal_", value:
    function closeInternal_() {var shouldAnimate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      if (this.state === DrawerState.CLOSED) {
        return;
      }

      _get(_getPrototypeOf(AmpStoryPageAttachment.prototype), "closeInternal_", this).call(this, shouldAnimate);

      this.toggleBackgroundOverlay_(false);

      this.storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, false);
      this.storeService.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, true);

      var storyEl = closest(this.element, function (el) {return el.tagName === 'AMP-STORY';});
      var animationEl = storyEl.querySelector(
      '.i-amphtml-story-page-attachment-expand');

      if (animationEl) {
        this.mutateElement(function () {
          removeElement( /** @type {!Element} */(animationEl));
        });
      }

      setHistoryState(this.win, HistoryState.ATTACHMENT_PAGE_ID, null);

      this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.CLOSE,
      this.element);

      this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.PAGE_ATTACHMENT_EXIT);

    }

    /**
     * @param {boolean} isActive
     * @private
     */ }, { key: "toggleBackgroundOverlay_", value:
    function toggleBackgroundOverlay_(isActive) {
      var activePageEl = closest(
      this.element,
      function (el) {return el.tagName === 'AMP-STORY-PAGE';});

      this.mutateElement(function () {
        activePageEl.classList.toggle(
        'i-amphtml-story-page-attachment-active',
        isActive);

      });
    } }]);return AmpStoryPageAttachment;}(DraggableDrawer);
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-page-attachment.js