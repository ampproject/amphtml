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

const argv = require('minimist')(process.argv.slice(2));
const globby = require('globby');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../common/ctrlcHandler');
const {
  displayLifecycleDebugging,
} = require('../compile/debug-compilation-lifecycle');
const {cleanupBuildDir, closureCompile} = require('../compile/compile');
const {compileCss} = require('./css');
const {compileJison} = require('./compile-jison');
const {cyan, green, red, yellow} = require('../common/colors');
const {extensions, maybeInitializeExtensions} = require('./extension-helpers');
const {logClosureCompilerError} = require('../compile/closure-compile');
const {log} = require('../common/logging');
const {typecheckNewServer} = require('../server/typescript-compile');

// We provide glob lists for core src/externs since any other targets are
// allowed to depend on core.
const CORE_SRCS_GLOBS = [
  'src/core/**/*.js',

  // Needed for CSS escape polyfill
  'third_party/css-escape/css-escape.js',
];

/**
 * Generates a list of source file paths for extensions to type-check
 * Must be run after `maybeInitializeExtensions`
 * @function
 * @return {!Array<string>}
 */
const getExtensionSrcPaths = () =>
  Object.values(extensions)
    .filter((ext) => !ext.noTypeCheck)
    .map(({name, version}) => `extensions/${name}/${version}/${name}.js`)
    .sort();

/**
 * The main configuration location to add/edit targets for type checking.
 * Properties besides `entryPoints` are passed on to `closureCompile` as
 * options. * Values may be objects or functions, as some require initialization
 * or filesystem access and shouldn't be run until needed.
 *
 * When updating type-check targets, `srcGlobs` is the primary value you care
 * about. This is a list of source files to include in type-checking. For any
 * glob pattern ending in *.js, externs are picked up following the same pattern
 * but ending in *.extern.js. Note this only applies to *.js globs, and not
 * specific filenames. If just an array of strings is provided instead of an
 * object, it is treated as srcGlobs.
 *
 * @type {Object<string, Array<string>|Object|function():Object>}
 */
const TYPE_CHECK_TARGETS = {
  // Below are targets containing individual directories which are fully passing
  // type-checking. Do not remove or disable anything on this list.
  // Goal: Remove 'QUIET' from all of them.
  // To test a target locally:
  //   `amp check-types --target=src-foo-bar --warning_level=verbose`
  'src-amp-story-player': {
    srcGlobs: ['src/amp-story-player/**/*.js'],
    warningLevel: 'QUIET',
  },
  'src-context': ['src/context/**/*.js', ...CORE_SRCS_GLOBS],
  'src-core': CORE_SRCS_GLOBS,
  'src-examiner': ['src/examiner/**/*.js'],
  'src-experiments': {
    srcGlobs: ['src/experiments/**/*.js', ...CORE_SRCS_GLOBS],
    externGlobs: ['build-system/externs/amp.extern.js'],
  },
  'src-inabox': {
    srcGlobs: ['src/inabox/**/*.js'],
    warningLevel: 'QUIET',
  },
  'src-polyfills': [
    'src/polyfills/**/*.js',
    // Exclude fetch its dependencies are cleaned up/extracted to core.
    '!src/polyfills/fetch.js',
    ...CORE_SRCS_GLOBS,
  ],
  'src-preact': {
    srcGlobs: ['src/preact/**/*.js', 'src/context/**/*.js', ...CORE_SRCS_GLOBS],
    warningLevel: 'QUIET',
  },
  'src-purifier': {
    srcGlobs: ['src/purifier/**/*.js'],
    warningLevel: 'QUIET',
  },
  'src-service': {
    srcGlobs: ['src/service/**/*.js'],
    warningLevel: 'QUIET',
  },
  'src-utils': {
    srcGlobs: ['src/utils/**/*.js'],
    warningLevel: 'QUIET',
  },
  'src-web-worker': {
    srcGlobs: ['src/web-worker/**/*.js'],
    warningLevel: 'QUIET',
  },

  // Ensures that all files in src and extensions pass the specified set of
  // errors.
  'low-bar': {
    entryPoints: ['src/amp.js'],
    extraGlobs: ['{src,extensions}/**/*.js'],
    onError(msg) {
      const lowBarErrors = [
        'JSC_BAD_JSDOC_ANNOTATION',
        'JSC_INVALID_PARAM',
        'JSC_TYPE_PARSE_ERROR',
      ];
      const lowBarRegex = new RegExp(lowBarErrors.join('|'));

      const targetErrors = msg
        .split('\n')
        .filter((s) => lowBarRegex.test(s))
        .join('\n')
        .trim();

      if (targetErrors.length) {
        logClosureCompilerError(targetErrors);
        throw new Error(`Type-checking failed for target ${cyan('low-bar')}`);
      }
    },
  },

  // TODO(#33631): Targets below this point are not expected to pass.
  // They can possibly be removed?
  'src': {
    entryPoints: [
      'src/amp.js',
      'src/amp-shadow.js',
      'src/inabox/amp-inabox.js',
      'ads/alp/install-alp.js',
      'ads/inabox/inabox-host.js',
      'src/web-worker/web-worker.js',
    ],
    extraGlobs: ['src/inabox/*.js', '!node_modules/preact'],
    warningLevel: 'QUIET',
  },
  'extensions': () => ({
    entryPoints: getExtensionSrcPaths(),
    extraGlobs: ['src/inabox/*.js', '!node_modules/preact'],
    warningLevel: 'QUIET',
  }),
  'integration': {
    entryPoints: '3p/integration.js',
    externs: ['ads/ads.extern.js'],
    warningLevel: 'QUIET',
  },
  'ampcontext': {
    entryPoints: '3p/ampcontext-lib.js',
    externs: ['ads/ads.extern.js'],
    warningLevel: 'QUIET',
  },
  'iframe-transport-client': {
    entryPoints: '3p/iframe-transport-client-lib.js',
    externs: ['ads/ads.extern.js'],
    warningLevel: 'QUIET',
  },
};

/**
 * Produces a list of extern glob patterns from a list of source glob patterns.
 * ex. ['src/core/** /*.js'] => ['src/core/** /*.extern.js']
 * @param {!Array<string>} srcGlobs
 * @return {!Array<string>}
 */
function externGlobsFromSrcGlobs(srcGlobs) {
  return srcGlobs
    .filter((glob) => glob.endsWith('*.js'))
    .map((glob) => glob.replace(/\*\.js$/, '*.extern.js'));
}

/**
 * Performs closure type-checking on the target provided.
 * @param {string} targetName key in TYPE_CHECK_TARGETS
 * @return {!Promise<void>}
 */
async function typeCheck(targetName) {
  let target = TYPE_CHECK_TARGETS[targetName];
  // Allow targets to be dynamically evaluated
  if (typeof target == 'function') {
    target = target();
  }
  // Allow targets to be specified as just an array of source globs
  if (Array.isArray(target)) {
    target = {srcGlobs: target};
  }

  if (!target) {
    log(
      red('ERROR:'),
      'No type-check configuration defined for target',
      cyan(targetName)
    );
    throw new Error(
      `No type-check configuration defined for target ${targetName}`
    );
  }

  const {entryPoints = [], srcGlobs = [], externGlobs = [], ...opts} = target;
  externGlobs.push(...externGlobsFromSrcGlobs(srcGlobs));

  // If srcGlobs and externGlobs are defined, determine the externs/extraGlobs
  if (srcGlobs.length || externGlobs.length) {
    opts.externs = externGlobs.flatMap(globby.sync);

    // Included globs should explicitly exclude any externs
    const excludedExterns = externGlobs.map((glob) => `!${glob}`);
    opts.extraGlobs = srcGlobs.concat(excludedExterns);
  }

  // If no entry point is defined, we want to scan the globs provided without
  // injecting extra dependencies.
  const noAddDeps = !entryPoints.length;
  // If the --warning_level flag is passed explicitly, it takes precedence.
  opts.warningLevel = argv.warning_level || opts.warningLevel || 'VERBOSE';

  // For type-checking, QUIET suppresses all warnings and can't affect the
  // resulting status, so there's no point in doing it.
  if (opts.warningLevel == 'QUIET') {
    log(
      yellow('WARNING:'),
      'Warning level for target',
      cyan(targetName),
      `is set to ${cyan('QUIET')}; skipping`
    );
    return;
  }

  let errorMsg;
  if (target.onError) {
    // If an onError handler is defined, steal the output and let onError handle
    // logging
    opts.logger = (m) => (errorMsg = m);
  }

  await closureCompile(entryPoints, './dist', `${targetName}-check-types.js`, {
    noAddDeps,
    include3pDirectories: !noAddDeps,
    includePolyfills: !noAddDeps,
    typeCheckOnly: true,
    ...opts,
  }).catch((error) => {
    if (!target.onError) {
      throw error;
    }
    target.onError(errorMsg);
  });
  log(green('SUCCESS:'), 'Type-checking passed for target', cyan(targetName));
}

/**
 * Runs closure compiler's type checker against all AMP code.
 * @return {!Promise<void>}
 */
async function checkTypes() {
  const handlerProcess = createCtrlcHandler('check-types');

  // Prepare build environment
  process.env.NODE_ENV = 'production';
  cleanupBuildDir();
  maybeInitializeExtensions();
  typecheckNewServer();
  await Promise.all([compileCss(), compileJison()]);

  // Use the list of targets if provided, otherwise check all targets
  const targets = argv.targets
    ? argv.targets.split(/,/)
    : Object.keys(TYPE_CHECK_TARGETS);

  log(`Checking types for targets: ${targets.map(cyan).join(', ')}`);
  displayLifecycleDebugging();

  await Promise.all(targets.map(typeCheck));
  exitCtrlcHandler(handlerProcess);
}

module.exports = {
  checkTypes,
};

/* eslint "google-camelcase/google-camelcase": 0 */
checkTypes.description = 'Check source code for JS type errors';
checkTypes.flags = {
  closure_concurrency: 'Set the number of concurrent invocations of closure',
  debug: 'Output the file contents during compilation lifecycles',
  targets: 'Comma-delimited list of targets to type-check',
  warning_level:
    "Optionally set closure's warning level to one of [quiet, default, verbose]",
};
