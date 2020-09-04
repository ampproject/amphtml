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

/* global require, process */

const argv = require('minimist')(process.argv.slice(2));
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const {cyan, red} = require('ansi-colors');

const {
  checkExactVersions,
} = require('./build-system/tasks/check-exact-versions');
const {
  checkRenovateConfig,
} = require('./build-system/tasks/check-renovate-config');
const {
  process3pGithubPr,
} = require('./build-system/tasks/process-3p-github-pr');
const {
  storybookAmp,
  storybookPreact,
} = require('./build-system/tasks/storybook');
const {a4a} = require('./build-system/tasks/a4a');
const {ava} = require('./build-system/tasks/ava');
const {babelPluginTests} = require('./build-system/tasks/babel-plugin-tests');
const {browse} = require('./build-system/tasks/browse');
const {build, watch} = require('./build-system/tasks/build');
const {bundleSize} = require('./build-system/tasks/bundle-size');
const {cachesJson} = require('./build-system/tasks/caches-json');
const {checkLinks} = require('./build-system/tasks/check-links');
const {checkOwners} = require('./build-system/tasks/check-owners');
const {checkSourcemaps} = require('./build-system/tasks/check-sourcemaps');
const {checkTypes} = require('./build-system/tasks/check-types');
const {cherryPick} = require('./build-system/tasks/cherry-pick');
const {clean} = require('./build-system/tasks/clean');
const {codecovUpload} = require('./build-system/tasks/codecov-upload');
const {compileJison} = require('./build-system/tasks/compile-jison');
const {coverageMap} = require('./build-system/tasks/coverage-map');
const {createGoldenCss} = require('./build-system/tasks/create-golden-css');
const {css} = require('./build-system/tasks/css');
const {csvifySize} = require('./build-system/tasks/csvify-size');
const {defaultTask} = require('./build-system/tasks/default-task');
const {depCheck} = require('./build-system/tasks/dep-check');
const {devDashboardTests} = require('./build-system/tasks/dev-dashboard-tests');
const {dist} = require('./build-system/tasks/dist');
const {e2e} = require('./build-system/tasks/e2e');
const {firebase} = require('./build-system/tasks/firebase');
const {getZindex} = require('./build-system/tasks/get-zindex');
const {integration} = require('./build-system/tasks/integration');
const {lint} = require('./build-system/tasks/lint');
const {makeExtension} = require('./build-system/tasks/extension-generator');
const {performanceUrls} = require('./build-system/tasks/performance-urls');
const {performance} = require('./build-system/tasks/performance');
const {prCheck} = require('./build-system/tasks/pr-check');
const {prependGlobal} = require('./build-system/tasks/prepend-global');
const {presubmit} = require('./build-system/tasks/presubmit-checks');
const {prettify} = require('./build-system/tasks/prettify');
const {release} = require('./build-system/tasks/release');
const {serverTests} = require('./build-system/tasks/server-tests');
const {serve} = require('./build-system/tasks/serve.js');
const {size} = require('./build-system/tasks/size');
const {testReportUpload} = require('./build-system/tasks/test-report-upload');
const {todosFindClosed} = require('./build-system/tasks/todos');
const {unit} = require('./build-system/tasks/unit');
const {updatePackages} = require('./build-system/tasks/update-packages');
const {validator, validatorWebui} = require('./build-system/tasks/validator');
const {vendorConfigs} = require('./build-system/tasks/vendor-configs');
const {visualDiff} = require('./build-system/tasks/visual-diff');

/**
 * Creates a gulp task using the given name and task function.
 *
 * @param {string} name
 * @param {function} taskFunc
 */
function createTask(name, taskFunc) {
  checkFlags(name, taskFunc);
  gulp.task(name, taskFunc);
}

/**
 * Checks if the flags passed in to a task are valid.
 * @param {string} name
 * @param {function} taskFunc
 */
function checkFlags(name, taskFunc) {
  const isDefaultTask = name == 'default' && argv._.length == 0;
  if (!argv._.includes(name) && !isDefaultTask) {
    return; // This isn't the task being run.
  }
  const validFlags = taskFunc.flags ? Object.keys(taskFunc.flags) : [];
  const usedFlags = Object.keys(argv).slice(1); // Skip the '_' argument
  const invalidFlags = [];
  usedFlags.forEach((flag) => {
    if (!validFlags.includes(flag)) {
      invalidFlags.push(`--${flag}`);
    }
  });
  if (invalidFlags.length > 0) {
    log(
      red('ERROR:'),
      'Found invalid flags for',
      cyan(`gulp ${name}`) + ':',
      cyan(invalidFlags.join(', '))
    );
    log('For detailed usage information, run', cyan('gulp help') + '.');
    if (validFlags.length > 0) {
      log('Valid flags for', cyan(`gulp ${name}`) + ':');
      validFlags.forEach((key) => {
        log(cyan(`\t--${key}`) + `: ${taskFunc.flags[key]}`);
      });
    }
    process.exit(1);
  }
}

/**
 * All the gulp tasks. Keep this list alphabetized.
 */
createTask('a4a', a4a);
createTask('ava', ava);
createTask('babel-plugin-tests', babelPluginTests);
createTask('browse', browse);
createTask('build', build);
createTask('bundle-size', bundleSize);
createTask('caches-json', cachesJson);
createTask('check-exact-versions', checkExactVersions);
createTask('check-links', checkLinks);
createTask('check-owners', checkOwners);
createTask('check-renovate-config', checkRenovateConfig);
createTask('check-sourcemaps', checkSourcemaps);
createTask('check-types', checkTypes);
createTask('cherry-pick', cherryPick);
createTask('clean', clean);
createTask('codecov-upload', codecovUpload);
createTask('compile-jison', compileJison);
createTask('coverage-map', coverageMap);
createTask('create-golden-css', createGoldenCss);
createTask('css', css);
createTask('csvify-size', csvifySize);
createTask('default', defaultTask);
createTask('dep-check', depCheck);
createTask('dev-dashboard-tests', devDashboardTests);
createTask('dist', dist);
createTask('e2e', e2e);
createTask('firebase', firebase);
createTask('get-zindex', getZindex);
createTask('integration', integration);
createTask('lint', lint);
createTask('make-extension', makeExtension);
createTask('performance', performance);
createTask('performance-urls', performanceUrls);
createTask('pr-check', prCheck);
createTask('prepend-global', prependGlobal);
createTask('presubmit', presubmit);
createTask('prettify', prettify);
createTask('process-3p-github-pr', process3pGithubPr);
createTask('release', release);
createTask('test-report-upload', testReportUpload);
createTask('serve', serve);
createTask('server-tests', serverTests);
createTask('size', size);
createTask('storybook-amp', storybookAmp);
createTask('storybook-preact', storybookPreact);
createTask('todos:find-closed', todosFindClosed);
createTask('unit', unit);
createTask('update-packages', updatePackages);
createTask('validator', validator);
createTask('validator-webui', validatorWebui);
createTask('vendor-configs', vendorConfigs);
createTask('visual-diff', visualDiff);
createTask('watch', watch);
