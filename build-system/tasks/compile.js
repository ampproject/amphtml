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

var closureCompiler = require('gulp-closure-compiler');
var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

// Compiles AMP with the closure compiler. This is intended only for
// production use. During development we intent to continue using
// babel, as it has much faster incremental compilation.
// This currently only works for the main AMP JS binary, but should be
// straight forward to extend to the rest of our code base.
gulp.task('compile', function() {
  /*eslint "google-camelcase/google-camelcase": 0*/
  return gulp.src([
    'ads/**/*.js',
    'extensions/**/*.js',
    'build/css.js',
    'src/**/*.js',
    // We do not want to load the entry point that loads the babel helpers.
    '!src/amp-babel.js',
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
    fileName: 'build/cc-amp.js',
    compilerFlags: {
      // Transpile from ES6 to ES5.
      language_in: 'ECMASCRIPT6',
      language_out: 'ECMASCRIPT5',
      js_module_root: 'node_modules/',
      common_js_entry_module: 'src/amp.js',
      process_common_js_modules: true,
      // This strips all files from the input set that aren't explicitly
      // required.
      only_closure_dependencies: true,
      output_wrapper: '(function(){var process={env:{}};%output%})();'
    }
  }))
  .on('error', function(err) {
    if (/0 error\(s\)/.test(err.message)) {
      // emit warning
      console./*OK*/warn(err.message);
      this.emit('end');
    } else {
      throw err;
    }
  })
  .on('end', function() {
    console./*OK*/log('Minify closure compiler result');
    // Somewhat ironically we use uglify to further minify the result.
    // This is needed because we currently use only very basic optimizations
    // in closure compiler and it doesn't minify global variables at this
    // stage.
    return gulp.src(['build/cc-amp.js'])
        .pipe(uglify({
          preserveComments: 'some'
        }))
        .pipe(rename('cc-v0.js'))
        .pipe(gulp.dest('dist'))
  });
});
