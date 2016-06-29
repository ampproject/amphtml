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
import '../amp-brid-player';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-brid-player', () => {

  function getBridPlayer(attributes, opt_responsive) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const bc = iframe.doc.createElement('amp-brid-player');
      for (const key in attributes) {
        bc.setAttribute(key, attributes[key]);
      }
      bc.setAttribute('width', '640');
      bc.setAttribute('height', '360');
      if (opt_responsive) {
        bc.setAttribute('layout', 'responsive');
      }
      iframe.doc.body.appendChild(bc);
      bc.implementation_.layoutCallback();
      return bc;
    });
  }

  it('renders', () => {
    return getBridPlayer({
      'data-partner': '264',
      'data-player': '4144',
      'data-video': '13663',
    }).then(bc => {
      const iframe = bc.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://services.brid.tv/services/iframe/video/13663/264/4144/0/1');
      expect(iframe.getAttribute('width')).to.equal('640');
      expect(iframe.getAttribute('height')).to.equal('360');
    });
  });

  it('renders responsively', () => {
    return getBridPlayer({
      'data-partner': '1177',
      'data-player': '979',
      'data-video': '5204',
    }, true).then(bc => {
      const iframe = bc.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/-amp-fill-content/);
    });
  });

  it('requires data-partner', () => {
    return getBridPlayer({
      'data-player': '4144',
      'data-video': '13663',
    }).should.eventually.be.rejectedWith(
        /The data-partner attribute is required for/);
  });

  it('requires data-player', () => {
    return getBridPlayer({
      'data-partner': '264',
      'data-video': '13663',
    }).should.eventually.be.rejectedWith(
        /The data-player attribute is required for/);
  });
});
