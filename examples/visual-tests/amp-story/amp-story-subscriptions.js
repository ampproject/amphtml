'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'paywall UI should display after navigating to the paywall page': async (
    page,
    name
  ) => {
    const pageID = 'page-2';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(`amp-subscriptions-dialog:not([hidden])`);
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-subscriptions-visible',
    ]);
  },
  'paywall UI should display after deep linking to the locked page after paywall page':
    async (page, name) => {
      const pageID = 'page-3';
      const url = await page.url();
      await page.goto(`${url}#page=${pageID}`);
      await page.waitForSelector(`amp-subscriptions-dialog:not([hidden])`);
      await verifySelectorsVisible(page, name, [
        '.i-amphtml-story-subscriptions-visible',
      ]);
    },
};
