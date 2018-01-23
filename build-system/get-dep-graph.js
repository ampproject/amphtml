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
const devnull = require('dev-null');
const findPackageJsonPath = require('find-root');
const fs = require('fs');
const mkpath = require('mkpath');
const path = require('path');
const Promise = require('bluebird');
const relativePath = require('path').relative;
const through = require('through2');
const TopologicalSort = require('topological-sort');

const knownExtensions = {
  js: true,
  es: true,
  es6: true,
  json: true,
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
      // We always have a _base bundle.
      _base: {
        isBase: true,
        name: '_base',
        // The modules in the bundle.
        modules: [],
      },
    },
    packages: {},
    // Map of original to transformed filename.
    transformed: {},
    browserMask: {},
  };

  config.babel = config.babel || {};

  // Use browserify with babel to learn about deps.
  const b = browserify(entryModules, {
    debug: true,
    deps: true,
    detectGlobals: false,
  })
      // We register 2 separate transforms. The initial stage are
      // transforms that closure compiler does not support.
      .transform(babel, {
        babelrc: !!config.babel.babelrc,
        plugins: config.babel.plugins || [
          require.resolve('babel-plugin-transform-react-jsx'),
        ],
        presets: config.babel.presets,
      })
      // The second stage are transforms that closure compiler supports
      // directly and which we don't want to apply during deps finding.
      .transform(babel, {
        babelrc: false,
        plugins: [
          require.resolve('babel-plugin-transform-es2015-modules-commonjs'),
        ],
      });

  b.on('package', function(pkg) {
    if (!pkg.browser) {
      return;
    }
    Object.keys(pkg.browser).sort().forEach(function(entry) {
      if (/^\./.test(entry)) {
        throw new Error(
            'Relative entries in package.json#browser not yet supported: ' +
            entry + ' [' + pkg.__dirname + '.package.json]');
      }
      if (pkg.browser[entry] !== false) {
        throw new Error(
            'Only masking of entire modules via false supported in ' +
            'package.json#browser:' + entry +
            ' [' + pkg.__dirname + '.package.json]');
      }
      let filename =
          'splittable-build/browser/node_modules/' + entry;
      const maskedPkg = 'splittable-build/browser/node_modules/' +
          entry.split('/')[0] + '/package.json';
      if (!/\//.test(entry)) {
        filename += '/index';
      }
      filename = exports.maybeAddDotJs(filename);
      if (graph.browserMask[filename]) {
        return;
      }
      graph.browserMask[filename] = true;
      mkpath.sync(path.dirname(filename));
      fs.writeFileSync(filename,
          '// Generated to mask module via package.json#browser.\n' +
          'module.exports = {};\n');
      if (graph.browserMask[pkg]) {
        return;
      }
      graph.browserMask[maskedPkg] = true;
      fs.writeFileSync(maskedPkg,
          '{"Generated to mask module via package.json#browser":true}\n');
    });
  });

  // TODO: Replace with proper plugin system.
  const seenTransform = {};
  b.on('transform', function(tr) {
    if (tr instanceof babel) {
      tr.once('babelify', function(result, filename) {
        if (seenTransform[filename]) {
          return; // We only care about the first transform per file.
        }
        seenTransform[filename] = true;
        filename = relativePath(process.cwd(), filename);
        // Copy transformed code into shadow path. Files in this path
        // have precedence over regular relative paths.
        const target = './splittable-build/transformed/' + filename;
        mkpath.sync(path.dirname(target));
        fs.writeFileSync(target, result.code);
        graph.transformed[filename] = target;
      });
    }
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
        const depId = row.deps[dep];
        const relPathtoDep = unifyPath(relativePath(process.cwd(),
            row.deps[dep]));

        // Non relative module path. Find the package.json.
        if (!/^\./.test(dep)) {
          const packageJson = findPackageJson(depId);
          if (packageJson) {
            graph.packages[packageJson] = true;
          }
        }
        return relPathtoDep;
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
  }).on('error', reject).pipe(devnull());
  return promise;
};

function unifyPath(id) {
  return id.split(path.sep).join('/');
}

/**
 * Given a module path, return the path to the relevant package.json or
 * null. Returns null if the module is not inside a node_modules directory.
 * @return {?string}
 */
function findPackageJson(modulePath) {
  if (modulePath.split(path.sep).indexOf('node_modules') == -1) {
    return null;
  }
  return relativePath(process.cwd(),
      findPackageJsonPath(modulePath) + '/package.json');
}

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
    // Count in how many bundles a modules wants to be.
    Object.keys(graph.depOf).sort().forEach(function(entry) {
      if (graph.depOf[entry][id]) {
        inBundleCount++;
        dest = entry;
      }
    });
    console/*OK*/.assert(inBundleCount >= 1,
        'Should be in at least 1 bundle', id, 'Bundle count',
        inBundleCount, graph.depOf);
    // If a module is in more than 1 bundle, it must go into _base.
    if (inBundleCount > 1) {
      dest = '_base';
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

  // No need for a base module if there was only one entry module.
  if (graph.entryModules.length == 1) {
    delete graph.bundles._base;
  }
}

exports.maybeAddDotJs = function(id) {
  const extensionMatch = id.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : null;
  if (!knownExtensions[extension]) {
    id += '.js';
  }
  return id;
};
