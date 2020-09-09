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

const colors = require('ansi-colors');
const debounce = require('debounce');
const fs = require('fs-extra');
const log = require('fancy-log');
const wrappers = require('../compile/compile-wrappers');
const {
  extensionAliasBundles,
  extensionBundles,
  verifyExtensionBundles,
} = require('../compile/bundles.config');
const {endBuildStep, watchDebounceDelay} = require('./helpers');
const {isTravisBuild} = require('../common/travis');
const {jsifyCssAsync} = require('./jsify-css');
const {maybeToEsmName, compileJs, mkdirSync} = require('./helpers');
const {vendorConfigs} = require('./vendor-configs');
const {watch} = require('gulp');

const {green, red, cyan} = colors;
const argv = require('minimist')(process.argv.slice(2));

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
 *   name: ?string,
 *   version: ?string,
 *   hasCss: ?boolean,
 *   loadPriority: ?string,
 *   cssBinaries: ?Array<string>,
 *   extraGlobs: ?Array<string>,
 * }}
 */
const ExtensionOption = {}; // eslint-disable-line no-unused-vars

// All declared extensions.
const extensions = {};

// All extensions to build
let extensionsToBuild = null;

// All a4a extensions.
const adVendors = [];

/**
 * @param {string} name
 * @param {string|!Array<string>} version E.g. 0.1 or [0.1, 0.2]
 * @param {string} latestVersion E.g. 0.1
 * @param {!ExtensionOption} options extension options object.
 * @param {!Object} extensionsObject
 * @param {boolean} includeLatest
 */
function declareExtension(
  name,
  version,
  latestVersion,
  options,
  extensionsObject,
  includeLatest
) {
  const defaultOptions = {hasCss: false};
  const versions = Array.isArray(version) ? version : [version];
  versions.forEach((v) => {
    extensionsObject[`${name}-${v}`] = {
      name,
      version: v,
      latestVersion,
      ...defaultOptions,
      ...options,
    };
    if (includeLatest && v == latestVersion) {
      extensionsObject[`${name}-latest`] = extensionsObject[`${name}-${v}`];
    }
  });
  if (name.startsWith('amp-ad-network-')) {
    // Get the ad network name. All ad network extensions are named
    // in the format `amp-ad-network-${name}-impl`
    name = name.slice(15, -5);
    adVendors.push(name);
  }
}

/**
 * Initializes all extensions from build-system/compile/bundles.config.js if not
 * already done and populates the given extensions object.
 * @param {?Object} extensionsObject
 * @param {?boolean} includeLatest
 */
function maybeInitializeExtensions(
  extensionsObject = extensions,
  includeLatest = false
) {
  if (Object.keys(extensionsObject).length === 0) {
    verifyExtensionBundles();
    extensionBundles.forEach((c) => {
      declareExtension(
        c.name,
        c.version,
        c.latestVersion,
        c.options,
        extensionsObject,
        includeLatest
      );
    });
  }
}

/**
 * Set the extensions to build from example documents
 * (for internal use by `gulp performance`)
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
  if (extensionsToBuild) {
    return extensionsToBuild;
  }
  extensionsToBuild = DEFAULT_EXTENSION_SET;
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
    !(preBuild || argv.noextensions || argv.extensions || argv.extensions_from)
  ) {
    const allExtensions = [];
    for (const extension in extensions) {
      allExtensions.push(extensions[extension].name);
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
  if (isTravisBuild()) {
    return;
  }

  const buildOrPreBuild = preBuild ? 'pre-build' : 'build';
  const coreRuntimeOnlyMessage =
    green('⤷ Use ') +
    cyan('--core_runtime_only ') +
    green('to build just the core runtime.');
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

  if (argv.core_runtime_only) {
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
    return;
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
  maybeInitializeExtensions(extensions, /* includeLatest */ false);
  const extensionsToBuild = getExtensionsToBuild();
  const results = [];
  for (const extension in extensions) {
    if (
      options.compileOnlyCss ||
      extensionsToBuild.includes(extensions[extension].name)
    ) {
      results.push(doBuildExtension(extensions, extension, options));
    }
  }
  await Promise.all(results);
  if (!options.compileOnlyCss) {
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
 * @return {!Promise}
 */
async function doBuildExtension(extensions, extension, options) {
  const e = extensions[extension];
  let o = {...options};
  o = Object.assign(o, e);
  await buildExtension(
    e.name,
    e.version,
    e.latestVersion,
    e.hasCss,
    o,
    e.extraGlobs
  );
}

/**
 * Watches the contents of an extension directory. When a file in the given path
 * changes, the extension is rebuilt.
 *
 * @param {string} path
 * @param {string} name
 * @param {string} version
 * @param {string} latestVersion
 * @param {boolean} hasCss
 * @param {?Object} options
 */
function watchExtension(path, name, version, latestVersion, hasCss, options) {
  const watchFunc = function () {
    const bundleComplete = buildExtension(
      name,
      version,
      latestVersion,
      hasCss,
      {...options, continueOnError: true}
    );
    if (options.onWatchBuild) {
      options.onWatchBuild(bundleComplete);
    }
  };
  watch(`${path}/**/*`).on('change', debounce(watchFunc, watchDebounceDelay));
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
 * @param {string} latestVersion Latest version of the extension.
 * @param {boolean} hasCss Whether there is a CSS file for this extension.
 * @param {?Object} options
 * @param {!Array=} extraGlobs
 * @return {!Promise}
 */
async function buildExtension(
  name,
  version,
  latestVersion,
  hasCss,
  options,
  extraGlobs
) {
  options = options || {};
  options.extraGlobs = extraGlobs;
  if (options.compileOnlyCss && !hasCss) {
    return;
  }
  const path = 'extensions/' + name + '/' + version;

  // Use a separate watcher for extensions to copy / inline CSS and compile JS
  // instead of relying on the watchers used by compileUnminifiedJs and
  // compileMinifiedJs, which only recompile JS.
  if (options.watch) {
    options.watch = false;
    watchExtension(path, name, version, latestVersion, hasCss, options);
    // When an ad network extension is being watched, also watch amp-a4a.
    if (name.match(/amp-ad-network-.*-impl/)) {
      const a4aPath = `extensions/amp-a4a/${version}`;
      watchExtension(a4aPath, name, version, latestVersion, hasCss, options);
    }
  }
  if (hasCss) {
    mkdirSync('build');
    mkdirSync('build/css');
    await buildExtensionCss(path, name, version, options);
    if (options.compileOnlyCss) {
      return;
    }
  }
  if (name === 'amp-analytics') {
    await vendorConfigs(options);
  }
  await buildExtensionJs(path, name, version, latestVersion, options);
}

/**
 * @param {string} path
 * @param {string} name
 * @param {string} version
 * @param {!Object} options
 * @return {!Promise}
 */
function buildExtensionCss(path, name, version, options) {
  /**
   * Writes CSS binaries
   *
   * @param {string} name
   * @param {string} css
   */
  function writeCssBinaries(name, css) {
    const jsCss = 'export const CSS = ' + JSON.stringify(css) + ';\n';
    const jsName = `build/${name}.js`;
    const cssName = `build/css/${name}`;
    fs.writeFileSync(jsName, jsCss, 'utf-8');
    fs.writeFileSync(cssName, css, 'utf-8');
  }
  const aliasBundle = extensionAliasBundles[name];
  const isAliased = aliasBundle && aliasBundle.version == version;

  const promises = [];
  const mainCssBinary = jsifyCssAsync(path + '/' + name + '.css').then(
    (mainCss) => {
      writeCssBinaries(`${name}-${version}.css`, mainCss);
      if (isAliased) {
        writeCssBinaries(`${name}-${aliasBundle.aliasedVersion}.css`, mainCss);
      }
    }
  );

  if (Array.isArray(options.cssBinaries)) {
    promises.push.apply(
      promises,
      options.cssBinaries.map(function (name) {
        return jsifyCssAsync(`${path}/${name}.css`).then((css) => {
          writeCssBinaries(`${name}-${version}.css`, css);
          if (isAliased) {
            writeCssBinaries(`${name}-${aliasBundle.aliasedVersion}.css`, css);
          }
        });
      })
    );
  }
  promises.push(mainCssBinary);
  return Promise.all(promises);
}

/**
 * Build the JavaScript for the extension specified
 *
 * @param {string} path Path to the extensions directory
 * @param {string} name Name of the extension. Must be the sub directory in
 *     the extensions directory and the name of the JS and optional CSS file.
 * @param {string} version Version of the extension. Must be identical to
 *     the sub directory inside the extension directory
 * @param {string} latestVersion Latest version of the extension.
 * @param {!Object} options
 * @return {!Promise}
 */
async function buildExtensionJs(path, name, version, latestVersion, options) {
  const filename = options.filename || name + '.js';
  await compileJs(
    path + '/',
    filename,
    './dist/v0',
    Object.assign(options, {
      toName: `${name}-${version}.max.js`,
      minifiedName: `${name}-${version}.js`,
      latestName: version === latestVersion ? `${name}-latest.js` : '',
      esmPassCompilation: argv.esm || argv.sxg || false,
      // Wrapper that either registers the extension or schedules it for
      // execution after the main binary comes back.
      // The `function` is wrapped in `()` to avoid lazy parsing it,
      // since it will be immediately executed anyway.
      // See https://github.com/ampproject/amphtml/issues/3977
      wrapper: options.noWrapper
        ? ''
        : wrappers.extension(name, options.loadPriority),
    })
  );

  // If an incremental watch build fails, simply return.
  if (options.errored) {
    return;
  }

  const aliasBundle = extensionAliasBundles[name];
  const isAliased = aliasBundle && aliasBundle.version == version;
  if (isAliased) {
    const src = maybeToEsmName(
      `${name}-${version}${options.minify ? '' : '.max'}.js`
    );
    const dest = maybeToEsmName(
      `${name}-${aliasBundle.aliasedVersion}${options.minify ? '' : '.max'}.js`
    );
    fs.copySync(`dist/v0/${src}`, `dist/v0/${dest}`);
    fs.copySync(`dist/v0/${src}.map`, `dist/v0/${dest}.map`);
  }

  if (name === 'amp-script') {
    copyWorkerDomResources(version);
  }
}

/**
 * Copies the required resources from @ampproject/worker-dom and renames
 * them accordingly.
 *
 * @param {string} version
 */
async function copyWorkerDomResources(version) {
  const startTime = Date.now();
  const workerDomDir = 'node_modules/@ampproject/worker-dom';
  const targetDir = 'dist/v0';
  log(
    green('Copying @ampproject/worker-dom resources:'),
    cyan('worker.js, worker.nodom.js')
  );

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
  endBuildStep(
    'Copied @ampproject/worker-dom resources',
    'worker.js, worker.nodom.js',
    startTime
  );
}

module.exports = {
  buildExtensions,
  doBuildExtension,
  extensions,
  getExtensionsToBuild,
  maybeInitializeExtensions,
  parseExtensionFlags,
  setExtensionsToBuildFromDocuments,
};
