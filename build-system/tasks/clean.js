'use strict';

const argv = require('minimist')(process.argv.slice(2));
const del = require('del');
const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');
const {cyan, yellow} = require('kleur/colors');
const {ignoreFile, splitIgnoreListByHeader} = require('./check-ignore-list');
const {log} = require('../common/logging');

const ROOT_DIR = path.resolve(__dirname, '../../');

/**
 * @return {Promise<string[]>}
 */
async function getPathsToDelete() {
  const [, below] = splitIgnoreListByHeader(
    await fs.readFile(ignoreFile, 'utf8')
  );
  return (
    below
      .split('\n')
      // Comments and empty lines
      .filter((line) => line.trim().length > 0 && !line.startsWith('#'))
      // Recursive globs
      .map((line) => (line.startsWith('/') ? line.substr(1) : `**/${line}`))
  );
}

/**
 * Cleans up various cache and output directories. Optionally cleans up inner
 * node_modules package directories, or excludes some directories from deletion.
 * @return {Promise<void>}
 */
async function clean() {
  const pathsToDeleteFromIgnore = [
    ...(await getPathsToDelete()),
    '!**/third_party',
    '!**/node_modules',
  ];
  const pathsToDelete = [];
  if (argv.include_subpackages) {
    pathsToDelete.push('**/node_modules', '!node_modules');
  }

  // Ignore user configuration files if flag is not set.
  const ignoredCustomConfigPaths = pathsToDeleteFromIgnore.filter((path, i) => {
    if (/build-system\/global-configs\/custom.*\.json/.test(path)) {
      if (!argv.include_custom_configs) {
        pathsToDeleteFromIgnore[i] = '';
        return true;
      }
    }
    return false;
  });

  if (ignoredCustomConfigPaths.length) {
    const ignored = await globby(ignoredCustomConfigPaths);
    for (const customConfig of ignored) {
      log(yellow('Skipping path:'), cyan(customConfig));
    }
  }

  if (argv.exclude) {
    const excludes = argv.exclude.split(',');
    for (const exclude of excludes) {
      pathsToDelete.push(`!${exclude}`);
    }
  }

  const delOptions = {
    expandDirectories: false,
    dryRun: argv.dry_run,
  };
  const deletedPaths = [
    ...(await del(pathsToDeleteFromIgnore.filter(Boolean), delOptions)),
    ...(await del(pathsToDelete, delOptions)),
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
