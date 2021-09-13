import {validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adman(global, data) {
  validateData(data, ['ws', 'host', 's'], []);

  const script = global.document.createElement('script');
  script.setAttribute('data-ws', data.ws);
  script.setAttribute('data-h', data.host);
  script.setAttribute('data-s', data.s);
  script.setAttribute('data-tech', 'amp');

  script.src = 'https://static.adman.gr/adman.js';

  global.document.body.appendChild(script);
}
