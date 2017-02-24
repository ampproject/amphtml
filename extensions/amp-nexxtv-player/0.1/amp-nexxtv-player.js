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

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */

import {isLayoutSizeDefined} from "../../../src/layout";
import {user} from "../../../src/log";
import {installVideoManagerForDoc} from "../../../src/service/video-manager-impl";
import {VideoEvents} from '../../../src/video-interface';
import {videoManagerForDoc} from "../../../src/video-manager";

class AmpNexxtvPlayer extends AMP.BaseElement {

    /** @param {!AmpElement} element */
    constructor(element) {
        super(element);

        /** @private {?Element} */
        this.iframe_ = null;

        /** @private {?Promise} */
        this.playerReadyPromise_ = null;

        /** @private {?Function} */
        this.playerReadyResolver_ = null;
    }

    /**
     * @param {boolean=} opt_onLayout
     * @override
     */
    preconnectCallback(opt_onLayout) {
        this.preconnect.url(this.origin_, opt_onLayout);
    }

    /** @override */
    isLayoutSupported(layout) {
        return isLayoutSizeDefined(layout);
    }

    buildCallback() {
        this.playerReadyPromise_ = new Promise(resolve => {
            this.playerReadyResolver_ = resolve;
        });

        this.mediaid_ = user().assert(
            this.element.getAttribute('data-mediaid'),
            'The data-mediaid attribute is required for <amp-nexxtv-player> %s',
            this.element);

        this.client_ = user().assert(this.element.getAttribute('data-client'),
            'The data-client attribute is required for <amp-nexxtv-player> %s',
            this.element);

        this.start_ = this.element.getAttribute('data-seek-to') || 0;
        this.mode_ = this.element.getAttribute('data-mode') || 'static'; // default
        this.streamtype_ = this.element.getAttribute('data-streamtype') || 'video'; // default
        this.origin_ = this.element.getAttribute('data-origin') || 'https://embed.nexx.cloud/'; // default

        const iframe = this.element.ownerDocument.createElement('iframe');
        this.iframe_ = iframe;
        this.applyFillContent(iframe);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');

        this.element.appendChild(iframe);

        installVideoManagerForDoc(this.element);
        videoManagerForDoc(this.element).register(this);
    }

    /** @override */
    layoutCallback() {
        let src = this.origin_;

        if(this.streamtype_ !== 'video'){
            src += `${encodeURIComponent(this.streamtype_)}/`;
        }

        src += `${encodeURIComponent(this.client_)}/${encodeURIComponent(this.mediaid_)}`;
        src += `?start=${encodeURIComponent(this.start_)}`;
        src += `&datamode=${encodeURIComponent(this.mode_)}&amp=1`;

        this.iframe_.src = src;

        return this.loadPromise(this.iframe_)
            .then(() => this.playerReadyPromise_);
    }

    pauseCallback(){
        // Only send pauseVideo command if the player is playing. Otherwise
        // The player breaks if the user haven't played the video yet specially
        // on mobile.
        if (this.iframe_) {
            this.pause();
        }
    }

    /** @override */
    viewportCallback(visible) {
        this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
    }

    sendCommand_(command){
        this.iframe_.contentWindow.postMessage(JSON.stringify({
            'cmd': command
        }), '*');
    };

    // VideoInterface Implementation
    // only send in json format
    /** @override */
    play(unusedIsAutoplay) {
        this.playerReadyPromise_.then(() => {
            this.sendCommand_('play');
        });
    }

    /** @override */
    pause() {
        this.playerReadyPromise_.then(() => {
            this.sendCommand_('pause');
        });
    }

    /** @override */
    mute() {
        this.playerReadyPromise_.then(() => {
            this.sendCommand_('mute');
        });
    }

    /** @override */
    unmute() {
        this.playerReadyPromise_.then(() => {
            this.sendCommand_('unmute');
        });
    }

    /** @override */
    supportsPlatform() {
        return true;
    }

    /** @override */
    isInteractive() {
        return true;
    }

    /** @override */
    showControls() {
    }

    /** @override */
    hideControls() {
    }
}

AMP.registerElement('amp-nexxtv-player', AmpNexxtvPlayer);
