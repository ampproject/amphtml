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
  process3pGithubPr,
} = require('./build-system/tasks/process-3p-github-pr');
const {
  processGithubIssues,
} = require('./build-system/tasks/process-github-issues');
const {a4a} = require('./build-system/tasks/a4a');
const {ava} = require('./build-system/tasks/ava');
const {babelPluginTests} = require('./build-system/tasks/babel-plugin-tests');
const {build, defaultTask, watch} = require('./build-system/tasks/build');
const {bundleSize} = require('./build-system/tasks/bundle-size');
const {cachesJson} = require('./build-system/tasks/caches-json');
const {checkLinks} = require('./build-system/tasks/check-links');
const {checkOwners} = require('./build-system/tasks/check-owners');
const {checkTypes} = require('./build-system/tasks/check-types');
const {clean} = require('./build-system/tasks/clean');
const {codecovUpload} = require('./build-system/tasks/codecov-upload');
const {compileJison} = require('./build-system/tasks/compile-jison');
const {createGoldenCss} = require('./build-system/tasks/create-golden-css');
const {css} = require('./build-system/tasks/css');
const {csvifySize} = require('./build-system/tasks/csvify-size');
const {depCheck} = require('./build-system/tasks/dep-check');
const {devDashboardTests} = require('./build-system/tasks/dev-dashboard-tests');
const {dist} = require('./build-system/tasks/dist');
const {e2e} = require('./build-system/tasks/e2e');
const {firebase} = require('./build-system/tasks/firebase');
const {getZindex} = require('./build-system/tasks/get-zindex');
const {integration} = require('./build-system/tasks/integration');
const {lint} = require('./build-system/tasks/lint');
const {makeExtension} = require('./build-system/tasks/extension-generator');
const {nailgunStart, nailgunStop} = require('./build-system/tasks/nailgun');
const {performance} = require('./build-system/tasks/performance');
const {prCheck} = require('./build-system/tasks/pr-check');
const {prependGlobal} = require('./build-system/tasks/prepend-global');
const {presubmit} = require('./build-system/tasks/presubmit-checks');
const {prettify} = require('./build-system/tasks/prettify');
const {serverTests} = require('./build-system/tasks/server-tests');
const {serve} = require('./build-system/tasks/serve.js');
const {size} = require('./build-system/tasks/size');
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
  if (!argv._.includes(name)) {
    return; // This isn't the task being run.
  }
  const validFlags = taskFunc.flags ? Object.keys(taskFunc.flags) : [];
  const usedFlags = Object.keys(argv).slice(1); // Skip the '_' argument
  const invalidFlags = [];
  usedFlags.forEach(flag => {
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
      validFlags.forEach(key => {
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
createTask('build', build);
createTask('bundle-size', bundleSize);
createTask('caches-json', cachesJson);
createTask('check-exact-versions', checkExactVersions);
createTask('check-links', checkLinks);
createTask('check-owners', checkOwners);
createTask('check-types', checkTypes);
createTask('clean', clean);
createTask('codecov-upload', codecovUpload);
createTask('compile-jison', compileJison);
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
createTask('nailgun-start', nailgunStart);
createTask('nailgun-stop', nailgunStop);
createTask('performance', performance);
createTask('pr-check', prCheck);
createTask('prepend-global', prependGlobal);
createTask('presubmit', presubmit);
createTask('prettify', prettify);
createTask('process-3p-github-pr', process3pGithubPr);
createTask('process-github-issues', processGithubIssues);
createTask('serve', serve);
createTask('server-tests', serverTests);
createTask('size', size);
createTask('todos:find-closed', todosFindClosed);
createTask('unit', unit);
createTask('update-packages', updatePackages);
createTask('validator', validator);
createTask('validator-webui', validatorWebui);
createTask('vendor-configs', vendorConfigs);
createTask('visual-diff', visualDiff);
createTask('watch', watch);
