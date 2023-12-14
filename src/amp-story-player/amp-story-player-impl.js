import * as ampToolboxCacheUrl from '@ampproject/toolbox-cache-url';
import {Messaging} from '@ampproject/viewer-messaging';

// Source for this constant is css/amp-story-player-shadow.css
import {devAssertElement} from '#core/assert';
import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {Deferred} from '#core/data-structures/promise';
import {isJsonScriptTag, toggleAttribute, tryFocus} from '#core/dom';
import {resetStyles, setStyle, setStyles} from '#core/dom/style';
import {findIndex, toArray} from '#core/types/array';
import {isEnumValue} from '#core/types/enum';
import {parseJson} from '#core/types/object/json';
import {parseQueryString} from '#core/types/string/url';
import {copyTextToClipboard} from '#core/window/clipboard';

import {createCustomEvent, listenOnce} from '#utils/event-helper';

import {AmpStoryPlayerViewportObserver} from './amp-story-player-viewport-observer';
import {AMP_STORY_COPY_URL, AMP_STORY_PLAYER_EVENT} from './event';
import {PageScroller} from './page-scroller';

import {cssText} from '../../build/amp-story-player-shadow.css';
import {applySandbox} from '../3p-frame';
import * as urls from '../config/urls';
import {getMode} from '../mode';
import {
  addParamsToUrl,
  getFragment,
  isProxyOrigin,
  parseUrlDeprecated,
  parseUrlWithA,
  removeFragment,
  removeSearch,
  serializeQueryString,
} from '../url';

/** @enum {string} */
const LOAD_STATE_CLASS_ENUM = {
  LOADING: 'i-amphtml-story-player-loading',
  LOADED: 'i-amphtml-story-player-loaded',
  ERROR: 'i-amphtml-story-player-error',
};

/** @enum {number} */
const STORY_POSITION_ENUM = {
  PREVIOUS: -1,
  CURRENT: 0,
  NEXT: 1,
};

/** @const @type {!Array<string>} */
const SUPPORTED_CACHES = ['cdn.ampproject.org', 'www.bing-amp.com'];

/** @const @type {!Array<string>} */
const SANDBOX_MIN_LIST = ['allow-top-navigation'];

/** @enum {number} */
const SWIPING_STATE_ENUM = {
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
const DEPRECATED_BUTTON_TYPES_ENUM = {
  BACK: 'back-button',
  CLOSE: 'close-button',
};

/** @enum {string} */
const DEPRECATED_BUTTON_CLASSES_ENUM = {
  BASE: 'amp-story-player-exit-control-button',
  HIDDEN: 'amp-story-player-hide-button',
  BACK: 'amp-story-player-back-button',
  CLOSE: 'amp-story-player-close-button',
};

/** @enum {string} */
const DEPRECATED_EVENT_NAMES_ENUM = {
  BACK: 'amp-story-player-back',
  CLOSE: 'amp-story-player-close',
};

/** @enum {string} */
const STORY_STATE_TYPE_ENUM = {
  PAGE_ATTACHMENT_STATE: 'page-attachment',
};

/** @enum {string} */
const STORY_MESSAGE_STATE_TYPE_ENUM = {
  PAGE_ATTACHMENT_STATE: 'PAGE_ATTACHMENT_STATE',
  UI_STATE: 'UI_STATE',
  MUTED_STATE: 'MUTED_STATE',
  CURRENT_PAGE_ID: 'CURRENT_PAGE_ID',
  STORY_PROGRESS: 'STORY_PROGRESS',
  DESKTOP_ASPECT_RATIO: 'DESKTOP_ASPECT_RATIO',
};

/** @const {string} */
const CLASS_NO_NAVIGATION_TRANSITION =
  'i-amphtml-story-player-no-navigation-transition';

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
 *   connectedDeferred: !Deferred,
 *   desktopAspectRatio: ?number,
 * }}
 */
let StoryDef;

/**
 * @typedef {{
 *   on: ?string,
 *   action: ?string,
 *   endpoint: ?string,
 *   pageScroll: ?boolean,
 *   autoplay: ?boolean,
 * }}
 */
let BehaviorDef;

/**
 * @typedef {{
 *   attribution: ?string,
 * }}
 */
let DisplayDef;

/**
 * @typedef {{
 *   controls: ?Array<!ViewerControlDef>,
 *   behavior: ?BehaviorDef,
 *   display: ?DisplayDef,
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
const LOG_TYPE_ENUM = {
  DEV: 'amp-story-player-dev',
};

/**
 * NOTE: If udpated here, update in amp-story.js
 * @private @const {number}
 */
const PANEL_ASPECT_RATIO_THRESHOLD = 31 / 40;

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

    /** @private {!SWIPING_STATE_ENUM} */
    this.swipingState_ = SWIPING_STATE_ENUM.NOT_SWIPING;

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
    this.playing_ = true;

    /** @private {?string} */
    this.attribution_ = null;

    /** @private {?Element} */
    this.prevButton_ = null;

    /** @private {?Element} */
    this.nextButton_ = null;

    /** @private {boolean} */
    this.pageAttachmentOpen_ = false;

    return this.element_;
  }

  /**
   * Attaches callbacks to the DOM element for them to be used by publishers.
   * @private
   */
  attachCallbacksToElement_() {
    this.element_.buildPlayer = this.buildPlayer.bind(this);
    this.element_.layoutPlayer = this.layoutPlayer.bind(this);
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
    this.buildPlayer();
    this.layoutPlayer();
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
    if (!this.element_.isLaidOut_) {
      this.layoutPlayer();
    }
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
    this.playing_ = !paused;
    const currentStory = this.stories_[this.currentIdx_];

    this.updateVisibilityState_(
      currentStory,
      paused ? VisibilityState_Enum.PAUSED : VisibilityState_Enum.VISIBLE
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
  buildPlayer() {
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
    this.initializeAttribution_();
    this.initializePageScroll_();
    this.initializeCircularWrapping_();
    this.initializeDesktopStoryControlUI_();
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
    this.element_.dispatchEvent(createCustomEvent(this.win_, 'ready', {}));
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
    if (!isEnumValue(DEPRECATED_BUTTON_TYPES_ENUM, option)) {
      return;
    }

    const button = this.doc_.createElement('button');
    this.rootEl_.appendChild(button);

    const isBack = option === DEPRECATED_BUTTON_TYPES_ENUM.BACK;
    button.classList.add(
      isBack
        ? DEPRECATED_BUTTON_CLASSES_ENUM.BACK
        : DEPRECATED_BUTTON_CLASSES_ENUM.CLOSE
    );
    button.classList.add(DEPRECATED_BUTTON_CLASSES_ENUM.BASE);

    button.addEventListener('click', () => {
      this.element_.dispatchEvent(
        createCustomEvent(
          this.win_,
          isBack
            ? DEPRECATED_EVENT_NAMES_ENUM.BACK
            : DEPRECATED_EVENT_NAMES_ENUM.CLOSE,
          {}
        )
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
      this.playerConfig_ = /** @type {!ConfigDef} */ (
        parseJson(scriptTag.textContent)
      );
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
    iframeEl.setAttribute('allow', 'autoplay; web-share');

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

          messaging.registerHandler('storyContentLoaded', () => {
            story.storyContentLoaded = true;

            // Store aspect ratio so that it can be updated when the story becomes active.
            this.storeAndMaybeUpdateAspectRatio_(story);
          });

          messaging.sendRequest(
            'onDocumentState',
            {
              'state': STORY_MESSAGE_STATE_TYPE_ENUM.PAGE_ATTACHMENT_STATE,
            },
            false
          );

          messaging.sendRequest(
            'onDocumentState',
            {'state': STORY_MESSAGE_STATE_TYPE_ENUM.CURRENT_PAGE_ID},
            false
          );

          messaging.sendRequest('onDocumentState', {
            'state': STORY_MESSAGE_STATE_TYPE_ENUM.MUTED_STATE,
          });

          messaging.sendRequest('onDocumentState', {
            'state': STORY_MESSAGE_STATE_TYPE_ENUM.UI_STATE,
          });

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
              {'controls': this.playerConfig_.controls},
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
    this.rootEl_.classList.add(LOAD_STATE_CLASS_ENUM.LOADING);

    iframeEl.onload = () => {
      this.rootEl_.classList.remove(LOAD_STATE_CLASS_ENUM.LOADING);
      this.rootEl_.classList.add(LOAD_STATE_CLASS_ENUM.LOADED);
      this.element_.classList.add(LOAD_STATE_CLASS_ENUM.LOADED);
    };
    iframeEl.onerror = () => {
      this.rootEl_.classList.remove(LOAD_STATE_CLASS_ENUM.LOADING);
      this.rootEl_.classList.add(LOAD_STATE_CLASS_ENUM.ERROR);
      this.element_.classList.add(LOAD_STATE_CLASS_ENUM.ERROR);
    };
  }

  /**
   * @public
   */
  layoutPlayer() {
    if (!!this.element_.isLaidOut_) {
      return;
    }

    new AmpStoryPlayerViewportObserver(this.win_, this.element_, () =>
      this.visibleDeferred_.resolve()
    );

    if (this.win_.ResizeObserver) {
      new this.win_.ResizeObserver((e) => {
        const {height, width} = e[0].contentRect;
        this.onPlayerResize_(height, width);
      }).observe(this.element_);
    } else {
      // Set size once as fallback for browsers not supporting ResizeObserver.
      const {height, width} = this.element_./*OK*/ getBoundingClientRect();
      this.onPlayerResize_(height, width);
    }

    this.render_();

    this.element_.isLaidOut_ = true;
  }

  /**
   * Builds panel mode "previous" and "next" story UI.
   * @private
   */
  initializeDesktopStoryControlUI_() {
    this.prevButton_ = this.doc_.createElement('button');
    this.prevButton_.classList.add('i-amphtml-story-player-panel-prev');
    this.prevButton_.addEventListener('click', () => this.previous_());
    this.prevButton_.setAttribute('aria-label', 'previous story');
    this.rootEl_.appendChild(this.prevButton_);

    this.nextButton_ = this.doc_.createElement('button');
    this.nextButton_.classList.add('i-amphtml-story-player-panel-next');
    this.nextButton_.addEventListener('click', () => this.next_());
    this.nextButton_.setAttribute('aria-label', 'next story');
    this.rootEl_.appendChild(this.nextButton_);

    this.checkButtonsDisabled_();
  }

  /**
   * Toggles disabled attribute on panel mode "previous" and "next" buttons.
   * @private
   */
  checkButtonsDisabled_() {
    toggleAttribute(
      this.prevButton_,
      'disabled',
      this.isIndexOutofBounds_(this.currentIdx_ - 1) &&
        !this.isCircularWrappingEnabled_
    );
    toggleAttribute(
      this.nextButton_,
      'disabled',
      this.isIndexOutofBounds_(this.currentIdx_ + 1) &&
        !this.isCircularWrappingEnabled_
    );
  }

  /**
   * @param {number} height
   * @param {number} width
   * @private
   */
  onPlayerResize_(height, width) {
    const isPanel = width / height > PANEL_ASPECT_RATIO_THRESHOLD;

    this.rootEl_.classList.toggle('i-amphtml-story-player-panel', isPanel);

    if (isPanel) {
      setStyles(this.rootEl_, {
        '--i-amphtml-story-player-height': `${height}px`,
      });

      this.rootEl_.classList.toggle(
        'i-amphtml-story-player-panel-medium',
        height < 756
      );

      this.rootEl_.classList.toggle(
        'i-amphtml-story-player-panel-small',
        height < 538
      );
    }
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
   * Shows the story provided by the URL in the player and go to the page if provided.
   * @param {?string} storyUrl
   * @param {string=} pageId
   * @param {{animate: boolean?}} options
   * @return {!Promise}
   */
  show(storyUrl, pageId = null, options = {}) {
    const story = this.getStoryFromUrl_(storyUrl);

    let renderPromise = Promise.resolve();
    if (story.idx !== this.currentIdx_) {
      this.currentIdx_ = story.idx;

      renderPromise = this.render_();

      if (options.animate === false) {
        this.rootEl_.classList.toggle(CLASS_NO_NAVIGATION_TRANSITION, true);
        listenOnce(story.iframe, 'transitionend', () => {
          this.rootEl_.classList.remove(CLASS_NO_NAVIGATION_TRANSITION);
        });
      }
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
      case STORY_STATE_TYPE_ENUM.PAGE_ATTACHMENT_STATE:
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

    this.checkButtonsDisabled_();
    this.getUiState_().then((uiTypeNumber) =>
      this.onUiStateUpdate_(uiTypeNumber)
    );

    this.signalNavigation_(navigation);
    this.maybeFetchMoreStories_(remaining);
  }

  /**
   * Gets UI state from active story.
   * @private
   * @return {Promise}
   */
  getUiState_() {
    const story = this.stories_[this.currentIdx_];

    return new Promise((resolve) => {
      story.messagingPromise.then((messaging) => {
        messaging
          .sendRequest(
            'getDocumentState',
            {state: STORY_MESSAGE_STATE_TYPE_ENUM.UI_STATE},
            true
          )
          .then((event) => resolve(event.value));
      });
    });
  }

  /**
   * Shows or hides one panel UI on state update.
   * @param {number} uiTypeNumber
   * @private
   */
  onUiStateUpdate_(uiTypeNumber) {
    const isFullbleed =
      uiTypeNumber === 2 /** DESKTOP_FULLBLEED */ ||
      uiTypeNumber === 0; /** MOBILE */
    this.rootEl_.classList.toggle(
      'i-amphtml-story-player-full-bleed-story',
      isFullbleed
    );
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
   * @param {{animate: boolean?}} options
   */
  go(storyDelta, pageDelta = 0, options = {}) {
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
      showPromise = this.show(newStory.href, /* pageId */ null, options);
    }

    showPromise.then(() => {
      this.selectPage_(pageDelta);
    });
  }

  /**
   * Updates story position.
   * @param {!StoryDef} story
   * @return {!Promise}
   * @private
   */
  updatePosition_(story) {
    const position =
      story.distance === 0
        ? STORY_POSITION_ENUM.CURRENT
        : story.idx > this.currentIdx_
          ? STORY_POSITION_ENUM.NEXT
          : STORY_POSITION_ENUM.PREVIOUS;

    requestAnimationFrame(() => {
      const {iframe} = story;
      resetStyles(iframe, ['transform', 'transition']);
      iframe.setAttribute('i-amphtml-iframe-position', position);
    });
  }

  /**
   * Store aspect ratio of the loaded story and and maybe update the active aspect ratio.
   * @param {!StoryDef} story
   * @private
   */
  storeAndMaybeUpdateAspectRatio_(story) {
    story.messagingPromise.then((messaging) => {
      messaging
        .sendRequest(
          'getDocumentState',
          {state: STORY_MESSAGE_STATE_TYPE_ENUM.DESKTOP_ASPECT_RATIO},
          true
        )
        .then((event) => {
          story.desktopAspectRatio = event.value;
          this.maybeUpdateAspectRatio_();
        });
    });
  }

  /**
   * Update player aspect ratio based on the active story aspect ratio.
   * @private
   */
  maybeUpdateAspectRatio_() {
    if (this.stories_[this.currentIdx_].desktopAspectRatio) {
      setStyles(this.rootEl_, {
        '--i-amphtml-story-player-panel-ratio':
          this.stories_[this.currentIdx_].desktopAspectRatio,
      });
    }
  }

  /**
   * Returns a promise that makes sure that the current story gets loaded first
   * before any others. When the given story is not the current story, it will
   * block until the current story has finished loading. When the given story
   * is the current story, then this method will not block.
   * @param {!StoryDef} story
   * @return {!Promise}
   * @private
   */
  currentStoryPromise_(story) {
    if (this.stories_[this.currentIdx_].storyContentLoaded) {
      this.maybeUpdateAspectRatio_();

      return Promise.resolve();
    }

    if (story.distance !== 0) {
      return this.currentStoryLoadDeferred_.promise;
    }

    // Cancel previous story load promise.
    this.currentStoryLoadDeferred_?.reject(
      `[${LOG_TYPE_ENUM.DEV}] Cancelling previous story load promise.`
    );

    this.currentStoryLoadDeferred_ = new Deferred();
    story.messagingPromise.then((messaging) =>
      messaging.registerHandler('storyContentLoaded', () => {
        // Stories that already loaded won't dispatch a `storyContentLoaded`
        // event anymore, which is why we need this sync property.
        story.storyContentLoaded = true;
        this.currentStoryLoadDeferred_.resolve();

        // Store and update the player aspect ratio based on the active story aspect ratio.
        this.storeAndMaybeUpdateAspectRatio_(story);
      })
    );

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
            if (story.distance === 0 && this.playing_) {
              this.updateVisibilityState_(story, VisibilityState_Enum.VISIBLE);
            }

            if (oldDistance === 0 && story.distance === 1) {
              this.updateVisibilityState_(story, VisibilityState_Enum.INACTIVE);
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
            if (err.includes(LOG_TYPE_ENUM.DEV)) {
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
    const {href} = this.getEncodedLocation_(
      url,
      VisibilityState_Enum.PRERENDER
    );

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

    if (!ampCache || !SUPPORTED_CACHES.includes(ampCache)) {
      return Promise.resolve(url);
    }

    if (isProxyOrigin(url)) {
      // Ensures serving type is 'viewer' (/v/) when publishers provide their
      // own cached URL.
      const location = parseUrlDeprecated(url);
      if (location.pathname.startsWith('/c/')) {
        location.pathname = '/v/' + location.pathname.substr(3);
      }
      return Promise.resolve(location.toString());
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
   * @param {VisibilityState_Enum=} visibilityState
   * @return {!Location}
   * @private
   */
  getEncodedLocation_(href, visibilityState = VisibilityState_Enum.INACTIVE) {
    const playerFragmentParams = {
      'visibilityState': visibilityState,
      'origin': this.win_.origin,
      'showStoryUrlInfo': '0',
      'storyPlayer': 'v0',
      'cap': 'swipe',
    };

    if (this.attribution_ === 'auto') {
      playerFragmentParams['attribution'] = 'auto';
    }

    const originalFragmentString = getFragment(href);
    const originalFragments = parseQueryString(originalFragmentString);

    const fragmentParams = /** @type {!JsonObject} */ ({
      ...originalFragments,
      ...playerFragmentParams,
    });

    let noFragmentUrl = removeFragment(href);
    if (isProxyOrigin(href)) {
      const ampJsQueryParam = {
        'amp_js_v': '0.1',
      };
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
   * @param {!VisibilityState_Enum} visibilityState
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
      STORY_MESSAGE_STATE_TYPE_ENUM.MUTED_STATE,
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
          {state: STORY_MESSAGE_STATE_TYPE_ENUM.PAGE_ATTACHMENT_STATE},
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
      case STORY_MESSAGE_STATE_TYPE_ENUM.PAGE_ATTACHMENT_STATE:
        this.onPageAttachmentStateUpdate_(/** @type {boolean} */ (data.value));
        break;
      case STORY_MESSAGE_STATE_TYPE_ENUM.CURRENT_PAGE_ID:
        this.onCurrentPageIdUpdate_(
          /** @type {string} */ (data.value),
          messaging
        );
        break;
      case STORY_MESSAGE_STATE_TYPE_ENUM.MUTED_STATE:
        this.onMutedStateUpdate_(/** @type {string} */ (data.value));
        break;
      case STORY_MESSAGE_STATE_TYPE_ENUM.UI_STATE:
        // Handles UI state updates on window resize.
        this.onUiStateUpdate_(/** @type {number} */ (data.value));
        break;
      case AMP_STORY_PLAYER_EVENT:
        this.onPlayerEvent_(/** @type {string} */ (data.value));
        break;
      case AMP_STORY_COPY_URL:
        this.onCopyUrl_(/** @type {string} */ (data.value), messaging);
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
        this.element_.dispatchEvent(createCustomEvent(this.win_, value, {}));
        break;
    }
  }

  /**
   * Reacts to the copy url request coming from the story.
   * @private
   * @param {string} value
   * @param {Messaging} messaging
   */
  onCopyUrl_(value, messaging) {
    copyTextToClipboard(
      this.win_,
      value,
      () => {
        messaging.sendRequest(
          'copyComplete',
          {
            'success': true,
            'url': value,
          },
          false
        );
      },
      () => {
        messaging.sendRequest(
          'copyComplete',
          {
            'success': false,
          },
          false
        );
      }
    );
  }

  /**
   * Reacts to mute/unmute events coming from the story.
   * @param {string} muted
   * @private
   */
  onMutedStateUpdate_(muted) {
    this.element_.dispatchEvent(
      createCustomEvent(this.win_, 'amp-story-muted-state', {muted})
    );
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
        {'state': STORY_MESSAGE_STATE_TYPE_ENUM.STORY_PROGRESS},
        true
      )
      .then((progress) => {
        this.element_.dispatchEvent(
          createCustomEvent(this.win_, 'storyNavigation', {
            'pageId': pageId,
            'progress': progress.value,
          })
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
    this.pageAttachmentOpen_ = pageAttachmentOpen;
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
      ? button.classList.remove(DEPRECATED_BUTTON_CLASSES_ENUM.HIDDEN)
      : button.classList.add(DEPRECATED_BUTTON_CLASSES_ENUM.HIDDEN);
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
        {}
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
      this.element_.dispatchEvent(createCustomEvent(this.win_, name, {}));
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
      createCustomEvent(this.win_, 'amp-story-player-touchstart', {
        'touches': event.touches,
      })
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
      createCustomEvent(this.win_, 'amp-story-player-touchmove', {
        'touches': event.touches,
        'isNavigationalSwipe': this.touchEventState_.isSwipeX,
      })
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
      createCustomEvent(this.win_, 'amp-story-player-touchend', {
        'touches': event.touches,
        'isNavigationalSwipe': this.touchEventState_.isSwipeX,
      })
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
    this.swipingState_ = SWIPING_STATE_ENUM.NOT_SWIPING;
  }

  /**
   * Reacts to horizontal swipe events.
   * @param {!Object} gesture
   */
  onSwipeX_(gesture) {
    if (this.stories_.length <= 1 || this.pageAttachmentOpen_) {
      return;
    }

    const {deltaX} = gesture;

    if (gesture.last === true) {
      const delta = Math.abs(deltaX);

      if (this.swipingState_ === SWIPING_STATE_ENUM.SWIPING_TO_LEFT) {
        delta > TOGGLE_THRESHOLD_PX &&
        (this.getSecondaryStory_() || this.isCircularWrappingEnabled_)
          ? this.next_()
          : this.resetStoryStyles_();
      }

      if (this.swipingState_ === SWIPING_STATE_ENUM.SWIPING_TO_RIGHT) {
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
      resetStyles(devAssertElement(currentIframe), ['transform', 'transition']);
    });

    const secondaryStory = this.getSecondaryStory_();
    if (secondaryStory) {
      requestAnimationFrame(() => {
        resetStyles(devAssertElement(secondaryStory.iframe), [
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
      this.swipingState_ === SWIPING_STATE_ENUM.SWIPING_TO_LEFT
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
      this.playing_ = behavior.autoplay;
    }
  }

  /** @private */
  initializeAttribution_() {
    if (!this.playerConfig_) {
      return;
    }

    const {display} = this.playerConfig_;

    if (display && display.attribution === 'auto') {
      this.attribution_ = 'auto';
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
      this.swipingState_ = SWIPING_STATE_ENUM.SWIPING_TO_LEFT;
      secondaryTranslate = `translate3d(calc(100% + ${deltaX}px), 0, 0)`;
    } else {
      this.swipingState_ = SWIPING_STATE_ENUM.SWIPING_TO_RIGHT;
      secondaryTranslate = `translate3d(calc(${deltaX}px - 100%), 0, 0)`;
    }

    const story = this.stories_[this.currentIdx_];
    const {iframe} = story;
    const translate = `translate3d(${deltaX}px, 0, 0)`;

    requestAnimationFrame(() => {
      setStyles(devAssertElement(iframe), {
        transform: translate,
        transition: 'none',
      });
    });

    const secondaryStory = this.getSecondaryStory_();
    if (!secondaryStory) {
      return;
    }

    requestAnimationFrame(() => {
      setStyles(devAssertElement(secondaryStory.iframe), {
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

    const {clientX, clientY, screenX, screenY} = touches[0];
    return {screenX, screenY, clientX, clientY};
  }
}
