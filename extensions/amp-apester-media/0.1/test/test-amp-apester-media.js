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

adopt(window);

describe('amp-apester-media', () => {

  function getApester(mediaId, opt_responsive, opt_beforeLayoutCallback) {
    return createIframePromise(true, opt_beforeLayoutCallback).then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const media = iframe.doc.createElement('amp-apester-media');
      media.setAttribute('data-apester-media-id', mediaId);
      media.setAttribute('height', '390');
      media.setAttribute('alt', 'Testing');
      if (opt_responsive) {
        media.setAttribute('layout', 'responsive');
      }
      return iframe.addElement(media);
    });
  }


  function testLoader(image) {
    expect(image).to.not.be.null;
    expect(image.getAttribute('src')).to.equal(
      'http://images.apester.com/images%2Floader.gif');
    expect(image.getAttribute('layout')).to.equal('fill');
    // expect(image.getAttribute('alt')).to.equal('Testing');
  }

  function testIframe(iframe) {
    expect(iframe).to.not.be.null;
    expect(iframe.src).to.equal('http://stage3-renderer.qmerce.com/interaction/578b4d6d2d9fb72943ce465c');
    expect(iframe.getAttribute('height')).to.equal('390');
    //  expect(iframe.getAttribute('title')).to.equal('Apester: Testing');
  }

  it('renders', () => {
    return getApester('578b4d6d2d9fb72943ce465c').then(ins => {
      testIframe(ins.querySelector('iframe'));
      testLoader(ins.querySelector('amp-img'));
    });
  });


  it('renders responsively', () => {
    return getApester('media', true).then(ins => {
      expect(ins.className).to.match(/amp-layout-responsive/);
    });
  });

  it('requires  media-id', () => {
    expect(getApester('')).to.be.rejectedWith(
      /The media-id attribute is required for/);
  });
});
