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
const {
  CONTROL,
  EXPERIMENT,
  getLocalVendorConfig,
  urlToCachePath,
} = require('./helpers');
const {JSDOM} = require('jsdom');

/**
 * Return local vendor config.
 *
 * @param {string} vendor
 * @return {Object}
 */
async function getVendorConfig(vendor) {
  return JSON.parse(await getLocalVendorConfig(vendor));
}

/**
 * Fetch the vendor config and merge it with inline config.
 * Work around for fetching real vendor config that gets blocked
 * by AMP-analytics. Order of merging matters. Uses local config
 * for both CONTROL and EXPERIMENT.
 *
 * @param {Element} tag
 * @param {Object} script
 * @return {Object}
 */
async function maybeMergeAndRemoveVendorConfig(tag, script) {
  if (tag.hasAttribute('type')) {
    const vendor = tag.getAttribute('type');
    tag.removeAttribute('type');
    const vendorConfig = await getVendorConfig(vendor);
    // TODO (micajuineho) replace with analytics/config.js merge objects
    return Object.assign(vendorConfig, script);
  }
  return script;
}

/**
 * Adds extraUrlParam in analytics inline config and
 * fetches and merges local vendor config.
 *
 * @param {string} url
 * @param {string} version
 * @param {?object} extraUrlParams
 */
async function alterAnalyticsTags(url, version, extraUrlParams) {
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
    script.extraUrlParams = script.extraUrlParams || {};
    Object.assign(script.extraUrlParams, extraUrlParams);
    script = await maybeMergeAndRemoveVendorConfig(tag, script);
    const newScriptTag = dom.window.document.createElement('script');
    newScriptTag.textContent = JSON.stringify(script);
    newScriptTag.setAttribute('type', 'application/json');
    tag.appendChild(newScriptTag);
  }

  fs.writeFileSync(cachePath, dom.serialize());
}

/**
 * Rewrite analytics configs for each document
 * downloaded from the analytics or ads handler urls
 * @param {?Object} handlers
 * @return {Promise}
 */
async function rewriteAnalyticsConfig(handlers) {
  const handlerPromises = [];
  handlers.forEach((handler) => {
    const {handlerName, adsUrls, urls, extraUrlParam} = handler;
    if (handlerName !== 'analyticsHandler' && handlerName !== 'adsHandler') {
      return;
    }

    if (adsUrls) {
      urls.push(...adsUrls);
    }

    const handlerPromise = urls.flatMap((url) => [
      alterAnalyticsTags(url, CONTROL, extraUrlParam),
      alterAnalyticsTags(url, EXPERIMENT, extraUrlParam),
    ]);

    handlerPromises.push(handlerPromise);
  });

  return Promise.all(handlerPromises);
}

module.exports = rewriteAnalyticsConfig;
