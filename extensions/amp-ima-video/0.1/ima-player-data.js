/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

export class ImaPlayerData {

  /**
   * Create a new ImaPlayerData object.
   *
   * @param {number} curentTime
   * @param {number} duration
   * @param {!Array} playedRanges
   */
  constructor(currentTime = 0, duration = 1, playedRanges = []) {
    /* {!Number} */
    this.currentTime = currentTime;

    /* {!Number} */
    this.duration = duration;

    /* {!Array} */
    this.playedRanges = playedRanges;
  }

  /**
   * Update from the provided video player.
   *
   * @param {!Element} videoPlayer
   */
  update(videoPlayer) {
    this.currentTime = videoPlayer.currentTime;
    this.duration = videoPlayer.duration;

    // Adapt videoPlayer.played for the playedRanges format AMP wants.
    const played = videoPlayer.played;
    const length = played.length;
    this.playedRanges = [];
    for (let i = 0; i < length; i++) {
      this.playedRanges.push([played.start(i), played.end(i)]);
    }
  }
}

/**
 * Unique identifier for messages from the implementation iframe with data
 * about the player.
 * @const
 */
ImaPlayerData.IMA_PLAYER_DATA = 'imaPlayerData';
