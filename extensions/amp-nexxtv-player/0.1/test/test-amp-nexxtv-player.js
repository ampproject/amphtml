/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {
    createIframePromise,
    doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-nexxtv-player';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-nexxtv-player', () => {

    function getNexxtv(mediaid, client, streamtype, start, mode, origin){
        return createIframePromise(true).then(iframe => {
            doNotLoadExternalResourcesInTest(iframe.win);
            const player = iframe.doc.createElement('amp-nexxtv-player');

            if (mediaid) {
                player.setAttribute('data-mediaid', mediaid);
            }
            if (client) {
                player.setAttribute('data-client', client);
            }

            return iframe.addElement(player);
        });
    }

    it('renders nexxtv video player', () => {
        return getNexxtv('PTPFEC4U184674', '583', 'video', '2', 'static',
            'https://embed.nexx.cloud/').then(player => {
            const playerIframe = player.querySelector('iframe');

            expect(playerIframe).to.not.be.null;
            expect(playerIframe.src).to.equal('https://embed.nexx.cloud/583/PTPFEC4U184674?start=0&datamode=static');
        });
    });

    it('fails without mediaid', () => {
        return getNexxtv(null, '583', 'video', '2', 'static',
            'https://embed.nexx.cloud/').should.eventually.be.rejectedWith(
            /The data-mediaid attribute is required/);
    });

    it('fails without client', () => {
        return getNexxtv('PTPFEC4U184674', null, 'video', '2', 'static',
            'https://embed.nexx.cloud/').should.eventually.be.rejectedWith(
            /The data-client attribute is required/);
    });
});
