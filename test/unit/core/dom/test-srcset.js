import {
  Srcset,
  parseSrcset,
  srcsetFromElement,
  srcsetFromSrc,
} from '#core/dom/srcset';

describes.sandboxed('DOM - srcset', {}, () => {
  describe('parseSrcset', () => {
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
      test(' \n image \n ', [{url: 'image', dpr: 1}]);
    });

    it('should ignore empty source', () => {
      test(' \n image \n, ', [{url: 'image', dpr: 1}]);
      test(' , \n image \n, ', [{url: 'image', dpr: 1}]);
    });

    it('should accept multiple sources, default to 1x', () => {
      test(' \n image 2x \n\t, image2 \n', [
        {url: 'image2', dpr: 1},
        {url: 'image', dpr: 2},
      ]);
    });

    it('should accept width-based sources', () => {
      test(' \n image-100 100w\n, image 10w', [
        {url: 'image', width: 10},
        {url: 'image-100', width: 100},
      ]);
    });

    it('should accept dpr-based sources', () => {
      test(' \n image-x1.5 1.5x\n , image', [
        {url: 'image', dpr: 1},
        {url: 'image-x1.5', dpr: 1.5},
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
      test('image-x1.5 0.1x', [{url: 'image-x1.5', dpr: 0.1}]);
      test('image-x1.5 0000.1x', [{url: 'image-x1.5', dpr: 0.1}]);
    });

    it('should tolerate negatives', () => {
      test('image-x1.5 -1.5x', [{url: 'image-x1.5', dpr: -1.5}]);
      test('image-x1.5 -001x', [{url: 'image-x1.5', dpr: -1}]);
    });

    it('should accept several sources', () => {
      test(' \n image1 100w\n , \n image2 50w\n , image3 10.5w', [
        {url: 'image3', width: 10},
        {url: 'image2', width: 50},
        {url: 'image1', width: 100},
      ]);
    });

    it('should accept commas in URLs', () => {
      test(' \n image,1 100w\n , \n image,2 50w \n', [
        {url: 'image,2', width: 50},
        {url: 'image,1', width: 100},
      ]);
      test(' \n image,100w 100w\n , \n image,20w 50w \n', [
        {url: 'image,20w', width: 50},
        {url: 'image,100w', width: 100},
      ]);
      test(' \n image,2 2x\n , \n image,1', [
        {url: 'image,1', dpr: 1},
        {url: 'image,2', dpr: 2},
      ]);
      test(' \n image,2x 2x\n , \n image,1x', [
        {url: 'image,1x', dpr: 1},
        {url: 'image,2x', dpr: 2},
      ]);
      test(' \n image,2 , \n  image,1 2x\n', [
        {url: 'image,2', dpr: 1},
        {url: 'image,1', dpr: 2},
      ]);
      test(' \n image,1x , \n  image,2x 2x\n', [
        {url: 'image,1x', dpr: 1},
        {url: 'image,2x', dpr: 2},
      ]);
      test(' \n image,1 \n ', [{url: 'image,1', dpr: 1}]);
      test(' \n image,1x \n ', [{url: 'image,1x', dpr: 1}]);
    });

    it('should accept no-whitestpace', () => {
      test('image 100w,image 50w', [
        {url: 'image', width: 50},
        {url: 'image', width: 100},
      ]);
      test('image,1 100w,image,2 50w', [
        {url: 'image,2', width: 50},
        {url: 'image,1', width: 100},
      ]);
      test('image,1 2x,image,2', [
        {url: 'image,2', dpr: 1},
        {url: 'image,1', dpr: 2},
      ]);
      test('image,2 2x', [{url: 'image,2', dpr: 2}]);
      test('image,1', [{url: 'image,1', dpr: 1}]);
    });

    it('should accept other special chars in URLs', () => {
      test(' \n http://im-a+ge;1?&2#3 100w\n , \n image;2 50w \n', [
        {url: 'image;2', width: 50},
        {url: 'http://im-a+ge;1?&2#3', width: 100},
      ]);
    });

    it('should accept false cognitives in URLs', () => {
      test(' \n image,100w 100w\n , \n image,20x 50w \n', [
        {url: 'image,20x', width: 50},
        {url: 'image,100w', width: 100},
      ]);
      test(' \n image,1x 2x\n , \n image,2x', [
        {url: 'image,2x', dpr: 1},
        {url: 'image,1x', dpr: 2},
      ]);
      test(' \n image,1x \n ', [{url: 'image,1x', dpr: 1}]);
      test(' \n image,1w \n ', [{url: 'image,1w', dpr: 1}]);
    });

    it('should not accept mixed sources', () => {
      allowConsoleError(() => {
        expect(() => {
          parseSrcset(' \n image1 100w\n , \n image2 1.5x\n , image3 ');
        }).to.throw(/Srcset must have width or dpr sources, but not both/);
      });
    });

    it('should parse misc examples', () => {
      test(
        'image-1x.png 1x, image-2x.png 2x, image-3x.png 3x, image-4x.png 4x',
        [
          {url: 'image-1x.png', dpr: 1},
          {url: 'image-2x.png', dpr: 2},
          {url: 'image-3x.png', dpr: 3},
          {url: 'image-4x.png', dpr: 4},
        ]
      );
      test('image,one.png', [{url: 'image,one.png', dpr: 1}]);
    });
  });

  describe('srcsetFromElement', () => {
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
        {url: 'image-1x.png', dpr: 1},
        {url: 'image-2x.png', dpr: 2},
      ]);
    });

    it('should select srcset when src is empty', () => {
      test('image-2x.png 2x, image-1x.png 1x', '', [
        {url: 'image-1x.png', dpr: 1},
        {url: 'image-2x.png', dpr: 2},
      ]);
    });

    it('should select src when only src available', () => {
      test(undefined, 'image-0.png', [{url: 'image-0.png', dpr: 1}]);
    });

    it('should select src when only srcset is empty', () => {
      test('', 'image-0.png', [{url: 'image-0.png', dpr: 1}]);
    });

    it('should prefer srcset to src', () => {
      test('image-2x.png 2x, image-1x.png 1x', 'image-0.png', [
        {url: 'image-1x.png', dpr: 1},
        {url: 'image-2x.png', dpr: 2},
      ]);
    });

    it('should allow non-compliant src with space', () => {
      test(undefined, 'image 0.png', [{url: 'image 0.png', dpr: 1}]);
    });

    it('should require srcset or src to be available', () => {
      allowConsoleError(() => {
        expect(() => {
          srcsetFromElement(document.createElement('div'));
        }).to.throw(
          /Either non-empty "srcset" or "src" attribute must be specified/
        );
      });
    });
  });

  describe('srcsetFromSrc', () => {
    it('should construct with undefined width and 1 dpr', () => {
      const srcset = srcsetFromSrc('image-0.png');
      expect(srcset.sources_.length).to.equal(1);

      const source = srcset.sources_[0];
      expect(source.url).to.equal('image-0.png');
      expect(source.width).to.be.undefined;
      expect(source.dpr).to.equal(1);
    });
  });

  describe('construct', () => {
    it('should enforce only one type of descriptor per source', () => {
      allowConsoleError(() => {
        expect(() => {
          new Srcset([{url: 'image-1000', width: 100, dpr: 2}]);
        }).to.throw(/Srcset must have width or dpr sources, but not both/);
      });
    });

    it('should not allow 0-width descriptor', () => {
      allowConsoleError(() => {
        expect(() => {
          new Srcset([{url: 'image-1000', width: 0}]);
        }).to.throw(/Srcset must have width or dpr sources, but not both/);
      });
    });

    it('should not allow 0-dpr descriptor', () => {
      allowConsoleError(() => {
        expect(() => {
          new Srcset([{url: 'image-1000', dpr: 0}]);
        }).to.throw(/Srcset must have width or dpr sources, but not both/);
      });
    });

    it('should enforce only one type of descriptor total', () => {
      allowConsoleError(() => {
        expect(() => {
          new Srcset([
            {url: 'image-1000', width: 100},
            {url: 'image-2x', dpr: 2},
          ]);
        }).to.throw(/Srcset must have width or dpr sources, but not both/);
      });
    });

    it('should not allow duplicate sources', () => {
      allowConsoleError(() => {
        expect(() => {
          new Srcset([
            {url: 'image', width: 100},
            {url: 'image', width: 100},
          ]);
        }).to.throw(/Duplicate width/);
      });
      allowConsoleError(() => {
        expect(() => {
          new Srcset([
            {url: 'image', dpr: 2},
            {url: 'image', dpr: 2},
          ]);
        }).to.throw(/Duplicate dpr/);
      });
    });
  });

  describe('select', () => {
    it('select by width', () => {
      const srcset = parseSrcset(
        'image-1000 1000w, image-500 500w, image-250 250w, image 50w'
      );

      // DPR = 1
      expect(srcset.select(2000, 1)).to.equal('image-1000');
      expect(srcset.select(1100, 1)).to.equal('image-1000');
      expect(srcset.select(1000, 1)).to.equal('image-1000');
      expect(srcset.select(900, 1)).to.equal('image-1000');
      expect(srcset.select(800, 1)).to.equal('image-1000');
      // select image-1000
      expect(srcset.select(700, 1)).to.equal('image-1000');
      expect(srcset.select(600, 1)).to.equal('image-500');
      expect(srcset.select(500, 1)).to.equal('image-500');
      expect(srcset.select(400, 1)).to.equal('image-500');
      expect(srcset.select(300, 1)).to.equal('image-250');
      expect(srcset.select(200, 1)).to.equal('image-250');
      expect(srcset.select(100, 1)).to.equal('image-250');
      expect(srcset.select(50, 1)).to.equal('image');
      expect(srcset.select(1, 1)).to.equal('image');

      // DPR = 2
      expect(srcset.select(2000, 2)).to.equal('image-1000');
      expect(srcset.select(1100, 2)).to.equal('image-1000');
      expect(srcset.select(1000, 2)).to.equal('image-1000');
      expect(srcset.select(900, 2)).to.equal('image-1000');
      expect(srcset.select(800, 2)).to.equal('image-1000');
      expect(srcset.select(700, 2)).to.equal('image-1000');
      expect(srcset.select(600, 2)).to.equal('image-1000');
      expect(srcset.select(500, 2)).to.equal('image-1000');
      expect(srcset.select(400, 2)).to.equal('image-1000');
      expect(srcset.select(300, 2)).to.equal('image-500');
      expect(srcset.select(200, 2)).to.equal('image-500');
      expect(srcset.select(100, 2)).to.equal('image-250');
      expect(srcset.select(50, 2)).to.equal('image-250');
      expect(srcset.select(1, 2)).to.equal('image');
    });

    it('select by width with preference toward higher width', () => {
      const srcset = parseSrcset(
        'image-1000 1000w, image-500 500w, image-250 250w, image 50w'
      );

      // For DPR=1 and 2.
      // Bull's eye.
      expect(srcset.select(500, 1)).to.equal('image-500');
      expect(srcset.select(250, 2)).to.equal('image-500');

      // Right in between: (1000 + 500)/2 = 750 -> preference for the higher
      // value.
      expect(srcset.select(750, 1)).to.equal('image-1000');
      expect(srcset.select(375, 2)).to.equal('image-1000');

      // Even higher: 850 -> higher value.
      expect(srcset.select(850, 1)).to.equal('image-1000');
      expect(srcset.select(425, 2)).to.equal('image-1000');

      // Slightly lower: ~10% -> 740 -> still higher value.
      expect(srcset.select(740, 1)).to.equal('image-1000');
      expect(srcset.select(370, 2)).to.equal('image-1000');

      // Lower than threshold but difference ratio (730/500 = 1.46) too high ->
      // higher value
      expect(srcset.select(730, 1)).to.equal('image-1000');
      expect(srcset.select(365, 2)).to.equal('image-1000');

      // Lower than threshold and difference ratio (600/500 = 1.2) is low enough
      // -> lower value
      expect(srcset.select(600, 1)).to.equal('image-500');
      expect(srcset.select(300, 2)).to.equal('image-500');
    });

    it('select by dpr', () => {
      const srcset = parseSrcset('image-3x 3x, image-2x 2x, image 1x');

      expect(srcset.select(2000, 4)).to.equal('image-3x', 'dpr=4');
      expect(srcset.select(2000, 3.5)).to.equal('image-3x', 'dpr=3.5');
      expect(srcset.select(2000, 3)).to.equal('image-3x', 'dpr=3');
      expect(srcset.select(2000, 2.7)).to.equal('image-3x', 'dpr=2.7');
      expect(srcset.select(2000, 2.5)).to.equal('image-3x', 'dpr=2.5');
      expect(srcset.select(2000, 2.3)).to.equal('image-2x', 'dpr=2.3');
      expect(srcset.select(2000, 2)).to.equal('image-2x', 'dpr=2');
      expect(srcset.select(2000, 1.7)).to.equal('image-2x', 'dpr=1.7');
      expect(srcset.select(2000, 1.5)).to.equal('image-2x', 'dpr=1.5');
      expect(srcset.select(2000, 1.3)).to.equal('image', 'dpr=1.3');
      expect(srcset.select(2000, 1.2)).to.equal('image', 'dpr=1.2');
      expect(srcset.select(2000, 1)).to.equal('image', 'dpr=1');
    });
  });
});
