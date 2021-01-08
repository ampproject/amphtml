/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

const crypto = require('crypto');

// This is in its own file in order to make it easy to stub in tests.
module.exports = {
  createHash: (filepath) =>
    crypto
      .createHash('sha256')
      .update(toPosix(filepath))
      .digest('hex')
      .slice(0, 7),
};

// To support Windows, use posix separators for all filepath hashes.
function toPosix(filepath) {
  return filepath.replace(/\\\\?/g, '/');
}
