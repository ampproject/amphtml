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

const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const colors = require('ansi-colors');
const file = require('gulp-file');
const fs = require('fs-extra');
const gulp = require('gulp');
const gulpWatch = require('gulp-watch');
const lazypipe = require('lazypipe');
const log = require('fancy-log');
const path = require('path');
const regexpSourcemaps = require('gulp-regexp-sourcemaps');
const rename = require('gulp-rename');
const rimraf = require('rimraf');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const touch = require('touch');
const watchify = require('watchify');
const wrappers = require('../compile-wrappers');
const {applyConfig, removeConfig} = require('./prepend-global/index.js');
const {closureCompile} = require('../compile/compile');
const {isTravisBuild} = require('../travis');
const {thirdPartyFrames} = require('../config');
const {transpileTs} = require('../typescript');
const {VERSION: internalRuntimeVersion} = require('../internal-version') ;

const {green, red, cyan} = colors;
const argv = require('minimist')(process.argv.slice(2));

/**
 * Tasks that should print the `--nobuild` help text.
 * @private @const {!Set<string>}
 */
const NOBUILD_HELP_TASKS = new Set(['test', 'visual-diff']);

const MODULE_SEPARATOR = ';';
const EXTENSION_BUNDLE_MAP = {
  'amp-viz-vega.js': [
    'third_party/d3/d3.js',
    'third_party/d3-geo-projection/d3-geo-projection.js',
    'third_party/vega/vega.js',
  ],
  'amp-inputmask.js': [
    'third_party/inputmask/bundle.js',
  ],
};

const hostname = argv.hostname || 'cdn.ampproject.org';
const hostname3p = argv.hostname3p || '3p.ampproject.net';

/**
 * Compile and optionally minify the stylesheets and the scripts
 * and drop them in the dist folder
 *
 * @param {boolean} watch
 * @param {boolean} shouldMinify
 * @param {boolean=} opt_preventRemoveAndMakeDir
 * @param {boolean=} opt_checkTypes
 * @return {!Promise}
 */
function compile(watch, shouldMinify, opt_preventRemoveAndMakeDir,
  opt_checkTypes) {
  const promises = [
    compileJs('./3p/', 'integration.js',
        './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'), {
          minifiedName: 'f.js',
          checkTypes: opt_checkTypes,
          watch,
          minify: shouldMinify,
          preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
          externs: ['./ads/ads.extern.js'],
          include3pDirectories: true,
          includePolyfills: true,
        }),
    compileJs('./3p/', 'ampcontext-lib.js',
        './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'), {
          minifiedName: 'ampcontext-v0.js',
          checkTypes: opt_checkTypes,
          watch,
          minify: shouldMinify,
          preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
          externs: ['./ads/ads.extern.js'],
          include3pDirectories: true,
          includePolyfills: false,
        }),
    compileJs('./3p/', 'iframe-transport-client-lib.js',
        './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'), {
          minifiedName: 'iframe-transport-client-v0.js',
          checkTypes: opt_checkTypes,
          watch,
          minify: shouldMinify,
          preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
          externs: ['./ads/ads.extern.js'],
          include3pDirectories: true,
          includePolyfills: false,
        }),
    compileJs('./3p/', 'recaptcha.js',
        './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'), {
          minifiedName: 'recaptcha.js',
          checkTypes: opt_checkTypes,
          watch,
          minify: shouldMinify,
          preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
          externs: [],
          include3pDirectories: true,
          includePolyfills: true,
        }),
    compileJs('./src/', 'amp.js', './dist', {
      toName: 'amp.js',
      minifiedName: 'v0.js',
      includePolyfills: true,
      checkTypes: opt_checkTypes,
      watch,
      preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
      minify: shouldMinify,
      wrapper: wrappers.mainBinary,
      singlePassCompilation: argv.single_pass,
      esmPassCompilation: argv.esm,
    }),
    compileJs('./extensions/amp-viewer-integration/0.1/examples/',
        'amp-viewer-host.js', './dist/v0/examples', {
          toName: 'amp-viewer-host.max.js',
          minifiedName: 'amp-viewer-host.js',
          incudePolyfills: true,
          watch,
          extraGlobs: ['extensions/amp-viewer-integration/**/*.js'],
          compilationLevel: 'WHITESPACE_ONLY',
          preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
          minify: false,
        }),
  ];

  // TODO(#18934, erwinm): temporarily commented out to unblock master builds.
  // theres a race condition between the read to amp.js here, and on the
  // main v0.js compile above.
  /**
  if (!argv.single_pass) {
    promises.push(
        compileJs('./src/', 'amp.js', './dist', {
          toName: 'amp-esm.js',
          minifiedName: 'v0-esm.js',
          includePolyfills: true,
          includeOnlyESMLevelPolyfills: true,
          checkTypes: opt_checkTypes,
          watch,
          preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
          minify: shouldMinify,
          wrapper: wrappers.mainBinary,
        }));
  }*/

  // We don't rerun type check for the shadow entry point for now.
  if (!opt_checkTypes) {
    if (!argv.single_pass && (!watch || argv.with_shadow)) {
      promises.push(
          compileJs('./src/', 'amp-shadow.js', './dist', {
            minifiedName: 'shadow-v0.js',
            includePolyfills: true,
            checkTypes: opt_checkTypes,
            watch,
            preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
            minify: shouldMinify,
          })
      );
    }

    if (!watch || argv.with_video_iframe_integration) {
      promises.push(
          compileJs('./src/', 'video-iframe-integration.js', './dist', {
            minifiedName: 'video-iframe-integration-v0.js',
            includePolyfills: false,
            checkTypes: opt_checkTypes,
            watch,
            preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
            minify: shouldMinify,
          }));
    }

    if (!watch || argv.with_inabox) {
      if (!argv.single_pass) {
        promises.push(
            // Entry point for inabox runtime.
            compileJs('./src/inabox/', 'amp-inabox.js', './dist', {
              toName: 'amp-inabox.js',
              minifiedName: 'amp4ads-v0.js',
              includePolyfills: true,
              extraGlobs: ['src/inabox/*.js', '3p/iframe-messaging-client.js'],
              checkTypes: opt_checkTypes,
              watch,
              preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
              minify: shouldMinify,
            }));
      }
      promises.push(

          // inabox-host
          compileJs('./ads/inabox/', 'inabox-host.js', './dist', {
            toName: 'amp-inabox-host.js',
            minifiedName: 'amp4ads-host-v0.js',
            includePolyfills: false,
            checkTypes: opt_checkTypes,
            watch,
            preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
            minify: shouldMinify,
          })
      );
    }

    if (argv.with_inabox_lite) {
      promises.push(
          // Entry point for inabox runtime.
          compileJs('./src/inabox/', 'amp-inabox-lite.js', './dist', {
            toName: 'amp-inabox-lite.js',
            minifiedName: 'amp4ads-lite-v0.js',
            includePolyfills: true,
            extraGlobs: ['src/inabox/*.js', '3p/iframe-messaging-client.js'],
            checkTypes: opt_checkTypes,
            watch,
            preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
            minify: shouldMinify,
          }));
    }

    thirdPartyFrames.forEach(frameObject => {
      promises.push(
          thirdPartyBootstrap(
              frameObject.max, frameObject.min, shouldMinify)
      );
    });

    if (watch) {
      thirdPartyFrames.forEach(frameObject => {
        gulpWatch(frameObject.max, function() {
          thirdPartyBootstrap(
              frameObject.max, frameObject.min, shouldMinify);
        });
      });
    }

    return Promise.all(promises);
  }
}

/**
 * Allows (ap|pre)pending to the already compiled, minified JS file
 *
 * @param {string} srcFilename Name of the JS source file
 * @param {string} destFilePath File path to the compiled JS file
 */
function appendToCompiledFile(srcFilename, destFilePath) {
  const bundleFiles = EXTENSION_BUNDLE_MAP[srcFilename];
  if (bundleFiles) {
    const newSource = concatFilesToString(bundleFiles.concat([destFilePath]));
    fs.writeFileSync(destFilePath, newSource, 'utf8');
  } else if (srcFilename == 'amp-date-picker.js') {
    // For amp-date-picker, we inject the react-dates bundle after compile
    // to avoid CC from messing with browserify's module boilerplate.
    const file = fs.readFileSync(destFilePath, 'utf8');
    const firstLineBreak = file.indexOf('\n');
    const wrapperOpen = file.substr(0, firstLineBreak + 1);
    const reactDates = fs.readFileSync(
        'third_party/react-dates/bundle.js', 'utf8');
    // Inject the bundle inside the standard AMP wrapper (after the first line).
    const newSource = [
      wrapperOpen, reactDates, file.substr(firstLineBreak + 1),
    ].join('\n');
    fs.writeFileSync(destFilePath, newSource, 'utf8');
  }
}

/**
 * Bundles (max) or compiles (min) a given JavaScript file entry point.
 *
 * If `options.typeScript` is true, transpiles from TypeScript into
 * intermediary files before compilation and deletes them afterwards.
 *
 * @param {string} srcDir Path to the src directory
 * @param {string} srcFilename Name of the JS source file
 * @param {string} destDir Destination folder for output script
 * @param {?Object} options
 * @return {!Promise}
 */
function compileJs(srcDir, srcFilename, destDir, options) {
  options = options || {};

  const entryPoint = path.join(srcDir, srcFilename);

  // Transpile TS to Closure-annotated JS before actual bundling or compile.
  if (options.typeScript) {
    const startTime = Date.now();
    transpileTs(srcDir, srcFilename);
    endBuildStep('Transpiled', srcFilename, startTime);
  }

  if (options.minify) {
    const startTime = Date.now();
    return closureCompile(entryPoint, destDir, options.minifiedName, options)
        .then(function() {
          const destPath = path.join(destDir, options.minifiedName);
          appendToCompiledFile(srcFilename, destPath);
          fs.writeFileSync(
              path.join(destDir, 'version.txt'), internalRuntimeVersion);
          if (options.latestName) {
            fs.copySync(
                destPath,
                path.join(destDir, options.latestName));
          }
        })
        .then(() => {
          let name = options.minifiedName;
          if (options.latestName) {
            name = `${name} → ${options.latestName}`;
          }
          endBuildStep('Minified', name, startTime);

          // Remove intemediary, transpiled JS files after compilation.
          if (options.typeScript) {
            rimraf.sync(path.join(srcDir, '**/*.js'));
          }
        });
  }

  let bundler = browserify(entryPoint, {debug: true}).transform(babelify);
  if (options.watch) {
    bundler = watchify(bundler);
  }

  // Default wrapper for `gulp build`.
  // We don't need an explicit function wrapper like we do for `gulp dist`
  // because Babel handles that for you.
  const wrapper = options.wrapper || wrappers.none;
  const devWrapper = wrapper.replace('<%= contents %>', '$1');

  const lazybuild = lazypipe()
      .pipe(source, srcFilename)
      .pipe(buffer)
      .pipe(sourcemaps.init.bind(sourcemaps), {loadMaps: true})
      .pipe(regexpSourcemaps, /\$internalRuntimeVersion\$/g, internalRuntimeVersion, 'runtime-version')
      .pipe(regexpSourcemaps, /([^]+)/, devWrapper, 'wrapper');

  const lazywrite = lazypipe()
      .pipe(sourcemaps.write.bind(sourcemaps), './')
      .pipe(gulp.dest.bind(gulp), destDir);

  const destFilename = options.toName || srcFilename;
  /**
   * @param {boolean} failOnError
   * @return {Promise}
   */
  function rebundle(failOnError) {
    const startTime = Date.now();
    return toPromise(
        bundler.bundle()
            .on('error', function(err) {
              let message = err;
              if (err.stack) {
                // Drop the node_modules call stack, which begins with '    at'.
                message = err.stack.replace(/    at[^]*/, '').trim();
              }
              console.error(red(message));
              if (failOnError) {
                process.exit(1);
              } else {
                endBuildStep('Error while compiling', srcFilename, startTime);
              }
            })
            .pipe(lazybuild())
            .pipe(rename(destFilename))
            .pipe(lazywrite())
            .on('end', function() {
              appendToCompiledFile(srcFilename,
                  path.join(destDir, destFilename));

              if (options.latestName) {
                // "amp-foo-latest.js" -> "amp-foo-latest.max.js"
                const latestMaxName =
                    options.latestName.split('.js')[0] + '.max.js';
                // Copy amp-foo-0.1.js to amp-foo-latest.max.js.
                fs.copySync(
                    path.join(destDir, options.toName),
                    path.join(destDir, latestMaxName));
              }
            }))
        .then(() => {
          let name = destFilename;
          if (options.latestName) {
            const latestMaxName =
                options.latestName.split('.js')[0] + '.max.js';
            name = `${name} → ${latestMaxName}`;
          }
          endBuildStep('Compiled', name, startTime);

          // Remove intemediary, transpiled JS files after compilation.
          if (options.typeScript) {
            rimraf.sync(path.join(srcDir, '**/*.js'));
          }
        })
        .then(() => {
          if (process.env.NODE_ENV === 'development') {
            if (destFilename === 'amp.js') {
              return enableLocalTesting('dist/amp.js');
            } else if (destFilename === 'amp-esm.js') {
              return enableLocalTesting('dist/amp-esm.js');
            } else if (destFilename === 'amp4ads-v0.js') {
              return enableLocalTesting('dist/amp4ads-v0.js');
            } else if (destFilename === 'integration.js') {
              return enableLocalTesting('dist.3p/current/integration.js');
            } else if (destFilename === 'amp-shadow.js') {
              return enableLocalTesting('dist/amp-shadow.js');
            } else if (destFilename === 'amp-inabox.js') {
              return enableLocalTesting('dist/amp-inabox.js');
            } else {
              return Promise.resolve();
            }
          } else {
            return Promise.resolve();
          }
        });
  }

  if (options.watch) {
    bundler.on('update', function() {
      rebundle(/* failOnError */ false);
      // Touch file in unit test set. This triggers rebundling of tests because
      // karma only considers changes to tests files themselves re-bundle
      // worthy.
      touch('test/_init_tests.js');
    });
  }

  if (options.watch === false) {
    // Due to the two step build process, compileJs() is called twice, once with
    // options.watch set to true and, once with it set to false. However, we do
    // not need to call rebundle() twice. This avoids the duplicate compile seen
    // when you run `gulp watch` and touch a file.
    return Promise.resolve();
  } else {
    // This is the default options.watch === true case, and also covers the
    // `gulp build` / `gulp dist` cases where options.watch is undefined.
    return rebundle(/* failOnError */ true);
  }
}

/**
 * Stops the timer for the given build step and prints the execution time,
 * unless we are on Travis.
 * @param {string} stepName Name of the action, like 'Compiled' or 'Minified'
 * @param {string} targetName Name of the target, like a filename or path
 * @param {DOMHighResTimeStamp} startTime Start time of build step
 */
function endBuildStep(stepName, targetName, startTime) {
  const endTime = Date.now();
  const executionTime = new Date(endTime - startTime);
  const secs = executionTime.getSeconds();
  const ms = ('000' + executionTime.getMilliseconds().toString()).slice(-3);
  let timeString = '(';
  if (secs === 0) {
    timeString += ms + ' ms)';
  } else {
    timeString += secs + '.' + ms + ' s)';
  }
  if (!isTravisBuild()) {
    log(stepName, cyan(targetName), green(timeString));
  }
}

/**
 * Prints a helpful message that lets the developer know how to switch configs.
 * @param {string} command Command being run.
 */
function printConfigHelp(command) {
  if (!isTravisBuild()) {
    log(green('Building version'), cyan(internalRuntimeVersion),
        green('of the runtime for local testing with the'),
        cyan((argv.config === 'canary') ? 'canary' : 'prod'),
        green('AMP config.'));
    log(green('⤷ Use'), cyan('--config={canary|prod}'), green('with your'),
        cyan(command), green('command to specify which config to apply.'));
  }
}

/**
 * Prints a message that could help speed up local development.
 */
function printNobuildHelp() {
  if (!isTravisBuild()) {
    for (const task of NOBUILD_HELP_TASKS) { // eslint-disable-line amphtml-internal/no-for-of-statement
      if (argv._.includes(task)) {
        log(green('To skip building during future'), cyan(task),
            green('runs, use'), cyan('--nobuild'), green('with your'),
            cyan(`gulp ${task}`), green('command.'));
        return;
      }
    }
  }
}

/**
 * Enables runtime to be used for local testing by writing AMP_CONFIG to file.
 * Called at the end of "gulp build" and "gulp dist --fortesting".
 * @param {string} targetFile File to which the config is to be written.
 */
async function enableLocalTesting(targetFile) {
  const config = (argv.config === 'canary') ? 'canary' : 'prod';
  const baseConfigFile =
      'build-system/global-configs/' + config + '-config.json';

  return removeConfig(targetFile).then(() => {
    return applyConfig(
        config, targetFile, baseConfigFile,
        /* opt_localDev */ true, /* opt_localBranch */ true,
        /* opt_branch */ false, /* opt_fortesting */ !!argv.fortesting);
  });
}

/**
 * Synchronously concatenates the given files into a string.
 *
 * @param {Array<string>} files A list of file paths.
 * @return {string} The concatenated contents of the given files.
 */
function concatFilesToString(files) {
  return files.map(function(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }).join(MODULE_SEPARATOR);
}

/**
 * Copies frame.html to output folder, replaces js references to minified
 * copies, and generates symlink to it.
 *
 * @param {string} input
 * @param {string} outputName
 * @param {boolean} shouldMinify
 * @return {!Promise}
 */
function thirdPartyBootstrap(input, outputName, shouldMinify) {
  const startTime = Date.now();
  if (!shouldMinify) {
    return toPromise(gulp.src(input)
        .pipe(gulp.dest('dist.3p/current')))
        .then(() => {
          endBuildStep('Processed', input, startTime);
        });
  }

  // By default we use an absolute URL, that is independent of the
  // actual frame host for the JS inside the frame.
  // But during testing we need a relative reference because the
  // version is not available on the absolute path.
  const integrationJs = argv.fortesting
    ? './f.js'
    : `https://${hostname3p}/${internalRuntimeVersion}/f.js`;
  // Convert default relative URL to absolute min URL.
  const html = fs.readFileSync(input, 'utf8')
      .replace(/\.\/integration\.js/g, integrationJs);
  return toPromise(file(outputName, html, {src: true})
      .pipe(gulp.dest('dist.3p/' + internalRuntimeVersion))
      .on('end', function() {
        const aliasToLatestBuild = 'dist.3p/current-min';
        if (fs.existsSync(aliasToLatestBuild)) {
          fs.unlinkSync(aliasToLatestBuild);
        }
        fs.symlinkSync(
            './' + internalRuntimeVersion,
            aliasToLatestBuild,
            'dir');
      }))
      .then(() => {
        endBuildStep('Processed', input, startTime);
      });
}

/**
 * Build all the AMP experiments.html/js.
 *
 * @param {!Object} options
 */
async function buildExperiments(options) {
  options = options || {};
  const path = 'tools/experiments';
  const htmlPath = path + '/experiments.html';
  const jsPath = path + '/experiments.js';
  let {watch} = options;
  if (watch === undefined) {
    watch = argv.watch || argv.w;
  }

  // Building extensions is a 2 step process because of the renaming
  // and CSS inlining. This watcher watches the original file, copies
  // it to the destination and adds the CSS.
  if (watch) {
    // Do not set watchers again when we get called by the watcher.
    const copy = Object.create(options);
    copy.watch = false;
    gulpWatch(path + '/*', function() {
      buildExperiments(copy);
    });
  }

  // Build HTML.
  const html = fs.readFileSync(htmlPath, 'utf8');
  const minHtml = html.replace('/dist.tools/experiments/experiments.js',
      `https://${hostname}/v0/experiments.js`);
  gulp.src(htmlPath)
      .pipe(file('experiments.cdn.html', minHtml))
      .pipe(gulp.dest('dist.tools/experiments/'));

  // Build JS.
  const js = fs.readFileSync(jsPath, 'utf8');
  const builtName = 'experiments.max.js';
  const minifiedName = 'experiments.js';
  return toPromise(gulp.src(path + '/*.js')
      .pipe(file(builtName, js))
      .pipe(gulp.dest('build/experiments/')))
      .then(function() {
        return compileJs(
            './build/experiments/', builtName, './dist.tools/experiments/', {
              watch: false,
              minify: options.minify || argv.minify,
              includePolyfills: true,
              minifiedName,
              preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
              checkTypes: options.checkTypes,
            });
      });
}

/**
 * Build ALP JS.
 *
 * @param {!Object} options
 */
function buildAlp(options) {
  options = options || {};
  return compileJs('./ads/alp/', 'install-alp.js', './dist/', {
    toName: 'alp.max.js',
    watch: options.watch,
    minify: options.minify || argv.minify,
    includePolyfills: true,
    minifiedName: 'alp.js',
    preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
  });
}

/**
 * Build Examiner JS.
 *
 * @param {!Object} options
 */
function buildExaminer(options) {
  options = options || {};
  return compileJs('./src/examiner/', 'examiner.js', './dist/', {
    toName: 'examiner.max.js',
    watch: options.watch,
    minify: options.minify || argv.minify,
    includePolyfills: true,
    minifiedName: 'examiner.js',
    preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
  });
}

/**
 * Build web worker JS.
 *
 * @param {!Object} options
 */
function buildWebWorker(options) {
  const opts = Object.assign({}, options);
  return compileJs('./src/web-worker/', 'web-worker.js', './dist/', {
    toName: 'ww.max.js',
    minifiedName: 'ww.js',
    includePolyfills: true,
    watch: opts.watch,
    minify: opts.minify || argv.minify,
    preventRemoveAndMakeDir: opts.preventRemoveAndMakeDir,
  });
}

/**
 *Creates directory in sync manner
 *
 * @param {string} path
 */
function mkdirSync(path) {
  try {
    fs.mkdirSync(path);
  } catch (e) {
    if (e.code != 'EEXIST') {
      throw e;
    }
  }
}

/**
 * Returns a promise for readable
 *
 * @param {*} readable
 * @return {Promise}
 */
function toPromise(readable) {
  return new Promise(function(resolve, reject) {
    readable.on('error', reject).on('end', resolve);
  });
}

module.exports = {
  buildAlp,
  buildExaminer,
  buildExperiments,
  buildWebWorker,
  compile,
  compileJs,
  enableLocalTesting,
  endBuildStep,
  hostname,
  mkdirSync,
  printConfigHelp,
  printNobuildHelp,
  toPromise,
};
