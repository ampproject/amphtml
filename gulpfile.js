/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

var autoprefixer = require('autoprefixer');
var babel = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var cssnano = require('cssnano');
var file = require('gulp-file');
var fs = require('fs-extra');
var gulp = require('gulp-help')(require('gulp'));
var gulpWatch = require('gulp-watch');
var lazypipe = require('lazypipe');
var postcss = require('postcss');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var watchify = require('watchify');
var wrap = require('gulp-wrap');
var internalRuntimeVersion = require('./build-system/internal-version').VERSION;
require('./build-system/tasks');

// NOTE: see https://github.com/ai/browserslist#queries for `browsers` list
var cssprefixer = autoprefixer({
  browsers: [
    'last 5 ChromeAndroid versions',
    'last 5 iOS versions',
    'last 3 FirefoxAndroid versions',
    'last 5 Android versions',
    'last 2 ExplorerMobile versions',
    'last 2 OperaMobile versions',
    'last 2 OperaMini versions'
  ]
});

cssnano = cssnano({
  convertValues: false,
  zindex: false
});


/**
 * Build all the AMP extensions
 *
 * @param {!Object} options
 */
function buildExtensions(options) {
  // We pass watch further in to have browserify watch the built file
  // and update it if any of its required deps changed.
  // Each extension and version must be listed individually here.
  buildExtension('amp-anim', '0.1', false, options);
  buildExtension('amp-audio', '0.1', false, options);
  buildExtension('amp-carousel', '0.1', true, options);
  buildExtension('amp-fit-text', '0.1', true, options);
  buildExtension('amp-iframe', '0.1', false, options);
  buildExtension('amp-image-lightbox', '0.1', true, options);
  buildExtension('amp-instagram', '0.1', false, options);
  buildExtension('amp-lightbox', '0.1', false, options);
  buildExtension('amp-pinterest', '0.1', true, options);
  /**
   * @deprecated `amp-slides` is deprecated and will be deleted before 1.0.
   * Please see {@link AmpCarousel} with `type=slides` attribute instead.
   */
  buildExtension('amp-slides', '0.1', false, options);
  buildExtension('amp-twitter', '0.1', false, options);
  buildExtension('amp-youtube', '0.1', false, options);
}


/**
 * Compile the polyfills script and drop it in the build folder
 */
function polyfillsForTests() {
  compileJs('./src/', 'polyfills.js', './build/');
}

/**
 * Compile and optionally minify the stylesheets and the scripts
 * and drop them in the dist folder
 *
 * @param {boolean} watch
 * @param {boolean} shouldMinify
 */
function compile(watch, shouldMinify) {
  compileCss();
  compileJs('./src/', 'amp.js', './dist', {
    minifiedName: 'v0.js',
    watch: watch,
    minify: shouldMinify,
    // If there is a sync JS error during initial load,
    // at least try to unhide the body.
    wrapper: 'try{<%= contents %>}catch(e){setTimeout(function(){' +
        'document.body.style.opacity=1},1000);throw e};'
  });
  compileJs('./3p/', 'integration.js', './dist.3p/' + internalRuntimeVersion, {
    minifiedName: 'f.js',
    watch: watch,
    minify: shouldMinify
  });
  thirdPartyBootstrap(watch, shouldMinify);
}

/**
 * Compile all the css and drop in the build folder
 *
 * @return {!Promise} containing a Readable	Stream
 */
function compileCss() {
  console.info('Recompiling CSS.');
  return jsifyCssPromise('css/amp.css').then(function(css) {
    return gulp.src('css/**.css')
        .pipe(file('css.js', 'export const cssText = ' + css))
        .pipe(gulp.dest('build'));
  });
}

/**
 * 'Jsify' a CSS file - Adds vendor specific css prefixes to the css file,
 * compresses the file, removes the copyright comment, and adds the sourceURL
 * to the stylesheet
 *
 * @param {string} filename css file
 * @return {!Promise} that resolves with the css content after processing
 */
function jsifyCssPromise(filename) {
  var css = fs.readFileSync(filename, 'utf8');
  var transformers = [cssprefixer, cssnano];
  // Remove copyright comment. Crude hack to get our own copyright out
  // of the string.
  return postcss(transformers).process(css.toString())
      .then(function(result) {
        result.warnings().forEach(function(warn) {
          console.warn(warn.toString());
        });
        var css = result.css;
        return JSON.stringify(css + '\n/*# sourceURL=/' + filename + '*/');
      });
}

/**
 * Enables watching for file changes in css, extensions, and examples.
 */
function watch() {
  gulpWatch('css/**/*.css', function() {
    compileCss();
  });
  buildExtensions({
    watch: true
  });
  buildExamples(true);
  compile(true);
}

/**
 * Copies extensions from
 * extensions/$name/$version/$name.js
 * to
 * dist/v0/$name-$version.js
 *
 * Optionally copies the CSS at extensions/$name/$version/$name.css into the
 * JS file marked with $CSS$ as a third argument to the registerElement call.
 *
 * @param {string} name Name of the extension. Must be the sub directory in
 *     the extensions directory and the name of the JS and optional CSS file.
 * @param {string} version Version of the extension. Must be identical to
 *     the sub directory inside the extension directory
 * @param {boolean} hasCss Whether there is a CSS file for this extension.
 * @param {?Object} options
 * @return {!Stream} Gulp object
 */
function buildExtension(name, version, hasCss, options) {
  options = options || {};
  console.log('Bundling ' + name);
  var path = 'extensions/' + name + '/' + version;
  var jsPath = path + '/' + name + '.js';
  // Building extensions is a 2 step process because of the renaming
  // and CSS inlining. This watcher watches the original file, copies
  // it to the destination and adds the CSS.
  if (options.watch) {
    // Do not set watchers again when we get called by the watcher.
    var copy = Object.create(options);
    copy.watch = false;
    gulpWatch(path + '/*', function() {
      buildExtension(name, version, hasCss, copy);
    });
  }
  var js = fs.readFileSync(jsPath, 'utf8');
  if (hasCss) {
    return jsifyCssPromise(path + '/' + name + '.css').then(function(css) {
      console.assert(/\$CSS\$/.test(js),
          'Expected to find $CSS$ marker in extension JS: ' + jsPath);
      js = js.replace(/\$CSS\$/, css);
      return buildExtensionJs(js, path, name, version, options);
    });
  } else {
    return buildExtensionJs(js, path, name, version, options);
  }
}

/**
 * Build the JavaScript for the extension specified
 *
 * @param {string} js JavaScript file content
 * @param {string} path Path to the extensions directory
 * @param {string} name Name of the extension. Must be the sub directory in
 *     the extensions directory and the name of the JS and optional CSS file.
 * @param {string} version Version of the extension. Must be identical to
 *     the sub directory inside the extension directory
 * @param {!Object} options
 * @return {!Stream} Gulp object
 */
function buildExtensionJs(js, path, name, version, options) {
  var builtName = name + '-' + version + '.max.js';
  var minifiedName = name + '-' + version + '.js';
  var latestName = name + '-latest.js';
  return gulp.src(path + '/*.js')
      .pipe(file(builtName, js))
      .pipe(gulp.dest('build/all/v0/'))
      .on('end', function() {
        compileJs('build/all/v0/', builtName, 'dist/v0/', {
          watch: options.watch,
          minify: options.minify,
          minifiedName: minifiedName,
          latestName: latestName,
          wrapper: '(window.AMP = window.AMP || [])' +
              '.push(function(AMP) {<%= contents %>\n});',
        });
      });
}

/**
 * Main Build
 */
function build() {
  process.env.NODE_ENV = 'development';
  polyfillsForTests();
  buildExtensions();
  buildExamples(false);
  compile();
}

/**
 * Dist Build
 */
function dist() {
  process.env.NODE_ENV = 'production';
  compile(false, true);
  buildExtensions({minify: true});
}

/**
 * Build the examples
 *
 * @param {boolean} watch
 */
function buildExamples(watch) {
  if (watch) {
    gulpWatch('examples/*.html', function() {
      buildExamples(false);
    });
  }

  fs.copy('examples/img/', 'examples.build/img/', {clobber: true},
      copyHandler.bind(null, 'examples/img folder'));
  fs.copy('examples/video/', 'examples.build/video/', {clobber: true},
      copyHandler.bind(null, 'examples/video folder'));

  // Also update test-example-validation.js
  buildExample('ads.amp.html');
  buildExample('article.amp.html');
  buildExample('metadata-examples/article-json-ld.amp.html');
  buildExample('metadata-examples/article-microdata.amp.html');
  buildExample('metadata-examples/recipe-json-ld.amp.html');
  buildExample('metadata-examples/recipe-microdata.amp.html');
  buildExample('metadata-examples/review-json-ld.amp.html');
  buildExample('metadata-examples/review-microdata.amp.html');
  buildExample('metadata-examples/video-json-ld.amp.html');
  buildExample('metadata-examples/video-microdata.amp.html');
  buildExample('everything.amp.html');
  buildExample('instagram.amp.html');
  buildExample('released.amp.html');
  buildExample('twitter.amp.html');

  function copyHandler(name, err) {
    if (err) {
      return util.log(util.colors.red('copy error: ', err));
    }
    util.log(util.colors.green('copied ' + name));
  }
}

/**
 * Copies an examples file to examples.build folder and changes all
 * JS references to local / minified copies.
 *
 * @param {string} name HTML file in examples/
 */
function buildExample(name) {
  var input = 'examples/' + name;
  console.log('Processing ' + name);
  var html = fs.readFileSync(input, 'utf8');
  var max = html;
  max = max.replace(/\.js/g, '.max.js');
  max = max.replace('https://cdn.ampproject.org/v0.max.js', '../dist/amp.js');
  max = max.replace(/https:\/\/cdn.ampproject.org\/v0\//g, '../dist/v0/');
  gulp.src(input)
      .pipe(file(name.replace('.html', '.max.html'),max))
      .pipe(gulp.dest('examples.build/'));

  var min = max;
  min = min.replace(/\.max\.js/g, '.js');
  min = min.replace('../dist/amp.js', '../dist/v0.js');
  gulp.src(input)
      .pipe(file(name.replace('.html', '.min.html'), min))
      .pipe(gulp.dest('examples.build/'));
}

/**
 * Copies frame.html to output folder, replaces js references to minified
 * copies, and generates symlink to it.
 *
 * @param {boolean} watch
 * @param {boolean} shouldMinify
 */
function thirdPartyBootstrap(watch, shouldMinify) {
  var input = '3p/frame.max.html';
  if (watch) {
    gulpWatch(input, function() {
      thirdPartyBootstrap(false);
    });
  }
  console.log('Processing ' + input);
  var html = fs.readFileSync(input, 'utf8');
  var min = html;
  min = min.replace(/\.\/integration\.js/g, './f.js');
  gulp.src(input)
      .pipe(file('frame.html', min))
      .pipe(gulp.dest('dist.3p/' + internalRuntimeVersion))
      .on('end', function() {
        var aliasToLatestBuild = 'dist.3p/current';
        if (shouldMinify) {
          aliasToLatestBuild += '-min';
        }
        if (fs.existsSync(aliasToLatestBuild)) {
          fs.unlinkSync(aliasToLatestBuild);
        }
        fs.symlinkSync(
            './' + internalRuntimeVersion,
            aliasToLatestBuild,
            'dir');
      });
}

/**
 * Compile a javascript file
 *
 * @param {string} srcDir Path to the src directory
 * @param {string} srcFilename Name of the JS source file
 * @param {string} destDir Destination folder for output script
 * @param {?Object} options
 */
function compileJs(srcDir, srcFilename, destDir, options) {
  options = options || {};
  var bundler = browserify(srcDir + srcFilename, {debug: true})
      .transform(babel);
  if (options.watch) {
    bundler = watchify(bundler);
  }

  var wrapper = options.wrapper || '<%= contents %>';

  var lazybuild = lazypipe()
      .pipe(source, srcFilename)
      .pipe(buffer)
      .pipe(replace, /\$internalRuntimeVersion\$/g, internalRuntimeVersion)
      .pipe(wrap, wrapper)
      .pipe(sourcemaps.init.bind(sourcemaps), {loadMaps: true});

  var lazywrite = lazypipe()
      .pipe(sourcemaps.write.bind(sourcemaps), './')
      .pipe(gulp.dest.bind(gulp), destDir);

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(lazybuild())
      .pipe(lazywrite());
  }

  if (options.watch) {
    bundler.on('update', function() {
      console.log('-> bundling ' + srcDir + '...');
      rebundle();
    });
  }

  function minify() {
    console.log('Minifying ' + srcFilename);
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(lazybuild())
      .pipe(uglify({
        preserveComments: 'some'
      }))
      .pipe(rename(options.minifiedName))
      .pipe(lazywrite())
      .on('end', function() {
        fs.writeFileSync(destDir + '/version.txt', internalRuntimeVersion);
        if (options.latestName) {
          fs.copySync(
              destDir + '/' + options.minifiedName,
              destDir + '/' + options.latestName);
        }
      });
  }

  if (options.minify) {
    minify();
  } else {
    rebundle();
  }
}

/**
 * Gulp tasks
 */
gulp.task('build', 'Builds the AMP library', build);
gulp.task('css', 'Recompile css to build directory', compileCss);
gulp.task('default', 'Same as "watch"', ['watch']);
gulp.task('dist', 'Build production binaries', dist);
gulp.task('extensions', 'Build AMP Extensions', buildExtensions);
gulp.task('watch', 'Watches for changes in files, re-build', watch);
