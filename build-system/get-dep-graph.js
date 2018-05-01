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

var ClosureCompiler = require('google-closure-compiler').compiler;
var Promise = require('bluebird');
var babel = require('babelify');
var browserify = require('browserify');
var through = require('through2');
var devnull = require('dev-null');
var relativePath = require('path').relative;
var path = require('path');
var fs = require('fs');
var mkpath = require('mkpath');
var findPackageJsonPath = require('find-root');
const TopologicalSort = require('topological-sort');

// Override to local closure compiler JAR
//ClosureCompiler.JAR_PATH = require.resolve(
    //'./third_party/closure-compiler/closure-compiler-1.0-SNAPSHOT.jar');

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
    })
  });
};


exports.getFlags = function(config) {
  // Reasonable defaults.
  var flags = {
    compilation_level: 'ADVANCED',
    process_common_js_modules: true,
    rewrite_polyfills: true,
    create_source_map: '%outname%.map',
    parse_inline_source_maps: true,
    apply_input_source_maps: true,
    source_map_location_mapping: [
      'splittable-build/transformed/|/',
      'splittable-build/browser/|/',
      '|/',
    ],
    new_type_inf: true,
    language_in: 'ES6',
    language_out: 'ES5',
    module_output_path_prefix: config.writeTo || 'out/',
    externs: path.dirname(module.filename) + '/splittable.extern.js',
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
  var flagsArray = [];
  Object.keys(flags).sort().forEach(function(flag) {
    var val = flags[flag];
    if (val instanceof Array) {
      val.forEach(function(item) {
        flagsArray.push('--' + flag, item);
      })
    } else {
      flagsArray.push('--' + flag, val);
    }
  });

  return exports.getGraph(config.modules, config).then(function(g) {
    return flagsArray.concat(
        exports.getBundleFlags(g, flagsArray));
  });
};

exports.getBundleFlags = function(g) {
  var flagsArray = [];

  // Write all the packages (directories with a package.json) as --js
  // inputs to the flags. Closure compiler reads the packages to resolve
  // non-relative module names.
  var packageCount = 0;
  Object.keys(g.packages).sort().forEach(function(package) {
    flagsArray.push('--js', package);
    packageCount++;
  });
  // Build up the weird flag structure that closure compiler calls
  // modules and we call bundles.
  var bundleKeys = Object.keys(g.bundles);
  bundleKeys.sort().forEach(function(name) {
    var isBase = name == '_base';
    var extraModules = 0;
    var bundle = g.bundles[name];
    if (isBase || bundleKeys.length == 1) {
      flagsArray.push('--js', relativePath(process.cwd(),
          require.resolve('./base.js')));
      extraModules++;
      Object.keys(g.browserMask).sort().forEach(function(mask) {
        flagsArray.push('--js', mask);
        extraModules++;
      });
    }
    // In each bundle, first list JS files that belong into it.
    bundle.modules.forEach(function(js) {
      if (g.transformed[js]) {
        js = g.transformed[js];
      }
      flagsArray.push('--js', js);
    });
    if (!isBase && bundleKeys.length > 1) {
      flagsArray.push('--js', bundleTrailModule(bundle.name));
      extraModules++;
    }
    // The packages count as inputs to the first module.
    if (packageCount) {
      extraModules += packageCount;
      packageCount = 0;
    }
    // Replace directory separator with - in bundle filename
    var name = bundle.name
        .replace(/\.js$/g, '')
        .replace(/[\/\\]/g, '-');
    // And now build --module $name:$numberOfJsFiles:$bundleDeps
    var cmd = name + ':' + (bundle.modules.length + extraModules);
    // All non _base bundles depend on _base.
    if (!isBase && g.bundles._base) {
      cmd += ':_base';
    }
    flagsArray.push('--module', cmd);
    if (bundleKeys.length > 1) {
      if (isBase) {
        flagsArray.push('--module_wrapper', name + ':' +
            exports.baseBundleWrapper);
      } else {
        flagsArray.push('--module_wrapper', name + ':' +
            exports.bundleWrapper);
      }
    } else {
      flagsArray.push('--module_wrapper', name + ':' +
            exports.defaultWrapper);
    }
  });
  flagsArray.push('--js_module_root', './splittable-build/transformed/');
  flagsArray.push('--js_module_root', './splittable-build/browser/');
  flagsArray.push('--js_module_root', './');
  return flagsArray;
}

/**
 * Produces a graph based on the dependencies of the entry modules.
 * @param {!Array<string>} entryModules
 * @return {!Promise<{bundles: !Object}>} A Promise for bundle definitions.
 * @visibleForTesting
 */
exports.getGraph = function(entryModules, config) {
  var resolve;
  var reject;
  var promise = new Promise(function(res, rej) {
    resolve = res;
    reject = rej;
  });
  var topo = new TopologicalSort({});
  var graph = {
    entryModules: entryModules,
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
  var b = browserify(entryModules, {
    debug: true,
    deps: true,
    detectGlobals: false,
  })
  // We register 2 separate transforms. The initial stage are
  // transforms that closure compiler does not support.
  .transform(babel, {
    babelrc: !!config.babel.babelrc,
    plugins: config.babel.plugins || [
      require.resolve("babel-plugin-transform-react-jsx"),
    ],
    presets: config.babel.presets,
  }).
  // The second stage are transforms that closure compiler supports
  // directly and which we don't want to apply during deps finding.
  transform(babel, {
    babelrc: false,
    plugins: [
      require.resolve("babel-plugin-transform-es2015-modules-commonjs"),
    ]
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
      var filename =
          'splittable-build/browser/node_modules/' + entry;
      var maskedPkg = 'splittable-build/browser/node_modules/' +
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
  var seenTransform = {};
  b.on('transform', function(tr) {
    //if (tr instanceof babel) {
      //tr.once("babelify", function(result, filename) {
        //if (seenTransform[filename]) {
          //return;  // We only care about the first transform per file.
        //}
        //seenTransform[filename] = true;
        //filename = relativePath(process.cwd(), filename);
        //// Copy transformed code into shadow path. Files in this path
        //// have precedence over regular relative paths.
        //var target = './splittable-build/transformed/' + filename;
        //mkpath.sync(path.dirname(target));
        //fs.writeFileSync(target, result.code);
        //graph.transformed[filename] = target;
      //});
    //}
  });
  // This gets us the actual deps. We collect them in an array, so
  // we can sort them prior to building the dep tree. Otherwise the tree
  // will not be stable.
  var depEntries = [];
  b.pipeline.get('deps').push(through.obj(function(row, enc, next) {
    row.source = null;  // Release memory
    depEntries.push(row);
    next();
  }));

  b.bundle().on('end', function() {
    var edges = {};
    depEntries.sort(function(a, b) {
      return a.id < b.id;
    }).forEach(function(row) {
      var id = unifyPath(exports.maybeAddDotJs(
          relativePath(process.cwd(), row.id)));
      topo.addNode(id, id);
      var deps = edges[id] = Object.keys(row.deps).sort().map(function(dep) {
        var depId = row.deps[dep];
        var relPathtoDep = unifyPath(relativePath(process.cwd(), row.deps[dep]));

        // Non relative module path. Find the package.json.
        if (!/^\./.test(dep)) {
          var packageJson = findPackageJson(depId);
          if (packageJson) {
            graph.packages[packageJson] = true;
          }
        }
        return relPathtoDep;
      });
      graph.deps[id] = deps;
      if (row.entry) {
        graph.depOf[id] = {};
        graph.depOf[id][id] = true;  // Self edge.
        deps.forEach(function(dep) {
          graph.depOf[id][dep] = true;
        });
      }
    });
    Object.keys(edges).sort().forEach(function(id) {
      edges[id].forEach(function(dep) {
        topo.addEdge(id, dep);
      })
    });
    graph.sorted = Array.from(topo.sort().keys()).reverse();

    setupBundles(graph);

    resolve(graph);
  }).on('error', reject).pipe(devnull());
  return promise;
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
    var inBundleCount = 0;
    // The bundle a module should go into.
    var dest;
    // Count in how many bundles a modules wants to be.
    Object.keys(graph.depOf).sort().forEach(function(entry) {
      if (graph.depOf[entry][id]) {
        inBundleCount++;
        dest = entry;
      }
    })
    console.assert(inBundleCount >= 1,
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

var knownExtensions = {
  js: true,
  es: true,
  es6: true,
  json: true,
};

exports.maybeAddDotJs = function(id) {
  var extensionMatch = id.match(/\.([a-zA-Z0-9]+)$/);
  var extension = extensionMatch ? extensionMatch[1].toLowerCase() : null;
  if (!knownExtensions[extension]) {
    id += '.js'
  }
  return id;
}

function bundleTrailModule(name) {
  if (!fs.existsSync('./splittable-build')) {
    fs.mkdirSync('./splittable-build');
  }
  var tmp = require('tmp').fileSync({
    template: './splittable-build/tmp-XXXXXX.js'
  });

  var js = '// Generated code to get module ' + name + '\n' +
      '(self["_S"]=self["_S"]||[])["//' + name + '"]=' +
      'require("' + relativePath(path.dirname(tmp.name), name) + '")\n';
  fs.writeFileSync(tmp.name, js, 'utf8');
  return relativePath(process.cwd(), tmp.name);
}

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

let externs = [
  'build-system/amp.extern.js',
  //'third_party/closure-compiler/externs/intersection_observer.js',
  'third_party/closure-compiler/externs/performance_observer.js',
  //'third_party/closure-compiler/externs/shadow_dom.js',
  //'third_party/closure-compiler/externs/streams.js',
  'third_party/closure-compiler/externs/web_animations.js',
  'third_party/moment/moment.extern.js',
  'third_party/react-externs/externs.js',
];

var systemImport =
    // Polyfill and/or monkey patch System.import.
    '(self.System=self.System||{}).import=function(n){' +
    // Always end names in .js
    'n=n.replace(/\\.js$/g,"")+".js";' +
    // Short circuit if the bundle is already loaded.
    'return (self._S["//"+n]&&Promise.resolve(self._S["//"+n]))' +
    // Short circuit if we are already loadind, otherwise create
    // a promise (that will short circuit subsequent requests)
    // and start loading.
    '||self._S[n]||(self._S[n]=new Promise(function(r,t){' +
    // Load via a script
    'var s=document.createElement("script");' +
    // Calculate the source URL using the same algorithms as used
    // during bundle generation.
    's.src=(self.System.baseURL||".")+"/"+n.replace(/[\\/\\\\]/g,"-");' +
    // Fail promise on any error.
    's.onerror=t;' +
    // On success the trailing module in every bundle will have created
    // the _S global representing the module object that is the root
    // of the bundle. Resolve the promise with it.
    's.onload=function(){r(self._S["//"+n])};' +
    // Append the script tag.
    '(document.head||document.documentElement).appendChild(s);' +
    '})' +
    ')};\n';

var nodeEmulation = 'self.global=self;';

exports.defaultWrapper = nodeEmulation + '%s\n' +
     '//# sourceMappingURL=%basename%.map\n';

// Don't wrap the bundle itself in a closure (other bundles need
// to be able to see it), but add a little async executor for
// scheduled functions.
exports.baseBundleWrapper =
    // Declaring a few variables that are used in node modules to increase
    // compatiblity.
    nodeEmulation +
    '%s\n' +
    systemImport +
    // Runs scheduled non-base bundles in the _S array and overrides
    // .push to immediately execute incoming bundles.
    '(self._S=self._S||[]).push=function(f){f.call(self)};' +
    '(function(f){while(f=self._S.shift()){f.call(self)}})();\n' +
    '//# sourceMappingURL=%basename%.map\n';

// Schedule or execute bundle via _S global.
exports.bundleWrapper =
    '(self._S=self._S||[]).push((function(){%s}));\n' +
    '//# sourceMappingURL=%basename%.map\n';

function bundleTrailModule(name) {
  if (!fs.existsSync('./splittable-build')) {
    fs.mkdirSync('./splittable-build');
  }
  var tmp = require('tmp').fileSync({
    template: './splittable-build/tmp-XXXXXX.js'
  });

  var js = '// Generated code to get module ' + name + '\n' +
      '(self["_S"]=self["_S"]||[])["//' + name + '"]=' +
      'require("' + relativePath(path.dirname(tmp.name), name) + '")\n';
  fs.writeFileSync(tmp.name, js, 'utf8');
  return relativePath(process.cwd(), tmp.name);
}


exports.getFlags({
  //modules: Array.apply(null, Array(10)).map((x, i) => {
      //return `./extensions/amp-audio-${i + 1}/0.1/amp-audio-${i + 1}.js`;
    //}),
  modules: [
    './extensions/amp-audio-1/0.1/amp-audio-1.js',
    //'./extensions/amp-audio-2/0.1/amp-audio-2.js',
    './extensions/amp-live-list/0.1/amp-live-list.js',
    //'./src/amp.js',
  ],
  writeTo: './sample/out/',
  externs: externs,
}).then(function(flagsArray) {
  return new Promise(function(resolve, reject) {
    console.log(flagsArray);
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
  })
});

