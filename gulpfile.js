/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

checkMinVersion();

var $$ = require('gulp-load-plugins')();
var babel = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var closureCompile = require('./build-system/tasks/compile').closureCompile;
var cleanupBuildDir = require('./build-system/tasks/compile').cleanupBuildDir;
var jsifyCssAsync = require('./build-system/tasks/jsify-css').jsifyCssAsync;
var fs = require('fs-extra');
var gulp = $$.help(require('gulp'));
var lazypipe = require('lazypipe');
var minimatch = require('minimatch');
var minimist = require('minimist');
var source = require('vinyl-source-stream');
var touch = require('touch');
var watchify = require('watchify');
var internalRuntimeVersion = require('./build-system/internal-version').VERSION;
var internalRuntimeToken = require('./build-system/internal-version').TOKEN;

var argv = minimist(process.argv.slice(2), {boolean: ['strictBabelTransform']});
var cssOnly = argv['css-only'];

require('./build-system/tasks');

var hostname = argv.hostname || 'cdn.ampproject.org';
var hostname3p = argv.hostname3p || '3p.ampproject.net';

// All declared extensions.
var extensions = {};

// Each extension and version must be listed individually here.
// NOTE: No new extensions must pass the NO_TYPE_CHECK argument.
declareExtension('amp-3q-player', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-access', '0.1', true, 'NO_TYPE_CHECK');
declareExtension('amp-access-laterpay', '0.1', true, 'NO_TYPE_CHECK');
declareExtension('amp-accordion', '0.1', true);
declareExtension('amp-ad', '0.1', true);
declareExtension('amp-ad-network-adsense-impl', 0.1, false);
declareExtension('amp-ad-network-doubleclick-impl', 0.1, false);
declareExtension('amp-ad-network-fake-impl', 0.1, false);
declareExtension('amp-ad-network-triplelift-impl', 0.1, false);
declareExtension('amp-ad-network-cloudflare-impl', 0.1, false);
declareExtension('amp-analytics', '0.1', false);
declareExtension('amp-anim', '0.1', false);
declareExtension('amp-animation', '0.1', false);
declareExtension('amp-apester-media', '0.1', true, 'NO_TYPE_CHECK');
declareExtension('amp-app-banner', '0.1', true);
declareExtension('amp-audio', '0.1', false);
declareExtension('amp-auto-ads', '0.1', false);
declareExtension('amp-bind', '0.1', false);
declareExtension('amp-brid-player', '0.1', false);
declareExtension('amp-brightcove', '0.1', false);
declareExtension('amp-kaltura-player', '0.1', false);
declareExtension('amp-call-tracking', '0.1', false);
declareExtension('amp-carousel', '0.1', true);
declareExtension('amp-crypto-polyfill', '0.1', false);
declareExtension('amp-dailymotion', '0.1', false);
declareExtension('amp-dynamic-css-classes', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-experiment', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-facebook', '0.1', false);
declareExtension('amp-facebook-comments', '0.1', false);
declareExtension('amp-facebook-like', '0.1', false);
declareExtension('amp-fit-text', '0.1', true, 'NO_TYPE_CHECK');
declareExtension('amp-font', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-form', '0.1', true);
declareExtension('amp-fresh', '0.1', true);
declareExtension('amp-fx-flying-carpet', '0.1', true);
declareExtension('amp-fx-parallax', '0.1', false);
declareExtension('amp-gfycat', '0.1', false);
declareExtension('amp-gist', '0.1', false);
declareExtension('amp-hulu', '0.1', false);
declareExtension('amp-iframe', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-image-lightbox', '0.1', true);
declareExtension('amp-instagram', '0.1', true);
declareExtension('amp-install-serviceworker', '0.1', false);
declareExtension('amp-izlesene', '0.1', false);
declareExtension('amp-jwplayer', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-lightbox', '0.1', true);
declareExtension('amp-lightbox-viewer', '0.1', true, 'NO_TYPE_CHECK');
declareExtension('amp-list', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-live-list', '0.1', true);
declareExtension('amp-mustache', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-nexxtv-player', '0.1', false);
declareExtension('amp-o2-player', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-ooyala-player', '0.1', false);
declareExtension('amp-pinterest', '0.1', true, 'NO_TYPE_CHECK');
declareExtension('amp-playbuzz', '0.1', true, 'NO_TYPE_CHECK');
declareExtension('amp-reach-player', '0.1', false);
declareExtension('amp-reddit', '0.1', false);
declareExtension('amp-share-tracking', '0.1', false);
declareExtension('amp-sidebar', '0.1', true);
declareExtension('amp-sortable-table', '0.1', true);
declareExtension('amp-soundcloud', '0.1', false);
declareExtension('amp-springboard-player', '0.1', false);
declareExtension('amp-sticky-ad', '0.1', true);
declareExtension('amp-sticky-ad', '1.0', true);
declareExtension('amp-selector', '0.1', true);

/**
 * @deprecated `amp-slides` is deprecated and will be deleted before 1.0.
 * Please see {@link AmpCarousel} with `type=slides` attribute instead.
 */
declareExtension('amp-slides', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-social-share', '0.1', true);
declareExtension('amp-twitter', '0.1', false);
declareExtension('amp-user-notification', '0.1', true, 'NO_TYPE_CHECK');
declareExtension('amp-vimeo', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-vine', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-viz-vega', '0.1', true);
declareExtension('amp-google-vrview-image', '0.1', false, 'NO_TYPE_CHECK');
declareExtension('amp-viewer-integration', '0.1', {
  // The viewer integration code needs to run asap, so that viewers
  // can influence document state asap. Otherwise the document may take
  // a long time to learn that it should start process other extensions
  // faster.
  loadPriority: 'high',
});
declareExtension('amp-video', '0.1', false);
declareExtension('amp-youtube', '0.1', false);

/**
 * @param {string} name
 * @param {string} version E.g. 0.1
 * @param {boolean|!Object} hasCssOrOptions Whether the extension comes with CSS
 *   or an extension options object.
 * @param {string=} opt_noTypeCheck Whether not to check types.
 *     No new extension must pass this.
 * @param {!Array<string>=} opt_extraGlobs
 */
function declareExtension(name, version, hasCssOrOptions, opt_noTypeCheck,
    opt_extraGlobs) {
  var hasCss = false;
  var options = {};
  if (typeof hasCssOrOptions == 'boolean') {
    hasCss = hasCssOrOptions;
  } else {
    options = hasCssOrOptions
  }
  extensions[name + '-' + version] = Object.assign({
    name: name,
    version: version,
    hasCss: hasCss,
    noTypeCheck: !!opt_noTypeCheck,
    extraGlobs: opt_extraGlobs,
  }, options);
}

/**
 * Build all the AMP extensions
 *
 * @param {!Object} options
 * @return {!Promise}
 */
function buildExtensions(options) {
  var results = [];
  for (var key in extensions) {
    var e = extensions[key];
    var o = Object.assign({}, options);
    o = Object.assign(o, e);
    results.push(buildExtension(e.name, e.version, e.hasCss, o, e.extraGlobs));
  }
  return Promise.all(results);
}

/**
 * Compile the polyfills script and drop it in the build folder
 * @return {!Promise}
 */
function polyfillsForTests() {
  return compileJs('./src/', 'polyfills.js', './build/');
}

/**
 * Compile and optionally minify the stylesheets and the scripts
 * and drop them in the dist folder
 *
 * @param {boolean} watch
 * @param {boolean} shouldMinify
 * @param {boolean=} opt_preventRemoveAndMakeDir
 * @param {boolean=} opt_checkTypes
 * @return {!Promise}
 */
function compile(watch, shouldMinify, opt_preventRemoveAndMakeDir,
    opt_checkTypes) {
  var results = [
    compileCss().then(function() {
      compileJs('./3p/', 'integration.js',
          './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'), {
        minifiedName: 'f.js',
        checkTypes: opt_checkTypes,
        watch: watch,
        minify: shouldMinify,
        preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
        externs: ['ads/ads.extern.js',],
        include3pDirectories: true,
        includePolyfills: true,
      });
    }),

    compileJs('./3p/', 'ampcontext-lib.js',
        './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'), {
      minifiedName: 'ampcontext-v0.js',
      checkTypes: opt_checkTypes,
      watch: watch,
      minify: shouldMinify,
      preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
      externs: ['ads/ads.extern.js',],
      include3pDirectories: true,
      includePolyfills: false,
    }),

    // For compilation with babel we start with the amp-babel entry point,
    // but then rename to the amp.js which we've been using all along.
    compileJs('./src/', 'amp-babel.js', './dist', {
      toName: 'amp.js',
      minifiedName: 'v0.js',
      includePolyfills: true,
      checkTypes: opt_checkTypes,
      watch: watch,
      preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
      minify: shouldMinify,
      // If there is a sync JS error during initial load,
      // at least try to unhide the body.
      wrapper: 'try{(function(){<%= contents %>})()}catch(e){' +
          'setTimeout(function(){' +
          'var s=document.body.style;' +
          's.opacity=1;' +
          's.visibility="visible";' +
          's.animation="none";' +
          's.WebkitAnimation="none;"},1000);throw e};'
    }),
  ];
  if (opt_checkTypes) {
    // We don't rerun type check for the shadow entry point for now.
    return Promise.all(results);
  }

  if (!watch || argv.with_shadow) {
    results.push(
      // Entry point for shadow runtime.
      compileJs('./src/', 'amp-shadow-babel.js', './dist', {
        toName: 'amp-shadow.js',
        minifiedName: 'shadow-v0.js',
        includePolyfills: true,
        checkTypes: opt_checkTypes,
        watch: watch,
        preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
        minify: shouldMinify,
        wrapper: '<%= contents %>'
      })
    );
  }

  if (!watch || argv.with_inabox) {
    results.push(
      // Entry point for inabox runtime.
      compileJs('./src/inabox/', 'amp-inabox.js', './dist', {
        toName: 'amp-inabox.js',
        minifiedName: 'amp4ads-v0.js',
        includePolyfills: true,
        extraGlobs: ['src/inabox/*.js', '3p/iframe-messaging-client.js'],
        checkTypes: opt_checkTypes,
        watch: watch,
        preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
        minify: shouldMinify,
        wrapper: '<%= contents %>',
      }),

      // inabox-host
      compileJs('./ads/inabox/', 'inabox-host.js', './dist', {
        toName: 'amp-inabox-host.js',
        minifiedName: 'amp4ads-host-v0.js',
        includePolyfills: false,
        checkTypes: opt_checkTypes,
        watch: watch,
        preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
        minify: shouldMinify,
        wrapper: '<%= contents %>',
      })
    );
  }
  results.push(
    thirdPartyBootstrap('3p/frame.max.html', 'frame.html', shouldMinify),
    thirdPartyBootstrap('3p/nameframe.max.html', 'nameframe.html',shouldMinify)
  );

  if (watch) {
    $$.watch('3p/nameframe.max.html', function () {
      thirdPartyBootstrap('3p/nameframe.max.html', 'nameframe.html', shouldMinify);
    });
    $$.watch('3p/frame.max.html', function() {
      thirdPartyBootstrap('3p/frame.max.html', 'frame.html', shouldMinify);
    });
  }
  return Promise.all(results);
}

/**
 * Compile all the css and drop in the build folder
 * @return {!Promise}
 */
function compileCss() {
  $$.util.log('Recompiling CSS.');
  return jsifyCssAsync('css/amp.css').then(function(css) {
    return toPromise(gulp.src('css/**.css')
          .pipe($$.file('css.js', 'export const cssText = ' +
              JSON.stringify(css)))
          .pipe(gulp.dest('build'))
          .on('end', function() {
            fs.writeFileSync('build/css/v0.css', css);
          }));
  });
}

/**
 * Copies the css from the build folder to the dist folder
 */
function copyCss() {
  fs.copySync('build/css/v0.css', 'dist/v0.css');
  return toPromise(gulp.src('build/css/amp-*.css')
      .pipe(gulp.dest('dist/v0')));
}

/**
 * Enables watching for file changes in css, extensions.
 * @return {!Promise}
 */
function watch() {
  $$.watch('css/**/*.css', function() {
    compileCss();
  });

  return Promise.all([
    buildAlp({watch: true}),
    buildExtensions({watch: true}),
    compile(true),
  ]);
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
 * @param {!Array=} opt_extraGlobs
 * @return {!Promise}
 */
function buildExtension(name, version, hasCss, options, opt_extraGlobs) {
  if (cssOnly && !hasCss) {
    return Promise.resolve();
  }
  options = options || {};
  options.extraGlobs = opt_extraGlobs;
  var path = 'extensions/' + name + '/' + version;
  var jsPath = path + '/' + name + '.js';
  var jsTestPath = path + '/test/' + 'test-' + name + '.js';
  if (argv.files && options.bundleOnlyIfListedInFiles) {
    const passedFiles = Array.isArray(argv.files) ? argv.files : [argv.files];
    const shouldBundle = passedFiles.some(glob => {
      return minimatch(jsPath, glob) || minimatch(jsTestPath, glob);
    });
    if (!shouldBundle) {
      return Promise.resolve();
    }
  }
  if (!process.env.TRAVIS) {
    $$.util.log('Bundling ' + name);
  }
  // Building extensions is a 2 step process because of the renaming
  // and CSS inlining. This watcher watches the original file, copies
  // it to the destination and adds the CSS.
  if (options.watch) {
    // Do not set watchers again when we get called by the watcher.
    var copy = Object.create(options);
    copy.watch = false;
    $$.watch(path + '/*', function() {
      buildExtension(name, version, hasCss, copy);
    });
  }
  if (hasCss) {
    mkdirSync('build');
    mkdirSync('build/css');
    return jsifyCssAsync(path + '/' + name + '.css').then(function(css) {
      var jsCss = 'export const CSS = ' + JSON.stringify(css) + ';\n';
      var jsName = 'build/' + name + '-' + version + '.css.js';
      var cssName = 'build/css/' + name + '-' + version + '.css';
      fs.writeFileSync(jsName, jsCss, 'utf-8');
      fs.writeFileSync(cssName, css, 'utf-8');
      if (cssOnly) {
        return Promise.resolve();
      }
      return buildExtensionJs(path, name, version, options);
    });
  } else {
    return buildExtensionJs(path, name, version, options);
  }
}

/**
 * Build the JavaScript for the extension specified
 *
 * @param {string} path Path to the extensions directory
 * @param {string} name Name of the extension. Must be the sub directory in
 *     the extensions directory and the name of the JS and optional CSS file.
 * @param {string} version Version of the extension. Must be identical to
 *     the sub directory inside the extension directory
 * @param {!Object} options
 * @return {!Promise}
 */
function buildExtensionJs(path, name, version, options) {
  var filename = options.filename || name + '.js';
  if (options.loadPriority && options.loadPriority != 'high') {
    throw new Error('Unsupported loadPriority: ' + options.loadPriority);
  }
  var priority = options.loadPriority ? 'p:"high",' : '';
  return compileJs(path + '/', filename, './dist/v0', {
    watch: options.watch,
    preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
    minify: options.minify,
    toName:  name + '-' + version + '.max.js',
    minifiedName: name + '-' + version + '.js',
    latestName: name + '-latest.js',
    extraGlobs: options.extraGlobs,
    // Wrapper that either registers the extension or schedules it for
    // execution after the main binary comes back.
    // The `function` is wrapped in `()` to avoid lazy parsing it,
    // since it will be immediately executed anyway.
    // See https://github.com/ampproject/amphtml/issues/3977
    wrapper: options.noWrapper ? '' : ('(self.AMP=self.AMP||[])' +
        '.push({n:"' + name + '",' + priority +
        'v:"' + internalRuntimeVersion + '",' +
        'f:(function(AMP){<%= contents %>\n})});'),
  });
}

/**
 * Main Build
 * @return {!Promise}
 */
function build() {
  var TESTING_HOST = process.env.AMP_TESTING_HOST;
  if (argv.fortesting && typeof TESTING_HOST == 'string') {
    var AMP_CONFIG = {
      thirdPartyFrameHost: TESTING_HOST,
      thirdPartyFrameRegex: TESTING_HOST,
      localDev: true,
    };
    AMP_CONFIG = Object.assign(AMP_CONFIG, JSON.parse(fs.readFileSync(
        'build-system/global-configs/prod-config.json').toString()));
    $$.util.log($$.util.colors.green('trying to write AMP_CONFIG.'));
    fs.writeFileSync('node_modules/AMP_CONFIG.json',
        JSON.stringify(AMP_CONFIG));
    $$.util.log($$.util.colors.green('AMP_CONFIG written successfully.'));
  }
  process.env.NODE_ENV = 'development';
  return Promise.all([
    polyfillsForTests(),
    buildAlp(),
    buildSw(),
    buildWebWorker(),
    buildExtensions({bundleOnlyIfListedInFiles: true}),
    compile(),
  ]);
}

/**
 * Dist Build
 * @return {!Promise}
 */
function dist() {
  process.env.NODE_ENV = 'production';
  cleanupBuildDir();
  return Promise.all([
    compile(false, true, true),
    // NOTE:
    // When adding a line here, consider whether you need to include polyfills
    // and whether you need to init logging (initLogConstructor).
    buildAlp({minify: true, watch: false, preventRemoveAndMakeDir: true}),
    buildSw({minify: true, watch: false, preventRemoveAndMakeDir: true}),
    buildWebWorker({minify: true, watch: false, preventRemoveAndMakeDir: true}),
    buildExtensions({minify: true, preventRemoveAndMakeDir: true}),
    buildExperiments({minify: true, watch: false, preventRemoveAndMakeDir: true}),
    buildLoginDone({minify: true, watch: false, preventRemoveAndMakeDir: true}),
    copyCss(),
  ]);
}

/**
 * Dedicated type check path.
 * @return {!Promise}
 */
function checkTypes() {
  process.env.NODE_ENV = 'production';
  cleanupBuildDir();
  // Disabled to improve type check performance, since this provides
  // little incremental value.
  /*buildExperiments({
    minify: true,
    checkTypes: true,
    preventRemoveAndMakeDir: true,
  });*/
  var compileSrcs = [
    './src/amp-babel.js',
    './src/amp-shadow.js',
    './src/inabox/amp-inabox.js',
    './ads/alp/install-alp.js',
    './ads/inabox/inabox-host.js',
    './src/service-worker/shell.js',
    './src/service-worker/core.js',
    './src/service-worker/kill.js',
    './src/web-worker/web-worker.js',
  ];
  var extensionSrcs = Object.values(extensions).filter(function(extension) {
    return !extension.noTypeCheck;
  }).map(function(extension) {
    return './extensions/' + extension.name + '/' +
        extension.version + '/' + extension.name + '.js';
  }).sort();
  return Promise.all([
    closureCompile(compileSrcs.concat(extensionSrcs), './dist',
        'check-types.js', {
          include3pDirectories: true,
          includePolyfills: true,
          extraGlobs: ['src/inabox/*.js'],
          checkTypes: true,
        }),
    // Type check 3p/ads code.
    closureCompile(['./3p/integration.js'], './dist',
      'integration-check-types.js', {
        externs: ['ads/ads.extern.js'],
        include3pDirectories: true,
        includePolyfills: true,
        checkTypes: true,
      }),
    closureCompile(['./3p/ampcontext-lib.js'], './dist',
      'ampcontext-check-types.js', {
        externs: ['ads/ads.extern.js'],
        include3pDirectories: true,
        includePolyfills: true,
        checkTypes: true,
      }),
  ]);
}

/**
 * Copies frame.html to output folder, replaces js references to minified
 * copies, and generates symlink to it.
 *
 * @param {string} input
 * @param {string} outputName
 * @param {boolean} shouldMinify
 * @return {!Promise}
 */
function thirdPartyBootstrap(input, outputName, shouldMinify) {
  $$.util.log('Processing ' + input);

  if (!shouldMinify) {
    return toPromise(gulp.src(input)
        .pipe(gulp.dest('dist.3p/current')));
  }

  // By default we use an absolute URL, that is independent of the
  // actual frame host for the JS inside the frame.
  // But during testing we need a relative reference because the
  // version is not available on the absolute path.
  var integrationJs = argv.fortesting
      ? './f.js'
      : `https://${hostname3p}/${internalRuntimeVersion}/f.js`;
  // Convert default relative URL to absolute min URL.
  var html = fs.readFileSync(input, 'utf8')
      .replace(/\.\/integration\.js/g, integrationJs);
  return toPromise($$.file(outputName, html, {src: true})
      .pipe(gulp.dest('dist.3p/' + internalRuntimeVersion))
      .on('end', function() {
        var aliasToLatestBuild = 'dist.3p/current-min';
        if (fs.existsSync(aliasToLatestBuild)) {
          fs.unlinkSync(aliasToLatestBuild);
        }
        fs.symlinkSync(
            './' + internalRuntimeVersion,
            aliasToLatestBuild,
            'dir');
      }));
}

/**
 * Synchronously concatenates the given files into the given destination
 *
 * @param {string} destFilePath File path to write the concatenated files to
 * @param {Array<string>} files List of file paths to concatenate
 */
function concatFiles(destFilePath, files) {
  var all = files.map(function(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
  });

  fs.writeFileSync(destFilePath, all.join(';'), 'utf-8');
}

/**
 * Allows (ap|pre)pending to the already compiled, minified JS file
 *
 * @param {string} srcFilename Name of the JS source file
 * @param {string} destFilePath File path to the compiled JS file
 */
function appendToCompiledFile(srcFilename, destFilePath) {
  if (srcFilename == 'amp-viz-vega.js') {
    // Prepend minified d3 and vega third_party to compiled amp-viz-vega.js
    concatFiles(destFilePath, [
      'third_party/d3/d3.js',
      'third_party/d3-geo-projection/d3-geo-projection.js',
      'third_party/vega/vega.js',
      destFilePath,
    ]);
  }
}

/**
 * Compile a javascript file
 *
 * @param {string} srcDir Path to the src directory
 * @param {string} srcFilename Name of the JS source file
 * @param {string} destDir Destination folder for output script
 * @param {?Object} options
 * @return {!Promise}
 */
function compileJs(srcDir, srcFilename, destDir, options) {
  options = options || {};
  if (options.minify) {
    if (!process.env.TRAVIS) {
      $$.util.log('Minifying ' + srcFilename);
    }

    return closureCompile(
        srcDir + srcFilename, destDir, options.minifiedName, options)
        .then(function() {
          appendToCompiledFile(srcFilename, destDir + '/' + options.minifiedName);
          fs.writeFileSync(destDir + '/version.txt', internalRuntimeVersion);
          if (options.latestName) {
            fs.copySync(
                destDir + '/' + options.minifiedName,
                destDir + '/' + options.latestName);
          }
        });
  }

  var bundler = browserify(srcDir + srcFilename, {debug: true})
      .transform(babel, {loose: argv.strictBabelTransform ? undefined : 'all'});
  if (options.watch) {
    bundler = watchify(bundler);
  }

  var wrapper = options.wrapper || '<%= contents %>';

  var lazybuild = lazypipe()
      .pipe(source, srcFilename)
      .pipe(buffer)
      .pipe($$.replace, /\$internalRuntimeVersion\$/g, internalRuntimeVersion)
      .pipe($$.replace, /\$internalRuntimeToken\$/g, internalRuntimeToken)
      .pipe($$.wrap, wrapper)
      .pipe($$.sourcemaps.init.bind($$.sourcemaps), {loadMaps: true});

  var lazywrite = lazypipe()
      .pipe($$.sourcemaps.write.bind($$.sourcemaps), './')
      .pipe(gulp.dest.bind(gulp), destDir);

  var destFilename = options.toName || srcFilename;
  function rebundle() {
    return toPromise(bundler.bundle()
      .on('error', function(err) {
        if (err instanceof SyntaxError) {
          console.error($$.util.colors.red('Syntax error:', err.message));
        } else {
          console.error($$.util.colors.red(err.message));
        }
      })
      .pipe(lazybuild())
      .pipe($$.rename(destFilename))
      .pipe(lazywrite())
      .on('end', function() {
        appendToCompiledFile(srcFilename, destDir + '/' + destFilename);
        if (!process.env.TRAVIS) {
          $$.util.log('Compiled ' + srcFilename);
        }
      }));
  }

  if (options.watch) {
    bundler.on('update', function() {
      $$.util.log('-> bundling ' + srcDir + '...');
      rebundle();
      // Touch file in unit test set. This triggers rebundling of tests because
      // karma only considers changes to tests files themselves re-bundle
      // worthy.
      touch('test/_init_tests.js');
    });
  }

  return rebundle();
}

/**
 * Build all the AMP experiments.html/js.
 *
 * @param {!Object} options
 */
function buildExperiments(options) {
  options = options || {};
  $$.util.log('Bundling experiments.html/js');

  var path = 'tools/experiments';
  var htmlPath = path + '/experiments.html';
  var jsPath = path + '/experiments.js';
  var watch = options.watch;
  if (watch === undefined) {
    watch = argv.watch || argv.w;
  }

  // Building extensions is a 2 step process because of the renaming
  // and CSS inlining. This watcher watches the original file, copies
  // it to the destination and adds the CSS.
  if (watch) {
    // Do not set watchers again when we get called by the watcher.
    var copy = Object.create(options);
    copy.watch = false;
    $$.watch(path + '/*', function() {
      buildExperiments(copy);
    });
  }

  // Build HTML.
  $$.util.log('Processing ' + htmlPath);
  var html = fs.readFileSync(htmlPath, 'utf8');
  var minHtml = html.replace('/dist.tools/experiments/experiments.js',
      `https://${hostname}/v0/experiments.js`);
  gulp.src(htmlPath)
      .pipe($$.file('experiments.cdn.html', minHtml))
      .pipe(gulp.dest('dist.tools/experiments/'));

  // Build JS.
  var js = fs.readFileSync(jsPath, 'utf8');
  var builtName = 'experiments.max.js';
  var minifiedName = 'experiments.js';
  return toPromise(gulp.src(path + '/*.js')
      .pipe($$.file(builtName, js))
      .pipe(gulp.dest('build/experiments/')))
      .then(function() {
        compileJs('./build/experiments/', builtName, './dist.tools/experiments/', {
          watch: false,
          minify: options.minify || argv.minify,
          includePolyfills: true,
          minifiedName: minifiedName,
          preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
          checkTypes: options.checkTypes,
        });
      });
}


/**
 * Build "Login Done" page.
 *
 * @param {!Object} options
 */
function buildLoginDone(options) {
  return buildLoginDoneVersion('0.1', options);
}

/**
 * Build "Login Done" page for the specified version.
 *
 * @param {!Object} options
 */
function buildLoginDoneVersion(version, options) {
  options = options || {};
  $$.util.log('Bundling amp-login-done.html/js');

  var path = 'extensions/amp-access/' + version + '/';
  var htmlPath = path + 'amp-login-done.html';
  var jsPath = path + 'amp-login-done.js';
  var watch = options.watch;
  if (watch === undefined) {
    watch = argv.watch || argv.w;
  }

  // Building extensions is a 2 step process because of the renaming
  // and CSS inlining. This watcher watches the original file, copies
  // it to the destination and adds the CSS.
  if (watch) {
    // Do not set watchers again when we get called by the watcher.
    var copy = Object.create(options);
    copy.watch = false;
    $$.watch(path + '/*', function() {
      buildLoginDoneVersion(version, copy);
    });
  }

  // Build HTML.
  $$.util.log('Processing ' + htmlPath);
  var html = fs.readFileSync(htmlPath, 'utf8');
  var minHtml = html.replace(
      '../../../dist/v0/amp-login-done-' + version + '.max.js',
      `https://${hostname}/v0/amp-login-done-` + version + '.js');

  mkdirSync('dist');
  mkdirSync('dist/v0');

  fs.writeFileSync('dist/v0/amp-login-done-' + version + '.html',
      minHtml);

  // Build JS.
  var js = fs.readFileSync(jsPath, 'utf8');
  var builtName = 'amp-login-done-' + version + '.max.js';
  var minifiedName = 'amp-login-done-' + version + '.js';
  var latestName = 'amp-login-done-latest.js';
  return toPromise(gulp.src(path + '/*.js')
      .pipe($$.file(builtName, js))
      .pipe(gulp.dest('build/all/v0/')))
      .then(function() {
        compileJs('./build/all/v0/', builtName, './dist/v0/', {
          watch: false,
          includePolyfills: true,
          minify: options.minify || argv.minify,
          minifiedName: minifiedName,
          preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
          latestName: latestName,
        });
      });
}

/**
 * Build ALP JS.
 *
 * @param {!Object} options
 */
function buildAlp(options) {
  options = options || {};
  $$.util.log('Bundling alp.js');

  return compileJs('./ads/alp/', 'install-alp.js', './dist/', {
    toName: 'alp.max.js',
    watch: options.watch,
    minify: options.minify || argv.minify,
    includePolyfills: true,
    minifiedName: 'alp.js',
    preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
  });
}

/**
 * Build service worker JS.
 *
 * @param {!Object} options
 */
function buildSw(options) {
  $$.util.log('Bundling sw.js');
  var opts = Object.assign({}, options);

  return Promise.all([
    // The service-worker script loaded by the browser.
    compileJs('./src/service-worker/', 'shell.js', './dist/', {
      toName: 'sw.max.js',
      minifiedName: 'sw.js',
      watch: opts.watch,
      minify: opts.minify || argv.minify,
      preventRemoveAndMakeDir: opts.preventRemoveAndMakeDir,
    }),
    // The service-worker kill script that may be loaded by the browser.
    compileJs('./src/service-worker/', 'kill.js', './dist/', {
      toName: 'sw-kill.max.js',
      minifiedName: 'sw-kill.js',
      watch: opts.watch,
      minify: opts.minify || argv.minify,
      preventRemoveAndMakeDir: opts.preventRemoveAndMakeDir,
    }),
    // The script imported by the service-worker. This is the "core".
    buildExtensionJs('./src/service-worker', 'cache-service-worker', '0.1',
        Object.assign({}, opts, {noWrapper: true, filename: 'core.js'})),
  ]);
}

/**
 * Build web worker JS.
 *
 * @param {!Object} options
 */
function buildWebWorker(options) {
  $$.util.log('Bundling ww.js');
  var opts = Object.assign({}, options);

  return compileJs('./src/web-worker/', 'web-worker.js', './dist/', {
    toName: 'ww.max.js',
    minifiedName: 'ww.js',
    watch: opts.watch,
    minify: opts.minify || argv.minify,
    preventRemoveAndMakeDir: opts.preventRemoveAndMakeDir,
  });
}

/**
 * Exits the process if gulp is running with a node version lower than
 * the required version. This has to run very early to avoid parse
 * errors from modules that e.g. use let.
 */
function checkMinVersion() {
  var majorVersion = Number(process.version.replace(/v/, '').split('.')[0]);
  if (majorVersion < 4) {
    $$.util.log('Please run AMP with node.js version 4 or newer.');
    $$.util.log('Your version is', process.version);
    process.exit(1);
  }
}

function mkdirSync(path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if (e.code != 'EEXIST') {
      throw e;
    }
  }
}

/**
 * Patches Web Animations API by wrapping its body into `install` function.
 * This gives us an option to call polyfill directly on the main window
 * or a friendly iframe.
 */
function patchWebAnimations() {
  // Copies web-animations-js into a new file that has an export.
  const patchedName = 'node_modules/web-animations-js/' +
      'web-animations.install.js';
  var file = fs.readFileSync(
      'node_modules/web-animations-js/' +
      'web-animations.min.js').toString();
  // Wrap the contents inside the install function.
  file = 'exports.installWebAnimations = function(window) {\n' +
      'var document = window.document;\n' +
      file + '\n' +
      '}\n';
  fs.writeFileSync(patchedName, file);
}
patchWebAnimations();

function toPromise(readable) {
  return new Promise(function(resolve, reject) {
    readable.on('error', reject).on('end', resolve);
  });
}

/**
 * Gulp tasks
 */
gulp.task('build', 'Builds the AMP library', build);
gulp.task('check-types', 'Check JS types', checkTypes);
gulp.task('css', 'Recompile css to build directory', compileCss);
gulp.task('default', 'Same as "watch"', ['watch', 'serve']);
gulp.task('dist', 'Build production binaries', dist, {
  options: {
    pseudo_names: 'Compiles with readable names. ' +
        'Great for profiling and debugging production code.',
    fortesting: 'Compiles with `getMode().test` set to true',
  }
});
gulp.task('extensions', 'Build AMP Extensions', buildExtensions);
gulp.task('watch', 'Watches for changes in files, re-build', watch, {
  options: {
    with_inabox: 'Also watch and build the amp-inabox.js binary.',
    with_shadow: 'Also watch and build the amp-shadow.js binary.',
  }
});
gulp.task('build-experiments', 'Builds experiments.html/js', buildExperiments);
gulp.task('build-login-done', 'Builds login-done.html/js', buildLoginDone);
