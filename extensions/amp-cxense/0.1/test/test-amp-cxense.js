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

let ELEMENT_NAME = 'amp-cxense';

// require('../' + ELEMENT_NAME); // <-- why does this fail? :/ all the other kids are doing it.
require('../amp-cxense'); // but this doesn't fail

import {createIframePromise} from '../../../../testing/iframe';
import {adopt} from '../../../../src/runtime';
import {parseUrl} from '../../../../src/url';

adopt(window);

describe(ELEMENT_NAME, function () {
    // you should'nt use an arrow-function here, mocha is screwing up the context
    // https://github.com/mochajs/mocha/issues/2018
    // same goes with individual it() tests
    this.timeout(10000);

    const DEFAULT_ATTRIBUTES = {
        'data-src': location.protocol + '//media.w3.org/2010/05/sintel/trailer.mp4',
        'layout': 'responsive',
        'height': 90,
        'width': 160
    };

    function createWidget(attributes, doc) {
        doc = doc || document;
        attributes = Object.assign({}, DEFAULT_ATTRIBUTES, attributes);

        const node = doc.createElement(ELEMENT_NAME);

        let key;
        for (key in attributes) {
            node.setAttribute(key, attributes[key]);
        }
        doc.body.appendChild(node);

        node.implementation_.buildCallback();

        return node.implementation_.layoutCallback().then((implementation_) => {
            // just to point out that out layoutCallback promise resolves with the implementation_
            return implementation_;
        });
    }

    // doesn't work yet
    // https://jira.cxense.com/browse/CXVID-296
    function createSanboxedWidget(attributes) {
        return createIframePromise(true).then(iframe => {
            return createWidget(attributes, iframe.doc);
        });
    }

    it('renders', () => {
        return createWidget({})
            .then(function (implementation_) {
                expect(document.getElementById(implementation_._id)).to.be.ok;
                expect(implementation_._mpf.video.src).to.equal(DEFAULT_ATTRIBUTES['data-src']);
            });
    });

    it('renders responsively', () => {
        return createWidget({})
            .then(function (implementation_) {
                expect(implementation_._target.className).to.match(/-amp-fill-content/);
            });
    });


    it('pauses on request', () => {
        return createWidget({})
            .then(function (implementation_) {
                implementation_.pauseCallback();
                expect(implementation_._mpf.video.paused).to.be.true;
            });
    });


    it('removes target div after unlayoutCallback', () => {
        return createWidget({})
            .then(function (implementation_) {
                implementation_.unlayoutCallback();
                expect(document.getElementById(implementation_._id)).to.be.null;
            });
    });
});