import {validateData} from '#3p/3p';

import {setStyles} from '#core/dom/style';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adspirit(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], ['asmParams', 'asmHost']);
  const i = global.document.createElement('ins');
  i.setAttribute('data-asm-params', data['asmParams']);
  i.setAttribute('data-asm-host', data['asmHost']);
  i.setAttribute('class', 'asm_async_creative');
  setStyles(i, {
    display: 'inline-block',
    'text-align': 'left',
  });
  global.document.getElementById('c').appendChild(i);
  const s = global.document.createElement('script');
  s.src = 'https://' + data['asmHost'] + '/adasync.js';
  global.document.body.appendChild(s);
}
