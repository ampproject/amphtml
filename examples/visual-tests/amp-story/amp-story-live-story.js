'use strict';

module.exports = {
  'should show the notification.': async (page) => {
    await page.waitForSelector('amp-story-page#cover[active]');
    await page.$eval('.i-amphtml-story-system-layer', (e) =>
      e.setAttribute('i-amphtml-story-has-new-page', 'show')
    );
    await page.waitForTimeout(2000); // For animations to finish.
    await page.waitForSelector(
      '.i-amphtml-story-has-new-page-notification-container',
      {opacity: 1}
    );
  },
  '[RTL] should show the notification.': async (page) => {
    await page.$eval('body', (e) => e.setAttribute('dir', 'rtl'));
    await page.waitForSelector('amp-story-page#cover[active]');
    await page.$eval('.i-amphtml-story-system-layer', (e) =>
      e.setAttribute('i-amphtml-story-has-new-page', 'show')
    );
    await page.waitForTimeout(2000); // For animations to finish.
    await page.waitForSelector(
      '.i-amphtml-story-has-new-page-notification-container',
      {opacity: 1}
    );
  },
};
