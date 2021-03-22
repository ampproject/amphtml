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
import {AmpStoryPlayerViewportObserver} from './amp-story-player-viewport-observer';
import {Deferred} from '../utils/promise';
import {Messaging} from '@ampproject/viewer-messaging';
import {PageScroller} from './page-scroller';
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
import {dict} from '../utils/object';
import {isJsonScriptTag, tryFocus} from '../dom';
// Source for this constant is css/amp-story-player-iframe.css
import {cssText} from '../../build/amp-story-player-iframe.css';
import {dev} from '../log';
import {findIndex} from '../utils/array';
import {getMode} from '../../src/mode';
import {parseJson} from '../json';
import {resetStyles, setStyle, setStyles} from '../style';
import {toArray} from '../types';
import {urls} from '../config';

/** @enum {string} */
const LoadStateClass = {
  LOADING: 'i-amphtml-story-player-loading',
  LOADED: 'i-amphtml-story-player-loaded',
  ERROR: 'i-amphtml-story-player-error',
};

/** @enum {number} */
const StoryPosition = {
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
 *   distance: number,
 *   iframe: ?Element,
 *   messagingPromise: ?Promise,
 *   title: (?string),
 *   posterImage: (?string),
 *   storyContentLoaded: ?boolean,
 *   connectedDeferred: !Deferred
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

/** @enum {string} */
const LOG_TYPE = {
  DEV: 'amp-story-player-dev',
};

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
    /** @private {!Window} */
    this.win_ = win;

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

    /** @private {!Deferred} */
    this.visibleDeferred_ = new Deferred();

    this.attachCallbacksToElement_();

    /** @private {?PageScroller} */
    this.pageScroller_ = new PageScroller(win);

    /** @private {boolean} */
    this.autoplay_ = true;

    return this.element_;
  }

  /**
   * Attaches callbacks to the DOM element for them to be used by publishers.
   * @private
   */
  attachCallbacksToElement_() {
    this.element_.buildCallback = this.buildCallback.bind(this);
    this.element_.layoutCallback = this.layoutCallback.bind(this);
    this.element_.getElement = this.getElement.bind(this);
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
    this.element_.rewind = this.rewind.bind(this);
  }

  /**
   * External callback for manually loading the player.
   * @public
   */
  load() {
    if (!this.element_.isConnected) {
      throw new Error(
        `[${TAG}] element must be connected to the DOM before calling load().`
      );
    }
    if (!!this.element_.isBuilt_) {
      throw new Error(`[${TAG}] calling load() on an already loaded element.`);
    }
    this.buildCallback();
    this.layoutCallback();
  }

  /**
   * Initializes story with properties used in this class and adds it to the
   * stories array.
   * @param {!StoryDef} story
   * @private
   */
  initializeAndAddStory_(story) {
    story.idx = this.stories_.length;
    story.distance = story.idx - this.currentIdx_;
    story.connectedDeferred = new Deferred();
    this.stories_.push(story);
  }

  /**
   * Adds stories to the player. Additionally, creates or assigns
   * iframes to those that are close to the current playing story.
   * @param {!Array<!{href: string, title: ?string, posterImage: ?string}>} newStories
   * @public
   */
  add(newStories) {
    if (newStories.length <= 0) {
      return;
    }

    const isStoryDef = (story) => story && story.href;
    if (!Array.isArray(newStories) || !newStories.every(isStoryDef)) {
      throw new Error('"stories" parameter has the wrong structure');
    }

    const renderStartingIdx = this.stories_.length;

    for (let i = 0; i < newStories.length; i++) {
      const story = newStories[i];
      this.initializeAndAddStory_(story);
      this.buildIframeFor_(story);
    }

    this.render_(renderStartingIdx);
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

    this.updateVisibilityState_(
      currentStory,
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
    if (!!this.element_.isBuilt_) {
      return;
    }

    this.initializeAnchorElStories_();
    this.initializeShadowRoot_();
    this.buildStories_();
    this.initializeButton_();
    this.readPlayerConfig_();
    this.maybeFetchMoreStories_(this.stories_.length - this.currentIdx_ - 1);
    this.initializeAutoplay_();
    this.initializePageScroll_();
    this.initializeCircularWrapping_();
    this.signalReady_();
    this.element_.isBuilt_ = true;
  }

  /**
   * Initializes stories declared inline as <a> elements.
   * @private
   */
  initializeAnchorElStories_() {
    const anchorEls = toArray(this.element_.querySelectorAll('a'));
    anchorEls.forEach((element) => {
      const posterImgEl = element.querySelector(
        'img[data-amp-story-player-poster-img]'
      );
      const posterImgSrc = posterImgEl && posterImgEl.getAttribute('src');

      const story = /** @type {!StoryDef} */ ({
        href: element.href,
        title: (element.textContent && element.textContent.trim()) || null,
        posterImage:
          element.getAttribute('data-poster-portrait-src') || posterImgSrc,
      });

      this.initializeAndAddStory_(story);
    });
  }

  /** @private */
  signalReady_() {
    this.element_.dispatchEvent(
      createCustomEvent(this.win_, 'ready', dict({}))
    );
    this.element_.isReady = true;
  }

  /** @private */
  buildStories_() {
    this.stories_.forEach((story) => {
      this.buildIframeFor_(story);
    });
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

    const ampCache = this.element_.getAttribute('amp-cache');
    if (ampCache && !SUPPORTED_CACHES.includes(ampCache)) {
      console /*OK*/
        .error(
          `[${TAG}]`,
          `Unsupported cache specified, use one of following: ${SUPPORTED_CACHES}`
        );
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
  buildIframeFor_(story) {
    const iframeEl = this.doc_.createElement('iframe');
    if (story.posterImage) {
      setStyle(iframeEl, 'backgroundImage', story.posterImage);
    }
    iframeEl.classList.add('story-player-iframe');
    iframeEl.setAttribute('allow', 'autoplay');

    applySandbox(iframeEl);
    this.addSandboxFlags_(iframeEl);
    this.initializeLoadingListeners_(iframeEl);

    story.iframe = iframeEl;
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
   * @private
   */
  setUpMessagingForStory_(story) {
    const {iframe} = story;

    story.messagingPromise = new Promise((resolve) => {
      this.initializeHandshake_(story, iframe).then(
        (messaging) => {
          messaging.setDefaultHandler(() => Promise.resolve());
          messaging.registerHandler('touchstart', (event, data) => {
            this.onTouchStart_(/** @type {!Event} */ (data));
          });

          messaging.registerHandler('touchmove', (event, data) => {
            this.onTouchMove_(/** @type {!Event} */ (data));
          });

          messaging.registerHandler('touchend', (event, data) => {
            this.onTouchEnd_(/** @type {!Event} */ (data));
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
            .error(`[${TAG}]`, err);
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
    // Disables skip-to-next button when story is the last one in the player.
    if (storyIdx === this.stories_.length - 1) {
      const skipButtonIdx = findIndex(
        this.playerConfig_.controls,
        (control) =>
          control.name === 'skip-next' || control.name === 'skip-to-next'
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
    return this.maybeGetCacheUrl_(story.href).then((url) =>
      Messaging.waitForHandshakeFromDocument(
        this.win_,
        iframeEl.contentWindow,
        this.getEncodedLocation_(url).origin,
        /*opt_token*/ null,
        urls.cdnProxyRegex
      )
    );
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
    if (!!this.element_.isLaidOut_) {
      return;
    }

    new AmpStoryPlayerViewportObserver(this.win_, this.element_, () =>
      this.visibleDeferred_.resolve()
    );

    this.render_();

    this.element_.isLaidOut_ = true;
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
          .error(`[${TAG}]`, reason);
      });
  }

  /**
   * Resolves currentStoryLoadDeferred_ when given story's content is finished
   * loading.
   * @param {!StoryDef} story
   * @private
   */
  initStoryContentLoadedPromise_(story) {
    this.currentStoryLoadDeferred_ = new Deferred();

    story.messagingPromise.then((messaging) =>
      messaging.registerHandler('storyContentLoaded', () => {
        // Stories that already loaded won't dispatch a `storyContentLoaded`
        // event anymore, which is why we need this sync property.
        story.storyContentLoaded = true;
        this.currentStoryLoadDeferred_.resolve();
      })
    );
  }

  /**
   * Shows the story provided by the URL in the player and go to the page if provided.
   * @param {?string} storyUrl
   * @param {string=} pageId
   * @return {!Promise}
   */
  show(storyUrl, pageId = null) {
    const story = this.getStoryFromUrl_(storyUrl);

    let renderPromise = Promise.resolve();
    if (story.idx !== this.currentIdx_) {
      this.currentIdx_ = story.idx;

      renderPromise = this.render_();
      this.onNavigation_();
    }

    if (pageId != null) {
      return renderPromise.then(() => this.goToPageId_(pageId));
    }

    return renderPromise;
  }

  /** Sends a message muting the current story. */
  mute() {
    const story = this.stories_[this.currentIdx_];
    this.updateMutedState_(story, true);
  }

  /** Sends a message unmuting the current story. */
  unmute() {
    const story = this.stories_[this.currentIdx_];
    this.updateMutedState_(story, false);
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
            .error(`[${TAG}]`, reason);
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
    this.render_();

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
    this.render_();

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

    let showPromise = Promise.resolve();
    if (this.currentIdx_ !== newStory.idx) {
      showPromise = this.show(newStory.href);
    }

    showPromise.then(() => {
      this.selectPage_(pageDelta);
    });
  }

  /**
   * Updates story position.
   * @param {!StoryDef} story
   * @private
   */
  updatePosition_(story) {
    const position =
      story.distance === 0
        ? StoryPosition.CURRENT
        : story.idx > this.currentIdx_
        ? StoryPosition.NEXT
        : StoryPosition.PREVIOUS;

    requestAnimationFrame(() => {
      const {iframe} = story;
      resetStyles(iframe, ['transform', 'transition']);
      iframe.setAttribute('i-amphtml-iframe-position', position);
    });
  }

  /**
   * Returns a promise that makes sure current story gets loaded first before
   * others.
   * @param {!StoryDef} story
   * @return {!Promise}
   * @private
   */
  currentStoryPromise_(story) {
    if (this.stories_[this.currentIdx_].storyContentLoaded) {
      return Promise.resolve();
    }

    if (story.distance !== 0) {
      return this.currentStoryLoadDeferred_.promise;
    }

    if (this.currentStoryLoadDeferred_) {
      // Cancel previous story load promise.
      this.currentStoryLoadDeferred_.reject(
        `[${LOG_TYPE.DEV}] Cancelling previous story load promise.`
      );
    }

    this.initStoryContentLoadedPromise_(story);
    return Promise.resolve();
  }

  /**
   * - Updates distances of the stories.
   * - Appends / removes from the DOM depending on distances.
   * - Sets visibility state.
   * - Loads story N+1 when N is ready.
   * - Positions iframes depending on distance.
   * @param {number=} startingIdx
   * @return {!Promise}
   * @private
   */
  render_(startingIdx = this.currentIdx_) {
    const renderPromises = [];

    for (let i = 0; i < this.stories_.length; i++) {
      const story = this.stories_[(i + startingIdx) % this.stories_.length];

      const oldDistance = story.distance;
      story.distance = Math.abs(this.currentIdx_ - story.idx);

      // 1. Determine whether iframe should be in DOM tree or not.
      if (oldDistance <= 1 && story.distance > 1) {
        this.removeFromDom_(story);
      }

      if (story.distance <= 1 && !story.iframe.isConnected) {
        this.appendToDom_(story);
      }

      // Only create renderPromises for neighbor stories.
      if (story.distance > 1) {
        continue;
      }

      renderPromises.push(
        // 1. Wait for current story to load before evaluating neighbor stories.
        this.currentStoryPromise_(story)
          .then(() => this.maybeGetCacheUrl_(story.href))
          // 2. Set iframe src when appropiate
          .then((storyUrl) => {
            if (!this.sanitizedUrlsAreEquals_(storyUrl, story.iframe.src)) {
              this.setSrc_(story, storyUrl);
            }
          })
          // 3. Waits for player to be visible before updating visibility
          // state.
          .then(() => this.visibleDeferred_.promise)
          // 4. Update the visibility state of the story.
          .then(() => {
            if (story.distance === 0 && this.autoplay_) {
              this.updateVisibilityState_(story, VisibilityState.VISIBLE);
            }

            if (oldDistance === 0 && story.distance === 1) {
              this.updateVisibilityState_(story, VisibilityState.INACTIVE);
            }
          })
          // 5. Finally update the story position.
          .then(() => {
            this.updatePosition_(story);

            if (story.distance === 0) {
              tryFocus(story.iframe);
            }
          })
          .catch((err) => {
            if (err.includes(LOG_TYPE.DEV)) {
              return;
            }
            console /*OK*/
              .error(`[${TAG}]`, err);
          })
      );
    }

    return Promise.all(renderPromises);
  }

  /**
   * @param {!StoryDef} story
   * @private
   */
  appendToDom_(story) {
    this.rootEl_.appendChild(story.iframe);
    this.setUpMessagingForStory_(story);
    story.connectedDeferred.resolve();
  }

  /**
   * @param {!StoryDef} story
   * @private
   */
  removeFromDom_(story) {
    story.storyContentLoaded = false;
    story.connectedDeferred = new Deferred();
    story.iframe.setAttribute('src', '');
    story.iframe.remove();
  }

  /**
   * Sets the story src to the iframe.
   * @param {!StoryDef} story
   * @param {string} url
   * @return {!Promise}
   * @private
   */
  setSrc_(story, url) {
    const {iframe} = story;
    const {href} = this.getEncodedLocation_(url, VisibilityState.PRERENDER);

    iframe.setAttribute('src', href);
    if (story.title) {
      iframe.setAttribute('title', story.title);
    }
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

    if (
      !ampCache ||
      isProxyOrigin(url) ||
      !SUPPORTED_CACHES.includes(ampCache)
    ) {
      return Promise.resolve(url);
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
   * @param {!StoryDef} story
   * @param {!VisibilityState} visibilityState
   * @private
   */
  updateVisibilityState_(story, visibilityState) {
    story.messagingPromise.then((messaging) =>
      messaging.sendRequest('visibilitychange', {state: visibilityState}, true)
    );
  }

  /**
   * Updates the specified iframe's story state with given value.
   * @param {!StoryDef} story
   * @param {string} state
   * @param {boolean} value
   * @private
   */
  updateStoryState_(story, state, value) {
    story.messagingPromise.then((messaging) => {
      messaging.sendRequest('setDocumentState', {state, value});
    });
  }

  /**
   * Update the muted state of the story inside the iframe.
   * @param {!StoryDef} story
   * @param {boolean} mutedValue
   * @private
   */
  updateMutedState_(story, mutedValue) {
    this.updateStoryState_(
      story,
      STORY_MESSAGE_STATE_TYPE.MUTED_STATE,
      mutedValue
    );
  }

  /**
   * Send message to story asking for page attachment state.
   * @private
   */
  getPageAttachmentState_() {
    const story = this.stories_[this.currentIdx_];

    story.messagingPromise.then((messaging) => {
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
   * @param {string} pageId
   * @private
   */
  goToPageId_(pageId) {
    const story = this.stories_[this.currentIdx_];

    story.messagingPromise.then((messaging) =>
      messaging.sendRequest('selectPage', {'id': pageId})
    );
  }

  /**
   * Returns the story given a URL.
   * @param {string} storyUrl
   * @return {!StoryDef}
   * @private
   */
  getStoryFromUrl_(storyUrl) {
    // TODO(enriqe): sanitize URLs for matching.
    const storyIdx = storyUrl
      ? findIndex(this.stories_, ({href}) => href === storyUrl)
      : this.currentIdx_;

    if (!this.stories_[storyIdx]) {
      throw new Error(`Story URL not found in the player: ${storyUrl}`);
    }

    return this.stories_[storyIdx];
  }

  /**
   * Rewinds the given story.
   * @param {string} storyUrl
   */
  rewind(storyUrl) {
    const story = this.getStoryFromUrl_(storyUrl);

    this.whenConnected_(story)
      .then(() => story.messagingPromise)
      .then((messaging) => messaging.sendRequest('rewind', {}));
  }

  /**
   * Returns a promise that resolves when the story is connected to the DOM.
   * @param {!StoryDef} story
   * @return {!Promise}
   * @private
   */
  whenConnected_(story) {
    if (story.iframe.isConnected) {
      return Promise.resolve();
    }
    return story.connectedDeferred.promise;
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
    const story = this.stories_[this.currentIdx_];

    story.messagingPromise.then((messaging) =>
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
      case 'amp-story-player-skip-to-next':
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

    this.touchEventState_.startX = coordinates.screenX;
    this.touchEventState_.startY = coordinates.screenY;

    this.pageScroller_ &&
      this.pageScroller_.onTouchStart(event.timeStamp, coordinates.clientY);

    this.element_.dispatchEvent(
      createCustomEvent(
        this.win_,
        'amp-story-player-touchstart',
        dict({
          'touches': event.touches,
        })
      )
    );
  }

  /**
   * Reacts to touchmove events.
   * @param {!Event} event
   * @private
   */
  onTouchMove_(event) {
    const coordinates = this.getClientTouchCoordinates_(event);
    if (!coordinates) {
      return;
    }

    this.element_.dispatchEvent(
      createCustomEvent(
        this.win_,
        'amp-story-player-touchmove',
        dict({
          'touches': event.touches,
          'isNavigationalSwipe': this.touchEventState_.isSwipeX,
        })
      )
    );

    if (this.touchEventState_.isSwipeX === false) {
      this.pageScroller_ &&
        this.pageScroller_.onTouchMove(event.timeStamp, coordinates.clientY);
      return;
    }

    const {screenX, screenY} = coordinates;
    this.touchEventState_.lastX = screenX;

    if (this.touchEventState_.isSwipeX === null) {
      this.touchEventState_.isSwipeX =
        Math.abs(this.touchEventState_.startX - screenX) >
        Math.abs(this.touchEventState_.startY - screenY);
      if (!this.touchEventState_.isSwipeX) {
        return;
      }
    }

    this.onSwipeX_({
      deltaX: screenX - this.touchEventState_.startX,
      last: false,
    });
  }

  /**
   * Reacts to touchend events. Resets cached touch event states.
   * @param {!Event} event
   * @private
   */
  onTouchEnd_(event) {
    this.element_.dispatchEvent(
      createCustomEvent(
        this.win_,
        'amp-story-player-touchend',
        dict({
          'touches': event.touches,
          'isNavigationalSwipe': this.touchEventState_.isSwipeX,
        })
      )
    );

    if (this.touchEventState_.isSwipeX === true) {
      this.onSwipeX_({
        deltaX: this.touchEventState_.lastX - this.touchEventState_.startX,
        last: true,
      });
    } else {
      this.pageScroller_ && this.pageScroller_.onTouchEnd(event.timeStamp);
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
        (this.getSecondaryStory_() || this.isCircularWrappingEnabled_)
          ? this.next_()
          : this.resetStoryStyles_();
      }

      if (this.swipingState_ === SwipingState.SWIPING_TO_RIGHT) {
        delta > TOGGLE_THRESHOLD_PX &&
        (this.getSecondaryStory_() || this.isCircularWrappingEnabled_)
          ? this.previous_()
          : this.resetStoryStyles_();
      }

      return;
    }

    this.drag_(deltaX);
  }

  /**
   * Resets styles for the currently swiped story.
   * @private
   */
  resetStoryStyles_() {
    const currentIframe = this.stories_[this.currentIdx_].iframe;

    requestAnimationFrame(() => {
      resetStyles(dev().assertElement(currentIframe), [
        'transform',
        'transition',
      ]);
    });

    const secondaryStory = this.getSecondaryStory_();
    if (secondaryStory) {
      requestAnimationFrame(() => {
        resetStyles(dev().assertElement(secondaryStory.iframe), [
          'transform',
          'transition',
        ]);
      });
    }
  }

  /**
   * Gets accompanying story for the currently swiped story if any.
   * @private
   * @return {?StoryDef}
   */
  getSecondaryStory_() {
    const nextStoryIdx =
      this.swipingState_ === SwipingState.SWIPING_TO_LEFT
        ? this.currentIdx_ + 1
        : this.currentIdx_ - 1;

    if (this.isIndexOutofBounds_(nextStoryIdx)) {
      return null;
    }

    return this.stories_[nextStoryIdx];
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

  /** @private */
  initializeAutoplay_() {
    if (!this.playerConfig_) {
      return;
    }

    const {behavior} = this.playerConfig_;

    if (behavior && typeof behavior.autoplay === 'boolean') {
      this.autoplay_ = behavior.autoplay;
    }
  }

  /** @private */
  initializePageScroll_() {
    if (!this.playerConfig_) {
      return;
    }

    const {behavior} = this.playerConfig_;

    if (behavior && behavior.pageScroll === false) {
      this.pageScroller_ = null;
    }
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
    const {iframe} = story;
    const translate = `translate3d(${deltaX}px, 0, 0)`;

    requestAnimationFrame(() => {
      setStyles(dev().assertElement(iframe), {
        transform: translate,
        transition: 'none',
      });
    });

    const secondaryStory = this.getSecondaryStory_();
    if (!secondaryStory) {
      return;
    }

    requestAnimationFrame(() => {
      setStyles(dev().assertElement(secondaryStory.iframe), {
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

    const {screenX, screenY, clientX, clientY} = touches[0];
    return {screenX, screenY, clientX, clientY};
  }
}
