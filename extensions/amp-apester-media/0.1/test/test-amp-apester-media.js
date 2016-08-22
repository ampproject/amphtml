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
import '../amp-apester-media';
import {adopt} from '../../../../src/runtime';
import {toggleExperiment} from '../../../../src/experiments';

adopt(window);

describe('amp-apester-media', () => {
  function getApester(mediaId, channelToken, opt_responsive,
                      opt_beforeLayoutCallback) {
    return createIframePromise(true, opt_beforeLayoutCallback).then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const media = iframe.doc.createElement('amp-apester-media');
      media.setAttribute('data-apester-media-id', mediaId);
      media.setAttribute('data-apester-channel-token', channelToken);
      media.setAttribute('height', '390');
      // if (opt_responsive) {
      //   media.setAttribute('layout', 'fixed-height');
      // }
      return iframe.addElement(media);
    });
  }

  // function testLoader(image) {
  //   expect(image).to.not.be.null;
  //   expect(image.getAttribute('src')).to.equal(
  //     'https://images.apester.com/images%2Floader.gif');
  //   expect(image.getAttribute('layout')).to.equal('fill');
  // }

  function testIframe(iframe) {
    expect(iframe).to.not.be.null;
    expect(iframe.src).to.equal(
      'https://renderer.qmerce.com/interaction/577faac633e3688a2952199a');
    expect(iframe.getAttribute('height')).to.equal('390');
  }

  it('renders', () => {
    toggleExperiment(window, 'amp-apester-media', true);
    return getApester('', '577faac633e3688a2952199a').then(ins => {
      testIframe(ins.querySelector('iframe'));
      // testLoader(ins.querySelector('amp-img'));
    });
  });

  it('render playlist', () => {
    toggleExperiment(window, 'amp-apester-media', true);
    return getApester('5704d3bae474a97e70ab27b3').then(ins => {
      testIframe(ins.querySelector('iframe'));
      //testLoader(ins.querySelector('amp-img'));
    });
  });
  it('requires media-id or channel-token', () => {
    expect(getApester()).to.be.rejectedWith(
      /The media-id attribute is required for/);
  });
});
