import {getDate, parseDate} from '#core/types/date';

describes.sandboxed('type helpers - dates', {}, (env) => {
  describe('parseDate', () => {
    beforeEach(() => {
      env.sandbox.useFakeTimers(new Date('2018-01-01T08:00:00Z'));
    });

    it('should return null for empty values', () => {
      expect(parseDate(null)).to.be.null;
      expect(parseDate(undefined)).to.be.null;
      expect(parseDate('')).to.be.null;
    });

    it('should return null for invalid values', () => {
      expect(parseDate('abc')).to.be.null;
    });

    it('should return current date for "now"', () => {
      expect(parseDate('now')).to.equal(Date.now());
    });

    it('should parse a date', () => {
      // +1 second.
      expect(parseDate('2018-01-01T08:00:01Z')).to.equal(Date.now() + 1000);
    });
  });

  describe('getDate', () => {
    let date;

    beforeEach(() => {
      date = new Date(parseDate('2018-01-01T08:00:01Z'));
    });

    it('should return null for null input', () => {
      expect(getDate(null)).to.be.null;
      expect(getDate(0)).to.be.null;
      expect(getDate('')).to.be.null;
      expect(getDate(undefined)).to.be.null;
      expect(getDate(NaN)).to.be.null;
    });

    it('should return the value from Date and number types', () => {
      expect(getDate(date)).to.equal(date.getTime());
      expect(getDate(date.getTime())).to.equal(date.getTime());
    });

    it('should parse a string value', () => {
      expect(getDate(date.toISOString())).to.equal(date.getTime());
    });

    it('should parse a "now" keywrod', () => {
      env.sandbox.useFakeTimers(date);
      expect(getDate('now')).to.be.equal(date.getTime());
    });
  });
});
