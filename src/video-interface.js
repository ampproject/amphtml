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

export const MIN_VISIBILITY_RATIO_FOR_AUTOPLAY = 0.5;

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
export class VideoInterface {

  /**
   * Whether the component supports video playback in the current platform.
   * If false, component will be not treated as a video component.
   * @return {boolean}
   */
  supportsPlatform() {}

  /**
   * Whether users can interact with the video such as pausing it.
   * Example of non-interactive videos include design background videos where
   * all controls are hidden from the user.
   *
   * @return {boolean}
   */
  isInteractive() {}

  /**
   * Current playback time in seconds at time of trigger
   * @return {number}
   */
  getCurrentTime() {}

  /**
   * Total duration of the video in seconds
   * @return {number}
   */
  getDuration() {}

  /**
   * Get a 2d array of start and stop times that the user has watched.
   * @return {!Array<Array<number>>}
   */
  getPlayedRanges() {}

  /**
   * Plays the video..
   *
   * @param {boolean} unusedIsAutoplay Whether the call to the `play` method is
   * triggered by the autoplay functionality. Video players can use this hint
   * to make decisions such as not playing pre-roll video ads.
   */
  play(unusedIsAutoplay) {}

  /**
   * Pauses the video.
   */
  pause() {}

  /**
   * Mutes the video.
   */
  mute() {}

  /**
   * Unmutes the video.
   */
  unmute() {}

  /**
   * Makes the video UI controls visible.
   *
   * AMP will not call this method if `controls` attribute is not set.
   */
  showControls() {}

  /**
   * Hides the video UI controls.
   *
   * AMP will not call this method if `controls` attribute is not set.
   */
  hideControls() {}

  /**
   * Returns video's meta data (artwork, title, artist, album, etc.) for use
   * with the Media Session API
   * artwork (Array): URL to the poster image (preferably a 512x512 PNG)
   * title (string): Name of the video
   * artist (string): Name of the video's author/artist
   * album (string): Name of the video's album if it exists
   * @return {!./mediasession-helper.MetadataDef|undefined} metadata
   */
  getMetadata() {}

  /**
   * If this returns true then it will be assumed that the player implements
   * a feature to enter fullscreen on device rotation internally, so that the
   * video manager does not override it. If not, the video manager will
   * implement this feature automatically for videos with the attribute
   * `rotate-to-fullscreen`.
   *
   * @return {boolean}
   */
  preimplementsAutoFullscreen() {}

  /**
   * If this returns true then it will be assumed that the player implements
   * the MediaSession API internally so that the video manager does not override
   * it. If not, the video manager will use the metadata variable as well as
   * inferred meta-data to update the video's Media Session notification.
   *
   * @return {boolean}
   */
  preimplementsMediaSessionAPI() {}

  /**
   * Enables fullscreen on the internal video element
   * NOTE: While implementing, keep in mind that Safari/iOS do not allow taking
   * any element other than <video> to fullscreen, if the player has an internal
   * implementation of fullscreen (flash for example) then check
   * if Services.platformFor(this.win).isSafari is true and use the internal
   * implementation instead. If not, it is recommended to take the iframe
   * to fullscreen using fullscreenEnter from dom.js
   */
  fullscreenEnter() {}

  /**
   * Quits fullscreen mode
   */
  fullscreenExit() {}

  /**
   * Returns whether the video is currently in fullscreen mode or not
   * @return {boolean}
   */
  isFullscreen() {}

  /**
   * Seeks the video to a specified time.
   * @param {number} unusedTimeSeconds
   */
  seekTo(unusedTimeSeconds) {}
}


/**
 * Attributes
 *
 * Components implementing the VideoInterface are expected to support
 * the following attributes.
 *
 * @constant {!Object<string, string>}
 */
export const VideoAttributes = {
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
  NO_AUDIO: 'noaudio',
};


/**
 * Events
 *
 * Components implementing the VideoInterface are expected to dispatch
 * the following DOM events.
 *
 * @constant {!Object<string, string>}
 */
export const VideoEvents = {
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
   * Fired when the video's visibility changes. Normally fired
   * from `viewportCallback`.
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
};

/** @typedef {string} */
export let PlayingStateDef;

/**
 * Playing States
 *
 * Internal playing states used to distinguish between video playing on user's
 * command and videos playing automatically
 *
 * @constant {!Object<string, PlayingStateDef>}
 */
export const PlayingStates = {
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
  PAUSED: 'paused',
};


/** @enum {string} */
export const VideoAnalyticsEvents = {
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
};


/**
 * Helper union type to be used internally, so that the compiler treats
 * `VideoInterface` objects as `BaseElement`s, which they should be anyway.
 *
 * WARNING: Don't use this at the service level. Its `register` method should
 * only allow `VideoInterface` as a guarding measure.
 *
 * @typedef {!VideoInterface|!./base-element.BaseElement}
 */
export let VideoOrBaseElementDef;


/**
 * @param {!Element} element
 * @return {boolean}
 */
export function isDockable(element) {
  return element.hasAttribute(VideoAttributes.DOCK);
}


/** @enum {string} */
export const VideoServiceSignals = {
  USER_INTERACTED: 'user-interacted',
  AUTOPLAY_DELEGATED: 'autoplay-delegated',
};


/** @param {!AmpElement|!VideoOrBaseElementDef} video */
export function delegateAutoplay(video) {
  video.signals().signal(VideoServiceSignals.AUTOPLAY_DELEGATED);
}


/** @param {!AmpElement|!VideoOrBaseElementDef} video */
export function userInteractedWith(video) {
  video.signals().signal(VideoServiceSignals.USER_INTERACTED);
}
