'use strict';

module.exports = {
  'AMP version of the player loading a story': async (page) => {
    await page.waitForTimeout(5000);
    await page.$eval('iframe', (iframe) => {
      const contents = iframe.contentDocument.documentElement.outerHTML;
      iframe.src = '';
      iframe.srcdoc = contents;
    });

    await page.waitForTimeout(2000);
  },
};
