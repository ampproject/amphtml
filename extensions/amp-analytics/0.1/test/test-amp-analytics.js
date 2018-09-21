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

import {ANALYTICS_CONFIG} from '../vendors';
import {AmpAnalytics} from '../amp-analytics';
import {AnalyticsConfig} from '../config';
import {
  ClickEventTracker,
  VisibilityTracker,
} from '../events';
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
import {macroTask} from '../../../../testing/yield';
import {
  newPerformanceResourceTiming,
  newResourceTimingSpec,
} from './test-resource-timing';
import {variableServiceFor} from '../variables';

/* global require: false */
const VENDOR_REQUESTS = require('./vendor-requests.json');


describes.realWin('amp-analytics', {
  amp: {
    extensions: ['amp-analytics'],
  },
}, function(env) {
  let win, doc;
  let sendRequestSpy;
  let postMessageSpy;
  let configWithCredentials;
  let uidService;
  let crypto;
  let ampdoc;
  let ins;
  let viewer;
  let jsonRequestConfigs = {};

  const jsonMockResponses = {
    '//invalidConfig': '{"transport": {"iframe": "fake.com"}}',
    '//config1': '{"vars": {"title": "remote"}}',
    'https://foo/Test%20Title': '{"vars": {"title": "magic"}}',
    '//config-rv2': '{"requests": {"foo": "https://example.com/remote"}}',
    'https://rewriter.com': '{"vars": {"title": "rewritten"}}',
  };
  const trivialConfig = {
    'requests': {'foo': 'https://example.com/bar'},
    'triggers': [{'on': 'visible', 'request': 'foo'}],
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
    return Services.userNotificationManagerForDoc(ampdoc).then(manager => {
      uidService = manager;
    });
  });


  function getAnalyticsTag(config, attrs) {
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
    sendRequestSpy = sandbox.stub(analytics, 'sendRequest_');
    postMessageSpy = sandbox.spy(analytics.win.parent, 'postMessage');
    return analytics;
  }

  function waitForSendRequest(analytics, opt_max, opt_cnt) {
    expect(analytics.element).to.not.have.display('none');
    const callCount = opt_cnt || 0;
    return analytics.layoutCallback().then(() => {
      expect(analytics.element).to.have.display('none');
      if (sendRequestSpy.callCount > callCount) {
        return;
      }
      return new Promise(resolve => {
        const start = Date.now();
        const interval = setInterval(() => {
          const time = Date.now();
          if (sendRequestSpy.callCount > callCount ||
              (opt_max && (time - start) > opt_max)) {
            clearInterval(interval);
            resolve();
          }
        }, 4);
      });
    });
  }

  function waitForNoSendRequest(analytics) {
    return waitForSendRequest(analytics, 100);
  }

  /**
   * Clears the properties in the config that should only be used in vendor
   * configs. This is needed because we pass in all the vendor requests as
   * inline config and iframePings/optout are not allowed to be used without
   * AMP team's approval.
   *
   * @param {!JsonObject} config The inline config to update.
   * @return {!JsonObject}
   */
  function clearVendorOnlyConfig(config) {
    for (const t in config.triggers) {
      if (config.triggers[t].iframePing) {
        config.triggers[t].iframePing = undefined;
      }
    }
    if (config.optout) {
      config.optout = undefined;
    }
    return config;
  }

  describe('vendor request tests', () => {
    const actualResults = {};
    for (const vendor in ANALYTICS_CONFIG) {
      const config = ANALYTICS_CONFIG[vendor];
      if (!config.requests) {
        continue;
      }
      actualResults[vendor] = {};
      describe('analytics vendor: ' + vendor, function() {
        beforeEach(() => {
          // Remove all the triggers to prevent unwanted requests, for instance
          // one from a "visible" trigger. Those unwanted requests are a source
          // of test flakiness. Especially they will alternate value of var
          // $requestCount.
          config.triggers = {};
        });

        for (const name in config.requests) {
          it('should produce request: ' + name +
              '. If this test fails update vendor-requests.json', function* () {
            const urlReplacements =
                Services.urlReplacementsForDoc(ampdoc);
            const analytics = getAnalyticsTag(clearVendorOnlyConfig(config));
            sandbox.stub(urlReplacements.getVariableSource(), 'get').callsFake(
                function(name) {
                  expect(this.replacements_).to.have.property(name);

                  const defaultValue = `_${name.toLowerCase()}_`;
                  const extraMapping = VENDOR_REQUESTS[vendor][name];
                  return {
                    sync: paramName => {
                      if (!extraMapping ||
                        extraMapping[paramName] === undefined) {
                        return defaultValue;
                      }
                      return extraMapping[paramName];
                    },
                  };
                });

            const variables = variableServiceFor(ampdoc.win);
            const {encodeVars} = variables;
            sandbox.stub(variables, 'encodeVars').callsFake(
                function(name, val) {
                  val = encodeVars.call(this, name, val);
                  if (val == '') {
                    return '$' + name;
                  }
                  return val;
                });
            analytics.createdCallback();
            analytics.buildCallback();
            yield analytics.layoutCallback();

            // Wait for event queue to clear and reset sendRequestSpy
            // to avoid pageView pings.
            yield macroTask();
            sendRequestSpy.resetHistory();
            postMessageSpy.resetHistory();


            analytics.handleEvent_({
              request: name,
            }, {
              vars: Object.create(null),
            });
            yield macroTask();
            expect(sendRequestSpy).to.be.calledOnce;
            const url = sendRequestSpy.args[0][0];

            expect(sendRequestSpy).to.be.calledOnce;
            const vendorData = VENDOR_REQUESTS[vendor];
            if (!vendorData) {
              throw new Error('Add vendor ' + vendor +
                  ' to vendor-requests.json');
            }
            const val = vendorData[name];
            if (val == '<ignore for test>') {
              return;
            }
            if (val == null) {
              throw new Error('Define ' + vendor + '.' + name +
                  ' in vendor-requests.json. Expected value: ' + url);
            }
            actualResults[vendor][name] = url;
            // Write this out for easy copy pasting.
            // top.document.documentElement.setAttribute('json',
            //     JSON.stringify(actualResults, null, '  '));
            expect(url).to.equal(val);
          });
        }
      });
    }
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

  it('sends a basic hit', function() {
    const analytics = getAnalyticsTag(trivialConfig);

    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.withArgs('https://example.com/bar').calledOnce)
          .to.be.true;
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
    sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');

    return waitForNoSendRequest(analytics).then(() => {
      expect(sendRequestSpy).to.have.not.been.called;
    });
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
    return waitForNoSendRequest(analytics).then(() => {
      expect(sendRequestSpy).to.have.not.been.called;
    });
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
        sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');

        return waitForNoSendRequest(analytics).then(() => {
          expect(sendRequestSpy).to.have.not.been.called;
        });
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
    sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');

    return waitForNoSendRequest(analytics).then(() => {
      expect(sendRequestSpy).to.have.not.been.called;
    });
  });

  it('does not send a hit when request is not provided', function() {
    expectAsyncConsoleError(onAndRequestAttributesError);
    const analytics = getAnalyticsTag({
      'requests': {'foo': 'https://example.com/bar'},
      'triggers': [{'on': 'visible'}],
    });

    return waitForNoSendRequest(analytics).then(() => {
      expect(sendRequestSpy).to.have.not.been.called;
    });
  });

  describe('parentPostMessage in inabox case', () => {
    it('does send a hit when parentPostMessage is provided inabox', function() {
      env.win.AMP_MODE.runtime = 'inabox';
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/bar'},
        'triggers': [{'on': 'visible', 'parentPostMessage': 'foo'}],
      });
      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
        expect(postMessageSpy).to.have.been.called;
      });
    });

    it('does not send with parentPostMessage not inabox', function() {
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/bar'},
        'triggers': [{'on': 'visible',
          'request': 'foo',
          'parentPostMessage': 'foo'}],
      });
      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.been.called;
        expect(postMessageSpy).to.have.not.been.called;
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
          return waitForNoSendRequest(analytics).then(() => {
            expect(sendRequestSpy).to.have.not.been.called;
          });
        });

    it('send when request and parentPostMessage are provided', function() {
      env.win.AMP_MODE.runtime = 'inabox';
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/bar'},
        'triggers': [{'on': 'visible',
          'parentPostMessage': 'bar',
          'request': 'foo'}],
      });
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.be.calledOnce;
        expect(sendRequestSpy.args[0][0])
            .to.equal('https://example.com/bar');
        expect(postMessageSpy).to.have.been.called;
      });
    });
  });

  it('does not send a hit when request type is not defined', function() {
    expectAsyncConsoleError(noRequestStringsError);
    const analytics = getAnalyticsTag({
      'triggers': [{'on': 'visible', 'request': 'foo'}],
    });
    const spy = sandbox.spy(analytics, 'expandAndSendRequest_');

    return waitForNoSendRequest(analytics).then(() => {
      expect(spy).to.have.not.been.called;
      expect(sendRequestSpy).to.have.not.been.called;
    });
  });

  it('expands nested requests', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo':
        'https://example.com/bar&${foobar}&baz', 'foobar': 'f1'},
      'triggers': [{'on': 'visible', 'request': 'foo'}],
    });
    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0])
          .to.equal('https://example.com/bar&f1&baz');
    });
  });

  it('expands nested requests (3 levels)', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo':
        'https://example.com/bar&${foobar}', 'foobar': '${baz}', 'baz': 'b1'},
      'triggers': [{'on': 'visible', 'request': 'foo'}],
    });

    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/bar&b1');
    });
  });

  it('should tolerate invalid triggers', function() {
    const analytics = getAnalyticsTag();
    allowConsoleError(() => { expect(() => {
      // An incomplete click request.
      analytics.addTriggerNoInline_({'on': 'click'});
    }).to.throw(/Failed to process trigger/); });
  });

  it('expands recursive requests', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': '/bar&${foobar}&baz', 'foobar': '${foo}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}],
    });

    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0])
          .to.equal('/bar&/bar&/bar&&baz&baz&baz');
    });
  });

  it('sends multiple requests per trigger', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo':
        'https://example.com/bar&${foobar}', 'foobar': '${baz}', 'baz': 'b1'},
      'triggers': [{'on': 'visible', 'request': ['foo', 'foobar', 'foo2']}],
    });

    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.calledTwice).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/bar&b1');
      expect(sendRequestSpy.args[1][0]).to.equal('b1');
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
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(decodeURIComponent(sendRequestSpy.args[0][0])).to.equal('https://example.com/bar&ids=HTML_ATTR(div,id)');
    });
  });

  it('fills cid', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': 'https://example.com/cid=${clientId(analytics-abc)}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}],
    });

    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.match(/cid=[a-zA-Z\-]+/);
      expect(sendRequestSpy.args[0][0]).to.not.equal(
          'https://example.com/cid=CLIENT_ID(analytics-abc)');
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
      expect(sendRequestSpy).to.be.calledTwice;
      const timerRequest = sendRequestSpy.args[0][0];
      const visibleRequest = sendRequestSpy.args[1][0];
      expect(visibleRequest).to.equal('https://e.com/totalVisibleTime=0');
      expect(timerRequest).to.match(/duration=0/);
      expect(timerRequest).to.not.match(/start=0/);
      expect(timerRequest).to.match(/start=[0-9]+&duration/);
    });
  });

  describe('expand variables', () => {
    it('expands trigger vars', () => {
      const analytics = getAnalyticsTag({
        'requests': {'pageview':
          'https://example.com/test1=${var1}&test2=${var2}'},
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            'var1': 'x',
            'var2': 'test2',
          },
        }]});
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/test1=x&test2=test2');
      });
    });

    it('expands config vars', () => {
      const analytics = getAnalyticsTag({
        'vars': {
          'var1': 'x',
          'var2': 'test2',
        },
        'requests': {'pageview':
          'https://example.com/test1=${var1}&test2=${var2}'},
        'triggers': [{'on': 'visible', 'request': 'pageview'}]});
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/test1=x&test2=test2');
      });
    });

    it('expands platform vars', () => {
      const analytics = getAnalyticsTag({
        'requests': {'pageview':
          'https://example.com/title=${title}&ref=${documentReferrer}'},
        'triggers': [{'on': 'visible', 'request': 'pageview'}]});
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/title=Test%20Title&' +
            'ref=http%3A%2F%2Flocalhost%3A9876%2Fcontext.html');
      });
    });

    it('expands url-replacements vars', function() {
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/AMPDOC_URL&TITLE'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      });
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.not.match(/AMPDOC_URL/);
      });
    });

    it('expands trigger vars with higher precedence' +
        'than config vars', () => {
      const analytics = getAnalyticsTag({
        'vars': {
          'var1': 'config1',
          'var2': 'config2',
        },
        'requests': {'pageview':
          'https://example.com/test1=${var1}&test2=${var2}'},
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            'var1': 'trigger1',
          }}]});
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/test1=trigger1&test2=config2');
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
        'requests': {'pageview':
          'https://example.com/test1=${title}&test2=${random}'},
        'triggers': [{'on': 'visible', 'request': 'pageview'}],
      });
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/test1=Test%20Title&test2=428');
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
          }}]});
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/test?c1=config%201&t1=trigger%3D1&' +
            'c2=config%262&t2=trigger%3F2');
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
        }]});
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/test?' +
            'c1=Config%2C%20The%20Barbarian,config%201&c2=config%262');
      });
    });

    it('expands url-replacements vars', () => {
      const analytics = getAnalyticsTag({
        'requests': {
          'pageview':
            'https://example.com/test1=${var1}&test2=${var2}&title=TITLE'},
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            'var1': 'x',
            'var2': 'DOCUMENT_REFERRER',
          },
        }]});
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/test1=x&' +
            'test2=http%3A%2F%2Flocalhost%3A9876%2Fcontext.html' +
            '&title=Test%20Title');
      });
    });

    it('expands complex vars', () => {
      const analytics = getAnalyticsTag({
        'requests': {
          'pageview': 'https://example.com/test1=${qp_foo}'},
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            'qp_foo': '${queryParam(foo)}',
          },
        }]});
      const urlReplacements =
          Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get').callsFake(
          function(name) {
            return {sync: param => {
              return '_' + name.toLowerCase() + '_' + param + '_';
            }};
          });

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/test1=_query_param_foo_');
      });
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

  describe('optout', () => {

    beforeEach(() => {
      sandbox.stub(AnalyticsConfig.prototype, 'loadConfig')
          .returns(Promise.resolve({
            'requests': {'foo': {
              baseUrl: 'https://example.com/bar',
            }},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
            'vars': {},
            'optout': 'foo.bar',
          }));
    });

    it('works for vendor config when optout returns false', function() {
      win['foo'] = {'bar': function() { return false; }};
      const analytics = getAnalyticsTag(trivialConfig, {'type': 'testVendor'});
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.withArgs('https://example.com/bar').calledOnce)
            .to.be.true;
      });
    });

    it('works for vendor config when optout returns false', function() {
      win['foo'] = {'bar': function() { return true; }};
      const analytics = getAnalyticsTag(trivialConfig, {'type': 'testVendor'});
      return waitForNoSendRequest(analytics);
    });

    it('works for vendor config when optout is not defined', function() {
      const analytics = getAnalyticsTag(trivialConfig, {'type': 'testVendor'});
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.withArgs('https://example.com/bar').calledOnce)
            .to.be.true;
      });
    });
  });

  describe('extraUrlParams', () => {
    function verifyRequest() {
      expect(sendRequestSpy.args[0][0]).to.have.string('v0=0');
      expect(sendRequestSpy.args[0][0]).to.have.string('v1=helloworld');
      expect(sendRequestSpy.args[0][0]).to.not.have.string('s.evar1');
      expect(sendRequestSpy.args[0][0]).to.not.have.string('s.evar0');
      expect(sendRequestSpy.args[0][0]).to.have.string('foofoo=baz');
    }
    let config;
    beforeEach(() => {
      config = {
        vars: {host: 'example.com', path: 'helloworld'},
        extraUrlParams:
            {'s.evar0': '0', 's.evar1': '${path}', 'foofoo': 'baz'},
        triggers: {trig: {'on': 'visible', 'request': 'foo'}},
      };
      config['requests'] = {'foo': 'https://${host}/${path}?a=b'};
    });

    it('are sent', () => {
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/helloworld?a=b&s.evar0=0&s.evar1=' +
            'helloworld&foofoo=baz');
      });
    });

    it('are renamed by extraUrlParamsReplaceMap', () => {
      config.extraUrlParamsReplaceMap = {'s.evar': 'v'};
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        verifyRequest();
      });
    });

    it('are supported at trigger level', () => {
      config.triggers.trig.extraUrlParams = {c: 'd', 's.evar': 'e'};
      config.extraUrlParamsReplaceMap = {'s.evar': 'v'};
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        verifyRequest();
        expect(sendRequestSpy.args[0][0]).to.have.string('c=d');
        expect(sendRequestSpy.args[0][0]).to.have.string('v=e');
      });
    });

    it('are supported as a var in URL', () => {
      config['requests'].foo =
          'https://${host}/${path}?${extraUrlParams}&a=b';
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/helloworld?s.evar0=0&s.evar1=helloworld' +
            '&foofoo=baz&a=b');
      });
    });

    it('work when the value is an array', () => {
      config.extraUrlParams = {'foo': ['0']};
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/helloworld?a=b&foo=0');
      });
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
      expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/magic');
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
      ]});
    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.calledTwice).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal('/test1=1');
      expect(sendRequestSpy.args[1][0]).to.equal('/test2=2');
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
        expect(sendRequestSpy).to.be.calledOnce;
      });
    });

    it('allows a request through based on url-replacements', () => {
      const config = getConfig(1);
      config.triggers.sampled.sampleSpec.sampleOn = '${pageViewId}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get').returns(0);
      sandbox.stub(crypto, 'uniform')
          .withArgs('0').returns(Promise.resolve(0.005));
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.be.calledOnce;
      });
    });

    it('does not allow a request through', () => {
      const analytics = getAnalyticsTag(getConfig(1));

      sandbox.stub(crypto, 'uniform').returns(Promise.resolve(0.1));
      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('works when sampleSpec is 100%', () => {
      const analytics = getAnalyticsTag(getConfig(100));

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.be.calledOnce;
      });
    });

    it('works when sampleSpec is 0%', () => {
      const analytics = getAnalyticsTag(getConfig(0));

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
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
        expect(sendRequestSpy).to.be.calledOnce;
      });
    });

    it('works for invalid threadhold (Infinity)', () => {
      expectAsyncConsoleError(invalidThresholdForSamplingError);
      const analytics = getAnalyticsTag(getConfig(Infinity));

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.be.calledOnce;
      });
    });

    it('works for invalid threadhold (NaN)', () => {
      expectAsyncConsoleError(invalidThresholdForSamplingError);
      const analytics = getAnalyticsTag(getConfig(NaN));

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.be.calledOnce;
      });
    });

    it('works for invalid threadhold (-1)', () => {
      expectAsyncConsoleError(invalidThresholdForSamplingError);
      const analytics = getAnalyticsTag(getConfig(-1));

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.be.calledOnce;
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
        expect(sendRequestSpy).to.be.calledOnce;
      });
    });

    it('allows a request based on a variable', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${foo}';
      config.triggers.conditional.vars.foo = 'bar';
      const analytics = getAnalyticsTag(config);

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.be.calledOnce;
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
        expect(sendRequestSpy).to.be.calledOnce;
      });
    });

    it('does not allow a request through', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '';
      const analytics = getAnalyticsTag(config);

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('does not allow a request through if a variable is missing', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${undefinedParam}';
      const analytics = getAnalyticsTag(config);

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('does not allow a request through if a request param is missing', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns(null);

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('does not allow a request through ' +
     'if a request param is falsey (0)', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: 0});

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('does not allow a request through ' +
    'if a request param is falsey (false)', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: false});

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('does not allow a request through ' +
     'if a request param is falsey (null)', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: null});

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('does not allow a request through ' +
     'if a request param is falsey (NaN)', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: NaN});

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('does not allow a request through ' +
     'if a request param is falsey (undefined)', () => {
      const config = getConfig();
      config.triggers.conditional.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get')
          .returns({sync: undefined});

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('allows a request based on a variable when enabled on tag level', () => {
      const config = getConfig();
      config.enabled = '${foo}';
      config.vars.foo = 'bar';
      const analytics = getAnalyticsTag(config);

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.be.calledOnce;
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
        expect(sendRequestSpy).to.be.calledOnce;
      });
    });

    it('does not allow a request through when enabled on tag level', () => {
      const config = getConfig();
      config.enabled = '';
      const analytics = getAnalyticsTag(config);

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('does not allow a request through if a variable is missing ' +
    'when enabled on tag level', () => {
      const config = getConfig();
      config.enabled = '${undefinedParam}';
      const analytics = getAnalyticsTag(config);

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('does not allow a request through if a request param is missing ' +
    'when enabled on tag level', () => {
      const config = getConfig();
      config.enabled = '${queryParam(undefinedParam)}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get').returns(null);

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
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

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
    });

    it('does not allow a request through if enabled on tag level ' +
    'but variable is missing on trigger level', () => {
      const config = getConfig();
      config.enabled = '${pageViewId}';
      config.triggers.conditional.enabled = '${foo}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = Services.urlReplacementsForDoc(analytics.element);
      sandbox.stub(urlReplacements.getVariableSource(), 'get').returns('page');

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.have.not.been.called;
      });
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
        expect(sendRequestSpy).to.be.calledOnce;
        expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/local');
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
        expect(sendRequestSpy).to.have.not.been.called;
      });
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

    it('expand nested requests with vendor provided value', () => {
      const analytics = getAnalyticsTag({
        'requests': {'foo':
          'https://example.com/bar&${clientId}&baz', 'clientId': 'c1'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      }, {
        'sandbox': 'true',
      }, true);
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0])
            .to.equal('https://example.com/bar&c1&baz');
      });
    });

    it('expand vendor vars but not replace non whitelist variables', () => {
      const analytics = getAnalyticsTag({
        'requests': {'pageview':
          'https://example.com/test1=${var1}&CLIENT_ID(analytics-abc)=${var2}'},
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'vars': {
            'var1': 'CLIENT_ID(analytics-abc)',
            'var2': 'test2',
          },
        }]}, {
        'sandbox': 'true',
      }, true);
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
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
      }, true);

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
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
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.match(/random=0.[0-9]/);
        expect(sendRequestSpy.args[0][0]).to.not.equal(
            'https://example.com/random=${random}');
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
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.match(/random=0.[0-9]/);
        expect(sendRequestSpy.args[0][0]).to.not.equal(
            'https://example.com/cid=${clientId}random=RANDOM');
        expect(sendRequestSpy.args[0][0]).to.includes(
            'https://example.com/cid=CLIENT_ID(analytics-abc)random=');
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
        expect(sendRequestSpy.calledOnce).to.be.true;
        expect(sendRequestSpy.args[0][0]).to.equal(
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
      sandbox.stub(urlReplacements.getVariableSource(), 'get').returns(0);
      sandbox.stub(crypto, 'uniform')
          .withArgs('0').returns(Promise.resolve(0.005))
          .withArgs('CLIENT_ID').returns(Promise.resolve(0.5));
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy).to.be.calledOnce;
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

  describe('resourceTiming', () => {
    // NOTE: The following tests verify plumbing for resource timing variables.
    // More tests for resource timing can be found in test-resource-timing.js.
    const newConfig = function() {
      return {
        'requests': {
          'pageview': 'https://ping.example.com/endpoint',
        },
        'triggers': [{
          'on': 'visible',
          'request': 'pageview',
          'extraUrlParams': {
            'rt': '${resourceTiming}',
          },
          'resourceTimingSpec': newResourceTimingSpec(),
        }],
      };
    };

    this.timeout(400);

    const runResourceTimingTest = function(entries, config, expectedPing) {
      sandbox.stub(win.performance, 'getEntriesByType').returns(entries);
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.args[0][0]).to.equal(expectedPing);
      });
    };

    it('should evaluate ${resourceTiming} to be empty by default', () => {
      return runResourceTimingTest(
          [], newConfig(), 'https://ping.example.com/endpoint?rt=');
    });

    it('should capture multiple matching resources', () => {
      const entry1 = newPerformanceResourceTiming(
          'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
          false);
      const entry2 = newPerformanceResourceTiming(
          'http://bar.example.com/lib.js', 'script', 700, 100, 80 * 1000, true);
      const config = newConfig();
      const trigger = config['triggers'][0];
      // Check precondition of responseAfter.
      expect(trigger['resourceTimingSpec']['responseAfter']).to.be.undefined;

      return runResourceTimingTest(
          [entry1, entry2], config,
          'https://ping.example.com/endpoint?rt=' +
              'foo_bar-script-100-500-7200~' +
              'foo_bar-script-700-100-0');

      // 'responseAfter' should be set to a positive number.
      expect(trigger['resourceTimingSpec']['responseAfter']).to.be.above(0);
    });

    it('should url encode variables', () => {
      const entry1 = newPerformanceResourceTiming(
          'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
          false);
      const entry2 = newPerformanceResourceTiming(
          'http://bar.example.com/lib.js', 'script', 700, 100, 80 * 1000, true);
      const config = newConfig();
      const spec = config['triggers'][0]['resourceTimingSpec'];
      spec['encoding']['entry'] = '${key}?${startTime},${duration}';
      spec['encoding']['delim'] = ':';
      return runResourceTimingTest(
          [entry1, entry2], config,
          'https://ping.example.com/endpoint?rt=' +
              'foo_bar%3F100%2C500%3Afoo_bar%3F700%2C100');
    });

    it('should ignore resourceTimingSpec outside of triggers', () => {
      const entry = newPerformanceResourceTiming(
          'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
          false);
      const config = newConfig();
      config['resourceTimingSpec'] =
          config['triggers'][0]['resourceTimingSpec'];
      delete config['triggers'][0]['resourceTimingSpec'];
      return runResourceTimingTest(
          [entry], config, 'https://ping.example.com/endpoint?rt=');
    });
  });
});
