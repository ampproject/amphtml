'use strict';

module.exports = {
  'show after button click': async (page) => {
    await page.waitForSelector('.i-amphtml-story-loaded');
    await page.tap('.i-amphtml-story-share-control');
    await page.waitForSelector('.i-amphtml-story-share-menu');
  },
};
