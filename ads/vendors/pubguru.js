import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pubguru(global, data) {
  validateData(data, ['publisher', 'slot']);

  global.$pubguru = data;

  const el = global.document.createElement('div');
  el.setAttribute('id', 'the-ad-unit');

  global.document.getElementById('c').appendChild(el);
  loadScript(
    global,
    'https://amp.pubguru.org/amp.' +
      encodeURIComponent(data.publisher) +
      '.min.js'
  );
}
