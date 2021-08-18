'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'try to submit without input': async (page, name) => {
    await page.tap('#submit');
    await verifySelectorsVisible(page, name, [
      '#form.user-invalid',
      'span[visible-when-invalid="valueMissing"][validation-for="name"].visible',
      'span[visible-when-invalid="valueMissing"][validation-for="email"].visible',
    ]);
  },

  'try to submit with invalid input': async (page, name) => {
    await page.tap('#name');
    await page.keyboard.type('hello');
    await page.keyboard.press('Tab');
    await page.keyboard.type('not.an.email.address');
    await page.tap('#submit');
    await verifySelectorsVisible(page, name, [
      '#form.user-invalid',
      'span[visible-when-invalid="patternMismatch"][validation-for="name"].visible',
      'span[visible-when-invalid="typeMismatch"][validation-for="email"].visible',
    ]);
  },

  'try to submit with valid input': async (page, name) => {
    await page.tap('#name');
    await page.keyboard.type('Jane Miller');
    await page.tap('#email');
    await page.keyboard.type('jane.miller@ampproject.org');
    await page.tap('#submit');
    await verifySelectorsVisible(page, name, [
      '#form.user-valid',
      'div[submit-success] div[id^="rendered-message-amp-form-"]',
    ]);
  },

  // TODO(danielrozenberg): fix and restore this test
  /*
  'try to submit to a dead server': async (page, name) => {
    page.on('request', interceptedRequest => interceptedRequest.abort());

    await page.tap('#name');
    await page.keyboard.type('Jane Miller');
    await page.tap('#email');
    await page.keyboard.type('jane.miller@ampproject.org');
    await page.tap('#submit');
    await verifySelectorsVisible(page, name, [
      '#form.user-valid',
      'div[submit-error] div[id^="rendered-message-amp-form-"]',
    ]);
  }
  */
};
