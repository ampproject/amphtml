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
const conf = require('../build.conf');
const file = require('gulp-file');
const fs = require('fs-extra');
const gulp = require('gulp');
const log = require('fancy-log');
const {
  buildExtensions,
  extensionAliasFilePath,
  getExtensionsToBuild,
  parseExtensionFlags,
} = require('./extension-helpers');
const {
  createModuleCompatibleES5Bundle,
} = require('./create-module-compatible-es5-bundle');
const {
  distNailgunPort,
  startNailgunServer,
  stopNailgunServer,
} = require('./nailgun');
const {
  WEB_PUSH_PUBLISHER_FILES,
  WEB_PUSH_PUBLISHER_VERSIONS,
  buildAlp,
  buildExaminer,
  buildWebWorker,
  compileJs,
  compileAllMinifiedTargets,
  endBuildStep,
  hostname,
  mkdirSync,
  printConfigHelp,
  printNobuildHelp,
  toPromise,
} = require('./helpers');
const {BABEL_SRC_GLOBS, SRC_TEMP_DIR} = require('../sources');
const {cleanupBuildDir} = require('../compile/compile');
const {compileCss, cssEntryPoints} = require('./css');
const {createCtrlcHandler, exitCtrlcHandler} = require('../ctrlcHandler');
const {formatExtractedMessages} = require('../compile/log-messages');
const {isTravisBuild} = require('../travis');
const {maybeUpdatePackages} = require('./update-packages');

const {green, cyan} = colors;
const argv = require('minimist')(process.argv.slice(2));

const babel = require('@babel/core');
const deglob = require('globs-to-files');

function transferSrcsToTempDir() {
  log(
    'Performing multi-pass',
    colors.cyan('babel'),
    'transforms in',
    colors.cyan(SRC_TEMP_DIR)
  );
  const files = deglob.sync(BABEL_SRC_GLOBS);
  files.forEach(file => {
    if (file.startsWith('node_modules/') || file.startsWith('third_party/')) {
      fs.copySync(file, `${SRC_TEMP_DIR}/${file}`);
      return;
    }

    const {code} = babel.transformFileSync(file, {
      plugins: conf.plugins({
        isEsmBuild: argv.esm,
        isForTesting: argv.fortesting,
      }),
      retainLines: true,
      compact: false,
    });
    const name = `${SRC_TEMP_DIR}${file.replace(process.cwd(), '')}`;
    fs.outputFileSync(name, code);
    process.stdout.write('.');
  });
  console.log('\n');
}

/**
 * Dist Build
 * @return {!Promise}
 */
async function dist() {
  maybeUpdatePackages();
  const handlerProcess = createCtrlcHandler('dist');
  process.env.NODE_ENV = 'production';
  printNobuildHelp();
  cleanupBuildDir();

  await prebuild();

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
  await compileCss(/* watch */ undefined, /* opt_compileAll */ true);
  await startNailgunServer(distNailgunPort, /* detached */ false);

  // Single pass has its own tmp directory processing. Only do this for
  // multipass.
  // We need to execute this after `compileCss` so that we can copy that
  // over to the tmp directory.
  if (!argv.single_pass) {
    transferSrcsToTempDir();
  }

  await Promise.all([
    compileAllMinifiedTargets(),
    // NOTE: When adding a line here,
    // consider whether you need to include polyfills
    // and whether you need to init logging (initLogConstructor).
    buildAlp({minify: true, watch: false}),
    buildExaminer({minify: true, watch: false}),
    buildWebWorker({minify: true, watch: false}),
    buildExtensions({minify: true, watch: false}),
    buildExperiments({minify: true, watch: false}),
    buildLoginDone('0.1', {minify: true, watch: false}),
    buildWebPushPublisherFiles({minify: true, watch: false}).then(
      postBuildWebPushPublisherFilesVersion
    ),
    copyCss(),
  ]);

  if (isTravisBuild()) {
    // New line after all the compilation progress dots on Travis.
    console.log('\n');
  }

  await stopNailgunServer(distNailgunPort);
  await copyAliasExtensions();
  await formatExtractedMessages();

  if (argv.esm) {
    await Promise.all([
      createModuleCompatibleES5Bundle('v0.js'),
      createModuleCompatibleES5Bundle('amp4ads-v0.js'),
      createModuleCompatibleES5Bundle('shadow-v0.js'),
    ]);
  }

  return exitCtrlcHandler(handlerProcess);
}

/**
 * Build AMP experiments.js.
 *
 * @param {!Object} options
 * @return {*} TODO(#23582): Specify return type
 */
function buildExperiments(options) {
  return compileJs(
    './build/experiments/',
    'experiments.max.js',
    './dist.tools/experiments/',
    {
      watch: false,
      minify: options.minify || argv.minify,
      includePolyfills: true,
      minifiedName: 'experiments.js',
    }
  );
}

/**
 * Build amp-login-done-${version}.js file.
 *
 * @param {string} version
 * @param {!Object} options
 * @return {*} TODO(#23582): Specify return type
 */
function buildLoginDone(version, options) {
  const buildDir = `build/all/amp-access-${version}/`;
  const builtName = `amp-login-done-${version}.max.js`;
  const minifiedName = `amp-login-done-${version}.js`;
  const latestName = 'amp-login-done-latest.js';
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
}

/**
 * Build amp-web-push publisher files HTML page.
 *
 * @param {!Object} options
 * @return {*} TODO(#23582): Specify return type
 */
function buildWebPushPublisherFiles(options) {
  const distDir = 'dist/v0';
  const promises = [];
  WEB_PUSH_PUBLISHER_VERSIONS.forEach(version => {
    WEB_PUSH_PUBLISHER_FILES.forEach(fileName => {
      const tempBuildDir = `build/all/amp-web-push-${version}/`;
      const builtName = fileName + '.js';
      const minifiedName = fileName + '.js';
      const p = compileJs('./' + tempBuildDir, builtName, './' + distDir, {
        watch: options.watch,
        includePolyfills: true,
        minify: options.minify || argv.minify,
        minifiedName,
        extraGlobs: [tempBuildDir + '*.js'],
      });
      promises.push(p);
    });
  });
  return Promise.all(promises);
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
 * @return {!Promise<!Array>}
 */
async function preBuildWebPushPublisherFiles() {
  mkdirSync('dist');
  mkdirSync('dist/v0');
  const promises = [];

  WEB_PUSH_PUBLISHER_VERSIONS.forEach(version => {
    WEB_PUSH_PUBLISHER_FILES.forEach(fileName => {
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
  WEB_PUSH_PUBLISHER_VERSIONS.forEach(version => {
    const basePath = `extensions/amp-web-push/${version}/`;
    WEB_PUSH_PUBLISHER_FILES.forEach(fileName => {
      const minifiedName = fileName + '.js';
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
 * @return {*} TODO(#23582): Specify return type
 */
async function preBuildExperiments() {
  const path = 'tools/experiments';
  const htmlPath = path + '/experiments.html';
  const jsPath = path + '/experiments.js';

  // Build HTML.
  const html = fs.readFileSync(htmlPath, 'utf8');
  const minHtml = html.replace(
    '/dist.tools/experiments/experiments.js',
    `https://${hostname}/v0/experiments.js`
  );

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
};

/* eslint "google-camelcase/google-camelcase": 0 */

dist.description = 'Build production binaries';
dist.flags = {
  pseudo_names:
    '  Compiles with readable names. ' +
    'Great for profiling and debugging production code.',
  pretty_print:
    '  Outputs compiled code with whitespace. ' +
    'Great for debugging production code.',
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
