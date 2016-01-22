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
import {getService} from '../../../../src/service';
import {markElementScheduledForTesting} from '../../../../src/custom-element';
import {installCidService} from '../../../../src/service/cid-impl';
import {installViewerService} from '../../../../src/service/viewer-impl';
import * as sinon from 'sinon';

adopt(window);

describe('amp-analytics', function() {

  let sandbox;
  let windowApi;
  let sendRequestSpy;

  const jsonMockResponses = {
    'config1': '{"vars": {"title": "remote"}}'
  };

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
    installViewerService(windowApi);
    installCidService(windowApi);
    getService(windowApi, 'xhr', () => {return {
      fetchJson: url => Promise.resolve(JSON.parse(jsonMockResponses[url]))
    };});
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
    analytics.createdCallback();
    sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');
    return analytics;
  }

  it('sends a basic hit', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': 'https://example.com/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.withArgs('https://example.com/bar').calledOnce)
          .to.be.true;
    });
  });

  it('does not send a hit when config is not in a script tag', function() {
    const config = JSON.stringify({
      'requests': {'foo': 'https://example.com/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });
    const el = document.createElement('amp-analytics');
    el.textContent = config;
    const analytics = new AmpAnalytics(el);
    sandbox.stub(analytics, 'getWin').returns(windowApi);
    analytics.createdCallback();
    sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
    });
  });

  it('does not send a hit when multiple child tags exist', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': 'https://example.com/bar'},
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
          'requests': {'foo': 'https://example.com/bar'},
          'triggers': [{'on': 'visible', 'request': 'foo'}]
        });
        el.appendChild(script);
        const analytics = new AmpAnalytics(el);
        sandbox.stub(analytics, 'getWin').returns(windowApi);
        analytics.createdCallback();
        sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');

        return analytics.layoutCallback().then(() => {
          expect(sendRequestSpy.callCount).to.equal(0);
        });
      });

  it('does not send a hit when request is not provided', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': 'https://example.com/bar'},
      'triggers': [{'on': 'visible'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
    });
  });

  it('does not send a hit when request type is not defined', function() {
    const analytics = getAnalyticsTag({
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.callCount).to.equal(0);
    });
  });

  it('expands nested requests', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo':
        'https://example.com/bar&${foobar}&baz', 'foobar': 'f1'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0])
        .to.equal('https://example.com/bar&f1&baz');
    });
  });

  it('expands nested requests', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo':
        'https://example.com/bar&${foobar}', 'foobar': '${baz}', 'baz': 'b1'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/bar&b1');
    });
  });

  it('expands recursive requests', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': '/bar&${foobar}&baz', 'foobar': '${foo}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0])
          .to.equal('/bar&/bar&/bar&&baz&baz&baz');
    });
  });

  it('fills cid for proxy host', function() {
    windowApi.localStorage = {
      getItem: function(unusedName) {
        return JSON.stringify({
          time: new Date().getTime(),
          cid: 'base'
        });
      },
    };
    windowApi.location.href = '/c/www.test.com/abc';
    const analytics = getAnalyticsTag({
      'requests': {'foo': 'https://example.com/cid=${clientId(analytics-abc)}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal(
         'https://example.comcid=uQVAtQyO978OPCNBZXWOKRDcxSORw9GQfB' +
          'x2CyJSF0MnkIPeeX9ruacSFPgQ0HSD');
    });
  });

  it('merges requests correctly', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': 'https://example.com/${bar}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    }, {'type': 'xyz'});

    analytics.predefinedConfig_ = {
      'xyz': {
        'requests': {'foo': '/bar', 'bar': 'foobar'}
      }
    };
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/foobar');
    });
  });

  it('merges objects correctly', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': 'https://example.com/bar'},
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
      'requests': {'pageview':
        'https://example.com/test1=${var1}&test2=${var2}'},
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
      expect(sendRequestSpy.args[0][0]).to.equal(
          'https://example.com/test1=x&test2=test2');
    });
  });

  it('expands config vars', () => {
    const analytics = getAnalyticsTag({
      'vars': {
        'var1': 'x',
        'var2': 'test2'
      },
      'requests': {'pageview':
        'https://example.com/test1=${var1}&test2=${var2}'},
      'triggers': [{'on': 'visible', 'request': 'pageview'}]});
    return analytics.layoutCallback().then(() => {
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
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal(
          'https://example.com/title=Test%20Title&' +
          'ref=https%3A%2F%2Fwww.google.com%2F');
    });
  });

  it('expands url-replacements vars', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': 'https://example.com/AMPDOC_URL&TITLE'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.not.match(/AMPDOC_URL/);
    });
  });


  it('expands trigger vars with higher precedence than config vars', () => {
    const analytics = getAnalyticsTag({
      'vars': {
        'var1': 'config1',
        'var2': 'config2'
      },
      'requests': {'pageview':
        'https://example.com/test1=${var1}&test2=${var2}'},
      'triggers': [{
        'on': 'visible',
        'request': 'pageview',
        'vars': {
          'var1': 'trigger1'
        }}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal(
          'https://example.com/test1=trigger1&test2=config2');
    });
  });

  it('expands config vars with higher precedence than platform vars', () => {
    const analytics = getAnalyticsTag({
      'vars': {'random': 428},
      'requests': {'pageview':
        'https://example.com/test1=${title}&test2=${random}'},
      'triggers': [{'on': 'visible', 'request': 'pageview',}]
    });
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal(
          'https://example.com/test1=Test%20Title&test2=428');
    });
  });

  it('does not expand nested vars', () => {
    const analytics = getAnalyticsTag({
      'requests': {'pageview': 'https://example.com/test=${var1}'},
      'triggers': [{
        'on': 'visible',
        'request': 'pageview',
        'vars': {
          'var1': '${var2}',
          'var2': 't2'
        }}]});
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.calledOnce).to.be.true;
      expect(sendRequestSpy.args[0][0]).to.equal(
          'https://example.com/test=%24%7Bvar2%7D');
    });
  });

  it('expands and encodes requests, config vars, and trigger vars', () => {
    const analytics = getAnalyticsTag({
      'vars': {
        'c1': 'config 1',
        'c2': 'config&2'
      },
      'requests': {
        'base': 'https://example.com/test?c1=${c1}&t1=${t1}',
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
      expect(sendRequestSpy.args[0][0]).to.equal(
          'https://example.com/test?c1=config%201&t1=trigger%3D1&' +
          'c2=config%262&t2=trigger%3F2');
    });
  });

  it('expands url-replacements vars', () => {
    const analytics = getAnalyticsTag({
      'requests': {'pageview':
        'https://example.com/test1=${var1}&test2=${var2}&title=TITLE'},
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
      expect(sendRequestSpy.args[0][0]).to.equal(
          'https://example.com/test1=x&test2=https%3A%2F%2Fwww.google.com%2F' +
          '&title=Test%20Title');
    });
  });

  it('respects optout', function() {
    const config = {
      'requests': {'foo': 'https://example.com/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}],
      'optout': 'foo.bar'
    };
    let analytics = getAnalyticsTag(config);
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.withArgs('https://example.com/bar').calledOnce)
          .to.be.true;
      sendRequestSpy.reset();
      windowApi['foo'] = {'bar': function() { return true; }};
      analytics = getAnalyticsTag(config);
      analytics.layoutCallback().then(() => {
        expect(sendRequestSpy.callCount).to.be.equal(0);
        sendRequestSpy.reset();
        windowApi['foo'] = {'bar': function() { return false; }};
        analytics = getAnalyticsTag(config);
        analytics.layoutCallback().then(() => {
          expect(sendRequestSpy.withArgs('https://example.com/bar').calledOnce)
              .to.be.true;
        });
      });
    });
  });

  it('fetches and merges remote config', () => {
    const analytics = getAnalyticsTag({
      'vars': {'title': 'local'},
      'requests': {'foo': 'https://example.com/${title}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    }, {
      'config': 'config1'
    });
    return analytics.layoutCallback().then(() => {
      expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/remote');
    });
  });
});
