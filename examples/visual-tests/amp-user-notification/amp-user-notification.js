'use strict';

module.exports = {
  'dismiss user notification': async (page, unusedName) => {
    await page.tap('amp-user-notification>button');
    await page.waitForTimeout(500);
  },
};
