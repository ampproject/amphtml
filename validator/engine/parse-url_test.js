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
    let urlString = ' f\ro\to\n:bar ';
    let url = new parse_url.URL(urlString);
    assertStrictEqual('foo', url.protocol);
  });

  it ('parses simple protocols',  () => {
    let urlString = 'http://example.com/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual('http', url.protocol);

    urlString = 'https://example.com/';
    url = new parse_url.URL(urlString);
    assertStrictEqual('https', url.protocol);
  });

  it ('parses with missing protocol', () => {
    let urlString = 'example.com';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual(false, url.hasProtocol);
    assertStrictEqual(url.defaultProtocol, url.protocol);
    assertStrictEqual('', url.host);  // example.com is a relative path
  });

  it ('parses with invalid protocol characters',  () => {
    let urlString = 'foo bar:baz';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.hasProtocol);
    assertStrictEqual('https', url.protocol);
  });

  it ('parses with utf8 protocol characters',  () => {
    let urlString = '⚡:amp';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.hasProtocol);
    assertStrictEqual('https', url.protocol);
  });

  it ('parses protocol with non-alpha protocol characters', () => {
    let urlString = 'foo+bar-baz:baz';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.hasProtocol);
    assertStrictEqual('foo+bar-baz', url.protocol);
  });

  it ('parses uncommon protocols, but not URLs', () => {
    let urlString = 'whatsapp:i have no idea what this should contain';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.hasProtocol);
    assertStrictEqual('whatsapp', url.protocol);
    assertStrictEqual('i have no idea what this should contain',
        url.schemeSpecificPart);
  });

  it ('parses basic login', () => {
    let urlString = 'https://user:password@example.com/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual('user:password', url.login);
  });

  it ('parses login with ipv6 host that has colons to confuse things', () => {
    let urlString = 'https://user:password@[2001:0db8:85a3]/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual('user:password', url.login);
  });

  it ('parses login with ipv6 host and [ character in password', () => {
    let urlString = 'https://user:pas[word@[2001:0db8:85a3]/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual('user:pas[word', url.login);
  });

  it ('parses login with port to confuse things', () => {
    let urlString = 'https://user:password@example.com:8000/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual('user:password', url.login);
  });

  it ('parses login with @ to confuse things', () => {
    let urlString = 'https://user:p@ssword@example.com/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual('user:p@ssword', url.login);
  });

  it ('parses login with : to confuse things', () => {
    let urlString = 'https://user:passwo:d@example.com/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual('user:passwo:d', url.login);
  });

  it ('parses valid IPv6 hostname', () => {
    let urlString = 'https://[2001:0db8:85a3]/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
  });

  it ('fails on invalid IPv6 hostname', () => {
    let urlString = 'https://[2001:0db8:85ag]/';  // 'g' not valid hex character
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);

    urlString = 'https://[2001:0db8]/';
    url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('fails on invalid port characters', () => {
    let urlString = 'https://example.com:123abc/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('fails on port with decimal', () => {
    let urlString = 'https://example.com:80.0/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('fails on port with negative', () => {
    let urlString = 'https://example.com:-80/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('allows high port values', () => {
    let urlString = 'https://example.com:65535/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual(65535, url.port);
  });

  it ('fails on invalid port values', () => {
    let urlString = 'https://example.com:65536/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('parses empty port strings', () => {
    let urlString = 'https://example.com:/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual(443, url.port);
  });

  it ('replaces 0 port with default port', () => {
    let urlString = 'http://example.com:0/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual(80, url.port);
  });

  it ('fails on invalid character ! in hostname', () => {
    let urlString = 'http://example!.com/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('fails on invalid character 0x10 in hostname', () => {
    let urlString = 'http://example\x10.com/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('fails on invalid character & in hostname', () => {
    let urlString = 'http://example.com&/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('fails on invalid characters in hostname', () => {
    let urlString = 'http://example!.com/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('fails on invalid utf8 percent-escape in hostname', () => {
    let urlString = 'http://example-%FF.com/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('fails on dot host', () => {
    let urlString = 'http://./';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('fails on host with consecutive dots', () => {
    let urlString = 'http://example..com/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
  });

  it ('strips trailing . from host', () => {
    let urlString = 'http://example.com./';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual('example.com', url.host);
  });

  it ('accepts relative urls', () => {
    let urlString = '/foo';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
  });

  it ('parses relative URL with : character', () => {
    let urlString = '/image:foo.jpg-bar';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual(false, url.hasProtocol);
  });

  it ('accepts utf8 characters in hostname', () => {
    let urlString = 'http://⚡.com/';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.isValid);
    assertStrictEqual('⚡.com', url.host);
  });

  it ('rejects http://', () => {
    let urlString = 'http://';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
    assertStrictEqual('', url.host);
  });

  it ('rejects http:/// (empty host)', () => {
    let urlString = 'http:///';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.isValid);
    assertStrictEqual('', url.host);
  });
});











