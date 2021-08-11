import { resolvedPromise as _resolvedPromise7 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise6 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise5 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise4 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

var _DEPRECATED_BUTTON_CL, _DEPRECATED_EVENT_NAM;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import { Messaging } from '@ampproject/viewer-messaging';
// Source for this constant is css/amp-story-player-shadow.css
import { devAssertElement } from "../core/assert";
import { VisibilityState } from "../core/constants/visibility-state";
import { Deferred } from "../core/data-structures/promise";
import { isJsonScriptTag, tryFocus } from "../core/dom";
import { resetStyles, setStyle, setStyles } from "../core/dom/style";
import { findIndex, toArray } from "../core/types/array";
import { dict } from "../core/types/object";
import { parseJson } from "../core/types/object/json";
import { parseQueryString } from "../core/types/string/url";
import { AmpStoryPlayerViewportObserver } from "./amp-story-player-viewport-observer";
import { PageScroller } from "./page-scroller";
import { cssText } from "../../build/amp-story-player-shadow.css";
import { applySandbox } from "../3p-frame";
import { urls } from "../config";
import { createCustomEvent, listenOnce } from "../event-helper";
import { getMode } from "../mode";
import { addParamsToUrl, getFragment, isProxyOrigin, parseUrlWithA, removeFragment, removeSearch, serializeQueryString } from "../url";

/** @enum {string} */
var LoadStateClass = {
  LOADING: 'i-amphtml-story-player-loading',
  LOADED: 'i-amphtml-story-player-loaded',
  ERROR: 'i-amphtml-story-player-error'
};

/** @enum {number} */
var StoryPosition = {
  PREVIOUS: -1,
  CURRENT: 0,
  NEXT: 1
};

/** @const @type {!Array<string>} */
var SUPPORTED_CACHES = ['cdn.ampproject.org', 'www.bing-amp.com'];

/** @const @type {!Array<string>} */
var SANDBOX_MIN_LIST = ['allow-top-navigation'];

/** @enum {number} */
var SwipingState = {
  NOT_SWIPING: 0,
  SWIPING_TO_LEFT: 1,
  SWIPING_TO_RIGHT: 2
};

/** @const {number} */
var TOGGLE_THRESHOLD_PX = 50;

/**
 * Fetches more stories when reaching the threshold.
 * @const {number}
 */
var FETCH_STORIES_THRESHOLD = 2;

/** @enum {string} */
var DEPRECATED_BUTTON_TYPES = {
  BACK: 'back-button',
  CLOSE: 'close-button'
};

/** @enum {string} */
var DEPRECATED_BUTTON_CLASSES = (_DEPRECATED_BUTTON_CL = {
  BASE: 'amp-story-player-exit-control-button',
  HIDDEN: 'amp-story-player-hide-button'
}, _DEPRECATED_BUTTON_CL[DEPRECATED_BUTTON_TYPES.BACK] = 'amp-story-player-back-button', _DEPRECATED_BUTTON_CL[DEPRECATED_BUTTON_TYPES.CLOSE] = 'amp-story-player-close-button', _DEPRECATED_BUTTON_CL);

/** @enum {string} */
var DEPRECATED_EVENT_NAMES = (_DEPRECATED_EVENT_NAM = {}, _DEPRECATED_EVENT_NAM[DEPRECATED_BUTTON_TYPES.BACK] = 'amp-story-player-back', _DEPRECATED_EVENT_NAM[DEPRECATED_BUTTON_TYPES.CLOSE] = 'amp-story-player-close', _DEPRECATED_EVENT_NAM);

/** @enum {string} */
var STORY_STATE_TYPE = {
  PAGE_ATTACHMENT_STATE: 'page-attachment'
};

/** @enum {string} */
var STORY_MESSAGE_STATE_TYPE = {
  PAGE_ATTACHMENT_STATE: 'PAGE_ATTACHMENT_STATE',
  UI_STATE: 'UI_STATE',
  MUTED_STATE: 'MUTED_STATE',
  CURRENT_PAGE_ID: 'CURRENT_PAGE_ID',
  STORY_PROGRESS: 'STORY_PROGRESS'
};

/** @const {string} */
export var AMP_STORY_PLAYER_EVENT = 'AMP_STORY_PLAYER_EVENT';

/** @const {string} */
var CLASS_NO_NAVIGATION_TRANSITION = 'i-amphtml-story-player-no-navigation-transition';

/** @typedef {{ state:string, value:(boolean|string) }} */
var DocumentStateTypeDef;

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
var StoryDef;

/**
 * @typedef {{
 *   on: ?string,
 *   action: ?string,
 *   endpoint: ?string,
 *   pageScroll: ?boolean,
 *   autoplay: ?boolean,
 * }}
 */
var BehaviorDef;

/**
 * @typedef {{
 *   attribution: ?string,
 * }}
 */
var DisplayDef;

/**
 * @typedef {{
 *   controls: ?Array<!ViewerControlDef>,
 *   behavior: ?BehaviorDef,
 *   display: ?DisplayDef,
 * }}
 */
var ConfigDef;

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
export var ViewerControlDef;

/** @type {string} */
var TAG = 'amp-story-player';

/** @enum {string} */
var LOG_TYPE = {
  DEV: 'amp-story-player-dev'
};

/**
 * NOTE: If udpated here, update in amp-story.js
 * @private @const {number}
 */
var DESKTOP_ONE_PANEL_ASPECT_RATIO_THRESHOLD = 3 / 4;

/**
 * Note that this is a vanilla JavaScript class and should not depend on AMP
 * services, as v0.js is not expected to be loaded in this context.
 */
export var AmpStoryPlayer = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  function AmpStoryPlayer(win, element) {
    _classCallCheck(this, AmpStoryPlayer);

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
      isSwipeX: null
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

    /**
     * Shows or hides the desktop panels player experiment.
     * Variable is set on window for unit testing new features.
     * @private {?boolean}
     */
    this.isDesktopPanelExperimentOn_ = this.win_.DESKTOP_PANEL_STORY_PLAYER_EXP_ON;
    return this.element_;
  }

  /**
   * Attaches callbacks to the DOM element for them to be used by publishers.
   * @private
   */
  _createClass(AmpStoryPlayer, [{
    key: "attachCallbacksToElement_",
    value: function attachCallbacksToElement_() {
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

  }, {
    key: "load",
    value: function load() {
      if (!this.element_.isConnected) {
        throw new Error("[" + TAG + "] element must be connected to the DOM before calling load().");
      }

      if (!!this.element_.isBuilt_) {
        throw new Error("[" + TAG + "] calling load() on an already loaded element.");
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

  }, {
    key: "initializeAndAddStory_",
    value: function initializeAndAddStory_(story) {
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

  }, {
    key: "add",
    value: function add(newStories) {
      if (newStories.length <= 0) {
        return;
      }

      var isStoryDef = function isStoryDef(story) {
        return story && story.href;
      };

      if (!Array.isArray(newStories) || !newStories.every(isStoryDef)) {
        throw new Error('"stories" parameter has the wrong structure');
      }

      var renderStartingIdx = this.stories_.length;

      for (var i = 0; i < newStories.length; i++) {
        var story = newStories[i];
        this.initializeAndAddStory_(story);
        this.buildIframeFor_(story);
      }

      this.render_(renderStartingIdx);
    }
    /**
     * Makes the current story play its content/auto-advance
     * @public
     */

  }, {
    key: "play",
    value: function play() {
      if (!this.element_.isLaidOut_) {
        this.layoutPlayer();
      }

      this.togglePaused_(false);
    }
    /**
     * Makes the current story pause its content/auto-advance
     * @public
     */

  }, {
    key: "pause",
    value: function pause() {
      this.togglePaused_(true);
    }
    /**
     * Makes the current story play or pause its content/auto-advance
     * @param {boolean} paused If true, the story will be paused, and it will be played otherwise
     * @private
     */

  }, {
    key: "togglePaused_",
    value: function togglePaused_(paused) {
      this.playing_ = !paused;
      var currentStory = this.stories_[this.currentIdx_];
      this.updateVisibilityState_(currentStory, paused ? VisibilityState.PAUSED : VisibilityState.VISIBLE);
    }
    /**
     *
     * @public
     * @return {!Element}
     */

  }, {
    key: "getElement",
    value: function getElement() {
      return this.element_;
    }
    /**
     * @return {!Array<!StoryDef>}
     * @public
     */

  }, {
    key: "getStories",
    value: function getStories() {
      return this.stories_;
    }
    /** @public */

  }, {
    key: "buildPlayer",
    value: function buildPlayer() {
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

      if (this.isDesktopPanelExperimentOn_) {
        this.initializeDesktopStoryControlUI_();
      }

      this.signalReady_();
      this.element_.isBuilt_ = true;
    }
    /**
     * Initializes stories declared inline as <a> elements.
     * @private
     */

  }, {
    key: "initializeAnchorElStories_",
    value: function initializeAnchorElStories_() {
      var _this = this;

      var anchorEls = toArray(this.element_.querySelectorAll('a'));
      anchorEls.forEach(function (element) {
        var posterImgEl = element.querySelector('img[data-amp-story-player-poster-img]');
        var posterImgSrc = posterImgEl && posterImgEl.getAttribute('src');
        var story =
        /** @type {!StoryDef} */
        {
          href: element.href,
          title: element.textContent && element.textContent.trim() || null,
          posterImage: element.getAttribute('data-poster-portrait-src') || posterImgSrc
        };

        _this.initializeAndAddStory_(story);
      });
    }
    /** @private */

  }, {
    key: "signalReady_",
    value: function signalReady_() {
      this.element_.dispatchEvent(createCustomEvent(this.win_, 'ready', dict({})));
      this.element_.isReady = true;
    }
    /** @private */

  }, {
    key: "buildStories_",
    value: function buildStories_() {
      var _this2 = this;

      this.stories_.forEach(function (story) {
        _this2.buildIframeFor_(story);
      });
    }
    /** @private */

  }, {
    key: "initializeShadowRoot_",
    value: function initializeShadowRoot_() {
      this.rootEl_ = this.doc_.createElement('div');
      this.rootEl_.classList.add('i-amphtml-story-player-main-container');
      var shadowContainer = this.doc_.createElement('div');
      // For AMP version.
      shadowContainer.classList.add('i-amphtml-fill-content', 'i-amphtml-story-player-shadow-root-intermediary');
      this.element_.appendChild(shadowContainer);
      var containerToUse = getMode().test || !this.element_.attachShadow ? shadowContainer : shadowContainer.attachShadow({
        mode: 'open'
      });
      // Inject default styles
      var styleEl = this.doc_.createElement('style');
      styleEl.textContent = cssText;
      containerToUse.appendChild(styleEl);
      containerToUse.insertBefore(this.rootEl_, containerToUse.firstElementChild);
    }
    /**
     * Helper to create a button.
     * TODO(#30031): delete this once new custom UI API is ready.
     * @private
     */

  }, {
    key: "initializeButton_",
    value: function initializeButton_() {
      var _this3 = this;

      var option = this.element_.getAttribute('exit-control');

      if (!Object.values(DEPRECATED_BUTTON_TYPES).includes(option)) {
        return;
      }

      var button = this.doc_.createElement('button');
      this.rootEl_.appendChild(button);
      button.classList.add(DEPRECATED_BUTTON_CLASSES[option]);
      button.classList.add(DEPRECATED_BUTTON_CLASSES.BASE);
      button.addEventListener('click', function () {
        _this3.element_.dispatchEvent(createCustomEvent(_this3.win_, DEPRECATED_EVENT_NAMES[option], dict({})));
      });
    }
    /**
     * Gets publisher configuration for the player
     * @private
     * @return {?ConfigDef}
     */

  }, {
    key: "readPlayerConfig_",
    value: function readPlayerConfig_() {
      if (this.playerConfig_) {
        return this.playerConfig_;
      }

      var ampCache = this.element_.getAttribute('amp-cache');

      if (ampCache && !SUPPORTED_CACHES.includes(ampCache)) {
        console
        /*OK*/
        .error("[" + TAG + "]", "Unsupported cache specified, use one of following: " + SUPPORTED_CACHES);
      }

      var scriptTag = this.element_.querySelector('script');

      if (!scriptTag) {
        return null;
      }

      if (!isJsonScriptTag(scriptTag)) {
        throw new Error('<script> child must have type="application/json"');
      }

      try {
        this.playerConfig_ =
        /** @type {!ConfigDef} */
        parseJson(scriptTag.textContent);
      } catch (reason) {
        console
        /*OK*/
        .error("[" + TAG + "] ", reason);
      }

      return this.playerConfig_;
    }
    /**
     * @param {!StoryDef} story
     * @private
     */

  }, {
    key: "buildIframeFor_",
    value: function buildIframeFor_(story) {
      var iframeEl = this.doc_.createElement('iframe');

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

  }, {
    key: "addSandboxFlags_",
    value: function addSandboxFlags_(iframe) {
      if (!iframe.sandbox || !iframe.sandbox.supports || iframe.sandbox.length <= 0) {
        return;
      }

      for (var i = 0; i < SANDBOX_MIN_LIST.length; i++) {
        var flag = SANDBOX_MIN_LIST[i];

        if (!iframe.sandbox.supports(flag)) {
          throw new Error("Iframe doesn't support: " + flag);
        }

        iframe.sandbox.add(flag);
      }
    }
    /**
     * Sets up messaging for a story inside an iframe.
     * @param {!StoryDef} story
     * @private
     */

  }, {
    key: "setUpMessagingForStory_",
    value: function setUpMessagingForStory_(story) {
      var _this4 = this;

      var iframe = story.iframe;
      story.messagingPromise = new Promise(function (resolve) {
        _this4.initializeHandshake_(story, iframe).then(function (messaging) {
          messaging.setDefaultHandler(function () {
            return _resolvedPromise();
          });
          messaging.registerHandler('touchstart', function (event, data) {
            _this4.onTouchStart_(
            /** @type {!Event} */
            data);
          });
          messaging.registerHandler('touchmove', function (event, data) {
            _this4.onTouchMove_(
            /** @type {!Event} */
            data);
          });
          messaging.registerHandler('touchend', function (event, data) {
            _this4.onTouchEnd_(
            /** @type {!Event} */
            data);
          });
          messaging.registerHandler('selectDocument', function (event, data) {
            _this4.onSelectDocument_(
            /** @type {!Object} */
            data);
          });
          messaging.sendRequest('onDocumentState', dict({
            'state': STORY_MESSAGE_STATE_TYPE.PAGE_ATTACHMENT_STATE
          }), false);
          messaging.sendRequest('onDocumentState', dict({
            'state': STORY_MESSAGE_STATE_TYPE.CURRENT_PAGE_ID
          }), false);
          messaging.sendRequest('onDocumentState', dict({
            'state': STORY_MESSAGE_STATE_TYPE.MUTED_STATE
          }));
          messaging.sendRequest('onDocumentState', dict({
            'state': STORY_MESSAGE_STATE_TYPE.UI_STATE
          }));
          messaging.registerHandler('documentStateUpdate', function (event, data) {
            _this4.onDocumentStateUpdate_(
            /** @type {!DocumentStateTypeDef} */
            data, messaging);
          });

          if (_this4.playerConfig_ && _this4.playerConfig_.controls) {
            _this4.updateControlsStateForAllStories_(story.idx);

            messaging.sendRequest('customDocumentUI', dict({
              'controls': _this4.playerConfig_.controls
            }), false);
          }

          resolve(messaging);
        }, function (err) {
          console
          /*OK*/
          .error("[" + TAG + "]", err);
        });
      });
    }
    /**
     * Updates the controls config for a given story.
     * @param {number} storyIdx
     * @private
     */

  }, {
    key: "updateControlsStateForAllStories_",
    value: function updateControlsStateForAllStories_(storyIdx) {
      // Disables skip-to-next button when story is the last one in the player.
      if (storyIdx === this.stories_.length - 1) {
        var skipButtonIdx = findIndex(this.playerConfig_.controls, function (control) {
          return control.name === 'skip-next' || control.name === 'skip-to-next';
        });

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

  }, {
    key: "initializeHandshake_",
    value: function initializeHandshake_(story, iframeEl) {
      var _this5 = this;

      return this.maybeGetCacheUrl_(story.href).then(function (url) {
        return Messaging.waitForHandshakeFromDocument(_this5.win_, iframeEl.contentWindow, _this5.getEncodedLocation_(url).origin,
        /*opt_token*/
        null, urls.cdnProxyRegex);
      });
    }
    /**
     * @param {!Element} iframeEl
     * @private
     */

  }, {
    key: "initializeLoadingListeners_",
    value: function initializeLoadingListeners_(iframeEl) {
      var _this6 = this;

      this.rootEl_.classList.add(LoadStateClass.LOADING);

      iframeEl.onload = function () {
        _this6.rootEl_.classList.remove(LoadStateClass.LOADING);

        _this6.rootEl_.classList.add(LoadStateClass.LOADED);

        _this6.element_.classList.add(LoadStateClass.LOADED);
      };

      iframeEl.onerror = function () {
        _this6.rootEl_.classList.remove(LoadStateClass.LOADING);

        _this6.rootEl_.classList.add(LoadStateClass.ERROR);

        _this6.element_.classList.add(LoadStateClass.ERROR);
      };
    }
    /**
     * @public
     */

  }, {
    key: "layoutPlayer",
    value: function layoutPlayer() {
      var _this7 = this;

      if (!!this.element_.isLaidOut_) {
        return;
      }

      new AmpStoryPlayerViewportObserver(this.win_, this.element_, function () {
        return _this7.visibleDeferred_.resolve();
      });

      if (this.isDesktopPanelExperimentOn_) {
        if (this.win_.ResizeObserver) {
          new this.win_.ResizeObserver(function (e) {
            var _e$0$contentRect = e[0].contentRect,
                height = _e$0$contentRect.height,
                width = _e$0$contentRect.width;

            _this7.onPlayerResize_(height, width);
          }).observe(this.element_);
        } else {
          // Set size once as fallback for browsers not supporting ResizeObserver.
          var _this$element_$getBou = this.element_.
          /*OK*/
          getBoundingClientRect(),
              height = _this$element_$getBou.height,
              width = _this$element_$getBou.width;

          this.onPlayerResize_(height, width);
        }
      }

      this.render_();
      this.element_.isLaidOut_ = true;
    }
    /**
     * Builds desktop "previous" and "next" story UI.
     * @private
     */

  }, {
    key: "initializeDesktopStoryControlUI_",
    value: function initializeDesktopStoryControlUI_() {
      var _this8 = this;

      this.prevButton_ = this.doc_.createElement('button');
      this.prevButton_.classList.add('i-amphtml-story-player-desktop-panel-prev');
      this.prevButton_.addEventListener('click', function () {
        return _this8.previous_();
      });
      this.prevButton_.setAttribute('aria-label', 'previous story');
      this.rootEl_.appendChild(this.prevButton_);
      this.nextButton_ = this.doc_.createElement('button');
      this.nextButton_.classList.add('i-amphtml-story-player-desktop-panel-next');
      this.nextButton_.addEventListener('click', function () {
        return _this8.next_();
      });
      this.nextButton_.setAttribute('aria-label', 'next story');
      this.rootEl_.appendChild(this.nextButton_);
      this.checkButtonsDisabled_();
    }
    /**
     * Toggles disabled attribute on desktop "previous" and "next" buttons.
     * @private
     */

  }, {
    key: "checkButtonsDisabled_",
    value: function checkButtonsDisabled_() {
      this.prevButton_.toggleAttribute('disabled', this.isIndexOutofBounds_(this.currentIdx_ - 1) && !this.isCircularWrappingEnabled_);
      this.nextButton_.toggleAttribute('disabled', this.isIndexOutofBounds_(this.currentIdx_ + 1) && !this.isCircularWrappingEnabled_);
    }
    /**
     * @param {number} height
     * @param {number} width
     * @private
     */

  }, {
    key: "onPlayerResize_",
    value: function onPlayerResize_(height, width) {
      var isDesktopOnePanel = width / height > DESKTOP_ONE_PANEL_ASPECT_RATIO_THRESHOLD;
      this.rootEl_.classList.toggle('i-amphtml-story-player-desktop-panel', isDesktopOnePanel);

      if (isDesktopOnePanel) {
        setStyles(this.rootEl_, {
          '--i-amphtml-story-player-height': height + "px"
        });
        this.rootEl_.classList.toggle('i-amphtml-story-player-desktop-panel-medium', height < 756);
        this.rootEl_.classList.toggle('i-amphtml-story-player-desktop-panel-small', height < 538);
      }
    }
    /**
     * Fetches more stories from the publisher's endpoint.
     * @return {!Promise}
     * @private
     */

  }, {
    key: "fetchStories_",
    value: function fetchStories_() {
      var endpoint = this.playerConfig_.behavior.endpoint;

      if (!endpoint) {
        this.isFetchingStoriesEnabled_ = false;
        return _resolvedPromise2();
      }

      var init = {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      };
      endpoint = endpoint.replace(/\${offset}/, this.stories_.length.toString());
      return fetch(endpoint, init).then(function (response) {
        return response.json();
      }).catch(function (reason) {
        console
        /*OK*/
        .error("[" + TAG + "]", reason);
      });
    }
    /**
     * Resolves currentStoryLoadDeferred_ when given story's content is finished
     * loading.
     * @param {!StoryDef} story
     * @private
     */

  }, {
    key: "initStoryContentLoadedPromise_",
    value: function initStoryContentLoadedPromise_(story) {
      var _this9 = this;

      this.currentStoryLoadDeferred_ = new Deferred();
      story.messagingPromise.then(function (messaging) {
        return messaging.registerHandler('storyContentLoaded', function () {
          // Stories that already loaded won't dispatch a `storyContentLoaded`
          // event anymore, which is why we need this sync property.
          story.storyContentLoaded = true;

          _this9.currentStoryLoadDeferred_.resolve();
        });
      });
    }
    /**
     * Shows the story provided by the URL in the player and go to the page if provided.
     * @param {?string} storyUrl
     * @param {string=} pageId
     * @param {{animate: boolean?}} options
     * @return {!Promise}
     */

  }, {
    key: "show",
    value: function show(storyUrl, pageId, options) {
      var _this10 = this;

      if (pageId === void 0) {
        pageId = null;
      }

      if (options === void 0) {
        options = {};
      }

      var story = this.getStoryFromUrl_(storyUrl);

      var renderPromise = _resolvedPromise3();

      if (story.idx !== this.currentIdx_) {
        this.currentIdx_ = story.idx;
        renderPromise = this.render_();

        if (options.animate === false) {
          this.rootEl_.classList.toggle(CLASS_NO_NAVIGATION_TRANSITION, true);
          listenOnce(story.iframe, 'transitionend', function () {
            _this10.rootEl_.classList.remove(CLASS_NO_NAVIGATION_TRANSITION);
          });
        }

        this.onNavigation_();
      }

      if (pageId != null) {
        return renderPromise.then(function () {
          return _this10.goToPageId_(pageId);
        });
      }

      return renderPromise;
    }
    /** Sends a message muting the current story. */

  }, {
    key: "mute",
    value: function mute() {
      var story = this.stories_[this.currentIdx_];
      this.updateMutedState_(story, true);
    }
    /** Sends a message unmuting the current story. */

  }, {
    key: "unmute",
    value: function unmute() {
      var story = this.stories_[this.currentIdx_];
      this.updateMutedState_(story, false);
    }
    /**
     * Sends a message asking for the current story's state and dispatches the appropriate event.
     * @param {string} storyStateType
     * @public
     */

  }, {
    key: "getStoryState",
    value: function getStoryState(storyStateType) {
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

  }, {
    key: "signalNavigation_",
    value: function signalNavigation_(data) {
      var event = createCustomEvent(this.win_, 'navigation',
      /** @type {!JsonObject} */
      data);
      this.element_.dispatchEvent(event);
    }
    /**
     * Triggers when swithing from one story to another.
     * @private
     */

  }, {
    key: "onNavigation_",
    value: function onNavigation_() {
      var _this11 = this;

      var index = this.currentIdx_;
      var remaining = this.stories_.length - this.currentIdx_ - 1;
      var navigation = {
        'index': index,
        'remaining': remaining
      };

      if (this.isDesktopPanelExperimentOn_) {
        this.checkButtonsDisabled_();
        this.getUiState_().then(function (uiTypeNumber) {
          return _this11.onUiStateUpdate_(uiTypeNumber);
        });
      }

      this.signalNavigation_(navigation);
      this.maybeFetchMoreStories_(remaining);
    }
    /**
     * Gets UI state from active story.
     * @private
     * @return {Promise}
     */

  }, {
    key: "getUiState_",
    value: function getUiState_() {
      var story = this.stories_[this.currentIdx_];
      return new Promise(function (resolve) {
        story.messagingPromise.then(function (messaging) {
          messaging.sendRequest('getDocumentState', {
            state: STORY_MESSAGE_STATE_TYPE.UI_STATE
          }, true).then(function (event) {
            return resolve(event.value);
          });
        });
      });
    }
    /**
     * Shows or hides one panel UI on state update.
     * @param {number} uiTypeNumber
     * @private
     */

  }, {
    key: "onUiStateUpdate_",
    value: function onUiStateUpdate_(uiTypeNumber) {
      var isFullbleed = uiTypeNumber === 2
      /** DESKTOP_FULLBLEED */
      || uiTypeNumber === 0;

      /** MOBILE */
      this.rootEl_.classList.toggle('i-amphtml-story-player-full-bleed-story', isFullbleed);
    }
    /**
     * Fetches more stories if appropiate.
     * @param {number} remaining Number of stories remaining in the player.
     * @private
     */

  }, {
    key: "maybeFetchMoreStories_",
    value: function maybeFetchMoreStories_(remaining) {
      var _this12 = this;

      if (this.playerConfig_ && this.playerConfig_.behavior && this.shouldFetchMoreStories_() && remaining <= FETCH_STORIES_THRESHOLD) {
        this.fetchStories_().then(function (stories) {
          if (!stories) {
            return;
          }

          _this12.add(stories);
        }).catch(function (reason) {
          console
          /*OK*/
          .error("[" + TAG + "]", reason);
        });
      }
    }
    /**
     * @param {!Object} behavior
     * @return {boolean}
     * @private
     */

  }, {
    key: "validateBehaviorDef_",
    value: function validateBehaviorDef_(behavior) {
      return behavior && behavior.on && behavior.action;
    }
    /**
     * Checks if fetching more stories is enabled and validates the configuration.
     * @return {boolean}
     * @private
     */

  }, {
    key: "shouldFetchMoreStories_",
    value: function shouldFetchMoreStories_() {
      if (this.isFetchingStoriesEnabled_ !== null) {
        return this.isFetchingStoriesEnabled_;
      }

      var behavior = this.playerConfig_.behavior;

      var hasEndFetchBehavior = function hasEndFetchBehavior(behavior) {
        return behavior.on === 'end' && behavior.action === 'fetch' && behavior.endpoint;
      };

      this.isFetchingStoriesEnabled_ = this.validateBehaviorDef_(behavior) && hasEndFetchBehavior(behavior);
      return this.isFetchingStoriesEnabled_;
    }
    /**
     * Navigates to the next story in the player.
     * @private
     */

  }, {
    key: "next_",
    value: function next_() {
      if (!this.isCircularWrappingEnabled_ && this.isIndexOutofBounds_(this.currentIdx_ + 1)) {
        return;
      }

      if (this.isCircularWrappingEnabled_ && this.isIndexOutofBounds_(this.currentIdx_ + 1)) {
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

  }, {
    key: "previous_",
    value: function previous_() {
      if (!this.isCircularWrappingEnabled_ && this.isIndexOutofBounds_(this.currentIdx_ - 1)) {
        return;
      }

      if (this.isCircularWrappingEnabled_ && this.isIndexOutofBounds_(this.currentIdx_ - 1)) {
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

  }, {
    key: "go",
    value: function go(storyDelta, pageDelta, options) {
      var _this13 = this;

      if (pageDelta === void 0) {
        pageDelta = 0;
      }

      if (options === void 0) {
        options = {};
      }

      if (storyDelta === 0 && pageDelta === 0) {
        return;
      }

      if (!this.isCircularWrappingEnabled_ && this.isIndexOutofBounds_(this.currentIdx_ + storyDelta)) {
        throw new Error('Out of Story range.');
      }

      var newStoryIdx = this.currentIdx_ + storyDelta;
      var newStory = storyDelta > 0 ? this.stories_[newStoryIdx % this.stories_.length] : this.stories_[(newStoryIdx % this.stories_.length + this.stories_.length) % this.stories_.length];

      var showPromise = _resolvedPromise4();

      if (this.currentIdx_ !== newStory.idx) {
        showPromise = this.show(newStory.href,
        /* pageId */
        null, options);
      }

      showPromise.then(function () {
        _this13.selectPage_(pageDelta);
      });
    }
    /**
     * Updates story position.
     * @param {!StoryDef} story
     * @return {!Promise}
     * @private
     */

  }, {
    key: "updatePosition_",
    value: function updatePosition_(story) {
      var position = story.distance === 0 ? StoryPosition.CURRENT : story.idx > this.currentIdx_ ? StoryPosition.NEXT : StoryPosition.PREVIOUS;
      requestAnimationFrame(function () {
        var iframe = story.iframe;
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

  }, {
    key: "currentStoryPromise_",
    value: function currentStoryPromise_(story) {
      if (this.stories_[this.currentIdx_].storyContentLoaded) {
        return _resolvedPromise5();
      }

      if (story.distance !== 0) {
        return this.currentStoryLoadDeferred_.promise;
      }

      if (this.currentStoryLoadDeferred_) {
        // Cancel previous story load promise.
        this.currentStoryLoadDeferred_.reject("[" + LOG_TYPE.DEV + "] Cancelling previous story load promise.");
      }

      this.initStoryContentLoadedPromise_(story);
      return _resolvedPromise6();
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

  }, {
    key: "render_",
    value: function render_(startingIdx) {
      var _this14 = this;

      if (startingIdx === void 0) {
        startingIdx = this.currentIdx_;
      }

      var renderPromises = [];

      var _loop = function _loop(i) {
        var story = _this14.stories_[(i + startingIdx) % _this14.stories_.length];
        var oldDistance = story.distance;
        story.distance = Math.abs(_this14.currentIdx_ - story.idx);

        // 1. Determine whether iframe should be in DOM tree or not.
        if (oldDistance <= 1 && story.distance > 1) {
          _this14.removeFromDom_(story);
        }

        if (story.distance <= 1 && !story.iframe.isConnected) {
          _this14.appendToDom_(story);
        }

        // Only create renderPromises for neighbor stories.
        if (story.distance > 1) {
          return "continue";
        }

        renderPromises.push( // 1. Wait for current story to load before evaluating neighbor stories.
        _this14.currentStoryPromise_(story).then(function () {
          return _this14.maybeGetCacheUrl_(story.href);
        }) // 2. Set iframe src when appropiate
        .then(function (storyUrl) {
          if (!_this14.sanitizedUrlsAreEquals_(storyUrl, story.iframe.src)) {
            _this14.setSrc_(story, storyUrl);
          }
        }) // 3. Waits for player to be visible before updating visibility
        // state.
        .then(function () {
          return _this14.visibleDeferred_.promise;
        }) // 4. Update the visibility state of the story.
        .then(function () {
          if (story.distance === 0 && _this14.playing_) {
            _this14.updateVisibilityState_(story, VisibilityState.VISIBLE);
          }

          if (oldDistance === 0 && story.distance === 1) {
            _this14.updateVisibilityState_(story, VisibilityState.INACTIVE);
          }
        }) // 5. Finally update the story position.
        .then(function () {
          _this14.updatePosition_(story);

          if (story.distance === 0) {
            tryFocus(story.iframe);
          }
        }).catch(function (err) {
          if (err.includes(LOG_TYPE.DEV)) {
            return;
          }

          console
          /*OK*/
          .error("[" + TAG + "]", err);
        }));
      };

      for (var i = 0; i < this.stories_.length; i++) {
        var _ret = _loop(i);

        if (_ret === "continue") continue;
      }

      return Promise.all(renderPromises);
    }
    /**
     * @param {!StoryDef} story
     * @private
     */

  }, {
    key: "appendToDom_",
    value: function appendToDom_(story) {
      this.rootEl_.appendChild(story.iframe);
      this.setUpMessagingForStory_(story);
      story.connectedDeferred.resolve();
    }
    /**
     * @param {!StoryDef} story
     * @private
     */

  }, {
    key: "removeFromDom_",
    value: function removeFromDom_(story) {
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

  }, {
    key: "setSrc_",
    value: function setSrc_(story, url) {
      var iframe = story.iframe;

      var _this$getEncodedLocat = this.getEncodedLocation_(url, VisibilityState.PRERENDER),
          href = _this$getEncodedLocat.href;

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

  }, {
    key: "sanitizedUrlsAreEquals_",
    value: function sanitizedUrlsAreEquals_(storyHref, iframeHref) {
      if (iframeHref.length <= 0) {
        return false;
      }

      var sanitizedIframeHref = removeFragment(removeSearch(iframeHref));
      var sanitizedStoryHref = removeFragment(removeSearch(storyHref));
      return sanitizedIframeHref === sanitizedStoryHref;
    }
    /**
     * Gets cache url, unless amp-cache is not defined.
     * @param {string} url
     * @return {!Promise<string>}
     * @private
     */

  }, {
    key: "maybeGetCacheUrl_",
    value: function maybeGetCacheUrl_(url) {
      var ampCache = this.element_.getAttribute('amp-cache');

      if (!ampCache || isProxyOrigin(url) || !SUPPORTED_CACHES.includes(ampCache)) {
        return Promise.resolve(url);
      }

      return ampToolboxCacheUrl.createCacheUrl(ampCache, url, 'viewer'
      /** servingType */
      ).then(function (cacheUrl) {
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

  }, {
    key: "getEncodedLocation_",
    value: function getEncodedLocation_(href, visibilityState) {
      if (visibilityState === void 0) {
        visibilityState = VisibilityState.INACTIVE;
      }

      var playerFragmentParams = {
        'visibilityState': visibilityState,
        'origin': this.win_.origin,
        'showStoryUrlInfo': '0',
        'storyPlayer': 'v0',
        'cap': 'swipe'
      };

      if (this.attribution_ === 'auto') {
        playerFragmentParams['attribution'] = 'auto';
      }

      var originalFragmentString = getFragment(href);
      var originalFragments = parseQueryString(originalFragmentString);

      var fragmentParams =
      /** @type {!JsonObject} */
      _extends({}, originalFragments, playerFragmentParams);

      var noFragmentUrl = removeFragment(href);

      if (isProxyOrigin(href)) {
        var ampJsQueryParam = dict({
          'amp_js_v': '0.1'
        });
        noFragmentUrl = addParamsToUrl(noFragmentUrl, ampJsQueryParam);
      }

      var inputUrl = noFragmentUrl + '#' + serializeQueryString(fragmentParams);
      return parseUrlWithA(
      /** @type {!HTMLAnchorElement} */
      this.cachedA_, inputUrl);
    }
    /**
     * Updates the visibility state of the story inside the iframe.
     * @param {!StoryDef} story
     * @param {!VisibilityState} visibilityState
     * @private
     */

  }, {
    key: "updateVisibilityState_",
    value: function updateVisibilityState_(story, visibilityState) {
      story.messagingPromise.then(function (messaging) {
        return messaging.sendRequest('visibilitychange', {
          state: visibilityState
        }, true);
      });
    }
    /**
     * Updates the specified iframe's story state with given value.
     * @param {!StoryDef} story
     * @param {string} state
     * @param {boolean} value
     * @private
     */

  }, {
    key: "updateStoryState_",
    value: function updateStoryState_(story, state, value) {
      story.messagingPromise.then(function (messaging) {
        messaging.sendRequest('setDocumentState', {
          state: state,
          value: value
        });
      });
    }
    /**
     * Update the muted state of the story inside the iframe.
     * @param {!StoryDef} story
     * @param {boolean} mutedValue
     * @private
     */

  }, {
    key: "updateMutedState_",
    value: function updateMutedState_(story, mutedValue) {
      this.updateStoryState_(story, STORY_MESSAGE_STATE_TYPE.MUTED_STATE, mutedValue);
    }
    /**
     * Send message to story asking for page attachment state.
     * @private
     */

  }, {
    key: "getPageAttachmentState_",
    value: function getPageAttachmentState_() {
      var _this15 = this;

      var story = this.stories_[this.currentIdx_];
      story.messagingPromise.then(function (messaging) {
        messaging.sendRequest('getDocumentState', {
          state: STORY_MESSAGE_STATE_TYPE.PAGE_ATTACHMENT_STATE
        }, true).then(function (event) {
          return _this15.dispatchPageAttachmentEvent_(event.value);
        });
      });
    }
    /**
     * @param {string} pageId
     * @private
     */

  }, {
    key: "goToPageId_",
    value: function goToPageId_(pageId) {
      var story = this.stories_[this.currentIdx_];
      story.messagingPromise.then(function (messaging) {
        return messaging.sendRequest('selectPage', {
          'id': pageId
        });
      });
    }
    /**
     * Returns the story given a URL.
     * @param {string} storyUrl
     * @return {!StoryDef}
     * @private
     */

  }, {
    key: "getStoryFromUrl_",
    value: function getStoryFromUrl_(storyUrl) {
      // TODO(enriqe): sanitize URLs for matching.
      var storyIdx = storyUrl ? findIndex(this.stories_, function (_ref) {
        var href = _ref.href;
        return href === storyUrl;
      }) : this.currentIdx_;

      if (!this.stories_[storyIdx]) {
        throw new Error("Story URL not found in the player: " + storyUrl);
      }

      return this.stories_[storyIdx];
    }
    /**
     * Rewinds the given story.
     * @param {string} storyUrl
     */

  }, {
    key: "rewind",
    value: function rewind(storyUrl) {
      var story = this.getStoryFromUrl_(storyUrl);
      this.whenConnected_(story).then(function () {
        return story.messagingPromise;
      }).then(function (messaging) {
        return messaging.sendRequest('rewind', {});
      });
    }
    /**
     * Returns a promise that resolves when the story is connected to the DOM.
     * @param {!StoryDef} story
     * @return {!Promise}
     * @private
     */

  }, {
    key: "whenConnected_",
    value: function whenConnected_(story) {
      if (story.iframe.isConnected) {
        return _resolvedPromise7();
      }

      return story.connectedDeferred.promise;
    }
    /**
     * Sends a message to the current story to navigate delta pages.
     * @param {number} delta
     * @private
     */

  }, {
    key: "selectPage_",
    value: function selectPage_(delta) {
      if (delta === 0) {
        return;
      }

      this.sendSelectPageDelta_(delta);
    }
    /**
     * @param {number} delta
     * @private
     */

  }, {
    key: "sendSelectPageDelta_",
    value: function sendSelectPageDelta_(delta) {
      var story = this.stories_[this.currentIdx_];
      story.messagingPromise.then(function (messaging) {
        return messaging.sendRequest('selectPage', {
          delta: delta
        });
      });
    }
    /**
     * React to documentStateUpdate events.
     * @param {!DocumentStateTypeDef} data
     * @param {Messaging} messaging
     * @private
     */

  }, {
    key: "onDocumentStateUpdate_",
    value: function onDocumentStateUpdate_(data, messaging) {
      switch (data.state) {
        case STORY_MESSAGE_STATE_TYPE.PAGE_ATTACHMENT_STATE:
          this.onPageAttachmentStateUpdate_(
          /** @type {boolean} */
          data.value);
          break;

        case STORY_MESSAGE_STATE_TYPE.CURRENT_PAGE_ID:
          this.onCurrentPageIdUpdate_(
          /** @type {string} */
          data.value, messaging);
          break;

        case STORY_MESSAGE_STATE_TYPE.MUTED_STATE:
          this.onMutedStateUpdate_(
          /** @type {string} */
          data.value);
          break;

        case STORY_MESSAGE_STATE_TYPE.UI_STATE:
          if (this.isDesktopPanelExperimentOn_) {
            // Handles UI state updates on window resize.
            this.onUiStateUpdate_(
            /** @type {number} */
            data.value);
          }

          break;

        case AMP_STORY_PLAYER_EVENT:
          this.onPlayerEvent_(
          /** @type {string} */
          data.value);
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

  }, {
    key: "onPlayerEvent_",
    value: function onPlayerEvent_(value) {
      switch (value) {
        case 'amp-story-player-skip-next':
        case 'amp-story-player-skip-to-next':
          this.next_();
          break;

        default:
          this.element_.dispatchEvent(createCustomEvent(this.win_, value, dict({})));
          break;
      }
    }
    /**
     * Reacts to mute/unmute events coming from the story.
     * @param {string} muted
     * @private
     */

  }, {
    key: "onMutedStateUpdate_",
    value: function onMutedStateUpdate_(muted) {
      this.element_.dispatchEvent(createCustomEvent(this.win_, 'amp-story-muted-state', {
        muted: muted
      }));
    }
    /**
     * Reacts to page id update events inside the story.
     * @param {string} pageId
     * @param {Messaging} messaging
     * @private
     */

  }, {
    key: "onCurrentPageIdUpdate_",
    value: function onCurrentPageIdUpdate_(pageId, messaging) {
      var _this16 = this;

      messaging.sendRequest('getDocumentState', dict({
        'state': STORY_MESSAGE_STATE_TYPE.STORY_PROGRESS
      }), true).then(function (progress) {
        _this16.element_.dispatchEvent(createCustomEvent(_this16.win_, 'storyNavigation', dict({
          'pageId': pageId,
          'progress': progress.value
        })));
      });
    }
    /**
     * React to page attachment update events.
     * @param {boolean} pageAttachmentOpen
     * @private
     */

  }, {
    key: "onPageAttachmentStateUpdate_",
    value: function onPageAttachmentStateUpdate_(pageAttachmentOpen) {
      this.updateButtonVisibility_(!pageAttachmentOpen);
      this.dispatchPageAttachmentEvent_(pageAttachmentOpen);
    }
    /**
     * Updates the visbility state of the exit control button.
     * TODO(#30031): delete this once new custom UI API is ready.
     * @param {boolean} isVisible
     * @private
     */

  }, {
    key: "updateButtonVisibility_",
    value: function updateButtonVisibility_(isVisible) {
      var button = this.rootEl_.querySelector('button.amp-story-player-exit-control-button');

      if (!button) {
        return;
      }

      isVisible ? button.classList.remove(DEPRECATED_BUTTON_CLASSES.HIDDEN) : button.classList.add(DEPRECATED_BUTTON_CLASSES.HIDDEN);
    }
    /**
     * Dispatch a page attachment event.
     * @param {boolean} isPageAttachmentOpen
     * @private
     */

  }, {
    key: "dispatchPageAttachmentEvent_",
    value: function dispatchPageAttachmentEvent_(isPageAttachmentOpen) {
      this.element_.dispatchEvent(createCustomEvent(this.win_, isPageAttachmentOpen ? 'page-attachment-open' : 'page-attachment-close', dict({})));
    }
    /**
     * React to selectDocument events.
     * @param {!Object} data
     * @private
     */

  }, {
    key: "onSelectDocument_",
    value: function onSelectDocument_(data) {
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

  }, {
    key: "dispatchEndOfStoriesEvent_",
    value: function dispatchEndOfStoriesEvent_(data) {
      if (this.isCircularWrappingEnabled_ || !data.next && !data.previous) {
        return;
      }

      var endOfStories, name;

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

  }, {
    key: "onTouchStart_",
    value: function onTouchStart_(event) {
      var coordinates = this.getClientTouchCoordinates_(event);

      if (!coordinates) {
        return;
      }

      this.touchEventState_.startX = coordinates.screenX;
      this.touchEventState_.startY = coordinates.screenY;
      this.pageScroller_ && this.pageScroller_.onTouchStart(event.timeStamp, coordinates.clientY);
      this.element_.dispatchEvent(createCustomEvent(this.win_, 'amp-story-player-touchstart', dict({
        'touches': event.touches
      })));
    }
    /**
     * Reacts to touchmove events.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchMove_",
    value: function onTouchMove_(event) {
      var coordinates = this.getClientTouchCoordinates_(event);

      if (!coordinates) {
        return;
      }

      this.element_.dispatchEvent(createCustomEvent(this.win_, 'amp-story-player-touchmove', dict({
        'touches': event.touches,
        'isNavigationalSwipe': this.touchEventState_.isSwipeX
      })));

      if (this.touchEventState_.isSwipeX === false) {
        this.pageScroller_ && this.pageScroller_.onTouchMove(event.timeStamp, coordinates.clientY);
        return;
      }

      var screenX = coordinates.screenX,
          screenY = coordinates.screenY;
      this.touchEventState_.lastX = screenX;

      if (this.touchEventState_.isSwipeX === null) {
        this.touchEventState_.isSwipeX = Math.abs(this.touchEventState_.startX - screenX) > Math.abs(this.touchEventState_.startY - screenY);

        if (!this.touchEventState_.isSwipeX) {
          return;
        }
      }

      this.onSwipeX_({
        deltaX: screenX - this.touchEventState_.startX,
        last: false
      });
    }
    /**
     * Reacts to touchend events. Resets cached touch event states.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onTouchEnd_",
    value: function onTouchEnd_(event) {
      this.element_.dispatchEvent(createCustomEvent(this.win_, 'amp-story-player-touchend', dict({
        'touches': event.touches,
        'isNavigationalSwipe': this.touchEventState_.isSwipeX
      })));

      if (this.touchEventState_.isSwipeX === true) {
        this.onSwipeX_({
          deltaX: this.touchEventState_.lastX - this.touchEventState_.startX,
          last: true
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

  }, {
    key: "onSwipeX_",
    value: function onSwipeX_(gesture) {
      if (this.stories_.length <= 1) {
        return;
      }

      var deltaX = gesture.deltaX;

      if (gesture.last === true) {
        var delta = Math.abs(deltaX);

        if (this.swipingState_ === SwipingState.SWIPING_TO_LEFT) {
          delta > TOGGLE_THRESHOLD_PX && (this.getSecondaryStory_() || this.isCircularWrappingEnabled_) ? this.next_() : this.resetStoryStyles_();
        }

        if (this.swipingState_ === SwipingState.SWIPING_TO_RIGHT) {
          delta > TOGGLE_THRESHOLD_PX && (this.getSecondaryStory_() || this.isCircularWrappingEnabled_) ? this.previous_() : this.resetStoryStyles_();
        }

        return;
      }

      this.drag_(deltaX);
    }
    /**
     * Resets styles for the currently swiped story.
     * @private
     */

  }, {
    key: "resetStoryStyles_",
    value: function resetStoryStyles_() {
      var currentIframe = this.stories_[this.currentIdx_].iframe;
      requestAnimationFrame(function () {
        resetStyles(devAssertElement(currentIframe), ['transform', 'transition']);
      });
      var secondaryStory = this.getSecondaryStory_();

      if (secondaryStory) {
        requestAnimationFrame(function () {
          resetStyles(devAssertElement(secondaryStory.iframe), ['transform', 'transition']);
        });
      }
    }
    /**
     * Gets accompanying story for the currently swiped story if any.
     * @private
     * @return {?StoryDef}
     */

  }, {
    key: "getSecondaryStory_",
    value: function getSecondaryStory_() {
      var nextStoryIdx = this.swipingState_ === SwipingState.SWIPING_TO_LEFT ? this.currentIdx_ + 1 : this.currentIdx_ - 1;

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

  }, {
    key: "isIndexOutofBounds_",
    value: function isIndexOutofBounds_(index) {
      return index >= this.stories_.length || index < 0;
    }
    /** @private */

  }, {
    key: "initializeAutoplay_",
    value: function initializeAutoplay_() {
      if (!this.playerConfig_) {
        return;
      }

      var behavior = this.playerConfig_.behavior;

      if (behavior && typeof behavior.autoplay === 'boolean') {
        this.playing_ = behavior.autoplay;
      }
    }
    /** @private */

  }, {
    key: "initializeAttribution_",
    value: function initializeAttribution_() {
      if (!this.playerConfig_) {
        return;
      }

      var display = this.playerConfig_.display;

      if (display && display.attribution === 'auto') {
        this.attribution_ = 'auto';
      }
    }
    /** @private */

  }, {
    key: "initializePageScroll_",
    value: function initializePageScroll_() {
      if (!this.playerConfig_) {
        return;
      }

      var behavior = this.playerConfig_.behavior;

      if (behavior && behavior.pageScroll === false) {
        this.pageScroller_ = null;
      }
    }
    /**
     * @private
     * @return {boolean}
     */

  }, {
    key: "initializeCircularWrapping_",
    value: function initializeCircularWrapping_() {
      if (this.isCircularWrappingEnabled_ !== null) {
        return this.isCircularWrappingEnabled_;
      }

      if (!this.playerConfig_) {
        this.isCircularWrappingEnabled_ = false;
        return false;
      }

      var behavior = this.playerConfig_.behavior;

      var hasCircularWrappingEnabled = function hasCircularWrappingEnabled(behavior) {
        return behavior.on === 'end' && behavior.action === 'circular-wrapping';
      };

      this.isCircularWrappingEnabled_ = this.validateBehaviorDef_(behavior) && hasCircularWrappingEnabled(behavior);
      return this.isCircularWrappingEnabled_;
    }
    /**
     * Drags stories following the swiping gesture.
     * @param {number} deltaX
     * @private
     */

  }, {
    key: "drag_",
    value: function drag_(deltaX) {
      var secondaryTranslate;

      if (deltaX < 0) {
        this.swipingState_ = SwipingState.SWIPING_TO_LEFT;
        secondaryTranslate = "translate3d(calc(100% + " + deltaX + "px), 0, 0)";
      } else {
        this.swipingState_ = SwipingState.SWIPING_TO_RIGHT;
        secondaryTranslate = "translate3d(calc(" + deltaX + "px - 100%), 0, 0)";
      }

      var story = this.stories_[this.currentIdx_];
      var iframe = story.iframe;
      var translate = "translate3d(" + deltaX + "px, 0, 0)";
      requestAnimationFrame(function () {
        setStyles(devAssertElement(iframe), {
          transform: translate,
          transition: 'none'
        });
      });
      var secondaryStory = this.getSecondaryStory_();

      if (!secondaryStory) {
        return;
      }

      requestAnimationFrame(function () {
        setStyles(devAssertElement(secondaryStory.iframe), {
          transform: secondaryTranslate,
          transition: 'none'
        });
      });
    }
    /**
     * Helper to retrieve the touch coordinates from a TouchEvent.
     * @param {!Event} event
     * @return {?{x: number, y: number}}
     * @private
     */

  }, {
    key: "getClientTouchCoordinates_",
    value: function getClientTouchCoordinates_(event) {
      var touches = event.touches;

      if (!touches || touches.length < 1) {
        return null;
      }

      var _touches$ = touches[0],
          clientX = _touches$.clientX,
          clientY = _touches$.clientY,
          screenX = _touches$.screenX,
          screenY = _touches$.screenY;
      return {
        screenX: screenX,
        screenY: screenY,
        clientX: clientX,
        clientY: clientY
      };
    }
  }]);

  return AmpStoryPlayer;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1wbGF5ZXItaW1wbC5qcyJdLCJuYW1lcyI6WyJhbXBUb29sYm94Q2FjaGVVcmwiLCJNZXNzYWdpbmciLCJkZXZBc3NlcnRFbGVtZW50IiwiVmlzaWJpbGl0eVN0YXRlIiwiRGVmZXJyZWQiLCJpc0pzb25TY3JpcHRUYWciLCJ0cnlGb2N1cyIsInJlc2V0U3R5bGVzIiwic2V0U3R5bGUiLCJzZXRTdHlsZXMiLCJmaW5kSW5kZXgiLCJ0b0FycmF5IiwiZGljdCIsInBhcnNlSnNvbiIsInBhcnNlUXVlcnlTdHJpbmciLCJBbXBTdG9yeVBsYXllclZpZXdwb3J0T2JzZXJ2ZXIiLCJQYWdlU2Nyb2xsZXIiLCJjc3NUZXh0IiwiYXBwbHlTYW5kYm94IiwidXJscyIsImNyZWF0ZUN1c3RvbUV2ZW50IiwibGlzdGVuT25jZSIsImdldE1vZGUiLCJhZGRQYXJhbXNUb1VybCIsImdldEZyYWdtZW50IiwiaXNQcm94eU9yaWdpbiIsInBhcnNlVXJsV2l0aEEiLCJyZW1vdmVGcmFnbWVudCIsInJlbW92ZVNlYXJjaCIsInNlcmlhbGl6ZVF1ZXJ5U3RyaW5nIiwiTG9hZFN0YXRlQ2xhc3MiLCJMT0FESU5HIiwiTE9BREVEIiwiRVJST1IiLCJTdG9yeVBvc2l0aW9uIiwiUFJFVklPVVMiLCJDVVJSRU5UIiwiTkVYVCIsIlNVUFBPUlRFRF9DQUNIRVMiLCJTQU5EQk9YX01JTl9MSVNUIiwiU3dpcGluZ1N0YXRlIiwiTk9UX1NXSVBJTkciLCJTV0lQSU5HX1RPX0xFRlQiLCJTV0lQSU5HX1RPX1JJR0hUIiwiVE9HR0xFX1RIUkVTSE9MRF9QWCIsIkZFVENIX1NUT1JJRVNfVEhSRVNIT0xEIiwiREVQUkVDQVRFRF9CVVRUT05fVFlQRVMiLCJCQUNLIiwiQ0xPU0UiLCJERVBSRUNBVEVEX0JVVFRPTl9DTEFTU0VTIiwiQkFTRSIsIkhJRERFTiIsIkRFUFJFQ0FURURfRVZFTlRfTkFNRVMiLCJTVE9SWV9TVEFURV9UWVBFIiwiUEFHRV9BVFRBQ0hNRU5UX1NUQVRFIiwiU1RPUllfTUVTU0FHRV9TVEFURV9UWVBFIiwiVUlfU1RBVEUiLCJNVVRFRF9TVEFURSIsIkNVUlJFTlRfUEFHRV9JRCIsIlNUT1JZX1BST0dSRVNTIiwiQU1QX1NUT1JZX1BMQVlFUl9FVkVOVCIsIkNMQVNTX05PX05BVklHQVRJT05fVFJBTlNJVElPTiIsIkRvY3VtZW50U3RhdGVUeXBlRGVmIiwiU3RvcnlEZWYiLCJCZWhhdmlvckRlZiIsIkRpc3BsYXlEZWYiLCJDb25maWdEZWYiLCJWaWV3ZXJDb250cm9sRGVmIiwiVEFHIiwiTE9HX1RZUEUiLCJERVYiLCJERVNLVE9QX09ORV9QQU5FTF9BU1BFQ1RfUkFUSU9fVEhSRVNIT0xEIiwiQW1wU3RvcnlQbGF5ZXIiLCJ3aW4iLCJlbGVtZW50Iiwid2luXyIsImVsZW1lbnRfIiwiZG9jXyIsImRvY3VtZW50IiwiY2FjaGVkQV8iLCJjcmVhdGVFbGVtZW50Iiwic3Rvcmllc18iLCJyb290RWxfIiwiY3VycmVudElkeF8iLCJzd2lwaW5nU3RhdGVfIiwicGxheWVyQ29uZmlnXyIsImlzRmV0Y2hpbmdTdG9yaWVzRW5hYmxlZF8iLCJpc0NpcmN1bGFyV3JhcHBpbmdFbmFibGVkXyIsInRvdWNoRXZlbnRTdGF0ZV8iLCJzdGFydFgiLCJzdGFydFkiLCJsYXN0WCIsImlzU3dpcGVYIiwiY3VycmVudFN0b3J5TG9hZERlZmVycmVkXyIsInZpc2libGVEZWZlcnJlZF8iLCJhdHRhY2hDYWxsYmFja3NUb0VsZW1lbnRfIiwicGFnZVNjcm9sbGVyXyIsInBsYXlpbmdfIiwiYXR0cmlidXRpb25fIiwicHJldkJ1dHRvbl8iLCJuZXh0QnV0dG9uXyIsImlzRGVza3RvcFBhbmVsRXhwZXJpbWVudE9uXyIsIkRFU0tUT1BfUEFORUxfU1RPUllfUExBWUVSX0VYUF9PTiIsImJ1aWxkUGxheWVyIiwiYmluZCIsImxheW91dFBsYXllciIsImdldEVsZW1lbnQiLCJnZXRTdG9yaWVzIiwibG9hZCIsInNob3ciLCJhZGQiLCJwbGF5IiwicGF1c2UiLCJnbyIsIm11dGUiLCJ1bm11dGUiLCJnZXRTdG9yeVN0YXRlIiwicmV3aW5kIiwiaXNDb25uZWN0ZWQiLCJFcnJvciIsImlzQnVpbHRfIiwic3RvcnkiLCJpZHgiLCJsZW5ndGgiLCJkaXN0YW5jZSIsImNvbm5lY3RlZERlZmVycmVkIiwicHVzaCIsIm5ld1N0b3JpZXMiLCJpc1N0b3J5RGVmIiwiaHJlZiIsIkFycmF5IiwiaXNBcnJheSIsImV2ZXJ5IiwicmVuZGVyU3RhcnRpbmdJZHgiLCJpIiwiaW5pdGlhbGl6ZUFuZEFkZFN0b3J5XyIsImJ1aWxkSWZyYW1lRm9yXyIsInJlbmRlcl8iLCJpc0xhaWRPdXRfIiwidG9nZ2xlUGF1c2VkXyIsInBhdXNlZCIsImN1cnJlbnRTdG9yeSIsInVwZGF0ZVZpc2liaWxpdHlTdGF0ZV8iLCJQQVVTRUQiLCJWSVNJQkxFIiwiaW5pdGlhbGl6ZUFuY2hvckVsU3Rvcmllc18iLCJpbml0aWFsaXplU2hhZG93Um9vdF8iLCJidWlsZFN0b3JpZXNfIiwiaW5pdGlhbGl6ZUJ1dHRvbl8iLCJyZWFkUGxheWVyQ29uZmlnXyIsIm1heWJlRmV0Y2hNb3JlU3Rvcmllc18iLCJpbml0aWFsaXplQXV0b3BsYXlfIiwiaW5pdGlhbGl6ZUF0dHJpYnV0aW9uXyIsImluaXRpYWxpemVQYWdlU2Nyb2xsXyIsImluaXRpYWxpemVDaXJjdWxhcldyYXBwaW5nXyIsImluaXRpYWxpemVEZXNrdG9wU3RvcnlDb250cm9sVUlfIiwic2lnbmFsUmVhZHlfIiwiYW5jaG9yRWxzIiwicXVlcnlTZWxlY3RvckFsbCIsImZvckVhY2giLCJwb3N0ZXJJbWdFbCIsInF1ZXJ5U2VsZWN0b3IiLCJwb3N0ZXJJbWdTcmMiLCJnZXRBdHRyaWJ1dGUiLCJ0aXRsZSIsInRleHRDb250ZW50IiwidHJpbSIsInBvc3RlckltYWdlIiwiZGlzcGF0Y2hFdmVudCIsImlzUmVhZHkiLCJjbGFzc0xpc3QiLCJzaGFkb3dDb250YWluZXIiLCJhcHBlbmRDaGlsZCIsImNvbnRhaW5lclRvVXNlIiwidGVzdCIsImF0dGFjaFNoYWRvdyIsIm1vZGUiLCJzdHlsZUVsIiwiaW5zZXJ0QmVmb3JlIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJvcHRpb24iLCJPYmplY3QiLCJ2YWx1ZXMiLCJpbmNsdWRlcyIsImJ1dHRvbiIsImFkZEV2ZW50TGlzdGVuZXIiLCJhbXBDYWNoZSIsImNvbnNvbGUiLCJlcnJvciIsInNjcmlwdFRhZyIsInJlYXNvbiIsImlmcmFtZUVsIiwic2V0QXR0cmlidXRlIiwiYWRkU2FuZGJveEZsYWdzXyIsImluaXRpYWxpemVMb2FkaW5nTGlzdGVuZXJzXyIsImlmcmFtZSIsInNhbmRib3giLCJzdXBwb3J0cyIsImZsYWciLCJtZXNzYWdpbmdQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbml0aWFsaXplSGFuZHNoYWtlXyIsInRoZW4iLCJtZXNzYWdpbmciLCJzZXREZWZhdWx0SGFuZGxlciIsInJlZ2lzdGVySGFuZGxlciIsImV2ZW50IiwiZGF0YSIsIm9uVG91Y2hTdGFydF8iLCJvblRvdWNoTW92ZV8iLCJvblRvdWNoRW5kXyIsIm9uU2VsZWN0RG9jdW1lbnRfIiwic2VuZFJlcXVlc3QiLCJvbkRvY3VtZW50U3RhdGVVcGRhdGVfIiwiY29udHJvbHMiLCJ1cGRhdGVDb250cm9sc1N0YXRlRm9yQWxsU3Rvcmllc18iLCJlcnIiLCJzdG9yeUlkeCIsInNraXBCdXR0b25JZHgiLCJjb250cm9sIiwibmFtZSIsInN0YXRlIiwibWF5YmVHZXRDYWNoZVVybF8iLCJ1cmwiLCJ3YWl0Rm9ySGFuZHNoYWtlRnJvbURvY3VtZW50IiwiY29udGVudFdpbmRvdyIsImdldEVuY29kZWRMb2NhdGlvbl8iLCJvcmlnaW4iLCJjZG5Qcm94eVJlZ2V4Iiwib25sb2FkIiwicmVtb3ZlIiwib25lcnJvciIsIlJlc2l6ZU9ic2VydmVyIiwiZSIsImNvbnRlbnRSZWN0IiwiaGVpZ2h0Iiwid2lkdGgiLCJvblBsYXllclJlc2l6ZV8iLCJvYnNlcnZlIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicHJldmlvdXNfIiwibmV4dF8iLCJjaGVja0J1dHRvbnNEaXNhYmxlZF8iLCJ0b2dnbGVBdHRyaWJ1dGUiLCJpc0luZGV4T3V0b2ZCb3VuZHNfIiwiaXNEZXNrdG9wT25lUGFuZWwiLCJ0b2dnbGUiLCJlbmRwb2ludCIsImJlaGF2aW9yIiwiaW5pdCIsIm1ldGhvZCIsImhlYWRlcnMiLCJBY2NlcHQiLCJyZXBsYWNlIiwidG9TdHJpbmciLCJmZXRjaCIsInJlc3BvbnNlIiwianNvbiIsImNhdGNoIiwic3RvcnlDb250ZW50TG9hZGVkIiwic3RvcnlVcmwiLCJwYWdlSWQiLCJvcHRpb25zIiwiZ2V0U3RvcnlGcm9tVXJsXyIsInJlbmRlclByb21pc2UiLCJhbmltYXRlIiwib25OYXZpZ2F0aW9uXyIsImdvVG9QYWdlSWRfIiwidXBkYXRlTXV0ZWRTdGF0ZV8iLCJzdG9yeVN0YXRlVHlwZSIsImdldFBhZ2VBdHRhY2htZW50U3RhdGVfIiwiaW5kZXgiLCJyZW1haW5pbmciLCJuYXZpZ2F0aW9uIiwiZ2V0VWlTdGF0ZV8iLCJ1aVR5cGVOdW1iZXIiLCJvblVpU3RhdGVVcGRhdGVfIiwic2lnbmFsTmF2aWdhdGlvbl8iLCJ2YWx1ZSIsImlzRnVsbGJsZWVkIiwic2hvdWxkRmV0Y2hNb3JlU3Rvcmllc18iLCJmZXRjaFN0b3JpZXNfIiwic3RvcmllcyIsIm9uIiwiYWN0aW9uIiwiaGFzRW5kRmV0Y2hCZWhhdmlvciIsInZhbGlkYXRlQmVoYXZpb3JEZWZfIiwic3RvcnlEZWx0YSIsInBhZ2VEZWx0YSIsIm5ld1N0b3J5SWR4IiwibmV3U3RvcnkiLCJzaG93UHJvbWlzZSIsInNlbGVjdFBhZ2VfIiwicG9zaXRpb24iLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJwcm9taXNlIiwicmVqZWN0IiwiaW5pdFN0b3J5Q29udGVudExvYWRlZFByb21pc2VfIiwic3RhcnRpbmdJZHgiLCJyZW5kZXJQcm9taXNlcyIsIm9sZERpc3RhbmNlIiwiTWF0aCIsImFicyIsInJlbW92ZUZyb21Eb21fIiwiYXBwZW5kVG9Eb21fIiwiY3VycmVudFN0b3J5UHJvbWlzZV8iLCJzYW5pdGl6ZWRVcmxzQXJlRXF1YWxzXyIsInNyYyIsInNldFNyY18iLCJJTkFDVElWRSIsInVwZGF0ZVBvc2l0aW9uXyIsImFsbCIsInNldFVwTWVzc2FnaW5nRm9yU3RvcnlfIiwiUFJFUkVOREVSIiwic3RvcnlIcmVmIiwiaWZyYW1lSHJlZiIsInNhbml0aXplZElmcmFtZUhyZWYiLCJzYW5pdGl6ZWRTdG9yeUhyZWYiLCJjcmVhdGVDYWNoZVVybCIsImNhY2hlVXJsIiwidmlzaWJpbGl0eVN0YXRlIiwicGxheWVyRnJhZ21lbnRQYXJhbXMiLCJvcmlnaW5hbEZyYWdtZW50U3RyaW5nIiwib3JpZ2luYWxGcmFnbWVudHMiLCJmcmFnbWVudFBhcmFtcyIsIm5vRnJhZ21lbnRVcmwiLCJhbXBKc1F1ZXJ5UGFyYW0iLCJpbnB1dFVybCIsIm11dGVkVmFsdWUiLCJ1cGRhdGVTdG9yeVN0YXRlXyIsImRpc3BhdGNoUGFnZUF0dGFjaG1lbnRFdmVudF8iLCJ3aGVuQ29ubmVjdGVkXyIsImRlbHRhIiwic2VuZFNlbGVjdFBhZ2VEZWx0YV8iLCJvblBhZ2VBdHRhY2htZW50U3RhdGVVcGRhdGVfIiwib25DdXJyZW50UGFnZUlkVXBkYXRlXyIsIm9uTXV0ZWRTdGF0ZVVwZGF0ZV8iLCJvblBsYXllckV2ZW50XyIsIm11dGVkIiwicHJvZ3Jlc3MiLCJwYWdlQXR0YWNobWVudE9wZW4iLCJ1cGRhdGVCdXR0b25WaXNpYmlsaXR5XyIsImlzVmlzaWJsZSIsImlzUGFnZUF0dGFjaG1lbnRPcGVuIiwiZGlzcGF0Y2hFbmRPZlN0b3JpZXNFdmVudF8iLCJuZXh0IiwicHJldmlvdXMiLCJlbmRPZlN0b3JpZXMiLCJjb29yZGluYXRlcyIsImdldENsaWVudFRvdWNoQ29vcmRpbmF0ZXNfIiwic2NyZWVuWCIsInNjcmVlblkiLCJvblRvdWNoU3RhcnQiLCJ0aW1lU3RhbXAiLCJjbGllbnRZIiwidG91Y2hlcyIsIm9uVG91Y2hNb3ZlIiwib25Td2lwZVhfIiwiZGVsdGFYIiwibGFzdCIsIm9uVG91Y2hFbmQiLCJnZXN0dXJlIiwiZ2V0U2Vjb25kYXJ5U3RvcnlfIiwicmVzZXRTdG9yeVN0eWxlc18iLCJkcmFnXyIsImN1cnJlbnRJZnJhbWUiLCJzZWNvbmRhcnlTdG9yeSIsIm5leHRTdG9yeUlkeCIsImF1dG9wbGF5IiwiZGlzcGxheSIsImF0dHJpYnV0aW9uIiwicGFnZVNjcm9sbCIsImhhc0NpcmN1bGFyV3JhcHBpbmdFbmFibGVkIiwic2Vjb25kYXJ5VHJhbnNsYXRlIiwidHJhbnNsYXRlIiwidHJhbnNmb3JtIiwidHJhbnNpdGlvbiIsImNsaWVudFgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLE9BQU8sS0FBS0Esa0JBQVosTUFBb0MsK0JBQXBDO0FBQ0EsU0FBUUMsU0FBUixRQUF3Qiw4QkFBeEI7QUFFQTtBQUNBLFNBQVFDLGdCQUFSO0FBQ0EsU0FBUUMsZUFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxlQUFSLEVBQXlCQyxRQUF6QjtBQUNBLFNBQVFDLFdBQVIsRUFBcUJDLFFBQXJCLEVBQStCQyxTQUEvQjtBQUNBLFNBQVFDLFNBQVIsRUFBbUJDLE9BQW5CO0FBQ0EsU0FBUUMsSUFBUjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyxnQkFBUjtBQUVBLFNBQVFDLDhCQUFSO0FBQ0EsU0FBUUMsWUFBUjtBQUVBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxZQUFSO0FBQ0EsU0FBUUMsSUFBUjtBQUNBLFNBQVFDLGlCQUFSLEVBQTJCQyxVQUEzQjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUNFQyxjQURGLEVBRUVDLFdBRkYsRUFHRUMsYUFIRixFQUlFQyxhQUpGLEVBS0VDLGNBTEYsRUFNRUMsWUFORixFQU9FQyxvQkFQRjs7QUFVQTtBQUNBLElBQU1DLGNBQWMsR0FBRztBQUNyQkMsRUFBQUEsT0FBTyxFQUFFLGdDQURZO0FBRXJCQyxFQUFBQSxN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T3FKLE9BQVA7O0FBQ0EsVUFBSSxDQUFDQSxPQUFELElBQVlBLE9BQU8sQ0FBQ3pPLE1BQVIsR0FBaUIsQ0FBakMsRUFBb0M7QUFDbEMsZUFBTyxJQUFQO0FBQ0Q7O0FBRUQsc0JBQTZDeU8sT0FBTyxDQUFDLENBQUQsQ0FBcEQ7QUFBQSxVQUFPc0IsT0FBUCxhQUFPQSxPQUFQO0FBQUEsVUFBZ0J2QixPQUFoQixhQUFnQkEsT0FBaEI7QUFBQSxVQUF5QkosT0FBekIsYUFBeUJBLE9BQXpCO0FBQUEsVUFBa0NDLE9BQWxDLGFBQWtDQSxPQUFsQztBQUNBLGFBQU87QUFBQ0QsUUFBQUEsT0FBTyxFQUFQQSxPQUFEO0FBQVVDLFFBQUFBLE9BQU8sRUFBUEEsT0FBVjtBQUFtQjBCLFFBQUFBLE9BQU8sRUFBUEEsT0FBbkI7QUFBNEJ2QixRQUFBQSxPQUFPLEVBQVBBO0FBQTVCLE9BQVA7QUFDRDtBQXB5REg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjEgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgKiBhcyBhbXBUb29sYm94Q2FjaGVVcmwgZnJvbSAnQGFtcHByb2plY3QvdG9vbGJveC1jYWNoZS11cmwnO1xuaW1wb3J0IHtNZXNzYWdpbmd9IGZyb20gJ0BhbXBwcm9qZWN0L3ZpZXdlci1tZXNzYWdpbmcnO1xuXG4vLyBTb3VyY2UgZm9yIHRoaXMgY29uc3RhbnQgaXMgY3NzL2FtcC1zdG9yeS1wbGF5ZXItc2hhZG93LmNzc1xuaW1wb3J0IHtkZXZBc3NlcnRFbGVtZW50fSBmcm9tICcjY29yZS9hc3NlcnQnO1xuaW1wb3J0IHtWaXNpYmlsaXR5U3RhdGV9IGZyb20gJyNjb3JlL2NvbnN0YW50cy92aXNpYmlsaXR5LXN0YXRlJztcbmltcG9ydCB7RGVmZXJyZWR9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7aXNKc29uU2NyaXB0VGFnLCB0cnlGb2N1c30gZnJvbSAnI2NvcmUvZG9tJztcbmltcG9ydCB7cmVzZXRTdHlsZXMsIHNldFN0eWxlLCBzZXRTdHlsZXN9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge2ZpbmRJbmRleCwgdG9BcnJheX0gZnJvbSAnI2NvcmUvdHlwZXMvYXJyYXknO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtwYXJzZUpzb259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdC9qc29uJztcbmltcG9ydCB7cGFyc2VRdWVyeVN0cmluZ30gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nL3VybCc7XG5cbmltcG9ydCB7QW1wU3RvcnlQbGF5ZXJWaWV3cG9ydE9ic2VydmVyfSBmcm9tICcuL2FtcC1zdG9yeS1wbGF5ZXItdmlld3BvcnQtb2JzZXJ2ZXInO1xuaW1wb3J0IHtQYWdlU2Nyb2xsZXJ9IGZyb20gJy4vcGFnZS1zY3JvbGxlcic7XG5cbmltcG9ydCB7Y3NzVGV4dH0gZnJvbSAnLi4vLi4vYnVpbGQvYW1wLXN0b3J5LXBsYXllci1zaGFkb3cuY3NzJztcbmltcG9ydCB7YXBwbHlTYW5kYm94fSBmcm9tICcuLi8zcC1mcmFtZSc7XG5pbXBvcnQge3VybHN9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge2NyZWF0ZUN1c3RvbUV2ZW50LCBsaXN0ZW5PbmNlfSBmcm9tICcuLi9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHtnZXRNb2RlfSBmcm9tICcuLi9tb2RlJztcbmltcG9ydCB7XG4gIGFkZFBhcmFtc1RvVXJsLFxuICBnZXRGcmFnbWVudCxcbiAgaXNQcm94eU9yaWdpbixcbiAgcGFyc2VVcmxXaXRoQSxcbiAgcmVtb3ZlRnJhZ21lbnQsXG4gIHJlbW92ZVNlYXJjaCxcbiAgc2VyaWFsaXplUXVlcnlTdHJpbmcsXG59IGZyb20gJy4uL3VybCc7XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuY29uc3QgTG9hZFN0YXRlQ2xhc3MgPSB7XG4gIExPQURJTkc6ICdpLWFtcGh0bWwtc3RvcnktcGxheWVyLWxvYWRpbmcnLFxuICBMT0FERUQ6ICdpLWFtcGh0bWwtc3RvcnktcGxheWVyLWxvYWRlZCcsXG4gIEVSUk9SOiAnaS1hbXBodG1sLXN0b3J5LXBsYXllci1lcnJvcicsXG59O1xuXG4vKiogQGVudW0ge251bWJlcn0gKi9cbmNvbnN0IFN0b3J5UG9zaXRpb24gPSB7XG4gIFBSRVZJT1VTOiAtMSxcbiAgQ1VSUkVOVDogMCxcbiAgTkVYVDogMSxcbn07XG5cbi8qKiBAY29uc3QgQHR5cGUgeyFBcnJheTxzdHJpbmc+fSAqL1xuY29uc3QgU1VQUE9SVEVEX0NBQ0hFUyA9IFsnY2RuLmFtcHByb2plY3Qub3JnJywgJ3d3dy5iaW5nLWFtcC5jb20nXTtcblxuLyoqIEBjb25zdCBAdHlwZSB7IUFycmF5PHN0cmluZz59ICovXG5jb25zdCBTQU5EQk9YX01JTl9MSVNUID0gWydhbGxvdy10b3AtbmF2aWdhdGlvbiddO1xuXG4vKiogQGVudW0ge251bWJlcn0gKi9cbmNvbnN0IFN3aXBpbmdTdGF0ZSA9IHtcbiAgTk9UX1NXSVBJTkc6IDAsXG4gIFNXSVBJTkdfVE9fTEVGVDogMSxcbiAgU1dJUElOR19UT19SSUdIVDogMixcbn07XG5cbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmNvbnN0IFRPR0dMRV9USFJFU0hPTERfUFggPSA1MDtcblxuLyoqXG4gKiBGZXRjaGVzIG1vcmUgc3RvcmllcyB3aGVuIHJlYWNoaW5nIHRoZSB0aHJlc2hvbGQuXG4gKiBAY29uc3Qge251bWJlcn1cbiAqL1xuY29uc3QgRkVUQ0hfU1RPUklFU19USFJFU0hPTEQgPSAyO1xuXG4vKiogQGVudW0ge3N0cmluZ30gKi9cbmNvbnN0IERFUFJFQ0FURURfQlVUVE9OX1RZUEVTID0ge1xuICBCQUNLOiAnYmFjay1idXR0b24nLFxuICBDTE9TRTogJ2Nsb3NlLWJ1dHRvbicsXG59O1xuXG4vKiogQGVudW0ge3N0cmluZ30gKi9cbmNvbnN0IERFUFJFQ0FURURfQlVUVE9OX0NMQVNTRVMgPSB7XG4gIEJBU0U6ICdhbXAtc3RvcnktcGxheWVyLWV4aXQtY29udHJvbC1idXR0b24nLFxuICBISURERU46ICdhbXAtc3RvcnktcGxheWVyLWhpZGUtYnV0dG9uJyxcbiAgW0RFUFJFQ0FURURfQlVUVE9OX1RZUEVTLkJBQ0tdOiAnYW1wLXN0b3J5LXBsYXllci1iYWNrLWJ1dHRvbicsXG4gIFtERVBSRUNBVEVEX0JVVFRPTl9UWVBFUy5DTE9TRV06ICdhbXAtc3RvcnktcGxheWVyLWNsb3NlLWJ1dHRvbicsXG59O1xuXG4vKiogQGVudW0ge3N0cmluZ30gKi9cbmNvbnN0IERFUFJFQ0FURURfRVZFTlRfTkFNRVMgPSB7XG4gIFtERVBSRUNBVEVEX0JVVFRPTl9UWVBFUy5CQUNLXTogJ2FtcC1zdG9yeS1wbGF5ZXItYmFjaycsXG4gIFtERVBSRUNBVEVEX0JVVFRPTl9UWVBFUy5DTE9TRV06ICdhbXAtc3RvcnktcGxheWVyLWNsb3NlJyxcbn07XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuY29uc3QgU1RPUllfU1RBVEVfVFlQRSA9IHtcbiAgUEFHRV9BVFRBQ0hNRU5UX1NUQVRFOiAncGFnZS1hdHRhY2htZW50Jyxcbn07XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuY29uc3QgU1RPUllfTUVTU0FHRV9TVEFURV9UWVBFID0ge1xuICBQQUdFX0FUVEFDSE1FTlRfU1RBVEU6ICdQQUdFX0FUVEFDSE1FTlRfU1RBVEUnLFxuICBVSV9TVEFURTogJ1VJX1NUQVRFJyxcbiAgTVVURURfU1RBVEU6ICdNVVRFRF9TVEFURScsXG4gIENVUlJFTlRfUEFHRV9JRDogJ0NVUlJFTlRfUEFHRV9JRCcsXG4gIFNUT1JZX1BST0dSRVNTOiAnU1RPUllfUFJPR1JFU1MnLFxufTtcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IEFNUF9TVE9SWV9QTEFZRVJfRVZFTlQgPSAnQU1QX1NUT1JZX1BMQVlFUl9FVkVOVCc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IENMQVNTX05PX05BVklHQVRJT05fVFJBTlNJVElPTiA9XG4gICdpLWFtcGh0bWwtc3RvcnktcGxheWVyLW5vLW5hdmlnYXRpb24tdHJhbnNpdGlvbic7XG5cbi8qKiBAdHlwZWRlZiB7eyBzdGF0ZTpzdHJpbmcsIHZhbHVlOihib29sZWFufHN0cmluZykgfX0gKi9cbmxldCBEb2N1bWVudFN0YXRlVHlwZURlZjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICBocmVmOiBzdHJpbmcsXG4gKiAgIGlkeDogbnVtYmVyLFxuICogICBkaXN0YW5jZTogbnVtYmVyLFxuICogICBpZnJhbWU6ID9FbGVtZW50LFxuICogICBtZXNzYWdpbmdQcm9taXNlOiA/UHJvbWlzZSxcbiAqICAgdGl0bGU6ICg/c3RyaW5nKSxcbiAqICAgcG9zdGVySW1hZ2U6ICg/c3RyaW5nKSxcbiAqICAgc3RvcnlDb250ZW50TG9hZGVkOiA/Ym9vbGVhbixcbiAqICAgY29ubmVjdGVkRGVmZXJyZWQ6ICFEZWZlcnJlZFxuICogfX1cbiAqL1xubGV0IFN0b3J5RGVmO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIG9uOiA/c3RyaW5nLFxuICogICBhY3Rpb246ID9zdHJpbmcsXG4gKiAgIGVuZHBvaW50OiA/c3RyaW5nLFxuICogICBwYWdlU2Nyb2xsOiA/Ym9vbGVhbixcbiAqICAgYXV0b3BsYXk6ID9ib29sZWFuLFxuICogfX1cbiAqL1xubGV0IEJlaGF2aW9yRGVmO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGF0dHJpYnV0aW9uOiA/c3RyaW5nLFxuICogfX1cbiAqL1xubGV0IERpc3BsYXlEZWY7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgY29udHJvbHM6ID9BcnJheTwhVmlld2VyQ29udHJvbERlZj4sXG4gKiAgIGJlaGF2aW9yOiA/QmVoYXZpb3JEZWYsXG4gKiAgIGRpc3BsYXk6ID9EaXNwbGF5RGVmLFxuICogfX1cbiAqL1xubGV0IENvbmZpZ0RlZjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICBuYW1lOiBzdHJpbmcsXG4gKiAgIHN0YXRlOiAoP3N0cmluZyksXG4gKiAgIGV2ZW50OiAoP3N0cmluZyksXG4gKiAgIHZpc2liaWxpdHk6ICg/c3RyaW5nKSxcbiAqICAgcG9zaXRpb246ICg/c3RyaW5nKSxcbiAqICAgYmFja2dyb3VuZEltYWdlVXJsOiAoP3N0cmluZylcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgVmlld2VyQ29udHJvbERlZjtcblxuLyoqIEB0eXBlIHtzdHJpbmd9ICovXG5jb25zdCBUQUcgPSAnYW1wLXN0b3J5LXBsYXllcic7XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuY29uc3QgTE9HX1RZUEUgPSB7XG4gIERFVjogJ2FtcC1zdG9yeS1wbGF5ZXItZGV2Jyxcbn07XG5cbi8qKlxuICogTk9URTogSWYgdWRwYXRlZCBoZXJlLCB1cGRhdGUgaW4gYW1wLXN0b3J5LmpzXG4gKiBAcHJpdmF0ZSBAY29uc3Qge251bWJlcn1cbiAqL1xuY29uc3QgREVTS1RPUF9PTkVfUEFORUxfQVNQRUNUX1JBVElPX1RIUkVTSE9MRCA9IDMgLyA0O1xuXG4vKipcbiAqIE5vdGUgdGhhdCB0aGlzIGlzIGEgdmFuaWxsYSBKYXZhU2NyaXB0IGNsYXNzIGFuZCBzaG91bGQgbm90IGRlcGVuZCBvbiBBTVBcbiAqIHNlcnZpY2VzLCBhcyB2MC5qcyBpcyBub3QgZXhwZWN0ZWQgdG8gYmUgbG9hZGVkIGluIHRoaXMgY29udGV4dC5cbiAqL1xuZXhwb3J0IGNsYXNzIEFtcFN0b3J5UGxheWVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgZWxlbWVudCkge1xuICAgIC8qKiBAcHJpdmF0ZSB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG5cbiAgICAvKiogQHByaXZhdGUgeyFFbGVtZW50fSAqL1xuICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuXG4gICAgLyoqIEBwcml2YXRlIHshRG9jdW1lbnR9ICovXG4gICAgdGhpcy5kb2NfID0gd2luLmRvY3VtZW50O1xuXG4gICAgLyoqIEBwcml2YXRlIHshRWxlbWVudH0gKi9cbiAgICB0aGlzLmNhY2hlZEFfID0gdGhpcy5kb2NfLmNyZWF0ZUVsZW1lbnQoJ2EnKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUFycmF5PCFTdG9yeURlZj59ICovXG4gICAgdGhpcy5zdG9yaWVzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLnJvb3RFbF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5jdXJyZW50SWR4XyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUgeyFTd2lwaW5nU3RhdGV9ICovXG4gICAgdGhpcy5zd2lwaW5nU3RhdGVfID0gU3dpcGluZ1N0YXRlLk5PVF9TV0lQSU5HO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Q29uZmlnRGVmfSAqL1xuICAgIHRoaXMucGxheWVyQ29uZmlnXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9ib29sZWFufSAqL1xuICAgIHRoaXMuaXNGZXRjaGluZ1N0b3JpZXNFbmFibGVkXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9ib29sZWFufSAqL1xuICAgIHRoaXMuaXNDaXJjdWxhcldyYXBwaW5nRW5hYmxlZF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHshT2JqZWN0fSAqL1xuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXyA9IHtcbiAgICAgIHN0YXJ0WDogMCxcbiAgICAgIHN0YXJ0WTogMCxcbiAgICAgIGxhc3RYOiAwLFxuICAgICAgaXNTd2lwZVg6IG51bGwsXG4gICAgfTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0RlZmVycmVkfSAqL1xuICAgIHRoaXMuY3VycmVudFN0b3J5TG9hZERlZmVycmVkXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgeyFEZWZlcnJlZH0gKi9cbiAgICB0aGlzLnZpc2libGVEZWZlcnJlZF8gPSBuZXcgRGVmZXJyZWQoKTtcblxuICAgIHRoaXMuYXR0YWNoQ2FsbGJhY2tzVG9FbGVtZW50XygpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/UGFnZVNjcm9sbGVyfSAqL1xuICAgIHRoaXMucGFnZVNjcm9sbGVyXyA9IG5ldyBQYWdlU2Nyb2xsZXIod2luKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnBsYXlpbmdfID0gdHJ1ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P3N0cmluZ30gKi9cbiAgICB0aGlzLmF0dHJpYnV0aW9uXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMucHJldkJ1dHRvbl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLm5leHRCdXR0b25fID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFNob3dzIG9yIGhpZGVzIHRoZSBkZXNrdG9wIHBhbmVscyBwbGF5ZXIgZXhwZXJpbWVudC5cbiAgICAgKiBWYXJpYWJsZSBpcyBzZXQgb24gd2luZG93IGZvciB1bml0IHRlc3RpbmcgbmV3IGZlYXR1cmVzLlxuICAgICAqIEBwcml2YXRlIHs/Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmlzRGVza3RvcFBhbmVsRXhwZXJpbWVudE9uXyA9XG4gICAgICB0aGlzLndpbl8uREVTS1RPUF9QQU5FTF9TVE9SWV9QTEFZRVJfRVhQX09OO1xuXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudF87XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgY2FsbGJhY2tzIHRvIHRoZSBET00gZWxlbWVudCBmb3IgdGhlbSB0byBiZSB1c2VkIGJ5IHB1Ymxpc2hlcnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhdHRhY2hDYWxsYmFja3NUb0VsZW1lbnRfKCkge1xuICAgIHRoaXMuZWxlbWVudF8uYnVpbGRQbGF5ZXIgPSB0aGlzLmJ1aWxkUGxheWVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5lbGVtZW50Xy5sYXlvdXRQbGF5ZXIgPSB0aGlzLmxheW91dFBsYXllci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWxlbWVudF8uZ2V0RWxlbWVudCA9IHRoaXMuZ2V0RWxlbWVudC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWxlbWVudF8uZ2V0U3RvcmllcyA9IHRoaXMuZ2V0U3Rvcmllcy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWxlbWVudF8ubG9hZCA9IHRoaXMubG9hZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWxlbWVudF8uc2hvdyA9IHRoaXMuc2hvdy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWxlbWVudF8uYWRkID0gdGhpcy5hZGQuYmluZCh0aGlzKTtcbiAgICB0aGlzLmVsZW1lbnRfLnBsYXkgPSB0aGlzLnBsYXkuYmluZCh0aGlzKTtcbiAgICB0aGlzLmVsZW1lbnRfLnBhdXNlID0gdGhpcy5wYXVzZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWxlbWVudF8uZ28gPSB0aGlzLmdvLmJpbmQodGhpcyk7XG4gICAgdGhpcy5lbGVtZW50Xy5tdXRlID0gdGhpcy5tdXRlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5lbGVtZW50Xy51bm11dGUgPSB0aGlzLnVubXV0ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWxlbWVudF8uZ2V0U3RvcnlTdGF0ZSA9IHRoaXMuZ2V0U3RvcnlTdGF0ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWxlbWVudF8ucmV3aW5kID0gdGhpcy5yZXdpbmQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHRlcm5hbCBjYWxsYmFjayBmb3IgbWFudWFsbHkgbG9hZGluZyB0aGUgcGxheWVyLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBsb2FkKCkge1xuICAgIGlmICghdGhpcy5lbGVtZW50Xy5pc0Nvbm5lY3RlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgWyR7VEFHfV0gZWxlbWVudCBtdXN0IGJlIGNvbm5lY3RlZCB0byB0aGUgRE9NIGJlZm9yZSBjYWxsaW5nIGxvYWQoKS5gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoISF0aGlzLmVsZW1lbnRfLmlzQnVpbHRfKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFske1RBR31dIGNhbGxpbmcgbG9hZCgpIG9uIGFuIGFscmVhZHkgbG9hZGVkIGVsZW1lbnQuYCk7XG4gICAgfVxuICAgIHRoaXMuYnVpbGRQbGF5ZXIoKTtcbiAgICB0aGlzLmxheW91dFBsYXllcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHN0b3J5IHdpdGggcHJvcGVydGllcyB1c2VkIGluIHRoaXMgY2xhc3MgYW5kIGFkZHMgaXQgdG8gdGhlXG4gICAqIHN0b3JpZXMgYXJyYXkuXG4gICAqIEBwYXJhbSB7IVN0b3J5RGVmfSBzdG9yeVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZUFuZEFkZFN0b3J5XyhzdG9yeSkge1xuICAgIHN0b3J5LmlkeCA9IHRoaXMuc3Rvcmllc18ubGVuZ3RoO1xuICAgIHN0b3J5LmRpc3RhbmNlID0gc3RvcnkuaWR4IC0gdGhpcy5jdXJyZW50SWR4XztcbiAgICBzdG9yeS5jb25uZWN0ZWREZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIHRoaXMuc3Rvcmllc18ucHVzaChzdG9yeSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBzdG9yaWVzIHRvIHRoZSBwbGF5ZXIuIEFkZGl0aW9uYWxseSwgY3JlYXRlcyBvciBhc3NpZ25zXG4gICAqIGlmcmFtZXMgdG8gdGhvc2UgdGhhdCBhcmUgY2xvc2UgdG8gdGhlIGN1cnJlbnQgcGxheWluZyBzdG9yeS5cbiAgICogQHBhcmFtIHshQXJyYXk8IXtocmVmOiBzdHJpbmcsIHRpdGxlOiA/c3RyaW5nLCBwb3N0ZXJJbWFnZTogP3N0cmluZ30+fSBuZXdTdG9yaWVzXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGFkZChuZXdTdG9yaWVzKSB7XG4gICAgaWYgKG5ld1N0b3JpZXMubGVuZ3RoIDw9IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpc1N0b3J5RGVmID0gKHN0b3J5KSA9PiBzdG9yeSAmJiBzdG9yeS5ocmVmO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShuZXdTdG9yaWVzKSB8fCAhbmV3U3Rvcmllcy5ldmVyeShpc1N0b3J5RGVmKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdcInN0b3JpZXNcIiBwYXJhbWV0ZXIgaGFzIHRoZSB3cm9uZyBzdHJ1Y3R1cmUnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZW5kZXJTdGFydGluZ0lkeCA9IHRoaXMuc3Rvcmllc18ubGVuZ3RoO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdTdG9yaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBzdG9yeSA9IG5ld1N0b3JpZXNbaV07XG4gICAgICB0aGlzLmluaXRpYWxpemVBbmRBZGRTdG9yeV8oc3RvcnkpO1xuICAgICAgdGhpcy5idWlsZElmcmFtZUZvcl8oc3RvcnkpO1xuICAgIH1cblxuICAgIHRoaXMucmVuZGVyXyhyZW5kZXJTdGFydGluZ0lkeCk7XG4gIH1cblxuICAvKipcbiAgICogTWFrZXMgdGhlIGN1cnJlbnQgc3RvcnkgcGxheSBpdHMgY29udGVudC9hdXRvLWFkdmFuY2VcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcGxheSgpIHtcbiAgICBpZiAoIXRoaXMuZWxlbWVudF8uaXNMYWlkT3V0Xykge1xuICAgICAgdGhpcy5sYXlvdXRQbGF5ZXIoKTtcbiAgICB9XG4gICAgdGhpcy50b2dnbGVQYXVzZWRfKGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlcyB0aGUgY3VycmVudCBzdG9yeSBwYXVzZSBpdHMgY29udGVudC9hdXRvLWFkdmFuY2VcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcGF1c2UoKSB7XG4gICAgdGhpcy50b2dnbGVQYXVzZWRfKHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2VzIHRoZSBjdXJyZW50IHN0b3J5IHBsYXkgb3IgcGF1c2UgaXRzIGNvbnRlbnQvYXV0by1hZHZhbmNlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcGF1c2VkIElmIHRydWUsIHRoZSBzdG9yeSB3aWxsIGJlIHBhdXNlZCwgYW5kIGl0IHdpbGwgYmUgcGxheWVkIG90aGVyd2lzZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdG9nZ2xlUGF1c2VkXyhwYXVzZWQpIHtcbiAgICB0aGlzLnBsYXlpbmdfID0gIXBhdXNlZDtcbiAgICBjb25zdCBjdXJyZW50U3RvcnkgPSB0aGlzLnN0b3JpZXNfW3RoaXMuY3VycmVudElkeF9dO1xuXG4gICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5U3RhdGVfKFxuICAgICAgY3VycmVudFN0b3J5LFxuICAgICAgcGF1c2VkID8gVmlzaWJpbGl0eVN0YXRlLlBBVVNFRCA6IFZpc2liaWxpdHlTdGF0ZS5WSVNJQkxFXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKi9cbiAgZ2V0RWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50XztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshQXJyYXk8IVN0b3J5RGVmPn1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZ2V0U3RvcmllcygpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yaWVzXztcbiAgfVxuXG4gIC8qKiBAcHVibGljICovXG4gIGJ1aWxkUGxheWVyKCkge1xuICAgIGlmICghIXRoaXMuZWxlbWVudF8uaXNCdWlsdF8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmluaXRpYWxpemVBbmNob3JFbFN0b3JpZXNfKCk7XG4gICAgdGhpcy5pbml0aWFsaXplU2hhZG93Um9vdF8oKTtcbiAgICB0aGlzLmJ1aWxkU3Rvcmllc18oKTtcbiAgICB0aGlzLmluaXRpYWxpemVCdXR0b25fKCk7XG4gICAgdGhpcy5yZWFkUGxheWVyQ29uZmlnXygpO1xuICAgIHRoaXMubWF5YmVGZXRjaE1vcmVTdG9yaWVzXyh0aGlzLnN0b3JpZXNfLmxlbmd0aCAtIHRoaXMuY3VycmVudElkeF8gLSAxKTtcbiAgICB0aGlzLmluaXRpYWxpemVBdXRvcGxheV8oKTtcbiAgICB0aGlzLmluaXRpYWxpemVBdHRyaWJ1dGlvbl8oKTtcbiAgICB0aGlzLmluaXRpYWxpemVQYWdlU2Nyb2xsXygpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZUNpcmN1bGFyV3JhcHBpbmdfKCk7XG4gICAgaWYgKHRoaXMuaXNEZXNrdG9wUGFuZWxFeHBlcmltZW50T25fKSB7XG4gICAgICB0aGlzLmluaXRpYWxpemVEZXNrdG9wU3RvcnlDb250cm9sVUlfKCk7XG4gICAgfVxuICAgIHRoaXMuc2lnbmFsUmVhZHlfKCk7XG4gICAgdGhpcy5lbGVtZW50Xy5pc0J1aWx0XyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgc3RvcmllcyBkZWNsYXJlZCBpbmxpbmUgYXMgPGE+IGVsZW1lbnRzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZUFuY2hvckVsU3Rvcmllc18oKSB7XG4gICAgY29uc3QgYW5jaG9yRWxzID0gdG9BcnJheSh0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKSk7XG4gICAgYW5jaG9yRWxzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgIGNvbnN0IHBvc3RlckltZ0VsID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAnaW1nW2RhdGEtYW1wLXN0b3J5LXBsYXllci1wb3N0ZXItaW1nXSdcbiAgICAgICk7XG4gICAgICBjb25zdCBwb3N0ZXJJbWdTcmMgPSBwb3N0ZXJJbWdFbCAmJiBwb3N0ZXJJbWdFbC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuXG4gICAgICBjb25zdCBzdG9yeSA9IC8qKiBAdHlwZSB7IVN0b3J5RGVmfSAqLyAoe1xuICAgICAgICBocmVmOiBlbGVtZW50LmhyZWYsXG4gICAgICAgIHRpdGxlOiAoZWxlbWVudC50ZXh0Q29udGVudCAmJiBlbGVtZW50LnRleHRDb250ZW50LnRyaW0oKSkgfHwgbnVsbCxcbiAgICAgICAgcG9zdGVySW1hZ2U6XG4gICAgICAgICAgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcG9zdGVyLXBvcnRyYWl0LXNyYycpIHx8IHBvc3RlckltZ1NyYyxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmluaXRpYWxpemVBbmRBZGRTdG9yeV8oc3RvcnkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHNpZ25hbFJlYWR5XygpIHtcbiAgICB0aGlzLmVsZW1lbnRfLmRpc3BhdGNoRXZlbnQoXG4gICAgICBjcmVhdGVDdXN0b21FdmVudCh0aGlzLndpbl8sICdyZWFkeScsIGRpY3Qoe30pKVxuICAgICk7XG4gICAgdGhpcy5lbGVtZW50Xy5pc1JlYWR5ID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBidWlsZFN0b3JpZXNfKCkge1xuICAgIHRoaXMuc3Rvcmllc18uZm9yRWFjaCgoc3RvcnkpID0+IHtcbiAgICAgIHRoaXMuYnVpbGRJZnJhbWVGb3JfKHN0b3J5KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBpbml0aWFsaXplU2hhZG93Um9vdF8oKSB7XG4gICAgdGhpcy5yb290RWxfID0gdGhpcy5kb2NfLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktcGxheWVyLW1haW4tY29udGFpbmVyJyk7XG5cbiAgICBjb25zdCBzaGFkb3dDb250YWluZXIgPSB0aGlzLmRvY18uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAvLyBGb3IgQU1QIHZlcnNpb24uXG4gICAgc2hhZG93Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXG4gICAgICAnaS1hbXBodG1sLWZpbGwtY29udGVudCcsXG4gICAgICAnaS1hbXBodG1sLXN0b3J5LXBsYXllci1zaGFkb3ctcm9vdC1pbnRlcm1lZGlhcnknXG4gICAgKTtcblxuICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQoc2hhZG93Q29udGFpbmVyKTtcblxuICAgIGNvbnN0IGNvbnRhaW5lclRvVXNlID1cbiAgICAgIGdldE1vZGUoKS50ZXN0IHx8ICF0aGlzLmVsZW1lbnRfLmF0dGFjaFNoYWRvd1xuICAgICAgICA/IHNoYWRvd0NvbnRhaW5lclxuICAgICAgICA6IHNoYWRvd0NvbnRhaW5lci5hdHRhY2hTaGFkb3coe21vZGU6ICdvcGVuJ30pO1xuXG4gICAgLy8gSW5qZWN0IGRlZmF1bHQgc3R5bGVzXG4gICAgY29uc3Qgc3R5bGVFbCA9IHRoaXMuZG9jXy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlRWwudGV4dENvbnRlbnQgPSBjc3NUZXh0O1xuICAgIGNvbnRhaW5lclRvVXNlLmFwcGVuZENoaWxkKHN0eWxlRWwpO1xuICAgIGNvbnRhaW5lclRvVXNlLmluc2VydEJlZm9yZSh0aGlzLnJvb3RFbF8sIGNvbnRhaW5lclRvVXNlLmZpcnN0RWxlbWVudENoaWxkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgdG8gY3JlYXRlIGEgYnV0dG9uLlxuICAgKiBUT0RPKCMzMDAzMSk6IGRlbGV0ZSB0aGlzIG9uY2UgbmV3IGN1c3RvbSBVSSBBUEkgaXMgcmVhZHkuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplQnV0dG9uXygpIHtcbiAgICBjb25zdCBvcHRpb24gPSB0aGlzLmVsZW1lbnRfLmdldEF0dHJpYnV0ZSgnZXhpdC1jb250cm9sJyk7XG4gICAgaWYgKCFPYmplY3QudmFsdWVzKERFUFJFQ0FURURfQlVUVE9OX1RZUEVTKS5pbmNsdWRlcyhvcHRpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYnV0dG9uID0gdGhpcy5kb2NfLmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIHRoaXMucm9vdEVsXy5hcHBlbmRDaGlsZChidXR0b24pO1xuXG4gICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoREVQUkVDQVRFRF9CVVRUT05fQ0xBU1NFU1tvcHRpb25dKTtcbiAgICBidXR0b24uY2xhc3NMaXN0LmFkZChERVBSRUNBVEVEX0JVVFRPTl9DTEFTU0VTLkJBU0UpO1xuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50Xy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBjcmVhdGVDdXN0b21FdmVudCh0aGlzLndpbl8sIERFUFJFQ0FURURfRVZFTlRfTkFNRVNbb3B0aW9uXSwgZGljdCh7fSkpXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgcHVibGlzaGVyIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBwbGF5ZXJcbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7P0NvbmZpZ0RlZn1cbiAgICovXG4gIHJlYWRQbGF5ZXJDb25maWdfKCkge1xuICAgIGlmICh0aGlzLnBsYXllckNvbmZpZ18pIHtcbiAgICAgIHJldHVybiB0aGlzLnBsYXllckNvbmZpZ187XG4gICAgfVxuXG4gICAgY29uc3QgYW1wQ2FjaGUgPSB0aGlzLmVsZW1lbnRfLmdldEF0dHJpYnV0ZSgnYW1wLWNhY2hlJyk7XG4gICAgaWYgKGFtcENhY2hlICYmICFTVVBQT1JURURfQ0FDSEVTLmluY2x1ZGVzKGFtcENhY2hlKSkge1xuICAgICAgY29uc29sZSAvKk9LKi9cbiAgICAgICAgLmVycm9yKFxuICAgICAgICAgIGBbJHtUQUd9XWAsXG4gICAgICAgICAgYFVuc3VwcG9ydGVkIGNhY2hlIHNwZWNpZmllZCwgdXNlIG9uZSBvZiBmb2xsb3dpbmc6ICR7U1VQUE9SVEVEX0NBQ0hFU31gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2NyaXB0VGFnID0gdGhpcy5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yKCdzY3JpcHQnKTtcbiAgICBpZiAoIXNjcmlwdFRhZykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCFpc0pzb25TY3JpcHRUYWcoc2NyaXB0VGFnKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCc8c2NyaXB0PiBjaGlsZCBtdXN0IGhhdmUgdHlwZT1cImFwcGxpY2F0aW9uL2pzb25cIicpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICB0aGlzLnBsYXllckNvbmZpZ18gPSAvKiogQHR5cGUgeyFDb25maWdEZWZ9ICovIChcbiAgICAgICAgcGFyc2VKc29uKHNjcmlwdFRhZy50ZXh0Q29udGVudClcbiAgICAgICk7XG4gICAgfSBjYXRjaCAocmVhc29uKSB7XG4gICAgICBjb25zb2xlIC8qT0sqL1xuICAgICAgICAuZXJyb3IoYFske1RBR31dIGAsIHJlYXNvbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucGxheWVyQ29uZmlnXztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFTdG9yeURlZn0gc3RvcnlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGJ1aWxkSWZyYW1lRm9yXyhzdG9yeSkge1xuICAgIGNvbnN0IGlmcmFtZUVsID0gdGhpcy5kb2NfLmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIGlmIChzdG9yeS5wb3N0ZXJJbWFnZSkge1xuICAgICAgc2V0U3R5bGUoaWZyYW1lRWwsICdiYWNrZ3JvdW5kSW1hZ2UnLCBzdG9yeS5wb3N0ZXJJbWFnZSk7XG4gICAgfVxuICAgIGlmcmFtZUVsLmNsYXNzTGlzdC5hZGQoJ3N0b3J5LXBsYXllci1pZnJhbWUnKTtcbiAgICBpZnJhbWVFbC5zZXRBdHRyaWJ1dGUoJ2FsbG93JywgJ2F1dG9wbGF5Jyk7XG5cbiAgICBhcHBseVNhbmRib3goaWZyYW1lRWwpO1xuICAgIHRoaXMuYWRkU2FuZGJveEZsYWdzXyhpZnJhbWVFbCk7XG4gICAgdGhpcy5pbml0aWFsaXplTG9hZGluZ0xpc3RlbmVyc18oaWZyYW1lRWwpO1xuXG4gICAgc3RvcnkuaWZyYW1lID0gaWZyYW1lRWw7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gaWZyYW1lXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhZGRTYW5kYm94RmxhZ3NfKGlmcmFtZSkge1xuICAgIGlmIChcbiAgICAgICFpZnJhbWUuc2FuZGJveCB8fFxuICAgICAgIWlmcmFtZS5zYW5kYm94LnN1cHBvcnRzIHx8XG4gICAgICBpZnJhbWUuc2FuZGJveC5sZW5ndGggPD0gMFxuICAgICkge1xuICAgICAgcmV0dXJuOyAvLyBDYW4ndCBmZWF0dXJlIGRldGVjdCBzdXBwb3J0LlxuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgU0FOREJPWF9NSU5fTElTVC5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZmxhZyA9IFNBTkRCT1hfTUlOX0xJU1RbaV07XG5cbiAgICAgIGlmICghaWZyYW1lLnNhbmRib3guc3VwcG9ydHMoZmxhZykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJZnJhbWUgZG9lc24ndCBzdXBwb3J0OiAke2ZsYWd9YCk7XG4gICAgICB9XG5cbiAgICAgIGlmcmFtZS5zYW5kYm94LmFkZChmbGFnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB1cCBtZXNzYWdpbmcgZm9yIGEgc3RvcnkgaW5zaWRlIGFuIGlmcmFtZS5cbiAgICogQHBhcmFtIHshU3RvcnlEZWZ9IHN0b3J5XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzZXRVcE1lc3NhZ2luZ0ZvclN0b3J5XyhzdG9yeSkge1xuICAgIGNvbnN0IHtpZnJhbWV9ID0gc3Rvcnk7XG5cbiAgICBzdG9yeS5tZXNzYWdpbmdQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZUhhbmRzaGFrZV8oc3RvcnksIGlmcmFtZSkudGhlbihcbiAgICAgICAgKG1lc3NhZ2luZykgPT4ge1xuICAgICAgICAgIG1lc3NhZ2luZy5zZXREZWZhdWx0SGFuZGxlcigoKSA9PiBQcm9taXNlLnJlc29sdmUoKSk7XG4gICAgICAgICAgbWVzc2FnaW5nLnJlZ2lzdGVySGFuZGxlcigndG91Y2hzdGFydCcsIChldmVudCwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vblRvdWNoU3RhcnRfKC8qKiBAdHlwZSB7IUV2ZW50fSAqLyAoZGF0YSkpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbWVzc2FnaW5nLnJlZ2lzdGVySGFuZGxlcigndG91Y2htb3ZlJywgKGV2ZW50LCBkYXRhKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uVG91Y2hNb3ZlXygvKiogQHR5cGUgeyFFdmVudH0gKi8gKGRhdGEpKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIG1lc3NhZ2luZy5yZWdpc3RlckhhbmRsZXIoJ3RvdWNoZW5kJywgKGV2ZW50LCBkYXRhKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uVG91Y2hFbmRfKC8qKiBAdHlwZSB7IUV2ZW50fSAqLyAoZGF0YSkpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbWVzc2FnaW5nLnJlZ2lzdGVySGFuZGxlcignc2VsZWN0RG9jdW1lbnQnLCAoZXZlbnQsIGRhdGEpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25TZWxlY3REb2N1bWVudF8oLyoqIEB0eXBlIHshT2JqZWN0fSAqLyAoZGF0YSkpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbWVzc2FnaW5nLnNlbmRSZXF1ZXN0KFxuICAgICAgICAgICAgJ29uRG9jdW1lbnRTdGF0ZScsXG4gICAgICAgICAgICBkaWN0KHsnc3RhdGUnOiBTVE9SWV9NRVNTQUdFX1NUQVRFX1RZUEUuUEFHRV9BVFRBQ0hNRU5UX1NUQVRFfSksXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBtZXNzYWdpbmcuc2VuZFJlcXVlc3QoXG4gICAgICAgICAgICAnb25Eb2N1bWVudFN0YXRlJyxcbiAgICAgICAgICAgIGRpY3QoeydzdGF0ZSc6IFNUT1JZX01FU1NBR0VfU1RBVEVfVFlQRS5DVVJSRU5UX1BBR0VfSUR9KSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIG1lc3NhZ2luZy5zZW5kUmVxdWVzdChcbiAgICAgICAgICAgICdvbkRvY3VtZW50U3RhdGUnLFxuICAgICAgICAgICAgZGljdCh7J3N0YXRlJzogU1RPUllfTUVTU0FHRV9TVEFURV9UWVBFLk1VVEVEX1NUQVRFfSlcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgbWVzc2FnaW5nLnNlbmRSZXF1ZXN0KFxuICAgICAgICAgICAgJ29uRG9jdW1lbnRTdGF0ZScsXG4gICAgICAgICAgICBkaWN0KHsnc3RhdGUnOiBTVE9SWV9NRVNTQUdFX1NUQVRFX1RZUEUuVUlfU1RBVEV9KVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBtZXNzYWdpbmcucmVnaXN0ZXJIYW5kbGVyKCdkb2N1bWVudFN0YXRlVXBkYXRlJywgKGV2ZW50LCBkYXRhKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uRG9jdW1lbnRTdGF0ZVVwZGF0ZV8oXG4gICAgICAgICAgICAgIC8qKiBAdHlwZSB7IURvY3VtZW50U3RhdGVUeXBlRGVmfSAqLyAoZGF0YSksXG4gICAgICAgICAgICAgIG1lc3NhZ2luZ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmICh0aGlzLnBsYXllckNvbmZpZ18gJiYgdGhpcy5wbGF5ZXJDb25maWdfLmNvbnRyb2xzKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNvbnRyb2xzU3RhdGVGb3JBbGxTdG9yaWVzXyhzdG9yeS5pZHgpO1xuXG4gICAgICAgICAgICBtZXNzYWdpbmcuc2VuZFJlcXVlc3QoXG4gICAgICAgICAgICAgICdjdXN0b21Eb2N1bWVudFVJJyxcbiAgICAgICAgICAgICAgZGljdCh7J2NvbnRyb2xzJzogdGhpcy5wbGF5ZXJDb25maWdfLmNvbnRyb2xzfSksXG4gICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc29sdmUobWVzc2FnaW5nKTtcbiAgICAgICAgfSxcbiAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUgLypPSyovXG4gICAgICAgICAgICAuZXJyb3IoYFske1RBR31dYCwgZXJyKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBjb250cm9scyBjb25maWcgZm9yIGEgZ2l2ZW4gc3RvcnkuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdG9yeUlkeFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlQ29udHJvbHNTdGF0ZUZvckFsbFN0b3JpZXNfKHN0b3J5SWR4KSB7XG4gICAgLy8gRGlzYWJsZXMgc2tpcC10by1uZXh0IGJ1dHRvbiB3aGVuIHN0b3J5IGlzIHRoZSBsYXN0IG9uZSBpbiB0aGUgcGxheWVyLlxuICAgIGlmIChzdG9yeUlkeCA9PT0gdGhpcy5zdG9yaWVzXy5sZW5ndGggLSAxKSB7XG4gICAgICBjb25zdCBza2lwQnV0dG9uSWR4ID0gZmluZEluZGV4KFxuICAgICAgICB0aGlzLnBsYXllckNvbmZpZ18uY29udHJvbHMsXG4gICAgICAgIChjb250cm9sKSA9PlxuICAgICAgICAgIGNvbnRyb2wubmFtZSA9PT0gJ3NraXAtbmV4dCcgfHwgY29udHJvbC5uYW1lID09PSAnc2tpcC10by1uZXh0J1xuICAgICAgKTtcblxuICAgICAgaWYgKHNraXBCdXR0b25JZHggPj0gMCkge1xuICAgICAgICB0aGlzLnBsYXllckNvbmZpZ18uY29udHJvbHNbc2tpcEJ1dHRvbklkeF0uc3RhdGUgPSAnZGlzYWJsZWQnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFTdG9yeURlZn0gc3RvcnlcbiAgICogQHBhcmFtIHshRWxlbWVudH0gaWZyYW1lRWxcbiAgICogQHJldHVybiB7IVByb21pc2U8IU1lc3NhZ2luZz59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplSGFuZHNoYWtlXyhzdG9yeSwgaWZyYW1lRWwpIHtcbiAgICByZXR1cm4gdGhpcy5tYXliZUdldENhY2hlVXJsXyhzdG9yeS5ocmVmKS50aGVuKCh1cmwpID0+XG4gICAgICBNZXNzYWdpbmcud2FpdEZvckhhbmRzaGFrZUZyb21Eb2N1bWVudChcbiAgICAgICAgdGhpcy53aW5fLFxuICAgICAgICBpZnJhbWVFbC5jb250ZW50V2luZG93LFxuICAgICAgICB0aGlzLmdldEVuY29kZWRMb2NhdGlvbl8odXJsKS5vcmlnaW4sXG4gICAgICAgIC8qb3B0X3Rva2VuKi8gbnVsbCxcbiAgICAgICAgdXJscy5jZG5Qcm94eVJlZ2V4XG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBpZnJhbWVFbFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZUxvYWRpbmdMaXN0ZW5lcnNfKGlmcmFtZUVsKSB7XG4gICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC5hZGQoTG9hZFN0YXRlQ2xhc3MuTE9BRElORyk7XG5cbiAgICBpZnJhbWVFbC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LnJlbW92ZShMb2FkU3RhdGVDbGFzcy5MT0FESU5HKTtcbiAgICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QuYWRkKExvYWRTdGF0ZUNsYXNzLkxPQURFRCk7XG4gICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQoTG9hZFN0YXRlQ2xhc3MuTE9BREVEKTtcbiAgICB9O1xuICAgIGlmcmFtZUVsLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LnJlbW92ZShMb2FkU3RhdGVDbGFzcy5MT0FESU5HKTtcbiAgICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QuYWRkKExvYWRTdGF0ZUNsYXNzLkVSUk9SKTtcbiAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZChMb2FkU3RhdGVDbGFzcy5FUlJPUik7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBsYXlvdXRQbGF5ZXIoKSB7XG4gICAgaWYgKCEhdGhpcy5lbGVtZW50Xy5pc0xhaWRPdXRfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbmV3IEFtcFN0b3J5UGxheWVyVmlld3BvcnRPYnNlcnZlcih0aGlzLndpbl8sIHRoaXMuZWxlbWVudF8sICgpID0+XG4gICAgICB0aGlzLnZpc2libGVEZWZlcnJlZF8ucmVzb2x2ZSgpXG4gICAgKTtcbiAgICBpZiAodGhpcy5pc0Rlc2t0b3BQYW5lbEV4cGVyaW1lbnRPbl8pIHtcbiAgICAgIGlmICh0aGlzLndpbl8uUmVzaXplT2JzZXJ2ZXIpIHtcbiAgICAgICAgbmV3IHRoaXMud2luXy5SZXNpemVPYnNlcnZlcigoZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHtoZWlnaHQsIHdpZHRofSA9IGVbMF0uY29udGVudFJlY3Q7XG4gICAgICAgICAgdGhpcy5vblBsYXllclJlc2l6ZV8oaGVpZ2h0LCB3aWR0aCk7XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5lbGVtZW50Xyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTZXQgc2l6ZSBvbmNlIGFzIGZhbGxiYWNrIGZvciBicm93c2VycyBub3Qgc3VwcG9ydGluZyBSZXNpemVPYnNlcnZlci5cbiAgICAgICAgY29uc3Qge2hlaWdodCwgd2lkdGh9ID0gdGhpcy5lbGVtZW50Xy4vKk9LKi8gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRoaXMub25QbGF5ZXJSZXNpemVfKGhlaWdodCwgd2lkdGgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlbmRlcl8oKTtcblxuICAgIHRoaXMuZWxlbWVudF8uaXNMYWlkT3V0XyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGRlc2t0b3AgXCJwcmV2aW91c1wiIGFuZCBcIm5leHRcIiBzdG9yeSBVSS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVEZXNrdG9wU3RvcnlDb250cm9sVUlfKCkge1xuICAgIHRoaXMucHJldkJ1dHRvbl8gPSB0aGlzLmRvY18uY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgdGhpcy5wcmV2QnV0dG9uXy5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktcGxheWVyLWRlc2t0b3AtcGFuZWwtcHJldicpO1xuICAgIHRoaXMucHJldkJ1dHRvbl8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnByZXZpb3VzXygpKTtcbiAgICB0aGlzLnByZXZCdXR0b25fLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdwcmV2aW91cyBzdG9yeScpO1xuICAgIHRoaXMucm9vdEVsXy5hcHBlbmRDaGlsZCh0aGlzLnByZXZCdXR0b25fKTtcblxuICAgIHRoaXMubmV4dEJ1dHRvbl8gPSB0aGlzLmRvY18uY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgdGhpcy5uZXh0QnV0dG9uXy5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktcGxheWVyLWRlc2t0b3AtcGFuZWwtbmV4dCcpO1xuICAgIHRoaXMubmV4dEJ1dHRvbl8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm5leHRfKCkpO1xuICAgIHRoaXMubmV4dEJ1dHRvbl8uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ25leHQgc3RvcnknKTtcbiAgICB0aGlzLnJvb3RFbF8uYXBwZW5kQ2hpbGQodGhpcy5uZXh0QnV0dG9uXyk7XG5cbiAgICB0aGlzLmNoZWNrQnV0dG9uc0Rpc2FibGVkXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgZGlzYWJsZWQgYXR0cmlidXRlIG9uIGRlc2t0b3AgXCJwcmV2aW91c1wiIGFuZCBcIm5leHRcIiBidXR0b25zLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2hlY2tCdXR0b25zRGlzYWJsZWRfKCkge1xuICAgIHRoaXMucHJldkJ1dHRvbl8udG9nZ2xlQXR0cmlidXRlKFxuICAgICAgJ2Rpc2FibGVkJyxcbiAgICAgIHRoaXMuaXNJbmRleE91dG9mQm91bmRzXyh0aGlzLmN1cnJlbnRJZHhfIC0gMSkgJiZcbiAgICAgICAgIXRoaXMuaXNDaXJjdWxhcldyYXBwaW5nRW5hYmxlZF9cbiAgICApO1xuICAgIHRoaXMubmV4dEJ1dHRvbl8udG9nZ2xlQXR0cmlidXRlKFxuICAgICAgJ2Rpc2FibGVkJyxcbiAgICAgIHRoaXMuaXNJbmRleE91dG9mQm91bmRzXyh0aGlzLmN1cnJlbnRJZHhfICsgMSkgJiZcbiAgICAgICAgIXRoaXMuaXNDaXJjdWxhcldyYXBwaW5nRW5hYmxlZF9cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblBsYXllclJlc2l6ZV8oaGVpZ2h0LCB3aWR0aCkge1xuICAgIGNvbnN0IGlzRGVza3RvcE9uZVBhbmVsID1cbiAgICAgIHdpZHRoIC8gaGVpZ2h0ID4gREVTS1RPUF9PTkVfUEFORUxfQVNQRUNUX1JBVElPX1RIUkVTSE9MRDtcblxuICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ2ktYW1waHRtbC1zdG9yeS1wbGF5ZXItZGVza3RvcC1wYW5lbCcsXG4gICAgICBpc0Rlc2t0b3BPbmVQYW5lbFxuICAgICk7XG5cbiAgICBpZiAoaXNEZXNrdG9wT25lUGFuZWwpIHtcbiAgICAgIHNldFN0eWxlcyh0aGlzLnJvb3RFbF8sIHtcbiAgICAgICAgJy0taS1hbXBodG1sLXN0b3J5LXBsYXllci1oZWlnaHQnOiBgJHtoZWlnaHR9cHhgLFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAnaS1hbXBodG1sLXN0b3J5LXBsYXllci1kZXNrdG9wLXBhbmVsLW1lZGl1bScsXG4gICAgICAgIGhlaWdodCA8IDc1NlxuICAgICAgKTtcblxuICAgICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAgICdpLWFtcGh0bWwtc3RvcnktcGxheWVyLWRlc2t0b3AtcGFuZWwtc21hbGwnLFxuICAgICAgICBoZWlnaHQgPCA1MzhcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgbW9yZSBzdG9yaWVzIGZyb20gdGhlIHB1Ymxpc2hlcidzIGVuZHBvaW50LlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZldGNoU3Rvcmllc18oKSB7XG4gICAgbGV0IHtlbmRwb2ludH0gPSB0aGlzLnBsYXllckNvbmZpZ18uYmVoYXZpb3I7XG4gICAgaWYgKCFlbmRwb2ludCkge1xuICAgICAgdGhpcy5pc0ZldGNoaW5nU3Rvcmllc0VuYWJsZWRfID0gZmFsc2U7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5pdCA9IHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgZW5kcG9pbnQgPSBlbmRwb2ludC5yZXBsYWNlKC9cXCR7b2Zmc2V0fS8sIHRoaXMuc3Rvcmllc18ubGVuZ3RoLnRvU3RyaW5nKCkpO1xuXG4gICAgcmV0dXJuIGZldGNoKGVuZHBvaW50LCBpbml0KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAuY2F0Y2goKHJlYXNvbikgPT4ge1xuICAgICAgICBjb25zb2xlIC8qT0sqL1xuICAgICAgICAgIC5lcnJvcihgWyR7VEFHfV1gLCByZWFzb24pO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZXMgY3VycmVudFN0b3J5TG9hZERlZmVycmVkXyB3aGVuIGdpdmVuIHN0b3J5J3MgY29udGVudCBpcyBmaW5pc2hlZFxuICAgKiBsb2FkaW5nLlxuICAgKiBAcGFyYW0geyFTdG9yeURlZn0gc3RvcnlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGluaXRTdG9yeUNvbnRlbnRMb2FkZWRQcm9taXNlXyhzdG9yeSkge1xuICAgIHRoaXMuY3VycmVudFN0b3J5TG9hZERlZmVycmVkXyA9IG5ldyBEZWZlcnJlZCgpO1xuXG4gICAgc3RvcnkubWVzc2FnaW5nUHJvbWlzZS50aGVuKChtZXNzYWdpbmcpID0+XG4gICAgICBtZXNzYWdpbmcucmVnaXN0ZXJIYW5kbGVyKCdzdG9yeUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gICAgICAgIC8vIFN0b3JpZXMgdGhhdCBhbHJlYWR5IGxvYWRlZCB3b24ndCBkaXNwYXRjaCBhIGBzdG9yeUNvbnRlbnRMb2FkZWRgXG4gICAgICAgIC8vIGV2ZW50IGFueW1vcmUsIHdoaWNoIGlzIHdoeSB3ZSBuZWVkIHRoaXMgc3luYyBwcm9wZXJ0eS5cbiAgICAgICAgc3Rvcnkuc3RvcnlDb250ZW50TG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jdXJyZW50U3RvcnlMb2FkRGVmZXJyZWRfLnJlc29sdmUoKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93cyB0aGUgc3RvcnkgcHJvdmlkZWQgYnkgdGhlIFVSTCBpbiB0aGUgcGxheWVyIGFuZCBnbyB0byB0aGUgcGFnZSBpZiBwcm92aWRlZC5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBzdG9yeVVybFxuICAgKiBAcGFyYW0ge3N0cmluZz19IHBhZ2VJZFxuICAgKiBAcGFyYW0ge3thbmltYXRlOiBib29sZWFuP319IG9wdGlvbnNcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBzaG93KHN0b3J5VXJsLCBwYWdlSWQgPSBudWxsLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBzdG9yeSA9IHRoaXMuZ2V0U3RvcnlGcm9tVXJsXyhzdG9yeVVybCk7XG5cbiAgICBsZXQgcmVuZGVyUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIGlmIChzdG9yeS5pZHggIT09IHRoaXMuY3VycmVudElkeF8pIHtcbiAgICAgIHRoaXMuY3VycmVudElkeF8gPSBzdG9yeS5pZHg7XG5cbiAgICAgIHJlbmRlclByb21pc2UgPSB0aGlzLnJlbmRlcl8oKTtcblxuICAgICAgaWYgKG9wdGlvbnMuYW5pbWF0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5yb290RWxfLmNsYXNzTGlzdC50b2dnbGUoQ0xBU1NfTk9fTkFWSUdBVElPTl9UUkFOU0lUSU9OLCB0cnVlKTtcbiAgICAgICAgbGlzdGVuT25jZShzdG9yeS5pZnJhbWUsICd0cmFuc2l0aW9uZW5kJywgKCkgPT4ge1xuICAgICAgICAgIHRoaXMucm9vdEVsXy5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05PX05BVklHQVRJT05fVFJBTlNJVElPTik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5vbk5hdmlnYXRpb25fKCk7XG4gICAgfVxuXG4gICAgaWYgKHBhZ2VJZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gcmVuZGVyUHJvbWlzZS50aGVuKCgpID0+IHRoaXMuZ29Ub1BhZ2VJZF8ocGFnZUlkKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlbmRlclByb21pc2U7XG4gIH1cblxuICAvKiogU2VuZHMgYSBtZXNzYWdlIG11dGluZyB0aGUgY3VycmVudCBzdG9yeS4gKi9cbiAgbXV0ZSgpIHtcbiAgICBjb25zdCBzdG9yeSA9IHRoaXMuc3Rvcmllc19bdGhpcy5jdXJyZW50SWR4X107XG4gICAgdGhpcy51cGRhdGVNdXRlZFN0YXRlXyhzdG9yeSwgdHJ1ZSk7XG4gIH1cblxuICAvKiogU2VuZHMgYSBtZXNzYWdlIHVubXV0aW5nIHRoZSBjdXJyZW50IHN0b3J5LiAqL1xuICB1bm11dGUoKSB7XG4gICAgY29uc3Qgc3RvcnkgPSB0aGlzLnN0b3JpZXNfW3RoaXMuY3VycmVudElkeF9dO1xuICAgIHRoaXMudXBkYXRlTXV0ZWRTdGF0ZV8oc3RvcnksIGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIG1lc3NhZ2UgYXNraW5nIGZvciB0aGUgY3VycmVudCBzdG9yeSdzIHN0YXRlIGFuZCBkaXNwYXRjaGVzIHRoZSBhcHByb3ByaWF0ZSBldmVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0b3J5U3RhdGVUeXBlXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGdldFN0b3J5U3RhdGUoc3RvcnlTdGF0ZVR5cGUpIHtcbiAgICBzd2l0Y2ggKHN0b3J5U3RhdGVUeXBlKSB7XG4gICAgICBjYXNlIFNUT1JZX1NUQVRFX1RZUEUuUEFHRV9BVFRBQ0hNRU5UX1NUQVRFOlxuICAgICAgICB0aGlzLmdldFBhZ2VBdHRhY2htZW50U3RhdGVfKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB0aGUgcGxheWVyIGNoYW5nZWQgc3RvcnkuXG4gICAqIEBwYXJhbSB7IU9iamVjdH0gZGF0YVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2lnbmFsTmF2aWdhdGlvbl8oZGF0YSkge1xuICAgIGNvbnN0IGV2ZW50ID0gY3JlYXRlQ3VzdG9tRXZlbnQoXG4gICAgICB0aGlzLndpbl8sXG4gICAgICAnbmF2aWdhdGlvbicsXG4gICAgICAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoZGF0YSlcbiAgICApO1xuICAgIHRoaXMuZWxlbWVudF8uZGlzcGF0Y2hFdmVudChldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgd2hlbiBzd2l0aGluZyBmcm9tIG9uZSBzdG9yeSB0byBhbm90aGVyLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25OYXZpZ2F0aW9uXygpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuY3VycmVudElkeF87XG4gICAgY29uc3QgcmVtYWluaW5nID0gdGhpcy5zdG9yaWVzXy5sZW5ndGggLSB0aGlzLmN1cnJlbnRJZHhfIC0gMTtcbiAgICBjb25zdCBuYXZpZ2F0aW9uID0ge1xuICAgICAgJ2luZGV4JzogaW5kZXgsXG4gICAgICAncmVtYWluaW5nJzogcmVtYWluaW5nLFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5pc0Rlc2t0b3BQYW5lbEV4cGVyaW1lbnRPbl8pIHtcbiAgICAgIHRoaXMuY2hlY2tCdXR0b25zRGlzYWJsZWRfKCk7XG4gICAgICB0aGlzLmdldFVpU3RhdGVfKCkudGhlbigodWlUeXBlTnVtYmVyKSA9PlxuICAgICAgICB0aGlzLm9uVWlTdGF0ZVVwZGF0ZV8odWlUeXBlTnVtYmVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5zaWduYWxOYXZpZ2F0aW9uXyhuYXZpZ2F0aW9uKTtcbiAgICB0aGlzLm1heWJlRmV0Y2hNb3JlU3Rvcmllc18ocmVtYWluaW5nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIFVJIHN0YXRlIGZyb20gYWN0aXZlIHN0b3J5LlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgZ2V0VWlTdGF0ZV8oKSB7XG4gICAgY29uc3Qgc3RvcnkgPSB0aGlzLnN0b3JpZXNfW3RoaXMuY3VycmVudElkeF9dO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzdG9yeS5tZXNzYWdpbmdQcm9taXNlLnRoZW4oKG1lc3NhZ2luZykgPT4ge1xuICAgICAgICBtZXNzYWdpbmdcbiAgICAgICAgICAuc2VuZFJlcXVlc3QoXG4gICAgICAgICAgICAnZ2V0RG9jdW1lbnRTdGF0ZScsXG4gICAgICAgICAgICB7c3RhdGU6IFNUT1JZX01FU1NBR0VfU1RBVEVfVFlQRS5VSV9TVEFURX0sXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICAgKVxuICAgICAgICAgIC50aGVuKChldmVudCkgPT4gcmVzb2x2ZShldmVudC52YWx1ZSkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2hvd3Mgb3IgaGlkZXMgb25lIHBhbmVsIFVJIG9uIHN0YXRlIHVwZGF0ZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHVpVHlwZU51bWJlclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25VaVN0YXRlVXBkYXRlXyh1aVR5cGVOdW1iZXIpIHtcbiAgICBjb25zdCBpc0Z1bGxibGVlZCA9XG4gICAgICB1aVR5cGVOdW1iZXIgPT09IDIgLyoqIERFU0tUT1BfRlVMTEJMRUVEICovIHx8XG4gICAgICB1aVR5cGVOdW1iZXIgPT09IDA7IC8qKiBNT0JJTEUgKi9cbiAgICB0aGlzLnJvb3RFbF8uY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdpLWFtcGh0bWwtc3RvcnktcGxheWVyLWZ1bGwtYmxlZWQtc3RvcnknLFxuICAgICAgaXNGdWxsYmxlZWRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgbW9yZSBzdG9yaWVzIGlmIGFwcHJvcGlhdGUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW1haW5pbmcgTnVtYmVyIG9mIHN0b3JpZXMgcmVtYWluaW5nIGluIHRoZSBwbGF5ZXIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtYXliZUZldGNoTW9yZVN0b3JpZXNfKHJlbWFpbmluZykge1xuICAgIGlmIChcbiAgICAgIHRoaXMucGxheWVyQ29uZmlnXyAmJlxuICAgICAgdGhpcy5wbGF5ZXJDb25maWdfLmJlaGF2aW9yICYmXG4gICAgICB0aGlzLnNob3VsZEZldGNoTW9yZVN0b3JpZXNfKCkgJiZcbiAgICAgIHJlbWFpbmluZyA8PSBGRVRDSF9TVE9SSUVTX1RIUkVTSE9MRFxuICAgICkge1xuICAgICAgdGhpcy5mZXRjaFN0b3JpZXNfKClcbiAgICAgICAgLnRoZW4oKHN0b3JpZXMpID0+IHtcbiAgICAgICAgICBpZiAoIXN0b3JpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hZGQoc3Rvcmllcyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgocmVhc29uKSA9PiB7XG4gICAgICAgICAgY29uc29sZSAvKk9LKi9cbiAgICAgICAgICAgIC5lcnJvcihgWyR7VEFHfV1gLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshT2JqZWN0fSBiZWhhdmlvclxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmFsaWRhdGVCZWhhdmlvckRlZl8oYmVoYXZpb3IpIHtcbiAgICByZXR1cm4gYmVoYXZpb3IgJiYgYmVoYXZpb3Iub24gJiYgYmVoYXZpb3IuYWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBmZXRjaGluZyBtb3JlIHN0b3JpZXMgaXMgZW5hYmxlZCBhbmQgdmFsaWRhdGVzIHRoZSBjb25maWd1cmF0aW9uLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2hvdWxkRmV0Y2hNb3JlU3Rvcmllc18oKSB7XG4gICAgaWYgKHRoaXMuaXNGZXRjaGluZ1N0b3JpZXNFbmFibGVkXyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuaXNGZXRjaGluZ1N0b3JpZXNFbmFibGVkXztcbiAgICB9XG5cbiAgICBjb25zdCB7YmVoYXZpb3J9ID0gdGhpcy5wbGF5ZXJDb25maWdfO1xuXG4gICAgY29uc3QgaGFzRW5kRmV0Y2hCZWhhdmlvciA9IChiZWhhdmlvcikgPT5cbiAgICAgIGJlaGF2aW9yLm9uID09PSAnZW5kJyAmJiBiZWhhdmlvci5hY3Rpb24gPT09ICdmZXRjaCcgJiYgYmVoYXZpb3IuZW5kcG9pbnQ7XG5cbiAgICB0aGlzLmlzRmV0Y2hpbmdTdG9yaWVzRW5hYmxlZF8gPVxuICAgICAgdGhpcy52YWxpZGF0ZUJlaGF2aW9yRGVmXyhiZWhhdmlvcikgJiYgaGFzRW5kRmV0Y2hCZWhhdmlvcihiZWhhdmlvcik7XG5cbiAgICByZXR1cm4gdGhpcy5pc0ZldGNoaW5nU3Rvcmllc0VuYWJsZWRfO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyB0byB0aGUgbmV4dCBzdG9yeSBpbiB0aGUgcGxheWVyLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbmV4dF8oKSB7XG4gICAgaWYgKFxuICAgICAgIXRoaXMuaXNDaXJjdWxhcldyYXBwaW5nRW5hYmxlZF8gJiZcbiAgICAgIHRoaXMuaXNJbmRleE91dG9mQm91bmRzXyh0aGlzLmN1cnJlbnRJZHhfICsgMSlcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLmlzQ2lyY3VsYXJXcmFwcGluZ0VuYWJsZWRfICYmXG4gICAgICB0aGlzLmlzSW5kZXhPdXRvZkJvdW5kc18odGhpcy5jdXJyZW50SWR4XyArIDEpXG4gICAgKSB7XG4gICAgICB0aGlzLmdvKDEpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY3VycmVudElkeF8rKztcbiAgICB0aGlzLnJlbmRlcl8oKTtcblxuICAgIHRoaXMub25OYXZpZ2F0aW9uXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyB0byB0aGUgcHJldmlvdXMgc3RvcnkgaW4gdGhlIHBsYXllci5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByZXZpb3VzXygpIHtcbiAgICBpZiAoXG4gICAgICAhdGhpcy5pc0NpcmN1bGFyV3JhcHBpbmdFbmFibGVkXyAmJlxuICAgICAgdGhpcy5pc0luZGV4T3V0b2ZCb3VuZHNfKHRoaXMuY3VycmVudElkeF8gLSAxKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMuaXNDaXJjdWxhcldyYXBwaW5nRW5hYmxlZF8gJiZcbiAgICAgIHRoaXMuaXNJbmRleE91dG9mQm91bmRzXyh0aGlzLmN1cnJlbnRJZHhfIC0gMSlcbiAgICApIHtcbiAgICAgIHRoaXMuZ28oLTEpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY3VycmVudElkeF8tLTtcbiAgICB0aGlzLnJlbmRlcl8oKTtcblxuICAgIHRoaXMub25OYXZpZ2F0aW9uXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBzdG9yaWVzIGdpdmVuIGEgbnVtYmVyLlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RvcnlEZWx0YVxuICAgKiBAcGFyYW0ge251bWJlcj19IHBhZ2VEZWx0YVxuICAgKiBAcGFyYW0ge3thbmltYXRlOiBib29sZWFuP319IG9wdGlvbnNcbiAgICovXG4gIGdvKHN0b3J5RGVsdGEsIHBhZ2VEZWx0YSA9IDAsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmIChzdG9yeURlbHRhID09PSAwICYmIHBhZ2VEZWx0YSA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICF0aGlzLmlzQ2lyY3VsYXJXcmFwcGluZ0VuYWJsZWRfICYmXG4gICAgICB0aGlzLmlzSW5kZXhPdXRvZkJvdW5kc18odGhpcy5jdXJyZW50SWR4XyArIHN0b3J5RGVsdGEpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ091dCBvZiBTdG9yeSByYW5nZS4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdTdG9yeUlkeCA9IHRoaXMuY3VycmVudElkeF8gKyBzdG9yeURlbHRhO1xuICAgIGNvbnN0IG5ld1N0b3J5ID1cbiAgICAgIHN0b3J5RGVsdGEgPiAwXG4gICAgICAgID8gdGhpcy5zdG9yaWVzX1tuZXdTdG9yeUlkeCAlIHRoaXMuc3Rvcmllc18ubGVuZ3RoXVxuICAgICAgICA6IHRoaXMuc3Rvcmllc19bXG4gICAgICAgICAgICAoKG5ld1N0b3J5SWR4ICUgdGhpcy5zdG9yaWVzXy5sZW5ndGgpICsgdGhpcy5zdG9yaWVzXy5sZW5ndGgpICVcbiAgICAgICAgICAgICAgdGhpcy5zdG9yaWVzXy5sZW5ndGhcbiAgICAgICAgICBdO1xuXG4gICAgbGV0IHNob3dQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgaWYgKHRoaXMuY3VycmVudElkeF8gIT09IG5ld1N0b3J5LmlkeCkge1xuICAgICAgc2hvd1Byb21pc2UgPSB0aGlzLnNob3cobmV3U3RvcnkuaHJlZiwgLyogcGFnZUlkICovIG51bGwsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHNob3dQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5zZWxlY3RQYWdlXyhwYWdlRGVsdGEpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgc3RvcnkgcG9zaXRpb24uXG4gICAqIEBwYXJhbSB7IVN0b3J5RGVmfSBzdG9yeVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZVBvc2l0aW9uXyhzdG9yeSkge1xuICAgIGNvbnN0IHBvc2l0aW9uID1cbiAgICAgIHN0b3J5LmRpc3RhbmNlID09PSAwXG4gICAgICAgID8gU3RvcnlQb3NpdGlvbi5DVVJSRU5UXG4gICAgICAgIDogc3RvcnkuaWR4ID4gdGhpcy5jdXJyZW50SWR4X1xuICAgICAgICA/IFN0b3J5UG9zaXRpb24uTkVYVFxuICAgICAgICA6IFN0b3J5UG9zaXRpb24uUFJFVklPVVM7XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgY29uc3Qge2lmcmFtZX0gPSBzdG9yeTtcbiAgICAgIHJlc2V0U3R5bGVzKGlmcmFtZSwgWyd0cmFuc2Zvcm0nLCAndHJhbnNpdGlvbiddKTtcbiAgICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ2ktYW1waHRtbC1pZnJhbWUtcG9zaXRpb24nLCBwb3NpdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCBtYWtlcyBzdXJlIGN1cnJlbnQgc3RvcnkgZ2V0cyBsb2FkZWQgZmlyc3QgYmVmb3JlXG4gICAqIG90aGVycy5cbiAgICogQHBhcmFtIHshU3RvcnlEZWZ9IHN0b3J5XG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3VycmVudFN0b3J5UHJvbWlzZV8oc3RvcnkpIHtcbiAgICBpZiAodGhpcy5zdG9yaWVzX1t0aGlzLmN1cnJlbnRJZHhfXS5zdG9yeUNvbnRlbnRMb2FkZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBpZiAoc3RvcnkuZGlzdGFuY2UgIT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTdG9yeUxvYWREZWZlcnJlZF8ucHJvbWlzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jdXJyZW50U3RvcnlMb2FkRGVmZXJyZWRfKSB7XG4gICAgICAvLyBDYW5jZWwgcHJldmlvdXMgc3RvcnkgbG9hZCBwcm9taXNlLlxuICAgICAgdGhpcy5jdXJyZW50U3RvcnlMb2FkRGVmZXJyZWRfLnJlamVjdChcbiAgICAgICAgYFske0xPR19UWVBFLkRFVn1dIENhbmNlbGxpbmcgcHJldmlvdXMgc3RvcnkgbG9hZCBwcm9taXNlLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5pbml0U3RvcnlDb250ZW50TG9hZGVkUHJvbWlzZV8oc3RvcnkpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAtIFVwZGF0ZXMgZGlzdGFuY2VzIG9mIHRoZSBzdG9yaWVzLlxuICAgKiAtIEFwcGVuZHMgLyByZW1vdmVzIGZyb20gdGhlIERPTSBkZXBlbmRpbmcgb24gZGlzdGFuY2VzLlxuICAgKiAtIFNldHMgdmlzaWJpbGl0eSBzdGF0ZS5cbiAgICogLSBMb2FkcyBzdG9yeSBOKzEgd2hlbiBOIGlzIHJlYWR5LlxuICAgKiAtIFBvc2l0aW9ucyBpZnJhbWVzIGRlcGVuZGluZyBvbiBkaXN0YW5jZS5cbiAgICogQHBhcmFtIHtudW1iZXI9fSBzdGFydGluZ0lkeFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlbmRlcl8oc3RhcnRpbmdJZHggPSB0aGlzLmN1cnJlbnRJZHhfKSB7XG4gICAgY29uc3QgcmVuZGVyUHJvbWlzZXMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdG9yaWVzXy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgc3RvcnkgPSB0aGlzLnN0b3JpZXNfWyhpICsgc3RhcnRpbmdJZHgpICUgdGhpcy5zdG9yaWVzXy5sZW5ndGhdO1xuXG4gICAgICBjb25zdCBvbGREaXN0YW5jZSA9IHN0b3J5LmRpc3RhbmNlO1xuICAgICAgc3RvcnkuZGlzdGFuY2UgPSBNYXRoLmFicyh0aGlzLmN1cnJlbnRJZHhfIC0gc3RvcnkuaWR4KTtcblxuICAgICAgLy8gMS4gRGV0ZXJtaW5lIHdoZXRoZXIgaWZyYW1lIHNob3VsZCBiZSBpbiBET00gdHJlZSBvciBub3QuXG4gICAgICBpZiAob2xkRGlzdGFuY2UgPD0gMSAmJiBzdG9yeS5kaXN0YW5jZSA+IDEpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVGcm9tRG9tXyhzdG9yeSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdG9yeS5kaXN0YW5jZSA8PSAxICYmICFzdG9yeS5pZnJhbWUuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5hcHBlbmRUb0RvbV8oc3RvcnkpO1xuICAgICAgfVxuXG4gICAgICAvLyBPbmx5IGNyZWF0ZSByZW5kZXJQcm9taXNlcyBmb3IgbmVpZ2hib3Igc3Rvcmllcy5cbiAgICAgIGlmIChzdG9yeS5kaXN0YW5jZSA+IDEpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHJlbmRlclByb21pc2VzLnB1c2goXG4gICAgICAgIC8vIDEuIFdhaXQgZm9yIGN1cnJlbnQgc3RvcnkgdG8gbG9hZCBiZWZvcmUgZXZhbHVhdGluZyBuZWlnaGJvciBzdG9yaWVzLlxuICAgICAgICB0aGlzLmN1cnJlbnRTdG9yeVByb21pc2VfKHN0b3J5KVxuICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMubWF5YmVHZXRDYWNoZVVybF8oc3RvcnkuaHJlZikpXG4gICAgICAgICAgLy8gMi4gU2V0IGlmcmFtZSBzcmMgd2hlbiBhcHByb3BpYXRlXG4gICAgICAgICAgLnRoZW4oKHN0b3J5VXJsKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc2FuaXRpemVkVXJsc0FyZUVxdWFsc18oc3RvcnlVcmwsIHN0b3J5LmlmcmFtZS5zcmMpKSB7XG4gICAgICAgICAgICAgIHRoaXMuc2V0U3JjXyhzdG9yeSwgc3RvcnlVcmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8gMy4gV2FpdHMgZm9yIHBsYXllciB0byBiZSB2aXNpYmxlIGJlZm9yZSB1cGRhdGluZyB2aXNpYmlsaXR5XG4gICAgICAgICAgLy8gc3RhdGUuXG4gICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy52aXNpYmxlRGVmZXJyZWRfLnByb21pc2UpXG4gICAgICAgICAgLy8gNC4gVXBkYXRlIHRoZSB2aXNpYmlsaXR5IHN0YXRlIG9mIHRoZSBzdG9yeS5cbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc3RvcnkuZGlzdGFuY2UgPT09IDAgJiYgdGhpcy5wbGF5aW5nXykge1xuICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHlTdGF0ZV8oc3RvcnksIFZpc2liaWxpdHlTdGF0ZS5WSVNJQkxFKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9sZERpc3RhbmNlID09PSAwICYmIHN0b3J5LmRpc3RhbmNlID09PSAxKSB7XG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eVN0YXRlXyhzdG9yeSwgVmlzaWJpbGl0eVN0YXRlLklOQUNUSVZFKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vIDUuIEZpbmFsbHkgdXBkYXRlIHRoZSBzdG9yeSBwb3NpdGlvbi5cbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uXyhzdG9yeSk7XG5cbiAgICAgICAgICAgIGlmIChzdG9yeS5kaXN0YW5jZSA9PT0gMCkge1xuICAgICAgICAgICAgICB0cnlGb2N1cyhzdG9yeS5pZnJhbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIuaW5jbHVkZXMoTE9HX1RZUEUuREVWKSkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlIC8qT0sqL1xuICAgICAgICAgICAgICAuZXJyb3IoYFske1RBR31dYCwgZXJyKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVuZGVyUHJvbWlzZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVN0b3J5RGVmfSBzdG9yeVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYXBwZW5kVG9Eb21fKHN0b3J5KSB7XG4gICAgdGhpcy5yb290RWxfLmFwcGVuZENoaWxkKHN0b3J5LmlmcmFtZSk7XG4gICAgdGhpcy5zZXRVcE1lc3NhZ2luZ0ZvclN0b3J5XyhzdG9yeSk7XG4gICAgc3RvcnkuY29ubmVjdGVkRGVmZXJyZWQucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVN0b3J5RGVmfSBzdG9yeVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlRnJvbURvbV8oc3RvcnkpIHtcbiAgICBzdG9yeS5zdG9yeUNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcbiAgICBzdG9yeS5jb25uZWN0ZWREZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIHN0b3J5LmlmcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICcnKTtcbiAgICBzdG9yeS5pZnJhbWUucmVtb3ZlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc3Rvcnkgc3JjIHRvIHRoZSBpZnJhbWUuXG4gICAqIEBwYXJhbSB7IVN0b3J5RGVmfSBzdG9yeVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2V0U3JjXyhzdG9yeSwgdXJsKSB7XG4gICAgY29uc3Qge2lmcmFtZX0gPSBzdG9yeTtcbiAgICBjb25zdCB7aHJlZn0gPSB0aGlzLmdldEVuY29kZWRMb2NhdGlvbl8odXJsLCBWaXNpYmlsaXR5U3RhdGUuUFJFUkVOREVSKTtcblxuICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyYycsIGhyZWYpO1xuICAgIGlmIChzdG9yeS50aXRsZSkge1xuICAgICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBzdG9yeS50aXRsZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbXBhcmVzIGhyZWYgZnJvbSB0aGUgc3Rvcnkgd2l0aCB0aGUgaHJlZiBpbiB0aGUgaWZyYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RvcnlIcmVmXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZnJhbWVIcmVmXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzYW5pdGl6ZWRVcmxzQXJlRXF1YWxzXyhzdG9yeUhyZWYsIGlmcmFtZUhyZWYpIHtcbiAgICBpZiAoaWZyYW1lSHJlZi5sZW5ndGggPD0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHNhbml0aXplZElmcmFtZUhyZWYgPSByZW1vdmVGcmFnbWVudChyZW1vdmVTZWFyY2goaWZyYW1lSHJlZikpO1xuICAgIGNvbnN0IHNhbml0aXplZFN0b3J5SHJlZiA9IHJlbW92ZUZyYWdtZW50KHJlbW92ZVNlYXJjaChzdG9yeUhyZWYpKTtcblxuICAgIHJldHVybiBzYW5pdGl6ZWRJZnJhbWVIcmVmID09PSBzYW5pdGl6ZWRTdG9yeUhyZWY7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBjYWNoZSB1cmwsIHVubGVzcyBhbXAtY2FjaGUgaXMgbm90IGRlZmluZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHJldHVybiB7IVByb21pc2U8c3RyaW5nPn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1heWJlR2V0Q2FjaGVVcmxfKHVybCkge1xuICAgIGNvbnN0IGFtcENhY2hlID0gdGhpcy5lbGVtZW50Xy5nZXRBdHRyaWJ1dGUoJ2FtcC1jYWNoZScpO1xuXG4gICAgaWYgKFxuICAgICAgIWFtcENhY2hlIHx8XG4gICAgICBpc1Byb3h5T3JpZ2luKHVybCkgfHxcbiAgICAgICFTVVBQT1JURURfQ0FDSEVTLmluY2x1ZGVzKGFtcENhY2hlKVxuICAgICkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh1cmwpO1xuICAgIH1cblxuICAgIHJldHVybiBhbXBUb29sYm94Q2FjaGVVcmxcbiAgICAgIC5jcmVhdGVDYWNoZVVybChhbXBDYWNoZSwgdXJsLCAndmlld2VyJyAvKiogc2VydmluZ1R5cGUgKi8pXG4gICAgICAudGhlbigoY2FjaGVVcmwpID0+IHtcbiAgICAgICAgcmV0dXJuIGNhY2hlVXJsO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBlbmNvZGVkIHVybCBmb3IgcGxheWVyIHVzYWdlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHJlZlxuICAgKiBAcGFyYW0ge1Zpc2liaWxpdHlTdGF0ZT19IHZpc2liaWxpdHlTdGF0ZVxuICAgKiBAcmV0dXJuIHshTG9jYXRpb259XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRFbmNvZGVkTG9jYXRpb25fKGhyZWYsIHZpc2liaWxpdHlTdGF0ZSA9IFZpc2liaWxpdHlTdGF0ZS5JTkFDVElWRSkge1xuICAgIGNvbnN0IHBsYXllckZyYWdtZW50UGFyYW1zID0ge1xuICAgICAgJ3Zpc2liaWxpdHlTdGF0ZSc6IHZpc2liaWxpdHlTdGF0ZSxcbiAgICAgICdvcmlnaW4nOiB0aGlzLndpbl8ub3JpZ2luLFxuICAgICAgJ3Nob3dTdG9yeVVybEluZm8nOiAnMCcsXG4gICAgICAnc3RvcnlQbGF5ZXInOiAndjAnLFxuICAgICAgJ2NhcCc6ICdzd2lwZScsXG4gICAgfTtcblxuICAgIGlmICh0aGlzLmF0dHJpYnV0aW9uXyA9PT0gJ2F1dG8nKSB7XG4gICAgICBwbGF5ZXJGcmFnbWVudFBhcmFtc1snYXR0cmlidXRpb24nXSA9ICdhdXRvJztcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW5hbEZyYWdtZW50U3RyaW5nID0gZ2V0RnJhZ21lbnQoaHJlZik7XG4gICAgY29uc3Qgb3JpZ2luYWxGcmFnbWVudHMgPSBwYXJzZVF1ZXJ5U3RyaW5nKG9yaWdpbmFsRnJhZ21lbnRTdHJpbmcpO1xuXG4gICAgY29uc3QgZnJhZ21lbnRQYXJhbXMgPSAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoe1xuICAgICAgLi4ub3JpZ2luYWxGcmFnbWVudHMsXG4gICAgICAuLi5wbGF5ZXJGcmFnbWVudFBhcmFtcyxcbiAgICB9KTtcblxuICAgIGxldCBub0ZyYWdtZW50VXJsID0gcmVtb3ZlRnJhZ21lbnQoaHJlZik7XG4gICAgaWYgKGlzUHJveHlPcmlnaW4oaHJlZikpIHtcbiAgICAgIGNvbnN0IGFtcEpzUXVlcnlQYXJhbSA9IGRpY3Qoe1xuICAgICAgICAnYW1wX2pzX3YnOiAnMC4xJyxcbiAgICAgIH0pO1xuICAgICAgbm9GcmFnbWVudFVybCA9IGFkZFBhcmFtc1RvVXJsKG5vRnJhZ21lbnRVcmwsIGFtcEpzUXVlcnlQYXJhbSk7XG4gICAgfVxuICAgIGNvbnN0IGlucHV0VXJsID0gbm9GcmFnbWVudFVybCArICcjJyArIHNlcmlhbGl6ZVF1ZXJ5U3RyaW5nKGZyYWdtZW50UGFyYW1zKTtcblxuICAgIHJldHVybiBwYXJzZVVybFdpdGhBKFxuICAgICAgLyoqIEB0eXBlIHshSFRNTEFuY2hvckVsZW1lbnR9ICovICh0aGlzLmNhY2hlZEFfKSxcbiAgICAgIGlucHV0VXJsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSB2aXNpYmlsaXR5IHN0YXRlIG9mIHRoZSBzdG9yeSBpbnNpZGUgdGhlIGlmcmFtZS5cbiAgICogQHBhcmFtIHshU3RvcnlEZWZ9IHN0b3J5XG4gICAqIEBwYXJhbSB7IVZpc2liaWxpdHlTdGF0ZX0gdmlzaWJpbGl0eVN0YXRlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVWaXNpYmlsaXR5U3RhdGVfKHN0b3J5LCB2aXNpYmlsaXR5U3RhdGUpIHtcbiAgICBzdG9yeS5tZXNzYWdpbmdQcm9taXNlLnRoZW4oKG1lc3NhZ2luZykgPT5cbiAgICAgIG1lc3NhZ2luZy5zZW5kUmVxdWVzdCgndmlzaWJpbGl0eWNoYW5nZScsIHtzdGF0ZTogdmlzaWJpbGl0eVN0YXRlfSwgdHJ1ZSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHNwZWNpZmllZCBpZnJhbWUncyBzdG9yeSBzdGF0ZSB3aXRoIGdpdmVuIHZhbHVlLlxuICAgKiBAcGFyYW0geyFTdG9yeURlZn0gc3RvcnlcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZVN0b3J5U3RhdGVfKHN0b3J5LCBzdGF0ZSwgdmFsdWUpIHtcbiAgICBzdG9yeS5tZXNzYWdpbmdQcm9taXNlLnRoZW4oKG1lc3NhZ2luZykgPT4ge1xuICAgICAgbWVzc2FnaW5nLnNlbmRSZXF1ZXN0KCdzZXREb2N1bWVudFN0YXRlJywge3N0YXRlLCB2YWx1ZX0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgbXV0ZWQgc3RhdGUgb2YgdGhlIHN0b3J5IGluc2lkZSB0aGUgaWZyYW1lLlxuICAgKiBAcGFyYW0geyFTdG9yeURlZn0gc3RvcnlcbiAgICogQHBhcmFtIHtib29sZWFufSBtdXRlZFZhbHVlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVNdXRlZFN0YXRlXyhzdG9yeSwgbXV0ZWRWYWx1ZSkge1xuICAgIHRoaXMudXBkYXRlU3RvcnlTdGF0ZV8oXG4gICAgICBzdG9yeSxcbiAgICAgIFNUT1JZX01FU1NBR0VfU1RBVEVfVFlQRS5NVVRFRF9TVEFURSxcbiAgICAgIG11dGVkVmFsdWVcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgbWVzc2FnZSB0byBzdG9yeSBhc2tpbmcgZm9yIHBhZ2UgYXR0YWNobWVudCBzdGF0ZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldFBhZ2VBdHRhY2htZW50U3RhdGVfKCkge1xuICAgIGNvbnN0IHN0b3J5ID0gdGhpcy5zdG9yaWVzX1t0aGlzLmN1cnJlbnRJZHhfXTtcblxuICAgIHN0b3J5Lm1lc3NhZ2luZ1Byb21pc2UudGhlbigobWVzc2FnaW5nKSA9PiB7XG4gICAgICBtZXNzYWdpbmdcbiAgICAgICAgLnNlbmRSZXF1ZXN0KFxuICAgICAgICAgICdnZXREb2N1bWVudFN0YXRlJyxcbiAgICAgICAgICB7c3RhdGU6IFNUT1JZX01FU1NBR0VfU1RBVEVfVFlQRS5QQUdFX0FUVEFDSE1FTlRfU1RBVEV9LFxuICAgICAgICAgIHRydWVcbiAgICAgICAgKVxuICAgICAgICAudGhlbigoZXZlbnQpID0+IHRoaXMuZGlzcGF0Y2hQYWdlQXR0YWNobWVudEV2ZW50XyhldmVudC52YWx1ZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlSWRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvVG9QYWdlSWRfKHBhZ2VJZCkge1xuICAgIGNvbnN0IHN0b3J5ID0gdGhpcy5zdG9yaWVzX1t0aGlzLmN1cnJlbnRJZHhfXTtcblxuICAgIHN0b3J5Lm1lc3NhZ2luZ1Byb21pc2UudGhlbigobWVzc2FnaW5nKSA9PlxuICAgICAgbWVzc2FnaW5nLnNlbmRSZXF1ZXN0KCdzZWxlY3RQYWdlJywgeydpZCc6IHBhZ2VJZH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdG9yeSBnaXZlbiBhIFVSTC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0b3J5VXJsXG4gICAqIEByZXR1cm4geyFTdG9yeURlZn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldFN0b3J5RnJvbVVybF8oc3RvcnlVcmwpIHtcbiAgICAvLyBUT0RPKGVucmlxZSk6IHNhbml0aXplIFVSTHMgZm9yIG1hdGNoaW5nLlxuICAgIGNvbnN0IHN0b3J5SWR4ID0gc3RvcnlVcmxcbiAgICAgID8gZmluZEluZGV4KHRoaXMuc3Rvcmllc18sICh7aHJlZn0pID0+IGhyZWYgPT09IHN0b3J5VXJsKVxuICAgICAgOiB0aGlzLmN1cnJlbnRJZHhfO1xuXG4gICAgaWYgKCF0aGlzLnN0b3JpZXNfW3N0b3J5SWR4XSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdG9yeSBVUkwgbm90IGZvdW5kIGluIHRoZSBwbGF5ZXI6ICR7c3RvcnlVcmx9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc3Rvcmllc19bc3RvcnlJZHhdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJld2luZHMgdGhlIGdpdmVuIHN0b3J5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RvcnlVcmxcbiAgICovXG4gIHJld2luZChzdG9yeVVybCkge1xuICAgIGNvbnN0IHN0b3J5ID0gdGhpcy5nZXRTdG9yeUZyb21VcmxfKHN0b3J5VXJsKTtcblxuICAgIHRoaXMud2hlbkNvbm5lY3RlZF8oc3RvcnkpXG4gICAgICAudGhlbigoKSA9PiBzdG9yeS5tZXNzYWdpbmdQcm9taXNlKVxuICAgICAgLnRoZW4oKG1lc3NhZ2luZykgPT4gbWVzc2FnaW5nLnNlbmRSZXF1ZXN0KCdyZXdpbmQnLCB7fSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgc3RvcnkgaXMgY29ubmVjdGVkIHRvIHRoZSBET00uXG4gICAqIEBwYXJhbSB7IVN0b3J5RGVmfSBzdG9yeVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHdoZW5Db25uZWN0ZWRfKHN0b3J5KSB7XG4gICAgaWYgKHN0b3J5LmlmcmFtZS5pc0Nvbm5lY3RlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc3RvcnkuY29ubmVjdGVkRGVmZXJyZWQucHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIG1lc3NhZ2UgdG8gdGhlIGN1cnJlbnQgc3RvcnkgdG8gbmF2aWdhdGUgZGVsdGEgcGFnZXMuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZWx0YVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2VsZWN0UGFnZV8oZGVsdGEpIHtcbiAgICBpZiAoZGVsdGEgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlbmRTZWxlY3RQYWdlRGVsdGFfKGRlbHRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVsdGFcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNlbmRTZWxlY3RQYWdlRGVsdGFfKGRlbHRhKSB7XG4gICAgY29uc3Qgc3RvcnkgPSB0aGlzLnN0b3JpZXNfW3RoaXMuY3VycmVudElkeF9dO1xuXG4gICAgc3RvcnkubWVzc2FnaW5nUHJvbWlzZS50aGVuKChtZXNzYWdpbmcpID0+XG4gICAgICBtZXNzYWdpbmcuc2VuZFJlcXVlc3QoJ3NlbGVjdFBhZ2UnLCB7ZGVsdGF9KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3QgdG8gZG9jdW1lbnRTdGF0ZVVwZGF0ZSBldmVudHMuXG4gICAqIEBwYXJhbSB7IURvY3VtZW50U3RhdGVUeXBlRGVmfSBkYXRhXG4gICAqIEBwYXJhbSB7TWVzc2FnaW5nfSBtZXNzYWdpbmdcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uRG9jdW1lbnRTdGF0ZVVwZGF0ZV8oZGF0YSwgbWVzc2FnaW5nKSB7XG4gICAgc3dpdGNoIChkYXRhLnN0YXRlKSB7XG4gICAgICBjYXNlIFNUT1JZX01FU1NBR0VfU1RBVEVfVFlQRS5QQUdFX0FUVEFDSE1FTlRfU1RBVEU6XG4gICAgICAgIHRoaXMub25QYWdlQXR0YWNobWVudFN0YXRlVXBkYXRlXygvKiogQHR5cGUge2Jvb2xlYW59ICovIChkYXRhLnZhbHVlKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVE9SWV9NRVNTQUdFX1NUQVRFX1RZUEUuQ1VSUkVOVF9QQUdFX0lEOlxuICAgICAgICB0aGlzLm9uQ3VycmVudFBhZ2VJZFVwZGF0ZV8oXG4gICAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovIChkYXRhLnZhbHVlKSxcbiAgICAgICAgICBtZXNzYWdpbmdcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUT1JZX01FU1NBR0VfU1RBVEVfVFlQRS5NVVRFRF9TVEFURTpcbiAgICAgICAgdGhpcy5vbk11dGVkU3RhdGVVcGRhdGVfKC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAoZGF0YS52YWx1ZSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RPUllfTUVTU0FHRV9TVEFURV9UWVBFLlVJX1NUQVRFOlxuICAgICAgICBpZiAodGhpcy5pc0Rlc2t0b3BQYW5lbEV4cGVyaW1lbnRPbl8pIHtcbiAgICAgICAgICAvLyBIYW5kbGVzIFVJIHN0YXRlIHVwZGF0ZXMgb24gd2luZG93IHJlc2l6ZS5cbiAgICAgICAgICB0aGlzLm9uVWlTdGF0ZVVwZGF0ZV8oLyoqIEB0eXBlIHtudW1iZXJ9ICovIChkYXRhLnZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFNUF9TVE9SWV9QTEFZRVJfRVZFTlQ6XG4gICAgICAgIHRoaXMub25QbGF5ZXJFdmVudF8oLyoqIEB0eXBlIHtzdHJpbmd9ICovIChkYXRhLnZhbHVlKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBldmVudHMgY29taW5nIGZyb20gdGhlIHN0b3J5LlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgICovXG4gIG9uUGxheWVyRXZlbnRfKHZhbHVlKSB7XG4gICAgc3dpdGNoICh2YWx1ZSkge1xuICAgICAgY2FzZSAnYW1wLXN0b3J5LXBsYXllci1za2lwLW5leHQnOlxuICAgICAgY2FzZSAnYW1wLXN0b3J5LXBsYXllci1za2lwLXRvLW5leHQnOlxuICAgICAgICB0aGlzLm5leHRfKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgIGNyZWF0ZUN1c3RvbUV2ZW50KHRoaXMud2luXywgdmFsdWUsIGRpY3Qoe30pKVxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIG11dGUvdW5tdXRlIGV2ZW50cyBjb21pbmcgZnJvbSB0aGUgc3RvcnkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtdXRlZFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25NdXRlZFN0YXRlVXBkYXRlXyhtdXRlZCkge1xuICAgIHRoaXMuZWxlbWVudF8uZGlzcGF0Y2hFdmVudChcbiAgICAgIGNyZWF0ZUN1c3RvbUV2ZW50KHRoaXMud2luXywgJ2FtcC1zdG9yeS1tdXRlZC1zdGF0ZScsIHttdXRlZH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gcGFnZSBpZCB1cGRhdGUgZXZlbnRzIGluc2lkZSB0aGUgc3RvcnkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlSWRcbiAgICogQHBhcmFtIHtNZXNzYWdpbmd9IG1lc3NhZ2luZ1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25DdXJyZW50UGFnZUlkVXBkYXRlXyhwYWdlSWQsIG1lc3NhZ2luZykge1xuICAgIG1lc3NhZ2luZ1xuICAgICAgLnNlbmRSZXF1ZXN0KFxuICAgICAgICAnZ2V0RG9jdW1lbnRTdGF0ZScsXG4gICAgICAgIGRpY3QoeydzdGF0ZSc6IFNUT1JZX01FU1NBR0VfU1RBVEVfVFlQRS5TVE9SWV9QUk9HUkVTU30pLFxuICAgICAgICB0cnVlXG4gICAgICApXG4gICAgICAudGhlbigocHJvZ3Jlc3MpID0+IHtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgIGNyZWF0ZUN1c3RvbUV2ZW50KFxuICAgICAgICAgICAgdGhpcy53aW5fLFxuICAgICAgICAgICAgJ3N0b3J5TmF2aWdhdGlvbicsXG4gICAgICAgICAgICBkaWN0KHtcbiAgICAgICAgICAgICAgJ3BhZ2VJZCc6IHBhZ2VJZCxcbiAgICAgICAgICAgICAgJ3Byb2dyZXNzJzogcHJvZ3Jlc3MudmFsdWUsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0IHRvIHBhZ2UgYXR0YWNobWVudCB1cGRhdGUgZXZlbnRzLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhZ2VBdHRhY2htZW50T3BlblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25QYWdlQXR0YWNobWVudFN0YXRlVXBkYXRlXyhwYWdlQXR0YWNobWVudE9wZW4pIHtcbiAgICB0aGlzLnVwZGF0ZUJ1dHRvblZpc2liaWxpdHlfKCFwYWdlQXR0YWNobWVudE9wZW4pO1xuICAgIHRoaXMuZGlzcGF0Y2hQYWdlQXR0YWNobWVudEV2ZW50XyhwYWdlQXR0YWNobWVudE9wZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHZpc2JpbGl0eSBzdGF0ZSBvZiB0aGUgZXhpdCBjb250cm9sIGJ1dHRvbi5cbiAgICogVE9ETygjMzAwMzEpOiBkZWxldGUgdGhpcyBvbmNlIG5ldyBjdXN0b20gVUkgQVBJIGlzIHJlYWR5LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmlzaWJsZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlQnV0dG9uVmlzaWJpbGl0eV8oaXNWaXNpYmxlKSB7XG4gICAgY29uc3QgYnV0dG9uID0gdGhpcy5yb290RWxfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnYnV0dG9uLmFtcC1zdG9yeS1wbGF5ZXItZXhpdC1jb250cm9sLWJ1dHRvbidcbiAgICApO1xuICAgIGlmICghYnV0dG9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaXNWaXNpYmxlXG4gICAgICA/IGJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKERFUFJFQ0FURURfQlVUVE9OX0NMQVNTRVMuSElEREVOKVxuICAgICAgOiBidXR0b24uY2xhc3NMaXN0LmFkZChERVBSRUNBVEVEX0JVVFRPTl9DTEFTU0VTLkhJRERFTik7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2ggYSBwYWdlIGF0dGFjaG1lbnQgZXZlbnQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNQYWdlQXR0YWNobWVudE9wZW5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRpc3BhdGNoUGFnZUF0dGFjaG1lbnRFdmVudF8oaXNQYWdlQXR0YWNobWVudE9wZW4pIHtcbiAgICB0aGlzLmVsZW1lbnRfLmRpc3BhdGNoRXZlbnQoXG4gICAgICBjcmVhdGVDdXN0b21FdmVudChcbiAgICAgICAgdGhpcy53aW5fLFxuICAgICAgICBpc1BhZ2VBdHRhY2htZW50T3BlbiA/ICdwYWdlLWF0dGFjaG1lbnQtb3BlbicgOiAncGFnZS1hdHRhY2htZW50LWNsb3NlJyxcbiAgICAgICAgZGljdCh7fSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0IHRvIHNlbGVjdERvY3VtZW50IGV2ZW50cy5cbiAgICogQHBhcmFtIHshT2JqZWN0fSBkYXRhXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblNlbGVjdERvY3VtZW50XyhkYXRhKSB7XG4gICAgdGhpcy5kaXNwYXRjaEVuZE9mU3Rvcmllc0V2ZW50XyhkYXRhKTtcbiAgICBpZiAoZGF0YS5uZXh0KSB7XG4gICAgICB0aGlzLm5leHRfKCk7XG4gICAgfSBlbHNlIGlmIChkYXRhLnByZXZpb3VzKSB7XG4gICAgICB0aGlzLnByZXZpb3VzXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGVuZCBvZiBzdG9yaWVzIGV2ZW50IHdoZW4gYXBwcm9waWF0ZS5cbiAgICogQHBhcmFtIHshT2JqZWN0fSBkYXRhXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkaXNwYXRjaEVuZE9mU3Rvcmllc0V2ZW50XyhkYXRhKSB7XG4gICAgaWYgKHRoaXMuaXNDaXJjdWxhcldyYXBwaW5nRW5hYmxlZF8gfHwgKCFkYXRhLm5leHQgJiYgIWRhdGEucHJldmlvdXMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGVuZE9mU3RvcmllcywgbmFtZTtcbiAgICBpZiAoZGF0YS5uZXh0KSB7XG4gICAgICBlbmRPZlN0b3JpZXMgPSB0aGlzLmN1cnJlbnRJZHhfICsgMSA9PT0gdGhpcy5zdG9yaWVzXy5sZW5ndGg7XG4gICAgICBuYW1lID0gJ25vTmV4dFN0b3J5JztcbiAgICB9IGVsc2Uge1xuICAgICAgZW5kT2ZTdG9yaWVzID0gdGhpcy5jdXJyZW50SWR4XyA9PT0gMDtcbiAgICAgIG5hbWUgPSAnbm9QcmV2aW91c1N0b3J5JztcbiAgICB9XG5cbiAgICBpZiAoZW5kT2ZTdG9yaWVzKSB7XG4gICAgICB0aGlzLmVsZW1lbnRfLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ3VzdG9tRXZlbnQodGhpcy53aW5fLCBuYW1lLCBkaWN0KHt9KSkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gdG91Y2hzdGFydCBldmVudHMgYW5kIGNhY2hlcyBpdHMgY29vcmRpbmF0ZXMuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Ub3VjaFN0YXJ0XyhldmVudCkge1xuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gdGhpcy5nZXRDbGllbnRUb3VjaENvb3JkaW5hdGVzXyhldmVudCk7XG4gICAgaWYgKCFjb29yZGluYXRlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5zdGFydFggPSBjb29yZGluYXRlcy5zY3JlZW5YO1xuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5zdGFydFkgPSBjb29yZGluYXRlcy5zY3JlZW5ZO1xuXG4gICAgdGhpcy5wYWdlU2Nyb2xsZXJfICYmXG4gICAgICB0aGlzLnBhZ2VTY3JvbGxlcl8ub25Ub3VjaFN0YXJ0KGV2ZW50LnRpbWVTdGFtcCwgY29vcmRpbmF0ZXMuY2xpZW50WSk7XG5cbiAgICB0aGlzLmVsZW1lbnRfLmRpc3BhdGNoRXZlbnQoXG4gICAgICBjcmVhdGVDdXN0b21FdmVudChcbiAgICAgICAgdGhpcy53aW5fLFxuICAgICAgICAnYW1wLXN0b3J5LXBsYXllci10b3VjaHN0YXJ0JyxcbiAgICAgICAgZGljdCh7XG4gICAgICAgICAgJ3RvdWNoZXMnOiBldmVudC50b3VjaGVzLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIHRvdWNobW92ZSBldmVudHMuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Ub3VjaE1vdmVfKGV2ZW50KSB7XG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSB0aGlzLmdldENsaWVudFRvdWNoQ29vcmRpbmF0ZXNfKGV2ZW50KTtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50Xy5kaXNwYXRjaEV2ZW50KFxuICAgICAgY3JlYXRlQ3VzdG9tRXZlbnQoXG4gICAgICAgIHRoaXMud2luXyxcbiAgICAgICAgJ2FtcC1zdG9yeS1wbGF5ZXItdG91Y2htb3ZlJyxcbiAgICAgICAgZGljdCh7XG4gICAgICAgICAgJ3RvdWNoZXMnOiBldmVudC50b3VjaGVzLFxuICAgICAgICAgICdpc05hdmlnYXRpb25hbFN3aXBlJzogdGhpcy50b3VjaEV2ZW50U3RhdGVfLmlzU3dpcGVYLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICk7XG5cbiAgICBpZiAodGhpcy50b3VjaEV2ZW50U3RhdGVfLmlzU3dpcGVYID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5wYWdlU2Nyb2xsZXJfICYmXG4gICAgICAgIHRoaXMucGFnZVNjcm9sbGVyXy5vblRvdWNoTW92ZShldmVudC50aW1lU3RhbXAsIGNvb3JkaW5hdGVzLmNsaWVudFkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtzY3JlZW5YLCBzY3JlZW5ZfSA9IGNvb3JkaW5hdGVzO1xuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5sYXN0WCA9IHNjcmVlblg7XG5cbiAgICBpZiAodGhpcy50b3VjaEV2ZW50U3RhdGVfLmlzU3dpcGVYID09PSBudWxsKSB7XG4gICAgICB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uaXNTd2lwZVggPVxuICAgICAgICBNYXRoLmFicyh0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uc3RhcnRYIC0gc2NyZWVuWCkgPlxuICAgICAgICBNYXRoLmFicyh0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uc3RhcnRZIC0gc2NyZWVuWSk7XG4gICAgICBpZiAoIXRoaXMudG91Y2hFdmVudFN0YXRlXy5pc1N3aXBlWCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vblN3aXBlWF8oe1xuICAgICAgZGVsdGFYOiBzY3JlZW5YIC0gdGhpcy50b3VjaEV2ZW50U3RhdGVfLnN0YXJ0WCxcbiAgICAgIGxhc3Q6IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byB0b3VjaGVuZCBldmVudHMuIFJlc2V0cyBjYWNoZWQgdG91Y2ggZXZlbnQgc3RhdGVzLlxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uVG91Y2hFbmRfKGV2ZW50KSB7XG4gICAgdGhpcy5lbGVtZW50Xy5kaXNwYXRjaEV2ZW50KFxuICAgICAgY3JlYXRlQ3VzdG9tRXZlbnQoXG4gICAgICAgIHRoaXMud2luXyxcbiAgICAgICAgJ2FtcC1zdG9yeS1wbGF5ZXItdG91Y2hlbmQnLFxuICAgICAgICBkaWN0KHtcbiAgICAgICAgICAndG91Y2hlcyc6IGV2ZW50LnRvdWNoZXMsXG4gICAgICAgICAgJ2lzTmF2aWdhdGlvbmFsU3dpcGUnOiB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uaXNTd2lwZVgsXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcblxuICAgIGlmICh0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uaXNTd2lwZVggPT09IHRydWUpIHtcbiAgICAgIHRoaXMub25Td2lwZVhfKHtcbiAgICAgICAgZGVsdGFYOiB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8ubGFzdFggLSB0aGlzLnRvdWNoRXZlbnRTdGF0ZV8uc3RhcnRYLFxuICAgICAgICBsYXN0OiB0cnVlLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGFnZVNjcm9sbGVyXyAmJiB0aGlzLnBhZ2VTY3JvbGxlcl8ub25Ub3VjaEVuZChldmVudC50aW1lU3RhbXApO1xuICAgIH1cblxuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5zdGFydFggPSAwO1xuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5zdGFydFkgPSAwO1xuICAgIHRoaXMudG91Y2hFdmVudFN0YXRlXy5sYXN0WCA9IDA7XG4gICAgdGhpcy50b3VjaEV2ZW50U3RhdGVfLmlzU3dpcGVYID0gbnVsbDtcbiAgICB0aGlzLnN3aXBpbmdTdGF0ZV8gPSBTd2lwaW5nU3RhdGUuTk9UX1NXSVBJTkc7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIGhvcml6b250YWwgc3dpcGUgZXZlbnRzLlxuICAgKiBAcGFyYW0geyFPYmplY3R9IGdlc3R1cmVcbiAgICovXG4gIG9uU3dpcGVYXyhnZXN0dXJlKSB7XG4gICAgaWYgKHRoaXMuc3Rvcmllc18ubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7ZGVsdGFYfSA9IGdlc3R1cmU7XG5cbiAgICBpZiAoZ2VzdHVyZS5sYXN0ID09PSB0cnVlKSB7XG4gICAgICBjb25zdCBkZWx0YSA9IE1hdGguYWJzKGRlbHRhWCk7XG5cbiAgICAgIGlmICh0aGlzLnN3aXBpbmdTdGF0ZV8gPT09IFN3aXBpbmdTdGF0ZS5TV0lQSU5HX1RPX0xFRlQpIHtcbiAgICAgICAgZGVsdGEgPiBUT0dHTEVfVEhSRVNIT0xEX1BYICYmXG4gICAgICAgICh0aGlzLmdldFNlY29uZGFyeVN0b3J5XygpIHx8IHRoaXMuaXNDaXJjdWxhcldyYXBwaW5nRW5hYmxlZF8pXG4gICAgICAgICAgPyB0aGlzLm5leHRfKClcbiAgICAgICAgICA6IHRoaXMucmVzZXRTdG9yeVN0eWxlc18oKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc3dpcGluZ1N0YXRlXyA9PT0gU3dpcGluZ1N0YXRlLlNXSVBJTkdfVE9fUklHSFQpIHtcbiAgICAgICAgZGVsdGEgPiBUT0dHTEVfVEhSRVNIT0xEX1BYICYmXG4gICAgICAgICh0aGlzLmdldFNlY29uZGFyeVN0b3J5XygpIHx8IHRoaXMuaXNDaXJjdWxhcldyYXBwaW5nRW5hYmxlZF8pXG4gICAgICAgICAgPyB0aGlzLnByZXZpb3VzXygpXG4gICAgICAgICAgOiB0aGlzLnJlc2V0U3RvcnlTdHlsZXNfKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmRyYWdfKGRlbHRhWCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHN0eWxlcyBmb3IgdGhlIGN1cnJlbnRseSBzd2lwZWQgc3RvcnkuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZXNldFN0b3J5U3R5bGVzXygpIHtcbiAgICBjb25zdCBjdXJyZW50SWZyYW1lID0gdGhpcy5zdG9yaWVzX1t0aGlzLmN1cnJlbnRJZHhfXS5pZnJhbWU7XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgcmVzZXRTdHlsZXMoZGV2QXNzZXJ0RWxlbWVudChjdXJyZW50SWZyYW1lKSwgWyd0cmFuc2Zvcm0nLCAndHJhbnNpdGlvbiddKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHNlY29uZGFyeVN0b3J5ID0gdGhpcy5nZXRTZWNvbmRhcnlTdG9yeV8oKTtcbiAgICBpZiAoc2Vjb25kYXJ5U3RvcnkpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIHJlc2V0U3R5bGVzKGRldkFzc2VydEVsZW1lbnQoc2Vjb25kYXJ5U3RvcnkuaWZyYW1lKSwgW1xuICAgICAgICAgICd0cmFuc2Zvcm0nLFxuICAgICAgICAgICd0cmFuc2l0aW9uJyxcbiAgICAgICAgXSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhY2NvbXBhbnlpbmcgc3RvcnkgZm9yIHRoZSBjdXJyZW50bHkgc3dpcGVkIHN0b3J5IGlmIGFueS5cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7P1N0b3J5RGVmfVxuICAgKi9cbiAgZ2V0U2Vjb25kYXJ5U3RvcnlfKCkge1xuICAgIGNvbnN0IG5leHRTdG9yeUlkeCA9XG4gICAgICB0aGlzLnN3aXBpbmdTdGF0ZV8gPT09IFN3aXBpbmdTdGF0ZS5TV0lQSU5HX1RPX0xFRlRcbiAgICAgICAgPyB0aGlzLmN1cnJlbnRJZHhfICsgMVxuICAgICAgICA6IHRoaXMuY3VycmVudElkeF8gLSAxO1xuXG4gICAgaWYgKHRoaXMuaXNJbmRleE91dG9mQm91bmRzXyhuZXh0U3RvcnlJZHgpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdG9yaWVzX1tuZXh0U3RvcnlJZHhdO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBpbmRleCBpcyBvdXQgb2YgYm91bmRzLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzSW5kZXhPdXRvZkJvdW5kc18oaW5kZXgpIHtcbiAgICByZXR1cm4gaW5kZXggPj0gdGhpcy5zdG9yaWVzXy5sZW5ndGggfHwgaW5kZXggPCAwO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGluaXRpYWxpemVBdXRvcGxheV8oKSB7XG4gICAgaWYgKCF0aGlzLnBsYXllckNvbmZpZ18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7YmVoYXZpb3J9ID0gdGhpcy5wbGF5ZXJDb25maWdfO1xuXG4gICAgaWYgKGJlaGF2aW9yICYmIHR5cGVvZiBiZWhhdmlvci5hdXRvcGxheSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICB0aGlzLnBsYXlpbmdfID0gYmVoYXZpb3IuYXV0b3BsYXk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGluaXRpYWxpemVBdHRyaWJ1dGlvbl8oKSB7XG4gICAgaWYgKCF0aGlzLnBsYXllckNvbmZpZ18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7ZGlzcGxheX0gPSB0aGlzLnBsYXllckNvbmZpZ187XG5cbiAgICBpZiAoZGlzcGxheSAmJiBkaXNwbGF5LmF0dHJpYnV0aW9uID09PSAnYXV0bycpIHtcbiAgICAgIHRoaXMuYXR0cmlidXRpb25fID0gJ2F1dG8nO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBpbml0aWFsaXplUGFnZVNjcm9sbF8oKSB7XG4gICAgaWYgKCF0aGlzLnBsYXllckNvbmZpZ18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7YmVoYXZpb3J9ID0gdGhpcy5wbGF5ZXJDb25maWdfO1xuXG4gICAgaWYgKGJlaGF2aW9yICYmIGJlaGF2aW9yLnBhZ2VTY3JvbGwgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLnBhZ2VTY3JvbGxlcl8gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaW5pdGlhbGl6ZUNpcmN1bGFyV3JhcHBpbmdfKCkge1xuICAgIGlmICh0aGlzLmlzQ2lyY3VsYXJXcmFwcGluZ0VuYWJsZWRfICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5pc0NpcmN1bGFyV3JhcHBpbmdFbmFibGVkXztcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucGxheWVyQ29uZmlnXykge1xuICAgICAgdGhpcy5pc0NpcmN1bGFyV3JhcHBpbmdFbmFibGVkXyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHtiZWhhdmlvcn0gPSB0aGlzLnBsYXllckNvbmZpZ187XG5cbiAgICBjb25zdCBoYXNDaXJjdWxhcldyYXBwaW5nRW5hYmxlZCA9IChiZWhhdmlvcikgPT5cbiAgICAgIGJlaGF2aW9yLm9uID09PSAnZW5kJyAmJiBiZWhhdmlvci5hY3Rpb24gPT09ICdjaXJjdWxhci13cmFwcGluZyc7XG5cbiAgICB0aGlzLmlzQ2lyY3VsYXJXcmFwcGluZ0VuYWJsZWRfID1cbiAgICAgIHRoaXMudmFsaWRhdGVCZWhhdmlvckRlZl8oYmVoYXZpb3IpICYmXG4gICAgICBoYXNDaXJjdWxhcldyYXBwaW5nRW5hYmxlZChiZWhhdmlvcik7XG5cbiAgICByZXR1cm4gdGhpcy5pc0NpcmN1bGFyV3JhcHBpbmdFbmFibGVkXztcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmFncyBzdG9yaWVzIGZvbGxvd2luZyB0aGUgc3dpcGluZyBnZXN0dXJlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVsdGFYXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkcmFnXyhkZWx0YVgpIHtcbiAgICBsZXQgc2Vjb25kYXJ5VHJhbnNsYXRlO1xuXG4gICAgaWYgKGRlbHRhWCA8IDApIHtcbiAgICAgIHRoaXMuc3dpcGluZ1N0YXRlXyA9IFN3aXBpbmdTdGF0ZS5TV0lQSU5HX1RPX0xFRlQ7XG4gICAgICBzZWNvbmRhcnlUcmFuc2xhdGUgPSBgdHJhbnNsYXRlM2QoY2FsYygxMDAlICsgJHtkZWx0YVh9cHgpLCAwLCAwKWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3dpcGluZ1N0YXRlXyA9IFN3aXBpbmdTdGF0ZS5TV0lQSU5HX1RPX1JJR0hUO1xuICAgICAgc2Vjb25kYXJ5VHJhbnNsYXRlID0gYHRyYW5zbGF0ZTNkKGNhbGMoJHtkZWx0YVh9cHggLSAxMDAlKSwgMCwgMClgO1xuICAgIH1cblxuICAgIGNvbnN0IHN0b3J5ID0gdGhpcy5zdG9yaWVzX1t0aGlzLmN1cnJlbnRJZHhfXTtcbiAgICBjb25zdCB7aWZyYW1lfSA9IHN0b3J5O1xuICAgIGNvbnN0IHRyYW5zbGF0ZSA9IGB0cmFuc2xhdGUzZCgke2RlbHRhWH1weCwgMCwgMClgO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIHNldFN0eWxlcyhkZXZBc3NlcnRFbGVtZW50KGlmcmFtZSksIHtcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUsXG4gICAgICAgIHRyYW5zaXRpb246ICdub25lJyxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgc2Vjb25kYXJ5U3RvcnkgPSB0aGlzLmdldFNlY29uZGFyeVN0b3J5XygpO1xuICAgIGlmICghc2Vjb25kYXJ5U3RvcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgc2V0U3R5bGVzKGRldkFzc2VydEVsZW1lbnQoc2Vjb25kYXJ5U3RvcnkuaWZyYW1lKSwge1xuICAgICAgICB0cmFuc2Zvcm06IHNlY29uZGFyeVRyYW5zbGF0ZSxcbiAgICAgICAgdHJhbnNpdGlvbjogJ25vbmUnLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIHRvIHJldHJpZXZlIHRoZSB0b3VjaCBjb29yZGluYXRlcyBmcm9tIGEgVG91Y2hFdmVudC5cbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqIEByZXR1cm4gez97eDogbnVtYmVyLCB5OiBudW1iZXJ9fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0Q2xpZW50VG91Y2hDb29yZGluYXRlc18oZXZlbnQpIHtcbiAgICBjb25zdCB7dG91Y2hlc30gPSBldmVudDtcbiAgICBpZiAoIXRvdWNoZXMgfHwgdG91Y2hlcy5sZW5ndGggPCAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB7Y2xpZW50WCwgY2xpZW50WSwgc2NyZWVuWCwgc2NyZWVuWX0gPSB0b3VjaGVzWzBdO1xuICAgIHJldHVybiB7c2NyZWVuWCwgc2NyZWVuWSwgY2xpZW50WCwgY2xpZW50WX07XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/amp-story-player/amp-story-player-impl.js