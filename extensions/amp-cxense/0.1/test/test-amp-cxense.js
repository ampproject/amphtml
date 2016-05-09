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

import {createIframePromise} from '../../../../testing/iframe';
require('../' + ELEMENT_NAME);
import {adopt} from '../../../../src/runtime';
import {parseUrl} from '../../../../src/url';

adopt(window);

describe(ELEMENT_NAME, () => {

    let DEFAULT_ATTRIBUTES = {
        'data-src': 'https://media.w3.org/2010/05/sintel/trailer.mp4',
        'layout': 'responsive'
    };

    function createWidget(attributes) {
        attributes = Object.assign({}, DEFAULT_ATTRIBUTES, attributes);
        console.log("createWidget", attributes);

        return createIframePromise(true).then(iframe => {
            console.log("createIframePromise");

            const widget = iframe.doc.createElement(ELEMENT_NAME);

            let key;
            for (key in attributes) {
                widget.setAttribute(key, attributes[key]);
            }
            iframe.doc.body.appendChild(widget);

            console.log(widget, typeof widget, Object.keys(widget));

            return widget.implementation_.layoutCallback();
        });
    }

    it('renders', () => {
        return createWidget({
        }).then((widget) => {
            expect(widget._mpf.video.src).to.equal(DEFAULT_ATTRIBUTES['data-src']);
        });
    });
});