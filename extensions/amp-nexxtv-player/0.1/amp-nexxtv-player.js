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
import {addParamsToUrl} from '../../../src/url';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {user} from '../../../src/log';


class AmpNexxtvPlayer extends AMP.BaseElement {


    /** @param {!AmpElement} element */
    constructor(element) {
        super(element);

        this.mediaid_ = '';
        this.client_ = '';
        this.delay_ = null;
        this.mode_ = '';
        this.streamtype_ = ''; // default
        this.autoplay_ = 0; // default
        this.origin_ = '';
    }

    /**
     * @param {boolean=} opt_onLayout
     * @override
     */
    preconnectCallback(opt_onLayout) {
        console.log('preconnect',this.origin_);


        this.preconnect.url(this.origin_, opt_onLayout);
    }

    /** @override */
    isLayoutSupported(layout) {
        return isLayoutSizeDefined(layout);
    }

    buildCallback() {
        this.mediaid_ = user().assert(
            this.element.getAttribute('data-mediaid'),
            'The data-mediaid attribute is required for <amp-nexxtv-player> %s',
            this.element);

        this.client_ = user().assert(this.element.getAttribute('data-client'),
            'The data-client attribute is required for <amp-nexxtv-player> %s',
            this.element);

        this.delay_ = this.element.getAttribute('data-delay') || 0;
        this.mode_ = this.element.getAttribute('data-mode') || 'static'; // default
        this.streamtype_ = this.element.getAttribute('data-streamtype') || 'video'; // default
        this.autoplay_ = this.element.getAttribute('data-autoplay') || 0; // default
        this.origin_ = this.element.getAttribute('data-origin') || 'https://embed.nexx.cloud/'; // default

        console.log('build :: ', this.origin_);
    }

    /** @override */
    layoutCallback() {
        const iframe = this.element.ownerDocument.createElement('iframe');

        let src = this.origin_;

        if(this.streamtype_ !== 'video'){
            src += `${encodeURIComponent(this.streamtype_)}/`;
        }

        src += `${encodeURIComponent(this.client_)}/${encodeURIComponent(this.mediaid_)}`;
        src += `?autoplay=${encodeURIComponent(this.autoplay_)}&start=${encodeURIComponent(this.delay_)}`;
        src += `&datamode=${encodeURIComponent(this.mode_)}`;

        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.src = src;

        console.log(src);

        this.applyFillContent(iframe);
        this.element.appendChild(iframe);
        this.iframe_ = iframe;
        return this.loadPromise(iframe);
    }
}

AMP.registerElement('amp-nexxtv-player', AmpNexxtvPlayer);
