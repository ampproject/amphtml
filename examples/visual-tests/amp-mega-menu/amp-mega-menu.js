'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'click menu item one': async (page, name) => {
    await page.waitForSelector(
      'amp-mega-menu .i-amphtml-mega-menu-item:first-child .i-amphtml-mega-menu-heading'
    );
    await page.tap(
      'amp-mega-menu .i-amphtml-mega-menu-item:first-child .i-amphtml-mega-menu-heading'
    );
    await page.waitForTimeout(400);
    await verifySelectorsVisible(page, name, [
      'amp-mega-menu[open] .i-amphtml-mega-menu-item:first-child[open] .i-amphtml-mega-menu-content',
      'amp-mega-menu[open] .i-amphtml-mega-menu-item:first-child[open] amp-img img',
    ]);
  },
};
