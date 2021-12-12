'use strict';

module.exports = {
  'forbid loaded css classes': async (page, name) => {
    const forbiddenSelectors = [
      '.comic-amp-font-loaded',
      '.comic-amp-bold-font-loaded',
    ];
    for (const selector of forbiddenSelectors) {
      if ((await page.$(selector)) !== null) {
        throw new Error(
          `${name} | The forbidden CSS element ${selector} exists in the page`
        );
      }
    }
  },
};
