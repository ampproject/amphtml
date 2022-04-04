'use strict';

const fastGlob = require('fast-glob');
const fs = require('fs');
const srcGlobs = require('../test-configs/config').presubmitGlobs;
const {
  forbiddenTermsGlobal,
  matchForbiddenTerms,
} = require('../test-configs/forbidden-terms');
const {cyan, red, yellow} = require('kleur/colors');
const {log} = require('../common/logging');

/**
 * If you're looking for the forbidden terms list, it's moved to:
 * build-system/test-configs/forbidden-terms.js
 */

/**
 * Test if a file's contents match any of the forbidden terms
 * @param {string} srcFile
 * @return {boolean} true if any of the terms match the file content,
 *   false otherwise
 */
function hasForbiddenTerms(srcFile) {
  const contents = fs.readFileSync(srcFile, 'utf-8');
  const terms = matchForbiddenTerms(srcFile, contents, forbiddenTermsGlobal);
  for (const {loc, match, message} of terms) {
    log(
      red('ERROR:'),
      'Found forbidden',
      cyan(`"${match}"`),
      'in',
      cyan(`${srcFile}:${loc.start.line}:${loc.start.column}`)
    );

    // log the possible fix information if provided for the term.
    if (message) {
      log('⤷', yellow('To fix:'), message);
    }
  }
  return terms.length > 0;
}

/**
 * Entry point for amp presubmit.
 * @return {Promise<void>}
 */
async function presubmit() {
  let forbiddenFound = false;
  const srcFiles = await fastGlob(srcGlobs);
  for (const srcFile of srcFiles) {
    forbiddenFound = hasForbiddenTerms(srcFile) || forbiddenFound;
  }
  if (forbiddenFound) {
    log(
      yellow('NOTE:'),
      'Please remove these terms or consult with the AMP team.'
    );
    throw new Error('Found forbidden terms');
  }
}

module.exports = {
  presubmit,
};

presubmit.description = 'Check source files for forbidden terms';
