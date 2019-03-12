/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {isProxyOrigin, parseUrlDeprecated} from '../../src/url-utils';

describe('parseUrlDeprecated', () => {

  const currentPort = location.port;

  function compareParse(url, result) {
    // Using JSON string comparison because Chai's deeply equal
    // errors are impossible to debug.
    const parsed = JSON.stringify(parseUrlDeprecated(url));
    const expected = JSON.stringify(result);
    expect(parsed).to.equal(expected);
  }

  it('should parse correctly', () => {
    compareParse('https://foo.com/abc?123#foo', {
      href: 'https://foo.com/abc?123#foo',
      protocol: 'https:',
      host: 'foo.com',
      hostname: 'foo.com',
      port: '',
      pathname: '/abc',
      search: '?123',
      hash: '#foo',
      origin: 'https://foo.com',
    });
  });
  it('caches results', () => {
    const url = 'https://foo.com:123/abc?123#foo';
    parseUrlDeprecated(url);
    const a1 = parseUrlDeprecated(url);
    const a2 = parseUrlDeprecated(url);
    expect(a1).to.equal(a2);
  });

  // TODO(#14349): unskip flaky test
  it.skip('caches up to 100 results', () => {
    const url = 'https://foo.com:123/abc?123#foo';
    const a1 = parseUrlDeprecated(url);

    // should grab url from the cache
    expect(a1).to.equal(parseUrlDeprecated(url));

    // cache 99 more urls in order to reach max capacity of LRU cache: 100
    for (let i = 0; i < 100; i++) {
      parseUrlDeprecated(`${url}-${i}`);
    }

    const a2 = parseUrlDeprecated(url);

    // the old cached url should not be in the cache anymore
    // the newer instance should
    expect(a1).to.not.equal(parseUrlDeprecated(url));
    expect(a2).to.equal(parseUrlDeprecated(url));
    expect(a1).to.not.equal(a2);
  });
  it('should handle ports', () => {
    compareParse('https://foo.com:123/abc?123#foo', {
      href: 'https://foo.com:123/abc?123#foo',
      protocol: 'https:',
      host: 'foo.com:123',
      hostname: 'foo.com',
      port: '123',
      pathname: '/abc',
      search: '?123',
      hash: '#foo',
      origin: 'https://foo.com:123',
    });
  });
  it('should omit HTTP default port', () => {
    compareParse('http://foo.com:80/abc?123#foo', {
      href: 'http://foo.com/abc?123#foo',
      protocol: 'http:',
      host: 'foo.com',
      hostname: 'foo.com',
      port: '',
      pathname: '/abc',
      search: '?123',
      hash: '#foo',
      origin: 'http://foo.com',
    });
  });
  it('should omit HTTPS default port', () => {
    compareParse('https://foo.com:443/abc?123#foo', {
      href: 'https://foo.com/abc?123#foo',
      protocol: 'https:',
      host: 'foo.com',
      hostname: 'foo.com',
      port: '',
      pathname: '/abc',
      search: '?123',
      hash: '#foo',
      origin: 'https://foo.com',
    });
  });
  it('should support http', () => {
    compareParse('http://foo.com:123/abc?123#foo', {
      href: 'http://foo.com:123/abc?123#foo',
      protocol: 'http:',
      host: 'foo.com:123',
      hostname: 'foo.com',
      port: '123',
      pathname: '/abc',
      search: '?123',
      hash: '#foo',
      origin: 'http://foo.com:123',
    });
  });
  it('should resolve relative urls', () => {
    compareParse('./abc?123#foo', {
      href: 'http://localhost:' + currentPort + '/abc?123#foo',
      protocol: 'http:',
      host: 'localhost:' + currentPort,
      hostname: 'localhost',
      port: currentPort,
      pathname: '/abc',
      search: '?123',
      hash: '#foo',
      origin: 'http://localhost:' + currentPort,
    });
  });
  it('should resolve path relative urls', () => {
    compareParse('/abc?123#foo', {
      href: 'http://localhost:' + currentPort + '/abc?123#foo',
      protocol: 'http:',
      host: 'localhost:' + currentPort,
      hostname: 'localhost',
      port: currentPort,
      pathname: '/abc',
      search: '?123',
      hash: '#foo',
      origin: 'http://localhost:' + currentPort,
    });
  });
  it('should handle URLs with just the domain', () => {
    compareParse('http://foo.com:123', {
      href: 'http://foo.com:123/',
      protocol: 'http:',
      host: 'foo.com:123',
      hostname: 'foo.com',
      port: '123',
      pathname: '/',
      search: '',
      hash: '',
      origin: 'http://foo.com:123',
    });
  });
  it('should parse origin https://twitter.com/path#abc', () => {
    expect(parseUrlDeprecated('https://twitter.com/path#abc').origin)
        .to.equal('https://twitter.com');
  });

  it('should parse origin data:12345', () => {
    expect(parseUrlDeprecated('data:12345').origin)
        .to.equal('data:12345');
  });
});

describe('isProxyOrigin', () => {

  function testProxyOrigin(href, bool) {
    it('should return that ' + href + (bool ? ' is' : ' is not') +
        ' a proxy origin', () => {
      expect(isProxyOrigin(parseUrlDeprecated(href))).to.equal(bool);
    });
  }

  // CDN
  testProxyOrigin(
      'https://cdn.ampproject.org/', true);
  testProxyOrigin(
      'http://cdn.ampproject.org/', false);
  testProxyOrigin(
      'https://cdn.ampproject.org.badguys.com/', false);
  testProxyOrigin(
      'https://cdn.ampproject.orgbadguys.com/', false);
  testProxyOrigin(
      'https://cdn.ampproject.org:1234', false);
  testProxyOrigin(
      'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0', true);
  testProxyOrigin(
      'https://cdn.ampproject.org/c/www.origin.com/foo/?f=0', true);

  // Prefixed CDN
  testProxyOrigin(
      'https://xyz.cdn.ampproject.org/', true);
  testProxyOrigin(
      'http://xyz.cdn.ampproject.org/', false);
  testProxyOrigin(
      'https://xyz-123.cdn.ampproject.org/', true);
  testProxyOrigin(
      'https://xyz.cdn.ampproject.org/v/www.origin.com/foo/?f=0', true);
  testProxyOrigin(
      'https://xyz.cdn.ampproject.org/c/www.origin.com/foo/?f=0', true);

  // Others
  testProxyOrigin(
      'http://localhost:123', false);
  testProxyOrigin(
      'https://cdn.ampproject.net/v/www.origin.com/foo/?f=0', false);
  testProxyOrigin('https://medium.com/swlh/nobody-wants-your-app-6af1f7f69cb7', false);
  testProxyOrigin(
      'http://www.spiegel.de/politik/deutschland/angela-merkel-a-1062761.html',
      false);
});

