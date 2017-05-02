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

import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-3q-player';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-3q-player', function() {

  function get3QElement(playoutId) {
    return createIframePromise(true).then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const player = iframe.doc.createElement('amp-3q-player');
      if (playoutId) {
        player.setAttribute('data-id', playoutId);
      }

      return iframe.addElement(player);
    });
  };

  it('renders', () => {
    return get3QElement(
          'c8dbe7f4-7f7f-11e6-a407-0cc47a188158').then(player => {
            const playerIframe = player.querySelector('iframe');
            expect(playerIframe).to.not.be.null;
            expect(playerIframe.src).to.equal('https://playout.3qsdn.com/c8dbe7f4-7f7f-11e6-a407-0cc47a188158?autoplay=false&amp=true');
          });
  });

  it('requires data-id', () => {
    return get3QElement('').should.eventually.be.rejectedWith(
        /The data-id attribute is required/);
  });

});
