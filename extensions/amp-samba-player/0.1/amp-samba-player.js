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
import {user} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-samba-player';

/** @private {Object} */
const API_DICTIONARY = {
	'web4-7091': 'player.sambatech.com.br/v3_dev/',
	staging: 'player.sambatech.com.br/v3_staging/',
	prod: 'player.sambatech.com.br/v3/'
};

class AmpSambaPlayer extends AMP.BaseElement {

	/** @param {!AmpElement} element */
	constructor(element) {
		super(element);

		/** @private {string} */
		this.projectId_ = '';

		/** @private {?string} */
		this.mediaId_ = null;

		/** @private {?SambaPlayer} */
		this.player_ = null;
	}

	/** @override */
	preconnectCallback(opt_onLayout) {
		// host to serve the player
		this.preconnect.url('https://fast.player.liquidplatform.com', opt_onLayout);
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
		this.layout_ = this.element.getAttribute('layout');

		this.projectId_ = user().assert(this.element.getAttribute('data-project-id'),
			`The data-project-id attribute is required for <${TAG}> %s`, this.element);

		// not required (in case of live)
		this.mediaId_ = this.element.getAttribute('data-media-id');
		// player features related params
		// WORKAROUND: object was invalid (e.g. without "hasOwnProperty" method) so recreate it
		this.params_ = Object.assign({}, getDataParamsFromAttributes(this.element));
	}

	/** @override */
	layoutCallback() {
		return new Promise((function(onSuccess, onError) {
			this.loadSambaPlayerAPI('prod', (function(e) {
				if (!e.success) {
					onError();
					return;
				}

				this.player_ = new SambaPlayer(this.element, {
					width: 480,
					height: 360,
					ph: this.projectId_,
					m: this.mediaId_,
					playerParams: this.params_
				});

				for (let v of this.element.getElementsByTagName('iframe')) {
					console.info(v.name, this.player_.MEDIA_ID, v.name === this.player_.MEDIA_ID);
					if (v.name === this.player_.MEDIA_ID) {
						this.applyFillContent(v);
						break;
					}
				}

				onSuccess();
			}).bind(this));
		}).bind(this));
	}

	/** @override */
	pauseCallback() {
		this.player_ && this.player_.pause();
	}

	/** @override */
	unlayoutCallback() {
		if (this.player_ && this.element.frames.length > 0) {
			// TODO: when events are available listeners must be removed as well
			removeElement(this.element.frames[0]);
			this.player_ = null;
		}

		// "layoutCallback" must be called again
		return true;
	}

	/** @private */
	loadSambaPlayerAPI(env, cb) {
		const baseUrl = API_DICTIONARY[env];

		if (baseUrl == null)
			throw new Error(`SambaPlayer wrong environment ${env}.`);

		const script = document.createElement('script');

		script.setAttribute('samba-player-api', 'player');
		script.src = `//${baseUrl}samba.player.api.js?iframeURL=${env}`;
		
		script.onload = script.onreadystatechange = () => {
			if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
				cb && cb({success: true});
			}
		};

		script.onerror = function() {
			cb && cb({success: false});
		};

		document.querySelector('body').appendChild(script);
	}
}

AMP.registerElement(TAG, AmpSambaPlayer);
