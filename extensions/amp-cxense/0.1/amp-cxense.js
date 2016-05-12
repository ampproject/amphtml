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
import {writeScript} from '../../../3p/3p';
import {CSS} from '../../../build/amp-cxense-0.1.css';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor} from '../../../src/iframe-helper';
import {loadPromise} from '../../../src/event-helper';
import {setStyles} from '../../../src/style';

let cxDefaults = {
    apiHost: 'https://api.widget.cx',
    amdSrc: 'https://embed.widget.cx/amd.js',
    embedApp: '/app/player/m4/dist/'
};

class AmpCxense extends AMP.BaseElement {

    /** @override */
    preconnectCallback(onLayout) {
        this.preconnect.url(cxDefaults.apiHost, onLayout);
        this.preconnect.prefetch(cxDefaults.amdSrc, 'script');
    }

    /** @override */
    isLayoutSupported(layout) {
        return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
        this.element.classList.add('amp-cxense');

        let widgetId = this.getDataAttribute_('widget-id');
        let embed = this.getDataAttribute_('embed');
        let module = this.getDataAttribute_('module');

        if (!widgetId && !embed && !module) {
            // if none of these is specified, the default behavior is to load the app widget.
            this.setDataAttribute_('embed', cxDefaults.embedApp);
            this.setDataAttribute_('isplayer', true);
        }

        /** @private @const {boolean} */
        this.placeholder_ = !(this.getDataAttribute_('placeholder') === false);

        // todo: we need a way to figure if metaplayer,
        // so we can wait for it to be ready before removing the placeholder
        // right now we just make the assumption that it is a video-player
        /** @private @const {boolean} */
        this.isPlayer_ = !(this.getDataAttribute_('isplayer') === false);

        if (!this.getPlaceholder() && this.placeholder_) {
            this.buildWidgetPlaceholder_();
        }
    }

    /** @override */
    layoutCallback() {
        let self = this;

        if (this.loaded_) {
            return new Promise(resolve => {
                resolve(self);
            });
        }
        /** @private @const {object} */
        this.attr_ = this.getDataAttributes_();

        this.createChildTarget_();

        const iframe = getIframe(this.element.ownerDocument.defaultView, this.element, 'cxense');
        listenFor(iframe, 'embed-size', data => {

            console.log("iframe-loaded", data);
        }, true);

        this.element.appendChild(iframe);

        return loadPromise(iframe).then(() => {
            console.log("loadPromise-iframe-loaded", data);

            return new Promise((resolve) => {
                let newResolve = function (arg) {
                    self.loaded_ = true;
                    return resolve(arg);
                };

                var widgetDomId = self.getEmbedId_();
                self.cxWidgets_('get', '#' + widgetDomId, (embed) => {
                    self.embed_ = embed;

                    if (self.isPlayer_) {
                        self.cxWidgets_('#' + widgetDomId + '.metaplayer', function (mpf) {
                            self.mpf_ = mpf;

                            mpf.listen('ready', () => {
                                self.applyFillContent(self.target_);
                                newResolve(self);
                            });
                        });
                    } else {
                        self.applyFillContent(self.target_);
                        newResolve(self);
                    }
                });

                this.cxWidgets_('create', this.target_, this.attr_, {});
            });
        });
    }

    /** @override */
    unlayoutCallback() {
        this.element.parentNode.removeChild(this.element);
        return true;
    }

    /** @override */
    pauseCallback() {
        if (! this.pausePlayerSync_()) {
            this.pausePlayer_();
        }
    }

    /** @private */
    pausePlayer_() {
        let self = this;

        return new Promise((resolve) => {
            if (self.isPlayer_) {
                self.cxWidgets_('get', '#' + self.target_.getAttribute('id') + '.metaplayer', (mpf) => {
                    self.mpf_ = self.mpf_ || mpf;

                    mpf.video.pause();
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }


    /** @private */
    getElementId_() {
        return this.element.getAttribute('id');
    }

    /** @private */
    getEmbedId_() {
        return this.target_.getAttribute('id');
    }

    /** @private */
    getWidgetId_() {
        return this.getDataAttribute_('widget-id');
    }

    /** @private */
    pausePlayerSync_() {
        return !!(this.mpf_ && (this.mpf_.video.pause() || this.mpf_.video.paused));
    }

    /** @private */
    buildWidgetPlaceholder_() {
        const doc = this.getDoc_();

        let placeholder = doc.createElement('div');
        placeholder.className = 'amp-cxense-placeholder';

        let spinner = doc.createElement('div');
        spinner.className = 'amp-cxense-loader';
        spinner.appendChild(doc.createElement('div'));
        spinner.appendChild(doc.createElement('div'));
        spinner.appendChild(doc.createElement('div'));

        placeholder.appendChild(spinner);

        this.element.appendChild(placeholder);
        this.applyFillContent(placeholder);
    }

    /** @private */
    createChildTarget_ () {
        const div = this.getDoc_().createElement('div');
        div.className = 'amp-embed-target';
        this.element.appendChild(div);
        this.target_ = div;
        return this.target_;
    }

    cxWidgets_ () {
        this.CXV_ = this.getWin().RAMP || this.getWin().CXV;

        let args = Array.prototype.slice.call(arguments, 0);
        let fn = args.shift();

        if (this.CXV_ && this.CXV_.Widgets && typeof this.CXV_.Widgets[fn] == 'function') {
            return this.CXV_.Widgets[fn].apply(this.CXV_.Widgets, args);
        }
    }

    cxEmbedUtils_ () {
        this.CXV_ = this.getWin().RAMP || this.getWin().CXV;

        let args = Array.prototype.slice.call(arguments, 0);
        let fn = args.shift();

        if (this.CXV_ && this.CXV_.util && this.CXV_.util.embed && typeof this.CXV_.util.embed[fn] == 'function') {
            return this.CXV_.util.embed[fn].apply(this.CXV_.util.embed, args);
        }
    }

    /** @private */
    getDoc_ () {
        return this.getWin().document;
    }

    /** @private */
    getDataAttributes_ () {
        return this.attr_ || this.cxEmbedUtils_('attrHash', this.element, 'data') || {};
    }

    /** @private */
    getDataAttribute_ (name) {
        return this.attr_ ? this.attr_[name] : resolveType(this.element.getAttribute('data-' + name));
    }

    /** @private */
    setDataAttribute_ (name, value) {
        return this.element.setAttribute('data-' + name, value);
    }
}

let resolveType = function (token) {
    // guesses and resolves type of a string
    if( typeof token != "string")
        return token;

    if( token.length < 15 && token.match(/^(0|-?(0\.|[1-9]\d*\.?)\d*)$/ ) ){
        // don't match long ints where we would lose precision
        // don't match numeric strings with leading zeros that are not decimals or "0"
        token = parseFloat(token);
    }
    else if( token.match(/^true|false$/i) ){
        token = Boolean( token.match(/true/i) );
    }
    else if(token === "undefined" ){
        token = undefined;
    }
    else if(token === "null" ){
        token = null;
    }
    return token;
};

AMP.registerElement('amp-cxense', AmpCxense, CSS);