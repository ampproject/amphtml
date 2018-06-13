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
ClosureCompiler.JAR_PATH = require.resolve(
    './runner/dist/runner.jar');
//ClosureCompiler.JAR_PATH = require.resolve(
    //'../third_party/closure-compiler/compiler.jar');

patchRegisterElement();
patchWebAnimations();

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
  var flagsArray = [];
  Object.keys(flags).sort().forEach(function(flag) {
    var val = flags[flag];
    if (val instanceof Array) {
      val.forEach(function(item) {
        flagsArray.push('--' + flag, item);
      })
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
    var isMain = name == 'src/amp.js';
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
      //flagsArray.push('--js', bundleTrailModule(bundle.name));
      //extraModules++;
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
        console.log('a', name);
        //flagsArray.push('--module_wrapper', name + ':' +
            //exports.baseBundleWrapper);
      } else {
        if (isMain) {
        //console.log('b', name);
          flagsArray.push('--module_wrapper', name + ':' +
              exports.mainBinaryWrapper);
        } else {
        console.log('c', name);
          flagsArray.push('--module_wrapper', name + ':' +
              exports.bundleWrapper);
        }
      }
    } else {
        console.log('d', name);
      flagsArray.push('--module_wrapper', name + ':' +
            exports.defaultWrapper);
    }
  });
  flagsArray.push('--js_module_root', './splittable-build/transformed/');
  flagsArray.push('--js_module_root', './splittable-build/browser/');
  flagsArray.push('--js_module_root', './build/patched-module/');
  flagsArray.push('--js_module_root', './node_modules/');
  flagsArray.push('--js_module_root', './');
  fs.writeFileSync('flags-array.txt', JSON.stringify(flagsArray, null, 2));
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
    fs.writeFileSync('deps.txt', JSON.stringify(graph, null, 2));
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
exports.bundleWrapper = '(self.AMP=self.AMP||[]).push({n:"%basename%", v:"erwin", f:(function(){%s})});\n' +
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

const all = [
'./src/amp.js',
'./extensions/amp-3d-gltf/0.1/amp-3d-gltf.js',
'./extensions/amp-3q-player/0.1/amp-3q-player.js',
'./extensions/amp-a4a/0.1/amp-a4a.js',
'./extensions/amp-access-laterpay/0.1/amp-access-laterpay.js',
'./extensions/amp-access-scroll/0.1/amp-access-scroll.js',
'./extensions/amp-access/0.1/amp-access.js',
'./extensions/amp-accordion/0.1/amp-accordion.js',
'./extensions/amp-ad-exit/0.1/amp-ad-exit.js',
'./extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js',
'./extensions/amp-ad-network-adzerk-impl/0.1/amp-ad-network-adzerk-impl.js',
'./extensions/amp-ad-network-cloudflare-impl/0.1/amp-ad-network-cloudflare-impl.js',
'./extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js',
'./extensions/amp-ad-network-fake-impl/0.1/amp-ad-network-fake-impl.js',
'./extensions/amp-ad-network-gmossp-impl/0.1/amp-ad-network-gmossp-impl.js',
'./extensions/amp-ad-network-triplelift-impl/0.1/amp-ad-network-triplelift-impl.js',
'./extensions/amp-ad/0.1/amp-ad.js',
'./extensions/amp-addthis/0.1/amp-addthis.js',
'./extensions/amp-analytics/0.1/amp-analytics.js',
'./extensions/amp-anim/0.1/amp-anim.js',
'./extensions/amp-animation/0.1/amp-animation.js',
'./extensions/amp-apester-media/0.1/amp-apester-media.js',
'./extensions/amp-app-banner/0.1/amp-app-banner.js',
'./extensions/amp-audio/0.1/amp-audio.js',
'./extensions/amp-auto-ads/0.1/amp-auto-ads.js',
'./extensions/amp-beopinion/0.1/amp-beopinion.js',
'./extensions/amp-bind/0.1/amp-bind.js',
'./extensions/amp-bodymovin-animation/0.1/amp-bodymovin-animation.js',
'./extensions/amp-brid-player/0.1/amp-brid-player.js',
'./extensions/amp-brightcove/0.1/amp-brightcove.js',
'./extensions/amp-byside-content/0.1/amp-byside-content.js',
'./extensions/amp-call-tracking/0.1/amp-call-tracking.js',
'./extensions/amp-carousel/0.1/amp-carousel.js',
'./extensions/amp-compare-slider/0.1/amp-compare-slider.js',
'./extensions/amp-consent/0.1/amp-consent.js',
'./extensions/amp-crypto-polyfill/0.1/amp-crypto-polyfill.js',
'./extensions/amp-dailymotion/0.1/amp-dailymotion.js',
//'./extensions/amp-date-picker/0.1/amp-date-picker.js',
'./extensions/amp-dynamic-css-classes/0.1/amp-dynamic-css-classes.js',
'./extensions/amp-experiment/0.1/amp-experiment.js',
'./extensions/amp-facebook-comments/0.1/amp-facebook-comments.js',
'./extensions/amp-facebook-like/0.1/amp-facebook-like.js',
'./extensions/amp-facebook-page/0.1/amp-facebook-page.js',
'./extensions/amp-facebook/0.1/amp-facebook.js',
'./extensions/amp-fit-text/0.1/amp-fit-text.js',
'./extensions/amp-font/0.1/amp-font.js',
'./extensions/amp-form/0.1/amp-form.js',
'./extensions/amp-fx-collection/0.1/amp-fx-collection.js',
'./extensions/amp-fx-flying-carpet/0.1/amp-fx-flying-carpet.js',
'./extensions/amp-geo/0.1/amp-geo.js',
'./extensions/amp-gfycat/0.1/amp-gfycat.js',
'./extensions/amp-gist/0.1/amp-gist.js',
'./extensions/amp-google-vrview-image/0.1/amp-google-vrview-image.js',
'./extensions/amp-gwd-animation/0.1/amp-gwd-animation.js',
'./extensions/amp-hulu/0.1/amp-hulu.js',
'./extensions/amp-iframe/0.1/amp-iframe.js',
'./extensions/amp-ima-video/0.1/amp-ima-video.js',
'./extensions/amp-image-lightbox/0.1/amp-image-lightbox.js',
'./extensions/amp-image-viewer/0.1/amp-image-viewer.js',
'./extensions/amp-imgur/0.1/amp-imgur.js',
'./extensions/amp-instagram/0.1/amp-instagram.js',
'./extensions/amp-install-serviceworker/0.1/amp-install-serviceworker.js',
'./extensions/amp-izlesene/0.1/amp-izlesene.js',
'./extensions/amp-jwplayer/0.1/amp-jwplayer.js',
'./extensions/amp-kaltura-player/0.1/amp-kaltura-player.js',
'./extensions/amp-lightbox-gallery/0.1/amp-lightbox-gallery.js',
'./extensions/amp-lightbox/0.1/amp-lightbox.js',
'./extensions/amp-list/0.1/amp-list.js',
'./extensions/amp-live-list/0.1/amp-live-list.js',
'./extensions/amp-mathml/0.1/amp-mathml.js',
'./extensions/amp-mustache/0.1/amp-mustache.js',
'./extensions/amp-next-page/0.1/amp-next-page.js',
'./extensions/amp-nexxtv-player/0.1/amp-nexxtv-player.js',
'./extensions/amp-o2-player/0.1/amp-o2-player.js',
'./extensions/amp-ooyala-player/0.1/amp-ooyala-player.js',
'./extensions/amp-pinterest/0.1/amp-pinterest.js',
'./extensions/amp-playbuzz/0.1/amp-playbuzz.js',
'./extensions/amp-position-observer/0.1/amp-position-observer.js',
'./extensions/amp-reach-player/0.1/amp-reach-player.js',
'./extensions/amp-reddit/0.1/amp-reddit.js',
'./extensions/amp-riddle-quiz/0.1/amp-riddle-quiz.js',
'./extensions/amp-selector/0.1/amp-selector.js',
'./extensions/amp-share-tracking/0.1/amp-share-tracking.js',
'./extensions/amp-sidebar/0.1/amp-sidebar.js',
'./extensions/amp-slides/0.1/amp-slides.js',
'./extensions/amp-social-share/0.1/amp-social-share.js',
'./extensions/amp-soundcloud/0.1/amp-soundcloud.js',
'./extensions/amp-springboard-player/0.1/amp-springboard-player.js',
'./extensions/amp-sticky-ad/1.0/amp-sticky-ad.js',
'./extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js',
'./extensions/amp-story/0.1/amp-story.js',
//'./extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.js',
//'./extensions/amp-subscriptions/0.1/amp-subscriptions.js',
'./extensions/amp-timeago/0.1/amp-timeago.js',
'./extensions/amp-twitter/0.1/amp-twitter.js',
'./extensions/amp-user-notification/0.1/amp-user-notification.js',
'./extensions/amp-video-service/0.1/amp-video-service.js',
'./extensions/amp-video/0.1/amp-video.js',
'./extensions/amp-viewer-integration/0.1/amp-viewer-integration.js',
'./extensions/amp-vimeo/0.1/amp-vimeo.js',
'./extensions/amp-vine/0.1/amp-vine.js',
'./extensions/amp-viz-vega/0.1/amp-viz-vega.js',
'./extensions/amp-vk/0.1/amp-vk.js',
'./extensions/amp-web-push/0.1/amp-web-push.js',
'./extensions/amp-wistia-player/0.1/amp-wistia-player.js',
'./extensions/amp-youtube/0.1/amp-youtube.js',
];

const small = [
'./src/amp.js',
'./extensions/amp-audio/0.1/amp-audio.js',
//'./extensions/amp-image-lightbox/0.1/amp-image-lightbox.js',
//'./extensions/amp-subscriptions/0.1/amp-subscriptions.js',
//'./extensions/amp-user-notification/0.1/amp-user-notification.js',
//'./extensions/amp-audio-2/0.1/amp-audio-2.js',
//'./extensions/amp-live-list/0.1/amp-live-list.js',
//'./extensions/amp-ad/0.1/amp-ad.js',
];

const test = [
  './test-stuff/a.js',
  './test-stuff/b.js',
]



exports.getFlags({
  modules: all,
  writeTo: './sample/out/',
  externs: externs,
}).then(function(flagsArray) {
  return new Promise(function(resolve, reject) {
    //console.log(flagsArray);
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


function patchRegisterElement() {
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
    if (argv.fortesting) {
      // Need to switch global to self since closure doesn't wrap the module
      // like CommonJS
      file = file.replace('installCustomElements(global);',
          'installCustomElements(self);');
    } else {
      // Get rid of the side effect the module has so we can tree shake it
      // better and control installation, unless --fortesting flag
      // is passed since we also treat `--fortesting` mode as "dev".
      file = file.replace('installCustomElements(global);', '');
    }
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
