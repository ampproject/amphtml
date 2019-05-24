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

/** Values are transformer fns, output shaped `{id: fn({id, message, ...})}`. */
const formattedMessagesById = {
  // Consumed by logging server. Format may allow further fields.
  [`${messagesPathPrefix}.json`]: ({id: unused, ...other}) => other,

  // Consumed by runtime function in `#development`.
  [`${messagesPathPrefix}.simple.json`]: ({message}) => message,
};

/**
 * `transform-log-methods` babel plugin keys by message string for deduping.
 * This reads from the plugin output table, and writes different output format
 * files, in JSON keyed by id.
 * @return {!Promise}
 */
const formatExtractedMessages = () =>
  fs.readJson(messagesByMessagePath).then(byMessage =>
    Promise.all(
      Object.entries(formattedMessagesById).map(([path, transform]) => {
        const byId = {};
        Object.values(byMessage).forEach(i => (byId[i.id] = transform(i)));
        return fs.outputJson(path, byId);
      })
    )
  );

module.exports = {messagesByMessagePath, formatExtractedMessages};
