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

const gulp = require('gulp');
const splittable = require('splittable');
const exec = require('child_process').execSync;

const files = exec('ls -F extensions | grep /').toString().trim().split('\n')
    .map(x => {
      let version = '0.1';
      if (/amp-sticky-ad/.test(x)) {
        version = '1.0';
      }
      return `./extensions/${x}${version}/${x.replace('/', '.js')}`
    });

function split1() {
  splittable({
    modules: [
      './src/amp.js',
    ].concat(files),
    writeTo: 'dist/',
  })
}

gulp.task('split', 'create modules using splittable', split1);
