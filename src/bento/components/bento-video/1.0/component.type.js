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
 *   onReadyState: (function(string, *=)|undefined),
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
