'use strict';

const {sleep} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'player ready': async (page) => {
    await sleep(1000);
    await page.$eval('iframe', (iframe) => {
      iframe.src = '';
      iframe.srcdoc =
        '<html><head></head><body style="background: darkgray;"></body></html>';
    });
  },
};
