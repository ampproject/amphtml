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
import {
  AnimationManager,
  hasAnimations,
} from './animation';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {upgradeBackgroundAudio} from './audio';
import {dev, user} from '../../../src/log';
import {EventType, dispatch, dispatchCustom} from './events';
import {PageElement} from './page-element';
import {isFiniteNumber} from '../../../src/types';
import {VideoEvents} from '../../../src/video-interface';
import {listenOnce} from '../../../src/event-helper';
import {scopedQuerySelector, scopedQuerySelectorAll} from '../../../src/dom';

const LOADING_SCREEN_CONTENTS_TEMPLATE =
    `<ul class="i-amphtml-story-page-loading-dots">
      <li class="i-amphtml-story-page-loading-dot"></li>
      <li class="i-amphtml-story-page-loading-dot"></li>
      <li class="i-amphtml-story-page-loading-dot"></li>
    </ul>
    <p class="i-amphtml-story-page-loading-text">Loading</p>`;


/**
 * CSS class for an amp-story-page that indicates the entire page is loaded.
 * @const {string}
 */
const PAGE_LOADED_CLASS_NAME = 'i-amphtml-story-page-loaded';


/**
 * CSS class for an amp-story-page that indicates the entire page can be shown.
 * @const {string}
 */
const PAGE_SHOWN_CLASS_NAME = 'i-amphtml-story-page-shown';


/**
 * The duration of time (in milliseconds) to show the loading screen for this
 * page, before showing the page content.
 * @const {number}
 */
const LOAD_TIMEOUT_MS = 8000;


/**
 * The delay (in milliseconds) to wait between polling for loaded resources.
 */
const LOAD_TIMER_POLL_DELAY_MS = 250;



/** @private @enum {!RegExp} */
const TIME_REGEX = {
  MILLISECONDS: /^(\d+)ms$/,
  SECONDS: /^(\d+)s$/,
};


/** @private @const {string} */
const TAG = 'amp-story-page';



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

    /** @private {!Array<!PageElement>} */
    this.pageElements_ = [];

    /** @private {?function()} */
    this.resolveLoadPromise_ = null;

    /** @private {?Promise<undefined>} */
    this.loadPromise_ = new Promise(resolve => {
      this.resolveLoadPromise_ = resolve;
    });

    /** @private {?Promise<undefined>} */
    this.loadTimeoutPromise_ = null;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win);

    /** @private {boolean} */
    this.isLoaded_ = false;

    /** @private {?UnlistenDef} */
    this.autoAdvanceUnlistenDef_ = null;
  }


  /*
   * @return {?./animation.AnimationManager}
   * @private
   */
  maybeCreateAnimationManager_() {
    if (!this.animationManager_) {
      if (!hasAnimations(this.element)) {
        return;
      }

      this.animationManager_ = AnimationManager.create(
          this.element, this.getAmpDoc(), this.getAmpDoc().getUrl());
    }
  }


  /** @override */
  buildCallback() {
    upgradeBackgroundAudio(this.element);
    this.markMediaElementsWithPreload_();
    this.maybeCreateAnimationManager_();
    this.initializeLoading_();
  }


  /**
   * Marks any AMP elements that represent media elements with preload="auto".
   * @private
   */
  markMediaElementsWithPreload_() {
    const mediaSet = scopedQuerySelectorAll(
        this.element, 'amp-audio, amp-video');
    Array.prototype.forEach.call(mediaSet, mediaItem => {
      mediaItem.setAttribute('preload', 'auto');
    });
  }


  /**
   * Initializes the loading screen for this amp-story-page, and the listeners
   * to remove it once loaded.
   * @private
   */
  initializeLoading_() {
    // Add the loading screen into the DOM.
    const loadingScreen = this.win.document.createElement('div');
    loadingScreen.classList.add('i-amphtml-story-page-loading-screen');
    loadingScreen./*OK*/innerHTML = LOADING_SCREEN_CONTENTS_TEMPLATE;
    this.element.appendChild(loadingScreen);

    // Build a list of page elements and poll until they are all loaded.
    this.pageElements_ = PageElement.getElementsFromPage(this);
    this.loadPromise_ = this.timer_.poll(LOAD_TIMER_POLL_DELAY_MS, () => {
      return this.calculateLoadStatus();
    }).then(() => this.markPageAsLoaded_());
  }


  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }


  /** @override */
  pauseCallback() {
    this.pageInactiveCallback_();
  }


  /** @override */
  resumeCallback() {
    this.pageActiveCallback_();
  }


  /** @private */
  onPageVisible_() {
    this.markPageAsLoaded_();
    this.maybeApplyFirstAnimationFrame();
    this.maybeScheduleAutoAdvance_();
    this.updateAudioIcon_();
    this.playAllMedia_();
  }


  /** @private */
  markPageAsLoaded_() {
    this.isLoaded_ = true;
    this.element.classList.add(PAGE_LOADED_CLASS_NAME);
    this.markPageAsShown_();
    this.resolveLoadPromise_();
  }


  /** @private */
  markPageAsShown_() {
    this.element.classList.add(PAGE_SHOWN_CLASS_NAME);
  }


  /** @private */
  updateAudioIcon_() {
    // Dispatch event to signal whether audio is playing.
    const eventType = this.hasAudio_() ?
        EventType.AUDIO_PLAYING : EventType.AUDIO_STOPPED;
    dispatch(this.element, eventType, /* opt_bubbles */ true);
  }


  /**
   * @return {boolean}
   * @private
   */
  hasAudio_() {
    return this.pageElements_.some(pageElement => pageElement.hasAudio());
  }


  /**
   * @return {boolean} true, if the page is completely loaded; false otherwise.
   * @public
   */
  calculateLoadStatus() {
    if (this.isLoaded_ || this.pageElements_.length == 0) {
      return true;
    }

    let isPageLoaded = true;
    let canPageBeShown = false;

    this.pageElements_.forEach(pageElement => {
      pageElement.updateState();

      if (isPageLoaded) {
        isPageLoaded = pageElement.isLoaded || pageElement.hasFailed;
      }

      if (!canPageBeShown) {
        canPageBeShown = pageElement.canBeShown;
      }
    });

    if (isPageLoaded) {
      this.markPageAsLoaded_();
    }

    if (canPageBeShown) {
      this.markPageAsShown_();
    }

    return isPageLoaded;
  }


  /** @override */
  prerenderAllowed() {
    return true;
  }


  /**
   * Gets all media elements on this page.
   * @return {!NodeList<!Element>}
   * @private
   */
  getAllMedia_() {
    return scopedQuerySelectorAll(this.element, 'audio, video');
  }


  /**
   * Pauses all media on this page.
   * @private
   */
  pauseAllMedia_() {
    const mediaSet = this.getAllMedia_();
    Array.prototype.forEach.call(mediaSet, mediaItem => {
      mediaItem.pause();
      mediaItem.currentTime = 0;
    });
  }


  /**
   * Pauses all media on this page.
   * @private
   */
  playAllMedia_() {
    const mediaSet = this.getAllMedia_();
    Array.prototype.forEach.call(mediaSet, mediaItem => {
      mediaItem.play().catch(() => {
        dev().error('AMP-STORY',
            `Failed to play media element with src ${mediaItem.src}.`);
      });
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
      this.pageActiveCallback_();
    } else {
      this.pageInactiveCallback_();
    }
  }


  /** @private */
  pageActiveCallback_() {
    this.element.setAttribute('active', '');

    if (!this.loadPromise_) {
      return;
    }

    if (!this.loadTimeoutPromise_) {
      this.loadTimeoutPromise_ = this.timer_.promise(LOAD_TIMEOUT_MS);
    }

    this.pageElements_.forEach(pageElement => {
      pageElement.resumeCallback();
    });

    Promise.race([this.loadPromise_, this.loadTimeoutPromise_]).then(() => {
      this.onPageVisible_();
    });
  }


  /** @private */
  pageInactiveCallback_() {
    this.element.removeAttribute('active');

    this.pauseAllMedia_();
    this.pageElements_.forEach(pageElement => {
      pageElement.pauseCallback();
    });

    if (this.autoAdvanceUnlistenDef_) {
      this.autoAdvanceUnlistenDef_();
      this.autoAdvanceUnlistenDef_ = null;
    }

    if (this.animationManager_) {
      this.animationManager_.cancelAll();
    }
  }


  /**
   * @return {boolean} Whether this page is currently active.
   */
  isActive() {
    return this.element.hasAttribute('active');
  }


  /**
   * Gets an HTMLMediaElement from an element that wraps it.
   * @param {!Element} el An element that wraps an HTMLMediaElement.
   * @return {?Element} The underlying HTMLMediaElement, if one exists.
   * @private
   */
  getMediaElement_(el) {
    const tagName = el.tagName.toLowerCase();

    if (el instanceof HTMLMediaElement) {
      return el;
    } else if (el.hasAttribute('background-audio') &&
        (tagName === 'amp-story' || tagName === 'amp-story-page')) {
      return scopedQuerySelector(el, '.i-amphtml-story-background-audio');
    } else if (tagName === 'amp-audio') {
      return scopedQuerySelector(el, 'audio');
    }

    return null;
  }


  /**
   * Determines whether a given element implements the video interface.
   * @param {!Element} el The element to test
   * @return {boolean} true, if the specified element implements the video
   *     interface.
   * @private
   */
  isVideoInterfaceVideo_(el) {
    // TODO(#11533): Check whether the element has the
    // i-amphtml-video-interface class, after #11015 from amphtml is merged
    // into amphtml-story.
    const tagName = el.tagName.toLowerCase();

    return tagName === 'amp-video' || tagName === 'amp-youtube' ||
        tagName === 'amp-3q-player' || tagName === 'amp-ima-video' ||
        tagName === 'amp-ooyala-player' || tagName === 'amp-nexxtv-player' ||
        tagName === 'amp-brid-player' || tagName === 'amp-dailymotion';
  }


  /**
   * Determines whether the specified element is a valid media element for auto-
   * advance.
   * @param {?Element} elOrNull
   * @param {!function()} callback
   * @private
   */
  onMediaElementComplete_(elOrNull, callback) {
    const el = user().assertElement(elOrNull,
        'ID specified for automatic advance does not refer to any element' +
        `on page '${this.element.id}'.`);

    const mediaElement = this.getMediaElement_(el);
    if (mediaElement) {
      this.autoAdvanceUnlistenDef_ =
          listenOnce(mediaElement, 'ended', callback);
    } else if (this.isVideoInterfaceVideo_(el)) {
      this.autoAdvanceUnlistenDef_ =
          listenOnce(el, VideoEvents.ENDED, callback, {capture: true});
    } else {
      user().error(TAG, `Element with ID ${el.id} is not a media element ` +
          'supported for automatic advancement.');
    }
  }


  /**
   * If the auto-advance-after property is set, a timer is set for that
   * duration, after which next() will be invoked.
   * @private
   */
  maybeScheduleAutoAdvance_() {
    const autoAdvanceAfter = this.element.getAttribute('auto-advance-after');

    if (!autoAdvanceAfter) {
      return;
    }

    let delayMs;
    if (TIME_REGEX.MILLISECONDS.test(autoAdvanceAfter)) {
      delayMs = Number(TIME_REGEX.MILLISECONDS.exec(autoAdvanceAfter)[1]);
    } else if (TIME_REGEX.SECONDS.test(autoAdvanceAfter)) {
      delayMs = Number(TIME_REGEX.SECONDS.exec(autoAdvanceAfter)[1]) * 1000;
    }

    if (delayMs) {
      user().assert(isFiniteNumber(delayMs) && delayMs > 0,
          `Invalid automatic advance delay '${autoAdvanceAfter}' ` +
          `for page '${this.element.id}'.`);

      const timeoutId = this.timer_.delay(
          () => this.next(true /* opt_isAutomaticAdvance */), delayMs);
      this.autoAdvanceUnlistenDef_ = () => {
        this.timer_.cancel(timeoutId);
      };
    } else {
      let mediaElement;
      try {
        mediaElement = scopedQuerySelector(
            this.element, `#${autoAdvanceAfter}`);
      } catch (e) {
        user().error(TAG, `Malformed ID '${autoAdvanceAfter}' for automatic ` +
            `advance on page '${this.element.id}'.`);
        return;
      }

      this.onMediaElementComplete_(mediaElement, () => {
        this.next(true /* opt_isAutomaticAdvance */);
      });
    }
  }


  /**
   * Returns all of the pages that are one hop from this page.
   * @return {!Array<string>}
   */
  getAdjacentPageIds() {
    const adjacentPageIds = [];

    const autoAdvanceNext =
        this.getNextPageId_(true /* opt_isAutomaticAdvance */);
    const manualAdvanceNext =
        this.getNextPageId_(false /* opt_isAutomaticAdvance */);
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
   * @private
   */
  getNextPageId_(opt_isAutomaticAdvance) {
    if (opt_isAutomaticAdvance &&
        this.element.hasAttribute('auto-advance-to')) {
      return this.element.getAttribute('auto-advance-to');
    }

    if (this.element.hasAttribute('advance-to')) {
      return this.element.getAttribute('advance-to');
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
    this.switchTo_(this.getPreviousPageId_());
  }


  /**
   * Navigates to the next page in the story.
   * @param {boolean} opt_isAutomaticAdvance Whether this navigation was caused
   *     by an automatic advancement after a timeout.
   */
  next(opt_isAutomaticAdvance) {
    this.switchTo_(
        this.getNextPageId_(opt_isAutomaticAdvance), 'i-amphtml-story-bookend');
  }


  /**
   * @param {?string} targetPageIdOrNull
   * @param {string=} opt_fallbackPageId
   * @private
   */
  switchTo_(targetPageIdOrNull, opt_fallbackPageId) {
    const targetPageId = targetPageIdOrNull || opt_fallbackPageId;
    if (!targetPageId) {
      return;
    }

    const payload = {targetPageId};
    const eventInit = {bubbles: true};
    dispatchCustom(this.win, this.element, EventType.SWITCH_PAGE, payload,
        eventInit);
  }
}

AMP.registerElement('amp-story-page', AmpStoryPage);
