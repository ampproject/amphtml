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

/* global require */

const gulp = require('gulp-help')(require('gulp'));
const {
  checkExactVersions,
} = require('./build-system/tasks/check-exact-versions');
const {
  compileAccessExpr,
  compileBindExpr,
  compileCssExpr,
} = require('./build-system/tasks/compile-expr');
const {
  generateVendorJsons,
} = require('./build-system/tasks/generate-vendor-jsons');
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
const {cachesJson, jsonSyntax} = require('./build-system/tasks/json-check');
const {changelog, changelogUpdate} = require('./build-system/tasks/changelog');
const {checkLinks} = require('./build-system/tasks/check-links');
const {checkTypes} = require('./build-system/tasks/check-types');
const {clean} = require('./build-system/tasks/clean');
const {codecovUpload} = require('./build-system/tasks/codecov-upload');
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
const {prCheck} = require('./build-system/tasks/pr-check');
const {prependGlobal} = require('./build-system/tasks/prepend-global');
const {presubmit} = require('./build-system/tasks/presubmit-checks');
const {releaseTag} = require('./build-system/tasks/release-tagging');
const {serve} = require('./build-system/tasks/serve.js');
const {size} = require('./build-system/tasks/size');
const {test} = require('./build-system/tasks/runtime-test');
const {todosFindClosed} = require('./build-system/tasks/todos');
const {unit} = require('./build-system/tasks/unit');
const {updatePackages} = require('./build-system/tasks/update-packages');
const {validator, validatorWebui} = require('./build-system/tasks/validator');
const {vendorConfigs} = require('./build-system/tasks/vendor-configs');
const {visualDiff} = require('./build-system/tasks/visual-diff');

// Keep this list alphabetized.
gulp.task('a4a', a4a);
gulp.task('ava', ava);
gulp.task('babel-plugin-tests', babelPluginTests);
gulp.task('build', build);
gulp.task('bundle-size', bundleSize);
gulp.task('caches-json', cachesJson);
gulp.task('changelog', changelog);
gulp.task('changelog:update', changelogUpdate);
gulp.task('check-exact-versions', checkExactVersions);
gulp.task('check-links', checkLinks);
gulp.task('check-types', checkTypes);
gulp.task('clean', clean);
gulp.task('codecov-upload', codecovUpload);
gulp.task('compile-access-expr', compileAccessExpr);
gulp.task('compile-bind-expr', compileBindExpr);
gulp.task('compile-css-expr', compileCssExpr);
gulp.task('create-golden-css', createGoldenCss);
gulp.task('css', css);
gulp.task('csvify-size', csvifySize);
gulp.task('default', defaultTask);
gulp.task('dep-check', depCheck);
gulp.task('dev-dashboard-tests', devDashboardTests);
gulp.task('dist', dist);
gulp.task('e2e', e2e);
gulp.task('firebase', firebase);
gulp.task('generate-vendor-jsons', generateVendorJsons);
gulp.task('get-zindex', getZindex);
gulp.task('integration', integration);
gulp.task('json-syntax', jsonSyntax);
gulp.task('lint', lint);
gulp.task('make-extension', makeExtension);
gulp.task('nailgun-start', nailgunStart);
gulp.task('nailgun-stop', nailgunStop);
gulp.task('pr-check', prCheck);
gulp.task('prepend-global', prependGlobal);
gulp.task('presubmit', presubmit);
gulp.task('process-3p-github-pr', process3pGithubPr);
gulp.task('process-github-issues', processGithubIssues);
gulp.task('release:tag', releaseTag);
gulp.task('serve', serve);
gulp.task('size', size);
gulp.task('test', test);
gulp.task('todos:find-closed', todosFindClosed);
gulp.task('unit', unit);
gulp.task('update-packages', updatePackages);
gulp.task('validator', validator);
gulp.task('validator-webui', validatorWebui);
gulp.task('vendor-configs', vendorConfigs);
gulp.task('visual-diff', visualDiff);
gulp.task('watch', watch);
