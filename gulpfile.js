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

var gulp = require('gulp');
var del = require('del');
var file = require('gulp-file');
var gulpWatch = require('gulp-watch');
var fs = require('fs');
var sourcemaps = require('gulp-sourcemaps');
var karma = require('karma').server;
var path = require('path');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');
var wrap = require("gulp-wrap");
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var babel = require('babelify');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer');

// NOTE: see https://github.com/ai/browserslist#queries for `browsers` list
var cssprefixer = autoprefixer(
  {
    browsers: [
      'last 5 ChromeAndroid versions',
      'last 5 iOS versions',
      'last 3 FirefoxAndroid versions',
      'last 5 Android versions',
      'last 2 ExplorerMobile versions',
      'last 2 OperaMobile versions',
      'last 2 OperaMini versions'
    ]
  }
);

var srcs = [
  'src/**/*.js',
  'ads/**/*.js',
  'node_modules/document-register-element/build/*.js'
];
var extensions = [
  'extensions/**/*.js'
];
var tests = [
  'test/**/*.js',
  'extensions/**/test/**/*.js',
  'fixtures/**/*.html',
  {
    pattern: 'dist/**/*.js',
    included: false,
    served: true
  },
  {
    pattern: 'build/**/*.js',
    included: false,
    served: true
  },
  {
    pattern: 'examples/**/*.js',
    included: false,
    served: true
  }
];

// Used to e.g. references the ads binary from the runtime to get
// version lock.
var internalRuntimeVersion = new Date().getTime();

function buildExtensions(options) {
  // We pass watch further in to have browserify watch the built file
  // and update it if any of its required deps changed.
  // Each extension and version must be listed individually here.
  buildExtension('sample', '0.1', true, options);
  buildExtension('amp-anim', '0.1', false, options);
  buildExtension('amp-audio', '0.1', false, options);
  buildExtension('amp-carousel', '0.1', false, options);
  buildExtension('amp-fit-text', '0.1', true, options);
  buildExtension('amp-iframe', '0.1', false, options);
  buildExtension('amp-instagram', '0.1', false, options);
  buildExtension('amp-lightbox', '0.1', false, options);
  buildExtension('amp-slides', '0.1', false, options);
  buildExtension('amp-twitter', '0.1', false, options);
  buildExtension('amp-youtube', '0.1', false, options);
}

function clean(done) {
  del(['dist', 'dist.ads', 'build', 'examples.build'], done);
}

// TODO(@cramforce): Consolidate test running functions.
function unit(done) {
  build();
  karma.start({
    configFile: path.resolve('karma.conf.js'),
    files: tests,
    singleRun: true
  }, done);
}

function unitWatch(done) {
  build();
  karma.start({
    configFile: path.resolve('karma.conf.js'),
    files: tests,
  }, done);
}

function unitWatchVerbose(done) {
  build();
  karma.start({
    configFile: path.resolve('karma.conf.js'),
    files: tests
  }, done);
}

function unitSafari(done) {
  build();
  karma.start({
    configFile: path.resolve('karma.conf.js'),
    files: tests,
    singleRun: true,
    browsers: ['Safari'],
    client: {
      captureConsole: true,
      mocha: {
        timeout: 10000
      }
    }
  }, done);
}

function unitFirefox(done) {
  build();
  karma.start({
    configFile: path.resolve('karma.conf.js'),
    files: tests,
    singleRun: true,
    browsers: ['Firefox'],
    client: {
      captureConsole: true,
      mocha: {
        timeout: 10000
      }
    }
  }, done);
}

function polyfillsForTests() {
  compileJs('./src/', 'polyfills.js', './build/');
}

function lint() {
  return gulp.src(srcs, tests)
    .pipe(gjslint())
    .pipe(gjslint.reporter('console'))
}

function compile(watch, shouldMinify) {
  compileCss();
  compileJs('./src/', 'amp.js', './dist', {
    minifiedName: 'v0.js',
    watch: watch,
    minify: shouldMinify
  });
  compileJs('./ads/', 'ads.js', './dist.ads/' + internalRuntimeVersion, {
    minifiedName: 'f.js',
    watch: watch,
    minify: shouldMinify
  });
  adsBootstrap(watch);
}


function compileCss() {
  console.info('Recompiling CSS.');
  return jsifyCssPromise('css/amp.css').then(function(css) {
    return gulp.src('css/**.css')
        .pipe(file('css.js', 'export const cssText = ' + css))
        .pipe(gulp.dest('build'));
  });
}

function jsifyCssPromise(filename) {
  var css = fs.readFileSync(filename, "utf8");
  // Remove copyright comment. Crude hack to get our own copyright out
  // of the string.
  return postcss([cssprefixer]).process(css.toString())
      .then(function(result) {
        result.warnings().forEach(function(warn) {
          console.warn(warn.toString());
        });
      var css= result.css;
      css = css.replace(
        /\/\* START COPYRIGHT \*\/(.|[\n\r])*\/\* END COPYRIGHT \*\//m,
        '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
      return JSON.stringify(css + '\n/*# sourceURL=/' + filename + '*/');
    });
}

function watch() {
  gulpWatch('css/**/*.css', function() {
    compileCss();
  });
  buildExtensions({
    watch: true
  });
  return compile(true);
};

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
 * @param {!Object} options
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
    // Do not set watchers agains when we get called by the watcher.
    var copy = Object.create(options);
    copy.watch = false;
    gulpWatch(path + '/*', function() {
      buildExtension(name, version, hasCss, copy);
    });
  }
  var js = fs.readFileSync(jsPath, "utf8");
  if (hasCss) {
    return jsifyCssPromise(path + '/' + name + '.css').then(function(css) {
      console.assert(/\$CSS\$/.test(js),
          'Expected to find $CSS$ marker in extension JS: ' + jsPath);
      js = js.replace(/\$CSS\$/, css);
      return buildExtensionJs(js, jsPath, name, version, options);
    });
  } else {
    return buildExtensionJs(js, jsPath, name, version, options);
  }
}

function buildExtensionJs(js, jsPath, name, version, options) {
  var builtName = name + '-' + version + '.max.js';
  var minifiedName = name + '-' + version + '.js';
  return gulp.src(jsPath)
      .pipe(file(builtName, js))
      .pipe(gulp.dest('build/all/v0/'))
      .on('end', function() {
        compileJs('build/all/v0/', builtName, 'dist/v0/', {
          watch: options.watch,
          minify: options.minify,
          minifiedName: minifiedName,
          wrapper: '(window.AMP = window.AMP || []).push(function(AMP) {<%= contents %>\n});'
        });
      });
}

function build() {
  polyfillsForTests();
  buildExtensions();
  return compile();
}

gulp.task('css', compileCss);
gulp.task('extensions', buildExtensions);
gulp.task('clean', clean);
gulp.task('unit', unit);
gulp.task('unit-watch', unitWatch);
gulp.task('unit-watch-verbose', unitWatchVerbose);
gulp.task('unit-safari', unitSafari);
gulp.task('unit-firefox', unitFirefox);
gulp.task('build', build);
gulp.task('watch', function() { return watch(); });
gulp.task('minify', function() {
  process.env.NODE_ENV = 'production';
  compile(false, true);
  buildExtensions({minify: true});
  examplesWithMinifiedJs('ads.amp.html');
  examplesWithMinifiedJs('everything.amp.html');
  examplesWithMinifiedJs('newsstand.amp.html');
  examplesWithMinifiedJs('released.amp.html');
});
gulp.task('presubmit', function() {
  require('./build-system/presubmit-checks.js').run();
});

gulp.task('default', ['watch']);


/**
 * Copies an examples file to examples.min folder and changes all
 * JS references to point to the minified copies.
 * @param {string} name An html file in examples/
 */
function examplesWithMinifiedJs(name) {
  var input = 'examples/' + name;
  console.log('Processing ' + name);
  var html = fs.readFileSync(input, "utf8");
  var min = html;
  min = min.replace(/\.max\.js/g, '.js');
  min = min.replace(/dist\/amp\.js/g, 'dist\/v0\.js');
  gulp.src(input)
      .pipe(file(name.replace('.html', '.min.html'), min))
      .pipe(gulp.dest('examples.build/'));

  var prod = min;
  prod = prod.replace(/\.\.\/dist\//g, 'https://www.gstatic.com/amphtml/');
  gulp.src(input)
      .pipe(file(name.replace('.html', '.prod.html'), prod))
      .pipe(gulp.dest('examples.build/'));
}

function adsBootstrap(watch) {
  var input = 'ads/frame.max.html';
  if (watch) {
    gulpWatch(input, function() {
      adsBootstrap(false);
    });
  }
  console.log('Processing ' + input);
  var html = fs.readFileSync(input, "utf8");
  var min = html;
  min = min.replace(/\.\/ads\.js/g, './f.js');
  gulp.src(input)
      .pipe(file('frame.html', min))
      .pipe(gulp.dest('dist.ads/' + internalRuntimeVersion));
}


function compileJs(srcDir, srcFilename, destDir, options) {
  options = options || {};
  var bundler = browserify(srcDir + srcFilename, { debug: true }).transform(babel);
  if (options.watch) {
    bundler = watchify(bundler);
  }

  var wrapper = options.wrapper || '<%= contents %>';

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source(srcFilename))
      .pipe(buffer())
      .pipe(replace(/\$internalRuntimeVersion\$/g, internalRuntimeVersion))
      .pipe(wrap(wrapper))
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(destDir));
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
      .pipe(source(srcFilename))
      .pipe(buffer())
      .pipe(replace(/\$internalRuntimeVersion\$/g, internalRuntimeVersion))
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(wrap(wrapper))
      .pipe(uglify({
        preserveComments: 'some'
      }))
      .pipe(rename(options.minifiedName))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(destDir));
  }

  if (options.minify) {
    minify();
  } else {
    rebundle();
  }
}
