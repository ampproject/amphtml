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
import '../amp-izlesene';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-izlesene', () => {

  function getIzlesene(videoId, opt_responsive) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const izlesene = iframe.doc.createElement('amp-izlesene');
      izlesene.setAttribute('data-videoid', videoId);
      izlesene.setAttribute('width', '111');
      izlesene.setAttribute('height', '222');
      if (opt_responsive) {
        izlesene.setAttribute('layout', 'responsive');
      }
      return iframe.addElement(izlesene);
    });
  }

  it('renders', () => {
    return getIzlesene('7221390').then(izlesene => {
      const iframe = izlesene.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://www.izlesene.com/embedplayer/7221390/?');
    });
  });

  it('renders responsively', () => {
    return getIzlesene('7221390', true).then(izlesene => {
      const iframe = izlesene.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/-amp-fill-content/);
    });
  });

  it('requires data-videoid', () => {
    return getIzlesene('').should.eventually.be.rejectedWith(
        /The data-videoid attribute is required for/);
  });
});
