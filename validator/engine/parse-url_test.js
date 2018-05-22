/**
 * @license
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
 * limitations under the license.
 */
goog.provide('parse_url.ParseURLTest');

goog.require('parse_url.URL');

/**
 * A strict comparison between two values that does not truncate the
 * error messages and works well with the closure compiler.
 * @param {*} expected
 * @param {*} saw
 */
function assertStrictEqual(expected, saw) {
  assert.ok(expected === saw, 'expected: ' + expected + ' saw: ' + saw);
}

describe('parse_url', () => {
  it('ignores leading/trailing spaces', () => {
    let urlString = ' foo:bar ';
    let url = new parse_url.URL(urlString);
    assertStrictEqual('foo', url.protocol);

    urlString = '\nfoo:bar';
    url = new parse_url.URL(urlString);
    assertStrictEqual('foo', url.protocol);

    urlString = 'foo:bar\t \r';
    url = new parse_url.URL(urlString);
    assertStrictEqual('foo', url.protocol);
  });

  it('ignores Tab/CR/LF bytes', () => {
    const urlString = ' f\ro\to\n:bar ';
    const url = new parse_url.URL(urlString);
    assertStrictEqual('foo', url.protocol);
  });

  it('parses simple protocols', () => {
    let urlString = 'http://example.com/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual('http', url.protocol);

    urlString = 'https://example.com/';
    url = new parse_url.URL(urlString);
    assertStrictEqual('https', url.protocol);
  });

  it('parses with missing protocol', () => {
    const urlString = 'example.com';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual(false, url.hasProtocol);
    assertStrictEqual(url.defaultProtocol, url.protocol);
    assertStrictEqual('', url.host); // example.com is a relative path
  });

  it('parses with invalid protocol characters', () => {
    const urlString = 'foo bar:baz';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.hasProtocol);
    assertStrictEqual('https', url.protocol);
  });

  it('parses with utf8 protocol characters', () => {
    const urlString = '⚡:amp';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.hasProtocol);
    assertStrictEqual('https', url.protocol);
  });

  it('parses protocol with non-alpha protocol characters', () => {
    const urlString = 'foo+bar-baz:baz';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.hasProtocol);
    assertStrictEqual('foo+bar-baz', url.protocol);
  });

  it('parses uncommon protocols, but not URLs', () => {
    const urlString = 'whatsapp:i have no idea what this should contain';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.hasProtocol);
    assertStrictEqual('whatsapp', url.protocol);
    assertStrictEqual('i have no idea what this should contain',
        url.schemeSpecificPart);
  });

  it('parses basic login', () => {
    const urlString = 'https://user:password@example.com/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual('user:password', url.login);
  });

  it('parses login with ipv6 host that has colons to confuse things', () => {
    const urlString = 'https://user:password@[2001:0db8::85a3]/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual('user:password', url.login);
  });

  it('parses login with ipv6 host and [ character in password', () => {
    const urlString = 'https://user:pas[word@[2001:0db8::85a3]/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual('user:pas[word', url.login);
  });

  it('parses login with port to confuse things', () => {
    const urlString = 'https://user:password@example.com:8000/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual('user:password', url.login);
  });

  it('parses login with @ to confuse things', () => {
    const urlString = 'https://user:p@ssword@example.com/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual('user:p@ssword', url.login);
  });

  it('parses login with : to confuse things', () => {
    const urlString = 'https://user:passwo:d@example.com/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual('user:passwo:d', url.login);
  });

  it('parses valid IPv6 hostname', () => {
    for (const urlString of [
      'https://[2001:0db8::85a3]/',
      'https://[::1]/',
      'https://[::]/',
      'https://[0:0:0:0:0:0:0:1]/',
      'https://[0:0:0:0:0:0:8.8.8.8]/',
      'https://[0:0:0:0:0:0:8.124.8.8]/',
      'https://[0:0:0:0:0:0:8.8.8.22]/',
      'https://[::8.8.8.8]/']) {
      const url = new parse_url.URL(urlString);
      assert.ok(url.isValid, 'Expected ' + urlString + ' to be valid.');
    }
  });

  it('fails on invalid IPv6 hostname', () => {
    for (const urlString of [
      'https://[2001:0db8:85a3]/',
      'https://[20012:0db8::85a3]/',
      'https://[200g:0db8:85a3]/',
      'https://[:::1]/',
      'https://[0:0:0:0:0:0:1]/',
      'https://[0:0:0:0:0:0:0:0:1]/',
      'https://[0:0:0:0:0:0:8.8.8.1024]/',
      'https://[0:0:0:0:0:0:8.8.8]/',
      'https://[0:0:0:0:0:0:8.8.8.8.8]/',
      'https://[0:0:0:0:0:0:0:8.8.8.8]/',
      'https://[0:0:0:0:0:8.8.8.8]/',
      'https://[0:0:0:0:0:8.8.8.8:1]/']) {
      const url = new parse_url.URL(urlString);
      assert.ok(!url.isValid, 'Expected ' + urlString + ' to be invalid.');
    }
  });

  it('fails on invalid port characters', () => {
    const urlString = 'https://example.com:123abc/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it('fails on port with decimal', () => {
    const urlString = 'https://example.com:80.0/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it('fails on port with negative', () => {
    const urlString = 'https://example.com:-80/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it('allows high port values', () => {
    const urlString = 'https://example.com:65535/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual(65535, url.port);
  });

  it('fails on invalid port values', () => {
    const urlString = 'https://example.com:65536/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it('parses empty port strings', () => {
    const urlString = 'https://example.com:/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual(443, url.port);
  });

  it('replaces 0 port with default port', () => {
    const urlString = 'http://example.com:0/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual(80, url.port);
  });

  it('fails on invalid character ! in hostname', () => {
    const urlString = 'http://example!.com/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it('fails on invalid character 0x10 in hostname', () => {
    const urlString = 'http://example\x10.com/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it('fails on invalid character & in hostname', () => {
    const urlString = 'http://example.com&/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it('fails on invalid characters in hostname', () => {
    const urlString = 'http://example!.com/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it('fails on invalid utf8 percent-escape in hostname', () => {
    const urlString = 'http://example-%FF.com/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it('fails on dot host', () => {
    const urlString = 'http://./';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it('fails on host with consecutive dots', () => {
    const urlString = 'http://example..com/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it('strips trailing . from host', () => {
    const urlString = 'http://example.com./';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual('example.com', url.host);
  });

  it('accepts relative urls', () => {
    const urlString = '/foo';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
  });

  it('parses relative URL with : character', () => {
    const urlString = '/image:foo.jpg-bar';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual(false, url.hasProtocol);
  });

  it('accepts utf8 characters in hostname', () => {
    const urlString = 'http://⚡.com/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual('⚡.com', url.host);
  });

  it('rejects http://', () => {
    const urlString = 'http://';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
    assertStrictEqual('', url.host);
  });

  it('rejects http:/// (empty host)', () => {
    const urlString = 'http:///';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
    assertStrictEqual('', url.host);
  });

  it('accepts \\x10 in hostname', () => {
    const urlString = 'http://example.com\\x10.com/';
    const url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual('example.com', url.host);
  });

});
