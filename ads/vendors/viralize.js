import {loadScript, validateData} from '#3p/3p';

import {parseJson} from '#core/types/object/json';

import {addParamsToUrl} from '../../src/url';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function viralize(global, data) {
  const endpoint = 'https://ads.viralize.tv/display/';
  const required = ['zid'];
  const optional = ['extra'];

  validateData(data, required, optional);

  const defaultLocation = 'sel-#c>script';
  const pubPlatform = 'amp';

  const queryParams = parseJson(data.extra || '{}');
  queryParams['zid'] = data.zid;
  queryParams['pub_platform'] = pubPlatform;
  if (!queryParams['location']) {
    queryParams['location'] = defaultLocation;
  }
  if (!queryParams['u']) {
    queryParams['u'] = global.context.sourceUrl;
  }

  const scriptUrl = addParamsToUrl(endpoint, queryParams);

  loadScript(
    global,
    scriptUrl,
    () => global.context.renderStart(),
    () => global.context.noContentAvailable()
  );
}
