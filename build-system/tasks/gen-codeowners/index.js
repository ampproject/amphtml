/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
const BBPromise = require('bluebird');
const fs = BBPromise.promisifyAll(require('fs-extra'));
const gulp = require('gulp-help')(require('gulp'));
const intercept = require('gulp-intercept');
const log = require('fancy-log');
const minimist = require('minimist');
const path = require('path');
const yaml = require('yamljs');

const argv = minimist(process.argv.slice(2));

/**
 * @param {!Object<string, !Array<string>>} dirs
 * @return {string}
 */
function buildCodeownersFile(dirs) {
  const dirpaths = Object.keys(dirs);
  let codeowners = '';
  dirpaths.forEach(function(dirpath) {
    codeowners += `${dirpath === '*' ? dirpath : `${dirpath}/`} `;
    dirs[dirpath].forEach(function(item, i, arr) {
      if (typeof item === 'string') {
        // Allow leading `@` to be optional
        codeowners += item.indexOf('@') !== 0 ? `@${item}` : item;
        const nextItem = arr[i + 1];
        // Look ahead if we need to add a space
        if (nextItem && typeof nextItem === 'string') {
          codeowners += ' ';
        }
      } else {
        codeowners += '\n';
        // The entry is going to be an object where the key is
        // the username and the array values are paths to file
        // rooted to the current directory (`dirpath`).
        // ex.
        // ```yaml
        // - ampproject/somegroup
        //   - some.js
        // ```
        //
        // gets turned into:
        //
        // ```js
        // {'ampproject/somegroup': ['some.js']}
        // ```
        const subItemUsername = Object.keys(item)[0];
        const username = subItemUsername.indexOf('@') !== 0 ?
          `@${subItemUsername}` : subItemUsername;
        item[subItemUsername].forEach(function(pattern) {
          codeowners += `${dirpath === '*' ? pattern :
            `${dirpath}/${pattern}`} ${username}`;
        });
      }
    });
    codeowners += '\n';
  });
  return codeowners;
}

/**
 * @param {string} root
 * @param {string} target
 * @param {boolean} writeToDisk
 * @return {!Stream}
 */
function generate(root, target, writeToDisk) {
  // Allow flags to override values.
  root = argv.root || root;
  target = argv.target || target;
  writeToDisk = argv.writeToDisk || writeToDisk;

  const dirs = Object.create(null);
  return gulp.src(`${root}/**/OWNERS.yaml`)
      .pipe(intercept(function(file) {
        const dirname = path.relative(process.cwd(), path.dirname(file.path));
        dirs[dirname || '*'] = yaml.parse(file.contents.toString());
      }))
      .on('end', function() {
        if (writeToDisk) {
          fs.removeSync(target);
          const codeowners = buildCodeownersFile(dirs);
          fs.writeFileSync(target, codeowners);
        } else {
          const codeowners = buildCodeownersFile(dirs);
          log(codeowners);
        }
      });
}

gulp.task('gen-codeowners', 'Create CODEOWNERS file from OWNERS.yaml files',
    generate.bind(null, process.cwd(), './CODEOWNERS', true));

exports.generate = generate;
exports.buildCodeownersFile = buildCodeownersFile;
