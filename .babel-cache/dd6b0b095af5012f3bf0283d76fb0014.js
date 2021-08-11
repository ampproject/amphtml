import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import { ActionTrust } from "../core/constants/action-constants";
import { dispatchCustomEvent, removeElement } from "../core/dom";
import { measureIntersection } from "../core/dom/layout/intersection";
import { createViewportObserver } from "../core/dom/layout/viewport-observer";
import { toggle } from "../core/dom/style";
import { getInternalVideoElementFor, isAutoplaySupported } from "../core/dom/video";
import { clamp } from "../core/math";
import { isFiniteNumber } from "../core/types";
import { once } from "../core/types/function";
import { dict, map } from "../core/types/object";

import { Services } from "./";

import { VideoSessionManager } from "./video-session-manager";
import { renderIcon, renderInteractionOverlay } from "./video/autoplay";
import { installAutoplayStylesForDoc } from "./video/install-autoplay-styles";

import { createCustomEvent, getData, listen, listenOnce } from "../event-helper";
import { dev, devAssert, user, userAssert } from "../log";
import {
EMPTY_METADATA,
parseFavicon,
parseOgImage,
parseSchemaImage,
setMediaSession,
validateMediaMetadata } from "../mediasession-helper";

import { registerServiceBuilderForDoc } from "../service-helpers";
import {
MIN_VISIBILITY_RATIO_FOR_AUTOPLAY,
PlayingStates,
VideoAnalyticsEvents,
VideoAttributes,
VideoEvents,
VideoServiceSignals,
setIsMediaComponent,
userInteractedWith,
videoAnalyticsCustomEventTypeKey } from "../video-interface";


/** @private @const {string} */
var TAG = 'video-manager';

/**
 * @private {number} The minimum number of milliseconds to wait between each
 * video-seconds-played analytics event.
 */
var SECONDS_PLAYED_MIN_DELAY = 1000;

/**
 * VideoManager keeps track of all AMP video players that implement
 * the common Video API {@see ../video-interface.VideoInterface}.
 *
 * It is responsible for providing a unified user experience and analytics for
 * all videos within a document.
 *
 * @implements {../service.Disposable}
 */
export var VideoManager = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function VideoManager(ampdoc) {var _this = this;_classCallCheck(this, VideoManager);
    /** @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc = ampdoc;

    /** @const */
    this.installAutoplayStyles = once(function () {return (
        installAutoplayStylesForDoc(_this.ampdoc));});


    /** @private {?Array<!VideoEntry>} */
    this.entries_ = null;

    /** @private {IntersectionObserver} */
    this.viewportObserver_ = null;

    /**
     * Keeps last found entry as a small optimization for multiple state calls
     * during one task.
     * @private {?VideoEntry}
     */
    this.lastFoundEntry_ = null;

    /** @private @const */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const */
    this.actions_ = Services.actionServiceForDoc(ampdoc.getHeadNode());

    /**
     * @private
     * @const
     * @return {undefined}
     */
    this.boundSecondsPlaying_ = function () {return _this.secondsPlaying_();};

    /** @private @const {function():!AutoFullscreenManager} */
    this.getAutoFullscreenManager_ = once(
    function () {return new AutoFullscreenManager(_this.ampdoc, _this);});


    // TODO(cvializ, #10599): It would be nice to only create the timer
    // if video analytics are present, since the timer is not needed if
    // video analytics are not present.
    this.timer_.delay(this.boundSecondsPlaying_, SECONDS_PLAYED_MIN_DELAY);
  }

  /** @override */_createClass(VideoManager, [{ key: "dispose", value:
    function dispose() {
      this.getAutoFullscreenManager_().dispose();
      this.viewportObserver_.disconnect();
      this.viewportObserver_ = null;

      if (!this.entries_) {
        return;
      }
      for (var i = 0; i < this.entries_.length; i++) {
        var entry = this.entries_[i];
        entry.dispose();
      }
    }

    /**
     * Each second, trigger video-seconds-played for videos that are playing
     * at trigger time.
     * @private
     */ }, { key: "secondsPlaying_", value:
    function secondsPlaying_() {
      for (var i = 0; i < this.entries_.length; i++) {
        var entry = this.entries_[i];
        if (entry.getPlayingState() !== PlayingStates.PAUSED) {
          analyticsEvent(entry, VideoAnalyticsEvents.SECONDS_PLAYED);
          this.timeUpdateActionEvent_(entry);
        }
      }
      this.timer_.delay(this.boundSecondsPlaying_, SECONDS_PLAYED_MIN_DELAY);
    }

    /**
     * Triggers a LOW-TRUST timeupdate event consumable by AMP actions.
     * Frequency of this event is controlled by SECONDS_PLAYED_MIN_DELAY and is
     * every 1 second for now.
     * @param {!VideoEntry} entry
     * @private
     */ }, { key: "timeUpdateActionEvent_", value:
    function timeUpdateActionEvent_(entry) {
      var name = 'timeUpdate';
      var currentTime = entry.video.getCurrentTime();
      var duration = entry.video.getDuration();
      if (
      isFiniteNumber(currentTime) &&
      isFiniteNumber(duration) &&
      duration > 0)
      {
        var perc = currentTime / duration;
        var event = createCustomEvent(
        this.ampdoc.win, "".concat(
        TAG, ".").concat(name),
        dict({ 'time': currentTime, 'percent': perc }));

        this.actions_.trigger(entry.video.element, name, event, ActionTrust.LOW);
      }
    }

    // TODO(#30723): create unregister() for cleanup.
    /** @param {!../video-interface.VideoInterface} video */ }, { key: "register", value:
    function register(video) {var _this2 = this;
      devAssert(video);
      var videoBE = /** @type {!AMP.BaseElement} */(video);

      this.registerCommonActions_(video);

      if (!video.supportsPlatform()) {
        return;
      }

      if (this.getEntryOrNull_(video)) {
        // already registered
        return;
      }

      if (!this.viewportObserver_) {
        var viewportCallback = function viewportCallback(
        /** @type {!Array<!IntersectionObserverEntry>} */records) {return (

            records.forEach(function (_ref) {var isIntersecting = _ref.isIntersecting,target = _ref.target;
              _this2.getEntry_(target).updateVisibility(
              /* isVisible */isIntersecting);

            }));};
        this.viewportObserver_ = createViewportObserver(
        viewportCallback,
        this.ampdoc.win,
        { threshold: MIN_VISIBILITY_RATIO_FOR_AUTOPLAY });

      }
      this.viewportObserver_.observe(videoBE.element);
      listen(videoBE.element, VideoEvents.RELOAD, function () {return entry.videoLoaded();});

      this.entries_ = this.entries_ || [];
      var entry = new VideoEntry(this, video);
      this.entries_.push(entry);

      var element = entry.video.element;
      dispatchCustomEvent(element, VideoEvents.REGISTERED);

      setIsMediaComponent(element);

      // Unlike events, signals are permanent. We can wait for `REGISTERED` at any
      // moment in the element's lifecycle and the promise will resolve
      // appropriately each time.
      var signals = /** @type {!../base-element.BaseElement} */(
      video).
      signals();

      signals.signal(VideoEvents.REGISTERED);

      // Add a class to element to indicate it implements the video interface.
      element.classList.add('i-amphtml-video-interface');
    }

    /**
     * Register common actions such as play, pause, etc... on the video element
     * so they can be called using AMP Actions.
     * For example: <button on="tap:myVideo.play">
     *
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @private
     */ }, { key: "registerCommonActions_", value:
    function registerCommonActions_(video) {
      // Only require ActionTrust.LOW for video actions to defer to platform
      // specific handling (e.g. user gesture requirement for unmuted playback).
      var trust = ActionTrust.LOW;

      registerAction('play', function () {return video.play( /* isAutoplay */false);});
      registerAction('pause', function () {return video.pause();});
      registerAction('mute', function () {return video.mute();});
      registerAction('unmute', function () {return video.unmute();});

      // fullscreen/fullscreenenter are a special case.
      // - fullscreenenter is kept as a standard name for symmetry with internal
      //   internal interfaces
      // - fullscreen is an undocumented alias for backwards compatibility.
      var fullscreenEnter = function fullscreenEnter() {return video.fullscreenEnter();};
      registerAction('fullscreenenter', fullscreenEnter);
      registerAction('fullscreen', fullscreenEnter);

      /**
       * @param {string} action
       * @param {function()} fn
       */
      function registerAction(action, fn) {
        var videoBE = /** @type {!AMP.BaseElement} */(video);
        videoBE.registerAction(
        action,
        function () {
          userInteractedWith(video);
          fn();
        },
        trust);

      }
    }

    /**
     * Returns the entry in the video manager corresponding to the video or
     * element provided, or null if unavailable.
     * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
     * @return {?VideoEntry} entry
     */ }, { key: "getEntryOrNull_", value:
    function getEntryOrNull_(videoOrElement) {
      if (isEntryFor(this.lastFoundEntry_, videoOrElement)) {
        return this.lastFoundEntry_;
      }

      for (var i = 0; this.entries_ && i < this.entries_.length; i++) {
        var entry = this.entries_[i];
        if (isEntryFor(entry, videoOrElement)) {
          this.lastFoundEntry_ = entry;
          return entry;
        }
      }

      return null;
    }

    /**
     * Returns the entry in the video manager corresponding to the video or
     * element provided
     * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
     * @return {VideoEntry} entry
     */ }, { key: "getEntry_", value:
    function getEntry_(videoOrElement) {
      return devAssert(
      this.getEntryOrNull_(videoOrElement));



    }

    /** @param {!VideoEntry} entry */ }, { key: "registerForAutoFullscreen", value:
    function registerForAutoFullscreen(entry) {
      this.getAutoFullscreenManager_().register(entry);
    }

    /**
     * @return {!AutoFullscreenManager}
     * @visibleForTesting
     */ }, { key: "getAutoFullscreenManagerForTesting_", value:
    function getAutoFullscreenManagerForTesting_() {
      return this.getAutoFullscreenManager_();
    }

    /**
     * Gets the current analytics details property for the given video.
     * Fails silently if the video is not registered.
     * @param {string} id
     * @param {string} property
     * @return {!Promise<string>}
     */ }, { key: "getVideoStateProperty", value:
    function getVideoStateProperty(id, property) {
      var root = this.ampdoc.getRootNode();
      var videoElement = user().assertElement(
      root.getElementById( /** @type {string} */(id)), "Could not find an element with id=\"".concat(
      id, "\" for VIDEO_STATE"));

      var entry = this.getEntry_(videoElement);
      return (entry ? entry.getAnalyticsDetails() : _resolvedPromise()).then(
      function (details) {return (details ? details[property] : '');});

    }

    // TODO(go.amp.dev/issue/27010): For getters below, let's expose VideoEntry
    // instead and use directly. This is better for size and sanity. Users can
    // also then keep the entry reference for their own use.
    // (Can't expose yet due to package-level methods to be restructured, e.g
    // videoLoaded(). See issue)

    /**
     * Returns whether the video is paused or playing after the user interacted
     * with it or playing through autoplay
     *
     * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
     * @return {!../video-interface.PlayingStateDef}
     */ }, { key: "getPlayingState", value:
    function getPlayingState(videoOrElement) {
      return this.getEntry_(videoOrElement).getPlayingState();
    }

    /**
     * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
     * @return {boolean}
     */ }, { key: "isMuted", value:
    function isMuted(videoOrElement) {
      return this.getEntry_(videoOrElement).isMuted();
    }

    /**
     * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
     * @return {boolean}
     */ }, { key: "userInteracted", value:
    function userInteracted(videoOrElement) {
      return this.getEntry_(videoOrElement).userInteracted();
    }

    /**
     * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
     * @return {boolean}
     */ }, { key: "isRollingAd", value:
    function isRollingAd(videoOrElement) {
      return this.getEntry_(videoOrElement).isRollingAd();
    }

    /**
     * @param {!VideoEntry} entryBeingPlayed
     */ }, { key: "pauseOtherVideos", value:
    function pauseOtherVideos(entryBeingPlayed) {
      this.entries_.forEach(function (entry) {
        if (
        entry.isPlaybackManaged() &&
        entry !== entryBeingPlayed &&
        entry.getPlayingState() == PlayingStates.PLAYING_MANUAL)
        {
          entry.video.pause();
        }
      });
    } }]);return VideoManager;}();


/**
 * @param {?VideoEntry=} entry
 * @param {?../video-interface.VideoOrBaseElementDef|!Element=} videoOrElement
 * @return {boolean}
 */
var isEntryFor = function isEntryFor(entry, videoOrElement) {return (
    !!entry && (
    entry.video === videoOrElement || entry.video.element === videoOrElement));};

/**
 * VideoEntry represents an entry in the VideoManager's list.
 */var
VideoEntry = /*#__PURE__*/function () {
  /**
   * @param {!VideoManager} manager
   * @param {!../video-interface.VideoOrBaseElementDef} video
   */
  function VideoEntry(manager, video) {var _this3 = this;_classCallCheck(this, VideoEntry);
    /** @private @const {!VideoManager} */
    this.manager_ = manager;

    /** @private @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc_ = manager.ampdoc;

    /** @package @const {!../video-interface.VideoOrBaseElementDef} */
    this.video = video;

    /** @private {boolean} */
    this.managePlayback_ = true;

    /** @private {boolean} */
    this.loaded_ = false;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @private {boolean} */
    this.isRollingAd_ = false;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private @const */
    this.actionSessionManager_ = new VideoSessionManager();

    this.actionSessionManager_.onSessionEnd(function () {return (
        analyticsEvent(_this3, VideoAnalyticsEvents.SESSION));});


    /** @private @const */
    this.visibilitySessionManager_ = new VideoSessionManager();

    this.visibilitySessionManager_.onSessionEnd(function () {return (
        analyticsEvent(_this3, VideoAnalyticsEvents.SESSION_VISIBLE));});


    /** @private @const {function(): !AnalyticsPercentageTracker} */
    this.getAnalyticsPercentageTracker_ = once(
    function () {return new AnalyticsPercentageTracker(_this3.ampdoc_.win, _this3);});


    // Autoplay Variables

    /** @private {boolean} */
    this.playCalledByAutoplay_ = false;

    /** @private {boolean} */
    this.pauseCalledByAutoplay_ = false;

    /** @private {?Element} */
    this.internalElement_ = null;

    /** @private {boolean} */
    this.muted_ = false;

    /** @private {boolean} */
    this.hasSeenPlayEvent_ = false;

    this.hasAutoplay = video.element.hasAttribute(VideoAttributes.AUTOPLAY);

    if (this.hasAutoplay) {
      this.manager_.installAutoplayStyles();
    }

    // Media Session API Variables

    /** @private {!../mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    /** @private @const {function()} */
    this.boundMediasessionPlay_ = function () {
      _this3.video.play( /* isAutoplay */false);
    };

    /** @private @const {function()} */
    this.boundMediasessionPause_ = function () {
      _this3.video.pause();
    };

    listen(video.element, VideoEvents.LOAD, function () {return _this3.videoLoaded();});
    listen(video.element, VideoEvents.PAUSE, function () {return _this3.videoPaused_();});
    listen(video.element, VideoEvents.PLAY, function () {
      _this3.hasSeenPlayEvent_ = true;
      analyticsEvent(_this3, VideoAnalyticsEvents.PLAY);
    });
    listen(video.element, VideoEvents.PLAYING, function () {return _this3.videoPlayed_();});
    listen(video.element, VideoEvents.MUTED, function () {return (_this3.muted_ = true);});
    listen(video.element, VideoEvents.UNMUTED, function () {
      _this3.muted_ = false;
      _this3.manager_.pauseOtherVideos(_this3);
    });

    listen(video.element, VideoEvents.CUSTOM_TICK, function (e) {
      var data = getData(e);
      var eventType = data['eventType'];
      if (!eventType) {
        // CUSTOM_TICK is a generic event for 3p players whose semantics
        // don't fit with other video events.
        // If `eventType` is unset, it's not meant for analytics.
        return;
      }
      _this3.logCustomAnalytics_(eventType, data['vars']);
    });

    listen(video.element, VideoEvents.ENDED, function () {
      _this3.isRollingAd_ = false;
      analyticsEvent(_this3, VideoAnalyticsEvents.ENDED);
    });

    listen(video.element, VideoEvents.AD_START, function () {
      _this3.isRollingAd_ = true;
      analyticsEvent(_this3, VideoAnalyticsEvents.AD_START);
    });

    listen(video.element, VideoEvents.AD_END, function () {
      _this3.isRollingAd_ = false;
      analyticsEvent(_this3, VideoAnalyticsEvents.AD_END);
    });

    video.
    signals().
    whenSignal(VideoEvents.REGISTERED).
    then(function () {return _this3.onRegister_();});

    /**
     * Trigger event for first manual play.
     * @private @const {!function()}
     */
    this.firstPlayEventOrNoop_ = once(function () {
      var firstPlay = 'firstPlay';
      var trust = ActionTrust.LOW;
      var event = createCustomEvent(
      _this3.ampdoc_.win,
      firstPlay,
      /* detail */dict({}));

      var element = _this3.video.element;
      var actions = Services.actionServiceForDoc(element);
      actions.trigger(element, firstPlay, event, trust);
    });

    this.listenForPlaybackDelegation_();
  }

  /** @public */_createClass(VideoEntry, [{ key: "dispose", value:
    function dispose() {
      this.getAnalyticsPercentageTracker_().stop();
    }

    /**
     * @param {string} eventType
     * @param {!Object<string, string>} vars
     */ }, { key: "logCustomAnalytics_", value:
    function logCustomAnalytics_(eventType, vars) {
      var prefixedVars = _defineProperty({}, videoAnalyticsCustomEventTypeKey, eventType);

      Object.keys(vars).forEach(function (key) {
        prefixedVars["custom_".concat(key)] = vars[key];
      });

      analyticsEvent(this, VideoAnalyticsEvents.CUSTOM, prefixedVars);
    }

    /** Listens for signals to delegate playback to a different module. */ }, { key: "listenForPlaybackDelegation_", value:
    function listenForPlaybackDelegation_() {var _this4 = this;
      var signals = this.video.signals();
      signals.whenSignal(VideoServiceSignals.PLAYBACK_DELEGATED).then(function () {
        _this4.managePlayback_ = false;

        if (_this4.isPlaying_) {
          _this4.video.pause();
        }
      });
    }

    /** @return {boolean} */ }, { key: "isMuted", value:
    function isMuted() {
      return this.muted_;
    }

    /** @return {boolean} */ }, { key: "isPlaybackManaged", value:
    function isPlaybackManaged() {
      return this.managePlayback_;
    }

    /** @private */ }, { key: "onRegister_", value:
    function onRegister_() {
      if (this.requiresAutoFullscreen_()) {
        this.manager_.registerForAutoFullscreen(this);
      }

      if (this.hasAutoplay) {
        this.autoplayVideoBuilt_();
      }
    }

    /**
     * @return {boolean}
     * @private
     */ }, { key: "requiresAutoFullscreen_", value:
    function requiresAutoFullscreen_() {
      var element = this.video.element;
      if (
      this.video.preimplementsAutoFullscreen() ||
      !element.hasAttribute(VideoAttributes.ROTATE_TO_FULLSCREEN))
      {
        return false;
      }
      return userAssert(
      this.video.isInteractive(),
      'Only interactive videos are allowed to enter fullscreen on rotate. ' +
      'Set the `controls` attribute on %s to enable.',
      element);

    }

    /**
     * Callback for when the video starts playing
     * @private
     */ }, { key: "videoPlayed_", value:
    function videoPlayed_() {
      this.isPlaying_ = true;

      if (this.getPlayingState() == PlayingStates.PLAYING_MANUAL) {
        this.firstPlayEventOrNoop_();
        this.manager_.pauseOtherVideos(this);
      }

      var video = this.video;
      var element = video.element;

      if (
      !video.preimplementsMediaSessionAPI() &&
      !element.classList.contains('i-amphtml-disable-mediasession'))
      {
        validateMediaMetadata(element, this.metadata_);
        setMediaSession(
        this.ampdoc_.win,
        this.metadata_,
        this.boundMediasessionPlay_,
        this.boundMediasessionPause_);

      }

      this.actionSessionManager_.beginSession();
      if (this.isVisible_) {
        this.visibilitySessionManager_.beginSession();
      }

      // The PLAY event was omitted from the original VideoInterface. Thus
      // not every implementation emits it. It should always happen before
      // PLAYING. Hence we treat the PLAYING as an indication to emit the
      // Analytics PLAY event if we haven't seen PLAY.
      if (!this.hasSeenPlayEvent_) {
        analyticsEvent(this, VideoAnalyticsEvents.PLAY);
      }
    }

    /**
     * Callback for when the video has been paused
     * @private
     */ }, { key: "videoPaused_", value:
    function videoPaused_() {
      analyticsEvent(this, VideoAnalyticsEvents.PAUSE);
      this.isPlaying_ = false;

      // Prevent double-trigger of session if video is autoplay and the video
      // is paused by a the user scrolling the video out of view.
      if (!this.pauseCalledByAutoplay_) {
        this.actionSessionManager_.endSession();
      } else {
        // reset the flag
        this.pauseCalledByAutoplay_ = false;
      }
    }
    /**
     * Called when the video is loaded and can play.
     */ }, { key: "videoLoaded", value:
    function videoLoaded() {
      this.loaded_ = true;

      this.internalElement_ = getInternalVideoElementFor(this.video.element);

      this.fillMediaSessionMetadata_();

      this.getAnalyticsPercentageTracker_().start();

      if (this.isVisible_) {
        // Handles the case when the video becomes visible before loading
        this.loadedVideoVisibilityChanged_();
      }
    }

    /**
     * Gets the provided metadata and fills in missing fields
     * @private
     */ }, { key: "fillMediaSessionMetadata_", value:
    function fillMediaSessionMetadata_() {
      if (this.video.preimplementsMediaSessionAPI()) {
        return;
      }

      if (this.video.getMetadata()) {
        this.metadata_ = map(
        /** @type {!../mediasession-helper.MetadataDef} */(
        this.video.getMetadata()));

      }

      var doc = this.ampdoc_.win.document;

      if (!this.metadata_.artwork || this.metadata_.artwork.length == 0) {
        var posterUrl =
        parseSchemaImage(doc) || parseOgImage(doc) || parseFavicon(doc);

        if (posterUrl) {
          this.metadata_.artwork = [
          {
            'src': posterUrl }];


        }
      }

      if (!this.metadata_.title) {
        var title =
        this.video.element.getAttribute('title') ||
        this.video.element.getAttribute('aria-label') ||
        this.internalElement_.getAttribute('title') ||
        this.internalElement_.getAttribute('aria-label') ||
        doc.title;
        if (title) {
          this.metadata_.title = title;
        }
      }
    }

    /**
     * Called when visibility of a video changes.
     * @private
     */ }, { key: "videoVisibilityChanged_", value:
    function videoVisibilityChanged_() {
      if (this.loaded_) {
        this.loadedVideoVisibilityChanged_();
      }
    }

    /**
     * Only called when visibility of a loaded video changes.
     * @private
     */ }, { key: "loadedVideoVisibilityChanged_", value:
    function loadedVideoVisibilityChanged_() {var _this5 = this;
      if (!this.ampdoc_.isVisible()) {
        return;
      }
      isAutoplaySupported(this.ampdoc_.win).then(function (isAutoplaySupported) {
        var canAutoplay = _this5.hasAutoplay && !_this5.userInteracted();

        if (canAutoplay && isAutoplaySupported) {
          _this5.autoplayLoadedVideoVisibilityChanged_();
        } else {
          _this5.nonAutoplayLoadedVideoVisibilityChanged_();
        }
      });
    }

    /* Autoplay Behavior */

    /**
     * Called when an autoplay video is built.
     * @private
     */ }, { key: "autoplayVideoBuilt_", value:
    function autoplayVideoBuilt_() {var _this6 = this;
      // Hide controls until we know if autoplay is supported, otherwise hiding
      // and showing the controls quickly becomes a bad user experience for the
      // common case where autoplay is supported.
      if (this.video.isInteractive()) {
        this.video.hideControls();
      }

      isAutoplaySupported(this.ampdoc_.win).then(function (isAutoplaySupported) {
        if (!isAutoplaySupported && _this6.video.isInteractive()) {
          // Autoplay is not supported, show the controls so user can manually
          // initiate playback.
          _this6.video.showControls();
          return;
        }

        // Only muted videos are allowed to autoplay
        _this6.video.mute();

        _this6.installAutoplayElements_();
      });
    }

    /**
     * Installs autoplay animation and interaction mask when interactive.
     * The animated icon is appended always, but only displayed by CSS when
     * `controls` is set. See `video-autoplay.css`.
     * @private
     */ }, { key: "installAutoplayElements_", value:
    function installAutoplayElements_() {var _this7 = this;
      var video = this.video;
      var _this$video = this.video,element = _this$video.element,win = _this$video.win;

      if (
      element.hasAttribute(VideoAttributes.NO_AUDIO) ||
      element.signals().get(VideoServiceSignals.USER_INTERACTED))
      {
        return;
      }

      var animation = renderIcon(win, element);
      var children = [animation];

      /** @param {boolean} shouldDisplay */
      function toggleElements(shouldDisplay) {
        video.mutateElementSkipRemeasure(function () {
          children.forEach(function (child) {
            toggle(child, shouldDisplay);
          });
        });
      }

      /** @param {boolean} isPlaying */
      function toggleAnimation(isPlaying) {
        video.mutateElementSkipRemeasure(function () {return (
            animation.classList.toggle('amp-video-eq-play', isPlaying));});

      }

      var unlisteners = [
      listen(element, VideoEvents.PAUSE, function () {return toggleAnimation(false);}),
      listen(element, VideoEvents.PLAYING, function () {return toggleAnimation(true);}),
      listen(element, VideoEvents.AD_START, function () {
        toggleElements(false);
        video.showControls();
      }),
      listen(element, VideoEvents.AD_END, function () {
        toggleElements(true);
        video.hideControls();
      }),
      listen(element, VideoEvents.UNMUTED, function () {return userInteractedWith(video);})];


      if (video.isInteractive()) {
        video.hideControls();

        var mask = renderInteractionOverlay(element, this.metadata_);
        children.push(mask);
        unlisteners.push(listen(mask, 'click', function () {return userInteractedWith(video);}));
      }

      video.mutateElementSkipRemeasure(function () {
        children.forEach(function (child) {
          element.appendChild(child);
        });
      });

      if (this.isRollingAd_) {
        toggleElements(false);
      }

      video.
      signals().
      whenSignal(VideoServiceSignals.USER_INTERACTED).
      then(function () {
        _this7.firstPlayEventOrNoop_();
        if (video.isInteractive()) {
          video.showControls();
        }
        video.unmute();
        unlisteners.forEach(function (unlistener) {
          unlistener();
        });
        video.mutateElementSkipRemeasure(function () {
          children.forEach(function (child) {
            removeElement(child);
          });
        });
      });
    }

    /**
     * Called when visibility of a loaded autoplay video changes.
     * @private
     */ }, { key: "autoplayLoadedVideoVisibilityChanged_", value:
    function autoplayLoadedVideoVisibilityChanged_() {
      if (!this.managePlayback_) {
        return;
      }
      if (this.isVisible_) {
        this.visibilitySessionManager_.beginSession();
        this.video.play( /*autoplay*/true);
        this.playCalledByAutoplay_ = true;
      } else {
        if (this.isPlaying_) {
          this.visibilitySessionManager_.endSession();
        }
        this.video.pause();
        this.pauseCalledByAutoplay_ = true;
      }
    }

    /**
     * Called when visibility of a loaded non-autoplay video changes.
     * @private
     */ }, { key: "nonAutoplayLoadedVideoVisibilityChanged_", value:
    function nonAutoplayLoadedVideoVisibilityChanged_() {
      if (this.isVisible_) {
        this.visibilitySessionManager_.beginSession();
      } else if (this.isPlaying_) {
        this.visibilitySessionManager_.endSession();
      }
    }

    /**
     * Called by an IntersectionObserver.
     * @param {boolean} isVisible
     * @package
     */ }, { key: "updateVisibility", value:
    function updateVisibility(isVisible) {
      var wasVisible = this.isVisible_;
      this.isVisible_ = isVisible;
      if (isVisible != wasVisible) {
        this.videoVisibilityChanged_();
      }
    }

    /**
     * Returns whether the video is paused or playing after the user interacted
     * with it or playing through autoplay
     * @return {!../video-interface.PlayingStateDef}
     */ }, { key: "getPlayingState", value:
    function getPlayingState() {
      if (!this.isPlaying_) {
        return PlayingStates.PAUSED;
      }

      if (
      this.isPlaying_ &&
      this.playCalledByAutoplay_ &&
      !this.userInteracted())
      {
        return PlayingStates.PLAYING_AUTO;
      }

      return PlayingStates.PLAYING_MANUAL;
    }

    /** @return {boolean} */ }, { key: "isRollingAd", value:
    function isRollingAd() {
      return this.isRollingAd_;
    }

    /**
     * Returns whether the video was interacted with or not
     * @return {boolean}
     */ }, { key: "userInteracted", value:
    function userInteracted() {
      return (
      this.video.signals().get(VideoServiceSignals.USER_INTERACTED) != null);

    }

    /**
     * Collects a snapshot of the current video state for video analytics
     * @return {!Promise<!VideoAnalyticsDetailsDef>}
     */ }, { key: "getAnalyticsDetails", value:
    function getAnalyticsDetails() {var _this8 = this;
      var video = this.video;
      return Promise.all([
      isAutoplaySupported(this.ampdoc_.win),
      measureIntersection(video.element)]).
      then(function (responses) {
        var isAutoplaySupported = /** @type {boolean} */(responses[0]);
        var intersection = /** @type {!IntersectionObserverEntry} */(
        responses[1]);

        var _intersection$boundin = intersection.boundingClientRect,height = _intersection$boundin.height,width = _intersection$boundin.width;
        var autoplay = _this8.hasAutoplay && isAutoplaySupported;
        var playedRanges = video.getPlayedRanges();
        var playedTotal = playedRanges.reduce(
        function (acc, range) {return acc + range[1] - range[0];},
        0);


        return {
          'autoplay': autoplay,
          'currentTime': video.getCurrentTime(),
          'duration': video.getDuration(),
          // TODO(cvializ): add fullscreen
          'height': height,
          'id': video.element.id,
          'muted': _this8.muted_,
          'playedTotal': playedTotal,
          'playedRangesJson': JSON.stringify(playedRanges),
          'state': _this8.getPlayingState(),
          'width': width };

      });
    } }]);return VideoEntry;}();


/**
 * @param {!AmpElement} video
 * @return {boolean}
 * @restricted
 */
function supportsFullscreenViaApi(video) {
  // TODO(alanorozco): Determine this via a flag in the component itself.
  return !!{
    'amp-dailymotion': true,
    'amp-ima-video': true }[
  video.tagName.toLowerCase()];
}

/** Manages rotate-to-fullscreen video. */
export var AutoFullscreenManager = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!VideoManager} manager
   */
  function AutoFullscreenManager(ampdoc, manager) {var _this9 = this;_classCallCheck(this, AutoFullscreenManager);
    /** @private @const {!VideoManager} */
    this.manager_ = manager;

    /** @private @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?../video-interface.VideoOrBaseElementDef} */
    this.currentlyInFullscreen_ = null;

    /** @private {?../video-interface.VideoOrBaseElementDef} */
    this.currentlyCentered_ = null;

    /** @private @const {!Array<!../video-interface.VideoOrBaseElementDef>} */
    this.entries_ = [];

    /**
     * Unlisteners for global objects
     * @private {!Array<!UnlistenDef>}
     */
    this.unlisteners_ = [];

    // eslint-disable-next-line jsdoc/require-returns
    /** @private @const {function()} */
    this.boundSelectBestCentered_ = function () {return _this9.selectBestCenteredInPortrait_();};

    /**
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @return {boolean}
     */
    this.boundIncludeOnlyPlaying_ = function (video) {return (
        _this9.getPlayingState_(video) == PlayingStates.PLAYING_MANUAL);};

    /**
     * @param {!IntersectionObserverEntry} a
     * @param {!IntersectionObserverEntry} b
     * @return {number}
     */
    this.boundCompareEntries_ = function (a, b) {return _this9.compareEntries_(a, b);};

    this.installOrientationObserver_();
    this.installFullscreenListener_();
  }

  /** @public */_createClass(AutoFullscreenManager, [{ key: "dispose", value:
    function dispose() {
      this.unlisteners_.forEach(function (unlisten) {return unlisten();});
      this.unlisteners_.length = 0;
    }

    /** @param {!VideoEntry} entry */ }, { key: "register", value:
    function register(entry) {
      var video = entry.video;
      var element = video.element;

      if (!this.canFullscreen_(element)) {
        return;
      }

      this.entries_.push(video);

      listen(element, VideoEvents.PAUSE, this.boundSelectBestCentered_);
      listen(element, VideoEvents.PLAYING, this.boundSelectBestCentered_);
      listen(element, VideoEvents.ENDED, this.boundSelectBestCentered_);

      video.
      signals().
      whenSignal(VideoServiceSignals.USER_INTERACTED).
      then(this.boundSelectBestCentered_);

      // Set always
      this.selectBestCenteredInPortrait_();
    }

    /** @private */ }, { key: "installFullscreenListener_", value:
    function installFullscreenListener_() {var _this10 = this;
      var root = this.ampdoc_.getRootNode();
      var exitHandler = function exitHandler() {return _this10.onFullscreenExit_();};
      this.unlisteners_.push(
      listen(root, 'webkitfullscreenchange', exitHandler),
      listen(root, 'mozfullscreenchange', exitHandler),
      listen(root, 'fullscreenchange', exitHandler),
      listen(root, 'MSFullscreenChange', exitHandler));

    }

    /**
     * @return {boolean}
     * @visibleForTesting
     */ }, { key: "isInLandscape", value:
    function isInLandscape() {
      return isLandscape(this.ampdoc_.win);
    }

    /**
     * @param {!AmpElement} video
     * @return {boolean}
     * @private
     */ }, { key: "canFullscreen_", value:
    function canFullscreen_(video) {
      // Safari and iOS can only fullscreen <video> elements directly. In cases
      // where the player component is implemented via an <iframe>, we need to
      // rely on a postMessage API to fullscreen. Such an API is not necessarily
      // provided by every player.
      var internalElement = getInternalVideoElementFor(video);
      if (internalElement.tagName.toLowerCase() == 'video') {
        return true;
      }
      var platform = Services.platformFor(this.ampdoc_.win);
      if (!(platform.isIos() || platform.isSafari())) {
        return true;
      }
      return supportsFullscreenViaApi(video);
    }

    /** @private */ }, { key: "onFullscreenExit_", value:
    function onFullscreenExit_() {
      this.currentlyInFullscreen_ = null;
    }

    /** @private */ }, { key: "installOrientationObserver_", value:
    function installOrientationObserver_() {var _this11 = this;
      // TODO(alanorozco) Update based on support
      var win = this.ampdoc_.win;
      var screen = win.screen;
      // Chrome considers 'orientationchange' to be an untrusted event, but
      // 'change' on screen.orientation is considered a user interaction.
      // We still need to listen to 'orientationchange' on Chrome in order to
      // exit fullscreen since 'change' does not fire in this case.
      if (screen && 'orientation' in screen) {
        var orient = /** @type {!ScreenOrientation} */(screen.orientation);
        this.unlisteners_.push(
        listen(orient, 'change', function () {return _this11.onRotation_();}));

      }
      // iOS Safari does not have screen.orientation but classifies
      // 'orientationchange' as a user interaction.
      this.unlisteners_.push(
      listen(win, 'orientationchange', function () {return _this11.onRotation_();}));

    }

    /** @private */ }, { key: "onRotation_", value:
    function onRotation_() {
      if (this.isInLandscape()) {
        if (this.currentlyCentered_ != null) {
          this.enter_(this.currentlyCentered_);
        }
        return;
      }
      if (this.currentlyInFullscreen_) {
        this.exit_(this.currentlyInFullscreen_);
      }
    }

    /**
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @private
     */ }, { key: "enter_", value:
    function enter_(video) {
      var platform = Services.platformFor(this.ampdoc_.win);

      this.currentlyInFullscreen_ = video;

      if (platform.isAndroid() && platform.isChrome()) {
        // Chrome on Android somehow knows what we're doing and executes a nice
        // transition by default. Delegating to browser.
        video.fullscreenEnter();
        return;
      }

      this.scrollIntoIfNotVisible_(video).then(function () {return video.fullscreenEnter();});
    }

    /**
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @private
     */ }, { key: "exit_", value:
    function exit_(video) {
      this.currentlyInFullscreen_ = null;

      this.scrollIntoIfNotVisible_(video, 'center').then(function () {return (
          video.fullscreenExit());});

    }

    /**
     * Scrolls to a video if it's not in view.
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @param {?string=} optPos
     * @return {!Promise}
     * @private
     */ }, { key: "scrollIntoIfNotVisible_", value:
    function scrollIntoIfNotVisible_(video) {var optPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var element = video.element;
      var viewport = this.getViewport_();

      return this.onceOrientationChanges_().
      then(function () {return measureIntersection(element);}).
      then(function (_ref2) {var boundingClientRect = _ref2.boundingClientRect;
        var bottom = boundingClientRect.bottom,top = boundingClientRect.top;
        var vh = viewport.getSize().height;
        var fullyVisible = top >= 0 && bottom <= vh;
        if (fullyVisible) {
          return _resolvedPromise2();
        }
        var pos = optPos ? /** @type {string} */(
        optPos) :
        bottom > vh ?
        'bottom' :
        'top';
        return viewport.animateScrollIntoView(element, pos);
      });
    }

    /**
     * @private
     * @return {./viewport/viewport-interface.ViewportInterface}
     */ }, { key: "getViewport_", value:
    function getViewport_() {
      return Services.viewportForDoc(this.ampdoc_);
    }

    /**
     * @private
     * @return {!Promise}
     */ }, { key: "onceOrientationChanges_", value:
    function onceOrientationChanges_() {
      var magicNumber = 330;
      return Services.timerFor(this.ampdoc_.win).promise(magicNumber);
    }

    /**
     * @private
     * @return {!Promise<?../video-interface.VideoOrBaseElementDef>}
     */ }, { key: "selectBestCenteredInPortrait_", value:
    function selectBestCenteredInPortrait_() {var _this12 = this;
      if (this.isInLandscape()) {
        return Promise.resolve(this.currentlyCentered_);
      }

      this.currentlyCentered_ = null;

      var intersectionsPromise = this.entries_.
      filter(this.boundIncludeOnlyPlaying_).
      map(function (e) {return measureIntersection(e.element);});

      return Promise.all(intersectionsPromise).then(function (intersections) {
        var selected = intersections.sort(_this12.boundCompareEntries_)[0];

        if (
        selected &&
        selected.intersectionRatio > MIN_VISIBILITY_RATIO_FOR_AUTOPLAY)
        {
          return selected.target.
          getImpl().
          then(function (video) {return (_this12.currentlyCentered_ = video);});
        }

        return _this12.currentlyCentered_;
      });
    }

    /**
     * Compares two videos in order to sort them by "best centered".
     * @param {!IntersectionObserverEntry} a
     * @param {!IntersectionObserverEntry} b
     * @return {number}
     */ }, { key: "compareEntries_", value:
    function compareEntries_(a, b) {
      var rectA = a.boundingClientRect,ratioA = a.intersectionRatio;
      var rectB = b.boundingClientRect,ratioB = b.intersectionRatio;

      // Prioritize by how visible they are, with a tolerance of 10%
      var ratioTolerance = 0.1;
      var ratioDelta = ratioA - ratioB;
      if (Math.abs(ratioDelta) > ratioTolerance) {
        return ratioDelta;
      }

      // Prioritize by distance from center.
      var viewport = Services.viewportForDoc(this.ampdoc_);
      var centerA = centerDist(viewport, rectA);
      var centerB = centerDist(viewport, rectB);
      if (centerA < centerB || centerA > centerB) {
        return centerA - centerB;
      }

      // Everything else failing, choose the highest element.
      return rectA.top - rectB.top;
    }

    /**
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @return {!../video-interface.PlayingStateDef}
     * @private
     */ }, { key: "getPlayingState_", value:
    function getPlayingState_(video) {
      return this.manager_.getPlayingState(
      /** @type {!../video-interface.VideoInterface} */(video));

    } }]);return AutoFullscreenManager;}();


/**
 * @param {!./viewport/viewport-interface.ViewportInterface} viewport
 * @param {{top: number, height: number}} rect
 * @return {number}
 */
function centerDist(viewport, rect) {
  var centerY = rect.top + rect.height / 2;
  var centerViewport = viewport.getSize().height / 2;
  return Math.abs(centerY - centerViewport);
}

/**
 * @param {!Window} win
 * @return {boolean}
 */
function isLandscape(win) {
  if (win.screen && 'orientation' in win.screen) {
    return win.screen.orientation.type.startsWith('landscape');
  }
  return Math.abs(win.orientation) == 90;
}

/** @visibleForTesting */
export var PERCENTAGE_INTERVAL = 5;

/** @visibleForTesting */
export var PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS = 500;

/** @private */
var PERCENTAGE_FREQUENCY_MIN_MS = 250;

/** @private */
var PERCENTAGE_FREQUENCY_MAX_MS = 4000;

/**
 * Calculates the "ideal" analytics check frequency from playback start, e.g.
 * the amount of ms after each PERCENTAGE_INTERVAL.
 * @param {number} durationSeconds
 * @return {number}
 */
function calculateIdealPercentageFrequencyMs(durationSeconds) {
  return durationSeconds * 10 * PERCENTAGE_INTERVAL;
}

/**
 * Calculates the "actual" analytics check frequency by calculating the ideal
 * frequency and clamping it between MIN and MAX.
 * @param {number} durationSeconds
 * @return {number}
 */
function calculateActualPercentageFrequencyMs(durationSeconds) {
  return clamp(
  calculateIdealPercentageFrequencyMs(durationSeconds),
  PERCENTAGE_FREQUENCY_MIN_MS,
  PERCENTAGE_FREQUENCY_MAX_MS);

}

/**
 * Handle cases such as livestreams or videos with no duration information is
 * available, where 1 second is the default duration for some video players.
 * @param {?number=} duration
 * @return {boolean}
 */
var isDurationFiniteNonZero = function isDurationFiniteNonZero(duration) {return (
    !!duration && !isNaN(duration) && duration > 1);};

/** @visibleForTesting */
export var AnalyticsPercentageTracker = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!VideoEntry} entry
   */
  function AnalyticsPercentageTracker(win, entry) {_classCallCheck(this, AnalyticsPercentageTracker);
    // This is destructured in `calculate_()`, but the linter thinks it's unused
    /** @private @const {!./timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private @const {!VideoEntry} */
    this.entry_ = entry;

    /** @private {?Array<!UnlistenDef>} */
    this.unlisteners_ = null;

    /** @private {number} */
    this.last_ = 0;

    /**
     * Counter for each trigger `start`. This is to prevent duplicate events if
     * two consecutive triggers take place, or to prevent events firing once
     * the tracker is stopped.
     * @private {number}
     */
    this.triggerId_ = 0;
  }

  /** @public */_createClass(AnalyticsPercentageTracker, [{ key: "start", value:
    function start() {var _this13 = this;
      var element = this.entry_.video.element;

      this.stop();

      this.unlisteners_ = this.unlisteners_ || [];

      // If the video has already emitted LOADEDMETADATA, the event below
      // will never fire, so we check if it's already available here.
      if (this.hasDuration_()) {
        this.calculate_(this.triggerId_);
      } else {
        this.unlisteners_.push(
        listenOnce(element, VideoEvents.LOADEDMETADATA, function () {
          if (_this13.hasDuration_()) {
            _this13.calculate_(_this13.triggerId_);
          }
        }));

      }

      this.unlisteners_.push(
      listen(element, VideoEvents.ENDED, function () {
        if (_this13.hasDuration_()) {
          _this13.maybeTrigger_( /* normalizedPercentage */100);
        }
      }));

    }

    /** @public */ }, { key: "stop", value:
    function stop() {
      if (!this.unlisteners_) {
        return;
      }
      while (this.unlisteners_.length > 0) {
        this.unlisteners_.pop()();
      }
      this.triggerId_++;
    }

    /**
     * @return {boolean}
     * @private
     */ }, { key: "hasDuration_", value:
    function hasDuration_() {
      var video = this.entry_.video;
      var duration = video.getDuration();

      if (!isDurationFiniteNonZero(duration)) {
        return false;
      }

      if (
      calculateIdealPercentageFrequencyMs(duration) <
      PERCENTAGE_FREQUENCY_MIN_MS)
      {
        var bestResultLength = Math.ceil(
        (PERCENTAGE_FREQUENCY_MIN_MS * (100 / PERCENTAGE_INTERVAL)) / 1000);


        this.warnForTesting_(
        'This video is too short for `video-percentage-played`. ' +
        'Reports may be innacurate. For best results, use videos over',
        bestResultLength,
        'seconds long.',
        video.element);

      }

      return true;
    }

    /**
     * @param  {...*} args
     * @private
     */ }, { key: "warnForTesting_", value:
    function warnForTesting_() {for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
      user().warn.apply(user(), [TAG].concat(args));
    }

    /**
     * @param {number=} triggerId
     * @private
     */ }, { key: "calculate_", value:
    function calculate_(triggerId) {var _this14 = this;
      if (triggerId != this.triggerId_) {
        return;
      }

      var entry = this.entry_,timer = this.timer_;
      var video = entry.video;

      var calculateAgain = function calculateAgain() {return _this14.calculate_(triggerId);};

      if (entry.getPlayingState() == PlayingStates.PAUSED) {
        timer.delay(calculateAgain, PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS);
        return;
      }

      var duration = video.getDuration();
      // TODO(#25954): Further investigate root cause and remove this protection
      // if appropriate.
      if (!isDurationFiniteNonZero(duration)) {
        timer.delay(calculateAgain, PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS);
        return;
      }

      var frequencyMs = calculateActualPercentageFrequencyMs(duration);

      var percentage = (video.getCurrentTime() / duration) * 100;
      var normalizedPercentage =
      Math.floor(percentage / PERCENTAGE_INTERVAL) * PERCENTAGE_INTERVAL;

      devAssert(isFiniteNumber(normalizedPercentage));

      this.maybeTrigger_(normalizedPercentage);

      timer.delay(calculateAgain, frequencyMs);
    }

    /**
     * @param {number} normalizedPercentage
     * @private
     */ }, { key: "maybeTrigger_", value:
    function maybeTrigger_(normalizedPercentage) {
      if (normalizedPercentage <= 0) {
        return;
      }

      if (this.last_ == normalizedPercentage) {
        return;
      }

      this.last_ = normalizedPercentage;

      this.analyticsEventForTesting_(normalizedPercentage);
    }

    /**
     * @param {number} normalizedPercentage
     * @private
     */ }, { key: "analyticsEventForTesting_", value:
    function analyticsEventForTesting_(normalizedPercentage) {
      analyticsEvent(this.entry_, VideoAnalyticsEvents.PERCENTAGE_PLAYED, {
        'normalizedPercentage': normalizedPercentage.toString() });

    } }]);return AnalyticsPercentageTracker;}();


/**
 * @param {!VideoEntry} entry
 * @param {!VideoAnalyticsEvents} eventType
 * @param {!Object<string, string>=} opt_vars A map of vars and their values.
 * @private
 */
function analyticsEvent(entry, eventType, opt_vars) {
  var video = entry.video;

  entry.getAnalyticsDetails().then(function (details) {
    if (opt_vars) {
      Object.assign(details, opt_vars);
    }
    dispatchCustomEvent(video.element, eventType, details);
  });
}

/** @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc */
export function installVideoManagerForDoc(nodeOrDoc) {
  registerServiceBuilderForDoc(nodeOrDoc, 'video-manager', VideoManager);
}
// /Users/mszylkowski/src/amphtml/src/service/video-manager-impl.js