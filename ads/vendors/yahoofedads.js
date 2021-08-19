import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yahoofedads(global, data) {
  validateData(data, [
    'adUnit',
    'site',
    'region',
    'lang',
    'sa',
    'spaceId',
    'url',
  ]);

  global.amp = true;
  global.adConfig = {
    'adPositionOverride': data.adPositionOverride,
    'adUnit': data.adUnit,
    'forceSource': data.forceSource,
    'height': data.height,
    'lang': data.lang,
    'publisherUrl': data.url,
    'region': data.region,
    'sa': data.sa,
    'sectionId': data.sectionId,
    'site': data.site,
    'spaceId': data.spaceId,
    'width': data.width,
  };

  loadScript(
    global,
    'https://s.yimg.com/aaq/ampyahoofedads/yahoofedads.js',
    () => global.context.renderStart()
  );
}
