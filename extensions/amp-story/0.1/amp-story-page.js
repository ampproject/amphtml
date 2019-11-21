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
 * @fileoverview Embeds a story
 *
 * Example:
 * <code>
 * <amp-story-page>
 * </amp-story>
 * </code>
 */
import {AdvancementConfig} from './page-advancement';
import {AnimationManager, hasAnimations} from './animation';
import {Deferred} from '../../../src/utils/promise';
import {EventType, dispatch, dispatchCustom} from './events';
import {Layout} from '../../../src/layout';
import {LoadingSpinner} from './loading-spinner';
import {MediaPool} from './media-pool';
import {Services} from '../../../src/services';
import {
  closestAncestorElementBySelector,
  iterateCursor,
  matches,
  scopedQuerySelectorAll,
} from '../../../src/dom';
import {debounce} from '../../../src/utils/rate-limit';
import {delegateAutoplay} from '../../../src/video-interface';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getLogEntries} from './logging';
import {getMode} from '../../../src/mode';
import {listen} from '../../../src/event-helper';
import {upgradeBackgroundAudio} from './audio';

/**
 * CSS class for an amp-story-page that indicates the entire page is loaded.
 * @const {string}
 */
const PAGE_LOADED_CLASS_NAME = 'i-amphtml-story-page-loaded';

/**
 * Selector for which media to wait for on page layout.
 * @const {string}
 */
const PAGE_MEDIA_SELECTOR = 'amp-audio, amp-video, amp-img, amp-anim';

/** @private @const {string} */
const TAG = 'amp-story-page';

/** @private @const {string} */
const ADVERTISEMENT_ATTR_NAME = 'ad';

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

    /** @private @const {!AdvancementConfig} */
    this.advancement_ = AdvancementConfig.forPage(this);

    /** @private {?LoadingSpinner} */
    this.loadingSpinner_ = null;

    /** @private @const {!Promise} */
    this.mediaLayoutPromise_ = this.waitForMediaLayout_();

    /** @private @const {!Promise} */
    this.pageLoadPromise_ = this.mediaLayoutPromise_.then(() => {
      this.markPageAsLoaded_();
    });

    const deferred = new Deferred();

    /** @private @const {!Promise<!MediaPool>} */
    this.mediaPoolPromise_ = deferred.promise;

    /** @private @const {!function(!MediaPool)} */
    this.mediaPoolResolveFn_ = deferred.resolve;

    /** @private @const {!function(*)} */
    this.mediaPoolRejectFn_ = deferred.reject;

    /** @private {boolean} */
    this.prerenderAllowed_ = false;

    /** @const @private {!function(boolean)} */
    this.debounceToggleLoadingSpinner_ = debounce(
      this.win,
      isActive => this.toggleLoadingSpinner_(!!isActive),
      100
    );

    /** @private {!Array<function()>} */
    this.unlisteners_ = [];

    /**
     * Whether the user agent matches a bot.  This is used to prevent resource
     * optimizations that make the document less useful at crawl time, e.g.
     * removing sources from videos.
     * @private @const {boolean}
     */
    this.isBotUserAgent_ = Services.platformFor(this.win).isBot();
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
  firstAttachedCallback() {
    // Only prerender the first story page.
    this.prerenderAllowed_ = matches(
      this.element,
      'amp-story-page:first-of-type'
    );
  }

  /** @override */
  buildCallback() {
    upgradeBackgroundAudio(this.element);
    this.delegateVideoAutoplay();
    this.markMediaElementsWithPreload_();
    this.initializeMediaPool_();
    this.maybeCreateAnimationManager_();
    this.advancement_.addPreviousListener(() => this.previous());
    this.advancement_.addAdvanceListener(() =>
      this.next(/* opt_isAutomaticAdvance */ true)
    );
    this.advancement_.addOnTapNavigationListener(navigationDirection =>
      this.navigateOnTap(navigationDirection)
    );
    this.advancement_.addProgressListener(progress =>
      this.emitProgress_(progress)
    );
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

    storyEl.getImpl().then(
      storyImpl => {
        this.mediaPoolResolveFn_(MediaPool.for(storyImpl));
      },
      reason => this.mediaPoolRejectFn_(reason)
    );
  }

  /**
   * Marks any AMP elements that represent media elements with preload="auto".
   * @private
   */
  markMediaElementsWithPreload_() {
    const mediaSet = this.element.querySelectorAll('amp-audio, amp-video');
    Array.prototype.forEach.call(mediaSet, mediaItem => {
      mediaItem.setAttribute('preload', 'auto');
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  pauseCallback() {
    this.advancement_.stop();

    this.stopListeningToVideoEvents_();
    this.pauseAllMedia_(true /* rewindToBeginning */);

    if (this.animationManager_) {
      this.animationManager_.cancelAll();
    }
  }

  /** @override */
  resumeCallback() {
    this.registerAllMedia_();

    if (this.isActive()) {
      this.advancement_.start();
      this.maybeStartAnimations();
      this.preloadAllMedia_()
        .then(() => this.startListeningToVideoEvents_())
        .then(() => this.playAllMedia_());
    }

    this.reportDevModeErrors_();
  }

  /** @override */
  layoutCallback() {
    this.muteAllMedia();

    return Promise.all([
      this.beforeVisible(),
      this.mediaLayoutPromise_,
      this.mediaPoolPromise_,
    ]);
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
    const mediaSet = scopedQuerySelectorAll(this.element, PAGE_MEDIA_SELECTOR);
    const mediaPromises = Array.prototype.map.call(mediaSet, mediaEl => {
      return new Promise(resolve => {
        switch (mediaEl.tagName.toLowerCase()) {
          case 'amp-img':
          case 'amp-anim':
            mediaEl.addEventListener('load', resolve, true /* useCapture */);
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

    return Promise.all(mediaPromises);
  }

  /** @return {!Promise} */
  whenLoaded() {
    return this.pageLoadPromise_;
  }

  /** @private */
  markPageAsLoaded_() {
    dispatch(this.element, EventType.PAGE_LOADED, true);
    this.mutateElement(() => {
      this.element.classList.add(PAGE_LOADED_CLASS_NAME);
    });
  }

  /** @override */
  prerenderAllowed() {
    return this.prerenderAllowed_;
  }

  /**
   * Gets all media elements on this page.
   * @return {!NodeList<!Element>}
   * @private
   */
  getAllMedia_() {
    return this.element.querySelectorAll('audio, video');
  }

  /**
   * Gets all video elements on this page.
   * @return {!NodeList<!Element>}
   * @private
   */
  getAllVideos_() {
    return this.element.querySelectorAll('video');
  }

  /**
   * Applies the specified callback to each media element on the page, after the
   * media element is loaded.
   * @param {!function(!./media-pool.MediaPool, !Element)} callbackFn The
   *     callback to be applied to each media element.
   * @return {!Promise} Promise that resolves after the callbacks are called.
   */
  whenAllMediaElements_(callbackFn) {
    const mediaSet = this.getAllMedia_();
    return this.mediaPoolPromise_.then(mediaPool => {
      const promises = Array.prototype.map.call(mediaSet, mediaEl => {
        return callbackFn(mediaPool, mediaEl);
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
      if (this.isBotUserAgent_) {
        mediaEl.pause();
      } else {
        return mediaPool.pause(
          /** @type {!HTMLMediaElement} */ (mediaEl),
          rewindToBeginning
        );
      }
    });
  }

  /**
   * Plays all media on this page.
   * @return {!Promise} Promise that resolves after the callbacks are called.
   * @private
   */
  playAllMedia_() {
    return this.whenAllMediaElements_((mediaPool, mediaEl) => {
      if (this.isBotUserAgent_) {
        mediaEl.play();
      } else {
        return mediaPool.play(/** @type {!HTMLMediaElement} */ (mediaEl));
      }
    });
  }

  /**
   * Preloads all media on this page.
   * @return {!Promise} Promise that resolves after the callbacks are called.
   * @private
   */
  preloadAllMedia_() {
    return this.whenAllMediaElements_((mediaPool, mediaEl) => {
      if (this.isBotUserAgent_) {
        // No-op.
      } else {
        return mediaPool.preload(/** @type {!HTMLMediaElement} */ (mediaEl));
      }
    });
  }

  /**
   * Mutes all media on this page.
   * @return {!Promise} Promise that resolves after the callbacks are called.
   */
  muteAllMedia() {
    return this.whenAllMediaElements_((mediaPool, mediaEl) => {
      if (this.isBotUserAgent_) {
        mediaEl.muted = true;
        mediaEl.setAttribute('muted', '');
      } else {
        return mediaPool.mute(/** @type {!HTMLMediaElement} */ (mediaEl));
      }
    });
  }

  /**
   * Unmutes all media on this page.
   * @return {!Promise} Promise that resolves after the callbacks are called.
   */
  unmuteAllMedia() {
    return this.whenAllMediaElements_((mediaPool, mediaEl) => {
      if (this.isBotUserAgent_) {
        mediaEl.muted = false;
        mediaEl.removeAttribute('muted');
      } else {
        return mediaPool.unmute(/** @type {!HTMLMediaElement} */ (mediaEl));
      }
    });
  }

  /**
   * Registers all media on this page
   * @return {!Promise} Promise that resolves after the callbacks are called.
   * @private
   */
  registerAllMedia_() {
    return this.whenAllMediaElements_((mediaPool, mediaEl) => {
      if (this.isBotUserAgent_) {
        // No-op.
      } else {
        return mediaPool.register(/** @type {!HTMLMediaElement} */ (mediaEl));
      }
    });
  }

  /**
   * Starts playing animations, if the animation manager is available.
   */
  maybeStartAnimations() {
    if (!this.animationManager_) {
      return;
    }
    this.animationManager_.animateIn();
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
   * @param {boolean} isActive
   */
  setActive(isActive) {
    if (isActive) {
      this.element.setAttribute('active', '');
      this.beforeVisible();
      this.resumeCallback();
    } else {
      this.element.removeAttribute('active');
      this.pauseCallback();
    }
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
    this.registerAllMedia_();
    if (distance > 0 && distance <= 2) {
      this.preloadAllMedia_();
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
    const payload = dict({
      'pageId': this.element.id,
      'progress': progress,
    });
    const eventInit = {bubbles: true};
    dispatchCustom(
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
    const adjacentPageIds = [];

    const autoAdvanceNext = this.getNextPageId(
      true /* opt_isAutomaticAdvance */
    );
    const manualAdvanceNext = this.getNextPageId(
      false /* opt_isAutomaticAdvance */
    );
    const previous = this.getPreviousPageId_();

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
   * @private
   */
  getPreviousPageId_() {
    if (this.element.hasAttribute('i-amphtml-return-to')) {
      return this.element.getAttribute('i-amphtml-return-to');
    }

    const previousElement = this.element.previousElementSibling;
    if (previousElement && previousElement.tagName.toLowerCase() === TAG) {
      return previousElement.id;
    }

    return null;
  }

  /**
   * Gets the ID of the next page in the story (after the current page).
   * @param {boolean=} opt_isAutomaticAdvance Whether this navigation was caused
   *     by an automatic advancement after a timeout.
   * @return {?string} Returns the ID of the next page in the story, or null if
   *     there isn't one.
   */
  getNextPageId(opt_isAutomaticAdvance) {
    if (
      opt_isAutomaticAdvance &&
      this.element.hasAttribute('auto-advance-to')
    ) {
      return this.element.getAttribute('auto-advance-to');
    }

    if (this.element.hasAttribute('i-amphtml-advance-to')) {
      return this.element.getAttribute('i-amphtml-advance-to');
    }

    const nextElement = this.element.nextElementSibling;
    if (nextElement && nextElement.tagName.toLowerCase() === TAG) {
      return nextElement.id;
    }

    return null;
  }

  /**
   * Navigates to the previous page in the story.
   */
  previous() {
    const targetPageId = this.getPreviousPageId_();

    if (targetPageId === null) {
      dispatch(this.element, EventType.SHOW_NO_PREVIOUS_PAGE_HELP, true);
      return;
    }

    this.switchTo_(targetPageId);
  }

  /**
   * Navigates to the next page in the story.
   * @param {boolean=} opt_isAutomaticAdvance Whether this navigation was caused
   *     by an automatic advancement after a timeout.
   */
  next(opt_isAutomaticAdvance) {
    const pageId = this.getNextPageId(opt_isAutomaticAdvance);

    if (!pageId) {
      return;
    }

    this.switchTo_(pageId);
  }

  /**
   * Delegated the navigation decision to AMP-STORY via event.
   * @param {number} direction The direction in which navigation needs to takes place.
   */
  navigateOnTap(direction) {
    const payload = dict({'direction': direction});
    const eventInit = {bubbles: true};
    dispatchCustom(
      this.win,
      this.element,
      EventType.TAP_NAVIGATION,
      payload,
      eventInit
    );
  }

  /**
   * @param {string} targetPageId
   * @private
   */
  switchTo_(targetPageId) {
    const payload = dict({'targetPageId': targetPageId});
    const eventInit = {bubbles: true};
    dispatchCustom(
      this.win,
      this.element,
      EventType.SWITCH_PAGE,
      payload,
      eventInit
    );
  }

  /**
   * @private
   */
  reportDevModeErrors_() {
    if (!getMode().development) {
      return;
    }

    getLogEntries(this.element).then(logEntries => {
      dispatchCustom(
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
   * Displays a loading spinner whenever the video is buffering.
   * Has to be called after the mediaPool preload method, that swaps the video
   * elements with new amp elements.
   * @private
   */
  startListeningToVideoEvents_() {
    const videos = this.getAllVideos_();

    if (videos.length === 0) {
      return;
    }

    this.debounceToggleLoadingSpinner_(true);
    Array.prototype.forEach.call(videos, videoEl => {
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
    this.unlisteners_.forEach(unlisten => unlisten());
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
    this.getVsync().mutate(() => {
      if (!this.loadingSpinner_) {
        this.buildAndAppendLoadingSpinner_();
      }

      this.loadingSpinner_.toggle(isActive);
    });
  }

  /**
   * check to see if this page is a wrapper for an ad
   * @return {boolean}
   */
  isAd() {
    return this.element.hasAttribute(ADVERTISEMENT_ATTR_NAME);
  }
}
