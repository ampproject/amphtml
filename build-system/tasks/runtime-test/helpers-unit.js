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

const fs = require('fs');
const globby = require('globby');
const listImportsExports = require('list-imports-exports');
const minimatch = require('minimatch');
const path = require('path');
const testConfig = require('../../test-configs/config');
const {execOrDie} = require('../../common/exec');
const {extensions, maybeInitializeExtensions} = require('../extension-helpers');
const {gitDiffNameOnlyMaster} = require('../../common/git');
const {green, cyan} = require('kleur/colors');
const {isCiBuild} = require('../../common/ci');
const {log, logLocalDev} = require('../../common/logging');
const {reportTestSkipped} = require('../report-test-status');

const LARGE_REFACTOR_THRESHOLD = 50;
const TEST_FILE_COUNT_THRESHOLD = 20;
const ROOT_DIR = path.resolve(__dirname, '../../../');
let testsToRun = null;

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
 * Extracts extension info and creates a mapping from CSS files in different
 * source directories to their equivalent JS files in the 'build/' directory.
 *
 * @return {!Object<string, string>}
 */
function extractCssJsFileMap() {
  execOrDie('gulp css', {'stdio': 'ignore'});
  maybeInitializeExtensions(extensions);
  /** @type {Object<string, string>} */
  const cssJsFileMap = {};

  /**
   * Adds an entry that maps a CSS file to a JS file
   *
   * @param {Object} cssData
   * @param {string} cssBinaryName
   * @param {Object} cssJsFileMap
   */
  function addCssJsEntry(cssData, cssBinaryName, cssJsFileMap) {
    const cssFilePath =
      `extensions/${cssData['name']}/${cssData['version']}/` +
      `${cssBinaryName}.css`;
    const jsFilePath = `build/${cssBinaryName}-${cssData['version']}.css.js`;
    cssJsFileMap[cssFilePath] = jsFilePath;
  }

  Object.keys(extensions).forEach((extension) => {
    const cssData = extensions[extension];
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
 * Returns the list of files imported by a JS file
 *
 * @param {string} jsFile
 * @return {!Array<string>}
 */
function getImports(jsFile) {
  const jsFileContents = fs.readFileSync(jsFile, 'utf8');
  const {imports} = listImportsExports.parse(jsFileContents, [
    'importAssertions',
  ]);
  const files = [];
  const jsFileDir = path.dirname(jsFile);
  imports.forEach(function (file) {
    const fullPath = path.resolve(jsFileDir, `${file}.js`);
    if (fs.existsSync(fullPath)) {
      const relativePath = path.relative(ROOT_DIR, fullPath);
      files.push(relativePath);
    }
  });
  return files;
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
      if (getImports(jsFilePath).includes(cssJsFileMap[cssFile])) {
        jsFiles.push(jsFilePath);
      }
    });
  }
  return jsFiles;
}

/**
 * Computes the list of unit tests to run under difference scenarios
 * @return {Promise<Array<string>|void>}
 */
async function getUnitTestsToRun() {
  log(green('INFO:'), 'Determining which unit tests to run...');

  if (isLargeRefactor()) {
    log(
      green('INFO:'),
      'Skipping tests on local changes because this is a large refactor.'
    );
    await reportTestSkipped();
    return;
  }

  const tests = unitTestsToRun();
  if (tests.length == 0) {
    log(
      green('INFO:'),
      'No unit tests were directly affected by local changes.'
    );
    await reportTestSkipped();
    return;
  }
  if (isCiBuild() && tests.length > TEST_FILE_COUNT_THRESHOLD) {
    log(
      green('INFO:'),
      'Several tests were affected by local changes. Running all tests below.'
    );
    await reportTestSkipped();
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
 * branch. Return value is cached to optimize for multiple calls.
 *
 * @return {!Array<string>}
 */
function unitTestsToRun() {
  if (testsToRun) {
    return testsToRun;
  }
  const cssJsFileMap = extractCssJsFileMap();
  const filesChanged = gitDiffNameOnlyMaster();
  const {unitTestPaths} = testConfig;
  testsToRun = [];
  let srcFiles = [];

  /**
   * @param {string} file
   * @return {boolean}
   */
  function isUnitTest(file) {
    return unitTestPaths.some((pattern) => {
      return minimatch(file, pattern);
    });
  }

  /**
   * @param {string} testFile
   * @param {string[]} srcFiles
   * @return {boolean}
   */
  function shouldRunTest(testFile, srcFiles) {
    const filesImported = getImports(testFile);
    return (
      filesImported.filter(function (file) {
        return srcFiles.includes(file);
      }).length > 0
    );
  }

  /**
   * Retrieves the set of unit tests that should be run
   * for a set of source files.
   *
   * @param {string[]} srcFiles
   * @return {string[]}
   */
  function getTestsFor(srcFiles) {
    const allUnitTests = globby.sync(unitTestPaths);
    return allUnitTests.filter((testFile) => {
      return shouldRunTest(testFile, srcFiles);
    });
  }

  filesChanged.forEach((file) => {
    if (!fs.existsSync(file)) {
      logLocalDev(
        green('INFO:'),
        'Skipping',
        cyan(file),
        'because it was deleted'
      );
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

module.exports = {
  isLargeRefactor,
  getUnitTestsToRun,
  unitTestsToRun,
};
