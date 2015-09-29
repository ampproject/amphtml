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

// foo

import {loadPromise} from '../../src/event-helper';


// TODO(@cramforce): Use local version. This is non-hermetic
// and really bad. When the validator is open source we can
// use it directly.
if (!window.validatorLoad) {
  window.validatorLoad = (function() {
    var s = document.createElement('script');
    s.src = 'https://www.gstatic.com/amphtml/v0/validator.js';
    document.body.appendChild(s);
    return loadPromise(s);
  })();
}

describe('example', function() {
  // TODO(@cramforce): Remove when test is hermetic.
  this.timeout(5000);

  var examples = [
    'ads.amp.html',
    'article-metadata.amp.html',
    'article.amp.html',
    'everything.amp.html',
  ];

  // Only add to this whitelist to temporarily manage discrepancies
  // between validator and runtime.
  /** @constructor {!Array<RegExp>}  */
  var errorWhitelist = [
  ];

  var usedWhitelist = [];

  beforeEach(() => {
    return window.validatorLoad;
  });

  examples.forEach(filename => {
    it(filename + ' should validate', () => {
      var url = '/base/examples/' + filename;
      return get(url).then((html) => {
        var validationResult = amp.validator.validateString(html);
        var rendered = amp.validator.renderValidationResult(validationResult,
            url);

        var errors = [];
        LINES: for (let i = 0; i < rendered.length; i++) {
          var line = rendered[i];
          if (line == 'PASS') {
            continue;
          }
          if (line == 'FAIL') {
            // We only look at individual error lines.
            continue;
          }
          if (/DEV_MODE_ENABLED/.test(line)) {
            // This error is expected since we have to be in dev mode to
            // run the validator. It is only a warning and we'd probably
            // see that by looking for PASS / FAIL. By itself it doesn't
            // make things fail.
            // TODO(johannes): Add warning prefixes to such events so they
            // can be detected systematically.
            continue;
          }
          for (let n = 0; n < errorWhitelist.length; n++) {
            var ok = errorWhitelist[n];
            if (ok.test(rendered)) {
              usedWhitelist.push(ok);
              continue LINES;
            }
          }
          errors.push(line);
        }
        expect(errors.join('\n')).to.equal('');
      });
    });
  });

  it('should use all items in the whitelist', () => {
    errorWhitelist.forEach(item => {
      expect(usedWhitelist).to.contain(item);
    });
  });

  /**
   * @param {string} filename
   * @return {!Promise<!string>} The fetched doc.
   */
  function get(filename) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(xhr.responseText)
          } else {
            reject(new Error('Fetching file for validation failed: ' + filename));
          }
        }
      };
      xhr.open("GET", filename, true);
      xhr.send();
    });
  }
});
