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

const gulp = require('gulp');
const jest = require('gulp-jest').default;
const {isTravisBuild} = require('../travis');

/**
 * Simple wrapper around the jest tests for custom babel plugins.
 */
function babelPluginTests() {
  return gulp.src('./build-system/babel-plugins/testSetupFile.js').pipe(
    jest({
      'testRegex': '/babel-plugins/[^/]+/test/.+\\.m?js$',
      'testPathIgnorePatterns': ['/node_modules/'],
      'testEnvironment': 'node',
      'transformIgnorePatterns': ['/node_modules/'],
      'coveragePathIgnorePatterns': ['/node_modules/'],
      'modulePathIgnorePatterns': ['/test/fixtures/', '<rootDir>/build/'],
      'reporters': [
        isTravisBuild() ? 'jest-silent-reporter' : 'jest-dot-reporter',
      ],
      'automock': false,
    })
  );
}

module.exports = {
  babelPluginTests,
};

babelPluginTests.description =
  "Runs the Jest based tests for AMP's custom babel plugins.";
