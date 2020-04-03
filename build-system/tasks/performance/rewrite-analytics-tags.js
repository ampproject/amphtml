/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

const fs = require('fs');
const {CONTROL, EXPERIMENT, urlToCachePath} = require('./helpers');
const {JSDOM} = require('jsdom');

/**
 * Add extraUrlParam in analytics inline config,
 * if amp-analytics is on the page.
 *
 * @param {string} url
 * @param {string} version
 * @param {?object} extraUrlParams
 */
async function addExtraUrlParams(url, version, extraUrlParams) {
  const cachePath = urlToCachePath(url, version);
  const document = fs.readFileSync(cachePath);
  const dom = new JSDOM(document);

  const analyticsTags = Array.from(
    dom.window.document.querySelectorAll('amp-analytics')
  );
  for (const tag of analyticsTags) {
    const scriptTag = tag.querySelector('script');
    let script = {};
    if (scriptTag) {
      tag.removeChild(scriptTag);
      script = JSON.parse(scriptTag./*OK*/ innerHTML);
    }
    script = Object.assign(script, {
      extraUrlParams,
    });
    const newScriptTag = dom.window.document.createElement('script');
    newScriptTag.textContent = JSON.stringify(script);
    newScriptTag.setAttribute('type', 'application/json');
    tag.appendChild(newScriptTag);
  }

  fs.writeFileSync(cachePath, dom.serialize());
}

/**
 * Rewrite analytics configs for each document
 * downloaded from the analytics handler urls
 * @param {?Object} handlers
 * @return {Promise}
 */
function rewriteAnalyticsConfig(handlers) {
  const {urls, extraUrlParam} = handlers.find(
    (handler) => handler.handlerName === 'analyticsHandler'
  );
  return Promise.all(
    urls.flatMap((url) => [
      addExtraUrlParams(url, CONTROL, extraUrlParam),
      addExtraUrlParams(url, EXPERIMENT, extraUrlParam),
    ])
  );
}

module.exports = rewriteAnalyticsConfig;
