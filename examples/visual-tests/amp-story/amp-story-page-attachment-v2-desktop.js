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
  'custom text - inline CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },

  'dark theme - inline CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },

  '1 img - dark theme - inline CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-1-image[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },

  '2 imgs - dark theme - inline CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-1-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-2-images[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },

  '2 imgs - light theme - inline CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-1-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-light-theme-2-images[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },

  'outlink CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-1-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-light-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-default[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },

  'custom text - outlink CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-1-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-light-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-default[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-text[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },

  'no img - outlink CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-1-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-light-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-default[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-no-image[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },

  'custom img - outlink CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-1-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-light-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-default[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-no-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-image[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },

  'dark theme - outlink CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-1-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-light-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-default[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-no-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-dark-theme[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },

  'pink background - outlink CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-1-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-light-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-default[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-no-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-background-color[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },

  'pink text - outlink CTA pre-tap UI should display': async (
    page,
    name
  ) => {
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-1-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-dark-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#inline-light-theme-2-images[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-default[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-text[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-no-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-image[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-dark-theme[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-background-color[active]');
    await page.tap('.next-container > button.i-amphtml-story-button-move');
    await page.waitForSelector('amp-story-page#outlink-custom-text-color[active]');
    await page.waitForTimeout(400); // For animations to finish.
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-story-inline-page-attachment-chip',
    ]);
  },
};
