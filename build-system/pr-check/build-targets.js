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
const config = require('../test-configs/config');
const globby = require('globby');
const minimatch = require('minimatch');
const path = require('path');
const {cyan} = require('kleur/colors');
const {getLoggingPrefix, logWithoutTimestamp} = require('../common/logging');
const {gitDiffNameOnlyMaster} = require('../common/git');
const {isCiBuild} = require('../common/ci');

/**
 * Used to prevent the repeated recomputing of build targets during PR jobs.
 */
let buildTargets;

/**
 * Used to prevent the repeated expansion of globs during PR jobs.
 */
let lintFiles;
let presubmitFiles;
let prettifyFiles;

/***
 * All of AMP's build targets that can be tested during CI.
 *
 * @enum {string}
 */
const Targets = {
  AVA: 'AVA',
  BABEL_PLUGIN: 'BABEL_PLUGIN',
  CACHES_JSON: 'CACHES_JSON',
  DEV_DASHBOARD: 'DEV_DASHBOARD',
  DOCS: 'DOCS',
  E2E_TEST: 'E2E_TEST',
  INTEGRATION_TEST: 'INTEGRATION_TEST',
  LINT: 'LINT',
  OWNERS: 'OWNERS',
  PACKAGE_UPGRADE: 'PACKAGE_UPGRADE',
  PRESUBMIT: 'PRESUBMIT',
  PRETTIFY: 'PRETTIFY',
  RENOVATE_CONFIG: 'RENOVATE_CONFIG',
  RUNTIME: 'RUNTIME',
  SERVER: 'SERVER',
  UNIT_TEST: 'UNIT_TEST',
  VALIDATOR: 'VALIDATOR',
  VALIDATOR_WEBUI: 'VALIDATOR_WEBUI',
  VISUAL_DIFF: 'VISUAL_DIFF',
};

/**
 * Files matching these targets are known not to affect the runtime. For all
 * other targets, we play safe and default to adding the RUNTIME target, which
 * will trigger all the runtime tests.
 */
const nonRuntimeTargets = [
  Targets.AVA,
  Targets.CACHES_JSON,
  Targets.DEV_DASHBOARD,
  Targets.DOCS,
  Targets.E2E_TEST,
  Targets.INTEGRATION_TEST,
  Targets.OWNERS,
  Targets.RENOVATE_CONFIG,
  Targets.UNIT_TEST,
  Targets.VALIDATOR,
  Targets.VALIDATOR_WEBUI,
  Targets.VISUAL_DIFF,
];

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
 * Checks if the given file is of the form validator-.*\.(html|out|out.cpponly|protoascii)
 *
 * @param {string} file
 * @return {boolean}
 */
function isValidatorFile(file) {
  const name = path.basename(file);
  return (
    name.startsWith('validator-') &&
    (name.endsWith('.out') ||
      name.endsWith('.out.cpponly') ||
      name.endsWith('.html') ||
      name.endsWith('.protoascii'))
  );
}

/**
 * A dictionary of functions that match a given file to a given build target.
 * Owners files are special because they live all over the repo, so most target
 * matchers must first make sure they're not matching an owners file.
 */
const targetMatchers = {
  [Targets.AVA]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/ava.js' ||
      file.startsWith('build-system/tasks/get-zindex/') ||
      file.startsWith('build-system/tasks/markdown-toc/') ||
      file.startsWith('build-system/tasks/prepend-global/')
    );
  },
  [Targets.BABEL_PLUGIN]: (file) => {
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
  [Targets.CACHES_JSON]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/caches-json.js' ||
      file == 'build-system/global-configs/caches.json'
    );
  },
  [Targets.DEV_DASHBOARD]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/dev-dashboard-tests.js' ||
      file == 'build-system/server/app.js' ||
      file.startsWith('build-system/server/app-index/')
    );
  },
  [Targets.DOCS]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/check-links.js' ||
      file.startsWith('build-system/tasks/markdown-toc/') ||
      (path.extname(file) == '.md' && !file.startsWith('examples/'))
    );
  },
  [Targets.E2E_TEST]: (file) => {
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
  [Targets.INTEGRATION_TEST]: (file) => {
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
  [Targets.LINT]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return lintFiles.includes(file);
  },
  [Targets.OWNERS]: (file) => {
    return isOwnersFile(file) || file == 'build-system/tasks/check-owners.js';
  },
  [Targets.PACKAGE_UPGRADE]: (file) => {
    return file.endsWith('package.json') || file.endsWith('package-lock.json');
  },
  [Targets.PRESUBMIT]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return presubmitFiles.includes(file);
  },
  [Targets.PRETTIFY]: (file) => {
    // OWNERS files can be prettified.
    return (
      prettifyFiles.includes(file) ||
      file == '.prettierrc' ||
      file == '.prettierignore' ||
      file == 'build-system/tasks/prettify.js'
    );
  },
  [Targets.RENOVATE_CONFIG]: (file) => {
    return (
      file == '.renovaterc.json' ||
      file == 'build-system/tasks/check-renovate-config.js'
    );
  },
  [Targets.RUNTIME]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return file.startsWith('src/');
  },
  [Targets.SERVER]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/serve.js' ||
      file == 'build-system/tasks/server-tests.js' ||
      file.startsWith('build-system/server/')
    );
  },
  [Targets.UNIT_TEST]: (file) => {
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
  [Targets.VALIDATOR]: (file) => {
    if (isOwnersFile(file) || file.startsWith('validator/js/webui/')) {
      return false;
    }
    return (
      file.startsWith('validator/') ||
      file === 'build-system/tasks/validator.js' ||
      isValidatorFile(file)
    );
  },
  [Targets.VALIDATOR_WEBUI]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file.startsWith('validator/js/webui/') ||
      file === 'build-system/tasks/validator.js'
    );
  },
  [Targets.VISUAL_DIFF]: (file) => {
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
 * Returns the set of build targets affected by a PR after making sure they are
 * valid. Used to determine which checks to perform / tests to run during PR
 * builds. Exits early if targets have already been populated.
 * @return {Set<string>}
 */
function determineBuildTargets() {
  if (buildTargets != undefined) {
    return buildTargets;
  }
  buildTargets = new Set();
  lintFiles = globby.sync(config.lintGlobs);
  presubmitFiles = globby.sync(config.presubmitGlobs);
  prettifyFiles = globby.sync(config.prettifyGlobs);
  const filesChanged = gitDiffNameOnlyMaster();
  for (const file of filesChanged) {
    let isRuntimeFile = true;
    Object.keys(targetMatchers).forEach((target) => {
      const matcher = targetMatchers[target];
      if (matcher(file)) {
        buildTargets.add(target);
        if (nonRuntimeTargets.includes(target)) {
          isRuntimeFile = false;
        }
      }
    });
    if (isRuntimeFile) {
      buildTargets.add(Targets.RUNTIME);
    }
  }
  const loggingPrefix = getLoggingPrefix();
  logWithoutTimestamp(
    `${loggingPrefix} Detected build targets:`,
    cyan(Array.from(buildTargets).sort().join(', '))
  );
  // Test all targets during CI builds for package upgrades.
  if (isCiBuild() && buildTargets.has(Targets.PACKAGE_UPGRADE)) {
    logWithoutTimestamp(
      `${loggingPrefix} Running all tests since this PR contains package upgrades...`
    );
    const allTargets = Object.keys(targetMatchers);
    allTargets.forEach((target) => buildTargets.add(target));
  }
  return buildTargets;
}

/**
 * Returns true if a PR affects one or more of the given build targets.
 *
 * @param {...string} targets
 * @return {boolean}
 */
function buildTargetsInclude(...targets) {
  if (buildTargets.size == 0) {
    determineBuildTargets();
  }
  return Array.from(targets).some((target) => buildTargets.has(target));
}

module.exports = {
  buildTargetsInclude,
  determineBuildTargets,
  Targets,
};
