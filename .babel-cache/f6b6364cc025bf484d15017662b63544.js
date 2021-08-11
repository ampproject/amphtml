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

import { urls } from "./config";
import { parseQueryString } from "./core/types/string/url";
import { loadPromise } from "./event-helper";
import { isModeDevelopment } from "./mode";

/**
 * Triggers validation for the current document if there is a script in the
 * page that has a "development" attribute and the bypass validation via
 * #validate=0 is absent.
 *
 * @param {!Window} win Destination window for the new element.
 */
export function maybeValidate(win) {
  var filename = win.location.href;
  if (filename.startsWith('about:')) {
    // Should only happen in tests.
    return;
  }
  var validator = false;
  if (isModeDevelopment(win)) {
    var hash = parseQueryString(
    win.location['originalHash'] || win.location.hash);

    validator = hash['validate'] !== '0';
  }

  if (validator) {
    loadScript(win.document, "".concat(urls.cdn, "/v0/validator_wasm.js")).then(function () {
      /* global amp: false */
      amp.validator.validateUrlAndLog(filename, win.document);
    });
  }
}

/**
 * Loads script
 *
 * @param {Document} doc
 * @param {string} url
 * @return {!Promise}
 */
export function loadScript(doc, url) {
  var script = /** @type {!HTMLScriptElement} */(
  doc.createElement('script'));

  script.src = url;

  // Propagate nonce to all generated script tags.
  var currentScript = doc.head.querySelector('script[nonce]');
  if (currentScript) {
    script.setAttribute('nonce', currentScript.getAttribute('nonce'));
  }

  var promise = loadPromise(script).then(
  function () {
    doc.head.removeChild(script);
  },
  function () {});

  doc.head.appendChild(script);
  return promise;
}
// /Users/mszylkowski/src/amphtml/src/validator-integration.js