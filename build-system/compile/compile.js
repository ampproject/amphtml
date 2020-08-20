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
const gap = require('gulp-append-prepend');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const nop = require('gulp-nop');
const pathModule = require('path');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const {
  gulpClosureCompile,
  handleCompilerError,
  handleTypeCheckError,
} = require('./closure-compile');
const {checkForUnknownDeps} = require('./check-for-unknown-deps');
const {CLOSURE_SRC_GLOBS} = require('./sources');
const {cpus} = require('os');
const {isTravisBuild} = require('../common/travis');
const {postClosureBabel} = require('./post-closure-babel');
const {preClosureBabel, handlePreClosureError} = require('./pre-closure-babel');
const {sanitize} = require('./sanitize');
const {VERSION: internalRuntimeVersion} = require('./internal-version');
const {writeSourcemaps} = require('./helpers');

const queue = [];
let inProgress = 0;

const MAX_PARALLEL_CLOSURE_INVOCATIONS = isTravisBuild()
  ? 10
  : parseInt(argv.closure_concurrency, 10) || cpus().length;

// Compiles AMP with the closure compiler. This is intended only for
// production use. During development we intend to continue using
// babel, as it has much faster incremental compilation.
exports.closureCompile = async function (
  entryModuleFilename,
  outputDir,
  outputFilename,
  options,
  timeInfo
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
  function shouldAppendSourcemappingURLText(file) {
    // Do not append sourceMappingURL if its a sourcemap
    return (
      pathModule.extname(file.path) !== '.map' && options.esmPassCompilation
    );
  }

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
    'build-system/externs/weakref.extern.js',
  ];
  const define = [`VERSION=${internalRuntimeVersion}`];
  if (argv.pseudo_names) {
    define.push('PSEUDO_NAMES=true');
  }

  return new Promise(function (resolve, reject) {
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
    const srcs = [...CLOSURE_SRC_GLOBS];
    // Add needed path for extensions.
    // Instead of globbing all extensions, this will only add the actual
    // extension path for much quicker build times.
    entryModuleFilenames.forEach(function (filename) {
      if (!pathModule.normalize(filename).startsWith('extensions')) {
        return;
      }
      const path = pathModule.join(pathModule.dirname(filename), '**', '*.js');
      srcs.push(path);
    });
    if (options.extraGlobs) {
      srcs.push.apply(srcs, options.extraGlobs);
    }
    if (options.include3pDirectories) {
      srcs.push('3p/**/*.js', 'ads/**/*.js');
    }
    // For ESM Builds, exclude ampdoc and ampshared css from inclusion.
    // These styles are guaranteed to already be present on elgible documents.
    if (options.esmPassCompilation) {
      srcs.push('!build/ampdoc.css.js', '!build/ampshared.css.js');
    }
    // Many files include the polyfills, but we only want to deliver them
    // once. Since all files automatically wait for the main binary to load
    // this works fine.
    if (options.includeOnlyESMLevelPolyfills) {
      const polyfills = fs.readdirSync('src/polyfills');
      const polyfillsShadowList = polyfills.filter((p) => {
        // custom-elements polyfill must be included.
        // install intersection-observer to esm build as iOS safari 11.1 to
        // 12.1 do not have InObs.
        return !['custom-elements.js', 'intersection-observer.js'].includes(p);
      });
      srcs.push(
        '!build/fake-module/src/polyfills.js',
        '!build/fake-module/src/polyfills/**/*.js',
        '!build/fake-polyfills/src/polyfills.js',
        'src/polyfills/custom-elements.js',
        'src/polyfills/intersection-observer.js',
        'build/fake-polyfills/**/*.js'
      );
      polyfillsShadowList.forEach((polyfillFile) => {
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
    unneededFiles.forEach(function (fake) {
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

    // Normally setting this server-side experiment flag would be handled by
    // the release process automatically. Since this experiment is actually on the
    // build system instead of runtime, we never run it through babel and therefore
    // must compute it here.
    const isStrict = argv.define_experiment_constant === 'STRICT_COMPILATION';
    const isEsm = argv.esm;
    let language;
    if (isEsm) {
      // Do not transpile down to ES5 if running with `--esm`, since we do
      // limited transpilation in Babel.
      language = 'NO_TRANSPILE';
    } else if (isStrict) {
      language = 'ECMASCRIPT5_STRICT';
    } else {
      language = 'ECMASCRIPT5';
    }

    /* eslint "google-camelcase/google-camelcase": 0*/
    const compilerOptions = {
      compilation_level: options.compilationLevel || 'SIMPLE_OPTIMIZATIONS',
      // Turns on more optimizations.
      assume_function_wrapper: true,
      language_in: 'ECMASCRIPT_2020',
      language_out: language,
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
      compilerOptions.checks_only = true;

      // Don't modify compilation_level to a lower level since
      // it won't do strict type checking if its whitespace only.
      compilerOptions.define.push('TYPECHECK_ONLY=true');
      compilerOptions.jscomp_error.push(
        'accessControls',
        'conformanceViolations',
        'checkTypes',
        'const',
        'constantProperty',
        'globalThis',
        'misplacedTypeAnnotation'
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

    const compilerOptionsArray = [];
    Object.keys(compilerOptions).forEach(function (option) {
      const value = compilerOptions[option];
      if (value instanceof Array) {
        value.forEach(function (item) {
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

    if (options.typeCheckOnly) {
      return gulp
        .src(srcs, {base: '.'})
        .pipe(sourcemaps.init())
        .pipe(preClosureBabel())
        .on('error', (err) => handlePreClosureError(err, outputFilename))
        .pipe(gulpClosureCompile(compilerOptionsArray))
        .on('error', (err) => handleTypeCheckError(err))
        .pipe(nop())
        .on('end', resolve);
    } else {
      timeInfo.startTime = Date.now();
      return gulp
        .src(srcs, {base: '.'})
        .pipe(sourcemaps.init())
        .pipe(preClosureBabel())
        .on('error', (err) =>
          handlePreClosureError(err, outputFilename, options, resolve)
        )
        .pipe(gulpClosureCompile(compilerOptionsArray))
        .on('error', (err) =>
          handleCompilerError(err, outputFilename, options, resolve)
        )
        .pipe(rename(`${outputDir}/${outputFilename}`))
        .pipe(
          gulpIf(
            !argv.pseudo_names && !options.skipUnknownDepsCheck,
            checkForUnknownDeps()
          )
        )
        .on('error', reject)
        .pipe(
          gulpIf(
            shouldAppendSourcemappingURLText,
            gap.appendText(`\n//# sourceMappingURL=${outputFilename}.map`)
          )
        )
        .pipe(postClosureBabel())
        .pipe(sanitize())
        .pipe(writeSourcemaps(options))
        .pipe(gulp.dest('.'))
        .on('end', resolve);
    }
  });
}
