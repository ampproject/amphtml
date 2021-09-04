'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {execOrDie} = require('../common/exec');

/**
 * Runs ava tests.
 * @return {Promise<void>}
 */
async function ava() {
  // These need equivalents for CI in build-system/pr-check/build-targets.js
  // (see targetMatchers[Targets.AVA])
  const testFiles = [
    'build-system/release-tagger/test/*test*.js',
    'build-system/server/app-index/test/*test*.js',
    'build-system/server/test/app-utils.test.js',
    'build-system/tasks/get-zindex/get-zindex.test.js',
    'build-system/tasks/make-extension/test/test.js',
    'build-system/tasks/markdown-toc/test/test.js',
    'build-system/tasks/prepend-global/prepend-global.test.js',
  ];
  execOrDie(
    [
      'npx ava',
      ...testFiles,
      '--color --fail-fast',
      argv.watch ? '--watch' : '',
    ].join(' ')
  );
}

module.exports = {
  ava,
};

ava.description = "Run ava tests for AMP's tasks";

ava.flags = {
  'watch': 'Watch for changes',
};
