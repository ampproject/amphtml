import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adstir(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], ['appId', 'adSpot']);

  const v = '4.0';

  const d = global.document.createElement('div');
  d.setAttribute('class', 'adstir-ad-async');
  d.setAttribute('data-ver', v);
  d.setAttribute('data-app-id', data['appId']);
  d.setAttribute('data-ad-spot', data['adSpot']);
  d.setAttribute('data-amp', true);
  d.setAttribute('data-origin', global.context.location.href);
  global.document.getElementById('c').appendChild(d);

  loadScript(global, 'https://js.ad-stir.com/js/adstir_async.js');
}
