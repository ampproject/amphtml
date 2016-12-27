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

const template =`<div id="wrapper">
    <div class="tmp">Lorem ipsum</div>
    dolor sit amet
    <img class="-amp-class-name" src="https://random-source.com/img.jpeg">
    <amp-analytics>
        <script type="application/json">
            {"key": "value"}
        </script>
    </amp-analytics>
    </div>
`;

import {getHTML} from '../../src/get-html';

describe('getHTML', () => {
    let element;

    beforeEach(() => {
        element = document.createElement('div');
        element.innerHTML = template;
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should correctly works with empty second parameter', () => {
        let result = getHTML('#wrapper', []);
        expect(result).to.equal('<div> <div>Lorem ipsum</div> dolor sit amet </div>');
    });

    it('should correctly works with attributes array', () => {
        let result = getHTML('#wrapper', ['class', 'id']);
        expect(result).to.equal('<div id="wrapper"> <div class="tmp">Lorem ipsum</div> dolor sit amet </div>');
    });

    it('should correctly works with attributes array', () => {
        let result = getHTML('.tmp', ['class', 'id']);
        expect(result).to.equal('<div class="tmp">Lorem ipsum</div>');
    });

    it('should correctly work with wrong selector', () => {
        let result = getHTML('.no-such-class', ['class', 'id']);
        expect(result).to.equal('');
    });
});
