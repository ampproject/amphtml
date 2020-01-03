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

// TODO: @jonathantyng cleanup #22757
// this is a temporary gulp task while we migrate amp-analytics to use vendor
// JSONs instead of JS files

const del = require('del');
const file = require('gulp-file');
const gulp = require('gulp');
const {endBuildStep, toPromise, compileJs} = require('./helpers');

/**
 * Generate all the vendor config JSONs from their respective JS files
 * @return {!Promise}
 */
function generateVendorJsons() {
  const startTime = Date.now();

  const srcDir = 'extensions/amp-analytics/0.1';
  const srcFile = 'vendors.js';
  const tempPath = 'dist/temp-analytics/';
  const destPath = 'extensions/amp-analytics/0.1/vendors/';
  const compileOptions = {
    browserifyOptions: {
      // allow gulp to import this file after compile
      standalone: 'analyticsVendors',
      // need to stub self since we are not running this in the browser
      insertGlobalVars: {
        self: function() {
          // use test=true to generate _fake_.json for test-vendors.js to work
          return '{ location: {}, AMP_CONFIG: {test: true} }';
        },
      },
    },
  };

  return compileJs(srcDir, srcFile, tempPath, compileOptions).then(() => {
    const promises = [];
    const {ANALYTICS_CONFIG} = require('../../dist/temp-analytics/vendors.js');

    // iterate over each vendor config and write to JSON file
    Object.keys(ANALYTICS_CONFIG).forEach(vendorName => {
      if (vendorName === 'default') {
        return;
      }

      // convert object to JSON string with indentation of 2 spaces
      const configString =
        JSON.stringify(ANALYTICS_CONFIG[vendorName], null, 2) + '\n';
      const fileName = vendorName + '.json';

      promises.push(
        toPromise(
          file(fileName, configString, {src: true}).pipe(gulp.dest(destPath))
        )
      );
    });

    promises.push(generateCanaryBgJson_(ANALYTICS_CONFIG, destPath));

    return Promise.all(promises)
      .then(() => {
        // cleanup temp directory
        return del([tempPath]);
      })
      .then(() => {
        endBuildStep(
          'Generated all analytics vendor config JSONs into ',
          destPath,
          startTime
        );
      });
  });
}

function generateCanaryBgJson_(analyticsConfig, destPath) {
  // generate separate canary JSON file for Bolt Guard (BG)
  const bgCanaryConfig = {
    ...analyticsConfig['bg'],
    'transport': {
      'iframe':
        'https://tpc.googlesyndication.com/b4a/experimental/b4a-runner.html',
    },
  };
  const bgCanaryConfigStr = JSON.stringify(bgCanaryConfig, null, 2);

  return toPromise(
    file('bg.canary.json', bgCanaryConfigStr, {src: true}).pipe(
      gulp.dest(destPath)
    )
  );
}

module.exports = {
  generateVendorJsons,
};

generateVendorJsons.description =
  'Generate analytics vendor JSON files from their respective JS files';
