'use strict';
const extensionBundles = require('./bundles.config.extensions.json');
const wrappers = require('./compile-wrappers');
const {cyan, red} = require('kleur/colors');
const {log} = require('../common/logging');

const {VERSION: internalRuntimeVersion} = require('./internal-version');

/**
 * Used to generate top-level JS build targets
 */
exports.jsBundles = {
  'polyfills.js': {
    srcDir: './src/',
    srcFilename: 'polyfills/index.js',
    destDir: './build/',
    minifiedDestDir: './build/',
  },
  'bento.js': {
    srcDir: './src/bento',
    srcFilename: 'bento.js',
    destDir: './dist',
    minifiedDestDir: './dist',
    options: {
      includePolyfills: false,
      toName: 'bento.max.js',
      minifiedName: 'bento.js',
      // For backwards-compat:
      aliasName: 'custom-elements-polyfill.js',
    },
  },
  'alp.max.js': {
    srcDir: './ads/alp/',
    srcFilename: 'install-alp.js',
    destDir: './dist',
    minifiedDestDir: './dist',
    options: {
      toName: 'alp.max.js',
      includePolyfills: true,
      minifiedName: 'alp.js',
    },
  },
  'ww.max.js': {
    srcDir: './src/web-worker/',
    srcFilename: 'web-worker.js',
    destDir: './dist',
    minifiedDestDir: './dist',
    options: {
      toName: 'ww.max.js',
      minifiedName: 'ww.js',
      includePolyfills: true,
    },
  },
  'integration.js': {
    srcDir: './3p/',
    srcFilename: 'integration.js',
    destDir: './dist.3p/current',
    minifiedDestDir: './dist.3p/' + internalRuntimeVersion,
    options: {
      minifiedName: 'f.js',
      externs: ['./ads/ads.extern.js'],
      include3pDirectories: true,
      includePolyfills: true,
    },
  },
  'ampcontext-lib.js': {
    srcDir: './3p/',
    srcFilename: 'ampcontext-lib.js',
    destDir: './dist.3p/current',
    minifiedDestDir: './dist.3p/' + internalRuntimeVersion,
    options: {
      minifiedName: 'ampcontext-v0.js',
      externs: ['./ads/ads.extern.js'],
      include3pDirectories: true,
      includePolyfills: false,
    },
  },
  'amp-script-proxy-iframe.js': {
    srcDir: './3p/',
    srcFilename: 'amp-script-proxy-iframe.js',
    destDir: './dist.3p/current',
    minifiedDestDir: './dist.3p/' + internalRuntimeVersion,
    options: {
      minifiedName: 'amp-script-proxy-iframe.js',
      include3pDirectories: true,
      includePolyfills: false,
    },
  },
  'iframe-transport-client-lib.js': {
    srcDir: './3p/',
    srcFilename: 'iframe-transport-client-lib.js',
    destDir: './dist.3p/current',
    minifiedDestDir: './dist.3p/' + internalRuntimeVersion,
    options: {
      minifiedName: 'iframe-transport-client-v0.js',
      externs: ['./ads/ads.extern.js'],
      include3pDirectories: true,
      includePolyfills: false,
    },
  },
  'recaptcha.js': {
    srcDir: './3p/',
    srcFilename: 'recaptcha.js',
    destDir: './dist.3p/current',
    minifiedDestDir: './dist.3p/' + internalRuntimeVersion,
    options: {
      minifiedName: 'recaptcha.js',
      externs: [],
      include3pDirectories: true,
      includePolyfills: true,
    },
  },
  'amp-viewer-host.max.js': {
    srcDir: './extensions/amp-viewer-integration/0.1/examples/',
    srcFilename: 'amp-viewer-host.js',
    destDir: './dist/v0/examples',
    minifiedDestDir: './dist/v0/examples',
    options: {
      toName: 'amp-viewer-host.max.js',
      minifiedName: 'amp-viewer-host.js',
      incudePolyfills: true,
      skipUnknownDepsCheck: true,
    },
  },
  'video-iframe-integration.js': {
    srcDir: './src/',
    srcFilename: 'video-iframe-integration.js',
    destDir: './dist',
    minifiedDestDir: './dist',
    options: {
      minifiedName: 'video-iframe-integration-v0.js',
      includePolyfills: false,
    },
  },
  'amp-story-entry-point.js': {
    srcDir: './src/amp-story-player/amp-story-entry-point/',
    srcFilename: 'amp-story-entry-point.js',
    destDir: './dist',
    minifiedDestDir: './dist',
    options: {
      minifiedName: 'amp-story-entry-point-v0.js',
      includePolyfills: false,
    },
  },
  'amp-story-player.js': {
    srcDir: './src/amp-story-player/',
    srcFilename: 'amp-story-player.js',
    destDir: './dist',
    minifiedDestDir: './dist',
    options: {
      minifiedName: 'amp-story-player-v0.js',
      includePolyfills: false,
    },
  },
  'amp-inabox-host.js': {
    srcDir: './ads/inabox/',
    srcFilename: 'inabox-host.js',
    destDir: './dist',
    minifiedDestDir: './dist',
    options: {
      toName: 'amp-inabox-host.js',
      minifiedName: 'amp4ads-host-v0.js',
      includePolyfills: false,
    },
  },
  'amp.js': {
    srcDir: './src/',
    srcFilename: 'amp.js',
    destDir: './dist',
    minifiedDestDir: './dist',
    options: {
      minifiedName: 'v0.js',
      includePolyfills: true,
      wrapper: wrappers.mainBinary,
    },
  },
  'amp-shadow.js': {
    srcDir: './src/',
    srcFilename: 'amp-shadow.js',
    destDir: './dist',
    minifiedDestDir: './dist',
    options: {
      minifiedName: 'shadow-v0.js',
      includePolyfills: true,
    },
  },
  'amp-inabox.js': {
    srcDir: './src/inabox/',
    srcFilename: 'amp-inabox.js',
    destDir: './dist',
    minifiedDestDir: './dist',
    options: {
      toName: 'amp-inabox.js',
      minifiedName: 'amp4ads-v0.js',
      includePolyfills: true,
    },
  },
};

/**
 * Used to generate extension build targets
 */
exports.extensionBundles = extensionBundles;

/**
 * Used to alias a version of an extension to an older deprecated version.
 */
exports.extensionAliasBundles = {
  'amp-sticky-ad': {
    version: '1.0',
    aliasedVersion: '0.1',
  },
  'amp-story': {
    version: '1.0',
    aliasedVersion: '0.1',
  },
};

/**
 * @param {boolean} condition
 * @param {string} field
 * @param {string} message
 * @param {string} name
 * @param {string} found
 */
function verifyBundle_(condition, field, message, name, found) {
  if (!condition) {
    log(red('ERROR:'), cyan(field), message, cyan(name), '\n' + found);
    process.exit(1);
  }
}

exports.verifyExtensionBundles = function () {
  extensionBundles.forEach((bundle, i) => {
    const bundleString = JSON.stringify(bundle, null, 2);
    verifyBundle_(
      'name' in bundle,
      'name',
      'is missing from',
      '',
      bundleString
    );
    verifyBundle_(
      i === 0 || bundle.name.localeCompare(extensionBundles[i - 1].name) >= 0,
      'name',
      'is out of order. extensionBundles should be alphabetically sorted by name.',
      bundle.name,
      bundleString
    );
    verifyBundle_(
      'version' in bundle,
      'version',
      'is missing from',
      bundle.name,
      bundleString
    );
  });
};
