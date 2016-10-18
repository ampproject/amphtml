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
import '../amp-aparat';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-aparat', () => {

  function getaparatplayer(attributes) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const aparat = iframe.doc.createElement('amp-aparat');
      for (const key in attributes) {
        aparat.setAttribute(key, attributes[key]);
      }
      aparat.setAttribute('width', '320');
      aparat.setAttribute('height', '180');
      aparat.setAttribute('layout', 'responsive');
      iframe.doc.body.appendChild(aparat);
      aparat.implementation_.layoutCallback();
      return aparat;
    });
  }

  it('renders', () => {
    return getaparatplayer({'uid': 'sd3vW'}).then(aparat => {
      const iframe = aparat.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://www.aparat.com/video/video/embed/videohash/sd3vW/vt/frame/amp/true');
      expect(iframe.className).to.match(/-amp-fill-content/);
    });
  });



});
