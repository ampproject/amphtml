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
const conf = require('../build.conf');
const del = require('del');
const file = require('gulp-file');
const fs = require('fs-extra');
const gulp = require('gulp');
const gulpWatch = require('gulp-watch');
const log = require('fancy-log');
const path = require('path');
const regexpSourcemaps = require('gulp-regexp-sourcemaps');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const watchify = require('watchify');
const wrappers = require('../compile-wrappers');
const {altMainBundles} = require('../../bundles.config');
const {applyConfig, removeConfig} = require('./prepend-global/index.js');
const {closureCompile} = require('../compile/compile');
const {isTravisBuild} = require('../travis');
const {thirdPartyFrames} = require('../config');
const {transpileTs} = require('../typescript');
const {VERSION: internalRuntimeVersion} = require('../internal-version');

const {green, red, cyan} = colors;
const argv = require('minimist')(process.argv.slice(2));

/**
 * Tasks that should print the `--nobuild` help text.
 * @private @const {!Set<string>}
 */
const NOBUILD_HELP_TASKS = new Set(['e2e', 'integration', 'visual-diff']);

const MODULE_SEPARATOR = ';';
const EXTENSION_BUNDLE_MAP = {
  'amp-viz-vega.js': [
    'third_party/d3/d3.js',
    'third_party/d3-geo-projection/d3-geo-projection.js',
    'third_party/vega/vega.js',
  ],
  'amp-inputmask.js': ['third_party/inputmask/bundle.js'],
};

const UNMINIFIED_TARGETS = [
  'amp.js',
  'amp-esm.js',
  'amp-shadow.js',
  'amp-inabox.js',
  'alp.max.js',
  'integration.js',
];

const MINIFIED_TARGETS = [
  'v0.js',
  'shadow-v0.js',
  'amp4ads-v0.js',
  'alp.js',
  'f.js',
];

const WEB_PUSH_PUBLISHER_FILES = [
  'amp-web-push-helper-frame',
  'amp-web-push-permission-dialog',
];

const WEB_PUSH_PUBLISHER_VERSIONS = ['0.1'];

const BABELIFY_GLOBAL_TRANSFORM = {
  global: true, // Transform node_modules
  ignore: devDependencies(), // Ignore devDependencies
};

const BABELIFY_REPLACE_PLUGIN = {
  plugins: [conf.getReplacePlugin()],
};

const hostname = argv.hostname || 'cdn.ampproject.org';
const hostname3p = argv.hostname3p || '3p.ampproject.net';

/**
 * Compile all runtime targets in minified mode and drop them in dist/.
 * @return {*} TODO(#23582): Specify return type
 */
function compileAllMinifiedTargets() {
  if (isTravisBuild()) {
    log('Minifying multi-pass runtime targets with', cyan('closure-compiler'));
  }
  return compile(/* watch */ false, /* shouldMinify */ true);
}

/**
 * Compile all runtime targets in unminified mode and drop them in dist/.
 * @param {boolean} watch
 * @return {*} TODO(#23582): Specify return type
 */
function compileAllUnminifiedTargets(watch) {
  if (isTravisBuild()) {
    log('Compiling runtime with', cyan('browserify'));
  }
  return compile(/* watch */ watch);
}

/**
 * Compile and optionally minify the stylesheets and the scripts
 * and drop them in the dist folder
 *
 * @param {boolean} watch
 * @param {boolean} shouldMinify
 * @return {!Promise}
 */
function compile(watch, shouldMinify) {
  const promises = [
    compileJs(
      './3p/',
      'integration.js',
      './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'),
      {
        minifiedName: 'f.js',
        watch,
        minify: shouldMinify,
        externs: ['./ads/ads.extern.js'],
        include3pDirectories: true,
        includePolyfills: true,
      }
    ),
    compileJs(
      './3p/',
      'ampcontext-lib.js',
      './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'),
      {
        minifiedName: 'ampcontext-v0.js',
        watch,
        minify: shouldMinify,
        externs: ['./ads/ads.extern.js'],
        include3pDirectories: true,
        includePolyfills: false,
      }
    ),
    compileJs(
      './3p/',
      'iframe-transport-client-lib.js',
      './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'),
      {
        minifiedName: 'iframe-transport-client-v0.js',
        watch,
        minify: shouldMinify,
        externs: ['./ads/ads.extern.js'],
        include3pDirectories: true,
        includePolyfills: false,
      }
    ),
    compileJs(
      './3p/',
      'recaptcha.js',
      './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'),
      {
        minifiedName: 'recaptcha.js',
        watch,
        minify: shouldMinify,
        externs: [],
        include3pDirectories: true,
        includePolyfills: true,
      }
    ),
    compileJs(
      './extensions/amp-viewer-integration/0.1/examples/',
      'amp-viewer-host.js',
      './dist/v0/examples',
      {
        toName: 'amp-viewer-host.max.js',
        minifiedName: 'amp-viewer-host.js',
        incudePolyfills: true,
        watch,
        extraGlobs: ['extensions/amp-viewer-integration/**/*.js'],
        compilationLevel: 'WHITESPACE_ONLY',
        minify: shouldMinify,
      }
    ),
  ];

  if (!argv.single_pass && (!watch || argv.with_shadow)) {
    promises.push(
      compileJs('./src/', 'amp-shadow.js', './dist', {
        minifiedName: 'shadow-v0.js',
        includePolyfills: true,
        watch,
        minify: shouldMinify,
      })
    );
  }

  if (!watch || argv.with_video_iframe_integration) {
    promises.push(
      compileJs('./src/', 'video-iframe-integration.js', './dist', {
        minifiedName: 'video-iframe-integration-v0.js',
        includePolyfills: false,
        watch,
        minify: shouldMinify,
      })
    );
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
          watch,
          minify: shouldMinify,
        })
      );
    }
    promises.push(
      // inabox-host
      compileJs('./ads/inabox/', 'inabox-host.js', './dist', {
        toName: 'amp-inabox-host.js',
        minifiedName: 'amp4ads-host-v0.js',
        includePolyfills: false,
        watch,
        minify: shouldMinify,
      })
    );
  }

  thirdPartyFrames.forEach(frameObject => {
    promises.push(
      thirdPartyBootstrap(frameObject.max, frameObject.min, shouldMinify)
    );
  });

  if (watch) {
    thirdPartyFrames.forEach(frameObject => {
      gulpWatch(frameObject.max, function() {
        thirdPartyBootstrap(frameObject.max, frameObject.min, shouldMinify);
      });
    });
  }

  return Promise.all(promises).then(() => {
    return compileJs('./src/', 'amp.js', './dist', {
      toName: 'amp.js',
      minifiedName: 'v0.js',
      includePolyfills: true,
      watch,
      minify: shouldMinify,
      wrapper: wrappers.mainBinary,
      singlePassCompilation: argv.single_pass,
      esmPassCompilation: argv.esm,
      includeOnlyESMLevelPolyfills: argv.esm,
    });
  });
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

/**
 * Minifies a given JavaScript file entry point.
 * @param {string} srcDir
 * @param {string} srcFilename
 * @param {string} destDir
 * @param {?Object} options
 * @return {!Promise}
 */
function compileMinifiedJs(srcDir, srcFilename, destDir, options) {
  const startTime = Date.now();
  const entryPoint = path.join(srcDir, srcFilename);
  const {minifiedName} = options;
  return closureCompile(entryPoint, destDir, minifiedName, options)
    .then(function() {
      const destPath = path.join(destDir, minifiedName);
      appendToCompiledFile(srcFilename, destPath);
      fs.writeFileSync(
        path.join(destDir, 'version.txt'),
        internalRuntimeVersion
      );
      if (options.latestName) {
        fs.copySync(destPath, path.join(destDir, options.latestName));
      }
    })
    .then(() => {
      let name = minifiedName;
      if (options.latestName) {
        name += ` → ${options.latestName}`;
      }
      if (options.singlePassCompilation) {
        altMainBundles.forEach(bundle => {
          name += `, ${bundle.name}.js`;
        });
        name += ', and all extensions';
      }
      endBuildStep('Minified', name, startTime);
    })
    .then(() => {
      if (argv.fortesting && MINIFIED_TARGETS.includes(minifiedName)) {
        return enableLocalTesting(`${destDir}/${minifiedName}`);
      }
    })
    .then(() => {
      if (!argv.fortesting || !options.singlePassCompilation) {
        return;
      }
      return Promise.all(
        altMainBundles.map(({name}) => enableLocalTesting(`dist/${name}.js`))
      );
    });
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
  console.error(red(message));
  if (continueOnError) {
    log('Error while compiling', cyan(destFilename));
  } else {
    process.exit(1);
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
 * Returns array of relative paths to "devDependencies" defined in package.json.
 * @return {!Array<string>}
 */
function devDependencies() {
  const file = fs.readFileSync('package.json', 'utf8');
  const packageJson = JSON.parse(file);
  const devDependencies = Object.keys(packageJson['devDependencies']);
  return devDependencies.map(p => `./node_modules/${p}`);
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
  const browserifyOptions = Object.assign(
    {},
    {
      entries: entryPoint,
      debug: true,
    },
    options.browserifyOptions
  );

  const babelifyOptions = Object.assign(
    {},
    BABELIFY_GLOBAL_TRANSFORM,
    BABELIFY_REPLACE_PLUGIN
  );

  let bundler = browserify(browserifyOptions).transform(
    babelify,
    babelifyOptions
  );

  if (options.watch) {
    bundler = watchify(bundler);
    bundler.on('update', () => performBundle(/* continueOnError */ true));
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
        .on('error', err =>
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
        if (UNMINIFIED_TARGETS.includes(destFilename)) {
          return enableLocalTesting(`${destDir}/${destFilename}`);
        }
      })
      .then(() => {
        if (isTravisBuild()) {
          process.stdout.write('.');
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
function compileJs(srcDir, srcFilename, destDir, options) {
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
    log(
      green('Building version'),
      cyan(internalRuntimeVersion),
      green('of the runtime for local testing with the'),
      cyan(argv.config === 'canary' ? 'canary' : 'prod'),
      green('AMP config.')
    );
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
  if (!isTravisBuild()) {
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
}

/**
 * Enables runtime to be used for local testing by writing AMP_CONFIG to file.
 * Called at the end of "gulp build" and "gulp dist --fortesting".
 * @param {string} targetFile File to which the config is to be written.
 * @return {*} TODO(#23582): Specify return type
 */
async function enableLocalTesting(targetFile) {
  const config = argv.config === 'canary' ? 'canary' : 'prod';
  const baseConfigFile =
    'build-system/global-configs/' + config + '-config.json';

  return removeConfig(targetFile).then(() => {
    return applyConfig(
      config,
      targetFile,
      baseConfigFile,
      /* opt_localDev */ true,
      /* opt_localBranch */ true,
      /* opt_branch */ false,
      /* opt_fortesting */ !!argv.fortesting
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
    .map(function(filePath) {
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
 * @param {boolean} shouldMinify
 * @return {!Promise}
 */
function thirdPartyBootstrap(input, outputName, shouldMinify) {
  const startTime = Date.now();
  if (!shouldMinify) {
    return toPromise(gulp.src(input).pipe(gulp.dest('dist.3p/current'))).then(
      () => {
        endBuildStep('Processed', input, startTime);
      }
    );
  }

  // By default we use an absolute URL, that is independent of the
  // actual frame host for the JS inside the frame.
  // But during testing we need a relative reference because the
  // version is not available on the absolute path.
  const integrationJs = argv.fortesting
    ? './f.js'
    : `https://${hostname3p}/${internalRuntimeVersion}/f.js`;
  // Convert default relative URL to absolute min URL.
  const html = fs
    .readFileSync(input, 'utf8')
    .replace(/\.\/integration\.js/g, integrationJs);
  return toPromise(
    file(outputName, html, {src: true})
      .pipe(gulp.dest('dist.3p/' + internalRuntimeVersion))
      .on('end', function() {
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
  ).then(() => {
    endBuildStep('Processed', input, startTime);
  });
}

/**
 * Build ALP JS.
 *
 * @param {!Object} options
 * @return {*} TODO(#23582): Specify return type
 */
function buildAlp(options) {
  options = options || {};
  return compileJs('./ads/alp/', 'install-alp.js', './dist/', {
    toName: 'alp.max.js',
    watch: options.watch,
    minify: options.minify || argv.minify,
    includePolyfills: true,
    minifiedName: 'alp.js',
  });
}

/**
 * Build Examiner JS.
 *
 * @param {!Object} options
 * @return {*} TODO(#23582): Specify return type
 */
function buildExaminer(options) {
  return compileJs('./src/examiner/', 'examiner.js', './dist/', {
    toName: 'examiner.max.js',
    watch: options.watch,
    minify: options.minify || argv.minify,
    includePolyfills: true,
    minifiedName: 'examiner.js',
  });
}

/**
 * Build web worker JS.
 *
 * @param {!Object} options
 * @return {*} TODO(#23582): Specify return type
 */
function buildWebWorker(options) {
  return compileJs('./src/web-worker/', 'web-worker.js', './dist/', {
    toName: 'ww.max.js',
    minifiedName: 'ww.js',
    includePolyfills: true,
    watch: options.watch,
    minify: options.minify || argv.minify,
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
  BABELIFY_GLOBAL_TRANSFORM,
  BABELIFY_REPLACE_PLUGIN,
  WEB_PUSH_PUBLISHER_FILES,
  WEB_PUSH_PUBLISHER_VERSIONS,
  buildAlp,
  buildExaminer,
  buildWebWorker,
  compileAllMinifiedTargets,
  compileAllUnminifiedTargets,
  compileJs,
  compileTs,
  devDependencies,
  enableLocalTesting,
  endBuildStep,
  hostname,
  mkdirSync,
  printConfigHelp,
  printNobuildHelp,
  toPromise,
};
