import {loadScript, validateData} from '#3p/3p';

import {parseJson} from '#core/types/object/json';

const requiredParams = ['spot'];
const jsonParams = [
  'nativeSettings',
  'wrapperStyles',
  'iFrameStyles',
  'queriesParams',
];
const params = [
  'uploadLink',
  'onLoadResponseHook',
  'onSpotRenderedHook',
  'onLoadErrorHook',
  'subid',
  'subid_1',
  'subid_2',
  'subid_3',
  'subid_4',
  'subid_5',
];
const optionalParams = params.concat(jsonParams);
const adContainerId = 'trafficstars_id';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function trafficstars(global, data) {
  // ensure we have valid widgetIds value
  validateData(data, requiredParams, optionalParams);

  const adContainer = global.document.getElementById('c');
  const adNativeContainer = getAdContainer(global);
  const initScript = getInitAdScript(global, data);

  adContainer.appendChild(adNativeContainer);

  // load the TrafficStars master spot JS file
  loadScript(global, 'https://cdn.tsyndicate.com/sdk/v1/master.spot.js', () => {
    global.document.body.appendChild(initScript);
  });
}

/**
 * @param {!Object} data
 * @return {JsonObject}
 */
function getInitData(data) {
  const initKeys = requiredParams.concat(optionalParams);
  const initParams = {};

  initKeys.forEach((key) => {
    if (key in data) {
      if (jsonParams.includes(key)) {
        initParams[key] = parseJson(data[key]);
      } else {
        initParams[key] = data[key];
      }
    }
  });

  initParams['containerId'] = adContainerId;

  return initParams;
}

/**
 * @param {!Window} global
 * @return {?Node}
 */
function getAdContainer(global) {
  const container = global.document.createElement('div');

  container['id'] = adContainerId;

  return container;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 * @return {?Node}
 */
function getInitAdScript(global, data) {
  const scriptElement = global.document.createElement('script');
  const initData = getInitData(data);
  const initScript = global.document.createTextNode(
    `TsMasterSpot(${JSON.stringify(initData)});`
  );

  scriptElement.appendChild(initScript);

  return scriptElement;
}
