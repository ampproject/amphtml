/** This file was automatically generated from video-wrapper.d.ts **/

/** @externs */

/** @const */
var VideoWrapperDef = {};
/**
 * @record
 * @struct
 */
VideoWrapperDef.Api = function () {};
/** @type {function(): (void|!Promise<void>)} */
VideoWrapperDef.Api.prototype.play;
/** @type {function(): void} */
VideoWrapperDef.Api.prototype.pause;
/** @type {function(): (void|!Promise<void>)} */
VideoWrapperDef.Api.prototype.requestFullscreen;
/** @type {number} */
VideoWrapperDef.Api.prototype.currentTime;
/** @type {number} */
VideoWrapperDef.Api.prototype.duration;
/** @type {boolean} */
VideoWrapperDef.Api.prototype.autoplay;
/** @type {boolean} */
VideoWrapperDef.Api.prototype.controls;
/** @type {boolean} */
VideoWrapperDef.Api.prototype.loop;
/** @type {function(): void} */
VideoWrapperDef.Api.prototype.mute;
/** @type {function(): void} */
VideoWrapperDef.Api.prototype.unmute;
/** @type {function(): void} */
VideoWrapperDef.Api.prototype.userInteracted;

/** @typedef {function(): (string|number|boolean|void|function(...?): ?|!Array<(string|number|boolean|void)>|!Array<?>|!Array<!Array<(string|number|boolean|void|?)>>)} */
VideoWrapperDef.PlayerComponent;

/** @typedef {{component: function(): (string|number|boolean|void|function(...?): ?|!Array<(string|number|boolean|void)>|!Array<?>|!Array<!Array<(string|number|boolean|void|?)>>), loading: string, src: string, sources: (string|number|boolean|void|?|!Array<(string|number|boolean|void)>|!Array<?>|!Array<!Array<(string|number|boolean|void|?)>>), autoplay: boolean, controls: boolean, noaudio: boolean, poster: string, mediasession: boolean, title: string, artist: string, album: string, artwork: string, onReadyState: function(?, ?=): void}} */
VideoWrapperDef.Props;

/** @typedef {{metadata: !Object, displayIcon: boolean, playing: boolean, displayOverlay: boolean, onOverlayClick: function(...?): ?, wrapperRef: {current: !Element}, play: function(...?): ?, pause: function(...?): ?}} */
VideoWrapperDef.AutoplayProps;
