/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {AmpAd} from '../../../amp-ad/0.1/amp-ad'; // eslint-disable-line no-unused-vars
import {AmpAdNetworkFakeImpl} from '../amp-ad-network-fake-impl';

describes.realWin(
  'amp-ad-network-fake-impl',
  {
    amp: {
      extensions: ['amp-ad', 'amp-ad-network-fake-impl'],
    },
  },
  env => {
    let doc;
    let win;
    let fakeImplElem;
    beforeEach(() => {
      win = env.win;
      doc = win.document;
      fakeImplElem = doc.createElement('amp-ad');
      fakeImplElem.setAttribute('type', 'fake');
      fakeImplElem.setAttribute('src', 'https://fake.com');
    });

    it('should not send ad request with valid id', () => {
      const fakeImpl = new AmpAdNetworkFakeImpl(fakeImplElem);
      // no id
      expect(fakeImpl.isValidElement()).to.be.false;
      // valid id
      fakeImplElem.setAttribute('id', 'valid');
      const fakeImpl2 = new AmpAdNetworkFakeImpl(fakeImplElem);
      expect(fakeImpl2.isValidElement()).to.be.false;
    });

    it('send ad request with invalid id', () => {
      fakeImplElem.setAttribute('id', 'i-amphtml-demo-test');
      const fakeImpl = new AmpAdNetworkFakeImpl(fakeImplElem);
      expect(fakeImpl.isValidElement()).to.be.true;
    });

    it('adds the correct metadata for a story ad', () => {
      const storyAd = `
    <html ⚡4ads>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,minimum-scale=1">
      <style amp4ads-boilerplate>body{visibility:hidden}</style>
      <script async src="https://cdn.ampproject.org/amp4ads-v0.js"></script>
      <meta name="amp-cta-type" content="INSTALL">
      <meta name="amp-cta-url" content="https://www.amp.dev">
    </head>
    <body>Hello, AMP4ADS world.</body>
    </html>
    `;
      fakeImplElem.setAttribute('id', 'i-amphtml-demo-test');
      fakeImplElem.setAttribute('amp-story', '');
      const transformed = new AmpAdNetworkFakeImpl(
        fakeImplElem
      ).transformCreative_(storyAd);
      const root = new DOMParser().parseFromString(transformed, 'text/html')
        .documentElement;
      const metadata = root.querySelector('[amp-ad-metadata]').textContent;
      const parsed = JSON.parse(metadata);
      expect(parsed.ctaType).to.equal('INSTALL');
      expect(parsed.ctaUrl).to.equal('https://www.amp.dev');
    });
  }
);
