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

import {Srcset, parseSrcset, srcsetFromElement} from '../../src/srcset';


describe('Srcset parseSrcset', () => {

  function test(s, expected) {
    const res = parseSrcset(s);
    expect(res.sources_.length).to.equal(expected.length);
    for (let i = 0; i < expected.length; i++) {
      const r = res.sources_[i];
      const e = expected[i];
      expect(r.url).to.equal(e.url);
      expect(r.width).to.equal(e.width);
      expect(r.dpr).to.equal(e.dpr);
    }
  }

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

  it('should not accept mixed sources', () => {
    expect(() => {
      parseSrcset(' \n image1 100w\n , \n image2 1.5x\n , image3 ');
    }).to.throw(/Srcset cannot have both width and dpr sources/);
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


describe('Srcset srcsetFromElement', () => {
  function test(srcset, src, expected) {
    const element = document.createElement('div');
    if (srcset !== undefined) {
      element.setAttribute('srcset', srcset);
    }
    if (src !== undefined) {
      element.setAttribute('src', src);
    }
    const res = srcsetFromElement(element);
    expect(res.sources_.length).to.equal(expected.length);
    for (let i = 0; i < expected.length; i++) {
      const r = res.sources_[i];
      const e = expected[i];
      expect(r.url).to.equal(e.url);
      expect(r.width).to.equal(e.width);
      expect(r.dpr).to.equal(e.dpr);
    }
  }

  it('should select srcset when only srcset available', () => {
    test('image-2x.png 2x, image-1x.png 1x', undefined, [
      {url: 'image-2x.png', dpr: 2},
      {url: 'image-1x.png', dpr: 1},
    ]);
  });

  it('should select srcset when src is empty', () => {
    test('image-2x.png 2x, image-1x.png 1x', '', [
      {url: 'image-2x.png', dpr: 2},
      {url: 'image-1x.png', dpr: 1},
    ]);
  });

  it('should select src when only src available', () => {
    test(undefined, 'image-0.png', [
      {url: 'image-0.png', dpr: 1},
    ]);
  });

  it('should select src when only srcset is empty', () => {
    test('', 'image-0.png', [
      {url: 'image-0.png', dpr: 1},
    ]);
  });

  it('should prefer srcset to src', () => {
    test('image-2x.png 2x, image-1x.png 1x', 'image-0.png', [
      {url: 'image-2x.png', dpr: 2},
      {url: 'image-1x.png', dpr: 1},
    ]);
  });

  it('should allow non-compliant src with space', () => {
    test(undefined, 'image 0.png', [
      {url: 'image 0.png', dpr: 1},
    ]);
  });

  it('should require srcset or src to be available', () => {
    expect(() => {
      srcsetFromElement(document.createElement('div'));
    }).to.throw(
        /Either non-empty "srcset" or "src" attribute must be specified/);
  });
});


describe('Srcset construct', () => {

  it('should always require descriptor', () => {
    expect(() => {
      new Srcset([{url: 'image-1000'}]);
    }).to.throw(/Either dpr or width must be specified/);
  });

  it('should enforce only one type of descriptor per source', () => {
    expect(() => {
      new Srcset([{url: 'image-1000', width: 100, dpr: 2}]);
    }).to.throw(/Either dpr or width must be specified/);
  });

  it('should not allow 0-width descriptor', () => {
    expect(() => {
      new Srcset([{url: 'image-1000', width: 0}]);
    }).to.throw(/Either dpr or width must be specified/);
  });

  it('should not allow 0-dpr descriptor', () => {
    expect(() => {
      new Srcset([{url: 'image-1000', dpr: 0}]);
    }).to.throw(/Either dpr or width must be specified/);
  });

  it('should enforce only one type of descriptor total', () => {
    expect(() => {
      new Srcset([{url: 'image-1000', width: 100}, {url: 'image-2x', dpr: 2}]);
    }).to.throw(/Srcset cannot have both width and dpr sources/);
  });

  it('should not allow duplicate sources', () => {
    expect(() => {
      new Srcset([{url: 'image', width: 100}, {url: 'image', width: 100}]);
    }).to.throw(/Duplicate width/);
    expect(() => {
      new Srcset([{url: 'image', dpr: 2}, {url: 'image', dpr: 2}]);
    }).to.throw(/Duplicate dpr/);
  });

  it('should sort sources', () => {
    // Width.
    let res = new Srcset([
        {url: 'image-10w', width: 10},
        {url: 'image-100w', width: 100},
    ]);
    expect(res.sources_[0].url).to.equal('image-100w');
    expect(res.sources_[1].url).to.equal('image-10w');

    // DPR.
    res = new Srcset([
        {url: 'image-1x', dpr: 1},
        {url: 'image-2x', dpr: 2},
    ]);
    expect(res.sources_[0].url).to.equal('image-2x');
    expect(res.sources_[1].url).to.equal('image-1x');
  });
});


describe('Srcset select', () => {
  it('select by width', () => {
    const srcset = new Srcset([
        {url: 'image-1000', width: 1000},
        {url: 'image-500', width: 500},
        {url: 'image-250', width: 250},
        {url: 'image', width: 50},
    ]);

    // DPR = 1
    expect(srcset.select(2000, 1).url).to.equal('image-1000');
    expect(srcset.select(1100, 1).url).to.equal('image-1000');
    expect(srcset.select(1000, 1).url).to.equal('image-1000');
    expect(srcset.select(900, 1).url).to.equal('image-1000');
    expect(srcset.select(800, 1).url).to.equal('image-1000');
    // select image-1000
    expect(srcset.select(700, 1).url).to.equal('image-1000');
    expect(srcset.select(600, 1).url).to.equal('image-500');
    expect(srcset.select(500, 1).url).to.equal('image-500');
    expect(srcset.select(400, 1).url).to.equal('image-500');
    expect(srcset.select(300, 1).url).to.equal('image-250');
    expect(srcset.select(200, 1).url).to.equal('image-250');
    expect(srcset.select(100, 1).url).to.equal('image-250');
    expect(srcset.select(50, 1).url).to.equal('image');
    expect(srcset.select(1, 1).url).to.equal('image');

    // DPR = 2
    expect(srcset.select(2000, 2).url).to.equal('image-1000');
    expect(srcset.select(1100, 2).url).to.equal('image-1000');
    expect(srcset.select(1000, 2).url).to.equal('image-1000');
    expect(srcset.select(900, 2).url).to.equal('image-1000');
    expect(srcset.select(800, 2).url).to.equal('image-1000');
    expect(srcset.select(700, 2).url).to.equal('image-1000');
    expect(srcset.select(600, 2).url).to.equal('image-1000');
    expect(srcset.select(500, 2).url).to.equal('image-1000');
    expect(srcset.select(400, 2).url).to.equal('image-1000');
    expect(srcset.select(300, 2).url).to.equal('image-500');
    expect(srcset.select(200, 2).url).to.equal('image-500');
    expect(srcset.select(100, 2).url).to.equal('image-250');
    expect(srcset.select(50, 2).url).to.equal('image-250');
    expect(srcset.select(1, 2).url).to.equal('image');
  });

  it('select by width with preference toward higher width', () => {
    const srcset = new Srcset([
        {url: 'image-1000', width: 1000},
        {url: 'image-500', width: 500},
        {url: 'image-250', width: 250},
        {url: 'image', width: 50},
    ]);

    // For DPR=1 and 2.
    // Bull's eye.
    expect(srcset.select(500, 1).url).to.equal('image-500');
    expect(srcset.select(250, 2).url).to.equal('image-500');

    // Right in between: (1000 + 500)/2 = 750 -> preference for the higher
    // value.
    expect(srcset.select(750, 1).url).to.equal('image-1000');
    expect(srcset.select(375, 2).url).to.equal('image-1000');

    // Even higher: 850 -> higher value.
    expect(srcset.select(850, 1).url).to.equal('image-1000');
    expect(srcset.select(425, 2).url).to.equal('image-1000');

    // Slightly lower: ~10% -> 740 -> still higher value.
    expect(srcset.select(740, 1).url).to.equal('image-1000');
    expect(srcset.select(370, 2).url).to.equal('image-1000');

    // Lower than threshold but difference ratio (730/500 = 1.46) too high -> higher value
    expect(srcset.select(730, 1).url).to.equal('image-1000');
    expect(srcset.select(365, 2).url).to.equal('image-1000');

    // Lower than threshold and difference ratio (600/500 = 1.2) is low enough -> lower value
    expect(srcset.select(600, 1).url).to.equal('image-500');
    expect(srcset.select(300, 2).url).to.equal('image-500');
  });

  it('select by dpr', () => {
    const srcset = new Srcset([
        {url: 'image-3x', dpr: 3},
        {url: 'image-2x', dpr: 2},
        {url: 'image', dpr: 1},
    ]);

    expect(srcset.select(2000, 4).url).to.equal('image-3x', 'dpr=4');
    expect(srcset.select(2000, 3.5).url).to.equal('image-3x', 'dpr=3.5');
    expect(srcset.select(2000, 3).url).to.equal('image-3x', 'dpr=3');
    expect(srcset.select(2000, 2.7).url).to.equal('image-3x', 'dpr=2.7');
    expect(srcset.select(2000, 2.5).url).to.equal('image-3x', 'dpr=2.5');
    expect(srcset.select(2000, 2.3).url).to.equal('image-2x', 'dpr=2.3');
    expect(srcset.select(2000, 2).url).to.equal('image-2x', 'dpr=2');
    expect(srcset.select(2000, 1.7).url).to.equal('image-2x', 'dpr=1.7');
    expect(srcset.select(2000, 1.5).url).to.equal('image-2x', 'dpr=1.5');
    expect(srcset.select(2000, 1.3).url).to.equal('image', 'dpr=1.3');
    expect(srcset.select(2000, 1.2).url).to.equal('image', 'dpr=1.2');
    expect(srcset.select(2000, 1).url).to.equal('image', 'dpr=1');
  });
});
