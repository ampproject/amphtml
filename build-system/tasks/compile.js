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

var fs = require('fs-extra');
var argv = require('minimist')(process.argv.slice(2));
var closureCompiler = require('gulp-closure-compiler');
var gulp = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var util = require('gulp-util');
var internalRuntimeVersion = require('../internal-version').VERSION;
var internalRuntimeToken = require('../internal-version').TOKEN;
var rimraf = require('rimraf');

var isProdBuild = !!argv.type;
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
            if (process.env.TRAVIS) {
              // When printing simplified log in travis, use dot for each task.
              process.stdout.write('.');
            }
            inProgress--;
            next();
            resolve();
          }, function(e) {
            console./*OK*/error(util.colors.red('Compilation error',
                e.message));
            process.exit(1);
          });
    }
    function next() {
      if (!queue.length) {
        // When printing simplified log in travis, print EOF after
        // all closure compiling task are done.
        if (process.env.TRAVIS) {
          process.stdout.write('\n');
        }
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
}
exports.cleanupBuildDir = cleanupBuildDir;

function compile(entryModuleFilenames, outputDir,
    outputFilename, options) {
  return new Promise(function(resolve, reject) {
    var entryModuleFilename;
    if (entryModuleFilenames instanceof Array) {
      entryModuleFilename = entryModuleFilenames[0];
    } else {
      entryModuleFilename = entryModuleFilenames;
      entryModuleFilenames = [entryModuleFilename];
    }
    const checkTypes = options.checkTypes || argv.typecheck_only;
    var intermediateFilename = 'build/cc/' +
        entryModuleFilename.replace(/\//g, '_').replace(/^\./, '');
    // If undefined/null or false then we're ok executing the deletions
    // and mkdir.
    if (!options.preventRemoveAndMakeDir) {
      cleanupBuildDir();
    }
    var unneededFiles = [
      'build/fake-module/third_party/babel/custom-babel-helpers.js',
    ];
    var wrapper = '(function(){%output%})();';
    if (options.wrapper) {
      wrapper = options.wrapper.replace('<%= contents %>', '%output%');
    }
    wrapper += '\n//# sourceMappingURL=' + outputFilename + '.map\n';
    patchRegisterElement();
    if (fs.existsSync(intermediateFilename)) {
      fs.unlinkSync(intermediateFilename);
    }
    if (/development/.test(internalRuntimeToken)) {
      throw new Error('Should compile with a prod token');
    }
    var sourceMapBase = 'http://localhost:8000/';
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
      // Strange access/login related files.
      'build/all/v0/*.js',
      // A4A has these cross extension deps.
      'extensions/amp-ad-network*/**/*-config.js',
      'extensions/amp-ad/**/*.js',
      'extensions/amp-a4a/**/*.js',
      // Currently needed for crypto.js and visibility.js.
      // Should consider refactoring.
      'extensions/amp-analytics/**/*.js',
      // For amp-bind in the web worker (ww.js).
      'extensions/amp-bind/**/*.js',
      // Needed to access form impl from other extensions
      'extensions/amp-form/**/*.js',
      // Needed for AccessService
      'extensions/amp-access/**/*.js',
      // Needed to access UserNotificationManager from other extensions
      'extensions/amp-user-notification/**/*.js',
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
      'third_party/webcomponentsjs/ShadowCSS.js',
      'node_modules/promise-pjs/promise.js',
      'node_modules/web-animations-js/web-animations.install.js',
      'build/patched-module/document-register-element/build/' +
          'document-register-element.node.js',
      //'node_modules/core-js/modules/**.js',
      // Not sure what these files are, but they seem to duplicate code
      // one level below and confuse the compiler.
      '!node_modules/core-js/modules/library/**.js',
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
      var path = filename.replace(/\/[^/]+\.js$/, '/**/*.js');
      srcs.push(path);
    });
    if (options.extraGlobs) {
      srcs.push.apply(srcs, options.extraGlobs);
    }
    if (options.include3pDirectories) {
      srcs.push(
        '3p/**/*.js',
        'ads/**/*.js')
    }
    // Many files include the polyfills, but we only want to deliver them
    // once. Since all files automatically wait for the main binary to load
    // this works fine.
    if (options.includePolyfills) {
      srcs.push(
        '!build/fake-module/src/polyfills.js',
        '!build/fake-module/src/polyfills/**/*.js'
      );
    } else {
      srcs.push('!src/polyfills.js');
      unneededFiles.push('build/fake-module/src/polyfills.js');
    }
    unneededFiles.forEach(function(fake) {
      if (!fs.existsSync(fake)) {
        fs.writeFileSync(fake,
            '// Not needed in closure compiler\n' +
            'export function deadCode() {}');
      }
    });

    var externs = [
      'build-system/amp.extern.js',
      'third_party/closure-compiler/externs/intersection_observer.js',
      'third_party/closure-compiler/externs/performance_observer.js',
      'third_party/closure-compiler/externs/shadow_dom.js',
      'third_party/closure-compiler/externs/streams.js',
      'third_party/closure-compiler/externs/web_animations.js',
    ];
    if (options.externs) {
      externs = externs.concat(options.externs);
    }

    /*eslint "google-camelcase/google-camelcase": 0*/
    var compilerOptions = {
      // Temporary shipping with our own compiler that has a single patch
      // applied
      compilerPath: 'build-system/runner/dist/runner.jar',
      fileName: intermediateFilename,
      continueWithWarnings: false,
      tieredCompilation: true,  // Magic speed up.
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
        externs: externs,
        js_module_root: [
          'node_modules/',
          'build/patched-module/',
          'build/fake-module/',
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
        define: [],
        hide_warnings_for: [
          'third_party/caja/',
          'third_party/closure-library/sha384-generated.js',
          'third_party/d3/',
          'third_party/mustache/',
          'third_party/vega/',
          'third_party/webcomponentsjs/',
          'node_modules/',
          'build/patched-module/',
          // Can't seem to suppress `(0, win.eval)` suspicious code warning
          '3p/environment.js',
          // Generated code.
          'extensions/amp-access/0.1/access-expr-impl.js',
        ],
        jscomp_error: [],
      }
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

      // TODO(aghassemi): Remove when NTI is the default.
      if (argv.nti) {
        compilerOptions.compilerFlags.new_type_inf = true;
        compilerOptions.compilerFlags.jscomp_off.push(
          'newCheckTypesExtraChecks');
        compilerOptions.compilerFlags.externs.push(
          'build-system/amp.nti.extern.js'
        );
      } else {
        compilerOptions.compilerFlags.externs.push(
          'build-system/amp.oti.extern.js'
        );
      }
    }
    if (argv.pseudo_names) {
      compilerOptions.compilerFlags.define.push('PSEUDO_NAMES=true');
    }
    if (argv.fortesting) {
      compilerOptions.compilerFlags.define.push('FORTESTING=true');
    }

    if (compilerOptions.compilerFlags.define.length == 0) {
      delete compilerOptions.compilerFlags.define;
    }

    var stream = gulp.src(srcs)
        .pipe(closureCompiler(compilerOptions))
        .on('error', function(err) {
          console./*OK*/error(util.colors.red('Error compiling',
              entryModuleFilenames));
          console./*OK*/error(util.colors.red(err.message));
          process.exit(1);
        });

    // If we're only doing type checking, no need to output the files.
    if (!argv.typecheck_only) {
      stream = stream
        .pipe(rename(outputFilename))
        .pipe(replace(/\$internalRuntimeVersion\$/g, internalRuntimeVersion))
        .pipe(replace(/\$internalRuntimeToken\$/g, internalRuntimeToken))
        .pipe(gulp.dest(outputDir))
        .on('end', function() {
          gulp.src(intermediateFilename + '.map')
              .pipe(rename(outputFilename + '.map'))
              .pipe(gulp.dest(outputDir))
              .on('end', resolve);
        });
    }
    return stream;
  });
};

function patchRegisterElement() {
  var file;
  // Copies document-register-element into a new file that has an export.
  // This works around a bug in closure compiler, where without the
  // export this module does not generate a goog.provide which fails
  // compilation.
  // Details https://github.com/google/closure-compiler/issues/1831
  const patchedName = 'build/patched-module/document-register-element' +
      '/build/document-register-element.node.js';
  if (!fs.existsSync(patchedName)) {
    file = fs.readFileSync(
        'node_modules/document-register-element/build/' +
        'document-register-element.node.js').toString();
    if (argv.fortesting) {
      // Need to switch global to self since closure doesn't wrap the module
      // like CommonJS
      file = file.replace('installCustomElements(global);',
          'installCustomElements(self);');
    } else {
      // Get rid of the side effect the module has so we can tree shake it
      // better and control installation, unless --fortesting flag
      // is passed since we also treat `--fortesting` mode as "dev".
      file = file.replace('installCustomElements(global);', '');
    }
    // Closure Compiler does not generate a `default` property even though
    // to interop CommonJS and ES6 modules. This is the same issue typescript
    // ran into here https://github.com/Microsoft/TypeScript/issues/2719
    file = file.replace('module.exports = installCustomElements;',
        'exports.default = installCustomElements;');
    fs.writeFileSync(patchedName, file);
  }
}
