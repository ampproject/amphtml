import {loadScript, validateData} from '#3p/3p';

import {parseJson} from '#core/types/object/json';

const requiredParams = ['spot'];
const optionsParams = [
  'keywords',
  'adType',
  'param1',
  'param2',
  'param3',
  'subid',
  'cols',
  'rows',
  'title',
  'titlePosition',
  'adsByPosition',
];
const adContainerId = 'runative_id';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function runative(global, data) {
  // ensure we have valid widgetIds value
  validateData(data, requiredParams, optionsParams);

  const adContainer = global.document.getElementById('c');
  const adNativeContainer = getAdContainer(global);
  const initScript = getInitAdScript(global, data);

  adContainer.appendChild(adNativeContainer);

  // load the RUNative AMP JS file
  loadScript(global, '//cdn.run-syndicate.com/sdk/v1/n.js', () => {
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
      const initKey = key === 'adType' ? 'type' : key;

      initParams[initKey] = data[key];
    }
  });

  initParams['element_id'] = adContainerId;

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
    `NativeAd(${JSON.stringify(initData)});`
  );

  scriptElement.appendChild(initScript);

  return scriptElement;
}
