import { resolvedPromise as _resolvedPromise7 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise6 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise5 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise4 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise3 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";var _DEPRECATED_BUTTON_CL, _DEPRECATED_EVENT_NAM;function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} /**
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
import {
addParamsToUrl,
getFragment,
isProxyOrigin,
parseUrlWithA,
removeFragment,
removeSearch,
serializeQueryString } from "../url";


/** @enum {string} */
var LoadStateClass = {
  LOADING: 'i-amphtml-story-player-loading',
  LOADED: 'i-amphtml-story-player-loaded',
  ERROR: 'i-amphtml-story-player-error' };


/** @enum {number} */
var StoryPosition = {
  PREVIOUS: -1,
  CURRENT: 0,
  NEXT: 1 };


/** @const @type {!Array<string>} */
var SUPPORTED_CACHES = ['cdn.ampproject.org', 'www.bing-amp.com'];

/** @const @type {!Array<string>} */
var SANDBOX_MIN_LIST = ['allow-top-navigation'];

/** @enum {number} */
var SwipingState = {
  NOT_SWIPING: 0,
  SWIPING_TO_LEFT: 1,
  SWIPING_TO_RIGHT: 2 };


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
  CLOSE: 'close-button' };


/** @enum {string} */
var DEPRECATED_BUTTON_CLASSES = (_DEPRECATED_BUTTON_CL = {
  BASE: 'amp-story-player-exit-control-button',
  HIDDEN: 'amp-story-player-hide-button' }, _defineProperty(_DEPRECATED_BUTTON_CL,
DEPRECATED_BUTTON_TYPES.BACK, 'amp-story-player-back-button'), _defineProperty(_DEPRECATED_BUTTON_CL,
DEPRECATED_BUTTON_TYPES.CLOSE, 'amp-story-player-close-button'), _DEPRECATED_BUTTON_CL);


/** @enum {string} */
var DEPRECATED_EVENT_NAMES = (_DEPRECATED_EVENT_NAM = {}, _defineProperty(_DEPRECATED_EVENT_NAM,
DEPRECATED_BUTTON_TYPES.BACK, 'amp-story-player-back'), _defineProperty(_DEPRECATED_EVENT_NAM,
DEPRECATED_BUTTON_TYPES.CLOSE, 'amp-story-player-close'), _DEPRECATED_EVENT_NAM);


/** @enum {string} */
var STORY_STATE_TYPE = {
  PAGE_ATTACHMENT_STATE: 'page-attachment' };


/** @enum {string} */
var STORY_MESSAGE_STATE_TYPE = {
  PAGE_ATTACHMENT_STATE: 'PAGE_ATTACHMENT_STATE',
  UI_STATE: 'UI_STATE',
  MUTED_STATE: 'MUTED_STATE',
  CURRENT_PAGE_ID: 'CURRENT_PAGE_ID',
  STORY_PROGRESS: 'STORY_PROGRESS' };


/** @const {string} */
export var AMP_STORY_PLAYER_EVENT = 'AMP_STORY_PLAYER_EVENT';

/** @const {string} */
var CLASS_NO_NAVIGATION_TRANSITION =
'i-amphtml-story-player-no-navigation-transition';

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
  DEV: 'amp-story-player-dev' };


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
  function AmpStoryPlayer(win, element) {_classCallCheck(this, AmpStoryPlayer);
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
      isSwipeX: null };


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
    this.isDesktopPanelExperimentOn_ =
    this.win_.DESKTOP_PANEL_STORY_PLAYER_EXP_ON;

    return this.element_;
  }

  /**
   * Attaches callbacks to the DOM element for them to be used by publishers.
   * @private
   */_createClass(AmpStoryPlayer, [{ key: "attachCallbacksToElement_", value:
    function attachCallbacksToElement_() {
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
     */ }, { key: "load", value:
    function load() {
      if (!this.element_.isConnected) {
        throw new Error("[".concat(
        TAG, "] element must be connected to the DOM before calling load()."));

      }
      if (!!this.element_.isBuilt_) {
        throw new Error("[".concat(TAG, "] calling load() on an already loaded element."));
      }
      this.buildPlayer();
      this.layoutPlayer();
    }

    /**
     * Initializes story with properties used in this class and adds it to the
     * stories array.
     * @param {!StoryDef} story
     * @private
     */ }, { key: "initializeAndAddStory_", value:
    function initializeAndAddStory_(story) {
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
     */ }, { key: "add", value:
    function add(newStories) {
      if (newStories.length <= 0) {
        return;
      }

      var isStoryDef = function isStoryDef(story) {return story && story.href;};
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
     */ }, { key: "play", value:
    function play() {
      if (!this.element_.isLaidOut_) {
        this.layoutPlayer();
      }
      this.togglePaused_(false);
    }

    /**
     * Makes the current story pause its content/auto-advance
     * @public
     */ }, { key: "pause", value:
    function pause() {
      this.togglePaused_(true);
    }

    /**
     * Makes the current story play or pause its content/auto-advance
     * @param {boolean} paused If true, the story will be paused, and it will be played otherwise
     * @private
     */ }, { key: "togglePaused_", value:
    function togglePaused_(paused) {
      this.playing_ = !paused;
      var currentStory = this.stories_[this.currentIdx_];

      this.updateVisibilityState_(
      currentStory,
      paused ? VisibilityState.PAUSED : VisibilityState.VISIBLE);

    }

    /**
     *
     * @public
     * @return {!Element}
     */ }, { key: "getElement", value:
    function getElement() {
      return this.element_;
    }

    /**
     * @return {!Array<!StoryDef>}
     * @public
     */ }, { key: "getStories", value:
    function getStories() {
      return this.stories_;
    }

    /** @public */ }, { key: "buildPlayer", value:
    function buildPlayer() {
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
     */ }, { key: "initializeAnchorElStories_", value:
    function initializeAnchorElStories_() {var _this = this;
      var anchorEls = toArray(this.element_.querySelectorAll('a'));
      anchorEls.forEach(function (element) {
        var posterImgEl = element.querySelector(
        'img[data-amp-story-player-poster-img]');

        var posterImgSrc = posterImgEl && posterImgEl.getAttribute('src');

        var story = /** @type {!StoryDef} */({
          href: element.href,
          title: (element.textContent && element.textContent.trim()) || null,
          posterImage:
          element.getAttribute('data-poster-portrait-src') || posterImgSrc });


        _this.initializeAndAddStory_(story);
      });
    }

    /** @private */ }, { key: "signalReady_", value:
    function signalReady_() {
      this.element_.dispatchEvent(
      createCustomEvent(this.win_, 'ready', dict({})));

      this.element_.isReady = true;
    }

    /** @private */ }, { key: "buildStories_", value:
    function buildStories_() {var _this2 = this;
      this.stories_.forEach(function (story) {
        _this2.buildIframeFor_(story);
      });
    }

    /** @private */ }, { key: "initializeShadowRoot_", value:
    function initializeShadowRoot_() {
      this.rootEl_ = this.doc_.createElement('div');
      this.rootEl_.classList.add('i-amphtml-story-player-main-container');

      var shadowContainer = this.doc_.createElement('div');

      // For AMP version.
      shadowContainer.classList.add(
      'i-amphtml-fill-content',
      'i-amphtml-story-player-shadow-root-intermediary');


      this.element_.appendChild(shadowContainer);

      var containerToUse =
      false || !this.element_.attachShadow ?
      shadowContainer :
      shadowContainer.attachShadow({ mode: 'open' });

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
     */ }, { key: "initializeButton_", value:
    function initializeButton_() {var _this3 = this;
      var option = this.element_.getAttribute('exit-control');
      if (!Object.values(DEPRECATED_BUTTON_TYPES).includes(option)) {
        return;
      }

      var button = this.doc_.createElement('button');
      this.rootEl_.appendChild(button);

      button.classList.add(DEPRECATED_BUTTON_CLASSES[option]);
      button.classList.add(DEPRECATED_BUTTON_CLASSES.BASE);

      button.addEventListener('click', function () {
        _this3.element_.dispatchEvent(
        createCustomEvent(_this3.win_, DEPRECATED_EVENT_NAMES[option], dict({})));

      });
    }

    /**
     * Gets publisher configuration for the player
     * @private
     * @return {?ConfigDef}
     */ }, { key: "readPlayerConfig_", value:
    function readPlayerConfig_() {
      if (this.playerConfig_) {
        return this.playerConfig_;
      }

      var ampCache = this.element_.getAttribute('amp-cache');
      if (ampCache && !SUPPORTED_CACHES.includes(ampCache)) {
        console /*OK*/.
        error("[".concat(
        TAG, "]"), "Unsupported cache specified, use one of following: ".concat(
        SUPPORTED_CACHES));

      }

      var scriptTag = this.element_.querySelector('script');
      if (!scriptTag) {
        return null;
      }

      if (!isJsonScriptTag(scriptTag)) {
        throw new Error('<script> child must have type="application/json"');
      }

      try {
        this.playerConfig_ = /** @type {!ConfigDef} */(
        parseJson(scriptTag.textContent));

      } catch (reason) {
        console /*OK*/.
        error("[".concat(TAG, "] "), reason);
      }

      return this.playerConfig_;
    }

    /**
     * @param {!StoryDef} story
     * @private
     */ }, { key: "buildIframeFor_", value:
    function buildIframeFor_(story) {
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
     */ }, { key: "addSandboxFlags_", value:
    function addSandboxFlags_(iframe) {
      if (
      !iframe.sandbox ||
      !iframe.sandbox.supports ||
      iframe.sandbox.length <= 0)
      {
        return;
      }

      for (var i = 0; i < SANDBOX_MIN_LIST.length; i++) {
        var flag = SANDBOX_MIN_LIST[i];

        if (!iframe.sandbox.supports(flag)) {
          throw new Error("Iframe doesn't support: ".concat(flag));
        }

        iframe.sandbox.add(flag);
      }
    }

    /**
     * Sets up messaging for a story inside an iframe.
     * @param {!StoryDef} story
     * @private
     */ }, { key: "setUpMessagingForStory_", value:
    function setUpMessagingForStory_(story) {var _this4 = this;
      var iframe = story.iframe;

      story.messagingPromise = new Promise(function (resolve) {
        _this4.initializeHandshake_(story, iframe).then(
        function (messaging) {
          messaging.setDefaultHandler(function () {return _resolvedPromise();});
          messaging.registerHandler('touchstart', function (event, data) {
            _this4.onTouchStart_( /** @type {!Event} */(data));
          });

          messaging.registerHandler('touchmove', function (event, data) {
            _this4.onTouchMove_( /** @type {!Event} */(data));
          });

          messaging.registerHandler('touchend', function (event, data) {
            _this4.onTouchEnd_( /** @type {!Event} */(data));
          });

          messaging.registerHandler('selectDocument', function (event, data) {
            _this4.onSelectDocument_( /** @type {!Object} */(data));
          });

          messaging.sendRequest(
          'onDocumentState',
          dict({ 'state': STORY_MESSAGE_STATE_TYPE.PAGE_ATTACHMENT_STATE }),
          false);


          messaging.sendRequest(
          'onDocumentState',
          dict({ 'state': STORY_MESSAGE_STATE_TYPE.CURRENT_PAGE_ID }),
          false);


          messaging.sendRequest(
          'onDocumentState',
          dict({ 'state': STORY_MESSAGE_STATE_TYPE.MUTED_STATE }));


          messaging.sendRequest(
          'onDocumentState',
          dict({ 'state': STORY_MESSAGE_STATE_TYPE.UI_STATE }));


          messaging.registerHandler('documentStateUpdate', function (event, data) {
            _this4.onDocumentStateUpdate_(
            /** @type {!DocumentStateTypeDef} */(data),
            messaging);

          });

          if (_this4.playerConfig_ && _this4.playerConfig_.controls) {
            _this4.updateControlsStateForAllStories_(story.idx);

            messaging.sendRequest(
            'customDocumentUI',
            dict({ 'controls': _this4.playerConfig_.controls }),
            false);

          }

          resolve(messaging);
        },
        function (err) {
          console /*OK*/.
          error("[".concat(TAG, "]"), err);
        });

      });
    }

    /**
     * Updates the controls config for a given story.
     * @param {number} storyIdx
     * @private
     */ }, { key: "updateControlsStateForAllStories_", value:
    function updateControlsStateForAllStories_(storyIdx) {
      // Disables skip-to-next button when story is the last one in the player.
      if (storyIdx === this.stories_.length - 1) {
        var skipButtonIdx = findIndex(
        this.playerConfig_.controls,
        function (control) {return (
            control.name === 'skip-next' || control.name === 'skip-to-next');});


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
     */ }, { key: "initializeHandshake_", value:
    function initializeHandshake_(story, iframeEl) {var _this5 = this;
      return this.maybeGetCacheUrl_(story.href).then(function (url) {return (
          Messaging.waitForHandshakeFromDocument(
          _this5.win_,
          iframeEl.contentWindow,
          _this5.getEncodedLocation_(url).origin,
          /*opt_token*/null,
          urls.cdnProxyRegex));});


    }

    /**
     * @param {!Element} iframeEl
     * @private
     */ }, { key: "initializeLoadingListeners_", value:
    function initializeLoadingListeners_(iframeEl) {var _this6 = this;
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
     */ }, { key: "layoutPlayer", value:
    function layoutPlayer() {var _this7 = this;
      if (!!this.element_.isLaidOut_) {
        return;
      }

      new AmpStoryPlayerViewportObserver(this.win_, this.element_, function () {return (
          _this7.visibleDeferred_.resolve());});

      if (this.isDesktopPanelExperimentOn_) {
        if (this.win_.ResizeObserver) {
          new this.win_.ResizeObserver(function (e) {
            var _e$0$contentRect = e[0].contentRect,height = _e$0$contentRect.height,width = _e$0$contentRect.width;
            _this7.onPlayerResize_(height, width);
          }).observe(this.element_);
        } else {
          // Set size once as fallback for browsers not supporting ResizeObserver.
          var _this$element_$getBou = this.element_. /*OK*/getBoundingClientRect(),height = _this$element_$getBou.height,width = _this$element_$getBou.width;
          this.onPlayerResize_(height, width);
        }
      }
      this.render_();

      this.element_.isLaidOut_ = true;
    }

    /**
     * Builds desktop "previous" and "next" story UI.
     * @private
     */ }, { key: "initializeDesktopStoryControlUI_", value:
    function initializeDesktopStoryControlUI_() {var _this8 = this;
      this.prevButton_ = this.doc_.createElement('button');
      this.prevButton_.classList.add('i-amphtml-story-player-desktop-panel-prev');
      this.prevButton_.addEventListener('click', function () {return _this8.previous_();});
      this.prevButton_.setAttribute('aria-label', 'previous story');
      this.rootEl_.appendChild(this.prevButton_);

      this.nextButton_ = this.doc_.createElement('button');
      this.nextButton_.classList.add('i-amphtml-story-player-desktop-panel-next');
      this.nextButton_.addEventListener('click', function () {return _this8.next_();});
      this.nextButton_.setAttribute('aria-label', 'next story');
      this.rootEl_.appendChild(this.nextButton_);

      this.checkButtonsDisabled_();
    }

    /**
     * Toggles disabled attribute on desktop "previous" and "next" buttons.
     * @private
     */ }, { key: "checkButtonsDisabled_", value:
    function checkButtonsDisabled_() {
      this.prevButton_.toggleAttribute(
      'disabled',
      this.isIndexOutofBounds_(this.currentIdx_ - 1) &&
      !this.isCircularWrappingEnabled_);

      this.nextButton_.toggleAttribute(
      'disabled',
      this.isIndexOutofBounds_(this.currentIdx_ + 1) &&
      !this.isCircularWrappingEnabled_);

    }

    /**
     * @param {number} height
     * @param {number} width
     * @private
     */ }, { key: "onPlayerResize_", value:
    function onPlayerResize_(height, width) {
      var isDesktopOnePanel =
      width / height > DESKTOP_ONE_PANEL_ASPECT_RATIO_THRESHOLD;

      this.rootEl_.classList.toggle(
      'i-amphtml-story-player-desktop-panel',
      isDesktopOnePanel);


      if (isDesktopOnePanel) {
        setStyles(this.rootEl_, {
          '--i-amphtml-story-player-height': "".concat(height, "px") });


        this.rootEl_.classList.toggle(
        'i-amphtml-story-player-desktop-panel-medium',
        height < 756);


        this.rootEl_.classList.toggle(
        'i-amphtml-story-player-desktop-panel-small',
        height < 538);

      }
    }

    /**
     * Fetches more stories from the publisher's endpoint.
     * @return {!Promise}
     * @private
     */ }, { key: "fetchStories_", value:
    function fetchStories_() {
      var endpoint = this.playerConfig_.behavior.endpoint;
      if (!endpoint) {
        this.isFetchingStoriesEnabled_ = false;
        return _resolvedPromise2();
      }

      var init = {
        method: 'GET',
        headers: {
          Accept: 'application/json' } };



      endpoint = endpoint.replace(/\${offset}/, this.stories_.length.toString());

      return fetch(endpoint, init).
      then(function (response) {return response.json();}).
      catch(function (reason) {
        console /*OK*/.
        error("[".concat(TAG, "]"), reason);
      });
    }

    /**
     * Resolves currentStoryLoadDeferred_ when given story's content is finished
     * loading.
     * @param {!StoryDef} story
     * @private
     */ }, { key: "initStoryContentLoadedPromise_", value:
    function initStoryContentLoadedPromise_(story) {var _this9 = this;
      this.currentStoryLoadDeferred_ = new Deferred();

      story.messagingPromise.then(function (messaging) {return (
          messaging.registerHandler('storyContentLoaded', function () {
            // Stories that already loaded won't dispatch a `storyContentLoaded`
            // event anymore, which is why we need this sync property.
            story.storyContentLoaded = true;
            _this9.currentStoryLoadDeferred_.resolve();
          }));});

    }

    /**
     * Shows the story provided by the URL in the player and go to the page if provided.
     * @param {?string} storyUrl
     * @param {string=} pageId
     * @param {{animate: boolean?}} options
     * @return {!Promise}
     */ }, { key: "show", value:
    function show(storyUrl) {var _this10 = this;var pageId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
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
        return renderPromise.then(function () {return _this10.goToPageId_(pageId);});
      }

      return renderPromise;
    }

    /** Sends a message muting the current story. */ }, { key: "mute", value:
    function mute() {
      var story = this.stories_[this.currentIdx_];
      this.updateMutedState_(story, true);
    }

    /** Sends a message unmuting the current story. */ }, { key: "unmute", value:
    function unmute() {
      var story = this.stories_[this.currentIdx_];
      this.updateMutedState_(story, false);
    }

    /**
     * Sends a message asking for the current story's state and dispatches the appropriate event.
     * @param {string} storyStateType
     * @public
     */ }, { key: "getStoryState", value:
    function getStoryState(storyStateType) {
      switch (storyStateType) {
        case STORY_STATE_TYPE.PAGE_ATTACHMENT_STATE:
          this.getPageAttachmentState_();
          break;
        default:
          break;}

    }

    /**
     * Indicates the player changed story.
     * @param {!Object} data
     * @private
     */ }, { key: "signalNavigation_", value:
    function signalNavigation_(data) {
      var event = createCustomEvent(
      this.win_,
      'navigation',
      /** @type {!JsonObject} */(data));

      this.element_.dispatchEvent(event);
    }

    /**
     * Triggers when swithing from one story to another.
     * @private
     */ }, { key: "onNavigation_", value:
    function onNavigation_() {var _this11 = this;
      var index = this.currentIdx_;
      var remaining = this.stories_.length - this.currentIdx_ - 1;
      var navigation = {
        'index': index,
        'remaining': remaining };


      if (this.isDesktopPanelExperimentOn_) {
        this.checkButtonsDisabled_();
        this.getUiState_().then(function (uiTypeNumber) {return (
            _this11.onUiStateUpdate_(uiTypeNumber));});

      }
      this.signalNavigation_(navigation);
      this.maybeFetchMoreStories_(remaining);
    }

    /**
     * Gets UI state from active story.
     * @private
     * @return {Promise}
     */ }, { key: "getUiState_", value:
    function getUiState_() {
      var story = this.stories_[this.currentIdx_];

      return new Promise(function (resolve) {
        story.messagingPromise.then(function (messaging) {
          messaging.
          sendRequest(
          'getDocumentState',
          { state: STORY_MESSAGE_STATE_TYPE.UI_STATE },
          true).

          then(function (event) {return resolve(event.value);});
        });
      });
    }

    /**
     * Shows or hides one panel UI on state update.
     * @param {number} uiTypeNumber
     * @private
     */ }, { key: "onUiStateUpdate_", value:
    function onUiStateUpdate_(uiTypeNumber) {
      var isFullbleed =
      uiTypeNumber === 2 /** DESKTOP_FULLBLEED */ ||
      uiTypeNumber === 0; /** MOBILE */
      this.rootEl_.classList.toggle(
      'i-amphtml-story-player-full-bleed-story',
      isFullbleed);

    }

    /**
     * Fetches more stories if appropiate.
     * @param {number} remaining Number of stories remaining in the player.
     * @private
     */ }, { key: "maybeFetchMoreStories_", value:
    function maybeFetchMoreStories_(remaining) {var _this12 = this;
      if (
      this.playerConfig_ &&
      this.playerConfig_.behavior &&
      this.shouldFetchMoreStories_() &&
      remaining <= FETCH_STORIES_THRESHOLD)
      {
        this.fetchStories_().
        then(function (stories) {
          if (!stories) {
            return;
          }
          _this12.add(stories);
        }).
        catch(function (reason) {
          console /*OK*/.
          error("[".concat(TAG, "]"), reason);
        });
      }
    }

    /**
     * @param {!Object} behavior
     * @return {boolean}
     * @private
     */ }, { key: "validateBehaviorDef_", value:
    function validateBehaviorDef_(behavior) {
      return behavior && behavior.on && behavior.action;
    }

    /**
     * Checks if fetching more stories is enabled and validates the configuration.
     * @return {boolean}
     * @private
     */ }, { key: "shouldFetchMoreStories_", value:
    function shouldFetchMoreStories_() {
      if (this.isFetchingStoriesEnabled_ !== null) {
        return this.isFetchingStoriesEnabled_;
      }

      var behavior = this.playerConfig_.behavior;

      var hasEndFetchBehavior = function hasEndFetchBehavior(behavior) {return (
          behavior.on === 'end' && behavior.action === 'fetch' && behavior.endpoint);};

      this.isFetchingStoriesEnabled_ =
      this.validateBehaviorDef_(behavior) && hasEndFetchBehavior(behavior);

      return this.isFetchingStoriesEnabled_;
    }

    /**
     * Navigates to the next story in the player.
     * @private
     */ }, { key: "next_", value:
    function next_() {
      if (
      !this.isCircularWrappingEnabled_ &&
      this.isIndexOutofBounds_(this.currentIdx_ + 1))
      {
        return;
      }

      if (
      this.isCircularWrappingEnabled_ &&
      this.isIndexOutofBounds_(this.currentIdx_ + 1))
      {
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
     */ }, { key: "previous_", value:
    function previous_() {
      if (
      !this.isCircularWrappingEnabled_ &&
      this.isIndexOutofBounds_(this.currentIdx_ - 1))
      {
        return;
      }

      if (
      this.isCircularWrappingEnabled_ &&
      this.isIndexOutofBounds_(this.currentIdx_ - 1))
      {
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
     */ }, { key: "go", value:
    function go(storyDelta) {var _this13 = this;var pageDelta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      if (storyDelta === 0 && pageDelta === 0) {
        return;
      }

      if (
      !this.isCircularWrappingEnabled_ &&
      this.isIndexOutofBounds_(this.currentIdx_ + storyDelta))
      {
        throw new Error('Out of Story range.');
      }

      var newStoryIdx = this.currentIdx_ + storyDelta;
      var newStory =
      storyDelta > 0 ?
      this.stories_[newStoryIdx % this.stories_.length] :
      this.stories_[
      ((newStoryIdx % this.stories_.length) + this.stories_.length) %
      this.stories_.length];


      var showPromise = _resolvedPromise4();
      if (this.currentIdx_ !== newStory.idx) {
        showPromise = this.show(newStory.href, /* pageId */null, options);
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
     */ }, { key: "updatePosition_", value:
    function updatePosition_(story) {
      var position =
      story.distance === 0 ?
      StoryPosition.CURRENT :
      story.idx > this.currentIdx_ ?
      StoryPosition.NEXT :
      StoryPosition.PREVIOUS;

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
     */ }, { key: "currentStoryPromise_", value:
    function currentStoryPromise_(story) {
      if (this.stories_[this.currentIdx_].storyContentLoaded) {
        return _resolvedPromise5();
      }

      if (story.distance !== 0) {
        return this.currentStoryLoadDeferred_.promise;
      }

      if (this.currentStoryLoadDeferred_) {
        // Cancel previous story load promise.
        this.currentStoryLoadDeferred_.reject("[".concat(
        LOG_TYPE.DEV, "] Cancelling previous story load promise."));

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
     */ }, { key: "render_", value:
    function render_() {var _this14 = this;var startingIdx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.currentIdx_;
      var renderPromises = [];var _loop = function _loop(

      i) {
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

        renderPromises.push(
        // 1. Wait for current story to load before evaluating neighbor stories.
        _this14.currentStoryPromise_(story).
        then(function () {return _this14.maybeGetCacheUrl_(story.href);})
        // 2. Set iframe src when appropiate
        .then(function (storyUrl) {
          if (!_this14.sanitizedUrlsAreEquals_(storyUrl, story.iframe.src)) {
            _this14.setSrc_(story, storyUrl);
          }
        })
        // 3. Waits for player to be visible before updating visibility
        // state.
        .then(function () {return _this14.visibleDeferred_.promise;})
        // 4. Update the visibility state of the story.
        .then(function () {
          if (story.distance === 0 && _this14.playing_) {
            _this14.updateVisibilityState_(story, VisibilityState.VISIBLE);
          }

          if (oldDistance === 0 && story.distance === 1) {
            _this14.updateVisibilityState_(story, VisibilityState.INACTIVE);
          }
        })
        // 5. Finally update the story position.
        .then(function () {
          _this14.updatePosition_(story);

          if (story.distance === 0) {
            tryFocus(story.iframe);
          }
        }).
        catch(function (err) {
          if (err.includes(LOG_TYPE.DEV)) {
            return;
          }
          console /*OK*/.
          error("[".concat(TAG, "]"), err);
        }));};for (var i = 0; i < this.stories_.length; i++) {var _ret = _loop(i);if (_ret === "continue") continue;

      }

      return Promise.all(renderPromises);
    }

    /**
     * @param {!StoryDef} story
     * @private
     */ }, { key: "appendToDom_", value:
    function appendToDom_(story) {
      this.rootEl_.appendChild(story.iframe);
      this.setUpMessagingForStory_(story);
      story.connectedDeferred.resolve();
    }

    /**
     * @param {!StoryDef} story
     * @private
     */ }, { key: "removeFromDom_", value:
    function removeFromDom_(story) {
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
     */ }, { key: "setSrc_", value:
    function setSrc_(story, url) {
      var iframe = story.iframe;
      var _this$getEncodedLocat = this.getEncodedLocation_(url, VisibilityState.PRERENDER),href = _this$getEncodedLocat.href;

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
     */ }, { key: "sanitizedUrlsAreEquals_", value:
    function sanitizedUrlsAreEquals_(storyHref, iframeHref) {
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
     */ }, { key: "maybeGetCacheUrl_", value:
    function maybeGetCacheUrl_(url) {
      var ampCache = this.element_.getAttribute('amp-cache');

      if (
      !ampCache ||
      isProxyOrigin(url) ||
      !SUPPORTED_CACHES.includes(ampCache))
      {
        return Promise.resolve(url);
      }

      return ampToolboxCacheUrl.
      createCacheUrl(ampCache, url, 'viewer' /** servingType */).
      then(function (cacheUrl) {
        return cacheUrl;
      });
    }

    /**
     * Gets encoded url for player usage.
     * @param {string} href
     * @param {VisibilityState=} visibilityState
     * @return {!Location}
     * @private
     */ }, { key: "getEncodedLocation_", value:
    function getEncodedLocation_(href) {var visibilityState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : VisibilityState.INACTIVE;
      var playerFragmentParams = {
        'visibilityState': visibilityState,
        'origin': this.win_.origin,
        'showStoryUrlInfo': '0',
        'storyPlayer': 'v0',
        'cap': 'swipe' };


      if (this.attribution_ === 'auto') {
        playerFragmentParams['attribution'] = 'auto';
      }

      var originalFragmentString = getFragment(href);
      var originalFragments = parseQueryString(originalFragmentString);

      var fragmentParams = /** @type {!JsonObject} */_objectSpread(_objectSpread({},
      originalFragments),
      playerFragmentParams);


      var noFragmentUrl = removeFragment(href);
      if (isProxyOrigin(href)) {
        var ampJsQueryParam = dict({
          'amp_js_v': '0.1' });

        noFragmentUrl = addParamsToUrl(noFragmentUrl, ampJsQueryParam);
      }
      var inputUrl = noFragmentUrl + '#' + serializeQueryString(fragmentParams);

      return parseUrlWithA(
      /** @type {!HTMLAnchorElement} */(this.cachedA_),
      inputUrl);

    }

    /**
     * Updates the visibility state of the story inside the iframe.
     * @param {!StoryDef} story
     * @param {!VisibilityState} visibilityState
     * @private
     */ }, { key: "updateVisibilityState_", value:
    function updateVisibilityState_(story, visibilityState) {
      story.messagingPromise.then(function (messaging) {return (
          messaging.sendRequest('visibilitychange', { state: visibilityState }, true));});

    }

    /**
     * Updates the specified iframe's story state with given value.
     * @param {!StoryDef} story
     * @param {string} state
     * @param {boolean} value
     * @private
     */ }, { key: "updateStoryState_", value:
    function updateStoryState_(story, state, value) {
      story.messagingPromise.then(function (messaging) {
        messaging.sendRequest('setDocumentState', { state: state, value: value });
      });
    }

    /**
     * Update the muted state of the story inside the iframe.
     * @param {!StoryDef} story
     * @param {boolean} mutedValue
     * @private
     */ }, { key: "updateMutedState_", value:
    function updateMutedState_(story, mutedValue) {
      this.updateStoryState_(
      story,
      STORY_MESSAGE_STATE_TYPE.MUTED_STATE,
      mutedValue);

    }

    /**
     * Send message to story asking for page attachment state.
     * @private
     */ }, { key: "getPageAttachmentState_", value:
    function getPageAttachmentState_() {var _this15 = this;
      var story = this.stories_[this.currentIdx_];

      story.messagingPromise.then(function (messaging) {
        messaging.
        sendRequest(
        'getDocumentState',
        { state: STORY_MESSAGE_STATE_TYPE.PAGE_ATTACHMENT_STATE },
        true).

        then(function (event) {return _this15.dispatchPageAttachmentEvent_(event.value);});
      });
    }

    /**
     * @param {string} pageId
     * @private
     */ }, { key: "goToPageId_", value:
    function goToPageId_(pageId) {
      var story = this.stories_[this.currentIdx_];

      story.messagingPromise.then(function (messaging) {return (
          messaging.sendRequest('selectPage', { 'id': pageId }));});

    }

    /**
     * Returns the story given a URL.
     * @param {string} storyUrl
     * @return {!StoryDef}
     * @private
     */ }, { key: "getStoryFromUrl_", value:
    function getStoryFromUrl_(storyUrl) {
      // TODO(enriqe): sanitize URLs for matching.
      var storyIdx = storyUrl ?
      findIndex(this.stories_, function (_ref) {var href = _ref.href;return href === storyUrl;}) :
      this.currentIdx_;

      if (!this.stories_[storyIdx]) {
        throw new Error("Story URL not found in the player: ".concat(storyUrl));
      }

      return this.stories_[storyIdx];
    }

    /**
     * Rewinds the given story.
     * @param {string} storyUrl
     */ }, { key: "rewind", value:
    function rewind(storyUrl) {
      var story = this.getStoryFromUrl_(storyUrl);

      this.whenConnected_(story).
      then(function () {return story.messagingPromise;}).
      then(function (messaging) {return messaging.sendRequest('rewind', {});});
    }

    /**
     * Returns a promise that resolves when the story is connected to the DOM.
     * @param {!StoryDef} story
     * @return {!Promise}
     * @private
     */ }, { key: "whenConnected_", value:
    function whenConnected_(story) {
      if (story.iframe.isConnected) {
        return _resolvedPromise7();
      }
      return story.connectedDeferred.promise;
    }

    /**
     * Sends a message to the current story to navigate delta pages.
     * @param {number} delta
     * @private
     */ }, { key: "selectPage_", value:
    function selectPage_(delta) {
      if (delta === 0) {
        return;
      }

      this.sendSelectPageDelta_(delta);
    }

    /**
     * @param {number} delta
     * @private
     */ }, { key: "sendSelectPageDelta_", value:
    function sendSelectPageDelta_(delta) {
      var story = this.stories_[this.currentIdx_];

      story.messagingPromise.then(function (messaging) {return (
          messaging.sendRequest('selectPage', { delta: delta }));});

    }

    /**
     * React to documentStateUpdate events.
     * @param {!DocumentStateTypeDef} data
     * @param {Messaging} messaging
     * @private
     */ }, { key: "onDocumentStateUpdate_", value:
    function onDocumentStateUpdate_(data, messaging) {
      switch (data.state) {
        case STORY_MESSAGE_STATE_TYPE.PAGE_ATTACHMENT_STATE:
          this.onPageAttachmentStateUpdate_( /** @type {boolean} */(data.value));
          break;
        case STORY_MESSAGE_STATE_TYPE.CURRENT_PAGE_ID:
          this.onCurrentPageIdUpdate_(
          /** @type {string} */(data.value),
          messaging);

          break;
        case STORY_MESSAGE_STATE_TYPE.MUTED_STATE:
          this.onMutedStateUpdate_( /** @type {string} */(data.value));
          break;
        case STORY_MESSAGE_STATE_TYPE.UI_STATE:
          if (this.isDesktopPanelExperimentOn_) {
            // Handles UI state updates on window resize.
            this.onUiStateUpdate_( /** @type {number} */(data.value));
          }
          break;
        case AMP_STORY_PLAYER_EVENT:
          this.onPlayerEvent_( /** @type {string} */(data.value));
          break;
        default:
          break;}

    }

    /**
     * Reacts to events coming from the story.
     * @private
     * @param {string} value
     */ }, { key: "onPlayerEvent_", value:
    function onPlayerEvent_(value) {
      switch (value) {
        case 'amp-story-player-skip-next':
        case 'amp-story-player-skip-to-next':
          this.next_();
          break;
        default:
          this.element_.dispatchEvent(
          createCustomEvent(this.win_, value, dict({})));

          break;}

    }

    /**
     * Reacts to mute/unmute events coming from the story.
     * @param {string} muted
     * @private
     */ }, { key: "onMutedStateUpdate_", value:
    function onMutedStateUpdate_(muted) {
      this.element_.dispatchEvent(
      createCustomEvent(this.win_, 'amp-story-muted-state', { muted: muted }));

    }

    /**
     * Reacts to page id update events inside the story.
     * @param {string} pageId
     * @param {Messaging} messaging
     * @private
     */ }, { key: "onCurrentPageIdUpdate_", value:
    function onCurrentPageIdUpdate_(pageId, messaging) {var _this16 = this;
      messaging.
      sendRequest(
      'getDocumentState',
      dict({ 'state': STORY_MESSAGE_STATE_TYPE.STORY_PROGRESS }),
      true).

      then(function (progress) {
        _this16.element_.dispatchEvent(
        createCustomEvent(
        _this16.win_,
        'storyNavigation',
        dict({
          'pageId': pageId,
          'progress': progress.value })));



      });
    }

    /**
     * React to page attachment update events.
     * @param {boolean} pageAttachmentOpen
     * @private
     */ }, { key: "onPageAttachmentStateUpdate_", value:
    function onPageAttachmentStateUpdate_(pageAttachmentOpen) {
      this.updateButtonVisibility_(!pageAttachmentOpen);
      this.dispatchPageAttachmentEvent_(pageAttachmentOpen);
    }

    /**
     * Updates the visbility state of the exit control button.
     * TODO(#30031): delete this once new custom UI API is ready.
     * @param {boolean} isVisible
     * @private
     */ }, { key: "updateButtonVisibility_", value:
    function updateButtonVisibility_(isVisible) {
      var button = this.rootEl_.querySelector(
      'button.amp-story-player-exit-control-button');

      if (!button) {
        return;
      }

      isVisible ?
      button.classList.remove(DEPRECATED_BUTTON_CLASSES.HIDDEN) :
      button.classList.add(DEPRECATED_BUTTON_CLASSES.HIDDEN);
    }

    /**
     * Dispatch a page attachment event.
     * @param {boolean} isPageAttachmentOpen
     * @private
     */ }, { key: "dispatchPageAttachmentEvent_", value:
    function dispatchPageAttachmentEvent_(isPageAttachmentOpen) {
      this.element_.dispatchEvent(
      createCustomEvent(
      this.win_,
      isPageAttachmentOpen ? 'page-attachment-open' : 'page-attachment-close',
      dict({})));


    }

    /**
     * React to selectDocument events.
     * @param {!Object} data
     * @private
     */ }, { key: "onSelectDocument_", value:
    function onSelectDocument_(data) {
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
     */ }, { key: "dispatchEndOfStoriesEvent_", value:
    function dispatchEndOfStoriesEvent_(data) {
      if (this.isCircularWrappingEnabled_ || (!data.next && !data.previous)) {
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
     */ }, { key: "onTouchStart_", value:
    function onTouchStart_(event) {
      var coordinates = this.getClientTouchCoordinates_(event);
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
        'touches': event.touches })));



    }

    /**
     * Reacts to touchmove events.
     * @param {!Event} event
     * @private
     */ }, { key: "onTouchMove_", value:
    function onTouchMove_(event) {
      var coordinates = this.getClientTouchCoordinates_(event);
      if (!coordinates) {
        return;
      }

      this.element_.dispatchEvent(
      createCustomEvent(
      this.win_,
      'amp-story-player-touchmove',
      dict({
        'touches': event.touches,
        'isNavigationalSwipe': this.touchEventState_.isSwipeX })));




      if (this.touchEventState_.isSwipeX === false) {
        this.pageScroller_ &&
        this.pageScroller_.onTouchMove(event.timeStamp, coordinates.clientY);
        return;
      }

      var screenX = coordinates.screenX,screenY = coordinates.screenY;
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
        last: false });

    }

    /**
     * Reacts to touchend events. Resets cached touch event states.
     * @param {!Event} event
     * @private
     */ }, { key: "onTouchEnd_", value:
    function onTouchEnd_(event) {
      this.element_.dispatchEvent(
      createCustomEvent(
      this.win_,
      'amp-story-player-touchend',
      dict({
        'touches': event.touches,
        'isNavigationalSwipe': this.touchEventState_.isSwipeX })));




      if (this.touchEventState_.isSwipeX === true) {
        this.onSwipeX_({
          deltaX: this.touchEventState_.lastX - this.touchEventState_.startX,
          last: true });

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
     */ }, { key: "onSwipeX_", value:
    function onSwipeX_(gesture) {
      if (this.stories_.length <= 1) {
        return;
      }

      var deltaX = gesture.deltaX;

      if (gesture.last === true) {
        var delta = Math.abs(deltaX);

        if (this.swipingState_ === SwipingState.SWIPING_TO_LEFT) {
          delta > TOGGLE_THRESHOLD_PX && (
          this.getSecondaryStory_() || this.isCircularWrappingEnabled_) ?
          this.next_() :
          this.resetStoryStyles_();
        }

        if (this.swipingState_ === SwipingState.SWIPING_TO_RIGHT) {
          delta > TOGGLE_THRESHOLD_PX && (
          this.getSecondaryStory_() || this.isCircularWrappingEnabled_) ?
          this.previous_() :
          this.resetStoryStyles_();
        }

        return;
      }

      this.drag_(deltaX);
    }

    /**
     * Resets styles for the currently swiped story.
     * @private
     */ }, { key: "resetStoryStyles_", value:
    function resetStoryStyles_() {
      var currentIframe = this.stories_[this.currentIdx_].iframe;

      requestAnimationFrame(function () {
        resetStyles(devAssertElement(currentIframe), ['transform', 'transition']);
      });

      var secondaryStory = this.getSecondaryStory_();
      if (secondaryStory) {
        requestAnimationFrame(function () {
          resetStyles(devAssertElement(secondaryStory.iframe), [
          'transform',
          'transition']);

        });
      }
    }

    /**
     * Gets accompanying story for the currently swiped story if any.
     * @private
     * @return {?StoryDef}
     */ }, { key: "getSecondaryStory_", value:
    function getSecondaryStory_() {
      var nextStoryIdx =
      this.swipingState_ === SwipingState.SWIPING_TO_LEFT ?
      this.currentIdx_ + 1 :
      this.currentIdx_ - 1;

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
     */ }, { key: "isIndexOutofBounds_", value:
    function isIndexOutofBounds_(index) {
      return index >= this.stories_.length || index < 0;
    }

    /** @private */ }, { key: "initializeAutoplay_", value:
    function initializeAutoplay_() {
      if (!this.playerConfig_) {
        return;
      }

      var behavior = this.playerConfig_.behavior;

      if (behavior && typeof behavior.autoplay === 'boolean') {
        this.playing_ = behavior.autoplay;
      }
    }

    /** @private */ }, { key: "initializeAttribution_", value:
    function initializeAttribution_() {
      if (!this.playerConfig_) {
        return;
      }

      var display = this.playerConfig_.display;

      if (display && display.attribution === 'auto') {
        this.attribution_ = 'auto';
      }
    }

    /** @private */ }, { key: "initializePageScroll_", value:
    function initializePageScroll_() {
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
     */ }, { key: "initializeCircularWrapping_", value:
    function initializeCircularWrapping_() {
      if (this.isCircularWrappingEnabled_ !== null) {
        return this.isCircularWrappingEnabled_;
      }

      if (!this.playerConfig_) {
        this.isCircularWrappingEnabled_ = false;
        return false;
      }

      var behavior = this.playerConfig_.behavior;

      var hasCircularWrappingEnabled = function hasCircularWrappingEnabled(behavior) {return (
          behavior.on === 'end' && behavior.action === 'circular-wrapping');};

      this.isCircularWrappingEnabled_ =
      this.validateBehaviorDef_(behavior) &&
      hasCircularWrappingEnabled(behavior);

      return this.isCircularWrappingEnabled_;
    }

    /**
     * Drags stories following the swiping gesture.
     * @param {number} deltaX
     * @private
     */ }, { key: "drag_", value:
    function drag_(deltaX) {
      var secondaryTranslate;

      if (deltaX < 0) {
        this.swipingState_ = SwipingState.SWIPING_TO_LEFT;
        secondaryTranslate = "translate3d(calc(100% + ".concat(deltaX, "px), 0, 0)");
      } else {
        this.swipingState_ = SwipingState.SWIPING_TO_RIGHT;
        secondaryTranslate = "translate3d(calc(".concat(deltaX, "px - 100%), 0, 0)");
      }

      var story = this.stories_[this.currentIdx_];
      var iframe = story.iframe;
      var translate = "translate3d(".concat(deltaX, "px, 0, 0)");

      requestAnimationFrame(function () {
        setStyles(devAssertElement(iframe), {
          transform: translate,
          transition: 'none' });

      });

      var secondaryStory = this.getSecondaryStory_();
      if (!secondaryStory) {
        return;
      }

      requestAnimationFrame(function () {
        setStyles(devAssertElement(secondaryStory.iframe), {
          transform: secondaryTranslate,
          transition: 'none' });

      });
    }

    /**
     * Helper to retrieve the touch coordinates from a TouchEvent.
     * @param {!Event} event
     * @return {?{x: number, y: number}}
     * @private
     */ }, { key: "getClientTouchCoordinates_", value:
    function getClientTouchCoordinates_(event) {
      var touches = event.touches;
      if (!touches || touches.length < 1) {
        return null;
      }

      var _touches$ = touches[0],clientX = _touches$.clientX,clientY = _touches$.clientY,screenX = _touches$.screenX,screenY = _touches$.screenY;
      return { screenX: screenX, screenY: screenY, clientX: clientX, clientY: clientY };
    } }]);return AmpStoryPlayer;}();
// /Users/mszylkowski/src/amphtml/src/amp-story-player/amp-story-player-impl.js