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

import {isLayoutSizeDefined} from '../../../src/layout';
import {getDataParamsFromAttributes, removeElement} from '../../../src/dom';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {videoManagerForDoc} from '../../../src/video-manager';
import {VideoEvents} from '../../../src/video-interface';
import {tryParseJson} from '../../../src/json';
import {user} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-samba-player';

/** @private {Object} */
const API_MAP = {
	'web4-7091': '//playerapitest2.liquidplatform.com:7091/embed/',
	'localhost-8080': '//localhost:8080/player-api/embed/',
	'web4-7021': '//playerapitest2.liquidplatform.com:7021/embed/',
	'staging': '//staging-player-api.sambavideos.sambatech.com/v3/embed/',
	'prod': '//fast.player.liquidplatform.com/pApiv2/embed/'
};

/** @private {Object} */
const EVENTS_MAP = {
	'onPlay': VideoEvents.PLAY,
	'onPause': VideoEvents.PAUSE,
	'onMute': VideoEvents.MUTED,
	'onUnmute': VideoEvents.UNMUTED
};

class AmpSambaPlayer extends AMP.BaseElement {

	/** @param {!AmpElement} element */
	constructor(element) {
		super(element);

		/** @private {string} */
		this.projectId_ = '';

		/** @private {string} */
		this.mediaId_ = '';

		/** @private {string} */
		this.env_ = 'prod';

		/** @private {string} */
		this.protocol_ = this.win.location.protocol || 'http';

		/** @private {Object} */
		this.params_ = {};

		/** @private {?HTMLIFrameElement} */
		this.iframe_ = null;

		/** @private {?Function} */
		this.playerLoadResolver_ = null;

		/** @private {Promise} */
		this.playerLoadPromise_ = new Promise(resolve => { this.playerLoadResolver_ = resolve });

		// Event handlers bindings
		this.playerMessageHandler_ = this.playerMessageHandler_.bind(this);
	}

	/** @override */
	preconnectCallback(opt_onLayout) {
		// host to serve the player
		this.preconnect.url(API_MAP['prod'], opt_onLayout);
		// host to serve media contents
		this.preconnect.url('http://pvbps-sambavideos.akamaized.net', opt_onLayout);
	}

	/** @override */
	isLayoutSupported(layout) {
		// support all layouts
		return isLayoutSizeDefined(layout);
	}

	/** @override */
	buildCallback() {
		this.projectId_ = user().assert(this.element.getAttribute('data-project-id'),
			`The data-project-id attribute is required for <${TAG}> %s`, this.element);

		// not required in case of live
		this.mediaId_ = this.element.getAttribute('data-media-id') || '';

		// which environment to run
		this.env_ = this.element.getAttribute('data-env') || this.env_;

		// the protocol to be used (HTTP, HTTPS)
		this.protocol_ = (this.element.getAttribute('data-protocol') || this.protocol_).replace(/\:?$/, ':');

		// player features related params
		// WARN: methods missing on returned object (e.g. hasOwnProperty) so recreate it
		this.params_ = Object.assign({}, getDataParamsFromAttributes(this.element));

		// remove auto-start attribute (video manager will take care of it)
		if ('autoStart' in this.params_) {
			delete this.params_['autoStart'];
			user().error(TAG, 'Use autoplay attribute instead of data-param-auto-start.');
		}

		installVideoManagerForDoc(this.element);
		videoManagerForDoc(this.element).register(this);
	}

	/** @override */
	layoutCallback() {
		const iframe = this.element.ownerDocument.createElement('iframe');
		let params = 'jsApi=true';
		const s = '&';

		for (let k in this.params_)
			params += `${s}${k.replace(/url$/i, 'URL')}=${this.params_[k]}`;

		params += `&parentURL=#${this.element.ownerDocument.location.href}`;

		iframe.setAttribute('frameborder', '0');
		iframe.setAttribute('allowfullscreen', 'true');
		iframe.src = `${this.protocol_}${API_MAP[this.env_]}${this.projectId_}/${this.mediaId_}?${params}`;

		this.applyFillContent(iframe);
		this.element.appendChild(iframe);
		this.iframe_ = iframe;

		this.win.addEventListener('message', this.playerMessageHandler_);

		return this.loadPromise(iframe)
			.then(() => {
				this.element.dispatchCustomEvent(VideoEvents.LOAD);
				this.playerLoadResolver_(this.iframe_);
			});
	}

	/** @override */
	pauseCallback() {
		this.pause();
	}

	/** @override */
	unlayoutCallback() {
		if (this.iframe_) {
			removeElement(this.iframe_);
			this.iframe_ = null;
		}

		// "layoutCallback" must be called again
		return true;
	}

	// VideoInterface implementation

	/** @override */
	supportsPlatform() {
		return true;
	}

	/** @override */
	isInteractive() {
		return true;
	}

	/** @override */
	play(unusedIsAutoplay) {
		this.sendMessage_('play');
	}

	/** @override */
	pause() {
		this.sendMessage_('pause');
	}

	/** @override */
	mute() {
		this.sendMessage_('mute');
	}

	/** @override */
	unmute() {
		this.sendMessage_('unmute');
	}

	/** @override */
	showControls() {}

	/** @override */
	hideControls() {}

	// End of VideoInterface implementation

	/**
	 * Sends a message to the player through "postMessage" API.
	 * @param {string} message
	 * @param {?Object} opt_params
	 * @private
	 */
	sendMessage_(message, opt_params) {
		if (opt_params == null)
			opt_params = '';
		
		if (typeof opt_params === 'object')
			opt_params = encodeURIComponent(JSON.stringify(opt_params));

		this.playerLoadPromise_.then((iframe) => {
			iframe.contentWindow./*OK*/postMessage(`${message}:${opt_params}`, '*');
		});
	}

	/**
	 * Handles messages sent by the player.
	 * @param {MessageEvent} event
	 * @private
	 */
	playerMessageHandler_(event) {
		if (this.iframe_.src.indexOf(event.origin) === -1
			|| event.source !== this.iframe_.contentWindow
			|| typeof event.data !== 'string'
			|| event.data.indexOf('{') !== 0)
			return;

		const data = tryParseJson(event.data);

		if (data == null || typeof data !== 'object')
			return;

		const videoEvent = EVENTS_MAP[data.event];

		videoEvent && this.element.dispatchCustomEvent(videoEvent);
	}
}

AMP.registerElement(TAG, AmpSambaPlayer);
