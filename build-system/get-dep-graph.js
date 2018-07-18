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

const babel = require('babelify');
const browserify = require('browserify');
const ClosureCompiler = require('google-closure-compiler').compiler;
const devnull = require('dev-null');
const fs = require('fs-extra');
const move = require('glob-move');
const path = require('path');
const Promise = require('bluebird');
const relativePath = require('path').relative;
const through = require('through2');
const TopologicalSort = require('topological-sort');
const {extensionBundles, TYPES} = require('../bundles.config');
const TYPES_VALUES = Object.keys(TYPES).map(x => TYPES[x]);
const wrappers = require('./compile-wrappers');

// Override to local closure compiler JAR
ClosureCompiler.JAR_PATH = require.resolve('./runner/dist/runner.jar');

const mainBundle = 'src/amp.js';
const extensionsInfo = {};
let extensions = extensionBundles.filter(unsupportedExtensions).map(ext => {
  const path = buildFullPathFromConfig(ext);
  if (Array.isArray(path)) {
    path.forEach((p, index) => {
      extensionsInfo[p] = Object.create(ext);
      extensionsInfo[p].filename = ext.name + '-' + ext.version[index];
    });
  } else {
    extensionsInfo[path] = Object.create(ext);
    extensionsInfo[path].filename = ext.name + '-' + ext.version;
  }
  return path;
});
// Flatten nested arrays to support multiple versions
extensions = [].concat.apply([], extensions);

exports.splittable = function(config) {

  if (!config || !config.modules) {
    return Promise.reject(
        new Error('Pass an array of entry modules via modules option. ' +
            'Example: {modules: ["./first", "./second"]}'));
  }

  return exports.getFlags(config).then(function(flagsArray) {
    return new Promise(function(resolve, reject) {
      new ClosureCompiler(flagsArray).run(function(exitCode, stdOut, stdErr) {
        if (exitCode == 0) {
          resolve({
            warnings: config.warnings ? stdErr : null,
          });
        } else {
          reject(
              new Error('Closure compiler compilation of bundles failed.\n' +
                  stdOut + '\n' +
                  stdErr));
        }
      });
    });
  });
};


exports.getFlags = function(config) {
  /* eslint "google-camelcase/google-camelcase": 0 */
  // Reasonable defaults.
  const flags = {
    compilation_level: 'ADVANCED',
    process_common_js_modules: true,
    rewrite_polyfills: true,
    create_source_map: '%outname%.map',
    parse_inline_source_maps: true,
    apply_input_source_maps: true,
    source_map_location_mapping: [
      '|/',
    ],
    //new_type_inf: true,
    language_in: 'ES6',
    language_out: 'ES5',
    module_output_path_prefix: config.writeTo || 'out/',
    externs: [
      path.dirname(module.filename) + '/splittable.extern.js',
      './build-system/amp.extern.js',
      // 'third_party/closure-compiler/externs/intersection_observer.js',
      'third_party/closure-compiler/externs/performance_observer.js',
      // 'third_party/closure-compiler/externs/shadow_dom.js',
      // 'third_party/closure-compiler/externs/streams.js',
      'third_party/closure-compiler/externs/web_animations.js',
      'third_party/moment/moment.extern.js',
      'third_party/react-externs/externs.js',
    ],
    define: [
      'PSEUDO_NAMES=true',
      'SINGLE_FILE_COMPILATION=true',
    ],
    jscomp_off: [
      'accessControls',
      'globalThis',
      'misplacedTypeAnnotation',
      'nonStandardJsDocs',
      'suspiciousCode',
      'uselessCode',
    ],
  };

  // Turn object into deterministically sorted array.
  const flagsArray = [];
  Object.keys(flags).sort().forEach(function(flag) {
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
    return flagsArray.concat(
        exports.getBundleFlags(g, flagsArray));
  });
};

exports.getBundleFlags = function(g) {
  const flagsArray = [];

  // Write all the packages (directories with a package.json) as --js
  // inputs to the flags. Closure compiler reads the packages to resolve
  // non-relative module names.
  Object.keys(g.packages).sort().forEach(function(pkg) {
    flagsArray.push('--js', pkg);
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
      flagsArray.push('--js', js);
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
        throw new Error('Unexpected missing extension info ' + bundle.name);
      }
      name = bundle.name;
      info = {
        name,
      };
    }
    // And now build --module $name:$numberOfJsFiles:$bundleDeps
    let cmd = name + ':' + (bundle.modules.length);
    const bundleDeps = [];
    if (!isMain) {
      const configEntry = getExtensionBundleConfig(originalName);
      if (configEntry) {
        cmd += `:${configEntry.type}`;
        bundleDeps.push('_base_i', configEntry.type);
      } else {
        // All lower tier bundles depend on v0.js
        if (TYPES_VALUES.includes(name)) {
          cmd += ':_base_i';
          bundleDeps.push('_base_i');
        } else {
          cmd += ':v0';
        }
      }
    }
    flagsArray.push('--module', cmd);
    if (bundleKeys.length > 1) {
      function massageWrapper(w) {
        return (w.replace('<%= contents %>', '%s')
        /*+ '\n//# sourceMappingURL=%basename%.map\n'*/);
      }
      if (isMain) {
        flagsArray.push('--module_wrapper', name + ':' +
            massageWrapper(wrappers.mainBinary));
      } else {
        flagsArray.push('--module_wrapper', name + ':' +
           massageWrapper(wrappers.extension(
               info.name, info.loadPriority, bundleDeps)));
      }
    } else {
      throw new Error('Expect to build more than one bundle.');
    }
  });
  flagsArray.push('--js_module_root', './build/patched-module/');
  flagsArray.push('--js_module_root', './node_modules/');
  flagsArray.push('--js_module_root', './');
  return flagsArray;
};

exports.getGraph = function(entryModules, config) {
  let resolve;
  let reject;
  const promise = new Promise(function(res, rej) {
    resolve = res;
    reject = rej;
  });
  const topo = new TopologicalSort({});
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
  })
  // The second stage are transforms that closure compiler supports
  // directly and which we don't want to apply during deps finding.
      .transform(babel, {
        babelrc: false,
        plugins: [
          require.resolve('babel-plugin-transform-es2015-modules-commonjs'),
        ],
      });
  // This gets us the actual deps. We collect them in an array, so
  // we can sort them prior to building the dep tree. Otherwise the tree
  // will not be stable.
  const depEntries = [];
  b.pipeline.get('deps').push(through.obj(function(row, enc, next) {
    row.source = null; // Release memory
    depEntries.push(row);
    next();
  }));

  b.bundle().on('end', function() {
    const edges = {};
    depEntries.sort(function(a, b) {
      return a.id < b.id;
    }).forEach(function(row) {
      const id = unifyPath(exports.maybeAddDotJs(
          relativePath(process.cwd(), row.id)));
      topo.addNode(id, id);
      const deps = edges[id] = Object.keys(row.deps).sort().map(function(dep) {
        return unifyPath(relativePath(process.cwd(),
            row.deps[dep]));
      });
      graph.deps[id] = deps;
      if (row.entry) {
        graph.depOf[id] = {};
        graph.depOf[id][id] = true; // Self edge.
        deps.forEach(function(dep) {
          graph.depOf[id][dep] = true;
        });
      }
    });
    Object.keys(edges).sort().forEach(function(id) {
      edges[id].forEach(function(dep) {
        topo.addEdge(id, dep);
      });
    });
    graph.sorted = Array.from(topo.sort().keys()).reverse();

    setupBundles(graph);
    resolve(graph);
    fs.writeFileSync('deps.txt', JSON.stringify(graph, null, 2));
  }).on('error', reject).pipe(devnull());
  return promise;
};

function setupBundles(graph) {
  // For each module, mark them as to whether any of the entry
  // modules depends on them (transitively).
  Array.from(graph.sorted).reverse().forEach(function(id) {
    graph.deps[id].forEach(function(dep) {
      Object.keys(graph.depOf).sort().forEach(function(entry) {
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
    Object.keys(graph.depOf).sort().forEach(function(entry) {
      if (graph.depOf[entry][id]) {
        inBundleCount++;
        dest = entry;
        const configEntry = getExtensionBundleConfig(entry);
        const type = configEntry ? configEntry.type : mainBundle;
        bundleDestCandidates.push(type);
      }
    });
    console/*OK*/.assert(inBundleCount >= 1,
        'Should be in at least 1 bundle', id, 'Bundle count',
        inBundleCount, graph.depOf);
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

// Returns the extension bundle config for the given filename or null.
function getExtensionBundleConfig(filename) {
  const basename = path.basename(filename, '.js');
  return extensionBundles.filter(x => x.name == basename)[0];
}

const knownExtensions = {
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

const externs = [
  'build-system/amp.extern.js',
  'third_party/closure-compiler/externs/performance_observer.js',
  'third_party/closure-compiler/externs/web_animations.js',
  'third_party/moment/moment.extern.js',
  'third_party/react-externs/externs.js',
];

function buildFullPathFromConfig(ext) {
  function getPath(version) {
    return `extensions/${ext.name}/${version}/${ext.name}.js`;
  }

  if (Array.isArray(ext.version)) {
    return ext.version.map(ver => getPath(ver));
  }
  return getPath(ext.version);
}

function unsupportedExtensions(name) {
  return name;
}

exports.getFlags({
  modules: ['src/amp.js'].concat(extensions),
  writeTo: './out/',
  externs,
}).then(compile).then(function() {
  // Move things into place as AMP expects them.
  fs.ensureDirSync('out/v0');
  return Promise.all([
    move('out/amp*', 'out/v0'),
    move('out/_base*', 'out/v0'),
  ]);
});

function compile(flagsArray) {
  fs.writeFileSync('flags-array.txt', JSON.stringify(flagsArray, null, 2));
  return new Promise(function(resolve, reject) {
    new ClosureCompiler(flagsArray).run(function(exitCode, stdOut, stdErr) {
      if (exitCode == 0) {
        resolve({
          warnings: null,
        });
      } else {
        reject(
            new Error('Closure compiler compilation of bundles failed.\n' +
                stdOut + '\n' +
                stdErr));
      }
    });
  });
}
