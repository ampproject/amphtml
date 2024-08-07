import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function appmonsta(global, data) {
  validateData(data, ['placementId']);

  const {location} = global.context;
  let url = 'https://ssp.appmonsta.ai?c=b&m=amp';

  const params = [
    ['placementId', encodeURIComponent(data.placementId)],
    ['ua', encodeURIComponent(global.navigator?.userAgent)],
    ['w', data.width],
    ['h', data.height],
    ['domain', location.host],
    ['page', location.pathname],
    ['secure', location.protocol === 'https:' ? 1 : 0],
    ['language', global.navigator?.language],
  ];

  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    url = `${url}&${param[0]}=${param[1] ?? ''}`;
  }

  writeScript(global, url);
}
