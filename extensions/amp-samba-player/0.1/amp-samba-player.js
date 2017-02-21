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
		this.projectId_ = user().assert(this.element.getAttribute('data-project-id'),
			`The data-project-id attribute is required for <${TAG}> %s`, this.element);

		// not required (in case of live)
		this.mediaId_ = this.element.getAttribute('data-media-id');

		this.params_ = getDataParamsFromAttributes(this.element);

		window.__sbPlayerLoadHandler = (function(e) {
			console.info(this.params_);

			if (this.element.frames.length === 0) {
				throw new Error('SambaPlayer failed to append itself into provided container.');
				return;
			}
			
			this.applyFillContent(this.element.frames[0]);
		}).bind(this);
	}

	/** @override */
	layoutCallback() {
		return new Promise((function(onSuccess, onError) {
			this.loadSambaPlayerAPI('', (function(e) {
				if (!e.success) {
					onError();
					return;
				}

				this.player_ = new SambaPlayer(this.element, {
					width: 480,
					height: 360,
					events: {
						'onLoad': '__sbPlayerLoadHandler'
					}
				});

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
			removeElement(this.element.frames[0]);
			this.player_ = null;
		}
		return true; // Call layoutCallback again.
	}

	/** @private */
	loadSambaPlayerAPI(env, cb, castApi = 'prod') {
		let script = document.createElement('script');
		script.setAttribute('samba-player-api', 'player');

		script.src = `//${API_DICTIONARY[env]}samba.player.api.js?iframeURL=${env}`;
		
		script.onload = script.onreadystatechange = () => {
			if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
				if(cb) cb({success: true});
			}
		};
		script.onerror = function() {
			cb && cb({success: false});
		}
		document.querySelector('body').appendChild(script);
	}
}

AMP.registerElement(TAG, AmpSambaPlayer);
