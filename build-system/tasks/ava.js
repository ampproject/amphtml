'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {dirname, relative} = require('path');
const {execOrDie} = require('../common/exec');
const {sync: globbySync} = require('globby');

const testFiles = [
  'build-system/compile/generate/test/*.test.js',
  'build-system/release-tagger/test/*test*.js',
  'build-system/server/app-index/test/*test*.js',
  'build-system/server/test/app-utils.test.js',
  'build-system/tasks/get-zindex/get-zindex.test.js',
  'build-system/tasks/make-extension/test/test.js',
  'build-system/tasks/markdown-toc/test/test.js',
  'build-system/tasks/prepend-global/prepend-global.test.js',
  'build-system/tasks/remap-dependencies-plugin/test-remap-dependencies.js',
];

let targetFiles;

/**
 * Determines whether to trigger ava by a file change adjacent to a test file.
 * Considered adjacent when the file changed is in the same directory as one of
 * the listed test files, or its parent if the directory is named `test`.
 * @param {string} changedFile
 * @return {boolean}
 */
function shouldTriggerAva(changedFile) {
  if (!targetFiles) {
    const thisFile = relative(process.cwd(), __filename);
    const patterns = testFiles.map(
      (pattern) => dirname(pattern).replace(/\/test$/, '') + '/'
    );
    targetFiles = new Set([thisFile, ...globbySync(patterns)]);
  }
  return targetFiles.has(changedFile);
}

/**
 * Runs ava tests.
 * @return {Promise<void>}
 */
async function ava() {
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
  shouldTriggerAva,
};

ava.description = "Run ava tests for AMP's tasks";

ava.flags = {
  'watch': 'Watch for changes',
};
