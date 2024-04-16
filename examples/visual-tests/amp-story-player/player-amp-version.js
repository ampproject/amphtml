'use strict';

const {sleep} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'AMP version of the player loading a story': async (page) => {
    await sleep(5000);
    await page.$eval('iframe', (iframe) => {
      const contents = iframe.contentDocument.documentElement.outerHTML;
      iframe.src = '';
      iframe.srcdoc = contents;
    });

    await sleep(2000);
  },
};
