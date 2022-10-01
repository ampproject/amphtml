/**
 * @fileoverview Description of this file.
 */

'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'open sidebar toolbar': async (page, name) => {
    await page.tap('[on="tap:sidebar.toggle"]');
    await verifySelectorsVisible(page, name, ['amp-sidebar[open]']);
    await verifySelectorsVisible(page, name, ['nav[toolbar]']);
  },
};
