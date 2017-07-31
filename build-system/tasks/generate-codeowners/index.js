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
const yaml = require('yamljs');
const fs = BBPromise.promisifyAll(require('fs-extra'));
const gulp = require('gulp-help')(require('gulp'));
const glob = BBPromise.promisify(require('glob'));
const intercept = require('gulp-intercept');
const path = require('path');

const dirs = Object.create(null);

function writeCodeownersFile(target) {
  fs.removeSync(target);
  const keys = Object.keys(dirs);
  let codeowners = '';
  keys.forEach(function(key) {
    console.log('=====');
    codeowners += `${key === '*' ? key : `${key}/*`} `;
    dirs[key].forEach(function(item, i) {
      console.log(typeof item, item);
      if (typeof entry === 'string') {
        codeowners += item.indexOf('@') !== 0 ? `@${item}` : item;
        if (dirs[key].length - 1 > i) {
          codeowners += ', ';
        }
        console.log('lol');
      } else {
        console.log('index', i);
        console.log('item', item);
        codeowners += '\n';
        let subItemUsername = Object.keys(item)[0];
        let username = subItemUsername.indexOf('@') !== 0 ?
            `@${subItemUsername}` : subItemUsername;
        console.log(item[subItemUsername]);
        item[subItemUsername].forEach(function(pattern) {
          codeowners += `${key === '*' ? key : `${key}/${pattern}`} ${username}`;
        });
      }
    });
    codeowners += '\n';
  });
  fs.writeFileSync(target, codeowners);
}

function generate(root, target) {
  return gulp.src(`${root}/**/OWNERS.yaml`)
      .pipe(intercept(function(file) {
        const dirname = path.relative(process.cwd(), path.dirname(file.path));
        dirs[dirname || '*'] = yaml.parse(file.contents.toString());
      }))
      .on('end', function(cb) {
        writeCodeownersFile(target);
      });
}

gulp.task('generate-codeowners', 'Create CODEOWNERS file from OWNERS.yaml files',
    generate.bind(null, process.cwd(), './CODEOWNERS'));
