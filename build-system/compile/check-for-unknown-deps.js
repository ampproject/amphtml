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

const log = require('fancy-log');
const through = require('through2');
const {red, cyan, yellow} = require('ansi-colors');

/**
 * Searches for the identifier "module$", which Closure uses to uniquely
 * reference module imports. If any are found, that means Closure couldn't
 * import the module correctly.
 *
 * @return {!Stream}
 */
exports.checkForUnknownDeps = function () {
  const regex = /[\w$]*module\$[\w$]+/;

  return through.obj(function (file, encoding, cb) {
    const contents = file.contents.toString();
    if (!contents.includes('module$')) {
      // Fast check, since regexes can backtrack like crazy.
      return cb(null, file);
    }

    const match = regex.exec(contents) || [
      `couldn't parse the dep. Look for "module$" in the file`,
    ];

    log(
      red('Error:'),
      `Unknown dependency ${cyan(match[0])} found in ${cyan(file.relative)}`
    );
    log(yellow(contents));
    const err = new Error('Compilation failed due to unknown dependency');
    err.showStack = false;
    cb(err, file);
  });
};
