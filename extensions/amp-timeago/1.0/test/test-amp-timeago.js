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
import {parseDateAttrs} from '../amp-timeago';
import {toggleExperiment} from '../../../../src/experiments';
import {waitFor} from '../../../../testing/test-helper.js';

describes.realWin(
  'amp-timeago 1.0',
  {
    amp: {
      extensions: ['amp-timeago:1.0'],
    },
  },
  (env) => {
    let win;
    let element;

    const getTimeFromShadow = async () => {
      await element.build();
      const getTimeContent = () =>
        element.shadowRoot &&
        element.shadowRoot.querySelector('time') &&
        element.shadowRoot.querySelector('time').textContent;
      await waitFor(getTimeContent, 'Timeago rendered');
      return getTimeContent();
    };

    const getTimeFromSlot = async () => {
      await element.build();
      const getTimeContent = () => {
        const slot =
          element.shadowRoot && element.shadowRoot.querySelector('slot');
        if (!slot) {
          return null;
        }
        return slot
          .assignedNodes()
          .map((n) => n.textContent)
          .join('')
          .trim();
      };
      await waitFor(getTimeContent, 'Timeago rendered as slot');
      return getTimeContent();
    };

    beforeEach(() => {
      win = env.win;
      toggleExperiment(win, 'amp-timeago-bento', true);

      element = win.document.createElement('amp-timeago');
      element.setAttribute('layout', 'fixed');
      element.setAttribute('width', '160px');
      element.setAttribute('height', '20px');
    });

    afterEach(() => {
      toggleExperiment(win, 'amp-timeago-bento', false);
    });

    it('should render display 2 days ago when built', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      win.document.body.appendChild(element);
      const time = await getTimeFromShadow();
      expect(time).to.equal('2 days ago');
    });

    it('should render display 2 days ago using "timestamp-ms"', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('timestamp-ms', date.getTime());
      element.textContent = date.toString();
      win.document.body.appendChild(element);
      const time = await getTimeFromShadow();
      expect(time).to.equal('2 days ago');
    });

    it('should display original date when older than cutoff', async () => {
      const date = new Date('2017-01-01');
      element.setAttribute('datetime', date.toISOString());
      element.textContent = 'Sunday 1 January 2017';
      element.setAttribute('cutoff', '8640000');
      win.document.body.appendChild(element);
      const time = await getTimeFromSlot();
      expect(time).to.equal('Sunday 1 January 2017');
    });

    it('should update after mutation of datetime attribute', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      win.document.body.appendChild(element);
      date.setDate(date.getDate() + 1);
      element.setAttribute('datetime', date.toString());
      element.mutatedAttributesCallback({
        'datetime': date.toString(),
      });
      const time = await getTimeFromShadow();
      expect(time).to.equal('1 day ago');
    });
  }
);

describe('amp-timeago 1.0: parseDateAttrs', () => {
  const DATE = new Date(1514793600000);
  const DATE_STRING = DATE.toISOString();

  let element;

  beforeEach(() => {
    element = document.createElement('amp-timeago');
  });

  it('should throw when no date is specified', () => {
    expect(() => parseDateAttrs(element)).to.throw(/Invalid date/);
  });

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

  it('should parse the "timestamp-ms" attribute', () => {
    element.setAttribute('timestamp-ms', DATE.getTime());
    expect(parseDateAttrs(element)).to.equal(DATE.getTime());

    // With offset.
    element.setAttribute('offset-seconds', '1');
    expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 1000);
  });

  it('should parse the "timestamp-seconds" attribute', () => {
    element.setAttribute('timestamp-seconds', DATE.getTime() / 1000);
    expect(parseDateAttrs(element)).to.equal(DATE.getTime());

    // With offset.
    element.setAttribute('offset-seconds', '1');
    expect(parseDateAttrs(element)).to.equal(DATE.getTime() + 1000);
  });
});
