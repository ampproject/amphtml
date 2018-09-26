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
const closureCompiler = require('gulp-closure-compiler');
const colors = require('ansi-colors');
const fs = require('fs-extra');
const gulp = require('gulp');
const {VERSION: internalRuntimeVersion} = require('../internal-version') ;

const rename = require('gulp-rename');
const replace = require('gulp-regexp-sourcemaps');
const rimraf = require('rimraf');
const shortenLicense = require('../shorten-license');
const {highlight} = require('cli-highlight');
const {singlePassCompile} = require('../get-dep-graph');

const isProdBuild = !!argv.type;
const queue = [];
let inProgress = 0;
const MAX_PARALLEL_CLOSURE_INVOCATIONS = 4;

// Compiles AMP with the closure compiler. This is intended only for
// production use. During development we intend to continue using
// babel, as it has much faster incremental compilation.
exports.closureCompile = function(entryModuleFilename, outputDir,
  outputFilename, options) {
  // Rate limit closure compilation to MAX_PARALLEL_CLOSURE_INVOCATIONS
  // concurrent processes.
  return new Promise(function(resolve) {
    function start() {
      inProgress++;
      compile(entryModuleFilename, outputDir, outputFilename, options)
          .then(function() {
            if (process.env.TRAVIS) {
              // Print a progress dot after each task to avoid Travis timeouts.
              process.stdout.write('.');
            }
            inProgress--;
            next();
            resolve();
          }, function(e) {
            console./* OK*/error(colors.red('Compilation error:', e.message));
            process.exit(1);
          });
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
  fs.mkdirsSync('build/cc');
  rimraf.sync('build/fake-module');
  rimraf.sync('build/patched-module');
  fs.mkdirsSync('build/patched-module/document-register-element/build');
  fs.mkdirsSync('build/fake-module/third_party/babel');
  fs.mkdirsSync('build/fake-module/src/polyfills/');
  fs.mkdirsSync('build/fake-polyfills/src/polyfills');
}
exports.cleanupBuildDir = cleanupBuildDir;

// Formats a closure compiler error message into a more readable form by
// dropping the lengthy java invocation line...
//     Command failed: java -jar ... --js_output_file="<file>"
// ...and then syntax highlighting the error text.
function formatClosureCompilerError(message) {
  const javaInvocationLine = /Command failed:[^]*--js_output_file=\".*?\"\n/;
  message = message.replace(javaInvocationLine, '');
  message = highlight(message, {ignoreIllegals: true}); // never throws
  message = message.replace(/WARNING/g, colors.yellow('WARNING'));
  message = message.replace(/ERROR/g, colors.red('ERROR'));
  return message;
}

function compile(entryModuleFilenames, outputDir,
  outputFilename, options) {
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
    'node_modules/',
    'build/patched-module/',
    // Can't seem to suppress `(0, win.eval)` suspicious code warning
    '3p/environment.js',
    // Generated code.
    'extensions/amp-access/0.1/access-expr-impl.js',
  ];

  const baseExterns = [
    'build-system/amp.extern.js',
    'third_party/closure-compiler/externs/performance_observer.js',
    'third_party/closure-compiler/externs/web_animations.js',
    'third_party/moment/moment.extern.js',
    'third_party/react-externs/externs.js',
  ];
  const define = [];
  if (argv.pseudo_names) {
    define.push('PSEUDO_NAMES=true');
  }
  if (argv.fortesting) {
    define.push('FORTESTING=true');
  }
  if (options.singlePassCompilation) {
    // TODO(@cramforce): Run the post processing step
    return singlePassCompile(entryModuleFilenames, {
      define,
      externs: baseExterns,
      hideWarningsFor,
    }).then(() => {
      return new Promise((resolve, reject) => {
        const stream = gulp.src(outputDir + '/**/*.js');
        stream.on('end', resolve);
        stream.on('error', reject);
        stream.pipe(
            replace(/\$internalRuntimeVersion\$/g, internalRuntimeVersion, 'runtime-version'))
            .pipe(shortenLicense())
            .pipe(gulp.dest(outputDir));
      });
    });
  }

  return new Promise(function(resolve) {
    let entryModuleFilename;
    if (entryModuleFilenames instanceof Array) {
      entryModuleFilename = entryModuleFilenames[0];
    } else {
      entryModuleFilename = entryModuleFilenames;
      entryModuleFilenames = [entryModuleFilename];
    }
    const checkTypes =
        options.checkTypes || options.typeCheckOnly || argv.typecheck_only;
    const intermediateFilename = 'build/cc/' +
        entryModuleFilename.replace(/\//g, '_').replace(/^\./, '');
    // If undefined/null or false then we're ok executing the deletions
    // and mkdir.
    if (!options.preventRemoveAndMakeDir) {
      cleanupBuildDir();
    }
    const unneededFiles = [
      'build/fake-module/third_party/babel/custom-babel-helpers.js',
    ];
    let wrapper = '(function(){%output%})();';
    if (options.wrapper) {
      wrapper = options.wrapper.replace('<%= contents %>', '%output%');
    }
    wrapper += '\n//# sourceMappingURL=' + outputFilename + '.map\n';
    if (fs.existsSync(intermediateFilename)) {
      fs.unlinkSync(intermediateFilename);
    }
    let sourceMapBase = 'http://localhost:8000/';
    if (isProdBuild) {
      // Point sourcemap to fetch files from correct GitHub tag.
      sourceMapBase = 'https://raw.githubusercontent.com/ampproject/amphtml/' +
            internalRuntimeVersion + '/';
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
      // Needed to access form impl from other extensions
      'extensions/amp-form/**/*.js',
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
      // Needed for AmpViewerIntegrationVariableService
      'extensions/amp-viewer-integration/**/*.js',
      'src/*.js',
      'src/!(inabox)*/**/*.js',
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
      'node_modules/dompurify/dist/purify.cjs.js',
      'node_modules/promise-pjs/promise.js',
      'node_modules/set-dom/src/**/*.js',
      'node_modules/web-animations-js/web-animations.install.js',
      'node_modules/web-activities/activity-ports.js',
      'node_modules/document-register-element/build/' +
          'document-register-element.patched.js',
      // 'node_modules/core-js/modules/**.js',
      // Not sure what these files are, but they seem to duplicate code
      // one level below and confuse the compiler.
      '!node_modules/core-js/modules/library/**.js',
      // Don't include rollup configs
      '!**/rollup.config.js',
      // Don't include tests.
      '!**_test.js',
      '!**/test-*.js',
      '!**/*.extern.js',
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
      srcs.push(
          '3p/**/*.js',
          'ads/**/*.js');
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
          'build/fake-polyfills/**/*.js');
      polyfillsShadowList.forEach(polyfillFile => {
        srcs.push(`!src/polyfills/${polyfillFile}`);
        fs.writeFileSync('build/fake-polyfills/src/polyfills/' + polyfillFile,
            'export function install() {}');
      });
    } else if (options.includePolyfills) {
      srcs.push(
          '!build/fake-module/src/polyfills.js',
          '!build/fake-module/src/polyfills/**/*.js',
          '!build/fake-polyfills/**/*.js',
      );
    } else {
      srcs.push('!src/polyfills.js', '!build/fake-polyfills/**/*.js',);
      unneededFiles.push('build/fake-module/src/polyfills.js');
    }
    unneededFiles.forEach(function(fake) {
      if (!fs.existsSync(fake)) {
        fs.writeFileSync(fake,
            '// Not needed in closure compiler\n' +
            'export function deadCode() {}');
      }
    });

    let externs = baseExterns;
    if (options.externs) {
      externs = externs.concat(options.externs);
    }

    /* eslint "google-camelcase/google-camelcase": 0*/
    const compilerOptions = {
      // Temporary shipping with our own compiler that has a single patch
      // applied
      compilerPath: 'build-system/runner/dist/runner.jar',
      fileName: intermediateFilename,
      continueWithWarnings: false,
      tieredCompilation: true, // Magic speed up.
      compilerFlags: {
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
          'node_modules/',
          'build/patched-module/',
          'build/fake-module/',
          'build/fake-polyfills/',
        ],
        entry_point: entryModuleFilenames,
        process_common_js_modules: true,
        // This strips all files from the input set that aren't explicitly
        // required.
        only_closure_dependencies: true,
        output_wrapper: wrapper,
        create_source_map: intermediateFilename + '.map',
        source_map_location_mapping:
            '|' + sourceMapBase,
        warning_level: 'DEFAULT',
        // Turn off warning for "Unknown @define" since we use define to pass
        // args such as FORTESTING to our runner.
        jscomp_off: ['unknownDefines'],
        define,
        hide_warnings_for: hideWarningsFor,
        jscomp_error: [],
      },
    };

    // For now do type check separately
    if (argv.typecheck_only || checkTypes) {
      // Don't modify compilation_level to a lower level since
      // it won't do strict type checking if its whitespace only.
      compilerOptions.compilerFlags.define.push('TYPECHECK_ONLY=true');
      compilerOptions.compilerFlags.jscomp_error.push(
          'checkTypes',
          'accessControls',
          'const',
          'constantProperty',
          'globalThis');
      compilerOptions.compilerFlags.conformance_configs =
          'build-system/conformance-config.textproto';
    }

    if (compilerOptions.compilerFlags.define.length == 0) {
      delete compilerOptions.compilerFlags.define;
    }

    let stream = gulp.src(srcs)
        .pipe(closureCompiler(compilerOptions))
        .on('error', function(err) {
          console./* OK*/error(colors.red(
              'Compiler error for ' + outputFilename + ':\n') +
              formatClosureCompilerError(err.message));
          process.exit(1);
        });

    // If we're only doing type checking, no need to output the files.
    if (!argv.typecheck_only && !options.typeCheckOnly) {
      stream = stream
          .pipe(rename(outputFilename))
          .pipe(replace(/\$internalRuntimeVersion\$/g, internalRuntimeVersion, 'runtime-version'))
          .pipe(shortenLicense())
          .pipe(gulp.dest(outputDir))
          .on('end', function() {
            gulp.src(intermediateFilename + '.map')
                .pipe(rename(outputFilename + '.map'))
                .pipe(gulp.dest(outputDir))
                .on('end', resolve);
          });
    } else {
      stream = stream.on('end', resolve);
    }
    return stream;
  });
}
