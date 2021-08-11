import { resolvedPromise as _resolvedPromise7 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise6 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

var _templateObject, _templateObject2;

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

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

/**
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
import { AFFILIATE_LINK_SELECTOR, AmpStoryAffiliateLink } from "./amp-story-affiliate-link";
import { Action, StateProperty, UIType, getStoreService } from "./amp-story-store-service";
import { AdvancementConfig } from "./page-advancement";
import { AmpEvents } from "../../../src/core/constants/amp-events";
import { AmpStoryEmbeddedComponent, EMBED_ID_ATTRIBUTE_NAME, EXPANDABLE_COMPONENTS, expandableElementsSelectors } from "./amp-story-embedded-component";
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
import { closestAncestorElementBySelector, scopedQuerySelectorAll } from "../../../src/core/dom/query";
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
  ALL_AMP_MEDIA: 'amp-story-grid-layer amp-audio, ' + 'amp-story-grid-layer amp-video, amp-story-grid-layer amp-img, ' + 'amp-story-grid-layer amp-anim',
  ALL_AMP_VIDEO: 'amp-story-grid-layer amp-video',
  ALL_IFRAMED_MEDIA: 'audio, video',
  ALL_PLAYBACK_AMP_MEDIA: 'amp-story-grid-layer amp-audio, amp-story-grid-layer amp-video',
  // TODO(gmajoulet): Refactor the way these selectors are used. They will be
  // passed to scopedQuerySelectorAll which expects only one selector and not
  // multiple separated by commas. `> audio` has to be kept first of the list to
  // work with this current implementation.
  ALL_PLAYBACK_MEDIA: '> audio, amp-story-grid-layer audio, amp-story-grid-layer video',
  ALL_VIDEO: 'amp-story-grid-layer video',
  ALL_TABBABLE: 'a, amp-twitter > iframe'
};

/** @private @const {string} */
var EMBEDDED_COMPONENTS_SELECTORS = Object.keys(EXPANDABLE_COMPONENTS).join(', ');

/** @private @const {string} */
var INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS = Object.values(expandableElementsSelectors()).join(',');

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
var buildPlayMessageElement = function buildPlayMessageElement(element) {
  return htmlFor(element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n      <button role=\"button\" class=\"i-amphtml-story-page-play-button i-amphtml-story-system-reset\">\n        <span class=\"i-amphtml-story-page-play-label\"></span>\n        <span class='i-amphtml-story-page-play-icon'></span>\n      </button>"])));
};

/**
 * @param {!Element} element
 * @return {!Element}
 */
var buildErrorMessageElement = function buildErrorMessageElement(element) {
  return htmlFor(element)(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-story-page-error i-amphtml-story-system-reset\">\n        <span class=\"i-amphtml-story-page-error-label\"></span>\n        <span class='i-amphtml-story-page-error-icon'></span>\n      </div>"])));
};

/**
 * amp-story-page states.
 * @enum {number}
 */
export var PageState = {
  NOT_ACTIVE: 0,
  // Page is not displayed. Could still be visible on desktop.
  PLAYING: 1,
  // Page is currently the main page, and playing.
  PAUSED: 2 // Page is currently the main page, but not playing.

};

/** @const @enum {string}*/
export var NavigationDirection = {
  NEXT: 'next',
  PREVIOUS: 'previous'
};

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
  return debounce(win, function (el, unlisten) {
    AmpStoryEmbeddedComponent.prepareForAnimation(page, dev().assertElement(el), mutator);

    if (unlisten) {
      unlisten();
    }
  }, RESIZE_TIMEOUT_MS);
}

/**
 * The <amp-story-page> custom element, which represents a single page of
 * an <amp-story>.
 */
export var AmpStoryPage = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpStoryPage, _AMP$BaseElement);

  var _super = _createSuper(AmpStoryPage);

  /** @param {!AmpElement} element */
  function AmpStoryPage(element) {
    var _this;

    _classCallCheck(this, AmpStoryPage);

    _this = _super.call(this, element);

    /** @private {?AnimationManager} */
    _this.animationManager_ = null;

    /** @private {?AdvancementConfig} */
    _this.advancement_ = null;

    /** @const @private {!function(boolean)} */
    _this.debounceToggleLoadingSpinner_ = debounce(_this.win, function (isActive) {
      return _this.toggleLoadingSpinner_(!!isActive);
    }, 100);

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
    _this.mediaPerformanceMetricsService_ = getMediaPerformanceMetricsService(_this.win);

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
    _this.playAudioElementFromTimestamp_ = null;
    return _this;
  }

  /**
   * @private
   */
  _createClass(AmpStoryPage, [{
    key: "maybeCreateAnimationManager_",
    value: function maybeCreateAnimationManager_() {
      if (this.animationManager_) {
        return;
      }

      if (!hasAnimations(this.element)) {
        return;
      }

      this.animationManager_ = AnimationManager.create(this.element, this.getAmpDoc(), this.getAmpDoc().getUrl());
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      var _this2 = this;

      this.delegateVideoAutoplay();
      this.markMediaElementsWithPreload_();
      this.initializeMediaPool_();
      this.maybeCreateAnimationManager_();
      this.maybeSetPreviewDuration_();
      this.maybeSetStoryNextUp_();
      this.advancement_ = AdvancementConfig.forElement(this.win, this.element);
      this.advancement_.addPreviousListener(function () {
        return _this2.previous();
      });
      this.advancement_.addAdvanceListener(function () {
        return _this2.next(
        /* opt_isAutomaticAdvance */
        true);
      });
      this.advancement_.addProgressListener(function (progress) {
        return _this2.emitProgress_(progress);
      });
      this.setDescendantCssTextStyles_();
      this.storeService_.subscribe(StateProperty.UI_STATE, function (uiState) {
        return _this2.onUIStateUpdate_(uiState);
      }, true
      /* callToInitialize */
      );
      this.setPageDescription_();
      this.element.setAttribute('role', 'region');
      this.initializeImgAltTags_();
      this.initializeTabbableElements_();
    }
    /** @private */

  }, {
    key: "maybeSetPreviewDuration_",
    value: function maybeSetPreviewDuration_() {
      if (this.storeService_.get(StateProperty.PREVIEW_STATE)) {
        var videos = this.getAllVideos_();
        var autoAdvanceAttr = videos.length > 0 ? VIDEO_PREVIEW_AUTO_ADVANCE_DURATION : DEFAULT_PREVIEW_AUTO_ADVANCE_DURATION;
        addAttributesToElement(this.element, dict({
          'auto-advance-after': autoAdvanceAttr
        }));
      }
    }
    /**
     * Reads the storyNextUp param if provided and sets the auto-advance-after
     * attribute to the given value if there isn't one set by the publisher. The
     * auto-advance-after attribute may later be set to the duration of the first
     * video if there is one, once the metadata is available.
     * @private
     */

  }, {
    key: "maybeSetStoryNextUp_",
    value: function maybeSetStoryNextUp_() {
      var autoAdvanceAttr = this.element.getAttribute('auto-advance-after');
      // This is a private param used for testing, it may be changed
      // or removed without notice.
      var storyNextUpParam = Services.viewerForDoc(this.element).getParam('storyNextUp');

      if (autoAdvanceAttr !== null || storyNextUpParam === null || // This is a special value that indicates we are in the viewer indicated control group.
      storyNextUpParam === StoryAdSegmentTimes.SENTINEL) {
        return;
      }

      addAttributesToElement(this.element, dict({
        'auto-advance-after': storyNextUpParam
      }));
      this.listenAndUpdateAutoAdvanceDuration_();
    }
    /**
     * If there's a video on the page, this sets a listener to update
     * the TimeBasedAdvancement when the first video's duration becomes available.
     * @private
     */

  }, {
    key: "listenAndUpdateAutoAdvanceDuration_",
    value: function listenAndUpdateAutoAdvanceDuration_() {
      var _this3 = this;

      var video = this.getFirstAmpVideo_();

      if (video === null) {
        return;
      }

      whenUpgradedToCustomElement(video).then(function () {
        return video.getImpl();
      }).then(function (videoImpl) {
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
     */

  }, {
    key: "maybeUpdateAutoAdvanceTime_",
    value: function maybeUpdateAutoAdvanceTime_(duration) {
      if (duration < VIDEO_MINIMUM_AUTO_ADVANCE_DURATION_S || !this.advancement_ || !this.advancement_.updateTimeDelay) {
        return;
      }

      this.advancement_.updateTimeDelay(duration + 's');
      // 'auto-advance-after' is only read during buildCallback(), but we update it
      // here to keep the DOM consistent with the AdvancementConfig.
      addAttributesToElement(this.element, dict({
        'auto-advance-after': duration + 's'
      }));
    }
    /**
     * Returns the first amp-video in the amp-story-page if there is one, otherwise
     * returns null.
     * @return {?Element}
     * @private
     */

  }, {
    key: "getFirstAmpVideo_",
    value: function getFirstAmpVideo_() {
      var videos = this.getAllAmpVideos_();
      return videos.length === 0 ? null : videos[0];
    }
    /**
     * Delegates video autoplay so the video manager does not follow the
     * autoplay attribute that may have been set by a publisher, which could
     * play videos from an inactive page.
     */

  }, {
    key: "delegateVideoAutoplay",
    value: function delegateVideoAutoplay() {
      iterateCursor(this.element.querySelectorAll('amp-video'), delegateAutoplay);
    }
    /** @private */

  }, {
    key: "initializeMediaPool_",
    value: function initializeMediaPool_() {
      var _this4 = this;

      var storyEl = dev().assertElement(closestAncestorElementBySelector(this.element, 'amp-story'), 'amp-story-page must be a descendant of amp-story.');
      whenUpgradedToCustomElement(storyEl).then(function () {
        return storyEl.getImpl();
      }).then(function (storyImpl) {
        return _this4.mediaPoolResolveFn_(MediaPool.for(storyImpl));
      }, function (reason) {
        return _this4.mediaPoolRejectFn_(reason);
      });
    }
    /**
     * Marks any AMP elements that represent media elements with preload="auto".
     * @private
     */

  }, {
    key: "markMediaElementsWithPreload_",
    value: function markMediaElementsWithPreload_() {
      var mediaSet = this.element.querySelectorAll('amp-audio, amp-video');
      Array.prototype.forEach.call(mediaSet, function (mediaItem) {
        mediaItem.setAttribute('preload', 'auto');
      });
    }
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return layout == Layout.CONTAINER;
    }
    /**
     * Updates the state of the page.
     * @param {!PageState} state
     */

  }, {
    key: "setState",
    value: function setState(state) {
      var _this$animationManage2;

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

          if (this.state_ === PageState.PAUSED) {
            var _this$animationManage;

            this.advancement_.start();
            this.playAllMedia_();
            (_this$animationManage = this.animationManager_) == null ? void 0 : _this$animationManage.resumeAll();
          }

          this.state_ = state;
          break;

        case PageState.PAUSED:
          this.advancement_.stop(true
          /** canResume */
          );
          this.pauseAllMedia_(false
          /** rewindToBeginning */
          );
          (_this$animationManage2 = this.animationManager_) == null ? void 0 : _this$animationManage2.pauseAll();
          this.state_ = state;
          break;

        default:
          dev().warn(TAG, "PageState " + state + " does not exist");
          break;
      }
    }
    /**
     * @private
     */

  }, {
    key: "pause_",
    value: function pause_() {
      var _this5 = this,
          _this$animationManage3;

      this.advancement_.stop(false
      /** canResume */
      );
      this.stopMeasuringAllVideoPerformance_();
      this.stopListeningToVideoEvents_();
      this.toggleErrorMessage_(false);
      this.togglePlayMessage_(false);
      this.playAudioElementFromTimestamp_ = null;

      if (this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS) {
        // The rewinding is delayed on desktop so that it happens at a lower
        // opacity instead of immediately jumping to the first frame. See #17985.
        this.pauseAllMedia_(false
        /** rewindToBeginning */
        );
        this.timer_.delay(function () {
          _this5.rewindAllMedia_();
        }, REWIND_TIMEOUT_MS);
      } else {
        this.pauseAllMedia_(true
        /** rewindToBeginning */
        );
      }

      if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
        this.muteAllMedia();
      }

      (_this$animationManage3 = this.animationManager_) == null ? void 0 : _this$animationManage3.cancelAll();
    }
    /**
     * @private
     */

  }, {
    key: "resume_",
    value: function resume_() {
      var _this6 = this;

      var registerAllPromise = this.registerAllMedia_();

      if (this.isActive()) {
        registerAllPromise.then(function () {
          _this6.signals().whenSignal(CommonSignals.LOAD_END).then(function () {
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
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      var _this7 = this;

      // Do not loop if the audio is used to auto-advance.
      var loop = this.element.getAttribute('id') !== this.element.getAttribute('auto-advance-after');
      upgradeBackgroundAudio(this.element, loop);
      this.backgroundAudioDeferred_.resolve();
      this.muteAllMedia();
      this.getViewport().onResize(debounce(this.win, function () {
        return _this7.onResize_();
      }, RESIZE_TIMEOUT_MS));
      this.renderOpenAttachmentUI_();
      return Promise.all([this.beforeVisible(), this.waitForMediaLayout_(), this.mediaPoolPromise_]);
    }
    /** @override */

  }, {
    key: "onLayoutMeasure",
    value: function onLayoutMeasure() {
      var _this8 = this;

      var layoutBox = this.getLayoutSize();

      // Only measures from the first story page, that always gets built because
      // of the prerendering optimizations in place.
      if (!isPrerenderActivePage(this.element) || this.layoutBox_ && this.layoutBox_.width === layoutBox.width && this.layoutBox_.height === layoutBox.height) {
        return;
      }

      this.layoutBox_ = layoutBox;
      return this.getVsync().runPromise({
        measure: function measure(state) {
          var uiState = _this8.storeService_.get(StateProperty.UI_STATE);

          // The desktop panels UI uses CSS scale. Retrieving clientHeight/Width
          // ensures we are getting the raw size, ignoring the scale.
          var _ref = uiState === UIType.DESKTOP_PANELS ? {
            height: _this8.element.
            /*OK*/
            clientHeight,
            width: _this8.element.
            /*OK*/
            clientWidth
          } : layoutBox,
              height = _ref.height,
              width = _ref.width;

          state.height = height;
          state.width = width;
          state.vh = height / 100;
          state.vw = width / 100;
          state.fiftyVw = Math.round(width / 2);
          state.vmin = Math.min(state.vh, state.vw);
          state.vmax = Math.max(state.vh, state.vw);
        },
        mutate: function mutate(state) {
          var height = state.height,
              width = state.width;

          if (state.vh === 0 && state.vw === 0) {
            return;
          }

          _this8.storeService_.dispatch(Action.SET_PAGE_SIZE, {
            height: height,
            width: width
          });

          if (!_this8.cssVariablesStyleEl_) {
            var doc = _this8.win.document;
            _this8.cssVariablesStyleEl_ = doc.createElement('style');

            _this8.cssVariablesStyleEl_.setAttribute('type', 'text/css');

            doc.head.appendChild(_this8.cssVariablesStyleEl_);
          }

          _this8.cssVariablesStyleEl_.textContent = ":root {" + ("--story-page-vh: " + px(state.vh) + ";") + ("--story-page-vw: " + px(state.vw) + ";") + ("--story-page-vmin: " + px(state.vmin) + ";") + ("--story-page-vmax: " + px(state.vmax) + ";") + ("--i-amphtml-story-page-50vw: " + px(state.fiftyVw) + ";") + "}";
        }
      }, {});
    }
    /**
     * @private
     */

  }, {
    key: "onResize_",
    value: function onResize_() {
      this.findAndPrepareEmbeddedComponents_(true
      /* forceResize */
      );
    }
    /**
     * Reacts to UI state updates.
     * @param {!UIType} uiState
     * @private
     */

  }, {
    key: "onUIStateUpdate_",
    value: function onUIStateUpdate_(uiState) {
      // On vertical rendering, render all the animations with their final state.
      if (uiState === UIType.VERTICAL) {
        this.maybeFinishAnimations_();
      }
    }
    /** @return {!Promise} */

  }, {
    key: "beforeVisible",
    value: function beforeVisible() {
      return this.maybeApplyFirstAnimationFrameOrFinish();
    }
    /**
     * @return {!Promise}
     * @private
     */

  }, {
    key: "waitForMediaLayout_",
    value: function waitForMediaLayout_() {
      var _this9 = this;

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

              whenUpgradedToCustomElement(mediaEl).then(function (el) {
                return el.signals().whenSignal(CommonSignals.LOAD_END);
              }).then(resolve, resolve);
              break;

            case 'amp-audio':
            case 'amp-video':
              if (mediaEl.readyState >= 2) {
                resolve();
                return;
              }

              mediaEl.addEventListener('canplay', resolve, true
              /* useCapture */
              );
              break;

            default:
              // Any other tags should not block loading.
              resolve();
          }

          // We suppress errors so that Promise.all will still wait for all
          // promises to complete, even if one has failed.  We do nothing with the
          // error, as the resource itself and/or code that loads it should handle
          // the error.
          mediaEl.addEventListener('error', resolve, true
          /* useCapture */
          );
        });
      });
      return Promise.all(mediaPromises).then(function () {
        return _this9.markPageAsLoaded_();
      });
    }
    /**
     * @return {!Promise}
     * @private
     */

  }, {
    key: "waitForPlaybackMediaLayout_",
    value: function waitForPlaybackMediaLayout_() {
      var mediaSet = toArray(this.getMediaBySelector_(Selectors.ALL_PLAYBACK_AMP_MEDIA));
      var mediaPromises = mediaSet.map(function (mediaEl) {
        return new Promise(function (resolve) {
          switch (mediaEl.tagName.toLowerCase()) {
            case 'amp-audio':
            case 'amp-video':
              var signal = mediaEl.getAttribute('layout') === Layout.NODISPLAY ? CommonSignals.BUILT : CommonSignals.LOAD_END;
              whenUpgradedToCustomElement(mediaEl).then(function (el) {
                return el.signals().whenSignal(signal);
              }).then(resolve, resolve);
              break;

            case 'audio': // Already laid out as built from background-audio attr.

            default:
              // Any other tags should not block loading.
              resolve();
          }
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
     */

  }, {
    key: "findAndPrepareEmbeddedComponents_",
    value: function findAndPrepareEmbeddedComponents_(forceResize) {
      if (forceResize === void 0) {
        forceResize = false;
      }

      this.addClickShieldToEmbeddedComponents_();
      this.resizeInteractiveEmbeddedComponents_(forceResize);
      this.buildAffiliateLinks_();
    }
    /**
     * Adds a pseudo element on top of the embed to block clicks from going into
     * the iframe.
     * @private
     */

  }, {
    key: "addClickShieldToEmbeddedComponents_",
    value: function addClickShieldToEmbeddedComponents_() {
      var componentEls = toArray(scopedQuerySelectorAll(this.element, EMBEDDED_COMPONENTS_SELECTORS));

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
     */

  }, {
    key: "resizeInteractiveEmbeddedComponents_",
    value: function resizeInteractiveEmbeddedComponents_(forceResize) {
      var _this10 = this;

      toArray(scopedQuerySelectorAll(this.element, INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS)).forEach(function (el) {
        var debouncePrepareForAnimation = debounceEmbedResize(_this10.win, _this10.element, _this10.mutator_);

        if (forceResize) {
          debouncePrepareForAnimation(el, null
          /* unlisten */
          );
        } else if (!el.hasAttribute(EMBED_ID_ATTRIBUTE_NAME)) {
          // Element has not been prepared for its animation yet.
          var unlisten = listen(el, AmpEvents.SIZE_CHANGED, function () {
            debouncePrepareForAnimation(el, unlisten);
          });
          // Run in case target never changes size.
          debouncePrepareForAnimation(el, null
          /* unlisten */
          );
        }
      });
    }
    /**
     * Initializes affiliate links.
     */

  }, {
    key: "buildAffiliateLinks_",
    value: function buildAffiliateLinks_() {
      var _this11 = this;

      toArray(scopedQuerySelectorAll(this.element, AFFILIATE_LINK_SELECTOR)).forEach(function (el) {
        var link = new AmpStoryAffiliateLink(_this11.win, el);
        link.build();
      });
    }
    /** @private */

  }, {
    key: "markPageAsLoaded_",
    value: function markPageAsLoaded_() {
      var _this12 = this;

      dispatch(this.win, this.element, EventType.PAGE_LOADED,
      /* payload */
      undefined, {
        bubbles: true
      });
      this.mutateElement(function () {
        _this12.element.classList.add(PAGE_LOADED_CLASS_NAME);
      });
    }
    /**
     * Gets all media elements on this page.
     * @return {!Array<?Element>}
     * @private
     */

  }, {
    key: "getAllMedia_",
    value: function getAllMedia_() {
      return this.getMediaBySelector_(Selectors.ALL_PLAYBACK_MEDIA);
    }
    /**
     * Gets all video elements on this page.
     * @return {!Array<?Element>}
     * @private
     */

  }, {
    key: "getAllVideos_",
    value: function getAllVideos_() {
      return this.getMediaBySelector_(Selectors.ALL_VIDEO);
    }
    /**
     * Gets all amp video elements on this page.
     * @return {!Array<?Element>}
     * @private
     */

  }, {
    key: "getAllAmpVideos_",
    value: function getAllAmpVideos_() {
      return this.getMediaBySelector_(Selectors.ALL_AMP_VIDEO);
    }
    /**
     * Gets media on page by given selector. Finds elements through friendly
     * iframe (if one exists).
     * @param {string} selector
     * @return {!Array<?Element>}
     * @private
     */

  }, {
    key: "getMediaBySelector_",
    value: function getMediaBySelector_(selector) {
      var iframe = this.element.querySelector('iframe');
      var fie = iframe && getFriendlyIframeEmbedOptional(
      /** @type {!HTMLIFrameElement} */
      iframe);
      var mediaSet = [];
      iterateCursor(scopedQuerySelectorAll(this.element, selector), function (el) {
        return mediaSet.push(el);
      });

      if (fie) {
        iterateCursor(scopedQuerySelectorAll(fie.win.document.body, Selectors.ALL_IFRAMED_MEDIA), function (el) {
          return mediaSet.push(el);
        });
      }

      return mediaSet;
    }
    /**
     * @return {!Promise<boolean>}
     * @private
     */

  }, {
    key: "isAutoplaySupported_",
    value: function isAutoplaySupported_() {
      return isAutoplaySupported(this.win);
    }
    /**
     * Applies the specified callback to each media element on the page, after the
     * media element is loaded.
     * @param {function(!./media-pool.MediaPool, !Element)} callbackFn The
     *     callback to be applied to each media element.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     * @private
     */

  }, {
    key: "whenAllMediaElements_",
    value: function whenAllMediaElements_(callbackFn) {
      var mediaSet = toArray(this.getAllMedia_());
      return this.mediaPoolPromise_.then(function (mediaPool) {
        var promises = mediaSet.map(function (mediaEl) {
          return callbackFn(mediaPool, dev().assertElement(mediaEl));
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
     */

  }, {
    key: "pauseAllMedia_",
    value: function pauseAllMedia_(rewindToBeginning) {
      var _this13 = this;

      if (rewindToBeginning === void 0) {
        rewindToBeginning = false;
      }

      return this.whenAllMediaElements_(function (mediaPool, mediaEl) {
        return _this13.pauseMedia_(mediaPool, mediaEl,
        /** @type {boolean} */
        rewindToBeginning);
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
     */

  }, {
    key: "pauseMedia_",
    value: function pauseMedia_(mediaPool, mediaEl, rewindToBeginning) {
      if (this.isBotUserAgent_) {
        mediaEl.pause();
        return _resolvedPromise();
      } else {
        return mediaPool.pause(
        /** @type {!./media-pool.DomElementDef} */
        mediaEl, rewindToBeginning);
      }
    }
    /**
     * Plays all media on this page.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     * @private
     */

  }, {
    key: "playAllMedia_",
    value: function playAllMedia_() {
      var _this14 = this;

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
     */

  }, {
    key: "playMedia_",
    value: function playMedia_(mediaPool, mediaEl) {
      var _this15 = this;

      if (this.isBotUserAgent_) {
        mediaEl.play();
        return _resolvedPromise2();
      } else {
        return this.loadPromise(mediaEl).then(function () {
          return mediaPool.play(
          /** @type {!./media-pool.DomElementDef} */
          mediaEl).catch(function (unusedError) {
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
                _this15.stopMeasuringAllVideoPerformance_(false
                /** sendMetrics */
                );

                _this15.togglePlayMessage_(true);
              });
            }

            if (mediaEl.tagName === 'AUDIO') {
              _this15.playAudioElementFromTimestamp_ = Date.now();
            }
          });
        }, function () {
          _this15.debounceToggleLoadingSpinner_(false);

          _this15.toggleErrorMessage_(true);
        });
      }
    }
    /**
     * Preloads all media on this page.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     * @private
     */

  }, {
    key: "preloadAllMedia_",
    value: function preloadAllMedia_() {
      var _this16 = this;

      return this.whenAllMediaElements_(function (mediaPool, mediaEl) {
        return _this16.preloadMedia_(mediaPool, mediaEl);
      });
    }
    /**
     * Preloads the given media.
     * @param {!./media-pool.MediaPool} mediaPool
     * @param {!Element} mediaEl
     * @return {!Promise<!Element|undefined>} Promise that resolves with the preloading element.
     * @private
     */

  }, {
    key: "preloadMedia_",
    value: function preloadMedia_(mediaPool, mediaEl) {
      if (this.isBotUserAgent_) {
        // No-op.
        return _resolvedPromise3();
      } else {
        return mediaPool.preload(
        /** @type {!./media-pool.DomElementDef} */
        mediaEl);
      }
    }
    /**
     * Mutes all media on this page.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     */

  }, {
    key: "muteAllMedia",
    value: function muteAllMedia() {
      var _this17 = this;

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
     */

  }, {
    key: "muteMedia_",
    value: function muteMedia_(mediaPool, mediaEl) {
      if (this.isBotUserAgent_) {
        mediaEl.muted = true;
        mediaEl.setAttribute('muted', '');
        return _resolvedPromise4();
      } else {
        return mediaPool.mute(
        /** @type {!./media-pool.DomElementDef} */
        mediaEl);
      }
    }
    /**
     * Unmutes all media on this page.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     */

  }, {
    key: "unmuteAllMedia",
    value: function unmuteAllMedia() {
      var _this18 = this;

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
     */

  }, {
    key: "unmuteMedia_",
    value: function unmuteMedia_(mediaPool, mediaEl) {
      if (this.isBotUserAgent_) {
        mediaEl.muted = false;
        mediaEl.removeAttribute('muted');

        if (mediaEl.tagName === 'AUDIO' && mediaEl.paused) {
          mediaEl.play();
        }

        return _resolvedPromise5();
      } else {
        mediaEl =
        /** @type {!./media-pool.DomElementDef} */
        mediaEl;
        var promises = [mediaPool.unmute(mediaEl)];

        // Audio element might not be playing if the page navigation did not
        // happen after a user intent, and the media element was not "blessed".
        // On unmute, make sure this audio element is playing, at the expected
        // currentTime.
        if (mediaEl.tagName === 'AUDIO' && mediaEl.paused && this.playAudioElementFromTimestamp_) {
          var currentTime = (Date.now() - this.playAudioElementFromTimestamp_) / 1000;

          if (mediaEl.hasAttribute('loop') || currentTime < mediaEl.duration) {
            promises.push(mediaPool.setCurrentTime(mediaEl, currentTime % mediaEl.duration));
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
     */

  }, {
    key: "registerAllMedia_",
    value: function registerAllMedia_() {
      var _this19 = this;

      if (!this.registerAllMediaPromise_) {
        this.registerAllMediaPromise_ = this.waitForPlaybackMediaLayout_().then(function () {
          return _this19.whenAllMediaElements_(function (p, e) {
            return _this19.registerMedia_(p, e);
          });
        });
      }

      return this.registerAllMediaPromise_;
    }
    /**
     * Registers the given media.
     * @param {!./media-pool.MediaPool} mediaPool
     * @param {!Element} mediaEl
     * @return {!Promise} Promise that resolves after the media is registered.
     * @private
     */

  }, {
    key: "registerMedia_",
    value: function registerMedia_(mediaPool, mediaEl) {
      if (this.isBotUserAgent_) {
        // No-op.
        return _resolvedPromise6();
      } else {
        return mediaPool.register(
        /** @type {!./media-pool.DomElementDef} */
        mediaEl);
      }
    }
    /**
     * Rewinds all media on this page.
     * @return {!Promise} Promise that resolves after the callbacks are called.
     * @private
     */

  }, {
    key: "rewindAllMedia_",
    value: function rewindAllMedia_() {
      var _this20 = this;

      return this.whenAllMediaElements_(function (mediaPool, mediaEl) {
        if (_this20.isBotUserAgent_) {
          mediaEl.currentTime = 0;
          return _resolvedPromise7();
        } else {
          return mediaPool.rewindToBeginning(
          /** @type {!./media-pool.DomElementDef} */
          mediaEl);
        }
      });
    }
    /**
     * Starts playing animations, if the animation manager is available.
     * @private
     */

  }, {
    key: "maybeStartAnimations_",
    value: function maybeStartAnimations_() {
      if (!this.animationManager_) {
        return;
      }

      this.animationManager_.animateIn();
    }
    /**
     * Finishes playing animations instantly, if the animation manager is
     * available.
     * @private
     */

  }, {
    key: "maybeFinishAnimations_",
    value: function maybeFinishAnimations_() {
      var _this21 = this;

      if (!this.animationManager_) {
        return;
      }

      this.signals().whenSignal(CommonSignals.LOAD_END).then(function () {
        return _this21.animationManager_.applyLastFrame();
      });
    }
    /**
     * @return {!Promise}
     */

  }, {
    key: "maybeApplyFirstAnimationFrameOrFinish",
    value: function maybeApplyFirstAnimationFrameOrFinish() {
      var _this$animationManage4;

      return Promise.resolve((_this$animationManage4 = this.animationManager_) == null ? void 0 : _this$animationManage4.applyFirstFrameOrFinish());
    }
    /**
     * @return {number} The distance from the current page to the active page.
     */

  }, {
    key: "getDistance",
    value: function getDistance() {
      return parseInt(this.element.getAttribute('distance'), 10);
    }
    /**
     * @param {number} distance The distance from the current page to the active
     *     page.
     */

  }, {
    key: "setDistance",
    value: function setDistance(distance) {
      var _this22 = this;

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
        registerAllPromise.then(function () {
          return _this22.preloadAllMedia_();
        });
      }

      this.toggleTabbableElements_(distance == 0);
    }
    /**
     * @return {boolean} Whether this page is currently active.
     */

  }, {
    key: "isActive",
    value: function isActive() {
      return this.element.hasAttribute('active');
    }
    /**
     * Emits an event indicating that the progress of the current page has changed
     * to the specified value.
     * @param {number} progress The progress from 0.0 to 1.0.
     */

  }, {
    key: "emitProgress_",
    value: function emitProgress_(progress) {
      // Don't emit progress for ads, since the progress bar is hidden.
      // Don't emit progress for inactive pages, because race conditions.
      if (this.isAd() || this.state_ === PageState.NOT_ACTIVE) {
        return;
      }

      var payload = dict({
        'pageId': this.element.id,
        'progress': progress
      });
      var eventInit = {
        bubbles: true
      };
      dispatch(this.win, this.element, EventType.PAGE_PROGRESS, payload, eventInit);
    }
    /**
     * Returns all of the pages that are one hop from this page.
     * @return {!Array<string>}
     */

  }, {
    key: "getAdjacentPageIds",
    value: function getAdjacentPageIds() {
      var adjacentPageIds = isExperimentOn(this.win, 'amp-story-branching') ? this.actions_() : [];
      var autoAdvanceNext = this.getNextPageId(true
      /* opt_isAutomaticAdvance */
      );
      var manualAdvanceNext = this.getNextPageId(false
      /* opt_isAutomaticAdvance */
      );
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
     */

  }, {
    key: "getPreviousPageId",
    value: function getPreviousPageId() {
      if (this.element.hasAttribute('i-amphtml-return-to')) {
        return this.element.getAttribute('i-amphtml-return-to');
      }

      var navigationPath = this.storeService_.get(StateProperty.NAVIGATION_PATH);
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
     */

  }, {
    key: "getNextPageId",
    value: function getNextPageId(isAutomaticAdvance) {
      if (isAutomaticAdvance === void 0) {
        isAutomaticAdvance = false;
      }

      if (isAutomaticAdvance && this.element.hasAttribute('auto-advance-to')) {
        return this.element.getAttribute('auto-advance-to');
      }

      var advanceAttr = isExperimentOn(this.win, 'amp-story-branching') ? 'advance-to' : 'i-amphtml-advance-to';

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
     */

  }, {
    key: "actions_",
    value: function actions_() {
      var actionElements = Array.prototype.slice.call(this.element.querySelectorAll('[on*=goToPage]'));
      var actionAttrs = actionElements.map(function (action) {
        return action.getAttribute('on');
      });
      return actionAttrs.reduce(function (res, actions) {
        // Handling for multiple actions on one event or multiple events.
        var actionList =
        /** @type {!Array} */
        actions.split(/[;,]+/);
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
     */

  }, {
    key: "previous",
    value: function previous() {
      var pageId = this.getPreviousPageId();

      if (pageId === null) {
        dispatch(this.win, this.element, EventType.NO_PREVIOUS_PAGE,
        /* payload */
        undefined, {
          bubbles: true
        });
        return;
      }

      this.storeService_.dispatch(Action.TOGGLE_PAUSED, false);
      this.switchTo_(pageId, NavigationDirection.PREVIOUS);
    }
    /**
     * Navigates to the next page in the story.
     * @param {boolean=} isAutomaticAdvance Whether this navigation was caused
     *     by an automatic advancement after a timeout.
     */

  }, {
    key: "next",
    value: function next(isAutomaticAdvance) {
      if (isAutomaticAdvance === void 0) {
        isAutomaticAdvance = false;
      }

      var pageId = this.getNextPageId(isAutomaticAdvance);

      if (!pageId) {
        dispatch(this.win, this.element, EventType.NO_NEXT_PAGE,
        /* payload */
        undefined, {
          bubbles: true
        });
        return;
      }

      this.storeService_.dispatch(Action.TOGGLE_PAUSED, false);
      this.switchTo_(pageId, NavigationDirection.NEXT);
    }
    /**
     * @param {string} targetPageId
     * @param {!NavigationDirection} direction
     * @private
     */

  }, {
    key: "switchTo_",
    value: function switchTo_(targetPageId, direction) {
      var payload = dict({
        'targetPageId': targetPageId,
        'direction': direction
      });
      var eventInit = {
        bubbles: true
      };
      dispatch(this.win, this.element, EventType.SWITCH_PAGE, payload, eventInit);
    }
    /**
     * Checks if the page has any audio.
     * @private
     */

  }, {
    key: "checkPageHasAudio_",
    value: function checkPageHasAudio_() {
      var pageHasAudio = this.element.hasAttribute('background-audio') || this.element.querySelector('amp-audio') || this.hasVideoWithAudio_();
      this.storeService_.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, pageHasAudio);
    }
    /**
     * Checks if the page has any videos with audio.
     * @return {boolean}
     * @private
     */

  }, {
    key: "hasVideoWithAudio_",
    value: function hasVideoWithAudio_() {
      var ampVideoEls = this.element.querySelectorAll('amp-video');
      return Array.prototype.some.call(ampVideoEls, function (video) {
        return !video.hasAttribute('noaudio');
      });
    }
    /**
     * Checks if the page has elements with playback.
     * @private
     */

  }, {
    key: "checkPageHasElementWithPlayback_",
    value: function checkPageHasElementWithPlayback_() {
      var pageHasElementWithPlayback = this.isAutoAdvance() || this.element.hasAttribute('background-audio') || this.getAllMedia_().length > 0;
      this.storeService_.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, pageHasElementWithPlayback);
    }
    /**
     * @private
     */

  }, {
    key: "reportDevModeErrors_",
    value: function reportDevModeErrors_() {
      var _this23 = this;

      if (!getMode().development) {
        return;
      }

      getLogEntries(this.element).then(function (logEntries) {
        dispatch(_this23.win, _this23.element, EventType.DEV_LOG_ENTRIES_AVAILABLE, // ? is OK because all consumers are internal.

        /** @type {?} */
        logEntries, {
          bubbles: true
        });
      });
    }
    /**
     * Starts measuring video performance metrics, if performance tracking is on.
     * Has to be called directly before playing the video.
     * @private
     */

  }, {
    key: "startMeasuringAllVideoPerformance_",
    value: function startMeasuringAllVideoPerformance_() {
      if (!this.mediaPerformanceMetricsService_.isPerformanceTrackingOn()) {
        return;
      }

      var videoEls =
      /** @type {!Array<!HTMLMediaElement>} */
      this.getAllVideos_();

      for (var i = 0; i < videoEls.length; i++) {
        this.startMeasuringVideoPerformance_(videoEls[i]);
      }
    }
    /**
     * @param {!HTMLMediaElement} videoEl
     * @private
     */

  }, {
    key: "startMeasuringVideoPerformance_",
    value: function startMeasuringVideoPerformance_(videoEl) {
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
     */

  }, {
    key: "stopMeasuringAllVideoPerformance_",
    value: function stopMeasuringAllVideoPerformance_(sendMetrics) {
      if (sendMetrics === void 0) {
        sendMetrics = true;
      }

      if (!this.mediaPerformanceMetricsService_.isPerformanceTrackingOn()) {
        return;
      }

      for (var i = 0; i < this.performanceTrackedVideos_.length; i++) {
        this.mediaPerformanceMetricsService_.stopMeasuring(this.performanceTrackedVideos_[i], sendMetrics);
      }
    }
    /**
     * Displays a loading spinner whenever the video is buffering.
     * Has to be called after the mediaPool preload method, that swaps the video
     * elements with new amp elements.
     * @private
     */

  }, {
    key: "startListeningToVideoEvents_",
    value: function startListeningToVideoEvents_() {
      var _this24 = this;

      var videoEls = this.getAllVideos_();

      if (videoEls.length) {
        var alreadyPlaying = videoEls.some(function (video) {
          return video.currentTime != 0;
        });

        if (!alreadyPlaying) {
          this.debounceToggleLoadingSpinner_(true);
        }
      }

      Array.prototype.forEach.call(videoEls, function (videoEl) {
        _this24.unlisteners_.push(listen(videoEl, 'playing', function () {
          return _this24.debounceToggleLoadingSpinner_(false);
        }));

        _this24.unlisteners_.push(listen(videoEl, 'waiting', function () {
          return _this24.debounceToggleLoadingSpinner_(true);
        }));
      });
    }
    /**
     * @private
     */

  }, {
    key: "stopListeningToVideoEvents_",
    value: function stopListeningToVideoEvents_() {
      this.debounceToggleLoadingSpinner_(false);
      this.unlisteners_.forEach(function (unlisten) {
        return unlisten();
      });
      this.unlisteners_ = [];
    }
    /**
     * @private
     */

  }, {
    key: "buildAndAppendLoadingSpinner_",
    value: function buildAndAppendLoadingSpinner_() {
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
     */

  }, {
    key: "toggleLoadingSpinner_",
    value: function toggleLoadingSpinner_(isActive) {
      var _this25 = this;

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
     */

  }, {
    key: "buildAndAppendPlayMessage_",
    value: function buildAndAppendPlayMessage_() {
      var _this26 = this;

      this.playMessageEl_ = buildPlayMessageElement(this.element);
      var labelEl = this.playMessageEl_.querySelector('.i-amphtml-story-page-play-label');
      labelEl.textContent = getLocalizationService(this.element).getLocalizedString(LocalizedStringId.AMP_STORY_PAGE_PLAY_VIDEO);
      this.playMessageEl_.addEventListener('click', function () {
        _this26.togglePlayMessage_(false);

        _this26.startMeasuringAllVideoPerformance_();

        _this26.mediaPoolPromise_.then(function (mediaPool) {
          return mediaPool.blessAll();
        }).then(function () {
          return _this26.playAllMedia_();
        });
      });
      this.mutateElement(function () {
        return _this26.element.appendChild(_this26.playMessageEl_);
      });
    }
    /**
     * Toggles the visibility of the "Play video" fallback message.
     * @param {boolean} isActive
     * @private
     */

  }, {
    key: "togglePlayMessage_",
    value: function togglePlayMessage_(isActive) {
      var _this27 = this;

      if (!isActive) {
        this.playMessageEl_ && this.mutateElement(function () {
          return toggle(dev().assertElement(_this27.playMessageEl_), false);
        });
        return;
      }

      if (!this.playMessageEl_) {
        this.buildAndAppendPlayMessage_();
      }

      this.mutateElement(function () {
        return toggle(dev().assertElement(_this27.playMessageEl_), true);
      });
    }
    /**
     * Builds and appends a message and icon to indicate a video error state.
     * @private
     */

  }, {
    key: "buildAndAppendErrorMessage_",
    value: function buildAndAppendErrorMessage_() {
      var _this28 = this;

      this.errorMessageEl_ = buildErrorMessageElement(this.element);
      var labelEl = this.errorMessageEl_.querySelector('.i-amphtml-story-page-error-label');
      labelEl.textContent = getLocalizationService(this.element).getLocalizedString(LocalizedStringId.AMP_STORY_PAGE_ERROR_VIDEO);
      this.mutateElement(function () {
        return _this28.element.appendChild(_this28.errorMessageEl_);
      });
    }
    /**
     * Toggles the visibility of the "Play video" fallback message.
     * @param {boolean} isActive
     * @private
     */

  }, {
    key: "toggleErrorMessage_",
    value: function toggleErrorMessage_(isActive) {
      var _this29 = this;

      if (!isActive) {
        this.errorMessageEl_ && this.mutateElement(function () {
          return toggle(dev().assertElement(_this29.errorMessageEl_), false);
        });
        return;
      }

      if (!this.errorMessageEl_) {
        this.buildAndAppendErrorMessage_();
      }

      this.mutateElement(function () {
        return toggle(dev().assertElement(_this29.errorMessageEl_), true);
      });
    }
    /**
     * Renders the open attachment UI affordance.
     * @private
     */

  }, {
    key: "renderOpenAttachmentUI_",
    value: function renderOpenAttachmentUI_() {
      var _this30 = this;

      // AttachmentEl can be either amp-story-page-attachment or amp-story-page-outlink
      var attachmentEl = this.element.querySelector('amp-story-page-attachment, amp-story-page-outlink');

      if (!attachmentEl) {
        return;
      }

      // To prevent 'title' attribute from being used by browser, copy value to 'data-title' and remove.
      if (attachmentEl.hasAttribute('title')) {
        attachmentEl.setAttribute('data-title', attachmentEl.getAttribute('title'));
        attachmentEl.removeAttribute('title');
      }

      if (!this.openAttachmentEl_) {
        this.openAttachmentEl_ = renderPageAttachmentUI(this.element, attachmentEl);

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

          createShadowRootWithStyle(container, _this30.openAttachmentEl_, pageAttachmentCSS);
        });
      }
    }
    /**
     * Opens the attachment, if any.
     * @param {boolean=} shouldAnimate
     */

  }, {
    key: "openAttachment",
    value: function openAttachment(shouldAnimate) {
      if (shouldAnimate === void 0) {
        shouldAnimate = true;
      }

      var attachmentEl = this.element.querySelector('amp-story-page-attachment, amp-story-page-outlink');

      if (!attachmentEl) {
        return;
      }

      attachmentEl.getImpl().then(function (attachment) {
        return attachment.open(shouldAnimate);
      });
    }
    /**
     * check to see if this page is a wrapper for an ad
     * @return {boolean}
     */

  }, {
    key: "isAd",
    value: function isAd() {
      return this.element.hasAttribute(ADVERTISEMENT_ATTR_NAME);
    }
    /**
     * Sets text styles for descendants of the
     * <amp-story-page> element.
     * @private
     */

  }, {
    key: "setDescendantCssTextStyles_",
    value: function setDescendantCssTextStyles_() {
      setTextBackgroundColor(this.element);
    }
    /**
     * Sets the description of the page, from its title and its videos
     * alt/title attributes.
     * @private
     */

  }, {
    key: "setPageDescription_",
    value: function setPageDescription_() {
      if (this.isBotUserAgent_) {
        renderPageDescription(this, this.getAllAmpVideos_());
      }

      if (!this.isBotUserAgent_ && this.element.hasAttribute('title')) {
        // Strip the title attribute from the page on non-bot user agents, to
        // prevent the browser tooltip.
        if (!this.element.getAttribute('aria-label')) {
          this.element.setAttribute('aria-label', this.element.getAttribute('title'));
        }

        this.element.removeAttribute('title');
      }
    }
    /**
     * Adds an empty alt tag to amp-img elements if not present.
     * Prevents screen readers from announcing the img src value.
     * @private
     */

  }, {
    key: "initializeImgAltTags_",
    value: function initializeImgAltTags_() {
      toArray(this.element.querySelectorAll('amp-img')).forEach(function (ampImgNode) {
        if (!ampImgNode.getAttribute('alt')) {
          ampImgNode.setAttribute('alt', '');
          // If the child img element is in the dom, propogate the attribute to it.
          var childImgNode = ampImgNode.querySelector('img');
          childImgNode && ampImgNode.getImpl().then(function (impl) {
            return propagateAttributes('alt', impl.element, childImgNode);
          });
        }
      });
    }
    /**
     * Returns whether the page will automatically advance
     * @return {boolean}
     */

  }, {
    key: "isAutoAdvance",
    value: function isAutoAdvance() {
      return this.advancement_.isAutoAdvance();
    }
    /**
     * Set the i-amphtml-orig-tabindex to the default tabindex of tabbable elements
     */

  }, {
    key: "initializeTabbableElements_",
    value: function initializeTabbableElements_() {
      toArray(scopedQuerySelectorAll(this.element, Selectors.ALL_TABBABLE)).forEach(function (el) {
        el.setAttribute('i-amphtml-orig-tabindex', el.getAttribute('tabindex') || 0);
      });
    }
    /**
     * Toggles the tabbable elements (buttons, links, etc) to only reach them when page is active.
     * @param {boolean} toggle
     */

  }, {
    key: "toggleTabbableElements_",
    value: function toggleTabbableElements_(toggle) {
      toArray(scopedQuerySelectorAll(this.element, Selectors.ALL_TABBABLE)).forEach(function (el) {
        el.setAttribute('tabindex', toggle ? el.getAttribute('i-amphtml-orig-tabindex') : -1);
      });
    }
  }], [{
    key: "prerenderAllowed",
    value:
    /** @override @nocollapse */
    function prerenderAllowed(element) {
      return isPrerenderActivePage(element);
    }
  }]);

  return AmpStoryPage;
}(AMP.BaseElement);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1wYWdlLmpzIl0sIm5hbWVzIjpbIkFGRklMSUFURV9MSU5LX1NFTEVDVE9SIiwiQW1wU3RvcnlBZmZpbGlhdGVMaW5rIiwiQWN0aW9uIiwiU3RhdGVQcm9wZXJ0eSIsIlVJVHlwZSIsImdldFN0b3JlU2VydmljZSIsIkFkdmFuY2VtZW50Q29uZmlnIiwiQW1wRXZlbnRzIiwiQW1wU3RvcnlFbWJlZGRlZENvbXBvbmVudCIsIkVNQkVEX0lEX0FUVFJJQlVURV9OQU1FIiwiRVhQQU5EQUJMRV9DT01QT05FTlRTIiwiZXhwYW5kYWJsZUVsZW1lbnRzU2VsZWN0b3JzIiwiQW5pbWF0aW9uTWFuYWdlciIsImhhc0FuaW1hdGlvbnMiLCJDb21tb25TaWduYWxzIiwiRGVmZXJyZWQiLCJFdmVudFR5cGUiLCJkaXNwYXRjaCIsIkxheW91dCIsIkxvYWRpbmdTcGlubmVyIiwiTG9jYWxpemVkU3RyaW5nSWQiLCJNZWRpYVBvb2wiLCJTZXJ2aWNlcyIsIlN0b3J5QWRTZWdtZW50VGltZXMiLCJWaWRlb0V2ZW50cyIsImRlbGVnYXRlQXV0b3BsYXkiLCJhZGRBdHRyaWJ1dGVzVG9FbGVtZW50IiwiaXRlcmF0ZUN1cnNvciIsImNsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yIiwic2NvcGVkUXVlcnlTZWxlY3RvckFsbCIsImNyZWF0ZVNoYWRvd1Jvb3RXaXRoU3R5bGUiLCJzZXRUZXh0QmFja2dyb3VuZENvbG9yIiwiZGVib3VuY2UiLCJkZXYiLCJkaWN0IiwiZ2V0QW1wZG9jIiwiZ2V0RnJpZW5kbHlJZnJhbWVFbWJlZE9wdGlvbmFsIiwiZ2V0TG9jYWxpemF0aW9uU2VydmljZSIsImdldExvZ0VudHJpZXMiLCJnZXRNZWRpYVBlcmZvcm1hbmNlTWV0cmljc1NlcnZpY2UiLCJnZXRNb2RlIiwiaHRtbEZvciIsImlzQXV0b3BsYXlTdXBwb3J0ZWQiLCJpc0V4cGVyaW1lbnRPbiIsImlzUGFnZUF0dGFjaG1lbnRVaVYyRXhwZXJpbWVudE9uIiwiaXNQcmVyZW5kZXJBY3RpdmVQYWdlIiwibGlzdGVuIiwibGlzdGVuT25jZSIsIkNTUyIsInBhZ2VBdHRhY2htZW50Q1NTIiwicHJvcGFnYXRlQXR0cmlidXRlcyIsInB4IiwidG9nZ2xlIiwicmVuZGVyUGFnZUF0dGFjaG1lbnRVSSIsInJlbmRlclBhZ2VEZXNjcmlwdGlvbiIsIndoZW5VcGdyYWRlZFRvQ3VzdG9tRWxlbWVudCIsInRvQXJyYXkiLCJ1cGdyYWRlQmFja2dyb3VuZEF1ZGlvIiwiUEFHRV9MT0FERURfQ0xBU1NfTkFNRSIsIlNlbGVjdG9ycyIsIkFMTF9BTVBfTUVESUEiLCJBTExfQU1QX1ZJREVPIiwiQUxMX0lGUkFNRURfTUVESUEiLCJBTExfUExBWUJBQ0tfQU1QX01FRElBIiwiQUxMX1BMQVlCQUNLX01FRElBIiwiQUxMX1ZJREVPIiwiQUxMX1RBQkJBQkxFIiwiRU1CRURERURfQ09NUE9ORU5UU19TRUxFQ1RPUlMiLCJPYmplY3QiLCJrZXlzIiwiam9pbiIsIklOVEVSQUNUSVZFX0VNQkVEREVEX0NPTVBPTkVOVFNfU0VMRUNUT1JTIiwidmFsdWVzIiwiUkVTSVpFX1RJTUVPVVRfTVMiLCJUQUciLCJBRFZFUlRJU0VNRU5UX0FUVFJfTkFNRSIsIlJFV0lORF9USU1FT1VUX01TIiwiREVGQVVMVF9QUkVWSUVXX0FVVE9fQURWQU5DRV9EVVJBVElPTiIsIlZJREVPX1BSRVZJRVdfQVVUT19BRFZBTkNFX0RVUkFUSU9OIiwiVklERU9fTUlOSU1VTV9BVVRPX0FEVkFOQ0VfRFVSQVRJT05fUyIsImJ1aWxkUGxheU1lc3NhZ2VFbGVtZW50IiwiZWxlbWVudCIsImJ1aWxkRXJyb3JNZXNzYWdlRWxlbWVudCIsIlBhZ2VTdGF0ZSIsIk5PVF9BQ1RJVkUiLCJQTEFZSU5HIiwiUEFVU0VEIiwiTmF2aWdhdGlvbkRpcmVjdGlvbiIsIk5FWFQiLCJQUkVWSU9VUyIsImRlYm91bmNlRW1iZWRSZXNpemUiLCJ3aW4iLCJwYWdlIiwibXV0YXRvciIsImVsIiwidW5saXN0ZW4iLCJwcmVwYXJlRm9yQW5pbWF0aW9uIiwiYXNzZXJ0RWxlbWVudCIsIkFtcFN0b3J5UGFnZSIsImFuaW1hdGlvbk1hbmFnZXJfIiwiYWR2YW5jZW1lbnRfIiwiZGVib3VuY2VUb2dnbGVMb2FkaW5nU3Bpbm5lcl8iLCJpc0FjdGl2ZSIsInRvZ2dsZUxvYWRpbmdTcGlubmVyXyIsImxvYWRpbmdTcGlubmVyXyIsInBsYXlNZXNzYWdlRWxfIiwiZXJyb3JNZXNzYWdlRWxfIiwib3BlbkF0dGFjaG1lbnRFbF8iLCJtdXRhdG9yXyIsIm11dGF0b3JGb3JEb2MiLCJkb2N1bWVudCIsImRlZmVycmVkIiwibWVkaWFQZXJmb3JtYW5jZU1ldHJpY3NTZXJ2aWNlXyIsInBlcmZvcm1hbmNlVHJhY2tlZFZpZGVvc18iLCJyZWdpc3RlckFsbE1lZGlhUHJvbWlzZV8iLCJtZWRpYVBvb2xQcm9taXNlXyIsInByb21pc2UiLCJtZWRpYVBvb2xSZXNvbHZlRm5fIiwicmVzb2x2ZSIsIm1lZGlhUG9vbFJlamVjdEZuXyIsInJlamVjdCIsInN0YXRlXyIsInN0b3JlU2VydmljZV8iLCJjc3NWYXJpYWJsZXNTdHlsZUVsXyIsImxheW91dEJveF8iLCJ1bmxpc3RlbmVyc18iLCJ0aW1lcl8iLCJ0aW1lckZvciIsImJhY2tncm91bmRBdWRpb0RlZmVycmVkXyIsImlzQm90VXNlckFnZW50XyIsInBsYXRmb3JtRm9yIiwiaXNCb3QiLCJwbGF5QXVkaW9FbGVtZW50RnJvbVRpbWVzdGFtcF8iLCJjcmVhdGUiLCJnZXRBbXBEb2MiLCJnZXRVcmwiLCJkZWxlZ2F0ZVZpZGVvQXV0b3BsYXkiLCJtYXJrTWVkaWFFbGVtZW50c1dpdGhQcmVsb2FkXyIsImluaXRpYWxpemVNZWRpYVBvb2xfIiwibWF5YmVDcmVhdGVBbmltYXRpb25NYW5hZ2VyXyIsIm1heWJlU2V0UHJldmlld0R1cmF0aW9uXyIsIm1heWJlU2V0U3RvcnlOZXh0VXBfIiwiZm9yRWxlbWVudCIsImFkZFByZXZpb3VzTGlzdGVuZXIiLCJwcmV2aW91cyIsImFkZEFkdmFuY2VMaXN0ZW5lciIsIm5leHQiLCJhZGRQcm9ncmVzc0xpc3RlbmVyIiwicHJvZ3Jlc3MiLCJlbWl0UHJvZ3Jlc3NfIiwic2V0RGVzY2VuZGFudENzc1RleHRTdHlsZXNfIiwic3Vic2NyaWJlIiwiVUlfU1RBVEUiLCJ1aVN0YXRlIiwib25VSVN0YXRlVXBkYXRlXyIsInNldFBhZ2VEZXNjcmlwdGlvbl8iLCJzZXRBdHRyaWJ1dGUiLCJpbml0aWFsaXplSW1nQWx0VGFnc18iLCJpbml0aWFsaXplVGFiYmFibGVFbGVtZW50c18iLCJnZXQiLCJQUkVWSUVXX1NUQVRFIiwidmlkZW9zIiwiZ2V0QWxsVmlkZW9zXyIsImF1dG9BZHZhbmNlQXR0ciIsImxlbmd0aCIsImdldEF0dHJpYnV0ZSIsInN0b3J5TmV4dFVwUGFyYW0iLCJ2aWV3ZXJGb3JEb2MiLCJnZXRQYXJhbSIsIlNFTlRJTkVMIiwibGlzdGVuQW5kVXBkYXRlQXV0b0FkdmFuY2VEdXJhdGlvbl8iLCJ2aWRlbyIsImdldEZpcnN0QW1wVmlkZW9fIiwidGhlbiIsImdldEltcGwiLCJ2aWRlb0ltcGwiLCJ2aWRlb0R1cmF0aW9uIiwiZ2V0RHVyYXRpb24iLCJpc05hTiIsIm1heWJlVXBkYXRlQXV0b0FkdmFuY2VUaW1lXyIsIkxPQURFRE1FVEFEQVRBIiwiZHVyYXRpb24iLCJ1cGRhdGVUaW1lRGVsYXkiLCJnZXRBbGxBbXBWaWRlb3NfIiwicXVlcnlTZWxlY3RvckFsbCIsInN0b3J5RWwiLCJzdG9yeUltcGwiLCJmb3IiLCJyZWFzb24iLCJtZWRpYVNldCIsIkFycmF5IiwicHJvdG90eXBlIiwiZm9yRWFjaCIsImNhbGwiLCJtZWRpYUl0ZW0iLCJsYXlvdXQiLCJDT05UQUlORVIiLCJzdGF0ZSIsInJlbW92ZUF0dHJpYnV0ZSIsInBhdXNlXyIsInJlc3VtZV8iLCJzdGFydCIsInBsYXlBbGxNZWRpYV8iLCJyZXN1bWVBbGwiLCJzdG9wIiwicGF1c2VBbGxNZWRpYV8iLCJwYXVzZUFsbCIsIndhcm4iLCJzdG9wTWVhc3VyaW5nQWxsVmlkZW9QZXJmb3JtYW5jZV8iLCJzdG9wTGlzdGVuaW5nVG9WaWRlb0V2ZW50c18iLCJ0b2dnbGVFcnJvck1lc3NhZ2VfIiwidG9nZ2xlUGxheU1lc3NhZ2VfIiwiREVTS1RPUF9QQU5FTFMiLCJkZWxheSIsInJld2luZEFsbE1lZGlhXyIsIk1VVEVEX1NUQVRFIiwibXV0ZUFsbE1lZGlhIiwiY2FuY2VsQWxsIiwicmVnaXN0ZXJBbGxQcm9taXNlIiwicmVnaXN0ZXJBbGxNZWRpYV8iLCJzaWduYWxzIiwid2hlblNpZ25hbCIsIkxPQURfRU5EIiwicHJlbG9hZEFsbE1lZGlhXyIsInN0YXJ0TWVhc3VyaW5nQWxsVmlkZW9QZXJmb3JtYW5jZV8iLCJzdGFydExpc3RlbmluZ1RvVmlkZW9FdmVudHNfIiwidW5tdXRlQWxsTWVkaWEiLCJtYXliZVN0YXJ0QW5pbWF0aW9uc18iLCJjaGVja1BhZ2VIYXNBdWRpb18iLCJjaGVja1BhZ2VIYXNFbGVtZW50V2l0aFBsYXliYWNrXyIsImZpbmRBbmRQcmVwYXJlRW1iZWRkZWRDb21wb25lbnRzXyIsInJlcG9ydERldk1vZGVFcnJvcnNfIiwibG9vcCIsImdldFZpZXdwb3J0Iiwib25SZXNpemUiLCJvblJlc2l6ZV8iLCJyZW5kZXJPcGVuQXR0YWNobWVudFVJXyIsIlByb21pc2UiLCJhbGwiLCJiZWZvcmVWaXNpYmxlIiwid2FpdEZvck1lZGlhTGF5b3V0XyIsImxheW91dEJveCIsImdldExheW91dFNpemUiLCJ3aWR0aCIsImhlaWdodCIsImdldFZzeW5jIiwicnVuUHJvbWlzZSIsIm1lYXN1cmUiLCJjbGllbnRIZWlnaHQiLCJjbGllbnRXaWR0aCIsInZoIiwidnciLCJmaWZ0eVZ3IiwiTWF0aCIsInJvdW5kIiwidm1pbiIsIm1pbiIsInZtYXgiLCJtYXgiLCJtdXRhdGUiLCJTRVRfUEFHRV9TSVpFIiwiZG9jIiwiY3JlYXRlRWxlbWVudCIsImhlYWQiLCJhcHBlbmRDaGlsZCIsInRleHRDb250ZW50IiwiVkVSVElDQUwiLCJtYXliZUZpbmlzaEFuaW1hdGlvbnNfIiwibWF5YmVBcHBseUZpcnN0QW5pbWF0aW9uRnJhbWVPckZpbmlzaCIsImdldE1lZGlhQnlTZWxlY3Rvcl8iLCJtZWRpYVByb21pc2VzIiwibWFwIiwibWVkaWFFbCIsInRhZ05hbWUiLCJ0b0xvd2VyQ2FzZSIsImhhc0F0dHJpYnV0ZSIsInJlYWR5U3RhdGUiLCJhZGRFdmVudExpc3RlbmVyIiwibWFya1BhZ2VBc0xvYWRlZF8iLCJzaWduYWwiLCJOT0RJU1BMQVkiLCJCVUlMVCIsInB1c2giLCJmb3JjZVJlc2l6ZSIsImFkZENsaWNrU2hpZWxkVG9FbWJlZGRlZENvbXBvbmVudHNfIiwicmVzaXplSW50ZXJhY3RpdmVFbWJlZGRlZENvbXBvbmVudHNfIiwiYnVpbGRBZmZpbGlhdGVMaW5rc18iLCJjb21wb25lbnRFbHMiLCJtdXRhdGVFbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiZGVib3VuY2VQcmVwYXJlRm9yQW5pbWF0aW9uIiwiU0laRV9DSEFOR0VEIiwibGluayIsImJ1aWxkIiwiUEFHRV9MT0FERUQiLCJ1bmRlZmluZWQiLCJidWJibGVzIiwic2VsZWN0b3IiLCJpZnJhbWUiLCJxdWVyeVNlbGVjdG9yIiwiZmllIiwiYm9keSIsImNhbGxiYWNrRm4iLCJnZXRBbGxNZWRpYV8iLCJtZWRpYVBvb2wiLCJwcm9taXNlcyIsInJld2luZFRvQmVnaW5uaW5nIiwid2hlbkFsbE1lZGlhRWxlbWVudHNfIiwicGF1c2VNZWRpYV8iLCJwYXVzZSIsInBsYXlNZWRpYV8iLCJwbGF5IiwibG9hZFByb21pc2UiLCJjYXRjaCIsInVudXNlZEVycm9yIiwiaXNBdXRvcGxheVN1cHBvcnRlZF8iLCJEYXRlIiwibm93IiwicHJlbG9hZE1lZGlhXyIsInByZWxvYWQiLCJtdXRlTWVkaWFfIiwibXV0ZWQiLCJtdXRlIiwidW5tdXRlTWVkaWFfIiwicGF1c2VkIiwidW5tdXRlIiwiY3VycmVudFRpbWUiLCJzZXRDdXJyZW50VGltZSIsIndhaXRGb3JQbGF5YmFja01lZGlhTGF5b3V0XyIsInAiLCJlIiwicmVnaXN0ZXJNZWRpYV8iLCJyZWdpc3RlciIsImFuaW1hdGVJbiIsImFwcGx5TGFzdEZyYW1lIiwiYXBwbHlGaXJzdEZyYW1lT3JGaW5pc2giLCJwYXJzZUludCIsImRpc3RhbmNlIiwiaXNBZCIsImdldERpc3RhbmNlIiwidG9nZ2xlVGFiYmFibGVFbGVtZW50c18iLCJwYXlsb2FkIiwiaWQiLCJldmVudEluaXQiLCJQQUdFX1BST0dSRVNTIiwiYWRqYWNlbnRQYWdlSWRzIiwiYWN0aW9uc18iLCJhdXRvQWR2YW5jZU5leHQiLCJnZXROZXh0UGFnZUlkIiwibWFudWFsQWR2YW5jZU5leHQiLCJnZXRQcmV2aW91c1BhZ2VJZCIsIm5hdmlnYXRpb25QYXRoIiwiTkFWSUdBVElPTl9QQVRIIiwicGFnZVBhdGhJbmRleCIsImxhc3RJbmRleE9mIiwicHJldmlvdXNQYWdlSWQiLCJwcmV2aW91c0VsZW1lbnQiLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwiaXNBdXRvbWF0aWNBZHZhbmNlIiwiYWR2YW5jZUF0dHIiLCJuZXh0RWxlbWVudCIsIm5leHRFbGVtZW50U2libGluZyIsImFjdGlvbkVsZW1lbnRzIiwic2xpY2UiLCJhY3Rpb25BdHRycyIsImFjdGlvbiIsInJlZHVjZSIsInJlcyIsImFjdGlvbnMiLCJhY3Rpb25MaXN0Iiwic3BsaXQiLCJpbmRleE9mIiwic2VhcmNoIiwicGFnZUlkIiwiTk9fUFJFVklPVVNfUEFHRSIsIlRPR0dMRV9QQVVTRUQiLCJzd2l0Y2hUb18iLCJOT19ORVhUX1BBR0UiLCJ0YXJnZXRQYWdlSWQiLCJkaXJlY3Rpb24iLCJTV0lUQ0hfUEFHRSIsInBhZ2VIYXNBdWRpbyIsImhhc1ZpZGVvV2l0aEF1ZGlvXyIsIlRPR0dMRV9QQUdFX0hBU19BVURJTyIsImFtcFZpZGVvRWxzIiwic29tZSIsInBhZ2VIYXNFbGVtZW50V2l0aFBsYXliYWNrIiwiaXNBdXRvQWR2YW5jZSIsIlRPR0dMRV9QQUdFX0hBU19FTEVNRU5UX1dJVEhfUExBWUJBQ0siLCJkZXZlbG9wbWVudCIsImxvZ0VudHJpZXMiLCJERVZfTE9HX0VOVFJJRVNfQVZBSUxBQkxFIiwiaXNQZXJmb3JtYW5jZVRyYWNraW5nT24iLCJ2aWRlb0VscyIsImkiLCJzdGFydE1lYXN1cmluZ1ZpZGVvUGVyZm9ybWFuY2VfIiwidmlkZW9FbCIsInN0YXJ0TWVhc3VyaW5nIiwic2VuZE1ldHJpY3MiLCJzdG9wTWVhc3VyaW5nIiwiYWxyZWFkeVBsYXlpbmciLCJidWlsZEFuZEFwcGVuZExvYWRpbmdTcGlubmVyXyIsImxhYmVsRWwiLCJnZXRMb2NhbGl6ZWRTdHJpbmciLCJBTVBfU1RPUllfUEFHRV9QTEFZX1ZJREVPIiwiYmxlc3NBbGwiLCJidWlsZEFuZEFwcGVuZFBsYXlNZXNzYWdlXyIsIkFNUF9TVE9SWV9QQUdFX0VSUk9SX1ZJREVPIiwiYnVpbGRBbmRBcHBlbmRFcnJvck1lc3NhZ2VfIiwiYXR0YWNobWVudEVsIiwiY29udGFpbmVyIiwicHJldmVudERlZmF1bHQiLCJvcGVuQXR0YWNobWVudCIsInNob3VsZEFuaW1hdGUiLCJhdHRhY2htZW50Iiwib3BlbiIsImFtcEltZ05vZGUiLCJjaGlsZEltZ05vZGUiLCJpbXBsIiwiQU1QIiwiQmFzZUVsZW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FDRUEsdUJBREYsRUFFRUMscUJBRkY7QUFJQSxTQUNFQyxNQURGLEVBRUVDLGFBRkYsRUFHRUMsTUFIRixFQUlFQyxlQUpGO0FBTUEsU0FBUUMsaUJBQVI7QUFDQSxTQUFRQyxTQUFSO0FBQ0EsU0FDRUMseUJBREYsRUFFRUMsdUJBRkYsRUFHRUMscUJBSEYsRUFJRUMsMkJBSkY7QUFNQSxTQUFRQyxnQkFBUixFQUEwQkMsYUFBMUI7QUFDQSxTQUFRQyxhQUFSO0FBQ0EsU0FBUUMs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O0FBQ0E7O0FBcHJEQTtBQUFBO0FBQUEsV0FxckRFLHVDQUE4QjtBQUM1QjVVLE1BQUFBLE9BQU8sQ0FDTDNCLHNCQUFzQixDQUFDLEtBQUtvRCxPQUFOLEVBQWV0QixTQUFTLENBQUNPLFlBQXpCLENBRGpCLENBQVAsQ0FFRThILE9BRkYsQ0FFVSxVQUFDbEcsRUFBRCxFQUFRO0FBQ2hCQSxRQUFBQSxFQUFFLENBQUM4RCxZQUFILENBQ0UseUJBREYsRUFFRTlELEVBQUUsQ0FBQ3VFLFlBQUgsQ0FBZ0IsVUFBaEIsS0FBK0IsQ0FGakM7QUFJRCxPQVBEO0FBUUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUFuc0RBO0FBQUE7QUFBQSxXQW9zREUsaUNBQXdCakgsTUFBeEIsRUFBZ0M7QUFDOUJJLE1BQUFBLE9BQU8sQ0FDTDNCLHNCQUFzQixDQUFDLEtBQUtvRCxPQUFOLEVBQWV0QixTQUFTLENBQUNPLFlBQXpCLENBRGpCLENBQVAsQ0FFRThILE9BRkYsQ0FFVSxVQUFDbEcsRUFBRCxFQUFRO0FBQ2hCQSxRQUFBQSxFQUFFLENBQUM4RCxZQUFILENBQ0UsVUFERixFQUVFeEcsTUFBTSxHQUFHMEMsRUFBRSxDQUFDdUUsWUFBSCxDQUFnQix5QkFBaEIsQ0FBSCxHQUFnRCxDQUFDLENBRnpEO0FBSUQsT0FQRDtBQVFEO0FBN3NESDtBQUFBO0FBQUE7QUFDRTtBQUNBLDhCQUF3QnBGLE9BQXhCLEVBQWlDO0FBQy9CLGFBQU9wQyxxQkFBcUIsQ0FBQ29DLE9BQUQsQ0FBNUI7QUFDRDtBQUpIOztBQUFBO0FBQUEsRUFBa0NtVixHQUFHLENBQUNDLFdBQXRDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBFbWJlZHMgYSBzaW5nbGUgcGFnZSBpbiBhIHN0b3J5XG4gKlxuICogRXhhbXBsZTpcbiAqIDxjb2RlPlxuICogPGFtcC1zdG9yeS1wYWdlPlxuICogICAuLi5cbiAqIDwvYW1wLXN0b3J5LXBhZ2U+XG4gKiA8L2NvZGU+XG4gKi9cbmltcG9ydCB7XG4gIEFGRklMSUFURV9MSU5LX1NFTEVDVE9SLFxuICBBbXBTdG9yeUFmZmlsaWF0ZUxpbmssXG59IGZyb20gJy4vYW1wLXN0b3J5LWFmZmlsaWF0ZS1saW5rJztcbmltcG9ydCB7XG4gIEFjdGlvbixcbiAgU3RhdGVQcm9wZXJ0eSxcbiAgVUlUeXBlLFxuICBnZXRTdG9yZVNlcnZpY2UsXG59IGZyb20gJy4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UnO1xuaW1wb3J0IHtBZHZhbmNlbWVudENvbmZpZ30gZnJvbSAnLi9wYWdlLWFkdmFuY2VtZW50JztcbmltcG9ydCB7QW1wRXZlbnRzfSBmcm9tICcjY29yZS9jb25zdGFudHMvYW1wLWV2ZW50cyc7XG5pbXBvcnQge1xuICBBbXBTdG9yeUVtYmVkZGVkQ29tcG9uZW50LFxuICBFTUJFRF9JRF9BVFRSSUJVVEVfTkFNRSxcbiAgRVhQQU5EQUJMRV9DT01QT05FTlRTLFxuICBleHBhbmRhYmxlRWxlbWVudHNTZWxlY3RvcnMsXG59IGZyb20gJy4vYW1wLXN0b3J5LWVtYmVkZGVkLWNvbXBvbmVudCc7XG5pbXBvcnQge0FuaW1hdGlvbk1hbmFnZXIsIGhhc0FuaW1hdGlvbnN9IGZyb20gJy4vYW5pbWF0aW9uJztcbmltcG9ydCB7Q29tbW9uU2lnbmFsc30gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2NvbW1vbi1zaWduYWxzJztcbmltcG9ydCB7RGVmZXJyZWR9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7RXZlbnRUeXBlLCBkaXNwYXRjaH0gZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0IHtMYXlvdXR9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQnO1xuaW1wb3J0IHtMb2FkaW5nU3Bpbm5lcn0gZnJvbSAnLi9sb2FkaW5nLXNwaW5uZXInO1xuaW1wb3J0IHtMb2NhbGl6ZWRTdHJpbmdJZH0gZnJvbSAnI3NlcnZpY2UvbG9jYWxpemF0aW9uL3N0cmluZ3MnO1xuaW1wb3J0IHtNZWRpYVBvb2x9IGZyb20gJy4vbWVkaWEtcG9vbCc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge1N0b3J5QWRTZWdtZW50VGltZXN9IGZyb20gJyNleHBlcmltZW50cy9zdG9yeS1hZC1wcm9ncmVzcy1zZWdtZW50JztcbmltcG9ydCB7VmlkZW9FdmVudHMsIGRlbGVnYXRlQXV0b3BsYXl9IGZyb20gJy4uLy4uLy4uL3NyYy92aWRlby1pbnRlcmZhY2UnO1xuaW1wb3J0IHthZGRBdHRyaWJ1dGVzVG9FbGVtZW50LCBpdGVyYXRlQ3Vyc29yfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtcbiAgY2xvc2VzdEFuY2VzdG9yRWxlbWVudEJ5U2VsZWN0b3IsXG4gIHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwsXG59IGZyb20gJyNjb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge2NyZWF0ZVNoYWRvd1Jvb3RXaXRoU3R5bGUsIHNldFRleHRCYWNrZ3JvdW5kQ29sb3J9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtkZWJvdW5jZX0gZnJvbSAnI2NvcmUvdHlwZXMvZnVuY3Rpb24nO1xuaW1wb3J0IHtkZXZ9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtnZXRBbXBkb2N9IGZyb20gJy4uLy4uLy4uL3NyYy9zZXJ2aWNlLWhlbHBlcnMnO1xuaW1wb3J0IHtnZXRGcmllbmRseUlmcmFtZUVtYmVkT3B0aW9uYWx9IGZyb20gJy4uLy4uLy4uL3NyYy9pZnJhbWUtaGVscGVyJztcbmltcG9ydCB7Z2V0TG9jYWxpemF0aW9uU2VydmljZX0gZnJvbSAnLi9hbXAtc3RvcnktbG9jYWxpemF0aW9uLXNlcnZpY2UnO1xuaW1wb3J0IHtnZXRMb2dFbnRyaWVzfSBmcm9tICcuL2xvZ2dpbmcnO1xuaW1wb3J0IHtnZXRNZWRpYVBlcmZvcm1hbmNlTWV0cmljc1NlcnZpY2V9IGZyb20gJy4vbWVkaWEtcGVyZm9ybWFuY2UtbWV0cmljcy1zZXJ2aWNlJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtodG1sRm9yfSBmcm9tICcjY29yZS9kb20vc3RhdGljLXRlbXBsYXRlJztcbmltcG9ydCB7aXNBdXRvcGxheVN1cHBvcnRlZH0gZnJvbSAnI2NvcmUvZG9tL3ZpZGVvJztcbmltcG9ydCB7aXNFeHBlcmltZW50T259IGZyb20gJyNleHBlcmltZW50cyc7XG5pbXBvcnQge2lzUGFnZUF0dGFjaG1lbnRVaVYyRXhwZXJpbWVudE9ufSBmcm9tICcuL2FtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtdWktdjInO1xuaW1wb3J0IHtpc1ByZXJlbmRlckFjdGl2ZVBhZ2V9IGZyb20gJy4vcHJlcmVuZGVyLWFjdGl2ZS1wYWdlJztcbmltcG9ydCB7bGlzdGVuLCBsaXN0ZW5PbmNlfSBmcm9tICcuLi8uLi8uLi9zcmMvZXZlbnQtaGVscGVyJztcbmltcG9ydCB7Q1NTIGFzIHBhZ2VBdHRhY2htZW50Q1NTfSBmcm9tICcuLi8uLi8uLi9idWlsZC9hbXAtc3Rvcnktb3Blbi1wYWdlLWF0dGFjaG1lbnQtMC4xLmNzcyc7XG5pbXBvcnQge3Byb3BhZ2F0ZUF0dHJpYnV0ZXN9IGZyb20gJyNjb3JlL2RvbS9wcm9wYWdhdGUtYXR0cmlidXRlcyc7XG5pbXBvcnQge3B4LCB0b2dnbGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge3JlbmRlclBhZ2VBdHRhY2htZW50VUl9IGZyb20gJy4vYW1wLXN0b3J5LW9wZW4tcGFnZS1hdHRhY2htZW50JztcbmltcG9ydCB7cmVuZGVyUGFnZURlc2NyaXB0aW9ufSBmcm9tICcuL3NlbWFudGljLXJlbmRlcic7XG5pbXBvcnQge3doZW5VcGdyYWRlZFRvQ3VzdG9tRWxlbWVudH0gZnJvbSAnLi4vLi4vLi4vc3JjL2FtcC1lbGVtZW50LWhlbHBlcnMnO1xuXG5pbXBvcnQge3RvQXJyYXl9IGZyb20gJyNjb3JlL3R5cGVzL2FycmF5JztcbmltcG9ydCB7dXBncmFkZUJhY2tncm91bmRBdWRpb30gZnJvbSAnLi9hdWRpbyc7XG5cbi8qKlxuICogQ1NTIGNsYXNzIGZvciBhbiBhbXAtc3RvcnktcGFnZSB0aGF0IGluZGljYXRlcyB0aGUgZW50aXJlIHBhZ2UgaXMgbG9hZGVkLlxuICogQGNvbnN0IHtzdHJpbmd9XG4gKi9cbmNvbnN0IFBBR0VfTE9BREVEX0NMQVNTX05BTUUgPSAnaS1hbXBodG1sLXN0b3J5LXBhZ2UtbG9hZGVkJztcblxuLyoqXG4gKiBTZWxlY3RvcnMgZm9yIG1lZGlhIGVsZW1lbnRzLlxuICogT25seSBnZXQgdGhlIHBhZ2UgbWVkaWE6IGRpcmVjdCBjaGlsZHJlbiBvZiBhbXAtc3RvcnktcGFnZSAoaWU6XG4gKiBiYWNrZ3JvdW5kLWF1ZGlvKSwgb3IgZGVzY2VuZGFudCBvZiBhbXAtc3RvcnktZ3JpZC1sYXllci4gVGhhdCBleGNsdWRlcyBtZWRpYVxuICogY29udGFpbmVkIGluIGFtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQuXG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU2VsZWN0b3JzID0ge1xuICAvLyB3aGljaCBtZWRpYSB0byB3YWl0IGZvciBvbiBwYWdlIGxheW91dC5cbiAgQUxMX0FNUF9NRURJQTpcbiAgICAnYW1wLXN0b3J5LWdyaWQtbGF5ZXIgYW1wLWF1ZGlvLCAnICtcbiAgICAnYW1wLXN0b3J5LWdyaWQtbGF5ZXIgYW1wLXZpZGVvLCBhbXAtc3RvcnktZ3JpZC1sYXllciBhbXAtaW1nLCAnICtcbiAgICAnYW1wLXN0b3J5LWdyaWQtbGF5ZXIgYW1wLWFuaW0nLFxuICBBTExfQU1QX1ZJREVPOiAnYW1wLXN0b3J5LWdyaWQtbGF5ZXIgYW1wLXZpZGVvJyxcbiAgQUxMX0lGUkFNRURfTUVESUE6ICdhdWRpbywgdmlkZW8nLFxuICBBTExfUExBWUJBQ0tfQU1QX01FRElBOlxuICAgICdhbXAtc3RvcnktZ3JpZC1sYXllciBhbXAtYXVkaW8sIGFtcC1zdG9yeS1ncmlkLWxheWVyIGFtcC12aWRlbycsXG4gIC8vIFRPRE8oZ21ham91bGV0KTogUmVmYWN0b3IgdGhlIHdheSB0aGVzZSBzZWxlY3RvcnMgYXJlIHVzZWQuIFRoZXkgd2lsbCBiZVxuICAvLyBwYXNzZWQgdG8gc2NvcGVkUXVlcnlTZWxlY3RvckFsbCB3aGljaCBleHBlY3RzIG9ubHkgb25lIHNlbGVjdG9yIGFuZCBub3RcbiAgLy8gbXVsdGlwbGUgc2VwYXJhdGVkIGJ5IGNvbW1hcy4gYD4gYXVkaW9gIGhhcyB0byBiZSBrZXB0IGZpcnN0IG9mIHRoZSBsaXN0IHRvXG4gIC8vIHdvcmsgd2l0aCB0aGlzIGN1cnJlbnQgaW1wbGVtZW50YXRpb24uXG4gIEFMTF9QTEFZQkFDS19NRURJQTpcbiAgICAnPiBhdWRpbywgYW1wLXN0b3J5LWdyaWQtbGF5ZXIgYXVkaW8sIGFtcC1zdG9yeS1ncmlkLWxheWVyIHZpZGVvJyxcbiAgQUxMX1ZJREVPOiAnYW1wLXN0b3J5LWdyaWQtbGF5ZXIgdmlkZW8nLFxuICBBTExfVEFCQkFCTEU6ICdhLCBhbXAtdHdpdHRlciA+IGlmcmFtZScsXG59O1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBFTUJFRERFRF9DT01QT05FTlRTX1NFTEVDVE9SUyA9IE9iamVjdC5rZXlzKEVYUEFOREFCTEVfQ09NUE9ORU5UUykuam9pbihcbiAgJywgJ1xuKTtcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgSU5URVJBQ1RJVkVfRU1CRURERURfQ09NUE9ORU5UU19TRUxFQ1RPUlMgPSBPYmplY3QudmFsdWVzKFxuICBleHBhbmRhYmxlRWxlbWVudHNTZWxlY3RvcnMoKVxuKS5qb2luKCcsJyk7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge251bWJlcn0gKi9cbmNvbnN0IFJFU0laRV9USU1FT1VUX01TID0gMTAwMDtcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ2FtcC1zdG9yeS1wYWdlJztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgQURWRVJUSVNFTUVOVF9BVFRSX05BTUUgPSAnYWQnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtudW1iZXJ9ICovXG5jb25zdCBSRVdJTkRfVElNRU9VVF9NUyA9IDM1MDtcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgREVGQVVMVF9QUkVWSUVXX0FVVE9fQURWQU5DRV9EVVJBVElPTiA9ICcycyc7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFZJREVPX1BSRVZJRVdfQVVUT19BRFZBTkNFX0RVUkFUSU9OID0gJzVzJztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgVklERU9fTUlOSU1VTV9BVVRPX0FEVkFOQ0VfRFVSQVRJT05fUyA9IDI7XG5cbi8qKlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmNvbnN0IGJ1aWxkUGxheU1lc3NhZ2VFbGVtZW50ID0gKGVsZW1lbnQpID0+XG4gIGh0bWxGb3IoZWxlbWVudClgXG4gICAgICA8YnV0dG9uIHJvbGU9XCJidXR0b25cIiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1wYWdlLXBsYXktYnV0dG9uIGktYW1waHRtbC1zdG9yeS1zeXN0ZW0tcmVzZXRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktcGFnZS1wbGF5LWxhYmVsXCI+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz0naS1hbXBodG1sLXN0b3J5LXBhZ2UtcGxheS1pY29uJz48L3NwYW4+XG4gICAgICA8L2J1dHRvbj5gO1xuXG4vKipcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5jb25zdCBidWlsZEVycm9yTWVzc2FnZUVsZW1lbnQgPSAoZWxlbWVudCkgPT5cbiAgaHRtbEZvcihlbGVtZW50KWBcbiAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktcGFnZS1lcnJvciBpLWFtcGh0bWwtc3Rvcnktc3lzdGVtLXJlc2V0XCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LXBhZ2UtZXJyb3ItbGFiZWxcIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdpLWFtcGh0bWwtc3RvcnktcGFnZS1lcnJvci1pY29uJz48L3NwYW4+XG4gICAgICA8L2Rpdj5gO1xuXG4vKipcbiAqIGFtcC1zdG9yeS1wYWdlIHN0YXRlcy5cbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBQYWdlU3RhdGUgPSB7XG4gIE5PVF9BQ1RJVkU6IDAsIC8vIFBhZ2UgaXMgbm90IGRpc3BsYXllZC4gQ291bGQgc3RpbGwgYmUgdmlzaWJsZSBvbiBkZXNrdG9wLlxuICBQTEFZSU5HOiAxLCAvLyBQYWdlIGlzIGN1cnJlbnRseSB0aGUgbWFpbiBwYWdlLCBhbmQgcGxheWluZy5cbiAgUEFVU0VEOiAyLCAvLyBQYWdlIGlzIGN1cnJlbnRseSB0aGUgbWFpbiBwYWdlLCBidXQgbm90IHBsYXlpbmcuXG59O1xuXG4vKiogQGNvbnN0IEBlbnVtIHtzdHJpbmd9Ki9cbmV4cG9ydCBjb25zdCBOYXZpZ2F0aW9uRGlyZWN0aW9uID0ge1xuICBORVhUOiAnbmV4dCcsXG4gIFBSRVZJT1VTOiAncHJldmlvdXMnLFxufTtcblxuLyoqXG4gKiBQcmVwYXJlcyBhbiBlbWJlZCBmb3IgaXRzIGV4cGFuZGVkIG1vZGUgYW5pbWF0aW9uLiBTaW5jZSB0aGlzIHJlcXVpcmVzXG4gKiBjYWxjdWxhdGluZyB0aGUgc2l6ZSBvZiB0aGUgZW1iZWQsIHdlIGRlYm91bmNlIGFmdGVyIGVhY2ggcmVzaXplIGV2ZW50IHRvXG4gKiBtYWtlIHN1cmUgd2UgaGF2ZSB0aGUgZmluYWwgc2l6ZSBiZWZvcmUgZG9pbmcgdGhlIGNhbGN1bGF0aW9uIGZvciB0aGVcbiAqIGFuaW1hdGlvbi5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0geyFFbGVtZW50fSBwYWdlXG4gKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9tdXRhdG9yLWludGVyZmFjZS5NdXRhdG9ySW50ZXJmYWNlfSBtdXRhdG9yXG4gKiBAcmV0dXJuIHtmdW5jdGlvbighRWxlbWVudCwgP1VubGlzdGVuRGVmKX1cbiAqL1xuZnVuY3Rpb24gZGVib3VuY2VFbWJlZFJlc2l6ZSh3aW4sIHBhZ2UsIG11dGF0b3IpIHtcbiAgcmV0dXJuIGRlYm91bmNlKFxuICAgIHdpbixcbiAgICAoZWwsIHVubGlzdGVuKSA9PiB7XG4gICAgICBBbXBTdG9yeUVtYmVkZGVkQ29tcG9uZW50LnByZXBhcmVGb3JBbmltYXRpb24oXG4gICAgICAgIHBhZ2UsXG4gICAgICAgIGRldigpLmFzc2VydEVsZW1lbnQoZWwpLFxuICAgICAgICBtdXRhdG9yXG4gICAgICApO1xuICAgICAgaWYgKHVubGlzdGVuKSB7XG4gICAgICAgIHVubGlzdGVuKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBSRVNJWkVfVElNRU9VVF9NU1xuICApO1xufVxuXG4vKipcbiAqIFRoZSA8YW1wLXN0b3J5LXBhZ2U+IGN1c3RvbSBlbGVtZW50LCB3aGljaCByZXByZXNlbnRzIGEgc2luZ2xlIHBhZ2Ugb2ZcbiAqIGFuIDxhbXAtc3Rvcnk+LlxuICovXG5leHBvcnQgY2xhc3MgQW1wU3RvcnlQYWdlIGV4dGVuZHMgQU1QLkJhc2VFbGVtZW50IHtcbiAgLyoqIEBvdmVycmlkZSBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgcHJlcmVuZGVyQWxsb3dlZChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGlzUHJlcmVuZGVyQWN0aXZlUGFnZShlbGVtZW50KTtcbiAgfVxuXG4gIC8qKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50ICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihlbGVtZW50KTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0FuaW1hdGlvbk1hbmFnZXJ9ICovXG4gICAgdGhpcy5hbmltYXRpb25NYW5hZ2VyXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9BZHZhbmNlbWVudENvbmZpZ30gKi9cbiAgICB0aGlzLmFkdmFuY2VtZW50XyA9IG51bGw7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshZnVuY3Rpb24oYm9vbGVhbil9ICovXG4gICAgdGhpcy5kZWJvdW5jZVRvZ2dsZUxvYWRpbmdTcGlubmVyXyA9IGRlYm91bmNlKFxuICAgICAgdGhpcy53aW4sXG4gICAgICAoaXNBY3RpdmUpID0+IHRoaXMudG9nZ2xlTG9hZGluZ1NwaW5uZXJfKCEhaXNBY3RpdmUpLFxuICAgICAgMTAwXG4gICAgKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0xvYWRpbmdTcGlubmVyfSAqL1xuICAgIHRoaXMubG9hZGluZ1NwaW5uZXJfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5wbGF5TWVzc2FnZUVsXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuZXJyb3JNZXNzYWdlRWxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5vcGVuQXR0YWNobWVudEVsXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvbXV0YXRvci1pbnRlcmZhY2UuTXV0YXRvckludGVyZmFjZX0gKi9cbiAgICB0aGlzLm11dGF0b3JfID0gU2VydmljZXMubXV0YXRvckZvckRvYyhnZXRBbXBkb2ModGhpcy53aW4uZG9jdW1lbnQpKTtcblxuICAgIGNvbnN0IGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi9tZWRpYS1wZXJmb3JtYW5jZS1tZXRyaWNzLXNlcnZpY2UuTWVkaWFQZXJmb3JtYW5jZU1ldHJpY3NTZXJ2aWNlfSAqL1xuICAgIHRoaXMubWVkaWFQZXJmb3JtYW5jZU1ldHJpY3NTZXJ2aWNlXyA9IGdldE1lZGlhUGVyZm9ybWFuY2VNZXRyaWNzU2VydmljZShcbiAgICAgIHRoaXMud2luXG4gICAgKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUFycmF5PCFIVE1MTWVkaWFFbGVtZW50Pn0gKi9cbiAgICB0aGlzLnBlcmZvcm1hbmNlVHJhY2tlZFZpZGVvc18gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1Byb21pc2V9ICovXG4gICAgdGhpcy5yZWdpc3RlckFsbE1lZGlhUHJvbWlzZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVByb21pc2U8IU1lZGlhUG9vbD59ICovXG4gICAgdGhpcy5tZWRpYVBvb2xQcm9taXNlXyA9IGRlZmVycmVkLnByb21pc2U7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshZnVuY3Rpb24oIU1lZGlhUG9vbCl9ICovXG4gICAgdGhpcy5tZWRpYVBvb2xSZXNvbHZlRm5fID0gZGVmZXJyZWQucmVzb2x2ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFmdW5jdGlvbigqKX0gKi9cbiAgICB0aGlzLm1lZGlhUG9vbFJlamVjdEZuXyA9IGRlZmVycmVkLnJlamVjdDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IVBhZ2VTdGF0ZX0gKi9cbiAgICB0aGlzLnN0YXRlXyA9IFBhZ2VTdGF0ZS5OT1RfQUNUSVZFO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2V9ICovXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gZ2V0U3RvcmVTZXJ2aWNlKHRoaXMud2luKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5jc3NWYXJpYWJsZXNTdHlsZUVsXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez8uLi8uLi8uLi9zcmMvbGF5b3V0LXJlY3QuTGF5b3V0U2l6ZURlZn0gKi9cbiAgICB0aGlzLmxheW91dEJveF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8ZnVuY3Rpb24oKT59ICovXG4gICAgdGhpcy51bmxpc3RlbmVyc18gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuLi8uLi8uLi9zcmMvc2VydmljZS90aW1lci1pbXBsLlRpbWVyfSAqL1xuICAgIHRoaXMudGltZXJfID0gU2VydmljZXMudGltZXJGb3IodGhpcy53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIHshRGVmZXJyZWR9ICovXG4gICAgdGhpcy5iYWNrZ3JvdW5kQXVkaW9EZWZlcnJlZF8gPSBuZXcgRGVmZXJyZWQoKTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIHVzZXIgYWdlbnQgbWF0Y2hlcyBhIGJvdC4gIFRoaXMgaXMgdXNlZCB0byBwcmV2ZW50IHJlc291cmNlXG4gICAgICogb3B0aW1pemF0aW9ucyB0aGF0IG1ha2UgdGhlIGRvY3VtZW50IGxlc3MgdXNlZnVsIGF0IGNyYXdsIHRpbWUsIGUuZy5cbiAgICAgKiByZW1vdmluZyBzb3VyY2VzIGZyb20gdmlkZW9zLlxuICAgICAqIEBwcml2YXRlIEBjb25zdCB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmlzQm90VXNlckFnZW50XyA9IFNlcnZpY2VzLnBsYXRmb3JtRm9yKHRoaXMud2luKS5pc0JvdCgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/bnVtYmVyfSBUaW1lIGF0IHdoaWNoIGFuIGF1ZGlvIGVsZW1lbnQgZmFpbGVkIHBsYXlpbmcuICovXG4gICAgdGhpcy5wbGF5QXVkaW9FbGVtZW50RnJvbVRpbWVzdGFtcF8gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtYXliZUNyZWF0ZUFuaW1hdGlvbk1hbmFnZXJfKCkge1xuICAgIGlmICh0aGlzLmFuaW1hdGlvbk1hbmFnZXJfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghaGFzQW5pbWF0aW9ucyh0aGlzLmVsZW1lbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuYW5pbWF0aW9uTWFuYWdlcl8gPSBBbmltYXRpb25NYW5hZ2VyLmNyZWF0ZShcbiAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgIHRoaXMuZ2V0QW1wRG9jKCksXG4gICAgICB0aGlzLmdldEFtcERvYygpLmdldFVybCgpXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDYWxsYmFjaygpIHtcbiAgICB0aGlzLmRlbGVnYXRlVmlkZW9BdXRvcGxheSgpO1xuICAgIHRoaXMubWFya01lZGlhRWxlbWVudHNXaXRoUHJlbG9hZF8oKTtcbiAgICB0aGlzLmluaXRpYWxpemVNZWRpYVBvb2xfKCk7XG4gICAgdGhpcy5tYXliZUNyZWF0ZUFuaW1hdGlvbk1hbmFnZXJfKCk7XG4gICAgdGhpcy5tYXliZVNldFByZXZpZXdEdXJhdGlvbl8oKTtcbiAgICB0aGlzLm1heWJlU2V0U3RvcnlOZXh0VXBfKCk7XG4gICAgdGhpcy5hZHZhbmNlbWVudF8gPSBBZHZhbmNlbWVudENvbmZpZy5mb3JFbGVtZW50KHRoaXMud2luLCB0aGlzLmVsZW1lbnQpO1xuICAgIHRoaXMuYWR2YW5jZW1lbnRfLmFkZFByZXZpb3VzTGlzdGVuZXIoKCkgPT4gdGhpcy5wcmV2aW91cygpKTtcbiAgICB0aGlzLmFkdmFuY2VtZW50Xy5hZGRBZHZhbmNlTGlzdGVuZXIoKCkgPT5cbiAgICAgIHRoaXMubmV4dCgvKiBvcHRfaXNBdXRvbWF0aWNBZHZhbmNlICovIHRydWUpXG4gICAgKTtcbiAgICB0aGlzLmFkdmFuY2VtZW50Xy5hZGRQcm9ncmVzc0xpc3RlbmVyKChwcm9ncmVzcykgPT5cbiAgICAgIHRoaXMuZW1pdFByb2dyZXNzXyhwcm9ncmVzcylcbiAgICApO1xuICAgIHRoaXMuc2V0RGVzY2VuZGFudENzc1RleHRTdHlsZXNfKCk7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuVUlfU1RBVEUsXG4gICAgICAodWlTdGF0ZSkgPT4gdGhpcy5vblVJU3RhdGVVcGRhdGVfKHVpU3RhdGUpLFxuICAgICAgdHJ1ZSAvKiBjYWxsVG9Jbml0aWFsaXplICovXG4gICAgKTtcbiAgICB0aGlzLnNldFBhZ2VEZXNjcmlwdGlvbl8oKTtcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3JlZ2lvbicpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZUltZ0FsdFRhZ3NfKCk7XG4gICAgdGhpcy5pbml0aWFsaXplVGFiYmFibGVFbGVtZW50c18oKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBtYXliZVNldFByZXZpZXdEdXJhdGlvbl8oKSB7XG4gICAgaWYgKHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5QUkVWSUVXX1NUQVRFKSkge1xuICAgICAgY29uc3QgdmlkZW9zID0gdGhpcy5nZXRBbGxWaWRlb3NfKCk7XG5cbiAgICAgIGNvbnN0IGF1dG9BZHZhbmNlQXR0ciA9XG4gICAgICAgIHZpZGVvcy5sZW5ndGggPiAwXG4gICAgICAgICAgPyBWSURFT19QUkVWSUVXX0FVVE9fQURWQU5DRV9EVVJBVElPTlxuICAgICAgICAgIDogREVGQVVMVF9QUkVWSUVXX0FVVE9fQURWQU5DRV9EVVJBVElPTjtcblxuICAgICAgYWRkQXR0cmlidXRlc1RvRWxlbWVudChcbiAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICBkaWN0KHtcbiAgICAgICAgICAnYXV0by1hZHZhbmNlLWFmdGVyJzogYXV0b0FkdmFuY2VBdHRyLFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIHN0b3J5TmV4dFVwIHBhcmFtIGlmIHByb3ZpZGVkIGFuZCBzZXRzIHRoZSBhdXRvLWFkdmFuY2UtYWZ0ZXJcbiAgICogYXR0cmlidXRlIHRvIHRoZSBnaXZlbiB2YWx1ZSBpZiB0aGVyZSBpc24ndCBvbmUgc2V0IGJ5IHRoZSBwdWJsaXNoZXIuIFRoZVxuICAgKiBhdXRvLWFkdmFuY2UtYWZ0ZXIgYXR0cmlidXRlIG1heSBsYXRlciBiZSBzZXQgdG8gdGhlIGR1cmF0aW9uIG9mIHRoZSBmaXJzdFxuICAgKiB2aWRlbyBpZiB0aGVyZSBpcyBvbmUsIG9uY2UgdGhlIG1ldGFkYXRhIGlzIGF2YWlsYWJsZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1heWJlU2V0U3RvcnlOZXh0VXBfKCkge1xuICAgIGNvbnN0IGF1dG9BZHZhbmNlQXR0ciA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2F1dG8tYWR2YW5jZS1hZnRlcicpO1xuICAgIC8vIFRoaXMgaXMgYSBwcml2YXRlIHBhcmFtIHVzZWQgZm9yIHRlc3RpbmcsIGl0IG1heSBiZSBjaGFuZ2VkXG4gICAgLy8gb3IgcmVtb3ZlZCB3aXRob3V0IG5vdGljZS5cbiAgICBjb25zdCBzdG9yeU5leHRVcFBhcmFtID0gU2VydmljZXMudmlld2VyRm9yRG9jKHRoaXMuZWxlbWVudCkuZ2V0UGFyYW0oXG4gICAgICAnc3RvcnlOZXh0VXAnXG4gICAgKTtcbiAgICBpZiAoXG4gICAgICBhdXRvQWR2YW5jZUF0dHIgIT09IG51bGwgfHxcbiAgICAgIHN0b3J5TmV4dFVwUGFyYW0gPT09IG51bGwgfHxcbiAgICAgIC8vIFRoaXMgaXMgYSBzcGVjaWFsIHZhbHVlIHRoYXQgaW5kaWNhdGVzIHdlIGFyZSBpbiB0aGUgdmlld2VyIGluZGljYXRlZCBjb250cm9sIGdyb3VwLlxuICAgICAgc3RvcnlOZXh0VXBQYXJhbSA9PT0gU3RvcnlBZFNlZ21lbnRUaW1lcy5TRU5USU5FTFxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhZGRBdHRyaWJ1dGVzVG9FbGVtZW50KFxuICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgZGljdCh7XG4gICAgICAgICdhdXRvLWFkdmFuY2UtYWZ0ZXInOiBzdG9yeU5leHRVcFBhcmFtLFxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMubGlzdGVuQW5kVXBkYXRlQXV0b0FkdmFuY2VEdXJhdGlvbl8oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGVyZSdzIGEgdmlkZW8gb24gdGhlIHBhZ2UsIHRoaXMgc2V0cyBhIGxpc3RlbmVyIHRvIHVwZGF0ZVxuICAgKiB0aGUgVGltZUJhc2VkQWR2YW5jZW1lbnQgd2hlbiB0aGUgZmlyc3QgdmlkZW8ncyBkdXJhdGlvbiBiZWNvbWVzIGF2YWlsYWJsZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGxpc3RlbkFuZFVwZGF0ZUF1dG9BZHZhbmNlRHVyYXRpb25fKCkge1xuICAgIGNvbnN0IHZpZGVvID0gdGhpcy5nZXRGaXJzdEFtcFZpZGVvXygpO1xuICAgIGlmICh2aWRlbyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB3aGVuVXBncmFkZWRUb0N1c3RvbUVsZW1lbnQodmlkZW8pXG4gICAgICAudGhlbigoKSA9PiB2aWRlby5nZXRJbXBsKCkpXG4gICAgICAudGhlbigodmlkZW9JbXBsKSA9PiB7XG4gICAgICAgIGNvbnN0IHZpZGVvRHVyYXRpb24gPSB2aWRlb0ltcGwuZ2V0RHVyYXRpb24oKTtcbiAgICAgICAgaWYgKCFpc05hTih2aWRlb0R1cmF0aW9uKSkge1xuICAgICAgICAgIHRoaXMubWF5YmVVcGRhdGVBdXRvQWR2YW5jZVRpbWVfKHZpZGVvRHVyYXRpb24pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsaXN0ZW5PbmNlKHZpZGVvLCBWaWRlb0V2ZW50cy5MT0FERURNRVRBREFUQSwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMubWF5YmVVcGRhdGVBdXRvQWR2YW5jZVRpbWVfKHZpZGVvSW1wbC5nZXREdXJhdGlvbigpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBhZHZhbmNlbWVudF8gaXMgYSBUaW1lQmFzZWRDb25maWcsIHRoaXMgdXBkYXRlcyB0aGUgJ2F1dG8tYWR2YW5jZS1hZnRlcidcbiAgICogYXR0cmlidXRlIGFuZCB1cGRhdGVzIHRoZSB0aW1lIGRlbGF5IHVzZWQgYnkgdGhlIHBhZ2UncyBBZHZhbmNlbWVudENvbmZpZy5cbiAgICogSWYgdGhlIGR1cmF0aW9uIGlzIDwgMiBzZWNvbmRzLCB0aGUgZGVmYXVsdCBpcyBsZWZ0IHVuY2hhbmdlZC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSB1cGRhdGVkIGR1cmF0aW9uIGZvciB0aGUgcGFnZSwgaW4gc2Vjb25kcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1heWJlVXBkYXRlQXV0b0FkdmFuY2VUaW1lXyhkdXJhdGlvbikge1xuICAgIGlmIChcbiAgICAgIGR1cmF0aW9uIDwgVklERU9fTUlOSU1VTV9BVVRPX0FEVkFOQ0VfRFVSQVRJT05fUyB8fFxuICAgICAgIXRoaXMuYWR2YW5jZW1lbnRfIHx8XG4gICAgICAhdGhpcy5hZHZhbmNlbWVudF8udXBkYXRlVGltZURlbGF5XG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuYWR2YW5jZW1lbnRfLnVwZGF0ZVRpbWVEZWxheShkdXJhdGlvbiArICdzJyk7XG4gICAgLy8gJ2F1dG8tYWR2YW5jZS1hZnRlcicgaXMgb25seSByZWFkIGR1cmluZyBidWlsZENhbGxiYWNrKCksIGJ1dCB3ZSB1cGRhdGUgaXRcbiAgICAvLyBoZXJlIHRvIGtlZXAgdGhlIERPTSBjb25zaXN0ZW50IHdpdGggdGhlIEFkdmFuY2VtZW50Q29uZmlnLlxuICAgIGFkZEF0dHJpYnV0ZXNUb0VsZW1lbnQoXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICBkaWN0KHsnYXV0by1hZHZhbmNlLWFmdGVyJzogZHVyYXRpb24gKyAncyd9KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZmlyc3QgYW1wLXZpZGVvIGluIHRoZSBhbXAtc3RvcnktcGFnZSBpZiB0aGVyZSBpcyBvbmUsIG90aGVyd2lzZVxuICAgKiByZXR1cm5zIG51bGwuXG4gICAqIEByZXR1cm4gez9FbGVtZW50fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0Rmlyc3RBbXBWaWRlb18oKSB7XG4gICAgY29uc3QgdmlkZW9zID0gdGhpcy5nZXRBbGxBbXBWaWRlb3NfKCk7XG4gICAgcmV0dXJuIHZpZGVvcy5sZW5ndGggPT09IDAgPyBudWxsIDogdmlkZW9zWzBdO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGVnYXRlcyB2aWRlbyBhdXRvcGxheSBzbyB0aGUgdmlkZW8gbWFuYWdlciBkb2VzIG5vdCBmb2xsb3cgdGhlXG4gICAqIGF1dG9wbGF5IGF0dHJpYnV0ZSB0aGF0IG1heSBoYXZlIGJlZW4gc2V0IGJ5IGEgcHVibGlzaGVyLCB3aGljaCBjb3VsZFxuICAgKiBwbGF5IHZpZGVvcyBmcm9tIGFuIGluYWN0aXZlIHBhZ2UuXG4gICAqL1xuICBkZWxlZ2F0ZVZpZGVvQXV0b3BsYXkoKSB7XG4gICAgaXRlcmF0ZUN1cnNvcih0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYW1wLXZpZGVvJyksIGRlbGVnYXRlQXV0b3BsYXkpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGluaXRpYWxpemVNZWRpYVBvb2xfKCkge1xuICAgIGNvbnN0IHN0b3J5RWwgPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgY2xvc2VzdEFuY2VzdG9yRWxlbWVudEJ5U2VsZWN0b3IodGhpcy5lbGVtZW50LCAnYW1wLXN0b3J5JyksXG4gICAgICAnYW1wLXN0b3J5LXBhZ2UgbXVzdCBiZSBhIGRlc2NlbmRhbnQgb2YgYW1wLXN0b3J5LidcbiAgICApO1xuXG4gICAgd2hlblVwZ3JhZGVkVG9DdXN0b21FbGVtZW50KHN0b3J5RWwpXG4gICAgICAudGhlbigoKSA9PiBzdG9yeUVsLmdldEltcGwoKSlcbiAgICAgIC50aGVuKFxuICAgICAgICAoc3RvcnlJbXBsKSA9PiB0aGlzLm1lZGlhUG9vbFJlc29sdmVGbl8oTWVkaWFQb29sLmZvcihzdG9yeUltcGwpKSxcbiAgICAgICAgKHJlYXNvbikgPT4gdGhpcy5tZWRpYVBvb2xSZWplY3RGbl8ocmVhc29uKVxuICAgICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyBhbnkgQU1QIGVsZW1lbnRzIHRoYXQgcmVwcmVzZW50IG1lZGlhIGVsZW1lbnRzIHdpdGggcHJlbG9hZD1cImF1dG9cIi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1hcmtNZWRpYUVsZW1lbnRzV2l0aFByZWxvYWRfKCkge1xuICAgIGNvbnN0IG1lZGlhU2V0ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2FtcC1hdWRpbywgYW1wLXZpZGVvJyk7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChtZWRpYVNldCwgKG1lZGlhSXRlbSkgPT4ge1xuICAgICAgbWVkaWFJdGVtLnNldEF0dHJpYnV0ZSgncHJlbG9hZCcsICdhdXRvJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzTGF5b3V0U3VwcG9ydGVkKGxheW91dCkge1xuICAgIHJldHVybiBsYXlvdXQgPT0gTGF5b3V0LkNPTlRBSU5FUjtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBzdGF0ZSBvZiB0aGUgcGFnZS5cbiAgICogQHBhcmFtIHshUGFnZVN0YXRlfSBzdGF0ZVxuICAgKi9cbiAgc2V0U3RhdGUoc3RhdGUpIHtcbiAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICBjYXNlIFBhZ2VTdGF0ZS5OT1RfQUNUSVZFOlxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhY3RpdmUnKTtcbiAgICAgICAgaWYgKHRoaXMub3BlbkF0dGFjaG1lbnRFbF8pIHtcbiAgICAgICAgICB0aGlzLm9wZW5BdHRhY2htZW50RWxfLnJlbW92ZUF0dHJpYnV0ZSgnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYXVzZV8oKTtcbiAgICAgICAgdGhpcy5zdGF0ZV8gPSBzdGF0ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFBhZ2VTdGF0ZS5QTEFZSU5HOlxuICAgICAgICBpZiAodGhpcy5zdGF0ZV8gPT09IFBhZ2VTdGF0ZS5OT1RfQUNUSVZFKSB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYWN0aXZlJywgJycpO1xuICAgICAgICAgIHRoaXMucmVzdW1lXygpO1xuICAgICAgICAgIGlmICh0aGlzLm9wZW5BdHRhY2htZW50RWxfKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW5BdHRhY2htZW50RWxfLnNldEF0dHJpYnV0ZSgnYWN0aXZlJywgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlXyA9PT0gUGFnZVN0YXRlLlBBVVNFRCkge1xuICAgICAgICAgIHRoaXMuYWR2YW5jZW1lbnRfLnN0YXJ0KCk7XG4gICAgICAgICAgdGhpcy5wbGF5QWxsTWVkaWFfKCk7XG4gICAgICAgICAgdGhpcy5hbmltYXRpb25NYW5hZ2VyXz8ucmVzdW1lQWxsKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlXyA9IHN0YXRlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUGFnZVN0YXRlLlBBVVNFRDpcbiAgICAgICAgdGhpcy5hZHZhbmNlbWVudF8uc3RvcCh0cnVlIC8qKiBjYW5SZXN1bWUgKi8pO1xuICAgICAgICB0aGlzLnBhdXNlQWxsTWVkaWFfKGZhbHNlIC8qKiByZXdpbmRUb0JlZ2lubmluZyAqLyk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uTWFuYWdlcl8/LnBhdXNlQWxsKCk7XG4gICAgICAgIHRoaXMuc3RhdGVfID0gc3RhdGU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZGV2KCkud2FybihUQUcsIGBQYWdlU3RhdGUgJHtzdGF0ZX0gZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwYXVzZV8oKSB7XG4gICAgdGhpcy5hZHZhbmNlbWVudF8uc3RvcChmYWxzZSAvKiogY2FuUmVzdW1lICovKTtcblxuICAgIHRoaXMuc3RvcE1lYXN1cmluZ0FsbFZpZGVvUGVyZm9ybWFuY2VfKCk7XG4gICAgdGhpcy5zdG9wTGlzdGVuaW5nVG9WaWRlb0V2ZW50c18oKTtcbiAgICB0aGlzLnRvZ2dsZUVycm9yTWVzc2FnZV8oZmFsc2UpO1xuICAgIHRoaXMudG9nZ2xlUGxheU1lc3NhZ2VfKGZhbHNlKTtcbiAgICB0aGlzLnBsYXlBdWRpb0VsZW1lbnRGcm9tVGltZXN0YW1wXyA9IG51bGw7XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuVUlfU1RBVEUpID09PSBVSVR5cGUuREVTS1RPUF9QQU5FTFNcbiAgICApIHtcbiAgICAgIC8vIFRoZSByZXdpbmRpbmcgaXMgZGVsYXllZCBvbiBkZXNrdG9wIHNvIHRoYXQgaXQgaGFwcGVucyBhdCBhIGxvd2VyXG4gICAgICAvLyBvcGFjaXR5IGluc3RlYWQgb2YgaW1tZWRpYXRlbHkganVtcGluZyB0byB0aGUgZmlyc3QgZnJhbWUuIFNlZSAjMTc5ODUuXG4gICAgICB0aGlzLnBhdXNlQWxsTWVkaWFfKGZhbHNlIC8qKiByZXdpbmRUb0JlZ2lubmluZyAqLyk7XG4gICAgICB0aGlzLnRpbWVyXy5kZWxheSgoKSA9PiB7XG4gICAgICAgIHRoaXMucmV3aW5kQWxsTWVkaWFfKCk7XG4gICAgICB9LCBSRVdJTkRfVElNRU9VVF9NUyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGF1c2VBbGxNZWRpYV8odHJ1ZSAvKiogcmV3aW5kVG9CZWdpbm5pbmcgKi8pO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5Lk1VVEVEX1NUQVRFKSkge1xuICAgICAgdGhpcy5tdXRlQWxsTWVkaWEoKTtcbiAgICB9XG5cbiAgICB0aGlzLmFuaW1hdGlvbk1hbmFnZXJfPy5jYW5jZWxBbGwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVzdW1lXygpIHtcbiAgICBjb25zdCByZWdpc3RlckFsbFByb21pc2UgPSB0aGlzLnJlZ2lzdGVyQWxsTWVkaWFfKCk7XG5cbiAgICBpZiAodGhpcy5pc0FjdGl2ZSgpKSB7XG4gICAgICByZWdpc3RlckFsbFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2lnbmFscygpXG4gICAgICAgICAgLndoZW5TaWduYWwoQ29tbW9uU2lnbmFscy5MT0FEX0VORClcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZV8gPT0gUGFnZVN0YXRlLlBMQVlJTkcpIHtcbiAgICAgICAgICAgICAgdGhpcy5hZHZhbmNlbWVudF8uc3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcmVsb2FkQWxsTWVkaWFfKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zdGFydE1lYXN1cmluZ0FsbFZpZGVvUGVyZm9ybWFuY2VfKCk7XG4gICAgICAgICAgdGhpcy5zdGFydExpc3RlbmluZ1RvVmlkZW9FdmVudHNfKCk7XG4gICAgICAgICAgLy8gaU9TIDE0LjIgYW5kIDE0LjMgcmVxdWlyZXMgcGxheSB0byBiZSBjYWxsZWQgYmVmb3JlIHVubXV0ZVxuICAgICAgICAgIHRoaXMucGxheUFsbE1lZGlhXygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuTVVURURfU1RBVEUpKSB7XG4gICAgICAgICAgICAgIHRoaXMudW5tdXRlQWxsTWVkaWEoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMubWF5YmVTdGFydEFuaW1hdGlvbnNfKCk7XG4gICAgICB0aGlzLmNoZWNrUGFnZUhhc0F1ZGlvXygpO1xuICAgICAgdGhpcy5jaGVja1BhZ2VIYXNFbGVtZW50V2l0aFBsYXliYWNrXygpO1xuICAgICAgdGhpcy5maW5kQW5kUHJlcGFyZUVtYmVkZGVkQ29tcG9uZW50c18oKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlcG9ydERldk1vZGVFcnJvcnNfKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGxheW91dENhbGxiYWNrKCkge1xuICAgIC8vIERvIG5vdCBsb29wIGlmIHRoZSBhdWRpbyBpcyB1c2VkIHRvIGF1dG8tYWR2YW5jZS5cbiAgICBjb25zdCBsb29wID1cbiAgICAgIHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2lkJykgIT09XG4gICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhdXRvLWFkdmFuY2UtYWZ0ZXInKTtcbiAgICB1cGdyYWRlQmFja2dyb3VuZEF1ZGlvKHRoaXMuZWxlbWVudCwgbG9vcCk7XG4gICAgdGhpcy5iYWNrZ3JvdW5kQXVkaW9EZWZlcnJlZF8ucmVzb2x2ZSgpO1xuXG4gICAgdGhpcy5tdXRlQWxsTWVkaWEoKTtcbiAgICB0aGlzLmdldFZpZXdwb3J0KCkub25SZXNpemUoXG4gICAgICBkZWJvdW5jZSh0aGlzLndpbiwgKCkgPT4gdGhpcy5vblJlc2l6ZV8oKSwgUkVTSVpFX1RJTUVPVVRfTVMpXG4gICAgKTtcblxuICAgIHRoaXMucmVuZGVyT3BlbkF0dGFjaG1lbnRVSV8oKTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLmJlZm9yZVZpc2libGUoKSxcbiAgICAgIHRoaXMud2FpdEZvck1lZGlhTGF5b3V0XygpLFxuICAgICAgdGhpcy5tZWRpYVBvb2xQcm9taXNlXyxcbiAgICBdKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25MYXlvdXRNZWFzdXJlKCkge1xuICAgIGNvbnN0IGxheW91dEJveCA9IHRoaXMuZ2V0TGF5b3V0U2l6ZSgpO1xuICAgIC8vIE9ubHkgbWVhc3VyZXMgZnJvbSB0aGUgZmlyc3Qgc3RvcnkgcGFnZSwgdGhhdCBhbHdheXMgZ2V0cyBidWlsdCBiZWNhdXNlXG4gICAgLy8gb2YgdGhlIHByZXJlbmRlcmluZyBvcHRpbWl6YXRpb25zIGluIHBsYWNlLlxuICAgIGlmIChcbiAgICAgICFpc1ByZXJlbmRlckFjdGl2ZVBhZ2UodGhpcy5lbGVtZW50KSB8fFxuICAgICAgKHRoaXMubGF5b3V0Qm94XyAmJlxuICAgICAgICB0aGlzLmxheW91dEJveF8ud2lkdGggPT09IGxheW91dEJveC53aWR0aCAmJlxuICAgICAgICB0aGlzLmxheW91dEJveF8uaGVpZ2h0ID09PSBsYXlvdXRCb3guaGVpZ2h0KVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubGF5b3V0Qm94XyA9IGxheW91dEJveDtcblxuICAgIHJldHVybiB0aGlzLmdldFZzeW5jKCkucnVuUHJvbWlzZShcbiAgICAgIHtcbiAgICAgICAgbWVhc3VyZTogKHN0YXRlKSA9PiB7XG4gICAgICAgICAgY29uc3QgdWlTdGF0ZSA9IHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5VSV9TVEFURSk7XG4gICAgICAgICAgLy8gVGhlIGRlc2t0b3AgcGFuZWxzIFVJIHVzZXMgQ1NTIHNjYWxlLiBSZXRyaWV2aW5nIGNsaWVudEhlaWdodC9XaWR0aFxuICAgICAgICAgIC8vIGVuc3VyZXMgd2UgYXJlIGdldHRpbmcgdGhlIHJhdyBzaXplLCBpZ25vcmluZyB0aGUgc2NhbGUuXG4gICAgICAgICAgY29uc3Qge2hlaWdodCwgd2lkdGh9ID1cbiAgICAgICAgICAgIHVpU3RhdGUgPT09IFVJVHlwZS5ERVNLVE9QX1BBTkVMU1xuICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5lbGVtZW50Li8qT0sqLyBjbGllbnRIZWlnaHQsXG4gICAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5lbGVtZW50Li8qT0sqLyBjbGllbnRXaWR0aCxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIDogbGF5b3V0Qm94O1xuICAgICAgICAgIHN0YXRlLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICBzdGF0ZS53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgIHN0YXRlLnZoID0gaGVpZ2h0IC8gMTAwO1xuICAgICAgICAgIHN0YXRlLnZ3ID0gd2lkdGggLyAxMDA7XG4gICAgICAgICAgc3RhdGUuZmlmdHlWdyA9IE1hdGgucm91bmQod2lkdGggLyAyKTtcbiAgICAgICAgICBzdGF0ZS52bWluID0gTWF0aC5taW4oc3RhdGUudmgsIHN0YXRlLnZ3KTtcbiAgICAgICAgICBzdGF0ZS52bWF4ID0gTWF0aC5tYXgoc3RhdGUudmgsIHN0YXRlLnZ3KTtcbiAgICAgICAgfSxcbiAgICAgICAgbXV0YXRlOiAoc3RhdGUpID0+IHtcbiAgICAgICAgICBjb25zdCB7aGVpZ2h0LCB3aWR0aH0gPSBzdGF0ZTtcbiAgICAgICAgICBpZiAoc3RhdGUudmggPT09IDAgJiYgc3RhdGUudncgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5TRVRfUEFHRV9TSVpFLCB7aGVpZ2h0LCB3aWR0aH0pO1xuICAgICAgICAgIGlmICghdGhpcy5jc3NWYXJpYWJsZXNTdHlsZUVsXykge1xuICAgICAgICAgICAgY29uc3QgZG9jID0gdGhpcy53aW4uZG9jdW1lbnQ7XG4gICAgICAgICAgICB0aGlzLmNzc1ZhcmlhYmxlc1N0eWxlRWxfID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgICAgICB0aGlzLmNzc1ZhcmlhYmxlc1N0eWxlRWxfLnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2NzcycpO1xuICAgICAgICAgICAgZG9jLmhlYWQuYXBwZW5kQ2hpbGQodGhpcy5jc3NWYXJpYWJsZXNTdHlsZUVsXyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuY3NzVmFyaWFibGVzU3R5bGVFbF8udGV4dENvbnRlbnQgPVxuICAgICAgICAgICAgYDpyb290IHtgICtcbiAgICAgICAgICAgIGAtLXN0b3J5LXBhZ2Utdmg6ICR7cHgoc3RhdGUudmgpfTtgICtcbiAgICAgICAgICAgIGAtLXN0b3J5LXBhZ2Utdnc6ICR7cHgoc3RhdGUudncpfTtgICtcbiAgICAgICAgICAgIGAtLXN0b3J5LXBhZ2Utdm1pbjogJHtweChzdGF0ZS52bWluKX07YCArXG4gICAgICAgICAgICBgLS1zdG9yeS1wYWdlLXZtYXg6ICR7cHgoc3RhdGUudm1heCl9O2AgK1xuICAgICAgICAgICAgYC0taS1hbXBodG1sLXN0b3J5LXBhZ2UtNTB2dzogJHtweChzdGF0ZS5maWZ0eVZ3KX07YCArXG4gICAgICAgICAgICBgfWA7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge31cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblJlc2l6ZV8oKSB7XG4gICAgdGhpcy5maW5kQW5kUHJlcGFyZUVtYmVkZGVkQ29tcG9uZW50c18odHJ1ZSAvKiBmb3JjZVJlc2l6ZSAqLyk7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIFVJIHN0YXRlIHVwZGF0ZXMuXG4gICAqIEBwYXJhbSB7IVVJVHlwZX0gdWlTdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25VSVN0YXRlVXBkYXRlXyh1aVN0YXRlKSB7XG4gICAgLy8gT24gdmVydGljYWwgcmVuZGVyaW5nLCByZW5kZXIgYWxsIHRoZSBhbmltYXRpb25zIHdpdGggdGhlaXIgZmluYWwgc3RhdGUuXG4gICAgaWYgKHVpU3RhdGUgPT09IFVJVHlwZS5WRVJUSUNBTCkge1xuICAgICAgdGhpcy5tYXliZUZpbmlzaEFuaW1hdGlvbnNfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEByZXR1cm4geyFQcm9taXNlfSAqL1xuICBiZWZvcmVWaXNpYmxlKCkge1xuICAgIHJldHVybiB0aGlzLm1heWJlQXBwbHlGaXJzdEFuaW1hdGlvbkZyYW1lT3JGaW5pc2goKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHdhaXRGb3JNZWRpYUxheW91dF8oKSB7XG4gICAgY29uc3QgbWVkaWFTZXQgPSB0b0FycmF5KHRoaXMuZ2V0TWVkaWFCeVNlbGVjdG9yXyhTZWxlY3RvcnMuQUxMX0FNUF9NRURJQSkpO1xuXG4gICAgY29uc3QgbWVkaWFQcm9taXNlcyA9IG1lZGlhU2V0Lm1hcCgobWVkaWFFbCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHN3aXRjaCAobWVkaWFFbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICBjYXNlICdhbXAtYW5pbSc6XG4gICAgICAgICAgY2FzZSAnYW1wLWltZyc6XG4gICAgICAgICAgY2FzZSAnYW1wLXN0b3J5LTM2MCc6XG4gICAgICAgICAgICAvLyBEb24ndCBibG9jayBtZWRpYSBsYXlvdXQgb24gYSBmYWxsYmFjayBlbGVtZW50IHRoYXQgd2lsbCBsaWtlbHlcbiAgICAgICAgICAgIC8vIG5ldmVyIGJ1aWxkL2xvYWQuXG4gICAgICAgICAgICBpZiAobWVkaWFFbC5oYXNBdHRyaWJ1dGUoJ2ZhbGxiYWNrJykpIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdoZW5VcGdyYWRlZFRvQ3VzdG9tRWxlbWVudChtZWRpYUVsKVxuICAgICAgICAgICAgICAudGhlbigoZWwpID0+IGVsLnNpZ25hbHMoKS53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuTE9BRF9FTkQpKVxuICAgICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2FtcC1hdWRpbyc6XG4gICAgICAgICAgY2FzZSAnYW1wLXZpZGVvJzpcbiAgICAgICAgICAgIGlmIChtZWRpYUVsLnJlYWR5U3RhdGUgPj0gMikge1xuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWVkaWFFbC5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5JywgcmVzb2x2ZSwgdHJ1ZSAvKiB1c2VDYXB0dXJlICovKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBBbnkgb3RoZXIgdGFncyBzaG91bGQgbm90IGJsb2NrIGxvYWRpbmcuXG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBzdXBwcmVzcyBlcnJvcnMgc28gdGhhdCBQcm9taXNlLmFsbCB3aWxsIHN0aWxsIHdhaXQgZm9yIGFsbFxuICAgICAgICAvLyBwcm9taXNlcyB0byBjb21wbGV0ZSwgZXZlbiBpZiBvbmUgaGFzIGZhaWxlZC4gIFdlIGRvIG5vdGhpbmcgd2l0aCB0aGVcbiAgICAgICAgLy8gZXJyb3IsIGFzIHRoZSByZXNvdXJjZSBpdHNlbGYgYW5kL29yIGNvZGUgdGhhdCBsb2FkcyBpdCBzaG91bGQgaGFuZGxlXG4gICAgICAgIC8vIHRoZSBlcnJvci5cbiAgICAgICAgbWVkaWFFbC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHJlc29sdmUsIHRydWUgLyogdXNlQ2FwdHVyZSAqLyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwobWVkaWFQcm9taXNlcykudGhlbigoKSA9PiB0aGlzLm1hcmtQYWdlQXNMb2FkZWRfKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgd2FpdEZvclBsYXliYWNrTWVkaWFMYXlvdXRfKCkge1xuICAgIGNvbnN0IG1lZGlhU2V0ID0gdG9BcnJheShcbiAgICAgIHRoaXMuZ2V0TWVkaWFCeVNlbGVjdG9yXyhTZWxlY3RvcnMuQUxMX1BMQVlCQUNLX0FNUF9NRURJQSlcbiAgICApO1xuXG4gICAgY29uc3QgbWVkaWFQcm9taXNlcyA9IG1lZGlhU2V0Lm1hcCgobWVkaWFFbCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHN3aXRjaCAobWVkaWFFbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICBjYXNlICdhbXAtYXVkaW8nOlxuICAgICAgICAgIGNhc2UgJ2FtcC12aWRlbyc6XG4gICAgICAgICAgICBjb25zdCBzaWduYWwgPVxuICAgICAgICAgICAgICBtZWRpYUVsLmdldEF0dHJpYnV0ZSgnbGF5b3V0JykgPT09IExheW91dC5OT0RJU1BMQVlcbiAgICAgICAgICAgICAgICA/IENvbW1vblNpZ25hbHMuQlVJTFRcbiAgICAgICAgICAgICAgICA6IENvbW1vblNpZ25hbHMuTE9BRF9FTkQ7XG5cbiAgICAgICAgICAgIHdoZW5VcGdyYWRlZFRvQ3VzdG9tRWxlbWVudChtZWRpYUVsKVxuICAgICAgICAgICAgICAudGhlbigoZWwpID0+IGVsLnNpZ25hbHMoKS53aGVuU2lnbmFsKHNpZ25hbCkpXG4gICAgICAgICAgICAgIC50aGVuKHJlc29sdmUsIHJlc29sdmUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnYXVkaW8nOiAvLyBBbHJlYWR5IGxhaWQgb3V0IGFzIGJ1aWx0IGZyb20gYmFja2dyb3VuZC1hdWRpbyBhdHRyLlxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBBbnkgb3RoZXIgdGFncyBzaG91bGQgbm90IGJsb2NrIGxvYWRpbmcuXG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2JhY2tncm91bmQtYXVkaW8nKSkge1xuICAgICAgbWVkaWFQcm9taXNlcy5wdXNoKHRoaXMuYmFja2dyb3VuZEF1ZGlvRGVmZXJyZWRfLnByb21pc2UpO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLmFsbChtZWRpYVByb21pc2VzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBlbWJlZGRlZCBjb21wb25lbnRzIGluIHBhZ2UgYW5kIHByZXBhcmVzIHRoZW0uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGZvcmNlUmVzaXplXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmaW5kQW5kUHJlcGFyZUVtYmVkZGVkQ29tcG9uZW50c18oZm9yY2VSZXNpemUgPSBmYWxzZSkge1xuICAgIHRoaXMuYWRkQ2xpY2tTaGllbGRUb0VtYmVkZGVkQ29tcG9uZW50c18oKTtcbiAgICB0aGlzLnJlc2l6ZUludGVyYWN0aXZlRW1iZWRkZWRDb21wb25lbnRzXyhmb3JjZVJlc2l6ZSk7XG4gICAgdGhpcy5idWlsZEFmZmlsaWF0ZUxpbmtzXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBwc2V1ZG8gZWxlbWVudCBvbiB0b3Agb2YgdGhlIGVtYmVkIHRvIGJsb2NrIGNsaWNrcyBmcm9tIGdvaW5nIGludG9cbiAgICogdGhlIGlmcmFtZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFkZENsaWNrU2hpZWxkVG9FbWJlZGRlZENvbXBvbmVudHNfKCkge1xuICAgIGNvbnN0IGNvbXBvbmVudEVscyA9IHRvQXJyYXkoXG4gICAgICBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHRoaXMuZWxlbWVudCwgRU1CRURERURfQ09NUE9ORU5UU19TRUxFQ1RPUlMpXG4gICAgKTtcblxuICAgIGlmIChjb21wb25lbnRFbHMubGVuZ3RoIDw9IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgY29tcG9uZW50RWxzLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1lbWJlZGRlZC1jb21wb25lbnQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2l6ZXMgaW50ZXJhY3RpdmUgZW1iZWRzIHRvIHByZXBhcmUgdGhlbSBmb3IgdGhlaXIgZXhwYW5kZWQgYW5pbWF0aW9uLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlUmVzaXplXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZXNpemVJbnRlcmFjdGl2ZUVtYmVkZGVkQ29tcG9uZW50c18oZm9yY2VSZXNpemUpIHtcbiAgICB0b0FycmF5KFxuICAgICAgc2NvcGVkUXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICBJTlRFUkFDVElWRV9FTUJFRERFRF9DT01QT05FTlRTX1NFTEVDVE9SU1xuICAgICAgKVxuICAgICkuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgIGNvbnN0IGRlYm91bmNlUHJlcGFyZUZvckFuaW1hdGlvbiA9IGRlYm91bmNlRW1iZWRSZXNpemUoXG4gICAgICAgIHRoaXMud2luLFxuICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgIHRoaXMubXV0YXRvcl9cbiAgICAgICk7XG5cbiAgICAgIGlmIChmb3JjZVJlc2l6ZSkge1xuICAgICAgICBkZWJvdW5jZVByZXBhcmVGb3JBbmltYXRpb24oZWwsIG51bGwgLyogdW5saXN0ZW4gKi8pO1xuICAgICAgfSBlbHNlIGlmICghZWwuaGFzQXR0cmlidXRlKEVNQkVEX0lEX0FUVFJJQlVURV9OQU1FKSkge1xuICAgICAgICAvLyBFbGVtZW50IGhhcyBub3QgYmVlbiBwcmVwYXJlZCBmb3IgaXRzIGFuaW1hdGlvbiB5ZXQuXG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gbGlzdGVuKGVsLCBBbXBFdmVudHMuU0laRV9DSEFOR0VELCAoKSA9PiB7XG4gICAgICAgICAgZGVib3VuY2VQcmVwYXJlRm9yQW5pbWF0aW9uKGVsLCB1bmxpc3Rlbik7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBSdW4gaW4gY2FzZSB0YXJnZXQgbmV2ZXIgY2hhbmdlcyBzaXplLlxuICAgICAgICBkZWJvdW5jZVByZXBhcmVGb3JBbmltYXRpb24oZWwsIG51bGwgLyogdW5saXN0ZW4gKi8pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGFmZmlsaWF0ZSBsaW5rcy5cbiAgICovXG4gIGJ1aWxkQWZmaWxpYXRlTGlua3NfKCkge1xuICAgIHRvQXJyYXkoXG4gICAgICBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHRoaXMuZWxlbWVudCwgQUZGSUxJQVRFX0xJTktfU0VMRUNUT1IpXG4gICAgKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgY29uc3QgbGluayA9IG5ldyBBbXBTdG9yeUFmZmlsaWF0ZUxpbmsodGhpcy53aW4sIGVsKTtcbiAgICAgIGxpbmsuYnVpbGQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBtYXJrUGFnZUFzTG9hZGVkXygpIHtcbiAgICBkaXNwYXRjaChcbiAgICAgIHRoaXMud2luLFxuICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgRXZlbnRUeXBlLlBBR0VfTE9BREVELFxuICAgICAgLyogcGF5bG9hZCAqLyB1bmRlZmluZWQsXG4gICAgICB7YnViYmxlczogdHJ1ZX1cbiAgICApO1xuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChQQUdFX0xPQURFRF9DTEFTU19OQU1FKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFsbCBtZWRpYSBlbGVtZW50cyBvbiB0aGlzIHBhZ2UuXG4gICAqIEByZXR1cm4geyFBcnJheTw/RWxlbWVudD59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRBbGxNZWRpYV8oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWVkaWFCeVNlbGVjdG9yXyhTZWxlY3RvcnMuQUxMX1BMQVlCQUNLX01FRElBKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFsbCB2aWRlbyBlbGVtZW50cyBvbiB0aGlzIHBhZ2UuXG4gICAqIEByZXR1cm4geyFBcnJheTw/RWxlbWVudD59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRBbGxWaWRlb3NfKCkge1xuICAgIHJldHVybiB0aGlzLmdldE1lZGlhQnlTZWxlY3Rvcl8oU2VsZWN0b3JzLkFMTF9WSURFTyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbGwgYW1wIHZpZGVvIGVsZW1lbnRzIG9uIHRoaXMgcGFnZS5cbiAgICogQHJldHVybiB7IUFycmF5PD9FbGVtZW50Pn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldEFsbEFtcFZpZGVvc18oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWVkaWFCeVNlbGVjdG9yXyhTZWxlY3RvcnMuQUxMX0FNUF9WSURFTyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBtZWRpYSBvbiBwYWdlIGJ5IGdpdmVuIHNlbGVjdG9yLiBGaW5kcyBlbGVtZW50cyB0aHJvdWdoIGZyaWVuZGx5XG4gICAqIGlmcmFtZSAoaWYgb25lIGV4aXN0cykuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvclxuICAgKiBAcmV0dXJuIHshQXJyYXk8P0VsZW1lbnQ+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0TWVkaWFCeVNlbGVjdG9yXyhzZWxlY3Rvcikge1xuICAgIGNvbnN0IGlmcmFtZSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpZnJhbWUnKTtcbiAgICBjb25zdCBmaWUgPVxuICAgICAgaWZyYW1lICYmXG4gICAgICBnZXRGcmllbmRseUlmcmFtZUVtYmVkT3B0aW9uYWwoXG4gICAgICAgIC8qKiBAdHlwZSB7IUhUTUxJRnJhbWVFbGVtZW50fSAqLyAoaWZyYW1lKVxuICAgICAgKTtcbiAgICBjb25zdCBtZWRpYVNldCA9IFtdO1xuXG4gICAgaXRlcmF0ZUN1cnNvcihzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHRoaXMuZWxlbWVudCwgc2VsZWN0b3IpLCAoZWwpID0+XG4gICAgICBtZWRpYVNldC5wdXNoKGVsKVxuICAgICk7XG5cbiAgICBpZiAoZmllKSB7XG4gICAgICBpdGVyYXRlQ3Vyc29yKFxuICAgICAgICBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgIGZpZS53aW4uZG9jdW1lbnQuYm9keSxcbiAgICAgICAgICBTZWxlY3RvcnMuQUxMX0lGUkFNRURfTUVESUFcbiAgICAgICAgKSxcbiAgICAgICAgKGVsKSA9PiBtZWRpYVNldC5wdXNoKGVsKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVkaWFTZXQ7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IVByb21pc2U8Ym9vbGVhbj59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpc0F1dG9wbGF5U3VwcG9ydGVkXygpIHtcbiAgICByZXR1cm4gaXNBdXRvcGxheVN1cHBvcnRlZCh0aGlzLndpbik7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyB0aGUgc3BlY2lmaWVkIGNhbGxiYWNrIHRvIGVhY2ggbWVkaWEgZWxlbWVudCBvbiB0aGUgcGFnZSwgYWZ0ZXIgdGhlXG4gICAqIG1lZGlhIGVsZW1lbnQgaXMgbG9hZGVkLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCEuL21lZGlhLXBvb2wuTWVkaWFQb29sLCAhRWxlbWVudCl9IGNhbGxiYWNrRm4gVGhlXG4gICAqICAgICBjYWxsYmFjayB0byBiZSBhcHBsaWVkIHRvIGVhY2ggbWVkaWEgZWxlbWVudC5cbiAgICogQHJldHVybiB7IVByb21pc2V9IFByb21pc2UgdGhhdCByZXNvbHZlcyBhZnRlciB0aGUgY2FsbGJhY2tzIGFyZSBjYWxsZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB3aGVuQWxsTWVkaWFFbGVtZW50c18oY2FsbGJhY2tGbikge1xuICAgIGNvbnN0IG1lZGlhU2V0ID0gdG9BcnJheSh0aGlzLmdldEFsbE1lZGlhXygpKTtcblxuICAgIHJldHVybiB0aGlzLm1lZGlhUG9vbFByb21pc2VfLnRoZW4oKG1lZGlhUG9vbCkgPT4ge1xuICAgICAgY29uc3QgcHJvbWlzZXMgPSBtZWRpYVNldC5tYXAoKG1lZGlhRWwpID0+IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrRm4obWVkaWFQb29sLCBkZXYoKS5hc3NlcnRFbGVtZW50KG1lZGlhRWwpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdXNlcyBhbGwgbWVkaWEgb24gdGhpcyBwYWdlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSByZXdpbmRUb0JlZ2lubmluZyBXaGV0aGVyIHRvIHJld2luZCB0aGUgY3VycmVudFRpbWVcbiAgICogICAgIG9mIG1lZGlhIGl0ZW1zIHRvIHRoZSBiZWdpbm5pbmcuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgYWZ0ZXIgdGhlIGNhbGxiYWNrcyBhcmUgY2FsbGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcGF1c2VBbGxNZWRpYV8ocmV3aW5kVG9CZWdpbm5pbmcgPSBmYWxzZSkge1xuICAgIHJldHVybiB0aGlzLndoZW5BbGxNZWRpYUVsZW1lbnRzXygobWVkaWFQb29sLCBtZWRpYUVsKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5wYXVzZU1lZGlhXyhcbiAgICAgICAgbWVkaWFQb29sLFxuICAgICAgICBtZWRpYUVsLFxuICAgICAgICAvKiogQHR5cGUge2Jvb2xlYW59ICovIChyZXdpbmRUb0JlZ2lubmluZylcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2VzIHRoZSBnaXZlbiBtZWRpYS5cbiAgICogQHBhcmFtIHshLi9tZWRpYS1wb29sLk1lZGlhUG9vbH0gbWVkaWFQb29sXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IG1lZGlhRWxcbiAgICogQHBhcmFtIHtib29sZWFufSByZXdpbmRUb0JlZ2lubmluZyBXaGV0aGVyIHRvIHJld2luZCB0aGUgY3VycmVudFRpbWVcbiAgICogICAgIG9mIG1lZGlhIGl0ZW1zIHRvIHRoZSBiZWdpbm5pbmcuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgYWZ0ZXIgdGhlIG1lZGlhIGlzIHBhdXNlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHBhdXNlTWVkaWFfKG1lZGlhUG9vbCwgbWVkaWFFbCwgcmV3aW5kVG9CZWdpbm5pbmcpIHtcbiAgICBpZiAodGhpcy5pc0JvdFVzZXJBZ2VudF8pIHtcbiAgICAgIG1lZGlhRWwucGF1c2UoKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1lZGlhUG9vbC5wYXVzZShcbiAgICAgICAgLyoqIEB0eXBlIHshLi9tZWRpYS1wb29sLkRvbUVsZW1lbnREZWZ9ICovIChtZWRpYUVsKSxcbiAgICAgICAgcmV3aW5kVG9CZWdpbm5pbmdcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBsYXlzIGFsbCBtZWRpYSBvbiB0aGlzIHBhZ2UuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgYWZ0ZXIgdGhlIGNhbGxiYWNrcyBhcmUgY2FsbGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcGxheUFsbE1lZGlhXygpIHtcbiAgICByZXR1cm4gdGhpcy53aGVuQWxsTWVkaWFFbGVtZW50c18oKG1lZGlhUG9vbCwgbWVkaWFFbCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMucGxheU1lZGlhXyhtZWRpYVBvb2wsIG1lZGlhRWwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBsYXlzIHRoZSBnaXZlbiBtZWRpYS5cbiAgICogQHBhcmFtIHshLi9tZWRpYS1wb29sLk1lZGlhUG9vbH0gbWVkaWFQb29sXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IG1lZGlhRWxcbiAgICogQHJldHVybiB7IVByb21pc2V9IFByb21pc2UgdGhhdCByZXNvbHZlcyBhZnRlciB0aGUgbWVkaWEgaXMgcGxheWVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcGxheU1lZGlhXyhtZWRpYVBvb2wsIG1lZGlhRWwpIHtcbiAgICBpZiAodGhpcy5pc0JvdFVzZXJBZ2VudF8pIHtcbiAgICAgIG1lZGlhRWwucGxheSgpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2FkUHJvbWlzZShtZWRpYUVsKS50aGVuKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1lZGlhUG9vbFxuICAgICAgICAgICAgLnBsYXkoLyoqIEB0eXBlIHshLi9tZWRpYS1wb29sLkRvbUVsZW1lbnREZWZ9ICovIChtZWRpYUVsKSlcbiAgICAgICAgICAgIC5jYXRjaCgodW51c2VkRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgLy8gQXV0byBwbGF5aW5nIHRoZSBtZWRpYSBmYWlsZWQsIHdoaWNoIGNvdWxkIGJlIGNhdXNlZCBieSBhIGRhdGFcbiAgICAgICAgICAgICAgLy8gc2F2ZXIsIG9yIGEgYmF0dGVyeSBzYXZpbmcgbW9kZS4gRGlzcGxheSBhIG1lc3NhZ2Ugc28gd2UgY2FuXG4gICAgICAgICAgICAgIC8vIGdldCBhIHVzZXIgZ2VzdHVyZSB0byBibGVzcyB0aGUgbWVkaWEgZWxlbWVudHMsIGFuZCBwbGF5IHRoZW0uXG4gICAgICAgICAgICAgIGlmIChtZWRpYUVsLnRhZ05hbWUgPT09ICdWSURFTycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlYm91bmNlVG9nZ2xlTG9hZGluZ1NwaW5uZXJfKGZhbHNlKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIGF1dG9wbGF5IGdvdCByZWplY3RlZCwgZGlzcGxheSBhIFwicGxheVwiIGJ1dHRvbi4gSWZcbiAgICAgICAgICAgICAgICAvLyBhdXRvcGxheSB3YXMgc3VwcG9ydGVkLCBkaXNwYXkgYW4gZXJyb3IgbWVzc2FnZS5cbiAgICAgICAgICAgICAgICB0aGlzLmlzQXV0b3BsYXlTdXBwb3J0ZWRfKCkudGhlbigoaXNBdXRvcGxheVN1cHBvcnRlZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGlzQXV0b3BsYXlTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVFcnJvck1lc3NhZ2VfKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIEVycm9yIHdhcyBleHBlY3RlZCwgZG9uJ3Qgc2VuZCB0aGUgcGVyZm9ybWFuY2UgbWV0cmljcy5cbiAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcE1lYXN1cmluZ0FsbFZpZGVvUGVyZm9ybWFuY2VfKFxuICAgICAgICAgICAgICAgICAgICBmYWxzZSAvKiogc2VuZE1ldHJpY3MgKi9cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZVBsYXlNZXNzYWdlXyh0cnVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChtZWRpYUVsLnRhZ05hbWUgPT09ICdBVURJTycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXlBdWRpb0VsZW1lbnRGcm9tVGltZXN0YW1wXyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kZWJvdW5jZVRvZ2dsZUxvYWRpbmdTcGlubmVyXyhmYWxzZSk7XG4gICAgICAgICAgdGhpcy50b2dnbGVFcnJvck1lc3NhZ2VfKHRydWUpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVsb2FkcyBhbGwgbWVkaWEgb24gdGhpcyBwYWdlLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gUHJvbWlzZSB0aGF0IHJlc29sdmVzIGFmdGVyIHRoZSBjYWxsYmFja3MgYXJlIGNhbGxlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByZWxvYWRBbGxNZWRpYV8oKSB7XG4gICAgcmV0dXJuIHRoaXMud2hlbkFsbE1lZGlhRWxlbWVudHNfKChtZWRpYVBvb2wsIG1lZGlhRWwpID0+XG4gICAgICB0aGlzLnByZWxvYWRNZWRpYV8obWVkaWFQb29sLCBtZWRpYUVsKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUHJlbG9hZHMgdGhlIGdpdmVuIG1lZGlhLlxuICAgKiBAcGFyYW0geyEuL21lZGlhLXBvb2wuTWVkaWFQb29sfSBtZWRpYVBvb2xcbiAgICogQHBhcmFtIHshRWxlbWVudH0gbWVkaWFFbFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhRWxlbWVudHx1bmRlZmluZWQ+fSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgcHJlbG9hZGluZyBlbGVtZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJlbG9hZE1lZGlhXyhtZWRpYVBvb2wsIG1lZGlhRWwpIHtcbiAgICBpZiAodGhpcy5pc0JvdFVzZXJBZ2VudF8pIHtcbiAgICAgIC8vIE5vLW9wLlxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWVkaWFQb29sLnByZWxvYWQoXG4gICAgICAgIC8qKiBAdHlwZSB7IS4vbWVkaWEtcG9vbC5Eb21FbGVtZW50RGVmfSAqLyAobWVkaWFFbClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE11dGVzIGFsbCBtZWRpYSBvbiB0aGlzIHBhZ2UuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgYWZ0ZXIgdGhlIGNhbGxiYWNrcyBhcmUgY2FsbGVkLlxuICAgKi9cbiAgbXV0ZUFsbE1lZGlhKCkge1xuICAgIHJldHVybiB0aGlzLndoZW5BbGxNZWRpYUVsZW1lbnRzXygobWVkaWFQb29sLCBtZWRpYUVsKSA9PiB7XG4gICAgICB0aGlzLm11dGVNZWRpYV8obWVkaWFQb29sLCBtZWRpYUVsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdXRlcyB0aGUgZ2l2ZW4gbWVkaWEuXG4gICAqIEBwYXJhbSB7IS4vbWVkaWEtcG9vbC5NZWRpYVBvb2x9IG1lZGlhUG9vbFxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBtZWRpYUVsXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgYWZ0ZXIgdGhlIG1lZGlhIGlzIG11dGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbXV0ZU1lZGlhXyhtZWRpYVBvb2wsIG1lZGlhRWwpIHtcbiAgICBpZiAodGhpcy5pc0JvdFVzZXJBZ2VudF8pIHtcbiAgICAgIG1lZGlhRWwubXV0ZWQgPSB0cnVlO1xuICAgICAgbWVkaWFFbC5zZXRBdHRyaWJ1dGUoJ211dGVkJywgJycpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWVkaWFQb29sLm11dGUoXG4gICAgICAgIC8qKiBAdHlwZSB7IS4vbWVkaWEtcG9vbC5Eb21FbGVtZW50RGVmfSAqLyAobWVkaWFFbClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVubXV0ZXMgYWxsIG1lZGlhIG9uIHRoaXMgcGFnZS5cbiAgICogQHJldHVybiB7IVByb21pc2V9IFByb21pc2UgdGhhdCByZXNvbHZlcyBhZnRlciB0aGUgY2FsbGJhY2tzIGFyZSBjYWxsZWQuXG4gICAqL1xuICB1bm11dGVBbGxNZWRpYSgpIHtcbiAgICByZXR1cm4gdGhpcy53aGVuQWxsTWVkaWFFbGVtZW50c18oKG1lZGlhUG9vbCwgbWVkaWFFbCkgPT4ge1xuICAgICAgdGhpcy51bm11dGVNZWRpYV8obWVkaWFQb29sLCBtZWRpYUVsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbm11dGVzIHRoZSBnaXZlbiBtZWRpYS5cbiAgICogQHBhcmFtIHshLi9tZWRpYS1wb29sLk1lZGlhUG9vbH0gbWVkaWFQb29sXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IG1lZGlhRWxcbiAgICogQHJldHVybiB7IVByb21pc2V9IFByb21pc2UgdGhhdCByZXNvbHZlcyBhZnRlciB0aGUgbWVkaWEgaXMgdW5tdXRlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVubXV0ZU1lZGlhXyhtZWRpYVBvb2wsIG1lZGlhRWwpIHtcbiAgICBpZiAodGhpcy5pc0JvdFVzZXJBZ2VudF8pIHtcbiAgICAgIG1lZGlhRWwubXV0ZWQgPSBmYWxzZTtcbiAgICAgIG1lZGlhRWwucmVtb3ZlQXR0cmlidXRlKCdtdXRlZCcpO1xuICAgICAgaWYgKG1lZGlhRWwudGFnTmFtZSA9PT0gJ0FVRElPJyAmJiBtZWRpYUVsLnBhdXNlZCkge1xuICAgICAgICBtZWRpYUVsLnBsYXkoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWVkaWFFbCA9IC8qKiBAdHlwZSB7IS4vbWVkaWEtcG9vbC5Eb21FbGVtZW50RGVmfSAqLyAobWVkaWFFbCk7XG4gICAgICBjb25zdCBwcm9taXNlcyA9IFttZWRpYVBvb2wudW5tdXRlKG1lZGlhRWwpXTtcblxuICAgICAgLy8gQXVkaW8gZWxlbWVudCBtaWdodCBub3QgYmUgcGxheWluZyBpZiB0aGUgcGFnZSBuYXZpZ2F0aW9uIGRpZCBub3RcbiAgICAgIC8vIGhhcHBlbiBhZnRlciBhIHVzZXIgaW50ZW50LCBhbmQgdGhlIG1lZGlhIGVsZW1lbnQgd2FzIG5vdCBcImJsZXNzZWRcIi5cbiAgICAgIC8vIE9uIHVubXV0ZSwgbWFrZSBzdXJlIHRoaXMgYXVkaW8gZWxlbWVudCBpcyBwbGF5aW5nLCBhdCB0aGUgZXhwZWN0ZWRcbiAgICAgIC8vIGN1cnJlbnRUaW1lLlxuICAgICAgaWYgKFxuICAgICAgICBtZWRpYUVsLnRhZ05hbWUgPT09ICdBVURJTycgJiZcbiAgICAgICAgbWVkaWFFbC5wYXVzZWQgJiZcbiAgICAgICAgdGhpcy5wbGF5QXVkaW9FbGVtZW50RnJvbVRpbWVzdGFtcF9cbiAgICAgICkge1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9XG4gICAgICAgICAgKERhdGUubm93KCkgLSB0aGlzLnBsYXlBdWRpb0VsZW1lbnRGcm9tVGltZXN0YW1wXykgLyAxMDAwO1xuICAgICAgICBpZiAobWVkaWFFbC5oYXNBdHRyaWJ1dGUoJ2xvb3AnKSB8fCBjdXJyZW50VGltZSA8IG1lZGlhRWwuZHVyYXRpb24pIHtcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKFxuICAgICAgICAgICAgbWVkaWFQb29sLnNldEN1cnJlbnRUaW1lKG1lZGlhRWwsIGN1cnJlbnRUaW1lICUgbWVkaWFFbC5kdXJhdGlvbilcbiAgICAgICAgICApO1xuICAgICAgICAgIHByb21pc2VzLnB1c2gobWVkaWFQb29sLnBsYXkobWVkaWFFbCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wbGF5QXVkaW9FbGVtZW50RnJvbVRpbWVzdGFtcF8gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYWxsIG1lZGlhIG9uIHRoaXMgcGFnZS5cbiAgICogQHJldHVybiB7IVByb21pc2V9IFByb21pc2UgdGhhdCByZXNvbHZlcyBhZnRlciB0aGUgY2FsbGJhY2tzIGFyZSBjYWxsZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZWdpc3RlckFsbE1lZGlhXygpIHtcbiAgICBpZiAoIXRoaXMucmVnaXN0ZXJBbGxNZWRpYVByb21pc2VfKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyQWxsTWVkaWFQcm9taXNlXyA9IHRoaXMud2FpdEZvclBsYXliYWNrTWVkaWFMYXlvdXRfKCkudGhlbihcbiAgICAgICAgKCkgPT4gdGhpcy53aGVuQWxsTWVkaWFFbGVtZW50c18oKHAsIGUpID0+IHRoaXMucmVnaXN0ZXJNZWRpYV8ocCwgZSkpXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyQWxsTWVkaWFQcm9taXNlXztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIGdpdmVuIG1lZGlhLlxuICAgKiBAcGFyYW0geyEuL21lZGlhLXBvb2wuTWVkaWFQb29sfSBtZWRpYVBvb2xcbiAgICogQHBhcmFtIHshRWxlbWVudH0gbWVkaWFFbFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gUHJvbWlzZSB0aGF0IHJlc29sdmVzIGFmdGVyIHRoZSBtZWRpYSBpcyByZWdpc3RlcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVnaXN0ZXJNZWRpYV8obWVkaWFQb29sLCBtZWRpYUVsKSB7XG4gICAgaWYgKHRoaXMuaXNCb3RVc2VyQWdlbnRfKSB7XG4gICAgICAvLyBOby1vcC5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1lZGlhUG9vbC5yZWdpc3RlcihcbiAgICAgICAgLyoqIEB0eXBlIHshLi9tZWRpYS1wb29sLkRvbUVsZW1lbnREZWZ9ICovIChtZWRpYUVsKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV3aW5kcyBhbGwgbWVkaWEgb24gdGhpcyBwYWdlLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gUHJvbWlzZSB0aGF0IHJlc29sdmVzIGFmdGVyIHRoZSBjYWxsYmFja3MgYXJlIGNhbGxlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJld2luZEFsbE1lZGlhXygpIHtcbiAgICByZXR1cm4gdGhpcy53aGVuQWxsTWVkaWFFbGVtZW50c18oKG1lZGlhUG9vbCwgbWVkaWFFbCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNCb3RVc2VyQWdlbnRfKSB7XG4gICAgICAgIG1lZGlhRWwuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbWVkaWFQb29sLnJld2luZFRvQmVnaW5uaW5nKFxuICAgICAgICAgIC8qKiBAdHlwZSB7IS4vbWVkaWEtcG9vbC5Eb21FbGVtZW50RGVmfSAqLyAobWVkaWFFbClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgcGxheWluZyBhbmltYXRpb25zLCBpZiB0aGUgYW5pbWF0aW9uIG1hbmFnZXIgaXMgYXZhaWxhYmxlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWF5YmVTdGFydEFuaW1hdGlvbnNfKCkge1xuICAgIGlmICghdGhpcy5hbmltYXRpb25NYW5hZ2VyXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmFuaW1hdGlvbk1hbmFnZXJfLmFuaW1hdGVJbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmlzaGVzIHBsYXlpbmcgYW5pbWF0aW9ucyBpbnN0YW50bHksIGlmIHRoZSBhbmltYXRpb24gbWFuYWdlciBpc1xuICAgKiBhdmFpbGFibGUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtYXliZUZpbmlzaEFuaW1hdGlvbnNfKCkge1xuICAgIGlmICghdGhpcy5hbmltYXRpb25NYW5hZ2VyXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNpZ25hbHMoKVxuICAgICAgLndoZW5TaWduYWwoQ29tbW9uU2lnbmFscy5MT0FEX0VORClcbiAgICAgIC50aGVuKCgpID0+IHRoaXMuYW5pbWF0aW9uTWFuYWdlcl8uYXBwbHlMYXN0RnJhbWUoKSk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBtYXliZUFwcGx5Rmlyc3RBbmltYXRpb25GcmFtZU9yRmluaXNoKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5hbmltYXRpb25NYW5hZ2VyXz8uYXBwbHlGaXJzdEZyYW1lT3JGaW5pc2goKSk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgZGlzdGFuY2UgZnJvbSB0aGUgY3VycmVudCBwYWdlIHRvIHRoZSBhY3RpdmUgcGFnZS5cbiAgICovXG4gIGdldERpc3RhbmNlKCkge1xuICAgIHJldHVybiBwYXJzZUludCh0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkaXN0YW5jZScpLCAxMCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIFRoZSBkaXN0YW5jZSBmcm9tIHRoZSBjdXJyZW50IHBhZ2UgdG8gdGhlIGFjdGl2ZVxuICAgKiAgICAgcGFnZS5cbiAgICovXG4gIHNldERpc3RhbmNlKGRpc3RhbmNlKSB7XG4gICAgLy8gVE9ETyhjY29yZHJ5KSByZWZhY3RvciB0aGlzIHdoZW4gcGFnZXMgYXJlIG1hbmFnZWRcbiAgICBpZiAodGhpcy5pc0FkKCkpIHtcbiAgICAgIGRpc3RhbmNlID0gTWF0aC5taW4oZGlzdGFuY2UsIDIpO1xuICAgIH1cbiAgICBpZiAoZGlzdGFuY2UgPT0gdGhpcy5nZXREaXN0YW5jZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnZGlzdGFuY2UnLCBkaXN0YW5jZSk7XG4gICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCBkaXN0YW5jZSAhPSAwKTtcblxuICAgIGNvbnN0IHJlZ2lzdGVyQWxsUHJvbWlzZSA9IHRoaXMucmVnaXN0ZXJBbGxNZWRpYV8oKTtcblxuICAgIGlmIChkaXN0YW5jZSA+IDAgJiYgZGlzdGFuY2UgPD0gMikge1xuICAgICAgdGhpcy5maW5kQW5kUHJlcGFyZUVtYmVkZGVkQ29tcG9uZW50c18oKTtcbiAgICAgIHJlZ2lzdGVyQWxsUHJvbWlzZS50aGVuKCgpID0+IHRoaXMucHJlbG9hZEFsbE1lZGlhXygpKTtcbiAgICB9XG4gICAgdGhpcy50b2dnbGVUYWJiYWJsZUVsZW1lbnRzXyhkaXN0YW5jZSA9PSAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRoaXMgcGFnZSBpcyBjdXJyZW50bHkgYWN0aXZlLlxuICAgKi9cbiAgaXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FjdGl2ZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIGFuIGV2ZW50IGluZGljYXRpbmcgdGhhdCB0aGUgcHJvZ3Jlc3Mgb2YgdGhlIGN1cnJlbnQgcGFnZSBoYXMgY2hhbmdlZFxuICAgKiB0byB0aGUgc3BlY2lmaWVkIHZhbHVlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcHJvZ3Jlc3MgVGhlIHByb2dyZXNzIGZyb20gMC4wIHRvIDEuMC5cbiAgICovXG4gIGVtaXRQcm9ncmVzc18ocHJvZ3Jlc3MpIHtcbiAgICAvLyBEb24ndCBlbWl0IHByb2dyZXNzIGZvciBhZHMsIHNpbmNlIHRoZSBwcm9ncmVzcyBiYXIgaXMgaGlkZGVuLlxuICAgIC8vIERvbid0IGVtaXQgcHJvZ3Jlc3MgZm9yIGluYWN0aXZlIHBhZ2VzLCBiZWNhdXNlIHJhY2UgY29uZGl0aW9ucy5cbiAgICBpZiAodGhpcy5pc0FkKCkgfHwgdGhpcy5zdGF0ZV8gPT09IFBhZ2VTdGF0ZS5OT1RfQUNUSVZFKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGF5bG9hZCA9IGRpY3Qoe1xuICAgICAgJ3BhZ2VJZCc6IHRoaXMuZWxlbWVudC5pZCxcbiAgICAgICdwcm9ncmVzcyc6IHByb2dyZXNzLFxuICAgIH0pO1xuICAgIGNvbnN0IGV2ZW50SW5pdCA9IHtidWJibGVzOiB0cnVlfTtcbiAgICBkaXNwYXRjaChcbiAgICAgIHRoaXMud2luLFxuICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgRXZlbnRUeXBlLlBBR0VfUFJPR1JFU1MsXG4gICAgICBwYXlsb2FkLFxuICAgICAgZXZlbnRJbml0XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBvZiB0aGUgcGFnZXMgdGhhdCBhcmUgb25lIGhvcCBmcm9tIHRoaXMgcGFnZS5cbiAgICogQHJldHVybiB7IUFycmF5PHN0cmluZz59XG4gICAqL1xuICBnZXRBZGphY2VudFBhZ2VJZHMoKSB7XG4gICAgY29uc3QgYWRqYWNlbnRQYWdlSWRzID0gaXNFeHBlcmltZW50T24odGhpcy53aW4sICdhbXAtc3RvcnktYnJhbmNoaW5nJylcbiAgICAgID8gdGhpcy5hY3Rpb25zXygpXG4gICAgICA6IFtdO1xuXG4gICAgY29uc3QgYXV0b0FkdmFuY2VOZXh0ID0gdGhpcy5nZXROZXh0UGFnZUlkKFxuICAgICAgdHJ1ZSAvKiBvcHRfaXNBdXRvbWF0aWNBZHZhbmNlICovXG4gICAgKTtcbiAgICBjb25zdCBtYW51YWxBZHZhbmNlTmV4dCA9IHRoaXMuZ2V0TmV4dFBhZ2VJZChcbiAgICAgIGZhbHNlIC8qIG9wdF9pc0F1dG9tYXRpY0FkdmFuY2UgKi9cbiAgICApO1xuICAgIGNvbnN0IHByZXZpb3VzID0gdGhpcy5nZXRQcmV2aW91c1BhZ2VJZCgpO1xuXG4gICAgaWYgKGF1dG9BZHZhbmNlTmV4dCkge1xuICAgICAgYWRqYWNlbnRQYWdlSWRzLnB1c2goYXV0b0FkdmFuY2VOZXh0KTtcbiAgICB9XG5cbiAgICBpZiAobWFudWFsQWR2YW5jZU5leHQgJiYgbWFudWFsQWR2YW5jZU5leHQgIT0gYXV0b0FkdmFuY2VOZXh0KSB7XG4gICAgICBhZGphY2VudFBhZ2VJZHMucHVzaChtYW51YWxBZHZhbmNlTmV4dCk7XG4gICAgfVxuXG4gICAgaWYgKHByZXZpb3VzKSB7XG4gICAgICBhZGphY2VudFBhZ2VJZHMucHVzaChwcmV2aW91cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFkamFjZW50UGFnZUlkcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBJRCBvZiB0aGUgcHJldmlvdXMgcGFnZSBpbiB0aGUgc3RvcnkgKGJlZm9yZSB0aGUgY3VycmVudCBwYWdlKS5cbiAgICogQHJldHVybiB7P3N0cmluZ30gUmV0dXJucyB0aGUgSUQgb2YgdGhlIG5leHQgcGFnZSBpbiB0aGUgc3RvcnksIG9yIG51bGwgaWZcbiAgICogICAgIHRoZXJlIGlzbid0IG9uZS5cbiAgICovXG4gIGdldFByZXZpb3VzUGFnZUlkKCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdpLWFtcGh0bWwtcmV0dXJuLXRvJykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpLWFtcGh0bWwtcmV0dXJuLXRvJyk7XG4gICAgfVxuXG4gICAgY29uc3QgbmF2aWdhdGlvblBhdGggPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFxuICAgICAgU3RhdGVQcm9wZXJ0eS5OQVZJR0FUSU9OX1BBVEhcbiAgICApO1xuXG4gICAgY29uc3QgcGFnZVBhdGhJbmRleCA9IG5hdmlnYXRpb25QYXRoLmxhc3RJbmRleE9mKHRoaXMuZWxlbWVudC5pZCk7XG4gICAgY29uc3QgcHJldmlvdXNQYWdlSWQgPSBuYXZpZ2F0aW9uUGF0aFtwYWdlUGF0aEluZGV4IC0gMV07XG5cbiAgICBpZiAocHJldmlvdXNQYWdlSWQpIHtcbiAgICAgIHJldHVybiBwcmV2aW91c1BhZ2VJZDtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcGFnZSB3YXMgbG9hZGVkIHdpdGggYSBgI3BhZ2U9Zm9vYCBoYXNoLCBpdCBjb3VsZCBoYXZlIG5vXG4gICAgLy8gbmF2aWdhdGlvbiBwYXRoIGJ1dCBzdGlsbCBhIHByZXZpb3VzIHBhZ2UgaW4gdGhlIERPTS5cbiAgICBjb25zdCBwcmV2aW91c0VsZW1lbnQgPSB0aGlzLmVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICBpZiAocHJldmlvdXNFbGVtZW50ICYmIHByZXZpb3VzRWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFRBRykge1xuICAgICAgcmV0dXJuIHByZXZpb3VzRWxlbWVudC5pZDtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBJRCBvZiB0aGUgbmV4dCBwYWdlIGluIHRoZSBzdG9yeSAoYWZ0ZXIgdGhlIGN1cnJlbnQgcGFnZSkuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGlzQXV0b21hdGljQWR2YW5jZSBXaGV0aGVyIHRoaXMgbmF2aWdhdGlvbiB3YXMgY2F1c2VkXG4gICAqICAgICBieSBhbiBhdXRvbWF0aWMgYWR2YW5jZW1lbnQgYWZ0ZXIgYSB0aW1lb3V0LlxuICAgKiBAcmV0dXJuIHs/c3RyaW5nfSBSZXR1cm5zIHRoZSBJRCBvZiB0aGUgbmV4dCBwYWdlIGluIHRoZSBzdG9yeSwgb3IgbnVsbCBpZlxuICAgKiAgICAgdGhlcmUgaXNuJ3Qgb25lLlxuICAgKi9cbiAgZ2V0TmV4dFBhZ2VJZChpc0F1dG9tYXRpY0FkdmFuY2UgPSBmYWxzZSkge1xuICAgIGlmIChpc0F1dG9tYXRpY0FkdmFuY2UgJiYgdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYXV0by1hZHZhbmNlLXRvJykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhdXRvLWFkdmFuY2UtdG8nKTtcbiAgICB9XG5cbiAgICBjb25zdCBhZHZhbmNlQXR0ciA9IGlzRXhwZXJpbWVudE9uKHRoaXMud2luLCAnYW1wLXN0b3J5LWJyYW5jaGluZycpXG4gICAgICA/ICdhZHZhbmNlLXRvJ1xuICAgICAgOiAnaS1hbXBodG1sLWFkdmFuY2UtdG8nO1xuXG4gICAgaWYgKHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoYWR2YW5jZUF0dHIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShhZHZhbmNlQXR0cik7XG4gICAgfVxuICAgIGNvbnN0IG5leHRFbGVtZW50ID0gdGhpcy5lbGVtZW50Lm5leHRFbGVtZW50U2libGluZztcbiAgICBpZiAobmV4dEVsZW1lbnQgJiYgbmV4dEVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBUQUcpIHtcbiAgICAgIHJldHVybiBuZXh0RWxlbWVudC5pZDtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbnkgZWxlbWVudHMgaW4gdGhlIHBhZ2UgdGhhdCBoYXMgYSBnb1RvUGFnZSBhY3Rpb24uXG4gICAqIEByZXR1cm4geyFBcnJheTxzdHJpbmc+fSBUaGUgSURzIG9mIHRoZSBwb3RlbnRpYWwgbmV4dCBwYWdlcyBpbiB0aGUgc3RvcnlcbiAgICogb3IgbnVsbCBpZiB0aGVyZSBhcmVuJ3QgYW55LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWN0aW9uc18oKSB7XG4gICAgY29uc3QgYWN0aW9uRWxlbWVudHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcbiAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbb24qPWdvVG9QYWdlXScpXG4gICAgKTtcblxuICAgIGNvbnN0IGFjdGlvbkF0dHJzID0gYWN0aW9uRWxlbWVudHMubWFwKChhY3Rpb24pID0+XG4gICAgICBhY3Rpb24uZ2V0QXR0cmlidXRlKCdvbicpXG4gICAgKTtcblxuICAgIHJldHVybiBhY3Rpb25BdHRycy5yZWR1Y2UoKHJlcywgYWN0aW9ucykgPT4ge1xuICAgICAgLy8gSGFuZGxpbmcgZm9yIG11bHRpcGxlIGFjdGlvbnMgb24gb25lIGV2ZW50IG9yIG11bHRpcGxlIGV2ZW50cy5cbiAgICAgIGNvbnN0IGFjdGlvbkxpc3QgPSAvKiogQHR5cGUgeyFBcnJheX0gKi8gKGFjdGlvbnMuc3BsaXQoL1s7LF0rLykpO1xuICAgICAgYWN0aW9uTGlzdC5mb3JFYWNoKChhY3Rpb24pID0+IHtcbiAgICAgICAgaWYgKGFjdGlvbi5pbmRleE9mKCdnb1RvUGFnZScpID49IDApIHtcbiAgICAgICAgICAvLyBUaGUgcGFnZUlkIGlzIGluIGJldHdlZW4gdGhlIGVxdWFscyBzaWduICYgY2xvc2luZyBwYXJlbnRoZXNpcy5cbiAgICAgICAgICByZXMucHVzaChhY3Rpb24uc2xpY2UoYWN0aW9uLnNlYXJjaCgnPSguKiknKSArIDEsIC0xKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9LCBbXSk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIHRvIHRoZSBwcmV2aW91cyBwYWdlIGluIHRoZSBzdG9yeS5cbiAgICovXG4gIHByZXZpb3VzKCkge1xuICAgIGNvbnN0IHBhZ2VJZCA9IHRoaXMuZ2V0UHJldmlvdXNQYWdlSWQoKTtcblxuICAgIGlmIChwYWdlSWQgPT09IG51bGwpIHtcbiAgICAgIGRpc3BhdGNoKFxuICAgICAgICB0aGlzLndpbixcbiAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICBFdmVudFR5cGUuTk9fUFJFVklPVVNfUEFHRSxcbiAgICAgICAgLyogcGF5bG9hZCAqLyB1bmRlZmluZWQsXG4gICAgICAgIHtidWJibGVzOiB0cnVlfVxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9QQVVTRUQsIGZhbHNlKTtcbiAgICB0aGlzLnN3aXRjaFRvXyhwYWdlSWQsIE5hdmlnYXRpb25EaXJlY3Rpb24uUFJFVklPVVMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyB0byB0aGUgbmV4dCBwYWdlIGluIHRoZSBzdG9yeS5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gaXNBdXRvbWF0aWNBZHZhbmNlIFdoZXRoZXIgdGhpcyBuYXZpZ2F0aW9uIHdhcyBjYXVzZWRcbiAgICogICAgIGJ5IGFuIGF1dG9tYXRpYyBhZHZhbmNlbWVudCBhZnRlciBhIHRpbWVvdXQuXG4gICAqL1xuICBuZXh0KGlzQXV0b21hdGljQWR2YW5jZSA9IGZhbHNlKSB7XG4gICAgY29uc3QgcGFnZUlkID0gdGhpcy5nZXROZXh0UGFnZUlkKGlzQXV0b21hdGljQWR2YW5jZSk7XG5cbiAgICBpZiAoIXBhZ2VJZCkge1xuICAgICAgZGlzcGF0Y2goXG4gICAgICAgIHRoaXMud2luLFxuICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgIEV2ZW50VHlwZS5OT19ORVhUX1BBR0UsXG4gICAgICAgIC8qIHBheWxvYWQgKi8gdW5kZWZpbmVkLFxuICAgICAgICB7YnViYmxlczogdHJ1ZX1cbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfUEFVU0VELCBmYWxzZSk7XG4gICAgdGhpcy5zd2l0Y2hUb18ocGFnZUlkLCBOYXZpZ2F0aW9uRGlyZWN0aW9uLk5FWFQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXRQYWdlSWRcbiAgICogQHBhcmFtIHshTmF2aWdhdGlvbkRpcmVjdGlvbn0gZGlyZWN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzd2l0Y2hUb18odGFyZ2V0UGFnZUlkLCBkaXJlY3Rpb24pIHtcbiAgICBjb25zdCBwYXlsb2FkID0gZGljdCh7XG4gICAgICAndGFyZ2V0UGFnZUlkJzogdGFyZ2V0UGFnZUlkLFxuICAgICAgJ2RpcmVjdGlvbic6IGRpcmVjdGlvbixcbiAgICB9KTtcbiAgICBjb25zdCBldmVudEluaXQgPSB7YnViYmxlczogdHJ1ZX07XG4gICAgZGlzcGF0Y2godGhpcy53aW4sIHRoaXMuZWxlbWVudCwgRXZlbnRUeXBlLlNXSVRDSF9QQUdFLCBwYXlsb2FkLCBldmVudEluaXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgcGFnZSBoYXMgYW55IGF1ZGlvLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2hlY2tQYWdlSGFzQXVkaW9fKCkge1xuICAgIGNvbnN0IHBhZ2VIYXNBdWRpbyA9XG4gICAgICB0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdiYWNrZ3JvdW5kLWF1ZGlvJykgfHxcbiAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdhbXAtYXVkaW8nKSB8fFxuICAgICAgdGhpcy5oYXNWaWRlb1dpdGhBdWRpb18oKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uVE9HR0xFX1BBR0VfSEFTX0FVRElPLCBwYWdlSGFzQXVkaW8pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgcGFnZSBoYXMgYW55IHZpZGVvcyB3aXRoIGF1ZGlvLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaGFzVmlkZW9XaXRoQXVkaW9fKCkge1xuICAgIGNvbnN0IGFtcFZpZGVvRWxzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2FtcC12aWRlbycpO1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc29tZS5jYWxsKFxuICAgICAgYW1wVmlkZW9FbHMsXG4gICAgICAodmlkZW8pID0+ICF2aWRlby5oYXNBdHRyaWJ1dGUoJ25vYXVkaW8nKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBwYWdlIGhhcyBlbGVtZW50cyB3aXRoIHBsYXliYWNrLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2hlY2tQYWdlSGFzRWxlbWVudFdpdGhQbGF5YmFja18oKSB7XG4gICAgY29uc3QgcGFnZUhhc0VsZW1lbnRXaXRoUGxheWJhY2sgPVxuICAgICAgdGhpcy5pc0F1dG9BZHZhbmNlKCkgfHxcbiAgICAgIHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2JhY2tncm91bmQtYXVkaW8nKSB8fFxuICAgICAgdGhpcy5nZXRBbGxNZWRpYV8oKS5sZW5ndGggPiAwO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKFxuICAgICAgQWN0aW9uLlRPR0dMRV9QQUdFX0hBU19FTEVNRU5UX1dJVEhfUExBWUJBQ0ssXG4gICAgICBwYWdlSGFzRWxlbWVudFdpdGhQbGF5YmFja1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlcG9ydERldk1vZGVFcnJvcnNfKCkge1xuICAgIGlmICghZ2V0TW9kZSgpLmRldmVsb3BtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZ2V0TG9nRW50cmllcyh0aGlzLmVsZW1lbnQpLnRoZW4oKGxvZ0VudHJpZXMpID0+IHtcbiAgICAgIGRpc3BhdGNoKFxuICAgICAgICB0aGlzLndpbixcbiAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICBFdmVudFR5cGUuREVWX0xPR19FTlRSSUVTX0FWQUlMQUJMRSxcbiAgICAgICAgLy8gPyBpcyBPSyBiZWNhdXNlIGFsbCBjb25zdW1lcnMgYXJlIGludGVybmFsLlxuICAgICAgICAvKiogQHR5cGUgez99ICovIChsb2dFbnRyaWVzKSxcbiAgICAgICAge2J1YmJsZXM6IHRydWV9XG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBtZWFzdXJpbmcgdmlkZW8gcGVyZm9ybWFuY2UgbWV0cmljcywgaWYgcGVyZm9ybWFuY2UgdHJhY2tpbmcgaXMgb24uXG4gICAqIEhhcyB0byBiZSBjYWxsZWQgZGlyZWN0bHkgYmVmb3JlIHBsYXlpbmcgdGhlIHZpZGVvLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RhcnRNZWFzdXJpbmdBbGxWaWRlb1BlcmZvcm1hbmNlXygpIHtcbiAgICBpZiAoIXRoaXMubWVkaWFQZXJmb3JtYW5jZU1ldHJpY3NTZXJ2aWNlXy5pc1BlcmZvcm1hbmNlVHJhY2tpbmdPbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdmlkZW9FbHMgPSAvKiogQHR5cGUgeyFBcnJheTwhSFRNTE1lZGlhRWxlbWVudD59ICovIChcbiAgICAgIHRoaXMuZ2V0QWxsVmlkZW9zXygpXG4gICAgKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZpZGVvRWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLnN0YXJ0TWVhc3VyaW5nVmlkZW9QZXJmb3JtYW5jZV8odmlkZW9FbHNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFIVE1MTWVkaWFFbGVtZW50fSB2aWRlb0VsXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzdGFydE1lYXN1cmluZ1ZpZGVvUGVyZm9ybWFuY2VfKHZpZGVvRWwpIHtcbiAgICBpZiAoIXRoaXMubWVkaWFQZXJmb3JtYW5jZU1ldHJpY3NTZXJ2aWNlXy5pc1BlcmZvcm1hbmNlVHJhY2tpbmdPbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5wZXJmb3JtYW5jZVRyYWNrZWRWaWRlb3NfLnB1c2godmlkZW9FbCk7XG4gICAgdGhpcy5tZWRpYVBlcmZvcm1hbmNlTWV0cmljc1NlcnZpY2VfLnN0YXJ0TWVhc3VyaW5nKHZpZGVvRWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIG1lYXN1cmluZyB2aWRlbyBwZXJmb3JtYW5jZSBtZXRyaWNzLCBpZiBwZXJmb3JtYW5jZSB0cmFja2luZyBpcyBvbi5cbiAgICogQ29tcHV0ZXMgYW5kIHNlbmRzIHRoZSBtZXRyaWNzLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBzZW5kTWV0cmljc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RvcE1lYXN1cmluZ0FsbFZpZGVvUGVyZm9ybWFuY2VfKHNlbmRNZXRyaWNzID0gdHJ1ZSkge1xuICAgIGlmICghdGhpcy5tZWRpYVBlcmZvcm1hbmNlTWV0cmljc1NlcnZpY2VfLmlzUGVyZm9ybWFuY2VUcmFja2luZ09uKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGVyZm9ybWFuY2VUcmFja2VkVmlkZW9zXy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5tZWRpYVBlcmZvcm1hbmNlTWV0cmljc1NlcnZpY2VfLnN0b3BNZWFzdXJpbmcoXG4gICAgICAgIHRoaXMucGVyZm9ybWFuY2VUcmFja2VkVmlkZW9zX1tpXSxcbiAgICAgICAgc2VuZE1ldHJpY3NcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgbG9hZGluZyBzcGlubmVyIHdoZW5ldmVyIHRoZSB2aWRlbyBpcyBidWZmZXJpbmcuXG4gICAqIEhhcyB0byBiZSBjYWxsZWQgYWZ0ZXIgdGhlIG1lZGlhUG9vbCBwcmVsb2FkIG1ldGhvZCwgdGhhdCBzd2FwcyB0aGUgdmlkZW9cbiAgICogZWxlbWVudHMgd2l0aCBuZXcgYW1wIGVsZW1lbnRzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RhcnRMaXN0ZW5pbmdUb1ZpZGVvRXZlbnRzXygpIHtcbiAgICBjb25zdCB2aWRlb0VscyA9IHRoaXMuZ2V0QWxsVmlkZW9zXygpO1xuXG4gICAgaWYgKHZpZGVvRWxzLmxlbmd0aCkge1xuICAgICAgY29uc3QgYWxyZWFkeVBsYXlpbmcgPSB2aWRlb0Vscy5zb21lKCh2aWRlbykgPT4gdmlkZW8uY3VycmVudFRpbWUgIT0gMCk7XG4gICAgICBpZiAoIWFscmVhZHlQbGF5aW5nKSB7XG4gICAgICAgIHRoaXMuZGVib3VuY2VUb2dnbGVMb2FkaW5nU3Bpbm5lcl8odHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCh2aWRlb0VscywgKHZpZGVvRWwpID0+IHtcbiAgICAgIHRoaXMudW5saXN0ZW5lcnNfLnB1c2goXG4gICAgICAgIGxpc3Rlbih2aWRlb0VsLCAncGxheWluZycsICgpID0+XG4gICAgICAgICAgdGhpcy5kZWJvdW5jZVRvZ2dsZUxvYWRpbmdTcGlubmVyXyhmYWxzZSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHRoaXMudW5saXN0ZW5lcnNfLnB1c2goXG4gICAgICAgIGxpc3Rlbih2aWRlb0VsLCAnd2FpdGluZycsICgpID0+XG4gICAgICAgICAgdGhpcy5kZWJvdW5jZVRvZ2dsZUxvYWRpbmdTcGlubmVyXyh0cnVlKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzdG9wTGlzdGVuaW5nVG9WaWRlb0V2ZW50c18oKSB7XG4gICAgdGhpcy5kZWJvdW5jZVRvZ2dsZUxvYWRpbmdTcGlubmVyXyhmYWxzZSk7XG4gICAgdGhpcy51bmxpc3RlbmVyc18uZm9yRWFjaCgodW5saXN0ZW4pID0+IHVubGlzdGVuKCkpO1xuICAgIHRoaXMudW5saXN0ZW5lcnNfID0gW107XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGJ1aWxkQW5kQXBwZW5kTG9hZGluZ1NwaW5uZXJfKCkge1xuICAgIHRoaXMubG9hZGluZ1NwaW5uZXJfID0gbmV3IExvYWRpbmdTcGlubmVyKHRoaXMud2luLmRvY3VtZW50KTtcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5sb2FkaW5nU3Bpbm5lcl8uYnVpbGQoKSk7XG4gIH1cblxuICAvKipcbiAgICogSGFzIHRvIGJlIGNhbGxlZCB0aHJvdWdoIHRoZSBgZGVib3VuY2VUb2dnbGVMb2FkaW5nU3Bpbm5lcl9gIG1ldGhvZCwgdG9cbiAgICogYXZvaWQgdGhlIHNwaW5uZXIgZmxhc2hpbmcgb24gdGhlIHNjcmVlbiB3aGVuIHRoZSB2aWRlbyBsb29wcywgb3IgZHVyaW5nXG4gICAqIG5hdmlnYXRpb24gdHJhbnNpdGlvbnMuXG4gICAqIEJ1aWxkcyB0aGUgbG9hZGluZyBzcGlubmVyIGFuZCBhdHRhY2hlcyBpdCB0byB0aGUgRE9NIG9uIGZpcnN0IGNhbGwuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNBY3RpdmVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHRvZ2dsZUxvYWRpbmdTcGlubmVyXyhpc0FjdGl2ZSkge1xuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMubG9hZGluZ1NwaW5uZXJfKSB7XG4gICAgICAgIHRoaXMuYnVpbGRBbmRBcHBlbmRMb2FkaW5nU3Bpbm5lcl8oKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5sb2FkaW5nU3Bpbm5lcl8udG9nZ2xlKGlzQWN0aXZlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIGFwcGVuZHMgYSBtZXNzYWdlIGFuZCBpY29uIHRvIHBsYXkgdGhlIHN0b3J5IG9uIHRhcC5cbiAgICogVGhpcyBtZXNzYWdlIGlzIGJ1aWx0IHdoZW4gdGhlIHBsYXliYWNrIGZhaWxlZCAoZGF0YSBzYXZlciwgbG93IGJhdHRlcnlcbiAgICogbW9kZXMsIC4uLikuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBidWlsZEFuZEFwcGVuZFBsYXlNZXNzYWdlXygpIHtcbiAgICB0aGlzLnBsYXlNZXNzYWdlRWxfID0gYnVpbGRQbGF5TWVzc2FnZUVsZW1lbnQodGhpcy5lbGVtZW50KTtcbiAgICBjb25zdCBsYWJlbEVsID0gdGhpcy5wbGF5TWVzc2FnZUVsXy5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktcGFnZS1wbGF5LWxhYmVsJ1xuICAgICk7XG4gICAgbGFiZWxFbC50ZXh0Q29udGVudCA9IGdldExvY2FsaXphdGlvblNlcnZpY2UoXG4gICAgICB0aGlzLmVsZW1lbnRcbiAgICApLmdldExvY2FsaXplZFN0cmluZyhMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfUEFHRV9QTEFZX1ZJREVPKTtcblxuICAgIHRoaXMucGxheU1lc3NhZ2VFbF8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICB0aGlzLnRvZ2dsZVBsYXlNZXNzYWdlXyhmYWxzZSk7XG4gICAgICB0aGlzLnN0YXJ0TWVhc3VyaW5nQWxsVmlkZW9QZXJmb3JtYW5jZV8oKTtcbiAgICAgIHRoaXMubWVkaWFQb29sUHJvbWlzZV9cbiAgICAgICAgLnRoZW4oKG1lZGlhUG9vbCkgPT4gbWVkaWFQb29sLmJsZXNzQWxsKCkpXG4gICAgICAgIC50aGVuKCgpID0+IHRoaXMucGxheUFsbE1lZGlhXygpKTtcbiAgICB9KTtcblxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5wbGF5TWVzc2FnZUVsXykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIFwiUGxheSB2aWRlb1wiIGZhbGxiYWNrIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNBY3RpdmVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHRvZ2dsZVBsYXlNZXNzYWdlXyhpc0FjdGl2ZSkge1xuICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgIHRoaXMucGxheU1lc3NhZ2VFbF8gJiZcbiAgICAgICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+XG4gICAgICAgICAgdG9nZ2xlKGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5wbGF5TWVzc2FnZUVsXyksIGZhbHNlKVxuICAgICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5wbGF5TWVzc2FnZUVsXykge1xuICAgICAgdGhpcy5idWlsZEFuZEFwcGVuZFBsYXlNZXNzYWdlXygpO1xuICAgIH1cblxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PlxuICAgICAgdG9nZ2xlKGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5wbGF5TWVzc2FnZUVsXyksIHRydWUpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIGFwcGVuZHMgYSBtZXNzYWdlIGFuZCBpY29uIHRvIGluZGljYXRlIGEgdmlkZW8gZXJyb3Igc3RhdGUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBidWlsZEFuZEFwcGVuZEVycm9yTWVzc2FnZV8oKSB7XG4gICAgdGhpcy5lcnJvck1lc3NhZ2VFbF8gPSBidWlsZEVycm9yTWVzc2FnZUVsZW1lbnQodGhpcy5lbGVtZW50KTtcbiAgICBjb25zdCBsYWJlbEVsID0gdGhpcy5lcnJvck1lc3NhZ2VFbF8ucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXN0b3J5LXBhZ2UtZXJyb3ItbGFiZWwnXG4gICAgKTtcbiAgICBsYWJlbEVsLnRleHRDb250ZW50ID0gZ2V0TG9jYWxpemF0aW9uU2VydmljZShcbiAgICAgIHRoaXMuZWxlbWVudFxuICAgICkuZ2V0TG9jYWxpemVkU3RyaW5nKExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9QQUdFX0VSUk9SX1ZJREVPKTtcblxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lcnJvck1lc3NhZ2VFbF8pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBcIlBsYXkgdmlkZW9cIiBmYWxsYmFjayBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQWN0aXZlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0b2dnbGVFcnJvck1lc3NhZ2VfKGlzQWN0aXZlKSB7XG4gICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgdGhpcy5lcnJvck1lc3NhZ2VFbF8gJiZcbiAgICAgICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+XG4gICAgICAgICAgdG9nZ2xlKGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5lcnJvck1lc3NhZ2VFbF8pLCBmYWxzZSlcbiAgICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZXJyb3JNZXNzYWdlRWxfKSB7XG4gICAgICB0aGlzLmJ1aWxkQW5kQXBwZW5kRXJyb3JNZXNzYWdlXygpO1xuICAgIH1cblxuICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PlxuICAgICAgdG9nZ2xlKGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5lcnJvck1lc3NhZ2VFbF8pLCB0cnVlKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgb3BlbiBhdHRhY2htZW50IFVJIGFmZm9yZGFuY2UuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZW5kZXJPcGVuQXR0YWNobWVudFVJXygpIHtcbiAgICAvLyBBdHRhY2htZW50RWwgY2FuIGJlIGVpdGhlciBhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50IG9yIGFtcC1zdG9yeS1wYWdlLW91dGxpbmtcbiAgICBjb25zdCBhdHRhY2htZW50RWwgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICdhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50LCBhbXAtc3RvcnktcGFnZS1vdXRsaW5rJ1xuICAgICk7XG4gICAgaWYgKCFhdHRhY2htZW50RWwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUbyBwcmV2ZW50ICd0aXRsZScgYXR0cmlidXRlIGZyb20gYmVpbmcgdXNlZCBieSBicm93c2VyLCBjb3B5IHZhbHVlIHRvICdkYXRhLXRpdGxlJyBhbmQgcmVtb3ZlLlxuICAgIGlmIChhdHRhY2htZW50RWwuaGFzQXR0cmlidXRlKCd0aXRsZScpKSB7XG4gICAgICBhdHRhY2htZW50RWwuc2V0QXR0cmlidXRlKFxuICAgICAgICAnZGF0YS10aXRsZScsXG4gICAgICAgIGF0dGFjaG1lbnRFbC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJylcbiAgICAgICk7XG4gICAgICBhdHRhY2htZW50RWwucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5vcGVuQXR0YWNobWVudEVsXykge1xuICAgICAgdGhpcy5vcGVuQXR0YWNobWVudEVsXyA9IHJlbmRlclBhZ2VBdHRhY2htZW50VUkoXG4gICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgYXR0YWNobWVudEVsXG4gICAgICApO1xuXG4gICAgICAvLyBUaGlzIGVuc3VyZXMgYGFjdGl2ZWAgaXMgc2V0IG9uIGZpcnN0IHJlbmRlci5cbiAgICAgIC8vIE90aGVyd2lzZSBzZXRTdGF0ZSBtYXkgYmUgY2FsbGVkIGJlZm9yZSB0aGlzLm9wZW5BdHRhY2htZW50RWxfIGV4aXN0cy5cbiAgICAgIGlmICh0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdhY3RpdmUnKSkge1xuICAgICAgICB0aGlzLm9wZW5BdHRhY2htZW50RWxfLnNldEF0dHJpYnV0ZSgnYWN0aXZlJywgJycpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLndpbi5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktcGFnZS1vcGVuLWF0dGFjaG1lbnQtaG9zdCcpO1xuICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZSgncm9sZScsICdidXR0b24nKTtcblxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgaWYgKGlzUGFnZUF0dGFjaG1lbnRVaVYyRXhwZXJpbWVudE9uKHRoaXMud2luKSkge1xuICAgICAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBzbyBsaW5rIGNhbiBiZSBvcGVuZWQgcHJvZ3JhbW1hdGljYWxseSBhZnRlciBVUkwgcHJldmlldyBpcyBzaG93bi5cbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vcGVuQXR0YWNobWVudCgpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgICAgICBjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlKFxuICAgICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgICB0aGlzLm9wZW5BdHRhY2htZW50RWxfLFxuICAgICAgICAgIHBhZ2VBdHRhY2htZW50Q1NTXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIGF0dGFjaG1lbnQsIGlmIGFueS5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gc2hvdWxkQW5pbWF0ZVxuICAgKi9cbiAgb3BlbkF0dGFjaG1lbnQoc2hvdWxkQW5pbWF0ZSA9IHRydWUpIHtcbiAgICBjb25zdCBhdHRhY2htZW50RWwgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICdhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50LCBhbXAtc3RvcnktcGFnZS1vdXRsaW5rJ1xuICAgICk7XG5cbiAgICBpZiAoIWF0dGFjaG1lbnRFbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGF0dGFjaG1lbnRFbC5nZXRJbXBsKCkudGhlbigoYXR0YWNobWVudCkgPT4gYXR0YWNobWVudC5vcGVuKHNob3VsZEFuaW1hdGUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBjaGVjayB0byBzZWUgaWYgdGhpcyBwYWdlIGlzIGEgd3JhcHBlciBmb3IgYW4gYWRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoQURWRVJUSVNFTUVOVF9BVFRSX05BTUUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGV4dCBzdHlsZXMgZm9yIGRlc2NlbmRhbnRzIG9mIHRoZVxuICAgKiA8YW1wLXN0b3J5LXBhZ2U+IGVsZW1lbnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzZXREZXNjZW5kYW50Q3NzVGV4dFN0eWxlc18oKSB7XG4gICAgc2V0VGV4dEJhY2tncm91bmRDb2xvcih0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBwYWdlLCBmcm9tIGl0cyB0aXRsZSBhbmQgaXRzIHZpZGVvc1xuICAgKiBhbHQvdGl0bGUgYXR0cmlidXRlcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNldFBhZ2VEZXNjcmlwdGlvbl8oKSB7XG4gICAgaWYgKHRoaXMuaXNCb3RVc2VyQWdlbnRfKSB7XG4gICAgICByZW5kZXJQYWdlRGVzY3JpcHRpb24odGhpcywgdGhpcy5nZXRBbGxBbXBWaWRlb3NfKCkpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc0JvdFVzZXJBZ2VudF8gJiYgdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgndGl0bGUnKSkge1xuICAgICAgLy8gU3RyaXAgdGhlIHRpdGxlIGF0dHJpYnV0ZSBmcm9tIHRoZSBwYWdlIG9uIG5vbi1ib3QgdXNlciBhZ2VudHMsIHRvXG4gICAgICAvLyBwcmV2ZW50IHRoZSBicm93c2VyIHRvb2x0aXAuXG4gICAgICBpZiAoIXRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFxuICAgICAgICAgICdhcmlhLWxhYmVsJyxcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0aXRsZScpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGVtcHR5IGFsdCB0YWcgdG8gYW1wLWltZyBlbGVtZW50cyBpZiBub3QgcHJlc2VudC5cbiAgICogUHJldmVudHMgc2NyZWVuIHJlYWRlcnMgZnJvbSBhbm5vdW5jaW5nIHRoZSBpbWcgc3JjIHZhbHVlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZUltZ0FsdFRhZ3NfKCkge1xuICAgIHRvQXJyYXkodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2FtcC1pbWcnKSkuZm9yRWFjaCgoYW1wSW1nTm9kZSkgPT4ge1xuICAgICAgaWYgKCFhbXBJbWdOb2RlLmdldEF0dHJpYnV0ZSgnYWx0JykpIHtcbiAgICAgICAgYW1wSW1nTm9kZS5zZXRBdHRyaWJ1dGUoJ2FsdCcsICcnKTtcbiAgICAgICAgLy8gSWYgdGhlIGNoaWxkIGltZyBlbGVtZW50IGlzIGluIHRoZSBkb20sIHByb3BvZ2F0ZSB0aGUgYXR0cmlidXRlIHRvIGl0LlxuICAgICAgICBjb25zdCBjaGlsZEltZ05vZGUgPSBhbXBJbWdOb2RlLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpO1xuICAgICAgICBjaGlsZEltZ05vZGUgJiZcbiAgICAgICAgICBhbXBJbWdOb2RlXG4gICAgICAgICAgICAuZ2V0SW1wbCgpXG4gICAgICAgICAgICAudGhlbigoaW1wbCkgPT5cbiAgICAgICAgICAgICAgcHJvcGFnYXRlQXR0cmlidXRlcygnYWx0JywgaW1wbC5lbGVtZW50LCBjaGlsZEltZ05vZGUpXG4gICAgICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgcGFnZSB3aWxsIGF1dG9tYXRpY2FsbHkgYWR2YW5jZVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNBdXRvQWR2YW5jZSgpIHtcbiAgICByZXR1cm4gdGhpcy5hZHZhbmNlbWVudF8uaXNBdXRvQWR2YW5jZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaS1hbXBodG1sLW9yaWctdGFiaW5kZXggdG8gdGhlIGRlZmF1bHQgdGFiaW5kZXggb2YgdGFiYmFibGUgZWxlbWVudHNcbiAgICovXG4gIGluaXRpYWxpemVUYWJiYWJsZUVsZW1lbnRzXygpIHtcbiAgICB0b0FycmF5KFxuICAgICAgc2NvcGVkUXVlcnlTZWxlY3RvckFsbCh0aGlzLmVsZW1lbnQsIFNlbGVjdG9ycy5BTExfVEFCQkFCTEUpXG4gICAgKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKFxuICAgICAgICAnaS1hbXBodG1sLW9yaWctdGFiaW5kZXgnLFxuICAgICAgICBlbC5nZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JykgfHwgMFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSB0YWJiYWJsZSBlbGVtZW50cyAoYnV0dG9ucywgbGlua3MsIGV0YykgdG8gb25seSByZWFjaCB0aGVtIHdoZW4gcGFnZSBpcyBhY3RpdmUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdG9nZ2xlXG4gICAqL1xuICB0b2dnbGVUYWJiYWJsZUVsZW1lbnRzXyh0b2dnbGUpIHtcbiAgICB0b0FycmF5KFxuICAgICAgc2NvcGVkUXVlcnlTZWxlY3RvckFsbCh0aGlzLmVsZW1lbnQsIFNlbGVjdG9ycy5BTExfVEFCQkFCTEUpXG4gICAgKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKFxuICAgICAgICAndGFiaW5kZXgnLFxuICAgICAgICB0b2dnbGUgPyBlbC5nZXRBdHRyaWJ1dGUoJ2ktYW1waHRtbC1vcmlnLXRhYmluZGV4JykgOiAtMVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-page.js