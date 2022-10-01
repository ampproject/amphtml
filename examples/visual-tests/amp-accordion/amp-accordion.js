'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'click section one': async (page, name) => {
    await page.tap('amp-accordion section:first-child');
    await verifySelectorsVisible(page, name, [
      'amp-accordion section:first-child[expanded] .i-amphtml-accordion-content',
    ]);
  },
};
