/**
 * @license
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
goog.require('amp.validator.ValidationError');
goog.require('amp.validator.ValidationResult');
goog.require('amp.validator.validateString');
goog.require('goog.Promise');

goog.provide('amp.validator.validateInBrowser');
goog.provide('amp.validator.validateTapActionsA11y');
goog.provide('amp.validator.validateUrlAndLog');

/**
 * Fetches the contents of a URL as a Promise.
 * @param {string} url
 * @return {!goog.Promise<!string>} The fetched document.
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
 * Prints an element reference for error messages.
 * @param {!HTMLElement} element
 * @return {!string}
 */
function printElementRef(element) {
  // TODO(dvoytenko,johannes): Propagate the element object itself
  // into the error object and log that to the browser's console.
  if (element.hasAttribute('id')) {
    return 'Element ' + element.tagName + '#' + element.getAttribute('id');
  }
  return 'Element ' + element.tagName;
}

/**
 * This looks for elements with an on attribute with missing role / tabindex
 * attr. Taken from https://github.com/ampproject/amphtml/pull/358.
 * @param {!Document} doc
 * @param {!amp.validator.ValidationResult} validationResult
 */
amp.validator.validateTapActionsA11y = function(doc, validationResult) {
  // TODO(johannes): Unfortunately this doesn't come with a way to
  // generate line / column numbers like we do for all of our errors,
  // and also it could work just fine with SAX. Port this to validator.js +
  // validator.protoascii.

  const elements = doc.querySelectorAll('[on*="tap:"]');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element.tagName === 'A' || element.tagName === 'BUTTON') {
      continue;
    }
    if (!element.hasAttribute('role')) {
      const error = new amp.validator.ValidationError();
      error.severity = amp.validator.ValidationError.Severity.ERROR;
      error.code = amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING;
      error.detail =
          'A11Y: ' + printElementRef(element) + ' must have "role" attribute ' +
          'due to "tap" action, e.g. role="button".';
      validationResult.errors.push(error);
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
    }
    if (!element.hasAttribute('tabindex')) {
      const error = new amp.validator.ValidationError();
      error.severity = amp.validator.ValidationError.Severity.ERROR;
      error.code = amp.validator.ValidationError.Code.MANDATORY_ATTR_MISSING;
      error.detail =
          'A11Y: ' + printElementRef(element) + ' must have "tabindex" ' +
          'attribute due to "tap" action.';
      validationResult.errors.push(error);
      validationResult.status = amp.validator.ValidationResult.Status.FAIL;
    }
  }
};

/**
 * Validates doc in the browser by inspecting elements, attributes, etc. in
 * the DOM. This method is exported so it can be unittested.
 * @param {!Document} doc
 * @return {!amp.validator.ValidationResult}
 */
amp.validator.validateInBrowser = function(doc) {
  const result = new amp.validator.ValidationResult();
  result.status = amp.validator.ValidationResult.Status.UNKNOWN;
  amp.validator.validateTapActionsA11y(doc, result);

  // If adding more in-browser validation functions, please add them here,
  // much like validateTapActionsA11y.
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
 * https://github.com/ampproject/amphtml/blob/master/test/integration/test-example-validation.js
 * and https://github.com/ampproject/amphtml/blob/master/src/validator-integration.js
 * @param {string} url
 * @param {!Document=} opt_doc
 * @export
 */
amp.validator.validateUrlAndLog = function(url, opt_doc) {
  getUrl(url).then(
    function(html) {  // Success
      const validationResult = amp.validator.validateString(html);
      if (opt_doc) {
        const browserResult = amp.validator.validateInBrowser(opt_doc);
        validationResult.mergeFrom(browserResult);
      }
      validationResult.outputToTerminal(url);
    },
    function(reason) {  // Failure
      console.error(reason);
    });
};
