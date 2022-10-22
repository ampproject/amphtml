'use strict';

const {
  verifySelectorsInvisible,
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'custom text - inline CTA pre-tap UI should display': async (page, name) => {
    const pageID = 'inline-custom-text';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  'dark theme - inline CTA pre-tap UI should display': async (page, name) => {
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

  '1 img - dark theme - inline CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    const pageID = 'inline-dark-theme-1-image';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  '2 imgs - dark theme - inline CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    const pageID = 'inline-dark-theme-2-images';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  '2 imgs - light theme - inline CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    const pageID = 'inline-light-theme-2-images';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  'outlink CTA pre-tap UI should display': async (page, name) => {
    const pageID = 'outlink-default';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  'custom text - outlink CTA pre-tap UI should display': async (page, name) => {
    const pageID = 'outlink-custom-text';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  'no img - outlink CTA pre-tap UI should display': async (page, name) => {
    const pageID = 'outlink-no-image';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  'custom img - outlink CTA pre-tap UI should display': async (page, name) => {
    const pageID = 'outlink-custom-image';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  'dark theme - outlink CTA pre-tap UI should display': async (page, name) => {
    const pageID = 'outlink-dark-theme';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  'pink background - outlink CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    const pageID = 'outlink-custom-background-color';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  'pink text - outlink CTA pre-tap UI should display': async (page, name) => {
    const url = await page.url();
    const pageID = 'outlink-custom-text-color';
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  'Legacy amp-story-page-attachment with href should display': async (
    page,
    name
  ) => {
    const url = await page.url();
    const pageID = 'outlink-legacy';
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
  },

  'form presence - the domain label should display': async (page, name) => {
    const url = await page.url();
    const pageID = 'attachment-with-form';
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );

    // Set the publisher domain text instead of using the actual domain, to
    // avoid flaky test failures due to inconsistent port values.
    await page.$eval('.i-amphtml-story-page-attachment-domain-label', (el) => {
      el.textContent = 'www.publisherdomain.com';
    });

    // Open the page attachment.
    await page.waitForSelector(
      `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
    );
    await page.tap(
      `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
    );

    // Ensure domain label presence.
    await page.waitForSelector('.i-amphtml-story-draggable-drawer-open');
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-draggable-drawer-open ' +
        '.i-amphtml-story-page-attachment-domain-label',
    ]);
  },

  // TODO(gmajoulet): fix flaky test.
  // 'form presence - the input field should blur on close': async (
  //   page,
  //   name
  // ) => {
  //   const url = await page.url();
  //   const pageID = 'attachment-with-form';
  //   await page.goto(`${url}#page=${pageID}`);
  //   await page.waitForSelector(
  //     `amp-story-page#${pageID}[active][distance="0"]`
  //   );

  //   // Set the publisher domain text instead of using the actual domain, to
  //   // avoid flaky test failures due to inconsistent port values.
  //   await page.$eval('.i-amphtml-story-page-attachment-domain-label', (el) => {
  //     el.textContent = 'www.publisherdomain.com';
  //   });

  //   // Open the page attachment.
  //   await page.waitForSelector(
  //     `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
  //   );
  //   await page.tap(
  //     `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
  //   );

  //   // Tap the input element. This causes the soft keyboard to appear on
  //   // mobile.
  //   await page.waitForSelector(`amp-story-page#${pageID} input`);
  //   await page.tap(`amp-story-page#${pageID} input`);
  //   await page.waitForSelector(`amp-story-page#${pageID} input:focus`);

  //   // Dismiss the attachment by tapping an element on the story page, which
  //   // should blur the input field. This ensures that the soft keyboard is
  //   // dismissed.
  //   await page.waitForSelector(
  //     `amp-story-page#${pageID} .i-amphtml-story-page-attachment-close-button`
  //   );
  //   await page.tap(
  //     `amp-story-page#${pageID} .i-amphtml-story-page-attachment-close-button`
  //   );
  //   await verifySelectorsInvisible(page, name, [
  //     `amp-story-page#${pageID} input:focus`,
  //   ]);
  // },

  'form absence - the domain label should not display': async (page, name) => {
    const url = await page.url();
    const pageID = 'inline-default';
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );

    // Open the page attachment.
    await page.waitForSelector(
      `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
    );
    await page.tap(
      `amp-story-page#${pageID} .i-amphtml-story-inline-page-attachment-chip`
    );

    // Ensure domain label absence.
    await page.waitForSelector('.i-amphtml-story-draggable-drawer-open');
    await verifySelectorsInvisible(page, name, [
      '.i-amphtml-story-draggable-drawer-open ' +
        '.i-amphtml-story-page-attachment-domain-label',
    ]);
  },
};
