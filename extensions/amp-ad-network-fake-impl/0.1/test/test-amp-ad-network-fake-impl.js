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
    const ampMraid = `<script async host-service=amp-mraid src=https://cdn.ampproject.org/v0/amp-mraid-0.1.js></script>`;
    const ampMustache = `<script async custom-template=amp-mustache src=https://cdn.ampproject.org/v0/amp-mustache-0.1.js></script>`;
    const fontLink = `<link href=https://fonts.googleapis.com/css?foobar rel=stylesheet type=text/css>`;
    const crossorigin = `<link crossorigin href=https://fonts.gstatic.com/ rel="dns-prefetch preconnect">`;
    const metaCharset = `<meta charset=utf-8></meta>`;
    const metaViewport = `<meta name=viewport content="width=device-width,minimum-scale=1,initial-scale=1"></meta>`;
    const ampCustomStyle = `<style amp-custom></style>`;
    const linkIcon = `<link href=https://example.com/favicon.ico rel=icon>`;
    const ampViewerIntegration = `<script async src=https://cdn.ampproject.org/v0/amp-viewer-integration-0.1.js></script>`;
    const ampGmail = `<script async src=https://cdn.ampproject.org/v0/amp-viewer-integration-gmail-0.1.js></script>`;
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


    it('reorders head', () => {
      const input = `
      <html>
      <head>` + title + styleBoilerplate + ampExperiment + ampAudio + noscript + ampRuntimeStyle + ampRuntimeScript + ampMraid + ampMustache + fontLink + crossorigin + metaCharset
      + metaViewport + ampCustomStyle + linkIcon + ampViewerIntegration + ampGmail + 
      `</head><body></body></html>`;
      const expected = `
      <html>
      <head>` + metaCharset + ampRuntimeStyle + metaViewport + ampRuntimeScript + ampViewerIntegration + ampGmail + ampExperiment + ampAudio + ampMraid + ampMustache
      + linkIcon + crossorigin + fontLink + ampCustomStyle + title + styleBoilerplate + noscript + 
      `</head><body></body></html>`;
      const inputHeadDoc = new DOMParser().parseFromString(input, 'text/html');
      const expectedHeadDoc = new DOMParser().parseFromString(expected, 'text/html')
      fakeImplElem.setAttribute('id', 'i-amphtml-demo-test-1');
      const transformed = new AmpAdNetworkFakeImpl(fakeImplElem).reorderHead_(inputHeadDoc.head);
      expect(transformed).to.equal(expectedHeadDoc.head.outerHTML);
    });

    it('reorders head a4a', () => {
      const inputa4a = `
      <html amp4ads>
      <head>` + title + styleBoilerplate + ampAudio + ampRuntimeScript + fontLink + crossorigin + metaCharset
      + metaViewport + ampCustomStyle + 
      `</head><body></body></html>`;
      const expecteda4a = `
      <html>
      <head>` + metaCharset + metaViewport + ampRuntimeScript + ampAudio + crossorigin + fontLink + ampCustomStyle + title + styleBoilerplate +
      `</head><body></body></html>`;
      const inputHeadDoc = new DOMParser().parseFromString(inputa4a, 'text/html');
      const expectedHeadDoc = new DOMParser().parseFromString(expecteda4a, 'text/html')
      fakeImplElem.setAttribute('id', 'i-amphtml-demo-test-2');
      const transformed = new AmpAdNetworkFakeImpl(fakeImplElem).reorderHead_(inputHeadDoc.head);
      expect(transformed).to.equal(expectedHeadDoc.head);
    });

    it('generates metadata', () => {
      const docString = `<html ⚡><head>
      <script custom-element="amp-font"
          src="https://cdn.ampproject.org/v0/amp-font-0.1.js"></script>
      <script custom-element="amp-list"
          src="https://cdn.ampproject.org/v0/amp-list-latest.js"></script>
      <script custom-element="amp-list"
          src="https://cdn.ampproject.org/v0/amp-list-0.1.js"></script>
      </head><body></body></html>`;
      fakeImplElem.setAttribute('id', 'i-amphtml-demo-test-3');
      const reordered = new AmpAdNetworkFakeImpl(fakeImplElem).transformCreative_(docString);
      expect(reordered).to.include(`"extensions":[{"custom-element":"amp-font","src":"https://cdn.ampproject.org/v0/amp-font-0.1.js"},{"custom-element":"amp-list","src":"https://cdn.ampproject.org/v0/amp-list-latest.js"}]`);  
    })
  }
);
