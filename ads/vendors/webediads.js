import {loadScript, validateData} from '#3p/3p';

/**
 * Created by Webedia on 07/03/16 - last updated on 11/10/16
 * @param {!Window} global
 * @param {!Object} data
 */
export function webediads(global, data) {
  validateData(data, ['site', 'page', 'position'], ['query']);
  loadScript(global, 'https://eu1.wbdds.com/amp.min.js', () => {
    global.wads.amp.init({
      'site': data.site,
      'page': data.page,
      'position': data.position,
      'query': data.query ? data.query : '',
    });
  });
}
