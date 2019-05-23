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
 * for all extracted messages during build, but it should not be deployed
 * anywhere. Format may allow further fields in the future.
 * This looks like:
 *   {"my message": {"id": "xx", "message": "my message"}}
 */
const messagesByMessagePath = `${messagesPathPrefix}.by-message.json`;

/**
 * @param {string} outputPath
 * @param {function(!Object):!Object} transform
 * @return {!Promise}
 */
const outputMessagesById = (outputPath, transform) =>
  fs.readJson(messagesByMessagePath, {throws: false}).then(obj =>
    fs.outputJson(
      outputPath,
      Object.fromEntries(
        // key by id, content defined by caller
        Object.keys(obj).map(k => [obj[k]['id'], transform(obj[k])])
      )
    )
  );

/** @return {!Promise} */
const outputMessages = () =>
  Promise.all([
    // Consumed by logging server. Format may allow further fields in the
    // future.
    outputMessagesById(
      `${messagesPathPrefix}.json`,
      ({id: unused, ...other}) => other
    ),

    // Consumed by runtime function in development mode.
    outputMessagesById(
      `${messagesPathPrefix}.simple.json`,
      ({message}) => message
    ),
  ]);

module.exports = {messagesByMessagePath, outputMessages};
