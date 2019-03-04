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

import {AmpAnalytics} from '../amp-analytics';
import {AnalyticsConfig} from '../config';
import {
  ClickEventTracker,
  VisibilityTracker,
} from '../events';
import {
  ImagePixelVerifier,
  mockWindowInterface,
} from '../../../../testing/test-helper';
import {LayoutPriority} from '../../../../src/layout';
import {LinkerManager} from '../linker-manager';
import {Services} from '../../../../src/services';
import {Transport} from '../transport';
import {cidServiceForDocForTesting} from
  '../../../../src/service/cid-impl';
import {
  getService,
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';
import {installCryptoService} from '../../../../src/service/crypto-impl';
import {
  installUserNotificationManagerForTesting,
} from '../../../amp-user-notification/0.1/amp-user-notification';
import {instrumentationServiceForDocForTesting} from '../instrumentation';

describes.realWin('amp-analytics', {
  amp: {
    extensions: ['amp-analytics'],
  },
}, function(env) {
  let win, doc, sandbox;
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
    'https://foo/Test%20Title': '{"vars": {"title": "magic"}}',
    '//config-rv2': '{"requests": {"foo": "https://example.com/remote"}}',
    'https://rewriter.com': '{"vars": {"title": "rewritten"}}',
  };
  const trivialConfig = {
    'requests': {'foo': 'https://example.com/bar'},
    'triggers': {'pageview': {'on': 'visible', 'request': 'foo'}},
  };

  const noTriggersError = '[AmpAnalytics <unknown id>] No triggers were ' +
      'found in the config. No analytics data will be sent.';
  const noRequestStringsError = '[AmpAnalytics <unknown id>] No request ' +
      'strings defined. Analytics data will not be sent from this page.';
  const oneScriptChildError = '[AmpAnalytics <unknown id>] The tag should ' +
      'contain only one <script> child.';
  const scriptTypeError = '[AmpAnalytics <unknown id>] ' +
      '<script> child must have type="application/json"';
  const configParseError = '[AmpAnalytics <unknown id>] Failed to ' +
      'parse <script> contents. Is it valid JSON?';
  const onAndRequestAttributesError = '[AmpAnalytics <unknown id>] "on" and ' +
      '"request" attributes are required for data to be collected.';
  const onAndRequestAttributesInaboxError = '[AmpAnalytics <unknown id>] ' +
      '"on" and "request"/"parentPostMessage" ' +
      'attributes are required for data to be collected.';
  const invalidThresholdForSamplingError =
      '[AmpAnalytics <unknown id>] Invalid threshold for sampling.';
  const clickTrackerNotSupportedError = '[AmpAnalytics <unknown id>] click ' +
      'is not supported for amp-analytics in scope';

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    sandbox = env.sandbox;
    ampdoc = env.ampdoc;
    configWithCredentials = false;
    doc.title = 'Test Title';
    resetServiceForTesting(win, 'xhr');
    jsonRequestConfigs = {};
    registerServiceBuilder(win, 'xhr', function() {
      return {fetchJson: (url, init) => {
        jsonRequestConfigs[url] = init;
        expect(init.requireAmpResponseSourceOrigin).to.be.false;
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
      }};
    });
    resetServiceForTesting(win, 'crypto');
    installCryptoService(win, 'crypto');
    crypto = getService(win, 'crypto');
    const link = doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', './test-canonical.html');
    doc.head.appendChild(link);
    cidServiceForDocForTesting(ampdoc);
    viewer = win.services.viewer.obj;
    ins = instrumentationServiceForDocForTesting(ampdoc);
    installUserNotificationManagerForTesting(ampdoc);

    const wi = mockWindowInterface(sandbox);
    requestVerifier = new ImagePixelVerifier(wi);
    return Services.userNotificationManagerForDoc(doc.head).then(manager => {
      uidService = manager;
    });
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
    analytics.createdCallback();
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
      return new Promise(resolve => {
        const start = Date.now();
        const interval = setInterval(() => {
          const time = Date.now();
          if (requestVerifier.hasRequestSent() ||
              (opt_max && (time - start) > opt_max)) {
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
    it('sends a basic hit', function() {
      const analytics = getAnalyticsTag(trivialConfig);
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/bar');
      });
    });

    it('does not send a hit when config is not in a script tag', function() {
      expectAsyncConsoleError(noTriggersError);
      expectAsyncConsoleError(noRequestStringsError);
      const config = JSON.stringify(trivialConfig);
      const el = doc.createElement('amp-analytics');
      el.textContent = config;
      const analytics = new AmpAnalytics(el);
      doc.body.appendChild(el);
      el.connectedCallback();
      analytics.createdCallback();
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
      const whenFirstVisibleStub = sandbox.stub(
          viewer,
          'whenFirstVisible').callsFake(() => new Promise(function() {}));
      const analytics = new AmpAnalytics(el);
      el.getAmpDoc = () => ampdoc;
      analytics.buildCallback();
      const iniPromise = analytics.iniPromise_;
      expect(iniPromise).to.be.ok;
      expect(el).to.have.attribute('hidden');
      // Viewer.whenFirstVisible is the first blocking call to initialize.
      expect(whenFirstVisibleStub).to.be.calledOnce;

      // Repeated call, returns pre-created promise.
      expect(analytics.ensureInitialized_()).to.equal(iniPromise);
      expect(whenFirstVisibleStub).to.be.calledOnce;
    });

    it('does not send a hit when multiple child tags exist', function() {
      expectAsyncConsoleError(oneScriptChildError);
      expectAsyncConsoleError(noRequestStringsError);
      expectAsyncConsoleError(noTriggersError);
      const analytics = getAnalyticsTag(trivialConfig);
      const script2 = document.createElement('script');
      script2.setAttribute('type', 'application/json');
      analytics.element.appendChild(script2);
      return waitForNoSendRequest(analytics);
    });

    it('does not send a hit when script tag does not have a type attribute',
        function() {
          expectAsyncConsoleError(scriptTypeError);
          expectAsyncConsoleError(noRequestStringsError);
          expectAsyncConsoleError(noTriggersError);
          const el = doc.createElement('amp-analytics');
          const script = doc.createElement('script');
          script.textContent = JSON.stringify(trivialConfig);
          el.appendChild(script);
          doc.body.appendChild(el);
          const analytics = new AmpAnalytics(el);
          el.connectedCallback();
          analytics.createdCallback();
          analytics.buildCallback();

          return waitForNoSendRequest(analytics);
        });

    it('does not send a hit when json config is not valid', function() {
      expectAsyncConsoleError(configParseError);
      expectAsyncConsoleError(noRequestStringsError);
      expectAsyncConsoleError(noTriggersError);
      const el = doc.createElement('amp-analytics');
      const script = doc.createElement('script');
      script.setAttribute('type', 'application/json');
      script.textContent = '{"a",}';
      el.appendChild(script);
      doc.body.appendChild(el);
      const analytics = new AmpAnalytics(el);
      el.connectedCallback();
      analytics.createdCallback();
      analytics.buildCallback();

      return waitForNoSendRequest(analytics);
    });

    it('does not send a hit when request is not provided', function() {
      expectAsyncConsoleError(onAndRequestAttributesError);
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/bar'},
        'triggers': [{'on': 'visible'}],
      });

      return waitForNoSendRequest(analytics);
    });

    it('does not send a hit when request type is not defined', function() {
      expectAsyncConsoleError(noRequestStringsError);
      expectAsyncConsoleError(/Request string not found/);
      const analytics = getAnalyticsTag({
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      });

      return waitForNoSendRequest(analytics);
    });

    it('expands nested requests', function() {
      const analytics = getAnalyticsTag({
        'requests': {
          'foo': 'https://example.com/bar&${foobar}&baz',
          'foobar': 'f1',
        },
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/bar&f1&baz');
      });
    });

    it('expand nested requests with vendor provided value', () => {
      const analytics = getAnalyticsTag({
        'requests': {
          'foo': 'https://example.com/bar&${clientId}&baz',
          'clientId': 'c1',
        },
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/bar&c1&baz');
      });
    });

    it('expands nested requests (3 levels)', function() {
      const analytics = getAnalyticsTag({
        'requests': {
          'foo': 'https://example.com/bar&${foobar}',
          'foobar': '${baz}',
          'baz': 'b1',
        },
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      });

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/bar&b1');
      });
    });

    it('should tolerate invalid triggers', function() {
      expectAsyncConsoleError(/No request strings defined/);
      const analytics = getAnalyticsTag({
        'request': {'foo': 'https://example.com'},
        'triggers': [],
      });
      return waitForNoSendRequest(analytics);
    });

    it('expands recursive requests', function() {
      const analytics = getAnalyticsTag({
        'requests': {'foo': '/bar&${foobar}&baz', 'foobar': '${foo}'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      });

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('/bar&/bar&/bar&&baz&baz&baz');
      });
    });

    it('sends multiple requests per trigger', function() {
      expectAsyncConsoleError(/Request string not found/);
      const analytics = getAnalyticsTag({
        'requests': {
          'foo': 'https://example.com/bar&${foobar}',
          'foobar': '${baz}',
          'baz': 'b1',
        },
        'triggers': [{'on': 'visible', 'request': ['foo', 'foobar', 'foo2']}],
      });

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/bar&b1');
        requestVerifier.verifyRequest('b1');
      });
    });

    it('should not replace HTML_ATTR outside of amp-ad', () => {
      const analytics = getAnalyticsTag({
        'requests': {
          'htmlAttrRequest': 'https://example.com/bar&ids=${htmlAttr(div,id)}',
        },
        'triggers': [{'on': 'visible', 'request': 'htmlAttrRequest'}],
      });

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/bar&ids=HTML_ATTR(div,id)');
      });
    });

    it('fills cid', function() {
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/cid=${clientId(analytics-abc)}'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      });

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequestMatch(/^https:\/\/example.com\/cid=[a-zA-Z\-]+/);
      });
    });

    // TODO(lannka, #12476): Make this test work with sinon 4.0.
    it.skip('fills internally provided trigger vars', function() {
      const analytics = getAnalyticsTag({
        'requests': {
          'timer': 'https://e.com/start=${timerStart}&duration=${timerDuration}',
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

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest(/https:\/\/e.com\/start=[0-9]+&duration=0/);
        requestVerifier.verifyRequest('https://e.com/totalVisibleTime=0');
      });
    });

    it('should create and destroy analytics group', () => {
      const analytics = getAnalyticsTag({
        requests: {foo: 'https://example.com/bar'},
        triggers: [{on: 'click', selector: '${foo}', request: 'foo'}],
        vars: {foo: 'bar'},
      });
      return waitForNoSendRequest(analytics).then(() => {
        expect(analytics.analyticsGroup_).to.be.ok;
        const disposeStub = sandbox.stub(analytics.analyticsGroup_, 'dispose');
        analytics.detachedCallback();
        expect(analytics.analyticsGroup_).to.be.null;
        expect(disposeStub).to.be.calledOnce;
      });
    });

    it('expands urls in config request', () => {
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/${title}'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      }, {
        'config': 'https://foo/TITLE',
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/magic');
      });
    });

    it('updates requestCount on each request', () => {
      const analytics = getAnalyticsTag({
        'host': 'example.com',
        'requests': {
          'pageview1': '/test1=${requestCount}',
          'pageview2': '/test2=${requestCount}',
        },
        'triggers': [
          {'on': 'visible', 'request': 'pageview1'},
          {'on': 'visible', 'request': 'pageview2'},
        ],
      });
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
          'pageview': 'https://example.com/test1=${var1}&test2=${var2}',
        },
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            'var1': 'x',
            'var2': 'test2',
          },
        }],
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/test1=x&test2=test2');
      });
    });

    it('expands config vars', () => {
      const analytics = getAnalyticsTag({
        'vars': {
          'var1': 'x',
          'var2': 'test2',
        },
        'requests': {
          'pageview': 'https://example.com/test1=${var1}&test2=${var2}',
        },
        'triggers': [{'on': 'visible', 'request': 'pageview'}],
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/test1=x&test2=test2');
      });
    });

    it('expands platform vars', () => {
      const analytics = getAnalyticsTag({
        'requests': {
          'pageview': 'https://example.com/title=${title}&ref=${documentReferrer}',
        },
        'triggers': [{'on': 'visible', 'request': 'pageview'}],
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequestMatch(/https:\/\/example.com\/title=Test%20Title&ref=http%3A%2F%2Flocalhost%3A9876%2F(context|debug).html/);
      });
    });

    it('expands url-replacements vars', function() {
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/TITLE'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/Test%20Title');
      });
    });

    it('expands trigger vars with higher precedence' +
        'than config vars', () => {
      const analytics = getAnalyticsTag({
        'vars': {
          'var1': 'config1',
          'var2': 'config2',
        },
        'requests': {
          'pageview': 'https://example.com/test1=${var1}&test2=${var2}',
        },
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            'var1': 'trigger1',
          },
        }],
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/test1=trigger1&test2=config2');
      });
    });

    it('expands element level vars with higher precedence' +
        'than trigger vars', () => {
      const analytics = getAnalyticsTag();
      const analyticsGroup = ins.createAnalyticsGroup(analytics.element);

      const el1 = doc.createElement('div');
      el1.className = 'x';
      el1.dataset.varsTest = 'foo';
      analyticsGroup.root_.getRootElement().appendChild(el1);

      const handlerSpy = sandbox.spy();
      analyticsGroup.addTrigger(
          {'on': 'click', 'selector': '.x', 'vars': {'test': 'bar'}},
          handlerSpy);
      analyticsGroup.root_.getTrackerOptional('click')
          .clickObservable_.fire({target: el1});

      expect(handlerSpy).to.be.calledOnce;
      const event = handlerSpy.args[0][0];
      expect(event.vars.test).to.equal('foo');
    });

    it('expands config vars with higher precedence' +
        'than platform vars', () => {
      const analytics = getAnalyticsTag({
        'vars': {'random': 428},
        'requests': {
          'pageview': 'https://example.com/test1=${title}&test2=${random}',
        },
        'triggers': [{'on': 'visible', 'request': 'pageview'}],
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/test1=Test%20Title&test2=428');
      });
    });

    it('expands and encodes requests, config vars,' +
        'and trigger vars', () => {
      const analytics = getAnalyticsTag({
        'vars': {
          'c1': 'config 1',
          'c2': 'config&2',
        },
        'requests': {
          'base': 'https://example.com/test?c1=${c1}&t1=${t1}',
          'pageview': '${base}&c2=${c2}&t2=${t2}',
        },
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            't1': 'trigger=1',
            't2': 'trigger?2',
          },
        }],
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/test?c1=config%201&t1=trigger%3D1&c2=config%262&t2=trigger%3F2');
      });
    });

    it('encodes array vars', () => {
      const analytics = getAnalyticsTag({
        'vars': {
          'c1': ['Config, The Barbarian', 'config 1'],
          'c2': 'config&2',
        },
        'requests': {
          'base': 'https://example.com/test?',
          'pageview': '${base}c1=${c1}&c2=${c2}',
        },
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
        }],
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/test?c1=Config%2C%20The%20Barbarian,config%201&c2=config%262');
      });
    });

    it('expands url-replacements vars', () => {
      const analytics = getAnalyticsTag({
        'requests': {
          'pageview': 'https://example.com/test1=${var1}&test2=${var2}&title=TITLE',
        },
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            'var1': 'x',
            'var2': 'DOCUMENT_REFERRER',
          },
        }],
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequestMatch(/https:\/\/example.com\/test1=x&test2=http%3A%2F%2Flocalhost%3A9876%2F(context|debug).html&title=Test%20Title/);
      });
    });

    it('expands complex vars', () => {
      const analytics = getAnalyticsTag({
        'requests': {
          'pageview': 'https://example.com/test1=${qp_foo}',
        },
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            'qp_foo': '${queryParam(foo)}',
          },
        }],
      });
      const urlReplacements =
          Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get').callsFake(
          function(name) {
            return {sync: param => {
              return '_' + name.toLowerCase() + '_' + param + '_';
            }};
          });

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/test1=_query_param_foo_');
      });
    });
  });

  describe('expand selector', () => {

    it('expands selector with config variable', () => {
      const tracker = ins.ampdocRoot_.getTracker('click', ClickEventTracker);
      const addStub = sandbox.stub(tracker, 'add');
      const analytics = getAnalyticsTag({
        requests: {foo: 'https://example.com/bar'},
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
        const tracker = ins.ampdocRoot_.getTracker('click', ClickEventTracker);
        const addStub = sandbox.stub(tracker, 'add');
        const analytics = getAnalyticsTag({
          requests: {foo: 'https://example.com/bar'},
          triggers: [{on: 'click', selector: '${foo}, ${bar}', request: 'foo'}],
          vars: {foo: selector, bar: '123'},
        });
        return waitForNoSendRequest(analytics).then(() => {
          expect(addStub).to.be.calledOnce;
          const config = addStub.args[0][2];
          expect(config['selector']).to.equal(selector + ', 123');
        });
      });
    }

    ['.clazz', 'a, div', 'a .foo', 'a #foo', 'a > div', 'div + p', 'div ~ ul',
      '[target=_blank]', '[title~=flower]', '[lang|=en]', 'a[href^="https"]',
      'a[href$=".pdf"]', 'a[href="w3schools"]', 'a:active', 'p::after',
      'p:first-child', 'p:lang(it)', ':not(p)', 'p:nth-child(2)']
        .map(selectorExpansionTest);

    it('does not expands selector with platform variable', () => {
      const tracker = ins.ampdocRoot_.getTracker('click', ClickEventTracker);
      const addStub = sandbox.stub(tracker, 'add');
      const analytics = getAnalyticsTag({
        requests: {foo: 'https://example.com/bar'},
        triggers: [{on: 'click', selector: '${title}', request: 'foo'}],
      });
      return waitForNoSendRequest(analytics).then(() => {
        expect(addStub).to.be.calledOnce;
        const config = addStub.args[0][2];
        expect(config['selector']).to.equal('TITLE');
      });
    });
  });

  // TODO(leeandrew1693): This block tests backwards compatible optout code for
  // GTM. Remove this once GTM updates.
  describe('optout backwards compatible', () => {

    beforeEach(() => {
      sandbox.stub(AnalyticsConfig.prototype, 'loadConfig')
          .returns(Promise.resolve({
            'requests': {
              'foo': {
                baseUrl: 'https://example.com/bar',
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
          }));
    });

    it('works for vendor config when optout returns false', function() {
      win['foo'] = {'bar': () => false};
      const analytics = getAnalyticsTag(trivialConfig);
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/bar');
      });
    });

    it('works for vendor config when optout returns true', function() {
      win['foo'] = {'bar': function() { return true; }};
      const analytics = getAnalyticsTag(trivialConfig, {'type': 'testVendor'});
      return waitForNoSendRequest(analytics);
    });

    it('works for vendor config when optout is not defined', function() {
      const analytics = getAnalyticsTag(trivialConfig, {'type': 'testVendor'});
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/bar');
      });
    });
  });

  describe('optout by function', () => {

    beforeEach(() => {
      sandbox.stub(AnalyticsConfig.prototype, 'loadConfig')
          .returns(Promise.resolve({
            'requests': {
              'foo': {
                baseUrl: 'https://example.com/bar',
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
            'optout': {
              'function': 'foo.bar',
            },
          }));
    });

    it('sends hit when config optout function returns false', function() {
      win['foo'] = {'bar': () => false};
      const analytics = getAnalyticsTag(trivialConfig);
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/bar');
      });
    });

    it('doesnt send hit when config optout function returns true', function() {
      win['foo'] = {'bar': function() { return true; }};
      const analytics = getAnalyticsTag(trivialConfig, {'type': 'testVendor'});
      return waitForNoSendRequest(analytics);
    });

    it('sends hit when config optout function is not defined', function() {
      const analytics = getAnalyticsTag(trivialConfig, {'type': 'testVendor'});
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/bar');
      });
    });
  });

  describe('optout by id', () => {

    beforeEach(() => {
      sandbox.stub(AnalyticsConfig.prototype, 'loadConfig')
          .returns(Promise.resolve({
            'requests': {
              'foo': {
                baseUrl: 'https://example.com/bar',
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
            'optout': {
              'id': 'elementId',
            },
          }));
    });

    it('doesnt send hit when config optout id is found', function() {
      const element = doc.createElement('script');
      element.type = 'text/javascript';
      element.id = 'elementId';
      doc.documentElement.insertBefore(
          element, doc.documentElement.firstChild);

      const analytics = getAnalyticsTag(trivialConfig, {'type': 'testVendor'});
      return waitForNoSendRequest(analytics);
    });

    it('sends hit when config optout id is not found', function() {
      const analytics = getAnalyticsTag(trivialConfig, {'type': 'testVendor'});
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/bar');
      });
    });
  });

  describe('extraUrlParams', () => {

    let config;
    beforeEach(() => {
      config = {
        vars: {host: 'example.com', path: 'helloworld'},
        extraUrlParams: {'s.evar0': '0', 's.evar1': '${path}', 'foofoo': 'baz'},
        triggers: {trig: {'on': 'visible', 'request': 'foo'}},
      };
      config['requests'] = {'foo': 'https://${host}/${path}?a=b'};
    });

    it('are sent', () => {
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/helloworld?a=b&s.evar0=0&s.evar1=helloworld&foofoo=baz');
      });
    });

    it('are renamed by extraUrlParamsReplaceMap', () => {
      config.extraUrlParamsReplaceMap = {'s.evar': 'v'};
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/helloworld?a=b&foofoo=baz&v0=0&v1=helloworld');
      });
    });

    it('are supported at trigger level', () => {
      config.triggers.trig.extraUrlParams = {c: 'd', 's.evar': 'e'};
      config.extraUrlParamsReplaceMap = {'s.evar': 'v'};
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/helloworld?a=b&foofoo=baz&v0=0&v1=helloworld&c=d&v=e');
      });
    });

    it('are supported as a var in URL', () => {
      config['requests'].foo =
          'https://${host}/${path}?${extraUrlParams}&a=b';
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/helloworld?s.evar0=0&s.evar1=helloworld&foofoo=baz&a=b');
      });
    });

    it('work when the value is an array', () => {
      config.extraUrlParams = {'foo': ['0']};
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/helloworld?a=b&foo=0');
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

      sandbox.stub(crypto, 'uniform').returns(Promise.resolve(0.005));
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('/test1=1');
      });
    });

    it('allows a request through based on url-replacements', () => {
      const config = getConfig(1);
      config.triggers.sampled.sampleSpec.sampleOn = '${pageViewId}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get').returns({
        async: 0,
        sync: 0,
      });
      sandbox.stub(crypto, 'uniform')
          .withArgs('0').returns(Promise.resolve(0.005));
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('/test1=1');
      });
    });

    it('does not allow a request through', () => {
      const analytics = getAnalyticsTag(getConfig(1));

      sandbox.stub(crypto, 'uniform').returns(Promise.resolve(0.1));
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
        'triggers': [{
          'on': 'visible',
          'request': 'pageview1',
          'sampleSpec': {
            'sampleOn': '${requestCount}',
          },
        }],
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

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
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

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns(null);

      return waitForNoSendRequest(analytics);
    });

    it('does not allow a request through ' +
     'if a request param is falsey (0)', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: 0});

      return waitForNoSendRequest(analytics);
    });

    it('does not allow a request through ' +
    'if a request param is falsey (false)', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: false});

      return waitForNoSendRequest(analytics);
    });

    it('does not allow a request through ' +
     'if a request param is falsey (null)', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: null});

      return waitForNoSendRequest(analytics);
    });

    it('does not allow a request through ' +
     'if a request param is falsey (NaN)', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: NaN});

      return waitForNoSendRequest(analytics);
    });

    it('does not allow a request through ' +
     'if a request param is falsey (undefined)', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: undefined});

      return waitForNoSendRequest(analytics);
    });

    it('allows a request based on a variable when enabled on tag level', () => {
      const config = getConfig();
      config.enabled = '${foo}';
      config.vars.foo = 'bar';
      const analytics = getAnalyticsTag(config);

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('/test1=1');
      });
    });

    it('allows a request based on url-replacements ' +
    'when enabled on tag level', () => {
      const config = getConfig();
      config.enabled = '${pageViewId}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: 1});
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('/test1=1');
      });
    });

    it('does not allow a request through when enabled on tag level', () => {
      const config = getConfig();
      config.enabled = '';
      const analytics = getAnalyticsTag(config);

      return waitForNoSendRequest(analytics);
    });

    it('does not allow a request through if a variable is missing ' +
    'when enabled on tag level', () => {
      const config = getConfig();
      config.enabled = '${undefinedParam}';
      const analytics = getAnalyticsTag(config);

      return waitForNoSendRequest(analytics);
    });

    it('does not allow a request through if a request param is missing ' +
    'when enabled on tag level', () => {
      const config = getConfig();
      config.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get').returns(null);

      return waitForNoSendRequest(analytics);
    });

    it('does not allow a request through if a request param is missing ' +
    'when enabled on tag level but enabled on trigger level', () => {
      const config = getConfig();
      config.enabled = '${queryParam(undefinedParam)}';
      config.triggers.conditional.enabled = '${foo}';
      config.triggers.conditional.vars.foo = 'bar';

      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get').returns(null);

      return waitForNoSendRequest(analytics);
    });

    it('does not allow a request through if enabled on tag level ' +
    'but variable is missing on trigger level', () => {
      const config = getConfig();
      config.enabled = '${pageViewId}';
      config.triggers.conditional.enabled = '${foo}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get').returns('page');

      return waitForNoSendRequest(analytics);
    });
  });

  describe('data-consent-notification-id', () => {

    it('should resume fetch when consent is given', () => {
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/local'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      }, {
        'data-consent-notification-id': 'amp-user-notification1',
      });

      sandbox.stub(uidService, 'get').callsFake(id => {
        expect(id).to.equal('amp-user-notification1');
        return Promise.resolve();
      });

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest('https://example.com/local');
      });
    });

    it('should not fetch when consent is not given', () => {
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/local'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      }, {
        'data-consent-notification-id': 'amp-user-notification1',
      });

      sandbox.stub(uidService, 'get').callsFake(id => {
        expect(id).to.equal('amp-user-notification1');
        return Promise.reject();
      });
      return analytics.layoutCallback().then(() => {
        throw new Error('Must never be here');
      }, () => {
        expect(requestVerifier.hasRequestSent()).to.be.false;
      });
    });

    it('should not throw in resumeCallback/unlayoutCallback ' +
        'if consent rejected', () => {
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/local'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      }, {
        'data-consent-notification-id': 'amp-user-notification1',
      });

      sandbox.stub(uidService, 'get').callsFake(id => {
        expect(id).to.equal('amp-user-notification1');
        return Promise.reject();
      });

      sandbox.stub(viewer, 'isVisible').returns(false);
      analytics.layoutCallback();
      analytics.resumeCallback();
      analytics.unlayoutCallback();
    });
  });

  describe('Sandbox AMP Analytics Element', () => {

    beforeEach(() => {
      // Unfortunately need to fake sandbox analytics element's parent
      // to an AMP element
      doc.body.classList.add('i-amphtml-element');
    });

    afterEach(() => {
      doc.body.classList.remove('i-amphtml-element');
    });

    it('should not add listener when eventType is not whitelist', function() {
      expectAsyncConsoleError(clickTrackerNotSupportedError);
      // Right now we only whitelist VISIBLE & HIDDEN
      const tracker = ins.ampdocRoot_.getTracker('click', ClickEventTracker);
      const addStub = sandbox.stub(tracker, 'add');
      const analytics = getAnalyticsTag({
        requests: {foo: 'https://example.com/bar'},
        triggers: [{on: 'click', request: 'foo'}],
      }, {
        'sandbox': 'true',
      });

      return waitForNoSendRequest(analytics).then(() => {
        expect(addStub).to.not.be.called;
      });
    });

    it('replace selector and selectionMethod when in scope', () => {
      const tracker = ins.ampdocRoot_.getTracker('visible', VisibilityTracker);
      const addStub = sandbox.stub(tracker, 'add');
      const analytics = getAnalyticsTag({
        requests: {foo: 'https://example.com/bar'},
        triggers: [{on: 'visible', selector: 'amp-iframe', request: 'foo'}],
      }, {
        'sandbox': 'true',
      }, true);
      return waitForNoSendRequest(analytics).then(() => {
        expect(addStub).to.be.calledOnce;
        const config = addStub.args[0][2];
        expect(config['selector']).to.equal(
            analytics.element.parentElement.tagName);
        expect(config['selectionMethod']).to.equal('closest');
      });
    });

    it('expand vendor vars but not replace non whitelist variables', () => {
      const analytics = getAnalyticsTag({
        'requests': {
          'pageview': 'https://example.com/test1=${var1}&CLIENT_ID(analytics-abc)=${var2}',
        },
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            'var1': 'CLIENT_ID(analytics-abc)',
            'var2': 'test2',
          },
        }]}, {
        'sandbox': 'true',
      });
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest(
            'https://example.com/test1=CLIENT_ID(analytics-abc)&' +
            'CLIENT_ID(analytics-abc)=test2');
      });
    });

    it('should not replace non whitelist variable', () => {
      const analytics = getAnalyticsTag({
        'requests':
            {'foo': 'https://example.com/cid=${clientId(analytics-abc)}'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      }, {
        'sandbox': 'true',
      });

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest(
            'https://example.com/cid=CLIENT_ID(analytics-abc)');
      });
    });

    it('should replace whitelist variable', () => {
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/random=${random}'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      }, {
        'sandbox': 'true',
      }, true);

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequestMatch(/^https:\/\/example.com\/random=0.[0-9]/);
      });
    });

    it('should replace for multi whitelisted(or not) variables', () => {
      const analytics = getAnalyticsTag({
        'requests': {'foo':
            'https://example.com/cid=${clientId(analytics-abc)}random=RANDOM'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      }, {
        'sandbox': 'true',
      }, true);

      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequestMatch(
            /https:\/\/example\.com\/cid=CLIENT_ID\(analytics-abc\)random=0\.[0-9]+/);
      });
    });

    it('expands url-replacements vars', () => {
      const analytics = getAnalyticsTag({
        'requests': {
          'pageview': 'https://example.com/VIEWER&AMP_VERSION&' +
          'test1=${var1}&test2=${var2}&test3=${var3}&url=AMPDOC_URL'},
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            'var1': 'x',
            'var2': 'AMPDOC_URL',
            'var3': 'CLIENT_ID',
          },
        }]}, {
        'sandbox': 'true',
      }, true);
      return waitForSendRequest(analytics).then(() => {
        requestVerifier.verifyRequest(
            'https://example.com/VIEWER&%24internalRuntimeVersion%24' +
          '&test1=x&test2=about%3Asrcdoc&test3=CLIENT_ID' +
          '&url=about%3Asrcdoc');
      });
    });

    it('allow a request sample through on non whitelist url variables', () => {
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
      }, true);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get').returns({
        async: 0,
        sync: 0,
      });
      sandbox.stub(crypto, 'uniform')
          .withArgs('0').returns(Promise.resolve(0.005))
          .withArgs('CLIENT_ID').returns(Promise.resolve(0.5));
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

    it('Initializes a new Linker.', () => {
      expectAsyncConsoleError(noTriggersError);
      expectAsyncConsoleError(noRequestStringsError);

      sandbox.stub(AnalyticsConfig.prototype, 'loadConfig')
          .resolves({});

      const linkerStub = sandbox.stub(LinkerManager.prototype, 'init');

      analytics.buildCallback();
      return analytics.layoutCallback().then(() => {
        expect(linkerStub.calledOnce).to.be.true;
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

      sandbox.stub(AnalyticsConfig.prototype, 'loadConfig')
          .returns(Promise.resolve(sampleconfig));

      analytics.buildCallback();
      analytics.preconnectCallback();
      const initSpy = sandbox.spy(
          Transport.prototype, 'maybeInitIframeTransport');
      return analytics.layoutCallback().then(() => {
        expect(initSpy).to.be.called;
      });
    });
  });

  describe('parentPostMessage in inabox case', () => {
    let postMessageSpy;

    function waitForParentPostMessage(opt_max) {
      if (postMessageSpy.callCount) {
        return Promise.resolve();
      }
      return new Promise(resolve => {
        const start = Date.now();
        const interval = setInterval(() => {
          const time = Date.now();
          if (postMessageSpy.callCount ||
              (opt_max && (time - start) > opt_max)) {
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

    it('does send a hit when parentPostMessage is provided inabox', function() {
      env.win.AMP_MODE.runtime = 'inabox';
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/bar'},
        'triggers': [{'on': 'visible', 'parentPostMessage': 'foo'}],
      });
      postMessageSpy = sandbox.spy(analytics.win.parent, 'postMessage');
      return waitForNoSendRequest(analytics).then(() => {
        return waitForParentPostMessage();
      });
    });

    it('does not send with parentPostMessage not inabox', function() {
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/bar'},
        'triggers': [{
          'on': 'visible',
          'parentPostMessage': 'foo',
        }],
      });
      postMessageSpy = sandbox.spy(analytics.win.parent, 'postMessage');
      return waitForNoSendRequest(analytics).then(() => {
        return waitForNoParentPostMessage();
      });
    });

    it('not send when request and parentPostMessage are not provided',
        function() {
          env.win.AMP_MODE.runtime = 'inabox';
          expectAsyncConsoleError(onAndRequestAttributesInaboxError);
          const analytics = getAnalyticsTag({
            'requests': {'foo': 'https://example.com/bar'},
            'triggers': [{'on': 'visible'}],
          });
          postMessageSpy = sandbox.spy(analytics.win.parent, 'postMessage');
          return waitForNoSendRequest(analytics).then(() => {
            return waitForNoParentPostMessage();
          });
        });

    it('send when request and parentPostMessage are provided', function() {
      env.win.AMP_MODE.runtime = 'inabox';
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/bar'},
        'triggers': [{
          'on': 'visible',
          'parentPostMessage': 'bar',
          'request': 'foo',
        }],
      });
      postMessageSpy = sandbox.spy(analytics.win.parent, 'postMessage');
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
          LayoutPriority.METADATA);
    });

    it('is 0 for inabox', () => {
      env.win.AMP_MODE.runtime = 'inabox';
      expect(getAnalyticsTag(getConfig()).getLayoutPriority()).to.equal(
          LayoutPriority.CONTENT);
    });
  });
});
