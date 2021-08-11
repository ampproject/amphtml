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
import { whenUpgradedToCustomElement } from "./amp-element-helpers";
import { dev } from "./log";
export var MIN_VISIBILITY_RATIO_FOR_AUTOPLAY = 0.5;

/**
 * VideoInterface defines a common video API which any AMP component that plays
 * videos is expected to implement.
 *
 * AMP runtime uses this common API to provide consistent video experience and
 * analytics across all video players.
 *
 * Components implementing this interface must also extend
 * {@link ./base-element.BaseElement} and register with the
 * Video Manager {@link ./service/video-manager-impl.VideoManager} during
 * their `builtCallback`.
 *
 * @interface
 */
export var VideoInterface = /*#__PURE__*/function () {
  function VideoInterface() {
    _classCallCheck(this, VideoInterface);
  }

  _createClass(VideoInterface, [{
    key: "signals",
    value:
    /**
     * See `BaseElement`.
     * @return {!./utils/signals.Signals}
     */
    function signals() {}
    /**
     * See `BaseElement`.
     * @param {function()} unusedMutator
     * @return {!Promise}
     */

  }, {
    key: "mutateElementSkipRemeasure",
    value: function mutateElementSkipRemeasure(unusedMutator) {}
    /**
     * Whether the component supports video playback in the current platform.
     * If false, component will be not treated as a video component.
     * @return {boolean}
     */

  }, {
    key: "supportsPlatform",
    value: function supportsPlatform() {}
    /**
     * Whether users can interact with the video such as pausing it.
     * Example of non-interactive videos include design background videos where
     * all controls are hidden from the user.
     *
     * @return {boolean}
     */

  }, {
    key: "isInteractive",
    value: function isInteractive() {}
    /**
     * Current playback time in seconds at time of trigger.
     *
     * This is used for analytics metadata.
     *
     * @return {number}
     */

  }, {
    key: "getCurrentTime",
    value: function getCurrentTime() {}
    /**
     * Total duration of the video in seconds
     *
     * This is used for analytics metadata.
     *
     * @return {number}
     */

  }, {
    key: "getDuration",
    value: function getDuration() {}
    /**
     * Get a 2d array of start and stop times that the user has watched.
     * This is used for analytics metadata.
     * @return {!Array<Array<number>>}
     */

  }, {
    key: "getPlayedRanges",
    value: function getPlayedRanges() {}
    /**
     * Plays the video.
     *
     * @param {boolean} unusedIsAutoplay Whether the call to the `play` method is
     * triggered by the autoplay functionality. Video players can use this hint
     * to make decisions such as not playing pre-roll video ads.
     */

  }, {
    key: "play",
    value: function play(unusedIsAutoplay) {}
    /**
     * Pauses the video.
     */

  }, {
    key: "pause",
    value: function pause() {}
    /**
     * Mutes the video.
     * Implementation is required for autoplay and mute/unmute controls on docked
     * video.
     */

  }, {
    key: "mute",
    value: function mute() {}
    /**
     * Unmutes the video.
     * Implementation is required for autoplay and mute/unmute controls on docked
     * video.
     */

  }, {
    key: "unmute",
    value: function unmute() {}
    /**
     * Makes the video UI controls visible.
     *
     * AMP will not call this method if `controls` attribute is not set.
     *
     * Implementation is required for docked video.
     */

  }, {
    key: "showControls",
    value: function showControls() {}
    /**
     * Hides the video UI controls.
     *
     * AMP will not call this method if `controls` attribute is not set.
     *
     * Implementation is required for docked video.
     */

  }, {
    key: "hideControls",
    value: function hideControls() {}
    /**
     * Returns video's meta data (artwork, title, artist, album, etc.) for use
     * with the Media Session API
     * @return {!./mediasession-helper.MetadataDef|undefined} metadata
     *   - artwork (Array): URL to the poster image (preferably a 512x512 PNG)
     *   - title (string): Name of the video
     *   - artist (string): Name of the video's author/artist
     *   - album (string): Name of the video's album if it exists
     */

  }, {
    key: "getMetadata",
    value: function getMetadata() {}
    /**
     * If returning true, it's assumed that the embedded video document internally
     * implements a feature to enter fullscreen on device rotation, so that the
     * VideoManager does not override it.
     *
     * Otherwise, the feature is implemented automatically when using the
     * `rotate-to-fullscreen` attribute.
     *
     * @return {boolean}
     */

  }, {
    key: "preimplementsAutoFullscreen",
    value: function preimplementsAutoFullscreen() {}
    /**
     * If returning true, it's assumed that the embedded video document internally
     * implements the MediaSession API internally so that the VideoManager won't
     * replace it.
     *
     * Otherwise provided and inferred metadata are used to update the video's
     * Media Session.
     *
     * @return {boolean}
     */

  }, {
    key: "preimplementsMediaSessionAPI",
    value: function preimplementsMediaSessionAPI() {}
    /**
     * Enables fullscreen on the internal video element
     * NOTE: While implementing, keep in mind that Safari/iOS do not allow taking
     * any element other than <video> to fullscreen, if the player has an internal
     * implementation of fullscreen (flash for example) then check
     * if Services.platformFor(this.win).isSafari is true and use the internal
     * implementation instead. If not, it is recommended to take the iframe
     * to fullscreen using fullscreenEnter from src/core/dom/fullscreen.js
     */

  }, {
    key: "fullscreenEnter",
    value: function fullscreenEnter() {}
    /**
     * Quits fullscreen mode
     */

  }, {
    key: "fullscreenExit",
    value: function fullscreenExit() {}
    /**
     * Returns whether the video is currently in fullscreen mode or not.
     * @return {boolean}
     */

  }, {
    key: "isFullscreen",
    value: function isFullscreen() {}
    /**
     * Seeks the video to a specified time.
     * @param {number} unusedTimeSeconds
     */

  }, {
    key: "seekTo",
    value: function seekTo(unusedTimeSeconds) {}
  }]);

  return VideoInterface;
}();

/** @type {!AmpElement} */
VideoInterface.prototype.element;

/** @type {!Window} */
VideoInterface.prototype.win;

/**
 * Attributes
 *
 * Components implementing the VideoInterface are expected to support
 * the following attributes.
 *
 * @enum {string}
 */
export var VideoAttributes = {
  /**
   * autoplay
   *
   * Whether the developer has configured autoplay on the component.
   * This is normally done by setting `autoplay` attribute on the component.
   *
   * AMP runtime manages autoplay behavior itself using methods such as `play`,
   * `pause`, `showControls`, `hideControls`, `mute`, etc.. therefore components
   * should not propagate the autoplay attribute to the underlying player
   * implementation.
   *
   * When a video is requested to autoplay, AMP will automatically
   * mute and hide the controls for the video, when video is 75% visible in
   * the viewport, AMP will play the video and later pauses it when 25%
   * or more of the video exits the viewport. If an auto-playing video also has
   * controls, AMP will install a tap
   * handler on the video, and when an end-user taps the video, AMP will show
   * the controls.
   *
   */
  AUTOPLAY: 'autoplay',

  /**
   * dock
   *
   * Setting the `dock` attribute on the component makes the video minimize
   * to the corner when scrolled out of view and has been interacted with.
   */
  DOCK: 'dock',

  /**
   * rotate-to-fullscreen
   *
   * If enabled, this automatically expands the currently visible video and
   * playing to fullscreen when the user changes the device's orientation to
   * landscape if the video was started following a user interaction
   * (not autoplay)
   *
   * Dependent upon browser support of
   * http://caniuse.com/#feat=screen-orientation
   * and http://caniuse.com/#feat=fullscreen
   */
  ROTATE_TO_FULLSCREEN: 'rotate-to-fullscreen',

  /**
   * noaudio
   *
   * If set and autoplay, the equalizer icon will not be displayed.
   */
  NO_AUDIO: 'noaudio'
};

/**
 * Events
 *
 * Components implementing the VideoInterface are expected to dispatch
 * the following DOM events.
 *
 * @enum {string}
 */
export var VideoEvents = {
  /**
   * registered
   *
   * Fired when the video player element is built and has been registered with
   * the video manager.
   *
   * @event registered
   */
  REGISTERED: 'registered',

  /**
   * load
   *
   * Fired when the video player is loaded and calls to methods such as `play()`
   * are allowed.
   *
   * @event load
   */
  LOAD: 'load',

  /**
   * loadedmetadata
   *
   * Fired when the video's metadata becomes available (e.g. duration).
   *
   * @event loadedmetadata
   */
  LOADEDMETADATA: 'loadedmetadata',

  /**
   * loadeddata
   *
   * Fired when the user agent can render the media for the first time.
   *
   * @event loadeddata
   */
  LOADEDDATA: 'loadeddata',

  /**
   * play
   *
   * Fired when the video plays (either because of autoplay or the play method).
   *
   * Note: Because this event was not originally present in this interface, we
   * cannot rely on all all implementations to emit it.
   *
   * @event play
   */
  PLAY: 'play',

  /**
   * playing
   *
   * Fired when the video begins playing.
   *
   * @event playing
   */
  PLAYING: 'playing',

  /**
   * pause
   *
   * Fired when the video pauses.
   *
   * @event pause
   */
  PAUSE: 'pause',

  /**
   * ended
   *
   * Fired when the video ends.
   *
   * This event should be fired in addition to `pause` when video ends.
   *
   * @event ended
   */
  ENDED: 'ended',

  /**
   * muted
   *
   * Fired when the video is muted.
   *
   * @event muted
   */
  MUTED: 'muted',

  /**
   * unmuted
   *
   * Fired when the video is unmuted.
   *
   * @event unmuted
   */
  UNMUTED: 'unmuted',

  /**
   * amp:video:visibility
   *
   * Fired when the video's visibility changes.
   *
   * @event amp:video:visibility
   * @property {boolean} visible Whether the video player is visible or not.
   */
  VISIBILITY: 'amp:video:visibility',

  /**
   * reload
   *
   * Fired when the video's src changes.
   *
   * @event reloaded
   */
  RELOAD: 'reloaded',

  /**
   * pre/mid/post Ad start
   *
   * Fired when an Ad starts playing.
   *
   * This is used to remove any overlay shims during Ad play during autoplay
   * or minimized-to-corner version of the player.
   *
   * @event ad_start
   */
  AD_START: 'ad_start',

  /**
   * pre/mid/post Ad ends
   *
   * Fired when an Ad ends playing.
   *
   * This is used to restore any overlay shims during Ad play during autoplay
   * or minimized-to-corner version of the player.
   *
   * @event ad_end
   */
  AD_END: 'ad_end',

  /**
   * A 3p video player can send signals for analytics whose meaning doesn't
   * fit for other events. In this case, a `tick` event is sent with additional
   * information in its data property.
   *
   * @event amp:video:tick
   */
  CUSTOM_TICK: 'amp:video:tick'
};

/** @typedef {string} */
export var PlayingStateDef;

/**
 * Playing States
 *
 * Internal playing states used to distinguish between video playing on user's
 * command and videos playing automatically
 *
 * @enum {string}
 */
export var PlayingStates = {
  /**
   * playing_manual
   *
   * When the video user manually interacted with the video and the video
   * is now playing
   *
   * @event playing_manual
   */
  PLAYING_MANUAL: 'playing_manual',

  /**
   * playing_auto
   *
   * When the video has autoplay and the user hasn't interacted with it yet
   *
   * @event playing_auto
   */
  PLAYING_AUTO: 'playing_auto',

  /**
   * paused
   *
   * When the video is paused.
   *
   * @event paused
   */
  PAUSED: 'paused'
};

/** @enum {string} */
export var VideoAnalyticsEvents = {
  /**
   * video-ended
   *
   * Indicates that a video ended.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-ended
   */
  ENDED: 'video-ended',

  /**
   * video-pause
   *
   * Indicates that a video paused.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-pause
   */
  PAUSE: 'video-pause',

  /**
   * video-play
   *
   * Indicates that a video began to play.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-play
   */
  PLAY: 'video-play',

  /**
   * video-session
   *
   * Indicates that some segment of the video played.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-session
   */
  SESSION: 'video-session',

  /**
   * video-session-visible
   *
   * Indicates that some segment of the video played in the viewport.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-session-visible
   */
  SESSION_VISIBLE: 'video-session-visible',

  /**
   * video-seconds-played
   *
   * Indicates that a video was playing when the
   * video-seconds-played interval fired.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-session-visible
   */
  SECONDS_PLAYED: 'video-seconds-played',

  /**
   * video-hosted-custom
   *
   * Indicates that a custom event incoming from a 3p frame is to be logged.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-custom
   */
  CUSTOM: 'video-hosted-custom',

  /**
   * video-percentage-played
   *
   * Indicates that a percentage interval has been played.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-custom
   */
  PERCENTAGE_PLAYED: 'video-percentage-played',

  /**
   * video-ad-start
   *
   * Indicates that an ad begins to play.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-ad-start
   */
  AD_START: 'video-ad-start',

  /**
   * video-ad-end
   *
   * Indicates that an ad ended.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-ad-end
   */
  AD_END: 'video-ad-end'
};

/**
 * This key can't predictably collide with custom var names as defined in
 * analytics user configuration.
 * @type {string}
 */
export var videoAnalyticsCustomEventTypeKey = '__amp:eventType';

/**
 * Helper union type to be used internally, so that the compiler treats
 * `VideoInterface` objects as `BaseElement`s, which they should be anyway.
 *
 * WARNING: Don't use to `register` at the Service level. Registering should
 * only allow `VideoInterface` as a guarding measure.
 *
 * @typedef {!VideoInterface|!./base-element.BaseElement}
 */
export var VideoOrBaseElementDef;

/**
 * @param {!Element} element
 * @return {boolean}
 */
export function isDockable(element) {
  return element.hasAttribute(VideoAttributes.DOCK);
}

/** @enum {string} */
export var VideoServiceSignals = {
  USER_INTERACTED: 'user-interacted',
  PLAYBACK_DELEGATED: 'playback-delegated'
};

/** @param {!AmpElement|!VideoOrBaseElementDef} video */
export function delegateAutoplay(video) {
  whenUpgradedToCustomElement(dev().assertElement(video)).then(function (el) {
    el.signals().signal(VideoServiceSignals.PLAYBACK_DELEGATED);
  });
}

/** @param {!AmpElement|!VideoOrBaseElementDef} video */
export function userInteractedWith(video) {
  video.signals().signal(VideoServiceSignals.USER_INTERACTED);
}

/**
 * Classname that media components should annotate themselves with.
 * This applies to all video and audio playback components, regardless of
 * whether they implement a common interface or not.
 *
 * TODO(go.amp.dev/issue/26984): This isn't exclusive to video, but there's no
 * better place to put this now due to OWNERShip. Move.
 */
export var MEDIA_COMPONENT_CLASSNAME = 'i-amphtml-media-component';

/**
 * Annotates media component element with a common classname.
 * This applies to all video and audio playback components, regardless of
 * whether they implement a common interface or not.
 * @param {!Element} element
 *
 * TODO(go.amp.dev/issue/26984): This isn't exclusive to video, but there's no
 * better place to put this now due to OWNERShip. Move.
 */
export function setIsMediaComponent(element) {
  element.classList.add(MEDIA_COMPONENT_CLASSNAME);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZGVvLWludGVyZmFjZS5qcyJdLCJuYW1lcyI6WyJ3aGVuVXBncmFkZWRUb0N1c3RvbUVsZW1lbnQiLCJkZXYiLCJNSU5fVklTSUJJTElUWV9SQVRJT19GT1JfQVVUT1BMQVkiLCJWaWRlb0ludGVyZmFjZSIsInVudXNlZE11dGF0b3IiLCJ1bnVzZWRJc0F1dG9wbGF5IiwidW51c2VkVGltZVNlY29uZHMiLCJwcm90b3R5cGUiLCJlbGVtZW50Iiwid2luIiwiVmlkZW9BdHRyaWJ1dGVzIiwiQVVUT1BMQVkiLCJET0NLIiwiUk9UQVRFX1RPX0ZVTExTQ1JFRU4iLCJOT19BVURJTyIsIlZpZGVvRXZlbnRzIiwiUkVHSVNURVJFRCIsIkxPQUQiLCJMT0FERURNRVRBREFUQSIsIkxPQURFRERBVEEiLCJQTEFZIiwiUExBWUlORyIsIlBBVVNFIiwiRU5ERUQiLCJNVVRFRCIsIlVOTVVURUQiLCJWSVNJQklMSVRZIiwiUkVMT0FEIiwiQURfU1RBUlQiLCJBRF9FTkQiLCJDVVNUT01fVElDSyIsIlBsYXlpbmdTdGF0ZURlZiIsIlBsYXlpbmdTdGF0ZXMiLCJQTEFZSU5HX01BTlVBTCIsIlBMQVlJTkdfQVVUTyIsIlBBVVNFRCIsIlZpZGVvQW5hbHl0aWNzRXZlbnRzIiwiU0VTU0lPTiIsIlNFU1NJT05fVklTSUJMRSIsIlNFQ09ORFNfUExBWUVEIiwiQ1VTVE9NIiwiUEVSQ0VOVEFHRV9QTEFZRUQiLCJ2aWRlb0FuYWx5dGljc0N1c3RvbUV2ZW50VHlwZUtleSIsIlZpZGVvT3JCYXNlRWxlbWVudERlZiIsImlzRG9ja2FibGUiLCJoYXNBdHRyaWJ1dGUiLCJWaWRlb1NlcnZpY2VTaWduYWxzIiwiVVNFUl9JTlRFUkFDVEVEIiwiUExBWUJBQ0tfREVMRUdBVEVEIiwiZGVsZWdhdGVBdXRvcGxheSIsInZpZGVvIiwiYXNzZXJ0RWxlbWVudCIsInRoZW4iLCJlbCIsInNpZ25hbHMiLCJzaWduYWwiLCJ1c2VySW50ZXJhY3RlZFdpdGgiLCJNRURJQV9DT01QT05FTlRf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QSxPQUFPLFNBQVNDLFVBQVQsQ0FBb0JwQyxPQUFwQixFQUE2QjtBQUNsQyxTQUFPQSxPQUFPLENBQUNxQyxZQUFSLENBQXFCbkMsZUFBZSxDQUFDRSxJQUFyQyxDQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxPQUFPLElBQU1rQyxtQkFBbUIsR0FBRztBQUNqQ0MsRUFBQUEsZUFBZSxFQUFFLGlCQURnQjtBQUVqQ0MsRUFBQUEsa0JBQWtCLEVBQUU7QUFGYSxDQUE1Qjs7QUFLUDtBQUNBLE9BQU8sU0FBU0MsZ0JBQVQsQ0FBMEJDLEtBQTFCLEVBQWlDO0FBQ3RDbEQsRUFBQUEsMkJBQTJCLENBQUNDLEdBQUcsR0FBR2tELGFBQU4sQ0FBb0JELEtBQXBCLENBQUQsQ0FBM0IsQ0FBd0RFLElBQXhELENBQTZELFVBQUNDLEVBQUQsRUFBUTtBQUNuRUEsSUFBQUEsRUFBRSxDQUFDQyxPQUFILEdBQWFDLE1BQWIsQ0FBb0JULG1CQUFtQixDQUFDRSxrQkFBeEM7QUFDRCxHQUZEO0FBR0Q7O0FBRUQ7QUFDQSxPQUFPLFNBQVNRLGtCQUFULENBQTRCTixLQUE1QixFQUFtQztBQUN4Q0EsRUFBQUEsS0FBSyxDQUFDSSxPQUFOLEdBQWdCQyxNQUFoQixDQUF1QlQsbUJBQW1CLENBQUNDLGVBQTNDO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBTVUseUJBQXlCLEdBQUcsMkJBQWxDOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsbUJBQVQsQ0FBNkJsRCxPQUE3QixFQUFzQztBQUMzQ0EsRUFBQUEsT0FBTyxDQUFDbUQsU0FBUixDQUFrQkMsR0FBbEIsQ0FBc0JILHlCQUF0QjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7d2hlblVwZ3JhZGVkVG9DdXN0b21FbGVtZW50fSBmcm9tICcuL2FtcC1lbGVtZW50LWhlbHBlcnMnO1xuaW1wb3J0IHtkZXZ9IGZyb20gJy4vbG9nJztcblxuZXhwb3J0IGNvbnN0IE1JTl9WSVNJQklMSVRZX1JBVElPX0ZPUl9BVVRPUExBWSA9IDAuNTtcblxuLyoqXG4gKiBWaWRlb0ludGVyZmFjZSBkZWZpbmVzIGEgY29tbW9uIHZpZGVvIEFQSSB3aGljaCBhbnkgQU1QIGNvbXBvbmVudCB0aGF0IHBsYXlzXG4gKiB2aWRlb3MgaXMgZXhwZWN0ZWQgdG8gaW1wbGVtZW50LlxuICpcbiAqIEFNUCBydW50aW1lIHVzZXMgdGhpcyBjb21tb24gQVBJIHRvIHByb3ZpZGUgY29uc2lzdGVudCB2aWRlbyBleHBlcmllbmNlIGFuZFxuICogYW5hbHl0aWNzIGFjcm9zcyBhbGwgdmlkZW8gcGxheWVycy5cbiAqXG4gKiBDb21wb25lbnRzIGltcGxlbWVudGluZyB0aGlzIGludGVyZmFjZSBtdXN0IGFsc28gZXh0ZW5kXG4gKiB7QGxpbmsgLi9iYXNlLWVsZW1lbnQuQmFzZUVsZW1lbnR9IGFuZCByZWdpc3RlciB3aXRoIHRoZVxuICogVmlkZW8gTWFuYWdlciB7QGxpbmsgLi9zZXJ2aWNlL3ZpZGVvLW1hbmFnZXItaW1wbC5WaWRlb01hbmFnZXJ9IGR1cmluZ1xuICogdGhlaXIgYGJ1aWx0Q2FsbGJhY2tgLlxuICpcbiAqIEBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGNsYXNzIFZpZGVvSW50ZXJmYWNlIHtcbiAgLyoqXG4gICAqIFNlZSBgQmFzZUVsZW1lbnRgLlxuICAgKiBAcmV0dXJuIHshLi91dGlscy9zaWduYWxzLlNpZ25hbHN9XG4gICAqL1xuICBzaWduYWxzKCkge31cblxuICAvKipcbiAgICogU2VlIGBCYXNlRWxlbWVudGAuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gdW51c2VkTXV0YXRvclxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIG11dGF0ZUVsZW1lbnRTa2lwUmVtZWFzdXJlKHVudXNlZE11dGF0b3IpIHt9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGNvbXBvbmVudCBzdXBwb3J0cyB2aWRlbyBwbGF5YmFjayBpbiB0aGUgY3VycmVudCBwbGF0Zm9ybS5cbiAgICogSWYgZmFsc2UsIGNvbXBvbmVudCB3aWxsIGJlIG5vdCB0cmVhdGVkIGFzIGEgdmlkZW8gY29tcG9uZW50LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgc3VwcG9ydHNQbGF0Zm9ybSgpIHt9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdXNlcnMgY2FuIGludGVyYWN0IHdpdGggdGhlIHZpZGVvIHN1Y2ggYXMgcGF1c2luZyBpdC5cbiAgICogRXhhbXBsZSBvZiBub24taW50ZXJhY3RpdmUgdmlkZW9zIGluY2x1ZGUgZGVzaWduIGJhY2tncm91bmQgdmlkZW9zIHdoZXJlXG4gICAqIGFsbCBjb250cm9scyBhcmUgaGlkZGVuIGZyb20gdGhlIHVzZXIuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc0ludGVyYWN0aXZlKCkge31cblxuICAvKipcbiAgICogQ3VycmVudCBwbGF5YmFjayB0aW1lIGluIHNlY29uZHMgYXQgdGltZSBvZiB0cmlnZ2VyLlxuICAgKlxuICAgKiBUaGlzIGlzIHVzZWQgZm9yIGFuYWx5dGljcyBtZXRhZGF0YS5cbiAgICpcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0Q3VycmVudFRpbWUoKSB7fVxuXG4gIC8qKlxuICAgKiBUb3RhbCBkdXJhdGlvbiBvZiB0aGUgdmlkZW8gaW4gc2Vjb25kc1xuICAgKlxuICAgKiBUaGlzIGlzIHVzZWQgZm9yIGFuYWx5dGljcyBtZXRhZGF0YS5cbiAgICpcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0RHVyYXRpb24oKSB7fVxuXG4gIC8qKlxuICAgKiBHZXQgYSAyZCBhcnJheSBvZiBzdGFydCBhbmQgc3RvcCB0aW1lcyB0aGF0IHRoZSB1c2VyIGhhcyB3YXRjaGVkLlxuICAgKiBUaGlzIGlzIHVzZWQgZm9yIGFuYWx5dGljcyBtZXRhZGF0YS5cbiAgICogQHJldHVybiB7IUFycmF5PEFycmF5PG51bWJlcj4+fVxuICAgKi9cbiAgZ2V0UGxheWVkUmFuZ2VzKCkge31cblxuICAvKipcbiAgICogUGxheXMgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVudXNlZElzQXV0b3BsYXkgV2hldGhlciB0aGUgY2FsbCB0byB0aGUgYHBsYXlgIG1ldGhvZCBpc1xuICAgKiB0cmlnZ2VyZWQgYnkgdGhlIGF1dG9wbGF5IGZ1bmN0aW9uYWxpdHkuIFZpZGVvIHBsYXllcnMgY2FuIHVzZSB0aGlzIGhpbnRcbiAgICogdG8gbWFrZSBkZWNpc2lvbnMgc3VjaCBhcyBub3QgcGxheWluZyBwcmUtcm9sbCB2aWRlbyBhZHMuXG4gICAqL1xuICBwbGF5KHVudXNlZElzQXV0b3BsYXkpIHt9XG5cbiAgLyoqXG4gICAqIFBhdXNlcyB0aGUgdmlkZW8uXG4gICAqL1xuICBwYXVzZSgpIHt9XG5cbiAgLyoqXG4gICAqIE11dGVzIHRoZSB2aWRlby5cbiAgICogSW1wbGVtZW50YXRpb24gaXMgcmVxdWlyZWQgZm9yIGF1dG9wbGF5IGFuZCBtdXRlL3VubXV0ZSBjb250cm9scyBvbiBkb2NrZWRcbiAgICogdmlkZW8uXG4gICAqL1xuICBtdXRlKCkge31cblxuICAvKipcbiAgICogVW5tdXRlcyB0aGUgdmlkZW8uXG4gICAqIEltcGxlbWVudGF0aW9uIGlzIHJlcXVpcmVkIGZvciBhdXRvcGxheSBhbmQgbXV0ZS91bm11dGUgY29udHJvbHMgb24gZG9ja2VkXG4gICAqIHZpZGVvLlxuICAgKi9cbiAgdW5tdXRlKCkge31cblxuICAvKipcbiAgICogTWFrZXMgdGhlIHZpZGVvIFVJIGNvbnRyb2xzIHZpc2libGUuXG4gICAqXG4gICAqIEFNUCB3aWxsIG5vdCBjYWxsIHRoaXMgbWV0aG9kIGlmIGBjb250cm9sc2AgYXR0cmlidXRlIGlzIG5vdCBzZXQuXG4gICAqXG4gICAqIEltcGxlbWVudGF0aW9uIGlzIHJlcXVpcmVkIGZvciBkb2NrZWQgdmlkZW8uXG4gICAqL1xuICBzaG93Q29udHJvbHMoKSB7fVxuXG4gIC8qKlxuICAgKiBIaWRlcyB0aGUgdmlkZW8gVUkgY29udHJvbHMuXG4gICAqXG4gICAqIEFNUCB3aWxsIG5vdCBjYWxsIHRoaXMgbWV0aG9kIGlmIGBjb250cm9sc2AgYXR0cmlidXRlIGlzIG5vdCBzZXQuXG4gICAqXG4gICAqIEltcGxlbWVudGF0aW9uIGlzIHJlcXVpcmVkIGZvciBkb2NrZWQgdmlkZW8uXG4gICAqL1xuICBoaWRlQ29udHJvbHMoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHZpZGVvJ3MgbWV0YSBkYXRhIChhcnR3b3JrLCB0aXRsZSwgYXJ0aXN0LCBhbGJ1bSwgZXRjLikgZm9yIHVzZVxuICAgKiB3aXRoIHRoZSBNZWRpYSBTZXNzaW9uIEFQSVxuICAgKiBAcmV0dXJuIHshLi9tZWRpYXNlc3Npb24taGVscGVyLk1ldGFkYXRhRGVmfHVuZGVmaW5lZH0gbWV0YWRhdGFcbiAgICogICAtIGFydHdvcmsgKEFycmF5KTogVVJMIHRvIHRoZSBwb3N0ZXIgaW1hZ2UgKHByZWZlcmFibHkgYSA1MTJ4NTEyIFBORylcbiAgICogICAtIHRpdGxlIChzdHJpbmcpOiBOYW1lIG9mIHRoZSB2aWRlb1xuICAgKiAgIC0gYXJ0aXN0IChzdHJpbmcpOiBOYW1lIG9mIHRoZSB2aWRlbydzIGF1dGhvci9hcnRpc3RcbiAgICogICAtIGFsYnVtIChzdHJpbmcpOiBOYW1lIG9mIHRoZSB2aWRlbydzIGFsYnVtIGlmIGl0IGV4aXN0c1xuICAgKi9cbiAgZ2V0TWV0YWRhdGEoKSB7fVxuXG4gIC8qKlxuICAgKiBJZiByZXR1cm5pbmcgdHJ1ZSwgaXQncyBhc3N1bWVkIHRoYXQgdGhlIGVtYmVkZGVkIHZpZGVvIGRvY3VtZW50IGludGVybmFsbHlcbiAgICogaW1wbGVtZW50cyBhIGZlYXR1cmUgdG8gZW50ZXIgZnVsbHNjcmVlbiBvbiBkZXZpY2Ugcm90YXRpb24sIHNvIHRoYXQgdGhlXG4gICAqIFZpZGVvTWFuYWdlciBkb2VzIG5vdCBvdmVycmlkZSBpdC5cbiAgICpcbiAgICogT3RoZXJ3aXNlLCB0aGUgZmVhdHVyZSBpcyBpbXBsZW1lbnRlZCBhdXRvbWF0aWNhbGx5IHdoZW4gdXNpbmcgdGhlXG4gICAqIGByb3RhdGUtdG8tZnVsbHNjcmVlbmAgYXR0cmlidXRlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgcHJlaW1wbGVtZW50c0F1dG9GdWxsc2NyZWVuKCkge31cblxuICAvKipcbiAgICogSWYgcmV0dXJuaW5nIHRydWUsIGl0J3MgYXNzdW1lZCB0aGF0IHRoZSBlbWJlZGRlZCB2aWRlbyBkb2N1bWVudCBpbnRlcm5hbGx5XG4gICAqIGltcGxlbWVudHMgdGhlIE1lZGlhU2Vzc2lvbiBBUEkgaW50ZXJuYWxseSBzbyB0aGF0IHRoZSBWaWRlb01hbmFnZXIgd29uJ3RcbiAgICogcmVwbGFjZSBpdC5cbiAgICpcbiAgICogT3RoZXJ3aXNlIHByb3ZpZGVkIGFuZCBpbmZlcnJlZCBtZXRhZGF0YSBhcmUgdXNlZCB0byB1cGRhdGUgdGhlIHZpZGVvJ3NcbiAgICogTWVkaWEgU2Vzc2lvbi5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHByZWltcGxlbWVudHNNZWRpYVNlc3Npb25BUEkoKSB7fVxuXG4gIC8qKlxuICAgKiBFbmFibGVzIGZ1bGxzY3JlZW4gb24gdGhlIGludGVybmFsIHZpZGVvIGVsZW1lbnRcbiAgICogTk9URTogV2hpbGUgaW1wbGVtZW50aW5nLCBrZWVwIGluIG1pbmQgdGhhdCBTYWZhcmkvaU9TIGRvIG5vdCBhbGxvdyB0YWtpbmdcbiAgICogYW55IGVsZW1lbnQgb3RoZXIgdGhhbiA8dmlkZW8+IHRvIGZ1bGxzY3JlZW4sIGlmIHRoZSBwbGF5ZXIgaGFzIGFuIGludGVybmFsXG4gICAqIGltcGxlbWVudGF0aW9uIG9mIGZ1bGxzY3JlZW4gKGZsYXNoIGZvciBleGFtcGxlKSB0aGVuIGNoZWNrXG4gICAqIGlmIFNlcnZpY2VzLnBsYXRmb3JtRm9yKHRoaXMud2luKS5pc1NhZmFyaSBpcyB0cnVlIGFuZCB1c2UgdGhlIGludGVybmFsXG4gICAqIGltcGxlbWVudGF0aW9uIGluc3RlYWQuIElmIG5vdCwgaXQgaXMgcmVjb21tZW5kZWQgdG8gdGFrZSB0aGUgaWZyYW1lXG4gICAqIHRvIGZ1bGxzY3JlZW4gdXNpbmcgZnVsbHNjcmVlbkVudGVyIGZyb20gc3JjL2NvcmUvZG9tL2Z1bGxzY3JlZW4uanNcbiAgICovXG4gIGZ1bGxzY3JlZW5FbnRlcigpIHt9XG5cbiAgLyoqXG4gICAqIFF1aXRzIGZ1bGxzY3JlZW4gbW9kZVxuICAgKi9cbiAgZnVsbHNjcmVlbkV4aXQoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHZpZGVvIGlzIGN1cnJlbnRseSBpbiBmdWxsc2NyZWVuIG1vZGUgb3Igbm90LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNGdWxsc2NyZWVuKCkge31cblxuICAvKipcbiAgICogU2Vla3MgdGhlIHZpZGVvIHRvIGEgc3BlY2lmaWVkIHRpbWUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB1bnVzZWRUaW1lU2Vjb25kc1xuICAgKi9cbiAgc2Vla1RvKHVudXNlZFRpbWVTZWNvbmRzKSB7fVxufVxuXG4vKiogQHR5cGUgeyFBbXBFbGVtZW50fSAqL1xuVmlkZW9JbnRlcmZhY2UucHJvdG90eXBlLmVsZW1lbnQ7XG5cbi8qKiBAdHlwZSB7IVdpbmRvd30gKi9cblZpZGVvSW50ZXJmYWNlLnByb3RvdHlwZS53aW47XG5cbi8qKlxuICogQXR0cmlidXRlc1xuICpcbiAqIENvbXBvbmVudHMgaW1wbGVtZW50aW5nIHRoZSBWaWRlb0ludGVyZmFjZSBhcmUgZXhwZWN0ZWQgdG8gc3VwcG9ydFxuICogdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzLlxuICpcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBWaWRlb0F0dHJpYnV0ZXMgPSB7XG4gIC8qKlxuICAgKiBhdXRvcGxheVxuICAgKlxuICAgKiBXaGV0aGVyIHRoZSBkZXZlbG9wZXIgaGFzIGNvbmZpZ3VyZWQgYXV0b3BsYXkgb24gdGhlIGNvbXBvbmVudC5cbiAgICogVGhpcyBpcyBub3JtYWxseSBkb25lIGJ5IHNldHRpbmcgYGF1dG9wbGF5YCBhdHRyaWJ1dGUgb24gdGhlIGNvbXBvbmVudC5cbiAgICpcbiAgICogQU1QIHJ1bnRpbWUgbWFuYWdlcyBhdXRvcGxheSBiZWhhdmlvciBpdHNlbGYgdXNpbmcgbWV0aG9kcyBzdWNoIGFzIGBwbGF5YCxcbiAgICogYHBhdXNlYCwgYHNob3dDb250cm9sc2AsIGBoaWRlQ29udHJvbHNgLCBgbXV0ZWAsIGV0Yy4uIHRoZXJlZm9yZSBjb21wb25lbnRzXG4gICAqIHNob3VsZCBub3QgcHJvcGFnYXRlIHRoZSBhdXRvcGxheSBhdHRyaWJ1dGUgdG8gdGhlIHVuZGVybHlpbmcgcGxheWVyXG4gICAqIGltcGxlbWVudGF0aW9uLlxuICAgKlxuICAgKiBXaGVuIGEgdmlkZW8gaXMgcmVxdWVzdGVkIHRvIGF1dG9wbGF5LCBBTVAgd2lsbCBhdXRvbWF0aWNhbGx5XG4gICAqIG11dGUgYW5kIGhpZGUgdGhlIGNvbnRyb2xzIGZvciB0aGUgdmlkZW8sIHdoZW4gdmlkZW8gaXMgNzUlIHZpc2libGUgaW5cbiAgICogdGhlIHZpZXdwb3J0LCBBTVAgd2lsbCBwbGF5IHRoZSB2aWRlbyBhbmQgbGF0ZXIgcGF1c2VzIGl0IHdoZW4gMjUlXG4gICAqIG9yIG1vcmUgb2YgdGhlIHZpZGVvIGV4aXRzIHRoZSB2aWV3cG9ydC4gSWYgYW4gYXV0by1wbGF5aW5nIHZpZGVvIGFsc28gaGFzXG4gICAqIGNvbnRyb2xzLCBBTVAgd2lsbCBpbnN0YWxsIGEgdGFwXG4gICAqIGhhbmRsZXIgb24gdGhlIHZpZGVvLCBhbmQgd2hlbiBhbiBlbmQtdXNlciB0YXBzIHRoZSB2aWRlbywgQU1QIHdpbGwgc2hvd1xuICAgKiB0aGUgY29udHJvbHMuXG4gICAqXG4gICAqL1xuICBBVVRPUExBWTogJ2F1dG9wbGF5JyxcbiAgLyoqXG4gICAqIGRvY2tcbiAgICpcbiAgICogU2V0dGluZyB0aGUgYGRvY2tgIGF0dHJpYnV0ZSBvbiB0aGUgY29tcG9uZW50IG1ha2VzIHRoZSB2aWRlbyBtaW5pbWl6ZVxuICAgKiB0byB0aGUgY29ybmVyIHdoZW4gc2Nyb2xsZWQgb3V0IG9mIHZpZXcgYW5kIGhhcyBiZWVuIGludGVyYWN0ZWQgd2l0aC5cbiAgICovXG4gIERPQ0s6ICdkb2NrJyxcbiAgLyoqXG4gICAqIHJvdGF0ZS10by1mdWxsc2NyZWVuXG4gICAqXG4gICAqIElmIGVuYWJsZWQsIHRoaXMgYXV0b21hdGljYWxseSBleHBhbmRzIHRoZSBjdXJyZW50bHkgdmlzaWJsZSB2aWRlbyBhbmRcbiAgICogcGxheWluZyB0byBmdWxsc2NyZWVuIHdoZW4gdGhlIHVzZXIgY2hhbmdlcyB0aGUgZGV2aWNlJ3Mgb3JpZW50YXRpb24gdG9cbiAgICogbGFuZHNjYXBlIGlmIHRoZSB2aWRlbyB3YXMgc3RhcnRlZCBmb2xsb3dpbmcgYSB1c2VyIGludGVyYWN0aW9uXG4gICAqIChub3QgYXV0b3BsYXkpXG4gICAqXG4gICAqIERlcGVuZGVudCB1cG9uIGJyb3dzZXIgc3VwcG9ydCBvZlxuICAgKiBodHRwOi8vY2FuaXVzZS5jb20vI2ZlYXQ9c2NyZWVuLW9yaWVudGF0aW9uXG4gICAqIGFuZCBodHRwOi8vY2FuaXVzZS5jb20vI2ZlYXQ9ZnVsbHNjcmVlblxuICAgKi9cbiAgUk9UQVRFX1RPX0ZVTExTQ1JFRU46ICdyb3RhdGUtdG8tZnVsbHNjcmVlbicsXG4gIC8qKlxuICAgKiBub2F1ZGlvXG4gICAqXG4gICAqIElmIHNldCBhbmQgYXV0b3BsYXksIHRoZSBlcXVhbGl6ZXIgaWNvbiB3aWxsIG5vdCBiZSBkaXNwbGF5ZWQuXG4gICAqL1xuICBOT19BVURJTzogJ25vYXVkaW8nLFxufTtcblxuLyoqXG4gKiBFdmVudHNcbiAqXG4gKiBDb21wb25lbnRzIGltcGxlbWVudGluZyB0aGUgVmlkZW9JbnRlcmZhY2UgYXJlIGV4cGVjdGVkIHRvIGRpc3BhdGNoXG4gKiB0aGUgZm9sbG93aW5nIERPTSBldmVudHMuXG4gKlxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFZpZGVvRXZlbnRzID0ge1xuICAvKipcbiAgICogcmVnaXN0ZXJlZFxuICAgKlxuICAgKiBGaXJlZCB3aGVuIHRoZSB2aWRlbyBwbGF5ZXIgZWxlbWVudCBpcyBidWlsdCBhbmQgaGFzIGJlZW4gcmVnaXN0ZXJlZCB3aXRoXG4gICAqIHRoZSB2aWRlbyBtYW5hZ2VyLlxuICAgKlxuICAgKiBAZXZlbnQgcmVnaXN0ZXJlZFxuICAgKi9cbiAgUkVHSVNURVJFRDogJ3JlZ2lzdGVyZWQnLFxuXG4gIC8qKlxuICAgKiBsb2FkXG4gICAqXG4gICAqIEZpcmVkIHdoZW4gdGhlIHZpZGVvIHBsYXllciBpcyBsb2FkZWQgYW5kIGNhbGxzIHRvIG1ldGhvZHMgc3VjaCBhcyBgcGxheSgpYFxuICAgKiBhcmUgYWxsb3dlZC5cbiAgICpcbiAgICogQGV2ZW50IGxvYWRcbiAgICovXG4gIExPQUQ6ICdsb2FkJyxcblxuICAvKipcbiAgICogbG9hZGVkbWV0YWRhdGFcbiAgICpcbiAgICogRmlyZWQgd2hlbiB0aGUgdmlkZW8ncyBtZXRhZGF0YSBiZWNvbWVzIGF2YWlsYWJsZSAoZS5nLiBkdXJhdGlvbikuXG4gICAqXG4gICAqIEBldmVudCBsb2FkZWRtZXRhZGF0YVxuICAgKi9cbiAgTE9BREVETUVUQURBVEE6ICdsb2FkZWRtZXRhZGF0YScsXG5cbiAgLyoqXG4gICAqIGxvYWRlZGRhdGFcbiAgICpcbiAgICogRmlyZWQgd2hlbiB0aGUgdXNlciBhZ2VudCBjYW4gcmVuZGVyIHRoZSBtZWRpYSBmb3IgdGhlIGZpcnN0IHRpbWUuXG4gICAqXG4gICAqIEBldmVudCBsb2FkZWRkYXRhXG4gICAqL1xuICBMT0FERUREQVRBOiAnbG9hZGVkZGF0YScsXG5cbiAgLyoqXG4gICAqIHBsYXlcbiAgICpcbiAgICogRmlyZWQgd2hlbiB0aGUgdmlkZW8gcGxheXMgKGVpdGhlciBiZWNhdXNlIG9mIGF1dG9wbGF5IG9yIHRoZSBwbGF5IG1ldGhvZCkuXG4gICAqXG4gICAqIE5vdGU6IEJlY2F1c2UgdGhpcyBldmVudCB3YXMgbm90IG9yaWdpbmFsbHkgcHJlc2VudCBpbiB0aGlzIGludGVyZmFjZSwgd2VcbiAgICogY2Fubm90IHJlbHkgb24gYWxsIGFsbCBpbXBsZW1lbnRhdGlvbnMgdG8gZW1pdCBpdC5cbiAgICpcbiAgICogQGV2ZW50IHBsYXlcbiAgICovXG4gIFBMQVk6ICdwbGF5JyxcblxuICAvKipcbiAgICogcGxheWluZ1xuICAgKlxuICAgKiBGaXJlZCB3aGVuIHRoZSB2aWRlbyBiZWdpbnMgcGxheWluZy5cbiAgICpcbiAgICogQGV2ZW50IHBsYXlpbmdcbiAgICovXG4gIFBMQVlJTkc6ICdwbGF5aW5nJyxcblxuICAvKipcbiAgICogcGF1c2VcbiAgICpcbiAgICogRmlyZWQgd2hlbiB0aGUgdmlkZW8gcGF1c2VzLlxuICAgKlxuICAgKiBAZXZlbnQgcGF1c2VcbiAgICovXG4gIFBBVVNFOiAncGF1c2UnLFxuXG4gIC8qKlxuICAgKiBlbmRlZFxuICAgKlxuICAgKiBGaXJlZCB3aGVuIHRoZSB2aWRlbyBlbmRzLlxuICAgKlxuICAgKiBUaGlzIGV2ZW50IHNob3VsZCBiZSBmaXJlZCBpbiBhZGRpdGlvbiB0byBgcGF1c2VgIHdoZW4gdmlkZW8gZW5kcy5cbiAgICpcbiAgICogQGV2ZW50IGVuZGVkXG4gICAqL1xuICBFTkRFRDogJ2VuZGVkJyxcblxuICAvKipcbiAgICogbXV0ZWRcbiAgICpcbiAgICogRmlyZWQgd2hlbiB0aGUgdmlkZW8gaXMgbXV0ZWQuXG4gICAqXG4gICAqIEBldmVudCBtdXRlZFxuICAgKi9cbiAgTVVURUQ6ICdtdXRlZCcsXG5cbiAgLyoqXG4gICAqIHVubXV0ZWRcbiAgICpcbiAgICogRmlyZWQgd2hlbiB0aGUgdmlkZW8gaXMgdW5tdXRlZC5cbiAgICpcbiAgICogQGV2ZW50IHVubXV0ZWRcbiAgICovXG4gIFVOTVVURUQ6ICd1bm11dGVkJyxcblxuICAvKipcbiAgICogYW1wOnZpZGVvOnZpc2liaWxpdHlcbiAgICpcbiAgICogRmlyZWQgd2hlbiB0aGUgdmlkZW8ncyB2aXNpYmlsaXR5IGNoYW5nZXMuXG4gICAqXG4gICAqIEBldmVudCBhbXA6dmlkZW86dmlzaWJpbGl0eVxuICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHZpc2libGUgV2hldGhlciB0aGUgdmlkZW8gcGxheWVyIGlzIHZpc2libGUgb3Igbm90LlxuICAgKi9cbiAgVklTSUJJTElUWTogJ2FtcDp2aWRlbzp2aXNpYmlsaXR5JyxcblxuICAvKipcbiAgICogcmVsb2FkXG4gICAqXG4gICAqIEZpcmVkIHdoZW4gdGhlIHZpZGVvJ3Mgc3JjIGNoYW5nZXMuXG4gICAqXG4gICAqIEBldmVudCByZWxvYWRlZFxuICAgKi9cbiAgUkVMT0FEOiAncmVsb2FkZWQnLFxuXG4gIC8qKlxuICAgKiBwcmUvbWlkL3Bvc3QgQWQgc3RhcnRcbiAgICpcbiAgICogRmlyZWQgd2hlbiBhbiBBZCBzdGFydHMgcGxheWluZy5cbiAgICpcbiAgICogVGhpcyBpcyB1c2VkIHRvIHJlbW92ZSBhbnkgb3ZlcmxheSBzaGltcyBkdXJpbmcgQWQgcGxheSBkdXJpbmcgYXV0b3BsYXlcbiAgICogb3IgbWluaW1pemVkLXRvLWNvcm5lciB2ZXJzaW9uIG9mIHRoZSBwbGF5ZXIuXG4gICAqXG4gICAqIEBldmVudCBhZF9zdGFydFxuICAgKi9cbiAgQURfU1RBUlQ6ICdhZF9zdGFydCcsXG5cbiAgLyoqXG4gICAqIHByZS9taWQvcG9zdCBBZCBlbmRzXG4gICAqXG4gICAqIEZpcmVkIHdoZW4gYW4gQWQgZW5kcyBwbGF5aW5nLlxuICAgKlxuICAgKiBUaGlzIGlzIHVzZWQgdG8gcmVzdG9yZSBhbnkgb3ZlcmxheSBzaGltcyBkdXJpbmcgQWQgcGxheSBkdXJpbmcgYXV0b3BsYXlcbiAgICogb3IgbWluaW1pemVkLXRvLWNvcm5lciB2ZXJzaW9uIG9mIHRoZSBwbGF5ZXIuXG4gICAqXG4gICAqIEBldmVudCBhZF9lbmRcbiAgICovXG4gIEFEX0VORDogJ2FkX2VuZCcsXG5cbiAgLyoqXG4gICAqIEEgM3AgdmlkZW8gcGxheWVyIGNhbiBzZW5kIHNpZ25hbHMgZm9yIGFuYWx5dGljcyB3aG9zZSBtZWFuaW5nIGRvZXNuJ3RcbiAgICogZml0IGZvciBvdGhlciBldmVudHMuIEluIHRoaXMgY2FzZSwgYSBgdGlja2AgZXZlbnQgaXMgc2VudCB3aXRoIGFkZGl0aW9uYWxcbiAgICogaW5mb3JtYXRpb24gaW4gaXRzIGRhdGEgcHJvcGVydHkuXG4gICAqXG4gICAqIEBldmVudCBhbXA6dmlkZW86dGlja1xuICAgKi9cbiAgQ1VTVE9NX1RJQ0s6ICdhbXA6dmlkZW86dGljaycsXG59O1xuXG4vKiogQHR5cGVkZWYge3N0cmluZ30gKi9cbmV4cG9ydCBsZXQgUGxheWluZ1N0YXRlRGVmO1xuXG4vKipcbiAqIFBsYXlpbmcgU3RhdGVzXG4gKlxuICogSW50ZXJuYWwgcGxheWluZyBzdGF0ZXMgdXNlZCB0byBkaXN0aW5ndWlzaCBiZXR3ZWVuIHZpZGVvIHBsYXlpbmcgb24gdXNlcidzXG4gKiBjb21tYW5kIGFuZCB2aWRlb3MgcGxheWluZyBhdXRvbWF0aWNhbGx5XG4gKlxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFBsYXlpbmdTdGF0ZXMgPSB7XG4gIC8qKlxuICAgKiBwbGF5aW5nX21hbnVhbFxuICAgKlxuICAgKiBXaGVuIHRoZSB2aWRlbyB1c2VyIG1hbnVhbGx5IGludGVyYWN0ZWQgd2l0aCB0aGUgdmlkZW8gYW5kIHRoZSB2aWRlb1xuICAgKiBpcyBub3cgcGxheWluZ1xuICAgKlxuICAgKiBAZXZlbnQgcGxheWluZ19tYW51YWxcbiAgICovXG4gIFBMQVlJTkdfTUFOVUFMOiAncGxheWluZ19tYW51YWwnLFxuXG4gIC8qKlxuICAgKiBwbGF5aW5nX2F1dG9cbiAgICpcbiAgICogV2hlbiB0aGUgdmlkZW8gaGFzIGF1dG9wbGF5IGFuZCB0aGUgdXNlciBoYXNuJ3QgaW50ZXJhY3RlZCB3aXRoIGl0IHlldFxuICAgKlxuICAgKiBAZXZlbnQgcGxheWluZ19hdXRvXG4gICAqL1xuICBQTEFZSU5HX0FVVE86ICdwbGF5aW5nX2F1dG8nLFxuXG4gIC8qKlxuICAgKiBwYXVzZWRcbiAgICpcbiAgICogV2hlbiB0aGUgdmlkZW8gaXMgcGF1c2VkLlxuICAgKlxuICAgKiBAZXZlbnQgcGF1c2VkXG4gICAqL1xuICBQQVVTRUQ6ICdwYXVzZWQnLFxufTtcblxuLyoqIEBlbnVtIHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgVmlkZW9BbmFseXRpY3NFdmVudHMgPSB7XG4gIC8qKlxuICAgKiB2aWRlby1lbmRlZFxuICAgKlxuICAgKiBJbmRpY2F0ZXMgdGhhdCBhIHZpZGVvIGVuZGVkLlxuICAgKiBAcHJvcGVydHkgeyFWaWRlb0FuYWx5dGljc0RldGFpbHNEZWZ9IGRldGFpbHNcbiAgICogQGV2ZW50IHZpZGVvLWVuZGVkXG4gICAqL1xuICBFTkRFRDogJ3ZpZGVvLWVuZGVkJyxcblxuICAvKipcbiAgICogdmlkZW8tcGF1c2VcbiAgICpcbiAgICogSW5kaWNhdGVzIHRoYXQgYSB2aWRlbyBwYXVzZWQuXG4gICAqIEBwcm9wZXJ0eSB7IVZpZGVvQW5hbHl0aWNzRGV0YWlsc0RlZn0gZGV0YWlsc1xuICAgKiBAZXZlbnQgdmlkZW8tcGF1c2VcbiAgICovXG4gIFBBVVNFOiAndmlkZW8tcGF1c2UnLFxuXG4gIC8qKlxuICAgKiB2aWRlby1wbGF5XG4gICAqXG4gICAqIEluZGljYXRlcyB0aGF0IGEgdmlkZW8gYmVnYW4gdG8gcGxheS5cbiAgICogQHByb3BlcnR5IHshVmlkZW9BbmFseXRpY3NEZXRhaWxzRGVmfSBkZXRhaWxzXG4gICAqIEBldmVudCB2aWRlby1wbGF5XG4gICAqL1xuICBQTEFZOiAndmlkZW8tcGxheScsXG5cbiAgLyoqXG4gICAqIHZpZGVvLXNlc3Npb25cbiAgICpcbiAgICogSW5kaWNhdGVzIHRoYXQgc29tZSBzZWdtZW50IG9mIHRoZSB2aWRlbyBwbGF5ZWQuXG4gICAqIEBwcm9wZXJ0eSB7IVZpZGVvQW5hbHl0aWNzRGV0YWlsc0RlZn0gZGV0YWlsc1xuICAgKiBAZXZlbnQgdmlkZW8tc2Vzc2lvblxuICAgKi9cbiAgU0VTU0lPTjogJ3ZpZGVvLXNlc3Npb24nLFxuXG4gIC8qKlxuICAgKiB2aWRlby1zZXNzaW9uLXZpc2libGVcbiAgICpcbiAgICogSW5kaWNhdGVzIHRoYXQgc29tZSBzZWdtZW50IG9mIHRoZSB2aWRlbyBwbGF5ZWQgaW4gdGhlIHZpZXdwb3J0LlxuICAgKiBAcHJvcGVydHkgeyFWaWRlb0FuYWx5dGljc0RldGFpbHNEZWZ9IGRldGFpbHNcbiAgICogQGV2ZW50IHZpZGVvLXNlc3Npb24tdmlzaWJsZVxuICAgKi9cbiAgU0VTU0lPTl9WSVNJQkxFOiAndmlkZW8tc2Vzc2lvbi12aXNpYmxlJyxcblxuICAvKipcbiAgICogdmlkZW8tc2Vjb25kcy1wbGF5ZWRcbiAgICpcbiAgICogSW5kaWNhdGVzIHRoYXQgYSB2aWRlbyB3YXMgcGxheWluZyB3aGVuIHRoZVxuICAgKiB2aWRlby1zZWNvbmRzLXBsYXllZCBpbnRlcnZhbCBmaXJlZC5cbiAgICogQHByb3BlcnR5IHshVmlkZW9BbmFseXRpY3NEZXRhaWxzRGVmfSBkZXRhaWxzXG4gICAqIEBldmVudCB2aWRlby1zZXNzaW9uLXZpc2libGVcbiAgICovXG4gIFNFQ09ORFNfUExBWUVEOiAndmlkZW8tc2Vjb25kcy1wbGF5ZWQnLFxuXG4gIC8qKlxuICAgKiB2aWRlby1ob3N0ZWQtY3VzdG9tXG4gICAqXG4gICAqIEluZGljYXRlcyB0aGF0IGEgY3VzdG9tIGV2ZW50IGluY29taW5nIGZyb20gYSAzcCBmcmFtZSBpcyB0byBiZSBsb2dnZWQuXG4gICAqIEBwcm9wZXJ0eSB7IVZpZGVvQW5hbHl0aWNzRGV0YWlsc0RlZn0gZGV0YWlsc1xuICAgKiBAZXZlbnQgdmlkZW8tY3VzdG9tXG4gICAqL1xuICBDVVNUT006ICd2aWRlby1ob3N0ZWQtY3VzdG9tJyxcblxuICAvKipcbiAgICogdmlkZW8tcGVyY2VudGFnZS1wbGF5ZWRcbiAgICpcbiAgICogSW5kaWNhdGVzIHRoYXQgYSBwZXJjZW50YWdlIGludGVydmFsIGhhcyBiZWVuIHBsYXllZC5cbiAgICogQHByb3BlcnR5IHshVmlkZW9BbmFseXRpY3NEZXRhaWxzRGVmfSBkZXRhaWxzXG4gICAqIEBldmVudCB2aWRlby1jdXN0b21cbiAgICovXG4gIFBFUkNFTlRBR0VfUExBWUVEOiAndmlkZW8tcGVyY2VudGFnZS1wbGF5ZWQnLFxuXG4gIC8qKlxuICAgKiB2aWRlby1hZC1zdGFydFxuICAgKlxuICAgKiBJbmRpY2F0ZXMgdGhhdCBhbiBhZCBiZWdpbnMgdG8gcGxheS5cbiAgICogQHByb3BlcnR5IHshVmlkZW9BbmFseXRpY3NEZXRhaWxzRGVmfSBkZXRhaWxzXG4gICAqIEBldmVudCB2aWRlby1hZC1zdGFydFxuICAgKi9cbiAgQURfU1RBUlQ6ICd2aWRlby1hZC1zdGFydCcsXG5cbiAgLyoqXG4gICAqIHZpZGVvLWFkLWVuZFxuICAgKlxuICAgKiBJbmRpY2F0ZXMgdGhhdCBhbiBhZCBlbmRlZC5cbiAgICogQHByb3BlcnR5IHshVmlkZW9BbmFseXRpY3NEZXRhaWxzRGVmfSBkZXRhaWxzXG4gICAqIEBldmVudCB2aWRlby1hZC1lbmRcbiAgICovXG4gIEFEX0VORDogJ3ZpZGVvLWFkLWVuZCcsXG59O1xuXG4vKipcbiAqIFRoaXMga2V5IGNhbid0IHByZWRpY3RhYmx5IGNvbGxpZGUgd2l0aCBjdXN0b20gdmFyIG5hbWVzIGFzIGRlZmluZWQgaW5cbiAqIGFuYWx5dGljcyB1c2VyIGNvbmZpZ3VyYXRpb24uXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgdmlkZW9BbmFseXRpY3NDdXN0b21FdmVudFR5cGVLZXkgPSAnX19hbXA6ZXZlbnRUeXBlJztcblxuLyoqXG4gKiBIZWxwZXIgdW5pb24gdHlwZSB0byBiZSB1c2VkIGludGVybmFsbHksIHNvIHRoYXQgdGhlIGNvbXBpbGVyIHRyZWF0c1xuICogYFZpZGVvSW50ZXJmYWNlYCBvYmplY3RzIGFzIGBCYXNlRWxlbWVudGBzLCB3aGljaCB0aGV5IHNob3VsZCBiZSBhbnl3YXkuXG4gKlxuICogV0FSTklORzogRG9uJ3QgdXNlIHRvIGByZWdpc3RlcmAgYXQgdGhlIFNlcnZpY2UgbGV2ZWwuIFJlZ2lzdGVyaW5nIHNob3VsZFxuICogb25seSBhbGxvdyBgVmlkZW9JbnRlcmZhY2VgIGFzIGEgZ3VhcmRpbmcgbWVhc3VyZS5cbiAqXG4gKiBAdHlwZWRlZiB7IVZpZGVvSW50ZXJmYWNlfCEuL2Jhc2UtZWxlbWVudC5CYXNlRWxlbWVudH1cbiAqL1xuZXhwb3J0IGxldCBWaWRlb09yQmFzZUVsZW1lbnREZWY7XG5cbi8qKlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRG9ja2FibGUoZWxlbWVudCkge1xuICByZXR1cm4gZWxlbWVudC5oYXNBdHRyaWJ1dGUoVmlkZW9BdHRyaWJ1dGVzLkRPQ0spO1xufVxuXG4vKiogQGVudW0ge3N0cmluZ30gKi9cbmV4cG9ydCBjb25zdCBWaWRlb1NlcnZpY2VTaWduYWxzID0ge1xuICBVU0VSX0lOVEVSQUNURUQ6ICd1c2VyLWludGVyYWN0ZWQnLFxuICBQTEFZQkFDS19ERUxFR0FURUQ6ICdwbGF5YmFjay1kZWxlZ2F0ZWQnLFxufTtcblxuLyoqIEBwYXJhbSB7IUFtcEVsZW1lbnR8IVZpZGVvT3JCYXNlRWxlbWVudERlZn0gdmlkZW8gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxlZ2F0ZUF1dG9wbGF5KHZpZGVvKSB7XG4gIHdoZW5VcGdyYWRlZFRvQ3VzdG9tRWxlbWVudChkZXYoKS5hc3NlcnRFbGVtZW50KHZpZGVvKSkudGhlbigoZWwpID0+IHtcbiAgICBlbC5zaWduYWxzKCkuc2lnbmFsKFZpZGVvU2VydmljZVNpZ25hbHMuUExBWUJBQ0tfREVMRUdBVEVEKTtcbiAgfSk7XG59XG5cbi8qKiBAcGFyYW0geyFBbXBFbGVtZW50fCFWaWRlb09yQmFzZUVsZW1lbnREZWZ9IHZpZGVvICovXG5leHBvcnQgZnVuY3Rpb24gdXNlckludGVyYWN0ZWRXaXRoKHZpZGVvKSB7XG4gIHZpZGVvLnNpZ25hbHMoKS5zaWduYWwoVmlkZW9TZXJ2aWNlU2lnbmFscy5VU0VSX0lOVEVSQUNURUQpO1xufVxuXG4vKipcbiAqIENsYXNzbmFtZSB0aGF0IG1lZGlhIGNvbXBvbmVudHMgc2hvdWxkIGFubm90YXRlIHRoZW1zZWx2ZXMgd2l0aC5cbiAqIFRoaXMgYXBwbGllcyB0byBhbGwgdmlkZW8gYW5kIGF1ZGlvIHBsYXliYWNrIGNvbXBvbmVudHMsIHJlZ2FyZGxlc3Mgb2ZcbiAqIHdoZXRoZXIgdGhleSBpbXBsZW1lbnQgYSBjb21tb24gaW50ZXJmYWNlIG9yIG5vdC5cbiAqXG4gKiBUT0RPKGdvLmFtcC5kZXYvaXNzdWUvMjY5ODQpOiBUaGlzIGlzbid0IGV4Y2x1c2l2ZSB0byB2aWRlbywgYnV0IHRoZXJlJ3Mgbm9cbiAqIGJldHRlciBwbGFjZSB0byBwdXQgdGhpcyBub3cgZHVlIHRvIE9XTkVSU2hpcC4gTW92ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IE1FRElBX0NPTVBPTkVOVF9DTEFTU05BTUUgPSAnaS1hbXBodG1sLW1lZGlhLWNvbXBvbmVudCc7XG5cbi8qKlxuICogQW5ub3RhdGVzIG1lZGlhIGNvbXBvbmVudCBlbGVtZW50IHdpdGggYSBjb21tb24gY2xhc3NuYW1lLlxuICogVGhpcyBhcHBsaWVzIHRvIGFsbCB2aWRlbyBhbmQgYXVkaW8gcGxheWJhY2sgY29tcG9uZW50cywgcmVnYXJkbGVzcyBvZlxuICogd2hldGhlciB0aGV5IGltcGxlbWVudCBhIGNvbW1vbiBpbnRlcmZhY2Ugb3Igbm90LlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICpcbiAqIFRPRE8oZ28uYW1wLmRldi9pc3N1ZS8yNjk4NCk6IFRoaXMgaXNuJ3QgZXhjbHVzaXZlIHRvIHZpZGVvLCBidXQgdGhlcmUncyBub1xuICogYmV0dGVyIHBsYWNlIHRvIHB1dCB0aGlzIG5vdyBkdWUgdG8gT1dORVJTaGlwLiBNb3ZlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0SXNNZWRpYUNvbXBvbmVudChlbGVtZW50KSB7XG4gIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChNRURJQV9DT01QT05FTlRfQ0xBU1NOQU1FKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/video-interface.js