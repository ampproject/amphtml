'use strict';

const argv = require('minimist')(process.argv.slice(2));
const del = require('del');
const fs = require('fs-extra');
const path = require('path');
const {cyan, yellow} = require('kleur/colors');
const {log} = require('../common/logging');

const ROOT_DIR = path.resolve(__dirname, '../../');

/**
 * Cleans up various cache and output directories. Optionally cleans up inner
 * node_modules package directories, or excludes some directories from deletion.
 * @return {Promise<void>}
 */
async function clean() {
  const pathsToDelete = [
    // Local cache directories
    // Keep this list in sync with .gitignore, .eslintignore, and .prettierignore
    '.babel-cache',
    '.css-cache',
    '.jss-cache',
    '.pre-closure-cache',

    // Output directories
    // Keep this list in sync with .gitignore, .eslintignore, and .prettierignore
    '.amp-dep-check',
    'build',
    'build-system/dist',
    'build-system/server/new-server/transforms/dist',
    'build-system/tasks/performance/cache',
    'build-system/tasks/performance/results.json',
    'dist',
    'dist.3p',
    'dist.tools',
    'export',
    'examples/storybook',
    'extensions/**/dist',
    'release',
    'result-reports',
    'test/coverage',
    'test/coverage-e2e',
    'validator/**/dist',
    'validator/export',
  ];
  if (argv.include_subpackages) {
    pathsToDelete.push('**/node_modules', '!node_modules');
  }
  // User configuration files
  // Keep this list in sync with .gitignore, .eslintignore, and .prettierignore
  const customConfigs = [
    'build-system/global-configs/custom-config.json',
    'build-system/global-configs/custom-flavors-config.json',
  ];
  if (argv.include_custom_configs) {
    pathsToDelete.push(...customConfigs);
  } else {
    for (const customConfig of customConfigs) {
      if (fs.existsSync(customConfig)) {
        log(yellow('Skipping path:'), cyan(customConfig));
      }
    }
  }
  if (argv.exclude) {
    const excludes = argv.exclude.split(',');
    for (const exclude of excludes) {
      pathsToDelete.push(`!${exclude}`);
    }
  }
  const deletedPaths = await del(pathsToDelete, {
    expandDirectories: false,
    dryRun: argv.dry_run,
  });
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
