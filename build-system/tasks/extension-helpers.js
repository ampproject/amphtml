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
const fs = require('fs-extra');
const log = require('fancy-log');
const minimatch = require('minimatch');
const watch = require('gulp-watch');
const wrappers = require('../compile-wrappers');
const {
  aliasBundles,
  extensionBundles,
  verifyExtensionBundles,
  verifyExtensionAliasBundles,
} = require('../../bundles.config');
const {compileJs, mkdirSync} = require('./helpers');
const {isTravisBuild} = require('../travis');
const {jsifyCssAsync} = require('./jsify-css');

const {green, red, cyan} = colors;
const argv = require('minimist')(process.argv.slice(2));

/**
 * Extensions to build when `--extensions=minimal_set`.
 * @private @const {!Array<string>}
 */
const MINIMAL_EXTENSION_SET = [
  'amp-ad',
  'amp-ad-network-adsense-impl',
  'amp-analytics',
  'amp-audio',
  'amp-image-lightbox',
  'amp-lightbox',
  'amp-sidebar',
  'amp-video',
];

/**
 * @typedef {{
 *   name: ?string,
 *   version: ?string,
 *   hasCss: ?boolean,
 *   loadPriority: ?string,
 *   cssBinaries: ?Array<string>,
 *   extraGlobs?Array<string>,
 *   bundleOnlyIfListedInFiles: ?boolean
 * }}
 */
const ExtensionOption = {}; // eslint-disable-line no-unused-vars

// All declared extensions.
const extensions = {};
const extensionAliasFilePath = {};

// All extensions to build
let extensionsToBuild = null;

// All a4a extensions.
const adVendors = [];

/**
 * @param {string} name
 * @param {string|!Array<string>} version E.g. 0.1 or [0.1, 0.2]
 * @param {string} latestVersion E.g. 0.1
 * @param {!ExtensionOption} options extension options object.
 */
function declareExtension(name, version, latestVersion, options) {
  const defaultOptions = {hasCss: false};
  const versions = Array.isArray(version) ? version : [version];
  versions.forEach(v => {
    extensions[`${name}-${v}`] = Object.assign(
      {name, version: v, latestVersion},
      defaultOptions,
      options
    );
  });
  if (name.startsWith('amp-ad-network-')) {
    // Get the ad network name. All ad network extensions are named
    // in the format `amp-ad-network-${name}-impl`
    name = name.slice(15, -5);
    adVendors.push(name);
  }
}

/**
 * Initializes all extensions from bundles.config.js if not already done.
 */
function maybeInitializeExtensions() {
  if (Object.keys(extensions).length === 0) {
    verifyExtensionBundles();
    extensionBundles.forEach(c => {
      declareExtension(c.name, c.version, c.latestVersion, c.options);
    });
  }

  if (Object.keys(extensionAliasFilePath).length === 0) {
    verifyExtensionAliasBundles();
    aliasBundles.forEach(c => {
      declareExtensionVersionAlias(
        c.name,
        c.version,
        c.latestVersion,
        c.options
      );
    });
  }
}

/**
 * This function is used for declaring deprecated extensions. It simply places
 * the current version code in place of the latest versions. This has the
 * ability to break an extension version, so please be sure that this is the
 * correct one to use.
 * @param {string} name
 * @param {string} version E.g. 0.1
 * @param {string} latestVersion E.g. 0.1
 * @param {!ExtensionOption} options extension options object.
 */
function declareExtensionVersionAlias(name, version, latestVersion, options) {
  extensionAliasFilePath[name + '-' + version + '.js'] = {
    'name': name,
    'file': name + '-' + latestVersion + '.js',
  };
  extensionAliasFilePath[name + '-' + version + '.js.map'] = {
    'name': name,
    'file': name + '-' + latestVersion + '.js.map',
  };
  if (options.hasCss) {
    extensionAliasFilePath[name + '-' + version + '.css'] = {
      'name': name,
      'file': name + '-' + latestVersion + '.css',
    };
  }
  if (options.cssBinaries) {
    options.cssBinaries.forEach(cssBinaryName => {
      extensionAliasFilePath[cssBinaryName + '-' + version + '.css'] = {
        'name': cssBinaryName,
        'file': cssBinaryName + '-' + latestVersion + '.css',
      };
    });
  }
}

/**
 * Process the command line arguments --extensions and --extensions_from
 * and return a list of the referenced extensions.
 * @return {!Array<string>}
 */
function getExtensionsToBuild() {
  if (extensionsToBuild) {
    return extensionsToBuild;
  }

  extensionsToBuild = [];

  if (!!argv.extensions) {
    if (argv.extensions === 'minimal_set') {
      argv.extensions = MINIMAL_EXTENSION_SET.join(',');
    }
    extensionsToBuild = argv.extensions.split(',');
  }

  if (!!argv.extensions_from) {
    const extensionsFrom = getExtensionsFromArg(argv.extensions_from);
    extensionsToBuild = dedupe(extensionsToBuild.concat(extensionsFrom));
  }

  return extensionsToBuild;
}

/**
 * Parses the --extensions, --extensions_from, and the --noextensions flags,
 * and prints a helpful message that lets the developer know how to build the
 * runtime with a list of extensions, all the extensions used by a test file,
 * or no extensions at all.
 */
function parseExtensionFlags() {
  if (!isTravisBuild()) {
    const noExtensionsMessage =
      green('⤷ Use ') +
      cyan('--noextensions ') +
      green('to skip building extensions.');
    const extensionsMessage =
      green('⤷ Use ') +
      cyan('--extensions=amp-foo,amp-bar ') +
      green('to choose which extensions to build.');
    const minimalSetMessage =
      green('⤷ Use ') +
      cyan('--extensions=minimal_set ') +
      green('to build just the extensions needed to load ') +
      cyan('article.amp.html') +
      green('.');
    const extensionsFromMessage =
      green('⤷ Use ') +
      cyan('--extensions_from=examples/foo.amp.html ') +
      green('to build extensions from example docs.');
    if (argv.extensions) {
      if (typeof argv.extensions !== 'string') {
        log(red('ERROR:'), 'Missing list of extensions.');
        log(noExtensionsMessage);
        log(extensionsMessage);
        log(minimalSetMessage);
        log(extensionsFromMessage);
        process.exit(1);
      }
      argv.extensions = argv.extensions.replace(/\s/g, '');
    }

    if (argv.extensions || argv.extensions_from) {
      log(
        green('Building extension(s):'),
        cyan(getExtensionsToBuild().join(', '))
      );
    } else if (argv.noextensions) {
      log(green('Not building any AMP extensions.'));
    } else {
      log(green('Building all AMP extensions.'));
    }
    log(noExtensionsMessage);
    log(extensionsMessage);
    log(minimalSetMessage);
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

  examples.split(',').forEach(example => {
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
  arr.forEach(item => (map[item] = true));
  return Object.keys(map);
}

/**
 * Build all the AMP extensions
 *
 * @param {!Object} options
 * @return {!Promise}
 */
function buildExtensions(options) {
  maybeInitializeExtensions();
  if (!!argv.noextensions && !options.compileAll) {
    return Promise.resolve();
  }

  const extensionsToBuild = options.compileAll ? [] : getExtensionsToBuild();

  const results = [];
  for (const key in extensions) {
    if (
      extensionsToBuild.length > 0 &&
      extensionsToBuild.indexOf(extensions[key].name) == -1
    ) {
      continue;
    }
    const e = extensions[key];
    let o = Object.assign({}, options);
    o = Object.assign(o, e);
    results.push(
      buildExtension(
        e.name,
        e.version,
        e.latestVersion,
        e.hasCss,
        o,
        e.extraGlobs
      )
    );
  }
  return Promise.all(results);
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
 * @param {!Array=} opt_extraGlobs
 * @return {!Promise}
 */
function buildExtension(
  name,
  version,
  latestVersion,
  hasCss,
  options,
  opt_extraGlobs
) {
  options = options || {};
  options.extraGlobs = opt_extraGlobs;
  if (options.compileOnlyCss && !hasCss) {
    return Promise.resolve();
  }
  const path = 'extensions/' + name + '/' + version;
  const jsPath = path + '/' + name + '.js';
  const jsTestPath = path + '/test/test-' + name + '.js';
  if (argv.files && options.bundleOnlyIfListedInFiles) {
    const passedFiles = Array.isArray(argv.files) ? argv.files : [argv.files];
    const shouldBundle = passedFiles.some(glob => {
      return minimatch(jsPath, glob) || minimatch(jsTestPath, glob);
    });
    if (!shouldBundle) {
      return Promise.resolve();
    }
  }
  // Use a separate watcher for extensions to copy / inline CSS and compile JS
  // instead of relying on the watcher used by compileUnminifiedJs, which only
  // recompiles JS.
  const optionsCopy = Object.create(options);
  if (options.watch) {
    optionsCopy.watch = false;
    watch(path + '/*', function() {
      buildExtension(name, version, latestVersion, hasCss, optionsCopy);
    });
  }
  let promise = Promise.resolve();
  if (hasCss) {
    mkdirSync('build');
    mkdirSync('build/css');
    promise = buildExtensionCss(path, name, version, optionsCopy);
    if (options.compileOnlyCss) {
      return promise;
    }
  }
  return promise.then(() => {
    if (argv.single_pass) {
      return Promise.resolve();
    } else {
      return buildExtensionJs(path, name, version, latestVersion, optionsCopy);
    }
  });
}

/**
 * @param {string} path
 * @param {string} name
 * @param {string} version
 * @param {!Object} options
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
  const promises = [];
  const mainCssBinary = jsifyCssAsync(path + '/' + name + '.css').then(
    writeCssBinaries.bind(null, `${name}-${version}.css`)
  );

  if (Array.isArray(options.cssBinaries)) {
    promises.push.apply(
      promises,
      options.cssBinaries.map(function(name) {
        return jsifyCssAsync(`${path}/${name}.css`).then(css =>
          writeCssBinaries(`${name}-${version}.css`, css)
        );
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
function buildExtensionJs(path, name, version, latestVersion, options) {
  const filename = options.filename || name + '.js';
  return compileJs(
    path + '/',
    filename,
    './dist/v0',
    Object.assign(options, {
      toName: `${name}-${version}.max.js`,
      minifiedName: `${name}-${version}.js`,
      latestName: version === latestVersion ? `${name}-latest.js` : '',
      // Wrapper that either registers the extension or schedules it for
      // execution after the main binary comes back.
      // The `function` is wrapped in `()` to avoid lazy parsing it,
      // since it will be immediately executed anyway.
      // See https://github.com/ampproject/amphtml/issues/3977
      wrapper: options.noWrapper
        ? ''
        : wrappers.extension(name, options.loadPriority),
    })
  ).then(() => {
    // Copy @ampproject/worker-dom/dist/worker.safe.js to the dist/ folder.
    if (name === 'amp-script') {
      // TODO(choumx): Compile this when worker-dom externs are available.
      const dir = 'node_modules/@ampproject/worker-dom/dist/';
      const file = `dist/v0/amp-script-worker-${version}`;
      fs.copyFileSync(dir + 'worker.safe.js', `${file}.js`);
      fs.copyFileSync(dir + 'unminified.worker.safe.js', `${file}.max.js`);
    }
  });
}

module.exports = {
  buildExtensions,
  extensions,
  extensionAliasFilePath,
  getExtensionsToBuild,
  maybeInitializeExtensions,
  parseExtensionFlags,
};
