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
const fs = require('fs-extra');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const nop = require('gulp-nop');
const rename = require('gulp-rename');
const rimraf = require('rimraf');
const sourcemaps = require('gulp-sourcemaps');
const {
  gulpClosureCompile,
  handleCompilerError,
  handleTypeCheckError,
} = require('./closure-compile');
const {isTravisBuild} = require('../travis');
const {shortenLicense, shouldShortenLicense} = require('./shorten-license');
const {singlePassCompile} = require('./single-pass');
const {VERSION: internalRuntimeVersion} = require('../internal-version');

const isProdBuild = !!argv.type;
const queue = [];
let inProgress = 0;
const MAX_PARALLEL_CLOSURE_INVOCATIONS = argv.single_pass ? 1 : 4;

// Compiles AMP with the closure compiler. This is intended only for
// production use. During development we intend to continue using
// babel, as it has much faster incremental compilation.
exports.closureCompile = async function(
  entryModuleFilename,
  outputDir,
  outputFilename,
  options
) {
  // Rate limit closure compilation to MAX_PARALLEL_CLOSURE_INVOCATIONS
  // concurrent processes.
  return new Promise(function(resolve, reject) {
    function start() {
      inProgress++;
      compile(entryModuleFilename, outputDir, outputFilename, options).then(
        function() {
          if (isTravisBuild()) {
            // Print a progress dot after each task to avoid Travis timeouts.
            process.stdout.write('.');
          }
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
  rimraf.sync('build/fake-module');
  rimraf.sync('build/patched-module');
  fs.mkdirsSync('build/patched-module/document-register-element/build');
  fs.mkdirsSync('build/fake-module/third_party/babel');
  fs.mkdirsSync('build/fake-module/src/polyfills/');
  fs.mkdirsSync('build/fake-polyfills/src/polyfills');
}
exports.cleanupBuildDir = cleanupBuildDir;

function compile(entryModuleFilenames, outputDir, outputFilename, options) {
  const hideWarningsFor = [
    'third_party/caja/',
    'third_party/closure-library/sha384-generated.js',
    'third_party/subscriptions-project/',
    'third_party/d3/',
    'third_party/mustache/',
    'third_party/vega/',
    'third_party/webcomponentsjs/',
    'third_party/rrule/',
    'third_party/react-dates/',
    'third_party/amp-toolbox-cache-url/',
    'third_party/inputmask/',
    'node_modules/',
    'build/patched-module/',
    // Can't seem to suppress `(0, win.eval)` suspicious code warning
    '3p/environment.js',
    // Generated code.
    'extensions/amp-access/0.1/access-expr-impl.js',
  ];
  const baseExterns = [
    'build-system/amp.extern.js',
    'build-system/dompurify.extern.js',
    'build-system/event-timing.extern.js',
    'build-system/layout-jank.extern.js',
    'third_party/closure-compiler/externs/web_animations.js',
    'third_party/moment/moment.extern.js',
    'third_party/react-externs/externs.js',
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
    return singlePassCompile(entryModuleFilenames, compilationOptions);
  }

  return new Promise(function(resolve, reject) {
    let entryModuleFilename;
    if (entryModuleFilenames instanceof Array) {
      entryModuleFilename = entryModuleFilenames[0];
    } else {
      entryModuleFilename = entryModuleFilenames;
      entryModuleFilenames = [entryModuleFilename];
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
    const srcs = [
      '3p/3p.js',
      // Ads config files.
      'ads/_*.js',
      'ads/alp/**/*.js',
      'ads/google/**/*.js',
      'ads/inabox/**/*.js',
      // Files under build/. Should be sparse.
      'build/css.js',
      'build/*.css.js',
      'build/fake-module/**/*.js',
      'build/patched-module/**/*.js',
      'build/experiments/**/*.js',
      // A4A has these cross extension deps.
      'extensions/amp-ad-network*/**/*-config.js',
      'extensions/amp-ad/**/*.js',
      'extensions/amp-a4a/**/*.js',
      // Currently needed for crypto.js and visibility.js.
      // Should consider refactoring.
      'extensions/amp-analytics/**/*.js',
      // Needed for WebAnimationService
      'extensions/amp-animation/**/*.js',
      // For amp-bind in the web worker (ww.js).
      'extensions/amp-bind/**/*.js',
      // Needed to access to Variant interface from other extensions
      'extensions/amp-experiment/**/*.js',
      // Needed to access form impl from other extensions
      'extensions/amp-form/**/*.js',
      // Needed to access inputmask impl from other extensions
      'extensions/amp-inputmask/**/*.js',
      // Needed for AccessService
      'extensions/amp-access/**/*.js',
      // Needed for AmpStoryVariableService
      'extensions/amp-story/**/*.js',
      // Needed for SubscriptionsService
      'extensions/amp-subscriptions/**/*.js',
      // Needed to access UserNotificationManager from other extensions
      'extensions/amp-user-notification/**/*.js',
      // Needed for VideoService
      'extensions/amp-video-service/**/*.js',
      // Needed to access ConsentPolicyManager from other extensions
      'extensions/amp-consent/**/*.js',
      // Needed to access AmpGeo type for service locator
      'extensions/amp-geo/**/*.js',
      // Needed for AmpViewerAssistanceService
      'extensions/amp-viewer-assistance/**/*.js',
      // Needed for AmpViewerIntegrationVariableService
      'extensions/amp-viewer-integration/**/*.js',
      // Needed for amp-smartlinks dep on amp-skimlinks
      'extensions/amp-skimlinks/0.1/**/*.js',
      'src/*.js',
      'src/**/*.js',
      '!third_party/babel/custom-babel-helpers.js',
      // Exclude since it's not part of the runtime/extension binaries.
      '!extensions/amp-access/0.1/amp-login-done.js',
      'builtins/**.js',
      'third_party/caja/html-sanitizer.js',
      'third_party/closure-library/sha384-generated.js',
      'third_party/css-escape/css-escape.js',
      'third_party/mustache/**/*.js',
      'third_party/timeagojs/**/*.js',
      'third_party/vega/**/*.js',
      'third_party/d3/**/*.js',
      'third_party/subscriptions-project/*.js',
      'third_party/webcomponentsjs/ShadowCSS.js',
      'third_party/rrule/rrule.js',
      'third_party/react-dates/bundle.js',
      'third_party/amp-toolbox-cache-url/**/*.js',
      'third_party/inputmask/**/*.js',
      'node_modules/dompurify/dist/purify.es.js',
      'node_modules/fuse.js/dist/fuse.js',
      'node_modules/promise-pjs/promise.js',
      'node_modules/set-dom/src/**/*.js',
      'node_modules/web-animations-js/web-animations.install.js',
      'node_modules/web-activities/activity-ports.js',
      'node_modules/@ampproject/animations/dist/animations.mjs',
      'node_modules/@ampproject/worker-dom/dist/' +
        'unminified.index.safe.mjs.patched.js',
      'node_modules/document-register-element/build/' +
        'document-register-element.patched.js',
      // 'node_modules/core-js/modules/**.js',
      // Not sure what these files are, but they seem to duplicate code
      // one level below and confuse the compiler.
      '!node_modules/core-js/modules/library/**.js',
    ];
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
    externs.push('build-system/amp.multipass.extern.js');

    /* eslint "google-camelcase/google-camelcase": 0*/
    const compilerOptions = {
      compilation_level: options.compilationLevel || 'SIMPLE_OPTIMIZATIONS',
      // Turns on more optimizations.
      assume_function_wrapper: true,
      // Transpile from ES6 to ES5.
      language_in: 'ECMASCRIPT6',
      language_out: 'ECMASCRIPT5',
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
      process_common_js_modules: true,
      // This strips all files from the input set that aren't explicitly
      // required.
      only_closure_dependencies: true,
      output_wrapper: wrapper,
      source_map_include_content: !!argv.full_sourcemaps,
      source_map_location_mapping: '|' + sourceMapBase,
      warning_level: options.verboseLogging ? 'VERBOSE' : 'DEFAULT',
      jscomp_error: [],
      // moduleLoad: Demote "module not found" errors to ignore missing files
      //     in type declarations in the swg.js bundle.
      jscomp_warning: ['moduleLoad'],
      // Turn off warning for "Unknown @define" since we use define to pass
      // args such as FORTESTING to our runner.
      jscomp_off: ['unknownDefines'],
      define,
      hide_warnings_for: hideWarningsFor,
    };

    // For now do type check separately
    if (options.typeCheckOnly) {
      // Don't modify compilation_level to a lower level since
      // it won't do strict type checking if its whitespace only.
      compilerOptions.define.push('TYPECHECK_ONLY=true');
      compilerOptions.jscomp_error.push(
        'checkTypes',
        'accessControls',
        'const',
        'constantProperty',
        'globalThis'
      );
      compilerOptions.conformance_configs =
        'build-system/conformance-config.textproto';
    }

    if (compilerOptions.define.length == 0) {
      delete compilerOptions.define;
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

    if (options.typeCheckOnly) {
      return gulp
        .src(srcs, {base: '.'})
        .pipe(gulpClosureCompile(compilerOptionsArray))
        .on('error', err => {
          handleTypeCheckError();
          reject(err);
        })
        .pipe(nop())
        .on('end', resolve);
    } else {
      return gulp
        .src(srcs, {base: '.'})
        .pipe(gulpIf(shouldShortenLicense, shortenLicense()))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gulpClosureCompile(compilerOptionsArray))
        .on('error', err => {
          handleCompilerError(outputFilename);
          reject(err);
        })
        .pipe(rename(outputFilename))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(outputDir))
        .on('end', resolve);
    }
  });
}
