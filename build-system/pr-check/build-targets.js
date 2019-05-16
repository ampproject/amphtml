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

/**
 * @fileoverview
 * This script sets the build targets for our PR check, where the build targets
 * determine which tasks are required to run for pull request builds.
 */
const colors = require('ansi-colors');
const config = require('../config');
const minimatch = require('minimatch');
const path = require('path');
const {gitDiffNameOnlyMaster} = require('../git');

/**
 * Determines whether the given file belongs to the Validator webui,
 * that is, the 'VALIDATOR_WEBUI' target.
 * @param {string} filePath
 * @return {boolean}
 */
function isValidatorWebuiFile(filePath) {
  return filePath.startsWith('validator/webui');
}

/**
 * Determines whether the given file belongs to the build system,
 * that is, the 'BUILD_SYSTEM' target.
 * @param {string} filePath
 * @return {boolean}
 */
function isBuildSystemFile(filePath) {
  return (
    (filePath.startsWith('build-system') &&
      // Exclude textproto from build-system since we want it to trigger
      // tests and type check.
      path.extname(filePath) != '.textproto' &&
      // Exclude config files from build-system since we want it to trigger
      // the flag config check.
      !isFlagConfig(filePath) &&
      // Exclude the dev dashboard from build-system, since we want it to
      // trigger the devDashboard check
      !isDevDashboardFile(filePath) &&
      // Exclude visual diff files from build-system since we want it to trigger
      // visual diff tests.
      !isVisualDiffFile(filePath)) ||
    // OWNERS.yaml files should trigger build system to run tests
    isOwnersFile(filePath)
  );
}

/**
 * Determines whether the given file belongs to the build system, but also
 * affects the runtime.
 * @param {string} filePath
 * @return {boolean}
 */
function isBuildSystemAndRuntimeFile(filePath) {
  return (
    isBuildSystemFile(filePath) &&
    // These build system files are involved in the compilation/bundling and
    // are likely to affect the runtime as well.
    (filePath.startsWith('build-system/babel-plugins') ||
      filePath.startsWith('build-system/runner'))
  );
}

/**
 * Determines whether the given file belongs to the validator,
 * that is, the 'VALIDATOR' target. This assumes (but does not
 * check) that the file is not part of 'VALIDATOR_WEBUI'.
 * @param {string} filePath
 * @return {boolean}
 */
function isValidatorFile(filePath) {
  if (filePath.startsWith('validator/')) {
    return true;
  }

  // validator files for each extension
  if (!filePath.startsWith('extensions/')) {
    return false;
  }

  const pathArray = path.dirname(filePath).split(path.sep);
  if (pathArray.length < 2) {
    // At least 2 with ['extensions', '{$name}']
    return false;
  }

  // Validator files take the form of validator-.*\.(html|out|protoascii)
  const name = path.basename(filePath);
  return (
    name.startsWith('validator-') &&
    (name.endsWith('.out') ||
      name.endsWith('.html') ||
      name.endsWith('.protoascii'))
  );
}

/**
 * Determines if the given path has a OWNERS.yaml basename.
 * @param {string} filePath
 * @return {boolean}
 */
function isOwnersFile(filePath) {
  return path.basename(filePath) === 'OWNERS.yaml';
}

/**
 * Determines if the given file is a markdown file containing documentation.
 * @param {string} filePath
 * @return {boolean}
 */
function isDocFile(filePath) {
  return path.extname(filePath) == '.md' && !filePath.startsWith('examples/');
}

/**
 * Determines if the given file is related to the visual diff tests.
 * @param {string} filePath
 * @return {boolean}
 */
function isVisualDiffFile(filePath) {
  const filename = path.basename(filePath);
  return (
    filename == 'visual-diff.js' ||
    filename == 'visual-tests' ||
    filePath.startsWith('examples/visual-tests/')
  );
}

/**
 * Determines if the given file is a unit test.
 * @param {string} filePath
 * @return {boolean}
 */
function isUnitTest(filePath) {
  return config.unitTestPaths.some(pattern => {
    return minimatch(filePath, pattern);
  });
}

/**
 * Determines if the given file is,
 * a file concerning the dev dashboard
 * Concerning the dev dashboard
 * @param {string} filePath
 * @return {boolean}
 */
function isDevDashboardFile(filePath) {
  return (
    filePath === 'build-system/app.js' ||
    filePath.startsWith('build-system/app-index/')
  );
}

/**
 * Determines if the given file is an integration test.
 * @param {string} filePath
 * @return {boolean}
 */
function isIntegrationTest(filePath) {
  return config.integrationTestPaths.some(pattern => {
    return minimatch(filePath, pattern);
  });
}

/**
 * Determines if the given file contains flag configurations, by comparing it
 * against the well-known json config filenames for prod and canary.
 * @param {string} filePath
 * @return {boolean}
 */
function isFlagConfig(filePath) {
  const filename = path.basename(filePath);
  return filename == 'prod-config.json' || filename == 'canary-config.json';
}

/**
 * Validate build targets.
 * Exit early if flag-config files are mixed with runtime files.
 * @param {!Set<string>} buildTargets
 * @param {string} fileName
 * @return {boolean}
 */
function areValidBuildTargets(buildTargets, fileName) {
  const files = gitDiffNameOnlyMaster();
  if (buildTargets.has('FLAG_CONFIG') && buildTargets.has('RUNTIME')) {
    console.log(
      fileName,
      colors.red('ERROR:'),
      'Looks like your PR contains',
      colors.cyan('{prod|canary}-config.json'),
      'in addition to some other files.  Config and code are not kept in',
      'sync, and config needs to be backwards compatible with code for at',
      'least two weeks.  See #8188'
    );
    const nonFlagConfigFiles = files.filter(file => !isFlagConfig(file));
    const fileLogPrefix = colors.bold(colors.yellow(`${fileName}:`));
    console.log(
      fileLogPrefix,
      colors.red('ERROR:'),
      'Please move these files to a separate PR:',
      colors.cyan(nonFlagConfigFiles.join(', '))
    );
    return false;
  }
  return true;
}

/**
 * Determines the targets that will be executed by the main method of
 * this script. The order within this function matters.
 * @return {!Set<string>}
 */
function determineBuildTargets() {
  const filePaths = gitDiffNameOnlyMaster();

  if (filePaths.length == 0) {
    return new Set([
      'BUILD_SYSTEM',
      'VALIDATOR_WEBUI',
      'VALIDATOR',
      'RUNTIME',
      'UNIT_TEST',
      'DEV_DASHBOARD',
      'INTEGRATION_TEST',
      'DOCS',
      'FLAG_CONFIG',
      'VISUAL_DIFF',
    ]);
  }
  const targetSet = new Set();
  for (const p of filePaths) {
    if (isBuildSystemFile(p)) {
      targetSet.add('BUILD_SYSTEM');
      if (isBuildSystemAndRuntimeFile(p)) {
        targetSet.add('RUNTIME');
      }
    } else if (isValidatorWebuiFile(p)) {
      targetSet.add('VALIDATOR_WEBUI');
    } else if (isValidatorFile(p)) {
      targetSet.add('VALIDATOR');
    } else if (isDocFile(p)) {
      targetSet.add('DOCS');
    } else if (isFlagConfig(p)) {
      targetSet.add('FLAG_CONFIG');
    } else if (isUnitTest(p)) {
      targetSet.add('UNIT_TEST');
    } else if (isDevDashboardFile(p)) {
      targetSet.add('DEV_DASHBOARD');
    } else if (isIntegrationTest(p)) {
      targetSet.add('INTEGRATION_TEST');
    } else if (isVisualDiffFile(p)) {
      targetSet.add('VISUAL_DIFF');
    } else {
      targetSet.add('RUNTIME');
    }
  }
  return targetSet;
}

module.exports = {
  areValidBuildTargets,
  determineBuildTargets,
};
