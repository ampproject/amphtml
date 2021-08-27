import {loadScript, validateData} from '#3p/3p';
import {parseJson} from '#core/types/object/json';

const requiredParams = ['spot'];
const optionsParams = [
  'uploadLink',
  'nativeSettings',
  'wrapperStyles',
  'iFrameStyles',
  'queriesParams',
  'onLoadResponseHook',
  'onSpotRenderedHook',
  'onLoadErrorHook',
];
const adContainerId = 'trafficstars_id';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function trafficstars(global, data) {
  // ensure we have valid widgetIds value
  validateData(data, requiredParams, optionsParams);

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
  const initKeys = requiredParams.concat(optionsParams);
  const initParams = {};

  initKeys.forEach((key) => {
    if (key in data) {
      initParams[key] = data[key];
    }
  });

  initParams['containerId'] = adContainerId;

  return parseJson(initParams);
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
