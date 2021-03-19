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

const colors = require('kleur/colors');
const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');
const {
  bootstrapThirdPartyFrames,
  compileAllJs,
  compileCoreRuntime,
  compileJs,
  endBuildStep,
  maybeToEsmName,
  printConfigHelp,
  printNobuildHelp,
} = require('./helpers');
const {
  cleanupBuildDir,
  printClosureConcurrency,
} = require('../compile/compile');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../common/ctrlcHandler');
const {
  displayLifecycleDebugging,
} = require('../compile/debug-compilation-lifecycle');
const {buildExtensions, parseExtensionFlags} = require('./extension-helpers');
const {buildVendorConfigs} = require('./3p-vendor-helpers');
const {compileCss, copyCss} = require('./css');
const {compileJison} = require('./compile-jison');
const {formatExtractedMessages} = require('../compile/log-messages');
const {log} = require('../common/logging');
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
 * Prints a useful help message prior to the amp dist task
 *
 * @param {!Object} options
 */
function printDistHelp(options) {
  if (argv.sanitize_vars_for_diff && !argv.pseudo_names) {
    throw new Error('--sanitize_vars_for_diff requires --pseudo_names');
  }

  let cmd = 'amp dist';
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
 * Used by `amp` and `amp dist`.
 *
 * @param {!Object} options
 */
async function runPreDistSteps(options) {
  cleanupBuildDir();
  await prebuild();
  await compileCss(options);
  await copyCss();
  await compileJison();
  await copyParsers();
  await bootstrapThirdPartyFrames(options);
  displayLifecycleDebugging();
}

/**
 * Minified build. Entry point for `amp dist`.
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
  const handlerProcess = createCtrlcHandler('dist');
  process.env.NODE_ENV = 'production';
  const options = {
    fortesting: extraArgs.fortesting || argv.fortesting,
    minify: true,
    watch: argv.watch,
  };
  printClosureConcurrency();
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
  }
  await buildExtensions(options);

  if (!argv.core_runtime_only) {
    await buildVendorConfigs(options);
    await formatExtractedMessages();
  }
  if (!argv.watch) {
    exitCtrlcHandler(handlerProcess);
  }
}

/**
 * Build AMP experiments.js.
 */
async function buildExperiments() {
  await compileJs(
    './build/experiments/',
    'experiments.max.js',
    './dist.tools/experiments/',
    {
      watch: argv.watch,
      minify: true,
      includePolyfills: true,
      minifiedName: maybeToEsmName('experiments.js'),
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
  const buildDir = `build/all/amp-access-${version}`;
  const builtName = `amp-login-done-${version}.max.js`;
  const minifiedName = `amp-login-done-${version}.js`;
  const latestName = 'amp-login-done-latest.js';
  return compileJs(`./${buildDir}`, builtName, './dist/v0/', {
    watch: argv.watch,
    includePolyfills: true,
    minify: true,
    minifiedName,
    latestName,
    extraGlobs: [
      `${buildDir}/amp-login-done-0.1.max.js`,
      `${buildDir}/amp-login-done-dialog.js`,
    ],
  });
}

/**
 * Build amp-web-push publisher files HTML page.
 */
async function buildWebPushPublisherFiles() {
  const distDir = 'dist/v0';
  for (const version of WEB_PUSH_PUBLISHER_VERSIONS) {
    for (const fileName of WEB_PUSH_PUBLISHER_FILES) {
      const tempBuildDir = `build/all/amp-web-push-${version}`;
      const builtName = `${fileName}.js`;
      const minifiedName = maybeToEsmName(builtName);
      await compileJs(`./${tempBuildDir}`, builtName, `./${distDir}`, {
        watch: argv.watch,
        includePolyfills: true,
        minify: true,
        minifiedName,
        extraGlobs: [`${tempBuildDir}/*.js`],
      });
    }
  }
  await postBuildWebPushPublisherFilesVersion();
}

/**
 * @return {Promise<void>}
 */
async function prebuild() {
  await preBuildExperiments();
  await preBuildLoginDone();
  await preBuildWebPushPublisherFiles();
}

/**
 * Copies parsers from the build folder to the dist folder
 */
async function copyParsers() {
  const startTime = Date.now();
  await fs.copy('build/parsers', 'dist/v0');
  endBuildStep('Copied', 'build/parsers/ to dist/v0', startTime);
}

/**
 * Build amp-web-push publisher files HTML page.
 */
async function preBuildWebPushPublisherFiles() {
  for (const version of WEB_PUSH_PUBLISHER_VERSIONS) {
    for (const fileName of WEB_PUSH_PUBLISHER_FILES) {
      const srcPath = `extensions/amp-web-push/${version}`;
      const destPath = `build/all/amp-web-push-${version}`;

      // Build Helper Frame JS
      const js = await fs.readFile(`${srcPath}/${fileName}.js`, 'utf8');
      const builtName = `${fileName}.js`;
      await fs.outputFile(`${destPath}/${builtName}`, js);
      const jsFiles = globby.sync(`${srcPath}/*.js`);
      await Promise.all(
        jsFiles.map((jsFile) => {
          return fs.copy(jsFile, `${destPath}/${path.basename(jsFile)}`);
        })
      );
    }
  }
}

/**
 * post Build amp-web-push publisher files HTML page.
 */
async function postBuildWebPushPublisherFilesVersion() {
  const distDir = 'dist/v0';
  for (const version of WEB_PUSH_PUBLISHER_VERSIONS) {
    const basePath = `extensions/amp-web-push/${version}`;
    for (const fileName of WEB_PUSH_PUBLISHER_FILES) {
      const minifiedName = maybeToEsmName(`${fileName}.js`);
      const minifiedFile = `${distDir}/${minifiedName}`;
      if (!fs.existsSync(minifiedFile)) {
        throw new Error(`Cannot find ${minifiedFile}`);
      }

      // Build Helper Frame HTML
      const html = await fs.readFile(`${basePath}/${fileName}.html`, 'utf8');
      const js = await fs.readFile(minifiedFile, 'utf8');
      const minifiedHtml = html.replace(
        `<!-- [REPLACE-SENTINEL ${fileName}.js] -->`,
        `<script>${js}</script>`
      );
      await fs.outputFile(`dist/v0/${fileName}.html`, minifiedHtml);
    }
  }
}

/**
 * Precompilation steps required to build experiment js binaries.
 */
async function preBuildExperiments() {
  const expDir = 'tools/experiments';
  const htmlDestDir = 'dist.tools/experiments';
  const htmlSrcPath = `${expDir}/experiments.html`;
  const jsSrcPath = `${expDir}/experiments.js`;

  // Build HTML.
  const html = await fs.readFile(htmlSrcPath, 'utf8');
  const minHtml = html
    .replace(
      '/dist.tools/experiments/experiments.js',
      `https://${hostname}/v0/experiments.js`
    )
    .replace(/\$internalRuntimeVersion\$/g, VERSION);
  await fs.outputFile(`${htmlDestDir}/experiments.cdn.html`, minHtml);
  await fs.copy(htmlSrcPath, `${htmlDestDir}/${path.basename(htmlSrcPath)}`);

  // Build JS.
  const jsDir = 'build/experiments/';
  const js = await fs.readFile(jsSrcPath, 'utf8');
  const builtName = 'experiments.max.js';
  await fs.outputFile(`${jsDir}/${builtName}`, js);
  const jsFiles = globby.sync(`${expDir}/*.js`);
  await Promise.all(
    jsFiles.map((jsFile) => {
      return fs.copy(jsFile, `${jsDir}/${path.basename(jsFile)}`);
    })
  );
}

/**
 * Build "Login Done" page.
 */
async function preBuildLoginDone() {
  await preBuildLoginDoneVersion('0.1');
}

/**
 * Build "Login Done" page for the specified version.
 * @param {string} version
 */
async function preBuildLoginDoneVersion(version) {
  const srcDir = `extensions/amp-access/${version}`;
  const buildDir = `build/all/amp-access-${version}`;
  const htmlPath = `${srcDir}/amp-login-done.html`;
  const jsPath = `${srcDir}/amp-login-done.js`;

  // Build HTML.
  const html = await fs.readFile(htmlPath, 'utf8');
  const minJs = `https://${hostname}/v0/amp-login-done-${version}.js`;
  const minHtml = html
    .replace(`../../../dist/v0/amp-login-done-${version}.max.js`, minJs)
    .replace(`../../../dist/v0/amp-login-done-${version}.js`, minJs);
  if (minHtml.indexOf(minJs) == -1) {
    throw new Error('Failed to correctly set JS in login-done.html');
  }
  await fs.outputFile(`dist/v0/amp-login-done-${version}.html`, minHtml);

  // Build JS.
  const js = await fs.readFile(jsPath, 'utf8');
  const builtName = `amp-login-done-${version}.max.js`;
  await fs.outputFile(`${buildDir}/${builtName}`, js);
  const jsFiles = globby.sync(`${srcDir}/*.js`);
  await Promise.all(
    jsFiles.map((jsFile) => {
      return fs.copy(jsFile, `${buildDir}/${path.basename(jsFile)}`);
    })
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
    'Compiles with readable names. ' +
    'Great for profiling and debugging production code.',
  pretty_print:
    'Outputs compiled code with whitespace. ' +
    'Great for debugging production code.',
  fortesting: 'Compiles production binaries for local testing',
  noconfig: 'Compiles production binaries without applying AMP_CONFIG',
  config: 'Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  coverage: 'Instruments compiled code for collecting coverage information',
  extensions: 'Builds only the listed extensions.',
  extensions_from: 'Builds only the extensions from the listed AMP(s).',
  noextensions: 'Builds with no extensions.',
  core_runtime_only: 'Builds only the core runtime.',
  full_sourcemaps: 'Includes source code content in sourcemaps',
  sourcemap_url: 'Sets a custom sourcemap URL with placeholder {version}',
  type: 'Points sourcemap to fetch files from the correct GitHub tag',
  esm: 'Does not transpile down to ES5',
  version_override: 'Override the version written to AMP_CONFIG',
  watch: 'Watches for changes in files, re-compiles when detected',
  closure_concurrency: 'Sets the number of concurrent invocations of closure',
  debug: 'Outputs the file contents during compilation lifecycles',
  define_experiment_constant:
    'Builds runtime with the EXPERIMENT constant set to true',
  sanitize_vars_for_diff:
    'Sanitize the output to diff build results. Requires --pseudo_names',
  sxg: 'Outputs the compiled code for the SxG build',
  warning_level:
    "Optionally sets closure's warning level to one of [quiet, default, verbose]",
};
