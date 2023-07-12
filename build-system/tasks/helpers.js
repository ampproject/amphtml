const argv = require('minimist')(process.argv.slice(2));
const debounce = require('../common/debounce');
const esbuild = require('esbuild');
/** @type {object} */
const experimentDefinesJson = require('../global-configs/experiments-const.json');
const fs = require('fs-extra');
const open = require('open');
const path = require('path');
const terser = require('terser');
const wrappers = require('../compile/compile-wrappers');
const {
  VERSION: internalRuntimeVersion,
} = require('../compile/internal-version');
const {cyan, green, red} = require('kleur/colors');
const {getAmpConfigForFile} = require('./prepend-global');
const {getEsbuildBabelPlugin} = require('../common/esbuild-babel');
const {includeSourcesContent, massageSourcemaps} = require('./sourcemaps');
const {isCiBuild} = require('../common/ci');
const {jsBundles} = require('../compile/bundles.config');
const {log, logLocalDev} = require('../common/logging');
const {thirdPartyFrames} = require('../test-configs/config');
const {watch} = require('chokidar');
const {debug} = require('../compile/debug-compilation-lifecycle');
const babel = require('@babel/core');
const {
  ampResolve,
  remapDependenciesPlugin,
} = require('./remap-dependencies-plugin/remap-dependencies');

/**
 * Tasks that should print the `--nobuild` help text.
 * @private @const {!Set<string>}
 */
const NOBUILD_HELP_TASKS = new Set(['e2e', 'integration', 'visual-diff']);

/**
 * Used during minification to concatenate extension bundles
 */
const EXTENSION_BUNDLE_MAP = {
  'amp-inputmask.js': ['third_party/inputmask/bundle.js'],
  'amp-date-picker.js': ['third_party/react-dates/bundle.js'],
  'amp-shadow-dom-polyfill.js': [
    'node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-sd.install.js',
  ],
};

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
 * Converts defines to their JSON representation.
 * See https://esbuild.github.io/api/#define.
 */
const experimentDefines = Object.fromEntries(
  Object.entries(experimentDefinesJson).map(([key, value]) => [
    key,
    JSON.stringify(value),
  ])
);

/**
 * @param {!Object} jsBundles
 * @param {string} name
 * @param {!Object} extraOptions
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
 * @return {Promise<void>}
 */
async function bootstrapThirdPartyFrames(options) {
  const startTime = Date.now();
  if (options.watch) {
    thirdPartyFrames.forEach((frameObject) => {
      const watchFunc = async () => {
        await thirdPartyBootstrap(frameObject.max, frameObject.min, options);
      };
      watch(frameObject.max).on(
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
  log(`Compiling ${cyan(minify ? 'minified' : 'unminified')} JS...`);

  const startTime = Date.now();
  await Promise.all([
    minify ? Promise.resolve() : doBuildJs(jsBundles, 'polyfills.js', options),
    doBuildJs(jsBundles, 'alp.max.js', options),
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
 * Returns compiled file to prepend within wrapper and empty string if none.
 *
 * @param {string} srcFilename
 * @return {Promise<string>}
 */
async function getCompiledFile(srcFilename) {
  const bundleFiles = EXTENSION_BUNDLE_MAP[srcFilename];
  if (!bundleFiles) {
    return '';
  }
  const filesContents = await Promise.all(
    bundleFiles.map((file) => fs.readFile(file, 'utf8'))
  );
  return filesContents.join('\n');
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
 * Handles a bundling error
 * @param {Error} err
 * @param {boolean} continueOnError
 * @param {string} destFilename
 */
function handleBundleError(err, continueOnError, destFilename) {
  const message = err.stack || err.toString();
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
 * @param {string} destDir
 * @param {string} destFilename
 * @param {?Object} options
 * @param {number} startTime
 * @return {Promise<void>}
 */
async function finishBundle(destDir, destFilename, options, startTime) {
  const logPrefix = options.minify ? 'Minified' : 'Compiled';
  let {aliasName} = options;
  if (aliasName) {
    if (!options.minify) {
      aliasName = aliasName.replace(/\.js$/, '.max.js');
    }
    aliasName = maybeToEsmName(aliasName);
    fs.copySync(
      path.join(destDir, destFilename),
      path.join(destDir, aliasName)
    );
    endBuildStep(logPrefix, `${destFilename} → ${aliasName}`, startTime);
  } else {
    endBuildStep(logPrefix, destFilename, startTime);
  }
}

/**
 * Transforms a given JavaScript file entry point with esbuild and babel, and
 * watches it for changes (if required).
 *
 * @param {string} srcDir
 * @param {string} srcFilename
 * @param {string} destDir
 * @param {!Object} options
 * @return {!Promise}
 */
async function esbuildCompile(srcDir, srcFilename, destDir, options) {
  const startTime = Date.now();
  const entryPoint = path.join(srcDir, srcFilename);
  const filename = options.minify
    ? options.minifiedName
    : options.toName ?? srcFilename;
  // This guards against someone passing `minify: true` but no `minifiedName`.
  if (!filename) {
    throw new Error('No minifiedName provided for ' + srcFilename);
  }
  const destFilename = maybeToEsmName(filename);
  const destFile = path.join(destDir, destFilename);

  if (watchedTargets.has(entryPoint)) {
    return watchedTargets.get(entryPoint).rebuild();
  }

  /**
   * Splits up the wrapper to compute the banner and footer
   * @return {object}
   */
  function splitWrapper() {
    const wrapper = options.wrapper ?? wrappers.none;
    const sentinel = '<%= contents %>';
    const start = wrapper.indexOf(sentinel);
    return {
      banner: {js: wrapper.slice(0, start)},
      footer: {js: wrapper.slice(start + sentinel.length)},
    };
  }
  const {banner, footer} = splitWrapper();
  const config = await getAmpConfigForFile(destFilename, options);
  const compiledFile = await getCompiledFile(srcFilename);
  banner.js = config + banner.js + compiledFile;

  let babelCaller =
    options.babelCaller ?? (options.minify ? 'minified' : 'unminified');

  // We read from the current binary configuration options if it is an
  // no css binary output. (removes CSS installation)
  if (options.ssrCss) {
    babelCaller += '-ssr-css';
  }

  const babelPlugin = getEsbuildBabelPlugin(
    babelCaller,
    /* enableCache */ true,
    {plugins: options.babelPlugins}
  );
  const plugins = [babelPlugin];

  if (options.remapDependencies) {
    const {externalDependencies: externals, remapDependencies: remaps} =
      options;

    plugins.unshift(
      remapDependenciesPlugin({externals, remaps, resolve: ampResolve})
    );
  }

  /** @type {?esbuild.BuildContext} */
  let esbuildContext = null;

  /**
   * @param {number} startTime
   * @return {Promise<void>}
   */
  async function build(startTime) {
    if (!esbuildContext) {
      esbuildContext = await esbuild.context({
        entryPoints: [entryPoint],
        bundle: true,
        sourcemap: 'external',
        sourcesContent: includeSourcesContent(),
        outfile: destFile,
        define: experimentDefines,
        plugins,
        // When using `nomodule-loader` we build as ESM in order to preserve
        // import statements. These are transformed in a post-build Babel step.
        format:
          options.outputFormat === 'nomodule-loader'
            ? 'esm'
            : options.outputFormat,
        banner,
        footer,
        // For es5 builds, ensure esbuild-injected code is transpiled.
        target: argv.esm ? 'es6' : 'es5',
        logLevel: 'silent',
        external: options.externalDependencies,
        mainFields: ['module', 'browser', 'main'],
        write: false,
      });
    }

    const {outputFiles} = await esbuildContext.rebuild();
    if (outputFiles === undefined) {
      throw new Error(`No output files for ${destFilename}`);
    }

    const codeFile = outputFiles.find(({path}) => !path.endsWith('.map'));
    const mapFile = outputFiles.find(({path}) => path.endsWith('.map'));

    if (!codeFile || !mapFile) {
      throw new Error(
        `Expected code and map file for ${destFilename}; got ${outputFiles.map(
          ({path}) => path
        )}`
      );
    }

    let {text: code} = codeFile;
    const mapChain = [JSON.parse(mapFile.text)];

    if (options.outputFormat === 'nomodule-loader') {
      const result = await babel.transformAsync(code, {
        caller: {name: 'nomodule-loader'},
        filename: destFile,
        sourceRoot: path.dirname(destFile),
        sourceMaps: true,
      });
      if (!result?.code) {
        throw new Error('failed to babel');
      }
      code = result.code;
      mapChain.unshift(result.map);
    }

    if (options.minify) {
      const result = await minify(code, {
        // toplevel clobbers the global namespace when with nomodule-loader
        toplevel: options.outputFormat !== 'nomodule-loader',
      });
      code = result.code;
      mapChain.unshift(result.map);
      debug(
        'post-terser',
        path.join(process.cwd(), destFile),
        code,
        result.map
      );
    }

    await Promise.all([
      fs.outputFile(
        destFile,
        `${code}\n//# sourceMappingURL=${destFilename}.map`
      ),
      fs.outputJson(
        `${destFile}.map`,
        massageSourcemaps(mapChain, destFile, options)
      ),
    ]);

    await finishBundle(destDir, destFilename, options, startTime);

    if (!options.watch) {
      await esbuildContext.dispose();
      esbuildContext = null;
    }
  }

  try {
    await build(startTime);
  } catch (err) {
    handleBundleError(err, !!options.watch, destFilename);
  }

  if (options.watch) {
    watchedTargets.set(entryPoint, {
      rebuild: async () => {
        const startTime = Date.now();
        try {
          const buildPromise = build(startTime);
          if (options.onWatchBuild) {
            options.onWatchBuild(buildPromise);
          }
          await buildPromise;
        } catch (err) {
          handleBundleError(err, !!options.watch, destFilename);
        }
      },
    });
  }
}

/**
 * Name cache to help terser perform cross-binary property mangling.
 */
const nameCache = {};

/**
 * Implements a stable identifier mangler, based only on the input order.
 *
 * Terser uses a char-frequency mangler by default, which isn't stable and
 * causes wild fluctuations in bundle size.
 */
const mangleIdentifier = {
  get(num) {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_0123456789';
    let base = 54;
    let id = '';
    do {
      id = charset[num % base] + id;
      num = Math.floor(num / base);
      base = 64;
    } while (num > 0);
    return id;
  },
};

/**
 * Minify the code with Terser. Only used by the ESBuild.
 *
 * @param {string} code
 * @param {terser.MinifyOptions} options
 * @return {!Promise<{code: string, map: *, error?: Error}>}
 */
async function minify(code, options = {}) {
  /* eslint-disable local/camelcase */
  const terserOptions = {
    mangle: {
      properties: {
        regex: '_AMP_PRIVATE_$',
        keep_quoted: /** @type {'strict'} */ ('strict'),
      },
    },
    compress: {
      // Settled on this count by incrementing number until there was no more
      // effect on minification quality.
      passes: 3,
    },
    output: {
      beautify: !!argv.pretty_print,
      keep_quoted_props: true,
      // The AMP Cache will prepend content on the first line during serving
      // (for AMP_CONFIG and AMP_EXP). In order for these to not affect
      // the sourcemap, we must ensure there is no other content on the first
      // line. If you remove this you will annoy Justin. Don't do it.
      preamble: ';',
    },
    sourceMap: true,
    toplevel: true,
    module: !!argv.esm,
    nameCache: argv.nomanglecache ? undefined : nameCache,
    ...options,
  };
  /* eslint-enable local/camelcase */

  // Remove the local variable name cache which should not be reused between binaries.
  // See https://github.com/ampproject/amphtml/issues/36476
  nameCache.vars = undefined;

  const minified = await terser.minify(code, terserOptions);
  return {code: minified.code ?? '', map: minified.map};
}

/**
 * The set of entrypoints currently watched by compileJs.
 * @type {Set<string>}
 */
const watchedEntryPoints = new Set();

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
  const entryPoint = path.join(srcDir, srcFilename);
  if (watchedEntryPoints.has(entryPoint)) {
    return;
  }

  if (options.watch) {
    watchedEntryPoints.add(entryPoint);
    const deps = await getDependencies(entryPoint, options);
    const watchFunc = async () => {
      await doCompileJs({...options, continueOnError: true});
    };
    watch(deps).on('change', debounce(watchFunc, watchDebounceDelay));
  }

  /**
   * Actually performs the steps to compile the entry point.
   * @param {object} options
   * @return {Promise<void>}
   */
  async function doCompileJs(options) {
    const buildResult = esbuildCompile(srcDir, srcFilename, destDir, options);
    if (options.onWatchBuild) {
      options.onWatchBuild(buildResult);
    }
    await buildResult;
  }

  await doCompileJs(options);
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
 * Copies frame.html to output folder, replaces js references to minified
 * copies, and generates symlink to it.
 *
 * @param {string} input
 * @param {string} outputName
 * @param {!Object} options
 * @return {!Promise}
 */
async function thirdPartyBootstrap(input, outputName, options) {
  const {fortesting, minify} = options;
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
 * Returns the list of dependencies for a given JS entrypoint by having esbuild
 * generate a metafile for it. Uses the set of babel plugins that would've been
 * used to compile the entrypoint.
 *
 * @param {string} entryPoint
 * @param {!Object} options
 * @return {Promise<Array<string>>}
 */
async function getDependencies(entryPoint, options) {
  let caller = options.minify ? 'minified' : 'unminified';
  // We read from the current binary configuration options if it is an
  // no css binary output. (removes CSS installation)
  if (options.ssrCss) {
    caller += '-ssr-css';
  }
  const babelPlugin = getEsbuildBabelPlugin(caller, /* enableCache */ true);
  const result = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    metafile: true,
    plugins: [babelPlugin],
  });
  return Object.keys(result.metafile?.inputs ?? {});
}

module.exports = {
  bootstrapThirdPartyFrames,
  compileAllJs,
  compileCoreRuntime,
  compileJs,
  esbuildCompile,
  doBuildJs,
  endBuildStep,
  maybePrintCoverageMessage,
  maybeToEsmName,
  printConfigHelp,
  printNobuildHelp,
  watchDebounceDelay,
  mangleIdentifier,
};
