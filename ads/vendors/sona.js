import {loadScript, validateData} from '#3p/3p';

import {parseJson} from '#core/types/object/json';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sona(global, data) {
  validateData(data, ['config'], ['responsive']);

  // Additional validation
  const dataConfig = data['config'];
  const adConfig = parseJson(dataConfig);

  // Add configuration
  const configScript = global.document.createElement('SCRIPT');
  const config = global.document.createTextNode(
    '(sona = window.sona || ' + JSON.stringify(adConfig) + ')'
  );
  configScript.appendChild(config);

  // Set up amp-ad
  const slot = global.document.getElementById('c');
  const ad = global.document.createElement('SONA-WIDGET');
  ad.setAttribute('auto-responsive', '');
  ad.className = 'ad-tag';

  // setup ad from sona
  slot.appendChild(ad);
  slot.appendChild(configScript);

  // Initialise sona widget and get Image/Video
  const scriptUrl = 'https://cdn.sonaserve.com/v1.1/dist.js';
  loadScript(global, scriptUrl);
}
