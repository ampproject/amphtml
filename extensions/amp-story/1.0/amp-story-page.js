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
import {devAssert} from '#core/assert';
import {CommonSignals_Enum} from '#core/constants/common-signals';
import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {Deferred} from '#core/data-structures/promise';
import {removeElement} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {
  closestAncestorElementBySelector,
  matches,
  scopedQuerySelectorAll,
} from '#core/dom/query';
import {toggle} from '#core/dom/style';
import {isAutoplaySupported, tryPlay} from '#core/dom/video';
import {toArray} from '#core/types/array';
import {debounce, once} from '#core/types/function';

import {getExperimentBranch, isExperimentOn} from '#experiments';
import {StoryAdSegmentExp} from '#experiments/story-ad-progress-segment';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {listen, listenOnce} from '#utils/event-helper';
import {dev} from '#utils/log';

import {embeddedElementsSelectors} from './amp-story-embedded-component';
import {localizeTemplate} from './amp-story-localization-service';
import {
  Action,
  StateProperty,
  UIType_Enum,
  getStoreService,
} from './amp-story-store-service';
import {AnimationManager, hasAnimations} from './animation';
import {upgradeBackgroundAudio} from './audio';
import {EventType, dispatch} from './events';
import {renderLoadingSpinner, toggleLoadingSpinner} from './loading-spinner';
import {getMediaPerformanceMetricsService} from './media-performance-metrics-service';
import {MediaPool} from './media-pool';
import {AdvancementConfig, AdvancementConfigType} from './page-advancement';
import {isPrerenderActivePage} from './prerender-active-page';
import {renderPageDescription} from './semantic-render';
import {setTextBackgroundColor} from './utils';

import {getFriendlyIframeEmbedOptional} from '../../../src/iframe-helper';
import {VideoEvents_Enum, delegateAutoplay} from '../../../src/video-interface';

/**
 * CSS class for an amp-story-page that indicates the entire page is loaded.
 * @const {string}
 */
const PAGE_LOADED_CLASS_NAME = 'i-amphtml-story-page-loaded';

/**
 * Selectors for media elements.
 * Only get the page media: direct children of amp-story-page (ie:
 * background-audio), or descendant of amp-story-grid-layer. That excludes media
 * contained in amp-story-page-attachment.
 * @enum {string}
 */
export const Selectors = {
  // which media to wait for on page layout.
  ALL_AMP_MEDIA:
    'amp-story-grid-layer amp-audio, ' +
    'amp-story-grid-layer amp-video, amp-story-grid-layer amp-img, ' +
    'amp-story-grid-layer amp-anim',
  ALL_AMP_VIDEO: 'amp-story-grid-layer amp-video',
  ALL_PLAYBACK_AMP_MEDIA:
    'amp-story-grid-layer amp-audio, amp-story-grid-layer amp-video',
  // TODO(gmajoulet): Refactor the way these selectors are used. They will be
  // passed to scopedQuerySelectorAll which expects only one selector and not
  // multiple separated by commas. `> audio` has to be kept first of the list to
  // work with this current implementation.
  ALL_PLAYBACK_MEDIA:
    '> audio, amp-story-grid-layer audio, amp-story-grid-layer video',
  ALL_VIDEO: 'amp-story-grid-layer video',
  ALL_TABBABLE: 'a, amp-twitter > iframe',
};

/** @private @const {string} */
const TAG = 'amp-story-page';

/** @private @const {string} */
const ADVERTISEMENT_ATTR_NAME = 'ad';

/** @private @const {number} */
const DEFAULT_PREVIEW_AUTO_ADVANCE_DURATION_S = 5;

/** @private @const {number} */
const VIDEO_MINIMUM_AUTO_ADVANCE_DURATION_S = 2;

/**
 * @param {function(Event)} onClick
 * @return {!Element}
 */
const renderPlayMessageElement = (onClick) => (
  <button
    role="button"
    class="i-amphtml-story-page-play-button i-amphtml-story-system-reset"
    onClick={onClick}
  >
    <span
      class="i-amphtml-story-page-play-label"
      i-amphtml-i18n-text-content={
        LocalizedStringId_Enum.AMP_STORY_PAGE_PLAY_VIDEO
      }
    ></span>
    <span class="i-amphtml-story-page-play-icon"></span>
  </button>
);

/**
 * @return {!Element}
 */
const renderErrorMessageElement = () => (
  <div class="i-amphtml-story-page-error i-amphtml-story-system-reset">
    <span
      class="i-amphtml-story-page-error-label"
      i-amphtml-i18n-text-content={
        LocalizedStringId_Enum.AMP_STORY_PAGE_ERROR_VIDEO
      }
    ></span>
    <span class="i-amphtml-story-page-error-icon"></span>
  </div>
);

/**
 * amp-story-page states.
 * @enum {number}
 */
export const PageState = {
  NOT_ACTIVE: 0, // Page is not displayed. Could still be visible on desktop.
  PLAYING: 1, // Page is currently the main page, and playing.
  PAUSED: 2, // Page is currently the main page, but not playing.
};

/** @const @enum {string}*/
export const NavigationDirection = {
  NEXT: 'next',
  PREVIOUS: 'previous',
};

/**
 * The <amp-story-page> custom element, which represents a single page of
 * an <amp-story>.
 */
export class AmpStoryPage extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed(element) {
    return isPrerenderActivePage(element);
  }

  /** @override  */
  static previewAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.element);

    /** @private {?AnimationManager} */
    this.animationManager_ = null;

    /** @private {?AdvancementConfig} */
    this.advancement_ = null;

    /** @const @private {!function(boolean)} */
    this.debounceToggleLoadingSpinner_ = debounce(
      this.win,
      (isActive) => this.toggleLoadingSpinner_(!!isActive),
      100
    );

    /**
     * @return {!Element}
     * @private
     */
    this.getLoadingSpinner_ = once(() =>
      this.buildAndAppendVideoLoadingSpinner_()
    );

    /** @private {?Element} */
    this.playMessageEl_ = null;

    /** @private {?Element} */
    this.errorMessageEl_ = null;

    const deferred = new Deferred();

    /** @const {boolean} */
    this.isFirstPage_ = matches(this.element, 'amp-story-page:first-of-type');

    /** @private @const {!./media-performance-metrics-service.MediaPerformanceMetricsService} */
    this.mediaPerformanceMetricsService_ = getMediaPerformanceMetricsService(
      this.win
    );

    /** @private {!Array<!HTMLMediaElement>} */
    this.performanceTrackedVideos_ = [];

    /** @private {?Promise} */
    this.registerAllMediaPromise_ = null;

    /** @private @const {!Promise<!MediaPool>} */
    this.mediaPoolPromise_ = deferred.promise;

    /** @private @const {!function(!MediaPool)} */
    this.mediaPoolResolveFn_ = deferred.resolve;

    /** @private @const {!function(*)} */
    this.mediaPoolRejectFn_ = deferred.reject;

    /** @private {!PageState} */
    this.state_ = PageState.NOT_ACTIVE;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    /** @private {!Array<function()>} */
    this.unlisteners_ = [];

    /** @private {!Deferred} */
    this.backgroundAudioDeferred_ = new Deferred();

    /**
     * Whether the user agent matches a bot.  This is used to prevent resource
     * optimizations that make the document less useful at crawl time, e.g.
     * removing sources from videos.
     * @private @const {boolean}
     */
    this.isBotUserAgent_ = Services.platformFor(this.win).isBot();

    /** @private {?number} Time at which an audio element failed playing. */
    this.playAudioElementFromTimestamp_ = null;

    /**
     * The value of the 'auto-advance-after' attribute set by the publisher.
     * @private {?string}
     */
    this.initialAutoAdvanceValue_ =
      this.element.getAttribute('auto-advance-after');

    /** @private {?VisibilityState_Enum} */
    this.visibilityState_ = this.getAmpDoc().getVisibilityState();
    this.getAmpDoc().onVisibilityChanged(() => this.onVisibilityChanged_());
  }

  /**
   * @private
   */
  maybeCreateAnimationManager_() {
    if (this.animationManager_) {
      return;
    }
    if (!hasAnimations(this.element)) {
      return;
    }
    this.animationManager_ = AnimationManager.create(
      this.element,
      this.getAmpDoc(),
      this.getAmpDoc().getUrl()
    );
  }

  /**
   * @private
   * @return {Element}
   */
  maybeConvertCtaLayerToPageOutlink_() {
    const ctaLayerEl = this.element.querySelector('amp-story-cta-layer');
    if (!ctaLayerEl) {
      return;
    }

    const anchorSet = ctaLayerEl.querySelectorAll('a');
    if (anchorSet.length !== 1 || !anchorSet[0].getAttribute('href')) {
      return;
    }

    removeElement(ctaLayerEl);
    this.element.appendChild(
      <amp-story-page-outlink layout="nodisplay">
        <a href={anchorSet[0].getAttribute('href')}>
          {anchorSet[0].textContent}
        </a>
      </amp-story-page-outlink>
    );
  }

  /** @override */
  buildCallback() {
    this.delegateVideoAutoplay();
    this.markMediaElementsWithPreload_();
    this.initializeMediaPool_();
    this.maybeCreateAnimationManager_();
    this.setUpAdvancementConfig_();
    this.setDescendantCssTextStyles_();
    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => this.onUIStateUpdate_(uiState),
      true /* callToInitialize */
    );
    this.setPageDescription_();
    this.element.setAttribute('role', 'region');
    this.initializeImgAltTags_();
    this.initializeTabbableElements_();
    this.maybeApplyFirstAnimationFrameOrFinish();
    this.maybeConvertCtaLayerToPageOutlink_();
  }

  /**
   * Handles visibility state changes.
   * @private
   */
  onVisibilityChanged_() {
    const ampDoc = this.getAmpDoc();

    const wasPreview = this.visibilityState_ === VisibilityState_Enum.PREVIEW;
    const isPreviewToVisibleTransition = wasPreview && ampDoc.isVisible();
    this.visibilityState_ = ampDoc.getVisibilityState();

    if (ampDoc.isPreview() || ampDoc.isVisible()) {
      // Preview mode and visible mode both have different advancement logic.
      this.setUpAdvancementConfig_(isPreviewToVisibleTransition);
    }
  }

  /**
   * Sets up the advancement config depending upon the
   * @param {boolean=} handlePreviewToVisibleTransition
   * @private
   */
  setUpAdvancementConfig_(handlePreviewToVisibleTransition = false) {
    if (this.getAmpDoc().isPreview()) {
      this.setupAutoAdvanceForPreview_();
      this.initializeAdvancementConfig_();
    } else if (this.getAmpDoc().isVisible()) {
      this.setupAutoAdvanceForVisible_();
      this.maybeSetStoryNextUp_();
      if (this.isActive() && handlePreviewToVisibleTransition) {
        this.handlePreviewToVisibleTransition_();
      } else {
        this.initializeAdvancementConfig_();
      }
    }
  }

  /**
   * Configures the page to auto advance using preview-specific durations.
   * @private
   */
  setupAutoAdvanceForPreview_() {
    let autoAdvanceAfter = this.getAutoAdvanceAfterSeconds_();

    const firstVideo = this.getFirstAmpVideo_();
    if (!firstVideo) {
      this.element.setAttribute('auto-advance-after', autoAdvanceAfter + 's');
      return;
    }

    const maxPrev = this.getMaxVideoPreview_();
    if (maxPrev > 0) {
      // Comply with max-video-preview, but never to lengthen the page preview
      autoAdvanceAfter = Math.min(maxPrev, autoAdvanceAfter);
    } else if (maxPrev === 0) {
      // TODO(masanto): Prevent video from playing when maxVideoPreview is 0
    }
    this.element.setAttribute('auto-advance-after', autoAdvanceAfter + 's');

    whenUpgradedToCustomElement(firstVideo)
      .then(() => firstVideo.getImpl())
      .then((videoImpl) => {
        this.loadPromise(firstVideo).then(() => {
          const duration = videoImpl.getDuration();
          const tooShort = duration < autoAdvanceAfter;
          const videoEl = firstVideo.querySelector('video');
          videoEl.loop ||= tooShort;
        });
      });
  }

  /**
   * Calculates the duration of this page's preview based upon the
   * 'previewSecondsPerPage' query parameter.
   * @return {number} The number of seconds for which this page should be
   *     previewed before advancing to the next page.
   * @private
   */
  getAutoAdvanceAfterSeconds_() {
    const previewSecondsStr = this.viewer_.getParam('previewSecondsPerPage');
    const previewSecondsPerPage = parseInt(previewSecondsStr, 10);
    return isNaN(previewSecondsPerPage) || previewSecondsPerPage <= 0
      ? DEFAULT_PREVIEW_AUTO_ADVANCE_DURATION_S
      : previewSecondsPerPage;
  }

  /**
   * @return {number} The max-video-preview value, if it exists on the doc. A
   *     positive value means that a maximum of <value> seconds may be used as
   *     a video snippet for videos on this page in search results. A value of
   *     0 means that a static image may be used. And a value of -1 means that
   *     there is no limit to the video's preview length.
   * @private
   */
  getMaxVideoPreview_() {
    const robotsContent = this.getAmpDoc().getMetaByName('robots');
    const maxVideoPreviewRegex = /max-video-preview[^,]*/;
    const maxVideoPreviewStr = robotsContent?.match(maxVideoPreviewRegex)[0];
    return parseInt(maxVideoPreviewStr?.split(':')[1], 10);
  }

  /**
   * Configures the page to auto advance using default durations.
   * @private
   */
  setupAutoAdvanceForVisible_() {
    // The 'auto-advance-after' attribute value may have been altered if auto
    // advance was set up for preview mode. We revert this alteration for
    // visible mode, in accordance with any values specified by the publisher.
    if (this.initialAutoAdvanceValue_) {
      this.element.setAttribute(
        'auto-advance-after',
        this.initialAutoAdvanceValue_
      );
    } else {
      this.element.removeAttribute('auto-advance-after');
    }
  }

  /**
   * Handles the transition between the `preview` and `visible` visibility
   * states by reinitializing this page's advancement config.
   *
   * As long as this page has called `setupAutoAdvanceForVisible_()`, prior to
   * this method, then the reinitialization will result in a new advancement
   * config that aligns with the advancement logic specified by the publisher.
   * @private
   */
  handlePreviewToVisibleTransition_() {
    const advancementType = this.advancement_?.getType();
    devAssert(
      advancementType === AdvancementConfigType.TIME_BASED_ADVANCEMENT,
      'The advancement is expected to be time-based in preview mode'
    );

    // Here, we store the progress values of the time-based advancement used
    // during the preview. After the advancement is reinitialized below, we
    // set its progress to the value that has already elapsed in preview mode,
    // ensuring that the progress bar accurately reflects the page's progress.
    const progress = this.advancement_.getProgress();
    const progressMs = this.advancement_.getProgressMs();

    this.initializeAdvancementConfig_();

    switch (this.advancement_.getType()) {
      case AdvancementConfigType.ADVANCEMENT_CONFIG:
        // With this advancement, the progress bar should be full instead of
        // gradually filling. We set the progress bar's progress to the 1.0
        // because the bar would otherwise stagnate at a value between 0 & 1.
        this.emitProgress_(1.0);
        this.advancement_.start();
        break;

      case AdvancementConfigType.MEDIA_BASED_ADVANCEMENT:
        // With this advancement, the progress bar should advance along with
        // the video/audio playback progress. We ensure that the new
        // advancement begins not at 0, but at the already-elapsed media
        // playback time.
        this.advancement_.start(progress);
        break;

      case AdvancementConfigType.TIME_BASED_ADVANCEMENT:
        // With this advancement, the progress bar should advance along with
        // time. We ensure that the new advancement begins not at 0, but at
        // the already-elapsed time.
        this.advancement_.start(progressMs / this.advancement_.getDelayMs());
    }
  }

  /**
   * Initialize this page's advancement config and set its listener callbacks.
   * @private
   */
  initializeAdvancementConfig_() {
    this.advancement_?.removeAllAddedListeners();
    this.advancement_ = AdvancementConfig.forElement(this.win, this.element);
    this.advancement_.addPreviousListener(() => this.previous());
    this.advancement_.addAdvanceListener(() =>
      this.next(/* opt_isAutomaticAdvance */ true)
    );
    this.advancement_.addProgressListener((progress) =>
      this.emitProgress_(progress)
    );
  }

  /**
   * Reads the storyNextUp param if provided and sets the auto-advance-after
   * attribute to the given value if there isn't one set by the publisher. The
   * auto-advance-after attribute may later be set to the duration of the first
   * video if there is one, once the metadata is available.
   * @private
   */
  maybeSetStoryNextUp_() {
    const autoAdvanceAttr = this.element.getAttribute('auto-advance-after');
    // This is a private param used for testing, it may be changed
    // or removed without notice.
    const storyNextUpParam = Services.viewerForDoc(this.element).getParam(
      'storyNextUp'
    );
    if (autoAdvanceAttr !== null || storyNextUpParam === null) {
      return;
    }
    this.element.setAttribute('auto-advance-after', storyNextUpParam);
    this.listenAndUpdateAutoAdvanceDuration_();
  }

  /**
   * If there's a video on the page, this sets a listener to update
   * the TimeBasedAdvancement when the first video's duration becomes available.
   * @private
   */
  listenAndUpdateAutoAdvanceDuration_() {
    const video = this.getFirstAmpVideo_();
    if (video === null) {
      return;
    }
    whenUpgradedToCustomElement(video)
      .then(() => video.getImpl())
      .then((videoImpl) => {
        const videoDuration = videoImpl.getDuration();
        if (!isNaN(videoDuration)) {
          this.maybeUpdateAutoAdvanceTime_(videoDuration);
          return;
        }
        listenOnce(video, VideoEvents_Enum.LOADEDMETADATA, () => {
          this.maybeUpdateAutoAdvanceTime_(videoImpl.getDuration());
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
  maybeUpdateAutoAdvanceTime_(duration) {
    if (
      duration < VIDEO_MINIMUM_AUTO_ADVANCE_DURATION_S ||
      !this.advancement_ ||
      !this.advancement_.updateTimeDelay
    ) {
      return;
    }
    this.advancement_.updateTimeDelay(duration + 's');
    // 'auto-advance-after' is only read during buildCallback(), but we update it
    // here to keep the DOM consistent with the AdvancementConfig.
    this.element.setAttribute('auto-advance-after', duration + 's');
  }

  /**
   * Returns the first amp-video in the amp-story-page if there is one, otherwise
   * returns null.
   * @return {?Element}
   * @private
   */
  getFirstAmpVideo_() {
    const videos = this.getAllAmpVideos_();
    return videos.length === 0 ? null : videos[0];
  }

  /**
   * Delegates video autoplay so the video manager does not follow the
   * autoplay attribute that may have been set by a publisher, which could
   * play videos from an inactive page.
   */
  delegateVideoAutoplay() {
    this.element.querySelectorAll('amp-video').forEach(delegateAutoplay);
  }

  /** @private */
  initializeMediaPool_() {
    const storyEl = dev().assertElement(
      closestAncestorElementBySelector(this.element, 'amp-story'),
      'amp-story-page must be a descendant of amp-story.'
    );

    whenUpgradedToCustomElement(storyEl)
      .then(() => storyEl.getImpl())
      .then(
        (storyImpl) => this.mediaPoolResolveFn_(MediaPool.for(storyImpl)),
        (reason) => this.mediaPoolRejectFn_(reason)
      );
  }

  /**
   * Marks any AMP elements that represent media elements with preload="auto".
   * @private
   */
  markMediaElementsWithPreload_() {
    const mediaSet = this.element.querySelectorAll('amp-audio, amp-video');
    mediaSet.forEach((mediaItem) => {
      mediaItem.setAttribute('preload', 'auto');
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }

  /**
   * Updates the state of the page.
   * @param {!PageState} state
   */
  setState(state) {
    switch (state) {
      case PageState.NOT_ACTIVE:
        this.element.removeAttribute('active');
        this.pause_();
        this.state_ = state;
        break;
      case PageState.PLAYING:
        if (this.state_ === PageState.NOT_ACTIVE) {
          this.element.setAttribute('active', '');
          this.resume_();
        }

        if (this.state_ === PageState.PAUSED) {
          this.advancement_.start();
          this.playAllMedia_();
          this.animationManager_?.resumeAll();
        }

        this.state_ = state;
        break;
      case PageState.PAUSED:
        this.advancement_.stop(true /** canResume */);
        this.pauseAllMedia_(false /** rewindToBeginning */);
        this.animationManager_?.pauseAll();
        this.state_ = state;
        break;
      default:
        dev().warn(TAG, `PageState ${state} does not exist`);
        break;
    }
  }

  /**
   * @private
   */
  pause_() {
    this.advancement_.stop(false /** canResume */);

    this.stopMeasuringAllVideoPerformance_();
    this.stopListeningToVideoEvents_();
    this.toggleErrorMessage_(false);
    this.togglePlayMessage_(false);
    this.playAudioElementFromTimestamp_ = null;

    this.pauseAllMedia_(true /** rewindToBeginning */);

    if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
      this.muteAllMedia();
    }

    this.animationManager_?.cancelAll();
  }

  /**
   * @private
   */
  resume_() {
    const registerAllPromise = this.registerAllMedia_();

    if (this.isActive()) {
      registerAllPromise
        .then(() => {
          if (this.state_ === PageState.NOT_ACTIVE) {
            return;
          }
          this.signals()
            .whenSignal(CommonSignals_Enum.LOAD_END)
            .then(() => {
              if (this.state_ == PageState.PLAYING) {
                this.advancement_.start();
              }
            });
          this.preloadAllMedia_().then(() => {
            if (this.state_ === PageState.NOT_ACTIVE) {
              return;
            }
            this.startMeasuringAllVideoPerformance_();
            this.startListeningToVideoEvents_();
            // iOS 14.2 and 14.3 requires play to be called before unmute
            this.playAllMedia_().then(() => {
              if (
                !this.storeService_.get(StateProperty.MUTED_STATE) &&
                this.state_ !== PageState.NOT_ACTIVE
              ) {
                this.unmuteAllMedia();
              }
            });
            this.toggleCaptions_(
              this.storeService_.get(StateProperty.CAPTIONS_STATE)
            );
          });
        })
        .then(() => {
          // In the PREVIEW state, a video can only use cached sources. If it
          // fails to play due to any issue with the cached sources, we
          // reregister the video once it has obtained its origin sources.
          if (this.getAmpDoc().isPreview()) {
            // We first block the reregistration on video layout end because
            // that is the point at which the story has entered the VISIBLE
            // state and its origin sources have been added.
            return this.waitForPlaybackMediaLayoutEnd_().then(() => {
              return this.reregisterAndPlayUnplayedVideos_();
            });
          }
        });
      this.maybeStartAnimations_();
      this.checkPageHasAudio_();
      this.checkPageHasCaptions_();
      this.checkPageHasElementWithPlayback_();
      this.findAndPrepareEmbeddedComponents_();
    }
  }

  /**
   * @return {!Promise} A promise that resolves when all videos that failed to
   *     play have been reregistered and played.
   * @private
   */
  reregisterAndPlayUnplayedVideos_() {
    const videos = this.getAllVideos_();
    const unplayedVideos = videos.filter(
      (video) => video.readyState < /* HAVE_CURRENT_DATA */ 2
    );
    return this.mediaPoolPromise_.then((pool) => {
      const playPromises = unplayedVideos.map((video) => {
        return this.reregisterMedia_(pool, video).then(() => {
          this.toggleErrorMessage_(false);
          return this.playMedia_(pool, video);
        });
      });
      return Promise.all(playPromises);
    });
  }

  /** @override */
  layoutCallback() {
    // Do not loop if the audio is used to auto-advance.
    const loop =
      this.element.getAttribute('id') !==
      this.element.getAttribute('auto-advance-after');
    upgradeBackgroundAudio(this.element, loop);
    this.backgroundAudioDeferred_.resolve();

    this.muteAllMedia();

    this.installPageAttachmentExtension_();
    this.initializeCaptionsListener_();

    return Promise.all([
      this.waitForMediaLayout_().then(() => this.markPageAsLoaded_()),
      this.mediaPoolPromise_,
    ]);
  }

  /** @override */
  onLayoutMeasure() {
    // TODO(#37528): Replace with ResizeObserver API.
    const {height, width} = this.getLayoutSize();
    if (!this.isFirstPage_ || height === 0 || width === 0) {
      return;
    }
    this.storeService_.dispatch(Action.SET_PAGE_SIZE, {height, width});
  }

  /**
   * Reacts to UI state updates.
   * @param {!UIType_Enum} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    // On vertical rendering, render all the animations with their final state.
    if (uiState === UIType_Enum.VERTICAL) {
      this.maybeFinishAnimations_();
    }
  }

  /**
   * @return {!Promise}
   * @private
   */
  waitForMediaLayout_() {
    const mediaSet = toArray(this.getMediaBySelector_(Selectors.ALL_AMP_MEDIA));

    const mediaPromises = mediaSet.map((mediaEl) => {
      return new Promise((resolve) => {
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

            whenUpgradedToCustomElement(mediaEl)
              .then((el) =>
                el.signals().whenSignal(CommonSignals_Enum.LOAD_END)
              )
              .then(resolve, resolve);
            break;
          case 'amp-audio':
          case 'amp-video':
            const innerMediaEl = mediaEl.querySelector('audio, video');
            if (innerMediaEl && innerMediaEl.readyState >= 2) {
              resolve();
              return;
            }
            mediaEl.addEventListener('canplay', resolve, true /* useCapture */);
            break;
          default:
            // Any other tags should not block loading.
            resolve();
        }

        // We suppress errors so that Promise.all will still wait for all
        // promises to complete, even if one has failed.  We do nothing with the
        // error, as the resource itself and/or code that loads it should handle
        // the error.
        mediaEl.addEventListener('error', resolve, true /* useCapture */);
      });
    });
    return Promise.all(mediaPromises);
  }

  /**
   * @return {!Promise} A promise that blocks until all playback media on the
   *     page have begun their layouts.
   * @private
   */
  waitForPlaybackMediaLayoutStart_() {
    return this.waitForPlaybackMediaLayout_(true /* waitForLayoutStart */);
  }

  /**
   * @return {!Promise} A promise that blocks until all playback media on the
   *     page have completed their layouts.
   * @private
   */
  waitForPlaybackMediaLayoutEnd_() {
    return this.waitForPlaybackMediaLayout_(false /* waitForLayoutStart */);
  }

  /**
   * @param {boolean} waitForLayoutStart Whether this method should only block
   *     until all playback media have begun their layouts, as opposed to
   *     having completed them.
   * @return {!Promise} A promise that blocks until all playback media on the
   *     page have begun or completed their layouts, depending on the value of
   *     `waitForLayoutStart`.
   * @private
   */
  waitForPlaybackMediaLayout_(waitForLayoutStart) {
    const mediaSet = toArray(
      this.getMediaBySelector_(Selectors.ALL_PLAYBACK_AMP_MEDIA)
    );

    const mediaPromises = mediaSet.map((mediaEl) => {
      return new Promise((resolve) => {
        switch (mediaEl.tagName.toLowerCase()) {
          case 'amp-audio':
          case 'amp-video':
            const loadSignal = waitForLayoutStart
              ? CommonSignals_Enum.LOAD_START
              : CommonSignals_Enum.LOAD_END;
            const signal =
              mediaEl.getAttribute('layout') === Layout_Enum.NODISPLAY
                ? CommonSignals_Enum.BUILT
                : loadSignal;

            whenUpgradedToCustomElement(mediaEl)
              .then((el) => el.signals().whenSignal(signal))
              .then(resolve, resolve);
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
   * @return {!Promise}
   * @private
   */
  waitForAmpVideosBuilt_() {
    const mediaSet = this.getAllAmpVideos_();

    const mediaPromises = mediaSet.map((mediaEl) =>
      whenUpgradedToCustomElement(mediaEl).then((el) => el.whenBuilt())
    );
    return Promise.all(mediaPromises);
  }

  /**
   * Finds embedded components in page and prepares them.
   * @private
   */
  findAndPrepareEmbeddedComponents_() {
    this.addClickShieldToEmbeddedComponents_();
  }

  /**
   * Adds a pseudo element on top of the embed to block clicks from going into
   * the iframe.
   * @private
   */
  addClickShieldToEmbeddedComponents_() {
    const componentEls = toArray(
      scopedQuerySelectorAll(this.element, embeddedElementsSelectors())
    );

    if (componentEls.length <= 0) {
      return;
    }

    this.mutateElement(() => {
      componentEls.forEach((el) => {
        el.classList.add('i-amphtml-embedded-component');
      });
    });
  }

  /** @private */
  markPageAsLoaded_() {
    dispatch(
      this.win,
      this.element,
      EventType.PAGE_LOADED,
      /* payload */ undefined,
      {bubbles: true}
    );
    this.mutateElement(() => {
      this.element.classList.add(PAGE_LOADED_CLASS_NAME);
    });
  }

  /**
   * Gets all media elements on this page.
   * @return {!Array<?Element>}
   * @private
   */
  getAllMedia_() {
    return this.getMediaBySelector_(Selectors.ALL_PLAYBACK_MEDIA);
  }

  /**
   * Gets all video elements on this page.
   * @return {!Array<?Element>}
   * @private
   */
  getAllVideos_() {
    return this.getMediaBySelector_(Selectors.ALL_VIDEO);
  }

  /**
   * Gets all amp video elements on this page.
   * @return {!Array<?Element>}
   * @private
   */
  getAllAmpVideos_() {
    return this.getMediaBySelector_(Selectors.ALL_AMP_VIDEO);
  }

  /**
   * Gets media on page by given selector. Finds elements through friendly
   * iframe (if one exists).
   * @param {string} selector
   * @return {!Array<?Element>}
   * @private
   */
  getMediaBySelector_(selector) {
    const iframe = this.element.querySelector('iframe');
    const fie =
      iframe &&
      getFriendlyIframeEmbedOptional(
        /** @type {!HTMLIFrameElement} */ (iframe)
      );
    const mediaSet = [];

    scopedQuerySelectorAll(this.element, selector).forEach((el) =>
      mediaSet.push(el)
    );

    if (fie) {
      scopedQuerySelectorAll(
        fie.win.document.body,
        selector.replace(/amp-story-grid-layer/g, '')
      ).forEach((el) => mediaSet.push(el));
    }

    return mediaSet;
  }

  /**
   * @return {!Promise<boolean>}
   * @private
   */
  isAutoplaySupported_() {
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
  whenAllMediaElements_(callbackFn) {
    const mediaSet = toArray(this.getAllMedia_());

    return this.mediaPoolPromise_.then((mediaPool) => {
      const promises = mediaSet.map((mediaEl) => {
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
  pauseAllMedia_(rewindToBeginning = false) {
    return this.whenAllMediaElements_((mediaPool, mediaEl) => {
      return this.pauseMedia_(
        mediaPool,
        mediaEl,
        /** @type {boolean} */ (rewindToBeginning)
      );
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
  pauseMedia_(mediaPool, mediaEl, rewindToBeginning) {
    if (this.isBotUserAgent_) {
      mediaEl.pause();
      return Promise.resolve();
    } else {
      return mediaPool.pause(
        /** @type {!./media-pool.DomElementDef} */ (mediaEl),
        rewindToBeginning
      );
    }
  }

  /**
   * Plays all media on this page.
   * @return {!Promise} Promise that resolves after the callbacks are called.
   * @private
   */
  playAllMedia_() {
    return this.whenAllMediaElements_((mediaPool, mediaEl) => {
      return this.playMedia_(mediaPool, mediaEl);
    });
  }

  /**
   * Plays the given media.
   * @param {!./media-pool.MediaPool} mediaPool
   * @param {!Element} mediaEl
   * @return {!Promise} Promise that resolves after the media is played.
   * @private
   */
  playMedia_(mediaPool, mediaEl) {
    if (this.isBotUserAgent_) {
      tryPlay(mediaEl);
      return Promise.resolve();
    } else {
      return this.loadPromise(mediaEl).then(
        () => {
          return mediaPool
            .play(/** @type {!./media-pool.DomElementDef} */ (mediaEl))
            .catch((unusedError) => {
              // Auto playing the media failed, which could be caused by a data
              // saver, or a battery saving mode. Display a message so we can
              // get a user gesture to bless the media elements, and play them.
              if (mediaEl.tagName === 'VIDEO') {
                this.debounceToggleLoadingSpinner_(false);

                // If autoplay got rejected, display a "play" button. If
                // autoplay was supported, dispay an error message.
                this.isAutoplaySupported_().then((isAutoplaySupported) => {
                  if (isAutoplaySupported) {
                    this.toggleErrorMessage_(true);
                    return;
                  }

                  // Error was expected, don't send the performance metrics.
                  this.stopMeasuringAllVideoPerformance_(
                    false /** sendMetrics */
                  );
                  this.togglePlayMessage_(true);
                });
              }

              if (mediaEl.tagName === 'AUDIO') {
                this.playAudioElementFromTimestamp_ = Date.now();
              }
            });
        },
        () => {
          this.debounceToggleLoadingSpinner_(false);
          this.toggleErrorMessage_(true);
        }
      );
    }
  }

  /**
   * Preloads all media on this page.
   * @return {!Promise} Promise that resolves after the callbacks are called.
   * @private
   */
  preloadAllMedia_() {
    return this.whenAllMediaElements_((mediaPool, mediaEl) =>
      this.preloadMedia_(mediaPool, mediaEl)
    );
  }

  /**
   * Preloads the given media.
   * @param {!./media-pool.MediaPool} mediaPool
   * @param {!Element} mediaEl
   * @return {!Promise<!Element|undefined>} Promise that resolves with the preloading element.
   * @private
   */
  preloadMedia_(mediaPool, mediaEl) {
    if (this.isBotUserAgent_) {
      // No-op.
      return Promise.resolve();
    } else {
      return mediaPool.preload(
        /** @type {!./media-pool.DomElementDef} */ (mediaEl)
      );
    }
  }

  /**
   * Mutes all media on this page.
   * @return {!Promise} Promise that resolves after the callbacks are called.
   */
  muteAllMedia() {
    return this.whenAllMediaElements_((mediaPool, mediaEl) => {
      this.muteMedia_(mediaPool, mediaEl);
    });
  }

  /**
   * Mutes the given media.
   * @param {!./media-pool.MediaPool} mediaPool
   * @param {!Element} mediaEl
   * @return {!Promise} Promise that resolves after the media is muted.
   * @private
   */
  muteMedia_(mediaPool, mediaEl) {
    if (this.isBotUserAgent_) {
      mediaEl.muted = true;
      mediaEl.setAttribute('muted', '');
      return Promise.resolve();
    } else {
      return mediaPool.mute(
        /** @type {!./media-pool.DomElementDef} */ (mediaEl)
      );
    }
  }

  /**
   * Unmutes all media on this page.
   * @return {!Promise} Promise that resolves after the callbacks are called.
   */
  unmuteAllMedia() {
    return this.whenAllMediaElements_((mediaPool, mediaEl) => {
      this.unmuteMedia_(mediaPool, mediaEl);
    });
  }

  /**
   * Unmutes the given media.
   * @param {!./media-pool.MediaPool} mediaPool
   * @param {!Element} mediaEl
   * @return {!Promise} Promise that resolves after the media is unmuted.
   * @private
   */
  unmuteMedia_(mediaPool, mediaEl) {
    if (this.isBotUserAgent_) {
      mediaEl.muted = false;
      mediaEl.removeAttribute('muted');
      if (mediaEl.tagName === 'AUDIO' && mediaEl.paused) {
        tryPlay(mediaEl);
      }
      return Promise.resolve();
    } else {
      mediaEl = /** @type {!./media-pool.DomElementDef} */ (mediaEl);
      const promises = [mediaPool.unmute(mediaEl)];

      // Audio element might not be playing if the page navigation did not
      // happen after a user intent, and the media element was not "blessed".
      // On unmute, make sure this audio element is playing, at the expected
      // currentTime.
      if (
        mediaEl.tagName === 'AUDIO' &&
        mediaEl.paused &&
        this.playAudioElementFromTimestamp_
      ) {
        const currentTime =
          (Date.now() - this.playAudioElementFromTimestamp_) / 1000;
        if (mediaEl.hasAttribute('loop') || currentTime < mediaEl.duration) {
          promises.push(
            mediaPool.setCurrentTime(mediaEl, currentTime % mediaEl.duration)
          );
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
  registerAllMedia_() {
    if (!this.registerAllMediaPromise_) {
      // In preview mode, the `amp-video` layout callback does not resolve
      // because it is blocked on requests for origin sources that cannot be
      // made in the SERP due to privacy concerns. So, instead of indefinitely
      // blocking registration, we register media elements at layout start.
      const waitForPlaybackMediaLayoutPromise = this.getAmpDoc().isPreview()
        ? this.waitForPlaybackMediaLayoutStart_()
        : this.waitForPlaybackMediaLayoutEnd_();
      this.registerAllMediaPromise_ = waitForPlaybackMediaLayoutPromise.then(
        () => this.whenAllMediaElements_((p, e) => this.registerMedia_(p, e))
      );
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
  registerMedia_(mediaPool, mediaEl) {
    if (this.isBotUserAgent_) {
      // No-op.
      return Promise.resolve();
    } else {
      return mediaPool.register(
        /** @type {!./media-pool.DomElementDef} */ (mediaEl)
      );
    }
  }

  /**
   * Reregisters the given media.
   * @param {!./media-pool.MediaPool} mediaPool
   * @param {!Element} mediaEl
   * @return {!Promise} Promise that resolves after the media is reregistered.
   * @private
   */
  reregisterMedia_(mediaPool, mediaEl) {
    if (this.isBotUserAgent_) {
      // No-op.
      return Promise.resolve();
    } else {
      return mediaPool.reregister(
        /** @type {!./media-pool.DomElementDef} */ (mediaEl)
      );
    }
  }

  /**
   * Starts playing animations, if the animation manager is available.
   * @private
   */
  maybeStartAnimations_() {
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
  maybeFinishAnimations_() {
    if (!this.animationManager_) {
      return;
    }
    this.signals()
      .whenSignal(CommonSignals_Enum.LOAD_END)
      .then(() => this.animationManager_.applyLastFrame());
  }

  /**
   * Apply first or last frame of animations if page should play them or not.
   * @return {!Promise}
   */
  maybeApplyFirstAnimationFrameOrFinish() {
    return Promise.resolve(this.animationManager_?.applyFirstFrameOrFinish());
  }

  /**
   * @return {number} The distance from the current page to the active page.
   */
  getDistance() {
    return parseInt(this.element.getAttribute('distance'), 10);
  }

  /**
   * @param {number} distance The distance from the current page to the active
   *     page.
   */
  setDistance(distance) {
    // TODO(ccordry) refactor this when pages are managed
    if (this.isAd()) {
      distance = Math.min(distance, 2);
    }
    if (distance == this.getDistance()) {
      return;
    }

    this.element.setAttribute('distance', distance);
    this.element.setAttribute('aria-hidden', distance != 0);

    const registerAllPromise = this.registerAllMedia_();

    if (distance > 0 && distance <= 2) {
      this.findAndPrepareEmbeddedComponents_();
      registerAllPromise.then(() => this.preloadAllMedia_());
    }
    this.toggleTabbableElements_(distance == 0);
  }

  /**
   * @return {boolean} Whether this page is currently active.
   */
  isActive() {
    return this.element.hasAttribute('active');
  }

  /**
   * Emits an event indicating that the progress of the current page has changed
   * to the specified value.
   * @param {number} progress The progress from 0.0 to 1.0.
   */
  emitProgress_(progress) {
    // Don't emit progress for ads, since the progress bar is hidden.
    // Don't emit progress for inactive pages, because race conditions.
    const storyAdSegmentBranch = getExperimentBranch(
      this.win,
      StoryAdSegmentExp.ID
    );
    const progressBarExpDisabled =
      !storyAdSegmentBranch ||
      storyAdSegmentBranch == StoryAdSegmentExp.CONTROL;
    if (
      (progressBarExpDisabled && this.isAd()) ||
      this.state_ === PageState.NOT_ACTIVE
    ) {
      return;
    }

    const payload = {
      'pageId': this.element.id,
      'progress': progress,
    };
    const eventInit = {bubbles: true};
    dispatch(
      this.win,
      this.element,
      EventType.PAGE_PROGRESS,
      payload,
      eventInit
    );
  }

  /**
   * Returns all of the pages that are one hop from this page.
   * @return {!Array<string>}
   */
  getAdjacentPageIds() {
    const adjacentPageIds = isExperimentOn(this.win, 'amp-story-branching')
      ? this.actions_()
      : [];

    const autoAdvanceNext = this.getNextPageId(
      true /* opt_isAutomaticAdvance */
    );
    const manualAdvanceNext = this.getNextPageId(
      false /* opt_isAutomaticAdvance */
    );
    const previous = this.getPreviousPageId();

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
  getPreviousPageId() {
    if (this.element.hasAttribute('i-amphtml-return-to')) {
      return this.element.getAttribute('i-amphtml-return-to');
    }

    const navigationPath = this.storeService_.get(
      StateProperty.NAVIGATION_PATH
    );

    const pagePathIndex = navigationPath.lastIndexOf(this.element.id);
    const previousPageId = navigationPath[pagePathIndex - 1];

    if (previousPageId) {
      return previousPageId;
    }

    // If the page was loaded with a `#page=foo` hash, it could have no
    // navigation path but still a previous page in the DOM.
    const previousElement = this.element.previousElementSibling;
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
  getNextPageId(isAutomaticAdvance = false) {
    if (isAutomaticAdvance && this.element.hasAttribute('auto-advance-to')) {
      return this.element.getAttribute('auto-advance-to');
    }

    const advanceAttr = isExperimentOn(this.win, 'amp-story-branching')
      ? 'advance-to'
      : 'i-amphtml-advance-to';

    if (this.element.hasAttribute(advanceAttr)) {
      return this.element.getAttribute(advanceAttr);
    }
    const nextElement = this.element.nextElementSibling;
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
  actions_() {
    const actionElements = Array.prototype.slice.call(
      this.element.querySelectorAll('[on*=goToPage]')
    );

    const actionAttrs = actionElements.map((action) =>
      action.getAttribute('on')
    );

    return actionAttrs.reduce((res, actions) => {
      // Handling for multiple actions on one event or multiple events.
      const actionList = /** @type {!Array} */ (actions.split(/[;,]+/));
      actionList.forEach((action) => {
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
  previous() {
    const pageId = this.getPreviousPageId();

    if (pageId === null) {
      dispatch(
        this.win,
        this.element,
        EventType.NO_PREVIOUS_PAGE,
        /* payload */ undefined,
        {bubbles: true}
      );
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
  next(isAutomaticAdvance = false) {
    const pageId = this.getNextPageId(isAutomaticAdvance);

    if (!pageId) {
      dispatch(
        this.win,
        this.element,
        EventType.NO_NEXT_PAGE,
        /* payload */ undefined,
        {bubbles: true}
      );
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
  switchTo_(targetPageId, direction) {
    const payload = {
      'targetPageId': targetPageId,
      'direction': direction,
    };
    const eventInit = {bubbles: true};
    dispatch(this.win, this.element, EventType.SWITCH_PAGE, payload, eventInit);
  }

  /**
   * Checks if the page has audio elements or video elements with audio and updates the store service state.
   * @private
   */
  checkPageHasAudio_() {
    const hasAudioElements =
      this.element.hasAttribute('background-audio') ||
      this.element.querySelector('amp-audio');

    const hasAudioPromise = hasAudioElements
      ? Promise.resolve(true)
      : this.hasVideoWithAudio_();

    hasAudioPromise.then((hasAudio) =>
      this.storeService_.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, hasAudio)
    );
  }

  /**
   * Checks if the page has any videos with audio.
   * @return {!Promise<boolean>}
   * @private
   */
  hasVideoWithAudio_() {
    return this.waitForAmpVideosBuilt_().then(() =>
      Array.prototype.some.call(
        this.getAllAmpVideos_(),
        (ampVideo) =>
          !ampVideo.hasAttribute('noaudio') &&
          parseFloat(ampVideo.getAttribute('volume')) !== 0
      )
    );
  }

  /**
   * Checks if the page has any videos with captions.
   * @return {!Promise<boolean>}
   * @private
   */
  hasVideoWithCaptions_() {
    return this.waitForAmpVideosBuilt_().then(() =>
      Array.prototype.some.call(this.getAllAmpVideos_(), (ampVideo) =>
        ampVideo.querySelector('track')
      )
    );
  }

  /**
   * Checks if the page has elements with playback.
   * @private
   */
  checkPageHasElementWithPlayback_() {
    const pageHasElementWithPlayback =
      this.isAutoAdvance() ||
      this.element.hasAttribute('background-audio') ||
      this.getAllMedia_().length > 0;

    this.storeService_.dispatch(
      Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK,
      pageHasElementWithPlayback
    );
  }

  /**
   * Checks if the page has any captions.
   * @private
   */
  checkPageHasCaptions_() {
    this.hasVideoWithCaptions_().then((hasVideoWithCaptions) => {
      this.storeService_.dispatch(
        Action.TOGGLE_PAGE_HAS_CAPTIONS,
        hasVideoWithCaptions
      );
    });
  }

  /**
   * Starts measuring video performance metrics, if performance tracking is on.
   * Has to be called directly before playing the video.
   * @private
   */
  startMeasuringAllVideoPerformance_() {
    if (!this.mediaPerformanceMetricsService_.isPerformanceTrackingOn()) {
      return;
    }

    const videoEls = /** @type {!Array<!HTMLMediaElement>} */ (
      this.getAllVideos_()
    );
    for (let i = 0; i < videoEls.length; i++) {
      this.startMeasuringVideoPerformance_(videoEls[i]);
    }
  }

  /**
   * @param {!HTMLMediaElement} videoEl
   * @private
   */
  startMeasuringVideoPerformance_(videoEl) {
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
  stopMeasuringAllVideoPerformance_(sendMetrics = true) {
    if (!this.mediaPerformanceMetricsService_.isPerformanceTrackingOn()) {
      return;
    }

    for (let i = 0; i < this.performanceTrackedVideos_.length; i++) {
      this.mediaPerformanceMetricsService_.stopMeasuring(
        this.performanceTrackedVideos_[i],
        sendMetrics
      );
    }
  }

  /**
   * Displays a loading spinner whenever the video is buffering.
   * Has to be called after the mediaPool preload method, that swaps the video
   * elements with new amp elements.
   * @private
   */
  startListeningToVideoEvents_() {
    const videoEls = this.getAllVideos_();

    if (videoEls.length) {
      const alreadyPlaying = videoEls.some((video) => video.currentTime != 0);
      if (!alreadyPlaying) {
        this.debounceToggleLoadingSpinner_(true);
      }
    }

    videoEls.forEach((videoEl) => {
      this.unlisteners_.push(
        listen(videoEl, 'playing', () =>
          this.debounceToggleLoadingSpinner_(false)
        )
      );
      this.unlisteners_.push(
        listen(videoEl, 'waiting', () =>
          this.debounceToggleLoadingSpinner_(true)
        )
      );
    });
  }

  /**
   * @private
   */
  stopListeningToVideoEvents_() {
    this.debounceToggleLoadingSpinner_(false);
    this.unlisteners_.forEach((unlisten) => unlisten());
    this.unlisteners_ = [];
  }

  /**
   * @return {!Element}
   * @private
   */
  buildAndAppendVideoLoadingSpinner_() {
    const loadingSpinner = renderLoadingSpinner();
    loadingSpinner.setAttribute('aria-label', 'Loading video');
    return this.element.appendChild(loadingSpinner);
  }

  /**
   * Has to be called through the `debounceToggleLoadingSpinner_` method, to
   * avoid the spinner flashing on the screen when the video loops, or during
   * navigation transitions.
   * Builds the loading spinner and attaches it to the DOM on first call.
   * @param {boolean} isActive
   * @private
   */
  toggleLoadingSpinner_(isActive) {
    this.mutateElement(() => {
      toggleLoadingSpinner(this.getLoadingSpinner_(), isActive);
    });
  }

  /**
   * Builds and appends a message and icon to play the story on tap.
   * This message is built when the playback failed (data saver, low battery
   * modes, ...).
   * @private
   */
  buildAndAppendPlayMessage_() {
    this.playMessageEl_ = renderPlayMessageElement(() => {
      this.togglePlayMessage_(false);
      this.startMeasuringAllVideoPerformance_();
      this.mediaPoolPromise_
        .then((mediaPool) => mediaPool.blessAll())
        .then(() => this.playAllMedia_());
    });

    localizeTemplate(this.playMessageEl_, this.element).then(() =>
      this.mutateElement(() => this.element.appendChild(this.playMessageEl_))
    );
  }

  /**
   * Toggles the visibility of the "Play video" fallback message.
   * @param {boolean} isActive
   * @private
   */
  togglePlayMessage_(isActive) {
    if (!isActive) {
      this.playMessageEl_ &&
        this.mutateElement(() =>
          toggle(dev().assertElement(this.playMessageEl_), false)
        );
      return;
    }

    if (!this.playMessageEl_) {
      this.buildAndAppendPlayMessage_();
    }

    this.mutateElement(() =>
      toggle(dev().assertElement(this.playMessageEl_), true)
    );
  }

  /**
   * Builds and appends a message and icon to indicate a video error state.
   * @private
   */
  buildAndAppendErrorMessage_() {
    this.errorMessageEl_ = renderErrorMessageElement();

    localizeTemplate(this.errorMessageEl_, this.element).then(() =>
      this.mutateElement(() => this.element.appendChild(this.errorMessageEl_))
    );
  }

  /**
   * Toggles the visibility of the "Play video" fallback message.
   * @param {boolean} isActive
   * @private
   */
  toggleErrorMessage_(isActive) {
    if (!isActive) {
      this.errorMessageEl_ &&
        this.mutateElement(() =>
          toggle(dev().assertElement(this.errorMessageEl_), false)
        );
      return;
    }

    if (!this.errorMessageEl_) {
      this.buildAndAppendErrorMessage_();
    }

    this.mutateElement(() =>
      toggle(dev().assertElement(this.errorMessageEl_), true)
    );
  }

  /**
   * Installs the page attachment extension.
   * @private
   */
  installPageAttachmentExtension_() {
    const elementsThatRequireExtension = this.element.querySelector(
      'amp-story-page-attachment, amp-story-page-outlink, amp-story-shopping-attachment'
    );

    if (!elementsThatRequireExtension) {
      return;
    }

    Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc(),
      'amp-story-page-attachment',
      '0.1'
    );
  }

  /**
   * check to see if this page is a wrapper for an ad
   * @return {boolean}
   */
  isAd() {
    return this.element.hasAttribute(ADVERTISEMENT_ATTR_NAME);
  }

  /**
   * Sets text styles for descendants of the
   * <amp-story-page> element.
   * @private
   */
  setDescendantCssTextStyles_() {
    setTextBackgroundColor(this.element);
  }

  /**
   * Sets the description of the page, from its title and its videos
   * alt/title attributes.
   * @private
   */
  setPageDescription_() {
    if (this.isBotUserAgent_) {
      renderPageDescription(this, this.getAllAmpVideos_());
    }

    if (!this.isBotUserAgent_ && this.element.hasAttribute('title')) {
      // Strip the title attribute from the page on non-bot user agents, to
      // prevent the browser tooltip.
      if (!this.element.getAttribute('aria-label')) {
        this.element.setAttribute(
          'aria-label',
          this.element.getAttribute('title')
        );
      }
      this.element.removeAttribute('title');
    }
  }

  /**
   * Adds an empty alt tag to amp-img elements if not present.
   * Prevents screen readers from announcing the img src value.
   * @private
   */
  initializeImgAltTags_() {
    toArray(this.element.querySelectorAll('amp-img')).forEach((ampImgNode) => {
      if (!ampImgNode.getAttribute('alt')) {
        ampImgNode.setAttribute('alt', '');
        // If the child img element is in the dom, propogate the attribute to it.
        const childImgNode = ampImgNode.querySelector('img');
        childImgNode &&
          ampImgNode
            .getImpl()
            .then((impl) =>
              propagateAttributes('alt', impl.element, childImgNode)
            );
      }
    });
  }

  /**
   * Returns whether the page will automatically advance
   * @return {boolean}
   */
  isAutoAdvance() {
    return this.advancement_.isAutoAdvance();
  }

  /**
   * Set the i-amphtml-orig-tabindex to the default tabindex of tabbable elements
   */
  initializeTabbableElements_() {
    toArray(
      scopedQuerySelectorAll(this.element, Selectors.ALL_TABBABLE)
    ).forEach((el) => {
      el.setAttribute(
        'i-amphtml-orig-tabindex',
        el.getAttribute('tabindex') || 0
      );
    });
  }

  /**
   * Toggles the tabbable elements (buttons, links, etc) to only reach them when page is active.
   * @param {boolean} toggle
   */
  toggleTabbableElements_(toggle) {
    toArray(
      scopedQuerySelectorAll(this.element, Selectors.ALL_TABBABLE)
    ).forEach((el) => {
      el.setAttribute(
        'tabindex',
        toggle ? el.getAttribute('i-amphtml-orig-tabindex') : -1
      );
    });
  }

  /**
   * Listens for changes on captions if there are tracks on videos and page is active.
   * @private
   */
  initializeCaptionsListener_() {
    this.hasVideoWithCaptions_().then((hasVideoWithCaptions) => {
      if (!hasVideoWithCaptions) {
        return;
      }
      this.storeService_.subscribe(
        StateProperty.CAPTIONS_STATE,
        (captionsState) => {
          if (this.isActive()) {
            this.toggleCaptions_(captionsState);
          }
        },
        true
      );
    });
  }

  /**
   * Shows or hides the captions for all elements that implement toggleCaptions.
   * @param {boolean} captionsState
   * @return {!Promise}
   */
  toggleCaptions_(captionsState) {
    return this.getAllAmpVideos_().map((ampVideo) =>
      ampVideo.getImpl().then((impl) => {
        if (impl.toggleCaptions) {
          impl.toggleCaptions(captionsState);
        }
      })
    );
  }
}
