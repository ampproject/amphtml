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
const {
  messagesByMessagePath,
  messagesByIdPath,
  messagesByIdSimplePath,
} = require('../log-module-metadata');

/**
 * @param {string} path
 * @param {string} key
 * @param {function(!Object):!Object} transform
 * @return {!Promise}
 */
function outputMessages(path, key, transform) {
  return fs.readJson(messagesByMessagePath).then(
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
}

/** @return {!Promise} */
function outputMessagesById() {
  return outputMessages(
    messagesByIdPath,
    'id',
    ({id: unused, ...rest}) => rest
  );
}

/** @return {!Promise} */
function outputMessagesByIdSimple() {
  return outputMessages(messagesByIdSimplePath, 'id', ({message}) => message);
}

module.exports = {outputMessagesById, outputMessagesByIdSimple};
