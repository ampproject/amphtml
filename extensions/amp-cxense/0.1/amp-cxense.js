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

const DEFAULT_AMD_SRC = location.protocol + '//embed.widget.cx/amd.js';
const DEFAULT_EMBED_APP = '/app/player/m4/dist/';
const PRE_CONNECT_URLS = [DEFAULT_AMD_SRC].concat([location.protocol + '//api.widget.cx', location.protocol + '//api.ramp.com']);
const DATA_ATTR_NAME_MIDFIX = '-ramp-';

let skipTransfer = {
    'data-legacy': true,
    'data-isplayer': true,
    'data-noui': true,
    'data-placeholder': true,
    'class': true,
    'layout': true
};

let _getLongDataAttributeName = (name) => {
    return name.replace(/^data-/i, 'data' + DATA_ATTR_NAME_MIDFIX);
};

class AmpCxense extends AMP.BaseElement {

    /** @override */
    preconnectCallback(onLayout) {
        const self = this;
        PRE_CONNECT_URLS.forEach((url) => {
            self.preconnect.url(url, onLayout);
        });
    }

    /** @override */
    isLayoutSupported(layout) {
        return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
        this.element.className += ' amp-cxense';

        let src = this.element.getAttribute('src');

        let _widgetId = this._getDataAttribute('widget-id');
        let _embed = this._getDataAttribute('embed');
        let _module = this._getDataAttribute('module');

        if (!src && !_widgetId && !_embed && !_module) {
            // if none of these is specified, the default behavior is to load the app widget.
            this.element.setAttribute('data-embed', DEFAULT_EMBED_APP);
            this.element.setAttribute('data-isplayer', true);
        }

        /** @private @const {string} */
        this._src =  src || DEFAULT_AMD_SRC;
        // necessary, otherwise it would confuse AMP
        this.element.removeAttribute('src');

        /** @private @const {string} */
        this._placeholder = this.element.getAttribute('data-placeholder') !== "false";

        // todo: we need a way to figure if metaplayer, so we can wait for it to be ready before removing the placeholder
        /** @private @const {boolean} */
        this._isPlayer = !! (this.element.getAttribute('data-isplayer') || true);

        /** @private @const {boolean} */
        this._noui = this.element.getAttribute('data-noui') === "true";

        if (window.RAMP) {
            RAMP.Widgets && RAMP.Widgets.init && RAMP.Widgets.init();
        }

        if (!this.getPlaceholder() && this._placeholder && !this._noui) {
            this._buildWidgetPlaceholder();
        }
    }

    /** @override */
    layoutCallback() {
        let self = this;

        if (this._noui) {
            setStyles(this.element, {
                'display': 'none'
            });
        } else {
            this._createChildTarget();
        }

        return this._injectEmbedScript().then(() => {
            self._target && window.RAMP && RAMP.Widgets.get('#' + self._target.getAttribute('id'), (embed) => {
                self._embed = embed;

                if (self._isPlayer) {
                    return self._loadPlayer();
                } else {
                    self.applyFillContent(self._target);
                }
            });
        });
    }

    /** @override */
    unlayoutCallback() {
        this._embed && this._embed.destroy();
        this._target && this._target.parentNode.removeChild(this._target);
        return true;
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
            this._mpf = this._mpf || mpf;
            mpf.video.pause();
        });
    }

    /** @private */
    _pauseMpfSync() {
        return !!(this._mpf && (this._mpf.video.pause() || 1));
    }

    /** @private */
    _buildWidgetPlaceholder() {
        const doc = this._getDoc();

        let placeholder = doc.createElement('div');
        placeholder.className = 'amp-cxense-placeholder';

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
        return this._injectScript(this._src);
    }

    _injectScript (src) {
        const doc = this._getDoc();
        const script = doc.createElement('script');
        script.setAttribute("src", src);
        doc.head.appendChild(script);
        return loadPromise(script);
    }

    _loadPlayer () {
        let self = this;
        return new Promise((resolve) => {
            if (self._target && window.RAMP) {
                return RAMP.Widgets.get('#' + self._target.getAttribute('id') + '.metaplayer', (mpf) => {
                    self._mpf = mpf;
                    mpf.listen('ready', () => {
                        self.applyFillContent(self._target);
                        resolve(mpf);
                    });
                });
            }
            reject('cannot load player, widgets dependencies not loaded');
        });
    }

    /** @private */
    _createChildTarget () {
        const target = this._getDoc().createElement('div');
        setStyles(target, {
            'background': 'black'
        });
        let id;
        let attr;
        let attributes = Array.prototype.slice.call(this.element.attributes);
        let shortRegExp = new RegExp('^data-', 'i');
        let fullRegExp = new RegExp('^data-' + DATA_ATTR_NAME_MIDFIX.replace('^-', ''), 'i');

        while(attr = attributes.pop()) {
            let name = attr.nodeName;
            let value = attr.nodeValue;

            let skip = false;
            if (skipTransfer[name]) {
                skip = true;
            }
            if (name == "id") {
                value += "-widget";
            }
            if (shortRegExp.test(name)) {
                this.element.removeAttribute(attr.nodeName);

                if (!fullRegExp.test(name)) {
                    name = _getLongDataAttributeName(name);
                }
            }
            !skip && target.setAttribute(name, value);
        }
        this.element.appendChild(target);
        this._target = target;
    }

    _getDoc () {
        return this.getWin().document;
    }

    _getDataAttribute (name) {
        name = 'data-' + name.replace(/^data-/i, '');
        return this.element.getAttribute(name) || this.element.getAttribute(_getLongDataAttributeName(name));
    }
}

AMP.registerElement('amp-cxense', AmpCxense, CSS);
