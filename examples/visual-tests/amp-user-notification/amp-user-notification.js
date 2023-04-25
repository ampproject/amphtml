'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'dismiss user notification': async (page, name) => {
    await page.tap('amp-user-notification>button');
    await page.waitForTimeout(500);
    await verifySelectorsVisible(page, name, ['.i-amphtml-ad-default-holder']);
  },
};
