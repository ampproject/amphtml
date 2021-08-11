import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
import { EMPTY_METADATA, parseFavicon, parseOgImage, parseSchemaImage, setMediaSession, validateMediaMetadata } from "../mediasession-helper";
import { registerServiceBuilderForDoc } from "../service-helpers";
import { MIN_VISIBILITY_RATIO_FOR_AUTOPLAY, PlayingStates, VideoAnalyticsEvents, VideoAttributes, VideoEvents, VideoServiceSignals, setIsMediaComponent, userInteractedWith, videoAnalyticsCustomEventTypeKey } from "../video-interface";

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
  function VideoManager(ampdoc) {
    var _this = this;

    _classCallCheck(this, VideoManager);

    /** @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc = ampdoc;

    /** @const */
    this.installAutoplayStyles = once(function () {
      return installAutoplayStylesForDoc(_this.ampdoc);
    });

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
    this.boundSecondsPlaying_ = function () {
      return _this.secondsPlaying_();
    };

    /** @private @const {function():!AutoFullscreenManager} */
    this.getAutoFullscreenManager_ = once(function () {
      return new AutoFullscreenManager(_this.ampdoc, _this);
    });
    // TODO(cvializ, #10599): It would be nice to only create the timer
    // if video analytics are present, since the timer is not needed if
    // video analytics are not present.
    this.timer_.delay(this.boundSecondsPlaying_, SECONDS_PLAYED_MIN_DELAY);
  }

  /** @override */
  _createClass(VideoManager, [{
    key: "dispose",
    value: function dispose() {
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
     */

  }, {
    key: "secondsPlaying_",
    value: function secondsPlaying_() {
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
     */

  }, {
    key: "timeUpdateActionEvent_",
    value: function timeUpdateActionEvent_(entry) {
      var name = 'timeUpdate';
      var currentTime = entry.video.getCurrentTime();
      var duration = entry.video.getDuration();

      if (isFiniteNumber(currentTime) && isFiniteNumber(duration) && duration > 0) {
        var perc = currentTime / duration;
        var event = createCustomEvent(this.ampdoc.win, TAG + "." + name, dict({
          'time': currentTime,
          'percent': perc
        }));
        this.actions_.trigger(entry.video.element, name, event, ActionTrust.LOW);
      }
    } // TODO(#30723): create unregister() for cleanup.

    /** @param {!../video-interface.VideoInterface} video */

  }, {
    key: "register",
    value: function register(video) {
      var _this2 = this;

      devAssert(video);
      var videoBE =
      /** @type {!AMP.BaseElement} */
      video;
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
        /** @type {!Array<!IntersectionObserverEntry>} */
        records) {
          return records.forEach(function (_ref) {
            var isIntersecting = _ref.isIntersecting,
                target = _ref.target;

            _this2.getEntry_(target).updateVisibility(
            /* isVisible */
            isIntersecting);
          });
        };

        this.viewportObserver_ = createViewportObserver(viewportCallback, this.ampdoc.win, {
          threshold: MIN_VISIBILITY_RATIO_FOR_AUTOPLAY
        });
      }

      this.viewportObserver_.observe(videoBE.element);
      listen(videoBE.element, VideoEvents.RELOAD, function () {
        return entry.videoLoaded();
      });
      this.entries_ = this.entries_ || [];
      var entry = new VideoEntry(this, video);
      this.entries_.push(entry);
      var element = entry.video.element;
      dispatchCustomEvent(element, VideoEvents.REGISTERED);
      setIsMediaComponent(element);
      // Unlike events, signals are permanent. We can wait for `REGISTERED` at any
      // moment in the element's lifecycle and the promise will resolve
      // appropriately each time.
      var signals =
      /** @type {!../base-element.BaseElement} */
      video.signals();
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
     */

  }, {
    key: "registerCommonActions_",
    value: function registerCommonActions_(video) {
      // Only require ActionTrust.LOW for video actions to defer to platform
      // specific handling (e.g. user gesture requirement for unmuted playback).
      var trust = ActionTrust.LOW;
      registerAction('play', function () {
        return video.play(
        /* isAutoplay */
        false);
      });
      registerAction('pause', function () {
        return video.pause();
      });
      registerAction('mute', function () {
        return video.mute();
      });
      registerAction('unmute', function () {
        return video.unmute();
      });

      // fullscreen/fullscreenenter are a special case.
      // - fullscreenenter is kept as a standard name for symmetry with internal
      //   internal interfaces
      // - fullscreen is an undocumented alias for backwards compatibility.
      var fullscreenEnter = function fullscreenEnter() {
        return video.fullscreenEnter();
      };

      registerAction('fullscreenenter', fullscreenEnter);
      registerAction('fullscreen', fullscreenEnter);

      /**
       * @param {string} action
       * @param {function()} fn
       */
      function registerAction(action, fn) {
        var videoBE =
        /** @type {!AMP.BaseElement} */
        video;
        videoBE.registerAction(action, function () {
          userInteractedWith(video);
          fn();
        }, trust);
      }
    }
    /**
     * Returns the entry in the video manager corresponding to the video or
     * element provided, or null if unavailable.
     * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
     * @return {?VideoEntry} entry
     */

  }, {
    key: "getEntryOrNull_",
    value: function getEntryOrNull_(videoOrElement) {
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
     */

  }, {
    key: "getEntry_",
    value: function getEntry_(videoOrElement) {
      return devAssert(this.getEntryOrNull_(videoOrElement), '%s not registered to VideoManager', videoOrElement.element || videoOrElement);
    }
    /** @param {!VideoEntry} entry */

  }, {
    key: "registerForAutoFullscreen",
    value: function registerForAutoFullscreen(entry) {
      this.getAutoFullscreenManager_().register(entry);
    }
    /**
     * @return {!AutoFullscreenManager}
     * @visibleForTesting
     */

  }, {
    key: "getAutoFullscreenManagerForTesting_",
    value: function getAutoFullscreenManagerForTesting_() {
      return this.getAutoFullscreenManager_();
    }
    /**
     * Gets the current analytics details property for the given video.
     * Fails silently if the video is not registered.
     * @param {string} id
     * @param {string} property
     * @return {!Promise<string>}
     */

  }, {
    key: "getVideoStateProperty",
    value: function getVideoStateProperty(id, property) {
      var root = this.ampdoc.getRootNode();
      var videoElement = user().assertElement(root.getElementById(
      /** @type {string} */
      id), "Could not find an element with id=\"" + id + "\" for VIDEO_STATE");
      var entry = this.getEntry_(videoElement);
      return (entry ? entry.getAnalyticsDetails() : _resolvedPromise()).then(function (details) {
        return details ? details[property] : '';
      });
    } // TODO(go.amp.dev/issue/27010): For getters below, let's expose VideoEntry
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
     */

  }, {
    key: "getPlayingState",
    value: function getPlayingState(videoOrElement) {
      return this.getEntry_(videoOrElement).getPlayingState();
    }
    /**
     * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
     * @return {boolean}
     */

  }, {
    key: "isMuted",
    value: function isMuted(videoOrElement) {
      return this.getEntry_(videoOrElement).isMuted();
    }
    /**
     * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
     * @return {boolean}
     */

  }, {
    key: "userInteracted",
    value: function userInteracted(videoOrElement) {
      return this.getEntry_(videoOrElement).userInteracted();
    }
    /**
     * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
     * @return {boolean}
     */

  }, {
    key: "isRollingAd",
    value: function isRollingAd(videoOrElement) {
      return this.getEntry_(videoOrElement).isRollingAd();
    }
    /**
     * @param {!VideoEntry} entryBeingPlayed
     */

  }, {
    key: "pauseOtherVideos",
    value: function pauseOtherVideos(entryBeingPlayed) {
      this.entries_.forEach(function (entry) {
        if (entry.isPlaybackManaged() && entry !== entryBeingPlayed && entry.getPlayingState() == PlayingStates.PLAYING_MANUAL) {
          entry.video.pause();
        }
      });
    }
  }]);

  return VideoManager;
}();

/**
 * @param {?VideoEntry=} entry
 * @param {?../video-interface.VideoOrBaseElementDef|!Element=} videoOrElement
 * @return {boolean}
 */
var isEntryFor = function isEntryFor(entry, videoOrElement) {
  return !!entry && (entry.video === videoOrElement || entry.video.element === videoOrElement);
};

/**
 * VideoEntry represents an entry in the VideoManager's list.
 */
var VideoEntry = /*#__PURE__*/function () {
  /**
   * @param {!VideoManager} manager
   * @param {!../video-interface.VideoOrBaseElementDef} video
   */
  function VideoEntry(manager, video) {
    var _this3 = this;

    _classCallCheck(this, VideoEntry);

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
    this.actionSessionManager_.onSessionEnd(function () {
      return analyticsEvent(_this3, VideoAnalyticsEvents.SESSION);
    });

    /** @private @const */
    this.visibilitySessionManager_ = new VideoSessionManager();
    this.visibilitySessionManager_.onSessionEnd(function () {
      return analyticsEvent(_this3, VideoAnalyticsEvents.SESSION_VISIBLE);
    });

    /** @private @const {function(): !AnalyticsPercentageTracker} */
    this.getAnalyticsPercentageTracker_ = once(function () {
      return new AnalyticsPercentageTracker(_this3.ampdoc_.win, _this3);
    });
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
      _this3.video.play(
      /* isAutoplay */
      false);
    };

    /** @private @const {function()} */
    this.boundMediasessionPause_ = function () {
      _this3.video.pause();
    };

    listen(video.element, VideoEvents.LOAD, function () {
      return _this3.videoLoaded();
    });
    listen(video.element, VideoEvents.PAUSE, function () {
      return _this3.videoPaused_();
    });
    listen(video.element, VideoEvents.PLAY, function () {
      _this3.hasSeenPlayEvent_ = true;
      analyticsEvent(_this3, VideoAnalyticsEvents.PLAY);
    });
    listen(video.element, VideoEvents.PLAYING, function () {
      return _this3.videoPlayed_();
    });
    listen(video.element, VideoEvents.MUTED, function () {
      return _this3.muted_ = true;
    });
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
    video.signals().whenSignal(VideoEvents.REGISTERED).then(function () {
      return _this3.onRegister_();
    });

    /**
     * Trigger event for first manual play.
     * @private @const {!function()}
     */
    this.firstPlayEventOrNoop_ = once(function () {
      var firstPlay = 'firstPlay';
      var trust = ActionTrust.LOW;
      var event = createCustomEvent(_this3.ampdoc_.win, firstPlay,
      /* detail */
      dict({}));
      var element = _this3.video.element;
      var actions = Services.actionServiceForDoc(element);
      actions.trigger(element, firstPlay, event, trust);
    });
    this.listenForPlaybackDelegation_();
  }

  /** @public */
  _createClass(VideoEntry, [{
    key: "dispose",
    value: function dispose() {
      this.getAnalyticsPercentageTracker_().stop();
    }
    /**
     * @param {string} eventType
     * @param {!Object<string, string>} vars
     */

  }, {
    key: "logCustomAnalytics_",
    value: function logCustomAnalytics_(eventType, vars) {
      var _prefixedVars;

      var prefixedVars = (_prefixedVars = {}, _prefixedVars[videoAnalyticsCustomEventTypeKey] = eventType, _prefixedVars);
      Object.keys(vars).forEach(function (key) {
        prefixedVars["custom_" + key] = vars[key];
      });
      analyticsEvent(this, VideoAnalyticsEvents.CUSTOM, prefixedVars);
    }
    /** Listens for signals to delegate playback to a different module. */

  }, {
    key: "listenForPlaybackDelegation_",
    value: function listenForPlaybackDelegation_() {
      var _this4 = this;

      var signals = this.video.signals();
      signals.whenSignal(VideoServiceSignals.PLAYBACK_DELEGATED).then(function () {
        _this4.managePlayback_ = false;

        if (_this4.isPlaying_) {
          _this4.video.pause();
        }
      });
    }
    /** @return {boolean} */

  }, {
    key: "isMuted",
    value: function isMuted() {
      return this.muted_;
    }
    /** @return {boolean} */

  }, {
    key: "isPlaybackManaged",
    value: function isPlaybackManaged() {
      return this.managePlayback_;
    }
    /** @private */

  }, {
    key: "onRegister_",
    value: function onRegister_() {
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
     */

  }, {
    key: "requiresAutoFullscreen_",
    value: function requiresAutoFullscreen_() {
      var element = this.video.element;

      if (this.video.preimplementsAutoFullscreen() || !element.hasAttribute(VideoAttributes.ROTATE_TO_FULLSCREEN)) {
        return false;
      }

      return userAssert(this.video.isInteractive(), 'Only interactive videos are allowed to enter fullscreen on rotate. ' + 'Set the `controls` attribute on %s to enable.', element);
    }
    /**
     * Callback for when the video starts playing
     * @private
     */

  }, {
    key: "videoPlayed_",
    value: function videoPlayed_() {
      this.isPlaying_ = true;

      if (this.getPlayingState() == PlayingStates.PLAYING_MANUAL) {
        this.firstPlayEventOrNoop_();
        this.manager_.pauseOtherVideos(this);
      }

      var video = this.video;
      var element = video.element;

      if (!video.preimplementsMediaSessionAPI() && !element.classList.contains('i-amphtml-disable-mediasession')) {
        validateMediaMetadata(element, this.metadata_);
        setMediaSession(this.ampdoc_.win, this.metadata_, this.boundMediasessionPlay_, this.boundMediasessionPause_);
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
     */

  }, {
    key: "videoPaused_",
    value: function videoPaused_() {
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
     */

  }, {
    key: "videoLoaded",
    value: function videoLoaded() {
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
     */

  }, {
    key: "fillMediaSessionMetadata_",
    value: function fillMediaSessionMetadata_() {
      if (this.video.preimplementsMediaSessionAPI()) {
        return;
      }

      if (this.video.getMetadata()) {
        this.metadata_ = map(
        /** @type {!../mediasession-helper.MetadataDef} */
        this.video.getMetadata());
      }

      var doc = this.ampdoc_.win.document;

      if (!this.metadata_.artwork || this.metadata_.artwork.length == 0) {
        var posterUrl = parseSchemaImage(doc) || parseOgImage(doc) || parseFavicon(doc);

        if (posterUrl) {
          this.metadata_.artwork = [{
            'src': posterUrl
          }];
        }
      }

      if (!this.metadata_.title) {
        var title = this.video.element.getAttribute('title') || this.video.element.getAttribute('aria-label') || this.internalElement_.getAttribute('title') || this.internalElement_.getAttribute('aria-label') || doc.title;

        if (title) {
          this.metadata_.title = title;
        }
      }
    }
    /**
     * Called when visibility of a video changes.
     * @private
     */

  }, {
    key: "videoVisibilityChanged_",
    value: function videoVisibilityChanged_() {
      if (this.loaded_) {
        this.loadedVideoVisibilityChanged_();
      }
    }
    /**
     * Only called when visibility of a loaded video changes.
     * @private
     */

  }, {
    key: "loadedVideoVisibilityChanged_",
    value: function loadedVideoVisibilityChanged_() {
      var _this5 = this;

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
     */

  }, {
    key: "autoplayVideoBuilt_",
    value: function autoplayVideoBuilt_() {
      var _this6 = this;

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
     */

  }, {
    key: "installAutoplayElements_",
    value: function installAutoplayElements_() {
      var _this7 = this;

      var video = this.video;
      var _this$video = this.video,
          element = _this$video.element,
          win = _this$video.win;

      if (element.hasAttribute(VideoAttributes.NO_AUDIO) || element.signals().get(VideoServiceSignals.USER_INTERACTED)) {
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
        video.mutateElementSkipRemeasure(function () {
          return animation.classList.toggle('amp-video-eq-play', isPlaying);
        });
      }

      var unlisteners = [listen(element, VideoEvents.PAUSE, function () {
        return toggleAnimation(false);
      }), listen(element, VideoEvents.PLAYING, function () {
        return toggleAnimation(true);
      }), listen(element, VideoEvents.AD_START, function () {
        toggleElements(false);
        video.showControls();
      }), listen(element, VideoEvents.AD_END, function () {
        toggleElements(true);
        video.hideControls();
      }), listen(element, VideoEvents.UNMUTED, function () {
        return userInteractedWith(video);
      })];

      if (video.isInteractive()) {
        video.hideControls();
        var mask = renderInteractionOverlay(element, this.metadata_);
        children.push(mask);
        unlisteners.push(listen(mask, 'click', function () {
          return userInteractedWith(video);
        }));
      }

      video.mutateElementSkipRemeasure(function () {
        children.forEach(function (child) {
          element.appendChild(child);
        });
      });

      if (this.isRollingAd_) {
        toggleElements(false);
      }

      video.signals().whenSignal(VideoServiceSignals.USER_INTERACTED).then(function () {
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
     */

  }, {
    key: "autoplayLoadedVideoVisibilityChanged_",
    value: function autoplayLoadedVideoVisibilityChanged_() {
      if (!this.managePlayback_) {
        return;
      }

      if (this.isVisible_) {
        this.visibilitySessionManager_.beginSession();
        this.video.play(
        /*autoplay*/
        true);
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
     */

  }, {
    key: "nonAutoplayLoadedVideoVisibilityChanged_",
    value: function nonAutoplayLoadedVideoVisibilityChanged_() {
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
     */

  }, {
    key: "updateVisibility",
    value: function updateVisibility(isVisible) {
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
     */

  }, {
    key: "getPlayingState",
    value: function getPlayingState() {
      if (!this.isPlaying_) {
        return PlayingStates.PAUSED;
      }

      if (this.isPlaying_ && this.playCalledByAutoplay_ && !this.userInteracted()) {
        return PlayingStates.PLAYING_AUTO;
      }

      return PlayingStates.PLAYING_MANUAL;
    }
    /** @return {boolean} */

  }, {
    key: "isRollingAd",
    value: function isRollingAd() {
      return this.isRollingAd_;
    }
    /**
     * Returns whether the video was interacted with or not
     * @return {boolean}
     */

  }, {
    key: "userInteracted",
    value: function userInteracted() {
      return this.video.signals().get(VideoServiceSignals.USER_INTERACTED) != null;
    }
    /**
     * Collects a snapshot of the current video state for video analytics
     * @return {!Promise<!VideoAnalyticsDetailsDef>}
     */

  }, {
    key: "getAnalyticsDetails",
    value: function getAnalyticsDetails() {
      var _this8 = this;

      var video = this.video;
      return Promise.all([isAutoplaySupported(this.ampdoc_.win), measureIntersection(video.element)]).then(function (responses) {
        var isAutoplaySupported =
        /** @type {boolean} */
        responses[0];
        var intersection =
        /** @type {!IntersectionObserverEntry} */
        responses[1];
        var _intersection$boundin = intersection.boundingClientRect,
            height = _intersection$boundin.height,
            width = _intersection$boundin.width;
        var autoplay = _this8.hasAutoplay && isAutoplaySupported;
        var playedRanges = video.getPlayedRanges();
        var playedTotal = playedRanges.reduce(function (acc, range) {
          return acc + range[1] - range[0];
        }, 0);
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
          'width': width
        };
      });
    }
  }]);

  return VideoEntry;
}();

/**
 * @param {!AmpElement} video
 * @return {boolean}
 * @restricted
 */
function supportsFullscreenViaApi(video) {
  // TODO(alanorozco): Determine this via a flag in the component itself.
  return !!{
    'amp-dailymotion': true,
    'amp-ima-video': true
  }[video.tagName.toLowerCase()];
}

/** Manages rotate-to-fullscreen video. */
export var AutoFullscreenManager = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!VideoManager} manager
   */
  function AutoFullscreenManager(ampdoc, manager) {
    var _this9 = this;

    _classCallCheck(this, AutoFullscreenManager);

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
    this.boundSelectBestCentered_ = function () {
      return _this9.selectBestCenteredInPortrait_();
    };

    /**
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @return {boolean}
     */
    this.boundIncludeOnlyPlaying_ = function (video) {
      return _this9.getPlayingState_(video) == PlayingStates.PLAYING_MANUAL;
    };

    /**
     * @param {!IntersectionObserverEntry} a
     * @param {!IntersectionObserverEntry} b
     * @return {number}
     */
    this.boundCompareEntries_ = function (a, b) {
      return _this9.compareEntries_(a, b);
    };

    this.installOrientationObserver_();
    this.installFullscreenListener_();
  }

  /** @public */
  _createClass(AutoFullscreenManager, [{
    key: "dispose",
    value: function dispose() {
      this.unlisteners_.forEach(function (unlisten) {
        return unlisten();
      });
      this.unlisteners_.length = 0;
    }
    /** @param {!VideoEntry} entry */

  }, {
    key: "register",
    value: function register(entry) {
      var video = entry.video;
      var element = video.element;

      if (!this.canFullscreen_(element)) {
        return;
      }

      this.entries_.push(video);
      listen(element, VideoEvents.PAUSE, this.boundSelectBestCentered_);
      listen(element, VideoEvents.PLAYING, this.boundSelectBestCentered_);
      listen(element, VideoEvents.ENDED, this.boundSelectBestCentered_);
      video.signals().whenSignal(VideoServiceSignals.USER_INTERACTED).then(this.boundSelectBestCentered_);
      // Set always
      this.selectBestCenteredInPortrait_();
    }
    /** @private */

  }, {
    key: "installFullscreenListener_",
    value: function installFullscreenListener_() {
      var _this10 = this;

      var root = this.ampdoc_.getRootNode();

      var exitHandler = function exitHandler() {
        return _this10.onFullscreenExit_();
      };

      this.unlisteners_.push(listen(root, 'webkitfullscreenchange', exitHandler), listen(root, 'mozfullscreenchange', exitHandler), listen(root, 'fullscreenchange', exitHandler), listen(root, 'MSFullscreenChange', exitHandler));
    }
    /**
     * @return {boolean}
     * @visibleForTesting
     */

  }, {
    key: "isInLandscape",
    value: function isInLandscape() {
      return isLandscape(this.ampdoc_.win);
    }
    /**
     * @param {!AmpElement} video
     * @return {boolean}
     * @private
     */

  }, {
    key: "canFullscreen_",
    value: function canFullscreen_(video) {
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
    /** @private */

  }, {
    key: "onFullscreenExit_",
    value: function onFullscreenExit_() {
      this.currentlyInFullscreen_ = null;
    }
    /** @private */

  }, {
    key: "installOrientationObserver_",
    value: function installOrientationObserver_() {
      var _this11 = this;

      // TODO(alanorozco) Update based on support
      var win = this.ampdoc_.win;
      var screen = win.screen;

      // Chrome considers 'orientationchange' to be an untrusted event, but
      // 'change' on screen.orientation is considered a user interaction.
      // We still need to listen to 'orientationchange' on Chrome in order to
      // exit fullscreen since 'change' does not fire in this case.
      if (screen && 'orientation' in screen) {
        var orient =
        /** @type {!ScreenOrientation} */
        screen.orientation;
        this.unlisteners_.push(listen(orient, 'change', function () {
          return _this11.onRotation_();
        }));
      }

      // iOS Safari does not have screen.orientation but classifies
      // 'orientationchange' as a user interaction.
      this.unlisteners_.push(listen(win, 'orientationchange', function () {
        return _this11.onRotation_();
      }));
    }
    /** @private */

  }, {
    key: "onRotation_",
    value: function onRotation_() {
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
     */

  }, {
    key: "enter_",
    value: function enter_(video) {
      var platform = Services.platformFor(this.ampdoc_.win);
      this.currentlyInFullscreen_ = video;

      if (platform.isAndroid() && platform.isChrome()) {
        // Chrome on Android somehow knows what we're doing and executes a nice
        // transition by default. Delegating to browser.
        video.fullscreenEnter();
        return;
      }

      this.scrollIntoIfNotVisible_(video).then(function () {
        return video.fullscreenEnter();
      });
    }
    /**
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @private
     */

  }, {
    key: "exit_",
    value: function exit_(video) {
      this.currentlyInFullscreen_ = null;
      this.scrollIntoIfNotVisible_(video, 'center').then(function () {
        return video.fullscreenExit();
      });
    }
    /**
     * Scrolls to a video if it's not in view.
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @param {?string=} optPos
     * @return {!Promise}
     * @private
     */

  }, {
    key: "scrollIntoIfNotVisible_",
    value: function scrollIntoIfNotVisible_(video, optPos) {
      if (optPos === void 0) {
        optPos = null;
      }

      var element = video.element;
      var viewport = this.getViewport_();
      return this.onceOrientationChanges_().then(function () {
        return measureIntersection(element);
      }).then(function (_ref2) {
        var boundingClientRect = _ref2.boundingClientRect;
        var bottom = boundingClientRect.bottom,
            top = boundingClientRect.top;
        var vh = viewport.getSize().height;
        var fullyVisible = top >= 0 && bottom <= vh;

        if (fullyVisible) {
          return _resolvedPromise2();
        }

        var pos = optPos ? dev().assertString(optPos) : bottom > vh ? 'bottom' : 'top';
        return viewport.animateScrollIntoView(element, pos);
      });
    }
    /**
     * @private
     * @return {./viewport/viewport-interface.ViewportInterface}
     */

  }, {
    key: "getViewport_",
    value: function getViewport_() {
      return Services.viewportForDoc(this.ampdoc_);
    }
    /**
     * @private
     * @return {!Promise}
     */

  }, {
    key: "onceOrientationChanges_",
    value: function onceOrientationChanges_() {
      var magicNumber = 330;
      return Services.timerFor(this.ampdoc_.win).promise(magicNumber);
    }
    /**
     * @private
     * @return {!Promise<?../video-interface.VideoOrBaseElementDef>}
     */

  }, {
    key: "selectBestCenteredInPortrait_",
    value: function selectBestCenteredInPortrait_() {
      var _this12 = this;

      if (this.isInLandscape()) {
        return Promise.resolve(this.currentlyCentered_);
      }

      this.currentlyCentered_ = null;
      var intersectionsPromise = this.entries_.filter(this.boundIncludeOnlyPlaying_).map(function (e) {
        return measureIntersection(e.element);
      });
      return Promise.all(intersectionsPromise).then(function (intersections) {
        var selected = intersections.sort(_this12.boundCompareEntries_)[0];

        if (selected && selected.intersectionRatio > MIN_VISIBILITY_RATIO_FOR_AUTOPLAY) {
          return selected.target.getImpl().then(function (video) {
            return _this12.currentlyCentered_ = video;
          });
        }

        return _this12.currentlyCentered_;
      });
    }
    /**
     * Compares two videos in order to sort them by "best centered".
     * @param {!IntersectionObserverEntry} a
     * @param {!IntersectionObserverEntry} b
     * @return {number}
     */

  }, {
    key: "compareEntries_",
    value: function compareEntries_(a, b) {
      var rectA = a.boundingClientRect,
          ratioA = a.intersectionRatio;
      var rectB = b.boundingClientRect,
          ratioB = b.intersectionRatio;
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
     */

  }, {
    key: "getPlayingState_",
    value: function getPlayingState_(video) {
      return this.manager_.getPlayingState(
      /** @type {!../video-interface.VideoInterface} */
      video);
    }
  }]);

  return AutoFullscreenManager;
}();

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
  return clamp(calculateIdealPercentageFrequencyMs(durationSeconds), PERCENTAGE_FREQUENCY_MIN_MS, PERCENTAGE_FREQUENCY_MAX_MS);
}

/**
 * Handle cases such as livestreams or videos with no duration information is
 * available, where 1 second is the default duration for some video players.
 * @param {?number=} duration
 * @return {boolean}
 */
var isDurationFiniteNonZero = function isDurationFiniteNonZero(duration) {
  return !!duration && !isNaN(duration) && duration > 1;
};

/** @visibleForTesting */
export var AnalyticsPercentageTracker = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!VideoEntry} entry
   */
  function AnalyticsPercentageTracker(win, entry) {
    _classCallCheck(this, AnalyticsPercentageTracker);

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

  /** @public */
  _createClass(AnalyticsPercentageTracker, [{
    key: "start",
    value: function start() {
      var _this13 = this;

      var element = this.entry_.video.element;
      this.stop();
      this.unlisteners_ = this.unlisteners_ || [];

      // If the video has already emitted LOADEDMETADATA, the event below
      // will never fire, so we check if it's already available here.
      if (this.hasDuration_()) {
        this.calculate_(this.triggerId_);
      } else {
        this.unlisteners_.push(listenOnce(element, VideoEvents.LOADEDMETADATA, function () {
          if (_this13.hasDuration_()) {
            _this13.calculate_(_this13.triggerId_);
          }
        }));
      }

      this.unlisteners_.push(listen(element, VideoEvents.ENDED, function () {
        if (_this13.hasDuration_()) {
          _this13.maybeTrigger_(
          /* normalizedPercentage */
          100);
        }
      }));
    }
    /** @public */

  }, {
    key: "stop",
    value: function stop() {
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
     */

  }, {
    key: "hasDuration_",
    value: function hasDuration_() {
      var video = this.entry_.video;
      var duration = video.getDuration();

      if (!isDurationFiniteNonZero(duration)) {
        return false;
      }

      if (calculateIdealPercentageFrequencyMs(duration) < PERCENTAGE_FREQUENCY_MIN_MS) {
        var bestResultLength = Math.ceil(PERCENTAGE_FREQUENCY_MIN_MS * (100 / PERCENTAGE_INTERVAL) / 1000);
        this.warnForTesting_('This video is too short for `video-percentage-played`. ' + 'Reports may be innacurate. For best results, use videos over', bestResultLength, 'seconds long.', video.element);
      }

      return true;
    }
    /**
     * @param  {...*} args
     * @private
     */

  }, {
    key: "warnForTesting_",
    value: function warnForTesting_() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      user().warn.apply(user(), [TAG].concat(args));
    }
    /**
     * @param {number=} triggerId
     * @private
     */

  }, {
    key: "calculate_",
    value: function calculate_(triggerId) {
      var _this14 = this;

      if (triggerId != this.triggerId_) {
        return;
      }

      var entry = this.entry_,
          timer = this.timer_;
      var video = entry.video;

      var calculateAgain = function calculateAgain() {
        return _this14.calculate_(triggerId);
      };

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
      var percentage = video.getCurrentTime() / duration * 100;
      var normalizedPercentage = Math.floor(percentage / PERCENTAGE_INTERVAL) * PERCENTAGE_INTERVAL;
      devAssert(isFiniteNumber(normalizedPercentage));
      this.maybeTrigger_(normalizedPercentage);
      timer.delay(calculateAgain, frequencyMs);
    }
    /**
     * @param {number} normalizedPercentage
     * @private
     */

  }, {
    key: "maybeTrigger_",
    value: function maybeTrigger_(normalizedPercentage) {
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
     */

  }, {
    key: "analyticsEventForTesting_",
    value: function analyticsEventForTesting_(normalizedPercentage) {
      analyticsEvent(this.entry_, VideoAnalyticsEvents.PERCENTAGE_PLAYED, {
        'normalizedPercentage': normalizedPercentage.toString()
      });
    }
  }]);

  return AnalyticsPercentageTracker;
}();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZGVvLW1hbmFnZXItaW1wbC5qcyJdLCJuYW1lcyI6WyJBY3Rpb25UcnVzdCIsImRpc3BhdGNoQ3VzdG9tRXZlbnQiLCJyZW1vdmVFbGVtZW50IiwibWVhc3VyZUludGVyc2VjdGlvbiIsImNyZWF0ZVZpZXdwb3J0T2JzZXJ2ZXIiLCJ0b2dnbGUiLCJnZXRJbnRlcm5hbFZpZGVvRWxlbWVudEZvciIsImlzQXV0b3BsYXlTdXBwb3J0ZWQiLCJjbGFtcCIsImlzRmluaXRlTnVtYmVyIiwib25jZSIsImRpY3QiLCJtYXAiLCJTZXJ2aWNlcyIsIlZpZGVvU2Vzc2lvbk1hbmFnZXIiLCJyZW5kZXJJY29uIiwicmVuZGVySW50ZXJhY3Rpb25PdmVybGF5IiwiaW5zdGFsbEF1dG9wbGF5U3R5bGVzRm9yRG9jIiwiY3JlYXRlQ3VzdG9tRXZlbnQiLCJnZXREYXRhIiwibGlzdGVuIiwibGlzdGVuT25jZSIsImRldiIsImRldkFzc2VydCIsInVzZXIiLCJ1c2VyQXNzZXJ0IiwiRU1QVFlfTUVUQURBVEEiLCJwYXJzZUZhdmljb24iLCJwYXJzZU9nSW1hZ2UiLCJwYXJzZVNjaGVtYUltYWdlIiwic2V0TWVkaWFTZXNzaW9uIiwidmFsaWRhdGVNZWRpYU1ldGFkYXRhIiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyIsIk1JTl9WSVNJQklMSVRZX1JBVElPX0ZPUl9BVVRPUExBWSIsIlBsYXlpbmdTdGF0ZXMiLCJWaWRlb0FuYWx5dGljc0V2ZW50cyIsIlZpZGVvQXR0cmlidXRlcyIsIlZpZGVvRXZlbnRzIiwiVmlkZW9TZXJ2aWNlU2lnbmFscyIsInNldElzTWVkaWFDb21wb25lbnQiLCJ1c2VySW50ZXJhY3RlZFdpdGgiLCJ2aWRlb0FuYWx5dGljc0N1c3RvbUV2ZW50VHlwZUtleSIsIlRBRyIsIlNFQ09ORFNfUExBWUVEX01JTl9ERUxBWSIsIlZpZGVvTWFuYWdlciIsImFtcGRvYyIsImluc3RhbGxBdXRvcGxheVN0eWxlcyIsImVudHJpZXNfIiwidmlld3BvcnRPYnNlcnZlcl8iLCJsYXN0Rm91bmRFbnRyeV8iLCJ0aW1lcl8iLCJ0aW1lckZvciIsIndpbiIsImFjdGlvbnNfIiwiYWN0aW9uU2VydmljZUZvckRvYyIsImdldEhlYWROb2RlIiwiYm91bmRTZWNvbmRzUGxheWluZ18iLCJzZWNvbmRzUGxheWluZ18iLCJnZXRBdXRvRnVsbHNjcmVlbk1hbmFnZXJfIiwiQXV0b0Z1bGxzY3JlZW5NYW5hZ2VyIiwiZGVsYXkiLCJkaXNwb3NlIiwiZGlzY29ubmVjdCIsImkiLCJsZW5ndGgiLCJlbnRyeSIsImdldFBsYXlpbmdTdGF0ZSIsIlBBVVNFRCIsImFuYWx5dGljc0V2ZW50IiwiU0VDT05EU19QTEFZRUQiLCJ0aW1lVXBkYXRlQWN0aW9uRXZlbnRfIiwibmFtZSIsImN1cnJlbnRUaW1lIiwidmlkZW8iLCJnZXRDdXJyZW50VGltZSIsImR1cmF0aW9uIiwiZ2V0RHVyYXRpb24iLCJwZXJjIiwiZXZlbnQiLCJ0cmlnZ2VyIiwiZWxlbWVudCIsIkxPVyIsInZpZGVvQkUiLCJyZWdpc3RlckNvbW1vbkFjdGlvbnNfIiwic3VwcG9ydHNQbGF0Zm9ybSIsImdldEVudHJ5T3JOdWxsXyIsInZpZXdwb3J0Q2FsbGJhY2siLCJyZWNvcmRzIiwiZm9yRWFjaCIsImlzSW50ZXJzZWN0aW5nIiwidGFyZ2V0IiwiZ2V0RW50cnlfIiwidXBkYXRlVmlzaWJpbGl0eSIsInRocmVzaG9sZCIsIm9ic2VydmUiLCJSRUxPQUQiLCJ2aWRlb0xvYWRlZCIsIlZpZGVvRW50cnkiLCJwdXNoIiwiUkVHSVNURVJFRCIsInNpZ25hbHMiLCJzaWduYWwiLCJjbGFzc0xpc3QiLCJhZGQiLCJ0cnVzdCIsInJlZ2lzdGVyQWN0aW9uIiwicGxheSIsInBhdXNlIiwibXV0ZSIsInVubXV0ZSIsImZ1bGxzY3JlZW5FbnRlciIsImFjdGlvbiIsImZuIiwidmlkZW9PckVsZW1lbnQiLCJpc0VudHJ5Rm9yIiwicmVnaXN0ZXIiLCJpZCIsInByb3BlcnR5Iiwicm9vdCIsImdldFJvb3ROb2RlIiwidmlkZW9FbGVtZW50IiwiYXNzZXJ0RWxlbWVudCIsImdldEVsZW1lbnRCeUlkIiwiZ2V0QW5hbHl0aWNzRGV0YWlscyIsInRoZW4iLCJkZXRhaWxzIiwiaXNNdXRlZCIsInVzZXJJbnRlcmFjdGVkIiwiaXNSb2xsaW5nQWQiLCJlbnRyeUJlaW5nUGxheWVkIiwiaXNQbGF5YmFja01hbmFnZWQiLCJQTEFZSU5HX01BTlVBTCIsIm1hbmFnZXIiLCJtYW5hZ2VyXyIsImFtcGRvY18iLCJtYW5hZ2VQbGF5YmFja18iLCJsb2FkZWRfIiwiaXNQbGF5aW5nXyIsImlzUm9sbGluZ0FkXyIsImlzVmlzaWJsZV8iLCJhY3Rpb25TZXNzaW9uTWFuYWdlcl8iLCJvblNlc3Npb25FbmQiLCJTRVNTSU9OIiwidmlzaWJpbGl0eVNlc3Npb25NYW5hZ2VyXyIsIlNFU1NJT05fVklTSUJMRSIsImdldEFuYWx5dGljc1BlcmNlbnRhZ2VUcmFja2VyXyIsIkFuYWx5dGljc1BlcmNlbnRhZ2VUcmFja2VyIiwicGxheUNhbGxlZEJ5QXV0b3BsYXlfIiwicGF1c2VDYWxsZWRCeUF1dG9wbGF5XyIsImludGVybmFsRWxlbWVudF8iLCJtdXRlZF8iLCJoYXNTZWVuUGxheUV2ZW50XyIsImhhc0F1dG9wbGF5IiwiaGFzQXR0cmlidXRlIiwiQVVUT1BMQVkiLCJtZXRhZGF0YV8iLCJib3VuZE1lZGlhc2Vzc2lvblBsYXlfIiwiYm91bmRNZWRpYXNlc3Npb25QYXVzZV8iLCJMT0FEIiwiUEFVU0UiLCJ2aWRlb1BhdXNlZF8iLCJQTEFZIiwiUExBWUlORyIsInZpZGVvUGxheWVkXyIsIk1VVEVEIiwiVU5NVVRFRCIsInBhdXNlT3RoZXJWaWRlb3MiLCJDVVNUT01fVElDSyIsImUiLCJkYXRhIiwiZXZlbnRUeXBlIiwibG9nQ3VzdG9tQW5hbHl0aWNzXyIsIkVOREVEIiwiQURfU1RBUlQiLCJBRF9FTkQiLCJ3aGVuU2lnbmFsIiwib25SZWdpc3Rlcl8iLCJmaXJzdFBsYXlFdmVudE9yTm9vcF8iLCJmaXJzdFBsYXkiLCJhY3Rpb25zIiwibGlzdGVuRm9yUGxheWJhY2tEZWxlZ2F0aW9uXyIsInN0b3AiLCJ2YXJzIiwicHJlZml4ZWRWYXJzIiwiT2JqZWN0Iiwia2V5cyIsImtleSIsIkNVU1RPTSIsIlBMQVlCQUNLX0RFTEVHQVRFRCIsInJlcXVpcmVzQXV0b0Z1bGxzY3JlZW5fIiwicmVnaXN0ZXJGb3JBdXRvRnVsbHNjcmVlbiIsImF1dG9wbGF5VmlkZW9CdWlsdF8iLCJwcmVpbXBsZW1lbnRzQXV0b0Z1bGxzY3JlZW4iLCJST1RBVEVfVE9fRlVMTFNDUkVFTiIsImlzSW50ZXJhY3RpdmUiLCJwcmVpbXBsZW1lbnRzTWVkaWFTZXNzaW9uQVBJIiwiY29udGFpbnMiLCJiZWdpblNlc3Npb24iLCJlbmRTZXNzaW9uIiwiZmlsbE1lZGlhU2Vzc2lvbk1ldGFkYXRhXyIsInN0YXJ0IiwibG9hZGVkVmlkZW9WaXNpYmlsaXR5Q2hhbmdlZF8iLCJnZXRNZXRhZGF0YSIsImRvYyIsImRvY3VtZW50IiwiYXJ0d29yayIsInBvc3RlclVybCIsInRpdGxlIiwiZ2V0QXR0cmlidXRlIiwiaXNWaXNpYmxlIiwiY2FuQXV0b3BsYXkiLCJhdXRvcGxheUxvYWRlZFZpZGVvVmlzaWJpbGl0eUNoYW5nZWRfIiwibm9uQXV0b3BsYXlMb2FkZWRWaWRlb1Zpc2liaWxpdHlDaGFuZ2VkXyIsImhpZGVDb250cm9scyIsInNob3dDb250cm9scyIsImluc3RhbGxBdXRvcGxheUVsZW1lbnRzXyIsIk5PX0FVRElPIiwiZ2V0IiwiVVNFUl9JTlRFUkFDVEVEIiwiYW5pbWF0aW9uIiwiY2hpbGRyZW4iLCJ0b2dnbGVFbGVtZW50cyIsInNob3VsZERpc3BsYXkiLCJtdXRhdGVFbGVtZW50U2tpcFJlbWVhc3VyZSIsImNoaWxkIiwidG9nZ2xlQW5pbWF0aW9uIiwiaXNQbGF5aW5nIiwidW5saXN0ZW5lcnMiLCJtYXNrIiwiYXBwZW5kQ2hpbGQiLCJ1bmxpc3RlbmVyIiwid2FzVmlzaWJsZSIsInZpZGVvVmlzaWJpbGl0eUNoYW5nZWRfIiwiUExBWUlOR19BVVRPIiwiUHJvbWlzZSIsImFsbCIsInJlc3BvbnNlcyIsImludGVyc2VjdGlvbiIsImJvdW5kaW5nQ2xpZW50UmVjdCIsImhlaWdodCIsIndpZHRoIiwiYXV0b3BsYXkiLCJwbGF5ZWRSYW5nZXMiLCJnZXRQbGF5ZWRSYW5nZXMiLCJwbGF5ZWRUb3RhbCIsInJlZHVjZSIsImFjYyIsInJhbmdlIiwiSlNPTiIsInN0cmluZ2lmeSIsInN1cHBvcnRzRnVsbHNjcmVlblZpYUFwaSIsInRhZ05hbWUiLCJ0b0xvd2VyQ2FzZSIsImN1cnJlbnRseUluRnVsbHNjcmVlbl8iLCJjdXJyZW50bHlDZW50ZXJlZF8iLCJ1bmxpc3RlbmVyc18iLCJib3VuZFNlbGVjdEJlc3RDZW50ZXJlZF8iLCJzZWxlY3RCZXN0Q2VudGVyZWRJblBvcnRyYWl0XyIsImJvdW5kSW5jbHVkZU9ubHlQbGF5aW5nXyIsImdldFBsYXlpbmdTdGF0ZV8iLCJib3VuZENvbXBhcmVFbnRyaWVzXyIsImEiLCJiIiwiY29tcGFyZUVudHJpZXNfIiwiaW5zdGFsbE9yaWVudGF0aW9uT2JzZXJ2ZXJfIiwiaW5zdGFsbEZ1bGxzY3JlZW5MaXN0ZW5lcl8iLCJ1bmxpc3RlbiIsImNhbkZ1bGxzY3JlZW5fIiwiZXhpdEhhbmRsZXIiLCJvbkZ1bGxzY3JlZW5FeGl0XyIsImlzTGFuZHNjYXBlIiwiaW50ZXJuYWxFbGVtZW50IiwicGxhdGZvcm0iLCJwbGF0Zm9ybUZvciIsImlzSW9zIiwiaXNTYWZhcmkiLCJzY3JlZW4iLCJvcmllbnQiLCJvcmllbnRhdGlvbiIsIm9uUm90YXRpb25fIiwiaXNJbkxhbmRzY2FwZSIsImVudGVyXyIsImV4aXRfIiwiaXNBbmRyb2lkIiwiaXNDaHJvbWUiLCJzY3JvbGxJbnRvSWZOb3RWaXNpYmxlXyIsImZ1bGxzY3JlZW5FeGl0Iiwib3B0UG9zIiwidmlld3BvcnQiLCJnZXRWaWV3cG9ydF8iLCJvbmNlT3JpZW50YXRpb25DaGFuZ2VzXyIsImJvdHRvbSIsInRvcCIsInZoIiwiZ2V0U2l6ZSIsImZ1bGx5VmlzaWJsZSIsInBvcyIsImFzc2VydFN0cmluZyIsImFuaW1hdGVTY3JvbGxJbnRvVmlldyIsInZpZXdwb3J0Rm9yRG9jIiwibWFnaWNOdW1iZXIiLCJwcm9taXNlIiwicmVzb2x2ZSIsImludGVyc2VjdGlvbnNQcm9taXNlIiwiZmlsdGVyIiwiaW50ZXJzZWN0aW9ucyIsInNlbGVjdGVkIiwic29ydCIsImludGVyc2VjdGlvblJhdGlvIiwiZ2V0SW1wbCIsInJlY3RBIiwicmF0aW9BIiwicmVjdEIiLCJyYXRpb0IiLCJyYXRpb1RvbGVyYW5jZSIsInJhdGlvRGVsdGEiLCJNYXRoIiwiYWJzIiwiY2VudGVyQSIsImNlbnRlckRpc3QiLCJjZW50ZXJCIiwicmVjdCIsImNlbnRlclkiLCJjZW50ZXJWaWV3cG9ydCIsInR5cGUiLCJzdGFydHNXaXRoIiwiUEVSQ0VOVEFHRV9JTlRFUlZBTCIsIlBFUkNFTlRBR0VfRlJFUVVFTkNZX1dIRU5fUEFVU0VEX01TIiwiUEVSQ0VOVEFHRV9GUkVRVUVOQ1lfTUlOX01TIiwiUEVSQ0VOVEFHRV9GUkVRVUVOQ1lfTUFYX01TIiwiY2FsY3VsYXRlSWRlYWxQZXJjZW50YWdlRnJlcXVlbmN5TXMiLCJkdXJhdGlvblNlY29uZHMiLCJjYWxjdWxhdGVBY3R1YWxQZXJjZW50YWdlRnJlcXVlbmN5TXMiLCJpc0R1cmF0aW9uRmluaXRlTm9uWmVybyIsImlzTmFOIiwiZW50cnlfIiwibGFzdF8iLCJ0cmlnZ2VySWRfIiwiaGFzRHVyYXRpb25fIiwiY2FsY3VsYXRlXyIsIkxPQURFRE1FVEFEQVRBIiwibWF5YmVUcmlnZ2VyXyIsInBvcCIsImJlc3RSZXN1bHRMZW5ndGgiLCJjZWlsIiwid2FybkZvclRlc3RpbmdfIiwiYXJncyIsIndhcm4iLCJhcHBseSIsImNvbmNhdCIsInRyaWdnZXJJZCIsInRpbWVyIiwiY2FsY3VsYXRlQWdhaW4iLCJmcmVxdWVuY3lNcyIsInBlcmNlbnRhZ2UiLCJub3JtYWxpemVkUGVyY2VudGFnZSIsImZsb29yIiwiYW5hbHl0aWNzRXZlbnRGb3JUZXN0aW5nXyIsIlBFUkNFTlRBR0VfUExBWUVEIiwidG9TdHJpbmciLCJvcHRfdmFycyIsImFzc2lnbiIsImluc3RhbGxWaWRlb01hbmFnZXJGb3JEb2MiLCJub2RlT3JEb2MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFdBQVI7QUFDQSxTQUFRQyxtQkFBUixFQUE2QkMsYUFBN0I7QUFDQSxTQUFRQyxtQkFBUjtBQUNBLFNBQVFDLHNCQUFSO0FBQ0EsU0FBUUMsTUFBUjtBQUNBLFNBQVFDLDBCQUFSLEVBQW9DQyxtQkFBcEM7QUFDQSxTQUFRQyxLQUFSO0FBQ0EsU0FBUUMsY0FBUjtBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyxJQUFSLEVBQWNDLEdBQWQ7QUFFQSxTQUFRQyxRQUFSO0FBRUEsU0FBUUMsbUJBQVI7QUFDQSxTQUFRQyxVQUFSLEVBQW9CQyx3QkFBcEI7QUFDQSxTQUFRQywyQkFBUjtBQUVBLFNBQVFDLGlCQUFSLEVBQTJCQyxPQUEzQixFQUFvQ0MsTUFBcEMsRUFBNENDLFVBQTVDO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxTQUFiLEVBQXdCQyxJQUF4QixFQUE4QkMsVUFBOUI7QUFDQSxTQUNFQyxjQURGLEVBRUVDLFlBRkYsRUFHRUMsWUFIRixFQUlFQyxnQkFKRixFQUtFQyxlQUxGLEVBTUVDLHFCQU5GO0FBUUEsU0FBUUMsNEJBQVI7QUFDQSxTQUNFQyxpQ0FERixFQUVFQyxhQUZGLEVBR0VDLG9CQUhGLEVBSUVDLGVBSkYsRUFLRUMsV0FMRixFQU1FQyxtQkFORixFQU9FQyxtQkFQRixFQVFFQyxrQkFSRixFQVNFQyxnQ0FURjs7QUFZQTtBQUNBLElBQU1DLEdBQUcsR0FBRyxlQUFaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsd0JBQXdCLEdBQUcsSUFBakM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Es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QUNEOztBQUVELFdBQUtuQixLQUFMLEdBQWFtQixvQkFBYjtBQUVBLFdBQUtFLHlCQUFMLENBQStCRixvQkFBL0I7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQTNLQTtBQUFBO0FBQUEsV0E0S0UsbUNBQTBCQSxvQkFBMUIsRUFBZ0Q7QUFDOUMvUixNQUFBQSxjQUFjLENBQUMsS0FBSzJRLE1BQU4sRUFBYzVTLG9CQUFvQixDQUFDbVUsaUJBQW5DLEVBQXNEO0FBQ2xFLGdDQUF3Qkgsb0JBQW9CLENBQUNJLFFBQXJCO0FBRDBDLE9BQXRELENBQWQ7QUFHRDtBQWhMSDs7QUFBQTtBQUFBOztBQW1MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTblMsY0FBVCxDQUF3QkgsS0FBeEIsRUFBK0J5RyxTQUEvQixFQUEwQzhMLFFBQTFDLEVBQW9EO0FBQ2xELE1BQU8vUixLQUFQLEdBQWdCUixLQUFoQixDQUFPUSxLQUFQO0FBRUFSLEVBQUFBLEtBQUssQ0FBQzBELG1CQUFOLEdBQTRCQyxJQUE1QixDQUFpQyxVQUFDQyxPQUFELEVBQWE7QUFDNUMsUUFBSTJPLFFBQUosRUFBYztBQUNaaEwsTUFBQUEsTUFBTSxDQUFDaUwsTUFBUCxDQUFjNU8sT0FBZCxFQUF1QjJPLFFBQXZCO0FBQ0Q7O0FBQ0R2VyxJQUFBQSxtQkFBbUIsQ0FBQ3dFLEtBQUssQ0FBQ08sT0FBUCxFQUFnQjBGLFNBQWhCLEVBQTJCN0MsT0FBM0IsQ0FBbkI7QUFDRCxHQUxEO0FBTUQ7O0FBRUQ7QUFDQSxPQUFPLFNBQVM2Tyx5QkFBVCxDQUFtQ0MsU0FBbkMsRUFBOEM7QUFDbkQzVSxFQUFBQSw0QkFBNEIsQ0FBQzJVLFNBQUQsRUFBWSxlQUFaLEVBQTZCL1QsWUFBN0IsQ0FBNUI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0FjdGlvblRydXN0fSBmcm9tICcjY29yZS9jb25zdGFudHMvYWN0aW9uLWNvbnN0YW50cyc7XG5pbXBvcnQge2Rpc3BhdGNoQ3VzdG9tRXZlbnQsIHJlbW92ZUVsZW1lbnR9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge21lYXN1cmVJbnRlcnNlY3Rpb259IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvaW50ZXJzZWN0aW9uJztcbmltcG9ydCB7Y3JlYXRlVmlld3BvcnRPYnNlcnZlcn0gZnJvbSAnI2NvcmUvZG9tL2xheW91dC92aWV3cG9ydC1vYnNlcnZlcic7XG5pbXBvcnQge3RvZ2dsZX0gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7Z2V0SW50ZXJuYWxWaWRlb0VsZW1lbnRGb3IsIGlzQXV0b3BsYXlTdXBwb3J0ZWR9IGZyb20gJyNjb3JlL2RvbS92aWRlbyc7XG5pbXBvcnQge2NsYW1wfSBmcm9tICcjY29yZS9tYXRoJztcbmltcG9ydCB7aXNGaW5pdGVOdW1iZXJ9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7b25jZX0gZnJvbSAnI2NvcmUvdHlwZXMvZnVuY3Rpb24nO1xuaW1wb3J0IHtkaWN0LCBtYXB9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcblxuaW1wb3J0IHtWaWRlb1Nlc3Npb25NYW5hZ2VyfSBmcm9tICcuL3ZpZGVvLXNlc3Npb24tbWFuYWdlcic7XG5pbXBvcnQge3JlbmRlckljb24sIHJlbmRlckludGVyYWN0aW9uT3ZlcmxheX0gZnJvbSAnLi92aWRlby9hdXRvcGxheSc7XG5pbXBvcnQge2luc3RhbGxBdXRvcGxheVN0eWxlc0ZvckRvY30gZnJvbSAnLi92aWRlby9pbnN0YWxsLWF1dG9wbGF5LXN0eWxlcyc7XG5cbmltcG9ydCB7Y3JlYXRlQ3VzdG9tRXZlbnQsIGdldERhdGEsIGxpc3RlbiwgbGlzdGVuT25jZX0gZnJvbSAnLi4vZXZlbnQtaGVscGVyJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnQsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge1xuICBFTVBUWV9NRVRBREFUQSxcbiAgcGFyc2VGYXZpY29uLFxuICBwYXJzZU9nSW1hZ2UsXG4gIHBhcnNlU2NoZW1hSW1hZ2UsXG4gIHNldE1lZGlhU2Vzc2lvbixcbiAgdmFsaWRhdGVNZWRpYU1ldGFkYXRhLFxufSBmcm9tICcuLi9tZWRpYXNlc3Npb24taGVscGVyJztcbmltcG9ydCB7cmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvY30gZnJvbSAnLi4vc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7XG4gIE1JTl9WSVNJQklMSVRZX1JBVElPX0ZPUl9BVVRPUExBWSxcbiAgUGxheWluZ1N0YXRlcyxcbiAgVmlkZW9BbmFseXRpY3NFdmVudHMsXG4gIFZpZGVvQXR0cmlidXRlcyxcbiAgVmlkZW9FdmVudHMsXG4gIFZpZGVvU2VydmljZVNpZ25hbHMsXG4gIHNldElzTWVkaWFDb21wb25lbnQsXG4gIHVzZXJJbnRlcmFjdGVkV2l0aCxcbiAgdmlkZW9BbmFseXRpY3NDdXN0b21FdmVudFR5cGVLZXksXG59IGZyb20gJy4uL3ZpZGVvLWludGVyZmFjZSc7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICd2aWRlby1tYW5hZ2VyJztcblxuLyoqXG4gKiBAcHJpdmF0ZSB7bnVtYmVyfSBUaGUgbWluaW11bSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmV0d2VlbiBlYWNoXG4gKiB2aWRlby1zZWNvbmRzLXBsYXllZCBhbmFseXRpY3MgZXZlbnQuXG4gKi9cbmNvbnN0IFNFQ09ORFNfUExBWUVEX01JTl9ERUxBWSA9IDEwMDA7XG5cbi8qKlxuICogVmlkZW9NYW5hZ2VyIGtlZXBzIHRyYWNrIG9mIGFsbCBBTVAgdmlkZW8gcGxheWVycyB0aGF0IGltcGxlbWVudFxuICogdGhlIGNvbW1vbiBWaWRlbyBBUEkge0BzZWUgLi4vdmlkZW8taW50ZXJmYWNlLlZpZGVvSW50ZXJmYWNlfS5cbiAqXG4gKiBJdCBpcyByZXNwb25zaWJsZSBmb3IgcHJvdmlkaW5nIGEgdW5pZmllZCB1c2VyIGV4cGVyaWVuY2UgYW5kIGFuYWx5dGljcyBmb3JcbiAqIGFsbCB2aWRlb3Mgd2l0aGluIGEgZG9jdW1lbnQuXG4gKlxuICogQGltcGxlbWVudHMgey4uL3NlcnZpY2UuRGlzcG9zYWJsZX1cbiAqL1xuZXhwb3J0IGNsYXNzIFZpZGVvTWFuYWdlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICAvKiogQGNvbnN0IHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9ICAqL1xuICAgIHRoaXMuYW1wZG9jID0gYW1wZG9jO1xuXG4gICAgLyoqIEBjb25zdCAqL1xuICAgIHRoaXMuaW5zdGFsbEF1dG9wbGF5U3R5bGVzID0gb25jZSgoKSA9PlxuICAgICAgaW5zdGFsbEF1dG9wbGF5U3R5bGVzRm9yRG9jKHRoaXMuYW1wZG9jKVxuICAgICk7XG5cbiAgICAvKiogQHByaXZhdGUgez9BcnJheTwhVmlkZW9FbnRyeT59ICovXG4gICAgdGhpcy5lbnRyaWVzXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUge0ludGVyc2VjdGlvbk9ic2VydmVyfSAqL1xuICAgIHRoaXMudmlld3BvcnRPYnNlcnZlcl8gPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogS2VlcHMgbGFzdCBmb3VuZCBlbnRyeSBhcyBhIHNtYWxsIG9wdGltaXphdGlvbiBmb3IgbXVsdGlwbGUgc3RhdGUgY2FsbHNcbiAgICAgKiBkdXJpbmcgb25lIHRhc2suXG4gICAgICogQHByaXZhdGUgez9WaWRlb0VudHJ5fVxuICAgICAqL1xuICAgIHRoaXMubGFzdEZvdW5kRW50cnlfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLnRpbWVyXyA9IFNlcnZpY2VzLnRpbWVyRm9yKGFtcGRvYy53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMuYWN0aW9uc18gPSBTZXJ2aWNlcy5hY3Rpb25TZXJ2aWNlRm9yRG9jKGFtcGRvYy5nZXRIZWFkTm9kZSgpKTtcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGNvbnN0XG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHRoaXMuYm91bmRTZWNvbmRzUGxheWluZ18gPSAoKSA9PiB0aGlzLnNlY29uZHNQbGF5aW5nXygpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7ZnVuY3Rpb24oKTohQXV0b0Z1bGxzY3JlZW5NYW5hZ2VyfSAqL1xuICAgIHRoaXMuZ2V0QXV0b0Z1bGxzY3JlZW5NYW5hZ2VyXyA9IG9uY2UoXG4gICAgICAoKSA9PiBuZXcgQXV0b0Z1bGxzY3JlZW5NYW5hZ2VyKHRoaXMuYW1wZG9jLCB0aGlzKVxuICAgICk7XG5cbiAgICAvLyBUT0RPKGN2aWFsaXosICMxMDU5OSk6IEl0IHdvdWxkIGJlIG5pY2UgdG8gb25seSBjcmVhdGUgdGhlIHRpbWVyXG4gICAgLy8gaWYgdmlkZW8gYW5hbHl0aWNzIGFyZSBwcmVzZW50LCBzaW5jZSB0aGUgdGltZXIgaXMgbm90IG5lZWRlZCBpZlxuICAgIC8vIHZpZGVvIGFuYWx5dGljcyBhcmUgbm90IHByZXNlbnQuXG4gICAgdGhpcy50aW1lcl8uZGVsYXkodGhpcy5ib3VuZFNlY29uZHNQbGF5aW5nXywgU0VDT05EU19QTEFZRURfTUlOX0RFTEFZKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmdldEF1dG9GdWxsc2NyZWVuTWFuYWdlcl8oKS5kaXNwb3NlKCk7XG4gICAgdGhpcy52aWV3cG9ydE9ic2VydmVyXy5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy52aWV3cG9ydE9ic2VydmVyXyA9IG51bGw7XG5cbiAgICBpZiAoIXRoaXMuZW50cmllc18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVudHJpZXNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllc19baV07XG4gICAgICBlbnRyeS5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVhY2ggc2Vjb25kLCB0cmlnZ2VyIHZpZGVvLXNlY29uZHMtcGxheWVkIGZvciB2aWRlb3MgdGhhdCBhcmUgcGxheWluZ1xuICAgKiBhdCB0cmlnZ2VyIHRpbWUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzZWNvbmRzUGxheWluZ18oKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVudHJpZXNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllc19baV07XG4gICAgICBpZiAoZW50cnkuZ2V0UGxheWluZ1N0YXRlKCkgIT09IFBsYXlpbmdTdGF0ZXMuUEFVU0VEKSB7XG4gICAgICAgIGFuYWx5dGljc0V2ZW50KGVudHJ5LCBWaWRlb0FuYWx5dGljc0V2ZW50cy5TRUNPTkRTX1BMQVlFRCk7XG4gICAgICAgIHRoaXMudGltZVVwZGF0ZUFjdGlvbkV2ZW50XyhlbnRyeSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudGltZXJfLmRlbGF5KHRoaXMuYm91bmRTZWNvbmRzUGxheWluZ18sIFNFQ09ORFNfUExBWUVEX01JTl9ERUxBWSk7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgYSBMT1ctVFJVU1QgdGltZXVwZGF0ZSBldmVudCBjb25zdW1hYmxlIGJ5IEFNUCBhY3Rpb25zLlxuICAgKiBGcmVxdWVuY3kgb2YgdGhpcyBldmVudCBpcyBjb250cm9sbGVkIGJ5IFNFQ09ORFNfUExBWUVEX01JTl9ERUxBWSBhbmQgaXNcbiAgICogZXZlcnkgMSBzZWNvbmQgZm9yIG5vdy5cbiAgICogQHBhcmFtIHshVmlkZW9FbnRyeX0gZW50cnlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHRpbWVVcGRhdGVBY3Rpb25FdmVudF8oZW50cnkpIHtcbiAgICBjb25zdCBuYW1lID0gJ3RpbWVVcGRhdGUnO1xuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gZW50cnkudmlkZW8uZ2V0Q3VycmVudFRpbWUoKTtcbiAgICBjb25zdCBkdXJhdGlvbiA9IGVudHJ5LnZpZGVvLmdldER1cmF0aW9uKCk7XG4gICAgaWYgKFxuICAgICAgaXNGaW5pdGVOdW1iZXIoY3VycmVudFRpbWUpICYmXG4gICAgICBpc0Zpbml0ZU51bWJlcihkdXJhdGlvbikgJiZcbiAgICAgIGR1cmF0aW9uID4gMFxuICAgICkge1xuICAgICAgY29uc3QgcGVyYyA9IGN1cnJlbnRUaW1lIC8gZHVyYXRpb247XG4gICAgICBjb25zdCBldmVudCA9IGNyZWF0ZUN1c3RvbUV2ZW50KFxuICAgICAgICB0aGlzLmFtcGRvYy53aW4sXG4gICAgICAgIGAke1RBR30uJHtuYW1lfWAsXG4gICAgICAgIGRpY3Qoeyd0aW1lJzogY3VycmVudFRpbWUsICdwZXJjZW50JzogcGVyY30pXG4gICAgICApO1xuICAgICAgdGhpcy5hY3Rpb25zXy50cmlnZ2VyKGVudHJ5LnZpZGVvLmVsZW1lbnQsIG5hbWUsIGV2ZW50LCBBY3Rpb25UcnVzdC5MT1cpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8oIzMwNzIzKTogY3JlYXRlIHVucmVnaXN0ZXIoKSBmb3IgY2xlYW51cC5cbiAgLyoqIEBwYXJhbSB7IS4uL3ZpZGVvLWludGVyZmFjZS5WaWRlb0ludGVyZmFjZX0gdmlkZW8gKi9cbiAgcmVnaXN0ZXIodmlkZW8pIHtcbiAgICBkZXZBc3NlcnQodmlkZW8pO1xuICAgIGNvbnN0IHZpZGVvQkUgPSAvKiogQHR5cGUgeyFBTVAuQmFzZUVsZW1lbnR9ICovICh2aWRlbyk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyQ29tbW9uQWN0aW9uc18odmlkZW8pO1xuXG4gICAgaWYgKCF2aWRlby5zdXBwb3J0c1BsYXRmb3JtKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRFbnRyeU9yTnVsbF8odmlkZW8pKSB7XG4gICAgICAvLyBhbHJlYWR5IHJlZ2lzdGVyZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMudmlld3BvcnRPYnNlcnZlcl8pIHtcbiAgICAgIGNvbnN0IHZpZXdwb3J0Q2FsbGJhY2sgPSAoXG4gICAgICAgIC8qKiBAdHlwZSB7IUFycmF5PCFJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5Pn0gKi8gcmVjb3Jkc1xuICAgICAgKSA9PlxuICAgICAgICByZWNvcmRzLmZvckVhY2goKHtpc0ludGVyc2VjdGluZywgdGFyZ2V0fSkgPT4ge1xuICAgICAgICAgIHRoaXMuZ2V0RW50cnlfKHRhcmdldCkudXBkYXRlVmlzaWJpbGl0eShcbiAgICAgICAgICAgIC8qIGlzVmlzaWJsZSAqLyBpc0ludGVyc2VjdGluZ1xuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgdGhpcy52aWV3cG9ydE9ic2VydmVyXyA9IGNyZWF0ZVZpZXdwb3J0T2JzZXJ2ZXIoXG4gICAgICAgIHZpZXdwb3J0Q2FsbGJhY2ssXG4gICAgICAgIHRoaXMuYW1wZG9jLndpbixcbiAgICAgICAge3RocmVzaG9sZDogTUlOX1ZJU0lCSUxJVFlfUkFUSU9fRk9SX0FVVE9QTEFZfVxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy52aWV3cG9ydE9ic2VydmVyXy5vYnNlcnZlKHZpZGVvQkUuZWxlbWVudCk7XG4gICAgbGlzdGVuKHZpZGVvQkUuZWxlbWVudCwgVmlkZW9FdmVudHMuUkVMT0FELCAoKSA9PiBlbnRyeS52aWRlb0xvYWRlZCgpKTtcblxuICAgIHRoaXMuZW50cmllc18gPSB0aGlzLmVudHJpZXNfIHx8IFtdO1xuICAgIGNvbnN0IGVudHJ5ID0gbmV3IFZpZGVvRW50cnkodGhpcywgdmlkZW8pO1xuICAgIHRoaXMuZW50cmllc18ucHVzaChlbnRyeSk7XG5cbiAgICBjb25zdCB7ZWxlbWVudH0gPSBlbnRyeS52aWRlbztcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50KGVsZW1lbnQsIFZpZGVvRXZlbnRzLlJFR0lTVEVSRUQpO1xuXG4gICAgc2V0SXNNZWRpYUNvbXBvbmVudChlbGVtZW50KTtcblxuICAgIC8vIFVubGlrZSBldmVudHMsIHNpZ25hbHMgYXJlIHBlcm1hbmVudC4gV2UgY2FuIHdhaXQgZm9yIGBSRUdJU1RFUkVEYCBhdCBhbnlcbiAgICAvLyBtb21lbnQgaW4gdGhlIGVsZW1lbnQncyBsaWZlY3ljbGUgYW5kIHRoZSBwcm9taXNlIHdpbGwgcmVzb2x2ZVxuICAgIC8vIGFwcHJvcHJpYXRlbHkgZWFjaCB0aW1lLlxuICAgIGNvbnN0IHNpZ25hbHMgPSAvKiogQHR5cGUgeyEuLi9iYXNlLWVsZW1lbnQuQmFzZUVsZW1lbnR9ICovIChcbiAgICAgIHZpZGVvXG4gICAgKS5zaWduYWxzKCk7XG5cbiAgICBzaWduYWxzLnNpZ25hbChWaWRlb0V2ZW50cy5SRUdJU1RFUkVEKTtcblxuICAgIC8vIEFkZCBhIGNsYXNzIHRvIGVsZW1lbnQgdG8gaW5kaWNhdGUgaXQgaW1wbGVtZW50cyB0aGUgdmlkZW8gaW50ZXJmYWNlLlxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXZpZGVvLWludGVyZmFjZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGNvbW1vbiBhY3Rpb25zIHN1Y2ggYXMgcGxheSwgcGF1c2UsIGV0Yy4uLiBvbiB0aGUgdmlkZW8gZWxlbWVudFxuICAgKiBzbyB0aGV5IGNhbiBiZSBjYWxsZWQgdXNpbmcgQU1QIEFjdGlvbnMuXG4gICAqIEZvciBleGFtcGxlOiA8YnV0dG9uIG9uPVwidGFwOm15VmlkZW8ucGxheVwiPlxuICAgKlxuICAgKiBAcGFyYW0geyEuLi92aWRlby1pbnRlcmZhY2UuVmlkZW9PckJhc2VFbGVtZW50RGVmfSB2aWRlb1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVnaXN0ZXJDb21tb25BY3Rpb25zXyh2aWRlbykge1xuICAgIC8vIE9ubHkgcmVxdWlyZSBBY3Rpb25UcnVzdC5MT1cgZm9yIHZpZGVvIGFjdGlvbnMgdG8gZGVmZXIgdG8gcGxhdGZvcm1cbiAgICAvLyBzcGVjaWZpYyBoYW5kbGluZyAoZS5nLiB1c2VyIGdlc3R1cmUgcmVxdWlyZW1lbnQgZm9yIHVubXV0ZWQgcGxheWJhY2spLlxuICAgIGNvbnN0IHRydXN0ID0gQWN0aW9uVHJ1c3QuTE9XO1xuXG4gICAgcmVnaXN0ZXJBY3Rpb24oJ3BsYXknLCAoKSA9PiB2aWRlby5wbGF5KC8qIGlzQXV0b3BsYXkgKi8gZmFsc2UpKTtcbiAgICByZWdpc3RlckFjdGlvbigncGF1c2UnLCAoKSA9PiB2aWRlby5wYXVzZSgpKTtcbiAgICByZWdpc3RlckFjdGlvbignbXV0ZScsICgpID0+IHZpZGVvLm11dGUoKSk7XG4gICAgcmVnaXN0ZXJBY3Rpb24oJ3VubXV0ZScsICgpID0+IHZpZGVvLnVubXV0ZSgpKTtcblxuICAgIC8vIGZ1bGxzY3JlZW4vZnVsbHNjcmVlbmVudGVyIGFyZSBhIHNwZWNpYWwgY2FzZS5cbiAgICAvLyAtIGZ1bGxzY3JlZW5lbnRlciBpcyBrZXB0IGFzIGEgc3RhbmRhcmQgbmFtZSBmb3Igc3ltbWV0cnkgd2l0aCBpbnRlcm5hbFxuICAgIC8vICAgaW50ZXJuYWwgaW50ZXJmYWNlc1xuICAgIC8vIC0gZnVsbHNjcmVlbiBpcyBhbiB1bmRvY3VtZW50ZWQgYWxpYXMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICAgIGNvbnN0IGZ1bGxzY3JlZW5FbnRlciA9ICgpID0+IHZpZGVvLmZ1bGxzY3JlZW5FbnRlcigpO1xuICAgIHJlZ2lzdGVyQWN0aW9uKCdmdWxsc2NyZWVuZW50ZXInLCBmdWxsc2NyZWVuRW50ZXIpO1xuICAgIHJlZ2lzdGVyQWN0aW9uKCdmdWxsc2NyZWVuJywgZnVsbHNjcmVlbkVudGVyKTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGZuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVnaXN0ZXJBY3Rpb24oYWN0aW9uLCBmbikge1xuICAgICAgY29uc3QgdmlkZW9CRSA9IC8qKiBAdHlwZSB7IUFNUC5CYXNlRWxlbWVudH0gKi8gKHZpZGVvKTtcbiAgICAgIHZpZGVvQkUucmVnaXN0ZXJBY3Rpb24oXG4gICAgICAgIGFjdGlvbixcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHVzZXJJbnRlcmFjdGVkV2l0aCh2aWRlbyk7XG4gICAgICAgICAgZm4oKTtcbiAgICAgICAgfSxcbiAgICAgICAgdHJ1c3RcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGVudHJ5IGluIHRoZSB2aWRlbyBtYW5hZ2VyIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHZpZGVvIG9yXG4gICAqIGVsZW1lbnQgcHJvdmlkZWQsIG9yIG51bGwgaWYgdW5hdmFpbGFibGUuXG4gICAqIEBwYXJhbSB7IS4uL3ZpZGVvLWludGVyZmFjZS5WaWRlb09yQmFzZUVsZW1lbnREZWZ8IUVsZW1lbnR9IHZpZGVvT3JFbGVtZW50XG4gICAqIEByZXR1cm4gez9WaWRlb0VudHJ5fSBlbnRyeVxuICAgKi9cbiAgZ2V0RW50cnlPck51bGxfKHZpZGVvT3JFbGVtZW50KSB7XG4gICAgaWYgKGlzRW50cnlGb3IodGhpcy5sYXN0Rm91bmRFbnRyeV8sIHZpZGVvT3JFbGVtZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMubGFzdEZvdW5kRW50cnlfO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyB0aGlzLmVudHJpZXNfICYmIGkgPCB0aGlzLmVudHJpZXNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllc19baV07XG4gICAgICBpZiAoaXNFbnRyeUZvcihlbnRyeSwgdmlkZW9PckVsZW1lbnQpKSB7XG4gICAgICAgIHRoaXMubGFzdEZvdW5kRW50cnlfID0gZW50cnk7XG4gICAgICAgIHJldHVybiBlbnRyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBlbnRyeSBpbiB0aGUgdmlkZW8gbWFuYWdlciBjb3JyZXNwb25kaW5nIHRvIHRoZSB2aWRlbyBvclxuICAgKiBlbGVtZW50IHByb3ZpZGVkXG4gICAqIEBwYXJhbSB7IS4uL3ZpZGVvLWludGVyZmFjZS5WaWRlb09yQmFzZUVsZW1lbnREZWZ8IUVsZW1lbnR9IHZpZGVvT3JFbGVtZW50XG4gICAqIEByZXR1cm4ge1ZpZGVvRW50cnl9IGVudHJ5XG4gICAqL1xuICBnZXRFbnRyeV8odmlkZW9PckVsZW1lbnQpIHtcbiAgICByZXR1cm4gZGV2QXNzZXJ0KFxuICAgICAgdGhpcy5nZXRFbnRyeU9yTnVsbF8odmlkZW9PckVsZW1lbnQpLFxuICAgICAgJyVzIG5vdCByZWdpc3RlcmVkIHRvIFZpZGVvTWFuYWdlcicsXG4gICAgICB2aWRlb09yRWxlbWVudC5lbGVtZW50IHx8IHZpZGVvT3JFbGVtZW50XG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAcGFyYW0geyFWaWRlb0VudHJ5fSBlbnRyeSAqL1xuICByZWdpc3RlckZvckF1dG9GdWxsc2NyZWVuKGVudHJ5KSB7XG4gICAgdGhpcy5nZXRBdXRvRnVsbHNjcmVlbk1hbmFnZXJfKCkucmVnaXN0ZXIoZW50cnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFBdXRvRnVsbHNjcmVlbk1hbmFnZXJ9XG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgZ2V0QXV0b0Z1bGxzY3JlZW5NYW5hZ2VyRm9yVGVzdGluZ18oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QXV0b0Z1bGxzY3JlZW5NYW5hZ2VyXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgYW5hbHl0aWNzIGRldGFpbHMgcHJvcGVydHkgZm9yIHRoZSBnaXZlbiB2aWRlby5cbiAgICogRmFpbHMgc2lsZW50bHkgaWYgdGhlIHZpZGVvIGlzIG5vdCByZWdpc3RlcmVkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5XG4gICAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz59XG4gICAqL1xuICBnZXRWaWRlb1N0YXRlUHJvcGVydHkoaWQsIHByb3BlcnR5KSB7XG4gICAgY29uc3Qgcm9vdCA9IHRoaXMuYW1wZG9jLmdldFJvb3ROb2RlKCk7XG4gICAgY29uc3QgdmlkZW9FbGVtZW50ID0gdXNlcigpLmFzc2VydEVsZW1lbnQoXG4gICAgICByb290LmdldEVsZW1lbnRCeUlkKC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAoaWQpKSxcbiAgICAgIGBDb3VsZCBub3QgZmluZCBhbiBlbGVtZW50IHdpdGggaWQ9XCIke2lkfVwiIGZvciBWSURFT19TVEFURWBcbiAgICApO1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5nZXRFbnRyeV8odmlkZW9FbGVtZW50KTtcbiAgICByZXR1cm4gKGVudHJ5ID8gZW50cnkuZ2V0QW5hbHl0aWNzRGV0YWlscygpIDogUHJvbWlzZS5yZXNvbHZlKCkpLnRoZW4oXG4gICAgICAoZGV0YWlscykgPT4gKGRldGFpbHMgPyBkZXRhaWxzW3Byb3BlcnR5XSA6ICcnKVxuICAgICk7XG4gIH1cblxuICAvLyBUT0RPKGdvLmFtcC5kZXYvaXNzdWUvMjcwMTApOiBGb3IgZ2V0dGVycyBiZWxvdywgbGV0J3MgZXhwb3NlIFZpZGVvRW50cnlcbiAgLy8gaW5zdGVhZCBhbmQgdXNlIGRpcmVjdGx5LiBUaGlzIGlzIGJldHRlciBmb3Igc2l6ZSBhbmQgc2FuaXR5LiBVc2VycyBjYW5cbiAgLy8gYWxzbyB0aGVuIGtlZXAgdGhlIGVudHJ5IHJlZmVyZW5jZSBmb3IgdGhlaXIgb3duIHVzZS5cbiAgLy8gKENhbid0IGV4cG9zZSB5ZXQgZHVlIHRvIHBhY2thZ2UtbGV2ZWwgbWV0aG9kcyB0byBiZSByZXN0cnVjdHVyZWQsIGUuZ1xuICAvLyB2aWRlb0xvYWRlZCgpLiBTZWUgaXNzdWUpXG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgdmlkZW8gaXMgcGF1c2VkIG9yIHBsYXlpbmcgYWZ0ZXIgdGhlIHVzZXIgaW50ZXJhY3RlZFxuICAgKiB3aXRoIGl0IG9yIHBsYXlpbmcgdGhyb3VnaCBhdXRvcGxheVxuICAgKlxuICAgKiBAcGFyYW0geyEuLi92aWRlby1pbnRlcmZhY2UuVmlkZW9PckJhc2VFbGVtZW50RGVmfCFFbGVtZW50fSB2aWRlb09yRWxlbWVudFxuICAgKiBAcmV0dXJuIHshLi4vdmlkZW8taW50ZXJmYWNlLlBsYXlpbmdTdGF0ZURlZn1cbiAgICovXG4gIGdldFBsYXlpbmdTdGF0ZSh2aWRlb09yRWxlbWVudCkge1xuICAgIHJldHVybiB0aGlzLmdldEVudHJ5Xyh2aWRlb09yRWxlbWVudCkuZ2V0UGxheWluZ1N0YXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshLi4vdmlkZW8taW50ZXJmYWNlLlZpZGVvT3JCYXNlRWxlbWVudERlZnwhRWxlbWVudH0gdmlkZW9PckVsZW1lbnRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzTXV0ZWQodmlkZW9PckVsZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFbnRyeV8odmlkZW9PckVsZW1lbnQpLmlzTXV0ZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi92aWRlby1pbnRlcmZhY2UuVmlkZW9PckJhc2VFbGVtZW50RGVmfCFFbGVtZW50fSB2aWRlb09yRWxlbWVudFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgdXNlckludGVyYWN0ZWQodmlkZW9PckVsZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFbnRyeV8odmlkZW9PckVsZW1lbnQpLnVzZXJJbnRlcmFjdGVkKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshLi4vdmlkZW8taW50ZXJmYWNlLlZpZGVvT3JCYXNlRWxlbWVudERlZnwhRWxlbWVudH0gdmlkZW9PckVsZW1lbnRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzUm9sbGluZ0FkKHZpZGVvT3JFbGVtZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RW50cnlfKHZpZGVvT3JFbGVtZW50KS5pc1JvbGxpbmdBZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVZpZGVvRW50cnl9IGVudHJ5QmVpbmdQbGF5ZWRcbiAgICovXG4gIHBhdXNlT3RoZXJWaWRlb3MoZW50cnlCZWluZ1BsYXllZCkge1xuICAgIHRoaXMuZW50cmllc18uZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgZW50cnkuaXNQbGF5YmFja01hbmFnZWQoKSAmJlxuICAgICAgICBlbnRyeSAhPT0gZW50cnlCZWluZ1BsYXllZCAmJlxuICAgICAgICBlbnRyeS5nZXRQbGF5aW5nU3RhdGUoKSA9PSBQbGF5aW5nU3RhdGVzLlBMQVlJTkdfTUFOVUFMXG4gICAgICApIHtcbiAgICAgICAgZW50cnkudmlkZW8ucGF1c2UoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7P1ZpZGVvRW50cnk9fSBlbnRyeVxuICogQHBhcmFtIHs/Li4vdmlkZW8taW50ZXJmYWNlLlZpZGVvT3JCYXNlRWxlbWVudERlZnwhRWxlbWVudD19IHZpZGVvT3JFbGVtZW50XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5jb25zdCBpc0VudHJ5Rm9yID0gKGVudHJ5LCB2aWRlb09yRWxlbWVudCkgPT5cbiAgISFlbnRyeSAmJlxuICAoZW50cnkudmlkZW8gPT09IHZpZGVvT3JFbGVtZW50IHx8IGVudHJ5LnZpZGVvLmVsZW1lbnQgPT09IHZpZGVvT3JFbGVtZW50KTtcblxuLyoqXG4gKiBWaWRlb0VudHJ5IHJlcHJlc2VudHMgYW4gZW50cnkgaW4gdGhlIFZpZGVvTWFuYWdlcidzIGxpc3QuXG4gKi9cbmNsYXNzIFZpZGVvRW50cnkge1xuICAvKipcbiAgICogQHBhcmFtIHshVmlkZW9NYW5hZ2VyfSBtYW5hZ2VyXG4gICAqIEBwYXJhbSB7IS4uL3ZpZGVvLWludGVyZmFjZS5WaWRlb09yQmFzZUVsZW1lbnREZWZ9IHZpZGVvXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtYW5hZ2VyLCB2aWRlbykge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFWaWRlb01hbmFnZXJ9ICovXG4gICAgdGhpcy5tYW5hZ2VyXyA9IG1hbmFnZXI7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9ICAqL1xuICAgIHRoaXMuYW1wZG9jXyA9IG1hbmFnZXIuYW1wZG9jO1xuXG4gICAgLyoqIEBwYWNrYWdlIEBjb25zdCB7IS4uL3ZpZGVvLWludGVyZmFjZS5WaWRlb09yQmFzZUVsZW1lbnREZWZ9ICovXG4gICAgdGhpcy52aWRlbyA9IHZpZGVvO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMubWFuYWdlUGxheWJhY2tfID0gdHJ1ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmxvYWRlZF8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzUGxheWluZ18gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzUm9sbGluZ0FkXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNWaXNpYmxlXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMuYWN0aW9uU2Vzc2lvbk1hbmFnZXJfID0gbmV3IFZpZGVvU2Vzc2lvbk1hbmFnZXIoKTtcblxuICAgIHRoaXMuYWN0aW9uU2Vzc2lvbk1hbmFnZXJfLm9uU2Vzc2lvbkVuZCgoKSA9PlxuICAgICAgYW5hbHl0aWNzRXZlbnQodGhpcywgVmlkZW9BbmFseXRpY3NFdmVudHMuU0VTU0lPTilcbiAgICApO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMudmlzaWJpbGl0eVNlc3Npb25NYW5hZ2VyXyA9IG5ldyBWaWRlb1Nlc3Npb25NYW5hZ2VyKCk7XG5cbiAgICB0aGlzLnZpc2liaWxpdHlTZXNzaW9uTWFuYWdlcl8ub25TZXNzaW9uRW5kKCgpID0+XG4gICAgICBhbmFseXRpY3NFdmVudCh0aGlzLCBWaWRlb0FuYWx5dGljc0V2ZW50cy5TRVNTSU9OX1ZJU0lCTEUpXG4gICAgKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge2Z1bmN0aW9uKCk6ICFBbmFseXRpY3NQZXJjZW50YWdlVHJhY2tlcn0gKi9cbiAgICB0aGlzLmdldEFuYWx5dGljc1BlcmNlbnRhZ2VUcmFja2VyXyA9IG9uY2UoXG4gICAgICAoKSA9PiBuZXcgQW5hbHl0aWNzUGVyY2VudGFnZVRyYWNrZXIodGhpcy5hbXBkb2NfLndpbiwgdGhpcylcbiAgICApO1xuXG4gICAgLy8gQXV0b3BsYXkgVmFyaWFibGVzXG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5wbGF5Q2FsbGVkQnlBdXRvcGxheV8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnBhdXNlQ2FsbGVkQnlBdXRvcGxheV8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5pbnRlcm5hbEVsZW1lbnRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLm11dGVkXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaGFzU2VlblBsYXlFdmVudF8gPSBmYWxzZTtcblxuICAgIHRoaXMuaGFzQXV0b3BsYXkgPSB2aWRlby5lbGVtZW50Lmhhc0F0dHJpYnV0ZShWaWRlb0F0dHJpYnV0ZXMuQVVUT1BMQVkpO1xuXG4gICAgaWYgKHRoaXMuaGFzQXV0b3BsYXkpIHtcbiAgICAgIHRoaXMubWFuYWdlcl8uaW5zdGFsbEF1dG9wbGF5U3R5bGVzKCk7XG4gICAgfVxuXG4gICAgLy8gTWVkaWEgU2Vzc2lvbiBBUEkgVmFyaWFibGVzXG5cbiAgICAvKiogQHByaXZhdGUgeyEuLi9tZWRpYXNlc3Npb24taGVscGVyLk1ldGFkYXRhRGVmfSAqL1xuICAgIHRoaXMubWV0YWRhdGFfID0gRU1QVFlfTUVUQURBVEE7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtmdW5jdGlvbigpfSAqL1xuICAgIHRoaXMuYm91bmRNZWRpYXNlc3Npb25QbGF5XyA9ICgpID0+IHtcbiAgICAgIHRoaXMudmlkZW8ucGxheSgvKiBpc0F1dG9wbGF5ICovIGZhbHNlKTtcbiAgICB9O1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLmJvdW5kTWVkaWFzZXNzaW9uUGF1c2VfID0gKCkgPT4ge1xuICAgICAgdGhpcy52aWRlby5wYXVzZSgpO1xuICAgIH07XG5cbiAgICBsaXN0ZW4odmlkZW8uZWxlbWVudCwgVmlkZW9FdmVudHMuTE9BRCwgKCkgPT4gdGhpcy52aWRlb0xvYWRlZCgpKTtcbiAgICBsaXN0ZW4odmlkZW8uZWxlbWVudCwgVmlkZW9FdmVudHMuUEFVU0UsICgpID0+IHRoaXMudmlkZW9QYXVzZWRfKCkpO1xuICAgIGxpc3Rlbih2aWRlby5lbGVtZW50LCBWaWRlb0V2ZW50cy5QTEFZLCAoKSA9PiB7XG4gICAgICB0aGlzLmhhc1NlZW5QbGF5RXZlbnRfID0gdHJ1ZTtcbiAgICAgIGFuYWx5dGljc0V2ZW50KHRoaXMsIFZpZGVvQW5hbHl0aWNzRXZlbnRzLlBMQVkpO1xuICAgIH0pO1xuICAgIGxpc3Rlbih2aWRlby5lbGVtZW50LCBWaWRlb0V2ZW50cy5QTEFZSU5HLCAoKSA9PiB0aGlzLnZpZGVvUGxheWVkXygpKTtcbiAgICBsaXN0ZW4odmlkZW8uZWxlbWVudCwgVmlkZW9FdmVudHMuTVVURUQsICgpID0+ICh0aGlzLm11dGVkXyA9IHRydWUpKTtcbiAgICBsaXN0ZW4odmlkZW8uZWxlbWVudCwgVmlkZW9FdmVudHMuVU5NVVRFRCwgKCkgPT4ge1xuICAgICAgdGhpcy5tdXRlZF8gPSBmYWxzZTtcbiAgICAgIHRoaXMubWFuYWdlcl8ucGF1c2VPdGhlclZpZGVvcyh0aGlzKTtcbiAgICB9KTtcblxuICAgIGxpc3Rlbih2aWRlby5lbGVtZW50LCBWaWRlb0V2ZW50cy5DVVNUT01fVElDSywgKGUpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBnZXREYXRhKGUpO1xuICAgICAgY29uc3QgZXZlbnRUeXBlID0gZGF0YVsnZXZlbnRUeXBlJ107XG4gICAgICBpZiAoIWV2ZW50VHlwZSkge1xuICAgICAgICAvLyBDVVNUT01fVElDSyBpcyBhIGdlbmVyaWMgZXZlbnQgZm9yIDNwIHBsYXllcnMgd2hvc2Ugc2VtYW50aWNzXG4gICAgICAgIC8vIGRvbid0IGZpdCB3aXRoIG90aGVyIHZpZGVvIGV2ZW50cy5cbiAgICAgICAgLy8gSWYgYGV2ZW50VHlwZWAgaXMgdW5zZXQsIGl0J3Mgbm90IG1lYW50IGZvciBhbmFseXRpY3MuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMubG9nQ3VzdG9tQW5hbHl0aWNzXyhldmVudFR5cGUsIGRhdGFbJ3ZhcnMnXSk7XG4gICAgfSk7XG5cbiAgICBsaXN0ZW4odmlkZW8uZWxlbWVudCwgVmlkZW9FdmVudHMuRU5ERUQsICgpID0+IHtcbiAgICAgIHRoaXMuaXNSb2xsaW5nQWRfID0gZmFsc2U7XG4gICAgICBhbmFseXRpY3NFdmVudCh0aGlzLCBWaWRlb0FuYWx5dGljc0V2ZW50cy5FTkRFRCk7XG4gICAgfSk7XG5cbiAgICBsaXN0ZW4odmlkZW8uZWxlbWVudCwgVmlkZW9FdmVudHMuQURfU1RBUlQsICgpID0+IHtcbiAgICAgIHRoaXMuaXNSb2xsaW5nQWRfID0gdHJ1ZTtcbiAgICAgIGFuYWx5dGljc0V2ZW50KHRoaXMsIFZpZGVvQW5hbHl0aWNzRXZlbnRzLkFEX1NUQVJUKTtcbiAgICB9KTtcblxuICAgIGxpc3Rlbih2aWRlby5lbGVtZW50LCBWaWRlb0V2ZW50cy5BRF9FTkQsICgpID0+IHtcbiAgICAgIHRoaXMuaXNSb2xsaW5nQWRfID0gZmFsc2U7XG4gICAgICBhbmFseXRpY3NFdmVudCh0aGlzLCBWaWRlb0FuYWx5dGljc0V2ZW50cy5BRF9FTkQpO1xuICAgIH0pO1xuXG4gICAgdmlkZW9cbiAgICAgIC5zaWduYWxzKClcbiAgICAgIC53aGVuU2lnbmFsKFZpZGVvRXZlbnRzLlJFR0lTVEVSRUQpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLm9uUmVnaXN0ZXJfKCkpO1xuXG4gICAgLyoqXG4gICAgICogVHJpZ2dlciBldmVudCBmb3IgZmlyc3QgbWFudWFsIHBsYXkuXG4gICAgICogQHByaXZhdGUgQGNvbnN0IHshZnVuY3Rpb24oKX1cbiAgICAgKi9cbiAgICB0aGlzLmZpcnN0UGxheUV2ZW50T3JOb29wXyA9IG9uY2UoKCkgPT4ge1xuICAgICAgY29uc3QgZmlyc3RQbGF5ID0gJ2ZpcnN0UGxheSc7XG4gICAgICBjb25zdCB0cnVzdCA9IEFjdGlvblRydXN0LkxPVztcbiAgICAgIGNvbnN0IGV2ZW50ID0gY3JlYXRlQ3VzdG9tRXZlbnQoXG4gICAgICAgIHRoaXMuYW1wZG9jXy53aW4sXG4gICAgICAgIGZpcnN0UGxheSxcbiAgICAgICAgLyogZGV0YWlsICovIGRpY3Qoe30pXG4gICAgICApO1xuICAgICAgY29uc3Qge2VsZW1lbnR9ID0gdGhpcy52aWRlbztcbiAgICAgIGNvbnN0IGFjdGlvbnMgPSBTZXJ2aWNlcy5hY3Rpb25TZXJ2aWNlRm9yRG9jKGVsZW1lbnQpO1xuICAgICAgYWN0aW9ucy50cmlnZ2VyKGVsZW1lbnQsIGZpcnN0UGxheSwgZXZlbnQsIHRydXN0KTtcbiAgICB9KTtcblxuICAgIHRoaXMubGlzdGVuRm9yUGxheWJhY2tEZWxlZ2F0aW9uXygpO1xuICB9XG5cbiAgLyoqIEBwdWJsaWMgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmdldEFuYWx5dGljc1BlcmNlbnRhZ2VUcmFja2VyXygpLnN0b3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz59IHZhcnNcbiAgICovXG4gIGxvZ0N1c3RvbUFuYWx5dGljc18oZXZlbnRUeXBlLCB2YXJzKSB7XG4gICAgY29uc3QgcHJlZml4ZWRWYXJzID0ge1t2aWRlb0FuYWx5dGljc0N1c3RvbUV2ZW50VHlwZUtleV06IGV2ZW50VHlwZX07XG5cbiAgICBPYmplY3Qua2V5cyh2YXJzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIHByZWZpeGVkVmFyc1tgY3VzdG9tXyR7a2V5fWBdID0gdmFyc1trZXldO1xuICAgIH0pO1xuXG4gICAgYW5hbHl0aWNzRXZlbnQodGhpcywgVmlkZW9BbmFseXRpY3NFdmVudHMuQ1VTVE9NLCBwcmVmaXhlZFZhcnMpO1xuICB9XG5cbiAgLyoqIExpc3RlbnMgZm9yIHNpZ25hbHMgdG8gZGVsZWdhdGUgcGxheWJhY2sgdG8gYSBkaWZmZXJlbnQgbW9kdWxlLiAqL1xuICBsaXN0ZW5Gb3JQbGF5YmFja0RlbGVnYXRpb25fKCkge1xuICAgIGNvbnN0IHNpZ25hbHMgPSB0aGlzLnZpZGVvLnNpZ25hbHMoKTtcbiAgICBzaWduYWxzLndoZW5TaWduYWwoVmlkZW9TZXJ2aWNlU2lnbmFscy5QTEFZQkFDS19ERUxFR0FURUQpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5tYW5hZ2VQbGF5YmFja18gPSBmYWxzZTtcblxuICAgICAgaWYgKHRoaXMuaXNQbGF5aW5nXykge1xuICAgICAgICB0aGlzLnZpZGVvLnBhdXNlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogQHJldHVybiB7Ym9vbGVhbn0gKi9cbiAgaXNNdXRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5tdXRlZF87XG4gIH1cblxuICAvKiogQHJldHVybiB7Ym9vbGVhbn0gKi9cbiAgaXNQbGF5YmFja01hbmFnZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFuYWdlUGxheWJhY2tfO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIG9uUmVnaXN0ZXJfKCkge1xuICAgIGlmICh0aGlzLnJlcXVpcmVzQXV0b0Z1bGxzY3JlZW5fKCkpIHtcbiAgICAgIHRoaXMubWFuYWdlcl8ucmVnaXN0ZXJGb3JBdXRvRnVsbHNjcmVlbih0aGlzKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5oYXNBdXRvcGxheSkge1xuICAgICAgdGhpcy5hdXRvcGxheVZpZGVvQnVpbHRfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZXF1aXJlc0F1dG9GdWxsc2NyZWVuXygpIHtcbiAgICBjb25zdCB7ZWxlbWVudH0gPSB0aGlzLnZpZGVvO1xuICAgIGlmIChcbiAgICAgIHRoaXMudmlkZW8ucHJlaW1wbGVtZW50c0F1dG9GdWxsc2NyZWVuKCkgfHxcbiAgICAgICFlbGVtZW50Lmhhc0F0dHJpYnV0ZShWaWRlb0F0dHJpYnV0ZXMuUk9UQVRFX1RPX0ZVTExTQ1JFRU4pXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB1c2VyQXNzZXJ0KFxuICAgICAgdGhpcy52aWRlby5pc0ludGVyYWN0aXZlKCksXG4gICAgICAnT25seSBpbnRlcmFjdGl2ZSB2aWRlb3MgYXJlIGFsbG93ZWQgdG8gZW50ZXIgZnVsbHNjcmVlbiBvbiByb3RhdGUuICcgK1xuICAgICAgICAnU2V0IHRoZSBgY29udHJvbHNgIGF0dHJpYnV0ZSBvbiAlcyB0byBlbmFibGUuJyxcbiAgICAgIGVsZW1lbnRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciB3aGVuIHRoZSB2aWRlbyBzdGFydHMgcGxheWluZ1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmlkZW9QbGF5ZWRfKCkge1xuICAgIHRoaXMuaXNQbGF5aW5nXyA9IHRydWU7XG5cbiAgICBpZiAodGhpcy5nZXRQbGF5aW5nU3RhdGUoKSA9PSBQbGF5aW5nU3RhdGVzLlBMQVlJTkdfTUFOVUFMKSB7XG4gICAgICB0aGlzLmZpcnN0UGxheUV2ZW50T3JOb29wXygpO1xuICAgICAgdGhpcy5tYW5hZ2VyXy5wYXVzZU90aGVyVmlkZW9zKHRoaXMpO1xuICAgIH1cblxuICAgIGNvbnN0IHt2aWRlb30gPSB0aGlzO1xuICAgIGNvbnN0IHtlbGVtZW50fSA9IHZpZGVvO1xuXG4gICAgaWYgKFxuICAgICAgIXZpZGVvLnByZWltcGxlbWVudHNNZWRpYVNlc3Npb25BUEkoKSAmJlxuICAgICAgIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdpLWFtcGh0bWwtZGlzYWJsZS1tZWRpYXNlc3Npb24nKVxuICAgICkge1xuICAgICAgdmFsaWRhdGVNZWRpYU1ldGFkYXRhKGVsZW1lbnQsIHRoaXMubWV0YWRhdGFfKTtcbiAgICAgIHNldE1lZGlhU2Vzc2lvbihcbiAgICAgICAgdGhpcy5hbXBkb2NfLndpbixcbiAgICAgICAgdGhpcy5tZXRhZGF0YV8sXG4gICAgICAgIHRoaXMuYm91bmRNZWRpYXNlc3Npb25QbGF5XyxcbiAgICAgICAgdGhpcy5ib3VuZE1lZGlhc2Vzc2lvblBhdXNlX1xuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLmFjdGlvblNlc3Npb25NYW5hZ2VyXy5iZWdpblNlc3Npb24oKTtcbiAgICBpZiAodGhpcy5pc1Zpc2libGVfKSB7XG4gICAgICB0aGlzLnZpc2liaWxpdHlTZXNzaW9uTWFuYWdlcl8uYmVnaW5TZXNzaW9uKCk7XG4gICAgfVxuXG4gICAgLy8gVGhlIFBMQVkgZXZlbnQgd2FzIG9taXR0ZWQgZnJvbSB0aGUgb3JpZ2luYWwgVmlkZW9JbnRlcmZhY2UuIFRodXNcbiAgICAvLyBub3QgZXZlcnkgaW1wbGVtZW50YXRpb24gZW1pdHMgaXQuIEl0IHNob3VsZCBhbHdheXMgaGFwcGVuIGJlZm9yZVxuICAgIC8vIFBMQVlJTkcuIEhlbmNlIHdlIHRyZWF0IHRoZSBQTEFZSU5HIGFzIGFuIGluZGljYXRpb24gdG8gZW1pdCB0aGVcbiAgICAvLyBBbmFseXRpY3MgUExBWSBldmVudCBpZiB3ZSBoYXZlbid0IHNlZW4gUExBWS5cbiAgICBpZiAoIXRoaXMuaGFzU2VlblBsYXlFdmVudF8pIHtcbiAgICAgIGFuYWx5dGljc0V2ZW50KHRoaXMsIFZpZGVvQW5hbHl0aWNzRXZlbnRzLlBMQVkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmb3Igd2hlbiB0aGUgdmlkZW8gaGFzIGJlZW4gcGF1c2VkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2aWRlb1BhdXNlZF8oKSB7XG4gICAgYW5hbHl0aWNzRXZlbnQodGhpcywgVmlkZW9BbmFseXRpY3NFdmVudHMuUEFVU0UpO1xuICAgIHRoaXMuaXNQbGF5aW5nXyA9IGZhbHNlO1xuXG4gICAgLy8gUHJldmVudCBkb3VibGUtdHJpZ2dlciBvZiBzZXNzaW9uIGlmIHZpZGVvIGlzIGF1dG9wbGF5IGFuZCB0aGUgdmlkZW9cbiAgICAvLyBpcyBwYXVzZWQgYnkgYSB0aGUgdXNlciBzY3JvbGxpbmcgdGhlIHZpZGVvIG91dCBvZiB2aWV3LlxuICAgIGlmICghdGhpcy5wYXVzZUNhbGxlZEJ5QXV0b3BsYXlfKSB7XG4gICAgICB0aGlzLmFjdGlvblNlc3Npb25NYW5hZ2VyXy5lbmRTZXNzaW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHJlc2V0IHRoZSBmbGFnXG4gICAgICB0aGlzLnBhdXNlQ2FsbGVkQnlBdXRvcGxheV8gPSBmYWxzZTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB2aWRlbyBpcyBsb2FkZWQgYW5kIGNhbiBwbGF5LlxuICAgKi9cbiAgdmlkZW9Mb2FkZWQoKSB7XG4gICAgdGhpcy5sb2FkZWRfID0gdHJ1ZTtcblxuICAgIHRoaXMuaW50ZXJuYWxFbGVtZW50XyA9IGdldEludGVybmFsVmlkZW9FbGVtZW50Rm9yKHRoaXMudmlkZW8uZWxlbWVudCk7XG5cbiAgICB0aGlzLmZpbGxNZWRpYVNlc3Npb25NZXRhZGF0YV8oKTtcblxuICAgIHRoaXMuZ2V0QW5hbHl0aWNzUGVyY2VudGFnZVRyYWNrZXJfKCkuc3RhcnQoKTtcblxuICAgIGlmICh0aGlzLmlzVmlzaWJsZV8pIHtcbiAgICAgIC8vIEhhbmRsZXMgdGhlIGNhc2Ugd2hlbiB0aGUgdmlkZW8gYmVjb21lcyB2aXNpYmxlIGJlZm9yZSBsb2FkaW5nXG4gICAgICB0aGlzLmxvYWRlZFZpZGVvVmlzaWJpbGl0eUNoYW5nZWRfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHByb3ZpZGVkIG1ldGFkYXRhIGFuZCBmaWxscyBpbiBtaXNzaW5nIGZpZWxkc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZmlsbE1lZGlhU2Vzc2lvbk1ldGFkYXRhXygpIHtcbiAgICBpZiAodGhpcy52aWRlby5wcmVpbXBsZW1lbnRzTWVkaWFTZXNzaW9uQVBJKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy52aWRlby5nZXRNZXRhZGF0YSgpKSB7XG4gICAgICB0aGlzLm1ldGFkYXRhXyA9IG1hcChcbiAgICAgICAgLyoqIEB0eXBlIHshLi4vbWVkaWFzZXNzaW9uLWhlbHBlci5NZXRhZGF0YURlZn0gKi9cbiAgICAgICAgKHRoaXMudmlkZW8uZ2V0TWV0YWRhdGEoKSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgZG9jID0gdGhpcy5hbXBkb2NfLndpbi5kb2N1bWVudDtcblxuICAgIGlmICghdGhpcy5tZXRhZGF0YV8uYXJ0d29yayB8fCB0aGlzLm1ldGFkYXRhXy5hcnR3b3JrLmxlbmd0aCA9PSAwKSB7XG4gICAgICBjb25zdCBwb3N0ZXJVcmwgPVxuICAgICAgICBwYXJzZVNjaGVtYUltYWdlKGRvYykgfHwgcGFyc2VPZ0ltYWdlKGRvYykgfHwgcGFyc2VGYXZpY29uKGRvYyk7XG5cbiAgICAgIGlmIChwb3N0ZXJVcmwpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YV8uYXJ0d29yayA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICAnc3JjJzogcG9zdGVyVXJsLFxuICAgICAgICAgIH0sXG4gICAgICAgIF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLm1ldGFkYXRhXy50aXRsZSkge1xuICAgICAgY29uc3QgdGl0bGUgPVxuICAgICAgICB0aGlzLnZpZGVvLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0aXRsZScpIHx8XG4gICAgICAgIHRoaXMudmlkZW8uZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKSB8fFxuICAgICAgICB0aGlzLmludGVybmFsRWxlbWVudF8uZ2V0QXR0cmlidXRlKCd0aXRsZScpIHx8XG4gICAgICAgIHRoaXMuaW50ZXJuYWxFbGVtZW50Xy5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKSB8fFxuICAgICAgICBkb2MudGl0bGU7XG4gICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YV8udGl0bGUgPSB0aXRsZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdmlzaWJpbGl0eSBvZiBhIHZpZGVvIGNoYW5nZXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2aWRlb1Zpc2liaWxpdHlDaGFuZ2VkXygpIHtcbiAgICBpZiAodGhpcy5sb2FkZWRfKSB7XG4gICAgICB0aGlzLmxvYWRlZFZpZGVvVmlzaWJpbGl0eUNoYW5nZWRfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9ubHkgY2FsbGVkIHdoZW4gdmlzaWJpbGl0eSBvZiBhIGxvYWRlZCB2aWRlbyBjaGFuZ2VzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbG9hZGVkVmlkZW9WaXNpYmlsaXR5Q2hhbmdlZF8oKSB7XG4gICAgaWYgKCF0aGlzLmFtcGRvY18uaXNWaXNpYmxlKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaXNBdXRvcGxheVN1cHBvcnRlZCh0aGlzLmFtcGRvY18ud2luKS50aGVuKChpc0F1dG9wbGF5U3VwcG9ydGVkKSA9PiB7XG4gICAgICBjb25zdCBjYW5BdXRvcGxheSA9IHRoaXMuaGFzQXV0b3BsYXkgJiYgIXRoaXMudXNlckludGVyYWN0ZWQoKTtcblxuICAgICAgaWYgKGNhbkF1dG9wbGF5ICYmIGlzQXV0b3BsYXlTdXBwb3J0ZWQpIHtcbiAgICAgICAgdGhpcy5hdXRvcGxheUxvYWRlZFZpZGVvVmlzaWJpbGl0eUNoYW5nZWRfKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm5vbkF1dG9wbGF5TG9hZGVkVmlkZW9WaXNpYmlsaXR5Q2hhbmdlZF8oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qIEF1dG9wbGF5IEJlaGF2aW9yICovXG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGFuIGF1dG9wbGF5IHZpZGVvIGlzIGJ1aWx0LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYXV0b3BsYXlWaWRlb0J1aWx0XygpIHtcbiAgICAvLyBIaWRlIGNvbnRyb2xzIHVudGlsIHdlIGtub3cgaWYgYXV0b3BsYXkgaXMgc3VwcG9ydGVkLCBvdGhlcndpc2UgaGlkaW5nXG4gICAgLy8gYW5kIHNob3dpbmcgdGhlIGNvbnRyb2xzIHF1aWNrbHkgYmVjb21lcyBhIGJhZCB1c2VyIGV4cGVyaWVuY2UgZm9yIHRoZVxuICAgIC8vIGNvbW1vbiBjYXNlIHdoZXJlIGF1dG9wbGF5IGlzIHN1cHBvcnRlZC5cbiAgICBpZiAodGhpcy52aWRlby5pc0ludGVyYWN0aXZlKCkpIHtcbiAgICAgIHRoaXMudmlkZW8uaGlkZUNvbnRyb2xzKCk7XG4gICAgfVxuXG4gICAgaXNBdXRvcGxheVN1cHBvcnRlZCh0aGlzLmFtcGRvY18ud2luKS50aGVuKChpc0F1dG9wbGF5U3VwcG9ydGVkKSA9PiB7XG4gICAgICBpZiAoIWlzQXV0b3BsYXlTdXBwb3J0ZWQgJiYgdGhpcy52aWRlby5pc0ludGVyYWN0aXZlKCkpIHtcbiAgICAgICAgLy8gQXV0b3BsYXkgaXMgbm90IHN1cHBvcnRlZCwgc2hvdyB0aGUgY29udHJvbHMgc28gdXNlciBjYW4gbWFudWFsbHlcbiAgICAgICAgLy8gaW5pdGlhdGUgcGxheWJhY2suXG4gICAgICAgIHRoaXMudmlkZW8uc2hvd0NvbnRyb2xzKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gT25seSBtdXRlZCB2aWRlb3MgYXJlIGFsbG93ZWQgdG8gYXV0b3BsYXlcbiAgICAgIHRoaXMudmlkZW8ubXV0ZSgpO1xuXG4gICAgICB0aGlzLmluc3RhbGxBdXRvcGxheUVsZW1lbnRzXygpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc3RhbGxzIGF1dG9wbGF5IGFuaW1hdGlvbiBhbmQgaW50ZXJhY3Rpb24gbWFzayB3aGVuIGludGVyYWN0aXZlLlxuICAgKiBUaGUgYW5pbWF0ZWQgaWNvbiBpcyBhcHBlbmRlZCBhbHdheXMsIGJ1dCBvbmx5IGRpc3BsYXllZCBieSBDU1Mgd2hlblxuICAgKiBgY29udHJvbHNgIGlzIHNldC4gU2VlIGB2aWRlby1hdXRvcGxheS5jc3NgLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5zdGFsbEF1dG9wbGF5RWxlbWVudHNfKCkge1xuICAgIGNvbnN0IHt2aWRlb30gPSB0aGlzO1xuICAgIGNvbnN0IHtlbGVtZW50LCB3aW59ID0gdGhpcy52aWRlbztcblxuICAgIGlmIChcbiAgICAgIGVsZW1lbnQuaGFzQXR0cmlidXRlKFZpZGVvQXR0cmlidXRlcy5OT19BVURJTykgfHxcbiAgICAgIGVsZW1lbnQuc2lnbmFscygpLmdldChWaWRlb1NlcnZpY2VTaWduYWxzLlVTRVJfSU5URVJBQ1RFRClcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhbmltYXRpb24gPSByZW5kZXJJY29uKHdpbiwgZWxlbWVudCk7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBbYW5pbWF0aW9uXTtcblxuICAgIC8qKiBAcGFyYW0ge2Jvb2xlYW59IHNob3VsZERpc3BsYXkgKi9cbiAgICBmdW5jdGlvbiB0b2dnbGVFbGVtZW50cyhzaG91bGREaXNwbGF5KSB7XG4gICAgICB2aWRlby5tdXRhdGVFbGVtZW50U2tpcFJlbWVhc3VyZSgoKSA9PiB7XG4gICAgICAgIGNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgICAgdG9nZ2xlKGNoaWxkLCBzaG91bGREaXNwbGF5KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogQHBhcmFtIHtib29sZWFufSBpc1BsYXlpbmcgKi9cbiAgICBmdW5jdGlvbiB0b2dnbGVBbmltYXRpb24oaXNQbGF5aW5nKSB7XG4gICAgICB2aWRlby5tdXRhdGVFbGVtZW50U2tpcFJlbWVhc3VyZSgoKSA9PlxuICAgICAgICBhbmltYXRpb24uY2xhc3NMaXN0LnRvZ2dsZSgnYW1wLXZpZGVvLWVxLXBsYXknLCBpc1BsYXlpbmcpXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHVubGlzdGVuZXJzID0gW1xuICAgICAgbGlzdGVuKGVsZW1lbnQsIFZpZGVvRXZlbnRzLlBBVVNFLCAoKSA9PiB0b2dnbGVBbmltYXRpb24oZmFsc2UpKSxcbiAgICAgIGxpc3RlbihlbGVtZW50LCBWaWRlb0V2ZW50cy5QTEFZSU5HLCAoKSA9PiB0b2dnbGVBbmltYXRpb24odHJ1ZSkpLFxuICAgICAgbGlzdGVuKGVsZW1lbnQsIFZpZGVvRXZlbnRzLkFEX1NUQVJULCAoKSA9PiB7XG4gICAgICAgIHRvZ2dsZUVsZW1lbnRzKGZhbHNlKTtcbiAgICAgICAgdmlkZW8uc2hvd0NvbnRyb2xzKCk7XG4gICAgICB9KSxcbiAgICAgIGxpc3RlbihlbGVtZW50LCBWaWRlb0V2ZW50cy5BRF9FTkQsICgpID0+IHtcbiAgICAgICAgdG9nZ2xlRWxlbWVudHModHJ1ZSk7XG4gICAgICAgIHZpZGVvLmhpZGVDb250cm9scygpO1xuICAgICAgfSksXG4gICAgICBsaXN0ZW4oZWxlbWVudCwgVmlkZW9FdmVudHMuVU5NVVRFRCwgKCkgPT4gdXNlckludGVyYWN0ZWRXaXRoKHZpZGVvKSksXG4gICAgXTtcblxuICAgIGlmICh2aWRlby5pc0ludGVyYWN0aXZlKCkpIHtcbiAgICAgIHZpZGVvLmhpZGVDb250cm9scygpO1xuXG4gICAgICBjb25zdCBtYXNrID0gcmVuZGVySW50ZXJhY3Rpb25PdmVybGF5KGVsZW1lbnQsIHRoaXMubWV0YWRhdGFfKTtcbiAgICAgIGNoaWxkcmVuLnB1c2gobWFzayk7XG4gICAgICB1bmxpc3RlbmVycy5wdXNoKGxpc3RlbihtYXNrLCAnY2xpY2snLCAoKSA9PiB1c2VySW50ZXJhY3RlZFdpdGgodmlkZW8pKSk7XG4gICAgfVxuXG4gICAgdmlkZW8ubXV0YXRlRWxlbWVudFNraXBSZW1lYXN1cmUoKCkgPT4ge1xuICAgICAgY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmlzUm9sbGluZ0FkXykge1xuICAgICAgdG9nZ2xlRWxlbWVudHMoZmFsc2UpO1xuICAgIH1cblxuICAgIHZpZGVvXG4gICAgICAuc2lnbmFscygpXG4gICAgICAud2hlblNpZ25hbChWaWRlb1NlcnZpY2VTaWduYWxzLlVTRVJfSU5URVJBQ1RFRClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5maXJzdFBsYXlFdmVudE9yTm9vcF8oKTtcbiAgICAgICAgaWYgKHZpZGVvLmlzSW50ZXJhY3RpdmUoKSkge1xuICAgICAgICAgIHZpZGVvLnNob3dDb250cm9scygpO1xuICAgICAgICB9XG4gICAgICAgIHZpZGVvLnVubXV0ZSgpO1xuICAgICAgICB1bmxpc3RlbmVycy5mb3JFYWNoKCh1bmxpc3RlbmVyKSA9PiB7XG4gICAgICAgICAgdW5saXN0ZW5lcigpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmlkZW8ubXV0YXRlRWxlbWVudFNraXBSZW1lYXN1cmUoKCkgPT4ge1xuICAgICAgICAgIGNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICByZW1vdmVFbGVtZW50KGNoaWxkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB2aXNpYmlsaXR5IG9mIGEgbG9hZGVkIGF1dG9wbGF5IHZpZGVvIGNoYW5nZXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhdXRvcGxheUxvYWRlZFZpZGVvVmlzaWJpbGl0eUNoYW5nZWRfKCkge1xuICAgIGlmICghdGhpcy5tYW5hZ2VQbGF5YmFja18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlXykge1xuICAgICAgdGhpcy52aXNpYmlsaXR5U2Vzc2lvbk1hbmFnZXJfLmJlZ2luU2Vzc2lvbigpO1xuICAgICAgdGhpcy52aWRlby5wbGF5KC8qYXV0b3BsYXkqLyB0cnVlKTtcbiAgICAgIHRoaXMucGxheUNhbGxlZEJ5QXV0b3BsYXlfID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuaXNQbGF5aW5nXykge1xuICAgICAgICB0aGlzLnZpc2liaWxpdHlTZXNzaW9uTWFuYWdlcl8uZW5kU2Vzc2lvbigpO1xuICAgICAgfVxuICAgICAgdGhpcy52aWRlby5wYXVzZSgpO1xuICAgICAgdGhpcy5wYXVzZUNhbGxlZEJ5QXV0b3BsYXlfID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdmlzaWJpbGl0eSBvZiBhIGxvYWRlZCBub24tYXV0b3BsYXkgdmlkZW8gY2hhbmdlcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG5vbkF1dG9wbGF5TG9hZGVkVmlkZW9WaXNpYmlsaXR5Q2hhbmdlZF8oKSB7XG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlXykge1xuICAgICAgdGhpcy52aXNpYmlsaXR5U2Vzc2lvbk1hbmFnZXJfLmJlZ2luU2Vzc2lvbigpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1BsYXlpbmdfKSB7XG4gICAgICB0aGlzLnZpc2liaWxpdHlTZXNzaW9uTWFuYWdlcl8uZW5kU2Vzc2lvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgYW4gSW50ZXJzZWN0aW9uT2JzZXJ2ZXIuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWaXNpYmxlXG4gICAqIEBwYWNrYWdlXG4gICAqL1xuICB1cGRhdGVWaXNpYmlsaXR5KGlzVmlzaWJsZSkge1xuICAgIGNvbnN0IHdhc1Zpc2libGUgPSB0aGlzLmlzVmlzaWJsZV87XG4gICAgdGhpcy5pc1Zpc2libGVfID0gaXNWaXNpYmxlO1xuICAgIGlmIChpc1Zpc2libGUgIT0gd2FzVmlzaWJsZSkge1xuICAgICAgdGhpcy52aWRlb1Zpc2liaWxpdHlDaGFuZ2VkXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHZpZGVvIGlzIHBhdXNlZCBvciBwbGF5aW5nIGFmdGVyIHRoZSB1c2VyIGludGVyYWN0ZWRcbiAgICogd2l0aCBpdCBvciBwbGF5aW5nIHRocm91Z2ggYXV0b3BsYXlcbiAgICogQHJldHVybiB7IS4uL3ZpZGVvLWludGVyZmFjZS5QbGF5aW5nU3RhdGVEZWZ9XG4gICAqL1xuICBnZXRQbGF5aW5nU3RhdGUoKSB7XG4gICAgaWYgKCF0aGlzLmlzUGxheWluZ18pIHtcbiAgICAgIHJldHVybiBQbGF5aW5nU3RhdGVzLlBBVVNFRDtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLmlzUGxheWluZ18gJiZcbiAgICAgIHRoaXMucGxheUNhbGxlZEJ5QXV0b3BsYXlfICYmXG4gICAgICAhdGhpcy51c2VySW50ZXJhY3RlZCgpXG4gICAgKSB7XG4gICAgICByZXR1cm4gUGxheWluZ1N0YXRlcy5QTEFZSU5HX0FVVE87XG4gICAgfVxuXG4gICAgcmV0dXJuIFBsYXlpbmdTdGF0ZXMuUExBWUlOR19NQU5VQUw7XG4gIH1cblxuICAvKiogQHJldHVybiB7Ym9vbGVhbn0gKi9cbiAgaXNSb2xsaW5nQWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNSb2xsaW5nQWRfO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgdmlkZW8gd2FzIGludGVyYWN0ZWQgd2l0aCBvciBub3RcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHVzZXJJbnRlcmFjdGVkKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnZpZGVvLnNpZ25hbHMoKS5nZXQoVmlkZW9TZXJ2aWNlU2lnbmFscy5VU0VSX0lOVEVSQUNURUQpICE9IG51bGxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxlY3RzIGEgc25hcHNob3Qgb2YgdGhlIGN1cnJlbnQgdmlkZW8gc3RhdGUgZm9yIHZpZGVvIGFuYWx5dGljc1xuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhVmlkZW9BbmFseXRpY3NEZXRhaWxzRGVmPn1cbiAgICovXG4gIGdldEFuYWx5dGljc0RldGFpbHMoKSB7XG4gICAgY29uc3Qge3ZpZGVvfSA9IHRoaXM7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgIGlzQXV0b3BsYXlTdXBwb3J0ZWQodGhpcy5hbXBkb2NfLndpbiksXG4gICAgICBtZWFzdXJlSW50ZXJzZWN0aW9uKHZpZGVvLmVsZW1lbnQpLFxuICAgIF0pLnRoZW4oKHJlc3BvbnNlcykgPT4ge1xuICAgICAgY29uc3QgaXNBdXRvcGxheVN1cHBvcnRlZCA9IC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi8gKHJlc3BvbnNlc1swXSk7XG4gICAgICBjb25zdCBpbnRlcnNlY3Rpb24gPSAvKiogQHR5cGUgeyFJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5fSAqLyAoXG4gICAgICAgIHJlc3BvbnNlc1sxXVxuICAgICAgKTtcbiAgICAgIGNvbnN0IHtoZWlnaHQsIHdpZHRofSA9IGludGVyc2VjdGlvbi5ib3VuZGluZ0NsaWVudFJlY3Q7XG4gICAgICBjb25zdCBhdXRvcGxheSA9IHRoaXMuaGFzQXV0b3BsYXkgJiYgaXNBdXRvcGxheVN1cHBvcnRlZDtcbiAgICAgIGNvbnN0IHBsYXllZFJhbmdlcyA9IHZpZGVvLmdldFBsYXllZFJhbmdlcygpO1xuICAgICAgY29uc3QgcGxheWVkVG90YWwgPSBwbGF5ZWRSYW5nZXMucmVkdWNlKFxuICAgICAgICAoYWNjLCByYW5nZSkgPT4gYWNjICsgcmFuZ2VbMV0gLSByYW5nZVswXSxcbiAgICAgICAgMFxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ2F1dG9wbGF5JzogYXV0b3BsYXksXG4gICAgICAgICdjdXJyZW50VGltZSc6IHZpZGVvLmdldEN1cnJlbnRUaW1lKCksXG4gICAgICAgICdkdXJhdGlvbic6IHZpZGVvLmdldER1cmF0aW9uKCksXG4gICAgICAgIC8vIFRPRE8oY3ZpYWxpeik6IGFkZCBmdWxsc2NyZWVuXG4gICAgICAgICdoZWlnaHQnOiBoZWlnaHQsXG4gICAgICAgICdpZCc6IHZpZGVvLmVsZW1lbnQuaWQsXG4gICAgICAgICdtdXRlZCc6IHRoaXMubXV0ZWRfLFxuICAgICAgICAncGxheWVkVG90YWwnOiBwbGF5ZWRUb3RhbCxcbiAgICAgICAgJ3BsYXllZFJhbmdlc0pzb24nOiBKU09OLnN0cmluZ2lmeShwbGF5ZWRSYW5nZXMpLFxuICAgICAgICAnc3RhdGUnOiB0aGlzLmdldFBsYXlpbmdTdGF0ZSgpLFxuICAgICAgICAnd2lkdGgnOiB3aWR0aCxcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFBbXBFbGVtZW50fSB2aWRlb1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqIEByZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIHN1cHBvcnRzRnVsbHNjcmVlblZpYUFwaSh2aWRlbykge1xuICAvLyBUT0RPKGFsYW5vcm96Y28pOiBEZXRlcm1pbmUgdGhpcyB2aWEgYSBmbGFnIGluIHRoZSBjb21wb25lbnQgaXRzZWxmLlxuICByZXR1cm4gISF7XG4gICAgJ2FtcC1kYWlseW1vdGlvbic6IHRydWUsXG4gICAgJ2FtcC1pbWEtdmlkZW8nOiB0cnVlLFxuICB9W3ZpZGVvLnRhZ05hbWUudG9Mb3dlckNhc2UoKV07XG59XG5cbi8qKiBNYW5hZ2VzIHJvdGF0ZS10by1mdWxsc2NyZWVuIHZpZGVvLiAqL1xuZXhwb3J0IGNsYXNzIEF1dG9GdWxsc2NyZWVuTWFuYWdlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqIEBwYXJhbSB7IVZpZGVvTWFuYWdlcn0gbWFuYWdlclxuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wZG9jLCBtYW5hZ2VyKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVZpZGVvTWFuYWdlcn0gKi9cbiAgICB0aGlzLm1hbmFnZXJfID0gbWFuYWdlcjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcGRvYy1pbXBsLkFtcERvY30gKi9cbiAgICB0aGlzLmFtcGRvY18gPSBhbXBkb2M7XG5cbiAgICAvKiogQHByaXZhdGUgez8uLi92aWRlby1pbnRlcmZhY2UuVmlkZW9PckJhc2VFbGVtZW50RGVmfSAqL1xuICAgIHRoaXMuY3VycmVudGx5SW5GdWxsc2NyZWVuXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez8uLi92aWRlby1pbnRlcmZhY2UuVmlkZW9PckJhc2VFbGVtZW50RGVmfSAqL1xuICAgIHRoaXMuY3VycmVudGx5Q2VudGVyZWRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTwhLi4vdmlkZW8taW50ZXJmYWNlLlZpZGVvT3JCYXNlRWxlbWVudERlZj59ICovXG4gICAgdGhpcy5lbnRyaWVzXyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogVW5saXN0ZW5lcnMgZm9yIGdsb2JhbCBvYmplY3RzXG4gICAgICogQHByaXZhdGUgeyFBcnJheTwhVW5saXN0ZW5EZWY+fVxuICAgICAqL1xuICAgIHRoaXMudW5saXN0ZW5lcnNfID0gW107XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUganNkb2MvcmVxdWlyZS1yZXR1cm5zXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLmJvdW5kU2VsZWN0QmVzdENlbnRlcmVkXyA9ICgpID0+IHRoaXMuc2VsZWN0QmVzdENlbnRlcmVkSW5Qb3J0cmFpdF8oKTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7IS4uL3ZpZGVvLWludGVyZmFjZS5WaWRlb09yQmFzZUVsZW1lbnREZWZ9IHZpZGVvXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmJvdW5kSW5jbHVkZU9ubHlQbGF5aW5nXyA9ICh2aWRlbykgPT5cbiAgICAgIHRoaXMuZ2V0UGxheWluZ1N0YXRlXyh2aWRlbykgPT0gUGxheWluZ1N0YXRlcy5QTEFZSU5HX01BTlVBTDtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7IUludGVyc2VjdGlvbk9ic2VydmVyRW50cnl9IGFcbiAgICAgKiBAcGFyYW0geyFJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5fSBiXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuYm91bmRDb21wYXJlRW50cmllc18gPSAoYSwgYikgPT4gdGhpcy5jb21wYXJlRW50cmllc18oYSwgYik7XG5cbiAgICB0aGlzLmluc3RhbGxPcmllbnRhdGlvbk9ic2VydmVyXygpO1xuICAgIHRoaXMuaW5zdGFsbEZ1bGxzY3JlZW5MaXN0ZW5lcl8oKTtcbiAgfVxuXG4gIC8qKiBAcHVibGljICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy51bmxpc3RlbmVyc18uZm9yRWFjaCgodW5saXN0ZW4pID0+IHVubGlzdGVuKCkpO1xuICAgIHRoaXMudW5saXN0ZW5lcnNfLmxlbmd0aCA9IDA7XG4gIH1cblxuICAvKiogQHBhcmFtIHshVmlkZW9FbnRyeX0gZW50cnkgKi9cbiAgcmVnaXN0ZXIoZW50cnkpIHtcbiAgICBjb25zdCB7dmlkZW99ID0gZW50cnk7XG4gICAgY29uc3Qge2VsZW1lbnR9ID0gdmlkZW87XG5cbiAgICBpZiAoIXRoaXMuY2FuRnVsbHNjcmVlbl8oZWxlbWVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmVudHJpZXNfLnB1c2godmlkZW8pO1xuXG4gICAgbGlzdGVuKGVsZW1lbnQsIFZpZGVvRXZlbnRzLlBBVVNFLCB0aGlzLmJvdW5kU2VsZWN0QmVzdENlbnRlcmVkXyk7XG4gICAgbGlzdGVuKGVsZW1lbnQsIFZpZGVvRXZlbnRzLlBMQVlJTkcsIHRoaXMuYm91bmRTZWxlY3RCZXN0Q2VudGVyZWRfKTtcbiAgICBsaXN0ZW4oZWxlbWVudCwgVmlkZW9FdmVudHMuRU5ERUQsIHRoaXMuYm91bmRTZWxlY3RCZXN0Q2VudGVyZWRfKTtcblxuICAgIHZpZGVvXG4gICAgICAuc2lnbmFscygpXG4gICAgICAud2hlblNpZ25hbChWaWRlb1NlcnZpY2VTaWduYWxzLlVTRVJfSU5URVJBQ1RFRClcbiAgICAgIC50aGVuKHRoaXMuYm91bmRTZWxlY3RCZXN0Q2VudGVyZWRfKTtcblxuICAgIC8vIFNldCBhbHdheXNcbiAgICB0aGlzLnNlbGVjdEJlc3RDZW50ZXJlZEluUG9ydHJhaXRfKCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgaW5zdGFsbEZ1bGxzY3JlZW5MaXN0ZW5lcl8oKSB7XG4gICAgY29uc3Qgcm9vdCA9IHRoaXMuYW1wZG9jXy5nZXRSb290Tm9kZSgpO1xuICAgIGNvbnN0IGV4aXRIYW5kbGVyID0gKCkgPT4gdGhpcy5vbkZ1bGxzY3JlZW5FeGl0XygpO1xuICAgIHRoaXMudW5saXN0ZW5lcnNfLnB1c2goXG4gICAgICBsaXN0ZW4ocm9vdCwgJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLCBleGl0SGFuZGxlciksXG4gICAgICBsaXN0ZW4ocm9vdCwgJ21vemZ1bGxzY3JlZW5jaGFuZ2UnLCBleGl0SGFuZGxlciksXG4gICAgICBsaXN0ZW4ocm9vdCwgJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBleGl0SGFuZGxlciksXG4gICAgICBsaXN0ZW4ocm9vdCwgJ01TRnVsbHNjcmVlbkNoYW5nZScsIGV4aXRIYW5kbGVyKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBpc0luTGFuZHNjYXBlKCkge1xuICAgIHJldHVybiBpc0xhbmRzY2FwZSh0aGlzLmFtcGRvY18ud2luKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSB2aWRlb1xuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2FuRnVsbHNjcmVlbl8odmlkZW8pIHtcbiAgICAvLyBTYWZhcmkgYW5kIGlPUyBjYW4gb25seSBmdWxsc2NyZWVuIDx2aWRlbz4gZWxlbWVudHMgZGlyZWN0bHkuIEluIGNhc2VzXG4gICAgLy8gd2hlcmUgdGhlIHBsYXllciBjb21wb25lbnQgaXMgaW1wbGVtZW50ZWQgdmlhIGFuIDxpZnJhbWU+LCB3ZSBuZWVkIHRvXG4gICAgLy8gcmVseSBvbiBhIHBvc3RNZXNzYWdlIEFQSSB0byBmdWxsc2NyZWVuLiBTdWNoIGFuIEFQSSBpcyBub3QgbmVjZXNzYXJpbHlcbiAgICAvLyBwcm92aWRlZCBieSBldmVyeSBwbGF5ZXIuXG4gICAgY29uc3QgaW50ZXJuYWxFbGVtZW50ID0gZ2V0SW50ZXJuYWxWaWRlb0VsZW1lbnRGb3IodmlkZW8pO1xuICAgIGlmIChpbnRlcm5hbEVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09ICd2aWRlbycpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjb25zdCBwbGF0Zm9ybSA9IFNlcnZpY2VzLnBsYXRmb3JtRm9yKHRoaXMuYW1wZG9jXy53aW4pO1xuICAgIGlmICghKHBsYXRmb3JtLmlzSW9zKCkgfHwgcGxhdGZvcm0uaXNTYWZhcmkoKSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gc3VwcG9ydHNGdWxsc2NyZWVuVmlhQXBpKHZpZGVvKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBvbkZ1bGxzY3JlZW5FeGl0XygpIHtcbiAgICB0aGlzLmN1cnJlbnRseUluRnVsbHNjcmVlbl8gPSBudWxsO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGluc3RhbGxPcmllbnRhdGlvbk9ic2VydmVyXygpIHtcbiAgICAvLyBUT0RPKGFsYW5vcm96Y28pIFVwZGF0ZSBiYXNlZCBvbiBzdXBwb3J0XG4gICAgY29uc3Qge3dpbn0gPSB0aGlzLmFtcGRvY187XG4gICAgY29uc3Qge3NjcmVlbn0gPSB3aW47XG4gICAgLy8gQ2hyb21lIGNvbnNpZGVycyAnb3JpZW50YXRpb25jaGFuZ2UnIHRvIGJlIGFuIHVudHJ1c3RlZCBldmVudCwgYnV0XG4gICAgLy8gJ2NoYW5nZScgb24gc2NyZWVuLm9yaWVudGF0aW9uIGlzIGNvbnNpZGVyZWQgYSB1c2VyIGludGVyYWN0aW9uLlxuICAgIC8vIFdlIHN0aWxsIG5lZWQgdG8gbGlzdGVuIHRvICdvcmllbnRhdGlvbmNoYW5nZScgb24gQ2hyb21lIGluIG9yZGVyIHRvXG4gICAgLy8gZXhpdCBmdWxsc2NyZWVuIHNpbmNlICdjaGFuZ2UnIGRvZXMgbm90IGZpcmUgaW4gdGhpcyBjYXNlLlxuICAgIGlmIChzY3JlZW4gJiYgJ29yaWVudGF0aW9uJyBpbiBzY3JlZW4pIHtcbiAgICAgIGNvbnN0IG9yaWVudCA9IC8qKiBAdHlwZSB7IVNjcmVlbk9yaWVudGF0aW9ufSAqLyAoc2NyZWVuLm9yaWVudGF0aW9uKTtcbiAgICAgIHRoaXMudW5saXN0ZW5lcnNfLnB1c2goXG4gICAgICAgIGxpc3RlbihvcmllbnQsICdjaGFuZ2UnLCAoKSA9PiB0aGlzLm9uUm90YXRpb25fKCkpXG4gICAgICApO1xuICAgIH1cbiAgICAvLyBpT1MgU2FmYXJpIGRvZXMgbm90IGhhdmUgc2NyZWVuLm9yaWVudGF0aW9uIGJ1dCBjbGFzc2lmaWVzXG4gICAgLy8gJ29yaWVudGF0aW9uY2hhbmdlJyBhcyBhIHVzZXIgaW50ZXJhY3Rpb24uXG4gICAgdGhpcy51bmxpc3RlbmVyc18ucHVzaChcbiAgICAgIGxpc3Rlbih3aW4sICdvcmllbnRhdGlvbmNoYW5nZScsICgpID0+IHRoaXMub25Sb3RhdGlvbl8oKSlcbiAgICApO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIG9uUm90YXRpb25fKCkge1xuICAgIGlmICh0aGlzLmlzSW5MYW5kc2NhcGUoKSkge1xuICAgICAgaWYgKHRoaXMuY3VycmVudGx5Q2VudGVyZWRfICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lbnRlcl8odGhpcy5jdXJyZW50bHlDZW50ZXJlZF8pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5jdXJyZW50bHlJbkZ1bGxzY3JlZW5fKSB7XG4gICAgICB0aGlzLmV4aXRfKHRoaXMuY3VycmVudGx5SW5GdWxsc2NyZWVuXyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4uL3ZpZGVvLWludGVyZmFjZS5WaWRlb09yQmFzZUVsZW1lbnREZWZ9IHZpZGVvXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbnRlcl8odmlkZW8pIHtcbiAgICBjb25zdCBwbGF0Zm9ybSA9IFNlcnZpY2VzLnBsYXRmb3JtRm9yKHRoaXMuYW1wZG9jXy53aW4pO1xuXG4gICAgdGhpcy5jdXJyZW50bHlJbkZ1bGxzY3JlZW5fID0gdmlkZW87XG5cbiAgICBpZiAocGxhdGZvcm0uaXNBbmRyb2lkKCkgJiYgcGxhdGZvcm0uaXNDaHJvbWUoKSkge1xuICAgICAgLy8gQ2hyb21lIG9uIEFuZHJvaWQgc29tZWhvdyBrbm93cyB3aGF0IHdlJ3JlIGRvaW5nIGFuZCBleGVjdXRlcyBhIG5pY2VcbiAgICAgIC8vIHRyYW5zaXRpb24gYnkgZGVmYXVsdC4gRGVsZWdhdGluZyB0byBicm93c2VyLlxuICAgICAgdmlkZW8uZnVsbHNjcmVlbkVudGVyKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zY3JvbGxJbnRvSWZOb3RWaXNpYmxlXyh2aWRlbykudGhlbigoKSA9PiB2aWRlby5mdWxsc2NyZWVuRW50ZXIoKSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshLi4vdmlkZW8taW50ZXJmYWNlLlZpZGVvT3JCYXNlRWxlbWVudERlZn0gdmlkZW9cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGV4aXRfKHZpZGVvKSB7XG4gICAgdGhpcy5jdXJyZW50bHlJbkZ1bGxzY3JlZW5fID0gbnVsbDtcblxuICAgIHRoaXMuc2Nyb2xsSW50b0lmTm90VmlzaWJsZV8odmlkZW8sICdjZW50ZXInKS50aGVuKCgpID0+XG4gICAgICB2aWRlby5mdWxsc2NyZWVuRXhpdCgpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRvIGEgdmlkZW8gaWYgaXQncyBub3QgaW4gdmlldy5cbiAgICogQHBhcmFtIHshLi4vdmlkZW8taW50ZXJmYWNlLlZpZGVvT3JCYXNlRWxlbWVudERlZn0gdmlkZW9cbiAgICogQHBhcmFtIHs/c3RyaW5nPX0gb3B0UG9zXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2Nyb2xsSW50b0lmTm90VmlzaWJsZV8odmlkZW8sIG9wdFBvcyA9IG51bGwpIHtcbiAgICBjb25zdCB7ZWxlbWVudH0gPSB2aWRlbztcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuZ2V0Vmlld3BvcnRfKCk7XG5cbiAgICByZXR1cm4gdGhpcy5vbmNlT3JpZW50YXRpb25DaGFuZ2VzXygpXG4gICAgICAudGhlbigoKSA9PiBtZWFzdXJlSW50ZXJzZWN0aW9uKGVsZW1lbnQpKVxuICAgICAgLnRoZW4oKHtib3VuZGluZ0NsaWVudFJlY3R9KSA9PiB7XG4gICAgICAgIGNvbnN0IHtib3R0b20sIHRvcH0gPSBib3VuZGluZ0NsaWVudFJlY3Q7XG4gICAgICAgIGNvbnN0IHZoID0gdmlld3BvcnQuZ2V0U2l6ZSgpLmhlaWdodDtcbiAgICAgICAgY29uc3QgZnVsbHlWaXNpYmxlID0gdG9wID49IDAgJiYgYm90dG9tIDw9IHZoO1xuICAgICAgICBpZiAoZnVsbHlWaXNpYmxlKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvcyA9IG9wdFBvc1xuICAgICAgICAgID8gZGV2KCkuYXNzZXJ0U3RyaW5nKG9wdFBvcylcbiAgICAgICAgICA6IGJvdHRvbSA+IHZoXG4gICAgICAgICAgPyAnYm90dG9tJ1xuICAgICAgICAgIDogJ3RvcCc7XG4gICAgICAgIHJldHVybiB2aWV3cG9ydC5hbmltYXRlU2Nyb2xsSW50b1ZpZXcoZWxlbWVudCwgcG9zKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm4gey4vdmlld3BvcnQvdmlld3BvcnQtaW50ZXJmYWNlLlZpZXdwb3J0SW50ZXJmYWNlfVxuICAgKi9cbiAgZ2V0Vmlld3BvcnRfKCkge1xuICAgIHJldHVybiBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyh0aGlzLmFtcGRvY18pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgb25jZU9yaWVudGF0aW9uQ2hhbmdlc18oKSB7XG4gICAgY29uc3QgbWFnaWNOdW1iZXIgPSAzMzA7XG4gICAgcmV0dXJuIFNlcnZpY2VzLnRpbWVyRm9yKHRoaXMuYW1wZG9jXy53aW4pLnByb21pc2UobWFnaWNOdW1iZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm4geyFQcm9taXNlPD8uLi92aWRlby1pbnRlcmZhY2UuVmlkZW9PckJhc2VFbGVtZW50RGVmPn1cbiAgICovXG4gIHNlbGVjdEJlc3RDZW50ZXJlZEluUG9ydHJhaXRfKCkge1xuICAgIGlmICh0aGlzLmlzSW5MYW5kc2NhcGUoKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmN1cnJlbnRseUNlbnRlcmVkXyk7XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50bHlDZW50ZXJlZF8gPSBudWxsO1xuXG4gICAgY29uc3QgaW50ZXJzZWN0aW9uc1Byb21pc2UgPSB0aGlzLmVudHJpZXNfXG4gICAgICAuZmlsdGVyKHRoaXMuYm91bmRJbmNsdWRlT25seVBsYXlpbmdfKVxuICAgICAgLm1hcCgoZSkgPT4gbWVhc3VyZUludGVyc2VjdGlvbihlLmVsZW1lbnQpKTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChpbnRlcnNlY3Rpb25zUHJvbWlzZSkudGhlbigoaW50ZXJzZWN0aW9ucykgPT4ge1xuICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBpbnRlcnNlY3Rpb25zLnNvcnQodGhpcy5ib3VuZENvbXBhcmVFbnRyaWVzXylbMF07XG5cbiAgICAgIGlmIChcbiAgICAgICAgc2VsZWN0ZWQgJiZcbiAgICAgICAgc2VsZWN0ZWQuaW50ZXJzZWN0aW9uUmF0aW8gPiBNSU5fVklTSUJJTElUWV9SQVRJT19GT1JfQVVUT1BMQVlcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gc2VsZWN0ZWQudGFyZ2V0XG4gICAgICAgICAgLmdldEltcGwoKVxuICAgICAgICAgIC50aGVuKCh2aWRlbykgPT4gKHRoaXMuY3VycmVudGx5Q2VudGVyZWRfID0gdmlkZW8pKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY3VycmVudGx5Q2VudGVyZWRfO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBhcmVzIHR3byB2aWRlb3MgaW4gb3JkZXIgdG8gc29ydCB0aGVtIGJ5IFwiYmVzdCBjZW50ZXJlZFwiLlxuICAgKiBAcGFyYW0geyFJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5fSBhXG4gICAqIEBwYXJhbSB7IUludGVyc2VjdGlvbk9ic2VydmVyRW50cnl9IGJcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgY29tcGFyZUVudHJpZXNfKGEsIGIpIHtcbiAgICBjb25zdCB7Ym91bmRpbmdDbGllbnRSZWN0OiByZWN0QSwgaW50ZXJzZWN0aW9uUmF0aW86IHJhdGlvQX0gPSBhO1xuICAgIGNvbnN0IHtib3VuZGluZ0NsaWVudFJlY3Q6IHJlY3RCLCBpbnRlcnNlY3Rpb25SYXRpbzogcmF0aW9CfSA9IGI7XG5cbiAgICAvLyBQcmlvcml0aXplIGJ5IGhvdyB2aXNpYmxlIHRoZXkgYXJlLCB3aXRoIGEgdG9sZXJhbmNlIG9mIDEwJVxuICAgIGNvbnN0IHJhdGlvVG9sZXJhbmNlID0gMC4xO1xuICAgIGNvbnN0IHJhdGlvRGVsdGEgPSByYXRpb0EgLSByYXRpb0I7XG4gICAgaWYgKE1hdGguYWJzKHJhdGlvRGVsdGEpID4gcmF0aW9Ub2xlcmFuY2UpIHtcbiAgICAgIHJldHVybiByYXRpb0RlbHRhO1xuICAgIH1cblxuICAgIC8vIFByaW9yaXRpemUgYnkgZGlzdGFuY2UgZnJvbSBjZW50ZXIuXG4gICAgY29uc3Qgdmlld3BvcnQgPSBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyh0aGlzLmFtcGRvY18pO1xuICAgIGNvbnN0IGNlbnRlckEgPSBjZW50ZXJEaXN0KHZpZXdwb3J0LCByZWN0QSk7XG4gICAgY29uc3QgY2VudGVyQiA9IGNlbnRlckRpc3Qodmlld3BvcnQsIHJlY3RCKTtcbiAgICBpZiAoY2VudGVyQSA8IGNlbnRlckIgfHwgY2VudGVyQSA+IGNlbnRlckIpIHtcbiAgICAgIHJldHVybiBjZW50ZXJBIC0gY2VudGVyQjtcbiAgICB9XG5cbiAgICAvLyBFdmVyeXRoaW5nIGVsc2UgZmFpbGluZywgY2hvb3NlIHRoZSBoaWdoZXN0IGVsZW1lbnQuXG4gICAgcmV0dXJuIHJlY3RBLnRvcCAtIHJlY3RCLnRvcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi92aWRlby1pbnRlcmZhY2UuVmlkZW9PckJhc2VFbGVtZW50RGVmfSB2aWRlb1xuICAgKiBAcmV0dXJuIHshLi4vdmlkZW8taW50ZXJmYWNlLlBsYXlpbmdTdGF0ZURlZn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldFBsYXlpbmdTdGF0ZV8odmlkZW8pIHtcbiAgICByZXR1cm4gdGhpcy5tYW5hZ2VyXy5nZXRQbGF5aW5nU3RhdGUoXG4gICAgICAvKiogQHR5cGUgeyEuLi92aWRlby1pbnRlcmZhY2UuVmlkZW9JbnRlcmZhY2V9ICovICh2aWRlbylcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshLi92aWV3cG9ydC92aWV3cG9ydC1pbnRlcmZhY2UuVmlld3BvcnRJbnRlcmZhY2V9IHZpZXdwb3J0XG4gKiBAcGFyYW0ge3t0b3A6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSByZWN0XG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGNlbnRlckRpc3Qodmlld3BvcnQsIHJlY3QpIHtcbiAgY29uc3QgY2VudGVyWSA9IHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyO1xuICBjb25zdCBjZW50ZXJWaWV3cG9ydCA9IHZpZXdwb3J0LmdldFNpemUoKS5oZWlnaHQgLyAyO1xuICByZXR1cm4gTWF0aC5hYnMoY2VudGVyWSAtIGNlbnRlclZpZXdwb3J0KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNMYW5kc2NhcGUod2luKSB7XG4gIGlmICh3aW4uc2NyZWVuICYmICdvcmllbnRhdGlvbicgaW4gd2luLnNjcmVlbikge1xuICAgIHJldHVybiB3aW4uc2NyZWVuLm9yaWVudGF0aW9uLnR5cGUuc3RhcnRzV2l0aCgnbGFuZHNjYXBlJyk7XG4gIH1cbiAgcmV0dXJuIE1hdGguYWJzKHdpbi5vcmllbnRhdGlvbikgPT0gOTA7XG59XG5cbi8qKiBAdmlzaWJsZUZvclRlc3RpbmcgKi9cbmV4cG9ydCBjb25zdCBQRVJDRU5UQUdFX0lOVEVSVkFMID0gNTtcblxuLyoqIEB2aXNpYmxlRm9yVGVzdGluZyAqL1xuZXhwb3J0IGNvbnN0IFBFUkNFTlRBR0VfRlJFUVVFTkNZX1dIRU5fUEFVU0VEX01TID0gNTAwO1xuXG4vKiogQHByaXZhdGUgKi9cbmNvbnN0IFBFUkNFTlRBR0VfRlJFUVVFTkNZX01JTl9NUyA9IDI1MDtcblxuLyoqIEBwcml2YXRlICovXG5jb25zdCBQRVJDRU5UQUdFX0ZSRVFVRU5DWV9NQVhfTVMgPSA0MDAwO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIFwiaWRlYWxcIiBhbmFseXRpY3MgY2hlY2sgZnJlcXVlbmN5IGZyb20gcGxheWJhY2sgc3RhcnQsIGUuZy5cbiAqIHRoZSBhbW91bnQgb2YgbXMgYWZ0ZXIgZWFjaCBQRVJDRU5UQUdFX0lOVEVSVkFMLlxuICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uU2Vjb25kc1xuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVJZGVhbFBlcmNlbnRhZ2VGcmVxdWVuY3lNcyhkdXJhdGlvblNlY29uZHMpIHtcbiAgcmV0dXJuIGR1cmF0aW9uU2Vjb25kcyAqIDEwICogUEVSQ0VOVEFHRV9JTlRFUlZBTDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBcImFjdHVhbFwiIGFuYWx5dGljcyBjaGVjayBmcmVxdWVuY3kgYnkgY2FsY3VsYXRpbmcgdGhlIGlkZWFsXG4gKiBmcmVxdWVuY3kgYW5kIGNsYW1waW5nIGl0IGJldHdlZW4gTUlOIGFuZCBNQVguXG4gKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb25TZWNvbmRzXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZUFjdHVhbFBlcmNlbnRhZ2VGcmVxdWVuY3lNcyhkdXJhdGlvblNlY29uZHMpIHtcbiAgcmV0dXJuIGNsYW1wKFxuICAgIGNhbGN1bGF0ZUlkZWFsUGVyY2VudGFnZUZyZXF1ZW5jeU1zKGR1cmF0aW9uU2Vjb25kcyksXG4gICAgUEVSQ0VOVEFHRV9GUkVRVUVOQ1lfTUlOX01TLFxuICAgIFBFUkNFTlRBR0VfRlJFUVVFTkNZX01BWF9NU1xuICApO1xufVxuXG4vKipcbiAqIEhhbmRsZSBjYXNlcyBzdWNoIGFzIGxpdmVzdHJlYW1zIG9yIHZpZGVvcyB3aXRoIG5vIGR1cmF0aW9uIGluZm9ybWF0aW9uIGlzXG4gKiBhdmFpbGFibGUsIHdoZXJlIDEgc2Vjb25kIGlzIHRoZSBkZWZhdWx0IGR1cmF0aW9uIGZvciBzb21lIHZpZGVvIHBsYXllcnMuXG4gKiBAcGFyYW0gez9udW1iZXI9fSBkdXJhdGlvblxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgaXNEdXJhdGlvbkZpbml0ZU5vblplcm8gPSAoZHVyYXRpb24pID0+XG4gICEhZHVyYXRpb24gJiYgIWlzTmFOKGR1cmF0aW9uKSAmJiBkdXJhdGlvbiA+IDE7XG5cbi8qKiBAdmlzaWJsZUZvclRlc3RpbmcgKi9cbmV4cG9ydCBjbGFzcyBBbmFseXRpY3NQZXJjZW50YWdlVHJhY2tlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFWaWRlb0VudHJ5fSBlbnRyeVxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCBlbnRyeSkge1xuICAgIC8vIFRoaXMgaXMgZGVzdHJ1Y3R1cmVkIGluIGBjYWxjdWxhdGVfKClgLCBidXQgdGhlIGxpbnRlciB0aGlua3MgaXQncyB1bnVzZWRcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi90aW1lci1pbXBsLlRpbWVyfSAqL1xuICAgIHRoaXMudGltZXJfID0gU2VydmljZXMudGltZXJGb3Iod2luKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFWaWRlb0VudHJ5fSAqL1xuICAgIHRoaXMuZW50cnlfID0gZW50cnk7XG5cbiAgICAvKiogQHByaXZhdGUgez9BcnJheTwhVW5saXN0ZW5EZWY+fSAqL1xuICAgIHRoaXMudW5saXN0ZW5lcnNfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubGFzdF8gPSAwO1xuXG4gICAgLyoqXG4gICAgICogQ291bnRlciBmb3IgZWFjaCB0cmlnZ2VyIGBzdGFydGAuIFRoaXMgaXMgdG8gcHJldmVudCBkdXBsaWNhdGUgZXZlbnRzIGlmXG4gICAgICogdHdvIGNvbnNlY3V0aXZlIHRyaWdnZXJzIHRha2UgcGxhY2UsIG9yIHRvIHByZXZlbnQgZXZlbnRzIGZpcmluZyBvbmNlXG4gICAgICogdGhlIHRyYWNrZXIgaXMgc3RvcHBlZC5cbiAgICAgKiBAcHJpdmF0ZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMudHJpZ2dlcklkXyA9IDA7XG4gIH1cblxuICAvKiogQHB1YmxpYyAqL1xuICBzdGFydCgpIHtcbiAgICBjb25zdCB7ZWxlbWVudH0gPSB0aGlzLmVudHJ5Xy52aWRlbztcblxuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgdGhpcy51bmxpc3RlbmVyc18gPSB0aGlzLnVubGlzdGVuZXJzXyB8fCBbXTtcblxuICAgIC8vIElmIHRoZSB2aWRlbyBoYXMgYWxyZWFkeSBlbWl0dGVkIExPQURFRE1FVEFEQVRBLCB0aGUgZXZlbnQgYmVsb3dcbiAgICAvLyB3aWxsIG5ldmVyIGZpcmUsIHNvIHdlIGNoZWNrIGlmIGl0J3MgYWxyZWFkeSBhdmFpbGFibGUgaGVyZS5cbiAgICBpZiAodGhpcy5oYXNEdXJhdGlvbl8oKSkge1xuICAgICAgdGhpcy5jYWxjdWxhdGVfKHRoaXMudHJpZ2dlcklkXyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudW5saXN0ZW5lcnNfLnB1c2goXG4gICAgICAgIGxpc3Rlbk9uY2UoZWxlbWVudCwgVmlkZW9FdmVudHMuTE9BREVETUVUQURBVEEsICgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5oYXNEdXJhdGlvbl8oKSkge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVfKHRoaXMudHJpZ2dlcklkXyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLnVubGlzdGVuZXJzXy5wdXNoKFxuICAgICAgbGlzdGVuKGVsZW1lbnQsIFZpZGVvRXZlbnRzLkVOREVELCAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmhhc0R1cmF0aW9uXygpKSB7XG4gICAgICAgICAgdGhpcy5tYXliZVRyaWdnZXJfKC8qIG5vcm1hbGl6ZWRQZXJjZW50YWdlICovIDEwMCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAcHVibGljICovXG4gIHN0b3AoKSB7XG4gICAgaWYgKCF0aGlzLnVubGlzdGVuZXJzXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB3aGlsZSAodGhpcy51bmxpc3RlbmVyc18ubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy51bmxpc3RlbmVyc18ucG9wKCkoKTtcbiAgICB9XG4gICAgdGhpcy50cmlnZ2VySWRfKys7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhc0R1cmF0aW9uXygpIHtcbiAgICBjb25zdCB7dmlkZW99ID0gdGhpcy5lbnRyeV87XG4gICAgY29uc3QgZHVyYXRpb24gPSB2aWRlby5nZXREdXJhdGlvbigpO1xuXG4gICAgaWYgKCFpc0R1cmF0aW9uRmluaXRlTm9uWmVybyhkdXJhdGlvbikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBjYWxjdWxhdGVJZGVhbFBlcmNlbnRhZ2VGcmVxdWVuY3lNcyhkdXJhdGlvbikgPFxuICAgICAgUEVSQ0VOVEFHRV9GUkVRVUVOQ1lfTUlOX01TXG4gICAgKSB7XG4gICAgICBjb25zdCBiZXN0UmVzdWx0TGVuZ3RoID0gTWF0aC5jZWlsKFxuICAgICAgICAoUEVSQ0VOVEFHRV9GUkVRVUVOQ1lfTUlOX01TICogKDEwMCAvIFBFUkNFTlRBR0VfSU5URVJWQUwpKSAvIDEwMDBcbiAgICAgICk7XG5cbiAgICAgIHRoaXMud2FybkZvclRlc3RpbmdfKFxuICAgICAgICAnVGhpcyB2aWRlbyBpcyB0b28gc2hvcnQgZm9yIGB2aWRlby1wZXJjZW50YWdlLXBsYXllZGAuICcgK1xuICAgICAgICAgICdSZXBvcnRzIG1heSBiZSBpbm5hY3VyYXRlLiBGb3IgYmVzdCByZXN1bHRzLCB1c2UgdmlkZW9zIG92ZXInLFxuICAgICAgICBiZXN0UmVzdWx0TGVuZ3RoLFxuICAgICAgICAnc2Vjb25kcyBsb25nLicsXG4gICAgICAgIHZpZGVvLmVsZW1lbnRcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtICB7Li4uKn0gYXJnc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgd2FybkZvclRlc3RpbmdfKC4uLmFyZ3MpIHtcbiAgICB1c2VyKCkud2Fybi5hcHBseSh1c2VyKCksIFtUQUddLmNvbmNhdChhcmdzKSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXI9fSB0cmlnZ2VySWRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNhbGN1bGF0ZV8odHJpZ2dlcklkKSB7XG4gICAgaWYgKHRyaWdnZXJJZCAhPSB0aGlzLnRyaWdnZXJJZF8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7ZW50cnlfOiBlbnRyeSwgdGltZXJfOiB0aW1lcn0gPSB0aGlzO1xuICAgIGNvbnN0IHt2aWRlb30gPSBlbnRyeTtcblxuICAgIGNvbnN0IGNhbGN1bGF0ZUFnYWluID0gKCkgPT4gdGhpcy5jYWxjdWxhdGVfKHRyaWdnZXJJZCk7XG5cbiAgICBpZiAoZW50cnkuZ2V0UGxheWluZ1N0YXRlKCkgPT0gUGxheWluZ1N0YXRlcy5QQVVTRUQpIHtcbiAgICAgIHRpbWVyLmRlbGF5KGNhbGN1bGF0ZUFnYWluLCBQRVJDRU5UQUdFX0ZSRVFVRU5DWV9XSEVOX1BBVVNFRF9NUyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZHVyYXRpb24gPSB2aWRlby5nZXREdXJhdGlvbigpO1xuICAgIC8vIFRPRE8oIzI1OTU0KTogRnVydGhlciBpbnZlc3RpZ2F0ZSByb290IGNhdXNlIGFuZCByZW1vdmUgdGhpcyBwcm90ZWN0aW9uXG4gICAgLy8gaWYgYXBwcm9wcmlhdGUuXG4gICAgaWYgKCFpc0R1cmF0aW9uRmluaXRlTm9uWmVybyhkdXJhdGlvbikpIHtcbiAgICAgIHRpbWVyLmRlbGF5KGNhbGN1bGF0ZUFnYWluLCBQRVJDRU5UQUdFX0ZSRVFVRU5DWV9XSEVOX1BBVVNFRF9NUyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZnJlcXVlbmN5TXMgPSBjYWxjdWxhdGVBY3R1YWxQZXJjZW50YWdlRnJlcXVlbmN5TXMoZHVyYXRpb24pO1xuXG4gICAgY29uc3QgcGVyY2VudGFnZSA9ICh2aWRlby5nZXRDdXJyZW50VGltZSgpIC8gZHVyYXRpb24pICogMTAwO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQZXJjZW50YWdlID1cbiAgICAgIE1hdGguZmxvb3IocGVyY2VudGFnZSAvIFBFUkNFTlRBR0VfSU5URVJWQUwpICogUEVSQ0VOVEFHRV9JTlRFUlZBTDtcblxuICAgIGRldkFzc2VydChpc0Zpbml0ZU51bWJlcihub3JtYWxpemVkUGVyY2VudGFnZSkpO1xuXG4gICAgdGhpcy5tYXliZVRyaWdnZXJfKG5vcm1hbGl6ZWRQZXJjZW50YWdlKTtcblxuICAgIHRpbWVyLmRlbGF5KGNhbGN1bGF0ZUFnYWluLCBmcmVxdWVuY3lNcyk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5vcm1hbGl6ZWRQZXJjZW50YWdlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtYXliZVRyaWdnZXJfKG5vcm1hbGl6ZWRQZXJjZW50YWdlKSB7XG4gICAgaWYgKG5vcm1hbGl6ZWRQZXJjZW50YWdlIDw9IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5sYXN0XyA9PSBub3JtYWxpemVkUGVyY2VudGFnZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubGFzdF8gPSBub3JtYWxpemVkUGVyY2VudGFnZTtcblxuICAgIHRoaXMuYW5hbHl0aWNzRXZlbnRGb3JUZXN0aW5nXyhub3JtYWxpemVkUGVyY2VudGFnZSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5vcm1hbGl6ZWRQZXJjZW50YWdlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhbmFseXRpY3NFdmVudEZvclRlc3RpbmdfKG5vcm1hbGl6ZWRQZXJjZW50YWdlKSB7XG4gICAgYW5hbHl0aWNzRXZlbnQodGhpcy5lbnRyeV8sIFZpZGVvQW5hbHl0aWNzRXZlbnRzLlBFUkNFTlRBR0VfUExBWUVELCB7XG4gICAgICAnbm9ybWFsaXplZFBlcmNlbnRhZ2UnOiBub3JtYWxpemVkUGVyY2VudGFnZS50b1N0cmluZygpLFxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshVmlkZW9FbnRyeX0gZW50cnlcbiAqIEBwYXJhbSB7IVZpZGVvQW5hbHl0aWNzRXZlbnRzfSBldmVudFR5cGVcbiAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz49fSBvcHRfdmFycyBBIG1hcCBvZiB2YXJzIGFuZCB0aGVpciB2YWx1ZXMuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBhbmFseXRpY3NFdmVudChlbnRyeSwgZXZlbnRUeXBlLCBvcHRfdmFycykge1xuICBjb25zdCB7dmlkZW99ID0gZW50cnk7XG5cbiAgZW50cnkuZ2V0QW5hbHl0aWNzRGV0YWlscygpLnRoZW4oKGRldGFpbHMpID0+IHtcbiAgICBpZiAob3B0X3ZhcnMpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24oZGV0YWlscywgb3B0X3ZhcnMpO1xuICAgIH1cbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50KHZpZGVvLmVsZW1lbnQsIGV2ZW50VHlwZSwgZGV0YWlscyk7XG4gIH0pO1xufVxuXG4vKiogQHBhcmFtIHshTm9kZXwhLi9hbXBkb2MtaW1wbC5BbXBEb2N9IG5vZGVPckRvYyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxWaWRlb01hbmFnZXJGb3JEb2Mobm9kZU9yRG9jKSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2Mobm9kZU9yRG9jLCAndmlkZW8tbWFuYWdlcicsIFZpZGVvTWFuYWdlcik7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/video-manager-impl.js