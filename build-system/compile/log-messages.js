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

const messagesPathPrefix = 'dist/log-messages';

/**
 * Written by `transform-log-methods` babel plugin. This is the source of truth
 * for extracted messages during build, but it should not be deployed. Shaped:
 * `{message: {id, message, ...}}`
 */
const messagesByMessagePath = `${messagesPathPrefix}.by-message.json`;

const messagesByIdFormats = {
  // Consumed by logging server. Format may allow further fields.
  [`${messagesPathPrefix}.json`]: ({id: unused, ...other}) => other,

  // Consumed by runtime function in `#development`.
  [`${messagesPathPrefix}.simple.json`]: ({message}) => message,
};

/**
 * `transform-log-methods` babel plugin keys by message string for deduping.
 * This reads from the plugin output table, and writes different output format
 * files, in JSON, keyed by id.
 * @return {!Promise}
 */
const formatExtractedMessages = () =>
  fs
    .readJson(messagesByMessagePath)
    .then(Object.values)
    .then(items =>
      Promise.all(
        Object.entries(messagesByIdFormats).map(([path, format]) => {
          const formatted = {};
          items.forEach(item => (formatted[item.id] = format(item)));
          return fs.outputJson(path, formatted);
        })
      )
    );

module.exports = {messagesByMessagePath, formatExtractedMessages};
