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
 *  Credits:
 *    Original version of this file was derived from
 *    https://github.com/ampproject/amphtml/blob/master/test/functional/test-srcset.js
 */
goog.provide('parse_srcset.ParseSrcsetTest');
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
  const result = parse_srcset.parseSrcset(s);
  assertStrictEqual(result.srcsetImages.length, expected.length);
  for (let i = 0; i < expected.length; i++) {
    const r = result.srcsetImages[i];
    const e = expected[i];
    assertStrictEqual(r.url, e.url);
    assertStrictEqual(r.widthOrPixelDensity, e.widthOrPixelDensity);
  }
  expect(result.success).toBe(true);
}

describe('Srcset parseSrcset', () => {

  it('should accept single source', () => {
    test('image', [
      {url: 'image', widthOrPixelDensity: '1x'},
    ]);
  });

  it('should accept single source with width/pixel-density', () => {
    test('image 100w', [
      {url: 'image', widthOrPixelDensity: '100w'},
    ]);
    test('image 2x', [
      {url: 'image', widthOrPixelDensity: '2x'},
    ]);
  });

  it('should accept whitespace around url', () => {
    test(' \t\n image \n\t\t ', [
      {url: 'image', widthOrPixelDensity: '1x'},
    ]);
  });

  it('should ignore empty source', () => {
    test(' \n image \n, ', [
      {url: 'image', widthOrPixelDensity: '1x'},
    ]);
    test(' , \n image \n, ', [
      {url: 'image', widthOrPixelDensity: '1x'},
    ]);
  });

  it('should accept multiple sources', () => {
    test('image1 2x, image2, image3 3x, image4 4x', [
      {url: 'image1', widthOrPixelDensity: '2x'},
      {url: 'image2', widthOrPixelDensity: '1x'},
      {url: 'image3', widthOrPixelDensity: '3x'},
      {url: 'image4', widthOrPixelDensity: '4x'},
    ]);
    test(' \n image 2x \n\t, image2 \n ', [
      {url: 'image', widthOrPixelDensity: '2x'},
      {url: 'image2', widthOrPixelDensity: '1x'},
    ]);
  });

  it('should not accept multiple sources with duplicate width', () => {
    let result = parse_srcset.parseSrcset(
        'image1 10w, image2 100w, image3 1000w, image4 10w');
    expect(result.success).toBe(false);
  });

  it('should accept width-based sources', () => {
    test(' \n image-100 100w\n, image 10w', [
      {url: 'image-100', widthOrPixelDensity: '100w'},
      {url: 'image', widthOrPixelDensity: '10w'},
    ]);
  });

  it('should accept dpr-based sources', () => {
    test(' \n image-x1.5 1.5x\n , image', [
      {url: 'image-x1.5', widthOrPixelDensity: '1.5x'},
      {url: 'image', widthOrPixelDensity: '1x'},
    ]);
  });

  it('should accept commas in URLs', () => {
    test(' \n image,1 100w\n , \n image,2 50w \n', [
      {url: 'image,1', widthOrPixelDensity: '100w'},
      {url: 'image,2', widthOrPixelDensity: '50w'},
    ]);
    test(' \n image,100w 100w\n , \n image,20w 50w \n', [
      {url: 'image,100w', widthOrPixelDensity: '100w'},
      {url: 'image,20w', widthOrPixelDensity: '50w'},
    ]);
    test(' \n image,2 2x\n , \n image,1', [
      {url: 'image,2', widthOrPixelDensity: '2x'},
      {url: 'image,1', widthOrPixelDensity: '1x'},
    ]);
    test(' \n image,2x 2x\n , \n image,1x', [
      {url: 'image,2x', widthOrPixelDensity: '2x'},
      {url: 'image,1x', widthOrPixelDensity: '1x'},
    ]);
    test(' \n image,2 , \n  image,1 2x\n', [
      {url: 'image,2', widthOrPixelDensity: '1x'},
      {url: 'image,1', widthOrPixelDensity: '2x'},
    ]);
    test(' \n image,1x , \n  image,2x 2x\n', [
      {url: 'image,1x', widthOrPixelDensity: '1x'},
      {url: 'image,2x', widthOrPixelDensity: '2x'}
    ]);
    test(' \n image,1 \n ', [
      {url: 'image,1', widthOrPixelDensity: '1x'},
    ]);
    test(' \n image,1x \n ', [
      {url: 'image,1x', widthOrPixelDensity: '1x'},
    ]);
  });

  it('should accept leading and trailing commas and commas in url', () => {

    // Leading and trailing commas are OK, as are commas in side URLs.
    // This example only looks a little strange because the ParseSourceSet
    // function does not further validate the URL.
    test(',image1,100w,image2,50w,', [
      {url: 'image1,100w,image2,50w', widthOrPixelDensity: '1x'},
    ]);

    // This is a more typical-looking example, with leading and trailing commas.
    test(',example.com/,/,/,/,50w,', [
      {url: 'example.com/,/,/,/,50w', widthOrPixelDensity: '1x'},
    ]);

  });

  it('should accept no-whitespace', () => {
    test('image 100w,image 50w', [
      {url: 'image', widthOrPixelDensity: '100w'},
      {url: 'image', widthOrPixelDensity: '50w'},
    ]);
    test('image,1 100w,image,2 50w', [
      {url: 'image,1', widthOrPixelDensity: '100w'},
      {url: 'image,2', widthOrPixelDensity: '50w'},
    ]);
    test('image,1 2x,image,2', [
      {url: 'image,1', widthOrPixelDensity: '2x'},
      {url: 'image,2', widthOrPixelDensity: '1x'},
    ]);
    test('image,2 2x', [
      {url: 'image,2', widthOrPixelDensity: '2x'},
    ]);
    test('image,1', [
      {url: 'image,1', widthOrPixelDensity: '1x'},
    ]);
  });

  it('should accept other special chars in URLs', () => {
    test(' \n http://im-a+ge;1?&2#3 100w\n , \n image;2 50w \n', [
      {url: 'http://im-a+ge;1?&2#3', widthOrPixelDensity: '100w'},
      {url: 'image;2', widthOrPixelDensity: '50w'},
    ]);
  });

  it('should accept false cognitives in URLs', () => {
    test(' \n image,100w 100w\n , \n image,20x 50w \n', [
      {url: 'image,100w', widthOrPixelDensity: '100w'},
      {url: 'image,20x', widthOrPixelDensity: '50w'},
    ]);
    test(' \n image,1x 2x\n , \n image,2x', [
      {url: 'image,1x', widthOrPixelDensity: '2x'},
      {url: 'image,2x', widthOrPixelDensity: '1x'},
    ]);
    test(' \n image,1x \n ', [
      {url: 'image,1x', widthOrPixelDensity: '1x'},
    ]);
    test(' \n image,1w \n ', [
      {url: 'image,1w', widthOrPixelDensity: '1x'},
    ]);
  });

  it('should parse misc examples', () => {
    test('image-1x.png 1x, image-2x.png 2x, image-3x.png 3x, image-4x.png 4x', [
      {url: 'image-1x.png', widthOrPixelDensity: '1x'},
      {url: 'image-2x.png', widthOrPixelDensity: '2x'},
      {url: 'image-3x.png', widthOrPixelDensity: '3x'},
      {url: 'image-4x.png', widthOrPixelDensity: '4x'},
    ]);
    test('image,one.png', [
      {url: 'image,one.png', widthOrPixelDensity: '1x'},
    ]);
  });

  it('should reject urls with spaces', () => {
    let result = parse_srcset.parseSrcset('image 1x png 1x');
    expect(result.success).toBe(false);
    result = parse_srcset.parseSrcset('image 1x png 1x, image-2x.png 2x');
    expect(result.success).toBe(false);
  });

  it('should reject width or pixel density with negatives', () => {
    let result = parse_srcset.parseSrcset('image.png -1x');
    expect(result.success).toBe(false);
    result = parse_srcset.parseSrcset('image.png 1x, image2.png -2x');
    expect(result.success).toBe(false);
    result = parse_srcset.parseSrcset('image.png -480w');
    expect(result.success).toBe(false);
    result = parse_srcset.parseSrcset('image.png 1x, image2.png -100w');
    expect(result.success).toBe(false);
  });

  it('should reject empty srcsets', () => {
    let result = parse_srcset.parseSrcset('');
    expect(result.success).toBe(false);
    result = parse_srcset.parseSrcset(' \n\t\f\r');
    expect(result.success).toBe(false);
  });

  it('should reject invalid text after valid srcsets', () => {
    let result = parse_srcset.parseSrcset('image1, image2, ,,,');
    expect(result.success).toBe(false);
  });

  it('should reject no comma between sources', () => {
    let result = parse_srcset.parseSrcset('image1 100w image2 50w');
    expect(result.success).toBe(false);
  });
});
