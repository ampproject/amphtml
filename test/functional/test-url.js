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

import {parseUrl} from '../../src/url';

describe('url', () => {

  var currentPort = location.port;

  function compareParse(url, result) {
    // Using JSON string comparison because Chai's deeply equal
    // errors are impossible to debug.
    var parsed = JSON.stringify(parseUrl(url));
    var expected = JSON.stringify(result);
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
      origin: 'https://foo.com'
    });
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
      origin: 'https://foo.com:123'
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
      origin: 'http://foo.com:123'
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
      origin: 'http://localhost:' + currentPort
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
      origin: 'http://localhost:' + currentPort
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
      origin: 'http://foo.com:123'
    });
  });

});
