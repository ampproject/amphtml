import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yektanet(global, data) {
  validateData(data, ['publisherName', 'scriptName', 'posId'], ['adType']);

  const isBanner = data['adType'] === 'banner';

  const container = document.getElementById('c');
  const adDiv = document.createElement('div');
  adDiv.setAttribute('id', data['posId']);
  if (isBanner) {
    adDiv.setAttribute('class', 'yn-bnr');
  }
  container.appendChild(adDiv);

  const now = new Date();
  const version = [
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
  ].join('0');

  const scriptSrc = isBanner
    ? 'https://cdn.yektanet.com/template/bnrs/yn_bnr.min.js'
    : `https://cdn.yektanet.com/js/${encodeURIComponent(
        data['publisherName']
      )}/${encodeURIComponent(data['scriptName'])}`;

  loadScript(global, `${scriptSrc}?v=${version}`);
}
