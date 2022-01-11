'use strict';

const {
  verifySelectorsInvisible,
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'tap input1 to focus and display results': async (page, name) => {
    await page.tap('input#input1');
    await verifySelectorsVisible(page, name, [
      'amp-autocomplete#autocomplete1 > .i-amphtml-autocomplete-results',
    ]);
  },

  'tap input-rtl to focus and display results': async (page, name) => {
    await page.tap('input#input-rtl');
    await verifySelectorsVisible(page, name, [
      'amp-autocomplete#autocomplete-rtl > .i-amphtml-autocomplete-results',
    ]);
  },

  'tap input2 to focus and display results': async (page, name) => {
    await page.tap('input#input2');
    await verifySelectorsVisible(page, name, [
      'amp-autocomplete#autocomplete2 > .i-amphtml-autocomplete-results',
    ]);
  },

  'type into inputInline to not display results': async (page, name) => {
    await page.tap('#inputInline');
    await page.keyboard.type('hello ');
    await verifySelectorsInvisible(page, name, [
      '#autocompleteInline > .i-amphtml-autocomplete-results',
    ]);
  },
};
