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

var dedicatedCopyrightNoteSources = /(\.js|\.css|\.go)$/;

var es6polyfill = 'Not available because we do not currently' +
    ' ship with a needed ES6 polyfill.';

var requiresReviewPrivacy =
    'Usage of this API requires dedicated review due to ' +
    'being privacy sensitive. Please file an issue asking for permission' +
    ' to use if you have not yet done so.';

var privateServiceFactory = 'This service should only be installed in ' +
    'the whitelisted files. Other modules should use a public function ' +
    'typically called serviceNameFor.';

var shouldNeverBeUsed =
    'Usage of this API is not allowed - only for internal purposes.';

// Terms that must not appear in our source files.
var forbiddenTerms = {
  'DO NOT SUBMIT': '',
  'describe\\.only': '',
  'it\\.only': '',
  'sinon\\.(spy|stub|mock)\\(': {
    message: 'Use a sandbox instead to avoid repeated `#restore` calls'
  },
  '(\\w*([sS]py|[sS]tub|[mM]ock|clock).restore)': {
    message: 'Use a sandbox instead to avoid repeated `#restore` calls'
  },
  'sinon\\.useFake\\w+': {
    message: 'Use a sandbox instead to avoid repeated `#restore` calls'
  },
  'console\\.\\w+\\(': {
    message: 'If you run against this, use console/*OK*/.log to ' +
      'whitelist a legit case.',
    // TODO: temporary, remove when validator is up to date
    whitelist: [
      'build-system/server.js',
      'validator/index.js',  // NodeJs only.
      'validator/parse-css.js',
      'validator/validator-full.js',
      'validator/validator-in-browser.js',
      'validator/validator.js',
    ]
  },
  // Match `getMode` that is not followed by a "()." and is assigned
  // as a variable.
  '(?:var|let|const).*?getMode(?!\\(\\)\\.)': {
    message: 'Do not re-alias getMode or its return so it can be DCE\'d.' +
        ' Use explicitly like "getMode().localDev" instead.',
    whitelist: [
      'dist.3p/current/integration.js'
    ]
  },
  'iframePing': {
    message: 'This is only available in vendor config for ' +
        'temporary workarounds.',
    whitelist: [
      'extensions/amp-analytics/0.1/amp-analytics.js',
    ],
  },
  // Service factories that should only be installed once.
  'installActionServiceForDoc': {
    message: privateServiceFactory,
    whitelist: [
      'src/service/action-impl.js',
      'src/service/standard-actions-impl.js',
      'src/runtime.js',
    ],
  },
  'installActionHandler': {
    message: privateServiceFactory,
    whitelist: [
      'src/service/action-impl.js',
      'extensions/amp-access/0.1/amp-access.js',
    ],
  },
  'installActivityService': {
    message: privateServiceFactory,
    whitelist: [
      'extensions/amp-analytics/0.1/activity-impl.js',
      'extensions/amp-analytics/0.1/amp-analytics.js'
    ]
  },
  'installCidService': {
    message: privateServiceFactory,
    whitelist: [
      'extensions/amp-analytics/0.1/cid-impl.js',
      'extensions/amp-access/0.1/amp-access.js',
      'extensions/amp-analytics/0.1/amp-analytics.js',
    ],
  },
  'installCryptoService': {
    message: privateServiceFactory,
    whitelist: [
      'extensions/amp-analytics/0.1/amp-analytics.js',
      'extensions/amp-analytics/0.1/crypto-impl.js',
    ],
  },
  'installDocService': {
    message: privateServiceFactory,
    whitelist: [
      'src/amp.js',
      'src/amp-shadow.js',
      'src/service/ampdoc-impl.js',
    ],
  },
  'installPerformanceService': {
    message: privateServiceFactory,
    whitelist: [
      'src/amp.js',
      'src/service/performance-impl.js',
    ],
  },
  'installStorageService': {
    message: privateServiceFactory,
    whitelist: [
      'extensions/amp-analytics/0.1/amp-analytics.js',
      'extensions/amp-analytics/0.1/storage-impl.js',
    ],
  },
  'installTemplatesService': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/template-impl.js',
    ],
  },
  'installUrlReplacementsService': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/url-replacements-impl.js',
    ],
  },
  'installViewerService': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/history-impl.js',
      'src/service/resources-impl.js',
      'src/service/viewer-impl.js',
      'src/service/viewport-impl.js',
      'src/service/vsync-impl.js',
    ],
  },
  'installViewportService': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/resources-impl.js',
      'src/service/viewport-impl.js',
    ],
  },
  'installVsyncService': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/resources-impl.js',
      'src/service/viewport-impl.js',
      'src/service/vsync-impl.js',
    ],
  },
  'installResourcesService': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/resources-impl.js',
      'src/service/standard-actions-impl.js',
    ],
  },
  'installXhrService': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/xhr-impl.js',
    ],
  },
  'sendMessage': {
    message: privateServiceFactory,
    whitelist: [
      'src/service/viewer-impl.js',
      'extensions/amp-analytics/0.1/storage-impl.js',
      'examples/viewer-integr-messaging.js',
      'extensions/amp-access/0.1/login-dialog.js',
    ],
  },
  // Privacy sensitive
  'cidFor': {
    message: requiresReviewPrivacy,
    whitelist: [
      'src/ad-cid.js',
      'src/cid.js',
      'src/service/cid-impl.js',
      'src/service/url-replacements-impl.js',
      'extensions/amp-access/0.1/amp-access.js',
      'extensions/amp-experiment/0.1/variant.js',
      'extensions/amp-user-notification/0.1/amp-user-notification.js',
    ],
  },
  'getBaseCid': {
    message: requiresReviewPrivacy,
    whitelist: [
      'extensions/amp-analytics/0.1/cid-impl.js',
      'src/service/viewer-impl.js',
    ],
  },
  'cookie\\W': {
    message: requiresReviewPrivacy,
    whitelist: [
      'src/cookies.js',
      'extensions/amp-analytics/0.1/cid-impl.js',
    ],
  },
  'getCookie\\W': {
    message: requiresReviewPrivacy,
    whitelist: [
      'extensions/amp-analytics/0.1/cid-impl.js',
      'src/cookies.js',
      'src/experiments.js',
      'tools/experiments/experiments.js',
    ]
  },
  'setCookie\\W': {
    message: requiresReviewPrivacy,
    whitelist: [
      'extensions/amp-analytics/0.1/cid-impl.js',
      'src/cookies.js',
      'src/experiments.js',
      'tools/experiments/experiments.js',
    ]
  },
  'isDevChannel\\W': {
    message: requiresReviewPrivacy,
    whitelist: [
      'extensions/amp-access/0.1/amp-access.js',
      'extensions/amp-user-notification/0.1/amp-user-notification.js',
      'src/3p-frame.js',
      'src/experiments.js',
      'src/service/storage-impl.js',
      'src/service/viewport-impl.js',
      'tools/experiments/experiments.js',
    ]
  },
  'isDevChannelVersionDoNotUse_\\W': {
    message: shouldNeverBeUsed,
    whitelist: [
      'src/experiments.js',
    ]
  },
  'isTrustedViewer': {
    message: requiresReviewPrivacy,
    whitelist: [
      'src/service/viewer-impl.js',
    ]
  },
  'eval\\(': '',
  'storageFor': {
    message: requiresReviewPrivacy,
    whitelist: [
      'src/storage.js',
      'extensions/amp-user-notification/0.1/amp-user-notification.js',
    ],
  },
  'localStorage': {
    message: requiresReviewPrivacy,
    whitelist: [
      'extensions/amp-analytics/0.1/cid-impl.js',
      'extensions/amp-analytics/0.1/storage-impl.js',
    ],
  },
  'sessionStorage': {
    message: requiresReviewPrivacy,
    whitelist: [
      'extensions/amp-accordion/0.1/amp-accordion.js',
    ],
  },
  'indexedDB': requiresReviewPrivacy,
  'openDatabase': requiresReviewPrivacy,
  'requestFileSystem': requiresReviewPrivacy,
  'webkitRequestFileSystem': requiresReviewPrivacy,
  'getAccessReaderId': {
    message: requiresReviewPrivacy,
    whitelist: [
      'extensions/amp-access/0.1/amp-access.js',
      'src/service/url-replacements-impl.js',
    ]
  },
  'getAuthdataField': {
    message: requiresReviewPrivacy,
    whitelist: [
      'extensions/amp-access/0.1/amp-access.js',
      'src/service/url-replacements-impl.js',
    ]
  },
  'debugger': '',

  // ES6. These are only the most commonly used.
  'Array\\.of': es6polyfill,
  // These currently depend on core-js/modules/web.dom.iterable which
  // we don't want. That decision could be reconsidered.
  '\\.startsWith': {
    message: es6polyfill,
    whitelist: [
      'validator/index.js',  // NodeJs only.
      'validator/tokenize-css.js',
      'validator/validator-full.js',
      'validator/validator.js',
      // exports.startsWith occurs in babel generated code.
      'dist.3p/current/integration.js',
    ]
  },
  '\\.endsWith': {
    message: es6polyfill,
    whitelist: [
      'build-system/tasks/csvify-size/index.js',
      // .endsWith occurs in babel generated code.
      'dist.3p/current/integration.js',
    ],
  },
  // TODO: (erwinm) rewrite the destructure and spread warnings as
  // eslint rules (takes more time than this quick regex fix).
  // No destructuring allowed since we dont ship with Array polyfills.
  '^\\s*(?:let|const|var) *(?:\\[[^\\]]+\\]|{[^}]+}) *=': es6polyfill,
  // No spread (eg. test(...args) allowed since we dont ship with Array
  // polyfills except `arguments` spread as babel does not polyfill
  // it since it can assume that it can `slice` w/o the use of helpers.
  '\\.\\.\\.(?!arguments\\))[_$A-Za-z0-9]*(?:\\)|])': {
    message: es6polyfill,
    whitelist: [
      'extensions/amp-access/0.1/access-expr-impl.js',
    ],
  },

  // Overridden APIs.
  '(doc.*)\\.referrer': {
    message: 'Use Viewer.getReferrerUrl() instead.',
    whitelist: [
      '3p/integration.js',
      'ads/google/a4a/utils.js',
      'dist.3p/current/integration.js',
      'src/service/viewer-impl.js',
      'src/error.js',
    ],
  },
  '(doc[^.]*)\\.contains': {
    message: 'Use dom.documentContains API.',
    whitelist: [
      'src/dom.js',
    ],
  },
  '\\sdocument(?![a-zA-Z0-9_:])': {
    message: 'Use `window.document` or similar to access document, the global' +
      '`document` is forbidden',
    whitelist: [
      'build-system/server.js',
      'examples/pwa/pwa.js',
      'examples/viewer-integr.js',
      'testing/iframe.js',
      'testing/screenshots/make-screenshot.js',
      'tools/experiments/experiments.js',
      'validator/validator-full.js',
      'validator/validator.js',
    ],
  },
  'getUnconfirmedReferrerUrl': {
    message: 'Use Viewer.getReferrerUrl() instead.',
    whitelist: [
      'extensions/amp-dynamic-css-classes/0.1/amp-dynamic-css-classes.js',
      'src/3p-frame.js',
      'src/service/viewer-impl.js',
    ],
  },
  'setTimeout.*throw': {
    message: 'Use dev.error or user.error instead.',
    whitelist: [
      'src/log.js',
    ],
  },
  '(win|Win)(dow)?(\\(\\))?\\.open\\W': {
    message: 'Use dom.openWindowDialog',
    whitelist: [
      'src/dom.js',
    ],
  },
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
  '\\.offsetLeft(?!_)': bannedTermsHelpString,
  '\\.offsetTop(?!_)': bannedTermsHelpString,
  '\\.offsetWidth(?!_)': bannedTermsHelpString,
  '\\.offsetHeight(?!_)': bannedTermsHelpString,
  '\\.offsetParent(?!_)': bannedTermsHelpString,
  '\\.clientLeft(?!_)(?!_)': bannedTermsHelpString,
  '\\.clientTop(?!_)': bannedTermsHelpString,
  '\\.clientWidth(?!_)': bannedTermsHelpString,
  '\\.clientHeight(?!_)': bannedTermsHelpString,
  '\\.scrollWidth(?!_)': 'please use `getScrollWidth()` from viewport',
  '\\.scrollHeight(?!_)': bannedTermsHelpString,
  '\\.scrollTop(?!_)': bannedTermsHelpString,
  '\\.scrollLeft(?!_)': bannedTermsHelpString,
  '\\.computedRole(?!_)': bannedTermsHelpString,
  '\\.computedName(?!_)': bannedTermsHelpString,
  '\\.innerText(?!_)': bannedTermsHelpString,
  '\\.scrollX(?!_)': bannedTermsHelpString,
  '\\.scrollY(?!_)': bannedTermsHelpString,
  '\\.pageXOffset(?!_)': bannedTermsHelpString,
  '\\.pageYOffset(?!_)': bannedTermsHelpString,
  '\\.innerWidth(?!_)': bannedTermsHelpString,
  '\\.innerHeight(?!_)': bannedTermsHelpString,
  '\\.scrollingElement(?!_)': bannedTermsHelpString,
  '\\.computeCTM(?!_)': bannedTermsHelpString,
  // Functions
  '\\.changeHeight\\(': bannedTermsHelpString,
  '\\.changeSize\\(': bannedTermsHelpString,
  '\\.collapse\\(': bannedTermsHelpString,
  '\\.focus\\(': bannedTermsHelpString,
  '\\.getBBox\\(': bannedTermsHelpString,
  '\\.getBoundingClientRect\\(': bannedTermsHelpString,
  '\\.getClientRects\\(': bannedTermsHelpString,
  '\\.getComputedStyle\\(': bannedTermsHelpString,
  '\\.getMatchedCSSRules\\(': bannedTermsHelpString,
  '\\.postMessage\\(': bannedTermsHelpString,
  '\\.scrollBy\\(': bannedTermsHelpString,
  '\\.scrollIntoView\\(': bannedTermsHelpString,
  '\\.scrollIntoViewIfNeeded\\(': bannedTermsHelpString,
  '\\.scrollTo\\(': bannedTermsHelpString,
  '\\.webkitConvertPointFromNodeToPage\\(': bannedTermsHelpString,
  '\\.webkitConvertPointFromPageToNode\\(': bannedTermsHelpString,
  'insertAmpExtensionScript': {
    message: bannedTermsHelpString,
    whitelist: [
      'src/insert-extension.js',
      'src/element-stub.js',
      'extensions/amp-ad/0.1/amp-ad.js',
      'extensions/amp-a4a/0.1/amp-a4a.js',
    ],
  },
  'reject\\(\\)': {
    message: 'Always supply a reason in rejections. ' +
        'error.cancellation() may be applicable.',
    whitelist: [
      'extensions/amp-access/0.1/access-expr-impl.js',
    ],
  }
};

// Terms that must appear in a source file.
var requiredTerms = {
  'Copyright 20(15|16) The AMP HTML Authors\\.':
      dedicatedCopyrightNoteSources,
  'Licensed under the Apache License, Version 2\\.0':
      dedicatedCopyrightNoteSources,
  'http\\://www\\.apache\\.org/licenses/LICENSE-2\\.0':
      dedicatedCopyrightNoteSources,
};


/**
 * Check if root of path is test/ or file is in a folder named test.
 * @param {string} path
 * @return {boolean}
 */
function isInTestFolder(path) {
  var dirs = path.split('/');
  var folder = dirs[dirs.length - 2];
  return path.startsWith('test/') || folder == 'test';
}

function stripComments(contents) {
  // Multi-line comments
  contents = contents.replace(/\/\*(?!.*\*\/)(.|\n)*?\*\//g, '');
  // Single line comments with only leading whitespace
  contents = contents.replace(/\n\s*\/\/.*/g, '');
  // Single line comments following a space, semi-colon, or closing brace
  return contents.replace(/( |\}|;)\s*\/\/.*/g, '$1');
}

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
  var contents = stripComments(file.contents.toString());
  var relative = file.relative;
  return Object.keys(terms).map(function(term) {
    var fix;
    var whitelist = terms[term].whitelist;
    // NOTE: we could do a glob test instead of exact check in the future
    // if needed but that might be too permissive.
    if (Array.isArray(whitelist) && (whitelist.indexOf(relative) != -1 ||
        isInTestFolder(relative))) {
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

  var is3pFile = /\/(3p|ads)\//.test(pathname) ||
      basename == '3p.js' ||
      basename == 'style.js';
  // Yet another reason to move ads/google/a4a somewhere else
  var isA4A = /\/a4a\//.test(pathname);
  if (is3pFile && !isTestFile && !isA4A) {
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
