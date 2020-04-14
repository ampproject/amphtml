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

const dependencyTree = require('dependency-tree');
const fs = require('fs');
const globby = require('globby');
const log = require('fancy-log');
const minimatch = require('minimatch');
const path = require('path');
const testConfig = require('../../test-configs/config');

const {gitDiffNameOnlyMaster} = require('../../common/git');
const {green, cyan} = require('ansi-colors');
const {isTravisBuild} = require('../../common/travis');
const {reportTestSkipped} = require('../report-test-status');

const EXTENSIONSCSSMAP = 'EXTENSIONS_CSS_MAP';
const LARGE_REFACTOR_THRESHOLD = 50;

/**
 * Returns true if the PR is a large refactor.
 * (Used to skip testing local changes.)
 * @return {boolean}
 */
function isLargeRefactor() {
  const filesChanged = gitDiffNameOnlyMaster();
  return filesChanged.length >= LARGE_REFACTOR_THRESHOLD;
}

/**
 * Extracts a mapping from CSS files to JS files from a well known file
 * generated during `gulp css`.
 *
 * @return {!Object<string, string>}
 */
function extractCssJsFileMap() {
  const extensionsCssMap = fs.readFileSync(EXTENSIONSCSSMAP, 'utf8');
  const extensionsCssMapJson = JSON.parse(extensionsCssMap);
  const extensions = Object.keys(extensionsCssMapJson);
  const cssJsFileMap = {};

  // Adds an entry that maps a CSS file to a JS file
  function addCssJsEntry(cssData, cssBinaryName, cssJsFileMap) {
    const cssFilePath =
      `extensions/${cssData['name']}/${cssData['version']}/` +
      `${cssBinaryName}.css`;
    const jsFilePath = `build/${cssBinaryName}-${cssData['version']}.css.js`;
    cssJsFileMap[cssFilePath] = jsFilePath;
  }

  extensions.forEach((extension) => {
    const cssData = extensionsCssMapJson[extension];
    if (cssData['hasCss']) {
      addCssJsEntry(cssData, cssData['name'], cssJsFileMap);
      if (cssData.hasOwnProperty('cssBinaries')) {
        const cssBinaries = cssData['cssBinaries'];
        cssBinaries.forEach((cssBinary) => {
          addCssJsEntry(cssData, cssBinary, cssJsFileMap);
        });
      }
    }
  });
  return cssJsFileMap;
}

/**
 * Checks whether a JS file imports any files included in possibleImports
 *
 * @param {string} jsFile
 * @param {Array<string>} possibleImports
 * @return {boolean}
 */
function areAnyDependencies(jsFile, possibleImports) {
  const dependencies = dependencyTree.toList({
    filename: jsFile,
    directory: '/',
    filter: (path) => path.indexOf('node_modules') === -1,
  });
  return dependencies.some((dependency) => {
    return possibleImports.includes(dependency);
  });
}

/**
 * Retrieves the set of JS source files that import the given CSS file.
 *
 * @param {string} cssFile
 * @param {!Object<string, string>} cssJsFileMap
 * @return {!Array<string>}
 */
function getJsFilesFor(cssFile, cssJsFileMap) {
  const jsFiles = [];
  if (cssJsFileMap.hasOwnProperty(cssFile)) {
    const cssFileDir = path.dirname(cssFile);
    const jsFilesInDir = fs.readdirSync(cssFileDir).filter((file) => {
      return path.extname(file) == '.js';
    });
    jsFilesInDir.forEach((jsFile) => {
      const jsFilePath = `${cssFileDir}/${jsFile}`;
      const cssFilePath = path.resolve(cssJsFileMap[cssFile]);
      if (areAnyDependencies(jsFile, [cssFilePath])) {
        jsFiles.push(jsFilePath);
      }
    });
  }
  return jsFiles;
}

function getUnitTestsToRun(unitTestPaths = testConfig.unitTestPaths) {
  log(green('INFO:'), 'Determining which unit tests to run...');

  if (isLargeRefactor()) {
    log(
      green('INFO:'),
      'Skipping tests on local changes because this is a large refactor.'
    );
    reportTestSkipped();
    return;
  }

  const tests = unitTestsToRun(unitTestPaths);
  if (tests.length == 0) {
    log(
      green('INFO:'),
      'No unit tests were directly affected by local changes.'
    );
    reportTestSkipped();
    return;
  }

  log(green('INFO:'), 'Running the following unit tests:');
  tests.forEach((test) => {
    log(cyan(test));
  });

  return tests;
}

/**
 * Extracts the list of unit tests to run based on the changes in the local
 * branch.
 *
 * @param {!Array<string>} unitTestPaths
 * @return {!Array<string>}
 */
function unitTestsToRun(unitTestPaths) {
  const cssJsFileMap = extractCssJsFileMap();
  const filesChanged = gitDiffNameOnlyMaster();
  const testsToRun = [];
  let srcFiles = [];

  function isUnitTest(file) {
    return unitTestPaths.some((pattern) => {
      return minimatch(file, pattern);
    });
  }

  function shouldRunTest(testFile, srcFiles) {
    const absolutePaths = srcFiles.map((file) => {
      return path.resolve(file);
    });

    return areAnyDependencies(testFile, absolutePaths);
  }

  // Retrieves the set of unit tests that should be run
  // for a set of source files.
  function getTestsFor(srcFiles) {
    const allUnitTests = globby.sync(unitTestPaths);
    return allUnitTests.filter((testFile) => {
      return shouldRunTest(testFile, srcFiles);
    });
  }

  filesChanged.forEach((file) => {
    if (!fs.existsSync(file)) {
      if (!isTravisBuild()) {
        log(green('INFO:'), 'Skipping', cyan(file), 'because it was deleted');
      }
    } else if (isUnitTest(file)) {
      testsToRun.push(file);
    } else if (path.extname(file) == '.js') {
      srcFiles.push(file);
    } else if (path.extname(file) == '.css') {
      srcFiles = srcFiles.concat(getJsFilesFor(file, cssJsFileMap));
    }
  });

  if (srcFiles.length > 0) {
    const moreTestsToRun = getTestsFor(srcFiles);
    moreTestsToRun.forEach((test) => {
      if (!testsToRun.includes(test)) {
        testsToRun.push(test);
      }
    });
  }
  return testsToRun;
}

module.exports = getUnitTestsToRun;
