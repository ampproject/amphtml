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
import {waitFor} from '../../../../testing/test-helper.js';
import {whenUpgradedToCustomElement} from '../../../../src/dom';

describes.realWin(
  'amp-date-display 1.0',
  {
    amp: {
      extensions: ['amp-mustache:0.2', 'amp-date-display:1.0'],
    },
  },
  (env) => {
    let win;
    let element, template;

    async function waitRendered() {
      await whenUpgradedToCustomElement(element);
      await element.buildInternal();
      await waitFor(() => {
        // The rendered container inserts a <div> element.
        const div = element.querySelector('div');
        return div && div.textContent;
      }, 'wrapper div rendered');
      return element.querySelector('div');
    }

    async function getRenderedData() {
      const wrapper = await waitRendered();
      return JSON.parse(wrapper.textContent);
    }

    beforeEach(() => {
      win = env.win;

      element = win.document.createElement('amp-date-display');
      template = win.document.createElement('template');
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

    it('renders mustache template with "timestamp-ms"', async () => {
      element.setAttribute(
        'timestamp-ms',
        Date.parse('2001-02-03T04:05:06.007Z')
      );
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

    it('renders default template into element', async () => {
      element.setAttribute('datetime', '2001-02-03T04:05:06.007Z');
      element.setAttribute('display-in', 'UTC');
      element.removeChild(template);
      win.document.body.appendChild(element);

      const wrapper = await waitRendered();
      expect(wrapper.textContent).to.contain('2001');
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
