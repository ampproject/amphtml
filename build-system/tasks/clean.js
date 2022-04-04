'use strict';

const argv = require('minimist')(process.argv.slice(2));
const del = require('del');
const fs = require('fs-extra');
const path = require('path');
const {cyan, yellow} = require('kleur/colors');
const {ignoreFile, splitIgnoreListByHeader} = require('./check-ignore-lists');
const {log} = require('../common/logging');

const ROOT_DIR = path.resolve(__dirname, '../../');

/**
 * Rewrite glob patterns according to .gitignore syntax relative to cwd.
 * https://git-scm.com/docs/gitignore#_pattern_format
 * @param {string} pattern In .gitignore format
 * @return {string} Pattern in standard glob format
 */
function gitignoreToGlobPattern(pattern) {
  // If there is a separator at the beginning or middle (or both) of the
  // pattern, then the pattern is relative to the directory level of the
  // particular .gitignore file itself.
  if (pattern.startsWith('/')) {
    return pattern.substr(1);
  }
  // Otherwise the pattern may also match at any level below the .gitignore level.
  return `**/${pattern}`;
}

/**
 * @return {Promise<string[]>}
 */
async function getPathsFromIgnoreList() {
  const [, below] = splitIgnoreListByHeader(
    await fs.readFile(ignoreFile, 'utf8')
  );
  return (
    below
      .split('\n')
      // Comments and empty lines
      .filter((line) => line.trim().length > 0 && !line.startsWith('#'))
      .map((line) => gitignoreToGlobPattern(line))
  );
}

/**
 * Cleans up various cache and output directories. Optionally cleans up inner
 * node_modules package directories, or excludes some directories from deletion.
 * @return {Promise<void>}
 */
async function clean() {
  const pathsFromIgnoreList = [
    ...(await getPathsFromIgnoreList()),
    '!**/third_party',
    '!**/node_modules',
  ];

  const pathsFromArgv = [];

  if (argv.include_subpackages) {
    pathsFromArgv.push('**/node_modules', '!node_modules');
  }

  // User configuration files
  // Keep this list in sync with .gitignore
  const customConfigs = [
    'build-system/global-configs/custom-config.json',
    'build-system/global-configs/custom-flavors-config.json',
  ];
  if (argv.include_custom_configs) {
    pathsFromArgv.push(...customConfigs);
  } else {
    for (const customConfig of customConfigs) {
      if (fs.existsSync(customConfig)) {
        log(yellow('Skipping path:'), cyan(customConfig));
      }
    }
  }

  const excludes =
    argv.exclude?.split(',').map((exclude) => `!${exclude}`) ?? [];

  const delOptions = {
    expandDirectories: false,
    dryRun: argv.dry_run,
  };
  const deletedPaths = [
    ...(await del([...pathsFromIgnoreList, ...excludes], delOptions)),
    ...(await del([...pathsFromArgv, ...excludes], delOptions)),
  ].sort();

  if (deletedPaths.length > 0) {
    log(argv.dry_run ? "Paths that would've been deleted:" : 'Deleted paths:');
    deletedPaths.forEach((deletedPath) => {
      log('\t' + cyan(path.relative(ROOT_DIR, deletedPath)));
    });
  }
}

module.exports = {
  clean,
};

clean.description = 'Clean up various cache and output directories';
clean.flags = {
  'dry_run': 'Do a dry run without actually deleting anything',
  'include_subpackages': 'Also clean up inner node_modules package directories',
  'include_custom_configs':
    'Also clean up custom config files from build-system/global-configs',
  'exclude': 'Comma-separated list of directories to exclude from deletion',
};
