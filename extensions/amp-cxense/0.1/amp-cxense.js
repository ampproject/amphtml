/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {setStyles} from '../../../src/style';
import {timer} from '../../../src/timer';
import {user} from '../../../src/log';

const DATA_ATTR_NAME_INTERFIX = 'ramp-';

class AmpCxense extends AMP.BaseElement {

    /** @override */
    preconnectCallback(onLayout) {
        this.preconnect.url('https://embed.widget.cx/amd.js', onLayout);
        this.preconnect.url('https://embed.ramp.com/amd.js', onLayout);
        this.preconnect.url('https://api.ramp.com', onLayout);
        this.preconnect.url('https://api.widget.cx', onLayout);
    }

    /** @override */
    isLayoutSupported(layout) {
        return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
        const width = this.element.getAttribute('width');
        const height = this.element.getAttribute('height');
        /** @private @const {number} */
        this.width_ = getLengthNumeral(width);
        /** @private @const {number} */
        this.height_ = getLengthNumeral(height);

        if (window.RAMP) {
            RAMP.Widgets && RAMP.Widgets.init && RAMP.Widgets.init();
        }
        if (!this.getPlaceholder()) {
            // this._buildImagePlaceholder();
        }
    }

    /** @override */
    layoutCallback() {
        let self = this;
        this._src = this.element.getAttribute('data-src');
        if (this.element.getAttribute('data-ui-off') === "true") {
            setStyles(this.element, {
                'display': 'none'
            });
        } else {
            this._createChildTarget();
        }
        return this._injectEmbedScript().then(() => {
            window.RAMP && RAMP.Widgets.get('#' + self._target.getAttribute('id'), function(embed) {
                self._embed = embed;
                self.applyFillContent(self._target);
            });
        });
    }

    /** @override */
    pauseCallback() {
        if (! this._pauseMpfSync()) {
            this._pauseMpf();
        }
    }

    /** @private */
    _pauseMpf() {
        let self = this;
        this._target && window.RAMP && RAMP.Widgets.get('#' + this._target.getAttribute('id') + '.metaplayer', function(mpf) {
            self._mpf = mpf;
            mpf.video.pause();
        });
    }

    /** @private */
    _pauseMpfSync() {
        return !!(this._mpf && (this._mpf.video.pause() || 1));
    }

    /** @private */
    _buildImagePlaceholder() {
        const imgPlaceholder = new Image();
        setStyles(imgPlaceholder, {
            'object-fit': 'cover',
            // Hiding the placeholder initially to give the browser time to fix
            // the object-fit: cover.
            'visibility': 'hidden'
        });

        // player thumbnails for different screen sizes for a cache win!
        imgPlaceholder.src = 'img source here';
        imgPlaceholder.setAttribute('placeholder', '');
        imgPlaceholder.width = this.width_;
        imgPlaceholder.height = this.height_;
        this.element.appendChild(imgPlaceholder);
        this.applyFillContent(imgPlaceholder);

        loadPromise(imgPlaceholder).catch(() => {
            imgPlaceholder.src = 'fallback img src here';
            return loadPromise(imgPlaceholder);
        }).then(() => {
            setStyles(imgPlaceholder, {
                'visibility': ''
            });
        });
    }

    /** @private */
    _injectEmbedScript () {
        const script = this.element.ownerDocument.createElement('script');
        script.setAttribute("src", this._src);
        this.element.ownerDocument.head.appendChild(script);
        return loadPromise(script);
    }

    /** @private */
    _createChildTarget () {
        const target = this.element.ownerDocument.createElement('div');
        setStyles(target, {
            'background': 'black'
        });
        let skipTransfer = {
            'data-src': true,
            'data-ui-off': true
        };
        let id;
        let attr;
        let attributes = Array.prototype.slice.call(this.element.attributes);
        while(attr = attributes.pop()) {
            let name = attr.nodeName;
            let skip = false;
            if (skipTransfer[name]) {
                skip = true;
            }
            if (name == "id") {
                id = "" + attr.nodeValue;
            }
            if (/^data-/.test(attr.nodeName)) {
                this.element.removeAttribute(attr.nodeName);
                name = name.replace(/^data-/i, 'data-' + DATA_ATTR_NAME_INTERFIX)
            }
            !skip && target.setAttribute(name, attr.nodeValue);
        }
        id && this.element.setAttribute("id", id + "-parent");
        this.element.appendChild(target);
        this._target = target;
    }

}

AMP.registerElement('amp-cxense', AmpCxense);
