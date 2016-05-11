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
    this.timeout(1000000);

    const DEFAULT_ATTRIBUTES = {
        'data-src': 'https://media.w3.org/2010/05/sintel/trailer.mp4',
        'layout': 'responsive',
        'height': 90,
        'width': 160
    };

    function createWidget(attributes, doc) {
        doc = doc || document;
        attributes = Object.assign({}, DEFAULT_ATTRIBUTES, attributes);

        const widget = doc.createElement(ELEMENT_NAME);

        let key;
        for (key in attributes) {
            widget.setAttribute(key, attributes[key]);
        }
        doc.body.appendChild(widget);

        widget.implementation_.buildCallback();

        return widget.implementation_.layoutCallback();
    }

    // doesn't work yet
    // https://jira.cxense.com/browse/CXVID-296
    function createSanboxedWidget(attributes) {
        return createIframePromise(true).then(iframe => {
            return createWidget(attributes, iframe.doc);
        });
    }

    it('renders', function () {
        return createWidget({})
            .then(function (widget) {
                expect(widget._mpf.video.src).to.equal(DEFAULT_ATTRIBUTES['data-src']);
            });
    });
});