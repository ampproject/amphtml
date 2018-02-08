import {RTC_VENDORS} from '../callout-vendors';

// The keys of RTC_VENDORS are not allowed to have any capital letters.
// This test acts as a presubmit to enforce that.
describe('RTC_VENDORS', () => {
  it('should have all lowercase keys', () => {
    Object.keys(RTC_VENDORS).forEach(key => expect(key).to.equal(key.toLowerCase()));
  });
});
