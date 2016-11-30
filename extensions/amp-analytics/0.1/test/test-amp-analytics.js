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
import {Crypto} from '../crypto-impl';
import {InstrumentationService} from '../instrumentation';
import {
  installUserNotificationManager,
} from '../../../amp-user-notification/0.1/amp-user-notification';
import {adopt} from '../../../../src/runtime';
import {createIframePromise} from '../../../../testing/iframe';
import {
  getService,
  resetServiceForTesting,
  fromClassForDoc,
} from '../../../../src/service';
import {markElementScheduledForTesting} from '../../../../src/custom-element';
import {installCidService,} from
    '../../../../extensions/amp-analytics/0.1/cid-impl';
import {urlReplacementsForDoc} from '../../../../src/url-replacements';
import * as sinon from 'sinon';

import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';


/* global require: false */
const VENDOR_REQUESTS = require('./vendor-requests.json');

adopt(window);

describe('amp-analytics', function() {

  let sandbox;
  let windowApi;
  let sendRequestSpy;
  let configWithCredentials;
  let uidService;
  let crypto;
  let ampdoc;
  let ins;

  const jsonMockResponses = {
    'config1': '{"vars": {"title": "remote"}}',
    'https://foo/Test%20Title': '{"vars": {"title": "magic"}}',
  };

  const trivialConfig = {
    'requests': {'foo': 'https://example.com/bar'},
    'triggers': [{'on': 'visible', 'request': 'foo'}],
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    configWithCredentials = false;
    return createIframePromise().then(iframe => {
      iframe.doc.title = 'Test Title';
      markElementScheduledForTesting(iframe.win, 'amp-analytics');
      markElementScheduledForTesting(iframe.win, 'amp-user-notification');
      installCidService(iframe.win);
      uidService = installUserNotificationManager(iframe.win);

      resetServiceForTesting(iframe.win, 'xhr');
      getService(iframe.win, 'xhr', () => {
        return {fetchJson: (url, init) => {
          expect(init.requireAmpResponseSourceOrigin).to.be.true;
          if (configWithCredentials) {
            expect(init.credentials).to.equal('include');
          } else {
            expect(init.credentials).to.undefined;
          }
          return Promise.resolve(JSON.parse(jsonMockResponses[url]));
        }};
      });


      resetServiceForTesting(iframe.win, 'crypto');
      crypto = new Crypto(iframe.win);
      getService(iframe.win, 'crypto', () => crypto);
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', './test-canonical.html');
      iframe.win.document.head.appendChild(link);
      windowApi = iframe.win;
      ampdoc = new AmpDocSingle(windowApi);

      ins = fromClassForDoc(
          ampdoc, 'amp-analytics-instrumentation', InstrumentationService);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getAnalyticsTag(config, attrs) {
    config = JSON.stringify(config);
    const el = windowApi.document.createElement('amp-analytics');
    const script = windowApi.document.createElement('script');
    script.textContent = config;
    script.setAttribute('type', 'application/json');
    el.appendChild(script);
    for (const k in attrs) {
      el.setAttribute(k, attrs[k]);
    }
    windowApi.document.body.appendChild(el);
    el.connectedCallback();
    const analytics = new AmpAnalytics(el);
    analytics.createdCallback();
    analytics.buildCallback();
    sendRequestSpy = sandbox.stub(analytics, 'sendRequest_');
    return analytics;
  }

  function waitForSendRequest(analytics, opt_max) {
    expect(analytics.element.style.display).to.equal('');
    return analytics.layoutCallback().then(() => {
      expect(analytics.element.style.display).to.equal('none');
      if (sendRequestSpy.callCount > 0) {
        return;
      }
      return new Promise(resolve => {
        const start = Date.now();
        const interval = setInterval(() => {
          const time = Date.now();
          if (sendRequestSpy.callCount > 0 ||
                  opt_max && (time - start) > opt_max) {
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
   * Clears the property in the config that indicates that the requests
   * should be sent via an iframe ping. This is needed because we pass
   * in all the vendor requests as inline config and iframePings are not
   * allowed to be used without AMP team's approval.
   *
   * @param {!JSONObject} config The inline config to update.
   * @return {!JSONObject}
   */
  function clearIframePing(config) {
    for (const t in config.triggers) {
      if (config.triggers[t].iframePing) {
        config.triggers[t].iframePing = undefined;
      }
    }
    return config;
  }

  it('sends a basic hit', function() {
    const analytics = getAnalyticsTag(trivialConfig);

    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.withArgs('https://example.com/bar').calledOnce)
          .to.be.true;
    });
  });

  describe('vendor request tests', () => {
    const actualResults = {};
    for (const vendor in ANALYTICS_CONFIG) {
      const config = ANALYTICS_CONFIG[vendor];
      if (!config.requests) {
        continue;
      }
      actualResults[vendor] = {};
      describe('analytics vendor: ' + vendor, function() {
        for (const name in config.requests) {
          it('should produce request: ' + name +
              '. If this test fails update vendor-requests.json', () => {
            const analytics = getAnalyticsTag(clearIframePing(config));
            analytics.createdCallback();
            analytics.buildCallback();
            const urlReplacements = urlReplacementsForDoc(
                analytics.win.document);
            sandbox.stub(urlReplacements.getVariableSource(), 'get',
              function(name) {
                expect(this.replacements_).to.have.property(name);
                return {sync: '_' + name.toLowerCase() + '_'};
              });
            const encodeVars = analytics.encodeVars_;
            sandbox.stub(analytics, 'encodeVars_', function(val, name) {
              val = encodeVars.call(this, val, name);
              if (val == '') {
                return '$' + name;
              }
              return val;
            });
            return analytics.layoutCallback().then(() => {
              return analytics.handleEvent_({
                request: name,
              }, {
                vars: Object.create(null),
              }).then(urls => {
                const url = urls[0];
                const val = VENDOR_REQUESTS[vendor][name];
                if (val == null) {
                  throw new Error('Define ' + vendor + '.' + name +
                      'in vendor-requests.json. Expected value: ' + url);
                }
                actualResults[vendor][name] = url;
                // Write this out for easy copy pasting.
                // top.document.documentElement.setAttribute('json',
                //     JSON.stringify(actualResults, null, '  '));
                expect(url).to.equal(val);
              });
            });
          });
        }
      });
    }
  });

  it('does not send a hit when config is not in a script tag', function() {
    const config = JSON.stringify(trivialConfig);
    const el = windowApi.document.createElement('amp-analytics');
    el.textContent = config;
    const analytics = new AmpAnalytics(el);
    windowApi.document.body.appendChild(el);
    el.connectedCallback();
    analytics.createdCallback();
    analytics.buildCallback();
    sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');

    return waitForNoSendRequest(analytics).then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
    });
  });

  it('does not send a hit when multiple child tags exist', function() {
    const analytics = getAnalyticsTag(trivialConfig);
    const script2 = document.createElement('script');
    script2.setAttribute('type', 'application/json');
    analytics.element.appendChild(script2);
    return waitForNoSendRequest(analytics).then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
    });
  });

  it('does not send a hit when script tag does not have a type attribute',
      function() {
        const el = windowApi.document.createElement('amp-analytics');
        const script = windowApi.document.createElement('script');
        script.textContent = JSON.stringify(trivialConfig);
        el.appendChild(script);
        windowApi.document.body.appendChild(el);
        const analytics = new AmpAnalytics(el);
        el.connectedCallback();
        analytics.createdCallback();
        analytics.buildCallback();
        sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');

        return waitForNoSendRequest(analytics).then(() => {
          expect(sendRequestSpy.callCount).to.equal(0);
        });
      });

  it('does not send a hit when request is not provided', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': 'https://example.com/bar'},
      'triggers': [{'on': 'visible'}],
    });

    return waitForNoSendRequest(analytics).then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
    });
  });

  it('does not send a hit when request type is not defined', function() {
    const analytics = getAnalyticsTag({
      'triggers': [{'on': 'visible', 'request': 'foo'}],
    });

    return waitForNoSendRequest(analytics).then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
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
      'triggers': [{'on': 'visible', 'request': ['foo', 'foobar']}],
    });

    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.calledTwice).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/bar&b1');
      expect(sendRequestSpy.args[1][0]).to.equal('b1');
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
    });
  });

  it('merges requests correctly', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': 'https://example.com/${bar}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}],
    }, {'type': 'xyz'});

    analytics.predefinedConfig_ = {
      'xyz': {
        'requests': {'foo': '/bar', 'bar': 'foobar'},
      },
    };
    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/foobar');
    });
  });

  it('merges objects correctly', function() {
    const analytics = getAnalyticsTag(trivialConfig);

    return analytics.layoutCallback().then(() => {
      expect(analytics.mergeObjects_({}, {})).to.deep.equal({});
      expect(analytics.mergeObjects_({'foo': 1}, {'1': 1}))
          .to.deep.equal({'foo': 1, '1': 1});
      expect(analytics.mergeObjects_({'1': 1}, {'bar': 'bar'}))
          .to.deep.equal({'1': 1, 'bar': 'bar'});
      expect(analytics.mergeObjects_(
          {'foo': [1, 2, 3, 4]},
          {'bar': [4, 5, 6, 7]}))
          .to.deep.equal(
              {'foo': [1,2, 3, 4], 'bar': [4, 5, 6, 7]});
      expect(analytics.mergeObjects_(
          null,
          {'foo': 'bar', 'baz': {'foobar': ['abc', 'def']}}))
          .to.deep.equal({'foo': 'bar', 'baz': {'foobar': ['abc', 'def']}});
      expect(analytics.mergeObjects_(
          undefined,
          {'foo': 'bar', 'baz': {'foobar': ['abc', 'def']}}))
          .to.deep.equal({'foo': 'bar', 'baz': {'foobar': ['abc', 'def']}});
      expect(analytics.mergeObjects_(
          {'baz': 'bar', 'foobar': {'foobar': ['abc', 'def']}},
          {'foo': 'bar', 'baz': {'foobar': ['abc', 'def']}}))
          .to.deep.equal({
            'foo': 'bar',
            'baz': 'bar',
            'foobar': {'foobar': ['abc', 'def']},
          });
    });
  });

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

  it('expands trigger vars with higher precedence than config vars', () => {
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

  it('expands element level vars with higher precedence than trigger vars',
    () => {
      const analytics = getAnalyticsTag();
      sandbox.stub(ins, 'isTriggerAllowed_').returns(true);
      const el1 = windowApi.document.createElement('div');
      el1.className = 'x';
      el1.dataset.varsTest = 'foo';
      ins.addListener(
        {'on': 'click', 'selector': '.x', 'vars': {'test': 'bar'}},
        function(arg) {
          expect(arg.vars.test).to.equal('foo');
        }, analytics.element);
      ins.onClick_({target: el1});
    });

  it('expands config vars with higher precedence than platform vars', () => {
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

  it('expands and encodes requests, config vars, and trigger vars', () => {
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
          'https://example.com/test?c1=Config%2C%20The%20Barbarian,config%201&c2=config%262');
    });
  });

  it('correctly encodes scalars and arrays', () => {
    const a = getAnalyticsTag();
    expect(a.encodeVars_('abc %&')).to.equal('abc%20%25%26');
    const array = ['abc %&', 'a b'];
    expect(a.encodeVars_(array)).to.equal('abc%20%25%26,a%20b');
    // Test non-inplace semantics but testing again.
    expect(a.encodeVars_(array)).to.equal('abc%20%25%26,a%20b');
  });

  it('expands url-replacements vars', () => {
    const analytics = getAnalyticsTag({
      'requests': {
        'pageview': 'https://example.com/test1=${var1}&test2=${var2}&title=TITLE'},
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
    const urlReplacements = urlReplacementsForDoc(analytics.win.document);
    sandbox.stub(urlReplacements.getVariableSource(), 'get',
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

  it('expands selector with config variable', () => {
    const addListenerSpy = sandbox.spy(ins, 'addListener');
    const analytics = getAnalyticsTag({
      requests: {foo: 'https://example.com/bar'},
      triggers: [{on: 'click', selector: '${foo}', request: 'foo'}],
      vars: {foo: 'bar'},
    });
    return waitForNoSendRequest(analytics).then(() => {
      expect(addListenerSpy.callCount).to.equal(1);
      expect(addListenerSpy.args[0][0]['selector']).to.equal('bar');
    });
  });

  function selectorExpansionTest(selector) {
    it('expand selector value: ' + selector, () => {
      const addListenerSpy = sandbox.spy(ins, 'addListener');
      const analytics = getAnalyticsTag({
        requests: {foo: 'https://example.com/bar'},
        triggers: [{on: 'click', selector: '${foo}, ${bar}', request: 'foo'}],
        vars: {foo: selector, bar: '123'},
      });
      return waitForNoSendRequest(analytics).then(() => {
        expect(addListenerSpy.callCount).to.equal(1);
        expect(addListenerSpy.args[0][0]['selector']).to
            .equal(selector + ', 123');
      });
    });
  }

  ['.clazz', 'a, div', 'a .foo', 'a #foo', 'a > div', 'div + p', 'div ~ ul',
    '[target=_blank]', '[title~=flower]', '[lang|=en]', 'a[href^="https"]',
    'a[href$=".pdf"]', 'a[href="w3schools"]', 'a:active', 'p::after',
    'p:first-child', 'p:lang(it)', ':not(p)', 'p:nth-child(2)']
        .map(selectorExpansionTest);

  it('does not expands selector with platform variable', () => {
    const addListenerSpy = sandbox.spy(ins, 'addListener');
    const analytics = getAnalyticsTag({
      requests: {foo: 'https://example.com/bar'},
      triggers: [{on: 'click', selector: '${title}', request: 'foo'}],
    });
    return waitForNoSendRequest(analytics).then(() => {
      expect(addListenerSpy.callCount).to.equal(1);
      expect(addListenerSpy.args[0][0]['selector']).to.equal('TITLE');
    });
  });

  it('respects optout', function() {
    const config = {
      'requests': {'foo': 'https://example.com/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}],
      'optout': 'foo.bar',
    };
    let analytics = getAnalyticsTag(config);
    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.withArgs('https://example.com/bar').calledOnce)
          .to.be.true;
      sendRequestSpy.reset();
      windowApi['foo'] = {'bar': function() { return true; }};
      analytics = getAnalyticsTag(config);
      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy.callCount).to.be.equal(0);
        sendRequestSpy.reset();
        windowApi['foo'] = {'bar': function() { return false; }};
        analytics = getAnalyticsTag(config);
        waitForSendRequest(analytics).then(() => {
          expect(sendRequestSpy.withArgs('https://example.com/bar').calledOnce)
              .to.be.true;
        });
      });
    });
  });

  describe('extraUrlParams', () => {
    let config;
    beforeEach(() => {
      config = {
        vars: {host: 'example.com', path: 'helloworld'},
        extraUrlParams: {'s.evar0': '0', 's.evar1': '${path}', 'foofoo': 'baz'},
        requests: {foo: 'https://${host}/${path}?a=b'},
        triggers: {trig: {'on': 'visible', 'request': 'foo'}},
      };
    });

    function verifyRequest() {
      expect(sendRequestSpy.args[0][0]).to.have.string('v0=0');
      expect(sendRequestSpy.args[0][0]).to.have.string('v1=helloworld');
      expect(sendRequestSpy.args[0][0]).to.not.have.string('s.evar1');
      expect(sendRequestSpy.args[0][0]).to.not.have.string('s.evar0');
      expect(sendRequestSpy.args[0][0]).to.have.string('foofoo=baz');
    }

    it('are sent', () => {
      const analytics = getAnalyticsTag(config);
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.args[0][0]).to.equal(
            'https://example.com/helloworld?a=b&s.evar0=0&s.evar1=helloworld' +
            '&foofoo=baz');
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
      config.requests.foo = 'https://${host}/${path}?${extraUrlParams}&a=b';
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

  it('fetches and merges remote config', () => {
    const analytics = getAnalyticsTag({
      'vars': {'title': 'local'},
      'requests': {'foo': 'https://example.com/${title}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}],
    }, {
      'config': 'config1',
    });
    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/remote');
    });
  });

  it('fetches and merges remote config with credentials', () => {
    configWithCredentials = true;
    const analytics = getAnalyticsTag({
      'vars': {'title': 'local'},
      'requests': {'foo': 'https://example.com/${title}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}],
    }, {
      'config': 'config1',
      'data-credentials': 'include',
    });
    return waitForSendRequest(analytics).then(() => {
      expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/remote');
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
        expect(sendRequestSpy.callCount).to.equal(1);
      });
    });

    it('allows a request through based on url-replacements', () => {
      const config = getConfig(1);
      config.triggers.sampled.sampleSpec.sampleOn = '${pageViewId}';
      const analytics = getAnalyticsTag(config);

      const urlReplacements = urlReplacementsForDoc(analytics.win.document);
      sandbox.stub(urlReplacements.getVariableSource(), 'get').returns(0);
      sandbox.stub(crypto, 'uniform')
          .withArgs('0').returns(Promise.resolve(0.005));
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.callCount).to.equal(1);
      });
    });

    it('does not allow a request through', () => {
      const analytics = getAnalyticsTag(getConfig(1));

      sandbox.stub(crypto, 'uniform').returns(Promise.resolve(0.1));
      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy.callCount).to.equal(0);
      });
    });

    it('works when sampleSpec is 100%', () => {
      const analytics = getAnalyticsTag(getConfig(100));

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.callCount).to.equal(1);
      });
    });

    it('works when sampleSpec is 0%', () => {
      const analytics = getAnalyticsTag(getConfig(0));

      return waitForNoSendRequest(analytics).then(() => {
        expect(sendRequestSpy.callCount).to.equal(0);
      });
    });

    it('works when sampleSpec is incomplete', () => {
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
        expect(sendRequestSpy.callCount).to.equal(1);
      });
    });

    it('works for invalid threadhold (Infinity)', () => {
      const analytics = getAnalyticsTag(getConfig(Infinity));

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.callCount).to.equal(1);
      });
    });

    it('works for invalid threadhold (NaN)', () => {
      const analytics = getAnalyticsTag(getConfig(NaN));

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.callCount).to.equal(1);
      });
    });

    it('works for invalid threadhold (-1)', () => {
      const analytics = getAnalyticsTag(getConfig(-1));

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.callCount).to.equal(1);
      });
    });
  });

  describe('expandTemplate_', () => {
    const vars = {
      'vars': {'1': '1${2}', '2': '2${3}', '3': '3${4}', '4': '4${1}'}};
    let analytics;

    beforeEach(() => {
      analytics = getAnalyticsTag(trivialConfig);
    });

    it('expands nested vars', () => {
      const actual = analytics.expandTemplate_('${1}', vars);
      expect(actual).to.equal('123%252524%25257B4%25257D');
    });

    it('limits the recursion to n', () => {
      let actual = analytics.expandTemplate_('${1}', vars, {}, 3);
      expect(actual).to.equal('1234%25252524%2525257B1%2525257D');

      actual = analytics.expandTemplate_('${1}', vars, {}, 5);
      expect(actual).to.equal('123412%252525252524%25252525257B3%25252525257D');
    });

    it('works with complex params (1)', () => {
      const vars = {'vars': {'fooParam': 'QUERY_PARAM(foo,bar)'}};
      const actual = analytics.expandTemplate_('${fooParam}', vars);
      expect(actual).to.equal('QUERY_PARAM(foo,bar)');
    });

    it('works with complex params (2)', () => {
      const vars = {'vars': {'fooParam': 'QUERY_PARAM'}};
      const actual = analytics.expandTemplate_('${fooParam(foo,bar)}', vars);
      expect(actual).to.equal('QUERY_PARAM(foo,bar)');
    });
  });

  describe('iframePing', () => {
    it('fails for iframePing config outside of vendor config', function() {
      const analytics = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/bar'},
        'triggers': [{'on': 'visible', 'iframePing': true}],
      });
      return expect(waitForNoSendRequest(analytics)).to.be
          .rejectedWith(
              /iframePing config is only available to vendor config/);
    });

    it('succeeds for iframePing config in vendor config', function() {
      const analytics = getAnalyticsTag({}, {'type': 'testVendor'});
      const url = 'http://iframe.localhost:9876/test/' +
              'fixtures/served/iframe.html?title=${title}';
      analytics.predefinedConfig_.testVendor = {
        'requests': {
          'pageview': url,
        },
        'triggers': {
          'pageview': {
            'on': 'visible',
            'request': 'pageview',
            'iframePing': true,
          },
        },
      };
      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.callCount).to.equal(1);
        expect(sendRequestSpy.args[0][1]['iframePing']).to.be.true;
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

      sandbox.stub(uidService, 'get', id => {
        expect(id).to.equal('amp-user-notification1');
        return Promise.resolve();
      });

      return waitForSendRequest(analytics).then(() => {
        expect(sendRequestSpy.callCount).to.equal(1);
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

      sandbox.stub(uidService, 'get', id => {
        expect(id).to.equal('amp-user-notification1');
        return Promise.reject();
      });
      return analytics.layoutCallback().then(() => {
        throw new Error('Must never be here');
      }, () => {
        expect(sendRequestSpy.callCount).to.equal(0);
      });
    });
  });
});
