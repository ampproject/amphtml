import {isFiniteNumber} from '#core/types';

describes.sandboxed('type helpers', {}, () => {
  describe('isFiniteNumber', () => {
    it('should yield false for non-numbers', () => {
      expect(isFiniteNumber(null)).to.be.false;
      expect(isFiniteNumber(undefined)).to.be.false;
      expect(isFiniteNumber('')).to.be.false;
      expect(isFiniteNumber('2')).to.be.false;
      expect(isFiniteNumber([])).to.be.false;
      expect(isFiniteNumber([2])).to.be.false;
      expect(isFiniteNumber({})).to.be.false;
      expect(isFiniteNumber({'a': 2})).to.be.false;
      expect(isFiniteNumber(true)).to.be.false;
      expect(isFiniteNumber(NaN)).to.be.false;
    });

    it('should yield true for numbers', () => {
      expect(isFiniteNumber(3)).to.be.true;
      expect(isFiniteNumber(3.2)).to.be.true;
      expect(isFiniteNumber(123e5)).to.be.true;
    });
  });
});
