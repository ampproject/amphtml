'use strict';

const {
  verifySelectorsInvisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'tap "see more" button': async (page, name) => {
    await page.tap('div.amp-visible[overflow]');
    await verifySelectorsInvisible(page, name, ['div.amp-visible[overflow]']);
  },
};
