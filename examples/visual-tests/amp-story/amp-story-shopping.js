'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'dark theme - shopping CTA UI should display': async (page, name) => {
    const pageID = 'remote-dark-theme';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },
  'displays shopping PLP (product list page)': async (page, name) => {
    const pageID = 'inline-light-theme';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await page.tap(
      `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
    );
    await page.waitForSelector('.i-amphtml-story-draggable-drawer-open');
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-draggable-drawer-open',
    ]);
  },
};
