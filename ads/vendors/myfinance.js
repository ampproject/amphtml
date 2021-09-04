import {validateData, writeScript} from '#3p/3p';

const mandatoryFields = ['adType'];

const adUrl = 'https://www.myfinance.com/amp/ad';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function myfinance(global, data) {
  validateData(data, mandatoryFields);
  if (!data['mf_referrer']) {
    data['mf_referrer'] =
      global.context.canonicalUrl || global.context.sourceUrl;
  }
  if (!data['ampClientId']) {
    data['ampClientId'] = global.context.clientId;
  }
  const url = buildUrl(data);
  global.MF_AMP_DATA = data;
  writeScript(global, url);
}

/**
 * Generates the url to call for the script content
 * @param {!Object} data
 * @return {string}
 */
function buildUrl(data) {
  const url = new URL(adUrl);
  Object.entries(data).forEach((entry) =>
    url.searchParams.set(entry[0], entry[1])
  );
  return url.toString();
}
