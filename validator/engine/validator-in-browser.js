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
goog.require('amp.validator.ValidationResult');
goog.require('amp.validator.validateString');
goog.require('goog.Promise');

goog.provide('amp.validator.validateInBrowser');
goog.provide('amp.validator.validateUrlAndLog');

/**
 * Fetches the contents of a URL as a Promise.
 * @param {string} url
 * @return {!goog.Promise<string>} The fetched document.
 */
function getUrl(url) {
  return new goog.Promise(function(resolve, reject) {
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
amp.validator.isAmpCacheUrl = function(url) {
  return (
    url.toLowerCase().indexOf('cdn.ampproject.org') !== -1 || // lgtm [js/incomplete-url-substring-sanitization]
    url.toLowerCase().indexOf('amp.cloudflare.com') !== -1); // lgtm [js/incomplete-url-substring-sanitization]
};

/**
 * Validates doc in the browser by inspecting elements, attributes, etc. in
 * the DOM. This method is exported so it can be unit tested.
 * @param {!Document=} opt_doc
 * @return {!amp.validator.ValidationResult}
 */
amp.validator.validateInBrowser = function(opt_doc) {
  const result = new amp.validator.ValidationResult();
  result.status = amp.validator.ValidationResult.Status.UNKNOWN;

  // If adding in-browser validation functions, please add them here.
  // Note that result.status is set to UNKNOWN by default. If a routine
  // finds an error, then it should be set to 'FAIL'. Otherwise, it
  // should be left alone - that is, even for warnings it should be left
  // at UNKNOWN, so as to not override a FAIL coming from validateString
  // below when we call mergeFrom.
  return result;
};

/**
 * Validates a URL input, logging to the console the result.
 * Careful when modifying this; it's called from
 * https://github.com/ampproject/amphtml/blob/master/src/validator-integration.js
 * @param {string} url
 * @param {!Document=} opt_doc
 * @param {string=} opt_errorCategoryFilter
 * @export
 */
amp.validator.validateUrlAndLog = function(
  url, opt_doc, opt_errorCategoryFilter) {
  if (amp.validator.isAmpCacheUrl(url)) {
    console.error(
        'Attempting to validate an AMP cache URL. Please use ' +
        '#development=1 on the origin URL instead.');
    return;
  }
  getUrl(url).then(
      function(html) { // Success
        const validationResult = amp.validator.validateString(html);
        if (opt_doc) {
          const browserResult = amp.validator.validateInBrowser(opt_doc);
          validationResult.mergeFrom(browserResult);
        }
        validationResult.outputToTerminal(
            url, undefined, opt_errorCategoryFilter);
      },
      function(reason) { // Failure
        console.error(reason);
      });
};
