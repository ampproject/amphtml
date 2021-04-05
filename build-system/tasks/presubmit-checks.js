/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

const fs = require('fs');
const globby = require('globby');
const srcGlobs = require('../test-configs/config').presubmitGlobs;
const {
  matchForbiddenTerms,
  forbiddenTermsGlobal,
} = require('../test-configs/forbidden-terms');
const {cyan, red, yellow} = require('kleur/colors');
const {log} = require('../common/logging');

/**
 * If you're looking for the forbidden terms list, it's moved to:
 * build-system/test-configs/forbidden-terms.js
 */

const dedicatedCopyrightNoteSources = /(\.css|\.go)$/;

// Terms that must appear in a source file.
const requiredTerms = {
  'Copyright 20(15|16|17|18|19|2\\d) The AMP HTML Authors\\.': dedicatedCopyrightNoteSources,
  'Licensed under the Apache License, Version 2\\.0': dedicatedCopyrightNoteSources,
  'http\\://www\\.apache\\.org/licenses/LICENSE-2\\.0': dedicatedCopyrightNoteSources,
};
// Exclude extension generator templates
const requiredTermsExcluded = /amp-__component_name_hyphenated__/;

/**
 * Test if a file's contents match any of the forbidden terms
 * @param {string} srcFile
 * @return {boolean} true if any of the terms match the file content,
 *   false otherwise
 */
function hasForbiddenTerms(srcFile) {
  const contents = fs.readFileSync(srcFile, 'utf-8');
  const terms = matchForbiddenTerms(srcFile, contents, forbiddenTermsGlobal);
  for (const {match, loc, message} of terms) {
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
 * Test if a file's contents fail to match any of the required terms and log
 * any missing terms
 *
 * @param {string} srcFile
 * @return {boolean} true if any of the terms are not matched in the file
 *  content, false otherwise
 */
function isMissingTerms(srcFile) {
  const contents = fs.readFileSync(srcFile, 'utf-8');
  return Object.keys(requiredTerms)
    .map(function (term) {
      const filter = requiredTerms[term];
      if (!filter.test(srcFile) || requiredTermsExcluded.test(srcFile)) {
        return false;
      }

      const matches = contents.match(new RegExp(term));
      if (!matches) {
        log(
          red('ERROR:'),
          'Did not find required',
          cyan(`"${term}"`),
          'in',
          cyan(srcFile)
        );
        return true;
      }
      return false;
    })
    .some(function (hasMissingTerm) {
      return hasMissingTerm;
    });
}

/**
 * Entry point for amp presubmit.
 */
async function presubmit() {
  let forbiddenFound = false;
  let missingRequirements = false;
  const srcFiles = globby.sync(srcGlobs);
  for (const srcFile of srcFiles) {
    forbiddenFound = hasForbiddenTerms(srcFile) || forbiddenFound;
    missingRequirements = isMissingTerms(srcFile) || missingRequirements;
  }
  if (forbiddenFound) {
    log(
      yellow('NOTE:'),
      'Please remove these usages or consult with the AMP team.'
    );
  }
  if (missingRequirements) {
    log(
      yellow('NOTE:'),
      'Please add these terms (e.g. a required LICENSE) to the files.'
    );
  }
  if (forbiddenFound || missingRequirements) {
    process.exitCode = 1;
  }
}

module.exports = {
  presubmit,
};

presubmit.description = 'Check source files for forbidden and required terms';
