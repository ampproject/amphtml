import {
  escapeCssSelectorIdent,
  prependSelectorsWith,
} from '#core/dom/css-selectors';

describes.sandboxed('DOM - CSS selectors', {}, () => {
  describe('escapeCssSelectorIdent', () => {
    it('should escape', () => {
      expect(escapeCssSelectorIdent('a b')).to.equal('a\\ b');
    });
  });

  describe('scopeSelector', () => {
    it('concats simple', () => {
      expect(prependSelectorsWith('div', '.i-amphtml-scoped')).to.equal(
        '.i-amphtml-scoped div'
      );
    });

    it('concats multiple selectors (2)', () => {
      expect(prependSelectorsWith('div,ul', ':scope')).to.equal(
        ':scope div,:scope ul'
      );
    });

    it('concats multiple selectors (4)', () => {
      expect(prependSelectorsWith('div,ul,ol,section', 'div >')).to.equal(
        'div > div,div > ul,div > ol,div > section'
      );
    });
  });
});
