'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'dark theme - shopping CTA UI should display': async (page, name) => {
    const pageID = 'dark-theme';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },
};
