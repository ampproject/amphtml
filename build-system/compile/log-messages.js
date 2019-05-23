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
 * Consumed by `transform-log-methods` babel plugin. This is the source of truth
 * for all extracted messages during build, but it should not be deployed
 * anywhere. Format may allow further fields in the future.
 * This looks like:
 *   {"my message": {"id": "xx", "message": "my message"}}
 */
const messagesByMessagePath = `${messagesPathPrefix}.by-message.json`;

/**
 * Output from `messagesByMessagePath`. Consumed by logging server. Format may
 * allow further fields in the future.
 * This looks like:
 *   {"xx": {"message": "my message"}}
 */
const messagesByIdPath = `${messagesPathPrefix}.json`;

/**
 * Output from `messagesByMessagePath`. Consumed by runtime function in
 * development mode.
 * This looks like:
 *   {"xx": "my message"}
 */
const messagesByIdSimplePath = `${messagesPathPrefix}.simple.json`;

/**
 * @param {string} path
 * @param {string} key
 * @param {function(!Object):!Object} transform
 * @return {!Promise}
 */
const outputMessagesTable = (path, key, transform) =>
  fs.readJson(messagesByMessagePath).then(
    obj =>
      fs.outputJson(
        path,
        Object.fromEntries(
          Object.keys(obj).map(k => [obj[k][key], transform(obj[k])])
        )
      ),
    // We don't care if non existant or invalid.
    () => {}
  );

/** @return {!Promise} */
const outputMessagesById = () =>
  outputMessagesTable(messagesByIdPath, 'id', ({id: unused, ...rest}) => rest);

/** @return {!Promise} */
const outputMessagesByIdSimple = () =>
  outputMessagesTable(messagesByIdSimplePath, 'id', ({message}) => message);

/** @return {!Promise} */
const outputMessages = () =>
  Promise.all([outputMessagesById(), outputMessagesByIdSimple()]);

module.exports = {messagesByMessagePath, outputMessages};
