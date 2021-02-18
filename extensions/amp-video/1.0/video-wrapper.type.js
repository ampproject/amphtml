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
var VideoWrapperDef = {};

/**
 * @typedef {{
 *   play: function():!Promise,
 *   pause: function():void,
 *   requestFullscreen: function():!Promise,
 *   currentTime: number,
 *   duration: number,
 *   autoplay: boolean,
 *   controls: boolean,
 *   loop: boolean,
 *
 *   mute: function(),
 *   unmute: function(),
 *   userInteracted: function(),
 * }}
 */
VideoWrapperDef.Api;

/**
 * @typedef {function():PreactDef.Renderable|string}
 */
VideoWrapperDef.PlayerComponent;

/**
 * @typedef {{
 *   component: (!VideoWrapperDef.PlayerComponent|undefined),
 *   loading: (string|undefined),
 *   unloadOnPause: (boolean|undefined),
 *   src: (string|undefined),
 *   sources: (?PreactDef.Renderable|undefined),
 *   autoplay: (boolean|undefined),
 *   controls: (boolean|undefined),
 *   noaudio: (boolean|undefined),
 *   poster: (string|undefined),
 *   mediasession: (boolean|undefined),
 *   title: (string|undefined),
 *   artist: (string|undefined),
 *   album: (string|undefined),
 *   artwork: (string|undefined),
 *   onLoad: (function()|undefined),
 * }}
 */
VideoWrapperDef.Props;

/**
 * @typedef {{
 *   metadata: ?Object,
 *   displayIcon: boolean,
 *   playing: boolean,
 *   displayOverlay: boolean,
 *   onOverlayClick: !Function,
 *   wrapperRef: {current: !Element},
 *   play: !Function,
 *   pause: !Function,
 * }}
 */
VideoWrapperDef.AutoplayProps;
