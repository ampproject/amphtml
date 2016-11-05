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
  addDataAndJsonAttributes_,
  getIframe,
  getBootstrapBaseUrl,
  getSubDomain,
  preloadBootstrap,
  resetCountForTesting,
  resetBootstrapBaseUrlForTesting,
} from '../../src/3p-frame';
import {documentInfoForDoc} from '../../src/document-info';
import {loadPromise} from '../../src/event-helper';
import {preconnectForElement} from '../../src/preconnect';
import {validateData} from '../../3p/3p';
import {viewerForDoc} from '../../src/viewer';
import * as sinon from 'sinon';

describe('3p-frame', () => {

  let clock;
  let sandbox;
  let container;
  let preconnect;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    preconnect = preconnectForElement(container);
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
  });

  function addCustomBootstrap(url) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'amp-3p-iframe-src');
    meta.setAttribute('content', url);
    document.head.appendChild(meta);
  }

  it('add attributes', () => {
    const div = document.createElement('div');
    div.setAttribute('data-foo', 'foo');
    div.setAttribute('data-bar', 'bar');
    div.setAttribute('foo', 'nope');
    let obj = {};
    addDataAndJsonAttributes_(div, obj);
    expect(obj).to.deep.equal({
      'foo': 'foo',
      'bar': 'bar',
    });

    div.setAttribute('json', '{"abc": [1,2,3]}');

    obj = {};
    addDataAndJsonAttributes_(div, obj);
    expect(obj).to.deep.equal({
      'foo': 'foo',
      'bar': 'bar',
      'abc': [1, 2, 3],
    });
  });

  it('should create an iframe', () => {
    window.AMP_MODE = {
      localDev: true,
      development: false,
      minified: false,
      test: false,
      version: '$internalRuntimeVersion$',
    };

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
    const amp3pSentinel = iframe.getAttribute('data-amp-3p-sentinel');
    const fragment =
        '{"testAttr":"value","ping":"pong","width":50,"height":100,' +
        '"type":"_ping_"' +
        ',"_context":{"referrer":"http://acme.org/",' +
        '"canonicalUrl":"https://foo.bar/baz",' +
        '"pageViewId":"' + docInfo.pageViewId + '","clientId":"cidValue",' +
        '"location":{"href":"' + locationHref + '"},"tagName":"MY-ELEMENT",' +
        '"mode":{"localDev":true,"development":false,"minified":false,' +
        '"test":false,"version":"$internalRuntimeVersion$"}' +
        ',"canary":true' +
        ',"hidden":false' +
        ',"startTime":1234567888' +
        ',"amp3pSentinel":"' + amp3pSentinel + '"' +
        ',"initialIntersection":{"time":1234567888,' +
        '"rootBounds":{"left":0,"top":0,"width":' + width + ',"height":' +
        height + ',"bottom":' + height + ',"right":' + width +
        ',"x":0,"y":0},"boundingClientRect":' +
        '{"width":100,"height":200},"intersectionRect":{' +
        '"left":0,"top":0,"width":0,"height":0,"bottom":0,' +
        '"right":0,"x":0,"y":0}}}}';
    const srcParts = src.split('#');
    expect(srcParts[0]).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html');
    expect(JSON.parse(srcParts[1])).to.deep.equal(JSON.parse(fragment));

    // Switch to same origin for inner tests.
    iframe.src = '/dist.3p/current/frame.max.html#' + fragment;

    document.body.appendChild(iframe);
    return loadPromise(iframe).then(() => {
      const win = iframe.contentWindow;
      expect(win.context.canonicalUrl).to.equal('https://foo.bar/baz');
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


  it('should pick the right bootstrap url for local-dev mode', () => {
    window.AMP_MODE = {localDev: true};
    expect(getBootstrapBaseUrl(window)).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html');
  });

  it('should pick the right bootstrap url for testing mode', () => {
    window.AMP_MODE = {test: true};
    expect(getBootstrapBaseUrl(window)).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html');
  });

  it('should pick the right bootstrap unique url (prod)', () => {
    window.AMP_MODE = {};
    expect(getBootstrapBaseUrl(window)).to.match(
        /^https:\/\/d-\d+\.ampproject\.net\/\$\internal\w+\$\/frame\.html$/);
  });

  it('should pick the right bootstrap url (custom)', () => {
    addCustomBootstrap('https://example.com/boot/remote.html');
    expect(getBootstrapBaseUrl(window)).to.equal(
        'https://example.com/boot/remote.html?$internalRuntimeVersion$');
  });

  it('should pick the right bootstrap url (custom)', () => {
    addCustomBootstrap('http://example.com/boot/remote.html');
    expect(() => {
      getBootstrapBaseUrl(window);
    }).to.throw(/meta source must start with "https/);
  });

  it('should pick the right bootstrap url (custom)', () => {
    addCustomBootstrap('http://localhost:9876/boot/remote.html');
    expect(() => {
      getBootstrapBaseUrl(window, true);
    }).to.throw(/must not be on the same origin as the/);
  });

  it('should prefetch bootstrap frame and JS', () => {
    window.AMP_MODE = {localDev: true};
    preloadBootstrap(window, preconnect);
    // Wait for visible promise
    return Promise.resolve().then(() => {
      const fetches = document.querySelectorAll(
          'link[rel=prefetch],link[rel=preload]');
      expect(fetches).to.have.length(2);
      expect(fetches[0]).to.have.property('href',
          'http://ads.localhost:9876/dist.3p/current/frame.max.html');
      expect(fetches[1]).to.have.property('href',
          'http://ads.localhost:9876/dist.3p/current/integration.js');
    });
  });

  it('should make sub domains (unique)', () => {
    expect(getSubDomain(window)).to.match(/^d-\d+$/);
    expect(getSubDomain(window)).to.not.equal('d-00');
  });

  it('should make sub domains (Math)', () => {
    const fakeWin = {document, Math};
    expect(getSubDomain(fakeWin)).to.match(/^d-\d+$/);
  });

  it('should make sub domains (crypto)', () => {
    const fakeWin = {
      document,
      crypto: {
        getRandomValues: function(arg) {
          arg[0] = 123;
          arg[1] = 987;
        },
      },
    };
    expect(getSubDomain(fakeWin)).to.equal('d-123987');
  });

  it('should make sub domains (fallback)', () => {
    const fakeWin = {
      document,
      Math: {
        random: function() {
          return 0.567;
        },
      },
    };
    expect(getSubDomain(fakeWin)).to.equal('d-5670');
  });

  it('uses a unique name based on domain', () => {
    const viewerMock = sandbox.mock(viewerForDoc(window.document));
    viewerMock.expects('getUnconfirmedReferrerUrl')
        .returns('http://acme.org/').twice();

    window.AMP_MODE = {};
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', 'https://foo.bar/baz');
    document.head.appendChild(link);

    const div = document.createElement('div');
    div.setAttribute('type', '_ping_');
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    div.getIntersectionChangeEntry = function() {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
      };
    };

    container.appendChild(div);
    const name = getIframe(window, div).name;
    resetBootstrapBaseUrlForTesting(window);
    resetCountForTesting();
    const newName = getIframe(window, div).name;
    expect(name).to.match(/d-\d+.ampproject.net__ping__0/);
    expect(newName).to.match(/d-\d+.ampproject.net__ping__0/);
    expect(newName).not.to.equal(name);
  });
});
