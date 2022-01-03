'use strict';

const {
  verifySelectorsInvisible,
  verifySelectorsVisible,
} = require('../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'single selector select option 2': async (page, name) => {
    await page.tap('#single_selector span[option="2"]');
    await verifySelectorsVisible(page, name, [
      '#single_selector span[option="2"][selected]',
    ]);
  },

  'single selector select option 2, then 3': async (page, name) => {
    await page.tap('#single_selector span[option="2"]');
    await page.waitForSelector('#single_selector span[option="2"][selected]');
    await page.tap('#single_selector span[option="3"]');
    await verifySelectorsVisible(page, name, [
      '#single_selector span[option="3"][selected]',
    ]);
  },

  'try to select disabled options': async (page) => {
    await page.tap('#multi_selector span[option="2"]');
    await page.tap('#disabled_selector span[option="2"]');
    await page.tap('#disabled_selector span[option="3"]');
    await page.waitForTimeout(100);
  },

  'change mutli select': async (page, name) => {
    await page.tap('#multi_selector span[option="1"]');
    await page.tap('#multi_selector span[option="4"]');
    await verifySelectorsInvisible(page, name, [
      '#multi_selector span[option="1"][selected]',
    ]);
    await verifySelectorsVisible(page, name, [
      '#multi_selector span[option="4"][selected]',
    ]);
  },
};
