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

import {DomFingerprint} from '../../src/utils/dom-fingerprint';
import {Services} from '../../src/services';
import {
  addDataAndJsonAttributes_,
  applySandbox,
  getBootstrapBaseUrl,
  getDefaultBootstrapBaseUrl,
  getIframe,
  getSubDomain,
  preloadBootstrap,
  resetBootstrapBaseUrlForTesting,
  resetCountForTesting,
} from '../../src/3p-frame';
import {
  deserializeMessage,
  serializeMessage,
} from '../../src/3p-frame-messaging';
import {dev} from '../../src/log';
import {loadPromise} from '../../src/event-helper';
import {preconnectForElement} from '../../src/preconnect';
import {toggleExperiment} from '../../src/experiments';

describe
  .configure()
  .ifChrome()
  .run('3p-frame', () => {
    let clock;
    let sandbox;
    let container;
    let preconnect;

    beforeEach(() => {
      sandbox = sinon.sandbox;
      clock = sandbox.useFakeTimers();
      container = document.createElement('div');
      document.body.appendChild(container);
      preconnect = preconnectForElement(container);
    });

    afterEach(() => {
      resetBootstrapBaseUrlForTesting(window);
      sandbox.restore();
      resetCountForTesting();
      const m = document.querySelector('[name="amp-3p-iframe-src"]');
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

    function setupElementFunctions(div) {
      const {innerWidth: width, innerHeight: height} = window;
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
      div.getPageLayoutBox = function() {
        return {
          left: 0,
          top: 0,
          width: 100,
          height: 200,
        };
      };
    }

    it('add attributes', () => {
      const div = document.createElement('div');
      div.setAttribute('data-foo-bar', 'foobar');
      div.setAttribute('data-hello', 'world');
      div.setAttribute('foo-bar', 'nope');
      div.setAttribute('data-vars-hello', 'nope');
      let obj = {};
      addDataAndJsonAttributes_(div, obj);
      expect(obj).to.deep.equal({
        'fooBar': 'foobar',
        'hello': 'world',
      });

      div.setAttribute('json', '{"abc": [1,2,3]}');

      obj = {};
      addDataAndJsonAttributes_(div, obj);
      expect(obj).to.deep.equal({
        'fooBar': 'foobar',
        'hello': 'world',
        'abc': [1, 2, 3],
      });
    });

    // TODO(bradfrizzell) break this out into a test-iframe-attributes
    it.skip('should create an iframe', () => {
      window.AMP_MODE = {
        localDev: true,
        development: false,
        minified: false,
        test: false,
        version: '$internalRuntimeVersion$',
      };
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

      const {innerWidth: width, innerHeight: height} = window;
      setupElementFunctions(div);

      const viewer = Services.viewerForDoc(window.document);
      const viewerMock = sandbox.mock(viewer);
      viewerMock
        .expects('getUnconfirmedReferrerUrl')
        .returns('http://acme.org/')
        .once();

      container.appendChild(div);

      sandbox
        .stub(DomFingerprint, 'generate')
        .callsFake(() => 'MY-MOCK-FINGERPRINT');

      const iframe = getIframe(window, div, '_ping_', {clientId: 'cidValue'});
      const {src} = iframe;
      const locationHref = location.href;
      expect(locationHref).to.not.be.empty;
      const docInfo = Services.documentInfoForDoc(window.document);
      expect(docInfo.pageViewId).to.not.be.empty;
      const name = JSON.parse(decodeURIComponent(iframe.name));
      const sentinel = name.attributes._context['sentinel'];
      const fragment =
        '{"testAttr":"value","ping":"pong","width":50,"height":100,' +
        '"type":"_ping_",' +
        '"_context":{"referrer":"http://acme.org/",' +
        '"ampcontextVersion": "$internalRuntimeVersion$",' +
        '"ampcontextFilepath": "https://3p.ampproject.net/' +
        '$internalRuntimeVersion$/ampcontext-v0.js",' +
        '"canonicalUrl":"' +
        docInfo.canonicalUrl +
        '",' +
        '"sourceUrl":"' +
        locationHref +
        '",' +
        '"pageViewId":"' +
        docInfo.pageViewId +
        '","clientId":"cidValue",' +
        '"initialLayoutRect": ' +
        JSON.stringify(div.getPageLayoutBox()) +
        ',' +
        '"initialIntersection": ' +
        JSON.stringify(div.getIntersectionChangeEntry()) +
        ',' +
        '"location":{"href":"' +
        locationHref +
        '"},"tagName":"MY-ELEMENT",' +
        '"mode":{"localDev":true,"development":false,"minified":false,' +
        '"test":false,"version":"$internalRuntimeVersion$"}' +
        ',"canary":true' +
        ',"hidden":false' +
        // Note that DOM fingerprint will change if the document DOM changes
        // Note also that running it using --files uses different DOM.
        ',"domFingerprint":"1725030182"' +
        ',"startTime":1234567888' +
        ',"experimentToggles":{"exp-a":true,"exp-b":true}' +
        ',"sentinel":"' +
        sentinel +
        '"' +
        ',"initialIntersection":{"time":1234567888,' +
        '"rootBounds":{"left":0,"top":0,"width":' +
        width +
        ',"height":' +
        height +
        ',"bottom":' +
        height +
        ',"right":' +
        width +
        ',"x":0,"y":0},"boundingClientRect":' +
        '{"width":100,"height":200},"intersectionRect":{' +
        '"left":0,"top":0,"width":0,"height":0,"bottom":0,' +
        '"right":0,"x":0,"y":0}}}}';
      expect(src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
      const parsedFragment = JSON.parse(fragment);
      // Since DOM fingerprint changes between browsers and documents, to have
      // stable tests, we can only verify its existence.
      expect(name.attributes._context.domFingerprint).to.exist;
      delete name.attributes._context.domFingerprint;
      delete parsedFragment._context.domFingerprint;
      // Value changes between tests.
      // TODO: Switch test to isolated window.
      expect(name.attributes._context.experimentToggles).to.exist;
      delete name.attributes._context.experimentToggles;
      delete parsedFragment._context.experimentToggles;
      expect(name.attributes).to.deep.jsonEqual(parsedFragment);

      // Switch to same origin for inner tests.
      iframe.src = '/dist.3p/current/frame.max.html';
      document.body.appendChild(iframe);
      return loadPromise(iframe).then(() => {
        const win = iframe.contentWindow;
        expect(win.context.canonicalUrl).to.equal(docInfo.canonicalUrl);
        expect(win.context.domFingerprint).to.equal('MY-MOCK-FINGERPRINT');
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
        expect(win.context.data).to.have.property('ping', 'pong');
        expect(win.context.data).to.have.property('testAttr', 'value');
        document.head.removeChild(link);
      });
    });

    it('should copy attributes to iframe', () => {
      const div = document.createElement('my-element');
      div.setAttribute('width', '50');
      div.setAttribute('height', '100');
      div.setAttribute('title', 'a_title');
      div.setAttribute('not_whitelisted', 'shouldnt_be_in_iframe');
      setupElementFunctions(div);

      container.appendChild(div);

      const iframe = getIframe(window, div, 'none');

      expect(iframe.width).to.equal('50');
      expect(iframe.height).to.equal('100');
      expect(iframe.title).to.equal('a_title');
      expect(iframe.not_whitelisted).to.equal(undefined);
    });

    it('should not set feature policy for sync-xhr with exp off', () => {
      const div = document.createElement('my-element');
      setupElementFunctions(div);
      container.appendChild(div);
      const iframe = getIframe(window, div, 'none');
      expect(iframe.getAttribute('allow')).to.equal(null);
    });

    it('should set feature policy for sync-xhr with exp on', () => {
      toggleExperiment(window, 'no-sync-xhr-in-ads', true);
      const div = document.createElement('my-element');
      setupElementFunctions(div);
      container.appendChild(div);
      const iframe = getIframe(window, div, 'none');
      expect(iframe.getAttribute('allow')).to.equal("sync-xhr 'none';");
    });

    it('should not set sandbox with sandbox-ads off', () => {
      const div = document.createElement('my-element');
      setupElementFunctions(div);
      container.appendChild(div);
      const iframe = getIframe(window, div, 'none');
      expect(iframe.getAttribute('sandbox')).to.equal(null);
    });

    it('should set sandbox with sandbox-ads on', () => {
      toggleExperiment(window, 'sandbox-ads', true);
      const div = document.createElement('my-element');
      setupElementFunctions(div);
      container.appendChild(div);
      const iframe = getIframe(window, div, 'none');
      expect(iframe.getAttribute('sandbox')).to.equal(
        'allow-top-navigation-by-user-activation ' +
          'allow-popups-to-escape-sandbox allow-forms ' +
          'allow-modals allow-pointer-lock allow-popups allow-same-origin ' +
          'allow-scripts'
      );
    });

    it('should set sandbox (direct call)', () => {
      const iframe = document.createElement('iframe');
      applySandbox(iframe);
      expect(iframe.getAttribute('sandbox')).to.equal(
        'allow-top-navigation-by-user-activation ' +
          'allow-popups-to-escape-sandbox allow-forms ' +
          'allow-modals allow-pointer-lock allow-popups allow-same-origin ' +
          'allow-scripts'
      );
    });

    it('should not set sandbox without feature detection', () => {
      const iframe = document.createElement('iframe');
      iframe.sandbox.supports = null;
      applySandbox(iframe);
      expect(iframe.getAttribute('sandbox')).to.equal(null);
    });

    it('should not set sandbox with failing feature detection', () => {
      const iframe = document.createElement('iframe');
      iframe.sandbox.supports = function(flag) {
        return flag != 'allow-top-navigation-by-user-activation';
      };
      applySandbox(iframe);
      expect(iframe.getAttribute('sandbox')).to.equal(null);
    });

    it('should pick the right bootstrap url for local-dev mode', () => {
      window.AMP_MODE = {localDev: true};
      expect(getBootstrapBaseUrl(window)).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('should pick the right bootstrap url for testing mode', () => {
      window.AMP_MODE = {test: true};
      expect(getBootstrapBaseUrl(window)).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('should pick the right bootstrap unique url (prod)', () => {
      window.AMP_MODE = {};
      expect(getBootstrapBaseUrl(window)).to.match(
        /^https:\/\/d-\d+\.ampproject\.net\/\$\internal\w+\$\/frame\.html$/
      );
    });

    it('should return a stable URL in getBootstrapBaseUrl', () => {
      window.AMP_MODE = {};
      expect(getBootstrapBaseUrl(window)).to.equal(getBootstrapBaseUrl(window));
    });

    it('should return a stable URL in getDefaultBootstrapBaseUrl', () => {
      window.AMP_MODE = {};
      expect(getDefaultBootstrapBaseUrl(window)).to.equal(
        getDefaultBootstrapBaseUrl(window)
      );
    });

    it('should pick the right bootstrap url (custom)', () => {
      addCustomBootstrap('https://example.com/boot/remote.html');
      expect(getBootstrapBaseUrl(window)).to.equal(
        'https://example.com/boot/remote.html?$internalRuntimeVersion$'
      );
    });

    it('should return different values for different file names', () => {
      window.AMP_MODE = {};
      let match = /^https:\/\/(d-\d+\.ampproject\.net)\/\$\internal\w+\$\/frame\.html$/.exec(
        getDefaultBootstrapBaseUrl(window)
      );
      const domain = match && match[1];
      expect(domain).to.be.ok;
      match = /^https:\/\/(d-\d+\.ampproject\.net)\/\$\internal\w+\$\/frame2\.html$/.exec(
        getDefaultBootstrapBaseUrl(window, 'frame2')
      );
      expect(match && match[1]).to.equal(domain);
    });

    it('should pick the right bootstrap url (custom)', () => {
      addCustomBootstrap('http://example.com/boot/remote.html');
      allowConsoleError(() => {
        expect(() => {
          getBootstrapBaseUrl(window);
        }).to.throw(/meta source must start with "https/);
      });
    });

    it('should pick the right bootstrap url (custom)', () => {
      addCustomBootstrap('http://localhost:9876/boot/remote.html');
      allowConsoleError(() => {
        expect(() => {
          getBootstrapBaseUrl(window, true);
        }).to.throw(/must not be on the same origin as the/);
      });
    });

    it('should pick default url if custom disabled', () => {
      addCustomBootstrap('http://localhost:9876/boot/remote.html');
      expect(getBootstrapBaseUrl(window, true, true)).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('should create frame with default url if custom disabled', () => {
      setupElementFunctions(container);
      const iframe = getIframe(window, container, '_ping_', {
        clientId: 'cidValue',
      });
      expect(iframe.src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('should prefetch bootstrap frame and JS', () => {
      window.AMP_MODE = {localDev: true};
      preloadBootstrap(window, preconnect);
      // Wait for visible promise
      return Promise.resolve().then(() => {
        const fetches = document.querySelectorAll('link[rel=preload]');
        expect(fetches).to.have.length(2);
        expect(fetches[0]).to.have.property(
          'href',
          'http://ads.localhost:9876/dist.3p/current/frame.max.html'
        );
        expect(fetches[1]).to.have.property(
          'href',
          'http://ads.localhost:9876/dist.3p/current/integration.js'
        );
      });
    });

    it('should prefetch default bootstrap frame if custom disabled', () => {
      window.AMP_MODE = {localDev: true};
      addCustomBootstrap('http://localhost:9876/boot/remote.html');
      preloadBootstrap(window, preconnect, true);
      // Wait for visible promise
      return Promise.resolve().then(() => {
        expect(
          document.querySelectorAll(
            'link[rel=preload]' +
              '[href="http://ads.localhost:9876/dist.3p/current/frame.max.html"]'
          )
        ).to.be.ok;
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
          getRandomValues(arg) {
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
          random() {
            return 0.567;
          },
        },
      };
      expect(getSubDomain(fakeWin)).to.equal('d-5670');
    });

    it('uses a unique name based on domain', () => {
      const viewerMock = sandbox.mock(Services.viewerForDoc(window.document));
      viewerMock
        .expects('getUnconfirmedReferrerUrl')
        .returns('http://acme.org/')
        .twice();

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
      div.getPageLayoutBox = function() {
        return {
          left: 0,
          top: 0,
          width: 100,
          height: 200,
        };
      };

      container.appendChild(div);
      const name = JSON.parse(getIframe(window, div).name);
      resetBootstrapBaseUrlForTesting(window);
      resetCountForTesting();
      const newName = JSON.parse(getIframe(window, div).name);
      expect(name.host).to.match(/d-\d+.ampproject.net/);
      expect(name.type).to.match(/ping/);
      expect(name.count).to.match(/1/);
      expect(newName.host).to.match(/d-\d+.ampproject.net/);
      expect(newName.type).to.match(/ping/);
      expect(newName.count).to.match(/1/);
      expect(newName).not.to.equal(name);
    });

    describe('serializeMessage', () => {
      it('should work without payload', () => {
        const message = serializeMessage('msgtype', 'msgsentinel');
        expect(message.indexOf('amp-')).to.equal(0);
        expect(deserializeMessage(message)).to.deep.equal({
          type: 'msgtype',
          sentinel: 'msgsentinel',
        });
      });

      it('should work with payload', () => {
        const message = serializeMessage('msgtype', 'msgsentinel', {
          type: 'type_override', // override should be ignored
          sentinel: 'sentinel_override', // override should be ignored
          x: 1,
          y: 'abc',
        });
        expect(deserializeMessage(message)).to.deep.equal({
          type: 'msgtype',
          sentinel: 'msgsentinel',
          x: 1,
          y: 'abc',
        });
      });

      it('should work with rtvVersion', () => {
        const message = serializeMessage(
          'msgtype',
          'msgsentinel',
          {
            type: 'type_override', // override should be ignored
            sentinel: 'sentinel_override', // override should be ignored
            x: 1,
            y: 'abc',
          },
          'rtv123'
        );
        expect(deserializeMessage(message)).to.deep.equal({
          type: 'msgtype',
          sentinel: 'msgsentinel',
          x: 1,
          y: 'abc',
        });
      });
    });

    describe('deserializeMessage', () => {
      it('should deserialize valid message', () => {
        const message = deserializeMessage(
          'amp-{"type":"msgtype","sentinel":"msgsentinel","x":1,"y":"abc"}'
        );
        expect(message).to.deep.equal({
          type: 'msgtype',
          sentinel: 'msgsentinel',
          x: 1,
          y: 'abc',
        });
      });

      it('should deserialize valid message with rtv version', () => {
        const message = deserializeMessage(
          'amp-rtv123{"type":"msgtype","sentinel":"msgsentinel",' +
            '"x":1,"y":"abc"}'
        );
        expect(message).to.deep.equal({
          type: 'msgtype',
          sentinel: 'msgsentinel',
          x: 1,
          y: 'abc',
        });
      });

      it('should return null if the input not a string', () => {
        expect(deserializeMessage({x: 1, y: 'abc'})).to.be.null;
      });

      it('should return null if the input does not start with amp-', () => {
        expect(
          deserializeMessage(
            'noamp-{"type":"msgtype","sentinel":"msgsentinel"}'
          )
        ).to.be.null;
      });

      it('should return null if the input is not a json', () => {
        const errorStub = sandbox.stub(dev(), 'error');
        expect(deserializeMessage('amp-other')).to.be.null;
        expect(errorStub).to.not.be.called;
      });

      it('should return null if failed to parse the input', () => {
        const errorStub = sandbox.stub(dev(), 'error');
        expect(deserializeMessage('amp-{"type","sentinel":"msgsentinel"}')).to
          .be.null;
        expect(errorStub).to.be.calledOnce;

        expect(
          deserializeMessage('amp-{"type":"msgtype"|"sentinel":"msgsentinel"}')
        ).to.be.null;
        expect(errorStub).to.be.calledTwice;
      });
    });
  });
