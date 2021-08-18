
'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'tapping on sidebar control button should show sidebar and opacity mask':
    async (page, name) => {
      const screen = page.touchscreen;
      await screen.tap(200, 240);
      await page.waitForSelector('amp-story-page#cover[active]');
      await page.tap('.i-amphtml-story-sidebar-control');
      await verifySelectorsVisible(page, name, [
        'amp-sidebar[side][open]',
        '.i-amphtml-story-opacity-mask',
      ]);
    },
  'tapping on element with sidebar close action should close opacity mask ':
    async (page, name) => {
      const screen = page.touchscreen;
      await screen.tap(200, 240);
      await page.waitForSelector('amp-story-page#cover[active]');
      await page.tap('.i-amphtml-story-sidebar-control');
      await page.waitForTimeout(400);
      await page.tap('button#close-button');
      await verifySelectorsVisible(page, name, [
        'amp-sidebar[hidden]',
        '.i-amphtml-story-opacity-mask[hidden]',
      ]);
    },
  'tapping on the opacity mask should close sidebar ': async (page, name) => {
    const screen = page.touchscreen;
    await screen.tap(200, 240);
    await page.waitForSelector('amp-story-page#cover[active]');
    await page.tap('.i-amphtml-story-sidebar-control');
    await screen.tap(200, 240);
    await verifySelectorsVisible(page, name, [
      'amp-sidebar[hidden]',
      '.i-amphtml-story-opacity-mask[hidden]',
    ]);
  },
};
