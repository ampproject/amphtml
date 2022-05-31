'use strict';

module.exports = {
  'player ready': async (page) => {
    await page.waitForTimeout(1000);
    await page.$eval('iframe', (iframe) => {
      iframe.src = '';
      iframe.srcdoc =
        '<html><head></head><body style="background: darkgray;"></body></html>';
    });
  },
};
