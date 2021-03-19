/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
const globby = require('globby');
const {basename} = require('path');
const {readFile} = require('fs-extra');
const {writeDiffOrFail} = require('../common/diff');

/**
 * Ensures that this Markdown file contains a section for every matching vendor.
 */
const filepath = 'extensions/amp-analytics/analytics-vendors-list.md';

/**
 * Vendor JSON files are found here.
 * Their basename without extension is their type listed in their block.
 */
const vendorsGlob = 'extensions/amp-analytics/0.1/vendors/*.json';

const blockHeading = (heading, name) =>
  `### ${heading}\n\nType attribute value: \`${name}\``;

const blockRegExp = (name) =>
  new RegExp(
    `(<!--[\n]+)?${blockHeading(
      // ### any heading since vendor brands are arbitrarily named
      '.+',
      /* Type attribute value: */ name
    )}((?!###)[\\S\\s\\n])*(-->)?`,
    'm'
  );

/**
 * Checks or updates analytics vendors list.
 */
async function checkAnalyticsVendorsList() {
  const vendors = globby
    .sync(vendorsGlob)
    .map((path) => basename(path, '.json'))
    .sort();

  // Keeps list sorted if so, allows:
  // - arbitrary sections in-between.
  // - intentionally commented out blocks
  let tentative = await readFile(filepath, 'utf-8');
  let previousBlock;
  for (const vendor of vendors) {
    const match = tentative.match(blockRegExp(vendor));
    if (match) {
      previousBlock = match[0].trim();
      continue;
    }
    // "d* n*t s*bmit" has to be split to prevent this file from blocking CI
    // (unlike the resulting change, which should block it if unaddressed).
    const block =
      `${blockHeading(vendor, vendor)}\n\nDO NOT` +
      ` SUBMIT: Add a paragraph to describe ${vendor}.`;
    // If there's no previously found block, the name is lexicographically lower,
    // so inserting the new block at the beginning keeps the list sorted.
    tentative = previousBlock
      ? tentative.replace(previousBlock, `${previousBlock}\n\n${block}`)
      : tentative.replace(blockRegExp('.+'), `${block}\n\n\$&`);
    previousBlock = block;
  }

  // Remove those no longer on vendor-requests.json
  let match;
  const anyVendorRegExp = new RegExp(blockRegExp('(.+)').source, 'gm');
  while ((match = anyVendorRegExp.exec(tentative)) !== null) {
    const fullMatch = match[0];
    /** @type {string} */
    const nameMatch = /** @type {*} */ (match[2]);
    const name = nameMatch
      .split(/[,\s]+/)
      .shift()
      .replace(/[`"']/g, '');
    if (!vendors.includes(name)) {
      tentative = tentative.replace(fullMatch, '');
    }
  }

  await writeDiffOrFail('check-analytics-vendors-list', filepath, tentative);
}

module.exports = {
  checkAnalyticsVendorsList,
};

checkAnalyticsVendorsList.description = `Checks or updates list on ${filepath}`;

checkAnalyticsVendorsList.flags = {
  'fix': 'Write to file',
};
