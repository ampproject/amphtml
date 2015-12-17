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

import {AmpAnalytics} from '../../../../build/all/v0/amp-analytics-0.1.max';
import {adopt} from '../../../../src/runtime';
import {markElementScheduledForTesting} from '../../../../src/service';
import {installCidService} from '../../../../src/service/cid-impl';
import * as sinon from 'sinon';

adopt(window);

describe('amp-analytics', function() {

  let sandbox;
  let windowApi;
  let sendRequestSpy;
  let sendRequestUsingImageSpy;
  let sendRequestUsingBeaconSpy;

  beforeEach(() => {
    markElementScheduledForTesting(window, 'amp-analytics');
    sandbox = sinon.sandbox.create();
    const WindowApi = function() {};
    windowApi = new WindowApi();
    windowApi.location = {hash: '', href: '/test/viewer'};
    windowApi.document = {
      createElement: document.createElement,
      title: 'Test Title',
      referrer: 'https://www.google.com/'
    };
    windowApi.Object = window.Object;
    markElementScheduledForTesting(windowApi, 'amp-analytics');
    installCidService(windowApi);
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
    windowApi = null;
    sendRequestSpy = null;
  });

  function getAnalyticsTag(config, attrs) {
    config = JSON.stringify(config);
    const el = document.createElement('amp-analytics');
    const script = document.createElement('script');
    script.textContent = config;
    script.setAttribute('type', 'application/json');
    el.appendChild(script);
    for (const k in attrs) {
      el.setAttribute(k, attrs[k]);
    }
    const analytics = new AmpAnalytics(el);
    sandbox.stub(analytics, 'getWin').returns(windowApi);
    analytics.isExperimentOn_ = () => true;
    analytics.createdCallback();
    sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');
    sendRequestUsingImageSpy = sandbox.spy(
        analytics, 'sendRequestUsingImage_');
    sendRequestUsingBeaconSpy = sandbox.spy(
        analytics, 'sendRequestUsingBeacon_');
    return analytics;
  }

  it('is blocked when experiment is off', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.isExperimentOn_ = () => false;
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
    });
  });

  it('sends a basic hit', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.withArgs({
        host: 'example.com', path: '', data: '/bar'}).calledOnce)
          .to.be.true;
    });
  });

  it('does not send a hit when config is not in a script tag', function() {
    const config = JSON.stringify({
      'host': 'example.com',
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });
    const el = document.createElement('amp-analytics');
    el.textContent = config;
    const analytics = new AmpAnalytics(el);
    sandbox.stub(analytics, 'getWin').returns(windowApi);
    analytics.isExperimentOn_ = () => true;
    analytics.createdCallback();
    sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
    });
  });

  it('does not send a hit when multiple child tags exist', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });
    const script2 = document.createElement('script');
    script2.setAttribute('type', 'application/json');
    analytics.element.appendChild(script2);
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
    });
  });

  it('does not send a hit when script tag does not have a type attribute',
      function() {
        const el = document.createElement('amp-analytics');
        const script = document.createElement('script');
        script.textContent = JSON.stringify({
          'host': 'example.com',
          'requests': {'foo': '/bar'},
          'triggers': [{'on': 'visible', 'request': 'foo'}]
        });
        el.appendChild(script);
        const analytics = new AmpAnalytics(el);
        sandbox.stub(analytics, 'getWin').returns(windowApi);
        analytics.isExperimentOn_ = () => true;
        analytics.createdCallback();
        sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');

        return analytics.layoutCallback().then(() => {
          expect(sendRequestSpy.callCount).to.equal(0);
        });
      });

  it('does not send a hit when host is not provided', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.callCount).to.equal(1);
      expect(sendRequestUsingImageSpy.callCount).to.equal(0);
      expect(sendRequestUsingBeaconSpy.callCount).to.equal(0);
    });
  });

  it('does not send a hit when request is not provided', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
    });
  });

  it('does not send a hit when request type is not defined', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
    });
  });

  it('expands nested requests', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar&${foobar}&baz', 'foobar': 'f1'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0])
        .to.deep.equal({host: 'example.com', path: '', data: '/bar&f1&baz'});
    });
  });

  it('expands nested requests', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar&${foobar}', 'foobar': '${baz}', 'baz': 'b1'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal(
          {host: 'example.com', path: '', data: '/bar&b1'});
    });
  });

  it('expands recursive requests', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar&${foobar}&baz', 'foobar': '${foo}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: '/bar&/bar&/bar&&baz&baz&baz'});
    });
  });

  it('fills cid for proxy host', function() {
    windowApi.localStorage = {
      getItem: function(name) {
        return JSON.stringify({
          time: new Date().getTime(),
          cid: 'base'
        });
      },
    };
    windowApi.location.href = '/c/www.test.com/abc';
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': 'cid=${clientId(analytics-abc)}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: 'cid=uQVAtQyO978OPCNBZXWOKRDcxSORw9GQfB' +
          'x2CyJSF0MnkIPeeX9ruacSFPgQ0HSD'});
    });
  });

  it('merges host correctly', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    }, {'type': 'xyz'});

    analytics.predefinedConfig_ = {
      'xyz': {
        'host': 'example.com'
      }
    };
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: '/bar'});
    });
  });

  it('merges requests correctly', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/${bar}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    }, {'type': 'xyz'});

    analytics.predefinedConfig_ = {
      'xyz': {
        'requests': {'foo': '/bar', 'bar': 'foobar'}
      }
    };
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: '/foobar'});
    });
  });

  it('merges objects correctly', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

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
            'foobar': {'foobar': ['abc', 'def']}
          });
    });
  });

  it('expands trigger vars', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'pageview': '/test1=${var1}&test2=${var2}'},
      'triggers': [{
        'on': 'visible',
        'request': 'pageview',
        'vars': {
          'var1': 'x',
          'var2': 'test2'
        }
      }]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: '/test1=x&test2=test2'});
    });
  });

  it('expands config vars', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'vars': {
        'var1': 'x',
        'var2': 'test2'
      },
      'requests': {'pageview': '/test1=${var1}&test2=${var2}'},
      'triggers': [{'on': 'visible', 'request': 'pageview'}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: '/test1=x&test2=test2'});
    });
  });

  it('expands platform vars', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'pageview': '/title=${title}&ref=${documentReferrer}'},
      'triggers': [{'on': 'visible', 'request': 'pageview'}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: '/title=Test%20Title&ref=https%3A%2F%2Fwww.google.com%2F'});
    });
  });

  it('expands url-replacements vars', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/AMPDOC_URL&TITLE'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.not.match(/AMPDOC_URL/);
    });
  });


  it('expands trigger vars with higher precedence than config vars', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'vars': {
        'var1': 'config1',
        'var2': 'config2'
      },
      'requests': {'pageview': '/test1=${var1}&test2=${var2}'},
      'triggers': [{
        'on': 'visible',
        'request': 'pageview',
        'vars': {
          'var1': 'trigger1'
        }}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: '/test1=trigger1&test2=config2'});
    });
  });

  it('expands config vars with higher precedence than platform vars', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'vars': {'random': 428},
      'requests': {'pageview': '/test1=${title}&test2=${random}'},
      'triggers': [{'on': 'visible', 'request': 'pageview',}]
    });
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: '/test1=Test%20Title&test2=428'});
    });
  });

  it('does not expand nested vars', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'pageview': '/test=${var1}'},
      'triggers': [{
        'on': 'visible',
        'request': 'pageview',
        'vars': {
          'var1': '${var2}',
          'var2': 't2'
        }}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: '/test=%24%7Bvar2%7D'});
    });
  });

  it('expands and encodes requests, config vars, and trigger vars', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'vars': {
        'c1': 'config 1',
        'c2': 'config&2'
      },
      'requests': {
        'base': '/test?c1=${c1}&t1=${t1}',
        'pageview': '${base}&c2=${c2}&t2=${t2}'
      },
      'triggers': [{
        'on': 'visible',
        'request': 'pageview',
        'vars': {
          't1': 'trigger=1',
          't2': 'trigger?2'
        }}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: '/test?c1=config%201&t1=trigger%3D1&' +
          'c2=config%262&t2=trigger%3F2'});
    });
  });

  it('expands url-replacements vars', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'pageview': '/test1=${var1}&test2=${var2}&title=TITLE'},
      'triggers': [{
        'on': 'visible',
        'request': 'pageview',
        'vars': {
          'var1': 'x',
          'var2': 'DOCUMENT_REFERRER'
        }
      }]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.deep.equal({
        host: 'example.com',
        path: '',
        data: '/test1=x&test2=https%3A%2F%2Fwww.google.com%2F' +
          '&title=Test%20Title'});
    });
  });

  it('respects optout', function() {
    const config = {
      'host': 'example.com',
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}],
      'optout': 'foo.bar'
    };
    let analytics = getAnalyticsTag(config);
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.withArgs({
        host: 'example.com', path: '', data: '/bar'}).calledOnce).to.be.true;
      sendRequestSpy.reset();
      windowApi['foo'] = {'bar': function() { return true; }};
      analytics = getAnalyticsTag(config);
      analytics.layoutCallback().then(() => {
        expect(sendRequestSpy.callCount).to.be.equal(0);
        sendRequestSpy.reset();
        windowApi['foo'] = {'bar': function() { return false; }};
        analytics = getAnalyticsTag(config);
        analytics.layoutCallback().then(() => {
          expect(sendRequestSpy.withArgs({
            host: 'example.com', path: '', data: '/bar'}).calledOnce)
              .to.be.true;
        });
      });
    });
  });

  it('sends image requests when transport is not set', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'path': '/test',
      'requests': {'pageview': '?x=y'},
      'triggers': [{'on': 'visible', 'request': 'pageview'}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestUsingImageSpy.calledOnce).to.be.true;
      expect(sendRequestUsingImageSpy.args[0][0]).to.equal(
          'https://example.com/test?x=y');
      expect(sendRequestUsingBeaconSpy.callCount).to.be.equal(0);
    });
  });

  it('sends image requests when transport is image', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'path': '/test',
      'transport': 'image',
      'requests': {'pageview': '?x=y'},
      'triggers': [{'on': 'visible', 'request': 'pageview'}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestUsingImageSpy.calledOnce).to.be.true;
      expect(sendRequestUsingImageSpy.args[0][0]).to.equal(
          'https://example.com/test?x=y');
      expect(sendRequestUsingBeaconSpy.callCount).to.be.equal(0);
    });
  });

  it('sends beacon requests when transport is beacon', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'path': '/test',
      'transport': 'beacon',
      'requests': {'pageview': '?x=y'},
      'triggers': [{'on': 'visible', 'request': 'pageview'}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestUsingBeaconSpy.calledOnce).to.be.true;
      expect(sendRequestUsingBeaconSpy.args[0]).to.deep.equal([
        'https://example.com/test', '?x=y']);
      expect(sendRequestUsingImageSpy.callCount).to.be.equal(0);
    });
  });

  it('allows overriding host and path in a request', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'path': '/test',
      'transport': 'image',
      'requests': {
        'pageview': {
          host: 'test.com',
          path: '/other',
          data: '?x=y'
        }
      },
      'triggers': [{'on': 'visible', 'request': 'pageview'}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestUsingImageSpy.calledOnce).to.be.true;
      expect(sendRequestUsingImageSpy.args[0][0]).to.equal(
          'https://test.com/other?x=y');
    });
  });

  it('allows overriding host without path in a request', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'path': '/test',
      'transport': 'image',
      'requests': {
        'pageview': {
          host: 'test.com',
          data: '?x=y'
        }
      },
      'triggers': [{'on': 'visible', 'request': 'pageview'}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestUsingImageSpy.calledOnce).to.be.true;
      expect(sendRequestUsingImageSpy.args[0][0]).to.equal(
          'https://test.com/test?x=y');
    });
  });

  it('allows overriding path without host in a request', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'path': '/test',
      'transport': 'image',
      'requests': {
        'pageview': {
          path: '/other',
          data: '?x=y'
        }
      },
      'triggers': [{'on': 'visible', 'request': 'pageview'}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestUsingImageSpy.calledOnce).to.be.true;
      expect(sendRequestUsingImageSpy.args[0][0]).to.equal(
          'https://example.com/other?x=y');
    });
  });

  it('does not send a request if transport is unknown', () => {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'path': '/test',
      'transport': 'bus',
      'requests': {'pageview': '?x=y'},
      'triggers': [{'on': 'visible', 'request': 'pageview'}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestUsingImageSpy.callCount).to.be.equal(0);
      expect(sendRequestUsingBeaconSpy.callCount).to.be.equal(0);
    });
  });
});
