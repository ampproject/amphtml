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
var through2 = require('through2');

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

var backwardCompat = 'This method must not be called. It is only retained ' +
    'for backward compatibility during rollout.';

var realiasGetMode = 'Do not re-alias getMode or its return so it can be ' +
    'DCE\'d. Use explicitly like "getMode().localDev" instead.';

// Terms that must not appear in our source files.
var forbiddenTerms = {
  'DO NOT SUBMIT': '',
  'describe\\.only': '',
  'describes.*\\.only': '',
  'it\\.only': '',
  'Math\.random[^;()]*=': 'Use Sinon to stub!!!',
  'sinon\\.(spy|stub|mock)\\(': {
    message: 'Use a sandbox instead to avoid repeated `#restore` calls'
  },
  '(\\w*([sS]py|[sS]tub|[mM]ock|clock).restore)': {
    message: 'Use a sandbox instead to avoid repeated `#restore` calls'
  },
  'sinon\\.useFake\\w+': {
    message: 'Use a sandbox instead to avoid repeated `#restore` calls'
  },
  'sandbox\\.(spy|stub|mock)\\([^,\\s]*[iI]?frame[^,\\s]*,': {
    message: 'Do NOT stub on a cross domain iframe! #5359\n' +
        '  If this is same domain, mark /*OK*/.\n' +
        '  If this is cross domain, overwrite the method directly.'
  },
  'console\\.\\w+\\(': {
    message: 'If you run against this, use console/*OK*/.log to ' +
      'whitelist a legit case.',
    whitelist: [
      'build-system/pr-check.js',
      'build-system/server.js',
      'validator/nodejs/index.js',  // NodeJs only.
      'validator/engine/parse-css.js',
      'validator/engine/validator-in-browser.js',
      'validator/engine/validator.js',
    ]
  },
  // Match `getMode` that is not followed by a "()." and is assigned
  // as a variable.
  '\\bgetMode\\([^)]*\\)(?!\\.)': {
    message: realiasGetMode,
    whitelist: [
      'src/mode.js',
      'dist.3p/current/integration.js',
    ]
  },
  'import[^}]*\\bgetMode as': {
    message: realiasGetMode,
  },
  '\\bgetModeObject\\(': {
    message: realiasGetMode,
    whitelist: [
      'src/mode-object.js',
      'src/3p-frame.js',
      'src/log.js',
      'dist.3p/current/integration.js',
    ]
  },
  '(?:var|let|const) +IS_DEV +=': {
    message: 'IS_DEV local var only allowed in mode.js and ' +
        'dist.3p/current/integration.js',
    whitelist: [
      'src/mode.js',
      'dist.3p/current/integration.js',
    ],
  },
  '\\.prefetch\\(': {
    message: 'Do not use preconnect.prefetch, use preconnect.preload instead.'
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
      'extensions/amp-form/0.1/amp-form.js',
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
      'src/inabox/amp-inabox.js',
      'src/service/ampdoc-impl.js',
      'testing/describes.js',
      'testing/iframe.js',
    ],
  },
  'installPerformanceService': {
    message: privateServiceFactory,
    whitelist: [
      'src/amp.js',
      'src/inabox/amp-inabox.js',
      'src/service/performance-impl.js',
    ],
  },
  'installStorageServiceForDoc': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/storage-impl.js',
    ],
  },
  'installTemplatesService': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/template-impl.js',
    ],
  },
  'installUrlReplacementsServiceForDoc': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/url-replacements-impl.js',
    ],
  },
  'installViewerServiceForDoc': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/viewer-impl.js',
    ],
  },
  'setViewerVisibilityState': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
      'src/service/viewer-impl.js',
    ],
  },
  'installViewportServiceForDoc': {
    message: privateServiceFactory,
    whitelist: [
      'src/runtime.js',
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
  'installResourcesServiceForDoc': {
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
  'initLogConstructor': {
    message: 'Should only be called from JS binary entry files.',
    whitelist: [
      '3p/integration.js',
      'ads/alp/install-alp.js',
      'ads/inabox/inabox-host.js',
      'dist.3p/current/integration.js',
      'extensions/amp-access/0.1/amp-login-done.js',
      'src/runtime.js',
      'src/log.js',
      'tools/experiments/experiments.js',
    ],
  },
  'sendMessage': {
    message: 'Usages must be reviewed.',
    whitelist: [
      'src/service/viewer-impl.js',
      'src/service/storage-impl.js',
      'src/service/performance-impl.js',
      'examples/viewer-integr-messaging.js',
      'extensions/amp-access/0.1/login-dialog.js',
      'extensions/amp-access/0.1/signin.js',
    ],
  },
  'sendMessageCancelUnsent': {
    message: 'Usages must be reviewed.',
    whitelist: [
      'src/service/viewer-impl.js',
      'src/service/performance-impl.js',
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
      'build-system/test-server.js',
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
  'storageForDoc': {
    message: requiresReviewPrivacy,
    whitelist: [
      'src/storage.js',
      'extensions/amp-user-notification/0.1/amp-user-notification.js',
      'extensions/amp-app-banner/0.1/amp-app-banner.js',
    ],
  },
  'localStorage': {
    message: requiresReviewPrivacy,
    whitelist: [
      'extensions/amp-analytics/0.1/cid-impl.js',
      'src/service/storage-impl.js',
      'testing/fake-dom.js',
    ],
  },
  'sessionStorage': {
    message: requiresReviewPrivacy,
    whitelist: [
      'extensions/amp-accordion/0.1/amp-accordion.js',
    ],
  },
  'indexedDB': {
    message: requiresReviewPrivacy,
    whitelist: [
      // https://docs.google.com/document/d/1tH_sj93Lo8XRpLP0cDSFNrBi1K_jmx_-q1sk_ZW3Nbg/edit#heading=h.ko4gxsan9svq
      'src/service-worker/core.js',
      'src/service-worker/kill.js',
    ]
  },
  'openDatabase': requiresReviewPrivacy,
  'requestFileSystem': requiresReviewPrivacy,
  'webkitRequestFileSystem': requiresReviewPrivacy,
  'getAccessReaderId': {
    message: requiresReviewPrivacy,
    whitelist: [
      'build-system/amp.extern.js',
      'extensions/amp-access/0.1/amp-access.js',
      'src/service/url-replacements-impl.js',
    ]
  },
  'getAuthdataField': {
    message: requiresReviewPrivacy,
    whitelist: [
      'build-system/amp.extern.js',
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
      'build-system/pr-check.js',
      'validator/engine/tokenize-css.js',
      'validator/engine/validator.js',
      // Service workers are only available in ES6 environments
      'src/service-worker/core.js',
      // exports.startsWith occurs in babel generated code.
      'dist.3p/current/integration.js',
    ]
  },
  '\\.endsWith': {
    message: es6polyfill,
    whitelist: [
      'build-system/pr-check.js',
      'build-system/tasks/csvify-size/index.js',
      // Service workers are only available in ES6 environments
      'src/service-worker/core.js',
      // .endsWith occurs in babel generated code.
      'dist.3p/current/integration.js',
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
  '(dev|user)\\(\\)\\.(fine|info|warn|error)\\((?!\\s*([A-Z0-9-]+|[\'"`][A-Z0-9-]+[\'"`]))[^,)\n]*': {
    message: 'Logging message require explicitly `TAG`, or an all uppercase' +
        ' string as the first parameter',
  },
  '\\.schedulePass\\(': {
    message: 'schedulePass is heavy, thinking twice before using it',
    whitelist: [
      'src/service/resources-impl.js',
    ],
  },
  '(win|Win)(dow)?(\\(\\))?\\.open\\W': {
    message: 'Use dom.openWindowDialog',
    whitelist: [
      'src/dom.js',
    ],
  },
  '\\.getWin\\(': {
    message: backwardCompat,
    whitelist: [
    ],
  },
  '/\\*\\* @type \\{\\!Element\\} \\*/': {
    message: 'Use assertElement instead of casting to !Element.',
    whitelist: [
      'src/log.js',  // Has actual implementation of assertElement.
      'dist.3p/current/integration.js',  // Includes the previous.
    ],
  },
  'chunk\\(': {
    message: 'chunk( should only be used during startup',
    whitelist: [
      'src/amp.js',
      'src/chunk.js',
      'src/inabox/amp-inabox.js',
      'src/runtime.js',
    ],
  },
  'style\\.\\w+ = ': {
    message: 'Use setStyle instead!',
    whitelist: [
      'testing/iframe.js',
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
  'Math\\.sign': ThreePTermsMessage,
  'Object\\.assign': {
    message: ThreePTermsMessage,
    // See https://github.com/ampproject/amphtml/issues/4877
    whitelist: ['ads/openx.js'],
  },
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
  '\\.scheduleUnlayout\\(': bannedTermsHelpString,
  'loadExtension': {
    message: bannedTermsHelpString,
    whitelist: [
      'src/element-stub.js',
      'src/friendly-iframe-embed.js',
      'src/runtime.js',
      'src/service/extensions-impl.js',
      'src/service/lightbox-manager-discovery.js',
      'src/shadow-embed.js',
      'extensions/amp-ad/0.1/amp-ad.js',
      'extensions/amp-a4a/0.1/amp-a4a.js',
    ],
  },
  'loadElementClass': {
    message: bannedTermsHelpString,
    whitelist: [
      'src/runtime.js',
      'src/service/extensions-impl.js',
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
  },
  '[^.]loadPromise': {
    message: 'Most users should use BaseElement…loadPromise.',
    whitelist: [
      'src/base-element.js',
      'src/event-helper.js',
      'src/friendly-iframe-embed.js',
      'src/service/performance-impl.js',
      'src/service/url-replacements-impl.js',
      'extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler.js',
      'extensions/amp-image-lightbox/0.1/amp-image-lightbox.js',
      'extensions/amp-analytics/0.1/transport.js',
    ]
  },
  '\\.getTime\\(\\)': {
    message: 'Unless you do weird date math (whitelist), use Date.now().',
  },
  '\\.expandStringSync\\(': {
    message: requiresReviewPrivacy,
    whitelist: [
      'src/service/url-replacements-impl.js',
    ]
  },
  '\\.expandStringAsync\\(': {
    message: requiresReviewPrivacy,
    whitelist: [
      'src/service/url-replacements-impl.js',
    ]
  },
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
  contents = contents.replace(/\/\*(?!.*\*\/)(.|\n)*?\*\//g, function(match) {
    // Preserve the newlines
    var newlines = [];
    for (var i = 0; i < match.length; i++) {
      if (match[i] === '\n') {
        newlines.push('\n');
      }
    }
    return newlines.join('');
  });
  // Single line comments either on its own line or following a space,
  // semi-colon, or closing brace
  return contents.replace(/( |}|;|^) *\/\/.*/g, '$1');
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
    var regex = new RegExp(term, 'gm');
    var index = 0;
    var line = 1;
    var column = 0;
    var match;
    var hasTerm = false;

    while ((match = regex.exec(contents))) {
      hasTerm = true;
      for (index; index < match.index; index++) {
        if (contents[index] === '\n') {
          line++;
          column = 1;
        } else {
          column++;
        }
      }

      util.log(util.colors.red('Found forbidden: "' + match[0] +
          '" in ' + relative + ':' + line + ':' + column));
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
    }

    return hasTerm;
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
    .pipe(through2.obj(function(file, enc, cb) {
      forbiddenFound = hasAnyTerms(file) || forbiddenFound;
      missingRequirements = isMissingTerms(file) || missingRequirements;
      cb();
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
