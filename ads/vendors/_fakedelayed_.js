import {validateData, writeScript} from '#3p/3p';

import {setStyles} from '#core/dom/style';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function fakeDelayed(global, data) {
  validateData(data, ['src', 'bootstrapScript']);

  const iframe = global.document.createElement('iframe');
  iframe.setAttribute('id', 'creative');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('marginheight', '0');
  iframe.setAttribute('marginwidth', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('src', data['src']);
  setStyles(iframe, {
    border: '0 none transparent',
    position: 'relative',
    height: '100%',
    width: '100%',
  });
  global.document.getElementById('c').appendChild(iframe);

  writeScript(global, data['bootstrapScript']);
}
