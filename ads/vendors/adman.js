import {validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adman(global, data) {
  validateData(data, ['ws', 'host'], []);
  const {host, ws} = data;
  const s = data?.s;
  const script = global.document.createElement('script');
  script.src = 'https://static.adman.gr/adman.js';
  global.document.body.appendChild(script);

  if (host.match(/grxchange/)) {
    script.onload = function () {
      window.Adman.adunit({
        id: ws,
        h: 'https://' + host,
        elementId: 'c',
      });
    };
    return;
  }
  script.setAttribute('data-ws', ws);
  script.setAttribute('data-h', host);
  if (s) {
    script.setAttribute('data-s', s);
  }
  script.setAttribute('data-tech', 'amp');
}
