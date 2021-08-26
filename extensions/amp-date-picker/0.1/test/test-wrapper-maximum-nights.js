import '#third_party/react-dates/bundle';
import * as fakeTimers from '@sinonjs/fake-timers';

import {requireExternal} from '../../../../src/module';
import {wrap as withMaximumNights} from '../wrappers/maximum-nights';

describes.sandboxed('amp-date-picker', {}, () => {
  const moment = requireExternal('moment');
  let clock;

  function FakeDatePicker() {
    return 'amp-date-picker';
  }

  beforeEach(() => {
    // Use the global window and not env.win. There is no way to inject the
    // env.win into moment right now.
    clock = fakeTimers.withGlobal(window).install({
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
