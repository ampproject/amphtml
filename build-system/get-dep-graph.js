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
const fs = require('fs');
const mkpath = require('mkpath');
const path = require('path');
const Promise = require('bluebird');
const relativePath = require('path').relative;
const through = require('through2');
const TopologicalSort = require('topological-sort');
const {extensionBundles, TYPES} = require('../bundles.config');
const TYPES_VALUES = Object.keys(TYPES).map(x => TYPES[x]);

// Override to local closure compiler JAR
ClosureCompiler.JAR_PATH = require.resolve('./runner/dist/runner.jar');

//patchRegisterElement();
patchWebAnimations();
patchDompurify();

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
    externs: path.dirname(module.filename) + '/splittable.extern.js',
    define: ['PSEUDO_NAMES=true'],
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
  let packageCount = 0;
  Object.keys(g.packages).sort().forEach(function(pkg) {
    flagsArray.push('--js', pkg);
    packageCount++;
  });

  // Build up the weird flag structure that closure compiler calls
  // modules and we call bundles.
  const bundleKeys = Object.keys(g.bundles).sort();
  // TODO(erwinm): special case src/amp.js and _base for now. add a propert sort
  // comparator here.
  const indexOfBase = bundleKeys.indexOf('_base');
  bundleKeys.splice(indexOfBase, 1);
  bundleKeys.splice(0, 0, '_base');
  const indexOfAmp = bundleKeys.indexOf('src/amp.js');
  bundleKeys.splice(indexOfAmp, 1);
  bundleKeys.splice(1, 0, 'src/amp.js');

  bundleKeys.forEach(function(originalName) {
    const isBase = originalName == '_base';
    const isMain = originalName == 'src/amp.js';
    let extraModules = 0;
    // TODO(erwinm): This access will break
    const bundle = g.bundles[originalName];
    if (isBase || bundleKeys.length == 1) {
      flagsArray.push('--js', relativePath(process.cwd(),
          require.resolve('./base.js')));
      extraModules++;
      Object.keys(g.browserMask).sort().forEach(function(mask) {
        flagsArray.push('--js', mask);
        extraModules++;
      });
    }
    bundle.modules.forEach(function(js) {
      flagsArray.push('--js', js);
    });
    if (!isBase && bundleKeys.length > 1) {
      // TODO(erwinm): do we still need the bundleTrailModule?
      //flagsArray.push('--js', bundleTrailModule(bundle.name));
      //extraModules++;
    }
    // The packages count as inputs to the first module.
    if (packageCount) {
      extraModules += packageCount;
      packageCount = 0;
    }
    // Replace directory separator with - in bundle filename
    const name = bundle.name
        .replace(/\.js$/g, '')
        .replace(/[\/\\]/g, '-');
    // And now build --module $name:$numberOfJsFiles:$bundleDeps
    let cmd = name + ':' + (bundle.modules.length + extraModules);
    // All non _base bundles depend on _base.
    if (!isBase && g.bundles._base) {
      const configEntry = getExtensionBundleConfig(originalName);
      if (configEntry) {
        cmd += `:${configEntry.type}`;
      } else {
        // All lower tier bundles depend on src-amp (v0.js)
        if (name.includes(TYPES_VALUES)) {
          cmd += ':src-amp';
        } else {
          cmd += ':_base';
        }
      }
    }
    flagsArray.push('--module', cmd);
    if (bundleKeys.length > 1) {
      if (isBase) {
        flagsArray.push('--module_wrapper', name + ':' +
            exports.baseBundleWrapper);
      } else {
        if (isMain) {
          flagsArray.push('--module_wrapper', name + ':' +
              exports.mainBinaryWrapper);
        } else {
          flagsArray.push('--module_wrapper', name + ':' +
              exports.bundleWrapper);
        }
      }
    } else {
      flagsArray.push('--module_wrapper', name + ':' +
            exports.defaultWrapper);
    }
  });
  flagsArray.push('--js_module_root', './build/patched-module/');
  flagsArray.push('--js_module_root', './node_modules/');
  flagsArray.push('--js_module_root', './');
  fs.writeFileSync('flags-array.txt', JSON.stringify(flagsArray, null, 2));
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
      // We always have a _base bundle.
      _base: {
        isBase: true,
        name: '_base',
        // The modules in the bundle.
        modules: [],
      },
    },
    packages: {},
    browserMask: {},
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
        //const depId = row.deps[dep];
        const relPathtoDep = unifyPath(relativePath(process.cwd(),
            row.deps[dep]));

        // TODO(erwimm): don't parse package.json, breaks closure right now.
        // Non relative module path. Find the package.json.
        //if (!/^\./.test(dep)) {
        //var packageJson = findPackageJson(depId);
        //if (packageJson) {
        //graph.packages[packageJson] = true;
        //}
        //}
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

    //buildUpCommon(graph);

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
        const type = configEntry ? configEntry.type : '_base';
        bundleDestCandidates.push(type);
      }
    });
    console/*OK*/.assert(inBundleCount >= 1,
        'Should be in at least 1 bundle', id, 'Bundle count',
        inBundleCount, graph.depOf);
    // If a module is in more than 1 bundle, it must go into _base.
    if (bundleDestCandidates.length > 1) {
      const first = bundleDestCandidates[0];
      const allTheSame = bundleDestCandidates.some(c => c == first);
      const needsBase = bundleDestCandidates.some(c => c == '_base');
      dest = '_base';
      if (allTheSame) {
        dest = first;
      } else if (!needsBase) {
        // Comment out when merging PR that introduces intermediate bundle.
        // dest = '_intermediate'
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

  // No need for a base module if there was only one entry module.
  if (graph.entryModules.length == 1) {
    delete graph.bundles._base;
  }
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
  //'third_party/closure-compiler/externs/intersection_observer.js',
  'third_party/closure-compiler/externs/performance_observer.js',
  //'third_party/closure-compiler/externs/shadow_dom.js',
  //'third_party/closure-compiler/externs/streams.js',
  'third_party/closure-compiler/externs/web_animations.js',
  'third_party/moment/moment.extern.js',
  'third_party/react-externs/externs.js',
];

const systemImport =
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

const nodeEmulation = 'self.global=self;';

exports.mainBinaryWrapper = 'try{(function(){%s})()}catch(e){' +
  'setTimeout(function(){' +
  'var s=document.body.style;' +
  's.opacity=1;' +
  's.visibility="visible";' +
  's.animation="none";' +
  's.WebkitAnimation="none;"},1000);throw e};' +
  '//# sourceMappingURL=%basename%.map\n';

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
exports.bundleWrapper = '(self.AMP=self.AMP||[]).push({n:"%basename%", ' +
    'v:"$internalRuntimeVersion$", f:(function(){%s})});\n' +
    '//# sourceMappingURL=%basename%.map\n';


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
let extensions = extensionBundles.filter(unsupportedExtensions).map(ext => {
  return buildFullPathFromConfig(ext);
});
// Flatten nested arrays to support multiple versions
extensions = [].concat.apply([], extensions);

exports.getFlags({
  modules: ['src/amp.js'].concat(extensions),
  writeTo: './out/',
  externs,
}).then(compile);

function compile(flagsArray) {
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


function patchRegisterElement() { // eslint-disable-line no-unused-vars
  let file;
  // Copies document-register-element into a new file that has an export.
  // This works around a bug in closure compiler, where without the
  // export this module does not generate a goog.provide which fails
  // compilation.
  // Details https://github.com/google/closure-compiler/issues/1831
  const patchedName = 'build/patched-module/document-register-element' +
      '/build/document-register-element.node.js';
  if (!fs.existsSync(patchedName)) {
    file = fs.readFileSync(
        'node_modules/document-register-element/build/' +
        'document-register-element.node.js').toString();
    // Closure Compiler does not generate a `default` property even though
    // to interop CommonJS and ES6 modules. This is the same issue typescript
    // ran into here https://github.com/Microsoft/TypeScript/issues/2719
    file = file.replace('module.exports = installCustomElements;',
        'exports.default = installCustomElements;');
    fs.writeFileSync(patchedName, file);
  }
}

function patchWebAnimations() {
  // Copies web-animations-js into a new file that has an export.
  const patchedName = 'node_modules/web-animations-js/' +
      'web-animations.install.js';
  if (fs.existsSync(patchedName)) {
    return;
  }
  let file = fs.readFileSync(
      'node_modules/web-animations-js/' +
      'web-animations.min.js').toString();
  // Wrap the contents inside the install function.
  file = 'exports.installWebAnimations = function(window) {\n' +
      'var document = window.document;\n' +
      file + '\n' +
      '}\n';
  fs.writeFileSync(patchedName, file);
}

function patchDompurify() {
  // Copies web-animations-js into a new file that has an export.
  const name = 'node_modules/dompurify/package.json';
  const file = fs.readFileSync(name).toString()
      .replace('"browser": "dist/purify.js",', '');
  fs.writeFileSync(name, file);
}
