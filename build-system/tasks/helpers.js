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
const debounce = require('debounce');
const esbuild = require('esbuild');
/** @type {Object} */
const experimentDefines = require('../global-configs/experiments-const.json');
const fs = require('fs-extra');
const magicstring = require('magic-string');
const open = require('open');
const path = require('path');
const Remapping = require('@ampproject/remapping');
const terser = require('terser');
const wrappers = require('../compile/compile-wrappers');
const {
  VERSION: internalRuntimeVersion,
} = require('../compile/internal-version');
const {applyConfig, removeConfig} = require('./prepend-global/index.js');
const {closureCompile} = require('../compile/compile');
const {getEsbuildBabelPlugin} = require('../common/esbuild-babel');
const {green, red, cyan} = require('kleur/colors');
const {isCiBuild} = require('../common/ci');
const {jsBundles} = require('../compile/bundles.config');
const {log, logLocalDev} = require('../common/logging');
const {removeFromClosureBabelCache} = require('../compile/pre-closure-babel');
const {thirdPartyFrames} = require('../test-configs/config');
const {watch: fileWatch} = require('chokidar');

/** @type {Remapping.default} */
const remapping = /** @type {*} */ (Remapping);

/** @type {magicstring.default} */
const MagicString = /** @type {*} */ (magicstring);

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
  'amp-date-picker.js': ['third_party/react-dates/bundle.js'],
  'amp-shadow-dom-polyfill.js': [
    'node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-sd.install.js',
  ],
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
 * Stores esbuild's watch mode rebuilders.
 * @private @const {!Map<string, {rebuild: function():!Promise<void>}>}
 */
const watchedTargets = new Map();

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
    return Promise.reject(
      [red('Error:'), 'Could not find', cyan(name)].join(' ')
    );
  }
}

/**
 * Generates frames.html
 *
 * @param {!Object} options
 */
async function bootstrapThirdPartyFrames(options) {
  const startTime = Date.now();
  if (options.watch) {
    thirdPartyFrames.forEach((frameObject) => {
      const watchFunc = async () => {
        await thirdPartyBootstrap(frameObject.max, frameObject.min, options);
      };
      fileWatch(frameObject.max).on(
        'change',
        debounce(watchFunc, watchDebounceDelay)
      );
    });
  }
  await Promise.all(
    thirdPartyFrames.map(async (frameObject) => {
      await thirdPartyBootstrap(frameObject.max, frameObject.min, options);
    })
  );
  endBuildStep(
    'Bootstrapped 3p frames into',
    `dist.3p/${options.minify ? internalRuntimeVersion : 'current'}/`,
    startTime
  );
}

/**
 * Compile and optionally minify the core runtime.
 *
 * @param {!Object} options
 * @return {Promise<void>}
 */
async function compileCoreRuntime(options) {
  if (options.watch) {
    /** @return {Promise<void>} */
    async function watchFunc() {
      if (options.minify) {
        removeFromClosureBabelCache('src');
      }
      const bundleComplete = await doBuildJs(jsBundles, 'amp.js', {
        ...options,
        continueOnError: true,
        watch: false,
      });
      if (options.onWatchBuild) {
        options.onWatchBuild(bundleComplete);
      }
    }
    fileWatch('src/**/*.js').on(
      'change',
      debounce(watchFunc, watchDebounceDelay)
    );
  }

  await doBuildJs(jsBundles, 'amp.js', {
    ...options,
    // Pass {watch:true} for the initial esbuild call, but not for Closure.
    watch: options.watch && !argv.compiled,
  });
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
    log('Compiling JS with', cyan('esbuild'), 'and', cyan('babel') + '...');
  }
  const startTime = Date.now();
  await Promise.all([
    minify ? Promise.resolve() : doBuildJs(jsBundles, 'polyfills.js', options),
    doBuildJs(jsBundles, 'alp.max.js', options),
    doBuildJs(jsBundles, 'examiner.max.js', options),
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
 * Allows pending inside the compile wrapper to the already compiled, minified JS file.
 * @param {string} srcFilename Name of the JS source file
 * @param {string} destFilePath File path to the compiled JS file
 * @param {?Object} options
 */
function combineWithCompiledFile(srcFilename, destFilePath, options) {
  const bundleFiles = EXTENSION_BUNDLE_MAP[srcFilename];
  if (!bundleFiles) {
    return;
  }
  const bundle = new MagicString.Bundle({
    separator: '\n',
  });
  // We need to inject the code _inside_ the extension wrapper
  const destFileName = path.basename(destFilePath);
  /**
   * TODO (rileyajones) This should be import('magic-string').MagicStringOptions but
   * is invalid until https://github.com/Rich-Harris/magic-string/pull/183
   * is merged.
   * @type {Object}
   */
  const mapMagicStringOptions = {filename: destFileName};
  const contents = new MagicString(
    fs.readFileSync(destFilePath, 'utf8'),
    mapMagicStringOptions
  );
  const map = JSON.parse(fs.readFileSync(`${destFilePath}.map`, 'utf8'));
  const {sourceRoot} = map;
  map.sourceRoot = undefined;

  // The wrapper may have been minified further. Search backwards from the
  // expected <%=contents%> location to find the start of the `{` in the
  // wrapping function.
  const wrapperIndex = options.wrapper.indexOf('<%= contents %>');
  const index = contents.original.lastIndexOf('{', wrapperIndex) + 1;

  const wrapperOpen = contents.snip(0, index);
  const remainingContents = contents.snip(index, contents.length());

  bundle.addSource(wrapperOpen);
  for (const bundleFile of bundleFiles) {
    const contents = fs.readFileSync(bundleFile, 'utf8');
    /**
     * TODO (rileyajones) This should be import('magic-string').MagicStringOptions but
     * is invalid until https://github.com/Rich-Harris/magic-string/pull/183
     * is merged.
     * @type {Object}
     */
    const bundleMagicStringOptions = {filename: bundleFile};
    bundle.addSource(new MagicString(contents, bundleMagicStringOptions));
    bundle.append(MODULE_SEPARATOR);
  }
  bundle.addSource(remainingContents);

  const bundledMap = bundle.generateDecodedMap({
    file: destFileName,
    hires: true,
  });

  const remapped = remapping(
    bundledMap,
    (file) => {
      if (file === destFileName) {
        return map;
      }
      return null;
    },
    !argv.full_sourcemaps
  );
  remapped.sourceRoot = sourceRoot;

  fs.writeFileSync(destFilePath, bundle.toString(), 'utf8');
  fs.writeFileSync(`${destFilePath}.map`, remapped.toString(), 'utf8');
}

/**
 * @param {string} name
 * @return {string}
 */
function toEsmName(name) {
  return name.replace(/\.js$/, '.mjs');
}

/**
 * @param {string} name
 * @return {string}
 */
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
    async function watchFunc() {
      if (options.minify) {
        removeFromClosureBabelCache(entryPoint);
      }
      const compileDone = await doCompileMinifiedJs(/* continueOnError */ true);
      if (options.onWatchBuild) {
        options.onWatchBuild(compileDone);
      }
    }
    fileWatch(entryPoint).on('change', debounce(watchFunc, watchDebounceDelay));
  }

  /**
   * @param {boolean} continueOnError
   * @return {Promise<void>}
   */
  async function doCompileMinifiedJs(continueOnError) {
    options.continueOnError = continueOnError;
    options.errored = false;
    await closureCompile(entryPoint, destDir, minifiedName, options, timeInfo);

    // If an incremental watch build fails, simply return.
    if (options.errored) {
      return;
    }

    const destPath = path.join(destDir, minifiedName);
    combineWithCompiledFile(srcFilename, destPath, options);
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
 * Handles a bundling error
 * @param {Error} err
 * @param {boolean} continueOnError
 * @param {string} destFilename
 */
function handleBundleError(err, continueOnError, destFilename) {
  /** @type {Error|string} */
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
    throw new Error(reasonMessage);
  }
}

/**
 * Performs the final steps after a JS file is bundled and optionally minified
 * with esbuild and babel.
 * @param {string} srcFilename
 * @param {string} destDir
 * @param {string} destFilename
 * @param {?Object} options
 * @param {number} startTime
 */
async function finishBundle(
  srcFilename,
  destDir,
  destFilename,
  options,
  startTime
) {
  combineWithCompiledFile(
    srcFilename,
    path.join(destDir, destFilename),
    options
  );

  const logPrefix = options.minify ? 'Minified' : 'Compiled';
  let {latestName} = options;
  if (latestName) {
    if (!options.minify) {
      latestName = latestName.replace(/\.js$/, '.max.js');
    }
    fs.copySync(
      path.join(destDir, options.toName),
      path.join(destDir, latestName)
    );
    endBuildStep(logPrefix, `${destFilename} → ${latestName}`, startTime);
  } else {
    endBuildStep(logPrefix, destFilename, startTime);
  }

  const targets = options.minify ? MINIFIED_TARGETS : UNMINIFIED_TARGETS;
  const target = path.basename(destFilename, path.extname(destFilename));
  if (targets.includes(target)) {
    await applyAmpConfig(
      path.join(destDir, destFilename),
      /* localDev */ true,
      /* fortesting */ options.fortesting
    );
  }
}

/**
 * Transforms a given JavaScript file entry point with esbuild and babel, and
 * watches it for changes (if required).
 * @param {string} srcDir
 * @param {string} srcFilename
 * @param {string} destDir
 * @param {?Object} options
 * @return {!Promise}
 */
async function compileUnminifiedJs(srcDir, srcFilename, destDir, options) {
  const startTime = Date.now();
  const entryPoint = path.join(srcDir, srcFilename);
  const destFilename = options.toName || srcFilename;
  const destFile = path.join(destDir, destFilename);

  if (watchedTargets.has(entryPoint)) {
    return watchedTargets.get(entryPoint).rebuild();
  }

  /**
   * Splits up the wrapper to compute the banner and footer
   * @return {Object}
   */
  function splitWrapper() {
    const wrapper = options.wrapper || wrappers.none;
    const sentinel = '<%= contents %>';
    const start = wrapper.indexOf(sentinel);
    return {
      banner: {js: wrapper.slice(0, start)},
      footer: {js: wrapper.slice(start + sentinel.length)},
    };
  }

  const {banner, footer} = splitWrapper();
  const babelPlugin = getEsbuildBabelPlugin(
    'unminified',
    /* enableCache */ true
  );
  const buildResult = await esbuild
    .build({
      entryPoints: [entryPoint],
      bundle: true,
      sourcemap: true,
      define: experimentDefines,
      outfile: destFile,
      plugins: [babelPlugin],
      banner,
      footer,
      incremental: !!options.watch,
      logLevel: 'silent',
    })
    .then((result) => {
      finishBundle(srcFilename, destDir, destFilename, options, startTime);
      return result;
    })
    .catch((err) => handleBundleError(err, !!options.watch, destFilename));

  if (options.watch) {
    watchedTargets.set(entryPoint, {
      rebuild: async () => {
        const time = Date.now();
        const buildPromise = buildResult
          .rebuild()
          .then(() =>
            finishBundle(srcFilename, destDir, destFilename, options, time)
          )
          .catch((err) =>
            handleBundleError(err, /* continueOnError */ true, destFilename)
          );
        options?.onWatchBuild(buildPromise);
        await buildPromise;
      },
    });
  }
}

/**
 * Transforms a given JavaScript file entry point with esbuild and babel, and
 * watches it for changes (if required).
 * Used by 3p iframe vendors.
 * @param {string} srcDir
 * @param {string} srcFilename
 * @param {string} destDir
 * @param {?Object} options
 * @return {!Promise}
 */
async function compileJsWithEsbuild(srcDir, srcFilename, destDir, options) {
  const startTime = Date.now();
  const entryPoint = path.join(srcDir, srcFilename);
  const destFilename = maybeToEsmName(
    options.minify ? options.minifiedName : options.toName
  );
  const destFile = path.join(destDir, destFilename);

  if (watchedTargets.has(entryPoint)) {
    return watchedTargets.get(entryPoint).rebuild();
  }

  const babelPlugin = getEsbuildBabelPlugin(
    options.minify ? 'minified' : 'unminified',
    /* enableCache */ true
  );
  const plugins = [babelPlugin];

  if (options.remapDependencies) {
    plugins.unshift(remapDependenciesPlugin());
  }

  let result = null;

  /**
   * @param {number} time
   */
  async function build(time) {
    if (!result) {
      result = await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        sourcemap: true,
        outfile: destFile,
        plugins,
        minify: options.minify,
        format: options.outputFormat || undefined,
        target: argv.esm ? 'es6' : 'es5',
        incremental: !!options.watch,
        logLevel: 'silent',
        external: options.externalDependencies,
      });
    } else {
      result = await result.rebuild();
    }
    await minifyWithTerser(destDir, destFilename, options);
    await finishBundle(srcFilename, destDir, destFilename, options, time);
  }

  function remapDependenciesPlugin() {
    const remapDependencies = {__proto__: null, ...options.remapDependencies};
    const external = options.externalDependencies;
    return {
      name: 'remap-dependencies',
      setup(build) {
        build.onResolve({filter: /.*/}, (args) => {
          const dep = args.path;
          const remap = remapDependencies[dep];
          if (remap) {
            const isExternal = external.includes(remap);
            return {
              path: isExternal ? remap : require.resolve(remap),
              external: isExternal,
            };
          }
        });
      },
    };
  }

  await build(startTime).catch((err) =>
    handleBundleError(err, !!options.watch, destFilename)
  );

  if (options.watch) {
    watchedTargets.set(entryPoint, {
      rebuild: async () => {
        const time = Date.now();
        const buildPromise = build(time).catch((err) =>
          handleBundleError(err, !!options.watch, destFilename)
        );
        if (options.onWatchBuild) {
          options.onWatchBuild(buildPromise);
        }
        await buildPromise;
      },
    });
  }
}

/**
 * Minify the code with Terser. Only used by the ESBuild.
 *
 * @param {string} destDir
 * @param {string} destFilename
 * @param {?Object} options
 * @return {!Promise}
 */
async function minifyWithTerser(destDir, destFilename, options) {
  if (!options.minify) {
    return;
  }

  const filename = path.join(destDir, destFilename);
  const terserOptions = {
    mangle: true,
    compress: true,
    output: {
      beautify: !!argv.pretty_print,
      comments: /\/*/,
      // eslint-disable-next-line google-camelcase/google-camelcase
      keep_quoted_props: true,
    },
    sourceMap: true,
  };
  const minified = await terser.minify(
    fs.readFileSync(filename, 'utf8'),
    terserOptions
  );
  const remapped = remapping(
    [minified.map, fs.readFileSync(`${filename}.map`, 'utf8')],
    () => null,
    !argv.full_sourcemaps
  );
  fs.writeFileSync(filename, minified.code);
  fs.writeFileSync(`${filename}.map`, remapped.toString());
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
 * Stops the timer for the given build step and prints the execution time.
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
  logLocalDev(
    green('⤷ Use'),
    cyan('--config={canary|prod}'),
    green('with your'),
    cyan(command),
    green('command to specify which config to apply.')
  );
}

/**
 * Prints a message that could help speed up local development.
 */
function printNobuildHelp() {
  for (const task of NOBUILD_HELP_TASKS) {
    if (argv._.includes(task)) {
      log(
        green('To skip building during future'),
        cyan(task),
        green('runs, use'),
        cyan('--nobuild'),
        green('with your'),
        cyan(`amp ${task}`),
        green('command.')
      );
      return;
    }
  }
}

/**
 * @param {string=} covPath
 * @return {!Promise}
 */
async function maybePrintCoverageMessage(covPath = '') {
  if (!argv.coverage || isCiBuild()) {
    return;
  }

  const url = 'file://' + path.resolve(covPath);
  log(green('INFO:'), 'Generated code coverage report at', cyan(url));
  await open(url, {wait: false});
}

/**
 * Writes AMP_CONFIG to a runtime file. Optionally enables localDev mode and
 * fortesting mode. Called by "amp build" and "amp dist" while building
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
      /* opt_branch */ undefined,
      /* opt_fortesting */ fortesting
    );
  });
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
async function thirdPartyBootstrap(input, outputName, options) {
  const {minify, fortesting} = options;
  const destDir = `dist.3p/${minify ? internalRuntimeVersion : 'current'}`;
  await fs.ensureDir(destDir);

  if (!minify) {
    await fs.copy(input, `${destDir}/${path.basename(input)}`);
    return;
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
  await fs.writeFile(`${destDir}/${outputName}`, html);
  const aliasToLatestBuild = 'dist.3p/current-min';
  if (fs.existsSync(aliasToLatestBuild)) {
    fs.unlinkSync(aliasToLatestBuild);
  }
  fs.symlinkSync('./' + internalRuntimeVersion, aliasToLatestBuild, 'dir');
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

module.exports = {
  MINIFIED_TARGETS,
  applyAmpConfig,
  bootstrapThirdPartyFrames,
  compileAllJs,
  compileCoreRuntime,
  compileJs,
  compileJsWithEsbuild,
  doBuildJs,
  endBuildStep,
  compileUnminifiedJs,
  maybePrintCoverageMessage,
  maybeToEsmName,
  mkdirSync,
  printConfigHelp,
  printNobuildHelp,
  watchDebounceDelay,
};
