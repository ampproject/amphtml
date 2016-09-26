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

  it ('parses with no explicit protocol',  () => {
    let urlString = 'foo';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.hasProtocol);
    assertStrictEqual('https', url.protocol);
  });

  it ('parses with invalid protocol characters',  () => {
    let urlString = 'foo bar:baz';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.hasProtocol);
    assertStrictEqual('https', url.protocol);

    urlString = '⚡:amp';
    url = new parse_url.URL(urlString);
    assertStrictEqual(false, url.hasProtocol);
    assertStrictEqual('https', url.protocol);
  });

  it ('parses uncommon protocols, but not URLs', () => {
    let urlString = 'whatsapp:i have no idea what this should contain';
    let url = new parse_url.URL(urlString);
    assertStrictEqual(true, url.hasProtocol);
    assertStrictEqual('whatsapp', url.protocol);
    assertStrictEqual('i have no idea what this should contain',
        url.schemeSpecificPart);
  });
});
