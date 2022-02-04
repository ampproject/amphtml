'use strict';

const {
  verifySelectorsInvisible,
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'tapping on a clickable anchor should show the tooltip': async (
    page,
    name
  ) => {
    const screen = page.touchscreen;
    await screen.tap(200, 240);
    await page.waitForSelector('amp-story-page#page-2[active]');
    await page.waitForTimeout(500); // For animations to finish.
    await page.tap('a.title-small.center');
    await page.waitForTimeout(300); // For animations to finish.
    await verifySelectorsVisible(page, name, ['a.i-amphtml-story-tooltip']);
  },
  'tapping outside tooltip should hide it': async (page, name) => {
    const screen = page.touchscreen;
    await screen.tap(200, 240);
    await page.waitForSelector('amp-story-page#page-2[active]');
    await page.waitForTimeout(150); // For animations to finish.
    await page.tap('a.title-small.center');
    await page.waitForSelector('a.i-amphtml-story-tooltip');
    await page.waitForTimeout(300); // For animations to finish.
    await page.tap('.i-amphtml-story-focused-state-layer');
    await page.waitForTimeout(150); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-focused-state-layer.i-amphtml-hidden',
    ]);
  },
  'tapping arrow when tooltip is open should navigate': async (page, name) => {
    const screen = page.touchscreen;
    await screen.tap(200, 240);
    await page.waitForSelector('amp-story-page#page-2[active]');
    await page.waitForTimeout(150); // For animations to finish.
    await page.tap('a.title-small.center');
    await page.waitForSelector('a.i-amphtml-story-tooltip');
    await page.waitForTimeout(300); // For animations to finish.
    await page.tap('button.i-amphtml-story-tooltip-nav-button-left');
    await page.waitForTimeout(150); // For animations to finish.
    await verifySelectorsVisible(page, name, ['amp-story-page#cover[active]']);
  },
  'tapping on non-interactive embed should not show tooltip or block navigation':
    async (page, name) => {
      const screen = page.touchscreen;
      await screen.tap(200, 240);
      await page.waitForSelector('amp-story-page#page-2[active]');
      await page.waitForTimeout(150); // For animations to finish.
      await screen.tap(300, 400);
      await page.waitForSelector('amp-story-page#page-3[active]');
      await page.waitForTimeout(150); // For animations to finish.
      await page.tap('amp-twitter.non-interactive-embed');
      await page.waitForTimeout(150); // For animations to finish.
      await verifySelectorsInvisible(page, name, ['a.i-amphtml-story-tooltip']);
      await verifySelectorsVisible(page, name, [
        'amp-story-page#page-2[active]',
      ]);
    },
};
