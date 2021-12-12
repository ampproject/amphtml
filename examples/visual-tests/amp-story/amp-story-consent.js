'use strict';

module.exports = {
  'accept consent': async (page, unusedName) => {
    await page.tap('[on="tap:myConsent.accept"]');
    await page.waitForSelector('amp-consent.amp-hidden');
  },

  'reject consent': async (page, unusedName) => {
    await page.tap('[on="tap:myConsent.reject"]');
    await page.waitForSelector('amp-consent.amp-hidden');
  },
};
