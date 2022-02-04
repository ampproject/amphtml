import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function amoad(global, data) {
  validateData(data, ['sid'], ['adType']);

  let script;
  const attrs = {};
  if (data['adType'] === 'native') {
    script = 'https://j.amoad.com/js/n.js';
    attrs['class'] = 'amoad_native';
    attrs['data-sid'] = data.sid;
  } else {
    script = 'https://j.amoad.com/js/a.js';
    attrs['class'] = `amoad_frame sid_${data.sid} container_div sp`;
  }
  global.amoadOption = {ampData: data};

  const d = global.document.createElement('div');
  Object.keys(attrs).forEach((k) => {
    d.setAttribute(k, attrs[k]);
  });
  global.document.getElementById('c').appendChild(d);

  loadScript(global, script);
}
