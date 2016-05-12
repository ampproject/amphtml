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
import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {addParamsToUrl, parseUrl} from '../../../src/url';
import {getDataParamsFromAttributes, removeElement} from '../../../src/dom';
import {setStyles} from '../../../src/style';

let cxDefaults = {
    apiHost: 'https://api.widget.cx',
    embedHost: 'https://embed.widget.cx',
    embedApp: '/app/player/m4/dist/frame.html'
};

class AmpCxense extends AMP.BaseElement {

    /** @override */
    preconnectCallback(onLayout) {
        this.preconnect.url(cxDefaults.apiHost, onLayout);
        this.preconnect.prefetch(cxDefaults.embedHost + cxDefaults.embedApp, 'iframe');
    }

    /** @override */
    isLayoutSupported(layout) {
        return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
        this.element.classList.add('amp-cxense');

        if (!this.getPlaceholder() && this.placeholder_) {
            this.buildWidgetPlaceholder_();
        }
    }

    /** @override */
    layoutCallback() {
        /** @private @const {Element} */
        this.iframe_ = this.element.ownerDocument.createElement('iframe');

        this.iframe_.setAttribute('frameborder', '0');
        this.iframe_.setAttribute('allowfullscreen', 'true');
        this.iframe_.src = addParamsToUrl(cxDefaults.embedHost + cxDefaults.embedApp, getDataParamsFromAttributes(this.element));

        this.element.appendChild(this.iframe_);
        this.listenForPostMessages_();

        return loadPromise(this.iframe_).then(() => {
        });
    }

    /** @override */
    pauseCallback() {
        this.postJSMessage_('mpf.video.pause()');
        retrun true;
    }

    /** @override */
    unlayoutCallback() {
        this.iframe.setAttribute('src', 'about:blank');
        this.iframe_.parentNode.removeChild(this.iframe_);
        return true;
    }

    listenForPostMessages_ () {
        let hostRegExp = new RegExp('^' + parseUrl(cxDefaults.embedHost).hostname);

        this.getWin().addEventListener('message', (e) => {
            if (e && e.data) {
                let data = {};
                try {
                    data = JSON.parse(e.data);
                } catch (e) {}

                if (!data.type || !data.location || !hostRegExp.test(data.location.hostname)) {
                    return;
                }
                // this.dispatch_('')
            }
        }, false);
    }

    /** @private */
    postMessage_(data) {
        data = Object.assign({
            location: location,
            width: this.getWin().offsetWidth,
            height: this.getWin().offsetHeight
        }, data || {});

        return this.iframe_.contentWindow.postMessage(JSON.stringify(data), cxDefaults.embedHost);
    }


    /** @private */
    postJSMessage_(js) {
        return this.postMessage_({
            type: 'js',
            js: js
        });
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

    /** @private */
    getDoc_ () {
        return this.getWin().document;
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