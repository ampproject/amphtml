'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'try to submit to a dead server': async (page, name) => {
    await page.tap('#name');
    await page.keyboard.type('Jane Miller');
    await page.tap('#email');
    await page.keyboard.type('jane.miller@ampproject.org');
    await page.tap('#submit');
    await verifySelectorsVisible(page, name, [
      '#form.user-valid',
      'div[submit-error] div[id^="rendered-message-amp-form-"]',
    ]);
  },
};
