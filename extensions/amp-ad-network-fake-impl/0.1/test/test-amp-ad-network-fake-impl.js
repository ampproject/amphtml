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
    const title = `<title>Hello, world.</title>`;
    const styleBoilerplate = `<style amp4ads-boilerplate>body{visibility:hidden}</style>`;
    const ampExperiment = `<script async custom-element=amp-experiment src=https://cdn.ampproject.org/v0/amp-experiment-0.1.js></script>`;
    const ampAudio = `<script async custom-element=amp-audio src=https://cdn.ampproject.org/v0/amp-audio-0.1.js></script>`;
    const noscript = `<noscript><style amp-boilerplate> body{-webkit-animation:none;-moz-animation:none;-ms-animation:none; animation:none}</style></noscript>`;
    const ampRuntimeStyle = `<style amp-runtime i-amphtml-version=42></style>`;
    const ampRuntimeScript = `<script async src=https://cdn.ampproject.org/amp4ads-v0.js></script>`;
    const fontLink = `<link href=https://fonts.googleapis.com/css?foobar rel=stylesheet type=text/css>`;
    const crossorigin = `<link crossorigin href=https://fonts.gstatic.com/ rel="dns-prefetch preconnect">`;
    const metaCharset = `<meta charset=utf-8></meta>`;
    const metaViewport = `<meta name=viewport content="width=device-width,minimum-scale=1,initial-scale=1"></meta>`;
    const ampCustomStyle = `<style amp-custom></style>`;
    const linkIcon = `<link href=https://example.com/favicon.ico rel=icon>`;
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

    it('reorders head and inserts metadata into creative', () => {
      const input =
        `<html><head>` +
        title +
        styleBoilerplate +
        ampExperiment +
        ampAudio +
        noscript +
        ampRuntimeStyle +
        ampRuntimeScript +
        fontLink +
        crossorigin +
        metaCharset +
        metaViewport +
        ampCustomStyle +
        linkIcon +
        `</head><body><amp-analytics><script type=application/json>Iñtërnâtiônàlizætiøn☃💩</script></amp-analytics></body></html>`;
      fakeImplElem.setAttribute('id', 'i-amphtml-demo-test');
      const transformed = new AmpAdNetworkFakeImpl(
        fakeImplElem
      ).transformCreative_(input);
      expect(transformed).to.include(
        '<script type="application/json" amp-ad-metadata>'
      );
      const root = new DOMParser().parseFromString(transformed, 'text/html');
      const parsed = JSON.parse(
        root.querySelector('script[amp-ad-metadata]').textContent
      );
      const runtimeOffsetStart = parsed.ampRuntimeUtf16CharOffsets[0];
      const runtimeOffsetEnd = parsed.ampRuntimeUtf16CharOffsets[1];
      expect(
        transformed.substr(
          runtimeOffsetStart,
          runtimeOffsetEnd - runtimeOffsetStart
        )
      ).to.equal(
        '<script async="" src="https://cdn.ampproject.org/amp4ads-v0.js"></script><script async="" custom-element="amp-experiment" src="https://cdn.ampproject.org/v0/amp-experiment-0.1.js"></script><script async="" custom-element="amp-audio" src="https://cdn.ampproject.org/v0/amp-audio-0.1.js"></script>'
      );
      const jsonOffsetStart = parsed.jsonUtf16CharOffsets['amp-analytics'][0];
      const jsonOffsetEnd = parsed.jsonUtf16CharOffsets['amp-analytics'][1];
      expect(
        transformed.substr(jsonOffsetStart, jsonOffsetEnd - jsonOffsetStart)
      ).to.equal(
        '<script type="application/json">Iñtërnâtiônàlizætiøn☃💩</script>'
      );
      expect(transformed).to.include(
        '"customElementExtensions":["amp-experiment","amp-audio"]'
      );
      expect(transformed).to.include(
        '"customStyleSheets":[{"href":"https://fonts.googleapis.com/css?foobar"}]'
      );
    });
  }
);
