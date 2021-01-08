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
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-extra');
const log = require('fancy-log');
const {cyan} = require('colors');

const pathPrefix = 'dist/log-messages';

/**
 * Source of truth for extracted messages during build, but should not be
 * deployed. Shaped `{message: {id, message, ...}}`.
 */
const extractedPath = `${pathPrefix}${
  argv.esm ? '-mjs' : 'js'
}.by-message.json`;

const formats = {
  // Consumed by logging server. Format may allow further fields.
  [`${pathPrefix}.json`]: ({id: unused, ...other}) => other,

  // Consumed by runtime function in `#development`.
  [`${pathPrefix}.simple.json`]: ({message}) => message,
};

/** @return {!Promise<!Array<!Object>>} */
const extractedItems = async () =>
  fs.readJson(extractedPath).then(Object.values);

/**
 * Format extracted messages table in multiple outputs, keyed by id.
 * @return {!Promise}
 */
async function formatExtractedMessages() {
  const items = await extractedItems();
  return Promise.all(
    Object.entries(formats).map(async ([path, format]) => {
      const formatted = {};
      items.forEach((item) => (formatted[item.id] = format(item)));
      await fs.outputJson(path, formatted);
      log('Formatted', cyan(path));
    })
  );
}

module.exports = {extractedPath, formatExtractedMessages};
