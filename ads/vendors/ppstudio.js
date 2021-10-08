import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ppstudio(global, data) {
  validateData(data, ['crid', 'width', 'height', 'holderScript'], []);

  global._ppstudio = {
    crid: data.crid,
    width: data.width,
    height: data.height,
    holderScript: data.holderScript,
  };

  const e = global.document.createElement('script');
  e.id = 'pps-script-' + data.crid;
  e.setAttribute('data-width', data.width);
  e.setAttribute('data-height', data.height);
  e.setAttribute('data-click-url', '');
  e.src = data.holderScript;
  global.document.getElementById('c').appendChild(e);

  const i = global.document.createElement('ins');
  i.classList.add('ppstudio');
  i.setAttribute('data-pps-target-id', 'cr-' + data.crid);
  global.document.getElementById('c').appendChild(i);

  loadScript(global, 'https://ads-cdn.tenmax.io/code/ppstudio.js', () => {
    global.context.renderStart();
  });
}
