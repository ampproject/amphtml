/**
 * @license DEDUPE_ON_MINIFY
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
 * limitations under the license.
 */
goog.module('amp.validator.validatorInBrowser');

const GoogPromise = goog.require('goog.Promise');
const uriUtils = goog.require('goog.uri.utils');
const validator = goog.require('amp.validator');
const {ValidationResult} = goog.require('amp.validator.protogenerated');

/**
 * Fetches the contents of a URL as a Promise.
 * @param {string} url
 * @return {!GoogPromise<string>} The fetched document.
 */
function getUrl(url) {
  return new GoogPromise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          resolve(xhr.responseText);
        } else {
          reject('Fetching file for validation failed: ' + url);
        }
      }
    };
    xhr.open('GET', url, true);
    xhr.send();
  });
}

/**
 * Checks if the given URL is an AMP cache URL.
 * @param {string} url
 * @return {boolean}
 */
const isAmpCacheUrl = function(url) {
  return url.toLowerCase().indexOf('cdn.ampproject.org') !==
      -1;  // lgtm [js/incomplete-url-substring-sanitization]
};
exports.isAmpCacheUrl = isAmpCacheUrl;
goog.exportSymbol('amp.validator.isAmpCacheUrl', isAmpCacheUrl);

/**
 * Validates doc in the browser by inspecting elements, attributes, etc. in
 * the DOM. This method is exported so it can be unit tested.
 * @param {!Document=} opt_doc
 * @return {!ValidationResult}
 */
const validateInBrowser = function(opt_doc) {
  const result = new ValidationResult();
  result.status = ValidationResult.Status.UNKNOWN;

  // If adding in-browser validation functions, please add them here.
  // Note that result.status is set to UNKNOWN by default. If a routine
  // finds an error, then it should be set to 'FAIL'. Otherwise, it
  // should be left alone - that is, even for warnings it should be left
  // at UNKNOWN, so as to not override a FAIL coming from
  // validator.validateString below when we call mergeFrom.
  return result;
};
exports.validateInBrowser = validateInBrowser;
goog.exportSymbol('amp.validator.validateInBrowser', validateInBrowser);

/**
 * Validates a URL input, logging to the console the result.
 * Careful when modifying this; it's called from
 * https://github.com/ampproject/amphtml/blob/master/src/validator-integration.js
 *
 * WARNING: This is exported; interface changes may break downstream users like
 * https://www.npmjs.com/package/amphtml-validator and
 * https://validator.amp.dev/.

 * @param {string} url
 * @param {!Document=} opt_doc
 */
const validateUrlAndLog = function(url, opt_doc) {
  if (isAmpCacheUrl(url)) {
    console.error(
        'Attempting to validate an AMP cache URL. Please use ' +
        '#development=1 on the origin URL instead.');
    return;
  }
  getUrl(url).then(
      function(html) {  // Success
        const fragment = uriUtils.getFragment(url);
        let format = 'AMP';
        if (fragment.indexOf('development') != -1) {
          fragment.split('&').forEach(hashValue => {
            const keyValue = hashValue.split('=');
            if (keyValue[0] === 'development') {
              format = keyValue[1] === '1' ? 'AMP' : format = keyValue[1];
            }
          });
        }
        const validationResult = validator.validateString(html, format);
        if (opt_doc) {
          const browserResult = validateInBrowser(opt_doc);
          validationResult.mergeFrom(browserResult);
        }
        validationResult.outputToTerminal(url, undefined);
      },
      function(reason) {  // Failure
        console.error(reason);
      });
};
exports.validateUrlAndLog = validateUrlAndLog;
goog.exportSymbol('amp.validator.validateUrlAndLog', validateUrlAndLog);
