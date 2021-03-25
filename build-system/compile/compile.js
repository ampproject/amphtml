/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
'use strict';
const argv = require('minimist')(process.argv.slice(2));
const del = require('del');
const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');
const {checkForUnknownDeps} = require('./check-for-unknown-deps');
const {CLOSURE_SRC_GLOBS} = require('./sources');
const {cpus} = require('os');
const {green, cyan} = require('kleur/colors');
const {log, logLocalDev} = require('../common/logging');
const {postClosureBabel} = require('./post-closure-babel');
const {preClosureBabel} = require('./pre-closure-babel');
const {runClosure} = require('./closure-compile');
const {sanitize} = require('./sanitize');
const {VERSION: internalRuntimeVersion} = require('./internal-version');
const {writeSourcemaps} = require('./helpers');

const queue = [];
let inProgress = 0;

const MAX_PARALLEL_CLOSURE_INVOCATIONS =
  parseInt(argv.closure_concurrency, 10) || cpus().length;

/**
 * @typedef {{
 *  esmPassCompilation?: string,
 *  wrapper?: string,
 *  extraGlobs?: string,
 *  include3pDirectories?: boolean,
 *  includePolyfills?: boolean,
 *  externs?: string[],
 *  compilationLevel?: string,
 *  verboseLogging?: boolean,
 *  typeCheckOnly?: boolean,
 *  skipUnknownDepsCheck?: boolean,
 *  warningLevel?: boolean,
 * }}
 */
let OptionsDef;

/**
 * Compiles AMP with the closure compiler. This is intended only for
 * production use. During development we intend to continue using
 * babel, as it has much faster incremental compilation.
 *
 * @param {string|string[]} entryModuleFilename
 * @param {string} outputDir
 * @param {string} outputFilename
 * @param {!OptionsDef} options
 * @param {{startTime?: number}=} timeInfo
 * @return {Promise<void>}
 */
async function closureCompile(
  entryModuleFilename,
  outputDir,
  outputFilename,
  options,
  timeInfo = {}
) {
  // Rate limit closure compilation to MAX_PARALLEL_CLOSURE_INVOCATIONS
  // concurrent processes.
  return new Promise(function (resolve, reject) {
    function start() {
      inProgress++;
      compile(
        entryModuleFilename,
        outputDir,
        outputFilename,
        options,
        timeInfo
      ).then(
        function () {
          inProgress--;
          next();
          resolve();
        },
        (reason) => reject(reason)
      );
    }

    function next() {
      if (!queue.length) {
        return;
      }
      if (inProgress < MAX_PARALLEL_CLOSURE_INVOCATIONS) {
        queue.shift()();
      }
    }
    queue.push(start);
    next();
  });
}

function cleanupBuildDir() {
  del.sync('build/fake-module');
  del.sync('build/patched-module');
  del.sync('build/parsers');
  fs.mkdirsSync('build/fake-module/third_party/babel');
  fs.mkdirsSync('build/fake-module/src/polyfills/');
  fs.mkdirsSync('build/fake-polyfills/src/polyfills');
}

/**
 * Generates a list of source files based on various factors.
 * TODO(wg-infra, wg-performance): Clean up unnecessary files.
 *
 * @param {string[]|string} entryModuleFilenames
 * @param {string} outputDir
 * @param {string} outputFilename
 * @param {!OptionsDef} options
 * @return {!Array<string>}
 */
function getSrcs(entryModuleFilenames, outputDir, outputFilename, options) {
  const unneededFiles = [
    'build/fake-module/third_party/babel/custom-babel-helpers.js',
  ];
  const srcs = [...CLOSURE_SRC_GLOBS];
  entryModuleFilenames.forEach((filename) => {
    // For extensions, include all JS files in the extension directory.
    // Note: The glob added to srcs must be a posix glob on all platforms.
    if (filename.startsWith('extensions')) {
      srcs.push(
        filename
          .replace(path.basename(filename), path.join('**', '*.js'))
          .split(path.win32.sep)
          .join(path.posix.sep)
      );
    }
  });
  if (options.extraGlobs) {
    srcs.push.apply(srcs, options.extraGlobs);
  }
  if (options.include3pDirectories) {
    srcs.push('3p/**/*.js', 'ads/**/*.js');
  }
  // Many files include the polyfills, but we only want to deliver them
  // once. Since all files automatically wait for the main binary to load
  // this works fine.
  if (options.includePolyfills) {
    srcs.push(
      '!build/fake-module/src/polyfills.js',
      '!build/fake-module/src/polyfills/**/*.js',
      '!build/fake-polyfills/**/*.js'
    );
  } else {
    srcs.push('!src/polyfills.js', '!build/fake-polyfills/**/*.js');
    unneededFiles.push('build/fake-module/src/polyfills.js');
  }
  // Negative globstars must come at the end.
  srcs.push(
    // Don't include rollup configs
    '!**/rollup.config.js',
    // Don't include tests.
    '!**_test.js',
    '!**/test-*.js',
    '!**/test-e2e/*.js',
    // Don't include externs.
    '!**/*.extern.js'
  );
  unneededFiles.forEach(function (fake) {
    if (!fs.existsSync(fake)) {
      fs.writeFileSync(
        fake,
        '// Not needed in closure compiler\nexport function deadCode() {}'
      );
    }
  });
  return srcs;
}

/**
 * Generates the set of options with which to invoke Closure compiler.
 * TODO(wg-infra,wg-performance): Clean up unnecessary options.
 *
 * @param {string} outputDir
 * @param {string} outputFilename
 * @param {!OptionsDef} options
 * @return {!Object}
 */
function generateCompilerOptions(outputDir, outputFilename, options) {
  const baseExterns = [
    'build-system/externs/amp.extern.js',
    'build-system/externs/dompurify.extern.js',
    'build-system/externs/layout-jank.extern.js',
    'build-system/externs/performance-observer.extern.js',
    'third_party/web-animations-externs/web_animations.js',
    'third_party/moment/moment.extern.js',
    'third_party/react-externs/externs.js',
    'build-system/externs/preact.extern.js',
    'build-system/externs/weakref.extern.js',
  ];
  const hideWarningsFor = [
    'third_party/amp-toolbox-cache-url/',
    'third_party/caja/',
    'third_party/closure-library/sha384-generated.js',
    'third_party/d3/',
    'third_party/inputmask/',
    'third_party/mustache/',
    'third_party/react-dates/',
    'third_party/set-dom/',
    'third_party/subscriptions-project/',
    'third_party/vega/',
    'third_party/webcomponentsjs/',
    'node_modules/',
    'build/patched-module/',
  ];
  const define = [`VERSION=${internalRuntimeVersion}`, 'AMP_MODE=true'];
  if (argv.pseudo_names) {
    define.push('PSEUDO_NAMES=true');
  }
  let wrapper = options.wrapper
    ? options.wrapper.replace('<%= contents %>', '%output%')
    : `(function(){%output%})();`;
  wrapper = `${wrapper}\n\n//# sourceMappingURL=${outputFilename}.map`;
  let externs = baseExterns;
  if (options.externs) {
    externs = externs.concat(options.externs);
  }
  externs.push('build-system/externs/amp.multipass.extern.js');

  /**
   * TODO(#28387) write a type for this.
   * @type {Object}
   */
  /* eslint "google-camelcase/google-camelcase": 0*/
  const compilerOptions = {
    compilation_level: options.compilationLevel || 'SIMPLE_OPTIMIZATIONS',
    // Turns on more optimizations.
    assume_function_wrapper: true,
    language_in: 'ECMASCRIPT_2020',
    // Do not transpile down to ES5 if running with `--esm`, since we do
    // limited transpilation in Babel.
    language_out: argv.esm || argv.sxg ? 'NO_TRANSPILE' : 'ECMASCRIPT5_STRICT',
    // We do not use the polyfills provided by closure compiler.
    // If you need a polyfill. Manually include them in the
    // respective top level polyfills.js files.
    rewrite_polyfills: false,
    externs,
    js_module_root: [
      // Do _not_ include 'node_modules/' in js_module_root with 'NODE'
      // resolution or bad things will happen (#18600).
      'build/patched-module/',
      'build/fake-module/',
      'build/fake-polyfills/',
    ],
    module_resolution: 'NODE',
    package_json_entry_names: 'module,main',
    process_common_js_modules: true,
    // This strips all files from the input set that aren't explicitly
    // required.
    dependency_mode: 'PRUNE',
    output_wrapper: wrapper,
    source_map_include_content: !!argv.full_sourcemaps,
    // These arrays are filled in below.
    jscomp_error: [],
    jscomp_warning: [],
    jscomp_off: [],
    define,
    hide_warnings_for: hideWarningsFor,
    // TODO(amphtml): Change 'QUIET' to 'DEFAULT'.
    warning_level: argv.warning_level ?? options.warningLevel ?? 'QUIET',
  };
  if (argv.pseudo_names) {
    // Some optimizations get turned off when pseudo_names is on.
    // This causes some errors caused by the babel transformations
    // that we apply like unreachable code because we turn a conditional
    // falsey. (ex. is IS_DEV transformation which causes some conditionals
    // to be unreachable/suspicious code since the whole expression is
    // falsey)
    compilerOptions.jscomp_off.push('uselessCode', 'externsValidation');
  }
  if (argv.pretty_print) {
    compilerOptions.formatting = 'PRETTY_PRINT';
  }

  // See https://github.com/google/closure-compiler/wiki/Warnings#warnings-categories
  // for a full list of closure's default error / warning levels.
  // NOTE: We do not use jscomp_warning because they are silenced by closure
  // unless there are accompanying errors. Pick a side and use either one of
  // jscomp_error or jscomp_off.
  if (options.typeCheckOnly) {
    compilerOptions.checks_only = true;
    // Note: compilation_level is SIMPLE_OPTIMIZATIONS during type checking.
    // Making it WHITESPACE_ONLY will disable type-checking, so don't do that.
    compilerOptions.define.push('TYPECHECK_ONLY=true');
    // These aren't type-check errors by default, but should be.
    compilerOptions.jscomp_error.push(
      'accessControls',
      'checkDebuggerStatement',
      'conformanceViolations',
      'checkTypes',
      'const',
      'constantProperty',
      'globalThis',
      'misplacedTypeAnnotation',
      'missingProperties',
      'strictMissingProperties',
      'visibility'
    );
    // These are type-check errors / warnings by default, but cannot be.
    compilerOptions.jscomp_off.push(
      'moduleLoad', // Breaks type-only modules: google/closure-compiler#3041
      'unknownDefines' // Closure complains about VERSION
    );
    compilerOptions.conformance_configs =
      'build-system/test-configs/conformance-config.textproto';
  } else {
    // These aren't compilation errors by default, but should be.
    compilerOptions.jscomp_error.push(
      'missingProperties',
      'strictMissingProperties',
      'visibility'
    );
    // Thse are compilation errors / warnings by default, but cannot be.
    compilerOptions.jscomp_off.push(
      'accessControls', // Silences spurious JSC_BAD_PRIVATE_GLOBAL_ACCESS
      'moduleLoad', // Breaks type-only modules: google/closure-compiler#3041
      'unknownDefines' // Closure complains about VERSION
    );
  }

  if (compilerOptions.define.length == 0) {
    delete compilerOptions.define;
  }
  return compilerOptions;
}

/**
 * Generates the full set of flags with which to invoke closure compiler.
 *
 * @param {!OptionsDef} options
 * @param {!Object} compilerOptions
 * @param {!Array<string>} entryModuleFilenames
 * @param {string} destFile
 * @param {string} sourcemapFile
 * @return {!Array<string>}
 */
function generateFlags(
  options,
  compilerOptions,
  entryModuleFilenames,
  destFile,
  sourcemapFile
) {
  const compilerFlags = [];
  Object.keys(compilerOptions).forEach(function (option) {
    const value = compilerOptions[option];
    if (Array.isArray(value)) {
      value.forEach(function (item) {
        compilerFlags.push('--' + option + '=' + item);
      });
    } else {
      if (value != null) {
        compilerFlags.push('--' + option + '=' + value);
      } else {
        compilerFlags.push('--' + option);
      }
    }
  });
  const entryPointFlags = entryModuleFilenames.map(
    (entryPoint) => `--entry_point=${entryPoint}`
  );
  compilerFlags.push(...entryPointFlags);
  if (!options.typeCheckOnly) {
    const outputFileFlag = `--js_output_file=${destFile}`;
    const sourcemapFlag = `--create_source_map=${sourcemapFile}`;
    compilerFlags.push(outputFileFlag, sourcemapFlag);
  }
  return compilerFlags;
}

/**
 * @param {string[]|string} entryModuleFilenames
 * @param {string} outputDir
 * @param {string} outputFilename
 * @param {!OptionsDef} options
 * @param {{startTime?: number}} timeInfo
 * @return {Promise<void>}
 */
async function compile(
  entryModuleFilenames,
  outputDir,
  outputFilename,
  options,
  timeInfo
) {
  if (timeInfo) {
    timeInfo.startTime = Date.now();
  }
  if (!Array.isArray(entryModuleFilenames)) {
    entryModuleFilenames = [entryModuleFilenames];
  }
  const destFile = `${outputDir}/${outputFilename}`;
  const sourcemapFile = `${destFile}.map`;
  const compilerOptions = generateCompilerOptions(
    outputDir,
    outputFilename,
    options
  );
  const srcs = getSrcs(
    entryModuleFilenames,
    outputDir,
    outputFilename,
    options
  );
  const transformedSrcFiles = await Promise.all(
    globby
      .sync(srcs)
      .map((src) => preClosureBabel(src, outputFilename, options))
  );
  if (options.errored && options.continueOnError) {
    return; // Watch build. Bail on transform errors.
  }
  const flags = generateFlags(
    options,
    compilerOptions,
    entryModuleFilenames,
    destFile,
    sourcemapFile
  );
  await runClosure(outputFilename, options, flags, transformedSrcFiles);
  if (options.errored && options.continueOnError) {
    return; // Watch build. Bail on compilation errors.
  }
  if (!options.typeCheckOnly) {
    if (!argv.pseudo_names && !options.skipUnknownDepsCheck) {
      await checkForUnknownDeps(destFile);
    }
    await postClosureBabel(destFile);
    await sanitize(destFile);
    await writeSourcemaps(sourcemapFile, options);
  }
}

function printClosureConcurrency() {
  log(
    green('Using up to'),
    cyan(MAX_PARALLEL_CLOSURE_INVOCATIONS.toString()),
    green('concurrent invocations of closure compiler.')
  );
  if (!argv.closure_concurrency) {
    logLocalDev(
      green('⤷ Use'),
      cyan('--closure_concurrency=N'),
      green('to change this number.')
    );
  }
}

module.exports = {
  cleanupBuildDir,
  closureCompile,
  printClosureConcurrency,
};
