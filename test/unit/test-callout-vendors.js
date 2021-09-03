import {RTC_VENDORS} from '#service/real-time-config/callout-vendors';

import {isSecureUrlDeprecated} from '../../src/url';

// The keys of RTC_VENDORS are not allowed to have any capital letters.
// This test acts as a presubmit to enforce that.
describes.sandboxed('RTC_VENDORS', {}, () => {
  it('should have all lowercase keys', () =>
    Object.keys(RTC_VENDORS).forEach((key) =>
      expect(key).to.equal(key.toLowerCase())
    ));
  it('should all use https', () =>
    Object.keys(RTC_VENDORS).forEach((key) => {
      expect(isSecureUrlDeprecated(RTC_VENDORS[key].url)).to.be.true;
      expect(
        !RTC_VENDORS[key].errorReportingUrl ||
          isSecureUrlDeprecated(RTC_VENDORS[key].errorReportingUrl)
      ).to.be.true;
    }));
});
