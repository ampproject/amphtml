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

var fs = require('fs-extra');
var closureCompiler = require('gulp-closure-compiler');
var gulp = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var internalRuntimeVersion = require('../internal-version').VERSION;

var queue = [];
var inProgress = 0;
var MAX_PARALLEL_CLOSURE_INVOCATIONS = 4;

// Compiles AMP with the closure compiler. This is intended only for
// production use. During development we intent to continue using
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
            inProgress--;
            next();
            resolve();
          }, function(e) {
            console./*OK*/error('Compilation error', e.message);
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

function compile(entryModuleFilename, outputDir,
    outputFilename, options) {
  return new Promise(function(resolve, reject) {
    var intermediateFilename = 'build/cc/' +
        entryModuleFilename.replace(/\//g, '_').replace(/^\./, '');
    console./*OK*/log('Starting closure compiler for ', entryModuleFilename);
    fs.mkdirsSync('build/cc');
    fs.mkdirsSync('build/fake-module/third_party/babel');
    fs.writeFileSync(
        'build/fake-module/third_party/babel/custom-babel-helpers.js',
        '// Not needed in closure compiler\n');
    var wrapper = '(function(){var process={env:{}};%output%})();';
    if (options.wrapper) {
      wrapper = options.wrapper.replace('<%= contents %>',
          'var process={env:{}};%output%');
    }
    wrapper += '\n//# sourceMappingURL=' +
        outputFilename + '.map\n';
    if (fs.existsSync(intermediateFilename)) {
      fs.unlinkSync(intermediateFilename);
    }
    /*eslint "google-camelcase/google-camelcase": 0*/
    return gulp.src([
      '3p/**/*.js',
      'ads/**/*.js',
      'extensions/**/*.js',
      'build/**/*.js',
      '!build/cc/**',
      '!build/polyfills.js',
      'src/**/*.js',
      '!third_party/babel/custom-babel-helpers.js',
      // Exclude since it's not part of the runtime/extension binaries.
      '!extensions/amp-access/0.1/amp-login-done.js',
      'builtins/**.js',
      'third_party/caja/html-sanitizer.js',
      'third_party/closure-library/sha384-generated.js',
      'third_party/mustache/**/*.js',
      'node_modules/document-register-element/build/' +
          'document-register-element.max.js',
      'node_modules/core-js/modules/**.js',
      // Not sure what these files are, but they seem to duplicate code
      // one level below and confuse the compiler.
      '!node_modules/core-js/modules/library/**.js',
      // Don't include tests.
      '!**_test.js',
      '!**/test-*.js',
    ])
    .pipe(closureCompiler({
      // Temporary shipping with our own compiler that has a single patch
      // applied
      compilerPath: 'third_party/closure-compiler/compiler.jar',
      fileName: intermediateFilename,
      continueWithWarnings: true,
      tieredCompilation: true,  // Magic speed up.
      compilerFlags: {
        // Custom compilation level. Trying to land this in the core
        // compiler.
        compilation_level: 'SIMPLE_PLUS_OPTIMIZATIONS',
        // Transpile from ES6 to ES5.
        language_in: 'ECMASCRIPT6',
        language_out: 'ECMASCRIPT5',
        js_module_root: ['node_modules/', 'build/fake-module/'],
        common_js_entry_module: entryModuleFilename,
        process_common_js_modules: true,
        // This strips all files from the input set that aren't explicitly
        // required.
        only_closure_dependencies: true,
        output_wrapper: wrapper,
        create_source_map: intermediateFilename + '.map',
        source_map_location_mapping: '|http://localhost:8000/',
        warning_level: process.env.TRAVIS ? 'QUIET' : 'DEFAULT',
      }
    }))
    .on('error', function(err) {
      console./*OK*/error(err.message);
      process.exit(1);
    })
    .pipe(rename(outputFilename))
    .pipe(replace(/\$internalRuntimeVersion\$/g, internalRuntimeVersion))
    .pipe(gulp.dest(outputDir))
    .on('end', function() {
      console./*OK*/log('Compiled ', entryModuleFilename, 'to',
          outputDir + '/' + outputFilename, 'via', intermediateFilename);
      gulp.src(intermediateFilename + '.map')
          .pipe(rename(outputFilename + '.map'))
          .pipe(gulp.dest(outputDir))
          .on('end', resolve);
    });
  });
};
