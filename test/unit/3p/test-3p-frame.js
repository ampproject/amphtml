import {deserializeMessage, serializeMessage} from '#core/3p-frame-messaging';
import {DomFingerprint} from '#core/dom/fingerprint';
import * as mode from '#core/mode';
import {WindowInterface} from '#core/window/interface';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';

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
} from '../../../src/3p-frame';

describes.realWin('3p-frame', {amp: true}, (env) => {
  let window, document;

  beforeEach(() => {
    window = env.win;
    document = window.document;
  });

  function mockMode(options) {
    env.sandbox.stub(window.parent, '__AMP_MODE').value(options);
    env.sandbox.stub(mode, 'isProd').returns(!!options.isProd);
  }

  describe
    .configure()
    .ifChrome()
    .run('3p-frame', () => {
      let clock;
      let container;
      let preconnect;

      beforeEach(() => {
        clock = env.sandbox.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
        preconnect = Services.preconnectFor(window);
      });

      afterEach(() => {
        resetBootstrapBaseUrlForTesting(window);
        resetCountForTesting();
        const m = document.querySelector('[name="amp-3p-iframe-src"]');
        if (m) {
          m.parentElement.removeChild(m);
        }
        document.body.removeChild(container);
        Services.ampdoc(window.document).meta_ = null;
      });

      function addCustomBootstrap(url) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'amp-3p-iframe-src');
        meta.setAttribute('content', url);
        document.head.appendChild(meta);
      }

      function setupElementFunctions(div) {
        div.getAmpDoc = function () {
          return Services.ampdoc(window.document);
        };

        const {innerHeight: height, innerWidth: width} = window;
        div.getIntersectionChangeEntry = function () {
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
        env.sandbox.stub(div, 'offsetParent').value(null);
        env.sandbox.stub(div, 'offsetTop').value(0);
        env.sandbox.stub(div, 'offsetLeft').value(0);
        env.sandbox.stub(div, 'offsetWidth').value(100);
        env.sandbox.stub(div, 'offsetHeight').value(200);
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

      it('should create an iframe', () => {
        mockMode({
          esm: false,
          localDev: true,
          development: false,
          test: false,
          version: '$internalRuntimeVersion$',
        });
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

        setupElementFunctions(div);

        const viewer = Services.viewerForDoc(window.document);
        const viewerMock = env.sandbox.mock(viewer);
        viewerMock
          .expects('getUnconfirmedReferrerUrl')
          .returns('http://acme.org/')
          .once();

        container.appendChild(div);

        env.sandbox
          .stub(DomFingerprint, 'generate')
          .callsFake(() => 'MY-MOCK-FINGERPRINT');

        const locationHref = location.href;
        expect(locationHref).to.not.be.empty;
        env.sandbox
          .stub(WindowInterface, 'getLocation')
          .returns({href: locationHref});

        const initialIntersection = {test: 'testIntersection'};
        const iframe = getIframe(
          window,
          div,
          '_ping_',
          {clientId: 'cidValue'},
          {
            initialIntersection,
          }
        );
        const {src} = iframe;
        const docInfo = Services.documentInfoForDoc(window.document);
        expect(docInfo.pageViewId).to.not.be.empty;
        const name = JSON.parse(iframe.name);
        const sentinel = name.attributes._context['sentinel'];
        const fragment = {
          'testAttr': 'value',
          'ping': 'pong',
          'width': 50,
          'height': 100,
          'type': '_ping_',
          '_context': {
            'referrer': 'http://acme.org/',
            'ampcontextVersion': '$internalRuntimeVersion$',
            'ampcontextFilepath':
              'https://3p.ampproject.net/$internalRuntimeVersion$/ampcontext-v0.js',
            'canonicalUrl': docInfo.canonicalUrl,
            'sourceUrl': locationHref,
            'pageViewId': docInfo.pageViewId,
            'clientId': 'cidValue',
            'initialLayoutRect': {height: 200, left: 0, top: 0, width: 100},
            'location': {'href': locationHref},
            'tagName': 'MY-ELEMENT',
            'mode': {
              'localDev': true,
              'development': false,
              'test': false,
              'esm': false,
            },
            'canary': false,
            'hidden': false,
            // Note that DOM fingerprint will change if the document DOM changes
            // Note also that running it using --files uses different DOM.
            'domFingerprint': '1725030182',
            'startTime': 1234567888,
            'experimentToggles': {'exp-a': true, 'exp-b': true},
            'sentinel': sentinel,
            initialIntersection,
          },
        };
        expect(src).to.equal(
          'http://ads.localhost:9876/dist.3p/current/frame.max.html'
        );
        // Since DOM fingerprint changes between browsers and documents, to have
        // stable tests, we can only verify its existence.
        expect(name.attributes._context.domFingerprint).to.exist;
        delete name.attributes._context.domFingerprint;
        delete fragment._context.domFingerprint;
        // Value changes between tests.
        // TODO: Switch test to isolated window.
        expect(name.attributes._context.experimentToggles).to.exist;
        delete name.attributes._context.experimentToggles;
        delete fragment._context.experimentToggles;
        expect(name.attributes).to.deep.jsonEqual(fragment);
      });

      it('should copy attributes to iframe', () => {
        const div = document.createElement('my-element');
        div.setAttribute('width', '50');
        div.setAttribute('height', '100');
        div.setAttribute('title', 'a_title');
        div.setAttribute('not_allowlisted', 'shouldnt_be_in_iframe');
        setupElementFunctions(div);

        container.appendChild(div);

        const iframe = getIframe(window, div, 'none');

        expect(iframe.width).to.equal('50');
        expect(iframe.height).to.equal('100');
        expect(iframe.title).to.equal('a_title');
        expect(iframe.not_allowlisted).to.equal(undefined);
      });

      it('should set feature policy for sync-xhr', () => {
        const div = document.createElement('my-element');
        setupElementFunctions(div);
        container.appendChild(div);
        const iframe = getIframe(window, div, 'none');
        expect(iframe.getAttribute('allow')).to.equal("sync-xhr 'none';");
      });

      it('should set sandbox', () => {
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
        iframe.sandbox.supports = function (flag) {
          return flag != 'allow-top-navigation-by-user-activation';
        };
        applySandbox(iframe);
        expect(iframe.getAttribute('sandbox')).to.equal(null);
      });

      it('should pick the right bootstrap url for local-dev mode', () => {
        mockMode({localDev: true});
        const ampdoc = Services.ampdoc(window.document);
        expect(getBootstrapBaseUrl(window, ampdoc)).to.equal(
          'http://ads.localhost:9876/dist.3p/current/frame.max.html'
        );
      });

      it('should pick the right bootstrap url for testing mode', () => {
        mockMode({test: true});
        const ampdoc = Services.ampdoc(window.document);
        expect(getBootstrapBaseUrl(window, ampdoc)).to.equal(
          'http://ads.localhost:9876/dist.3p/current/frame.max.html'
        );
      });

      it('should pick the right bootstrap unique url (prod)', () => {
        mockMode({isProd: true});
        const ampdoc = Services.ampdoc(window.document);
        expect(getBootstrapBaseUrl(window, ampdoc)).to.match(
          /^https:\/\/d-\d+\.ampproject\.net\/\$\internal\w+\$\/frame\.html$/
        );
      });

      it('should return a stable URL in getBootstrapBaseUrl', () => {
        mockMode({isProd: true});
        const ampdoc = Services.ampdoc(window.document);
        expect(getBootstrapBaseUrl(window, ampdoc)).to.equal(
          getBootstrapBaseUrl(window, ampdoc)
        );
      });

      it('should return a stable URL in getDefaultBootstrapBaseUrl', () => {
        mockMode({isProd: true});
        expect(getDefaultBootstrapBaseUrl(window)).to.equal(
          getDefaultBootstrapBaseUrl(window)
        );
      });

      it('should pick the right bootstrap url (custom)', () => {
        addCustomBootstrap('https://example.com/boot/remote.html');
        const ampdoc = Services.ampdoc(window.document);
        expect(getBootstrapBaseUrl(window, ampdoc)).to.equal(
          'https://example.com/boot/remote.html?$internalRuntimeVersion$'
        );
      });

      it('should return different values for different file names', () => {
        mockMode({isProd: true});
        let match =
          /^https:\/\/(d-\d+\.ampproject\.net)\/\$\internal\w+\$\/frame\.html$/.exec(
            getDefaultBootstrapBaseUrl(window)
          );
        const domain = match && match[1];
        expect(domain).to.be.ok;
        match =
          /^https:\/\/(d-\d+\.ampproject\.net)\/\$\internal\w+\$\/frame2\.html$/.exec(
            getDefaultBootstrapBaseUrl(window, 'frame2')
          );
        expect(match && match[1]).to.equal(domain);
      });

      it('should pick the right bootstrap url (custom)', () => {
        addCustomBootstrap('http://example.com/boot/remote.html');
        const ampdoc = Services.ampdoc(window.document);
        allowConsoleError(() => {
          expect(() => {
            getBootstrapBaseUrl(window, ampdoc);
          }).to.throw(
            /meta\[name="amp-3p-iframe-src"\] source must start with "https/
          );
        });
      });

      it('should pick the right bootstrap url (custom)', () => {
        addCustomBootstrap('http://localhost:9876/boot/remote.html');
        const ampdoc = Services.ampdoc(window.document);
        allowConsoleError(() => {
          expect(() => {
            getBootstrapBaseUrl(window.parent, ampdoc, true);
          }).to.throw(/must not be on the same origin as the/);
        });
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
        mockMode({isProd: true});
        const ampdoc = Services.ampdoc(window.document);
        preloadBootstrap(window, 'avendor', ampdoc, preconnect);
        // Wait for visible promise.
        return ampdoc.whenFirstVisible().then(() => {
          const fetches = document.querySelectorAll('link[rel=preload]');
          expect(fetches).to.have.length(2);
          expect(fetches[0].href).to.match(
            /^https:\/\/d-\d+\.ampproject\.net\/\$internalRuntimeVersion\$\/frame\.html$/
          );
          expect(fetches[1]).to.have.property(
            'href',
            'https://3p.ampproject.net/$internalRuntimeVersion$/vendor/avendor.js'
          );
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
        const viewerMock = env.sandbox.mock(
          Services.viewerForDoc(window.document)
        );
        viewerMock
          .expects('getUnconfirmedReferrerUrl')
          .returns('http://acme.org/')
          .twice();

        mockMode({isProd: true});
        const link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', 'https://foo.bar/baz');
        document.head.appendChild(link);

        const div = document.createElement('div');
        div.setAttribute('type', '_ping_');
        div.setAttribute('width', 100);
        div.setAttribute('height', 200);
        div.getIntersectionChangeEntry = function () {
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
        div.getAmpDoc = function () {
          return Services.ampdoc(window.document);
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
          expect(deserializeMessage('amp-other')).to.be.null;
        });

        it('should return null if failed to parse the input', () => {
          expectAsyncConsoleError(/MESSAGING: Failed to parse message/i, 2);
          expect(deserializeMessage('amp-{"type","sentinel":"msgsentinel"}')).to
            .be.null;
          expect(
            deserializeMessage(
              'amp-{"type":"msgtype"|"sentinel":"msgsentinel"}'
            )
          ).to.be.null;
        });
      });
    });
});
