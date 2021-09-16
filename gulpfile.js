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

/* global require, process */

checkMinVersion();

const $$ = require('gulp-load-plugins')();
const applyConfig = require('./build-system/tasks/prepend-global/index.js').applyConfig;
const babel = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const cleanupBuildDir = require('./build-system/tasks/compile').cleanupBuildDir;
const closureCompile = require('./build-system/tasks/compile').closureCompile;
const colors = require('ansi-colors');
const createCtrlcHandler = require('./build-system/ctrlcHandler').createCtrlcHandler;
const exitCtrlcHandler = require('./build-system/ctrlcHandler').exitCtrlcHandler;
const fs = require('fs-extra');
const gulp = $$.help(require('gulp'));
const internalRuntimeToken = require('./build-system/internal-version').TOKEN;
const internalRuntimeVersion = require('./build-system/internal-version').VERSION;
const jsifyCssAsync = require('./build-system/tasks/jsify-css').jsifyCssAsync;
const lazypipe = require('lazypipe');
const log = require('fancy-log');
const minimatch = require('minimatch');
const minimist = require('minimist');
const removeConfig = require('./build-system/tasks/prepend-global/index.js').removeConfig;
const serve = require('./build-system/tasks/serve.js').serve;
const source = require('vinyl-source-stream');
const touch = require('touch');
const watchify = require('watchify');
const argv = minimist(
    process.argv.slice(2), {boolean: ['strictBabelTransform']});

require('./build-system/tasks');

const hostname = argv.hostname || 'cdn.ampproject.org';
const hostname3p = argv.hostname3p || '3p.ampproject.net';

// All declared extensions.
const extensions = {};
const extensionAliasFilePath = {};

const green = colors.green;
const red = colors.red;
const cyan = colors.cyan;

const minifiedRuntimeTarget = 'dist/v0.js';
const minified3pTarget = 'dist.3p/current-min/f.js';
const unminifiedRuntimeTarget = 'dist/amp.js';
const unminified3pTarget = 'dist.3p/current/integration.js';

// Each extension and version must be listed individually here.
declareExtension('amp-3q-player', '0.1', {hasCss: false});
declareExtension('amp-access', '0.1', {hasCss: true});
declareExtension('amp-access-laterpay', '0.1', {hasCss: true});
declareExtension('amp-access-scroll', '0.1', {hasCss: true});
declareExtension('amp-accordion', '0.1', {hasCss: false});
declareExtension('amp-ad', '0.1', {hasCss: true});
declareExtension('amp-ad-network-adsense-impl', 0.1, {hasCss: false});
declareExtension('amp-ad-network-adzerk-impl', 0.1, {hasCss: false});
declareExtension('amp-ad-network-doubleclick-impl', 0.1, {hasCss: false});
declareExtension('amp-ad-network-fake-impl', 0.1, {hasCss: false});
declareExtension('amp-ad-network-triplelift-impl', 0.1, {hasCss: false});
declareExtension('amp-ad-network-cloudflare-impl', 0.1, {hasCss: false});
declareExtension('amp-ad-network-gmossp-impl', 0.1, {hasCss: false});
declareExtension('amp-ad-exit', 0.1, {hasCss: false});
declareExtension('amp-analytics', '0.1', {hasCss: false});
declareExtension('amp-anim', '0.1', {hasCss: false});
declareExtension('amp-animation', '0.1', {hasCss: false});
declareExtension('amp-apester-media', '0.1', {hasCss: true});
declareExtension('amp-app-banner', '0.1', {hasCss: true});
declareExtension('amp-audio', '0.1', {hasCss: false});
declareExtension('amp-auto-ads', '0.1', {hasCss: false});
declareExtension('amp-bind', '0.1', {hasCss: false});
declareExtension('amp-brid-player', '0.1', {hasCss: false});
declareExtension('amp-brightcove', '0.1', {hasCss: false});
declareExtension('amp-kaltura-player', '0.1', {hasCss: false});
declareExtension('amp-call-tracking', '0.1', {hasCss: false});
declareExtension('amp-carousel', '0.1', {hasCss: true});
declareExtension('amp-compare-slider', '0.1', {hasCss: false});
declareExtension('amp-crypto-polyfill', '0.1', {hasCss: false});
declareExtension('amp-dailymotion', '0.1', {hasCss: false});
declareExtension('amp-dynamic-css-classes', '0.1', {hasCss: false});
declareExtension('amp-experiment', '0.1', {hasCss: false});
declareExtension('amp-facebook', '0.1', {hasCss: false});
declareExtension('amp-facebook-comments', '0.1', {hasCss: false});
declareExtension('amp-facebook-like', '0.1', {hasCss: false});
declareExtension('amp-fit-text', '0.1', {hasCss: true});
declareExtension('amp-font', '0.1', {hasCss: false});
declareExtension('amp-form', '0.1', {hasCss: true});
declareExtension('amp-fx-collection', '0.1', {hasCss: false});
declareExtension('amp-fx-flying-carpet', '0.1', {hasCss: true});
declareExtension('amp-gfycat', '0.1', {hasCss: false});
declareExtension('amp-gist', '0.1', {hasCss: false});
declareExtension('amp-gwd-animation', '0.1', {hasCss: true});
declareExtension('amp-hulu', '0.1', {hasCss: false});
declareExtension('amp-iframe', '0.1', {hasCss: false});
declareExtension('amp-ima-video', '0.1', {hasCss: false});
declareExtension('amp-image-lightbox', '0.1', {hasCss: true});
declareExtension('amp-imgur', '0.1', {hasCss: false});
declareExtension('amp-instagram', '0.1', {hasCss: true});
declareExtension('amp-install-serviceworker', '0.1', {hasCss: false});
declareExtension('amp-izlesene', '0.1', {hasCss: false});
declareExtension('amp-jwplayer', '0.1', {hasCss: false});
declareExtension('amp-lightbox', '0.1', {hasCss: true});
declareExtension('amp-lightbox-gallery', '0.1', {hasCss: true});
declareExtension('amp-list', '0.1', {hasCss: false});
declareExtension('amp-live-list', '0.1', {hasCss: true});
declareExtension('amp-mathml', '0.1', {hasCss: true});
declareExtension('amp-mustache', '0.1', {hasCss: false});
declareExtension('amp-nexxtv-player', '0.1', {hasCss: false});
declareExtension('amp-o2-player', '0.1', {hasCss: false});
declareExtension('amp-ooyala-player', '0.1', {hasCss: false});
declareExtension('amp-pinterest', '0.1', {hasCss: true});
declareExtension('amp-playbuzz', '0.1', {hasCss: true});
declareExtension('amp-reach-player', '0.1', {hasCss: false});
declareExtension('amp-reddit', '0.1', {hasCss: false});
declareExtension('amp-riddle-quiz', '0.1', {hasCss: false});
declareExtension('amp-share-tracking', '0.1', {hasCss: false});
declareExtension('amp-sidebar', '0.1', {hasCss: true});
declareExtension('amp-soundcloud', '0.1', {hasCss: false});
declareExtension('amp-springboard-player', '0.1', {hasCss: false});
declareExtension('amp-sticky-ad', '1.0', {hasCss: true});
declareExtension('amp-story', '0.1', {hasCss: true});
declareExtension('amp-selector', '0.1', {hasCss: true});
declareExtension('amp-web-push', '0.1', {hasCss: true});
declareExtension('amp-wistia-player', '0.1', {hasCss: false});
declareExtension('amp-position-observer', '0.1', {hasCss: false});
declareExtension('amp-date-picker', '0.1', {hasCss: true});
declareExtension('amp-image-viewer', '0.1', {hasCss: true});

/**
 * @deprecated `amp-slides` is deprecated and will be deleted before 1.0.
 * Please see {@link AmpCarousel} with `type=slides` attribute instead.
 */
declareExtension('amp-slides', '0.1', {hasCss: false});
declareExtension('amp-social-share', '0.1', {hasCss: true});
declareExtension('amp-timeago', '0.1', {hasCss: false});
declareExtension('amp-twitter', '0.1', {hasCss: false});
declareExtension('amp-user-notification', '0.1', {hasCss: true});
declareExtension('amp-vimeo', '0.1', {hasCss: false});
declareExtension('amp-vine', '0.1', {hasCss: false});
declareExtension('amp-viz-vega', '0.1', {hasCss: true});
declareExtension('amp-google-vrview-image', '0.1', {hasCss: false});
declareExtension('amp-viewer-integration', '0.1', {
  // The viewer integration code needs to run asap, so that viewers
  // can influence document state asap. Otherwise the document may take
  // a long time to learn that it should start process other extensions
  // faster.
  loadPriority: 'high',
});
declareExtension('amp-video', '0.1', {hasCss: false});
declareExtension('amp-vk', '0.1', {hasCss: false});
declareExtension('amp-youtube', '0.1', {hasCss: false});
declareExtensionVersionAlias(
    'amp-sticky-ad', '0.1', /* lastestVersion */ '1.0', /* hasCss */ true);


/**
 * @typedef {{
 *   name: ?string,
 *   version: ?string,
 *   hasCss: ?boolean,
 *   loadPriority: ?string
 * }}
 */
const ExtensionOption = {}; // eslint-disable-line no-unused-vars

/**
 * @param {string} name
 * @param {string} version E.g. 0.1
 * @param {!ExtensionOption} options extension options object.
 */
function declareExtension(name, version, options) {
  const defaultOptions = {hasCss: false};
  const extensionKey = `${name}-${version}`;
  extensions[extensionKey] = Object.assign({
    name,
    version,
  }, defaultOptions, options);
}

/**
 * This function is used for declaring deprecated extensions. It simply places the current
 * version code in place of the latest versions.
 * This has the ability to break an extension verison, so please be sure that this is
 * the correct one to use.
 * @param {string} name
 * @param {string} version E.g. 0.1
 * @param {string} lastestVersion
 * @param {boolean} hasCss
 */
function declareExtensionVersionAlias(name, version, lastestVersion, hasCss) {
  extensionAliasFilePath[name + '-' + version + '.js'] = {
    'name': name,
    'file': name + '-' + lastestVersion + '.js',
  };
  if (hasCss) {
    extensionAliasFilePath[name + '-' + version + '.css'] = {
      'name': name,
      'file': name + '-' + lastestVersion + '.css',
    };
  }
}

/**
 * Stops the timer for the given build step and prints the execution time,
 * unless we are on Travis.
 * @param {string} stepName Name of the action, like 'Compiled' or 'Minified'
 * @param {string} targetName Name of the target, like a filename or path
 * @param {DOMHighResTimeStamp} startTime Start time of build step
 */
function endBuildStep(stepName, targetName, startTime) {
  const endTime = Date.now();
  const executionTime = new Date(endTime - startTime);
  const secs = executionTime.getSeconds();
  const ms = ('000' + executionTime.getMilliseconds().toString()).slice(-3);
  let timeString = '(';
  if (secs === 0) {
    timeString += ms + ' ms)';
  } else {
    timeString += secs + '.' + ms + ' s)';
  }
  if (!process.env.TRAVIS) {
    log(stepName, cyan(targetName), green(timeString));
  }
}

/**
 * Build all the AMP extensions
 *
 * @param {!Object} options
 * @return {!Promise}
 */
function buildExtensions(options) {
  if (!!argv.noextensions) {
    return Promise.resolve();
  }

  let extensionsToBuild = [];
  if (!!argv.extensions) {
    extensionsToBuild = argv.extensions.split(',');
  }

  const results = [];
  for (const key in extensions) {
    if (extensionsToBuild.length > 0 &&
        extensionsToBuild.indexOf(extensions[key].name) == -1) {
      continue;
    }
    const e = extensions[key];
    let o = Object.assign({}, options);
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
  const promises = [
    compileJs('./3p/', 'integration.js',
        './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'), {
          minifiedName: 'f.js',
          checkTypes: opt_checkTypes,
          watch,
          minify: shouldMinify,
          preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
          externs: ['ads/ads.extern.js'],
          include3pDirectories: true,
          includePolyfills: true,
        }),
    compileJs('./3p/', 'ampcontext-lib.js',
        './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'), {
          minifiedName: 'ampcontext-v0.js',
          checkTypes: opt_checkTypes,
          watch,
          minify: shouldMinify,
          preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
          externs: ['ads/ads.extern.js'],
          include3pDirectories: true,
          includePolyfills: false,
        }),
    compileJs('./3p/', 'iframe-transport-client-lib.js',
        './dist.3p/' + (shouldMinify ? internalRuntimeVersion : 'current'), {
          minifiedName: 'iframe-transport-client-v0.js',
          checkTypes: opt_checkTypes,
          watch,
          minify: shouldMinify,
          preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
          externs: ['ads/ads.extern.js'],
          include3pDirectories: true,
          includePolyfills: false,
        }),
    compileJs('./src/', 'amp.js', './dist', {
      minifiedName: 'v0.js',
      includePolyfills: true,
      checkTypes: opt_checkTypes,
      watch,
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
          's.WebkitAnimation="none;"},1000);throw e};',
    }),
    compileJs('./extensions/amp-viewer-integration/0.1/examples/',
        'amp-viewer-host.js', './dist/v0/examples', {
          toName: 'amp-viewer-host.max.js',
          minifiedName: 'amp-viewer-host.js',
          incudePolyfills: true,
          watch,
          extraGlobs: ['extensions/amp-viewer-integration/**/*.js'],
          compilationLevel: 'WHITESPACE_ONLY',
          preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
          minify: false,
        }),
  ];

  // We don't rerun type check for the shadow entry point for now.
  if (!opt_checkTypes) {
    if (!watch || argv.with_shadow) {
      promises.push(
          compileJs('./src/', 'amp-shadow.js', './dist', {
            minifiedName: 'shadow-v0.js',
            includePolyfills: true,
            checkTypes: opt_checkTypes,
            watch,
            preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
            minify: shouldMinify,
          })
      );
    }

    if (!watch || argv.with_inabox) {
      promises.push(
          // Entry point for inabox runtime.
          compileJs('./src/inabox/', 'amp-inabox.js', './dist', {
            toName: 'amp-inabox.js',
            minifiedName: 'amp4ads-v0.js',
            includePolyfills: true,
            extraGlobs: ['src/inabox/*.js', '3p/iframe-messaging-client.js'],
            checkTypes: opt_checkTypes,
            watch,
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
            watch,
            preventRemoveAndMakeDir: opt_preventRemoveAndMakeDir,
            minify: shouldMinify,
            wrapper: '<%= contents %>',
          })
      );
    }

    promises.push(
        thirdPartyBootstrap(
            '3p/frame.max.html', 'frame.html', shouldMinify),
        thirdPartyBootstrap(
            '3p/nameframe.max.html', 'nameframe.html',shouldMinify)
    );

    if (watch) {
      $$.watch('3p/nameframe.max.html', function() {
        thirdPartyBootstrap(
            '3p/nameframe.max.html', 'nameframe.html', shouldMinify);
      });
      $$.watch('3p/frame.max.html', function() {
        thirdPartyBootstrap(
            '3p/frame.max.html', 'frame.html', shouldMinify);
      });
    }

    return Promise.all(promises);
  }
}

/**
 * Entry point for 'gulp css'
 * @return {!Promise}
 */
function css() {
  return compileCss();
}

/**
 * Compile all the css and drop in the build folder
 * @param {boolean} watch
 * @return {!Promise}
 */
function compileCss(watch) {
  // Print a message that could help speed up local development.
  if (!process.env.TRAVIS && argv['_'].indexOf('test') != -1) {
    log(green('To skip building during future test runs, use'),
        cyan('--nobuild'), green('with your'), cyan('gulp test'),
        green('command.'));
  }

  if (watch) {
    $$.watch('css/**/*.css', function() {
      compileCss();
    });
  }

  const startTime = Date.now();
  return jsifyCssAsync('css/amp.css')
      .then(function(css) {
        return toPromise(gulp.src('css/**.css')
            .pipe($$.file('css.js', 'export const cssText = ' +
              JSON.stringify(css)))
            .pipe(gulp.dest('build'))
            .on('end', function() {
              mkdirSync('build');
              mkdirSync('build/css');
              fs.writeFileSync('build/css/v0.css', css);
            }));
      })
      .then(() => {
        endBuildStep('Recompiled CSS in', 'amp.css', startTime);
      })
      .then(() => {
        return buildExtensions({
          bundleOnlyIfListedInFiles: false,
          compileOnlyCss: true,
        });
      });
}

/**
 * Copies the css from the build folder to the dist folder
 * @return {!Promise}
 */
function copyCss() {
  const startTime = Date.now();
  fs.copySync('build/css/v0.css', 'dist/v0.css');
  return toPromise(gulp.src('build/css/amp-*.css')
      .pipe(gulp.dest('dist/v0')))
      .then(() => {
        endBuildStep('Copied', 'build/css/v0.css to dist/v0.css', startTime);
      });
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
  // Building extensions is a 2 step process because of the renaming
  // and CSS inlining. This watcher watches the original file, copies
  // it to the destination and adds the CSS.
  if (options.watch) {
    // Do not set watchers again when we get called by the watcher.
    const copy = Object.create(options);
    copy.watch = false;
    $$.watch(path + '/*', function() {
      buildExtension(name, version, hasCss, copy);
    });
  }
  if (hasCss) {
    mkdirSync('build');
    mkdirSync('build/css');
    const startTime = Date.now();
    return jsifyCssAsync(path + '/' + name + '.css').then(function(css) {
      const jsCss = 'export const CSS = ' + JSON.stringify(css) + ';\n';
      const jsName = 'build/' + name + '-' + version + '.css.js';
      const cssName = 'build/css/' + name + '-' + version + '.css';
      fs.writeFileSync(jsName, jsCss, 'utf-8');
      fs.writeFileSync(cssName, css, 'utf-8');
      if (options.compileOnlyCss) {
        return Promise.resolve();
      }
      return buildExtensionJs(path, name, version, options);
    })
        .then(() => {
          endBuildStep('Recompiled CSS in', name, startTime);
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
  const filename = options.filename || name + '.js';
  if (options.loadPriority && options.loadPriority != 'high') {
    throw new Error('Unsupported loadPriority: ' + options.loadPriority);
  }
  const priority = options.loadPriority ? 'p:"high",' : '';
  return compileJs(path + '/', filename, './dist/v0', {
    watch: options.watch,
    preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
    minify: options.minify,
    toName: name + '-' + version + '.max.js',
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
 * Prints a helpful message that lets the developer know how to switch configs.
 * @param {string} command Command being run.
 */
function printConfigHelp(command) {
  if (!process.env.TRAVIS) {
    log(green('Building the runtime for local testing with the'),
        cyan((argv.config === 'canary') ? 'canary' : 'prod'),
        green('AMP config.'));
    log(green('⤷ Use'), cyan('--config={canary|prod}'), green('with your'),
        cyan(command), green('command to specify which config to apply.'));
  }
}

/**
 * Parse the --extensions or the --noextensions flag and
 * prints a helpful message that lets the developer know how to build
 * a list of extensions or without any extensions.
 */
function parseExtensionFlags() {
  if (!process.env.TRAVIS) {
    const noExtensionsMessage = green('⤷ Use ') +
        cyan('--noextensions ') +
        green('to skip building extensions.');
    const extensionsMessage = green('⤷ Use ') +
        cyan('--extensions=amp-foo,amp-bar ') +
        green('to choose which extensions to build.');
    const minimalSetMessage = green('⤷ Use ') +
        cyan('--extensions=minimal_set ') +
        green('to build just the extensions needed to load ') +
        cyan('article.amp.html') + green('.');
    if (argv.extensions) {
      if (typeof (argv.extensions) !== 'string') {
        log(red('ERROR:'), 'Missing list of extensions.');
        log(noExtensionsMessage);
        log(extensionsMessage);
        log(minimalSetMessage);
        process.exit(1);
      }
      if (argv.extensions === 'minimal_set') {
        argv.extensions =
            'amp-ad,amp-ad-network-adsense-impl,amp-audio,amp-video,' +
            'amp-image-lightbox,amp-lightbox,amp-sidebar,' +
            'amp-analytics,amp-app-banner';
      }
      log(green('Building extension(s):'),
          cyan(argv.extensions.split(',').join(', ')));
    } else if (argv.noextensions) {
      log(green('Not building any AMP extensions.'));
    } else {
      log(green('Building all AMP extensions.'));
    }
    log(noExtensionsMessage);
    log(extensionsMessage);
    log(minimalSetMessage);
  }
}

/**
 * Enables runtime to be used for local testing by writing AMP_CONFIG to file.
 * Called at the end of "gulp build" and "gulp dist --fortesting".
 * @param {string} targetFile File to which the config is to be written.
 */
function enableLocalTesting(targetFile) {
  const config = (argv.config === 'canary') ? 'canary' : 'prod';
  const baseConfigFile =
      'build-system/global-configs/' + config + '-config.json';

  return removeConfig(targetFile).then(() => {
    return applyConfig(
        config, targetFile, baseConfigFile,
        /* opt_localDev */ true, /* opt_localBranch */ true);
  });
}

/**
 * Performs the build steps for gulp build and gulp watch
 * @param {boolean} watch
 * @return {!Promise}
 */
function performBuild(watch) {
  process.env.NODE_ENV = 'development';
  printConfigHelp(watch ? 'gulp watch' : 'gulp build');
  parseExtensionFlags();
  return compileCss(watch).then(() => {
    return Promise.all([
      polyfillsForTests(),
      buildAlp({watch}),
      buildExaminer({watch}),
      buildSw({watch}),
      buildWebWorker({watch}),
      buildExtensions({bundleOnlyIfListedInFiles: !watch, watch}),
      compile(watch),
    ]);
  });
}

/**
 * Enables watching for file changes in css, extensions.
 * @return {!Promise}
 */
function watch() {
  const handlerProcess = createCtrlcHandler('watch');
  return performBuild(true).then(() => exitCtrlcHandler(handlerProcess));
}

/**
 * Main build
 * @return {!Promise}
 */
function build() {
  const handlerProcess = createCtrlcHandler('build');
  return performBuild().then(() => exitCtrlcHandler(handlerProcess));
}

/**
 * Dist Build
 * @return {!Promise}
 */
function dist() {
  const handlerProcess = createCtrlcHandler('dist');
  process.env.NODE_ENV = 'production';
  cleanupBuildDir();
  if (argv.fortesting) {
    printConfigHelp('gulp dist --fortesting');
  }
  parseExtensionFlags();
  return compileCss().then(() => {
    return Promise.all([
      compile(false, true, true),
      // NOTE:
      // When adding a line here, consider whether you need to include polyfills
      // and whether you need to init logging (initLogConstructor).
      buildAlp({minify: true, watch: false, preventRemoveAndMakeDir: true}),
      buildExaminer({
        minify: true, watch: false, preventRemoveAndMakeDir: true}),
      buildSw({minify: true, watch: false, preventRemoveAndMakeDir: true}),
      buildWebWorker({
        minify: true, watch: false, preventRemoveAndMakeDir: true}),
      buildExtensions({minify: true, preventRemoveAndMakeDir: true}),
      buildExperiments({
        minify: true, watch: false, preventRemoveAndMakeDir: true}),
      buildLoginDone({
        minify: true, watch: false, preventRemoveAndMakeDir: true}),
      buildWebPushPublisherFiles({
        minify: true, watch: false, preventRemoveAndMakeDir: true}),
      copyCss(),
    ]);
  }).then(() => {
    copyAliasExtensions();
  }).then(() => {
    if (argv.fortesting) {
      return enableLocalTesting(minifiedRuntimeTarget);
    }
  }).then(() => {
    if (argv.fortesting) {
      return enableLocalTesting(minified3pTarget);
    }
  }).then(() => exitCtrlcHandler(handlerProcess));
}

/**
 * Copy built extension to alias extension
 */
function copyAliasExtensions() {
  if (argv.noextensions) {
    return;
  }
  let extensionsToBuild = [];
  if (!!argv.extensions) {
    extensionsToBuild = argv.extensions.split(',');
  }

  for (const key in extensionAliasFilePath) {
    if (extensionsToBuild.length > 0 &&
        extensionsToBuild.indexOf(extensionAliasFilePath[key]['name']) == -1) {
      continue;
    }
    fs.copySync('dist/v0/' + extensionAliasFilePath[key]['file'],
        'dist/v0/' + key);
  }
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
  const compileSrcs = [
    './src/amp.js',
    './src/amp-shadow.js',
    './src/inabox/amp-inabox.js',
    './ads/alp/install-alp.js',
    './ads/inabox/inabox-host.js',
    './src/service-worker/shell.js',
    './src/service-worker/core.js',
    './src/service-worker/kill.js',
    './src/web-worker/web-worker.js',
  ];
  const extensionValues = Object.keys(extensions).map(function(key) {
    return extensions[key];
  });
  const extensionSrcs = extensionValues.filter(function(extension) {
    return !extension.noTypeCheck;
  }).map(function(extension) {
    return './extensions/' + extension.name + '/' +
        extension.version + '/' + extension.name + '.js';
  }).sort();
  return compileCss().then(() => {
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
      closureCompile(['./3p/iframe-transport-client-lib.js'], './dist',
          'iframe-transport-client-check-types.js', {
            externs: ['ads/ads.extern.js'],
            include3pDirectories: true,
            includePolyfills: true,
            checkTypes: true,
          }),
    ]);
  });
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
  const startTime = Date.now();
  if (!shouldMinify) {
    return toPromise(gulp.src(input)
        .pipe(gulp.dest('dist.3p/current')))
        .then(() => {
          endBuildStep('Processed', input, startTime);
        });
  }

  // By default we use an absolute URL, that is independent of the
  // actual frame host for the JS inside the frame.
  // But during testing we need a relative reference because the
  // version is not available on the absolute path.
  const integrationJs = argv.fortesting
    ? './f.js'
    : `https://${hostname3p}/${internalRuntimeVersion}/f.js`;
  // Convert default relative URL to absolute min URL.
  const html = fs.readFileSync(input, 'utf8')
      .replace(/\.\/integration\.js/g, integrationJs);
  return toPromise($$.file(outputName, html, {src: true})
      .pipe(gulp.dest('dist.3p/' + internalRuntimeVersion))
      .on('end', function() {
        const aliasToLatestBuild = 'dist.3p/current-min';
        if (fs.existsSync(aliasToLatestBuild)) {
          fs.unlinkSync(aliasToLatestBuild);
        }
        fs.symlinkSync(
            './' + internalRuntimeVersion,
            aliasToLatestBuild,
            'dir');
      }))
      .then(() => {
        endBuildStep('Processed', input, startTime);
      });
}

const MODULE_SEPARATOR = ';';
const EXTENSION_BUNDLE_MAP = {
  'amp-viz-vega.js': [
    'third_party/d3/d3.js',
    'third_party/d3-geo-projection/d3-geo-projection.js',
    'third_party/vega/vega.js',
  ],
};

/**
 * Allows (ap|pre)pending to the already compiled, minified JS file
 *
 * @param {string} srcFilename Name of the JS source file
 * @param {string} destFilePath File path to the compiled JS file
 */
function appendToCompiledFile(srcFilename, destFilePath) {
  const bundleFiles = EXTENSION_BUNDLE_MAP[srcFilename];
  if (bundleFiles) {
    const newSource = concatFilesToString(bundleFiles.concat([destFilePath]));
    fs.writeFileSync(destFilePath, newSource, 'utf8');
  }
}

/**
 * Synchronously concatenates the given files into a string.
 *
 * @param {Array<string>} files A list of file paths.
 * @return {string} The concatenated contents of the given files.
 */
function concatFilesToString(files) {
  return files.map(function(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }).join(MODULE_SEPARATOR);
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
    const startTime = Date.now();
    return closureCompile(
        srcDir + srcFilename, destDir, options.minifiedName, options)
        .then(function() {
          const destPath = destDir + '/' + options.minifiedName;
          appendToCompiledFile(srcFilename, destPath);
          fs.writeFileSync(destDir + '/version.txt', internalRuntimeVersion);
          if (options.latestName) {
            fs.copySync(
                destPath,
                destDir + '/' + options.latestName);
          }
        })
        .then(() => {
          endBuildStep('Minified', srcFilename, startTime);
        });
  }

  const browsers = [];
  if (process.env.TRAVIS) {
    browsers.push('last 2 versions', 'safari >= 9');
  } else {
    browsers.push('Last 4 Chrome versions');
  }

  let bundler = browserify(srcDir + srcFilename, {debug: true})
      .transform(babel, {
        presets: [
          ['env', {
            targets: {
              browsers,
            },
          }],
        ],
      });
  if (options.watch) {
    bundler = watchify(bundler);
  }

  const wrapper = options.wrapper || '<%= contents %>';

  const lazybuild = lazypipe()
      .pipe(source, srcFilename)
      .pipe(buffer)
      .pipe($$.replace, /\$internalRuntimeVersion\$/g, internalRuntimeVersion)
      .pipe($$.replace, /\$internalRuntimeToken\$/g, internalRuntimeToken)
      .pipe($$.wrap, wrapper)
      .pipe($$.sourcemaps.init.bind($$.sourcemaps), {loadMaps: true});

  const lazywrite = lazypipe()
      .pipe($$.sourcemaps.write.bind($$.sourcemaps), './')
      .pipe(gulp.dest.bind(gulp), destDir);

  const destFilename = options.toName || srcFilename;
  function rebundle() {
    const startTime = Date.now();
    return toPromise(
        bundler.bundle()
            .on('error', function(err) {
              // Drop the node_modules call stack, which begins with '    at'.
              const message = err.stack.replace(/    at[^]*/, '').trim();
              console.error(red(message));
              process.exit(1);
            })
            .pipe(lazybuild())
            .pipe($$.rename(destFilename))
            .pipe(lazywrite())
            .on('end', function() {
              appendToCompiledFile(srcFilename, destDir + '/' + destFilename);
            }))
        .then(() => {
          endBuildStep('Compiled', srcFilename, startTime);
        })
        .then(() => {
          if (process.env.NODE_ENV === 'development') {
            if (srcFilename === 'amp.js') {
              return enableLocalTesting(unminifiedRuntimeTarget);
            } else if (srcFilename === 'integration.js') {
              return enableLocalTesting(unminified3pTarget);
            } else {
              return Promise.resolve();
            }
          } else {
            return Promise.resolve();
          }
        });
  }

  if (options.watch) {
    bundler.on('update', function() {
      rebundle();
      // Touch file in unit test set. This triggers rebundling of tests because
      // karma only considers changes to tests files themselves re-bundle
      // worthy.
      touch('test/_init_tests.js');
    });
  }

  if (options.watch === false) {
    // Due to the two step build process, compileJs() is called twice, once with
    // options.watch set to true and, once with it set to false. However, we do
    // not need to call rebundle() twice. This avoids the duplicate compile seen
    // when you run `gulp watch` and touch a file.
    return Promise.resolve();
  } else {
    // This is the default options.watch === true case, and also covers the
    // `gulp build` / `gulp dist` cases where options.watch is undefined.
    return rebundle();
  }
}

/**
 * Build all the AMP experiments.html/js.
 *
 * @param {!Object} options
 */
function buildExperiments(options) {
  options = options || {};
  const path = 'tools/experiments';
  const htmlPath = path + '/experiments.html';
  const jsPath = path + '/experiments.js';
  let watch = options.watch;
  if (watch === undefined) {
    watch = argv.watch || argv.w;
  }

  // Building extensions is a 2 step process because of the renaming
  // and CSS inlining. This watcher watches the original file, copies
  // it to the destination and adds the CSS.
  if (watch) {
    // Do not set watchers again when we get called by the watcher.
    const copy = Object.create(options);
    copy.watch = false;
    $$.watch(path + '/*', function() {
      buildExperiments(copy);
    });
  }

  // Build HTML.
  const html = fs.readFileSync(htmlPath, 'utf8');
  const minHtml = html.replace('/dist.tools/experiments/experiments.js',
      `https://${hostname}/v0/experiments.js`);
  gulp.src(htmlPath)
      .pipe($$.file('experiments.cdn.html', minHtml))
      .pipe(gulp.dest('dist.tools/experiments/'));

  // Build JS.
  const js = fs.readFileSync(jsPath, 'utf8');
  const builtName = 'experiments.max.js';
  const minifiedName = 'experiments.js';
  return toPromise(gulp.src(path + '/*.js')
      .pipe($$.file(builtName, js))
      .pipe(gulp.dest('build/experiments/')))
      .then(function() {
        return compileJs(
            './build/experiments/', builtName, './dist.tools/experiments/', {
              watch: false,
              minify: options.minify || argv.minify,
              includePolyfills: true,
              minifiedName,
              preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
              checkTypes: options.checkTypes,
            });
      });
}


/**
 * Build amp-web-push publisher files HTML page.
 *
 * @param {!Object} options
 */
function buildWebPushPublisherFiles(options) {
  return buildWebPushPublisherFilesVersion('0.1', options);
}


/**
 * Build amp-web-push publisher files HTML page.
 *
 * @param {!Object} options
 */
function buildWebPushPublisherFilesVersion(version, options) {
  options = options || {};
  const watch = options.watch;
  const fileNames =
      ['amp-web-push-helper-frame', 'amp-web-push-permission-dialog'];
  const promises = [];

  mkdirSync('dist');
  mkdirSync('dist/v0');

  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    promises.push(buildWebPushPublisherFile(version, fileName, watch, options));
  }

  return Promise.all(promises);
}

function buildWebPushPublisherFile(version, fileName, watch, options) {
  const basePath = 'extensions/amp-web-push/' + version + '/';
  const tempBuildDir = 'build/all/v0/';
  const distDir = 'dist/v0';

  // Build Helper Frame JS
  const js = fs.readFileSync(basePath + fileName + '.js', 'utf8');
  const builtName = fileName + '.js';
  const minifiedName = fileName + '.js';
  return toPromise(gulp.src(basePath + '/*.js')
      .pipe($$.file(builtName, js))
      .pipe(gulp.dest(tempBuildDir)))
      .then(function() {
        return compileJs('./' + tempBuildDir, builtName, './' + distDir, {
          watch,
          includePolyfills: true,
          minify: options.minify || argv.minify,
          minifiedName,
          preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
        });
      })
      .then(function() {
        if (fs.existsSync(distDir + '/' + minifiedName)) {
          // Build Helper Frame HTML
          let fileContents =
              fs.readFileSync(basePath + fileName + '.html', 'utf8');
          fileContents = fileContents.replace(
              '<!-- [GULP-MAGIC-REPLACE ' + fileName + '.js] -->',
              '<script>' + fs.readFileSync(distDir + '/' +
              minifiedName, 'utf8') + '</script>'
          );

          fs.writeFileSync('dist/v0/' + fileName + '.html',
              fileContents);
        }
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
  const path = 'extensions/amp-access/' + version + '/';
  const htmlPath = path + 'amp-login-done.html';
  const jsPath = path + 'amp-login-done.js';
  let watch = options.watch;
  if (watch === undefined) {
    watch = argv.watch || argv.w;
  }

  // Building extensions is a 2 step process because of the renaming
  // and CSS inlining. This watcher watches the original file, copies
  // it to the destination and adds the CSS.
  if (watch) {
    // Do not set watchers again when we get called by the watcher.
    const copy = Object.create(options);
    copy.watch = false;
    $$.watch(path + '/*', function() {
      buildLoginDoneVersion(version, copy);
    });
  }

  // Build HTML.
  const html = fs.readFileSync(htmlPath, 'utf8');
  const minJs = `https://${hostname}/v0/amp-login-done-${version}.js`;
  const minHtml = html
      .replace(
          `../../../dist/v0/amp-login-done-${version}.max.js`,
          minJs)
      .replace(
          `../../../dist/v0/amp-login-done-${version}.js`,
          minJs);
  if (minHtml.indexOf(minJs) == -1) {
    throw new Error('Failed to correctly set JS in login-done.html');
  }

  mkdirSync('dist');
  mkdirSync('dist/v0');

  fs.writeFileSync('dist/v0/amp-login-done-' + version + '.html',
      minHtml);

  // Build JS.
  const js = fs.readFileSync(jsPath, 'utf8');
  const builtName = 'amp-login-done-' + version + '.max.js';
  const minifiedName = 'amp-login-done-' + version + '.js';
  const latestName = 'amp-login-done-latest.js';
  return toPromise(gulp.src(path + '/*.js')
      .pipe($$.file(builtName, js))
      .pipe(gulp.dest('build/all/v0/')))
      .then(function() {
        return compileJs('./build/all/v0/', builtName, './dist/v0/', {
          watch: false,
          includePolyfills: true,
          minify: options.minify || argv.minify,
          minifiedName,
          preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
          latestName,
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
 * Build Examiner JS.
 *
 * @param {!Object} options
 */
function buildExaminer(options) {
  options = options || {};
  return compileJs('./src/examiner/', 'examiner.js', './dist/', {
    toName: 'examiner.max.js',
    watch: options.watch,
    minify: options.minify || argv.minify,
    includePolyfills: true,
    minifiedName: 'examiner.js',
    preventRemoveAndMakeDir: options.preventRemoveAndMakeDir,
  });
}

/**
 * Build service worker JS.
 *
 * @param {!Object} options
 */
function buildSw(options) {
  const opts = Object.assign({}, options);
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
  const opts = Object.assign({}, options);
  return compileJs('./src/web-worker/', 'web-worker.js', './dist/', {
    toName: 'ww.max.js',
    minifiedName: 'ww.js',
    includePolyfills: true,
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
  const majorVersion = Number(process.version.replace(/v/, '').split('.')[0]);
  if (majorVersion < 4) {
    log('Please run AMP with node.js version 4 or newer.');
    log('Your version is', process.version);
    process.exit(1);
  }
}

function mkdirSync(path) {
  try {
    fs.mkdirSync(path);
  } catch (e) {
    if (e.code != 'EEXIST') {
      throw e;
    }
  }
}

/**
 * Patches Web Animations API by wrapping its body into `install` function.
 * This gives us an option to call polyfill directly on the main window
 * or a friendly iframe.
 *
 * @return {!Promise}
 */
function patchWebAnimations() {
  // Copies web-animations-js into a new file that has an export.
  const patchedName = 'node_modules/web-animations-js/' +
      'web-animations.install.js';
  let file = fs.readFileSync(
      'node_modules/web-animations-js/' +
      'web-animations.min.js').toString();
  // Wrap the contents inside the install function.
  file = 'exports.installWebAnimations = function(window) {\n' +
      'var document = window.document;\n' +
      file + '\n' +
      '}\n';
  fs.writeFileSync(patchedName, file);
  if (!process.env.TRAVIS) {
    log('Wrote', cyan(patchedName));
  }
}

function toPromise(readable) {
  return new Promise(function(resolve, reject) {
    readable.on('error', reject).on('end', resolve);
  });
}

/* eslint "google-camelcase/google-camelcase": 0 */

/**
 * Gulp tasks
 */
gulp.task('build', 'Builds the AMP library',
    ['update-packages', 'patch-web-animations'], build, {
      options: {
        config: '  Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
        extensions: '  Builds only the listed extensions.',
        noextensions: '  Builds with no extensions.',
      },
    });
gulp.task('check-all', 'Run through all presubmit checks',
    ['lint', 'dep-check', 'check-types', 'presubmit']);
gulp.task('check-types', 'Check JS types', checkTypes);
gulp.task('patch-web-animations',
    'Patches the Web Animations API with an install function',
    ['update-packages'], patchWebAnimations);
gulp.task('css', 'Recompile css to build directory', ['update-packages'], css);
gulp.task('default', 'Runs "watch" and then "serve"',
    ['update-packages', 'watch'], serve, {
      options: {
        extensions: '  Watches and builds only the listed extensions.',
        noextensions: '  Watches and builds with no extensions.',
      },
    });
gulp.task('dist', 'Build production binaries',
    ['update-packages', 'patch-web-animations'], dist, {
      options: {
        pseudo_names: '  Compiles with readable names. ' +
            'Great for profiling and debugging production code.',
        fortesting: '  Compiles production binaries for local testing',
        config: '  Sets the runtime\'s AMP_CONFIG to one of "prod" or "canary"',
      },
    });
gulp.task('watch', 'Watches for changes in files, re-builds when detected',
    ['update-packages', 'patch-web-animations'], watch, {
      options: {
        with_inabox: '  Also watch and build the amp-inabox.js binary.',
        with_shadow: '  Also watch and build the amp-shadow.js binary.',
        extensions: '  Watches and builds only the listed extensions.',
        noextensions: '  Watches and builds with no extensions.',
      },
    });
gulp.task('build-experiments', 'Builds experiments.html/js', buildExperiments);
gulp.task('build-login-done', 'Builds login-done.html/js', buildLoginDone);
