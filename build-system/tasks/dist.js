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
const gulpWatch = require('gulp-watch');
const log = require('fancy-log');
const {
  buildAlp,
  buildExaminer,
  buildExperiments,
  buildWebWorker,
  compileAllMinifiedTargets,
  compileJs,
  endBuildStep,
  hostname,
  mkdirSync,
  printConfigHelp,
  toPromise,
} = require('./helpers');
const {
  buildExtensions,
  extensionAliasFilePath,
  getExtensionsToBuild,
  parseExtensionFlags,
} = require('./extension-helpers');
const {
  closureNailgunPort,
  startNailgunServer,
  stopNailgunServer,
} = require('./nailgun');
const {
  createModuleCompatibleES5Bundle,
} = require('./create-module-compatible-es5-bundle');
const {cleanupBuildDir} = require('../compile/compile');
const {compileCss, cssEntryPoints} = require('./css');
const {createCtrlcHandler, exitCtrlcHandler} = require('../ctrlcHandler');
const {isTravisBuild} = require('../travis');
const {maybeUpdatePackages} = require('./update-packages');

const {green, cyan} = colors;
const argv = require('minimist')(process.argv.slice(2));

/**
 * Dist Build
 * @return {!Promise}
 */
async function dist() {
  maybeUpdatePackages();
  const handlerProcess = createCtrlcHandler('dist');
  process.env.NODE_ENV = 'production';
  cleanupBuildDir();
  if (argv.fortesting) {
    let cmd = 'gulp dist --fortesting';
    if (argv.single_pass) {
      cmd = cmd + ' --single_pass';
    }
    printConfigHelp(cmd);
  }
  if (argv.single_pass) {
    if (!isTravisBuild()) {
      log(
        green('Building all AMP extensions in'),
        cyan('single_pass'),
        green('mode.')
      );
    }
  } else {
    parseExtensionFlags();
  }
  return compileCss(/* watch */ undefined, /* opt_compileAll */ true)
    .then(async () => {
      await startNailgunServer(closureNailgunPort, /* detached */ false);
    })
    .then(() => {
      return Promise.all([
        compileAllMinifiedTargets(),
        // NOTE: When adding a line here,
        // consider whether you need to include polyfills
        // and whether you need to init logging (initLogConstructor).
        buildAlp({minify: true, watch: false}),
        buildExaminer({minify: true, watch: false}),
        buildWebWorker({minify: true, watch: false}),
        buildExtensions({minify: true, watch: false}),
        buildExperiments({minify: true, watch: false}),
        buildLoginDone({minify: true, watch: false}),
        buildWebPushPublisherFiles({minify: true, watch: false}),
        copyCss(),
      ]);
    })
    .then(() => {
      if (isTravisBuild()) {
        // New line after all the compilation progress dots on Travis.
        console.log('\n');
      }
    })
    .then(async () => {
      await stopNailgunServer(closureNailgunPort);
    })
    .then(() => {
      return copyAliasExtensions();
    })
    .then(() => {
      if (argv.esm) {
        return Promise.all([
          createModuleCompatibleES5Bundle('v0.js'),
          createModuleCompatibleES5Bundle('amp4ads-v0.js'),
          createModuleCompatibleES5Bundle('shadow-v0.js'),
        ]);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => exitCtrlcHandler(handlerProcess));
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
    endBuildStep('Copied', 'build/css/*.css to dist/*.css', startTime);
  });
}

/**
 * Copy built extension to alias extension
 * @return {!Promise}
 */
function copyAliasExtensions() {
  if (argv.noextensions) {
    return Promise.resolve();
  }

  const extensionsToBuild = getExtensionsToBuild();

  for (const key in extensionAliasFilePath) {
    if (
      extensionsToBuild.length > 0 &&
      extensionsToBuild.indexOf(extensionAliasFilePath[key]['name']) == -1
    ) {
      continue;
    }
    fs.copySync(
      'dist/v0/' + extensionAliasFilePath[key]['file'],
      'dist/v0/' + key
    );
  }

  return Promise.resolve();
}

/**
 * Build amp-web-push publisher files HTML page.
 *
 * @param {!Object} options
 */
function buildWebPushPublisherFiles(options) {
  return buildWebPushPublisherFilesVersion('0.1', options);
}

/**
 * Build amp-web-push publisher files HTML page.
 *
 * @param {string} version
 * @param {!Object} options
 */
function buildWebPushPublisherFilesVersion(version, options) {
  options = options || {};
  const {watch} = options;
  const fileNames = [
    'amp-web-push-helper-frame',
    'amp-web-push-permission-dialog',
  ];
  const promises = [];

  mkdirSync('dist');
  mkdirSync('dist/v0');

  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    promises.push(buildWebPushPublisherFile(version, fileName, watch, options));
  }

  return Promise.all(promises);
}

/**
 * Build WebPushPublisher file
 *
 * @param {*} version
 * @param {string} fileName
 * @param {string} watch
 * @param {Object} options
 * @return {Promise}
 */
function buildWebPushPublisherFile(version, fileName, watch, options) {
  const basePath = `extensions/amp-web-push/${version}/`;
  const tempBuildDir = `build/all/amp-web-push-${version}/`;
  const distDir = 'dist/v0';

  // Build Helper Frame JS
  const js = fs.readFileSync(basePath + fileName + '.js', 'utf8');
  const builtName = fileName + '.js';
  const minifiedName = fileName + '.js';
  return toPromise(
    gulp
      .src(basePath + '/*.js', {base: '.'})
      .pipe(file(builtName, js))
      .pipe(gulp.dest(tempBuildDir))
  )
    .then(function() {
      return compileJs('./' + tempBuildDir, builtName, './' + distDir, {
        watch,
        includePolyfills: true,
        minify: options.minify || argv.minify,
        minifiedName,
        extraGlobs: [tempBuildDir + '*.js'],
      });
    })
    .then(function() {
      if (fs.existsSync(distDir + '/' + minifiedName)) {
        // Build Helper Frame HTML
        let fileContents = fs.readFileSync(
          basePath + fileName + '.html',
          'utf8'
        );
        fileContents = fileContents.replace(
          '<!-- [GULP-MAGIC-REPLACE ' + fileName + '.js] -->',
          '<script>' +
            fs.readFileSync(distDir + '/' + minifiedName, 'utf8') +
            '</script>'
        );

        fs.writeFileSync('dist/v0/' + fileName + '.html', fileContents);
      }
    });
}

/**
 * Build "Login Done" page.
 *
 * @param {!Object} options
 */
async function buildLoginDone(options) {
  return buildLoginDoneVersion('0.1', options);
}

/**
 * Build "Login Done" page for the specified version.
 *
 * @param {string} version
 * @param {!Object} options
 */
async function buildLoginDoneVersion(version, options) {
  options = options || {};
  const path = `extensions/amp-access/${version}/`;
  const buildDir = `build/all/amp-access-${version}/`;
  const htmlPath = path + 'amp-login-done.html';
  const jsPath = path + 'amp-login-done.js';
  let {watch} = options;
  if (watch === undefined) {
    watch = argv.watch || argv.w;
  }

  // Building extensions is a 2 step process because of the renaming
  // and CSS inlining. This watcher watches the original file, copies
  // it to the destination and adds the CSS.
  if (watch) {
    // Do not set watchers again when we get called by the watcher.
    const copy = Object.create(options);
    copy.watch = false;
    gulpWatch(path + '/*', function() {
      buildLoginDoneVersion(version, copy);
    });
  }

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
  const minifiedName = 'amp-login-done-' + version + '.js';
  const latestName = 'amp-login-done-latest.js';
  return toPromise(
    gulp
      .src(path + '/*.js', {base: path})
      .pipe(file(builtName, js))
      .pipe(gulp.dest(buildDir))
  ).then(function() {
    return compileJs('./' + buildDir, builtName, './dist/v0/', {
      watch: false,
      includePolyfills: true,
      minify: options.minify || argv.minify,
      minifiedName,
      latestName,
      extraGlobs: [
        buildDir + 'amp-login-done-0.1.max.js',
        buildDir + 'amp-login-done-dialog.js',
      ],
    });
  });
}

module.exports = {
  buildExperiments,
  buildLoginDone,
  dist,
};

/* eslint "google-camelcase/google-camelcase": 0 */

buildExperiments.description = 'Builds experiments.html/js';
buildLoginDone.description = 'Builds login-done.html/js';
dist.description = 'Build production binaries';
dist.flags = {
  pseudo_names:
    '  Compiles with readable names. ' +
    'Great for profiling and debugging production code.',
  fortesting: '  Compiles production binaries for local testing',
  config: '  Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  single_pass: "Compile AMP's primary JS bundles in a single invocation",
  extensions: '  Builds only the listed extensions.',
  extensions_from: '  Builds only the extensions from the listed AMP(s).',
  noextensions: '  Builds with no extensions.',
  single_pass_dest:
    '  The directory closure compiler will write out to ' +
    'with --single_pass mode. The default directory is `dist`',
  full_sourcemaps: '  Includes source code content in sourcemaps',
};
