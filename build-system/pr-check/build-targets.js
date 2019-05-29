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
 * A mapping of functions that match a given file to one or more build targets.
 */
const targetMatchers = [
  {
    targets: ['AVA'],
    func: file => {
      return (
        file == 'build-system/tasks/ava.js' ||
        file.startsWith('build-system/tasks/csvify-size/') ||
        file.startsWith('build-system/tasks/get-zindex/') ||
        file.startsWith('build-system/tasks/prepend-global/')
      );
    },
  },
  {
    targets: ['BABEL_PLUGIN', 'RUNTIME'], // Test the runtime for babel plugin changes.
    func: file => {
      return (
        file == 'build-system/tasks/babel-plugin-tests.js' ||
        file.startsWith('build-system/babel-plugins/')
      );
    },
  },
  {
    targets: ['CACHES_JSON'],
    func: file => {
      return (
        file == 'build-system/tasks/json-check.js' || file == 'caches.json'
      );
    },
  },
  {
    targets: ['DEV_DASHBOARD'],
    func: file => {
      return (
        file == 'build-system/tasks/dev-dashboard-tests.js' ||
        file == 'build-system/app.js' ||
        file.startsWith('build-system/app-index/')
      );
    },
  },
  {
    targets: ['DOCS'],
    func: file => {
      return (
        file == 'build-system/tasks/check-links.js' ||
        (path.extname(file) == '.md' && !file.startsWith('examples/'))
      );
    },
  },
  {
    targets: ['E2E_TEST'],
    func: file => {
      return (
        file.startsWith('build-system/tasks/e2e/') ||
        config.e2eTestPaths.some(pattern => {
          return minimatch(file, pattern);
        })
      );
    },
  },
  {
    targets: ['FLAG_CONFIG'],
    func: file => {
      return file.startsWith('build-system/global-configs/');
    },
  },
  {
    targets: ['INTEGRATION_TEST'],
    func: file => {
      return (
        file.startsWith('build-system/tasks/runtime-test/') ||
        config.integrationTestPaths.some(pattern => {
          return minimatch(file, pattern);
        })
      );
    },
  },
  {
    targets: ['UNIT_TEST'],
    func: file => {
      return (
        file.startsWith('build-system/tasks/runtime-test/') ||
        config.unitTestPaths.some(pattern => {
          return minimatch(file, pattern);
        })
      );
    },
  },
  {
    targets: ['VALIDATOR', 'RUNTIME'], // Test the runtime for validator changes.
    func: file => {
      if (file.startsWith('validator/webui/')) {
        return false;
      }
      if (file.startsWith('validator/')) {
        return true;
      }
      // validator files for each extension
      if (!file.startsWith('extensions/')) {
        return false;
      }
      const pathArray = path.dirname(file).split(path.sep);
      if (pathArray.length < 2) {
        // At least 2 with ['extensions', '{$name}']
        return false;
      }
      // Validator files take the form of validator-.*\.(html|out|protoascii)
      const name = path.basename(file);
      return (
        name.startsWith('validator-') &&
        (name.endsWith('.out') ||
          name.endsWith('.html') ||
          name.endsWith('.protoascii'))
      );
    },
  },
  {
    targets: ['VALIDATOR_WEBUI'],
    func: file => {
      return file.startsWith('validator/webui/');
    },
  },
  {
    targets: ['VISUAL_DIFF'],
    func: file => {
      return (
        file.startsWith('build-system/tasks/visual-diff/') ||
        file.startsWith('examples/visual-tests/') ||
        file == 'test/visual-diff/visual-tests'
      );
    },
  },
];

/**
 * Returns false if flag config files are mixed with any other files.
 * @param {!Set<string>} buildTargets
 * @param {string} fileName
 * @return {boolean}
 */
function areValidBuildTargets(buildTargets, fileName) {
  const files = gitDiffNameOnlyMaster();
  const fileLogPrefix = colors.bold(colors.yellow(`${fileName}:`));
  if (buildTargets.has('FLAG_CONFIG') && buildTargets.size > 1) {
    console.log(
      fileLogPrefix,
      colors.red('ERROR:'),
      'Looks like your PR contains',
      colors.cyan('{prod|canary}-config.json'),
      'in addition to other files.'
    );
    console.log(
      fileLogPrefix,
      colors.red('ERROR:'),
      'AMP config files need to be backward compatible with source code for at',
      'least two weeks. See https://github.com/ampproject/amphtml/issues/8188.'
    );
    const nonFlagConfigFiles = files.filter(
      file => !file.startsWith('build-system/global-configs/')
    );
    console.log(
      fileLogPrefix,
      colors.red('ERROR:'),
      'Please move these files to a separate PR:\n',
      colors.cyan(nonFlagConfigFiles.join('\n '))
    );
    return false;
  }
  return true;
}

/**
 * Populates buildTargets with a set of build targets contained in a PR after
 * making sure they are valid. Used to determine which checks to perform / tests
 * to run during PR builds.
 * @param {!Set<string>} buildTargets
 * @param {string} fileName
 * @return {boolean}
 */
function determineBuildTargets(buildTargets, fileName = 'build-targets.js') {
  const filesChanged = gitDiffNameOnlyMaster();
  buildTargets.clear;
  for (const file of filesChanged) {
    let matched = false;
    targetMatchers.forEach(matcher => {
      if (matcher.func(file)) {
        matcher.targets.forEach(target => buildTargets.add(target));
        matched = true;
      }
    });
    if (!matched) {
      buildTargets.add('RUNTIME'); // Default to RUNTIME for files that don't match a target.
    }
  }
  const fileLogPrefix = colors.bold(colors.yellow(`${fileName}:`));
  console.log(
    `${fileLogPrefix} Detected build targets:`,
    colors.cyan(
      Array.from(buildTargets)
        .sort()
        .join(', ')
    )
  );
  return areValidBuildTargets(buildTargets, fileName);
}

module.exports = {
  determineBuildTargets,
};
