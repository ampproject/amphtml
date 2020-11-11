/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import * as ampToolboxCacheUrl from '@ampproject/toolbox-cache-url';
import {Deferred} from '../utils/promise';
import {IframePool} from './amp-story-player-iframe-pool';
import {Messaging} from '@ampproject/viewer-messaging';
import {VisibilityState} from '../visibility-state';
import {
  addParamsToUrl,
  getFragment,
  isProxyOrigin,
  parseQueryString,
  parseUrlWithA,
  removeFragment,
  removeSearch,
  serializeQueryString,
} from '../url';
import {applySandbox} from '../3p-frame';
import {createCustomEvent} from '../event-helper';
import {dict, map} from '../utils/object';
import {isJsonScriptTag, tryFocus} from '../dom';
// Source for this constant is css/amp-story-player-iframe.css
import {cssText} from '../../build/amp-story-player-iframe.css';
import {dev} from '../log';
import {findIndex} from '../utils/array';
import {getMode} from '../../src/mode';
import {parseJson} from '../json';
import {resetStyles, setStyle, setStyles} from '../style';
import {toArray} from '../types';

/** @enum {string} */
const LoadStateClass = {
  LOADING: 'i-amphtml-story-player-loading',
  LOADED: 'i-amphtml-story-player-loaded',
  ERROR: 'i-amphtml-story-player-error',
};

/** @enum {number} */
const IframePosition = {
  PREVIOUS: -1,
  CURRENT: 0,
  NEXT: 1,
};

/** @const @type {!Array<string>} */
const SUPPORTED_CACHES = ['cdn.ampproject.org', 'www.bing-amp.com'];

/** @const @type {!Array<string>} */
const SANDBOX_MIN_LIST = ['allow-top-navigation'];

/** @enum {number} */
const SwipingState = {
  NOT_SWIPING: 0,
  SWIPING_TO_LEFT: 1,
  SWIPING_TO_RIGHT: 2,
};

/** @const {number} */
const TOGGLE_THRESHOLD_PX = 50;

/**
 * Fetches more stories when reaching the threshold.
 * @const {number}
 */
const FETCH_STORIES_THRESHOLD = 2;

/** @const {number} */
const MAX_IFRAMES = 3;

/** @enum {string} */
const DEPRECATED_BUTTON_TYPES = {
  BACK: 'back-button',
  CLOSE: 'close-button',
};

/** @enum {string} */
const DEPRECATED_BUTTON_CLASSES = {
  BASE: 'amp-story-player-exit-control-button',
  HIDDEN: 'amp-story-player-hide-button',
  [DEPRECATED_BUTTON_TYPES.BACK]: 'amp-story-player-back-button',
  [DEPRECATED_BUTTON_TYPES.CLOSE]: 'amp-story-player-close-button',
};

/** @enum {string} */
const DEPRECATED_EVENT_NAMES = {
  [DEPRECATED_BUTTON_TYPES.BACK]: 'amp-story-player-back',
  [DEPRECATED_BUTTON_TYPES.CLOSE]: 'amp-story-player-close',
};

/** @enum {string} */
const STORY_STATE_TYPE = {
  PAGE_ATTACHMENT_STATE: 'page-attachment',
};

/** @enum {string} */
const STORY_MESSAGE_STATE_TYPE = {
  PAGE_ATTACHMENT_STATE: 'PAGE_ATTACHMENT_STATE',
  MUTED_STATE: 'MUTED_STATE',
  CURRENT_PAGE_ID: 'CURRENT_PAGE_ID',
  STORY_PROGRESS: 'STORY_PROGRESS',
};

/** @const {string} */
export const AMP_STORY_PLAYER_EVENT = 'AMP_STORY_PLAYER_EVENT';

/** @typedef {{ state:string, value:(boolean|string) }} */
let DocumentStateTypeDef;

/**
 * @typedef {{
 *   href: string,
 *   idx: number,
 *   iframeIdx: number,
 *   title: (?string),
 *   poster: (?string)
 * }}
 */
let StoryDef;

/**
 * @typedef {{
 *   on: string,
 *   action: string,
 *   endpoint: string,
 * }}
 */
let BehaviorDef;

/**
 * @typedef {{
 *   controls: (!Array<!ViewerControlDef>),
 *   behavior: !BehaviorDef,
 * }}
 */
let ConfigDef;

/**
 * @typedef {{
 *   name: string,
 *   state: (?string),
 *   event: (?string),
 *   visibility: (?string),
 *   position: (?string),
 *   backgroundImageUrl: (?string)
 * }}
 */
export let ViewerControlDef;

/** @type {string} */
const TAG = 'amp-story-player';

/**
 * Note that this is a vanilla JavaScript class and should not depend on AMP
 * services, as v0.js is not expected to be loaded in this context.
 */
export class AmpStoryPlayer {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  constructor(win, element) {
    console./*OK*/ assert(
      element.childElementCount > 0,
      'Missing configuration.'
    );

    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Array<!Element>} */
    this.iframes_ = [];

    /** @private {!Element} */
    this.element_ = element;

    /** @private {!Document} */
    this.doc_ = win.document;

    /** @private {!Element} */
    this.cachedA_ = this.doc_.createElement('a');

    /** @private {!Array<!StoryDef>} */
    this.stories_ = [];

    /** @private {?Element} */
    this.rootEl_ = null;

    /** @private {boolean} */
    this.isLaidOut_ = false;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {!IframePool} */
    this.iframePool_ = new IframePool();

    /** @private {!Object<number, !Promise>} */
    this.messagingPromises_ = map();

    /** @private {number} */
    this.currentIdx_ = 0;

    /** @private {!SwipingState} */
    this.swipingState_ = SwipingState.NOT_SWIPING;

    /** @private {?ConfigDef} */
    this.playerConfig_ = null;

    /** @private {?boolean} */
    this.isFetchingStoriesEnabled_ = null;

    /** @private {?boolean} */
    this.isCircularWrappingEnabled_ = null;

    /** @private {!Object} */
    this.touchEventState_ = {
      startX: 0,
      startY: 0,
      lastX: 0,
      isSwipeX: null,
    };

    /** @private {?Deferred} */
    this.currentStoryLoadDeferred_ = null;

    this.attachCallbacksToElement_();
  }

  /**
   * Attaches callbacks to the DOM element for them to be used by publishers.
   * @private
   */
  attachCallbacksToElement_() {
    this.element_.getStories = this.getStories.bind(this);
    this.element_.load = this.load.bind(this);
    this.element_.show = this.show.bind(this);
    this.element_.add = this.add.bind(this);
    this.element_.play = this.play.bind(this);
    this.element_.pause = this.pause.bind(this);
    this.element_.go = this.go.bind(this);
    this.element_.mute = this.mute.bind(this);
    this.element_.unmute = this.unmute.bind(this);
    this.element_.getStoryState = this.getStoryState.bind(this);
  }

  /**
   * External callback for manually loading the player.
   * @public
   */
  load() {
    this.buildCallback();
    this.layoutCallback();
  }

  /**
   * Adds stories to the player. Additionally, creates or assigns
   * iframes to those that are close to the current playing story.
   * @param {!Array<!{href: string, title: ?string, posterImage: ?string}>} stories
   * @public
   */
  add(stories) {
    if (stories.length <= 0) {
      return;
    }

    const isStoryDef = (story) => story && story.href;
    if (!Array.isArray(stories) || !stories.every(isStoryDef)) {
      throw new Error('"stories" parameter has the wrong structure');
    }

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      story.iframeIdx = -1;

      story.idx = this.stories_.push(story) - 1;

      if (this.iframes_.length < MAX_IFRAMES) {
        this.createIframeForStory_(this.stories_.length - 1);
        continue;
      }

      // If this story is after the current one
      if (this.stories_[this.currentIdx_ + 1] === story) {
        this.allocateIframeForStory_(this.currentIdx_ + 1);
        continue;
      }
    }
  }

  /**
   * Makes the current story play its content/auto-advance
   * @public
   */
  play() {
    this.togglePaused_(false);
  }

  /**
   * Makes the current story pause its content/auto-advance
   * @public
   */
  pause() {
    this.togglePaused_(true);
  }

  /**
   * Makes the current story play or pause its content/auto-advance
   * @param {boolean} paused If true, the story will be paused, and it will be played otherwise
   * @private
   */
  togglePaused_(paused) {
    const currentStory = this.stories_[this.currentIdx_];
    const {iframeIdx} = currentStory;

    this.updateVisibilityState_(
      iframeIdx,
      paused ? VisibilityState.PAUSED : VisibilityState.VISIBLE
    );
  }

  /**
   *
   * @public
   * @return {!Element}
   */
  getElement() {
    return this.element_;
  }

  /**
   * @return {!Array<!StoryDef>}
   * @public
   */
  getStories() {
    return this.stories_;
  }

  /** @public */
  buildCallback() {
    if (this.isBuilt_) {
      return;
    }

    this.initializeStories_();
    this.initializeShadowRoot_();
    this.initializeIframes_();
    this.initializeButton_();
    this.readPlayerConfig_();
    this.maybeFetchMoreStories_(this.stories_.length - this.currentIdx_ - 1);
    this.initializeCircularWrapping_();
    this.signalReady_();
    this.isBuilt_ = true;
  }

  /** @private */
  initializeStories_() {
    const anchorEls = toArray(this.element_.querySelectorAll('a'));

    this.stories_ = anchorEls.map(
      (anchorEl, idx) =>
        /** @type {!StoryDef} */ ({
          href: anchorEl.href,
          title: (anchorEl.textContent && anchorEl.textContent.trim()) || null,
          poster: anchorEl.getAttribute('data-poster-portrait-src'),
          iframeIdx: -1,
          idx,
        })
    );
  }

  /** @private */
  signalReady_() {
    this.element_.dispatchEvent(
      createCustomEvent(this.win_, 'ready', dict({}))
    );
    this.element_.isReady = true;
  }

  /** @private */
  initializeIframes_() {
    for (let idx = 0; idx < MAX_IFRAMES && idx < this.stories_.length; idx++) {
      this.createIframeForStory_(idx);
    }
  }

  /**
   * Creates an iframe for a certain story. Should only be done if
   * this.iframes_.length < this.MAX_IFRAMES. It is assumed that iframes
   * are created for stories in order, starting from the first one.
   * @param {number} idx The index of the story in this.stories_, which
   *    will also correspond to the index of its iframe in this.iframes_.
   * @private
   */
  createIframeForStory_(idx) {
    const story = this.stories_[idx];

    this.buildIframe_(story);
    const iframe = this.iframes_[idx];

    story.iframeIdx = idx;
    this.setUpMessagingForIframe_(story, iframe);

    this.iframePool_.addIframeIdx(idx);
    this.iframePool_.addStoryIdx(idx);

    if (this.isLaidOut_) {
      this.layoutIframe_(
        story,
        iframe,
        // In case it is the first story, it becomes immediately visibile
        idx === 0 ? VisibilityState.VISIBLE : VisibilityState.PRERENDER
      );
    }
  }

  /** @private */
  initializeShadowRoot_() {
    this.rootEl_ = this.doc_.createElement('div');
    this.rootEl_.classList.add('i-amphtml-story-player-main-container');

    const shadowContainer = this.doc_.createElement('div');

    // For AMP version.
    shadowContainer.classList.add(
      'i-amphtml-fill-content',
      'i-amphtml-story-player-shadow-root-intermediary'
    );

    this.element_.appendChild(shadowContainer);

    const containerToUse =
      getMode().test || !this.element_.attachShadow
        ? shadowContainer
        : shadowContainer.attachShadow({mode: 'open'});

    // Inject default styles
    const styleEl = this.doc_.createElement('style');
    styleEl.textContent = cssText;
    containerToUse.appendChild(styleEl);
    containerToUse.insertBefore(this.rootEl_, containerToUse.firstElementChild);
  }

  /**
   * Helper to create a button.
   * TODO(#30031): delete this once new custom UI API is ready.
   * @private
   */
  initializeButton_() {
    const option = this.element_.getAttribute('exit-control');
    if (!Object.values(DEPRECATED_BUTTON_TYPES).includes(option)) {
      return;
    }

    const button = this.doc_.createElement('button');
    this.rootEl_.appendChild(button);

    button.classList.add(DEPRECATED_BUTTON_CLASSES[option]);
    button.classList.add(DEPRECATED_BUTTON_CLASSES.BASE);

    button.addEventListener('click', () => {
      this.element_.dispatchEvent(
        createCustomEvent(this.win_, DEPRECATED_EVENT_NAMES[option], dict({}))
      );
    });
  }

  /**
   * Gets publisher configuration for the player
   * @private
   * @return {?ConfigDef}
   */
  readPlayerConfig_() {
    if (this.playerConfig_) {
      return this.playerConfig_;
    }

    const scriptTag = this.element_.querySelector('script');
    if (!scriptTag) {
      return null;
    }

    if (!isJsonScriptTag(scriptTag)) {
      throw new Error('<script> child must have type="application/json"');
    }

    try {
      this.playerConfig_ = /** @type {!ConfigDef} */ (parseJson(
        scriptTag.textContent
      ));
    } catch (reason) {
      console /*OK*/
        .error(`[${TAG}] `, reason);
    }

    return this.playerConfig_;
  }

  /**
   * @param {!StoryDef} story
   * @private
   */
  buildIframe_(story) {
    const iframeEl = this.doc_.createElement('iframe');
    if (story.poster) {
      setStyle(iframeEl, 'backgroundImage', story.poster);
    }
    iframeEl.classList.add('story-player-iframe');
    iframeEl.setAttribute('allow', 'autoplay');
    this.iframes_.push(iframeEl);

    applySandbox(iframeEl);
    this.addSandboxFlags_(iframeEl);
    this.initializeLoadingListeners_(iframeEl);
    this.rootEl_.appendChild(iframeEl);
  }

  /**
   * @param {!Element} iframe
   * @private
   */
  addSandboxFlags_(iframe) {
    if (
      !iframe.sandbox ||
      !iframe.sandbox.supports ||
      iframe.sandbox.length <= 0
    ) {
      return; // Can't feature detect support.
    }

    for (let i = 0; i < SANDBOX_MIN_LIST.length; i++) {
      const flag = SANDBOX_MIN_LIST[i];

      if (!iframe.sandbox.supports(flag)) {
        throw new Error(`Iframe doesn't support: ${flag}`);
      }

      iframe.sandbox.add(flag);
    }
  }

  /**
   * Sets up messaging for a story inside an iframe.
   * @param {!StoryDef} story
   * @param {!Element} iframeEl
   * @private
   */
  setUpMessagingForIframe_(story, iframeEl) {
    const {iframeIdx} = story;

    this.messagingPromises_[iframeIdx] = new Promise((resolve) => {
      this.initializeHandshake_(story, iframeEl).then(
        (messaging) => {
          messaging.setDefaultHandler(() => Promise.resolve());
          messaging.registerHandler('touchstart', (event, data) => {
            this.onTouchStart_(/** @type {!Event} */ (data));
          });

          messaging.registerHandler('touchmove', (event, data) => {
            this.onTouchMove_(/** @type {!Event} */ (data));
          });

          messaging.registerHandler('touchend', () => {
            this.onTouchEnd_();
          });

          messaging.registerHandler('selectDocument', (event, data) => {
            this.onSelectDocument_(/** @type {!Object} */ (data));
          });

          messaging.sendRequest(
            'onDocumentState',
            dict({'state': STORY_MESSAGE_STATE_TYPE.PAGE_ATTACHMENT_STATE}),
            false
          );

          messaging.sendRequest(
            'onDocumentState',
            dict({'state': STORY_MESSAGE_STATE_TYPE.CURRENT_PAGE_ID}),
            false
          );

          messaging.registerHandler('documentStateUpdate', (event, data) => {
            this.onDocumentStateUpdate_(
              /** @type {!DocumentStateTypeDef} */ (data),
              messaging
            );
          });

          if (this.playerConfig_ && this.playerConfig_.controls) {
            this.updateControlsStateForAllStories_(story.idx);

            messaging.sendRequest(
              'customDocumentUI',
              dict({'controls': this.playerConfig_.controls}),
              false
            );
          }

          resolve(messaging);
        },
        (err) => {
          console /*OK*/
            .log({err});
        }
      );
    });
  }

  /**
   * Updates the controls config for a given story.
   * @param {number} storyIdx
   * @private
   */
  updateControlsStateForAllStories_(storyIdx) {
    // Disables skip-next-button when story is the last one in the player.
    if (storyIdx === this.stories_.length - 1) {
      const skipButtonIdx = findIndex(
        this.playerConfig_.controls,
        (control) => control.name === 'skip-next'
      );

      if (skipButtonIdx >= 0) {
        this.playerConfig_.controls[skipButtonIdx].state = 'disabled';
      }
    }
  }

  /**
   * @param {!StoryDef} story
   * @param {!Element} iframeEl
   * @return {!Promise<!Messaging>}
   * @private
   */
  initializeHandshake_(story, iframeEl) {
    return this.maybeGetCacheUrl_(story.href).then((url) => {
      return Messaging.waitForHandshakeFromDocument(
        this.win_,
        iframeEl.contentWindow,
        this.getEncodedLocation_(url).origin
      );
    });
  }

  /**
   * @param {!Element} iframeEl
   * @private
   */
  initializeLoadingListeners_(iframeEl) {
    this.rootEl_.classList.add(LoadStateClass.LOADING);

    iframeEl.onload = () => {
      this.rootEl_.classList.remove(LoadStateClass.LOADING);
      this.rootEl_.classList.add(LoadStateClass.LOADED);
      this.element_.classList.add(LoadStateClass.LOADED);
    };
    iframeEl.onerror = () => {
      this.rootEl_.classList.remove(LoadStateClass.LOADING);
      this.rootEl_.classList.add(LoadStateClass.ERROR);
      this.element_.classList.add(LoadStateClass.ERROR);
    };
  }

  /**
   * @public
   */
  layoutCallback() {
    if (this.isLaidOut_) {
      return;
    }

    for (let idx = 0; idx < this.stories_.length && idx < MAX_IFRAMES; idx++) {
      const story = this.stories_[idx];
      const {iframeIdx} = story;
      const iframe = this.iframes_[iframeIdx];
      this.layoutIframe_(
        story,
        iframe,
        idx === 0 ? VisibilityState.VISIBLE : VisibilityState.PRERENDER
      );
    }

    this.isLaidOut_ = true;
  }

  /**
   * Fetches more stories from the publisher's endpoint.
   * @return {!Promise}
   * @private
   */
  fetchStories_() {
    let {endpoint} = this.playerConfig_.behavior;
    if (!endpoint) {
      this.isFetchingStoriesEnabled_ = false;
      return Promise.resolve();
    }

    const init = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    };

    endpoint = endpoint.replace(/\${offset}/, this.stories_.length.toString());

    return fetch(endpoint, init)
      .then((response) => response.json())
      .catch((reason) => {
        console /*OK*/
          .error(`[${TAG}] `, reason);
      });
  }

  /**
   * Resolves when story in given iframe is finished loading.
   * @param {number} iframeIdx
   * @private
   */
  waitForStoryToLoadPromise_(iframeIdx) {
    this.currentStoryLoadDeferred_ = new Deferred();

    this.messagingPromises_[iframeIdx].then((messaging) =>
      messaging.registerHandler('storyContentLoaded', () => {
        this.currentStoryLoadDeferred_.resolve();
      })
    );
  }

  /**
   * Shows the story provided by the URL in the player.
   * @param {string} storyUrl
   */
  show(storyUrl) {
    // TODO(enriqe): sanitize URLs for matching.
    const storyIdx = findIndex(this.stories_, ({href}) => href === storyUrl);

    // TODO(#28987): replace for add() once implemented.
    if (!this.stories_[storyIdx]) {
      throw new Error(`Story URL not found in the player: ${storyUrl}`);
    }

    if (storyIdx === this.currentIdx_) {
      return;
    }

    const adjacentStoriesIdx = this.iframePool_.findAdjacent(
      storyIdx,
      this.stories_.length - 1
    );

    adjacentStoriesIdx.forEach((idx) => {
      const story = this.stories_[idx];
      let {iframeIdx} = story;

      if (iframeIdx === -1) {
        const visibilityState =
          idx === storyIdx
            ? VisibilityState.VISIBLE
            : VisibilityState.PRERENDER;
        this.allocateIframeForStory_(
          idx,
          storyIdx < this.currentIdx_ /** reverse */,
          visibilityState
        );
        iframeIdx = story.iframeIdx;
      }

      let iframePosition;
      if (idx === storyIdx) {
        iframePosition = IframePosition.CURRENT;
        this.updateVisibilityState_(iframeIdx, VisibilityState.VISIBLE);
        tryFocus(this.iframes_[iframeIdx]);
      } else {
        iframePosition =
          idx > storyIdx ? IframePosition.NEXT : IframePosition.PREVIOUS;
      }

      this.updateIframePosition_(iframeIdx, iframePosition);
    });

    this.currentIdx_ = storyIdx;
    this.onNavigation_();
  }

  /** Sends a message muting the current story. */
  mute() {
    const {iframeIdx} = this.stories_[this.currentIdx_];
    this.updateMutedState_(iframeIdx, true);
  }

  /** Sends a message unmuting the current story. */
  unmute() {
    const {iframeIdx} = this.stories_[this.currentIdx_];
    this.updateMutedState_(iframeIdx, false);
  }

  /**
   * Sends a message asking for the current story's state and dispatches the appropriate event.
   * @param {string} storyStateType
   * @public
   */
  getStoryState(storyStateType) {
    switch (storyStateType) {
      case STORY_STATE_TYPE.PAGE_ATTACHMENT_STATE:
        this.getPageAttachmentState_();
        break;
      default:
        break;
    }
  }

  /**
   * Indicates the player changed story.
   * @param {!Object} data
   * @private
   */
  signalNavigation_(data) {
    const event = createCustomEvent(
      this.win_,
      'navigation',
      /** @type {!JsonObject} */ (data)
    );
    this.element_.dispatchEvent(event);
  }

  /**
   * Triggers when swithing from one story to another.
   * @private
   */
  onNavigation_() {
    const index = this.currentIdx_;
    const remaining = this.stories_.length - this.currentIdx_ - 1;
    const navigation = {
      'index': index,
      'remaining': remaining,
    };

    this.signalNavigation_(navigation);
    this.maybeFetchMoreStories_(remaining);
  }

  /**
   * Fetches more stories if appropiate.
   * @param {number} remaining Number of stories remaining in the player.
   * @private
   */
  maybeFetchMoreStories_(remaining) {
    if (
      this.playerConfig_ &&
      this.playerConfig_.behavior &&
      this.shouldFetchMoreStories_() &&
      remaining <= FETCH_STORIES_THRESHOLD
    ) {
      this.fetchStories_()
        .then((stories) => {
          if (!stories) {
            return;
          }
          this.add(stories);
        })
        .catch((reason) => {
          console /*OK*/
            .error(`[${TAG}] `, reason);
        });
    }
  }

  /**
   * @param {!Object} behavior
   * @return {boolean}
   * @private
   */
  validateBehaviorDef_(behavior) {
    return behavior && behavior.on && behavior.action;
  }

  /**
   * Checks if fetching more stories is enabled and validates the configuration.
   * @return {boolean}
   * @private
   */
  shouldFetchMoreStories_() {
    if (this.isFetchingStoriesEnabled_ !== null) {
      return this.isFetchingStoriesEnabled_;
    }

    const {behavior} = this.playerConfig_;

    const hasEndFetchBehavior = (behavior) =>
      behavior.on === 'end' && behavior.action === 'fetch' && behavior.endpoint;

    this.isFetchingStoriesEnabled_ =
      this.validateBehaviorDef_(behavior) && hasEndFetchBehavior(behavior);

    return this.isFetchingStoriesEnabled_;
  }

  /**
   * Navigates to the next story in the player.
   * @private
   */
  next_() {
    if (
      !this.isCircularWrappingEnabled_ &&
      this.isIndexOutofBounds_(this.currentIdx_ + 1)
    ) {
      return;
    }

    if (
      this.isCircularWrappingEnabled_ &&
      this.isIndexOutofBounds_(this.currentIdx_ + 1)
    ) {
      this.go(1);
      return;
    }

    this.currentIdx_++;

    const previousStory = this.stories_[this.currentIdx_ - 1];
    this.updatePreviousIframe_(previousStory, IframePosition.PREVIOUS);

    const currentStory = this.stories_[this.currentIdx_];
    this.updateCurrentIframe_(currentStory);

    const nextStoryIdx = this.currentIdx_ + 1;
    if (
      nextStoryIdx < this.stories_.length &&
      this.stories_[nextStoryIdx].iframeIdx === -1
    ) {
      this.allocateIframeForStory_(nextStoryIdx);
    }
    this.onNavigation_();
  }

  /**
   * Navigates to the previous story in the player.
   * @private
   */
  previous_() {
    if (
      !this.isCircularWrappingEnabled_ &&
      this.isIndexOutofBounds_(this.currentIdx_ - 1)
    ) {
      return;
    }

    if (
      this.isCircularWrappingEnabled_ &&
      this.isIndexOutofBounds_(this.currentIdx_ - 1)
    ) {
      this.go(-1);
      return;
    }

    this.currentIdx_--;

    const previousStory = this.stories_[this.currentIdx_ + 1];
    this.updatePreviousIframe_(previousStory, IframePosition.NEXT);

    const currentStory = this.stories_[this.currentIdx_];
    this.updateCurrentIframe_(currentStory);

    const nextStoryIdx = this.currentIdx_ - 1;
    if (nextStoryIdx >= 0 && this.stories_[nextStoryIdx].iframeIdx === -1) {
      this.allocateIframeForStory_(nextStoryIdx, true /** reverse */);
    }
    this.onNavigation_();
  }

  /**
   * Navigates stories given a number.
   * @param {number} storyDelta
   * @param {number=} pageDelta
   */
  go(storyDelta, pageDelta = 0) {
    if (storyDelta === 0 && pageDelta === 0) {
      return;
    }

    if (
      !this.isCircularWrappingEnabled_ &&
      this.isIndexOutofBounds_(this.currentIdx_ + storyDelta)
    ) {
      throw new Error('Out of Story range.');
    }

    const newStoryIdx = this.currentIdx_ + storyDelta;
    const newStory =
      storyDelta > 0
        ? this.stories_[newStoryIdx % this.stories_.length]
        : this.stories_[
            ((newStoryIdx % this.stories_.length) + this.stories_.length) %
              this.stories_.length
          ];

    if (this.currentIdx_ !== newStory.idx) {
      this.show(newStory.href);
    }

    this.selectPage_(pageDelta);
  }

  /**
   * Updates an iframe to the `inactive` state.
   * @param {!StoryDef} story
   * @param {!IframePosition} position
   * @private
   */
  updatePreviousIframe_(story, position) {
    const {iframeIdx} = story;
    this.updateVisibilityState_(iframeIdx, VisibilityState.INACTIVE);
    this.updateIframePosition_(iframeIdx, position);
  }

  /**
   * Updates an iframe to the `current` state.
   * @param {!StoryDef} story
   * @private
   */
  updateCurrentIframe_(story) {
    const {iframeIdx} = story;
    const iframeEl = this.iframes_[iframeIdx];

    this.layoutIframe_(story, iframeEl, VisibilityState.VISIBLE).then(() => {
      this.updateVisibilityState_(iframeIdx, VisibilityState.VISIBLE);
      this.updateIframePosition_(iframeIdx, IframePosition.CURRENT);
      tryFocus(iframeEl);
    });
  }

  /**
   * Updates iframe position.
   * @param {number} iframeIdx
   * @param {!IframePosition} position
   * @private
   */
  updateIframePosition_(iframeIdx, position) {
    requestAnimationFrame(() => {
      const iframe = this.iframes_[iframeIdx];
      resetStyles(iframe, ['transform', 'transition']);
      iframe.setAttribute('i-amphtml-iframe-position', position);
    });
  }

  /**
   * Detaches iframe from a story and gives it to the next story. It detaches
   * the iframe from the story furthest away; depending where the user is
   * navigating and allocates it to a story that the user is close to seeing.
   * @param {number} nextStoryIdx
   * @param {boolean} reverse
   * @param {VisibilityState=} visibilityState
   * @private
   */
  allocateIframeForStory_(
    nextStoryIdx,
    reverse = false,
    visibilityState = VisibilityState.PRERENDER
  ) {
    const detachedStoryIdx = reverse
      ? this.iframePool_.rotateLast(nextStoryIdx)
      : this.iframePool_.rotateFirst(nextStoryIdx);

    const detachedStory = this.stories_[detachedStoryIdx];
    const nextStory = this.stories_[nextStoryIdx];

    this.messagingPromises_[detachedStory.iframeIdx].then((messaging) => {
      messaging.unregisterHandler('documentStateUpdate');
      messaging.unregisterHandler('selectDocument');
    });

    nextStory.iframeIdx = detachedStory.iframeIdx;
    detachedStory.iframeIdx = -1;

    const nextIframe = this.iframes_[nextStory.iframeIdx];
    this.layoutIframe_(nextStory, nextIframe, visibilityState);
    this.updateIframePosition_(
      nextStory.iframeIdx,
      reverse ? IframePosition.PREVIOUS : IframePosition.NEXT
    );
    this.setUpMessagingForIframe_(nextStory, nextIframe);
  }

  /**
   * @param {!StoryDef} story
   * @param {!Element} iframe
   * @param {!VisibilityState} visibilityState
   * @return {!Promise}
   * @private
   */
  layoutIframe_(story, iframe, visibilityState) {
    return this.maybeGetCacheUrl_(story.href)
      .then((storyUrl) => {
        if (this.sanitizedUrlsAreEquals_(storyUrl, iframe.src)) {
          return Promise.resolve();
        }

        let navigationPromise;
        if (visibilityState === VisibilityState.VISIBLE) {
          if (this.currentStoryLoadDeferred_) {
            // Reject previous navigation promise.
            this.currentStoryLoadDeferred_.reject(
              'Cancelling previous story load.'
            );
          }
          navigationPromise = Promise.resolve();
          this.waitForStoryToLoadPromise_(story.iframeIdx);
        } else {
          navigationPromise = this.currentStoryLoadDeferred_.promise;
        }

        return navigationPromise.then(() => {
          const {href} = this.getEncodedLocation_(storyUrl, visibilityState);
          iframe.setAttribute('src', href);
          if (story.title) {
            iframe.setAttribute('title', story.title);
          }
        });
      })
      .catch((reason) => {
        console /*OK*/
          .log({reason});
      });
  }

  /**
   * Compares href from the story with the href in the iframe.
   * @param {string} storyHref
   * @param {string} iframeHref
   * @return {boolean}
   * @private
   */
  sanitizedUrlsAreEquals_(storyHref, iframeHref) {
    if (iframeHref.length <= 0) {
      return false;
    }

    const sanitizedIframeHref = removeFragment(removeSearch(iframeHref));
    const sanitizedStoryHref = removeFragment(removeSearch(storyHref));

    return sanitizedIframeHref === sanitizedStoryHref;
  }

  /**
   * Gets cache url, unless amp-cache is not defined.
   * @param {string} url
   * @return {!Promise<string>}
   * @private
   */
  maybeGetCacheUrl_(url) {
    const ampCache = this.element_.getAttribute('amp-cache');

    if (!ampCache || isProxyOrigin(url)) {
      return Promise.resolve(url);
    }

    if (!SUPPORTED_CACHES.includes(ampCache)) {
      throw new Error(
        `Unsupported cache, use one of following: ${SUPPORTED_CACHES}`
      );
    }

    return ampToolboxCacheUrl
      .createCacheUrl(ampCache, url, 'viewer' /** servingType */)
      .then((cacheUrl) => {
        return cacheUrl;
      });
  }

  /**
   * Gets encoded url for player usage.
   * @param {string} href
   * @param {VisibilityState=} visibilityState
   * @return {!Location}
   * @private
   */
  getEncodedLocation_(href, visibilityState = VisibilityState.INACTIVE) {
    const playerFragmentParams = {
      'visibilityState': visibilityState,
      'origin': this.win_.origin,
      'showStoryUrlInfo': '0',
      'storyPlayer': 'v0',
      'cap': 'swipe',
    };

    const originalFragmentString = getFragment(href);
    const originalFragments = parseQueryString(originalFragmentString);

    const fragmentParams = /** @type {!JsonObject} */ ({
      ...originalFragments,
      ...playerFragmentParams,
    });

    let noFragmentUrl = removeFragment(href);
    if (isProxyOrigin(href)) {
      const ampJsQueryParam = dict({
        'amp_js_v': '0.1',
      });
      noFragmentUrl = addParamsToUrl(noFragmentUrl, ampJsQueryParam);
    }
    const inputUrl = noFragmentUrl + '#' + serializeQueryString(fragmentParams);

    return parseUrlWithA(
      /** @type {!HTMLAnchorElement} */ (this.cachedA_),
      inputUrl
    );
  }

  /**
   * Updates the visibility state of the story inside the iframe.
   * @param {number} iframeIdx
   * @param {!VisibilityState} visibilityState
   * @private
   */
  updateVisibilityState_(iframeIdx, visibilityState) {
    this.messagingPromises_[iframeIdx].then((messaging) => {
      messaging.sendRequest('visibilitychange', {state: visibilityState}, true);
    });
  }

  /**
   * Updates the specified iframe's story state with given value.
   * @param {number} iframeIdx
   * @param {string} state
   * @param {boolean} value
   * @private
   */
  updateStoryState_(iframeIdx, state, value) {
    this.messagingPromises_[iframeIdx].then((messaging) => {
      messaging.sendRequest('setDocumentState', {state, value});
    });
  }

  /**
   * Update the muted state of the story inside the iframe.
   * @param {number} iframeIdx
   * @param {boolean} mutedValue
   * @private
   */
  updateMutedState_(iframeIdx, mutedValue) {
    this.updateStoryState_(
      iframeIdx,
      STORY_MESSAGE_STATE_TYPE.MUTED_STATE,
      mutedValue
    );
  }

  /**
   * Send message to story asking for page attachment state.
   * @private
   */
  getPageAttachmentState_() {
    const {iframeIdx} = this.stories_[this.currentIdx_];
    this.messagingPromises_[iframeIdx].then((messaging) => {
      messaging
        .sendRequest(
          'getDocumentState',
          {state: STORY_MESSAGE_STATE_TYPE.PAGE_ATTACHMENT_STATE},
          true
        )
        .then((event) => this.dispatchPageAttachmentEvent_(event.value));
    });
  }

  /**
   * Sends a message to the current story to navigate delta pages.
   * @param {number} delta
   * @private
   */
  selectPage_(delta) {
    if (delta === 0) {
      return;
    }

    this.sendSelectPageDelta_(delta);
  }

  /**
   * @param {number} delta
   * @private
   */
  sendSelectPageDelta_(delta) {
    const {iframeIdx} = this.stories_[this.currentIdx_];
    this.messagingPromises_[iframeIdx].then((messaging) =>
      messaging.sendRequest('selectPage', {delta})
    );
  }

  /**
   * React to documentStateUpdate events.
   * @param {!DocumentStateTypeDef} data
   * @param {Messaging} messaging
   * @private
   */
  onDocumentStateUpdate_(data, messaging) {
    switch (data.state) {
      case STORY_MESSAGE_STATE_TYPE.PAGE_ATTACHMENT_STATE:
        this.onPageAttachmentStateUpdate_(/** @type {boolean} */ (data.value));
        break;
      case STORY_MESSAGE_STATE_TYPE.CURRENT_PAGE_ID:
        this.onCurrentPageIdUpdate_(
          /** @type {string} */ (data.value),
          messaging
        );
        break;
      case AMP_STORY_PLAYER_EVENT:
        this.onPlayerEvent_(/** @type {string} */ (data.value));
        break;
      default:
        break;
    }
  }

  /**
   * Reacts to events coming from the story.
   * @private
   * @param {string} value
   */
  onPlayerEvent_(value) {
    switch (value) {
      case 'amp-story-player-skip-next':
        this.next_();
        break;
      default:
        this.element_.dispatchEvent(
          createCustomEvent(this.win_, value, dict({}))
        );
        break;
    }
  }

  /**
   * Reacts to page id update events inside the story.
   * @param {string} pageId
   * @param {Messaging} messaging
   * @private
   */
  onCurrentPageIdUpdate_(pageId, messaging) {
    messaging
      .sendRequest(
        'getDocumentState',
        dict({'state': STORY_MESSAGE_STATE_TYPE.STORY_PROGRESS}),
        true
      )
      .then((progress) => {
        this.element_.dispatchEvent(
          createCustomEvent(
            this.win_,
            'storyNavigation',
            dict({
              'pageId': pageId,
              'progress': progress.value,
            })
          )
        );
      });
  }

  /**
   * React to page attachment update events.
   * @param {boolean} pageAttachmentOpen
   * @private
   */
  onPageAttachmentStateUpdate_(pageAttachmentOpen) {
    this.updateButtonVisibility_(!pageAttachmentOpen);
    this.dispatchPageAttachmentEvent_(pageAttachmentOpen);
  }

  /**
   * Updates the visbility state of the exit control button.
   * TODO(#30031): delete this once new custom UI API is ready.
   * @param {boolean} isVisible
   * @private
   */
  updateButtonVisibility_(isVisible) {
    const button = this.rootEl_.querySelector(
      'button.amp-story-player-exit-control-button'
    );
    if (!button) {
      return;
    }

    isVisible
      ? button.classList.remove(DEPRECATED_BUTTON_CLASSES.HIDDEN)
      : button.classList.add(DEPRECATED_BUTTON_CLASSES.HIDDEN);
  }

  /**
   * Dispatch a page attachment event.
   * @param {boolean} isPageAttachmentOpen
   * @private
   */
  dispatchPageAttachmentEvent_(isPageAttachmentOpen) {
    this.element_.dispatchEvent(
      createCustomEvent(
        this.win_,
        isPageAttachmentOpen ? 'page-attachment-open' : 'page-attachment-close',
        dict({})
      )
    );
  }

  /**
   * React to selectDocument events.
   * @param {!Object} data
   * @private
   */
  onSelectDocument_(data) {
    this.dispatchEndOfStoriesEvent_(data);
    if (data.next) {
      this.next_();
    } else if (data.previous) {
      this.previous_();
    }
  }

  /**
   * Dispatches end of stories event when appropiate.
   * @param {!Object} data
   * @private
   */
  dispatchEndOfStoriesEvent_(data) {
    if (this.isCircularWrappingEnabled_ || (!data.next && !data.previous)) {
      return;
    }

    let endOfStories, name;
    if (data.next) {
      endOfStories = this.currentIdx_ + 1 === this.stories_.length;
      name = 'noNextStory';
    } else {
      endOfStories = this.currentIdx_ === 0;
      name = 'noPreviousStory';
    }

    if (endOfStories) {
      this.element_.dispatchEvent(createCustomEvent(this.win_, name, dict({})));
    }
  }

  /**
   * Reacts to touchstart events and caches its coordinates.
   * @param {!Event} event
   * @private
   */
  onTouchStart_(event) {
    const coordinates = this.getClientTouchCoordinates_(event);
    if (!coordinates) {
      return;
    }

    this.touchEventState_.startX = coordinates.x;
    this.touchEventState_.startY = coordinates.y;
  }

  /**
   * Reacts to touchmove events and handles horizontal swipes.
   * @param {!Event} event
   * @private
   */
  onTouchMove_(event) {
    if (this.touchEventState_.isSwipeX === false) {
      return;
    }

    const coordinates = this.getClientTouchCoordinates_(event);
    if (!coordinates) {
      return;
    }

    const {x, y} = coordinates;
    this.touchEventState_.lastX = x;

    if (this.touchEventState_.isSwipeX === null) {
      this.touchEventState_.isSwipeX =
        Math.abs(this.touchEventState_.startX - x) >
        Math.abs(this.touchEventState_.startY - y);
      if (!this.touchEventState_.isSwipeX) {
        return;
      }
    }

    this.onSwipeX_({
      deltaX: x - this.touchEventState_.startX,
      last: false,
    });
  }

  /**
   * Reacts to touchend events. Resets cached touch event states.
   * @private
   */
  onTouchEnd_() {
    if (this.touchEventState_.isSwipeX === true) {
      this.onSwipeX_({
        deltaX: this.touchEventState_.lastX - this.touchEventState_.startX,
        last: true,
      });
    }

    this.touchEventState_.startX = 0;
    this.touchEventState_.startY = 0;
    this.touchEventState_.lastX = 0;
    this.touchEventState_.isSwipeX = null;
    this.swipingState_ = SwipingState.NOT_SWIPING;
  }

  /**
   * Reacts to horizontal swipe events.
   * @param {!Object} gesture
   */
  onSwipeX_(gesture) {
    if (this.stories_.length <= 1) {
      return;
    }

    const {deltaX} = gesture;

    if (gesture.last === true) {
      const delta = Math.abs(deltaX);

      if (this.swipingState_ === SwipingState.SWIPING_TO_LEFT) {
        delta > TOGGLE_THRESHOLD_PX &&
        (this.getSecondaryIframe_() || this.isCircularWrappingEnabled_)
          ? this.next_()
          : this.resetIframeStyles_();
      }

      if (this.swipingState_ === SwipingState.SWIPING_TO_RIGHT) {
        delta > TOGGLE_THRESHOLD_PX &&
        (this.getSecondaryIframe_() || this.isCircularWrappingEnabled_)
          ? this.previous_()
          : this.resetIframeStyles_();
      }

      return;
    }

    this.drag_(deltaX);
  }

  /**
   * Resets styles for the currently swiped iframes.
   * @private
   */
  resetIframeStyles_() {
    const currentIframe = this.iframes_[
      this.stories_[this.currentIdx_].iframeIdx
    ];

    requestAnimationFrame(() => {
      resetStyles(dev().assertElement(currentIframe), [
        'transform',
        'transition',
      ]);
    });

    const secondaryIframe = this.getSecondaryIframe_();
    if (secondaryIframe) {
      requestAnimationFrame(() => {
        resetStyles(dev().assertElement(secondaryIframe), [
          'transform',
          'transition',
        ]);
      });
    }
  }

  /**
   * Gets accompanying iframe for the currently swiped iframe if any.
   * @private
   * @return {?Element}
   */
  getSecondaryIframe_() {
    const nextStoryIdx =
      this.swipingState_ === SwipingState.SWIPING_TO_LEFT
        ? this.currentIdx_ + 1
        : this.currentIdx_ - 1;

    if (nextStoryIdx < 0 || nextStoryIdx >= this.stories_.length) {
      return null;
    }

    return this.iframes_[this.stories_[nextStoryIdx].iframeIdx];
  }

  /**
   * Checks if index is out of bounds.
   * @private
   * @param {number} index
   * @return {boolean}
   */
  isIndexOutofBounds_(index) {
    return index >= this.stories_.length || index < 0;
  }

  /**
   * @private
   * @return {boolean}
   */
  initializeCircularWrapping_() {
    if (this.isCircularWrappingEnabled_ !== null) {
      return this.isCircularWrappingEnabled_;
    }

    if (!this.playerConfig_) {
      this.isCircularWrappingEnabled_ = false;
      return false;
    }

    const {behavior} = this.playerConfig_;

    const hasCircularWrappingEnabled = (behavior) =>
      behavior.on === 'end' && behavior.action === 'circular-wrapping';

    this.isCircularWrappingEnabled_ =
      this.validateBehaviorDef_(behavior) &&
      hasCircularWrappingEnabled(behavior);

    return this.isCircularWrappingEnabled_;
  }

  /**
   * Drags stories following the swiping gesture.
   * @param {number} deltaX
   * @private
   */
  drag_(deltaX) {
    let secondaryTranslate;

    if (deltaX < 0) {
      this.swipingState_ = SwipingState.SWIPING_TO_LEFT;
      secondaryTranslate = `translate3d(calc(100% + ${deltaX}px), 0, 0)`;
    } else {
      this.swipingState_ = SwipingState.SWIPING_TO_RIGHT;
      secondaryTranslate = `translate3d(calc(${deltaX}px - 100%), 0, 0)`;
    }

    const story = this.stories_[this.currentIdx_];
    const iframe = this.iframes_[story.iframeIdx];
    const translate = `translate3d(${deltaX}px, 0, 0)`;

    requestAnimationFrame(() => {
      setStyles(dev().assertElement(iframe), {
        transform: translate,
        transition: 'none',
      });
    });

    const secondaryIframe = this.getSecondaryIframe_();
    if (!secondaryIframe) {
      return;
    }

    requestAnimationFrame(() => {
      setStyles(dev().assertElement(secondaryIframe), {
        transform: secondaryTranslate,
        transition: 'none',
      });
    });
  }

  /**
   * Helper to retrieve the touch coordinates from a TouchEvent.
   * @param {!Event} event
   * @return {?{x: number, y: number}}
   * @private
   */
  getClientTouchCoordinates_(event) {
    const {touches} = event;
    if (!touches || touches.length < 1) {
      return null;
    }

    const {screenX: x, screenY: y} = touches[0];
    return {x, y};
  }
}
