import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function broadstreetads(global, data) {
  validateData(
    data,
    ['network', 'zone', 'width', 'height'],
    ['keywords', 'place', 'initurl', 'initoptions']
  );

  data.place = data.place || 0;

  const placeholderID = 'placement_' + data.zone + '_' + data.place;
  const initUrl =
    data.initurl || 'https://cdn.broadstreetads.com/init-2.min.js';

  // placeholder div
  const d = global.document.createElement('div');
  d.setAttribute('id', placeholderID);
  global.document.getElementById('c').appendChild(d);

  global.broadstreet = global.broadstreet || {};
  global.broadstreet.loadAMPZone =
    global.broadstreet.loadAMPZone || (() => ({}));
  global.broadstreet.run = global.broadstreet.run || [];
  global.broadstreet.run.push(() => {
    global.broadstreet.loadAMPZone(d, {
      amp: true,
      ampGlobal: global,
      ampData: data,
      height: data.height,
      keywords: data.keywords,
      networkId: data.network,
      place: data.place,
      softKeywords: true,
      width: data.width,
      zoneId: data.zone,
      options: data.initoptions,
    });
  });
  loadScript(global, initUrl);
}
