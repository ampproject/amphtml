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

/* global require */

const $$ = require('gulp-load-plugins')();
const gulp = $$.help(require('gulp'));
const {isTravisBuild} = require('./build-system/travis');
const {serve} = require('./build-system/tasks/serve.js');

require('./build-system/tasks');

const maybeUpdatePackages = isTravisBuild() ? [] : ['update-packages'];

/* eslint "google-camelcase/google-camelcase": 0 */

/**
 * Gulp tasks
 * TODO(rsimha): Refactor these while upgrading to gulp 4
 */
gulp.task('check-all', 'Run through all presubmit checks',
    ['lint', 'dep-check', 'check-types', 'presubmit']);
gulp.task('default', 'Runs "watch" and then "serve"',
    maybeUpdatePackages.concat(['watch']), serve, {
      options: {
        extensions: '  Watches and builds only the listed extensions.',
        extensions_from: '  Watches and builds only the extensions from the ' +
            'listed AMP(s).',
        noextensions: '  Watches and builds with no extensions.',
      },
    });
