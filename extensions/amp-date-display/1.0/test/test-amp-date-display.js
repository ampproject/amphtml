/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import '../../../amp-mustache/0.2/amp-mustache';
import '../amp-date-display';
import * as lolex from 'lolex';
import {
  waitForChildPromise,
  whenUpgradedToCustomElement,
} from '../../../../src/dom';

describes.realWin(
  'amp-date-display 1.0',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-mustache:0.2', 'amp-date-display:1.0'],
    },
  },
  (env) => {
    let win;
    let element;
    let clock;

    async function getRenderedData() {
      await whenUpgradedToCustomElement(element);
      await element.whenBuilt();
      await waitForChildPromise(element, () => {
        // The rendered container inserts a div element.
        return element.querySelector('div');
      });

      return JSON.parse(element.textContent);
    }

    beforeEach(() => {
      win = env.win;
      clock = lolex.install({
        target: window,
        now: new Date('2018-01-01T08:00:00Z'),
      });

      element = win.document.createElement('amp-date-display');
      const template = win.document.createElement('template');
      template.setAttribute('type', 'amp-mustache');
      template.content.textContent = JSON.stringify({
        year: '{{year}}',
        yearTwoDigit: '{{yearTwoDigit}}',
        month: '{{month}}',
        monthTwoDigit: '{{monthTwoDigit}}',
        monthName: '{{monthName}}',
        monthNameShort: '{{monthNameShort}}',
        day: '{{day}}',
        dayTwoDigit: '{{dayTwoDigit}}',
        dayName: '{{dayName}}',
        dayNameShort: '{{dayNameShort}}',
        hour: '{{hour}}',
        hourTwoDigit: '{{hourTwoDigit}}',
        hour12: '{{hour12}}',
        hour12TwoDigit: '{{hour12TwoDigit}}',
        minute: '{{minute}}',
        minuteTwoDigit: '{{minuteTwoDigit}}',
        second: '{{second}}',
        secondTwoDigit: '{{secondTwoDigit}}',
        dayPeriod: '{{dayPeriod}}',
        iso: '{{iso}}',
      });
      element.appendChild(template);
      element.setAttribute('layout', 'nodisplay');
    });

    afterEach(() => {
      clock.runAll();
      clock.uninstall();
    });

    it('renders mustache template into element', async () => {
      element.setAttribute('datetime', '2001-02-03T04:05:06.007Z');
      element.setAttribute('display-in', 'UTC');
      win.document.body.appendChild(element);

      const data = await getRenderedData();

      expect(data.year).to.equal('2001');
      expect(data.yearTwoDigit).to.equal('01');
      expect(data.month).to.equal('2');
      expect(data.monthTwoDigit).to.equal('02');
      expect(data.monthName).to.equal('February');
      expect(data.monthNameShort).to.equal('Feb');
      expect(data.day).to.equal('3');
      expect(data.dayTwoDigit).to.equal('03');
      expect(data.dayName).to.equal('Saturday');
      expect(data.dayNameShort).to.equal('Sat');
      expect(data.hour).to.equal('4');
      expect(data.hourTwoDigit).to.equal('04');
      expect(data.hour12).to.equal('4');
      expect(data.hour12TwoDigit).to.equal('04');
      expect(data.minute).to.equal('5');
      expect(data.minuteTwoDigit).to.equal('05');
      expect(data.second).to.equal('6');
      expect(data.secondTwoDigit).to.equal('06');
      expect(data.dayPeriod).to.equal('am');
    });

    it('does not rerender', async () => {
      element.setAttribute('datetime', '2001-02-03T04:05:06.007Z');
      win.document.body.appendChild(element);

      await getRenderedData();

      const mo = new MutationObserver(() => {});
      mo.observe(element, {childList: true, subtree: true});

      element.setAttribute('datetime', '2002-02-03T04:05:06.007Z');
      element.mutatedAttributesCallback({datetime: '2002-02-03T04:05:06.007Z'});

      const records = mo.takeRecords();
      expect(records).to.be.empty;
    });
  }
);
