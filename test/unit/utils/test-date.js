/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {parseDateAttrs as parseDateAttrsBase} from '../../../src/utils/date';

describes.sandboxed('utils/date', {}, (env) => {
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
