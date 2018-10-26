/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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



/** @interface */
export class VideoServiceInterface {

  /** @param {!../video-interface.VideoInterface} unusedVideo */
  register(unusedVideo) {}

  /**
   * Gets the current analytics details for the given video.
   * Fails silently if the video is not registered.
   * @param {!AmpElement} unusedVideo
   * @return {!Promise<!VideoAnalyticsDetailsDef>|!Promise<void>}
   */
  getAnalyticsDetails(unusedVideo) {}

  /**
   * @param {!../video-interface.VideoInterface} unusedVideo
   * @return {boolean}
   */
  isMuted(unusedVideo) {}

  /**
   * @param {!../video-interface.VideoInterface} unusedVideo
   * @return {!../video-interface.VideoInterface} PlayingStates
   */
  getPlayingState(unusedVideo) {}
}


/** @enum {string} */
export const VideoServiceSignals = {
  USER_INTERACTED: 'user-interacted',
  AUTOPLAY_DELEGATED: 'autoplay-delegated',
};
