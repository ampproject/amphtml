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
import '../../../../third_party/react-dates/bundle';
import * as lolex from 'lolex';
import {requireExternal} from '../../../../src/module';
import {wrap as withMaximumNights} from '../wrappers/maximum-nights';

describes.sandboxed('amp-date-picker', {}, () => {
  const moment = requireExternal('moment');
  let clock;

  function FakeDatePicker() {
    return 'amp-date-picker';
  }

  beforeEach(() => {
    clock = lolex.install({
      // Use the global window and not env.win. There is no way to inject the
      // env.win into moment right now.
      target: window,
      now: new Date('2018-01-01T08:00:00Z'),
    });
  });

  afterEach(() => {
    clock.uninstall();
  });

  describe('wrapper maximum-nights', () => {
    it('should pass through if maximum nights is not set', async () => {
      const {getIsOutsideRange} = withMaximumNights(FakeDatePicker);
      const props = {
        isOutsideRange: () => false,
        startDate: null,
        endDate: null,
        focusedInput: 'startDate',
        maximumNights: null,
      };

      const isOutsideRange = getIsOutsideRange(props);
      expect(isOutsideRange(moment('2018-01-01'))).to.be.false;
    });

    it('should match end dates beyond the maximum-night props', async () => {
      const {getIsOutsideRange} = withMaximumNights(FakeDatePicker);
      const props = {
        isOutsideRange: () => false,
        startDate: moment('2018-01-01'),
        endDate: null,
        focusedInput: 'endDate',
        maximumNights: 7,
      };

      const isOutsideRange = getIsOutsideRange(props);
      expect(isOutsideRange(moment('2018-01-09'))).to.be.true;
    });

    it('should match start dates beyond the maximum-night props', async () => {
      const {getIsOutsideRange} = withMaximumNights(FakeDatePicker);
      const props = {
        isOutsideRange: () => false,
        startDate: null,
        endDate: moment('2018-01-09'),
        focusedInput: 'startDate',
        maximumNights: 7,
      };

      const isOutsideRange = getIsOutsideRange(props);
      expect(isOutsideRange(moment('2018-01-01'))).to.be.true;
    });

    it('should combine with the outer isOutsideRange prop', async () => {
      const {getIsOutsideRange} = withMaximumNights(FakeDatePicker);
      const props = {
        isOutsideRange: (date) => moment('2018-01-04').isSame(date),
        startDate: moment('2018-01-01'),
        endDate: null,
        focusedInput: 'startDate',
        maximumNights: 7,
      };

      const isOutsideRange = getIsOutsideRange(props);
      expect(isOutsideRange(moment('2018-01-04'))).to.be.true;
    });
  });
});
