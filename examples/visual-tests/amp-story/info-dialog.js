'use strict';

module.exports = {
  'show after button click': async (page) => {
    await page.waitForSelector('.i-amphtml-story-loaded');
    await page.tap('.i-amphtml-story-info-control');
    await page.waitForSelector('.i-amphtml-story-info-dialog');
  },
};
