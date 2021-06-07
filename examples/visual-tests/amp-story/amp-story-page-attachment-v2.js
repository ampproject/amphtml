/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/helpers');

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

  'dark theme, light drawer theme - inline CTA drawer should display': async (
    page,
    name
  ) => {
    const pageID = 'inline-dark-theme-drawer-theme-light';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
    await screen.tap(160, 460);
    await page.waitForTimeout(500); // For animations to finish.
  },

  'light theme, dark drawer theme - inline CTA drawer should display': async (
    page,
    name
  ) => {
    const pageID = 'inline-light-theme-drawer-theme-dark';
    const url = await page.url();
    await page.goto(`${url}#page=${pageID}`);
    await page.waitForSelector(
      `amp-story-page#${pageID}[active][distance="0"]`
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-page-open-attachment[active]',
    ]);
    await screen.tap(160, 460);
    await page.waitForTimeout(500); // For animations to finish.
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
};
