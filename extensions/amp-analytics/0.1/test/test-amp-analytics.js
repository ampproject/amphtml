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
import * as sinon from 'sinon';

adopt(window);

describe('amp-analytics', function() {

  let sandbox;
  let windowApi;
  let sendRequestSpy;

  beforeEach(() => {
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
    el.textContent = config;
    for (const k in attrs) {
      el.setAttribute(k, attrs[k]);
    }
    const analytics = new AmpAnalytics(el);
    sandbox.stub(analytics, 'getWin').returns(windowApi);
    analytics.isExperimentOn_ = () => true;
    analytics.createdCallback();
    sendRequestSpy = sandbox.spy(analytics, 'sendRequest_');
    return analytics;
  }

  it('is blocked when experiment is off', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.isExperimentOn_ = () => false;
    analytics.buildCallback();
    expect(sendRequestSpy.callCount).to.equal(0);
  });

  it('sends a basic hit', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.buildCallback();
    expect(sendRequestSpy.withArgs('https://example.com/bar').calledOnce).to.be.true;
  });

  it('does not send a hit when host is not provided', function() {
    const analytics = getAnalyticsTag({
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.buildCallback();
    expect(sendRequestSpy.callCount).to.equal(0);
  });

  it('does not send a hit when request is not provided', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible'}]
    });

    analytics.buildCallback();
    expect(sendRequestSpy.callCount).to.equal(0);
  });

  it('does not send a hit when request type is not defined', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.buildCallback();
    expect(sendRequestSpy.callCount).to.equal(0);
  });

  it('expands nested requests', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar&${foobar}&baz', 'foobar': 'f1'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0])
        .to.equal('https://example.com/bar&f1&baz');
  });

  it('expands nested requests', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar&${foobar}', 'foobar': '${baz}', 'baz': 'b1'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/bar&b1');
  });

  it('expands recursive requests', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar&${foobar}&baz', 'foobar': '${foo}'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0])
        .to.equal('https://example.com/bar&/bar&/bar&&baz&baz&baz');
  });

  it('fills in the platform variables', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/AMPDOC_URL&TITLE'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0]).to.not.match(/AMPDOC_URL/);
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
    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/bar');
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
    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0]).to.equal('https://example.com/foobar');
  });

  it('merges objects correctly', function() {
    const analytics = getAnalyticsTag({
      'host': 'example.com',
      'requests': {'foo': '/bar'},
      'triggers': [{'on': 'visible', 'request': 'foo'}]
    });

    analytics.buildCallback();
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
    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0]).to.equal(
        'https://example.com/test1=x&test2=test2');
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
    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0]).to.equal(
        'https://example.com/test1=x&test2=test2');
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
    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0]).to.equal(
        'https://example.com/test1=trigger1&test2=config2');
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
    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0]).to.equal(
        'https://example.com/test=%24%7Bvar2%7D');
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
    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0]).to.equal(
        'https://example.com/test?c1=config%201&t1=trigger%3D1&' +
        'c2=config%262&t2=trigger%3F2');
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
    analytics.buildCallback();
    expect(sendRequestSpy.calledOnce).to.be.true;
    expect(sendRequestSpy.args[0][0]).to.equal(
        'https://example.com/test1=x&test2=https%3A%2F%2Fwww.google.com%2F' +
        '&title=Test%20Title');
  });

});
