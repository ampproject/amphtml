const argv = require('minimist')(process.argv.slice(2));
const debounce = require('../common/debounce');
const fastGlob = require('fast-glob');
const fs = require('fs-extra');
const json5 = require('json5');
const path = require('path');
const wrappers = require('../compile/compile-wrappers');
const {
  compileJs,
  doBuildJs,
  endBuildStep,
  esbuildCompile,
  maybeToEsmName,
  watchDebounceDelay,
} = require('./helpers');
const {
  extensionAliasBundles,
  extensionBundles,
  jsBundles,
  verifyExtensionBundles,
} = require('../compile/bundles.config');
const {
  VERSION: internalRuntimeVersion,
} = require('../compile/internal-version');
const {analyticsVendorConfigs} = require('./analytics-vendor-configs');
const {compileJison} = require('./compile-jison');
const {cyan, green, red} = require('kleur/colors');
const {isCiBuild} = require('../common/ci');
const {jsifyCssAsync} = require('./css/jsify-css');
const {log} = require('../common/logging');
const {parse: pathParse} = require('path');
const {watch} = require('chokidar');
const {findJsSourceFilename} = require('../common/fs');

const legacyLatestVersions = json5.parse(
  fs.readFileSync(
    require.resolve('../compile/bundles.legacy-latest-versions.jsonc'),
    'utf8'
  )
);

/**
 * Extensions to build when `--extensions=inabox`.
 * See AMPHTML ads spec for supported extensions:
 * https://amp.dev/documentation/guides-and-tutorials/learn/a4a_spec/
 */
const INABOX_EXTENSION_SET = [
  'amp-accordion',
  'amp-ad-exit',
  'amp-analytics',
  'amp-anim',
  'amp-animation',
  'amp-audio',
  'amp-bind',
  'amp-carousel',
  'amp-fit-text',
  'amp-font',
  'amp-form',
  'amp-layout',
  'amp-lightbox',
  'amp-mustache',
  'amp-position-observer',
  'amp-social-share',
  'amp-video',

  // the following extensions are not supported in AMPHTML ads spec
  // but commonly used in AMPHTML ads related debugging.
  'amp-ad',
  'amp-ad-network-fake-impl',
];

/**
 * Default extensions that should always be built. These are always or almost
 * always loaded by runtime.
 */
const DEFAULT_EXTENSION_SET = ['amp-loader', 'amp-auto-lightbox'];

/**
 * @typedef {{
 *   name?: string,
 *   version?: string,
 *   hasCss?: boolean,
 *   loadPriority?: string,
 *   binaries?: Array<ExtensionBinaryDef>,
 *   wrapper?: string,
 *   ssrCss?: boolean,
 *   additionalSuffix?: string
 * }}
 */
const ExtensionOptionDef = {};

/**
 * @typedef {{
 *   entryPoint: string,
 *   outfile: string,
 *   external?: Array<string>
 *   remap?: Record<string, string>
 *   wrapper?: string,
 *   babelCaller?: string,
 * }}
 */
const ExtensionBinaryDef = {};

// All declared extensions.
const EXTENSIONS = {};

// All extensions to build
let extensionsToBuild = null;

// All a4a extensions.
const adVendors = [];

/**
 * @param {string} name
 * @param {string|!Array<string>} version E.g. 0.1 or [0.1, 0.2]
 * @param {!ExtensionOptionDef|undefined} options extension options object.
 * @param {!Object} extensionsObject
 */
function declareExtension(name, version, options, extensionsObject) {
  const defaultOptions = {hasCss: false};
  const versions = Array.isArray(version) ? version : [version];
  const suffix = options?.additionalSuffix ?? '';
  versions.forEach((v) => {
    // If `additionalSuffix` is given, make it as a part of the key as it is
    // most likely needed to make the entry unique for instances where
    // multiple entries share the same "entryPoint/name"  but have different
    // destination name. This allows for a 1 to many relationship between
    // entryPoint and output (1 -> *).
    extensionsObject[`${name}-${v}${suffix}`] = {
      name,
      version: v,
      ...defaultOptions,
      ...options,
    };
  });
  if (name.startsWith('amp-ad-network-')) {
    // Get the ad network name. All ad network extensions are named
    // in the format `amp-ad-network-${name}-impl`
    name = name.slice(15, -5);
    adVendors.push(name);
  }
}

/**
 * Initializes all extensions from build-system/compile/bundles.config.extensions.json
 * if not already done and populates the given extensions object.
 * @param {object} extensionsObject
 */
function maybeInitializeExtensions(extensionsObject) {
  if (Object.keys(extensionsObject).length === 0) {
    verifyExtensionBundles();
    extensionBundles.forEach((c) => {
      declareExtension(c.name, c.version, c.options, extensionsObject);
    });
  }
}

/**
 * Set the extensions to build from example documents
 * (for internal use by `amp performance`)
 *
 * @param {Array<string>} examples Path to example documents
 */
function setExtensionsToBuildFromDocuments(examples) {
  extensionsToBuild = dedupe([
    ...DEFAULT_EXTENSION_SET,
    ...getExtensionsFromArg(examples.join(',')),
  ]);
}

/**
 * Process the command line arguments --noextensions, --extensions, and
 * --extensions_from and return a list of the referenced extensions.
 *
 * @param {boolean=} preBuild
 * @return {!Array<string>}
 */
function getExtensionsToBuild(preBuild = false) {
  extensionsToBuild = argv.core_runtime_only ? [] : DEFAULT_EXTENSION_SET;
  if (argv.extensions) {
    if (typeof argv.extensions !== 'string') {
      log(red('ERROR:'), 'Missing list of extensions.');
      process.exit(1);
    } else if (argv.extensions === 'inabox') {
      argv.extensions = INABOX_EXTENSION_SET.join(',');
    }
    const explicitExtensions = argv.extensions.replace(/\s/g, '').split(',');
    extensionsToBuild = dedupe(extensionsToBuild.concat(explicitExtensions));
  }
  if (argv.extensions_from) {
    const extensionsFrom = getExtensionsFromArg(argv.extensions_from);
    extensionsToBuild = dedupe(extensionsToBuild.concat(extensionsFrom));
  }
  if (
    !preBuild &&
    !argv.noextensions &&
    !argv.extensions &&
    !argv.extensions_from &&
    !argv.core_runtime_only
  ) {
    const allExtensions = [];
    for (const extension in EXTENSIONS) {
      allExtensions.push(EXTENSIONS[extension].name);
    }
    extensionsToBuild = dedupe(extensionsToBuild.concat(allExtensions));
  }
  return extensionsToBuild;
}

/**
 * Parses the --extensions, --extensions_from, and the --noextensions flags,
 * and prints a helpful message that lets the developer know how to (pre)build
 * the runtime with a list of extensions, all the extensions used by a test
 * file, or no extensions at all.
 * @param {boolean=} preBuild
 */
function parseExtensionFlags(preBuild = false) {
  if (isCiBuild()) {
    return;
  }

  const buildOrPreBuild = preBuild ? 'pre-build' : 'build';
  const coreRuntimeOnlyMessage =
    green('⤷ Use ') +
    cyan('--core_runtime_only ') +
    green('to build just the core runtime and skip other JS targets.');
  const noExtensionsMessage =
    green('⤷ Use ') +
    cyan('--noextensions ') +
    green('to skip building extensions.');
  const extensionsMessage =
    green('⤷ Use ') +
    cyan('--extensions=amp-foo,amp-bar ') +
    green(`to choose which extensions to ${buildOrPreBuild}.`);
  const inaboxSetMessage =
    green('⤷ Use ') +
    cyan('--extensions=inabox ') +
    green(`to ${buildOrPreBuild} just the extensions needed to load AMP ads.`);
  const extensionsFromMessage =
    green('⤷ Use ') +
    cyan('--extensions_from=examples/foo.amp.html ') +
    green(`to ${buildOrPreBuild} just the extensions needed to load `) +
    cyan('foo.amp.html') +
    green('.');

  if (argv.core_runtime_only && !(argv.extensions || argv.extensions_from)) {
    log(green('Building just the core runtime.'));
  } else if (preBuild) {
    log(
      green('Pre-building extension(s):'),
      cyan(getExtensionsToBuild(preBuild).join(', '))
    );
    log(extensionsMessage);
    log(inaboxSetMessage);
    log(extensionsFromMessage);
  } else {
    if (argv.noextensions) {
      log(green('Not building any AMP extensions.'));
    } else if (argv.extensions || argv.extensions_from) {
      log(
        green('Building extension(s):'),
        cyan(getExtensionsToBuild().join(', '))
      );
    } else {
      log(green('Building all AMP extensions.'));
    }
    log(coreRuntimeOnlyMessage);
    log(noExtensionsMessage);
    log(extensionsMessage);
    log(inaboxSetMessage);
    log(extensionsFromMessage);
  }
}

/**
 * Process the command line argument --extensions_from of example AMP documents
 * into a single list of AMP extensions consumed by those documents.
 * @param {string} examples A comma separated list of AMP documents
 * @return {!Array<string>}
 */
function getExtensionsFromArg(examples) {
  if (!examples) {
    return [];
  }

  const extensions = [];

  examples.split(',').forEach((example) => {
    const html = fs.readFileSync(example, 'utf8');
    const customElementTemplateRe = /custom-(element|template)="([^"]+)"/g;
    const extensionNameMatchIndex = 2;
    let hasAd = false;
    let match;
    while ((match = customElementTemplateRe.exec(html))) {
      if (match[extensionNameMatchIndex] == 'amp-ad') {
        hasAd = true;
      }
      extensions.push(match[extensionNameMatchIndex]);
    }
    if (hasAd) {
      for (let i = 0; i < adVendors.length; i++) {
        if (html.includes(`type="${adVendors[i]}"`)) {
          extensions.push('amp-a4a');
          extensions.push(`amp-ad-network-${adVendors[i]}-impl`);
        }
      }
    }
  });

  return dedupe(extensions);
}

/**
 * Remove duplicates from the given array.
 * @param {!Array<string>} arr
 * @return {!Array<string>}
 */
function dedupe(arr) {
  const map = Object.create(null);
  arr.forEach((item) => (map[item] = true));
  return Object.keys(map);
}

/**
 * Build all the AMP extensions
 *
 * @param {!Object} options
 * @return {!Promise}
 */
async function buildExtensions(options) {
  const startTime = Date.now();
  maybeInitializeExtensions(EXTENSIONS);
  const extensionsToBuild = getExtensionsToBuild();
  const results = [];
  for (const extension in EXTENSIONS) {
    if (
      options.compileOnlyCss ||
      extensionsToBuild.includes(EXTENSIONS[extension].name)
    ) {
      results.push(doBuildExtension(EXTENSIONS, extension, options));
    }
  }
  await Promise.all(results);
  if (!options.compileOnlyCss && results.length > 0) {
    endBuildStep(
      options.minify ? 'Minified all' : 'Compiled all',
      'extensions',
      startTime
    );
  }
}

/**
 * Builds a single extension after extracting its settings.
 * @param {!Object} extensions
 * @param {string} extension
 * @param {!Object} options
 * @return {!Promise<void>}
 */
async function doBuildExtension(extensions, extension, options) {
  const e = extensions[extension];
  let o = {...options};
  o = Object.assign(o, e);
  await buildExtension(e.name, e.version, e.hasCss, o);
}

/**
 * Watches for non-JS changes within an extensions directory to trigger
 * recompilation.
 *
 * @param {string} extDir
 * @param {string} name
 * @param {string} version
 * @param {boolean} hasCss
 * @param {?Object} options
 * @return {Promise<void>}
 */
async function watchExtension(extDir, name, version, hasCss, options) {
  /**
   * Steps to run when a watched file is modified.
   */
  function watchFunc() {
    buildExtension(name, version, hasCss, {
      ...options,
      continueOnError: true,
      isRebuild: true,
      watch: false,
    });
  }

  const cssDeps = `${extDir}/**/*.css`;
  const jisonDeps = `${extDir}/**/*.jison`;
  const ignored = /dist/; //should not watch npm dist folders.
  watch([cssDeps, jisonDeps], {ignored}).on(
    'change',
    debounce(watchFunc, watchDebounceDelay)
  );
}

/**
 * Copies extensions from
 * extensions/$name/$version/$name.js
 * to
 * dist/v0/$name-$version.js
 *
 * Optionally copies the CSS at extensions/$name/$version/$name.css into
 * a generated JS file that can be required from the extensions as
 * `import {CSS} from '../../../build/$name-0.1.css';`
 *
 * @param {string} name Name of the extension. Must be the sub directory in
 *     the extensions directory and the name of the JS and optional CSS file.
 * @param {string} version Version of the extension. Must be identical to
 *     the sub directory inside the extension directory
 * @param {boolean} hasCss Whether there is a CSS file for this extension.
 * @param {?Object} options
 * @return {!Promise<void>}
 */
async function buildExtension(name, version, hasCss, options) {
  options = options || {};
  if (options.compileOnlyCss && !hasCss) {
    return;
  }
  const extDir = 'extensions/' + name + '/' + version;

  // Use a separate watcher for css and jison compilation.
  // The watcher within compileJs recompiles the JS.
  if (options.watch) {
    await watchExtension(extDir, name, version, hasCss, options);
  }

  if (hasCss) {
    await buildExtensionCss(extDir, name, version);
    if (options.compileOnlyCss) {
      return;
    }
  }

  await compileJison(`${extDir}/**/*.jison`);
  if (name === 'amp-bind') {
    await doBuildJs(jsBundles, 'ww.max.js', options);
  }
  if (options.binaries) {
    await buildBinaries(extDir, options.binaries, options);
  }
  if (name === 'amp-analytics') {
    await analyticsVendorConfigs(options);
  }

  if (options.isRebuild) {
    return;
  }

  await buildExtensionJs(extDir, name, {...options, bento: false});
}

/**
 * @param {string} extDir
 * @param {string} name
 * @param {string} version
 * @return {!Promise}
 */
async function buildExtensionCss(extDir, name, version) {
  const aliasBundle = extensionAliasBundles[name];
  const aliasedVersion =
    aliasBundle?.version == version ? aliasBundle.aliasedVersion : null;

  const versions = [version, aliasedVersion].filter(Boolean);

  const bundles = await fastGlob(`${extDir}/*.css`);

  await Promise.all(
    bundles.map(async (filename) => {
      const name = path.basename(filename, '.css');
      const css = await jsifyCssAsync(filename);
      await writeCssBinaries(name, versions, css);
    })
  );
}

/**
 * @param {string} name
 * @param {string[]} versions
 * @param {string} css
 * @return {!Promise}
 */
async function writeCssBinaries(name, versions, css) {
  const jsCss = 'export const CSS = ' + JSON.stringify(css) + ';\n';
  await writeVersions(`build/${name}`, 'css.js', versions, jsCss);
  await writeVersions(`build/css/${name}`, 'css', versions, css);
}

/**
 * @param {string} prefix
 * @param {string} fileExtension
 * @param {string[]} versions
 * @param {string} content
 * @return {!Promise<void>}
 */
async function writeVersions(prefix, fileExtension, versions, content) {
  for (const version of versions) {
    const outfile = `${prefix}-${version}.${fileExtension}`;
    await fs.outputFile(outfile, content);
  }
}

/**
 * @param {string} extDir
 * @param {!Array<ExtensionBinaryDef>} binaries
 * @param {!Object} options
 * @return {!Promise}
 */
function buildBinaries(extDir, binaries, options) {
  // If outputPath is not defined, then use extDir
  const {outputPath = extDir} = options;

  const promises = binaries.map((binary) => {
    const {babelCaller, entryPoint, external, outfile, remap, wrapper} = binary;
    const {name} = pathParse(outfile);
    const esm = argv.esm || argv.sxg || false;
    return esbuildCompile(extDir + '/', entryPoint, `${outputPath}/dist`, {
      ...options,
      toName: maybeToEsmName(`${name}.max.js`),
      minifiedName: maybeToEsmName(`${name}.js`),
      aliasName: '',
      outputFormat: esm ? 'esm' : 'cjs',
      externalDependencies: external,
      remapDependencies: remap,
      wrapper: wrapper ?? options.wrapper,
      babelCaller: babelCaller ?? options.babelCaller,
    });
  });
  return Promise.all(promises);
}

/** @type {import('@babel/core').PluginItem[]} */
const extensionBabelPlugins = [
  './build-system/babel-plugins/babel-plugin-amp-config-urls',
];

/**
 * Build the JavaScript for the extension specified
 *
 * @param {string} dir Path to the extension's directory
 * @param {string} name Name of the extension. Must be the sub directory in
 *     the extensions directory and the name of the JS and optional CSS file.
 * @param {!Object} options
 * @return {!Promise}
 */
async function buildExtensionJs(dir, name, options) {
  const isLatest = legacyLatestVersions[options.name] === options.version;
  const {
    filename = await findJsSourceFilename(name, dir),
    version,
    wrapper = 'extension',
  } = options;

  const wrapperOrFn = wrappers[wrapper];
  if (!wrapperOrFn) {
    throw new Error(
      `Unknown options.wrapper "${wrapper}" (${name}:${version})\n` +
        `Expected one of: ${Object.keys(wrappers).join(', ')}`
    );
  }
  const resolvedWrapper =
    typeof wrapperOrFn === 'function'
      ? wrapperOrFn(name, version, argv.esm, options.loadPriority)
      : wrapperOrFn;

  const additionalSuffix = options.additionalSuffix
    ? `.${options.additionalSuffix}`
    : '';
  await compileJs(`${dir}/`, filename, './dist/v0', {
    ...options,
    toName: `${name}-${version}.max${additionalSuffix}.js`,
    minifiedName: `${name}-${version}${additionalSuffix}.js`,
    aliasName: isLatest ? `${name}-latest${additionalSuffix}.js` : '',
    wrapper: resolvedWrapper,
    babelPlugins: wrapper === 'extension' ? extensionBabelPlugins : null,
  });

  // If an incremental watch build fails, simply return.
  if (options.errored) {
    return;
  }

  const aliasBundle = extensionAliasBundles[name];
  const isAliased = aliasBundle && aliasBundle.version == version;

  if (isAliased) {
    const {aliasedVersion} = aliasBundle;
    const src = maybeToEsmName(
      `${name}-${version}${options.minify ? '' : '.max'}${additionalSuffix}.js`
    );
    const dest = maybeToEsmName(
      `${name}-${aliasedVersion}${
        options.minify ? '' : '.max'
      }${additionalSuffix}.js`
    );
    fs.copySync(`dist/v0/${src}`, `dist/v0/${dest}`);
    fs.copySync(`dist/v0/${src}.map`, `dist/v0/${dest}.map`);
  }

  if (name === 'amp-script') {
    await copyWorkerDomResources(version);
    await buildSandboxedProxyIframe(options.minify);
  }
}

/**
 * Builds and writes the HTML file used for <amp-script> sandboxed mode.
 * @param {boolean} minify
 * @return {Promise<void>}
 */
async function buildSandboxedProxyIframe(minify) {
  await doBuildJs(jsBundles, 'amp-script-proxy-iframe.js', {minify});
  const dist3pDir = path.join(
    'dist.3p',
    minify ? `${internalRuntimeVersion}` : 'current'
  );
  const fileExt = argv.esm ? '.mjs' : '.js';
  const proxyScript = await fs.readFile(
    path.join(dist3pDir, 'amp-script-proxy-iframe' + fileExt)
  );
  const proxyIframe = `<html><script>${proxyScript}</script></html>`;
  await fs.outputFile(
    path.join(dist3pDir, 'amp-script-proxy-iframe.html'),
    proxyIframe
  );
}

/**
 * Copies the required resources from @ampproject/worker-dom and renames
 * them accordingly.
 *
 * @param {string} version
 * @return {Promise<void>}
 */
async function copyWorkerDomResources(version) {
  const startTime = Date.now();
  const workerDomDir = 'node_modules/@ampproject/worker-dom';
  const targetDir = 'dist/v0';
  const dir = `${workerDomDir}/dist`;
  const workerFilesToDeploy = new Map([
    ['amp-production/worker/worker.js', `amp-script-worker-${version}.js`],
    [
      'amp-production/worker/worker.nodom.js',
      `amp-script-worker-nodom-${version}.js`,
    ],
    ['amp-production/worker/worker.mjs', `amp-script-worker-${version}.mjs`],
    [
      'amp-production/worker/worker.nodom.mjs',
      `amp-script-worker-nodom-${version}.mjs`,
    ],
    [
      'amp-production/worker/worker.js.map',
      `amp-script-worker-${version}.js.map`,
    ],
    [
      'amp-production/worker/worker.nodom.js.map',
      `amp-script-worker-nodom-${version}.js.map`,
    ],
    [
      'amp-production/worker/worker.mjs.map',
      `amp-script-worker-${version}.mjs.map`,
    ],
    [
      'amp-production/worker/worker.nodom.mjs.map',
      `amp-script-worker-nodom-${version}.mjs.map`,
    ],
    ['amp-debug/worker/worker.js', `amp-script-worker-${version}.max.js`],
    [
      'amp-debug/worker/worker.nodom.js',
      `amp-script-worker-nodom-${version}.max.js`,
    ],
    ['amp-debug/worker/worker.mjs', `amp-script-worker-${version}.max.mjs`],
    [
      'amp-debug/worker/worker.nodom.mjs',
      `amp-script-worker-nodom-${version}.max.mjs`,
    ],
    [
      'amp-debug/worker/worker.js.map',
      `amp-script-worker-${version}.max.js.map`,
    ],
    [
      'amp-debug/worker/worker.nodom.js.map',
      `amp-script-worker-nodom-${version}.max.js.map`,
    ],
    [
      'amp-debug/worker/worker.mjs.map',
      `amp-script-worker-${version}.max.mjs.map`,
    ],
    [
      'amp-debug/worker/worker.nodom.mjs.map',
      `amp-script-worker-nodom-${version}.max.mjs.map`,
    ],
  ]);
  for (const [src, dest] of workerFilesToDeploy) {
    await fs.copy(`${dir}/${src}`, `${targetDir}/${dest}`);
  }
  endBuildStep('Copied', '@ampproject/worker-dom resources', startTime);
}

module.exports = {
  buildBinaries,
  buildExtensionCss,
  buildExtensionJs,
  buildExtensions,
  declareExtension,
  dedupe,
  doBuildExtension,
  EXTENSIONS,
  getExtensionsFromArg,
  getExtensionsToBuild,
  maybeInitializeExtensions,
  parseExtensionFlags,
  setExtensionsToBuildFromDocuments,
  INABOX_EXTENSION_SET,
};
