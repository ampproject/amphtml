'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'dark theme - shopping CTA UI should display': async (page, name) => {
    const pageID = 'inline-dark-theme';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },
  'displays shopping PLP (product list page)': async (page, name) => {
    const pageID = 'inline-light-theme';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await page.tap(
      `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
    );
    await page.waitForSelector('.i-amphtml-story-draggable-drawer-open');
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-draggable-drawer-open',
    ]);
  },
  'dark theme - displays shopping PLP (product list page)': async (
    page,
    name
  ) => {
    const pageID = 'inline-dark-theme';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await page.tap(
      `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
    );
    await page.waitForSelector('.i-amphtml-story-draggable-drawer-open');
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-draggable-drawer-open',
    ]);
  },
  'displays shopping PDP (product description page) with carousel': async (
    page,
    name
  ) => {
    const pageID = 'inline-light-theme';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await page.tap(
      `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-draggable-drawer-open',
    ]);
    await page.tap(
      `amp-story-page#${pageID} .i-amphtml-amp-story-shopping-plp-card`
    );
    await page.waitForSelector('.i-amphtml-amp-story-shopping-pdp', {
      visible: true,
    });
  },
  'displays shopping PDP (product description page) without carousel': async (
    page,
    name
  ) => {
    const pageID = 'inline-light-theme';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await page.tap(
      `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-draggable-drawer-open',
    ]);
    await page.tap(
      `amp-story-page#${pageID} .i-amphtml-amp-story-shopping-plp-card:nth-child(2)`
    );
    await page.waitForSelector('.i-amphtml-amp-story-shopping-pdp', {
      visible: true,
    });
  },
  'displays shopping PDP (product description page) by default when one product is on the page':
    async (page, name) => {
      const pageID = 'remote-with-product';
      const url = await page.url();
      await page.goto(`${url}#page=${pageID}`);
      await page.waitForSelector(
        `amp-story-page#${pageID}[active][distance="0"]`
      );
      await page.tap(
        `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
      );
      await verifySelectorsVisible(page, name, [
        '.i-amphtml-story-draggable-drawer-open',
      ]);
      await page.waitForSelector('.i-amphtml-amp-story-shopping-pdp', {
        visible: true,
      });
    },
};
