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
var BrightcoveDef = {};

/**
 * @typedef {{
 *   account: (string|undefined),
 *   autoplay: (boolean|undefined),
 *   embed: (string|undefined),
 *   muted: (boolean|undefined),
 *   player: (string|undefined),
 *   playlistId: (string|undefined),
 *   videoId: (string|undefined),
 *   updatePlaying: (function(boolean)|undefined),
 *   urlParams: (JsonObject|undefined),
 * }}
 */
BrightcoveDef.Props;
