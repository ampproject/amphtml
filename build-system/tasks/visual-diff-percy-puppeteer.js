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
const {gitBranchName, gitCommitterEmail} = require('../git');

const puppeteer = require('puppeteer');
const {FileSystemAssetLoader, Percy} = require('@percy/puppeteer');

const fs = require('fs');
const JSON5 = require('json5');
const path = require('path');

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

async function verifyCssElements(page, forbidden_css, loading_incomplete_css, loading_complete_css) {
  // Wait for loader dot to be hidden
  await page.waitForSelector('.i-amphtml-loader-dot', {
    hidden: true,
    timeout: 5000,
  });

  if (forbidden_css) {
    for (let css of forbidden_css) {
      if (await page.$(css) !== null) {
        console.log('Found forbidden selector:', css);
      }
    }
  }

  if (loading_incomplete_css) {
    for (let css of loading_incomplete_css) {
      console.log('Waiting for invisibility of', css);
      await page.waitForSelector(css, {
        hidden: true,
        timeout: 5000,
      });
    }
  }

  if (loading_complete_css) {
    for (let css of loading_complete_css) {
      console.log('Waiting for visibility of', css);
      await page.waitForSelector(css, {
        visible: true,
        timeout: 5000,
      });
    }
  }
}

async function generateSnapshots(percy, page, webpages) {
  for (let webpage of webpages) {
    const {url, name, forbidden_css, loading_incomplete_css, loading_complete_css} = webpage;

    console.log('Navigating to page', 'http://localhost:8000/' + url);
    await page.goto('http://localhost:8000/' + url);

    await verifyCssElements(page, forbidden_css, loading_incomplete_css, loading_complete_css);
    await percy.snapshot(name, page);
  }
}

async function visualDiff() {
  setPercyBranch();

  // Load and parse the config. Use JSON5 due to JSON comments in file.
  const visualTestsConfig = JSON5.parse(
      fs.readFileSync(
          path.resolve(__dirname, '../../test/visual-diff/visual-tests'),
          'utf8'
      )
  );

  // Create a Percy client
  const buildDir = '../../' + visualTestsConfig.assets_dir;
  const percy = new Percy({
    loaders: [
      new FileSystemAssetLoader({
        buildDir: path.resolve(__dirname, buildDir),
        mountPath: visualTestsConfig.assets_base_url,
      }),
    ],
  });

  // Start a Percy build
  await percy.startBuild();

  // Launch the browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Take the snapshots
  await generateSnapshots(percy, page, visualTestsConfig.webpages);

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
