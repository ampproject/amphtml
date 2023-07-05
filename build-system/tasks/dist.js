const colors = require('kleur/colors');
const fastGlob = require('fast-glob');
const fs = require('fs-extra');
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
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../common/ctrlcHandler');
const {
  displayLifecycleDebugging,
} = require('../compile/debug-compilation-lifecycle');
const {
  VERSION: internalRuntimeVersion,
} = require('../compile/internal-version');
const {buildCompiler} = require('../compile/build-compiler');
const {buildExtensions, parseExtensionFlags} = require('./extension-helpers');
const {buildVendorConfigs} = require('./3p-vendor-helpers');
const {compileCss, copyCss} = require('./css');
const {compileJison} = require('./compile-jison');
const {formatExtractedMessages} = require('../compile/log-messages');
const {log} = require('../common/logging');
const {VERSION} = require('../compile/internal-version');
const {buildStoryLocalization} = require('./build-story-localization');

const {cyan, green} = colors;
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
 * @return {Promise<void>}
 */
async function runPreDistSteps(options) {
  await prebuild();
  await compileCss(options);
  await copyCss();
  await compileJison();
  await copyParsers();
  await bootstrapThirdPartyFrames(options);
  await buildStoryLocalization(options);
  displayLifecycleDebugging();
}

/**
 * Minified build. Entry point for `amp dist`.
 * @return {Promise<void>}
 */
async function dist() {
  const handlerProcess = createCtrlcHandler('dist');
  process.env.NODE_ENV = 'production';
  const options = {
    fortesting: argv.fortesting,
    minify: true,
    watch: argv.watch,
  };
  printNobuildHelp();
  printDistHelp(options);
  await runPreDistSteps(options);

  // These steps use closure compiler. Small ones before large (parallel) ones.
  if (argv.core_runtime_only) {
    await compileCoreRuntime(options);
  } else {
    await Promise.all([
      writeVersionFiles(),
      buildExperiments(),
      buildLoginDone('0.1'),
      buildWebPushPublisherFiles(),
      buildCompiler(),
      compileAllJs(options),
    ]);
  }

  // This step internally parses the various extension* flags.
  await buildExtensions(options);

  // This step is to be run only during a full `amp dist`.
  if (
    !argv.core_runtime_only &&
    !argv.extensions &&
    !argv.extensions_from &&
    !argv.noextensions
  ) {
    await buildVendorConfigs(options);
  }

  // This step is required no matter which binaries are built.
  await formatExtractedMessages();

  if (!argv.watch) {
    exitCtrlcHandler(handlerProcess);
  }
}

/**
 * Writes the verion.txt file.
 * @return {!Promise}
 */
async function writeVersionFiles() {
  // TODO: determine which of these are necessary and trim the rest via an I2D.
  const paths = [
    'dist',
    'dist/v0',
    'dist/v0/examples',
    'dist.tools/experiments',
    `dist.3p/${internalRuntimeVersion}`,
    `dist.3p/${internalRuntimeVersion}/vendor`,
  ].map((p) => path.join(...p.split('/'), 'version.txt'));

  return Promise.all(
    paths.map((p) => fs.outputFile(p, internalRuntimeVersion))
  );
}

/**
 * Build AMP experiments.js.
 * @return {Promise<void>}
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
  const aliasName = 'amp-login-done-latest.js';
  return compileJs(`./${buildDir}`, builtName, './dist/v0/', {
    watch: argv.watch,
    includePolyfills: true,
    minify: true,
    minifiedName,
    aliasName,
  });
}

/**
 * Build amp-web-push publisher files HTML page.
 * @return {Promise<void>}
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
 * @return {Promise<void>}
 */
async function copyParsers() {
  const startTime = Date.now();
  await fs.copy('build/parsers', 'dist/v0');
  endBuildStep('Copied', 'build/parsers/ to dist/v0', startTime);
}

/**
 * Build amp-web-push publisher files HTML page.
 * @return {Promise<void>}
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
      const jsFiles = await fastGlob(`${srcPath}/*.js`);
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
 * @return {Promise<void>}
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
 * @return {Promise<void>}
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
  const jsFiles = await fastGlob(`${expDir}/*.js`);
  await Promise.all(
    jsFiles.map((jsFile) => {
      return fs.copy(jsFile, `${jsDir}/${path.basename(jsFile)}`);
    })
  );
}

/**
 * Build "Login Done" page.
 * @return {Promise<void>}
 */
async function preBuildLoginDone() {
  await preBuildLoginDoneVersion('0.1');
}

/**
 * Build "Login Done" page for the specified version.
 * @param {string} version
 * @return {Promise<void>}
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
  const jsFiles = await fastGlob(`${srcDir}/*.js`);
  await Promise.all(
    jsFiles.map((jsFile) => {
      return fs.copy(jsFile, `${buildDir}/${path.basename(jsFile)}`);
    })
  );
}

module.exports = {
  dist,
  runPreDistSteps,
};

/* eslint "local/camelcase": 0 */

dist.description =
  'Compile AMP production binaries and apply AMP_CONFIG to runtime files';
dist.flags = {
  pseudo_names:
    'Compile with readable names (useful while profiling / debugging production code)',
  pretty_print:
    'Output code with whitespace (useful while profiling / debugging production code)',
  fortesting: 'Compile production binaries for local testing',
  noconfig: 'Compile production binaries without applying AMP_CONFIG',
  nomanglecache:
    'Do not share the mangle cache between binaries, useful only in estimating size impacts of code changes.',
  config: 'Set the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
  coverage: 'Instrument code for collecting coverage information',
  extensions: 'Build only the listed extensions',
  extensions_from: 'Build only the extensions from the listed AMP(s)',
  noextensions: 'Build with no extensions',
  core_runtime_only: 'Build only the core runtime',
  full_sourcemaps: 'Include source code content in sourcemaps',
  sourcemap_url: 'Set a custom sourcemap URL with placeholder {version}',
  type: 'Point sourcemap to fetch files from the correct GitHub tag',
  esm: 'Do not transpile down to ES5',
  version_override: 'Override the version written to AMP_CONFIG',
  watch: 'Watch for changes in files, re-compiles when detected',
  debug: 'Output the file contents during compilation lifecycles',
  define_experiment_constant:
    'Build runtime with the EXPERIMENT constant set to true',
  sanitize_vars_for_diff:
    'Sanitize the output to diff build results (requires --pseudo_names)',
  sxg: 'Output the minified code for the SxG build',
};
