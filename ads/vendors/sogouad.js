import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sogouad(global, data) {
  validateData(data, ['slot', 'w', 'h'], ['responsive']);
  const slot = global.document.getElementById('c');
  const ad = global.document.createElement('div');
  const sogouUn = 'sogou_un';
  global[sogouUn] = window[sogouUn] || [];
  if (data.w === '100%') {
    global[sogouUn].push({
      id: data.slot,
      ele: ad,
    });
  } else {
    global[sogouUn].push({
      id: data.slot,
      ele: ad,
      w: data.w,
      h: data.h,
    });
  }
  slot.appendChild(ad);
  loadScript(global, 'https://theta.sogoucdn.com/wap/js/aw.js');
}
