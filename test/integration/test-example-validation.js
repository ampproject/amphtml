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
    s.src = 'https://cdn.ampproject.org/v0/validator.js';
    document.body.appendChild(s);
    return loadPromise(s);
  })();
}

describe.configure().retryOnSaucelabs().run('example', function() {
  // TODO(@cramforce): Remove when test is hermetic.
  this.timeout(5000);

  const examples = [
    'ads.amp.html',
    'brid-player.amp.html',
    'brightcove.amp.html',
    'dailymotion.amp.html',
    'metadata-examples/article-json-ld.amp.html',
    'metadata-examples/article-microdata.amp.html',
    'metadata-examples/recipe-json-ld.amp.html',
    'metadata-examples/recipe-microdata.amp.html',
    'metadata-examples/review-json-ld.amp.html',
    'metadata-examples/review-microdata.amp.html',
    'metadata-examples/video-json-ld.amp.html',
    'metadata-examples/video-microdata.amp.html',
    'a4a.amp.html',
    'article.amp.html',
    'analytics.amp.html',
    'analytics-notification.amp.html',
    'everything.amp.html',
    'facebook.amp.html',
    'gfycat.amp.html',
    'instagram.amp.html',
    'released.amp.html',
    'soundcloud.amp.html',
    'springboard-player.amp.html',
    'twitter.amp.html',
    'vine.amp.html',
    'vimeo.amp.html',
    'old-boilerplate.amp.html',
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
    /GENERAL_DISALLOWED_TAG script viewer-integr.js/,
    /DISALLOWED_TAG content/,  // Experiments with shadow slots
  ];

  const usedWhitelist = [];

  beforeEach(() => {
    return window.validatorLoad;
  });

  examples.forEach(filename => {
    it(filename + ' should validate', () => {
      const url = '/examples/' + filename;
      return get(url).then(html => {
        /* global amp: false */
        const validationResult = amp.validator.validateString(html);
        const errors = [];
        if (validationResult.status == 'FAIL') {
          for (let i = 0; i < validationResult.errors.length; i++) {
            const error = validationResult.errors[i];
            if (error.severity != 'ERROR') {
              continue;
            }
            const errorText = error.code +
                (error.params ? ' ' + error.params.join(' ') : '') +
                (error.dataAmpReportTestValue ?
                    ' ' + error.dataAmpReportTestValue : '');
            let whitelisted = false;
            for (let n = 0; n < errorWhitelist.length; n++) {
              const ok = errorWhitelist[n];
              if (ok.test(errorText)) {
                whitelisted = true;
                usedWhitelist.push(ok);
                break;
              }
            }
            if (!whitelisted) {
              errors.push(errorText);
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
      xhr.open('GET', filename, true);
      xhr.send();
    });
  }
});
