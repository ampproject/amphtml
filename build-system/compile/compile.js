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
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const nop = require('gulp-nop');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const {
  gulpClosureCompile,
  handleCompilerError,
  handleTypeCheckError,
} = require('./closure-compile');
const {checkForUnknownDeps} = require('./check-for-unknown-deps');
const {checkTypesNailgunPort, distNailgunPort} = require('../tasks/nailgun');
const {CLOSURE_SRC_GLOBS, SRC_TEMP_DIR} = require('./sources');
const {isTravisBuild} = require('../common/travis');
const {shortenLicense, shouldShortenLicense} = require('./shorten-license');
const {singlePassCompile} = require('./single-pass');
const {VERSION: internalRuntimeVersion} = require('./internal-version');

const isProdBuild = !!argv.type;
const queue = [];
let inProgress = 0;

// There's a race in the gulp plugin of closure compiler that gets exposed
// during various local development scenarios.
// See https://github.com/google/closure-compiler-npm/issues/9
const MAX_PARALLEL_CLOSURE_INVOCATIONS = isTravisBuild() ? 4 : 1;

/**
 * Prefixes the the tmp directory if we need to shadow files that have been
 * preprocess by babel in the `dist` task.
 *
 * @param {!Array<string>} paths
 * @return {!Array<string>}
 */
function convertPathsToTmpRoot(paths) {
  return paths.map(path => path.replace(/^(\!?)(.*)$/, `$1${SRC_TEMP_DIR}/$2`));
}

// Compiles AMP with the closure compiler. This is intended only for
// production use. During development we intend to continue using
// babel, as it has much faster incremental compilation.
exports.closureCompile = async function(
  entryModuleFilename,
  outputDir,
  outputFilename,
  options,
  timeInfo
) {
  // Rate limit closure compilation to MAX_PARALLEL_CLOSURE_INVOCATIONS
  // concurrent processes.
  return new Promise(function(resolve, reject) {
    function start() {
      inProgress++;
      compile(
        entryModuleFilename,
        outputDir,
        outputFilename,
        options,
        timeInfo
      ).then(
        function() {
          inProgress--;
          next();
          resolve();
        },
        reason => reject(reason)
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
};

function cleanupBuildDir() {
  del.sync('build/fake-module');
  del.sync('build/patched-module');
  del.sync('build/parsers');
  fs.mkdirsSync('build/fake-module/third_party/babel');
  fs.mkdirsSync('build/fake-module/src/polyfills/');
  fs.mkdirsSync('build/fake-polyfills/src/polyfills');
}
exports.cleanupBuildDir = cleanupBuildDir;

function compile(
  entryModuleFilenames,
  outputDir,
  outputFilename,
  options,
  timeInfo
) {
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
  const baseExterns = [
    'build-system/externs/amp.extern.js',
    'build-system/externs/dompurify.extern.js',
    'build-system/externs/layout-jank.extern.js',
    'build-system/externs/performance-observer.extern.js',
    'third_party/web-animations-externs/web_animations.js',
    'third_party/moment/moment.extern.js',
    'third_party/react-externs/externs.js',
    'build-system/externs/preact.extern.js',
  ];
  const define = [`VERSION=${internalRuntimeVersion}`];
  if (argv.pseudo_names) {
    define.push('PSEUDO_NAMES=true');
  }
  if (argv.fortesting) {
    define.push('FORTESTING=true');
  }
  if (options.singlePassCompilation) {
    const compilationOptions = {
      define,
      externs: baseExterns,
      hideWarningsFor,
    };

    // Add babel plugin to remove unwanted polyfills in esm build
    if (options.esmPassCompilation) {
      compilationOptions['dest'] = './dist/esm/';
      define.push('ESM_BUILD=true');
    }

    console /*OK*/
      .assert(typeof entryModuleFilenames == 'string');
    return singlePassCompile(
      entryModuleFilenames,
      compilationOptions,
      timeInfo
    );
  }

  return new Promise(function(resolve, reject) {
    if (!(entryModuleFilenames instanceof Array)) {
      entryModuleFilenames = [entryModuleFilenames];
    }
    const unneededFiles = [
      'build/fake-module/third_party/babel/custom-babel-helpers.js',
    ];
    let wrapper = '(function(){%output%})();';
    if (options.wrapper) {
      wrapper = options.wrapper.replace('<%= contents %>', '%output%');
    }
    let sourceMapBase = 'http://localhost:8000/';
    if (isProdBuild) {
      // Point sourcemap to fetch files from correct GitHub tag.
      sourceMapBase =
        'https://raw.githubusercontent.com/ampproject/amphtml/' +
        internalRuntimeVersion +
        '/';
    }
    const srcs = [...CLOSURE_SRC_GLOBS];
    // Add needed path for extensions.
    // Instead of globbing all extensions, this will only add the actual
    // extension path for much quicker build times.
    entryModuleFilenames.forEach(function(filename) {
      if (!filename.includes('extensions/')) {
        return;
      }
      const path = filename.replace(/\/[^/]+\.js$/, '/**/*.js');
      srcs.push(path);
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
    if (options.includeOnlyESMLevelPolyfills) {
      const polyfills = fs.readdirSync('src/polyfills');
      const polyfillsShadowList = polyfills.filter(p => {
        // custom-elements polyfill must be included.
        return p !== 'custom-elements.js';
      });
      srcs.push(
        '!build/fake-module/src/polyfills.js',
        '!build/fake-module/src/polyfills/**/*.js',
        '!build/fake-polyfills/src/polyfills.js',
        'src/polyfills/custom-elements.js',
        'build/fake-polyfills/**/*.js'
      );
      polyfillsShadowList.forEach(polyfillFile => {
        srcs.push(`!src/polyfills/${polyfillFile}`);
        fs.writeFileSync(
          'build/fake-polyfills/src/polyfills/' + polyfillFile,
          'export function install() {}'
        );
      });
    } else if (options.includePolyfills) {
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
    unneededFiles.forEach(function(fake) {
      if (!fs.existsSync(fake)) {
        fs.writeFileSync(
          fake,
          '// Not needed in closure compiler\n' +
            'export function deadCode() {}'
        );
      }
    });

    let externs = baseExterns;
    if (options.externs) {
      externs = externs.concat(options.externs);
    }
    externs.push('build-system/externs/amp.multipass.extern.js');

    /* eslint "google-camelcase/google-camelcase": 0*/
    const compilerOptions = {
      compilation_level: options.compilationLevel || 'SIMPLE_OPTIMIZATIONS',
      // Turns on more optimizations.
      assume_function_wrapper: true,
      language_in: 'ECMASCRIPT_2018',
      // Do not transpile down to ES5 if running with `--esm`, since we do
      // limited transpilation in Babel.
      language_out: argv.esm ? 'NO_TRANSPILE' : 'ECMASCRIPT5',
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
      entry_point: entryModuleFilenames,
      module_resolution: 'NODE',
      package_json_entry_names: 'module,main',
      process_common_js_modules: true,
      // This strips all files from the input set that aren't explicitly
      // required.
      dependency_mode: 'PRUNE',
      output_wrapper: wrapper,
      source_map_include_content: !!argv.full_sourcemaps,
      source_map_location_mapping: '|' + sourceMapBase,
      warning_level: options.verboseLogging ? 'VERBOSE' : 'DEFAULT',
      // These arrays are filled in below.
      jscomp_error: [],
      jscomp_warning: [],
      jscomp_off: [],
      define,
      hide_warnings_for: hideWarningsFor,
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
    if (options.typeCheckOnly) {
      // Don't modify compilation_level to a lower level since
      // it won't do strict type checking if its whitespace only.
      compilerOptions.define.push('TYPECHECK_ONLY=true');
      compilerOptions.jscomp_error.push(
        'accessControls',
        'conformanceViolations',
        'checkTypes',
        'const',
        'constantProperty',
        'globalThis'
      );
      compilerOptions.jscomp_off.push('moduleLoad', 'unknownDefines');
      compilerOptions.conformance_configs =
        'build-system/test-configs/conformance-config.textproto';
    } else {
      compilerOptions.jscomp_warning.push('accessControls', 'moduleLoad');
      compilerOptions.jscomp_off.push('unknownDefines');
    }

    if (compilerOptions.define.length == 0) {
      delete compilerOptions.define;
    }

    if (!argv.single_pass) {
      compilerOptions.js_module_root.push(SRC_TEMP_DIR);
    }

    const compilerOptionsArray = [];
    Object.keys(compilerOptions).forEach(function(option) {
      const value = compilerOptions[option];
      if (value instanceof Array) {
        value.forEach(function(item) {
          compilerOptionsArray.push('--' + option + '=' + item);
        });
      } else {
        if (value != null) {
          compilerOptionsArray.push('--' + option + '=' + value);
        } else {
          compilerOptionsArray.push('--' + option);
        }
      }
    });

    const gulpSrcs = !argv.single_pass ? convertPathsToTmpRoot(srcs) : srcs;
    const gulpBase = !argv.single_pass ? SRC_TEMP_DIR : '.';

    if (options.typeCheckOnly) {
      return gulp
        .src(gulpSrcs, {base: gulpBase})
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gulpClosureCompile(compilerOptionsArray, checkTypesNailgunPort))
        .on('error', err => {
          handleTypeCheckError();
          reject(err);
        })
        .pipe(nop())
        .on('end', resolve);
    } else {
      timeInfo.startTime = Date.now();
      return gulp
        .src(gulpSrcs, {base: gulpBase})
        .pipe(gulpIf(shouldShortenLicense, shortenLicense()))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gulpClosureCompile(compilerOptionsArray, distNailgunPort))
        .on('error', err => {
          handleCompilerError(outputFilename);
          reject(err);
        })
        .pipe(rename(outputFilename))
        .pipe(
          gulpIf(
            !argv.pseudo_names && !options.skipUnknownDepsCheck,
            checkForUnknownDeps()
          )
        )
        .on('error', reject)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(outputDir))
        .on('end', resolve);
    }
  });
}
