import {parseDateAttrs as parseDateAttrsBase} from '#core/dom/parse-date-attributes';

describes.sandboxed('DOM - parse date attributes', {}, (env) => {
  describe('parseDateAttrs', () => {
    const DATE = new Date(1514793600000);
    const DATE_STRING = DATE.toISOString();

    function parseDateAttrs(element) {
      return parseDateAttrsBase(element, [
        'datetime',
        'end-date',
        'timestamp-ms',
        'timeleft-ms',
        'timestamp-seconds',
      ]);
    }

    let element;

    beforeEach(() => {
      element = document.createElement('amp-date-display');
    });

    it('should throw when no date is specified', () => {
      expect(() => parseDateAttrs(element)).to.throw(/required/);
    });

    /* datetime attribute */
    it('should throw when invalid date is specified', () => {
      element.setAttribute('datetime', 'invalid');
      expect(() => parseDateAttrs(element)).to.throw(/Invalid date/);
    });

    it('should parse the "datetime" attribute', () => {
      element.setAttribute('datetime', DATE_STRING);
      expect(parseDateAttrs(element)).to.equal(DATE.getTime());

      // With offset.
      element.setAttribute('offset-seconds', '1');
      expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 1000);
    });

    it('should accept "datetime=now"', () => {
      env.sandbox.useFakeTimers(DATE);
      element.setAttribute('datetime', 'now');
      expect(parseDateAttrs(element)).to.equal(DATE.getTime());

      // With offset.
      element.setAttribute('offset-seconds', '1');
      expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 1000);
    });

    /* end-date attribute */
    it('should parse the "end-date" attribute', () => {
      element.setAttribute('end-date', DATE_STRING);
      expect(parseDateAttrs(element)).to.equal(DATE.getTime());

      // With offset.
      element.setAttribute('offset-seconds', '1');
      expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 1000);
    });

    it('should accept "end-date=now"', () => {
      env.sandbox.useFakeTimers(DATE);
      element.setAttribute('end-date', 'now');
      expect(parseDateAttrs(element)).to.equal(DATE.getTime());

      // With offset.
      element.setAttribute('offset-seconds', '1');
      expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 1000);
    });

    /* timeleft-ms attribute */
    it('should parse the "timeleft-ms" attribute', () => {
      // Mock Date.now()
      const originalDateNow = Date.now;
      const mockedDateNow = () => DATE.getTime();
      Date.now = mockedDateNow;

      element.setAttribute('timeleft-ms', 10000);
      expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 10000);

      // With offset.
      element.setAttribute('offset-seconds', '1');
      expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 10000 + 1000);

      // Replace Date.now with its original native function
      Date.now = originalDateNow;
    });

    it('should throw when invalid "timeleft-ms" is specified', () => {
      element.setAttribute('timeleft-ms', 'invalid');
      allowConsoleError(() => {
        expect(() => parseDateAttrs(element)).to.throw(/required/);
      });
    });

    /* timestamp-ms attribute */
    it('should parse the "timestamp-ms" attribute', () => {
      element.setAttribute('timestamp-ms', DATE.getTime());
      expect(parseDateAttrs(element)).to.equal(DATE.getTime());

      // With offset.
      element.setAttribute('offset-seconds', '1');
      expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 1000);
    });

    it('should throw when invalid "timestamp-ms" is specified', () => {
      element.setAttribute('timestamp-ms', 'invalid');
      expect(() => parseDateAttrs(element)).to.throw(/required/);
    });

    /* timestamp-seconds attribute */
    it('should parse the "timestamp-seconds" attribute', () => {
      element.setAttribute('timestamp-seconds', DATE.getTime() / 1000);
      expect(parseDateAttrs(element)).to.equal(DATE.getTime());

      // With offset.
      element.setAttribute('offset-seconds', '1');
      expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 1000);
    });

    it('should throw when invalid "timestamp-seconds" is specified', () => {
      element.setAttribute('timestamp-seconds', 'invalid');
      expect(() => parseDateAttrs(element)).to.throw(/required/);
    });

    it('should throw when an invalid attribute is specified', () => {
      expect(() => parseDateAttrsBase(element, ['unknown-attr'])).to.throw(
        'Invalid date attribute'
      );
    });
  });
});
