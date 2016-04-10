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

import {createIframePromise} from '../../../../testing/iframe';
require('../amp-cxense');
import {adopt} from '../../../../src/runtime';
import {parseUrl} from '../../../../src/url';

adopt(window);

describe('amp-cxense', () => {
    var testSrc = 'https://media.w3.org/2010/05/sintel/trailer.mp4';

    function getCxense(attributes, opt_responsive) {
        return createIframePromise(true).then(iframe => {
            const bc = iframe.doc.createElement('amp-cxense');
            for (const key in attributes) {
                bc.setAttribute(key, attributes[key]);
            }
            bc.setAttribute('width', '111');
            bc.setAttribute('height', '222');
            if (opt_responsive) {
                bc.setAttribute('layout', 'responsive');
            }
            iframe.doc.body.appendChild(bc);
            bc.implementation_.layoutCallback();
            return bc;
        });
    }

    it('renders', () => {
        return getCxense({
            'data-embed': '/app/player/m4/dist/',
            'data-src': testSrc
        }).then(A => {
            const mpf = RAMP.Widgets.get('metaplayer');
            expect(mpf.video.src).to.equal(testSrc);
        });
    });

    it('renders responsively', () => {
        return getCxense({
            'data-embed': '/app/player/m4/dist/',
            'data-src': testSrc
        }).then(A => {
            const mpf = RAMP.Widgets.get('metaplayer');
            expect(mpf.video.src).to.equal(testSrc);
        });
    });
});
