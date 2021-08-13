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

/** @externs */

/** @const */
var AudioDef = {};

/**
 * @typedef {{
 *   album: (string),
 *   'aria-describedby': (string|undefined),
 *   'aria-label': (string|undefined),
 *   'aria-labelledby': (string|undefined),
 *   artist: (string),
 *   artwork: (string),
 *   autoplay: (boolean),
 *   controlsList: (boolean|undefined),
 *   loading: (string),
 *   loop: (boolean),
 *   muted: (boolean),
 *   preload: (string|undefined),
 *   sources: (?PreactDef.Renderable|undefined),
 *   src: (string|undefined),
 *   title: (string),
 * }}
 */
AudioDef.Props;

/** @interface */
AudioDef.AudioApi = class {
  /**
   * Plays/Resume the audio
   */
  play() {}

  /**
   * Pauses the audio
   */
  pause() {}

  /**
   * Get playing state of audio
   * @return {boolean} Returns true if audio is playing
   */
  isPlaying() {}
};
