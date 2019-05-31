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

const gulp = require('gulp');
const gulpif = require('gulp-if');
const gulpWatch = require('gulp-watch');
const jsonlint = require('gulp-jsonlint');
const jsonminify = require('gulp-jsonminify');
const {endBuildStep, printNobuildHelp, toPromise} = require('./helpers');

/**
 * Entry point for 'gulp vendor-configs'
 * @return {!Promise}
 */
async function vendorConfigs() {
  printNobuildHelp();
  return compileVendorConfigs();
}

/**
 * Compile all the vendor configs and drop in the build folder
 * @param {Object=} opt_options
 * @return {!Promise}
 */
function compileVendorConfigs(opt_options) {
  const options = opt_options || {};

  const srcPath = 'extensions/amp-analytics/0.1/vendors/*.json';
  const destPath = 'dist/v0/analytics-vendors/';

  if (options.watch) {
    // Do not set watchers again when we get called by the watcher.
    const copyOptions = {...options, watch:false, calledByWatcher:true};
    gulpWatch(srcPath, function() {
      compileVendorConfigs(copyOptions);
    });
  }

  const startTime = Date.now();

  return toPromise(
    gulp
      .src(srcPath)
      .pipe(gulpif(options.minify, jsonminify()))
      .pipe(jsonlint())
      .pipe(jsonlint.reporter()) // report any linting errors
      // only fail if not in watcher, so watch is not interupted
      .pipe(gulpif(!options.calledByWatcher, jsonlint.failOnError()))
      .pipe(gulp.dest(destPath))
  ).then(() => {
    endBuildStep(
      'Compiled all analytics vendor configs into ',
      destPath,
      startTime
    );
  });
}

module.exports = {
  vendorConfigs,
  compileVendorConfigs,
};

vendorConfigs.description =
  'Compile analytics vendor configs to dist';
