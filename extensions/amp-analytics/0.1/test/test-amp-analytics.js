import {expect} from 'chai';

import {LayoutPriority_Enum} from '#core/dom/layout';

import {Services} from '#service';
import {cidServiceForDocForTesting} from '#service/cid-impl';
import {installCryptoService} from '#service/crypto-impl';

import {macroTask} from '#testing/helpers';
import {
  ImagePixelVerifier,
  mockWindowInterface,
} from '#testing/helpers/service';

import {
  getService,
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service-helpers';
import {installUserNotificationManagerForTesting} from '../../../amp-user-notification/0.1/amp-user-notification';
import {AmpAnalytics} from '../amp-analytics';
import {AnalyticsConfig} from '../config';
import {ClickEventTracker, VisibilityTracker} from '../events';
import {instrumentationServiceForDocForTesting} from '../instrumentation';
import {LinkerManager} from '../linker-manager';
import {SessionManager} from '../session-manager';
import {Transport} from '../transport';

describes.realWin(
  'amp-analytics',
  {
    amp: {
      extensions: ['amp-analytics'],
    },
  },
  function (env) {
    let win, doc;
    let configWithCredentials;
    let uidService;
    let crypto;
    let ampdoc;
    let ins;
    let viewer;
    let jsonRequestConfigs = {};
    let requestVerifier;

    const jsonMockResponses = {
      '//invalidConfig': '{"transport": {"iframe": "fake.com"}}',
      '//config1': '{"vars": {"title": "remote"}}',
      'https://foo/My%20Test%20Title': '{"vars": {"title": "magic"}}',
      '//config-rv2': '{"requests": {"foo": "https://example.test/remote"}}',
      'https://rewriter.com': '{"vars": {"title": "rewritten"}}',
    };
    const trivialConfig = {
      'requests': {'foo': 'https://example.test/bar'},
      'triggers': {'pageview': {'on': 'visible', 'request': 'foo'}},
    };

    const oneScriptChildError =
      '[AmpAnalytics <unknown id>] The tag should ' +
      'contain only one <script> child.';
    const scriptTypeError =
      '[AmpAnalytics <unknown id>] ' +
      '<script> child must have type="application/json"';
    const configParseError =
      '[AmpAnalytics <unknown id>] Failed to ' +
      'parse <script> contents. Is it valid JSON?';
    const onAndRequestAttributesError =
      '[AmpAnalytics <unknown id>] "on" and ' +
      '"request" attributes are required for data to be collected.';
    const onAndRequestAttributesInaboxError =
      '[AmpAnalytics <unknown id>] ' +
      '"on" and "request"/"parentPostMessage" ' +
      'attributes are required for data to be collected.';
    const invalidThresholdForSamplingError =
      '[AmpAnalytics <unknown id>] Invalid threshold for sampling.';
    const clickTrackerNotSupportedError =
      '[AmpAnalytics <unknown id>] click ' +
      'is not supported for amp-analytics in scope';

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      configWithCredentials = false;
      doc.title = 'My Test Title';
      resetServiceForTesting(win, 'xhr');
      jsonRequestConfigs = {};
      registerServiceBuilder(win, 'xhr', function () {
        return {
          fetchJson: (url, init) => {
            jsonRequestConfigs[url] = init;
            if (configWithCredentials) {
              expect(init.credentials).to.equal('include');
            } else {
              expect(init.credentials).to.undefined;
            }
            return Promise.resolve({
              json() {
                return Promise.resolve(JSON.parse(jsonMockResponses[url]));
              },
            });
          },
        };
      });
      resetServiceForTesting(win, 'crypto');
      installCryptoService(win, 'crypto');
      crypto = getService(win, 'crypto');
      const link = doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', './test-canonical.html');
      doc.head.appendChild(link);
      cidServiceForDocForTesting(ampdoc);
      viewer = win.__AMP_SERVICES.viewer.obj;
      ins = instrumentationServiceForDocForTesting(ampdoc);
      installUserNotificationManagerForTesting(ampdoc);

      const wi = mockWindowInterface(env.sandbox);
      requestVerifier = new ImagePixelVerifier(wi);
      return Services.userNotificationManagerForDoc(doc.head).then(
        (manager) => {
          uidService = manager;
        }
      );
    });

    function getAnalyticsTag(config = {}, attrs) {
      config['transport'] = {
        xhrpost: false,
        beacon: false,
      };
      config = JSON.stringify(config);
      const el = doc.createElement('amp-analytics');
      const script = doc.createElement('script');
      script.textContent = config;
      script.setAttribute('type', 'application/json');
      el.appendChild(script);
      for (const k in attrs) {
        el.setAttribute(k, attrs[k]);
      }

      doc.body.appendChild(el);

      el.connectedCallback();
      const analytics = new AmpAnalytics(el);
      analytics.buildCallback();
      return analytics;
    }

    function waitForSendRequest(analytics, opt_max) {
      expect(analytics.element).to.not.have.display('none');
      return analytics.layoutCallback().then(() => {
        expect(analytics.element).to.have.display('none');
        if (requestVerifier.hasRequestSent()) {
          return;
        }
        return new Promise((resolve) => {
          const start = Date.now();
          const interval = setInterval(() => {
            const time = Date.now();
            if (
              requestVerifier.hasRequestSent() ||
              (opt_max && time - start > opt_max)
            ) {
              clearInterval(interval);
              resolve();
            }
          }, 4);
        });
      });
    }

    function waitForNoSendRequest(analytics) {
      return waitForSendRequest(analytics, 100).then(() => {
        expect(requestVerifier.hasRequestSent()).to.be.false;
      });
    }

    describe('send hit', () => {
      it('sends a basic hit', function () {
        const analytics = getAnalyticsTag(trivialConfig);
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('https://example.test/bar');
        });
      });

      it('does not send a hit when config is not in a script tag', function () {
        const config = JSON.stringify(trivialConfig);
        const el = doc.createElement('amp-analytics');
        el.textContent = config;
        const analytics = new AmpAnalytics(el);
        doc.body.appendChild(el);
        el.connectedCallback();
        analytics.buildCallback();
        // Initialization has not started.
        expect(analytics.iniPromise_).to.be.null;

        return waitForNoSendRequest(analytics);
      });

      it('does start initialization when requested', () => {
        const config = JSON.stringify(trivialConfig);
        const el = doc.createElement('amp-analytics');
        el.setAttribute('trigger', 'immediate');
        el.textContent = config;
        const whenFirstVisibleStub = env.sandbox
          .stub(ampdoc, 'whenFirstVisible')
          .callsFake(() => Promise.resolve());
        doc.body.appendChild(el);
        const analytics = new AmpAnalytics(el);
        el.getAmpDoc = () => ampdoc;
        analytics.buildCallback();
        const iniPromise = analytics.iniPromise_;
        expect(iniPromise).to.be.ok;
        // Viewer.whenFirstVisible is the first blocking call to initialize.
        expect(whenFirstVisibleStub).to.be.calledOnce;

        // Repeated call, returns pre-created promise.
        expect(analytics.ensureInitialized_()).to.equal(iniPromise);
        expect(whenFirstVisibleStub).to.be.calledOnce;
        return iniPromise.then(() => {
          expect(el).to.have.attribute('hidden');
        });
      });

      it('does not send a hit when multiple child tags exist', function () {
        expectAsyncConsoleError(oneScriptChildError);
        const analytics = getAnalyticsTag(trivialConfig);
        const script2 = document.createElement('script');
        script2.setAttribute('type', 'application/json');
        analytics.element.appendChild(script2);
        return waitForNoSendRequest(analytics);
      });

      it('does not send a hit when script tag does not have a type attribute', function () {
        expectAsyncConsoleError(scriptTypeError);
        const el = doc.createElement('amp-analytics');
        const script = doc.createElement('script');
        script.textContent = JSON.stringify(trivialConfig);
        el.appendChild(script);
        doc.body.appendChild(el);
        const analytics = new AmpAnalytics(el);
        el.connectedCallback();
        analytics.buildCallback();

        return waitForNoSendRequest(analytics);
      });

      it('does not send a hit when json config is not valid', function () {
        expectAsyncConsoleError(configParseError);
        const el = doc.createElement('amp-analytics');
        const script = doc.createElement('script');
        script.setAttribute('type', 'application/json');
        script.textContent = '{"a",}';
        el.appendChild(script);
        doc.body.appendChild(el);
        const analytics = new AmpAnalytics(el);
        el.connectedCallback();
        analytics.buildCallback();

        return waitForNoSendRequest(analytics);
      });

      it('does not send a hit when request is not provided', function () {
        expectAsyncConsoleError(onAndRequestAttributesError);
        const analytics = getAnalyticsTag({
          'requests': {'foo': 'https://example.test/bar'},
          'triggers': [{'on': 'visible'}],
        });

        return waitForNoSendRequest(analytics);
      });

      it('does not send a hit when request type is not defined', function () {
        const analytics = getAnalyticsTag({
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        });

        return waitForNoSendRequest(analytics);
      });

      it('expands nested requests', function () {
        const analytics = getAnalyticsTag({
          'requests': {
            'foo': 'https://example.test/bar&${foobar}&baz',
            'foobar': 'f1',
          },
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('https://example.test/bar&f1&baz');
        });
      });

      it('expand nested requests with vendor provided value', () => {
        const analytics = getAnalyticsTag({
          'requests': {
            'foo': 'https://example.test/bar&${clientId}&baz',
            'clientId': 'c1',
          },
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('https://example.test/bar&c1&baz');
        });
      });

      it('expands nested requests (3 levels)', function () {
        const analytics = getAnalyticsTag({
          'requests': {
            'foo': 'https://example.test/bar&${foobar}',
            'foobar': '${baz}',
            'baz': 'b1',
          },
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        });

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('https://example.test/bar&b1');
        });
      });

      it('should tolerate invalid triggers', function () {
        expectAsyncConsoleError(/No request strings defined/);
        const analytics = getAnalyticsTag({
          'request': {'foo': 'https://example.test'},
          'triggers': [],
        });
        return waitForNoSendRequest(analytics);
      });

      it('expands recursive requests', function () {
        const analytics = getAnalyticsTag({
          'requests': {'foo': '/bar&${foobar}&baz', 'foobar': '${foo}'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        });

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/bar&/bar&/bar&&baz&baz&baz');
        });
      });

      it('sends multiple requests per trigger', function () {
        expectAsyncConsoleError(/Request string not found/);
        const analytics = getAnalyticsTag({
          'requests': {
            'foo': 'https://example.test/bar&${foobar}',
            'foobar': '${baz}',
            'baz': 'b1',
          },
          'triggers': [{'on': 'visible', 'request': ['foo', 'foobar', 'foo2']}],
        });

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('https://example.test/bar&b1');
          requestVerifier.verifyRequest('b1');
        });
      });

      it('should not replace HTML_ATTR outside of amp-ad', () => {
        const analytics = getAnalyticsTag({
          'requests': {
            'htmlAttrRequest':
              'https://example.test/bar&ids=${htmlAttr(div,id)}',
          },
          'triggers': [{'on': 'visible', 'request': 'htmlAttrRequest'}],
        });

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/bar&ids=HTML_ATTR(div,id)'
          );
        });
      });

      it('fills cid', function () {
        const analytics = getAnalyticsTag({
          'requests': {
            'foo': 'https://example.test/cid=${clientId(analytics-abc)}',
          },
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        });

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequestMatch(
            /^https:\/\/example.test\/cid=[a-zA-Z\-]+/
          );
        });
      });

      it('fills internally provided trigger vars', async function* () {
        const analytics = getAnalyticsTag({
          'requests': {
            'timer':
              'https://e.com/start=${timerStart}&duration=${timerDuration}',
            'visible': 'https://e.com/totalVisibleTime=${totalVisibleTime}',
          },
          'triggers': {
            'timerTrigger': {
              'on': 'timer',
              'request': 'timer',
              'timerSpec': {'interval': 1},
            },
            'visibility': {'on': 'visible', 'request': 'visible'},
          },
        });
        await macroTask();
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequestMatch(
            /https:\/\/e.com\/start=[0-9]+&duration=[0-9]/
          );
          requestVerifier.verifyRequest('https://e.com/totalVisibleTime=0');
        });
      });

      it('should create and destroy analytics group', () => {
        const analytics = getAnalyticsTag({
          requests: {foo: 'https://example.test/bar'},
          triggers: [{on: 'click', selector: '${foo}', request: 'foo'}],
          vars: {foo: 'bar'},
        });
        return waitForNoSendRequest(analytics).then(() => {
          expect(analytics.analyticsGroup_).to.be.ok;
          const disposeStub = env.sandbox.stub(
            analytics.analyticsGroup_,
            'dispose'
          );
          analytics.detachedCallback();
          expect(analytics.analyticsGroup_).to.be.null;
          expect(disposeStub).to.be.calledOnce;
        });
      });

      it('expands urls in config request', () => {
        const analytics = getAnalyticsTag(
          {
            'requests': {'foo': 'https://example.test/${title}'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {
            'config': 'https://foo/TITLE',
          }
        );
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('https://example.test/magic');
        });
      });

      it('updates requestCount on each request', async function* () {
        const analytics = getAnalyticsTag({
          'host': 'example.test',
          'requests': {
            'pageview1': '/test1=${requestCount}',
            'pageview2': '/test2=${requestCount}',
          },
          'triggers': [
            {'on': 'visible', 'request': 'pageview1'},
            {'on': 'visible', 'request': 'pageview2'},
          ],
        });
        await macroTask();
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
          requestVerifier.verifyRequest('/test2=2');
        });
      });
    });

    describe('expand variables', () => {
      it('expands trigger vars', () => {
        const analytics = getAnalyticsTag({
          'requests': {
            'pageview': 'https://example.test/test1=${var1}&test2=${var2}',
          },
          'triggers': [
            {
              'on': 'visible',
              'request': 'pageview',
              'vars': {
                'var1': 'x',
                'var2': 'test2',
              },
            },
          ],
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/test1=x&test2=test2'
          );
        });
      });

      it('expands config vars', () => {
        const analytics = getAnalyticsTag({
          'vars': {
            'var1': 'x',
            'var2': 'test2',
          },
          'requests': {
            'pageview': 'https://example.test/test1=${var1}&test2=${var2}',
          },
          'triggers': [{'on': 'visible', 'request': 'pageview'}],
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/test1=x&test2=test2'
          );
        });
      });

      it('expands platform vars', () => {
        env.sandbox
          .stub(viewer, 'getReferrerUrl')
          .returns('http://fake.example/?foo=bar');
        const analytics = getAnalyticsTag({
          'requests': {
            'pageview':
              'https://example.test/title=${title}&ref=${documentReferrer}',
          },
          'triggers': [{'on': 'visible', 'request': 'pageview'}],
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequestMatch(
            /https:\/\/example.test\/title=My%20Test%20Title&ref=http%3A%2F%2Ffake.example%2F%3Ffoo%3Dbar/
          );
        });
      });

      it('expands url-replacements vars', function () {
        const analytics = getAnalyticsTag({
          'requests': {'foo': 'https://example.test/TITLE'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/My%20Test%20Title'
          );
        });
      });

      it('expands trigger vars with higher precedencethan config vars', () => {
        const analytics = getAnalyticsTag({
          'vars': {
            'var1': 'config1',
            'var2': 'config2',
          },
          'requests': {
            'pageview': 'https://example.test/test1=${var1}&test2=${var2}',
          },
          'triggers': [
            {
              'on': 'visible',
              'request': 'pageview',
              'vars': {
                'var1': 'trigger1',
              },
            },
          ],
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/test1=trigger1&test2=config2'
          );
        });
      });

      it(
        'expands element level vars with higher precedence' +
          'than trigger vars',
        () => {
          const analytics = getAnalyticsTag();
          const analyticsGroup = ins.createAnalyticsGroup(analytics.element);

          const el1 = doc.createElement('div');
          el1.className = 'x';
          el1.dataset.varsTest = 'foo';
          analyticsGroup.root_.getRootElement().appendChild(el1);

          const handlerSpy = env.sandbox.spy();
          analyticsGroup.addTrigger(
            {'on': 'click', 'selector': '.x', 'vars': {'test': 'bar'}},
            handlerSpy
          );
          analyticsGroup.root_
            .getTrackerOptional('click')
            .clickObservable_.fire({target: el1});

          expect(handlerSpy).to.be.calledOnce;
          const event = handlerSpy.args[0][0];
          expect(event.vars.test).to.equal('foo');
        }
      );

      it('expands config vars with higher precedencethan platform vars', () => {
        const analytics = getAnalyticsTag({
          'vars': {'random': 428},
          'requests': {
            'pageview': 'https://example.test/test1=${title}&test2=${random}',
          },
          'triggers': [{'on': 'visible', 'request': 'pageview'}],
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/test1=My%20Test%20Title&test2=428'
          );
        });
      });

      it('expands and encodes requests, config vars,and trigger vars', () => {
        const analytics = getAnalyticsTag({
          'vars': {
            'c1': 'config 1',
            'c2': 'config&2',
          },
          'requests': {
            'base': 'https://example.test/test?c1=${c1}&t1=${t1}',
            'pageview': '${base}&c2=${c2}&t2=${t2}',
          },
          'triggers': [
            {
              'on': 'visible',
              'request': 'pageview',
              'vars': {
                't1': 'trigger=1',
                't2': 'trigger?2',
              },
            },
          ],
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/test?c1=config%201&t1=trigger%3D1&c2=config%262&t2=trigger%3F2'
          );
        });
      });

      it('encodes array vars', () => {
        const analytics = getAnalyticsTag({
          'vars': {
            'c1': ['Config, The Barbarian', 'config 1'],
            'c2': 'config&2',
          },
          'requests': {
            'base': 'https://example.test/test?',
            'pageview': '${base}c1=${c1}&c2=${c2}',
          },
          'triggers': [
            {
              'on': 'visible',
              'request': 'pageview',
            },
          ],
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/test?c1=Config%2C%20The%20Barbarian,config%201&c2=config%262'
          );
        });
      });

      it('expands url-replacements vars', () => {
        env.sandbox
          .stub(viewer, 'getReferrerUrl')
          .returns('http://fake.example/?foo=bar');
        const analytics = getAnalyticsTag({
          'requests': {
            'pageview':
              'https://example.test/test1=${var1}&test2=${var2}&title=TITLE',
          },
          'triggers': [
            {
              'on': 'visible',
              'request': 'pageview',
              'vars': {
                'var1': 'x',
                'var2': 'DOCUMENT_REFERRER',
              },
            },
          ],
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequestMatch(
            /https:\/\/example.test\/test1=x&test2=http%3A%2F%2Ffake.example%2F%3Ffoo%3Dbar&title=My%20Test%20Title/
          );
        });
      });

      it('expands complex vars', () => {
        const analytics = getAnalyticsTag({
          'requests': {
            'pageview': 'https://example.test/test1=${qp_foo}',
          },
          'triggers': [
            {
              'on': 'visible',
              'request': 'pageview',
              'vars': {
                'qp_foo': '${queryParam(foo)}',
              },
            },
          ],
        });
        const urlReplacements = Services.urlReplacementsForDoc(
          analytics.element
        );
        env.sandbox
          .stub(urlReplacements.getVariableSource(), 'get')
          .callsFake(function (name) {
            return {
              sync: (param) => {
                return '_' + name.toLowerCase() + '_' + param + '_';
              },
            };
          });

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/test1=_query_param_foo_'
          );
        });
      });
    });

    describe('expand selector', () => {
      it('expands selector with config variable', () => {
        const tracker = ins.root_.getTracker('click', ClickEventTracker);
        const addStub = env.sandbox.stub(tracker, 'add');
        const analytics = getAnalyticsTag({
          requests: {foo: 'https://example.test/bar'},
          triggers: [{on: 'click', selector: '${foo}', request: 'foo'}],
          vars: {foo: 'bar'},
        });
        return waitForNoSendRequest(analytics).then(() => {
          expect(addStub).to.be.calledOnce;
          const config = addStub.args[0][2];
          expect(config['selector']).to.equal('bar');
        });
      });

      function selectorExpansionTest(selector) {
        it('expand selector value: ' + selector, () => {
          const tracker = ins.root_.getTracker('click', ClickEventTracker);
          const addStub = env.sandbox.stub(tracker, 'add');
          const analytics = getAnalyticsTag({
            requests: {foo: 'https://example.test/bar'},
            triggers: [
              {on: 'click', selector: '${foo}, ${bar}', request: 'foo'},
            ],
            vars: {foo: selector, bar: '123'},
          });
          return waitForNoSendRequest(analytics).then(() => {
            expect(addStub).to.be.calledOnce;
            const config = addStub.args[0][2];
            expect(config['selector']).to.equal(selector + ', 123');
          });
        });
      }

      [
        '.clazz',
        'a, div',
        'a .foo',
        'a #foo',
        'a > div',
        'div + p',
        'div ~ ul',
        '[target=_blank]',
        '[title~=flower]',
        '[lang|=en]',
        'a[href^="https"]',
        'a[href$=".pdf"]',
        'a[href="w3schools"]',
        'a:active',
        'p::after',
        'p:first-child',
        'p:lang(it)',
        ':not(p)',
        'p:nth-child(2)',
      ].map(selectorExpansionTest);

      it('expands selector with platform variable', () => {
        const tracker = ins.root_.getTracker('click', ClickEventTracker);
        const addStub = env.sandbox.stub(tracker, 'add');
        const analytics = getAnalyticsTag({
          requests: {foo: 'https://example.test/bar'},
          triggers: [{on: 'click', selector: '${title}', request: 'foo'}],
        });
        return waitForNoSendRequest(analytics).then(() => {
          expect(addStub).to.be.calledOnce;
          const config = addStub.args[0][2];
          expect(config['selector']).to.equal('My Test Title');
        });
      });
    });

    describe('optout by function', () => {
      beforeEach(() => {
        env.sandbox.stub(AnalyticsConfig.prototype, 'loadConfig').returns(
          Promise.resolve({
            'requests': {
              'foo': {
                baseUrl: 'https://example.test/bar',
              },
            },
            'triggers': {
              'pageview': {'on': 'visible', 'request': 'foo'},
            },
            'transport': {
              'image': true,
              'xhrpost': false,
              'beacon': false,
            },
            'vars': {},
            'optout': 'foo.bar',
          })
        );
      });

      it('works for vendor config when optout returns false', function () {
        win['foo'] = {'bar': () => false};
        const analytics = getAnalyticsTag(trivialConfig);
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('https://example.test/bar');
        });
      });

      it('works for vendor config when optout returns true', function () {
        win['foo'] = {
          'bar': function () {
            return true;
          },
        };
        const analytics = getAnalyticsTag(trivialConfig, {
          'type': 'testVendor',
        });
        return waitForNoSendRequest(analytics);
      });

      it('works for vendor config when optout is not defined', function () {
        const analytics = getAnalyticsTag(trivialConfig, {
          'type': 'testVendor',
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('https://example.test/bar');
        });
      });
    });

    describe('optout by id', () => {
      beforeEach(() => {
        env.sandbox.stub(AnalyticsConfig.prototype, 'loadConfig').returns(
          Promise.resolve({
            'requests': {
              'foo': {
                baseUrl: 'https://example.test/bar',
              },
            },
            'triggers': {
              'pageview': {'on': 'visible', 'request': 'foo'},
            },
            'transport': {
              'image': true,
              'xhrpost': false,
              'beacon': false,
            },
            'vars': {},
            'optoutElementId': 'elementId',
          })
        );
      });

      it('doesnt send hit when config optout id is found', function () {
        const element = doc.createElement('script');
        element.type = 'text/javascript';
        element.id = 'elementId';
        doc.documentElement.insertBefore(
          element,
          doc.documentElement.firstChild
        );

        const analytics = getAnalyticsTag(trivialConfig, {
          'type': 'testVendor',
        });
        return waitForNoSendRequest(analytics);
      });

      it('sends hit when config optout id is not found', function () {
        const analytics = getAnalyticsTag(trivialConfig, {
          'type': 'testVendor',
        });
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('https://example.test/bar');
        });
      });
    });

    describe('extraUrlParams', () => {
      let config;
      beforeEach(() => {
        config = {
          vars: {host: 'example.test', path: 'helloworld'},
          extraUrlParams: {
            's.evar0': '0',
            's.evar1': '${path}',
            'foofoo': 'baz',
          },
          triggers: {trig: {'on': 'visible', 'request': 'foo'}},
        };
        config['requests'] = {'foo': 'https://${host}/${path}?a=b'};
      });

      it('are sent', () => {
        const analytics = getAnalyticsTag(config);
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/helloworld?a=b&s.evar0=0&s.evar1=helloworld&foofoo=baz'
          );
        });
      });

      it('are renamed by extraUrlParamsReplaceMap', () => {
        config.extraUrlParamsReplaceMap = {'s.evar': 'v'};
        const analytics = getAnalyticsTag(config);
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/helloworld?a=b&foofoo=baz&v0=0&v1=helloworld'
          );
        });
      });

      it('are supported at trigger level', () => {
        config.triggers.trig.extraUrlParams = {c: 'd', 's.evar': 'e'};
        config.extraUrlParamsReplaceMap = {'s.evar': 'v'};
        const analytics = getAnalyticsTag(config);
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/helloworld?a=b&foofoo=baz&v0=0&v1=helloworld&c=d&v=e'
          );
        });
      });

      it('are supported as a var in URL', () => {
        config['requests'].foo =
          'https://${host}/${path}?${extraUrlParams}&a=b';
        const analytics = getAnalyticsTag(config);
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/helloworld?s.evar0=0&s.evar1=helloworld&foofoo=baz&a=b'
          );
        });
      });

      it('work when the value is an array', () => {
        config.extraUrlParams = {'foo': ['0']};
        const analytics = getAnalyticsTag(config);
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/helloworld?a=b&foo=0'
          );
        });
      });
    });

    describe('sampling', () => {
      function getConfig(sampleRate) {
        return {
          'requests': {
            'pageview1': '/test1=${requestCount}',
          },
          'triggers': {
            'sampled': {
              'on': 'visible',
              'request': 'pageview1',
              'sampleSpec': {
                'sampleOn': '${requestCount}',
                'threshold': sampleRate,
              },
            },
          },
        };
      }

      it('allows a request through', () => {
        const analytics = getAnalyticsTag(getConfig(1));

        env.sandbox.stub(crypto, 'uniform').returns(Promise.resolve(0.005));
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });

      it('allows a request through based on url-replacements', () => {
        const config = getConfig(1);
        config.triggers.sampled.sampleSpec.sampleOn = '${pageViewId}';
        const analytics = getAnalyticsTag(config);

        const urlReplacements = Services.urlReplacementsForDoc(
          analytics.element
        );
        env.sandbox.stub(urlReplacements.getVariableSource(), 'get').returns({
          async: 0,
          sync: 0,
        });
        env.sandbox
          .stub(crypto, 'uniform')
          .withArgs('0')
          .returns(Promise.resolve(0.005));
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });

      it('does not allow a request through', () => {
        const analytics = getAnalyticsTag(getConfig(1));

        env.sandbox.stub(crypto, 'uniform').returns(Promise.resolve(0.1));
        return waitForNoSendRequest(analytics);
      });

      it('works when sampleSpec is 100%', () => {
        const analytics = getAnalyticsTag(getConfig(100));

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });

      it('works when sampleSpec is 0%', () => {
        const analytics = getAnalyticsTag(getConfig(0));

        return waitForNoSendRequest(analytics);
      });

      it('works when sampleSpec is incomplete', () => {
        expectAsyncConsoleError(invalidThresholdForSamplingError);
        const incompleteConfig = {
          'requests': {
            'pageview1': '/test1=${requestCount}',
          },
          'triggers': [
            {
              'on': 'visible',
              'request': 'pageview1',
              'sampleSpec': {
                'sampleOn': '${requestCount}',
              },
            },
          ],
        };
        const analytics = getAnalyticsTag(incompleteConfig);

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });

      it('works for invalid threadhold (Infinity)', () => {
        expectAsyncConsoleError(invalidThresholdForSamplingError);
        const analytics = getAnalyticsTag(getConfig(Infinity));

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });

      it('works for invalid threadhold (NaN)', () => {
        expectAsyncConsoleError(invalidThresholdForSamplingError);
        const analytics = getAnalyticsTag(getConfig(NaN));

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });

      it('works for invalid threadhold (-1)', () => {
        expectAsyncConsoleError(invalidThresholdForSamplingError);
        const analytics = getAnalyticsTag(getConfig(-1));

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });
    });

    describe('enabled', () => {
      function getConfig() {
        return {
          'requests': {
            'pageview1': '/test1=${requestCount}',
          },
          'triggers': {
            'conditional': {
              'on': 'visible',
              'request': 'pageview1',
              'vars': {},
            },
          },
          'vars': {},
        };
      }

      it('allows a request through for undefined "enabled" property', () => {
        const analytics = getAnalyticsTag(getConfig());

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });

      it('allows a request based on a variable', () => {
        const config = getConfig();
        config.triggers.conditional.enabled = '${foo}';
        config.triggers.conditional.vars.foo = 'bar';
        const analytics = getAnalyticsTag(config);

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });

      it('allows a request based on url-replacements', () => {
        const config = getConfig();
        config.triggers.conditional.enabled = '${pageViewId}';
        const analytics = getAnalyticsTag(config);

        const urlReplacements = Services.urlReplacementsForDoc(
          analytics.element
        );
        env.sandbox
          .stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: 1});
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });

      it('does not allow a request through', () => {
        const config = getConfig();
        config.triggers.conditional.enabled = '';
        const analytics = getAnalyticsTag(config);

        return waitForNoSendRequest(analytics);
      });

      it('does not allow a request through with false', () => {
        const config = getConfig();
        config.triggers.conditional.enabled = false;
        const analytics = getAnalyticsTag(config);

        return waitForNoSendRequest(analytics);
      });

      it('does not allow a request through if a variable is missing', () => {
        const config = getConfig();
        config.triggers.conditional.enabled = '${undefinedParam}';
        const analytics = getAnalyticsTag(config);

        return waitForNoSendRequest(analytics);
      });

      it('does not allow a request through if a request param is missing', () => {
        const config = getConfig();
        config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
        const analytics = getAnalyticsTag(config);

        const urlReplacements = Services.urlReplacementsForDoc(
          analytics.element
        );
        env.sandbox
          .stub(urlReplacements.getVariableSource(), 'get')
          .returns(null);

        return waitForNoSendRequest(analytics);
      });

      it(
        'does not allow a request through ' +
          'if a request param is falsey (0)',
        () => {
          const config = getConfig();
          config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
          const analytics = getAnalyticsTag(config);

          const urlReplacements = Services.urlReplacementsForDoc(
            analytics.element
          );
          env.sandbox
            .stub(urlReplacements.getVariableSource(), 'get')
            .returns({sync: 0});

          return waitForNoSendRequest(analytics);
        }
      );

      it(
        'does not allow a request through ' +
          'if a request param is falsey (false)',
        () => {
          const config = getConfig();
          config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
          const analytics = getAnalyticsTag(config);

          const urlReplacements = Services.urlReplacementsForDoc(
            analytics.element
          );
          env.sandbox
            .stub(urlReplacements.getVariableSource(), 'get')
            .returns({sync: false});

          return waitForNoSendRequest(analytics);
        }
      );

      it(
        'does not allow a request through ' +
          'if a request param is falsey (null)',
        () => {
          const config = getConfig();
          config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
          const analytics = getAnalyticsTag(config);

          const urlReplacements = Services.urlReplacementsForDoc(
            analytics.element
          );
          env.sandbox
            .stub(urlReplacements.getVariableSource(), 'get')
            .returns({sync: null});

          return waitForNoSendRequest(analytics);
        }
      );

      it(
        'does not allow a request through ' +
          'if a request param is falsey (NaN)',
        () => {
          const config = getConfig();
          config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
          const analytics = getAnalyticsTag(config);

          const urlReplacements = Services.urlReplacementsForDoc(
            analytics.element
          );
          env.sandbox
            .stub(urlReplacements.getVariableSource(), 'get')
            .returns({sync: NaN});

          return waitForNoSendRequest(analytics);
        }
      );

      it(
        'does not allow a request through ' +
          'if a request param is falsey (undefined)',
        () => {
          const config = getConfig();
          config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
          const analytics = getAnalyticsTag(config);

          const urlReplacements = Services.urlReplacementsForDoc(
            analytics.element
          );
          env.sandbox
            .stub(urlReplacements.getVariableSource(), 'get')
            .returns({sync: undefined});

          return waitForNoSendRequest(analytics);
        }
      );

      it('allows a request based on a variable when enabled on tag level', () => {
        const config = getConfig();
        config.enabled = '${foo}';
        config.vars.foo = 'bar';
        const analytics = getAnalyticsTag(config);

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });

      it(
        'allows a request based on url-replacements ' +
          'when enabled on tag level',
        () => {
          const config = getConfig();
          config.enabled = '${pageViewId}';
          const analytics = getAnalyticsTag(config);

          const urlReplacements = Services.urlReplacementsForDoc(
            analytics.element
          );
          env.sandbox
            .stub(urlReplacements.getVariableSource(), 'get')
            .returns({sync: 1});
          return waitForSendRequest(analytics).then(() => {
            requestVerifier.verifyRequest('/test1=1');
          });
        }
      );

      it('does not allow a request through when enabled on tag level', () => {
        const config = getConfig();
        config.enabled = '';
        const analytics = getAnalyticsTag(config);

        return waitForNoSendRequest(analytics);
      });

      it(
        'does not allow a request through if a variable is missing ' +
          'when enabled on tag level',
        () => {
          const config = getConfig();
          config.enabled = '${undefinedParam}';
          const analytics = getAnalyticsTag(config);

          return waitForNoSendRequest(analytics);
        }
      );

      it(
        'does not allow a request through if a request param is missing ' +
          'when enabled on tag level',
        () => {
          const config = getConfig();
          config.enabled = '${queryParam(undefinedParam)}';
          const analytics = getAnalyticsTag(config);

          const urlReplacements = Services.urlReplacementsForDoc(
            analytics.element
          );
          env.sandbox
            .stub(urlReplacements.getVariableSource(), 'get')
            .returns(null);

          return waitForNoSendRequest(analytics);
        }
      );

      it(
        'does not allow a request through if a request param is missing ' +
          'when enabled on tag level but enabled on trigger level',
        () => {
          const config = getConfig();
          config.enabled = '${queryParam(undefinedParam)}';
          config.triggers.conditional.enabled = '${foo}';
          config.triggers.conditional.vars.foo = 'bar';

          const analytics = getAnalyticsTag(config);

          const urlReplacements = Services.urlReplacementsForDoc(
            analytics.element
          );
          env.sandbox
            .stub(urlReplacements.getVariableSource(), 'get')
            .returns(null);

          return waitForNoSendRequest(analytics);
        }
      );

      it(
        'does not allow a request through if enabled on tag level ' +
          'but variable is missing on trigger level',
        () => {
          const config = getConfig();
          config.enabled = '${pageViewId}';
          config.triggers.conditional.enabled = '${foo}';
          const analytics = getAnalyticsTag(config);

          const urlReplacements = Services.urlReplacementsForDoc(
            analytics.element
          );
          env.sandbox
            .stub(urlReplacements.getVariableSource(), 'get')
            .returns('page');

          return waitForNoSendRequest(analytics);
        }
      );
    });

    describe('data-consent-notification-id', () => {
      it('should resume fetch when consent is given', () => {
        const analytics = getAnalyticsTag(
          {
            'requests': {'foo': 'https://example.test/local'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {
            'data-consent-notification-id': 'amp-user-notification1',
          }
        );

        env.sandbox.stub(uidService, 'get').callsFake((id) => {
          expect(id).to.equal('amp-user-notification1');
          return Promise.resolve();
        });

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('https://example.test/local');
        });
      });

      it('should not fetch when consent is not given', () => {
        const analytics = getAnalyticsTag(
          {
            'requests': {'foo': 'https://example.test/local'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {
            'data-consent-notification-id': 'amp-user-notification1',
          }
        );

        env.sandbox.stub(uidService, 'get').callsFake((id) => {
          expect(id).to.equal('amp-user-notification1');
          return Promise.reject();
        });
        return analytics.layoutCallback().then(
          () => {
            throw new Error('Must never be here');
          },
          () => {
            expect(requestVerifier.hasRequestSent()).to.be.false;
          }
        );
      });

      it(
        'should not throw in resumeCallback/unlayoutCallback ' +
          'if consent rejected',
        () => {
          const analytics = getAnalyticsTag(
            {
              'requests': {'foo': 'https://example.test/local'},
              'triggers': [{'on': 'visible', 'request': 'foo'}],
            },
            {
              'data-consent-notification-id': 'amp-user-notification1',
            }
          );

          env.sandbox.stub(uidService, 'get').callsFake((id) => {
            expect(id).to.equal('amp-user-notification1');
            return Promise.reject();
          });

          env.sandbox.stub(ampdoc, 'isVisible').returns(false);
          analytics.layoutCallback();
          analytics.resumeCallback();
          analytics.unlayoutCallback();
        }
      );
    });

    describe('Sandbox AMP Analytics Element', () => {
      beforeEach(() => {
        // Unfortunately need to fake sandbox analytics element's parent
        // to an AMP element
        // Set the doc width/height to 1 to trigger visible event.
        doc.body.classList.add('i-amphtml-element');
        doc.body.style.minWidth = '1px';
        doc.body.style.minHeight = '1px';
      });

      afterEach(() => {
        doc.body.classList.remove('i-amphtml-element');
      });

      it('should not add listener when eventType is not allowlist', function () {
        expectAsyncConsoleError(clickTrackerNotSupportedError);
        // Right now we only allowlist VISIBLE & HIDDEN
        const tracker = ins.root_.getTracker('click', ClickEventTracker);
        const addStub = env.sandbox.stub(tracker, 'add');
        const analytics = getAnalyticsTag(
          {
            requests: {foo: 'https://example.test/bar'},
            triggers: [{on: 'click', request: 'foo'}],
          },
          {
            'sandbox': 'true',
          }
        );

        return waitForNoSendRequest(analytics).then(() => {
          expect(addStub).to.not.be.called;
        });
      });

      it('replace selector and selectionMethod when in scope', () => {
        const tracker = ins.root_.getTracker('visible', VisibilityTracker);
        const addStub = env.sandbox.stub(tracker, 'add');
        const analytics = getAnalyticsTag(
          {
            requests: {foo: 'https://example.test/bar'},
            triggers: [{on: 'visible', selector: 'amp-iframe', request: 'foo'}],
          },
          {
            'sandbox': 'true',
          }
        );
        return waitForNoSendRequest(analytics).then(() => {
          expect(addStub).to.be.calledOnce;
          const config = addStub.args[0][2];
          expect(config['selector']).to.equal(
            analytics.element.parentElement.tagName
          );
          expect(config['selectionMethod']).to.equal('closest');
        });
      });

      it('expand vendor vars but not replace non allowlist variables', () => {
        const analytics = getAnalyticsTag(
          {
            'requests': {
              'pageview':
                'https://example.test/test1=${var1}&CLIENT_ID(analytics-abc)=${var2}',
            },
            'triggers': [
              {
                'on': 'visible',
                'request': 'pageview',
                'vars': {
                  'var1': 'CLIENT_ID(analytics-abc)',
                  'var2': 'test2',
                },
              },
            ],
          },
          {
            'sandbox': 'true',
          }
        );
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/test1=CLIENT_ID(analytics-abc)&' +
              'CLIENT_ID(analytics-abc)=test2'
          );
        });
      });

      it('should not replace non allowlist variable', () => {
        const analytics = getAnalyticsTag(
          {
            'requests': {
              'foo': 'https://example.test/cid=${clientId(analytics-abc)}',
            },
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {
            'sandbox': 'true',
          }
        );

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/cid=CLIENT_ID(analytics-abc)'
          );
        });
      });

      it('should replace allowlist variable', () => {
        const analytics = getAnalyticsTag(
          {
            'requests': {'foo': 'https://example.test/random=${random}'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {
            'sandbox': 'true',
          }
        );

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequestMatch(
            /^https:\/\/example.test\/random=0.[0-9]/
          );
        });
      });

      it('should replace for multi allowlisted(or not) variables', () => {
        const analytics = getAnalyticsTag(
          {
            'requests': {
              'foo':
                'https://example.test/cid=${clientId(analytics-abc)}random=RANDOM',
            },
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {
            'sandbox': 'true',
          }
        );

        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequestMatch(
            /https:\/\/example\.test\/cid=CLIENT_ID\(analytics-abc\)random=0\.[0-9]+/
          );
        });
      });

      it('expands url-replacements vars', () => {
        const analytics = getAnalyticsTag(
          {
            'requests': {
              'pageview':
                'https://example.test/VIEWER&AMP_VERSION&' +
                'test1=${var1}&test2=${var2}&test3=${var3}&url=AMPDOC_URL',
            },
            'triggers': [
              {
                'on': 'visible',
                'request': 'pageview',
                'vars': {
                  'var1': 'x',
                  'var2': 'AMPDOC_URL',
                  'var3': 'CLIENT_ID',
                },
              },
            ],
          },
          {
            'sandbox': 'true',
          }
        );
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest(
            'https://example.test/VIEWER&%24internalRuntimeVersion%24' +
              '&test1=x&test2=about%3Asrcdoc&test3=CLIENT_ID' +
              '&url=about%3Asrcdoc'
          );
        });
      });

      it('allow a request sample through on non allowlist url variables', () => {
        const config = {
          'requests': {
            'pageview1': '/test1=${requestCount}',
          },
          'triggers': {
            'sampled': {
              'on': 'visible',
              'request': 'pageview1',
              'sampleSpec': {
                'sampleOn': '${requestCount}',
                'threshold': 1,
              },
            },
          },
        };
        config.triggers.sampled.sampleSpec.sampleOn = '${clientId}';
        const analytics = getAnalyticsTag(config, {
          'sandbox': 'true',
        });

        const urlReplacements = Services.urlReplacementsForDoc(
          analytics.element
        );
        env.sandbox.stub(urlReplacements.getVariableSource(), 'get').returns({
          async: 0,
          sync: 0,
        });
        env.sandbox
          .stub(crypto, 'uniform')
          .withArgs('0')
          .returns(Promise.resolve(0.005))
          .withArgs('CLIENT_ID')
          .returns(Promise.resolve(0.5));
        return waitForSendRequest(analytics).then(() => {
          requestVerifier.verifyRequest('/test1=1');
        });
      });
    });

    describe('Linkers', () => {
      let analytics;

      beforeEach(() => {
        const el = doc.createElement('amp-analytics');
        el.setAttribute('type', 'foo');
        doc.body.appendChild(el);
        analytics = new AmpAnalytics(el);
        analytics.getAmpDoc = () => ampdoc;
      });

      it('Initializes a new Linker.', async function* () {
        env.sandbox.stub(AnalyticsConfig.prototype, 'loadConfig').resolves({});

        const linkerStub = env.sandbox.stub(LinkerManager.prototype, 'init');

        analytics.buildCallback();
        await macroTask();
        return analytics.layoutCallback().then(() => {
          expect(linkerStub.calledOnce).to.be.true;
        });
      });
    });

    describe('session manager', () => {
      describe('initalize', () => {
        it('should initialize manager with flag', async () => {
          const analytics = getAnalyticsTag(
            {
              'requests': {'foo': 'https://example.test/bar'},
              'triggers': {
                'pageview': {
                  'on': 'visible',
                  'request': 'foo',
                  'session': {'persistEvent': true},
                },
              },
            },
            {
              'type': 'testVendor',
            }
          );

          await analytics.layoutCallback();
          expect(analytics.sessionManager_).to.not.be.null;
        });

        it('should not initialize without flag', async () => {
          const analytics = getAnalyticsTag(
            {
              'requests': {'foo': 'https://example.test/bar'},
              'triggers': {
                'pageview': {
                  'on': 'visible',
                  'request': 'foo',
                },
              },
            },
            {
              'type': 'testVendor',
            }
          );

          await analytics.layoutCallback();
          expect(analytics.sessionManager_).to.be.null;
        });

        it('should not initialize manager without type', async () => {
          const analytics = getAnalyticsTag({
            'requests': {'foo': 'https://example.test/bar'},
            'triggers': {
              'pageview': {
                'on': 'visible',
                'request': 'foo',
                'session': {'persistEvent': true},
              },
            },
          });

          await analytics.layoutCallback();
          expect(analytics.sessionManager_).to.be.null;
        });
      });

      describe('trigger event with persist session value', () => {
        let vendorType;

        beforeEach(() => {
          vendorType = 'testVendor';
        });

        describe('initialize session manager', () => {
          it('should add flag for when `persistEvent` opted in', async () => {
            const analytics = getAnalyticsTag(
              {
                'requests': {'foo': 'https://example.test/bar'},
                'triggers': {
                  'pageview': {
                    'on': 'visible',
                    'request': 'foo',
                    'session': {'persistEvent': true},
                  },
                },
              },
              {
                'type': vendorType,
              }
            );

            await waitForSendRequest(analytics);
            expect(analytics.sessionManager_).to.not.be.null;
          });

          it('should handle multiple opt ins', async () => {
            const analytics = getAnalyticsTag(
              {
                'requests': {'foo': 'https://example.test/bar'},
                'triggers': {
                  'pageview1': {
                    'on': 'visible',
                    'request': 'foo',
                    'session': {'persistEvent': true},
                  },
                  'pageview2': {
                    'on': 'click',
                    'request': 'foo',
                    'selector': '.className1',
                    'session': {'persistEvent': true},
                  },
                },
              },
              {
                'type': vendorType,
              }
            );
            await waitForSendRequest(analytics);
            expect(analytics.sessionManager_).to.not.be.null;
          });

          it('should handle no triggers', async () => {
            const analytics = getAnalyticsTag(
              {
                'requests': {'foo': 'https://example.test/bar'},
              },
              {
                'type': vendorType,
              }
            );
            await waitForNoSendRequest(analytics);
            expect(analytics.sessionManager_).to.be.null;
          });
        });

        it('should update session manager for eventTimestamp when event is triggered', async () => {
          const analytics = getAnalyticsTag(
            {
              'requests': {'foo': 'https://example.test/bar'},
              'triggers': {
                'pageview': {
                  'on': 'visible',
                  'request': 'foo',
                  'session': {'persistEvent': true},
                },
              },
            },
            {
              'type': vendorType,
            }
          );

          const sessionSpy = env.sandbox.spy(
            SessionManager.prototype,
            'updateEvent'
          );

          await waitForSendRequest(analytics);
          expect(sessionSpy).to.be.calledOnce;
          expect(sessionSpy).to.be.calledWith(vendorType);
        });

        it('should update manager for multiple events', async () => {
          const analytics = getAnalyticsTag(
            {
              'requests': {'foo': 'https://example.test/bar'},
              'triggers': {
                'pageview': {
                  'on': 'visible',
                  'request': 'foo',
                  'session': {'persistEvent': true},
                },
                'pageview2': {
                  'on': 'visible',
                  'request': 'foo',
                  'session': {'persistEvent': true},
                },
              },
            },
            {
              'type': vendorType,
            }
          );

          const sessionSpy = env.sandbox.spy(
            SessionManager.prototype,
            'updateEvent'
          );

          await waitForSendRequest(analytics);
          expect(sessionSpy).to.be.calledTwice;
          expect(sessionSpy.firstCall).to.be.calledWith(vendorType);
          expect(sessionSpy.secondCall).to.be.calledWith(vendorType);
        });

        it('should not update manager without `persistEvent`', async () => {
          const analytics = getAnalyticsTag(
            {
              'requests': {'foo': 'https://example.test/bar'},
              'triggers': {
                'pageview': {
                  'on': 'visible',
                  'request': 'foo',
                },
              },
            },
            {
              'type': vendorType,
            }
          );

          const sessionSpy = env.sandbox.spy(
            SessionManager.prototype,
            'updateEvent'
          );

          await waitForSendRequest(analytics);
          expect(sessionSpy).to.not.be.called;
        });

        it('should not update manager with opt in at top level config', async () => {
          const analytics = getAnalyticsTag(
            {
              'requests': {'foo': 'https://example.test/bar'},
              'session': {'persistEvent': true},
              'triggers': {
                'pageview': {
                  'on': 'visible',
                  'request': 'foo',
                },
              },
            },
            {
              'type': vendorType,
            }
          );

          const sessionSpy = env.sandbox.spy(
            SessionManager.prototype,
            'updateEvent'
          );

          await waitForSendRequest(analytics);
          expect(sessionSpy).to.not.be.called;
        });
      });
    });

    describe('iframe transport', () => {
      const sampleconfig = {
        'triggers': {
          'sample_visibility_trigger': {
            'on': 'visible',
            'request': 'sample_visibility_request',
          },
        },
        'requests': {
          'sample_visibility_request': {
            baseUrl: '//fake-request',
          },
        },
      };

      it('initialize iframe transport', () => {
        const el = doc.createElement('amp-analytics');
        el.setAttribute('type', 'foo');
        doc.body.appendChild(el);
        const analytics = new AmpAnalytics(el);

        env.sandbox
          .stub(AnalyticsConfig.prototype, 'loadConfig')
          .returns(Promise.resolve(sampleconfig));

        analytics.buildCallback();
        analytics.preconnectCallback();
        const initSpy = env.sandbox.spy(
          Transport.prototype,
          'maybeInitIframeTransport'
        );
        return analytics.layoutCallback().then(() => {
          expect(initSpy).to.be.called;
        });
      });
    });

    describe('parentPostMessage', () => {
      let postMessageSpy;

      beforeEach(() => {
        doc.body.style.minWidth = '1px';
        doc.body.style.minHeight = '1px';
      });

      function waitForParentPostMessage(opt_max) {
        if (postMessageSpy.callCount) {
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          const start = Date.now();
          const interval = setInterval(() => {
            const time = Date.now();
            if (
              postMessageSpy.callCount ||
              (opt_max && time - start > opt_max)
            ) {
              clearInterval(interval);
              resolve();
            }
          }, 4);
        });
      }

      function waitForNoParentPostMessage() {
        return waitForParentPostMessage(100).then(() => {
          expect(postMessageSpy).to.not.be.called;
        });
      }

      it('does send a hit when parentPostMessage is provided inabox', function () {
        env.win.__AMP_MODE.runtime = 'inabox';
        const analytics = getAnalyticsTag({
          'requests': {'foo': 'https://example.test/bar'},
          'triggers': [{'on': 'visible', 'parentPostMessage': 'foo'}],
        });
        postMessageSpy = env.sandbox.spy(analytics.win.parent, 'postMessage');
        return waitForNoSendRequest(analytics).then(() => {
          return waitForParentPostMessage();
        });
      });

      it('does send a hit when parentPostMessage is provided for FIE', function () {
        const analytics = getAnalyticsTag({
          'triggers': [{'on': 'visible', 'parentPostMessage': 'foo'}],
        });
        analytics.element.classList.add('i-amphtml-fie');
        postMessageSpy = env.sandbox.spy(analytics.win.parent, 'postMessage');
        return waitForNoSendRequest(analytics).then(() => {
          return waitForParentPostMessage();
        });
      });

      it('does not send with parentPostMessage not inabox', function () {
        const analytics = getAnalyticsTag({
          'requests': {'foo': 'https://example.test/bar'},
          'triggers': [
            {
              'on': 'visible',
              'parentPostMessage': 'foo',
            },
          ],
        });
        postMessageSpy = env.sandbox.spy(analytics.win.parent, 'postMessage');
        return waitForNoSendRequest(analytics).then(() => {
          return waitForNoParentPostMessage();
        });
      });

      it('not send when request and parentPostMessage are not provided', function () {
        env.win.__AMP_MODE.runtime = 'inabox';
        expectAsyncConsoleError(onAndRequestAttributesInaboxError);
        const analytics = getAnalyticsTag({
          'requests': {'foo': 'https://example.test/bar'},
          'triggers': [{'on': 'visible'}],
        });
        postMessageSpy = env.sandbox.spy(analytics.win.parent, 'postMessage');
        return waitForNoSendRequest(analytics).then(() => {
          return waitForNoParentPostMessage();
        });
      });

      it('send when request and parentPostMessage are provided', function () {
        env.win.__AMP_MODE.runtime = 'inabox';
        const analytics = getAnalyticsTag({
          'requests': {'foo': 'https://example.test/bar'},
          'triggers': [
            {
              'on': 'visible',
              'parentPostMessage': 'bar',
              'request': 'foo',
            },
          ],
        });
        postMessageSpy = env.sandbox.spy(analytics.win.parent, 'postMessage');
        return waitForSendRequest(analytics).then(() => {
          return waitForParentPostMessage(analytics);
        });
      });
    });

    describe('getLayoutPriority', () => {
      function getConfig() {
        return {
          'requests': {
            'pageview1': '/test1=${requestCount}',
          },
          'triggers': {
            'conditional': {
              'on': 'visible',
              'request': 'pageview1',
              'vars': {},
            },
          },
          'vars': {},
        };
      }

      it('is 1 for non-inabox', () => {
        expect(getAnalyticsTag(getConfig()).getLayoutPriority()).to.equal(
          LayoutPriority_Enum.METADATA
        );
      });

      it('is 0 for inabox', () => {
        env.win.__AMP_MODE.runtime = 'inabox';
        expect(getAnalyticsTag(getConfig()).getLayoutPriority()).to.equal(
          LayoutPriority_Enum.CONTENT
        );
      });
    });
  }
);
