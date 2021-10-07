const fs = require('fs');
const {
  CONTROL,
  EXPERIMENT,
  getLocalVendorConfig,
  urlToCachePath,
} = require('./helpers');

/**
 * Return local vendor config.
 *
 * @param {string} vendor
 * @return {Promise<Object>}
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
 * @return {Promise<Object>}
 */
async function maybeMergeAndRemoveVendorConfig(tag, script) {
  const vendor = tag.getAttribute('type');
  if (vendor) {
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
 * @return {Promise<void>}
 */
async function alterAnalyticsTags(url, version, extraUrlParams) {
  const cachePath = urlToCachePath(url, version);
  const document = fs.readFileSync(cachePath);
  const {JSDOM} = await import('jsdom'); // Lazy-imported to speed up task loading.
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
 * @return {Promise<void[]>}
 */
async function rewriteAnalyticsConfig(handlers) {
  const handlerPromises = [];
  handlers.forEach((handler) => {
    const {adsUrls, extraUrlParam, handlerName, urls} = handler;
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
