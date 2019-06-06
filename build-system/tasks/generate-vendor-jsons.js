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
const file = require('gulp-file');
const {endBuildStep, toPromise} = require('./helpers');
const {ANALYTICS_CONFIG} = require('../../extensions/amp-analytics/0.1/vendors');

/**
 * Generate all the vendor config JSONs from their respective JS files
 * @return {!Promise}
 */
function generateVendorJsons() {
  const promises = [];
  const destPath = 'extensions/amp-analytics/0.1/vendors/';

  const startTime = Date.now();

  // iterate over each vendor config and write to JSON file
  Object.keys(ANALYTICS_CONFIG).forEach(vendorName => {
    if (vendorName === 'default') {
      return;
    }

    // convert object to JSON string with indentation of 4 spaces
    const configString = JSON.stringify(ANALYTICS_CONFIG[vendorName], null, 4);
    const fileName = vendorName + '.json';

    promises.push(
      toPromise(
        file(fileName, configString, { src: true })
          .pipe(gulp.dest(destPath))
      )
    );
  });

  return Promise.all(promises).then(() => {
    endBuildStep(
      'Generated all analytics vendor config JSONs into ',
      destPath,
      startTime
    );
  });
}

module.exports = {
  generateVendorJsons,
};

vendorConfigs.description = 'Generate analytics vendor JSON files from their respective JS files';
