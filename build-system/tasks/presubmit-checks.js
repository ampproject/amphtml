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

var gulp = require('gulp');
var path = require('path');
var srcGlobs = require('../config').srcGlobs;
var util = require('gulp-util');

// Directories to check for presubmit checks.
var srcGlobs = srcGlobs.concat([
  '!build-system/tasks/presubmit-checks.js',
  '!build/polyfills.js',
  '!gulpfile.js',
]);

var dedicatedCopyrightNoteSources = /(\.js|\.css)$/;

var es6polyfill = 'Not available because we do not currently' +
    ' ship with a needed ES6 polyfill.';

// Terms that must not appear in our source files.
var forbiddenTerms = {
  'DO NOT SUBMIT': '',
  'describe\\.only': '',
  'it\\.only': '',
  'console\\.\\w+\\(': 'If you run against this, use console/*OK*/.log to ' +
      'whitelist a legit case.',
  'cookie\\W': '',
  'eval\\(': '',
  'localStorage': '',
  'sessionStorage': '',
  'indexedDB': '',
  'openDatabase': '',
  'requestFileSystem': '',
  'webkitRequestFileSystem': '',
  'debugger': '',

  // ES6. These are only the most commonly used.
  'Array\\.from': es6polyfill,
  'Array\\.of': es6polyfill,
  // These currently depend on core-js/modules/web.dom.iterable which
  // we don't want. That decision could be reconsidered.
  'Promise\\.all': es6polyfill,
  'Promise\\.race': es6polyfill,
  '\\.startsWith': es6polyfill,
  '\\.endsWith': es6polyfill,
};

var bannedTermsHelpString = 'Please review viewport.js for a helper method ' +
    'or mark with `/*OK*/` or `/*REVIEW*/` and consult the AMP team. ' +
    'Most of the forbidden property/method access banned on the ' +
    '`forbiddenTermsSrcInclusive` object can be found in ' +
    '[What forces layout / reflow gist by Paul Irish]' +
    '(https://gist.github.com/paulirish/5d52fb081b3570c81e3a). ' +
    'These properties/methods when read/used require the browser ' +
    'to have the up-to-date value to return which might possibly be an ' +
    'expensive computation and could also be triggered multiple times ' +
    'if we are not careful. Please mark the call with ' +
    '`object./*OK*/property` if you explicitly need to read or update the ' +
    'forbidden property/method or mark it with `object./*REVIEW*/property` ' +
    'if you are unsure and so that it stands out in code reviews.';

var forbiddenTermsSrcInclusive = {
  '\\.innerHTML(?!_)': bannedTermsHelpString,
  '\\.outerHTML(?!_)': bannedTermsHelpString,
  '\\.postMessage(?!_)': bannedTermsHelpString,
  '\\.offsetLeft(?!_)': bannedTermsHelpString,
  '\\.offsetTop(?!_)': bannedTermsHelpString,
  '\\.offsetWidth(?!_)': bannedTermsHelpString,
  '\\.offsetHeight(?!_)': bannedTermsHelpString,
  '\\.offsetParent(?!_)': bannedTermsHelpString,
  '\\.clientLeft(?!_)(?!_)': bannedTermsHelpString,
  '\\.clientTop(?!_)': bannedTermsHelpString,
  '\\.clientWidth(?!_)': bannedTermsHelpString,
  '\\.clientHeight(?!_)': bannedTermsHelpString,
  '\\.getClientRects(?!_)': bannedTermsHelpString,
  '\\.getBoundingClientRect(?!_)': bannedTermsHelpString,
  '\\.scrollBy(?!_)': bannedTermsHelpString,
  '\\.scrollTo(?!_|p|p_)': bannedTermsHelpString,
  '\\.scrollIntoView(?!_)': bannedTermsHelpString,
  '\\.scrollIntoViewIfNeeded(?!_)': bannedTermsHelpString,
  '\\.scrollWidth(?!_)': 'please use `getScrollWidth()` from viewport',
  '\\.scrollHeight(?!_)': bannedTermsHelpString,
  '\\.scrollTop(?!_)': bannedTermsHelpString,
  '\\.scrollLeft(?!_)': bannedTermsHelpString,
  '\\.focus(?!_)': bannedTermsHelpString,
  '\\.computedRole(?!_)': bannedTermsHelpString,
  '\\.computedName(?!_)': bannedTermsHelpString,
  '\\.innerText(?!_)': bannedTermsHelpString,
  '\\.getComputedStyle(?!_)': bannedTermsHelpString,
  '\\.scrollX(?!_)': bannedTermsHelpString,
  '\\.scrollY(?!_)': bannedTermsHelpString,
  '\\.pageXOffset(?!_)': bannedTermsHelpString,
  '\\.pageYOffset(?!_)': bannedTermsHelpString,
  '\\.innerWidth(?!_)': bannedTermsHelpString,
  '\\.innerHeight(?!_)': bannedTermsHelpString,
  '\\.getMatchedCSSRules(?!_)': bannedTermsHelpString,
  '\\.scrollingElement(?!_)': bannedTermsHelpString,
  '\\.computeCTM(?!_)': bannedTermsHelpString,
  '\\.getBBox(?!_)': bannedTermsHelpString,
  '\\.webkitConvertPointFromNodeToPage(?!_)': bannedTermsHelpString,
  '\\.webkitConvertPointFromPageToNode(?!_)': bannedTermsHelpString,
};

// Terms that must appear in a source file.
var requiredTerms = {
  'Copyright 2015 The AMP HTML Authors\\.':
      dedicatedCopyrightNoteSources,
  'Licensed under the Apache License, Version 2\\.0':
      dedicatedCopyrightNoteSources,
  'http\\://www\\.apache\\.org/licenses/LICENSE-2\\.0':
      dedicatedCopyrightNoteSources,
};

/**
 * Logs any issues found in the contents of file based on terms (regex patterns),
 * and provides any possible fix information for matched terms if possible
 *
 * @param {!File} file file is a vinyl file object to match terms on content with
 * @param {!Array<string, string>} terms Pairs of regex patterns and possible fix messages.
 * @return boolean true if any of the terms match the file content, false otherwise
 */
function matchTerms(file, terms) {
  var pathname = file.path;
  var contents = file.contents.toString();
  return Object.keys(terms).map(function(term) {
    var fix;
    // we can't optimize building the `RegExp` objects early unless we build
    // another mapping of term -> regexp object to be able to get back to the
    // original term to get the possible fix value. This is ok as the
    // presubmit doesn't have to be blazing fast and this is most likely
    // negligible.
    var matches = contents.match(new RegExp(term));

    if (matches) {
      util.log(util.colors.red('Found forbidden: "' + matches[0] +
          '" in ' + pathname));
      fix = terms[term];

	  // log the possible fix information if provided for the term.
      if (fix) {
        util.log(util.colors.blue(fix));
      }
      util.log(util.colors.blue('=========='));
      return true;
    }
    return false;
  }).some(function(hasAnyTerm) {
    return hasAnyTerm;
  });
}


/**
 * Test if a file's contents match any of the
 * forbidden terms
 *
 * @param {!File} file file is a vinyl file object
 * @return boolean true if any of the terms match the file content, false otherwise
 */
function hasAnyTerms(file) {
  var pathname = file.path;
  var basename = path.basename(pathname);
  var hasTerms = false;
  var hasSrcInclusiveTerms = false;

  hasTerms = matchTerms(file, forbiddenTerms);

  var isTestFile = /^test-/.test(basename) || /^_init_tests/.test(basename);
  if (!isTestFile) {
    hasSrcInclusiveTerms = matchTerms(file, forbiddenTermsSrcInclusive);
  }

  return hasTerms || hasSrcInclusiveTerms;
}

/**
 * Test if a file's contents fail to match any of the required terms and log any missing terms
 *
 * @param {!File} file file is a vinyl file object
 * @return boolean true if any of the terms are not matched in the file content, false otherwise
 */
function isMissingTerms(file) {
  var contents = file.contents.toString();
  return Object.keys(requiredTerms).map(function(term) {
    var filter = requiredTerms[term];
    if (!filter.test(file.path)) {
      return false;
    }

    var matches = contents.match(new RegExp(term));
    if (!matches) {
      util.log(util.colors.red('Did not find required: "' + term +
          '" in ' + file.path));
      util.log(util.colors.blue('=========='));
      return true;
    }
    return false;
  }).some(function(hasMissingTerm) {
    return hasMissingTerm;
  });
}

/**
 * Check a file for all the required terms and
 * any forbidden terms and log any errors found.
 */
function checkForbiddenAndRequiredTerms() {
  var forbiddenFound = false;
  var missingRequirements = false;
  return gulp.src(srcGlobs)
    .pipe(util.buffer(function(err, files) {
      forbiddenFound = files.map(hasAnyTerms).some(function(errorFound) {
        return errorFound;
      });
      missingRequirements = files.map(isMissingTerms).some(function(errorFound) {
        return errorFound;
      });
    }))
    .on('end', function() {
      if (forbiddenFound) {
        util.log(util.colors.blue(
            'Please remove these usages or consult with the AMP team.'));
      }
      if (missingRequirements) {
        util.log(util.colors.blue(
            'Adding these terms (e.g. by adding a required LICENSE ' +
            'to the file)'));
      }
      if (forbiddenFound || missingRequirements) {
        process.exit(1);
      }
    });
}

gulp.task('presubmit', checkForbiddenAndRequiredTerms);
