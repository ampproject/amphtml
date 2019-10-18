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
const fs = require('fs-extra');
const {endBuildStep} = require('../tasks/helpers');
const {extractedPath, formats} = require('./log-messages-formats');

/** @return {!Promise<?Array<!Object>>} */
async function extractedItems() {
  try {
    return Object.values(await fs.readJson(extractedPath));
  } catch (_) {
    return null;
  }
}

/**
 * Format extracted messages table in multiple outputs, keyed by id.
 * @return {!Promise}
 */
async function formatExtractedMessages() {
  const items = await extractedItems();
  if (!items) {
    return;
  }
  const startTime = Date.now();
  for (const path in formats) {
    const format = formats[path];
    const formatted = {};
    items.forEach(item => (formatted[item.id] = format(item)));
    await fs.outputJson(path, formatted);
  }
  endBuildStep('Formatted', Object.keys(formats).join(', '), startTime);
}

module.exports = {extractedPath, formatExtractedMessages};
