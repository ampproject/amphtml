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

const colors = require('ansi-colors');
const file = require('gulp-file');
const fs = require('fs-extra');
const gulp = require('gulp');
const log = require('fancy-log');
const {
  bootstrapThirdPartyFrames,
  compileAllJs,
  compileCoreRuntime,
  compileJs,
  endBuildStep,
  maybeToEsmName,
  mkdirSync,
  printConfigHelp,
  printNobuildHelp,
  toPromise,
} = require('./helpers');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../common/ctrlcHandler');
const {
  displayLifecycleDebugging,
} = require('../compile/debug-compilation-lifecycle');
const {buildExtensions, parseExtensionFlags} = require('./extension-helpers');
const {cleanupBuildDir} = require('../compile/compile');
const {compileCss, cssEntryPoints} = require('./css');
const {compileJison} = require('./compile-jison');
const {formatExtractedMessages} = require('../compile/log-messages');
const {maybeUpdatePackages} = require('./update-packages');
const {VERSION} = require('../compile/internal-version');

const {green, cyan} = colors;
const argv = require('minimist')(process.argv.slice(2));

/**
 * Files that must be built for amp-web-push
 */
const WEB_PUSH_PUBLISHER_FILES = [
  'amp-web-push-helper-frame',
  'amp-web-push-permission-dialog',
];

/**
 * Versions that must be built for amp-web-push
 */
const WEB_PUSH_PUBLISHER_VERSIONS = ['0.1'];

/**
 * Used while building the experiments page.
 */
const hostname = argv.hostname || 'cdn.ampproject.org';

/**
 * Prints a useful help message prior to the gulp dist task
 *
 * @param {!Object} options
 */
function printDistHelp(options) {
  if (argv.sanitize_vars_for_diff && !argv.pseudo_names) {
    throw new Error('--sanitize_vars_for_diff requires --pseudo_names');
  }

  let cmd = 'gulp dist';
  if (options.fortesting) {
    cmd = cmd + ' --fortesting';
  }
  printConfigHelp(cmd);
  parseExtensionFlags();
  if (argv.define_experiment_constant) {
    log(
      green('Enabling the'),
      cyan(argv.define_experiment_constant),
      green('experiment.')
    );
  }
}

/**
 * Perform the prerequisite steps before starting the minified build.
 * Used by `gulp` and `gulp dist`.
 *
 * @param {!Object} options
 */
async function runPreDistSteps(options) {
  cleanupBuildDir();
  await prebuild();
  await compileCss(options);
  await compileJison();
  await copyCss();
  await copyParsers();
  await bootstrapThirdPartyFrames(options);
  displayLifecycleDebugging();
}

/**
 * Minified build. Entry point for `gulp dist`.
 */
async function dist() {
  await doDist();
}

/**
 * Performs a minified build with the given extra args.
 *
 * @param {Object=} extraArgs
 */
async function doDist(extraArgs = {}) {
  maybeUpdatePackages();
  const handlerProcess = createCtrlcHandler('dist');
  process.env.NODE_ENV = 'production';
  const options = {
    fortesting: extraArgs.fortesting || argv.fortesting,
    minify: true,
    watch: argv.watch,
  };
  printNobuildHelp();
  printDistHelp(options);
  await runPreDistSteps(options);

  // Steps that use closure compiler. Small ones before large (parallel) ones.
  if (argv.core_runtime_only) {
    await compileCoreRuntime(options);
  } else {
    await buildExperiments();
    await buildLoginDone('0.1');
    await buildWebPushPublisherFiles();
    await compileAllJs(options);
    await buildExtensions(options);
  }

  if (!argv.core_runtime_only) {
    await formatExtractedMessages();
  }
  if (!argv.watch) {
    exitCtrlcHandler(handlerProcess);
  }
}

/**
 * Build AMP experiments.js.
 *
 * @return {!Promise}
 */
function buildExperiments() {
  return compileJs(
    './build/experiments/',
    'experiments.max.js',
    './dist.tools/experiments/',
    {
      watch: argv.watch,
      minify: true,
      includePolyfills: true,
      minifiedName: maybeToEsmName('experiments.js'),
      esmPassCompilation: argv.esm || argv.sxg || false,
    }
  );
}

/**
 * Build amp-login-done-${version}.js file.
 *
 * @param {string} version
 * @return {!Promise}
 */
function buildLoginDone(version) {
  const buildDir = `build/all/amp-access-${version}/`;
  const builtName = `amp-login-done-${version}.max.js`;
  const minifiedName = `amp-login-done-${version}.js`;
  const latestName = 'amp-login-done-latest.js';
  return compileJs('./' + buildDir, builtName, './dist/v0/', {
    watch: argv.watch,
    includePolyfills: true,
    minify: true,
    minifiedName,
    latestName,
    esmPassCompilation: argv.esm || argv.sxg || false,
    extraGlobs: [
      buildDir + 'amp-login-done-0.1.max.js',
      buildDir + 'amp-login-done-dialog.js',
    ],
  });
}

/**
 * Build amp-web-push publisher files HTML page.
 */
async function buildWebPushPublisherFiles() {
  const distDir = 'dist/v0';
  const promises = [];
  WEB_PUSH_PUBLISHER_VERSIONS.forEach((version) => {
    WEB_PUSH_PUBLISHER_FILES.forEach((fileName) => {
      const tempBuildDir = `build/all/amp-web-push-${version}/`;
      const builtName = fileName + '.js';
      const minifiedName = maybeToEsmName(fileName + '.js');
      const p = compileJs('./' + tempBuildDir, builtName, './' + distDir, {
        watch: argv.watch,
        includePolyfills: true,
        minify: true,
        esmPassCompilation: argv.esm || argv.sxg || false,
        minifiedName,
        extraGlobs: [tempBuildDir + '*.js'],
      });
      promises.push(p);
    });
  });
  await Promise.all(promises);
  await postBuildWebPushPublisherFilesVersion();
}

async function prebuild() {
  await preBuildExperiments();
  await preBuildLoginDone();
  await preBuildWebPushPublisherFiles();
}

/**
 * Copies the css from the build folder to the dist folder
 * @return {!Promise}
 */
function copyCss() {
  const startTime = Date.now();

  cssEntryPoints.forEach(({outCss}) => {
    fs.copySync(`build/css/${outCss}`, `dist/${outCss}`);
  });

  return toPromise(
    gulp
      .src('build/css/amp-*.css', {base: 'build/css/'})
      .pipe(gulp.dest('dist/v0'))
  ).then(() => {
    endBuildStep('Copied', 'build/css/*.css to dist/v0/*.css', startTime);
  });
}

/**
 * Copies parsers from the build folder to the dist folder
 * @return {!Promise}
 */
function copyParsers() {
  const startTime = Date.now();
  return fs.copy('build/parsers', 'dist/v0').then(() => {
    endBuildStep('Copied', 'build/parsers/ to dist/v0', startTime);
  });
}

/**
 * Build amp-web-push publisher files HTML page.
 *
 * @return {!Promise<!Array>}
 */
async function preBuildWebPushPublisherFiles() {
  mkdirSync('dist');
  mkdirSync('dist/v0');
  const promises = [];

  WEB_PUSH_PUBLISHER_VERSIONS.forEach((version) => {
    WEB_PUSH_PUBLISHER_FILES.forEach((fileName) => {
      const basePath = `extensions/amp-web-push/${version}/`;
      const tempBuildDir = `build/all/amp-web-push-${version}/`;

      // Build Helper Frame JS
      const js = fs.readFileSync(basePath + fileName + '.js', 'utf8');
      const builtName = fileName + '.js';
      const promise = toPromise(
        gulp
          .src(basePath + '/*.js', {base: basePath})
          .pipe(file(builtName, js))
          .pipe(gulp.dest(tempBuildDir))
      );
      promises.push(promise);
    });
  });
  return Promise.all(promises);
}

/**
 * post Build amp-web-push publisher files HTML page.
 */
function postBuildWebPushPublisherFilesVersion() {
  const distDir = 'dist/v0';
  WEB_PUSH_PUBLISHER_VERSIONS.forEach((version) => {
    const basePath = `extensions/amp-web-push/${version}/`;
    WEB_PUSH_PUBLISHER_FILES.forEach((fileName) => {
      const minifiedName = maybeToEsmName(fileName + '.js');
      if (!fs.existsSync(distDir + '/' + minifiedName)) {
        throw new Error(`Cannot find ${distDir}/${minifiedName}`);
      }

      // Build Helper Frame HTML
      let fileContents = fs.readFileSync(basePath + fileName + '.html', 'utf8');
      fileContents = fileContents.replace(
        '<!-- [GULP-MAGIC-REPLACE ' + fileName + '.js] -->',
        '<script>' +
          fs.readFileSync(distDir + '/' + minifiedName, 'utf8') +
          '</script>'
      );

      fs.writeFileSync('dist/v0/' + fileName + '.html', fileContents);
    });
  });
}

/**
 * Precompilation steps required to build experiment js binaries.
 * @return {!Promise}
 */
async function preBuildExperiments() {
  const path = 'tools/experiments';
  const htmlPath = path + '/experiments.html';
  const jsPath = path + '/experiments.js';

  // Build HTML.
  const html = fs.readFileSync(htmlPath, 'utf8');
  const minHtml = html
    .replace(
      '/dist.tools/experiments/experiments.js',
      `https://${hostname}/v0/experiments.js`
    )
    .replace(/\$internalRuntimeVersion\$/g, VERSION);

  await toPromise(
    gulp
      .src(htmlPath)
      .pipe(file('experiments.cdn.html', minHtml))
      .pipe(gulp.dest('dist.tools/experiments/'))
  );

  // Build JS.
  const js = fs.readFileSync(jsPath, 'utf8');
  const builtName = 'experiments.max.js';
  return toPromise(
    gulp
      .src(path + '/*.js')
      .pipe(file(builtName, js))
      .pipe(gulp.dest('build/experiments/'))
  );
}

/**
 * Build "Login Done" page.
 * @return {!Promise}
 */
function preBuildLoginDone() {
  return preBuildLoginDoneVersion('0.1');
}

/**
 * Build "Login Done" page for the specified version.
 *
 * @param {string} version
 * @return {!Promise}
 */
function preBuildLoginDoneVersion(version) {
  const path = `extensions/amp-access/${version}/`;
  const buildDir = `build/all/amp-access-${version}/`;
  const htmlPath = path + 'amp-login-done.html';
  const jsPath = path + 'amp-login-done.js';

  // Build HTML.
  const html = fs.readFileSync(htmlPath, 'utf8');
  const minJs = `https://${hostname}/v0/amp-login-done-${version}.js`;
  const minHtml = html
    .replace(`../../../dist/v0/amp-login-done-${version}.max.js`, minJs)
    .replace(`../../../dist/v0/amp-login-done-${version}.js`, minJs);
  if (minHtml.indexOf(minJs) == -1) {
    throw new Error('Failed to correctly set JS in login-done.html');
  }

  mkdirSync('dist');
  mkdirSync('dist/v0');

  fs.writeFileSync('dist/v0/amp-login-done-' + version + '.html', minHtml);

  // Build JS.
  const js = fs.readFileSync(jsPath, 'utf8');
  const builtName = 'amp-login-done-' + version + '.max.js';
  return toPromise(
    gulp
      .src(path + '/*.js', {base: path})
      .pipe(file(builtName, js))
      .pipe(gulp.dest(buildDir))
  );
}

module.exports = {
  dist,
  doDist,
  runPreDistSteps,
};

/* eslint "google-camelcase/google-camelcase": 0 */

dist.description =
  'Compiles AMP production binaries and applies AMP_CONFIG to runtime files';
dist.flags = {
  pseudo_names:
    '  Compiles with readable names. ' +
    'Great for profiling and debugging production code.',
  pretty_print:
    '  Outputs compiled code with whitespace. ' +
    'Great for debugging production code.',
  fortesting: '  Compiles production binaries for local testing',
  noconfig: '  Compiles production binaries without applying AMP_CONFIG',
  config: '  Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  coverage: '  Instruments compiled code for collecting coverage information',
  extensions: '  Builds only the listed extensions.',
  extensions_from: '  Builds only the extensions from the listed AMP(s).',
  noextensions: '  Builds with no extensions.',
  core_runtime_only: '  Builds only the core runtime.',
  full_sourcemaps: '  Includes source code content in sourcemaps',
  sourcemap_url: '  Sets a custom sourcemap URL with placeholder {version}',
  type: '  Points sourcemap to fetch files from the correct GitHub tag',
  esm: '  Does not transpile down to ES5',
  version_override: '  Override the version written to AMP_CONFIG',
  watch: '  Watches for changes in files, re-compiles when detected',
  closure_concurrency: '  Sets the number of concurrent invocations of closure',
  debug: '  Outputs the file contents during compilation lifecycles',
  define_experiment_constant:
    '  Builds runtime with the EXPERIMENT constant set to true',
  sanitize_vars_for_diff:
    '  Sanitize the output to diff build results. Requires --pseudo_names',
  sxg: '  Outputs the compiled code for the SxG build',
};
