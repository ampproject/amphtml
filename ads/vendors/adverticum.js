import {validateData, writeScript} from '#3p/3p';

import {setStyle} from '#core/dom/style';
/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adverticum(global, data) {
  validateData(data, ['goa3zone'], ['costumetargetstring']);
  const zoneid = 'zone' + data['goa3zone'];
  const d = global.document.createElement('div');

  d.id = zoneid;
  d.classList.add('goAdverticum');

  document.getElementById('c').appendChild(d);
  if (data['costumetargetstring']) {
    const s = global.document.createTextNode(data['costumetargetstring']);
    const v = global.document.createElement('var');
    v.setAttribute('id', 'cT');
    v.setAttribute('class', 'customtarget');
    setStyle(v, 'display', 'none');
    v.appendChild(s);
    document.getElementById(zoneid).appendChild(v);
  }
  writeScript(global, '//ad.adverticum.net/g3.js');
}
