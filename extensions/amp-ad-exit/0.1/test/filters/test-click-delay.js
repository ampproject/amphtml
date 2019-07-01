/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {ClickDelayFilter} from '../../filters/click-delay';
import {FilterType} from '../../filters/filter';

describe('click-delay', () => {
  const DEFAULT_CONFIG = {
    type: FilterType.CLICK_DELAY,
    delay: 123,
    startTimingEvent: 'navigationStart',
  };
  let sandbox;
  beforeEach(() => (sandbox = sinon.sandbox));
  afterEach(() => sandbox.restore());

  it('should use performance timing', () => {
    const win = {performance: {timing: {'navigationStart': 456}}};
    sandbox.stub(Date, 'now').returns(123);
    expect(
      new ClickDelayFilter('foo', DEFAULT_CONFIG, win).intervalStart
    ).to.equal(456);
  });

  describe('spec validation', () => {
    const invalid = 'Invalid ClickDelay spec';
    const win = {performance: {timing: {'navigationStart': 456}}};
    const tests = [
      {config: {type: 'bar', delay: 123}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY, delay: 0}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY, delay: -1}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY, delay: 'ac'}, win, err: invalid},
      {config: DEFAULT_CONFIG, win: {}},
      {config: DEFAULT_CONFIG, win: {performance: {}}},
      {config: DEFAULT_CONFIG, win: {performance: {timing: {}}}},
    ];
    tests.forEach(test => {
      it(
        `should properly handle ${JSON.stringify(test.config)} and win ` +
          `${JSON.stringify(test.win)}`,
        () => {
          if (test.err) {
            allowConsoleError(() =>
              expect(
                () => new ClickDelayFilter('foo', test.config, test.win)
              ).to.throw(win.err)
            );
          } else {
            sandbox.stub(Date, 'now').returns(123);
            expect(
              new ClickDelayFilter('foo', test.config, test.win).intervalStart
            ).to.equal(123);
          }
        }
      );
    });
  });

  describe('#filter', () => {
    it('should filter based on timing event', () => {
      const filter = new ClickDelayFilter('foo', DEFAULT_CONFIG, {
        performance: {timing: {navigationStart: 1}},
      });
      const nowStub = sandbox.stub(Date, 'now');
      nowStub.onFirstCall().returns(1001);
      expect(filter.filter()).to.be.true;
    });

    it('should filter based on timing event, second call', () => {
      const filter = new ClickDelayFilter('foo', DEFAULT_CONFIG, {
        performance: {timing: {navigationStart: 1}},
      });
      const nowStub = sandbox.stub(Date, 'now');
      nowStub.onFirstCall().returns(1);
      nowStub.onSecondCall().returns(125);
      expect(filter.filter()).to.be.false;
      expect(filter.filter()).to.be.true;
    });
  });
});
