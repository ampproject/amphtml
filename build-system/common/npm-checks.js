'use strict';

/**
 * @fileoverview
 * This script makes sure that package.json and package-lock.json are in sync
 * and up to date.
 */

const fs = require('fs-extra');
const path = require('path');
const {cyan, red} = require('kleur/colors');
const {exec} = require('./exec');
const {gitDiffColor, gitDiffNameOnly} = require('./git');
const {log, logWithoutTimestamp} = require('./logging');

/**
 * Ensures that the package files in the given directory were generated with a
 * compatible version of npm and do not have any missing changes. Defaults to
 * the repo root when a directory isn't specified.
 *
 * @param {string=} dir
 */
function runNpmChecks(dir = '.') {
  const relativeDir = path.relative(process.cwd(), dir);
  const targetDir = dir == '.' ? 'the repo root' : cyan(relativeDir);
  log('Running', cyan('npm'), 'checks under', targetDir + '...');
  const packageLockFile = path.join(relativeDir, 'package-lock.json');

  // Check the lockfile version.
  if (fs.readJsonSync(packageLockFile).lockfileVersion != 2) {
    log(
      red('ERROR:'),
      cyan(packageLockFile),
      'was generated with an incorrect version of',
      cyan('npm') + '.'
    );
    log(
      '⤷ To fix this, make sure you are using the version of',
      cyan('npm'),
      'that came pre-installed with the latest LTS version of',
      cyan('node') + '.'
    );
    throw new Error('Incorrect lockfile version');
  }

  // Run `npm i` and check for changes. (`npm ci` doesn't update lockfiles.)
  const installCmd = 'npm install' + (dir == '.' ? '' : ` --prefix ${dir}`);
  exec(installCmd, {'stdio': 'ignore'});
  const filesChanged = gitDiffNameOnly();
  if (filesChanged.includes(packageLockFile)) {
    log(
      red('ERROR:'),
      'This PR did not properly update',
      cyan(packageLockFile) + '.'
    );
    log(
      '⤷ To fix this, sync your branch to',
      cyan('ampproject/amphtml/main') + ', run',
      cyan('npm install'),
      'under',
      targetDir + ', and push a new commit containing the changes.'
    );
    log('Expected changes:');
    logWithoutTimestamp(gitDiffColor());
    throw new Error('Lockfile not updated');
  }

  log('All', cyan('npm'), 'checks passed.', dir == '.' ? '\n' : '');
}

module.exports = {
  runNpmChecks,
};
