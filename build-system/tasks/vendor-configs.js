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

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const debounce = require('debounce');
const globby = require('globby');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const jsonlint = require('gulp-jsonlint');
const jsonminify = require('gulp-jsonminify');
const rename = require('gulp-rename');
const {endBuildStep, toPromise} = require('./helpers');
const {watchDebounceDelay} = require('./helpers');
const {watch} = require('gulp');

/**
 * Entry point for 'gulp vendor-configs'
 * Compile all the vendor configs and drop in the dist folder
 * @param {Object=} opt_options
 * @return {!Promise}
 */
async function vendorConfigs(opt_options) {
  const options = opt_options || {};

  const srcPath = ['extensions/amp-analytics/0.1/vendors/*.json'];
  const destPath = 'dist/v0/analytics-vendors/';

  // ignore test json if not fortesting or build.
  if (!(argv.fortesting || options.fortesting || argv._.includes('build'))) {
    srcPath.push('!extensions/amp-analytics/0.1/vendors/_fake_.json');
  }

  if (options.watch) {
    // Do not set watchers again when we get called by the watcher.
    const copyOptions = {...options, watch: false, calledByWatcher: true};
    const watchFunc = () => {
      vendorConfigs(copyOptions);
    };
    watch(srcPath).on('change', debounce(watchFunc, watchDebounceDelay));
  }

  const startTime = Date.now();

  await toPromise(
    gulp
      .src(srcPath)
      .pipe(gulpif(options.minify, jsonminify()))
      .pipe(jsonlint())
      // report any linting errors
      .pipe(jsonlint.reporter())
      // only fail if not in watcher, so watch is not interrupted
      .pipe(gulpif(!options.calledByWatcher, jsonlint.failOnError()))
      // if not minifying, append .max to filename
      .pipe(
        gulpif(
          !options.minify,
          rename(function (path) {
            path.basename += '.max';
          })
        )
      )
      .pipe(gulp.dest(destPath))
  );

  if (globby.sync(srcPath).length > 0) {
    endBuildStep(
      'Compiled all analytics vendor configs into',
      destPath,
      startTime
    );
  }
}

module.exports = {
  vendorConfigs,
};

vendorConfigs.description = 'Compile analytics vendor configs to dist';
