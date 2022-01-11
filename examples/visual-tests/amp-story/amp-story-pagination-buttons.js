'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'shows corresponding buttons for first page': async (page, name) => {
    await verifySelectorsVisible(page, name, [
      '.next-container > .i-amphtml-story-button-move',
      '.prev-container.i-amphtml-story-button-hidden',
    ]);
  },
  'shows corresponding buttons when there is a previous and next page': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#page-2[active]');
    await verifySelectorsVisible(page, name, [
      '.next-container > button.i-amphtml-story-button-move',
      '.prev-container > button.i-amphtml-story-button-move',
    ]);
  },
};
