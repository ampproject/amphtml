import {getHashParams, parseQueryString} from '#core/types/string/url';

describes.sandboxed('type helpers - strings - urls', {}, () => {
  describe('parseQueryString', () => {
    it('should return empty params when query string is empty or null', () => {
      expect(parseQueryString(null)).to.deep.equal({});
      expect(parseQueryString('')).to.deep.equal({});
    });
    it('should parse single key-value', () => {
      expect(parseQueryString('a=1')).to.deep.equal({
        'a': '1',
      });
    });
    it('should parse two key-values', () => {
      expect(parseQueryString('a=1&b=2')).to.deep.equal({
        'a': '1',
        'b': '2',
      });
    });
    it('should ignore leading ?', () => {
      expect(parseQueryString('?a=1&b=2')).to.deep.equal({
        'a': '1',
        'b': '2',
      });
    });
    it('should ignore leading #', () => {
      expect(parseQueryString('#a=1&b=2')).to.deep.equal({
        'a': '1',
        'b': '2',
      });
    });
    it('should parse empty value', () => {
      expect(parseQueryString('a=&b=2')).to.deep.equal({
        'a': '',
        'b': '2',
      });
      expect(parseQueryString('a&b=2')).to.deep.equal({
        'a': '',
        'b': '2',
      });
    });
    it('should decode names and values', () => {
      expect(parseQueryString('a%26=1%26&b=2')).to.deep.equal({
        'a&': '1&',
        'b': '2',
      });
    });
    it('should return last dupe', () => {
      expect(parseQueryString('a=1&b=2&a=3')).to.deep.equal({
        'a': '3',
        'b': '2',
      });
    });
  });

  describe('getHashParams', () => {
    it('parses the `originalHash`', () => {
      const params = getHashParams({
        location: {
          originalHash: '#development=1&original',
          hash: '#development=1&missingOriginal',
        },
      });

      expect(params).to.deep.equal({
        'development': '1',
        'original': '',
      });
    });

    it('parses the hash if `originalHash` is unset', () => {
      const params = getHashParams({
        location: {hash: '#development=1&missingOriginal'},
      });

      expect(params).to.deep.equal({
        'development': '1',
        'missingOriginal': '',
      });
    });
  });
});
