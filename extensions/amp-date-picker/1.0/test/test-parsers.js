import {expect} from 'chai';
import {isSameDay} from 'date-fns';
import {es} from 'date-fns/locale';

import {DEFAULT_LOCALE} from '../constants';
import {parseDate, parseDateList, parseLocale} from '../parsers';

describes.sandboxed('parsers', {}, () => {
  describe('parseDate', () => {
    it('parses an ISO-8601 date', () => {
      const parsedDate = parseDate('2022-02-04');

      expect(isSameDay(parsedDate, new Date(2022, 1, 4))).to.be.true;
    });

    it('accepts a format', () => {
      const parsedDate = parseDate('February 4th, 2022', 'MMMM do, yyyy');

      expect(isSameDay(parsedDate, new Date(2022, 1, 4))).to.be.true;
    });

    it('falls back the ISO-8601 format if the provided format does not match the date', () => {
      const parsedDate = parseDate('2022-02-04', 'MMMM do, yyyy');

      expect(isSameDay(parsedDate, new Date(2022, 1, 4))).to.be.true;
    });

    it('accepts a locale', () => {
      const parsedDate = parseDate('febrero 4º, 2022', 'MMMM do, yyyy', es);

      expect(isSameDay(parsedDate, new Date(2022, 1, 4))).to.be.true;
    });
  });

  describe('parseLocale', () => {
    it('returns a date-fns locale object for a locale string', () => {
      expect(parseLocale('es')).to.equal(es);
    });

    it("falls back to the default locale when a string doesn't match an available locale", () => {
      expect(parseLocale('tlh')).to.equal(DEFAULT_LOCALE);
    });
  });

  describe('parseDateList', () => {
    it('parses a space separated list of RRULEs and returns an array', () => {
      expect(
        parseDateList('RRULE:SOME=RULE RRULE:SOMEOTHER=RULE')
      ).to.have.lengthOf(2);
    });

    it('parses ISO-8601 dates as a Date object', () => {
      const parsedList = parseDateList('2022-02-04');

      expect(parsedList).to.have.lengthOf(1);
      expect(isSameDay(parsedList[0], new Date(2022, 1, 4))).to.be.true;
    });
  });
});
