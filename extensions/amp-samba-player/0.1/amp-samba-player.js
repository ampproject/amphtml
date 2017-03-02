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
import {user} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-samba-player';

/** @private {Object} */
const API_DICTIONARY = {
	'web4-7091': '//playerapitest2.liquidplatform.com:7091/embed/',
	'localhost-8080': '//localhost:8080/player-api/embed/',
	'web4-7021': '//playerapitest2.liquidplatform.com:7021/embed/',
	'staging': '//staging-player-api.sambavideos.sambatech.com/v3/embed/',
	'prod': '//fast.player.liquidplatform.com/pApiv2/embed/'
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
	}

	/** @override */
	preconnectCallback(opt_onLayout) {
		// host to serve the player
		this.preconnect.url(API_DICTIONARY['prod'], opt_onLayout);
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
		iframe.src = `${this.protocol_}${API_DICTIONARY[this.env_]}${this.projectId_}/${this.mediaId_}?${params}`;

		this.applyFillContent(iframe);
		this.element.appendChild(iframe);
		this.iframe_ = iframe;

		return this.loadPromise(iframe);
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
		this.iframe_.contentWindow./*OK*/postMessage('play', '*');
	}

	/** @override */
	pause() {
		this.iframe_.contentWindow./*OK*/postMessage('pause', '*');
	}

	/** @override */
	mute() {}

	/** @override */
	unmute() {}

	/** @override */
	showControls() {}

	/** @override */
	hideControls() {}

	// End of VideoInterface implementation
}

AMP.registerElement(TAG, AmpSambaPlayer);
