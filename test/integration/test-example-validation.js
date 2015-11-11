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


import {loadPromise} from '../../src/event-helper';


// TODO(@cramforce): Use local version. This is non-hermetic
// and really bad. When the validator is open source we can
// use it directly.
if (!window.validatorLoad) {
  window.validatorLoad = (function() {
    const s = document.createElement('script');
    s.src = 'https://www.gstatic.com/amphtml/v0/validator.js';
    document.body.appendChild(s);
    return loadPromise(s);
  })();
}

describe('example', function() {
  // TODO(@cramforce): Remove when test is hermetic.
  this.timeout(5000);

  const examples = [
    'ads.amp.html',
    'metadata-examples/article-json-ld.amp.html',
    'metadata-examples/article-microdata.amp.html',
    'metadata-examples/recipe-json-ld.amp.html',
    'metadata-examples/recipe-microdata.amp.html',
    'metadata-examples/review-json-ld.amp.html',
    'metadata-examples/review-microdata.amp.html',
    'metadata-examples/video-json-ld.amp.html',
    'metadata-examples/video-microdata.amp.html',
    'article.amp.html',
    'everything.amp.html',
    'instagram.amp.html',
    'released.amp.html',
    'twitter.amp.html',
  ];

  /**
   * Only add to this whitelist to temporarily manage discrepancies
   * between validator and runtime.
   *
   * Ex: `/INVALID_ATTR_VALUE.*vprt/`
   *
   * @constructor {!Array<!RegExp>}
   */
  const errorWhitelist = [
    // TODO(dvoytenko): Remove once validator supports "data-videoid" for
    // "amp-youtube" elements.
    /MANDATORY_ATTR_MISSING video-id/,

    // TODO(dvoytenko): Remove once validator supports "amp-font" element.
    /DISALLOWED_TAG amp-font/,
  ];

  const usedWhitelist = [];

  beforeEach(() => {
    return window.validatorLoad;
  });

  examples.forEach(filename => {
    it(filename + ' should validate', () => {
      const url = '/base/examples/' + filename;
      return get(url).then(html => {
        const validationResult = amp.validator.validateString(html);
        const rendered = amp.validator.renderValidationResult(validationResult,
            url);

        const errors = [];
        if (rendered[0] == 'FAIL') {
          for (let i = 1; i < rendered.length; i++) {
            const line = rendered[i];
            if (/DEV_MODE_ENABLED/.test(line)) {
              // This error is expected since we have to be in dev mode to
              // run the validator. It is only a warning and we'd probably
              // see that by looking for PASS / FAIL. By itself it doesn't
              // make things fail.
              // TODO(johannes): Add warning prefixes to such events so they
              // can be detected systematically.
              continue;
            }
            let whitelisted = false;
            for (let n = 0; n < errorWhitelist.length; n++) {
              const ok = errorWhitelist[n];
              if (ok.test(line)) {
                whitelisted = true;
                usedWhitelist.push(ok);
                break;
              }
            }
            if (!whitelisted) {
              errors.push(line);
            }
          }
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
      const xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(xhr.responseText);
          } else {
            reject(new Error('Fetching file for validation failed: ' +
                filename));
          }
        }
      };
      xhr.open("GET", filename, true);
      xhr.send();
    });
  }
});
