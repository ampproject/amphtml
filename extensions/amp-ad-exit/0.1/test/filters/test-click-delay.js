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

import * as sinon from 'sinon';
import {ClickDelayFilter} from '../../filters/click-delay';
import {FilterType} from '../../filters/filter';

describe('click-delay', () => {
  const DEFAULT_CONFIG = {
    type: FilterType.CLICK_DELAY,
    delay: 123,
    startTimingEvent: 'navigationStart',
  };

  describe('should fail on invalid configs', () => {
    const invalid = 'Invalid ClickDelay spec';
    const browserSupport = 'Browser does not support performance timing';
    const win = {performance: {timing: {'navigationStart': 456}}};
    const tests = [
      {config: {type: 'bar', delay: 123}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY, delay: 0}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY, delay: -1}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY, delay: 'ac'}, win, err: invalid},
      {config: DEFAULT_CONFIG, win: {}, err: browserSupport},
      {config: DEFAULT_CONFIG, win: {performance: {}}, err: browserSupport},
      {config: DEFAULT_CONFIG, win: {performance: {timing: {}}}, err:
          'Invalid performance timing event type navigationStart​​​'},
    ];
    tests.forEach(test => {
      it(`should throw ${test.err} with config ` +
         `${JSON.stringify(test.config)} and win ${JSON.stringify(test.win)}`,
      () => allowConsoleError(() => expect(() => new ClickDelayFilter(
          'foo', test.config, test.win)).to.throw(test.err)));
    });
  });

  describe('#filter', () => {
    let sandbox;
    beforeEach(() => sandbox = sinon.sandbox.create());
    afterEach(() => sandbox.restore());

    it('should filter based on timing event', () => {
      const nowStub = sandbox.stub(Date, 'now');
      nowStub.onFirstCall().returns(2);
      nowStub.onSecondCall().returns(125);
      const filter = new ClickDelayFilter(
          'foo', DEFAULT_CONFIG, {performance: {timing: {navigationStart: 1}}});
      expect(filter.filter()).to.be.false;
      expect(filter.filter()).to.be.true;
    });
  });
});
