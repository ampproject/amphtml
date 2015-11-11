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

var gulp = require('gulp-help')(require('gulp'));
var path = require('path');
var srcGlobs = require('../config').presubmitGlobs;
var util = require('gulp-util');

var dedicatedCopyrightNoteSources = /(\.js|\.css)$/;

var es6polyfill = 'Not available because we do not currently' +
    ' ship with a needed ES6 polyfill.';

var requiresReviewPrivacy =
    'Usage of this API requires dedicated review due to ' +
    'being privacy sensitive. Please file an issue asking for permission' +
    ' to use if you have not yet done so.';

// Terms that must not appear in our source files.
var forbiddenTerms = {
  'DO NOT SUBMIT': '',
  'describe\\.only': '',
  'it\\.only': '',
  'console\\.\\w+\\(': 'If you run against this, use console/*OK*/.log to ' +
      'whitelist a legit case.',
  'cookie\\W': {
    message: requiresReviewPrivacy,
    whitelist: [
      'src/cookies.js',
      'test/functional/test-cookies.js',
      'test/functional/test-experiments.js',
    ]
  },
  'getCookie\\W': {
    message: requiresReviewPrivacy,
    whitelist: [
      'src/cookies.js',
      'src/experiments.js',
      'test/functional/test-cookies.js',
    ]
  },
  'eval\\(': '',
  'localStorage': requiresReviewPrivacy,
  'sessionStorage': requiresReviewPrivacy,
  'indexedDB': requiresReviewPrivacy,
  'openDatabase': requiresReviewPrivacy,
  'requestFileSystem': requiresReviewPrivacy,
  'webkitRequestFileSystem': requiresReviewPrivacy,
  'debugger': '',

  // ES6. These are only the most commonly used.
  'Array\\.of': es6polyfill,
  // These currently depend on core-js/modules/web.dom.iterable which
  // we don't want. That decision could be reconsidered.
  'Promise\\.all': es6polyfill,
  'Promise\\.race': es6polyfill,
  '\\.startsWith': es6polyfill,
  '\\.endsWith': es6polyfill,
  // TODO: (erwinm) rewrite the destructure and spread warnings as
  // eslint rules (takes more time than this quick regex fix).
  // No destructuring allowed since we dont ship with Array polyfills.
  '^\\s*(?:let|const|var) *(?:\\[[^\\]]+\\]|{[^}]+}) *=': es6polyfill,
  // No spread (eg. test(...args) allowed since we dont ship with Array
  // polyfills except `arguments` spread as babel does not polyfill
  // it since it can assume that it can `slice` w/o the use of helpers.
  '\\.\\.\\.(?!arguments\\))[_$A-Za-z0-9]*(?:\\)|])': es6polyfill
};

var ThreePTermsMessage = 'The 3p bootstrap iframe has no polyfills loaded and' +
    ' can thus not use most modern web APIs.';

var forbidden3pTerms = {
  // We need to forbid promise usage because we don't have our own polyfill
  // available. This whitelisting of callNext is a major hack to allow one
  // usage in babel's external helpers that is in a code path that we do
  // not use.
  '\\.then\\((?!callNext)': ThreePTermsMessage,
  'Math\\.sign' : ThreePTermsMessage,
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
 * Logs any issues found in the contents of file based on terms (regex
 * patterns), and provides any possible fix information for matched terms if
 * possible
 *
 * @param {!File} file a vinyl file object to scan for term matches
 * @param {!Array<string, string>} terms Pairs of regex patterns and possible
 *   fix messages.
 * @return {boolean} true if any of the terms match the file content,
 *   false otherwise
 */
function matchTerms(file, terms) {
  var pathname = file.path;
  var contents = file.contents.toString();
  var relative = file.relative;
  return Object.keys(terms).map(function(term) {
    var fix;
    var whitelist = terms[term].whitelist;
    // NOTE: we could do a glob test instead of exact check in the future
    // if needed but that might be too permissive.
    if (Array.isArray(whitelist) && whitelist.indexOf(relative) != -1) {
      return false;
    }
    // we can't optimize building the `RegExp` objects early unless we build
    // another mapping of term -> regexp object to be able to get back to the
    // original term to get the possible fix value. This is ok as the
    // presubmit doesn't have to be blazing fast and this is most likely
    // negligible.
    var matches = contents.match(new RegExp(term, 'gm'));

    if (matches) {
      util.log(util.colors.red('Found forbidden: "' + matches[0] +
          '" in ' + relative));
      if (typeof terms[term] == 'string') {
        fix = terms[term];
      } else {
        fix = terms[term].message;
      }

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
 * @return {boolean} true if any of the terms match the file content,
 *   false otherwise
 */
function hasAnyTerms(file) {
  var pathname = file.path;
  var basename = path.basename(pathname);
  var hasTerms = false;
  var hasSrcInclusiveTerms = false;
  var has3pTerms = false;

  hasTerms = matchTerms(file, forbiddenTerms);

  var isTestFile = /^test-/.test(basename) || /^_init_tests/.test(basename);
  if (!isTestFile) {
    hasSrcInclusiveTerms = matchTerms(file, forbiddenTermsSrcInclusive);
  }

  var is3pFile = /3p|ads/.test(pathname) ||
      basename == '3p.js' ||
      basename == 'style.js';
  if (is3pFile && !isTestFile) {
    has3pTerms = matchTerms(file, forbidden3pTerms);
  }

  return hasTerms || hasSrcInclusiveTerms || has3pTerms;
}

/**
 * Test if a file's contents fail to match any of the required terms and log
 * any missing terms
 *
 * @param {!File} file file is a vinyl file object
 * @return {boolean} true if any of the terms are not matched in the file
 *  content, false otherwise
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
          '" in ' + file.relative));
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
      missingRequirements = files.map(isMissingTerms).some(
          function(errorFound) {
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

gulp.task('presubmit', 'Run validation against files to check for forbidden ' +
  'and required terms', checkForbiddenAndRequiredTerms);
