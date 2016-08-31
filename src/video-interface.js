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


/**
 * >>>>>>Work-In-Progress<<<<<<
 *
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
 * @extends {./base-element.BaseElement}
 */
export class VideoInterface {

  /**
   * Whether the component supports video playback in the current platform.
   * If false, component will be not treated as a video component.
   * @return {boolean}
   */
  supportsPlatform() {}

  /**
   * Whether the developer has configured autoplay on the component.
   * This is normally done by setting `autoplay` attribute on the component.
   *
   * AMP runtime manages autoplay behaviour itself using methods such as `play`,
   * `pause`, `showControls`, `hideControls`, `mute`, etc.. therefore components
   * should not propagate the autoplay attribute to the underlying player
   * implementation.
   *
   * When a video is requested to autoplay, AMP will automatically
   * mute and hide the controls for the video, when video is 75% visible in
   * the viewport, AMP will play the video and later pauses it when 25%
   * or more of the video exits the viewport. If an auto-playing video also has
   * controls (ie. `hasControls()` returns `true`), AMP will install a tap
   * handler on the video, and when an end-user taps the video, AMP will show
   * the controls.
   *
   * @return {boolean}
   */
  hasAutoplay() {}

  /**
   * Plays the video and returns a promise that will be resolved when the video
   * is playing or rejected if the video could not be played.
   *
   * @param {boolean} isAutoplay Whether the call to the `play` method is
   * triggered by the autoplay functionality. Video players can use this hint
   * to make decisions such as not playing pre-roll video ads.
   * @return {!Promise}
   */
  play(unusedIsAutoplay) {}


  /**
   * Pauses the video and returns a promise that will be resolved when the video
   * is paused or rejected if the video could not be paused.
   *
   * @return {!Promise}
   */
  pause() {}

  /**
   * Mutes the video and returns a promise that will be resolved when the video
   * is muted or rejected if the video could not be muted.
   *
   * @return {!Promise}
   */
  mute() {}

  /**
   * Unmutes the video and returns a promise that will be resolved when the
   * video is muted or rejected if the video could not be unmuted.
   *
   * @return {!Promise}
   */
  unmute() {}

  /**
   * Whether the developer has configured the component to show UI controls such
   * as play, pause, etc... buttons.
   * This is normally done by setting `controls` attribute on the component.
   *
   * AMP runtime makes certain assumptions based on the value returned from
   * `hasControls()` such as whether to allow end-users to interact with an
   * auto-playing video or not.
   */
  hasControls() {}

  /**
   * Makes the video UI controls visible and returns a promise that will be
   * resolved when the controls are displayed.
   *
   * AMP will not call this method if `hasControls()` returns false.
   *
   * @return {!Promise}
   */
  showControls() {}

  /**
   * Hides the video UI controls and returns a promise that will resolved when
   * the controls are hidden.
   *
   * AMP will not call this method if `hasControls()` returns false.
   *
   * @return {!Promise}
   */
  hideControls() {}
}

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
   * Built event, fired when component's `buildCallback` is finished.
   *
   * @event amp:video:built
   */
  BUILT: 'amp:video:built',

  /**
   * Canplay event, fired when the video player can start playing the video.
   * Normally fired from `layoutCallback`.
   *
   * @event amp:video:canplay
   */
  CAN_PLAY: 'amp:video:built',

  /**
   * Visibility event, fired when the video's visibility changes. Normally fired
   * from `viewportCallback`.
   *
   * @event amp:video:visibility
   * @param {boolean} visible Whether the video player is visible or not.
   */
  VISIBILITY: 'amp:video:visibility',
};
