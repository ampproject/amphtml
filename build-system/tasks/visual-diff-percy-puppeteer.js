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

const argv = require('minimist')(process.argv.slice(2));
const gulp = require('gulp-help')(require('gulp'));
const {execOrDie} = require('../exec');
const {gitBranchName, gitCommitterEmail} = require('../git');

const { FileSystemAssetLoader, Percy } = require('@percy/puppeteer');
const puppeteer = require('puppeteer');

/**
 * Disambiguates branch names by decorating them with the commit author name.
 * We do this for all non-push builds in order to prevent them from being used
 * as baselines for future builds.
 */
function setPercyBranch() {
  if (!argv.master || !process.env['TRAVIS']) {
    const userName = gitCommitterEmail();
    const branchName = process.env['TRAVIS'] ?
      process.env['TRAVIS_PULL_REQUEST_BRANCH'] : gitBranchName();
    process.env['PERCY_BRANCH'] = userName + '-' + branchName;
  }
}

async function visualDiff() {
  setPercyBranch();

  // Create a Percy client
  const percy = new Percy({
    loaders: [
      new FileSystemAssetLoader({
        buildDir: './examples/visual-tests',
        mountPath: '',
      }),
    ],
  });

  // Start a Percy build
  await percy.startBuild();

  // Launch the browser and visit example.com
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8000/examples/visual-tests/amp-by-example/components/amp-vine/index.html');
  await percy.snapshot('Snapshot of amp-vine', page);

  await page.goto('http://localhost:8000/examples/visual-tests/article-access.amp/article-access.amp.html');
  await page.waitForSelector('.login-section', {
    visible: true,
    timeout: 5000,
  });
  await percy.snapshot('AMP Article Access', page);

  await page.goto('http://localhost:8000/examples/visual-tests/amp-by-example/components/amp-access-laterpay/index.html');
  await percy.snapshot('amp-access-laterpay - Amp By Example', page);

  // Tell Percy we're finished taking snapshots
  await percy.finalizeBuild();

  // Close the browser
  browser.close();

}

gulp.task(
    'visual-diff-percy-puppeteer',
    'Runs the AMP visual diff tests with percy-puppteer.',
    visualDiff,
    {}
);
