'use strict';

module.exports = {
  'shows half-half template with image on the left': async (
    page,
    unusedName
  ) => {
    await page.waitForTimeout(1600);
  },
  'shows half-half template with image on the right': async (
    page,
    unusedName
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#page1[active]');
  },
};
