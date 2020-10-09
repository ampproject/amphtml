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
import {
  AFFILIATE_LINK_SELECTOR,
  AmpStoryAffiliateLink,
} from './amp-story-affiliate-link';
import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {AdvancementConfig} from './page-advancement';
import {AmpEvents} from '../../../src/amp-events';
import {
  AmpStoryEmbeddedComponent,
  EMBED_ID_ATTRIBUTE_NAME,
  EXPANDABLE_COMPONENTS,
  expandableElementsSelectors,
} from './amp-story-embedded-component';
import {AnimationManager, hasAnimations} from './animation';
import {CommonSignals} from '../../../src/common-signals';
import {Deferred} from '../../../src/utils/promise';
import {EventType, dispatch} from './events';
import {Layout} from '../../../src/layout';
import {LoadingSpinner} from './loading-spinner';
import {LocalizedStringId} from '../../../src/localized-strings';
import {MediaPool} from './media-pool';
import {Services} from '../../../src/services';
import {VideoUtils} from '../../../src/utils/video';
import {
  addAttributesToElement,
  closestAncestorElementBySelector,
  iterateCursor,
  matches,
  scopedQuerySelectorAll,
  whenUpgradedToCustomElement,
} from '../../../src/dom';
import {debounce} from '../../../src/utils/rate-limit';
import {delegateAutoplay} from '../../../src/video-interface';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getAmpdoc} from '../../../src/service';
import {getFriendlyIframeEmbedOptional} from '../../../src/iframe-helper';
import {getLocalizationService} from './amp-story-localization-service';
import {getLogEntries} from './logging';
import {getMediaPerformanceMetricsService} from './media-performance-metrics-service';
import {getMode} from '../../../src/mode';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {listen} from '../../../src/event-helper';
import {px, toggle} from '../../../src/style';
import {renderPageDescription} from './semantic-render';
import {setTextBackgroundColor} from './utils';
import {toArray} from '../../../src/types';
import {upgradeBackgroundAudio} from './audio';

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
  ALL_IFRAMED_MEDIA: 'audio, video',
  ALL_PLAYBACK_AMP_MEDIA:
    'amp-story-grid-layer amp-audio, amp-story-grid-layer amp-video',
  // TODO(gmajoulet): Refactor the way these selectors are used. They will be
  // passed to scopedQuerySelectorAll which expects only one selector and not
  // multiple separated by commas. `> audio` has to be kept first of the list to
  // work with this current implementation.
  ALL_PLAYBACK_MEDIA:
    '> audio, amp-story-grid-layer audio, amp-story-grid-layer video',
  ALL_STORY_360: 'amp-story-360',
  ALL_VIDEO: 'amp-story-grid-layer video',
};

/** @private @const {string} */
const EMBEDDED_COMPONENTS_SELECTORS = Object.keys(EXPANDABLE_COMPONENTS).join(
  ', '
);

/** @private @const {string} */
const INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS = Object.values(
  expandableElementsSelectors()
).join(',');

/** @private @const {number} */
const RESIZE_TIMEOUT_MS = 1000;

/** @private @const {string} */
const TAG = 'amp-story-page';

/** @private @const {string} */
const ADVERTISEMENT_ATTR_NAME = 'ad';

/** @private @const {number} */
const REWIND_TIMEOUT_MS = 350;

/** @private @const {string} */
const DEFAULT_PREVIEW_AUTO_ADVANCE_DURATION = '2s';

/** @private @const {string} */
const VIDEO_PREVIEW_AUTO_ADVANCE_DURATION = '5s';

/**
 * @param {!Element} element
 * @return {!Element}
 */
const buildPlayMessageElement = (element) =>
  htmlFor(element)`
      <button role="button"
          class="i-amphtml-story-page-play-button i-amphtml-story-system-reset">
        <span class="i-amphtml-story-page-play-label"></span>
        <span class='i-amphtml-story-page-play-icon'></span>
      </button>`;

/**
 * @param {!Element} element
 * @return {!Element}
 */
const buildErrorMessageElement = (element) =>
  htmlFor(element)`
      <div class="i-amphtml-story-page-error i-amphtml-story-system-reset">
        <span class="i-amphtml-story-page-error-label"></span>
        <span class='i-amphtml-story-page-error-icon'></span>
      </div>`;

/**
 * @param {!Element} element
 * @return {!Element}
 */
const buildOpenAttachmentElement = (element) =>
  htmlFor(element)`
      <div class="
          i-amphtml-story-page-open-attachment i-amphtml-story-system-reset"
          role="button">
        <span class="i-amphtml-story-page-open-attachment-icon">
          <span class="i-amphtml-story-page-open-attachment-bar-left"></span>
          <span class="i-amphtml-story-page-open-attachment-bar-right"></span>
        </span>
        <span class="i-amphtml-story-page-open-attachment-label"></span>
      </div>`;

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
    (el, unlisten) => {
      AmpStoryEmbeddedComponent.prepareForAnimation(
        page,
        dev().assertElement(el),
        mutator
      );
      if (unlisten) {
        unlisten();
      }
    },
    RESIZE_TIMEOUT_MS
  );
}

/**
 * The <amp-story-page> custom element, which represents a single page of
 * an <amp-story>.
 */
export class AmpStoryPage extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

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

    /** @private {?boolean}  */
    this.isFirstPage_ = null;

    /** @private {?LoadingSpinner} */
    this.loadingSpinner_ = null;

    /** @private {?Element} */
    this.playMessageEl_ = null;

    /** @private {?Element} */
    this.errorMessageEl_ = null;

    /** @private {?Element} */
    this.openAttachmentEl_ = null;

    /** @private @const {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(getAmpdoc(this.win.document));

    const deferred = new Deferred();

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

    /** @private {?Element} */
    this.cssVariablesStyleEl_ = null;

    /** @private {?../../../src/layout-rect.LayoutRectDef} */
    this.layoutBox_ = null;

    /** @private {!Array<function()>} */
    this.unlisteners_ = [];

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win);

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

    /** @private {?Array<!Promise<!../../amp-story-360/0.1/amp-story-360.AmpStory360>>}*/
    this.story360componentsCache_ = null;
  }

  /**
   * @private
   */
  maybeCreateAnimationManager_() {
    if (!this.animationManager_) {
      if (!hasAnimations(this.element)) {
        return;
      }

      this.animationManager_ = AnimationManager.create(
        this.element,
        this.getAmpDoc(),
        this.getAmpDoc().getUrl()
      );
    }
  }

  /** @override */
  buildCallback() {
    this.delegateVideoAutoplay();
    this.markMediaElementsWithPreload_();
    this.initializeMediaPool_();
    this.maybeCreateAnimationManager_();
    this.maybeSetPreviewDuration_();
    this.advancement_ = AdvancementConfig.forElement(this.win, this.element);
    this.advancement_.addPreviousListener(() => this.previous());
    this.advancement_.addAdvanceListener(() =>
      this.next(/* opt_isAutomaticAdvance */ true)
    );
    this.advancement_.addProgressListener((progress) =>
      this.emitProgress_(progress)
    );
    this.setDescendantCssTextStyles_();
    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => this.onUIStateUpdate_(uiState),
      true /* callToInitialize */
    );
    this.setPageDescription_();
    this.element.setAttribute('role', 'region');
    this.initializeImgAltTags_();
  }

  /** @private */
  maybeSetPreviewDuration_() {
    if (this.storeService_.get(StateProperty.PREVIEW_STATE)) {
      const videos = this.getAllVideos_();

      const autoAdvanceAttr =
        videos.length > 0
          ? VIDEO_PREVIEW_AUTO_ADVANCE_DURATION
          : DEFAULT_PREVIEW_AUTO_ADVANCE_DURATION;

      addAttributesToElement(
        this.element,
        dict({
          'auto-advance-after': autoAdvanceAttr,
        })
      );
    }
  }

  /**
   * Returns true if a child of the first page.
   * @return {boolean}
   */
  isFirstPage() {
    if (this.isFirstPage_ === null) {
      this.isFirstPage_ = matches(this.element, 'amp-story-page:first-of-type');
    }
    return this.isFirstPage_;
  }

  /**
   * Delegates video autoplay so the video manager does not follow the
   * autoplay attribute that may have been set by a publisher, which could
   * play videos from an inactive page.
   */
  delegateVideoAutoplay() {
    iterateCursor(this.element.querySelectorAll('amp-video'), delegateAutoplay);
  }

  /** @private */
  initializeMediaPool_() {
    const storyEl = dev().assertElement(
      closestAncestorElementBySelector(this.element, 'amp-story'),
      'amp-story-page must be a descendant of amp-story.'
    );

    whenUpgradedToCustomElement(storyEl).then(() => {
      storyEl.getImpl().then(
        (storyImpl) => {
          this.mediaPoolResolveFn_(MediaPool.for(storyImpl));
        },
        (reason) => this.mediaPoolRejectFn_(reason)
      );
    });
  }

  /**
   * Marks any AMP elements that represent media elements with preload="auto".
   * @private
   */
  markMediaElementsWithPreload_() {
    const mediaSet = this.element.querySelectorAll('amp-audio, amp-video');
    Array.prototype.forEach.call(mediaSet, (mediaItem) => {
      mediaItem.setAttribute('preload', 'auto');
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
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
          if (this.animationManager_) {
            this.animationManager_.resumeAll();
          }
        }

        this.state_ = state;
        break;
      case PageState.PAUSED:
        // canResume keeps the time advancement timer if set to true, and resets
        // it when set to false. If the bookend if open, reset the timer. If
        // user is long pressing, don't reset it.
        const canResume = !this.storeService_.get(StateProperty.BOOKEND_STATE);
        this.advancement_.stop(canResume);
        this.pauseAllMedia_(false /** rewindToBeginning */);
        if (this.animationManager_) {
          this.animationManager_.pauseAll();
        }
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
    this.advancement_.stop();

    this.stopMeasuringAllVideoPerformance_();
    this.stopListeningToVideoEvents_();
    this.toggleErrorMessage_(false);
    this.togglePlayMessage_(false);
    this.playAudioElementFromTimestamp_ = null;

    if (
      this.storeService_.get(StateProperty.UI_STATE) === UIType.DESKTOP_PANELS
    ) {
      // The rewinding is delayed on desktop so that it happens at a lower
      // opacity instead of immediately jumping to the first frame. See #17985.
      this.pauseAllMedia_(false /** rewindToBeginning */);
      this.timer_.delay(() => {
        this.rewindAllMedia_();
      }, REWIND_TIMEOUT_MS);
    } else {
      this.pauseAllMedia_(true /** rewindToBeginning */);
    }

    if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
      this.muteAllMedia();
    }

    if (this.animationManager_) {
      this.animationManager_.cancelAll();
    }

    this.story360components_.forEach((componentPromise) => {
      componentPromise.then((component) => {
        component.pause();
        component.rewind();
      });
    });
  }

  /**
   * @private
   */
  resume_() {
    const registerAllPromise = this.registerAllMedia_();

    if (this.isActive()) {
      registerAllPromise.then(() => {
        this.signals()
          .whenSignal(CommonSignals.LOAD_END)
          .then(() => {
            if (this.state_ == PageState.PLAYING) {
              this.advancement_.start();
            }
          });
        this.preloadAllMedia_().then(() => {
          this.startMeasuringAllVideoPerformance_();
          this.startListeningToVideoEvents_();
          this.playAllMedia_();
          if (!this.storeService_.get(StateProperty.MUTED_STATE)) {
            this.unmuteAllMedia();
          }
        });
      });
      this.prefersReducedMotion_()
        ? this.maybeFinishAnimations_()
        : this.maybeStartAnimations_();
      this.checkPageHasAudio_();
      this.checkPageHasElementWithPlayback_();
      this.renderOpenAttachmentUI_();
      this.findAndPrepareEmbeddedComponents_();
      this.story360components_.forEach((componentPromise) => {
        componentPromise.then((component) => {
          if (component.canAnimate) {
            component.play();
          }
        });
      });
    }

    this.reportDevModeErrors_();
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
    this.getViewport().onResize(
      debounce(this.win, () => this.onResize_(), RESIZE_TIMEOUT_MS)
    );
    return Promise.all([
      this.beforeVisible(),
      this.waitForMediaLayout_(),
      this.mediaPoolPromise_,
    ]);
  }

  // TODO(26866): switch back to onMeasuredChange and remove the layoutBox
  // equality checks.
  /** @override */
  onLayoutMeasure() {
    const layoutBox = this.getLayoutBox();
    // Only measures from the first story page, that always gets built because
    // of the prerendering optimizations in place.
    if (
      !this.isFirstPage() ||
      (this.layoutBox_ &&
        this.layoutBox_.width === layoutBox.width &&
        this.layoutBox_.height === layoutBox.height)
    ) {
      return;
    }

    this.layoutBox_ = layoutBox;

    return this.getVsync().runPromise(
      {
        measure: (state) => {
          const uiState = this.storeService_.get(StateProperty.UI_STATE);
          // The desktop panels UI uses CSS scale. Retrieving clientHeight/Width
          // ensures we are getting the raw size, ignoring the scale.
          const {width, height} =
            uiState === UIType.DESKTOP_PANELS
              ? {
                  height: this.element./*OK*/ clientHeight,
                  width: this.element./*OK*/ clientWidth,
                }
              : layoutBox;
          state.height = height;
          state.width = width;
          state.vh = height / 100;
          state.vw = width / 100;
          state.fiftyVw = Math.round(width / 2);
          state.vmin = Math.min(state.vh, state.vw);
          state.vmax = Math.max(state.vh, state.vw);
        },
        mutate: (state) => {
          const {height, width} = state;
          if (state.vh === 0 && state.vw === 0) {
            return;
          }
          this.storeService_.dispatch(Action.SET_PAGE_SIZE, {height, width});
          if (!this.cssVariablesStyleEl_) {
            const doc = this.win.document;
            this.cssVariablesStyleEl_ = doc.createElement('style');
            this.cssVariablesStyleEl_.setAttribute('type', 'text/css');
            doc.head.appendChild(this.cssVariablesStyleEl_);
          }
          this.cssVariablesStyleEl_.textContent =
            `:root {` +
            `--story-page-vh: ${px(state.vh)};` +
            `--story-page-vw: ${px(state.vw)};` +
            `--story-page-vmin: ${px(state.vmin)};` +
            `--story-page-vmax: ${px(state.vmax)};` +
            `--i-amphtml-story-page-50vw: ${px(state.fiftyVw)};` +
            `}`;
        },
      },
      {}
    );
  }

  /**
   * @private
   */
  onResize_() {
    this.findAndPrepareEmbeddedComponents_(true /* forceResize */);
  }

  /**
   * Reacts to UI state updates.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    // On vertical rendering, render all the animations with their final state.
    if (uiState === UIType.VERTICAL) {
      this.maybeFinishAnimations_();
    }
  }

  /** @return {!Promise} */
  beforeVisible() {
    return this.maybeApplyFirstAnimationFrame();
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
            whenUpgradedToCustomElement(mediaEl)
              .then((el) => el.signals().whenSignal(CommonSignals.LOAD_END))
              .then(resolve, resolve);
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
            resolve();
        }

        // We suppress errors so that Promise.all will still wait for all
        // promises to complete, even if one has failed.  We do nothing with the
        // error, as the resource itself and/or code that loads it should handle
        // the error.
        mediaEl.addEventListener('error', resolve, true /* useCapture */);
      });
    });
    return Promise.all(mediaPromises).then(() => this.markPageAsLoaded_());
  }

  /**
   * @return {!Promise}
   * @private
   */
  waitForPlaybackMediaLayout_() {
    const mediaSet = toArray(
      this.getMediaBySelector_(Selectors.ALL_PLAYBACK_AMP_MEDIA)
    );

    const mediaPromises = mediaSet.map((mediaEl) => {
      return new Promise((resolve) => {
        switch (mediaEl.tagName.toLowerCase()) {
          case 'amp-audio':
          case 'amp-video':
            const signal =
              mediaEl.getAttribute('layout') === Layout.NODISPLAY
                ? CommonSignals.BUILT
                : CommonSignals.LOAD_END;

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
   * Finds embedded components in page and prepares them.
   * @param {boolean=} forceResize
   * @private
   */
  findAndPrepareEmbeddedComponents_(forceResize = false) {
    this.addClickShieldToEmbeddedComponents_();
    this.resizeInteractiveEmbeddedComponents_(forceResize);
    this.buildAffiliateLinks_();
  }

  /**
   * Adds a pseudo element on top of the embed to block clicks from going into
   * the iframe.
   * @private
   */
  addClickShieldToEmbeddedComponents_() {
    const componentEls = toArray(
      scopedQuerySelectorAll(this.element, EMBEDDED_COMPONENTS_SELECTORS)
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

  /**
   * Resizes interactive embeds to prepare them for their expanded animation.
   * @param {boolean} forceResize
   * @private
   */
  resizeInteractiveEmbeddedComponents_(forceResize) {
    toArray(
      scopedQuerySelectorAll(
        this.element,
        INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS
      )
    ).forEach((el) => {
      const debouncePrepareForAnimation = debounceEmbedResize(
        this.win,
        this.element,
        this.mutator_
      );

      if (forceResize) {
        debouncePrepareForAnimation(el, null /* unlisten */);
      } else if (!el.hasAttribute(EMBED_ID_ATTRIBUTE_NAME)) {
        // Element has not been prepared for its animation yet.
        const unlisten = listen(el, AmpEvents.SIZE_CHANGED, () => {
          debouncePrepareForAnimation(el, unlisten);
        });
        // Run in case target never changes size.
        debouncePrepareForAnimation(el, null /* unlisten */);
      }
    });
  }

  /**
   * Initializes affiliate links.
   */
  buildAffiliateLinks_() {
    toArray(
      scopedQuerySelectorAll(this.element, AFFILIATE_LINK_SELECTOR)
    ).forEach((el) => {
      const link = new AmpStoryAffiliateLink(this.win, el);
      link.build();
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

  /** @override */
  prerenderAllowed() {
    return this.isFirstPage();
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

    iterateCursor(scopedQuerySelectorAll(this.element, selector), (el) =>
      mediaSet.push(el)
    );

    if (fie) {
      iterateCursor(
        scopedQuerySelectorAll(
          fie.win.document.body,
          Selectors.ALL_IFRAMED_MEDIA
        ),
        (el) => mediaSet.push(el)
      );
    }

    return mediaSet;
  }

  /**
   * @return {!Promise<boolean>}
   * @private
   */
  isAutoplaySupported_() {
    VideoUtils.resetIsAutoplaySupported();
    return VideoUtils.isAutoplaySupported(this.win, getMode(this.win).lite);
  }

  /**
   * Applies the specified callback to each media element on the page, after the
   * media element is loaded.
   * @param {!function(!./media-pool.MediaPool, !Element)} callbackFn The
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
      mediaEl.play();
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
    return this.whenAllMediaElements_((mediaPool, mediaEl) => {
      this.preloadMedia_(mediaPool, mediaEl);
    });
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
        mediaEl.play();
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
      this.registerAllMediaPromise_ = this.waitForPlaybackMediaLayout_().then(
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
   * Rewinds all media on this page.
   * @return {!Promise} Promise that resolves after the callbacks are called.
   * @private
   */
  rewindAllMedia_() {
    return this.whenAllMediaElements_((mediaPool, mediaEl) => {
      if (this.isBotUserAgent_) {
        mediaEl.currentTime = 0;
        return Promise.resolve();
      } else {
        return mediaPool.rewindToBeginning(
          /** @type {!./media-pool.DomElementDef} */ (mediaEl)
        );
      }
    });
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
      .whenSignal(CommonSignals.LOAD_END)
      .then(() => this.maybeApplyFirstAnimationFrame())
      .then(() => {
        this.animationManager_.finishAll();
      });
  }

  /**
   * Whether the device opted in prefers-reduced-motion.
   * @return {boolean}
   * @private
   */
  prefersReducedMotion_() {
    return this.win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * @return {!Promise}
   */
  maybeApplyFirstAnimationFrame() {
    if (!this.animationManager_) {
      return Promise.resolve();
    }
    return this.animationManager_.applyFirstFrame();
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

    this.element.setAttribute('distance', distance);
    this.element.setAttribute('aria-hidden', distance != 0);

    const registerAllPromise = this.registerAllMedia_();

    if (distance > 0 && distance <= 2) {
      this.findAndPrepareEmbeddedComponents_();
      registerAllPromise.then(() => this.preloadAllMedia_());
    }
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
    if (this.isAd() || this.state_ === PageState.NOT_ACTIVE) {
      return;
    }

    const payload = dict({
      'pageId': this.element.id,
      'progress': progress,
    });
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
    const payload = dict({
      'targetPageId': targetPageId,
      'direction': direction,
    });
    const eventInit = {bubbles: true};
    dispatch(this.win, this.element, EventType.SWITCH_PAGE, payload, eventInit);
  }

  /**
   * Checks if the page has any audio.
   * @private
   */
  checkPageHasAudio_() {
    const pageHasAudio =
      this.element.hasAttribute('background-audio') ||
      this.element.querySelector('amp-audio') ||
      this.hasVideoWithAudio_();

    this.storeService_.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, pageHasAudio);
  }

  /**
   * Checks if the page has any videos with audio.
   * @return {boolean}
   * @private
   */
  hasVideoWithAudio_() {
    const ampVideoEls = this.element.querySelectorAll('amp-video');
    return Array.prototype.some.call(
      ampVideoEls,
      (video) => !video.hasAttribute('noaudio')
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
   * @private
   */
  reportDevModeErrors_() {
    if (!getMode().development) {
      return;
    }

    getLogEntries(this.element).then((logEntries) => {
      dispatch(
        this.win,
        this.element,
        EventType.DEV_LOG_ENTRIES_AVAILABLE,
        // ? is OK because all consumers are internal.
        /** @type {?} */ (logEntries),
        {bubbles: true}
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

    const videoEls = /** @type {!Array<!HTMLMediaElement>} */ (this.getAllVideos_());
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

    Array.prototype.forEach.call(videoEls, (videoEl) => {
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
   * @private
   */
  buildAndAppendLoadingSpinner_() {
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
  toggleLoadingSpinner_(isActive) {
    this.mutateElement(() => {
      if (!this.loadingSpinner_) {
        this.buildAndAppendLoadingSpinner_();
      }

      this.loadingSpinner_.toggle(isActive);
    });
  }

  /**
   * Builds and appends a message and icon to play the story on tap.
   * This message is built when the playback failed (data saver, low battery
   * modes, ...).
   * @private
   */
  buildAndAppendPlayMessage_() {
    this.playMessageEl_ = buildPlayMessageElement(this.element);
    const labelEl = this.playMessageEl_.querySelector(
      '.i-amphtml-story-page-play-label'
    );
    labelEl.textContent = getLocalizationService(
      this.element
    ).getLocalizedString(LocalizedStringId.AMP_STORY_PAGE_PLAY_VIDEO);

    this.playMessageEl_.addEventListener('click', () => {
      this.togglePlayMessage_(false);
      this.startMeasuringAllVideoPerformance_();
      this.mediaPoolPromise_
        .then((mediaPool) => mediaPool.blessAll())
        .then(() => this.playAllMedia_());
    });

    this.mutateElement(() => this.element.appendChild(this.playMessageEl_));
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
    this.errorMessageEl_ = buildErrorMessageElement(this.element);
    const labelEl = this.errorMessageEl_.querySelector(
      '.i-amphtml-story-page-error-label'
    );
    labelEl.textContent = getLocalizationService(
      this.element
    ).getLocalizedString(LocalizedStringId.AMP_STORY_PAGE_ERROR_VIDEO);

    this.mutateElement(() => this.element.appendChild(this.errorMessageEl_));
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
   * Renders the open attachment UI affordance.
   * @private
   */
  renderOpenAttachmentUI_() {
    const attachmentEl = this.element.querySelector(
      'amp-story-page-attachment'
    );
    if (!attachmentEl) {
      return;
    }

    if (!this.openAttachmentEl_) {
      this.openAttachmentEl_ = buildOpenAttachmentElement(this.element);
      this.openAttachmentEl_.addEventListener('click', () =>
        this.openAttachment()
      );

      const textEl = this.openAttachmentEl_.querySelector(
        '.i-amphtml-story-page-open-attachment-label'
      );

      const openLabelAttr = attachmentEl.getAttribute('data-cta-text');
      const openLabel =
        (openLabelAttr && openLabelAttr.trim()) ||
        getLocalizationService(this.element).getLocalizedString(
          LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL
        );

      this.mutateElement(() => {
        textEl.textContent = openLabel;
        this.element.appendChild(this.openAttachmentEl_);
      });
    }
  }

  /**
   * Opens the attachment, if any.
   * @param {boolean=} shouldAnimate
   */
  openAttachment(shouldAnimate = true) {
    const attachmentEl = this.element.querySelector(
      'amp-story-page-attachment'
    );

    if (!attachmentEl) {
      return;
    }

    attachmentEl.getImpl().then((attachment) => attachment.open(shouldAnimate));
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
      renderPageDescription(
        this,
        this.getMediaBySelector_(Selectors.ALL_AMP_VIDEO)
      );
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
        ampImgNode.setAttribute('alt', ' ');
        // If the child img element is in the dom, propogate the attribute to it.
        const childImgNode = ampImgNode.querySelector('img');
        childImgNode &&
          ampImgNode
            .getImpl()
            .then((ampImg) => ampImg.propagateAttributes('alt', childImgNode));
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
   * @private
   * @return {!Array<!Promise<!../../amp-story-360/0.1/amp-story-360.AmpStory360>>}
   */
  get story360components_() {
    if (!this.story360componentsCache_) {
      this.story360componentsCache_ = toArray(
        scopedQuerySelectorAll(this.element, Selectors.ALL_STORY_360)
      ).map((element) =>
        whenUpgradedToCustomElement(element).then((customEl) =>
          customEl.getImpl()
        )
      );
    }
    return this.story360componentsCache_;
  }
}
