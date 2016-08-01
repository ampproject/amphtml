/**
 * Copyright 2015 The AMP HTML Authors.
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

import {CSS} from "../../../build/amp-apester-media-0.1.css";
import {user} from "../../../src/log";
import {loadPromise} from "../../../src/event-helper";
import {setStyles} from "../../../src/style";
import {listenFor} from "../../../src/iframe-helper";

/**
 * AMP Apester-media
 */
class AmpApesterMedia extends AMP.BaseElement {

    /** @override */
    isLayoutSupported(layout) {
        return true;// (layout == Layout.CONTAINER);
    }


    viewportCallback() {
       // TODO: if amp left the viewport, send iframe post message that it has been seen.
    }

    buildCallback() {
        /**
         * @private {?String}
         */
        this.displayBaseUrl_ = window.location.protocol + '//stage3-renderer.qmerce.com'; //renderer.qmerce.local.com

        /**
         * @private {?Element}
         */
        this.mediaAttribute_ = user.assert(
            (this.element.getAttribute('data-apester-media-id') ||
            this.element.getAttribute('data-apester-channel-token')),
            'Either the data-apester-media-id or the data-apester-channel-token ' +
            'attributes must be specified for <amp-apester-media> %s',
            this.element);

        /**
         * @private {?Element}
         */
        this.iframe_ = null;
        /**
         * @private {?Promise}
         */
        this.iframePromise_ = null;

        //TODO change to setStyle?
        this.element.classList.add('-amp-apester-container');
    }

    /** @override */
    firstLayoutCompleted() {
        // Do not hide placeholder
    }

    /** @override */
    layoutCallback() {
        const iframe = this.element.ownerDocument.createElement('iframe');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowtransparency', 'true');
        iframe.setAttribute('scrolling', 'no');
        iframe.src = this.displayBaseUrl_ + '/interaction/' + this.mediaAttribute_;
        //iframe.width = this.element.getAttribute('width');
        iframe.height = this.element.getAttribute('height');
        iframe.classList.add('-amp-apester-iframe');
        this.applyFillContent(iframe);

        setStyles(iframe, {
            'opacity': 0,
        });

        // TODO: fallback hide loader if there iframe.src return 404
        listenFor(iframe, 'embed-size', data => {
            // We only get the message if and when there is a media to display.

            this.togglePlaceholder(false);
            let height = data.interaction.data.size.height;
            let width = data.interaction.data.size.width;

            height += (data.interaction.layout.directive === 'contest-poll')
            iframe.height = height;
            iframe.width = width;
            const amp = iframe.parentElement;
            amp.setAttribute('height', height);
            amp.setAttribute('width', width);
            this./*OK*/changeHeight(height);
        }, /* opt_is3P */false);


        // append iframe
        this.element.appendChild(iframe);
        return this.iframePromise_ = loadPromise(iframe).then(() => {
            this.getVsync().mutate(() => {
                setStyles(iframe, {
                    'opacity': 1,
                });
            });
        });
    }


    /** @override */
    createPlaceholderCallback() {
        const img = this.getWin().document.createElement('amp-img');
        const placeholder = this.getWin().document.createElement('div');

        // white background
        placeholder.setAttribute('placeholder', '');
        //placeholder.width = this.element.getAttribute('width');
        placeholder.height = this.element.getAttribute('height');
        placeholder.className = '-amp-apester-loader-container';

        //TODO use setStyles instead of class?
        // loading gif
        img.className = '-amp-apester-loader';
        img.setAttribute('src', 'http://images.apester.com/images%2Floader.gif');
        img.setAttribute('layout', 'fill');
        img.setAttribute('noloading', '');
        placeholder.appendChild(img);
        return placeholder;
    }
}

AMP.registerElement('amp-apester-media', AmpApesterMedia, CSS);