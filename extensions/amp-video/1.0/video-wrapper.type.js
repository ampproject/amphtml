/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
var VideoDef = {};

/**
 * @typedef {{
 *   play: function():undefined,
 *   pause: function():undefined,
 *   requestFullscreen: function():undefined,
 *   mute: function():undefined,
 *   unmute: function():undefined,
 *   userInteracted: function():undefined,
 *   currentTime: (number|undefined),
 *   duration: (number|undefined),
 *   autoplay: boolean,
 *   controls: boolean,
 *   loop: boolean,
 * }}
 */
VideoDef.Api;

/**
 * @typedef {function():PreactDef.Renderable|string}
 */
VideoDef.PlayerComponentDef;

/**
 * @typedef {{
 *   component: (!VideoDef.PlayerComponentDef|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 *   autoplay: (boolean|undefined),
 *   controls: (boolean|undefined),
 *   noaudio: (boolean|undefined),
 *   mediasession: (boolean|undefined)
 *   title: (string|undefined),
 *   artist: (string|undefined),
 *   album: (string|undefined),
 *   artwork: (string|undefined),
 * }}
 */
VideoDef.WrapperProps;

/**
 * @typedef {{
 *   displayIcon: boolean,
 *   playing: boolean,
 *   displayOverlay: boolean,
 *   onOverlayClick: !Function,
 *   wrapperRef: {current: !Element},
 *   play: !Function,
 *   pause: !Function,
 * }}
 */
VideoDef.AutoplayProps;
