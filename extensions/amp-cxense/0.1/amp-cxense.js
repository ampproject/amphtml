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

import {CSS} from '../../../build/amp-cxense-0.1.css';
import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {setStyles} from '../../../src/style';
import {timer} from '../../../src/timer';
import {user} from '../../../src/log';

const DATA_ATTR_NAME_INTERFIX = 'ramp-';
let skipTransfer = {
    'data-src': true,
    'data-ui-off': true,
    'data-placeholder': true,
    'class': true,
    'layout': true
};


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
        this.element.className += ' amp-cxense';

        /** @private @const {number} */
        this._width = getLengthNumeral(this.element.getAttribute('width'));

        /** @private @const {number} */
        this._height = getLengthNumeral(this.element.getAttribute('height'));

        /** @private @const {string} */
        this._src = this.element.getAttribute('data-src');

        /** @private @const {string} */
        this._placeholder = this.element.getAttribute('data-placeholder');

        /** @private @const {boolean} */
        this._isPlayer = this._placeholder === 'player';

        /** @private @const {boolean} */
        this._uiOff = this.element.getAttribute('data-ui-off') === "true";

        if (window.RAMP) {
            RAMP.Widgets && RAMP.Widgets.init && RAMP.Widgets.init();
        }
        if (!this.getPlaceholder() && this._isPlayer) {
            this._buildPlayerPlaceholder();
        }
    }

    /** @override */
    layoutCallback() {
        let self = this;

        if (this._uiOff) {
            setStyles(this.element, {
                'display': 'none'
            });
        } else {
            this._createChildTarget();
        }

        return this._injectEmbedScript().then(() => {
            self._target && window.RAMP && RAMP.Widgets.get('#' + self._target.getAttribute('id'), function(embed) {
                self._embed = embed;

                if (! this._isPlayer) {
                    self.applyFillContent(self._target);
                } else {
                    RAMP.Widgets.get('#' + self._target.getAttribute('id') + '.metaplayer', function(mpf) {
                        self._mpf = mpf;
                        mpf.listen('ready', function() {
                            self.applyFillContent(self._target);
                        });
                    });
                }
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
        this._target && window.RAMP && RAMP.Widgets.get('#' + this._target.getAttribute('id') + '.metaplayer', function(mpf) {
            mpf.video.pause();
        });
    }

    /** @private */
    _pauseMpfSync() {
        return !!(this._mpf && (this._mpf.video.pause() || 1));
    }

    /** @private */
    _buildPlayerPlaceholder() {
        const doc = this.getDoc();

        let placeholder = doc.createElement('div');
        placeholder.className = 'amp-mpf-player-placeholder';

        let circle = doc.createElement('div');
        circle.className = 'amp-mpf-play-circle';
        let triangle = doc.createElement('div');
        triangle.className = 'amp-mpf-play-triangle';
        circle.appendChild(triangle);

        placeholder.appendChild(circle);

        let spinner = doc.createElement('div');
        spinner.className = 'amp-mpf-loader';
        spinner.appendChild(doc.createElement('div'));
        spinner.appendChild(doc.createElement('div'));
        spinner.appendChild(doc.createElement('div'));

        placeholder.appendChild(spinner);

        this.element.appendChild(placeholder);
        this.applyFillContent(placeholder);
    }

    /** @private */
    _injectEmbedScript () {
        const doc = this.getDoc();
        const script = doc.createElement('script');
        script.setAttribute("src", this._src);
        doc.head.appendChild(script);
        return loadPromise(script);
    }

    /** @private */
    _createChildTarget () {
        const target = this.getDoc().createElement('div');
        setStyles(target, {
            'background': 'black'
        });
        let id;
        let attr;
        let attributes = Array.prototype.slice.call(this.element.attributes);
        let shortRegExp = new RegExp('^data-');
        let fullRegExp = new RegExp('^data-' + DATA_ATTR_NAME_INTERFIX);

        while(attr = attributes.pop()) {
            let name = attr.nodeName;
            let skip = false;
            if (skipTransfer[name]) {
                skip = true;
            }
            if (name == "id") {
                id = "" + attr.nodeValue;
            }
            if (shortRegExp.test(name)) {
                this.element.removeAttribute(attr.nodeName);

                if (!fullRegExp.test(name)) {
                    name = name.replace(/^data-/i, 'data-' + DATA_ATTR_NAME_INTERFIX)
                }
            }
            !skip && target.setAttribute(name, attr.nodeValue);
        }
        id && this.element.setAttribute("id", id + "-parent");
        this.element.appendChild(target);
        this._target = target;
    }

    getDoc () {
        return this.getWin().document;
    }

}

AMP.registerElement('amp-cxense', AmpCxense, CSS);
