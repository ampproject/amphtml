import {loadScript, validateData} from '#3p/3p';

import {hasOwn} from '#core/types/object';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sekindo(global, data) {
  validateData(data, ['spaceid']);
  const pubUrl = encodeURIComponent(global.context.sourceUrl);
  const excludesSet = {ampSlotIndex: 1, type: 1};
  const customParamMap = {spaceid: 's', width: 'x', height: 'y'};
  let query =
    'isAmpProject=1&pubUrl=' +
    pubUrl +
    '&cbuster=' +
    global.context.startTime +
    '&';
  let getParam = '';
  for (const key in data) {
    if (hasOwn(data, key)) {
      if (typeof excludesSet[key] == 'undefined') {
        getParam =
          typeof customParamMap[key] == 'undefined' ? key : customParamMap[key];
        query += getParam + '=' + encodeURIComponent(data[key]) + '&';
      }
    }
  }
  loadScript(
    global,
    'https://live.sekindo.com/live/liveView.php?' + query,
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
