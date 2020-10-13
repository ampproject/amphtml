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

import '../../../amp-mustache/0.2/amp-mustache';
import {parseDateAttrs} from '../amp-date-countdown';
import {waitFor} from '../../../../testing/test-helper.js';
import {whenUpgradedToCustomElement} from '../../../../src/dom';

describes.realWin(
  'amp-date-countdown 1.0',
  {
    amp: {
      extensions: ['amp-mustache:0.2', 'amp-date-countdown:1.0'],
    },
  },
  (env) => {
    let win;
    let element, template;
    let originalDateNow;

    async function waitRendered() {
      await whenUpgradedToCustomElement(element);
      await element.build();
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
      element = win.document.createElement('amp-date-countdown');
      template = win.document.createElement('template');
      template.setAttribute('type', 'amp-mustache');
      template.content.textContent = JSON.stringify({
        years: '{{years}}',
        months: '{{months}}',
        days: '{{days}}',
        hours: '{{hours}}',
        minutes: '{{minutes}}',
        seconds: '{{seconds}}',
        d: '{{d}}',
        dd: '{{dd}}',
        h: '{{h}}',
        hh: '{{hh}}',
        m: '{{m}}',
        mm: '{{mm}}',
        s: '{{s}}',
        ss: '{{ss}}',
      });
      element.appendChild(template);
      element.setAttribute('layout', 'nodisplay');

      // Mock Date.now()
      originalDateNow = Date.now;
      const mockedDateNow = () => Date.parse('2018-01-01T08:00:00Z');
      Date.now = mockedDateNow;
    });

    afterEach(() => {
      // Replace Date.now with its original native function
      Date.now = originalDateNow;
    });

    it('renders mustache template into element', async () => {
      element.setAttribute('end-date', '2018-01-01T08:00:10Z');
      win.document.body.appendChild(element);

      const data = await getRenderedData();

      expect(data['d']).to.equal('0');
      expect(data['dd']).to.equal('00');
      expect(data['h']).to.equal('0');
      expect(data['hh']).to.equal('00');
      expect(data['m']).to.equal('0');
      expect(data['mm']).to.equal('00');
      expect(data['s']).to.equal('11');
      expect(data['ss']).to.equal('11');

      expect(data['years']).to.equal('Years');
      expect(data['months']).to.equal('Months');
      expect(data['days']).to.equal('Days');
      expect(data['hours']).to.equal('Hours');
      expect(data['minutes']).to.equal('Minutes');
      expect(data['seconds']).to.equal('Seconds');
    });

    it('renders default template into element', async () => {
      element.setAttribute('end-date', '2018-01-01T08:00:10Z');
      element.removeChild(template);
      win.document.body.appendChild(element);

      const wrapper = await waitRendered();
      expect(wrapper.textContent).to.equal(
        'Days 00, Hours 00, Minutes 00, Seconds 11'
      );
    });

    it('renders template with end-date attribute', async () => {
      element.setAttribute('end-date', '2018-01-01T08:00:10Z');
      win.document.body.appendChild(element);

      const data = await getRenderedData();

      // component adds 1 second delay for real world execution delay
      expect(data['d']).to.equal('0');
      expect(data['dd']).to.equal('00');
      expect(data['h']).to.equal('0');
      expect(data['hh']).to.equal('00');
      expect(data['m']).to.equal('0');
      expect(data['mm']).to.equal('00');
      expect(data['s']).to.equal('11');
      expect(data['ss']).to.equal('11');
    });

    it('renders template with timeleft-ms attribute', async () => {
      // count to 10 seconds (10000ms) from now
      element.setAttribute('timeleft-ms', '10000');
      win.document.body.appendChild(element);

      const data = await getRenderedData();

      // component adds 1 second delay for real world execution delay
      expect(data['d']).to.equal('0');
      expect(data['dd']).to.equal('00');
      expect(data['h']).to.equal('0');
      expect(data['hh']).to.equal('00');
      expect(data['m']).to.equal('0');
      expect(data['mm']).to.equal('00');
      expect(data['s']).to.equal('11');
      expect(data['ss']).to.equal('11');
    });

    it('renders template with timestamp-ms attribute', async () => {
      // this is epoch time of '2018-01-01T08:00:10Z'
      // clock starts with 10 seconds on it
      element.setAttribute('timestamp-ms', Date.parse('2018-01-01T08:00:10Z'));
      win.document.body.appendChild(element);

      const data = await getRenderedData();

      // component adds 1 second delay for real world execution delay
      expect(data['d']).to.equal('0');
      expect(data['dd']).to.equal('00');
      expect(data['h']).to.equal('0');
      expect(data['hh']).to.equal('00');
      expect(data['m']).to.equal('0');
      expect(data['mm']).to.equal('00');
      expect(data['s']).to.equal('11');
      expect(data['ss']).to.equal('11');
    });

    it('renders template with timestamp-seconds attribute', async () => {
      // this is epoch time of '2018-01-01T08:00:10Z'
      // clock starts with 10 seconds on it
      element.setAttribute(
        'timestamp-seconds',
        Date.parse('2018-01-01T08:00:10Z') / 1000
      );
      win.document.body.appendChild(element);

      const data = await getRenderedData();

      // component adds 1 second delay for real world execution delay
      expect(data['d']).to.equal('0');
      expect(data['dd']).to.equal('00');
      expect(data['h']).to.equal('0');
      expect(data['hh']).to.equal('00');
      expect(data['m']).to.equal('0');
      expect(data['mm']).to.equal('00');
      expect(data['s']).to.equal('11');
      expect(data['ss']).to.equal('11');
    });

    it('renders template with offset-seconds attribute', async () => {
      element.setAttribute('end-date', '2018-01-01T08:00:10Z');
      element.setAttribute('offset-seconds', '10');
      win.document.body.appendChild(element);

      const data = await getRenderedData();

      // component adds 1 second delay for real world execution delay
      expect(data['d']).to.equal('0');
      expect(data['dd']).to.equal('00');
      expect(data['h']).to.equal('0');
      expect(data['hh']).to.equal('00');
      expect(data['m']).to.equal('0');
      expect(data['mm']).to.equal('00');
      expect(data['s']).to.equal('21');
      expect(data['ss']).to.equal('21');
    });
  }
);

describes.sandboxed('amp-date-countdown 1.0: parseDateAttrs', {}, (env) => {
  const DATE = new Date(1514793600000);
  const DATE_STRING = DATE.toISOString();

  let element;

  beforeEach(() => {
    element = document.createElement('amp-date-countdown');
  });

  it('should throw when no date is specified', () => {
    allowConsoleError(() => {
      expect(() => parseDateAttrs(element)).to.throw(/required/);
    });
  });

  it('should throw when invalid date is specified', () => {
    element.setAttribute('end-date', 'invalid');
    allowConsoleError(() => {
      expect(() => parseDateAttrs(element)).to.throw(/Invalid date/);
    });
  });

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

  it('should parse the "timestamp-ms" attribute', () => {
    element.setAttribute('timestamp-ms', DATE.getTime());
    expect(parseDateAttrs(element)).to.equal(DATE.getTime());

    // With offset.
    element.setAttribute('offset-seconds', '1');
    expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 1000);
  });

  it('should throw when invalid "timestamp-ms" is specified', () => {
    element.setAttribute('timestamp-ms', 'invalid');
    allowConsoleError(() => {
      expect(() => parseDateAttrs(element)).to.throw(/required/);
    });
  });

  it('should parse the "timestamp-seconds" attribute', () => {
    element.setAttribute('timestamp-seconds', DATE.getTime() / 1000);
    expect(parseDateAttrs(element)).to.equal(DATE.getTime());

    // With offset.
    element.setAttribute('offset-seconds', '1');
    expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 1000);
  });

  it('should throw when invalid "timestamp-seconds" is specified', () => {
    element.setAttribute('timestamp-seconds', 'invalid');
    allowConsoleError(() => {
      expect(() => parseDateAttrs(element)).to.throw(/required/);
    });
  });
});
