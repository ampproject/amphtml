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

import * as Preact from '../../../../src/preact';
import {DateDisplay} from '../component';
import {mount} from 'enzyme';
import {user} from '../../../../src/log';

describes.sandboxed('DateDisplay 1.0 preact component', {}, (env) => {
  let sandbox;
  let clock;

  function render(data) {
    return JSON.stringify(
      data,
      (key, value) => {
        if (typeof value === 'number') {
          return String(value);
        }
        return value;
      },
      4
    );
  }

  beforeEach(() => {
    sandbox = env.sandbox;
    clock = sandbox.useFakeTimers(new Date('2018-01-01T08:00:00Z'));
  });

  afterEach(() => {
    clock.runAll();
  });

  function syncPromise(response) {
    return {
      then(callback) {
        callback(response);
      },
    };
  }

  // Unfortunately, we cannot test the most interesting case of UTC datetime
  // displayed in local, because the test would work in only one time zone.

  it('should render as a div by default', () => {
    const props = {
      render,
      datetime: Date.parse('2001-02-03T04:05:06.007Z'),
      displayIn: 'UTC',
    };
    const jsx = <DateDisplay {...props} />;

    const wrapper = mount(jsx);

    // This is actually fairly arbitrary that it should be a "div". But it's
    // checked here to ensure that we can change it controllably when needed.
    expect(wrapper.getDOMNode().tagName).to.equal('DIV');
  });

  it('provides all variables in UTC and English (default)', () => {
    const props = {
      render,
      datetime: Date.parse('2001-02-03T04:05:06.007Z'),
      displayIn: 'UTC',
    };
    const jsx = <DateDisplay {...props} />;

    const wrapper = mount(jsx);
    const data = JSON.parse(wrapper.text());

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

  it('should handle an async renderer', () => {
    const props = {
      render: (data) => syncPromise(render(data)),
      datetime: Date.parse('2001-02-03T04:05:06.007Z'),
      displayIn: 'UTC',
    };
    const jsx = <DateDisplay {...props} />;

    const wrapper = mount(jsx);
    const data = JSON.parse(wrapper.text());
    expect(data.year).to.equal('2001');
    expect(data.yearTwoDigit).to.equal('01');
  });

  it('should use a default renderer in UTC', () => {
    const props = {
      datetime: Date.parse('2001-02-03T04:05:06.007Z'),
      displayIn: 'UTC',
    };
    const jsx = <DateDisplay {...props} />;

    const wrapper = mount(jsx);
    expect(wrapper.text()).to.equal('Feb 3, 2001, 4:05 AM');
  });

  it('accepts Date type', () => {
    const props = {
      render,
      datetime: new Date('2001-02-03T04:05:06.007Z'),
      displayIn: 'UTC',
    };
    const jsx = <DateDisplay {...props} />;

    const wrapper = mount(jsx);
    const data = JSON.parse(wrapper.text());

    expect(data.year).to.equal('2001');
    expect(data.yearTwoDigit).to.equal('01');
    expect(data.month).to.equal('2');
  });

  it('accepts string type', () => {
    const props = {
      render,
      datetime: '2001-02-03T04:05:06.007Z',
      displayIn: 'UTC',
    };
    const jsx = <DateDisplay {...props} />;

    const wrapper = mount(jsx);
    const data = JSON.parse(wrapper.text());

    expect(data.year).to.equal('2001');
    expect(data.yearTwoDigit).to.equal('01');
    expect(data.month).to.equal('2');
  });

  it('provides all variables in local and English (default)', () => {
    const props = {
      render,
      datetime: Date.parse('2001-02-03T04:05:06.007'),
    };
    const jsx = <DateDisplay {...props} />;

    const wrapper = mount(jsx);
    const data = JSON.parse(wrapper.text());

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

  it('provides variables in Czech when "cs" locale is passed', () => {
    const props = {
      render,
      datetime: Date.parse('2001-02-03T04:05:06.007Z'),
      displayIn: 'UTC',
      locale: 'cs',
    };
    const jsx = <DateDisplay {...props} />;

    const wrapper = mount(jsx);
    const data = JSON.parse(wrapper.text());

    expect(data.monthName).to.equal('únor');
    expect(data.monthNameShort).to.equal('úno');
    expect(data.dayName).to.equal('sobota');
    expect(data.dayNameShort).to.equal('so');
  });

  it('shows custom locale string when localeOptions is passed', () => {
    const props = {
      render,
      datetime: Date.parse('2001-02-03T04:05:06.007Z'),
      displayIn: 'UTC',
      locale: 'zh-TW',
      localeOptions: {timeStyle: 'short'},
    };
    const jsx = <DateDisplay {...props} />;

    const wrapper = mount(jsx);
    const data = JSON.parse(wrapper.text());

    expect(data.localeString).to.equal('上午4:05');
  });

  describe('invalid data-options-* settings', () => {
    it('throws error when invalid localeOptions is passed', () => {
      const spy = env.sandbox.stub(user(), 'error');
      const props = {
        render,
        datetime: Date.parse('2001-02-03T04:05:06.007Z'),
        displayIn: 'UTC',
        locale: 'zh-TW',
        localeOptions: {timeStyle: 'invalid'},
      };
      const jsx = <DateDisplay {...props} />;

      const wrapper = mount(jsx);
      const data = JSON.parse(wrapper.text());

      expect(spy.args[0][1]).to.equal('localeOptions');
      expect(spy.args[0][2]).to.match(/RangeError/);
      expect(data.localeString).to.be.undefined;
    });

    it('ignores the attr when invalid data-options-attr is provided', () => {
      const props = {
        render,
        datetime: Date.parse('2001-02-03T04:05:06.007Z'),
        displayIn: 'UTC',
        locale: 'zh-TW',
        localeOptions: {invalid: 'invalid'},
      };
      const jsx = <DateDisplay {...props} />;

      const wrapper = mount(jsx);
      const data = JSON.parse(wrapper.text());

      expect(data.localeString).to.equal('2001/2/3 上午4:05:06');
    });
  });
});
