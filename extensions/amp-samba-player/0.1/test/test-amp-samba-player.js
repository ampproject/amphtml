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
import '../amp-samba-player';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-samba-player', () => {

  function getSambaPlayer(attributes) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);

      const sbplayer = iframe.doc.createElement('amp-samba-player');

      for (const key in attributes) {
        sbplayer.setAttribute(key, attributes[key]);
      }

      sbplayer.setAttribute('width', '320');
      sbplayer.setAttribute('height', '180');
      sbplayer.setAttribute('layout', 'responsive');

      return iframe.addElement(sbplayer);
    });
  }

  it('renders', () => {
    return getSambaPlayer({
      'data-project-id': '442189dbff37920ceae523517366b5fd',
      'data-media-id': '32e56bfe9b1602fea761a26af305325a',
    }).then(sbplayer => {
      // whether player exists
      expect(sbplayer).to.not.be.null;
      // whether player has a valid SambaTech platform URL
      const url = sbplayer.querySelector('iframe').src;
      expect(url && /(\/[0-9a-z]{32}){1,2}[\/\?]?/i.test(url)).to.be.true;
    });
  });

  it('requires data-project-id param', () => {
    return getSambaPlayer({}).should.eventually.be.rejectedWith(
        /The data-project-id attribute is required for/);
  });

  it('should pass data-param-* attributes to the iframe src', () => {
    return getSambaPlayer({
      'data-project-id': '442189dbff37920ceae523517366b5fd',
      'data-media-id': '32e56bfe9b1602fea761a26af305325a',
      'data-param-enable-controls': false,
    }).then(sbplayer => {
      const url = sbplayer.querySelector('iframe').src;
      expect(url.indexOf('enableControls=false') !== -1).to.be.true;
    });
  });
});
