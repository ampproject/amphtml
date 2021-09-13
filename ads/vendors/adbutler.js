import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adbutler(global, data) {
  validateData(
    data,
    ['account', 'zone', 'width', 'height'],
    ['keyword', 'place']
  );

  data['place'] = data['place'] || 0;

  const placeholderID = 'placement_' + data['zone'] + '_' + data['place'];

  // placeholder div
  const d = global.document.createElement('div');
  d.setAttribute('id', placeholderID);
  global.document.getElementById('c').appendChild(d);

  global.AdButler = global.AdButler || {};
  global.AdButler.ads = global.AdButler.ads || [];

  global.AdButler.ads.push({
    handler(opt) {
      global.AdButler.register(
        data['account'],
        data['zone'],
        [data['width'], data['height']],
        placeholderID,
        opt
      );
    },
    opt: {
      place: data['place'],
      pageKey: global.context.pageViewId,
      keywords: data['keyword'],
      domain: 'servedbyadbutler.com',
      click: 'CLICK_MACRO_PLACEHOLDER',
    },
  });
  loadScript(global, 'https://servedbyadbutler.com/app.js');
}
