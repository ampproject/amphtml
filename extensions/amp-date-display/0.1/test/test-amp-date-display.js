/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-date-display';
import * as fakeTimers from '@sinonjs/fake-timers';
import {Services} from '../../../../src/services';

describes.realWin(
  'amp-date-display',
  {
    amp: {
      extensions: ['amp-date-display'],
    },
  },
  (env) => {
    let win;
    let element;
    let impl;
    let clock;

    beforeEach(async () => {
      win = env.win;
      clock = fakeTimers.withGlobal(win).install({
        now: new Date('2018-01-01T08:00:00Z'),
      });

      element = win.document.createElement('amp-date-display');
      element.setAttribute('layout', 'fixed');
      element.setAttribute('width', '300');
      element.setAttribute('height', '100');
      win.document.body.appendChild(element);
      impl = await element.getImpl(false);
      const templates = Services.templatesForDoc(env.ampdoc);
      env.sandbox.stub(templates, 'findAndRenderTemplate').resolves();
      env.sandbox.stub(impl, 'boundRendered_');
    });

    afterEach(() => {
      clock.uninstall();
    });

    // Unfortunately, we cannot test the most interesting case of UTC datetime
    // displayed in local, because the test would work in only one time zone.

    it('provides all variables in UTC and English (default)', async () => {
      element.setAttribute('datetime', '2001-02-03T04:05:06.007Z');
      element.setAttribute('display-in', 'UTC');
      await element.buildInternal();

      const data = impl.getDataForTemplate_();

      expect(data.year).to.equal(2001);
      expect(data.yearTwoDigit).to.equal('01');
      expect(data.month).to.equal(2);
      expect(data.monthTwoDigit).to.equal('02');
      expect(data.monthName).to.equal('February');
      expect(data.monthNameShort).to.equal('Feb');
      expect(data.day).to.equal(3);
      expect(data.dayTwoDigit).to.equal('03');
      expect(data.dayName).to.equal('Saturday');
      expect(data.dayNameShort).to.equal('Sat');
      expect(data.hour).to.equal(4);
      expect(data.hourTwoDigit).to.equal('04');
      expect(data.hour12).to.equal(4);
      expect(data.hour12TwoDigit).to.equal('04');
      expect(data.minute).to.equal(5);
      expect(data.minuteTwoDigit).to.equal('05');
      expect(data.second).to.equal(6);
      expect(data.secondTwoDigit).to.equal('06');
      expect(data.dayPeriod).to.equal('am');
    });

    it('provides all variables in local and English (default)', async () => {
      element.setAttribute('datetime', '2001-02-03T04:05:06.007');
      await element.buildInternal();

      const data = impl.getDataForTemplate_();

      expect(data.year).to.equal(2001);
      expect(data.yearTwoDigit).to.equal('01');
      expect(data.month).to.equal(2);
      expect(data.monthTwoDigit).to.equal('02');
      expect(data.monthName).to.equal('February');
      expect(data.monthNameShort).to.equal('Feb');
      expect(data.day).to.equal(3);
      expect(data.dayTwoDigit).to.equal('03');
      expect(data.dayName).to.equal('Saturday');
      expect(data.dayNameShort).to.equal('Sat');
      expect(data.hour).to.equal(4);
      expect(data.hourTwoDigit).to.equal('04');
      expect(data.hour12).to.equal(4);
      expect(data.hour12TwoDigit).to.equal('04');
      expect(data.minute).to.equal(5);
      expect(data.minuteTwoDigit).to.equal('05');
      expect(data.second).to.equal(6);
      expect(data.secondTwoDigit).to.equal('06');
      expect(data.dayPeriod).to.equal('am');
    });

    describe('correctly parses', () => {
      it('now keyword', async () => {
        element.setAttribute('datetime', 'now');
        await element.buildInternal();

        const {iso} = impl.getDataForTemplate_();
        const dateFromParsed = new win.Date(iso);

        // Because of the runtime there could be a several ms difference.
        expect(dateFromParsed.getTime()).to.equal(win.Date.now());
      });

      it('day only ISO 8601 date', async () => {
        element.setAttribute('datetime', '2001-02-03');
        await element.buildInternal();
        expect(impl.getDataForTemplate_().iso).to.equal(
          '2001-02-03T00:00:00.000Z'
        );
      });

      it('full ISO 8601 date in UTC time zone', async () => {
        element.setAttribute('datetime', '2001-02-03T04:05:06.007Z');
        await element.buildInternal();
        expect(impl.getDataForTemplate_().iso).to.equal(
          '2001-02-03T04:05:06.007Z'
        );
      });

      it('full ISO 8601 date without time zone (interpreted as local)', async () => {
        element.setAttribute('datetime', '2001-02-03T04:05:06.007');
        await element.buildInternal();

        const data = impl.getDataForTemplate_();
        const result =
          `${data.year}-${data.monthTwoDigit}-${data.dayTwoDigit}` +
          `T${data.hourTwoDigit}:${data.minuteTwoDigit}:${data.secondTwoDigit}`;

        expect(result).to.equal('2001-02-03T04:05:06');
      });

      it('full ISO 8601 date in a custom time zone', async () => {
        element.setAttribute('datetime', '2001-02-03T04:05:06.007+08:00');
        await element.buildInternal();
        expect(impl.getDataForTemplate_().iso).to.equal(
          '2001-02-02T20:05:06.007Z'
        );
      });

      it('seconds since the UNIX epoch', async () => {
        element.setAttribute('timestamp-seconds', '981173106');
        await element.buildInternal();
        expect(impl.getDataForTemplate_().iso).to.equal(
          '2001-02-03T04:05:06.000Z'
        );
      });

      it('miliseconds since the UNIX epoch', async () => {
        element.setAttribute('timestamp-ms', '981173106007');
        await element.buildInternal();
        expect(impl.getDataForTemplate_().iso).to.equal(
          '2001-02-03T04:05:06.007Z'
        );
      });
    });

    it('adds offset seconds', async () => {
      element.setAttribute('datetime', '2001-02-03T04:05:06.007Z');
      element.setAttribute('offset-seconds', '1234567');
      await element.buildInternal();
      expect(impl.getDataForTemplate_().iso).to.equal(
        '2001-02-17T11:01:13.007Z'
      );
    });

    it('subtracts offset seconds', async () => {
      element.setAttribute('datetime', '2001-02-03T04:05:06.007Z');
      element.setAttribute('offset-seconds', '-1234567');
      await element.buildInternal();
      expect(impl.getDataForTemplate_().iso).to.equal(
        '2001-01-19T21:08:59.007Z'
      );
    });

    it('provides variables in Czech when "cs" locale is passed', async () => {
      element.setAttribute('datetime', '2001-02-03T04:05:06.007Z');
      element.setAttribute('display-in', 'UTC');
      element.setAttribute('locale', 'cs');
      await element.buildInternal();

      const data = impl.getDataForTemplate_();

      expect(data.monthName).to.equal('únor');
      expect(data.monthNameShort).to.equal('úno');
      expect(data.dayName).to.equal('sobota');
      expect(data.dayNameShort).to.equal('so');
    });
  }
);
