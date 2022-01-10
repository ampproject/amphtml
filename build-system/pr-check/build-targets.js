'use strict';

/**
 * @fileoverview
 * This script sets the build targets for our PR check, where the build targets
 * determine which tasks are required to run for pull request builds.
 */
const config = require('../test-configs/config');
const fastGlob = require('fast-glob');
const fs = require('fs');
const json5 = require('json5');
const minimatch = require('minimatch');
const path = require('path');
const {cyan} = require('kleur/colors');
const {getLoggingPrefix, logWithoutTimestamp} = require('../common/logging');
const {gitDiffNameOnlyMain} = require('../common/git');
const {ignoreListFiles} = require('../tasks/check-ignore-lists');
const {isCiBuild} = require('../common/ci');
const {shouldTriggerAva} = require('../tasks/ava');

/**
 * Used to prevent the repeated recomputing of build targets during PR jobs.
 */
let buildTargets;

/**
 * Used to prevent the repeated expansion of globs during PR jobs.
 */
const fileLists = {};
const jsonFilesWithSchemas = [];

/***
 * All of AMP's build targets that can be tested during CI.
 *
 * @enum {string}
 */
const Targets = {
  AVA: 'AVA',
  BABEL_PLUGIN: 'BABEL_PLUGIN',
  BUILD_SYSTEM: 'BUILD_SYSTEM',
  DEV_DASHBOARD: 'DEV_DASHBOARD',
  DOCS: 'DOCS',
  E2E_TEST: 'E2E_TEST',
  HTML_FIXTURES: 'HTML_FIXTURES',
  IGNORE_LIST: 'IGNORE_LIST',
  INTEGRATION_TEST: 'INTEGRATION_TEST',
  INVALID_WHITESPACES: 'INVALID_WHITESPACES',
  JSON_FILES: 'JSON_FILES',
  LINT: 'LINT',
  LINT_RULES: 'LINT_RULES',
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
  Targets.DEV_DASHBOARD,
  Targets.DOCS,
  Targets.E2E_TEST,
  Targets.IGNORE_LIST,
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
    return shouldTriggerAva(file);
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
  [Targets.BUILD_SYSTEM]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file == 'build-system/tasks/check-build-system.js' ||
      file == 'build-system/tsconfig.json' ||
      (file.startsWith('build-system') &&
        (file.endsWith('.js') ||
          file.endsWith('.ts') ||
          file.endsWith('.json')))
    );
  },
  [Targets.DOCS]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      fileLists.linkCheckFiles.includes(file) ||
      file == 'build-system/tasks/check-links.js' ||
      file.startsWith('build-system/tasks/markdown-toc/')
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
  [Targets.HTML_FIXTURES]: (file) => {
    return (
      fileLists.htmlFixtureFiles.includes(file) ||
      file == 'build-system/tasks/validate-html-fixtures.js' ||
      file.startsWith('build-system/test-configs')
    );
  },
  [Targets.IGNORE_LIST]: (file) => {
    return (
      ignoreListFiles.includes(file) ||
      file === 'build-system/tasks/check-ignore-lists.js' ||
      file === 'build-system/tasks/clean.js'
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
  [Targets.INVALID_WHITESPACES]: (file) => {
    return (
      fileLists.invalidWhitespaceFiles.includes(file) ||
      file == 'build-system/tasks/check-invalid-whitespaces.js' ||
      file.startsWith('build-system/test-configs')
    );
  },
  [Targets.JSON_FILES]: (file) => {
    return (
      jsonFilesWithSchemas.includes(file) ||
      file == 'build-system/tasks/check-json-schemas.js' ||
      file == '.vscode/settings.json'
    );
  },
  [Targets.LINT]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      fileLists.lintFiles.includes(file) ||
      file == 'build-system/tasks/lint.js' ||
      file.startsWith('build-system/test-configs')
    );
  },
  [Targets.LINT_RULES]: (file) => {
    if (isOwnersFile(file)) {
      return false;
    }
    return (
      file.startsWith('build-system/eslint-rules') ||
      file.endsWith('.eslintrc.js') ||
      file == '.eslintignore' ||
      file == '.prettierrc' ||
      file == '.prettierignore' ||
      file == 'build-system/test-configs/forbidden-terms.js' ||
      file == 'package.json'
    );
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
    return (
      fileLists.presubmitFiles.includes(file) ||
      file == 'build-system/tasks/presubmit-checks.js' ||
      file.startsWith('build-system/test-configs')
    );
  },
  [Targets.PRETTIFY]: (file) => {
    // OWNERS files can be prettified.
    return (
      fileLists.prettifyFiles.includes(file) ||
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
      file == 'test/visual-diff/visual-tests.jsonc'
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
  expandFileLists();
  buildTargets = new Set();
  const filesChanged = gitDiffNameOnlyMain();
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

/**
 * Helper that expands some of the config globs used to match files. Called once
 * at the start in order to avoid repeated glob expansion.
 */
function expandFileLists() {
  const globNames = [
    'htmlFixtureGlobs',
    'invalidWhitespaceGlobs',
    'linkCheckGlobs',
    'lintGlobs',
    'presubmitGlobs',
    'prettifyGlobs',
  ];
  for (const globName of globNames) {
    const fileListName = globName.replace('Globs', 'Files');
    fileLists[fileListName] = fastGlob.sync(config[globName], {dot: true});
  }

  const vscodeSettings = json5.parse(
    fs.readFileSync('.vscode/settings.json', 'utf8')
  );
  /** @type {Array<{fileMatch: string[], url: string}>} */
  const schemas = vscodeSettings['json.schemas'];
  const jsonGlobs = schemas.flatMap(({fileMatch, url}) => [
    ...fileMatch,
    path.normalize(url),
  ]);
  jsonFilesWithSchemas.push(
    fastGlob.sync(jsonGlobs, {
      dot: true,
      ignore: ['**/node_modules'],
    })
  );
}

module.exports = {
  buildTargetsInclude,
  determineBuildTargets,
  Targets,
};
