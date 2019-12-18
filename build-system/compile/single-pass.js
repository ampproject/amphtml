/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

const babel = require('@babel/core');
const babelify = require('babelify');
const browserify = require('browserify');
const colors = require('ansi-colors');
const conf = require('./build.conf');
const del = require('del');
const devnull = require('dev-null');
const fs = require('fs-extra');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const log = require('fancy-log');
const MagicString = require('magic-string');
const minimist = require('minimist');
const path = require('path');
const relativePath = require('path').relative;
const rename = require('gulp-rename');
const resorcery = require('@jridgewell/resorcery');
const sourcemaps = require('gulp-sourcemaps');
const tempy = require('tempy');
const terser = require('terser');
const through = require('through2');
const {
  extensionAliasBundles,
  extensionBundles,
  altMainBundles,
  TYPES,
} = require('./bundles.config');
const {
  gulpClosureCompile,
  handleSinglePassCompilerError,
} = require('./closure-compile');
const {checkForUnknownDeps} = require('./check-for-unknown-deps');
const {shortenLicense, shouldShortenLicense} = require('./shorten-license');
const {TopologicalSort} = require('topological-sort');
const TYPES_VALUES = Object.keys(TYPES).map(x => TYPES[x]);
const wrappers = require('./compile-wrappers');
const {VERSION: internalRuntimeVersion} = require('./internal-version');

const argv = minimist(process.argv.slice(2));
let singlePassDest =
  typeof argv.single_pass_dest === 'string' ? argv.single_pass_dest : './dist/';

if (!singlePassDest.endsWith('/')) {
  singlePassDest = `${singlePassDest}/`;
}

const SPLIT_MARKER = `/** SPLIT_SINGLE_PASS */`;

// Used to store transforms and compile v0.js
const transformDir = tempy.directory();
const srcs = [];

const mainBundle = 'src/amp.js';
const extensionsInfo = {};
let extensions = extensionBundles
  .concat(altMainBundles)
  .filter(unsupportedExtensions)
  .map(ext => {
    const path = buildFullPathFromConfig(ext);
    if (Array.isArray(path)) {
      path.forEach((p, index) => {
        extensionsInfo[p] = Object.create(ext);
        extensionsInfo[p].filename = ext.name + '-' + ext.version[index];
      });
    } else {
      extensionsInfo[path] = Object.create(ext);
      if (isAltMainBundle(ext.name) && ext.path) {
        extensionsInfo[path].filename = ext.name;
      } else {
        extensionsInfo[path].filename = ext.name + '-' + ext.version;
      }
    }
    return path;
  });
// Flatten nested arrays to support multiple versions
extensions = [].concat.apply([], extensions);

const jsFilesToWrap = [];

exports.getFlags = function(config) {
  config.define.push('SINGLE_FILE_COMPILATION=true');
  config.define.push(`VERSION=${internalRuntimeVersion}`);
  /* eslint "google-camelcase/google-camelcase": 0 */
  // Reasonable defaults.
  const flags = {
    compilation_level: 'ADVANCED',
    use_types_for_optimization: true,
    rewrite_polyfills: false,
    source_map_include_content: !!argv.full_sourcemaps,
    source_map_location_mapping: ['|/'],
    //new_type_inf: true,
    // By default closure puts all of the public exports on the global, but
    // because of the wrapper modules (to mitigate async loading of scripts)
    // that we add to the js binaries this prevents other js binaries from
    // accessing the symbol, we remedy this by attaching all public exports
    // to `_` and everything imported across modules is is accessed through `_`.
    rename_prefix_namespace: '_',
    language_in: 'ECMASCRIPT_2018',
    language_out: config.esm
      ? 'NO_TRANSPILE'
      : config.language_out || 'ECMASCRIPT5',
    chunk_output_path_prefix: config.writeTo || 'out/',
    module_resolution: 'NODE',
    process_common_js_modules: true,
    externs: config.externs,
    define: config.define,
    // See https://github.com/google/closure-compiler/wiki/Warnings#warnings-categories
    // for a full list of closure's default error / warning levels.
    jscomp_off: ['accessControls', 'unknownDefines'],
    jscomp_warning: ['checkTypes', 'checkVars', 'moduleLoad'],
    jscomp_error: ['const', 'constantProperty', 'globalThis'],
    hide_warnings_for: config.hideWarningsFor,
  };
  if (argv.pretty_print) {
    flags.formatting = 'PRETTY_PRINT';
  }

  // Turn object into deterministically sorted array.
  const flagsArray = [];
  Object.keys(flags)
    .sort()
    .forEach(function(flag) {
      const val = flags[flag];
      if (val instanceof Array) {
        val.forEach(function(item) {
          flagsArray.push('--' + flag, item);
        });
      } else {
        if (val != null) {
          flagsArray.push('--' + flag, val);
        } else {
          flagsArray.push('--' + flag);
        }
      }
    });

  return exports.getGraph(config.modules, config).then(function(g) {
    return flagsArray.concat(exports.getBundleFlags(g, flagsArray));
  });
};

exports.getBundleFlags = function(g) {
  const flagsArray = [];

  // Add all packages (directories with a package.json) to the srcs array.
  // Closure compiler reads the packages to resolve
  // non-relative module names.
  Object.keys(g.packages)
    .sort()
    .forEach(function(pkg) {
      srcs.push(pkg);
    });

  // Build up the weird flag structure that closure compiler calls
  // modules and we call bundles.
  const bundleKeys = Object.keys(g.bundles).sort();
  // TODO(erwinm): special case src/amp.js for now. add a propert sort
  // comparator here.
  const indexOfAmp = bundleKeys.indexOf(mainBundle);
  bundleKeys.splice(indexOfAmp, 1);
  bundleKeys.splice(0, 0, mainBundle);
  const indexOfIntermediate = bundleKeys.indexOf('_base_i');
  bundleKeys.splice(indexOfIntermediate, 1);
  bundleKeys.splice(1, 0, '_base_i');
  bundleKeys.forEach(function(originalName) {
    const isMain = originalName == mainBundle;
    // TODO(erwinm): This access will break
    const bundle = g.bundles[originalName];
    bundle.modules.forEach(function(js) {
      srcs.push(`${g.tmp}/${js}`);
    });
    let name;
    let info = extensionsInfo[bundle.name];
    if (info) {
      name = info.filename;
      if (!name) {
        throw new Error('Expected filename ' + JSON.stringify(info));
      }
    } else if (bundle.name == mainBundle) {
      name = 'v0';
      info = {
        name,
      };
    } else {
      // TODO(@cramforce): Remove special case.
      if (!/_base/.test(bundle.name)) {
        throw new Error(
          'Unexpected missing extension info ' +
            bundle.name +
            ',' +
            JSON.stringify(bundle)
        );
      }
      name = bundle.name;
      info = {
        name,
      };
    }
    // And now build --chunk $name:$numberOfJsFiles:$bundleDeps
    let cmd = name + ':' + bundle.modules.length;
    const bundleDeps = [];
    if (!isMain) {
      const configEntry = getExtensionBundleConfig(originalName);
      if (configEntry) {
        cmd += `:${configEntry.type}`;
        // This is not necessary with intermediate concating.
        // bundleDeps.push('_base_i', configEntry.type);
      } else {
        // All lower tier bundles depend on _base_i
        if (TYPES_VALUES.includes(name)) {
          cmd += ':_base_i';
          bundleDeps.push('_base_i');
        } else {
          cmd += ':v0';
        }
      }
    }
    flagsArray.push('--chunk', cmd);
    if (bundleKeys.length > 1) {
      function massageWrapper(w) {
        return w.replace('<%= contents %>', '%s');
        /*+ '\n//# sourceMappingURL=%basename%.map\n'*/
      }
      // We need to post wrap the main bundles. We can't wrap v0.js either
      // since it would have the wrapper already when we read it and prepend
      // it.
      if (isMain || isAltMainBundle(name)) {
        jsFilesToWrap.push(name);
      } else {
        const configEntry = getExtensionBundleConfig(originalName);
        const marker = configEntry ? SPLIT_MARKER : '';
        flagsArray.push(
          '--chunk_wrapper',
          name +
            ':' +
            massageWrapper(
              wrappers.extension(
                info.name,
                info.loadPriority,
                bundleDeps,
                marker
              )
            )
        );
      }
    } else {
      throw new Error('Expect to build more than one bundle.');
    }
  });
  flagsArray.push('--js_module_root', `${g.tmp}/node_modules/`);
  flagsArray.push('--js_module_root', `${g.tmp}/`);
  return flagsArray;
};

exports.getGraph = function(entryModules, config) {
  let resolve;
  let reject;
  const promise = new Promise(function(res, rej) {
    resolve = res;
    reject = rej;
  });
  const nodes = new Map();
  const topo = new TopologicalSort(nodes);
  const graph = {
    entryModules,
    // Lookup whether a module is a dep of a given entry module
    depOf: {},
    // Map of module id to its deps array.
    deps: {},
    // Topological sorted array of all deps.
    sorted: undefined,
    // Generated bundles
    bundles: {
      _base_i: {
        isBase: true,
        name: '_base_i',
        // The modules in the bundle.
        modules: [],
      },
    },
    packages: {},
    tmp: transformDir,
  };

  TYPES_VALUES.forEach(type => {
    graph.bundles[type] = {
      isBase: true,
      name: type,
      modules: [],
    };
  });

  config.babel = config.babel || {};

  // Use browserify with babel to learn about deps.
  const b = browserify(entryModules, {
    debug: true,
    deps: true,
    detectGlobals: false,
    fast: true,
  })
    // The second stage are transforms that closure compiler supports
    // directly and which we don't want to apply during deps finding.
    .transform(babelify, {
      compact: false,
      plugins: ['transform-es2015-modules-commonjs'],
    });
  // This gets us the actual deps. We collect them in an array, so
  // we can sort them prior to building the dep tree. Otherwise the tree
  // will not be stable.
  const depEntries = [];
  b.pipeline.get('deps').push(
    through.obj(function(row, enc, next) {
      row.source = null; // Release memory
      depEntries.push(row);
      next();
    })
  );

  b.bundle()
    .on('end', function() {
      const edges = {};
      depEntries
        .sort(function(a, b) {
          return a.id < b.id;
        })
        .forEach(function(row) {
          const id = unifyPath(
            exports.maybeAddDotJs(relativePath(process.cwd(), row.id))
          );
          topo.addNode(id, id);
          const deps = (edges[id] = Object.keys(row.deps)
            .sort()
            .map(function(dep) {
              return unifyPath(relativePath(process.cwd(), row.deps[dep]));
            }));
          graph.deps[id] = deps;
          if (row.entry) {
            graph.depOf[id] = {};
            graph.depOf[id][id] = true; // Self edge.
            deps.forEach(function(dep) {
              graph.depOf[id][dep] = true;
            });
          }
        });
      Object.keys(edges)
        .sort()
        .forEach(function(id) {
          edges[id].forEach(function(dep) {
            topo.addEdge(id, dep);
          });
        });
      graph.sorted = Array.from(topo.sort().keys()).reverse();

      setupBundles(graph);
      transformPathsToTempDir(graph, config);
      resolve(graph);
      fs.writeFileSync('deps.txt', JSON.stringify(graph, null, 2));
    })
    .on('error', reject)
    .pipe(devnull());
  return promise;
};

function setupBundles(graph) {
  // For each module, mark them as to whether any of the entry
  // modules depends on them (transitively).
  Array.from(graph.sorted)
    .reverse()
    .forEach(function(id) {
      graph.deps[id].forEach(function(dep) {
        Object.keys(graph.depOf)
          .sort()
          .forEach(function(entry) {
            if (graph.depOf[entry][id]) {
              graph.depOf[entry][dep] = true;
            }
          });
      });
    });

  // Create the bundles.
  graph.sorted.forEach(function(id) {
    let inBundleCount = 0;
    // The bundle a module should go into.
    let dest;
    // Bundles that this item must be available to.
    const bundleDestCandidates = [];
    // Count in how many bundles a modules wants to be.
    Object.keys(graph.depOf)
      .sort()
      .forEach(function(entry) {
        if (graph.depOf[entry][id]) {
          inBundleCount++;
          dest = entry;
          const configEntry = getExtensionBundleConfig(entry);
          const type = configEntry ? configEntry.type : mainBundle;
          bundleDestCandidates.push(type);
        }
      });
    console /*OK*/
      .assert(
        inBundleCount >= 1,
        'Should be in at least 1 bundle',
        id,
        'Bundle count',
        inBundleCount,
        graph.depOf
      );
    // If a module is in more than 1 bundle, it must go into _base.
    if (bundleDestCandidates.length > 1) {
      const first = bundleDestCandidates[0];
      const allTheSame = !bundleDestCandidates.some(c => c != first);
      const needsBase = bundleDestCandidates.some(c => c == mainBundle);
      dest = mainBundle;
      // If all requested bundles are the same, then that is the right
      // place.
      if (allTheSame) {
        dest = first;
      } else if (!needsBase) {
        // If multiple type-bundles want the file, but it doesn't have to be
        // in base, move the file into the intermediate bundle.
        dest = '_base_i';
      }
    }
    if (!graph.bundles[dest]) {
      graph.bundles[dest] = {
        isBase: false,
        name: dest,
        modules: [],
      };
    }
    graph.bundles[dest].modules.push(id);
  });
}

/**
 * Takes all of the nodes in the dependency graph and transfers them
 * to a temporary directory where we can run babel transformations.
 *
 * @param {!Object} graph
 * @param {!Object} config
 */
function transformPathsToTempDir(graph, config) {
  log(
    'Performing single-pass',
    colors.cyan('babel'),
    'transforms in',
    colors.cyan(graph.tmp) + '...'
  );
  // `sorted` will always have the files that we need.
  graph.sorted.forEach(f => {
    // For now, just copy node_module files instead of transforming them.
    if (f.startsWith('node_modules/')) {
      fs.copySync(f, `${graph.tmp}/${f}`);
    } else {
      const {code, map} = babel.transformFileSync(f, {
        plugins: conf.plugins({
          isEsmBuild: config.define.indexOf('ESM_BUILD=true') !== -1,
          isForTesting: config.define.indexOf('FORTESTING=true') !== -1,
          isSinglePass: true,
        }),
        retainLines: true,
        sourceMaps: true,
      });
      fs.outputFileSync(`${graph.tmp}/${f}`, code);
      fs.outputFileSync(`${graph.tmp}/${f}.map`, JSON.stringify(map));
    }
    process.stdout.write('.');
  });
  console.log('\n');
}

// Returns the extension bundle config for the given filename or null.
function getExtensionBundleConfig(filename) {
  const basename = path.basename(filename, '.js');
  return extensionBundles.filter(x => x.name == basename)[0];
}

const knownExtensions = {
  mjs: true,
  js: true,
  es: true,
  es6: true,
  json: true,
};

exports.maybeAddDotJs = function(id) {
  const extensionMatch = id.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : null;
  if (!knownExtensions[extension]) {
    id += '.js';
  }
  return id;
};

function unifyPath(id) {
  return id.split(path.sep).join('/');
}

function buildFullPathFromConfig(ext) {
  function getPath(version) {
    return `extensions/${ext.name}/${version}/${ext.name}.js`;
  }

  // Allow alternate bundles to declare their own source location path.
  if (isAltMainBundle(ext.name) && ext.path) {
    return ext.path;
  }

  if (Array.isArray(ext.version)) {
    return ext.version.map(ver => getPath(ver));
  }

  return getPath(ext.version);
}

function unsupportedExtensions(name) {
  return name;
}

/**
 * Predicate to identify if a given extension name is an alternate main bundle
 * like amp-shadow, amp-inabox etc.
 *
 * @param {string} name
 * @return {boolean}
 */
function isAltMainBundle(name) {
  return altMainBundles.some(altMainBundle => {
    return altMainBundle.name === name;
  });
}

exports.singlePassCompile = async function(entryModule, options, timeInfo) {
  timeInfo.startTime = Date.now();
  return exports
    .getFlags({
      modules: [entryModule].concat(extensions),
      writeTo: singlePassDest,
      esm: options.esm,
      define: options.define,
      externs: options.externs,
      hideWarningsFor: options.hideWarningsFor,
    })
    .then(compile)
    .then(wrapMainBinaries)
    .then(intermediateBundleConcat)
    .then(eliminateIntermediateBundles)
    .then(thirdPartyConcat)
    .then(cleanupWeakModuleFiles)
    .then(copyAliasedExtensions)
    .catch(err => {
      err.showStack = false; // Useless node_modules stack
      throw err;
    });
};

/**
 * Wrap AMPs main binaries with the compiler wrappers. We are not able to
 * use closures wrapper mechanism for this since theres some concatenation
 * we need to do to build the alternative binaries such as shadow-v0 and
 * amp4ads-v0.
 * TODO This should operate on the gulp stream, not on disk files.
 */
function wrapMainBinaries() {
  const pair = wrappers.mainBinary.split('<%= contents %>');
  const prefix = pair[0];
  const suffix = pair[1];
  // Cache the v0 file so we can prepend it to alternative binaries.
  const mainFile = readMagicString('dist/v0.js');
  jsFilesToWrap.forEach(x => {
    const path = `dist/${x}.js`;
    const s = readMagicString(path);
    if (x === 'v0') {
      s.prepend(prefix);
      s.append(suffix);
      const map = s.generateDecodedMap({
        hires: true,
        source: path,
      });
      const remapped = resorcery(map, loadSourceMap, !argv.full_sourcemaps);
      fs.writeFileSync(path, s.toString(), 'utf8');
      fs.writeFileSync(`${path}.map`, remapped.toString(), 'utf8');
    } else {
      const bundle = new MagicString.Bundle();
      bundle.append('self.IS_AMP_ALT=1;');
      bundle.append(prefix);
      bundle.addSource(mainFile);
      bundle.addSource(s);
      bundle.append(suffix);
      const map = bundle.generateDecodedMap({hires: true});
      const remapped = resorcery(map, loadSourceMap, !argv.full_sourcemaps);
      fs.writeFileSync(path, bundle.toString(), 'utf8');
      fs.writeFileSync(`${path}.map`, remapped.toString(), 'utf8');
    }
  });
}

/**
 * Prepends intermediate bundles to the built js binary.
 * TODO This should operate on the gulp stream, not on disk files.
 */
function intermediateBundleConcat() {
  extensionBundles.forEach(extension => {
    const prependContents = [
      'dist/v0/_base_i.js',
      `dist/v0/${extension.type}.js`,
    ].map(readMagicString);

    // If there are third_party libraries to prepend too, ensure we inject a
    // new split marker.
    if (Array.isArray(extension.postPrepend)) {
      prependContents.push(new MagicString(SPLIT_MARKER));
    }

    return postPrepend(extension, prependContents);
  });
}

/**
 * Prepends the listed file to the built js binary.
 * TODO This should operate on the gulp stream, not on disk files.
 */
function thirdPartyConcat() {
  extensionBundles.forEach(extension => {
    const postPrependPaths = extension.postPrepend;
    if (!Array.isArray(postPrependPaths)) {
      return;
    }
    const prependContents = postPrependPaths.map(readMagicString);

    return postPrepend(extension, prependContents);
  });
}

function postPrepend(extension, prependContents) {
  function createFullPath(version) {
    return `dist/v0/${extension.name}-${version}.js`;
  }

  let targets = [];
  if (Array.isArray(extension.version)) {
    targets = extension.version.map(createFullPath);
  } else {
    targets.push(createFullPath(extension.version));
  }
  targets.forEach(path => {
    const bundle = new MagicString.Bundle();
    const s = readMagicString(path);
    const index = s.original.indexOf(SPLIT_MARKER);
    const prefix = s.snip(0, index);
    const suffix = s.snip(index + SPLIT_MARKER.length, s.length());
    bundle.addSource(prefix);
    for (let i = 0; i < prependContents.length; i++) {
      bundle.addSource(prependContents[i]);
    }
    bundle.addSource(suffix);
    const map = bundle.generateDecodedMap({hires: true});
    const remapped = resorcery(map, loadSourceMap, !argv.full_sourcemaps);
    fs.writeFileSync(path, bundle.toString(), 'utf8');
    fs.writeFileSync(`${path}.map`, remapped.toString(), 'utf8');
  });
}

/**
 * Copies JS for aliased extensions. (CSS is already dropped in place.)
 */
function copyAliasedExtensions() {
  Object.keys(extensionAliasBundles).forEach(aliasedExtension => {
    const {version, aliasedVersion} = extensionAliasBundles[aliasedExtension];
    const src = `${aliasedExtension}-${version}.js`;
    const dest = `${aliasedExtension}-${aliasedVersion}.js`;
    fs.copySync(`dist/v0/${src}`, `dist/v0/${dest}`);
    fs.copySync(`dist/v0/${src}.map`, `dist/v0/${dest}.map`);
  });
}

/**
 * Cleans up the weak module files written out by closure compiler.
 * @return {!Promise}
 */
function cleanupWeakModuleFiles() {
  const weakModuleJsFile = 'dist/$weak$.js';
  const weakModuleMapFile = 'dist/$weak$.js.map';
  return del([weakModuleJsFile, weakModuleMapFile]);
}

function compile(flagsArray) {
  log('Minifying single-pass JS with', colors.cyan('closure-compiler') + '...');
  // TODO(@cramforce): Run the post processing step
  return new Promise(function(resolve, reject) {
    gulp
      .src(srcs, {base: transformDir})
      .pipe(gulpIf(shouldShortenLicense, shortenLicense()))
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(gulpClosureCompile(flagsArray))
      .on('error', err => {
        handleSinglePassCompilerError();
        reject(err);
      })
      .pipe(gulpIf(!argv.pseudo_names, checkForUnknownDeps()))
      .on('error', reject)
      .pipe(sourcemaps.write('.'))
      .pipe(
        gulpIf(
          /(\/amp-|\/_base)/,
          rename(path => (path.dirname += '/v0'))
        )
      )
      .pipe(gulp.dest('.'))
      .on('end', resolve);
  });
}

/**
 * TODO This should operate on the gulp stream, not on disk files.
 */
function eliminateIntermediateBundles() {
  extensionBundles.forEach(extension => {
    function createFullPath(version) {
      return `dist/v0/${extension.name}-${version}.js`;
    }

    let targets = [];
    if (Array.isArray(extension.version)) {
      targets = extension.version.map(createFullPath);
    } else {
      targets.push(createFullPath(extension.version));
    }
    targets.forEach(path => {
      const map = loadSourceMap(path);
      function returnMapFirst(map) {
        let first = true;
        return function(file) {
          if (first) {
            first = false;
            return map;
          }
          return loadSourceMap(file);
        };
      }
      const {code, map: babelMap} = babel.transformFileSync(path, {
        plugins: conf.eliminateIntermediateBundles(),
        retainLines: true,
        sourceMaps: true,
        inputSourceMap: false,
      });
      let remapped = resorcery(
        babelMap,
        returnMapFirst(map),
        !argv.full_sourcemaps
      );

      const {code: compressed, map: terserMap} = terser.minify(code, {
        mangle: false,
        compress: {
          defaults: false,
          unused: true,
        },
        output: {
          beautify: !!argv.pretty_print,
          comments: 'all',
          keep_quoted_props: true,
        },
        sourceMap: true,
      });

      // TODO: Resorcery should support a chain, instead of having to call
      // multiple times.
      remapped = resorcery(
        terserMap,
        returnMapFirst(remapped),
        !argv.full_sourcemaps
      );

      fs.outputFileSync(path, compressed);
      fs.outputFileSync(`${path}.map`, remapped.toString());
    });
  });
}

function readFile(path) {
  return fs.readFileSync(path, 'utf8').toString();
}

function readMagicString(file) {
  const contents = readFile(file);
  return new MagicString(contents, {filename: file});
}

function loadSourceMap(file) {
  if (file.startsWith('dist')) {
    return readFile(`${file}.map`);
  }
  return null;
}
