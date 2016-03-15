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
 *
 * Credits:
 *   Original version of this file was derived from
 *   https://github.com/ampproject/amphtml/blob/master/test/functional/test-srcset.js
 */
goog.provide('parse_srcset.ParseSrcsetTest');

goog.require('parse_srcset.SrcsetSourceDef');
goog.require('parse_srcset.parseSrcset');

/**
 * A strict comparison between two values.
 * Note: Unfortunately assert.strictEqual has some drawbacks, including that
 * it truncates the provided arguments (and it's not configurable) and
 * with the Closure compiler, it requires a message argument to which
 * we'd always have to pass undefined. Too messy, so we roll our own.
 * @param {T} expected
 * @param {T} saw
 * @template T
 */
function assertStrictEqual(expected, saw) {
  assert.ok(expected === saw, 'expected: ' + expected + ' saw: ' + saw);
}

/**
 * Test parseSrcset and assert results are as expected.
 * @param {string} s
 * @param {!Array<!parse_srcset.SrcsetSourceDef>} expected
 */
function test(s, expected) {
  const res = parse_srcset.parseSrcset(s);
  assertStrictEqual(res.getSources().length, expected.length);
  for (let i = 0; i < expected.length; i++) {
    const r = res.getSources()[i];
    const e = expected[i];
    assertStrictEqual(r.url, e.url);
    assertStrictEqual(r.width, e.width);
    assertStrictEqual(r.dpr, e.dpr);
  }
}

describe('Srcset parseSrcset', () => {

  it('should accept single source, default to 1px', () => {
    test(' \n image \n ', [
      {url: 'image', dpr: 1},
    ]);
  });

  it('should ignore empty source', () => {
    test(' \n image \n, ', [
      {url: 'image', dpr: 1},
    ]);
    test(' , \n image \n, ', [
      {url: 'image', dpr: 1},
    ]);
  });

  it('should accept multiple sources, default to 1x', () => {
    test(' \n image 2x \n\t, image2 \n', [
      {url: 'image', dpr: 2},
      {url: 'image2', dpr: 1},
    ]);
  });

  it('should accept width-based sources', () => {
    test(' \n image-100 100w\n, image 10w', [
      {url: 'image-100', width: 100},
      {url: 'image', width: 10},
    ]);
  });

  it('should accept dpr-based sources', () => {
    test(' \n image-x1.5 1.5x\n , image', [
      {url: 'image-x1.5', dpr: 1.5},
      {url: 'image', dpr: 1},
    ]);
  });

  it('should tolerate other sources', () => {
    test('image2x 2x, image2h 2h', [{url: 'image2x', dpr: 2}]);
    test('image2x 2x, image2h 2H', [{url: 'image2x', dpr: 2}]);
  });

  it('should parse fractions', () => {
    test('image-x1.5 1.5x', [{url: 'image-x1.5', dpr: 1.5}]);
    test('image-x1.5 001x', [{url: 'image-x1.5', dpr: 1}]);
    test('image-x1.5 1.00000x', [{url: 'image-x1.5', dpr: 1}]);
    test('image-x1.5 1.x', [{url: 'image-x1.5', dpr: 1}]);
    test('image-x1.5 0.1x', [{url: 'image-x1.5', dpr: 0.1}]);
    test('image-x1.5 0000.1x', [{url: 'image-x1.5', dpr: 0.1}]);
    test('image-x1.5 .1x', [{url: 'image-x1.5', dpr: 0.1}]);
  });

  it('should tolerate negatives', () => {
    test('image-x1.5 -1.5x', [{url: 'image-x1.5', dpr: -1.5}]);
    test('image-x1.5 -001x', [{url: 'image-x1.5', dpr: -1}]);
  });

  it('should accept several sources', () => {
    test(' \n image1 100w\n , \n image2 50w\n , image3 10.5w', [
      {url: 'image1', width: 100},
      {url: 'image2', width: 50},
      {url: 'image3', width: 10.5},
    ]);
  });

  it('should accept commas in URLs', () => {
    test(' \n image,1 100w\n , \n image,2 50w \n', [
      {url: 'image,1', width: 100},
      {url: 'image,2', width: 50},
    ]);
    test(' \n image,100w 100w\n , \n image,20w 50w \n', [
      {url: 'image,100w', width: 100},
      {url: 'image,20w', width: 50},
    ]);
    test(' \n image,2 2x\n , \n image,1', [
      {url: 'image,2', dpr: 2},
      {url: 'image,1', dpr: 1},
    ]);
    test(' \n image,2x 2x\n , \n image,1x', [
      {url: 'image,2x', dpr: 2},
      {url: 'image,1x', dpr: 1},
    ]);
    test(' \n image,2 , \n  image,1 2x\n', [
      {url: 'image,1', dpr: 2},
      {url: 'image,2', dpr: 1},
    ]);
    test(' \n image,1x , \n  image,2x 2x\n', [
      {url: 'image,2x', dpr: 2},
      {url: 'image,1x', dpr: 1},
    ]);
    test(' \n image,1 \n ', [
      {url: 'image,1', dpr: 1},
    ]);
    test(' \n image,1x \n ', [
      {url: 'image,1x', dpr: 1},
    ]);
  });

  it('should accept no-whitestpace', () => {
    test('image 100w,image 50w', [
      {url: 'image', width: 100},
      {url: 'image', width: 50},
    ]);
    test('image,1 100w,image,2 50w', [
      {url: 'image,1', width: 100},
      {url: 'image,2', width: 50},
    ]);
    test('image,1 2x,image,2', [
      {url: 'image,1', dpr: 2},
      {url: 'image,2', dpr: 1},
    ]);
    test('image,2 2x', [
      {url: 'image,2', dpr: 2},
    ]);
    test('image,1', [
      {url: 'image,1', dpr: 1},
    ]);
  });

  it('should accept other special chars in URLs', () => {
    test(' \n http://im-a+ge;1?&2#3 100w\n , \n image;2 50w \n', [
      {url: 'http://im-a+ge;1?&2#3', width: 100},
      {url: 'image;2', width: 50},
    ]);
  });

  it('should accept false cognitives in URLs', () => {
    test(' \n image,100w 100w\n , \n image,20x 50w \n', [
      {url: 'image,100w', width: 100},
      {url: 'image,20x', width: 50},
    ]);
    test(' \n image,1x 2x\n , \n image,2x', [
      {url: 'image,1x', dpr: 2},
      {url: 'image,2x', dpr: 1},
    ]);
    test(' \n image,1x \n ', [
      {url: 'image,1x', dpr: 1},
    ]);
    test(' \n image,1w \n ', [
      {url: 'image,1w', dpr: 1},
    ]);
  });

  it('should parse misc examples', () => {
    test('image-1x.png 1x, image-2x.png 2x, image-3x.png 3x, image-4x.png 4x', [
      {url: 'image-4x.png', dpr: 4},
      {url: 'image-3x.png', dpr: 3},
      {url: 'image-2x.png', dpr: 2},
      {url: 'image-1x.png', dpr: 1},
    ]);
    test('image,one.png', [
      {url: 'image,one.png', dpr: 1},
    ]);
  });
});
