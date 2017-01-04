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

import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-vimeo';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-vimeo', () => {

  function getVimeo(videoId, opt_responsive) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const vimeo = iframe.doc.createElement('amp-vimeo');
      vimeo.setAttribute('data-videoid', videoId);
      vimeo.setAttribute('width', '111');
      vimeo.setAttribute('height', '222');
      if (opt_responsive) {
        vimeo.setAttribute('layout', 'responsive');
      }
      return iframe.addElement(vimeo);
    });
  }

  it('renders', () => {
    return getVimeo('123').then(vimeo => {
      const iframe = vimeo.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://player.vimeo.com/video/123');
    });
  });

  it('renders responsively', () => {
    return getVimeo('234', true).then(vimeo => {
      const iframe = vimeo.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('requires data-videoid', () => {
    return getVimeo('').should.eventually.be.rejectedWith(
        /The data-videoid attribute is required for/);
  });
});
