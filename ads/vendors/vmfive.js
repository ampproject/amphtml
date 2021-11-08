import {validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function vmfive(global, data) {
  /*eslint "local/camelcase": 0*/
  const mandatory_fields = ['appKey', 'placementId', 'adType'];
  const optional_fields = [];

  const {adType, appKey, placementId} = data;

  global._vmfive_amp = {appKey, placementId, adType};

  validateData(data, mandatory_fields, optional_fields);

  createAdUnit(global, placementId, adType);
  setupSDKReadyCallback(global, appKey);
  parallelDownloadScriptsAndExecuteInOrder(global);
}

/**
 * @param {!Window} win
 */
function parallelDownloadScriptsAndExecuteInOrder(win) {
  [
    'https://vawpro.vm5apis.com/man.js',
    'https://man.vm5apis.com/dist/adn-web-sdk.js',
  ].forEach(function (src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    win.document.head.appendChild(script);
  });
}

/**
 * @param {!Window} win
 * @param {string} placementId
 * @param {string} adType
 */
function createAdUnit(win, placementId, adType) {
  const el = document.createElement('vmfive-ad-unit');
  el.setAttribute('placement-id', placementId);
  el.setAttribute('ad-type', adType);
  win.document.getElementById('c').appendChild(el);
}

/**
 * @param {!Window} win
 * @param {string} appKey
 */
function setupSDKReadyCallback(win, appKey) {
  win.onVM5AdSDKReady = (sdk) => sdk.init({appKey});
}
