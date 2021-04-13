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
const fs = require('fs-extra');
const globby = require('globby');
const jsonminify = require('jsonminify');
const {endBuildStep} = require('./helpers');
const {join, basename, dirname, extname} = require('path');
const {watchDebounceDelay} = require('./helpers');
const {watch} = require('chokidar');

/**
 * Entry point for 'amp analytics-vendor-configs'
 * Compile all the vendor configs and drop in the dist folder
 * @param {Object=} opt_options
 * @return {!Promise}
 */
async function analyticsVendorConfigs(opt_options) {
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
      analyticsVendorConfigs(copyOptions);
    };
    watch(srcPath).on('change', debounce(watchFunc, watchDebounceDelay));
  }

  const startTime = Date.now();

  const srcFiles = globby.sync(srcPath);
  await fs.ensureDir(destPath);
  for (const srcFile of srcFiles) {
    let destFile = join(destPath, basename(srcFile));
    let contents = await fs.readFile(srcFile, 'utf-8');
    if (options.minify) {
      contents = jsonminify(contents);
    }
    // Report any parsing errors
    try {
      JSON.parse(contents);
    } catch (err) {
      // Only fail if not in watcher, so watch is not interrupted
      if (!options.calledByWatcher) {
        throw err;
      }
    }
    // If not minifying, append .max to filename
    if (!options.minify) {
      const extension = extname(destFile);
      const base = basename(destFile, extension);
      const dir = dirname(destFile);
      destFile = join(dir, `${base}.max${extension}`);
    }
    await fs.writeFile(destFile, contents, 'utf-8');
  }
  if (globby.sync(srcPath).length > 0) {
    endBuildStep(
      'Compiled all analytics vendor configs into',
      destPath,
      startTime
    );
  }
}

module.exports = {
  analyticsVendorConfigs,
};

analyticsVendorConfigs.description = 'Compile analytics vendor configs to dist';
