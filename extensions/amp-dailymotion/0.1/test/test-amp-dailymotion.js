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
import '../amp-dailymotion';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-dailymotion', () => {

  function getDailymotion(videoId, optResponsive, optCustomSettings) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const dailymotion = iframe.doc.createElement('amp-dailymotion');
      dailymotion.setAttribute('data-videoid', videoId);
      dailymotion.setAttribute('width', '111');
      dailymotion.setAttribute('height', '222');
      if (optResponsive) {
        dailymotion.setAttribute('layout', 'responsive');
      }
      if (optCustomSettings) {
        dailymotion.setAttribute('data-start', 123);
        dailymotion.setAttribute('data-param-origin', 'example.com');
      }
      return iframe.addElement(dailymotion);
    });
  }

  it('renders', () => {
    return getDailymotion('x2m8jpp').then(dailymotion => {
      const iframe = dailymotion.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://www.dailymotion.com/embed/video/x2m8jpp?api=1&html=1&app=amp');
    });
  });

  it('renders responsively', () => {
    return getDailymotion('x2m8jpp', true).then(dailymotion => {
      const iframe = dailymotion.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('renders with custom settings', () => {
    return getDailymotion('x2m8jpp', false, true).then(dailymotion => {
      const iframe = dailymotion.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
          'https://www.dailymotion.com/embed/video/x2m8jpp?api=1&html=1&app=amp&start=123&origin=example.com');
    });
  });

  it('requires data-videoid', () => {
    return getDailymotion('').should.eventually.be.rejectedWith(
        /The data-videoid attribute is required for/);
  });
});
