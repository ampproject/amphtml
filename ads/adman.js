/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adman(global, data) {
  const script = document.createElement('script');

  script.setAttribute('data-ws', data.ws);
  script.setAttribute('data-h', data.host);
  script.setAttribute('data-s', data.s);
  script.setAttribute('data-tech', 'amp');

  script.src = 'http://static.adman.gr/adman.js';

  global.document.body.appendChild(script);
}
