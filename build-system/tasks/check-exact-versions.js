'use strict';

const fastGlob = require('fast-glob');
const fs = require('fs-extra');
const semver = require('semver');
const {cyan, green, red} = require('kleur/colors');
const {gitDiffFileMain} = require('../common/git');
const {log, logLocalDev, logWithoutTimestamp} = require('../common/logging');

/**
 * @param {string} file
 * @return {boolean}
 */
function check(file) {
  const json = fs.readJsonSync(file, 'utf8');

  // We purposfully ignore peerDependencies here, because that's that's for the
  // consumer to decide.
  const keys = ['dependencies', 'devDependencies', 'optionalDependencies'];

  for (const key of keys) {
    const deps = json[key];
    for (const dep in deps) {
      const version = deps[dep];
      if (!semver.clean(version)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Makes sure all package.json files in the repo use exact versions.
 * @return {!Promise}
 */
async function checkExactVersions() {
  const packageJsonFiles = await fastGlob([
    '**/package.json',
    '!**/node_modules/**',
  ]);
  packageJsonFiles.forEach((file) => {
    if (check(file)) {
      logLocalDev(
        green('SUCCESS:'),
        'All packages in',
        cyan(file),
        'have exact versions.'
      );
    } else {
      log(
        red('ERROR:'),
        'One or more packages in',
        cyan(file),
        'do not have an exact version.'
      );
      logWithoutTimestamp(gitDiffFileMain(file));
      throw new Error('Check failed');
    }
  });
}

module.exports = {
  checkExactVersions,
};

checkExactVersions.description =
  'Check all package.json files in the repo to make sure they use exact versions';
