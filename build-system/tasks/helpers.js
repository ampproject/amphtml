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
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const debounce = require('debounce');
const del = require('del');
const file = require('gulp-file');
const fs = require('fs-extra');
const gulp = require('gulp');
const log = require('fancy-log');
const path = require('path');
const regexpSourcemaps = require('gulp-regexp-sourcemaps');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const watchify = require('watchify');
const wrappers = require('../compile/compile-wrappers');
const {
  VERSION: internalRuntimeVersion,
} = require('../compile/internal-version');
const {applyConfig, removeConfig} = require('./prepend-global/index.js');
const {closureCompile} = require('../compile/compile');
const {EventEmitter} = require('events');
const {green, red, cyan} = require('ansi-colors');
const {isTravisBuild} = require('../common/travis');
const {jsBundles} = require('../compile/bundles.config');
const {thirdPartyFrames} = require('../test-configs/config');
const {transpileTs} = require('../compile/typescript');
const {watch: gulpWatch} = require('gulp');

/**
 * Tasks that should print the `--nobuild` help text.
 * @private @const {!Set<string>}
 */
const NOBUILD_HELP_TASKS = new Set(['e2e', 'integration', 'visual-diff']);

/**
 * Used during minification to concatenate modules
 */
const MODULE_SEPARATOR = ';';

/**
 * Used during minification to concatenate extension bundles
 */
const EXTENSION_BUNDLE_MAP = {
  'amp-viz-vega.js': [
    'third_party/d3/d3.js',
    'third_party/d3-geo-projection/d3-geo-projection.js',
    'third_party/vega/vega.js',
  ],
  'amp-inputmask.js': ['third_party/inputmask/bundle.js'],
};

/**
 * List of unminified targets to which AMP_CONFIG should be written
 */
const UNMINIFIED_TARGETS = ['alp.max', 'amp-inabox', 'amp-shadow', 'amp'];

/**
 * List of minified targets to which AMP_CONFIG should be written
 */
const MINIFIED_TARGETS = ['alp', 'amp4ads-v0', 'shadow-v0', 'v0'];

/**
 * Used while building the 3p frame
 **/
const hostname3p = argv.hostname3p || '3p.ampproject.net';

/**
 * Used to debounce file edits during watch to prevent races.
 */
const watchDebounceDelay = 1000;

/**
 * @param {!Object} jsBundles
 * @param {string} name
 * @param {?Object} extraOptions
 * @return {!Promise}
 */
function doBuildJs(jsBundles, name, extraOptions) {
  const target = jsBundles[name];
  if (target) {
    return compileJs(
      target.srcDir,
      target.srcFilename,
      extraOptions.minify ? target.minifiedDestDir : target.destDir,
      {...target.options, ...extraOptions}
    );
  } else {
    return Promise.reject(red('Error:'), 'Could not find', cyan(name));
  }
}

/**
 * Generates frames.html
 *
 * @param {!Object} options
 */
async function bootstrapThirdPartyFrames(options) {
  const startTime = Date.now();
  const promises = [];
  const {watch, minify} = options;
  thirdPartyFrames.forEach((frameObject) => {
    promises.push(
      thirdPartyBootstrap(frameObject.max, frameObject.min, options)
    );
  });
  if (watch) {
    thirdPartyFrames.forEach((frameObject) => {
      const watchFunc = () => {
        thirdPartyBootstrap(frameObject.max, frameObject.min, options);
      };
      gulpWatch(frameObject.max).on(
        'change',
        debounce(watchFunc, watchDebounceDelay)
      );
    });
  }
  await Promise.all(promises);
  endBuildStep(
    'Bootstrapped 3p frames into',
    `dist.3p/${minify ? internalRuntimeVersion : 'current'}/`,
    startTime
  );
}

/**
 * Compile and optionally minify the core runtime.
 *
 * @param {!Object} options
 */
async function compileCoreRuntime(options) {
  await doBuildJs(jsBundles, 'amp.js', options);
}

/**
 * Compile and optionally minify the stylesheets and the scripts for the runtime
 * and drop them in the dist folder
 *
 * @param {!Object} options
 * @return {!Promise}
 */
async function compileAllJs(options) {
  const {minify} = options;
  if (minify) {
    log('Minifying multi-pass JS with', cyan('closure-compiler') + '...');
  } else {
    log('Compiling JS with', cyan('browserify') + '...');
  }
  const startTime = Date.now();
  await Promise.all([
    minify ? Promise.resolve() : doBuildJs(jsBundles, 'polyfills.js', options),
    doBuildJs(jsBundles, 'alp.max.js', options),
    doBuildJs(jsBundles, 'examiner.max.js', options),
    doBuildJs(jsBundles, 'ww.max.js', options),
    doBuildJs(jsBundles, 'integration.js', options),
    doBuildJs(jsBundles, 'ampcontext-lib.js', options),
    doBuildJs(jsBundles, 'iframe-transport-client-lib.js', options),
    doBuildJs(jsBundles, 'recaptcha.js', options),
    doBuildJs(jsBundles, 'amp-viewer-host.max.js', options),
    doBuildJs(jsBundles, 'video-iframe-integration.js', options),
    doBuildJs(jsBundles, 'amp-story-entry-point.js', options),
    doBuildJs(jsBundles, 'amp-story-player.js', options),
    doBuildJs(jsBundles, 'amp-inabox-host.js', options),
    doBuildJs(jsBundles, 'amp-shadow.js', options),
    doBuildJs(jsBundles, 'amp-inabox.js', options),
  ]);
  await compileCoreRuntime(options);
  endBuildStep(
    minify ? 'Minified' : 'Compiled',
    'all runtime JS files',
    startTime
  );
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
      'third_party/react-dates/bundle.js',
      'utf8'
    );
    // Inject the bundle inside the standard AMP wrapper (after the first line).
    const newSource = [
      wrapperOpen,
      reactDates,
      file.substr(firstLineBreak + 1),
    ].join('\n');
    fs.writeFileSync(destFilePath, newSource, 'utf8');
  }
}

function toEsmName(name) {
  return name.replace(/\.js$/, '.mjs');
}

function maybeToEsmName(name) {
  return argv.esm ? toEsmName(name) : name;
}

/**
 * Minifies a given JavaScript file entry point.
 * @param {string} srcDir
 * @param {string} srcFilename
 * @param {string} destDir
 * @param {?Object} options
 * @return {!Promise}
 */
async function compileMinifiedJs(srcDir, srcFilename, destDir, options) {
  const timeInfo = {};
  const entryPoint = path.join(srcDir, srcFilename);
  const minifiedName = maybeToEsmName(options.minifiedName);

  if (options.watch) {
    const watchFunc = async () => {
      const compileComplete = await doCompileMinifiedJs(
        /* continueOnError */ true
      );
      if (options.onWatchBuild) {
        options.onWatchBuild(compileComplete);
      }
    };
    gulpWatch(entryPoint).on('change', debounce(watchFunc, watchDebounceDelay));
  }

  async function doCompileMinifiedJs(continueOnError) {
    options.continueOnError = continueOnError;
    options.errored = false;
    await closureCompile(entryPoint, destDir, minifiedName, options, timeInfo);

    // If an incremental watch build fails, simply return.
    if (options.errored) {
      return;
    }

    const destPath = path.join(destDir, minifiedName);
    appendToCompiledFile(srcFilename, destPath);
    fs.writeFileSync(path.join(destDir, 'version.txt'), internalRuntimeVersion);
    if (options.latestName) {
      fs.copySync(
        destPath,
        path.join(destDir, maybeToEsmName(options.latestName))
      );
    }

    let name = minifiedName;
    if (options.latestName) {
      name += ` → ${maybeToEsmName(options.latestName)}`;
    }
    endBuildStep('Minified', name, timeInfo.startTime);

    const target = path.basename(minifiedName, path.extname(minifiedName));
    if (!argv.noconfig && MINIFIED_TARGETS.includes(target)) {
      await applyAmpConfig(
        maybeToEsmName(`${destDir}/${minifiedName}`),
        /* localDev */ options.fortesting,
        /* fortesting */ options.fortesting
      );
    }
  }

  return doCompileMinifiedJs(options.continueOnError);
}

/**
 * Handles a browserify bundling error
 * @param {Error} err
 * @param {boolean} continueOnError
 * @param {string} destFilename
 */
function handleBundleError(err, continueOnError, destFilename) {
  let message = err;
  if (err.stack) {
    // Drop the node_modules call stack, which begins with '    at'.
    message = err.stack.replace(/    at[^]*/, '').trim();
  }
  log(red('ERROR:'), message, '\n');
  const reasonMessage = `Could not compile ${cyan(destFilename)}`;
  if (continueOnError) {
    log(red('ERROR:'), reasonMessage);
  } else {
    const reason = new Error(reasonMessage);
    reason.showStack = false;
    new EventEmitter().emit('error', reason);
  }
}

/**
 * Performs the final steps after Browserify bundles a JS file
 * @param {string} srcFilename
 * @param {string} destDir
 * @param {string} destFilename
 * @param {?Object} options
 */
function finishBundle(srcFilename, destDir, destFilename, options) {
  appendToCompiledFile(srcFilename, path.join(destDir, destFilename));

  if (options.latestName) {
    // "amp-foo-latest.js" -> "amp-foo-latest.max.js"
    const latestMaxName = options.latestName.split('.js')[0] + '.max.js';
    // Copy amp-foo-0.1.js to amp-foo-latest.max.js.
    fs.copySync(
      path.join(destDir, options.toName),
      path.join(destDir, latestMaxName)
    );
  }
}

/**
 * Transforms a given JavaScript file entry point with browserify, and watches
 * it for changes (if required).
 * @param {string} srcDir
 * @param {string} srcFilename
 * @param {string} destDir
 * @param {?Object} options
 * @return {!Promise}
 */
function compileUnminifiedJs(srcDir, srcFilename, destDir, options) {
  const entryPoint = path.join(srcDir, srcFilename);
  const destFilename = options.toName || srcFilename;
  const wrapper = options.wrapper || wrappers.none;
  const devWrapper = wrapper.replace('<%= contents %>', '$1');

  // TODO: @jonathantyng remove browserifyOptions #22757
  const browserifyOptions = {
    entries: entryPoint,
    debug: true,
    fast: true,
    ...options.browserifyOptions,
  };

  let bundler = browserify(browserifyOptions).transform(babelify, {
    caller: {name: 'unminified'},
    global: true,
  });

  if (options.watch) {
    const watchFunc = () => {
      const bundleComplete = performBundle(/* continueOnError */ true);
      if (options.onWatchBuild) {
        options.onWatchBuild(bundleComplete);
      }
    };
    bundler = watchify(bundler);
    bundler.on('update', debounce(watchFunc, watchDebounceDelay));
  }

  /**
   * @param {boolean} continueOnError
   * @return {Promise}
   */
  function performBundle(continueOnError) {
    let startTime;
    return toPromise(
      bundler
        .bundle()
        .once('readable', () => (startTime = Date.now()))
        .on('error', (err) =>
          handleBundleError(err, continueOnError, destFilename)
        )
        .pipe(source(srcFilename))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(
          regexpSourcemaps(
            /\$internalRuntimeVersion\$/g,
            internalRuntimeVersion,
            'runtime-version'
          )
        )
        .pipe(regexpSourcemaps(/([^]+)/, devWrapper, 'wrapper'))
        .pipe(rename(destFilename))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(destDir))
        .on('end', () =>
          finishBundle(srcFilename, destDir, destFilename, options)
        )
    )
      .then(() => {
        let name = destFilename;
        if (options.latestName) {
          const latestMaxName = options.latestName.split('.js')[0] + '.max.js';
          name = `${name} → ${latestMaxName}`;
        }
        endBuildStep('Compiled', name, startTime);
      })
      .then(() => {
        const target = path.basename(destFilename, path.extname(destFilename));
        if (UNMINIFIED_TARGETS.includes(target)) {
          return applyAmpConfig(
            `${destDir}/${destFilename}`,
            /* localDev */ true,
            /* fortesting */ options.fortesting
          );
        }
      });
  }

  return performBundle(options.continueOnError);
}

/**
 * Transpiles from TypeScript into intermediary files before compilation and
 * deletes them afterwards.
 *
 * @param {string} srcDir Path to the src directory
 * @param {string} srcFilename Name of the JS source file
 * @param {string} destDir Destination folder for output script
 * @param {?Object} options
 * @return {!Promise}
 */
async function compileTs(srcDir, srcFilename, destDir, options) {
  options = options || {};
  await transpileTs(srcDir, srcFilename);
  await compileJs(srcDir, srcFilename, destDir, options);
  del.sync(path.join(srcDir, '**/*.js'));
}

/**
 * Bundles (max) or compiles (min) a given JavaScript file entry point.
 *
 * @param {string} srcDir Path to the src directory
 * @param {string} srcFilename Name of the JS source file
 * @param {string} destDir Destination folder for output script
 * @param {?Object} options
 * @return {!Promise}
 */
async function compileJs(srcDir, srcFilename, destDir, options) {
  options = options || {};
  if (options.minify) {
    return compileMinifiedJs(srcDir, srcFilename, destDir, options);
  } else {
    return compileUnminifiedJs(srcDir, srcFilename, destDir, options);
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
  const mins = executionTime.getMinutes();
  const secs = executionTime.getSeconds();
  const ms = ('000' + executionTime.getMilliseconds().toString()).slice(-3);
  let timeString = '(';
  if (mins > 0) {
    timeString += mins + ' m ' + secs + '.' + ms + ' s)';
  } else if (secs === 0) {
    timeString += ms + ' ms)';
  } else {
    timeString += secs + '.' + ms + ' s)';
  }
  log(stepName, cyan(targetName), green(timeString));
}

/**
 * Prints a helpful message that lets the developer know how to switch configs.
 * @param {string} command Command being run.
 */
function printConfigHelp(command) {
  log(
    green('Building version'),
    cyan(internalRuntimeVersion),
    green('of the runtime with the'),
    cyan(argv.config === 'canary' ? 'canary' : 'prod'),
    green('AMP config.')
  );
  if (!isTravisBuild()) {
    log(
      green('⤷ Use'),
      cyan('--config={canary|prod}'),
      green('with your'),
      cyan(command),
      green('command to specify which config to apply.')
    );
  }
}

/**
 * Prints a message that could help speed up local development.
 */
function printNobuildHelp() {
  for (const task of NOBUILD_HELP_TASKS) {
    // eslint-disable-line local/no-for-of-statement
    if (argv._.includes(task)) {
      log(
        green('To skip building during future'),
        cyan(task),
        green('runs, use'),
        cyan('--nobuild'),
        green('with your'),
        cyan(`gulp ${task}`),
        green('command.')
      );
      return;
    }
  }
}

/**
 * Writes AMP_CONFIG to a runtime file. Optionally enables localDev mode and
 * fortesting mode. Called by "gulp build" and "gulp dist" while building
 * various runtime files.
 *
 * @param {string} targetFile File to which the config is to be written.
 * @param {boolean} localDev Whether or not to enable local development.
 * @param {boolean} fortesting Whether or not to enable testing mode.
 * @return {!Promise}
 */
async function applyAmpConfig(targetFile, localDev, fortesting) {
  const config = argv.config === 'canary' ? 'canary' : 'prod';
  const baseConfigFile =
    'build-system/global-configs/' + config + '-config.json';

  return removeConfig(targetFile).then(() => {
    return applyConfig(
      config,
      targetFile,
      baseConfigFile,
      /* opt_localDev */ localDev,
      /* opt_localBranch */ true,
      /* opt_branch */ false,
      /* opt_fortesting */ fortesting
    );
  });
}

/**
 * Synchronously concatenates the given files into a string.
 *
 * @param {Array<string>} files A list of file paths.
 * @return {string} The concatenated contents of the given files.
 */
function concatFilesToString(files) {
  return files
    .map(function (filePath) {
      return fs.readFileSync(filePath, 'utf8');
    })
    .join(MODULE_SEPARATOR);
}

/**
 * Copies frame.html to output folder, replaces js references to minified
 * copies, and generates symlink to it.
 *
 * @param {string} input
 * @param {string} outputName
 * @param {!Object} options
 * @return {!Promise}
 */
function thirdPartyBootstrap(input, outputName, options) {
  const {minify, fortesting} = options;
  if (!minify) {
    return toPromise(gulp.src(input).pipe(gulp.dest('dist.3p/current')));
  }

  // By default we use an absolute URL, that is independent of the
  // actual frame host for the JS inside the frame.
  // But during testing we need a relative reference because the
  // version is not available on the absolute path.
  const integrationJs = fortesting
    ? './f.js'
    : `https://${hostname3p}/${internalRuntimeVersion}/f.js`;
  // Convert default relative URL to absolute min URL.
  const html = fs
    .readFileSync(input, 'utf8')
    .replace(/\.\/integration\.js/g, integrationJs);
  return toPromise(
    file(outputName, html, {src: true})
      .pipe(gulp.dest('dist.3p/' + internalRuntimeVersion))
      .on('end', function () {
        const aliasToLatestBuild = 'dist.3p/current-min';
        if (fs.existsSync(aliasToLatestBuild)) {
          fs.unlinkSync(aliasToLatestBuild);
        }
        fs.symlinkSync(
          './' + internalRuntimeVersion,
          aliasToLatestBuild,
          'dir'
        );
      })
  );
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
  return new Promise(function (resolve, reject) {
    readable.on('error', reject).on('end', resolve);
  });
}

module.exports = {
  MINIFIED_TARGETS,
  applyAmpConfig,
  bootstrapThirdPartyFrames,
  compileAllJs,
  compileCoreRuntime,
  compileJs,
  compileTs,
  doBuildJs,
  endBuildStep,
  maybeToEsmName,
  mkdirSync,
  printConfigHelp,
  printNobuildHelp,
  toPromise,
  watchDebounceDelay,
};
