function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}import { resolvedPromise as _resolvedPromise7 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise6 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";var _template = ["<button role=button class=\"i-amphtml-story-page-play-button i-amphtml-story-system-reset\"><span class=i-amphtml-story-page-play-label></span> <span class=i-amphtml-story-page-play-icon></span></button>"],_template2 = ["<div class=\"i-amphtml-story-page-error i-amphtml-story-system-reset\"><span class=i-amphtml-story-page-error-label></span> <span class=i-amphtml-story-page-error-icon></span></div>"];function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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

/**
 * @fileoverview Embeds a single page in a story
 *
 * Example:
 * <code>
 * <amp-story-page>
 *   ...
 * </amp-story-page>
 * </code>
 */
import {
AFFILIATE_LINK_SELECTOR,
AmpStoryAffiliateLink } from "./amp-story-affiliate-link";

import {
Action,
StateProperty,
UIType,
getStoreService } from "./amp-story-store-service";

import { AdvancementConfig } from "./page-advancement";
import { AmpEvents } from "../../../src/core/constants/amp-events";
import {
AmpStoryEmbeddedComponent,
EMBED_ID_ATTRIBUTE_NAME,
EXPANDABLE_COMPONENTS,
expandableElementsSelectors } from "./amp-story-embedded-component";

import { AnimationManager, hasAnimations } from "./animation";
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { Deferred } from "../../../src/core/data-structures/promise";
import { EventType, dispatch } from "./events";
import { Layout } from "../../../src/core/dom/layout";
import { LoadingSpinner } from "./loading-spinner";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { MediaPool } from "./media-pool";
import { Services } from "../../../src/service";
import { StoryAdSegmentTimes } from "../../../src/experiments/story-ad-progress-segment";
import { VideoEvents, delegateAutoplay } from "../../../src/video-interface";
import { addAttributesToElement, iterateCursor } from "../../../src/core/dom";
import {
closestAncestorElementBySelector,
scopedQuerySelectorAll } from "../../../src/core/dom/query";

import { createShadowRootWithStyle, setTextBackgroundColor } from "./utils";
import { debounce } from "../../../src/core/types/function";
import { dev } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { getAmpdoc } from "../../../src/service-helpers";
import { getFriendlyIframeEmbedOptional } from "../../../src/iframe-helper";
import { getLocalizationService } from "./amp-story-localization-service";
import { getLogEntries } from "./logging";
import { getMediaPerformanceMetricsService } from "./media-performance-metrics-service";
import { getMode } from "../../../src/mode";
import { htmlFor } from "../../../src/core/dom/static-template";
import { isAutoplaySupported } from "../../../src/core/dom/video";
import { isExperimentOn } from "../../../src/experiments";
import { isPageAttachmentUiV2ExperimentOn } from "./amp-story-page-attachment-ui-v2";
import { isPrerenderActivePage } from "./prerender-active-page";
import { listen, listenOnce } from "../../../src/event-helper";
import { CSS as pageAttachmentCSS } from "../../../build/amp-story-open-page-attachment-0.1.css";
import { propagateAttributes } from "../../../src/core/dom/propagate-attributes";
import { px, toggle } from "../../../src/core/dom/style";
import { renderPageAttachmentUI } from "./amp-story-open-page-attachment";
import { renderPageDescription } from "./semantic-render";
import { whenUpgradedToCustomElement } from "../../../src/amp-element-helpers";

import { toArray } from "../../../src/core/types/array";
import { upgradeBackgroundAudio } from "./audio";

/**
 * CSS class for an amp-story-page that indicates the entire page is loaded.
 * @const {string}
 */
var PAGE_LOADED_CLASS_NAME = 'i-amphtml-story-page-loaded';

/**
 * Selectors for media elements.
 * Only get the page media: direct children of amp-story-page (ie:
 * background-audio), or descendant of amp-story-grid-layer. That excludes media
 * contained in amp-story-page-attachment.
 * @enum {string}
 */
export var Selectors = {
  // which media to wait for on page layout.
  ALL_AMP_MEDIA:
  'amp-story-grid-layer amp-audio, ' +
  'amp-story-grid-layer amp-video, amp-story-grid-layer amp-img, ' +
  'amp-story-grid-layer amp-anim',
  ALL_AMP_VIDEO: 'amp-story-grid-layer amp-video',
  ALL_IFRAMED_MEDIA: 'audio, video',
  ALL_PLAYBACK_AMP_MEDIA:
  'amp-story-grid-layer amp-audio, amp-story-grid-layer amp-video',
  // TODO(gmajoulet): Refactor the way these selectors are used. They will be
  // passed to scopedQuerySelectorAll which expects only one selector and not
  // multiple separated by commas. `> audio` has to be kept first of the list to
  // work with this current implementation.
  ALL_PLAYBACK_MEDIA:
  '> audio, amp-story-grid-layer audio, amp-story-grid-layer video',
  ALL_VIDEO: 'amp-story-grid-layer video',
  ALL_TABBABLE: 'a, amp-twitter > iframe' };


/** @private @const {string} */
var EMBEDDED_COMPONENTS_SELECTORS = Object.keys(EXPANDABLE_COMPONENTS).join(
', ');


/** @private @const {string} */
var INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS = Object.values(
expandableElementsSelectors()).
join(',');

/** @private @const {number} */
var RESIZE_TIMEOUT_MS = 1000;

/** @private @const {string} */
var TAG = 'amp-story-page';

/** @private @const {string} */
var ADVERTISEMENT_ATTR_NAME = 'ad';

/** @private @const {number} */
var REWIND_TIMEOUT_MS = 350;

/** @private @const {string} */
var DEFAULT_PREVIEW_AUTO_ADVANCE_DURATION = '2s';

/** @private @const {string} */
var VIDEO_PREVIEW_AUTO_ADVANCE_DURATION = '5s';

/** @private @const {number} */
var VIDEO_MINIMUM_AUTO_ADVANCE_DURATION_S = 2;

/**
 * @param {!Element} element
 * @return {!Element}
 */
var buildPlayMessageElement = function buildPlayMessageElement(element) {return (
    htmlFor(element)(_template));};





/**
 * @param {!Element} element
 * @return {!Element}
 */
var buildErrorMessageElement = function buildErrorMessageElement(element) {return (
    htmlFor(element)(_template2));};





/**
 * amp-story-page states.
 * @enum {number}
 */
export var PageState = {
  NOT_ACTIVE: 0, // Page is not displayed. Could still be visible on desktop.
  PLAYING: 1, // Page is currently the main page, and playing.
  PAUSED: 2 // Page is currently the main page, but not playing.
};

/** @const @enum {string}*/
export var NavigationDirection = {
  NEXT: 'next',
  PREVIOUS: 'previous' };


/**
 * Prepares an embed for its expanded mode animation. Since this requires
 * calculating the size of the embed, we debounce after each resize event to
 * make sure we have the final size before doing the calculation for the
 * animation.
 * @param {!Window} win
 * @param {!Element} page
 * @param {!../../../src/service/mutator-interface.MutatorInterface} mutator
 * @return {function(!Element, ?UnlistenDef)}
 */
function debounceEmbedResize(win, page, mutator) {
  return debounce(
  win,
  function (el, unlisten) {
    AmpStoryEmbeddedComponent.prepareForAnimation(
    page, /** @type {!Element} */(
    el),
    mutator);

    if (unlisten) {
      unlisten();
    }
  },
  RESIZE_TIMEOUT_MS);

}

/**
 * The <amp-story-page> custom element, which represents a single page of
 * an <amp-story>.
 */
export var AmpStoryPage = /*#__PURE__*/function (_AMP$BaseElement) {_inherits(AmpStoryPage, _AMP$BaseElement);var _super = _createSuper(AmpStoryPage);





  /** @param {!AmpElement} element */
  function AmpStoryPage(element) {var _this;_classCallCheck(this, AmpStoryPage);
    _this = _super.call(this, element);

    /** @private {?AnimationManager} */
    _this.animationManager_ = null;

    /** @private {?AdvancementConfig} */
    _this.advancement_ = null;

    /** @const @private {!function(boolean)} */
    _this.debounceToggleLoadingSpinner_ = debounce(
    _this.win,
    function (isActive) {return _this.toggleLoadingSpinner_(!!isActive);},
    100);


    /** @private {?LoadingSpinner} */
    _this.loadingSpinner_ = null;

    /** @private {?Element} */
    _this.playMessageEl_ = null;

    /** @private {?Element} */
    _this.errorMessageEl_ = null;

    /** @private {?Element} */
    _this.openAttachmentEl_ = null;

    /** @private @const {!../../../src/service/mutator-interface.MutatorInterface} */
    _this.mutator_ = Services.mutatorForDoc(getAmpdoc(_this.win.document));

    var deferred = new Deferred();

    /** @private @const {!./media-performance-metrics-service.MediaPerformanceMetricsService} */
    _this.mediaPerformanceMetricsService_ = getMediaPerformanceMetricsService(
    _this.win);


    /** @private {!Array<!HTMLMediaElement>} */
    _this.performanceTrackedVideos_ = [];

    /** @private {?Promise} */
    _this.registerAllMediaPromise_ = null;

    /** @private @const {!Promise<!MediaPool>} */
    _this.mediaPoolPromise_ = deferred.promise;

    /** @private @const {!function(!MediaPool)} */
    _this.mediaPoolResolveFn_ = deferred.resolve;

    /** @private @const {!function(*)} */
    _this.mediaPoolRejectFn_ = deferred.reject;

    /** @private {!PageState} */
    _this.state_ = PageState.NOT_ACTIVE;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    _this.storeService_ = getStoreService(_this.win);

    /** @private {?Element} */
    _this.cssVariablesStyleEl_ = null;

    /** @private {?../../../src/layout-rect.LayoutSizeDef} */
    _this.layoutBox_ = null;

    /** @private {!Array<function()>} */
    _this.unlisteners_ = [];

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    _this.timer_ = Services.timerFor(_this.win);

    /** @private {!Deferred} */
    _this.backgroundAudioDeferred_ = new Deferred();

    /**
     * Whether the user agent matches a bot.  This is used to prevent resource
     * optimizations that make the document less useful at crawl time, e.g.
     * removing sources from videos.
     * @private @const {boolean}
     */
    _this.isBotUserAgent_ = Services.platformFor(_this.win).isBot();

    /** @private {?number} Time at which an audio element failed playing. */
    _this.playAudioElementFromTimestamp_ = null;return _this;
  }

  /**
   * @private
   */_createClass(AmpStoryPage, [{ key: "maybeCreateAnimationManager_", value:
    function maybeCreateAnimationManager_() {
      if (this.animationManager_) {
        return;
      }
      if (!hasAnimations(this.element)) {
        return;
      }
      this.animationManager_ = AnimationManager.create(
      this.element,
      this.getAmpDoc(),
      this.getAmpDoc().getUrl());

    }

    /** @override */ }, { key: "buildCallback", value:
    function buildCallback() {var _this2 = this;
      this.delegateVideoAutoplay();
      this.markMediaElementsWithPreload_();
      this.initializeMediaPool_();
      this.maybeCreateAnimationManager_();
      this.maybeSetPreviewDuration_();
      this.maybeSetStoryNextUp_();
      this.advancement_ = AdvancementConfig.forElement(this.win, this.element);
      this.advancement_.addPreviousListener(function () {return _this2.previous();});
      this.advancement_.addAdvanceListener(function () {return (
          _this2.next( /* opt_isAutomaticAdvance */true));});

      this.advancement_.addProgressListener(function (progress) {return (
          _this2.emitProgress_(progress));});

      this.setDescendantCssTextStyles_();
      this.storeService_.subscribe(
      StateProperty.UI_STATE,
      function (uiState) {return _this2.onUIStateUpdate_(uiState);},
      true /* callToInitialize */);

      this.setPageDescription_();
      this.element.setAttribute('role', 'region');
      this.initializeImgAltTags_();
      this.initializeTabbableElements_();
    }

    /** @private */ }, { key: "maybeSetPreviewDuration_", value:
    function maybeSetPreviewDuration_() {
      if (this.storeService_.get(StateProperty.PREVIEW_STATE)) {
        var videos = this.getAllVideos_();

        var autoAdvanceAttr =
        videos.length > 0 ?
        VIDEO_PREVIEW_AUTO_ADVANCE_DURATION :
        DEFAULT_PREVIEW_AUTO_ADVANCE_DURATION;

        addAttributesToElement(
        this.element,
        dict({
          'auto-advance-after': autoAdvanceAttr }));


      }
    }

    /**
     * Reads the storyNextUp param if provided and sets the auto-advance-after
     * attribute to the given value if there isn't one set by the publisher. The
     * auto-advance-after attribute may later be set to the duration of the first
     * video if there is one, once the metadata is available.
     * @private
     */ }, { key: "maybeSetStoryNextUp_", value:
    function maybeSetStoryNextUp_() {
      var autoAdvanceAttr = this.element.getAttribute('auto-advance-after');
      // This is a private param used for testing, it may be changed
      // or removed without notice.
      var storyNextUpParam = Services.viewerForDoc(this.element).getParam(
      'storyNextUp');

      if (
      autoAdvanceAttr !== null ||
      storyNextUpParam === null ||
      // This is a special value that indicates we are in the viewer indicated control group.
      storyNextUpParam === StoryAdSegmentTimes.SENTINEL)
      {
        return;
      }
      addAttributesToElement(
      this.element,
      dict({
        'auto-advance-after': storyNextUpParam }));


      this.listenAndUpdateAutoAdvanceDuration_();
    }

    /**
     * If there's a video on the page, this sets a listener to update
     * the TimeBasedAdvancement when the first video's duration becomes available.
     * @private
     */ }, { key: "listenAndUpdateAutoAdvanceDuration_", value:
    function listenAndUpdateAutoAdvanceDuration_() {var _this3 = this;
      var video = this.getFirstAmpVideo_();
      if (video === null) {
        return;
      }
      whenUpgradedToCustomElement(video).
      then(function () {return video.getImpl();}).
      then(function (videoImpl) {
        var videoDuration = videoImpl.getDuration();
        if (!isNaN(videoDuration)) {
          _this3.maybeUpdateAutoAdvanceTime_(videoDuration);
          return;
        }
        listenOnce(video, VideoEvents.LOADEDMETADATA, function () {
          _this3.maybeUpdateAutoAdvanceTime_(videoImpl.getDuration());
        });
      });
    }

    /**
     * If advancement_ is a TimeBasedConfig, this updates the 'auto-advance-after'
     * attribute and updates the time delay used by the page's AdvancementConfig.
     * If the duration is < 2 seconds, the default is left unchanged.
     * @param {number} duration The updated duration for the page, in seconds.
     * @private
     */ }, { key: "maybeUpdateAutoAdvanceTime_", value:
    function maybeUpdateAutoAdvanceTime_(duration) {
      if (
      duration < VIDEO_MINIMUM_AUTO_ADVANCE_DURATION_S ||
      !this.advancement_ ||
      !this.advancement_.updateTimeDelay)
      {
        return;
      }
      this.advancement_.updateTimeDelay(duration + 's');
      // 'auto-advance-after' is only read during buildCallback(), but we update it
      // here to keep the DOM consistent with the AdvancementConfig.
      addAttributesToElement(
      this.element,
      dict({ 'auto-advance-after': duration + 's' }));

    }

    /**
     * Returns the first amp-video in the amp-story-page if there is one, otherwise
     * returns null.
     * @return {?Element}
     * @private
     */ }, { key: "getFirstAmpVideo_", value:
    function getFirstAmpVideo_() {
      var videos = this.getAllAmpVideos_();
      return videos.length === 0 ? null : videos[0];
    }

    /**
     * Delegates video autoplay so the video manager does not follow the
     * autoplay attribute that may have been set by a publisher, which could
     * play videos from an inactive page.
     */ }, { key: "delegateVideoAutoplay", value:
    function delegateVideoAutoplay() {
      iterateCursor(this.element.querySelectorAll('amp-video'), delegateAutoplay);
    }

    /** @private */ }, { key: "initializeMediaPool_", value:
    function initializeMediaPool_() {var _this4 = this;
      var storyEl = /** @type {!Element} */(
      closestAncestorElementBySelector(this.element, 'amp-story'));



      whenUpgradedToCustomElement(storyEl).
      then(function () {return storyEl.getImpl();}).
      then(
      function (storyImpl) {return _this4.mediaPoolResolveFn_(MediaPool.for(storyImpl));},
      function (reason) {return _this4.mediaPoolRejectFn_(reason);});

    }

    /**
     * Marks any AMP elements that represent media elements with preload="auto".
     * @private
     */ }, { key: "markMediaElementsWithPreload_", value:
    function markMediaElementsWithPreload_() {
      var mediaSet = this.element.querySelectorAll('amp-audio, amp-video');
      Array.prototype.forEach.call(mediaSet, function (mediaItem) {
        mediaItem.setAttribute('preload', 'auto');
      });
    }

    /** @override */ }, { key: "isLayoutSupported", value:
    function isLayoutSupported(layout) {
      return layout == Layout.CONTAINER;
    }

    /**
     * Updates the state of the page.
     * @param {!PageState} state
     */ }, { key: "setState", value:
    function setState(state) {var _this$animationManage2;
      switch (state) {
        case PageState.NOT_ACTIVE:
          this.element.removeAttribute('active');
          if (this.openAttachmentEl_) {
            this.openAttachmentEl_.removeAttribute('active');
          }
          this.pause_();
          this.state_ = state;
          break;
        case PageState.PLAYING:
          if (this.state_ === PageState.NOT_ACTIVE) {
            this.element.setAttribute('active', '');
            this.resume_();
            if (this.openAttachmentEl_) {
              this.openAttachmentEl_.setAttribute('active', '');
            }
          }

          if (this.state_ === PageState.PAUSED) {var _this$animationManage;
            this.advancement_.start();
            this.playAllMedia_();
            ((_this$animationManage = this.animationManager_) === null || _this$animationManage === void 0) ? (void 0) : _this$animationManage.resumeAll();
          }

          this.state_ = state;
          break;
        case PageState.PAUSED:
          this.advancement_.stop(true /** canResume */);
          this.pauseAllMedia_(false /** rewindToBeginning */);
          ((_this$animationManage2 = this.animationManager_) === null || _this$animationManage2 === void 0) ? (void 0) : _this$animationManage2.pauseAll();
          this.state_ = state;
          break;
        default:
          dev().warn(TAG, "PageState ".concat(state, " does not exist"));
          break;}

    }

    /**
     * @private
     */ }, { key: "pause_", value:
    function pause_() {var _this5 = this,_this$animationManage3;
      this.advancement_.stop(false /** canResume */);

      this.stopMeasuringAllVideoPerformance_();
      this.stopListeningToVideoEvents_();
      this.toggleErrorMessage_(false);
      this.togglePlayMessage_(false);
      this.playAudioElementFromTimestamp_ = null;

      if (
      this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS)
      {
        // The rewinding is delayed on desktop so that it happens at a lower
        // opacity instead of immediately jumping to the first frame. See #17985.
        this.pauseAllMedia_(false /** rewindToBeginning */);
        this.timer_.delay(function () {
          _this5.rewindAllMedia_();
        }, REWIND_TIMEOUT_MS);
      } else {
        this.pauseAllMedia_(true /** rewindToBeginning */);
      }

      if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
        this.muteAllMedia();
      }

      ((_this$animationManage3 = this.animationManager_) === null || _this$animationManage3 === void 0) ? (void 0) : _this$animationManage3.cancelAll();
    }

    /**
     * @private
     */ }, { key: "resume_", value:
    function resume_() {var _this6 = this;
      var registerAllPromise = this.registerAllMedia_();

      if (this.isActive()) {
        registerAllPromise.then(function () {
          _this6.signals().
          whenSignal(CommonSignals.LOAD_END).
          then(function () {
            if (_this6.state_ == PageState.PLAYING) {
              _this6.advancement_.start();
            }
          });
          _this6.preloadAllMedia_().then(function () {
            _this6.startMeasuringAllVideoPerformance_();
            _this6.startListeningToVideoEvents_();
            // iOS 14.2 and 14.3 requires play to be called before unmute
            _this6.playAllMedia_().then(function () {
              if (!_this6.storeService_.get(StateProperty.MUTED_STATE)) {
                _this6.unmuteAllMedia();
              }
            });
          });
        });
        this.maybeStartAnimations_();
        this.checkPageHasAudio_();
        this.checkPageHasElementWithPlayback_();
        this.findAndPrepareEmbeddedComponents_();
      }

      this.reportDevModeErrors_();
    }

    /** @override */ }, { key: "layoutCallback", value:
    function layoutCallback() {var _this7 = this;
      // Do not loop if the audio is used to auto-advance.
      var loop =
      this.element.getAttribute('id') !==
      this.element.getAttribute('auto-advance-after');
      upgradeBackgroundAudio(this.element, loop);
      this.backgroundAudioDeferred_.resolve();

      this.muteAllMedia();
      this.getViewport().onResize(
      debounce(this.win, function () {return _this7.onResize_();}, RESIZE_TIMEOUT_MS));


      this.renderOpenAttachmentUI_();

      return Promise.all([
      this.beforeVisible(),
      this.waitForMediaLayout_(),
      this.mediaPoolPromise_]);

    }

    /** @override */ }, { key: "onLayoutMeasure", value:
    function onLayoutMeasure() {var _this8 = this;
      var layoutBox = this.getLayoutSize();
      // Only measures from the first story page, that always gets built because
      // of the prerendering optimizations in place.
      if (
      !isPrerenderActivePage(this.element) || (
      this.layoutBox_ &&
      this.layoutBox_.width === layoutBox.width &&
      this.layoutBox_.height === layoutBox.height))
      {
        return;
      }

      this.layoutBox_ = layoutBox;

      return this.getVsync().runPromise(
      {
        measure: function measure(state) {
          var uiState = _this8.storeService_.get(StateProperty.UI_STATE);
          // The desktop panels UI uses CSS scale. Retrieving clientHeight/Width
          // ensures we are getting the raw size, ignoring the scale.
          var _ref =
          uiState === UIType.DESKTOP_PANELS ?
          {
            height: _this8.element. /*OK*/clientHeight,
            width: _this8.element. /*OK*/clientWidth } :

          layoutBox,height = _ref.height,width = _ref.width;
          state.height = height;
          state.width = width;
          state.vh = height / 100;
          state.vw = width / 100;
          state.fiftyVw = Math.round(width / 2);
          state.vmin = Math.min(state.vh, state.vw);
          state.vmax = Math.max(state.vh, state.vw);
        },
        mutate: function mutate(state) {
          var height = state.height,width = state.width;
          if (state.vh === 0 && state.vw === 0) {
            return;
          }
          _this8.storeService_.dispatch(Action.SET_PAGE_SIZE, { height: height, width: width });
          if (!_this8.cssVariablesStyleEl_) {
            var doc = _this8.win.document;
            _this8.cssVariablesStyleEl_ = doc.createElement('style');
            _this8.cssVariablesStyleEl_.setAttribute('type', 'text/css');
            doc.head.appendChild(_this8.cssVariablesStyleEl_);
          }
          _this8.cssVariablesStyleEl_.textContent =
          ":root {" + "--story-page-vh: ".concat(
          px(state.vh), ";") + "--story-page-vw: ".concat(
          px(state.vw), ";") + "--story-page-vmin: ".concat(
          px(state.vmin), ";") + "--story-page-vmax: ".concat(
          px(state.vmax), ";") + "--i-amphtml-story-page-50vw: ".concat(
          px(state.fiftyVw), ";") + "}";

        } },

      {});

    }

    /**
     * @private
     */ }, { key: "onResize_", value:
    function onResize_() {
      this.findAndPrepareEmbeddedComponents_(true /* forceResize */);
    }

    /**
     * Reacts to UI state updates.
     * @param {!UIType} uiState
     * @private
     */ }, { key: "onUIStateUpdate_", value:
    function onUIStateUpdate_(uiState) {
      // On vertical rendering, render all the animations with their final state.
      if (uiState === UIType.VERTICAL) {
        this.maybeFinishAnimations_();
      }
    }

    /** @return {!Promise} */ }, { key: "beforeVisible", value:
    function beforeVisible() {
      return this.maybeApplyFirstAnimationFrameOrFinish();
    }

    /**
     * @return {!Promise}
     * @private
     */ }, { key: "waitForMediaLayout_", value:
    function waitForMediaLayout_() {var _this9 = this;
      var mediaSet = toArray(this.getMediaBySelector_(Selectors.ALL_AMP_MEDIA));

      var mediaPromises = mediaSet.map(function (mediaEl) {
        return new Promise(function (resolve) {
          switch (mediaEl.tagName.toLowerCase()) {
            case 'amp-anim':
            case 'amp-img':
            case 'amp-story-360':
              // Don't block media layout on a fallback element that will likely
              // never build/load.
              if (mediaEl.hasAttribute('fallback')) {
                resolve();
                return;
              }

              whenUpgradedToCustomElement(mediaEl).
              then(function (el) {return el.signals().whenSignal(CommonSignals.LOAD_END);}).
              then(resolve, resolve);
              break;
            case 'amp-audio':
            case 'amp-video':
              if (mediaEl.readyState >= 2) {
                resolve();
                return;
              }

              mediaEl.addEventListener('canplay', resolve, true /* useCapture */);
              break;
            default:
              // Any other tags should not block loading.
              resolve();}


          // We suppress errors so that Promise.all will still wait for all
          // promises to complete, even if one has failed.  We do nothing with the
          // error, as the resource itself and/or code that loads it should handle
          // the error.
          mediaEl.addEventListener('error', resolve, true /* useCapture */);
        });
      });
      return Promise.all(mediaPromises).then(function () {return _this9.markPageAsLoaded_();});
    }

    /**
     * @return {!Promise}
     * @private
     */ }, { key: "waitForPlaybackMediaLayout_", value:
    function waitForPlaybackMediaLayout_() {
      var mediaSet = toArray(
      this.getMediaBySelector_(Selectors.ALL_PLAYBACK_AMP_MEDIA));


      var mediaPromises = mediaSet.map(function (mediaEl) {
        return new Promise(function (resolve) {
          switch (mediaEl.tagName.toLowerCase()) {
            case 'amp-audio':
            case 'amp-video':
              var signal =
              mediaEl.getAttribute('layout') === Layout.NODISPLAY ?
              CommonSignals.BUILT :
              CommonSignals.LOAD_END;

              whenUpgradedToCustomElement(mediaEl).
              then(function (el) {return el.signals().whenSignal(signal);}).
              then(resolve, resolve);
              break;
            case 'audio': // Already laid out as built from background-audio attr.
            default:
              // Any other tags should not block loading.
              resolve();}

        });
      });

      if (this.element.hasAttribute('background-audio')) {
        mediaPromises.push(this.backgroundAudioDeferred_.promise);
      }

      return Promise.all(mediaPromises);
    }

    /**
     * Finds embedded components in page and prepares them.
     * @param {boolean=} forceResize
     * @private
     */ }, { key: "findAndPrepareEmbeddedComponents_", value:
    function findAndPrepareEmbeddedComponents_() {var forceResize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      this.addClickShieldToEmbeddedComponents_();
      this.resizeInteractiveEmbeddedComponents_(forceResize);
      this.buildAffiliateLinks_();
    }

    /**
     * Adds a pseudo element on top of the embed to block clicks from going into
     * the iframe.
     * @private
     */ }, { key: "addClickShieldToEmbeddedComponents_", value:
    function addClickShieldToEmbeddedComponents_() {
      var componentEls = toArray(
      scopedQuerySelectorAll(this.element, EMBEDDED_COMPONENTS_SELECTORS));


      if (componentEls.length <= 0) {
        return;
      }

      this.mutateElement(function () {
        componentEls.forEach(function (el) {
          el.classList.add('i-amphtml-embedded-component');
        });
      });
    }

    /**
     * Resizes interactive embeds to prepare them for their expanded animation.
     * @param {boolean} forceResize
     * @private
     */ }, { key: "resizeInteractiveEmbeddedComponents_", value:
    function resizeInteractiveEmbeddedComponents_(forceResize) {var _this10 = this;
      toArray(
      scopedQuerySelectorAll(
      this.element,
      INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS)).

      forEach(function (el) {
        var debouncePrepareForAnimation = debounceEmbedResize(
        _this10.win,
        _this10.element,
        _this10.mutator_);


        if (forceResize) {
          debouncePrepareForAnimation(el, null /* unlisten */);
        } else if (!el.hasAttribute(EMBED_ID_ATTRIBUTE_NAME)) {
          // Element has not been prepared for its animation yet.
          var unlisten = listen(el, AmpEvents.SIZE_CHANGED, function () {
            debouncePrepareForAnimation(el, unlisten);
          });
          // Run in case target never changes size.
          debouncePrepareForAnimation(el, null /* unlisten */);
        }
      });
    }

    /**
     * Initializes affiliate links.
     */ }, { key: "buildAffiliateLinks_", value:
    function buildAffiliateLinks_() {var _this11 = this;
      toArray(
      scopedQuerySelectorAll(this.element, AFFILIATE_LINK_SELECTOR)).
      forEach(function (el) {
        var link = new AmpStoryAffiliateLink(_this11.win, el);
        link.build();
      });
    }

    /** @private */ }, { key: "markPageAsLoaded_", value:
    function markPageAsLoaded_() {var _this12 = this;
      dispatch(
      this.win,
      this.element,
      EventType.PAGE_LOADED,
      /* payload */undefined,
      { bubbles: true });

      this.mutateElement(function () {
        _this12.element.classList.add(PAGE_LOADED_CLASS_NAME);
      });
    }

    /**
     * Gets all media elements on this page.
     * @return {!Array<?Element>}
     * @private
     */ }, { key: "getAllMedia_", value:
    function getAllMedia_() {
      return this.getMediaBySelector_(Selectors.ALL_PLAYBACK_MEDIA);
    }

    /**
     * Gets all video elements on this page.
     * @return {!Array<?Element>}
     * @private
     */ }, { key: "getAllVideos_", value:
    function getAllVideos_() {
      return this.getMediaBySelector_(Selectors.ALL_VIDEO);
    }

    /**
     * Gets all amp video elements on this page.
     * @return {!Array<?Element>}
     * @private
     */ }, { key: "getAllAmpVideos_", value:
    function getAllAmpVideos_() {
      return this.getMediaBySelector_(Selectors.ALL_AMP_VIDEO);
    }

    /**
     * Gets media on page by given selector. Finds elements through friendly
     * iframe (if one exists).
     * @param {string} selector
     * @return {!Array<?Element>}
     * @private
     */ }, { key: "getMediaBySelector_", value:
    function getMediaBySelector_(selector) {
      var iframe = this.element.querySelector('iframe');
      var fie =
      iframe &&
      getFriendlyIframeEmbedOptional(
      /** @type {!HTMLIFrameElement} */(iframe));

      var mediaSet = [];

      iterateCursor(scopedQuerySelectorAll(this.element, selector), function (el) {return (
          mediaSet.push(el));});


      if (fie) {
        iterateCursor(
        scopedQuerySelectorAll(
        fie.win.document.body,
        Selectors.ALL_IFRAMED_MEDIA),

        function (el) {return mediaSet.push(el);});

      }

      return mediaSet;
    }

    /**
     * @return {!Promise<boolean>}
     * @private
     */ }, { key: "isAutoplaySupported_", value:
    function isAutoplaySupported_() {
      return isAutoplaySupported(this.win);
    }

    /**
     * Applies the specified callback to each media element on the page, after the
     * media element is loaded.
     * @param {function(!./media-pool.MediaPool, !Element)} callbackFn The
     *     callback to be applied to each media element.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     * @private
     */ }, { key: "whenAllMediaElements_", value:
    function whenAllMediaElements_(callbackFn) {
      var mediaSet = toArray(this.getAllMedia_());

      return this.mediaPoolPromise_.then(function (mediaPool) {
        var promises = mediaSet.map(function (mediaEl) {
          return callbackFn(mediaPool, /** @type {!Element} */(mediaEl));
        });

        return Promise.all(promises);
      });
    }

    /**
     * Pauses all media on this page.
     * @param {boolean=} rewindToBeginning Whether to rewind the currentTime
     *     of media items to the beginning.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     * @private
     */ }, { key: "pauseAllMedia_", value:
    function pauseAllMedia_() {var _this13 = this;var rewindToBeginning = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return this.whenAllMediaElements_(function (mediaPool, mediaEl) {
        return _this13.pauseMedia_(
        mediaPool,
        mediaEl,
        /** @type {boolean} */(rewindToBeginning));

      });
    }

    /**
     * Pauses the given media.
     * @param {!./media-pool.MediaPool} mediaPool
     * @param {!Element} mediaEl
     * @param {boolean} rewindToBeginning Whether to rewind the currentTime
     *     of media items to the beginning.
     * @return {!Promise} Promise that resolves after the media is paused.
     * @private
     */ }, { key: "pauseMedia_", value:
    function pauseMedia_(mediaPool, mediaEl, rewindToBeginning) {
      if (this.isBotUserAgent_) {
        mediaEl.pause();
        return _resolvedPromise();
      } else {
        return mediaPool.pause(
        /** @type {!./media-pool.DomElementDef} */(mediaEl),
        rewindToBeginning);

      }
    }

    /**
     * Plays all media on this page.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     * @private
     */ }, { key: "playAllMedia_", value:
    function playAllMedia_() {var _this14 = this;
      return this.whenAllMediaElements_(function (mediaPool, mediaEl) {
        return _this14.playMedia_(mediaPool, mediaEl);
      });
    }

    /**
     * Plays the given media.
     * @param {!./media-pool.MediaPool} mediaPool
     * @param {!Element} mediaEl
     * @return {!Promise} Promise that resolves after the media is played.
     * @private
     */ }, { key: "playMedia_", value:
    function playMedia_(mediaPool, mediaEl) {var _this15 = this;
      if (this.isBotUserAgent_) {
        mediaEl.play();
        return _resolvedPromise2();
      } else {
        return this.loadPromise(mediaEl).then(
        function () {
          return mediaPool.
          play( /** @type {!./media-pool.DomElementDef} */(mediaEl)).
          catch(function (unusedError) {
            // Auto playing the media failed, which could be caused by a data
            // saver, or a battery saving mode. Display a message so we can
            // get a user gesture to bless the media elements, and play them.
            if (mediaEl.tagName === 'VIDEO') {
              _this15.debounceToggleLoadingSpinner_(false);

              // If autoplay got rejected, display a "play" button. If
              // autoplay was supported, dispay an error message.
              _this15.isAutoplaySupported_().then(function (isAutoplaySupported) {
                if (isAutoplaySupported) {
                  _this15.toggleErrorMessage_(true);
                  return;
                }

                // Error was expected, don't send the performance metrics.
                _this15.stopMeasuringAllVideoPerformance_(
                false /** sendMetrics */);

                _this15.togglePlayMessage_(true);
              });
            }

            if (mediaEl.tagName === 'AUDIO') {
              _this15.playAudioElementFromTimestamp_ = Date.now();
            }
          });
        },
        function () {
          _this15.debounceToggleLoadingSpinner_(false);
          _this15.toggleErrorMessage_(true);
        });

      }
    }

    /**
     * Preloads all media on this page.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     * @private
     */ }, { key: "preloadAllMedia_", value:
    function preloadAllMedia_() {var _this16 = this;
      return this.whenAllMediaElements_(function (mediaPool, mediaEl) {return (
          _this16.preloadMedia_(mediaPool, mediaEl));});

    }

    /**
     * Preloads the given media.
     * @param {!./media-pool.MediaPool} mediaPool
     * @param {!Element} mediaEl
     * @return {!Promise<!Element|undefined>} Promise that resolves with the preloading element.
     * @private
     */ }, { key: "preloadMedia_", value:
    function preloadMedia_(mediaPool, mediaEl) {
      if (this.isBotUserAgent_) {
        // No-op.
        return _resolvedPromise3();
      } else {
        return mediaPool.preload(
        /** @type {!./media-pool.DomElementDef} */(mediaEl));

      }
    }

    /**
     * Mutes all media on this page.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     */ }, { key: "muteAllMedia", value:
    function muteAllMedia() {var _this17 = this;
      return this.whenAllMediaElements_(function (mediaPool, mediaEl) {
        _this17.muteMedia_(mediaPool, mediaEl);
      });
    }

    /**
     * Mutes the given media.
     * @param {!./media-pool.MediaPool} mediaPool
     * @param {!Element} mediaEl
     * @return {!Promise} Promise that resolves after the media is muted.
     * @private
     */ }, { key: "muteMedia_", value:
    function muteMedia_(mediaPool, mediaEl) {
      if (this.isBotUserAgent_) {
        mediaEl.muted = true;
        mediaEl.setAttribute('muted', '');
        return _resolvedPromise4();
      } else {
        return mediaPool.mute(
        /** @type {!./media-pool.DomElementDef} */(mediaEl));

      }
    }

    /**
     * Unmutes all media on this page.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     */ }, { key: "unmuteAllMedia", value:
    function unmuteAllMedia() {var _this18 = this;
      return this.whenAllMediaElements_(function (mediaPool, mediaEl) {
        _this18.unmuteMedia_(mediaPool, mediaEl);
      });
    }

    /**
     * Unmutes the given media.
     * @param {!./media-pool.MediaPool} mediaPool
     * @param {!Element} mediaEl
     * @return {!Promise} Promise that resolves after the media is unmuted.
     * @private
     */ }, { key: "unmuteMedia_", value:
    function unmuteMedia_(mediaPool, mediaEl) {
      if (this.isBotUserAgent_) {
        mediaEl.muted = false;
        mediaEl.removeAttribute('muted');
        if (mediaEl.tagName === 'AUDIO' && mediaEl.paused) {
          mediaEl.play();
        }
        return _resolvedPromise5();
      } else {
        mediaEl = /** @type {!./media-pool.DomElementDef} */(mediaEl);
        var promises = [mediaPool.unmute(mediaEl)];

        // Audio element might not be playing if the page navigation did not
        // happen after a user intent, and the media element was not "blessed".
        // On unmute, make sure this audio element is playing, at the expected
        // currentTime.
        if (
        mediaEl.tagName === 'AUDIO' &&
        mediaEl.paused &&
        this.playAudioElementFromTimestamp_)
        {
          var currentTime =
          (Date.now() - this.playAudioElementFromTimestamp_) / 1000;
          if (mediaEl.hasAttribute('loop') || currentTime < mediaEl.duration) {
            promises.push(
            mediaPool.setCurrentTime(mediaEl, currentTime % mediaEl.duration));

            promises.push(mediaPool.play(mediaEl));
          }

          this.playAudioElementFromTimestamp_ = null;
        }

        return Promise.all(promises);
      }
    }

    /**
     * Registers all media on this page.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     * @private
     */ }, { key: "registerAllMedia_", value:
    function registerAllMedia_() {var _this19 = this;
      if (!this.registerAllMediaPromise_) {
        this.registerAllMediaPromise_ = this.waitForPlaybackMediaLayout_().then(
        function () {return _this19.whenAllMediaElements_(function (p, e) {return _this19.registerMedia_(p, e);});});

      }

      return this.registerAllMediaPromise_;
    }

    /**
     * Registers the given media.
     * @param {!./media-pool.MediaPool} mediaPool
     * @param {!Element} mediaEl
     * @return {!Promise} Promise that resolves after the media is registered.
     * @private
     */ }, { key: "registerMedia_", value:
    function registerMedia_(mediaPool, mediaEl) {
      if (this.isBotUserAgent_) {
        // No-op.
        return _resolvedPromise6();
      } else {
        return mediaPool.register(
        /** @type {!./media-pool.DomElementDef} */(mediaEl));

      }
    }

    /**
     * Rewinds all media on this page.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     * @private
     */ }, { key: "rewindAllMedia_", value:
    function rewindAllMedia_() {var _this20 = this;
      return this.whenAllMediaElements_(function (mediaPool, mediaEl) {
        if (_this20.isBotUserAgent_) {
          mediaEl.currentTime = 0;
          return _resolvedPromise7();
        } else {
          return mediaPool.rewindToBeginning(
          /** @type {!./media-pool.DomElementDef} */(mediaEl));

        }
      });
    }

    /**
     * Starts playing animations, if the animation manager is available.
     * @private
     */ }, { key: "maybeStartAnimations_", value:
    function maybeStartAnimations_() {
      if (!this.animationManager_) {
        return;
      }
      this.animationManager_.animateIn();
    }

    /**
     * Finishes playing animations instantly, if the animation manager is
     * available.
     * @private
     */ }, { key: "maybeFinishAnimations_", value:
    function maybeFinishAnimations_() {var _this21 = this;
      if (!this.animationManager_) {
        return;
      }
      this.signals().
      whenSignal(CommonSignals.LOAD_END).
      then(function () {return _this21.animationManager_.applyLastFrame();});
    }

    /**
     * @return {!Promise}
     */ }, { key: "maybeApplyFirstAnimationFrameOrFinish", value:
    function maybeApplyFirstAnimationFrameOrFinish() {var _this$animationManage4;
      return Promise.resolve(((_this$animationManage4 = this.animationManager_) === null || _this$animationManage4 === void 0) ? (void 0) : _this$animationManage4.applyFirstFrameOrFinish());
    }

    /**
     * @return {number} The distance from the current page to the active page.
     */ }, { key: "getDistance", value:
    function getDistance() {
      return parseInt(this.element.getAttribute('distance'), 10);
    }

    /**
     * @param {number} distance The distance from the current page to the active
     *     page.
     */ }, { key: "setDistance", value:
    function setDistance(distance) {var _this22 = this;
      // TODO(ccordry) refactor this when pages are managed
      if (this.isAd()) {
        distance = Math.min(distance, 2);
      }
      if (distance == this.getDistance()) {
        return;
      }

      this.element.setAttribute('distance', distance);
      this.element.setAttribute('aria-hidden', distance != 0);

      var registerAllPromise = this.registerAllMedia_();

      if (distance > 0 && distance <= 2) {
        this.findAndPrepareEmbeddedComponents_();
        registerAllPromise.then(function () {return _this22.preloadAllMedia_();});
      }
      this.toggleTabbableElements_(distance == 0);
    }

    /**
     * @return {boolean} Whether this page is currently active.
     */ }, { key: "isActive", value:
    function isActive() {
      return this.element.hasAttribute('active');
    }

    /**
     * Emits an event indicating that the progress of the current page has changed
     * to the specified value.
     * @param {number} progress The progress from 0.0 to 1.0.
     */ }, { key: "emitProgress_", value:
    function emitProgress_(progress) {
      // Don't emit progress for ads, since the progress bar is hidden.
      // Don't emit progress for inactive pages, because race conditions.
      if (this.isAd() || this.state_ === PageState.NOT_ACTIVE) {
        return;
      }

      var payload = dict({
        'pageId': this.element.id,
        'progress': progress });

      var eventInit = { bubbles: true };
      dispatch(
      this.win,
      this.element,
      EventType.PAGE_PROGRESS,
      payload,
      eventInit);

    }

    /**
     * Returns all of the pages that are one hop from this page.
     * @return {!Array<string>}
     */ }, { key: "getAdjacentPageIds", value:
    function getAdjacentPageIds() {
      var adjacentPageIds = isExperimentOn(this.win, 'amp-story-branching') ?
      this.actions_() :
      [];

      var autoAdvanceNext = this.getNextPageId(
      true /* opt_isAutomaticAdvance */);

      var manualAdvanceNext = this.getNextPageId(
      false /* opt_isAutomaticAdvance */);

      var previous = this.getPreviousPageId();

      if (autoAdvanceNext) {
        adjacentPageIds.push(autoAdvanceNext);
      }

      if (manualAdvanceNext && manualAdvanceNext != autoAdvanceNext) {
        adjacentPageIds.push(manualAdvanceNext);
      }

      if (previous) {
        adjacentPageIds.push(previous);
      }

      return adjacentPageIds;
    }

    /**
     * Gets the ID of the previous page in the story (before the current page).
     * @return {?string} Returns the ID of the next page in the story, or null if
     *     there isn't one.
     */ }, { key: "getPreviousPageId", value:
    function getPreviousPageId() {
      if (this.element.hasAttribute('i-amphtml-return-to')) {
        return this.element.getAttribute('i-amphtml-return-to');
      }

      var navigationPath = this.storeService_.get(
      StateProperty.NAVIGATION_PATH);


      var pagePathIndex = navigationPath.lastIndexOf(this.element.id);
      var previousPageId = navigationPath[pagePathIndex - 1];

      if (previousPageId) {
        return previousPageId;
      }

      // If the page was loaded with a `#page=foo` hash, it could have no
      // navigation path but still a previous page in the DOM.
      var previousElement = this.element.previousElementSibling;
      if (previousElement && previousElement.tagName.toLowerCase() === TAG) {
        return previousElement.id;
      }

      return null;
    }

    /**
     * Gets the ID of the next page in the story (after the current page).
     * @param {boolean=} isAutomaticAdvance Whether this navigation was caused
     *     by an automatic advancement after a timeout.
     * @return {?string} Returns the ID of the next page in the story, or null if
     *     there isn't one.
     */ }, { key: "getNextPageId", value:
    function getNextPageId() {var isAutomaticAdvance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      if (isAutomaticAdvance && this.element.hasAttribute('auto-advance-to')) {
        return this.element.getAttribute('auto-advance-to');
      }

      var advanceAttr = isExperimentOn(this.win, 'amp-story-branching') ?
      'advance-to' :
      'i-amphtml-advance-to';

      if (this.element.hasAttribute(advanceAttr)) {
        return this.element.getAttribute(advanceAttr);
      }
      var nextElement = this.element.nextElementSibling;
      if (nextElement && nextElement.tagName.toLowerCase() === TAG) {
        return nextElement.id;
      }

      return null;
    }

    /**
     * Finds any elements in the page that has a goToPage action.
     * @return {!Array<string>} The IDs of the potential next pages in the story
     * or null if there aren't any.
     * @private
     */ }, { key: "actions_", value:
    function actions_() {
      var actionElements = Array.prototype.slice.call(
      this.element.querySelectorAll('[on*=goToPage]'));


      var actionAttrs = actionElements.map(function (action) {return (
          action.getAttribute('on'));});


      return actionAttrs.reduce(function (res, actions) {
        // Handling for multiple actions on one event or multiple events.
        var actionList = /** @type {!Array} */(actions.split(/[;,]+/));
        actionList.forEach(function (action) {
          if (action.indexOf('goToPage') >= 0) {
            // The pageId is in between the equals sign & closing parenthesis.
            res.push(action.slice(action.search('=(.*)') + 1, -1));
          }
        });
        return res;
      }, []);
    }

    /**
     * Navigates to the previous page in the story.
     */ }, { key: "previous", value:
    function previous() {
      var pageId = this.getPreviousPageId();

      if (pageId === null) {
        dispatch(
        this.win,
        this.element,
        EventType.NO_PREVIOUS_PAGE,
        /* payload */undefined,
        { bubbles: true });

        return;
      }

      this.storeService_.dispatch(Action.TOGGLE_PAUSED, false);
      this.switchTo_(pageId, NavigationDirection.PREVIOUS);
    }

    /**
     * Navigates to the next page in the story.
     * @param {boolean=} isAutomaticAdvance Whether this navigation was caused
     *     by an automatic advancement after a timeout.
     */ }, { key: "next", value:
    function next() {var isAutomaticAdvance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var pageId = this.getNextPageId(isAutomaticAdvance);

      if (!pageId) {
        dispatch(
        this.win,
        this.element,
        EventType.NO_NEXT_PAGE,
        /* payload */undefined,
        { bubbles: true });

        return;
      }

      this.storeService_.dispatch(Action.TOGGLE_PAUSED, false);
      this.switchTo_(pageId, NavigationDirection.NEXT);
    }

    /**
     * @param {string} targetPageId
     * @param {!NavigationDirection} direction
     * @private
     */ }, { key: "switchTo_", value:
    function switchTo_(targetPageId, direction) {
      var payload = dict({
        'targetPageId': targetPageId,
        'direction': direction });

      var eventInit = { bubbles: true };
      dispatch(this.win, this.element, EventType.SWITCH_PAGE, payload, eventInit);
    }

    /**
     * Checks if the page has any audio.
     * @private
     */ }, { key: "checkPageHasAudio_", value:
    function checkPageHasAudio_() {
      var pageHasAudio =
      this.element.hasAttribute('background-audio') ||
      this.element.querySelector('amp-audio') ||
      this.hasVideoWithAudio_();

      this.storeService_.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, pageHasAudio);
    }

    /**
     * Checks if the page has any videos with audio.
     * @return {boolean}
     * @private
     */ }, { key: "hasVideoWithAudio_", value:
    function hasVideoWithAudio_() {
      var ampVideoEls = this.element.querySelectorAll('amp-video');
      return Array.prototype.some.call(
      ampVideoEls,
      function (video) {return !video.hasAttribute('noaudio');});

    }

    /**
     * Checks if the page has elements with playback.
     * @private
     */ }, { key: "checkPageHasElementWithPlayback_", value:
    function checkPageHasElementWithPlayback_() {
      var pageHasElementWithPlayback =
      this.isAutoAdvance() ||
      this.element.hasAttribute('background-audio') ||
      this.getAllMedia_().length > 0;

      this.storeService_.dispatch(
      Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK,
      pageHasElementWithPlayback);

    }

    /**
     * @private
     */ }, { key: "reportDevModeErrors_", value:
    function reportDevModeErrors_() {var _this23 = this;
      if (!false) {
        return;
      }

      getLogEntries(this.element).then(function (logEntries) {
        dispatch(
        _this23.win,
        _this23.element,
        EventType.DEV_LOG_ENTRIES_AVAILABLE,
        // ? is OK because all consumers are internal.
        /** @type {?} */(logEntries),
        { bubbles: true });

      });
    }

    /**
     * Starts measuring video performance metrics, if performance tracking is on.
     * Has to be called directly before playing the video.
     * @private
     */ }, { key: "startMeasuringAllVideoPerformance_", value:
    function startMeasuringAllVideoPerformance_() {
      if (!this.mediaPerformanceMetricsService_.isPerformanceTrackingOn()) {
        return;
      }

      var videoEls = /** @type {!Array<!HTMLMediaElement>} */(
      this.getAllVideos_());

      for (var i = 0; i < videoEls.length; i++) {
        this.startMeasuringVideoPerformance_(videoEls[i]);
      }
    }

    /**
     * @param {!HTMLMediaElement} videoEl
     * @private
     */ }, { key: "startMeasuringVideoPerformance_", value:
    function startMeasuringVideoPerformance_(videoEl) {
      if (!this.mediaPerformanceMetricsService_.isPerformanceTrackingOn()) {
        return;
      }

      this.performanceTrackedVideos_.push(videoEl);
      this.mediaPerformanceMetricsService_.startMeasuring(videoEl);
    }

    /**
     * Stops measuring video performance metrics, if performance tracking is on.
     * Computes and sends the metrics.
     * @param {boolean=} sendMetrics
     * @private
     */ }, { key: "stopMeasuringAllVideoPerformance_", value:
    function stopMeasuringAllVideoPerformance_() {var sendMetrics = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      if (!this.mediaPerformanceMetricsService_.isPerformanceTrackingOn()) {
        return;
      }

      for (var i = 0; i < this.performanceTrackedVideos_.length; i++) {
        this.mediaPerformanceMetricsService_.stopMeasuring(
        this.performanceTrackedVideos_[i],
        sendMetrics);

      }
    }

    /**
     * Displays a loading spinner whenever the video is buffering.
     * Has to be called after the mediaPool preload method, that swaps the video
     * elements with new amp elements.
     * @private
     */ }, { key: "startListeningToVideoEvents_", value:
    function startListeningToVideoEvents_() {var _this24 = this;
      var videoEls = this.getAllVideos_();

      if (videoEls.length) {
        var alreadyPlaying = videoEls.some(function (video) {return video.currentTime != 0;});
        if (!alreadyPlaying) {
          this.debounceToggleLoadingSpinner_(true);
        }
      }

      Array.prototype.forEach.call(videoEls, function (videoEl) {
        _this24.unlisteners_.push(
        listen(videoEl, 'playing', function () {return (
            _this24.debounceToggleLoadingSpinner_(false));}));


        _this24.unlisteners_.push(
        listen(videoEl, 'waiting', function () {return (
            _this24.debounceToggleLoadingSpinner_(true));}));


      });
    }

    /**
     * @private
     */ }, { key: "stopListeningToVideoEvents_", value:
    function stopListeningToVideoEvents_() {
      this.debounceToggleLoadingSpinner_(false);
      this.unlisteners_.forEach(function (unlisten) {return unlisten();});
      this.unlisteners_ = [];
    }

    /**
     * @private
     */ }, { key: "buildAndAppendLoadingSpinner_", value:
    function buildAndAppendLoadingSpinner_() {
      this.loadingSpinner_ = new LoadingSpinner(this.win.document);
      this.element.appendChild(this.loadingSpinner_.build());
    }

    /**
     * Has to be called through the `debounceToggleLoadingSpinner_` method, to
     * avoid the spinner flashing on the screen when the video loops, or during
     * navigation transitions.
     * Builds the loading spinner and attaches it to the DOM on first call.
     * @param {boolean} isActive
     * @private
     */ }, { key: "toggleLoadingSpinner_", value:
    function toggleLoadingSpinner_(isActive) {var _this25 = this;
      this.mutateElement(function () {
        if (!_this25.loadingSpinner_) {
          _this25.buildAndAppendLoadingSpinner_();
        }

        _this25.loadingSpinner_.toggle(isActive);
      });
    }

    /**
     * Builds and appends a message and icon to play the story on tap.
     * This message is built when the playback failed (data saver, low battery
     * modes, ...).
     * @private
     */ }, { key: "buildAndAppendPlayMessage_", value:
    function buildAndAppendPlayMessage_() {var _this26 = this;
      this.playMessageEl_ = buildPlayMessageElement(this.element);
      var labelEl = this.playMessageEl_.querySelector(
      '.i-amphtml-story-page-play-label');

      labelEl.textContent = getLocalizationService(
      this.element).
      getLocalizedString(LocalizedStringId.AMP_STORY_PAGE_PLAY_VIDEO);

      this.playMessageEl_.addEventListener('click', function () {
        _this26.togglePlayMessage_(false);
        _this26.startMeasuringAllVideoPerformance_();
        _this26.mediaPoolPromise_.
        then(function (mediaPool) {return mediaPool.blessAll();}).
        then(function () {return _this26.playAllMedia_();});
      });

      this.mutateElement(function () {return _this26.element.appendChild(_this26.playMessageEl_);});
    }

    /**
     * Toggles the visibility of the "Play video" fallback message.
     * @param {boolean} isActive
     * @private
     */ }, { key: "togglePlayMessage_", value:
    function togglePlayMessage_(isActive) {var _this27 = this;
      if (!isActive) {
        this.playMessageEl_ &&
        this.mutateElement(function () {return (
            toggle( /** @type {!Element} */(_this27.playMessageEl_), false));});

        return;
      }

      if (!this.playMessageEl_) {
        this.buildAndAppendPlayMessage_();
      }

      this.mutateElement(function () {return (
          toggle( /** @type {!Element} */(_this27.playMessageEl_), true));});

    }

    /**
     * Builds and appends a message and icon to indicate a video error state.
     * @private
     */ }, { key: "buildAndAppendErrorMessage_", value:
    function buildAndAppendErrorMessage_() {var _this28 = this;
      this.errorMessageEl_ = buildErrorMessageElement(this.element);
      var labelEl = this.errorMessageEl_.querySelector(
      '.i-amphtml-story-page-error-label');

      labelEl.textContent = getLocalizationService(
      this.element).
      getLocalizedString(LocalizedStringId.AMP_STORY_PAGE_ERROR_VIDEO);

      this.mutateElement(function () {return _this28.element.appendChild(_this28.errorMessageEl_);});
    }

    /**
     * Toggles the visibility of the "Play video" fallback message.
     * @param {boolean} isActive
     * @private
     */ }, { key: "toggleErrorMessage_", value:
    function toggleErrorMessage_(isActive) {var _this29 = this;
      if (!isActive) {
        this.errorMessageEl_ &&
        this.mutateElement(function () {return (
            toggle( /** @type {!Element} */(_this29.errorMessageEl_), false));});

        return;
      }

      if (!this.errorMessageEl_) {
        this.buildAndAppendErrorMessage_();
      }

      this.mutateElement(function () {return (
          toggle( /** @type {!Element} */(_this29.errorMessageEl_), true));});

    }

    /**
     * Renders the open attachment UI affordance.
     * @private
     */ }, { key: "renderOpenAttachmentUI_", value:
    function renderOpenAttachmentUI_() {var _this30 = this;
      // AttachmentEl can be either amp-story-page-attachment or amp-story-page-outlink
      var attachmentEl = this.element.querySelector(
      'amp-story-page-attachment, amp-story-page-outlink');

      if (!attachmentEl) {
        return;
      }

      // To prevent 'title' attribute from being used by browser, copy value to 'data-title' and remove.
      if (attachmentEl.hasAttribute('title')) {
        attachmentEl.setAttribute(
        'data-title',
        attachmentEl.getAttribute('title'));

        attachmentEl.removeAttribute('title');
      }

      if (!this.openAttachmentEl_) {
        this.openAttachmentEl_ = renderPageAttachmentUI(
        this.element,
        attachmentEl);


        // This ensures `active` is set on first render.
        // Otherwise setState may be called before this.openAttachmentEl_ exists.
        if (this.element.hasAttribute('active')) {
          this.openAttachmentEl_.setAttribute('active', '');
        }

        var container = this.win.document.createElement('div');
        container.classList.add('i-amphtml-story-page-open-attachment-host');
        container.setAttribute('role', 'button');

        container.addEventListener('click', function (e) {
          if (isPageAttachmentUiV2ExperimentOn(_this30.win)) {
            // Prevent default so link can be opened programmatically after URL preview is shown.
            e.preventDefault();
          }
          _this30.openAttachment();
        });

        this.mutateElement(function () {
          _this30.element.appendChild(container);
          createShadowRootWithStyle(
          container,
          _this30.openAttachmentEl_,
          pageAttachmentCSS);

        });
      }
    }

    /**
     * Opens the attachment, if any.
     * @param {boolean=} shouldAnimate
     */ }, { key: "openAttachment", value:
    function openAttachment() {var shouldAnimate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var attachmentEl = this.element.querySelector(
      'amp-story-page-attachment, amp-story-page-outlink');


      if (!attachmentEl) {
        return;
      }

      attachmentEl.getImpl().then(function (attachment) {return attachment.open(shouldAnimate);});
    }

    /**
     * check to see if this page is a wrapper for an ad
     * @return {boolean}
     */ }, { key: "isAd", value:
    function isAd() {
      return this.element.hasAttribute(ADVERTISEMENT_ATTR_NAME);
    }

    /**
     * Sets text styles for descendants of the
     * <amp-story-page> element.
     * @private
     */ }, { key: "setDescendantCssTextStyles_", value:
    function setDescendantCssTextStyles_() {
      setTextBackgroundColor(this.element);
    }

    /**
     * Sets the description of the page, from its title and its videos
     * alt/title attributes.
     * @private
     */ }, { key: "setPageDescription_", value:
    function setPageDescription_() {
      if (this.isBotUserAgent_) {
        renderPageDescription(this, this.getAllAmpVideos_());
      }

      if (!this.isBotUserAgent_ && this.element.hasAttribute('title')) {
        // Strip the title attribute from the page on non-bot user agents, to
        // prevent the browser tooltip.
        if (!this.element.getAttribute('aria-label')) {
          this.element.setAttribute(
          'aria-label',
          this.element.getAttribute('title'));

        }
        this.element.removeAttribute('title');
      }
    }

    /**
     * Adds an empty alt tag to amp-img elements if not present.
     * Prevents screen readers from announcing the img src value.
     * @private
     */ }, { key: "initializeImgAltTags_", value:
    function initializeImgAltTags_() {
      toArray(this.element.querySelectorAll('amp-img')).forEach(function (ampImgNode) {
        if (!ampImgNode.getAttribute('alt')) {
          ampImgNode.setAttribute('alt', '');
          // If the child img element is in the dom, propogate the attribute to it.
          var childImgNode = ampImgNode.querySelector('img');
          childImgNode &&
          ampImgNode.
          getImpl().
          then(function (impl) {return (
              propagateAttributes('alt', impl.element, childImgNode));});

        }
      });
    }

    /**
     * Returns whether the page will automatically advance
     * @return {boolean}
     */ }, { key: "isAutoAdvance", value:
    function isAutoAdvance() {
      return this.advancement_.isAutoAdvance();
    }

    /**
     * Set the i-amphtml-orig-tabindex to the default tabindex of tabbable elements
     */ }, { key: "initializeTabbableElements_", value:
    function initializeTabbableElements_() {
      toArray(
      scopedQuerySelectorAll(this.element, Selectors.ALL_TABBABLE)).
      forEach(function (el) {
        el.setAttribute(
        'i-amphtml-orig-tabindex',
        el.getAttribute('tabindex') || 0);

      });
    }

    /**
     * Toggles the tabbable elements (buttons, links, etc) to only reach them when page is active.
     * @param {boolean} toggle
     */ }, { key: "toggleTabbableElements_", value:
    function toggleTabbableElements_(toggle) {
      toArray(
      scopedQuerySelectorAll(this.element, Selectors.ALL_TABBABLE)).
      forEach(function (el) {
        el.setAttribute(
        'tabindex',
        toggle ? el.getAttribute('i-amphtml-orig-tabindex') : -1);

      });
    } }], [{ key: "prerenderAllowed", value: /** @override @nocollapse */function prerenderAllowed(element) {return isPrerenderActivePage(element);} }]);return AmpStoryPage;}(AMP.BaseElement);
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-page.js