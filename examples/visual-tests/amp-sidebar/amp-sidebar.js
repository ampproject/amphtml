'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'open sidebar': async (page, name) => {
    await page.tap('[on="tap:sidebar1.toggle"]');
    await verifySelectorsVisible(page, name, ['amp-sidebar[open]']);
  },
};
