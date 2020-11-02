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
const config = require('../test-configs/config');
const minimatch = require('minimatch');
const path = require('path');
const {gitDiffNameOnlyMaster} = require('../common/git');
const {isTravisBuild} = require('../common/travis');

/**
 * Checks if the given file is an OWNERS file.
 *
 * @param {string} file
 * @return {boolean}
 */
function isOwnersFile(file) {
  return file.endsWith('OWNERS');
}

/**
 * Checks if the given file is of the form validator-.*\.(html|out|protoascii)
 *
 * @param {string} file
 * @return {boolean}
 */
function isValidatorFile(file) {
  const name = path.basename(file);
  return (
    name.startsWith('validator-') &&
    (name.endsWith('.out') ||
      name.endsWith('.html') ||
      name.endsWith('.protoascii'))
  );
}

/**
 * A dictionary of functions that match a given file to a given build target.
 */
const targetMatchers = {
  'AVA': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/ava.js' ||
      file.startsWith('build-system/tasks/csvify-size/') ||
      file.startsWith('build-system/tasks/get-zindex/') ||
      file.startsWith('build-system/tasks/prepend-global/')
    );
  },
  'BABEL_PLUGIN': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/babel-plugins/log-module-metadata.js' ||
      file == 'build-system/babel-plugins/static-template-metadata.js' ||
      file == 'build-system/compile/internal-version.js' ||
      file == 'build-system/compile/log-messages.js' ||
      file == 'build-system/tasks/babel-plugin-tests.js' ||
      file == 'babel.config.js' ||
      file.startsWith('build-system/babel-plugins/') ||
      file.startsWith('build-system/babel-config/')
    );
  },
  'CACHES_JSON': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/caches-json.js' ||
      file == 'build-system/global-configs/caches.json'
    );
  },
  'DEV_DASHBOARD': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/dev-dashboard-tests.js' ||
      file == 'build-system/server/app.js' ||
      file.startsWith('build-system/server/app-index/')
    );
  },
  'DOCS': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/check-links.js' ||
      (path.extname(file) == '.md' && !file.startsWith('examples/'))
    );
  },
  'E2E_TEST': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file.startsWith('build-system/tasks/e2e/') ||
      config.e2eTestPaths.some((pattern) => {
        return minimatch(file, pattern);
      })
    );
  },
  'FLAG_CONFIG': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return file.startsWith('build-system/global-configs/');
  },
  'INTEGRATION_TEST': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/integration.js' ||
      (file.startsWith('build-system/tasks/runtime-test/') &&
        !file.endsWith('unit.js')) ||
      config.integrationTestPaths.some((pattern) => {
        return minimatch(file, pattern);
      })
    );
  },
  'OWNERS': (file) => {
    return isOwnersFile(file) || file == 'build-system/tasks/check-owners.js';
  },
  'PACKAGE_UPGRADE': (file) => {
    return file == 'package.json' || file == 'package-lock.json';
  },
  'RENOVATE_CONFIG': (file) => {
    return (
      file == '.renovaterc.json' ||
      file == 'build-system/tasks/check-renovate-config.js'
    );
  },
  'RUNTIME': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return file.startsWith('src/');
  },
  'SERVER': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/serve.js' ||
      file == 'build-system/tasks/server-tests.js' ||
      file.startsWith('build-system/server/')
    );
  },
  'UNIT_TEST': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/unit.js' ||
      file.startsWith('build-system/tasks/runtime-test/') ||
      config.unitTestPaths.some((pattern) => {
        return minimatch(file, pattern);
      })
    );
  },
  'VALIDATOR': (file) => {
    if (isOwnersFile(file) || file.startsWith('validator/js/webui/')) {
      return false;
    }
    return (
      file.startsWith('validator/') ||
      file === 'build-system/tasks/validator.js' ||
      isValidatorFile(file)
    );
  },
  'VALIDATOR_WEBUI': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file.startsWith('validator/js/webui/') ||
      file === 'build-system/tasks/validator.js'
    );
  },
  'VISUAL_DIFF': (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file.startsWith('build-system/tasks/visual-diff/') ||
      file.startsWith('examples/visual-tests/') ||
      file == 'test/visual-diff/visual-tests'
    );
  },
};

/**
 * Populates buildTargets with a set of build targets contained in a PR after
 * making sure they are valid. Used to determine which checks to perform / tests
 * to run during PR builds.
 * @param {string} fileName
 * @return {boolean}
 */
function determineBuildTargets(fileName = 'build-targets.js') {
  const filesChanged = gitDiffNameOnlyMaster();
  const buildTargets = new Set();
  for (const file of filesChanged) {
    let matched = false;
    Object.keys(targetMatchers).forEach((target) => {
      const matcher = targetMatchers[target];
      if (matcher(file)) {
        buildTargets.add(target);
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
    colors.cyan(Array.from(buildTargets).sort().join(', '))
  );
  // Test the runtime for babel plugin and server changes.
  if (buildTargets.has('BABEL_PLUGIN') || buildTargets.has('SERVER')) {
    buildTargets.add('RUNTIME');
  }
  // Test all targets on Travis during package upgrades.
  if (isTravisBuild() && buildTargets.has('PACKAGE_UPGRADE')) {
    const allTargets = Object.keys(targetMatchers);
    allTargets.forEach((target) => buildTargets.add(target));
  }
  return buildTargets;
}

module.exports = {
  determineBuildTargets,
};
