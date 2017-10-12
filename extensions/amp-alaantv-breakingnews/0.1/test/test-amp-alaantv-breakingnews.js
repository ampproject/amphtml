/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {AmpEvents} from '../../../../src/amp-events';
import {AmpAlaantvBreakingnews} from '../amp-alaantv-breakingnews';
import {Services} from '../../../../src/services';

describes.realWin('amp-alaantv-breakingnews', {
    amp: {
        extensions: ['amp-alaantv-breakingnews'],
    }
}, env => {

    let win, doc, ampdoc;
    let templatesMock;
    let element;
    let breakingnews;
    let listMock;
    let bindStub;
    let container;
    let lstContainer;

    beforeEach(() => {
        win = env.win;
        doc = win.document;
        ampdoc = env.ampdoc;

        bindStub = sandbox.stub(Services, 'bindForDocOrNull')
            .returns(Promise.resolve(null));
        const templates = Services.templatesFor(win);
        templatesMock = sandbox.mock(templates);

        win = env.win;
        element = win.document.createElement('div');
        container = win.document.createElement('div');
        container.setAttribute('container', '');
        element.appendChild(container);
        lstContainer = win.document.createElement('div');
        lstContainer.setAttribute('items', '');
        element.appendChild(lstContainer);
        element.setAttribute('layout', 'fixed-height');
        element.setAttribute('height', '3em');
        element.setAttribute('data-poll-interval', '3000');
        element.setAttribute('items', 'items');
        element.setAttribute('src', 'https://www.akhbaralaan.net/api/breakingnews');
        element.getAmpDoc = () => ampdoc;
        element.getFallback = () => null;


        breakingnews = new AmpAlaantvBreakingnews(element);
        win.document.body.appendChild(element);
        breakingnews.buildCallback();
    });

    it('should play news', () => {
        return breakingnews.layoutCallback()
            .then( ()=> breakingnews.play() )
            .then(() => {
                expect(element.querySelector('[items] > *')).to.exist;
            });
    });
});
