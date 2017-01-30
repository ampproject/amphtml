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
  getIframe,
  resetCountForTesting,
  resetBootstrapBaseUrlForTesting,
} from '../../src/3p-frame';
import {documentInfoForDoc} from '../../src/document-info';
import {loadPromise} from '../../src/event-helper';
import {toggleExperiment} from '../../src/experiments';
import {validateData} from '../../3p/3p';
import {viewerForDoc} from '../../src/viewer';
import * as sinon from 'sinon';

describe('3p-frame', () => {

  let clock;
  let sandbox;
  let container;

  const sentinelNames = ['sentinel', 'amp3pSentinel'];

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    resetBootstrapBaseUrlForTesting(window);
    sandbox.restore();
    resetCountForTesting();
    const m = document.querySelector(
        '[name="amp-3p-iframe-src"]');
    if (m) {
      m.parentElement.removeChild(m);
    }
    document.body.removeChild(container);
    toggleExperiment(window, 'sentinel-name-change', false);
  });

  sentinelNames.forEach(sentinelName => {
    it('should create an iframe', () => {
      window.AMP_MODE = {
        localDev: true,
        development: false,
        minified: false,
        test: false,
        version: '$internalRuntimeVersion$',
      };
      if (sentinelName == 'sentinel') {
        toggleExperiment(window, 'sentinel-name-change', true);
      }
      toggleExperiment(window, 'exp-a', true);
      toggleExperiment(window, 'exp-b', true);
      clock.tick(1234567888);
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'https://foo.bar/baz');
      document.head.appendChild(link);

      const div = document.createElement('my-element');
      div.setAttribute('data-test-attr', 'value');
      div.setAttribute('data-ping', 'pong');
      div.setAttribute('width', '50');
      div.setAttribute('height', '100');

      const width = window.innerWidth;
      const height = window.innerHeight;
      div.getIntersectionChangeEntry = function() {
        return {
          time: 1234567888,
          rootBounds: {
            left: 0,
            top: 0,
            width,
            height,
            bottom: height,
            right: width,
            x: 0,
            y: 0,
          },
          boundingClientRect: {
            width: 100,
            height: 200,
          },
          intersectionRect: {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            bottom: 0,
            right: 0,
            x: 0,
            y: 0,
          },
        };
      };

      const viewer = viewerForDoc(window.document);
      const viewerMock = sandbox.mock(viewer);
      viewerMock.expects('getUnconfirmedReferrerUrl')
          .returns('http://acme.org/')
          .once();

      container.appendChild(div);
      const iframe = getIframe(window, div, '_ping_', {clientId: 'cidValue'});
      const src = iframe.src;
      const locationHref = location.href;
      expect(locationHref).to.not.be.empty;
      const docInfo = documentInfoForDoc(window.document);
      expect(docInfo.pageViewId).to.not.be.empty;
      let sentinel;
      const name = JSON.parse(decodeURIComponent(iframe.name));
      sentinel = name.attributes._context[sentinelName];
      const fragment =
          '{"testAttr":"value","ping":"pong","width":50,"height":100,' +
          '"type":"_ping_",' +
          '"_context":{"referrer":"http://acme.org/",' +
          '"ampcontextVersion": "$internalRuntimeVersion$",' +
          '"canonicalUrl":"' + docInfo.canonicalUrl + '",' +
          '"sourceUrl":"' + locationHref + '",' +
          '"pageViewId":"' + docInfo.pageViewId + '","clientId":"cidValue",' +
          '"location":{"href":"' + locationHref + '"},"tagName":"MY-ELEMENT",' +
          '"mode":{"localDev":true,"development":false,"minified":false,' +
          '"test":false,"version":"$internalRuntimeVersion$"}' +
          ',"canary":true' +
          ',"hidden":false' +
          // Note that DOM fingerprint will change if the document DOM changes
          // Note also that running it using --files uses different DOM.
          ',"domFingerprint":"1725030182"' +
          ',"startTime":1234567888' +
          ',"experimentToggles":{"exp-a":true,"exp-b":true' +
          (sentinelName == 'sentinel' ?
          ',"sentinel-name-change": true}' :
          ',"sentinel-name-change": false}') +
          ',"' + sentinelName + '":"' + sentinel + '"' +
          ',"initialIntersection":{"time":1234567888,' +
          '"rootBounds":{"left":0,"top":0,"width":' + width + ',"height":' +
          height + ',"bottom":' + height + ',"right":' + width +
          ',"x":0,"y":0},"boundingClientRect":' +
          '{"width":100,"height":200},"intersectionRect":{' +
          '"left":0,"top":0,"width":0,"height":0,"bottom":0,' +
          '"right":0,"x":0,"y":0}}}}';
      expect(src).to.equal(
          'http://ads.localhost:9876/dist.3p/current/frame.max.html');
      const parsedFragment = JSON.parse(fragment);
      // Since DOM fingerprint changes between browsers and documents, to have
      // stable tests, we can only verify its existence.
      expect(name.attributes._context.domFingerprint).to.exist;
      delete name.attributes._context.domFingerprint;
      delete parsedFragment._context.domFingerprint;
      expect(name.attributes).to.deep.equal(parsedFragment);

      // Switch to same origin for inner tests.
      iframe.src = '/dist.3p/current/frame.max.html';
      document.body.appendChild(iframe);
      return loadPromise(iframe).then(() => {
        const win = iframe.contentWindow;
        expect(win.context.canonicalUrl).to.equal(docInfo.canonicalUrl);
        expect(win.context.sourceUrl).to.equal(locationHref);
        expect(win.context.location.href).to.equal(locationHref);
        expect(win.context.location.origin).to.equal('http://localhost:9876');
        expect(win.context.pageViewId).to.equal(docInfo.pageViewId);
        expect(win.context.referrer).to.equal('http://acme.org/');
        expect(win.context.data.testAttr).to.equal('value');
        expect(win.context.noContentAvailable).to.be.a('function');
        expect(win.context.observeIntersection).to.be.a('function');
        expect(win.context.reportRenderedEntityIdentifier).to.be.a('function');
        const c = win.document.getElementById('c');
        expect(c).to.not.be.null;
        expect(c.textContent).to.contain('pong');
        validateData(win.context.data, ['ping', 'testAttr']);
        document.head.removeChild(link);
      });
    });
  });
});
